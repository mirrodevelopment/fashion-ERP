package com.fashionerp.auth;

import com.fashionerp.company.CompanySettings;
import com.fashionerp.company.CompanySettingsRepository;
import com.fashionerp.company.CompanySettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Core authentication service handling login, registration, and tenant lookup.
 * Backed by live database settings and JWT security.
 */
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
    private final UserAccessLogRepository accessLogRepository;
    private final UserActiveSessionRepository activeSessionRepository;

    // ── Company Lookup (multi-step login Step 1) ───────────────────────────

    /**
     * Checks whether a company with the given name exists in this installation.
     * Called by the login page Step 1 before asking for username/password.
     * No authentication required — only reveals if the name exists.
     */
    public AuthDto.CompanyLookupResponse lookupCompany(String name) {
        if (name == null || name.isBlank()) {
            return AuthDto.CompanyLookupResponse.builder().found(false).build();
        }
        return companySettingsRepository.findByCompanyNameIgnoreCase(name.trim())
            .map(c -> AuthDto.CompanyLookupResponse.builder()
                    .found(true)
                    .companyId(c.getId())
                    .companyName(c.getCompanyName())
                    .shortName(c.getShortName())
                    .build())
            .orElseGet(() -> AuthDto.CompanyLookupResponse.builder().found(false).build());
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
        }
        if (companyId == null || companyName == null) {
            CompanySettings defaultComp = companySettingsService.getOrCreateDefault(companyId);
            companyId = defaultComp.getId();
            companyName = defaultComp.getCompanyName();
            user.setCompanyId(companyId);
            userRepository.save(user);
        }

        java.util.List<String> userAllowedBranches = UserManagementService.resolveAllowedBranches(user);
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name(), companyId, companyName, user.getAssignedBranch(), userAllowedBranches);
        updateLastLogin(user);

        if (companyId != null && accessLogRepository != null) {
            try {
                accessLogRepository.save(UserAccessLog.builder()
                        .companyId(companyId)
                        .userId(user.getId())
                        .actionType("LOGIN")
                        .description("Logged into workspace (" + (user.getRole() != null ? user.getRole().name() : "USER") + ")")
                        .location(user.getAssignedBranch() != null ? user.getAssignedBranch() : (clientIp != null ? clientIp : "Primary Terminal"))
                        .clientInfo(clientIp != null ? "IP: " + clientIp : "Web Client")
                        .createdAt(LocalDateTime.now())
                        .build());
            } catch (Exception ignored) {}
        }

        if (companyId != null && activeSessionRepository != null) {
            try {
                activeSessionRepository.save(UserActiveSession.builder()
                        .companyId(companyId)
                        .userId(user.getId())
                        .device(clientIp != null ? "Web Browser (" + clientIp + ")" : "Desktop Client")
                        .location(user.getAssignedBranch() != null ? user.getAssignedBranch() : "Main Studio")
                        .lastSeenAt(LocalDateTime.now())
                        .isCurrent(true)
                        .build());
            } catch (Exception ignored) {}
        }

        // Active existing user logging into their workspace does not need to redo the onboarding wizard
        boolean needsSetup = false;

        return AuthDto.LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .assignedBranch(user.getAssignedBranch())
                .allowedBranches(userAllowedBranches)
                .companyId(companyId)
                .companyName(companyName)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .needsCompanySetup(needsSetup)
                .build();
    }

    /**
     * Developer Mode Auto-Login:
     * Directly authenticates any active user persona from the database
     * without requiring knowledge of their password.
     */
    public AuthDto.LoginResponse devLogin(String username, UUID preferredCompanyId, String clientIp) {
        String rateLimitKey = "dev:" + (clientIp != null ? clientIp : "unknown") + ":" + (username != null ? username : "anonymous");
        rateLimiter.checkBlocked(rateLimitKey);
        if (clientIp != null) {
            rateLimiter.checkBlocked(clientIp);
        }

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required for developer auto-login.");
        }
        AppUser user = userRepository.findByUsernameAndActiveTrue(username.trim())
                .orElseThrow(() -> {
                    rateLimiter.recordFailedAttempt(rateLimitKey);
                    if (clientIp != null) {
                        rateLimiter.recordFailedAttempt(clientIp);
                    }
                    return new IllegalArgumentException("Active user not found in database: " + username);
                });

        rateLimiter.recordSuccess(rateLimitKey);
        if (clientIp != null) {
            rateLimiter.recordSuccess(clientIp);
        }

        UUID companyId = user.getCompanyId() != null ? user.getCompanyId() : preferredCompanyId;
        String companyName = null;
        if (companyId != null) {
            CompanySettings comp = companySettingsRepository.findById(companyId).orElse(null);
            if (comp != null) {
                companyName = comp.getCompanyName();
            }
        }
        if (companyId == null || companyName == null) {
            CompanySettings defaultComp = companySettingsService.getOrCreateDefault(companyId);
            companyId = defaultComp.getId();
            companyName = defaultComp.getCompanyName();
            user.setCompanyId(companyId);
            userRepository.save(user);
        }

        java.util.List<String> userAllowedBranches = UserManagementService.resolveAllowedBranches(user);
        String token = jwtUtil.generateToken(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                companyId,
                companyName,
                user.getAssignedBranch(),
                userAllowedBranches
        );
        updateLastLogin(user);

        if (companyId != null && accessLogRepository != null) {
            try {
                accessLogRepository.save(UserAccessLog.builder()
                        .companyId(companyId)
                        .userId(user.getId())
                        .actionType("DEV_QUICK_LOGIN")
                        .description("Developer auto-login (" + (user.getRole() != null ? user.getRole().name() : "USER") + ")")
                        .location(user.getAssignedBranch() != null ? user.getAssignedBranch() : (clientIp != null ? clientIp : "Primary Terminal"))
                        .clientInfo(clientIp != null ? "IP: " + clientIp : "Developer Quick-Login")
                        .createdAt(LocalDateTime.now())
                        .build());
            } catch (Exception ignored) {}
        }

        if (companyId != null && activeSessionRepository != null) {
            try {
                activeSessionRepository.save(UserActiveSession.builder()
                        .companyId(companyId)
                        .userId(user.getId())
                        .device(clientIp != null ? "Developer Persona (" + clientIp + ")" : "Dev Console")
                        .location(user.getAssignedBranch() != null ? user.getAssignedBranch() : "Development Environment")
                        .lastSeenAt(LocalDateTime.now())
                        .isCurrent(true)
                        .build());
            } catch (Exception ignored) {}
        }

        return AuthDto.LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .assignedBranch(user.getAssignedBranch())
                .allowedBranches(userAllowedBranches)
                .companyId(companyId)
                .companyName(companyName)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .needsCompanySetup(false)
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
                .role(UserRole.OWNER)   // First registrant is the Company Owner
                .active(true)
                .companyId(company.getId())
                .build();

        userRepository.save(user);
        log.info("New boutique admin registered: {}", user.getUsername());

        java.util.List<String> userAllowedBranches = UserManagementService.resolveAllowedBranches(user);
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name(), company.getId(), company.getCompanyName(), user.getAssignedBranch(), userAllowedBranches);

        // New registrants always need company setup
        return AuthDto.LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .assignedBranch(user.getAssignedBranch())
                .allowedBranches(userAllowedBranches)
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
                .role(UserRole.OWNER)   // Onboarded boutique owner is the Company Owner
                .active(true)
                .companyId(company.getId())
                .build();

        userRepository.save(user);
        log.info("New boutique admin registered via onboarding: {}", user.getUsername());

        // 3. Issue JWT Token
        java.util.List<String> userAllowedBranches = UserManagementService.resolveAllowedBranches(user);
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name(), company.getId(), company.getCompanyName(), user.getAssignedBranch(), userAllowedBranches);

        return AuthDto.LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .assignedBranch(user.getAssignedBranch())
                .allowedBranches(userAllowedBranches)
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

