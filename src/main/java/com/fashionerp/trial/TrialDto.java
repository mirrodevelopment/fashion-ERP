package com.fashionerp.trial;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class TrialDto {

    @Getter @Setter
    public static class Request {
        private String orderCode;
        private String customerMobile;
        private String customerName;
        private String garmentType;
        private String collection;
        private LocalDate trialDate;
        private String trialTime;
        private String stage;
        private String status;
        private String fitStatus;
        private Integer trialAttempt;
        private Integer alterationCount;
        private String customerFeedback;
        private Integer customerRating;
        private String fitPreference;
        private String fitCheckpoints;
        private String fitNotes;
        private String designerName;
        private LocalDate deliveryDate;
        private String neckStyle;
        private String sleeveStyle;
        private String lining;
        private String embroidery;
        private String fabric;
        private String specNotes;
        private String notes;
        private LocalDate nextTrialDate;
        private LocalDateTime completedAt;
        private String completedBy;
        private List<AlterationItem> alterations;
    }

    @Getter @Setter
    public static class AlterationItem {
        private UUID id;
        private String description;
        private String category;
        private Boolean completed;
        private String status;
        private String assignedTailor;
        private String priority;
        @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate targetDate;
        private String tailorNotes;
        private LocalDateTime completedAt;
        private String completedBy;
    }

    @Getter @Setter @Builder
    public static class Response {
        private UUID id;
        private String trialCode;
        private String orderCode;
        private String customerMobile;
        private String customerName;
        private String customerEmail;
        private String customerLocation;
        private String customerAvatar;
        private Boolean vip;
        private String garmentType;
        private String collection;
        private LocalDate trialDate;
        private String trialTime;
        private String stage;
        private String status;
        private String fitStatus;
        private Integer trialAttempt;
        private Integer alterationCount;
        private String customerFeedback;
        private Integer customerRating;
        private String fitPreference;
        private String fitCheckpoints;
        private String fitNotes;
        private String designerName;
        private LocalDate deliveryDate;
        private String neckStyle;
        private String sleeveStyle;
        private String lining;
        private String embroidery;
        private String fabric;
        private String specNotes;
        private String notes;
        private LocalDate nextTrialDate;
        private LocalDateTime completedAt;
        private String completedBy;
        private List<AlterationItem> alterations;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(Trial t) {
            List<AlterationItem> altList = t.getAlterations() == null ? List.of() :
                    t.getAlterations().stream().map(a -> {
                        AlterationItem item = new AlterationItem();
                        item.setId(a.getId());
                        item.setDescription(a.getDescription());
                        item.setCategory(a.getCategory());
                        item.setCompleted(a.getCompleted());
                        item.setStatus(a.getStatus());
                        item.setAssignedTailor(a.getAssignedTailor());
                        item.setPriority(a.getPriority());
                        item.setTargetDate(a.getTargetDate());
                        item.setTailorNotes(a.getTailorNotes());
                        item.setCompletedAt(a.getCompletedAt());
                        item.setCompletedBy(a.getCompletedBy());
                        return item;
                    }).collect(Collectors.toList());

            String mobile = t.getCustomer() != null ? t.getCustomer().getMobileNumber() : "";
            String name = t.getCustomer() != null && t.getCustomer().getName() != null ? t.getCustomer().getName() : (t.getCustomerName() != null ? t.getCustomerName() : "");
            String email = t.getCustomer() != null ? t.getCustomer().getEmail() : "";
            String location = t.getCustomer() != null ? t.getCustomer().getLocation() : "";
            String avatar = t.getCustomer() != null ? t.getCustomer().getAvatarUrl() : "";
            boolean isVip = t.getCustomer() != null && t.getCustomer().getTier() != null && t.getCustomer().getTier().name().startsWith("VIP");

            return Response.builder()
                    .id(t.getId())
                    .trialCode(t.getTrialCode())
                    .orderCode(t.getOrderCode())
                    .customerMobile(mobile)
                    .customerName(name)
                    .customerEmail(email)
                    .customerLocation(location)
                    .customerAvatar(avatar)
                    .vip(isVip)
                    .garmentType(t.getGarmentType())
                    .collection(t.getCollection())
                    .trialDate(t.getTrialDate())
                    .trialTime(t.getTrialTime())
                    .stage(t.getStage())
                    .status(t.getStatus())
                    .fitStatus(t.getFitStatus())
                    .trialAttempt(t.getTrialAttempt() != null ? t.getTrialAttempt() : 1)
                    .alterationCount(t.getAlterationCount() != null ? t.getAlterationCount() : 0)
                    .customerFeedback(t.getCustomerFeedback())
                    .customerRating(t.getCustomerRating() != null ? t.getCustomerRating() : 5)
                    .fitPreference(t.getFitPreference() != null ? t.getFitPreference() : "Comfort / Regular Fit")
                    .fitCheckpoints(t.getFitCheckpoints())
                    .fitNotes(t.getFitNotes())
                    .designerName(t.getDesignerName())
                    .deliveryDate(t.getDeliveryDate())
                    .neckStyle(t.getNeckStyle())
                    .sleeveStyle(t.getSleeveStyle())
                    .lining(t.getLining())
                    .embroidery(t.getEmbroidery())
                    .fabric(t.getFabric())
                    .specNotes(t.getSpecNotes())
                    .notes(t.getNotes())
                    .nextTrialDate(t.getNextTrialDate())
                    .completedAt(t.getCompletedAt())
                    .completedBy(t.getCompletedBy())
                    .alterations(altList)
                    .createdAt(t.getCreatedAt())
                    .updatedAt(t.getUpdatedAt())
                    .build();
        }
    }
}
