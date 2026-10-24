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
    private final AppUserRepository userRepository;

    /**
     * GET /api/v1/users
     * Returns filtered list of all users. Accessible to any authenticated user.
     *
     * @param search       Optional text search (username, fullName, email, designation)
     * @param role         Optional role filter — matches UserRole enum name
     * @param active       Optional active status filter (true / false)
     * @param tab          Optional tab filter ('ALL', 'ROLES', 'REQUESTS', 'SUSPENDED')
     * @param branch       Optional branch filter
     * @param status       Optional status filter ('ACTIVE', 'REVIEW', 'SUSPENDED', 'INVITED')
     * @param scope        Optional access scope filter
     */
    @GetMapping
    public ResponseEntity<List<UserManagementDto.UserSummary>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String tab,
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String scope
    ) {
        return ResponseEntity.ok(userManagementService.listUsers(search, role, active, tab, branch, status, scope));
    }

    /**
     * GET /api/v1/users/stats
     * Returns dynamic tenant-scoped KPI Statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<UserManagementDto.KpiStats> getStats() {
        return ResponseEntity.ok(userManagementService.getKpiStats());
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
     * GET /api/v1/users/access-logs
     * Returns paginated, searchable access and audit logs for the company.
     */
    @GetMapping("/access-logs")
    public ResponseEntity<UserManagementDto.AccessLogPageResponse> listAccessLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(userManagementService.listAccessLogs(page, size, actionType, userId, search));
    }

    /**
     * GET /api/v1/users/access-logs/stats
     * Returns aggregate metrics for the Recent Access audit dashboard.
     */
    @GetMapping("/access-logs/stats")
    public ResponseEntity<UserManagementDto.AccessLogStats> getAccessLogStats() {
        return ResponseEntity.ok(userManagementService.getAccessLogStats());
    }

    /**
     * POST /api/v1/users/access-logs
     * Records a security access event for audit trace.
     */
    @PostMapping("/access-logs")
    public ResponseEntity<Void> recordAccessLog(
            Authentication auth,
            @RequestBody UserManagementDto.CreateAccessLogRequest req
    ) {
        UUID currentUserId = null;
        if (auth != null && auth.getName() != null) {
            java.util.Optional<AppUser> userOpt = userRepository.findByUsernameAndActiveTrue(auth.getName());
            if (userOpt.isPresent()) {
                currentUserId = userOpt.get().getId();
            }
        }
        userManagementService.recordAccessLog(
                currentUserId,
                req.getActionType(),
                req.getDescription(),
                req.getLocation(),
                req.getClientInfo()
        );
        return ResponseEntity.status(HttpStatus.CREATED).build();
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
     * GET /api/v1/users/{id}/detail
     * Returns comprehensive governance intelligence and permissions detail.
     */
    @GetMapping("/{id}/detail")
    public ResponseEntity<UserManagementDto.UserDetail> getUserDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(userManagementService.getUserDetail(id));
    }

    /**
     * POST /api/v1/users
     * Creates a new user. ADMIN only.
     */
    @PostMapping
    public ResponseEntity<UserManagementDto.UserSummary> createUser(
            @RequestBody UserManagementDto.CreateUserRequest req
    ) {
        requireManagementAccess();
        UserManagementDto.UserSummary created = userManagementService.createUser(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/v1/users/{id}
     * Updates an existing user. Company Owner, Admin, or Branch Admin.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserManagementDto.UserSummary> updateUser(
            @PathVariable UUID id,
            @RequestBody UserManagementDto.UpdateUserRequest req
    ) {
        requireManagementAccess();
        return ResponseEntity.ok(userManagementService.updateUser(id, req));
    }

    /**
     * PATCH /api/v1/users/{id}/toggle-active
     * Activates or deactivates a user. Company Owner, Admin, or Branch Admin.
     * Guarded by service-layer last-admin check and branch domain boundaries.
     */
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<UserManagementDto.UserSummary> toggleActive(@PathVariable UUID id) {
        requireManagementAccess();
        return ResponseEntity.ok(userManagementService.toggleActive(id));
    }

    /**
     * POST /api/v1/users/activate-all
     * Activates all users within the company/system.
     */
    @PostMapping("/activate-all")
    public ResponseEntity<java.util.Map<String, Object>> activateAll() {
        requireManagementAccess();
        int count = userManagementService.activateAllUsers();
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("activatedCount", count);
        response.put("message", "All users are now active.");
        return ResponseEntity.ok(response);
    }

    // ─── Private Helpers ───────────────────────────────────────────────────

    /**
     * Verifies the calling user holds an administrative role (OWNER, ADMIN, or BRANCH_ADMIN).
     * Domain boundaries and fine-grained scoping are enforced inside UserManagementService.
     * Throws AccessDeniedException (→ 403) if unauthorized.
     */
    private void requireManagementAccess() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required.");
        }
        boolean hasAccess = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + UserRole.OWNER.name())
                            || a.getAuthority().equals("ROLE_" + UserRole.ADMIN.name())
                            || a.getAuthority().equals("ROLE_" + UserRole.BRANCH_ADMIN.name()));
        if (!hasAccess) {
            throw new AccessDeniedException("Administrative access required.");
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
