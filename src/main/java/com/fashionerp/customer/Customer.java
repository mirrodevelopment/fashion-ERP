package com.fashionerp.customer;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "customers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Customer {

    /** Primary Key is solely the Mobile Number */
    @Id
    @Column(name = "mobile_number", nullable = false, length = 30)
    private String mobileNumber;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(length = 100)
    @Builder.Default
    private String branch = "Main Branch";

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 20)
    private String salutation;

    @Column(name = "first_name", length = 75)
    private String firstName;

    @Column(name = "last_name", length = 75)
    private String lastName;

    @Column(length = 20)
    @Builder.Default
    private String gender = "Female";

    @Column(name = "alt_phone", length = 30)
    private String altPhone;

    @Column(length = 150)
    private String email;

    @Column(name = "instagram_handle", length = 100)
    private String instagramHandle;

    @Column(name = "preferred_channel", length = 30)
    @Builder.Default
    private String preferredChannel = "WhatsApp";

    @Column
    private LocalDate dob;

    @Column
    private LocalDate anniversary;

    @Column(length = 250)
    private String location;

    @Column(name = "street_address", columnDefinition = "TEXT")
    private String streetAddress;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 20)
    private String pincode;

    @Column(length = 250)
    private String landmark;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CustomerTier tier = CustomerTier.REGULAR;

    @Column(name = "total_spend", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalSpend = BigDecimal.ZERO;

    @Column(name = "balance", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "credit_limit", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Column(name = "favorite_garment", length = 200)
    private String favoriteGarment;

    @Column(name = "fit_preference", length = 50)
    private String fitPreference;

    @Column(name = "fabric_allergies", columnDefinition = "TEXT")
    private String fabricAllergies;

    @Column(name = "preferred_neck", length = 100)
    private String preferredNeck;

    @Column(name = "preferred_sleeve", length = 100)
    private String preferredSleeve;

    @Column(name = "preferred_occasions", length = 200)
    private String preferredOccasions;

    @Column(name = "delivery_preference", length = 100)
    private String deliveryPreference;

    @Column(name = "measurements_on_file", nullable = false)
    @Builder.Default
    private Boolean measurementsOnFile = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "customerMobile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CustomerMeasurement> measurements = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods for seamless compatibility
    public String getPhone() {
        return mobileNumber;
    }

    public void setPhone(String phone) {
        this.mobileNumber = phone;
    }

    public String getId() {
        return mobileNumber;
    }

    public String getCustomerCode() {
        return mobileNumber;
    }

    @PrePersist
    protected void assignTenant() {
        if (this.companyId == null) {
            this.companyId = com.fashionerp.common.TenantContext.getCompanyId();
        }
        if (this.branch == null || this.branch.isBlank()) {
            String b = com.fashionerp.common.TenantContext.getAssignedBranch();
            this.branch = (b != null && !b.isBlank() && !"ALL".equalsIgnoreCase(b.trim())) ? b.trim() : "Main Branch";
        }
    }
}
