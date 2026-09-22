package com.fashionerp.production;

import com.fashionerp.workforce.Employee;
import com.fashionerp.workforce.EmployeeDto;
import com.fashionerp.workforce.EmployeeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StageDefinitionService {

    private final StageDefinitionRepository stageDefRepo;
    private final StageDefinitionEmployeeRepository stageDefEmpRepo;
    private final EmployeeRepository employeeRepository;

    // ─── List ─────────────────────────────────────────────────────────────────

    /** Returns only active stages, ordered by sort_order — used by the Kanban board */
    public List<StageDefinitionDto.Response> listActive() {
        return stageDefRepo.findAllByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Returns all stages including inactive — used by the management UI */
    public List<StageDefinitionDto.Response> listAll() {
        return stageDefRepo.findAllByOrderBySortOrderAsc()
                .stream()
                .map(this::toResponse)
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
        if (stageDefRepo.existsByStageKey(key)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A stage with key '" + key + "' already exists. Choose a different name.");
        }

        // Auto-set sort order to the end if not provided
        int sortOrder = req.getSortOrder() != null ? req.getSortOrder()
                : (int) stageDefRepo.count() + 1;

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
            // If linkedCount > 0, preserve stable machine stageKey while freely updating displayName & metadata
        }

        def.setDisplayName(req.getDisplayName().trim());
        if (req.getDescription() != null) def.setDescription(req.getDescription());
        if (req.getRequiredRole() != null) def.setRequiredRole(upperOrNull(req.getRequiredRole()));
        if (req.getDeptLabel() != null) def.setDeptLabel(req.getDeptLabel());
        if (req.getColorClass() != null) def.setColorClass(req.getColorClass());
        if (req.getSortOrder() != null) def.setSortOrder(req.getSortOrder());
        if (req.getActive() != null) def.setActive(req.getActive());
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
            String ext = (orig != null && orig.contains("."))
                    ? orig.substring(orig.lastIndexOf('.')).toLowerCase()
                    : ".png";
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
        def.setActive(!Boolean.TRUE.equals(def.getActive()));
        return toResponse(stageDefRepo.save(def));
    }

    // ─── Hard Delete ──────────────────────────────────────────────────────────

    @Transactional
    public void hardDelete(UUID id) {
        StageDefinition def = findOrThrow(id);
        long linked = stageDefRepo.countLinkedProductionStages(def.getStageKey());
        if (linked > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete — " + linked + " production stage records reference '"
                            + def.getStageKey() + "'. Deactivate instead.");
        }
        stageDefRepo.delete(def);
    }

    // ─── Reorder ──────────────────────────────────────────────────────────────

    @Transactional
    public List<StageDefinitionDto.Response> reorder(List<UUID> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            stageDefRepo.updateSortOrder(orderedIds.get(i), i + 1);
        }
        // Flush & reload
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
        StageDefinitionDto.Response r = StageDefinitionDto.Response.from(def);
        r.setLinkedOrderCount(stageDefRepo.countLinkedProductionStages(def.getStageKey()));

        List<StageDefinitionEmployee> links = stageDefEmpRepo.findByStageDefId(def.getId());
        r.setPinnedEmployees(links.stream()
                .map(l -> EmployeeDto.Response.from(l.getEmployee()))
                .collect(Collectors.toList()));
        return r;
    }

    /** Converts display name to uppercase stage key: "Hand Work" → "HAND_WORK" */
    private String toKey(String displayName) {
        if (displayName == null) return "STAGE";
        return displayName.trim().toUpperCase().replaceAll("[^A-Z0-9]+", "_");
    }

    private String upperOrNull(String s) {
        return (s == null || s.isBlank()) ? null : s.toUpperCase().trim();
    }

}
