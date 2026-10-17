package com.fashionerp.order;

import com.fashionerp.customer.Customer;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(length = 100)
    @Builder.Default
    private String branch = "Main Branch";

    @Column(name = "order_code", nullable = false, unique = true, length = 30)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_mobile", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "orders", "measurements"})
    private Customer customer;

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(name = "garment_type", nullable = false, length = 100)
    private String garmentType;

    @Column(name = "garment_desc", columnDefinition = "TEXT")
    private String garmentDesc;

    @Column(length = 150)
    private String collection;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "advance_paid", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal advancePaid = BigDecimal.ZERO;

    @Column(name = "balance_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal balanceAmount = BigDecimal.ZERO;

    @Column(name = "amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "order_date", nullable = false)
    @Builder.Default
    private LocalDate orderDate = LocalDate.now();

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Column(name = "delivered_date")
    private LocalDate deliveredDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    /** Current workflow stage key from stage_definitions (e.g. "ORDER_TAKEN", "CUTTING"). */
    @Column(name = "current_stage", length = 50)
    @Builder.Default
    private String currentStage = "ORDER_TAKEN";

    /**
     * JSON array of up to 5 uploaded reference image paths.
     * Example: ["/front end/assets/order-ref/ORD-2026-0001-ref1.jpg", ...]
     * Use getReferenceImageList() / setReferenceImageList() for type-safe access.
     */
    @Column(name = "reference_images", columnDefinition = "TEXT")
    @Builder.Default
    private String referenceImages = "[]";

    /** Free-form tailor / production notes (separate from general order notes). */
    @Column(name = "production_notes", columnDefinition = "TEXT")
    private String productionNotes;

    /** Tracks how many times this order was sent back from QC for rework. Defaults to 0. */
    @Column(name = "qc_rework_count", nullable = false)
    @Builder.Default
    private Integer qcReworkCount = 0;

    // --- Design Blueprint, Tailoring & Production Attributes (V10) ---

    @Column(name = "design_id")
    private UUID designId;

    @Column(name = "design_code", length = 50)
    private String designCode;

    @Column(name = "design_category", length = 100)
    private String designCategory;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String priority = "NORMAL";

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "measurement_profile_id")
    private UUID measurementProfileId;

    @Column(name = "neck_style", length = 100)
    private String neckStyle;

    @Column(name = "sleeve_style", length = 100)
    private String sleeveStyle;

    @Column(name = "fabric_type", length = 100)
    private String fabricType;

    @Column(name = "fabric_colour", length = 100)
    private String fabricColour;

    @Column(name = "fabric_source", length = 50)
    @Builder.Default
    private String fabricSource = "BOUTIQUE";

    @Column(name = "payment_method", length = 50)
    @Builder.Default
    private String paymentMethod = "CASH";

    /**
     * Deserialise the stored JSON string into a typed list (never null).
     * Uses pure Java — no Jackson dependency required at the entity level.
     * Format stored: ["url1","url2"]
     */
    @Transient
    public List<String> getReferenceImageList() {
        String raw = referenceImages;
        if (raw == null || raw.isBlank() || raw.trim().equals("[]")) return new ArrayList<>();
        List<String> result = new ArrayList<>();
        // Strip outer [ ]
        String inner = raw.trim();
        if (inner.startsWith("[")) inner = inner.substring(1);
        if (inner.endsWith("]")) inner = inner.substring(0, inner.length() - 1);
        inner = inner.trim();
        if (inner.isEmpty()) return result;
        // Split on "," respecting quoted strings (simple: split on "," and strip quotes)
        for (String token : inner.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)")) {
            String t = token.trim();
            if (t.startsWith("\"")) t = t.substring(1);
            if (t.endsWith("\"")) t = t.substring(0, t.length() - 1);
            // Unescape \" inside values
            t = t.replace("\\\"", "\"");
            if (!t.isEmpty()) result.add(t);
        }
        return result;
    }

    /** Serialise a list back into a JSON array string and store it. */
    public void setReferenceImageList(List<String> imgs) {
        if (imgs == null || imgs.isEmpty()) {
            this.referenceImages = "[]";
            return;
        }
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < imgs.size(); i++) {
            if (i > 0) sb.append(",");
            String v = imgs.get(i);
            if (v == null) v = "";
            sb.append("\"").append(v.replace("\\", "\\\\").replace("\"", "\\\"")).append("\"");
        }
        sb.append("]");
        this.referenceImages = sb.toString();
    }

    public LocalDate getDueDate() {
        return expectedDeliveryDate != null ? expectedDeliveryDate : dueDate;
    }

    public void setDueDate(LocalDate d) {
        this.dueDate = d;
        if (this.expectedDeliveryDate == null) {
            this.expectedDeliveryDate = d;
        }
    }

    public String getCustomerMobile() {
        return customer != null ? customer.getMobileNumber() : null;
    }

    public BigDecimal getAmount() {
        return totalAmount != null && totalAmount.compareTo(BigDecimal.ZERO) > 0 ? totalAmount : amount;
    }

    public void setAmount(BigDecimal a) {
        this.amount = a;
        if (this.totalAmount == null || this.totalAmount.compareTo(BigDecimal.ZERO) == 0) {
            this.totalAmount = a;
        }
    }

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<OrderProgressStage> progressStages = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist @PreUpdate
    protected void assignTenantAndSync() {
        if (this.companyId == null) {
            this.companyId = com.fashionerp.common.TenantContext.getCompanyId();
        }
        if (this.branch == null || this.branch.isBlank()) {
            String b = com.fashionerp.common.TenantContext.getAssignedBranch();
            this.branch = (b != null && !b.isBlank() && !"ALL".equalsIgnoreCase(b.trim())) ? b.trim() : "Main Branch";
        }
        if (this.totalAmount != null && (this.amount == null || this.amount.compareTo(BigDecimal.ZERO) == 0)) {
            this.amount = this.totalAmount;
        } else if (this.amount != null && (this.totalAmount == null || this.totalAmount.compareTo(BigDecimal.ZERO) == 0)) {
            this.totalAmount = this.amount;
        }
        if (this.expectedDeliveryDate != null && this.dueDate == null) {
            this.dueDate = this.expectedDeliveryDate;
        } else if (this.dueDate != null && this.expectedDeliveryDate == null) {
            this.expectedDeliveryDate = this.dueDate;
        }
    }
}
