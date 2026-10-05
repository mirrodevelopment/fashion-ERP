-- =============================================================================
-- RIWAYAT HAUTE COUTURE -- DEMO DATA SEED SCRIPT
-- =============================================================================
-- Company     : Riwayat Haute Couture (Lucknow Flagship Atelier)
-- Branches    : 3 (Lucknow Flagship HQ, Agra Showroom, Kanpur Studio)
-- Employees   : 9 (3 per branch: 1 Manager + 2 Tailors/Artisans)
-- Customers   : 50 (17 Lucknow, 16 Agra, 17 Kanpur)
-- Measurements: 50 (Complete body tailoring profiles)
-- Orders      : 125 (1 to 5 per customer, realistic Indian bespoke couture)
-- Garments    : 125 (1:1 with Orders, correctly routed to branch)
-- Payments    : 125 (Tracking advance and balance)
-- Transactions: 125 (UPI, Card, Cash, Net Banking)
-- Stages      : 250 (ORDER_TAKEN + active workflow stage)
-- Trials      : 60 (Fitting records with feedback)
-- Collections : 3 (1 per branch)
-- Enquiries   : 20 (Prospects and walk-in leads)
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. COMPANY SETTINGS
-- =============================================================================
DELETE FROM company_settings;
INSERT INTO company_settings (
    id, company_name, short_name, tagline, owner_name, business_type,
    gstin, pan_number, primary_phone, whatsapp, email, website,
    street_address, city, state, pin_code, country, created_at, updated_at
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Riwayat Haute Couture',
    'RIWAYAT',
    'Timeless Heritage - Handcrafted Bespoke Luxury',
    'Meera Singhania',
    'Luxury Bridal and Bespoke Atelier',
    '09AAACR9876M1ZX',
    'AAACR9876M',
    '+91-9876543210',
    '+91-9876543210',
    'concierge@riwayatcouture.com',
    'https://www.riwayatcouture.com',
    '14/A Hazratganj Heritage Promenade, Near Cathedral',
    'Lucknow',
    'Uttar Pradesh',
    '226001',
    'India',
    NOW(),
    NOW()
);

-- =============================================================================
-- 2. EMPLOYEES (9 staff: 1 Manager + 2 Tailors per branch)
-- =============================================================================
INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, notes, created_at, updated_at)
VALUES ('e1000000-0000-0000-0000-000000000001', 'EMP-LKO-001', 'Sunita Rajput', '+91-9811000001', 'sunita.rajput@riwayatcouture.com', 'MANAGER', 'ACTIVE', '2023-03-15'::date, 'Boutique Operations and Bridal Styling', 'Assigned to Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, notes, created_at, updated_at)
VALUES ('e1000000-0000-0000-0000-000000000002', 'EMP-LKO-002', 'Mohammad Irfan', '+91-9811000002', 'mohammad.irfan@riwayatcouture.com', 'TAILOR', 'ACTIVE', '2023-04-01'::date, 'Master Pattern Cutter and Zardozi', 'Assigned to Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, notes, created_at, updated_at)
VALUES ('e1000000-0000-0000-0000-000000000003', 'EMP-LKO-003', 'Rakesh Verma', '+91-9811000003', 'rakesh.verma@riwayatcouture.com', 'TAILOR', 'ACTIVE', '2023-06-10'::date, 'Designer Blouse and Silhouette Specialist', 'Assigned to Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, notes, created_at, updated_at)
VALUES ('e1000000-0000-0000-0000-000000000004', 'EMP-AGR-001', 'Priya Kashyap', '+91-9811000004', 'priya.kashyap@riwayatcouture.com', 'MANAGER', 'ACTIVE', '2023-08-01'::date, 'Customer Experience and Couture Merchandising', 'Assigned to Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, notes, created_at, updated_at)
VALUES ('e1000000-0000-0000-0000-000000000005', 'EMP-AGR-002', 'Aslam Khan', '+91-9811000005', 'aslam.khan@riwayatcouture.com', 'TAILOR', 'ACTIVE', '2023-08-15'::date, 'Heavy Lehenga and Velvet Construction', 'Assigned to Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, notes, created_at, updated_at)
VALUES ('e1000000-0000-0000-0000-000000000006', 'EMP-AGR-003', 'Dinesh Pal', '+91-9811000006', 'dinesh.pal@riwayatcouture.com', 'TAILOR', 'ACTIVE', '2023-09-01'::date, 'Anarkali Fitting and Dupatta Finishing', 'Assigned to Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, notes, created_at, updated_at)
VALUES ('e1000000-0000-0000-0000-000000000007', 'EMP-KNP-001', 'Vandana Kapoor', '+91-9811000007', 'vandana.kapoor@riwayatcouture.com', 'MANAGER', 'ACTIVE', '2024-01-10'::date, 'Studio Administration and Fabric Sourcing', 'Assigned to Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, notes, created_at, updated_at)
VALUES ('e1000000-0000-0000-0000-000000000008', 'EMP-KNP-002', 'Naseem Ahmed', '+91-9811000008', 'naseem.ahmed@riwayatcouture.com', 'TAILOR', 'ACTIVE', '2024-01-20'::date, 'Brocade Kurti and Silk Trouser Tailoring', 'Assigned to Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, notes, created_at, updated_at)
VALUES ('e1000000-0000-0000-0000-000000000009', 'EMP-KNP-003', 'Suresh Gupta', '+91-9811000009', 'suresh.gupta@riwayatcouture.com', 'TAILOR', 'ACTIVE', '2024-02-01'::date, 'Intricate Neckline and Saree Border Artisan', 'Assigned to Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (employee_code) DO NOTHING;

-- =============================================================================
-- 3. BRANCHES (3 locations: Lucknow HQ, Agra Showroom, Kanpur Studio)
-- =============================================================================
INSERT INTO branches (id, branch_code, name, type, street_address, city, state, pin_code, country, phone, email, website, active, is_headquarters, manager_id, working_hours, features, notes, created_at, updated_at)
VALUES ('b1000000-0000-0000-0000-000000000001', 'HQ-LKO', 'Riwayat Couture - Lucknow Flagship HQ', 'SHOWROOM', '14/A Hazratganj Heritage Promenade, Near Cathedral', 'Lucknow', 'Uttar Pradesh', '226001', 'India', '+91-522-2619010', 'lucknow.hq@riwayatcouture.com', 'https://www.riwayatcouture.com', true, true, 'e1000000-0000-0000-0000-000000000001', 'Mon-Sat: 10:30 AM - 8:30 PM | Sun: 11:00 AM - 6:00 PM', 'Bridal Lounge, VIP Fitting Salon, Master Embroidery Studio, Heritage Archive', 'Flagship store of Riwayat Haute Couture', NOW(), NOW())
ON CONFLICT (branch_code) DO NOTHING;
INSERT INTO branches (id, branch_code, name, type, street_address, city, state, pin_code, country, phone, email, website, active, is_headquarters, manager_id, working_hours, features, notes, created_at, updated_at)
VALUES ('b1000000-0000-0000-0000-000000000002', 'BR-AGRA', 'Riwayat Couture - Agra Showroom', 'SHOWROOM', '22/B Fatehabad Road, Near Taj East Gate', 'Agra', 'Uttar Pradesh', '282001', 'India', '+91-562-2234020', 'agra.showroom@riwayatcouture.com', 'https://www.riwayatcouture.com', true, false, 'e1000000-0000-0000-0000-000000000004', 'Mon-Sat: 11:00 AM - 8:30 PM | Sun: 12:00 PM - 7:00 PM', 'Destination Wedding Suite, Royal Velvet Display, Trial Studios', 'Flagship store of Riwayat Haute Couture', NOW(), NOW())
ON CONFLICT (branch_code) DO NOTHING;
INSERT INTO branches (id, branch_code, name, type, street_address, city, state, pin_code, country, phone, email, website, active, is_headquarters, manager_id, working_hours, features, notes, created_at, updated_at)
VALUES ('b1000000-0000-0000-0000-000000000003', 'BR-KNPR', 'Riwayat Couture - Kanpur Studio', 'SHOWROOM', 'Plot 8, Mall Road and Civil Lines Crossing', 'Kanpur', 'Uttar Pradesh', '208001', 'India', '+91-512-2305030', 'kanpur.studio@riwayatcouture.com', 'https://www.riwayatcouture.com', true, false, 'e1000000-0000-0000-0000-000000000007', 'Mon-Sat: 10:30 AM - 8:00 PM | Sun: Closed', 'Brocade and Silk Gallery, Custom Fitting Bar, Express Alterations', 'Flagship store of Riwayat Haute Couture', NOW(), NOW())
ON CONFLICT (branch_code) DO NOTHING;

-- =============================================================================
-- 4. COLLECTIONS (3 collections: 1 per branch)
-- =============================================================================
INSERT INTO collections (id, code, name, subtitle, description, season, year, status, designer, branch, launch_date, is_featured, production_deadline, progress_percentage, created_at, updated_at)
VALUES ('c1000000-0000-0000-0000-000000000001', 'COL-LKO-2026', 'Awadh Nazakat and Chikankari Heritage 2026', 'Handcrafted Pure Mukaish, Zardozi and Shadow Work on Chanderi and Organza', 'Inspired by the royal courts of Awadh, featuring intricate 32 stitches chikankari with subtle silver mukaish.', 'Spring/Summer 2026', 2026, 'ACTIVE', 'Meera Singhania', 'Riwayat Couture - Lucknow Flagship HQ', '2026-01-15'::date, true, '2026-05-30'::date, 85, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;
INSERT INTO collections (id, code, name, subtitle, description, season, year, status, designer, branch, launch_date, is_featured, production_deadline, progress_percentage, created_at, updated_at)
VALUES ('c1000000-0000-0000-0000-000000000002', 'COL-AGR-2026', 'Noor-e-Taj Royal Velvet Bridal Edit', 'Regal Velvets, Dabka Hand-Embroidery and Kashmiri Tilla Motifs', 'Grand bridal ensembles for royal destination weddings with rich crimson, wine, and emerald jewel tones.', 'Autumn/Winter 2026', 2026, 'ACTIVE', 'Priya Kashyap', 'Riwayat Couture - Agra Showroom', '2026-01-15'::date, true, '2026-11-15'::date, 85, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;
INSERT INTO collections (id, code, name, subtitle, description, season, year, status, designer, branch, launch_date, is_featured, production_deadline, progress_percentage, created_at, updated_at)
VALUES ('c1000000-0000-0000-0000-000000000003', 'COL-KNP-2026', 'Ganga-Jamuni Brocade and Silk Festive', 'Pure Banarasi Katan Silks, Meenakari Weaves and Contemporary Silhouettes', 'Modern festive heirlooms celebrating traditional handloom weaves tailored for cocktail and sangeet evenings.', 'Festive 2026', 2026, 'ACTIVE', 'Vandana Kapoor', 'Riwayat Couture - Kanpur Studio', '2026-01-15'::date, true, '2026-09-20'::date, 85, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 5. CUSTOMERS (50 customers across Lucknow, Agra, Kanpur)
-- =============================================================================
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001001', 'Sunita Yadav', 'Sunita', 'Yadav', 'Mrs.', 'Female', 'sunita.yadav@gmail.com', '24, Rana Pratap Marg', 'Lucknow', 'Uttar Pradesh', '226001', 'Hazratganj', 'VIP', 4500, 2250, 'Embroidered Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001002', 'Priya Sharma', 'Priya', 'Sharma', 'Ms.', 'Female', 'priya.sharma@gmail.com', '102/B, Gomti Nagar Phase 1', 'Lucknow', 'Uttar Pradesh', '226010', 'Gomti Nagar', 'PREMIUM', 14500, 7250, 'Bridal Lehenga', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001003', 'Ananya Pandey', 'Ananya', 'Pandey', 'Ms.', 'Female', 'ananya.pandey@gmail.com', '12, Butler Colony', 'Lucknow', 'Uttar Pradesh', '226001', 'Butler Colony', 'VIP', 7200, 3600, 'Chikankari Anarkali', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001004', 'Ritu Srivastava', 'Ritu', 'Srivastava', 'Mrs.', 'Female', 'ritu.srivastava@gmail.com', '88, Sector B, Mahanagar', 'Lucknow', 'Uttar Pradesh', '226006', 'Mahanagar', 'REGULAR', 5400, 0, 'Festive Salwar Suit', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001005', 'Deepika Rai', 'Deepika', 'Rai', 'Mrs.', 'Female', 'deepika.rai@gmail.com', '45, Sector C, Aliganj', 'Lucknow', 'Uttar Pradesh', '226024', 'Aliganj', 'PREMIUM', 5200, 0, 'Silk Kurti and Palazzos', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001006', 'Swati Joshi', 'Swati', 'Joshi', 'Ms.', 'Female', 'swati.joshi@gmail.com', '16, Jopling Road', 'Lucknow', 'Uttar Pradesh', '226001', 'Jopling Road', 'VIP', 9800, 4900, 'Bridal Lehenga', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001007', 'Neha Trivedi', 'Neha', 'Trivedi', 'Mrs.', 'Female', 'neha.trivedi@gmail.com', '77, Block 3, Indira Nagar', 'Lucknow', 'Uttar Pradesh', '226016', 'Indira Nagar', 'REGULAR', 38000, 26600, 'Velvet Saree Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001008', 'Divya Dubey', 'Divya', 'Dubey', 'Ms.', 'Female', 'divya.dubey@gmail.com', '5/12, Vikas Nagar', 'Lucknow', 'Uttar Pradesh', '226022', 'Vikas Nagar', 'PREMIUM', 4500, 0, 'Chikankari Anarkali', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001009', 'Pooja Agarwal', 'Pooja', 'Agarwal', 'Mrs.', 'Female', 'pooja.agarwal@gmail.com', '101, Cantt Road, Sadar', 'Lucknow', 'Uttar Pradesh', '226002', 'Cantt', 'VIP', 14500, 7250, 'Embroidered Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001010', 'Meena Gupta', 'Meena', 'Gupta', 'Mrs.', 'Female', 'meena.gupta@gmail.com', '33, Aminabad Heritage Lane', 'Lucknow', 'Uttar Pradesh', '226018', 'Aminabad', 'REGULAR', 7200, 0, 'Festive Salwar Suit', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001011', 'Kavya Mishra', 'Kavya', 'Mishra', 'Ms.', 'Female', 'kavya.mishra@gmail.com', '62, Vineet Khand, Gomti Nagar', 'Lucknow', 'Uttar Pradesh', '226010', 'Gomti Nagar', 'PREMIUM', 5400, 2700, 'Royal Brocade Jacket', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001012', 'Shivani Tiwari', 'Shivani', 'Tiwari', 'Ms.', 'Female', 'shivani.tiwari@gmail.com', '19, Madan Mohan Malviya Marg', 'Lucknow', 'Uttar Pradesh', '226001', 'Hazratganj', 'VIP', 5200, 0, 'Bridal Lehenga', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001013', 'Rekha Shukla', 'Rekha', 'Shukla', 'Mrs.', 'Female', 'rekha.shukla@gmail.com', '40, Prag Narain Road', 'Lucknow', 'Uttar Pradesh', '226001', 'Butler Colony', 'REGULAR', 14300, 8050, 'Silk Kurti and Palazzos', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001014', 'Anjali Singh', 'Anjali', 'Singh', 'Mrs.', 'Female', 'anjali.singh@gmail.com', '81, Sector 9, Vikas Nagar', 'Lucknow', 'Uttar Pradesh', '226022', 'Vikas Nagar', 'PREMIUM', 11700, 0, 'Chikankari Anarkali', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001015', 'Monika Verma', 'Monika', 'Verma', 'Ms.', 'Female', 'monika.verma@gmail.com', '22, Eldeco Greens, Gomti Nagar', 'Lucknow', 'Uttar Pradesh', '226010', 'Gomti Nagar', 'VIP', 12400, 6200, 'Embroidered Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001016', 'Vineeta Saxena', 'Vineeta', 'Saxena', 'Mrs.', 'Female', 'vineeta.saxena@gmail.com', '15, Aashiana Colony', 'Lucknow', 'Uttar Pradesh', '226012', 'Aashiana', 'REGULAR', 43200, 2600, 'Festive Salwar Suit', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001017', 'Shweta Rastogi', 'Shweta', 'Rastogi', 'Ms.', 'Female', 'shweta.rastogi@gmail.com', '38, Gokhale Marg', 'Lucknow', 'Uttar Pradesh', '226001', 'Hazratganj', 'PREMIUM', 52500, 33850, 'Velvet Saree Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Lucknow Flagship HQ', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001018', 'Tanvi Bansal', 'Tanvi', 'Bansal', 'Ms.', 'Female', 'tanvi.bansal@gmail.com', '14, Fatehabad Road', 'Agra', 'Uttar Pradesh', '282001', 'Taj East', 'VIP', 19900, 7250, 'Bridal Lehenga', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001019', 'Shilpa Singhal', 'Shilpa', 'Singhal', 'Mrs.', 'Female', 'shilpa.singhal@gmail.com', '55, Sanjay Place Commercial Complex', 'Agra', 'Uttar Pradesh', '282002', 'Sanjay Place', 'PREMIUM', 15200, 4900, 'Velvet Saree Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001020', 'Megha Goyal', 'Megha', 'Goyal', 'Ms.', 'Female', 'megha.goyal@gmail.com', '8, Dayal Bagh Enclave', 'Agra', 'Uttar Pradesh', '282005', 'Dayal Bagh', 'VIP', 14300, 4900, 'Royal Brocade Jacket', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001021', 'Radhika Mittal', 'Radhika', 'Mittal', 'Mrs.', 'Female', 'radhika.mittal@gmail.com', '19, Kamla Nagar Market Road', 'Agra', 'Uttar Pradesh', '282004', 'Kamla Nagar', 'REGULAR', 11700, 2250, 'Festive Salwar Suit', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001022', 'Garima Jain', 'Garima', 'Jain', 'Ms.', 'Female', 'garima.jain@gmail.com', '32, Civil Lines Heritage Walk', 'Agra', 'Uttar Pradesh', '282003', 'Civil Lines', 'PREMIUM', 12400, 3600, 'Chikankari Anarkali', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001023', 'Pallavi Agrawal', 'Pallavi', 'Agrawal', 'Mrs.', 'Female', 'pallavi.agrawal@gmail.com', '101, Delhi Gate', 'Agra', 'Uttar Pradesh', '282002', 'Delhi Gate', 'VIP', 43200, 21600, 'Bridal Lehenga', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001024', 'Shalini Bhargava', 'Shalini', 'Bhargava', 'Mrs.', 'Female', 'shalini.bhargava@gmail.com', '44, Belanganj Market', 'Agra', 'Uttar Pradesh', '282004', 'Belanganj', 'REGULAR', 52500, 0, 'Embroidered Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001025', 'Kritika Maheshwari', 'Kritika', 'Maheshwari', 'Ms.', 'Female', 'kritika.maheshwari@gmail.com', '73, Khandari Crossing', 'Agra', 'Uttar Pradesh', '282002', 'Khandari', 'PREMIUM', 19900, 9950, 'Silk Kurti and Palazzos', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001026', 'Sonam Mathur', 'Sonam', 'Mathur', 'Ms.', 'Female', 'sonam.mathur@gmail.com', '26, Taj Nagari Phase 2', 'Agra', 'Uttar Pradesh', '282001', 'Taj Nagari', 'VIP', 15200, 2700, 'Bridal Lehenga', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001027', 'Jyoti Chauhan', 'Jyoti', 'Chauhan', 'Mrs.', 'Female', 'jyoti.chauhan@gmail.com', '61, Shahganj Main Road', 'Agra', 'Uttar Pradesh', '282010', 'Shahganj', 'REGULAR', 14300, 8050, 'Festive Salwar Suit', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001028', 'Rachna Tomar', 'Rachna', 'Tomar', 'Mrs.', 'Female', 'rachna.tomar@gmail.com', '18, Sikandra Road', 'Agra', 'Uttar Pradesh', '282007', 'Sikandra', 'PREMIUM', 16900, 2250, 'Royal Brocade Jacket', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001029', 'Preeti Sharma', 'Preeti', 'Sharma', 'Ms.', 'Female', 'preeti.sharma@gmail.com', '90, Surya Nagar', 'Agra', 'Uttar Pradesh', '282002', 'Surya Nagar', 'VIP', 19700, 7600, 'Embroidered Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001030', 'Shruti Khandelwal', 'Shruti', 'Khandelwal', 'Ms.', 'Female', 'shruti.khandelwal@gmail.com', '35, Lohamandi Bazaar', 'Agra', 'Uttar Pradesh', '282002', 'Lohamandi', 'REGULAR', 57900, 29300, 'Silk Kurti and Palazzos', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001031', 'Suman Garg', 'Suman', 'Garg', 'Mrs.', 'Female', 'suman.garg@gmail.com', '42, Bodla Crossing', 'Agra', 'Uttar Pradesh', '282007', 'Bodla', 'PREMIUM', 50400, 21600, 'Velvet Saree Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001032', 'Payal Varshney', 'Payal', 'Varshney', 'Ms.', 'Female', 'payal.varshney@gmail.com', '11, Balkeshwar Colony', 'Agra', 'Uttar Pradesh', '282004', 'Balkeshwar', 'VIP', 21500, 3600, 'Bridal Lehenga', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001033', 'Natasha Chawla', 'Natasha', 'Chawla', 'Ms.', 'Female', 'natasha.chawla@gmail.com', '67, Sadar Bazaar Promenade', 'Agra', 'Uttar Pradesh', '282001', 'Sadar', 'PREMIUM', 29700, 9950, 'Chikankari Anarkali', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Agra Showroom', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001034', 'Isha Khanna', 'Isha', 'Khanna', 'Ms.', 'Female', 'isha.khanna@gmail.com', '12, Swaroop Nagar Main Road', 'Kanpur', 'Uttar Pradesh', '208002', 'Swaroop Nagar', 'VIP', 57700, 31750, 'Bridal Lehenga', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001035', 'Simran Bhatia', 'Simran', 'Bhatia', 'Ms.', 'Female', 'simran.bhatia@gmail.com', '45, Civil Lines VIP Road', 'Kanpur', 'Uttar Pradesh', '208001', 'Civil Lines', 'PREMIUM', 16900, 2600, 'Royal Brocade Jacket', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001036', 'Richa Seth', 'Richa', 'Seth', 'Mrs.', 'Female', 'richa.seth@gmail.com', '78, Tilak Nagar Boulevard', 'Kanpur', 'Uttar Pradesh', '208002', 'Tilak Nagar', 'VIP', 19700, 4950, 'Embroidered Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001037', 'Aaradhya Bajpai', 'Aaradhya', 'Bajpai', 'Ms.', 'Female', 'aaradhya.bajpai@gmail.com', '29, Kakadeo Coaching Hub', 'Kanpur', 'Uttar Pradesh', '208025', 'Kakadeo', 'REGULAR', 57900, 7250, 'Silk Kurti and Palazzos', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001038', 'Nupur Dwivedi', 'Nupur', 'Dwivedi', 'Mrs.', 'Female', 'nupur.dwivedi@gmail.com', '83, Kidwai Nagar Block H', 'Kanpur', 'Uttar Pradesh', '208011', 'Kidwai Nagar', 'PREMIUM', 50400, 6200, 'Festive Salwar Suit', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001039', 'Barkha Awasthi', 'Barkha', 'Awasthi', 'Ms.', 'Female', 'barkha.awasthi@gmail.com', '16, Arya Nagar Heritage Lane', 'Kanpur', 'Uttar Pradesh', '208002', 'Arya Nagar', 'VIP', 21500, 6750, 'Chikankari Anarkali', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001040', 'Aparna Dixit', 'Aparna', 'Dixit', 'Mrs.', 'Female', 'aparna.dixit@gmail.com', '52, Lajpat Nagar Market', 'Kanpur', 'Uttar Pradesh', '208005', 'Lajpat Nagar', 'REGULAR', 29700, 12150, 'Velvet Saree Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001041', 'Shreya Tripathi', 'Shreya', 'Tripathi', 'Ms.', 'Female', 'shreya.tripathi@gmail.com', '34, Pandu Nagar Green View', 'Kanpur', 'Uttar Pradesh', '208005', 'Pandu Nagar', 'PREMIUM', 63100, 21600, 'Royal Brocade Jacket', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001042', 'Mansi Shukla', 'Mansi', 'Shukla', 'Ms.', 'Female', 'mansi.shukla@gmail.com', '91, Harsh Nagar Crossing', 'Kanpur', 'Uttar Pradesh', '208012', 'Harsh Nagar', 'VIP', 34200, 12200, 'Bridal Lehenga', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001043', 'Pragati Pandey', 'Pragati', 'Pandey', 'Mrs.', 'Female', 'pragati.pandey@gmail.com', '23, Govind Nagar Sector 3', 'Kanpur', 'Uttar Pradesh', '208006', 'Govind Nagar', 'REGULAR', 26700, 5750, 'Silk Kurti and Palazzos', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001044', 'Aditi Roy', 'Aditi', 'Roy', 'Ms.', 'Female', 'aditi.roy@gmail.com', '66, Shyam Nagar Main Road', 'Kanpur', 'Uttar Pradesh', '208013', 'Shyam Nagar', 'PREMIUM', 64900, 10850, 'Embroidered Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001045', 'Ritika Sengupta', 'Ritika', 'Sengupta', 'Ms.', 'Female', 'ritika.sengupta@gmail.com', '15, Gumti No. 5 Plaza', 'Kanpur', 'Uttar Pradesh', '208012', 'Gumti', 'VIP', 67700, 38750, 'Chikankari Anarkali', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001046', 'Namrata Nigam', 'Namrata', 'Nigam', 'Mrs.', 'Female', 'namrata.nigam@gmail.com', '40, Barra Sector 2', 'Kanpur', 'Uttar Pradesh', '208027', 'Barra', 'REGULAR', 26900, 7600, 'Festive Salwar Suit', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001047', 'Rashmi Rohatgi', 'Rashmi', 'Rohatgi', 'Mrs.', 'Female', 'rashmi.rohatgi@gmail.com', '58, Sharda Nagar Road', 'Kanpur', 'Uttar Pradesh', '208025', 'Sharda Nagar', 'PREMIUM', 69400, 24850, 'Velvet Saree Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001048', 'Srishti Tandon', 'Srishti', 'Tandon', 'Ms.', 'Female', 'srishti.tandon@gmail.com', '18, Mall Road Regency', 'Kanpur', 'Uttar Pradesh', '208001', 'Mall Road', 'VIP', 64700, 11100, 'Bridal Lehenga', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001049', 'Bhavna Kapoor', 'Bhavna', 'Kapoor', 'Mrs.', 'Female', 'bhavna.kapoor@gmail.com', '71, Kalyanpur GT Road', 'Kanpur', 'Uttar Pradesh', '208017', 'Kalyanpur', 'REGULAR', 32100, 12190, 'Silk Kurti and Palazzos', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;
INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, street_address, city, state, pincode, landmark, tier, total_spend, balance, favorite_garment, measurements_on_file, preferred_channel, fit_preference, notes, created_at, updated_at)
VALUES ('9811001050', 'Kajal Taneja', 'Kajal', 'Taneja', 'Ms.', 'Female', 'kajal.taneja@gmail.com', '37, Ratan Lal Nagar', 'Kanpur', 'Uttar Pradesh', '208022', 'Ratan Lal Nagar', 'PREMIUM', 41400, 14850, 'Embroidered Blouse', true, 'WhatsApp', 'Comfort / Regular Fit', 'Patron of Riwayat Couture - Kanpur Studio', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;

-- =============================================================================
-- 6. CUSTOMER BODY MEASUREMENTS (50 records - 1 per customer)
-- =============================================================================
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000001', '9811001001', 'Sunita Yadav', 'Blouse', 'CURRENT', true, 1, 'in', 14, 34, 29.5, 28, 36, 14.5, 10, 16.5, 7.0, 9.5, 9.5, 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000002', '9811001002', 'Priya Sharma', 'Blouse', 'CURRENT', true, 1, 'in', 14.3, 34.5, 30, 28.4, 36.5, 14.7, 10.6, 16.5, 7.0, 9.5, 9.5, 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000003', '9811001003', 'Ananya Pandey', 'Blouse', 'CURRENT', true, 1, 'in', 14.6, 35, 30.5, 28.8, 37, 14.9, 11.2, 16.5, 7.0, 9.5, 9.5, 'Aslam Khan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000004', '9811001004', 'Ritu Srivastava', 'Blouse', 'CURRENT', true, 1, 'in', 14.9, 35.5, 31, 29.2, 37.5, 15.1, 11.8, 16.5, 7.0, 9.5, 9.5, 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000005', '9811001005', 'Deepika Rai', 'Blouse', 'CURRENT', true, 1, 'in', 15.2, 36, 31.5, 29.6, 38, 15.3, 12.4, 16.5, 7.0, 9.5, 9.5, 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000006', '9811001006', 'Swati Joshi', 'Blouse', 'CURRENT', true, 1, 'in', 15.5, 36.5, 32, 30, 38.5, 15.5, 13, 16.5, 7.0, 9.5, 9.5, 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000007', '9811001007', 'Neha Trivedi', 'Blouse', 'CURRENT', true, 1, 'in', 15.8, 37, 32.5, 30.4, 39, 15.7, 13.6, 16.5, 7.0, 9.5, 9.5, 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000008', '9811001008', 'Divya Dubey', 'Blouse', 'CURRENT', true, 1, 'in', 16.1, 37.5, 33, 30.8, 39.5, 15.9, 14.2, 16.5, 7.0, 9.5, 9.5, 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000009', '9811001009', 'Pooja Agarwal', 'Blouse', 'CURRENT', true, 1, 'in', 16.4, 38, 33.5, 31.2, 40, 16.1, 14.8, 16.5, 7.0, 9.5, 9.5, 'Aslam Khan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000010', '9811001010', 'Meena Gupta', 'Blouse', 'CURRENT', true, 1, 'in', 14.2, 38.5, 34, 31.6, 40.5, 16.3, 15.4, 16.5, 7.0, 9.5, 9.5, 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000011', '9811001011', 'Kavya Mishra', 'Blouse', 'CURRENT', true, 1, 'in', 14.5, 39, 34.5, 32, 41, 14.5, 16, 16.5, 7.0, 9.5, 9.5, 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000012', '9811001012', 'Shivani Tiwari', 'Blouse', 'CURRENT', true, 1, 'in', 14.8, 39.5, 35, 32.4, 41.5, 14.7, 16.6, 16.5, 7.0, 9.5, 9.5, 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000013', '9811001013', 'Rekha Shukla', 'Blouse', 'CURRENT', true, 1, 'in', 15.1, 40, 35.5, 32.8, 42, 14.9, 17.2, 16.5, 7.0, 9.5, 9.5, 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000014', '9811001014', 'Anjali Singh', 'Blouse', 'CURRENT', true, 1, 'in', 15.4, 40.5, 36, 33.2, 42.5, 15.1, 17.8, 16.5, 7.0, 9.5, 9.5, 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000015', '9811001015', 'Monika Verma', 'Blouse', 'CURRENT', true, 1, 'in', 15.7, 41, 36.5, 33.6, 43, 15.3, 18.4, 16.5, 7.0, 9.5, 9.5, 'Aslam Khan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000016', '9811001016', 'Vineeta Saxena', 'Blouse', 'CURRENT', true, 1, 'in', 16, 41.5, 37, 34, 43.5, 15.5, 19, 16.5, 7.0, 9.5, 9.5, 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000017', '9811001017', 'Shweta Rastogi', 'Blouse', 'CURRENT', true, 1, 'in', 16.3, 34, 29.5, 34.4, 36, 15.7, 19.6, 16.5, 7.0, 9.5, 9.5, 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000018', '9811001018', 'Tanvi Bansal', 'Blouse', 'CURRENT', true, 1, 'in', 14.1, 34.5, 30, 34.8, 36.5, 15.9, 20.2, 16.5, 7.0, 9.5, 9.5, 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000019', '9811001019', 'Shilpa Singhal', 'Blouse', 'CURRENT', true, 1, 'in', 14.4, 35, 30.5, 28.2, 37, 16.1, 20.8, 16.5, 7.0, 9.5, 9.5, 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000020', '9811001020', 'Megha Goyal', 'Blouse', 'CURRENT', true, 1, 'in', 14.7, 35.5, 31, 28.6, 37.5, 16.3, 21.4, 16.5, 7.0, 9.5, 9.5, 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000021', '9811001021', 'Radhika Mittal', 'Blouse', 'CURRENT', true, 1, 'in', 15, 36, 31.5, 29, 38, 14.5, 10, 16.5, 7.0, 9.5, 9.5, 'Aslam Khan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000022', '9811001022', 'Garima Jain', 'Blouse', 'CURRENT', true, 1, 'in', 15.3, 36.5, 32, 29.4, 38.5, 14.7, 10.6, 16.5, 7.0, 9.5, 9.5, 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000023', '9811001023', 'Pallavi Agrawal', 'Blouse', 'CURRENT', true, 1, 'in', 15.6, 37, 32.5, 29.8, 39, 14.9, 11.2, 16.5, 7.0, 9.5, 9.5, 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000024', '9811001024', 'Shalini Bhargava', 'Blouse', 'CURRENT', true, 1, 'in', 15.9, 37.5, 33, 30.2, 39.5, 15.1, 11.8, 16.5, 7.0, 9.5, 9.5, 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000025', '9811001025', 'Kritika Maheshwari', 'Blouse', 'CURRENT', true, 1, 'in', 16.2, 38, 33.5, 30.6, 40, 15.3, 12.4, 16.5, 7.0, 9.5, 9.5, 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000026', '9811001026', 'Sonam Mathur', 'Blouse', 'CURRENT', true, 1, 'in', 14, 38.5, 34, 31, 40.5, 15.5, 13, 16.5, 7.0, 9.5, 9.5, 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000027', '9811001027', 'Jyoti Chauhan', 'Blouse', 'CURRENT', true, 1, 'in', 14.3, 39, 34.5, 31.4, 41, 15.7, 13.6, 16.5, 7.0, 9.5, 9.5, 'Aslam Khan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000028', '9811001028', 'Rachna Tomar', 'Blouse', 'CURRENT', true, 1, 'in', 14.6, 39.5, 35, 31.8, 41.5, 15.9, 14.2, 16.5, 7.0, 9.5, 9.5, 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000029', '9811001029', 'Preeti Sharma', 'Blouse', 'CURRENT', true, 1, 'in', 14.9, 40, 35.5, 32.2, 42, 16.1, 14.8, 16.5, 7.0, 9.5, 9.5, 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000030', '9811001030', 'Shruti Khandelwal', 'Blouse', 'CURRENT', true, 1, 'in', 15.2, 40.5, 36, 32.6, 42.5, 16.3, 15.4, 16.5, 7.0, 9.5, 9.5, 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000031', '9811001031', 'Suman Garg', 'Blouse', 'CURRENT', true, 1, 'in', 15.5, 41, 36.5, 33, 43, 14.5, 16, 16.5, 7.0, 9.5, 9.5, 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000032', '9811001032', 'Payal Varshney', 'Blouse', 'CURRENT', true, 1, 'in', 15.8, 41.5, 37, 33.4, 43.5, 14.7, 16.6, 16.5, 7.0, 9.5, 9.5, 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000033', '9811001033', 'Natasha Chawla', 'Blouse', 'CURRENT', true, 1, 'in', 16.1, 34, 29.5, 33.8, 36, 14.9, 17.2, 16.5, 7.0, 9.5, 9.5, 'Aslam Khan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000034', '9811001034', 'Isha Khanna', 'Blouse', 'CURRENT', true, 1, 'in', 16.4, 34.5, 30, 34.2, 36.5, 15.1, 17.8, 16.5, 7.0, 9.5, 9.5, 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000035', '9811001035', 'Simran Bhatia', 'Blouse', 'CURRENT', true, 1, 'in', 14.2, 35, 30.5, 34.6, 37, 15.3, 18.4, 16.5, 7.0, 9.5, 9.5, 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000036', '9811001036', 'Richa Seth', 'Blouse', 'CURRENT', true, 1, 'in', 14.5, 35.5, 31, 28, 37.5, 15.5, 19, 16.5, 7.0, 9.5, 9.5, 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000037', '9811001037', 'Aaradhya Bajpai', 'Blouse', 'CURRENT', true, 1, 'in', 14.8, 36, 31.5, 28.4, 38, 15.7, 19.6, 16.5, 7.0, 9.5, 9.5, 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000038', '9811001038', 'Nupur Dwivedi', 'Blouse', 'CURRENT', true, 1, 'in', 15.1, 36.5, 32, 28.8, 38.5, 15.9, 20.2, 16.5, 7.0, 9.5, 9.5, 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000039', '9811001039', 'Barkha Awasthi', 'Blouse', 'CURRENT', true, 1, 'in', 15.4, 37, 32.5, 29.2, 39, 16.1, 20.8, 16.5, 7.0, 9.5, 9.5, 'Aslam Khan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000040', '9811001040', 'Aparna Dixit', 'Blouse', 'CURRENT', true, 1, 'in', 15.7, 37.5, 33, 29.6, 39.5, 16.3, 21.4, 16.5, 7.0, 9.5, 9.5, 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000041', '9811001041', 'Shreya Tripathi', 'Blouse', 'CURRENT', true, 1, 'in', 16, 38, 33.5, 30, 40, 14.5, 10, 16.5, 7.0, 9.5, 9.5, 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000042', '9811001042', 'Mansi Shukla', 'Blouse', 'CURRENT', true, 1, 'in', 16.3, 38.5, 34, 30.4, 40.5, 14.7, 10.6, 16.5, 7.0, 9.5, 9.5, 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000043', '9811001043', 'Pragati Pandey', 'Blouse', 'CURRENT', true, 1, 'in', 14.1, 39, 34.5, 30.8, 41, 14.9, 11.2, 16.5, 7.0, 9.5, 9.5, 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000044', '9811001044', 'Aditi Roy', 'Blouse', 'CURRENT', true, 1, 'in', 14.4, 39.5, 35, 31.2, 41.5, 15.1, 11.8, 16.5, 7.0, 9.5, 9.5, 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000045', '9811001045', 'Ritika Sengupta', 'Blouse', 'CURRENT', true, 1, 'in', 14.7, 40, 35.5, 31.6, 42, 15.3, 12.4, 16.5, 7.0, 9.5, 9.5, 'Aslam Khan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000046', '9811001046', 'Namrata Nigam', 'Blouse', 'CURRENT', true, 1, 'in', 15, 40.5, 36, 32, 42.5, 15.5, 13, 16.5, 7.0, 9.5, 9.5, 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000047', '9811001047', 'Rashmi Rohatgi', 'Blouse', 'CURRENT', true, 1, 'in', 15.3, 41, 36.5, 32.4, 43, 15.7, 13.6, 16.5, 7.0, 9.5, 9.5, 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000048', '9811001048', 'Srishti Tandon', 'Blouse', 'CURRENT', true, 1, 'in', 15.6, 41.5, 37, 32.8, 43.5, 15.9, 14.2, 16.5, 7.0, 9.5, 9.5, 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000049', '9811001049', 'Bhavna Kapoor', 'Blouse', 'CURRENT', true, 1, 'in', 15.9, 34, 29.5, 33.2, 36, 16.1, 14.8, 16.5, 7.0, 9.5, 9.5, 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, sleeve_length, armhole, front_neck_depth, back_neck_depth, bust_point, recorded_by, recorded_at, updated_at)
VALUES ('a1000000-0000-0000-0000-000000000050', '9811001050', 'Kajal Taneja', 'Blouse', 'CURRENT', true, 1, 'in', 16.2, 34.5, 30, 33.6, 36.5, 16.3, 15.4, 16.5, 7.0, 9.5, 9.5, 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 7. ORDERS (125 bespoke orders)
-- =============================================================================
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000001', 'ORD-2026-0001', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Awadh Nazakat and Chikankari Heritage 2026', 4500, 4500, 2250, 2250, 'IN_PRODUCTION', '2026-01-18'::date, '2026-01-28'::date, '2026-01-28'::date, NULL, '9811001001', 'Sunita Yadav', 'STITCHING', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000002', 'ORD-2026-0002', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Awadh Nazakat and Chikankari Heritage 2026', 14500, 14500, 7250, 7250, 'IN_PRODUCTION', '2026-01-25'::date, '2026-02-14'::date, '2026-02-14'::date, NULL, '9811001002', 'Priya Sharma', 'STITCHING', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000003', 'ORD-2026-0003', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Awadh Nazakat and Chikankari Heritage 2026', 7200, 7200, 3600, 3600, 'IN_PRODUCTION', '2026-02-01'::date, '2026-02-15'::date, '2026-02-15'::date, NULL, '9811001003', 'Ananya Pandey', 'STITCHING', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000004', 'ORD-2026-0004', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Awadh Nazakat and Chikankari Heritage 2026', 5400, 5400, 5400, 0, 'COMPLETED', '2026-02-08'::date, '2026-02-20'::date, '2026-02-20'::date, NULL, '9811001004', 'Ritu Srivastava', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000005', 'ORD-2026-0005', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Awadh Nazakat and Chikankari Heritage 2026', 5200, 5200, 5200, 0, 'DELIVERED', '2026-02-15'::date, '2026-02-24'::date, '2026-02-24'::date, '2026-02-24'::date, '9811001005', 'Deepika Rai', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000006', 'ORD-2026-0006', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Awadh Nazakat and Chikankari Heritage 2026', 9800, 9800, 4900, 4900, 'IN_PRODUCTION', '2026-02-22'::date, '2026-03-12'::date, '2026-03-12'::date, NULL, '9811001006', 'Swati Joshi', 'STITCHING', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000007', 'ORD-2026-0007', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Awadh Nazakat and Chikankari Heritage 2026', 38000, 38000, 11400, 26600, 'PENDING', '2026-03-01'::date, '2026-03-31'::date, '2026-03-31'::date, NULL, '9811001007', 'Neha Trivedi', 'ORDER_TAKEN', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000008', 'ORD-2026-0008', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Awadh Nazakat and Chikankari Heritage 2026', 4500, 4500, 4500, 0, 'COMPLETED', '2026-03-08'::date, '2026-03-18'::date, '2026-03-18'::date, NULL, '9811001008', 'Divya Dubey', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000009', 'ORD-2026-0009', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Awadh Nazakat and Chikankari Heritage 2026', 14500, 14500, 7250, 7250, 'IN_PRODUCTION', '2026-03-15'::date, '2026-04-04'::date, '2026-04-04'::date, NULL, '9811001009', 'Pooja Agarwal', 'STITCHING', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000010', 'ORD-2026-0010', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Awadh Nazakat and Chikankari Heritage 2026', 7200, 7200, 7200, 0, 'DELIVERED', '2026-03-22'::date, '2026-04-05'::date, '2026-04-05'::date, '2026-04-05'::date, '9811001010', 'Meena Gupta', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000011', 'ORD-2026-0011', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Awadh Nazakat and Chikankari Heritage 2026', 5400, 5400, 2700, 2700, 'IN_PRODUCTION', '2026-03-29'::date, '2026-04-10'::date, '2026-04-10'::date, NULL, '9811001011', 'Kavya Mishra', 'STITCHING', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000012', 'ORD-2026-0012', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Awadh Nazakat and Chikankari Heritage 2026', 5200, 5200, 5200, 0, 'COMPLETED', '2026-04-05'::date, '2026-04-14'::date, '2026-04-14'::date, NULL, '9811001012', 'Shivani Tiwari', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000013', 'ORD-2026-0013', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Awadh Nazakat and Chikankari Heritage 2026', 9800, 9800, 4900, 4900, 'IN_PRODUCTION', '2026-04-12'::date, '2026-04-30'::date, '2026-04-30'::date, NULL, '9811001013', 'Rekha Shukla', 'STITCHING', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000014', 'ORD-2026-0014', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Awadh Nazakat and Chikankari Heritage 2026', 4500, 4500, 1350, 3150, 'PENDING', '2026-04-19'::date, '2026-04-29'::date, '2026-04-29'::date, NULL, '9811001013', 'Rekha Shukla', 'ORDER_TAKEN', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000015', 'ORD-2026-0015', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Awadh Nazakat and Chikankari Heritage 2026', 4500, 4500, 4500, 0, 'DELIVERED', '2026-04-26'::date, '2026-05-06'::date, '2026-05-06'::date, '2026-05-06'::date, '9811001014', 'Anjali Singh', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000016', 'ORD-2026-0016', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Awadh Nazakat and Chikankari Heritage 2026', 7200, 7200, 7200, 0, 'COMPLETED', '2026-05-03'::date, '2026-05-17'::date, '2026-05-17'::date, NULL, '9811001014', 'Anjali Singh', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000017', 'ORD-2026-0017', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Awadh Nazakat and Chikankari Heritage 2026', 7200, 7200, 3600, 3600, 'IN_PRODUCTION', '2026-05-10'::date, '2026-05-24'::date, '2026-05-24'::date, NULL, '9811001015', 'Monika Verma', 'STITCHING', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000018', 'ORD-2026-0018', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Awadh Nazakat and Chikankari Heritage 2026', 5200, 5200, 2600, 2600, 'IN_PRODUCTION', '2026-05-17'::date, '2026-05-26'::date, '2026-05-26'::date, NULL, '9811001015', 'Monika Verma', 'STITCHING', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000019', 'ORD-2026-0019', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Awadh Nazakat and Chikankari Heritage 2026', 5200, 5200, 2600, 2600, 'IN_PRODUCTION', '2026-05-24'::date, '2026-06-02'::date, '2026-06-02'::date, NULL, '9811001016', 'Vineeta Saxena', 'STITCHING', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000020', 'ORD-2026-0020', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Awadh Nazakat and Chikankari Heritage 2026', 38000, 38000, 38000, 0, 'COMPLETED', '2026-05-31'::date, '2026-06-30'::date, '2026-06-30'::date, NULL, '9811001016', 'Vineeta Saxena', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000021', 'ORD-2026-0021', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Awadh Nazakat and Chikankari Heritage 2026', 38000, 38000, 11400, 26600, 'PENDING', '2026-06-07'::date, '2026-07-07'::date, '2026-07-07'::date, NULL, '9811001017', 'Shweta Rastogi', 'ORDER_TAKEN', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000022', 'ORD-2026-0022', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Awadh Nazakat and Chikankari Heritage 2026', 14500, 14500, 7250, 7250, 'IN_PRODUCTION', '2026-06-14'::date, '2026-07-04'::date, '2026-07-04'::date, NULL, '9811001017', 'Shweta Rastogi', 'STITCHING', 'Branch: Riwayat Couture - Lucknow Flagship HQ', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000023', 'ORD-2026-0023', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Noor-e-Taj Royal Velvet Bridal Edit', 14500, 14500, 7250, 7250, 'IN_PRODUCTION', '2026-06-21'::date, '2026-07-11'::date, '2026-07-11'::date, NULL, '9811001018', 'Tanvi Bansal', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000024', 'ORD-2026-0024', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 5400, 5400, 5400, 0, 'COMPLETED', '2026-06-28'::date, '2026-07-10'::date, '2026-07-10'::date, NULL, '9811001018', 'Tanvi Bansal', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000025', 'ORD-2026-0025', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 5400, 5400, 5400, 0, 'DELIVERED', '2026-07-05'::date, '2026-07-17'::date, '2026-07-17'::date, '2026-07-17'::date, '9811001019', 'Shilpa Singhal', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000026', 'ORD-2026-0026', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 9800, 9800, 4900, 4900, 'IN_PRODUCTION', '2026-07-12'::date, '2026-07-30'::date, '2026-07-30'::date, NULL, '9811001019', 'Shilpa Singhal', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000027', 'ORD-2026-0027', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 9800, 9800, 4900, 4900, 'IN_PRODUCTION', '2026-07-19'::date, '2026-08-06'::date, '2026-08-06'::date, NULL, '9811001020', 'Megha Goyal', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000028', 'ORD-2026-0028', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Noor-e-Taj Royal Velvet Bridal Edit', 4500, 4500, 4500, 0, 'COMPLETED', '2026-07-26'::date, '2026-08-05'::date, '2026-08-05'::date, NULL, '9811001020', 'Megha Goyal', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000029', 'ORD-2026-0029', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Noor-e-Taj Royal Velvet Bridal Edit', 4500, 4500, 2250, 2250, 'IN_PRODUCTION', '2026-08-02'::date, '2026-08-12'::date, '2026-08-12'::date, NULL, '9811001021', 'Radhika Mittal', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000030', 'ORD-2026-0030', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Noor-e-Taj Royal Velvet Bridal Edit', 7200, 7200, 7200, 0, 'DELIVERED', '2026-08-09'::date, '2026-08-23'::date, '2026-08-23'::date, '2026-08-23'::date, '9811001021', 'Radhika Mittal', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000031', 'ORD-2026-0031', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Noor-e-Taj Royal Velvet Bridal Edit', 7200, 7200, 3600, 3600, 'IN_PRODUCTION', '2026-08-16'::date, '2026-08-30'::date, '2026-08-30'::date, NULL, '9811001022', 'Garima Jain', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000032', 'ORD-2026-0032', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Noor-e-Taj Royal Velvet Bridal Edit', 5200, 5200, 5200, 0, 'COMPLETED', '2026-08-23'::date, '2026-09-01'::date, '2026-09-01'::date, NULL, '9811001022', 'Garima Jain', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000033', 'ORD-2026-0033', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Noor-e-Taj Royal Velvet Bridal Edit', 5200, 5200, 2600, 2600, 'IN_PRODUCTION', '2026-08-30'::date, '2026-09-08'::date, '2026-09-08'::date, NULL, '9811001023', 'Pallavi Agrawal', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000034', 'ORD-2026-0034', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Noor-e-Taj Royal Velvet Bridal Edit', 38000, 38000, 19000, 19000, 'IN_PRODUCTION', '2026-09-06'::date, '2026-10-06'::date, '2026-10-06'::date, NULL, '9811001023', 'Pallavi Agrawal', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000035', 'ORD-2026-0035', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Noor-e-Taj Royal Velvet Bridal Edit', 38000, 38000, 38000, 0, 'DELIVERED', '2026-01-16'::date, '2026-02-15'::date, '2026-02-15'::date, '2026-02-15'::date, '9811001024', 'Shalini Bhargava', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000036', 'ORD-2026-0036', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Noor-e-Taj Royal Velvet Bridal Edit', 14500, 14500, 14500, 0, 'COMPLETED', '2026-01-23'::date, '2026-02-12'::date, '2026-02-12'::date, NULL, '9811001024', 'Shalini Bhargava', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000037', 'ORD-2026-0037', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Noor-e-Taj Royal Velvet Bridal Edit', 14500, 14500, 7250, 7250, 'IN_PRODUCTION', '2026-01-30'::date, '2026-02-19'::date, '2026-02-19'::date, NULL, '9811001025', 'Kritika Maheshwari', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000038', 'ORD-2026-0038', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 5400, 5400, 2700, 2700, 'IN_PRODUCTION', '2026-02-06'::date, '2026-02-18'::date, '2026-02-18'::date, NULL, '9811001025', 'Kritika Maheshwari', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000039', 'ORD-2026-0039', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 5400, 5400, 2700, 2700, 'IN_PRODUCTION', '2026-02-13'::date, '2026-02-25'::date, '2026-02-25'::date, NULL, '9811001026', 'Sonam Mathur', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000040', 'ORD-2026-0040', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 9800, 9800, 9800, 0, 'COMPLETED', '2026-02-20'::date, '2026-03-10'::date, '2026-03-10'::date, NULL, '9811001026', 'Sonam Mathur', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000041', 'ORD-2026-0041', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 9800, 9800, 4900, 4900, 'IN_PRODUCTION', '2026-02-27'::date, '2026-03-17'::date, '2026-03-17'::date, NULL, '9811001027', 'Jyoti Chauhan', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000042', 'ORD-2026-0042', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Noor-e-Taj Royal Velvet Bridal Edit', 4500, 4500, 1350, 3150, 'PENDING', '2026-03-06'::date, '2026-03-16'::date, '2026-03-16'::date, NULL, '9811001027', 'Jyoti Chauhan', 'ORDER_TAKEN', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000043', 'ORD-2026-0043', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Noor-e-Taj Royal Velvet Bridal Edit', 4500, 4500, 2250, 2250, 'IN_PRODUCTION', '2026-03-13'::date, '2026-03-23'::date, '2026-03-23'::date, NULL, '9811001028', 'Rachna Tomar', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000044', 'ORD-2026-0044', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Noor-e-Taj Royal Velvet Bridal Edit', 7200, 7200, 7200, 0, 'COMPLETED', '2026-03-20'::date, '2026-04-03'::date, '2026-04-03'::date, NULL, '9811001028', 'Rachna Tomar', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000045', 'ORD-2026-0045', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Noor-e-Taj Royal Velvet Bridal Edit', 5200, 5200, 5200, 0, 'DELIVERED', '2026-03-27'::date, '2026-04-05'::date, '2026-04-05'::date, '2026-04-05'::date, '9811001028', 'Rachna Tomar', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000046', 'ORD-2026-0046', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 5400, 5400, 2700, 2700, 'IN_PRODUCTION', '2026-04-03'::date, '2026-04-15'::date, '2026-04-15'::date, NULL, '9811001029', 'Preeti Sharma', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000047', 'ORD-2026-0047', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 9800, 9800, 4900, 4900, 'IN_PRODUCTION', '2026-04-10'::date, '2026-04-28'::date, '2026-04-28'::date, NULL, '9811001029', 'Preeti Sharma', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000048', 'ORD-2026-0048', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Noor-e-Taj Royal Velvet Bridal Edit', 4500, 4500, 4500, 0, 'COMPLETED', '2026-04-17'::date, '2026-04-27'::date, '2026-04-27'::date, NULL, '9811001029', 'Preeti Sharma', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000049', 'ORD-2026-0049', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Noor-e-Taj Royal Velvet Bridal Edit', 38000, 38000, 11400, 26600, 'PENDING', '2026-04-24'::date, '2026-05-24'::date, '2026-05-24'::date, NULL, '9811001030', 'Shruti Khandelwal', 'ORDER_TAKEN', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000050', 'ORD-2026-0050', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Noor-e-Taj Royal Velvet Bridal Edit', 14500, 14500, 14500, 0, 'DELIVERED', '2026-05-01'::date, '2026-05-21'::date, '2026-05-21'::date, '2026-05-21'::date, '9811001030', 'Shruti Khandelwal', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000051', 'ORD-2026-0051', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 5400, 5400, 2700, 2700, 'IN_PRODUCTION', '2026-05-08'::date, '2026-05-20'::date, '2026-05-20'::date, NULL, '9811001030', 'Shruti Khandelwal', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000052', 'ORD-2026-0052', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Noor-e-Taj Royal Velvet Bridal Edit', 7200, 7200, 7200, 0, 'COMPLETED', '2026-05-15'::date, '2026-05-29'::date, '2026-05-29'::date, NULL, '9811001031', 'Suman Garg', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000053', 'ORD-2026-0053', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Noor-e-Taj Royal Velvet Bridal Edit', 5200, 5200, 2600, 2600, 'IN_PRODUCTION', '2026-05-22'::date, '2026-05-31'::date, '2026-05-31'::date, NULL, '9811001031', 'Suman Garg', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000054', 'ORD-2026-0054', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Noor-e-Taj Royal Velvet Bridal Edit', 38000, 38000, 19000, 19000, 'IN_PRODUCTION', '2026-05-29'::date, '2026-06-28'::date, '2026-06-28'::date, NULL, '9811001031', 'Suman Garg', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000055', 'ORD-2026-0055', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 9800, 9800, 9800, 0, 'DELIVERED', '2026-06-05'::date, '2026-06-23'::date, '2026-06-23'::date, '2026-06-23'::date, '9811001032', 'Payal Varshney', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000056', 'ORD-2026-0056', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Noor-e-Taj Royal Velvet Bridal Edit', 4500, 4500, 4500, 0, 'COMPLETED', '2026-06-12'::date, '2026-06-22'::date, '2026-06-22'::date, NULL, '9811001032', 'Payal Varshney', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000057', 'ORD-2026-0057', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Noor-e-Taj Royal Velvet Bridal Edit', 7200, 7200, 3600, 3600, 'IN_PRODUCTION', '2026-06-19'::date, '2026-07-03'::date, '2026-07-03'::date, NULL, '9811001032', 'Payal Varshney', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000058', 'ORD-2026-0058', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Noor-e-Taj Royal Velvet Bridal Edit', 14500, 14500, 7250, 7250, 'IN_PRODUCTION', '2026-06-26'::date, '2026-07-16'::date, '2026-07-16'::date, NULL, '9811001033', 'Natasha Chawla', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000059', 'ORD-2026-0059', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 5400, 5400, 2700, 2700, 'IN_PRODUCTION', '2026-07-03'::date, '2026-07-15'::date, '2026-07-15'::date, NULL, '9811001033', 'Natasha Chawla', 'STITCHING', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000060', 'ORD-2026-0060', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 9800, 9800, 9800, 0, 'COMPLETED', '2026-07-10'::date, '2026-07-28'::date, '2026-07-28'::date, NULL, '9811001033', 'Natasha Chawla', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Agra Showroom', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000061', 'ORD-2026-0061', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 5200, 5200, 2600, 2600, 'IN_PRODUCTION', '2026-07-17'::date, '2026-07-26'::date, '2026-07-26'::date, NULL, '9811001034', 'Isha Khanna', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000062', 'ORD-2026-0062', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 38000, 38000, 19000, 19000, 'IN_PRODUCTION', '2026-07-24'::date, '2026-08-23'::date, '2026-08-23'::date, NULL, '9811001034', 'Isha Khanna', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000063', 'ORD-2026-0063', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 14500, 14500, 4350, 10150, 'PENDING', '2026-07-31'::date, '2026-08-20'::date, '2026-08-20'::date, NULL, '9811001034', 'Isha Khanna', 'ORDER_TAKEN', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000064', 'ORD-2026-0064', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 4500, 4500, 4500, 0, 'COMPLETED', '2026-08-07'::date, '2026-08-17'::date, '2026-08-17'::date, NULL, '9811001035', 'Simran Bhatia', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000065', 'ORD-2026-0065', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 7200, 7200, 7200, 0, 'DELIVERED', '2026-08-14'::date, '2026-08-28'::date, '2026-08-28'::date, '2026-08-28'::date, '9811001035', 'Simran Bhatia', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000066', 'ORD-2026-0066', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 5200, 5200, 2600, 2600, 'IN_PRODUCTION', '2026-08-21'::date, '2026-08-30'::date, '2026-08-30'::date, NULL, '9811001035', 'Simran Bhatia', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000067', 'ORD-2026-0067', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 5400, 5400, 2700, 2700, 'IN_PRODUCTION', '2026-08-28'::date, '2026-09-09'::date, '2026-09-09'::date, NULL, '9811001036', 'Richa Seth', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000068', 'ORD-2026-0068', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 9800, 9800, 9800, 0, 'COMPLETED', '2026-09-04'::date, '2026-09-22'::date, '2026-09-22'::date, NULL, '9811001036', 'Richa Seth', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000069', 'ORD-2026-0069', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 4500, 4500, 2250, 2250, 'IN_PRODUCTION', '2026-01-14'::date, '2026-01-24'::date, '2026-01-24'::date, NULL, '9811001036', 'Richa Seth', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000070', 'ORD-2026-0070', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 38000, 38000, 38000, 0, 'DELIVERED', '2026-01-21'::date, '2026-02-20'::date, '2026-02-20'::date, '2026-02-20'::date, '9811001037', 'Aaradhya Bajpai', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000071', 'ORD-2026-0071', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 14500, 14500, 7250, 7250, 'IN_PRODUCTION', '2026-01-28'::date, '2026-02-17'::date, '2026-02-17'::date, NULL, '9811001037', 'Aaradhya Bajpai', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000072', 'ORD-2026-0072', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 5400, 5400, 5400, 0, 'COMPLETED', '2026-02-04'::date, '2026-02-16'::date, '2026-02-16'::date, NULL, '9811001037', 'Aaradhya Bajpai', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000073', 'ORD-2026-0073', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 7200, 7200, 3600, 3600, 'IN_PRODUCTION', '2026-02-11'::date, '2026-02-25'::date, '2026-02-25'::date, NULL, '9811001038', 'Nupur Dwivedi', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000074', 'ORD-2026-0074', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 5200, 5200, 2600, 2600, 'IN_PRODUCTION', '2026-02-18'::date, '2026-02-27'::date, '2026-02-27'::date, NULL, '9811001038', 'Nupur Dwivedi', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000075', 'ORD-2026-0075', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 38000, 38000, 38000, 0, 'DELIVERED', '2026-02-25'::date, '2026-03-27'::date, '2026-03-27'::date, '2026-03-27'::date, '9811001038', 'Nupur Dwivedi', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000076', 'ORD-2026-0076', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 9800, 9800, 9800, 0, 'COMPLETED', '2026-03-04'::date, '2026-03-22'::date, '2026-03-22'::date, NULL, '9811001039', 'Barkha Awasthi', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000077', 'ORD-2026-0077', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 4500, 4500, 1350, 3150, 'PENDING', '2026-03-11'::date, '2026-03-21'::date, '2026-03-21'::date, NULL, '9811001039', 'Barkha Awasthi', 'ORDER_TAKEN', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000078', 'ORD-2026-0078', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 7200, 7200, 3600, 3600, 'IN_PRODUCTION', '2026-03-18'::date, '2026-04-01'::date, '2026-04-01'::date, NULL, '9811001039', 'Barkha Awasthi', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000079', 'ORD-2026-0079', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 14500, 14500, 7250, 7250, 'IN_PRODUCTION', '2026-03-25'::date, '2026-04-14'::date, '2026-04-14'::date, NULL, '9811001040', 'Aparna Dixit', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000080', 'ORD-2026-0080', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 5400, 5400, 5400, 0, 'COMPLETED', '2026-04-01'::date, '2026-04-13'::date, '2026-04-13'::date, NULL, '9811001040', 'Aparna Dixit', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000081', 'ORD-2026-0081', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 9800, 9800, 4900, 4900, 'IN_PRODUCTION', '2026-04-08'::date, '2026-04-26'::date, '2026-04-26'::date, NULL, '9811001040', 'Aparna Dixit', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000082', 'ORD-2026-0082', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 5200, 5200, 2600, 2600, 'IN_PRODUCTION', '2026-04-15'::date, '2026-04-24'::date, '2026-04-24'::date, NULL, '9811001041', 'Shreya Tripathi', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000083', 'ORD-2026-0083', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 38000, 38000, 19000, 19000, 'IN_PRODUCTION', '2026-04-22'::date, '2026-05-22'::date, '2026-05-22'::date, NULL, '9811001041', 'Shreya Tripathi', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000084', 'ORD-2026-0084', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 14500, 14500, 14500, 0, 'COMPLETED', '2026-04-29'::date, '2026-05-19'::date, '2026-05-19'::date, NULL, '9811001041', 'Shreya Tripathi', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000085', 'ORD-2026-0085', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 5400, 5400, 5400, 0, 'DELIVERED', '2026-05-06'::date, '2026-05-18'::date, '2026-05-18'::date, '2026-05-18'::date, '9811001041', 'Shreya Tripathi', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000086', 'ORD-2026-0086', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 14500, 14500, 7250, 7250, 'IN_PRODUCTION', '2026-05-13'::date, '2026-06-02'::date, '2026-06-02'::date, NULL, '9811001042', 'Mansi Shukla', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000087', 'ORD-2026-0087', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 5400, 5400, 2700, 2700, 'IN_PRODUCTION', '2026-05-20'::date, '2026-06-01'::date, '2026-06-01'::date, NULL, '9811001042', 'Mansi Shukla', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000088', 'ORD-2026-0088', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 9800, 9800, 9800, 0, 'COMPLETED', '2026-05-27'::date, '2026-06-14'::date, '2026-06-14'::date, NULL, '9811001042', 'Mansi Shukla', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000089', 'ORD-2026-0089', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 4500, 4500, 2250, 2250, 'IN_PRODUCTION', '2026-06-03'::date, '2026-06-13'::date, '2026-06-13'::date, NULL, '9811001042', 'Mansi Shukla', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000090', 'ORD-2026-0090', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 9800, 9800, 9800, 0, 'DELIVERED', '2026-06-10'::date, '2026-06-28'::date, '2026-06-28'::date, '2026-06-28'::date, '9811001043', 'Pragati Pandey', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000091', 'ORD-2026-0091', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 4500, 4500, 1350, 3150, 'PENDING', '2026-06-17'::date, '2026-06-27'::date, '2026-06-27'::date, NULL, '9811001043', 'Pragati Pandey', 'ORDER_TAKEN', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000092', 'ORD-2026-0092', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 7200, 7200, 7200, 0, 'COMPLETED', '2026-06-24'::date, '2026-07-08'::date, '2026-07-08'::date, NULL, '9811001043', 'Pragati Pandey', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000093', 'ORD-2026-0093', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 5200, 5200, 2600, 2600, 'IN_PRODUCTION', '2026-07-01'::date, '2026-07-10'::date, '2026-07-10'::date, NULL, '9811001043', 'Pragati Pandey', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000094', 'ORD-2026-0094', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 7200, 7200, 3600, 3600, 'IN_PRODUCTION', '2026-07-08'::date, '2026-07-22'::date, '2026-07-22'::date, NULL, '9811001044', 'Aditi Roy', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000095', 'ORD-2026-0095', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 5200, 5200, 5200, 0, 'DELIVERED', '2026-07-15'::date, '2026-07-24'::date, '2026-07-24'::date, '2026-07-24'::date, '9811001044', 'Aditi Roy', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000096', 'ORD-2026-0096', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 38000, 38000, 38000, 0, 'COMPLETED', '2026-07-22'::date, '2026-08-21'::date, '2026-08-21'::date, NULL, '9811001044', 'Aditi Roy', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000097', 'ORD-2026-0097', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 14500, 14500, 7250, 7250, 'IN_PRODUCTION', '2026-07-29'::date, '2026-08-18'::date, '2026-08-18'::date, NULL, '9811001044', 'Aditi Roy', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000098', 'ORD-2026-0098', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 38000, 38000, 11400, 26600, 'PENDING', '2026-08-05'::date, '2026-09-04'::date, '2026-09-04'::date, NULL, '9811001045', 'Ritika Sengupta', 'ORDER_TAKEN', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000099', 'ORD-2026-0099', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 14500, 14500, 7250, 7250, 'IN_PRODUCTION', '2026-08-12'::date, '2026-09-01'::date, '2026-09-01'::date, NULL, '9811001045', 'Ritika Sengupta', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000100', 'ORD-2026-0100', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 5400, 5400, 5400, 0, 'COMPLETED', '2026-08-19'::date, '2026-08-31'::date, '2026-08-31'::date, NULL, '9811001045', 'Ritika Sengupta', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000101', 'ORD-2026-0101', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 9800, 9800, 4900, 4900, 'IN_PRODUCTION', '2026-08-26'::date, '2026-09-13'::date, '2026-09-13'::date, NULL, '9811001045', 'Ritika Sengupta', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000102', 'ORD-2026-0102', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 5400, 5400, 2700, 2700, 'IN_PRODUCTION', '2026-09-02'::date, '2026-09-14'::date, '2026-09-14'::date, NULL, '9811001046', 'Namrata Nigam', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000103', 'ORD-2026-0103', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 9800, 9800, 4900, 4900, 'IN_PRODUCTION', '2026-01-12'::date, '2026-01-30'::date, '2026-01-30'::date, NULL, '9811001046', 'Namrata Nigam', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000104', 'ORD-2026-0104', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 4500, 4500, 4500, 0, 'COMPLETED', '2026-01-19'::date, '2026-01-29'::date, '2026-01-29'::date, NULL, '9811001046', 'Namrata Nigam', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000105', 'ORD-2026-0105', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 7200, 7200, 7200, 0, 'DELIVERED', '2026-01-26'::date, '2026-02-09'::date, '2026-02-09'::date, '2026-02-09'::date, '9811001046', 'Namrata Nigam', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000106', 'ORD-2026-0106', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 4500, 4500, 2250, 2250, 'IN_PRODUCTION', '2026-02-02'::date, '2026-02-12'::date, '2026-02-12'::date, NULL, '9811001047', 'Rashmi Rohatgi', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000107', 'ORD-2026-0107', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 7200, 7200, 3600, 3600, 'IN_PRODUCTION', '2026-02-09'::date, '2026-02-23'::date, '2026-02-23'::date, NULL, '9811001047', 'Rashmi Rohatgi', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000108', 'ORD-2026-0108', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 5200, 5200, 5200, 0, 'COMPLETED', '2026-02-16'::date, '2026-02-25'::date, '2026-02-25'::date, NULL, '9811001047', 'Rashmi Rohatgi', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000109', 'ORD-2026-0109', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 38000, 38000, 19000, 19000, 'IN_PRODUCTION', '2026-02-23'::date, '2026-03-25'::date, '2026-03-25'::date, NULL, '9811001047', 'Rashmi Rohatgi', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000110', 'ORD-2026-0110', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 14500, 14500, 14500, 0, 'DELIVERED', '2026-03-02'::date, '2026-03-22'::date, '2026-03-22'::date, '2026-03-22'::date, '9811001047', 'Rashmi Rohatgi', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000111', 'ORD-2026-0111', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 9800, 9800, 4900, 4900, 'IN_PRODUCTION', '2026-03-09'::date, '2026-03-27'::date, '2026-03-27'::date, NULL, '9811001048', 'Srishti Tandon', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000112', 'ORD-2026-0112', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 4500, 4500, 4500, 0, 'COMPLETED', '2026-03-16'::date, '2026-03-26'::date, '2026-03-26'::date, NULL, '9811001048', 'Srishti Tandon', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000113', 'ORD-2026-0113', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 7200, 7200, 3600, 3600, 'IN_PRODUCTION', '2026-03-23'::date, '2026-04-06'::date, '2026-04-06'::date, NULL, '9811001048', 'Srishti Tandon', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000114', 'ORD-2026-0114', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 5200, 5200, 2600, 2600, 'IN_PRODUCTION', '2026-03-30'::date, '2026-04-08'::date, '2026-04-08'::date, NULL, '9811001048', 'Srishti Tandon', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000115', 'ORD-2026-0115', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 38000, 38000, 38000, 0, 'DELIVERED', '2026-04-06'::date, '2026-05-06'::date, '2026-05-06'::date, '2026-05-06'::date, '9811001048', 'Srishti Tandon', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000116', 'ORD-2026-0116', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 5400, 5400, 5400, 0, 'COMPLETED', '2026-04-13'::date, '2026-04-25'::date, '2026-04-25'::date, NULL, '9811001049', 'Bhavna Kapoor', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000117', 'ORD-2026-0117', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 9800, 9800, 4900, 4900, 'IN_PRODUCTION', '2026-04-20'::date, '2026-05-08'::date, '2026-05-08'::date, NULL, '9811001049', 'Bhavna Kapoor', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000118', 'ORD-2026-0118', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 4500, 4500, 2250, 2250, 'IN_PRODUCTION', '2026-04-27'::date, '2026-05-07'::date, '2026-05-07'::date, NULL, '9811001049', 'Bhavna Kapoor', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000119', 'ORD-2026-0119', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 7200, 7200, 2160, 5040, 'PENDING', '2026-05-04'::date, '2026-05-18'::date, '2026-05-18'::date, NULL, '9811001049', 'Bhavna Kapoor', 'ORDER_TAKEN', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000120', 'ORD-2026-0120', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 5200, 5200, 5200, 0, 'COMPLETED', '2026-05-11'::date, '2026-05-20'::date, '2026-05-20'::date, NULL, '9811001049', 'Bhavna Kapoor', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000121', 'ORD-2026-0121', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 14500, 14500, 7250, 7250, 'IN_PRODUCTION', '2026-05-18'::date, '2026-06-07'::date, '2026-06-07'::date, NULL, '9811001050', 'Kajal Taneja', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000122', 'ORD-2026-0122', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 5400, 5400, 2700, 2700, 'IN_PRODUCTION', '2026-05-25'::date, '2026-06-06'::date, '2026-06-06'::date, NULL, '9811001050', 'Kajal Taneja', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000123', 'ORD-2026-0123', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 9800, 9800, 4900, 4900, 'IN_PRODUCTION', '2026-06-01'::date, '2026-06-19'::date, '2026-06-19'::date, NULL, '9811001050', 'Kajal Taneja', 'STITCHING', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000124', 'ORD-2026-0124', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 4500, 4500, 4500, 0, 'COMPLETED', '2026-06-08'::date, '2026-06-18'::date, '2026-06-18'::date, NULL, '9811001050', 'Kajal Taneja', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;
INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, total_amount, advance_paid, balance_amount, status, order_date, due_date, expected_delivery_date, delivered_date, customer_mobile, customer_name, current_stage, production_notes, qc_rework_count, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000125', 'ORD-2026-0125', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 7200, 7200, 7200, 0, 'DELIVERED', '2026-06-15'::date, '2026-06-29'::date, '2026-06-29'::date, '2026-06-29'::date, '9811001050', 'Kajal Taneja', 'READY_TO_DELIVER', 'Branch: Riwayat Couture - Kanpur Studio', 0, NOW(), NOW())
ON CONFLICT (order_code) DO NOTHING;

-- =============================================================================
-- 8. GARMENTS (125 items linked 1:1 with Orders)
-- =============================================================================
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000001', 'GRM-2026-0001', 'd0000000-0000-0000-0000-000000000001', 'ORD-2026-0001', 'Sunita Yadav', '9811001001', 'Embroidered Blouse - Sunita Yadav', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Awadh Nazakat and Chikankari Heritage 2026', 'STITCHING', 'READY', '2026-01-28'::date, 'NORMAL', 'PARTIAL', 2250, 4500, 'IN_PRODUCTION', 'Riwayat Couture - Lucknow Flagship HQ', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000002', 'GRM-2026-0002', 'd0000000-0000-0000-0000-000000000002', 'ORD-2026-0002', 'Priya Sharma', '9811001002', 'Chikankari Anarkali - Priya Sharma', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Awadh Nazakat and Chikankari Heritage 2026', 'STITCHING', 'READY', '2026-02-14'::date, 'NORMAL', 'PARTIAL', 7250, 14500, 'IN_PRODUCTION', 'Riwayat Couture - Lucknow Flagship HQ', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000003', 'GRM-2026-0003', 'd0000000-0000-0000-0000-000000000003', 'ORD-2026-0003', 'Ananya Pandey', '9811001003', 'Festive Salwar Suit - Ananya Pandey', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Awadh Nazakat and Chikankari Heritage 2026', 'STITCHING', 'READY', '2026-02-15'::date, 'HIGH', 'PARTIAL', 3600, 7200, 'IN_PRODUCTION', 'Riwayat Couture - Lucknow Flagship HQ', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000004', 'GRM-2026-0004', 'd0000000-0000-0000-0000-000000000004', 'ORD-2026-0004', 'Ritu Srivastava', '9811001004', 'Silk Kurti & Palazzos - Ritu Srivastava', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Awadh Nazakat and Chikankari Heritage 2026', 'READY', 'READY', '2026-02-20'::date, 'NORMAL', 'PAID', 5400, 5400, 'COMPLETED', 'Riwayat Couture - Lucknow Flagship HQ', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000005', 'GRM-2026-0005', 'd0000000-0000-0000-0000-000000000005', 'ORD-2026-0005', 'Deepika Rai', '9811001005', 'Velvet Saree Blouse - Deepika Rai', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Awadh Nazakat and Chikankari Heritage 2026', 'READY', 'READY', '2026-02-24'::date, 'NORMAL', 'PAID', 5200, 5200, 'DELIVERED', 'Riwayat Couture - Lucknow Flagship HQ', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000006', 'GRM-2026-0006', 'd0000000-0000-0000-0000-000000000006', 'ORD-2026-0006', 'Swati Joshi', '9811001006', 'Royal Brocade Jacket - Swati Joshi', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Awadh Nazakat and Chikankari Heritage 2026', 'STITCHING', 'READY', '2026-03-12'::date, 'URGENT', 'PARTIAL', 4900, 9800, 'IN_PRODUCTION', 'Riwayat Couture - Lucknow Flagship HQ', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000007', 'GRM-2026-0007', 'd0000000-0000-0000-0000-000000000007', 'ORD-2026-0007', 'Neha Trivedi', '9811001007', 'Bridal Lehenga - Neha Trivedi', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Awadh Nazakat and Chikankari Heritage 2026', 'DESIGNING', 'READY', '2026-03-31'::date, 'NORMAL', 'PARTIAL', 11400, 38000, 'PENDING', 'Riwayat Couture - Lucknow Flagship HQ', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000008', 'GRM-2026-0008', 'd0000000-0000-0000-0000-000000000008', 'ORD-2026-0008', 'Divya Dubey', '9811001008', 'Embroidered Blouse - Divya Dubey', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Awadh Nazakat and Chikankari Heritage 2026', 'READY', 'READY', '2026-03-18'::date, 'NORMAL', 'PAID', 4500, 4500, 'COMPLETED', 'Riwayat Couture - Lucknow Flagship HQ', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000009', 'GRM-2026-0009', 'd0000000-0000-0000-0000-000000000009', 'ORD-2026-0009', 'Pooja Agarwal', '9811001009', 'Chikankari Anarkali - Pooja Agarwal', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Awadh Nazakat and Chikankari Heritage 2026', 'STITCHING', 'READY', '2026-04-04'::date, 'HIGH', 'PARTIAL', 7250, 14500, 'IN_PRODUCTION', 'Riwayat Couture - Lucknow Flagship HQ', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000010', 'GRM-2026-0010', 'd0000000-0000-0000-0000-000000000010', 'ORD-2026-0010', 'Meena Gupta', '9811001010', 'Festive Salwar Suit - Meena Gupta', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Awadh Nazakat and Chikankari Heritage 2026', 'READY', 'READY', '2026-04-05'::date, 'NORMAL', 'PAID', 7200, 7200, 'DELIVERED', 'Riwayat Couture - Lucknow Flagship HQ', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000011', 'GRM-2026-0011', 'd0000000-0000-0000-0000-000000000011', 'ORD-2026-0011', 'Kavya Mishra', '9811001011', 'Silk Kurti & Palazzos - Kavya Mishra', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Awadh Nazakat and Chikankari Heritage 2026', 'STITCHING', 'READY', '2026-04-10'::date, 'NORMAL', 'PARTIAL', 2700, 5400, 'IN_PRODUCTION', 'Riwayat Couture - Lucknow Flagship HQ', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000012', 'GRM-2026-0012', 'd0000000-0000-0000-0000-000000000012', 'ORD-2026-0012', 'Shivani Tiwari', '9811001012', 'Velvet Saree Blouse - Shivani Tiwari', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Awadh Nazakat and Chikankari Heritage 2026', 'READY', 'READY', '2026-04-14'::date, 'URGENT', 'PAID', 5200, 5200, 'COMPLETED', 'Riwayat Couture - Lucknow Flagship HQ', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000013', 'GRM-2026-0013', 'd0000000-0000-0000-0000-000000000013', 'ORD-2026-0013', 'Rekha Shukla', '9811001013', 'Royal Brocade Jacket - Rekha Shukla', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Awadh Nazakat and Chikankari Heritage 2026', 'STITCHING', 'READY', '2026-04-30'::date, 'NORMAL', 'PARTIAL', 4900, 9800, 'IN_PRODUCTION', 'Riwayat Couture - Lucknow Flagship HQ', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000014', 'GRM-2026-0014', 'd0000000-0000-0000-0000-000000000014', 'ORD-2026-0014', 'Rekha Shukla', '9811001013', 'Embroidered Blouse - Rekha Shukla', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Awadh Nazakat and Chikankari Heritage 2026', 'DESIGNING', 'READY', '2026-04-29'::date, 'NORMAL', 'PARTIAL', 1350, 4500, 'PENDING', 'Riwayat Couture - Lucknow Flagship HQ', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000015', 'GRM-2026-0015', 'd0000000-0000-0000-0000-000000000015', 'ORD-2026-0015', 'Anjali Singh', '9811001014', 'Embroidered Blouse - Anjali Singh', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Awadh Nazakat and Chikankari Heritage 2026', 'READY', 'READY', '2026-05-06'::date, 'HIGH', 'PAID', 4500, 4500, 'DELIVERED', 'Riwayat Couture - Lucknow Flagship HQ', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000016', 'GRM-2026-0016', 'd0000000-0000-0000-0000-000000000016', 'ORD-2026-0016', 'Anjali Singh', '9811001014', 'Festive Salwar Suit - Anjali Singh', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Awadh Nazakat and Chikankari Heritage 2026', 'READY', 'READY', '2026-05-17'::date, 'NORMAL', 'PAID', 7200, 7200, 'COMPLETED', 'Riwayat Couture - Lucknow Flagship HQ', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000017', 'GRM-2026-0017', 'd0000000-0000-0000-0000-000000000017', 'ORD-2026-0017', 'Monika Verma', '9811001015', 'Festive Salwar Suit - Monika Verma', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Awadh Nazakat and Chikankari Heritage 2026', 'STITCHING', 'READY', '2026-05-24'::date, 'NORMAL', 'PARTIAL', 3600, 7200, 'IN_PRODUCTION', 'Riwayat Couture - Lucknow Flagship HQ', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000018', 'GRM-2026-0018', 'd0000000-0000-0000-0000-000000000018', 'ORD-2026-0018', 'Monika Verma', '9811001015', 'Velvet Saree Blouse - Monika Verma', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Awadh Nazakat and Chikankari Heritage 2026', 'STITCHING', 'READY', '2026-05-26'::date, 'URGENT', 'PARTIAL', 2600, 5200, 'IN_PRODUCTION', 'Riwayat Couture - Lucknow Flagship HQ', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000019', 'GRM-2026-0019', 'd0000000-0000-0000-0000-000000000019', 'ORD-2026-0019', 'Vineeta Saxena', '9811001016', 'Velvet Saree Blouse - Vineeta Saxena', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Awadh Nazakat and Chikankari Heritage 2026', 'STITCHING', 'READY', '2026-06-02'::date, 'NORMAL', 'PARTIAL', 2600, 5200, 'IN_PRODUCTION', 'Riwayat Couture - Lucknow Flagship HQ', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000020', 'GRM-2026-0020', 'd0000000-0000-0000-0000-000000000020', 'ORD-2026-0020', 'Vineeta Saxena', '9811001016', 'Bridal Lehenga - Vineeta Saxena', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Awadh Nazakat and Chikankari Heritage 2026', 'READY', 'READY', '2026-06-30'::date, 'NORMAL', 'PAID', 38000, 38000, 'COMPLETED', 'Riwayat Couture - Lucknow Flagship HQ', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000021', 'GRM-2026-0021', 'd0000000-0000-0000-0000-000000000021', 'ORD-2026-0021', 'Shweta Rastogi', '9811001017', 'Bridal Lehenga - Shweta Rastogi', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Awadh Nazakat and Chikankari Heritage 2026', 'DESIGNING', 'READY', '2026-07-07'::date, 'HIGH', 'PARTIAL', 11400, 38000, 'PENDING', 'Riwayat Couture - Lucknow Flagship HQ', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000022', 'GRM-2026-0022', 'd0000000-0000-0000-0000-000000000022', 'ORD-2026-0022', 'Shweta Rastogi', '9811001017', 'Chikankari Anarkali - Shweta Rastogi', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Awadh Nazakat and Chikankari Heritage 2026', 'STITCHING', 'READY', '2026-07-04'::date, 'NORMAL', 'PARTIAL', 7250, 14500, 'IN_PRODUCTION', 'Riwayat Couture - Lucknow Flagship HQ', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000023', 'GRM-2026-0023', 'd0000000-0000-0000-0000-000000000023', 'ORD-2026-0023', 'Tanvi Bansal', '9811001018', 'Chikankari Anarkali - Tanvi Bansal', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-07-11'::date, 'NORMAL', 'PARTIAL', 7250, 14500, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000024', 'GRM-2026-0024', 'd0000000-0000-0000-0000-000000000024', 'ORD-2026-0024', 'Tanvi Bansal', '9811001018', 'Silk Kurti & Palazzos - Tanvi Bansal', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-07-10'::date, 'URGENT', 'PAID', 5400, 5400, 'COMPLETED', 'Riwayat Couture - Agra Showroom', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000025', 'GRM-2026-0025', 'd0000000-0000-0000-0000-000000000025', 'ORD-2026-0025', 'Shilpa Singhal', '9811001019', 'Silk Kurti & Palazzos - Shilpa Singhal', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-07-17'::date, 'NORMAL', 'PAID', 5400, 5400, 'DELIVERED', 'Riwayat Couture - Agra Showroom', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000026', 'GRM-2026-0026', 'd0000000-0000-0000-0000-000000000026', 'ORD-2026-0026', 'Shilpa Singhal', '9811001019', 'Royal Brocade Jacket - Shilpa Singhal', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-07-30'::date, 'NORMAL', 'PARTIAL', 4900, 9800, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000027', 'GRM-2026-0027', 'd0000000-0000-0000-0000-000000000027', 'ORD-2026-0027', 'Megha Goyal', '9811001020', 'Royal Brocade Jacket - Megha Goyal', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-08-06'::date, 'HIGH', 'PARTIAL', 4900, 9800, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000028', 'GRM-2026-0028', 'd0000000-0000-0000-0000-000000000028', 'ORD-2026-0028', 'Megha Goyal', '9811001020', 'Embroidered Blouse - Megha Goyal', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-08-05'::date, 'NORMAL', 'PAID', 4500, 4500, 'COMPLETED', 'Riwayat Couture - Agra Showroom', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000029', 'GRM-2026-0029', 'd0000000-0000-0000-0000-000000000029', 'ORD-2026-0029', 'Radhika Mittal', '9811001021', 'Embroidered Blouse - Radhika Mittal', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-08-12'::date, 'NORMAL', 'PARTIAL', 2250, 4500, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000030', 'GRM-2026-0030', 'd0000000-0000-0000-0000-000000000030', 'ORD-2026-0030', 'Radhika Mittal', '9811001021', 'Festive Salwar Suit - Radhika Mittal', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-08-23'::date, 'URGENT', 'PAID', 7200, 7200, 'DELIVERED', 'Riwayat Couture - Agra Showroom', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000031', 'GRM-2026-0031', 'd0000000-0000-0000-0000-000000000031', 'ORD-2026-0031', 'Garima Jain', '9811001022', 'Festive Salwar Suit - Garima Jain', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-08-30'::date, 'NORMAL', 'PARTIAL', 3600, 7200, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000032', 'GRM-2026-0032', 'd0000000-0000-0000-0000-000000000032', 'ORD-2026-0032', 'Garima Jain', '9811001022', 'Velvet Saree Blouse - Garima Jain', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-09-01'::date, 'NORMAL', 'PAID', 5200, 5200, 'COMPLETED', 'Riwayat Couture - Agra Showroom', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000033', 'GRM-2026-0033', 'd0000000-0000-0000-0000-000000000033', 'ORD-2026-0033', 'Pallavi Agrawal', '9811001023', 'Velvet Saree Blouse - Pallavi Agrawal', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-09-08'::date, 'HIGH', 'PARTIAL', 2600, 5200, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000034', 'GRM-2026-0034', 'd0000000-0000-0000-0000-000000000034', 'ORD-2026-0034', 'Pallavi Agrawal', '9811001023', 'Bridal Lehenga - Pallavi Agrawal', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-10-06'::date, 'NORMAL', 'PARTIAL', 19000, 38000, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000035', 'GRM-2026-0035', 'd0000000-0000-0000-0000-000000000035', 'ORD-2026-0035', 'Shalini Bhargava', '9811001024', 'Bridal Lehenga - Shalini Bhargava', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-02-15'::date, 'NORMAL', 'PAID', 38000, 38000, 'DELIVERED', 'Riwayat Couture - Agra Showroom', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000036', 'GRM-2026-0036', 'd0000000-0000-0000-0000-000000000036', 'ORD-2026-0036', 'Shalini Bhargava', '9811001024', 'Chikankari Anarkali - Shalini Bhargava', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-02-12'::date, 'URGENT', 'PAID', 14500, 14500, 'COMPLETED', 'Riwayat Couture - Agra Showroom', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000037', 'GRM-2026-0037', 'd0000000-0000-0000-0000-000000000037', 'ORD-2026-0037', 'Kritika Maheshwari', '9811001025', 'Chikankari Anarkali - Kritika Maheshwari', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-02-19'::date, 'NORMAL', 'PARTIAL', 7250, 14500, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000038', 'GRM-2026-0038', 'd0000000-0000-0000-0000-000000000038', 'ORD-2026-0038', 'Kritika Maheshwari', '9811001025', 'Silk Kurti & Palazzos - Kritika Maheshwari', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-02-18'::date, 'NORMAL', 'PARTIAL', 2700, 5400, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000039', 'GRM-2026-0039', 'd0000000-0000-0000-0000-000000000039', 'ORD-2026-0039', 'Sonam Mathur', '9811001026', 'Silk Kurti & Palazzos - Sonam Mathur', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-02-25'::date, 'HIGH', 'PARTIAL', 2700, 5400, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000040', 'GRM-2026-0040', 'd0000000-0000-0000-0000-000000000040', 'ORD-2026-0040', 'Sonam Mathur', '9811001026', 'Royal Brocade Jacket - Sonam Mathur', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-03-10'::date, 'NORMAL', 'PAID', 9800, 9800, 'COMPLETED', 'Riwayat Couture - Agra Showroom', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000041', 'GRM-2026-0041', 'd0000000-0000-0000-0000-000000000041', 'ORD-2026-0041', 'Jyoti Chauhan', '9811001027', 'Royal Brocade Jacket - Jyoti Chauhan', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-03-17'::date, 'NORMAL', 'PARTIAL', 4900, 9800, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000042', 'GRM-2026-0042', 'd0000000-0000-0000-0000-000000000042', 'ORD-2026-0042', 'Jyoti Chauhan', '9811001027', 'Embroidered Blouse - Jyoti Chauhan', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Noor-e-Taj Royal Velvet Bridal Edit', 'DESIGNING', 'READY', '2026-03-16'::date, 'URGENT', 'PARTIAL', 1350, 4500, 'PENDING', 'Riwayat Couture - Agra Showroom', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000043', 'GRM-2026-0043', 'd0000000-0000-0000-0000-000000000043', 'ORD-2026-0043', 'Rachna Tomar', '9811001028', 'Embroidered Blouse - Rachna Tomar', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-03-23'::date, 'NORMAL', 'PARTIAL', 2250, 4500, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000044', 'GRM-2026-0044', 'd0000000-0000-0000-0000-000000000044', 'ORD-2026-0044', 'Rachna Tomar', '9811001028', 'Festive Salwar Suit - Rachna Tomar', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-04-03'::date, 'NORMAL', 'PAID', 7200, 7200, 'COMPLETED', 'Riwayat Couture - Agra Showroom', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000045', 'GRM-2026-0045', 'd0000000-0000-0000-0000-000000000045', 'ORD-2026-0045', 'Rachna Tomar', '9811001028', 'Velvet Saree Blouse - Rachna Tomar', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-04-05'::date, 'HIGH', 'PAID', 5200, 5200, 'DELIVERED', 'Riwayat Couture - Agra Showroom', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000046', 'GRM-2026-0046', 'd0000000-0000-0000-0000-000000000046', 'ORD-2026-0046', 'Preeti Sharma', '9811001029', 'Silk Kurti & Palazzos - Preeti Sharma', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-04-15'::date, 'NORMAL', 'PARTIAL', 2700, 5400, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000047', 'GRM-2026-0047', 'd0000000-0000-0000-0000-000000000047', 'ORD-2026-0047', 'Preeti Sharma', '9811001029', 'Royal Brocade Jacket - Preeti Sharma', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-04-28'::date, 'NORMAL', 'PARTIAL', 4900, 9800, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000048', 'GRM-2026-0048', 'd0000000-0000-0000-0000-000000000048', 'ORD-2026-0048', 'Preeti Sharma', '9811001029', 'Embroidered Blouse - Preeti Sharma', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-04-27'::date, 'URGENT', 'PAID', 4500, 4500, 'COMPLETED', 'Riwayat Couture - Agra Showroom', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000049', 'GRM-2026-0049', 'd0000000-0000-0000-0000-000000000049', 'ORD-2026-0049', 'Shruti Khandelwal', '9811001030', 'Bridal Lehenga - Shruti Khandelwal', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Noor-e-Taj Royal Velvet Bridal Edit', 'DESIGNING', 'READY', '2026-05-24'::date, 'NORMAL', 'PARTIAL', 11400, 38000, 'PENDING', 'Riwayat Couture - Agra Showroom', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000050', 'GRM-2026-0050', 'd0000000-0000-0000-0000-000000000050', 'ORD-2026-0050', 'Shruti Khandelwal', '9811001030', 'Chikankari Anarkali - Shruti Khandelwal', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-05-21'::date, 'NORMAL', 'PAID', 14500, 14500, 'DELIVERED', 'Riwayat Couture - Agra Showroom', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000051', 'GRM-2026-0051', 'd0000000-0000-0000-0000-000000000051', 'ORD-2026-0051', 'Shruti Khandelwal', '9811001030', 'Silk Kurti & Palazzos - Shruti Khandelwal', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-05-20'::date, 'HIGH', 'PARTIAL', 2700, 5400, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000052', 'GRM-2026-0052', 'd0000000-0000-0000-0000-000000000052', 'ORD-2026-0052', 'Suman Garg', '9811001031', 'Festive Salwar Suit - Suman Garg', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-05-29'::date, 'NORMAL', 'PAID', 7200, 7200, 'COMPLETED', 'Riwayat Couture - Agra Showroom', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000053', 'GRM-2026-0053', 'd0000000-0000-0000-0000-000000000053', 'ORD-2026-0053', 'Suman Garg', '9811001031', 'Velvet Saree Blouse - Suman Garg', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-05-31'::date, 'NORMAL', 'PARTIAL', 2600, 5200, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000054', 'GRM-2026-0054', 'd0000000-0000-0000-0000-000000000054', 'ORD-2026-0054', 'Suman Garg', '9811001031', 'Bridal Lehenga - Suman Garg', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-06-28'::date, 'URGENT', 'PARTIAL', 19000, 38000, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000055', 'GRM-2026-0055', 'd0000000-0000-0000-0000-000000000055', 'ORD-2026-0055', 'Payal Varshney', '9811001032', 'Royal Brocade Jacket - Payal Varshney', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-06-23'::date, 'NORMAL', 'PAID', 9800, 9800, 'DELIVERED', 'Riwayat Couture - Agra Showroom', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000056', 'GRM-2026-0056', 'd0000000-0000-0000-0000-000000000056', 'ORD-2026-0056', 'Payal Varshney', '9811001032', 'Embroidered Blouse - Payal Varshney', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-06-22'::date, 'NORMAL', 'PAID', 4500, 4500, 'COMPLETED', 'Riwayat Couture - Agra Showroom', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000057', 'GRM-2026-0057', 'd0000000-0000-0000-0000-000000000057', 'ORD-2026-0057', 'Payal Varshney', '9811001032', 'Festive Salwar Suit - Payal Varshney', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-07-03'::date, 'HIGH', 'PARTIAL', 3600, 7200, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000058', 'GRM-2026-0058', 'd0000000-0000-0000-0000-000000000058', 'ORD-2026-0058', 'Natasha Chawla', '9811001033', 'Chikankari Anarkali - Natasha Chawla', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-07-16'::date, 'NORMAL', 'PARTIAL', 7250, 14500, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000059', 'GRM-2026-0059', 'd0000000-0000-0000-0000-000000000059', 'ORD-2026-0059', 'Natasha Chawla', '9811001033', 'Silk Kurti & Palazzos - Natasha Chawla', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Noor-e-Taj Royal Velvet Bridal Edit', 'STITCHING', 'READY', '2026-07-15'::date, 'NORMAL', 'PARTIAL', 2700, 5400, 'IN_PRODUCTION', 'Riwayat Couture - Agra Showroom', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000060', 'GRM-2026-0060', 'd0000000-0000-0000-0000-000000000060', 'ORD-2026-0060', 'Natasha Chawla', '9811001033', 'Royal Brocade Jacket - Natasha Chawla', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Noor-e-Taj Royal Velvet Bridal Edit', 'READY', 'READY', '2026-07-28'::date, 'URGENT', 'PAID', 9800, 9800, 'COMPLETED', 'Riwayat Couture - Agra Showroom', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000061', 'GRM-2026-0061', 'd0000000-0000-0000-0000-000000000061', 'ORD-2026-0061', 'Isha Khanna', '9811001034', 'Velvet Saree Blouse - Isha Khanna', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-07-26'::date, 'NORMAL', 'PARTIAL', 2600, 5200, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000062', 'GRM-2026-0062', 'd0000000-0000-0000-0000-000000000062', 'ORD-2026-0062', 'Isha Khanna', '9811001034', 'Bridal Lehenga - Isha Khanna', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-08-23'::date, 'NORMAL', 'PARTIAL', 19000, 38000, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000063', 'GRM-2026-0063', 'd0000000-0000-0000-0000-000000000063', 'ORD-2026-0063', 'Isha Khanna', '9811001034', 'Chikankari Anarkali - Isha Khanna', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 'DESIGNING', 'READY', '2026-08-20'::date, 'HIGH', 'PARTIAL', 4350, 14500, 'PENDING', 'Riwayat Couture - Kanpur Studio', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000064', 'GRM-2026-0064', 'd0000000-0000-0000-0000-000000000064', 'ORD-2026-0064', 'Simran Bhatia', '9811001035', 'Embroidered Blouse - Simran Bhatia', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-08-17'::date, 'NORMAL', 'PAID', 4500, 4500, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000065', 'GRM-2026-0065', 'd0000000-0000-0000-0000-000000000065', 'ORD-2026-0065', 'Simran Bhatia', '9811001035', 'Festive Salwar Suit - Simran Bhatia', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-08-28'::date, 'NORMAL', 'PAID', 7200, 7200, 'DELIVERED', 'Riwayat Couture - Kanpur Studio', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000066', 'GRM-2026-0066', 'd0000000-0000-0000-0000-000000000066', 'ORD-2026-0066', 'Simran Bhatia', '9811001035', 'Velvet Saree Blouse - Simran Bhatia', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-08-30'::date, 'URGENT', 'PARTIAL', 2600, 5200, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000067', 'GRM-2026-0067', 'd0000000-0000-0000-0000-000000000067', 'ORD-2026-0067', 'Richa Seth', '9811001036', 'Silk Kurti & Palazzos - Richa Seth', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-09-09'::date, 'NORMAL', 'PARTIAL', 2700, 5400, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000068', 'GRM-2026-0068', 'd0000000-0000-0000-0000-000000000068', 'ORD-2026-0068', 'Richa Seth', '9811001036', 'Royal Brocade Jacket - Richa Seth', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-09-22'::date, 'NORMAL', 'PAID', 9800, 9800, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000069', 'GRM-2026-0069', 'd0000000-0000-0000-0000-000000000069', 'ORD-2026-0069', 'Richa Seth', '9811001036', 'Embroidered Blouse - Richa Seth', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-01-24'::date, 'HIGH', 'PARTIAL', 2250, 4500, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000070', 'GRM-2026-0070', 'd0000000-0000-0000-0000-000000000070', 'ORD-2026-0070', 'Aaradhya Bajpai', '9811001037', 'Bridal Lehenga - Aaradhya Bajpai', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-02-20'::date, 'NORMAL', 'PAID', 38000, 38000, 'DELIVERED', 'Riwayat Couture - Kanpur Studio', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000071', 'GRM-2026-0071', 'd0000000-0000-0000-0000-000000000071', 'ORD-2026-0071', 'Aaradhya Bajpai', '9811001037', 'Chikankari Anarkali - Aaradhya Bajpai', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-02-17'::date, 'NORMAL', 'PARTIAL', 7250, 14500, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000072', 'GRM-2026-0072', 'd0000000-0000-0000-0000-000000000072', 'ORD-2026-0072', 'Aaradhya Bajpai', '9811001037', 'Silk Kurti & Palazzos - Aaradhya Bajpai', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-02-16'::date, 'URGENT', 'PAID', 5400, 5400, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000073', 'GRM-2026-0073', 'd0000000-0000-0000-0000-000000000073', 'ORD-2026-0073', 'Nupur Dwivedi', '9811001038', 'Festive Salwar Suit - Nupur Dwivedi', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-02-25'::date, 'NORMAL', 'PARTIAL', 3600, 7200, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000074', 'GRM-2026-0074', 'd0000000-0000-0000-0000-000000000074', 'ORD-2026-0074', 'Nupur Dwivedi', '9811001038', 'Velvet Saree Blouse - Nupur Dwivedi', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-02-27'::date, 'NORMAL', 'PARTIAL', 2600, 5200, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000075', 'GRM-2026-0075', 'd0000000-0000-0000-0000-000000000075', 'ORD-2026-0075', 'Nupur Dwivedi', '9811001038', 'Bridal Lehenga - Nupur Dwivedi', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-03-27'::date, 'HIGH', 'PAID', 38000, 38000, 'DELIVERED', 'Riwayat Couture - Kanpur Studio', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000076', 'GRM-2026-0076', 'd0000000-0000-0000-0000-000000000076', 'ORD-2026-0076', 'Barkha Awasthi', '9811001039', 'Royal Brocade Jacket - Barkha Awasthi', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-03-22'::date, 'NORMAL', 'PAID', 9800, 9800, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000077', 'GRM-2026-0077', 'd0000000-0000-0000-0000-000000000077', 'ORD-2026-0077', 'Barkha Awasthi', '9811001039', 'Embroidered Blouse - Barkha Awasthi', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 'DESIGNING', 'READY', '2026-03-21'::date, 'NORMAL', 'PARTIAL', 1350, 4500, 'PENDING', 'Riwayat Couture - Kanpur Studio', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000078', 'GRM-2026-0078', 'd0000000-0000-0000-0000-000000000078', 'ORD-2026-0078', 'Barkha Awasthi', '9811001039', 'Festive Salwar Suit - Barkha Awasthi', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-04-01'::date, 'URGENT', 'PARTIAL', 3600, 7200, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000079', 'GRM-2026-0079', 'd0000000-0000-0000-0000-000000000079', 'ORD-2026-0079', 'Aparna Dixit', '9811001040', 'Chikankari Anarkali - Aparna Dixit', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-04-14'::date, 'NORMAL', 'PARTIAL', 7250, 14500, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000080', 'GRM-2026-0080', 'd0000000-0000-0000-0000-000000000080', 'ORD-2026-0080', 'Aparna Dixit', '9811001040', 'Silk Kurti & Palazzos - Aparna Dixit', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-04-13'::date, 'NORMAL', 'PAID', 5400, 5400, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000081', 'GRM-2026-0081', 'd0000000-0000-0000-0000-000000000081', 'ORD-2026-0081', 'Aparna Dixit', '9811001040', 'Royal Brocade Jacket - Aparna Dixit', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-04-26'::date, 'HIGH', 'PARTIAL', 4900, 9800, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000082', 'GRM-2026-0082', 'd0000000-0000-0000-0000-000000000082', 'ORD-2026-0082', 'Shreya Tripathi', '9811001041', 'Velvet Saree Blouse - Shreya Tripathi', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-04-24'::date, 'NORMAL', 'PARTIAL', 2600, 5200, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000083', 'GRM-2026-0083', 'd0000000-0000-0000-0000-000000000083', 'ORD-2026-0083', 'Shreya Tripathi', '9811001041', 'Bridal Lehenga - Shreya Tripathi', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-05-22'::date, 'NORMAL', 'PARTIAL', 19000, 38000, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000084', 'GRM-2026-0084', 'd0000000-0000-0000-0000-000000000084', 'ORD-2026-0084', 'Shreya Tripathi', '9811001041', 'Chikankari Anarkali - Shreya Tripathi', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-05-19'::date, 'URGENT', 'PAID', 14500, 14500, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000085', 'GRM-2026-0085', 'd0000000-0000-0000-0000-000000000085', 'ORD-2026-0085', 'Shreya Tripathi', '9811001041', 'Silk Kurti & Palazzos - Shreya Tripathi', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-05-18'::date, 'NORMAL', 'PAID', 5400, 5400, 'DELIVERED', 'Riwayat Couture - Kanpur Studio', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000086', 'GRM-2026-0086', 'd0000000-0000-0000-0000-000000000086', 'ORD-2026-0086', 'Mansi Shukla', '9811001042', 'Chikankari Anarkali - Mansi Shukla', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-06-02'::date, 'NORMAL', 'PARTIAL', 7250, 14500, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000087', 'GRM-2026-0087', 'd0000000-0000-0000-0000-000000000087', 'ORD-2026-0087', 'Mansi Shukla', '9811001042', 'Silk Kurti & Palazzos - Mansi Shukla', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-06-01'::date, 'HIGH', 'PARTIAL', 2700, 5400, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000088', 'GRM-2026-0088', 'd0000000-0000-0000-0000-000000000088', 'ORD-2026-0088', 'Mansi Shukla', '9811001042', 'Royal Brocade Jacket - Mansi Shukla', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-06-14'::date, 'NORMAL', 'PAID', 9800, 9800, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000089', 'GRM-2026-0089', 'd0000000-0000-0000-0000-000000000089', 'ORD-2026-0089', 'Mansi Shukla', '9811001042', 'Embroidered Blouse - Mansi Shukla', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-06-13'::date, 'NORMAL', 'PARTIAL', 2250, 4500, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000090', 'GRM-2026-0090', 'd0000000-0000-0000-0000-000000000090', 'ORD-2026-0090', 'Pragati Pandey', '9811001043', 'Royal Brocade Jacket - Pragati Pandey', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-06-28'::date, 'URGENT', 'PAID', 9800, 9800, 'DELIVERED', 'Riwayat Couture - Kanpur Studio', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000091', 'GRM-2026-0091', 'd0000000-0000-0000-0000-000000000091', 'ORD-2026-0091', 'Pragati Pandey', '9811001043', 'Embroidered Blouse - Pragati Pandey', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 'DESIGNING', 'READY', '2026-06-27'::date, 'NORMAL', 'PARTIAL', 1350, 4500, 'PENDING', 'Riwayat Couture - Kanpur Studio', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000092', 'GRM-2026-0092', 'd0000000-0000-0000-0000-000000000092', 'ORD-2026-0092', 'Pragati Pandey', '9811001043', 'Festive Salwar Suit - Pragati Pandey', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-07-08'::date, 'NORMAL', 'PAID', 7200, 7200, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000093', 'GRM-2026-0093', 'd0000000-0000-0000-0000-000000000093', 'ORD-2026-0093', 'Pragati Pandey', '9811001043', 'Velvet Saree Blouse - Pragati Pandey', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-07-10'::date, 'HIGH', 'PARTIAL', 2600, 5200, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000094', 'GRM-2026-0094', 'd0000000-0000-0000-0000-000000000094', 'ORD-2026-0094', 'Aditi Roy', '9811001044', 'Festive Salwar Suit - Aditi Roy', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-07-22'::date, 'NORMAL', 'PARTIAL', 3600, 7200, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000095', 'GRM-2026-0095', 'd0000000-0000-0000-0000-000000000095', 'ORD-2026-0095', 'Aditi Roy', '9811001044', 'Velvet Saree Blouse - Aditi Roy', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-07-24'::date, 'NORMAL', 'PAID', 5200, 5200, 'DELIVERED', 'Riwayat Couture - Kanpur Studio', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000096', 'GRM-2026-0096', 'd0000000-0000-0000-0000-000000000096', 'ORD-2026-0096', 'Aditi Roy', '9811001044', 'Bridal Lehenga - Aditi Roy', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-08-21'::date, 'URGENT', 'PAID', 38000, 38000, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000097', 'GRM-2026-0097', 'd0000000-0000-0000-0000-000000000097', 'ORD-2026-0097', 'Aditi Roy', '9811001044', 'Chikankari Anarkali - Aditi Roy', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-08-18'::date, 'NORMAL', 'PARTIAL', 7250, 14500, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000098', 'GRM-2026-0098', 'd0000000-0000-0000-0000-000000000098', 'ORD-2026-0098', 'Ritika Sengupta', '9811001045', 'Bridal Lehenga - Ritika Sengupta', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 'DESIGNING', 'READY', '2026-09-04'::date, 'NORMAL', 'PARTIAL', 11400, 38000, 'PENDING', 'Riwayat Couture - Kanpur Studio', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000099', 'GRM-2026-0099', 'd0000000-0000-0000-0000-000000000099', 'ORD-2026-0099', 'Ritika Sengupta', '9811001045', 'Chikankari Anarkali - Ritika Sengupta', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-09-01'::date, 'HIGH', 'PARTIAL', 7250, 14500, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000100', 'GRM-2026-0100', 'd0000000-0000-0000-0000-000000000100', 'ORD-2026-0100', 'Ritika Sengupta', '9811001045', 'Silk Kurti & Palazzos - Ritika Sengupta', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-08-31'::date, 'NORMAL', 'PAID', 5400, 5400, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000101', 'GRM-2026-0101', 'd0000000-0000-0000-0000-000000000101', 'ORD-2026-0101', 'Ritika Sengupta', '9811001045', 'Royal Brocade Jacket - Ritika Sengupta', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-09-13'::date, 'NORMAL', 'PARTIAL', 4900, 9800, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000102', 'GRM-2026-0102', 'd0000000-0000-0000-0000-000000000102', 'ORD-2026-0102', 'Namrata Nigam', '9811001046', 'Silk Kurti & Palazzos - Namrata Nigam', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-09-14'::date, 'URGENT', 'PARTIAL', 2700, 5400, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000103', 'GRM-2026-0103', 'd0000000-0000-0000-0000-000000000103', 'ORD-2026-0103', 'Namrata Nigam', '9811001046', 'Royal Brocade Jacket - Namrata Nigam', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-01-30'::date, 'NORMAL', 'PARTIAL', 4900, 9800, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000104', 'GRM-2026-0104', 'd0000000-0000-0000-0000-000000000104', 'ORD-2026-0104', 'Namrata Nigam', '9811001046', 'Embroidered Blouse - Namrata Nigam', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-01-29'::date, 'NORMAL', 'PAID', 4500, 4500, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000105', 'GRM-2026-0105', 'd0000000-0000-0000-0000-000000000105', 'ORD-2026-0105', 'Namrata Nigam', '9811001046', 'Festive Salwar Suit - Namrata Nigam', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-02-09'::date, 'HIGH', 'PAID', 7200, 7200, 'DELIVERED', 'Riwayat Couture - Kanpur Studio', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000106', 'GRM-2026-0106', 'd0000000-0000-0000-0000-000000000106', 'ORD-2026-0106', 'Rashmi Rohatgi', '9811001047', 'Embroidered Blouse - Rashmi Rohatgi', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-02-12'::date, 'NORMAL', 'PARTIAL', 2250, 4500, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000107', 'GRM-2026-0107', 'd0000000-0000-0000-0000-000000000107', 'ORD-2026-0107', 'Rashmi Rohatgi', '9811001047', 'Festive Salwar Suit - Rashmi Rohatgi', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-02-23'::date, 'NORMAL', 'PARTIAL', 3600, 7200, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000108', 'GRM-2026-0108', 'd0000000-0000-0000-0000-000000000108', 'ORD-2026-0108', 'Rashmi Rohatgi', '9811001047', 'Velvet Saree Blouse - Rashmi Rohatgi', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-02-25'::date, 'URGENT', 'PAID', 5200, 5200, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000109', 'GRM-2026-0109', 'd0000000-0000-0000-0000-000000000109', 'ORD-2026-0109', 'Rashmi Rohatgi', '9811001047', 'Bridal Lehenga - Rashmi Rohatgi', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-03-25'::date, 'NORMAL', 'PARTIAL', 19000, 38000, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000110', 'GRM-2026-0110', 'd0000000-0000-0000-0000-000000000110', 'ORD-2026-0110', 'Rashmi Rohatgi', '9811001047', 'Chikankari Anarkali - Rashmi Rohatgi', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-03-22'::date, 'NORMAL', 'PAID', 14500, 14500, 'DELIVERED', 'Riwayat Couture - Kanpur Studio', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000111', 'GRM-2026-0111', 'd0000000-0000-0000-0000-000000000111', 'ORD-2026-0111', 'Srishti Tandon', '9811001048', 'Royal Brocade Jacket - Srishti Tandon', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-03-27'::date, 'HIGH', 'PARTIAL', 4900, 9800, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000112', 'GRM-2026-0112', 'd0000000-0000-0000-0000-000000000112', 'ORD-2026-0112', 'Srishti Tandon', '9811001048', 'Embroidered Blouse - Srishti Tandon', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-03-26'::date, 'NORMAL', 'PAID', 4500, 4500, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000113', 'GRM-2026-0113', 'd0000000-0000-0000-0000-000000000113', 'ORD-2026-0113', 'Srishti Tandon', '9811001048', 'Festive Salwar Suit - Srishti Tandon', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-04-06'::date, 'NORMAL', 'PARTIAL', 3600, 7200, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000114', 'GRM-2026-0114', 'd0000000-0000-0000-0000-000000000114', 'ORD-2026-0114', 'Srishti Tandon', '9811001048', 'Velvet Saree Blouse - Srishti Tandon', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-04-08'::date, 'URGENT', 'PARTIAL', 2600, 5200, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000115', 'GRM-2026-0115', 'd0000000-0000-0000-0000-000000000115', 'ORD-2026-0115', 'Srishti Tandon', '9811001048', 'Bridal Lehenga - Srishti Tandon', 'Bridal Lehenga', 'Heavily hand-embroidered raw silk bridal lehenga with zardozi and antique dabka motifs, paired with dual dupattas', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-05-06'::date, 'NORMAL', 'PAID', 38000, 38000, 'DELIVERED', 'Riwayat Couture - Kanpur Studio', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000116', 'GRM-2026-0116', 'd0000000-0000-0000-0000-000000000116', 'ORD-2026-0116', 'Bhavna Kapoor', '9811001049', 'Silk Kurti & Palazzos - Bhavna Kapoor', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-04-25'::date, 'NORMAL', 'PAID', 5400, 5400, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000117', 'GRM-2026-0117', 'd0000000-0000-0000-0000-000000000117', 'ORD-2026-0117', 'Bhavna Kapoor', '9811001049', 'Royal Brocade Jacket - Bhavna Kapoor', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-05-08'::date, 'HIGH', 'PARTIAL', 4900, 9800, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000118', 'GRM-2026-0118', 'd0000000-0000-0000-0000-000000000118', 'ORD-2026-0118', 'Bhavna Kapoor', '9811001049', 'Embroidered Blouse - Bhavna Kapoor', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-05-07'::date, 'NORMAL', 'PARTIAL', 2250, 4500, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000119', 'GRM-2026-0119', 'd0000000-0000-0000-0000-000000000119', 'ORD-2026-0119', 'Bhavna Kapoor', '9811001049', 'Festive Salwar Suit - Bhavna Kapoor', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 'DESIGNING', 'READY', '2026-05-18'::date, 'NORMAL', 'PARTIAL', 2160, 7200, 'PENDING', 'Riwayat Couture - Kanpur Studio', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000120', 'GRM-2026-0120', 'd0000000-0000-0000-0000-000000000120', 'ORD-2026-0120', 'Bhavna Kapoor', '9811001049', 'Velvet Saree Blouse - Bhavna Kapoor', 'Velvet Saree Blouse', 'Regal royal wine micro-velvet blouse with boat neckline, back potli buttons, and heavy bullion wire embroidery', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-05-20'::date, 'URGENT', 'PAID', 5200, 5200, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Mohammad Irfan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000121', 'GRM-2026-0121', 'd0000000-0000-0000-0000-000000000121', 'ORD-2026-0121', 'Kajal Taneja', '9811001050', 'Chikankari Anarkali - Kajal Taneja', 'Chikankari Anarkali', 'Floor-length pure georgette anarkali with authentic 32-stitches Awadhi chikankari, mukaish highlights and chanderi inner', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-06-07'::date, 'NORMAL', 'PARTIAL', 7250, 14500, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Rakesh Verma', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000122', 'GRM-2026-0122', 'd0000000-0000-0000-0000-000000000122', 'ORD-2026-0122', 'Kajal Taneja', '9811001050', 'Silk Kurti & Palazzos - Kajal Taneja', 'Silk Kurti & Palazzos', 'Handloom chanderi silk kurti with delicate gota patti yoke, flared palazzo and hand-block printed mulmul dupatta', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-06-06'::date, 'NORMAL', 'PARTIAL', 2700, 5400, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Aslam Khan', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000123', 'GRM-2026-0123', 'd0000000-0000-0000-0000-000000000123', 'ORD-2026-0123', 'Kajal Taneja', '9811001050', 'Royal Brocade Jacket - Kajal Taneja', 'Royal Brocade Jacket', 'Structured Banarasi meenakari brocade jacket with mandarin collar and antique metallic crested buttons', 'Ganga-Jamuni Brocade and Silk Festive', 'STITCHING', 'READY', '2026-06-19'::date, 'HIGH', 'PARTIAL', 4900, 9800, 'IN_PRODUCTION', 'Riwayat Couture - Kanpur Studio', 'Dinesh Pal', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000124', 'GRM-2026-0124', 'd0000000-0000-0000-0000-000000000124', 'ORD-2026-0124', 'Kajal Taneja', '9811001050', 'Embroidered Blouse - Kajal Taneja', 'Embroidered Blouse', 'Custom sweetheart-neck designer blouse with hand-cut mirror work, zardozi borders, and padded couture lining', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-06-18'::date, 'NORMAL', 'PAID', 4500, 4500, 'COMPLETED', 'Riwayat Couture - Kanpur Studio', 'Naseem Ahmed', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;
INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, collection_name, production_stage, material_status, due_date, priority, payment_status, paid_amount, total_amount, status, branch, assigned_to, created_at, updated_at)
VALUES ('f1000000-0000-0000-0000-000000000125', 'GRM-2026-0125', 'd0000000-0000-0000-0000-000000000125', 'ORD-2026-0125', 'Kajal Taneja', '9811001050', 'Festive Salwar Suit - Kajal Taneja', 'Festive Salwar Suit', 'Straight-cut raw silk kurta with resham threadwork, paired with scalloped organza dupatta and matching trousers', 'Ganga-Jamuni Brocade and Silk Festive', 'READY', 'READY', '2026-06-29'::date, 'NORMAL', 'PAID', 7200, 7200, 'DELIVERED', 'Riwayat Couture - Kanpur Studio', 'Suresh Gupta', NOW(), NOW())
ON CONFLICT (garment_code) DO NOTHING;

-- =============================================================================
-- 9. PAYMENTS & TRANSACTIONS (125 payments + 125 ledger transactions)
-- =============================================================================
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 4500, 2250, 'PARTIAL', '2026-01-28'::date, 'Initial payment received via CARD', '9811001001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000001', 2250, 'CARD', 'Priya Kashyap', 'TXN-2026-100001', '2026-01-18 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 14500, 7250, 'PARTIAL', '2026-02-14'::date, 'Initial payment received via CASH', '9811001002', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000002', 'f2000000-0000-0000-0000-000000000002', 7250, 'CASH', 'Vandana Kapoor', 'TXN-2026-100002', '2026-01-25 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 7200, 3600, 'PARTIAL', '2026-02-15'::date, 'Initial payment received via NET_BANKING', '9811001003', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000003', 'f2000000-0000-0000-0000-000000000003', 3600, 'NET_BANKING', 'Sunita Rajput', 'TXN-2026-100003', '2026-02-01 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 5400, 5400, 'PAID', '2026-02-20'::date, 'Initial payment received via UPI', '9811001004', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000004', 'f2000000-0000-0000-0000-000000000004', 5400, 'UPI', 'Priya Kashyap', 'TXN-2026-100004', '2026-02-08 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 5200, 5200, 'PAID', '2026-02-24'::date, 'Initial payment received via CARD', '9811001005', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000005', 'f2000000-0000-0000-0000-000000000005', 5200, 'CARD', 'Vandana Kapoor', 'TXN-2026-100005', '2026-02-15 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 9800, 4900, 'PARTIAL', '2026-03-12'::date, 'Initial payment received via CASH', '9811001006', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000006', 'f2000000-0000-0000-0000-000000000006', 4900, 'CASH', 'Sunita Rajput', 'TXN-2026-100006', '2026-02-22 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000007', 38000, 11400, 'PARTIAL', '2026-03-31'::date, 'Initial payment received via NET_BANKING', '9811001007', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000007', 'f2000000-0000-0000-0000-000000000007', 11400, 'NET_BANKING', 'Priya Kashyap', 'TXN-2026-100007', '2026-03-01 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000008', 4500, 4500, 'PAID', '2026-03-18'::date, 'Initial payment received via UPI', '9811001008', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000008', 'f2000000-0000-0000-0000-000000000008', 4500, 'UPI', 'Vandana Kapoor', 'TXN-2026-100008', '2026-03-08 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000009', 14500, 7250, 'PARTIAL', '2026-04-04'::date, 'Initial payment received via CARD', '9811001009', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000009', 'f2000000-0000-0000-0000-000000000009', 7250, 'CARD', 'Sunita Rajput', 'TXN-2026-100009', '2026-03-15 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000010', 7200, 7200, 'PAID', '2026-04-05'::date, 'Initial payment received via CASH', '9811001010', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000010', 'f2000000-0000-0000-0000-000000000010', 7200, 'CASH', 'Priya Kashyap', 'TXN-2026-100010', '2026-03-22 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000011', 5400, 2700, 'PARTIAL', '2026-04-10'::date, 'Initial payment received via NET_BANKING', '9811001011', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000011', 'f2000000-0000-0000-0000-000000000011', 2700, 'NET_BANKING', 'Vandana Kapoor', 'TXN-2026-100011', '2026-03-29 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000012', 5200, 5200, 'PAID', '2026-04-14'::date, 'Initial payment received via UPI', '9811001012', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000012', 'f2000000-0000-0000-0000-000000000012', 5200, 'UPI', 'Sunita Rajput', 'TXN-2026-100012', '2026-04-05 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000013', 9800, 4900, 'PARTIAL', '2026-04-30'::date, 'Initial payment received via CARD', '9811001013', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000013', 'f2000000-0000-0000-0000-000000000013', 4900, 'CARD', 'Priya Kashyap', 'TXN-2026-100013', '2026-04-12 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000014', 4500, 1350, 'PARTIAL', '2026-04-29'::date, 'Initial payment received via CASH', '9811001013', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000014', 'f2000000-0000-0000-0000-000000000014', 1350, 'CASH', 'Vandana Kapoor', 'TXN-2026-100014', '2026-04-19 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000015', 4500, 4500, 'PAID', '2026-05-06'::date, 'Initial payment received via NET_BANKING', '9811001014', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000015', 'f2000000-0000-0000-0000-000000000015', 4500, 'NET_BANKING', 'Sunita Rajput', 'TXN-2026-100015', '2026-04-26 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000016', 7200, 7200, 'PAID', '2026-05-17'::date, 'Initial payment received via UPI', '9811001014', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000016', 'f2000000-0000-0000-0000-000000000016', 7200, 'UPI', 'Priya Kashyap', 'TXN-2026-100016', '2026-05-03 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000017', 7200, 3600, 'PARTIAL', '2026-05-24'::date, 'Initial payment received via CARD', '9811001015', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000017', 'f2000000-0000-0000-0000-000000000017', 3600, 'CARD', 'Vandana Kapoor', 'TXN-2026-100017', '2026-05-10 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000018', 5200, 2600, 'PARTIAL', '2026-05-26'::date, 'Initial payment received via CASH', '9811001015', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000018', 'f2000000-0000-0000-0000-000000000018', 2600, 'CASH', 'Sunita Rajput', 'TXN-2026-100018', '2026-05-17 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000019', 5200, 2600, 'PARTIAL', '2026-06-02'::date, 'Initial payment received via NET_BANKING', '9811001016', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000019', 'f2000000-0000-0000-0000-000000000019', 2600, 'NET_BANKING', 'Priya Kashyap', 'TXN-2026-100019', '2026-05-24 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000020', 38000, 38000, 'PAID', '2026-06-30'::date, 'Initial payment received via UPI', '9811001016', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000020', 'f2000000-0000-0000-0000-000000000020', 38000, 'UPI', 'Vandana Kapoor', 'TXN-2026-100020', '2026-05-31 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000021', 'd0000000-0000-0000-0000-000000000021', 38000, 11400, 'PARTIAL', '2026-07-07'::date, 'Initial payment received via CARD', '9811001017', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000021', 'f2000000-0000-0000-0000-000000000021', 11400, 'CARD', 'Sunita Rajput', 'TXN-2026-100021', '2026-06-07 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000022', 'd0000000-0000-0000-0000-000000000022', 14500, 7250, 'PARTIAL', '2026-07-04'::date, 'Initial payment received via CASH', '9811001017', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000022', 'f2000000-0000-0000-0000-000000000022', 7250, 'CASH', 'Priya Kashyap', 'TXN-2026-100022', '2026-06-14 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000023', 'd0000000-0000-0000-0000-000000000023', 14500, 7250, 'PARTIAL', '2026-07-11'::date, 'Initial payment received via NET_BANKING', '9811001018', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000023', 'f2000000-0000-0000-0000-000000000023', 7250, 'NET_BANKING', 'Vandana Kapoor', 'TXN-2026-100023', '2026-06-21 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000024', 'd0000000-0000-0000-0000-000000000024', 5400, 5400, 'PAID', '2026-07-10'::date, 'Initial payment received via UPI', '9811001018', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000024', 'f2000000-0000-0000-0000-000000000024', 5400, 'UPI', 'Sunita Rajput', 'TXN-2026-100024', '2026-06-28 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000025', 'd0000000-0000-0000-0000-000000000025', 5400, 5400, 'PAID', '2026-07-17'::date, 'Initial payment received via CARD', '9811001019', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000025', 'f2000000-0000-0000-0000-000000000025', 5400, 'CARD', 'Priya Kashyap', 'TXN-2026-100025', '2026-07-05 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000026', 'd0000000-0000-0000-0000-000000000026', 9800, 4900, 'PARTIAL', '2026-07-30'::date, 'Initial payment received via CASH', '9811001019', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000026', 'f2000000-0000-0000-0000-000000000026', 4900, 'CASH', 'Vandana Kapoor', 'TXN-2026-100026', '2026-07-12 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000027', 'd0000000-0000-0000-0000-000000000027', 9800, 4900, 'PARTIAL', '2026-08-06'::date, 'Initial payment received via NET_BANKING', '9811001020', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000027', 'f2000000-0000-0000-0000-000000000027', 4900, 'NET_BANKING', 'Sunita Rajput', 'TXN-2026-100027', '2026-07-19 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000028', 'd0000000-0000-0000-0000-000000000028', 4500, 4500, 'PAID', '2026-08-05'::date, 'Initial payment received via UPI', '9811001020', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000028', 'f2000000-0000-0000-0000-000000000028', 4500, 'UPI', 'Priya Kashyap', 'TXN-2026-100028', '2026-07-26 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000029', 'd0000000-0000-0000-0000-000000000029', 4500, 2250, 'PARTIAL', '2026-08-12'::date, 'Initial payment received via CARD', '9811001021', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000029', 'f2000000-0000-0000-0000-000000000029', 2250, 'CARD', 'Vandana Kapoor', 'TXN-2026-100029', '2026-08-02 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000030', 'd0000000-0000-0000-0000-000000000030', 7200, 7200, 'PAID', '2026-08-23'::date, 'Initial payment received via CASH', '9811001021', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000030', 'f2000000-0000-0000-0000-000000000030', 7200, 'CASH', 'Sunita Rajput', 'TXN-2026-100030', '2026-08-09 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000031', 'd0000000-0000-0000-0000-000000000031', 7200, 3600, 'PARTIAL', '2026-08-30'::date, 'Initial payment received via NET_BANKING', '9811001022', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000031', 'f2000000-0000-0000-0000-000000000031', 3600, 'NET_BANKING', 'Priya Kashyap', 'TXN-2026-100031', '2026-08-16 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000032', 'd0000000-0000-0000-0000-000000000032', 5200, 5200, 'PAID', '2026-09-01'::date, 'Initial payment received via UPI', '9811001022', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000032', 'f2000000-0000-0000-0000-000000000032', 5200, 'UPI', 'Vandana Kapoor', 'TXN-2026-100032', '2026-08-23 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000033', 'd0000000-0000-0000-0000-000000000033', 5200, 2600, 'PARTIAL', '2026-09-08'::date, 'Initial payment received via CARD', '9811001023', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000033', 'f2000000-0000-0000-0000-000000000033', 2600, 'CARD', 'Sunita Rajput', 'TXN-2026-100033', '2026-08-30 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000034', 'd0000000-0000-0000-0000-000000000034', 38000, 19000, 'PARTIAL', '2026-10-06'::date, 'Initial payment received via CASH', '9811001023', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000034', 'f2000000-0000-0000-0000-000000000034', 19000, 'CASH', 'Priya Kashyap', 'TXN-2026-100034', '2026-09-06 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000035', 'd0000000-0000-0000-0000-000000000035', 38000, 38000, 'PAID', '2026-02-15'::date, 'Initial payment received via NET_BANKING', '9811001024', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000035', 'f2000000-0000-0000-0000-000000000035', 38000, 'NET_BANKING', 'Vandana Kapoor', 'TXN-2026-100035', '2026-01-16 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000036', 'd0000000-0000-0000-0000-000000000036', 14500, 14500, 'PAID', '2026-02-12'::date, 'Initial payment received via UPI', '9811001024', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000036', 'f2000000-0000-0000-0000-000000000036', 14500, 'UPI', 'Sunita Rajput', 'TXN-2026-100036', '2026-01-23 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000037', 'd0000000-0000-0000-0000-000000000037', 14500, 7250, 'PARTIAL', '2026-02-19'::date, 'Initial payment received via CARD', '9811001025', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000037', 'f2000000-0000-0000-0000-000000000037', 7250, 'CARD', 'Priya Kashyap', 'TXN-2026-100037', '2026-01-30 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000038', 'd0000000-0000-0000-0000-000000000038', 5400, 2700, 'PARTIAL', '2026-02-18'::date, 'Initial payment received via CASH', '9811001025', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000038', 'f2000000-0000-0000-0000-000000000038', 2700, 'CASH', 'Vandana Kapoor', 'TXN-2026-100038', '2026-02-06 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000039', 'd0000000-0000-0000-0000-000000000039', 5400, 2700, 'PARTIAL', '2026-02-25'::date, 'Initial payment received via NET_BANKING', '9811001026', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000039', 'f2000000-0000-0000-0000-000000000039', 2700, 'NET_BANKING', 'Sunita Rajput', 'TXN-2026-100039', '2026-02-13 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000040', 'd0000000-0000-0000-0000-000000000040', 9800, 9800, 'PAID', '2026-03-10'::date, 'Initial payment received via UPI', '9811001026', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000040', 'f2000000-0000-0000-0000-000000000040', 9800, 'UPI', 'Priya Kashyap', 'TXN-2026-100040', '2026-02-20 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000041', 'd0000000-0000-0000-0000-000000000041', 9800, 4900, 'PARTIAL', '2026-03-17'::date, 'Initial payment received via CARD', '9811001027', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000041', 'f2000000-0000-0000-0000-000000000041', 4900, 'CARD', 'Vandana Kapoor', 'TXN-2026-100041', '2026-02-27 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000042', 'd0000000-0000-0000-0000-000000000042', 4500, 1350, 'PARTIAL', '2026-03-16'::date, 'Initial payment received via CASH', '9811001027', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000042', 'f2000000-0000-0000-0000-000000000042', 1350, 'CASH', 'Sunita Rajput', 'TXN-2026-100042', '2026-03-06 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000043', 'd0000000-0000-0000-0000-000000000043', 4500, 2250, 'PARTIAL', '2026-03-23'::date, 'Initial payment received via NET_BANKING', '9811001028', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000043', 'f2000000-0000-0000-0000-000000000043', 2250, 'NET_BANKING', 'Priya Kashyap', 'TXN-2026-100043', '2026-03-13 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000044', 'd0000000-0000-0000-0000-000000000044', 7200, 7200, 'PAID', '2026-04-03'::date, 'Initial payment received via UPI', '9811001028', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000044', 'f2000000-0000-0000-0000-000000000044', 7200, 'UPI', 'Vandana Kapoor', 'TXN-2026-100044', '2026-03-20 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000045', 'd0000000-0000-0000-0000-000000000045', 5200, 5200, 'PAID', '2026-04-05'::date, 'Initial payment received via CARD', '9811001028', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000045', 'f2000000-0000-0000-0000-000000000045', 5200, 'CARD', 'Sunita Rajput', 'TXN-2026-100045', '2026-03-27 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000046', 'd0000000-0000-0000-0000-000000000046', 5400, 2700, 'PARTIAL', '2026-04-15'::date, 'Initial payment received via CASH', '9811001029', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000046', 'f2000000-0000-0000-0000-000000000046', 2700, 'CASH', 'Priya Kashyap', 'TXN-2026-100046', '2026-04-03 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000047', 'd0000000-0000-0000-0000-000000000047', 9800, 4900, 'PARTIAL', '2026-04-28'::date, 'Initial payment received via NET_BANKING', '9811001029', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000047', 'f2000000-0000-0000-0000-000000000047', 4900, 'NET_BANKING', 'Vandana Kapoor', 'TXN-2026-100047', '2026-04-10 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000048', 'd0000000-0000-0000-0000-000000000048', 4500, 4500, 'PAID', '2026-04-27'::date, 'Initial payment received via UPI', '9811001029', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000048', 'f2000000-0000-0000-0000-000000000048', 4500, 'UPI', 'Sunita Rajput', 'TXN-2026-100048', '2026-04-17 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000049', 'd0000000-0000-0000-0000-000000000049', 38000, 11400, 'PARTIAL', '2026-05-24'::date, 'Initial payment received via CARD', '9811001030', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000049', 'f2000000-0000-0000-0000-000000000049', 11400, 'CARD', 'Priya Kashyap', 'TXN-2026-100049', '2026-04-24 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000050', 'd0000000-0000-0000-0000-000000000050', 14500, 14500, 'PAID', '2026-05-21'::date, 'Initial payment received via CASH', '9811001030', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000050', 'f2000000-0000-0000-0000-000000000050', 14500, 'CASH', 'Vandana Kapoor', 'TXN-2026-100050', '2026-05-01 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000051', 'd0000000-0000-0000-0000-000000000051', 5400, 2700, 'PARTIAL', '2026-05-20'::date, 'Initial payment received via NET_BANKING', '9811001030', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000051', 'f2000000-0000-0000-0000-000000000051', 2700, 'NET_BANKING', 'Sunita Rajput', 'TXN-2026-100051', '2026-05-08 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000052', 'd0000000-0000-0000-0000-000000000052', 7200, 7200, 'PAID', '2026-05-29'::date, 'Initial payment received via UPI', '9811001031', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000052', 'f2000000-0000-0000-0000-000000000052', 7200, 'UPI', 'Priya Kashyap', 'TXN-2026-100052', '2026-05-15 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000053', 'd0000000-0000-0000-0000-000000000053', 5200, 2600, 'PARTIAL', '2026-05-31'::date, 'Initial payment received via CARD', '9811001031', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000053', 'f2000000-0000-0000-0000-000000000053', 2600, 'CARD', 'Vandana Kapoor', 'TXN-2026-100053', '2026-05-22 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000054', 'd0000000-0000-0000-0000-000000000054', 38000, 19000, 'PARTIAL', '2026-06-28'::date, 'Initial payment received via CASH', '9811001031', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000054', 'f2000000-0000-0000-0000-000000000054', 19000, 'CASH', 'Sunita Rajput', 'TXN-2026-100054', '2026-05-29 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000055', 'd0000000-0000-0000-0000-000000000055', 9800, 9800, 'PAID', '2026-06-23'::date, 'Initial payment received via NET_BANKING', '9811001032', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000055', 'f2000000-0000-0000-0000-000000000055', 9800, 'NET_BANKING', 'Priya Kashyap', 'TXN-2026-100055', '2026-06-05 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000056', 'd0000000-0000-0000-0000-000000000056', 4500, 4500, 'PAID', '2026-06-22'::date, 'Initial payment received via UPI', '9811001032', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000056', 'f2000000-0000-0000-0000-000000000056', 4500, 'UPI', 'Vandana Kapoor', 'TXN-2026-100056', '2026-06-12 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000057', 'd0000000-0000-0000-0000-000000000057', 7200, 3600, 'PARTIAL', '2026-07-03'::date, 'Initial payment received via CARD', '9811001032', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000057', 'f2000000-0000-0000-0000-000000000057', 3600, 'CARD', 'Sunita Rajput', 'TXN-2026-100057', '2026-06-19 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000058', 'd0000000-0000-0000-0000-000000000058', 14500, 7250, 'PARTIAL', '2026-07-16'::date, 'Initial payment received via CASH', '9811001033', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000058', 'f2000000-0000-0000-0000-000000000058', 7250, 'CASH', 'Priya Kashyap', 'TXN-2026-100058', '2026-06-26 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000059', 'd0000000-0000-0000-0000-000000000059', 5400, 2700, 'PARTIAL', '2026-07-15'::date, 'Initial payment received via NET_BANKING', '9811001033', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000059', 'f2000000-0000-0000-0000-000000000059', 2700, 'NET_BANKING', 'Vandana Kapoor', 'TXN-2026-100059', '2026-07-03 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000060', 'd0000000-0000-0000-0000-000000000060', 9800, 9800, 'PAID', '2026-07-28'::date, 'Initial payment received via UPI', '9811001033', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000060', 'f2000000-0000-0000-0000-000000000060', 9800, 'UPI', 'Sunita Rajput', 'TXN-2026-100060', '2026-07-10 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000061', 'd0000000-0000-0000-0000-000000000061', 5200, 2600, 'PARTIAL', '2026-07-26'::date, 'Initial payment received via CARD', '9811001034', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000061', 'f2000000-0000-0000-0000-000000000061', 2600, 'CARD', 'Priya Kashyap', 'TXN-2026-100061', '2026-07-17 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000062', 'd0000000-0000-0000-0000-000000000062', 38000, 19000, 'PARTIAL', '2026-08-23'::date, 'Initial payment received via CASH', '9811001034', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000062', 'f2000000-0000-0000-0000-000000000062', 19000, 'CASH', 'Vandana Kapoor', 'TXN-2026-100062', '2026-07-24 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000063', 'd0000000-0000-0000-0000-000000000063', 14500, 4350, 'PARTIAL', '2026-08-20'::date, 'Initial payment received via NET_BANKING', '9811001034', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000063', 'f2000000-0000-0000-0000-000000000063', 4350, 'NET_BANKING', 'Sunita Rajput', 'TXN-2026-100063', '2026-07-31 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000064', 'd0000000-0000-0000-0000-000000000064', 4500, 4500, 'PAID', '2026-08-17'::date, 'Initial payment received via UPI', '9811001035', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000064', 'f2000000-0000-0000-0000-000000000064', 4500, 'UPI', 'Priya Kashyap', 'TXN-2026-100064', '2026-08-07 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000065', 'd0000000-0000-0000-0000-000000000065', 7200, 7200, 'PAID', '2026-08-28'::date, 'Initial payment received via CARD', '9811001035', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000065', 'f2000000-0000-0000-0000-000000000065', 7200, 'CARD', 'Vandana Kapoor', 'TXN-2026-100065', '2026-08-14 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000066', 'd0000000-0000-0000-0000-000000000066', 5200, 2600, 'PARTIAL', '2026-08-30'::date, 'Initial payment received via CASH', '9811001035', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000066', 'f2000000-0000-0000-0000-000000000066', 2600, 'CASH', 'Sunita Rajput', 'TXN-2026-100066', '2026-08-21 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000067', 'd0000000-0000-0000-0000-000000000067', 5400, 2700, 'PARTIAL', '2026-09-09'::date, 'Initial payment received via NET_BANKING', '9811001036', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000067', 'f2000000-0000-0000-0000-000000000067', 2700, 'NET_BANKING', 'Priya Kashyap', 'TXN-2026-100067', '2026-08-28 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000068', 'd0000000-0000-0000-0000-000000000068', 9800, 9800, 'PAID', '2026-09-22'::date, 'Initial payment received via UPI', '9811001036', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000068', 'f2000000-0000-0000-0000-000000000068', 9800, 'UPI', 'Vandana Kapoor', 'TXN-2026-100068', '2026-09-04 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000069', 'd0000000-0000-0000-0000-000000000069', 4500, 2250, 'PARTIAL', '2026-01-24'::date, 'Initial payment received via CARD', '9811001036', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000069', 'f2000000-0000-0000-0000-000000000069', 2250, 'CARD', 'Sunita Rajput', 'TXN-2026-100069', '2026-01-14 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000070', 'd0000000-0000-0000-0000-000000000070', 38000, 38000, 'PAID', '2026-02-20'::date, 'Initial payment received via CASH', '9811001037', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000070', 'f2000000-0000-0000-0000-000000000070', 38000, 'CASH', 'Priya Kashyap', 'TXN-2026-100070', '2026-01-21 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000071', 'd0000000-0000-0000-0000-000000000071', 14500, 7250, 'PARTIAL', '2026-02-17'::date, 'Initial payment received via NET_BANKING', '9811001037', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000071', 'f2000000-0000-0000-0000-000000000071', 7250, 'NET_BANKING', 'Vandana Kapoor', 'TXN-2026-100071', '2026-01-28 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000072', 'd0000000-0000-0000-0000-000000000072', 5400, 5400, 'PAID', '2026-02-16'::date, 'Initial payment received via UPI', '9811001037', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000072', 'f2000000-0000-0000-0000-000000000072', 5400, 'UPI', 'Sunita Rajput', 'TXN-2026-100072', '2026-02-04 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000073', 'd0000000-0000-0000-0000-000000000073', 7200, 3600, 'PARTIAL', '2026-02-25'::date, 'Initial payment received via CARD', '9811001038', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000073', 'f2000000-0000-0000-0000-000000000073', 3600, 'CARD', 'Priya Kashyap', 'TXN-2026-100073', '2026-02-11 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000074', 'd0000000-0000-0000-0000-000000000074', 5200, 2600, 'PARTIAL', '2026-02-27'::date, 'Initial payment received via CASH', '9811001038', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000074', 'f2000000-0000-0000-0000-000000000074', 2600, 'CASH', 'Vandana Kapoor', 'TXN-2026-100074', '2026-02-18 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000075', 'd0000000-0000-0000-0000-000000000075', 38000, 38000, 'PAID', '2026-03-27'::date, 'Initial payment received via NET_BANKING', '9811001038', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000075', 'f2000000-0000-0000-0000-000000000075', 38000, 'NET_BANKING', 'Sunita Rajput', 'TXN-2026-100075', '2026-02-25 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000076', 'd0000000-0000-0000-0000-000000000076', 9800, 9800, 'PAID', '2026-03-22'::date, 'Initial payment received via UPI', '9811001039', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000076', 'f2000000-0000-0000-0000-000000000076', 9800, 'UPI', 'Priya Kashyap', 'TXN-2026-100076', '2026-03-04 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000077', 'd0000000-0000-0000-0000-000000000077', 4500, 1350, 'PARTIAL', '2026-03-21'::date, 'Initial payment received via CARD', '9811001039', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000077', 'f2000000-0000-0000-0000-000000000077', 1350, 'CARD', 'Vandana Kapoor', 'TXN-2026-100077', '2026-03-11 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000078', 'd0000000-0000-0000-0000-000000000078', 7200, 3600, 'PARTIAL', '2026-04-01'::date, 'Initial payment received via CASH', '9811001039', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000078', 'f2000000-0000-0000-0000-000000000078', 3600, 'CASH', 'Sunita Rajput', 'TXN-2026-100078', '2026-03-18 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000079', 'd0000000-0000-0000-0000-000000000079', 14500, 7250, 'PARTIAL', '2026-04-14'::date, 'Initial payment received via NET_BANKING', '9811001040', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000079', 'f2000000-0000-0000-0000-000000000079', 7250, 'NET_BANKING', 'Priya Kashyap', 'TXN-2026-100079', '2026-03-25 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000080', 'd0000000-0000-0000-0000-000000000080', 5400, 5400, 'PAID', '2026-04-13'::date, 'Initial payment received via UPI', '9811001040', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000080', 'f2000000-0000-0000-0000-000000000080', 5400, 'UPI', 'Vandana Kapoor', 'TXN-2026-100080', '2026-04-01 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000081', 'd0000000-0000-0000-0000-000000000081', 9800, 4900, 'PARTIAL', '2026-04-26'::date, 'Initial payment received via CARD', '9811001040', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000081', 'f2000000-0000-0000-0000-000000000081', 4900, 'CARD', 'Sunita Rajput', 'TXN-2026-100081', '2026-04-08 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000082', 'd0000000-0000-0000-0000-000000000082', 5200, 2600, 'PARTIAL', '2026-04-24'::date, 'Initial payment received via CASH', '9811001041', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000082', 'f2000000-0000-0000-0000-000000000082', 2600, 'CASH', 'Priya Kashyap', 'TXN-2026-100082', '2026-04-15 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000083', 'd0000000-0000-0000-0000-000000000083', 38000, 19000, 'PARTIAL', '2026-05-22'::date, 'Initial payment received via NET_BANKING', '9811001041', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000083', 'f2000000-0000-0000-0000-000000000083', 19000, 'NET_BANKING', 'Vandana Kapoor', 'TXN-2026-100083', '2026-04-22 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000084', 'd0000000-0000-0000-0000-000000000084', 14500, 14500, 'PAID', '2026-05-19'::date, 'Initial payment received via UPI', '9811001041', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000084', 'f2000000-0000-0000-0000-000000000084', 14500, 'UPI', 'Sunita Rajput', 'TXN-2026-100084', '2026-04-29 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000085', 'd0000000-0000-0000-0000-000000000085', 5400, 5400, 'PAID', '2026-05-18'::date, 'Initial payment received via CARD', '9811001041', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000085', 'f2000000-0000-0000-0000-000000000085', 5400, 'CARD', 'Priya Kashyap', 'TXN-2026-100085', '2026-05-06 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000086', 'd0000000-0000-0000-0000-000000000086', 14500, 7250, 'PARTIAL', '2026-06-02'::date, 'Initial payment received via CASH', '9811001042', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000086', 'f2000000-0000-0000-0000-000000000086', 7250, 'CASH', 'Vandana Kapoor', 'TXN-2026-100086', '2026-05-13 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000087', 'd0000000-0000-0000-0000-000000000087', 5400, 2700, 'PARTIAL', '2026-06-01'::date, 'Initial payment received via NET_BANKING', '9811001042', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000087', 'f2000000-0000-0000-0000-000000000087', 2700, 'NET_BANKING', 'Sunita Rajput', 'TXN-2026-100087', '2026-05-20 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000088', 'd0000000-0000-0000-0000-000000000088', 9800, 9800, 'PAID', '2026-06-14'::date, 'Initial payment received via UPI', '9811001042', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000088', 'f2000000-0000-0000-0000-000000000088', 9800, 'UPI', 'Priya Kashyap', 'TXN-2026-100088', '2026-05-27 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000089', 'd0000000-0000-0000-0000-000000000089', 4500, 2250, 'PARTIAL', '2026-06-13'::date, 'Initial payment received via CARD', '9811001042', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000089', 'f2000000-0000-0000-0000-000000000089', 2250, 'CARD', 'Vandana Kapoor', 'TXN-2026-100089', '2026-06-03 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000090', 'd0000000-0000-0000-0000-000000000090', 9800, 9800, 'PAID', '2026-06-28'::date, 'Initial payment received via CASH', '9811001043', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000090', 'f2000000-0000-0000-0000-000000000090', 9800, 'CASH', 'Sunita Rajput', 'TXN-2026-100090', '2026-06-10 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000091', 'd0000000-0000-0000-0000-000000000091', 4500, 1350, 'PARTIAL', '2026-06-27'::date, 'Initial payment received via NET_BANKING', '9811001043', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000091', 'f2000000-0000-0000-0000-000000000091', 1350, 'NET_BANKING', 'Priya Kashyap', 'TXN-2026-100091', '2026-06-17 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000092', 'd0000000-0000-0000-0000-000000000092', 7200, 7200, 'PAID', '2026-07-08'::date, 'Initial payment received via UPI', '9811001043', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000092', 'f2000000-0000-0000-0000-000000000092', 7200, 'UPI', 'Vandana Kapoor', 'TXN-2026-100092', '2026-06-24 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000093', 'd0000000-0000-0000-0000-000000000093', 5200, 2600, 'PARTIAL', '2026-07-10'::date, 'Initial payment received via CARD', '9811001043', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000093', 'f2000000-0000-0000-0000-000000000093', 2600, 'CARD', 'Sunita Rajput', 'TXN-2026-100093', '2026-07-01 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000094', 'd0000000-0000-0000-0000-000000000094', 7200, 3600, 'PARTIAL', '2026-07-22'::date, 'Initial payment received via CASH', '9811001044', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000094', 'f2000000-0000-0000-0000-000000000094', 3600, 'CASH', 'Priya Kashyap', 'TXN-2026-100094', '2026-07-08 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000095', 'd0000000-0000-0000-0000-000000000095', 5200, 5200, 'PAID', '2026-07-24'::date, 'Initial payment received via NET_BANKING', '9811001044', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000095', 'f2000000-0000-0000-0000-000000000095', 5200, 'NET_BANKING', 'Vandana Kapoor', 'TXN-2026-100095', '2026-07-15 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000096', 'd0000000-0000-0000-0000-000000000096', 38000, 38000, 'PAID', '2026-08-21'::date, 'Initial payment received via UPI', '9811001044', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000096', 'f2000000-0000-0000-0000-000000000096', 38000, 'UPI', 'Sunita Rajput', 'TXN-2026-100096', '2026-07-22 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000097', 'd0000000-0000-0000-0000-000000000097', 14500, 7250, 'PARTIAL', '2026-08-18'::date, 'Initial payment received via CARD', '9811001044', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000097', 'f2000000-0000-0000-0000-000000000097', 7250, 'CARD', 'Priya Kashyap', 'TXN-2026-100097', '2026-07-29 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000098', 'd0000000-0000-0000-0000-000000000098', 38000, 11400, 'PARTIAL', '2026-09-04'::date, 'Initial payment received via CASH', '9811001045', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000098', 'f2000000-0000-0000-0000-000000000098', 11400, 'CASH', 'Vandana Kapoor', 'TXN-2026-100098', '2026-08-05 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000099', 'd0000000-0000-0000-0000-000000000099', 14500, 7250, 'PARTIAL', '2026-09-01'::date, 'Initial payment received via NET_BANKING', '9811001045', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000099', 'f2000000-0000-0000-0000-000000000099', 7250, 'NET_BANKING', 'Sunita Rajput', 'TXN-2026-100099', '2026-08-12 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000100', 'd0000000-0000-0000-0000-000000000100', 5400, 5400, 'PAID', '2026-08-31'::date, 'Initial payment received via UPI', '9811001045', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000100', 'f2000000-0000-0000-0000-000000000100', 5400, 'UPI', 'Priya Kashyap', 'TXN-2026-100100', '2026-08-19 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000101', 'd0000000-0000-0000-0000-000000000101', 9800, 4900, 'PARTIAL', '2026-09-13'::date, 'Initial payment received via CARD', '9811001045', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000101', 'f2000000-0000-0000-0000-000000000101', 4900, 'CARD', 'Vandana Kapoor', 'TXN-2026-100101', '2026-08-26 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000102', 'd0000000-0000-0000-0000-000000000102', 5400, 2700, 'PARTIAL', '2026-09-14'::date, 'Initial payment received via CASH', '9811001046', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000102', 'f2000000-0000-0000-0000-000000000102', 2700, 'CASH', 'Sunita Rajput', 'TXN-2026-100102', '2026-09-02 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000103', 'd0000000-0000-0000-0000-000000000103', 9800, 4900, 'PARTIAL', '2026-01-30'::date, 'Initial payment received via NET_BANKING', '9811001046', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000103', 'f2000000-0000-0000-0000-000000000103', 4900, 'NET_BANKING', 'Priya Kashyap', 'TXN-2026-100103', '2026-01-12 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000104', 'd0000000-0000-0000-0000-000000000104', 4500, 4500, 'PAID', '2026-01-29'::date, 'Initial payment received via UPI', '9811001046', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000104', 'f2000000-0000-0000-0000-000000000104', 4500, 'UPI', 'Vandana Kapoor', 'TXN-2026-100104', '2026-01-19 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000105', 'd0000000-0000-0000-0000-000000000105', 7200, 7200, 'PAID', '2026-02-09'::date, 'Initial payment received via CARD', '9811001046', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000105', 'f2000000-0000-0000-0000-000000000105', 7200, 'CARD', 'Sunita Rajput', 'TXN-2026-100105', '2026-01-26 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000106', 'd0000000-0000-0000-0000-000000000106', 4500, 2250, 'PARTIAL', '2026-02-12'::date, 'Initial payment received via CASH', '9811001047', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000106', 'f2000000-0000-0000-0000-000000000106', 2250, 'CASH', 'Priya Kashyap', 'TXN-2026-100106', '2026-02-02 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000107', 'd0000000-0000-0000-0000-000000000107', 7200, 3600, 'PARTIAL', '2026-02-23'::date, 'Initial payment received via NET_BANKING', '9811001047', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000107', 'f2000000-0000-0000-0000-000000000107', 3600, 'NET_BANKING', 'Vandana Kapoor', 'TXN-2026-100107', '2026-02-09 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000108', 'd0000000-0000-0000-0000-000000000108', 5200, 5200, 'PAID', '2026-02-25'::date, 'Initial payment received via UPI', '9811001047', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000108', 'f2000000-0000-0000-0000-000000000108', 5200, 'UPI', 'Sunita Rajput', 'TXN-2026-100108', '2026-02-16 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000109', 'd0000000-0000-0000-0000-000000000109', 38000, 19000, 'PARTIAL', '2026-03-25'::date, 'Initial payment received via CARD', '9811001047', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000109', 'f2000000-0000-0000-0000-000000000109', 19000, 'CARD', 'Priya Kashyap', 'TXN-2026-100109', '2026-02-23 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000110', 'd0000000-0000-0000-0000-000000000110', 14500, 14500, 'PAID', '2026-03-22'::date, 'Initial payment received via CASH', '9811001047', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000110', 'f2000000-0000-0000-0000-000000000110', 14500, 'CASH', 'Vandana Kapoor', 'TXN-2026-100110', '2026-03-02 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000111', 'd0000000-0000-0000-0000-000000000111', 9800, 4900, 'PARTIAL', '2026-03-27'::date, 'Initial payment received via NET_BANKING', '9811001048', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000111', 'f2000000-0000-0000-0000-000000000111', 4900, 'NET_BANKING', 'Sunita Rajput', 'TXN-2026-100111', '2026-03-09 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000112', 'd0000000-0000-0000-0000-000000000112', 4500, 4500, 'PAID', '2026-03-26'::date, 'Initial payment received via UPI', '9811001048', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000112', 'f2000000-0000-0000-0000-000000000112', 4500, 'UPI', 'Priya Kashyap', 'TXN-2026-100112', '2026-03-16 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000113', 'd0000000-0000-0000-0000-000000000113', 7200, 3600, 'PARTIAL', '2026-04-06'::date, 'Initial payment received via CARD', '9811001048', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000113', 'f2000000-0000-0000-0000-000000000113', 3600, 'CARD', 'Vandana Kapoor', 'TXN-2026-100113', '2026-03-23 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000114', 'd0000000-0000-0000-0000-000000000114', 5200, 2600, 'PARTIAL', '2026-04-08'::date, 'Initial payment received via CASH', '9811001048', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000114', 'f2000000-0000-0000-0000-000000000114', 2600, 'CASH', 'Sunita Rajput', 'TXN-2026-100114', '2026-03-30 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000115', 'd0000000-0000-0000-0000-000000000115', 38000, 38000, 'PAID', '2026-05-06'::date, 'Initial payment received via NET_BANKING', '9811001048', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000115', 'f2000000-0000-0000-0000-000000000115', 38000, 'NET_BANKING', 'Priya Kashyap', 'TXN-2026-100115', '2026-04-06 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000116', 'd0000000-0000-0000-0000-000000000116', 5400, 5400, 'PAID', '2026-04-25'::date, 'Initial payment received via UPI', '9811001049', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000116', 'f2000000-0000-0000-0000-000000000116', 5400, 'UPI', 'Vandana Kapoor', 'TXN-2026-100116', '2026-04-13 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000117', 'd0000000-0000-0000-0000-000000000117', 9800, 4900, 'PARTIAL', '2026-05-08'::date, 'Initial payment received via CARD', '9811001049', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000117', 'f2000000-0000-0000-0000-000000000117', 4900, 'CARD', 'Sunita Rajput', 'TXN-2026-100117', '2026-04-20 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000118', 'd0000000-0000-0000-0000-000000000118', 4500, 2250, 'PARTIAL', '2026-05-07'::date, 'Initial payment received via CASH', '9811001049', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000118', 'f2000000-0000-0000-0000-000000000118', 2250, 'CASH', 'Priya Kashyap', 'TXN-2026-100118', '2026-04-27 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000119', 'd0000000-0000-0000-0000-000000000119', 7200, 2160, 'PARTIAL', '2026-05-18'::date, 'Initial payment received via NET_BANKING', '9811001049', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000119', 'f2000000-0000-0000-0000-000000000119', 2160, 'NET_BANKING', 'Vandana Kapoor', 'TXN-2026-100119', '2026-05-04 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000120', 'd0000000-0000-0000-0000-000000000120', 5200, 5200, 'PAID', '2026-05-20'::date, 'Initial payment received via UPI', '9811001049', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000120', 'f2000000-0000-0000-0000-000000000120', 5200, 'UPI', 'Sunita Rajput', 'TXN-2026-100120', '2026-05-11 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000121', 'd0000000-0000-0000-0000-000000000121', 14500, 7250, 'PARTIAL', '2026-06-07'::date, 'Initial payment received via CARD', '9811001050', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000121', 'f2000000-0000-0000-0000-000000000121', 7250, 'CARD', 'Priya Kashyap', 'TXN-2026-100121', '2026-05-18 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000122', 'd0000000-0000-0000-0000-000000000122', 5400, 2700, 'PARTIAL', '2026-06-06'::date, 'Initial payment received via CASH', '9811001050', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000122', 'f2000000-0000-0000-0000-000000000122', 2700, 'CASH', 'Vandana Kapoor', 'TXN-2026-100122', '2026-05-25 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000123', 'd0000000-0000-0000-0000-000000000123', 9800, 4900, 'PARTIAL', '2026-06-19'::date, 'Initial payment received via NET_BANKING', '9811001050', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000123', 'f2000000-0000-0000-0000-000000000123', 4900, 'NET_BANKING', 'Sunita Rajput', 'TXN-2026-100123', '2026-06-01 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000124', 'd0000000-0000-0000-0000-000000000124', 4500, 4500, 'PAID', '2026-06-18'::date, 'Initial payment received via UPI', '9811001050', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000124', 'f2000000-0000-0000-0000-000000000124', 4500, 'UPI', 'Priya Kashyap', 'TXN-2026-100124', '2026-06-08 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, order_id, total_amount, paid_amount, status, due_date, notes, customer_mobile, created_at, updated_at)
VALUES ('f2000000-0000-0000-0000-000000000125', 'd0000000-0000-0000-0000-000000000125', 7200, 7200, 'PAID', '2026-06-29'::date, 'Initial payment received via CARD', '9811001050', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
VALUES ('f3000000-0000-0000-0000-000000000125', 'f2000000-0000-0000-0000-000000000125', 7200, 'CARD', 'Vandana Kapoor', 'TXN-2026-100125', '2026-06-15 11:30:00'::timestamp, 'Advance token payment processed at counter')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 10. ORDER PROGRESS STAGES (250 stages: ORDER_TAKEN + Current active stage)
-- =============================================================================
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'ORDER_TAKEN', '2026-01-18 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'ORDER_TAKEN', '2026-01-25 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'STITCHING', NULL, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'ORDER_TAKEN', '2026-02-01 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'ORDER_TAKEN', '2026-02-08 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'READY_TO_DELIVER', '2026-02-20 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 'ORDER_TAKEN', '2026-02-15 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 'READY_TO_DELIVER', '2026-02-24 16:00:00'::timestamp, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 'ORDER_TAKEN', '2026-02-22 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 'STITCHING', NULL, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000007', 'ORDER_TAKEN', '2026-03-01 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000007', 'ORDER_TAKEN', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000008', 'ORDER_TAKEN', '2026-03-08 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000008', 'READY_TO_DELIVER', '2026-03-18 16:00:00'::timestamp, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000009', 'ORDER_TAKEN', '2026-03-15 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000009', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000010', 'ORDER_TAKEN', '2026-03-22 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000010', 'READY_TO_DELIVER', '2026-04-05 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000011', 'ORDER_TAKEN', '2026-03-29 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000011', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000012', 'ORDER_TAKEN', '2026-04-05 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000012', 'READY_TO_DELIVER', '2026-04-14 16:00:00'::timestamp, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000013', 'ORDER_TAKEN', '2026-04-12 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000013', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000014', 'ORDER_TAKEN', '2026-04-19 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000014', 'ORDER_TAKEN', NULL, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000015', 'ORDER_TAKEN', '2026-04-26 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000015', 'READY_TO_DELIVER', '2026-05-06 16:00:00'::timestamp, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000016', 'ORDER_TAKEN', '2026-05-03 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000016', 'READY_TO_DELIVER', '2026-05-17 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000017', 'ORDER_TAKEN', '2026-05-10 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000017', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000018', 'ORDER_TAKEN', '2026-05-17 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000018', 'STITCHING', NULL, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000019', 'ORDER_TAKEN', '2026-05-24 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000019', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000020', 'ORDER_TAKEN', '2026-05-31 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000020', 'READY_TO_DELIVER', '2026-06-30 16:00:00'::timestamp, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000021', 'd0000000-0000-0000-0000-000000000021', 'ORDER_TAKEN', '2026-06-07 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000021', 'd0000000-0000-0000-0000-000000000021', 'ORDER_TAKEN', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000022', 'd0000000-0000-0000-0000-000000000022', 'ORDER_TAKEN', '2026-06-14 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000022', 'd0000000-0000-0000-0000-000000000022', 'STITCHING', NULL, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000023', 'd0000000-0000-0000-0000-000000000023', 'ORDER_TAKEN', '2026-06-21 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000023', 'd0000000-0000-0000-0000-000000000023', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000024', 'd0000000-0000-0000-0000-000000000024', 'ORDER_TAKEN', '2026-06-28 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000024', 'd0000000-0000-0000-0000-000000000024', 'READY_TO_DELIVER', '2026-07-10 16:00:00'::timestamp, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000025', 'd0000000-0000-0000-0000-000000000025', 'ORDER_TAKEN', '2026-07-05 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000025', 'd0000000-0000-0000-0000-000000000025', 'READY_TO_DELIVER', '2026-07-17 16:00:00'::timestamp, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000026', 'd0000000-0000-0000-0000-000000000026', 'ORDER_TAKEN', '2026-07-12 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000026', 'd0000000-0000-0000-0000-000000000026', 'STITCHING', NULL, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000027', 'd0000000-0000-0000-0000-000000000027', 'ORDER_TAKEN', '2026-07-19 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000027', 'd0000000-0000-0000-0000-000000000027', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000028', 'd0000000-0000-0000-0000-000000000028', 'ORDER_TAKEN', '2026-07-26 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000028', 'd0000000-0000-0000-0000-000000000028', 'READY_TO_DELIVER', '2026-08-05 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000029', 'd0000000-0000-0000-0000-000000000029', 'ORDER_TAKEN', '2026-08-02 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000029', 'd0000000-0000-0000-0000-000000000029', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000030', 'd0000000-0000-0000-0000-000000000030', 'ORDER_TAKEN', '2026-08-09 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000030', 'd0000000-0000-0000-0000-000000000030', 'READY_TO_DELIVER', '2026-08-23 16:00:00'::timestamp, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000031', 'd0000000-0000-0000-0000-000000000031', 'ORDER_TAKEN', '2026-08-16 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000031', 'd0000000-0000-0000-0000-000000000031', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000032', 'd0000000-0000-0000-0000-000000000032', 'ORDER_TAKEN', '2026-08-23 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000032', 'd0000000-0000-0000-0000-000000000032', 'READY_TO_DELIVER', '2026-09-01 16:00:00'::timestamp, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000033', 'd0000000-0000-0000-0000-000000000033', 'ORDER_TAKEN', '2026-08-30 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000033', 'd0000000-0000-0000-0000-000000000033', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000034', 'd0000000-0000-0000-0000-000000000034', 'ORDER_TAKEN', '2026-09-06 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000034', 'd0000000-0000-0000-0000-000000000034', 'STITCHING', NULL, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000035', 'd0000000-0000-0000-0000-000000000035', 'ORDER_TAKEN', '2026-01-16 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000035', 'd0000000-0000-0000-0000-000000000035', 'READY_TO_DELIVER', '2026-02-15 16:00:00'::timestamp, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000036', 'd0000000-0000-0000-0000-000000000036', 'ORDER_TAKEN', '2026-01-23 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000036', 'd0000000-0000-0000-0000-000000000036', 'READY_TO_DELIVER', '2026-02-12 16:00:00'::timestamp, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000037', 'd0000000-0000-0000-0000-000000000037', 'ORDER_TAKEN', '2026-01-30 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000037', 'd0000000-0000-0000-0000-000000000037', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000038', 'd0000000-0000-0000-0000-000000000038', 'ORDER_TAKEN', '2026-02-06 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000038', 'd0000000-0000-0000-0000-000000000038', 'STITCHING', NULL, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000039', 'd0000000-0000-0000-0000-000000000039', 'ORDER_TAKEN', '2026-02-13 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000039', 'd0000000-0000-0000-0000-000000000039', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000040', 'd0000000-0000-0000-0000-000000000040', 'ORDER_TAKEN', '2026-02-20 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000040', 'd0000000-0000-0000-0000-000000000040', 'READY_TO_DELIVER', '2026-03-10 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000041', 'd0000000-0000-0000-0000-000000000041', 'ORDER_TAKEN', '2026-02-27 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000041', 'd0000000-0000-0000-0000-000000000041', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000042', 'd0000000-0000-0000-0000-000000000042', 'ORDER_TAKEN', '2026-03-06 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000042', 'd0000000-0000-0000-0000-000000000042', 'ORDER_TAKEN', NULL, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000043', 'd0000000-0000-0000-0000-000000000043', 'ORDER_TAKEN', '2026-03-13 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000043', 'd0000000-0000-0000-0000-000000000043', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000044', 'd0000000-0000-0000-0000-000000000044', 'ORDER_TAKEN', '2026-03-20 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000044', 'd0000000-0000-0000-0000-000000000044', 'READY_TO_DELIVER', '2026-04-03 16:00:00'::timestamp, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000045', 'd0000000-0000-0000-0000-000000000045', 'ORDER_TAKEN', '2026-03-27 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000045', 'd0000000-0000-0000-0000-000000000045', 'READY_TO_DELIVER', '2026-04-05 16:00:00'::timestamp, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000046', 'd0000000-0000-0000-0000-000000000046', 'ORDER_TAKEN', '2026-04-03 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000046', 'd0000000-0000-0000-0000-000000000046', 'STITCHING', NULL, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000047', 'd0000000-0000-0000-0000-000000000047', 'ORDER_TAKEN', '2026-04-10 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000047', 'd0000000-0000-0000-0000-000000000047', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000048', 'd0000000-0000-0000-0000-000000000048', 'ORDER_TAKEN', '2026-04-17 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000048', 'd0000000-0000-0000-0000-000000000048', 'READY_TO_DELIVER', '2026-04-27 16:00:00'::timestamp, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000049', 'd0000000-0000-0000-0000-000000000049', 'ORDER_TAKEN', '2026-04-24 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000049', 'd0000000-0000-0000-0000-000000000049', 'ORDER_TAKEN', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000050', 'd0000000-0000-0000-0000-000000000050', 'ORDER_TAKEN', '2026-05-01 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000050', 'd0000000-0000-0000-0000-000000000050', 'READY_TO_DELIVER', '2026-05-21 16:00:00'::timestamp, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000051', 'd0000000-0000-0000-0000-000000000051', 'ORDER_TAKEN', '2026-05-08 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000051', 'd0000000-0000-0000-0000-000000000051', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000052', 'd0000000-0000-0000-0000-000000000052', 'ORDER_TAKEN', '2026-05-15 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000052', 'd0000000-0000-0000-0000-000000000052', 'READY_TO_DELIVER', '2026-05-29 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000053', 'd0000000-0000-0000-0000-000000000053', 'ORDER_TAKEN', '2026-05-22 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000053', 'd0000000-0000-0000-0000-000000000053', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000054', 'd0000000-0000-0000-0000-000000000054', 'ORDER_TAKEN', '2026-05-29 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000054', 'd0000000-0000-0000-0000-000000000054', 'STITCHING', NULL, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000055', 'd0000000-0000-0000-0000-000000000055', 'ORDER_TAKEN', '2026-06-05 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000055', 'd0000000-0000-0000-0000-000000000055', 'READY_TO_DELIVER', '2026-06-23 16:00:00'::timestamp, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000056', 'd0000000-0000-0000-0000-000000000056', 'ORDER_TAKEN', '2026-06-12 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000056', 'd0000000-0000-0000-0000-000000000056', 'READY_TO_DELIVER', '2026-06-22 16:00:00'::timestamp, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000057', 'd0000000-0000-0000-0000-000000000057', 'ORDER_TAKEN', '2026-06-19 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000057', 'd0000000-0000-0000-0000-000000000057', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000058', 'd0000000-0000-0000-0000-000000000058', 'ORDER_TAKEN', '2026-06-26 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000058', 'd0000000-0000-0000-0000-000000000058', 'STITCHING', NULL, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000059', 'd0000000-0000-0000-0000-000000000059', 'ORDER_TAKEN', '2026-07-03 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000059', 'd0000000-0000-0000-0000-000000000059', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000060', 'd0000000-0000-0000-0000-000000000060', 'ORDER_TAKEN', '2026-07-10 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000060', 'd0000000-0000-0000-0000-000000000060', 'READY_TO_DELIVER', '2026-07-28 16:00:00'::timestamp, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000061', 'd0000000-0000-0000-0000-000000000061', 'ORDER_TAKEN', '2026-07-17 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000061', 'd0000000-0000-0000-0000-000000000061', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000062', 'd0000000-0000-0000-0000-000000000062', 'ORDER_TAKEN', '2026-07-24 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000062', 'd0000000-0000-0000-0000-000000000062', 'STITCHING', NULL, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000063', 'd0000000-0000-0000-0000-000000000063', 'ORDER_TAKEN', '2026-07-31 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000063', 'd0000000-0000-0000-0000-000000000063', 'ORDER_TAKEN', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000064', 'd0000000-0000-0000-0000-000000000064', 'ORDER_TAKEN', '2026-08-07 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000064', 'd0000000-0000-0000-0000-000000000064', 'READY_TO_DELIVER', '2026-08-17 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000065', 'd0000000-0000-0000-0000-000000000065', 'ORDER_TAKEN', '2026-08-14 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000065', 'd0000000-0000-0000-0000-000000000065', 'READY_TO_DELIVER', '2026-08-28 16:00:00'::timestamp, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000066', 'd0000000-0000-0000-0000-000000000066', 'ORDER_TAKEN', '2026-08-21 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000066', 'd0000000-0000-0000-0000-000000000066', 'STITCHING', NULL, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000067', 'd0000000-0000-0000-0000-000000000067', 'ORDER_TAKEN', '2026-08-28 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000067', 'd0000000-0000-0000-0000-000000000067', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000068', 'd0000000-0000-0000-0000-000000000068', 'ORDER_TAKEN', '2026-09-04 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000068', 'd0000000-0000-0000-0000-000000000068', 'READY_TO_DELIVER', '2026-09-22 16:00:00'::timestamp, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000069', 'd0000000-0000-0000-0000-000000000069', 'ORDER_TAKEN', '2026-01-14 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000069', 'd0000000-0000-0000-0000-000000000069', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000070', 'd0000000-0000-0000-0000-000000000070', 'ORDER_TAKEN', '2026-01-21 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000070', 'd0000000-0000-0000-0000-000000000070', 'READY_TO_DELIVER', '2026-02-20 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000071', 'd0000000-0000-0000-0000-000000000071', 'ORDER_TAKEN', '2026-01-28 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000071', 'd0000000-0000-0000-0000-000000000071', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000072', 'd0000000-0000-0000-0000-000000000072', 'ORDER_TAKEN', '2026-02-04 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000072', 'd0000000-0000-0000-0000-000000000072', 'READY_TO_DELIVER', '2026-02-16 16:00:00'::timestamp, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000073', 'd0000000-0000-0000-0000-000000000073', 'ORDER_TAKEN', '2026-02-11 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000073', 'd0000000-0000-0000-0000-000000000073', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000074', 'd0000000-0000-0000-0000-000000000074', 'ORDER_TAKEN', '2026-02-18 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000074', 'd0000000-0000-0000-0000-000000000074', 'STITCHING', NULL, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000075', 'd0000000-0000-0000-0000-000000000075', 'ORDER_TAKEN', '2026-02-25 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000075', 'd0000000-0000-0000-0000-000000000075', 'READY_TO_DELIVER', '2026-03-27 16:00:00'::timestamp, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000076', 'd0000000-0000-0000-0000-000000000076', 'ORDER_TAKEN', '2026-03-04 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000076', 'd0000000-0000-0000-0000-000000000076', 'READY_TO_DELIVER', '2026-03-22 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000077', 'd0000000-0000-0000-0000-000000000077', 'ORDER_TAKEN', '2026-03-11 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000077', 'd0000000-0000-0000-0000-000000000077', 'ORDER_TAKEN', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000078', 'd0000000-0000-0000-0000-000000000078', 'ORDER_TAKEN', '2026-03-18 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000078', 'd0000000-0000-0000-0000-000000000078', 'STITCHING', NULL, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000079', 'd0000000-0000-0000-0000-000000000079', 'ORDER_TAKEN', '2026-03-25 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000079', 'd0000000-0000-0000-0000-000000000079', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000080', 'd0000000-0000-0000-0000-000000000080', 'ORDER_TAKEN', '2026-04-01 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000080', 'd0000000-0000-0000-0000-000000000080', 'READY_TO_DELIVER', '2026-04-13 16:00:00'::timestamp, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000081', 'd0000000-0000-0000-0000-000000000081', 'ORDER_TAKEN', '2026-04-08 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000081', 'd0000000-0000-0000-0000-000000000081', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000082', 'd0000000-0000-0000-0000-000000000082', 'ORDER_TAKEN', '2026-04-15 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000082', 'd0000000-0000-0000-0000-000000000082', 'STITCHING', NULL, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000083', 'd0000000-0000-0000-0000-000000000083', 'ORDER_TAKEN', '2026-04-22 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000083', 'd0000000-0000-0000-0000-000000000083', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000084', 'd0000000-0000-0000-0000-000000000084', 'ORDER_TAKEN', '2026-04-29 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000084', 'd0000000-0000-0000-0000-000000000084', 'READY_TO_DELIVER', '2026-05-19 16:00:00'::timestamp, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000085', 'd0000000-0000-0000-0000-000000000085', 'ORDER_TAKEN', '2026-05-06 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000085', 'd0000000-0000-0000-0000-000000000085', 'READY_TO_DELIVER', '2026-05-18 16:00:00'::timestamp, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000086', 'd0000000-0000-0000-0000-000000000086', 'ORDER_TAKEN', '2026-05-13 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000086', 'd0000000-0000-0000-0000-000000000086', 'STITCHING', NULL, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000087', 'd0000000-0000-0000-0000-000000000087', 'ORDER_TAKEN', '2026-05-20 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000087', 'd0000000-0000-0000-0000-000000000087', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000088', 'd0000000-0000-0000-0000-000000000088', 'ORDER_TAKEN', '2026-05-27 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000088', 'd0000000-0000-0000-0000-000000000088', 'READY_TO_DELIVER', '2026-06-14 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000089', 'd0000000-0000-0000-0000-000000000089', 'ORDER_TAKEN', '2026-06-03 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000089', 'd0000000-0000-0000-0000-000000000089', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000090', 'd0000000-0000-0000-0000-000000000090', 'ORDER_TAKEN', '2026-06-10 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000090', 'd0000000-0000-0000-0000-000000000090', 'READY_TO_DELIVER', '2026-06-28 16:00:00'::timestamp, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000091', 'd0000000-0000-0000-0000-000000000091', 'ORDER_TAKEN', '2026-06-17 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000091', 'd0000000-0000-0000-0000-000000000091', 'ORDER_TAKEN', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000092', 'd0000000-0000-0000-0000-000000000092', 'ORDER_TAKEN', '2026-06-24 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000092', 'd0000000-0000-0000-0000-000000000092', 'READY_TO_DELIVER', '2026-07-08 16:00:00'::timestamp, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000093', 'd0000000-0000-0000-0000-000000000093', 'ORDER_TAKEN', '2026-07-01 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000093', 'd0000000-0000-0000-0000-000000000093', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000094', 'd0000000-0000-0000-0000-000000000094', 'ORDER_TAKEN', '2026-07-08 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000094', 'd0000000-0000-0000-0000-000000000094', 'STITCHING', NULL, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000095', 'd0000000-0000-0000-0000-000000000095', 'ORDER_TAKEN', '2026-07-15 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000095', 'd0000000-0000-0000-0000-000000000095', 'READY_TO_DELIVER', '2026-07-24 16:00:00'::timestamp, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000096', 'd0000000-0000-0000-0000-000000000096', 'ORDER_TAKEN', '2026-07-22 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000096', 'd0000000-0000-0000-0000-000000000096', 'READY_TO_DELIVER', '2026-08-21 16:00:00'::timestamp, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000097', 'd0000000-0000-0000-0000-000000000097', 'ORDER_TAKEN', '2026-07-29 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000097', 'd0000000-0000-0000-0000-000000000097', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000098', 'd0000000-0000-0000-0000-000000000098', 'ORDER_TAKEN', '2026-08-05 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000098', 'd0000000-0000-0000-0000-000000000098', 'ORDER_TAKEN', NULL, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000099', 'd0000000-0000-0000-0000-000000000099', 'ORDER_TAKEN', '2026-08-12 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000099', 'd0000000-0000-0000-0000-000000000099', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000100', 'd0000000-0000-0000-0000-000000000100', 'ORDER_TAKEN', '2026-08-19 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000100', 'd0000000-0000-0000-0000-000000000100', 'READY_TO_DELIVER', '2026-08-31 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000101', 'd0000000-0000-0000-0000-000000000101', 'ORDER_TAKEN', '2026-08-26 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000101', 'd0000000-0000-0000-0000-000000000101', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000102', 'd0000000-0000-0000-0000-000000000102', 'ORDER_TAKEN', '2026-09-02 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000102', 'd0000000-0000-0000-0000-000000000102', 'STITCHING', NULL, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000103', 'd0000000-0000-0000-0000-000000000103', 'ORDER_TAKEN', '2026-01-12 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000103', 'd0000000-0000-0000-0000-000000000103', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000104', 'd0000000-0000-0000-0000-000000000104', 'ORDER_TAKEN', '2026-01-19 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000104', 'd0000000-0000-0000-0000-000000000104', 'READY_TO_DELIVER', '2026-01-29 16:00:00'::timestamp, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000105', 'd0000000-0000-0000-0000-000000000105', 'ORDER_TAKEN', '2026-01-26 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000105', 'd0000000-0000-0000-0000-000000000105', 'READY_TO_DELIVER', '2026-02-09 16:00:00'::timestamp, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000106', 'd0000000-0000-0000-0000-000000000106', 'ORDER_TAKEN', '2026-02-02 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000106', 'd0000000-0000-0000-0000-000000000106', 'STITCHING', NULL, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000107', 'd0000000-0000-0000-0000-000000000107', 'ORDER_TAKEN', '2026-02-09 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000107', 'd0000000-0000-0000-0000-000000000107', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000108', 'd0000000-0000-0000-0000-000000000108', 'ORDER_TAKEN', '2026-02-16 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000108', 'd0000000-0000-0000-0000-000000000108', 'READY_TO_DELIVER', '2026-02-25 16:00:00'::timestamp, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000109', 'd0000000-0000-0000-0000-000000000109', 'ORDER_TAKEN', '2026-02-23 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000109', 'd0000000-0000-0000-0000-000000000109', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000110', 'd0000000-0000-0000-0000-000000000110', 'ORDER_TAKEN', '2026-03-02 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000110', 'd0000000-0000-0000-0000-000000000110', 'READY_TO_DELIVER', '2026-03-22 16:00:00'::timestamp, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000111', 'd0000000-0000-0000-0000-000000000111', 'ORDER_TAKEN', '2026-03-09 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000111', 'd0000000-0000-0000-0000-000000000111', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000112', 'd0000000-0000-0000-0000-000000000112', 'ORDER_TAKEN', '2026-03-16 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000112', 'd0000000-0000-0000-0000-000000000112', 'READY_TO_DELIVER', '2026-03-26 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000113', 'd0000000-0000-0000-0000-000000000113', 'ORDER_TAKEN', '2026-03-23 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000113', 'd0000000-0000-0000-0000-000000000113', 'STITCHING', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000114', 'd0000000-0000-0000-0000-000000000114', 'ORDER_TAKEN', '2026-03-30 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000114', 'd0000000-0000-0000-0000-000000000114', 'STITCHING', NULL, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000115', 'd0000000-0000-0000-0000-000000000115', 'ORDER_TAKEN', '2026-04-06 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000115', 'd0000000-0000-0000-0000-000000000115', 'READY_TO_DELIVER', '2026-05-06 16:00:00'::timestamp, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000116', 'd0000000-0000-0000-0000-000000000116', 'ORDER_TAKEN', '2026-04-13 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000116', 'd0000000-0000-0000-0000-000000000116', 'READY_TO_DELIVER', '2026-04-25 16:00:00'::timestamp, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000117', 'd0000000-0000-0000-0000-000000000117', 'ORDER_TAKEN', '2026-04-20 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000117', 'd0000000-0000-0000-0000-000000000117', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000118', 'd0000000-0000-0000-0000-000000000118', 'ORDER_TAKEN', '2026-04-27 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000118', 'd0000000-0000-0000-0000-000000000118', 'STITCHING', NULL, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000119', 'd0000000-0000-0000-0000-000000000119', 'ORDER_TAKEN', '2026-05-04 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000119', 'd0000000-0000-0000-0000-000000000119', 'ORDER_TAKEN', NULL, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000120', 'd0000000-0000-0000-0000-000000000120', 'ORDER_TAKEN', '2026-05-11 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000120', 'd0000000-0000-0000-0000-000000000120', 'READY_TO_DELIVER', '2026-05-20 16:00:00'::timestamp, 'Mohammad Irfan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000121', 'd0000000-0000-0000-0000-000000000121', 'ORDER_TAKEN', '2026-05-18 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000121', 'd0000000-0000-0000-0000-000000000121', 'STITCHING', NULL, 'Rakesh Verma', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000122', 'd0000000-0000-0000-0000-000000000122', 'ORDER_TAKEN', '2026-05-25 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000122', 'd0000000-0000-0000-0000-000000000122', 'STITCHING', NULL, 'Aslam Khan', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000123', 'd0000000-0000-0000-0000-000000000123', 'ORDER_TAKEN', '2026-06-01 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000123', 'd0000000-0000-0000-0000-000000000123', 'STITCHING', NULL, 'Dinesh Pal', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000124', 'd0000000-0000-0000-0000-000000000124', 'ORDER_TAKEN', '2026-06-08 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000124', 'd0000000-0000-0000-0000-000000000124', 'READY_TO_DELIVER', '2026-06-18 16:00:00'::timestamp, 'Naseem Ahmed', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f4000000-0000-0000-0000-000000000125', 'd0000000-0000-0000-0000-000000000125', 'ORDER_TAKEN', '2026-06-15 10:00:00'::timestamp, 'Boutique Desk', 'Order confirmed and advance received')
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes)
VALUES ('f5000000-0000-0000-0000-000000000125', 'd0000000-0000-0000-0000-000000000125', 'READY_TO_DELIVER', '2026-06-29 16:00:00'::timestamp, 'Suresh Gupta', 'Progress stage logged in atelier')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 11. TRIALS (60 fitting and trial sessions)
-- =============================================================================
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000001', 'TRL-2026-0001', 'd0000000-0000-0000-0000-000000000001', 'ORD-2026-0001', '9811001001', 'Sunita Yadav', 'Embroidered Blouse', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-01-26'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-01-28'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000002', 'TRL-2026-0002', 'd0000000-0000-0000-0000-000000000003', 'ORD-2026-0003', '9811001003', 'Ananya Pandey', 'Festive Salwar Suit', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-02-09'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-02-15'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000003', 'TRL-2026-0003', 'd0000000-0000-0000-0000-000000000004', 'ORD-2026-0004', '9811001004', 'Ritu Srivastava', 'Silk Kurti & Palazzos', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-02-16'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-02-20'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000004', 'TRL-2026-0004', 'd0000000-0000-0000-0000-000000000005', 'ORD-2026-0005', '9811001005', 'Deepika Rai', 'Velvet Saree Blouse', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-02-23'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-02-24'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000005', 'TRL-2026-0005', 'd0000000-0000-0000-0000-000000000008', 'ORD-2026-0008', '9811001008', 'Divya Dubey', 'Embroidered Blouse', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-03-16'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-03-18'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000006', 'TRL-2026-0006', 'd0000000-0000-0000-0000-000000000009', 'ORD-2026-0009', '9811001009', 'Pooja Agarwal', 'Chikankari Anarkali', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-03-23'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-04-04'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000007', 'TRL-2026-0007', 'd0000000-0000-0000-0000-000000000010', 'ORD-2026-0010', '9811001010', 'Meena Gupta', 'Festive Salwar Suit', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-03-30'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-04-05'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000008', 'TRL-2026-0008', 'd0000000-0000-0000-0000-000000000011', 'ORD-2026-0011', '9811001011', 'Kavya Mishra', 'Silk Kurti & Palazzos', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-04-06'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-04-10'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000009', 'TRL-2026-0009', 'd0000000-0000-0000-0000-000000000012', 'ORD-2026-0012', '9811001012', 'Shivani Tiwari', 'Velvet Saree Blouse', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-04-13'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-04-14'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000010', 'TRL-2026-0010', 'd0000000-0000-0000-0000-000000000013', 'ORD-2026-0013', '9811001013', 'Rekha Shukla', 'Royal Brocade Jacket', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-04-20'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-04-30'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000011', 'TRL-2026-0011', 'd0000000-0000-0000-0000-000000000015', 'ORD-2026-0015', '9811001014', 'Anjali Singh', 'Embroidered Blouse', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-05-04'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-05-06'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000012', 'TRL-2026-0012', 'd0000000-0000-0000-0000-000000000016', 'ORD-2026-0016', '9811001014', 'Anjali Singh', 'Festive Salwar Suit', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-05-11'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-05-17'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000013', 'TRL-2026-0013', 'd0000000-0000-0000-0000-000000000017', 'ORD-2026-0017', '9811001015', 'Monika Verma', 'Festive Salwar Suit', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-05-18'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-05-24'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000014', 'TRL-2026-0014', 'd0000000-0000-0000-0000-000000000019', 'ORD-2026-0019', '9811001016', 'Vineeta Saxena', 'Velvet Saree Blouse', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-06-01'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-06-02'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000015', 'TRL-2026-0015', 'd0000000-0000-0000-0000-000000000020', 'ORD-2026-0020', '9811001016', 'Vineeta Saxena', 'Bridal Lehenga', 'Awadh Nazakat and Chikankari Heritage 2026', '2026-06-08'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-06-30'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000016', 'TRL-2026-0016', 'd0000000-0000-0000-0000-000000000023', 'ORD-2026-0023', '9811001018', 'Tanvi Bansal', 'Chikankari Anarkali', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-06-29'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-07-11'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000017', 'TRL-2026-0017', 'd0000000-0000-0000-0000-000000000024', 'ORD-2026-0024', '9811001018', 'Tanvi Bansal', 'Silk Kurti & Palazzos', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-07-06'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-07-10'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000018', 'TRL-2026-0018', 'd0000000-0000-0000-0000-000000000025', 'ORD-2026-0025', '9811001019', 'Shilpa Singhal', 'Silk Kurti & Palazzos', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-07-13'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-07-17'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000019', 'TRL-2026-0019', 'd0000000-0000-0000-0000-000000000027', 'ORD-2026-0027', '9811001020', 'Megha Goyal', 'Royal Brocade Jacket', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-07-27'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-08-06'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000020', 'TRL-2026-0020', 'd0000000-0000-0000-0000-000000000028', 'ORD-2026-0028', '9811001020', 'Megha Goyal', 'Embroidered Blouse', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-08-03'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-08-05'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000021', 'TRL-2026-0021', 'd0000000-0000-0000-0000-000000000029', 'ORD-2026-0029', '9811001021', 'Radhika Mittal', 'Embroidered Blouse', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-08-10'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-08-12'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000022', 'TRL-2026-0022', 'd0000000-0000-0000-0000-000000000030', 'ORD-2026-0030', '9811001021', 'Radhika Mittal', 'Festive Salwar Suit', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-08-17'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-08-23'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000023', 'TRL-2026-0023', 'd0000000-0000-0000-0000-000000000031', 'ORD-2026-0031', '9811001022', 'Garima Jain', 'Festive Salwar Suit', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-08-24'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-08-30'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000024', 'TRL-2026-0024', 'd0000000-0000-0000-0000-000000000032', 'ORD-2026-0032', '9811001022', 'Garima Jain', 'Velvet Saree Blouse', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-08-31'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-09-01'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000025', 'TRL-2026-0025', 'd0000000-0000-0000-0000-000000000033', 'ORD-2026-0033', '9811001023', 'Pallavi Agrawal', 'Velvet Saree Blouse', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-09-07'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-09-08'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000026', 'TRL-2026-0026', 'd0000000-0000-0000-0000-000000000035', 'ORD-2026-0035', '9811001024', 'Shalini Bhargava', 'Bridal Lehenga', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-01-24'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-02-15'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000027', 'TRL-2026-0027', 'd0000000-0000-0000-0000-000000000036', 'ORD-2026-0036', '9811001024', 'Shalini Bhargava', 'Chikankari Anarkali', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-01-31'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-02-12'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000028', 'TRL-2026-0028', 'd0000000-0000-0000-0000-000000000037', 'ORD-2026-0037', '9811001025', 'Kritika Maheshwari', 'Chikankari Anarkali', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-02-07'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-02-19'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000029', 'TRL-2026-0029', 'd0000000-0000-0000-0000-000000000039', 'ORD-2026-0039', '9811001026', 'Sonam Mathur', 'Silk Kurti & Palazzos', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-02-21'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-02-25'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000030', 'TRL-2026-0030', 'd0000000-0000-0000-0000-000000000040', 'ORD-2026-0040', '9811001026', 'Sonam Mathur', 'Royal Brocade Jacket', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-02-28'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-03-10'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000031', 'TRL-2026-0031', 'd0000000-0000-0000-0000-000000000041', 'ORD-2026-0041', '9811001027', 'Jyoti Chauhan', 'Royal Brocade Jacket', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-03-07'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-03-17'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000032', 'TRL-2026-0032', 'd0000000-0000-0000-0000-000000000043', 'ORD-2026-0043', '9811001028', 'Rachna Tomar', 'Embroidered Blouse', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-03-21'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-03-23'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000033', 'TRL-2026-0033', 'd0000000-0000-0000-0000-000000000044', 'ORD-2026-0044', '9811001028', 'Rachna Tomar', 'Festive Salwar Suit', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-03-28'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-04-03'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000034', 'TRL-2026-0034', 'd0000000-0000-0000-0000-000000000045', 'ORD-2026-0045', '9811001028', 'Rachna Tomar', 'Velvet Saree Blouse', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-04-04'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-04-05'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000035', 'TRL-2026-0035', 'd0000000-0000-0000-0000-000000000047', 'ORD-2026-0047', '9811001029', 'Preeti Sharma', 'Royal Brocade Jacket', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-04-18'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-04-28'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000036', 'TRL-2026-0036', 'd0000000-0000-0000-0000-000000000048', 'ORD-2026-0048', '9811001029', 'Preeti Sharma', 'Embroidered Blouse', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-04-25'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-04-27'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000037', 'TRL-2026-0037', 'd0000000-0000-0000-0000-000000000050', 'ORD-2026-0050', '9811001030', 'Shruti Khandelwal', 'Chikankari Anarkali', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-05-09'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-05-21'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000038', 'TRL-2026-0038', 'd0000000-0000-0000-0000-000000000051', 'ORD-2026-0051', '9811001030', 'Shruti Khandelwal', 'Silk Kurti & Palazzos', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-05-16'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-05-20'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000039', 'TRL-2026-0039', 'd0000000-0000-0000-0000-000000000052', 'ORD-2026-0052', '9811001031', 'Suman Garg', 'Festive Salwar Suit', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-05-23'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-05-29'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000040', 'TRL-2026-0040', 'd0000000-0000-0000-0000-000000000053', 'ORD-2026-0053', '9811001031', 'Suman Garg', 'Velvet Saree Blouse', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-05-30'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-05-31'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000041', 'TRL-2026-0041', 'd0000000-0000-0000-0000-000000000055', 'ORD-2026-0055', '9811001032', 'Payal Varshney', 'Royal Brocade Jacket', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-06-13'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-06-23'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000042', 'TRL-2026-0042', 'd0000000-0000-0000-0000-000000000056', 'ORD-2026-0056', '9811001032', 'Payal Varshney', 'Embroidered Blouse', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-06-20'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-06-22'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000043', 'TRL-2026-0043', 'd0000000-0000-0000-0000-000000000057', 'ORD-2026-0057', '9811001032', 'Payal Varshney', 'Festive Salwar Suit', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-06-27'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-07-03'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000044', 'TRL-2026-0044', 'd0000000-0000-0000-0000-000000000059', 'ORD-2026-0059', '9811001033', 'Natasha Chawla', 'Silk Kurti & Palazzos', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-07-11'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-07-15'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000045', 'TRL-2026-0045', 'd0000000-0000-0000-0000-000000000060', 'ORD-2026-0060', '9811001033', 'Natasha Chawla', 'Royal Brocade Jacket', 'Noor-e-Taj Royal Velvet Bridal Edit', '2026-07-18'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-07-28'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000046', 'TRL-2026-0046', 'd0000000-0000-0000-0000-000000000061', 'ORD-2026-0061', '9811001034', 'Isha Khanna', 'Velvet Saree Blouse', 'Ganga-Jamuni Brocade and Silk Festive', '2026-07-25'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-07-26'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000047', 'TRL-2026-0047', 'd0000000-0000-0000-0000-000000000064', 'ORD-2026-0064', '9811001035', 'Simran Bhatia', 'Embroidered Blouse', 'Ganga-Jamuni Brocade and Silk Festive', '2026-08-15'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-08-17'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000048', 'TRL-2026-0048', 'd0000000-0000-0000-0000-000000000065', 'ORD-2026-0065', '9811001035', 'Simran Bhatia', 'Festive Salwar Suit', 'Ganga-Jamuni Brocade and Silk Festive', '2026-08-22'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-08-28'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000049', 'TRL-2026-0049', 'd0000000-0000-0000-0000-000000000067', 'ORD-2026-0067', '9811001036', 'Richa Seth', 'Silk Kurti & Palazzos', 'Ganga-Jamuni Brocade and Silk Festive', '2026-09-05'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-09-09'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000050', 'TRL-2026-0050', 'd0000000-0000-0000-0000-000000000068', 'ORD-2026-0068', '9811001036', 'Richa Seth', 'Royal Brocade Jacket', 'Ganga-Jamuni Brocade and Silk Festive', '2026-09-12'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-09-22'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000051', 'TRL-2026-0051', 'd0000000-0000-0000-0000-000000000069', 'ORD-2026-0069', '9811001036', 'Richa Seth', 'Embroidered Blouse', 'Ganga-Jamuni Brocade and Silk Festive', '2026-01-22'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-01-24'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000052', 'TRL-2026-0052', 'd0000000-0000-0000-0000-000000000070', 'ORD-2026-0070', '9811001037', 'Aaradhya Bajpai', 'Bridal Lehenga', 'Ganga-Jamuni Brocade and Silk Festive', '2026-01-29'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-02-20'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000053', 'TRL-2026-0053', 'd0000000-0000-0000-0000-000000000071', 'ORD-2026-0071', '9811001037', 'Aaradhya Bajpai', 'Chikankari Anarkali', 'Ganga-Jamuni Brocade and Silk Festive', '2026-02-05'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-02-17'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000054', 'TRL-2026-0054', 'd0000000-0000-0000-0000-000000000072', 'ORD-2026-0072', '9811001037', 'Aaradhya Bajpai', 'Silk Kurti & Palazzos', 'Ganga-Jamuni Brocade and Silk Festive', '2026-02-12'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-02-16'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000055', 'TRL-2026-0055', 'd0000000-0000-0000-0000-000000000073', 'ORD-2026-0073', '9811001038', 'Nupur Dwivedi', 'Festive Salwar Suit', 'Ganga-Jamuni Brocade and Silk Festive', '2026-02-19'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-02-25'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000056', 'TRL-2026-0056', 'd0000000-0000-0000-0000-000000000075', 'ORD-2026-0075', '9811001038', 'Nupur Dwivedi', 'Bridal Lehenga', 'Ganga-Jamuni Brocade and Silk Festive', '2026-03-05'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-03-27'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000057', 'TRL-2026-0057', 'd0000000-0000-0000-0000-000000000076', 'ORD-2026-0076', '9811001039', 'Barkha Awasthi', 'Royal Brocade Jacket', 'Ganga-Jamuni Brocade and Silk Festive', '2026-03-12'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-03-22'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000058', 'TRL-2026-0058', 'd0000000-0000-0000-0000-000000000079', 'ORD-2026-0079', '9811001040', 'Aparna Dixit', 'Chikankari Anarkali', 'Ganga-Jamuni Brocade and Silk Festive', '2026-04-02'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-04-14'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000059', 'TRL-2026-0059', 'd0000000-0000-0000-0000-000000000080', 'ORD-2026-0080', '9811001040', 'Aparna Dixit', 'Silk Kurti & Palazzos', 'Ganga-Jamuni Brocade and Silk Festive', '2026-04-09'::date, '02:30 PM', 'First Trial', 'COMPLETED', 'GOOD_FIT', 'Meera Singhania', '2026-04-13'::date, 'Customer expressed full satisfaction with chest contour and armhole ease.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;
INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, customer_feedback, customer_rating, fit_preference, created_at, updated_at)
VALUES ('f6000000-0000-0000-0000-000000000060', 'TRL-2026-0060', 'd0000000-0000-0000-0000-000000000081', 'ORD-2026-0081', '9811001040', 'Aparna Dixit', 'Royal Brocade Jacket', 'Ganga-Jamuni Brocade and Silk Festive', '2026-04-16'::date, '02:30 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Meera Singhania', '2026-04-26'::date, 'Scheduled for trial fitting at showroom.', 5, 'Comfort / Regular Fit', NOW(), NOW())
ON CONFLICT (trial_code) DO NOTHING;

-- =============================================================================
-- 12. ENQUIRIES (20 walk-in, WhatsApp, and social leads)
-- =============================================================================
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000001', 'ENQ-2026-0001', 'Priya Sharma', '9811001002', 'priya.sharma@gmail.com', 'Saree Blouse', 'Interested in bespoke tailoring for upcoming family wedding event.', 'FOLLOW_UP', 'Sunita Rajput', '2026-10-15'::date, 'WHATSAPP', 'Wedding / Sangeet', 17500, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000002', 'ENQ-2026-0002', 'Ananya Pandey', '9811001003', 'ananya.pandey@gmail.com', 'Chikankari Kurta', 'Interested in bespoke tailoring for upcoming family wedding event.', 'CONVERTED', 'Sunita Rajput', '2026-10-15'::date, 'INSTAGRAM', 'Wedding / Sangeet', 20000, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000003', 'ENQ-2026-0003', 'Ritu Srivastava', '9811001004', 'ritu.srivastava@gmail.com', 'Anarkali Suit', 'Interested in bespoke tailoring for upcoming family wedding event.', 'CLOSED', 'Sunita Rajput', '2026-10-15'::date, 'REFERRAL', 'Wedding / Sangeet', 22500, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000004', 'ENQ-2026-0004', 'Deepika Rai', '9811001005', 'deepika.rai@gmail.com', 'Reception Gown', 'Interested in bespoke tailoring for upcoming family wedding event.', 'PENDING', 'Sunita Rajput', '2026-10-15'::date, 'WALK_IN', 'Wedding / Sangeet', 25000, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000005', 'ENQ-2026-0005', 'Swati Joshi', '9811001006', 'swati.joshi@gmail.com', 'Bridal Lehenga', 'Interested in bespoke tailoring for upcoming family wedding event.', 'FOLLOW_UP', 'Sunita Rajput', '2026-10-15'::date, 'WHATSAPP', 'Wedding / Sangeet', 27500, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000006', 'ENQ-2026-0006', 'Neha Trivedi', '9811001007', 'neha.trivedi@gmail.com', 'Saree Blouse', 'Interested in bespoke tailoring for upcoming family wedding event.', 'CONVERTED', 'Sunita Rajput', '2026-10-15'::date, 'INSTAGRAM', 'Wedding / Sangeet', 30000, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000007', 'ENQ-2026-0007', 'Divya Dubey', '9811001008', 'divya.dubey@gmail.com', 'Chikankari Kurta', 'Interested in bespoke tailoring for upcoming family wedding event.', 'CLOSED', 'Sunita Rajput', '2026-10-15'::date, 'REFERRAL', 'Wedding / Sangeet', 32500, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000008', 'ENQ-2026-0008', 'Pooja Agarwal', '9811001009', 'pooja.agarwal@gmail.com', 'Anarkali Suit', 'Interested in bespoke tailoring for upcoming family wedding event.', 'PENDING', 'Sunita Rajput', '2026-10-15'::date, 'WALK_IN', 'Wedding / Sangeet', 35000, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000009', 'ENQ-2026-0009', 'Meena Gupta', '9811001010', 'meena.gupta@gmail.com', 'Reception Gown', 'Interested in bespoke tailoring for upcoming family wedding event.', 'FOLLOW_UP', 'Sunita Rajput', '2026-10-15'::date, 'WHATSAPP', 'Wedding / Sangeet', 37500, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000010', 'ENQ-2026-0010', 'Kavya Mishra', '9811001011', 'kavya.mishra@gmail.com', 'Bridal Lehenga', 'Interested in bespoke tailoring for upcoming family wedding event.', 'CONVERTED', 'Sunita Rajput', '2026-10-15'::date, 'INSTAGRAM', 'Wedding / Sangeet', 40000, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000011', 'ENQ-2026-0011', 'Shivani Tiwari', '9811001012', 'shivani.tiwari@gmail.com', 'Saree Blouse', 'Interested in bespoke tailoring for upcoming family wedding event.', 'CLOSED', 'Sunita Rajput', '2026-10-15'::date, 'REFERRAL', 'Wedding / Sangeet', 42500, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000012', 'ENQ-2026-0012', 'Rekha Shukla', '9811001013', 'rekha.shukla@gmail.com', 'Chikankari Kurta', 'Interested in bespoke tailoring for upcoming family wedding event.', 'PENDING', 'Sunita Rajput', '2026-10-15'::date, 'WALK_IN', 'Wedding / Sangeet', 45000, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000013', 'ENQ-2026-0013', 'Anjali Singh', '9811001014', 'anjali.singh@gmail.com', 'Anarkali Suit', 'Interested in bespoke tailoring for upcoming family wedding event.', 'FOLLOW_UP', 'Sunita Rajput', '2026-10-15'::date, 'WHATSAPP', 'Wedding / Sangeet', 47500, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000014', 'ENQ-2026-0014', 'Monika Verma', '9811001015', 'monika.verma@gmail.com', 'Reception Gown', 'Interested in bespoke tailoring for upcoming family wedding event.', 'CONVERTED', 'Sunita Rajput', '2026-10-15'::date, 'INSTAGRAM', 'Wedding / Sangeet', 50000, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000015', 'ENQ-2026-0015', 'Vineeta Saxena', '9811001016', 'vineeta.saxena@gmail.com', 'Bridal Lehenga', 'Interested in bespoke tailoring for upcoming family wedding event.', 'CLOSED', 'Sunita Rajput', '2026-10-15'::date, 'REFERRAL', 'Wedding / Sangeet', 52500, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000016', 'ENQ-2026-0016', 'Shweta Rastogi', '9811001017', 'shweta.rastogi@gmail.com', 'Saree Blouse', 'Interested in bespoke tailoring for upcoming family wedding event.', 'PENDING', 'Sunita Rajput', '2026-10-15'::date, 'WALK_IN', 'Wedding / Sangeet', 55000, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000017', 'ENQ-2026-0017', 'Tanvi Bansal', '9811001018', 'tanvi.bansal@gmail.com', 'Chikankari Kurta', 'Interested in bespoke tailoring for upcoming family wedding event.', 'FOLLOW_UP', 'Sunita Rajput', '2026-10-15'::date, 'WHATSAPP', 'Wedding / Sangeet', 57500, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000018', 'ENQ-2026-0018', 'Shilpa Singhal', '9811001019', 'shilpa.singhal@gmail.com', 'Anarkali Suit', 'Interested in bespoke tailoring for upcoming family wedding event.', 'CONVERTED', 'Sunita Rajput', '2026-10-15'::date, 'INSTAGRAM', 'Wedding / Sangeet', 60000, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000019', 'ENQ-2026-0019', 'Megha Goyal', '9811001020', 'megha.goyal@gmail.com', 'Reception Gown', 'Interested in bespoke tailoring for upcoming family wedding event.', 'CLOSED', 'Sunita Rajput', '2026-10-15'::date, 'REFERRAL', 'Wedding / Sangeet', 62500, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;
INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, source, occasion, estimated_budget, created_at, updated_at)
VALUES ('f7000000-0000-0000-0000-000000000020', 'ENQ-2026-0020', 'Radhika Mittal', '9811001021', 'radhika.mittal@gmail.com', 'Bridal Lehenga', 'Interested in bespoke tailoring for upcoming family wedding event.', 'PENDING', 'Sunita Rajput', '2026-10-15'::date, 'WALK_IN', 'Wedding / Sangeet', 65000, NOW(), NOW())
ON CONFLICT (enquiry_code) DO NOTHING;

-- =============================================================================
-- 13. VERIFICATION AND ROW COUNT AUDIT
-- =============================================================================
SELECT 'company_settings'          AS entity, COUNT(*) AS count FROM company_settings
UNION ALL SELECT 'branches',                   COUNT(*) FROM branches
UNION ALL SELECT 'employees',                  COUNT(*) FROM employees
UNION ALL SELECT 'customers',                  COUNT(*) FROM customers
UNION ALL SELECT 'customer_body_measurements', COUNT(*) FROM customer_body_measurements
UNION ALL SELECT 'collections',                COUNT(*) FROM collections
UNION ALL SELECT 'orders',                     COUNT(*) FROM orders
UNION ALL SELECT 'garments',                   COUNT(*) FROM garments
UNION ALL SELECT 'payments',                   COUNT(*) FROM payments
UNION ALL SELECT 'payment_transactions',       COUNT(*) FROM payment_transactions
UNION ALL SELECT 'order_progress_stages',      COUNT(*) FROM order_progress_stages
UNION ALL SELECT 'trials',                     COUNT(*) FROM trials
UNION ALL SELECT 'enquiries',                  COUNT(*) FROM enquiries
ORDER BY entity;

COMMIT;

-- =============================================================================
-- END OF DEMO SEED SCRIPT
-- =============================================================================
