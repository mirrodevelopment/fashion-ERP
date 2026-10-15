-- V7__update_production_stages_branch_counts.sql
-- Updates existing production stages for all branches to have distinct counts of 5, 6, 9 across branches

-- ============================================================================
-- 0. CLEAN UP IRREGULAR BRANCH LABELS
-- ============================================================================
UPDATE orders SET branch = 'HQ-LKO' WHERE branch = 'Hazratganj Flagship HQ' AND company_id = 'c1000000-0000-0000-0000-000000000001';
UPDATE garments SET branch = 'HQ-LKO' WHERE (branch = 'Hazratganj Flagship HQ' OR branch = 'Main Branch') AND company_id = 'c1000000-0000-0000-0000-000000000001';

-- ============================================================================
-- 1. COMPANY 1: Riwayat Haute Couture (c1000000-0000-0000-0000-000000000001)
--    Branch 1 (HQ-LKO)  -> 5 active garments in ORDER_TAKEN
--    Branch 2 (BR-AGRA) -> 6 active garments in PATTERN_MAKING
--    Branch 3 (BR-KNPR) -> 9 active garments in EMBROIDERY
-- ============================================================================
UPDATE production_stages 
SET status = 'COMPLETED' 
WHERE company_id = 'c1000000-0000-0000-0000-000000000001';

UPDATE orders 
SET status = 'DELIVERED', current_stage = 'READY_TO_DELIVER'
WHERE company_id = 'c1000000-0000-0000-0000-000000000001';

UPDATE garments 
SET status = 'DELIVERED', production_stage = 'READY_TO_DELIVER'
WHERE company_id = 'c1000000-0000-0000-0000-000000000001';

-- HQ-LKO (5 active orders in ORDER_TAKEN)
WITH hq_active AS (
    SELECT id, order_code FROM orders 
    WHERE company_id = 'c1000000-0000-0000-0000-000000000001' AND branch = 'HQ-LKO'
    ORDER BY order_code ASC
    LIMIT 5
)
UPDATE orders SET status = 'IN_PRODUCTION', current_stage = 'ORDER_TAKEN'
FROM hq_active WHERE orders.id = hq_active.id;

WITH hq_active AS (
    SELECT id, order_code FROM orders 
    WHERE company_id = 'c1000000-0000-0000-0000-000000000001' AND branch = 'HQ-LKO'
    ORDER BY order_code ASC
    LIMIT 5
)
UPDATE garments SET status = 'IN_PRODUCTION', production_stage = 'ORDER_TAKEN', branch = 'HQ-LKO'
FROM hq_active WHERE garments.order_id = hq_active.id;

WITH hq_active AS (
    SELECT id, order_code FROM orders 
    WHERE company_id = 'c1000000-0000-0000-0000-000000000001' AND branch = 'HQ-LKO'
    ORDER BY order_code ASC
    LIMIT 5
),
ranked_stages AS (
    SELECT ps.id, ROW_NUMBER() OVER (PARTITION BY ps.order_id ORDER BY ps.sort_order DESC) as rn
    FROM production_stages ps
    JOIN hq_active h ON ps.order_id = h.id
)
UPDATE production_stages SET status = 'IN_PROGRESS', stage_name = 'ORDER_TAKEN'
FROM ranked_stages WHERE production_stages.id = ranked_stages.id AND ranked_stages.rn = 1;

-- BR-AGRA (6 active orders in PATTERN_MAKING)
WITH agra_active AS (
    SELECT id, order_code FROM orders 
    WHERE company_id = 'c1000000-0000-0000-0000-000000000001' AND branch = 'BR-AGRA'
    ORDER BY order_code ASC
    LIMIT 6
)
UPDATE orders SET status = 'IN_PRODUCTION', current_stage = 'PATTERN_MAKING'
FROM agra_active WHERE orders.id = agra_active.id;

WITH agra_active AS (
    SELECT id, order_code FROM orders 
    WHERE company_id = 'c1000000-0000-0000-0000-000000000001' AND branch = 'BR-AGRA'
    ORDER BY order_code ASC
    LIMIT 6
)
UPDATE garments SET status = 'IN_PRODUCTION', production_stage = 'PATTERN_MAKING', branch = 'BR-AGRA'
FROM agra_active WHERE garments.order_id = agra_active.id;

WITH agra_active AS (
    SELECT id, order_code FROM orders 
    WHERE company_id = 'c1000000-0000-0000-0000-000000000001' AND branch = 'BR-AGRA'
    ORDER BY order_code ASC
    LIMIT 6
),
ranked_stages AS (
    SELECT ps.id, ROW_NUMBER() OVER (PARTITION BY ps.order_id ORDER BY ps.sort_order DESC) as rn
    FROM production_stages ps
    JOIN agra_active a ON ps.order_id = a.id
)
UPDATE production_stages SET status = 'IN_PROGRESS', stage_name = 'PATTERN_MAKING'
FROM ranked_stages WHERE production_stages.id = ranked_stages.id AND ranked_stages.rn = 1;

-- BR-KNPR (9 active orders in EMBROIDERY)
WITH knpr_active AS (
    SELECT id, order_code FROM orders 
    WHERE company_id = 'c1000000-0000-0000-0000-000000000001' AND branch = 'BR-KNPR'
    ORDER BY order_code ASC
    LIMIT 9
)
UPDATE orders SET status = 'IN_PRODUCTION', current_stage = 'EMBROIDERY'
FROM knpr_active WHERE orders.id = knpr_active.id;

WITH knpr_active AS (
    SELECT id, order_code FROM orders 
    WHERE company_id = 'c1000000-0000-0000-0000-000000000001' AND branch = 'BR-KNPR'
    ORDER BY order_code ASC
    LIMIT 9
)
UPDATE garments SET status = 'IN_PRODUCTION', production_stage = 'EMBROIDERY', branch = 'BR-KNPR'
FROM knpr_active WHERE garments.order_id = knpr_active.id;

WITH knpr_active AS (
    SELECT id, order_code FROM orders 
    WHERE company_id = 'c1000000-0000-0000-0000-000000000001' AND branch = 'BR-KNPR'
    ORDER BY order_code ASC
    LIMIT 9
),
ranked_stages AS (
    SELECT ps.id, ROW_NUMBER() OVER (PARTITION BY ps.order_id ORDER BY ps.sort_order DESC) as rn
    FROM production_stages ps
    JOIN knpr_active k ON ps.order_id = k.id
)
UPDATE production_stages SET status = 'IN_PROGRESS', stage_name = 'EMBROIDERY'
FROM ranked_stages WHERE production_stages.id = ranked_stages.id AND ranked_stages.rn = 1;


-- ============================================================================
-- 2. COMPANY 2: Zari Loom Atelier (c2000000-0000-0000-0000-000000000002)
--    Branch 1 (HQ-DEL) -> 5 active garments in ORDER_TAKEN
--    Branch 2 (BR-BOM) -> 6 active garments in MEASURING
--    Branch 3 (BR-VNS) -> 9 active garments in LOOM_SETUP
--    Branch 4 (BR-JPR) -> 6 active garments in CUTTING
-- ============================================================================
UPDATE production_stages 
SET status = 'COMPLETED' 
WHERE company_id = 'c2000000-0000-0000-0000-000000000002';

UPDATE orders 
SET status = 'DELIVERED', current_stage = 'READY_TO_DELIVER'
WHERE company_id = 'c2000000-0000-0000-0000-000000000002';

UPDATE garments 
SET status = 'DELIVERED', production_stage = 'READY_TO_DELIVER'
WHERE company_id = 'c2000000-0000-0000-0000-000000000002';

-- HQ-DEL (5 in ORDER_TAKEN)
WITH del_active AS (
    SELECT id FROM orders WHERE company_id = 'c2000000-0000-0000-0000-000000000002' AND branch = 'HQ-DEL' ORDER BY order_code ASC LIMIT 5
)
UPDATE orders SET status = 'IN_PRODUCTION', current_stage = 'ORDER_TAKEN' FROM del_active WHERE orders.id = del_active.id;

WITH del_active AS (
    SELECT id FROM orders WHERE company_id = 'c2000000-0000-0000-0000-000000000002' AND branch = 'HQ-DEL' ORDER BY order_code ASC LIMIT 5
)
UPDATE garments SET status = 'IN_PRODUCTION', production_stage = 'ORDER_TAKEN', branch = 'HQ-DEL' FROM del_active WHERE garments.order_id = del_active.id;

WITH del_active AS (
    SELECT id FROM orders WHERE company_id = 'c2000000-0000-0000-0000-000000000002' AND branch = 'HQ-DEL' ORDER BY order_code ASC LIMIT 5
),
ranked AS (
    SELECT ps.id, ROW_NUMBER() OVER (PARTITION BY ps.order_id ORDER BY ps.sort_order DESC) as rn
    FROM production_stages ps JOIN del_active d ON ps.order_id = d.id
)
UPDATE production_stages SET status = 'IN_PROGRESS', stage_name = 'ORDER_TAKEN' FROM ranked WHERE production_stages.id = ranked.id AND ranked.rn = 1;

-- BR-BOM (6 in MEASURING)
WITH bom_active AS (
    SELECT id FROM orders WHERE company_id = 'c2000000-0000-0000-0000-000000000002' AND branch = 'BR-BOM' ORDER BY order_code ASC LIMIT 6
)
UPDATE orders SET status = 'IN_PRODUCTION', current_stage = 'MEASURING' FROM bom_active WHERE orders.id = bom_active.id;

WITH bom_active AS (
    SELECT id FROM orders WHERE company_id = 'c2000000-0000-0000-0000-000000000002' AND branch = 'BR-BOM' ORDER BY order_code ASC LIMIT 6
)
UPDATE garments SET status = 'IN_PRODUCTION', production_stage = 'MEASURING', branch = 'BR-BOM' FROM bom_active WHERE garments.order_id = bom_active.id;

WITH bom_active AS (
    SELECT id FROM orders WHERE company_id = 'c2000000-0000-0000-0000-000000000002' AND branch = 'BR-BOM' ORDER BY order_code ASC LIMIT 6
),
ranked AS (
    SELECT ps.id, ROW_NUMBER() OVER (PARTITION BY ps.order_id ORDER BY ps.sort_order DESC) as rn
    FROM production_stages ps JOIN bom_active b ON ps.order_id = b.id
)
UPDATE production_stages SET status = 'IN_PROGRESS', stage_name = 'MEASURING' FROM ranked WHERE production_stages.id = ranked.id AND ranked.rn = 1;

-- BR-VNS (9 in LOOM_SETUP)
WITH vns_active AS (
    SELECT id FROM orders WHERE company_id = 'c2000000-0000-0000-0000-000000000002' AND branch = 'BR-VNS' ORDER BY order_code ASC LIMIT 9
)
UPDATE orders SET status = 'IN_PRODUCTION', current_stage = 'LOOM_SETUP' FROM vns_active WHERE orders.id = vns_active.id;

WITH vns_active AS (
    SELECT id FROM orders WHERE company_id = 'c2000000-0000-0000-0000-000000000002' AND branch = 'BR-VNS' ORDER BY order_code ASC LIMIT 9
)
UPDATE garments SET status = 'IN_PRODUCTION', production_stage = 'LOOM_SETUP', branch = 'BR-VNS' FROM vns_active WHERE garments.order_id = vns_active.id;

WITH vns_active AS (
    SELECT id FROM orders WHERE company_id = 'c2000000-0000-0000-0000-000000000002' AND branch = 'BR-VNS' ORDER BY order_code ASC LIMIT 9
),
ranked AS (
    SELECT ps.id, ROW_NUMBER() OVER (PARTITION BY ps.order_id ORDER BY ps.sort_order DESC) as rn
    FROM production_stages ps JOIN vns_active v ON ps.order_id = v.id
)
UPDATE production_stages SET status = 'IN_PROGRESS', stage_name = 'LOOM_SETUP' FROM ranked WHERE production_stages.id = ranked.id AND ranked.rn = 1;

-- BR-JPR (6 in CUTTING)
WITH jpr_active AS (
    SELECT id FROM orders WHERE company_id = 'c2000000-0000-0000-0000-000000000002' AND branch = 'BR-JPR' ORDER BY order_code ASC LIMIT 6
)
UPDATE orders SET status = 'IN_PRODUCTION', current_stage = 'CUTTING' FROM jpr_active WHERE orders.id = jpr_active.id;

WITH jpr_active AS (
    SELECT id FROM orders WHERE company_id = 'c2000000-0000-0000-0000-000000000002' AND branch = 'BR-JPR' ORDER BY order_code ASC LIMIT 6
)
UPDATE garments SET status = 'IN_PRODUCTION', production_stage = 'CUTTING', branch = 'BR-JPR' FROM jpr_active WHERE garments.order_id = jpr_active.id;

WITH jpr_active AS (
    SELECT id FROM orders WHERE company_id = 'c2000000-0000-0000-0000-000000000002' AND branch = 'BR-JPR' ORDER BY order_code ASC LIMIT 6
),
ranked AS (
    SELECT ps.id, ROW_NUMBER() OVER (PARTITION BY ps.order_id ORDER BY ps.sort_order DESC) as rn
    FROM production_stages ps JOIN jpr_active j ON ps.order_id = j.id
)
UPDATE production_stages SET status = 'IN_PROGRESS', stage_name = 'CUTTING' FROM ranked WHERE production_stages.id = ranked.id AND ranked.rn = 1;


-- ============================================================================
-- 3. COMPANY 3: Aura Bespoke Innovation (c3000000-0000-0000-0000-000000000003)
--    Branch 1 (HQ-BLR) -> 5 active garments in ORDER_TAKEN
--    Branch 2 (BR-HYD) -> 6 active garments in MEASURING
--    Branch 3 (BR-MAA) -> 9 active garments in CAD_PATTERN
--    Branch 4 (BR-PUN) -> 5 active garments in CORSET_BONING
-- ============================================================================
UPDATE production_stages 
SET status = 'COMPLETED' 
WHERE company_id = 'c3000000-0000-0000-0000-000000000003';

UPDATE orders 
SET status = 'DELIVERED', current_stage = 'READY_TO_DELIVER'
WHERE company_id = 'c3000000-0000-0000-0000-000000000003';

UPDATE garments 
SET status = 'DELIVERED', production_stage = 'READY_TO_DELIVER'
WHERE company_id = 'c3000000-0000-0000-0000-000000000003';

-- HQ-BLR (5 in ORDER_TAKEN)
WITH blr_active AS (
    SELECT id FROM orders WHERE company_id = 'c3000000-0000-0000-0000-000000000003' AND branch = 'HQ-BLR' ORDER BY order_code ASC LIMIT 5
)
UPDATE orders SET status = 'IN_PRODUCTION', current_stage = 'ORDER_TAKEN' FROM blr_active WHERE orders.id = blr_active.id;

WITH blr_active AS (
    SELECT id FROM orders WHERE company_id = 'c3000000-0000-0000-0000-000000000003' AND branch = 'HQ-BLR' ORDER BY order_code ASC LIMIT 5
)
UPDATE garments SET status = 'IN_PRODUCTION', production_stage = 'ORDER_TAKEN', branch = 'HQ-BLR' FROM blr_active WHERE garments.order_id = blr_active.id;

WITH blr_active AS (
    SELECT id FROM orders WHERE company_id = 'c3000000-0000-0000-0000-000000000003' AND branch = 'HQ-BLR' ORDER BY order_code ASC LIMIT 5
),
ranked AS (
    SELECT ps.id, ROW_NUMBER() OVER (PARTITION BY ps.order_id ORDER BY ps.sort_order DESC) as rn
    FROM production_stages ps JOIN blr_active b ON ps.order_id = b.id
)
UPDATE production_stages SET status = 'IN_PROGRESS', stage_name = 'ORDER_TAKEN' FROM ranked WHERE production_stages.id = ranked.id AND ranked.rn = 1;

-- BR-HYD (6 in MEASURING)
WITH hyd_active AS (
    SELECT id FROM orders WHERE company_id = 'c3000000-0000-0000-0000-000000000003' AND branch = 'BR-HYD' ORDER BY order_code ASC LIMIT 6
)
UPDATE orders SET status = 'IN_PRODUCTION', current_stage = 'MEASURING' FROM hyd_active WHERE orders.id = hyd_active.id;

WITH hyd_active AS (
    SELECT id FROM orders WHERE company_id = 'c3000000-0000-0000-0000-000000000003' AND branch = 'BR-HYD' ORDER BY order_code ASC LIMIT 6
)
UPDATE garments SET status = 'IN_PRODUCTION', production_stage = 'MEASURING', branch = 'BR-HYD' FROM hyd_active WHERE garments.order_id = hyd_active.id;

WITH hyd_active AS (
    SELECT id FROM orders WHERE company_id = 'c3000000-0000-0000-0000-000000000003' AND branch = 'BR-HYD' ORDER BY order_code ASC LIMIT 6
),
ranked AS (
    SELECT ps.id, ROW_NUMBER() OVER (PARTITION BY ps.order_id ORDER BY ps.sort_order DESC) as rn
    FROM production_stages ps JOIN hyd_active h ON ps.order_id = h.id
)
UPDATE production_stages SET status = 'IN_PROGRESS', stage_name = 'MEASURING' FROM ranked WHERE production_stages.id = ranked.id AND ranked.rn = 1;

-- BR-MAA (9 in CAD_PATTERN)
WITH maa_active AS (
    SELECT id FROM orders WHERE company_id = 'c3000000-0000-0000-0000-000000000003' AND branch = 'BR-MAA' ORDER BY order_code ASC LIMIT 9
)
UPDATE orders SET status = 'IN_PRODUCTION', current_stage = 'CAD_PATTERN' FROM maa_active WHERE orders.id = maa_active.id;

WITH maa_active AS (
    SELECT id FROM orders WHERE company_id = 'c3000000-0000-0000-0000-000000000003' AND branch = 'BR-MAA' ORDER BY order_code ASC LIMIT 9
)
UPDATE garments SET status = 'IN_PRODUCTION', production_stage = 'CAD_PATTERN', branch = 'BR-MAA' FROM maa_active WHERE garments.order_id = maa_active.id;

WITH maa_active AS (
    SELECT id FROM orders WHERE company_id = 'c3000000-0000-0000-0000-000000000003' AND branch = 'BR-MAA' ORDER BY order_code ASC LIMIT 9
),
ranked AS (
    SELECT ps.id, ROW_NUMBER() OVER (PARTITION BY ps.order_id ORDER BY ps.sort_order DESC) as rn
    FROM production_stages ps JOIN maa_active m ON ps.order_id = m.id
)
UPDATE production_stages SET status = 'IN_PROGRESS', stage_name = 'CAD_PATTERN' FROM ranked WHERE production_stages.id = ranked.id AND ranked.rn = 1;

-- BR-PUN (5 in CORSET_BONING)
WITH pun_active AS (
    SELECT id FROM orders WHERE company_id = 'c3000000-0000-0000-0000-000000000003' AND branch = 'BR-PUN' ORDER BY order_code ASC LIMIT 5
)
UPDATE orders SET status = 'IN_PRODUCTION', current_stage = 'CORSET_BONING' FROM pun_active WHERE orders.id = pun_active.id;

WITH pun_active AS (
    SELECT id FROM orders WHERE company_id = 'c3000000-0000-0000-0000-000000000003' AND branch = 'BR-PUN' ORDER BY order_code ASC LIMIT 5
)
UPDATE garments SET status = 'IN_PRODUCTION', production_stage = 'CORSET_BONING', branch = 'BR-PUN' FROM pun_active WHERE garments.order_id = pun_active.id;

WITH pun_active AS (
    SELECT id FROM orders WHERE company_id = 'c3000000-0000-0000-0000-000000000003' AND branch = 'BR-PUN' ORDER BY order_code ASC LIMIT 5
),
ranked AS (
    SELECT ps.id, ROW_NUMBER() OVER (PARTITION BY ps.order_id ORDER BY ps.sort_order DESC) as rn
    FROM production_stages ps JOIN pun_active p ON ps.order_id = p.id
)
UPDATE production_stages SET status = 'IN_PROGRESS', stage_name = 'CORSET_BONING' FROM ranked WHERE production_stages.id = ranked.id AND ranked.rn = 1;
