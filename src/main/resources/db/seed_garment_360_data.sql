-- =============================================================================
-- SEED DATA SCRIPT: GARMENT 360 DOSSIER (GAR-2841-B Bridal Blouse)
-- Automatically inserts complete linked records for Customer, Order, Garment,
-- Body Measurements, Trials, Alterations, and Production Stages across companies.
-- =============================================================================

BEGIN;

-- 1. Insert Customer Ananya Krishnan (Company 1)
INSERT INTO customers (
    mobile_number, name, first_name, last_name, salutation, gender, email,
    location, street_address, city, state, pincode, tier, total_spend, balance,
    favorite_garment, measurements_on_file, preferred_channel, notes,
    company_id, branch, created_at, updated_at
) VALUES (
    '+91 98201 28410', 'Ananya Krishnan', 'Ananya', 'Krishnan', 'Ms.', 'Female', 'ananya.krishnan@heritageclient.in',
    'Hazratganj Promenade, Lucknow', '14/A Heritage Promenade', 'Lucknow', 'Uttar Pradesh', '226001', 'VIP', 45000.00, 6400.00,
    'Bridal Blouse', TRUE, 'WhatsApp', 'Customer previously requested +0.25" armhole ease on fitted blouses.',
    'c1000000-0000-0000-0000-000000000001', 'Hazratganj Flagship HQ', NOW(), NOW()
) ON CONFLICT (mobile_number) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    favorite_garment = EXCLUDED.favorite_garment,
    measurements_on_file = TRUE,
    notes = EXCLUDED.notes;

-- 2. Insert Order ORD-2841
INSERT INTO orders (
    id, order_code, garment_type, garment_desc, collection, amount, status,
    order_date, due_date, expected_delivery_date, advance_paid, total_amount, balance_amount,
    current_stage, customer_mobile, customer_name, company_id, branch, created_at, updated_at
) VALUES (
    'd2841000-0000-0000-0000-000000002841', 'ORD-2841', 'BRIDAL',
    'Handcrafted Bridal Blouse with deep square neckline, structured cuff, gold zari embroidery and cotton silk lining',
    'Heritage Bridal 2026', 18400.00, 'IN_PRODUCTION',
    '2026-10-03'::date, '2026-10-12'::date, '2026-10-12'::date, 12000.00, 18400.00, 6400.00,
    'STITCHING', '+91 98201 28410', 'Ananya Krishnan',
    'c1000000-0000-0000-0000-000000000001', 'Hazratganj Flagship HQ', NOW(), NOW()
) ON CONFLICT (order_code) DO UPDATE SET
    status = EXCLUDED.status,
    current_stage = EXCLUDED.current_stage,
    total_amount = EXCLUDED.total_amount,
    balance_amount = EXCLUDED.balance_amount;

-- 3. Insert Garment GAR-2841-B
INSERT INTO garments (
    id, garment_code, order_id, order_code, customer_name, customer_mobile,
    title, garment_type, specs, design_code, collection_name, production_stage,
    material_status, trial_status, trial_date, due_date, priority, payment_status,
    paid_amount, total_amount, status, assigned_to, designer, branch, image_url,
    notes, company_id, created_at, updated_at
) VALUES (
    'f2841000-0000-0000-0000-000000002841', 'GAR-2841-B',
    'd2841000-0000-0000-0000-000000002841', 'ORD-2841',
    'Ananya Krishnan', '+91 98201 28410',
    'Bridal Blouse', 'BRIDAL',
    'Deep square neckline 7.5", structured cuff, gold zari embroidery, cotton silk lining, reinforced side hooks',
    'Custom Silhouette', 'Heritage Bridal 2026', 'STITCHING',
    'READY', 'TRIAL_COMPLETED_ALTERATION_OPEN', '2026-10-10'::date, '2026-10-12'::date,
    'HIGH', 'PARTIAL', 12000.00, 18400.00, 'IN_PRODUCTION',
    'Ravi M', 'Meera S', 'Hazratganj Flagship HQ',
    '../../assets/garments/bridal_blouse_zardozi.jpg',
    'Customer previously requested +0.25" armhole ease on fitted blouses.',
    'c1000000-0000-0000-0000-000000000001', NOW(), NOW()
) ON CONFLICT (garment_code) DO UPDATE SET
    title = EXCLUDED.title,
    production_stage = EXCLUDED.production_stage,
    assigned_to = EXCLUDED.assigned_to,
    image_url = EXCLUDED.image_url,
    specs = EXCLUDED.specs,
    notes = EXCLUDED.notes,
    total_amount = EXCLUDED.total_amount;

-- 4. Insert Customer Body Measurements (Set V3)
DELETE FROM customer_body_measurements
WHERE customer_mobile = '+91 98201 28410' AND garment_type = 'BRIDAL';

INSERT INTO customer_body_measurements (
    id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    shoulder, bust, waist, armhole, sleeve_length, front_neck_depth, back_neck_depth,
    shape_notes, notes, recorded_by, company_id, recorded_at, updated_at
) VALUES (
    'e2841000-0000-0000-0000-000000002841',
    '+91 98201 28410', 'Ananya Krishnan', 'BRIDAL', 'CURRENT', TRUE, 3, 'in',
    14.25, 36.50, 30.00, 16.75, 11.00, 7.50, 10.00,
    'Deep square front neck, deep U back neck with dori tie',
    'Customer previously requested +0.25" armhole ease on fitted blouses.',
    'Meera S', 'c1000000-0000-0000-0000-000000000001', NOW(), NOW()
);

-- 5. Insert Trial TRL-2841
INSERT INTO trials (
    id, trial_code, order_id, order_code, customer_mobile, customer_name,
    garment_type, collection, trial_date, trial_time, stage, status,
    fit_status, designer_name, delivery_date, neck_style, sleeve_style,
    lining, embroidery, fabric, spec_notes, notes, trial_attempt,
    alteration_count, customer_feedback, customer_rating, fit_preference,
    completed_at, completed_by, next_trial_date, company_id, branch, created_at, updated_at
) VALUES (
    'b2841000-0000-0000-0000-000000002841', 'TRL-2841',
    'd2841000-0000-0000-0000-000000002841', 'ORD-2841',
    '+91 98201 28410', 'Ananya Krishnan',
    'BRIDAL', 'Heritage Bridal 2026', '2026-10-10'::date, '02:30 PM',
    'Trial 01', 'COMPLETED', 'ALTERATION_NEEDED',
    'Meera S', '2026-10-12'::date, 'Deep square · 7.5"', 'Elbow length · structured cuff',
    'Cotton silk', 'Zardozi neckline + sleeve border', 'Raw Silk',
    'Deep U back with tie closure, side hooks',
    'Trial 01 completed. Alteration directive issued.',
    1, 1, 'Waist: Good, Bust: Good, Armhole: Slightly tight, Sleeve: Short by 0.5"',
    5, 'Comfort / Fitted', NOW(), 'Meera S', '2026-10-11'::date,
    'c1000000-0000-0000-0000-000000000001', 'Hazratganj Flagship HQ', NOW(), NOW()
) ON CONFLICT (trial_code) DO UPDATE SET
    status = EXCLUDED.status,
    fit_status = EXCLUDED.fit_status,
    customer_feedback = EXCLUDED.customer_feedback;

-- 6. Insert Trial Alteration
DELETE FROM trial_alterations WHERE trial_id = 'b2841000-0000-0000-0000-000000002841';
INSERT INTO trial_alterations (
    id, trial_id, description, category, completed, assigned_tailor,
    priority, target_date, tailor_notes, status, company_id, created_at
) VALUES (
    'a2841000-0000-0000-0000-000000002841',
    'b2841000-0000-0000-0000-000000002841',
    '+0.25" Armhole Ease & +0.5" Sleeve Length',
    'Fit', FALSE, 'Ravi M', 'High', '2026-10-11'::date,
    'Releasing armhole seam and extending structured sleeve cuff by 0.5 inch',
    'PENDING', 'c1000000-0000-0000-0000-000000000001', NOW()
);

-- 7. Insert Production Stages for the Order
DELETE FROM production_stages WHERE order_id = 'd2841000-0000-0000-0000-000000002841';

INSERT INTO production_stages (id, order_id, stage_name, status, started_at, completed_at, notes, sort_order, company_id)
VALUES
('c2841000-0000-0000-0000-000000000001', 'd2841000-0000-0000-0000-000000002841', 'Pattern', 'COMPLETED', '2026-10-05 09:30:00'::timestamp, '2026-10-05 11:50:00'::timestamp, 'Pattern cut and approved by Meera S', 1, 'c1000000-0000-0000-0000-000000000001'),
('c2841000-0000-0000-0000-000000000002', 'd2841000-0000-0000-0000-000000002841', 'Cutting', 'COMPLETED', '2026-10-06 10:00:00'::timestamp, '2026-10-06 13:15:00'::timestamp, 'Silk and lining precision cutting by Suresh K', 2, 'c1000000-0000-0000-0000-000000000001'),
('c2841000-0000-0000-0000-000000000003', 'd2841000-0000-0000-0000-000000002841', 'Embroidery', 'COMPLETED', '2026-10-07 09:00:00'::timestamp, '2026-10-07 18:00:00'::timestamp, 'Zardozi threadwork verified and passed by Meena P', 3, 'c1000000-0000-0000-0000-000000000001'),
('c2841000-0000-0000-0000-000000000004', 'd2841000-0000-0000-0000-000000002841', 'Stitching', 'IN_PROGRESS', '2026-10-08 10:00:00'::timestamp, NULL, 'Sleeve final assembly assigned to Ravi M', 4, 'c1000000-0000-0000-0000-000000000001'),
('c2841000-0000-0000-0000-000000000005', 'd2841000-0000-0000-0000-000000002841', 'Finishing', 'NOT_STARTED', NULL, NULL, 'Hand-hemming and hook attachments', 5, 'c1000000-0000-0000-0000-000000000001'),
('c2841000-0000-0000-0000-000000000006', 'd2841000-0000-0000-0000-000000002841', 'Trial', 'COMPLETED', '2026-10-10 14:30:00'::timestamp, '2026-10-10 15:30:00'::timestamp, 'Trial 01 fit conducted with Ananya Krishnan', 6, 'c1000000-0000-0000-0000-000000000001'),
('c2841000-0000-0000-0000-000000000007', 'd2841000-0000-0000-0000-000000002841', 'QC', 'NOT_STARTED', NULL, NULL, 'Final atelier master quality inspection', 7, 'c1000000-0000-0000-0000-000000000001');

COMMIT;
