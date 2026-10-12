package com.fashionerp.dev;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Developer Tooling REST Controller
 * Base path: /api/v1/dev
 * 
 * Provides live, database-driven persona switching and auto-login data.
 * Zero hardcoded seed data or dummy values.
 */
@RestController
@RequestMapping("/api/v1/dev")
@RequiredArgsConstructor
public class DevController {

    private final DevService devService;

    /**
     * GET /api/v1/dev/personas
     * Returns all active companies, branches, and staff personas from the database.
     */
    @GetMapping("/personas")
    public ResponseEntity<List<DevDto.CompanyPersonaResponse>> getDeveloperPersonas() {
        return ResponseEntity.ok(devService.getDeveloperPersonas());
    }
}
