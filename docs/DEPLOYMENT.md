# GitHub Pages Deployment Guide

Instructions for deploying the static console homepage to GitHub Pages.

## Overview

The application consists of 100% client-side HTML, CSS, and JavaScript. It runs directly on static host platforms like GitHub Pages without backend requirements.

> **Note**: Local development requires an HTTP server (e.g., `python3 -m http.server 8080`) to satisfy browser CORS policies for `fetch()` calls.

## Deployment Methods

### Option 1: Deploy Script (Recommended)

```bash
./deploy.sh
```
The script stages changed files, prompts for commit approval, pushes to GitHub, and displays the published site URL.

### Option 2: Manual Deployment

```bash
git add .
git commit -m "Update homepage content"
git push origin console
```

## GitHub Pages Configuration

Ensure repository settings are configured:
1. Navigate to: `https://github.com/<username>/<repo>/settings/pages`
2. **Build and deployment**:
   - **Source**: Deploy from a branch
   - **Branch**: `console` (or main branch) / Folder: `/ (root)`
3. Save settings.

## Troubleshooting

- **404 on Content Files**: Verify paths in `console.config.yaml` relative to root directory.
- **Page Refresh on Command**: Ensure slash commands utilize hash routing (`#/command`) and event handlers prevent default form submission.
- **Stale Content**: Perform a hard refresh (`Cmd+Shift+R` or `Ctrl+Shift+R`) to clear browser cache.
