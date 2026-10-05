package com.fashionerp.trial;

import com.fashionerp.order.Order;
import com.fashionerp.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trials")
@RequiredArgsConstructor
public class TrialController {

    private final TrialService trialService;
    private final OrderRepository orderRepository;

    @GetMapping
    public Page<TrialDto.Response> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fitStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Pageable pageable) {
        if ("all".equalsIgnoreCase(status)) status = null;
        if ("all".equalsIgnoreCase(fitStatus)) fitStatus = null;
        return trialService.list(search, status, fitStatus, date, pageable);
    }

    @GetMapping("/{id}")
    public TrialDto.Response getById(@PathVariable String id) {
        try {
            UUID uuid = UUID.fromString(id);
            return trialService.getById(uuid);
        } catch (IllegalArgumentException e) {
            return trialService.getByCode(id);
        }
    }

    @PostMapping
    public ResponseEntity<TrialDto.Response> create(@RequestBody TrialDto.Request req) {
        TrialDto.Response created = trialService.create(req);
        return ResponseEntity.created(URI.create("/api/v1/trials/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public TrialDto.Response update(@PathVariable UUID id, @RequestBody TrialDto.Request req) {
        return trialService.update(id, req);
    }

    @PatchMapping("/{id}/fit-status")
    public TrialDto.Response updateFitStatus(@PathVariable UUID id, @RequestParam String fitStatus) {
        return trialService.updateFitStatus(id, fitStatus);
    }

    @PatchMapping("/{trialId}/alterations/{altId}")
    public TrialDto.Response toggleAlteration(
            @PathVariable UUID trialId,
            @PathVariable UUID altId,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String completedBy) {
        return trialService.toggleAlteration(trialId, altId, completed, completedBy);
    }

    @PostMapping("/{trialId}/alterations")
    public TrialDto.Response addAlteration(@PathVariable UUID trialId, @RequestBody TrialDto.AlterationItem item) {
        return trialService.addAlteration(trialId, item);
    }

    @DeleteMapping("/{trialId}/alterations/{altId}")
    public TrialDto.Response deleteAlteration(@PathVariable UUID trialId, @PathVariable UUID altId) {
        return trialService.deleteAlteration(trialId, altId);
    }

    @GetMapping("/kpis")
    public Map<String, Object> kpis() {
        return trialService.getKpis();
    }

    @PostMapping("/from-order/{orderId}")
    public ResponseEntity<TrialDto.Response> createOrGetForOrder(@PathVariable UUID orderId) {
        TrialDto.Response resp = trialService.createOrGetForOrder(orderId);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{id}/complete-and-advance")
    public TrialDto.Response completeAndAdvance(
            @PathVariable UUID id,
            @RequestParam(required = false) String completedBy) {
        return trialService.completeAndAdvance(id, completedBy);
    }

    @PostMapping("/{id}/schedule-retrial")
    public TrialDto.Response scheduleRetrial(
            @PathVariable UUID id,
            @RequestBody(required = false) TrialDto.Request req) {
        return trialService.scheduleRetrial(id, req);
    }

    @GetMapping("/orders-for-trial")
    public List<Map<String, Object>> getOrdersForTrial(@RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt"));
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        Page<Order> page = orderRepository.search(companyId, search, null, pageable);
        return page.getContent().stream().map(o -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", o.getId());
            item.put("orderCode", o.getOrderCode());
            item.put("customerName", o.getCustomerName() != null && !o.getCustomerName().isBlank()
                    ? o.getCustomerName()
                    : (o.getCustomer() != null ? o.getCustomer().getName() : ""));
            item.put("customerMobile", o.getCustomer() != null ? o.getCustomer().getMobileNumber() : "");
            item.put("garmentType", o.getGarmentType());
            item.put("collection", o.getCollection());
            item.put("currentStage", o.getCurrentStage());
            item.put("status", o.getStatus() != null ? o.getStatus().name() : "");
            item.put("deliveryDate", o.getExpectedDeliveryDate() != null ? o.getExpectedDeliveryDate() : o.getDueDate());
            item.put("totalAmount", o.getTotalAmount());
            long count = trialService.countByOrderCode(o.getOrderCode());
            item.put("trialCount", count);
            return item;
        }).toList();
    }
}
