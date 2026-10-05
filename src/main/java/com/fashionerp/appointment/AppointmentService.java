package com.fashionerp.appointment;

import com.fashionerp.common.TenantContext;
import com.fashionerp.customer.Customer;
import com.fashionerp.customer.CustomerRepository;
import com.fashionerp.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
        UUID companyId = TenantContext.getCompanyId();
        return appointmentRepository.search(companyId, search, statusEnum, pageable).map(AppointmentDto.Response::from);
    }

    public List<AppointmentDto.Response> today() {
        LocalDateTime start = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime end = start.plusDays(1);
        UUID companyId = TenantContext.getCompanyId();
        return (companyId != null
                ? appointmentRepository.findByCompanyIdAndScheduledAtBetweenOrderByScheduledAtAsc(companyId, start, end)
                : appointmentRepository.findByScheduledAtBetweenOrderByScheduledAtAsc(start, end))
                .stream().map(AppointmentDto.Response::from).toList();
    }

    @Transactional
    public AppointmentDto.Response create(AppointmentDto.Request req) {
        UUID companyId = TenantContext.getCompanyId();
        String mobile = req.getEffectiveMobile();
        var customer = (companyId != null
                ? customerRepository.findByMobileNumberAndCompanyId(mobile, companyId)
                        .or(() -> customerRepository.findByFlexibleMobile(companyId, mobile))
                : customerRepository.findById(mobile)
                        .or(() -> customerRepository.findByFlexibleMobile(mobile)))
                .orElseGet(() -> {
                    String cName = (req.getCustomerName() != null && !req.getCustomerName().isBlank())
                            ? req.getCustomerName().trim() : "Walk-in Client";
                    Customer newCust = Customer.builder()
                            .companyId(companyId)
                            .mobileNumber(mobile)
                            .name(cName)
                            .build();
                    return customerRepository.save(newCust);
                });
        Appointment a = Appointment.builder()
                .companyId(companyId)
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
        UUID companyId = TenantContext.getCompanyId();
        Appointment a = (companyId != null
                ? appointmentRepository.findByIdAndCompanyId(id, companyId)
                : appointmentRepository.findById(id))
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + id));
        a.setStatus(newStatus);
        return AppointmentDto.Response.from(appointmentRepository.save(a));
    }

    @Transactional
    public AppointmentDto.Response reschedule(UUID id, Map<String, Object> body) {
        UUID companyId = TenantContext.getCompanyId();
        Appointment a = (companyId != null
                ? appointmentRepository.findByIdAndCompanyId(id, companyId)
                : appointmentRepository.findById(id))
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + id));
        if (body.containsKey("scheduledAt") && body.get("scheduledAt") != null) {
            a.setScheduledAt(LocalDateTime.parse(body.get("scheduledAt").toString()));
        }
        if (body.containsKey("durationMinutes") && body.get("durationMinutes") != null) {
            a.setDurationMinutes(Integer.valueOf(body.get("durationMinutes").toString()));
        }
        if (body.containsKey("status") && body.get("status") != null) {
            a.setStatus(AppointmentStatus.valueOf(body.get("status").toString().toUpperCase()));
        } else {
            a.setStatus(AppointmentStatus.CONFIRMED);
        }
        return AppointmentDto.Response.from(appointmentRepository.save(a));
    }

}
