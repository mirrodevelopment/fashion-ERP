package com.fashionerp.enquiry;

import com.fashionerp.common.TenantContext;
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
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/enquiries")
@RequiredArgsConstructor
public class EnquiryController {

    private final EnquiryRepository enquiryRepository;
    private final com.fashionerp.appointment.AppointmentRepository appointmentRepository;
    private final com.fashionerp.common.BranchAccessService branchAccessService;

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
        UUID companyId = TenantContext.getCompanyId();
        String branchFilter = branchAccessService.getEffectiveBranchFilter(com.fashionerp.common.BranchAccessService.BranchModule.ENQUIRIES);
        return enquiryRepository.search(companyId, branchFilter, search, status, pageable);
    }

    @GetMapping("/{id}")
    public Enquiry getById(@PathVariable UUID id) {
        Enquiry existing = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enquiry not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(existing.getCompanyId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Enquiry not found: " + id);
        }
        return existing;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Enquiry create(@RequestBody Enquiry enquiry) {
        UUID companyId = TenantContext.getCompanyId();
        if (enquiry.getCompanyId() == null && companyId != null) {
            enquiry.setCompanyId(companyId);
        }
        if (enquiry.getEnquiryCode() == null || enquiry.getEnquiryCode().isBlank()) {
            long count = (companyId != null ? enquiryRepository.countByCompanyId(companyId) : enquiryRepository.count()) + 1;
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
        if (enquiry.getBranch() == null || enquiry.getBranch().isBlank()) {
            enquiry.setBranch(branchAccessService.getDefaultBranchForCreation());
        }
        return enquiryRepository.save(enquiry);
    }


    @PutMapping("/{id}")
    public Enquiry update(@PathVariable UUID id, @RequestBody Enquiry updated) {
        Enquiry existing = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enquiry not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(existing.getCompanyId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Enquiry not found: " + id);
        }

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
        Enquiry existing = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enquiry not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(existing.getCompanyId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Enquiry not found: " + id);
        }
        enquiryRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/kpis")
    public Map<String, Object> kpis(@RequestParam(required = false) String branch) {
        UUID companyId = TenantContext.getCompanyId();
        String branchFilter = branchAccessService.resolveBranch(branch, com.fashionerp.common.BranchAccessService.BranchModule.ENQUIRIES);

        long total;
        long newCount;
        long inDiscussion;
        long quotationSent;
        long converted;
        long followUp;
        long closed;
        long newThisWeek;

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = LocalDate.now();

        if (branchFilter != null) {
            total = enquiryRepository.countByCompanyIdAndBranch(companyId, branchFilter);
            newCount = enquiryRepository.countByCompanyIdAndStatusIgnoreCaseAndBranch(companyId, "NEW", branchFilter)
                    + enquiryRepository.countByCompanyIdAndStatusIgnoreCaseAndBranch(companyId, "PENDING", branchFilter);
            inDiscussion = enquiryRepository.countByCompanyIdAndStatusIgnoreCaseAndBranch(companyId, "IN_DISCUSSION", branchFilter);
            quotationSent = enquiryRepository.countByCompanyIdAndStatusIgnoreCaseAndBranch(companyId, "QUOTATION_SENT", branchFilter);
            converted = enquiryRepository.countByCompanyIdAndStatusIgnoreCaseAndBranch(companyId, "CONVERTED", branchFilter);
            followUp = enquiryRepository.countByCompanyIdAndStatusIgnoreCaseAndBranch(companyId, "FOLLOW_UP", branchFilter);
            closed = enquiryRepository.countByCompanyIdAndStatusIgnoreCaseAndBranch(companyId, "CLOSED", branchFilter) + followUp;
            newThisWeek = enquiryRepository.countByCompanyIdAndCreatedAtAfterAndBranch(companyId, now.minusDays(7), branchFilter);
        } else {
            total = companyId != null ? enquiryRepository.countByCompanyId(companyId) : enquiryRepository.count();
            newCount = enquiryRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "NEW")
                    + enquiryRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "PENDING");
            inDiscussion = enquiryRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "IN_DISCUSSION");
            quotationSent = enquiryRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "QUOTATION_SENT");
            converted = enquiryRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "CONVERTED");
            followUp = enquiryRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "FOLLOW_UP");
            closed = enquiryRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "CLOSED") + followUp;
            newThisWeek = enquiryRepository.countByCompanyIdAndCreatedAtAfter(companyId, now.minusDays(7));
        }

        long pendingFollowUp = followUp;
        long appointmentsCount = companyId != null ? appointmentRepository.countByCompanyId(companyId) : appointmentRepository.count();

        BigDecimal conversionRate = total > 0
                ? BigDecimal.valueOf(converted * 100.0 / total).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 1. Month-over-Month for Total Enquiries
        LocalDateTime thisMonthStart = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime lastMonthStart = thisMonthStart.minusMonths(1);
        long enquiriesThisMonth = enquiryRepository.countCreatedBetween(companyId, thisMonthStart, now, branchFilter);
        long enquiriesLastMonth = enquiryRepository.countCreatedBetween(companyId, lastMonthStart, thisMonthStart, branchFilter);

        Map<String, Object> totalTrend = new LinkedHashMap<>();
        if (enquiriesLastMonth > 0) {
            long diff = enquiriesThisMonth - enquiriesLastMonth;
            long pct = Math.round((diff * 100.0) / enquiriesLastMonth);
            if (diff > 0) {
                totalTrend.put("arrow", "↑");
                totalTrend.put("value", "+" + pct + "%");
                totalTrend.put("sub", "vs last month");
                totalTrend.put("type", "trend-up");
            } else if (diff < 0) {
                totalTrend.put("arrow", "↓");
                totalTrend.put("value", pct + "%");
                totalTrend.put("sub", "vs last month");
                totalTrend.put("type", "trend-down");
            } else {
                totalTrend.put("arrow", "—");
                totalTrend.put("value", "0%");
                totalTrend.put("sub", "vs last month");
                totalTrend.put("type", "trend-neutral");
            }
        } else {
            if (enquiriesThisMonth > 0) {
                totalTrend.put("arrow", "↑");
                totalTrend.put("value", "+" + enquiriesThisMonth);
                totalTrend.put("sub", "new this month");
                totalTrend.put("type", "trend-up");
            } else {
                totalTrend.put("arrow", "—");
                totalTrend.put("value", "0");
                totalTrend.put("sub", total > 0 ? "vs last month" : "enquiries recorded");
                totalTrend.put("type", "trend-neutral");
            }
        }

        // 2. Week-over-Week for New This Week
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime fourteenDaysAgo = now.minusDays(14);
        long enquiriesThisWeek = enquiryRepository.countCreatedBetween(companyId, sevenDaysAgo, now, branchFilter);
        long enquiriesPrevWeek = enquiryRepository.countCreatedBetween(companyId, fourteenDaysAgo, sevenDaysAgo, branchFilter);

        Map<String, Object> newThisWeekTrend = new LinkedHashMap<>();
        if (enquiriesPrevWeek > 0) {
            long diff = enquiriesThisWeek - enquiriesPrevWeek;
            long pct = Math.round((diff * 100.0) / enquiriesPrevWeek);
            if (diff > 0) {
                newThisWeekTrend.put("arrow", "↑");
                newThisWeekTrend.put("value", "+" + pct + "%");
                newThisWeekTrend.put("sub", "vs last week");
                newThisWeekTrend.put("type", "trend-up");
            } else if (diff < 0) {
                newThisWeekTrend.put("arrow", "↓");
                newThisWeekTrend.put("value", pct + "%");
                newThisWeekTrend.put("sub", "vs last week");
                newThisWeekTrend.put("type", "trend-down");
            } else {
                newThisWeekTrend.put("arrow", "—");
                newThisWeekTrend.put("value", "0%");
                newThisWeekTrend.put("sub", "vs last week");
                newThisWeekTrend.put("type", "trend-neutral");
            }
        } else {
            if (enquiriesThisWeek > 0) {
                newThisWeekTrend.put("arrow", "↑");
                newThisWeekTrend.put("value", "+" + enquiriesThisWeek);
                newThisWeekTrend.put("sub", "new this week");
                newThisWeekTrend.put("type", "trend-up");
            } else {
                newThisWeekTrend.put("arrow", "—");
                newThisWeekTrend.put("value", "0");
                newThisWeekTrend.put("sub", "this week");
                newThisWeekTrend.put("type", "trend-neutral");
            }
        }

        // 3. Converted to Orders Trend & Rate
        long convertedThisMonth = enquiryRepository.countConvertedBetween(companyId, thisMonthStart, now, branchFilter);
        long convertedLastMonth = enquiryRepository.countConvertedBetween(companyId, lastMonthStart, thisMonthStart, branchFilter);

        Map<String, Object> convertedTrend = new LinkedHashMap<>();
        if (convertedLastMonth > 0) {
            long diff = convertedThisMonth - convertedLastMonth;
            long pct = Math.round((diff * 100.0) / convertedLastMonth);
            convertedTrend.put("arrow", diff >= 0 ? "↑" : "↓");
            convertedTrend.put("value", (diff >= 0 ? "+" : "") + pct + "%");
            convertedTrend.put("sub", conversionRate + "% conversion rate");
            convertedTrend.put("type", diff >= 0 ? "trend-up" : "trend-down");
        } else {
            if (converted > 0) {
                convertedTrend.put("arrow", "↑");
                convertedTrend.put("value", conversionRate + "%");
                convertedTrend.put("sub", "conversion rate");
                convertedTrend.put("type", "trend-up");
            } else {
                convertedTrend.put("arrow", "—");
                convertedTrend.put("value", "0.0%");
                convertedTrend.put("sub", "conversion rate");
                convertedTrend.put("type", "trend-neutral");
            }
        }

        // 4. Appointments Trend
        LocalDateTime startOfWeek = now.with(DayOfWeek.MONDAY).toLocalDate().atStartOfDay();
        LocalDateTime endOfWeek = startOfWeek.plusDays(7);
        long apptsThisWeek = companyId != null
                ? appointmentRepository.countByCompanyIdAndScheduledAtBetween(companyId, startOfWeek, endOfWeek)
                : 0L;

        Map<String, Object> appointmentsTrend = new LinkedHashMap<>();
        if (apptsThisWeek > 0) {
            appointmentsTrend.put("arrow", "↑");
            appointmentsTrend.put("value", String.valueOf(apptsThisWeek));
            appointmentsTrend.put("sub", "this week");
            appointmentsTrend.put("type", "trend-up");
        } else {
            appointmentsTrend.put("arrow", "—");
            appointmentsTrend.put("value", "0");
            appointmentsTrend.put("sub", "this week");
            appointmentsTrend.put("type", "trend-neutral");
        }

        // 5. Pending Follow-up Trend
        long overdueFollowUps = enquiryRepository.countOverdueFollowUps(companyId, today, branchFilter);
        Map<String, Object> pendingFollowUpTrend = new LinkedHashMap<>();
        if (overdueFollowUps > 0) {
            pendingFollowUpTrend.put("arrow", "↓");
            pendingFollowUpTrend.put("value", String.valueOf(overdueFollowUps));
            pendingFollowUpTrend.put("sub", "need attention");
            pendingFollowUpTrend.put("type", "trend-down");
        } else if (pendingFollowUp > 0) {
            pendingFollowUpTrend.put("arrow", "—");
            pendingFollowUpTrend.put("value", String.valueOf(pendingFollowUp));
            pendingFollowUpTrend.put("sub", "scheduled");
            pendingFollowUpTrend.put("type", "trend-neutral");
        } else {
            pendingFollowUpTrend.put("arrow", "✓");
            pendingFollowUpTrend.put("value", "0");
            pendingFollowUpTrend.put("sub", "need attention");
            pendingFollowUpTrend.put("type", "trend-neutral");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", total);
        result.put("newThisWeek", newThisWeek);
        result.put("converted", converted);
        result.put("appointments", appointmentsCount);
        result.put("pendingFollowUp", pendingFollowUp);
        result.put("conversionRate", conversionRate);

        result.put("totalTrend", totalTrend);
        result.put("newThisWeekTrend", newThisWeekTrend);
        result.put("convertedTrend", convertedTrend);
        result.put("appointmentsTrend", appointmentsTrend);
        result.put("pendingFollowUpTrend", pendingFollowUpTrend);

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
