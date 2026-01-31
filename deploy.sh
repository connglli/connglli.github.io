#!/bin/bash

# Deploy script for GitHub Pages
# This commits all changes and pushes to GitHub

set -e

echo "🚀 Deploying to GitHub Pages..."
echo ""

# Show current branch
BRANCH=$(git branch --show-current)
echo "Current branch: $BRANCH"
echo ""

# Show changes
echo "Changes to commit:"
git status --short
echo ""

# Confirm
read -p "Deploy these changes? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Commit message
echo ""
echo "Enter commit message (or press Enter for default):"
read -r COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update"
fi

# Add all changes
git add .

# Commit
git commit -m "$COMMIT_MSG"

# Push
git push origin "$BRANCH"

echo ""
echo "✅ Deployed successfully!"
echo ""
echo "🌐 Your site will be available at:"
echo "   https://connglli.github.io/"
echo ""
echo "⏱️ GitHub Pages may take 1-2 minutes to update"
echo ""
