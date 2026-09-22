package com.fashionerp.production;

import com.fashionerp.order.Order;
import com.fashionerp.order.OrderRepository;
import com.fashionerp.order.OrderStatus;
import com.fashionerp.workforce.Employee;
import com.fashionerp.workforce.EmployeeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/production")
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionStageRepository stageRepository;
    private final OrderRepository orderRepository;
    private final EmployeeRepository employeeRepository;
    private final StageDefinitionService stageDefinitionService;
    private final StageDefinitionRepository stageDefinitionRepository;

    // ═══════════════════════════════════════════════════════════════════════════
    // EXISTING — Per-order production stages
    // ═══════════════════════════════════════════════════════════════════════════

    @GetMapping("/stages")
    public List<ProductionStage> listStages(@RequestParam(required = false) UUID orderId) {
        if (orderId != null) {
            return stageRepository.findByOrderIdOrderBySortOrderAsc(orderId);
        }
        return stageRepository.findAll();
    }

    @GetMapping("/order/{orderId}")
    public List<ProductionStage> getByOrder(@PathVariable UUID orderId) {
        return stageRepository.findByOrderIdOrderBySortOrderAsc(orderId);
    }

    @PatchMapping("/stages/{id}/status")
    public ProductionStage updateStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        ProductionStage stage = stageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Production Stage not found: " + id));

        stage.setStatus(status.toUpperCase());
        if ("IN_PROGRESS".equalsIgnoreCase(status) && stage.getStartedAt() == null) {
            stage.setStartedAt(LocalDateTime.now());
        } else if ("COMPLETED".equalsIgnoreCase(status)) {
            stage.setCompletedAt(LocalDateTime.now());
        }
        return stageRepository.save(stage);
    }

    @PostMapping("/transition")
    public Map<String, Object> transitionStage(
            @RequestParam UUID orderId,
            @RequestParam String targetStage,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String notes) {

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
        resp.put("assignedTo", employee != null ? employee.getName() : null);
        return resp;
    }

    /**
     * GET /api/v1/production/qc/next-stage
     * Dynamically inspects active stage definitions and returns the stage that immediately
     * follows QC by sort_order. If QC is not found or is the last stage, falls back to READY_TO_DELIVER.
     */
    @GetMapping("/qc/next-stage")
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

    @GetMapping("/kpis")
    public Map<String, Object> kpis() {
        long totalOrders = orderRepository.count();
        long inProduction = stageRepository.countOrdersInProduction();
        if (inProduction == 0) {
            inProduction = orderRepository.countByStatus(OrderStatus.IN_PROGRESS);
        }

        long completedStages = stageRepository.countByStatus("COMPLETED");
        long inProgressStages = stageRepository.countByStatus("IN_PROGRESS");
        long notStartedStages = stageRepository.countByStatus("NOT_STARTED");
        long blockedStages = stageRepository.countByStatus("BLOCKED");

        long onTrack = Math.max(0, inProduction - blockedStages);
        long delayed = blockedStages;

        List<Object[]> activeStages = stageRepository.countActiveByStageName();
        List<Map<String, Object>> stageBreakdown = new ArrayList<>();
        for (Object[] row : activeStages) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("stage", row[0]);
            m.put("count", ((Number) row[1]).longValue());
            stageBreakdown.add(m);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalOrders", totalOrders);
        result.put("inProduction", inProduction);
        result.put("onTrack", onTrack);
        result.put("delayed", delayed);
        result.put("completedStages", completedStages);
        result.put("inProgressStages", inProgressStages);
        result.put("notStartedStages", notStartedStages);
        result.put("stageBreakdown", stageBreakdown);
        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NEW — Stage Definition CRUD (workflow blueprint management)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/production/stage-definitions
     * Query param: activeOnly=true (default false) — returns only active stages when true.
     */
    @GetMapping("/stage-definitions")
    public List<StageDefinitionDto.Response> listStageDefinitions(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        return activeOnly
                ? stageDefinitionService.listActive()
                : stageDefinitionService.listAll();
    }

    /**
     * GET /api/v1/production/stage-definitions/{id}
     */
    @GetMapping("/stage-definitions/{id}")
    public StageDefinitionDto.Response getStageDefinition(@PathVariable UUID id) {
        return stageDefinitionService.get(id);
    }

    /**
     * POST /api/v1/production/stage-definitions
     * Creates a new stage definition. displayName is required.
     */
    @PostMapping("/stage-definitions")
    @ResponseStatus(HttpStatus.CREATED)
    public StageDefinitionDto.Response createStageDefinition(
            @RequestBody StageDefinitionDto.Request request) {
        if (request.getDisplayName() == null || request.getDisplayName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "displayName is required");
        }
        return stageDefinitionService.create(request);
    }

    /**
     * PUT /api/v1/production/stage-definitions/{id}
     * Updates an existing stage definition.
     */
    @PutMapping("/stage-definitions/{id}")
    public StageDefinitionDto.Response updateStageDefinition(
            @PathVariable UUID id,
            @RequestBody StageDefinitionDto.Request request) {
        return stageDefinitionService.update(id, request);
    }

    /**
     * PATCH /api/v1/production/stage-definitions/{id}/toggle
     * Toggles active/inactive status (soft delete / restore).
     */
    @PatchMapping("/stage-definitions/{id}/toggle")
    public StageDefinitionDto.Response toggleStageDefinition(@PathVariable UUID id) {
        return stageDefinitionService.toggleActive(id);
    }

    /**
     * DELETE /api/v1/production/stage-definitions/{id}
     * Hard-deletes only if no production_stages records reference this stage key.
     * Use PATCH /toggle for safe soft-delete.
     */
    @DeleteMapping("/stage-definitions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStageDefinition(@PathVariable UUID id) {
        stageDefinitionService.hardDelete(id);
    }

    /**
     * PATCH /api/v1/production/stage-definitions/reorder
     * Accepts body: { "ids": ["uuid1","uuid2",...] } in desired order.
     */
    @PatchMapping("/stage-definitions/reorder")
    @Transactional
    public List<StageDefinitionDto.Response> reorderStageDefinitions(
            @RequestBody StageDefinitionDto.ReorderRequest request) {
        if (request.getIds() == null || request.getIds().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ids list is required");
        }
        return stageDefinitionService.reorder(request.getIds());
    }

    /**
     * POST /api/v1/production/stage-definitions/{id}/employees/{empId}
     * Pins an employee to a stage definition.
     */
    @PostMapping("/stage-definitions/{id}/employees/{empId}")
    public StageDefinitionDto.Response assignEmployee(
            @PathVariable UUID id,
            @PathVariable UUID empId) {
        return stageDefinitionService.assignEmployee(id, empId);
    }

    /**
     * DELETE /api/v1/production/stage-definitions/{id}/employees/{empId}
     * Removes an employee pin from a stage definition.
     */
    @DeleteMapping("/stage-definitions/{id}/employees/{empId}")
    public StageDefinitionDto.Response removeEmployee(
            @PathVariable UUID id,
            @PathVariable UUID empId) {
        return stageDefinitionService.removeEmployee(id, empId);
    }

    /**
     * POST /api/v1/production/stage-definitions/{id}/image
     * Upload artwork/photo for a stage definition. File stored in front end/assets/stages/.
     */
    @PostMapping(value = "/stage-definitions/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StageDefinitionDto.Response uploadStageImage(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        return stageDefinitionService.uploadImage(id, file);
    }

    // Note: /api/v1/production/stage-definitions/preset-images endpoint removed.
    // Stage artwork is fully user-managed — users upload custom images via the Stage Management UI.
}
