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

    long countByCompanyIdAndStatus(UUID companyId, String status);

    @Query("""
        SELECT COUNT(ps) FROM ProductionStage ps
        JOIN ps.order o
        WHERE (:companyId IS NULL OR ps.companyId = :companyId)
          AND ps.status = :status
          AND (:branch IS NULL OR o.branch = :branch
               OR o.branch IN (SELECT b.branchCode FROM Branch b WHERE b.name = :branch)
               OR o.branch IN (SELECT b.name FROM Branch b WHERE b.branchCode = :branch))
        """)
    long countByCompanyIdAndStatusAndBranch(@org.springframework.data.repository.query.Param("companyId") UUID companyId,
                                            @org.springframework.data.repository.query.Param("status") String status,
                                            @org.springframework.data.repository.query.Param("branch") String branch);

    @Query("SELECT ps.stageName, COUNT(ps) FROM ProductionStage ps WHERE (:companyId IS NULL OR ps.companyId = :companyId) AND ps.status IN ('IN_PROGRESS', 'NOT_STARTED') GROUP BY ps.stageName ORDER BY MIN(ps.sortOrder)")
    List<Object[]> countActiveByStageName(@org.springframework.data.repository.query.Param("companyId") UUID companyId);

    @Query("""
        SELECT ps.stageName, COUNT(ps) FROM ProductionStage ps
        JOIN ps.order o
        WHERE (:companyId IS NULL OR ps.companyId = :companyId)
          AND ps.status IN ('IN_PROGRESS', 'NOT_STARTED')
          AND (:branch IS NULL OR o.branch = :branch
               OR o.branch IN (SELECT b.branchCode FROM Branch b WHERE b.name = :branch)
               OR o.branch IN (SELECT b.name FROM Branch b WHERE b.branchCode = :branch))
        GROUP BY ps.stageName ORDER BY MIN(ps.sortOrder)
        """)
    List<Object[]> countActiveByStageNameAndBranch(@org.springframework.data.repository.query.Param("companyId") UUID companyId,
                                                  @org.springframework.data.repository.query.Param("branch") String branch);

    @Query("SELECT COUNT(DISTINCT ps.order.id) FROM ProductionStage ps WHERE (:companyId IS NULL OR ps.companyId = :companyId) AND ps.status = 'IN_PROGRESS'")
    long countOrdersInProduction(@org.springframework.data.repository.query.Param("companyId") UUID companyId);

    @Query("""
        SELECT COUNT(DISTINCT ps.order.id) FROM ProductionStage ps
        JOIN ps.order o
        WHERE (:companyId IS NULL OR ps.companyId = :companyId)
          AND ps.status = 'IN_PROGRESS'
          AND (:branch IS NULL OR o.branch = :branch
               OR o.branch IN (SELECT b.branchCode FROM Branch b WHERE b.name = :branch)
               OR o.branch IN (SELECT b.name FROM Branch b WHERE b.branchCode = :branch))
        """)
    long countOrdersInProductionAndBranch(@org.springframework.data.repository.query.Param("companyId") UUID companyId,
                                         @org.springframework.data.repository.query.Param("branch") String branch);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM ProductionStage ps WHERE (:companyId IS NULL OR ps.companyId = :companyId) AND UPPER(TRIM(ps.stageName)) = UPPER(TRIM(:stageName))")
    void deleteByCompanyIdAndStageName(@org.springframework.data.repository.query.Param("companyId") UUID companyId, @org.springframework.data.repository.query.Param("stageName") String stageName);
}

