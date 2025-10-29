# CI/CD Guide - CraneEyes Firmware Manager

Complete guide for the Continuous Integration and Continuous Deployment pipeline.

## Overview

The CraneEyes Firmware Manager uses GitHub Actions for automated CI/CD:

- **CI (Continuous Integration)**: Validates code quality on every Pull Request
- **CD (Continuous Deployment)**: Automatically deploys to EC2 when code is merged to `main`

## Architecture

```
┌─────────────────┐
│  Developer      │
│  Push Code      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pull Request   │──────► CI Workflow
│  to main        │        - Type Check
└────────┬────────┘        - Build Test
         │                 - Validation
         │
         │ (After PR Merge)
         ▼
┌─────────────────┐
│  Push to main   │──────► CD Workflow
└────────┬────────┘        - Build
         │                 - Package
         │                 - Deploy to EC2
         │                 - Health Check
         ▼
┌─────────────────┐
│  Production     │
│  EC2 Server     │
│  54.180.29.96   │
└─────────────────┘
```

## CI Workflow (Pull Request)

### Trigger
- Pull Request created or updated
- Target branch: `main`

### What It Does

1. **Code Checkout**: Gets the latest code
2. **Node.js Setup**: Installs Node.js 18
3. **Dependencies**: Installs npm packages
4. **Type Check**: Validates TypeScript types
5. **Build Test**: Attempts to build frontend

### Example Output

```
✅ Checkout code
✅ Setup Node.js 18
✅ Install dependencies
✅ TypeScript type check
✅ Build frontend
✅ All checks passed!
```

### When It Fails

Common failure reasons:
- TypeScript errors
- Missing dependencies
- Build configuration issues
- Environment variable issues

**Action**: Fix the issues and push again. The workflow will re-run automatically.

## CD Workflow (Deployment)

### Trigger

**Automatic**:
- Push to `main` branch
- Only if relevant files changed (src/, server.js, etc.)

**Manual**:
- Via GitHub Actions UI
- "Run workflow" button

### Deployment Steps

#### 1. Build Stage
```
- Checkout code
- Setup Node.js 18
- Install dependencies
- Build frontend with production env vars
```

#### 2. Package Stage
```
- Create deployment.tar.gz containing:
  - dist/ (frontend build)
  - server.js (API server)
  - sftp-server.js (SFTP server)
  - package.json
  - ecosystem.config.cjs
  - database/ (migrations)
  - scripts/
```

#### 3. Deploy Stage
```
- Setup SSH connection to EC2
- Upload deployment package
- Extract files on EC2
- Install/update dependencies
- Backup current version
- Copy frontend to /var/www/html/craneeyes
- Restart PM2 services (API + SFTP)
- Reload Nginx
```

#### 4. Verification Stage
```
- Health check API endpoint
- Display deployment summary
```

### Environment Variables

Managed via GitHub Secrets:

```yaml
Build-time:
  VITE_AWS_REGION
  VITE_AWS_ACCESS_KEY_ID
  VITE_AWS_SECRET_ACCESS_KEY
  VITE_AWS_BUCKET_NAME
  VITE_AWS_DB_HOST
  VITE_AWS_DB_PORT
  VITE_AWS_DB_NAME
  VITE_AWS_DB_USER
  VITE_AWS_DB_PASSWORD
  VITE_API_BASE_URL

Runtime (on EC2):
  API_PORT
  SFTP_PORT
```

## GitHub Secrets Setup

### Required Secrets

All secrets are already configured via `scripts/setup-github-secrets.sh`.

View secrets at:
https://github.com/viakisun/craneeyes_firmware_manager/settings/secrets/actions

### Update a Secret

#### Via GitHub CLI:
```bash
echo "new-value" | gh secret set SECRET_NAME -R viakisun/craneeyes_firmware_manager
```

#### Via Web UI:
1. Go to Repository Settings → Secrets → Actions
2. Click on the secret name
3. Click "Update secret"
4. Enter new value
5. Click "Update secret"

### Add New Secret

```bash
# Via CLI
echo "value" | gh secret set NEW_SECRET -R viakisun/craneeyes_firmware_manager

# Via UI
Settings → Secrets → Actions → "New repository secret"
```

## Deployment Process

### Automatic Deployment

1. **Make changes locally**
   ```bash
   git checkout -b feature/my-feature
   # Make changes...
   git add .
   git commit -m "Add feature"
   git push origin feature/my-feature
   ```

2. **Create Pull Request**
   - Go to GitHub
   - Create PR to `main`
   - CI workflow runs automatically
   - Wait for green checkmark ✅

3. **Merge PR**
   - Review code
   - Merge to `main`
   - CD workflow triggers automatically

4. **Monitor Deployment**
   - Go to Actions tab
   - Watch deployment progress
   - Check for success ✅

### Manual Deployment

Sometimes you need to deploy without code changes:

1. **Go to GitHub Actions**
   https://github.com/viakisun/craneeyes_firmware_manager/actions

2. **Select "CD - Deploy to EC2"**

3. **Click "Run workflow"**

4. **Select branch** (usually `main`)

5. **Optionally provide reason**
   Example: "Hotfix deployment" or "Configuration update"

6. **Click "Run workflow"** button

7. **Monitor progress**

## Monitoring Deployments

### GitHub Actions Dashboard

View all workflows:
https://github.com/viakisun/craneeyes_firmware_manager/actions

Filter by:
- Workflow (CI or CD)
- Status (success, failure, in progress)
- Branch
- Date

### Deployment Logs

Click on any workflow run to see:
- Step-by-step execution
- Console output
- Timing information
- Error messages (if failed)

### Post-Deployment Checks

After deployment completes:

1. **Check API Health**:
   ```bash
   curl http://54.180.29.96:3001/api/health
   ```
   Expected: `{"status":"OK","message":"CraneEyes API Server is running"}`

2. **Check Frontend**:
   ```bash
   curl -I http://54.180.29.96
   ```
   Expected: HTTP 200 OK

3. **Check SFTP** (on EC2):
   ```bash
   ssh ec2_user@54.180.29.96 "pm2 logs craneeyes-sftp --lines 50"
   ```

4. **Check PM2 Status** (on EC2):
   ```bash
   ssh ec2_user@54.180.29.96 "pm2 list"
   ```
   Expected: Both `craneeyes-api` and `craneeyes-sftp` online

## Troubleshooting

### Deployment Failed - Build Error

**Symptoms**: Build step fails in GitHub Actions

**Common Causes**:
- TypeScript errors
- Missing dependencies
- Environment variable issues

**Solution**:
1. Check build logs in GitHub Actions
2. Fix errors locally
3. Test build: `npm run build`
4. Push fix and retry

### Deployment Failed - SSH Connection

**Symptoms**: "Connection refused" or "Permission denied"

**Common Causes**:
- SSH key incorrect
- EC2 instance stopped
- Security group blocking SSH

**Solution**:
1. Verify EC2 instance is running
2. Check security group allows SSH (port 22)
3. Verify SSH key in GitHub Secrets
4. Test SSH manually:
   ```bash
   ssh -i key.pem ec2_user@54.180.29.96
   ```

### Deployment Failed - Disk Space

**Symptoms**: "No space left on device"

**Solution** (on EC2):
```bash
# Check disk space
df -h

# Clean old backups
cd /home/ec2-user/craneeyes-firmware-manager
rm backup-*.tar.gz

# Clean PM2 logs
pm2 flush

# Clean npm cache
npm cache clean --force
```

### Health Check Failed

**Symptoms**: Health check reports failure but deployment completed

**Common Causes**:
- Services still starting up
- API not responding
- Port blocked

**Solution**:
1. Wait 30 seconds and check manually:
   ```bash
   curl http://54.180.29.96:3001/api/health
   ```

2. Check PM2 logs:
   ```bash
   ssh ec2_user@54.180.29.96 "pm2 logs craneeyes-api"
   ```

3. Restart services if needed:
   ```bash
   ssh ec2_user@54.180.29.96 "pm2 restart all"
   ```

### Services Not Starting

**Symptoms**: PM2 shows services as "errored"

**Solution** (on EC2):
```bash
# Check PM2 logs
pm2 logs

# Check for errors
pm2 describe craneeyes-api
pm2 describe craneeyes-sftp

# Restart with ecosystem
pm2 restart ecosystem.config.cjs

# If still failing, check .env
cat .env
```

## Rollback Procedures

### Option 1: Git Revert (Recommended)

```bash
# Find the commit to revert
git log --oneline

# Revert the commit
git revert <commit-hash>

# Push to trigger automatic deployment
git push origin main
```

### Option 2: Manual Rollback on EC2

```bash
# SSH to EC2
ssh ec2_user@54.180.29.96

# Go to project directory
cd /home/ec2-user/craneeyes-firmware-manager

# List backups
ls -lt backup-*.tar.gz

# Restore backup
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz

# Restart services
pm2 restart ecosystem.config.cjs
```

### Option 3: Re-deploy Previous Version

1. Go to GitHub Actions
2. Find successful previous deployment
3. Note the commit hash
4. Checkout that commit:
   ```bash
   git checkout <commit-hash>
   git checkout -b rollback-<version>
   git push origin rollback-<version>
   ```
5. Merge rollback branch to main

## Best Practices

### Before Deployment

1. ✅ **Test locally**: `npm run build` and `npm run dev:all`
2. ✅ **Create PR**: Never push directly to main
3. ✅ **Wait for CI**: Ensure CI passes
4. ✅ **Code review**: Get approval from team member
5. ✅ **Check status**: Verify production is stable

### During Deployment

1. 🔍 **Monitor**: Watch GitHub Actions live
2. 📊 **Check logs**: Look for errors or warnings
3. ⏱️ **Be patient**: Full deployment takes 2-3 minutes
4. 🚨 **Alert**: Notify team of deployment

### After Deployment

1. ✅ **Verify health**: Check API endpoint
2. ✅ **Test features**: Smoke test critical paths
3. ✅ **Monitor logs**: Watch PM2 logs for errors
4. ✅ **Check metrics**: CPU, memory, disk usage
5. 📝 **Document**: Note any issues or observations

## Maintenance

### Weekly Tasks

- Review deployment logs
- Check PM2 process health
- Verify disk space
- Clean old backups

### Monthly Tasks

- Update Node.js dependencies
- Review and rotate secrets
- Audit deployment times
- Optimize build process

### Quarterly Tasks

- Update Node.js version
- Review and update workflows
- Security audit
- Performance optimization

## Advanced Topics

### Deployment Notifications

To add Slack notifications, add to `deploy.yml`:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Multiple Environments

To add staging environment:

1. Create `staging` branch
2. Duplicate `deploy.yml` as `deploy-staging.yml`
3. Update trigger to `staging` branch
4. Add `EC2_HOST_STAGING` secret

### Database Migrations

To run migrations automatically, add to deploy step:

```bash
# Run database migrations
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/migrations/latest.sql
```

## Support

For CI/CD issues:
1. Check workflow logs
2. Review this guide
3. Check EC2 server logs
4. Contact DevOps team

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Last Updated**: 2025-10-29
**Version**: 1.0
**Maintained by**: CraneEyes DevOps Team

