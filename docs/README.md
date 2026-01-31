# Console Homepage Documentation

Complete documentation for the console-based homepage system.

## Overview

The Console Homepage is a **config-driven**, **modular** system that simulates a terminal interface for your personal homepage. All content is loaded at runtime from YAML configuration and Markdown files—no build step required.

### Key Characteristics

- **Zero build tools**: Edit files, reload browser, see changes instantly
- **Config-driven**: All commands defined in `console.config.yaml`
- **Content separation**: Each page is a separate markdown file
- **Runtime loading**: Content fetched on-demand, not hardcoded
- **Zero dependencies**: Pure vanilla JavaScript, no npm packages
- **SPA behavior**: Navigation without page refreshes

## How It Works

1. User opens `index.html` → Console engine (`console.js`) initializes
2. Engine fetches `console.config.yaml` → Parses commands, site metadata, links
3. Engine builds command map → Maps command names and aliases to content files
4. User types `/about` → Engine looks up command in map
5. Engine fetches `content/about.md` → Parses front matter and markdown
6. Engine renders content → Applies template, substitutes variables, displays output
7. User navigates → Deep linking via URL hash (e.g., `#/publications`)

## Architecture

### Core Principles

1. **No build step** - Edit source files directly, no compilation
2. **Config-driven** - Everything defined in YAML/Markdown, not code
3. **Modular** - Separate concerns: config, content, logic, styling
4. **Runtime loading** - Fetch content on-demand as needed
5. **Zero dependencies** - Self-contained, no external libraries
6. **Vanilla JS** - No frameworks (React, Vue, etc.)

### File Structure

```
homepage/
├── README.md                  # User guide (Publishing, Editing, Debugging)
├── AGENTS.md                  # AI coding agent guidelines
├── index.html                 # Entry point (stable HTML shell)
├── console.config.yaml        # Main configuration
├── deploy.sh                  # Deployment script
├── manifest.json              # PWA manifest
│
├── content/                   # Markdown content (13 files)
│   ├── home.md                # Homepage (intro template)
│   ├── about.md               # About/bio
│   ├── publications-selected.md
│   ├── publications-full.md
│   ├── opensource.md
│   ├── education.md
│   ├── experience.md
│   ├── honors.md
│   ├── services.md
│   ├── teaching.md
│   ├── hobbies.md
│   ├── contact.md
│   └── help.md                # Help/command list
│
├── docs/                      # Documentation
│   ├── README.md              # This file
│   ├── QUICKSTART.md          # Quick reference with examples
│   ├── ARCHITECTURE.md        # System architecture
│   └── DEPLOYMENT.md          # GitHub Pages deployment
│
├── scripts/
│   └── console.js             # Console engine (~500 lines)
│                              # - YAML parser
│                              # - Markdown parser
│                              # - Command handler
│                              # - Tab completion
│                              # - Command history
│
├── styles/
│   └── console.css            # Visual styling (~400 lines)
│                              # - Full-screen dark theme
│                              # - Terminal appearance
│                              # - Responsive design
│
├── images/                    # Photos and visual assets
├── pdfs/                      # Research papers, documents
└── favicons/                  # Site icons
```

### Components

#### 1. Console Engine (`scripts/console.js`)

**Responsibilities:**
- Parse YAML configuration
- Parse Markdown with front matter
- Handle command input (parsing, history, tab completion)
- Render content using templates
- Manage routing and deep linking

**Key Functions:**
- `parseYAML(text)` - Custom YAML parser
- `parseFrontMatter(markdown)` - Extract YAML front matter
- `markdownToHTML(markdown)` - Convert markdown to HTML
- `normalizeCommand(input)` - Parse command and arguments
- `executeCommand(name, args)` - Fetch and render content
- `renderTemplate(template, data)` - Apply template to content

#### 2. Configuration (`console.config.yaml`)

**Structure:**
```yaml
site:
  name: "Your Name"
  handle: "user@host"
  title: "Display Name"
  tagline: "Your Title"

commands:
  - name: commandname
    aliases: ["alias1", "alias2"]
    title: "user@host:~ (title)"
    content: "content/file.md"
    template: "default"  # or "intro"

builtins:
  - clear
  - cls

links:
  - text: "github"
    url: "https://github.com/username"
    target: "_blank"
```

#### 3. Content Files (`content/*.md`)

**Format:**
```markdown
---
photo: images/photo.jpg
key: value
---

## Heading

Content with **markdown** and {{key}} substitution.

- List item 1
- List item 2

[Link](#/othercommand)
```

**Front Matter** (optional YAML metadata):
- Key-value pairs at the top of the file
- Delimited by `---`
- Available for variable substitution in content

**Variable Substitution**:
- Use `{{key}}` in content to reference front matter values
- Example: `Email: {{email}}` → `Email: user@example.com`

#### 4. Templates

**Two built-in templates:**

1. **`default`** - Simple content display
   ```html
   <div class="wrap">
     [rendered markdown content]
   </div>
   ```

2. **`intro`** - Homepage with photo and links
   ```html
   <div class="intro">
     <div class="intro-left">
       <img src="{{photo}}" />
       [links from front matter]
     </div>
     <div class="intro-right">
       [rendered markdown content]
     </div>
   </div>
   ```

## Features

### User Features

- **Slash commands**: `/about`, `/publications`, `/help`, etc.
- **Command aliases**: Multiple names for same command (e.g., `/pub` → `/publications`)
- **Tab completion**: Press Tab to autocomplete commands
- **Command history**: Up/Down arrows to navigate previous commands
- **Deep linking**: Direct URLs like `yoursite.com/#/about`
- **Clear screen**: `/clear` or `/cls` to clear output
- **Responsive**: Works on desktop and mobile
- **Accessibility**: ARIA labels, semantic HTML

### Developer Features

- **No build step**: Edit → Reload → See changes
- **Config-driven**: Add commands without touching JavaScript
- **Markdown support**: Standard syntax plus front matter
- **Variable substitution**: Dynamic content from front matter
- **Extensible**: Add new templates, modify styling
- **Git-friendly**: Plain text files, easy diffs
- **Zero dependencies**: Self-contained, portable

## Configuration Guide

### Adding a Command

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

**Quick version:**
1. Create `content/mycommand.md`
2. Add entry to `console.config.yaml`:
   ```yaml
   - name: mycommand
     aliases: ["mc"]
     title: "user@host:~ (my command)"
     content: "content/mycommand.md"
     template: "default"
   ```
3. Update `content/help.md` with new command
4. Reload and type `/mycommand`

### Configuration Options

**Command properties:**
- `name` (required) - Primary command name
- `aliases` (optional) - Array of alternative names
- `title` (required) - Displayed in terminal title bar
- `content` (required) - Path to markdown file
- `template` (required) - Template to use (`default` or `intro`)

**Site properties:**
- `name` - Your name
- `handle` - Terminal prompt (e.g., "user@host")
- `title` - Page title
- `tagline` - Subtitle/description

**Links:**
- Displayed in top-right corner
- Each link has `text`, `url`, and optional `target`

## Customization

### Styling

Edit `styles/console.css`:

**CSS Variables** (in `:root`):
```css
--bg0: #0a0e14;        /* Background color */
--term: rgba(...);     /* Text color */
--link: #4fd1c5;       /* Link color */
--accent: #2cc484;     /* Accent color (bullets, etc.) */
--mono: "IBM Plex Mono", monospace;  /* Font */
```

**Key sections:**
- Color scheme (lines 1-30)
- Layout (lines 50-100)
- Terminal appearance (lines 100-200)
- Responsive design (lines 300+)

### Adding Templates

Edit `scripts/console.js`, find `renderTemplate()` function:

```javascript
function renderTemplate(template, data) {
  if (template === "mytemplate") {
    return `<div class="mytemplate">${data.html}</div>`;
  }
  // ... existing templates
}
```

Add corresponding CSS in `styles/console.css`.

## Documentation Files

- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference with step-by-step examples
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - GitHub Pages deployment guide
- **[../AGENTS.md](../AGENTS.md)** - AI coding agent guidelines

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete GitHub Pages setup.

**Quick deploy:**
```bash
./deploy.sh
```

## Use Cases

This system works well for:
- Personal homepages
- Academic/research profiles
- Portfolio sites
- Resume/CV sites
- Documentation sites
- Project showcases
- Blog indexes
- Any content organized as "commands"

## Technical Stack

- **JavaScript**: Vanilla ES6+ (no frameworks, no transpilation)
- **HTML5**: Semantic markup, ARIA accessibility
- **CSS3**: Custom properties, Grid, Flexbox
- **Markdown**: Built-in parser (front matter support)
- **YAML**: Built-in parser (simple subset)
- **Build tools**: None
- **Dependencies**: Zero (npm-free)

## Design Philosophy

1. **Simplicity**: Prefer simple solutions over complex ones
2. **Modularity**: Separate config, content, logic, styling
3. **No magic**: Explicit configuration, predictable behavior
4. **Git-friendly**: Plain text, meaningful diffs
5. **Maintainable**: Easy to understand and modify
6. **Portable**: No vendor lock-in, can migrate content anywhere

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **JavaScript**: ES6+ required (async/await, template literals, arrow functions)
- **CSS**: Grid and Flexbox required
- **No polyfills**: Uses native browser features

## Performance

- **Initial load**: Fast (~100KB total, no dependencies)
- **Content loading**: On-demand (only fetch what's needed)
- **Caching**: Browser caches all static assets
- **No build**: No compile time, instant deployment

## Limitations

1. **Not a blog platform**: No date-based organization or RSS
2. **Static content**: No server-side rendering or databases
3. **Limited SEO**: Single-page app, content loaded dynamically
4. **No search**: No built-in content search (can add manually)
5. **Manual testing**: No automated test suite

## Future Enhancements

Possible improvements (not currently implemented):
- Additional templates (grid, timeline, etc.)
- Theme switcher (light/dark mode)
- Command chaining (e.g., `/publications | grep 2024`)
- Keyboard shortcuts (beyond Tab/Up/Down)
- Content search functionality
- Animation effects
- PWA features (offline support)

## Getting Help

1. **Read documentation**: Start with [QUICKSTART.md](QUICKSTART.md)
2. **Check architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Debug issues**: Check browser console (F12) for errors
4. **AI agents**: See [../AGENTS.md](../AGENTS.md) for coding guidelines

## License

This system is designed for personal use. Adapt and modify as needed for your own homepage.

---

**Remember**: No build step means immediate feedback. Edit, reload, see results. Keep it simple!
