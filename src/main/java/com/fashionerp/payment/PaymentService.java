package com.fashionerp.payment;

import com.fashionerp.customer.CustomerRepository;
import com.fashionerp.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

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

    public PaymentDto.Response getById(UUID id) {
        return paymentRepository.findById(id)
                .map(PaymentDto.Response::from)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + id));
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
    public PaymentDto.Response recordTransaction(UUID paymentId, PaymentDto.TransactionRequest req) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));
        PaymentTransaction txn = PaymentTransaction.builder()
                .payment(payment)
                .amount(req.getAmount())
                .method(req.getMethod() != null ? req.getMethod() : PaymentMethod.CASH)
                .receivedBy(req.getReceivedBy())
                .referenceNo(req.getReferenceNo())
                .notes(req.getNotes())
                .build();
        payment.getTransactions().add(txn);
        payment.setPaidAmount(payment.getPaidAmount().add(req.getAmount()));
        // Update customer balance
        var customer = payment.getCustomer();
        customer.setBalance(customer.getBalance().subtract(req.getAmount()));
        return PaymentDto.Response.from(paymentRepository.save(payment));
    }
}
