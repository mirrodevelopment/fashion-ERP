package com.fashionerp.customer;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /** GET /api/v1/customers?search=...&tier=...&page=0&size=20 */
    @GetMapping
    public Page<CustomerDto.Response> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tier,
            Pageable pageable) {
        return customerService.list(search, tier, pageable);
    }

    /** GET /api/v1/customers/{mobile} */
    @GetMapping("/{mobile}")
    public CustomerDto.Response getByMobile(@PathVariable String mobile) {
        return customerService.getByMobile(mobile);
    }

    /** POST /api/v1/customers */
    @PostMapping
    public ResponseEntity<CustomerDto.Response> create(@RequestBody CustomerDto.Request req) {
        CustomerDto.Response created = customerService.create(req);
        URI location = UriComponentsBuilder.fromPath("/api/v1/customers/{mobile}")
                .buildAndExpand(created.getMobileNumber())
                .encode()
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    /** PUT /api/v1/customers/{mobile} */
    @PutMapping("/{mobile}")
    public CustomerDto.Response update(@PathVariable String mobile,
                                       @RequestBody CustomerDto.Request req) {
        return customerService.update(mobile, req);
    }

    /** DELETE /api/v1/customers/{mobile} */
    @DeleteMapping("/{mobile}")
    public ResponseEntity<Void> delete(@PathVariable String mobile) {
        customerService.delete(mobile);
        return ResponseEntity.noContent().build();
    }

    /** POST /api/v1/customers/{mobile}/avatar — Upload customer photo */
    @PostMapping(value = "/{mobile}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CustomerDto.Response> uploadAvatar(
            @PathVariable String mobile,
            @RequestParam("file") MultipartFile file) {
        CustomerDto.Response updated = customerService.uploadAvatar(mobile, file);
        return ResponseEntity.ok(updated);
    }

    // ── Dedicated Separate Measurements Endpoints ───────────────────────

    /** GET /api/v1/customers/{mobile}/measurements */
    @GetMapping("/{mobile}/measurements")
    public List<CustomerDto.MeasurementResponse> getMeasurements(@PathVariable String mobile) {
        return customerService.getMeasurements(mobile);
    }

    /** GET /api/v1/customers/{mobile}/measurements/{garmentType} */
    @GetMapping("/{mobile}/measurements/{garmentType}")
    public CustomerDto.MeasurementResponse getMeasurementByGarment(
            @PathVariable String mobile,
            @PathVariable String garmentType) {
        return customerService.getMeasurementByGarment(mobile, garmentType);
    }

    /** POST /api/v1/customers/{mobile}/measurements */
    @PostMapping("/{mobile}/measurements")
    public ResponseEntity<CustomerDto.MeasurementResponse> saveMeasurement(
            @PathVariable String mobile,
            @RequestBody CustomerDto.MeasurementRequest req) {
        CustomerDto.MeasurementResponse saved = customerService.saveMeasurement(mobile, req);
        return ResponseEntity.ok(saved);
    }

    // ── Tailored Body Measurements (Blouse, Chudi, Lehenga, Saree, Gown) ─

    /** GET /api/v1/customers/{mobile}/body-measurements */
    @GetMapping("/{mobile}/body-measurements")
    public List<CustomerDto.BodyMeasurementResponse> getBodyMeasurements(@PathVariable String mobile) {
        return customerService.getCustomerCurrentBodyMeasurements(mobile);
    }

    /** GET /api/v1/customers/{mobile}/body-measurements/{garmentType} */
    @GetMapping("/{mobile}/body-measurements/{garmentType}")
    public CustomerDto.GarmentMeasurementComparisonResponse getGarmentComparison(
            @PathVariable String mobile,
            @PathVariable String garmentType) {
        return customerService.getGarmentMeasurementComparison(mobile, garmentType);
    }

    /** POST /api/v1/customers/{mobile}/body-measurements */
    @PostMapping("/{mobile}/body-measurements")
    public ResponseEntity<CustomerDto.BodyMeasurementResponse> saveBodyMeasurement(
            @PathVariable String mobile,
            @RequestBody CustomerDto.BodyMeasurementRequest req) {
        CustomerDto.BodyMeasurementResponse saved = customerService.saveBodyMeasurement(mobile, req);
        return ResponseEntity.ok(saved);
    }

    /** GET /api/v1/customers/{mobile}/body-measurements/{garmentType}/history */
    @GetMapping("/{mobile}/body-measurements/{garmentType}/history")
    public List<CustomerDto.BodyMeasurementResponse> getGarmentHistory(
            @PathVariable String mobile,
            @PathVariable String garmentType) {
        return customerService.getGarmentMeasurementHistory(mobile, garmentType);
    }

    // ── Customer Notes Endpoints ─────────────────────────────────────────

    /** GET /api/v1/customers/{mobile}/notes */
    @GetMapping("/{mobile}/notes")
    public List<CustomerDto.NoteResponse> getNotes(@PathVariable String mobile) {
        return customerService.getNotes(mobile);
    }

    /** POST /api/v1/customers/{mobile}/notes */
    @PostMapping("/{mobile}/notes")
    public ResponseEntity<CustomerDto.NoteResponse> addNote(
            @PathVariable String mobile,
            @RequestBody CustomerDto.NoteRequest req) {
        CustomerDto.NoteResponse saved = customerService.addNote(mobile, req);
        return ResponseEntity.ok(saved);
    }

    /** DELETE /api/v1/customers/{mobile}/notes/{noteId} */
    @DeleteMapping("/{mobile}/notes/{noteId}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable String mobile,
            @PathVariable java.util.UUID noteId) {
        customerService.deleteNote(noteId);
        return ResponseEntity.noContent().build();
    }
}

