# CraneEyes Firmware Manager - EC2 Deployment Guide

This guide provides step-by-step instructions for deploying the CraneEyes Firmware Manager on Amazon Linux 2 or Amazon Linux 2023.

## Prerequisites

- EC2 instance running Amazon Linux 2 or 2023
- Security group configured to allow:
  - SSH (port 22)
  - HTTP (port 80)
  - HTTPS (port 443)
- Domain name configured to point to your EC2 instance
- AWS RDS PostgreSQL database configured
- AWS S3 bucket created and configured

## Part 1: Initial Server Setup

### 1.1 Connect to EC2 Instance

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 1.2 Update System Packages

```bash
sudo yum update -y
```

### 1.3 Install Node.js

Amazon Linux 2023 uses Node.js 18+ by default. For Amazon Linux 2:

```bash
# Install Node.js 18 using NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.4 Install Git

```bash
sudo yum install -y git
```

### 1.5 Install Nginx

```bash
sudo yum install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx
```

### 1.6 Install PM2

```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### 1.7 Configure Firewall

```bash
# Enable firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow HTTP and HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Part 2: Application Setup

### 2.1 Clone Repository

```bash
cd /home/ec2-user
git clone https://github.com/your-org/craneeyes-firmware-manager.git
cd craneeyes-firmware-manager
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Configure Environment Variables

```bash
# Copy the production environment template
cp env.production.example .env

# Edit the .env file with your actual credentials
nano .env
```

Required environment variables:
- VITE_AWS_REGION
- VITE_AWS_ACCESS_KEY_ID
- VITE_AWS_SECRET_ACCESS_KEY
- VITE_AWS_BUCKET_NAME
- VITE_AWS_DB_HOST
- VITE_AWS_DB_PORT
- VITE_AWS_DB_NAME
- VITE_AWS_DB_USER
- VITE_AWS_DB_PASSWORD
- VITE_API_BASE_URL
- API_PORT

### 2.4 Build Frontend

```bash
npm run build
```

### 2.5 Create Web Directory and Copy Files

```bash
sudo mkdir -p /var/www/html/craneeyes
sudo cp -r dist/* /var/www/html/craneeyes/
sudo chown -R nginx:nginx /var/www/html/craneeyes
```

## Part 3: Nginx Configuration

### 3.1 Create Nginx Configuration File

```bash
sudo nano /etc/nginx/conf.d/craneeyes.conf
```

Copy the contents from `nginx.conf` in the project root.

The configuration uses `server_name _;` which accepts any domain name or IP address.
This allows the application to work with EC2 public IP, hostname, or custom domain.

### 3.2 Test Nginx Configuration

```bash
sudo nginx -t
```

### 3.3 Restart Nginx

```bash
sudo systemctl restart nginx
```

## Part 4: SSL Certificate Setup

### 4.1 Install Certbot

```bash
sudo yum install -y certbot python3-certbot-nginx
```

### 4.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com
```

Follow the prompts to complete the SSL certificate installation.

### 4.3 Auto-renewal Setup

Certbot automatically configures renewal. Test with:

```bash
sudo certbot renew --dry-run
```

## Part 5: Backend Server Setup

### 5.1 Create Logs Directory

```bash
mkdir -p logs
```

### 5.2 Start Backend Server with PM2

```bash
pm2 start ecosystem.config.cjs
```

### 5.3 Save PM2 Configuration

```bash
pm2 save
pm2 startup
```

Follow the command output to enable PM2 on system boot.

### 5.4 Verify Services

```bash
# Check PM2 status
pm2 list

# Check API health
curl http://localhost:3001/api/health
```

## Part 6: Deployment Script Setup

### 6.1 Make Deployment Script Executable

```bash
chmod +x deploy.sh
```

### 6.2 Configure Web Directory Permissions

```bash
sudo chown -R ec2-user:ec2-user /var/www/html/craneeyes
```

Note: You may need to adjust this based on your deployment user.

### 6.3 Test Deployment Script

```bash
./deploy.sh
```

## Part 7: Future Deployments

After initial setup, deploy updates using:

```bash
cd /home/ec2-user/craneeyes-firmware-manager
./deploy.sh
```

## Troubleshooting

### Nginx not serving files

Check file permissions:
```bash
sudo ls -la /var/www/html/craneeyes/dist
sudo chown -R nginx:nginx /var/www/html/craneeyes
```

Check Nginx configuration:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/craneeyes_error.log
```

### Backend API not responding

Check PM2 logs:
```bash
pm2 logs craneeyes-api
```

Check if the backend server is running:
```bash
pm2 list
pm2 restart craneeyes-api
```

Verify environment variables:
```bash
pm2 env craneeyes-api
```

### Database connection issues

Verify database connectivity:
```bash
psql -h your-rds-endpoint -U postgres -d crane_firmware
```

Check security group settings:
- Ensure the EC2 security group allows outbound connections
- Ensure the RDS security group allows inbound connections from the EC2 security group

### SSL certificate issues

Renew certificate manually:
```bash
sudo certbot renew
```

Check certificate expiration:
```bash
sudo certbot certificates
```

### Port conflicts

Check if ports are in use:
```bash
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
sudo netstat -tulpn | grep :3001
```

### File permissions

Fix web directory permissions:
```bash
sudo chown -R nginx:nginx /var/www/html/craneeyes
sudo chmod -R 755 /var/www/html/craneeyes
```

Fix project directory permissions:
```bash
sudo chown -R ec2-user:ec2-user /home/ec2-user/craneeyes-firmware-manager
```

## Maintenance

### View application logs

PM2 logs:
```bash
pm2 logs craneeyes-api
```

Nginx logs:
```bash
sudo tail -f /var/log/nginx/craneeyes_access.log
sudo tail -f /var/log/nginx/craneeyes_error.log
```

### Restart services

Restart backend:
```bash
pm2 restart craneeyes-api
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

### Update dependencies

```bash
cd /home/ec2-user/craneeyes-firmware-manager
npm update
./deploy.sh
```

### Database backups

Schedule regular database backups using AWS RDS automated backups or manual snapshots through the AWS Console.

## Security Considerations

1. Keep system packages updated: `sudo yum update -y`
2. orkNode.js dependencies updated: `npm audit` and `npm audit fix`
3. Use strong database passwords
4. Rotate AWS credentials regularly
5. Monitor AWS CloudWatch logs
6. Implement AWS WAF if necessary
7. Restrict security group rules to necessary ports only
8. Enable AWS RDS encryption at rest

## Additional Resources

- AWS EC2 Documentation: https://docs.aws.amazon.com/ec2/
- Nginx Documentation: https://nginx.org/en/docs/
- PM2 Documentation: https://pm2.keymetrics.io/docs/
- Let's Encrypt Documentation: https://letsencrypt.org/docs/

