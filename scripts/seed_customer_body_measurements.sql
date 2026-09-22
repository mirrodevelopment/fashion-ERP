-- ============================================================================
-- SEED CUSTOMER BODY MEASUREMENTS (Haulo Boutique Tailoring System)
-- ============================================================================

DELETE FROM customer_body_measurements;

-- Bhuvaneshwari Chandrasekar (+91 98411 12345)
-- 1. BLOUSE (Current v2)
INSERT INTO customer_body_measurements (
    customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    shoulder, bust, under_bust, waist, hip, blouse_length, armhole, upper_arm, sleeve_length, sleeve_round,
    elbow_round, wrist_round, front_neck_depth, back_neck_depth, bust_point, bust_point_to_bust_point,
    shoulder_to_bust, shoulder_to_waist, front_width, back_width, notes, recorded_by, recorded_at, updated_at
) VALUES (
    '+91 98411 12345', 'Bhuvaneshwari Chandrasekar', 'BLOUSE', 'CURRENT', true, 2, 'in',
    14.75, 36.50, 31.00, 30.50, 39.50, 14.50, 16.50, 12.00, 11.00, 11.50,
    10.50, 6.50, 7.00, 8.50, 10.00, 7.50,
    10.00, 14.50, 14.00, 14.50, 'Updated fitting for temple festive blouse. Added ease at waist.', 'Master Tailor Karthik',
    '2026-08-15 11:30:00', '2026-09-08 14:20:00'
);

-- BLOUSE (Old v1 for comparison)
INSERT INTO customer_body_measurements (
    customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    shoulder, bust, under_bust, waist, hip, blouse_length, armhole, upper_arm, sleeve_length, sleeve_round,
    elbow_round, wrist_round, front_neck_depth, back_neck_depth, bust_point, bust_point_to_bust_point,
    shoulder_to_bust, shoulder_to_waist, front_width, back_width, notes, recorded_by, recorded_at, updated_at
) VALUES (
    '+91 98411 12345', 'Bhuvaneshwari Chandrasekar', 'BLOUSE', 'OLD', false, 1, 'in',
    14.50, 36.00, 30.50, 29.50, 39.00, 14.00, 16.00, 11.75, 10.50, 11.00,
    10.00, 6.50, 6.50, 8.00, 9.50, 7.50,
    9.50, 14.00, 13.50, 14.00, 'Initial bespoke fitting session.', 'Senior Tailor Murugan',
    '2026-05-10 10:00:00', '2026-05-10 10:00:00'
);

-- 2. CHUDI / KURTI (Current v1)
INSERT INTO customer_body_measurements (
    customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    shoulder, bust, under_bust, waist, hip, top_length, armhole, upper_arm, sleeve_length, sleeve_round,
    elbow_round, wrist_round, front_neck_depth, back_neck_depth, front_width, back_width,
    pant_waist, pant_hip, pant_length, thigh_round, knee_round, calf_round, ankle_round, crotch_length, bottom_opening,
    notes, recorded_by, recorded_at, updated_at
) VALUES (
    '+91 98411 12345', 'Bhuvaneshwari Chandrasekar', 'CHUDI', 'CURRENT', true, 1, 'in',
    14.75, 37.00, 31.00, 31.00, 40.00, 42.00, 16.50, 12.00, 17.50, 11.00,
    10.00, 6.50, 7.00, 7.00, 14.00, 14.50,
    32.00, 41.00, 39.50, 23.00, 15.50, 13.50, 10.50, 26.50, 12.00,
    'Festive Kurti set fitting. A-line silhouette with side slits.', 'Master Tailor Karthik',
    '2026-06-20 14:00:00', '2026-08-14 16:45:00'
);

-- 3. LEHENGA (Current v1)
INSERT INTO customer_body_measurements (
    customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    shoulder, bust, under_bust, waist, hip, blouse_length, armhole, skirt_length, flare,
    front_neck_depth, back_neck_depth, waist_to_hip,
    notes, recorded_by, recorded_at, updated_at
) VALUES (
    '+91 98411 12345', 'Bhuvaneshwari Chandrasekar', 'LEHENGA', 'CURRENT', true, 1, 'in',
    14.75, 36.50, 31.00, 30.50, 40.00, 14.50, 16.50, 42.50, 140.00,
    7.50, 9.00, 8.50,
    'Reception Lehenga with high can-can skirt volume.', 'Master Tailor Karthik',
    '2026-07-21 15:30:00', '2026-07-21 15:30:00'
);

-- 4. GOWN (Current v1)
INSERT INTO customer_body_measurements (
    customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    shoulder, bust, under_bust, waist, hip, full_length, armhole, sleeve_length,
    front_neck_depth, back_neck_depth,
    notes, recorded_by, recorded_at, updated_at
) VALUES (
    '+91 98411 12345', 'Bhuvaneshwari Chandrasekar', 'GOWN', 'CURRENT', true, 1, 'in',
    14.75, 36.50, 31.00, 30.00, 40.00, 56.00, 16.50, 22.00,
    7.00, 8.00,
    'Floor-length evening drape gown.', 'Master Tailor Karthik',
    '2026-06-12 11:00:00', '2026-06-12 11:00:00'
);

-- Populate standard measurements for all other 19 customers
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN SELECT mobile_number, name FROM customers WHERE mobile_number != '+91 98411 12345' LOOP
        -- BLOUSE
        INSERT INTO customer_body_measurements (
            customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
            shoulder, bust, under_bust, waist, hip, blouse_length, armhole, upper_arm, sleeve_length, sleeve_round,
            front_neck_depth, back_neck_depth, bust_point, shoulder_to_waist, front_width, back_width,
            notes, recorded_by, recorded_at, updated_at
        ) VALUES (
            rec.mobile_number, rec.name, 'BLOUSE', 'CURRENT', true, 1, 'in',
            14.25, 35.00, 29.50, 28.50, 38.00, 14.00, 15.75, 11.50, 10.50, 11.00,
            6.50, 8.00, 9.50, 14.00, 13.50, 14.00,
            'Standard bespoke blouse profile.', 'Master Tailor Karthik',
            NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'
        );

        -- CHUDI
        INSERT INTO customer_body_measurements (
            customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
            shoulder, bust, under_bust, waist, hip, top_length, armhole, upper_arm, sleeve_length, sleeve_round,
            pant_waist, pant_hip, pant_length, bottom_opening,
            notes, recorded_by, recorded_at, updated_at
        ) VALUES (
            rec.mobile_number, rec.name, 'CHUDI', 'CURRENT', true, 1, 'in',
            14.25, 35.50, 29.50, 29.00, 38.50, 41.00, 16.00, 11.50, 17.00, 10.50,
            30.00, 39.50, 39.00, 12.00,
            'Salwar/Kurti profile.', 'Master Tailor Karthik',
            NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days'
        );

        -- LEHENGA
        INSERT INTO customer_body_measurements (
            customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
            shoulder, bust, under_bust, waist, hip, blouse_length, skirt_length, flare,
            notes, recorded_by, recorded_at, updated_at
        ) VALUES (
            rec.mobile_number, rec.name, 'LEHENGA', 'CURRENT', true, 1, 'in',
            14.25, 35.00, 29.50, 28.50, 38.50, 14.00, 41.50, 135.00,
            'Occasion Lehenga profile.', 'Master Tailor Karthik',
            NOW() - INTERVAL '50 days', NOW() - INTERVAL '15 days'
        );
    END LOOP;
END $$;
