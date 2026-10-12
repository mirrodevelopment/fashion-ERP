-- Complete Database Wipe Script
-- Wipes all data across all application tables in public schema
-- Keeps all table schemas, columns, indexes, constraints, and Flyway history intact

BEGIN;

DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (
        SELECT quote_ident(tablename) AS tbl 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename != 'flyway_schema_history'
    ) LOOP 
        EXECUTE 'TRUNCATE TABLE public.' || r.tbl || ' RESTART IDENTITY CASCADE;'; 
    END LOOP; 
END $$;

COMMIT;

-- Row count verification
SELECT table_name, 
       (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
FROM (
  SELECT table_name, 
         query_to_xml(format('select count(*) as cnt from public.%I', table_name), false, true, '') as xml_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
) t
ORDER BY table_name;
