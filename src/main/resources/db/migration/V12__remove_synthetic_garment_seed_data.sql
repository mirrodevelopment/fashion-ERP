-- ============================================================================
-- Migration V12: Remove synthetic garment seed data
-- Ensures garments table contains zero synthetic seed data (GAR-101 to GAR-107)
-- ============================================================================

DELETE FROM public.garments 
WHERE garment_code IN (
    'GAR-101', 'GAR-102', 'GAR-103', 'GAR-104', 'GAR-105', 'GAR-106', 'GAR-107'
);
