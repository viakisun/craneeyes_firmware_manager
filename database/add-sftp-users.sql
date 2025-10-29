-- SFTP Users Table Migration
-- Add SFTP user management capabilities to CraneEyes Firmware Manager

-- Create sftp_users table
CREATE TABLE IF NOT EXISTS sftp_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'downloader')),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_sftp_users_username ON sftp_users(username);

-- Create index on enabled status
CREATE INDEX IF NOT EXISTS idx_sftp_users_enabled ON sftp_users(enabled);

-- Insert default SFTP admin user (password: 'admin123' - hashed with bcrypt)
-- Note: This password should be changed immediately after first login
INSERT INTO sftp_users (username, password, role, enabled) 
VALUES ('sftpadmin', '$2b$10$YourHashedPasswordHere', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- Insert default SFTP downloader user (password: 'download123' - hashed with bcrypt)
INSERT INTO sftp_users (username, password, role, enabled) 
VALUES ('downloader', '$2b$10$YourHashedPasswordHere', 'downloader', true)
ON CONFLICT (username) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sftp_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sftp_users_updated_at
    BEFORE UPDATE ON sftp_users
    FOR EACH ROW
    EXECUTE FUNCTION update_sftp_users_updated_at();

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON sftp_users TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE sftp_users_id_seq TO your_app_user;

COMMENT ON TABLE sftp_users IS 'SFTP user accounts for firmware file access';
COMMENT ON COLUMN sftp_users.username IS 'Unique SFTP username';
COMMENT ON COLUMN sftp_users.password IS 'Bcrypt hashed password';
COMMENT ON COLUMN sftp_users.role IS 'User role: admin (read/write) or downloader (read-only)';
COMMENT ON COLUMN sftp_users.enabled IS 'Account active status';

