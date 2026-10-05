package com.fashionerp.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByUsernameAndActiveTrue(String username);
    boolean existsByUsername(String username);

    /**
     * Counts active users with a given role.
     * Used by UserManagementService to guard against deactivating the last active ADMIN.
     * Role is passed as a UserRole enum constant — no raw string comparison.
     */
    long countByRoleAndActiveTrue(UserRole role);
}
