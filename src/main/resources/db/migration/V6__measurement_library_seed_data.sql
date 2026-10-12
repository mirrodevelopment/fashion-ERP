-- =============================================================================
-- V6: MEASUREMENT LIBRARY PRECISION PROFILES SEED DATA
-- Persists exact customer measurement profiles, versions, fit memories,
-- and garment associations matching the Haulo Boutique ERP Measurement Library.
-- =============================================================================

-- 1. Insert / Upsert 6 Boutique Customers
INSERT INTO customers (
    mobile_number, name, first_name, last_name, salutation, gender, email,
    location, street_address, city, state, pincode, tier, total_spend, balance,
    favorite_garment, measurements_on_file, preferred_channel, notes,
    company_id, branch, created_at, updated_at
) VALUES
(
    '+91 98201 28410', 'Ananya Krishnan', 'Ananya', 'Krishnan', 'Ms.', 'Female', 'ananya.krishnan@heritageclient.in',
    'Main Branch, Chennai', '14/A Khader Nawaz Khan Rd', 'Chennai', 'Tamil Nadu', '600006', 'VIP', 68000.00, 4200.00,
    'Bridal / Blouse', TRUE, 'WhatsApp', 'Prefers +0.25" armhole ease on fitted blouses. Avoids very tight waist finishing.',
    'c1000000-0000-0000-0000-000000000001', 'Main Branch', '2024-03-15 10:00:00'::timestamp, NOW()
),
(
    '+91 98401 22100', 'Meera Suresh', 'Meera', 'Suresh', 'Mrs.', 'Female', 'meera.suresh@client.in',
    'Main Branch, Chennai', '42 Poes Garden', 'Chennai', 'Tamil Nadu', '600086', 'VIP', 42000.00, 0.00,
    'Saree Blouse', TRUE, 'WhatsApp', 'Prefers high boat neckline with comfortable armhole ease.',
    'c1000000-0000-0000-0000-000000000001', 'Main Branch', '2025-01-10 11:30:00'::timestamp, NOW()
),
(
    '+91 98402 16300', 'Kavya R', 'Kavya', 'R', 'Ms.', 'Female', 'kavya.r@client.in',
    'Anna Nagar, Chennai', '88 2nd Avenue, Anna Nagar', 'Chennai', 'Tamil Nadu', '600040', 'REGULAR', 56000.00, 8500.00,
    'Reception Gown', TRUE, 'Call', 'Structured corset bodice with inner bone stays. Sleeve comfort prioritized.',
    'c1000000-0000-0000-0000-000000000001', 'Anna Nagar', '2024-08-20 14:15:00'::timestamp, NOW()
),
(
    '+91 98403 24000', 'Priyanka V', 'Priyanka', 'V', 'Mrs.', 'Female', 'priyanka.v@client.in',
    'Main Branch, Chennai', '15 Harrington Road, Chetpet', 'Chennai', 'Tamil Nadu', '600031', 'VIP', 89000.00, 12000.00,
    'Lehenga', TRUE, 'WhatsApp', 'High waist skirt flare 4.8m. Padded blouse with sweetheart neckline.',
    'c1000000-0000-0000-0000-000000000001', 'Main Branch', '2026-02-05 16:00:00'::timestamp, NOW()
),
(
    '+91 98404 13800', 'Nithya P', 'Nithya', 'P', 'Dr.', 'Female', 'nithya.p@client.in',
    'T Nagar, Chennai', '7 G.N. Chetty Road, T Nagar', 'Chennai', 'Tamil Nadu', '600017', 'VIP', 115000.00, 0.00,
    'Bridal Saree Blouse', TRUE, 'WhatsApp', 'Heavy maggam work neckline, elbow length sleeve with zero armhole pinching.',
    'c1000000-0000-0000-0000-000000000001', 'T Nagar', '2024-11-12 12:45:00'::timestamp, NOW()
),
(
    '+91 98405 20700', 'Revathi M', 'Revathi', 'M', 'Mrs.', 'Female', 'revathi.m@client.in',
    'Velachery, Chennai', '23 Vijaya Nagar Main Rd', 'Chennai', 'Tamil Nadu', '600042', 'REGULAR', 34000.00, 3000.00,
    'Lehenga', TRUE, 'WhatsApp', 'Comfortable waistband with drawstring tie, flared kalis.',
    'c1000000-0000-0000-0000-000000000001', 'Velachery', '2025-05-18 15:20:00'::timestamp, NOW()
)
ON CONFLICT (mobile_number) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    favorite_garment = EXCLUDED.favorite_garment,
    measurements_on_file = TRUE,
    notes = EXCLUDED.notes;

-- 2. Insert Customer Body Measurements (Precision Versions)
-- Ananya Krishnan: V1, V2, V3
DELETE FROM customer_body_measurements WHERE customer_mobile = '+91 98201 28410';

INSERT INTO customer_body_measurements (
    id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    bust, waist, hip, shoulder, armhole, sleeve_length, upper_arm, sleeve_round,
    blouse_length, front_neck_depth, back_neck_depth,
    shape_notes, notes, recorded_by, company_id, recorded_at, updated_at
) VALUES
-- V1 (24 Aug 2026)
(
    'e2841000-0000-0000-0000-000000000001',
    '+91 98201 28410', 'Ananya Krishnan', 'BRIDAL', 'OLD', FALSE, 1, 'in',
    36.50, 30.50, 39.00, 14.25, 16.50, 11.50, 12.50, 10.50,
    14.50, 7.50, 10.00,
    'Standard initial intake fitting', 'Waist was 30.5", initial trial pattern created.', 'Ravi M',
    'c1000000-0000-0000-0000-000000000001', '2026-08-24 11:00:00'::timestamp, '2026-08-24 11:00:00'::timestamp
),
-- V2 (28 Sep 2026)
(
    'e2841000-0000-0000-0000-000000000002',
    '+91 98201 28410', 'Ananya Krishnan', 'BRIDAL', 'OLD', FALSE, 2, 'in',
    36.50, 30.00, 39.00, 14.25, 16.50, 11.50, 12.50, 10.50,
    14.50, 7.50, 10.00,
    'Waist reduced by 0.5". Sleeve length adjusted.', 'Waist fitted to 30.0". Sleeve trial feedback noted.', 'Meera S',
    'c1000000-0000-0000-0000-000000000001', '2026-09-28 14:30:00'::timestamp, '2026-09-28 14:30:00'::timestamp
),
-- V3 (04 Oct 2026 - CURRENT VERIFIED)
(
    'e2841000-0000-0000-0000-000000002841',
    '+91 98201 28410', 'Ananya Krishnan', 'BRIDAL', 'CURRENT', TRUE, 3, 'in',
    36.50, 30.00, 39.00, 14.25, 16.75, 11.00, 12.50, 10.50,
    14.50, 7.50, 10.00,
    'Deep square front neck, deep U back neck with dori tie',
    'Armhole eased +0.25" to 16.75". Sleeve refined to 11.0". Verified fit score: 94%.',
    'Meera S', 'c1000000-0000-0000-0000-000000000001', '2026-10-04 15:45:00'::timestamp, '2026-10-04 15:45:00'::timestamp
);

-- Meera Suresh: V2 (10 Sep 2026 - Current)
DELETE FROM customer_body_measurements WHERE customer_mobile = '+91 98401 22100';
INSERT INTO customer_body_measurements (
    id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    bust, waist, hip, shoulder, armhole, sleeve_length, upper_arm, sleeve_round,
    blouse_length, front_neck_depth, back_neck_depth,
    shape_notes, notes, recorded_by, company_id, recorded_at, updated_at
) VALUES (
    'e2841000-0000-0000-0000-000000000012',
    '+91 98401 22100', 'Meera Suresh', 'BLOUSE', 'CURRENT', TRUE, 2, 'in',
    35.00, 29.00, 37.50, 14.00, 16.25, 10.50, 12.00, 10.00,
    14.00, 7.00, 9.50,
    'Boat neck with keyhole back', 'Fit confidence: 91%. First trial approved with clean finish.', 'Kavitha R',
    'c1000000-0000-0000-0000-000000000001', '2026-09-10 10:30:00'::timestamp, '2026-09-10 10:30:00'::timestamp
);

-- Kavya R: V4 (28 Sep 2026 - Current)
DELETE FROM customer_body_measurements WHERE customer_mobile = '+91 98402 16300';
INSERT INTO customer_body_measurements (
    id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    bust, waist, hip, shoulder, armhole, sleeve_length, upper_arm, sleeve_round,
    blouse_length, front_neck_depth, back_neck_depth,
    shape_notes, notes, recorded_by, company_id, recorded_at, updated_at
) VALUES (
    'e2841000-0000-0000-0000-000000000013',
    '+91 98402 16300', 'Kavya R', 'GOWN', 'CURRENT', TRUE, 4, 'in',
    34.50, 28.00, 38.00, 13.75, 16.00, 22.00, 11.50, 9.00,
    56.00, 8.00, 8.50,
    'Structured corset bodice with boning', 'Fit confidence: 89%. Sleeve ease confirmed.', 'Suresh K',
    'c1000000-0000-0000-0000-000000000001', '2026-09-28 16:00:00'::timestamp, '2026-09-28 16:00:00'::timestamp
);

-- Priyanka V: V1 (11 Oct 2026 - Current)
DELETE FROM customer_body_measurements WHERE customer_mobile = '+91 98403 24000';
INSERT INTO customer_body_measurements (
    id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    bust, waist, hip, shoulder, armhole, sleeve_length, upper_arm, sleeve_round,
    blouse_length, front_neck_depth, back_neck_depth,
    shape_notes, notes, recorded_by, company_id, recorded_at, updated_at
) VALUES (
    'e2841000-0000-0000-0000-000000000014',
    '+91 98403 24000', 'Priyanka V', 'LEHENGA', 'CURRENT', TRUE, 1, 'in',
    36.00, 31.00, 40.00, 14.50, 17.00, 12.00, 13.00, 11.00,
    15.00, 7.50, 9.00,
    'Sweetheart neckline with padded cups', 'Fit confidence: 86%. Fresh bridal lehenga intake.', 'Ravi M',
    'c1000000-0000-0000-0000-000000000001', '2026-10-11 11:15:00'::timestamp, '2026-10-11 11:15:00'::timestamp
);

-- Nithya P: V3 (07 Oct 2026 - Current)
DELETE FROM customer_body_measurements WHERE customer_mobile = '+91 98404 13800';
INSERT INTO customer_body_measurements (
    id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    bust, waist, hip, shoulder, armhole, sleeve_length, upper_arm, sleeve_round,
    blouse_length, front_neck_depth, back_neck_depth,
    shape_notes, notes, recorded_by, company_id, recorded_at, updated_at
) VALUES (
    'e2841000-0000-0000-0000-000000000015',
    '+91 98404 13800', 'Nithya P', 'BRIDAL', 'CURRENT', TRUE, 3, 'in',
    37.00, 31.50, 40.50, 14.75, 17.25, 11.50, 13.00, 11.00,
    14.50, 7.25, 10.50,
    'Bridal Saree Blouse with hand zardozi', 'Fit confidence: 93%. Verified across 2 bridal trials.', 'Meera S',
    'c1000000-0000-0000-0000-000000000001', '2026-10-07 13:20:00'::timestamp, '2026-10-07 13:20:00'::timestamp
);

-- Revathi M: V2 (02 Oct 2026 - Current)
DELETE FROM customer_body_measurements WHERE customer_mobile = '+91 98405 20700';
INSERT INTO customer_body_measurements (
    id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    bust, waist, hip, shoulder, armhole, sleeve_length, upper_arm, sleeve_round,
    blouse_length, front_neck_depth, back_neck_depth,
    shape_notes, notes, recorded_by, company_id, recorded_at, updated_at
) VALUES (
    'e2841000-0000-0000-0000-000000000016',
    '+91 98405 20700', 'Revathi M', 'LEHENGA', 'CURRENT', TRUE, 2, 'in',
    35.50, 29.50, 38.50, 14.00, 16.50, 11.00, 12.00, 10.50,
    14.25, 7.50, 9.50,
    'Festive silk lehenga choli', 'Fit confidence: 90%. Smooth fitting without alterations.', 'Kavitha R',
    'c1000000-0000-0000-0000-000000000001', '2026-10-02 17:00:00'::timestamp, '2026-10-02 17:00:00'::timestamp
);

-- 3. Also insert into measurement_profiles & measurement_points for full dual compatibility
INSERT INTO measurement_profiles (
    id, customer_mobile, garment_type, recorded_by, notes, branch, company_id, recorded_at, updated_at
) VALUES
(
    'a1000184-0000-0000-0000-000000000184',
    '+91 98201 28410', 'Bridal / Blouse', 'Meera S',
    'Fit Memory: Prefers +0.25" armhole ease on fitted blouses. Sleeve comfort improves with +0.5" bicep ease.',
    'Main Branch', 'c1000000-0000-0000-0000-000000000001', '2026-10-04 15:45:00'::timestamp, NOW()
),
(
    'a1000221-0000-0000-0000-000000000221',
    '+91 98401 22100', 'Saree Blouse', 'Kavitha R',
    'High boat neckline, comfortable sleeve movement.',
    'Main Branch', 'c1000000-0000-0000-0000-000000000001', '2026-09-10 10:30:00'::timestamp, NOW()
),
(
    'a1000163-0000-0000-0000-000000000163',
    '+91 98402 16300', 'Reception Gown', 'Suresh K',
    'Structured inner corsetry with boning.',
    'Anna Nagar', 'c1000000-0000-0000-0000-000000000001', '2026-09-28 16:00:00'::timestamp, NOW()
),
(
    'a1000240-0000-0000-0000-000000000240',
    '+91 98403 24000', 'Lehenga', 'Ravi M',
    'Padded sweetheart bodice, flared 4.8m skirt.',
    'Main Branch', 'c1000000-0000-0000-0000-000000000001', '2026-10-11 11:15:00'::timestamp, NOW()
),
(
    'a1000138-0000-0000-0000-000000000138',
    '+91 98404 13800', 'Bridal Saree Blouse', 'Meera S',
    'Heavy zardozi embroidery, zero armhole pinching.',
    'T Nagar', 'c1000000-0000-0000-0000-000000000001', '2026-10-07 13:20:00'::timestamp, NOW()
),
(
    'a1000207-0000-0000-0000-000000000207',
    '+91 98405 20700', 'Lehenga', 'Kavitha R',
    'Drawstring waistband with tassels, festive silk flare.',
    'Velachery', 'c1000000-0000-0000-0000-000000000001', '2026-10-02 17:00:00'::timestamp, NOW()
)
ON CONFLICT (id) DO UPDATE SET
    notes = EXCLUDED.notes,
    recorded_by = EXCLUDED.recorded_by,
    updated_at = NOW();

-- 4. Persist Points for Ananya Krishnan V3 Profile
DELETE FROM measurement_points WHERE profile_id = 'a1000184-0000-0000-0000-000000000184';
INSERT INTO measurement_points (id, profile_id, point_name, value, unit, marker_index, sort_order, company_id) VALUES
('b1000001-0000-0000-0000-000000000001', 'a1000184-0000-0000-0000-000000000184', 'Bust', 36.50, '"', 1, 1, 'c1000000-0000-0000-0000-000000000001'),
('b1000001-0000-0000-0000-000000000002', 'a1000184-0000-0000-0000-000000000184', 'Waist', 30.00, '"', 2, 2, 'c1000000-0000-0000-0000-000000000001'),
('b1000001-0000-0000-0000-000000000003', 'a1000184-0000-0000-0000-000000000184', 'Hip', 39.00, '"', 3, 3, 'c1000000-0000-0000-0000-000000000001'),
('b1000001-0000-0000-0000-000000000004', 'a1000184-0000-0000-0000-000000000184', 'Shoulder', 14.25, '"', 4, 4, 'c1000000-0000-0000-0000-000000000001'),
('b1000001-0000-0000-0000-000000000005', 'a1000184-0000-0000-0000-000000000184', 'Armhole', 16.75, '"', 5, 5, 'c1000000-0000-0000-0000-000000000001'),
('b1000001-0000-0000-0000-000000000006', 'a1000184-0000-0000-0000-000000000184', 'Sleeve Length', 11.00, '"', 6, 6, 'c1000000-0000-0000-0000-000000000001'),
('b1000001-0000-0000-0000-000000000007', 'a1000184-0000-0000-0000-000000000184', 'Bicep', 12.50, '"', 7, 7, 'c1000000-0000-0000-0000-000000000001'),
('b1000001-0000-0000-0000-000000000008', 'a1000184-0000-0000-0000-000000000184', 'Sleeve Opening', 10.50, '"', 8, 8, 'c1000000-0000-0000-0000-000000000001'),
('b1000001-0000-0000-0000-000000000009', 'a1000184-0000-0000-0000-000000000184', 'Blouse Length', 14.50, '"', 9, 9, 'c1000000-0000-0000-0000-000000000001'),
('b1000001-0000-0000-0000-000000000010', 'a1000184-0000-0000-0000-000000000184', 'Front Neck', 7.50, '"', 10, 10, 'c1000000-0000-0000-0000-000000000001'),
('b1000001-0000-0000-0000-000000000011', 'a1000184-0000-0000-0000-000000000184', 'Back Neck', 10.00, '"', 11, 11, 'c1000000-0000-0000-0000-000000000001');

-- 5. Insert Garment associations
INSERT INTO garments (
    id, garment_code, order_id, order_code, customer_name, customer_mobile,
    title, garment_type, specs, design_code, collection_name, production_stage,
    material_status, trial_status, trial_date, due_date, priority, payment_status,
    paid_amount, total_amount, status, assigned_to, designer, branch, image_url,
    notes, company_id, created_at, updated_at
) VALUES
(
    'f2814000-0000-0000-0000-000000002814', 'GAR-2814-B',
    'd2841000-0000-0000-0000-000000002841', 'ORD-2841',
    'Ananya Krishnan', '+91 98201 28410',
    'Bridal Blouse', 'BRIDAL',
    'Deep square neckline 7.5", structured cuff, gold zari embroidery, cotton silk lining',
    'RH-1023', 'Heritage Bridal 2026', 'STITCHING',
    'READY', 'TRIAL_COMPLETED_ALTERATION_OPEN', '2026-10-10'::date, '2026-10-14'::date,
    'HIGH', 'PARTIAL', 14000.00, 18500.00, 'IN_PRODUCTION',
    'Ravi M', 'Meera S', 'Main Branch', '../../assets/garments/bridal_blouse_zardozi.jpg',
    'Used V3 · Minor armhole adjustment (+0.25")',
    'c1000000-0000-0000-0000-000000000001', NOW(), NOW()
),
(
    'f2804000-0000-0000-0000-000000002804', 'GAR-2804-A',
    'd2841000-0000-0000-0000-000000002841', 'ORD-2841',
    'Ananya Krishnan', '+91 98201 28410',
    'Reception Blouse', 'BRIDAL',
    'Soft silk reception blouse with back tie and delicate hand-embroidery',
    'RH-1019', 'Heritage Bridal 2026', 'READY',
    'READY', 'FIRST_TRIAL_APPROVED', '2026-09-28'::date, '2026-10-02'::date,
    'NORMAL', 'PAID', 16000.00, 16000.00, 'COMPLETED',
    'Kavitha R', 'Meera S', 'Main Branch', '../../assets/garments/blouse_back_cut.jpg',
    'Used V2 · First trial approved without changes',
    'c1000000-0000-0000-0000-000000000001', NOW(), NOW()
),
(
    'f2786000-0000-0000-0000-000000002786', 'GAR-2786-C',
    'd2841000-0000-0000-0000-000000002841', 'ORD-2841',
    'Ananya Krishnan', '+91 98201 28410',
    'Festive Kurti', 'FESTIVE',
    'A-line festive raw silk kurti with side slits and organza dupatta',
    'RH-1008', 'Festive Edit 2026', 'DELIVERED',
    'READY', 'NO_ALTERATIONS', '2026-08-25'::date, '2026-08-30'::date,
    'NORMAL', 'PAID', 12500.00, 12500.00, 'DELIVERED',
    'Suresh K', 'Meera S', 'Main Branch', '../../assets/garments/heritage_lehenga_pink.jpg',
    'Used V3 · No alterations required',
    'c1000000-0000-0000-0000-000000000001', NOW(), NOW()
)
ON CONFLICT (garment_code) DO UPDATE SET
    title = EXCLUDED.title,
    production_stage = EXCLUDED.production_stage,
    notes = EXCLUDED.notes,
    image_url = EXCLUDED.image_url;
