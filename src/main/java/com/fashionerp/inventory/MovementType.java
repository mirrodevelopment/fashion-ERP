package com.fashionerp.inventory;

public enum MovementType {
    RECEIPT,      // Stock received (purchase, delivery from supplier)
    ISSUE,        // Stock issued (used in production, sent to customer)
    ADJUSTMENT,   // Manual stock correction (damage, count discrepancy)
    RETURN        // Stock returned (customer return, supplier return)
}
