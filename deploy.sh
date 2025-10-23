#!/bin/bash

# CraneEyes Firmware Manager - Deployment Script for Amazon Linux
# This script handles the deployment process for EC2 instances

set -e  # Exit on error

echo "======================================"
echo "CraneEyes Firmware Manager Deployment"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as correct user
if [ "$USER" != "ec2-user" ] && [ "$USER" != "admin" ]; then
    echo -e "${YELLOW}Warning: Running as $USER. Make sure you have proper permissions.${NC}"
fi

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 is not installed. Installing PM2...${NC}"
    sudo npm install -g pm2
fi

echo ""
echo "Step 1: Pulling latest code from repository..."
git pull origin main

echo ""
echo "Step 2: Installing dependencies..."
npm install

echo ""
echo "Step 3: Building frontend..."
npm run build

echo ""
echo "Step 4: Copying built files to web directory..."
sudo mkdir -p /var/www/html/craneeyes
sudo rm -rf /var/www/html/craneeyes/*
sudo cp -r dist/* /var/www/html/craneeyes/

echo ""
echo "Step 5: Restarting backend server with PM2..."
pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js

echo ""
echo "Step 6: Reloading Nginx configuration..."
sudo systemctl reload nginx

echo ""
echo -e "${GREEN}======================================"
echo "Deployment completed successfully!"
echo "======================================${NC}"
echo ""
echo "PM2 Status:"
pm2 list
echo ""
echo "Application is now live at: https://firmware.yourdomain.com"
echo ""

