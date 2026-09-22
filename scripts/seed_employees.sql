-- Seed 11 Boutique Atelier Employees
INSERT INTO employees (
    id, employee_code, name, phone, email, role, status, joined_date, avatar_url, specialization, notes, created_at, updated_at
) VALUES 
('e1000001-0000-0000-0000-000000000001', 'EMP-001', 'Kavitha M', '+91 98401 11221', 'kavitha.m@hauloboutique.com', 'Pattern Master', 'ACTIVE', '2023-01-15', '/front end/assets/employees/kavitha-m.jpg', 'Master Pattern Cutting & Grading', 'Senior cutting master with 12 years bespoke tailoring experience.', NOW(), NOW()),
('e1000001-0000-0000-0000-000000000002', 'EMP-002', 'Murugan S', '+91 98401 11222', 'murugan.s@hauloboutique.com', 'Stitching Master', 'ACTIVE', '2023-03-10', '/front end/assets/employees/murugan-s.jpg', 'Haute Couture Assembly & Silhouettes', 'Expert tailor specializing in Silk Blouse and Kalidar Kurti stitching.', NOW(), NOW()),
('e1000001-0000-0000-0000-000000000003', 'EMP-003', 'Lakshmi Priya', '+91 98401 11223', 'lakshmi.p@hauloboutique.com', 'Embroidery Artist', 'ACTIVE', '2023-06-01', '/front end/assets/employees/lakshmi-priya.jpg', 'Aari Work, Zardosi & Antique Zari', 'Gold medalist in traditional Kanchipuram zari & beadwork embellishment.', NOW(), NOW()),
('e1000001-0000-0000-0000-000000000004', 'EMP-004', 'Arun Kumar', '+91 98401 11224', 'arun.k@hauloboutique.com', 'Couturier & Draper', 'ACTIVE', '2023-08-20', '/front end/assets/employees/arun-kumar.jpg', 'Bridal Draping & Silhouette Sculpting', 'Specialist in custom bridal gowns, lehenga can-can flair and structure.', NOW(), NOW()),
('e1000001-0000-0000-0000-000000000005', 'EMP-005', 'Ramesh K', '+91 98401 11225', 'ramesh.k@hauloboutique.com', 'Finishing Artisan', 'ACTIVE', '2024-01-10', '/front end/assets/employees/ramesh-k.jpg', 'Hemming, Pressing & Hand Finishes', 'Oversees fine detailing, invisible seams, and hand-rolled hems.', NOW(), NOW()),
('e1000001-0000-0000-0000-000000000006', 'EMP-006', 'Divya S', '+91 98401 11226', 'divya.s@hauloboutique.com', 'Lead Stylist', 'ACTIVE', '2024-02-15', '/front end/assets/employees/divya-s.jpg', 'Bespoke Design & Color Harmonization', 'Consults with VIP clients on heritage motifs and fabric palettes.', NOW(), NOW()),
('e1000001-0000-0000-0000-000000000007', 'EMP-007', 'Salim Khan', '+91 98401 11227', 'salim.k@hauloboutique.com', 'Master Tailor', 'ACTIVE', '2024-03-01', '/front end/assets/employees/salim-khan.jpg', 'Churidar, Anarkali & Jacket Tailoring', 'Specialist in structured yokes and intricate collar lines.', NOW(), NOW()),
('e1000001-0000-0000-0000-000000000008', 'EMP-008', 'Saira Banu', '+91 98401 11228', 'saira.b@hauloboutique.com', 'Zari Artisan', 'ACTIVE', '2024-04-12', '/front end/assets/employees/saira-banu.jpg', 'Cutwork, Sequins & Thread Art', 'Delicate needlework expert for bridal necklines and sleeve borders.', NOW(), NOW()),
('e1000001-0000-0000-0000-000000000009', 'EMP-009', 'Anitha R', '+91 98401 11229', 'anitha.r@hauloboutique.com', 'Bespoke Consultant', 'ACTIVE', '2024-05-01', '/front end/assets/employees/anitha-r.jpg', 'Client Relations & Trial Fittings', 'Coordinates client appointments, trials, and fit perfection sessions.', NOW(), NOW()),
('e1000001-0000-0000-0000-000000000010', 'EMP-010', 'Jothi L', '+91 98401 11230', 'jothi.l@hauloboutique.com', 'QC Inspector', 'ACTIVE', '2024-06-18', '/front end/assets/employees/jothi-l.jpg', 'Measurement Audit & Quality Assurance', 'Conducts 24-point quality inspection prior to delivery readiness.', NOW(), NOW()),
('e1000001-0000-0000-0000-000000000011', 'EMP-011', 'Meena R', '+91 98401 11231', 'meena.r@hauloboutique.com', 'Assembly Artist', 'ACTIVE', '2024-07-01', '/front end/assets/employees/meena-r.jpg', 'Latkans, Tassels & Hardware Attachment', 'Applies custom handmade latkans, hooks, dori, and boutique charms.', NOW(), NOW())
ON CONFLICT (employee_code) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    avatar_url = EXCLUDED.avatar_url,
    specialization = EXCLUDED.specialization,
    notes = EXCLUDED.notes;
