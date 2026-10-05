package com.fashionerp.order;

import com.fashionerp.common.TenantContext;
import com.fashionerp.customer.Customer;
import com.fashionerp.customer.CustomerRepository;
import com.fashionerp.payment.Payment;
import com.fashionerp.payment.PaymentMethod;
import com.fashionerp.payment.PaymentRepository;
import com.fashionerp.payment.PaymentTransaction;
import com.fashionerp.production.ProductionStage;
import com.fashionerp.production.ProductionStageRepository;
import com.fashionerp.production.StageDefinition;
import com.fashionerp.production.StageDefinitionRepository;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final PaymentRepository paymentRepository;
    private final StageDefinitionRepository stageDefinitionRepository;
    private final ProductionStageRepository productionStageRepository;

    public Page<OrderDto.Response> list(String search, String status, Pageable pageable) {
        OrderStatus statusEnum = (status != null && !status.isBlank())
                ? OrderStatus.valueOf(status.toUpperCase().replace('-', '_'))
                : null;
        UUID companyId = TenantContext.getCompanyId();
        return orderRepository.search(companyId, search, statusEnum, pageable).map(OrderDto.Response::from);
    }

    public OrderDto.Response getById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(order.getCompanyId())) {
            throw new IllegalArgumentException("Order not found: " + id);
        }
        return OrderDto.Response.from(order);
    }

    public OrderDto.Response getByIdOrCode(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Order identifier is required");
        }
        UUID companyId = TenantContext.getCompanyId();
        try {
            UUID id = UUID.fromString(identifier);
            return getById(id);
        } catch (IllegalArgumentException e) {
            Order order = (companyId != null
                    ? orderRepository.findByOrderCodeAndCompanyId(identifier, companyId)
                    : orderRepository.findByOrderCode(identifier))
                    .orElseThrow(() -> new IllegalArgumentException("Order not found with code: " + identifier));
            return OrderDto.Response.from(order);
        }
    }

    @Transactional
    public OrderDto.Response create(OrderDto.Request req) {
        String mobile = req.getEffectiveMobile();
        Customer customer = customerRepository.findById(mobile)
                .or(() -> customerRepository.findByFlexibleMobile(mobile))
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with mobile: " + mobile));
        String code = generateCode();

        BigDecimal total = req.getEffectiveTotalAmount() != null ? req.getEffectiveTotalAmount() : BigDecimal.ZERO;
        BigDecimal advance = req.getAdvancePaid() != null ? req.getAdvancePaid() : BigDecimal.ZERO;
        BigDecimal balance = req.getBalanceAmount() != null ? req.getBalanceAmount() : total.subtract(advance);
        String custName = (req.getCustomerName() != null && !req.getCustomerName().isBlank())
                ? req.getCustomerName()
                : customer.getName();
        LocalDate expDeliv = req.getEffectiveExpectedDeliveryDate();
        LocalDate ordDate = req.getOrderDate() != null ? req.getOrderDate() : LocalDate.now();

        Order order = Order.builder()
                .orderCode(code)
                .customer(customer)
                .customerName(custName)
                .orderDate(ordDate)
                .expectedDeliveryDate(expDeliv)
                .deliveredDate(req.getDeliveredDate())
                .advancePaid(advance)
                .totalAmount(total)
                .balanceAmount(balance)
                .amount(total)
                .dueDate(expDeliv)
                .garmentType(req.getGarmentType())
                .garmentDesc(req.getGarmentDesc())
                .collection(req.getCollection())
                .notes(req.getNotes())
                .currentStage(req.getCurrentStage() != null ? req.getCurrentStage() : "ORDER_TAKEN")
                .productionNotes(req.getProductionNotes())
                .build();
        if (req.getStatus() != null) {
            order.setStatus(req.getStatus());
        }
        if (req.getReferenceImages() != null) {
            order.setReferenceImageList(req.getReferenceImages());
        }
        // Add initial intake stage (ORDER_TAKEN)
        OrderProgressStage initial = OrderProgressStage.builder()
                .order(order)
                .stage("ORDER_TAKEN")
                .completedAt(LocalDateTime.now())
                .completedBy("System Intake")
                .notes("Order registered at Order Taken")
                .build();
        order.getProgressStages().add(initial);
        Order saved = orderRepository.save(order);

        // Seed production_stages from active stage definitions so the order
        // immediately appears in the Kanban pipeline at Stage 1 (ORDER_TAKEN).
        List<StageDefinition> activeDefs = stageDefinitionRepository.findAllByActiveTrueOrderBySortOrderAsc();
        if (!activeDefs.isEmpty()) {
            List<ProductionStage> stagesToSeed = new ArrayList<>();
            for (StageDefinition def : activeDefs) {
                boolean isFirstStage = "ORDER_TAKEN".equalsIgnoreCase(def.getStageKey())
                        || def.getSortOrder() == 1;
                stagesToSeed.add(ProductionStage.builder()
                        .order(saved)
                        .stageName(def.getStageKey())
                        .sortOrder(def.getSortOrder() != null ? def.getSortOrder() : 0)
                        .status(isFirstStage ? "COMPLETED" : "NOT_STARTED")
                        .startedAt(isFirstStage ? saved.getCreatedAt() : null)
                        .completedAt(isFirstStage ? saved.getCreatedAt() : null)
                        .build());
            }
            productionStageRepository.saveAll(stagesToSeed);
        }

        // ── Auto-create Payment record + advance transaction (if any) ──
        // Payment starts with paidAmount = 0; each payment event is a separate
        // PaymentTransaction.
        Payment autoPayment = Payment.builder()
                .order(saved)
                .customer(customer)
                .totalAmount(total)
                .dueDate(expDeliv)
                .notes("Auto-created from order " + saved.getOrderCode())
                .build();
        // paidAmount starts at 0 — will be accumulated from transactions below
        autoPayment.computeStatus();
        Payment savedPayment = paymentRepository.save(autoPayment);

        // If an advance was paid at order creation, record it as the first transaction
        if (advance.compareTo(BigDecimal.ZERO) > 0) {
            PaymentMethod method = PaymentMethod.CASH;
            if (req.getPaymentMethod() != null && !req.getPaymentMethod().isBlank()) {
                try {
                    String norm = req.getPaymentMethod().trim().toUpperCase().replace(" ", "_").replace("-", "_");
                    method = PaymentMethod.valueOf(norm);
                } catch (IllegalArgumentException ignored) {
                    method = PaymentMethod.CASH;
                }
            }
            PaymentTransaction advanceTxn = PaymentTransaction.builder()
                    .payment(savedPayment)
                    .amount(advance)
                    .method(method)
                    .receivedBy("Staff")
                    .notes("Advance payment collected at order creation — " + saved.getOrderCode())
                    .build();
            savedPayment.getTransactions().add(advanceTxn);
            savedPayment.setPaidAmount(advance);
            savedPayment.computeStatus();
            paymentRepository.save(savedPayment);
            log.info("[OrderService] Advance txn of {} ({}) recorded for order {}", advance, method,
                    saved.getOrderCode());
        }
        log.info("[OrderService] Payment record created for order {}", saved.getOrderCode());

        // Synchronize customer pending balance (receivable) and lifetime spend
        if (customer != null) {
            BigDecimal pendingBal = total.subtract(advance).max(BigDecimal.ZERO);
            BigDecimal currentBal = customer.getBalance() != null ? customer.getBalance() : BigDecimal.ZERO;
            customer.setBalance(currentBal.add(pendingBal));
            BigDecimal currentSpend = customer.getTotalSpend() != null ? customer.getTotalSpend() : BigDecimal.ZERO;
            customer.setTotalSpend(currentSpend.add(advance));
            customerRepository.save(customer);
        }

        return OrderDto.Response.from(saved);
    }

    @Transactional
    public OrderDto.Response update(UUID id, OrderDto.Request req) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        if (req.getGarmentType() != null)
            order.setGarmentType(req.getGarmentType());
        if (req.getGarmentDesc() != null)
            order.setGarmentDesc(req.getGarmentDesc());
        if (req.getCollection() != null)
            order.setCollection(req.getCollection());
        if (req.getCustomerName() != null && !req.getCustomerName().isBlank())
            order.setCustomerName(req.getCustomerName());
        if (req.getOrderDate() != null)
            order.setOrderDate(req.getOrderDate());
        if (req.getEffectiveExpectedDeliveryDate() != null) {
            order.setExpectedDeliveryDate(req.getEffectiveExpectedDeliveryDate());
            order.setDueDate(req.getEffectiveExpectedDeliveryDate());
        }
        if (req.getDeliveredDate() != null)
            order.setDeliveredDate(req.getDeliveredDate());
        if (req.getEffectiveTotalAmount() != null) {
            order.setTotalAmount(req.getEffectiveTotalAmount());
            order.setAmount(req.getEffectiveTotalAmount());
        }
        if (req.getAdvancePaid() != null) {
            order.setAdvancePaid(req.getAdvancePaid());
        }
        if (req.getBalanceAmount() != null) {
            order.setBalanceAmount(req.getBalanceAmount());
        } else if (order.getTotalAmount() != null) {
            BigDecimal adv = order.getAdvancePaid() != null ? order.getAdvancePaid() : BigDecimal.ZERO;
            order.setBalanceAmount(order.getTotalAmount().subtract(adv));
        }
        if (req.getNotes() != null)
            order.setNotes(req.getNotes());
        if (req.getStatus() != null)
            order.setStatus(req.getStatus());
        if (req.getCurrentStage() != null) {
            String stage = req.getCurrentStage();
            order.setCurrentStage(stage);
            if (req.getStatus() == null) {
                // BUG-P1-02 FIX: Standardized stage-to-status mapping including
                // READY_TO_DELIVER and QC
                String st = stage.toUpperCase().replace('-', '_').replace(' ', '_');
                if (st.equals("READY") || st.equals("READY_TO_DELIVER") || st.equals("QC_PASSED")) {
                    order.setStatus(OrderStatus.READY);
                } else if (st.equals("DELIVERED") || st.equals("DELIVERY")) {
                    order.setStatus(OrderStatus.DELIVERED);
                    if (order.getDeliveredDate() == null)
                        order.setDeliveredDate(LocalDate.now());
                } else if (st.equals("ORDER") || st.equals("ORDER_PLACED") || st.equals("DESIGN")
                        || st.equals("DESIGNING")) {
                    if (order.getStatus() != OrderStatus.DELIVERED && order.getStatus() != OrderStatus.CANCELLED) {
                        order.setStatus(OrderStatus.PENDING);
                    }
                } else {
                    order.setStatus(OrderStatus.IN_PROGRESS);
                }
            }
        }
        if (req.getReferenceImages() != null)
            order.setReferenceImageList(req.getReferenceImages());
        if (req.getProductionNotes() != null)
            order.setProductionNotes(req.getProductionNotes());
        return OrderDto.Response.from(orderRepository.save(order));
    }

    // BUG-P0-07 FIX: Prevent collision on concurrent order creation
    private synchronized String generateCode() {
        int year = java.time.LocalDate.now().getYear();
        long count = orderRepository.count() + 1;
        String code = "ORD-" + year + "-" + String.format("%04d", count);
        while (orderRepository.existsByOrderCode(code)) {
            count++;
            code = "ORD-" + year + "-" + String.format("%04d", count);
        }
        return code;
    }

    // ── Reference Image Upload ────────────────────────────────────────────────

    /**
     * Saves an uploaded reference image for an order.
     * Files are stored at: front end/assets/order-ref/{orderId}-ref{slot}.{ext}
     * Slot is 1-based (1..5).
     *
     * @param orderId UUID of the order
     * @param slot    Position index 1-5
     * @param file    Uploaded image file
     * @return Updated order DTO with the new referenceImages list
     */
    @Transactional
    public OrderDto.Response uploadReferenceImage(UUID orderId, int slot, MultipartFile file) {
        if (slot < 1 || slot > 5)
            throw new IllegalArgumentException("Slot must be between 1 and 5");

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        try {
            String originalFilename = file.getOriginalFilename();
            String ext = ".jpg";
            if (originalFilename != null && originalFilename.contains(".")) {
                ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
            }
            // BUG-P2-07 & SEC-02: Whitelist file extensions
            if (!List.of(".jpg", ".jpeg", ".png", ".webp", ".gif").contains(ext)) {
                throw new IllegalArgumentException(
                        "Invalid file type: " + ext + ". Allowed types: jpg, jpeg, png, webp, gif");
            }
            // e.g. ORD-2026-0001-ref2.jpg
            String filename = order.getOrderCode() + "-ref" + slot + ext;

            Path storageDir = Paths.get("front end", "assets", "order-ref").toAbsolutePath();
            Files.createDirectories(storageDir);
            Files.write(storageDir.resolve(filename), file.getBytes());

            String urlPath = "/front end/assets/order-ref/" + filename;

            // Update the list at the given slot (0-indexed list position = slot - 1)
            List<String> imgs = new ArrayList<>(order.getReferenceImageList());
            // Pad to at least 'slot' entries
            while (imgs.size() < slot)
                imgs.add("");
            imgs.set(slot - 1, urlPath);
            // Remove trailing empty entries
            while (!imgs.isEmpty() && imgs.get(imgs.size() - 1).isEmpty())
                imgs.remove(imgs.size() - 1);
            order.setReferenceImageList(imgs);

            return OrderDto.Response.from(orderRepository.save(order));
        } catch (Exception e) {
            throw new RuntimeException("Failed to save reference image: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes one reference image slot.
     */
    @Transactional
    public OrderDto.Response deleteReferenceImage(UUID orderId, int slot) {
        if (slot < 1 || slot > 5)
            throw new IllegalArgumentException("Slot must be between 1 and 5");
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        List<String> imgs = new ArrayList<>(order.getReferenceImageList());
        if (slot <= imgs.size()) {
            // Try to delete the physical file
            try {
                String path = imgs.get(slot - 1);
                if (path != null && !path.isEmpty()) {
                    Path filePath = Paths.get(path.replaceFirst("^/", "")).toAbsolutePath();
                    Files.deleteIfExists(filePath);
                }
            } catch (Exception e) {
                log.warn("Could not delete physical reference image file: {}", e.getMessage());
            }
            imgs.remove(slot - 1);
        }
        order.setReferenceImageList(imgs);
        return OrderDto.Response.from(orderRepository.save(order));
    }
}
