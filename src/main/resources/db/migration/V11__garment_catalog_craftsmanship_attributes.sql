-- ============================================================================
-- Migration V11: Garment Catalog & Craftsmanship Attributes
-- Decouples garments from mandatory customer/order bindings and adds
-- first-class haute couture garment attributes (fabric, craft, color, pricing).
-- ============================================================================

-- 1. Make customer/order/due_date columns nullable on garments
ALTER TABLE public.garments
    ALTER COLUMN order_code DROP NOT NULL,
    ALTER COLUMN customer_name DROP NOT NULL,
    ALTER COLUMN due_date DROP NOT NULL;

-- 2. Add craftsmanship, silhouette, and pricing columns to garments
ALTER TABLE public.garments
    ADD COLUMN IF NOT EXISTS primary_fabric character varying(150),
    ADD COLUMN IF NOT EXISTS embroidery_type character varying(150),
    ADD COLUMN IF NOT EXISTS color_name character varying(100),
    ADD COLUMN IF NOT EXISTS color_hex character varying(30),
    ADD COLUMN IF NOT EXISTS estimated_cost numeric(12,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS suggested_price numeric(12,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS crafting_hours integer DEFAULT 24,
    ADD COLUMN IF NOT EXISTS silhouette character varying(150),
    ADD COLUMN IF NOT EXISTS is_sample boolean DEFAULT true;

-- 3. Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_garments_primary_fabric ON public.garments USING btree (primary_fabric);
CREATE INDEX IF NOT EXISTS idx_garments_embroidery ON public.garments USING btree (embroidery_type);
CREATE INDEX IF NOT EXISTS idx_garments_is_sample ON public.garments USING btree (is_sample);

-- 4. Backfill existing records with clean defaults
UPDATE public.garments
SET primary_fabric = CASE 
        WHEN garment_type ILIKE '%Lehenga%' THEN 'Pure Micro Velvet 9000'
        WHEN garment_type ILIKE '%Blouse%' THEN 'Pure Raw Silk 80g'
        WHEN garment_type ILIKE '%Saree%' THEN 'Banarasi Katan Silk'
        WHEN garment_type ILIKE '%Sherwani%' THEN 'Raw Silk 80g'
        WHEN garment_type ILIKE '%Anarkali%' THEN 'Mulberry Georgette'
        WHEN garment_type ILIKE '%Gown%' THEN 'Imported Satin & Fluted Net'
        ELSE 'Brocade Silk'
    END
WHERE primary_fabric IS NULL OR primary_fabric = '';

UPDATE public.garments
SET embroidery_type = CASE 
        WHEN specs ILIKE '%zari%' OR specs ILIKE '%zardozi%' THEN 'Hand Zardozi with Dabka'
        WHEN specs ILIKE '%chikankari%' THEN 'Lucknowi Chikankari & Mukaish'
        WHEN specs ILIKE '%cutwork%' THEN 'Hand Crystal Cutwork'
        ELSE 'Artisanal Zari & Resham'
    END
WHERE embroidery_type IS NULL OR embroidery_type = '';

UPDATE public.garments
SET color_name = COALESCE(color_name, 'Royal Crimson'),
    color_hex = COALESCE(color_hex, '#9B111E'),
    suggested_price = CASE WHEN suggested_price IS NULL OR suggested_price = 0 THEN COALESCE(total_amount, 28000.00) ELSE suggested_price END,
    estimated_cost = CASE WHEN estimated_cost IS NULL OR estimated_cost = 0 THEN ROUND(COALESCE(total_amount, 28000.00) * 0.42, 2) ELSE estimated_cost END,
    crafting_hours = COALESCE(crafting_hours, 32),
    silhouette = COALESCE(silhouette, specs, 'Custom Atelier Silhouette');

-- 5. Seed diverse Haute Couture sample garments for each active company
DO $$
DECLARE
    comp RECORD;
BEGIN
    FOR comp IN SELECT id, company_name FROM public.company_settings LOOP

        -- GAR-101: Royal Zardozi Velvet Lehenga
        INSERT INTO public.garments (
            id, garment_code, title, garment_type, specs, design_code, collection_name,
            production_stage, material_status, priority, status, assigned_to, designer, branch,
            image_url, notes, company_id, primary_fabric, embroidery_type, color_name, color_hex,
            estimated_cost, suggested_price, crafting_hours, silhouette, is_sample, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            'GAR-101',
            'Royal Zardozi Velvet Lehenga',
            'Lehenga',
            '16-Kali flared skirt, structured waistband, reinforced can-can, matching latkans',
            'DSN-042',
            'Heritage Bridal 2026',
            'STITCHING',
            'READY',
            'HIGH',
            'IN_PRODUCTION',
            'Master Rafiq',
            'Amina Al-Mansoor',
            'Main Branch',
            '../assets/garments/heritage_lehenga_pink.jpg',
            'Flagship bridal sample piece with handcrafted gold dabka borders.',
            comp.id,
            'Pure Micro Velvet 9000',
            'Hand Zardozi with Dabka & Nakshi',
            'Crimson Ruby',
            '#9B111E',
            18500.00,
            48000.00,
            48,
            '16-Kali Flared Silhouette',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (garment_code) DO NOTHING;

        -- GAR-102: Banarasi Katan Organza Saree
        INSERT INTO public.garments (
            id, garment_code, title, garment_type, specs, design_code, collection_name,
            production_stage, material_status, priority, status, assigned_to, designer, branch,
            image_url, notes, company_id, primary_fabric, embroidery_type, color_name, color_hex,
            estimated_cost, suggested_price, crafting_hours, silhouette, is_sample, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            'GAR-102',
            'Banarasi Katan Organza Saree',
            'Saree',
            'Handwoven zari pallu, scallop embroidered border, unstitched blouse piece included',
            'DSN-019',
            'Festive 2026',
            'READY',
            'READY',
            'NORMAL',
            'Ready',
            'Ravi M',
            'Sanya Kapoor',
            'Main Branch',
            '../assets/garments/banarasi_organza_saree.jpg',
            'Showroom display piece in pure emerald banarasi weave.',
            comp.id,
            'Banarasi Katan Silk & Organza',
            'Zari Woven Border with Resham Pallu',
            'Emerald Gold',
            '#046307',
            12000.00,
            32000.00,
            36,
            'Draped Pre-Pleated Saree',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (garment_code) DO NOTHING;

        -- GAR-103: Raw Silk Embroidered Sherwani
        INSERT INTO public.garments (
            id, garment_code, title, garment_type, specs, design_code, collection_name,
            production_stage, material_status, priority, status, assigned_to, designer, branch,
            image_url, notes, company_id, primary_fabric, embroidery_type, color_name, color_hex,
            estimated_cost, suggested_price, crafting_hours, silhouette, is_sample, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            'GAR-103',
            'Raw Silk Embroidered Sherwani',
            'Sherwani',
            'Tailored structured canvas, hidden placket, royal metallic crest buttons',
            'DSN-078',
            'Wedding Edit',
            'EMBROIDERY',
            'READY',
            'HIGH',
            'IN_PRODUCTION',
            'Master Tariq',
            'Meera S',
            'Main Branch',
            '../assets/garments/raw_silk_sherwani.jpg',
            'Bespoke groom collection specimen with subtle tone-on-tone embroidery.',
            comp.id,
            'Handwoven Raw Silk 80g',
            'Tone-on-Tone Thread & Sequins',
            'Champagne Ivory',
            '#F7E7CE',
            16000.00,
            42000.00,
            40,
            'Tailored Mandarin Collar Silhouette',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (garment_code) DO NOTHING;

        -- GAR-104: Chikankari Flared Anarkali Suit
        INSERT INTO public.garments (
            id, garment_code, title, garment_type, specs, design_code, collection_name,
            production_stage, material_status, priority, status, assigned_to, designer, branch,
            image_url, notes, company_id, primary_fabric, embroidery_type, color_name, color_hex,
            estimated_cost, suggested_price, crafting_hours, silhouette, is_sample, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            'GAR-104',
            'Chikankari Flared Anarkali Suit',
            'Anarkali',
            'Floor-length kalidar cut, soft cotton lining, sheer organza dupatta with mukaish',
            'DSN-033',
            'Summer Pastels',
            'CUTTING',
            'READY',
            'NORMAL',
            'IN_PRODUCTION',
            'Amina Al-Mansoor',
            'Amina Al-Mansoor',
            'Main Branch',
            '../assets/garments/anarkali_chikankari.jpg',
            'Traditional Lucknowi craftsmanship with modern flaring.',
            comp.id,
            'Mulberry Georgette',
            'Lucknowi Chikankari & Mukaish',
            'Pastel Peach',
            '#FFDAB9',
            9500.00,
            26500.00,
            30,
            'Floor-Length Kalidar Anarkali',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (garment_code) DO NOTHING;

        -- GAR-105: Deep Square-Neck Bridal Blouse
        INSERT INTO public.garments (
            id, garment_code, title, garment_type, specs, design_code, collection_name,
            production_stage, material_status, priority, status, assigned_to, designer, branch,
            image_url, notes, company_id, primary_fabric, embroidery_type, color_name, color_hex,
            estimated_cost, suggested_price, crafting_hours, silhouette, is_sample, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            'GAR-105',
            'Deep Square-Neck Bridal Blouse',
            'Blouse',
            '7.5" deep neckline, reinforced side hooks, padded cups, dori tassels with pearl drops',
            'DSN-012',
            'Heritage Bridal 2026',
            'QC',
            'READY',
            'NORMAL',
            'Awaiting QC',
            'Ravi M',
            'Sanya Kapoor',
            'Main Branch',
            '../assets/garments/bridal_blouse_zardozi.jpg',
            'Master silhouette template for bespoke bridal blouses.',
            comp.id,
            'Pure Raw Silk & Brocade',
            'Heavy Zardozi with Cutwork Back',
            'Maroon Gold',
            '#800000',
            6500.00,
            18500.00,
            24,
            'Padded Sweetheart Square Neck',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (garment_code) DO NOTHING;

        -- GAR-106: Champagne Fluted Evening Gown
        INSERT INTO public.garments (
            id, garment_code, title, garment_type, specs, design_code, collection_name,
            production_stage, material_status, priority, status, assigned_to, designer, branch,
            image_url, notes, company_id, primary_fabric, embroidery_type, color_name, color_hex,
            estimated_cost, suggested_price, crafting_hours, silhouette, is_sample, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            'GAR-106',
            'Champagne Fluted Evening Gown',
            'Gown',
            'Corset structured bodice, internal boning, dramatic mermaid trail, hidden back zipper',
            'DSN-095',
            'Contemporary Classics',
            'DESIGNING',
            'READY',
            'NORMAL',
            'IN_PRODUCTION',
            'Master Tariq',
            'Meera S',
            'Main Branch',
            '../assets/garments/champagne_evening_gown.jpg',
            'Contemporary red-carpet evening gown with hand-beaded crystal bodice.',
            comp.id,
            'Imported Satin & Fluted Net',
            'Hand Beaded Crystal & Sequin',
            'Champagne Rose',
            '#E8C5C8',
            14000.00,
            38000.00,
            35,
            'Corset Mermaid Trail Silhouette',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (garment_code) DO NOTHING;

        -- GAR-107: Brocade Peplum Kurti & Sharara
        INSERT INTO public.garments (
            id, garment_code, title, garment_type, specs, design_code, collection_name,
            production_stage, material_status, priority, status, assigned_to, designer, branch,
            image_url, notes, company_id, primary_fabric, embroidery_type, color_name, color_hex,
            estimated_cost, suggested_price, crafting_hours, silhouette, is_sample, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            'GAR-107',
            'Brocade Peplum Kurti & Sharara',
            'Kurti',
            'Angrakha overlap neckline, gota patti lace border, tiered flare sharara pants',
            'DSN-051',
            'Festive Edit',
            'READY',
            'READY',
            'NORMAL',
            'Ready',
            'Master Rafiq',
            'Amina Al-Mansoor',
            'Main Branch',
            '../assets/garments/zardozi_handwork.jpg',
            'Festive ready-to-wear atelier sample in vibrant royal mustard.',
            comp.id,
            'Chanderi Brocade Silk',
            'Gota Patti Neckline & Hem Detailing',
            'Royal Mustard',
            '#E1AD01',
            5200.00,
            15000.00,
            18,
            'Peplum Angrakha Silhouette',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (garment_code) DO NOTHING;

    END LOOP;
END $$;
