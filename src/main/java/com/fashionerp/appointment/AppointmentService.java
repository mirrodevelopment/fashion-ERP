package com.fashionerp.appointment;

import com.fashionerp.customer.CustomerRepository;
import com.fashionerp.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    public Page<AppointmentDto.Response> list(String search, String status, Pageable pageable) {
        AppointmentStatus statusEnum = (status != null && !status.isBlank())
                ? AppointmentStatus.valueOf(status.toUpperCase().replace('-', '_')) : null;
        return appointmentRepository.search(search, statusEnum, pageable).map(AppointmentDto.Response::from);
    }

    public List<AppointmentDto.Response> today() {
        LocalDateTime start = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime end = start.plusDays(1);
        return appointmentRepository.findByScheduledAtBetweenOrderByScheduledAtAsc(start, end)
                .stream().map(AppointmentDto.Response::from).toList();
    }

    @Transactional
    public AppointmentDto.Response create(AppointmentDto.Request req) {
        String mobile = req.getEffectiveMobile();
        var customer = customerRepository.findById(mobile)
                .or(() -> customerRepository.findByFlexibleMobile(mobile))
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with mobile: " + mobile));
        Appointment a = Appointment.builder()
                .customer(customer)
                .apptType(req.getApptType() != null ? req.getApptType() : AppointmentType.CONSULTATION)
                .scheduledAt(req.getScheduledAt())
                .durationMinutes(req.getDurationMinutes() != null ? req.getDurationMinutes() : 60)
                .staffAssigned(req.getStaffAssigned())
                .notes(req.getNotes())
                .build();
        if (req.getOrderId() != null) {
            orderRepository.findById(req.getOrderId()).ifPresent(a::setOrder);
        }
        return AppointmentDto.Response.from(appointmentRepository.save(a));
    }

    @Transactional
    public AppointmentDto.Response updateStatus(UUID id, AppointmentStatus newStatus) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + id));
        a.setStatus(newStatus);
        return AppointmentDto.Response.from(appointmentRepository.save(a));
    }
}
