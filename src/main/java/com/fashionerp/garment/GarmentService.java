package com.fashionerp.garment;

import com.fashionerp.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GarmentService {

    private final GarmentRepository garmentRepository;

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
        UUID companyId = TenantContext.getCompanyId();
        Page<Garment> page = garmentRepository.searchGarments(
                companyId,
                search, stage, status, garmentType, collectionName,
                priority, materialStatus, fabric, designer, branch, pageable);
        return page.map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public GarmentDto.KpiResponse getKpis() {
        UUID companyId = TenantContext.getCompanyId();
        long total = companyId != null ? garmentRepository.countByCompanyId(companyId) : garmentRepository.count();
        long inProd = garmentRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "IN_PRODUCTION");
        long inTrial = garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "TRIAL");
        long awaitingQc = garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "QC");
        if (awaitingQc == 0) {
            awaitingQc = garmentRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "Awaiting QC");
        }
        long ready = garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "READY");
        if (ready == 0) {
            ready = garmentRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "READY");
        }
        long delivered = garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "DELIVERED");
        if (delivered == 0) {
            delivered = garmentRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "DELIVERED");
        }
        long designing = garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "DESIGNING");
        long onHold = garmentRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "ON_HOLD");
        if (onHold == 0) {
            onHold = garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "ON_HOLD");
        }

        long bridalCount = garmentRepository.countBridalGarments(companyId);
        Double avgHours = garmentRepository.avgCraftingHours(companyId);

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
                .avgCraftingHours(avgHours != null ? Math.round(avgHours * 10.0) / 10.0 : 28.0)
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
        String code = req.getGarmentCode();
        if (code == null || code.isBlank()) {
            code = "GAR-" + (System.currentTimeMillis() % 100000);
        }

        UUID companyId = TenantContext.getCompanyId();
        Garment g = Garment.builder()
                .companyId(companyId)
                .garmentCode(code)
                .orderCode(req.getOrderCode())
                .customerName(req.getCustomerName() != null ? req.getCustomerName() : "Atelier Specimen")
                .customerMobile(req.getCustomerMobile())
                .title(req.getTitle() != null ? req.getTitle() : "Bespoke Garment")
                .garmentType(req.getGarmentType() != null ? req.getGarmentType() : "Custom")
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
                .branch(req.getBranch() != null ? req.getBranch() : "Main Branch")
                .imageUrl(req.getImageUrl())
                .primaryFabric(req.getPrimaryFabric())
                .embroideryType(req.getEmbroideryType())
                .colorName(req.getColorName())
                .colorHex(req.getColorHex())
                .estimatedCost(req.getEstimatedCost() != null ? req.getEstimatedCost() : BigDecimal.ZERO)
                .suggestedPrice(req.getSuggestedPrice() != null ? req.getSuggestedPrice() : (req.getTotalAmount() != null ? req.getTotalAmount() : BigDecimal.ZERO))
                .craftingHours(req.getCraftingHours() != null ? req.getCraftingHours() : 24)
                .silhouette(req.getSilhouette() != null ? req.getSilhouette() : req.getSpecs())
                .isSample(req.getIsSample() != null ? req.getIsSample() : true)
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
            int randSuffix = 1000 + new java.util.Random().nextInt(9000);
            String filename = prefix + "_" + randSuffix + ext;

            java.nio.file.Path storageDir = java.nio.file.Paths.get("front end", "assets", "garments").toAbsolutePath();
            java.nio.file.Files.createDirectories(storageDir);
            java.nio.file.Files.write(storageDir.resolve(filename), file.getBytes());

            return "/front end/assets/garments/" + filename;
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to store garment image: " + e.getMessage(), e);
        }
    }

    @Transactional
    public GarmentDto.SummaryResponse uploadGarmentImage(UUID id, org.springframework.web.multipart.MultipartFile file) {
        Garment g = garmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Garment not found with id: " + id));
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
                    .meters("3.50 m")
                    .status("READY")
                    .imageUrl("../assets/swatch_raw_silk.jpg")
                    .build());
        }
        if (g.getEmbroideryType() != null && !g.getEmbroideryType().isBlank()) {
            materials.add(GarmentDto.MaterialItem.builder()
                    .name(g.getEmbroideryType())
                    .variant("Hand Embroidery & Zari Work")
                    .meters("Crafting Embellishment")
                    .status("IN_WORK")
                    .imageUrl("../assets/swatch_embroidery.jpg")
                    .build());
        }
        materials.add(GarmentDto.MaterialItem.builder()
                .name("Pure Cotton Silk Lining 80g")
                .variant("Internal Structured Lining")
                .meters("2.25 m")
                .status("READY")
                .imageUrl("../assets/pink_silk.jpg")
                .build());

        List<GarmentDto.MeasurementItem> measurements = new ArrayList<>();
        String gType = (g.getGarmentType() != null ? g.getGarmentType().toUpperCase() : "");
        if (gType.contains("LEHENGA") || gType.contains("SKIRT")) {
            measurements.add(GarmentDto.MeasurementItem.builder().label("Waistband Circumference").value("32.0\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Hip (Full)").value("40.5\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Skirt Length").value("42.0\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Hemline Flare").value("180.0\"").build());
        } else if (gType.contains("BLOUSE") || gType.contains("CHOLI")) {
            measurements.add(GarmentDto.MeasurementItem.builder().label("Bust Circumference").value("36.5\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Underbust").value("31.0\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Shoulder Width").value("14.5\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Blouse Length").value("15.0\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Front Neck Depth").value("7.5\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Back Neck Depth").value("10.0\"").build());
        } else if (gType.contains("SHERWANI") || gType.contains("KURTA")) {
            measurements.add(GarmentDto.MeasurementItem.builder().label("Chest Circumference").value("41.0\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Waist (Natural)").value("35.0\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Across Shoulder").value("18.0\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Garment Length").value("45.0\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Sleeve Length").value("25.5\"").build());
        } else {
            measurements.add(GarmentDto.MeasurementItem.builder().label("Bust / Chest").value("38.0\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Waist Circumference").value("32.0\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Hip Circumference").value("41.0\"").build());
            measurements.add(GarmentDto.MeasurementItem.builder().label("Total Garment Length").value("52.0\"").build());
        }

        List<GarmentDto.TimelineItem> timeline = new ArrayList<>();
        timeline.add(GarmentDto.TimelineItem.builder()
                .date("Stage 1")
                .stage("Design & Blueprint Approval")
                .description("Silhouette sketched, fabric swatches finalized and specs entered.")
                .actor(g.getDesigner() != null ? g.getDesigner() : "Lead Designer")
                .color("green")
                .build());
        timeline.add(GarmentDto.TimelineItem.builder()
                .date("Stage 2")
                .stage("Pattern Drafting & Cutting")
                .description("Master paper pattern drafted; fabric cut with ease allowances.")
                .actor(g.getAssignedTo() != null ? g.getAssignedTo() : "Master Tailor")
                .color("blue")
                .build());
        timeline.add(GarmentDto.TimelineItem.builder()
                .date("Stage 3")
                .stage("Handwork & Assembly")
                .description("Artisanal handwork, zardozi embroidery and garment structured assembly.")
                .actor("Atelier Workshop")
                .color("amber")
                .build());
        timeline.add(GarmentDto.TimelineItem.builder()
                .date("Stage 4")
                .stage("Master Quality Check")
                .description("Measurement verification, seam finishing, and packaging.")
                .actor("QC Inspector")
                .color("purple")
                .build());

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
        DecimalFormat df = new DecimalFormat("#,##0");
        String pStr = paid != null ? "₹" + df.format(paid) : "₹0";
        String tStr = total != null ? "₹" + df.format(total) : "₹0";
        return pStr + " / " + tStr;
    }
}
