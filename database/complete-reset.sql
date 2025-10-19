-- Complete Reset: Delete all firmwares and logs, keep models only
-- This will completely clean the database while preserving model information

-- Delete all firmware records
DELETE FROM firmwares;

-- Delete all log records  
DELETE FROM logs;

-- Reset firmware counts for all models
UPDATE models SET firmware_count = 0;

-- Verify the cleanup
SELECT 'Cleanup completed' as status;
SELECT COUNT(*) as remaining_firmwares FROM firmwares;
SELECT COUNT(*) as remaining_logs FROM logs;
SELECT COUNT(*) as models_with_firmware FROM models WHERE firmware_count > 0;
