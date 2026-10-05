package com.fashionerp.garment;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "garments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Garment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "garment_code", nullable = false, unique = true, length = 50)
    private String garmentCode;

    @Column(name = "order_id")
    private UUID orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private com.fashionerp.order.Order order;

    @Column(name = "order_code", nullable = false, length = 50)
    private String orderCode;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_mobile", length = 30)
    private String customerMobile;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "garment_type", nullable = false, length = 100)
    private String garmentType;

    @Column(length = 250)
    private String specs;

    @Column(name = "design_code", length = 50)
    private String designCode;

    @Column(name = "collection_name", length = 150)
    private String collectionName;

    @Column(name = "production_stage", nullable = false, length = 50)
    @Builder.Default
    private String productionStage = "DESIGNING";

    @Column(name = "material_status", nullable = false, length = 50)
    @Builder.Default
    private String materialStatus = "READY";

    @Column(name = "trial_status", length = 100)
    private String trialStatus;

    @Column(name = "trial_date")
    private LocalDate trialDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String priority = "NORMAL";

    @Column(name = "payment_status", nullable = false, length = 30)
    @Builder.Default
    private String paymentStatus = "PENDING";

    @Column(name = "paid_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "IN_PRODUCTION";

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(length = 100)
    private String designer;

    @Column(length = 100)
    private String branch;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

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
