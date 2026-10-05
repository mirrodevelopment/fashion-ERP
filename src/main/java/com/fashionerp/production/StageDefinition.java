package com.fashionerp.production;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JPA entity for the stage_definitions table.
 * Represents a workflow stage blueprint (e.g. DESIGNING, CUTTING, QC)
 * shared across all production orders. This is the editable "template" layer —
 * the per-order stage records live in production_stages.
 */
@Entity
@Table(name = "stage_definitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StageDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    /** Immutable machine key — e.g. DESIGNING, HAND_WORK, QC */
    @Column(name = "stage_key", nullable = false, length = 50)
    private String stageKey;

    /** User-editable display label — e.g. "Designing", "Hand Work" */
    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    /** Optional description of what happens in this stage */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Employee role required for this stage — e.g. DESIGNER, TAILOR */
    @Column(name = "required_role", length = 50)
    private String requiredRole;

    /** Human-friendly department label for modals — e.g. "Design Studio" */
    @Column(name = "dept_label", length = 100)
    private String deptLabel;

    /** CSS color token for the Kanban column dot — e.g. "dot-purple" */
    @Column(name = "color_class", length = 50)
    private String colorClass;

    /** Column order in the Kanban board */
    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    /** Soft-delete flag — inactive stages are hidden from the Kanban */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /** Optional artwork/photo representing this stage across the ERP */
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

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
    }
}
