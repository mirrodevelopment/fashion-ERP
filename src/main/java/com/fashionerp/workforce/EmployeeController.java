package com.fashionerp.workforce;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final com.fashionerp.common.BranchAccessService branchAccessService;

    @GetMapping
    public ResponseEntity<Page<EmployeeDto.Response>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String branch,
            Pageable pageable) {
        return ResponseEntity.ok(employeeService.list(search, role, status, branch, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDto.Response> get(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.get(id));
    }

    @PostMapping
    public ResponseEntity<EmployeeDto.Response> create(@RequestBody EmployeeDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDto.Response> update(@PathVariable UUID id, @RequestBody EmployeeDto.Request request) {
        return ResponseEntity.ok(employeeService.update(id, request));
    }

    /**
     * POST /api/v1/employees/{identifier}/avatar
     * Upload an employee avatar photo. Identifier can be UUID or employee code (e.g. EMP-001).
     * File is stored as {empCode}_{4randomDigits}.{ext} in front end/assets/employees/
     */
    @PostMapping(value = "/{identifier}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EmployeeDto.Response> uploadAvatar(
            @PathVariable String identifier,
            @RequestParam("file") MultipartFile file) {
        EmployeeDto.Response updated = employeeService.uploadAvatar(identifier, file);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/departments")
    public List<String> getDepartments() {
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        return employeeRepository.findDistinctDepartments(companyId);
    }

    @GetMapping("/kpis")
    public Map<String, Object> kpis(@RequestParam(required = false) String branch) {
        UUID companyId = com.fashionerp.common.TenantContext.requireCompanyId();
        String branchFilter = branchAccessService.resolveBranch(branch, com.fashionerp.common.BranchAccessService.BranchModule.EMPLOYEES);

        long activeCount;
        long onLeaveCount;
        long totalCount;
        List<Map<String, Object>> deptBreakdown;

        if (branchFilter != null) {
            activeCount = employeeRepository.countByCompanyIdAndStatusAndBranch(companyId, "ACTIVE", branchFilter);
            onLeaveCount = employeeRepository.countByCompanyIdAndStatusAndBranch(companyId, "ON_LEAVE", branchFilter);
            totalCount = employeeRepository.countByCompanyIdAndBranch(companyId, branchFilter);
            deptBreakdown = employeeRepository.countByDepartmentAndBranch(companyId, branchFilter);
        } else {
            activeCount = employeeRepository.countByCompanyIdAndStatus(companyId, "ACTIVE");
            onLeaveCount = employeeRepository.countByCompanyIdAndStatus(companyId, "ON_LEAVE");
            totalCount = employeeRepository.countByCompanyId(companyId);
            deptBreakdown = employeeRepository.countByDepartment(companyId);
        }

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("activeCount",          activeCount);
        m.put("onLeaveCount",          onLeaveCount);
        m.put("totalCount",            totalCount);
        m.put("departmentBreakdown",   deptBreakdown);
        return m;
    }
}


