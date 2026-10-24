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

    boolean existsByGarmentCode(String garmentCode);
    boolean existsByGarmentCodeAndCompanyId(String garmentCode, UUID companyId);
    long countByCompanyId(UUID companyId);

    java.util.List<Garment> findByOrderId(UUID orderId);
    java.util.List<Garment> findByOrderCode(String orderCode);

    @Query("""
        SELECT g FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (:catalogOnly IS NULL OR :catalogOnly = false OR (g.orderId IS NULL AND (g.orderCode IS NULL OR TRIM(g.orderCode) = '')))
          AND (:search IS NULL OR :search = '' OR
               LOWER(g.garmentCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.designCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.specs) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(COALESCE(g.primaryFabric, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(COALESCE(g.embroideryType, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(COALESCE(g.colorName, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(COALESCE(g.designer, '')) LIKE LOWER(CONCAT('%', :search, '%')))
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
          AND (:fabric IS NULL OR :fabric = '' OR :fabric = 'all' OR
               LOWER(COALESCE(g.primaryFabric, '')) LIKE LOWER(CONCAT('%', :fabric, '%')))
          AND (:designer IS NULL OR :designer = '' OR :designer = 'all' OR
               LOWER(g.designer) = LOWER(:designer))
          AND (:branch IS NULL OR :branch = '' OR :branch = 'all' OR
               LOWER(g.branch) = LOWER(:branch))
        ORDER BY g.createdAt DESC
    """)
    Page<Garment> searchGarments(
            @Param("companyId") UUID companyId,
            @Param("catalogOnly") Boolean catalogOnly,
            @Param("search") String search,
            @Param("stage") String stage,
            @Param("status") String status,
            @Param("garmentType") String garmentType,
            @Param("collectionName") String collectionName,
            @Param("priority") String priority,
            @Param("materialStatus") String materialStatus,
            @Param("fabric") String fabric,
            @Param("designer") String designer,
            @Param("branch") String branch,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(g) FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (:catalogOnly IS NULL OR :catalogOnly = false OR (g.orderId IS NULL AND (g.orderCode IS NULL OR TRIM(g.orderCode) = '')))
          AND (:branch IS NULL OR :branch = '' OR :branch = 'all' OR LOWER(g.branch) = LOWER(:branch) OR (:branch = 'Main Branch' AND (g.branch IS NULL OR g.branch = '')))
    """)
    long countCatalogGarments(@Param("companyId") UUID companyId, @Param("catalogOnly") Boolean catalogOnly, @Param("branch") String branch);

    @Query("""
        SELECT COUNT(g) FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (:catalogOnly IS NULL OR :catalogOnly = false OR (g.orderId IS NULL AND (g.orderCode IS NULL OR TRIM(g.orderCode) = '')))
          AND (:branch IS NULL OR :branch = '' OR :branch = 'all' OR LOWER(g.branch) = LOWER(:branch) OR (:branch = 'Main Branch' AND (g.branch IS NULL OR g.branch = '')))
          AND (
            UPPER(g.productionStage) = UPPER(:productionStage)
            OR UPPER(REPLACE(g.productionStage, '_', ' ')) = UPPER(REPLACE(:productionStage, '_', ' '))
            OR UPPER(REPLACE(g.productionStage, ' ', '_')) = UPPER(REPLACE(:productionStage, ' ', '_'))
            OR (UPPER(:productionStage) = 'READY' AND UPPER(g.productionStage) LIKE 'READY%')
            OR (UPPER(:productionStage) = 'QC' AND UPPER(g.productionStage) LIKE '%QC%')
          )
        """)
    long countByCompanyIdAndProductionStageIgnoreCase(
            @Param("companyId") UUID companyId,
            @Param("productionStage") String productionStage,
            @Param("catalogOnly") Boolean catalogOnly,
            @Param("branch") String branch
    );

    @Query("""
        SELECT COUNT(g) FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (:catalogOnly IS NULL OR :catalogOnly = false OR (g.orderId IS NULL AND (g.orderCode IS NULL OR TRIM(g.orderCode) = '')))
          AND (:branch IS NULL OR :branch = '' OR :branch = 'all' OR LOWER(g.branch) = LOWER(:branch) OR (:branch = 'Main Branch' AND (g.branch IS NULL OR g.branch = '')))
          AND (
            UPPER(g.status) = UPPER(:status)
            OR UPPER(REPLACE(g.status, '_', ' ')) = UPPER(REPLACE(:status, '_', ' '))
            OR UPPER(REPLACE(g.status, ' ', '_')) = UPPER(REPLACE(:status, ' ', '_'))
          )
        """)
    long countByCompanyIdAndStatusIgnoreCase(
            @Param("companyId") UUID companyId,
            @Param("status") String status,
            @Param("catalogOnly") Boolean catalogOnly,
            @Param("branch") String branch
    );

    @Query("""
        SELECT COUNT(g) FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (:catalogOnly IS NULL OR :catalogOnly = false OR (g.orderId IS NULL AND (g.orderCode IS NULL OR TRIM(g.orderCode) = '')))
          AND (:branch IS NULL OR :branch = '' OR :branch = 'all' OR LOWER(g.branch) = LOWER(:branch) OR (:branch = 'Main Branch' AND (g.branch IS NULL OR g.branch = '')))
          AND (UPPER(g.collectionName) LIKE '%BRIDAL%' OR UPPER(g.garmentType) LIKE '%BRIDAL%' OR UPPER(g.title) LIKE '%BRIDAL%')
    """)
    long countBridalGarments(@Param("companyId") UUID companyId, @Param("catalogOnly") Boolean catalogOnly, @Param("branch") String branch);

    @Query("""
        SELECT AVG(g.craftingHours) FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (:catalogOnly IS NULL OR :catalogOnly = false OR (g.orderId IS NULL AND (g.orderCode IS NULL OR TRIM(g.orderCode) = '')))
          AND (:branch IS NULL OR :branch = '' OR :branch = 'all' OR LOWER(g.branch) = LOWER(:branch) OR (:branch = 'Main Branch' AND (g.branch IS NULL OR g.branch = '')))
    """)
    Double avgCraftingHours(@Param("companyId") UUID companyId, @Param("catalogOnly") Boolean catalogOnly, @Param("branch") String branch);

    @Query("""
        SELECT DISTINCT g.garmentType FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (:catalogOnly IS NULL OR :catalogOnly = false OR (g.orderId IS NULL AND (g.orderCode IS NULL OR TRIM(g.orderCode) = '')))
          AND g.garmentType IS NOT NULL AND g.garmentType != ''
        ORDER BY g.garmentType
    """)
    java.util.List<String> findDistinctGarmentTypes(@Param("companyId") UUID companyId, @Param("catalogOnly") Boolean catalogOnly);

    @Query("""
        SELECT DISTINCT g.primaryFabric FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (:catalogOnly IS NULL OR :catalogOnly = false OR (g.orderId IS NULL AND (g.orderCode IS NULL OR TRIM(g.orderCode) = '')))
          AND g.primaryFabric IS NOT NULL AND g.primaryFabric != ''
        ORDER BY g.primaryFabric
    """)
    java.util.List<String> findDistinctFabrics(@Param("companyId") UUID companyId, @Param("catalogOnly") Boolean catalogOnly);

    @Query("""
        SELECT DISTINCT g.collectionName FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (:catalogOnly IS NULL OR :catalogOnly = false OR (g.orderId IS NULL AND (g.orderCode IS NULL OR TRIM(g.orderCode) = '')))
          AND g.collectionName IS NOT NULL AND g.collectionName != ''
        ORDER BY g.collectionName
    """)
    java.util.List<String> findDistinctCollections(@Param("companyId") UUID companyId, @Param("catalogOnly") Boolean catalogOnly);

    @Query("""
        SELECT DISTINCT g.designer FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (:catalogOnly IS NULL OR :catalogOnly = false OR (g.orderId IS NULL AND (g.orderCode IS NULL OR TRIM(g.orderCode) = '')))
          AND g.designer IS NOT NULL AND g.designer != ''
        ORDER BY g.designer
    """)
    java.util.List<String> findDistinctDesigners(@Param("companyId") UUID companyId, @Param("catalogOnly") Boolean catalogOnly);

    @Query("""
        SELECT DISTINCT g.branch FROM Garment g
        WHERE (:companyId IS NULL OR g.companyId = :companyId)
          AND (:catalogOnly IS NULL OR :catalogOnly = false OR (g.orderId IS NULL AND (g.orderCode IS NULL OR TRIM(g.orderCode) = '')))
          AND g.branch IS NOT NULL AND g.branch != ''
        ORDER BY g.branch
    """)
    java.util.List<String> findDistinctBranches(@Param("companyId") UUID companyId, @Param("catalogOnly") Boolean catalogOnly);
}
