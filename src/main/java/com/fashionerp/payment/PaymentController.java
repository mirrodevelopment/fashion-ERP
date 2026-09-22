package com.fashionerp.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

    @GetMapping("/kpis")
    public Map<String, Object> kpis() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalCollected",    paymentRepository.sumPaidAmount());
        m.put("pendingBalance",    paymentRepository.sumPendingAmount());
        m.put("overdueCount",      paymentRepository.countByStatus(PaymentStatus.OVERDUE));
        m.put("partialCount",      paymentRepository.countByStatus(PaymentStatus.PARTIAL));
        m.put("thisMonthCollected",paymentRepository.sumThisMonthPaidAmount());
        m.put("invoiceCount",      paymentRepository.count());
        return m;
    }
}

