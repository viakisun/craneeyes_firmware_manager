# SFTP Quick Start Guide

## Setup (One-time)

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Apply database migration
psql -h your-db-host -U postgres -d crane_firmware < database/add-sftp-users.sql

# 3. Create default users
npm run create-sftp-users

# 4. Update .env with SFTP settings
SFTP_PORT=2222
SFTP_HOST_KEY=./sftp-host-key
```

## Starting the Server

```bash
# Development
npm run sftp

# Production (with PM2)
pm2 start ecosystem.config.cjs
```

## Connecting

### Command Line
```bash
sftp -P 2222 username@server-ip
```

### Default Credentials
```
Username: sftpadmin
Password: admin123
Role: Admin (read/write)

Username: downloader  
Password: download123
Role: Downloader (read-only)

⚠️ Change these passwords immediately!
```

## Common Commands

```bash
# List files
sftp> ls /firmwares

# Navigate
sftp> cd /firmwares/SS1416/v1.0

# Download
sftp> get firmware.bin

# Upload (admin only)
sftp> put new-firmware.bin

# Delete (admin only)
sftp> rm old-firmware.bin

# Exit
sftp> quit
```

## Managing Users

1. Open Admin Panel: http://your-server:5174/admin
2. Login with: `crane@dy.co.kr` / `1234`
3. Navigate to: **FTP 계정**
4. Create/Edit/Delete users as needed

## User Roles

| Role | List | Download | Upload | Delete |
|------|------|----------|--------|--------|
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Downloader** | ✅ | ✅ | ❌ | ❌ |

## Troubleshooting

### Cannot Connect
```bash
# Check if server is running
pm2 status

# View logs
pm2 logs craneeyes-sftp

# Test port
telnet server-ip 2222
```

### Authentication Failed
- Verify username/password in Admin Panel → FTP 계정
- Check if account is enabled
- Passwords are case-sensitive

### Permission Denied
- Downloader role cannot upload/delete
- Verify user has admin role for write operations

## File Paths

All firmware files are in `/firmwares/` directory:

```
/firmwares/
  └── ModelName/
      └── Version/
          └── firmware.bin
```

## Support

- Full Guide: `docs/SFTP_GUIDE.md`
- Web Interface: Admin Panel → FTP 계정
- Logs: `pm2 logs craneeyes-sftp`

---

**Need Help?** Check the full SFTP Guide or contact your system administrator.

