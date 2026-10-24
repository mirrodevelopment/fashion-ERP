package com.fashionerp.workforce;

import com.fashionerp.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final com.fashionerp.common.BranchAccessService branchAccessService;
    private final com.fashionerp.common.StorageService storageService;

    public Page<EmployeeDto.Response> list(String search, String role, String status, Pageable pageable) {
        return list(search, role, status, null, pageable);
    }

    public Page<EmployeeDto.Response> list(String search, String role, String status, String branch, Pageable pageable) {
        UUID companyId = TenantContext.getCompanyId();
        String branchFilter = branchAccessService.resolveBranch(branch, com.fashionerp.common.BranchAccessService.BranchModule.EMPLOYEES);
        return employeeRepository.search(companyId, branchFilter, search, role, status, pageable).map(EmployeeDto.Response::from);
    }

    public EmployeeDto.Response get(UUID id) {
        Employee emp = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(emp.getCompanyId())) {
            throw new RuntimeException("Employee not found with id: " + id);
        }
        return EmployeeDto.Response.from(emp);
    }

    public Employee findByIdOrCode(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Employee identifier cannot be blank");
        }
        UUID companyId = TenantContext.getCompanyId();
        try {
            UUID uuid = UUID.fromString(identifier.trim());
            Optional<Employee> byId = employeeRepository.findById(uuid);
            if (byId.isPresent()) {
                if (companyId == null || companyId.equals(byId.get().getCompanyId())) {
                    return byId.get();
                }
            }
        } catch (IllegalArgumentException ignored) {
            // Not a UUID, fallback to employee code
        }

        return (companyId != null
            ? employeeRepository.findByEmployeeCodeAndCompanyId(identifier.trim(), companyId)
            : employeeRepository.findByEmployeeCode(identifier.trim()))
            .orElseThrow(() -> new RuntimeException("Employee not found with id or code: " + identifier));
    }

    @Transactional
    public EmployeeDto.Response create(EmployeeDto.Request req) {
        UUID companyId = TenantContext.getCompanyId();
        long count = (companyId != null ? employeeRepository.countByCompanyId(companyId) : employeeRepository.count()) + 1;
        String code = "EMP-" + String.format("%03d", count);
        while (companyId != null ? employeeRepository.findByEmployeeCodeAndCompanyId(code, companyId).isPresent() : employeeRepository.findByEmployeeCode(code).isPresent()) {
            count++;
            code = "EMP-" + String.format("%03d", count);
        }

        String branch = req.getBranch() != null && !req.getBranch().isBlank()
            ? req.getBranch().trim()
            : (TenantContext.getAssignedBranch() != null && !"ALL".equalsIgnoreCase(TenantContext.getAssignedBranch()) ? TenantContext.getAssignedBranch() : "Main Branch");

        Employee emp = Employee.builder()
            .companyId(companyId)
            .employeeCode(code)
            .name(req.getName())
            .phone(req.getPhone())
            .email(req.getEmail())
            .role(req.getRole() != null ? req.getRole().toUpperCase() : "TAILOR")
            .status(req.getStatus() != null ? req.getStatus().toUpperCase() : "ACTIVE")
            .joinedDate(req.getJoinedDate() != null ? req.getJoinedDate() : LocalDate.now())
            .avatarUrl(req.getAvatarUrl())
            .specialization(req.getSpecialization())
            .notes(req.getNotes())
            .department(req.getDepartment() != null && !req.getDepartment().isBlank() ? req.getDepartment().trim() : "General")
            .salary(req.getSalary() != null ? req.getSalary() : java.math.BigDecimal.ZERO)
            .branch(branch)
            .workload(req.getWorkload() != null ? req.getWorkload() : 0)
            .efficiency(req.getEfficiency() != null ? req.getEfficiency() : 100)
            .completedMonth(req.getCompletedMonth() != null ? req.getCompletedMonth() : 0)
            .build();

        return EmployeeDto.Response.from(employeeRepository.save(emp));
    }

    @Transactional
    public EmployeeDto.Response update(UUID id, EmployeeDto.Request req) {
        Employee emp = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(emp.getCompanyId())) {
            throw new RuntimeException("Employee not found with id: " + id);
        }

        if (req.getName() != null) emp.setName(req.getName());
        if (req.getPhone() != null) emp.setPhone(req.getPhone());
        if (req.getEmail() != null) emp.setEmail(req.getEmail());
        if (req.getRole() != null) emp.setRole(req.getRole().toUpperCase());
        if (req.getStatus() != null) emp.setStatus(req.getStatus().toUpperCase());
        if (req.getJoinedDate() != null) emp.setJoinedDate(req.getJoinedDate());
        if (req.getAvatarUrl() != null) emp.setAvatarUrl(req.getAvatarUrl());
        if (req.getSpecialization() != null) emp.setSpecialization(req.getSpecialization());
        if (req.getNotes() != null) emp.setNotes(req.getNotes());

        // V10 Workforce Department & Performance Metrics
        if (req.getDepartment() != null && !req.getDepartment().isBlank()) emp.setDepartment(req.getDepartment().trim());
        if (req.getSalary() != null) emp.setSalary(req.getSalary());
        if (req.getBranch() != null && !req.getBranch().isBlank()) emp.setBranch(req.getBranch().trim());
        if (req.getWorkload() != null) emp.setWorkload(req.getWorkload());
        if (req.getEfficiency() != null) emp.setEfficiency(req.getEfficiency());
        if (req.getCompletedMonth() != null) emp.setCompletedMonth(req.getCompletedMonth());

        return EmployeeDto.Response.from(employeeRepository.save(emp));
    }

    @Transactional
    public EmployeeDto.Response uploadAvatar(String identifier, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file must not be empty");
        }
        Employee emp = findByIdOrCode(identifier);

        try {
            // Build safe filename: <empId>_<4digits>.<ext>
            String empId = (emp.getEmployeeCode() != null && !emp.getEmployeeCode().isBlank())
                    ? emp.getEmployeeCode().trim().replaceAll("[^a-zA-Z0-9_-]", "")
                    : (emp.getId() != null ? emp.getId().toString().substring(0, 8) : "EMP");

            String originalFilename = file.getOriginalFilename();
            String ext = ".jpg";
            if (originalFilename != null && originalFilename.contains(".")) {
                ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
            }
            if (!java.util.List.of(".jpg", ".jpeg", ".png", ".webp", ".gif").contains(ext)) {
                throw new IllegalArgumentException("Invalid file type: " + ext + ". Allowed types: jpg, jpeg, png, webp, gif");
            }

            int fourDigits = ThreadLocalRandom.current().nextInt(1000, 10000);
            String filename = empId + "_" + fourDigits + ext;

            if (emp.getAvatarUrl() != null && !emp.getAvatarUrl().isBlank()) {
                storageService.deleteIfExists(emp.getAvatarUrl());
            }

            String avatarUrl = storageService.store("employees", filename, file.getBytes());

            // Persist URL to DB
            emp.setAvatarUrl(avatarUrl);
            employeeRepository.save(emp);

            return EmployeeDto.Response.from(emp);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save employee avatar image: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void delete(UUID id) {
        Employee emp = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(emp.getCompanyId())) {
            throw new RuntimeException("Employee not found with id: " + id);
        }
        employeeRepository.delete(emp);
    }
}
