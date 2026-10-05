package com.fashionerp.inventory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, UUID> {
    Optional<InventoryItem> findByItemCode(String itemCode);
    Optional<InventoryItem> findByItemCodeAndCompanyId(String itemCode, UUID companyId);
    boolean existsByItemCode(String itemCode);
    boolean existsByItemCodeAndCompanyId(String itemCode, UUID companyId);

    @Query("""
        SELECT i FROM InventoryItem i
        WHERE (:companyId IS NULL OR i.companyId = :companyId)
          AND (:branch IS NULL OR i.branch = :branch OR i.branch IS NULL)
          AND (:search IS NULL OR :search = '' OR
               LOWER(i.name)     LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(i.itemCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(i.category) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:category IS NULL OR :category = '' OR LOWER(i.category) = LOWER(:category))
          AND (:status IS NULL OR i.status = :status)
        ORDER BY i.category, i.name
        """)
    Page<InventoryItem> search(@Param("companyId") UUID companyId,
                               @Param("branch") String branch,
                               @Param("search") String search,
                               @Param("category") String category,
                               @Param("status") InventoryStatus status,
                               Pageable pageable);

    @Query("""
        SELECT i FROM InventoryItem i
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(i.name)     LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(i.itemCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(i.category) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:category IS NULL OR :category = '' OR LOWER(i.category) = LOWER(:category))
          AND (:status IS NULL OR i.status = :status)
        ORDER BY i.category, i.name
        """)
    Page<InventoryItem> search(@Param("search") String search,
                               @Param("category") String category,
                               @Param("status") InventoryStatus status,
                               Pageable pageable);

    long countByStatus(InventoryStatus status);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, InventoryStatus status);

    @Query("SELECT i FROM InventoryItem i WHERE (:companyId IS NULL OR i.companyId = :companyId) AND LOWER(i.category) = 'fabric'")
    java.util.List<InventoryItem> findFabrics(@Param("companyId") UUID companyId);

    @Query("SELECT i FROM InventoryItem i WHERE LOWER(i.category) = 'fabric'")
    java.util.List<InventoryItem> findFabrics();
}
