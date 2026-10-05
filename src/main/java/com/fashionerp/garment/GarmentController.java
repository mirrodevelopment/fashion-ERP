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
            @RequestParam(required = false) String designer,
            @RequestParam(required = false) String branch,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(garmentService.search(
                search, stage, status, garmentType, collection,
                priority, materialStatus, designer, branch, pageable
        ));
    }

    /**
     * GET /api/v1/garments/kpis
     * Live metrics for top 6 KPI cards + stage tabs
     */
    @GetMapping("/kpis")
    public ResponseEntity<GarmentDto.KpiResponse> kpis() {
        return ResponseEntity.ok(garmentService.getKpis());
    }

    /**
     * GET /api/v1/garments/{id}
     * Full inspection breakdown for right inspector drawer
     */
    @GetMapping("/{id}")
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
    @PutMapping("/{id}")
    public ResponseEntity<GarmentDto.SummaryResponse> update(
            @PathVariable UUID id,
            @RequestBody GarmentDto.UpdateRequest req
    ) {
        return ResponseEntity.ok(garmentService.update(id, req));
    }
}
