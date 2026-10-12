package com.fashionerp.common;

import java.util.UUID;

/**
 * ThreadLocal-based context that holds the active company/tenant ID
 * for the currently executing HTTP request.
 */
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_TENANT = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_BRANCH = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_ROLE = new ThreadLocal<>();

    private static final ThreadLocal<String> ACTIVE_BRANCH_FILTER = new ThreadLocal<>();

    private static final ThreadLocal<java.util.List<String>> ALLOWED_BRANCHES = new ThreadLocal<>();

    private TenantContext() {}

    public static void setCompanyId(UUID companyId) {
        CURRENT_TENANT.set(companyId);
    }

    public static UUID getCompanyId() {
        return CURRENT_TENANT.get();
    }

    public static UUID requireCompanyId() {
        UUID id = CURRENT_TENANT.get();
        if (id == null) {
            throw new IllegalStateException("No active company/tenant context found for current request.");
        }
        return id;
    }

    public static void setAssignedBranch(String branch) {
        CURRENT_BRANCH.set(branch);
    }

    public static String getAssignedBranch() {
        return CURRENT_BRANCH.get();
    }

    public static void setAllowedBranches(java.util.List<String> branches) {
        ALLOWED_BRANCHES.set(branches);
    }

    public static java.util.List<String> getAllowedBranches() {
        return ALLOWED_BRANCHES.get();
    }

    public static void setActiveBranchFilter(String branch) {
        ACTIVE_BRANCH_FILTER.set(branch);
    }

    public static String getActiveBranchFilter() {
        return ACTIVE_BRANCH_FILTER.get();
    }

    public static void setUserRole(String role) {
        CURRENT_ROLE.set(role);
    }

    public static String getUserRole() {
        return CURRENT_ROLE.get();
    }

    public static boolean isCompanyOwner() {
        String role = CURRENT_ROLE.get();
        return "OWNER".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role);
    }

    public static boolean isBranchAdmin() {
        String role = CURRENT_ROLE.get();
        return "BRANCH_ADMIN".equalsIgnoreCase(role);
    }

    public static void clear() {
        CURRENT_TENANT.remove();
        CURRENT_BRANCH.remove();
        CURRENT_ROLE.remove();
        ACTIVE_BRANCH_FILTER.remove();
        ALLOWED_BRANCHES.remove();
    }
}
