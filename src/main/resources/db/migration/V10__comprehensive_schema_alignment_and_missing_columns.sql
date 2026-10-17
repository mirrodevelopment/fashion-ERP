-- ============================================================================
-- Migration V10: Comprehensive Schema Alignment & Missing Columns
-- Resolves code-without-column gaps, replaces JSON-in-notes workarounds,
-- and aligns JPA entities with PostgreSQL unified schema.
-- ============================================================================

-- 1. Designs Table Alignment
ALTER TABLE public.designs 
    ALTER COLUMN design_code TYPE character varying(50),
    ADD COLUMN IF NOT EXISTS turnaround_days integer DEFAULT 12,
    ADD COLUMN IF NOT EXISTS accent_fabric character varying(150),
    ADD COLUMN IF NOT EXISTS complexity character varying(50) DEFAULT 'High',
    ADD COLUMN IF NOT EXISTS closure character varying(100),
    ADD COLUMN IF NOT EXISTS branch character varying(100) DEFAULT 'Main Branch';

-- 2. Orders Table Alignment
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS design_id uuid REFERENCES public.designs(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS design_code character varying(50),
    ADD COLUMN IF NOT EXISTS design_category character varying(100),
    ADD COLUMN IF NOT EXISTS priority character varying(30) DEFAULT 'NORMAL' NOT NULL,
    ADD COLUMN IF NOT EXISTS assigned_to character varying(100),
    ADD COLUMN IF NOT EXISTS measurement_profile_id uuid REFERENCES public.measurement_profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS neck_style character varying(100),
    ADD COLUMN IF NOT EXISTS sleeve_style character varying(100),
    ADD COLUMN IF NOT EXISTS fabric_type character varying(100),
    ADD COLUMN IF NOT EXISTS fabric_colour character varying(100),
    ADD COLUMN IF NOT EXISTS fabric_source character varying(50) DEFAULT 'BOUTIQUE',
    ADD COLUMN IF NOT EXISTS payment_method character varying(50) DEFAULT 'CASH';

CREATE INDEX IF NOT EXISTS idx_orders_design_id ON public.orders USING btree (design_id);
CREATE INDEX IF NOT EXISTS idx_orders_priority ON public.orders USING btree (priority);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_to ON public.orders USING btree (assigned_to);

-- 3. Employees Table Alignment
ALTER TABLE public.employees
    ADD COLUMN IF NOT EXISTS department character varying(100) DEFAULT 'Stitching' NOT NULL,
    ADD COLUMN IF NOT EXISTS salary numeric(12,2) DEFAULT 0.00 NOT NULL,
    ADD COLUMN IF NOT EXISTS branch character varying(100) DEFAULT 'Main Branch' NOT NULL,
    ADD COLUMN IF NOT EXISTS workload integer DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS efficiency integer DEFAULT 95 NOT NULL,
    ADD COLUMN IF NOT EXISTS completed_month integer DEFAULT 0 NOT NULL;

-- 4. Purchase Orders & Suppliers Table Alignment
ALTER TABLE public.purchase_orders
    ADD COLUMN IF NOT EXISTS branch character varying(100) DEFAULT 'Main Branch' NOT NULL,
    ADD COLUMN IF NOT EXISTS payment_status character varying(30) DEFAULT 'PENDING' NOT NULL,
    ADD COLUMN IF NOT EXISTS paid_amount numeric(12,2) DEFAULT 0.00 NOT NULL;

ALTER TABLE public.suppliers
    ADD COLUMN IF NOT EXISTS gstin character varying(20),
    ADD COLUMN IF NOT EXISTS pan_number character varying(15);

-- 5. Inventory Items Table Alignment
ALTER TABLE public.inventory_items
    ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS color_hex character varying(30),
    ADD COLUMN IF NOT EXISTS color_name character varying(100);

CREATE INDEX IF NOT EXISTS idx_inventory_supplier_id ON public.inventory_items USING btree (supplier_id);

-- 6. Company Settings Table Alignment
ALTER TABLE public.company_settings
    ADD COLUMN IF NOT EXISTS share_designs_across_branches boolean DEFAULT true NOT NULL,
    ADD COLUMN IF NOT EXISTS share_purchases_across_branches boolean DEFAULT true NOT NULL,
    ADD COLUMN IF NOT EXISTS share_workforce_across_branches boolean DEFAULT true NOT NULL,
    ADD COLUMN IF NOT EXISTS currency_symbol character varying(10) DEFAULT '₹' NOT NULL,
    ADD COLUMN IF NOT EXISTS order_prefix character varying(10) DEFAULT 'ORD-' NOT NULL,
    ADD COLUMN IF NOT EXISTS invoice_prefix character varying(10) DEFAULT 'INV-' NOT NULL;

-- 7. Customers Table Alignment
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS customer_code character varying(30),
    ADD COLUMN IF NOT EXISTS loyalty_points integer DEFAULT 0 NOT NULL;

-- 8. Backfill legacy employee department/salary from notes where possible
UPDATE public.employees
SET department = 'Designing'
WHERE notes ILIKE '%Designing%' AND department = 'Stitching';

UPDATE public.employees
SET department = 'Cutting'
WHERE notes ILIKE '%Cutting%' AND department = 'Stitching';

UPDATE public.employees
SET department = 'Embroidery'
WHERE notes ILIKE '%Embroidery%' AND department = 'Stitching';

UPDATE public.employees
SET department = 'Finishing'
WHERE notes ILIKE '%Finishing%' AND department = 'Stitching';

UPDATE public.employees
SET department = 'Administration'
WHERE (notes ILIKE '%Admin%' OR role ILIKE '%Admin%' OR role ILIKE '%Manager%') AND department = 'Stitching';
