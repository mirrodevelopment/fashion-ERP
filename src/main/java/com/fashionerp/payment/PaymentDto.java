package com.fashionerp.payment;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class PaymentDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        private UUID orderId;
        private String customerMobile;
        private String customerId; // String alias
        private BigDecimal totalAmount;
        private LocalDate dueDate;
        private String notes;

        public String getEffectiveMobile() {
            if (customerMobile != null && !customerMobile.isBlank()) return customerMobile;
            return customerId;
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TransactionRequest {
        private BigDecimal amount;
        private PaymentMethod method;
        private String receivedBy;
        private String referenceNo;
        private String notes;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TransactionResponse {
        private UUID id;
        private BigDecimal amount;
        private PaymentMethod method;
        private String receivedBy;
        private String referenceNo;
        private LocalDateTime transactionDate;

        public static TransactionResponse from(PaymentTransaction t) {
            return TransactionResponse.builder()
                    .id(t.getId()).amount(t.getAmount()).method(t.getMethod())
                    .receivedBy(t.getReceivedBy()).referenceNo(t.getReferenceNo())
                    .transactionDate(t.getTransactionDate()).build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private UUID id;
        private UUID orderId;
        private String orderCode;
        private String customerMobile;
        private String customerId; // String alias
        private String customerName;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal balance;
        private PaymentStatus status;
        private LocalDate dueDate;
        private String notes;
        private List<TransactionResponse> transactions;
        private LocalDateTime createdAt;

        public static Response from(Payment p) {
            String mobile = p.getCustomer() != null ? p.getCustomer().getMobileNumber() : null;
            return Response.builder()
                    .id(p.getId())
                    .orderId(p.getOrder().getId())
                    .orderCode(p.getOrder().getOrderCode())
                    .customerMobile(mobile)
                    .customerId(mobile)
                    .customerName(p.getCustomer() != null ? p.getCustomer().getName() : "")
                    .totalAmount(p.getTotalAmount())
                    .paidAmount(p.getPaidAmount())
                    .balance(p.getBalance())
                    .status(p.getStatus())
                    .dueDate(p.getDueDate())
                    .notes(p.getNotes())
                    .transactions(p.getTransactions().stream().map(TransactionResponse::from).toList())
                    .createdAt(p.getCreatedAt())
                    .build();
        }
    }
}
