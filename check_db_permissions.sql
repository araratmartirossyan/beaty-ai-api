-- Check current user and database
SELECT current_user, current_database();

-- Check if user has CREATE permission on public schema
SELECT 
    nspname as schema_name,
    has_schema_privilege(current_user, nspname, 'CREATE') as can_create,
    has_schema_privilege(current_user, nspname, 'USAGE') as can_use
FROM pg_namespace
WHERE nspname = 'public';

-- Check all privileges for current user on public schema
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.schema_privileges
WHERE schema_name = 'public' 
AND grantee = current_user;

-- Check if user is a member of any roles
SELECT 
    r.rolname as role_name,
    m.rolname as member_of
FROM pg_roles r
LEFT JOIN pg_auth_members am ON r.oid = am.member
LEFT JOIN pg_roles m ON am.roleid = m.oid
WHERE r.rolname = current_user;

-- List all schemas and permissions
SELECT 
    n.nspname as schema_name,
    pg_catalog.has_schema_privilege(current_user, n.nspname, 'CREATE') as can_create,
    pg_catalog.has_schema_privilege(current_user, n.nspname, 'USAGE') as can_use
FROM pg_catalog.pg_namespace n
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY n.nspname;

