-- V13: Add dev_password column to app_users to store live password for developer quick login directly in DB
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS dev_password VARCHAR(255);

-- Populate dev_password for existing bootstrap accounts
UPDATE app_users 
SET dev_password = 'Admin@123' 
WHERE (role = 'OWNER' OR role = 'ADMIN') AND (dev_password IS NULL OR dev_password = '');

UPDATE app_users 
SET dev_password = 'Branch@123' 
WHERE role = 'BRANCH_ADMIN' AND (dev_password IS NULL OR dev_password = '');

UPDATE app_users 
SET dev_password = 'Password@123' 
WHERE username = 'kavya' AND (dev_password IS NULL OR dev_password = '');
