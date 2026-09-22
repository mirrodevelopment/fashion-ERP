$env:PGPASSWORD = 'crazy@8'
$psql = 'C:\Program Files\PostgreSQL\17\bin\psql.exe'
& $psql -U postgres -d fashion_erp -f 'scripts/seed_inventory_payments_suppliers_trials.sql'
