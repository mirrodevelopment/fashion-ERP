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
    private final com.fashionerp.common.BranchAccessService branchAccessService;

    @GetMapping
    public Page<PaymentDto.Response> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String branch,
            Pageable pageable) {
        return paymentService.list(search, status, branch, pageable);
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
    public Map<String, Object> kpis(@RequestParam(required = false) String branch) {
        UUID companyId = com.fashionerp.common.TenantContext.requireCompanyId();
        String branchFilter = branchAccessService.resolveBranch(branch, com.fashionerp.common.BranchAccessService.BranchModule.PAYMENTS);
        Map<String, Object> m = new LinkedHashMap<>();

        BigDecimal totalColl;
        BigDecimal pendingBal;
        BigDecimal thisMonthColl;
        long overdueCount;
        long partialCount;
        long invoiceCount;

        if (branchFilter != null) {
            totalColl = paymentRepository.sumPaidAmountByBranch(companyId, branchFilter);
            pendingBal = paymentRepository.sumPendingAmountByBranch(companyId, branchFilter);
            thisMonthColl = paymentRepository.sumThisMonthPaidAmountByBranch(companyId, branchFilter);
            overdueCount = paymentRepository.countOverdueByBranch(companyId, branchFilter);
            partialCount = paymentRepository.countByCompanyIdAndBranchAndStatus(companyId, branchFilter, PaymentStatus.PARTIAL);
            invoiceCount = paymentRepository.countByCompanyIdAndBranch(companyId, branchFilter);
        } else {
            totalColl = paymentRepository.sumPaidAmount(companyId);
            pendingBal = paymentRepository.sumPendingAmount(companyId);
            thisMonthColl = paymentRepository.sumThisMonthPaidAmount(companyId);
            overdueCount = paymentRepository.countOverdue(companyId);
            partialCount = paymentRepository.countByCompanyIdAndStatus(companyId, PaymentStatus.PARTIAL);
            invoiceCount = paymentRepository.countByCompanyId(companyId);
        }

        m.put("totalCollected",     totalColl != null ? totalColl : BigDecimal.ZERO);
        m.put("pendingBalance",     pendingBal != null ? pendingBal : BigDecimal.ZERO);
        m.put("overdueCount",       overdueCount);
        m.put("partialCount",       partialCount);
        m.put("thisMonthCollected", thisMonthColl != null ? thisMonthColl : BigDecimal.ZERO);
        m.put("invoiceCount",       invoiceCount);
        return m;
    }
}

