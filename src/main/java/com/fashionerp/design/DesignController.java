package com.fashionerp.design;

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
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1/designs")
@RequiredArgsConstructor
public class DesignController {

    private final DesignRepository designRepository;

    /* ------------------------------------------------------------------
     * LIST — paginated, searchable, filterable by status
     * ------------------------------------------------------------------ */
    @GetMapping
    public Page<Design> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 100, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if ("all".equalsIgnoreCase(status)) {
            status = null;
        }
        return designRepository.search(search, status, pageable);
    }

    /* ------------------------------------------------------------------
     * GET BY ID
     * ------------------------------------------------------------------ */
    @GetMapping("/{id}")
    public Design getById(@PathVariable UUID id) {
        return designRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Design not found: " + id));
    }

    /* ------------------------------------------------------------------
     * CREATE
     * ------------------------------------------------------------------ */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Design create(@RequestBody Design design) {
        if (design.getDesignCode() == null || design.getDesignCode().isBlank()) {
            design.setDesignCode("DES-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        }
        if (design.getStatus() == null || design.getStatus().isBlank()) {
            design.setStatus("DRAFT");
        }
        if (design.getProductionStatus() == null || design.getProductionStatus().isBlank()) {
            design.setProductionStatus("Active");
        }
        return designRepository.save(design);
    }

    /* ------------------------------------------------------------------
     * UPDATE (partial patch)
     * ------------------------------------------------------------------ */
    @PutMapping("/{id}")
    public Design update(@PathVariable UUID id, @RequestBody Design updated) {
        Design d = designRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Design not found: " + id));

        // Original fields
        if (updated.getTitle() != null)        d.setTitle(updated.getTitle());
        if (updated.getGarmentType() != null)  d.setGarmentType(updated.getGarmentType());
        if (updated.getCustomer() != null)     d.setCustomer(updated.getCustomer());
        if (updated.getOrder() != null)        d.setOrder(updated.getOrder());
        if (updated.getStatus() != null)       d.setStatus(updated.getStatus());
        if (updated.getStyleNotes() != null)   d.setStyleNotes(updated.getStyleNotes());
        if (updated.getDesigner() != null)     d.setDesigner(updated.getDesigner());
        if (updated.getThumbnailUrl() != null) d.setThumbnailUrl(updated.getThumbnailUrl());

        // Extended fields
        if (updated.getSubCategory() != null)      d.setSubCategory(updated.getSubCategory());
        if (updated.getStyle() != null)            d.setStyle(updated.getStyle());
        if (updated.getOccasion() != null)         d.setOccasion(updated.getOccasion());
        if (updated.getCollection() != null)       d.setCollection(updated.getCollection());
        if (updated.getPrimaryFabric() != null)    d.setPrimaryFabric(updated.getPrimaryFabric());
        if (updated.getColourOptions() != null)    d.setColourOptions(updated.getColourOptions());
        if (updated.getSizes() != null)            d.setSizes(updated.getSizes());
        if (updated.getConstruction() != null)     d.setConstruction(updated.getConstruction());
        if (updated.getEmbroidery() != null)       d.setEmbroidery(updated.getEmbroidery());
        if (updated.getEstimatedCost() != null)    d.setEstimatedCost(updated.getEstimatedCost());
        if (updated.getSuggestedPrice() != null)   d.setSuggestedPrice(updated.getSuggestedPrice());
        if (updated.getEstimatedLabour() != null)  d.setEstimatedLabour(updated.getEstimatedLabour());
        if (updated.getProductionStatus() != null) d.setProductionStatus(updated.getProductionStatus());
        if (updated.getTimesUsed() > 0)            d.setTimesUsed(updated.getTimesUsed());
        if (updated.getLastUsedDate() != null)     d.setLastUsedDate(updated.getLastUsedDate());
        if (updated.getTags() != null)             d.setTags(updated.getTags());
        if (updated.getSwatches() != null)         d.setSwatches(updated.getSwatches());
        if (updated.getImageUrls() != null)        d.setImageUrls(updated.getImageUrls());
        if (updated.getNotes() != null)            d.setNotes(updated.getNotes());
        if (updated.getCreatedBy() != null)        d.setCreatedBy(updated.getCreatedBy());

        return designRepository.save(d);
    }

    /* ------------------------------------------------------------------
     * DELETE
     * ------------------------------------------------------------------ */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!designRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Design not found: " + id);
        }
        designRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /* ------------------------------------------------------------------
     * KPIs  GET /api/v1/designs/kpis
     * ------------------------------------------------------------------ */
    @GetMapping("/kpis")
    public Map<String, Object> kpis() {
        long total      = designRepository.count();
        long approved   = designRepository.countByStatus("APPROVED");
        long inReview   = designRepository.countByStatus("IN_REVIEW");
        long draft      = designRepository.countByStatus("DRAFT");
        long archived   = designRepository.countByStatus("ARCHIVED");
        long totalUsed  = designRepository.sumTimesUsed();
        BigDecimal avgPrice = designRepository.avgSuggestedPrice()
                                              .setScale(0, RoundingMode.HALF_UP);

        // Category breakdown
        List<Object[]> catRows = designRepository.countByGarmentType();
        String popularCategory = "N/A";
        long popularCategoryCount = 0;
        List<Map<String, Object>> categoryBreakdown = new ArrayList<>();
        for (Object[] row : catRows) {
            String cat   = (String) row[0];
            long   count = ((Number) row[1]).longValue();
            if (count > popularCategoryCount) {
                popularCategory      = cat;
                popularCategoryCount = count;
            }
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("category", cat);
            m.put("count", count);
            m.put("pct", total > 0
                    ? BigDecimal.valueOf(count * 100.0 / total).setScale(1, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO);
            categoryBreakdown.add(m);
        }

        // Top collection
        List<Object[]> collRows = designRepository.topCollections();
        String topCollection = collRows.isEmpty() ? "N/A" : (String) collRows.get(0)[0];

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total",               total);
        result.put("approved",            approved);
        result.put("inReview",            inReview);
        result.put("draft",               draft);
        result.put("archived",            archived);
        result.put("designsToProduction", approved);
        result.put("totalTimesUsed",      totalUsed);
        result.put("avgSuggestedPrice",   avgPrice);
        result.put("popularCategory",     popularCategory);
        result.put("popularCategoryCount",popularCategoryCount);
        result.put("topCollection",       topCollection);
        result.put("categoryBreakdown",   categoryBreakdown);
        return result;
    }

    /* ------------------------------------------------------------------
     * FILTER HELPERS
     * GET /api/v1/designs/collections  — distinct collection names
     * GET /api/v1/designs/occasions    — distinct occasion values
     * ------------------------------------------------------------------ */
    @GetMapping("/collections")
    public List<String> collections() {
        return designRepository.distinctCollections();
    }

    @GetMapping("/occasions")
    public List<String> occasions() {
        return designRepository.distinctOccasions();
    }
}
