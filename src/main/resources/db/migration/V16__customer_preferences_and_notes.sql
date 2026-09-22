-- =======================================================================
-- V16__customer_preferences_and_notes.sql
-- Add granular customer tailoring preferences and multi-author notes table
-- =======================================================================

-- 1. Extend customers table with specific style & tailoring preference columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_neck VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_sleeve VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_occasions VARCHAR(200);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_preference VARCHAR(100);

-- 2. Create customer_notes table for multi-author timestamped CRM notes
CREATE TABLE IF NOT EXISTS customer_notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_mobile VARCHAR(30) NOT NULL REFERENCES customers(mobile_number) ON DELETE CASCADE,
    note_text       TEXT NOT NULL,
    author_name     VARCHAR(100) NOT NULL DEFAULT 'Atelier Staff',
    author_badge    VARCHAR(10) NOT NULL DEFAULT 'AS',
    category        VARCHAR(50) DEFAULT 'GENERAL',
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cust_notes_mobile ON customer_notes (customer_mobile);
CREATE INDEX IF NOT EXISTS idx_cust_notes_date   ON customer_notes (created_at DESC);

-- 3. Seed tailoring preferences for top patron accounts
UPDATE customers
SET preferred_neck = 'Round, Deep Sweetheart',
    preferred_sleeve = '3/4 Sleeve with Maggam Cut',
    preferred_occasions = 'Weddings, Receptions, Family Galas',
    delivery_preference = 'Evening Atelier Delivery'
WHERE mobile_number = '+91 98413 34567'; -- Subhasree Balasubramanian

UPDATE customers
SET preferred_neck = 'Boat Neck, U-Back',
    preferred_sleeve = 'Elbow Length Zari Trim',
    preferred_occasions = 'Temple Festivals, Traditional Poojas',
    delivery_preference = 'Weekday Afternoon Fitting'
WHERE mobile_number = '+91 98408 89012'; -- Nithya Venkatesan

UPDATE customers
SET preferred_neck = 'Sweetheart Illusion, Sheer Yoke',
    preferred_sleeve = 'Sleeveless with Cape Drape',
    preferred_occasions = 'Cocktail Parties, Destination Weddings',
    delivery_preference = 'Express Atelier Delivery'
WHERE mobile_number = '+91 98401 12345'; -- Ananya Sundaram

-- Set fallback defaults for any other customer
UPDATE customers
SET preferred_neck = COALESCE(preferred_neck, 'Contemporary Soft V-Neck'),
    preferred_sleeve = COALESCE(preferred_sleeve, 'Elbow Length Bespoke'),
    preferred_occasions = COALESCE(preferred_occasions, 'Festivals, Weddings & Celebrations'),
    delivery_preference = COALESCE(delivery_preference, 'Standard Boutique Pickup');

-- 4. Seed initial CRM notes for Subhasree Balasubramanian
INSERT INTO customer_notes (id, customer_mobile, note_text, author_name, author_badge, category, created_at)
VALUES
('b0000001-0000-0000-0000-000000000001', '+91 98413 34567', 'Prefers pastel shades and subtle contrast zari for day events. Loves our hand embroidery work.', 'Pooja B.', 'PB', 'STYLE', '2026-09-08 11:30:00'),
('b0000001-0000-0000-0000-000000000002', '+91 98413 34567', 'Customer very happy with the blouse armhole fit. Mentioned she will be referring her sister for wedding wear.', 'Ananya N.', 'AN', 'FEEDBACK', '2026-08-21 15:45:00'),
('b0000001-0000-0000-0000-000000000003', '+91 98413 34567', 'Requested lighter blouse padding. Updated body measurements profile v1.', 'Master Tailor Karthik', 'MK', 'FITTING', '2026-07-14 10:15:00');
