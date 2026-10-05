package com.fashionerp.production;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductionStageRepository extends JpaRepository<ProductionStage, UUID> {

    List<ProductionStage> findByOrderIdOrderBySortOrderAsc(UUID orderId);
    List<ProductionStage> findByOrderIdAndCompanyIdOrderBySortOrderAsc(UUID orderId, UUID companyId);
    List<ProductionStage> findByCompanyIdOrderBySortOrderAsc(UUID companyId);
    java.util.Optional<ProductionStage> findByIdAndCompanyId(UUID id, UUID companyId);

    long countByStatus(String status);
    long countByCompanyIdAndStatus(UUID companyId, String status);

    @Query("SELECT ps.stageName, COUNT(ps) FROM ProductionStage ps WHERE (:companyId IS NULL OR ps.companyId = :companyId) AND ps.status IN ('IN_PROGRESS', 'NOT_STARTED') GROUP BY ps.stageName ORDER BY MIN(ps.sortOrder)")
    List<Object[]> countActiveByStageName(@org.springframework.data.repository.query.Param("companyId") UUID companyId);

    @Query("SELECT ps.stageName, COUNT(ps) FROM ProductionStage ps WHERE ps.status IN ('IN_PROGRESS', 'NOT_STARTED') GROUP BY ps.stageName ORDER BY MIN(ps.sortOrder)")
    List<Object[]> countActiveByStageName();

    @Query("SELECT COUNT(DISTINCT ps.order.id) FROM ProductionStage ps WHERE (:companyId IS NULL OR ps.companyId = :companyId) AND ps.status = 'IN_PROGRESS'")
    long countOrdersInProduction(@org.springframework.data.repository.query.Param("companyId") UUID companyId);

    @Query("SELECT COUNT(DISTINCT ps.order.id) FROM ProductionStage ps WHERE ps.status = 'IN_PROGRESS'")
    long countOrdersInProduction();

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM ProductionStage ps WHERE (:companyId IS NULL OR ps.companyId = :companyId) AND UPPER(TRIM(ps.stageName)) = UPPER(TRIM(:stageName))")
    void deleteByCompanyIdAndStageName(@org.springframework.data.repository.query.Param("companyId") UUID companyId, @org.springframework.data.repository.query.Param("stageName") String stageName);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM ProductionStage ps WHERE UPPER(TRIM(ps.stageName)) = UPPER(TRIM(:stageName))")
    void deleteByStageName(@org.springframework.data.repository.query.Param("stageName") String stageName);
}

