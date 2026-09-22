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

    boolean existsByOrderCode(String orderCode);

    @Query(value = """
        SELECT o FROM Order o
        LEFT JOIN FETCH o.customer c
        WHERE (:search IS NULL OR :search = '' OR
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
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(o.orderCode)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.name)         LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(o.garmentType)  LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR o.status = :status)
        """)
    Page<Order> search(@Param("search") String search,
                       @Param("status") OrderStatus status,
                       Pageable pageable);

    long countByStatus(OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.customer.mobileNumber = :customerMobile")
    long countByCustomerMobile(@Param("customerMobile") String customerMobile);

    @Query("SELECT o FROM Order o WHERE o.customer.mobileNumber = :customerMobile ORDER BY o.orderDate DESC, o.createdAt DESC")
    java.util.List<Order> findByCustomerMobile(@Param("customerMobile") String customerMobile);
}
