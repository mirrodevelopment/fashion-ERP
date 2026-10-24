package com.fashionerp.auth;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "app_users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    /**
     * Stored password in database for developer quick-login and persona testing.
     */
    @Column(name = "dev_password", length = 255)
    private String devPassword;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserRole role = UserRole.CUSTOM;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(length = 150)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(length = 100)
    private String designation;

    @Column(length = 100)
    private String department;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "assigned_branch", length = 150)
    private String assignedBranch;

    /**
     * JSON array of branch codes or names the user may access.
     * e.g. ["BRN-001","BRN-002"] or ["siva 2","Flagship Atelier"]
     * NULL/empty means: apply default branch policy (assignedBranch).
     */
    @Column(name = "allowed_branches", columnDefinition = "TEXT")
    private String allowedBranches;

    /**
     * JSON array of module key strings the user may access.
     * e.g. ["dashboard","customers","orders","garments"]
     * NULL means: apply role-based defaults at login time (ADMIN = unrestricted).
     */
    @Column(name = "allowed_modules", columnDefinition = "TEXT")
    private String allowedModules;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "access_scope", length = 100)
    @Builder.Default
    private String accessScope = "Full System";

    @Column(name = "approval_limit", precision = 14, scale = 2)
    private java.math.BigDecimal approvalLimit;

    @Column(name = "access_health_score")
    private Integer accessHealthScore;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @Column(name = "risk_level", length = 20)
    @Builder.Default
    private String riskLevel = "LOW";

    @Column(name = "risk_notes", columnDefinition = "TEXT")
    @Builder.Default
    private String riskNotes = "No critical permission conflicts detected.";

    @Column(name = "authority_limits", columnDefinition = "TEXT")
    private String authorityLimits;

    @Column(name = "branch_access_details", columnDefinition = "TEXT")
    private String branchAccessDetails;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}

