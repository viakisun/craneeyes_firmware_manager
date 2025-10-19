-- Delete old firmware records that don't have actual S3 files
-- These are the original sample data (id 1-8) that were never uploaded to S3

DELETE FROM firmwares WHERE id BETWEEN 1 AND 8;

-- Update firmware counts for affected models
UPDATE models SET firmware_count = (
    SELECT COUNT(*) FROM firmwares WHERE firmwares.model_id = models.id
);

-- Show remaining firmwares
SELECT 
    f.id,
    m.name as model_name,
    f.version,
    f.s3_key,
    f.size,
    f.downloads
FROM firmwares f
JOIN models m ON f.model_id = m.id
ORDER BY f.id;

-- Show updated model counts
SELECT 
    m.name,
    m.firmware_count
FROM models m
WHERE m.firmware_count > 0
ORDER BY m.name;
