package com.fashionerp.collection;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;

    /**
     * GET /api/v1/collections
     * Query params: search, status, season, year, designer, branch, page, size
     */
    @GetMapping
    public ResponseEntity<Page<CollectionDto.SummaryResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String season,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String designer,
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) Boolean archived,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Integer parsedYear = null;
        if (year != null && !year.isBlank() && !"all".equalsIgnoreCase(year.trim())) {
            try {
                parsedYear = Integer.parseInt(year.trim());
            } catch (NumberFormatException ignored) {}
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(collectionService.search(search, status, season, parsedYear, designer, branch, archived, pageable));
    }

    /**
     * GET /api/v1/collections/kpis
     * Live metrics calculated directly from database records
     */
    @GetMapping("/kpis")
    public ResponseEntity<CollectionDto.KpiResponse> kpis() {
        return ResponseEntity.ok(collectionService.getKpis());
    }

    /**
     * GET /api/v1/collections/{id}
     * Full inspection details for right panel
     */
    @GetMapping("/{id}")
    public ResponseEntity<CollectionDto.DetailResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(collectionService.getById(id));
    }

    /**
     * GET /api/v1/collections/by-name/{name}
     */
    @GetMapping("/by-name/{name}")
    public ResponseEntity<CollectionDto.DetailResponse> getByName(@PathVariable String name) {
        return ResponseEntity.ok(collectionService.getByName(name));
    }

    /**
     * POST /api/v1/collections
     */
    @PostMapping
    public ResponseEntity<CollectionDto.SummaryResponse> create(@Valid @RequestBody CollectionDto.CreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collectionService.create(req));
    }

    /**
     * PUT /api/v1/collections/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CollectionDto.SummaryResponse> update(
            @PathVariable UUID id,
            @RequestBody CollectionDto.UpdateRequest req) {
        return ResponseEntity.ok(collectionService.update(id, req));
    }

    /**
     * PATCH /api/v1/collections/{id}/archive
     */
    @PatchMapping("/{id}/archive")
    public ResponseEntity<CollectionDto.SummaryResponse> toggleArchive(@PathVariable UUID id) {
        return ResponseEntity.ok(collectionService.toggleArchive(id));
    }

    /**
     * DELETE /api/v1/collections/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        collectionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
