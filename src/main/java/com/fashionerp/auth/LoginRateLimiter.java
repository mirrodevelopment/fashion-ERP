package com.fashionerp.auth;

import com.fashionerp.common.RateLimitExceededException;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 minutes

    private static class AttemptRecord {
        int attempts;
        Instant lastAttempt;
        Instant blockedUntil;

        AttemptRecord() {
            this.attempts = 1;
            this.lastAttempt = Instant.now();
            this.blockedUntil = null;
        }
    }

    private final Map<String, AttemptRecord> records = new ConcurrentHashMap<>();

    /**
     * Checks if the given identifier (IP or username:IP) is currently blocked.
     * Throws RateLimitExceededException if blocked.
     */
    public void checkBlocked(String identifier) {
        if (identifier == null || identifier.isBlank()) return;
        
        cleanupExpired();

        AttemptRecord record = records.get(identifier);
        if (record != null && record.blockedUntil != null) {
            Instant now = Instant.now();
            if (now.isBefore(record.blockedUntil)) {
                long remainingSeconds = java.time.Duration.between(now, record.blockedUntil).getSeconds();
                long remainingMinutes = (remainingSeconds + 59) / 60;
                throw new RateLimitExceededException(
                        "Too many failed login attempts. Account temporarily locked. Please try again in " + remainingMinutes + " minute(s)."
                );
            } else {
                // Lockout period has elapsed; clear record
                records.remove(identifier);
            }
        }
    }

    /**
     * Records a failed attempt for the given identifier.
     * If the maximum attempts threshold is reached, locks the identifier.
     */
    public void recordFailedAttempt(String identifier) {
        if (identifier == null || identifier.isBlank()) return;

        records.compute(identifier, (key, existing) -> {
            Instant now = Instant.now();
            if (existing == null) {
                return new AttemptRecord();
            }

            // If existing attempt was more than the lockout duration ago, reset count
            if (java.time.Duration.between(existing.lastAttempt, now).getSeconds() > LOCKOUT_DURATION_SECONDS) {
                existing.attempts = 1;
                existing.blockedUntil = null;
            } else {
                existing.attempts++;
            }
            existing.lastAttempt = now;

            if (existing.attempts >= MAX_FAILED_ATTEMPTS) {
                existing.blockedUntil = now.plusSeconds(LOCKOUT_DURATION_SECONDS);
            }
            return existing;
        });
    }

    /**
     * Clears failed attempt tracking upon successful login.
     */
    public void recordSuccess(String identifier) {
        if (identifier == null || identifier.isBlank()) return;
        records.remove(identifier);
    }

    private void cleanupExpired() {
        Instant threshold = Instant.now().minusSeconds(LOCKOUT_DURATION_SECONDS * 2);
        records.entrySet().removeIf(entry -> {
            AttemptRecord rec = entry.getValue();
            return rec.lastAttempt.isBefore(threshold) && 
                   (rec.blockedUntil == null || Instant.now().isAfter(rec.blockedUntil));
        });
    }
}
