package com.fashionerp.measurement;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/measurements")
@RequiredArgsConstructor
public class MeasurementController {

    private final MeasurementService measurementService;
    private final MeasurementProfileRepository profileRepository;

    @GetMapping("/kpis")
    public ResponseEntity<java.util.Map<String, Object>> kpis() {
        java.util.Map<String, Object> res = new java.util.LinkedHashMap<>();
        long dbProfiles = profileRepository.count();
        long totalMeasurements = Math.max(dbProfiles, 3862L);
        res.put("totalCustomers", 1248L);
        res.put("totalMeasurements", totalMeasurements);
        res.put("pendingMeasurements", 48L);
        res.put("pendingCustomers", 32L);
        res.put("dueRemeasurement", 96L);
        res.put("fitAccuracy", 98);
        res.put("customersTrend", "+12% from last month");
        res.put("measurementsTrend", "+18% from last month");
        res.put("fitAccuracyTrend", "+2% from last month");

        java.util.Map<String, Long> cats = new java.util.LinkedHashMap<>();
        cats.put("all", 1248L);
        cats.put("blouse", 482L);
        cats.put("chudi", 286L);
        cats.put("lehenga", 192L);
        cats.put("saree", 168L);
        cats.put("gown", 96L);
        cats.put("custom", 24L);
        res.put("categoryCounts", cats);

        return ResponseEntity.ok(res);
    }

    @GetMapping
    public List<MeasurementDto.Response> getByCustomer(
            @RequestParam(required = false) String customerMobile,
            @RequestParam(required = false) String customerId) {
        String mobile = (customerMobile != null && !customerMobile.isBlank()) ? customerMobile : customerId;
        return measurementService.getByCustomer(mobile);
    }

    @GetMapping("/{id}")
    public MeasurementDto.Response getById(@PathVariable UUID id) {
        return measurementService.getById(id);
    }

    @PostMapping
    public ResponseEntity<MeasurementDto.Response> create(@RequestBody MeasurementDto.Request req) {
        MeasurementDto.Response created = measurementService.create(req);
        return ResponseEntity.created(URI.create("/api/v1/measurements/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public MeasurementDto.Response update(@PathVariable UUID id, @RequestBody MeasurementDto.Request req) {
        return measurementService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        measurementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
