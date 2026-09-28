package com.fashionerp.payment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    boolean existsByOrderId(UUID orderId);

    @Query("SELECT DISTINCT p FROM Payment p LEFT JOIN FETCH p.transactions JOIN FETCH p.order JOIN FETCH p.customer WHERE p.order.id = :orderId")
    Optional<Payment> findByOrderId(@Param("orderId") UUID orderId);

    @Query("""
        SELECT p FROM Payment p JOIN p.customer c JOIN p.order o
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR p.status = :status)
        ORDER BY p.createdAt DESC
        """)
    Page<Payment> search(@Param("search") String search,
                         @Param("status") PaymentStatus status,
                         Pageable pageable);

    long countByStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.paidAmount), 0) FROM Payment p")
    java.math.BigDecimal sumPaidAmount();

    @Query("SELECT COALESCE(SUM(p.totalAmount - p.paidAmount), 0) FROM Payment p WHERE p.status != 'PAID'")
    java.math.BigDecimal sumPendingAmount();

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Payment p")
    java.math.BigDecimal sumTotalAmount();

    @Query("SELECT COALESCE(SUM(p.paidAmount), 0) FROM Payment p WHERE MONTH(p.createdAt) = MONTH(CURRENT_DATE) AND YEAR(p.createdAt) = YEAR(CURRENT_DATE)")
    java.math.BigDecimal sumThisMonthPaidAmount();

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'OVERDUE'")
    long countOverdue();
}
