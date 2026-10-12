package com.fashionerp.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserActiveSessionRepository extends JpaRepository<UserActiveSession, UUID> {
    List<UserActiveSession> findByCompanyIdAndUserIdOrderByLastSeenAtDesc(UUID companyId, UUID userId);
    List<UserActiveSession> findByUserIdOrderByLastSeenAtDesc(UUID userId);
}
