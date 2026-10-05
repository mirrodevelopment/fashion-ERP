package com.fashionerp.branch;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

public class BranchDto {

    @Getter
    @Setter
    public static class Request {
        private String name;
        private String type;
        private String streetAddress;
        private String city;
        private String state;
        private String pinCode;
        private String country;
        private String phone;
        private String whatsapp;
        private String email;
        private String website;
        private String googleMapsUrl;
        private boolean active;
        private boolean isHeadquarters;
        private UUID managerId;
        private String workingHours;
        private String features;
        private String notes;
    }

    @Getter
    @Setter
    @Builder
    public static class Response {
        private UUID id;
        private String branchCode;
        private String name;
        private String type;
        private String streetAddress;
        private String city;
        private String state;
        private String pinCode;
        private String country;
        private String phone;
        private String whatsapp;
        private String email;
        private String website;
        private String googleMapsUrl;
        private boolean active;
        private boolean isHeadquarters;
        private UUID managerId;
        private String workingHours;
        private String features;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(Branch b) {
            return Response.builder()
                .id(b.getId())
                .branchCode(b.getBranchCode())
                .name(b.getName())
                .type(b.getType())
                .streetAddress(b.getStreetAddress())
                .city(b.getCity())
                .state(b.getState())
                .pinCode(b.getPinCode())
                .country(b.getCountry())
                .phone(b.getPhone())
                .whatsapp(b.getWhatsapp())
                .email(b.getEmail())
                .website(b.getWebsite())
                .googleMapsUrl(b.getGoogleMapsUrl())
                .active(b.isActive())
                .isHeadquarters(b.isHeadquarters())
                .managerId(b.getManagerId())
                .workingHours(b.getWorkingHours())
                .features(b.getFeatures())
                .notes(b.getNotes())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
        }
    }
}
