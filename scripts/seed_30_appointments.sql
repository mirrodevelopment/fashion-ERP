-- =============================================================================
-- HAULO BOUTIQUE ERP — SEED 30 APPOINTMENTS DATASET
-- Seeds 30 realistic appointments for Tamil Nadu boutique clientele:
-- - 8 appointments for Today (2026-09-16) across morning, afternoon, evening
-- - 14 appointments for Upcoming Next 7 Days (2026-09-17 to 2026-09-23)
-- - 8 historical appointments (Past 14 days, completed & cancelled)
-- =============================================================================

BEGIN;

-- Clear any existing appointments before seeding
TRUNCATE TABLE appointments CASCADE;

INSERT INTO appointments (
    id, customer_mobile, order_id, appt_type, scheduled_at, duration_minutes, status, staff_assigned, notes, created_at, updated_at
) VALUES

-- =============================================================================
-- TODAY'S APPOINTMENTS (8 APPOINTMENTS ON CURRENT_DATE: 2026-09-16)
-- =============================================================================
-- 1. Ananya Sundaram - Trial (Kanchipuram Saree Blouse)
(
    gen_random_uuid(), '+91 98401 12345',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0003' LIMIT 1),
    'TRIAL',
    CURRENT_DATE + time '10:00:00',
    45, 'CONFIRMED', 'Master Tailor Murugan',
    'Second trial for peacock blue brocade blouse. Check sleeve circumference and pearl edging.',
    now() - interval '3 days', now()
),

-- 2. Kaviya Shree - Measurement (Half Saree & Bridal Blouse)
(
    gen_random_uuid(), '+91 98404 45678',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0014' LIMIT 1),
    'MEASUREMENT',
    CURRENT_DATE + time '11:15:00',
    60, 'CONFIRMED', 'Senior Stylist Priya',
    'Bespoke bridal blouse measurements. Focus on sweetheart neckline depth and shoulder slope.',
    now() - interval '2 days', now()
),

-- 3. Meenakshi Natarajan - Design Consultation (Muhurtham Bridal Collection)
(
    gen_random_uuid(), '+91 98403 34567',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0012' LIMIT 1),
    'CONSULTATION',
    CURRENT_DATE + time '13:00:00',
    60, 'CONFIRMED', 'Atelier Couturier Karthik',
    'Daughter wedding trousseau review. Finalize zari thread shades and temple motif swatches.',
    now() - interval '4 days', now()
),

-- 4. Kavitha Rajendran - Fitting (Organza Silk Anarkali)
(
    gen_random_uuid(), '+91 98402 23456',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0007' LIMIT 1),
    'FITTING',
    CURRENT_DATE + time '14:30:00',
    45, 'CONFIRMED', 'Master Draper Selvam',
    'Yoke fitting and flare balance check for floral embroidered mint green lehenga.',
    now() - interval '3 days', now()
),

-- 5. Janani Padmanabhan - Delivery (Carnatic Concert Silk Blouse)
(
    gen_random_uuid(), '+91 98419 90123',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0054' LIMIT 1),
    'DELIVERY',
    CURRENT_DATE + time '16:00:00',
    30, 'CONFIRMED', 'Bridal Specialist Sneha',
    'Final pickup for Mylapore concert blouse. Luxury gift box packaging with matching mask.',
    now() - interval '5 days', now()
),

-- 6. Divya Ramachandran - Trial (Gold Brocade Kalidar Kurti)
(
    gen_random_uuid(), '+91 98405 56789',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0017' LIMIT 1),
    'TRIAL',
    CURRENT_DATE + time '17:00:00',
    45, 'SCHEDULED', 'Master Tailor Murugan',
    'First trial for Salem client. Inspect latkan tassel placement and boat neck collar fit.',
    now() - interval '1 day', now()
),

-- 7. Soundarya Saravanan - Design Consultation (Festive Tussar Silk Tunic)
(
    gen_random_uuid(), '+91 98406 67890',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0020' LIMIT 1),
    'CONSULTATION',
    CURRENT_DATE + time '18:15:00',
    45, 'CONFIRMED', 'Senior Stylist Priya',
    'Discuss scalloped zari hem border options and contrasting raw silk cigarette pants.',
    now() - interval '2 days', now()
),

-- 8. Sowmya Jayaraman - Delivery (Cutdana Zari Saree Blouse)
(
    gen_random_uuid(), '+91 98407 78901',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0022' LIMIT 1),
    'DELIVERY',
    CURRENT_DATE + time '19:15:00',
    30, 'CONFIRMED', 'Master Draper Selvam',
    'Ready for delivery at boutique counter. Verify balance payment of ₹6,500.',
    now() - interval '4 days', now()
),

-- =============================================================================
-- UPCOMING APPOINTMENTS (NEXT 7 DAYS: 14 APPOINTMENTS)
-- =============================================================================
-- 9. Day +1 (2026-09-17) - Bhuvaneshwari Chandrasekar (Trial: Reception Lehenga)
(
    gen_random_uuid(), '+91 98411 12345',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0032' LIMIT 1),
    'TRIAL',
    CURRENT_DATE + interval '1 day' + time '10:30:00',
    60, 'CONFIRMED', 'Atelier Couturier Karthik',
    'Trial for peach organza kalidar lehenga with can-can skirting.',
    now() - interval '2 days', now()
),

-- 10. Day +1 (2026-09-17) - Yazhini Senthilvel (Measurement: Festive Saree Blouse)
(
    gen_random_uuid(), '+91 98414 45678',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0040' LIMIT 1),
    'MEASUREMENT',
    CURRENT_DATE + interval '1 day' + time '15:00:00',
    45, 'SCHEDULED', 'Senior Stylist Priya',
    'Back cut-out arch measurement with high-precision bodice fit.',
    now() - interval '1 day', now()
),

-- 11. Day +2 (2026-09-18) - Keerthana Muthukrishnan (Trial: Peacock Aari Blouse)
(
    gen_random_uuid(), '+91 98415 56789',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0043' LIMIT 1),
    'TRIAL',
    CURRENT_DATE + interval '2 days' + time '11:00:00',
    45, 'CONFIRMED', 'Master Tailor Murugan',
    'Verify armhole comfort and padding placement on heavy crimson blouse.',
    now() - interval '3 days', now()
),

-- 12. Day +2 (2026-09-18) - Kaviya Shree (Fitting: Half Saree Dhavani Skirt)
(
    gen_random_uuid(), '+91 98404 45678',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0013' LIMIT 1),
    'FITTING',
    CURRENT_DATE + interval '2 days' + time '14:00:00',
    45, 'CONFIRMED', 'Bridal Specialist Sneha',
    'Follow-up trial for Dhavani pleats and waist gathering with antique temple border.',
    now() - interval '2 days', now()
),

-- 13. Day +2 (2026-09-18) - Sivagami Meenakshisundaram (Delivery: Temple Jewellery Blouse)
(
    gen_random_uuid(), '+91 98418 89012',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0050' LIMIT 1),
    'DELIVERY',
    CURRENT_DATE + interval '2 days' + time '16:30:00',
    30, 'CONFIRMED', 'Master Draper Selvam',
    'Client courier pickup for Karaikudi dispatch. Balance payment verified.',
    now() - interval '1 day', now()
),

-- 14. Day +3 (2026-09-19) - Gayathri Vijayakumar (Trial: Lavender Sangeet Lehenga)
(
    gen_random_uuid(), '+91 98409 90123',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0027' LIMIT 1),
    'TRIAL',
    CURRENT_DATE + interval '3 days' + time '10:30:00',
    60, 'SCHEDULED', 'Atelier Couturier Karthik',
    'Sangeet lehenga flare trial with heels for exact floor clearance.',
    now() - interval '2 days', now()
),

-- 15. Day +3 (2026-09-19) - Abirami Murugan (Measurement: Antique Lotus Blouse)
(
    gen_random_uuid(), '+91 98410 01234',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0030' LIMIT 1),
    'MEASUREMENT',
    CURRENT_DATE + interval '3 days' + time '12:15:00',
    45, 'CONFIRMED', 'Senior Stylist Priya',
    'Lotus back medallion positioning and front dart structuring.',
    now() - interval '2 days', now()
),

-- 16. Day +3 (2026-09-19) - Ananya Sundaram (Delivery: Crimson Red Wedding Lehenga)
(
    gen_random_uuid(), '+91 98401 12345',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0002' LIMIT 1),
    'DELIVERY',
    CURRENT_DATE + interval '3 days' + time '16:00:00',
    45, 'CONFIRMED', 'Bridal Specialist Sneha',
    'Grand bridal handover. Includes double veil dupatta and velvet travel trunk.',
    now() - interval '4 days', now()
),

-- 17. Day +4 (2026-09-20) - Deepalakshmi Palanisamy (Fitting: Drape Evening Gown)
(
    gen_random_uuid(), '+91 98412 23456',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0036' LIMIT 1),
    'FITTING',
    CURRENT_DATE + interval '4 days' + time '11:30:00',
    45, 'SCHEDULED', 'Master Draper Selvam',
    'Crystal belt adjustment and side zipper comfort test.',
    now() - interval '1 day', now()
),

-- 18. Day +4 (2026-09-20) - Subhasree Balasubramanian (Design Consultation: Mirrorwork Blouse)
(
    gen_random_uuid(), '+91 98413 34567',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0038' LIMIT 1),
    'CONSULTATION',
    CURRENT_DATE + interval '4 days' + time '15:00:00',
    60, 'CONFIRMED', 'Atelier Couturier Karthik',
    'Indigo blue raw silk embroidery layout and mirror glass density selection.',
    now() - interval '2 days', now()
),

-- 19. Day +5 (2026-09-21) - Revathi Karthikeyan (Measurement: Organza Festive Saree)
(
    gen_random_uuid(), '+91 98417 78901',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0048' LIMIT 1),
    'MEASUREMENT',
    CURRENT_DATE + interval '5 days' + time '11:00:00',
    45, 'SCHEDULED', 'Senior Stylist Priya',
    'Measurement for court road teacher client. Boat neck and elbow sleeve length.',
    now() - interval '1 day', now()
),

-- 20. Day +5 (2026-09-21) - Dhanalakshmi Ganesan (Trial: Kasavu Border Blouse)
(
    gen_random_uuid(), '+91 98420 01234',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0058' LIMIT 1),
    'TRIAL',
    CURRENT_DATE + interval '5 days' + time '14:30:00',
    30, 'CONFIRMED', 'Master Tailor Murugan',
    'Check back hook placket and neck piping snugness.',
    now() - interval '3 days', now()
),

-- 21. Day +6 (2026-09-22) - Nithya Venkatesan (Delivery: Raw Silk Straight Kurta)
(
    gen_random_uuid(), '+91 98408 89012',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0025' LIMIT 1),
    'DELIVERY',
    CURRENT_DATE + interval '6 days' + time '10:30:00',
    30, 'SCHEDULED', 'Bridal Specialist Sneha',
    'Delivery scheduled at Erode branch counter. Balance ₹8,500 due on pickup.',
    now() - interval '2 days', now()
),

-- 22. Day +6 (2026-09-22) - Thenmozhi Arumugam (Trial: Matka Silk Blouse)
(
    gen_random_uuid(), '+91 98416 67890',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0046' LIMIT 1),
    'TRIAL',
    CURRENT_DATE + interval '6 days' + time '16:00:00',
    45, 'SCHEDULED', 'Master Draper Selvam',
    'Kumbakonam traditional handloom client trial.',
    now() - interval '1 day', now()
),

-- =============================================================================
-- HISTORICAL APPOINTMENTS (PAST 14 DAYS: 8 APPOINTMENTS)
-- =============================================================================
-- 23. Ananya Sundaram - Completed Consultation (Muhurtham Lehenga Planning)
(
    gen_random_uuid(), '+91 98401 12345',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0001' LIMIT 1),
    'CONSULTATION',
    CURRENT_DATE - interval '14 days' + time '11:00:00',
    60, 'COMPLETED', 'Atelier Couturier Karthik',
    'Initial bridal consultation. Selected crimson velvet fabric and gold bullion thread.',
    now() - interval '15 days', now() - interval '14 days'
),

-- 24. Kavitha Rajendran - Completed Measurement (Pastel Anarkali)
(
    gen_random_uuid(), '+91 98402 23456',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0005' LIMIT 1),
    'MEASUREMENT',
    CURRENT_DATE - interval '11 days' + time '14:00:00',
    45, 'COMPLETED', 'Senior Stylist Priya',
    'Accurate bust, waist, and flare drop measurements taken. Client approved specs.',
    now() - interval '12 days', now() - interval '11 days'
),

-- 25. Meenakshi Natarajan - Completed Delivery (Kanchi Silk Arch Blouse)
(
    gen_random_uuid(), '+91 98403 34567',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0009' LIMIT 1),
    'DELIVERY',
    CURRENT_DATE - interval '8 days' + time '16:30:00',
    30, 'COMPLETED', 'Master Tailor Murugan',
    'Delivered in person to client at Madurai boutique. 100% fitting satisfaction confirmed.',
    now() - interval '9 days', now() - interval '8 days'
),

-- 26. Kaviya Shree - Completed Consultation (Trichy Half Saree Collection)
(
    gen_random_uuid(), '+91 98404 45678',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0013' LIMIT 1),
    'CONSULTATION',
    CURRENT_DATE - interval '7 days' + time '10:30:00',
    60, 'COMPLETED', 'Bridal Specialist Sneha',
    'Design discussion for classical dance performance dhavani ensemble. Fabric approved.',
    now() - interval '8 days', now() - interval '7 days'
),

-- 27. Divya Ramachandran - Completed Measurement (Saree Blouse)
(
    gen_random_uuid(), '+91 98405 56789',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0016' LIMIT 1),
    'MEASUREMENT',
    CURRENT_DATE - interval '6 days' + time '15:15:00',
    45, 'COMPLETED', 'Senior Stylist Priya',
    'Front boat neck and back deep U cut dimensions finalized.',
    now() - interval '7 days', now() - interval '6 days'
),

-- 28. Sowmya Jayaraman - Completed Trial (Kasu Mala Blouse)
(
    gen_random_uuid(), '+91 98407 78901',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0021' LIMIT 1),
    'TRIAL',
    CURRENT_DATE - interval '4 days' + time '17:00:00',
    45, 'COMPLETED', 'Master Draper Selvam',
    'Kasu coin embellishments verified. Minor sleeve hem adjustment completed.',
    now() - interval '5 days', now() - interval '4 days'
),

-- 29. Bhuvaneshwari Chandrasekar - Cancelled Consultation (Client Out of Town)
(
    gen_random_uuid(), '+91 98411 12345',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0031' LIMIT 1),
    'CONSULTATION',
    CURRENT_DATE - interval '5 days' + time '11:00:00',
    60, 'CANCELLED', 'Atelier Couturier Karthik',
    'Client requested rescheduling due to family temple visit in Kanchipuram.',
    now() - interval '6 days', now() - interval '5 days'
),

-- 30. Janani Padmanabhan - Cancelled Trial (Rescheduled to Today)
(
    gen_random_uuid(), '+91 98419 90123',
    (SELECT id FROM orders WHERE order_code = 'ORD-2026-0053' LIMIT 1),
    'TRIAL',
    CURRENT_DATE - interval '2 days' + time '16:00:00',
    45, 'CANCELLED', 'Master Tailor Murugan',
    'Trial session rescheduled to coincide with delivery session.',
    now() - interval '3 days', now() - interval '2 days'
);

COMMIT;
