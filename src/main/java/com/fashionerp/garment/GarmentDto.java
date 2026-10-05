package com.fashionerp.garment;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class GarmentDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryResponse {
        private UUID id;
        private String garmentCode;
        private UUID orderId;
        private String orderCode;
        private String customerName;
        private String customerMobile;
        private String title;
        private String garmentType;
        private String specs;
        private String designCode;
        private String collectionName;
        private String productionStage;
        private String materialStatus;
        private String trialStatus;
        private LocalDate trialDate;
        private LocalDate dueDate;
        private Integer daysRemaining;
        private Boolean isOverdue;
        private String priority;
        private String paymentStatus;
        private BigDecimal paidAmount;
        private BigDecimal totalAmount;
        private String formattedPaymentRatio;
        private String status;
        private String assignedTo;
        private String designer;
        private String branch;
        private String imageUrl;
        private String notes;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailResponse {
        private UUID id;
        private String garmentCode;
        private UUID orderId;
        private String orderCode;
        private String customerName;
        private String customerMobile;
        private String title;
        private String garmentType;
        private String specs;
        private String designCode;
        private String collectionName;
        private String productionStage;
        private String materialStatus;
        private String trialStatus;
        private LocalDate trialDate;
        private LocalDate dueDate;
        private Integer daysRemaining;
        private Boolean isOverdue;
        private String priority;
        private String paymentStatus;
        private BigDecimal paidAmount;
        private BigDecimal totalAmount;
        private String formattedPaymentRatio;
        private String status;
        private String assignedTo;
        private String designer;
        private String branch;
        private String imageUrl;
        private String notes;
        private List<MaterialItem> materials;
        private List<MeasurementItem> measurements;
        private List<TimelineItem> timeline;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MaterialItem {
        private String name;
        private String variant;
        private String meters;
        private String status;
        private String imageUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MeasurementItem {
        private String label;
        private String value;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimelineItem {
        private String date;
        private String stage;
        private String description;
        private String actor;
        private String color;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KpiResponse {
        private long totalGarments;
        private String totalGarmentsDelta;
        private long inProduction;
        private String inProductionDelta;
        private long inTrial;
        private String inTrialDelta;
        private long awaitingQc;
        private String awaitingQcDelta;
        private long ready;
        private String readyDelta;
        private long delivered;
        private String deliveredDelta;

        // Stage Tabs Counts
        private long allCount;
        private long designingCount;
        private long inProductionCount;
        private long trialCount;
        private long qcCount;
        private long readyCount;
        private long deliveredCount;
        private long onHoldCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        private String garmentCode;
        private String orderCode;
        private String customerName;
        private String customerMobile;
        private String title;
        private String garmentType;
        private String specs;
        private String designCode;
        private String collectionName;
        private String productionStage;
        private String materialStatus;
        private String trialStatus;
        private LocalDate trialDate;
        private LocalDate dueDate;
        private String priority;
        private String paymentStatus;
        private BigDecimal paidAmount;
        private BigDecimal totalAmount;
        private String status;
        private String assignedTo;
        private String designer;
        private String branch;
        private String imageUrl;
        private String notes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String title;
        private String garmentType;
        private String specs;
        private String collectionName;
        private String productionStage;
        private String materialStatus;
        private String trialStatus;
        private LocalDate trialDate;
        private LocalDate dueDate;
        private String priority;
        private String paymentStatus;
        private BigDecimal paidAmount;
        private BigDecimal totalAmount;
        private String status;
        private String assignedTo;
        private String designer;
        private String branch;
        private String notes;
    }
}
