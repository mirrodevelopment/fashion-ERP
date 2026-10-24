package com.fashionerp.auth;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Data-Transfer Objects for User Management (Users & Roles page).
 *
 * No hardcoded display strings — all values are derived from AppUser entity fields,
 * real tenant entities, or the UserRole enum. The passwordHash field is never included.
 */
public class UserManagementDto {

    /**
     * Read-only projection of an AppUser returned by list / get endpoints.
     * Every field maps 1-to-1 to an app_users column or is derived dynamically.
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserSummary {
        private UUID id;
        private String username;
        private String fullName;
        private String email;
        private String phone;
        private String role;
        private Boolean active;
        private String designation;
        private String department;
        private String assignedBranch;
        private List<String> allowedBranches;
        private String avatarUrl;
        private List<String> allowedModules;
        private LocalDateTime lastLogin;

        // Enhanced governance & access intelligence fields
        private String accessScope;
        private BigDecimal approvalLimit;
        private String approvalLimitFormatted;
        private Integer accessHealthScore;
        private String status;
        private LocalDateTime lastActiveAt;
        private String lastActiveFormatted;
        private String riskLevel;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    /**
     * Comprehensive governance intelligence for selected user detail panel.
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserDetail {
        private UserSummary summary;
        private String phone;
        private String email;
        private LocalDateTime joinedDate;
        private String joinedDateFormatted;

        private List<String> permissionsAllowed;
        private List<String> permissionsDenied;
        private List<String> allowedModules;

        private String riskLevel;
        private String riskNotes;

        private AuthorityLimitsDto authorityLimits;
        private List<BranchAccessScopeDto> branchAccessScopes;
        private List<DelegationDto> delegations;
        private List<AccessLogDto> recentActivities;
        private List<ActiveSessionDto> activeSessions;
    }

    /**
     * Dynamic tenant-scoped KPI Statistics.
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class KpiStats {
        private long totalUsers;
        private String totalUsersTrend;
        private long activeUsers;
        private String activeUsersTrend;
        private long pendingInvites;
        private String pendingInvitesTrend;
        private long adminLevel;
        private String adminLevelTrend;
        private long elevatedAccess;
        private String elevatedAccessTrend;
        private long accessReviewDue;
        private String accessReviewDueTrend;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthorityLimitsDto {
        private Integer discountApprovalPercent;
        private BigDecimal refundApproval;
        private String refundApprovalFormatted;
        private BigDecimal purchaseOrderApproval;
        private String purchaseOrderApprovalFormatted;
        private BigDecimal stockAdjustment;
        private String stockAdjustmentFormatted;
        private String orderCancellation;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BranchAccessScopeDto {
        private String branchName;
        private String branchCode;
        private String accessLevel; // "Full Access", "View Only", "Production Access", "Inventory Access", "No Access"
        private String badgeType;   // "success", "info", "warning", "accent", "danger"
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DelegationDto {
        private UUID id;
        private String title;
        private LocalDateTime validUntil;
        private String validUntilFormatted;
        private Integer expiresInDays;
        private String grantedBy;
        private String description;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AccessLogDto {
        private UUID id;
        private UUID userId;
        private String userName;
        private String userEmail;
        private String userRole;
        private String actionType;
        private String description;
        private String location;
        private String clientInfo;
        private LocalDateTime createdAt;
        private String timeFormatted;
        private String severity; // "INFO", "WARNING", "CRITICAL"
        private boolean isRecent;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AccessLogStats {
        private long totalEvents;
        private long loginsToday;
        private long elevatedEvents;
        private long securityAlerts;
        private long activeLocationsCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateAccessLogRequest {
        private String actionType;
        private String description;
        private String location;
        private String clientInfo;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AccessLogPageResponse {
        private List<AccessLogDto> items;
        private long totalElements;
        private int totalPages;
        private int currentPage;
        private int pageSize;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ActiveSessionDto {
        private UUID id;
        private String device;
        private String location;
        private LocalDateTime lastSeenAt;
        private String lastSeenFormatted;
        private Boolean isCurrent;
    }

    /**
     * Request body for POST /api/v1/users (create new user).
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateUserRequest {
        private String username;
        private String fullName;
        private String password;
        private String role;
        private String email;
        private String phone;
        private String designation;
        private String department;
        private String assignedBranch;
        private List<String> allowedBranches;
        private List<String> allowedModules;
        private String accessScope;
        private BigDecimal approvalLimit;
        private String avatarUrl;
        private String status;
        private String riskLevel;
    }

    /**
     * Request body for PUT /api/v1/users/{id} (update existing user).
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateUserRequest {
        private String fullName;
        private String password;
        private String role;
        private String email;
        private String phone;
        private String designation;
        private String department;
        private String assignedBranch;
        private List<String> allowedBranches;
        private List<String> allowedModules;
        private String accessScope;
        private BigDecimal approvalLimit;
        private String avatarUrl;
        private String status;
        private String riskLevel;
    }

    /**
     * Role information and capabilities returned by GET /api/v1/users/roles.
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RoleInfo {
        private String name;
        private String displayName;
        private String description;
        private List<String> capabilities;
        private boolean isSystemDefault;
        private boolean isCustom;
    }

    /**
     * ERP module registry entry returned by GET /api/v1/users/modules.
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
