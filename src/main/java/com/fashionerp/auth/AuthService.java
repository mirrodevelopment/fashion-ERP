package com.fashionerp.auth;

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

        if (user == null || req.getPassword() == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
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

        // Update last login
        updateLastLogin(user);

        return AuthDto.LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
    }

    @Transactional
    protected void updateLastLogin(AppUser user) {
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    }
}
