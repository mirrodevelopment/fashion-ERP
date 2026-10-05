package com.fashionerp.branch;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface BranchRepository extends JpaRepository<Branch, UUID> {

    Optional<Branch> findByBranchCode(String branchCode);

    boolean existsByIsHeadquartersTrue();

    long countByActiveTrue();

    @Query("""
        SELECT b FROM Branch b
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(b.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR
               LOWER(b.city) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
          AND (:type IS NULL OR :type = '' OR b.type = :type)
          AND (:active IS NULL OR b.active = :active)
        ORDER BY b.createdAt ASC
        """)
    Page<Branch> search(
        @Param("search") String search,
        @Param("type") String type,
        @Param("active") Boolean active,
        Pageable pageable
    );
}
