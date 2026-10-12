-- ==============================================================================
-- Migration V2: Multi-Branch Access Clearance for Users
-- Adds allowed_branches TEXT column to public.app_users
-- ==============================================================================

ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS allowed_branches TEXT;

COMMENT ON COLUMN public.app_users.allowed_branches IS 'JSON array of branch codes or names the user has access to. NULL/empty falls back to assigned_branch.';

-- Backfill existing records: wrap assigned_branch in a JSON array if present
UPDATE public.app_users
SET allowed_branches = json_build_array(assigned_branch)::text
WHERE assigned_branch IS NOT NULL 
  AND assigned_branch <> ''
  AND (allowed_branches IS NULL OR allowed_branches = '');
