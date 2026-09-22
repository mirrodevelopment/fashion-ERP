package com.fashionerp.trial;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrialRepository extends JpaRepository<Trial, UUID> {

    Optional<Trial> findByTrialCode(String trialCode);

    @Query(value = """
        SELECT t FROM Trial t
        LEFT JOIN FETCH t.customer c
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(t.trialCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(t.orderCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(t.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(t.customer.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(t.garmentType) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR :status = '' OR UPPER(t.status) = UPPER(:status))
          AND (:fitStatus IS NULL OR :fitStatus = '' OR UPPER(t.fitStatus) = UPPER(:fitStatus))
          AND (:date IS NULL OR t.trialDate = :date)
        ORDER BY t.trialDate DESC, t.createdAt DESC
        """,
        countQuery = """
        SELECT COUNT(t) FROM Trial t
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(t.trialCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(t.orderCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(t.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(t.customer.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(t.garmentType) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR :status = '' OR UPPER(t.status) = UPPER(:status))
          AND (:fitStatus IS NULL OR :fitStatus = '' OR UPPER(t.fitStatus) = UPPER(:fitStatus))
          AND (:date IS NULL OR t.trialDate = :date)
        """)
    Page<Trial> search(@Param("search") String search,
                       @Param("status") String status,
                       @Param("fitStatus") String fitStatus,
                       @Param("date") LocalDate date,
                       Pageable pageable);

    long countByStatusIgnoreCase(String status);
    long countByFitStatusIgnoreCase(String fitStatus);

    long countByOrderCode(String orderCode);
    java.util.List<Trial> findByOrderCodeOrderByCreatedAtAsc(String orderCode);
    Optional<Trial> findFirstByOrderIdOrderByCreatedAtDesc(UUID orderId);
}
