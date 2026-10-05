package com.fashionerp.appointment;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;

    @GetMapping
    public Page<AppointmentDto.Response> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return appointmentService.list(search, status, pageable);
    }

    @GetMapping("/today")
    public List<AppointmentDto.Response> today() {
        return appointmentService.today();
    }

    @PostMapping
    public ResponseEntity<AppointmentDto.Response> create(@RequestBody AppointmentDto.Request req) {
        AppointmentDto.Response created = appointmentService.create(req);
        return ResponseEntity.created(URI.create("/api/v1/appointments/" + created.getId())).body(created);
    }

    @PatchMapping("/{id}/status")
    public AppointmentDto.Response updateStatus(@PathVariable UUID id,
                                                @RequestParam String status) {
        return appointmentService.updateStatus(id, AppointmentStatus.valueOf(status.toUpperCase()));
    }

    @PatchMapping("/{id}/reschedule")
    public AppointmentDto.Response reschedule(@PathVariable UUID id,
                                              @RequestBody Map<String, Object> body) {
        return appointmentService.reschedule(id, body);
    }

    @GetMapping("/kpis")
    public Map<String, Object> kpis() {
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd   = todayStart.plusDays(1).minusSeconds(1);
        long todayCount     = (companyId != null
                ? appointmentRepository.findByCompanyIdAndScheduledAtBetweenOrderByScheduledAtAsc(companyId, todayStart, todayEnd)
                : appointmentRepository.findByScheduledAtBetweenOrderByScheduledAtAsc(todayStart, todayEnd)).size();
        long upcomingCount  = companyId != null ? appointmentRepository.countByCompanyIdAndStatus(companyId, AppointmentStatus.CONFIRMED) : appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED);
        long completedCount = companyId != null ? appointmentRepository.countByCompanyIdAndStatus(companyId, AppointmentStatus.COMPLETED) : appointmentRepository.countByStatus(AppointmentStatus.COMPLETED);
        long cancelledCount = companyId != null ? appointmentRepository.countByCompanyIdAndStatus(companyId, AppointmentStatus.CANCELLED) : appointmentRepository.countByStatus(AppointmentStatus.CANCELLED);
        long noShowCount    = companyId != null ? appointmentRepository.countByCompanyIdAndStatus(companyId, AppointmentStatus.NO_SHOW) : appointmentRepository.countByStatus(AppointmentStatus.NO_SHOW);
        long confirmedCount = companyId != null ? appointmentRepository.countByCompanyIdAndStatus(companyId, AppointmentStatus.CONFIRMED) : appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("todayCount",     todayCount);
        m.put("upcomingCount",  upcomingCount);
        m.put("completedCount", completedCount);
        m.put("cancelledCount", cancelledCount);
        m.put("noShowCount",    noShowCount);
        m.put("confirmedCount", confirmedCount);
        return m;
    }
}


