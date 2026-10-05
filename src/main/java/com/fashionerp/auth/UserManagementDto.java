package com.fashionerp.auth;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Data-Transfer Objects for User Management (Users & Roles page).
 *
 * No hardcoded display strings — all values are derived from AppUser entity fields
 * or the UserRole enum. The passwordHash field is never included in any response DTO.
 */
public class UserManagementDto {

    /**
     * Read-only projection of an AppUser returned by list / get endpoints.
     * Every field maps 1-to-1 to an app_users column or is derived from the UserRole enum.
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserSummary {
        /** app_users.id */
        private UUID id;
        /** app_users.username */
        private String username;
        /** app_users.full_name (falls back to username if null) */
        private String fullName;
        /** app_users.email */
        private String email;
        /** app_users.phone */
        private String phone;
        /** UserRole enum name — e.g. "ADMIN", "STAFF", "RECEPTIONIST" */
        private String role;
        /** app_users.active */
        private Boolean active;
        /** app_users.designation */
        private String designation;
        /** app_users.department */
        private String department;
        /** app_users.assigned_branch */
        private String assignedBranch;
        /** app_users.avatar_url */
        private String avatarUrl;
        /** app_users.allowed_modules parsed as List of module keys */
        private List<String> allowedModules;
        /** app_users.last_login — null if user has never logged in */
        private LocalDateTime lastLogin;
        /** app_users.created_at */
        private LocalDateTime createdAt;
        /** app_users.updated_at */
        private LocalDateTime updatedAt;
    }

    /**
     * Request body for POST /api/v1/users (create new user).
     * Password is required on creation and validated in the service layer.
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateUserRequest {
        /** Must be unique and non-blank */
        private String username;
        private String fullName;
        /** Must be non-blank, minimum 6 characters — validated in service */
        private String password;
        /**
         * Must match a valid UserRole enum name (ADMIN, STAFF, RECEPTIONIST).
         * Parsed with UserRole.valueOf() in the service — invalid values throw IllegalArgumentException.
         */
        private String role;
        private String email;
        private String phone;
        private String designation;
        private String department;
        private String assignedBranch;
        /** List of module keys the user is allowed to access. Null = apply role defaults. */
        private List<String> allowedModules;
    }

    /**
     * Request body for PUT /api/v1/users/{id} (update existing user).
     * Username is not updatable. Password is optional — null means "do not change".
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateUserRequest {
        private String fullName;
        /**
         * Optional — null or blank means "do not change the password".
         * If non-blank, minimum 6 characters enforced in service.
         */
        private String password;
        /**
         * Optional — must match a valid UserRole enum name if provided.
         * Parsed with UserRole.valueOf() in the service.
         */
        private String role;
        private String email;
        private String phone;
        private String designation;
        private String department;
        private String assignedBranch;
        /** Optional list of module keys the user is allowed to access. */
        private List<String> allowedModules;
    }

    /**
     * Role information and capabilities returned by GET /api/v1/users/roles.
     * Prevents any hardcoding on frontend clients.
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RoleInfo {
        private String name;
        private String displayName;
        private String description;
        private List<String> capabilities;
    }

    /**
     * ERP module registry entry returned by GET /api/v1/users/modules.
     * Prevents hardcoding module names and icons on frontend clients.
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ModuleInfo {
        private String key;
        private String label;
        private String section;
        private String icon;
        private boolean available;
    }
}
