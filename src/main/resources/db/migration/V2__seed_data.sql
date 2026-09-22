-- V2__seed_data.sql
-- Consolidated Production Seed Data for Fashion ERP
-- 100% Relational Integrity referencing customer_mobile across all modules

-- 1. App Users (Admin: admin / Admin@123)
INSERT INTO app_users (username, password_hash, full_name, role)
VALUES (
    'admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NnTGJFx5K',
    'Boutique Admin',
    'ADMIN'
);

-- 2. Customers
INSERT INTO customers (
    mobile_number, name, first_name, last_name, salutation, gender, email, alt_phone,
    instagram_handle, preferred_channel, location, street_address, city, state, pincode,
    avatar_url, tier, total_spend, balance, favorite_garment, fit_preference, measurements_on_file, notes
) VALUES
('+919876540001', 'Tara Varma', 'Tara', 'Varma', 'Ms.', 'Female', 'tara.varma@gmail.com', '+919876549901', '@tara_varma', 'WhatsApp', 'Banjara Hills, Hyderabad', 'Road No. 12, Banjara Hills', 'Hyderabad', 'Telangana', '500034', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', 'VIP_PLATINUM', 85000.00, 0.00, 'Bridal Lehenga', 'Slim Fit', TRUE, 'Prefers royal handwoven Banarasi silks and bespoke zardozi embroidery.'),
('+919876540002', 'Ananya Iyer', 'Ananya', 'Iyer', 'Mrs.', 'Female', 'ananya.iyer@gmail.com', '+919876549902', '@ananya_couture', 'WhatsApp', 'T. Nagar, Chennai', '14 North Usman Road', 'Chennai', 'Tamil Nadu', '600017', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', 'VIP_GOLD', 48000.00, 0.00, 'Raw Silk Lehenga', 'Comfort Fit', TRUE, 'Prefers pastel shades and minimalist antique zardozi work.'),
('+919876540003', 'Radhika Menon', 'Radhika', 'Menon', 'Dr.', 'Female', 'radhika.menon@outlook.com', '+919876549903', '@radhika_m', 'Email', 'Alwarpet, Chennai', '28 Kasturi Rangan Road', 'Chennai', 'Tamil Nadu', '600018', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200', 'VIP_PLATINUM', 72000.00, 5000.00, 'Designer Blouse & Saree', 'Tailored Fit', TRUE, 'Regular bespoke saree patron since Mar 2023.'),
('+919876540004', 'Priya Sharma', 'Priya', 'Sharma', 'Ms.', 'Female', 'priya.sharma@gmail.com', '+919876549904', '@priyasharma_fit', 'WhatsApp', 'Nungambakkam, Chennai', '5 Khader Nawaz Khan Rd', 'Chennai', 'Tamil Nadu', '600006', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200', 'REGULAR', 32000.00, 0.00, 'Evening Gown', 'Slim Fit', TRUE, 'Prefers lightweight Italian crepe with delicate resham threadwork.'),
('+919876540005', 'Sneha Reddy', 'Sneha', 'Reddy', 'Mrs.', 'Female', 'sneha.reddy@gmail.com', '+919876549905', '@sneha_reddy', 'WhatsApp', 'Adyar, Chennai', '8 Gandhi Nagar', 'Chennai', 'Tamil Nadu', '600020', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200', 'REGULAR', 18500.00, 0.00, 'Kurti Set', 'Regular Fit', TRUE, 'Loves contemporary Indo-western cuts and pure handwoven linen.'),
('+919876540006', 'Radhika Iyer', 'Radhika', 'Iyer', 'Ms.', 'Female', 'radhika.i@gmail.com', '+919876549906', '@radhika_iyer', 'WhatsApp', 'Race Course, Coimbatore', '24 Avinashi Road', 'Coimbatore', 'Tamil Nadu', '641018', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', 'REGULAR', 24000.00, 0.00, 'Chudi Set', 'Comfort Fit', TRUE, 'Prefers pure organic cottons and chanderi weaves.'),
('+919876540007', 'Anitha Raj', 'Anitha', 'Raj', 'Mrs.', 'Female', 'anitha.raj@gmail.com', '+919876549907', '@anitha_raj', 'Phone', 'KK Nagar, Madurai', '12 Lake View Road', 'Madurai', 'Tamil Nadu', '625020', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200', 'REGULAR', 15800.00, 0.00, 'Gown', 'Tailored Fit', TRUE, 'Bespoke western gowns with subtle traditional border trims.'),
('+919876540008', 'Divya Raj', 'Divya', 'Raj', 'Ms.', 'Female', 'divya.raj@outlook.com', '+919876549908', '@divya_raj_style', 'WhatsApp', 'Panampilly Nagar, Kochi', '7 Main Avenue', 'Kochi', 'Kerala', '682036', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200', 'REGULAR', 27000.00, 0.00, 'Blouse', 'Slim Fit', TRUE, 'Specialist in bridal hand embroidery cut-work blouses.'),
('+919876540009', 'Meera Pillai', 'Meera', 'Pillai', 'Mrs.', 'Female', 'meera.pillai@gmail.com', '+919876549909', '@meera_p', 'WhatsApp', 'Vellayambalam, Trivandrum', '19 Kowdiar Ave', 'Trivandrum', 'Kerala', '695003', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200', 'REGULAR', 12400.00, 0.00, 'Chudi Set', 'Comfort Fit', TRUE, 'Deep side slits and comfort trouser waist preference.'),
('+919876543210', 'Kavya Nair', 'Kavya', 'Nair', 'Ms.', 'Female', 'kavya.nair@gmail.com', '+919876549910', '@kavya_nair', 'WhatsApp', 'Boat Club, Chennai', '3 Turnbulls Road', 'Chennai', 'Tamil Nadu', '600028', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', 'VIP_PLATINUM', 98000.00, 0.00, 'Bridal Kente & Silk Lehenga', 'Slim Fit', TRUE, 'Celebrity client. Exclusive appointments only.');

-- 3. Precision Tailored Body Measurements (Blouse, Chudi, Lehenga, Saree, Gown)
INSERT INTO customer_body_measurements (
    customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    shoulder, bust, under_bust, waist, hip, blouse_length, top_length, full_length, skirt_length, pant_length,
    armhole, upper_arm, sleeve_length, sleeve_round, elbow_round, wrist_round, front_neck_depth, back_neck_depth,
    bust_point, bust_point_to_bust_point, shoulder_to_bust, shoulder_to_waist, front_width, back_width,
    pant_waist, pant_hip, thigh_round, knee_round, calf_round, ankle_round, crotch_length, bottom_opening,
    waist_to_hip, flare, recorded_by, notes
) VALUES
('+919876540001', 'Tara Varma', 'BLOUSE', 'CURRENT', TRUE, 1, 'in',
 14.50, 36.00, 30.50, 29.00, 38.00, 14.50, NULL, NULL, NULL, NULL,
 16.50, 12.00, 10.50, 11.00, 10.00, 6.50, 7.00, 8.50,
 9.50, 7.50, 9.50, 14.00, 13.50, 14.00,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, 'Master Tailor Rajesh', 'Deep U back neckline with dori tassels'),
('+919876540001', 'Tara Varma', 'LEHENGA', 'CURRENT', TRUE, 1, 'in',
 14.50, 36.00, 30.50, 29.00, 38.00, 14.50, NULL, NULL, 42.50, NULL,
 16.50, 12.00, 10.50, 11.00, 10.00, 6.50, 7.00, 8.50,
 9.50, 7.50, 9.50, 14.00, 13.50, 14.00,
 30.00, 40.00, 22.00, 15.00, 13.00, 10.00, 26.00, 140.00,
 8.50, 135.00, 'Master Tailor Rajesh', 'High waistband fit with multi-layer can-can flare'),
('+919876540002', 'Ananya Iyer', 'BLOUSE', 'CURRENT', TRUE, 1, 'in',
 14.00, 34.00, 29.00, 28.00, 37.00, 14.00, NULL, NULL, NULL, NULL,
 15.50, 11.50, 10.00, 10.50, 9.50, 6.50, 6.50, 8.00,
 9.00, 7.00, 9.00, 13.50, 13.00, 13.50,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, 'Sneha Patel', 'Boat neck front with keyhole teardrop back'),
('+919876540003', 'Radhika Menon', 'CHUDI', 'CURRENT', TRUE, 1, 'in',
 14.50, 35.00, 30.00, 29.50, 39.00, NULL, 42.00, NULL, NULL, 39.00,
 16.00, 12.00, 17.50, 10.00, 9.50, 6.50, 6.50, 7.00,
 9.50, 7.50, 9.50, 14.00, 13.50, 14.00,
 31.00, 40.00, 22.50, 15.50, 13.50, 10.50, 26.50, 12.50,
 8.00, NULL, 'Master Tailor Rajesh', 'Straight cut kurta with pant cut trousers'),
('+919876540004', 'Priya Sharma', 'GOWN', 'CURRENT', TRUE, 1, 'in',
 14.50, 35.00, 29.50, 28.50, 38.50, NULL, NULL, 56.00, NULL, NULL,
 16.00, 11.50, 22.00, 10.00, 9.50, 6.50, 7.00, 8.00,
 9.50, 7.50, 9.50, 14.00, 13.50, 14.00,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, 150.00,
 8.00, 145.00, 'Sneha Patel', 'Floor-length flared gown with sweeping train');

-- 4. Employees Seed
INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, notes)
VALUES
('a1000001-0000-0000-0000-000000000001', 'EMP-001', 'Lakshmi Priya', '+91 98401 23451', 'lakshmi.p@haulo.in', 'DESIGNER', 'ACTIVE', '2024-01-14', 'Sketching, Pattern Making', 'Lead bridal couture designer.'),
('a1000001-0000-0000-0000-000000000002', 'EMP-002', 'Ramesh K', '+91 98402 34562', 'ramesh.k@haulo.in', 'CUTTER', 'ACTIVE', '2023-09-15', 'Fabric Cutting, Marker Making', 'Senior master cutter.'),
('a1000001-0000-0000-0000-000000000003', 'EMP-003', 'Saira Banu', '+91 98403 45673', 'saira.b@haulo.in', 'TAILOR', 'ACTIVE', '2024-03-10', 'Blouse, Chudi, Alteration', 'High speed precision tailoring.'),
('a1000001-0000-0000-0000-000000000004', 'EMP-004', 'Suresh Kumar', '+91 98404 56784', 'suresh.k@haulo.in', 'TAILOR', 'ACTIVE', '2023-05-20', 'Lehenga, Bridal Sets', 'Master tailor specialized in zardozi assemblies.'),
('a1000001-0000-0000-0000-000000000005', 'EMP-005', 'Latha Menon', '+91 98405 67895', 'latha.m@haulo.in', 'TAILOR', 'ACTIVE', '2024-02-01', 'Hemming, Finishing', 'Expert finishing artist.'),
('a1000001-0000-0000-0000-000000000006', 'EMP-006', 'Anitha Raj', '+91 98406 78906', 'anitha.r@haulo.in', 'SUPERVISOR', 'ACTIVE', '2023-11-15', 'Client Trials, Alteration Fit', 'Head of customer trial fitting.'),
('a1000001-0000-0000-0000-000000000007', 'EMP-007', 'Sneha Rao', '+91 98407 89017', 'sneha.r@haulo.in', 'QC_SPECIALIST', 'ACTIVE', '2024-04-12', '12-point Quality Audit', 'Senior QC lead inspector.'),
('a1000001-0000-0000-0000-000000000008', 'EMP-008', 'Pranesh B', '+91 98408 90128', 'pranesh.b@haulo.in', 'MANAGER', 'ACTIVE', '2022-08-01', 'Operations Management', 'Boutique & Workshop General Manager.');

-- 5. Orders (All 7 fields, customer_mobile FK, total_amount, advance_paid, balance_amount)
INSERT INTO orders (
    id, order_code, customer_mobile, customer_name, garment_type, garment_desc, collection,
    order_date, expected_delivery_date, delivered_date, advance_paid, total_amount, balance_amount, amount, status, notes
) VALUES
('d0000001-0000-0000-0000-000000000001', 'ORD-2026-0528', '+919876540001', 'Tara Varma', 'Blouse', '1 Blouse, 1 Saree with bespoke zardozi embroidery', 'Bridal Collection', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '10 days', NULL, 6250.00, 12500.00, 6250.00, 12500.00, 'IN_PROGRESS', 'Matching silk lining, gold piping.'),
('d0000001-0000-0000-0000-000000000002', 'ORD-2026-0527', '+919876540003', 'Radhika Menon', 'Chudi', '2 Designer Chudi sets in royal blue and ivory', 'Custom Design', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '6 days', NULL, 2400.00, 4800.00, 2400.00, 4800.00, 'IN_PROGRESS', 'Side zipper, soft inner lining.'),
('d0000001-0000-0000-0000-000000000003', 'ORD-2026-0526', '+919876540002', 'Ananya Iyer', 'Lehenga', '1 Silk Bridal Lehenga with heavy can-can', 'Bridal Collection', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '23 days', NULL, 10000.00, 18500.00, 8500.00, 18500.00, 'IN_PROGRESS', 'Trial required on 18 Sep.'),
('d0000001-0000-0000-0000-000000000004', 'ORD-2026-0525', '+919876540004', 'Priya Sharma', 'Blouse', '1 Princess Cut Raw Silk Blouse with potli buttons', 'Festive Collection', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '1 days', NULL, 2500.00, 2500.00, 0.00, 2500.00, 'READY', 'Ready for customer pickup.'),
('d0000001-0000-0000-0000-000000000005', 'ORD-2026-0524', '+919876540005', 'Sneha Reddy', 'Kurti', '1 Kurti, 1 Pants in pure handwoven linen', 'Summer Chic', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE - INTERVAL '1 days', CURRENT_DATE - INTERVAL '1 days', 6800.00, 6800.00, 0.00, 6800.00, 'DELIVERED', 'Delivered and confirmed via WhatsApp.');

-- 6. Order Progress Stages
INSERT INTO order_progress_stages (order_id, stage, completed_at, completed_by, notes)
VALUES
('d0000001-0000-0000-0000-000000000001', 'ORDER', now() - INTERVAL '4 days', 'Pranesh B', 'Order logged with advance payment'),
('d0000001-0000-0000-0000-000000000001', 'MEASUREMENT', now() - INTERVAL '3 days', 'Sneha Patel', 'Measurements verified from profile'),
('d0000001-0000-0000-0000-000000000001', 'CUTTING', now() - INTERVAL '2 days', 'Suresh Kumar', 'Fabric cut accurately to pattern'),
('d0000001-0000-0000-0000-000000000001', 'SEWING', now() - INTERVAL '1 days', 'Latha Menon', 'Stitching in progress');

-- 7. Inventory Items
INSERT INTO inventory_items (id, item_code, name, category, variant, unit, stock_qty, reserved_qty, reorder_level, purchase_price, supplier_name, status)
VALUES
('e0000001-0000-0000-0000-000000000001', 'FAB-0012', 'Banarasi Silk', 'Fabrics', 'Rani Pink', 'Meter', 120.00, 30.00, 50.00, 1250.00, 'Varanasi Weavers Co.', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000002', 'FAB-0045', 'Georgette', 'Fabrics', 'Ivory', 'Meter', 60.00, 20.00, 30.00, 480.00, 'Surat Textiles Ltd.', 'LOW_STOCK'),
('e0000001-0000-0000-0000-000000000003', 'LIN-0008', 'Satoon Lining', 'Linings', 'Beige', 'Meter', 200.00, 40.00, 50.00, 95.00, 'Chennai Lining Hub', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000004', 'THD-0021', 'Embroidery Thread', 'Threads', 'Gold Zari', 'Spool', 45.00, 10.00, 20.00, 180.00, 'Surat Threads', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000005', 'ACC-0034', 'Designer Button', 'Accessories', 'Antique Gold', 'Pack', 15.00, 5.00, 25.00, 350.00, 'Mumbai Trims', 'LOW_STOCK');

-- 8. Payments
INSERT INTO payments (id, order_id, customer_mobile, total_amount, paid_amount, status, due_date, notes)
VALUES
('f0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', '+919876540001', 12500.00, 6250.00, 'PARTIAL', CURRENT_DATE + INTERVAL '10 days', '50% advance via UPI'),
('f0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', '+919876540003', 4800.00, 2400.00, 'PARTIAL', CURRENT_DATE + INTERVAL '6 days', '50% advance received'),
('f0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000003', '+919876540002', 18500.00, 10000.00, 'PARTIAL', CURRENT_DATE + INTERVAL '23 days', 'Advance paid via Card'),
('f0000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000004', '+919876540004', 2500.00, 2500.00, 'FULLY_PAID', CURRENT_DATE + INTERVAL '1 days', 'Paid in Cash at pickup desk'),
('f0000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000005', '+919876540005', 6800.00, 6800.00, 'FULLY_PAID', CURRENT_DATE - INTERVAL '1 days', 'Settled upon delivery');

INSERT INTO payment_transactions (payment_id, amount, method, received_by, reference_no)
VALUES
('f0000001-0000-0000-0000-000000000001', 6250.00, 'UPI', 'Suresh Kumar', 'UPI-9928172635'),
('f0000001-0000-0000-0000-000000000002', 2400.00, 'CARD', 'Priya Menon', 'TXN-CARD-8812'),
('f0000001-0000-0000-0000-000000000003', 10000.00, 'BANK_TRANSFER', 'Pranesh B', 'NEFT-00192837'),
('f0000001-0000-0000-0000-000000000004', 2500.00, 'CASH', 'Staff', 'RCP-0042'),
('f0000001-0000-0000-0000-000000000005', 6800.00, 'UPI', 'Staff', 'UPI-9928172639');

-- 9. Appointments
INSERT INTO appointments (id, customer_mobile, order_id, appt_type, scheduled_at, duration_minutes, status, staff_assigned, notes)
VALUES
('a0000001-0000-0000-0000-000000000001', '+919876540002', 'd0000001-0000-0000-0000-000000000003', 'CONSULTATION', CURRENT_DATE + TIME '10:00:00', 60, 'CONFIRMED', 'Pranesh B', 'New design consultation for bridal lehenga'),
('a0000001-0000-0000-0000-000000000002', '+919876540003', 'd0000001-0000-0000-0000-000000000002', 'MEASUREMENT', CURRENT_DATE + TIME '11:30:00', 45, 'CONFIRMED', 'Sneha Patel', 'Detailed measurements for Chudi sets'),
('a0000001-0000-0000-0000-000000000003', '+919876540004', 'd0000001-0000-0000-0000-000000000004', 'TRIAL', CURRENT_DATE + TIME '14:00:00', 45, 'CONFIRMED', 'Latha Menon', 'Blouse trial and neckline depth adjustment');

-- 10. Designs
INSERT INTO designs (id, design_code, title, garment_type, customer_mobile, order_id, status, style_notes, designer, thumbnail_url, created_at)
VALUES
('de000001-0000-0000-0000-000000000001', 'DES-2026-0010', 'Zardozi Bridal Blouse — Tara Varma', 'Blouse', '+919876540001', 'd0000001-0000-0000-0000-000000000001', 'APPROVED', 'Heavy zardozi on front yoke, gold piping, boat-neck, 3/4 sleeve with cuff.', 'Lakshmi Priya', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', NOW() - INTERVAL '10 days'),
('de000001-0000-0000-0000-000000000002', 'DES-2026-0009', 'Bridal Silk Lehenga — Ananya Iyer', 'Lehenga', '+919876540002', 'd0000001-0000-0000-0000-000000000003', 'IN_REVIEW', 'Heavy can-can skirt, double-layer brocade panel, thread & mirror work.', 'Lakshmi Priya', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400', NOW() - INTERVAL '8 days'),
('de000001-0000-0000-0000-000000000003', 'DES-2026-0008', 'Royal Blue Chudi Set — Radhika Menon', 'Chudi', '+919876540003', 'd0000001-0000-0000-0000-000000000002', 'APPROVED', 'Two sets — royal blue and ivory. Side zipper, contrast piping, soft lining.', 'Lakshmi Priya', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', NOW() - INTERVAL '7 days'),
('de000001-0000-0000-0000-000000000004', 'DES-2026-0007', 'Princess Cut Raw Silk Blouse', 'Blouse', '+919876540004', 'd0000001-0000-0000-0000-000000000004', 'APPROVED', 'Princess cut pattern, round neck, potli buttons at back, soft padded bust line.', 'Lakshmi Priya', 'https://images.unsplash.com/photo-1602573991155-21f0143b6747?w=400', NOW() - INTERVAL '6 days'),
('de000001-0000-0000-0000-000000000005', 'DES-2026-0006', 'Summer Chic Kurti — Sneha Reddy', 'Kurti', '+919876540005', 'd0000001-0000-0000-0000-000000000005', 'APPROVED', 'Indo-western A-line kurti, handwoven linen, pintuck at bust, 3/4 sleeve.', 'Lakshmi Priya', 'https://images.unsplash.com/photo-1583937443435-3c5a5dc87d7e?w=400', NOW() - INTERVAL '5 days');

-- 11. Trials
INSERT INTO trials (
    trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection,
    trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date,
    neck_style, sleeve_style, lining, embroidery, fabric, spec_notes, notes
) VALUES (
    'TRL-2026-0001',
    'd0000001-0000-0000-0000-000000000001',
    'ORD-2026-0528',
    '+919876540001',
    'Tara Varma',
    'Blouse',
    'Bridal Collection',
    CURRENT_DATE,
    '11:00 AM',
    'First Trial',
    'TODAY',
    'PERFECT',
    'Sneha Patel',
    CURRENT_DATE + INTERVAL '10 days',
    'Round (Front), Deep Back',
    '3/4 Sleeve',
    'Silk',
    'Zari Embroidery',
    'Raw Silk with Brocade Lining',
    'Handle with care. Customer prefers subtle embroidery.',
    'Fit is immaculate. Customer highly satisfied.'
);

INSERT INTO trial_alterations (trial_id, description, category, completed)
SELECT t.id, 'Take in waist by 0.5" on both sides', 'Fit', false
FROM trials t WHERE t.trial_code = 'TRL-2026-0001'
UNION ALL
SELECT t.id, 'Shorten sleeve length by 0.75"', 'Length', true
FROM trials t WHERE t.trial_code = 'TRL-2026-0001';

-- 12. Suppliers & Purchase Orders
INSERT INTO suppliers (id, supplier_code, name, contact_person, phone, email, address, specialization)
VALUES
('b1000001-0000-0000-0000-000000000001', 'SUP-001', 'Shree Textiles', 'Rajesh Sharma', '+91 98201 12345', 'sales@shreetextiles.com', 'Surat, Gujarat', 'Pure Silks & Banarasi Brocades'),
('b1000001-0000-0000-0000-000000000002', 'SUP-002', 'Kumar Buttons', 'Manoj Kumar', '+91 98401 54321', 'orders@kumarbuttons.in', 'Chennai, Tamil Nadu', 'Mother of Pearl & Antique Buttons'),
('b1000001-0000-0000-0000-000000000003', 'SUP-003', 'Zari World', 'Vikram Sethi', '+91 98111 67890', 'vikram@zariworld.com', 'Varanasi, Uttar Pradesh', 'Pure Gold & Silver Zari Threads');

INSERT INTO purchase_orders (id, po_code, supplier_id, status, total_amount, order_date, expected_date, notes)
VALUES
('c1000001-0000-0000-0000-000000000001', 'PO-2026-0024', 'b1000001-0000-0000-0000-000000000001', 'SENT', 145000.00, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '6 days', 'Bridal raw silk replenishment.'),
('c1000001-0000-0000-0000-000000000002', 'PO-2026-0023', 'b1000001-0000-0000-0000-000000000002', 'PARTIALLY_RECEIVED', 32400.00, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '3 days', 'Handmade brass and pearl buttons.');

-- 13. Enquiries
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source)
VALUES
('e9000001-0000-0000-0000-000000000001', 'ENQ-2026-0012', 'Divya Krishnan', '+91 99401 23456', 'divya.k@gmail.com', 'Bridal Lehenga', 'Looking for heavy zardozi work for wedding', 'PENDING', 'Pranesh B', CURRENT_DATE + INTERVAL '2 days', 'INSTAGRAM'),
('e9000001-0000-0000-0000-000000000002', 'ENQ-2026-0011', 'Meera Pillai', '+91 98402 34567', 'meera.p@outlook.com', 'Saree Blouse', 'Bespoke blouse for silk saree', 'FOLLOW_UP', 'Lakshmi Priya', CURRENT_DATE + INTERVAL '1 days', 'WALK_IN');
