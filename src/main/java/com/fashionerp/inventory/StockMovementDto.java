package com.fashionerp.inventory;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class StockMovementDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        /** positive = stock added, negative = stock removed */
        private BigDecimal quantity;
        private MovementType movementType;
        private String reference;
        private String notes;
        private String movedBy;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private UUID id;
        private UUID itemId;
        private String itemCode;
        private String itemName;
        private MovementType movementType;
        private BigDecimal quantity;
        private String reference;
        private String notes;
        private String movedBy;
        private LocalDateTime movedAt;

        public static Response from(StockMovement m) {
            return Response.builder()
                    .id(m.getId())
                    .itemId(m.getItem().getId())
                    .itemCode(m.getItem().getItemCode())
                    .itemName(m.getItem().getName())
                    .movementType(m.getMovementType())
                    .quantity(m.getQuantity())
                    .reference(m.getReference())
                    .notes(m.getNotes())
                    .movedBy(m.getMovedBy())
                    .movedAt(m.getMovedAt())
                    .build();
        }
    }
}
