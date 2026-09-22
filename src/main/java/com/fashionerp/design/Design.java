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
public class Design {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "design_code", nullable = false, unique = true, length = 20)
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

    // --- Audit ---

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
