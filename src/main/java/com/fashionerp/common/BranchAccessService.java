package com.fashionerp.common;

import com.fashionerp.company.CompanySettings;
import com.fashionerp.company.CompanySettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Resolves branch-level data sharing policies for the current company tenant.
 * Determines whether branch-assigned users can view cross-branch records or
 * are restricted to their assigned branch based on Company Settings.
 */
@Service
@RequiredArgsConstructor
public class BranchAccessService {

    private final CompanySettingsRepository settingsRepository;

    public enum BranchModule {
        CUSTOMERS,
        ORDERS,
        ENQUIRIES,
        MEASUREMENTS,
        INVENTORY,
        GARMENTS,
        TRIALS
    }

    /**
     * Determines the effective branch restriction for the current request and module.
     * 
     * @param module the operational module being queried
     * @return null if the user can see records from ALL branches of the company,
     *         or the specific branch name if restricted to their assigned branch.
     */
    public String getEffectiveBranchFilter(BranchModule module) {
        String role = TenantContext.getUserRole();
        // Admins, Owners, and Super Admins always possess full visibility across all branches
        if (role != null) {
            String upper = role.toUpperCase();
            if (upper.contains("ADMIN") || upper.contains("OWNER") || upper.contains("SUPER")) {
                return null;
            }
        }

        String userBranch = TenantContext.getAssignedBranch();
        if (userBranch == null || userBranch.isBlank() || "ALL".equalsIgnoreCase(userBranch.trim())) {
            return null;
        }

        UUID companyId = TenantContext.getCompanyId();
        if (companyId == null) {
            return null;
        }

        CompanySettings settings = settingsRepository.findById(companyId).orElse(null);
        if (settings == null) {
            return null; // default to shared if company settings not yet initialized
        }

        boolean shared = switch (module) {
            case CUSTOMERS -> settings.isShareCustomersAcrossBranches();
            case ORDERS -> settings.isShareOrdersAcrossBranches();
            case ENQUIRIES -> settings.isShareEnquiriesAcrossBranches();
            case MEASUREMENTS -> settings.isShareMeasurementsAcrossBranches();
            case INVENTORY -> settings.isShareInventoryAcrossBranches();
            case GARMENTS -> settings.isShareGarmentsAcrossBranches();
            case TRIALS -> settings.isShareTrialsAcrossBranches();
        };

        return shared ? null : userBranch.trim();
    }

    /**
     * Returns the branch to tag on new records created during this request.
     */
    public String getDefaultBranchForCreation() {
        String userBranch = TenantContext.getAssignedBranch();
        if (userBranch != null && !userBranch.isBlank() && !"ALL".equalsIgnoreCase(userBranch.trim())) {
            return userBranch.trim();
        }
        return "Main Branch";
    }
}
