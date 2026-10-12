package com.fashionerp.auth;

public enum UserRole {
    OWNER,          // Default System User — Company Owner (Unlimited Company Authority)
    BRANCH_ADMIN,   // Default System User — Branch Administrator (Unlimited Branch Authority)
    CUSTOM,         // Created by users if needed (Custom Role with tailored module permissions)
    ADMIN           // Deprecated legacy alias for OWNER
}
