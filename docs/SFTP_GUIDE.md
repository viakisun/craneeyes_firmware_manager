# SFTP Server Guide

## Overview

The CraneEyes Firmware Manager includes a built-in SFTP (SSH File Transfer Protocol) server that provides secure file transfer access to firmware files stored in AWS S3. The SFTP server acts as a bridge between SFTP clients and the S3 backend.

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  SFTP Client    │────────►│  SFTP Server    │────────►│   AWS S3        │
│  (sftp command) │  SSH    │  (Node.js/ssh2) │  API    │  (Firmwares)    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  PostgreSQL     │
                            │  (User Auth)    │
                            └─────────────────┘
```

## Features

- **Secure Authentication**: Password-based authentication with bcrypt hashing
- **Role-Based Access Control**: Admin (read/write) and Downloader (read-only) roles
- **S3 Backend**: All files are stored in S3, SFTP provides the interface
- **Virtual File System**: SFTP operations are translated to S3 operations
- **Encryption**: All connections are encrypted via SSH protocol

## Setup

### 1. Database Migration

First, create the SFTP users table:

```bash
psql -h your-db-host -U postgres -d crane_firmware < database/add-sftp-users.sql
```

### 2. Create Default Users

Generate default SFTP users with secure passwords:

```bash
npm run create-sftp-users
```

This creates:
- **sftpadmin** (admin role) - password: `admin123`
- **downloader** (downloader role) - password: `download123`

**⚠️ IMPORTANT**: Change these default passwords immediately!

### 3. Start SFTP Server

```bash
# Development
npm run sftp

# Production (with PM2)
pm2 start ecosystem.config.cjs
```

The SFTP server will:
- Listen on port 2222 (configurable via `SFTP_PORT` env var)
- Generate an SSH host key if not exists (`sftp-host-key` file)
- Connect to PostgreSQL for user authentication
- Connect to AWS S3 for file operations

## User Management

### Via Web Interface

1. Log in to Admin Panel
2. Navigate to **FTP 계정** (SFTP Users)
3. Create, edit, or delete users as needed

### User Roles

#### Admin Role
- **Permissions**: Read, Write, Delete
- **Use Case**: Uploading new firmware, managing files
- **SFTP Operations**:
  - `ls` - List files ✅
  - `get` - Download files ✅
  - `put` - Upload files ✅
  - `rm` - Delete files ✅

#### Downloader Role
- **Permissions**: Read-only
- **Use Case**: Downloading firmware for distribution
- **SFTP Operations**:
  - `ls` - List files ✅
  - `get` - Download files ✅
  - `put` - Upload files ❌ (Permission denied)
  - `rm` - Delete files ❌ (Permission denied)

## Connecting to SFTP

### Command Line (Linux/Mac)

```bash
# Connect to SFTP server
sftp -P 2222 username@your-server-ip

# Enter password when prompted
```

### FileZilla

1. Open FileZilla
2. File → Site Manager → New Site
3. Configure:
   - **Protocol**: SFTP - SSH File Transfer Protocol
   - **Host**: your-server-ip
   - **Port**: 2222
   - **Logon Type**: Normal
   - **User**: your-username
   - **Password**: your-password
4. Click "Connect"

### WinSCP (Windows)

1. Open WinSCP
2. New Site
3. Configure:
   - **File protocol**: SFTP
   - **Host name**: your-server-ip
   - **Port number**: 2222
   - **User name**: your-username
   - **Password**: your-password
4. Click "Login"

## SFTP Commands

### Basic Navigation

```bash
# List files in current directory
sftp> ls

# List files in specific directory
sftp> ls /firmwares

# Change directory
sftp> cd /firmwares/SS1416/v1.0

# Print working directory
sftp> pwd
```

### Downloading Files

```bash
# Download single file
sftp> get firmware.bin

# Download file to specific location
sftp> get firmware.bin /path/to/local/directory/

# Download multiple files
sftp> mget *.bin
```

### Uploading Files (Admin Only)

```bash
# Upload single file
sftp> put firmware.bin

# Upload to specific directory
sftp> put firmware.bin /firmwares/SS1416/v1.0/

# Upload multiple files
sftp> mput *.bin
```

### Managing Files (Admin Only)

```bash
# Delete file
sftp> rm /firmwares/old-firmware.bin

# Note: Directory creation is not supported as the structure
# is managed by the web interface
```

## Directory Structure

The SFTP server exposes the following directory structure (mapped to S3):

```
/firmwares/
  ├── SS1416/
  │   ├── v1.0/
  │   │   └── firmware.bin
  │   └── v1.1/
  │       └── firmware.bin
  ├── SS1406/
  │   └── v1.0/
  │       └── firmware.bin
  └── ...
```

## Security Best Practices

### For Administrators

1. **Change Default Passwords**: Immediately change default passwords after setup
2. **Use Strong Passwords**: Minimum 12 characters with mixed case, numbers, and symbols
3. **Regular Audits**: Review user accounts regularly and disable unused accounts
4. **Monitor Logs**: Check PM2 logs for failed authentication attempts
5. **Firewall Rules**: Restrict SFTP port (2222) to known IP addresses if possible

### For Users

1. **Secure Password Storage**: Use password managers, never store in plain text
2. **Verify Host Key**: On first connection, verify the SSH host key fingerprint
3. **Secure Connections**: Only connect from trusted networks
4. **Log Out**: Always disconnect after file transfers

## Troubleshooting

### Connection Refused

**Problem**: Cannot connect to SFTP server

**Solutions**:
1. Check if SFTP server is running: `pm2 status` or `pm2 logs craneeyes-sftp`
2. Verify port is open: `telnet your-server-ip 2222`
3. Check firewall rules allow port 2222
4. Verify `.env` configuration

### Authentication Failed

**Problem**: Username/password not accepted

**Solutions**:
1. Verify user exists in database: Check Admin Panel → FTP 계정
2. Ensure user account is enabled
3. Check password is correct (case-sensitive)
4. Review SFTP server logs: `pm2 logs craneeyes-sftp`

### Permission Denied

**Problem**: Cannot upload or delete files

**Solutions**:
1. Verify user role: Downloader role is read-only
2. Check user has admin role for write operations
3. Verify S3 permissions are configured correctly

### Files Not Showing

**Problem**: Directory appears empty or files missing

**Solutions**:
1. Verify files exist in S3 bucket
2. Check S3 bucket name in `.env` configuration
3. Ensure AWS credentials have S3 read permissions
4. Review SFTP server logs for errors

## Configuration Reference

### Environment Variables

```bash
# SFTP Server Port (default: 2222)
SFTP_PORT=2222

# SSH Host Key File Path (auto-generated if not exists)
SFTP_HOST_KEY=./sftp-host-key

# AWS S3 Configuration (shared with web interface)
VITE_AWS_REGION=ap-northeast-2
VITE_AWS_ACCESS_KEY_ID=your-access-key
VITE_AWS_SECRET_ACCESS_KEY=your-secret-key
VITE_AWS_BUCKET_NAME=your-bucket-name

# Database Configuration (for user authentication)
VITE_AWS_DB_HOST=your-rds-endpoint
VITE_AWS_DB_PORT=5432
VITE_AWS_DB_NAME=crane_firmware
VITE_AWS_DB_USER=postgres
VITE_AWS_DB_PASSWORD=your-password
```

### PM2 Configuration

The SFTP server is configured in `ecosystem.config.cjs`:

```javascript
{
  name: 'craneeyes-sftp',
  script: 'sftp-server.js',
  instances: 1,
  autorestart: true,
  max_memory_restart: '500M'
}
```

## API Integration

The SFTP server uses the following APIs:

- **PostgreSQL**: User authentication and role management
- **AWS S3 SDK**: File operations (GetObject, PutObject, DeleteObject, ListObjects)
- **ssh2 Library**: SSH/SFTP protocol implementation

## Monitoring

### PM2 Logs

```bash
# View SFTP server logs
pm2 logs craneeyes-sftp

# View last 100 lines
pm2 logs craneeyes-sftp --lines 100

# Follow logs in real-time
pm2 logs craneeyes-sftp --raw
```

### Log Files

Logs are stored in:
- `./logs/pm2-sftp-out.log` - Standard output
- `./logs/pm2-sftp-error.log` - Error output

### Key Log Events

- ✅ User authentication success
- ❌ User authentication failure
- 📖 File read operations
- 📝 File write operations
- 🗑️ File delete operations
- 📁 Directory listing operations

## Performance Considerations

- **File Size Limits**: No hard limits, but large files may take time to transfer
- **Concurrent Connections**: Server can handle multiple simultaneous connections
- **S3 Performance**: Limited by S3 API rate limits and network bandwidth
- **Memory Usage**: Approximately 100-200MB per process

## Backup and Recovery

### Backup SFTP Users

```bash
# Export SFTP users table
pg_dump -h your-db-host -U postgres -d crane_firmware -t sftp_users > sftp_users_backup.sql

# Restore SFTP users
psql -h your-db-host -U postgres -d crane_firmware < sftp_users_backup.sql
```

### SSH Host Key

The SSH host key (`sftp-host-key` file) should be backed up. If lost, a new key will be generated, but users will see a host key changed warning.

## Advanced Usage

### Automated Transfers

Example script for automated firmware upload:

```bash
#!/bin/bash
# upload-firmware.sh

SFTP_HOST="your-server-ip"
SFTP_PORT="2222"
SFTP_USER="sftpadmin"
FIRMWARE_FILE="firmware.bin"
REMOTE_PATH="/firmwares/SS1416/v2.0/"

# Upload using lftp (supports automation)
lftp -u $SFTP_USER sftp://$SFTP_HOST:$SFTP_PORT <<EOF
cd $REMOTE_PATH
put $FIRMWARE_FILE
quit
EOF
```

### Batch Operations

```bash
# Create batch file (commands.txt)
cd /firmwares/SS1416/v1.0
get firmware.bin
cd /firmwares/SS1406/v1.0
get firmware.bin
quit

# Execute batch
sftp -b commands.txt -P 2222 username@your-server-ip
```

## Support

For issues or questions:
1. Check this guide first
2. Review SFTP server logs
3. Check Admin Panel → FTP 계정 for user status
4. Contact system administrator

---

**CraneEyes Firmware Manager SFTP Server** - Secure file transfer for firmware distribution

