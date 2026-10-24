package com.fashionerp.garment;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/garments")
@RequiredArgsConstructor
public class GarmentController {

    private final GarmentService garmentService;

    /**
     * GET /api/v1/garments
     * Paginated search supporting all 8 filters + stage pill tabs
     */
    @GetMapping
    public ResponseEntity<Page<GarmentDto.SummaryResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String garmentType,
            @RequestParam(required = false) String collection,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String materialStatus,
            @RequestParam(required = false) String fabric,
            @RequestParam(required = false) String designer,
            @RequestParam(required = false) String branch,
            @RequestParam(defaultValue = "true") Boolean catalogOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(garmentService.search(
                search, stage, status, garmentType, collection,
                priority, materialStatus, fabric, designer, branch, catalogOnly, pageable
        ));
    }

    /**
     * GET /api/v1/garments/kpis
     * Live metrics for top 6 KPI cards + stage tabs
     */
    @GetMapping("/kpis")
    public ResponseEntity<GarmentDto.KpiResponse> kpis(
            @RequestParam(defaultValue = "true") Boolean catalogOnly,
            @RequestParam(required = false) String branch
    ) {
        return ResponseEntity.ok(garmentService.getKpis(catalogOnly, branch));
    }

    /**
     * GET /api/v1/garments/filter-options
     * Dynamic database-backed filter options (garment types, fabrics, collections, branches, artisans)
     */
    @GetMapping("/filter-options")
    public ResponseEntity<java.util.Map<String, Object>> filterOptions(
            @RequestParam(defaultValue = "true") Boolean catalogOnly
    ) {
        return ResponseEntity.ok(garmentService.getFilterOptions(catalogOnly));
    }

    /**
     * GET /api/v1/garments/{id}
     * Full inspection breakdown for right inspector drawer
     */
    @GetMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<GarmentDto.DetailResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(garmentService.getById(id));
    }

    /**
     * POST /api/v1/garments
     */
    @PostMapping
    public ResponseEntity<GarmentDto.SummaryResponse> create(@RequestBody GarmentDto.CreateRequest req) {
        return ResponseEntity.ok(garmentService.create(req));
    }

    /**
     * PUT /api/v1/garments/{id}
     */
    @PutMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<GarmentDto.SummaryResponse> update(
            @PathVariable UUID id,
            @RequestBody GarmentDto.UpdateRequest req
    ) {
        return ResponseEntity.ok(garmentService.update(id, req));
    }

    /**
     * POST /api/v1/garments/upload-image
     */
    @PostMapping("/upload-image")
    public ResponseEntity<java.util.Map<String, String>> uploadImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "garmentCode", required = false) String garmentCode
    ) {
        String url = garmentService.uploadImage(file, garmentCode);
        return ResponseEntity.ok(java.util.Map.of("imageUrl", url));
    }

    /**
     * POST /api/v1/garments/{id}/image
     */
    @PostMapping("/{id}/image")
    public ResponseEntity<GarmentDto.SummaryResponse> uploadGarmentImage(
            @PathVariable UUID id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) {
        return ResponseEntity.ok(garmentService.uploadGarmentImage(id, file));
    }

    /**
     * DELETE /api/v1/garments/{id}
     */
    @DeleteMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        garmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

