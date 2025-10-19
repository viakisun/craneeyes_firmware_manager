# Database Documentation

## Overview

CraneEyes Firmware Manager uses PostgreSQL database hosted on AWS RDS for data persistence.

## Database Connection

- **Host:** AWS RDS PostgreSQL instance
- **Database:** `crane_firmware`
- **SSL:** Required (rejectUnauthorized: false)

## Schema

### Tables

#### `users`
Stores admin user information.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `models`
Stores crane model information.

```sql
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(20),
    firmware_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `firmwares`
Stores firmware file metadata.

```sql
CREATE TABLE firmwares (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES models(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    release_date DATE NOT NULL,
    size VARCHAR(20) NOT NULL,
    downloads INTEGER DEFAULT 0,
    s3_key VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_id, version)
);
```

#### `logs`
Stores activity logs.

```sql
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    user_email VARCHAR(100),
    model_name VARCHAR(50),
    version VARCHAR(20),
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
-- Logs indexes
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_type ON logs(type);

-- Firmwares indexes
CREATE INDEX idx_firmwares_model_id ON firmwares(model_id);
CREATE INDEX idx_firmwares_version ON firmwares(version);

-- Models indexes
CREATE INDEX idx_models_category ON models(category);
```

## Sample Data

### Models (20 crane models)
- **Stick Crane (5T):** SS1416, SS1406, SS1926
- **Stick Crane (7T):** SS2036Ace, SS2037Ace, ST2216, ST2217, SS2037D, ST2217D
- **Stick Crane (10T):** ST2507, SS2725LB, SS3506, SS3506M
- **Stick Crane (20T):** SM7016, SS75065, ST7516
- **Knuckle Crane:** SSN2200A-PRO, SSN2200III, SSN2800III, SSN3000

### Firmwares (21 files)
- Each model has at least one firmware file
- File formats: .txt, .pdf
- S3 storage with organized folder structure: `firmwares/{model}/{version}/{filename}`

### Users
- Default admin user: `crane@dy.co.kr`

## Database Scripts

### Setup Scripts
- `database/create_db.sql` - Database and table creation
- `database/init.sql` - Initial data insertion
- `database/complete-reset.sql` - Complete database reset

### Data Management
- `database/insert-dummy-firmwares.sql` - Insert dummy firmware data
- `database/delete-old-firmwares.sql` - Clean up old firmware data
- `database/insert-fresh-firmwares.sql` - Insert fresh firmware data

## Connection Configuration

Environment variables required:
```env
VITE_AWS_DB_HOST=your-rds-endpoint
VITE_AWS_DB_PORT=5432
VITE_AWS_DB_NAME=crane_firmware
VITE_AWS_DB_USER=postgres
VITE_AWS_DB_PASSWORD=your-password
```

## Backup and Recovery

### Backup
```bash
pg_dump -h your-rds-endpoint -U postgres -d crane_firmware > backup.sql
```

### Restore
```bash
psql -h your-rds-endpoint -U postgres -d crane_firmware < backup.sql
```

## Performance Optimization

- Connection pooling with max 20 connections
- Appropriate indexes on frequently queried columns
- Efficient JOIN queries for firmware-model relationships
- Regular maintenance and monitoring

## Security

- SSL/TLS encryption for all connections
- Environment variable configuration
- Parameterized queries to prevent SQL injection
- Access control through application-level authentication
