$env:PGPASSWORD='crazy@8'
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -d fashion_erp -c "DELETE FROM production_stages WHERE order_id IN (SELECT id FROM orders WHERE order_code = 'ORD-2026-0060'); DELETE FROM order_progress_stages WHERE order_id IN (SELECT id FROM orders WHERE order_code = 'ORD-2026-0060'); DELETE FROM orders WHERE order_code = 'ORD-2026-0060';"
