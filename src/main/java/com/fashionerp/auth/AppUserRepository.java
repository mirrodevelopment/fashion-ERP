package com.fashionerp.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByUsernameAndActiveTrue(String username);
    boolean existsByUsername(String username);

    List<AppUser> findByCompanyId(UUID companyId);
    Optional<AppUser> findByIdAndCompanyId(UUID id, UUID companyId);

    /**
     * Counts active users with a given role within a specific company.
     * Used by UserManagementService to guard against deactivating the last active ADMIN.
     * Role is passed as a UserRole enum constant — no raw string comparison.
     */
    long countByCompanyIdAndRoleAndActiveTrue(UUID companyId, UserRole role);
    long countByRoleAndActiveTrue(UserRole role);

    long countByCompanyIdAndRoleInAndActiveTrue(UUID companyId, List<UserRole> roles);
    long countByRoleInAndActiveTrue(List<UserRole> roles);

    long countByCompanyId(UUID companyId);
    long countByCompanyIdAndActiveTrue(UUID companyId);
    long countByCompanyIdAndActiveFalse(UUID companyId);
    long countByCompanyIdAndStatus(UUID companyId, String status);
}


