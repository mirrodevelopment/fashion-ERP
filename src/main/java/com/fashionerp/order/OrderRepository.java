package com.fashionerp.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByOrderCode(String orderCode);

    Optional<Order> findByOrderCodeAndCompanyId(String orderCode, UUID companyId);

    Optional<Order> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByOrderCode(String orderCode);

    @Query(value = """
        SELECT o FROM Order o
        LEFT JOIN FETCH o.customer c
        WHERE (:companyId IS NULL OR o.companyId = :companyId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(o.orderCode)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.name)         LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(o.garmentType)  LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR o.status = :status)
        ORDER BY o.createdAt DESC
        """,
        countQuery = """
        SELECT COUNT(o) FROM Order o
        LEFT JOIN o.customer c
        WHERE (:companyId IS NULL OR o.companyId = :companyId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(o.orderCode)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.name)         LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(o.garmentType)  LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR o.status = :status)
        """)
    Page<Order> search(@Param("companyId") UUID companyId,
                       @Param("search") String search,
                       @Param("status") OrderStatus status,
                       Pageable pageable);

    long countByStatus(OrderStatus status);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE (:companyId IS NULL OR o.companyId = :companyId) AND o.customer.mobileNumber = :customerMobile")
    long countByCustomerMobile(@Param("companyId") UUID companyId, @Param("customerMobile") String customerMobile);

    @Query("SELECT o FROM Order o WHERE (:companyId IS NULL OR o.companyId = :companyId) AND o.customer.mobileNumber = :customerMobile ORDER BY o.orderDate DESC, o.createdAt DESC")
    java.util.List<Order> findByCustomerMobile(@Param("companyId") UUID companyId, @Param("customerMobile") String customerMobile);

    java.util.List<Order> findByCompanyIdAndCollectionIgnoreCase(UUID companyId, String collection);

    @Query("SELECT o FROM Order o WHERE (:companyId IS NULL OR o.companyId = :companyId) AND LOWER(o.collection) IN :collections")
    java.util.List<Order> findByCollectionInIgnoreCase(@Param("companyId") UUID companyId, @Param("collections") java.util.Collection<String> collections);

    long countByCompanyIdAndCollectionIgnoreCase(UUID companyId, String collection);

    @Query("""
        SELECT UPPER(TRIM(o.currentStage)), COUNT(o)
        FROM Order o
        WHERE (:companyId IS NULL OR o.companyId = :companyId)
          AND o.status NOT IN (com.fashionerp.order.OrderStatus.CANCELLED, com.fashionerp.order.OrderStatus.DELIVERED)
        GROUP BY UPPER(TRIM(o.currentStage))
        """)
    java.util.List<Object[]> countActiveOrdersGroupedByStage(@Param("companyId") UUID companyId);

    @Query("""
        SELECT COUNT(o) FROM Order o
        WHERE (:companyId IS NULL OR o.companyId = :companyId)
          AND UPPER(TRIM(o.currentStage)) IN ('QC', 'QUALITY', 'QUALITY_CONTROL')
          AND o.status NOT IN (com.fashionerp.order.OrderStatus.CANCELLED, com.fashionerp.order.OrderStatus.DELIVERED)
        """)
    long countOrdersAwaitingQc(@Param("companyId") UUID companyId);
}
