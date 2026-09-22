$env:PGPASSWORD = 'crazy@8'
$psql = 'C:\Program Files\PostgreSQL\17\bin\psql.exe'
& $psql -U postgres -d fashion_erp -c "
SELECT 'customers' as tbl, count(*) from customers
UNION ALL SELECT 'orders', count(*) from orders
UNION ALL SELECT 'employees', count(*) from employees
UNION ALL SELECT 'inventory_items', count(*) from inventory_items
UNION ALL SELECT 'payments', count(*) from payments
UNION ALL SELECT 'suppliers', count(*) from suppliers
UNION ALL SELECT 'purchase_orders', count(*) from purchase_orders
UNION ALL SELECT 'appointments', count(*) from appointments
UNION ALL SELECT 'enquiries', count(*) from enquiries
UNION ALL SELECT 'designs', count(*) from designs
UNION ALL SELECT 'stage_definitions', count(*) from stage_definitions
UNION ALL SELECT 'trials', count(*) from trials
UNION ALL SELECT 'customer_body_measurements', count(*) from customer_body_measurements;
"
