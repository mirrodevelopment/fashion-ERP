package com.fashionerp.auth;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

public class AuthDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        private String username;
        private String password;
    }

    /**
     * Payload accepted by POST /api/v1/auth/register.
     * Creates the first (owner) ADMIN account for a new boutique installation.
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        private String username;   // used as login ID (email or short name)
        private String password;
        private String fullName;
        private String email;      // optional extra email field (can equal username)
        private String phone;      // optional
    }

    /**
     * Payload accepted by POST /api/v1/auth/onboard.
     * Atomically creates both the first admin account and the boutique company settings.
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class OnboardRequest {
        // Admin user account
        private String fullName;
        private String username;
        private String password;
        private String userPhone;

        // Company settings
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
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LoginResponse {
        private String token;
        private UUID userId;
        private String username;
        private String fullName;
        private String role;
        private LocalDateTime expiresAt;
        /** true when company_settings table is empty — frontend should redirect to setup wizard */
        private boolean needsCompanySetup;
    }
}

