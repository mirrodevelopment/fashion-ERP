package com.fashionerp.measurement;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class MeasurementDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PointRequest {
        private String pointName;
        private BigDecimal value;
        private String unit;
        private Integer markerIndex;
        private Integer sortOrder;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        private String customerMobile;
        private String customerId; // String alias
        private String garmentType;
        private String recordedBy;
        private String notes;
        private List<PointRequest> points;

        public String getEffectiveMobile() {
            if (customerMobile != null && !customerMobile.isBlank()) return customerMobile;
            return customerId;
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PointResponse {
        private UUID id;
        private String pointName;
        private BigDecimal value;
        private String unit;
        private Integer markerIndex;
        private Integer sortOrder;

        public static PointResponse from(MeasurementPoint p) {
            return PointResponse.builder()
                    .id(p.getId()).pointName(p.getPointName())
                    .value(p.getValue()).unit(p.getUnit())
                    .markerIndex(p.getMarkerIndex()).sortOrder(p.getSortOrder())
                    .build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private UUID id;
        private String customerMobile;
        private String customerId; // String alias
        private String customerName;
        private String garmentType;
        private String recordedBy;
        private String notes;
        private List<PointResponse> points;
        private LocalDateTime recordedAt;

        public static Response from(MeasurementProfile p) {
            String mobile = p.getCustomer() != null ? p.getCustomer().getMobileNumber() : null;
            return Response.builder()
                    .id(p.getId())
                    .customerMobile(mobile)
                    .customerId(mobile)
                    .customerName(p.getCustomer() != null ? p.getCustomer().getName() : "")
                    .garmentType(p.getGarmentType())
                    .recordedBy(p.getRecordedBy())
                    .notes(p.getNotes())
                    .points(p.getPoints().stream().map(PointResponse::from).toList())
                    .recordedAt(p.getRecordedAt())
                    .build();
        }
    }
}
