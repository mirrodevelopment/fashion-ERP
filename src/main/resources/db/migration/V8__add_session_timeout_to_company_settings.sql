-- Migration V8: Add configurable session timeout minutes to company settings
ALTER TABLE public.company_settings
    ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 20 NOT NULL;

COMMENT ON COLUMN public.company_settings.session_timeout_minutes IS
    'Inactivity auto-logout duration in minutes (0 = disabled, default = 20)';
