package com.fashionerp.trial;

import com.fashionerp.customer.Customer;
import com.fashionerp.customer.CustomerRepository;
import com.fashionerp.order.Order;
import com.fashionerp.order.OrderRepository;
import com.fashionerp.production.ProductionController;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrialService {

    private final TrialRepository trialRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final ProductionController productionController;

    public Page<TrialDto.Response> list(String search, String status, String fitStatus, LocalDate date, Pageable pageable) {
        return trialRepository.search(search, status, fitStatus, date, pageable).map(TrialDto.Response::from);
    }

    public TrialDto.Response getById(UUID id) {
        return trialRepository.findById(id)
                .map(TrialDto.Response::from)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found: " + id));
    }

    public TrialDto.Response getByCode(String trialCode) {
        return trialRepository.findByTrialCode(trialCode)
                .map(TrialDto.Response::from)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found with code: " + trialCode));
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

        String code = "TRL-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

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
                .alterations(new ArrayList<>())
                .build();

        if (req.getAlterations() != null) {
            for (TrialDto.AlterationItem item : req.getAlterations()) {
                trial.getAlterations().add(TrialAlteration.builder()
                        .trial(trial)
                        .description(item.getDescription())
                        .category(item.getCategory() != null ? item.getCategory() : "Fit")
                        .completed(item.getCompleted() != null ? item.getCompleted() : false)
                        .assignedTailor(item.getAssignedTailor())
                        .priority(item.getPriority() != null ? item.getPriority() : "Normal")
                        .targetDate(item.getTargetDate())
                        .tailorNotes(item.getTailorNotes())
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
        if (req.getNotes() != null) trial.setNotes(req.getNotes());
        if (req.getSpecNotes() != null) trial.setSpecNotes(req.getSpecNotes());

        if (req.getAlterations() != null) {
            trial.getAlterations().clear();
            for (TrialDto.AlterationItem item : req.getAlterations()) {
                trial.getAlterations().add(TrialAlteration.builder()
                        .trial(trial)
                        .description(item.getDescription())
                        .category(item.getCategory() != null ? item.getCategory() : "Fit")
                        .completed(item.getCompleted() != null ? item.getCompleted() : false)
                        .assignedTailor(item.getAssignedTailor())
                        .priority(item.getPriority() != null ? item.getPriority() : "Normal")
                        .targetDate(item.getTargetDate())
                        .tailorNotes(item.getTailorNotes())
                        .build());
            }
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

        String code = "TRL-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

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
    public TrialDto.Response scheduleRetrial(UUID trialId, TrialDto.Request req) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found: " + trialId));

        int nextAttempt = (trial.getTrialAttempt() != null ? trial.getTrialAttempt() : 1) + 1;
        trial.setTrialAttempt(nextAttempt);
        trial.setStatus("RETRIAL_SCHEDULED");
        trial.setStage("Re-trial Attempt #" + nextAttempt);

        if (req != null) {
            if (req.getTrialDate() != null) trial.setTrialDate(req.getTrialDate());
            if (req.getTrialTime() != null) trial.setTrialTime(req.getTrialTime());
            if (req.getDesignerName() != null) trial.setDesignerName(req.getDesignerName());
            if (req.getNotes() != null) trial.setNotes(req.getNotes());
        }

        return TrialDto.Response.from(trialRepository.save(trial));
    }

    @Transactional
    public TrialDto.Response completeAndAdvance(UUID trialId) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found: " + trialId));

        trial.setStatus("COMPLETED");
        trial.setFitStatus("PERFECT");
        Trial saved = trialRepository.save(trial);

        if (trial.getOrder() != null) {
            try {
                productionController.transitionStage(
                        trial.getOrder().getId(),
                        "QC",
                        null,
                        "Passed Trial Fitting - Perfect Fit (Attempt #" + (trial.getTrialAttempt() != null ? trial.getTrialAttempt() : 1) + ")"
                );
            } catch (Exception e) {
                // Catch any transition stage alias fallback
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

    @Transactional
    public TrialDto.Response toggleAlteration(UUID trialId, UUID alterationId, Boolean completed) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new IllegalArgumentException("Trial not found: " + trialId));

        if (trial.getAlterations() != null) {
            trial.getAlterations().stream()
                    .filter(a -> a.getId().equals(alterationId))
                    .findFirst()
                    .ifPresent(a -> a.setCompleted(completed != null ? completed : !Boolean.TRUE.equals(a.getCompleted())));
        }

        return TrialDto.Response.from(trialRepository.save(trial));
    }
}

