package com.fashionerp.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;

    @GetMapping
    public Page<PaymentDto.Response> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return paymentService.list(search, status, pageable);
    }

    @GetMapping("/{id}")
    public PaymentDto.Response getById(@PathVariable UUID id) {
        return paymentService.getById(id);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentDto.Response> getByOrderId(@PathVariable UUID orderId) {
        return paymentService.getByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PaymentDto.Response> create(@RequestBody PaymentDto.Request req) {
        PaymentDto.Response created = paymentService.create(req);
        return ResponseEntity.created(URI.create("/api/v1/payments/" + created.getId())).body(created);
    }

    @PostMapping("/{id}/transactions")
    public PaymentDto.Response recordTransaction(@PathVariable UUID id,
                                                  @RequestBody PaymentDto.TransactionRequest req) {
        return paymentService.recordTransaction(id, req);
    }

    /**
     * One-time backfill endpoint.
     * Creates a Payment record for every existing Order that has none.
     * Safe to call multiple times — idempotent (skips orders already having a Payment row).
     * Trigger once from admin panel / Postman after deployment.
     */
    @PostMapping("/backfill")
    public ResponseEntity<Map<String, Object>> backfill() {
        int created = paymentService.backfillMissingPayments();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "ok");
        result.put("paymentsCreated", created);
        result.put("message", created > 0
                ? created + " payment record(s) created for existing orders."
                : "All orders already have payment records. Nothing to do.");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/kpis")
    public Map<String, Object> kpis() {
        Map<String, Object> m = new LinkedHashMap<>();
        BigDecimal totalColl = paymentRepository.sumPaidAmount();
        BigDecimal pendingBal = paymentRepository.sumPendingAmount();
        BigDecimal thisMonthColl = paymentRepository.sumThisMonthPaidAmount();
        m.put("totalCollected",    totalColl != null ? totalColl : BigDecimal.ZERO);
        m.put("pendingBalance",    pendingBal != null ? pendingBal : BigDecimal.ZERO);
        m.put("overdueCount",      paymentRepository.countByStatus(PaymentStatus.OVERDUE));
        m.put("partialCount",      paymentRepository.countByStatus(PaymentStatus.PARTIAL));
        m.put("thisMonthCollected",thisMonthColl != null ? thisMonthColl : BigDecimal.ZERO);
        m.put("invoiceCount",      paymentRepository.count());
        return m;
    }
}
