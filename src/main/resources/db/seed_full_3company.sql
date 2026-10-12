-- ==============================================================================
-- MASTER SEED SCRIPT: PART 1 - SCHEMA TWEAKS, TRUNCATE & COMPANY 1 (RIWAYAT)
-- ==============================================================================

BEGIN;

-- 1. Ensure stage_definitions uniqueness is per company, not global
ALTER TABLE stage_definitions DROP CONSTRAINT IF EXISTS stage_definitions_stage_key_key;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'stage_definitions_company_stage_key_unique'
    ) THEN
        ALTER TABLE stage_definitions ADD CONSTRAINT stage_definitions_company_stage_key_unique UNIQUE (company_id, stage_key);
    END IF;
END $$;

-- 2. Clean truncation of all tenant tables (cascading cleanly)
TRUNCATE TABLE
    payment_transactions,
    payments,
    trial_alterations,
    trials,
    qc_checklists,
    production_stages,
    order_progress_stages,
    garments,
    enquiries,
    appointments,
    customer_notes,
    customer_body_measurements,
    measurement_points,
    measurement_profiles,
    customer_measurements,
    designs,
    orders,
    customers,
    purchase_order_items,
    purchase_orders,
    stock_movements,
    inventory_items,
    suppliers,
    collection_activities,
    collections,
    stage_definition_employees,
    stage_definitions,
    branches,
    user_profiles,
    app_users,
    employees,
    company_settings
CASCADE;

-- ==============================================================================
-- COMPANY 1: RIWAYAT HAUTE COUTURE (3 Branches, Shared Model)
-- ==============================================================================

INSERT INTO company_settings (
    id, company_name, short_name, tagline, owner_name, business_type,
    gstin, pan_number, primary_phone, whatsapp, email, website,
    street_address, city, state, pin_code, country, logo_base64,
    share_customers_across_branches, share_orders_across_branches,
    share_enquiries_across_branches, share_measurements_across_branches,
    share_inventory_across_branches, share_garments_across_branches,
    share_trials_across_branches
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Riwayat Haute Couture',
    'RIWAYAT',
    'Regal Royalties & Heritage Bridal Couture',
    'Begum Noor Jahan & Farhan Akhtar',
    'Bespoke Bridal Atelier',
    '27AAAAA0000A1Z5',
    'AAAAA0000A',
    '+91 22 2288 4400',
    '+91 98201 11000',
    'concierge@riwayatcouture.com',
    'https://riwayatcouture.com',
    'Heritage Arcade, 14 Rampart Row, Fort',
    'Mumbai',
    'Maharashtra',
    '400001',
    'India',
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80',
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
);

-- Branches (3)
INSERT INTO branches (
    id, branch_code, name, type, street_address, city, state, pin_code,
    country, phone, whatsapp, email, is_headquarters, active, working_hours, company_id
) VALUES
('b1000000-0000-0000-0000-000000000001', 'RIW-HQ',  'Fort Heritage Flagship',  'FLAGSHIP', '14 Rampart Row, Fort', 'Mumbai', 'Maharashtra', '400001', 'India', '+91 22 2288 4400', '+91 98201 11000', 'fort@riwayatcouture.com', TRUE,  TRUE, 'Mon-Sat 10:30-20:00', 'c0000000-0000-0000-0000-000000000001'),
('b1000000-0000-0000-0000-000000000002', 'RIW-PON', 'Puducherry White Town',    'BOUTIQUE', '28 Rue Suffren, White Town', 'Puducherry', 'Puducherry', '605001', 'India', '+91 413 222 7800', '+91 98201 11002', 'whitetown@riwayatcouture.com', FALSE, TRUE, 'Tue-Sun 10:00-19:30', 'c0000000-0000-0000-0000-000000000001'),
('b1000000-0000-0000-0000-000000000003', 'RIW-BLR', 'Indiranagar Bridal Manor', 'STUDIO',   '742 12th Main Road, HAL 2nd Stage, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 'India', '+91 80 4122 9900', '+91 98201 11003', 'bengaluru@riwayatcouture.com', FALSE, TRUE, 'Mon-Sat 11:00-20:30', 'c0000000-0000-0000-0000-000000000001');

-- Employees (4)
INSERT INTO employees (
    id, employee_code, name, phone, email, role, status, joined_date,
    avatar_url, specialization, company_id
) VALUES
('e1000000-0000-0000-0000-000000000001', 'EMP-RIW-001', 'Master Rajesh Sharma', '+91 98111 22001', 'rajesh.sharma@riwayatcouture.com', 'TAILOR',   'ACTIVE', '2021-03-15', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', 'Heavy Zari Lehengas & Raw Silk Cutwork', 'c0000000-0000-0000-0000-000000000001'),
('e1000000-0000-0000-0000-000000000002', 'EMP-RIW-002', 'Priya Kapoor',         '+91 98111 22002', 'priya.kapoor@riwayatcouture.com',  'DESIGNER', 'ACTIVE', '2022-01-10', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80', 'Heritage Bridal Silhouette & Motif Drafting', 'c0000000-0000-0000-0000-000000000001'),
('e1000000-0000-0000-0000-000000000003', 'EMP-RIW-003', 'Ustad Sameer Verma',   '+91 98111 22003', 'sameer.verma@riwayatcouture.com',  'ARTISAN',  'ACTIVE', '2020-08-01', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80', 'Zardozi, Marodi & Dabka Hand Embroidery', 'c0000000-0000-0000-0000-000000000001'),
('e1000000-0000-0000-0000-000000000004', 'EMP-RIW-004', 'Sunita Menon',         '+91 98111 22004', 'sunita.menon@riwayatcouture.com',  'QC',       'ACTIVE', '2022-06-20', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80', 'Luxury Finishing, Lining & Seam Tension Audits', 'c0000000-0000-0000-0000-000000000001');

UPDATE branches SET manager_id = 'e1000000-0000-0000-0000-000000000001' WHERE id = 'b1000000-0000-0000-0000-000000000001';
UPDATE branches SET manager_id = 'e1000000-0000-0000-0000-000000000002' WHERE id = 'b1000000-0000-0000-0000-000000000002';
UPDATE branches SET manager_id = 'e1000000-0000-0000-0000-000000000004' WHERE id = 'b1000000-0000-0000-0000-000000000003';

-- Users (1) - Company Owner (Default System User)
INSERT INTO app_users (
    id, username, password_hash, full_name, role, active, email, phone,
    avatar_url, designation, department, assigned_branch, company_id
) VALUES
('11000000-0000-0000-0000-000000000001', 'riwayat_admin',    '$2a$10$xSIrpfakrLDjoPKviQyKR.ASqQ/TQFfjqBsR4ViPf3hdBWx/.jC3a', 'Begum Noor Jahan', 'OWNER',    TRUE, 'noor@riwayatcouture.com',    '+91 98201 11000', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', 'Founder & Creative Director', 'Executive',  'RIW-HQ',  'c0000000-0000-0000-0000-000000000001');

-- User Profiles (1)
INSERT INTO user_profiles (
    id, user_id, full_name, display_title, department, email, phone,
    assigned_branch, clearance_level, system_role_label, privileges_summary,
    avatar_url, company_id
) VALUES
('21000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'Begum Noor Jahan', 'Founder & Creative Director', 'Executive',  'noor@riwayatcouture.com',    '+91 98201 11000', 'RIW-HQ',  'Executive (Tier 1)', 'Company Owner', 'Full Administrative & Tenant Settings Access', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', 'c0000000-0000-0000-0000-000000000001');

-- Pipeline Stage Definitions (10)
INSERT INTO stage_definitions (
    id, stage_key, display_name, description, required_role, dept_label,
    color_class, sort_order, active, image_url, company_id
) VALUES
('31000000-0000-0000-0000-000000000001', 'ORDER_TAKEN',      'Order Placed & Consult', 'Client intake, initial brief and styling token issuance', 'STAFF',    'Front Office', 'badge-primary',   10, TRUE, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000002', 'MEASURING',        'Anatomy & Measurements', 'High precision 32-point couture body profiling',        'DESIGNER', 'Bespoke Studio', 'badge-info', 20, TRUE, 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000003', 'FABRIC_SELECTION', 'Textile Sourcing & Khaka', 'Fabric lot approval, zari tracing and swatch reserving', 'STAFF', 'Materials Desk', 'badge-secondary', 30, TRUE, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000004', 'PATTERN_MAKING',   'Drape & Pattern Cad',    'Master pattern drawing with seam allowance adjustments',  'TAILOR',   'Cutting Table', 'badge-warning', 40, TRUE, 'https://images.unsplash.com/photo-1528458876885-5b6eacdd3671?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000005', 'CUTTING',          'Fabric Laying & Shearing','Grainline matching and precision shear cutting',         'TAILOR',   'Cutting Table', 'badge-warning', 50, TRUE, 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000006', 'EMBROIDERY',       'Karigari & Zardozi Frame', 'Handwork on wooden adda with dabka, moti and resham', 'ARTISAN',  'Embroidery Adda','badge-danger', 60, TRUE, 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000007', 'STITCHING',        'Assembly & Machine Sew', 'Panels joining, canvas fusing, zip & cancan mounting',  'TAILOR',   'Sewing Floor', 'badge-dark',     70, TRUE, 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000008', 'FIRST_TRIAL',      'Basting & Client Trial', 'Silhouette drape review, bust ease & hemline check',   'DESIGNER', 'Fitting Lounge', 'badge-purple', 80, TRUE, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000009', 'QC_FINISHING',     'Steam Press & QC Audit', '12-point quality check, thread singeing, steam form press','QC',    'QC Station',   'badge-success', 90, TRUE, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000010', 'READY_DISPATCH',   'Gown Bagging & Handover', 'Cedar-scented bridal garment bag packing & delivery',   'STAFF',    'Dispatch Concierge', 'badge-success', 100, TRUE, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000001');

-- Collections (3)
INSERT INTO collections (
    id, code, name, subtitle, description, season, year, status, designer,
    branch, launch_date, is_featured, cover_image_url, progress_percentage, company_id
) VALUES
('c1000000-0000-0000-0000-000000000001', 'RIW-SS26-ROYAL',    'Noor-e-Awadh Royal Bridal',       'Imperial Zardozi & Antique Tilla Lehengas', 'Heirloom red and gold bridal ensembles crafted with real metal threads and antique resham embroidery.', 'Spring/Summer', 2026, 'ACTIVE', 'Begum Noor Jahan', 'RIW-HQ', '2026-01-15', TRUE, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', 85, 'c0000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000002', 'RIW-FW26-VELVET',   'Shahi Dastarkhwan Velvet Lehengas', 'Opulent Micro-Velvet Regalia with Semi-Precious Motifs', 'Architectural arches and botanical motifs on midnight navy and emerald green velvet.', 'Autumn/Winter', 2026, 'ACTIVE', 'Priya Kapoor', 'RIW-BLR', '2026-08-01', TRUE, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 40, 'c0000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000003', 'RIW-CR26-SHERWANI', 'Nawab Heritage Sherwanis',         'Bespoke Raw Silk & Jamawar Groomswear', 'Classic bandhgala necklines, regal buttons, and pure silk stoles tailored for royalty.', 'Festive', 2026, 'ACTIVE', 'Begum Noor Jahan', 'RIW-HQ', '2026-02-10', FALSE, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', 60, 'c0000000-0000-0000-0000-000000000001');

-- Suppliers (2)
INSERT INTO suppliers (
    id, supplier_code, name, contact_person, phone, email, address, specialization, company_id
) VALUES
('f1000000-0000-0000-0000-000000000001', 'SUP-RIW-001', 'Banaras Silk Weavers Guild', 'Pandit Ramnarayan Mishra', '+91 542 245 8890', 'orders@banarassilkguild.in', 'Ghat Road, Chowk, Varanasi, UP 221001', 'Pure Katan Silk & Real Gold Zari Brocades', 'c0000000-0000-0000-0000-000000000001'),
('f1000000-0000-0000-0000-000000000002', 'SUP-RIW-002', 'Surat Metallic Trims & Zari', 'Mukeshbhai Shah',         '+91 261 278 1120', 'sales@suratzaritrims.com',  'Ring Road Textile Market, Surat, Gujarat 395002', 'Antique Tilla, Moti, Cutdana & Sequins', 'c0000000-0000-0000-0000-000000000001');

-- Inventory Items (5) - omitting generated column available_qty
INSERT INTO inventory_items (
    id, item_code, name, category, variant, unit, stock_qty, reserved_qty,
    reorder_level, purchase_price, selling_price, supplier_name, image_url,
    status, composition, weave, width, origin, branch, company_id
) VALUES
('41000000-0000-0000-0000-000000000001', 'ITM-RIW-001', 'Pure Banarasi Katan Silk (Vermilion Red)', 'Fabric', 'Vermilion Red', 'Meter', 85.00, 24.00, 15.00, 3200.00, 6800.00, 'Banaras Silk Weavers Guild', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', '100% Mulberry Silk', 'Brocade Kadwa Weave', '44 inches', 'Varanasi', 'RIW-HQ',  'c0000000-0000-0000-0000-000000000001'),
('41000000-0000-0000-0000-000000000002', 'ITM-RIW-002', 'Real Gold Metallic Zari Thread Spool',    'Trim',   'Antique Gold',    'Spool', 40.00, 12.00, 10.00, 1450.00, 2900.00, 'Surat Metallic Trims & Zari', 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', 'Silver Electroplated Gold Foil', 'Twisted Spool', 'N/A', 'Surat', 'RIW-HQ', 'c0000000-0000-0000-0000-000000000001'),
('41000000-0000-0000-0000-000000000003', 'ITM-RIW-003', 'Chanderi Tissue Organza (Champagne Gold)', 'Fabric', 'Champagne Gold', 'Meter', 60.00, 15.00, 10.00, 2100.00, 4500.00, 'Banaras Silk Weavers Guild', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', 'Silk-Zari Blend', 'Tissue Organza Sheer', '48 inches', 'Chanderi', 'RIW-BLR', 'c0000000-0000-0000-0000-000000000001'),
('41000000-0000-0000-0000-000000000004', 'ITM-RIW-004', 'Micro-Velvet 9000 Base (Deep Emerald)',     'Fabric', 'Deep Emerald',    'Meter', 45.00, 10.00,  8.00, 1800.00, 3900.00, 'Banaras Silk Weavers Guild', 'https://images.unsplash.com/photo-1528458876885-5b6eacdd3671?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', 'Viscose Silk Pile', 'Dense Velvet Pile', '44 inches', 'Surat', 'RIW-PON', 'c0000000-0000-0000-0000-000000000001'),
('41000000-0000-0000-0000-000000000005', 'ITM-RIW-005', 'Handmade Moti Pearls & Sequins Kit',       'Trim',   'Ivory / Clear',   'Box',   25.00,  6.00,  5.00,  850.00, 1800.00, 'Surat Metallic Trims & Zari', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', 'Cultured Glass Beads & Paillettes', 'Assorted Sizes', 'N/A', 'Surat', 'RIW-HQ', 'c0000000-0000-0000-0000-000000000001');

-- Purchase Orders & Items - omitting generated column total_price
INSERT INTO purchase_orders (
    id, po_code, supplier_id, status, total_amount, order_date, expected_date, notes, company_id
) VALUES
('51000000-0000-0000-0000-000000000001', 'PO-RIW-001', 'f1000000-0000-0000-0000-000000000001', 'RECEIVED', 160000.00, '2026-01-20', '2026-02-05', 'Bridal season bulk silk consignment', 'c0000000-0000-0000-0000-000000000001');

INSERT INTO purchase_order_items (
    id, po_id, item_id, item_name, quantity, unit, unit_price, received_qty, company_id
) VALUES
('51100000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000001', 'Pure Banarasi Katan Silk (Vermilion Red)', 50.00, 'Meter', 3200.00, 50.00, 'c0000000-0000-0000-0000-000000000001');

-- Customers (4)
INSERT INTO customers (
    mobile_number, name, first_name, last_name, salutation, gender, email,
    location, street_address, city, state, pincode, tier, total_spend, balance,
    favorite_garment, measurements_on_file, fit_preference, preferred_neck,
    preferred_sleeve, preferred_occasions, preferred_channel, avatar_url,
    branch, company_id
) VALUES
('+91 98201 11001', 'Aisha Siddiqui',   'Aisha',   'Siddiqui',   'Ms.',  'Female', 'aisha.siddiqui@gmail.com',  'Bandra West, Mumbai', 'Flat 402, Sea Crest Apts, Perry Cross Rd', 'Mumbai', 'Maharashtra', '400050', 'VIP',     145000.00, 70000.00, 'Bridal Lehenga Choli', TRUE, 'Snug & Structured Fitting', 'Deep Sweetheart Neck', 'Elbow Length Embroidered', 'Wedding Reception & Sangeet', 'WhatsApp', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80', 'RIW-HQ',  'c0000000-0000-0000-0000-000000000001'),
('+91 98201 11002', 'Meera Singhania',  'Meera',   'Singhania',  'Mrs.', 'Female', 'meera.singhania@yahoo.in',  'Indiranagar, Bengaluru', '312 Defence Colony, 100ft Road', 'Bengaluru', 'Karnataka', '560038', 'VIP',      85000.00, 35000.00, 'Anarkali Floor Gown',  TRUE, 'Graceful Flared Drape',     'Royal Boat Neck',      'Full Length Sheer Sleeve', 'Cocktail Gala & Trousseau',   'WhatsApp', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80', 'RIW-BLR', 'c0000000-0000-0000-0000-000000000001'),
('+91 98201 11003', 'Rohan Malhotra',   'Rohan',   'Malhotra',   'Mr.',  'Male',   'rohan.malhotra@corp.in',    'Colaba, Mumbai', '22 Oliver Road, Colaba Causeway', 'Mumbai', 'Maharashtra', '400005', 'REGULAR',  95000.00,     0.00, 'Bespoke Groom Sherwani',    TRUE, 'Tailored Slim Fit',         'Mandarin Collar',      'Standard Sherwani Cuffed', 'Wedding Day Ceremony',         'WhatsApp', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', 'RIW-HQ',  'c0000000-0000-0000-0000-000000000001'),
('+91 98201 11004', 'Tanya Narang',     'Tanya',   'Narang',     'Dr.',  'Female', 'tanya.narang@clinic.com',   'White Town, Puducherry', '14 Suffren Street, White Town', 'Puducherry', 'Puducherry', '605001', 'PREMIUM',  28000.00, 18000.00, 'Banarasi Saree Blouse', TRUE, 'Comfort Traditional Fit',   'Square Neck with Dori','Cap Sleeve with Zari Border', 'Temple Festivities & Pooja',  'WhatsApp', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', 'RIW-PON', 'c0000000-0000-0000-0000-000000000001');

-- Customer Body Measurements & Measurement Profiles
INSERT INTO customer_body_measurements (
    id, customer_mobile, customer_name, garment_type, measurement_type, is_current,
    version, unit, shoulder, bust, under_bust, waist, hip, blouse_length,
    armhole, sleeve_length, front_neck_depth, back_neck_depth, recorded_by, company_id
) VALUES
('61000000-0000-0000-0000-000000000001', '+91 98201 11001', 'Aisha Siddiqui',  'Lehenga', 'CURRENT', TRUE, 1, 'in', 14.50, 36.00, 30.00, 28.50, 38.00, 14.00, 16.50, 11.00, 8.00, 10.50, 'Master Rajesh Sharma', 'c0000000-0000-0000-0000-000000000001'),
('61000000-0000-0000-0000-000000000002', '+91 98201 11002', 'Meera Singhania', 'Anarkali','CURRENT', TRUE, 1, 'in', 15.00, 38.00, 32.00, 31.00, 41.00, 15.50, 17.50, 22.00, 7.50,  8.00, 'Priya Kapoor',         'c0000000-0000-0000-0000-000000000001'),
('61000000-0000-0000-0000-000000000003', '+91 98201 11003', 'Rohan Malhotra',  'Sherwani','CURRENT', TRUE, 1, 'in', 18.50, 42.00, 38.00, 35.00, 41.00, 42.00, 20.00, 25.50, 3.50,  2.00, 'Master Rajesh Sharma', 'c0000000-0000-0000-0000-000000000001'),
('61000000-0000-0000-0000-000000000004', '+91 98201 11004', 'Tanya Narang',    'Blouse',  'CURRENT', TRUE, 1, 'in', 14.00, 34.00, 29.00, 27.00, 36.50, 13.50, 15.50,  6.00, 7.00,  9.00, 'Master Rajesh Sharma', 'c0000000-0000-0000-0000-000000000001');

INSERT INTO customer_measurements (
    id, customer_mobile, garment_type, bust, waist, full_hip, shoulder,
    sleeve_length, armhole, front_neck, back_neck, garment_length,
    recorded_by, is_active_profile, company_id
) VALUES
('61100000-0000-0000-0000-000000000001', '+91 98201 11001', 'Lehenga',  36.00, 28.50, 38.00, 14.50, 11.00, 16.50, 8.00, 10.50, 42.00, 'Master Rajesh Sharma', TRUE, 'c0000000-0000-0000-0000-000000000001'),
('61100000-0000-0000-0000-000000000002', '+91 98201 11002', 'Anarkali', 38.00, 31.00, 41.00, 15.00, 22.00, 17.50, 7.50,  8.00, 56.00, 'Priya Kapoor',         TRUE, 'c0000000-0000-0000-0000-000000000001'),
('61100000-0000-0000-0000-000000000003', '+91 98201 11003', 'Sherwani', 42.00, 35.00, 41.00, 18.50, 25.50, 20.00, 3.50,  2.00, 44.00, 'Master Rajesh Sharma', TRUE, 'c0000000-0000-0000-0000-000000000001'),
('61100000-0000-0000-0000-000000000004', '+91 98201 11004', 'Blouse',   34.00, 27.00, 36.50, 14.00,  6.00, 15.50, 7.00,  9.00, 14.00, 'Master Rajesh Sharma', TRUE, 'c0000000-0000-0000-0000-000000000001');

INSERT INTO measurement_profiles (
    id, customer_mobile, garment_type, recorded_by, notes, branch, company_id
) VALUES
('61200000-0000-0000-0000-000000000001', '+91 98201 11001', 'Bridal Lehenga Choli', 'Master Rajesh Sharma', 'Padded blouse with sweetheart neckline; lehenga waist contoured with heavy cancan.', 'RIW-HQ',  'c0000000-0000-0000-0000-000000000001'),
('61200000-0000-0000-0000-000000000002', '+91 98201 11002', 'Tissue Floor Anarkali',  'Priya Kapoor',         'Floor sweeping flare with 28 kalis. Soft butter crepe inner lining.', 'RIW-BLR', 'c0000000-0000-0000-0000-000000000001');

-- Customer Notes
INSERT INTO customer_notes (
    id, customer_mobile, note_text, author_name, author_badge, category, company_id
) VALUES
('61300000-0000-0000-0000-000000000001', '+91 98201 11001', 'Client requested antique dull gold matte zari, strictly no shiny synthetic sequins.', 'Priya Kapoor', 'PK', 'STYLING', 'c0000000-0000-0000-0000-000000000001'),
('61300000-0000-0000-0000-000000000002', '+91 98201 11002', 'Allergies: strictly pure silk lining required; synthetic georgette causes redness.', 'Begum Noor Jahan', 'NJ', 'PREFERENCE', 'c0000000-0000-0000-0000-000000000001');

-- Enquiries (3)
INSERT INTO enquiries (
    id, enquiry_code, customer_name, phone, email, garment_type, notes,
    status, assigned_to, occasion, estimated_budget, source, avatar_url,
    branch, company_id
) VALUES
('71000000-0000-0000-0000-000000000001', 'ENQ-RIW-001', 'Aisha Siddiqui',   '+91 98201 11001', 'aisha.siddiqui@gmail.com',  'Bridal Lehenga', 'Wedding ceremony in Udaipur; looking for heirloom Banarasi red.', 'CONVERTED', 'Priya Kapoor',    'Wedding',           150000.00, 'WALK_IN',   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80', 'RIW-HQ',  'c0000000-0000-0000-0000-000000000001'),
('71000000-0000-0000-0000-000000000002', 'ENQ-RIW-002', 'Natasha Roy',      '+91 98201 11005', 'natasha.roy@media.co.in',    'Embroidered Saree', 'Silk organza drape with hand pearl border for sister sangeet.', 'CONTACTED', 'Priya Kapoor',    'Sangeet Party',      45000.00, 'INSTAGRAM', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80', 'RIW-HQ',  'c0000000-0000-0000-0000-000000000001'),
('71000000-0000-0000-0000-000000000003', 'ENQ-RIW-003', 'Dr. Farooq Qureshi','+91 98201 11006', 'dr.farooq@medical.org',     'Bespoke Sherwani', 'Heritage cut raw silk sherwani in ivory with gold metallic buttons.', 'PENDING',   'Begum Noor Jahan', 'Nikah Ceremony',     80000.00, 'REFERRAL',  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80', 'RIW-BLR', 'c0000000-0000-0000-0000-000000000001');

-- Orders (4)
INSERT INTO orders (
    id, order_code, garment_type, garment_desc, collection, amount, status,
    order_date, due_date, customer_mobile, customer_name, expected_delivery_date,
    advance_paid, total_amount, balance_amount, current_stage, notes, branch, company_id
) VALUES
('81000000-0000-0000-0000-000000000001', 'ORD-RIW-001', 'Bridal Lehenga', 'Noor Zari Vermilion Red Bridal Lehenga with intricate antique tilla adda handwork, 16 kali flare, handcrafted blouse and dual organza dupattas.', 'Noor-e-Awadh Royal Bridal', 145000.00, 'IN_PRODUCTION', '2026-02-01', '2026-03-25', '+91 98201 11001', 'Aisha Siddiqui',  '2026-03-25', 75000.00, 145000.00, 70000.00, 'EMBROIDERY',    'Express bridal priority delivery.', 'RIW-HQ',  'c0000000-0000-0000-0000-000000000001'),
('81000000-0000-0000-0000-000000000002', 'ORD-RIW-002', 'Anarkali Gown',  'Champagne Gold Chanderi Tissue Floor Length Anarkali Gown with gota patti neckline and scalloped pearl dupatta border.', 'Noor-e-Awadh Royal Bridal', 85000.00, 'IN_PRODUCTION', '2026-02-10', '2026-03-30', '+91 98201 11002', 'Meera Singhania', '2026-03-30', 50000.00,  85000.00, 35000.00, 'FIRST_TRIAL',   'Trial date scheduled at Indiranagar manor.', 'RIW-BLR', 'c0000000-0000-0000-0000-000000000001'),
('81000000-0000-0000-0000-000000000003', 'ORD-RIW-003', 'Sherwani',       'Ivory Matka Silk Regal Groom Sherwani with marodi thread embroidery on stand collar and concealed placket.', 'Nawab Heritage Sherwanis', 95000.00, 'COMPLETED',     '2026-01-12', '2026-02-20', '+91 98201 11003', 'Rohan Malhotra',  '2026-02-20', 95000.00,  95000.00,     0.00, 'READY_DISPATCH','Fully settled and inspected for reception.', 'RIW-HQ',  'c0000000-0000-0000-0000-000000000001'),
('81000000-0000-0000-0000-000000000004', 'ORD-RIW-004', 'Saree Blouse',   'Deep Emerald Micro-Velvet Blouse with hand dabka zardozi sleeves and gold latkans.', 'Shahi Dastarkhwan Velvet Lehengas', 28000.00, 'PENDING',       '2026-02-22', '2026-03-15', '+91 98201 11004', 'Tanya Narang',    '2026-03-15', 10000.00,  28000.00, 18000.00, 'MEASURING',     'Requires custom padded cup insertion.', 'RIW-PON', 'c0000000-0000-0000-0000-000000000001');

-- Link enquiry 1 to converted order
UPDATE enquiries SET converted_order_id = '81000000-0000-0000-0000-000000000001' WHERE id = '71000000-0000-0000-0000-000000000001';

-- Garments (4)
INSERT INTO garments (
    id, garment_code, order_id, order_code, customer_name, customer_mobile,
    title, garment_type, collection_name, production_stage, material_status,
    priority, payment_status, paid_amount, total_amount, status,
    assigned_to, designer, due_date, image_url, branch, company_id
) VALUES
('81100000-0000-0000-0000-000000000001', 'GAR-RIW-001', '81000000-0000-0000-0000-000000000001', 'ORD-RIW-001', 'Aisha Siddiqui',  '+91 98201 11001', 'Noor Zari Royal Bridal Lehenga', 'Lehenga', 'Noor-e-Awadh Royal Bridal', 'EMBROIDERY', 'READY', 'HIGH',   'PARTIAL', 75000.00, 145000.00, 'IN_PRODUCTION', 'Master Rajesh Sharma', 'Priya Kapoor', '2026-03-25', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80', 'RIW-HQ',  'c0000000-0000-0000-0000-000000000001'),
('81100000-0000-0000-0000-000000000002', 'GAR-RIW-002', '81000000-0000-0000-0000-000000000002', 'ORD-RIW-002', 'Meera Singhania', '+91 98201 11002', 'Champagne Tissue Floor Anarkali', 'Anarkali', 'Noor-e-Awadh Royal Bridal', 'FIRST_TRIAL', 'READY', 'NORMAL', 'PARTIAL', 50000.00,  85000.00, 'IN_PRODUCTION', 'Ustad Sameer Verma',  'Priya Kapoor', '2026-03-30', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80', 'RIW-BLR', 'c0000000-0000-0000-0000-000000000001'),
('81100000-0000-0000-0000-000000000003', 'GAR-RIW-003', '81000000-0000-0000-0000-000000000003', 'ORD-RIW-003', 'Rohan Malhotra',  '+91 98201 11003', 'Ivory Matka Silk Regal Sherwani', 'Sherwani', 'Nawab Heritage Sherwanis', 'READY_DISPATCH', 'READY', 'NORMAL', 'PAID',    95000.00,  95000.00, 'COMPLETED',     'Master Rajesh Sharma', 'Begum Noor Jahan', '2026-02-20', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', 'RIW-HQ',  'c0000000-0000-0000-0000-000000000001'),
('81100000-0000-0000-0000-000000000004', 'GAR-RIW-004', '81000000-0000-0000-0000-000000000004', 'ORD-RIW-004', 'Tanya Narang',    '+91 98201 11004', 'Deep Emerald Hand Dabka Blouse', 'Blouse', 'Shahi Dastarkhwan Velvet Lehengas', 'MEASURING', 'READY', 'NORMAL', 'PARTIAL', 10000.00,  28000.00, 'IN_PRODUCTION', 'Master Rajesh Sharma', 'Priya Kapoor', '2026-03-15', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', 'RIW-PON', 'c0000000-0000-0000-0000-000000000001');

-- Order Progress Stages & Production Stages
INSERT INTO order_progress_stages (
    id, order_id, stage, completed_at, completed_by, notes, company_id
) VALUES
('81200000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000001', 'ORDER_TAKEN',      '2026-02-01 11:30:00', 'Priya Kapoor', 'Order accepted and deposit receipt issued.', 'c0000000-0000-0000-0000-000000000001'),
('81200000-0000-0000-0000-000000000002', '81000000-0000-0000-0000-000000000001', 'MEASURING',        '2026-02-02 14:00:00', 'Master Rajesh Sharma', 'Complete bridal silhouette profile logged.', 'c0000000-0000-0000-0000-000000000001'),
('81200000-0000-0000-0000-000000000003', '81000000-0000-0000-0000-000000000001', 'FABRIC_SELECTION', '2026-02-04 17:00:00', 'Priya Kapoor', 'Pure Banarasi lot #402 reserved.', 'c0000000-0000-0000-0000-000000000001'),
('81200000-0000-0000-0000-000000000004', '81000000-0000-0000-0000-000000000001', 'PATTERN_MAKING',   '2026-02-06 18:30:00', 'Ustad Sameer Verma', '16-kali kalidar pattern drafted.', 'c0000000-0000-0000-0000-000000000001'),
('81200000-0000-0000-0000-000000000005', '81000000-0000-0000-0000-000000000001', 'CUTTING',          '2026-02-08 12:00:00', 'Master Rajesh Sharma', 'Base pieces cut and transferred to embroidery adda.', 'c0000000-0000-0000-0000-000000000001');

INSERT INTO production_stages (
    id, order_id, stage_name, assigned_to, status, started_at, sort_order, notes, company_id
) VALUES
('81300000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000001', 'Cutting & Tracing', 'e1000000-0000-0000-0000-000000000001', 'COMPLETED',   '2026-02-06 10:00:00', 1, 'Cutting completed with precision.', 'c0000000-0000-0000-0000-000000000001'),
('81300000-0000-0000-0000-000000000002', '81000000-0000-0000-0000-000000000001', 'Zardozi Handwork',  'e1000000-0000-0000-0000-000000000003', 'IN_PROGRESS', '2026-02-09 09:30:00', 2, 'Mounted on wooden adda; 60% zari completed.', 'c0000000-0000-0000-0000-000000000001');

-- QC Checklists
INSERT INTO qc_checklists (
    id, order_id, check_point, result, checked_by, checked_at, remarks, sort_order, company_id
) VALUES
('81400000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000003', 'Shoulder Seam & Collar Symmetry', 'PASSED', 'e1000000-0000-0000-0000-000000000004', '2026-02-19 15:00:00', 'Mandarin collar fits flush with zero puckering.', 1, 'c0000000-0000-0000-0000-000000000001'),
('81400000-0000-0000-0000-000000000002', '81000000-0000-0000-0000-000000000003', 'Lining Hem Stitching & Fusing',    'PASSED', 'e1000000-0000-0000-0000-000000000004', '2026-02-19 15:30:00', 'Silk lining clean finish and steam pressed.', 2, 'c0000000-0000-0000-0000-000000000001');

-- Trials & Alterations
INSERT INTO trials (
    id, trial_code, order_id, order_code, customer_mobile, customer_name,
    garment_type, collection, trial_date, trial_time, stage, status,
    fit_status, designer_name, delivery_date, fit_preference, customer_feedback,
    trial_attempt, alteration_count, branch, company_id
) VALUES
('91000000-0000-0000-0000-000000000001', 'TRL-RIW-001', '81000000-0000-0000-0000-000000000002', 'ORD-RIW-002', '+91 98201 11002', 'Meera Singhania', 'Anarkali Gown',  'Noor-e-Awadh Royal Bridal', '2026-03-05', '03:30 PM', 'First Trial',  'TODAY',     'PENDING', 'Priya Kapoor', '2026-03-30', 'Graceful Flared Drape',     'Client requested 0.5 inch extra ease under armhole.', 1, 1, 'RIW-BLR', 'c0000000-0000-0000-0000-000000000001'),
('91000000-0000-0000-0000-000000000002', 'TRL-RIW-002', '81000000-0000-0000-0000-000000000003', 'ORD-RIW-003', '+91 98201 11003', 'Rohan Malhotra',  'Sherwani',       'Nawab Heritage Sherwanis', '2026-02-18', '11:00 AM', 'Final Trial',  'COMPLETED', 'PERFECT', 'Begum Noor Jahan', '2026-02-20', 'Tailored Slim Fit',         'Impeccable fit, client highly satisfied with collar drape.', 1, 0, 'RIW-HQ',  'c0000000-0000-0000-0000-000000000001');

INSERT INTO trial_alterations (
    id, trial_id, description, category, completed, assigned_tailor, priority,
    target_date, tailor_notes, status, company_id
) VALUES
('91100000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 'Release armhole seam by 0.5 inch on both sides', 'Fit', FALSE, 'Master Rajesh Sharma', 'High', '2026-03-08', 'Re-align side panel seam and baste for trial 2.', 'PENDING', 'c0000000-0000-0000-0000-000000000001');

-- Payments & Transactions - omitting generated column balance
INSERT INTO payments (
    id, order_id, customer_mobile, total_amount, paid_amount, status, due_date, notes, company_id
) VALUES
('a1000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000001', '+91 98201 11001', 145000.00, 75000.00, 'PARTIAL', '2026-03-25', 'Advance received via RTGS. Balance on trial delivery.', 'c0000000-0000-0000-0000-000000000001'),
('a1000000-0000-0000-0000-000000000002', '81000000-0000-0000-0000-000000000002', '+91 98201 11002',  85000.00, 50000.00, 'PARTIAL', '2026-03-30', '50K advance token paid at Indiranagar studio.',           'c0000000-0000-0000-0000-000000000001'),
('a1000000-0000-0000-0000-000000000003', '81000000-0000-0000-0000-000000000003', '+91 98201 11003',  95000.00, 95000.00, 'PAID',    '2026-02-20', 'Fully paid up upon final handover.',                       'c0000000-0000-0000-0000-000000000001'),
('a1000000-0000-0000-0000-000000000004', '81000000-0000-0000-0000-000000000004', '+91 98201 11004',  28000.00, 10000.00, 'PARTIAL', '2026-03-15', 'Initial token paid at White Town boutique.',               'c0000000-0000-0000-0000-000000000001');

INSERT INTO payment_transactions (
    id, payment_id, amount, method, received_by, reference_no, notes, company_id
) VALUES
('a1100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 75000.00, 'UPI',         'Priya Kapoor',    'UPI/260201/992100', 'Advance booking token', 'c0000000-0000-0000-0000-000000000001'),
('a1100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 50000.00, 'CREDIT_CARD', 'Sunita Menon',    'CC/HDFC/5549021',   'Bridal gown advance',  'c0000000-0000-0000-0000-000000000001'),
('a1100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 50000.00, 'BANK_TRANSFER','Begum Noor Jahan','NEFT/ICIC/88390',   'Advance on order',     'c0000000-0000-0000-0000-000000000001'),
('a1100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 45000.00, 'CREDIT_CARD', 'Begum Noor Jahan','CC/AMEX/110294',    'Final settlement',     'c0000000-0000-0000-0000-000000000001');

-- Designs (3) - omitting branch column (doesn't exist)
INSERT INTO designs (
    id, design_code, title, garment_type, order_id, status, designer,
    thumbnail_url, customer_mobile, collection, primary_fabric,
    estimated_cost, suggested_price, production_status, times_used,
    image_urls, notes, created_by, company_id
) VALUES
('d1000000-0000-0000-0000-000000000001', 'DES-RIW-001', 'Imperial Noor Zardozi Bridal Lehenga', 'Lehenga',  '81000000-0000-0000-0000-000000000001', 'APPROVED', 'Priya Kapoor',    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80', '+91 98201 11001', 'Noor-e-Awadh Royal Bridal',       'Pure Banarasi Katan Silk', 48000.00, 145000.00, 'Active', 12, '["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"]', 'Signature heirloom piece with scalloped tilla border.', 'Priya Kapoor', 'c0000000-0000-0000-0000-000000000001'),
('d1000000-0000-0000-0000-000000000002', 'DES-RIW-002', 'Champagne Chanderi Tissue Anarkali',    'Anarkali', '81000000-0000-0000-0000-000000000002', 'APPROVED', 'Priya Kapoor',    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80', '+91 98201 11002', 'Noor-e-Awadh Royal Bridal',       'Chanderi Tissue Organza',  26000.00,  85000.00, 'Active',  8, '["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80"]', 'Lightweight summer wedding cocktail silhouette.',  'Priya Kapoor', 'c0000000-0000-0000-0000-000000000001'),
('d1000000-0000-0000-0000-000000000003', 'DES-RIW-003', 'Nawab Heritage Matka Silk Sherwani',   'Sherwani', '81000000-0000-0000-0000-000000000003', 'APPROVED', 'Begum Noor Jahan','https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80', '+91 98201 11003', 'Nawab Heritage Sherwanis',         'Pure Matka Raw Silk',      32000.00,  95000.00, 'Active', 15, '["https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"]', 'Royal Mughal inspired cut with heirloom collar.',   'Begum Noor Jahan', 'c0000000-0000-0000-0000-000000000001');

-- Appointments (2)
INSERT INTO appointments (
    id, order_id, appt_type, scheduled_at, duration_minutes, status,
    staff_assigned, notes, customer_mobile, company_id
) VALUES
('b1100000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000002', 'FIRST_TRIAL', '2026-03-05 15:30:00', 60, 'SCHEDULED', 'Priya Kapoor', 'Basting trial for champagne anarkali gown in Indiranagar fitting suite.', '+91 98201 11002', 'c0000000-0000-0000-0000-000000000001'),
('b1100000-0000-0000-0000-000000000002', NULL,                                  'CONSULTATION','2026-03-12 11:00:00', 45, 'SCHEDULED', 'Priya Kapoor', 'Initial bridal consultation for Diwali trousseau.',                '+91 98201 11001', 'c0000000-0000-0000-0000-000000000001');

-- ==============================================================================
-- MASTER SEED SCRIPT: PART 2 - COMPANY 2 (SILK & THREAD ATELIER - 5 BRANCHES)
-- ==============================================================================

-- Company 2 Settings
INSERT INTO company_settings (
    id, company_name, short_name, tagline, owner_name, business_type,
    gstin, pan_number, primary_phone, whatsapp, email, website,
    street_address, city, state, pin_code, country, logo_base64,
    share_customers_across_branches, share_orders_across_branches,
    share_enquiries_across_branches, share_measurements_across_branches,
    share_inventory_across_branches, share_garments_across_branches,
    share_trials_across_branches
) VALUES (
    'c0000000-0000-0000-0000-000000000002',
    'Silk & Thread Atelier',
    'SILKTHREAD',
    'Contemporary Handloom Silks & Modern Bespoke Draping',
    'Ananya Sen & Vikram Rathore',
    'Contemporary Handloom Atelier',
    '27BBBBA1111B1Z2',
    'BBBBA1111B',
    '+91 22 2650 8800',
    '+91 98202 22000',
    'hello@silkandthread.in',
    'https://silkandthread.in',
    'Tower 3, The Capital, G Block, Bandra Kurla Complex',
    'Mumbai',
    'Maharashtra',
    '400051',
    'India',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80',
    TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE
);

-- Branches (5)
INSERT INTO branches (
    id, branch_code, name, type, street_address, city, state, pin_code,
    country, phone, whatsapp, email, is_headquarters, active, working_hours, company_id
) VALUES
('b2000000-0000-0000-0000-000000000001', 'SKT-BKC',   'BKC Corporate Flagship',    'FLAGSHIP', 'Level 2, The Capital, G Block, BKC', 'Mumbai', 'Maharashtra', '400051', 'India', '+91 22 2650 8801', '+91 98202 22001', 'bkc@silkandthread.in',    TRUE,  TRUE, 'Mon-Sat 10:00-20:00', 'c0000000-0000-0000-0000-000000000002'),
('b2000000-0000-0000-0000-000000000002', 'SKT-AND',   'Lokhandwala Pret Studio',   'STUDIO',   'Shop 4, Greenfield Plaza, Lokhandwala, Andheri W', 'Mumbai', 'Maharashtra', '400053', 'India', '+91 22 2634 5500', '+91 98202 22002', 'andheri@silkandthread.in',FALSE, TRUE, 'Mon-Sat 10:00-21:00', 'c0000000-0000-0000-0000-000000000002'),
('b2000000-0000-0000-0000-000000000003', 'SKT-PUNE',  'Koregaon Park Design Villa','BOUTIQUE', 'Lane 7, South Main Road, Koregaon Park', 'Pune', 'Maharashtra', '411001', 'India', '+91 20 6620 3300', '+91 98202 22003', 'pune@silkandthread.in',   FALSE, TRUE, 'Mon-Sat 10:00-20:00', 'c0000000-0000-0000-0000-000000000002'),
('b2000000-0000-0000-0000-000000000004', 'SKT-NAVI',  'Vashi Sector 17 Showcase',  'SHOWROOM', 'Plot 42, Palm Beach Galleria, Sector 17, Vashi', 'Navi Mumbai', 'Maharashtra', '400703', 'India', '+91 22 2789 1200', '+91 98202 22004', 'vashi@silkandthread.in',  FALSE, TRUE, 'Mon-Sat 11:00-20:30', 'c0000000-0000-0000-0000-000000000002'),
('b2000000-0000-0000-0000-000000000005', 'SKT-THANE', 'Thane Meadows Atelier',    'BOUTIQUE', 'Shop 12, Viviana Galleria, Eastern Express Hwy', 'Thane', 'Maharashtra', '400606', 'India', '+91 22 2544 9000', '+91 98202 22005', 'thane@silkandthread.in',  FALSE, TRUE, 'Mon-Sun 10:30-21:30', 'c0000000-0000-0000-0000-000000000002');

-- Employees (6)
INSERT INTO employees (
    id, employee_code, name, phone, email, role, status, joined_date,
    avatar_url, specialization, company_id
) VALUES
('e2000000-0000-0000-0000-000000000001', 'EMP-SKT-001', 'Ananya Sen',           '+91 98202 11001', 'ananya@silkandthread.in',   'DESIGNER', 'ACTIVE', '2021-01-15', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', 'Architectural Draping & Handloom Blends', 'c0000000-0000-0000-0000-000000000002'),
('e2000000-0000-0000-0000-000000000002', 'EMP-SKT-002', 'Farhan Siddiqui',      '+91 98202 11002', 'farhan@silkandthread.in',   'DESIGNER', 'ACTIVE', '2021-06-01', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', 'Contemporary Menswear & Bandhgalas',      'c0000000-0000-0000-0000-000000000002'),
('e2000000-0000-0000-0000-000000000003', 'EMP-SKT-003', 'Meenakshi Sundaram',   '+91 98202 11003', 'meenakshi@silkandthread.in','ARTISAN',  'ACTIVE', '2022-02-10', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80', 'Temple Borders, Hand Pintucks & Kantha',     'c0000000-0000-0000-0000-000000000002'),
('e2000000-0000-0000-0000-000000000004', 'EMP-SKT-004', 'Master Vikram Rathore','+91 98202 11004', 'vikram@silkandthread.in',   'TAILOR',   'ACTIVE', '2020-04-01', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80', 'Master Pattern Maker & Bespoke Tailor',    'c0000000-0000-0000-0000-000000000002'),
('e2000000-0000-0000-0000-000000000005', 'EMP-SKT-005', 'Kavita Deshmukh',      '+91 98202 11005', 'kavita@silkandthread.in',   'STAFF',    'ACTIVE', '2022-08-15', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80', 'Client Styling & Fit Consultation',        'c0000000-0000-0000-0000-000000000002'),
('e2000000-0000-0000-0000-000000000006', 'EMP-SKT-006', 'Arjun Nair',            '+91 98202 11006', 'arjun@silkandthread.in',    'QC',       'ACTIVE', '2023-01-20', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80', 'Handloom Fabric Tensile & Seam Inspection','c0000000-0000-0000-0000-000000000002');

UPDATE branches SET manager_id = 'e2000000-0000-0000-0000-000000000001' WHERE id = 'b2000000-0000-0000-0000-000000000001';
UPDATE branches SET manager_id = 'e2000000-0000-0000-0000-000000000002' WHERE id = 'b2000000-0000-0000-0000-000000000002';
UPDATE branches SET manager_id = 'e2000000-0000-0000-0000-000000000004' WHERE id = 'b2000000-0000-0000-0000-000000000003';
UPDATE branches SET manager_id = 'e2000000-0000-0000-0000-000000000003' WHERE id = 'b2000000-0000-0000-0000-000000000004';
UPDATE branches SET manager_id = 'e2000000-0000-0000-0000-000000000005' WHERE id = 'b2000000-0000-0000-0000-000000000005';

-- Users (1) - Company Owner (Default System User)
INSERT INTO app_users (
    id, username, password_hash, full_name, role, active, email, phone,
    avatar_url, designation, department, assigned_branch, company_id
) VALUES
('12000000-0000-0000-0000-000000000001', 'silkthread_admin',    '$2a$10$xSIrpfakrLDjoPKviQyKR.ASqQ/TQFfjqBsR4ViPf3hdBWx/.jC3a', 'Ananya Sen',       'OWNER',    TRUE, 'ananya@silkandthread.in',    '+91 98202 22000', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', 'Founder & Creative Director', 'Executive',  'SKT-BKC',   'c0000000-0000-0000-0000-000000000002');

-- User Profiles (1)
INSERT INTO user_profiles (
    id, user_id, full_name, display_title, department, email, phone,
    assigned_branch, clearance_level, system_role_label, privileges_summary,
    avatar_url, company_id
) VALUES
('22000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', 'Ananya Sen',       'Founder & Creative Director', 'Executive',  'ananya@silkandthread.in',    '+91 98202 22000', 'SKT-BKC',   'Tier 1 (Executive)', 'Company Owner', 'Universal Multi-Branch Management & Settings', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', 'c0000000-0000-0000-0000-000000000002');

-- Pipeline Stages for Company 2 (9)
INSERT INTO stage_definitions (
    id, stage_key, display_name, description, required_role, dept_label,
    color_class, sort_order, active, image_url, company_id
) VALUES
('32000000-0000-0000-0000-000000000001', 'ORDER_TAKEN',   'Client Intake & Booking', 'Initial silhouette selection, moodboard review and token', 'STAFF', 'Consultation Lounge', 'badge-primary', 10, TRUE, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000002'),
('32000000-0000-0000-0000-000000000002', 'MEASURING',     'Precision 3D Draping',    'Anatomical posture capture & laser tape measurements',      'DESIGNER', 'Drape Lab',         'badge-info',    20, TRUE, 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000002'),
('32000000-0000-0000-0000-000000000003', 'DESIGN_SKETCH', 'Technical CAD Render',   'Digital flat sketch generation and fabric yarn mapping',    'DESIGNER', 'Design Studio',     'badge-primary', 30, TRUE, 'https://images.unsplash.com/photo-1528458876885-5b6eacdd3671?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000002'),
('32000000-0000-0000-0000-000000000004', 'TEXTILE_TEST',  'Loom Batch Inspection',   'Weave density, shrinkage test & colorfastness check',       'STAFF',    'Material Vault',    'badge-secondary',40,TRUE, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000002'),
('32000000-0000-0000-0000-000000000005', 'PATTERN_DRAFT', 'Block Pattern Drafting', 'Muslin block grading and personalized seam adjustments',  'TAILOR',   'Pattern Lab',       'badge-warning', 50, TRUE, 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000002'),
('32000000-0000-0000-0000-000000000006', 'SAMPLE_CUT',    'Precision Fabric Cut',    'Rotary cut of pure handloom silk with grain alignment',     'TAILOR',   'Cutting Floor',     'badge-warning', 60, TRUE, 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000002'),
('32000000-0000-0000-0000-000000000007', 'TAILORING',     'Single-Needle Bespoke',   'Hand-stitched French seams, horsehair canvas interfacings', 'TAILOR',   'Tailoring Wing',    'badge-dark',    70, TRUE, 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000002'),
('32000000-0000-0000-0000-000000000008', 'FITTING_TRIAL', 'Couture Fitting Session', 'Live body drape review and movement ease verification',    'DESIGNER', 'Private Suite',     'badge-purple',  80, TRUE, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000002'),
('32000000-0000-0000-0000-000000000009', 'FINAL_QC',      'Luxury Finish & Press',   'Microscopic stitch inspection, tag attachment & steam press', 'QC',    'White Glove QC',    'badge-success', 90, TRUE, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000002');

-- Collections (3)
INSERT INTO collections (
    id, code, name, subtitle, description, season, year, status, designer,
    branch, launch_date, is_featured, cover_image_url, progress_percentage, company_id
) VALUES
('c2000000-0000-0000-0000-000000000001', 'SKT-SS26-INDIGO',   'Nilambari: Botanical Indigo Silks', 'Hand-dyed fermented indigo on pure mulberry silk organza.', 'Sustainable natural dye capsule with contemporary structured capes and asymmetric tunics.', 'Spring/Summer', 2026, 'ACTIVE', 'Ananya Sen', 'SKT-BKC', '2026-02-01', TRUE, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80', 70, 'c0000000-0000-0000-0000-000000000002'),
('c2000000-0000-0000-0000-000000000002', 'SKT-FW26-PASHMINA', 'Kashmir Sonnet: Pashmina & Tussar', 'Organic handspun tussar blended with ultrafine cashmere.', 'Sophisticated architectural trenches, bandhgalas and pleated overwraps.', 'Autumn/Winter', 2026, 'ACTIVE', 'Farhan Siddiqui', 'SKT-PUNE', '2026-07-15', TRUE, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80', 35, 'c0000000-0000-0000-0000-000000000002'),
('c2000000-0000-0000-0000-000000000003', 'SKT-CR26-EVENING',  'Astral Silk: Sculpted Capes',       'Structured handloom silk capes with geometric metallic accents.', 'Bespoke modern eveningwear for contemporary galas and art soirees.', 'Resort/Cruise', 2026, 'ACTIVE', 'Ananya Sen', 'SKT-AND', '2026-03-01', FALSE, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80', 50, 'c0000000-0000-0000-0000-000000000002');

-- Suppliers (2)
INSERT INTO suppliers (
    id, supplier_code, name, contact_person, phone, email, address, specialization, company_id
) VALUES
('f2000000-0000-0000-0000-000000000001', 'SUP-SKT-001', 'Kanchipuram Heritage Loom Co-op', 'T. S. Swaminathan', '+91 44 2722 4110', 'orders@kanchiweavers.coop', 'Gandhi Road, Kanchipuram, Tamil Nadu 631501', 'Traditional Handloom Mulberry Silk & Korvai Weaving', 'c0000000-0000-0000-0000-000000000002'),
('f2000000-0000-0000-0000-000000000002', 'SUP-SKT-002', 'Bhagalpur Ahimsa Silk Guild',    'Rameshwar Jha',     '+91 641 242 1980', 'info@bhagalpursilk.org',    'Champanagar, Bhagalpur, Bihar 812004',          'Cruelty-Free Ahimsa & Tussar Raw Silks',             'c0000000-0000-0000-0000-000000000002');

-- Inventory Items (6) - omitting generated column available_qty
INSERT INTO inventory_items (
    id, item_code, name, category, variant, unit, stock_qty, reserved_qty,
    reorder_level, purchase_price, selling_price, supplier_name, image_url,
    status, composition, weave, width, origin, branch, company_id
) VALUES
('42000000-0000-0000-0000-000000000001', 'ITM-SKT-001', 'Kanchipuram Temple Border Silk (Mustard Gold)', 'Fabric', 'Mustard Gold', 'Meter', 65.00, 18.00, 10.00, 2800.00, 5800.00, 'Kanchipuram Heritage Loom Co-op', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', '100% Handloom Mulberry Silk', 'Korvai Solid Weave', '48 inches', 'Kanchipuram', 'SKT-BKC',   'c0000000-0000-0000-0000-000000000002'),
('42000000-0000-0000-0000-000000000002', 'ITM-SKT-002', 'Wild Tussar Ahimsa Raw Silk (Natural Ecru)',    'Fabric', 'Natural Ecru', 'Meter', 50.00, 12.00,  8.00, 1950.00, 4200.00, 'Bhagalpur Ahimsa Silk Guild',    'https://images.unsplash.com/photo-1528458876885-5b6eacdd3671?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', '100% Non-Violent Tussar',   'Slub Textured Plain Weave', '44 inches', 'Bhagalpur', 'SKT-AND',   'c0000000-0000-0000-0000-000000000002'),
('42000000-0000-0000-0000-000000000003', 'ITM-SKT-003', 'Chanderi Pure Silk-Cotton Sheer (Indigo Blue)', 'Fabric', 'Indigo Blue',  'Meter', 40.00,  8.00,  5.00, 1600.00, 3400.00, 'Bhagalpur Ahimsa Silk Guild',    'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', '70% Silk 30% Cotton Blend',   'Sheer Chanderi Weave', '46 inches', 'Chanderi', 'SKT-PUNE',  'c0000000-0000-0000-0000-000000000002'),
('42000000-0000-0000-0000-000000000004', 'ITM-SKT-004', 'Mulberry Silk Satin 80g (Blush Rose)',          'Fabric', 'Blush Rose',   'Meter', 55.00, 14.00, 10.00, 2400.00, 5100.00, 'Kanchipuram Heritage Loom Co-op', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', '100% Mulberry Silk',         'High Lustre Satin', '44 inches', 'Bangalore', 'SKT-NAVI',  'c0000000-0000-0000-0000-000000000002'),
('42000000-0000-0000-0000-000000000005', 'ITM-SKT-005', 'Hand-Carved Mother-of-Pearl Buttons',           'Trim',   'Natural Pearl', 'Set',   30.00,  5.00,  5.00,  450.00, 1100.00, 'Bhagalpur Ahimsa Silk Guild',    'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', 'Natural Sea Shell',           'Carved Circular 20mm', 'N/A', 'Kochi', 'SKT-THANE', 'c0000000-0000-0000-0000-000000000002'),
('42000000-0000-0000-0000-000000000006', 'ITM-SKT-006', 'Organic GOTS Cotton Interlining Canvas',        'Lining', 'Unbleached Cream','Meter',80.00, 20.00, 15.00,  380.00,  850.00, 'Kanchipuram Heritage Loom Co-op', 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', '100% Organic GOTS Cotton',   'Dense Woven Canvas', '40 inches', 'Coimbatore', 'SKT-BKC', 'c0000000-0000-0000-0000-000000000002');

-- Purchase Orders & Items
INSERT INTO purchase_orders (
    id, po_code, supplier_id, status, total_amount, order_date, expected_date, notes, company_id
) VALUES
('52000000-0000-0000-0000-000000000001', 'PO-SKT-001', 'f2000000-0000-0000-0000-000000000001', 'RECEIVED', 112000.00, '2026-01-25', '2026-02-12', 'Handloom Kanchi silk yardage for summer collection', 'c0000000-0000-0000-0000-000000000002');

INSERT INTO purchase_order_items (
    id, po_id, item_id, item_name, quantity, unit, unit_price, received_qty, company_id
) VALUES
('52100000-0000-0000-0000-000000000001', '52000000-0000-0000-0000-000000000001', '42000000-0000-0000-0000-000000000001', 'Kanchipuram Temple Border Silk (Mustard Gold)', 40.00, 'Meter', 2800.00, 40.00, 'c0000000-0000-0000-0000-000000000002');

-- Customers (5)
INSERT INTO customers (
    mobile_number, name, first_name, last_name, salutation, gender, email,
    location, street_address, city, state, pincode, tier, total_spend, balance,
    favorite_garment, measurements_on_file, fit_preference, preferred_neck,
    preferred_sleeve, preferred_occasions, preferred_channel, avatar_url,
    branch, company_id
) VALUES
('+91 98202 22001', 'Sunita Rao',            'Sunita',    'Rao',       'Ms.',  'Female', 'sunita.rao@consulting.in',    'Bandra Kurla Complex, Mumbai', 'Penthouse B, Signia Isles, BKC', 'Mumbai', 'Maharashtra', '400051', 'VIP',     68000.00, 34000.00, 'Sculpted Silk Cape Set',   TRUE, 'Structured Tailored Fit',  'Asymmetric High Neck', 'Sleeveless with Cape Flap', 'Corporate Gala & Art Biennales', 'WhatsApp', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80', 'SKT-BKC',   'c0000000-0000-0000-0000-000000000002'),
('+91 98202 22002', 'Dr. Anjali Deshmukh',    'Anjali',    'Deshmukh',  'Dr.',  'Female', 'anjali.deshmukh@symbiosis.ac','Koregaon Park, Pune', 'Bungalow 7, Lane 3, Koregaon Park', 'Pune', 'Maharashtra', '411001', 'PREMIUM', 52000.00, 22000.00, 'Temple Border Silk Ensemble',TRUE, 'Fluid Classical Drape',     'Modest Boat Neck',     'Quarter Length Bell Sleeve', 'Academic Convocation & Receptions', 'WhatsApp', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80', 'SKT-PUNE',  'c0000000-0000-0000-0000-000000000002'),
('+91 98202 22003', 'Kabir Mehta',           'Kabir',     'Mehta',     'Mr.',  'Male',   'kabir.mehta@studio.com',      'Lokhandwala, Mumbai', 'A-801 Oberoi Sky Heights, Andheri W', 'Mumbai', 'Maharashtra', '400053', 'REGULAR', 46000.00,     0.00, 'Textured Silk Bandhgala',   TRUE, 'Slim Italian Cut',         'Mandarin Raised Collar','Straight Cuffed Tailored',   'Film Premieres & Awards',         'WhatsApp', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', 'SKT-AND',   'c0000000-0000-0000-0000-000000000002'),
('+91 98202 22004', 'Radhika Merchant-Poddar','Radhika',  'Merchant',  'Mrs.', 'Female', 'radhika.poddar@capital.in',   'Palm Beach Road, Navi Mumbai', 'Villa 11, NRI Seawoods Complex, Palm Beach', 'Navi Mumbai', 'Maharashtra', '400706', 'VIP', 38000.00, 18000.00, 'Botanical Indigo Kurta',    TRUE, 'Comfort Breezy Silhouette', 'Slit Mandarin Neck',  'Three-Quarter Loose Cuff',  'Summer High Tea & Family Poojas', 'WhatsApp', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', 'SKT-NAVI',  'c0000000-0000-0000-0000-000000000002'),
('+91 98202 22005', 'Shreya Ghoshal-Roy',    'Shreya',    'Ghoshal',   'Ms.',  'Female', 'shreya.roy@symphony.in',      'Ghodbunder Road, Thane', '1402 Hiranandani Meadows, Thane W', 'Thane', 'Maharashtra', '400610', 'PREMIUM', 42000.00, 20000.00, 'Tussar Contemporary Trench',TRUE, 'Layered Overcoat Fit',     'Notched Lapel Collar', 'Full Belted Cuffed Sleeve', 'Music Concerts & Private Tours',  'WhatsApp', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80', 'SKT-THANE', 'c0000000-0000-0000-0000-000000000002');

-- Body Measurements
INSERT INTO customer_body_measurements (
    id, customer_mobile, customer_name, garment_type, measurement_type, is_current,
    version, unit, shoulder, bust, under_bust, waist, hip, blouse_length,
    armhole, sleeve_length, front_neck_depth, back_neck_depth, recorded_by, company_id
) VALUES
('62000000-0000-0000-0000-000000000001', '+91 98202 22001', 'Sunita Rao',         'Cape Set',  'CURRENT', TRUE, 1, 'in', 14.75, 35.50, 29.50, 27.50, 37.50, 24.00, 16.00, 18.00, 6.50, 4.00, 'Ananya Sen',            'c0000000-0000-0000-0000-000000000002'),
('62000000-0000-0000-0000-000000000002', '+91 98202 22002', 'Dr. Anjali Deshmukh', 'Saree Set', 'CURRENT', TRUE, 1, 'in', 15.25, 37.00, 31.00, 30.00, 40.00, 14.50, 17.00, 14.00, 7.00, 8.50, 'Master Vikram Rathore', 'c0000000-0000-0000-0000-000000000002'),
('62000000-0000-0000-0000-000000000003', '+91 98202 22003', 'Kabir Mehta',        'Bandhgala', 'CURRENT', TRUE, 1, 'in', 18.00, 40.50, 36.00, 34.00, 39.50, 30.00, 19.50, 25.00, 3.00, 1.50, 'Farhan Siddiqui',       'c0000000-0000-0000-0000-000000000002'),
('62000000-0000-0000-0000-000000000004', '+91 98202 22004', 'Radhika Merchant',   'Kurta',     'CURRENT', TRUE, 1, 'in', 14.50, 36.00, 30.00, 29.00, 38.50, 44.00, 16.50, 17.50, 7.50, 5.00, 'Meenakshi Sundaram',   'c0000000-0000-0000-0000-000000000002'),
('62000000-0000-0000-0000-000000000005', '+91 98202 22005', 'Shreya Ghoshal-Roy', 'Trench',    'CURRENT', TRUE, 1, 'in', 15.50, 38.50, 32.50, 31.50, 41.50, 40.00, 18.00, 23.50, 8.50, 6.00, 'Kavita Deshmukh',       'c0000000-0000-0000-0000-000000000002');

INSERT INTO customer_measurements (
    id, customer_mobile, garment_type, bust, waist, full_hip, shoulder,
    sleeve_length, armhole, front_neck, back_neck, garment_length,
    recorded_by, is_active_profile, company_id
) VALUES
('62100000-0000-0000-0000-000000000001', '+91 98202 22001', 'Cape Set',  35.50, 27.50, 37.50, 14.75, 18.00, 16.00, 6.50, 4.00, 24.00, 'Ananya Sen',            TRUE, 'c0000000-0000-0000-0000-000000000002'),
('62100000-0000-0000-0000-000000000002', '+91 98202 22002', 'Saree Set', 37.00, 30.00, 40.00, 15.25, 14.00, 17.00, 7.00, 8.50, 14.50, 'Master Vikram Rathore', TRUE, 'c0000000-0000-0000-0000-000000000002'),
('62100000-0000-0000-0000-000000000003', '+91 98202 22003', 'Bandhgala', 40.50, 34.00, 39.50, 18.00, 25.00, 19.50, 3.00, 1.50, 30.00, 'Farhan Siddiqui',       TRUE, 'c0000000-0000-0000-0000-000000000002'),
('62100000-0000-0000-0000-000000000004', '+91 98202 22004', 'Kurta',     36.00, 29.00, 38.50, 14.50, 17.50, 16.50, 7.50, 5.00, 44.00, 'Meenakshi Sundaram',   TRUE, 'c0000000-0000-0000-0000-000000000002'),
('62100000-0000-0000-0000-000000000005', '+91 98202 22005', 'Trench',    38.50, 31.50, 41.50, 15.50, 23.50, 18.00, 8.50, 6.00, 40.00, 'Kavita Deshmukh',       TRUE, 'c0000000-0000-0000-0000-000000000002');

INSERT INTO measurement_profiles (
    id, customer_mobile, garment_type, recorded_by, notes, branch, company_id
) VALUES
('62200000-0000-0000-0000-000000000001', '+91 98202 22001', 'Sculpted Silk Cape Set', 'Ananya Sen',            'Fitted bustier under asymmetric draped cape.', 'SKT-BKC',  'c0000000-0000-0000-0000-000000000002'),
('62200000-0000-0000-0000-000000000002', '+91 98202 22002', 'Temple Border Saree Set', 'Master Vikram Rathore', 'Traditional tailored blouse with princess seams.', 'SKT-PUNE', 'c0000000-0000-0000-0000-000000000002');

-- Enquiries (4)
INSERT INTO enquiries (
    id, enquiry_code, customer_name, phone, email, garment_type, notes,
    status, assigned_to, occasion, estimated_budget, source, avatar_url,
    branch, company_id
) VALUES
('72000000-0000-0000-0000-000000000001', 'ENQ-SKT-001', 'Sunita Rao',            '+91 98202 22001', 'sunita.rao@consulting.in',    'Sculpted Cape Set', 'Corporate biennial summit keynote address attire.', 'CONVERTED', 'Ananya Sen',       'Corporate Gala', 70000.00, 'WALK_IN',   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80', 'SKT-BKC',   'c0000000-0000-0000-0000-000000000002'),
('72000000-0000-0000-0000-000000000002', 'ENQ-SKT-002', 'Divya Ramesh',          '+91 98202 22006', 'divya.ramesh@tech.io',         'Pret Silk Tunic',   'Lokhandwala store walk-in exploring organic indigo silhouettes.', 'CONTACTED', 'Farhan Siddiqui', 'Casual Luxury',  25000.00, 'WALK_IN',   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80', 'SKT-AND',   'c0000000-0000-0000-0000-000000000002'),
('72000000-0000-0000-0000-000000000003', 'ENQ-SKT-003', 'Siddharth Kapoor',      '+91 98202 22007', 'sid.kapoor@venture.vc',       'Bespoke Bandhgala', 'Koregaon Park villa consultation on natural tussar jacket.', 'PENDING',   'Vikram Rathore',  'Engagement',     50000.00, 'PHONE',     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', 'SKT-PUNE',  'c0000000-0000-0000-0000-000000000002'),
('72000000-0000-0000-0000-000000000004', 'ENQ-SKT-004', 'Alisha Chinai-Advani',  '+91 98202 22008', 'alisha.advani@gmail.com',      'Botanical Kurta',   'Vashi client exploring festive handloom ensembles.', 'PENDING',   'Meenakshi S.',    'Diwali Party',   35000.00, 'INSTAGRAM', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80', 'SKT-NAVI',  'c0000000-0000-0000-0000-000000000002');

-- Orders (5 - distributed across 5 branches)
INSERT INTO orders (
    id, order_code, garment_type, garment_desc, collection, amount, status,
    order_date, due_date, customer_mobile, customer_name, expected_delivery_date,
    advance_paid, total_amount, balance_amount, current_stage, notes, branch, company_id
) VALUES
('82000000-0000-0000-0000-000000000001', 'ORD-SKT-001', 'Cape Set',     'Astral Handloom Sculpted Silk Cape Set with pleated palazzos and inner handloom bustier.', 'Astral Silk: Sculpted Capes', 68000.00, 'IN_PRODUCTION', '2026-02-05', '2026-03-20', '+91 98202 22001', 'Sunita Rao',            '2026-03-20', 34000.00, 68000.00, 34000.00, 'TAILORING',     'BKC flagship priority tailoring.', 'SKT-BKC',   'c0000000-0000-0000-0000-000000000002'),
('82000000-0000-0000-0000-000000000002', 'ORD-SKT-002', 'Saree Set',    'Kanchipuram Mustard Gold Temple Border Silk Saree with hand-stitched silk satin blouse.', 'Nilambari: Botanical Indigo Silks', 52000.00, 'IN_PRODUCTION', '2026-02-12', '2026-03-28', '+91 98202 22002', 'Dr. Anjali Deshmukh',    '2026-03-28', 30000.00, 52000.00, 22000.00, 'FITTING_TRIAL', 'Fitting scheduled at Pune villa.',  'SKT-PUNE',  'c0000000-0000-0000-0000-000000000002'),
('82000000-0000-0000-0000-000000000003', 'ORD-SKT-003', 'Bandhgala',    'Textured Wild Tussar Ahimsa Silk Bandhgala Jacket with bespoke mother-of-pearl buttons.', 'Kashmir Sonnet: Pashmina & Tussar', 46000.00, 'COMPLETED',     '2026-01-18', '2026-02-25', '+91 98202 22003', 'Kabir Mehta',           '2026-02-25', 46000.00, 46000.00,     0.00, 'FINAL_QC',      'Fully settled and dispatched.',    'SKT-AND',   'c0000000-0000-0000-0000-000000000002'),
('82000000-0000-0000-0000-000000000004', 'ORD-SKT-004', 'Kurta Set',    'Fermented Botanical Indigo Hand-Pleated Chanderi Kurta Set with tapered raw silk trousers.', 'Nilambari: Botanical Indigo Silks', 38000.00, 'IN_PRODUCTION', '2026-02-20', '2026-03-25', '+91 98202 22004', 'Radhika Merchant-Poddar','2026-03-25', 20000.00, 38000.00, 18000.00, 'SAMPLE_CUT',    'Cutting in progress at Vashi desk.', 'SKT-NAVI',  'c0000000-0000-0000-0000-000000000002'),
('82000000-0000-0000-0000-000000000005', 'ORD-SKT-005', 'Trench Cape',  'Raw Tussar & Pashmina Architectural Contemporary Trench Cape with waist tie belt.', 'Kashmir Sonnet: Pashmina & Tussar', 42000.00, 'PENDING',       '2026-02-25', '2026-04-05', '+91 98202 22005', 'Shreya Ghoshal-Roy',    '2026-04-05', 22000.00, 42000.00, 20000.00, 'DESIGN_SKETCH', 'CAD sketch review pending approval.','SKT-THANE', 'c0000000-0000-0000-0000-000000000002');

UPDATE enquiries SET converted_order_id = '82000000-0000-0000-0000-000000000001' WHERE id = '72000000-0000-0000-0000-000000000001';

-- Garments (5)
INSERT INTO garments (
    id, garment_code, order_id, order_code, customer_name, customer_mobile,
    title, garment_type, collection_name, production_stage, material_status,
    priority, payment_status, paid_amount, total_amount, status,
    assigned_to, designer, due_date, image_url, branch, company_id
) VALUES
('82100000-0000-0000-0000-000000000001', 'GAR-SKT-001', '82000000-0000-0000-0000-000000000001', 'ORD-SKT-001', 'Sunita Rao',            '+91 98202 22001', 'Astral Sculpted Silk Cape Set',       'Cape Set',   'Astral Silk: Sculpted Capes',       'TAILORING',     'READY', 'HIGH',   'PARTIAL', 34000.00, 68000.00, 'IN_PRODUCTION', 'Master Vikram Rathore', 'Ananya Sen',       '2026-03-20', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80', 'SKT-BKC',   'c0000000-0000-0000-0000-000000000002'),
('82100000-0000-0000-0000-000000000002', 'GAR-SKT-002', '82000000-0000-0000-0000-000000000002', 'ORD-SKT-002', 'Dr. Anjali Deshmukh',    '+91 98202 22002', 'Kanchipuram Mustard Saree Ensemble',  'Saree Set',  'Nilambari: Botanical Indigo Silks', 'FITTING_TRIAL', 'READY', 'NORMAL', 'PARTIAL', 30000.00, 52000.00, 'IN_PRODUCTION', 'Meenakshi Sundaram',   'Ananya Sen',       '2026-03-28', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', 'SKT-PUNE',  'c0000000-0000-0000-0000-000000000002'),
('82100000-0000-0000-0000-000000000003', 'GAR-SKT-003', '82000000-0000-0000-0000-000000000003', 'ORD-SKT-003', 'Kabir Mehta',           '+91 98202 22003', 'Textured Tussar Bandhgala Jacket',    'Bandhgala',  'Kashmir Sonnet: Pashmina & Tussar', 'FINAL_QC',      'READY', 'NORMAL', 'PAID',    46000.00, 46000.00, 'COMPLETED',     'Master Vikram Rathore', 'Farhan Siddiqui',  '2026-02-25', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', 'SKT-AND',   'c0000000-0000-0000-0000-000000000002'),
('82100000-0000-0000-0000-000000000004', 'GAR-SKT-004', '82000000-0000-0000-0000-000000000004', 'ORD-SKT-004', 'Radhika Merchant-Poddar','+91 98202 22004', 'Botanical Indigo Hand-Pleated Kurta', 'Kurta Set',   'Nilambari: Botanical Indigo Silks', 'SAMPLE_CUT',    'READY', 'NORMAL', 'PARTIAL', 20000.00, 38000.00, 'IN_PRODUCTION', 'Meenakshi Sundaram',   'Ananya Sen',       '2026-03-25', 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=600&q=80', 'SKT-NAVI',  'c0000000-0000-0000-0000-000000000002'),
('82100000-0000-0000-0000-000000000005', 'GAR-SKT-005', '82000000-0000-0000-0000-000000000005', 'ORD-SKT-005', 'Shreya Ghoshal-Roy',    '+91 98202 22005', 'Raw Tussar Architectural Trench Cape','Trench Cape', 'Kashmir Sonnet: Pashmina & Tussar', 'DESIGN_SKETCH', 'READY', 'NORMAL', 'PARTIAL', 22000.00, 42000.00, 'IN_PRODUCTION', 'Kavita Deshmukh',      'Farhan Siddiqui',  '2026-04-05', 'https://images.unsplash.com/photo-1528458876885-5b6eacdd3671?auto=format&fit=crop&w=600&q=80', 'SKT-THANE', 'c0000000-0000-0000-0000-000000000002');

-- Order Progress Stages & Production Stages
INSERT INTO order_progress_stages (
    id, order_id, stage, completed_at, completed_by, notes, company_id
) VALUES
('82200000-0000-0000-0000-000000000001', '82000000-0000-0000-0000-000000000001', 'ORDER_TAKEN',   '2026-02-05 10:00:00', 'Ananya Sen',           'Consultation confirmed and 50% deposit received.', 'c0000000-0000-0000-0000-000000000002'),
('82200000-0000-0000-0000-000000000002', '82000000-0000-0000-0000-000000000001', 'MEASURING',     '2026-02-06 15:00:00', 'Ananya Sen',           'Laser tape measurements registered.',              'c0000000-0000-0000-0000-000000000002'),
('82200000-0000-0000-0000-000000000003', '82000000-0000-0000-0000-000000000001', 'DESIGN_SKETCH', '2026-02-08 17:30:00', 'Farhan Siddiqui',      'Approved CAD technical illustration.',             'c0000000-0000-0000-0000-000000000002'),
('82200000-0000-0000-0000-000000000004', '82000000-0000-0000-0000-000000000001', 'SAMPLE_CUT',    '2026-02-12 11:30:00', 'Master Vikram Rathore','Mulberry silk yardage rotary cut.',                'c0000000-0000-0000-0000-000000000002');

INSERT INTO production_stages (
    id, order_id, stage_name, assigned_to, status, started_at, sort_order, notes, company_id
) VALUES
('82300000-0000-0000-0000-000000000001', '82000000-0000-0000-0000-000000000001', 'Muslin Drape & Block', 'e2000000-0000-0000-0000-000000000004', 'COMPLETED',   '2026-02-09 09:00:00', 1, 'Block pattern draping verified on dummy.', 'c0000000-0000-0000-0000-000000000002'),
('82300000-0000-0000-0000-000000000002', '82000000-0000-0000-0000-000000000001', 'Hand Tailoring & Sew',  'e2000000-0000-0000-0000-000000000004', 'IN_PROGRESS', '2026-02-14 10:00:00', 2, 'French seam stitching in progress.',         'c0000000-0000-0000-0000-000000000002');

-- QC Checklists
INSERT INTO qc_checklists (
    id, order_id, check_point, result, checked_by, checked_at, remarks, sort_order, company_id
) VALUES
('82400000-0000-0000-0000-000000000001', '82000000-0000-0000-0000-000000000003', 'Shoulder Slope & Lapel Rollline', 'PASSED', 'e2000000-0000-0000-0000-000000000006', '2026-02-24 16:00:00', 'Clean shoulder drape with zero puckering.', 1, 'c0000000-0000-0000-0000-000000000002'),
('82400000-0000-0000-0000-000000000002', '82000000-0000-0000-0000-000000000003', 'Hand Buttonhole Stitching',       'PASSED', 'e2000000-0000-0000-0000-000000000006', '2026-02-24 16:30:00', 'MOP buttons secured with waxed silk thread.',2, 'c0000000-0000-0000-0000-000000000002');

-- Trials & Alterations
INSERT INTO trials (
    id, trial_code, order_id, order_code, customer_mobile, customer_name,
    garment_type, collection, trial_date, trial_time, stage, status,
    fit_status, designer_name, delivery_date, fit_preference, customer_feedback,
    trial_attempt, alteration_count, branch, company_id
) VALUES
('92000000-0000-0000-0000-000000000001', 'TRL-SKT-001', '82000000-0000-0000-0000-000000000001', 'ORD-SKT-001', '+91 98202 22001', 'Sunita Rao',         'Cape Set',  'Astral Silk: Sculpted Capes',       '2026-03-08', '04:00 PM', 'First Fitting', 'UPCOMING',  'PENDING', 'Ananya Sen',       '2026-03-20', 'Structured Tailored Fit',  'Fitting booked at BKC suite.', 1, 0, 'SKT-BKC',   'c0000000-0000-0000-0000-000000000002'),
('92000000-0000-0000-0000-000000000002', 'TRL-SKT-002', '82000000-0000-0000-0000-000000000002', 'ORD-SKT-002', '+91 98202 22002', 'Dr. Anjali Deshmukh', 'Saree Set', 'Nilambari: Botanical Indigo Silks', '2026-03-06', '02:00 PM', 'Second Fitting','TODAY',     'PENDING', 'Master Vikram Rathore','2026-03-28','Fluid Classical Drape',     'Blouse neckline needs 0.25 in tweak.', 1, 1, 'SKT-PUNE', 'c0000000-0000-0000-0000-000000000002'),
('92000000-0000-0000-0000-000000000003', 'TRL-SKT-003', '82000000-0000-0000-0000-000000000003', 'ORD-SKT-003', '+91 98202 22003', 'Kabir Mehta',        'Bandhgala', 'Kashmir Sonnet: Pashmina & Tussar', '2026-02-23', '05:30 PM', 'Final Fitting', 'COMPLETED', 'PERFECT', 'Farhan Siddiqui',  '2026-02-25', 'Slim Italian Cut',         'Client loved the natural tussar texture.', 1, 0, 'SKT-AND', 'c0000000-0000-0000-0000-000000000002');

INSERT INTO trial_alterations (
    id, trial_id, description, category, completed, assigned_tailor, priority,
    target_date, tailor_notes, status, company_id
) VALUES
('92100000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000002', 'Ease neckline curve by 0.25 inch', 'Fit', FALSE, 'Master Vikram Rathore', 'Normal', '2026-03-09', 'Minor neck trim and re-hem.', 'PENDING', 'c0000000-0000-0000-0000-000000000002');

-- Payments & Transactions - omitting generated column balance
INSERT INTO payments (
    id, order_id, customer_mobile, total_amount, paid_amount, status, due_date, notes, company_id
) VALUES
('a2000000-0000-0000-0000-000000000001', '82000000-0000-0000-0000-000000000001', '+91 98202 22001', 68000.00, 34000.00, 'PARTIAL', '2026-03-20', 'Booking deposit 50% via Corporate Card.', 'c0000000-0000-0000-0000-000000000002'),
('a2000000-0000-0000-0000-000000000002', '82000000-0000-0000-0000-000000000002', '+91 98202 22002', 52000.00, 30000.00, 'PARTIAL', '2026-03-28', 'Advance paid at Pune atelier.',            'c0000000-0000-0000-0000-000000000002'),
('a2000000-0000-0000-0000-000000000003', '82000000-0000-0000-0000-000000000003', '+91 98202 22003', 46000.00, 46000.00, 'PAID',    '2026-02-25', 'Fully settled upon final dispatch.',          'c0000000-0000-0000-0000-000000000002'),
('a2000000-0000-0000-0000-000000000004', '82000000-0000-0000-0000-000000000004', '+91 98202 22004', 38000.00, 20000.00, 'PARTIAL', '2026-03-25', 'Advance payment via UPI at Vashi.',        'c0000000-0000-0000-0000-000000000002'),
('a2000000-0000-0000-0000-000000000005', '82000000-0000-0000-0000-000000000005', '+91 98202 22005', 42000.00, 22000.00, 'PARTIAL', '2026-04-05', 'Token advance paid at Thane store.',         'c0000000-0000-0000-0000-000000000002');

INSERT INTO payment_transactions (
    id, payment_id, amount, method, received_by, reference_no, notes, company_id
) VALUES
('a2100000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001', 34000.00, 'CREDIT_CARD', 'Ananya Sen',       'CC/AMEX/77401',     'Booking advance',     'c0000000-0000-0000-0000-000000000002'),
('a2100000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 30000.00, 'UPI',         'Master Vikram Rathore','UPI/PUN/88921',   'Pune advance token',  'c0000000-0000-0000-0000-000000000002'),
('a2100000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000003', 25000.00, 'BANK_TRANSFER','Farhan Siddiqui', 'NEFT/HDFC/3391',    'Initial token',       'c0000000-0000-0000-0000-000000000002'),
('a2100000-0000-0000-0000-000000000004', 'a2000000-0000-0000-0000-000000000003', 21000.00, 'UPI',         'Farhan Siddiqui', 'UPI/AND/10042',     'Final bill clearance','c0000000-0000-0000-0000-000000000002');

-- Designs (3) - omitting branch column
INSERT INTO designs (
    id, design_code, title, garment_type, order_id, status, designer,
    thumbnail_url, customer_mobile, collection, primary_fabric,
    estimated_cost, suggested_price, production_status, times_used,
    image_urls, notes, created_by, company_id
) VALUES
('d2000000-0000-0000-0000-000000000001', 'DES-SKT-001', 'Astral Handloom Sculpted Silk Cape', 'Cape Set',  '82000000-0000-0000-0000-000000000001', 'APPROVED', 'Ananya Sen',       'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80', '+91 98202 22001', 'Astral Silk: Sculpted Capes',       'Pure Mulberry Silk', 22000.00, 68000.00, 'Active', 10, '["https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80"]', 'Asymmetrical tailored drape with inner corset.', 'Ananya Sen', 'c0000000-0000-0000-0000-000000000002'),
('d2000000-0000-0000-0000-000000000002', 'DES-SKT-002', 'Nilambari Organic Indigo Silk Kurta', 'Kurta Set', '82000000-0000-0000-0000-000000000004', 'APPROVED', 'Ananya Sen',       'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=400&q=80', '+91 98202 22004', 'Nilambari: Botanical Indigo Silks', 'Silk-Cotton Chanderi', 14000.00, 38000.00, 'Active', 14, '["https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80"]', 'Pleated front panel with hand kantha details.', 'Ananya Sen', 'c0000000-0000-0000-0000-000000000002'),
('d2000000-0000-0000-0000-000000000003', 'DES-SKT-003', 'Textured Tussar Bandhgala Jacket',   'Bandhgala', '82000000-0000-0000-0000-000000000003', 'APPROVED', 'Farhan Siddiqui', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80', '+91 98202 22003', 'Kashmir Sonnet: Pashmina & Tussar', 'Wild Tussar Ahimsa Silk', 18000.00, 46000.00, 'Active', 18, '["https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"]', 'Classic tailored cut with MOP button accents.', 'Farhan Siddiqui', 'c0000000-0000-0000-0000-000000000002');

-- Appointments (3)
INSERT INTO appointments (
    id, order_id, appt_type, scheduled_at, duration_minutes, status,
    staff_assigned, notes, customer_mobile, company_id
) VALUES
('b2100000-0000-0000-0000-000000000001', '82000000-0000-0000-0000-000000000001', 'FIRST_TRIAL', '2026-03-08 16:00:00', 45, 'SCHEDULED', 'Ananya Sen',            'Bespoke fitting in VIP suite at BKC.',           '+91 98202 22001', 'c0000000-0000-0000-0000-000000000002'),
('b2100000-0000-0000-0000-000000000002', '82000000-0000-0000-0000-000000000002', 'FIRST_TRIAL', '2026-03-06 14:00:00', 45, 'SCHEDULED', 'Master Vikram Rathore', 'Second fitting session at Koregaon Park villa.', '+91 98202 22002', 'c0000000-0000-0000-0000-000000000002'),
('b2100000-0000-0000-0000-000000000003', NULL,                                  'CONSULTATION','2026-03-10 11:30:00', 60, 'SCHEDULED', 'Meenakshi Sundaram',   'Vashi customer style exploration appointment.',  '+91 98202 22004', 'c0000000-0000-0000-0000-000000000002');

-- ==============================================================================
-- MASTER SEED SCRIPT: PART 3 - COMPANY 3 (NOVASTITCH STUDIO - 2 BRANCHES) & COMMIT
-- ==============================================================================

-- Company 3 Settings (Strictly Isolated Model: all sharing flags FALSE)
INSERT INTO company_settings (
    id, company_name, short_name, tagline, owner_name, business_type,
    gstin, pan_number, primary_phone, whatsapp, email, website,
    street_address, city, state, pin_code, country, logo_base64,
    share_customers_across_branches, share_orders_across_branches,
    share_enquiries_across_branches, share_measurements_across_branches,
    share_inventory_across_branches, share_garments_across_branches,
    share_trials_across_branches
) VALUES (
    'c0000000-0000-0000-0000-000000000003',
    'NovaStitch Studio',
    'NOVASTITCH',
    'Avant-Garde Fusion Couture & Precision Corsetry',
    'Tarun Varma & Shalini Reddy',
    'Contemporary Fusion Studio',
    '36CCCCA2222C1Z8',
    'CCCCA2222C',
    '+91 40 2355 7700',
    '+91 98203 33000',
    'studio@novastitchstudio.com',
    'https://novastitchstudio.com',
    'Plot 820, Road No. 36, Jubilee Hills',
    'Hyderabad',
    'Telangana',
    '500033',
    'India',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
    FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE
);

-- Branches (2)
INSERT INTO branches (
    id, branch_code, name, type, street_address, city, state, pin_code,
    country, phone, whatsapp, email, is_headquarters, active, working_hours, company_id
) VALUES
('b3000000-0000-0000-0000-000000000001', 'NVS-HYD', 'Jubilee Hills Flagship',   'FLAGSHIP', 'Plot 820, Road 36, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', 'India', '+91 40 2355 7701', '+91 98203 33001', 'hyd@novastitchstudio.com', TRUE,  TRUE, 'Mon-Sat 10:00-20:00', 'c0000000-0000-0000-0000-000000000003'),
('b3000000-0000-0000-0000-000000000002', 'NVS-SEC', 'Secunderabad Parade Villa', 'STUDIO',   '18 Sardar Patel Road, Paradise Circle', 'Secunderabad', 'Telangana', '500003', 'India', '+91 40 2780 4400', '+91 98203 33002', 'sec@novastitchstudio.com', FALSE, TRUE, 'Mon-Sat 10:00-21:00', 'c0000000-0000-0000-0000-000000000003');

-- Employees (4)
INSERT INTO employees (
    id, employee_code, name, phone, email, role, status, joined_date,
    avatar_url, specialization, company_id
) VALUES
('e3000000-0000-0000-0000-000000000001', 'EMP-NVS-001', 'Tarun Varma',       '+91 98400 33001', 'tarun@novastitchstudio.com',   'DESIGNER', 'ACTIVE', '2021-04-10', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', 'Architectural Corsets & Fusion Gowns', 'c0000000-0000-0000-0000-000000000003'),
('e3000000-0000-0000-0000-000000000002', 'EMP-NVS-002', 'Shalini Reddy',     '+91 98400 33002', 'shalini@novastitchstudio.com', 'TAILOR',   'ACTIVE', '2021-08-01', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80', 'Spiral Steel Boning & Molded Cups',   'c0000000-0000-0000-0000-000000000003'),
('e3000000-0000-0000-0000-000000000003', 'EMP-NVS-003', 'Sai Krishna',       '+91 98400 33003', 'sai@novastitchstudio.com',     'ARTISAN',  'ACTIVE', '2022-03-15', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80', '3D Draping & Pre-Pleated Pallus',    'c0000000-0000-0000-0000-000000000003'),
('e3000000-0000-0000-0000-000000000004', 'EMP-NVS-004', 'Manisha Rao',       '+91 98400 33004', 'manisha@novastitchstudio.com', 'QC',       'ACTIVE', '2022-11-20', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80', 'Stress-Point Tension & Seam Audits',  'c0000000-0000-0000-0000-000000000003');

UPDATE branches SET manager_id = 'e3000000-0000-0000-0000-000000000001' WHERE id = 'b3000000-0000-0000-0000-000000000001';
UPDATE branches SET manager_id = 'e3000000-0000-0000-0000-000000000002' WHERE id = 'b3000000-0000-0000-0000-000000000002';

-- Users (1) - Company Owner (Default System User)
INSERT INTO app_users (
    id, username, password_hash, full_name, role, active, email, phone,
    avatar_url, designation, department, assigned_branch, company_id
) VALUES
('13000000-0000-0000-0000-000000000001', 'novastitch_admin',    '$2a$10$xSIrpfakrLDjoPKviQyKR.ASqQ/TQFfjqBsR4ViPf3hdBWx/.jC3a', 'Tarun Varma',  'OWNER',    TRUE, 'tarun@novastitchstudio.com',   '+91 98203 33000', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', 'Creative Director & Co-Founder', 'Executive',  'NVS-HYD', 'c0000000-0000-0000-0000-000000000003');

-- User Profiles (1)
INSERT INTO user_profiles (
    id, user_id, full_name, display_title, department, email, phone,
    assigned_branch, clearance_level, system_role_label, privileges_summary,
    avatar_url, company_id
) VALUES
('23000000-0000-0000-0000-000000000001', '13000000-0000-0000-0000-000000000001', 'Tarun Varma',   'Creative Director & Co-Founder', 'Executive',  'tarun@novastitchstudio.com',   '+91 98203 33000', 'NVS-HYD', 'Tier 1 (Executive)', 'Company Owner', 'Full Studio Administrative Control', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', 'c0000000-0000-0000-0000-000000000003');

-- Pipeline Stages for Company 3 (8)
INSERT INTO stage_definitions (
    id, stage_key, display_name, description, required_role, dept_label,
    color_class, sort_order, active, image_url, company_id
) VALUES
('33000000-0000-0000-0000-000000000001', 'ORDER_TAKEN',   'Concept Consultation',  'Silhouette brief, custom corset bone mapping & deposit', 'STAFF', 'Concept Studio', 'badge-primary', 10, TRUE, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000003'),
('33000000-0000-0000-0000-000000000002', 'MEASURING',     'Anatomical Scan & Fit', 'Bustier curve, apex angle & rib cage measurement',      'DESIGNER', 'Bespoke Booth', 'badge-info', 20, TRUE, 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000003'),
('33000000-0000-0000-0000-000000000003', 'CAD_PATTERN',   'Vector Pattern CAD',    'Algorithmic pattern grading with tension allowances',   'DESIGNER', 'CAD Lab',       'badge-primary', 30, TRUE, 'https://images.unsplash.com/photo-1528458876885-5b6eacdd3671?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000003'),
('33000000-0000-0000-0000-000000000004', 'CORSET_BONING', 'Spiral Steel Channeling', 'Insertion of memory steel bones into twill tape channels', 'TAILOR', 'Boning Desk',  'badge-warning', 40, TRUE, 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000003'),
('33000000-0000-0000-0000-000000000005', 'FITTING_TRIAL', 'Corset Cinch Trial',    'Checking waist reduction, bust support & breathing ease', 'DESIGNER', 'Fitting Chamber', 'badge-purple', 50, TRUE, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000003'),
('33000000-0000-0000-0000-000000000006', 'CONSTRUCTION',  'Outer Shell Draping',   'Liquid organza hand-pleating over structured foundation','TAILOR', 'Assembly Studio','badge-dark',   60, TRUE, 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000003'),
('33000000-0000-0000-0000-000000000007', 'QC_PRESS',      'High Pressure Finish',  'Industrial vacuum table press & zip tensile stress test', 'QC', 'QC Station',   'badge-success', 70, TRUE, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000003'),
('33000000-0000-0000-0000-000000000008', 'FINAL_DISPATCH','Runway Ready Packaging', 'Magnetic luxury hardbox packaging with satin garment hanger', 'STAFF', 'Concierge Desk', 'badge-success', 80, TRUE, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80', 'c0000000-0000-0000-0000-000000000003');

-- Collections (3)
INSERT INTO collections (
    id, code, name, subtitle, description, season, year, status, designer,
    branch, launch_date, is_featured, cover_image_url, progress_percentage, company_id
) VALUES
('c3000000-0000-0000-0000-000000000001', 'NVS-SS26-CORSET',   'Metropolis: Corset Lehengas',       'Internal Spiral Steel Boning & Molded Silk Skirts', 'Futuristic bridal fusion engineered with Victorian steel corsetry and flowy silk chiffon skirts.', 'Spring/Summer', 2026, 'ACTIVE', 'Tarun Varma', 'NVS-HYD', '2026-01-20', TRUE, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80', 75, 'c0000000-0000-0000-0000-000000000003'),
('c3000000-0000-0000-0000-000000000002', 'NVS-FW26-PANTSUIT', 'Empress Line: Power Jumpsuits',    'Architectural Shoulder Pads & Pochampally Ikat Accents', 'Sharply tailored power dressing featuring geometric handwoven textiles from Pochampally.', 'Autumn/Winter', 2026, 'ACTIVE', 'Tarun Varma', 'NVS-SEC', '2026-08-10', TRUE, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', 45, 'c0000000-0000-0000-0000-000000000003'),
('c3000000-0000-0000-0000-000000000003', 'NVS-CR26-DRAPES',   'Liquid Organza: Pre-Draped Sarees', 'Molten Lilac & Gunmetal Organza Drapes', 'Zero-fuss pre-stitched cocktail gowns with structured pleated pallus.', 'Resort/Cruise', 2026, 'ACTIVE', 'Shalini Reddy', 'NVS-HYD', '2026-03-05', FALSE, 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80', 60, 'c0000000-0000-0000-0000-000000000003');

-- Suppliers (2)
INSERT INTO suppliers (
    id, supplier_code, name, contact_person, phone, email, address, specialization, company_id
) VALUES
('f3000000-0000-0000-0000-000000000001', 'SUP-NVS-001', 'Pochampally Handloom Union', 'K. Mallesh Goud',   '+91 8685 244 112', 'orders@pochampallyunion.org', 'Weavers Colony, Bhoodan Pochampally, Telangana 508284', 'Double Ikat Silk & Geometric Handwoven Fabrics', 'c0000000-0000-0000-0000-000000000003'),
('f3000000-0000-0000-0000-000000000002', 'SUP-NVS-002', 'Haberdashery & Boning Works', 'Jahangir Hussain', '+91 40 2474 8830', 'sales@hyderabadboning.in',    'Chirag Ali Lane, Abids, Hyderabad, Telangana 500001', 'Spiral Steel Bones, Busks & Industrial Corsetry', 'c0000000-0000-0000-0000-000000000003');

-- Inventory Items (5) - omitting generated column available_qty
INSERT INTO inventory_items (
    id, item_code, name, category, variant, unit, stock_qty, reserved_qty,
    reorder_level, purchase_price, selling_price, supplier_name, image_url,
    status, composition, weave, width, origin, branch, company_id
) VALUES
('43000000-0000-0000-0000-000000000001', 'ITM-NVS-001', 'Pochampally Ikat Silk-Cotton (Monochrome)', 'Fabric', 'Monochrome Geo', 'Meter', 55.00, 15.00, 10.00, 1850.00, 3900.00, 'Pochampally Handloom Union', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', '60% Silk 40% Cotton', 'Double Ikat Tie-Dye', '44 inches', 'Pochampally', 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('43000000-0000-0000-0000-000000000002', 'ITM-NVS-002', 'Spiral Steel Corsetry Boning Ribs (50pc)',  'Trim',   'Galvanized Silver', 'Pack', 40.00, 10.00,  8.00, 1200.00, 2600.00, 'Haberdashery & Boning Works', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', 'Galvanized Spring Steel', 'Spiral Flexible', '6mm x 30cm', 'Hyderabad', 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('43000000-0000-0000-0000-000000000003', 'ITM-NVS-003', 'Shimmer Liquid Organza (Lilac Sheen)',      'Fabric', 'Lilac Iridescent',  'Meter', 70.00, 20.00, 12.00, 1400.00, 3100.00, 'Haberdashery & Boning Works', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', '100% Micro-Nylon/Silk', 'Fluid Liquid Weave', '54 inches', 'Surat', 'NVS-SEC', 'c0000000-0000-0000-0000-000000000003'),
('43000000-0000-0000-0000-000000000004', 'ITM-NVS-004', 'Heavy Structured Crepe Viscose (Onyx Black)','Fabric', 'Midnight Onyx',   'Meter', 60.00, 12.00, 10.00, 1100.00, 2400.00, 'Haberdashery & Boning Works', 'https://images.unsplash.com/photo-1528458876885-5b6eacdd3671?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', '96% Viscose 4% Elastane', 'Heavy Crepe Weave', '58 inches', 'Mumbai', 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('43000000-0000-0000-0000-000000000005', 'ITM-NVS-005', 'Invisible YKK Concealed Zippers (18-inch)',  'Trim',   'Assorted Neutrals', 'Pack', 35.00,  8.00,  5.00,  650.00, 1500.00, 'Haberdashery & Boning Works', 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=400&q=80', 'IN_STOCK', 'High Tensile Nylon Coil', 'Concealed Lock', '18 inches', 'Japan', 'NVS-SEC', 'c0000000-0000-0000-0000-000000000003');

-- Purchase Orders & Items
INSERT INTO purchase_orders (
    id, po_code, supplier_id, status, total_amount, order_date, expected_date, notes, company_id
) VALUES
('53000000-0000-0000-0000-000000000001', 'PO-NVS-001', 'f3000000-0000-0000-0000-000000000001', 'RECEIVED', 74000.00, '2026-01-28', '2026-02-15', 'Spring/Summer geometric Pochampally silk yardage', 'c0000000-0000-0000-0000-000000000003');

INSERT INTO purchase_order_items (
    id, po_id, item_id, item_name, quantity, unit, unit_price, received_qty, company_id
) VALUES
('53100000-0000-0000-0000-000000000001', '53000000-0000-0000-0000-000000000001', '43000000-0000-0000-0000-000000000001', 'Pochampally Ikat Silk-Cotton (Monochrome)', 40.00, 'Meter', 1850.00, 40.00, 'c0000000-0000-0000-0000-000000000003');

-- Customers (4)
INSERT INTO customers (
    mobile_number, name, first_name, last_name, salutation, gender, email,
    location, street_address, city, state, pincode, tier, total_spend, balance,
    favorite_garment, measurements_on_file, fit_preference, preferred_neck,
    preferred_sleeve, preferred_occasions, preferred_channel, avatar_url,
    branch, company_id
) VALUES
('+91 98203 33001', 'Samantha Ruth',    'Samantha', 'Ruth',    'Ms.',  'Female', 'samantha.ruth@cinema.in',     'Jubilee Hills, Hyderabad', 'Villa 44, Road 45, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', 'VIP',     92000.00, 46000.00, 'Corset Lehenga Choli',     TRUE, 'Ultra Hourglass Cinch',   'Sweetheart Corset Neck', 'Sleeveless Structured Straps', 'Film Award Nights & Gala', 'WhatsApp', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('+91 98203 33002', 'Swathi Varma',     'Swathi',   'Varma',   'Dr.',  'Female', 'swathi.varma@apollo.org',     'Paradise, Secunderabad', 'Flat 304, Sapphire Apts, PG Road', 'Secunderabad', 'Telangana', '500003', 'VIP',      58000.00, 24000.00, 'Pre-Draped Organza Saree',  TRUE, 'Draped Fluid Contemporary', 'Plunging V-Neckline',    'Full Bishop Organza Sleeve', 'Sangeet Cocktails & Soirees', 'WhatsApp', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80', 'NVS-SEC', 'c0000000-0000-0000-0000-000000000003'),
('+91 98203 33003', 'Akhil Akkineni',   'Akhil',    'Akkineni','Mr.',  'Male',   'akhil.akkineni@studio.com',   'Banjara Hills, Hyderabad', 'Road No. 12, Banjara Hills', 'Hyderabad', 'Telangana', '500034', 'REGULAR',  64000.00,     0.00, 'Onyx Tuxedo Jacket',      TRUE, 'Architectural Sharp Cut',  'Satin Peak Lapel',       'Double Button Tailored Cuff', 'Red Carpet Premieres',     'WhatsApp', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('+91 98203 33004', 'Niharika Rao',     'Niharika', 'Rao',     'Ms.',  'Female', 'niharika.rao@legal.in',       'Marredpally, Secunderabad', 'House 55, West Marredpally', 'Secunderabad', 'Telangana', '500026', 'PREMIUM',  45000.00, 20000.00, 'Ikat Tailored Pantsuit',   TRUE, 'Power Tailored Silhouette','Structured Notch Lapel', 'Tailored Wrist Cut',         'Corporate Boardroom & Summit', 'WhatsApp', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80', 'NVS-SEC', 'c0000000-0000-0000-0000-000000000003');

-- Body Measurements
INSERT INTO customer_body_measurements (
    id, customer_mobile, customer_name, garment_type, measurement_type, is_current,
    version, unit, shoulder, bust, under_bust, waist, hip, blouse_length,
    armhole, sleeve_length, front_neck_depth, back_neck_depth, recorded_by, company_id
) VALUES
('63000000-0000-0000-0000-000000000001', '+91 98203 33001', 'Samantha Ruth',  'Corset',   'CURRENT', TRUE, 1, 'in', 14.25, 34.50, 28.50, 25.50, 36.50, 16.00, 15.50,  0.00, 7.50, 12.00, 'Tarun Varma',   'c0000000-0000-0000-0000-000000000003'),
('63000000-0000-0000-0000-000000000002', '+91 98203 33002', 'Swathi Varma',   'Saree Gown','CURRENT', TRUE, 1, 'in', 14.75, 36.00, 30.00, 28.00, 38.00, 56.00, 16.50, 24.00, 8.50,  9.00, 'Shalini Reddy', 'c0000000-0000-0000-0000-000000000003'),
('63000000-0000-0000-0000-000000000003', '+91 98203 33003', 'Akhil Akkineni', 'Tuxedo',   'CURRENT', TRUE, 1, 'in', 18.25, 41.00, 36.50, 33.50, 40.00, 31.00, 19.50, 26.00, 3.00,  1.50, 'Tarun Varma',   'c0000000-0000-0000-0000-000000000003'),
('63000000-0000-0000-0000-000000000004', '+91 98203 33004', 'Niharika Rao',   'Pantsuit', 'CURRENT', TRUE, 1, 'in', 15.00, 37.00, 31.00, 29.50, 39.00, 28.00, 17.00, 23.00, 8.00,  4.00, 'Shalini Reddy', 'c0000000-0000-0000-0000-000000000003');

INSERT INTO customer_measurements (
    id, customer_mobile, garment_type, bust, waist, full_hip, shoulder,
    sleeve_length, armhole, front_neck, back_neck, garment_length,
    recorded_by, is_active_profile, company_id
) VALUES
('63100000-0000-0000-0000-000000000001', '+91 98203 33001', 'Corset',    34.50, 25.50, 36.50, 14.25,  0.00, 15.50, 7.50, 12.00, 16.00, 'Tarun Varma',   TRUE, 'c0000000-0000-0000-0000-000000000003'),
('63100000-0000-0000-0000-000000000002', '+91 98203 33002', 'Saree Gown',36.00, 28.00, 38.00, 14.75, 24.00, 16.50, 8.50,  9.00, 56.00, 'Shalini Reddy', TRUE, 'c0000000-0000-0000-0000-000000000003'),
('63100000-0000-0000-0000-000000000003', '+91 98203 33003', 'Tuxedo',    41.00, 33.50, 40.00, 18.25, 26.00, 19.50, 3.00,  1.50, 31.00, 'Tarun Varma',   TRUE, 'c0000000-0000-0000-0000-000000000003'),
('63100000-0000-0000-0000-000000000004', '+91 98203 33004', 'Pantsuit',  37.00, 29.50, 39.00, 15.00, 23.00, 17.00, 8.00,  4.00, 28.00, 'Shalini Reddy', TRUE, 'c0000000-0000-0000-0000-000000000003');

INSERT INTO measurement_profiles (
    id, customer_mobile, garment_type, recorded_by, notes, branch, company_id
) VALUES
('63200000-0000-0000-0000-000000000001', '+91 98203 33001', 'Architectural Corset Lehenga', 'Tarun Varma',   'Waist reduction target 2 inches; 14 spiral steel bones mapped.', 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('63200000-0000-0000-0000-000000000002', '+91 98203 33002', 'Liquid Pre-Draped Saree',      'Shalini Reddy', 'Floor-length front slit with built-in satin underskirt.',       'NVS-SEC', 'c0000000-0000-0000-0000-000000000003');

-- Enquiries (3)
INSERT INTO enquiries (
    id, enquiry_code, customer_name, phone, email, garment_type, notes,
    status, assigned_to, occasion, estimated_budget, source, avatar_url,
    branch, company_id
) VALUES
('73000000-0000-0000-0000-000000000001', 'ENQ-NVS-001', 'Samantha Ruth',    '+91 98203 33001', 'samantha.ruth@cinema.in',     'Corset Lehenga', 'Red carpet gala ensemble with structured internal corset.', 'CONVERTED', 'Tarun Varma',   'Awards Ceremony', 100000.00, 'REFERRAL',  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('73000000-0000-0000-0000-000000000002', 'ENQ-NVS-002', 'Pooja Hegde',      '+91 98203 33005', 'pooja.hegde@films.com',        'Fusion Jumpsuit','Jubilee Hills studio visit looking for structured cape jumpsuit.', 'CONTACTED', 'Tarun Varma',   'Sangeet Party',   55000.00, 'WALK_IN',   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80', 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('73000000-0000-0000-0000-000000000003', 'ENQ-NVS-003', 'Varun Tej Konidela','+91 98203 33006', 'varun.tej@production.in',     'Modern Bandhgala','Secunderabad atelier phone enquiry on structured Pochampally collar.', 'PENDING', 'Shalini Reddy', 'Reception',       60000.00, 'PHONE',     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', 'NVS-SEC', 'c0000000-0000-0000-0000-000000000003');

-- Orders (4 - distributed across 2 branches)
INSERT INTO orders (
    id, order_code, garment_type, garment_desc, collection, amount, status,
    order_date, due_date, customer_mobile, customer_name, expected_delivery_date,
    advance_paid, total_amount, balance_amount, current_stage, notes, branch, company_id
) VALUES
('83000000-0000-0000-0000-000000000001', 'ORD-NVS-001', 'Corset Lehenga', 'Structured Spiral-Boning Corset with metallic lace overlay and pleated metallic silk lehenga skirt.', 'Metropolis: Corset Lehengas', 92000.00, 'IN_PRODUCTION', '2026-02-08', '2026-03-22', '+91 98203 33001', 'Samantha Ruth',  '2026-03-22', 46000.00, 92000.00, 46000.00, 'CORSET_BONING', 'Red carpet express delivery priority.', 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('83000000-0000-0000-0000-000000000002', 'ORD-NVS-002', 'Pre-Draped Saree', 'Lilac Liquid Organza Pre-Stitched Saree Gown with cowl drape and structured satin shoulder wing.', 'Liquid Organza: Pre-Draped Sarees', 58000.00, 'IN_PRODUCTION', '2026-02-14', '2026-03-27', '+91 98203 33002', 'Swathi Varma',   '2026-03-27', 34000.00, 58000.00, 24000.00, 'FITTING_TRIAL', 'Fitting scheduled at Secunderabad atelier.', 'NVS-SEC', 'c0000000-0000-0000-0000-000000000003'),
('83000000-0000-0000-0000-000000000003', 'ORD-NVS-003', 'Tuxedo Jacket',   'Midnight Onyx Heavy Crepe Single-Breasted Tuxedo with satin shawl collar and Pochampally silk piping.', 'Empress Line: Power Jumpsuits', 64000.00, 'COMPLETED',     '2026-01-22', '2026-02-28', '+91 98203 33003', 'Akhil Akkineni', '2026-02-28', 64000.00, 64000.00,     0.00, 'QC_PRESS',      'Full payment settled on handover.',     'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('83000000-0000-0000-0000-000000000004', 'ORD-NVS-004', 'Ikat Pantsuit',   'Monochrome Geometric Handwoven Ikat Blazer with high-waist cigarette trousers.', 'Empress Line: Power Jumpsuits', 45000.00, 'PENDING',       '2026-02-26', '2026-04-02', '+91 98203 33004', 'Niharika Rao',   '2026-04-02', 25000.00, 45000.00, 20000.00, 'MEASURING',     'Requires custom shoulder pad thickness.', 'NVS-SEC', 'c0000000-0000-0000-0000-000000000003');

UPDATE enquiries SET converted_order_id = '83000000-0000-0000-0000-000000000001' WHERE id = '73000000-0000-0000-0000-000000000001';

-- Garments (4)
INSERT INTO garments (
    id, garment_code, order_id, order_code, customer_name, customer_mobile,
    title, garment_type, collection_name, production_stage, material_status,
    priority, payment_status, paid_amount, total_amount, status,
    assigned_to, designer, due_date, image_url, branch, company_id
) VALUES
('83100000-0000-0000-0000-000000000001', 'GAR-NVS-001', '83000000-0000-0000-0000-000000000001', 'ORD-NVS-001', 'Samantha Ruth',  '+91 98203 33001', 'Metropolis Structured Corset Lehenga', 'Corset Lehenga', 'Metropolis: Corset Lehengas',       'CORSET_BONING', 'READY', 'HIGH',   'PARTIAL', 46000.00, 92000.00, 'IN_PRODUCTION', 'Shalini Reddy', 'Tarun Varma',   '2026-03-22', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80', 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('83100000-0000-0000-0000-000000000002', 'GAR-NVS-002', '83000000-0000-0000-0000-000000000002', 'ORD-NVS-002', 'Swathi Varma',   '+91 98203 33002', 'Lilac Liquid Organza Pre-Draped Saree','Pre-Draped Saree','Liquid Organza: Pre-Draped Sarees', 'FITTING_TRIAL', 'READY', 'NORMAL', 'PARTIAL', 34000.00, 58000.00, 'IN_PRODUCTION', 'Sai Krishna',   'Shalini Reddy', '2026-03-27', 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80', 'NVS-SEC', 'c0000000-0000-0000-0000-000000000003'),
('83100000-0000-0000-0000-000000000003', 'GAR-NVS-003', '83000000-0000-0000-0000-000000000003', 'ORD-NVS-003', 'Akhil Akkineni', '+91 98203 33003', 'Midnight Onyx Bespoke Tuxedo',       'Tuxedo Jacket',   'Empress Line: Power Jumpsuits',    'QC_PRESS',      'READY', 'NORMAL', 'PAID',    64000.00, 64000.00, 'COMPLETED',     'Shalini Reddy', 'Tarun Varma',   '2026-02-28', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('83100000-0000-0000-0000-000000000004', 'GAR-NVS-004', '83000000-0000-0000-0000-000000000004', 'ORD-NVS-004', 'Niharika Rao',   '+91 98203 33004', 'Monochrome Ikat Tailored Pantsuit',    'Ikat Pantsuit',   'Empress Line: Power Jumpsuits',    'MEASURING',     'READY', 'NORMAL', 'PARTIAL', 25000.00, 45000.00, 'IN_PRODUCTION', 'Shalini Reddy', 'Tarun Varma',   '2026-04-02', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80', 'NVS-SEC', 'c0000000-0000-0000-0000-000000000003');

-- Order Progress Stages & Production Stages
INSERT INTO order_progress_stages (
    id, order_id, stage, completed_at, completed_by, notes, company_id
) VALUES
('83200000-0000-0000-0000-000000000001', '83000000-0000-0000-0000-000000000001', 'ORDER_TAKEN', '2026-02-08 11:00:00', 'Tarun Varma',   'Red carpet consultation logged.',              'c0000000-0000-0000-0000-000000000003'),
('83200000-0000-0000-0000-000000000002', '83000000-0000-0000-0000-000000000001', 'MEASURING',   '2026-02-09 16:30:00', 'Tarun Varma',   'Rib cage & torso precision contours mapped.',  'c0000000-0000-0000-0000-000000000003'),
('83200000-0000-0000-0000-000000000003', '83000000-0000-0000-0000-000000000001', 'CAD_PATTERN', '2026-02-12 18:00:00', 'Tarun Varma',   '14-bone corset layout digitized.',             'c0000000-0000-0000-0000-000000000003');

INSERT INTO production_stages (
    id, order_id, stage_name, assigned_to, status, started_at, sort_order, notes, company_id
) VALUES
('83300000-0000-0000-0000-000000000001', '83000000-0000-0000-0000-000000000001', 'Corset Twill Layer', 'e3000000-0000-0000-0000-000000000002', 'COMPLETED',   '2026-02-13 10:00:00', 1, 'Twill inner foundation cut & stitched.',   'c0000000-0000-0000-0000-000000000003'),
('83300000-0000-0000-0000-000000000002', '83000000-0000-0000-0000-000000000001', 'Steel Boning Mount', 'e3000000-0000-0000-0000-000000000002', 'IN_PROGRESS', '2026-02-16 11:30:00', 2, 'Spiral steel bones being inserted & capped.', 'c0000000-0000-0000-0000-000000000003');

-- QC Checklists
INSERT INTO qc_checklists (
    id, order_id, check_point, result, checked_by, checked_at, remarks, sort_order, company_id
) VALUES
('83400000-0000-0000-0000-000000000001', '83000000-0000-0000-0000-000000000003', 'Peak Lapel Silk Facing & Symmetry', 'PASSED', 'e3000000-0000-0000-0000-000000000004', '2026-02-27 15:00:00', 'Sharp peak lapel roll with immaculate facing.', 1, 'c0000000-0000-0000-0000-000000000003'),
('83400000-0000-0000-0000-000000000002', '83000000-0000-0000-0000-000000000003', 'Shoulder Canvas & Armhole Pitch',   'PASSED', 'e3000000-0000-0000-0000-000000000004', '2026-02-27 15:30:00', 'Clean shoulder expression and balanced drape.',2, 'c0000000-0000-0000-0000-000000000003');

-- Trials & Alterations
INSERT INTO trials (
    id, trial_code, order_id, order_code, customer_mobile, customer_name,
    garment_type, collection, trial_date, trial_time, stage, status,
    fit_status, designer_name, delivery_date, fit_preference, customer_feedback,
    trial_attempt, alteration_count, branch, company_id
) VALUES
('93000000-0000-0000-0000-000000000001', 'TRL-NVS-001', '83000000-0000-0000-0000-000000000001', 'ORD-NVS-001', '+91 98203 33001', 'Samantha Ruth',  'Corset Lehenga',   'Metropolis: Corset Lehengas',       '2026-03-10', '03:00 PM', 'Corset Cinch Trial', 'UPCOMING',  'PENDING', 'Tarun Varma',   '2026-03-22', 'Ultra Hourglass Cinch',   'VIP private session booked in Jubilee Hills.', 1, 0, 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003'),
('93000000-0000-0000-0000-000000000002', 'TRL-NVS-002', '83000000-0000-0000-0000-000000000002', 'ORD-NVS-002', '+91 98203 33002', 'Swathi Varma',   'Pre-Draped Saree', 'Liquid Organza: Pre-Draped Sarees', '2026-03-07', '04:30 PM', 'Drape Fitting',      'TODAY',     'PENDING', 'Shalini Reddy', '2026-03-27', 'Draped Fluid Contemporary','Pallu pleat drape length adjustment.', 1, 1, 'NVS-SEC', 'c0000000-0000-0000-0000-000000000003'),
('93000000-0000-0000-0000-000000000003', 'TRL-NVS-003', '83000000-0000-0000-0000-000000000003', 'ORD-NVS-003', '+91 98203 33003', 'Akhil Akkineni', 'Tuxedo Jacket',   'Empress Line: Power Jumpsuits',    '2026-02-26', '12:00 PM', 'Final Fitting',      'COMPLETED', 'PERFECT', 'Tarun Varma',   '2026-02-28', 'Architectural Sharp Cut',  'Exceptional silhouette, ready for premiere.', 1, 0, 'NVS-HYD', 'c0000000-0000-0000-0000-000000000003');

INSERT INTO trial_alterations (
    id, trial_id, description, category, completed, assigned_tailor, priority,
    target_date, tailor_notes, status, company_id
) VALUES
('93100000-0000-0000-0000-000000000001', '93000000-0000-0000-0000-000000000002', 'Lengthen pre-draped pallu tail by 1.5 inches', 'Drape', FALSE, 'Sai Krishna', 'High', '2026-03-10', 'Re-anchor shoulder snap fasteners.', 'PENDING', 'c0000000-0000-0000-0000-000000000003');

-- Payments & Transactions - omitting generated column balance
INSERT INTO payments (
    id, order_id, customer_mobile, total_amount, paid_amount, status, due_date, notes, company_id
) VALUES
('a3000000-0000-0000-0000-000000000001', '83000000-0000-0000-0000-000000000001', '+91 98203 33001', 92000.00, 46000.00, 'PARTIAL', '2026-03-22', '50% advance for red carpet bridal corset.', 'c0000000-0000-0000-0000-000000000003'),
('a3000000-0000-0000-0000-000000000002', '83000000-0000-0000-0000-000000000002', '+91 98203 33002', 58000.00, 34000.00, 'PARTIAL', '2026-03-27', 'Advance paid at Secunderabad atelier.',     'c0000000-0000-0000-0000-000000000003'),
('a3000000-0000-0000-0000-000000000003', '83000000-0000-0000-0000-000000000003', '+91 98203 33003', 64000.00, 64000.00, 'PAID',    '2026-02-28', 'Full settlement upon collection.',          'c0000000-0000-0000-0000-000000000003'),
('a3000000-0000-0000-0000-000000000004', '83000000-0000-0000-0000-000000000004', '+91 98203 33004', 45000.00, 25000.00, 'PARTIAL', '2026-04-02', 'Initial booking token for Ikat pantsuit.',    'c0000000-0000-0000-0000-000000000003');

INSERT INTO payment_transactions (
    id, payment_id, amount, method, received_by, reference_no, notes, company_id
) VALUES
('a3100000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001', 46000.00, 'BANK_TRANSFER','Tarun Varma',  'IMPS/ICIC/551092', 'Advance token for bridal corset', 'c0000000-0000-0000-0000-000000000003'),
('a3100000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000002', 34000.00, 'UPI',          'Shalini Reddy','UPI/HDFC/22091',   'Secunderabad advance token',       'c0000000-0000-0000-0000-000000000003'),
('a3100000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000003', 35000.00, 'CREDIT_CARD',  'Tarun Varma',  'CC/VISA/99410',    'Tuxedo advance payment',           'c0000000-0000-0000-0000-000000000003'),
('a3100000-0000-0000-0000-000000000004', 'a3000000-0000-0000-0000-000000000003', 29000.00, 'UPI',          'Tarun Varma',  'UPI/SBIN/88102',   'Final tuxedo balance payment',     'c0000000-0000-0000-0000-000000000003');

-- Designs (3) - omitting branch column
INSERT INTO designs (
    id, design_code, title, garment_type, order_id, status, designer,
    thumbnail_url, customer_mobile, collection, primary_fabric,
    estimated_cost, suggested_price, production_status, times_used,
    image_urls, notes, created_by, company_id
) VALUES
('d3000000-0000-0000-0000-000000000001', 'DES-NVS-001', 'Metropolis Structured Corset Gown',  'Corset Lehenga',  '83000000-0000-0000-0000-000000000001', 'APPROVED', 'Tarun Varma',   'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80', '+91 98203 33001', 'Metropolis: Corset Lehengas',       'Heavy Twill & Metallic Silk', 30000.00, 92000.00, 'Active',  8, '["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"]', '14-bone internal corsetry with sweetheart neckline.', 'Tarun Varma', 'c0000000-0000-0000-0000-000000000003'),
('d3000000-0000-0000-0000-000000000002', 'DES-NVS-002', 'Lilac Liquid Organza Pre-Draped Saree','Pre-Draped Saree','83000000-0000-0000-0000-000000000002', 'APPROVED', 'Shalini Reddy', 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80', '+91 98203 33002', 'Liquid Organza: Pre-Draped Sarees', 'Shimmer Liquid Organza',   19000.00, 58000.00, 'Active', 12, '["https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"]', 'Effortless pre-stitched cocktail evening saree.',   'Shalini Reddy', 'c0000000-0000-0000-0000-000000000003'),
('d3000000-0000-0000-0000-000000000003', 'DES-NVS-003', 'Empress Onyx Crepe Tuxedo',          'Tuxedo Jacket',   '83000000-0000-0000-0000-000000000003', 'APPROVED', 'Tarun Varma',   'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80', '+91 98203 33003', 'Empress Line: Power Jumpsuits',    'Heavy Crepe Viscose',        24000.00, 64000.00, 'Active', 16, '["https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"]', 'Sharp tuxedo silhouette with Ikat piping.',         'Tarun Varma', 'c0000000-0000-0000-0000-000000000003');

-- Appointments (2)
INSERT INTO appointments (
    id, order_id, appt_type, scheduled_at, duration_minutes, status,
    staff_assigned, notes, customer_mobile, company_id
) VALUES
('b3100000-0000-0000-0000-000000000001', '83000000-0000-0000-0000-000000000001', 'FIRST_TRIAL', '2026-03-10 15:00:00', 60, 'SCHEDULED', 'Tarun Varma',   'VIP Corsetry waist cinch trial in Jubilee Hills.', '+91 98203 33001', 'c0000000-0000-0000-0000-000000000003'),
('b3100000-0000-0000-0000-000000000002', '83000000-0000-0000-0000-000000000002', 'FIRST_TRIAL', '2026-03-07 16:30:00', 45, 'SCHEDULED', 'Shalini Reddy', 'Pre-draped pallu fitting at Secunderabad villa.',    '+91 98203 33002', 'c0000000-0000-0000-0000-000000000003');

-- ==============================================================================
-- FINAL COMMIT
-- ==============================================================================
COMMIT;

