package com.fashionerp.inventory;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class InventoryDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        private String name;
        private String category;
        private String variant;
        private String unit;
        private BigDecimal stockQty;
        private BigDecimal reservedQty;
        private BigDecimal reorderLevel;
        private BigDecimal purchasePrice;
        private String supplierName;
        private String imageUrl;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private UUID id;
        private String itemCode;
        private String name;
        private String category;
        private String variant;
        private String unit;
        private BigDecimal stockQty;
        private BigDecimal reservedQty;
        private BigDecimal availableQty;
        private BigDecimal reorderLevel;
        private BigDecimal purchasePrice;
        private String supplierName;
        private String imageUrl;
        private InventoryStatus status;
        private LocalDateTime updatedAt;

        public static Response from(InventoryItem i) {
            return Response.builder()
                    .id(i.getId()).itemCode(i.getItemCode())
                    .name(i.getName()).category(i.getCategory())
                    .variant(i.getVariant()).unit(i.getUnit())
                    .stockQty(i.getStockQty()).reservedQty(i.getReservedQty())
                    .availableQty(i.getAvailableQty())
                    .reorderLevel(i.getReorderLevel())
                    .purchasePrice(i.getPurchasePrice())
                    .supplierName(i.getSupplierName())
                    .imageUrl(i.getImageUrl()).status(i.getStatus())
                    .updatedAt(i.getUpdatedAt())
                    .build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AdjustRequest {
        private BigDecimal quantity; // positive = add, negative = remove
        private String reason;
        private String movedBy;
    }
}
