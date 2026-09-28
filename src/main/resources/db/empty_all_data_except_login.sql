-- =============================================================================
-- HAULO BOUTIQUE ERP — DATABASE DATA PURGE SCRIPT
-- Truncates all business, operational, and master data tables while preserving
-- all table schemas, columns, indexes, constraints, identity sequences,
-- Flyway migration history, the login user credentials in app_users,
-- and the undeletable mandatory system stages (ORDER_TAKEN & READY_TO_DELIVER).
-- =============================================================================

BEGIN;

-- 1. Truncate all transactional & master data tables with CASCADE and RESTART IDENTITY
TRUNCATE TABLE
    appointments,
    collection_activities,
    collections,
    customer_body_measurements,
    customer_measurements,
    customer_notes,
    customers,
    designs,
    employees,
    enquiries,
    garments,
    inventory_items,
    measurement_points,
    measurement_profiles,
    order_progress_stages,
    orders,
    payment_transactions,
    payments,
    production_stages,
    purchase_order_items,
    purchase_orders,
    qc_checklists,
    stage_definition_employees,
    stock_movements,
    suppliers,
    trial_alterations,
    trials
RESTART IDENTITY CASCADE;

-- 2. Preserve strictly the mandatory system boundary stages (ORDER_TAKEN & READY_TO_DELIVER)
DELETE FROM stage_definitions WHERE stage_key NOT IN ('ORDER_TAKEN', 'READY_TO_DELIVER');

INSERT INTO stage_definitions (
    id, stage_key, display_name, description, required_role, dept_label,
    color_class, sort_order, active, image_url, created_at, updated_at
) VALUES 
(
    '49d1deb1-0cd1-4fff-b54b-833df0783abf',
    'ORDER_TAKEN',
    'Order Taken',
    'Order intake, fabric requirements noted, advance paid and order committed to schedule.',
    'STAFF',
    'Order Intake & Reception',
    'stage-emerald',
    1,
    true,
    '/front end/assets/stages/Order_Taken_1010.jpg',
    NOW(), NOW()
),
(
    'c0000002-0000-0000-0000-000000000008',
    'READY_TO_DELIVER',
    'Ready to Deliver',
    'Quality approved, packaged with care and awaiting customer pickup or boutique handover.',
    'SUPERVISOR',
    'Delivery & Handover',
    'stage-silver',
    2,
    true,
    '/front end/assets/stages/Ready_8043.jpg',
    NOW(), NOW()
) ON CONFLICT (stage_key) DO UPDATE 
SET display_name = EXCLUDED.display_name,
    sort_order = EXCLUDED.sort_order,
    active = true,
    updated_at = NOW();

-- 3. Keep only the active admin login user in app_users
DELETE FROM app_users WHERE username != 'admin';

-- 4. Ensure the admin user exists and is active (admin / Admin@123)
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
