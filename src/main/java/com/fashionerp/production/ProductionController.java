package com.fashionerp.production;

import com.fashionerp.order.OrderRepository;
import com.fashionerp.order.OrderStatus;
import com.fashionerp.workforce.Employee;
import com.fashionerp.workforce.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
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
    private final StageDefinitionService stageDefinitionService;
    private final ProductionService productionService;
    private final EmployeeRepository employeeRepository;

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

    @PatchMapping("/stages/{id}/assign")
    public ProductionStage assignEmployeeToProductionStage(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID employeeId) {
        ProductionStage stage = stageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Production Stage not found: " + id));

        if (employeeId != null) {
            Employee emp = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found: " + employeeId));
            stage.setAssignedTo(emp);
        } else {
            stage.setAssignedTo(null);
        }
        return stageRepository.save(stage);
    }

    @PostMapping("/transition")
    public Map<String, Object> transitionStage(
            @RequestParam UUID orderId,
            @RequestParam String targetStage,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String notes) {
        return productionService.transitionStage(orderId, targetStage, employeeId, notes);
    }

    /**
     * GET /api/v1/production/qc/next-stage
     * Dynamically inspects active stage definitions and returns the stage that immediately
     * follows QC by sort_order. If QC is not found or is the last stage, falls back to READY_TO_DELIVER.
     */
    @GetMapping("/qc/next-stage")
    public Map<String, Object> getNextStageAfterQc() {
        return productionService.getNextStageAfterQc();
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
    public StageDefinitionDto.Response assignEmployeeToStageDefinition(
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
}
