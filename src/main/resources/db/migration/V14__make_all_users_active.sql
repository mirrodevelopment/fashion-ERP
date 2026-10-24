-- ==============================================================================
-- Migration V14: Ensure all user accounts in app_users are active
-- Sets active = true and status = 'ACTIVE' for all users across the company.
-- ==============================================================================

UPDATE public.app_users
SET active = true,
    status = 'ACTIVE',
    updated_at = NOW()
WHERE active IS NOT TRUE OR status IS NULL OR status != 'ACTIVE';
