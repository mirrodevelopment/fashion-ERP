package com.fashionerp.profile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /** GET /api/v1/profile - Get currently authenticated user profile */
    @GetMapping
    public ResponseEntity<ProfileDto.Response> getProfile(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(profileService.getProfile(username));
    }

    /** PUT /api/v1/profile - Update user profile information */
    @PutMapping
    public ResponseEntity<ProfileDto.Response> updateProfile(
            @RequestBody ProfileDto.UpdateRequest req,
            Authentication auth
    ) {
        String username = auth.getName();
        return ResponseEntity.ok(profileService.updateProfile(username, req));
    }

    /** POST /api/v1/profile/avatar - Upload profile avatar image (multipart up to 20MB) */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileDto.AvatarUploadResponse> uploadAvatarMultipart(
            @RequestParam("file") MultipartFile file,
            Authentication auth
    ) throws IOException {
        String username = auth.getName();
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty.");
        }
        if (file.getSize() > 20 * 1024 * 1024) {
            throw new IllegalArgumentException("Avatar file size exceeds the 20 MB limit.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files (JPEG, PNG, WEBP, GIF, SVG) are allowed.");
        }

        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
        String dataUri = "data:" + contentType + ";base64," + base64;
        return ResponseEntity.ok(profileService.updateAvatar(username, dataUri));
    }

    /** POST /api/v1/profile/avatar-base64 - Upload avatar as JSON payload */
    @PostMapping(value = "/avatar-base64", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProfileDto.AvatarUploadResponse> uploadAvatarBase64(
            @RequestBody Map<String, String> body,
            Authentication auth
    ) {
        String username = auth.getName();
        String dataUri = body.get("avatarBase64");
        if (dataUri == null || dataUri.isBlank()) {
            throw new IllegalArgumentException("Avatar image payload is empty.");
        }
        return ResponseEntity.ok(profileService.updateAvatar(username, dataUri));
    }

    /** POST /api/v1/profile/change-password - Change user password */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody ProfileDto.ChangePasswordRequest req,
            Authentication auth
    ) {
        String username = auth.getName();
        profileService.changePassword(username, req);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }
}
