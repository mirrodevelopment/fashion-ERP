-- V11__seed_inventory_suppliers_payments_trials.sql
-- Seed script for inventory, suppliers, purchases, payments, and trials

-- 1. SEED SUPPLIERS (5 Authentic Luxury Textile & Trim Merchants)
INSERT INTO suppliers (id, supplier_code, name, contact_person, phone, email, address, specialization, notes)
VALUES
('b1000001-0000-0000-0000-000000000001', 'SUP-001', 'Kanchipuram Heritage Silk Weavers', 'Sundaramurthy Chettiar', '+91 94441 23451', 'sundaram@heritagekanchi.com', '124 Mettu Street, Kanchipuram, Tamil Nadu 631501', 'Pure Mulberry Silk & 3-Ply Gold Zari Brocades', 'Primary weaver for bridal muhurtham silks since 2021.'),
('b1000001-0000-0000-0000-000000000002', 'SUP-002', 'Surat Zari & Resham Emporium', 'Maheshbhai Patel', '+91 98251 34562', 'orders@suratzari.com', 'B-402 Millenium Market, Ring Road, Surat, Gujarat 395002', 'Real Gold/Silver Zari, Metallic Floss & Resham Threads', 'Fast 48-hour dispatched express courier delivery.'),
('b1000001-0000-0000-0000-000000000003', 'SUP-003', 'Madurai Royal Lining & Canvas Hub', 'K. Murugan', '+91 98421 45673', 'sales@madurailinings.in', '45 South Veli Street, Madurai, Tamil Nadu 625001', 'Pure Cotton Voile, Satoon Silk, Canvas Interfacing, Can-Can', 'High temperature preshrunk linings guaranteed color-fast.'),
('b1000001-0000-0000-0000-000000000004', 'SUP-004', 'Boutique Buttons & Tassels Mumbai', 'Zainab Merchant', '+91 98201 56784', 'zainab@mumbaitrims.com', '18 Crawford Market, Fort, Mumbai, Maharashtra 400001', 'Handcrafted Latkans, Potli Buttons, Kundan Brooches, YKK Zips', 'Handmade bridal latkans and brass hardware embellishments.'),
('b1000001-0000-0000-0000-000000000005', 'SUP-005', 'Varanasi Organza & Tissue Mill', 'Alok Pandey', '+91 94151 67895', 'alok@varanasitissue.in', '72 Chowk, Thatheri Bazaar, Varanasi, Uttar Pradesh 221001', 'Pure Tissue Organza, Chanderi & Banarasi Chiffon', 'Handloom sheer tissues in rose gold and antique silver tones.')
ON CONFLICT (supplier_code) DO NOTHING;

-- 2. SEED INVENTORY ITEMS (20 Essential Couture Fabrics & Trims)
INSERT INTO inventory_items (id, item_code, name, category, variant, unit, stock_qty, reserved_qty, reorder_level, purchase_price, supplier_name, status)
VALUES
('e0000001-0000-0000-0000-000000000001', 'FAB-001', 'Kanchipuram Pure Raw Silk', 'Fabrics', 'Deep Crimson Red', 'Meter', 85.00, 24.00, 20.00, 1850.00, 'Kanchipuram Heritage Silk Weavers', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000002', 'FAB-002', 'Kanchipuram Pure Raw Silk', 'Fabrics', 'Royal Mustard Gold', 'Meter', 60.00, 15.00, 20.00, 1850.00, 'Kanchipuram Heritage Silk Weavers', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000003', 'FAB-003', 'Banarasi Handloom Brocade', 'Fabrics', 'Peacock Blue & Gold', 'Meter', 42.00, 12.00, 15.00, 2400.00, 'Kanchipuram Heritage Silk Weavers', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000004', 'FAB-004', 'Pure Tissue Organza', 'Fabrics', 'Champagne Rose Gold', 'Meter', 110.00, 35.00, 30.00, 950.00, 'Varanasi Organza & Tissue Mill', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000005', 'FAB-005', 'Pure Tissue Organza', 'Fabrics', 'Pastel Sage Green', 'Meter', 75.00, 20.00, 25.00, 950.00, 'Varanasi Organza & Tissue Mill', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000006', 'FAB-006', 'Heavy Viscose Georgette (60 GSM)', 'Fabrics', 'Ivory Pearl', 'Meter', 140.00, 40.00, 40.00, 480.00, 'Surat Zari & Resham Emporium', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000007', 'FAB-007', 'Heavy Viscose Georgette (60 GSM)', 'Fabrics', 'Midnight Navy', 'Meter', 18.00, 15.00, 30.00, 480.00, 'Surat Zari & Resham Emporium', 'LOW_STOCK'),
('e0000001-0000-0000-0000-000000000008', 'FAB-008', 'Pure Chanderi Silk Cotton', 'Fabrics', 'Lavender Blush', 'Meter', 55.00, 10.00, 20.00, 720.00, 'Varanasi Organza & Tissue Mill', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000009', 'LIN-001', 'Pure Cotton Voile Lining', 'Linings', 'Bleached White', 'Meter', 320.00, 80.00, 100.00, 85.00, 'Madurai Royal Lining & Canvas Hub', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000010', 'LIN-002', 'High-Density Satoon Silk Lining', 'Linings', 'Natural Beige', 'Meter', 240.00, 65.00, 80.00, 115.00, 'Madurai Royal Lining & Canvas Hub', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000011', 'LIN-003', 'Heavy Bridal Can-Can Mesh', 'Linings', 'Stiff White Net', 'Meter', 180.00, 50.00, 50.00, 65.00, 'Madurai Royal Lining & Canvas Hub', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000012', 'LIN-004', 'Microdot Fusible Collar Canvas', 'Linings', 'Charcoal Grey', 'Meter', 95.00, 20.00, 30.00, 140.00, 'Madurai Royal Lining & Canvas Hub', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000013', 'THD-001', 'Pure Gold Zari Spool (Grade A)', 'Threads', 'Antique Dull Gold', 'Spool', 48.00, 12.00, 20.00, 220.00, 'Surat Zari & Resham Emporium', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000014', 'THD-002', 'Pure Silver Zari Spool (Grade A)', 'Threads', 'Sterling White Silver', 'Spool', 36.00, 10.00, 15.00, 220.00, 'Surat Zari & Resham Emporium', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000015', 'THD-003', 'Vardhman Coats Poly Sewing Thread', 'Threads', 'Bridal Red #412', 'Spool', 85.00, 25.00, 30.00, 45.00, 'Surat Zari & Resham Emporium', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000016', 'THD-004', 'Vardhman Coats Poly Sewing Thread', 'Threads', 'Golden Mustard #208', 'Spool', 72.00, 18.00, 25.00, 45.00, 'Surat Zari & Resham Emporium', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000017', 'ACC-001', 'Handcrafted Silk Potli Buttons', 'Accessories', 'Red & Gold (Pack of 50)', 'Pack', 30.00, 8.00, 15.00, 280.00, 'Boutique Buttons & Tassels Mumbai', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000018', 'ACC-002', 'Bridal Zardozi Latkan Pair', 'Accessories', 'Emerald & Pearl Beads', 'Pair', 22.00, 6.00, 10.00, 650.00, 'Boutique Buttons & Tassels Mumbai', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000019', 'ACC-003', 'YKK Concealed Zipper (12 inch)', 'Accessories', 'Assorted Pastel & Bridal Tones', 'Piece', 150.00, 45.00, 50.00, 28.00, 'Boutique Buttons & Tassels Mumbai', 'IN_STOCK'),
('e0000001-0000-0000-0000-000000000020', 'ACC-004', 'Bra Cups Soft Padded Contoured', 'Accessories', 'Size 34-36 Skin Nude', 'Pair', 65.00, 20.00, 25.00, 75.00, 'Boutique Buttons & Tassels Mumbai', 'IN_STOCK')
ON CONFLICT (item_code) DO NOTHING;

-- 3. SEED PURCHASE ORDERS (3 Realistic Purchase Orders with Line Items)
INSERT INTO purchase_orders (id, po_code, supplier_id, status, total_amount, order_date, expected_date, notes)
VALUES
('c1000001-0000-0000-0000-000000000001', 'PO-2026-0001', 'b1000001-0000-0000-0000-000000000001', 'RECEIVED', 148000.00, CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '7 days', 'Bridal wedding season bulk silk replenishment.'),
('c1000001-0000-0000-0000-000000000002', 'PO-2026-0002', 'b1000001-0000-0000-0000-000000000002', 'PARTIALLY_RECEIVED', 42600.00, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '3 days', 'Zari spools and silk floss embroidery threads.'),
('c1000001-0000-0000-0000-000000000003', 'PO-2026-0003', 'b1000001-0000-0000-0000-000000000004', 'SENT', 28500.00, CURRENT_DATE - INTERVAL '1 days', CURRENT_DATE + INTERVAL '5 days', 'Concealed zips, potli buttons and bridal latkans.')
ON CONFLICT (po_code) DO NOTHING;

INSERT INTO purchase_order_items (id, po_id, item_id, item_name, quantity, unit, unit_price, received_qty)
VALUES
('c2000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'Kanchipuram Pure Raw Silk (Crimson)', 50.00, 'Meter', 1850.00, 50.00),
('c2000001-0000-0000-0000-000000000002', 'c1000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', 'Kanchipuram Pure Raw Silk (Gold)', 30.00, 'Meter', 1850.00, 30.00),
('c2000001-0000-0000-0000-000000000003', 'c1000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000013', 'Pure Gold Zari Spool (Grade A)', 120.00, 'Spool', 220.00, 80.00),
('c2000001-0000-0000-0000-000000000004', 'c1000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000014', 'Pure Silver Zari Spool (Grade A)', 70.00, 'Spool', 220.00, 70.00),
('c2000001-0000-0000-0000-000000000005', 'c1000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000017', 'Handcrafted Silk Potli Buttons', 50.00, 'Pack', 280.00, 0.00),
('c2000001-0000-0000-0000-000000000006', 'c1000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000019', 'YKK Concealed Zipper (12 inch)', 250.00, 'Piece', 28.00, 0.00)
ON CONFLICT DO NOTHING;

-- 4. SEED PAYMENTS & TRANSACTIONS (Synthesized from real orders)
INSERT INTO payments (id, order_id, customer_mobile, total_amount, paid_amount, status, due_date, notes)
SELECT
    gen_random_uuid(),
    o.id,
    o.customer_mobile,
    o.total_amount,
    o.advance_paid,
    CASE
        WHEN o.balance_amount <= 0 THEN 'FULLY_PAID'
        WHEN o.advance_paid > 0 THEN 'PARTIAL'
        ELSE 'PENDING'
    END,
    COALESCE(o.expected_delivery_date, CURRENT_DATE + INTERVAL '10 days'),
    'Auto-linked ledger payment record for ' || o.order_code
FROM orders o
WHERE NOT EXISTS (
    SELECT 1 FROM payments p WHERE p.order_id = o.id
);

-- Insert transaction records for orders with advance payments
INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes)
SELECT
    gen_random_uuid(),
    p.id,
    p.paid_amount,
    CASE (ROW_NUMBER() OVER (ORDER BY p.id) % 4)
        WHEN 0 THEN 'UPI'
        WHEN 1 THEN 'CARD'
        WHEN 2 THEN 'BANK_TRANSFER'
        ELSE 'CASH'
    END,
    'Pranesh B',
    'TXN-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD((ROW_NUMBER() OVER (ORDER BY p.id))::text, 4, '0'),
    p.created_at,
    'Advance settlement received at order creation desk'
FROM payments p
WHERE p.paid_amount > 0
  AND NOT EXISTS (
      SELECT 1 FROM payment_transactions pt WHERE pt.payment_id = p.id
  );

-- 5. SEED TRIALS & ALTERATIONS (Synthesized for active orders)
INSERT INTO trials (
    id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection,
    trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date,
    neck_style, sleeve_style, lining, embroidery, fabric, spec_notes, notes
)
SELECT
    gen_random_uuid(),
    'TRL-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY o.order_code)::text, 4, '0'),
    o.id,
    o.order_code,
    o.customer_mobile,
    o.customer_name,
    o.garment_type,
    COALESCE(o.collection, 'Bridal Couture Collection'),
    CURRENT_DATE + ((ROW_NUMBER() OVER (ORDER BY o.order_code) % 7) || ' days')::interval,
    CASE (ROW_NUMBER() OVER (ORDER BY o.order_code) % 4)
        WHEN 0 THEN '11:00 AM'
        WHEN 1 THEN '02:30 PM'
        WHEN 2 THEN '04:00 PM'
        ELSE '05:30 PM'
    END,
    CASE (ROW_NUMBER() OVER (ORDER BY o.order_code) % 3)
        WHEN 0 THEN 'First Fitting'
        WHEN 1 THEN 'Second Trial'
        ELSE 'Final QC Fitting'
    END,
    CASE (ROW_NUMBER() OVER (ORDER BY o.order_code) % 4)
        WHEN 0 THEN 'TODAY'
        WHEN 1 THEN 'TODAY'
        WHEN 2 THEN 'UPCOMING'
        ELSE 'COMPLETED'
    END,
    CASE (ROW_NUMBER() OVER (ORDER BY o.order_code) % 3)
        WHEN 0 THEN 'PERFECT'
        WHEN 1 THEN 'ALTERATIONS_NEEDED'
        ELSE 'PENDING'
    END,
    'Lakshmi Priya',
    o.expected_delivery_date,
    'Sweetheart (Front), Deep V Back with Dori',
    'Elbow Length with Zari Border',
    'Pure Cotton Voile & Silk Lining',
    'Antique Zardozi with Pearl Beading',
    'Pure Raw Silk & Brocade',
    'Handle with care. High priority bridal outfit.',
    'Client requested extra 0.5 margin at side seams for ease.'
FROM orders o
WHERE o.status IN ('IN_PROGRESS', 'PENDING')
LIMIT 12
ON CONFLICT DO NOTHING;

-- Insert trial alterations for trials needing alteration
INSERT INTO trial_alterations (id, trial_id, description, category, completed, created_at)
SELECT
    gen_random_uuid(),
    t.id,
    'Take in waist side seams by 0.5 inch',
    'Fit',
    false,
    now()
FROM trials t
WHERE t.fit_status = 'ALTERATIONS_NEEDED'
UNION ALL
SELECT
    gen_random_uuid(),
    t.id,
    'Adjust sleeve length hem by 0.25 inch',
    'Length',
    true,
    now()
FROM trials t
WHERE t.fit_status = 'ALTERATIONS_NEEDED';
