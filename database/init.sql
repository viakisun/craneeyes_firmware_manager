-- CraneEyes Firmware Manager Database Initialization Script
-- PostgreSQL Database Setup

-- Create database (run this as superuser)
-- CREATE DATABASE crane_firmware;

-- Connect to crane_firmware database
-- \c crane_firmware;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create models table
CREATE TABLE IF NOT EXISTS models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(20),
    firmware_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create firmwares table
CREATE TABLE IF NOT EXISTS firmwares (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES models(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    release_date DATE NOT NULL,
    size VARCHAR(20) NOT NULL,
    downloads INTEGER DEFAULT 0,
    s3_key VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_id, version)
);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    user_email VARCHAR(100),
    model_name VARCHAR(50),
    version VARCHAR(20),
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial user
INSERT INTO users (email, password, name, role) 
VALUES ('crane@dy.co.kr', '1234', 'CraneEyes Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert crane models
INSERT INTO models (name, category, sub_category) VALUES
-- Stick Crane 5T
('SS1416', 'Stick Crane', '5T'),
('SS1406', 'Stick Crane', '5T'),
('SS1926', 'Stick Crane', '5T'),

-- Stick Crane 7T
('SS2036Ace', 'Stick Crane', '7T'),
('SS2037Ace', 'Stick Crane', '7T'),
('ST2216', 'Stick Crane', '7T'),
('ST2217', 'Stick Crane', '7T'),
('SS2037D', 'Stick Crane', '7T'),
('ST2217D', 'Stick Crane', '7T'),

-- Stick Crane 10T
('ST2507', 'Stick Crane', '10T'),
('SS2725LB', 'Stick Crane', '10T'),
('SS3506', 'Stick Crane', '10T'),
('SS3506M', 'Stick Crane', '10T'),

-- Stick Crane 20T
('SM7016', 'Stick Crane', '20T'),
('SS75065', 'Stick Crane', '20T'),
('ST7516', 'Stick Crane', '20T'),

-- Knuckle Crane
('SSN2200A-PRO', 'Knuckle Crane', ''),
('SSN2200III', 'Knuckle Crane', ''),
('SSN2800III', 'Knuckle Crane', ''),
('SSN3000', 'Knuckle Crane', '')
ON CONFLICT (name) DO NOTHING;

-- Insert sample firmwares
INSERT INTO firmwares (model_id, version, release_date, size, downloads, s3_key, description) VALUES
-- SS1416 firmwares
((SELECT id FROM models WHERE name = 'SS1416'), '2.4.1', '2025-03-15', '4.2 MB', 1247, 'firmwares/SS1416/2.4.1/firmware-ss1416-2.4.1.bin', 'Bug fixes and performance improvements'),
((SELECT id FROM models WHERE name = 'SS1416'), '2.4.0', '2025-02-28', '4.1 MB', 2891, 'firmwares/SS1416/2.4.0/firmware-ss1416-2.4.0.bin', 'Major update with new features'),

-- SS2036Ace firmwares
((SELECT id FROM models WHERE name = 'SS2036Ace'), '3.1.2', '2025-03-10', '5.8 MB', 892, 'firmwares/SS2036Ace/3.1.2/firmware-ss2036ace-3.1.2.bin', 'Security patches and stability fixes'),
((SELECT id FROM models WHERE name = 'SS2036Ace'), '3.1.1', '2025-02-15', '5.7 MB', 1205, 'firmwares/SS2036Ace/3.1.1/firmware-ss2036ace-3.1.1.bin', 'Minor bug fixes'),

-- SSN2200A-PRO firmwares
((SELECT id FROM models WHERE name = 'SSN2200A-PRO'), '1.9.0', '2025-03-20', '6.3 MB', 445, 'firmwares/SSN2200A-PRO/1.9.0/firmware-ssn2200a-pro-1.9.0.bin', 'New control algorithms'),
((SELECT id FROM models WHERE name = 'SSN2200A-PRO'), '1.8.5', '2025-02-10', '6.1 MB', 678, 'firmwares/SSN2200A-PRO/1.8.5/firmware-ssn2200a-pro-1.8.5.bin', 'Performance optimization'),

-- SSN2200III firmwares
((SELECT id FROM models WHERE name = 'SSN2200III'), '2.1.5', '2025-03-01', '5.2 MB', 1203, 'firmwares/SSN2200III/2.1.5/firmware-ssn2200iii-2.1.5.bin', 'Performance optimization'),
((SELECT id FROM models WHERE name = 'SSN2200III'), '2.1.4', '2025-01-20', '5.1 MB', 1456, 'firmwares/SSN2200III/2.1.4/firmware-ssn2200iii-2.1.4.bin', 'Bug fixes and improvements')
ON CONFLICT (model_id, version) DO NOTHING;

-- Insert sample logs
INSERT INTO logs (type, user_email, model_name, version, ip_address, timestamp) VALUES
('download', 'Anonymous', 'SS2036Ace', '3.1.2', '192.168.1.45', '2025-03-20 14:32:15'),
('upload', 'crane@dy.co.kr', 'SSN3000', '1.9.0', '10.0.0.12', '2025-03-20 13:15:22'),
('download', 'Anonymous', 'SS1416', '2.4.1', '203.123.45.67', '2025-03-20 12:48:03'),
('edit', 'crane@dy.co.kr', 'ST7516', '1.9.0', '10.0.0.12', '2025-03-20 11:22:41'),
('download', 'Anonymous', 'SSN2200III', '2.1.5', '172.16.0.88', '2025-03-20 10:15:33');

-- Update firmware counts for models
UPDATE models SET firmware_count = (
    SELECT COUNT(*) FROM firmwares WHERE firmwares.model_id = models.id
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_firmwares_model_id ON firmwares(model_id);
CREATE INDEX IF NOT EXISTS idx_firmwares_version ON firmwares(version);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type);

-- Display summary
SELECT 'Database initialization completed successfully!' as status;
SELECT COUNT(*) as total_models FROM models;
SELECT COUNT(*) as total_firmwares FROM firmwares;
SELECT COUNT(*) as total_logs FROM logs;
SELECT COUNT(*) as total_users FROM users;
