package com.fashionerp.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserDelegationRepository extends JpaRepository<UserDelegation, UUID> {
    List<UserDelegation> findByCompanyIdAndUserIdOrderByValidUntilAsc(UUID companyId, UUID userId);
    List<UserDelegation> findByUserIdOrderByValidUntilAsc(UUID userId);
}
