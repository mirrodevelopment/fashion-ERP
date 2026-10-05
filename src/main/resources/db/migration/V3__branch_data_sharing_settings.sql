-- ============================================================================
-- V3__branch_data_sharing_settings.sql
-- Branch Data Sharing & Isolation Policies for the Same Company
-- Allows selective, granular data sharing across branches under the same company.
-- ============================================================================

-- 1. Add Branch Sharing Flags to company_settings
ALTER TABLE public.company_settings
    ADD COLUMN IF NOT EXISTS share_customers_across_branches BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS share_orders_across_branches BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS share_enquiries_across_branches BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS share_measurements_across_branches BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS share_inventory_across_branches BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS share_garments_across_branches BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS share_trials_across_branches BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Add 'branch' column to operational tables if not already present
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Main Branch';

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Main Branch';

ALTER TABLE public.enquiries
    ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Main Branch';

ALTER TABLE public.measurement_profiles
    ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Main Branch';

ALTER TABLE public.inventory_items
    ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Main Branch';

ALTER TABLE public.trials
    ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Main Branch';

-- Note: 'garments' and 'collections' already possess the 'branch' column in V1.

-- 3. Composite Indexes for high-performance branch-level filtering
CREATE INDEX IF NOT EXISTS idx_customers_company_branch ON public.customers(company_id, branch);
CREATE INDEX IF NOT EXISTS idx_orders_company_branch ON public.orders(company_id, branch);
CREATE INDEX IF NOT EXISTS idx_enquiries_company_branch ON public.enquiries(company_id, branch);
CREATE INDEX IF NOT EXISTS idx_measurement_profiles_company_branch ON public.measurement_profiles(company_id, branch);
CREATE INDEX IF NOT EXISTS idx_inventory_items_company_branch ON public.inventory_items(company_id, branch);
CREATE INDEX IF NOT EXISTS idx_trials_company_branch ON public.trials(company_id, branch);
CREATE INDEX IF NOT EXISTS idx_garments_company_branch ON public.garments(company_id, branch);
