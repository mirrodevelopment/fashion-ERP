package com.fashionerp.garment;

import com.fashionerp.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GarmentService {

    private final GarmentRepository garmentRepository;
    private final com.fashionerp.collection.CollectionRepository collectionRepository;
    private final com.fashionerp.branch.BranchRepository branchRepository;
    private final com.fashionerp.workforce.EmployeeRepository employeeRepository;
    private final com.fashionerp.common.BranchAccessService branchAccessService;
    private final com.fashionerp.common.StorageService storageService;

    @Transactional(readOnly = true)
    public Page<GarmentDto.SummaryResponse> search(
            String search,
            String stage,
            String status,
            String garmentType,
            String collectionName,
            String priority,
            String materialStatus,
            String fabric,
            String designer,
            String branch,
            Boolean catalogOnly,
            Pageable pageable) {
        UUID companyId = TenantContext.getCompanyId();
        boolean catOnly = catalogOnly == null || catalogOnly;
        Page<Garment> page = garmentRepository.searchGarments(
                companyId,
                catOnly,
                search, stage, status, garmentType, collectionName,
                priority, materialStatus, fabric, designer, branch, pageable);
        return page.map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public Page<GarmentDto.SummaryResponse> search(
            String search,
            String stage,
            String status,
            String garmentType,
            String collectionName,
            String priority,
            String materialStatus,
            String fabric,
            String designer,
            String branch,
            Pageable pageable) {
        return search(search, stage, status, garmentType, collectionName,
                priority, materialStatus, fabric, designer, branch, true, pageable);
    }

    @Transactional(readOnly = true)
    public GarmentDto.KpiResponse getKpis(Boolean catalogOnly, String branch) {
        UUID companyId = TenantContext.getCompanyId();
        String branchFilter = branchAccessService.resolveBranch(branch, com.fashionerp.common.BranchAccessService.BranchModule.GARMENTS);
        boolean catOnly = catalogOnly == null || catalogOnly;
        long total = garmentRepository.countCatalogGarments(companyId, catOnly, branchFilter);
        long inProd = garmentRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "IN_PRODUCTION", catOnly, branchFilter);
        long inTrial = garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "TRIAL", catOnly, branchFilter);
        long awaitingQc = garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "QC", catOnly, branchFilter);
        if (awaitingQc == 0) {
            awaitingQc = garmentRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "Awaiting QC", catOnly, branchFilter);
        }
        long ready = garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "READY", catOnly, branchFilter);
        if (ready == 0) {
            ready = garmentRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "READY", catOnly, branchFilter);
        }
        long delivered = garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "DELIVERED", catOnly, branchFilter);
        if (delivered == 0) {
            delivered = garmentRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "DELIVERED", catOnly, branchFilter);
        }
        long designing = garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "DESIGNING", catOnly, branchFilter);
        long onHold = garmentRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "ON_HOLD", catOnly, branchFilter);
        if (onHold == 0) {
            onHold = garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "ON_HOLD", catOnly, branchFilter);
        }

        long bridalCount = garmentRepository.countBridalGarments(companyId, catOnly, branchFilter);
        Double avgHours = garmentRepository.avgCraftingHours(companyId, catOnly, branchFilter);

        return GarmentDto.KpiResponse.builder()
                .totalGarments(total)
                .totalGarmentsDelta(null)
                .inProduction(inProd)
                .inProductionDelta(null)
                .inTrial(inTrial)
                .inTrialDelta(null)
                .awaitingQc(awaitingQc)
                .awaitingQcDelta(null)
                .ready(ready)
                .readyDelta(null)
                .delivered(delivered)
                .deliveredDelta(null)
                .bridalCount(bridalCount)
                .avgCraftingHours(avgHours != null ? Math.round(avgHours * 10.0) / 10.0 : 0.0)
                .allCount(total)
                .designingCount(designing)
                .inProductionCount(inProd)
                .trialCount(inTrial)
                .qcCount(awaitingQc)
                .readyCount(ready)
                .deliveredCount(delivered)
                .onHoldCount(onHold)
                .build();
    }

    @Transactional(readOnly = true)
    public GarmentDto.KpiResponse getKpis(Boolean catalogOnly) {
        return getKpis(catalogOnly, null);
    }

    @Transactional(readOnly = true)
    public GarmentDto.KpiResponse getKpis() {
        return getKpis(true, null);
    }

    @Transactional(readOnly = true)
    public GarmentDto.DetailResponse getById(UUID id) {
        Garment g = garmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Garment not found with id: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(g.getCompanyId())) {
            throw new IllegalArgumentException("Garment not found with id: " + id);
        }
        return toDetailResponse(g);
    }

    @Transactional
    public GarmentDto.SummaryResponse create(GarmentDto.CreateRequest req) {
        UUID companyId = TenantContext.getCompanyId();
        String code = req.getGarmentCode();
        if (code == null || code.isBlank()) {
            long count = (companyId != null ? garmentRepository.countByCompanyId(companyId) : garmentRepository.count()) + 1;
            code = "GAR-" + String.format("%05d", count);
            while (companyId != null ? garmentRepository.existsByGarmentCodeAndCompanyId(code, companyId) : garmentRepository.existsByGarmentCode(code)) {
                count++;
                code = "GAR-" + String.format("%05d", count);
            }
        }

        String branch = (req.getBranch() != null && !req.getBranch().isBlank())
                ? req.getBranch().trim()
                : branchAccessService.getDefaultBranchForCreation();

        Garment g = Garment.builder()
                .companyId(companyId)
                .garmentCode(code)
                .orderCode(req.getOrderCode())
                .customerName(req.getCustomerName())
                .customerMobile(req.getCustomerMobile())
                .title(req.getTitle() != null && !req.getTitle().isBlank() ? req.getTitle().trim() : (req.getGarmentType() != null ? req.getGarmentType().trim() : "Bespoke Garment"))
                .garmentType(req.getGarmentType() != null && !req.getGarmentType().isBlank() ? req.getGarmentType().trim() : "Custom")
                .specs(req.getSpecs())
                .designCode(req.getDesignCode())
                .collectionName(req.getCollectionName())
                .productionStage(req.getProductionStage() != null ? req.getProductionStage() : "DESIGNING")
                .materialStatus(req.getMaterialStatus() != null ? req.getMaterialStatus() : "READY")
                .trialStatus(req.getTrialStatus() != null ? req.getTrialStatus() : "Not Required")
                .trialDate(req.getTrialDate())
                .dueDate(req.getDueDate())
                .priority(req.getPriority() != null ? req.getPriority() : "NORMAL")
                .paymentStatus(req.getPaymentStatus() != null ? req.getPaymentStatus() : "PENDING")
                .paidAmount(req.getPaidAmount() != null ? req.getPaidAmount() : BigDecimal.ZERO)
                .totalAmount(req.getTotalAmount() != null ? req.getTotalAmount() : BigDecimal.ZERO)
                .status(req.getStatus() != null ? req.getStatus() : "IN_PRODUCTION")
                .assignedTo(req.getAssignedTo())
                .designer(req.getDesigner())
                .branch(branch)
                .imageUrl(req.getImageUrl())
                .primaryFabric(req.getPrimaryFabric())
                .embroideryType(req.getEmbroideryType())
                .colorName(req.getColorName())
                .colorHex(req.getColorHex())
                .estimatedCost(req.getEstimatedCost() != null ? req.getEstimatedCost() : BigDecimal.ZERO)
                .suggestedPrice(req.getSuggestedPrice() != null ? req.getSuggestedPrice() : (req.getTotalAmount() != null ? req.getTotalAmount() : BigDecimal.ZERO))
                .craftingHours(req.getCraftingHours() != null ? req.getCraftingHours() : 0)
                .silhouette(req.getSilhouette() != null ? req.getSilhouette() : req.getSpecs())
                .isSample(req.getIsSample() != null ? req.getIsSample() : false)
                .notes(req.getNotes())
                .build();

        Garment saved = garmentRepository.save(g);
        return toSummaryResponse(saved);
    }

    @Transactional
    public GarmentDto.SummaryResponse update(UUID id, GarmentDto.UpdateRequest req) {
        Garment g = garmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Garment not found with id: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(g.getCompanyId())) {
            throw new IllegalArgumentException("Garment not found with id: " + id);
        }

        if (req.getTitle() != null) g.setTitle(req.getTitle());
        if (req.getGarmentType() != null) g.setGarmentType(req.getGarmentType());
        if (req.getSpecs() != null) g.setSpecs(req.getSpecs());
        if (req.getCollectionName() != null) g.setCollectionName(req.getCollectionName());
        if (req.getProductionStage() != null) g.setProductionStage(req.getProductionStage());
        if (req.getMaterialStatus() != null) g.setMaterialStatus(req.getMaterialStatus());
        if (req.getTrialStatus() != null) g.setTrialStatus(req.getTrialStatus());
        if (req.getTrialDate() != null) g.setTrialDate(req.getTrialDate());
        if (req.getDueDate() != null) g.setDueDate(req.getDueDate());
        if (req.getPriority() != null) g.setPriority(req.getPriority());
        if (req.getPaymentStatus() != null) g.setPaymentStatus(req.getPaymentStatus());
        if (req.getPaidAmount() != null) g.setPaidAmount(req.getPaidAmount());
        if (req.getTotalAmount() != null) g.setTotalAmount(req.getTotalAmount());
        if (req.getStatus() != null) g.setStatus(req.getStatus());
        if (req.getAssignedTo() != null) g.setAssignedTo(req.getAssignedTo());
        if (req.getDesigner() != null) g.setDesigner(req.getDesigner());
        if (req.getBranch() != null) g.setBranch(req.getBranch());
        if (req.getPrimaryFabric() != null) g.setPrimaryFabric(req.getPrimaryFabric());
        if (req.getEmbroideryType() != null) g.setEmbroideryType(req.getEmbroideryType());
        if (req.getColorName() != null) g.setColorName(req.getColorName());
        if (req.getColorHex() != null) g.setColorHex(req.getColorHex());
        if (req.getEstimatedCost() != null) g.setEstimatedCost(req.getEstimatedCost());
        if (req.getSuggestedPrice() != null) g.setSuggestedPrice(req.getSuggestedPrice());
        if (req.getCraftingHours() != null) g.setCraftingHours(req.getCraftingHours());
        if (req.getSilhouette() != null) g.setSilhouette(req.getSilhouette());
        if (req.getIsSample() != null) g.setIsSample(req.getIsSample());
        if (req.getNotes() != null) g.setNotes(req.getNotes());

        Garment saved = garmentRepository.save(g);
        return toSummaryResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Garment g = garmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Garment not found with id: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(g.getCompanyId())) {
            throw new IllegalArgumentException("Garment not found with id: " + id);
        }
        garmentRepository.delete(g);
    }

    // ─── Image Upload & Storage ─────────────────────────────────────────────

    @Transactional
    public String uploadImage(org.springframework.web.multipart.MultipartFile file, String garmentCode) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String ext = ".jpg";
            if (originalFilename != null && originalFilename.contains(".")) {
                ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
            }
            if (!List.of(".jpg", ".jpeg", ".png", ".webp", ".gif").contains(ext)) {
                throw new IllegalArgumentException("Invalid file type: " + ext + ". Allowed types: jpg, jpeg, png, webp, gif");
            }

            String prefix = (garmentCode != null && !garmentCode.isBlank())
                    ? garmentCode.trim().replaceAll("[^a-zA-Z0-9_-]", "")
                    : "GAR_" + System.currentTimeMillis();
            int randSuffix = java.util.concurrent.ThreadLocalRandom.current().nextInt(1000, 10000);
            String filename = prefix + "_" + randSuffix + ext;

            return storageService.store("garments", filename, file.getBytes());
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to store garment image: " + e.getMessage(), e);
        }
    }

    @Transactional
    public GarmentDto.SummaryResponse uploadGarmentImage(UUID id, org.springframework.web.multipart.MultipartFile file) {
        Garment g = garmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Garment not found with id: " + id));
        String oldUrl = g.getImageUrl();
        if (oldUrl != null && !oldUrl.isBlank()) {
            storageService.deleteIfExists(oldUrl);
        }
        String url = uploadImage(file, g.getGarmentCode());
        g.setImageUrl(url);
        Garment saved = garmentRepository.save(g);
        return toSummaryResponse(saved);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public GarmentDto.SummaryResponse toSummaryResponse(Garment g) {
        int daysRem = 0;
        boolean overdue = false;
        if (g.getDueDate() != null) {
            long diff = ChronoUnit.DAYS.between(LocalDate.now(), g.getDueDate());
            daysRem = (int) diff;
            overdue = diff < 0 && !"Delivered".equalsIgnoreCase(g.getStatus());
        }

        String paymentRatio = formatPayment(g.getPaidAmount(), g.getTotalAmount());

        return GarmentDto.SummaryResponse.builder()
                .id(g.getId())
                .garmentCode(g.getGarmentCode())
                .orderId(g.getOrderId())
                .orderCode(g.getOrderCode())
                .customerName(g.getCustomerName())
                .customerMobile(g.getCustomerMobile())
                .title(g.getTitle())
                .garmentType(g.getGarmentType())
                .specs(g.getSpecs())
                .designCode(g.getDesignCode())
                .collectionName(g.getCollectionName())
                .productionStage(g.getProductionStage())
                .materialStatus(g.getMaterialStatus())
                .trialStatus(g.getTrialStatus())
                .trialDate(g.getTrialDate())
                .dueDate(g.getDueDate())
                .daysRemaining(daysRem)
                .isOverdue(overdue)
                .priority(g.getPriority())
                .paymentStatus(g.getPaymentStatus())
                .paidAmount(g.getPaidAmount())
                .totalAmount(g.getTotalAmount())
                .formattedPaymentRatio(paymentRatio)
                .status(g.getStatus())
                .assignedTo(g.getAssignedTo())
                .designer(g.getDesigner())
                .branch(g.getBranch())
                .imageUrl(g.getImageUrl())
                .primaryFabric(g.getPrimaryFabric())
                .embroideryType(g.getEmbroideryType())
                .colorName(g.getColorName())
                .colorHex(g.getColorHex())
                .estimatedCost(g.getEstimatedCost())
                .suggestedPrice(g.getSuggestedPrice() != null && g.getSuggestedPrice().compareTo(BigDecimal.ZERO) > 0 ? g.getSuggestedPrice() : g.getTotalAmount())
                .craftingHours(g.getCraftingHours())
                .silhouette(g.getSilhouette() != null ? g.getSilhouette() : g.getSpecs())
                .isSample(g.getIsSample())
                .notes(g.getNotes())
                .createdAt(g.getCreatedAt())
                .build();
    }

    private GarmentDto.DetailResponse toDetailResponse(Garment g) {
        GarmentDto.SummaryResponse sum = toSummaryResponse(g);

        List<GarmentDto.MaterialItem> materials = new ArrayList<>();
        if (g.getPrimaryFabric() != null && !g.getPrimaryFabric().isBlank()) {
            materials.add(GarmentDto.MaterialItem.builder()
                    .name(g.getPrimaryFabric())
                    .variant("Primary Body Fabric")
                    .meters(g.getMaterialStatus() != null ? g.getMaterialStatus() : "Allocated")
                    .status(g.getMaterialStatus() != null ? g.getMaterialStatus() : "READY")
                    .imageUrl(g.getImageUrl())
                    .build());
        }
        if (g.getEmbroideryType() != null && !g.getEmbroideryType().isBlank()) {
            materials.add(GarmentDto.MaterialItem.builder()
                    .name(g.getEmbroideryType())
                    .variant("Artisanal Craftsmanship / Ornamentation")
                    .meters("Specified")
                    .status(g.getProductionStage() != null ? g.getProductionStage() : "IN_WORK")
                    .imageUrl(null)
                    .build());
        }

        List<GarmentDto.MeasurementItem> measurements = new ArrayList<>();
        if (g.getSpecs() != null && !g.getSpecs().isBlank()) {
            String[] parts = g.getSpecs().split("[,;]");
            for (String part : parts) {
                String trimmed = part.trim();
                if (!trimmed.isEmpty()) {
                    measurements.add(GarmentDto.MeasurementItem.builder()
                            .label("Specification")
                            .value(trimmed)
                            .build());
                }
            }
        }

        List<GarmentDto.TimelineItem> timeline = new ArrayList<>();
        if (g.getCreatedAt() != null) {
            timeline.add(GarmentDto.TimelineItem.builder()
                    .date(g.getCreatedAt().toLocalDate().toString())
                    .stage("Garment Registered")
                    .description("Garment identity & specifications recorded.")
                    .actor(g.getDesigner() != null ? g.getDesigner() : "Atelier Staff")
                    .color("green")
                    .build());
        }
        if (g.getProductionStage() != null) {
            String dateStr = g.getUpdatedAt() != null ? g.getUpdatedAt().toLocalDate().toString() : "Current";
            timeline.add(GarmentDto.TimelineItem.builder()
                    .date(dateStr)
                    .stage(g.getProductionStage())
                    .description("Active stage: " + g.getProductionStage())
                    .actor(g.getAssignedTo() != null ? g.getAssignedTo() : "Atelier Team")
                    .color("blue")
                    .build());
        }

        return GarmentDto.DetailResponse.builder()
                .id(sum.getId())
                .garmentCode(sum.getGarmentCode())
                .orderId(sum.getOrderId())
                .orderCode(sum.getOrderCode())
                .customerName(sum.getCustomerName())
                .customerMobile(sum.getCustomerMobile())
                .title(sum.getTitle())
                .garmentType(sum.getGarmentType())
                .specs(sum.getSpecs())
                .designCode(sum.getDesignCode())
                .collectionName(sum.getCollectionName())
                .productionStage(sum.getProductionStage())
                .materialStatus(sum.getMaterialStatus())
                .trialStatus(sum.getTrialStatus())
                .trialDate(sum.getTrialDate())
                .dueDate(sum.getDueDate())
                .daysRemaining(sum.getDaysRemaining())
                .isOverdue(sum.getIsOverdue())
                .priority(sum.getPriority())
                .paymentStatus(sum.getPaymentStatus())
                .paidAmount(sum.getPaidAmount())
                .totalAmount(sum.getTotalAmount())
                .formattedPaymentRatio(sum.getFormattedPaymentRatio())
                .status(sum.getStatus())
                .assignedTo(sum.getAssignedTo())
                .designer(sum.getDesigner())
                .branch(sum.getBranch())
                .imageUrl(sum.getImageUrl())
                .primaryFabric(sum.getPrimaryFabric())
                .embroideryType(sum.getEmbroideryType())
                .colorName(sum.getColorName())
                .colorHex(sum.getColorHex())
                .estimatedCost(sum.getEstimatedCost())
                .suggestedPrice(sum.getSuggestedPrice())
                .craftingHours(sum.getCraftingHours())
                .silhouette(sum.getSilhouette())
                .isSample(sum.getIsSample())
                .notes(sum.getNotes())
                .materials(materials)
                .measurements(measurements)
                .timeline(timeline)
                .createdAt(sum.getCreatedAt())
                .build();
    }

    private String formatPayment(BigDecimal paid, BigDecimal total) {
        String pStr = paid != null ? String.format("₹%,.0f", paid.doubleValue()) : "₹0";
        String tStr = total != null ? String.format("₹%,.0f", total.doubleValue()) : "₹0";
        return pStr + " / " + tStr;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFilterOptions(Boolean catalogOnly) {
        UUID companyId = TenantContext.getCompanyId();
        boolean catOnly = catalogOnly == null || catalogOnly;

        List<String> garmentTypes = garmentRepository.findDistinctGarmentTypes(companyId, catOnly);
        List<String> fabrics = garmentRepository.findDistinctFabrics(companyId, catOnly);

        Set<String> collections = new LinkedHashSet<>();
        if (collectionRepository != null) {
            try {
                collectionRepository.findByCompanyIdAndIsFeaturedTrueOrderByCreatedAtDesc(companyId)
                        .forEach(c -> {
                            if (c.getName() != null && !c.getName().isBlank()) collections.add(c.getName().trim());
                        });
            } catch (Exception ignored) {}
        }
        collections.addAll(garmentRepository.findDistinctCollections(companyId, catOnly));

        Set<String> branches = new LinkedHashSet<>();
        if (branchRepository != null) {
            try {
                branchRepository.findByCompanyId(companyId)
                        .forEach(b -> {
                            if (b.getName() != null && !b.getName().isBlank()) branches.add(b.getName().trim());
                        });
            } catch (Exception ignored) {}
        }
        branches.addAll(garmentRepository.findDistinctBranches(companyId, catOnly));

        Set<String> designers = new LinkedHashSet<>();
        designers.addAll(garmentRepository.findDistinctDesigners(companyId, catOnly));
        if (employeeRepository != null) {
            try {
                employeeRepository.findAll().stream()
                        .filter(e -> companyId == null || companyId.equals(e.getCompanyId()))
                        .forEach(e -> {
                            if (e.getName() != null && !e.getName().isBlank()) designers.add(e.getName().trim());
                        });
            } catch (Exception ignored) {}
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("garmentTypes", garmentTypes);
        result.put("collections", new ArrayList<>(collections));
        result.put("fabrics", fabrics);
        result.put("branches", new ArrayList<>(branches));
        result.put("designers", new ArrayList<>(designers));
        result.put("statuses", List.of("In Production", "Ready", "Awaiting QC", "Designing", "Archived"));
        result.put("materialStatuses", List.of("READY", "ALLOCATING", "PENDING"));
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFilterOptions() {
        return getFilterOptions(true);
    }
}
