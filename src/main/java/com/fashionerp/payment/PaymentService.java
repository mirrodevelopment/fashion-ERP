package com.fashionerp.payment;

import com.fashionerp.customer.CustomerRepository;
import com.fashionerp.order.Order;
import com.fashionerp.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    public Page<PaymentDto.Response> list(String search, String status, Pageable pageable) {
        PaymentStatus statusEnum = (status != null && !status.isBlank())
                ? PaymentStatus.valueOf(status.toUpperCase().replace('-', '_')) : null;
        return paymentRepository.search(search, statusEnum, pageable).map(PaymentDto.Response::from);
    }

    @Transactional(readOnly = true)
    public PaymentDto.Response getById(UUID id) {
        return paymentRepository.findById(id)
                .map(PaymentDto.Response::from)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + id));
    }

    @Transactional(readOnly = true)
    public Optional<PaymentDto.Response> getByOrderId(UUID orderId) {
        return paymentRepository.findByOrderId(orderId)
                .map(PaymentDto.Response::from);
    }

    @Transactional
    public PaymentDto.Response create(PaymentDto.Request req) {
        var order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + req.getOrderId()));
        String mobile = req.getEffectiveMobile();
        var customer = customerRepository.findById(mobile)
                .or(() -> customerRepository.findByFlexibleMobile(mobile))
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with mobile: " + mobile));
        Payment payment = Payment.builder()
                .order(order).customer(customer)
                .totalAmount(req.getTotalAmount())
                .dueDate(req.getDueDate())
                .notes(req.getNotes())
                .build();
        return PaymentDto.Response.from(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentDto.Response recordTransaction(UUID paymentOrOrderId, PaymentDto.TransactionRequest req) {
        // BUG-P0-06 FIX: Validate amount > 0
        if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be positive");
        }
        Payment payment = paymentRepository.findById(paymentOrOrderId)
                .or(() -> paymentRepository.findByOrderId(paymentOrOrderId))
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for ID: " + paymentOrOrderId));

        BigDecimal total = payment.getTotalAmount() != null ? payment.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal currentPaid = payment.getPaidAmount() != null ? payment.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal remaining = total.subtract(currentPaid);

        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Order " + (payment.getOrder() != null ? payment.getOrder().getOrderCode() : paymentOrOrderId) + " is already fully paid.");
        }
        if (req.getAmount().compareTo(remaining) > 0) {
            throw new IllegalArgumentException(String.format("Payment amount (₹%s) exceeds outstanding balance (₹%s)", req.getAmount(), remaining));
        }

        PaymentTransaction txn = PaymentTransaction.builder()
                .payment(payment)
                .amount(req.getAmount())
                .method(req.getMethod() != null ? req.getMethod() : PaymentMethod.CASH)
                .receivedBy(req.getReceivedBy() != null && !req.getReceivedBy().isBlank() ? req.getReceivedBy() : "Staff")
                .referenceNo(req.getReferenceNo())
                .notes(req.getNotes() != null && !req.getNotes().isBlank() ? req.getNotes() : "Payment recorded via portal")
                .build();
        payment.getTransactions().add(txn);
        BigDecimal newPaid = currentPaid.add(req.getAmount());
        payment.setPaidAmount(newPaid);
        payment.computeStatus();

        // Synchronize parent Order advancePaid and balanceAmount
        Order order = payment.getOrder();
        if (order != null) {
            order.setAdvancePaid(newPaid);
            BigDecimal newBal = total.subtract(newPaid).max(BigDecimal.ZERO);
            order.setBalanceAmount(newBal);
            orderRepository.save(order);
        }

        // Update customer balance and totalSpend safely
        var customer = payment.getCustomer();
        if (customer != null) {
            BigDecimal currentBal = customer.getBalance() != null ? customer.getBalance() : BigDecimal.ZERO;
            customer.setBalance(currentBal.subtract(req.getAmount()).max(BigDecimal.ZERO));
            BigDecimal currentSpend = customer.getTotalSpend() != null ? customer.getTotalSpend() : BigDecimal.ZERO;
            customer.setTotalSpend(currentSpend.add(req.getAmount()));
            customerRepository.save(customer);
        }
        return PaymentDto.Response.from(paymentRepository.save(payment));
    }

    /**
     * Backfill: creates a Payment record (+ advance transaction) for every Order that has none,
     * and ensures historical orders with advance have their advance transaction recorded.
     * Idempotent — safe to call multiple times.
     * Returns the count of newly created Payment records.
     */
    @Transactional
    public int backfillMissingPayments() {
        List<Order> allOrders = orderRepository.findAll();
        int created = 0;
        for (Order order : allOrders) {
            if (order.getCustomer() == null) {
                log.warn("[Backfill] Skipping order {} — no customer linked", order.getOrderCode());
                continue;
            }
            BigDecimal total   = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
            BigDecimal advance = order.getAdvancePaid() != null ? order.getAdvancePaid() : BigDecimal.ZERO;

            Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
            if (payment == null) {
                payment = Payment.builder()
                        .order(order)
                        .customer(order.getCustomer())
                        .totalAmount(total)
                        .paidAmount(BigDecimal.ZERO)
                        .dueDate(order.getDueDate() != null ? order.getDueDate() : order.getExpectedDeliveryDate())
                        .notes("Backfilled from order " + order.getOrderCode())
                        .build();
                payment.computeStatus();
                payment = paymentRepository.save(payment);
                created++;
                log.info("[Backfill] Created Payment for order {}", order.getOrderCode());
            }

            // Ensure advance transaction exists if advance > 0
            if (advance.compareTo(BigDecimal.ZERO) > 0) {
                boolean hasAdvanceTxn = payment.getTransactions().stream()
                        .anyMatch(t -> t.getNotes() != null && t.getNotes().toLowerCase().contains("advance"));
                if (!hasAdvanceTxn) {
                    PaymentTransaction advanceTxn = PaymentTransaction.builder()
                            .payment(payment)
                            .amount(advance)
                            .method(PaymentMethod.CASH)
                            .receivedBy("Staff")
                            .notes("Advance payment at order creation — " + order.getOrderCode())
                            .transactionDate(order.getCreatedAt() != null ? order.getCreatedAt() : java.time.LocalDateTime.now())
                            .build();
                    payment.getTransactions().add(0, advanceTxn);
                    
                    // Ensure paidAmount is at least the sum of transactions
                    BigDecimal txSum = payment.getTransactions().stream()
                            .map(t -> t != null ? t.getAmount() : BigDecimal.ZERO)
                            .filter(java.util.Objects::nonNull)
                            .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));
                    if (payment.getPaidAmount().compareTo(txSum) < 0) {
                        payment.setPaidAmount(txSum);
                    }
                    payment.computeStatus();
                    paymentRepository.save(payment);
                    log.info("[Backfill] Added advance txn of {} for order {}", advance, order.getOrderCode());
                }
            }
        }
        log.info("[Backfill] Complete — {} payment record(s) created", created);
        return created;
    }
}
