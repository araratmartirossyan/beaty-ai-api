-- ============================================
-- FIX DATABASE PERMISSIONS
-- ============================================
-- IMPORTANT: Run these commands as a database ADMIN/SUPERUSER (e.g., 'postgres' user)
-- NOT as 'test_api' user - regular users cannot grant permissions to themselves
--
-- Connect as admin:
-- psql -h 37.251.18.171 -U postgres -d ai-rag
--
-- Replace 'test_api' with your actual database username

-- Option 1: Grant permissions on public schema (recommended)
-- This allows test_api to create tables, sequences, etc. in the public schema
GRANT ALL ON SCHEMA public TO test_api;
GRANT CREATE ON SCHEMA public TO test_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO test_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO test_api;

-- Option 2: If you can't modify public schema, create a new schema
-- CREATE SCHEMA IF NOT EXISTS app_schema;
-- GRANT ALL ON SCHEMA app_schema TO test_api;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA app_schema GRANT ALL ON TABLES TO test_api;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA app_schema GRANT ALL ON SEQUENCES TO test_api;

-- Option 3: Make user a superuser (NOT RECOMMENDED for production)
-- ALTER USER test_api WITH SUPERUSER;

-- Verify permissions after granting
SELECT 
    nspname as schema_name,
    has_schema_privilege('test_api', nspname, 'CREATE') as can_create,
    has_schema_privilege('test_api', nspname, 'USAGE') as can_use
FROM pg_namespace
WHERE nspname = 'public';

