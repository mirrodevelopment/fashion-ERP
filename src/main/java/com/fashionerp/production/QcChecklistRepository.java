package com.fashionerp.production;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QcChecklistRepository extends JpaRepository<QcChecklist, UUID> {

    List<QcChecklist> findByOrderIdOrderBySortOrderAsc(UUID orderId);

    long countByResult(String result);

    @Query("SELECT COUNT(DISTINCT qc.order.id) FROM QcChecklist qc WHERE qc.result = 'PENDING'")
    long countOrdersAwaitingQc();
}
