package com.fashionerp.design;

import com.fashionerp.customer.Customer;
import com.fashionerp.order.Order;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "designs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class Design {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "design_code", nullable = false, unique = true, length = 50)
    private String designCode;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "garment_type", nullable = false, length = 100)
    private String garmentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_mobile")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order order;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "style_notes", columnDefinition = "TEXT")
    private String styleNotes;

    @Column(length = 100)
    private String designer;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    // --- Extended Design Studio fields (added via V3 migration) ---

    @Column(name = "sub_category", length = 100)
    private String subCategory;

    @Column(length = 100)
    private String style;

    @Column(length = 100)
    private String occasion;

    @Column(length = 150)
    private String collection;

    @Column(name = "primary_fabric", length = 200)
    private String primaryFabric;

    /** Comma-separated colour options, e.g. "Crimson Red, Emerald Green" */
    @Column(name = "colour_options", columnDefinition = "TEXT")
    private String colourOptions;

    @Column(length = 200)
    private String sizes;

    @Column(columnDefinition = "TEXT")
    private String construction;

    @Column(columnDefinition = "TEXT")
    private String embroidery;

    @Column(name = "estimated_cost", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal estimatedCost = BigDecimal.ZERO;

    @Column(name = "suggested_price", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal suggestedPrice = BigDecimal.ZERO;

    @Column(name = "estimated_labour", length = 50)
    private String estimatedLabour;

    @Column(name = "production_status", length = 30)
    @Builder.Default
    private String productionStatus = "Active";

    @Column(name = "times_used")
    @Builder.Default
    private int timesUsed = 0;

    @Column(name = "last_used_date")
    private LocalDate lastUsedDate;

    /** Comma-separated tags, e.g. "Bridal,Zari,Bestseller" */
    @Column(columnDefinition = "TEXT")
    private String tags;

    /** Comma-separated hex swatch colours, e.g. "#B82E5A,#D4AF37" */
    @Column(columnDefinition = "TEXT")
    private String swatches;

    /** Comma-separated image URLs */
    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    // --- Variant Lineage & Blueprint Specifications (V9) ---

    @Column(name = "is_variant")
    @Builder.Default
    private boolean isVariant = false;

    @Column(name = "parent_design_id")
    private UUID parentDesignId;

    @Column(name = "parent_design_code", length = 30)
    private String parentDesignCode;

    @Column(name = "variant_suffix", length = 30)
    private String variantSuffix;

    @Column(length = 150)
    private String neckline;

    @Column(name = "sleeve_style", length = 150)
    private String sleeveStyle;

    @Column(name = "back_design", length = 150)
    private String backDesign;

    @Column(length = 150)
    private String lining;

    @Column(length = 100)
    private String padding;

    @Column(name = "readiness_score")
    @Builder.Default
    private Integer readinessScore = 85;

    @Column(name = "variant_alteration_notes", columnDefinition = "TEXT")
    private String variantAlterationNotes;

    @Column(name = "turnaround_days")
    @Builder.Default
    private Integer turnaroundDays = 12;

    @Column(name = "accent_fabric", length = 150)
    private String accentFabric;

    @Column(length = 50)
    @Builder.Default
    private String complexity = "High";

    @Column(length = 100)
    private String closure;

    @Column(length = 100)
    @Builder.Default
    private String branch = "Main Branch";

    // --- Audit ---

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
