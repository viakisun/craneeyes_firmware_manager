# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows

### 1. CI - Code Quality Check (`ci.yml`)

**Trigger**: Pull Request to `main` branch

**Purpose**: Validate code quality and build integrity before merging

**Steps**:
- ✅ Checkout code
- ✅ Setup Node.js 18
- ✅ Install dependencies
- ✅ TypeScript type checking
- ✅ Build frontend

**What it checks**:
- TypeScript compilation errors
- Build process success
- Dependencies integrity

### 2. CD - Deploy to EC2 (`deploy.yml`)

**Trigger**: 
- Push to `main` branch (automatic)
- Manual trigger via workflow_dispatch

**Purpose**: Automatically deploy application to EC2 production server

**Steps**:
1. **Build Stage**
   - Checkout code
   - Setup Node.js
   - Install dependencies
   - Build frontend with production env vars

2. **Package Stage**
   - Create deployment tarball
   - Include all necessary files

3. **Deploy Stage**
   - Setup SSH connection
   - Upload package to EC2
   - Extract files
   - Install dependencies
   - Copy frontend to Nginx
   - Restart PM2 services (API + SFTP)
   - Reload Nginx

4. **Verify Stage**
   - Health check API endpoint
   - Display deployment summary

## Deployment Flow

```
Code Push to main
       ↓
   Build Frontend
       ↓
 Create Package (.tar.gz)
       ↓
   SSH to EC2
       ↓
  Extract Files
       ↓
Update Dependencies
       ↓
Copy to /var/www/html/craneeyes
       ↓
PM2 Restart (API + SFTP)
       ↓
  Reload Nginx
       ↓
  Health Check
       ↓
✅ Deployment Complete
```

## Manual Deployment

You can manually trigger deployment from GitHub:

1. Go to **Actions** tab
2. Select **CD - Deploy to EC2**
3. Click **Run workflow**
4. Optionally provide a deployment reason
5. Click **Run workflow** button

## Secrets Configuration

Required GitHub Secrets (already configured):

**EC2 Configuration**:
- `EC2_HOST` - EC2 server IP address
- `EC2_USER` - SSH username
- `EC2_SSH_KEY` - SSH private key

**AWS Configuration**:
- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_BUCKET_NAME` - S3 bucket name

**Database Configuration**:
- `DB_HOST` - Database hostname
- `DB_PORT` - Database port
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name

**Application Configuration**:
- `API_PORT` - API server port (3001)
- `SFTP_PORT` - SFTP server port (2222)

## Monitoring Deployments

### View Workflow Runs
https://github.com/viakisun/craneeyes_firmware_manager/actions

### Check Deployment Status

After deployment, verify:

1. **API Health**:
   ```bash
   curl http://54.180.29.96:3001/api/health
   ```

2. **PM2 Status** (on EC2):
   ```bash
   pm2 list
   pm2 logs craneeyes-api
   pm2 logs craneeyes-sftp
   ```

3. **Nginx Status** (on EC2):
   ```bash
   sudo systemctl status nginx
   sudo tail -f /var/log/nginx/craneeyes_access.log
   ```

## Rollback

If deployment fails or issues occur:

1. **Via PM2** (on EC2):
   ```bash
   pm2 restart ecosystem.config.cjs
   ```

2. **Restore Backup**:
   ```bash
   cd /home/ec2-user/craneeyes-firmware-manager
   tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz
   pm2 restart all
   ```

3. **Git Rollback**:
   ```bash
   git revert <commit-hash>
   git push origin main
   # CI/CD will automatically deploy the reverted version
   ```

## Troubleshooting

### Deployment Failed

1. Check workflow logs in GitHub Actions
2. Verify SSH connection: `ssh -i key.pem ec2_user@54.180.29.96`
3. Check EC2 disk space: `df -h`
4. Verify PM2 processes: `pm2 list`

### Health Check Failed

1. Check API logs: `pm2 logs craneeyes-api`
2. Verify .env file on EC2
3. Check database connectivity
4. Verify ports are open in security group

### Build Failed

1. Check CI workflow logs
2. Verify TypeScript types
3. Check for missing dependencies
4. Test build locally: `npm run build`

## Best Practices

1. **Always test locally** before pushing to main
2. **Create Pull Requests** for code review (triggers CI)
3. **Monitor deployments** in GitHub Actions
4. **Check health** after deployment
5. **Keep backups** of working versions

## Files Modified by Workflows

- `/var/www/html/craneeyes/` - Frontend files
- `/home/ec2-user/craneeyes-firmware-manager/` - Application files
- PM2 processes: `craneeyes-api`, `craneeyes-sftp`
- Nginx configuration

## Security Notes

- SSH keys are stored securely in GitHub Secrets
- Environment variables never exposed in logs
- Database credentials encrypted
- AWS credentials managed via secrets

## Support

For issues with CI/CD:
1. Check workflow logs
2. Review EC2 server logs
3. Verify GitHub Secrets configuration
4. Contact system administrator

---

**Last Updated**: 2025-10-29
**Maintained by**: CraneEyes Team

