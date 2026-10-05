-- =======================================================================
-- HAULO BOUTIQUE FASHION ERP — MULTI-COMPANY TENANT ISOLATION (V2)
-- Adds company_id foreign key, constraints, and indexes to all 31 tables.
-- Backfills all existing records to default tenant c0000000-0000-0000-0000-000000000001
-- =======================================================================

-- 1. Guarantee Default Company Exists in company_settings
INSERT INTO public.company_settings (
    id, company_name, short_name, tagline, business_type, 
    primary_phone, email, street_address, city, state, country
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Riwayat Haute Couture',
    'RIWAYAT',
    'Haute Couture & Bespoke Bridal Atelier',
    'Luxury Bespoke Tailoring',
    '+91 98400 12345',
    'contact@riwayat.com',
    '12, Cathedral Road, Gopalapuram',
    'Chennai',
    'Tamil Nadu',
    'India'
) ON CONFLICT (id) DO NOTHING;

-- 2. Add company_id to All 31 Tables
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'app_users',
        'appointments',
        'branches',
        'collection_activities',
        'collections',
        'customer_body_measurements',
        'customer_measurements',
        'customer_notes',
        'customers',
        'designs',
        'employees',
        'enquiries',
        'garments',
        'inventory_items',
        'measurement_points',
        'measurement_profiles',
        'order_progress_stages',
        'orders',
        'payment_transactions',
        'payments',
        'production_stages',
        'purchase_order_items',
        'purchase_orders',
        'qc_checklists',
        'stage_definition_employees',
        'stage_definitions',
        'stock_movements',
        'suppliers',
        'trial_alterations',
        'trials',
        'user_profiles'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        -- Check if column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = tbl 
              AND column_name = 'company_id'
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN company_id uuid NOT NULL DEFAULT ''c0000000-0000-0000-0000-000000000001''', tbl);
            EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT fk_%s_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE', tbl, tbl);
            EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_company_id ON public.%I(company_id)', tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- 3. Composite High-Performance Tenant Indexes
CREATE INDEX IF NOT EXISTS idx_orders_company_status ON public.orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_company_date ON public.orders(company_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON public.customers(company_id, name);
CREATE INDEX IF NOT EXISTS idx_garments_company_stage ON public.garments(company_id, production_stage);
CREATE INDEX IF NOT EXISTS idx_inventory_company_status ON public.inventory_items(company_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_company_status ON public.payments(company_id, status);
CREATE INDEX IF NOT EXISTS idx_trials_company_status ON public.trials(company_id, status);
CREATE INDEX IF NOT EXISTS idx_branches_company_code ON public.branches(company_id, branch_code);
CREATE INDEX IF NOT EXISTS idx_stage_defs_company_sort ON public.stage_definitions(company_id, sort_order);
