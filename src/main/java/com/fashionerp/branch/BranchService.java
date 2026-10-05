package com.fashionerp.branch;

import com.fashionerp.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BranchService {

    private static final String CODE_PREFIX = "BRN-";
    private static final String DEFAULT_COUNTRY = "India";
    private static final String DEFAULT_TYPE = "SHOWROOM";

    private final BranchRepository branchRepository;

    /* ── List ── */
    public Page<BranchDto.Response> list(String search, String type, Boolean active, Pageable pageable) {
        String cleanSearch = (search == null || search.isBlank()) ? null : search.trim();
        String cleanType = (type == null || type.isBlank()) ? null : type.trim();
        UUID companyId = TenantContext.getCompanyId();
        return branchRepository.search(companyId, cleanSearch, cleanType, active, pageable).map(BranchDto.Response::from);
    }

    /* ── Get Single ── */
    public BranchDto.Response get(UUID id) {
        Branch branch = branchRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Branch not found: " + id));
        UUID companyId = TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(branch.getCompanyId())) {
            throw new RuntimeException("Branch not found: " + id);
        }
        return BranchDto.Response.from(branch);
    }

    /* ── Create ── */
    @Transactional
    public BranchDto.Response create(BranchDto.Request req) {
        String code = generateUniqueCode();
        Branch branch = Branch.builder()
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
        return BranchDto.Response.from(branchRepository.save(branch));
    }

    /* ── Update ── */
    @Transactional
    public BranchDto.Response update(UUID id, BranchDto.Request req) {
        Branch branch = branchRepository.findById(id)
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
        return BranchDto.Response.from(branchRepository.save(branch));
    }

    /* ── Activate / Deactivate ── */
    @Transactional
    public BranchDto.Response activate(UUID id) {
        Branch branch = branchRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Branch not found: " + id));
        branch.setActive(true);
        return BranchDto.Response.from(branchRepository.save(branch));
    }

    @Transactional
    public BranchDto.Response deactivate(UUID id) {
        Branch branch = branchRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Branch not found: " + id));
        branch.setActive(false);
        return BranchDto.Response.from(branchRepository.save(branch));
    }

    /* ── Set Headquarters ── */
    @Transactional
    public BranchDto.Response setHeadquarters(UUID id) {
        List<Branch> allBranches = branchRepository.findAll();
        allBranches.forEach(b -> b.setHeadquarters(false));
        branchRepository.saveAll(allBranches);

        Branch flagship = branchRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Branch not found: " + id));
        flagship.setHeadquarters(true);
        return BranchDto.Response.from(branchRepository.save(flagship));
    }

    /* ── Delete ── */
    @Transactional
    public void delete(UUID id) {
        Branch branch = branchRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Branch not found: " + id));
        branchRepository.delete(branch);
    }

    /* ── Code Generation ── */
    private String generateUniqueCode() {
        long count = branchRepository.count() + 1;
        String code = CODE_PREFIX + String.format("%03d", count);
        while (branchRepository.findByBranchCode(code).isPresent()) {
            count++;
            code = CODE_PREFIX + String.format("%03d", count);
        }
        return code;
    }
}
