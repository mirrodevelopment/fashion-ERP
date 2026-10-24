package com.fashionerp.profile;

import com.fashionerp.auth.AppUser;
import com.fashionerp.auth.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final AppUserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ProfileDto.Response getProfile(String username) {
        AppUser user = findUser(username);
        UserProfile profile = getOrCreateProfile(user);
        return mapToDto(profile, user);
    }

    @Transactional
    public ProfileDto.Response updateProfile(String username, ProfileDto.UpdateRequest req) {
        AppUser user = findUser(username);
        UserProfile profile = getOrCreateProfile(user);

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            profile.setFullName(req.getFullName().trim());
            user.setFullName(req.getFullName().trim());
        }
        if (req.getEmail() != null) {
            profile.setEmail(req.getEmail().trim());
            user.setEmail(req.getEmail().trim());
        }
        if (req.getPhone() != null) {
            profile.setPhone(req.getPhone().trim());
            user.setPhone(req.getPhone().trim());
        }
        String title = req.getDisplayTitle() != null ? req.getDisplayTitle() : req.getDesignation();
        if (title != null) {
            profile.setDisplayTitle(title.trim());
            user.setDesignation(title.trim());
        }
        if (req.getDepartment() != null) {
            profile.setDepartment(req.getDepartment().trim());
            user.setDepartment(req.getDepartment().trim());
        }
        if (req.getBio() != null) {
            profile.setBio(req.getBio().trim());
            user.setBio(req.getBio().trim());
        }
        if (req.getAssignedBranch() != null) {
            profile.setAssignedBranch(req.getAssignedBranch().trim());
            user.setAssignedBranch(req.getAssignedBranch().trim());
        }
        if (req.getEmergencyContact() != null) {
            profile.setEmergencyContact(req.getEmergencyContact().trim());
        }
        if (req.getWorkShift() != null) {
            profile.setWorkShift(req.getWorkShift().trim());
        }

        profile.setUpdatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        UserProfile savedProfile = userProfileRepository.save(profile);
        userRepository.save(user);

        log.info("User profile updated successfully in user_profiles table for user: {}", username);
        return mapToDto(savedProfile, user);
    }

    @Transactional
    public ProfileDto.AvatarUploadResponse updateAvatar(String username, String avatarUrl) {
        AppUser user = findUser(username);
        UserProfile profile = getOrCreateProfile(user);

        profile.setAvatarUrl(avatarUrl);
        profile.setUpdatedAt(LocalDateTime.now());
        userProfileRepository.save(profile);

        user.setAvatarUrl(avatarUrl);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Avatar updated successfully in user_profiles table for user: {}", username);

        return ProfileDto.AvatarUploadResponse.builder()
                .avatarUrl(avatarUrl)
                .message("Avatar uploaded and updated in user_profiles table successfully.")
                .build();
    }

    @Transactional
    public void changePassword(String username, ProfileDto.ChangePasswordRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Password change request cannot be empty.");
        }
        if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
            throw new IllegalArgumentException("Current password is required.");
        }
        if (req.getNewPassword() == null || req.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match.");
        }

        AppUser user = findUser(username);

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", username);
    }

    private AppUser findUser(String username) {
        return userRepository.findByUsernameAndActiveTrue(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    private UserProfile getOrCreateProfile(AppUser user) {
        UUID companyId = user.getCompanyId() != null ? user.getCompanyId() : com.fashionerp.common.TenantContext.getCompanyId();
        return userProfileRepository.findByUserIdAndCompanyId(user.getId(), companyId)
                .or(() -> userProfileRepository.findByUserId(user.getId()))
                .orElseGet(() -> {
                    String roleStr = user.getRole() != null ? user.getRole().name() : "";
                    String joinDate = user.getCreatedAt() != null
                            ? user.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM yyyy"))
                            : "";
                    String encType = user.getPasswordHash() != null && user.getPasswordHash().startsWith("$2") ? "BCrypt" : "";

                    UserProfile np = UserProfile.builder()
                            .companyId(companyId)
                            .user(user)
                            .fullName(user.getFullName() != null && !user.getFullName().isBlank()
                                    ? user.getFullName().trim()
                                    : user.getUsername())
                            .displayTitle(user.getDesignation())
                            .department(user.getDepartment())
                            .email(user.getEmail())
                            .phone(user.getPhone())
                            .assignedBranch(user.getAssignedBranch())
                            .bio(user.getBio())
                            .avatarUrl(user.getAvatarUrl())
                            .clearanceLevel(roleStr)
                            .systemRoleLabel(roleStr)
                            .privilegesSummary(roleStr)
                            .memberSince(joinDate)
                            .tenureTier("")
                            .securityStatus(encType)
                            .sessionLifetime("")
                            .emergencyContact(null)
                            .workShift(null)
                            .build();
                    return userProfileRepository.save(np);
                });
    }

    private ProfileDto.Response mapToDto(UserProfile p, AppUser u) {
        String roleStr = u.getRole() != null ? u.getRole().name() : "";
        String joinDate = u.getCreatedAt() != null ? u.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM yyyy")) : "";
        String enc = u.getPasswordHash() != null && u.getPasswordHash().startsWith("$2") ? "BCrypt" : "";

        return ProfileDto.Response.builder()
                .userId(u.getId())
                .profileId(p.getId())
                .username(u.getUsername())
                .fullName(p.getFullName() != null && !p.getFullName().isBlank() ? p.getFullName() : (u.getFullName() != null ? u.getFullName() : u.getUsername()))
                .email(p.getEmail() != null ? p.getEmail() : (u.getEmail() != null ? u.getEmail() : ""))
                .phone(p.getPhone() != null ? p.getPhone() : (u.getPhone() != null ? u.getPhone() : ""))
                .role(roleStr)
                .designation(p.getDisplayTitle() != null ? p.getDisplayTitle() : (u.getDesignation() != null ? u.getDesignation() : ""))
                .displayTitle(p.getDisplayTitle() != null ? p.getDisplayTitle() : (u.getDesignation() != null ? u.getDesignation() : ""))
                .department(p.getDepartment() != null ? p.getDepartment() : (u.getDepartment() != null ? u.getDepartment() : ""))
                .bio(p.getBio() != null ? p.getBio() : (u.getBio() != null ? u.getBio() : ""))
                .assignedBranch(p.getAssignedBranch() != null ? p.getAssignedBranch() : (u.getAssignedBranch() != null ? u.getAssignedBranch() : ""))
                .avatarUrl(p.getAvatarUrl() != null ? p.getAvatarUrl() : (u.getAvatarUrl() != null ? u.getAvatarUrl() : ""))
                .clearanceLevel(p.getClearanceLevel() != null && !p.getClearanceLevel().isBlank() ? p.getClearanceLevel() : roleStr)
                .systemRoleLabel(p.getSystemRoleLabel() != null && !p.getSystemRoleLabel().isBlank() ? p.getSystemRoleLabel() : roleStr)
                .privilegesSummary(p.getPrivilegesSummary() != null && !p.getPrivilegesSummary().isBlank() ? p.getPrivilegesSummary() : roleStr)
                .memberSince(p.getMemberSince() != null && !p.getMemberSince().isBlank() ? p.getMemberSince() : joinDate)
                .tenureTier(p.getTenureTier() != null ? p.getTenureTier() : "")
                .securityStatus(p.getSecurityStatus() != null && !p.getSecurityStatus().isBlank() ? p.getSecurityStatus() : enc)
                .sessionLifetime(p.getSessionLifetime() != null ? p.getSessionLifetime() : "")
                .emergencyContact(p.getEmergencyContact() != null ? p.getEmergencyContact() : "")
                .workShift(p.getWorkShift() != null ? p.getWorkShift() : "")
                .active(u.getActive())
                .lastLogin(u.getLastLogin())
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt() : u.getCreatedAt())
                .updatedAt(p.getUpdatedAt() != null ? p.getUpdatedAt() : u.getUpdatedAt())
                .build();
    }
}
