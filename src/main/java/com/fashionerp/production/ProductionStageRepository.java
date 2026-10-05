package com.fashionerp.production;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductionStageRepository extends JpaRepository<ProductionStage, UUID> {

    List<ProductionStage> findByOrderIdOrderBySortOrderAsc(UUID orderId);

    long countByStatus(String status);

    @Query("SELECT ps.stageName, COUNT(ps) FROM ProductionStage ps WHERE ps.status IN ('IN_PROGRESS', 'NOT_STARTED') GROUP BY ps.stageName ORDER BY MIN(ps.sortOrder)")
    List<Object[]> countActiveByStageName();

    @Query("SELECT COUNT(DISTINCT ps.order.id) FROM ProductionStage ps WHERE ps.status = 'IN_PROGRESS'")
    long countOrdersInProduction();

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM ProductionStage ps WHERE UPPER(TRIM(ps.stageName)) = UPPER(TRIM(:stageName))")
    void deleteByStageName(@org.springframework.data.repository.query.Param("stageName") String stageName);
}
