-- ==============================================================================
-- Flyway Migration V16: Seed Real Database Enquiries Across Every Branch
-- Adds rich, dynamic bespoke atelier enquiries for all company branches
-- ==============================================================================

DO $$
DECLARE
    v_company_id UUID;
BEGIN
    -- Resolve company ID (either existing active tenant or fallback default)
    SELECT id INTO v_company_id FROM public.company_settings ORDER BY created_at ASC LIMIT 1;
    
    IF v_company_id IS NULL THEN
        v_company_id := '102d1813-5e51-4b7c-ae29-5240afb508de'::uuid;
    END IF;

    -- ==========================================================================
    -- 1. BRANCH 1: siva 2 (BRN-001)
    -- ==========================================================================
    INSERT INTO public.enquiries (
        id, company_id, branch, enquiry_code, customer_name, phone, email,
        garment_type, occasion, preferred_date, estimated_budget, source,
        status, assigned_to, follow_up_date, next_action, fabric_brought, notes, created_at, updated_at
    ) VALUES
    -- New enquiries
    ('e1000001-0000-0000-0000-000000000001'::uuid, v_company_id, 'BRN-001', 'ENQ-0201', 'Ananya Deshmukh', '+91 98450 11201', 'ananya.deshmukh@gmail.com',
     'Bridal Velvet Lehenga', 'Wedding Ceremony', '2026-11-20', 125000.00, 'INSTAGRAM',
     'NEW', 'Kavya', '2026-10-25', 'Schedule bridal consultation and shade selection', false,
     'Client inquired via Instagram DM for crimson velvet bridal lehenga with zardozi embroidery.', '2026-10-24 10:15:00', '2026-10-24 10:15:00'),

    ('e1000001-0000-0000-0000-000000000002'::uuid, v_company_id, 'BRN-001', 'ENQ-0202', 'Meera Subramanian', '+91 98450 11202', 'meera.subramanian@gmail.com',
     'Kanjeevaram Silk Saree Blouse', 'Temple Wedding', '2026-11-15', 32000.00, 'WALK_IN',
     'NEW', 'Siva Surya', '2026-10-26', 'Collect handloom silk swatches and discuss neckline', true,
     'Client brought pure gold tissue silk for high-neck bridal blouse with antique temple motifs.', '2026-10-23 14:30:00', '2026-10-23 14:30:00'),

    ('e1000001-0000-0000-0000-000000000003'::uuid, v_company_id, 'BRN-001', 'ENQ-0203', 'Rohan Singhania', '+91 98450 11203', 'rohan.singhania@yahoo.co.in',
     'Raw Silk Sherwani Set', 'Groom Sangeet', '2026-12-05', 85000.00, 'WEBSITE',
     'NEW', 'Kavya', '2026-10-27', 'Share digital lookbook and schedule trial slot', false,
     'Groom requested ivory raw silk sherwani with subtle tonal resham work and matching stole.', '2026-10-20 11:00:00', '2026-10-20 11:00:00'),

    -- In Discussion enquiries
    ('e1000001-0000-0000-0000-000000000004'::uuid, v_company_id, 'BRN-001', 'ENQ-0204', 'Tanvi Chordia', '+91 98450 11204', 'tanvi.chordia@gmail.com',
     'Organza Sangeet Anarkali', 'Sangeet Night', '2026-11-28', 58000.00, 'WALK_IN',
     'IN_DISCUSSION', 'Siva Surya', '2026-10-26', 'Finalize flare diameter and can-can layering', false,
     'Discussing pastel lilac organza flared silhouette with mirrorwork borders. Second visit planned.', '2026-10-18 16:45:00', '2026-10-22 17:00:00'),

    ('e1000001-0000-0000-0000-000000000005'::uuid, v_company_id, 'BRN-001', 'ENQ-0205', 'Varun Kulkarni', '+91 98450 11205', 'varun.k@techcorp.in',
     'Indo-Western Tuxedo', 'Reception Party', '2026-11-30', 48000.00, 'REFERRAL',
     'IN_DISCUSSION', 'Kavya', '2026-10-28', 'Review lapel satin contrast options with master cutter', false,
     'Referred by VIP customer. Wants contemporary midnight blue asymmetric bandhgala tuxedo.', '2026-10-12 12:20:00', '2026-10-21 15:30:00'),

    ('e1000001-0000-0000-0000-000000000006'::uuid, v_company_id, 'BRN-001', 'ENQ-0206', 'Kalyani Nambiar', '+91 98450 11206', 'kalyani.n@gmail.com',
     'Brocade Kurta & Sharara', 'Diwali Festive Gala', '2026-11-08', 42000.00, 'PHONE',
     'IN_DISCUSSION', 'Siva Surya', '2026-10-25', 'Confirm zari weave density and dupatta length', false,
     'Phone consultation completed. Client requested Banarasi meenakari brocade sharara set.', '2026-10-15 15:10:00', '2026-10-23 11:20:00'),

    -- Quotation Sent enquiries
    ('e1000001-0000-0000-0000-000000000007'::uuid, v_company_id, 'BRN-001', 'ENQ-0207', 'Pooja Venkatesh', '+91 98450 11207', 'pooja.v@outlook.com',
     'Contemporary Cocktail Gown', 'Engagement Cocktail', '2026-12-10', 75000.00, 'INSTAGRAM',
     'QUOTATION_SENT', 'Kavya', '2026-10-26', 'Follow up on quotation and fabric advance approval', false,
     'Quotation of ₹75,000 sent via WhatsApp and email for hand-draped emerald green satin gown.', '2026-10-08 17:00:00', '2026-10-22 18:00:00'),

    ('e1000001-0000-0000-0000-000000000008'::uuid, v_company_id, 'BRN-001', 'ENQ-0208', 'Aditya Hegde', '+91 98450 11208', 'aditya.hegde@gmail.com',
     'Handcrafted Silk Bandhgala', 'Brother Wedding', '2026-12-02', 52000.00, 'WALK_IN',
     'QUOTATION_SENT', 'Siva Surya', '2026-10-27', 'Awaiting color confirmation on charcoal grey silk', false,
     'Quotation sent with 2 styling variations. Client liked hand-carved silver metal buttons.', '2026-10-05 13:40:00', '2026-10-19 16:15:00'),

    -- Converted enquiries
    ('e1000001-0000-0000-0000-000000000009'::uuid, v_company_id, 'BRN-001', 'ENQ-0209', 'Nandini Swaminathan', '+91 98450 11209', 'nandini.s@swami.com',
     'Royal Zardozi Lehenga', 'Wedding Muhurtham', '2026-11-25', 165000.00, 'WALK_IN',
     'CONVERTED', 'Kavya', '2026-10-29', 'Converted to Order: ORD-2026-0881', false,
     'Successfully converted! Advance deposit received. Measurements taken and production card logged.', '2026-09-22 10:00:00', '2026-10-20 14:00:00'),

    ('e1000001-0000-0000-0000-000000000010'::uuid, v_company_id, 'BRN-001', 'ENQ-0210', 'Deepak Somany', '+91 98450 11210', 'deepak.somany@gmail.com',
     'Velvet Achkan Set', 'Reception Evening', '2026-12-18', 68000.00, 'REFERRAL',
     'CONVERTED', 'Siva Surya', '2026-11-05', 'Converted to Order: ORD-2026-0894', false,
     'Converted to production order. Premium black velvet achkan with French knot embroidery.', '2026-09-18 16:30:00', '2026-10-15 11:30:00'),

    -- Overdue Follow-up enquiry (Triggers Attention Alert)
    ('e1000001-0000-0000-0000-000000000011'::uuid, v_company_id, 'BRN-001', 'ENQ-0211', 'Ritika Sen', '+91 98450 11211', 'ritika.sen@gmail.com',
     'Chikankari Georgette Anarkali', 'Mehendi Ceremony', '2026-11-18', 45000.00, 'WEBSITE',
     'FOLLOW_UP', 'Kavya', '2026-10-21', 'Call client regarding delayed fabric dye sample confirmation', false,
     'Overdue follow-up! Sample dye swatch dispatched on 19th Oct. Awaiting client confirmation.', '2026-09-25 11:15:00', '2026-10-21 09:00:00'),

    -- Closed enquiry
    ('e1000001-0000-0000-0000-000000000012'::uuid, v_company_id, 'BRN-001', 'ENQ-0212', 'Suresh Balaji', '+91 98450 11212', 'suresh.b@balaji.com',
     'Custom Linen Kurta Set', 'Casual Festive', '2026-10-30', 18000.00, 'WALK_IN',
     'CLOSED', 'Siva Surya', NULL, 'Closed - Client opted for off-the-rack collection', false,
     'Client needed delivery in 48 hours which was outside bespoke tailoring lead times. Closed politely.', '2026-09-10 14:00:00', '2026-09-12 17:00:00')
    ON CONFLICT (enquiry_code) DO NOTHING;


    -- ==========================================================================
    -- 2. BRANCH 2: siva 3 (BRN-002)
    -- ==========================================================================
    INSERT INTO public.enquiries (
        id, company_id, branch, enquiry_code, customer_name, phone, email,
        garment_type, occasion, preferred_date, estimated_budget, source,
        status, assigned_to, follow_up_date, next_action, fabric_brought, notes, created_at, updated_at
    ) VALUES
    -- New enquiries
    ('e2000002-0000-0000-0000-000000000001'::uuid, v_company_id, 'BRN-002', 'ENQ-0301', 'Dr. Radhika Menon', '+91 98450 22301', 'radhika.menon@aiims.edu',
     'Tissue Silk Bridal Saree Blouse', 'Daughter Wedding', '2026-11-22', 38000.00, 'WALK_IN',
     'NEW', 'Siva Surya', '2026-10-25', 'Schedule in-person fitting and border alignment', true,
     'Walked in to siva 3 showroom. Brought pure gold tissue border with kundan stone accents.', '2026-10-24 11:30:00', '2026-10-24 11:30:00'),

    ('e2000002-0000-0000-0000-000000000002'::uuid, v_company_id, 'BRN-002', 'ENQ-0302', 'Karan Oberoi', '+91 98450 22302', 'karan.oberoi@oberoigroup.com',
     'Tussar Silk Jodhpuri Suit', 'Royal Reception', '2026-12-12', 72000.00, 'REFERRAL',
     'NEW', 'Kavya', '2026-10-26', 'Share digital fabric catalog and neckline options', false,
     'VIP referral from Oberoi Group. Requested hand-loomed forest green tussar silk bandhgala.', '2026-10-23 16:15:00', '2026-10-23 16:15:00'),

    ('e2000002-0000-0000-0000-000000000003'::uuid, v_company_id, 'BRN-002', 'ENQ-0303', 'Sneha Pillai', '+91 98450 22303', 'sneha.pillai@gmail.com',
     'Embroidered Organza Lehenga', 'Sister Sangeet', '2026-11-29', 88000.00, 'INSTAGRAM',
     'NEW', 'Siva Surya', '2026-10-27', 'Send preliminary sketch and budget breakdown', false,
     'Enquired on Instagram about blush pink lehenga with pearl and cutdana hand-embroidery.', '2026-10-21 09:40:00', '2026-10-21 09:40:00'),

    ('e2000002-0000-0000-0000-000000000004'::uuid, v_company_id, 'BRN-002', 'ENQ-0304', 'Vikramaditya Roy', '+91 98450 22304', 'vikram.roy@fintech.co',
     'Matka Silk Kurta & Bundi', 'Diwali Dinner', '2026-11-04', 35000.00, 'WEBSITE',
     'NEW', 'Kavya', '2026-10-25', 'Confirm chest & sleeve measurements via WhatsApp', false,
     'Booked online enquiry for rust orange handloom matka silk bundi jacket with thread work.', '2026-10-19 14:20:00', '2026-10-19 14:20:00'),

    -- In Discussion enquiries
    ('e2000002-0000-0000-0000-000000000005'::uuid, v_company_id, 'BRN-002', 'ENQ-0305', 'Archana Sundaram', '+91 98450 22305', 'archana.sundaram@gmail.com',
     'Zari Brocade Bridal Anarkali', 'Muhurtham Reception', '2026-11-19', 64000.00, 'WALK_IN',
     'IN_DISCUSSION', 'Siva Surya', '2026-10-26', 'Inspect custom dye sample on pure chanderi base', false,
     'Discussion in progress regarding ruby red color tone and border width. Client very enthusiastic.', '2026-10-16 11:45:00', '2026-10-22 15:00:00'),

    ('e2000002-0000-0000-0000-000000000006'::uuid, v_company_id, 'BRN-002', 'ENQ-0306', 'Pranav Kothari', '+91 98450 22306', 'pranav.k@kotharijewels.com',
     'Bespoke Sherwani with Stole', 'Groom Attire', '2026-12-08', 110000.00, 'PHONE',
     'IN_DISCUSSION', 'Kavya', '2026-10-28', 'Review master embroiderer swatches for antique gold zari', false,
     'Detailed phone discussion with groom. Wants royal vintage look to match bride lehenga.', '2026-10-14 17:30:00', '2026-10-23 12:00:00'),

    ('e2000002-0000-0000-0000-000000000007'::uuid, v_company_id, 'BRN-002', 'ENQ-0307', 'Lavanya Chettiar', '+91 98450 22307', 'lavanya.c@chettinad.org',
     'Raw Silk Peplum Blouse', 'Cocktail Evening', '2026-11-16', 28000.00, 'WALK_IN',
     'IN_DISCUSSION', 'Siva Surya', '2026-10-25', 'Measure armhole and back tie-up strings', true,
     'Client brought heirloom pure silk fabric. Selecting back tassels and pearl embellishments.', '2026-10-11 15:10:00', '2026-10-20 16:30:00'),

    -- Quotation Sent enquiries
    ('e2000002-0000-0000-0000-000000000008'::uuid, v_company_id, 'BRN-002', 'ENQ-0308', 'Gautam Singhal', '+91 98450 22308', 'gautam.s@singhal.com',
     'Italian Wool Tuxedo', 'Black Tie Sangeet', '2026-12-15', 55000.00, 'REFERRAL',
     'QUOTATION_SENT', 'Kavya', '2026-10-27', 'Awaiting confirmation on Super 140s wool selection', false,
     'Quotation sent for bespoke 3-piece tuxedo in Super 140s charcoal grey wool with satin shawl lapel.', '2026-10-06 10:20:00', '2026-10-21 17:15:00'),

    ('e2000002-0000-0000-0000-000000000009'::uuid, v_company_id, 'BRN-002', 'ENQ-0309', 'Aarthi Ramachandran', '+91 98450 22309', 'aarthi.ram@gmail.com',
     'Layered Georgette Sharara', 'Engagement Soiree', '2026-11-26', 49000.00, 'INSTAGRAM',
     'QUOTATION_SENT', 'Siva Surya', '2026-10-26', 'Send updated quote including gota patti dupatta', false,
     'Client requested revision of quotation to include extra hand-done gota patti border on dupatta.', '2026-10-04 14:00:00', '2026-10-18 11:00:00'),

    ('e2000002-0000-0000-0000-000000000010'::uuid, v_company_id, 'BRN-002', 'ENQ-0310', 'Rahul Mahajan', '+91 98450 22310', 'rahul.m@mahajan.in',
     'Velvet Waistcoat & Kurta', 'Festive Reception', '2026-11-12', 36000.00, 'WALK_IN',
     'QUOTATION_SENT', 'Kavya', '2026-10-28', 'Follow up on fitting appointment availability', false,
     'Quotation sent. Customer visited siva 3 store twice and loved the wine velvet sample.', '2026-10-02 16:30:00', '2026-10-17 14:45:00'),

    -- Converted enquiries
    ('e2000002-0000-0000-0000-000000000011'::uuid, v_company_id, 'BRN-002', 'ENQ-0311', 'Smita Chandrasekhar', '+91 98450 22311', 'smita.cs@gmail.com',
     'Grand Bridal Silk Lehenga', 'Royal Destination Wedding', '2026-12-01', 195000.00, 'WALK_IN',
     'CONVERTED', 'Siva Surya', '2026-11-01', 'Converted to Order: ORD-2026-0902', false,
     'Converted! Bridal order confirmed with 50% advance. 16-panel raw silk lehenga with real silver zari.', '2026-09-24 11:00:00', '2026-10-18 16:00:00'),

    ('e2000002-0000-0000-0000-000000000012'::uuid, v_company_id, 'BRN-002', 'ENQ-0312', 'Ashwin Narayanan', '+91 98450 22312', 'ashwin.n@narayan.org',
     'Pure Raw Silk Bandhgala', 'Brother Sangeet', '2026-11-24', 58000.00, 'REFERRAL',
     'CONVERTED', 'Kavya', '2026-10-31', 'Converted to Order: ORD-2026-0915', false,
     'Converted successfully. Pattern cutting scheduled for Monday morning with master tailor.', '2026-09-19 15:45:00', '2026-10-14 10:30:00'),

    -- Overdue Follow-up enquiry (Attention Alert)
    ('e2000002-0000-0000-0000-000000000013'::uuid, v_company_id, 'BRN-002', 'ENQ-0313', 'Meenakshi Iyer', '+91 98450 22313', 'meenakshi.iyer@gmail.com',
     'Chanderi Silk Festive Kurti', 'Diwali Puja', '2026-11-01', 26000.00, 'PHONE',
     'FOLLOW_UP', 'Siva Surya', '2026-10-22', 'Urgent call needed: Confirm sleeve length preference before cut', false,
     'Overdue follow-up! Client promised to confirm measurements by 22nd Oct. Still pending reply.', '2026-09-28 13:10:00', '2026-10-22 10:00:00'),

    -- Closed enquiry
    ('e2000002-0000-0000-0000-000000000014'::uuid, v_company_id, 'BRN-002', 'ENQ-0314', 'Venkatesh Rao', '+91 98450 22314', 'venkat.rao@gmail.com',
     'Cotton Kurta Pyjama Set', 'Pooja Ceremony', '2026-10-28', 12000.00, 'WALK_IN',
     'CLOSED', 'Kavya', NULL, 'Closed - Budget below couture minimum', false,
     'Client desired standard machine tailoring below our minimum bespoke benchmark. Closed amicably.', '2026-09-15 11:00:00', '2026-09-16 16:30:00')
    ON CONFLICT (enquiry_code) DO NOTHING;


    -- ==========================================================================
    -- 3. BRANCH 3: Main Branch
    -- ==========================================================================
    INSERT INTO public.enquiries (
        id, company_id, branch, enquiry_code, customer_name, phone, email,
        garment_type, occasion, preferred_date, estimated_budget, source,
        status, assigned_to, follow_up_date, next_action, fabric_brought, notes, created_at, updated_at
    ) VALUES
    -- New enquiries
    ('e3000003-0000-0000-0000-000000000001'::uuid, v_company_id, 'Main Branch', 'ENQ-0101', 'Sunita Yadav', '+91 98110 01001', 'sunita.yadav@gmail.com',
     'Hand-Embroidered Velvet Blouse', 'Temple Wedding Muhurtham', '2026-11-18', 34000.00, 'WALK_IN',
     'NEW', 'Kavya', '2026-10-25', 'Confirm back neckline deep cut and latkan tassels', true,
     'Main Branch patron. Provided antique Benarasi pure silk brocade for heavy bridal blouse.', '2026-10-24 09:30:00', '2026-10-24 09:30:00'),

    ('e3000003-0000-0000-0000-000000000002'::uuid, v_company_id, 'Main Branch', 'ENQ-0102', 'Priya Sharma', '+91 98110 01002', 'priya.sharma@gmail.com',
     'Crimson Bridal Lehenga Set', 'Grand Wedding', '2026-12-04', 145000.00, 'INSTAGRAM',
     'NEW', 'Siva Surya', '2026-10-26', 'Prepare 3D sketch and zardozi sample panel', false,
     'Enquired on official Instagram handle. Wants 24-kali flared bridal silhouette with double dupatta.', '2026-10-23 15:45:00', '2026-10-23 15:45:00'),

    ('e3000003-0000-0000-0000-000000000003'::uuid, v_company_id, 'Main Branch', 'ENQ-0103', 'Ananya Pandey', '+91 98110 01003', 'ananya.pandey@gmail.com',
     'Chikankari Pure Silk Anarkali', 'Sangeet Soiree', '2026-11-28', 72000.00, 'WEBSITE',
     'NEW', 'Kavya', '2026-10-27', 'Schedule measurement session at Main Branch atelier', false,
     'Online portal lead. Requested pure ivory georgette chikankari with mukaish work.', '2026-10-20 16:10:00', '2026-10-20 16:10:00'),

    -- In Discussion enquiries
    ('e3000003-0000-0000-0000-000000000004'::uuid, v_company_id, 'Main Branch', 'ENQ-0104', 'Ritu Srivastava', '+91 98110 01004', 'ritu.srivastava@gmail.com',
     'Festive Handloom Salwar Suit', 'Family Reception', '2026-11-14', 42000.00, 'WALK_IN',
     'IN_DISCUSSION', 'Siva Surya', '2026-10-25', 'Review collar design and pant pocket placements', false,
     'Second consultation in progress. Custom olive green chanderi silk suit with resham borders.', '2026-10-17 12:00:00', '2026-10-22 14:00:00'),

    ('e3000003-0000-0000-0000-000000000005'::uuid, v_company_id, 'Main Branch', 'ENQ-0105', 'Deepika Rai', '+91 98110 01005', 'deepika.rai@gmail.com',
     'Brocade Sherwani Set', 'Groom Attire', '2026-12-10', 92000.00, 'REFERRAL',
     'IN_DISCUSSION', 'Kavya', '2026-10-28', 'Review raw silk lining options and stole borders', false,
     'Referred by existing VIP patron. Discussing royal champagne gold brocade sherwani.', '2026-10-13 14:30:00', '2026-10-21 17:00:00'),

    ('e3000003-0000-0000-0000-000000000006'::uuid, v_company_id, 'Main Branch', 'ENQ-0106', 'Swati Joshi', '+91 98110 01006', 'swati.joshi@gmail.com',
     'Contemporary Cape Gown', 'Cocktail Night', '2026-11-20', 62000.00, 'PHONE',
     'IN_DISCUSSION', 'Siva Surya', '2026-10-26', 'Send final sketch with floor-length detachable cape', false,
     'Phone lead converted to atelier consultation. Cape design in French chantilly lace.', '2026-10-11 11:20:00', '2026-10-23 16:30:00'),

    -- Quotation Sent enquiries
    ('e3000003-0000-0000-0000-000000000007'::uuid, v_company_id, 'Main Branch', 'ENQ-0107', 'Neha Trivedi', '+91 98110 01007', 'neha.trivedi@gmail.com',
     'Velvet Embroidered Saree Blouse', 'Reception', '2026-11-16', 38000.00, 'WALK_IN',
     'QUOTATION_SENT', 'Kavya', '2026-10-26', 'Follow up on quotation and approve thread color swatches', true,
     'Quotation sent for ₹38,000 for deep maroon velvet blouse with gold bullion work. Client brought fabric.', '2026-10-07 15:40:00', '2026-10-21 12:15:00'),

    ('e3000003-0000-0000-0000-000000000008'::uuid, v_company_id, 'Main Branch', 'ENQ-0108', 'Divya Dubey', '+91 98110 01008', 'divya.dubey@gmail.com',
     'Organza Sangeet Lehenga', 'Sister Wedding', '2026-12-02', 82000.00, 'INSTAGRAM',
     'QUOTATION_SENT', 'Siva Surya', '2026-10-27', 'Awaiting advance deposit via UPI/bank transfer', false,
     'Detailed quotation sent. Includes customized handcrafted waist belt and matching potli bag.', '2026-10-03 16:00:00', '2026-10-19 15:00:00'),

    -- Converted enquiries
    ('e3000003-0000-0000-0000-000000000009'::uuid, v_company_id, 'Main Branch', 'ENQ-0109', 'Pooja Agarwal', '+91 98110 01009', 'pooja.agarwal@gmail.com',
     'Royal Banarasi Bridal Lehenga', 'Muhurtham Wedding', '2026-11-27', 175000.00, 'WALK_IN',
     'CONVERTED', 'Kavya', '2026-10-30', 'Converted to Order: ORD-2026-0865', false,
     'Converted! Full advance paid. Atelier master pattern created and cutting initiated.', '2026-09-21 11:00:00', '2026-10-16 16:00:00'),

    ('e3000003-0000-0000-0000-000000000010'::uuid, v_company_id, 'Main Branch', 'ENQ-0110', 'Meena Gupta', '+91 98110 01010', 'meena.gupta@gmail.com',
     'Silk Bandhgala & Breeches', 'Groom Reception', '2026-11-23', 54000.00, 'REFERRAL',
     'CONVERTED', 'Siva Surya', '2026-10-28', 'Converted to Order: ORD-2026-0872', false,
     'Order confirmed. First trial scheduled for 10th November at Main Branch VIP fitting room.', '2026-09-17 14:15:00', '2026-10-14 11:30:00'),

    -- Overdue Follow-up enquiry (Attention Alert)
    ('e3000003-0000-0000-0000-000000000011'::uuid, v_company_id, 'Main Branch', 'ENQ-0111', 'Kavya Mishra', '+91 98110 01011', 'kavya.mishra@gmail.com',
     'Bespoke Brocade Evening Jacket', 'Anniversary Celebration', '2026-11-10', 48000.00, 'WEBSITE',
     'FOLLOW_UP', 'Kavya', '2026-10-20', 'Call customer regarding confirmation of sleeve cuff embroidery style', false,
     'Overdue follow-up! Scheduled callback was 20th Oct. Client was travelling, follow up today.', '2026-09-26 12:45:00', '2026-10-20 10:00:00'),

    -- Closed enquiry
    ('e3000003-0000-0000-0000-000000000012'::uuid, v_company_id, 'Main Branch', 'ENQ-0112', 'Shivani Tiwari', '+91 98110 01012', 'shivani.tiwari@gmail.com',
     'Off-the-Rack Saree Alteration', 'Casual Event', '2026-10-29', 8500.00, 'WALK_IN',
     'CLOSED', 'Siva Surya', NULL, 'Closed - Transferred to Express Alterations counter', false,
     'Standard quick alteration request without bespoke styling. Redirected to front alterations desk.', '2026-09-12 10:30:00', '2026-09-14 15:00:00')
    ON CONFLICT (enquiry_code) DO NOTHING;

END $$;
