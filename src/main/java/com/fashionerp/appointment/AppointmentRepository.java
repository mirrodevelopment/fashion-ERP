package com.fashionerp.appointment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    @Query("""
        SELECT a FROM Appointment a JOIN a.customer c
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR a.status = :status)
        ORDER BY a.scheduledAt ASC
        """)
    Page<Appointment> search(@Param("search") String search,
                             @Param("status") AppointmentStatus status,
                             Pageable pageable);

    List<Appointment> findByScheduledAtBetweenOrderByScheduledAtAsc(LocalDateTime from, LocalDateTime to);

    List<Appointment> findByCustomerMobileNumberOrderByScheduledAtDesc(String customerMobile);

    long countByStatus(AppointmentStatus status);
}
