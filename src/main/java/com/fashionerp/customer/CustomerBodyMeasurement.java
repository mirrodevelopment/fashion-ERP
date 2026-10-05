package com.fashionerp.customer;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customer_body_measurements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerBodyMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "customer_mobile", nullable = false, length = 30)
    private String customerMobile;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "garment_type", nullable = false, length = 50)
    private String garmentType; // BLOUSE, CHUDI, LEHENGA, SAREE, GOWN

    @Column(name = "measurement_type", nullable = false, length = 20)
    @Builder.Default
    private String measurementType = "CURRENT"; // CURRENT or OLD

    @Column(name = "is_current", nullable = false)
    @Builder.Default
    private Boolean isCurrent = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer version = 1;

    @Column(length = 10, nullable = false)
    @Builder.Default
    private String unit = "in";

    // ─── 34 Tailoring Precision Points (Inches / CM) ───────────────────────
    // Torso / Upper Body
    @Column(precision = 6, scale = 2)
    private BigDecimal shoulder;

    @Column(precision = 6, scale = 2)
    private BigDecimal bust;

    @Column(name = "under_bust", precision = 6, scale = 2)
    private BigDecimal underBust;

    @Column(precision = 6, scale = 2)
    private BigDecimal waist;

    @Column(precision = 6, scale = 2)
    private BigDecimal hip;

    // Lengths
    @Column(name = "blouse_length", precision = 6, scale = 2)
    private BigDecimal blouseLength;

    @Column(name = "top_length", precision = 6, scale = 2)
    private BigDecimal topLength;

    @Column(name = "full_length", precision = 6, scale = 2)
    private BigDecimal fullLength;

    @Column(name = "skirt_length", precision = 6, scale = 2)
    private BigDecimal skirtLength;

    @Column(name = "pant_length", precision = 6, scale = 2)
    private BigDecimal pantLength;

    // Arms & Sleeves
    @Column(precision = 6, scale = 2)
    private BigDecimal armhole;

    @Column(name = "upper_arm", precision = 6, scale = 2)
    private BigDecimal upperArm;

    @Column(name = "sleeve_length", precision = 6, scale = 2)
    private BigDecimal sleeveLength;

    @Column(name = "sleeve_round", precision = 6, scale = 2)
    private BigDecimal sleeveRound;

    @Column(name = "elbow_round", precision = 6, scale = 2)
    private BigDecimal elbowRound;

    @Column(name = "wrist_round", precision = 6, scale = 2)
    private BigDecimal wristRound;

    // Necks
    @Column(name = "front_neck_depth", precision = 6, scale = 2)
    private BigDecimal frontNeckDepth;

    @Column(name = "back_neck_depth", precision = 6, scale = 2)
    private BigDecimal backNeckDepth;

    // Bust Points & Spans
    @Column(name = "bust_point", precision = 6, scale = 2)
    private BigDecimal bustPoint;

    @Column(name = "bust_point_to_bust_point", precision = 6, scale = 2)
    private BigDecimal bustPointToBustPoint;

    @Column(name = "shoulder_to_bust", precision = 6, scale = 2)
    private BigDecimal shoulderToBust;

    @Column(name = "shoulder_to_waist", precision = 6, scale = 2)
    private BigDecimal shoulderToWaist;

    // Widths
    @Column(name = "front_width", precision = 6, scale = 2)
    private BigDecimal frontWidth;

    @Column(name = "back_width", precision = 6, scale = 2)
    private BigDecimal backWidth;

    // Lower Body & Pants
    @Column(name = "pant_waist", precision = 6, scale = 2)
    private BigDecimal pantWaist;

    @Column(name = "pant_hip", precision = 6, scale = 2)
    private BigDecimal pantHip;

    @Column(name = "thigh_round", precision = 6, scale = 2)
    private BigDecimal thighRound;

    @Column(name = "knee_round", precision = 6, scale = 2)
    private BigDecimal kneeRound;

    @Column(name = "calf_round", precision = 6, scale = 2)
    private BigDecimal calfRound;

    @Column(name = "ankle_round", precision = 6, scale = 2)
    private BigDecimal ankleRound;

    @Column(name = "crotch_length", precision = 6, scale = 2)
    private BigDecimal crotchLength;

    @Column(name = "bottom_opening", precision = 6, scale = 2)
    private BigDecimal bottomOpening;

    // Flares & Transitions
    @Column(name = "waist_to_hip", precision = 6, scale = 2)
    private BigDecimal waistToHip;

    @Column(precision = 6, scale = 2)
    private BigDecimal flare;

    // Auditing & Fitting Notes
    @Column(name = "posture_notes", columnDefinition = "TEXT")
    private String postureNotes;

    @Column(name = "shape_notes", columnDefinition = "TEXT")
    private String shapeNotes;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "recorded_by", length = 100)
    private String recordedBy;

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
