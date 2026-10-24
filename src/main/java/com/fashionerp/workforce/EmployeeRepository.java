package com.fashionerp.workforce;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByEmployeeCode(String employeeCode);
    Optional<Employee> findByEmployeeCodeAndCompanyId(String employeeCode, UUID companyId);

    @Query("""
        SELECT e FROM Employee e
        WHERE (:companyId IS NULL OR e.companyId = :companyId)
          AND (:branch IS NULL OR e.branch = :branch OR (:branch = 'Main Branch' AND (e.branch IS NULL OR e.branch = '')))
          AND (:search IS NULL OR :search = '' OR
               LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(e.role) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:role IS NULL OR :role = '' OR LOWER(e.role) = LOWER(:role))
          AND (:status IS NULL OR :status = '' OR LOWER(e.status) = LOWER(:status))
        ORDER BY e.createdAt ASC
        """)
    Page<Employee> search(@Param("companyId") UUID companyId,
                          @Param("branch") String branch,
                          @Param("search") String search,
                          @Param("role") String role,
                          @Param("status") String status,
                          Pageable pageable);

    long countByCompanyId(UUID companyId);
    long countByCompanyIdAndStatus(UUID companyId, String status);

    @Query("SELECT COUNT(e) FROM Employee e WHERE (:companyId IS NULL OR e.companyId = :companyId) AND (:branch IS NULL OR e.branch = :branch OR (:branch = 'Main Branch' AND (e.branch IS NULL OR e.branch = '')))")
    long countByCompanyIdAndBranch(@Param("companyId") UUID companyId, @Param("branch") String branch);

    @Query("SELECT COUNT(e) FROM Employee e WHERE (:companyId IS NULL OR e.companyId = :companyId) AND (:status IS NULL OR LOWER(e.status) = LOWER(:status)) AND (:branch IS NULL OR e.branch = :branch OR (:branch = 'Main Branch' AND (e.branch IS NULL OR e.branch = '')))")
    long countByCompanyIdAndStatusAndBranch(@Param("companyId") UUID companyId, @Param("status") String status, @Param("branch") String branch);

    @Query("SELECT COALESCE(NULLIF(TRIM(e.department), ''), 'General') AS department, COUNT(e) AS count FROM Employee e WHERE (:companyId IS NULL OR e.companyId = :companyId) GROUP BY COALESCE(NULLIF(TRIM(e.department), ''), 'General') ORDER BY count DESC")
    List<Map<String, Object>> countByDepartment(@Param("companyId") UUID companyId);

    @Query("SELECT COALESCE(NULLIF(TRIM(e.department), ''), 'General') AS department, COUNT(e) AS count FROM Employee e WHERE (:companyId IS NULL OR e.companyId = :companyId) AND (:branch IS NULL OR e.branch = :branch OR (:branch = 'Main Branch' AND (e.branch IS NULL OR e.branch = ''))) GROUP BY COALESCE(NULLIF(TRIM(e.department), ''), 'General') ORDER BY count DESC")
    List<Map<String, Object>> countByDepartmentAndBranch(@Param("companyId") UUID companyId, @Param("branch") String branch);

    @Query("SELECT DISTINCT TRIM(e.department) FROM Employee e WHERE (:companyId IS NULL OR e.companyId = :companyId) AND e.department IS NOT NULL AND TRIM(e.department) <> '' ORDER BY TRIM(e.department) ASC")
    List<String> findDistinctDepartments(@Param("companyId") UUID companyId);

    @Query("SELECT e.role AS role, COUNT(e) AS count FROM Employee e WHERE (:companyId IS NULL OR e.companyId = :companyId) GROUP BY e.role ORDER BY e.role")
    List<Map<String, Object>> countByRole(@Param("companyId") UUID companyId);
}

