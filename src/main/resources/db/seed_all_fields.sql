-- ============================================================================
-- FASHION ERP: MASTER SEED SCRIPT
-- Populates 1 Complete Record with EVERY Field Populated Across All Tables
-- ============================================================================

BEGIN;

-- 1. EMPLOYEES
INSERT INTO employees (
    id, employee_code, name, phone, email, role, status, joined_date,
    avatar_url, specialization, notes, created_at, updated_at
) VALUES (
    'c0000001-0000-0000-0000-000000000001',
    'EMP-001',
    'Rajesh Kumar',
    '+91 98401 22334',
    'rajesh.kumar@hauloboutique.com',
    'MASTER_TAILOR',
    'ACTIVE',
    '2024-01-15',
    '../../assets/user_avatar.jpg',
    'Bridal Lehengas, Zari Borders & Structured Corsets',
    'Head of Atelier tailoring unit with 18 years couture experience.',
    NOW(),
    NOW()
) ON CONFLICT (employee_code) DO NOTHING;

-- 2. STAGE DEFINITIONS (Active Stages in Bespoke Workflow: ORDER_TAKEN = 1, READY_TO_DELIVER = 8)
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
    'c0000002-0000-0000-0000-000000000001',
    'DESIGNING',
    'Design & Silhouette Blueprint',
    'Style sketching, proportion rendering and client preference sign-off.',
    'DESIGNER',
    'Design Studio',
    'stage-purple',
    2,
    true,
    '/front end/assets/stages/Designing_1058.jpg',
    NOW(), NOW()
),
(
    'c0000002-0000-0000-0000-000000000002',
    'CUTTING',
    'Fabric Pattern Drafting & Cutting',
    'Grainline alignment, panel shears, seam allowance marking and interlining prep.',
    'CUTTER',
    'Pattern Cutting',
    'stage-blue',
    3,
    true,
    '/front end/assets/stages/Cutting_4091.jpg',
    NOW(), NOW()
),
(
    'c0000002-0000-0000-0000-000000000003',
    'STITCHING',
    'Atelier Stitching & Assembly',
    'Precision joining of cut panels, lining integration and edge binding.',
    'TAILOR',
    'Tailoring Section',
    'stage-amber',
    4,
    true,
    '/front end/assets/stages/Stitching_5076.jpg',
    NOW(), NOW()
),
(
    'c0000002-0000-0000-0000-000000000004',
    'EMBROIDERY',
    'Hand Zardozi & Embellishment',
    'Artisanal needlework with gold thread, sequins, crystals and thread knots.',
    'EMBROIDERER',
    'Embroidery Section',
    'stage-gold',
    5,
    true,
    '/front end/assets/stages/Hand_Work_3082.jpg',
    NOW(), NOW()
),
(
    'c0000002-0000-0000-0000-000000000005',
    'FINISHING',
    'Hemming, Steaming & Finishing',
    'Hand hemming, hook and eye closure attachment, and industrial iron pressing.',
    'FINISHER',
    'Finishing Section',
    'stage-indigo',
    6,
    true,
    '/front end/assets/stages/Lining_2047.jpg',
    NOW(), NOW()
),
(
    'c0000002-0000-0000-0000-000000000006',
    'QC',
    'Quality Control & Fit Audit',
    'Multi-point inspection of stitch density, measurements, closures and surface purity.',
    'SUPERVISOR',
    'Quality Assurance',
    'stage-emerald',
    7,
    true,
    '/front end/assets/stages/QC_7019.jpg',
    NOW(), NOW()
),
(
    '13975051-b17b-409e-b5c9-efa38958c7df',
    'READY_TO_DELIVER',
    'Ready to Deliver',
    'Final garment pressed, bagged in garment cover, balance payment cleared and ready for handover.',
    'MANAGER',
    'Delivery & Handover',
    'stage-silver',
    8,
    true,
    '/front end/assets/stages/Ready_8043.jpg',
    NOW(), NOW()
) ON CONFLICT (stage_key) DO UPDATE SET
    sort_order = EXCLUDED.sort_order,
    display_name = EXCLUDED.display_name,
    image_url = EXCLUDED.image_url,
    active = EXCLUDED.active;

-- 3. STAGE DEFINITION EMPLOYEES
INSERT INTO stage_definition_employees (
    id, stage_def_id, employee_id, assignment_type, created_at
) VALUES (
    'c0000003-0000-0000-0000-000000000001',
    'c0000002-0000-0000-0000-000000000003', -- STITCHING
    'c0000001-0000-0000-0000-000000000001', -- Rajesh Kumar
    'DEFAULT',
    NOW()
) ON CONFLICT (stage_def_id, employee_id) DO NOTHING;

-- 4. COLLECTION ACTIVITIES (for existing collection 'COL-2026-005')
INSERT INTO collection_activities (
    id, collection_id, activity_date, description, activity_type, color, created_at
) VALUES (
    'c0000005-0000-0000-0000-000000000001',
    'a9d3858d-b24b-46f5-a92b-203853301991', -- Royal Wedding Traditions
    CURRENT_DATE,
    'Client trial completed for flagship Empress Bridal Lehenga couture piece.',
    'TRIAL',
    '#10b981',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. CUSTOMERS
INSERT INTO customers (
    mobile_number, name, first_name, last_name, salutation, gender, email, alt_phone,
    instagram_handle, preferred_channel, dob, anniversary, location, street_address,
    city, state, pincode, landmark, avatar_url, tier, total_spend, balance, credit_limit,
    favorite_garment, fit_preference, fabric_allergies, measurements_on_file, notes,
    preferred_neck, preferred_sleeve, preferred_occasions, delivery_preference,
    created_at, updated_at
) VALUES (
    '+91 98401 99887',
    'Ananya Sharma',
    'Ananya',
    'Sharma',
    'Ms.',
    'Female',
    'ananya.sharma@luxuryfashion.in',
    '+91 94440 11223',
    '@ananya_sharma_couture',
    'WhatsApp',
    '1994-07-22',
    '2021-11-18',
    'Banjara Hills, Hyderabad',
    'Villa 42, Road No. 12, MLA Colony',
    'Hyderabad',
    'Telangana',
    '500034',
    'Near Taj Krishna',
    '../../assets/user_avatar.jpg',
    'VIP_PLATINUM',
    48500.00,
    13500.00,
    100000.00,
    'Bridal Lehenga & Handloom Blouse',
    'Snug Tailored Fit',
    'Pure wool lining allergy (prefer 100% mulmul cotton lining)',
    true,
    'Prefers weekend morning appointments. High attention to neckline embroidery detail.',
    'Deep Sweetheart with Scalloped Zari Edge',
    'Elbow Length with Hand Embroidered Border',
    'Sangeet, Reception & Festive Galas',
    'Atelier Private Fitting & Handover',
    NOW(),
    NOW()
) ON CONFLICT (mobile_number) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    location = EXCLUDED.location,
    tier = EXCLUDED.tier,
    total_spend = EXCLUDED.total_spend,
    balance = EXCLUDED.balance,
    measurements_on_file = true;

-- 6. CUSTOMER NOTES
INSERT INTO customer_notes (
    id, customer_mobile, note_text, author_name, author_badge, category, created_at, updated_at
) VALUES (
    'c0000007-0000-0000-0000-000000000001',
    '+91 98401 99887',
    'Client requested additional 1.5 inch ease around the waist for the reception night dinner.',
    'Ananya Verma',
    'AV',
    'STYLE',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 7. CUSTOMER BODY MEASUREMENTS (Complete 34 Points)
INSERT INTO customer_body_measurements (
    id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    shoulder, bust, under_bust, waist, hip, blouse_length, top_length, full_length, skirt_length, pant_length,
    armhole, upper_arm, sleeve_length, sleeve_round, elbow_round, wrist_round, front_neck_depth, back_neck_depth,
    bust_point, bust_point_to_bust_point, shoulder_to_bust, shoulder_to_waist, front_width, back_width,
    pant_waist, pant_hip, thigh_round, knee_round, calf_round, ankle_round, crotch_length, bottom_opening,
    waist_to_hip, flare, posture_notes, shape_notes, notes, recorded_by, recorded_at, updated_at
) VALUES (
    'c0000008-0000-0000-0000-000000000001',
    '+91 98401 99887',
    'Ananya Sharma',
    'Lehenga',
    'CURRENT',
    true,
    1,
    'in',
    14.50, 36.00, 31.50, 29.00, 39.00, 14.50, 26.00, 55.00, 42.00, 38.00,
    16.50, 12.00, 11.50, 10.50, 9.50, 6.00, 7.50, 10.00,
    9.50, 7.50, 10.00, 14.50, 13.50, 14.00,
    30.00, 40.00, 22.00, 15.00, 13.50, 9.00, 26.00, 14.00,
    8.50, 120.00,
    'Erect posture, slightly prominent left shoulder blade',
    'Hourglass proportion with narrow ribcage',
    'Master measurements taken with signature bridal can-can underskirt attached.',
    'Rajesh Kumar',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. CUSTOMER MEASUREMENTS
INSERT INTO customer_measurements (
    id, customer_mobile, garment_type, bust, upper_bust, under_bust, waist, high_hip, full_hip,
    shoulder, cross_front, cross_back, armhole, sleeve_length, bicep, wrist, front_neck, back_neck,
    apex_point, garment_length, posture_notes, shape_notes, recorded_by, is_active_profile,
    recorded_at, updated_at
) VALUES (
    'c0000009-0000-0000-0000-000000000001',
    '+91 98401 99887',
    'Blouse',
    36.00, 34.50, 31.50, 29.00, 36.00, 39.00,
    14.50, 13.50, 14.00, 16.50, 11.50, 12.00, 6.00, 7.50, 10.00,
    9.50, 14.50,
    'Standard straight spine posture',
    'Fitted princess cut structure with padded cups',
    'Rajesh Kumar',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 9. MEASUREMENT PROFILES & 10. MEASUREMENT POINTS
INSERT INTO measurement_profiles (
    id, customer_mobile, garment_type, recorded_by, notes, recorded_at, updated_at
) VALUES (
    'c0000010-0000-0000-0000-000000000001',
    '+91 98401 99887',
    'Blouse',
    'Rajesh Kumar',
    'High-definition fitted profile for bespoke silk saree choli.',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO measurement_points (
    id, profile_id, point_name, value, unit, marker_index, sort_order
) VALUES
('c0000010-0000-0000-0000-000000000011', 'c0000010-0000-0000-0000-000000000001', 'Bust Round', 36.00, '"', 1, 1),
('c0000010-0000-0000-0000-000000000012', 'c0000010-0000-0000-0000-000000000001', 'Under Bust', 31.50, '"', 2, 2),
('c0000010-0000-0000-0000-000000000013', 'c0000010-0000-0000-0000-000000000001', 'Waist Round', 29.00, '"', 3, 3),
('c0000010-0000-0000-0000-000000000014', 'c0000010-0000-0000-0000-000000000001', 'Shoulder Width', 14.50, '"', 4, 4),
('c0000010-0000-0000-0000-000000000015', 'c0000010-0000-0000-0000-000000000001', 'Armhole', 16.50, '"', 5, 5),
('c0000010-0000-0000-0000-000000000016', 'c0000010-0000-0000-0000-000000000001', 'Front Neck Depth', 7.50, '"', 6, 6),
('c0000010-0000-0000-0000-000000000017', 'c0000010-0000-0000-0000-000000000001', 'Back Neck Depth', 10.00, '"', 7, 7),
('c0000010-0000-0000-0000-000000000018', 'c0000010-0000-0000-0000-000000000001', 'Blouse Length', 14.50, '"', 8, 8)
ON CONFLICT (id) DO NOTHING;

-- 11. SUPPLIERS
INSERT INTO suppliers (
    id, supplier_code, name, contact_person, phone, email, address, specialization, notes, created_at
) VALUES (
    'c0000011-0000-0000-0000-000000000001',
    'SUP-001',
    'Kanchipuram Silk Weavers Guild',
    'Venkatesh Raman',
    '+91 94432 77889',
    'orders@kanchisilkguild.com',
    'Plot 84, Temple Handloom Cluster, Kanchipuram, Tamil Nadu - 631501',
    'Pure Mulberry Raw Silk, Gold Tissue & Zari Borders',
    'Lead supplier for luxury silk yards with verified GI certified handloom guarantee.',
    NOW()
) ON CONFLICT (supplier_code) DO NOTHING;

-- 12. INVENTORY ITEMS
INSERT INTO inventory_items (
    id, item_code, name, category, variant, unit, stock_qty, reserved_qty, reorder_level,
    purchase_price, selling_price, supplier_name, image_url, status, composition, weave,
    width, gsm, hsn_code, origin, location, lead_time, supplier_contact, notes, created_at, updated_at
) VALUES (
    'c0000012-0000-0000-0000-000000000001',
    'FAB-001',
    'Crimson Red Kanchipuram Raw Silk',
    'Fabric',
    'Crimson Gold Sheen',
    'Meter',
    45.50,
    6.50,
    15.00,
    1850.00,
    2650.00,
    'Kanchipuram Silk Weavers Guild',
    '../../assets/fabrics/crimson_raw_silk.jpg',
    'IN_STOCK',
    '100% Pure Mulberry Silk',
    'High Twist Handloom Weave',
    '44 inches',
    '85 GSM',
    '5007',
    'Kanchipuram, India',
    'Bay A - Shelf 03',
    '5-7 Business Days',
    '+91 94432 77889',
    'Dye lot matches 2026 Bridal Collection specification.',
    NOW(),
    NOW()
) ON CONFLICT (item_code) DO NOTHING;

-- 13. STOCK MOVEMENTS
INSERT INTO stock_movements (
    id, item_id, movement_type, quantity, reference, notes, moved_by, moved_at
) VALUES (
    'c0000013-0000-0000-0000-000000000001',
    'c0000012-0000-0000-0000-000000000001', -- FAB-001
    'RECEIPT',
    50.00,
    'PO-2026-001',
    'Received roll in pristine condition from weaver.',
    'Inventory Store Manager',
    NOW() - INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;

-- 14. PURCHASE ORDERS
INSERT INTO purchase_orders (
    id, po_code, supplier_id, status, total_amount, order_date, expected_date, received_date, notes, created_at, updated_at
) VALUES (
    'c0000014-0000-0000-0000-000000000001',
    'PO-2026-001',
    'c0000011-0000-0000-0000-000000000001', -- SUP-001
    'RECEIVED',
    92500.00,
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE - INTERVAL '5 days',
    'Autumn bridal season primary silk purchase order.',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '5 days'
) ON CONFLICT (po_code) DO NOTHING;

-- 15. PURCHASE ORDER ITEMS
INSERT INTO purchase_order_items (
    id, po_id, item_id, item_name, quantity, unit, unit_price, received_qty
) VALUES (
    'c0000015-0000-0000-0000-000000000001',
    'c0000014-0000-0000-0000-000000000001',
    'c0000012-0000-0000-0000-000000000001',
    'Crimson Red Kanchipuram Raw Silk (44 in)',
    50.00,
    'Meter',
    1850.00,
    50.00
) ON CONFLICT (id) DO NOTHING;

-- 16. DESIGNS
INSERT INTO designs (
    id, design_code, title, garment_type, customer_mobile, status, style_notes, designer,
    thumbnail_url, sub_category, style, occasion, collection, primary_fabric, colour_options,
    sizes, construction, embroidery, estimated_cost, suggested_price, estimated_labour,
    production_status, times_used, last_used_date, tags, image_urls, swatches, notes, created_by,
    created_at, updated_at
) VALUES (
    'c0000016-0000-0000-0000-000000000001',
    'DSN-2026-001',
    'The Empress Sangeet Lehenga',
    'Lehenga',
    '+91 98401 99887',
    'APPROVED',
    'Kalidar cut with 16 panels, heavily embellished peacock and floral vine Zardozi embroidery.',
    'Ananya Verma',
    '../../assets/designs/empress_lehenga.jpg',
    'Bridal Couture',
    'Flared Kalidar',
    'Wedding Reception',
    'Royal Wedding Traditions 2026',
    'Crimson Red Kanchipuram Raw Silk',
    '["Crimson Red", "Royal Emerald", "Midnight Navy"]',
    'Bespoke Custom',
    'Double can-can layered underskirt with heavy micro-velvet waistband.',
    'Gold Dabka, Nakshi, Sequin and French Knot Zardozi.',
    22000.00,
    48500.00,
    '65 Hours',
    'Active',
    1,
    CURRENT_DATE,
    '["Bridal", "Zardozi", "Silk", "Kalidar", "Couture"]',
    '["../../assets/designs/empress_lehenga.jpg"]',
    '["#991b1b", "#d97706"]',
    'Master collection piece approved for high-profile bridal handover.',
    'Ananya Verma',
    NOW(),
    NOW()
) ON CONFLICT (design_code) DO NOTHING;

-- 17. ENQUIRIES
INSERT INTO enquiries (
    id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to,
    follow_up_date, source, occasion, preferred_date, estimated_budget, next_action,
    fabric_brought, avatar_url, created_at, updated_at
) VALUES (
    'c0000017-0000-0000-0000-000000000001',
    'ENQ-2026-001',
    'Ananya Sharma',
    '+91 98401 99887',
    'ananya.sharma@luxuryfashion.in',
    'Lehenga',
    'Initial Instagram consultation converted into private bespoke bridal atelier order.',
    'CONVERTED',
    'Ananya Verma',
    CURRENT_DATE + INTERVAL '2 days',
    'INSTAGRAM',
    'Wedding Reception',
    CURRENT_DATE + INTERVAL '5 days',
    50000.00,
    'Fitting Completed - Clear for Final Pressing',
    false,
    '../../assets/user_avatar.jpg',
    NOW() - INTERVAL '12 days',
    NOW()
) ON CONFLICT (enquiry_code) DO NOTHING;

-- 18. ORDERS
INSERT INTO orders (
    id, order_code, customer_mobile, customer_name, garment_type, garment_desc, collection,
    order_date, expected_delivery_date, delivered_date, advance_paid, total_amount, balance_amount,
    amount, status, due_date, notes, current_stage, reference_images, production_notes,
    qc_rework_count, created_at, updated_at
) VALUES (
    'c0000018-0000-0000-0000-000000000001',
    'ORD-2026-0001',
    '+91 98401 99887',
    'Ananya Sharma',
    'Lehenga',
    '16-Panel Crimson Red Raw Silk Bridal Lehenga with heavy Zardozi hand embroidery and scalloped dupatta.',
    'Royal Wedding Traditions 2026',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '5 days',
    NULL,
    35000.00,
    48500.00,
    13500.00,
    48500.00,
    'IN_PROGRESS',
    CURRENT_DATE + INTERVAL '5 days',
    'VIP bridal order. Ensure custom embroidered waist tie dori with pearl latkans.',
    'STITCHING',
    '["../../assets/designs/empress_lehenga.jpg"]',
    'Target completion 48 hours prior to delivery for final steaming and quality inspection.',
    0,
    NOW() - INTERVAL '10 days',
    NOW()
) ON CONFLICT (order_code) DO UPDATE SET
    status = EXCLUDED.status,
    current_stage = EXCLUDED.current_stage;

-- Link converted enquiry to order
UPDATE enquiries SET converted_order_id = 'c0000018-0000-0000-0000-000000000001' WHERE id = 'c0000017-0000-0000-0000-000000000001';
UPDATE designs SET order_id = 'c0000018-0000-0000-0000-000000000001' WHERE id = 'c0000016-0000-0000-0000-000000000001';

-- 19. GARMENTS
INSERT INTO garments (
    id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type,
    specs, design_code, collection_name, production_stage, material_status, trial_status,
    trial_date, due_date, priority, payment_status, paid_amount, total_amount, status,
    assigned_to, designer, branch, image_url, notes, created_at, updated_at
) VALUES (
    'c0000019-0000-0000-0000-000000000001',
    'GAR-2026-0001',
    'c0000018-0000-0000-0000-000000000001',
    'ORD-2026-0001',
    'Ananya Sharma',
    '+91 98401 99887',
    'Empress Bridal Skirt & Choli Set',
    'Lehenga',
    'Bust: 36", Waist: 29", Length: 42", 16 Kalis, Can-Can Attached',
    'DSN-2026-001',
    'Royal Wedding Traditions 2026',
    'STITCHING',
    'READY',
    'SCHEDULED',
    CURRENT_DATE + INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '5 days',
    'HIGH',
    'PARTIAL',
    35000.00,
    48500.00,
    'IN_PRODUCTION',
    'Rajesh Kumar',
    'Ananya Verma',
    'Main Atelier Chennai',
    '../../assets/designs/empress_lehenga.jpg',
    'Fabric cut and kalis aligned. Assembly underway.',
    NOW(),
    NOW()
) ON CONFLICT (garment_code) DO NOTHING;

-- 20. ORDER PROGRESS STAGES
INSERT INTO order_progress_stages (
    id, order_id, stage, completed_at, completed_by, notes
) VALUES 
('c0000020-0000-0000-0000-000000000001', 'c0000018-0000-0000-0000-000000000001', 'ORDER_TAKEN', NOW() - INTERVAL '10 days', 'Ananya Verma', 'Initial deposit received and measurements recorded.'),
('c0000020-0000-0000-0000-000000000002', 'c0000018-0000-0000-0000-000000000001', 'DESIGNING', NOW() - INTERVAL '8 days', 'Ananya Verma', 'CAD pattern and motifs finalized with client.'),
('c0000020-0000-0000-0000-000000000003', 'c0000018-0000-0000-0000-000000000001', 'CUTTING', NOW() - INTERVAL '6 days', 'Rajesh Kumar', 'Raw silk panels cut with precision allowance.')
ON CONFLICT (id) DO NOTHING;

-- 21. PRODUCTION STAGES (Active Order Pipeline)
INSERT INTO production_stages (
    id, order_id, stage_name, assigned_to, status, started_at, completed_at, notes, sort_order
) VALUES 
('c0000021-0000-0000-0000-000000000001', 'c0000018-0000-0000-0000-000000000001', 'DESIGNING', 'c0000001-0000-0000-0000-000000000001', 'COMPLETED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', 'Design specs and embroidery map approved.', 1),
('c0000021-0000-0000-0000-000000000002', 'c0000018-0000-0000-0000-000000000001', 'CUTTING', 'c0000001-0000-0000-0000-000000000001', 'COMPLETED', NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days', 'Silk and inner mulmul lining cut.', 2),
('c0000021-0000-0000-0000-000000000003', 'c0000018-0000-0000-0000-000000000001', 'STITCHING', 'c0000001-0000-0000-0000-000000000001', 'IN_PROGRESS', NOW() - INTERVAL '6 days', NULL, 'Panel join stitching and can-can construction.', 3),
('c0000021-0000-0000-0000-000000000004', 'c0000018-0000-0000-0000-000000000001', 'EMBROIDERY', 'c0000001-0000-0000-0000-000000000001', 'NOT_STARTED', NULL, NULL, 'Zardozi borders to be inspected during trial.', 4),
('c0000021-0000-0000-0000-000000000005', 'c0000018-0000-0000-0000-000000000001', 'QC', 'c0000001-0000-0000-0000-000000000001', 'NOT_STARTED', NULL, NULL, 'Clearance check prior to handover.', 5)
ON CONFLICT (id) DO NOTHING;

-- 22. QC CHECKLISTS
INSERT INTO qc_checklists (
    id, order_id, check_point, result, checked_by, checked_at, remarks, sort_order
) VALUES 
('c0000022-0000-0000-0000-000000000001', 'c0000018-0000-0000-0000-000000000001', 'Seam Allowance & Edge Binding Inspection', 'PASS', 'c0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', 'French seam finishing executed flawlessly. Interfacing secure.', 1),
('c0000022-0000-0000-0000-000000000002', 'c0000018-0000-0000-0000-000000000001', 'Zari Embroidery Tension & Embellishment Security', 'PASS', 'c0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', 'All stone and bead attachments verified firmly locked.', 2),
('c0000022-0000-0000-0000-000000000003', 'c0000018-0000-0000-0000-000000000001', 'Zipper Closure & YKK Concealed Fastener Test', 'PASS', 'c0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', 'Smooth glide tested 5 times under tension.', 3)
ON CONFLICT (id) DO NOTHING;

-- 23. TRIALS
INSERT INTO trials (
    id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type,
    collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date,
    neck_style, sleeve_style, lining, embroidery, fabric, spec_notes, notes, trial_attempt,
    alteration_count, customer_feedback, customer_rating, fit_preference, fit_checkpoints,
    fit_notes, created_at, updated_at
) VALUES (
    'c0000023-0000-0000-0000-000000000001',
    'TRL-2026-001',
    'c0000018-0000-0000-0000-000000000001',
    'ORD-2026-0001',
    '+91 98401 99887',
    'Ananya Sharma',
    'Lehenga',
    'Royal Wedding Traditions 2026',
    CURRENT_DATE + INTERVAL '2 days',
    '11:30 AM',
    'First Fitting Session',
    'TODAY',
    'PENDING',
    'Ananya Verma',
    CURRENT_DATE + INTERVAL '5 days',
    'Deep Sweetheart with Scalloped Zari Edge',
    'Elbow Length with Hand Embroidered Border',
    '100% Mulmul Cotton Comfort Lining',
    'Gold Zardozi with Pearl Highlights',
    'Crimson Red Kanchipuram Raw Silk',
    'Check choli armhole mobility and flare drape over wedding heels.',
    'Atelier VIP fitting room reserved for 1.5 hours.',
    1,
    1,
    'Client loved the flare; requested waist ease check during trial.',
    5,
    'Snug Tailored Fit',
    '["Waistband comfort", "Armhole ease", "Skirt floor clearance"]',
    'Ensure 2 inch bridal heels are worn during skirt length confirmation.',
    NOW(),
    NOW()
) ON CONFLICT (trial_code) DO NOTHING;

-- 24. TRIAL ALTERATIONS
INSERT INTO trial_alterations (
    id, trial_id, description, category, completed, assigned_tailor, priority, target_date, tailor_notes, created_at
) VALUES (
    'c0000024-0000-0000-0000-000000000001',
    'c0000023-0000-0000-0000-000000000001',
    'Verify choli side hook alignment and waistband ease',
    'Fit',
    false,
    'Rajesh Kumar',
    'High',
    CURRENT_DATE + INTERVAL '3 days',
    'Keep 1 inch internal seam allowance untouched for future alterations.',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 25. PAYMENTS
INSERT INTO payments (
    id, order_id, customer_mobile, total_amount, paid_amount, status, due_date, notes, created_at, updated_at
) VALUES (
    'c0000025-0000-0000-0000-000000000001',
    'c0000018-0000-0000-0000-000000000001',
    '+91 98401 99887',
    48500.00,
    35000.00,
    'PARTIAL',
    CURRENT_DATE + INTERVAL '5 days',
    'Booking advance and mid-stage milestone collected. Balance due at handover.',
    NOW() - INTERVAL '10 days',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 26. PAYMENT TRANSACTIONS
INSERT INTO payment_transactions (
    id, payment_id, amount, method, received_by, reference_no, transaction_date, notes
) VALUES 
(
    'c0000026-0000-0000-0000-000000000001',
    'c0000025-0000-0000-0000-000000000001',
    25000.00,
    'UPI',
    'Cashier - Boutique Desk',
    'UPI/2026/894719284',
    NOW() - INTERVAL '10 days',
    'Order confirmation 50% advance booking deposit.'
),
(
    'c0000026-0000-0000-0000-000000000002',
    'c0000025-0000-0000-0000-000000000001',
    10000.00,
    'CARD',
    'Cashier - Boutique Desk',
    'CARD-AUTH-5542',
    NOW() - INTERVAL '3 days',
    'Embroidery stage material progress milestone payment.'
)
ON CONFLICT (id) DO NOTHING;

-- 27. APPOINTMENTS
INSERT INTO appointments (
    id, customer_mobile, order_id, appt_type, scheduled_at, duration_minutes,
    status, staff_assigned, notes, created_at, updated_at
) VALUES (
    'c0000027-0000-0000-0000-000000000001',
    '+91 98401 99887',
    'c0000018-0000-0000-0000-000000000001',
    'FITTING',
    (CURRENT_DATE + INTERVAL '2 days' + INTERVAL '11 hours 30 minutes')::timestamp,
    60,
    'SCHEDULED',
    'Rajesh Kumar',
    'Atelier VIP Suite booked for trial fitting with designer Ananya Verma.',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

COMMIT;
