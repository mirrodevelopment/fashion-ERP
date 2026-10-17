package com.fashionerp.workforce;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "employee_code", nullable = false, length = 20)
    private String employeeCode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(nullable = false, length = 30)
    private String role;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "joined_date")
    private LocalDate joinedDate;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(length = 200)
    private String specialization;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // --- Workforce Department & Performance Metrics (V10) ---

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String department = "General";

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal salary = BigDecimal.ZERO;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String branch = "Main Branch";

    @Column(nullable = false)
    @Builder.Default
    private Integer workload = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer efficiency = 95;

    @Column(name = "completed_month", nullable = false)
    @Builder.Default
    private Integer completedMonth = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void assignTenant() {
        if (this.companyId == null) {
            this.companyId = com.fashionerp.common.TenantContext.getCompanyId();
        }
        if (this.branch == null || this.branch.isBlank()) {
            String b = com.fashionerp.common.TenantContext.getAssignedBranch();
            this.branch = (b != null && !b.isBlank() && !"ALL".equalsIgnoreCase(b.trim())) ? b.trim() : "Main Branch";
        }
    }
}
