# GitHub Pages Deployment Guide

Your console homepage is **100% static** and works perfectly on GitHub Pages!

## Understanding "Static"

Your homepage is static because:
- ✅ No server-side code (PHP, Node.js, Python, etc.)
- ✅ No database
- ✅ Just HTML, CSS, JavaScript files
- ✅ All content loading happens in the browser via JavaScript `fetch()`

GitHub Pages serves static files, which is exactly what you have!

## Why Local Server is Needed for Development

**Local file system** (`file:///path/to/index.html`):
- Browser security blocks `fetch()` calls (CORS policy)
- Your console can't load config/content files

**Local web server** (`http://localhost:8080`):
- No CORS restrictions for same-origin requests
- Everything works normally

**GitHub Pages** (`https://connglli.github.io`):
- No CORS restrictions (same origin)
- ✅ Works perfectly - no changes needed!

## Deployment Steps

### Option 1: Using the Deploy Script (Recommended)

```bash
cd /local/home/congli/Desktop/homepage
./deploy.sh
```

The script will:
1. Show you what changes will be committed
2. Ask for confirmation
3. Commit and push to GitHub
4. Show you the URL where your site will be live

### Option 2: Manual Deployment

```bash
cd /local/home/congli/Desktop/homepage

# Check what changed
git status

# Add all changes
git add .

# Commit with a message
git commit -m "Fix YAML parser and SPA behavior"

# Push to GitHub
git push origin console
```

## After Deployment

1. **Wait 1-2 minutes** for GitHub Pages to rebuild
2. **Visit**: https://connglli.github.io/
3. **Test**: Type `/about` and press Enter
4. **Verify**: Page should NOT refresh (SPA behavior)

## GitHub Pages Settings

Make sure your repository settings are correct:

1. Go to: https://github.com/connglli/connglli.github.io/settings/pages
2. Set **Source** to:
   - Branch: `console` (your current working branch)
   - Folder: `/ (root)`
3. Click **Save**

## Current Files to Deploy

Key files in the repository:

```
Core Files:
  - index.html           # Entry point with full-screen console
  - console.config.yaml  # Command definitions
  - scripts/console.js   # Console engine with YAML parser
  - styles/console.css   # Full-screen dark theme
  - deploy.sh            # Deployment script
  - README.md            # Quick start guide

Content:
  - content/*.md         # All page content (13 files)
  
Documentation (optional):
  - docs/                # Developer documentation (8 files)
  
Assets:
  - images/              # Photos
  - pdfs/                # Research papers  
  - favicons/            # Site icons
```

## What Gets Deployed

All files in your repository are served by GitHub Pages:

**Accessed by Console:**
- `index.html` - Entry point
- `console.config.yaml` - Command definitions
- `scripts/console.js` - Console engine
- `styles/console.css` - Full-screen dark theme styling
- `content/*.md` - All your content pages
- `images/` - Photos and assets
- `pdfs/` - Research papers
- `favicons/` - Site icons

**Not Accessed by Console (but available):**
- `docs/` - Documentation for developers
- `README.md` - Project overview
- `deploy.sh` - Deployment helper

Everything loads from the same domain: `https://connglli.github.io/`

## Troubleshooting

### If your site doesn't load after deployment:

1. Check GitHub Pages settings (see above)
2. Wait 2-3 minutes for GitHub to rebuild
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for errors (F12)

### If content doesn't load:

1. Open browser console (F12)
2. Check for 404 errors (missing files)
3. Verify file paths in `console.config.yaml` are correct
4. Make sure all content files are committed and pushed

## Your Repository

- **Repository**: https://github.com/connglli/connglli.github.io
- **Current branch**: `console`
- **Live URL**: https://connglli.github.io/

---

## Summary

✅ Your homepage IS static - it will work on GitHub Pages  
✅ No changes needed for deployment  
✅ Local server is only for development/testing  
✅ GitHub Pages serves files just like a web server  
✅ All JavaScript/fetch operations work normally  

**Ready to deploy?** Run `./deploy.sh`
