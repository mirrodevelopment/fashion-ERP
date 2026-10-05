package com.fashionerp.inventory;

import com.fashionerp.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final com.fashionerp.common.BranchAccessService branchAccessService;

    public Page<InventoryDto.Response> list(String search, String category, String status, Pageable pageable) {
        InventoryStatus statusEnum = (status != null && !status.isBlank())
                ? InventoryStatus.valueOf(status.toUpperCase().replace('-', '_')) : null;
        UUID companyId = TenantContext.getCompanyId();
        String branchFilter = branchAccessService.getEffectiveBranchFilter(com.fashionerp.common.BranchAccessService.BranchModule.INVENTORY);
        return inventoryRepository.search(companyId, branchFilter, search, category, statusEnum, pageable).map(InventoryDto.Response::from);
    }

    public InventoryDto.Response getById(UUID id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(item.getCompanyId())) {
            throw new IllegalArgumentException("Item not found: " + id);
        }
        return InventoryDto.Response.from(item);
    }

    @Transactional
    public InventoryDto.Response create(InventoryDto.Request req) {
        long count = inventoryRepository.count() + 1;
        String code = "ITEM-" + String.format("%04d", count);
        while (inventoryRepository.existsByItemCode(code)) {
            count++;
            code = "ITEM-" + String.format("%04d", count);
        }
        InventoryItem item = InventoryItem.builder()
                .itemCode(code).name(req.getName()).category(req.getCategory())
                .variant(req.getVariant()).unit(req.getUnit() != null ? req.getUnit() : "Unit")
                .stockQty(req.getStockQty() != null ? req.getStockQty() : java.math.BigDecimal.ZERO)
                .reservedQty(req.getReservedQty() != null ? req.getReservedQty() : java.math.BigDecimal.ZERO)
                .reorderLevel(req.getReorderLevel() != null ? req.getReorderLevel() : java.math.BigDecimal.ZERO)
                .purchasePrice(req.getPurchasePrice() != null ? req.getPurchasePrice() : java.math.BigDecimal.ZERO)
                .sellingPrice(req.getSellingPrice() != null ? req.getSellingPrice() : java.math.BigDecimal.ZERO)
                .composition(req.getComposition())
                .weave(req.getWeave())
                .width(req.getWidth())
                .gsm(req.getGsm())
                .hsnCode(req.getHsnCode())
                .origin(req.getOrigin())
                .location(req.getLocation())
                .leadTime(req.getLeadTime())
                .supplierName(req.getSupplierName())
                .supplierContact(req.getSupplierContact())
                .branch(branchAccessService.getDefaultBranchForCreation())
                .notes(req.getNotes())
                .imageUrl(req.getImageUrl())
                .build();
        return InventoryDto.Response.from(inventoryRepository.save(item));
    }

    @Transactional
    public InventoryDto.Response update(UUID id, InventoryDto.Request req) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));
        item.setName(req.getName()); item.setCategory(req.getCategory());
        if (req.getVariant() != null) item.setVariant(req.getVariant());
        if (req.getUnit() != null) item.setUnit(req.getUnit());
        if (req.getStockQty() != null) item.setStockQty(req.getStockQty());
        if (req.getReservedQty() != null) item.setReservedQty(req.getReservedQty());
        if (req.getReorderLevel() != null) item.setReorderLevel(req.getReorderLevel());
        if (req.getPurchasePrice() != null) item.setPurchasePrice(req.getPurchasePrice());
        if (req.getSellingPrice() != null) item.setSellingPrice(req.getSellingPrice());
        if (req.getComposition() != null) item.setComposition(req.getComposition());
        if (req.getWeave() != null) item.setWeave(req.getWeave());
        if (req.getWidth() != null) item.setWidth(req.getWidth());
        if (req.getGsm() != null) item.setGsm(req.getGsm());
        if (req.getHsnCode() != null) item.setHsnCode(req.getHsnCode());
        if (req.getOrigin() != null) item.setOrigin(req.getOrigin());
        if (req.getLocation() != null) item.setLocation(req.getLocation());
        if (req.getLeadTime() != null) item.setLeadTime(req.getLeadTime());
        if (req.getSupplierName() != null) item.setSupplierName(req.getSupplierName());
        if (req.getSupplierContact() != null) item.setSupplierContact(req.getSupplierContact());
        if (req.getNotes() != null) item.setNotes(req.getNotes());
        if (req.getImageUrl() != null) item.setImageUrl(req.getImageUrl());
        return InventoryDto.Response.from(inventoryRepository.save(item));
    }

    /**
     * Adjusts stock quantity and records a corresponding StockMovement ledger entry.
     * A positive quantity means stock added (RECEIPT); negative means stock removed (ISSUE).
     * If the reason text contains "adjust" (case-insensitive), the type is ADJUSTMENT.
     */
    @Transactional
    public InventoryDto.Response adjust(UUID id, InventoryDto.AdjustRequest req) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));
        // BUG-P1-03 FIX: Prevent negative stock
        java.math.BigDecimal currentQty = item.getStockQty() != null ? item.getStockQty() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal newQty = currentQty.add(req.getQuantity());
        if (newQty.compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Insufficient stock: current stock is " + currentQty + ", cannot adjust by " + req.getQuantity());
        }
        item.setStockQty(newQty);
        InventoryItem saved = inventoryRepository.save(item);

        // Determine movement type from context
        MovementType type = req.getMovementType() != null
                ? req.getMovementType()
                : (req.getReason() != null && req.getReason().toLowerCase().contains("adjust")
                        ? MovementType.ADJUSTMENT
                        : (req.getQuantity().signum() >= 0 ? MovementType.RECEIPT : MovementType.ISSUE));

        StockMovement movement = StockMovement.builder()
                .item(saved)
                .movementType(type)
                .quantity(req.getQuantity())
                .reference(req.getReference())
                .notes(req.getReason())
                .movedBy(req.getMovedBy())
                .build();
        stockMovementRepository.save(movement);

        return InventoryDto.Response.from(saved);
    }

    /** Returns all movements for a specific inventory item, newest first */
    public List<StockMovementDto.Response> getMovements(UUID itemId) {
        return stockMovementRepository.findByItemIdOrderByMovedAtDesc(itemId)
                .stream().map(StockMovementDto.Response::from).toList();
    }

    /** Returns paginated movements across all inventory items */
    public Page<StockMovementDto.Response> getAllMovements(Pageable pageable) {
        return stockMovementRepository.findAllByOrderByMovedAtDesc(pageable)
                .map(StockMovementDto.Response::from);
    }

    @Transactional
    public void delete(UUID id) {
        inventoryRepository.deleteById(id);
    }
}
