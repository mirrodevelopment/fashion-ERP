package com.fashionerp.profile;

import com.fashionerp.auth.AppUser;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "display_title", length = 150)
    private String displayTitle;

    @Column(name = "department", length = 150)
    private String department;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "assigned_branch", length = 150)
    private String assignedBranch;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "clearance_level", length = 50)
    private String clearanceLevel;

    @Column(name = "system_role_label", length = 100)
    private String systemRoleLabel;

    @Column(name = "privileges_summary", length = 100)
    private String privilegesSummary;

    @Column(name = "member_since", length = 50)
    private String memberSince;

    @Column(name = "tenure_tier", length = 100)
    private String tenureTier;

    @Column(name = "security_status", length = 100)
    private String securityStatus;

    @Column(name = "session_lifetime", length = 100)
    private String sessionLifetime;

    @Column(name = "emergency_contact", length = 100)
    private String emergencyContact;

    @Column(name = "work_shift", length = 100)
    private String workShift;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
