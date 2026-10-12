package com.fashionerp.auth;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserAccessLogRepository extends JpaRepository<UserAccessLog, UUID> {

    List<UserAccessLog> findByCompanyIdAndUserIdOrderByCreatedAtDesc(UUID companyId, UUID userId);

    List<UserAccessLog> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<UserAccessLog> findByCompanyIdOrderByCreatedAtDesc(UUID companyId, Pageable pageable);

    @Query("""
        SELECT l FROM UserAccessLog l
        WHERE l.companyId = :companyId
          AND (:userId IS NULL OR l.userId = :userId)
          AND (:actionType IS NULL OR :actionType = '' OR l.actionType = :actionType)
          AND (:search IS NULL OR :search = '' OR
               LOWER(l.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR
               LOWER(l.location) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR
               LOWER(l.clientInfo) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        ORDER BY l.createdAt DESC
        """)
    Page<UserAccessLog> searchLogs(
            @Param("companyId") UUID companyId,
            @Param("userId") UUID userId,
            @Param("actionType") String actionType,
            @Param("search") String search,
            Pageable pageable
    );

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndCreatedAtAfter(UUID companyId, LocalDateTime after);

    long countByCompanyIdAndActionType(UUID companyId, String actionType);

    long countByCompanyIdAndActionTypeAndCreatedAtAfter(UUID companyId, String actionType, LocalDateTime after);
}
