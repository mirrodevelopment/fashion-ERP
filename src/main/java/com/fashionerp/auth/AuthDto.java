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

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LoginResponse {
        private String token;
        private UUID userId;
        private String username;
        private String fullName;
        private String role;
        private LocalDateTime expiresAt;
    }
}
