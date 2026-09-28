package com.fashionerp.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.net.URI;
import java.util.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryRepository inventoryRepository;

    @PersistenceContext
    private EntityManager em;

    @GetMapping
    public Page<InventoryDto.Response> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return inventoryService.list(search, category, status, pageable);
    }

    @GetMapping("/{id}")
    public InventoryDto.Response getById(@PathVariable UUID id) {
        return inventoryService.getById(id);
    }

    @PostMapping
    public ResponseEntity<InventoryDto.Response> create(@RequestBody InventoryDto.Request req) {
        InventoryDto.Response created = inventoryService.create(req);
        return ResponseEntity.created(URI.create("/api/v1/inventory/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public InventoryDto.Response update(@PathVariable UUID id, @RequestBody InventoryDto.Request req) {
        return inventoryService.update(id, req);
    }

    @PatchMapping("/{id}/adjust")
    public InventoryDto.Response adjust(@PathVariable UUID id, @RequestBody InventoryDto.AdjustRequest req) {
        return inventoryService.adjust(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        inventoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Stock Movement Ledger Endpoints ──────────────────────────────────────

    /** GET /api/v1/inventory/movements — paginated list of all stock movements */
    @GetMapping("/movements")
    public Page<StockMovementDto.Response> allMovements(Pageable pageable) {
        return inventoryService.getAllMovements(pageable);
    }

    /** GET /api/v1/inventory/{id}/movements — all movements for one specific item */
    @GetMapping("/{id}/movements")
    public List<StockMovementDto.Response> movementsForItem(@PathVariable UUID id) {
        return inventoryService.getMovements(id);
    }

    @GetMapping("/kpis")
    @SuppressWarnings("unchecked")
    public Map<String, Object> kpis() {
        long totalItems      = inventoryRepository.count();
        long lowStockCount   = inventoryRepository.countByStatus(InventoryStatus.LOW_STOCK);
        long outOfStockCount = inventoryRepository.countByStatus(InventoryStatus.OUT_OF_STOCK);

        BigDecimal totalValue = (BigDecimal) em.createQuery(
            "SELECT COALESCE(SUM(i.stockQty * i.purchasePrice), 0) FROM InventoryItem i"
        ).getSingleResult();

        List<Object[]> catRows = em.createQuery(
            "SELECT i.category, COUNT(i), SUM(i.stockQty * i.purchasePrice) FROM InventoryItem i GROUP BY i.category ORDER BY i.category"
        ).getResultList();

        List<Map<String, Object>> categoryBreakdown = new ArrayList<>();
        for (Object[] row : catRows) {
            Map<String, Object> cat = new LinkedHashMap<>();
            cat.put("category", row[0]);
            cat.put("count",    row[1]);
            cat.put("value",    row[2] != null ? row[2] : BigDecimal.ZERO);
            categoryBreakdown.add(cat);
        }

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalItems",         totalItems);
        m.put("totalValue",         totalValue);
        m.put("lowStockCount",      lowStockCount);
        m.put("outOfStockCount",    outOfStockCount);
        m.put("categoryBreakdown",  categoryBreakdown);
        return m;
    }
}

