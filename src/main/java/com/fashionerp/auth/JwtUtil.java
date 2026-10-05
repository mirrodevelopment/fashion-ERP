package com.fashionerp.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private static final long EXPIRY_MS = 24 * 60 * 60 * 1000L; // 24 hours
    private final SecretKey key;

    public JwtUtil(@Value("${jwt.secret:HauloB0ut1queERPSecretKey2026XYZ!@#}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(UUID userId, String username, String role, UUID companyId, String companyName) {
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
            } catch (IllegalArgumentException ignored) {}
        }
        return null;
    }

    public String getCompanyName(String token) {
        Claims claims = parseToken(token);
        return claims.get("companyName", String.class);
    }
}
