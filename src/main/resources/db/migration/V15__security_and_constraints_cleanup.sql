-- V15: Security hardening and tenant-scoped unique constraints
-- 1. Remove plain-text dev_password from app_users (C-3)
ALTER TABLE app_users DROP COLUMN IF EXISTS dev_password;

-- 2. Add tenant-scoped unique constraint on orders (order_code, company_id) (H-1)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_orders_order_code_company'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT uq_orders_order_code_company UNIQUE (order_code, company_id);
    END IF;
END $$;

-- 3. Add tenant-scoped unique constraint on inventory_items (item_code, company_id) (H-2)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_inventory_item_code_company'
    ) THEN
        ALTER TABLE inventory_items ADD CONSTRAINT uq_inventory_item_code_company UNIQUE (item_code, company_id);
    END IF;
END $$;

-- 4. Add tenant-scoped unique constraint on garments (garment_code, company_id) (M-2)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_garments_garment_code_company'
    ) THEN
        ALTER TABLE garments ADD CONSTRAINT uq_garments_garment_code_company UNIQUE (garment_code, company_id);
    END IF;
END $$;
