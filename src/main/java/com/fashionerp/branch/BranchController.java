package com.fashionerp.branch;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    public ResponseEntity<Page<BranchDto.Response>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return ResponseEntity.ok(branchService.list(search, type, active, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchDto.Response> get(@PathVariable UUID id) {
        return ResponseEntity.ok(branchService.get(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchDto.Response> create(@RequestBody BranchDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(branchService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchDto.Response> update(
            @PathVariable UUID id,
            @RequestBody BranchDto.Request request) {
        return ResponseEntity.ok(branchService.update(id, request));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchDto.Response> activate(@PathVariable UUID id) {
        return ResponseEntity.ok(branchService.activate(id));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchDto.Response> deactivate(@PathVariable UUID id) {
        return ResponseEntity.ok(branchService.deactivate(id));
    }

    @PatchMapping("/{id}/headquarters")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchDto.Response> setHeadquarters(@PathVariable UUID id) {
        return ResponseEntity.ok(branchService.setHeadquarters(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        branchService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
