-- V13__add_qc_rework_count.sql
-- Adds qc_rework_count to orders table to track how many times an order underwent QC rework

ALTER TABLE orders ADD COLUMN IF NOT EXISTS qc_rework_count INT NOT NULL DEFAULT 0;
