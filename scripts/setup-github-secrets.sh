#!/bin/bash

# GitHub Secrets Setup Script for CraneEyes Firmware Manager
# This script automatically sets up GitHub repository secrets using GitHub CLI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "════════════════════════════════════════════════════════════"
echo "  GitHub Secrets Setup - CraneEyes Firmware Manager"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed.${NC}"
    echo ""
    echo "Please install GitHub CLI first:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   See https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  Windows: See https://github.com/cli/cli#installation"
    echo ""
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  You are not authenticated with GitHub CLI.${NC}"
    echo "Please run: gh auth login"
    echo ""
    exit 1
fi

# Get repository info
REPO="viakisun/craneeyes_firmware_manager"
echo -e "${BLUE}📦 Repository: ${REPO}${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file first with all required variables."
    exit 1
fi

# Source .env file
source .env

echo -e "${YELLOW}🔐 Setting up GitHub Secrets...${NC}"
echo ""

# Function to set a secret
set_secret() {
    local name=$1
    local value=$2
    
    if [ -z "$value" ]; then
        echo -e "${YELLOW}⚠️  Skipping ${name} (empty value)${NC}"
        return
    fi
    
    echo -n "Setting ${name}... "
    if echo "$value" | gh secret set "$name" -R "$REPO"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
    fi
}

# EC2 Configuration
echo -e "${BLUE}1. EC2 Configuration${NC}"
set_secret "EC2_HOST" "54.180.29.96"
set_secret "EC2_USER" "ec2_user"

# SSH Key (multi-line) - REMOVED FOR SECURITY
# DO NOT commit actual SSH keys to Git!
# Instead, use: cat /path/to/your/key.pem | gh secret set EC2_SSH_KEY -R "$REPO"
echo -e "${YELLOW}⚠️  SSH Key must be set manually with your actual key file${NC}"
echo "Run: cat /path/to/your/ec2-key.pem | gh secret set EC2_SSH_KEY -R \"$REPO\""

echo ""
echo -e "${BLUE}2. AWS Configuration${NC}"
set_secret "AWS_REGION" "$VITE_AWS_REGION"
set_secret "AWS_ACCESS_KEY_ID" "$VITE_AWS_ACCESS_KEY_ID"
set_secret "AWS_SECRET_ACCESS_KEY" "$VITE_AWS_SECRET_ACCESS_KEY"
set_secret "AWS_BUCKET_NAME" "$VITE_AWS_BUCKET_NAME"

echo ""
echo -e "${BLUE}3. Database Configuration${NC}"
set_secret "DB_HOST" "$VITE_AWS_DB_HOST"
set_secret "DB_PORT" "$VITE_AWS_DB_PORT"
set_secret "DB_USER" "$VITE_AWS_DB_USER"
set_secret "DB_PASSWORD" "$VITE_AWS_DB_PASSWORD"
set_secret "DB_NAME" "$VITE_AWS_DB_NAME"

echo ""
echo -e "${BLUE}4. Application Configuration${NC}"
set_secret "API_PORT" "${API_PORT:-3001}"
set_secret "SFTP_PORT" "${SFTP_PORT:-2222}"

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ GitHub Secrets setup complete!${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "You can verify the secrets at:"
echo "https://github.com/${REPO}/settings/secrets/actions"
echo ""
echo "Next steps:"
echo "1. Verify all secrets are set correctly"
echo "2. Commit and push the GitHub Actions workflows"
echo "3. Test the CI/CD pipeline"
echo ""

