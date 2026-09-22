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

    @Query("""
        SELECT e FROM Employee e
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(e.role) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:role IS NULL OR :role = '' OR LOWER(e.role) = LOWER(:role))
          AND (:status IS NULL OR :status = '' OR LOWER(e.status) = LOWER(:status))
        ORDER BY e.createdAt ASC
        """)
    Page<Employee> search(@Param("search") String search,
                          @Param("role") String role,
                          @Param("status") String status,
                          Pageable pageable);

    long countByStatus(String status);

    @Query("SELECT e.role AS role, COUNT(e) AS count FROM Employee e GROUP BY e.role ORDER BY e.role")
    List<Map<String, Object>> countByRole();
}
