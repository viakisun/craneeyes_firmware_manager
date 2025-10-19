# Deployment Guide

## Overview

This guide covers deploying CraneEyes Firmware Manager to production environments.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (AWS RDS recommended)
- AWS S3 bucket for file storage
- Domain name and SSL certificate

## Environment Setup

### 1. Environment Variables

Create `.env` file with the following variables:

```env
# AWS S3 Configuration
VITE_AWS_REGION=ap-northeast-2
VITE_AWS_ACCESS_KEY_ID=your-access-key
VITE_AWS_SECRET_ACCESS_KEY=your-secret-key
VITE_AWS_BUCKET_NAME=your-bucket-name

# Database Configuration
VITE_AWS_DB_HOST=your-rds-endpoint
VITE_AWS_DB_PORT=5432
VITE_AWS_DB_NAME=crane_firmware
VITE_AWS_DB_USER=postgres
VITE_AWS_DB_PASSWORD=your-password

# API Configuration
VITE_API_BASE_URL=https://your-domain.com/api
API_PORT=3001
NODE_ENV=production
```

### 2. Database Setup

1. Create PostgreSQL database
2. Run initialization scripts:
   ```bash
   psql -h your-rds-endpoint -U postgres -d crane_firmware < database/create_db.sql
   psql -h your-rds-endpoint -U postgres -d crane_firmware < database/init.sql
   ```

### 3. AWS S3 Setup

1. Create S3 bucket
2. Configure CORS policy:
   ```json
   {
     "AllowedHeaders": ["*"],
     "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
     "AllowedOrigins": ["https://your-domain.com"],
     "ExposeHeaders": []
   }
   ```
3. Set bucket permissions for your IAM user

## Build Process

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Frontend

```bash
npm run build
```

### 3. Build Backend (if using Docker)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

## Deployment Options

### Option 1: Traditional VPS/Server

1. Upload files to server
2. Install Node.js and dependencies
3. Configure reverse proxy (Nginx)
4. Set up PM2 for process management
5. Configure SSL certificate

### Option 2: Docker Deployment

1. Build Docker image
2. Deploy with Docker Compose
3. Configure networking and volumes

### Option 3: Cloud Platform (AWS, GCP, Azure)

1. Use container services (ECS, Cloud Run, Container Instances)
2. Configure load balancers
3. Set up auto-scaling
4. Configure monitoring and logging

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'craneeyes-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Monitoring and Logging

### 1. Application Monitoring
- Use PM2 monitoring: `pm2 monit`
- Set up health checks for API endpoints
- Monitor database connections and performance

### 2. Log Management
- Configure log rotation
- Set up centralized logging (ELK stack, CloudWatch)
- Monitor error rates and response times

### 3. Database Monitoring
- Monitor connection pool usage
- Track query performance
- Set up automated backups

## Security Considerations

### 1. Environment Security
- Use environment variables for sensitive data
- Restrict database access by IP
- Implement proper CORS policies

### 2. File Upload Security
- Validate file types and sizes
- Scan uploaded files for malware
- Implement rate limiting

### 3. API Security
- Implement authentication middleware
- Use HTTPS for all communications
- Validate and sanitize all inputs

## Backup Strategy

### 1. Database Backups
```bash
# Daily automated backup
0 2 * * * pg_dump -h your-rds-endpoint -U postgres crane_firmware > /backups/craneeyes_$(date +\%Y\%m\%d).sql
```

### 2. S3 Backups
- Enable S3 versioning
- Configure cross-region replication
- Set up lifecycle policies

## Performance Optimization

### 1. Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies

### 2. Backend
- Configure connection pooling
- Implement caching for frequently accessed data
- Optimize database queries

### 3. Database
- Regular VACUUM and ANALYZE
- Monitor and optimize slow queries
- Consider read replicas for scaling

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check network connectivity
   - Verify credentials and permissions
   - Check SSL certificate configuration

2. **S3 Upload Failures**
   - Verify AWS credentials
   - Check bucket permissions
   - Validate CORS configuration

3. **API Timeout Issues**
   - Check server resources
   - Optimize database queries
   - Implement proper error handling

### Log Locations
- Application logs: PM2 logs
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and rotate logs
- Monitor disk space and performance
- Test backup and recovery procedures

### Updates
1. Test updates in staging environment
2. Backup database before updates
3. Deploy during maintenance windows
4. Monitor for issues post-deployment
