# My Homepage

My personal homepage with a terminal/console interface. Features include:
- **AI Chat**: Conversational AI assistant powered by in-browser LLM (configurable/optional)
- **Slash commands**: `/about`, `/publications`, `/help`, etc.
- **Tab completion** and command history (Up/Down arrows)
- **Deep linking**: `yoursite.com/#/about`
- **Full-screen dark terminal theme**
- **No build step**: edit and reload to see changes
- **Zero dependencies**: pure vanilla JavaScript (AI is optional)

## Quick Start

```bash
# Local development (must use web server, not file://)
python3 -m http.server 8080

# Open http://localhost:8080/index.html in browser

# Deploy to GitHub Pages
./deploy.sh
```

## Editing Content

**To add a new command (e.g., `/blog`):**

1. Create `content/blog.md` with your markdown content
2. Add command to `console.config.yaml`:
   ```yaml
   - name: blog
     aliases: ["posts"]
     title: "user@host:~ (blog)"
     content: "content/blog.md"
     template: "default"
   ```
3. Update `content/help.md` to list the new command
4. Reload browser to test

**To update existing content:** Just edit the markdown files in `content/` and reload.

See [docs/quick_start.md](docs/quick_start.md) for detailed guide with examples.

## Key Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `content/*.md` | Your actual content | Frequently |
| `console.config.yaml` | Command definitions, site info, **AI settings** | Occasionally |
| `styles/console.css` | Visual styling | Rarely |
| `scripts/console.js` | Console engine | Rarely |
| `index.html` | HTML shell | Almost never |

## Common Tasks

**Enable/disable AI chat:**
Edit `ai.enabled: true/false` in `console.config.yaml`

**Change AI model or settings:**
Edit the `ai:` section in `console.config.yaml` (see [docs/ai_chat.md](docs/ai_chat.md))

**Change site name/title:**
Edit the `site:` section in `console.config.yaml`

**Add a navigation link:**
Edit the `links:` section in `console.config.yaml`

**Change colors/fonts:**
Edit CSS variables in `styles/console.css` (`:root` section)

**Update publications or open-source tools:**
Edit `content/publications.md` or `content/opensource.md`, then also update the SEO sections in `index.html`:
1. The `<noscript>` static HTML fallback (so crawlers without JS can index your content)
2. The JSON-LD `ScholarlyArticle` structured data
3. The JSON-LD `SoftwareSourceCode` structured data

**Debug issues:**
- Check browser console (F12) for errors
- Verify `console.config.yaml` syntax (2-space indentation)
- Ensure content file paths are correct
- Clear browser cache and hard reload (Ctrl+Shift+R)

## Documentation

- **[docs/index.md](docs/index.md)** - Documentation index and system overview
- **[docs/ai_chat.md](docs/ai_chat.md)** - AI chat feature guide (models, configuration, troubleshooting)
- **[docs/quick_start.md](docs/quick_start.md)** - Adding commands with examples
- **[docs/architecture.md](docs/architecture.md)** - Architecture overview
- **[docs/deployment.md](docs/deployment.md)** - GitHub Pages setup guide
- **[AGENTS.md](AGENTS.md)** - Guidelines for AI coding agents
