package com.fashionerp.appointment;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

public class AppointmentDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        private String customerMobile;
        private String customerPhone;
        private String customerId; // String alias
        private UUID orderId;
        private AppointmentType apptType;
        private LocalDateTime scheduledAt;
        private Integer durationMinutes;
        private String staffAssigned;
        private String notes;

        public String getEffectiveMobile() {
            if (customerMobile != null && !customerMobile.isBlank()) return customerMobile;
            if (customerPhone != null && !customerPhone.isBlank()) return customerPhone;
            return customerId;
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private UUID id;
        private String customerMobile;
        private String customerPhone;
        private String customerId; // String alias
        private String customerName;
        private String customerAvatar;
        private UUID orderId;
        private String orderCode;
        private AppointmentType apptType;
        private LocalDateTime scheduledAt;
        private Integer durationMinutes;
        private AppointmentStatus status;
        private String staffAssigned;
        private String notes;
        private LocalDateTime createdAt;

        public static Response from(Appointment a) {
            String mobile = a.getCustomer() != null ? a.getCustomer().getMobileNumber() : null;
            return Response.builder()
                    .id(a.getId())
                    .customerMobile(mobile)
                    .customerPhone(mobile)
                    .customerId(mobile)
                    .customerName(a.getCustomer() != null ? a.getCustomer().getName() : "")
                    .customerAvatar(a.getCustomer() != null ? a.getCustomer().getAvatarUrl() : "")
                    .orderId(a.getOrder() != null ? a.getOrder().getId() : null)
                    .orderCode(a.getOrder() != null ? a.getOrder().getOrderCode() : null)
                    .apptType(a.getApptType())
                    .scheduledAt(a.getScheduledAt())
                    .durationMinutes(a.getDurationMinutes())
                    .status(a.getStatus())
                    .staffAssigned(a.getStaffAssigned())
                    .notes(a.getNotes())
                    .createdAt(a.getCreatedAt())
                    .build();
        }
    }
}
