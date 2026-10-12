-- ==============================================================================
-- Migration V3: User Governance & Access Intelligence (DDL Only - No Mock Data)
-- Adds governance attributes to app_users and creates supporting audit/session tables
-- ==============================================================================

-- 1. Extend app_users table with governance & access intelligence columns
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS access_scope VARCHAR(100) DEFAULT 'Full System',
ADD COLUMN IF NOT EXISTS approval_limit NUMERIC(14,2),
ADD COLUMN IF NOT EXISTS access_health_score INTEGER,
ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'LOW',
ADD COLUMN IF NOT EXISTS risk_notes TEXT DEFAULT 'No critical permission conflicts detected.',
ADD COLUMN IF NOT EXISTS authority_limits TEXT DEFAULT '{}',
ADD COLUMN IF NOT EXISTS branch_access_details TEXT DEFAULT '[]';

-- Backfill existing records with clean defaults
UPDATE public.app_users
SET status = CASE 
    WHEN active = true THEN 'ACTIVE' 
    ELSE 'SUSPENDED' 
END
WHERE status IS NULL OR status = '';

UPDATE public.app_users
SET access_scope = CASE
    WHEN role IN ('OWNER', 'ADMIN') THEN 'Full System'
    WHEN role = 'BRANCH_ADMIN' THEN 'Branch + Production'
    WHEN designation ILIKE '%Production%' THEN 'Production Only'
    WHEN designation ILIKE '%Sales%' THEN 'Customers + Orders'
    WHEN designation ILIKE '%Account%' OR designation ILIKE '%Finance%' THEN 'Finance + Purchases'
    WHEN designation ILIKE '%Inventory%' OR designation ILIKE '%Stock%' THEN 'Inventory Only'
    WHEN designation ILIKE '%QC%' OR designation ILIKE '%Quality%' THEN 'QC + Production'
    WHEN designation ILIKE '%Purchase%' THEN 'Purchases Only'
    WHEN designation ILIKE '%Design%' THEN 'Designs + Samples'
    ELSE 'Full System'
END
WHERE access_scope IS NULL OR access_scope = '';

UPDATE public.app_users
SET approval_limit = CASE
    WHEN role IN ('OWNER', 'ADMIN') THEN NULL -- NULL means Unlimited
    WHEN role = 'BRANCH_ADMIN' THEN 50000.00
    WHEN designation ILIKE '%Account%' THEN 100000.00
    WHEN designation ILIKE '%Purchase%' THEN 50000.00
    WHEN designation ILIKE '%Inventory%' THEN 25000.00
    WHEN designation ILIKE '%Production%' THEN 15000.00
    WHEN designation ILIKE '%QC%' THEN 10000.00
    WHEN designation ILIKE '%Design%' THEN 10000.00
    WHEN designation ILIKE '%Sales%' THEN 5000.00
    ELSE 0.00
END
WHERE approval_limit IS NULL AND role NOT IN ('OWNER', 'ADMIN');

-- 2. User Delegations Table (Temporary Access Grants)
CREATE TABLE IF NOT EXISTS public.user_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    granted_by VARCHAR(150),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_delegations_user ON public.user_delegations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_delegations_company ON public.user_delegations(company_id);

-- 3. User Access Activity Logs Table (Security Audit Trail)
CREATE TABLE IF NOT EXISTS public.user_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    location VARCHAR(100),
    client_info VARCHAR(100),
    created_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_access_logs_user ON public.user_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_logs_company ON public.user_access_logs(company_id);

-- 4. User Active Sessions Table (Device & Authentication Tracking)
CREATE TABLE IF NOT EXISTS public.user_active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    device VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    last_seen_at TIMESTAMP DEFAULT now() NOT NULL,
    is_current BOOLEAN DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_user_active_sessions_user ON public.user_active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_active_sessions_company ON public.user_active_sessions(company_id);
