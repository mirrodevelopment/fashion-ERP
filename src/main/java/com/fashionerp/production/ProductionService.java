package com.fashionerp.production;

import com.fashionerp.order.Order;
import com.fashionerp.order.OrderRepository;
import com.fashionerp.order.OrderStatus;
import com.fashionerp.workforce.Employee;
import com.fashionerp.workforce.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductionService {

    private final ProductionStageRepository stageRepository;
    private final OrderRepository orderRepository;
    private final EmployeeRepository employeeRepository;
    private final StageDefinitionRepository stageDefinitionRepository;

    /**
     * Dynamically inspects active stage definitions and returns the stage that immediately
     * follows QC by sort_order. If QC is not found or is the last stage, falls back to READY_TO_DELIVER.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getNextStageAfterQc() {
        List<StageDefinition> activeStages = stageDefinitionRepository.findAllByActiveTrueOrderBySortOrderAsc();
        int qcSortOrder = -1;
        for (StageDefinition sd : activeStages) {
            if ("QC".equalsIgnoreCase(sd.getStageKey())) {
                qcSortOrder = sd.getSortOrder() != null ? sd.getSortOrder() : -1;
                break;
            }
        }

        StageDefinition nextStage = null;
        if (qcSortOrder != -1) {
            for (StageDefinition sd : activeStages) {
                if (sd.getSortOrder() != null && sd.getSortOrder() > qcSortOrder) {
                    nextStage = sd;
                    break;
                }
            }
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        if (nextStage != null) {
            resp.put("stageKey", nextStage.getStageKey());
            resp.put("displayName", nextStage.getDisplayName());
            resp.put("sortOrder", nextStage.getSortOrder());
        } else {
            resp.put("stageKey", "READY_TO_DELIVER");
            resp.put("displayName", "Ready to Deliver");
            resp.put("sortOrder", 999);
        }
        return resp;
    }

    /**
     * Transitions an order to a target production stage, updates order status, and adjusts sort-order flags.
     */
    @Transactional
    public Map<String, Object> transitionStage(UUID orderId, String targetStage, UUID employeeId, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));

        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId).orElse(null);
        }

        String rawUpper = targetStage != null ? targetStage.toUpperCase().trim() : "";
        if ("NEXT_AFTER_QC".equals(rawUpper) || "PASS_QC".equals(rawUpper)) {
            Map<String, Object> nextInfo = getNextStageAfterQc();
            rawUpper = ((String) nextInfo.get("stageKey")).toUpperCase().trim();
        }
        final String stUpper = rawUpper;

        order.setCurrentStage(stUpper);
        if ("READY".equals(stUpper) || "READY_TO_DELIVER".equals(stUpper)) {
            order.setStatus(OrderStatus.READY);
        } else if ("ORDER_TAKEN".equals(stUpper) || "ORDER".equals(stUpper)) {
            // ORDER_TAKEN is the only system-recognized first stage; keeps status PENDING
            order.setStatus(OrderStatus.PENDING);
        } else {
            // All other stages (user-defined or QC) move order to IN_PROGRESS
            order.setStatus(OrderStatus.IN_PROGRESS);
        }

        if (notes != null && !notes.isBlank()) {
            order.setProductionNotes(notes);
        }
        orderRepository.save(order);

        List<ProductionStage> stages = stageRepository.findByOrderIdOrderBySortOrderAsc(orderId);
        int targetSortOrder = 1;

        // Dynamically resolve target sort order from order's stages or stage definitions
        Optional<ProductionStage> matchingStage = stages.stream()
                .filter(s -> s.getStageName() != null &&
                        (s.getStageName().equalsIgnoreCase(stUpper) ||
                         // Support legacy alias: READY and READY_TO_DELIVER are the same final stage
                         (s.getStageName().equalsIgnoreCase("READY_TO_DELIVER") && "READY".equals(stUpper)) ||
                         (s.getStageName().equalsIgnoreCase("READY") && "READY_TO_DELIVER".equals(stUpper)) ||
                         // Support legacy alias: ORDER and ORDER_TAKEN are the same initial stage
                         (s.getStageName().equalsIgnoreCase("ORDER_TAKEN") && "ORDER".equals(stUpper)) ||
                         (s.getStageName().equalsIgnoreCase("ORDER") && "ORDER_TAKEN".equals(stUpper))))
                .findFirst();

        if (matchingStage.isPresent() && matchingStage.get().getSortOrder() != null) {
            targetSortOrder = matchingStage.get().getSortOrder();
        } else {
            Optional<StageDefinition> def = stageDefinitionRepository.findByStageKey(stUpper);
            if (def.isPresent() && def.get().getSortOrder() != null) {
                targetSortOrder = def.get().getSortOrder();
            } else {
                List<StageDefinition> allDefs = stageDefinitionRepository.findAllByOrderBySortOrderAsc();
                for (StageDefinition d : allDefs) {
                    if ((d.getStageKey() != null && d.getStageKey().equalsIgnoreCase(stUpper)) ||
                        (d.getDisplayName() != null && d.getDisplayName().equalsIgnoreCase(stUpper))) {
                        targetSortOrder = d.getSortOrder();
                        break;
                    }
                }
            }
        }

        boolean stageFound = stages.stream()
                .anyMatch(s -> s.getStageName() != null &&
                        (s.getStageName().equalsIgnoreCase(stUpper) ||
                         (s.getStageName().equalsIgnoreCase("READY_TO_DELIVER") && "READY".equals(stUpper)) ||
                         (s.getStageName().equalsIgnoreCase("READY") && "READY_TO_DELIVER".equals(stUpper))));

        if (!stageFound) {
            ProductionStage newStage = ProductionStage.builder()
                    .order(order)
                    .stageName(stUpper)
                    .sortOrder(targetSortOrder)
                    .status("READY".equals(stUpper) || "READY_TO_DELIVER".equals(stUpper) ? "COMPLETED" : "IN_PROGRESS")
                    .startedAt(LocalDateTime.now())
                    .completedAt("READY".equals(stUpper) || "READY_TO_DELIVER".equals(stUpper) ? LocalDateTime.now() : null)
                    .assignedTo(employee)
                    .notes(notes)
                    .build();
            stages.add(newStage);
        }

        for (ProductionStage stage : stages) {
            int so = stage.getSortOrder() != null ? stage.getSortOrder() : 0;
            if (so < targetSortOrder) {
                stage.setStatus("COMPLETED");
                if (stage.getCompletedAt() == null) stage.setCompletedAt(LocalDateTime.now());
            } else if (so == targetSortOrder) {
                if ("READY".equals(stUpper) || "READY_TO_DELIVER".equals(stUpper)) {
                    stage.setStatus("COMPLETED");
                    stage.setCompletedAt(LocalDateTime.now());
                } else {
                    stage.setStatus("IN_PROGRESS");
                    if (stage.getStartedAt() == null) stage.setStartedAt(LocalDateTime.now());
                }
                if (employee != null) {
                    stage.setAssignedTo(employee);
                }
                if (notes != null && !notes.isBlank()) {
                    stage.setNotes(notes);
                }
            } else {
                stage.setStatus("NOT_STARTED");
            }
        }
        if (!stages.isEmpty()) {
            stageRepository.saveAll(stages);
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("orderCode", order.getOrderCode());
        resp.put("currentStage", order.getCurrentStage());
        resp.put("status", order.getStatus());
        resp.put("targetSortOrder", targetSortOrder);
        return resp;
    }
}
