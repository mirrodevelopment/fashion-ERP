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

    @Query(value = """
        SELECT d FROM Design d
        WHERE (:search IS NULL OR :search = '' OR
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
        WHERE (:search IS NULL OR :search = '' OR
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
    Page<Design> search(@Param("search") String search,
                        @Param("status") String status,
                        Pageable pageable);

    long countByStatus(String status);

    @Query("SELECT d.garmentType, COUNT(d) FROM Design d GROUP BY d.garmentType ORDER BY COUNT(d) DESC")
    List<Object[]> countByGarmentType();

    @Query("SELECT COALESCE(SUM(d.timesUsed), 0) FROM Design d")
    long sumTimesUsed();

    @Query("SELECT COALESCE(AVG(d.suggestedPrice), 0) FROM Design d WHERE d.suggestedPrice > 0")
    BigDecimal avgSuggestedPrice();

    @Query("SELECT d.collection, COUNT(d) FROM Design d WHERE d.collection IS NOT NULL GROUP BY d.collection ORDER BY COUNT(d) DESC")
    List<Object[]> topCollections();

    @Query("SELECT DISTINCT d.collection FROM Design d WHERE d.collection IS NOT NULL ORDER BY d.collection")
    List<String> distinctCollections();

    @Query("SELECT DISTINCT d.occasion FROM Design d WHERE d.occasion IS NOT NULL ORDER BY d.occasion")
    List<String> distinctOccasions();
}
