package com.fashionerp.dev;

import com.fashionerp.auth.AuthDto;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Developer Tooling REST Controller
 * Base path: /api/v1/dev
 *
 * Provides live, database-driven persona switching and auto-login data.
 * Zero hardcoded seed data or dummy values. Fully dynamic.
 *
 * SECURITY: Only active when app.dev-tools.enabled=true (env: DEV_TOOLS_ENABLED=true).
 * NEVER enable in production.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/dev")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.dev-tools.enabled", havingValue = "true")
public class DevController {

    private final DevService devService;

    @PostConstruct
    public void warnIfEnabled() {
        log.warn("[SECURITY] Developer tooling endpoints are ACTIVE at /api/v1/dev/** — DISABLE in production (DEV_TOOLS_ENABLED=false)");
    }
    /**
     * GET /api/v1/dev/personas
     * Returns all active companies, branches, and staff personas from the database.
     */
    @GetMapping("/personas")
    public ResponseEntity<List<DevDto.CompanyPersonaResponse>> getDeveloperPersonas() {
        return ResponseEntity.ok(devService.getDeveloperPersonas());
    }

    /**
     * POST /api/v1/dev/login
     * Developer Mode Auto-Login:
     * Instantly signs in as any active database persona without requiring their password.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthDto.LoginResponse> devLogin(
            @RequestBody DevDto.DevLoginRequest req,
            HttpServletRequest request
    ) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = request.getRemoteAddr();
        }
        return ResponseEntity.ok(devService.devLogin(req, clientIp));
    }
}
