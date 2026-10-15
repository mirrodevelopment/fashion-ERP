package com.fashionerp.garment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GarmentRepository extends JpaRepository<Garment, UUID> {

    Optional<Garment> findByGarmentCodeIgnoreCase(String garmentCode);
    Optional<Garment> findByGarmentCodeIgnoreCaseAndCompanyId(String garmentCode, UUID companyId);

    java.util.List<Garment> findByOrderId(UUID orderId);
    java.util.List<Garment> findByOrderCode(String orderCode);

    @Query("""
        SELECT g FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(g.garmentCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.orderCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.designCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.specs) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:stage IS NULL OR :stage = '' OR :stage = 'all' OR
               LOWER(REPLACE(g.productionStage, '_', ' ')) = LOWER(REPLACE(:stage, '_', ' ')))
          AND (:status IS NULL OR :status = '' OR :status = 'all' OR
               LOWER(REPLACE(g.status, '_', ' ')) = LOWER(REPLACE(:status, '_', ' ')))
          AND (:garmentType IS NULL OR :garmentType = '' OR :garmentType = 'all' OR
               LOWER(g.garmentType) = LOWER(:garmentType))
          AND (:collectionName IS NULL OR :collectionName = '' OR :collectionName = 'all' OR
               LOWER(g.collectionName) = LOWER(:collectionName))
          AND (:priority IS NULL OR :priority = '' OR :priority = 'all' OR
               LOWER(g.priority) = LOWER(:priority))
          AND (:materialStatus IS NULL OR :materialStatus = '' OR :materialStatus = 'all' OR
               LOWER(g.materialStatus) = LOWER(:materialStatus))
          AND (:designer IS NULL OR :designer = '' OR :designer = 'all' OR
               LOWER(g.designer) = LOWER(:designer))
          AND (:branch IS NULL OR :branch = '' OR :branch = 'all' OR
               LOWER(g.branch) = LOWER(:branch))
        ORDER BY g.createdAt DESC
    """)
    Page<Garment> searchGarments(
            @Param("companyId") UUID companyId,
            @Param("search") String search,
            @Param("stage") String stage,
            @Param("status") String status,
            @Param("garmentType") String garmentType,
            @Param("collectionName") String collectionName,
            @Param("priority") String priority,
            @Param("materialStatus") String materialStatus,
            @Param("designer") String designer,
            @Param("branch") String branch,
            Pageable pageable
    );

    long countByCompanyId(UUID companyId);

    @Query("""
        SELECT COUNT(g) FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (
            UPPER(g.productionStage) = UPPER(:productionStage)
            OR UPPER(REPLACE(g.productionStage, '_', ' ')) = UPPER(REPLACE(:productionStage, '_', ' '))
            OR UPPER(REPLACE(g.productionStage, ' ', '_')) = UPPER(REPLACE(:productionStage, ' ', '_'))
            OR (UPPER(:productionStage) = 'READY' AND UPPER(g.productionStage) LIKE 'READY%')
            OR (UPPER(:productionStage) = 'QC' AND UPPER(g.productionStage) LIKE '%QC%')
          )
        """)
    long countByCompanyIdAndProductionStageIgnoreCase(@Param("companyId") UUID companyId, @Param("productionStage") String productionStage);

    @Query("""
        SELECT COUNT(g) FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (
            UPPER(g.status) = UPPER(:status)
            OR UPPER(REPLACE(g.status, '_', ' ')) = UPPER(REPLACE(:status, '_', ' '))
            OR UPPER(REPLACE(g.status, ' ', '_')) = UPPER(REPLACE(:status, ' ', '_'))
          )
        """)
    long countByCompanyIdAndStatusIgnoreCase(@Param("companyId") UUID companyId, @Param("status") String status);
}
