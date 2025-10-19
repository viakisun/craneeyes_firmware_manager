-- Create crane_firmware database
-- Run this as superuser (postgres)

CREATE DATABASE crane_firmware;

-- Grant privileges to postgres user
GRANT ALL PRIVILEGES ON DATABASE crane_firmware TO postgres;

-- Connect to the new database
\c crane_firmware;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

SELECT 'Database crane_firmware created successfully!' as status;
