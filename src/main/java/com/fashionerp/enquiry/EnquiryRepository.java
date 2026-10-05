package com.fashionerp.enquiry;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, UUID> {

    Optional<Enquiry> findByEnquiryCode(String enquiryCode);
    Optional<Enquiry> findByEnquiryCodeAndCompanyId(String enquiryCode, UUID companyId);

    @Query("""
        SELECT e FROM Enquiry e
        WHERE (:companyId IS NULL OR e.companyId = :companyId)
          AND (:branch IS NULL OR e.branch = :branch OR e.branch IS NULL)
          AND (:search IS NULL OR :search = '' OR
               LOWER(e.customerName)  LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(e.enquiryCode)   LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(e.garmentType)   LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(COALESCE(e.occasion, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(COALESCE(e.phone, '')) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR :status = '' OR UPPER(e.status) = UPPER(:status))
        ORDER BY e.createdAt DESC
        """)
    Page<Enquiry> search(@Param("companyId") UUID companyId,
                         @Param("branch") String branch,
                         @Param("search") String search,
                         @Param("status") String status,
                         Pageable pageable);

    @Query("""
        SELECT e FROM Enquiry e
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(e.customerName)  LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(e.enquiryCode)   LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(e.garmentType)   LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(COALESCE(e.occasion, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(COALESCE(e.phone, '')) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR :status = '' OR UPPER(e.status) = UPPER(:status))
        ORDER BY e.createdAt DESC
        """)
    Page<Enquiry> search(@Param("search") String search,
                         @Param("status") String status,
                         Pageable pageable);

    long countByCompanyIdAndStatusIgnoreCase(UUID companyId, String status);
    long countByStatusIgnoreCase(String status);

    long countByCompanyIdAndCreatedAtAfter(UUID companyId, java.time.LocalDateTime date);
    long countByCreatedAtAfter(java.time.LocalDateTime date);
}
