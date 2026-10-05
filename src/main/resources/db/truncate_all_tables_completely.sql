-- =============================================================================
-- TRUNCATE ALL TABLES COMPLETELY (0 ROWS IN ALL TABLES)
-- Preserves: All 33 table definitions, columns, constraints, indexes, and
--            flyway_schema_history.
-- Result   : Exactly 0 rows in all 32 data/user/company tables.
-- =============================================================================

BEGIN;

TRUNCATE TABLE
    app_users,
    appointments,
    branches,
    collection_activities,
    collections,
    company_settings,
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
    stage_definitions,
    stock_movements,
    suppliers,
    trial_alterations,
    trials,
    user_profiles
RESTART IDENTITY CASCADE;

COMMIT;
