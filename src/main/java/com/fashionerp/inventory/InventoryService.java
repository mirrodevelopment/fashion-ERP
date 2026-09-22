package com.fashionerp.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public Page<InventoryDto.Response> list(String search, String category, String status, Pageable pageable) {
        InventoryStatus statusEnum = (status != null && !status.isBlank())
                ? InventoryStatus.valueOf(status.toUpperCase().replace('-', '_')) : null;
        return inventoryRepository.search(search, category, statusEnum, pageable).map(InventoryDto.Response::from);
    }

    public InventoryDto.Response getById(UUID id) {
        return inventoryRepository.findById(id)
                .map(InventoryDto.Response::from)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));
    }

    @Transactional
    public InventoryDto.Response create(InventoryDto.Request req) {
        String code = "ITEM-" + String.format("%04d", inventoryRepository.count() + 1);
        InventoryItem item = InventoryItem.builder()
                .itemCode(code).name(req.getName()).category(req.getCategory())
                .variant(req.getVariant()).unit(req.getUnit() != null ? req.getUnit() : "Meter")
                .stockQty(req.getStockQty()).reservedQty(req.getReservedQty() != null ? req.getReservedQty() : java.math.BigDecimal.ZERO)
                .reorderLevel(req.getReorderLevel()).purchasePrice(req.getPurchasePrice())
                .supplierName(req.getSupplierName()).imageUrl(req.getImageUrl())
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
        if (req.getSupplierName() != null) item.setSupplierName(req.getSupplierName());
        if (req.getImageUrl() != null) item.setImageUrl(req.getImageUrl());
        return InventoryDto.Response.from(inventoryRepository.save(item));
    }

    @Transactional
    public InventoryDto.Response adjust(UUID id, InventoryDto.AdjustRequest req) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));
        item.setStockQty(item.getStockQty().add(req.getQuantity()));
        return InventoryDto.Response.from(inventoryRepository.save(item));
    }

    @Transactional
    public void delete(UUID id) {
        inventoryRepository.deleteById(id);
    }
}
