package com.fashionerp.auth;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserManagementService userManagementService;
    private final AppUserRepository userRepository;

    /** POST /api/v1/auth/login */
    @PostMapping("/login")
    public ResponseEntity<AuthDto.LoginResponse> login(
            @RequestBody AuthDto.LoginRequest req,
            HttpServletRequest request
    ) {
        String clientIp = getClientIp(request);
        return ResponseEntity.ok(authService.login(req, clientIp));
    }

    /** POST /api/v1/auth/register — public, creates the first boutique admin */
    @PostMapping("/register")
    public ResponseEntity<AuthDto.LoginResponse> register(
            @RequestBody AuthDto.RegisterRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(req));
    }

    /** POST /api/v1/auth/onboard — public, creates boutique admin and company settings together */
    @PostMapping("/onboard")
    public ResponseEntity<AuthDto.LoginResponse> onboard(
            @RequestBody AuthDto.OnboardRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.onboard(req));
    }

    /**
     * GET /api/v1/auth/me
     * Returns the profile and allowed modules for the currently authenticated user.
     * Used by fragments.js to enforce sidebar filtering and client-side page gating.
     */
    @GetMapping("/me")
    public ResponseEntity<UserManagementDto.UserSummary> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = auth.getName();
        AppUser user = userRepository.findByUsernameAndActiveTrue(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return ResponseEntity.ok(userManagementService.getUser(user.getId()));
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
