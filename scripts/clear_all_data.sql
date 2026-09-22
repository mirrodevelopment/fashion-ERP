-- =============================================================================
-- HAULO BOUTIQUE ERP — DATABASE DATA PURGE SCRIPT
-- Truncates all business/transactional tables while preserving all table schemas,
-- columns, indexes, constraints, identity sequences, Flyway migration history,
-- and the core administrator user account.
-- =============================================================================

BEGIN;

-- 1. Truncate all transactional & master data tables with CASCADE and RESTART IDENTITY
TRUNCATE TABLE
    trial_alterations,
    trials,
    order_progress_stages,
    production_stages,
    qc_checklists,
    payment_transactions,
    payments,
    purchase_order_items,
    purchase_orders,
    stock_movements,
    inventory_items,
    measurement_points,
    measurement_profiles,
    customer_measurements,
    customer_body_measurements,
    appointments,
    enquiries,
    orders,
    designs,
    suppliers,
    employees,
    customers
RESTART IDENTITY CASCADE;

-- 2. Clean non-admin users from app_users while preserving the default admin account
DELETE FROM app_users WHERE username != 'admin';

-- 3. Ensure the admin user exists and is active (password: Admin@123)
INSERT INTO app_users (id, username, password_hash, full_name, role, active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin',
    '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Admin@123
    'Boutique Admin',
    'ADMIN',
    true,
    now(),
    now()
)
ON CONFLICT (username) DO UPDATE
SET active = true,
    role = 'ADMIN',
    updated_at = now();

COMMIT;
