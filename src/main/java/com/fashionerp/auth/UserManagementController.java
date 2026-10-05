package com.fashionerp.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for the Users & Roles management page.
 * Base path: /api/v1/users
 *
 * All mutating endpoints (POST, PUT, PATCH) are restricted to users whose
 * JWT-embedded role matches the ADMIN enum constant — no raw string comparison.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;

    /**
     * GET /api/v1/users
     * Returns filtered list of all users. Accessible to any authenticated user.
     *
     * @param search       Optional text search (username, fullName, email)
     * @param role         Optional role filter — must match UserRole enum name
     * @param active       Optional active status filter (true / false)
     */
    @GetMapping
    public ResponseEntity<List<UserManagementDto.UserSummary>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active
    ) {
        return ResponseEntity.ok(userManagementService.listUsers(search, role, active));
    }

    /**
     * GET /api/v1/users/roles
     * Returns list of available system roles and metadata. Accessible to any authenticated user.
     */
    @GetMapping("/roles")
    public ResponseEntity<List<UserManagementDto.RoleInfo>> listRoles() {
        return ResponseEntity.ok(userManagementService.getAvailableRoles());
    }

    /**
     * GET /api/v1/users/modules
     * Returns ERP module registry for dynamic tile rendering. Accessible to any authenticated user.
     */
    @GetMapping("/modules")
    public ResponseEntity<List<UserManagementDto.ModuleInfo>> listModules() {
        return ResponseEntity.ok(userManagementService.getModuleRegistry());
    }

    /**
     * GET /api/v1/users/{id}
     * Returns a single user by UUID. Accessible to any authenticated user.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserManagementDto.UserSummary> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userManagementService.getUser(id));
    }

    /**
     * POST /api/v1/users
     * Creates a new user. ADMIN only.
     */
    @PostMapping
    public ResponseEntity<UserManagementDto.UserSummary> createUser(
            @RequestBody UserManagementDto.CreateUserRequest req
    ) {
        requireAdmin();
        UserManagementDto.UserSummary created = userManagementService.createUser(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/v1/users/{id}
     * Updates an existing user. ADMIN only.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserManagementDto.UserSummary> updateUser(
            @PathVariable UUID id,
            @RequestBody UserManagementDto.UpdateUserRequest req
    ) {
        requireAdmin();
        return ResponseEntity.ok(userManagementService.updateUser(id, req));
    }

    /**
     * PATCH /api/v1/users/{id}/toggle-active
     * Activates or deactivates a user. ADMIN only.
     * Guarded by service-layer last-admin check.
     */
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<UserManagementDto.UserSummary> toggleActive(@PathVariable UUID id) {
        requireAdmin();
        return ResponseEntity.ok(userManagementService.toggleActive(id));
    }

    // ─── Private Helpers ───────────────────────────────────────────────────

    /**
     * Verifies the calling user holds the ADMIN role.
     * Role is compared against the UserRole enum constant name — no raw string.
     * Throws AccessDeniedException (→ 403) if not admin.
     */
    private void requireAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required.");
        }
        String requiredAuthority = "ROLE_" + UserRole.ADMIN.name();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(requiredAuthority));
        if (!isAdmin) {
            throw new AccessDeniedException("Admin access required.");
        }
    }

    /**
     * Global exception handler for this controller — converts service-layer
     * IllegalArgumentException into meaningful HTTP responses.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(ex.getMessage()));
    }

    /** Simple error payload — message comes from the exception, not a hardcoded string. */
    public record ErrorResponse(String message) {}
}
