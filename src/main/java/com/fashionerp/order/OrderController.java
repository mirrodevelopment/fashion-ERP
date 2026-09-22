package com.fashionerp.order;

import com.fashionerp.payment.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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

    @PatchMapping("/{id}/progress")
    public OrderDto.Response addProgress(@PathVariable UUID id,
                                         @RequestBody OrderDto.ProgressUpdate req) {
        return orderService.addProgress(id, req);
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
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("pendingCount",     orderRepository.countByStatus(OrderStatus.PENDING));
        m.put("inProgressCount", orderRepository.countByStatus(OrderStatus.IN_PROGRESS));
        m.put("readyCount",       orderRepository.countByStatus(OrderStatus.READY));
        m.put("deliveredCount",   orderRepository.countByStatus(OrderStatus.DELIVERED));
        m.put("cancelledCount",   orderRepository.countByStatus(OrderStatus.CANCELLED));
        m.put("totalRevenue",     paymentRepository.sumPaidAmount());
        m.put("thisMonthRevenue", paymentRepository.sumThisMonthPaidAmount());
        return m;
    }
}

