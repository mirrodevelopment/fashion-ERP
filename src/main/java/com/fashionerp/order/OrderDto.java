package com.fashionerp.order;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        private String customerMobile;
        private String customerId; // Fallback alias
        private String customerName;
        private String garmentType;
        private String garmentDesc;
        private String collection;
        private LocalDate orderDate;
        private LocalDate expectedDeliveryDate;
        private LocalDate deliveredDate;
        private LocalDate dueDate; // Fallback alias
        private BigDecimal advancePaid;
        private BigDecimal totalAmount;
        private BigDecimal balanceAmount;
        private BigDecimal amount; // Fallback alias
        private String notes;
        private OrderStatus status;
        private String currentStage;
        private List<String> referenceImages;
        private String productionNotes;
        private String paymentMethod;
        private String branch;

        public String getEffectiveMobile() {
            if (customerMobile != null && !customerMobile.isBlank()) return customerMobile;
            return customerId;
        }

        public BigDecimal getEffectiveTotalAmount() {
            if (totalAmount != null) return totalAmount;
            if (amount != null) return amount;
            return null;
        }

        public LocalDate getEffectiveExpectedDeliveryDate() {
            if (expectedDeliveryDate != null) return expectedDeliveryDate;
            return dueDate;
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private UUID id;
        private String orderCode;
        private String customerMobile;
        private String customerId; // String alias
        private String customerName;
        private String customerAvatar;
        private String garmentType;
        private String garmentDesc;
        private String collection;
        private LocalDate orderDate;
        private LocalDate expectedDeliveryDate;
        private LocalDate deliveredDate;
        private LocalDate dueDate; // Alias
        private BigDecimal advancePaid;
        private BigDecimal totalAmount;
        private BigDecimal balanceAmount;
        private BigDecimal amount; // Alias
        private OrderStatus status;
        private List<String> progressStages;
        private String notes;
        private String currentStage;
        private List<String> referenceImages;
        private String productionNotes;
        private Integer qcReworkCount;
        private String branch;
        private LocalDateTime createdAt;

        public static Response from(Order o) {
            String mobile = o.getCustomer() != null ? o.getCustomer().getMobileNumber() : o.getCustomerMobile();
            String name = (o.getCustomerName() != null && !o.getCustomerName().isBlank())
                    ? o.getCustomerName()
                    : (o.getCustomer() != null ? o.getCustomer().getName() : "");
            BigDecimal tot = o.getTotalAmount() != null && o.getTotalAmount().compareTo(BigDecimal.ZERO) > 0
                    ? o.getTotalAmount()
                    : o.getAmount();
            BigDecimal adv = o.getAdvancePaid() != null ? o.getAdvancePaid() : BigDecimal.ZERO;
            BigDecimal bal = o.getBalanceAmount() != null
                    ? o.getBalanceAmount()
                    : (tot != null ? tot.subtract(adv) : BigDecimal.ZERO);
            LocalDate expDel = o.getExpectedDeliveryDate() != null ? o.getExpectedDeliveryDate() : o.getDueDate();

            return Response.builder()
                    .id(o.getId())
                    .orderCode(o.getOrderCode())
                    .customerMobile(mobile)
                    .customerId(mobile)
                    .customerName(name)
                    .customerAvatar(o.getCustomer() != null ? o.getCustomer().getAvatarUrl() : "")
                    .garmentType(o.getGarmentType())
                    .garmentDesc(o.getGarmentDesc())
                    .collection(o.getCollection())
                    .orderDate(o.getOrderDate())
                    .expectedDeliveryDate(expDel)
                    .deliveredDate(o.getDeliveredDate())
                    .dueDate(expDel)
                    .advancePaid(adv)
                    .totalAmount(tot)
                    .balanceAmount(bal)
                    .amount(tot)
                    .status(o.getStatus())
                    .progressStages(o.getProgressStages() != null ? o.getProgressStages().stream()
                            .map(ps -> ps != null ? ps.getStage() : null)
                            .filter(java.util.Objects::nonNull)
                            .toList() : java.util.Collections.emptyList())
                    .notes(o.getNotes())
                    .currentStage(o.getCurrentStage())
                    .referenceImages(o.getReferenceImageList())
                    .productionNotes(o.getProductionNotes())
                    .qcReworkCount(o.getQcReworkCount() != null ? o.getQcReworkCount() : 0)
                    .branch(o.getBranch())
                    .createdAt(o.getCreatedAt())
                    .build();
        }
    }
}
