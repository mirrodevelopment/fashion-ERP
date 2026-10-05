package com.fashionerp.auth;

import com.fashionerp.company.CompanySettings;
import com.fashionerp.company.CompanySettingsRepository;
import com.fashionerp.company.CompanySettingsService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LoginRateLimiter rateLimiter;
    private final CompanySettingsService companySettingsService;
    private final CompanySettingsRepository companySettingsRepository;

    @PostConstruct
    public void initAdmin() {
        try {
            CompanySettings defaultCompany = companySettingsRepository.findFirstByOrderByCreatedAtAsc().orElse(null);
            UUID companyId = defaultCompany != null ? defaultCompany.getId() : null;

            userRepository.findByUsernameAndActiveTrue("admin").ifPresentOrElse(
                user -> {
                    boolean changed = false;
                    if (!passwordEncoder.matches("Admin@123", user.getPasswordHash())) {
                        user.setPasswordHash(passwordEncoder.encode("Admin@123"));
                        changed = true;
                    }
                    if (user.getCompanyId() == null && companyId != null) {
                        user.setCompanyId(companyId);
                        changed = true;
                    }
                    if (changed) {
                        userRepository.save(user);
                        log.info("Updated admin user credentials and company association");
                    }
                },
                () -> {
                    AppUser admin = AppUser.builder()
                            .username("admin")
                            .passwordHash(passwordEncoder.encode("Admin@123"))
                            .fullName("Boutique Admin")
                            .role(UserRole.ADMIN)
                            .active(true)
                            .companyId(companyId)
                            .build();
                    userRepository.save(admin);
                    log.info("Created default admin user with username 'admin'");
                }
            );
        } catch (Exception e) {
            log.error("Error initializing admin user: {}", e.getMessage());
        }
    }

    // ── Login ──────────────────────────────────────────────────────────────

    public AuthDto.LoginResponse login(AuthDto.LoginRequest req) {
        return login(req, null);
    }

    public AuthDto.LoginResponse login(AuthDto.LoginRequest req, String clientIp) {
        String rateLimitKey = (clientIp != null ? clientIp : "unknown") + ":" + (req != null && req.getUsername() != null ? req.getUsername() : "anonymous");
        rateLimiter.checkBlocked(rateLimitKey);
        if (clientIp != null) {
            rateLimiter.checkBlocked(clientIp);
        }

        AppUser user = (req != null && req.getUsername() != null)
                ? userRepository.findByUsernameAndActiveTrue(req.getUsername()).orElse(null)
                : null;

        if (req == null || user == null || req.getPassword() == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            rateLimiter.recordFailedAttempt(rateLimitKey);
            if (clientIp != null) {
                rateLimiter.recordFailedAttempt(clientIp);
            }
            throw new IllegalArgumentException("Invalid username or password");
        }

        rateLimiter.recordSuccess(rateLimitKey);
        if (clientIp != null) {
            rateLimiter.recordSuccess(clientIp);
        }

        UUID companyId = user.getCompanyId();
        String companyName = null;
        if (companyId != null) {
            CompanySettings comp = companySettingsRepository.findById(companyId).orElse(null);
            if (comp != null) {
                companyName = comp.getCompanyName();
            }
        } else {
            var defaultComp = companySettingsRepository.findFirstByOrderByCreatedAtAsc().orElse(null);
            if (defaultComp != null) {
                companyId = defaultComp.getId();
                companyName = defaultComp.getCompanyName();
                user.setCompanyId(companyId);
                userRepository.save(user);
            }
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name(), companyId, companyName);
        updateLastLogin(user);

        boolean needsSetup = !companySettingsService.isConfigured();

        return AuthDto.LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .companyId(companyId)
                .companyName(companyName)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .needsCompanySetup(needsSetup)
                .build();
    }

    // ── Register ───────────────────────────────────────────────────────────

    /**
     * Creates a new boutique admin account.
     * The first person to register on a fresh installation becomes the ADMIN owner.
     * Returns a LoginResponse with a JWT so the frontend can auto-login immediately.
     */
    @Transactional
    public AuthDto.LoginResponse register(AuthDto.RegisterRequest req) {
        if (req == null || req.getUsername() == null || req.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (req.getPassword() == null || req.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }
        if (req.getFullName() == null || req.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        if (userRepository.existsByUsername(req.getUsername().trim().toLowerCase())) {
            throw new IllegalStateException("This username is already taken. Please choose another.");
        }

        CompanySettings company = CompanySettings.builder()
                .companyName(req.getFullName().trim() + "'s Boutique")
                .ownerName(req.getFullName().trim())
                .email(req.getEmail() != null ? req.getEmail().trim() : null)
                .primaryPhone(req.getPhone() != null ? req.getPhone().trim() : null)
                .businessType("Bespoke Atelier")
                .country("India")
                .build();
        company = companySettingsRepository.save(company);

        AppUser user = AppUser.builder()
                .username(req.getUsername().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName().trim())
                .email(req.getEmail() != null ? req.getEmail().trim() : null)
                .phone(req.getPhone() != null ? req.getPhone().trim() : null)
                .role(UserRole.ADMIN)   // first registrant is always owner-admin
                .active(true)
                .companyId(company.getId())
                .build();

        userRepository.save(user);
        log.info("New boutique admin registered: {}", user.getUsername());

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name(), company.getId(), company.getCompanyName());

        // New registrants always need company setup
        return AuthDto.LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .companyId(company.getId())
                .companyName(company.getCompanyName())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .needsCompanySetup(true)
                .build();
    }

    /**
     * Atomically creates the boutique administrator account and sets up the company profile.
     * Called at the end of the onboarding setup wizard.
     */
    @Transactional
    public AuthDto.LoginResponse onboard(AuthDto.OnboardRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Onboarding request cannot be empty.");
        }
        if (req.getUsername() == null || req.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (req.getPassword() == null || req.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }
        if (req.getFullName() == null || req.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        if (req.getCompanyName() == null || req.getCompanyName().isBlank()) {
            throw new IllegalArgumentException("Business name is required.");
        }
        if (userRepository.existsByUsername(req.getUsername().trim().toLowerCase())) {
            throw new IllegalStateException("This username is already taken. Please choose another.");
        }

        // 1. Configure and save Company Settings
        CompanySettings company = CompanySettings.builder()
                .companyName(req.getCompanyName().trim())
                .shortName(req.getShortName() != null ? req.getShortName().trim() : null)
                .tagline(req.getTagline())
                .ownerName(req.getOwnerName() != null && !req.getOwnerName().isBlank() ? req.getOwnerName() : req.getFullName())
                .businessType(req.getBusinessType() != null && !req.getBusinessType().isBlank() ? req.getBusinessType() : "Bespoke Atelier")
                .gstin(req.getGstin())
                .panNumber(req.getPanNumber())
                .primaryPhone(req.getPrimaryPhone())
                .whatsapp(req.getWhatsapp())
                .email(req.getEmail())
                .website(req.getWebsite())
                .streetAddress(req.getStreetAddress())
                .city(req.getCity())
                .state(req.getState())
                .pinCode(req.getPinCode())
                .country(req.getCountry() != null && !req.getCountry().isBlank() ? req.getCountry() : "India")
                .logoBase64(req.getLogoBase64())
                .build();

        company = companySettingsRepository.save(company);

        // 2. Create and save the Admin user
        AppUser user = AppUser.builder()
                .username(req.getUsername().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName().trim())
                .email(req.getEmail() != null ? req.getEmail().trim() : null)
                .phone(req.getUserPhone() != null ? req.getUserPhone().trim() : req.getPrimaryPhone())
                .role(UserRole.ADMIN)
                .active(true)
                .companyId(company.getId())
                .build();

        userRepository.save(user);
        log.info("New boutique admin registered via onboarding: {}", user.getUsername());

        // 3. Issue JWT Token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name(), company.getId(), company.getCompanyName());

        return AuthDto.LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .companyId(company.getId())
                .companyName(company.getCompanyName())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .needsCompanySetup(false)
                .build();
    }

    @Transactional
    protected void updateLastLogin(AppUser user) {
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    }
}

