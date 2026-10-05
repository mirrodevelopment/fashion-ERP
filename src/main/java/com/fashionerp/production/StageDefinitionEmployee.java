package com.fashionerp.production;

import com.fashionerp.workforce.Employee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Junction entity linking a StageDefinition to a specific Employee.
 * Used for pinning particular employees to a stage (e.g. as the default specialist).
 * Role-based filtering (STAGE_DEPARTMENT_MAP) still works independently.
 */
@Entity
@Table(
    name = "stage_definition_employees",
    uniqueConstraints = @UniqueConstraint(columnNames = {"stage_def_id", "employee_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StageDefinitionEmployee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "stage_def_id", nullable = false)
    private StageDefinition stageDef;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /**
     * AVAILABLE  — employee can be assigned to this stage
     * DEFAULT    — pre-selected in the assignment dropdown
     */
    @Column(name = "assignment_type", nullable = false, length = 30)
    @Builder.Default
    private String assignmentType = "AVAILABLE";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void assignTenant() {
        if (this.companyId == null) {
            this.companyId = com.fashionerp.common.TenantContext.getCompanyId();
        }
    }
}
