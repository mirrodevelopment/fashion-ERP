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
               LOWER(g.productionStage) = LOWER(:stage))
          AND (:status IS NULL OR :status = '' OR :status = 'all' OR
               LOWER(g.status) = LOWER(:status))
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

    @Query("""
        SELECT g FROM Garment g
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(g.garmentCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.orderCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.designCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(g.specs) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:stage IS NULL OR :stage = '' OR :stage = 'all' OR
               LOWER(g.productionStage) = LOWER(:stage))
          AND (:status IS NULL OR :status = '' OR :status = 'all' OR
               LOWER(g.status) = LOWER(:status))
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

    long countByCompanyIdAndProductionStageIgnoreCase(UUID companyId, String productionStage);
    long countByProductionStageIgnoreCase(String productionStage);

    long countByCompanyIdAndStatusIgnoreCase(UUID companyId, String status);
    long countByStatusIgnoreCase(String status);
}
