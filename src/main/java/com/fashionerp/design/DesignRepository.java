package com.fashionerp.design;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DesignRepository extends JpaRepository<Design, UUID> {

    Optional<Design> findByDesignCode(String designCode);
    Optional<Design> findByDesignCodeAndCompanyId(String designCode, UUID companyId);
    Optional<Design> findByIdAndCompanyId(UUID id, UUID companyId);
    boolean existsByIdAndCompanyId(UUID id, UUID companyId);

    @Query(value = """
        SELECT d FROM Design d
        WHERE (:companyId IS NULL OR d.companyId = :companyId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(d.title)         LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.designCode)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.garmentType)   LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.designer)      LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.collection)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.occasion)      LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.tags)          LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.createdBy)     LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR :status = '' OR d.status = :status)
        """,
        countQuery = """
        SELECT COUNT(d) FROM Design d
        WHERE (:companyId IS NULL OR d.companyId = :companyId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(d.title)         LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.designCode)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.garmentType)   LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.designer)      LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.collection)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.occasion)      LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.tags)          LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.createdBy)     LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR :status = '' OR d.status = :status)
        """)
    Page<Design> search(@Param("companyId") UUID companyId,
                        @Param("search") String search,
                        @Param("status") String status,
                        Pageable pageable);

    long countByCompanyId(UUID companyId);

    long countByStatusAndCompanyId(String status, UUID companyId);

    long countByProductionStatusAndCompanyId(String productionStatus, UUID companyId);

    @Query("SELECT d.garmentType, COUNT(d) FROM Design d WHERE (:companyId IS NULL OR d.companyId = :companyId) GROUP BY d.garmentType ORDER BY COUNT(d) DESC")
    List<Object[]> countByGarmentType(@Param("companyId") UUID companyId);

    @Query("SELECT d.primaryFabric, COUNT(d) FROM Design d WHERE (:companyId IS NULL OR d.companyId = :companyId) AND d.primaryFabric IS NOT NULL AND d.primaryFabric != '' GROUP BY d.primaryFabric ORDER BY COUNT(d) DESC")
    List<Object[]> topFabrics(@Param("companyId") UUID companyId);

    @Query("SELECT COALESCE(SUM(d.timesUsed), 0) FROM Design d WHERE (:companyId IS NULL OR d.companyId = :companyId)")
    long sumTimesUsed(@Param("companyId") UUID companyId);

    @Query("SELECT COALESCE(AVG(d.suggestedPrice), 0) FROM Design d WHERE (:companyId IS NULL OR d.companyId = :companyId) AND d.suggestedPrice > 0")
    BigDecimal avgSuggestedPrice(@Param("companyId") UUID companyId);

    @Query("SELECT d.collection, COUNT(d) FROM Design d WHERE (:companyId IS NULL OR d.companyId = :companyId) AND d.collection IS NOT NULL GROUP BY d.collection ORDER BY COUNT(d) DESC")
    List<Object[]> topCollections(@Param("companyId") UUID companyId);

    @Query("SELECT DISTINCT d.collection FROM Design d WHERE (:companyId IS NULL OR d.companyId = :companyId) AND d.collection IS NOT NULL ORDER BY d.collection")
    List<String> distinctCollections(@Param("companyId") UUID companyId);

    @Query("SELECT DISTINCT d.occasion FROM Design d WHERE (:companyId IS NULL OR d.companyId = :companyId) AND d.occasion IS NOT NULL ORDER BY d.occasion")
    List<String> distinctOccasions(@Param("companyId") UUID companyId);

    List<Design> findByCompanyIdAndCollectionIgnoreCase(UUID companyId, String collection);

    @Query("SELECT d FROM Design d WHERE (:companyId IS NULL OR d.companyId = :companyId) AND LOWER(d.collection) IN :collections")
    List<Design> findByCollectionInIgnoreCase(@Param("companyId") UUID companyId, @Param("collections") java.util.Collection<String> collections);

    long countByCompanyIdAndCollectionIgnoreCase(UUID companyId, String collection);
}
