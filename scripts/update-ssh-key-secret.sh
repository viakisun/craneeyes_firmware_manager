#!/bin/bash

# Update EC2_SSH_KEY GitHub Secret
# This script helps update the SSH key secret if there are connection issues

set -e

echo "════════════════════════════════════════"
echo "🔑 Update GitHub SSH Key Secret"
echo "════════════════════════════════════════"
echo ""

# Check if gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Install: brew install gh"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI is not authenticated"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is authenticated"
echo ""

# Read SSH key
SSH_KEY_FILE="${1:-./ec2-key.pem}"

if [ ! -f "$SSH_KEY_FILE" ]; then
    echo "❌ SSH key file not found: $SSH_KEY_FILE"
    echo ""
    echo "Usage: $0 [path-to-ssh-key.pem]"
    echo "Example: $0 ./my-ec2-key.pem"
    echo ""
    echo "Or save your SSH key to: ec2-key.pem"
    exit 1
fi

echo "📄 Using SSH key file: $SSH_KEY_FILE"
echo ""

# Verify SSH key format
echo "🔍 Verifying SSH key format..."
if ! ssh-keygen -l -f "$SSH_KEY_FILE" >/dev/null 2>&1; then
    echo "❌ Invalid SSH key format in $SSH_KEY_FILE"
    echo ""
    echo "The file should contain a valid private key starting with:"
    echo "  -----BEGIN RSA PRIVATE KEY-----"
    echo "  or"
    echo "  -----BEGIN OPENSSH PRIVATE KEY-----"
    exit 1
fi

echo "✅ SSH key format is valid"
echo ""

# Read the SSH key content
SSH_KEY_CONTENT=$(cat "$SSH_KEY_FILE")

# Set repository
REPO="viakisun/craneeyes_firmware_manager"

echo "🔄 Updating EC2_SSH_KEY secret in repository: $REPO"
echo ""

# Update the secret
if echo "$SSH_KEY_CONTENT" | gh secret set EC2_SSH_KEY --repo "$REPO"; then
    echo ""
    echo "✅ Successfully updated EC2_SSH_KEY secret"
    echo ""
    echo "════════════════════════════════════════"
    echo "Next Steps:"
    echo "════════════════════════════════════════"
    echo "1. Go to: https://github.com/$REPO/actions"
    echo "2. Re-run the failed deployment workflow"
    echo "   or"
    echo "3. Push a new commit to trigger deployment"
    echo ""
else
    echo ""
    echo "❌ Failed to update secret"
    exit 1
fi

