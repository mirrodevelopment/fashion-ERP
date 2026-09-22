-- V12__workflow_order_taken_and_ready_to_deliver.sql
-- Establishes Order Taken as Stage 1 and QC followed by Ready to Deliver as the final stages

-- 1. Update sort orders of existing stages to make room for ORDER_TAKEN at sort_order 1
UPDATE stage_definitions SET sort_order = 2 WHERE stage_key = 'DESIGNING';
UPDATE stage_definitions SET sort_order = 3 WHERE stage_key = 'LINING';
UPDATE stage_definitions SET sort_order = 4 WHERE stage_key = 'CUTTING';
UPDATE stage_definitions SET sort_order = 5 WHERE stage_key = 'HAND_WORK';
UPDATE stage_definitions SET sort_order = 6 WHERE stage_key = 'STITCHING';
UPDATE stage_definitions SET sort_order = 7 WHERE stage_key = 'TRIAL';
UPDATE stage_definitions SET sort_order = 8 WHERE stage_key = 'QC';

-- 2. Insert or update ORDER_TAKEN as Stage 1
INSERT INTO stage_definitions (
    id, stage_key, display_name, description, required_role, dept_label, color_class, sort_order, active, image_url, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'ORDER_TAKEN',
    'Order Taken',
    'Initial intake, measurements consultation, and booking confirmation',
    'STYLIST',
    'Order Intake & Reception',
    'dot-emerald',
    1,
    true,
    '/front end/assets/stages/Order_Taken_1010.jpg',
    NOW(),
    NOW()
)
ON CONFLICT (stage_key) DO UPDATE SET
    display_name = 'Order Taken',
    dept_label = 'Order Intake & Reception',
    color_class = 'dot-emerald',
    sort_order = 1,
    image_url = '/front end/assets/stages/Order_Taken_1010.jpg',
    active = true,
    updated_at = NOW();

-- 3. Update READY to READY_TO_DELIVER at sort_order 9
UPDATE stage_definitions SET
    stage_key = 'READY_TO_DELIVER',
    display_name = 'Ready to Deliver',
    dept_label = 'Delivery & Handover',
    required_role = 'DISPATCHER',
    sort_order = 9,
    color_class = 'dot-silver',
    image_url = '/front end/assets/stages/Ready_8043.jpg',
    updated_at = NOW()
WHERE stage_key = 'READY' OR stage_key = 'READY_TO_DELIVER';

-- 4. Sync existing orders and production_stages
UPDATE orders SET current_stage = 'READY_TO_DELIVER' WHERE current_stage = 'READY';
UPDATE orders SET current_stage = 'ORDER_TAKEN' WHERE current_stage = 'ORDER';

UPDATE production_stages SET stage_name = 'READY_TO_DELIVER', sort_order = 9 WHERE stage_name = 'READY';
UPDATE production_stages SET sort_order = 2 WHERE stage_name = 'DESIGNING';
UPDATE production_stages SET sort_order = 3 WHERE stage_name = 'LINING';
UPDATE production_stages SET sort_order = 4 WHERE stage_name = 'CUTTING';
UPDATE production_stages SET sort_order = 5 WHERE stage_name = 'HAND_WORK';
UPDATE production_stages SET sort_order = 6 WHERE stage_name = 'STITCHING';
UPDATE production_stages SET sort_order = 7 WHERE stage_name = 'TRIAL';
UPDATE production_stages SET sort_order = 8 WHERE stage_name = 'QC';

-- 5. Insert ORDER_TAKEN stage in production_stages for existing orders
INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, sort_order, started_at, completed_at)
SELECT gen_random_uuid(), o.id, 'ORDER_TAKEN', NULL, 'COMPLETED', 1, o.created_at, o.created_at
FROM orders o
WHERE NOT EXISTS (
    SELECT 1 FROM production_stages ps WHERE ps.order_id = o.id AND ps.stage_name = 'ORDER_TAKEN'
);
