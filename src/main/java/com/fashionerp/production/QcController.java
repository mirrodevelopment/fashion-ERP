package com.fashionerp.production;

import com.fashionerp.order.Order;
import com.fashionerp.order.OrderRepository;
import com.fashionerp.order.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/qc")
@RequiredArgsConstructor
public class QcController {

    private final QcChecklistRepository qcRepository;
    private final OrderRepository orderRepository;
    private final ProductionController productionController;

    @GetMapping("/checklists")
    public List<QcChecklist> listChecklists(@RequestParam(required = false) UUID orderId) {
        if (orderId != null) {
            return qcRepository.findByOrderIdOrderBySortOrderAsc(orderId);
        }
        return qcRepository.findAll();
    }

    @PatchMapping("/checklists/{id}")
    public QcChecklist updateChecklist(
            @PathVariable UUID id,
            @RequestParam(required = false) String result,
            @RequestParam(required = false) String remarks) {
        QcChecklist qc = qcRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "QC checklist item not found: " + id));

        if (result != null) {
            qc.setResult(result.toUpperCase());
            qc.setCheckedAt(LocalDateTime.now());
        }
        if (remarks != null) {
            qc.setRemarks(remarks);
        }
        return qcRepository.save(qc);
    }

    @GetMapping("/kpis")
    public Map<String, Object> kpis() {
        long passed = qcRepository.countByResult("PASS");
        long rework = qcRepository.countByResult("REWORK");
        long fail = qcRepository.countByResult("FAIL");
        long pending = qcRepository.countByResult("PENDING");

        long awaitingQc = qcRepository.countOrdersAwaitingQc();
        long inInspection = Math.min(awaitingQc, 8); // active inspection batch
        long readyDelivery = orderRepository.countByStatus(OrderStatus.READY);

        long totalAudited = passed + rework + fail;
        BigDecimal passRate = totalAudited > 0
                ? BigDecimal.valueOf(passed * 100.0 / totalAudited).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.valueOf(100.0);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("awaitingQc", awaitingQc);
        result.put("inInspection", inInspection);
        result.put("passedQc", passed);
        result.put("reworkRequired", rework + fail);
        result.put("readyDelivery", readyDelivery);
        result.put("pendingItems", pending);
        result.put("passRate", passRate);
        return result;
    }

    /**
     * POST /api/v1/qc/pass
     * Automatically resolves the dynamic next stage after QC and transitions the order forward.
     */
    @PostMapping("/pass")
    public Map<String, Object> passQc(
            @RequestParam UUID orderId,
            @RequestParam(required = false) String notes) {
        Map<String, Object> nextStage = productionController.getNextStageAfterQc();
        String targetStage = (String) nextStage.get("stageKey");
        String passNotes = (notes != null && !notes.isBlank()) ? notes : "Passed QC Inspection";
        return productionController.transitionStage(orderId, targetStage, null, passNotes);
    }

    /**
     * POST /api/v1/qc/rework
     * Increments the order's qc_rework_count and transitions it to the specified rework target stage.
     */
    @PostMapping("/rework")
    public Map<String, Object> reworkQc(
            @RequestParam UUID orderId,
            @RequestParam String targetStage,
            @RequestParam(required = false) UUID assigneeId,
            @RequestParam(required = false) String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));
        int currentCount = order.getQcReworkCount() != null ? order.getQcReworkCount() : 0;
        order.setQcReworkCount(currentCount + 1);
        orderRepository.save(order);

        Map<String, Object> result = productionController.transitionStage(orderId, targetStage, assigneeId, notes);
        result.put("qcReworkCount", order.getQcReworkCount());
        return result;
    }
}
