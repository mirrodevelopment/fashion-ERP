package com.fashionerp.customer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {

    Optional<Customer> findByMobileNumber(String mobileNumber);

    @Query("SELECT c FROM Customer c WHERE REPLACE(REPLACE(c.mobileNumber, ' ', ''), '+', '') = REPLACE(REPLACE(:mobile, ' ', ''), '+', '')")
    Optional<Customer> findByFlexibleMobile(@Param("mobile") String mobile);

    boolean existsByMobileNumber(String mobileNumber);
    boolean existsByEmail(String email);

    @Query("""
        SELECT c FROM Customer c
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(c.name)         LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.email)        LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.location)     LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.favoriteGarment) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:tier IS NULL OR c.tier = :tier)
        ORDER BY c.createdAt DESC
        """)
    Page<Customer> search(@Param("search") String search,
                          @Param("tier") CustomerTier tier,
                          Pageable pageable);

    long countByTier(CustomerTier tier);

    @Query("SELECT COUNT(DISTINCT o.customer.mobileNumber) FROM Order o WHERE o.createdAt >= (CURRENT_TIMESTAMP - 90 DAY)")
    long countActiveIn90Days();
}
