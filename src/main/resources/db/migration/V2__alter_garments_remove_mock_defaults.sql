-- Migration V2: Remove hardcoded mock names from default column constraints on garments table
ALTER TABLE IF EXISTS public.garments ALTER COLUMN assigned_to DROP DEFAULT;
ALTER TABLE IF EXISTS public.garments ALTER COLUMN designer DROP DEFAULT;
