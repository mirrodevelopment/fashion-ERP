package com.fashionerp.collection;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, UUID> {

    Optional<Collection> findByCode(String code);
    Optional<Collection> findByCodeAndCompanyId(String code, UUID companyId);

    Optional<Collection> findByNameIgnoreCase(String name);
    Optional<Collection> findByNameIgnoreCaseAndCompanyId(String name, UUID companyId);
    Optional<Collection> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByCode(String code);
    boolean existsByCodeAndCompanyId(String code, UUID companyId);

    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndCompanyId(String name, UUID companyId);

    List<Collection> findByCompanyIdAndIsFeaturedTrueOrderByCreatedAtDesc(UUID companyId);

    List<Collection> findByCompanyIdAndStatusIgnoreCaseOrderByCreatedAtDesc(UUID companyId, String status);

    @Query(value = """
        SELECT c FROM Collection c
        WHERE (:companyId IS NULL OR c.companyId = :companyId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(c.name)        LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.code)        LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.subtitle)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.designer)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.season)      LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR :status = '' OR UPPER(c.status) = UPPER(:status))
          AND (:season IS NULL OR :season = '' OR LOWER(c.season) LIKE LOWER(CONCAT('%', :season, '%')))
          AND (:year IS NULL OR c.year = :year)
          AND (:designer IS NULL OR :designer = '' OR LOWER(c.designer) LIKE LOWER(CONCAT('%', :designer, '%')))
          AND (:branch IS NULL OR :branch = '' OR LOWER(c.branch) LIKE LOWER(CONCAT('%', :branch, '%')))
        ORDER BY c.code ASC
        """,
        countQuery = """
        SELECT COUNT(c) FROM Collection c
        WHERE (:companyId IS NULL OR c.companyId = :companyId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(c.name)        LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.code)        LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.subtitle)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.designer)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.season)      LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR :status = '' OR UPPER(c.status) = UPPER(:status))
          AND (:season IS NULL OR :season = '' OR LOWER(c.season) LIKE LOWER(CONCAT('%', :season, '%')))
          AND (:year IS NULL OR c.year = :year)
          AND (:designer IS NULL OR :designer = '' OR LOWER(c.designer) LIKE LOWER(CONCAT('%', :designer, '%')))
          AND (:branch IS NULL OR :branch = '' OR LOWER(c.branch) LIKE LOWER(CONCAT('%', :branch, '%')))
        """)
    Page<Collection> search(
        @Param("companyId") UUID companyId,
        @Param("search") String search,
        @Param("status") String status,
        @Param("season") String season,
        @Param("year") Integer year,
        @Param("designer") String designer,
        @Param("branch") String branch,
        Pageable pageable
    );

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatusIgnoreCase(UUID companyId, String status);

    long countByCompanyIdAndSeasonIgnoreCase(UUID companyId, String season);

    @Query(value = """
        SELECT season FROM collections 
        WHERE (:companyId IS NULL OR company_id = :companyId)
          AND status = 'ACTIVE' AND season IS NOT NULL AND TRIM(season) <> ''
        ORDER BY created_at DESC 
        LIMIT 1
        """, nativeQuery = true)
    Optional<String> findCurrentSeasonName(@Param("companyId") UUID companyId);
}

