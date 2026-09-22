-- V8__stage_definition_image.sql
-- Add image_url to stage_definitions table for stage artwork & photos
ALTER TABLE stage_definitions ADD COLUMN IF NOT EXISTS image_url TEXT;

UPDATE stage_definitions SET image_url = '/front end/assets/stages/Designing_1042.jpg' WHERE stage_key = 'DESIGNING' AND (image_url IS NULL OR image_url = '');
UPDATE stage_definitions SET image_url = '/front end/assets/stages/Lining_2084.jpg' WHERE stage_key = 'LINING' AND (image_url IS NULL OR image_url = '');
UPDATE stage_definitions SET image_url = '/front end/assets/stages/Hand_Work_3091.jpg' WHERE stage_key = 'HAND_WORK' AND (image_url IS NULL OR image_url = '');
UPDATE stage_definitions SET image_url = '/front end/assets/stages/Cutting_4017.jpg' WHERE stage_key = 'CUTTING' AND (image_url IS NULL OR image_url = '');
UPDATE stage_definitions SET image_url = '/front end/assets/stages/Stitching_5033.jpg' WHERE stage_key = 'STITCHING' AND (image_url IS NULL OR image_url = '');
UPDATE stage_definitions SET image_url = '/front end/assets/stages/Trial_6029.jpg' WHERE stage_key = 'TRIAL' AND (image_url IS NULL OR image_url = '');
UPDATE stage_definitions SET image_url = '/front end/assets/stages/QC_7054.jpg' WHERE stage_key = 'QC' AND (image_url IS NULL OR image_url = '');
UPDATE stage_definitions SET image_url = '/front end/assets/stages/Ready_8066.jpg' WHERE stage_key = 'READY' AND (image_url IS NULL OR image_url = '');
