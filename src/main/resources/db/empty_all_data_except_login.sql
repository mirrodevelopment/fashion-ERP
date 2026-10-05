-- =============================================================================
-- HAULO BOUTIQUE ERP — COMPLETE DATABASE DATA PURGE SCRIPT
-- =============================================================================
-- Purpose  : Wipe ALL business, operational, and master-data rows from every
--            table in the fashion_erp database while preserving:
--              • All table schemas, columns, indexes, constraints (DDL unchanged)
--              • flyway_schema_history (never touched)
--              • app_users → admin login only
--              • stage_definitions → ORDER_TAKEN + READY_TO_DELIVER only
--
-- Database : fashion_erp  (PostgreSQL, localhost:5432)
-- Author   : Haulo Boutique ERP — Data Management
-- Safe to  : Run while app server is running (no schema changes)
-- Result   : Fully empty tables, sequences reset, app starts fresh
-- =============================================================================

BEGIN;

-- =============================================================================
-- SECTION 1 — TRUNCATE ALL TRANSACTIONAL & BUSINESS DATA TABLES
-- Using CASCADE to handle foreign-key dependencies automatically.
-- RESTART IDENTITY resets all UUID / serial sequences back to origin.
-- Tables are listed in dependency-safe order but CASCADE handles the rest.
-- =============================================================================

TRUNCATE TABLE
    -- ── Appointments & Trials ─────────────────────────────────────────────
    appointments,
    trial_alterations,
    trials,

    -- ── Branches & Settings ───────────────────────────────────────────────
    branches,
    company_settings,

    -- ── Collections & Designs ────────────────────────────────────────────
    collection_activities,
    collections,
    designs,
    garments,

    -- ── Customers & Measurements ─────────────────────────────────────────
    customer_body_measurements,
    customer_measurements,
    customer_notes,
    customers,

    -- ── Employees ────────────────────────────────────────────────────────
    employees,

    -- ── Enquiries ────────────────────────────────────────────────────────
    enquiries,

    -- ── Inventory & Suppliers ────────────────────────────────────────────
    inventory_items,
    stock_movements,
    purchase_order_items,
    purchase_orders,
    suppliers,

    -- ── Measurement Templates ────────────────────────────────────────────
    measurement_points,
    measurement_profiles,

    -- ── Orders & Payments ────────────────────────────────────────────────
    order_progress_stages,
    orders,
    payment_transactions,
    payments,

    -- ── Production & QC ──────────────────────────────────────────────────
    production_stages,
    qc_checklists,

    -- ── Stage Management ─────────────────────────────────────────────────
    stage_definition_employees

RESTART IDENTITY CASCADE;

-- =============================================================================
-- SECTION 2 — CLEAN stage_definitions
-- Delete all user-created stages. Keep only the two mandatory system boundary
-- stages: ORDER_TAKEN (first) and READY_TO_DELIVER (last).
-- =============================================================================

DELETE FROM stage_definitions
WHERE stage_key NOT IN ('ORDER_TAKEN', 'READY_TO_DELIVER');

-- Re-seed the two mandatory system stages with correct values
-- (ON CONFLICT ensures idempotency — safe to run multiple times)
INSERT INTO stage_definitions (
    id,
    stage_key,
    display_name,
    description,
    required_role,
    dept_label,
    color_class,
    sort_order,
    active,
    image_url,
    created_at,
    updated_at
)
VALUES
(
    '49d1deb1-0cd1-4fff-b54b-833df0783abf',
    'ORDER_TAKEN',
    'Order Taken',
    'Order intake: fabric requirements noted, advance received, and order committed to the production schedule.',
    'STAFF',
    'Order Intake & Reception',
    'stage-emerald',
    1,
    true,
    '/front end/assets/stages/Order_Taken_1010.jpg',
    NOW(),
    NOW()
),
(
    'c0000002-0000-0000-0000-000000000008',
    'READY_TO_DELIVER',
    'Ready to Deliver',
    'Quality approved, packed with care and awaiting customer pickup or boutique handover.',
    'SUPERVISOR',
    'Delivery & Handover',
    'stage-silver',
    2,
    true,
    '/front end/assets/stages/Ready_8043.jpg',
    NOW(),
    NOW()
)
ON CONFLICT (stage_key) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        description  = EXCLUDED.description,
        dept_label   = EXCLUDED.dept_label,
        sort_order   = EXCLUDED.sort_order,
        active       = true,
        updated_at   = NOW();

-- =============================================================================
-- SECTION 3 — CLEAN app_users & user_profiles
-- Remove all non-admin users and profiles. Ensure the admin account exists and is active.
-- Default credentials: admin / Admin@123
-- =============================================================================

DELETE FROM user_profiles WHERE user_id NOT IN (SELECT id FROM app_users WHERE username = 'admin');
DELETE FROM app_users WHERE username != 'admin';

INSERT INTO app_users (
    id,
    username,
    password_hash,
    full_name,
    role,
    active,
    created_at,
    updated_at
)
VALUES (
    'd74e0819-2f3d-401b-a5ab-102d02ae74b8',
    'admin',
    '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Admin@123
    'Boutique Admin',
    'ADMIN',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (username) DO UPDATE
    SET active     = true,
        role       = 'ADMIN',
        updated_at = NOW();

INSERT INTO user_profiles (
    id,
    user_id,
    full_name,
    created_at,
    updated_at
)
SELECT
    'd44afacf-256f-427f-9140-c8d93bab72c1',
    id,
    'Boutique Admin',
    NOW(),
    NOW()
FROM app_users
WHERE username = 'admin'
ON CONFLICT (user_id) DO UPDATE
    SET full_name = 'Boutique Admin',
        updated_at = NOW();

-- =============================================================================
-- SECTION 4 — VERIFICATION
-- Quick row-count check on every table to confirm the purge succeeded.
-- All counts should be 0 except stage_definitions (=2), app_users (=1), and user_profiles (=1).
-- =============================================================================

SELECT 'appointments'              AS tbl, COUNT(*) AS rows FROM appointments
UNION ALL
SELECT 'branches',                         COUNT(*) FROM branches
UNION ALL
SELECT 'collection_activities',            COUNT(*) FROM collection_activities
UNION ALL
SELECT 'collections',                      COUNT(*) FROM collections
UNION ALL
SELECT 'company_settings',                 COUNT(*) FROM company_settings
UNION ALL
SELECT 'customer_body_measurements',       COUNT(*) FROM customer_body_measurements
UNION ALL
SELECT 'customer_measurements',            COUNT(*) FROM customer_measurements
UNION ALL
SELECT 'customer_notes',                   COUNT(*) FROM customer_notes
UNION ALL
SELECT 'customers',                        COUNT(*) FROM customers
UNION ALL
SELECT 'designs',                          COUNT(*) FROM designs
UNION ALL
SELECT 'employees',                        COUNT(*) FROM employees
UNION ALL
SELECT 'enquiries',                        COUNT(*) FROM enquiries
UNION ALL
SELECT 'garments',                         COUNT(*) FROM garments
UNION ALL
SELECT 'inventory_items',                  COUNT(*) FROM inventory_items
UNION ALL
SELECT 'measurement_points',              COUNT(*) FROM measurement_points
UNION ALL
SELECT 'measurement_profiles',             COUNT(*) FROM measurement_profiles
UNION ALL
SELECT 'order_progress_stages',            COUNT(*) FROM order_progress_stages
UNION ALL
SELECT 'orders',                           COUNT(*) FROM orders
UNION ALL
SELECT 'payment_transactions',             COUNT(*) FROM payment_transactions
UNION ALL
SELECT 'payments',                         COUNT(*) FROM payments
UNION ALL
SELECT 'production_stages',                COUNT(*) FROM production_stages
UNION ALL
SELECT 'purchase_order_items',             COUNT(*) FROM purchase_order_items
UNION ALL
SELECT 'purchase_orders',                  COUNT(*) FROM purchase_orders
UNION ALL
SELECT 'qc_checklists',                    COUNT(*) FROM qc_checklists
UNION ALL
SELECT 'stage_definition_employees',       COUNT(*) FROM stage_definition_employees
UNION ALL
SELECT 'stock_movements',                  COUNT(*) FROM stock_movements
UNION ALL
SELECT 'suppliers',                        COUNT(*) FROM suppliers
UNION ALL
SELECT 'trial_alterations',                COUNT(*) FROM trial_alterations
UNION ALL
SELECT 'trials',                           COUNT(*) FROM trials
UNION ALL
SELECT '--- PRESERVED ---',               0
UNION ALL
SELECT 'app_users (should be 1)',          COUNT(*) FROM app_users
UNION ALL
SELECT 'user_profiles (should be 1)',      COUNT(*) FROM user_profiles
UNION ALL
SELECT 'stage_definitions (should be 2)', COUNT(*) FROM stage_definitions
ORDER BY tbl;

COMMIT;

-- =============================================================================
-- END OF SCRIPT
-- After running, the ERP starts completely fresh:
--   Login  : admin / Admin@123
--   Stages : Order Taken → Ready to Deliver
--   Data   : Zero orders, customers, employees, inventory, payments
-- =============================================================================
