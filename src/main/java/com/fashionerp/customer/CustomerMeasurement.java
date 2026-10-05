package com.fashionerp.customer;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customer_measurements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "customer_mobile", nullable = false, length = 30)
    private String customerMobile;

    @Column(name = "garment_type", nullable = false, length = 50)
    @Builder.Default
    private String garmentType = "General";

    @Column(precision = 6, scale = 2)
    private BigDecimal bust;

    @Column(name = "upper_bust", precision = 6, scale = 2)
    private BigDecimal upperBust;

    @Column(name = "under_bust", precision = 6, scale = 2)
    private BigDecimal underBust;

    @Column(precision = 6, scale = 2)
    private BigDecimal waist;

    @Column(name = "high_hip", precision = 6, scale = 2)
    private BigDecimal highHip;

    @Column(name = "full_hip", precision = 6, scale = 2)
    private BigDecimal fullHip;

    @Column(precision = 6, scale = 2)
    private BigDecimal shoulder;

    @Column(name = "cross_front", precision = 6, scale = 2)
    private BigDecimal crossFront;

    @Column(name = "cross_back", precision = 6, scale = 2)
    private BigDecimal crossBack;

    @Column(precision = 6, scale = 2)
    private BigDecimal armhole;

    @Column(name = "sleeve_length", precision = 6, scale = 2)
    private BigDecimal sleeveLength;

    @Column(precision = 6, scale = 2)
    private BigDecimal bicep;

    @Column(precision = 6, scale = 2)
    private BigDecimal wrist;

    @Column(name = "front_neck", precision = 6, scale = 2)
    private BigDecimal frontNeck;

    @Column(name = "back_neck", precision = 6, scale = 2)
    private BigDecimal backNeck;

    @Column(name = "apex_point", precision = 6, scale = 2)
    private BigDecimal apexPoint;

    @Column(name = "garment_length", precision = 6, scale = 2)
    private BigDecimal garmentLength;

    @Column(name = "posture_notes", columnDefinition = "TEXT")
    private String postureNotes;

    @Column(name = "shape_notes", columnDefinition = "TEXT")
    private String shapeNotes;

    @Column(name = "recorded_by", length = 100)
    private String recordedBy;

    @Column(name = "is_active_profile", nullable = false)
    @Builder.Default
    private Boolean isActiveProfile = true;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void assignTenant() {
        if (this.companyId == null) {
            this.companyId = com.fashionerp.common.TenantContext.getCompanyId();
        }
    }
}
