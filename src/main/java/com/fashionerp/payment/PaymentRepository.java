package com.fashionerp.payment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    boolean existsByOrderId(UUID orderId);

    boolean existsByOrderIdAndCompanyId(UUID orderId, UUID companyId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    Optional<Payment> findByIdAndCompanyId(UUID id, UUID companyId);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT DISTINCT p FROM Payment p LEFT JOIN FETCH p.transactions JOIN FETCH p.order JOIN FETCH p.customer WHERE p.order.id = :orderId AND (:companyId IS NULL OR p.companyId = :companyId)")
    Optional<Payment> findByOrderIdAndCompanyId(@Param("orderId") UUID orderId, @Param("companyId") UUID companyId);


    @Query("""
        SELECT p FROM Payment p JOIN p.customer c JOIN p.order o
        WHERE (:companyId IS NULL OR p.companyId = :companyId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR p.status = :status)
          AND (:branch IS NULL OR o.branch = :branch
               OR o.branch IN (SELECT b.branchCode FROM Branch b WHERE b.name = :branch)
               OR o.branch IN (SELECT b.name FROM Branch b WHERE b.branchCode = :branch))
        ORDER BY p.createdAt DESC
        """)
    Page<Payment> search(@Param("companyId") UUID companyId,
                         @Param("search") String search,
                         @Param("status") PaymentStatus status,
                         @Param("branch") String branch,
                         Pageable pageable);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.paidAmount), 0) FROM Payment p WHERE (:companyId IS NULL OR p.companyId = :companyId)")
    java.math.BigDecimal sumPaidAmount(@Param("companyId") UUID companyId);

    @Query("SELECT COALESCE(SUM(p.totalAmount - p.paidAmount), 0) FROM Payment p WHERE (:companyId IS NULL OR p.companyId = :companyId) AND p.status != 'PAID'")
    java.math.BigDecimal sumPendingAmount(@Param("companyId") UUID companyId);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Payment p WHERE (:companyId IS NULL OR p.companyId = :companyId)")
    java.math.BigDecimal sumTotalAmount(@Param("companyId") UUID companyId);

    @Query("SELECT COALESCE(SUM(p.paidAmount), 0) FROM Payment p WHERE (:companyId IS NULL OR p.companyId = :companyId) AND MONTH(p.createdAt) = MONTH(CURRENT_DATE) AND YEAR(p.createdAt) = YEAR(CURRENT_DATE)")
    java.math.BigDecimal sumThisMonthPaidAmount(@Param("companyId") UUID companyId);

    @Query("SELECT COUNT(p) FROM Payment p WHERE (:companyId IS NULL OR p.companyId = :companyId) AND p.status = 'OVERDUE'")
    long countOverdue(@Param("companyId") UUID companyId);

    @Query("""
        SELECT COALESCE(SUM(p.paidAmount), 0)
        FROM Payment p
        JOIN p.order o
        WHERE (:companyId IS NULL OR p.companyId = :companyId)
          AND (:branch IS NULL OR o.branch = :branch
               OR o.branch IN (SELECT b.branchCode FROM Branch b WHERE b.name = :branch)
               OR o.branch IN (SELECT b.name FROM Branch b WHERE b.branchCode = :branch))
        """)
    java.math.BigDecimal sumPaidAmountByBranch(@Param("companyId") UUID companyId, @Param("branch") String branch);

    @Query("""
        SELECT COALESCE(SUM(p.paidAmount), 0)
        FROM Payment p
        JOIN p.order o
        WHERE (:companyId IS NULL OR p.companyId = :companyId)
          AND MONTH(p.createdAt) = MONTH(CURRENT_DATE) AND YEAR(p.createdAt) = YEAR(CURRENT_DATE)
          AND (:branch IS NULL OR o.branch = :branch
               OR o.branch IN (SELECT b.branchCode FROM Branch b WHERE b.name = :branch)
               OR o.branch IN (SELECT b.name FROM Branch b WHERE b.branchCode = :branch))
        """)
    java.math.BigDecimal sumThisMonthPaidAmountByBranch(@Param("companyId") UUID companyId, @Param("branch") String branch);

    @Query("""
        SELECT COALESCE(SUM(p.totalAmount - p.paidAmount), 0)
        FROM Payment p
        JOIN p.order o
        WHERE (:companyId IS NULL OR p.companyId = :companyId)
          AND p.status != 'PAID'
          AND (:branch IS NULL OR o.branch = :branch
               OR o.branch IN (SELECT b.branchCode FROM Branch b WHERE b.name = :branch)
               OR o.branch IN (SELECT b.name FROM Branch b WHERE b.branchCode = :branch))
        """)
    java.math.BigDecimal sumPendingAmountByBranch(@Param("companyId") UUID companyId, @Param("branch") String branch);

    @Query("""
        SELECT COUNT(p)
        FROM Payment p
        JOIN p.order o
        WHERE (:companyId IS NULL OR p.companyId = :companyId)
          AND p.status IN (com.fashionerp.payment.PaymentStatus.PARTIAL, com.fashionerp.payment.PaymentStatus.PENDING)
          AND (:branch IS NULL OR o.branch = :branch
               OR o.branch IN (SELECT b.branchCode FROM Branch b WHERE b.name = :branch)
               OR o.branch IN (SELECT b.name FROM Branch b WHERE b.branchCode = :branch))
        """)
    long countPendingPaymentsByBranch(@Param("companyId") UUID companyId, @Param("branch") String branch);

    @Query("""
        SELECT COUNT(p)
        FROM Payment p
        JOIN p.order o
        WHERE (:companyId IS NULL OR p.companyId = :companyId)
          AND p.status = com.fashionerp.payment.PaymentStatus.OVERDUE
          AND (:branch IS NULL OR o.branch = :branch
               OR o.branch IN (SELECT b.branchCode FROM Branch b WHERE b.name = :branch)
               OR o.branch IN (SELECT b.name FROM Branch b WHERE b.branchCode = :branch))
        """)
    long countOverdueByBranch(@Param("companyId") UUID companyId, @Param("branch") String branch);

    @Query("""
        SELECT COUNT(p)
        FROM Payment p
        JOIN p.order o
        WHERE (:companyId IS NULL OR p.companyId = :companyId)
          AND (:status IS NULL OR p.status = :status)
          AND (:branch IS NULL OR o.branch = :branch
               OR o.branch IN (SELECT b.branchCode FROM Branch b WHERE b.name = :branch)
               OR o.branch IN (SELECT b.name FROM Branch b WHERE b.branchCode = :branch))
        """)
    long countByCompanyIdAndBranchAndStatus(@Param("companyId") UUID companyId, @Param("branch") String branch, @Param("status") PaymentStatus status);

    @Query("""
        SELECT COUNT(p)
        FROM Payment p
        JOIN p.order o
        WHERE (:companyId IS NULL OR p.companyId = :companyId)
          AND (:branch IS NULL OR o.branch = :branch
               OR o.branch IN (SELECT b.branchCode FROM Branch b WHERE b.name = :branch)
               OR o.branch IN (SELECT b.name FROM Branch b WHERE b.branchCode = :branch))
        """)
    long countByCompanyIdAndBranch(@Param("companyId") UUID companyId, @Param("branch") String branch);
}

