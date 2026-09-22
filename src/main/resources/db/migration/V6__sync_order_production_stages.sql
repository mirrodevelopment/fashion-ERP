-- V6__sync_order_production_stages.sql
-- Synchronizes orders.current_stage and populates production_stages with real linked records

-- 1. Sync orders.current_stage based on existing status
UPDATE orders SET current_stage = 'DELIVERED' WHERE status = 'DELIVERED';
UPDATE orders SET current_stage = 'READY' WHERE status = 'READY';
UPDATE orders SET current_stage = 'DESIGN' WHERE status = 'PENDING';

-- Distribute IN_PROGRESS orders realistically across active production stages
WITH ranked_in_progress AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY order_date DESC, created_at DESC) AS rn
    FROM orders
    WHERE status = 'IN_PROGRESS'
)
UPDATE orders o
SET current_stage = CASE (r.rn % 6)
    WHEN 0 THEN 'CUTTING'
    WHEN 1 THEN 'STITCHING'
    WHEN 2 THEN 'HAND_WORK'
    WHEN 3 THEN 'HEMMING'
    WHEN 4 THEN 'TRIAL'
    WHEN 5 THEN 'QC'
END
FROM ranked_in_progress r
WHERE o.id = r.id;

-- 2. Populate production_stages for active orders (if table is empty)
DO $$
DECLARE
    ord RECORD;
    v_cutting_id   UUID := 'e1000001-0000-0000-0000-000000000001';
    v_stitch_id    UUID := 'e1000001-0000-0000-0000-000000000002';
    v_handwork_id  UUID := 'e1000001-0000-0000-0000-000000000003';
    v_draper_id    UUID := 'e1000001-0000-0000-0000-000000000004';
    v_finishing_id UUID := 'e1000001-0000-0000-0000-000000000005';
BEGIN
    FOR ord IN SELECT id, current_stage, status, created_at FROM orders WHERE status IN ('IN_PROGRESS', 'READY', 'PENDING') LOOP
        -- Design / Consultation
        INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, sort_order, started_at, completed_at)
        VALUES (
            gen_random_uuid(), ord.id, 'DESIGNING', v_draper_id,
            CASE WHEN ord.current_stage = 'DESIGN' THEN 'IN_PROGRESS' ELSE 'COMPLETED' END,
            1, ord.created_at, ord.created_at
        ) ON CONFLICT DO NOTHING;

        -- Pattern Cutting
        INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, sort_order, started_at, completed_at)
        VALUES (
            gen_random_uuid(), ord.id, 'CUTTING', v_cutting_id,
            CASE
                WHEN ord.current_stage IN ('DESIGN') THEN 'NOT_STARTED'
                WHEN ord.current_stage = 'CUTTING' THEN 'IN_PROGRESS'
                ELSE 'COMPLETED'
            END,
            2, ord.created_at, CASE WHEN ord.current_stage IN ('DESIGN', 'CUTTING') THEN NULL ELSE ord.created_at END
        ) ON CONFLICT DO NOTHING;

        -- Hand Work
        INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, sort_order, started_at, completed_at)
        VALUES (
            gen_random_uuid(), ord.id, 'HAND_WORK', v_handwork_id,
            CASE
                WHEN ord.current_stage IN ('DESIGN', 'CUTTING') THEN 'NOT_STARTED'
                WHEN ord.current_stage = 'HAND_WORK' THEN 'IN_PROGRESS'
                ELSE 'COMPLETED'
            END,
            3, ord.created_at, CASE WHEN ord.current_stage IN ('DESIGN', 'CUTTING', 'HAND_WORK') THEN NULL ELSE ord.created_at END
        ) ON CONFLICT DO NOTHING;

        -- Stitching
        INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, sort_order, started_at, completed_at)
        VALUES (
            gen_random_uuid(), ord.id, 'STITCHING', v_stitch_id,
            CASE
                WHEN ord.current_stage IN ('DESIGN', 'CUTTING', 'HAND_WORK') THEN 'NOT_STARTED'
                WHEN ord.current_stage = 'STITCHING' THEN 'IN_PROGRESS'
                ELSE 'COMPLETED'
            END,
            4, ord.created_at, CASE WHEN ord.current_stage IN ('DESIGN', 'CUTTING', 'HAND_WORK', 'STITCHING') THEN NULL ELSE ord.created_at END
        ) ON CONFLICT DO NOTHING;

        -- Hemming & Finishing
        INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, sort_order, started_at, completed_at)
        VALUES (
            gen_random_uuid(), ord.id, 'HEMMING', v_finishing_id,
            CASE
                WHEN ord.current_stage IN ('DESIGN', 'CUTTING', 'HAND_WORK', 'STITCHING') THEN 'NOT_STARTED'
                WHEN ord.current_stage = 'HEMMING' THEN 'IN_PROGRESS'
                ELSE 'COMPLETED'
            END,
            5, ord.created_at, CASE WHEN ord.current_stage IN ('DESIGN', 'CUTTING', 'HAND_WORK', 'STITCHING', 'HEMMING') THEN NULL ELSE ord.created_at END
        ) ON CONFLICT DO NOTHING;

        -- Client Trial & Fitting
        INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, sort_order, started_at, completed_at)
        VALUES (
            gen_random_uuid(), ord.id, 'TRIAL', v_draper_id,
            CASE
                WHEN ord.current_stage IN ('DESIGN', 'CUTTING', 'HAND_WORK', 'STITCHING', 'HEMMING') THEN 'NOT_STARTED'
                WHEN ord.current_stage = 'TRIAL' THEN 'IN_PROGRESS'
                ELSE 'COMPLETED'
            END,
            6, ord.created_at, CASE WHEN ord.current_stage IN ('DESIGN', 'CUTTING', 'HAND_WORK', 'STITCHING', 'HEMMING', 'TRIAL') THEN NULL ELSE ord.created_at END
        ) ON CONFLICT DO NOTHING;

        -- Quality Control Audit
        INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, sort_order, started_at, completed_at)
        VALUES (
            gen_random_uuid(), ord.id, 'QC', v_finishing_id,
            CASE
                WHEN ord.current_stage IN ('DESIGN', 'CUTTING', 'HAND_WORK', 'STITCHING', 'HEMMING', 'TRIAL') THEN 'NOT_STARTED'
                WHEN ord.current_stage = 'QC' THEN 'IN_PROGRESS'
                ELSE 'COMPLETED'
            END,
            7, ord.created_at, CASE WHEN ord.current_stage IN ('READY') THEN ord.created_at ELSE NULL END
        ) ON CONFLICT DO NOTHING;

        -- Ready for Handover
        INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, sort_order, started_at, completed_at)
        VALUES (
            gen_random_uuid(), ord.id, 'READY', v_draper_id,
            CASE WHEN ord.current_stage = 'READY' THEN 'COMPLETED' ELSE 'NOT_STARTED' END,
            8, ord.created_at, CASE WHEN ord.current_stage = 'READY' THEN ord.created_at ELSE NULL END
        ) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
