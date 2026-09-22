$env:PGPASSWORD = 'crazy@8'
$psql = 'C:\Program Files\PostgreSQL\17\bin\psql.exe'
& $psql -U postgres -d fashion_erp -c "
SELECT id, order_code, customer_mobile, customer_name, total_amount, advance_paid, balance_amount, status
FROM orders
LIMIT 10;
"
