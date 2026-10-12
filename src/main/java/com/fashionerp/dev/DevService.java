package com.fashionerp.dev;

import com.fashionerp.auth.AppUser;
import com.fashionerp.auth.AppUserRepository;
import com.fashionerp.branch.Branch;
import com.fashionerp.branch.BranchRepository;
import com.fashionerp.company.CompanySettings;
import com.fashionerp.company.CompanySettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Developer Tooling Service
 * Dynamically queries active companies, branches, and user accounts
 * directly from PostgreSQL database.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DevService {

    private final CompanySettingsRepository companySettingsRepository;
    private final BranchRepository branchRepository;
    private final AppUserRepository userRepository;

    public static final String DEFAULT_DEV_PASSWORD = "Admin@123";

    public List<DevDto.CompanyPersonaResponse> getDeveloperPersonas() {
        List<CompanySettings> companies = companySettingsRepository.findAll();
        List<Branch> allBranches = branchRepository.findAll();
        List<AppUser> allUsers = userRepository.findAll();

        Map<UUID, List<Branch>> branchesByCompany = allBranches.stream()
                .filter(b -> b != null && b.isActive() && b.getCompanyId() != null)
                .collect(Collectors.groupingBy(b -> b.getCompanyId()));

        Map<UUID, List<AppUser>> usersByCompany = allUsers.stream()
                .filter(u -> u != null && (u.getActive() == null || u.getActive()) && u.getCompanyId() != null)
                .collect(Collectors.groupingBy(u -> u.getCompanyId()));

        // Lookup map for branch code -> branch name
        Map<String, String> branchNameByCode = allBranches.stream()
                .filter(b -> b != null && b.getBranchCode() != null && b.getName() != null)
                .collect(Collectors.toMap(b -> b.getBranchCode(), b -> b.getName(), (existing, replacement) -> existing));

        List<DevDto.CompanyPersonaResponse> result = new ArrayList<>();

        for (CompanySettings comp : companies) {
            if (comp == null || comp.getId() == null) {
                continue;
            }

            List<Branch> compBranches = branchesByCompany.getOrDefault(comp.getId(), Collections.emptyList());
            List<AppUser> compUsers = usersByCompany.getOrDefault(comp.getId(), Collections.emptyList());

            List<DevDto.BranchSummary> branchSummaries = compBranches.stream()
                    .filter(Objects::nonNull)
                    .map(b -> DevDto.BranchSummary.builder()
                            .id(b.getId())
                            .branchCode(b.getBranchCode())
                            .name(b.getName())
                            .city(b.getCity())
                            .isHeadquarters(b.isHeadquarters())
                            .build())
                    .sorted((b1, b2) -> {
                        int hqComp = Boolean.compare(b2.isHeadquarters(), b1.isHeadquarters());
                        if (hqComp != 0) return hqComp;
                        String n1 = b1.getName() != null ? b1.getName() : "";
                        String n2 = b2.getName() != null ? b2.getName() : "";
                        return n1.compareToIgnoreCase(n2);
                    })
                    .toList();

            List<DevDto.UserPersona> userPersonas = compUsers.stream()
                    .filter(Objects::nonNull)
                    .map(u -> {
                        String bCode = u.getAssignedBranch();
                        String bName = (bCode != null && !bCode.isBlank()) 
                                ? branchNameByCode.getOrDefault(bCode, bCode) 
                                : "All Branches";
                        return DevDto.UserPersona.builder()
                                .id(u.getId())
                                .username(u.getUsername())
                                .fullName(u.getFullName())
                                .role(u.getRole() != null ? u.getRole().name() : "STAFF")
                                .assignedBranch(bCode)
                                .branchName(bName)
                                .devPassword(DEFAULT_DEV_PASSWORD)
                                .build();
                    })
                    .sorted((u1, u2) -> {
                        String un1 = u1.getUsername() != null ? u1.getUsername() : "";
                        String un2 = u2.getUsername() != null ? u2.getUsername() : "";
                        return un1.compareToIgnoreCase(un2);
                    })
                    .toList();

            result.add(DevDto.CompanyPersonaResponse.builder()
                    .companyId(comp.getId())
                    .companyName(comp.getCompanyName())
                    .shortName(comp.getShortName())
                    .city(comp.getCity())
                    .branchCount(compBranches.size())
                    .shareAcrossBranches(comp.isShareCustomersAcrossBranches())
                    .branches(branchSummaries)
                    .users(userPersonas)
                    .build());
        }

        result.sort((c1, c2) -> {
            String name1 = c1.getCompanyName() != null ? c1.getCompanyName() : "";
            String name2 = c2.getCompanyName() != null ? c2.getCompanyName() : "";
            return name1.compareToIgnoreCase(name2);
        });
        return result;
    }
}
