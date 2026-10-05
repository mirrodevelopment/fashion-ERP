package com.fashionerp.customer;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class CustomerDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        private String mobileNumber;
        private String phone; // Fallback alias
        private String name;
        private String salutation;
        private String firstName;
        private String lastName;
        private String gender;
        private String email;
        private String altPhone;
        private String instagramHandle;
        private String preferredChannel;
        private LocalDate dob;
        private LocalDate anniversary;
        private String location;
        private String streetAddress;
        private String city;
        private String state;
        private String pincode;
        private String landmark;
        private String avatarUrl;
        private CustomerTier tier;
        private BigDecimal creditLimit;
        private String favoriteGarment;
        private String fitPreference;
        private String fabricAllergies;
        private String preferredNeck;
        private String preferredSleeve;
        private String preferredOccasions;
        private String deliveryPreference;
        private String branch;
        private String notes;

        // Optional initial measurement set submitted during onboarding
        private MeasurementRequest initialMeasurement;

        public String getEffectiveMobile() {
            if (mobileNumber != null && !mobileNumber.trim().isEmpty()) return mobileNumber.trim();
            if (phone != null && !phone.trim().isEmpty()) return phone.trim();
            return null;
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private String mobileNumber;
        private String phone;
        private String id;           // Backward compatibility returns mobileNumber
        private String customerCode; // Backward compatibility returns mobileNumber
        private String name;
        private String salutation;
        private String firstName;
        private String lastName;
        private String gender;
        private String email;
        private String altPhone;
        private String instagramHandle;
        private String preferredChannel;
        private LocalDate dob;
        private LocalDate anniversary;
        private String location;
        private String streetAddress;
        private String city;
        private String state;
        private String pincode;
        private String landmark;
        private String avatarUrl;
        private CustomerTier tier;
        private BigDecimal totalSpend;
        private BigDecimal balance;
        private BigDecimal creditLimit;
        private String favoriteGarment;
        private String fitPreference;
        private String fabricAllergies;
        private String preferredNeck;
        private String preferredSleeve;
        private String preferredOccasions;
        private String deliveryPreference;
        private String branch;
        private Boolean measurementsOnFile;
        private String notes;
        private LocalDateTime createdAt;
        private List<MeasurementResponse> measurements;

        public static Response from(Customer c) {
            return Response.builder()
                    .mobileNumber(c.getMobileNumber())
                    .phone(c.getMobileNumber())
                    .id(c.getMobileNumber())
                    .customerCode(c.getMobileNumber())
                    .name(c.getName())
                    .salutation(c.getSalutation())
                    .firstName(c.getFirstName())
                    .lastName(c.getLastName())
                    .gender(c.getGender())
                    .email(c.getEmail())
                    .altPhone(c.getAltPhone())
                    .instagramHandle(c.getInstagramHandle())
                    .preferredChannel(c.getPreferredChannel())
                    .dob(c.getDob())
                    .anniversary(c.getAnniversary())
                    .location(c.getLocation())
                    .streetAddress(c.getStreetAddress())
                    .city(c.getCity())
                    .state(c.getState())
                    .pincode(c.getPincode())
                    .landmark(c.getLandmark())
                    .avatarUrl(c.getAvatarUrl())
                    .tier(c.getTier())
                    .totalSpend(c.getTotalSpend())
                    .balance(c.getBalance())
                    .creditLimit(c.getCreditLimit())
                    .favoriteGarment(c.getFavoriteGarment())
                    .fitPreference(c.getFitPreference())
                    .fabricAllergies(c.getFabricAllergies())
                    .preferredNeck(c.getPreferredNeck())
                    .preferredSleeve(c.getPreferredSleeve())
                    .preferredOccasions(c.getPreferredOccasions())
                    .deliveryPreference(c.getDeliveryPreference())
                    .branch(c.getBranch())
                    .measurementsOnFile(c.getMeasurementsOnFile())
                    .notes(c.getNotes())
                    .createdAt(c.getCreatedAt())
                    .measurements(c.getMeasurements() != null ? 
                            c.getMeasurements().stream().map(MeasurementResponse::from).collect(Collectors.toList()) : null)
                    .build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class NoteRequest {
        private String noteText;
        private String authorName;
        private String authorBadge;
        private String category;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class NoteResponse {
        private UUID id;
        private String customerMobile;
        private String noteText;
        private String authorName;
        private String authorBadge;
        private String category;
        private LocalDateTime createdAt;

        public static NoteResponse from(CustomerNote n) {
            return NoteResponse.builder()
                    .id(n.getId())
                    .customerMobile(n.getCustomerMobile())
                    .noteText(n.getNoteText())
                    .authorName(n.getAuthorName())
                    .authorBadge(n.getAuthorBadge())
                    .category(n.getCategory())
                    .createdAt(n.getCreatedAt())
                    .build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Summary {
        private String mobileNumber;
        private String phone;
        private String id;           // Returns mobileNumber
        private String customerCode; // Returns mobileNumber
        private String name;
        private String avatarUrl;
        private CustomerTier tier;
        private BigDecimal balance;
        private String favoriteGarment;
        private Boolean measurementsOnFile;

        public static Summary from(Customer c) {
            return Summary.builder()
                    .mobileNumber(c.getMobileNumber())
                    .phone(c.getMobileNumber())
                    .id(c.getMobileNumber())
                    .customerCode(c.getMobileNumber())
                    .name(c.getName())
                    .avatarUrl(c.getAvatarUrl())
                    .tier(c.getTier())
                    .balance(c.getBalance())
                    .favoriteGarment(c.getFavoriteGarment())
                    .measurementsOnFile(c.getMeasurementsOnFile())
                    .build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MeasurementRequest {
        private String garmentType;
        private BigDecimal bust;
        private BigDecimal upperBust;
        private BigDecimal underBust;
        private BigDecimal waist;
        private BigDecimal highHip;
        private BigDecimal fullHip;
        private BigDecimal shoulder;
        private BigDecimal crossFront;
        private BigDecimal crossBack;
        private BigDecimal armhole;
        private BigDecimal sleeveLength;
        private BigDecimal bicep;
        private BigDecimal wrist;
        private BigDecimal frontNeck;
        private BigDecimal backNeck;
        private BigDecimal apexPoint;
        private BigDecimal garmentLength;
        private String postureNotes;
        private String shapeNotes;
        private String recordedBy;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MeasurementResponse {
        private UUID id;
        private String customerMobile;
        private String garmentType;
        private BigDecimal bust;
        private BigDecimal upperBust;
        private BigDecimal underBust;
        private BigDecimal waist;
        private BigDecimal highHip;
        private BigDecimal fullHip;
        private BigDecimal shoulder;
        private BigDecimal crossFront;
        private BigDecimal crossBack;
        private BigDecimal armhole;
        private BigDecimal sleeveLength;
        private BigDecimal bicep;
        private BigDecimal wrist;
        private BigDecimal frontNeck;
        private BigDecimal backNeck;
        private BigDecimal apexPoint;
        private BigDecimal garmentLength;
        private String postureNotes;
        private String shapeNotes;
        private String recordedBy;
        private Boolean isActiveProfile;
        private LocalDateTime recordedAt;

        public static MeasurementResponse from(CustomerMeasurement m) {
            return MeasurementResponse.builder()
                    .id(m.getId())
                    .customerMobile(m.getCustomerMobile())
                    .garmentType(m.getGarmentType())
                    .bust(m.getBust())
                    .upperBust(m.getUpperBust())
                    .underBust(m.getUnderBust())
                    .waist(m.getWaist())
                    .highHip(m.getHighHip())
                    .fullHip(m.getFullHip())
                    .shoulder(m.getShoulder())
                    .crossFront(m.getCrossFront())
                    .crossBack(m.getCrossBack())
                    .armhole(m.getArmhole())
                    .sleeveLength(m.getSleeveLength())
                    .bicep(m.getBicep())
                    .wrist(m.getWrist())
                    .frontNeck(m.getFrontNeck())
                    .backNeck(m.getBackNeck())
                    .apexPoint(m.getApexPoint())
                    .garmentLength(m.getGarmentLength())
                    .postureNotes(m.getPostureNotes())
                    .shapeNotes(m.getShapeNotes())
                    .recordedBy(m.getRecordedBy())
                    .isActiveProfile(m.getIsActiveProfile())
                    .recordedAt(m.getRecordedAt())
                    .build();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // NEW TAILORED BODY MEASUREMENTS (BLOUSE, CHUDI, LEHENGA, SAREE, GOWN)
    // ─────────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BodyMeasurementRequest {
        private String garmentType;
        private String customerName;
        @Builder.Default
        private String unit = "in";

        // 34 Dimensions
        private BigDecimal shoulder;
        private BigDecimal bust;
        private BigDecimal underBust;
        private BigDecimal waist;
        private BigDecimal hip;

        private BigDecimal blouseLength;
        private BigDecimal topLength;
        private BigDecimal fullLength;
        private BigDecimal skirtLength;
        private BigDecimal pantLength;

        private BigDecimal armhole;
        private BigDecimal upperArm;
        private BigDecimal sleeveLength;
        private BigDecimal sleeveRound;
        private BigDecimal elbowRound;
        private BigDecimal wristRound;

        private BigDecimal frontNeckDepth;
        private BigDecimal backNeckDepth;

        private BigDecimal bustPoint;
        private BigDecimal bustPointToBustPoint;
        private BigDecimal shoulderToBust;
        private BigDecimal shoulderToWaist;

        private BigDecimal frontWidth;
        private BigDecimal backWidth;

        private BigDecimal pantWaist;
        private BigDecimal pantHip;
        private BigDecimal thighRound;
        private BigDecimal kneeRound;
        private BigDecimal calfRound;
        private BigDecimal ankleRound;
        private BigDecimal crotchLength;
        private BigDecimal bottomOpening;

        private BigDecimal waistToHip;
        private BigDecimal flare;

        // Notes & Auditing
        private String postureNotes;
        private String shapeNotes;
        private String notes;
        private String recordedBy;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BodyMeasurementResponse {
        private UUID id;
        private String customerMobile;
        private String customerName;
        private String garmentType;
        private String measurementType;
        private Boolean isCurrent;
        private Integer version;
        private String unit;

        // 34 Dimensions
        private BigDecimal shoulder;
        private BigDecimal bust;
        private BigDecimal underBust;
        private BigDecimal waist;
        private BigDecimal hip;

        private BigDecimal blouseLength;
        private BigDecimal topLength;
        private BigDecimal fullLength;
        private BigDecimal skirtLength;
        private BigDecimal pantLength;

        private BigDecimal armhole;
        private BigDecimal upperArm;
        private BigDecimal sleeveLength;
        private BigDecimal sleeveRound;
        private BigDecimal elbowRound;
        private BigDecimal wristRound;

        private BigDecimal frontNeckDepth;
        private BigDecimal backNeckDepth;

        private BigDecimal bustPoint;
        private BigDecimal bustPointToBustPoint;
        private BigDecimal shoulderToBust;
        private BigDecimal shoulderToWaist;

        private BigDecimal frontWidth;
        private BigDecimal backWidth;

        private BigDecimal pantWaist;
        private BigDecimal pantHip;
        private BigDecimal thighRound;
        private BigDecimal kneeRound;
        private BigDecimal calfRound;
        private BigDecimal ankleRound;
        private BigDecimal crotchLength;
        private BigDecimal bottomOpening;

        private BigDecimal waistToHip;
        private BigDecimal flare;

        // Auditing
        private String postureNotes;
        private String shapeNotes;
        private String notes;
        private String recordedBy;
        private LocalDateTime recordedAt;
        private LocalDateTime updatedAt;

        public static BodyMeasurementResponse from(CustomerBodyMeasurement m) {
            if (m == null) return null;
            return BodyMeasurementResponse.builder()
                    .id(m.getId())
                    .customerMobile(m.getCustomerMobile())
                    .customerName(m.getCustomerName())
                    .garmentType(m.getGarmentType())
                    .measurementType(m.getMeasurementType())
                    .isCurrent(m.getIsCurrent())
                    .version(m.getVersion())
                    .unit(m.getUnit())
                    .shoulder(m.getShoulder())
                    .bust(m.getBust())
                    .underBust(m.getUnderBust())
                    .waist(m.getWaist())
                    .hip(m.getHip())
                    .blouseLength(m.getBlouseLength())
                    .topLength(m.getTopLength())
                    .fullLength(m.getFullLength())
                    .skirtLength(m.getSkirtLength())
                    .pantLength(m.getPantLength())
                    .armhole(m.getArmhole())
                    .upperArm(m.getUpperArm())
                    .sleeveLength(m.getSleeveLength())
                    .sleeveRound(m.getSleeveRound())
                    .elbowRound(m.getElbowRound())
                    .wristRound(m.getWristRound())
                    .frontNeckDepth(m.getFrontNeckDepth())
                    .backNeckDepth(m.getBackNeckDepth())
                    .bustPoint(m.getBustPoint())
                    .bustPointToBustPoint(m.getBustPointToBustPoint())
                    .shoulderToBust(m.getShoulderToBust())
                    .shoulderToWaist(m.getShoulderToWaist())
                    .frontWidth(m.getFrontWidth())
                    .backWidth(m.getBackWidth())
                    .pantWaist(m.getPantWaist())
                    .pantHip(m.getPantHip())
                    .thighRound(m.getThighRound())
                    .kneeRound(m.getKneeRound())
                    .calfRound(m.getCalfRound())
                    .ankleRound(m.getAnkleRound())
                    .crotchLength(m.getCrotchLength())
                    .bottomOpening(m.getBottomOpening())
                    .waistToHip(m.getWaistToHip())
                    .flare(m.getFlare())
                    .postureNotes(m.getPostureNotes())
                    .shapeNotes(m.getShapeNotes())
                    .notes(m.getNotes())
                    .recordedBy(m.getRecordedBy())
                    .recordedAt(m.getRecordedAt())
                    .updatedAt(m.getUpdatedAt())
                    .build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class GarmentMeasurementComparisonResponse {
        private String customerMobile;
        private String customerName;
        private String garmentType;
        private BodyMeasurementResponse current;
        private BodyMeasurementResponse old;
        private java.util.Map<String, String> variance;
    }
}

