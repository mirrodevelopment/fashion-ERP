package com.fashionerp.inventory;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "item_code", unique = true, nullable = false, length = 30)
    private String itemCode;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(length = 100)
    private String variant;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String unit = "Meter";

    @Column(name = "stock_qty", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal stockQty = BigDecimal.ZERO;

    @Column(name = "reserved_qty", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal reservedQty = BigDecimal.ZERO;

    @Column(name = "reorder_level", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal reorderLevel = BigDecimal.ZERO;

    @Column(name = "purchase_price", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    @Column(name = "supplier_name", length = 200)
    private String supplierName;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InventoryStatus status = InventoryStatus.IN_STOCK;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Computed available = stock - reserved */
    public BigDecimal getAvailableQty() {
        return stockQty.subtract(reservedQty);
    }

    /** Auto-compute status before persist/update */
    @PrePersist @PreUpdate
    public void computeStatus() {
        if (stockQty.compareTo(BigDecimal.ZERO) <= 0) {
            this.status = InventoryStatus.OUT_OF_STOCK;
        } else if (stockQty.compareTo(reorderLevel) <= 0) {
            this.status = InventoryStatus.LOW_STOCK;
        } else {
            this.status = InventoryStatus.IN_STOCK;
        }
    }
}
