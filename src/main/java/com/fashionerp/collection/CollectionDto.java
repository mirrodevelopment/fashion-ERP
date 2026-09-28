package com.fashionerp.collection;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CollectionDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        private String code;
        @NotBlank(message = "Collection name is required")
        private String name;
        private String subtitle;
        private String description;
        private String season;
        private Integer year;
        private String status;
        private String designer;
        private String branch;
        private LocalDate launchDate;
        private Boolean isFeatured;
        private String coverImageUrl;
        private String thumbnailUrls;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String name;
        private String subtitle;
        private String description;
        private String season;
        private Integer year;
        private String status;
        private String designer;
        private String branch;
        private LocalDate launchDate;
        private Boolean isFeatured;
        private String coverImageUrl;
        private String thumbnailUrls;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryResponse {
        private UUID id;
        private String code;
        private String name;
        private String subtitle;
        private String description;
        private String season;
        private Integer year;
        private String status;
        private String designer;
        private String branch;
        private LocalDate launchDate;
        private Boolean isFeatured;
        private String coverImageUrl;
        private List<String> thumbnails;
        private long designsCount;
        private long garmentsCount;
        private long fabricsCount;
        private Integer progressPercentage;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailResponse {
        private UUID id;
        private String code;
        private String name;
        private String subtitle;
        private String description;
        private String season;
        private Integer year;
        private String status;
        private String designer;
        private String branch;
        private LocalDate launchDate;
        private LocalDate productionDeadline;
        private Integer daysRemaining;
        private Integer progressPercentage;
        private Integer designProgress;
        private Integer materialsProgress;
        private Integer productionProgress;
        private Integer qcProgress;
        private Boolean isFeatured;
        private String coverImageUrl;
        private List<String> thumbnails;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // Dynamic metrics computed from real database records
        private CollectionStats stats;
        private List<CompositionItem> garmentComposition;
        private List<ProductionStageItem> productionStatus;
        private List<FabricItem> keyFabrics;
        private List<ActivityItem> recentActivity;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CollectionStats {
        private long garmentsCount;
        private long fabricsCount;
        private BigDecimal estimatedValue;
        private String formattedValue;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompositionItem {
        private String category;
        private long count;
        private int percentage;
        private String color;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductionStageItem {
        private String stage;
        private long count;
        private String color;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FabricItem {
        private String name;
        private long meters;
        private String imageUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityItem {
        private String date;
        private String description;
        private String status;
        private String color;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KpiResponse {
        private long totalCollections;
        private long activeCollections;
        private long currentSeasonCount;
        private String currentSeasonName;
        private long totalGarments;
        private long totalDesigns;
        private long draftCollections;
    }
}
