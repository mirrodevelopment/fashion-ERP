package com.fashionerp.branch;

import com.fashionerp.auth.AppUser;
import com.fashionerp.auth.AppUserRepository;
import com.fashionerp.auth.UserRole;
import com.fashionerp.common.TenantContext;
import com.fashionerp.profile.UserProfile;
import com.fashionerp.profile.UserProfileRepository;
import com.fashionerp.workforce.Employee;
import com.fashionerp.workforce.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BranchService {

    private static final String CODE_PREFIX = "BRN-";
    private static final String DEFAULT_COUNTRY = "India";
    private static final String DEFAULT_TYPE = "SHOWROOM";

    private final BranchRepository branchRepository;
    private final AppUserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    /* ── List ── */
    public Page<BranchDto.Response> list(String search, String type, Boolean active, Pageable pageable) {
        String cleanSearch = (search == null || search.isBlank()) ? null : search.trim();
        String cleanType = (type == null || type.isBlank()) ? null : type.trim();
        UUID companyId = TenantContext.getCompanyId();
        return branchRepository.search(companyId, cleanSearch, cleanType, active, pageable)
            .map(b -> BranchDto.Response.from(b, null, null, resolveManagerName(b.getManagerId())));
    }

    /* ── Get Single ── */
    public BranchDto.Response get(UUID id) {
        Branch branch = branchRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Branch not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(branch.getCompanyId())) {
            throw new RuntimeException("Branch not found: " + id);
        }
        return BranchDto.Response.from(branch, null, null, resolveManagerName(branch.getManagerId()));
    }

    /* ── Create ── */
    @Transactional
    public BranchDto.Response create(BranchDto.Request req) {
        UUID companyId = TenantContext.requireCompanyId();
        String code = generateUniqueCode();
        Branch branch = Branch.builder()
            .companyId(companyId)
            .branchCode(code)
            .name(req.getName())
            .type(req.getType() != null ? req.getType() : DEFAULT_TYPE)
            .streetAddress(req.getStreetAddress())
            .city(req.getCity())
            .state(req.getState())
            .pinCode(req.getPinCode())
            .country(req.getCountry() != null ? req.getCountry() : DEFAULT_COUNTRY)
            .phone(req.getPhone())
            .whatsapp(req.getWhatsapp())
            .email(req.getEmail())
            .website(req.getWebsite())
            .googleMapsUrl(req.getGoogleMapsUrl())
            .active(req.isActive())
            .isHeadquarters(req.isHeadquarters())
            .managerId(req.getManagerId())
            .workingHours(req.getWorkingHours())
            .features(req.getFeatures())
            .notes(req.getNotes())
            .build();
        Branch savedBranch = branchRepository.save(branch);

        String provisionedUsername = null;
        String provisionedPassword = null;
        String managerName = null;

        // Auto-provision default Branch Admin if requested (default is true)
        boolean shouldCreateAdmin = req.getCreateDefaultAdmin() == null || Boolean.TRUE.equals(req.getCreateDefaultAdmin());
        if (shouldCreateAdmin) {
            String candidateUsername = (req.getAdminUsername() != null && !req.getAdminUsername().isBlank())
                ? req.getAdminUsername().trim().toLowerCase()
                : (code.toLowerCase().replace("-", "_") + "_admin");

            String finalUsername = candidateUsername;
            int counter = 1;
            while (userRepository.existsByUsername(finalUsername)) {
                finalUsername = candidateUsername + "_" + counter++;
            }

            String rawPassword = (req.getAdminPassword() != null && !req.getAdminPassword().isBlank())
                ? req.getAdminPassword().trim()
                : ("Branch@" + code.replace("-", ""));

            String fullName = (req.getAdminFullName() != null && !req.getAdminFullName().isBlank())
                ? req.getAdminFullName().trim()
                : (savedBranch.getName() + " Branch Admin");

            String adminEmail = (req.getAdminEmail() != null && !req.getAdminEmail().isBlank())
                ? req.getAdminEmail().trim()
                : savedBranch.getEmail();

            String adminPhone = (req.getAdminPhone() != null && !req.getAdminPhone().isBlank())
                ? req.getAdminPhone().trim()
                : savedBranch.getPhone();

            AppUser adminUser = AppUser.builder()
                .companyId(companyId)
                .username(finalUsername)
                .fullName(fullName)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(UserRole.BRANCH_ADMIN)
                .active(true)
                .email(adminEmail)
                .phone(adminPhone)
                .designation("Branch Administrator")
                .department("Branch Leadership")
                .assignedBranch(savedBranch.getBranchCode())
                .allowedModules(null) // Unrestricted within their branch
                .updatedAt(LocalDateTime.now())
                .build();
            AppUser savedAdmin = userRepository.save(adminUser);

            String joinDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM yyyy"));
            UserProfile profile = UserProfile.builder()
                .companyId(companyId)
                .user(savedAdmin)
                .fullName(savedAdmin.getFullName())
                .displayTitle("Branch Administrator")
                .department("Branch Leadership")
                .email(savedAdmin.getEmail() != null ? savedAdmin.getEmail() : "")
                .phone(savedAdmin.getPhone() != null ? savedAdmin.getPhone() : "")
                .assignedBranch(savedBranch.getBranchCode())
                .clearanceLevel("Level 4 Clearance")
                .systemRoleLabel("BRANCH ADMINISTRATOR")
                .privilegesSummary("All Branch Operations Unlocked")
                .memberSince(joinDate)
                .tenureTier("Branch Leadership")
                .securityStatus("BCrypt")
                .sessionLifetime("24 Hours (Stateless JWT)")
                .workShift("Branch Operations (09:30 AM - 08:00 PM)")
                .build();
            userProfileRepository.save(profile);

            savedBranch.setManagerId(savedAdmin.getId());
            savedBranch = branchRepository.save(savedBranch);

            provisionedUsername = finalUsername;
            provisionedPassword = rawPassword;
            managerName = savedAdmin.getFullName();
            log.info("Provisioned default Branch Admin '{}' for branch '{}' ({})", finalUsername, savedBranch.getName(), savedBranch.getBranchCode());
        } else if (savedBranch.getManagerId() != null) {
            managerName = resolveManagerName(savedBranch.getManagerId());
        }

        return BranchDto.Response.from(savedBranch, provisionedUsername, provisionedPassword, managerName);
    }

    /* ── Update ── */
    @Transactional
    public BranchDto.Response update(UUID id, BranchDto.Request req) {
        UUID companyId = TenantContext.requireCompanyId();
        Branch branch = branchRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() -> new RuntimeException("Branch not found: " + id));
        branch.setName(req.getName());
        branch.setType(req.getType() != null ? req.getType() : DEFAULT_TYPE);
        branch.setStreetAddress(req.getStreetAddress());
        branch.setCity(req.getCity());
        branch.setState(req.getState());
        branch.setPinCode(req.getPinCode());
        branch.setCountry(req.getCountry() != null ? req.getCountry() : DEFAULT_COUNTRY);
        branch.setPhone(req.getPhone());
        branch.setWhatsapp(req.getWhatsapp());
        branch.setEmail(req.getEmail());
        branch.setWebsite(req.getWebsite());
        branch.setGoogleMapsUrl(req.getGoogleMapsUrl());
        branch.setActive(req.isActive());
        branch.setHeadquarters(req.isHeadquarters());
        branch.setManagerId(req.getManagerId());
        branch.setWorkingHours(req.getWorkingHours());
        branch.setFeatures(req.getFeatures());
        branch.setNotes(req.getNotes());
        Branch saved = branchRepository.save(branch);
        return BranchDto.Response.from(saved, null, null, resolveManagerName(saved.getManagerId()));
    }

    /* ── Activate / Deactivate ── */
    @Transactional
    public BranchDto.Response activate(UUID id) {
        UUID companyId = TenantContext.requireCompanyId();
        Branch branch = branchRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() -> new RuntimeException("Branch not found: " + id));
        branch.setActive(true);
        Branch saved = branchRepository.save(branch);
        return BranchDto.Response.from(saved, null, null, resolveManagerName(saved.getManagerId()));
    }

    @Transactional
    public BranchDto.Response deactivate(UUID id) {
        UUID companyId = TenantContext.requireCompanyId();
        Branch branch = branchRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() -> new RuntimeException("Branch not found: " + id));
        branch.setActive(false);
        Branch saved = branchRepository.save(branch);
        return BranchDto.Response.from(saved, null, null, resolveManagerName(saved.getManagerId()));
    }

    /* ── Set Headquarters ── */
    @Transactional
    public BranchDto.Response setHeadquarters(UUID id) {
        UUID companyId = TenantContext.requireCompanyId();
        Branch flagship = branchRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() -> new RuntimeException("Branch not found: " + id));

        List<Branch> companyBranches = branchRepository.findByCompanyId(companyId);
        companyBranches.forEach(b -> b.setHeadquarters(false));
        branchRepository.saveAll(companyBranches);

        flagship.setHeadquarters(true);
        Branch saved = branchRepository.save(flagship);
        return BranchDto.Response.from(saved, null, null, resolveManagerName(saved.getManagerId()));
    }

    /* ── Delete ── */
    @Transactional
    public void delete(UUID id) {
        UUID companyId = TenantContext.requireCompanyId();
        Branch branch = branchRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() -> new RuntimeException("Branch not found: " + id));
        branchRepository.delete(branch);
    }

    /* ── Helper: Resolve Manager Name ── */
    private String resolveManagerName(UUID managerId) {
        if (managerId == null) return null;
        java.util.Optional<AppUser> user = userRepository.findById(managerId);
        if (user.isPresent()) {
            return user.get().getFullName();
        }
        java.util.Optional<Employee> emp = employeeRepository.findById(managerId);
        if (emp.isPresent()) {
            return emp.get().getName();
        }
        return null;
    }

    /* ── Code Generation ── */
    private String generateUniqueCode() {
        UUID companyId = TenantContext.requireCompanyId();
        long count = branchRepository.countByCompanyId(companyId) + 1;
        String code = CODE_PREFIX + String.format("%03d", count);
        while (branchRepository.findByBranchCodeAndCompanyId(code, companyId).isPresent()) {
            count++;
            code = CODE_PREFIX + String.format("%03d", count);
        }
        return code;
    }
}
