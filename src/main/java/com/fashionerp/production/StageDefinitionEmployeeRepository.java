package com.fashionerp.production;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StageDefinitionEmployeeRepository extends JpaRepository<StageDefinitionEmployee, UUID> {

    List<StageDefinitionEmployee> findByStageDefId(UUID stageDefId);

    boolean existsByStageDefIdAndEmployeeId(UUID stageDefId, UUID employeeId);

    @Modifying
    @Query("DELETE FROM StageDefinitionEmployee l WHERE l.stageDef.id = :stageDefId AND l.employee.id = :employeeId")
    void deleteByStageDefIdAndEmployeeId(UUID stageDefId, UUID employeeId);

    @Modifying
    @Query("DELETE FROM StageDefinitionEmployee l WHERE l.stageDef.id = :stageDefId")
    void deleteAllByStageDefId(UUID stageDefId);
}
