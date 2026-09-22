-- V14__add_trial_feedback_and_fit_fields.sql
-- Add trial attempt counters, customer feedback, fit preferences, body checkpoints, and tailor assignment

ALTER TABLE trials ADD COLUMN IF NOT EXISTS trial_attempt INT NOT NULL DEFAULT 1;
ALTER TABLE trials ADD COLUMN IF NOT EXISTS alteration_count INT NOT NULL DEFAULT 0;
ALTER TABLE trials ADD COLUMN IF NOT EXISTS customer_feedback TEXT;
ALTER TABLE trials ADD COLUMN IF NOT EXISTS customer_rating INT DEFAULT 5;
ALTER TABLE trials ADD COLUMN IF NOT EXISTS fit_preference VARCHAR(50) DEFAULT 'Comfort / Regular Fit';
ALTER TABLE trials ADD COLUMN IF NOT EXISTS fit_checkpoints TEXT;
ALTER TABLE trials ADD COLUMN IF NOT EXISTS fit_notes TEXT;

ALTER TABLE trial_alterations ADD COLUMN IF NOT EXISTS assigned_tailor VARCHAR(100);
ALTER TABLE trial_alterations ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Normal';
ALTER TABLE trial_alterations ADD COLUMN IF NOT EXISTS target_date DATE;
ALTER TABLE trial_alterations ADD COLUMN IF NOT EXISTS tailor_notes TEXT;
