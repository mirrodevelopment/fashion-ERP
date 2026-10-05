package com.fashionerp.trial;
 
import com.fashionerp.appointment.Appointment;
import com.fashionerp.appointment.AppointmentRepository;
import com.fashionerp.appointment.AppointmentStatus;
import com.fashionerp.appointment.AppointmentType;
import com.fashionerp.common.TenantContext;
import com.fashionerp.customer.Customer;
import com.fashionerp.customer.CustomerRepository;
import com.fashionerp.order.Order;
import com.fashionerp.order.OrderRepository;
import com.fashionerp.production.ProductionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrialService {

    private final TrialRepository trialRepository;
    private final TrialAlterationRepository trialAlterationRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final ProductionService productionService;
    private final AppointmentRepository appointmentRepository;
    private final com.fashionerp.common.BranchAccessService branchAccessService;

    public Page<TrialDto.Response> list(String search, String status, String fitStatus, LocalDate date, Pageable pageable) {
        UUID companyId = TenantContext.getCompanyId();
        String branchFilter = branchAccessService.getEffectiveBranchFilter(com.fashionerp.common.BranchAccessService.BranchModule.TRIALS);
        return trialRepository.search(companyId, branchFilter, search, status, fitStatus, date, pageable).map(TrialDto.Response::from);
    }

    public TrialDto.Response getById(UUID id) {
        Trial trial = trialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(trial.getCompanyId())) {
            throw new IllegalArgumentException("Trial not found: " + id);
        }
        return TrialDto.Response.from(trial);
    }

    public TrialDto.Response getByCode(String trialCode) {
        UUID companyId = TenantContext.getCompanyId();
        Trial trial = (companyId != null
                ? trialRepository.findByTrialCodeAndCompanyId(trialCode, companyId)
                : trialRepository.findByTrialCode(trialCode))
                .orElseThrow(() -> new IllegalArgumentException("Trial not found with code: " + trialCode));
        return TrialDto.Response.from(trial);
    }

    @Transactional
    public TrialDto.Response create(TrialDto.Request req) {
        String cleanMobile = req.getCustomerMobile() != null ? req.getCustomerMobile().replaceAll("[^0-9+]", "") : "";
        Customer customer = customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .orElse(null);

        Order order = null;
        if (req.getOrderCode() != null && !req.getOrderCode().isBlank()) {
            order = orderRepository.findByOrderCode(req.getOrderCode()).orElse(null);
        }

        // BUG-P1-06 FIX: High-resolution timestamp + random suffix to prevent collisions
        String code = "TRL-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")) + "-" + (100 + (int)(Math.random() * 900));

        int attempt = req.getTrialAttempt() != null ? req.getTrialAttempt() : 1;
        int altCount = req.getAlterationCount() != null ? req.getAlterationCount() : 0;
        String stageLabel = req.getStage() != null ? req.getStage() : (attempt <= 1 ? "First Trial (Attempt #1)" : ("Re-trial Attempt #" + attempt));

        Trial trial = Trial.builder()
                .trialCode(code)
                .order(order)
                .orderCode(req.getOrderCode() != null ? req.getOrderCode() : (order != null ? order.getOrderCode() : ""))
                .customer(customer)
                .customerName(customer != null ? customer.getName() : req.getCustomerName())
                .garmentType(req.getGarmentType() != null ? req.getGarmentType() : "General")
                .collection(req.getCollection())
                .trialDate(req.getTrialDate() != null ? req.getTrialDate() : LocalDate.now())
                .trialTime(req.getTrialTime() != null ? req.getTrialTime() : "11:00 AM")
                .stage(stageLabel)
                .status(req.getStatus() != null ? req.getStatus() : "TODAY")
                .fitStatus(req.getFitStatus() != null ? req.getFitStatus() : "PENDING")
                .trialAttempt(attempt)
                .alterationCount(altCount)
                .customerFeedback(req.getCustomerFeedback())
                .customerRating(req.getCustomerRating() != null ? req.getCustomerRating() : 5)
                .fitPreference(req.getFitPreference() != null ? req.getFitPreference() : "Comfort / Regular Fit")
                .fitCheckpoints(req.getFitCheckpoints())
                .fitNotes(req.getFitNotes())
                .designerName(req.getDesignerName())
                .deliveryDate(req.getDeliveryDate())
                .neckStyle(req.getNeckStyle())
                .sleeveStyle(req.getSleeveStyle())
                .lining(req.getLining())
                .embroidery(req.getEmbroidery())
                .fabric(req.getFabric())
                .specNotes(req.getSpecNotes())
                .notes(req.getNotes())
                .branch(branchAccessService.getDefaultBranchForCreation())
                .alterations(new ArrayList<>())
                .build();

        if (req.getAlterations() != null) {
            for (TrialDto.AlterationItem item : req.getAlterations()) {
                boolean completed = Boolean.TRUE.equals(item.getCompleted());
                trial.getAlterations().add(TrialAlteration.builder()
                        .trial(trial)
                        .description(item.getDescription() != null ? item.getDescription() : "Alteration")
                        .category(item.getCategory() != null ? item.getCategory() : "Fit")
                        .completed(completed)
                        .status(item.getStatus() != null ? item.getStatus() : (completed ? "COMPLETED" : "PENDING"))
                        .assignedTailor(item.getAssignedTailor())
                        .priority(item.getPriority() != null ? item.getPriority() : "Normal")
                        .targetDate(item.getTargetDate() != null ? item.getTargetDate() : trial.getDeliveryDate())
                        .tailorNotes(item.getTailorNotes())
                        .completedAt(completed ? (item.getCompletedAt() != null ? item.getCompletedAt() : LocalDateTime.now()) : null)
                        .completedBy(completed ? (item.getCompletedBy() != null ? item.getCompletedBy() : "Master Tailor") : null)
                        .build());
            }
        }

        return TrialDto.Response.from(trialRepository.save(trial));
    }

    @Transactional
    public TrialDto.Response update(UUID id, TrialDto.Request req) {
        Trial trial = trialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found: " + id));

        if (req.getStatus() != null) trial.setStatus(req.getStatus());
        if (req.getFitStatus() != null) trial.setFitStatus(req.getFitStatus());
        if (req.getStage() != null) trial.setStage(req.getStage());
        if (req.getTrialAttempt() != null) trial.setTrialAttempt(req.getTrialAttempt());
        if (req.getAlterationCount() != null) trial.setAlterationCount(req.getAlterationCount());
        if (req.getCustomerFeedback() != null) trial.setCustomerFeedback(req.getCustomerFeedback());
        if (req.getCustomerRating() != null) trial.setCustomerRating(req.getCustomerRating());
        if (req.getFitPreference() != null) trial.setFitPreference(req.getFitPreference());
        if (req.getFitCheckpoints() != null) trial.setFitCheckpoints(req.getFitCheckpoints());
        if (req.getFitNotes() != null) trial.setFitNotes(req.getFitNotes());
        if (req.getDesignerName() != null) trial.setDesignerName(req.getDesignerName());
        if (req.getTrialDate() != null) trial.setTrialDate(req.getTrialDate());
        if (req.getTrialTime() != null) trial.setTrialTime(req.getTrialTime());
        if (req.getDeliveryDate() != null) trial.setDeliveryDate(req.getDeliveryDate());
        if (req.getNextTrialDate() != null) trial.setNextTrialDate(req.getNextTrialDate());
        if (req.getCompletedAt() != null) trial.setCompletedAt(req.getCompletedAt());
        if (req.getCompletedBy() != null) trial.setCompletedBy(req.getCompletedBy());
        if (req.getNotes() != null) trial.setNotes(req.getNotes());
        if (req.getSpecNotes() != null) trial.setSpecNotes(req.getSpecNotes());

        if (req.getAlterations() != null) {
            if (trial.getAlterations() == null) {
                trial.setAlterations(new ArrayList<>());
            }
            Map<UUID, TrialAlteration> existingMap = new LinkedHashMap<>();
            for (TrialAlteration existing : trial.getAlterations()) {
                if (existing.getId() != null) {
                    existingMap.put(existing.getId(), existing);
                }
            }

            List<TrialAlteration> updatedList = new ArrayList<>();
            for (TrialDto.AlterationItem item : req.getAlterations()) {
                boolean completed = Boolean.TRUE.equals(item.getCompleted());
                if (item.getId() != null && existingMap.containsKey(item.getId())) {
                    TrialAlteration existing = existingMap.get(item.getId());
                    if (item.getDescription() != null) existing.setDescription(item.getDescription());
                    if (item.getCategory() != null) existing.setCategory(item.getCategory());
                    existing.setCompleted(completed);
                    existing.setStatus(item.getStatus() != null ? item.getStatus() : (completed ? "COMPLETED" : "PENDING"));
                    if (item.getAssignedTailor() != null) existing.setAssignedTailor(item.getAssignedTailor());
                    if (item.getPriority() != null) existing.setPriority(item.getPriority());
                    if (item.getTargetDate() != null) existing.setTargetDate(item.getTargetDate());
                    if (item.getTailorNotes() != null) existing.setTailorNotes(item.getTailorNotes());
                    if (completed && existing.getCompletedAt() == null) {
                        existing.setCompletedAt(item.getCompletedAt() != null ? item.getCompletedAt() : LocalDateTime.now());
                        existing.setCompletedBy(item.getCompletedBy() != null ? item.getCompletedBy() : "Master Tailor");
                    } else if (!completed) {
                        existing.setCompletedAt(null);
                        existing.setCompletedBy(null);
                    }
                    updatedList.add(existing);
                    existingMap.remove(item.getId());
                } else {
                    TrialAlteration newAlt = TrialAlteration.builder()
                            .trial(trial)
                            .description(item.getDescription() != null ? item.getDescription() : "Alteration")
                            .category(item.getCategory() != null ? item.getCategory() : "Fit")
                            .completed(completed)
                            .status(item.getStatus() != null ? item.getStatus() : (completed ? "COMPLETED" : "PENDING"))
                            .assignedTailor(item.getAssignedTailor())
                            .priority(item.getPriority() != null ? item.getPriority() : "Normal")
                            .targetDate(item.getTargetDate() != null ? item.getTargetDate() : trial.getDeliveryDate())
                            .tailorNotes(item.getTailorNotes())
                            .completedAt(completed ? (item.getCompletedAt() != null ? item.getCompletedAt() : LocalDateTime.now()) : null)
                            .completedBy(completed ? (item.getCompletedBy() != null ? item.getCompletedBy() : "Master Tailor") : null)
                            .build();
                    updatedList.add(newAlt);
                }
            }
            trial.getAlterations().clear();
            trial.getAlterations().addAll(updatedList);
            trial.setAlterationCount(trial.getAlterations().size());
        }

        return TrialDto.Response.from(trialRepository.save(trial));
    }

    @Transactional
    public TrialDto.Response createOrGetForOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        Optional<Trial> existing = trialRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId);
        if (existing.isPresent()) {
            return TrialDto.Response.from(existing.get());
        }

        long priorCount = trialRepository.countByOrderCode(order.getOrderCode());
        int attempt = (int) (priorCount + 1);
        String stageLabel = attempt == 1 ? "First Trial (Attempt #1)" : ("Re-trial Attempt #" + attempt);

        // BUG-P1-06 FIX: High-resolution timestamp + random suffix to prevent collisions
        String code = "TRL-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")) + "-" + (100 + (int)(Math.random() * 900));

        Trial trial = Trial.builder()
                .trialCode(code)
                .order(order)
                .orderCode(order.getOrderCode())
                .customer(order.getCustomer())
                .customerName(order.getCustomerName() != null && !order.getCustomerName().isBlank()
                        ? order.getCustomerName()
                        : (order.getCustomer() != null ? order.getCustomer().getName() : ""))
                .garmentType(order.getGarmentType() != null ? order.getGarmentType() : "Custom Garment")
                .collection(order.getCollection())
                .trialDate(LocalDate.now())
                .trialTime("11:00 AM")
                .stage(stageLabel)
                .status("TODAY")
                .fitStatus("PENDING")
                .trialAttempt(attempt)
                .alterationCount(0)
                .customerRating(5)
                .fitPreference("Comfort / Regular Fit")
                .deliveryDate(order.getExpectedDeliveryDate() != null ? order.getExpectedDeliveryDate() : order.getDueDate())
                .specNotes(order.getProductionNotes())
                .notes(order.getNotes())
                .alterations(new ArrayList<>())
                .build();

        return TrialDto.Response.from(trialRepository.save(trial));
    }

    @Transactional
    public TrialDto.Response addAlteration(UUID trialId, TrialDto.AlterationItem item) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found: " + trialId));

        if (trial.getAlterations() == null) {
            trial.setAlterations(new ArrayList<>());
        }

        boolean completed = Boolean.TRUE.equals(item.getCompleted());
        TrialAlteration alt = TrialAlteration.builder()
                .trial(trial)
                .description(item.getDescription() != null ? item.getDescription() : "Alteration")
                .category(item.getCategory() != null ? item.getCategory() : "Fit")
                .completed(completed)
                .status(item.getStatus() != null ? item.getStatus() : (completed ? "COMPLETED" : "PENDING"))
                .assignedTailor(item.getAssignedTailor())
                .priority(item.getPriority() != null ? item.getPriority() : "Normal")
                .targetDate(item.getTargetDate() != null ? item.getTargetDate() : trial.getDeliveryDate())
                .tailorNotes(item.getTailorNotes())
                .completedAt(completed ? (item.getCompletedAt() != null ? item.getCompletedAt() : LocalDateTime.now()) : null)
                .completedBy(completed ? (item.getCompletedBy() != null ? item.getCompletedBy() : "Master Tailor") : null)
                .build();

        trial.getAlterations().add(alt);
        trial.setAlterationCount(trial.getAlterations().size());

        if (!"COMPLETED".equalsIgnoreCase(trial.getStatus()) && !"RETRIAL_SCHEDULED".equalsIgnoreCase(trial.getStatus())) {
            trial.setStatus("IN_ALTERATION");
        }

        return TrialDto.Response.from(trialRepository.save(trial));
    }

    @Transactional
    public TrialDto.Response deleteAlteration(UUID trialId, UUID alterationId) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found: " + trialId));

        if (trial.getAlterations() != null) {
            boolean removed = trial.getAlterations().removeIf(a -> a.getId().equals(alterationId));
            if (removed) {
                trial.setAlterationCount(trial.getAlterations().size());
            }
        }
        return TrialDto.Response.from(trialRepository.save(trial));
    }

    @Transactional
    public TrialDto.Response toggleAlteration(UUID trialId, UUID alterationId, Boolean completed) {
        return toggleAlteration(trialId, alterationId, completed, "Master Tailor");
    }

    @Transactional
    public TrialDto.Response toggleAlteration(UUID trialId, UUID alterationId, Boolean completed, String completedBy) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found: " + trialId));

        if (trial.getAlterations() != null) {
            trial.getAlterations().stream()
                    .filter(a -> a.getId().equals(alterationId))
                    .findFirst()
                    .ifPresent(a -> {
                        boolean newState = completed != null ? completed : !Boolean.TRUE.equals(a.getCompleted());
                        a.setCompleted(newState);
                        a.setStatus(newState ? "COMPLETED" : "PENDING");
                        a.setCompletedAt(newState ? LocalDateTime.now() : null);
                        a.setCompletedBy(newState ? (completedBy != null && !completedBy.isBlank() ? completedBy : "Master Tailor") : null);
                    });
        }

        return TrialDto.Response.from(trialRepository.save(trial));
    }

    @Transactional
    public TrialDto.Response scheduleRetrial(UUID trialId, TrialDto.Request req) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found: " + trialId));

        int nextAttempt = (trial.getTrialAttempt() != null ? trial.getTrialAttempt() : 1) + 1;
        trial.setTrialAttempt(nextAttempt);
        trial.setStatus("RETRIAL_SCHEDULED");
        trial.setFitStatus("RETRIAL");
        trial.setStage("Re-trial Attempt #" + nextAttempt);

        LocalDate scheduledDate = LocalDate.now().plusDays(2);
        String scheduledTime = "11:00 AM";

        if (req != null) {
            if (req.getTrialDate() != null) {
                scheduledDate = req.getTrialDate();
                trial.setTrialDate(scheduledDate);
                trial.setNextTrialDate(scheduledDate);
            }
            if (req.getTrialTime() != null) {
                scheduledTime = req.getTrialTime();
                trial.setTrialTime(scheduledTime);
            }
            if (req.getDesignerName() != null) trial.setDesignerName(req.getDesignerName());
            if (req.getNotes() != null) trial.setNotes(req.getNotes());
        }

        Trial saved = trialRepository.save(trial);

        // Book Appointment in appointments table
        if (trial.getCustomer() != null) {
            try {
                LocalDateTime apptTime = parseScheduledDateTime(scheduledDate, scheduledTime);
                Appointment appt = Appointment.builder()
                        .customer(trial.getCustomer())
                        .order(trial.getOrder())
                        .apptType(AppointmentType.TRIAL)
                        .scheduledAt(apptTime)
                        .durationMinutes(45)
                        .status(AppointmentStatus.SCHEDULED)
                        .staffAssigned(trial.getDesignerName() != null ? trial.getDesignerName() : "Lead Designer")
                        .notes("Re-trial Attempt #" + nextAttempt + " for Order " + trial.getOrderCode() +
                                (req != null && req.getNotes() != null ? " - " + req.getNotes() : ""))
                        .build();
                appointmentRepository.save(appt);
                log.info("Booked re-trial appointment for customer {} on {}", trial.getCustomer().getMobileNumber(), apptTime);
            } catch (Exception e) {
                log.warn("Could not auto-create re-trial appointment: {}", e.getMessage());
            }
        }

        return TrialDto.Response.from(saved);
    }

    @Transactional
    public TrialDto.Response completeAndAdvance(UUID trialId) {
        return completeAndAdvance(trialId, "Boutique Manager");
    }

    @Transactional
    public TrialDto.Response completeAndAdvance(UUID trialId, String completedBy) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found: " + trialId));

        if (trial.getAlterations() != null) {
            for (TrialAlteration a : trial.getAlterations()) {
                if (!Boolean.TRUE.equals(a.getCompleted())) {
                    a.setCompleted(true);
                    a.setStatus("COMPLETED");
                    a.setCompletedAt(LocalDateTime.now());
                    a.setCompletedBy(completedBy != null && !completedBy.isBlank() ? completedBy : "Master Tailor");
                }
            }
        }

        trial.setStatus("COMPLETED");
        trial.setFitStatus("PERFECT");
        trial.setCompletedAt(LocalDateTime.now());
        trial.setCompletedBy(completedBy != null && !completedBy.isBlank() ? completedBy : "Boutique Manager");
        Trial saved = trialRepository.save(trial);

        if (trial.getOrder() != null) {
            // 1. Advance order to QC
            try {
                productionService.transitionStage(
                        trial.getOrder().getId(),
                        "QC",
                        null,
                        "Passed Trial Fitting - Perfect Fit (Attempt #" + (trial.getTrialAttempt() != null ? trial.getTrialAttempt() : 1) + ")"
                );
            } catch (Exception e) {
                log.warn("Could not auto-advance order {} to QC stage: {}", trial.getOrder().getId(), e.getMessage());
            }

            // 2. Mark appointments for this order as COMPLETED
            try {
                List<Appointment> appts = appointmentRepository.findByOrderId(trial.getOrder().getId());
                for (Appointment appt : appts) {
                    if (appt.getApptType() == AppointmentType.TRIAL || appt.getApptType() == AppointmentType.FITTING) {
                        if (appt.getStatus() == AppointmentStatus.SCHEDULED || appt.getStatus() == AppointmentStatus.CONFIRMED) {
                            appt.setStatus(AppointmentStatus.COMPLETED);
                            appointmentRepository.save(appt);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Could not sync appointments for order {}: {}", trial.getOrder().getId(), e.getMessage());
            }
        }

        return TrialDto.Response.from(saved);
    }

    @Transactional
    public TrialDto.Response updateFitStatus(UUID id, String fitStatus) {
        Trial trial = trialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found: " + id));
        trial.setFitStatus(fitStatus);
        return TrialDto.Response.from(trialRepository.save(trial));
    }

    public Map<String, Object> getKpis() {
        LocalDate today = LocalDate.now();
        long total = trialRepository.count();
        long todayCount = trialRepository.countByTrialDateAndStatusNotIgnoreCase(today, "COMPLETED");
        long upcoming = trialRepository.countByTrialDateGreaterThanAndStatusNotIgnoreCase(today, "COMPLETED");
        long overdue = trialRepository.countByTrialDateLessThanAndStatusNotIgnoreCase(today, "COMPLETED");
        long completed = trialRepository.countByStatusIgnoreCase("COMPLETED");

        long perfect = trialRepository.countByFitStatusIgnoreCase("PERFECT");
        long minor = trialRepository.countByFitStatusIgnoreCase("MINOR");
        long major = trialRepository.countByFitStatusIgnoreCase("MAJOR");
        long retrial = trialRepository.countByFitStatusIgnoreCase("RETRIAL");

        long pendingAlterations = trialAlterationRepository.countByCompletedFalse();
        long retrialsRequired = trialRepository.countByTrialAttemptGreaterThanAndStatusNotIgnoreCase(1, "COMPLETED");

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("total", total);
        m.put("today", todayCount);
        m.put("upcoming", upcoming);
        m.put("overdue", overdue);
        m.put("completed", completed);
        m.put("perfect", perfect);
        m.put("minor", minor);
        m.put("major", major);
        m.put("retrial", retrial);
        m.put("pendingAlterations", pendingAlterations);
        m.put("retrialsRequired", retrialsRequired);
        return m;
    }

    private LocalDateTime parseScheduledDateTime(LocalDate date, String timeStr) {
        if (date == null) date = LocalDate.now();
        if (timeStr == null || timeStr.isBlank()) return date.atTime(11, 0);
        try {
            DateTimeFormatter dtf12 = DateTimeFormatter.ofPattern("h:mm a", java.util.Locale.ENGLISH);
            return date.atTime(LocalTime.parse(timeStr.trim().toUpperCase(), dtf12));
        } catch (Exception e1) {
            try {
                return date.atTime(LocalTime.parse(timeStr.trim()));
            } catch (Exception e2) {
                return date.atTime(11, 0);
            }
        }
    }

    public long countByOrderCode(String orderCode) {
        return trialRepository.countByOrderCode(orderCode);
    }
}

