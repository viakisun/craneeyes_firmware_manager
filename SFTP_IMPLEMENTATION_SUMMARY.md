# SFTP Integration Implementation Summary

## Overview

Successfully integrated SFTP (Secure File Transfer Protocol) support into the CraneEyes Firmware Manager. The system now supports secure file transfers via SFTP while maintaining S3 as the storage backend.

## What Was Implemented

### 1. Backend Components

#### SFTP Server (`sftp-server.js`)
- Node.js-based SFTP server using `ssh2` library
- Listens on port 2222 (configurable)
- Handles SSH authentication via PostgreSQL
- Translates SFTP operations to S3 API calls
- Supports multiple concurrent connections

#### SFTP-S3 Bridge Service (`src/services/sftp-s3-bridge.service.ts`)
- Translates SFTP file operations to S3 operations
- Implements role-based access control
- Operations supported:
  - `readFile()` - Download files from S3
  - `writeFile()` - Upload files to S3 (admin only)
  - `deleteFile()` - Delete files from S3 (admin only)
  - `readdir()` - List directory contents
  - `getAttributes()` - Get file/directory metadata

#### API Endpoints (added to `server.js`)
- `GET /api/sftp-users` - List all SFTP users
- `POST /api/sftp-users` - Create new SFTP user
- `PUT /api/sftp-users/:id` - Update SFTP user
- `POST /api/sftp-users/:id/toggle` - Enable/disable user
- `DELETE /api/sftp-users/:id` - Delete SFTP user

### 2. Database Schema

#### New Table: `sftp_users`
```sql
CREATE TABLE sftp_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'downloader')),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Migration script: `database/add-sftp-users.sql`

### 3. Frontend Components

#### SFTP Users Management Page (`src/pages/admin/SftpUsers.tsx`)
Features:
- List all SFTP users with status
- Create new users with username, password, and role
- Edit existing users (change password/role)
- Toggle user enabled/disabled status
- Delete users
- Visual indicators for roles and status

#### Updated Navigation
- Added "FTP 계정" menu item to Admin Sidebar
- Created route `/admin/sftp-users` in App.tsx
- Integrated with existing admin authentication

### 4. Services

#### SFTP Users Service (`src/services/sftp-users.service.ts`)
- Client-side service for SFTP user management
- Handles all API calls for CRUD operations
- Type-safe implementation with TypeScript

### 5. Configuration

#### Environment Variables (`.env.example`)
```bash
SFTP_PORT=2222                    # SFTP server port
SFTP_HOST_KEY=./sftp-host-key     # SSH host key file
```

#### PM2 Ecosystem (`ecosystem.config.cjs`)
Added SFTP server process:
```javascript
{
  name: 'craneeyes-sftp',
  script: 'sftp-server.js',
  instances: 1,
  autorestart: true
}
```

#### NPM Scripts (`package.json`)
```bash
npm run sftp                  # Start SFTP server
npm run dev:all              # Start all services (API + SFTP + Frontend)
npm run create-sftp-users    # Create default SFTP users
```

### 6. Documentation

Created comprehensive documentation:
- `docs/SFTP_GUIDE.md` - Full SFTP guide (setup, usage, troubleshooting)
- `docs/SFTP_QUICK_START.md` - Quick reference for common tasks
- Updated `README.md` with SFTP information
- Added SFTP usage examples and security notes

### 7. Utilities

#### Default Users Script (`scripts/create-default-sftp-users.js`)
- Creates two default users with bcrypt-hashed passwords:
  - `sftpadmin` (admin role) - full access
  - `downloader` (downloader role) - read-only access

## Security Features

1. **Password Encryption**: All passwords hashed using bcrypt (10 rounds)
2. **SSH Encryption**: All SFTP connections encrypted via SSH protocol
3. **Role-Based Access Control**: 
   - Admin: Full read/write/delete access
   - Downloader: Read-only access
4. **S3 Credentials**: Never exposed to clients, handled server-side only
5. **Failed Login Logging**: All authentication attempts logged

## User Roles

### Admin Role
- **Permissions**: Read, Write, Delete
- **SFTP Commands**: ls, cd, get, put, rm
- **Use Case**: Uploading new firmware, managing files

### Downloader Role  
- **Permissions**: Read-only
- **SFTP Commands**: ls, cd, get
- **Use Case**: Downloading firmware for distribution

## Directory Structure

```
/firmwares/                    # Root directory for all firmwares
  ├── ModelName/              # Crane model (e.g., SS1416)
  │   └── Version/            # Version (e.g., v1.0)
  │       └── firmware.bin    # Firmware file
  └── ...
```

## Dependencies Added

### Production Dependencies
```json
{
  "ssh2": "^1.x",              // SSH2 server implementation
  "bcrypt": "^5.x"             // Password hashing
}
```

### Development Dependencies
```json
{
  "@types/ssh2": "^1.x",       // TypeScript types for ssh2
  "@types/bcrypt": "^5.x"      // TypeScript types for bcrypt
}
```

## How It Works

1. **Client Connection**: SFTP client connects to port 2222
2. **Authentication**: Server validates credentials against PostgreSQL
3. **Session Creation**: Authenticated session with user role
4. **SFTP Operations**: Client sends SFTP commands
5. **Bridge Translation**: SFTP-S3 bridge translates to S3 API calls
6. **Permission Check**: Role-based access control enforced
7. **S3 Execution**: Operations executed on S3 bucket
8. **Response**: Results sent back to SFTP client

## Usage Examples

### Connecting via SFTP
```bash
sftp -P 2222 username@server-ip
```

### Downloading a Firmware File
```bash
sftp> cd /firmwares/SS1416/v1.0
sftp> get firmware.bin
```

### Uploading a Firmware File (Admin Only)
```bash
sftp> cd /firmwares/SS1416/v2.0
sftp> put new-firmware.bin
```

## Testing Checklist

- [x] SFTP server starts successfully
- [x] User authentication works
- [x] Admin can list files
- [x] Admin can download files
- [x] Admin can upload files
- [x] Admin can delete files
- [x] Downloader can list files
- [x] Downloader can download files
- [x] Downloader cannot upload files
- [x] Downloader cannot delete files
- [x] Web interface user management works
- [x] Password changes take effect
- [x] Role changes take effect
- [x] User enable/disable works

## Deployment Steps

1. **Update Dependencies**
   ```bash
   npm install
   ```

2. **Apply Database Migration**
   ```bash
   psql -h your-db-host -U postgres -d crane_firmware < database/add-sftp-users.sql
   ```

3. **Create Default Users**
   ```bash
   npm run create-sftp-users
   ```

4. **Update Environment Variables**
   ```bash
   # Add to .env
   SFTP_PORT=2222
   SFTP_HOST_KEY=./sftp-host-key
   ```

5. **Start Services with PM2**
   ```bash
   pm2 restart ecosystem.config.cjs
   ```

6. **Open Firewall Port**
   ```bash
   # Allow port 2222 in firewall
   sudo ufw allow 2222/tcp
   ```

7. **Change Default Passwords**
   - Log in to Admin Panel
   - Navigate to FTP 계정
   - Change passwords for default users

## Monitoring

### View SFTP Server Logs
```bash
pm2 logs craneeyes-sftp
```

### Log Files
- `logs/pm2-sftp-out.log` - Standard output
- `logs/pm2-sftp-error.log` - Error output

### Key Metrics
- Active connections
- Authentication attempts (successful/failed)
- File operations (read/write/delete)
- S3 API calls

## Future Enhancements (Optional)

1. **SSH Key Authentication**: Support SSH key-based authentication
2. **Rate Limiting**: Limit connection attempts and file transfer rates
3. **Quota Management**: Set storage quotas per user
4. **Audit Logging**: Detailed audit logs for all file operations
5. **Multi-factor Authentication**: Add 2FA for admin users
6. **IP Whitelisting**: Restrict access to specific IP ranges
7. **Bandwidth Monitoring**: Track bandwidth usage per user
8. **File Versioning**: Automatic file versioning in S3

## Support Resources

- **Quick Start**: `docs/SFTP_QUICK_START.md`
- **Full Guide**: `docs/SFTP_GUIDE.md`
- **Admin Interface**: http://your-server/admin/sftp-users
- **Logs**: `pm2 logs craneeyes-sftp`

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check SFTP server is running: `pm2 status`
   - Verify port 2222 is open
   - Check firewall rules

2. **Authentication Failed**
   - Verify user exists and is enabled
   - Check password is correct
   - Review server logs

3. **Permission Denied**
   - Verify user has correct role (admin for write operations)
   - Check S3 credentials and permissions

## Files Modified

### New Files Created
- `sftp-server.js`
- `src/services/sftp-s3-bridge.service.ts`
- `src/services/sftp-users.service.ts`
- `src/pages/admin/SftpUsers.tsx`
- `database/add-sftp-users.sql`
- `scripts/create-default-sftp-users.js`
- `docs/SFTP_GUIDE.md`
- `docs/SFTP_QUICK_START.md`

### Files Modified
- `package.json` - Added dependencies and scripts
- `server.js` - Added SFTP user API endpoints
- `src/types/index.ts` - Added SftpUser interface
- `src/App.tsx` - Added SFTP users route
- `src/components/layout/AdminSidebar.tsx` - Added FTP 계정 menu
- `ecosystem.config.cjs` - Added SFTP server process
- `.env.example` - Added SFTP configuration
- `.gitignore` - Added sftp-host-key
- `README.md` - Added SFTP documentation

## Success Criteria Met

✅ S3 storage maintained as backend
✅ SFTP protocol support added
✅ Role-based access control implemented
✅ Admin UI for user management created
✅ Secure authentication with bcrypt
✅ Complete documentation provided
✅ Easy deployment process
✅ Production-ready configuration

## Conclusion

The SFTP integration is complete and production-ready. The system now provides:
- Secure file transfers via SFTP
- Web-based user management
- Role-based access control
- Seamless S3 backend integration
- Comprehensive documentation

Users can now access firmware files via both the web interface and SFTP, providing flexibility for different use cases and workflows.

---

**Implementation Date**: 2025-10-29
**Status**: ✅ Complete
**Version**: 0.1.0 with SFTP Support

