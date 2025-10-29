# SSL/HTTPS Setup Guide - firmware.craneeyes.com

Complete guide for setting up SSL/HTTPS for CraneEyes Firmware Manager on Amazon Linux EC2.

## Prerequisites

- ✅ EC2 instance running (54.180.29.96)
- ✅ Domain: firmware.craneeyes.com
- ✅ DNS A Record pointing to 54.180.29.96
- ✅ Nginx installed and configured
- ✅ Security Group allows HTTP (80) and HTTPS (443)

## Step 1: Configure DNS

### A Record Setup

Add an A record for your domain:

```
Type: A
Host: firmware
Domain: craneeyes.com
Value: 54.180.29.96
TTL: Auto or 300
```

### Verify DNS

```bash
# Check DNS resolution
nslookup firmware.craneeyes.com

# Or use dig
dig firmware.craneeyes.com

# Expected result: 54.180.29.96
```

**Wait 5-10 minutes** for DNS propagation.

## Step 2: Open Firewall Ports

### EC2 Security Group

Ensure these ports are open:

| Port | Protocol | Purpose |
|------|----------|---------|
| 22   | TCP      | SSH     |
| 80   | HTTP     | HTTP    |
| 443  | HTTPS    | HTTPS   |
| 2222 | TCP      | SFTP    |
| 3001 | TCP      | API (internal only) |

### Firewall Commands (on EC2)

```bash
# Enable firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow HTTP and HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Allow SFTP port
sudo firewall-cmd --permanent --add-port=2222/tcp

# Reload firewall
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-all
```

## Step 3: Install Certbot

### On Amazon Linux 2023

```bash
# Install certbot and nginx plugin
sudo dnf install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

### On Amazon Linux 2

```bash
# Enable EPEL repository
sudo amazon-linux-extras enable epel
sudo yum install -y epel-release

# Install certbot
sudo yum install -y certbot python2-certbot-nginx

# Verify installation
certbot --version
```

## Step 4: Obtain SSL Certificate

### Before Running Certbot

1. **Ensure Nginx is running**:
   ```bash
   sudo systemctl status nginx
   sudo systemctl start nginx  # if not running
   ```

2. **Verify domain is accessible**:
   ```bash
   curl -I http://firmware.craneeyes.com
   # Should return HTTP 200 OK
   ```

### Run Certbot

```bash
# Obtain and install certificate
sudo certbot --nginx -d firmware.craneeyes.com

# Follow the prompts:
# 1. Enter email address (for renewal notifications)
# 2. Agree to Terms of Service (Y)
# 3. Share email with EFF (optional)
# 4. Choose redirect option: 2 (Redirect - make all requests redirect to HTTPS)
```

### What Certbot Does

- Obtains SSL certificate from Let's Encrypt
- Validates domain ownership
- Installs certificate in Nginx
- Configures HTTPS (port 443)
- Sets up HTTP to HTTPS redirect
- Schedules automatic renewal

### Expected Output

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/firmware.craneeyes.com/fullchain.pem
Key is saved at: /etc/letsencrypt/live/firmware.craneeyes.com/privkey.pem
This certificate expires on 2026-01-27.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.
```

## Step 5: Verify SSL Certificate

### Check Certificate

```bash
# Check SSL certificate
sudo certbot certificates

# Expected output:
# Certificate Name: firmware.craneeyes.com
#   Domains: firmware.craneeyes.com
#   Expiry Date: 2026-01-27 (VALID: 89 days)
```

### Test HTTPS

```bash
# Test HTTPS connection
curl -I https://firmware.craneeyes.com

# Check SSL with detailed info
curl -vI https://firmware.craneeyes.com 2>&1 | grep -i ssl
```

### Browser Test

Visit:
- https://firmware.craneeyes.com
- Should show 🔒 padlock icon
- Certificate should be valid

## Step 6: Configure Auto-Renewal

### Renewal is Automatic

Certbot automatically configures renewal:

```bash
# Check renewal timer
sudo systemctl status certbot-renew.timer

# Or for Amazon Linux 2
sudo systemctl status certbot.timer
```

### Test Renewal

```bash
# Dry run (test without actual renewal)
sudo certbot renew --dry-run

# Expected: "Congratulations, all simulated renewals succeeded"
```

### Manual Renewal (if needed)

```bash
# Renew all certificates
sudo certbot renew

# Renew specific certificate
sudo certbot renew --cert-name firmware.craneeyes.com
```

## Step 7: Update Nginx Configuration

After certbot, your nginx config should automatically have HTTPS configured.

### Verify Nginx Config

```bash
# Check nginx configuration
sudo nginx -t

# View the updated configuration
sudo cat /etc/nginx/conf.d/craneeyes.conf
```

### Restart Nginx

```bash
# Restart nginx to apply changes
sudo systemctl restart nginx

# Verify nginx is running
sudo systemctl status nginx
```

## Step 8: Update Application Configuration

### Update .env file

On EC2, update the .env file:

```bash
# Edit .env
nano /home/ec2-user/craneeyes-firmware-manager/.env

# Change API_BASE_URL to use HTTPS
VITE_API_BASE_URL=https://firmware.craneeyes.com/api
```

### Rebuild and Restart

```bash
cd /home/ec2-user/craneeyes-firmware-manager

# Rebuild frontend with HTTPS
npm run build

# Copy to nginx directory
sudo cp -r dist/* /var/www/html/craneeyes/

# Restart PM2 services
pm2 restart ecosystem.config.cjs
```

## Troubleshooting

### Certificate Validation Failed

**Problem**: "Failed to connect to host"

**Solutions**:
1. Verify DNS is pointing to correct IP
2. Ensure ports 80 and 443 are open in security group
3. Check nginx is running and listening on port 80
4. Verify domain is accessible: `curl http://firmware.craneeyes.com`

### Too Many Requests

**Problem**: "too many certificates (5) already issued"

**Solutions**:
- Let's Encrypt has rate limits: 5 certificates per week per domain
- Wait 7 days before retrying
- Or use staging environment: `certbot --nginx --staging -d firmware.craneeyes.com`

### Certificate Not Trusted

**Problem**: Browser shows "Not Secure"

**Solutions**:
1. Check certificate is from Let's Encrypt (not self-signed)
2. Verify certificate matches domain
3. Clear browser cache
4. Check system time is correct

### Auto-Renewal Failing

**Problem**: Certificate expiring, renewal not working

**Solutions**:
```bash
# Check certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Test renewal
sudo certbot renew --dry-run

# Force renewal (if less than 30 days to expiry)
sudo certbot renew --force-renewal
```

## Maintenance

### Monitor Certificate Expiry

```bash
# Check certificate status
sudo certbot certificates

# Expected: Shows expiry date and remaining days
```

### Renewal Schedule

- Certificates expire after 90 days
- Auto-renewal attempts 30 days before expiry
- Renewal runs twice daily
- Email notifications sent if renewal fails

### Check Renewal Logs

```bash
# View certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Check renewal status
sudo certbot renew --dry-run
```

## Security Best Practices

### 1. Strong SSL Configuration

Certbot automatically configures strong SSL settings:
- TLS 1.2 and 1.3 only
- Strong cipher suites
- HSTS headers

### 2. Regular Updates

```bash
# Update certbot
sudo yum update certbot python3-certbot-nginx -y
```

### 3. Monitor Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/craneeyes_access.log

# Nginx error logs
sudo tail -f /var/log/nginx/craneeyes_error.log
```

### 4. Backup Certificates

```bash
# Backup certificates directory
sudo tar -czf letsencrypt-backup-$(date +%Y%m%d).tar.gz /etc/letsencrypt

# Store backup securely
```

## Testing SSL Configuration

### SSL Labs Test

Visit: https://www.ssllabs.com/ssltest/analyze.html?d=firmware.craneeyes.com

Expected Grade: A or A+

### Command Line Test

```bash
# Test SSL/TLS configuration
openssl s_client -connect firmware.craneeyes.com:443 -servername firmware.craneeyes.com

# Check certificate chain
openssl s_client -showcerts -connect firmware.craneeyes.com:443
```

## Nginx SSL Configuration (After Certbot)

Certbot modifies your nginx configuration. Example:

```nginx
server {
    listen 80;
    server_name firmware.craneeyes.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name firmware.craneeyes.com;

    ssl_certificate /etc/letsencrypt/live/firmware.craneeyes.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/firmware.craneeyes.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # ... rest of configuration ...
}
```

## Quick Reference

### Important Paths

```
Certificates: /etc/letsencrypt/live/firmware.craneeyes.com/
Nginx Config: /etc/nginx/conf.d/craneeyes.conf
Logs: /var/log/letsencrypt/
Web Root: /var/www/html/craneeyes
```

### Important Commands

```bash
# Check certificate
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# Restart nginx
sudo systemctl restart nginx

# Check nginx status
sudo systemctl status nginx
```

## Support

For SSL issues:
1. Check certbot logs: `/var/log/letsencrypt/`
2. Verify DNS resolution
3. Check firewall and security groups
4. Test with: `curl -vI https://firmware.craneeyes.com`

---

**Last Updated**: 2025-10-29
**Certificate Authority**: Let's Encrypt
**Renewal**: Automatic (every 60 days)

