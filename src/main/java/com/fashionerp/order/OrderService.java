package com.fashionerp.order;

import com.fashionerp.customer.Customer;
import com.fashionerp.customer.CustomerRepository;
import com.fashionerp.production.ProductionStage;
import com.fashionerp.production.ProductionStageRepository;
import com.fashionerp.production.StageDefinition;
import com.fashionerp.production.StageDefinitionRepository;
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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final StageDefinitionRepository stageDefinitionRepository;
    private final ProductionStageRepository productionStageRepository;

    public Page<OrderDto.Response> list(String search, String status, Pageable pageable) {
        OrderStatus statusEnum = (status != null && !status.isBlank())
                ? OrderStatus.valueOf(status.toUpperCase().replace('-', '_'))
                : null;
        return orderRepository.search(search, statusEnum, pageable).map(OrderDto.Response::from);
    }

    public OrderDto.Response getById(UUID id) {
        return orderRepository.findById(id)
                .map(OrderDto.Response::from)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
    }

    public OrderDto.Response getByIdOrCode(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Order identifier is required");
        }
        try {
            UUID id = UUID.fromString(identifier);
            return getById(id);
        } catch (IllegalArgumentException e) {
            return orderRepository.findByOrderCode(identifier)
                    .map(OrderDto.Response::from)
                    .orElseThrow(() -> new IllegalArgumentException("Order not found with code: " + identifier));
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
                ? req.getCustomerName() : customer.getName();
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
        // Add initial ORDER stage (legacy progress tracking)
        OrderProgressStage initial = OrderProgressStage.builder()
                .order(order)
                .stage(ProgressStage.ORDER)
                .completedAt(LocalDateTime.now())
                .build();
        order.getProgressStages().add(initial);
        Order saved = orderRepository.save(order);

        // Seed production_stages from active stage definitions so the order
        // immediately appears in the Kanban pipeline at Stage 1 (ORDER_TAKEN).
        List<StageDefinition> activeDefs =
                stageDefinitionRepository.findAllByActiveTrueOrderBySortOrderAsc();
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

        return OrderDto.Response.from(saved);
    }

    @Transactional
    public OrderDto.Response update(UUID id, OrderDto.Request req) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        if (req.getGarmentType() != null) order.setGarmentType(req.getGarmentType());
        if (req.getGarmentDesc() != null) order.setGarmentDesc(req.getGarmentDesc());
        if (req.getCollection() != null) order.setCollection(req.getCollection());
        if (req.getCustomerName() != null && !req.getCustomerName().isBlank()) order.setCustomerName(req.getCustomerName());
        if (req.getOrderDate() != null) order.setOrderDate(req.getOrderDate());
        if (req.getEffectiveExpectedDeliveryDate() != null) {
            order.setExpectedDeliveryDate(req.getEffectiveExpectedDeliveryDate());
            order.setDueDate(req.getEffectiveExpectedDeliveryDate());
        }
        if (req.getDeliveredDate() != null) order.setDeliveredDate(req.getDeliveredDate());
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
        if (req.getNotes() != null) order.setNotes(req.getNotes());
        if (req.getStatus() != null) order.setStatus(req.getStatus());
        if (req.getCurrentStage() != null) {
            String stage = req.getCurrentStage();
            order.setCurrentStage(stage);
            if (req.getStatus() == null) {
                String st = stage.toUpperCase();
                if (st.equals("READY") || st.equals("QC_PASSED") || st.equals("QUALITY")) {
                    order.setStatus(OrderStatus.READY);
                } else if (st.equals("DELIVERED") || st.equals("DELIVERY")) {
                    order.setStatus(OrderStatus.DELIVERED);
                    if (order.getDeliveredDate() == null) order.setDeliveredDate(LocalDate.now());
                } else if (st.equals("ORDER") || st.equals("ORDER_PLACED") || st.equals("DESIGN") || st.equals("DESIGNING")) {
                    if (order.getStatus() != OrderStatus.DELIVERED && order.getStatus() != OrderStatus.CANCELLED) {
                        order.setStatus(OrderStatus.PENDING);
                    }
                } else {
                    order.setStatus(OrderStatus.IN_PROGRESS);
                }
            }
        }
        if (req.getReferenceImages() != null) order.setReferenceImageList(req.getReferenceImages());
        if (req.getProductionNotes() != null) order.setProductionNotes(req.getProductionNotes());
        return OrderDto.Response.from(orderRepository.save(order));
    }

    @Transactional
    public OrderDto.Response addProgress(UUID id, OrderDto.ProgressUpdate req) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        OrderProgressStage stage = OrderProgressStage.builder()
                .order(order)
                .stage(req.getStage())
                .completedAt(LocalDateTime.now())
                .completedBy(req.getCompletedBy())
                .notes(req.getNotes())
                .build();
        order.getProgressStages().add(stage);

        // Auto-update order status AND current_stage based on stage
        String stageName = req.getStage().name();
        order.setCurrentStage(stageName);
        order.setStatus(switch (req.getStage()) {
            case ORDER, MEASUREMENT, CUTTING, SEWING, FINISHING -> OrderStatus.IN_PROGRESS;
            case QUALITY -> OrderStatus.READY;
            case DELIVERY -> {
                order.setDeliveredDate(LocalDate.now());
                yield OrderStatus.DELIVERED;
            }
        });
        return OrderDto.Response.from(orderRepository.save(order));
    }

    private String generateCode() {
        long count = orderRepository.count() + 1;
        int year = java.time.LocalDate.now().getYear();
        return "ORD-" + year + "-" + String.format("%04d", count);
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
        if (slot < 1 || slot > 5) throw new IllegalArgumentException("Slot must be between 1 and 5");

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        try {
            String originalFilename = file.getOriginalFilename();
            String ext = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                    : ".jpg";
            // e.g. ORD-2026-0001-ref2.jpg
            String filename = order.getOrderCode() + "-ref" + slot + ext;

            Path storageDir = Paths.get("front end", "assets", "order-ref").toAbsolutePath();
            Files.createDirectories(storageDir);
            Files.write(storageDir.resolve(filename), file.getBytes());

            String urlPath = "/front end/assets/order-ref/" + filename;

            // Update the list at the given slot (0-indexed list position = slot - 1)
            List<String> imgs = new ArrayList<>(order.getReferenceImageList());
            // Pad to at least 'slot' entries
            while (imgs.size() < slot) imgs.add("");
            imgs.set(slot - 1, urlPath);
            // Remove trailing empty entries
            while (!imgs.isEmpty() && imgs.get(imgs.size() - 1).isEmpty()) imgs.remove(imgs.size() - 1);
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
        if (slot < 1 || slot > 5) throw new IllegalArgumentException("Slot must be between 1 and 5");
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
            } catch (Exception ignored) {}
            imgs.remove(slot - 1);
        }
        order.setReferenceImageList(imgs);
        return OrderDto.Response.from(orderRepository.save(order));
    }
}
