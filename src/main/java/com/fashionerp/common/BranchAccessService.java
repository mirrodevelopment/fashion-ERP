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
        TRIALS,
        PAYMENTS,
        EMPLOYEES,
        PRODUCTION,
        APPOINTMENTS
    }

    /**
     * Determines the effective branch restriction for the current request and module.
     * 
     * @param module the operational module being queried
     * @return null if the user can see records from ALL branches of the company,
     *         or the specific branch name if restricted to their assigned branch.
     */
    public String getEffectiveBranchFilter(BranchModule module) {
        // 1. If user is BRANCH_ADMIN, always enforce their assigned branch
        if (TenantContext.isBranchAdmin()) {
            String b = TenantContext.getAssignedBranch();
            return (b != null && !b.isBlank() && !"ALL".equalsIgnoreCase(b.trim())) ? b.trim() : null;
        }

        String role = TenantContext.getUserRole();
        // 2. Admins, Owners, and Super Admins: check if an active branch filter is selected
        if (role != null) {
            String upper = role.toUpperCase();
            if (upper.contains("ADMIN") || upper.contains("OWNER") || upper.contains("SUPER")) {
                String activeFilter = TenantContext.getActiveBranchFilter();
                if (activeFilter != null && !activeFilter.isBlank() && !"ALL".equalsIgnoreCase(activeFilter.trim())) {
                    return activeFilter.trim();
                }
                return null; // "All Company Data" - see all company records
            }
        }

        // 3. Other users (e.g. staff with multiple branches or single branch):
        String activeFilter = TenantContext.getActiveBranchFilter();
        String userBranch = (activeFilter != null && !activeFilter.isBlank()) ? activeFilter.trim() : TenantContext.getAssignedBranch();
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
            case PAYMENTS -> settings.isShareOrdersAcrossBranches();
            case EMPLOYEES -> false;
            case PRODUCTION -> settings.isShareOrdersAcrossBranches();
            case APPOINTMENTS -> settings.isShareEnquiriesAcrossBranches();
        };

        return shared ? null : userBranch.trim();
    }

    /**
     * Resolves branch filter by prioritizing an explicit request parameter, falling back
     * to the TenantContext active branch filter or role/module sharing settings.
     */
    public String resolveBranch(String requestedBranch, BranchModule module) {
        if (TenantContext.isBranchAdmin()) {
            String b = TenantContext.getAssignedBranch();
            return (b != null && !b.isBlank() && !"ALL".equalsIgnoreCase(b.trim())) ? b.trim() : null;
        }
        if (requestedBranch != null && !requestedBranch.isBlank() && !"ALL".equalsIgnoreCase(requestedBranch.trim())) {
            String role = TenantContext.getUserRole();
            boolean isOwner = role != null && (role.equalsIgnoreCase("OWNER") || role.equalsIgnoreCase("ADMIN") || role.equalsIgnoreCase("SUPER_ADMIN"));
            if (isOwner) {
                return requestedBranch.trim();
            }
            java.util.List<String> allowed = TenantContext.getAllowedBranches();
            if (allowed != null && !allowed.isEmpty()) {
                if (allowed.stream().anyMatch(a -> a.equalsIgnoreCase(requestedBranch.trim()))) {
                    return requestedBranch.trim();
                }
            }
        }
        return getEffectiveBranchFilter(module);
    }

    /**
     * Returns the branch to tag on new records created during this request.
     */
    public String getDefaultBranchForCreation() {
        String activeFilter = TenantContext.getActiveBranchFilter();
        if (activeFilter != null && !activeFilter.isBlank() && !"ALL".equalsIgnoreCase(activeFilter.trim())) {
            return activeFilter.trim();
        }
        String userBranch = TenantContext.getAssignedBranch();
        if (userBranch != null && !userBranch.isBlank() && !"ALL".equalsIgnoreCase(userBranch.trim())) {
            return userBranch.trim();
        }
        return "Main Branch";
    }
}
