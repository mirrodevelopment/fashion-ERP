package com.fashionerp.purchase;

import com.fashionerp.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;

    // ── Purchase Orders ──────────────────────────────────────────
    @GetMapping("/purchases")
    public Page<PurchaseOrder> listPurchases(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if ("all".equalsIgnoreCase(status)) {
            status = null;
        }
        UUID companyId = TenantContext.getCompanyId();
        return purchaseOrderRepository.search(companyId, search, status, pageable);
    }

    @GetMapping("/purchases/{id}")
    public PurchaseOrder getPurchaseById(@PathVariable UUID id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase Order not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(po.getCompanyId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase Order not found: " + id);
        }
        return po;
    }

    @PostMapping("/purchases")
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseOrder createPurchase(@RequestBody PurchaseOrder po) {
        UUID companyId = TenantContext.getCompanyId();
        if (po.getCompanyId() == null && companyId != null) {
            po.setCompanyId(companyId);
        }
        if (po.getPoCode() == null || po.getPoCode().isBlank()) {
            po.setPoCode("PO-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        }
        if (po.getStatus() == null || po.getStatus().isBlank()) {
            po.setStatus("DRAFT");
        }
        if (po.getItems() != null) {
            po.getItems().forEach(item -> item.setPurchaseOrder(po));
        }
        return purchaseOrderRepository.save(po);
    }

    @PutMapping("/purchases/{id}")
    public PurchaseOrder updatePurchase(@PathVariable UUID id, @RequestBody PurchaseOrder updated) {
        PurchaseOrder existing = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase Order not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(existing.getCompanyId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase Order not found: " + id);
        }

        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        if (updated.getExpectedDate() != null) existing.setExpectedDate(updated.getExpectedDate());
        if (updated.getReceivedDate() != null) existing.setReceivedDate(updated.getReceivedDate());
        if (updated.getTotalAmount() != null) existing.setTotalAmount(updated.getTotalAmount());
        if (updated.getNotes() != null) existing.setNotes(updated.getNotes());
        if (updated.getSupplier() != null) existing.setSupplier(updated.getSupplier());

        return purchaseOrderRepository.save(existing);
    }

    @DeleteMapping("/purchases/{id}")
    public ResponseEntity<Void> deletePurchase(@PathVariable UUID id) {
        PurchaseOrder existing = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase Order not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(existing.getCompanyId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase Order not found: " + id);
        }
        purchaseOrderRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/purchases/kpis")
    public Map<String, Object> purchaseKpis() {
        UUID companyId = TenantContext.requireCompanyId();
        long totalPos = purchaseOrderRepository.countByCompanyId(companyId);
        BigDecimal totalValue = purchaseOrderRepository.sumTotalAmount(companyId);
        long received = purchaseOrderRepository.countByCompanyIdAndStatus(companyId, "RECEIVED");
        long sent = purchaseOrderRepository.countByCompanyIdAndStatus(companyId, "SENT");
        long partiallyReceived = purchaseOrderRepository.countByCompanyIdAndStatus(companyId, "PARTIALLY_RECEIVED");
        long ordered = purchaseOrderRepository.countByCompanyIdAndStatus(companyId, "ORDERED");
        long draft = purchaseOrderRepository.countByCompanyIdAndStatus(companyId, "DRAFT");

        long pendingDeliveries = sent + partiallyReceived + ordered;
        long activeSuppliers = supplierRepository.countByCompanyId(companyId);

        List<Map<String, Object>> topSuppliers = new ArrayList<>();
        BigDecimal totalValSafe = totalValue != null && totalValue.compareTo(BigDecimal.ZERO) > 0 ? totalValue : BigDecimal.ONE;
        var topSuppList = purchaseOrderRepository.findTopSuppliers(companyId);
        for (Object[] row : topSuppList) {
            String name = (String) row[0];
            BigDecimal val = (BigDecimal) row[1];
            int pct = val.multiply(BigDecimal.valueOf(100)).divide(totalValSafe, 0, java.math.RoundingMode.HALF_UP).intValue();
            Map<String, Object> sup = new LinkedHashMap<>();
            sup.put("name", name);
            sup.put("value", val);
            sup.put("percent", pct);
            topSuppliers.add(sup);
        }

        List<Map<String, Object>> monthlyData = new ArrayList<>();
        var monthlyList = purchaseOrderRepository.findMonthlySpend(companyId);
        for (Object[] row : monthlyList) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", row[0]);
            m.put("total", row[1]);
            monthlyData.add(m);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalPos", totalPos);
        result.put("totalValue", totalValue);
        result.put("pendingDeliveries", pendingDeliveries);
        result.put("goodsReceived", received);
        result.put("draft", draft);
        result.put("activeSuppliers", activeSuppliers);
        result.put("topSuppliers", topSuppliers);
        result.put("monthlySpend", monthlyData);
        return result;
    }

    // ── Suppliers ────────────────────────────────────────────────
    @GetMapping("/suppliers")
    public Page<Supplier> listSuppliers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        UUID companyId = TenantContext.getCompanyId();
        return supplierRepository.search(companyId, search, pageable);
    }

    @GetMapping("/suppliers/{id}")
    public Supplier getSupplierById(@PathVariable UUID id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(supplier.getCompanyId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found: " + id);
        }
        return supplier;
    }

    @PostMapping("/suppliers")
    @ResponseStatus(HttpStatus.CREATED)
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        UUID companyId = TenantContext.getCompanyId();
        if (supplier.getCompanyId() == null && companyId != null) {
            supplier.setCompanyId(companyId);
        }
        if (supplier.getSupplierCode() == null || supplier.getSupplierCode().isBlank()) {
            supplier.setSupplierCode("SUP-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        }
        return supplierRepository.save(supplier);
    }

    @PutMapping("/suppliers/{id}")
    public Supplier updateSupplier(@PathVariable UUID id, @RequestBody Supplier updated) {
        Supplier existing = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(existing.getCompanyId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found: " + id);
        }

        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getContactPerson() != null) existing.setContactPerson(updated.getContactPerson());
        if (updated.getPhone() != null) existing.setPhone(updated.getPhone());
        if (updated.getEmail() != null) existing.setEmail(updated.getEmail());
        if (updated.getAddress() != null) existing.setAddress(updated.getAddress());
        if (updated.getSpecialization() != null) existing.setSpecialization(updated.getSpecialization());
        if (updated.getNotes() != null) existing.setNotes(updated.getNotes());

        return supplierRepository.save(existing);
    }

    @DeleteMapping("/suppliers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSupplier(@PathVariable UUID id) {
        Supplier existing = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(existing.getCompanyId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found: " + id);
        }
        long poCount = purchaseOrderRepository.countBySupplierId(id);
        if (poCount > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete supplier with active purchase orders (" + poCount + " orders found)");
        }
        supplierRepository.delete(existing);
    }

    @GetMapping("/suppliers/{id}/orders")
    public List<PurchaseOrder> getSupplierOrders(@PathVariable UUID id) {
        Supplier existing = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(existing.getCompanyId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found: " + id);
        }
        return purchaseOrderRepository.findBySupplierId(id);
    }
}
