package com.fashionerp.purchase;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    Optional<Supplier> findBySupplierCode(String supplierCode);
    Optional<Supplier> findBySupplierCodeAndCompanyId(String supplierCode, UUID companyId);
    long countByCompanyId(UUID companyId);

    @Query("""
        SELECT s FROM Supplier s
        WHERE (:companyId IS NULL OR s.companyId = :companyId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(s.name)           LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(s.supplierCode)   LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(s.contactPerson)  LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(s.specialization) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY s.name ASC
        """)
    Page<Supplier> search(@Param("companyId") UUID companyId, @Param("search") String search, Pageable pageable);
}
