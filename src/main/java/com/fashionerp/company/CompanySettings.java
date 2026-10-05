package com.fashionerp.company;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "company_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(name = "short_name", nullable = false, length = 60)
    private String shortName;

    @Column(length = 255)
    private String tagline;

    @Column(name = "owner_name", length = 150)
    private String ownerName;

    @Column(name = "business_type", length = 100)
    private String businessType;

    @Column(length = 20)
    private String gstin;

    @Column(name = "pan_number", length = 15)
    private String panNumber;

    @Column(name = "primary_phone", length = 20)
    private String primaryPhone;

    @Column(length = 20)
    private String whatsapp;

    @Column(length = 150)
    private String email;

    @Column(length = 255)
    private String website;

    @Column(name = "street_address", length = 255)
    private String streetAddress;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(name = "pin_code", length = 10)
    private String pinCode;

    @Column(length = 100)
    private String country;

    @Column(name = "logo_base64", columnDefinition = "TEXT")
    private String logoBase64;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
