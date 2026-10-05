package com.fashionerp.production;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StageDefinitionRepository extends JpaRepository<StageDefinition, UUID> {

    /** All active stages ordered for Kanban rendering */
    List<StageDefinition> findAllByCompanyIdAndActiveTrueOrderBySortOrderAsc(UUID companyId);
    List<StageDefinition> findAllByActiveTrueOrderBySortOrderAsc();

    /** All stages (active + inactive) ordered for admin management UI */
    List<StageDefinition> findAllByCompanyIdOrderBySortOrderAsc(UUID companyId);
    List<StageDefinition> findAllByOrderBySortOrderAsc();

    /** Lookup by machine key for transition mapping */
    Optional<StageDefinition> findByCompanyIdAndStageKey(UUID companyId, String stageKey);
    Optional<StageDefinition> findByStageKey(String stageKey);

    /** Uniqueness check when editing a stage's key (exclude self) */
    boolean existsByCompanyIdAndStageKeyAndIdNot(UUID companyId, String stageKey, UUID id);
    boolean existsByStageKeyAndIdNot(String stageKey, UUID id);

    /** Check if a stage key already exists (for create) */
    boolean existsByCompanyIdAndStageKey(UUID companyId, String stageKey);
    boolean existsByStageKey(String stageKey);

    /** Batch update sort_order — used by the reorder endpoint */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE StageDefinition s SET s.sortOrder = :sortOrder WHERE s.id = :id")
    void updateSortOrder(UUID id, int sortOrder);

    /** Count how many production_stages records reference a given stage key (for delete safety) */
    @Query("SELECT COUNT(ps) FROM ProductionStage ps WHERE ps.stageName = :stageName")
    long countLinkedProductionStages(String stageName);
}
