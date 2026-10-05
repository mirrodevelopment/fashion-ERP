package com.fashionerp.profile;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

public class ProfileDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private UUID userId;
        private UUID profileId;
        private String username;
        private String fullName;
        private String email;
        private String phone;
        private String role;
        private String designation;
        private String displayTitle;
        private String department;
        private String bio;
        private String assignedBranch;
        private String avatarUrl;
        private String clearanceLevel;
        private String systemRoleLabel;
        private String privilegesSummary;
        private String memberSince;
        private String tenureTier;
        private String securityStatus;
        private String sessionLifetime;
        private String emergencyContact;
        private String workShift;
        private Boolean active;
        private LocalDateTime lastLogin;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateRequest {
        private String fullName;
        private String email;
        private String phone;
        private String designation;
        private String displayTitle;
        private String department;
        private String bio;
        private String assignedBranch;
        private String emergencyContact;
        private String workShift;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
        private String confirmPassword;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AvatarUploadResponse {
        private String avatarUrl;
        private String message;
    }
}
