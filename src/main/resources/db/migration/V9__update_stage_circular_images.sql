-- V9__update_stage_circular_images.sql
-- Update production stage images to bespoke circular frame artworks

UPDATE stage_definitions SET image_url = '/front end/assets/stages/Designing_1058.jpg' WHERE stage_key = 'DESIGNING';
UPDATE stage_definitions SET image_url = '/front end/assets/stages/Lining_2047.jpg' WHERE stage_key = 'LINING';
UPDATE stage_definitions SET image_url = '/front end/assets/stages/Hand_Work_3082.jpg' WHERE stage_key = 'HAND_WORK';
UPDATE stage_definitions SET image_url = '/front end/assets/stages/Cutting_4091.jpg' WHERE stage_key = 'CUTTING';
UPDATE stage_definitions SET image_url = '/front end/assets/stages/Stitching_5076.jpg' WHERE stage_key = 'STITCHING';
UPDATE stage_definitions SET image_url = '/front end/assets/stages/Trial_6034.jpg' WHERE stage_key = 'TRIAL';
UPDATE stage_definitions SET image_url = '/front end/assets/stages/QC_7019.jpg' WHERE stage_key = 'QC';
UPDATE stage_definitions SET image_url = '/front end/assets/stages/Ready_8043.jpg' WHERE stage_key = 'READY';
