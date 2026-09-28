package com.fashionerp.enquiry;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/enquiries")
@RequiredArgsConstructor
public class EnquiryController {

    private final EnquiryRepository enquiryRepository;
    private final com.fashionerp.appointment.AppointmentRepository appointmentRepository;

    @GetMapping
    public Page<Enquiry> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (status != null && !status.isBlank()) {
            if ("all".equalsIgnoreCase(status)) {
                status = null;
            } else {
                status = status.trim().toUpperCase().replace('-', '_');
            }
        } else {
            status = null;
        }
        return enquiryRepository.search(search, status, pageable);
    }

    @GetMapping("/{id}")
    public Enquiry getById(@PathVariable UUID id) {
        return enquiryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enquiry not found: " + id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Enquiry create(@RequestBody Enquiry enquiry) {
        if (enquiry.getEnquiryCode() == null || enquiry.getEnquiryCode().isBlank()) {
            long count = enquiryRepository.count() + 1;
            enquiry.setEnquiryCode(String.format("ENQ-%04d", count));
        }
        if (enquiry.getStatus() == null || enquiry.getStatus().isBlank()) {
            enquiry.setStatus("NEW");
        } else {
            enquiry.setStatus(enquiry.getStatus().toUpperCase().replace('-', '_'));
        }
        if (enquiry.getSource() == null || enquiry.getSource().isBlank()) {
            enquiry.setSource("WALK_IN");
        }
        return enquiryRepository.save(enquiry);
    }

    @PutMapping("/{id}")
    public Enquiry update(@PathVariable UUID id, @RequestBody Enquiry updated) {
        Enquiry existing = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enquiry not found: " + id));

        if (updated.getCustomerName() != null) existing.setCustomerName(updated.getCustomerName());
        if (updated.getPhone() != null) existing.setPhone(updated.getPhone());
        if (updated.getEmail() != null) existing.setEmail(updated.getEmail());
        if (updated.getGarmentType() != null) existing.setGarmentType(updated.getGarmentType());
        if (updated.getOccasion() != null) existing.setOccasion(updated.getOccasion());
        if (updated.getPreferredDate() != null) existing.setPreferredDate(updated.getPreferredDate());
        if (updated.getEstimatedBudget() != null) existing.setEstimatedBudget(updated.getEstimatedBudget());
        if (updated.getNextAction() != null) existing.setNextAction(updated.getNextAction());
        if (updated.getFabricBrought() != null) existing.setFabricBrought(updated.getFabricBrought());
        if (updated.getAvatarUrl() != null) existing.setAvatarUrl(updated.getAvatarUrl());
        if (updated.getNotes() != null) existing.setNotes(updated.getNotes());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus().toUpperCase().replace('-', '_'));
        if (updated.getAssignedTo() != null) existing.setAssignedTo(updated.getAssignedTo());
        if (updated.getFollowUpDate() != null) existing.setFollowUpDate(updated.getFollowUpDate());
        if (updated.getSource() != null) existing.setSource(updated.getSource());
        if (updated.getConvertedOrder() != null) existing.setConvertedOrder(updated.getConvertedOrder());

        return enquiryRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!enquiryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Enquiry not found: " + id);
        }
        enquiryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/kpis")
    public Map<String, Object> kpis() {
        long total = enquiryRepository.count();
        long newCount = enquiryRepository.countByStatusIgnoreCase("NEW") + enquiryRepository.countByStatusIgnoreCase("PENDING");
        long inDiscussion = enquiryRepository.countByStatusIgnoreCase("IN_DISCUSSION");
        long quotationSent = enquiryRepository.countByStatusIgnoreCase("QUOTATION_SENT");
        long converted = enquiryRepository.countByStatusIgnoreCase("CONVERTED");
        long followUp = enquiryRepository.countByStatusIgnoreCase("FOLLOW_UP");
        long closed = enquiryRepository.countByStatusIgnoreCase("CLOSED") + followUp;

        // Dynamic KPI queries directly from database
        long newThisWeek = enquiryRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(7));
        if (newThisWeek == 0) newThisWeek = newCount;

        long pendingFollowUp = followUp;
        // BUG-P2-03 FIX: appointmentRepository is injected as a required Spring bean
        long appointmentsCount = appointmentRepository.count();

        BigDecimal conversionRate = total > 0
                ? BigDecimal.valueOf(converted * 100.0 / total).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", total);
        result.put("newThisWeek", newThisWeek);
        result.put("converted", converted);
        result.put("appointments", appointmentsCount);
        result.put("pendingFollowUp", pendingFollowUp);
        result.put("conversionRate", conversionRate);

        // Status counts for filter tab badges
        Map<String, Long> tabCounts = new LinkedHashMap<>();
        tabCounts.put("all", total);
        tabCounts.put("new", newCount);
        tabCounts.put("in-discussion", inDiscussion);
        tabCounts.put("quotation-sent", quotationSent);
        tabCounts.put("converted", converted);
        tabCounts.put("closed", closed);
        result.put("tabCounts", tabCounts);

        return result;
    }
}
