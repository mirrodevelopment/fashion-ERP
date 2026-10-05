package com.fashionerp.customer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {

    Optional<Customer> findByMobileNumber(String mobileNumber);

    Optional<Customer> findByMobileNumberAndCompanyId(String mobileNumber, UUID companyId);

    @Query("SELECT c FROM Customer c WHERE (:companyId IS NULL OR c.companyId = :companyId) AND REPLACE(REPLACE(c.mobileNumber, ' ', ''), '+', '') = REPLACE(REPLACE(:mobile, ' ', ''), '+', '')")
    Optional<Customer> findByFlexibleMobile(@Param("companyId") UUID companyId, @Param("mobile") String mobile);

    @Query("SELECT c FROM Customer c WHERE REPLACE(REPLACE(c.mobileNumber, ' ', ''), '+', '') = REPLACE(REPLACE(:mobile, ' ', ''), '+', '')")
    Optional<Customer> findByFlexibleMobile(@Param("mobile") String mobile);

    boolean existsByMobileNumber(String mobileNumber);
    boolean existsByMobileNumberAndCompanyId(String mobileNumber, UUID companyId);
    boolean existsByEmail(String email);

    @Query("""
        SELECT c FROM Customer c
        WHERE (:companyId IS NULL OR c.companyId = :companyId)
          AND (:branch IS NULL OR c.branch = :branch OR c.branch IS NULL)
          AND (:search IS NULL OR :search = '' OR
               LOWER(c.name)         LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.email)        LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.location)     LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.favoriteGarment) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:tier IS NULL OR c.tier = :tier)
        ORDER BY c.createdAt DESC
        """)
    Page<Customer> search(@Param("companyId") UUID companyId,
                          @Param("branch") String branch,
                          @Param("search") String search,
                          @Param("tier") CustomerTier tier,
                          Pageable pageable);

    long countByCompanyId(UUID companyId);

    @Query("SELECT COUNT(DISTINCT o.customer.mobileNumber) FROM Order o WHERE (:companyId IS NULL OR o.companyId = :companyId) AND o.createdAt >= (CURRENT_TIMESTAMP - 90 DAY)")
    long countActiveIn90Days(@Param("companyId") UUID companyId);

    @Query("SELECT COUNT(DISTINCT o.customer.mobileNumber) FROM Order o WHERE o.createdAt >= (CURRENT_TIMESTAMP - 90 DAY)")
    long countActiveIn90Days();
}
