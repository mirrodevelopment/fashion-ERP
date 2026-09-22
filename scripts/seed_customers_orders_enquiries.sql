-- =============================================================================
-- HAULO BOUTIQUE ERP — SEED DATASET (TAMIL NADU COUTURE)
-- Seeds 20 Tamil Nadu customers (including Kaviya Shree), 58 realistic orders
-- (1 to 5 per customer), 10 enquiries, and 10 bespoke designs.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. SEED 20 TAMIL NADU CUSTOMERS
-- -----------------------------------------------------------------------------
INSERT INTO customers (
    mobile_number, name, first_name, last_name, salutation, gender, email, alt_phone,
    instagram_handle, preferred_channel, dob, anniversary, location, street_address,
    city, state, pincode, landmark, avatar_url, tier, total_spend, balance, credit_limit,
    favorite_garment, fit_preference, fabric_allergies, measurements_on_file, notes,
    created_at, updated_at
) VALUES
-- 1. Ananya Sundaram (Chennai)
(
    '+91 98401 12345', 'Ananya Sundaram', 'Ananya', 'Sundaram', 'Ms.', 'Female',
    'ananya.sundaram@gmail.com', '+91 98401 99991', '@ananya_sundaram', 'WhatsApp',
    '1994-06-14', '2023-11-20', 'Anna Nagar, Chennai', 'Plot 42, 2nd Avenue, Anna Nagar West',
    'Chennai', 'Tamil Nadu', '600040', 'Near Roundana', '/front end/assets/user uploads/user img/Ananya_Sundaram_1084.jpg',
    'VIP_PLATINUM', 0, 0, 100000.00, 'Bridal Kanchipuram Saree Blouse', 'Tailored Comfort Fit', 'None', true,
    'HNI family. Prefers pure gold zari antique work and bespoke sweetheart necklines.',
    now() - interval '90 days', now()
),
-- 2. Kavitha Rajendran (Coimbatore)
(
    '+91 98402 23456', 'Kavitha Rajendran', 'Kavitha', 'Rajendran', 'Mrs.', 'Female',
    'kavitha.rajendran@outlook.com', '+91 98402 99992', '@kavitha_raj', 'WhatsApp',
    '1988-09-22', '2015-02-14', 'RS Puram, Coimbatore', '14/B, DB Road, RS Puram',
    'Coimbatore', 'Tamil Nadu', '641002', 'Near Flower Market', '/front end/assets/user uploads/user img/Kavitha_Rajendran_3921.jpg',
    'VIP_PLATINUM', 0, 0, 50000.00, 'Organza Silk Anarkali Set', 'Slim Contemporary Fit', 'None', true,
    'Regular client for family wedding festive wear. Loves pastel tones with threadwork.',
    now() - interval '80 days', now()
),
-- 3. Meenakshi Natarajan (Madurai)
(
    '+91 98403 34567', 'Meenakshi Natarajan', 'Meenakshi', 'Natarajan', 'Mrs.', 'Female',
    'meenakshi.natarajan@gmail.com', '+91 98403 99993', '@meena_natarajan', 'WhatsApp',
    '1985-03-10', '2010-09-08', 'KK Nagar, Madurai', '88, East 5th Cross Street, KK Nagar',
    'Madurai', 'Tamil Nadu', '625020', 'Opposite Apollo Hospital', '/front end/assets/user uploads/user img/Meenakshi_Natarajan_7814.jpg',
    'VIP_PLATINUM', 0, 0, 150000.00, 'Heavy Zardosi Muhurtham Lehenga', 'Regal Royal Fit', 'None', true,
    'Daughter wedding ensemble coordinator. Orders complete bridal trousseau collections.',
    now() - interval '120 days', now()
),
-- 4. Kaviya Shree (Tiruchirappalli)
(
    '+91 98404 45678', 'Kaviya Shree', 'Kaviya', 'Shree', 'Ms.', 'Female',
    'kaviya.shree96@gmail.com', '+91 98404 99994', '@kaviya_shree_official', 'WhatsApp',
    '1996-11-05', NULL, 'Thillai Nagar, Trichy', '27, 10th Cross East, Thillai Nagar',
    'Tiruchirappalli', 'Tamil Nadu', '620018', 'Near Makkal Mandram', '/front end/assets/user uploads/user img/Kaviya_Shree_2491.jpg',
    'VIP_GOLD', 0, 0, 40000.00, 'Tissue Silk Dhavani Half Saree', 'Fitted Structured Silhouette', 'Synthetic Dye Sensitive', true,
    'Classical dancer and lifestyle influencer. Prefers pure natural silk and intricate temple jewellery motifs.',
    now() - interval '65 days', now()
),
-- 5. Divya Ramachandran (Salem)
(
    '+91 98405 56789', 'Divya Ramachandran', 'Divya', 'Ramachandran', 'Mrs.', 'Female',
    'divya.ramachandran@yahoo.com', '+91 98405 99995', '@divya_rc', 'WhatsApp',
    '1990-08-18', '2018-12-04', 'Fairlands, Salem', '102, Brindavan Road, Fairlands',
    'Salem', 'Tamil Nadu', '636016', 'Near ARRS Multiplex', '/front end/assets/user uploads/user img/Divya_Ramachandran_6308.jpg',
    'VIP_PLATINUM', 0, 0, 60000.00, 'Brocade Kalidar Kurti Set', 'Relaxed Luxury Fit', 'None', true,
    'Textile business family. Discerning eye for zari purity and weave density.',
    now() - interval '75 days', now()
),
-- 6. Soundarya Saravanan (Chennai)
(
    '+91 98406 67890', 'Soundarya Saravanan', 'Soundarya', 'Saravanan', 'Ms.', 'Female',
    'soundarya.saravanan@gmail.com', '+91 98406 99996', '@soundarya_s', 'Instagram',
    '1998-04-12', NULL, 'T. Nagar, Chennai', '31, Venkatnarayana Road, T. Nagar',
    'Chennai', 'Tamil Nadu', '600017', 'Opposite Panagal Park', '/front end/assets/user uploads/user img/Soundarya_Saravanan_8524.jpg',
    'VIP_GOLD', 0, 0, 35000.00, 'Handloom Tussar Silk Tunic', 'Modern Flared Silhouette', 'None', true,
    'Corporate lawyer. Orders sleek workwear tunics and celebratory festive wear.',
    now() - interval '45 days', now()
),
-- 7. Sowmya Jayaraman (Tirunelveli)
(
    '+91 98407 78901', 'Sowmya Jayaraman', 'Sowmya', 'Jayaraman', 'Mrs.', 'Female',
    'sowmya.jayaraman@gmail.com', '+91 98407 99997', '@sowmya_j', 'WhatsApp',
    '1986-12-30', '2012-06-18', 'Palayamkottai, Tirunelveli', '5, South Car Street, Palayamkottai',
    'Tirunelveli', 'Tamil Nadu', '627002', 'Near High Ground', '/front end/assets/user uploads/user img/Sowmya_Jayaraman_1947.jpg',
    'VIP_PLATINUM', 0, 0, 120000.00, 'Cutdana Zari Saree Blouse', 'Tailored Bridal Fit', 'None', true,
    'Frequent wedding shopper. Prefers classic auspicious color palette (Crimson, Mustard, Peacock Blue).',
    now() - interval '110 days', now()
),
-- 8. Nithya Venkatesan (Erode)
(
    '+91 98408 89012', 'Nithya Venkatesan', 'Nithya', 'Venkatesan', 'Ms.', 'Female',
    'nithya.venkatesan@gmail.com', '+91 98408 99998', '@nithya_v', 'WhatsApp',
    '1997-01-25', NULL, 'Perundurai Road, Erode', '210, Palayapalayam, Perundurai Road',
    'Erode', 'Tamil Nadu', '638011', 'Near Collector Office', '/front end/assets/user uploads/user img/Nithya_Venkatesan_4639.jpg',
    'REGULAR', 0, 0, 25000.00, 'Festive Raw Silk Kurta Set', 'Comfort Regular Fit', 'None', false,
    'First-time festive order. Walk-in referral from family friend.',
    now() - interval '20 days', now()
),
-- 9. Gayathri Vijayakumar (Vellore)
(
    '+91 98409 90123', 'Gayathri Vijayakumar', 'Gayathri', 'Vijayakumar', 'Mrs.', 'Female',
    'gayathri.vk@gmail.com', '+91 98409 99999', '@gayathri_vk', 'WhatsApp',
    '1989-07-19', '2016-03-24', 'Gandhi Nagar, Vellore', '18, 14th East Cross Road, Gandhi Nagar',
    'Vellore', 'Tamil Nadu', '632006', 'Near VIT Road', '/front end/assets/user uploads/user img/Gayathri_Vijayakumar_5712.jpg',
    'VIP_PLATINUM', 0, 0, 75000.00, 'Resham Threadwork Bridal Blouse', 'Precise Princess Cut', 'None', true,
    'Prefers clean finishes and invisible inner boning for back tie designs.',
    now() - interval '60 days', now()
),
-- 10. Abirami Murugan (Thanjavur)
(
    '+91 98410 01234', 'Abirami Murugan', 'Abirami', 'Murugan', 'Mrs.', 'Female',
    'abirami.murugan@gmail.com', '+91 98410 99990', '@abirami_m', 'Phone',
    '1991-05-15', '2019-11-10', 'Medical College Road, Thanjavur', '76, Sundaram Nagar, Medical College Road',
    'Thanjavur', 'Tamil Nadu', '613004', 'Near New Bus Stand', '/front end/assets/user uploads/user img/Abirami_Murugan_3195.jpg',
    'VIP_GOLD', 0, 0, 45000.00, 'Chettinad Heritage Silk Pavada', 'Traditional Graceful Fit', 'None', true,
    'Cultural arts enthusiast. Prefers authentic temple border drapes and micro beadwork.',
    now() - interval '50 days', now()
),
-- 11. Bhuvaneshwari Chandrasekar (Kanchipuram)
(
    '+91 98411 12345', 'Bhuvaneshwari Chandrasekar', 'Bhuvaneshwari', 'Chandrasekar', 'Mrs.', 'Female',
    'bhuvaneshwari.c@gmail.com', '+91 98411 99991', '@bhuvi_chandra', 'WhatsApp',
    '1983-10-08', '2008-01-20', 'Gandhi Road, Kanchipuram', '54, Nethaji Street, Near Ekambareswarar Temple',
    'Kanchipuram', 'Tamil Nadu', '631502', 'Near Temple Car Mandapam', '/front end/assets/user uploads/user img/Bhuvaneshwari_Chandrasekar_9026.jpg',
    'VIP_PLATINUM', 0, 0, 180000.00, 'Pure Korvai Silk Saree Blouse', 'Bespoke Traditional Silhouette', 'None', true,
    'Traditional silk connoisseur. Coordinates family weddings and high-profile temple functions.',
    now() - interval '130 days', now()
),
-- 12. Deepalakshmi Palanisamy (Tiruppur)
(
    '+91 98412 23456', 'Deepalakshmi Palanisamy', 'Deepalakshmi', 'Palanisamy', 'Ms.', 'Female',
    'deepa.palanisamy@gmail.com', '+91 98412 99992', '@deepa_palanisamy', 'WhatsApp',
    '1995-02-14', NULL, 'Avinashi Road, Tiruppur', '120, Sheriff Colony, Avinashi Road',
    'Tiruppur', 'Tamil Nadu', '641652', 'Near Pushpa Theatre Junction', '/front end/assets/user uploads/user img/Deepalakshmi_Palanisamy_4183.jpg',
    'REGULAR', 0, 0, 30000.00, 'Contemporary Crepe Drape Gown', 'Contemporary Slim Fit', 'None', true,
    'Apparel export manager. Appreciates precise needle count and seam finishes.',
    now() - interval '30 days', now()
),
-- 13. Subhasree Balasubramanian (Chennai)
(
    '+91 98413 34567', 'Subhasree Balasubramanian', 'Subhasree', 'Balasubramanian', 'Mrs.', 'Female',
    'subhasree.bala@gmail.com', '+91 98413 99993', '@subhasree_b', 'WhatsApp',
    '1992-09-04', '2020-02-09', 'Besant Nagar, Chennai', '19, 4th Main Road, Besant Nagar',
    'Chennai', 'Tamil Nadu', '600090', 'Near Elliot Beach Promenade', '/front end/assets/user uploads/user img/Subhasree_Balasubramanian_7260.jpg',
    'VIP_GOLD', 0, 0, 50000.00, 'Pastel Embroidered Jacket Set', 'Modern Flared Cut', 'None', true,
    'Creative director at media house. Prefers minimalist embroidery with striking silhouettes.',
    now() - interval '40 days', now()
),
-- 14. Yazhini Senthilvel (Dindigul)
(
    '+91 98414 45678', 'Yazhini Senthilvel', 'Yazhini', 'Senthilvel', 'Ms.', 'Female',
    'yazhini.senthilvel@gmail.com', '+91 98414 99994', '@yazhini_s', 'WhatsApp',
    '1997-08-11', NULL, 'GTN Salai, Dindigul', '34, Meenachinayakanpatti, GTN Salai',
    'Dindigul', 'Tamil Nadu', '624005', 'Near Collectorate', '/front end/assets/user uploads/user img/Yazhini_Senthilvel_3549.jpg',
    'VIP_PLATINUM', 0, 0, 85000.00, 'Pure Georgette Sharara Set', 'Flowing Festive Fit', 'None', true,
    'Orders festive outfits for Navratri and Diwali celebrations. Likes sequin borders.',
    now() - interval '70 days', now()
),
-- 15. Keerthana Muthukrishnan (Cuddalore)
(
    '+91 98415 56789', 'Keerthana Muthukrishnan', 'Keerthana', 'Muthukrishnan', 'Mrs.', 'Female',
    'keerthana.mk@gmail.com', '+91 98415 99995', '@keerthana_mk', 'WhatsApp',
    '1989-11-23', '2017-05-18', 'Manjakuppam, Cuddalore', '8, Subbaraya Chetty Street, Manjakuppam',
    'Cuddalore', 'Tamil Nadu', '607001', 'Near Silver Beach Road', '/front end/assets/user uploads/user img/Keerthana_Muthukrishnan_8172.jpg',
    'VIP_PLATINUM', 0, 0, 140000.00, 'Royal Velvet Reception Gown', 'Structured Corset Silhouette', 'None', true,
    'Doctors family. Prefers luxury evening drapes with pearl hand embroidery.',
    now() - interval '100 days', now()
),
-- 16. Thenmozhi Arumugam (Kumbakonam)
(
    '+91 98416 67890', 'Thenmozhi Arumugam', 'Thenmozhi', 'Arumugam', 'Mrs.', 'Female',
    'thenmozhi.arumugam@gmail.com', '+91 98416 99996', '@thenmozhi_a', 'Phone',
    '1987-04-30', '2014-08-25', 'Sarangapani Street, Kumbakonam', '12, Big Bazaar Street, Kumbakonam',
    'Kumbakonam', 'Tamil Nadu', '612001', 'Near Mahamaham Tank', '/front end/assets/user uploads/user img/Thenmozhi_Arumugam_6403.jpg',
    'REGULAR', 0, 0, 20000.00, 'Handwoven Matka Silk Blouse', 'Traditional Padded Cut', 'None', true,
    'Visits during temple festival seasons. Prefers pure gold thread kantha work.',
    now() - interval '25 days', now()
),
-- 17. Revathi Karthikeyan (Nagercoil)
(
    '+91 98417 78901', 'Revathi Karthikeyan', 'Revathi', 'Karthikeyan', 'Ms.', 'Female',
    'revathi.karthik@gmail.com', '+91 98417 99997', '@revathi_k', 'Instagram',
    '1996-03-17', NULL, 'Court Road, Nagercoil', '45, Cape Road, Near Tower Junction',
    'Nagercoil', 'Tamil Nadu', '629001', 'Near Clock Tower', '/front end/assets/user uploads/user img/Revathi_Karthikeyan_2895.jpg',
    'VIP_GOLD', 0, 0, 45000.00, 'Tissue Silk Bridal Blouse', 'Fitted Boat Neck Cut', 'None', true,
    'School educator. Orders festive outfits with subtle metallic borders.',
    now() - interval '55 days', now()
),
-- 18. Sivagami Meenakshisundaram (Karaikudi)
(
    '+91 98418 89012', 'Sivagami Meenakshisundaram', 'Sivagami', 'Meenakshisundaram', 'Mrs.', 'Female',
    'sivagami.ms@gmail.com', '+91 98418 99998', '@sivagami_chettier', 'WhatsApp',
    '1984-08-05', '2007-06-12', 'Kallukatti, Karaikudi', '23, Chettinad Mansion Street, Kallukatti',
    'Karaikudi', 'Tamil Nadu', '630001', 'Near Alagappa University', '/front end/assets/user uploads/user img/Sivagami_Meenakshisundaram_5316.jpg',
    'VIP_PLATINUM', 0, 0, 95000.00, 'Authentic Chettinad Silk Ensemble', 'Heritage Flared Drapes', 'None', true,
    'Chettiar heritage family. Recommends traditional mustard, emerald, and ruby combinations.',
    now() - interval '85 days', now()
),
-- 19. Janani Padmanabhan (Chennai)
(
    '+91 98419 90123', 'Janani Padmanabhan', 'Janani', 'Padmanabhan', 'Ms.', 'Female',
    'janani.padmanabhan@gmail.com', '+91 98419 99999', '@janani_p_chennai', 'WhatsApp',
    '1993-01-19', '2022-10-15', 'Mylapore, Chennai', '15, Luz Church Road, Mylapore',
    'Chennai', 'Tamil Nadu', '600004', 'Near Kapaleeshwarar Temple', '/front end/assets/user uploads/user img/Janani_Padmanabhan_9481.jpg',
    'VIP_PLATINUM', 0, 0, 160000.00, 'Cutdana Zari Saree Blouse', 'Deep Sweetheart Neckline', 'None', true,
    'Classical singer and Carnatic artist. High-volume custom orders for December music festival season.',
    now() - interval '95 days', now()
),
-- 20. Dhanalakshmi Ganesan (Karur)
(
    '+91 98420 01234', 'Dhanalakshmi Ganesan', 'Dhanalakshmi', 'Ganesan', 'Mrs.', 'Female',
    'dhanalakshmi.g@gmail.com', '+91 98420 99990', '@dhana_ganesan', 'Phone',
    '1990-12-14', '2016-09-02', 'Jawahar Bazaar, Karur', '89, Sengunthapuram 5th Cross, Jawahar Bazaar',
    'Karur', 'Tamil Nadu', '639002', 'Near Bus Stand', '/front end/assets/user uploads/user img/Dhanalakshmi_Ganesan_3728.jpg',
    'REGULAR', 0, 0, 35000.00, 'Organza Floral Lehenga', 'Comfort Flared Silhouette', 'None', true,
    'Home furnishing entrepreneur. Prefers pure cotton lining and reinforced hooks.',
    now() - interval '35 days', now()
);

-- -----------------------------------------------------------------------------
-- 2. SEED 58 ORDERS (1 to 5 per customer)
-- -----------------------------------------------------------------------------
INSERT INTO orders (
    id, order_code, customer_mobile, customer_name, garment_type, garment_desc,
    collection, order_date, expected_delivery_date, delivered_date,
    advance_paid, total_amount, balance_amount, amount, status, due_date, notes,
    created_at, updated_at
) VALUES
-- Ananya Sundaram (4 orders)
(
    gen_random_uuid(), 'ORD-2026-0001', '+91 98401 12345', 'Ananya Sundaram',
    'Bridal Blouse', 'Hand Aari Embroidered Pure Silk Sweetheart Blouse with Cutdana Work',
    'Royal Heritage', CURRENT_DATE - interval '18 days', CURRENT_DATE - interval '2 days', CURRENT_DATE - interval '2 days',
    12000.00, 12000.00, 0.00, 12000.00, 'DELIVERED', CURRENT_DATE - interval '2 days',
    'Delivered with tassel dori tie back and extra padding.', now() - interval '18 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0002', '+91 98401 12345', 'Ananya Sundaram',
    'Bridal Lehenga', 'Crimson Red Raw Silk Wedding Lehenga with Antique Gold Zari Jaal',
    'Royal Heritage', CURRENT_DATE - interval '12 days', CURRENT_DATE + interval '8 days', NULL,
    45000.00, 68000.00, 23000.00, 68000.00, 'IN_PROGRESS', CURRENT_DATE + interval '8 days',
    'Can-can layered, double dupatta set in progress in room 2.', now() - interval '12 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0003', '+91 98401 12345', 'Ananya Sundaram',
    'Saree Blouse', 'Peacock Blue Brocade Elbow Sleeve Blouse with Pearl Edge',
    'Temple Classics', CURRENT_DATE - interval '7 days', CURRENT_DATE + interval '4 days', NULL,
    6000.00, 9500.00, 3500.00, 9500.00, 'IN_PROGRESS', CURRENT_DATE + interval '4 days',
    'Trial scheduled for tomorrow 4 PM.', now() - interval '7 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0004', '+91 98401 12345', 'Ananya Sundaram',
    'Reception Gown', 'Emerald Green Velvet Trail Gown with Micro Sequin Shimmer',
    'Evening Glamour', CURRENT_DATE - interval '2 days', CURRENT_DATE + interval '14 days', NULL,
    25000.00, 55500.00, 30500.00, 55500.00, 'PENDING', CURRENT_DATE + interval '14 days',
    'Fabric sourced from Chennai weavers, cutting scheduled.', now() - interval '2 days', now()
),

-- Kavitha Rajendran (3 orders)
(
    gen_random_uuid(), 'ORD-2026-0005', '+91 98402 23456', 'Kavitha Rajendran',
    'Anarkali Set', 'Blush Pink Organza Silk Floor-Length Anarkali with Gota Border',
    'Spring Blossom', CURRENT_DATE - interval '15 days', CURRENT_DATE - interval '1 day', CURRENT_DATE - interval '1 day',
    28000.00, 28000.00, 0.00, 28000.00, 'DELIVERED', CURRENT_DATE - interval '1 day',
    'Delivered with matching organza dupatta.', now() - interval '15 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0006', '+91 98402 23456', 'Kavitha Rajendran',
    'Saree Blouse', 'Mustard Yellow Kanchipuram Silk Blouse with Maggam Work',
    'Temple Classics', CURRENT_DATE - interval '9 days', CURRENT_DATE + interval '3 days', NULL,
    5000.00, 8500.00, 3500.00, 8500.00, 'READY', CURRENT_DATE + interval '3 days',
    'Final steam pressing and packaging completed.', now() - interval '9 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0007', '+91 98402 23456', 'Kavitha Rajendran',
    'Lehenga', 'Mint Green Georgette Floral Embroidered Lehenga Set',
    'Spring Blossom', CURRENT_DATE - interval '4 days', CURRENT_DATE + interval '12 days', NULL,
    25000.00, 55500.00, 30500.00, 55500.00, 'IN_PROGRESS', CURRENT_DATE + interval '12 days',
    'Embroidery stitching underway.', now() - interval '4 days', now()
),

-- Meenakshi Natarajan (5 orders)
(
    gen_random_uuid(), 'ORD-2026-0008', '+91 98403 34567', 'Meenakshi Natarajan',
    'Bridal Lehenga', 'Heritage Crimson & Gold Velvet Zardosi Bridal Lehenga Set',
    'Royal Heritage', CURRENT_DATE - interval '25 days', CURRENT_DATE - interval '5 days', CURRENT_DATE - interval '5 days',
    95000.00, 95000.00, 0.00, 95000.00, 'DELIVERED', CURRENT_DATE - interval '5 days',
    'Bridal masterwork delivered with certified heirloom gold zari thread.', now() - interval '25 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0009', '+91 98403 34567', 'Meenakshi Natarajan',
    'Muhurtham Blouse', 'Pure Kanchi Silk Blouse with Temple Arch Maggam Work Back',
    'Royal Heritage', CURRENT_DATE - interval '14 days', CURRENT_DATE + interval '2 days', NULL,
    10000.00, 16500.00, 6500.00, 16500.00, 'READY', CURRENT_DATE + interval '2 days',
    'Quality control inspection passed 100%.', now() - interval '14 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0010', '+91 98403 34567', 'Meenakshi Natarajan',
    'Saree Blouse', 'Wine Red Raw Silk Boat Neck Blouse with Tonal Threadwork',
    'Classic Elegance', CURRENT_DATE - interval '10 days', CURRENT_DATE + interval '5 days', NULL,
    5000.00, 8500.00, 3500.00, 8500.00, 'IN_PROGRESS', CURRENT_DATE + interval '5 days',
    'Client requested minor sleeve loosening (+0.5 inch).', now() - interval '10 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0011', '+91 98403 34567', 'Meenakshi Natarajan',
    'Reception Gown', 'Midnight Blue Georgette Cape Gown with Silver Cutdana Work',
    'Evening Glamour', CURRENT_DATE - interval '6 days', CURRENT_DATE + interval '10 days', NULL,
    25000.00, 52000.00, 27000.00, 52000.00, 'IN_PROGRESS', CURRENT_DATE + interval '10 days',
    'Hand embellishment team on stage 2.', now() - interval '6 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0012', '+91 98403 34567', 'Meenakshi Natarajan',
    'Festive Kurti', 'Chanderi Silk Kalidar Kurti with Zari Collar',
    'Festive Drapes', CURRENT_DATE - interval '1 day', CURRENT_DATE + interval '16 days', NULL,
    15000.00, 38000.00, 23000.00, 38000.00, 'PENDING', CURRENT_DATE + interval '16 days',
    'Advance received via UPI.', now() - interval '1 day', now()
),

-- Kaviya Shree (3 orders - Requested Name!)
(
    gen_random_uuid(), 'ORD-2026-0013', '+91 98404 45678', 'Kaviya Shree',
    'Half Saree (Dhavani)', 'Temple Border Tissue Silk Half Saree with Contrast Brocade Blouse',
    'Heritage Weaves', CURRENT_DATE - interval '16 days', CURRENT_DATE - interval '3 days', CURRENT_DATE - interval '3 days',
    28500.00, 28500.00, 0.00, 28500.00, 'DELIVERED', CURRENT_DATE - interval '3 days',
    'Delivered with pure silk lehenga skirt and pleated dhavani.', now() - interval '16 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0014', '+91 98404 45678', 'Kaviya Shree',
    'Bridal Blouse', 'Rani Pink Silk Sweetheart Blouse with Floral Aari Vine Motifs',
    'Royal Heritage', CURRENT_DATE - interval '8 days', CURRENT_DATE + interval '4 days', NULL,
    6000.00, 11500.00, 5500.00, 11500.00, 'IN_PROGRESS', CURRENT_DATE + interval '4 days',
    'Fitting session scheduled for Saturday.', now() - interval '8 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0015', '+91 98404 45678', 'Kaviya Shree',
    'Designer Kurti', 'Teal Green Handloom Silk Tunic with Zari Borders',
    'Festive Drapes', CURRENT_DATE - interval '3 days', CURRENT_DATE + interval '11 days', NULL,
    4000.00, 8000.00, 4000.00, 8000.00, 'IN_PROGRESS', CURRENT_DATE + interval '11 days',
    'Pattern cut complete, tailoring in progress.', now() - interval '3 days', now()
),

-- Divya Ramachandran (3 orders)
(
    gen_random_uuid(), 'ORD-2026-0016', '+91 98405 56789', 'Divya Ramachandran',
    'Lehenga', 'Burgundy Velvet Bridal Lehenga with Multi-Coloured Resham Embroidery',
    'Royal Heritage', CURRENT_DATE - interval '20 days', CURRENT_DATE - interval '4 days', CURRENT_DATE - interval '4 days',
    65000.00, 65000.00, 0.00, 65000.00, 'DELIVERED', CURRENT_DATE - interval '4 days',
    'Delivered for family wedding in Salem.', now() - interval '20 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0017', '+91 98405 56789', 'Divya Ramachandran',
    'Saree Blouse', 'Gold Tissue Brocade Boat Neck Blouse with Latkan Tassels',
    'Classic Elegance', CURRENT_DATE - interval '11 days', CURRENT_DATE + interval '3 days', NULL,
    5000.00, 9500.00, 4500.00, 9500.00, 'READY', CURRENT_DATE + interval '3 days',
    'Packed in luxury boutique gift box.', now() - interval '11 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0018', '+91 98405 56789', 'Divya Ramachandran',
    'Anarkali Set', 'Pastel Lilac Georgette Flared Anarkali with Pearl Neckline',
    'Spring Blossom', CURRENT_DATE - interval '5 days', CURRENT_DATE + interval '9 days', NULL,
    20000.00, 40500.00, 20500.00, 40500.00, 'IN_PROGRESS', CURRENT_DATE + interval '9 days',
    'Lining attached, border stitching under way.', now() - interval '5 days', now()
),

-- Soundarya Saravanan (2 orders)
(
    gen_random_uuid(), 'ORD-2026-0019', '+91 98406 67890', 'Soundarya Saravanan',
    'Tussar Silk Tunic', 'Cobalt Blue Handloom Tussar Silk Tunic with Kantha Stitching',
    'Contemporary Classic', CURRENT_DATE - interval '14 days', CURRENT_DATE - interval '1 day', CURRENT_DATE - interval '1 day',
    18500.00, 18500.00, 0.00, 18500.00, 'DELIVERED', CURRENT_DATE - interval '1 day',
    'Delivered to Chennai office.', now() - interval '14 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0020', '+91 98406 67890', 'Soundarya Saravanan',
    'Festive Saree Blouse', 'Deep Maroon Raw Silk Princess Cut Blouse with Scalloped Zari Hem',
    'Temple Classics', CURRENT_DATE - interval '4 days', CURRENT_DATE + interval '7 days', NULL,
    15000.00, 33500.00, 18500.00, 33500.00, 'IN_PROGRESS', CURRENT_DATE + interval '7 days',
    'Aari handwork master assigned.', now() - interval '4 days', now()
),

-- Sowmya Jayaraman (4 orders)
(
    gen_random_uuid(), 'ORD-2026-0021', '+91 98407 78901', 'Sowmya Jayaraman',
    'Bridal Lehenga', 'Crimson Raw Silk Bridal Lehenga with Heavy Gota Patti Work',
    'Royal Heritage', CURRENT_DATE - interval '22 days', CURRENT_DATE - interval '6 days', CURRENT_DATE - interval '6 days',
    75000.00, 75000.00, 0.00, 75000.00, 'DELIVERED', CURRENT_DATE - interval '6 days',
    'Delivered with double organza dupattas.', now() - interval '22 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0022', '+91 98407 78901', 'Sowmya Jayaraman',
    'Saree Blouse', 'Emerald Green Kanchi Silk Blouse with Kasu Coin Embroidery',
    'Temple Classics', CURRENT_DATE - interval '12 days', CURRENT_DATE + interval '2 days', NULL,
    8000.00, 14500.00, 6500.00, 14500.00, 'READY', CURRENT_DATE + interval '2 days',
    'Ready for pickup in Tirunelveli branch.', now() - interval '12 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0023', '+91 98407 78901', 'Sowmya Jayaraman',
    'Anarkali Suit', 'Peacock Green Chanderi Silk Anarkali with Banarasi Yoke',
    'Spring Blossom', CURRENT_DATE - interval '7 days', CURRENT_DATE + interval '6 days', NULL,
    20000.00, 48000.00, 28000.00, 48000.00, 'IN_PROGRESS', CURRENT_DATE + interval '6 days',
    'Embroidery stitching underway.', now() - interval '7 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0024', '+91 98407 78901', 'Sowmya Jayaraman',
    'Saree Blouse', 'Gold Tissue Backless Blouse with Pearl Strings',
    'Classic Elegance', CURRENT_DATE - interval '2 days', CURRENT_DATE + interval '12 days', NULL,
    20000.00, 47500.00, 27500.00, 47500.00, 'PENDING', CURRENT_DATE + interval '12 days',
    'Advance received in store.', now() - interval '2 days', now()
),

-- Nithya Venkatesan (1 order)
(
    gen_random_uuid(), 'ORD-2026-0025', '+91 98408 89012', 'Nithya Venkatesan',
    'Kurta Set', 'Mustard Yellow Raw Silk Straight Kurta with Palazzos',
    'Festive Drapes', CURRENT_DATE - interval '8 days', CURRENT_DATE + interval '5 days', NULL,
    10000.00, 18500.00, 8500.00, 18500.00, 'IN_PROGRESS', CURRENT_DATE + interval '5 days',
    'Trial fitting scheduled at Erode showroom.', now() - interval '8 days', now()
),

-- Gayathri Vijayakumar (3 orders)
(
    gen_random_uuid(), 'ORD-2026-0026', '+91 98409 90123', 'Gayathri Vijayakumar',
    'Bridal Blouse', 'Deep Plum Kanchipuram Silk Sweetheart Blouse with Pearl Beads',
    'Royal Heritage', CURRENT_DATE - interval '17 days', CURRENT_DATE - interval '2 days', CURRENT_DATE - interval '2 days',
    12500.00, 12500.00, 0.00, 12500.00, 'DELIVERED', CURRENT_DATE - interval '2 days',
    'Delivered with perfect shoulder and cup alignment.', now() - interval '17 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0027', '+91 98409 90123', 'Gayathri Vijayakumar',
    'Lehenga', 'Lavender Organza Silk Sangeet Lehenga with Silver Resham Threads',
    'Spring Blossom', CURRENT_DATE - interval '10 days', CURRENT_DATE + interval '4 days', NULL,
    25000.00, 48000.00, 23000.00, 48000.00, 'IN_PROGRESS', CURRENT_DATE + interval '4 days',
    'Flairs pleated, waistband attachment pending.', now() - interval '10 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0028', '+91 98409 90123', 'Gayathri Vijayakumar',
    'Saree Blouse', 'Champagne Gold Zari Brocade High-Neck Blouse',
    'Classic Elegance', CURRENT_DATE - interval '3 days', CURRENT_DATE + interval '10 days', NULL,
    15000.00, 27500.00, 12500.00, 27500.00, 'PENDING', CURRENT_DATE + interval '10 days',
    'Pattern cutting in progress.', now() - interval '3 days', now()
),

-- Abirami Murugan (2 orders)
(
    gen_random_uuid(), 'ORD-2026-0029', '+91 98410 01234', 'Abirami Murugan',
    'Heritage Pavada', 'Chettinad Heritage Silk Pavada Set with Real Zari Borders',
    'Temple Classics', CURRENT_DATE - interval '13 days', CURRENT_DATE - interval '1 day', CURRENT_DATE - interval '1 day',
    28500.00, 28500.00, 0.00, 28500.00, 'DELIVERED', CURRENT_DATE - interval '1 day',
    'Delivered for Thanjavur temple festival.', now() - interval '13 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0030', '+91 98410 01234', 'Abirami Murugan',
    'Bridal Blouse', 'Antique Bronze Zari Handloom Blouse with Lotus Motifs',
    'Temple Classics', CURRENT_DATE - interval '6 days', CURRENT_DATE + interval '6 days', NULL,
    18000.00, 33500.00, 15500.00, 33500.00, 'IN_PROGRESS', CURRENT_DATE + interval '6 days',
    'Aari craftsmen working on lotus back medallion.', now() - interval '6 days', now()
),

-- Bhuvaneshwari Chandrasekar (5 orders)
(
    gen_random_uuid(), 'ORD-2026-0031', '+91 98411 12345', 'Bhuvaneshwari Chandrasekar',
    'Bridal Saree Ensemble', 'Custom Bridal Pure Korvai Silk Saree with Heavy Maggam Blouse',
    'Royal Heritage', CURRENT_DATE - interval '30 days', CURRENT_DATE - interval '8 days', CURRENT_DATE - interval '8 days',
    90000.00, 90000.00, 0.00, 90000.00, 'DELIVERED', CURRENT_DATE - interval '8 days',
    'Delivered in Kanchipuram for wedding muhurtham.', now() - interval '30 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0032', '+91 98411 12345', 'Bhuvaneshwari Chandrasekar',
    'Reception Lehenga', 'Peach & Gold Organza Kalidar Lehenga with Zari Embroidery',
    'Spring Blossom', CURRENT_DATE - interval '16 days', CURRENT_DATE + interval '2 days', NULL,
    30000.00, 58000.00, 28000.00, 58000.00, 'READY', CURRENT_DATE + interval '2 days',
    'Quality checked and ironed with dry clean cover.', now() - interval '16 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0033', '+91 98411 12345', 'Bhuvaneshwari Chandrasekar',
    'Saree Blouse', 'Royal Purple Silk Blouse with Mango Motif Zari Sleeves',
    'Temple Classics', CURRENT_DATE - interval '10 days', CURRENT_DATE + interval '4 days', NULL,
    8000.00, 14500.00, 6500.00, 14500.00, 'IN_PROGRESS', CURRENT_DATE + interval '4 days',
    'Customer visiting boutique for trial.', now() - interval '10 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0034', '+91 98411 12345', 'Bhuvaneshwari Chandrasekar',
    'Festive Kurti Set', 'Bottle Green Matka Silk Tunic with Raw Silk Cigarette Pants',
    'Festive Drapes', CURRENT_DATE - interval '6 days', CURRENT_DATE + interval '9 days', NULL,
    20000.00, 42000.00, 22000.00, 42000.00, 'IN_PROGRESS', CURRENT_DATE + interval '9 days',
    'Pants stitched, tunic embroidery ongoing.', now() - interval '6 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0035', '+91 98411 12345', 'Bhuvaneshwari Chandrasekar',
    'Saree Blouse', 'Coral Orange Pure Raw Silk Elbow Sleeves Blouse',
    'Classic Elegance', CURRENT_DATE - interval '2 days', CURRENT_DATE + interval '14 days', NULL,
    18000.00, 35500.00, 17500.00, 35500.00, 'PENDING', CURRENT_DATE + interval '14 days',
    'Fabric dyed, sent to cutting department.', now() - interval '2 days', now()
),

-- Deepalakshmi Palanisamy (1 order)
(
    gen_random_uuid(), 'ORD-2026-0036', '+91 98412 23456', 'Deepalakshmi Palanisamy',
    'Reception Gown', 'Wine Crepe Drape Gown with Crystal Belt',
    'Evening Glamour', CURRENT_DATE - interval '9 days', CURRENT_DATE + interval '6 days', NULL,
    12000.00, 22000.00, 10000.00, 22000.00, 'IN_PROGRESS', CURRENT_DATE + interval '6 days',
    'Draping pleats pinned and ready for trial fitting.', now() - interval '9 days', now()
),

-- Subhasree Balasubramanian (2 orders)
(
    gen_random_uuid(), 'ORD-2026-0037', '+91 98413 34567', 'Subhasree Balasubramanian',
    'Embroidered Jacket Set', 'Pastel Sage Green Chanderi Jacket with Silk Slip and Pants',
    'Contemporary Classic', CURRENT_DATE - interval '15 days', CURRENT_DATE - interval '2 days', CURRENT_DATE - interval '2 days',
    26000.00, 26000.00, 0.00, 26000.00, 'DELIVERED', CURRENT_DATE - interval '2 days',
    'Delivered in Besant Nagar.', now() - interval '15 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0038', '+91 98413 34567', 'Subhasree Balasubramanian',
    'Saree Blouse', 'Indigo Blue Pure Raw Silk Blouse with Mirrorwork',
    'Festive Drapes', CURRENT_DATE - interval '5 days', CURRENT_DATE + interval '7 days', NULL,
    18000.00, 32000.00, 14000.00, 32000.00, 'IN_PROGRESS', CURRENT_DATE + interval '7 days',
    'Mirrorwork hand setting in progress.', now() - interval '5 days', now()
),

-- Yazhini Senthilvel (3 orders)
(
    gen_random_uuid(), 'ORD-2026-0039', '+91 98414 45678', 'Yazhini Senthilvel',
    'Sharara Set', 'Fuchsia Pink Georgette Sharara Set with Mirror Border Dupatta',
    'Festive Drapes', CURRENT_DATE - interval '19 days', CURRENT_DATE - interval '4 days', CURRENT_DATE - interval '4 days',
    34500.00, 34500.00, 0.00, 34500.00, 'DELIVERED', CURRENT_DATE - interval '4 days',
    'Delivered with custom flared fall.', now() - interval '19 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0040', '+91 98414 45678', 'Yazhini Senthilvel',
    'Saree Blouse', 'Gold Zari Matka Silk Blouse with Back Cut-Out Arch',
    'Temple Classics', CURRENT_DATE - interval '8 days', CURRENT_DATE + interval '3 days', NULL,
    6000.00, 10500.00, 4500.00, 10500.00, 'READY', CURRENT_DATE + interval '3 days',
    'Ironed and packed.', now() - interval '8 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0041', '+91 98414 45678', 'Yazhini Senthilvel',
    'Lehenga', 'Yellow & Pink Silk Leheriya Festive Lehenga',
    'Spring Blossom', CURRENT_DATE - interval '4 days', CURRENT_DATE + interval '11 days', NULL,
    25000.00, 50000.00, 25000.00, 50000.00, 'IN_PROGRESS', CURRENT_DATE + interval '11 days',
    'Stitching in tailoring floor.', now() - interval '4 days', now()
),

-- Keerthana Muthukrishnan (4 orders)
(
    gen_random_uuid(), 'ORD-2026-0042', '+91 98415 56789', 'Keerthana Muthukrishnan',
    'Velvet Gown', 'Midnight Blue Royal Velvet Gown with Zardosi Work',
    'Evening Glamour', CURRENT_DATE - interval '21 days', CURRENT_DATE - interval '5 days', CURRENT_DATE - interval '5 days',
    55000.00, 55000.00, 0.00, 55000.00, 'DELIVERED', CURRENT_DATE - interval '5 days',
    'Delivered for family reception in Cuddalore.', now() - interval '21 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0043', '+91 98415 56789', 'Keerthana Muthukrishnan',
    'Bridal Blouse', 'Deep Crimson Silk Blouse with Peacock Aari Embroidery',
    'Royal Heritage', CURRENT_DATE - interval '11 days', CURRENT_DATE + interval '3 days', NULL,
    8000.00, 15500.00, 7500.00, 15500.00, 'IN_PROGRESS', CURRENT_DATE + interval '3 days',
    'Trial arranged for Thursday morning.', now() - interval '11 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0044', '+91 98415 56789', 'Keerthana Muthukrishnan',
    'Saree Blouse', 'Mustard Brocade Blouse with Potli Button Detailing',
    'Classic Elegance', CURRENT_DATE - interval '7 days', CURRENT_DATE + interval '5 days', NULL,
    6000.00, 9500.00, 3500.00, 9500.00, 'IN_PROGRESS', CURRENT_DATE + interval '5 days',
    'Armhole adjustment being completed.', now() - interval '7 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0045', '+91 98415 56789', 'Keerthana Muthukrishnan',
    'Anarkali Set', 'Teal Green Raw Silk Floor-Length Suit with Zari Border',
    'Spring Blossom', CURRENT_DATE - interval '3 days', CURRENT_DATE + interval '12 days', NULL,
    40000.00, 90000.00, 50000.00, 90000.00, 'PENDING', CURRENT_DATE + interval '12 days',
    'Fabric dyed, embroidery pattern confirmed.', now() - interval '3 days', now()
),

-- Thenmozhi Arumugam (1 order)
(
    gen_random_uuid(), 'ORD-2026-0046', '+91 98416 67890', 'Thenmozhi Arumugam',
    'Matka Silk Blouse', 'Traditional Red Handloom Matka Silk Blouse with Kantha Work',
    'Temple Classics', CURRENT_DATE - interval '8 days', CURRENT_DATE + interval '4 days', NULL,
    9000.00, 16500.00, 7500.00, 16500.00, 'IN_PROGRESS', CURRENT_DATE + interval '4 days',
    'Tailor stitching under way.', now() - interval '8 days', now()
),

-- Revathi Karthikeyan (2 orders)
(
    gen_random_uuid(), 'ORD-2026-0047', '+91 98417 78901', 'Revathi Karthikeyan',
    'Bridal Blouse', 'Tissue Silk Boat Neck Blouse with Cutwork Border',
    'Classic Elegance', CURRENT_DATE - interval '14 days', CURRENT_DATE - interval '2 days', CURRENT_DATE - interval '2 days',
    12000.00, 12000.00, 0.00, 12000.00, 'DELIVERED', CURRENT_DATE - interval '2 days',
    'Delivered via courier to Nagercoil.', now() - interval '14 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0048', '+91 98417 78901', 'Revathi Karthikeyan',
    'Festive Saree Ensemble', 'Pastel Peach Organza Saree with Designer Embroidered Blouse',
    'Spring Blossom', CURRENT_DATE - interval '6 days', CURRENT_DATE + interval '6 days', NULL,
    18000.00, 32000.00, 14000.00, 32000.00, 'IN_PROGRESS', CURRENT_DATE + interval '6 days',
    'Blouse aari work finished, saree pico and fall underway.', now() - interval '6 days', now()
),

-- Sivagami Meenakshisundaram (3 orders)
(
    gen_random_uuid(), 'ORD-2026-0049', '+91 98418 89012', 'Sivagami Meenakshisundaram',
    'Chettinad Saree Ensemble', 'Authentic Chettinad Mustard & Maroon Silk Saree with Heavy Maggam Blouse',
    'Heritage Weaves', CURRENT_DATE - interval '23 days', CURRENT_DATE - interval '7 days', CURRENT_DATE - interval '7 days',
    42000.00, 42000.00, 0.00, 42000.00, 'DELIVERED', CURRENT_DATE - interval '7 days',
    'Delivered to Karaikudi heritage mansion.', now() - interval '23 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0050', '+91 98418 89012', 'Sivagami Meenakshisundaram',
    'Bridal Blouse', 'Emerald Green Raw Silk Blouse with Traditional Temple Jewellery Motifs',
    'Temple Classics', CURRENT_DATE - interval '10 days', CURRENT_DATE + interval '3 days', NULL,
    8000.00, 15500.00, 7500.00, 15500.00, 'READY', CURRENT_DATE + interval '3 days',
    'Ready for express dispatch.', now() - interval '10 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0051', '+91 98418 89012', 'Sivagami Meenakshisundaram',
    'Anarkali Set', 'Royal Navy Blue Georgette Kalidar Suit with Zari Yoke',
    'Evening Glamour', CURRENT_DATE - interval '4 days', CURRENT_DATE + interval '12 days', NULL,
    25000.00, 47500.00, 22500.00, 47500.00, 'IN_PROGRESS', CURRENT_DATE + interval '12 days',
    'Craft team doing neck beading.', now() - interval '4 days', now()
),

-- Janani Padmanabhan (5 orders)
(
    gen_random_uuid(), 'ORD-2026-0052', '+91 98419 90123', 'Janani Padmanabhan',
    'Cutdana Saree Blouse', 'Crimson Red Raw Silk Sweetheart Neckline with Antique Zari Work',
    'Royal Heritage', CURRENT_DATE - interval '26 days', CURRENT_DATE - interval '6 days', CURRENT_DATE - interval '6 days',
    18500.00, 18500.00, 0.00, 18500.00, 'DELIVERED', CURRENT_DATE - interval '26 days',
    'Delivered in Mylapore.', now() - interval '26 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0053', '+91 98419 90123', 'Janani Padmanabhan',
    'Bridal Lehenga', 'Royal Plum Velvet Bridal Lehenga with Multi-Coloured Floral Vine Embroidery',
    'Royal Heritage', CURRENT_DATE - interval '18 days', CURRENT_DATE + interval '2 days', NULL,
    60000.00, 115000.00, 55000.00, 115000.00, 'READY', CURRENT_DATE + interval '2 days',
    'Final boutique quality inspection approved.', now() - interval '18 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0054', '+91 98419 90123', 'Janani Padmanabhan',
    'Carnatic Concert Saree Blouse', 'Deep Green Pure Kanchi Silk Blouse with Veena and Peacock Motifs',
    'Temple Classics', CURRENT_DATE - interval '11 days', CURRENT_DATE + interval '3 days', NULL,
    9000.00, 16500.00, 7500.00, 16500.00, 'IN_PROGRESS', CURRENT_DATE + interval '3 days',
    'Trial booked for Friday afternoon.', now() - interval '11 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0055', '+91 98419 90123', 'Janani Padmanabhan',
    'Festive Dhavani Set', 'Yellow and Rani Pink Tissue Silk Half Saree with Zari Border',
    'Heritage Weaves', CURRENT_DATE - interval '7 days', CURRENT_DATE + interval '8 days', NULL,
    20000.00, 42000.00, 22000.00, 42000.00, 'IN_PROGRESS', CURRENT_DATE + interval '8 days',
    'Pleating and waist gathering completed.', now() - interval '7 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0056', '+91 98419 90123', 'Janani Padmanabhan',
    'Saree Blouse', 'Copper Gold Brocade Princess Cut Blouse',
    'Classic Elegance', CURRENT_DATE - interval '2 days', CURRENT_DATE + interval '15 days', NULL,
    18000.00, 33000.00, 15000.00, 33000.00, 'PENDING', CURRENT_DATE + interval '15 days',
    'Advance received via Net Banking.', now() - interval '2 days', now()
),

-- Dhanalakshmi Ganesan (2 orders)
(
    gen_random_uuid(), 'ORD-2026-0057', '+91 98420 01234', 'Dhanalakshmi Ganesan',
    'Organza Floral Lehenga', 'Sea Green Organza Silk Lehenga with Pearl & Sequin Embroidery',
    'Spring Blossom', CURRENT_DATE - interval '12 days', CURRENT_DATE - interval '1 day', CURRENT_DATE - interval '1 day',
    22000.00, 22000.00, 0.00, 22000.00, 'DELIVERED', CURRENT_DATE - interval '12 days',
    'Delivered with custom organza dupatta and latkans.', now() - interval '12 days', now()
),
(
    gen_random_uuid(), 'ORD-2026-0058', '+91 98420 01234', 'Dhanalakshmi Ganesan',
    'Saree Blouse', 'Maroon Raw Silk Blouse with Gold Kasavu Border Edge',
    'Temple Classics', CURRENT_DATE - interval '5 days', CURRENT_DATE + interval '7 days', NULL,
    7000.00, 13000.00, 6000.00, 13000.00, 'IN_PROGRESS', CURRENT_DATE + interval '7 days',
    'Stitching in Karur local workshop.', now() - interval '5 days', now()
);

-- -----------------------------------------------------------------------------
-- 3. UPDATE CUSTOMERS' TOTAL SPEND AND BALANCE FROM GENERATED ORDERS
-- -----------------------------------------------------------------------------
UPDATE customers c
SET total_spend = COALESCE((SELECT SUM(total_amount) FROM orders o WHERE o.customer_mobile = c.mobile_number), 0),
    balance = COALESCE((SELECT SUM(balance_amount) FROM orders o WHERE o.customer_mobile = c.mobile_number), 0),
    updated_at = now();

-- -----------------------------------------------------------------------------
-- 4. SEED 10 TAMIL NADU ENQUIRIES
-- -----------------------------------------------------------------------------
INSERT INTO enquiries (
    id, enquiry_code, customer_name, phone, email, garment_type, notes,
    status, assigned_to, follow_up_date, source, created_at, updated_at
) VALUES
(
    gen_random_uuid(), 'ENQ-2026-0001', 'Pavithra Thangavel', '+91 98401 55667',
    'pavithra.thangavel@gmail.com', 'Bridal Blouse',
    'Inquired about hand aari cutdana work for November wedding muhurtham. Wants sweetheart neckline.',
    'PENDING', 'Sneha Patel', CURRENT_DATE + interval '2 days', 'WHATSAPP', now() - interval '3 days', now()
),
(
    gen_random_uuid(), 'ENQ-2026-0002', 'Kanimozhi Selvam', '+91 98402 66778',
    'kanimozhi.selvam@gmail.com', 'Half Saree (Dhavani)',
    'Looking for temple border pure tissue half saree set for her sister engagement.',
    'FOLLOW_UP', 'Priya S', CURRENT_DATE + interval '1 day', 'INSTAGRAM', now() - interval '2 days', now()
),
(
    gen_random_uuid(), 'ENQ-2026-0003', 'Malathi Karuppasamy', '+91 98403 77889',
    'malathi.k@gmail.com', 'Reception Velvet Gown',
    'Walk-in inquiry at boutique. Requested design sketches and fabric swatch preview.',
    'FOLLOW_UP', 'Sneha Patel', CURRENT_DATE + interval '3 days', 'WALK_IN', now() - interval '1 day', now()
),
(
    gen_random_uuid(), 'ENQ-2026-0004', 'Senthamarai Kannan', '+91 98404 88990',
    'senthamarai.k@gmail.com', 'Organza Floral Lehenga',
    'WhatsApp message requesting pricing for pastel green floral embroidered lehenga.',
    'CONVERTED', 'Priya S', CURRENT_DATE - interval '1 day', 'WHATSAPP', now() - interval '4 days', now()
),
(
    gen_random_uuid(), 'ENQ-2026-0005', 'Kokila Shanmugam', '+91 98405 99001',
    'kokila.shanmugam@gmail.com', 'Aari Work Silk Blouse',
    'Referred by customer Ananya Sundaram. Wants heavy elbow sleeve blouse with temple bells.',
    'PENDING', 'Sneha Patel', CURRENT_DATE + interval '4 days', 'REFERRAL', now() - interval '2 days', now()
),
(
    gen_random_uuid(), 'ENQ-2026-0006', 'Suganya Dhanasekaran', '+91 98406 00112',
    'suganya.d@gmail.com', 'Madurai Sungudi Anarkali',
    'Website inquiry. Inquiring about custom made-to-measure Sungudi cotton-silk fusion dresses.',
    'FOLLOW_UP', 'Aditi Rao', CURRENT_DATE + interval '2 days', 'WEBSITE', now() - interval '3 days', now()
),
(
    gen_random_uuid(), 'ENQ-2026-0007', 'Karthika Alagappan', '+91 98407 11223',
    'karthika.alagappan@gmail.com', 'Chettinad Silk Wedding Ensemble',
    'Instagram DM from Karaikudi asking for bridal trousseau consultation and doorstep trials.',
    'PENDING', 'Priya S', CURRENT_DATE + interval '5 days', 'INSTAGRAM', now() - interval '1 day', now()
),
(
    gen_random_uuid(), 'ENQ-2026-0008', 'Vanitha Ramanathan', '+91 98408 22334',
    'vanitha.r@gmail.com', 'Pre-Draped Georgette Saree',
    'Walked in for ready-to-wear pre-pleated cocktail saree with corset blouse. Converted to order.',
    'CONVERTED', 'Sneha Patel', CURRENT_DATE - interval '1 day', 'WALK_IN', now() - interval '5 days', now()
),
(
    gen_random_uuid(), 'ENQ-2026-0009', 'Manimegalai Sadasivam', '+91 98409 33445',
    'manimegalai.s@gmail.com', 'Raw Silk Brocade Kurti',
    'WhatsApp inquiry about sizing and delivery timeline for Diwali collection.',
    'PENDING', 'Aditi Rao', CURRENT_DATE + interval '6 days', 'WHATSAPP', now() - interval '2 days', now()
),
(
    gen_random_uuid(), 'ENQ-2026-0010', 'Aarthi Veerappan', '+91 98410 44556',
    'aarthi.v@gmail.com', 'Bandhani Mehendi Lehenga',
    'Friend recommendation. Looked for lightweight lehenga, order postponed to December.',
    'CLOSED', 'Sneha Patel', CURRENT_DATE - interval '2 days', 'REFERRAL', now() - interval '6 days', now()
);

-- -----------------------------------------------------------------------------
-- 5. SEED 10 BESPOKE DESIGNS (DESIGN STUDIO CATALOG)
-- -----------------------------------------------------------------------------
INSERT INTO designs (
    id, design_code, title, garment_type, status, designer, thumbnail_url,
    sub_category, style, occasion, collection, primary_fabric,
    colour_options, sizes, construction, embroidery,
    estimated_cost, suggested_price, estimated_labour,
    production_status, times_used, last_used_date,
    tags, swatches, image_urls, notes, created_by,
    created_at, updated_at
) VALUES
-- 1. Zari Bloom
(
    gen_random_uuid(), 'DS-2026-001', 'Zari Bloom', 'Blouse', 'APPROVED',
    'Priya S', '../assets/designs/zari-bloom-front.jpg',
    'Bridal Couture', 'Embroidered', 'Wedding', 'Royal Heritage', 'Banarasi Raw Silk',
    'Crimson Red, Emerald Green, Royal Blue, Mustard Gold', 'Custom / Made to Measure',
    'Padded, Sweetheart Neck, Dori Tie Back', 'Antique Zari, Cutdana Beads, Micro Sequins',
    2850.00, 8500.00, '6 hours', 'Active', 18, CURRENT_DATE - interval '10 days',
    'Bridal,Zari,Handwork,Bestseller,Sweetheart Neck', '#B82E5A,#D4AF37,#2D5A27',
    '../assets/designs/zari-bloom-front.jpg,../assets/designs/zari-bloom-back.jpg,../assets/designs/zari-bloom-detail.jpg',
    'Intricate floral zari jaal with sweetheart neckline and tasseled dori tie back.',
    'Priya S', now() - interval '40 days', now()
),
-- 2. Garden Party Lehenga
(
    gen_random_uuid(), 'DS-2026-002', 'Garden Party Lehenga', 'Lehenga', 'APPROVED',
    'Aditi Rao', '../assets/designs/garden-party.jpg',
    'Mehendi & Sangeet', 'Printed & Embroidered', 'Sangeet', 'Spring Blossom', 'Organza Silk',
    'Blush Pink, Mint Green, Lilac, Champagne', 'Custom Waist & Length',
    'Can-Can Layered, Cancan Net, Side Zip with Tassels', 'Resham Threadwork, Pearl Beads & Mirrors',
    9200.00, 24500.00, '14 hours', 'Active', 11, CURRENT_DATE - interval '8 days',
    'Lehenga,Organza,Floral,Pastel,Sangeet', '#E6A7B8,#A9D8E8,#E6D37A',
    '../assets/designs/garden-party.jpg,../assets/designs/garden-party-swatch.jpg',
    'Delicate pastel organza with blooming floral embroidery and pearl border accents.',
    'Aditi Rao', now() - interval '38 days', now()
),
-- 3. Regal Drape Saree
(
    gen_random_uuid(), 'DS-2026-003', 'Regal Drape Saree', 'Saree', 'APPROVED',
    'Sneha Patel', '../assets/designs/regal-drape.jpg',
    'Cocktail & Reception', 'Contemporary Fusion', 'Reception', 'Heritage Weaves', 'Pure Georgette & Tissue Silk',
    'Peacock Blue, Deep Wine, Midnight Black, Metallic Copper', 'Free Size / Custom Blouse',
    'Pre-pleated, Concealed Side Hook, Attached Pallu Drape', 'Cutdana Border, Glass Bead Tassels',
    7600.00, 19800.00, '10 hours', 'Active', 14, CURRENT_DATE - interval '6 days',
    'Saree,Pre-draped,Georgette,Cocktail,Reception', '#1B365D,#4A0E17,#2A2A2A',
    '../assets/designs/regal-drape.jpg',
    'Effortless pre-pleated drape with structured waist pleats and embellished pallu edge.',
    'Sneha Patel', now() - interval '35 days', now()
),
-- 4. Noor Angrakha Kurti
(
    gen_random_uuid(), 'DS-2026-004', 'Noor Angrakha Kurti', 'Kurti', 'APPROVED',
    'Aditi Rao', '../assets/designs/noor-angrakha.jpg',
    'Festive Occasion', 'Woven Handloom', 'Festive', 'Spring Blossom', 'Chanderi Silk',
    'Ivory White, Mustard Gold, Rose Quartz', 'XS, S, M, L, XL, Custom',
    'Overlapping Front Angrakha with Fabric Potli Ties', 'Gota Patti Hemline, Micro Zari Booti',
    3100.00, 7800.00, '5 hours', 'Active', 22, CURRENT_DATE - interval '4 days',
    'Kurti,Angrakha,Chanderi,Festive,Gota Patti', '#F5F2E9,#D4AF37,#C4829F',
    '../assets/designs/noor-angrakha.jpg',
    'Classic Mughal-inspired overlap silhouette with handcrafted fabric potlis and zari borders.',
    'Aditi Rao', now() - interval '32 days', now()
),
-- 5. Celestial Velvet Gown
(
    gen_random_uuid(), 'DS-2026-005', 'Celestial Velvet Gown', 'Gown', 'APPROVED',
    'Priya S', '../assets/designs/celestial-gown.jpg',
    'Red Carpet & Evening', 'Contemporary Fusion', 'Reception', 'Royal Heritage', 'Micro Silk Velvet',
    'Midnight Blue, Forest Green, Deep Emerald', 'Custom Tailored Fit',
    'Corset Structured Bodice, Built-in Bra Cups, Mermaid Flare', 'Zardosi Work, Japanese Micro Beads',
    11500.00, 32000.00, '18 hours', 'Active', 7, CURRENT_DATE - interval '7 days',
    'Gown,Velvet,Corset,Evening,Red Carpet', '#0D1B2A,#1B4332,#4A154B',
    '../assets/designs/celestial-gown.jpg',
    'Figure-skimming silhouette in ultra-soft micro velvet with jewel-encrusted sleeve cuffs.',
    'Priya S', now() - interval '30 days', now()
),
-- 6. Mirrored Mirage Blouse
(
    gen_random_uuid(), 'DS-2026-006', 'Mirrored Mirage Blouse', 'Blouse', 'APPROVED',
    'Sneha Patel', '../assets/designs/mirrored-mirage.jpg',
    'Mehendi & Festive', 'Embroidered', 'Sangeet', 'Spring Blossom', 'Raw Silk with Cotton Lining',
    'Rani Pink, Sunshine Yellow, Parrot Green', 'Custom Made to Measure',
    'Deep V Neck, Short Sleeves, Back Potli Button Fastening', 'Hand Cut Real Foil Mirrors, Resham Embroidery',
    2400.00, 6900.00, '5.5 hours', 'Active', 26, CURRENT_DATE - interval '3 days',
    'Blouse,Mirrorwork,Sangeet,Rani Pink,Sweetheart', '#E60067,#FFB703,#38B000',
    '../assets/designs/mirrored-mirage.jpg',
    'Vibrant handcrafted real mirrorwork along neckline and sleeve hem with contrasting resham accents.',
    'Sneha Patel', now() - interval '28 days', now()
),
-- 7. Chandni Raat Lehenga
(
    gen_random_uuid(), 'DS-2026-007', 'Chandni Raat Lehenga', 'Lehenga', 'APPROVED',
    'Aditi Rao', '../assets/designs/chandni-raat.jpg',
    'Cocktail & Sangeet', 'Contemporary Fusion', 'Sangeet', 'Royal Heritage', 'Silk Net with Satin Base',
    'Silver Pearl, Charcoal Grey, Rose Gold', 'Custom Waist & Length',
    '16 Kalis Circular Flare, Reinforced Waistband, Double Latkan Dori', 'Silver Sequins, Glass Bugle Beads, Resham Work',
    8800.00, 26000.00, '15 hours', 'Active', 9, CURRENT_DATE - interval '5 days',
    'Lehenga,Silver,Sequins,Sangeet,Glamour', '#C0C0C0,#333333,#B76E79',
    '../assets/designs/chandni-raat.jpg',
    'Shimmering starry-night effect with graduating silver sequins cascading down 16 circular kalis.',
    'Aditi Rao', now() - interval '25 days', now()
),
-- 8. Kanjeevaram Royal Weave
(
    gen_random_uuid(), 'DS-2026-008', 'Kanjeevaram Royal Weave', 'Saree', 'APPROVED',
    'Priya S', '../assets/designs/kanjeevaram-royal.jpg',
    'Bridal Muhurtham', 'Woven Handloom', 'Wedding', 'Heritage Weaves', 'Pure Mulberry Silk (Kanchipuram)',
    'Traditional Maroon, Rama Green, Golden Yellow', '6.2 Meters with Running Blouse Piece',
    'Korvai Weave Technique, Contrast Pallu & Border', 'Pure Zari Temple Korvai Border, Mayil (Peacock) Motifs',
    14000.00, 38500.00, '22 hours', 'Active', 16, CURRENT_DATE - interval '9 days',
    'Saree,Kanjeevaram,Handloom,Bridal,Muhurtham', '#800020,#004225,#CC7722',
    '../assets/designs/kanjeevaram-royal.jpg',
    'Authentic Kanchipuram silk hand-woven on traditional pit looms featuring 3-shuttle interlocking korvai border.',
    'Priya S', now() - interval '22 days', now()
),
-- 9. Sitara Floor-Length Anarkali
(
    gen_random_uuid(), 'DS-2026-009', 'Sitara Floor-Length Anarkali', 'Gown', 'APPROVED',
    'Sneha Patel', '../assets/designs/sitara-anarkali.jpg',
    'Festive Occasion', 'Embroidered', 'Festive', 'Spring Blossom', 'Georgette Silk with Shantoon Lining',
    'Deep Plum, Olive Green, Amber Ochre', 'XS to 3XL / Bespoke',
    '32 Kali Umbrella Flare, Yoke Padded Support, Side Zipper', 'Fine Mukaish Hand Dots, Zari Bordering',
    4200.00, 11900.00, '7 hours', 'Active', 13, CURRENT_DATE - interval '11 days',
    'Anarkali,Georgette,Mukaish,Festive,Plum', '#3B1E54,#556B2F,#C68B59',
    '../assets/designs/sitara-anarkali.jpg',
    'Dramatic 32-kali twirling silhouette embellished with delicate star-like mukaish metal dots.',
    'Sneha Patel', now() - interval '20 days', now()
),
-- 10. Minimal Muse Blouse
(
    gen_random_uuid(), 'DS-2026-010', 'Minimal Muse Blouse', 'Blouse', 'APPROVED',
    'Aditi Rao', '../assets/designs/minimal-muse.jpg',
    'Contemporary Classic', 'Minimalist', 'Formal', 'Everyday Luxury', 'Matka Silk with Threadwork',
    'Ivory White, Charcoal Grey, Tan Gold', 'Custom Made to Measure',
    'Boat Neck, Elbow Sleeves, Concealed Side Zipper', 'Tonal Hand Kantha Stitching along Neckline',
    1600.00, 4800.00, '3.5 hours', 'Active', 31, CURRENT_DATE - interval '2 days',
    'Boat Neck,Matka Silk,Minimalist,Workwear', '#1F2937,#4B5563,#F3F4F6',
    '../assets/designs/minimal-muse.jpg,../assets/designs/blouse-stage.png',
    'Sophisticated minimalist blouse suitable for handloom sarees and formal occasions.',
    'Aditi Rao', now() - interval '18 days', now()
);

COMMIT;

