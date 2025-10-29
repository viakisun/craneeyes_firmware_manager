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

# SSH Key (multi-line)
echo -n "Setting EC2_SSH_KEY... "
cat << 'EOF' | gh secret set EC2_SSH_KEY -R "$REPO"
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA6jWZHXbEoeqgdEkvD/6QrBy9dYegSc27Wx3VBZ1bmfnwqiFw
ft1K4h64qKsffMeIdY8/CsQ4x7xXf4SvVr76pZ9M27joNnH+t0AIH1wKlIMoZHEK
DCJAgEQMWrw0TJYRkjlZVDrhOWJDtkuifqgkqKVqlYXIsocgWdFgacOG+rqM/rq1
1GU6+2e65nohQz+aPnWDn2GtX1A0o+Sw5N8J5w78y/529aK6u5Rdt+XtoI+8ldtu
Lg5i2nqMBusZ73Nz612O9y+xnKVegH9WoGHIzzUVz0o4MOMS4L5XFK7r3CRqVTo5
UB0gDeSAXMvu/PEJap7nfANSplJk21rLs6xU4wIDAQABAoIBAGUMwwdHWwdRJ/GE
Md4Aw4K+06+F2M5/CTsC4AoQHpmMkR2WV+ckq05sWtfLHUbFAEdYiqamiqkCxe2q
3cvbkmErHgoe+XGkNXXzFo4RNC9nd2H+s4sQrCurMHllglsY1HP2cmg5Dzum/fgF
IhLrkQWCeT4R/smoK3kVMTfwuKgsSaAknk5IVAWCoa6UjxFZAvGMOGt+H5XJ/+c7
zkxMPOS5wRRWebBzfjDVUl9/x8TdzLjyGSdBoOXUNBF/Z7GMcFLNVULjzAojVdhs
zcsDEFpv3xe1EsqOSCSgKtGvq94zqvD+IjC7AiN9ZTzKM/3XRx3TNRAMWwuIJtpK
mgmewAECgYEA+E5omQ2U2sLEAeE6235tUBe4HlHF8Gq0smhA4cPvqKS+1VNUQDpN
HB1Qy4il2LxP8aiXrw4sUqYH/Xk+y3u21EA9WDNu/Eo8oDz9/P/zs7tfPJWW/vUy
jVk3K2TC44sneuhD4CQmxCwg9/r1KhwJFsFPfMFA9mWjELEfpC2fzOMCgYEA8Xdf
DhVgIFvHnlsOHVYTsLlFZj9RG8QHjq34t9eBYsV1OLDD3xo96VNgejQC2X547Lns
V5M8tOnDaBQIkfJ8eJBP6GUBk/yx+BBrPTx4aMFowbncjs+wNRtjimhNsFWgr8p1
Utgv/IGw6XQPVDcH2BsvA9naxvEFNTc4CXav2AECgYEA9db7rH1L4YNv+MR8N5Dm
vaOeQTaJGU0sdm7Nvjj18SybXC5Sffy7F5jWw40ZVoqrRAG9nC4WKAYGZylByMlF
7MNleQwDWHpPp/57IaBwMoTS9/LLOsadNGEeRDJQ2mSNxBxuB18DmrpuMdcgIH79
aLAf+M6FeO6MEhyrzSr2yi0CgYEAmPo3joScUePTo8+sMYnHD79Q6GZUzHJ1Fz/A
wzgVEK5ohXH3pfDKKHhaNxGcfI5TriZcRV9Sposy8U0/4LbvhLJo7aKQTWFanv5H
8pPM9RETfShzQ0bxK7QebCGIlp6pHrX1fnbYb/D6U+zjiUcUASW3s4jhwggQdJZ3
OgengAECgYBAL6kNOU2UEdfw50YScsp+7H2tnlhhyrQmJAHdY37rFAUlxcoStDfr
etteVHeY+cEtIKUWPiew7EpqGMIt/e2uzeL5GtBxHroqlIdKh78h79imMW8/r5XV
QozPyKdRI8UW70PBZg4X5eMhLxW70da/ZxolqnhU/yt4t5Md7eRBQg==
-----END RSA PRIVATE KEY-----
EOF
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

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

