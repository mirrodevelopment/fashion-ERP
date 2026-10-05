package com.fashionerp.production;

import com.fashionerp.workforce.Employee;
import com.fashionerp.workforce.EmployeeDto;
import com.fashionerp.workforce.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.fashionerp.order.OrderRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StageDefinitionService {

    private final StageDefinitionRepository stageDefRepo;
    private final StageDefinitionEmployeeRepository stageDefEmpRepo;
    private final EmployeeRepository employeeRepository;
    private final OrderRepository orderRepository;
    private final ProductionStageRepository productionStageRepository;

    // ─── Self-Healing System Boundary Stages ─────────────────────────────────

    @jakarta.annotation.PostConstruct
    @Transactional
    public void ensureBoundaryStagesExist() {
        if (!stageDefRepo.existsByStageKey("ORDER_TAKEN")) {
            StageDefinition ot = StageDefinition.builder()
                    .stageKey("ORDER_TAKEN")
                    .displayName("Order Taken")
                    .description("Order intake, fabric requirements noted, advance paid and order committed to schedule.")
                    .requiredRole("STAFF")
                    .deptLabel("Order Intake & Reception")
                    .colorClass("stage-emerald")
                    .sortOrder(1)
                    .active(true)
                    .imageUrl("/front end/assets/stages/Order_Taken_1010.jpg")
                    .build();
            stageDefRepo.save(ot);
        }
        if (!stageDefRepo.existsByStageKey("READY_TO_DELIVER")) {
            int lastOrder = (int) stageDefRepo.count() + 1;
            StageDefinition rd = StageDefinition.builder()
                    .stageKey("READY_TO_DELIVER")
                    .displayName("Ready to Deliver")
                    .description("Quality approved, packaged with care and awaiting customer pickup or boutique handover.")
                    .requiredRole("SUPERVISOR")
                    .deptLabel("Delivery & Handover")
                    .colorClass("stage-silver")
                    .sortOrder(Math.max(2, lastOrder))
                    .active(true)
                    .imageUrl("/front end/assets/stages/Ready_8043.jpg")
                    .build();
            stageDefRepo.save(rd);
        }
        if (!stageDefRepo.existsByStageKey("QC")) {
            // Position QC just before READY_TO_DELIVER
            int qcOrder = 2;
            java.util.Optional<StageDefinition> rdOpt = stageDefRepo.findByStageKey("READY_TO_DELIVER");
            if (rdOpt.isPresent() && rdOpt.get().getSortOrder() != null) {
                qcOrder = rdOpt.get().getSortOrder();
                // Shift READY_TO_DELIVER up by one to make room
                rdOpt.get().setSortOrder(qcOrder + 1);
                stageDefRepo.save(rdOpt.get());
            } else {
                qcOrder = Math.max(2, (int) stageDefRepo.count() + 1);
            }
            StageDefinition qc = StageDefinition.builder()
                    .stageKey("QC")
                    .displayName("Quality Control")
                    .description("Final inspection before dispatch: stitching, measurements, finishing, and fabric quality verified by QC team.")
                    .requiredRole("SUPERVISOR")
                    .deptLabel("Quality Control & Inspection")
                    .colorClass("stage-gold")
                    .sortOrder(qcOrder)
                    .active(true)
                    .imageUrl(null)
                    .build();
            stageDefRepo.save(qc);
        }
    }

    // ─── List ─────────────────────────────────────────────────────────────────

    /** Returns only active stages, ordered by sort_order — used by the Kanban board */
    public List<StageDefinitionDto.Response> listActive() {
        List<StageDefinition> list = stageDefRepo.findAllByActiveTrueOrderBySortOrderAsc();
        if (list.stream().noneMatch(s -> "ORDER_TAKEN".equalsIgnoreCase(s.getStageKey()))
                || list.stream().noneMatch(s -> "READY_TO_DELIVER".equalsIgnoreCase(s.getStageKey()))
                || list.stream().noneMatch(s -> "QC".equalsIgnoreCase(s.getStageKey()))) {
            ensureBoundaryStagesExist();
            list = stageDefRepo.findAllByActiveTrueOrderBySortOrderAsc();
        }
        Map<String, Long> activeCounts = getActiveOrderCountsMap();
        return enforceBoundarySort(list)
                .stream()
                .map(s -> toResponse(s, activeCounts))
                .collect(Collectors.toList());
    }

    /** Returns all stages including inactive — used by the management UI */
    public List<StageDefinitionDto.Response> listAll() {
        List<StageDefinition> list = stageDefRepo.findAllByOrderBySortOrderAsc();
        if (list.stream().noneMatch(s -> "ORDER_TAKEN".equalsIgnoreCase(s.getStageKey()))
                || list.stream().noneMatch(s -> "READY_TO_DELIVER".equalsIgnoreCase(s.getStageKey()))
                || list.stream().noneMatch(s -> "QC".equalsIgnoreCase(s.getStageKey()))) {
            ensureBoundaryStagesExist();
            list = stageDefRepo.findAllByOrderBySortOrderAsc();
        }
        Map<String, Long> activeCounts = getActiveOrderCountsMap();
        return enforceBoundarySort(list)
                .stream()
                .map(s -> toResponse(s, activeCounts))
                .collect(Collectors.toList());
    }

    /** Get single stage by ID */
    public StageDefinitionDto.Response get(UUID id) {
        return toResponse(findOrThrow(id));
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    @Transactional
    public StageDefinitionDto.Response create(StageDefinitionDto.Request req) {
        String key = toKey(req.getDisplayName());
        if ("ORDER_TAKEN".equals(key) || "READY_TO_DELIVER".equals(key) || "READY".equals(key) || "QC".equals(key)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot create stage with reserved system key '" + key + "'.");
        }
        if (stageDefRepo.existsByStageKey(key)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A stage with key '" + key + "' already exists. Choose a different name.");
        }

        // Auto-set sort order to the end if not provided, but before QC and READY_TO_DELIVER
        java.util.Optional<StageDefinition> qcOpt = stageDefRepo.findByStageKey("QC");
        java.util.Optional<StageDefinition> readyStageOpt = stageDefRepo.findByStageKey("READY_TO_DELIVER");
        int sortOrder;

        if (qcOpt.isPresent()) {
            StageDefinition qc = qcOpt.get();
            sortOrder = qc.getSortOrder() != null ? qc.getSortOrder() : Math.max(2, (int) stageDefRepo.count());
            // Shift QC and READY_TO_DELIVER after the new stage
            qc.setSortOrder(sortOrder + 1);
            stageDefRepo.save(qc);
            if (readyStageOpt.isPresent()) {
                StageDefinition ready = readyStageOpt.get();
                ready.setSortOrder(sortOrder + 2);
                stageDefRepo.save(ready);
            }
        } else if (readyStageOpt.isPresent()) {
            StageDefinition readyStage = readyStageOpt.get();
            sortOrder = readyStage.getSortOrder() != null ? readyStage.getSortOrder() : (int) stageDefRepo.count() + 1;
            // Shift READY_TO_DELIVER after the new stage
            readyStage.setSortOrder(sortOrder + 1);
            stageDefRepo.save(readyStage);
        } else {
            sortOrder = req.getSortOrder() != null ? req.getSortOrder()
                    : (int) stageDefRepo.count() + 1;
        }
        // Ensure new intermediate stage cannot override ORDER_TAKEN (sort_order 1)
        if (sortOrder <= 1) {
            sortOrder = 2;
        }

        StageDefinition def = StageDefinition.builder()
                .stageKey(key)
                .displayName(req.getDisplayName().trim())
                .description(req.getDescription())
                .requiredRole(upperOrNull(req.getRequiredRole()))
                .deptLabel(req.getDeptLabel())
                .colorClass(req.getColorClass())
                .sortOrder(sortOrder)
                .active(req.getActive() == null || req.getActive())
                .imageUrl(req.getImageUrl() != null && !req.getImageUrl().isBlank() ? req.getImageUrl().trim() : null)
                .build();

        return toResponse(stageDefRepo.save(def));
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    @Transactional
    public StageDefinitionDto.Response update(UUID id, StageDefinitionDto.Request req) {
        StageDefinition def = findOrThrow(id);

        if (isSystemFixed(def)) {
            // Fixed system boundary stages must remain permanently active and cannot change machine key
            def.setActive(true);
        } else {
            // stageKey is preserved if linked production_stages rows exist, ensuring seamless editability
            long linkedCount = stageDefRepo.countLinkedProductionStages(def.getStageKey());
            String newKey = toKey(req.getDisplayName());
            if (!newKey.equals(def.getStageKey())) {
                if (linkedCount == 0) {
                    if (stageDefRepo.existsByStageKeyAndIdNot(newKey, id)) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                "A stage with key '" + newKey + "' already exists.");
                    }
                    def.setStageKey(newKey);
                }
            }
            if (req.getActive() != null) def.setActive(req.getActive());
        }

        def.setDisplayName(req.getDisplayName().trim());
        if (req.getDescription() != null) def.setDescription(req.getDescription());
        if (req.getRequiredRole() != null) def.setRequiredRole(upperOrNull(req.getRequiredRole()));
        if (req.getDeptLabel() != null) def.setDeptLabel(req.getDeptLabel());
        if (req.getColorClass() != null) def.setColorClass(req.getColorClass());
        if (req.getSortOrder() != null) def.setSortOrder(req.getSortOrder());
        if (req.getImageUrl() != null) def.setImageUrl(req.getImageUrl().trim().isEmpty() ? null : req.getImageUrl().trim());

        return toResponse(stageDefRepo.save(def));
    }

    // ─── Image Upload ─────────────────────────────────────────────────────────

    @Transactional
    public StageDefinitionDto.Response uploadImage(UUID id, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file cannot be empty");
        }
        StageDefinition def = findOrThrow(id);

        try {
            // Naming convention: stage name plus random number (e.g. Designing_4821.jpg)
            String stageName = (def.getDisplayName() != null && !def.getDisplayName().isBlank())
                    ? def.getDisplayName()
                    : def.getStageKey();
            String safeStageName = stageName.trim()
                    .replaceAll("[^a-zA-Z0-9\\s]", "")
                    .replaceAll("\\s+", "_");
            if (safeStageName.isBlank()) safeStageName = "stage";

            String orig = file.getOriginalFilename();
            String ext = ".png";
            if (orig != null && orig.contains(".")) {
                ext = orig.substring(orig.lastIndexOf('.')).toLowerCase();
            }
            if (!List.of(".jpg", ".jpeg", ".png", ".webp", ".gif").contains(ext)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file type: " + ext + ". Allowed types: jpg, jpeg, png, webp, gif");
            }
            int randNumber = 1000 + new Random().nextInt(9000);
            String filename = safeStageName + "_" + randNumber + ext;

            Path storageDir = Paths.get("front end", "assets", "stages").toAbsolutePath();
            Files.createDirectories(storageDir);
            Path filePath = storageDir.resolve(filename);
            Files.write(filePath, file.getBytes());

            String imageUrl = "/front end/assets/stages/" + filename;
            def.setImageUrl(imageUrl);
            return toResponse(stageDefRepo.save(def));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to save stage image: " + e.getMessage(), e);
        }
    }

    // ─── Toggle Active (soft delete / restore) ────────────────────────────────

    @Transactional
    public StageDefinitionDto.Response toggleActive(UUID id) {
        StageDefinition def = findOrThrow(id);
        if (isSystemFixed(def)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Fixed system stage (" + def.getDisplayName() + ") must remain permanently active.");
        }
        def.setActive(!Boolean.TRUE.equals(def.getActive()));
        return toResponse(stageDefRepo.save(def));
    }

    // ─── Hard Delete ──────────────────────────────────────────────────────────

    @Transactional
    public void hardDelete(UUID id) {
        StageDefinition def = findOrThrow(id);
        if (isSystemFixed(def)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Fixed system stage (" + def.getDisplayName() + ") is required by the ERP and cannot be deleted.");
        }
        long activeOrders = getActiveOrderCountForStage(def.getStageKey());
        if (activeOrders > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete — " + activeOrders + " active order" + (activeOrders != 1 ? "s are" : " is")
                            + " currently in this stage. Please move or complete them first, or deactivate the stage.");
        }

        // Clean up linked pinned employees and placeholder records before removing definition
        stageDefEmpRepo.deleteAllByStageDefId(def.getId());
        productionStageRepository.deleteByStageName(def.getStageKey());
        stageDefRepo.delete(def);
    }

    // ─── Reorder ──────────────────────────────────────────────────────────────

    @Transactional
    public List<StageDefinitionDto.Response> reorder(List<UUID> orderedIds) {
        if (orderedIds == null || orderedIds.isEmpty()) {
            return listAll();
        }

        // Find stage definitions for orderedIds to locate ORDER_TAKEN, QC, and READY_TO_DELIVER
        List<StageDefinition> stages = stageDefRepo.findAllById(orderedIds);
        UUID orderTakenId = null;
        UUID qcId = null;
        UUID readyToDeliverId = null;

        for (StageDefinition s : stages) {
            String key = s.getStageKey() != null ? s.getStageKey().toUpperCase().trim() : "";
            if ("ORDER_TAKEN".equals(key)) {
                orderTakenId = s.getId();
            } else if ("QC".equals(key)) {
                qcId = s.getId();
            } else if ("READY_TO_DELIVER".equals(key)) {
                readyToDeliverId = s.getId();
            }
        }

        List<UUID> sanitizedIds = new ArrayList<>(orderedIds);

        // Remove fixed boundary IDs first so intermediate items can be arranged freely
        if (orderTakenId != null) sanitizedIds.remove(orderTakenId);
        if (qcId != null) sanitizedIds.remove(qcId);
        if (readyToDeliverId != null) sanitizedIds.remove(readyToDeliverId);

        // 1. Enforce ORDER_TAKEN strictly at index 0 (Stage 1)
        if (orderTakenId != null) {
            sanitizedIds.add(0, orderTakenId);
        }

        // 2. Enforce QC strictly at index (N - 2) (Stage N - 1, immediately before READY_TO_DELIVER)
        if (qcId != null) {
            sanitizedIds.add(qcId);
        }

        // 3. Enforce READY_TO_DELIVER strictly at final index (Stage N)
        if (readyToDeliverId != null) {
            sanitizedIds.add(readyToDeliverId);
        }

        for (int i = 0; i < sanitizedIds.size(); i++) {
            stageDefRepo.updateSortOrder(sanitizedIds.get(i), i + 1);
        }
        // Flush & reload with guaranteed boundary sorting
        return listAll();
    }

    // ─── Employee Assignment ──────────────────────────────────────────────────

    @Transactional
    public StageDefinitionDto.Response assignEmployee(UUID stageDefId, UUID employeeId) {
        StageDefinition def = findOrThrow(stageDefId);
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Employee not found: " + employeeId));

        boolean exists = stageDefEmpRepo.existsByStageDefIdAndEmployeeId(stageDefId, employeeId);
        if (!exists) {
            StageDefinitionEmployee link = StageDefinitionEmployee.builder()
                    .stageDef(def)
                    .employee(emp)
                    .assignmentType("AVAILABLE")
                    .build();
            stageDefEmpRepo.save(link);
        }
        return toResponse(def);
    }

    @Transactional
    public StageDefinitionDto.Response removeEmployee(UUID stageDefId, UUID employeeId) {
        stageDefEmpRepo.deleteByStageDefIdAndEmployeeId(stageDefId, employeeId);
        return toResponse(findOrThrow(stageDefId));
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    private StageDefinition findOrThrow(UUID id) {
        return stageDefRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Stage definition not found: " + id));
    }

    private StageDefinitionDto.Response toResponse(StageDefinition def) {
        return toResponse(def, getActiveOrderCountsMap());
    }

    private StageDefinitionDto.Response toResponse(StageDefinition def, Map<String, Long> activeCounts) {
        StageDefinitionDto.Response r = StageDefinitionDto.Response.from(def);
        String key = def.getStageKey() != null ? def.getStageKey().toUpperCase().trim() : "";
        long count = activeCounts != null ? activeCounts.getOrDefault(key, 0L) : 0L;
        if (count == 0 && "READY_TO_DELIVER".equals(key) && activeCounts != null) {
            count = activeCounts.getOrDefault("READY", 0L);
        } else if (count == 0 && "ORDER_TAKEN".equals(key) && activeCounts != null) {
            count = activeCounts.getOrDefault("ORDER", 0L);
        }
        r.setLinkedOrderCount(count);

        List<StageDefinitionEmployee> links = stageDefEmpRepo.findByStageDefId(def.getId());
        r.setPinnedEmployees(links.stream()
                .map(l -> EmployeeDto.Response.from(l.getEmployee()))
                .collect(Collectors.toList()));
        return r;
    }

    private Map<String, Long> getActiveOrderCountsMap() {
        try {
            return orderRepository.countActiveOrdersGroupedByStage().stream()
                    .filter(row -> row != null && row.length >= 2 && row[0] != null)
                    .collect(Collectors.toMap(
                            row -> ((String) row[0]).toUpperCase().trim(),
                            row -> ((Number) row[1]).longValue(),
                            (a, b) -> a + b
                    ));
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private long getActiveOrderCountForStage(String stageKey) {
        if (stageKey == null || stageKey.isBlank()) return 0L;
        Map<String, Long> counts = getActiveOrderCountsMap();
        String key = stageKey.toUpperCase().trim();
        long count = counts.getOrDefault(key, 0L);
        if (count == 0 && "READY_TO_DELIVER".equals(key)) {
            count = counts.getOrDefault("READY", 0L);
        } else if (count == 0 && "ORDER_TAKEN".equals(key)) {
            count = counts.getOrDefault("ORDER", 0L);
        }
        return count;
    }

    /** Converts display name to uppercase stage key: "Hand Work" → "HAND_WORK" */
    private String toKey(String displayName) {
        if (displayName == null) return "STAGE";
        return displayName.trim().toUpperCase().replaceAll("[^A-Z0-9]+", "_");
    }

    private String upperOrNull(String s) {
        return (s == null || s.isBlank()) ? null : s.toUpperCase().trim();
    }

    private boolean isSystemFixed(StageDefinition def) {
        if (def == null) return false;
        String k = def.getStageKey() != null ? def.getStageKey().toUpperCase().trim() : "";
        String name = def.getDisplayName() != null ? def.getDisplayName().toUpperCase().trim() : "";
        return "ORDER_TAKEN".equals(k) || "READY_TO_DELIVER".equals(k) || "READY".equals(k) || "QC".equals(k)
                || "ORDER TAKEN".equals(name) || "READY TO DELIVER".equals(name) || "READY FOR DELIVERY".equals(name)
                || "QUALITY CONTROL".equals(name);
    }

    /**
     * Enforces the business boundary:
     * - ORDER_TAKEN is strictly at index 0 (sort_order = 1)
     * - QC is strictly at index N-2 (sort_order = N-1)
     * - READY_TO_DELIVER is strictly at the final index (sort_order = N)
     * - Intermediate stages maintain relative sorting between index 1 and N-3
     */
    private List<StageDefinition> enforceBoundarySort(List<StageDefinition> list) {
        if (list == null || list.size() <= 1) {
            return list != null ? list : Collections.emptyList();
        }

        StageDefinition orderTaken = null;
        StageDefinition qc = null;
        StageDefinition readyToDeliver = null;
        List<StageDefinition> intermediates = new ArrayList<>();

        for (StageDefinition def : list) {
            String key = def.getStageKey() != null ? def.getStageKey().toUpperCase().trim() : "";
            if ("ORDER_TAKEN".equals(key)) {
                orderTaken = def;
            } else if ("QC".equals(key)) {
                qc = def;
            } else if ("READY_TO_DELIVER".equals(key)) {
                readyToDeliver = def;
            } else {
                intermediates.add(def);
            }
        }

        // Sort intermediate stages by sortOrder (null safe)
        intermediates.sort(Comparator.comparing(
                d -> d.getSortOrder() != null ? d.getSortOrder() : Integer.MAX_VALUE
        ));

        List<StageDefinition> sorted = new ArrayList<>(list.size());
        if (orderTaken != null) {
            orderTaken.setSortOrder(1);
            sorted.add(orderTaken);
        }
        for (int i = 0; i < intermediates.size(); i++) {
            StageDefinition inter = intermediates.get(i);
            inter.setSortOrder(i + 2);
            sorted.add(inter);
        }
        if (qc != null) {
            qc.setSortOrder(sorted.size() + 1);
            sorted.add(qc);
        }
        if (readyToDeliver != null) {
            readyToDeliver.setSortOrder(sorted.size() + 1);
            sorted.add(readyToDeliver);
        }

        return sorted;
    }

}

