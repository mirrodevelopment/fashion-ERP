package com.fashionerp.order;

import com.fashionerp.payment.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping
    public Page<OrderDto.Response> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return orderService.list(search, status, pageable);
    }

    @GetMapping("/{id}")
    public OrderDto.Response getById(@PathVariable String id) {
        return orderService.getByIdOrCode(id);
    }

    @PostMapping
    public ResponseEntity<OrderDto.Response> create(@RequestBody OrderDto.Request req) {
        OrderDto.Response created = orderService.create(req);
        URI location = URI.create("/api/v1/orders/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public OrderDto.Response update(@PathVariable UUID id, @RequestBody OrderDto.Request req) {
        return orderService.update(id, req);
    }

    /**
     * POST /api/v1/orders/{id}/reference-images/{slot}
     * Upload a reference image for slot 1-5.
     * The file is stored as {orderCode}-ref{slot}.{ext} under front end/assets/order-ref/.
     */
    @PostMapping(value = "/{id}/reference-images/{slot}",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OrderDto.Response> uploadReferenceImage(
            @PathVariable UUID id,
            @PathVariable int slot,
            @RequestParam("file") MultipartFile file) {
        OrderDto.Response updated = orderService.uploadReferenceImage(id, slot, file);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/v1/orders/{id}/reference-images/{slot}
     * Remove reference image from slot 1-5 (deletes physical file).
     */
    @DeleteMapping("/{id}/reference-images/{slot}")
    public ResponseEntity<OrderDto.Response> deleteReferenceImage(
            @PathVariable UUID id,
            @PathVariable int slot) {
        return ResponseEntity.ok(orderService.deleteReferenceImage(id, slot));
    }

    @GetMapping("/kpis")
    public Map<String, Object> kpis() {
        UUID companyId = com.fashionerp.common.TenantContext.requireCompanyId();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("pendingCount",    orderRepository.countByCompanyIdAndStatus(companyId, OrderStatus.PENDING));
        m.put("inProgressCount", orderRepository.countByCompanyIdAndStatus(companyId, OrderStatus.IN_PROGRESS));
        m.put("readyCount",      orderRepository.countByCompanyIdAndStatus(companyId, OrderStatus.READY));
        m.put("deliveredCount",  orderRepository.countByCompanyIdAndStatus(companyId, OrderStatus.DELIVERED));
        m.put("cancelledCount",  orderRepository.countByCompanyIdAndStatus(companyId, OrderStatus.CANCELLED));

        BigDecimal totalRev = paymentRepository.sumPaidAmount(companyId);
        BigDecimal thisMonthRev = paymentRepository.sumThisMonthPaidAmount(companyId);
        m.put("totalRevenue",     totalRev != null ? totalRev : BigDecimal.ZERO);
        m.put("thisMonthRevenue", thisMonthRev != null ? thisMonthRev : BigDecimal.ZERO);
        return m;
    }
}


