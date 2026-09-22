-- V5__add_order_meta_columns.sql
-- Adds production tracking columns to the orders table:
--   current_stage    : mirrors the active ProgressStage enum value
--   reference_images : JSON array of up to 5 uploaded image paths  e.g. ["/front end/assets/order-ref/ORD-2026-0001-ref1.jpg"]
--   production_notes : free-form tailor / production notes (separate from general notes)

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS current_stage    VARCHAR(30) DEFAULT 'ORDER',
    ADD COLUMN IF NOT EXISTS reference_images TEXT        DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS production_notes TEXT;
