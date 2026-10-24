package com.fashionerp.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private static final long EXPIRY_MS = 24 * 60 * 60 * 1000L; // 24 hours
    private final SecretKey key;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException(
                "[SECURITY] JWT secret must be at least 32 characters. " +
                "Set the JWT_SECRET environment variable to a strong random value.");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UUID userId, String username, String role, UUID companyId, String companyName) {
        return generateToken(userId, username, role, companyId, companyName, null, null);
    }

    public String generateToken(UUID userId, String username, String role, UUID companyId, String companyName,
            String assignedBranch) {
        return generateToken(userId, username, role, companyId, companyName, assignedBranch, null);
    }

    public String generateToken(UUID userId, String username, String role, UUID companyId, String companyName,
            String assignedBranch, java.util.List<String> allowedBranches) {
        if (userId == null || username == null || role == null) {
            throw new IllegalArgumentException("userId, username, and role must not be null");
        }

        var builder = Jwts.builder()
                .subject(username)
                .claim("userId", userId.toString())
                .claim("role", role);

        if (companyId != null) {
            builder.claim("companyId", companyId.toString());
        }
        if (companyName != null && !companyName.isBlank()) {
            builder.claim("companyName", companyName);
        }
        if (assignedBranch != null && !assignedBranch.isBlank()) {
            builder.claim("assignedBranch", assignedBranch.trim());
        }
        if (allowedBranches != null && !allowedBranches.isEmpty()) {
            builder.claim("allowedBranches", allowedBranches);
        }

        return builder
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .signWith(key)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUsername(String token) {
        return parseToken(token).getSubject();
    }

    public String getRole(String token) {
        return parseToken(token).get("role", String.class);
    }

    public UUID getCompanyId(String token) {
        Claims claims = parseToken(token);
        String cid = claims.get("companyId", String.class);
        if (cid != null && !cid.isBlank()) {
            try {
                return UUID.fromString(cid);
            } catch (IllegalArgumentException ignored) {
            }
        }
        return null;
    }

    public String getCompanyName(String token) {
        Claims claims = parseToken(token);
        return claims.get("companyName", String.class);
    }

    public String getAssignedBranch(String token) {
        Claims claims = parseToken(token);
        return claims.get("assignedBranch", String.class);
    }

    public UUID getUserId(String token) {
        Claims claims = parseToken(token);
        String uid = claims.get("userId", String.class);
        if (uid != null && !uid.isBlank()) {
            try {
                return UUID.fromString(uid);
            } catch (IllegalArgumentException ignored) {
            }
        }
        return null;
    }

    public java.util.List<String> getAllowedBranches(String token) {
        Claims claims = parseToken(token);
        Object obj = claims.get("allowedBranches");
        if (obj instanceof java.util.List<?> list) {
            java.util.List<String> result = new java.util.ArrayList<>();
            for (Object item : list) {
                if (item != null) {
                    result.add(item.toString());
                }
            }
            return result;
        }
        return java.util.Collections.emptyList();
    }
}
