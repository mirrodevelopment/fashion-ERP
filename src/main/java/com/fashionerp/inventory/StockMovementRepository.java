package com.fashionerp.inventory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    /** All movements for a specific inventory item, newest first */
    List<StockMovement> findByItemIdOrderByMovedAtDesc(UUID itemId);

    List<StockMovement> findByCompanyIdAndItemIdOrderByMovedAtDesc(UUID companyId, UUID itemId);

    /** Paginated list of all movements across all items */
    Page<StockMovement> findAllByOrderByMovedAtDesc(Pageable pageable);

    Page<StockMovement> findByCompanyIdOrderByMovedAtDesc(UUID companyId, Pageable pageable);
}
