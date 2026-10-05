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
            String designer,
            String branch,
            Pageable pageable) {
        UUID companyId = TenantContext.getCompanyId();
        Page<Garment> page = garmentRepository.searchGarments(
                companyId,
                search, stage, status, garmentType, collectionName,
                priority, materialStatus, designer, branch, pageable);
        return page.map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public GarmentDto.KpiResponse getKpis() {
        UUID companyId = TenantContext.getCompanyId();
        long total = companyId != null ? garmentRepository.countByCompanyId(companyId) : garmentRepository.count();
        long inProd = companyId != null
                ? garmentRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "In Production")
                : garmentRepository.countByStatusIgnoreCase("In Production");
        long inTrial = companyId != null
                ? garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "Trial")
                : garmentRepository.countByProductionStageIgnoreCase("Trial");
        long awaitingQc = companyId != null
                ? garmentRepository.countByCompanyIdAndStatusIgnoreCase(companyId, "Awaiting QC")
                : garmentRepository.countByStatusIgnoreCase("Awaiting QC");
        if (awaitingQc == 0) {
            awaitingQc = companyId != null
                    ? garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "QC")
                    : garmentRepository.countByProductionStageIgnoreCase("QC");
        }
        long ready = companyId != null
                ? garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "Ready")
                : garmentRepository.countByProductionStageIgnoreCase("Ready");
        long delivered = companyId != null
                ? garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "Delivered")
                : garmentRepository.countByProductionStageIgnoreCase("Delivered");
        long designing = companyId != null
                ? garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "Designing")
                : garmentRepository.countByProductionStageIgnoreCase("Designing");
        long onHold = companyId != null
                ? garmentRepository.countByCompanyIdAndProductionStageIgnoreCase(companyId, "On Hold")
                : garmentRepository.countByProductionStageIgnoreCase("On Hold");

        // Real month-over-month deltas require historical data queries; return null
        // until implemented.
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
        // BUG-P0-01 FIX: Validate required business fields — do NOT silently inject
        // fake data
        if (req.getCustomerName() == null || req.getCustomerName().isBlank()) {
            throw new IllegalArgumentException("customerName is required");
        }
        if (req.getOrderCode() == null || req.getOrderCode().isBlank()) {
            throw new IllegalArgumentException("orderCode is required");
        }
        if (req.getTotalAmount() == null) {
            throw new IllegalArgumentException("totalAmount is required");
        }

        String code = req.getGarmentCode();
        if (code == null || code.isBlank()) {
            code = "GRM-" + (System.currentTimeMillis() % 100000);
        }

        UUID companyId = TenantContext.getCompanyId();
        Garment g = Garment.builder()
                .companyId(companyId)
                .garmentCode(code)
                .orderCode(req.getOrderCode())
                .customerName(req.getCustomerName())
                .customerMobile(req.getCustomerMobile())
                .title(req.getTitle())
                .garmentType(req.getGarmentType() != null ? req.getGarmentType() : "Custom")
                .specs(req.getSpecs())
                .designCode(req.getDesignCode())
                .collectionName(req.getCollectionName())
                .productionStage(req.getProductionStage() != null ? req.getProductionStage() : "Designing")
                .materialStatus(req.getMaterialStatus() != null ? req.getMaterialStatus() : "PENDING")
                .trialStatus(req.getTrialStatus() != null ? req.getTrialStatus() : "Not Required")
                .trialDate(req.getTrialDate())
                .dueDate(req.getDueDate())
                .priority(req.getPriority() != null ? req.getPriority() : "Normal")
                .paymentStatus(req.getPaymentStatus() != null ? req.getPaymentStatus() : "Pending")
                .paidAmount(req.getPaidAmount() != null ? req.getPaidAmount() : BigDecimal.ZERO)
                .totalAmount(req.getTotalAmount())
                .status(req.getStatus() != null ? req.getStatus() : "In Production")
                .assignedTo(req.getAssignedTo())
                .designer(req.getDesigner())
                .branch(req.getBranch())
                .imageUrl(req.getImageUrl())
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
        if (req.getNotes() != null) g.setNotes(req.getNotes());

        Garment saved = garmentRepository.save(g);
        return toSummaryResponse(saved);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────


    private GarmentDto.SummaryResponse toSummaryResponse(Garment g) {
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
                .notes(g.getNotes())
                .createdAt(g.getCreatedAt())
                .build();
    }

    private GarmentDto.DetailResponse toDetailResponse(Garment g) {
        GarmentDto.SummaryResponse sum = toSummaryResponse(g);

        // BUG-P0-02 FIX: No hardcoded fabricated data.
        // Return empty lists — real data to be fetched from
        // inventory/customer_body_measurements/production_stages
        // when those cross-entity queries are implemented.
        List<GarmentDto.MaterialItem> materials = new ArrayList<>();
        List<GarmentDto.MeasurementItem> measurements = new ArrayList<>();
        List<GarmentDto.TimelineItem> timeline = new ArrayList<>();

        return GarmentDto.DetailResponse.builder()
                //
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
