-- Auto-generated firmware INSERT statements
-- Run this to populate the database with dummy firmwares

INSERT INTO firmwares (model_id, version, release_date, size, downloads, s3_key, description) VALUES
((SELECT id FROM models WHERE name = 'SS1416'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/SS1416/1.0.0/SS1416-firmware-v1.0.0.txt', 'Initial firmware release for SS1416'),
((SELECT id FROM models WHERE name = 'SS1406'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/SS1406/1.0.0/SS1406-firmware-v1.0.0.txt', 'Initial firmware release for SS1406'),
((SELECT id FROM models WHERE name = 'SS1926'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/SS1926/1.0.0/SS1926-firmware-v1.0.0.txt', 'Initial firmware release for SS1926'),
((SELECT id FROM models WHERE name = 'SS2036Ace'), '1.0.0', '2025-01-15', '2.98 KB', 0, 'firmwares/SS2036Ace/1.0.0/SS2036Ace-firmware-v1.0.0.txt', 'Initial firmware release for SS2036Ace'),
((SELECT id FROM models WHERE name = 'SS2037Ace'), '1.0.0', '2025-01-15', '2.98 KB', 0, 'firmwares/SS2037Ace/1.0.0/SS2037Ace-firmware-v1.0.0.txt', 'Initial firmware release for SS2037Ace'),
((SELECT id FROM models WHERE name = 'ST2216'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/ST2216/1.0.0/ST2216-firmware-v1.0.0.txt', 'Initial firmware release for ST2216'),
((SELECT id FROM models WHERE name = 'ST2217'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/ST2217/1.0.0/ST2217-firmware-v1.0.0.txt', 'Initial firmware release for ST2217'),
((SELECT id FROM models WHERE name = 'SS2037D'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/SS2037D/1.0.0/SS2037D-firmware-v1.0.0.txt', 'Initial firmware release for SS2037D'),
((SELECT id FROM models WHERE name = 'ST2217D'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/ST2217D/1.0.0/ST2217D-firmware-v1.0.0.txt', 'Initial firmware release for ST2217D'),
((SELECT id FROM models WHERE name = 'ST2507'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/ST2507/1.0.0/ST2507-firmware-v1.0.0.txt', 'Initial firmware release for ST2507'),
((SELECT id FROM models WHERE name = 'SS2725LB'), '1.0.0', '2025-01-15', '2.98 KB', 0, 'firmwares/SS2725LB/1.0.0/SS2725LB-firmware-v1.0.0.txt', 'Initial firmware release for SS2725LB'),
((SELECT id FROM models WHERE name = 'SS3506'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/SS3506/1.0.0/SS3506-firmware-v1.0.0.txt', 'Initial firmware release for SS3506'),
((SELECT id FROM models WHERE name = 'SS3506M'), '1.0.0', '2025-01-15', '2.98 KB', 0, 'firmwares/SS3506M/1.0.0/SS3506M-firmware-v1.0.0.txt', 'Initial firmware release for SS3506M'),
((SELECT id FROM models WHERE name = 'SM7016'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/SM7016/1.0.0/SM7016-firmware-v1.0.0.txt', 'Initial firmware release for SM7016'),
((SELECT id FROM models WHERE name = 'SS75065'), '1.0.0', '2025-01-15', '2.98 KB', 0, 'firmwares/SS75065/1.0.0/SS75065-firmware-v1.0.0.txt', 'Initial firmware release for SS75065'),
((SELECT id FROM models WHERE name = 'ST7516'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/ST7516/1.0.0/ST7516-firmware-v1.0.0.txt', 'Initial firmware release for ST7516'),
((SELECT id FROM models WHERE name = 'SSN2200A-PRO'), '1.0.0', '2025-01-15', '2.98 KB', 0, 'firmwares/SSN2200A-PRO/1.0.0/SSN2200A-PRO-firmware-v1.0.0.txt', 'Initial firmware release for SSN2200A-PRO'),
((SELECT id FROM models WHERE name = 'SSN2200III'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/SSN2200III/1.0.0/SSN2200III-firmware-v1.0.0.txt', 'Initial firmware release for SSN2200III'),
((SELECT id FROM models WHERE name = 'SSN2800III'), '1.0.0', '2025-01-15', '2.97 KB', 0, 'firmwares/SSN2800III/1.0.0/SSN2800III-firmware-v1.0.0.txt', 'Initial firmware release for SSN2800III'),
((SELECT id FROM models WHERE name = 'SSN3000'), '1.0.0', '2025-01-15', '2.96 KB', 0, 'firmwares/SSN3000/1.0.0/SSN3000-firmware-v1.0.0.txt', 'Initial firmware release for SSN3000')
ON CONFLICT (model_id, version) DO NOTHING;

-- Update firmware counts
UPDATE models SET firmware_count = (
    SELECT COUNT(*) FROM firmwares WHERE firmwares.model_id = models.id
);
