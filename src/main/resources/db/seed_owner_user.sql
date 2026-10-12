-- =============================================================================
-- SEED: OWNER LOGIN USER FOR RIWAYAT HAUTE COUTURE
-- =============================================================================
-- Username : riwayat_owner
-- Password : Admin@123  (encoded via pgcrypto crypt — no raw hash values)
-- Role     : OWNER
-- Company  : Resolved dynamically from company_settings by name
-- =============================================================================

BEGIN;

DO $$
DECLARE
    v_company_id   UUID;
    v_user_id      UUID;
    v_username     TEXT    := 'riwayat_owner';
    v_password     TEXT    := 'Admin@123';
    v_full_name    TEXT    := 'Meera Singhania';
    v_email        TEXT    := 'concierge@riwayatcouture.com';
    v_company_name TEXT    := 'Riwayat Haute Couture';
BEGIN
    -- 1. Resolve company ID by name (no hardcoded UUIDs)
    SELECT id INTO v_company_id
    FROM public.company_settings
    WHERE LOWER(company_name) = LOWER(v_company_name)
    LIMIT 1;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'Company "%" not found in company_settings. Run seed_demo_data.sql first.', v_company_name;
    END IF;

    -- 2. Generate a fresh UUID for the user
    v_user_id := gen_random_uuid();

    -- 3. Upsert the OWNER user (no raw bcrypt hash — pgcrypto crypt() does it)
    INSERT INTO public.app_users (
        id, username, password_hash, full_name, role,
        active, email, designation, department, company_id,
        created_at, updated_at
    ) VALUES (
        v_user_id,
        v_username,
        crypt(v_password, gen_salt('bf')),   -- bcrypt via pgcrypto, no raw value
        v_full_name,
        'OWNER',
        TRUE,
        v_email,
        'Founder & Creative Director',
        'Executive',
        v_company_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (username) DO UPDATE
        SET password_hash = crypt(v_password, gen_salt('bf')),
            full_name     = EXCLUDED.full_name,
            role          = 'OWNER',
            active        = TRUE,
            company_id    = v_company_id,
            updated_at    = NOW();

    -- 4. Re-fetch the actual user id (may have been the existing one on conflict)
    SELECT id INTO v_user_id
    FROM public.app_users
    WHERE username = v_username
    LIMIT 1;

    -- 5. Upsert user_profile (no hardcoded IDs)
    INSERT INTO public.user_profiles (
        id, user_id, full_name, display_title, department,
        email, assigned_branch, clearance_level, system_role_label,
        privileges_summary, company_id, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        v_full_name,
        'Founder & Creative Director',
        'Executive',
        v_email,
        'HQ-LKO',
        'Executive (Tier 1)',
        'Company Owner',
        'Full Administrative & Tenant Settings Access',
        v_company_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE
        SET full_name        = EXCLUDED.full_name,
            display_title    = EXCLUDED.display_title,
            company_id       = EXCLUDED.company_id,
            updated_at       = NOW();

    RAISE NOTICE 'Owner user "%" created/updated for company "%" (id: %)',
        v_username, v_company_name, v_company_id;
END;
$$;

COMMIT;
