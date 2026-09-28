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
        ORDER BY CASE 
            WHEN g.garmentCode = 'BRD-0528' THEN 1
            WHEN g.garmentCode = 'LG-0525'  THEN 2
            WHEN g.garmentCode = 'CH-0521'  THEN 3
            WHEN g.garmentCode = 'SR-0519'  THEN 4
            WHEN g.garmentCode = 'GN-0516'  THEN 5
            WHEN g.garmentCode = 'KR-0513'  THEN 6
            WHEN g.garmentCode = 'BRD-0510' THEN 7
            WHEN g.garmentCode = 'LG-0508'  THEN 8
            WHEN g.garmentCode = 'CH-0504'  THEN 9
            WHEN g.garmentCode = 'SR-0503'  THEN 10
            ELSE 100 END, g.createdAt ASC
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

    long countByProductionStageIgnoreCase(String productionStage);

    long countByStatusIgnoreCase(String status);
}
