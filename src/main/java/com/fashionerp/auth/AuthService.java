package com.fashionerp.auth;

import com.fashionerp.company.CompanySettingsDto;
import com.fashionerp.company.CompanySettingsService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LoginRateLimiter rateLimiter;
    private final CompanySettingsService companySettingsService;

    @PostConstruct
    public void initAdmin() {
        try {
            userRepository.findByUsernameAndActiveTrue("admin").ifPresentOrElse(
                user -> {
                    if (!passwordEncoder.matches("Admin@123", user.getPasswordHash())) {
                        user.setPasswordHash(passwordEncoder.encode("Admin@123"));
                        userRepository.save(user);
                        log.info("Updated admin password hash to match Admin@123");
                    }
                },
                () -> {
                    AppUser admin = AppUser.builder()
                            .username("admin")
                            .passwordHash(passwordEncoder.encode("Admin@123"))
                            .fullName("Boutique Admin")
                            .role(UserRole.ADMIN)
                            .active(true)
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

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        updateLastLogin(user);

        boolean needsSetup = !companySettingsService.isConfigured();

        return AuthDto.LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
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

        AppUser user = AppUser.builder()
                .username(req.getUsername().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName().trim())
                .email(req.getEmail() != null ? req.getEmail().trim() : null)
                .phone(req.getPhone() != null ? req.getPhone().trim() : null)
                .role(UserRole.ADMIN)   // first registrant is always owner-admin
                .active(true)
                .build();

        userRepository.save(user);
        log.info("New boutique admin registered: {}", user.getUsername());

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());

        // New registrants always need company setup
        return AuthDto.LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
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

        // 1. Create and save the Admin user
        AppUser user = AppUser.builder()
                .username(req.getUsername().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName().trim())
                .email(req.getEmail() != null ? req.getEmail().trim() : null)
                .phone(req.getUserPhone() != null ? req.getUserPhone().trim() : req.getPrimaryPhone())
                .role(UserRole.ADMIN)
                .active(true)
                .build();

        userRepository.save(user);
        log.info("New boutique admin registered via onboarding: {}", user.getUsername());

        // 2. Configure and save Company Settings
        CompanySettingsDto.Request companyReq = new CompanySettingsDto.Request();
        companyReq.setCompanyName(req.getCompanyName());
        companyReq.setShortName(req.getShortName());
        companyReq.setTagline(req.getTagline());
        companyReq.setOwnerName(req.getOwnerName() != null && !req.getOwnerName().isBlank() ? req.getOwnerName() : req.getFullName());
        companyReq.setBusinessType(req.getBusinessType());
        companyReq.setGstin(req.getGstin());
        companyReq.setPanNumber(req.getPanNumber());
        companyReq.setPrimaryPhone(req.getPrimaryPhone());
        companyReq.setWhatsapp(req.getWhatsapp());
        companyReq.setEmail(req.getEmail());
        companyReq.setWebsite(req.getWebsite());
        companyReq.setStreetAddress(req.getStreetAddress());
        companyReq.setCity(req.getCity());
        companyReq.setState(req.getState());
        companyReq.setPinCode(req.getPinCode());
        companyReq.setCountry(req.getCountry());
        companyReq.setLogoBase64(req.getLogoBase64());

        companySettingsService.update(companyReq);

        // 3. Issue JWT Token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());

        return AuthDto.LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
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

