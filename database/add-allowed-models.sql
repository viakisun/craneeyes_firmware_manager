-- Add allowed_models column to sftp_users table
-- This enables per-user model access control

ALTER TABLE sftp_users 
ADD COLUMN IF NOT EXISTS allowed_models TEXT[] DEFAULT '{}';

COMMENT ON COLUMN sftp_users.allowed_models IS 'Array of model names user can access. Empty array means all models are accessible.';

-- Update existing users to have access to all models (backward compatibility)
UPDATE sftp_users 
SET allowed_models = '{}' 
WHERE allowed_models IS NULL;

