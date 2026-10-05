package com.fashionerp.appointment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    @Query("""
        SELECT a FROM Appointment a JOIN a.customer c
        WHERE (:companyId IS NULL OR a.companyId = :companyId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR a.status = :status)
        ORDER BY a.scheduledAt ASC
        """)
    Page<Appointment> search(@Param("companyId") UUID companyId,
                             @Param("search") String search,
                             @Param("status") AppointmentStatus status,
                             Pageable pageable);


    List<Appointment> findByCompanyIdAndScheduledAtBetweenOrderByScheduledAtAsc(UUID companyId, LocalDateTime from, LocalDateTime to);
    List<Appointment> findByScheduledAtBetweenOrderByScheduledAtAsc(LocalDateTime from, LocalDateTime to);

    List<Appointment> findByCompanyIdAndCustomerMobileNumberOrderByScheduledAtDesc(UUID companyId, String customerMobile);
    List<Appointment> findByCustomerMobileNumberOrderByScheduledAtDesc(String customerMobile);

    Optional<Appointment> findByIdAndCompanyId(UUID id, UUID companyId);

    long countByCompanyId(UUID companyId);
    long countByCompanyIdAndStatus(UUID companyId, AppointmentStatus status);
    long countByStatus(AppointmentStatus status);

    List<Appointment> findByCompanyIdAndOrderId(UUID companyId, UUID orderId);
    List<Appointment> findByOrderId(UUID orderId);
}

