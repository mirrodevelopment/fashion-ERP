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

    public static void setUserRole(String role) {
        CURRENT_ROLE.set(role);
    }

    public static String getUserRole() {
        return CURRENT_ROLE.get();
    }

    public static void clear() {
        CURRENT_TENANT.remove();
        CURRENT_BRANCH.remove();
        CURRENT_ROLE.remove();
    }
}
