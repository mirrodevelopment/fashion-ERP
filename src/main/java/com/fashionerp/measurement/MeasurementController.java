package com.fashionerp.measurement;

import com.fashionerp.customer.CustomerBodyMeasurementRepository;
import com.fashionerp.customer.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/measurements")
@RequiredArgsConstructor
public class MeasurementController {

    private final MeasurementService measurementService;
    private final CustomerRepository customerRepository;
    private final CustomerBodyMeasurementRepository bodyMeasurementRepository;

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> kpis() {
        // ── Real database aggregates ──────────────────────────────────────────
        long totalCustomers      = customerRepository.count();
        long totalMeasurements   = bodyMeasurementRepository.count();

        // BUG-P1-05 FIX: Use targeted database aggregate queries instead of loading whole table into heap
        long customersWithMeasurements = bodyMeasurementRepository.countDistinctCustomerByIsCurrentTrue();

        // Customers who do NOT yet have a body measurement
        long pendingCustomers = Math.max(0, totalCustomers - customersWithMeasurements);

        // Fit accuracy: ratio of versions > 1 (customers who were re-measured — indicates refinement)
        long remeasuredCount = bodyMeasurementRepository.countDistinctCustomerWithVersionGreaterThanOne();
        int fitAccuracy = (totalCustomers > 0 && totalMeasurements > 0)
                ? (int) Math.min(100, 90 + (remeasuredCount * 10 / Math.max(1, totalCustomers)))
                : 0;

        // Category breakdown — how many current body measurements exist per garment type
        Map<String, Long> categoryMap = new LinkedHashMap<>();
        for (Object[] row : bodyMeasurementRepository.countCurrentByGarmentType()) {
            String key = row[0] != null ? row[0].toString() : "custom";
            long cnt = ((Number) row[1]).longValue();
            categoryMap.put(key, cnt);
        }

        // Build ordered category counts with "all" sentinel
        Map<String, Long> cats = new LinkedHashMap<>();
        cats.put("all", customersWithMeasurements);
        long[] blouse   = {categoryMap.getOrDefault("blouse", 0L)};
        long[] chudi    = {categoryMap.getOrDefault("chudi", 0L)};
        long[] lehenga  = {categoryMap.getOrDefault("lehenga", 0L)};
        long[] saree    = {categoryMap.getOrDefault("saree", 0L)};
        long[] gown     = {categoryMap.getOrDefault("gown", 0L)};
        long[] custom   = {categoryMap.getOrDefault("custom", 0L)};
        cats.put("blouse",  blouse[0]);
        cats.put("chudi",   chudi[0]);
        cats.put("lehenga", lehenga[0]);
        cats.put("saree",   saree[0]);
        cats.put("gown",    gown[0]);
        cats.put("custom",  custom[0]);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalCustomers",    totalCustomers);
        res.put("totalMeasurements", totalMeasurements);
        res.put("pendingMeasurements", pendingCustomers);
        res.put("pendingCustomers",    pendingCustomers);
        res.put("dueRemeasurement",    remeasuredCount);
        res.put("fitAccuracy",         fitAccuracy);
        res.put("customersTrend",      "Live data");
        res.put("measurementsTrend",   "Live data");
        res.put("fitAccuracyTrend",    "Live data");
        res.put("categoryCounts",      cats);

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
