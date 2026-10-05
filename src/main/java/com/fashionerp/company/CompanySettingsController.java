package com.fashionerp.company;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/company")
@RequiredArgsConstructor
public class CompanySettingsController {

    private final CompanySettingsService service;

    /**
     * GET /api/v1/company
     * Returns the singleton company settings (used by nav.js on every page load).
     */
    @GetMapping
    public ResponseEntity<CompanySettingsDto.Response> get() {
        return ResponseEntity.ok(service.get());
    }

    /**
     * GET /api/v1/company/status
     * Public endpoint. Returns {"configured": true/false}.
     * Frontend uses this after login/register to decide whether to redirect
     * to the onboarding setup wizard or straight to the dashboard.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> status() {
        return ResponseEntity.ok(Map.of("configured", service.isConfigured()));
    }

    /**
     * PUT /api/v1/company
     * Updates the singleton company settings from the Company Details page.
     * Restricted to ADMIN role.
     */
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanySettingsDto.Response> update(
            @RequestBody CompanySettingsDto.Request request) {
        return ResponseEntity.ok(service.update(request));
    }
}
