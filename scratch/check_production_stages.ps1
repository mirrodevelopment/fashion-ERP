$env:PGPASSWORD = 'crazy@8'
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d fashion_erp -c "SELECT id, order_id, stage_name, assigned_to, status, sort_order FROM production_stages LIMIT 15;"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d fashion_erp -c "SELECT id, stage_key, display_name, required_role, dept_label, sort_order FROM stage_definitions LIMIT 15;"
