# Console Homepage - Architecture

## What Was Built

A fully modular, config-driven console/terminal homepage interface where all content is loaded at runtime from YAML config and Markdown files.

## Key Features

### 1. Modular Architecture
- **Config-driven**: All commands defined in `console.config.yaml`
- **Content separation**: Each section in its own markdown file (`content/`)
- **Runtime loading**: No hardcoded content in JavaScript
- **Easy maintenance**: Edit config or markdown, reload page

### 2. Simple to Extend
Adding a new command takes 3 steps:
1. Create `content/newcommand.md`
2. Add entry to `console.config.yaml`
3. Update `content/help.md`

No JavaScript knowledge required!

### 3. Powerful Markdown
- Front matter support (YAML metadata)
- Variable substitution (`{{variable}}`)
- Standard markdown syntax
- Two templates: `default` and `intro`

### 4. User-Friendly Console
- Slash commands: `/about`, `/publications`, etc.
- Command history (Up/Down arrows)
- Tab completion
- Deep linking: `#/about`
- Full-screen dark theme with high readability
- SPA (Single Page Application) - no page refreshes

## File Organization

```
homepage/
├── README.md                # Quick start guide
├── index.html               # Entry point
├── console.config.yaml      # Main config: commands, site info, links
├── deploy.sh                # Deployment script
├── manifest.json            # PWA manifest
│
├── content/                 # Markdown files (one per command)
│   ├── home.md
│   ├── about.md
│   ├── publications-selected.md
│   ├── publications-full.md
│   └── ... (13 files total)
│
├── docs/                    # Documentation (not served by console)
│   ├── README.md            # Comprehensive system documentation
│   ├── QUICKSTART.md        # Quick reference with examples
│   ├── ARCHITECTURE.md      # This file (system architecture)
│   └── DEPLOYMENT.md        # GitHub Pages deployment
│
├── scripts/
│   └── console.js           # Console engine (loads & renders)
├── styles/
│   └── console.css          # Full-screen dark theme styling
├── images/                  # Photos and assets
├── pdfs/                    # Research papers
└── favicons/                # Site icons
```

## How It Works

1. **Page loads** → `console.js` runs
2. **Fetch config** → Parse `console.config.yaml`
3. **Build command map** → Map aliases to commands
4. **User types command** → e.g., `/about`
5. **Fetch markdown** → Load `content/about.md`
6. **Parse content** → Extract front matter, convert markdown to HTML
7. **Apply template** → Render using `default` or `intro` template
8. **Display** → Show in console output area

## Configuration Format

### console.config.yaml

```yaml
site:
  name: "Your Name"
  handle: "user@host"
  title: "Display Name"

commands:
  - name: commandname
    aliases: ["alias1", "alias2"]
    title: "user@host:~ (title)"
    content: "content/file.md"
    template: "default"

links:
  - text: "github"
    url: "https://github.com/username"
```

### Markdown Files

```markdown
---
key: value
another_key: another value
---

## Heading

Content with {{key}} substitution.

[Link](url) and **bold** text.
```

## Benefits

1. **Easy to maintain**: Edit text files, not code
2. **No build step**: Changes reflected immediately on reload
3. **Git-friendly**: Plain text files, easy diffs
4. **Extensible**: Add new templates, commands, features
5. **Self-documenting**: Config file shows all available commands
6. **Portable**: All content in markdown, can migrate to any system

## Use Cases

- Personal homepage
- Portfolio site
- Documentation site
- Project showcase
- Resume/CV
- Blog index
- Any content that maps to "commands"

## Technical Stack

- **Vanilla JavaScript**: No frameworks
- **Built-in parsers**: Simple YAML and Markdown parsers
- **CSS custom properties**: Easy theming
- **Modern HTML5**: Semantic markup, accessibility
- **Zero dependencies**: Self-contained, no npm packages

## Next Steps

To customize your console:

1. Edit `console.config.yaml` (site name, commands)
2. Edit `content/*.md` files (your content)
3. Optional: Customize `styles/console.css` (colors, fonts)
4. Optional: Add new templates in `scripts/console.js`

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions or [README.md](README.md) for comprehensive documentation.
