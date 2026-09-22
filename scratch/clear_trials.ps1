$env:PGPASSWORD = 'crazy@8'
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d fashion_erp -c "TRUNCATE TABLE trial_alterations, trials RESTART IDENTITY CASCADE;"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d fashion_erp -c "SELECT count(*) FROM trials;"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d fashion_erp -c "SELECT count(*) FROM trial_alterations;"
