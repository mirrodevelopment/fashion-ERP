-- ==============================================================================
-- HAULO BOUTIQUE FASHION ERP — SEED DATA FOR COMPANY "siva" & BRANCH "siva 2"
-- Company ID: 561d805a-f26c-4f88-9b3f-06b286226194
-- Primary Branch: siva 2 (BRN-001) | Flagship: siva Flagship Atelier (BRN-002)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. UPDATE COMPANY SETTINGS FOR "siva"
-- ------------------------------------------------------------------------------
UPDATE public.company_settings
SET 
    tagline = 'Luxury Bespoke Haute Couture & Royal Bridal Atelier',
    owner_name = 'Sivasurya S',
    business_type = 'Bespoke Haute Couture Atelier',
    gstin = '33AAAAA0000A1Z5',
    pan_number = 'AAAAA0000A',
    primary_phone = '+91 93440 75887',
    whatsapp = '+91 93440 75887',
    email = 'sivasurya.official.8@gmail.com',
    website = 'https://sivacouture.com',
    street_address = '42, Race Course Road, Gopalapuram',
    city = 'Coimbatore',
    state = 'Tamil Nadu',
    pin_code = '641018',
    country = 'India',
    share_customers_across_branches = TRUE,
    share_orders_across_branches = TRUE,
    share_enquiries_across_branches = TRUE,
    share_measurements_across_branches = TRUE,
    share_inventory_across_branches = TRUE,
    share_garments_across_branches = TRUE,
    share_trials_across_branches = TRUE
WHERE id = '561d805a-f26c-4f88-9b3f-06b286226194';

-- ------------------------------------------------------------------------------
-- 2. BRANCHES: ENSURE "siva 2" IS COMPLETE AND ADD "siva Flagship Atelier"
-- ------------------------------------------------------------------------------
-- Update siva 2 with clean details
UPDATE public.branches
SET 
    type = 'BOUTIQUE',
    street_address = '18, Cross Cut Road, Gandhipuram',
    city = 'Coimbatore',
    state = 'Tamil Nadu',
    pin_code = '641012',
    phone = '+91 93440 75887',
    whatsapp = '+91 93440 75887',
    email = 'branch2@sivacouture.com',
    active = TRUE,
    is_headquarters = FALSE,
    working_hours = 'Mon-Sat 10:00-20:30'
WHERE id = 'fbe87ed3-7f27-4871-8b25-78886e6fdb48';

-- Insert siva Flagship Atelier (HQ)
INSERT INTO public.branches (
    id, company_id, branch_code, name, type, street_address, city, state, pin_code,
    country, phone, whatsapp, email, is_headquarters, active, working_hours
) VALUES (
    'b2000000-0000-0000-0000-000000000002',
    '561d805a-f26c-4f88-9b3f-06b286226194',
    'BRN-002',
    'siva Flagship Atelier',
    'FLAGSHIP',
    '42, Race Course Road, Gopalapuram',
    'Coimbatore',
    'Tamil Nadu',
    '641018',
    'India',
    '+91 93440 75888',
    '+91 93440 75888',
    'flagship@sivacouture.com',
    TRUE,
    TRUE,
    'Mon-Sat 10:00-21:00'
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    branch_code = EXCLUDED.branch_code,
    is_headquarters = TRUE,
    active = TRUE;

-- ------------------------------------------------------------------------------
-- 3. EMPLOYEES (6 SPECIALISTS FOR SIVA COUTURE)
-- ------------------------------------------------------------------------------
INSERT INTO public.employees (
    id, company_id, employee_code, name, phone, email, role, status, joined_date, specialization
) VALUES
('e1000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', 'EMP-SIV-001', 'Rajesh Kumar', '+91 98401 11001', 'rajesh@sivacouture.com', 'TAILOR', 'ACTIVE', '2024-01-15', 'Master Pattern Maker & Royal Sherwani Tailor'),
('e1000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', 'EMP-SIV-002', 'Ananya Sharma', '+91 98401 11002', 'ananya@sivacouture.com', 'DESIGNER', 'ACTIVE', '2024-03-01', 'Lead Haute Couture Bridal Stylist'),
('e1000000-0000-0000-0000-000000000003', '561d805a-f26c-4f88-9b3f-06b286226194', 'EMP-SIV-003', 'Mohammed Farooq', '+91 98401 11003', 'farooq@sivacouture.com', 'EMBROIDERER', 'ACTIVE', '2024-02-10', 'Senior Zardozi, Gota Patti & Dabka Artisan'),
('e1000000-0000-0000-0000-000000000004', '561d805a-f26c-4f88-9b3f-06b286226194', 'EMP-SIV-004', 'Priya Sundaram', '+91 98401 11004', 'priya@sivacouture.com', 'SUPERVISOR', 'ACTIVE', '2024-04-15', 'Fitting Trial & Quality Control Specialist'),
('e1000000-0000-0000-0000-000000000005', '561d805a-f26c-4f88-9b3f-06b286226194', 'EMP-SIV-005', 'Karthik Raman', '+91 98401 11005', 'karthik@sivacouture.com', 'CUTTER', 'ACTIVE', '2024-05-01', 'Precision Fabric Cutter & Draping Specialist'),
('e1000000-0000-0000-0000-000000000006', '561d805a-f26c-4f88-9b3f-06b286226194', 'EMP-SIV-006', 'Meera Nambiar', '+91 98401 11006', 'meera@sivacouture.com', 'STAFF', 'ACTIVE', '2024-06-01', 'Client Concierge & VIP Appointments Manager')
ON CONFLICT (employee_code) DO UPDATE SET name = EXCLUDED.name, specialization = EXCLUDED.specialization;

-- ------------------------------------------------------------------------------
-- 4. COLLECTIONS (2 LUXURY COLLECTIONS)
-- ------------------------------------------------------------------------------
INSERT INTO public.collections (
    id, company_id, code, name, subtitle, description, season, year, status, designer, branch, is_featured, progress_percentage
) VALUES
('c1000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', 'COL-SIV-01', 'Varanasi Heritage 2026', 'Regal Zari & Pure Silk Bridal Haute Couture', 'Heirloom Kanjeevaram and Banarasi bridal ensembles handcrafted with authentic gold and antique zari work.', 'Autumn / Winter 2026', 2026, 'ACTIVE', 'Ananya Sharma', 'siva 2', TRUE, 85),
('c1000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', 'COL-SIV-02', 'Aura of Silk & Pastels', 'Modern Bespoke Tailoring in Soft Tones', 'Pastel organza anarkalis, raw silk bandhgalas, and sculpted draped lehengas for high-society weddings.', 'Spring / Summer 2026', 2026, 'ACTIVE', 'Ananya Sharma', 'siva Flagship Atelier', TRUE, 70)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 5. CUSTOMERS (8 LUXURY BESPOKE CLIENTS)
-- ------------------------------------------------------------------------------
INSERT INTO public.customers (
    mobile_number, company_id, name, first_name, last_name, salutation, gender,
    email, tier, total_spend, balance, location, street_address, city, state, pincode,
    favorite_garment, measurements_on_file, fit_preference, branch
) VALUES
('+91 98401 54321', '561d805a-f26c-4f88-9b3f-06b286226194', 'Kavya Sree S', 'Kavya Sree', 'S', 'Ms.', 'Female', 'kavyasree@gmail.com', 'VIP_GOLD', 167000.00, 52000.00, 'R.S. Puram, Coimbatore', '24, West Club Road, R.S. Puram', 'Coimbatore', 'Tamil Nadu', '641002', 'Zari Bloom Bridal Lehenga', TRUE, 'Tailored Snug Fit', 'siva 2'),
('+91 98402 67890', '561d805a-f26c-4f88-9b3f-06b286226194', 'Sivasurya S', 'Sivasurya', 'S', 'Mr.', 'Male', 'sivasurya.official.8@gmail.com', 'VIP_PLATINUM', 220000.00, 30000.00, 'Race Course, Coimbatore', '42, Race Course Road', 'Coimbatore', 'Tamil Nadu', '641018', 'Royal Raw Silk Sherwani', TRUE, 'Italian Structured Fit', 'siva Flagship Atelier'),
('+91 98403 11223', '561d805a-f26c-4f88-9b3f-06b286226194', 'Dr. Radhika Menon', 'Radhika', 'Menon', 'Dr.', 'Female', 'dr.radhika.menon@hospital.org', 'VIP_GOLD', 95000.00, 9000.00, 'Peelamedu, Coimbatore', '102, Avinashi Road, Peelamedu', 'Coimbatore', 'Tamil Nadu', '641004', 'Temple Silk Blouse with Cutwork', TRUE, 'Comfort Classical Fit', 'siva 2'),
('+91 98404 22334', '561d805a-f26c-4f88-9b3f-06b286226194', 'Vikramaditya Varma', 'Vikramaditya', 'Varma', 'Mr.', 'Male', 'vikram.varma@industries.in', 'VIP', 116000.00, 23000.00, 'Saibaba Colony, Coimbatore', '15, Alagesan Road, Saibaba Colony', 'Coimbatore', 'Tamil Nadu', '641011', 'Italian Wool Jodhpuri Bandhgala', TRUE, 'Athletic Structured Fit', 'siva Flagship Atelier'),
('+91 98405 33445', '561d805a-f26c-4f88-9b3f-06b286226194', 'Deepa Subramanian', 'Deepa', 'Subramanian', 'Mrs.', 'Female', 'deepa.subramanian@gmail.com', 'VIP', 84000.00, 19000.00, 'Gandhipuram, Coimbatore', '89, 7th Street, Gandhipuram', 'Coimbatore', 'Tamil Nadu', '641012', 'Rose Gold Tissue Anarkali', TRUE, 'Relaxed Elegant Fit', 'siva 2'),
('+91 98406 44556', '561d805a-f26c-4f88-9b3f-06b286226194', 'Arvind Swaminathan', 'Arvind', 'Swaminathan', 'Mr.', 'Male', 'arvind.swami@techcorp.com', 'REGULAR', 52000.00, 12000.00, 'Town Hall, Coimbatore', '31, Big Bazaar Street, Town Hall', 'Coimbatore', 'Tamil Nadu', '641001', 'Bespoke Silk Kurta Set', TRUE, 'Modern Regular Fit', 'siva 2'),
('+91 98407 55667', '561d805a-f26c-4f88-9b3f-06b286226194', 'Nithya Lakshmi K', 'Nithya Lakshmi', 'K', 'Ms.', 'Female', 'nithya.lakshmi@designstudio.com', 'REGULAR', 42000.00, 12000.00, 'Ramanathapuram, Coimbatore', '56, Trichy Road, Ramanathapuram', 'Coimbatore', 'Tamil Nadu', '641045', 'Pleated Organza Reception Gown', TRUE, 'Sculpted Bodice Fit', 'siva 2'),
('+91 98408 66778', '561d805a-f26c-4f88-9b3f-06b286226194', 'Gautham Chandran', 'Gautham', 'Chandran', 'Mr.', 'Male', 'gautham.c@financegroup.com', 'REGULAR', 25000.00, 0.00, 'Vadavalli, Coimbatore', '7, Maruthamalai Main Road, Vadavalli', 'Coimbatore', 'Tamil Nadu', '641046', 'Tussar Silk Bandi Jacket', FALSE, 'Regular Classic Fit', 'siva 2'),
('+91 99628 44110', '561d805a-f26c-4f88-9b3f-06b286226194', 'Kavya Nair', 'Kavya', 'Nair', 'Ms.', 'Female', 'kavya.nair@gmail.com', 'VIP_PLATINUM', 85000.00, 0.00, 'Chennai, Tamil Nadu', '12, Poes Garden', 'Chennai', 'Tamil Nadu', '600086', 'Blouse', TRUE, 'Comfort / Regular Fit', 'Main Branch'),
('+91 98401 23456', '561d805a-f26c-4f88-9b3f-06b286226194', 'Priya Sharma', 'Priya', 'Sharma', 'Ms.', 'Female', 'priya.sharma@gmail.com', 'REGULAR', 65000.00, 0.00, 'T. Nagar, Chennai', '45, Usman Road', 'Chennai', 'Tamil Nadu', '600017', 'Lehenga', TRUE, 'Comfort / Regular Fit', 'Main Branch'),
('+91 98765 43210', '561d805a-f26c-4f88-9b3f-06b286226194', 'Radhika Iyer', 'Radhika', 'Iyer', 'Mrs.', 'Female', 'radhika.iyer@gmail.com', 'VIP_GOLD', 92000.00, 0.00, 'Adyar, Chennai', '8, Gandhi Nagar', 'Chennai', 'Tamil Nadu', '600020', 'Chudi Set', TRUE, 'Slim Fit', 'Main Branch'),
('+91 99400 88776', '561d805a-f26c-4f88-9b3f-06b286226194', 'Sneha Reddy', 'Sneha', 'Reddy', 'Ms.', 'Female', 'sneha.reddy@gmail.com', 'REGULAR', 48000.00, 0.00, 'Alwarpet, Chennai', '19, TTK Road', 'Chennai', 'Tamil Nadu', '600018', 'Saree', TRUE, 'Tailored Fit', 'Main Branch'),
('+91 98840 55667', '561d805a-f26c-4f88-9b3f-06b286226194', 'Divya Raj', 'Divya', 'Raj', 'Mrs.', 'Female', 'divya.raj@gmail.com', 'VIP_GOLD', 74000.00, 0.00, 'Anna Nagar, Chennai', '34, 2nd Avenue', 'Chennai', 'Tamil Nadu', '600040', 'Blouse', TRUE, 'Comfort Fit', 'Main Branch'),
('+91 97909 22331', '561d805a-f26c-4f88-9b3f-06b286226194', 'Meera Pillai', 'Meera', 'Pillai', 'Ms.', 'Female', 'meera.pillai@gmail.com', 'REGULAR', 56000.00, 0.00, 'Nungambakkam, Chennai', '21, College Road', 'Chennai', 'Tamil Nadu', '600034', 'Gown', TRUE, 'Standard Fit', 'Main Branch'),
('+91 99411 77889', '561d805a-f26c-4f88-9b3f-06b286226194', 'Anitha Raj', 'Anitha', 'Raj', 'Mrs.', 'Female', 'anitha.raj@gmail.com', 'VIP_PLATINUM', 115000.00, 0.00, 'Besant Nagar, Chennai', '5, 4th Main Road', 'Chennai', 'Tamil Nadu', '600090', 'Lehenga', TRUE, 'Comfort Fit', 'Main Branch'),
('+91 98410 99881', '561d805a-f26c-4f88-9b3f-06b286226194', 'Neha Bhat', 'Neha', 'Bhat', 'Ms.', 'Female', 'neha.bhat@gmail.com', 'REGULAR', 39000.00, 0.00, 'Kilpauk, Chennai', '14, Ormes Road', 'Chennai', 'Tamil Nadu', '600010', 'Chudi Set', TRUE, 'Relaxed Fit', 'Main Branch'),
('+91 98845 11224', '561d805a-f26c-4f88-9b3f-06b286226194', 'Swathi Krishna', 'Swathi', 'Krishna', 'Ms.', 'Female', 'swathi.k@gmail.com', 'REGULAR', 42000.00, 0.00, 'Velachery, Chennai', '67, Bypass Road', 'Chennai', 'Tamil Nadu', '600042', 'Anarkali', TRUE, 'Standard Fit', 'Main Branch'),
('+91 99620 44556', '561d805a-f26c-4f88-9b3f-06b286226194', 'Pooja Hegde', 'Pooja', 'Hegde', 'Ms.', 'Female', 'pooja.h@gmail.com', 'VIP_GOLD', 68000.00, 0.00, 'Mylapore, Chennai', '28, Luz Church Road', 'Chennai', 'Tamil Nadu', '600004', 'Kurti Set', TRUE, 'Standard Fit', 'Main Branch'),
('+91 98402 77889', '561d805a-f26c-4f88-9b3f-06b286226194', 'Ritu Varma', 'Ritu', 'Varma', 'Ms.', 'Female', 'ritu.v@gmail.com', 'REGULAR', 51000.00, 0.00, 'Chetpet, Chennai', '9, Harrington Road', 'Chennai', 'Tamil Nadu', '600031', 'Saree Blouse', TRUE, 'Comfort Fit', 'Main Branch'),
('+91 97891 33442', '561d805a-f26c-4f88-9b3f-06b286226194', 'Deepa Mohan', 'Deepa', 'Mohan', 'Mrs.', 'Female', 'deepa.m@gmail.com', 'REGULAR', 34000.00, 0.00, 'Guindy, Chennai', '41, GST Road', 'Chennai', 'Tamil Nadu', '600032', 'Gown', TRUE, 'Regular Fit', 'Main Branch')
ON CONFLICT (mobile_number) DO UPDATE SET 
    name = EXCLUDED.name, 
    total_spend = EXCLUDED.total_spend,
    balance = EXCLUDED.balance,
    branch = EXCLUDED.branch;

-- ------------------------------------------------------------------------------
-- 6. COMPLETE ANTHROPOMETRIC MEASUREMENTS (BODY MEASUREMENTS TABLE)
-- ------------------------------------------------------------------------------
INSERT INTO public.customer_body_measurements (
    id, company_id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit,
    shoulder, bust, under_bust, waist, hip, blouse_length, top_length, full_length, skirt_length, pant_length,
    armhole, sleeve_length, sleeve_round, elbow_round, wrist_round, front_neck_depth, back_neck_depth, bust_point, recorded_by
) VALUES
(
    'ba000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', '+91 98401 54321', 'Kavya Sree S', 'Lehenga', 'CURRENT', TRUE, 1, 'in',
    15.00, 36.00, 31.00, 29.00, 39.00, 14.50, 26.00, 52.00, 42.00, 38.00,
    16.50, 22.00, 11.50, 10.50, 6.50, 7.50, 10.00, 9.50, 'Rajesh Kumar'
),
(
    'ba000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', '+91 98402 67890', 'Sivasurya S', 'Sherwani', 'CURRENT', TRUE, 1, 'in',
    18.00, 40.00, 36.50, 33.00, 41.00, 0.00, 30.50, 44.00, 0.00, 41.50,
    19.00, 25.50, 14.50, 12.50, 9.50, 0.00, 0.00, 0.00, 'Rajesh Kumar'
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. MEASUREMENT PROFILES (TEMPLATES)
-- ------------------------------------------------------------------------------
INSERT INTO public.measurement_profiles (
    id, company_id, customer_mobile, garment_type, notes, recorded_by, branch
) VALUES
('bb000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', '+91 98401 54321', 'Blouse', 'Sweetheart neck 7.5", back sheer deep D-neck 10", padded with 34B cups', 'Rajesh Kumar', 'siva 2'),
('bb000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', '+91 98401 54321', 'Lehenga', '42 kalis, 4.5m flare, double can-can skirt lining with waist anchorage 29"', 'Rajesh Kumar', 'siva 2'),
('bb000000-0000-0000-0000-000000000003', '561d805a-f26c-4f88-9b3f-06b286226194', '+91 98402 67890', 'Bandhgala', 'Mandarin stand collar 1.75", horsehair chest canvas, working surgeon cuffs', 'Rajesh Kumar', 'siva Flagship Atelier'),
('bb000000-0000-0000-0000-000000000004', '561d805a-f26c-4f88-9b3f-06b286226194', '+91 98402 67890', 'Sherwani', 'Full front concealed placket, 44" coat length, churidar inseam 31.5"', 'Rajesh Kumar', 'siva Flagship Atelier')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 8. DESIGNS (6 COUTURE DESIGN RECORDS)
-- ------------------------------------------------------------------------------
INSERT INTO public.designs (
    id, company_id, design_code, title, garment_type, status, designer,
    primary_fabric, estimated_cost, suggested_price, occasion, collection
) VALUES
('d1000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', 'DES-SIV-001', 'Zari Bloom Bridal Lehenga', 'Lehenga', 'Active', 'Ananya Sharma', 'Kanjeevaram Mulberry Raw Silk', 42000.00, 95000.00, 'Bridal Wedding', 'Varanasi Heritage 2026'),
('d1000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', 'DES-SIV-002', 'Heritage Jodhpuri Bandhgala', 'Bandhgala', 'Active', 'Rajesh Kumar', 'Italian Super 120s Wool & Velvet Collar', 22000.00, 48000.00, 'Reception / Cocktail', 'Varanasi Heritage 2026'),
('d1000000-0000-0000-0000-000000000003', '561d805a-f26c-4f88-9b3f-06b286226194', 'DES-SIV-004', 'Rose Gold Tissue Anarkali', 'Anarkali', 'Active', 'Ananya Sharma', 'Pure Organza Tissue with Gota Patti', 24000.00, 54000.00, 'Sangeet / Mehendi', 'Aura of Silk & Pastels'),
('d1000000-0000-0000-0000-000000000004', '561d805a-f26c-4f88-9b3f-06b286226194', 'DES-SIV-003', 'Mulberry Raw Silk Sherwani', 'Sherwani', 'Active', 'Rajesh Kumar', 'Heavy Matka Raw Silk with Pearl Work', 48000.00, 110000.00, 'Royal Wedding Groom', 'Varanasi Heritage 2026'),
('d1000000-0000-0000-0000-000000000005', '561d805a-f26c-4f88-9b3f-06b286226194', 'DES-SIV-005', 'Temple Silk Blouse with Cutwork', 'Blouse', 'Active', 'Ananya Sharma', 'Emerald Kanjeevaram Silk with Maggam Work', 9000.00, 24000.00, 'Temple Wedding / Muhurtham', 'Varanasi Heritage 2026'),
('d1000000-0000-0000-0000-000000000006', '561d805a-f26c-4f88-9b3f-06b286226194', 'DES-SIV-006', 'Pleated Organza Reception Gown', 'Gown', 'Active', 'Ananya Sharma', 'Sculpted Duchesse Satin & Organza', 18000.00, 42000.00, 'Reception Gala', 'Aura of Silk & Pastels')
ON CONFLICT (design_code) DO UPDATE SET title = EXCLUDED.title, suggested_price = EXCLUDED.suggested_price;

-- ------------------------------------------------------------------------------
-- 9. ORDERS (10 ORDERS: 6 FOR "siva 2", 4 FOR "siva Flagship Atelier")
-- ------------------------------------------------------------------------------
INSERT INTO public.orders (
    id, company_id, order_code, garment_type, garment_desc, collection,
    customer_mobile, customer_name, amount, total_amount, advance_paid, balance_amount,
    status, current_stage, order_date, expected_delivery_date, branch
) VALUES
-- --- siva 2 Orders (6) ---
('cc000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', 'ORD-SIV-101', 'Bridal Lehenga', 'Zari Bloom Crimson Bridal Lehenga with heavy lotus motifs', 'Varanasi Heritage 2026', '+91 98401 54321', 'Kavya Sree S', 95000.00, 95000.00, 65000.00, 30000.00, 'IN_PRODUCTION', 'Stitching', CURRENT_DATE - 12, CURRENT_DATE + 8, 'siva 2'),
('cc000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', 'ORD-SIV-102', 'Silk Blouse', 'Emerald Kanjeevaram Temple Cutwork Blouse with antique pearl tassels', 'Varanasi Heritage 2026', '+91 98403 11223', 'Dr. Radhika Menon', 24000.00, 24000.00, 15000.00, 9000.00, 'IN_PRODUCTION', 'Hand Embroidery', CURRENT_DATE - 8, CURRENT_DATE + 5, 'siva 2'),
('cc000000-0000-0000-0000-000000000003', '561d805a-f26c-4f88-9b3f-06b286226194', 'ORD-SIV-103', 'Tissue Anarkali', '24-Kali Rose Gold Organza Tissue Anarkali with dupatta', 'Aura of Silk & Pastels', '+91 98405 33445', 'Deepa Subramanian', 54000.00, 54000.00, 35000.00, 19000.00, 'IN_PRODUCTION', 'Trial', CURRENT_DATE - 14, CURRENT_DATE + 3, 'siva 2'),
('cc000000-0000-0000-0000-000000000004', '561d805a-f26c-4f88-9b3f-06b286226194', 'ORD-SIV-104', 'Silk Kurta Set', 'Charcoal Mulberry Raw Silk Kurta with churidar & stole', 'Varanasi Heritage 2026', '+91 98406 44556', 'Arvind Swaminathan', 32000.00, 32000.00, 20000.00, 12000.00, 'IN_PRODUCTION', 'QC', CURRENT_DATE - 18, CURRENT_DATE + 2, 'siva 2'),
('cc000000-0000-0000-0000-000000000005', '561d805a-f26c-4f88-9b3f-06b286226194', 'ORD-SIV-105', 'Reception Gown', 'Lavender Sculpted Duchesse Satin & Organza Reception Gown', 'Aura of Silk & Pastels', '+91 98407 55667', 'Nithya Lakshmi K', 42000.00, 42000.00, 30000.00, 12000.00, 'READY', 'Ready to Deliver', CURRENT_DATE - 22, CURRENT_DATE + 1, 'siva 2'),
('cc000000-0000-0000-0000-000000000006', '561d805a-f26c-4f88-9b3f-06b286226194', 'ORD-SIV-106', 'Bandi Jacket', 'Tussar Silk Waistcoat with horn buttons and satin lining', 'Varanasi Heritage 2026', '+91 98408 66778', 'Gautham Chandran', 25000.00, 25000.00, 25000.00, 0.00, 'DELIVERED', 'Delivered', CURRENT_DATE - 28, CURRENT_DATE - 4, 'siva 2'),

-- --- siva Flagship Atelier Orders (4) ---
('cc000000-0000-0000-0000-000000000007', '561d805a-f26c-4f88-9b3f-06b286226194', 'ORD-SIV-107', 'Royal Sherwani', 'Ivory Matka Raw Silk Sherwani with handcrafted zardozi yoke & pearl buttons', 'Varanasi Heritage 2026', '+91 98402 67890', 'Sivasurya S', 110000.00, 110000.00, 80000.00, 30000.00, 'IN_PRODUCTION', 'Hand Embroidery', CURRENT_DATE - 10, CURRENT_DATE + 12, 'siva Flagship Atelier'),
('cc000000-0000-0000-0000-000000000008', '561d805a-f26c-4f88-9b3f-06b286226194', 'ORD-SIV-108', 'Jodhpuri Bandhgala', 'Midnight Blue Italian Super 120s Wool Bandhgala Coat & Trousers', 'Varanasi Heritage 2026', '+91 98404 22334', 'Vikramaditya Varma', 68000.00, 68000.00, 45000.00, 23000.00, 'IN_PRODUCTION', 'Trial', CURRENT_DATE - 15, CURRENT_DATE + 4, 'siva Flagship Atelier'),
('cc000000-0000-0000-0000-000000000009', '561d805a-f26c-4f88-9b3f-06b286226194', 'ORD-SIV-109', 'Sangeet Kalidar Gown', 'Emerald Green Brocade Flared Kalidar with sheer organza sleeves', 'Varanasi Heritage 2026', '+91 98401 54321', 'Kavya Sree S', 72000.00, 72000.00, 50000.00, 22000.00, 'IN_PRODUCTION', 'Cutting', CURRENT_DATE - 6, CURRENT_DATE + 15, 'siva Flagship Atelier'),
('cc000000-0000-0000-0000-000000000010', '561d805a-f26c-4f88-9b3f-06b286226194', 'ORD-SIV-110', 'Kurta & Stole', 'Handwoven Tussar Silk Kurta with tissue zari stole', 'Aura of Silk & Pastels', '+91 98402 67890', 'Sivasurya S', 35000.00, 35000.00, 35000.00, 0.00, 'READY', 'Ready to Deliver', CURRENT_DATE - 20, CURRENT_DATE + 1, 'siva Flagship Atelier')
ON CONFLICT (order_code) DO UPDATE SET 
    customer_name = EXCLUDED.customer_name,
    total_amount = EXCLUDED.total_amount,
    status = EXCLUDED.status,
    branch = EXCLUDED.branch;

-- ------------------------------------------------------------------------------
-- 10. GARMENTS (10 GARMENT TRACKER ITEMS)
-- ------------------------------------------------------------------------------
INSERT INTO public.garments (
    id, company_id, garment_code, order_id, order_code, customer_name, customer_mobile,
    title, garment_type, specs, production_stage, material_status, priority, payment_status,
    paid_amount, total_amount, status, assigned_to, designer, branch, due_date
) VALUES
('dd000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', 'GAR-SIV-001', 'cc000000-0000-0000-0000-000000000001', 'ORD-SIV-101', 'Kavya Sree S', '+91 98401 54321', 'Crimson Bridal Lehenga Ensemble', 'Bridal Lehenga', '42 kalis, can-can lining, lotus gold zardozi embroidery', 'STITCHING', 'READY', 'HIGH', 'PARTIAL', 65000.00, 95000.00, 'IN_PRODUCTION', 'Rajesh Kumar', 'Ananya Sharma', 'siva 2', CURRENT_DATE + 8),
('dd000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', 'GAR-SIV-002', 'cc000000-0000-0000-0000-000000000002', 'ORD-SIV-102', 'Dr. Radhika Menon', '+91 98403 11223', 'Emerald Temple Cutwork Blouse', 'Silk Blouse', 'Sweetheart neck with pearl moti borders and hand cutwork back', 'EMBROIDERY', 'READY', 'NORMAL', 'PARTIAL', 15000.00, 24000.00, 'IN_PRODUCTION', 'Mohammed Farooq', 'Ananya Sharma', 'siva 2', CURRENT_DATE + 5),
('dd000000-0000-0000-0000-000000000003', '561d805a-f26c-4f88-9b3f-06b286226194', 'GAR-SIV-003', 'cc000000-0000-0000-0000-000000000003', 'ORD-SIV-103', 'Deepa Subramanian', '+91 98405 33445', 'Rose Gold Tissue Anarkali Set', 'Tissue Anarkali', '24-kali flared organza tissue with gota border and churidar', 'TRIAL', 'READY', 'NORMAL', 'PARTIAL', 35000.00, 54000.00, 'IN_PRODUCTION', 'Rajesh Kumar', 'Ananya Sharma', 'siva 2', CURRENT_DATE + 3),
('dd000000-0000-0000-0000-000000000004', '561d805a-f26c-4f88-9b3f-06b286226194', 'GAR-SIV-004', 'cc000000-0000-0000-0000-000000000004', 'ORD-SIV-104', 'Arvind Swaminathan', '+91 98406 44556', 'Charcoal Silk Kurta & Stole', 'Silk Kurta Set', 'Mandarin collar kurta with antique button studs and silk stole', 'QC', 'READY', 'NORMAL', 'PARTIAL', 20000.00, 32000.00, 'IN_PRODUCTION', 'Priya Sundaram', 'Rajesh Kumar', 'siva 2', CURRENT_DATE + 2),
('dd000000-0000-0000-0000-000000000005', '561d805a-f26c-4f88-9b3f-06b286226194', 'GAR-SIV-005', 'cc000000-0000-0000-0000-000000000005', 'ORD-SIV-105', 'Nithya Lakshmi K', '+91 98407 55667', 'Lavender Sculpted Reception Gown', 'Reception Gown', 'Duchesse satin corset with pleated organza drape', 'READY', 'READY', 'HIGH', 'PARTIAL', 30000.00, 42000.00, 'READY_FOR_DELIVERY', 'Priya Sundaram', 'Ananya Sharma', 'siva 2', CURRENT_DATE + 1),
('dd000000-0000-0000-0000-000000000006', '561d805a-f26c-4f88-9b3f-06b286226194', 'GAR-SIV-006', 'cc000000-0000-0000-0000-000000000006', 'ORD-SIV-106', 'Gautham Chandran', '+91 98408 66778', 'Tussar Silk Bandi Waistcoat', 'Bandi Jacket', 'Nehru collar silk waistcoat with horn buttons and cupro lining', 'DELIVERED', 'READY', 'NORMAL', 'PAID', 25000.00, 25000.00, 'DELIVERED', 'Rajesh Kumar', 'Rajesh Kumar', 'siva 2', CURRENT_DATE - 4),

('dd000000-0000-0000-0000-000000000007', '561d805a-f26c-4f88-9b3f-06b286226194', 'GAR-SIV-007', 'cc000000-0000-0000-0000-000000000007', 'ORD-SIV-107', 'Sivasurya S', '+91 98402 67890', 'Ivory Imperial Raw Silk Sherwani', 'Royal Sherwani', 'Full chest hand zardozi yoke, custom SS monogram, pearl buttons', 'EMBROIDERY', 'READY', 'HIGH', 'PARTIAL', 80000.00, 110000.00, 'IN_PRODUCTION', 'Mohammed Farooq', 'Rajesh Kumar', 'siva Flagship Atelier', CURRENT_DATE + 12),
('dd000000-0000-0000-0000-000000000008', '561d805a-f26c-4f88-9b3f-06b286226194', 'GAR-SIV-008', 'cc000000-0000-0000-0000-000000000008', 'ORD-SIV-108', 'Vikramaditya Varma', '+91 98404 22334', 'Midnight Blue Italian Bandhgala', 'Jodhpuri Bandhgala', 'Super 120s Italian wool, hand-canvassed chest, velvet collar', 'TRIAL', 'READY', 'NORMAL', 'PARTIAL', 45000.00, 68000.00, 'IN_PRODUCTION', 'Rajesh Kumar', 'Rajesh Kumar', 'siva Flagship Atelier', CURRENT_DATE + 4),
('dd000000-0000-0000-0000-000000000009', '561d805a-f26c-4f88-9b3f-06b286226194', 'GAR-SIV-009', 'cc000000-0000-0000-0000-000000000009', 'ORD-SIV-109', 'Kavya Sree S', '+91 98401 54321', 'Emerald Flared Kalidar Gown', 'Sangeet Kalidar Gown', '48 kalis Banarasi brocade with sheer organza balloon sleeves', 'CUTTING', 'READY', 'HIGH', 'PARTIAL', 50000.00, 72000.00, 'IN_PRODUCTION', 'Karthik Raman', 'Ananya Sharma', 'siva Flagship Atelier', CURRENT_DATE + 15),
('dd000000-0000-0000-0000-000000000010', '561d805a-f26c-4f88-9b3f-06b286226194', 'GAR-SIV-010', 'cc000000-0000-0000-0000-000000000010', 'ORD-SIV-110', 'Sivasurya S', '+91 98402 67890', 'Handwoven Tussar Kurta & Stole', 'Kurta & Stole', 'Pure Tussar silk with gold tissue border and tailored churidar', 'READY', 'READY', 'NORMAL', 'PAID', 35000.00, 35000.00, 'READY_FOR_DELIVERY', 'Priya Sundaram', 'Rajesh Kumar', 'siva Flagship Atelier', CURRENT_DATE + 1)
ON CONFLICT (garment_code) DO UPDATE SET 
    customer_name = EXCLUDED.customer_name,
    production_stage = EXCLUDED.production_stage,
    status = EXCLUDED.status,
    branch = EXCLUDED.branch;

-- ------------------------------------------------------------------------------
-- 11. FITTING TRIALS & ALTERATIONS (5 TRIALS ACROSS BOTH BRANCHES)
-- ------------------------------------------------------------------------------
INSERT INTO public.trials (
    id, company_id, trial_code, order_id, order_code, customer_mobile, customer_name,
    garment_type, collection, trial_date, trial_time, stage, status, fit_status,
    designer_name, delivery_date, branch
) VALUES
('ee000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', 'TRL-SIV-001', 'cc000000-0000-0000-0000-000000000003', 'ORD-SIV-103', '+91 98405 33445', 'Deepa Subramanian', 'Tissue Anarkali', 'Aura of Silk & Pastels', CURRENT_DATE, '11:30 AM', 'First Trial', 'TODAY', 'ALTERATION_NEEDED', 'Ananya Sharma', CURRENT_DATE + 3, 'siva 2'),
('ee000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', 'TRL-SIV-002', 'cc000000-0000-0000-0000-000000000008', 'ORD-SIV-108', '+91 98404 22334', 'Vikramaditya Varma', 'Jodhpuri Bandhgala', 'Varanasi Heritage 2026', CURRENT_DATE + 1, '03:00 PM', 'First Trial', 'SCHEDULED', 'PENDING', 'Rajesh Kumar', CURRENT_DATE + 4, 'siva Flagship Atelier'),
('ee000000-0000-0000-0000-000000000003', '561d805a-f26c-4f88-9b3f-06b286226194', 'TRL-SIV-003', 'cc000000-0000-0000-0000-000000000001', 'ORD-SIV-101', '+91 98401 54321', 'Kavya Sree S', 'Bridal Lehenga', 'Varanasi Heritage 2026', CURRENT_DATE + 3, '04:30 PM', 'Second Trial', 'SCHEDULED', 'PENDING', 'Ananya Sharma', CURRENT_DATE + 8, 'siva 2'),
('ee000000-0000-0000-0000-000000000004', '561d805a-f26c-4f88-9b3f-06b286226194', 'TRL-SIV-004', 'cc000000-0000-0000-0000-000000000005', 'ORD-SIV-105', '+91 98407 55667', 'Nithya Lakshmi K', 'Reception Gown', 'Aura of Silk & Pastels', CURRENT_DATE - 3, '02:00 PM', 'Final Fitting', 'COMPLETED', 'APPROVED', 'Ananya Sharma', CURRENT_DATE + 1, 'siva 2'),
('ee000000-0000-0000-0000-000000000005', '561d805a-f26c-4f88-9b3f-06b286226194', 'TRL-SIV-005', 'cc000000-0000-0000-0000-000000000010', 'ORD-SIV-110', '+91 98402 67890', 'Sivasurya S', 'Kurta & Stole', 'Aura of Silk & Pastels', CURRENT_DATE - 5, '05:00 PM', 'First Trial', 'COMPLETED', 'APPROVED', 'Rajesh Kumar', CURRENT_DATE + 1, 'siva Flagship Atelier')
ON CONFLICT (trial_code) DO UPDATE SET 
    fit_status = EXCLUDED.fit_status,
    status = EXCLUDED.status,
    branch = EXCLUDED.branch;

-- Alteration checkpoint record for TRL-SIV-001
INSERT INTO public.trial_alterations (
    id, company_id, trial_id, description, category, completed, assigned_tailor, priority, status, target_date, tailor_notes
) VALUES
('ea000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', 'ee000000-0000-0000-0000-000000000001', 'Take in bodice natural waist side seams by 0.5 inch', 'Fit', FALSE, 'Rajesh Kumar', 'Normal', 'PENDING', CURRENT_DATE + 2, 'Contour side seams equally by 0.25 in on both left and right'),
('ea000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', 'ee000000-0000-0000-0000-000000000001', 'Shorten front hemline by 0.75 inch for heel clearance', 'Length', FALSE, 'Karthik Raman', 'Normal', 'PENDING', CURRENT_DATE + 2, 'Even out front flare for 2.5-inch footwear clearance')
ON CONFLICT (id) DO NOTHING;

-- 12 SHOWROOM TRIALS (MAIN BRANCH)
INSERT INTO public.trials (
    id, company_id, branch, trial_code, order_code, customer_mobile, customer_name,
    garment_type, collection, trial_date, trial_time, stage, status, fit_status,
    designer_name, delivery_date, neck_style, sleeve_style, lining, embroidery, fabric,
    spec_notes, notes, trial_attempt, alteration_count, customer_feedback, customer_rating,
    fit_preference, fit_checkpoints, next_trial_date
) VALUES
('e0000000-0000-0000-0000-000000000528', '561d805a-f26c-4f88-9b3f-06b286226194', 'Main Branch', 'TRL-2026-0528', 'ORD-2026-0528', '+91 99628 44110', 'Kavya Nair', 'Blouse', 'Heritage Bridal Silk', '2026-09-08', '11:00 AM', 'Trial', 'TODAY', 'PERFECT', 'Sneha', '2026-09-22', 'Round (Front), Deep Back', '3/4 Sleeve', 'Silk', 'Zardozi Work', 'Customer Supplied (Silk - Dusty Pink)', 'Handle with care. Customer prefers subtle embroidery.', 'Customer prefers a slightly tighter fit at bust. Maintain the same embroidery pattern.', 1, 4, 'Customer loves the embroidery work and overall structure.', 5, 'Comfort / Regular Fit', '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"PERFECT","Sleeves":"PERFECT","Total Length":"PERFECT"}', '2026-09-18'),
('e0000000-0000-0000-0000-000000000519', '561d805a-f26c-4f88-9b3f-06b286226194', 'Main Branch', 'TRL-2026-0519', 'ORD-2026-0519', '+91 98401 23456', 'Priya Sharma', 'Lehenga', 'Royal Zardozi Festive', '2026-09-08', '12:30 PM', 'Trial', 'TODAY', 'MINOR', 'Sneha', '2026-09-24', 'Sweetheart Neck', 'Elbow Length', 'Cotton Silk', 'Aari & Gota Patti', 'Organza & Silk Brocade', 'Double cancan skirt layer requested.', 'Check heel height before final hem cut.', 1, 2, 'Fabric flare is excellent, needs waist easing.', 5, 'Comfort / Regular Fit', '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"PERFECT","Sleeves":"PERFECT","Total Length":"PERFECT"}', '2026-09-18'),
('e0000000-0000-0000-0000-000000000521', '561d805a-f26c-4f88-9b3f-06b286226194', 'Main Branch', 'TRL-2026-0521', 'ORD-2026-0521', '+91 98765 43210', 'Radhika Iyer', 'Chudi Set', 'Atelier Contemporary', '2026-09-09', '10:00 AM', 'Trial', 'UPCOMING', 'PERFECT', 'Meenakshi', '2026-09-25', 'Boat Neck', 'Full Sleeves', 'Mulmul Cotton', 'Hand Thread Work', 'Chanderi Silk', 'Side slit piping matching dupatta.', 'Fitting approved with zero alterations.', 1, 0, 'Perfect fit on first trial.', 5, 'Slim Fit', '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"PERFECT","Sleeves":"PERFECT","Total Length":"PERFECT"}', '2026-09-20'),
('e0000000-0000-0000-0000-000000000514', '561d805a-f26c-4f88-9b3f-06b286226194', 'Main Branch', 'TRL-2026-0514', 'ORD-2026-0514', '+91 99400 88776', 'Sneha Reddy', 'Saree', 'Kanjeevaram Bridal', '2026-09-09', '04:00 PM', 'Trial', 'UPCOMING', 'MINOR', 'Sneha', '2026-09-26', 'U-Neck with Dori', 'Cap Sleeves', 'Butter Crepe', 'Antique Zari', 'Pure Silk', 'Pre-pleated pallu stitching requested.', 'Adjust pleat width to 4.5 inches.', 1, 1, 'Blouse fit is good, pleat pinning needs securing.', 4, 'Tailored Fit', '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"PERFECT","Sleeves":"PERFECT","Total Length":"PERFECT"}', '2026-09-21'),
('e0000000-0000-0000-0000-000000000510', '561d805a-f26c-4f88-9b3f-06b286226194', 'Main Branch', 'TRL-2026-0510', 'ORD-2026-0510', '+91 98840 55667', 'Divya Raj', 'Blouse', 'Festive Silk Essentials', '2026-09-10', '11:30 AM', 'Trial', 'UPCOMING', 'PERFECT', 'Meenakshi', '2026-09-27', 'Square Neck', 'Elbow Sleeves', 'Pure Cotton', 'Cutwork Lace', 'Brocade Silk', 'Padded cups included.', 'Padded cup alignment confirmed.', 1, 0, 'Neckline sits cleanly flat.', 5, 'Comfort Fit', '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"PERFECT","Sleeves":"PERFECT","Total Length":"PERFECT"}', '2026-09-22'),
('e0000000-0000-0000-0000-000000000507', '561d805a-f26c-4f88-9b3f-06b286226194', 'Main Branch', 'TRL-2026-0507', 'ORD-2026-0507', '+91 97909 22331', 'Meera Pillai', 'Gown', 'Evening Cocktail', '2026-09-11', '03:00 PM', 'Trial', 'UPCOMING', 'MINOR', 'Ananya', '2026-09-28', 'Off Shoulder', 'Sleeveless', 'Satin', 'Crystal & Bead Work', 'Crepe & Net', 'Floor sweeping flare with stiff horsehair braid hem.', 'Check bust dart taper.', 1, 1, 'Corset boning provides great posture support.', 4, 'Standard Fit', '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"PERFECT","Sleeves":"PERFECT","Total Length":"PERFECT"}', '2026-09-23'),
('e0000000-0000-0000-0000-000000000503', '561d805a-f26c-4f88-9b3f-06b286226194', 'Main Branch', 'TRL-2026-0503', 'ORD-2026-0503', '+91 99411 77889', 'Anitha Raj', 'Lehenga', 'Heritage Royal Bridal', '2026-09-12', '10:00 AM', 'Trial', 'UPCOMING', 'MINOR', 'Sneha', '2026-09-29', 'V-Neck Plunge', 'Full Sheer Sleeves', 'Silk Satin', 'Dabka & Pearl Work', 'Velvet & Organza', 'Double dupatta draping.', 'Ensure waist hook is reinforced.', 1, 2, 'Stunning look, armhole needs slight easing.', 5, 'Comfort Fit', '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"PERFECT","Sleeves":"PERFECT","Total Length":"PERFECT"}', '2026-09-24'),
('e0000000-0000-0000-0000-000000000501', '561d805a-f26c-4f88-9b3f-06b286226194', 'Main Branch', 'TRL-2026-0501', 'ORD-2026-0501', '+91 98410 99881', 'Neha Bhat', 'Chudi Set', 'Pastel Blossom', '2026-09-14', '11:00 AM', 'Trial', 'OVERDUE', 'MINOR', 'Meenakshi', '2026-09-30', 'Round Neck with Keyhole', '3/4 Sleeves', 'Cotton Mul', 'Resham Embroidery', 'Chanderi', 'Pant ankle cuff with pearl buttons.', 'Chest margin needs loosen by 0.75".', 1, 1, 'Very comfortable fabric, needs minor chest ease.', 4, 'Relaxed Fit', '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"PERFECT","Sleeves":"PERFECT","Total Length":"PERFECT"}', '2026-09-25'),
('e0000000-0000-0000-0000-000000000498', '561d805a-f26c-4f88-9b3f-06b286226194', 'Main Branch', 'TRL-2026-0498', 'ORD-2026-0498', '+91 98845 11224', 'Swathi Krishna', 'Anarkali', 'Celebration Collection', '2026-09-08', '03:15 PM', 'Trial', 'TODAY', 'MINOR', 'Meenakshi', '2026-10-02', 'Angrakha Style', 'Full Fitted', 'Silk', 'Mirror & Resham', 'Georgette', 'Heavy flare.', 'Waist flare attachment check.', 1, 1, 'Lovely silhouette, check flare attachment.', 4, 'Standard Fit', '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"PERFECT","Sleeves":"PERFECT","Total Length":"PERFECT"}', '2026-09-26'),
('e0000000-0000-0000-0000-000000000495', '561d805a-f26c-4f88-9b3f-06b286226194', 'Main Branch', 'TRL-2026-0495', 'ORD-2026-0495', '+91 99620 44556', 'Pooja Hegde', 'Kurti Set', 'Minimalist Luxe', '2026-09-16', '11:30 AM', 'Trial', 'UPCOMING', 'PERFECT', 'Sneha', '2026-10-04', 'Mandarin Collar', 'Roll-up Sleeves', 'Linen Blend', 'Minimal Zari', 'Pure Linen', 'Pocket detailing on both sides.', 'Fit approved without changes.', 1, 0, 'Clean stitching and flawless fall.', 5, 'Standard Fit', '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"PERFECT","Sleeves":"PERFECT","Total Length":"PERFECT"}', '2026-09-27'),
('e0000000-0000-0000-0000-000000000492', '561d805a-f26c-4f88-9b3f-06b286226194', 'Main Branch', 'TRL-2026-0492', 'ORD-2026-0492', '+91 98402 77889', 'Ritu Varma', 'Saree Blouse', 'Temple Classic', '2026-09-08', '04:30 PM', 'Trial', 'TODAY', 'MINOR', 'Ananya', '2026-10-05', 'High Neck with Potli', 'Sleeveless', 'Silk', 'Temple Border Zari', 'Raw Silk', 'Potli button back closure.', 'Adjust neck potli button spacing.', 1, 1, 'Fits well, button spacing needs 0.25 inch adjustment.', 4, 'Comfort Fit', '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"PERFECT","Sleeves":"PERFECT","Total Length":"PERFECT"}', '2026-09-28'),
('e0000000-0000-0000-0000-000000000489', '561d805a-f26c-4f88-9b3f-06b286226194', 'Main Branch', 'TRL-2026-0489', 'ORD-2026-0489', '+91 97891 33442', 'Deepa Mohan', 'Gown', 'Reception Luxe', '2026-09-05', '10:30 AM', 'Trial', 'OVERDUE', 'MINOR', 'Meenakshi', '2026-10-07', 'Sweetheart Drape', 'Off-shoulder Straps', 'Crepe Silk', 'Sequin Sheet', 'Net & Shimmer Crepe', 'Concealed side zipper with safety hook.', 'Replace zip slider with heavy duty.', 1, 1, 'Gown looks gorgeous, side zipper needs smoother action.', 4, 'Regular Fit', '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"PERFECT","Sleeves":"PERFECT","Total Length":"PERFECT"}', '2026-09-29')
ON CONFLICT (trial_code) DO UPDATE SET
    fit_status = EXCLUDED.fit_status,
    status = EXCLUDED.status,
    branch = EXCLUDED.branch;

-- Alterations for Showroom Trials
INSERT INTO public.trial_alterations (
    id, company_id, trial_id, description, category, completed, assigned_tailor, priority, status, target_date, tailor_notes
) VALUES
('409769b3-5ea6-40ad-95a7-5a782af2ecb3', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000528', 'Reduce sleeve tightness by 0.5"', 'Sleeve', false, 'Master Ramesh', 'High', 'PENDING', '2026-09-15', 'Open inner sleeve margin by 0.5 inch'),
('8792c2f4-0453-4a87-9770-070850225623', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000528', 'Loosen waist by 1"', 'Waist', false, 'Master Ramesh', 'Medium', 'PENDING', '2026-09-15', 'Shift waist hook by 1 inch for ease'),
('56c1d822-b5c2-4d0e-8fb4-c96739c7e333', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000528', 'Reduce neck depth by 0.5"', 'Neck', false, 'Ananya Tailor', 'High', 'PENDING', '2026-09-15', 'Raise neckline shoulder seam by 0.5 inch'),
('03ee765a-634c-4446-bfab-59e414bda67c', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000528', 'Adjust shoulder slope', 'Shoulder', false, 'Master Ramesh', 'Normal', 'PENDING', '2026-09-15', 'Adjust left slope by 0.25 inch'),
('2d518baa-b719-4838-ae06-cbb0ce984b90', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000519', 'Ease waistband by 0.75"', 'Waist', false, 'Master Ramesh', 'High', 'PENDING', '2026-09-14', 'Ease waistband margin'),
('cbe7b8b6-4dd0-4877-b6fb-05a2721273ab', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000519', 'Shorten lehenga hem by 1"', 'Length', false, 'Master Ramesh', 'Medium', 'PENDING', '2026-09-14', 'Shorten hem by 1 inch for footwear'),
('5ffce01b-8e96-443d-8d06-56c85a16294d', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000514', 'Secure pre-pleated pallu snap buttons', 'General', false, 'Master Ramesh', 'Normal', 'PENDING', '2026-09-16', 'Add 2 snap buttons to pallu'),
('aa561f52-deac-4953-88b3-b99a5c8b8bb3', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000507', 'Trim inner horsehair braid by 0.5"', 'Length', false, 'Master Ramesh', 'Normal', 'PENDING', '2026-09-18', 'Trim braid for smooth drape'),
('56f81546-580c-4779-8b35-5ecc1fec2b25', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000503', 'Reinforce double waist hook fastener', 'Waist', false, 'Master Ramesh', 'Normal', 'PENDING', '2026-09-19', 'Reinforce hooks'),
('fa265d42-0ead-4eea-b5bd-0c3c75a3b0de', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000503', 'Ease armhole seam by 0.25"', 'Armhole', false, 'Master Ramesh', 'Normal', 'PENDING', '2026-09-19', 'Ease armhole'),
('4e1251ff-6144-43a3-a02a-4485caefe212', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000501', 'Loosen chest margin by 0.75"', 'Chest', false, 'Master Ramesh', 'Normal', 'PENDING', '2026-09-20', 'Release 0.75 margin'),
('07682a67-b1ea-41bd-918f-9b5835f8762f', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000498', 'Waist flare attachment check', 'Waist', false, 'Master Ramesh', 'Normal', 'PENDING', '2026-09-20', 'Check flare join'),
('a09c5aa3-4e02-40cf-b992-220478c40ce2', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000492', 'Adjust neck potli button spacing', 'Neck', false, 'Master Ramesh', 'Normal', 'PENDING', '2026-09-21', 'Even potli spacing'),
('9acc66ea-e16b-4743-9e57-9b6e1346d357', '561d805a-f26c-4f88-9b3f-06b286226194', 'e0000000-0000-0000-0000-000000000489', 'Replace zip slider with heavy duty', 'General', false, 'Master Ramesh', 'Normal', 'PENDING', '2026-09-22', 'Install heavy duty YKK slider')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 12. PAYMENTS & TRANSACTIONS (10 ORDERS: FINANCIAL LEDGER ENTRIES)
-- ------------------------------------------------------------------------------
INSERT INTO public.payments (
    id, company_id, order_id, customer_mobile, total_amount, paid_amount, status, due_date
) VALUES
('fa000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', 'cc000000-0000-0000-0000-000000000001', '+91 98401 54321', 95000.00, 65000.00, 'PARTIAL', CURRENT_DATE + 8),
('fa000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', 'cc000000-0000-0000-0000-000000000002', '+91 98403 11223', 24000.00, 15000.00, 'PARTIAL', CURRENT_DATE + 5),
('fa000000-0000-0000-0000-000000000003', '561d805a-f26c-4f88-9b3f-06b286226194', 'cc000000-0000-0000-0000-000000000003', '+91 98405 33445', 54000.00, 35000.00, 'PARTIAL', CURRENT_DATE + 3),
('fa000000-0000-0000-0000-000000000004', '561d805a-f26c-4f88-9b3f-06b286226194', 'cc000000-0000-0000-0000-000000000004', '+91 98406 44556', 32000.00, 20000.00, 'PARTIAL', CURRENT_DATE + 2),
('fa000000-0000-0000-0000-000000000005', '561d805a-f26c-4f88-9b3f-06b286226194', 'cc000000-0000-0000-0000-000000000005', '+91 98407 55667', 42000.00, 30000.00, 'PARTIAL', CURRENT_DATE + 1),
('fa000000-0000-0000-0000-000000000006', '561d805a-f26c-4f88-9b3f-06b286226194', 'cc000000-0000-0000-0000-000000000006', '+91 98408 66778', 25000.00, 25000.00, 'PAID', CURRENT_DATE - 4),

('fa000000-0000-0000-0000-000000000007', '561d805a-f26c-4f88-9b3f-06b286226194', 'cc000000-0000-0000-0000-000000000007', '+91 98402 67890', 110000.00, 80000.00, 'PARTIAL', CURRENT_DATE + 12),
('fa000000-0000-0000-0000-000000000008', '561d805a-f26c-4f88-9b3f-06b286226194', 'cc000000-0000-0000-0000-000000000008', '+91 98404 22334', 68000.00, 45000.00, 'PARTIAL', CURRENT_DATE + 4),
('fa000000-0000-0000-0000-000000000009', '561d805a-f26c-4f88-9b3f-06b286226194', 'cc000000-0000-0000-0000-000000000009', '+91 98401 54321', 72000.00, 50000.00, 'PARTIAL', CURRENT_DATE + 15),
('fa000000-0000-0000-0000-000000000010', '561d805a-f26c-4f88-9b3f-06b286226194', 'cc000000-0000-0000-0000-000000000010', '+91 98402 67890', 35000.00, 35000.00, 'PAID', CURRENT_DATE + 1)
ON CONFLICT (id) DO UPDATE SET total_amount = EXCLUDED.total_amount, paid_amount = EXCLUDED.paid_amount;

-- Corresponding double-entry transaction receipts
INSERT INTO public.payment_transactions (
    id, company_id, payment_id, amount, method, received_by, reference_no, notes
) VALUES
('fb000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', 'fa000000-0000-0000-0000-000000000001', 65000.00, 'UPI', 'Meera Nambiar', 'TXN-SIV-2026-001', 'Advance booking payment via HDFC UPI'),
('fb000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', 'fa000000-0000-0000-0000-000000000002', 15000.00, 'CARD', 'Meera Nambiar', 'TXN-SIV-2026-002', 'Credit Card advance payment at siva 2 terminal'),
('fb000000-0000-0000-0000-000000000003', '561d805a-f26c-4f88-9b3f-06b286226194', 'fa000000-0000-0000-0000-000000000003', 35000.00, 'NETBANKING', 'Meera Nambiar', 'TXN-SIV-2026-003', 'NEFT advance transfer'),
('fb000000-0000-0000-0000-000000000004', '561d805a-f26c-4f88-9b3f-06b286226194', 'fa000000-0000-0000-0000-000000000004', 20000.00, 'UPI', 'Meera Nambiar', 'TXN-SIV-2026-004', 'GPay UPI booking advance'),
('fb000000-0000-0000-0000-000000000005', '561d805a-f26c-4f88-9b3f-06b286226194', 'fa000000-0000-0000-0000-000000000005', 30000.00, 'CARD', 'Meera Nambiar', 'TXN-SIV-2026-005', 'ICICI Card POS swipe'),
('fb000000-0000-0000-0000-000000000006', '561d805a-f26c-4f88-9b3f-06b286226194', 'fa000000-0000-0000-0000-000000000006', 25000.00, 'CASH', 'Meera Nambiar', 'TXN-SIV-2026-006', 'Full cash settlement on delivery'),

('fb000000-0000-0000-0000-000000000007', '561d805a-f26c-4f88-9b3f-06b286226194', 'fa000000-0000-0000-0000-000000000007', 80000.00, 'NETBANKING', 'Rajesh Kumar', 'TXN-SIV-2026-007', 'RTGS wedding groom royal attire advance'),
('fb000000-0000-0000-0000-000000000008', '561d805a-f26c-4f88-9b3f-06b286226194', 'fa000000-0000-0000-0000-000000000008', 45000.00, 'CARD', 'Rajesh Kumar', 'TXN-SIV-2026-008', 'Amex Card swipe at Flagship Atelier terminal'),
('fb000000-0000-0000-0000-000000000009', '561d805a-f26c-4f88-9b3f-06b286226194', 'fa000000-0000-0000-0000-000000000009', 50000.00, 'UPI', 'Rajesh Kumar', 'TXN-SIV-2026-009', 'Advance for Kalidar Gown via PhonePe'),
('fb000000-0000-0000-0000-000000000010', '561d805a-f26c-4f88-9b3f-06b286226194', 'fa000000-0000-0000-0000-000000000010', 35000.00, 'UPI', 'Rajesh Kumar', 'TXN-SIV-2026-010', 'Full payment for Tussar Kurta & Stole')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 13. INVENTORY & RAW MATERIALS (14 LUXURY FABRIC & EMBELLISHMENT ITEMS)
-- ------------------------------------------------------------------------------
INSERT INTO public.inventory_items (
    id, company_id, item_code, name, category, unit, stock_qty, reserved_qty, reorder_level,
    purchase_price, selling_price, status, branch, composition, width, origin
) VALUES
-- --- siva 2 Stock (8 items: including 2 low stock for realistic dashboard alerts) ---
('fc000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-001', 'Kanjeevaram Mulberry Raw Silk (Crimson Red)', 'FABRIC', 'Meter', 48.00, 12.00, 15.00, 1850.00, 3200.00, 'IN_STOCK', 'siva 2', '100% Pure Mulberry Silk', '44 inches', 'Kanchipuram, Tamil Nadu'),
('fc000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-002', 'Banarasi Real Zari Brocade (Royal Emerald)', 'FABRIC', 'Meter', 32.50, 8.00, 10.00, 2600.00, 4800.00, 'IN_STOCK', 'siva 2', 'Silk with 24k Electroplated Silver Zari', '44 inches', 'Varanasi, UP'),
('fc000000-0000-0000-0000-000000000003', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-003', 'Pure Tissue Organza (Rose Gold)', 'FABRIC', 'Meter', 4.50, 4.00, 12.00, 950.00, 1800.00, 'LOW_STOCK', 'siva 2', '100% Silk Tissue Organza', '46 inches', 'Surat, Gujarat'),
('fc000000-0000-0000-0000-000000000004', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-004', 'Authentic Copper Zari Thread Spools (No. 3)', 'THREAD', 'Spool', 3.00, 2.00, 10.00, 420.00, 800.00, 'LOW_STOCK', 'siva 2', 'Copper core with gold polish', '1000m spool', 'Surat, Gujarat'),
('fc000000-0000-0000-0000-000000000005', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-005', 'Heavy Micro-Velvet (Royal Wine Maroon)', 'FABRIC', 'Meter', 28.00, 6.00, 8.00, 1400.00, 2600.00, 'IN_STOCK', 'siva 2', 'Micro 9000 Velvet', '48 inches', 'Surat, Gujarat'),
('fc000000-0000-0000-0000-000000000006', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-006', 'Breathable Bemberg Cupro Lining', 'LINING', 'Meter', 110.00, 20.00, 25.00, 320.00, 650.00, 'IN_STOCK', 'siva 2', '100% Cupro Bemberg', '54 inches', 'Asahi Kasei, Japan'),
('fc000000-0000-0000-0000-000000000007', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-007', 'Heavy Net Double Can-Can Stiffener', 'LINING', 'Meter', 85.00, 15.00, 20.00, 180.00, 380.00, 'IN_STOCK', 'siva 2', 'Stiffened Nylon Netting', '60 inches', 'Surat, Gujarat'),
('fc000000-0000-0000-0000-000000000008', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-008', 'Antique Brass Concealed Metal Zippers (24")', 'TRIM', 'Piece', 65.00, 10.00, 15.00, 95.00, 220.00, 'IN_STOCK', 'siva 2', 'YKK Concealed Metal Zipper', '24 inches', 'YKK India'),

-- --- siva Flagship Atelier Stock (6 items) ---
('fc000000-0000-0000-0000-000000000009', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-009', 'Italian Super 120s Worsted Wool (Midnight Blue)', 'FABRIC', 'Meter', 36.00, 8.00, 10.00, 4800.00, 9500.00, 'IN_STOCK', 'siva Flagship Atelier', '100% Extrafine Merino Wool', '58 inches', 'Biella, Italy'),
('fc000000-0000-0000-0000-000000000010', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-010', 'Natural Matka Raw Silk (Ivory Cream)', 'FABRIC', 'Meter', 52.00, 14.00, 12.00, 2100.00, 3900.00, 'IN_STOCK', 'siva Flagship Atelier', '100% Handloom Matka Silk', '44 inches', 'Murshidabad, West Bengal'),
('fc000000-0000-0000-0000-000000000011', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-011', 'Handwoven Wild Tussar Silk (Golden Honey)', 'FABRIC', 'Meter', 24.00, 5.00, 8.00, 1950.00, 3600.00, 'IN_STOCK', 'siva Flagship Atelier', '100% Pure Forest Tussar Silk', '46 inches', 'Bhagalpur, Bihar'),
('fc000000-0000-0000-0000-000000000012', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-012', 'Real Basra Cultured Moti Pearls (2mm)', 'EMBELLISHMENT', 'String', 18.00, 4.00, 6.00, 850.00, 1750.00, 'IN_STOCK', 'siva Flagship Atelier', 'Natural freshwater cultured seed pearls', '16-inch string', 'Hyderabad, Telangana'),
('fc000000-0000-0000-0000-000000000013', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-013', 'Swarovski Clear Crystal Chaton SS16', 'EMBELLISHMENT', 'Gross', 2.00, 1.00, 5.00, 1200.00, 2400.00, 'LOW_STOCK', 'siva Flagship Atelier', 'Austrian lead crystal elements', 'SS16 (4mm)', 'Wattens, Austria'),
('fc000000-0000-0000-0000-000000000014', '561d805a-f26c-4f88-9b3f-06b286226194', 'MAT-SIV-014', 'Natural Horsehair Chest Canvas Interfacing', 'LINING', 'Meter', 40.00, 6.00, 10.00, 1100.00, 2200.00, 'IN_STOCK', 'siva Flagship Atelier', 'Wool warp with natural horsehair weft', '60 inches', 'Germany')
ON CONFLICT (item_code) DO UPDATE SET 
    stock_qty = EXCLUDED.stock_qty,
    status = EXCLUDED.status,
    branch = EXCLUDED.branch;

-- ------------------------------------------------------------------------------
-- 14. SUPPLIERS
-- ------------------------------------------------------------------------------
INSERT INTO public.suppliers (
    id, company_id, supplier_code, name, contact_person, phone, email, address, specialization, notes
) VALUES
('fd000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', 'SUP-SIV-001', 'Kanchipuram Silk Weavers Cooperative', 'K. Ramachandran', '+91 94431 22334', 'kanchi.silk@coop.in', '12, Gandhi Road, Kanchipuram, Tamil Nadu', 'Pure Mulberry Raw Silk & Gold Zari Sarees', 'Primary bridal silk supplier with certified silk mark'),
('fd000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', 'SUP-SIV-002', 'Varanasi Zari & Brocade Mills', 'Pt. Harishankar Mishra', '+91 94152 33445', 'varanasi.zari@heritage.in', '45, Chowk, Varanasi, Uttar Pradesh', 'Authentic Banarasi Brocades & Electroplated Zari', 'Direct handloom weaver partner for heirloom brocade fabrics'),
('fd000000-0000-0000-0000-000000000003', '561d805a-f26c-4f88-9b3f-06b286226194', 'SUP-SIV-003', 'Surat Luxury Embellishments & Trims', 'Dharmesh Shah', '+91 98251 44556', 'surat.trims@textiles.in', '78, Ring Road Textile Market, Surat, Gujarat', 'Gota Patti, Metallic Trims, Organza Tissue', 'High-volume quality embellishment, zipper and net distributor')
ON CONFLICT (supplier_code) DO UPDATE SET name = EXCLUDED.name, specialization = EXCLUDED.specialization;

-- ------------------------------------------------------------------------------
-- 15. APPOINTMENTS (6 CLIENT SESSIONS)
-- ------------------------------------------------------------------------------
INSERT INTO public.appointments (
    id, company_id, customer_mobile, appt_type, scheduled_at, duration_minutes, status, staff_assigned, notes
) VALUES
('fe000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', '+91 98401 54321', 'FITTING', NOW() + INTERVAL '3 days', 60, 'SCHEDULED', 'Ananya Sharma', 'Second bridal trial for Crimson Lehenga'),
('fe000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', '+91 98402 67890', 'CONSULTATION', NOW() + INTERVAL '1 day', 45, 'CONFIRMED', 'Rajesh Kumar', 'Trousseau matching consultation for royal reception'),
('fe000000-0000-0000-0000-000000000003', '561d805a-f26c-4f88-9b3f-06b286226194', '+91 98403 11223', 'MEASUREMENT', NOW() + INTERVAL '2 days', 30, 'SCHEDULED', 'Priya Sundaram', 'Muhurtham blouse sleeve and neck measurement confirmation'),
('fe000000-0000-0000-0000-000000000004', '561d805a-f26c-4f88-9b3f-06b286226194', '+91 98404 22334', 'FITTING', NOW() + INTERVAL '1 day', 45, 'SCHEDULED', 'Rajesh Kumar', 'First trial fitting for Italian wool Bandhgala jacket'),
('fe000000-0000-0000-0000-000000000005', '561d805a-f26c-4f88-9b3f-06b286226194', '+91 98405 33445', 'FITTING', NOW(), 45, 'COMPLETED', 'Ananya Sharma', 'First trial fitting for Rose Gold Anarkali with alteration markings'),
('fe000000-0000-0000-0000-000000000006', '561d805a-f26c-4f88-9b3f-06b286226194', '+91 98407 55667', 'DELIVERY', NOW() + INTERVAL '1 day', 30, 'CONFIRMED', 'Meera Nambiar', 'Final trial check and boutique delivery packaging for Reception Gown')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 16. ENQUIRIES (6 PROSPECTIVE CLIENT LEADS)
-- ------------------------------------------------------------------------------
INSERT INTO public.enquiries (
    id, company_id, enquiry_code, customer_name, phone, email, garment_type,
    occasion, estimated_budget, source, status, assigned_to, branch, notes
) VALUES
('ff000000-0000-0000-0000-000000000001', '561d805a-f26c-4f88-9b3f-06b286226194', 'ENQ-SIV-001', 'Sowmya Krishnan', '+91 98409 77889', 'sowmya.k@gmail.com', 'Bridal Lehenga', 'Wedding December 2026', 125000.00, 'INSTAGRAM', 'NEW', 'Ananya Sharma', 'siva 2', 'Interested in Varanasi Heritage collection with pure gold zardozi'),
('ff000000-0000-0000-0000-000000000002', '561d805a-f26c-4f88-9b3f-06b286226194', 'ENQ-SIV-002', 'Rohit Balakrishnan', '+91 98410 88990', 'rohit.bala@corp.in', 'Groom Sherwani', 'Reception November 2026', 85000.00, 'WALK_IN', 'IN_PROGRESS', 'Rajesh Kumar', 'siva Flagship Atelier', 'Looking for Matka raw silk sherwani in pastel mint or ivory'),
('ff000000-0000-0000-0000-000000000003', '561d805a-f26c-4f88-9b3f-06b286226194', 'ENQ-SIV-003', 'Anitha Rajendran', '+91 98411 99001', 'anitha.r@outlook.com', 'Saree Blouse', 'Muhurtham Wedding', 28000.00, 'WHATSAPP', 'IN_PROGRESS', 'Ananya Sharma', 'siva 2', 'Wants Maggam cutwork embroidery on self-brought Kanjeevaram silk'),
('ff000000-0000-0000-0000-000000000004', '561d805a-f26c-4f88-9b3f-06b286226194', 'ENQ-SIV-004', 'Dinesh Karthikeyan', '+91 98412 10112', 'dinesh.k@fintech.co', 'Jodhpuri Suit', 'Engagement Gala', 55000.00, 'REFERRAL', 'QUOTED', 'Rajesh Kumar', 'siva Flagship Atelier', 'Requested quote for Italian worsted wool jacket with monogrammed buttons'),
('ff000000-0000-0000-0000-000000000005', '561d805a-f26c-4f88-9b3f-06b286226194', 'ENQ-SIV-005', 'Archana Sridhar', '+91 98413 21223', 'archana.sridhar@gmail.com', 'Reception Gown', 'Cocktail Night', 48000.00, 'WEBSITE', 'NEW', 'Ananya Sharma', 'siva 2', 'Inquired through website lookbook for draped lilac reception gown'),
('ff000000-0000-0000-0000-000000000006', '561d805a-f26c-4f88-9b3f-06b286226194', 'ENQ-SIV-006', 'Kalyani Narayanan', '+91 98414 32334', 'kalyani.n@yahoo.com', 'Anarkali Set', 'Family Sangeet', 38000.00, 'WALK_IN', 'IN_PROGRESS', 'Meera Nambiar', 'siva 2', 'Client wants trial booking for ready-to-fit pastel organza anarkali')
ON CONFLICT (enquiry_code) DO UPDATE SET status = EXCLUDED.status, branch = EXCLUDED.branch;

COMMIT;
