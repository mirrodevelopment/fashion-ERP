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
}
