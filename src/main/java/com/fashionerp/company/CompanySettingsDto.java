package com.fashionerp.company;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

public class CompanySettingsDto {

    @Getter
    @Setter
    public static class Request {
        private String companyName;
        private String shortName;
        private String tagline;
        private String ownerName;
        private String businessType;
        private String gstin;
        private String panNumber;
        private String primaryPhone;
        private String whatsapp;
        private String email;
        private String website;
        private String streetAddress;
        private String city;
        private String state;
        private String pinCode;
        private String country;
        private String logoBase64;

        /* ── Branch Data Sharing Policies ── */
        private Boolean shareCustomersAcrossBranches;
        private Boolean shareOrdersAcrossBranches;
        private Boolean shareEnquiriesAcrossBranches;
        private Boolean shareMeasurementsAcrossBranches;
        private Boolean shareInventoryAcrossBranches;
        private Boolean shareGarmentsAcrossBranches;
        private Boolean shareTrialsAcrossBranches;
        private Boolean shareDesignsAcrossBranches;
        private Boolean sharePurchasesAcrossBranches;
        private Boolean shareWorkforceAcrossBranches;

        private String currencySymbol;
        private String orderPrefix;
        private String invoicePrefix;

        private Integer sessionTimeoutMinutes;
    }

    @Getter
    @Setter
    @Builder
    public static class Response {
        private UUID id;
        private String companyName;
        private String shortName;
        private String tagline;
        private String ownerName;
        private String businessType;
        private String gstin;
        private String panNumber;
        private String primaryPhone;
        private String whatsapp;
        private String email;
        private String website;
        private String streetAddress;
        private String city;
        private String state;
        private String pinCode;
        private String country;
        private String logoBase64;
        private Boolean shareCustomersAcrossBranches;
        private Boolean shareOrdersAcrossBranches;
        private Boolean shareEnquiriesAcrossBranches;
        private Boolean shareMeasurementsAcrossBranches;
        private Boolean shareInventoryAcrossBranches;
        private Boolean shareGarmentsAcrossBranches;
        private Boolean shareTrialsAcrossBranches;
        private Boolean shareDesignsAcrossBranches;
        private Boolean sharePurchasesAcrossBranches;
        private Boolean shareWorkforceAcrossBranches;
        private String currencySymbol;
        private String orderPrefix;
        private String invoicePrefix;
        private Integer sessionTimeoutMinutes;
        private LocalDateTime updatedAt;

        public static Response from(CompanySettings s) {
            return Response.builder()
                .id(s.getId())
                .companyName(s.getCompanyName())
                .shortName(s.getShortName())
                .tagline(s.getTagline())
                .ownerName(s.getOwnerName())
                .businessType(s.getBusinessType())
                .gstin(s.getGstin())
                .panNumber(s.getPanNumber())
                .primaryPhone(s.getPrimaryPhone())
                .whatsapp(s.getWhatsapp())
                .email(s.getEmail())
                .website(s.getWebsite())
                .streetAddress(s.getStreetAddress())
                .city(s.getCity())
                .state(s.getState())
                .pinCode(s.getPinCode())
                .country(s.getCountry())
                .logoBase64(s.getLogoBase64())
                .shareCustomersAcrossBranches(s.isShareCustomersAcrossBranches())
                .shareOrdersAcrossBranches(s.isShareOrdersAcrossBranches())
                .shareEnquiriesAcrossBranches(s.isShareEnquiriesAcrossBranches())
                .shareMeasurementsAcrossBranches(s.isShareMeasurementsAcrossBranches())
                .shareInventoryAcrossBranches(s.isShareInventoryAcrossBranches())
                .shareGarmentsAcrossBranches(s.isShareGarmentsAcrossBranches())
                .shareTrialsAcrossBranches(s.isShareTrialsAcrossBranches())
                .shareDesignsAcrossBranches(s.isShareDesignsAcrossBranches())
                .sharePurchasesAcrossBranches(s.isSharePurchasesAcrossBranches())
                .shareWorkforceAcrossBranches(s.isShareWorkforceAcrossBranches())
                .currencySymbol(s.getCurrencySymbol() != null ? s.getCurrencySymbol() : "₹")
                .orderPrefix(s.getOrderPrefix() != null ? s.getOrderPrefix() : "ORD-")
                .invoicePrefix(s.getInvoicePrefix() != null ? s.getInvoicePrefix() : "INV-")
                .sessionTimeoutMinutes(s.getSessionTimeoutMinutes() >= 0 ? s.getSessionTimeoutMinutes() : 20)
                .updatedAt(s.getUpdatedAt())
                .build();
        }
    }
}
