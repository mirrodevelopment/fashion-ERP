package com.fashionerp.purchase;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {

    Optional<PurchaseOrder> findByPoCode(String poCode);
    Optional<PurchaseOrder> findByPoCodeAndCompanyId(String poCode, UUID companyId);

    @Query("""
        SELECT po FROM PurchaseOrder po
        LEFT JOIN po.supplier s
        WHERE (:companyId IS NULL OR po.companyId = :companyId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(po.poCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(s.name)    LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR :status = '' OR po.status = :status)
        ORDER BY po.createdAt DESC
        """)
    Page<PurchaseOrder> search(@Param("companyId") UUID companyId,
                               @Param("search") String search,
                               @Param("status") String status,
                               Pageable pageable);

    long countByCompanyId(UUID companyId);
    long countByCompanyIdAndStatus(UUID companyId, String status);
    long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(po.totalAmount), 0) FROM PurchaseOrder po WHERE (:companyId IS NULL OR po.companyId = :companyId)")
    BigDecimal sumTotalAmount(@Param("companyId") UUID companyId);

    @Query("SELECT COALESCE(SUM(po.totalAmount), 0) FROM PurchaseOrder po")
    BigDecimal sumTotalAmount();

    @Query("SELECT s.name, COALESCE(SUM(po.totalAmount), 0) FROM PurchaseOrder po JOIN po.supplier s WHERE (:companyId IS NULL OR po.companyId = :companyId) GROUP BY s.name ORDER BY SUM(po.totalAmount) DESC")
    java.util.List<Object[]> findTopSuppliers(@Param("companyId") UUID companyId);

    @Query("SELECT s.name, COALESCE(SUM(po.totalAmount), 0) FROM PurchaseOrder po JOIN po.supplier s GROUP BY s.name ORDER BY SUM(po.totalAmount) DESC")
    java.util.List<Object[]> findTopSuppliers();

    @Query("SELECT FUNCTION('TO_CHAR', po.createdAt, 'YYYY-MM'), COALESCE(SUM(po.totalAmount), 0) FROM PurchaseOrder po WHERE (:companyId IS NULL OR po.companyId = :companyId) GROUP BY FUNCTION('TO_CHAR', po.createdAt, 'YYYY-MM') ORDER BY 1 ASC")
    java.util.List<Object[]> findMonthlySpend(@Param("companyId") UUID companyId);

    @Query("SELECT FUNCTION('TO_CHAR', po.createdAt, 'YYYY-MM'), COALESCE(SUM(po.totalAmount), 0) FROM PurchaseOrder po GROUP BY FUNCTION('TO_CHAR', po.createdAt, 'YYYY-MM') ORDER BY 1 ASC")
    java.util.List<Object[]> findMonthlySpend();
}
