# Console Homepage Documentation

Complete documentation for the console-based homepage system.

## Overview

The Console Homepage is a **config-driven**, **modular** system that simulates a terminal interface for your personal homepage. All content is loaded at runtime from YAML configuration and Markdown files—no build step required.

### Key Characteristics

- **AI-powered chat** (optional): Conversational assistant using in-browser LLMs
- **Zero build tools**: Edit files, reload browser, see changes instantly
- **Config-driven**: All commands and AI settings defined in `console.config.yaml`
- **Content separation**: Each page is a separate markdown file
- **Runtime loading**: Content fetched on-demand, not hardcoded
- **Zero dependencies**: Pure vanilla JavaScript (AI uses WebLLM library)
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
├── console.config.yaml        # Main configuration (commands + AI settings)
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
│   ├── AI_CHAT.md             # AI chat feature documentation
│   ├── QUICKSTART.md          # Quick reference with examples
│   ├── ARCHITECTURE.md        # System architecture
│   ├── DEPLOYMENT.md          # GitHub Pages deployment
│   ├── MARKDOWN_PARSER.md     # Markdown syntax reference
│   ├── YAML_PARSER.md         # YAML configuration guide
│   └── KNOWLEDGE_BASE.md      # Knowledge base system (RAG-lite)
│
├── scripts/
│   ├── yaml-parser.js         # YAML parser (handles config & front matter)
│   ├── markdown-parser.js     # Markdown to HTML converter
│   ├── console.js             # Console engine (main application)
│   │                          # - Command handler
│   │                          # - Chat routing
│   │                          # - Tab completion
│   │                          # - Command history
│   │                          # - Template rendering
│   ├── chat.js                # AI chat orchestration
│   ├── llm-runner.js          # WebLLM wrapper
│   ├── personality.js         # Easter eggs & quick responses
│   ├── knowledge-base-v2.js   # RAG-lite knowledge base
│   └── webllm-loader.js       # WebLLM ES module loader
│
├── styles/
│   ├── console.css            # Visual styling (~400 lines)
│   │                          # - Full-screen dark theme
│   │                          # - Terminal appearance
│   │                          # - Responsive design
│   └── chat.css               # Chat-specific styling
│
├── images/                    # Photos and visual assets
├── pdfs/                      # Research papers, documents
└── favicons/                  # Site icons
```

### Components

#### 1. Console Engine (`scripts/console.js`)

**Responsibilities:**
- Handle command input (parsing, history, tab completion)
- Render content using templates
- Manage routing and deep linking
- Coordinate YAML and Markdown parsers

**Key Functions:**
- `normalizeCommand(input)` - Parse command and arguments
- `executeCommand(name, args)` - Fetch and render content
- `renderTemplate(template, data)` - Apply template to content

#### 1a. YAML Parser (`scripts/yaml-parser.js`)

**Responsibilities:**
- Parse YAML configuration files
- Extract front matter from markdown
- Convert YAML to JavaScript objects

**Documentation:** See [YAML_PARSER.md](YAML_PARSER.md)

**Key Functions:**
- `parseYAML(text)` - Parse YAML text to object
- `parseValue(value)` - Parse individual YAML values

#### 1b. Markdown Parser (`scripts/markdown-parser.js`)

**Responsibilities:**
- Convert markdown to HTML
- Support extended syntax (superscript, subscript, etc.)
- Handle front matter extraction

**Documentation:** See [MARKDOWN_PARSER.md](MARKDOWN_PARSER.md)

**Key Functions:**
- `parseMarkdown(text)` - Convert markdown to HTML
- `parseFrontMatter(markdown)` - Extract YAML front matter

**Supported Markdown Features:**
- Headers (`#`, `##`, `###`)
- Text formatting (bold, italic, strikethrough, shadow, highlight)
- Superscript (`^text^`) and subscript (`~text~`)
- Links and images (with attribute support)
- Lists (regular and task lists)
- Tables (with column alignment)
- Code/keyboard shortcuts
- Horizontal rules

#### 2. Configuration (`console.config.yaml`)

**Structure:**
```yaml
site:
  name: "Your Name"
  handle: "user@host"
  title: "Display Name"
  tagline: "Your Title"

ai:
  # Enable/disable AI chat (true/false)
  enabled: true
  # AI assistant name
  name: "Pico"
  # Model selection
  model: "Qwen3-1.7B-q4f16_1-MLC"
  # Temperature (0.0-2.0)
  temperature: 0.8
  # Max tokens per response
  max_tokens: 4096

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

- **AI Chat** (optional): Conversational assistant with personality and easter eggs
- **Slash commands**: `/about`, `/publications`, `/help`, etc.
- **Command aliases**: Multiple names for same command (e.g., `/pub` → `/publications`)
- **Tab completion**: Press Tab to autocomplete commands
- **Command history**: Up/Down arrows to navigate previous commands
- **Deep linking**: Direct URLs like `yoursite.com/#/about`
- **Clear screen**: `/clear` or `/cls` to clear output
- **Responsive**: Works on desktop and mobile
- **Accessibility**: ARIA labels, semantic HTML

### Developer Features

- **AI integration**: Optional in-browser LLM with configurable models
- **No build step**: Edit → Reload → See changes
- **Config-driven**: Add commands without touching JavaScript
- **Markdown support**: Standard syntax plus front matter
- **Variable substitution**: Dynamic content from front matter
- **Extensible**: Add new templates, modify styling
- **Git-friendly**: Plain text files, easy diffs
- **Zero dependencies**: Self-contained, portable (AI uses WebLLM)

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

**AI properties:**
- `enabled` - Enable/disable AI chat (true/false)
- `name` - AI assistant name (e.g., "Pico", "HAL")
- `model` - Model selection (see [AI_CHAT.md](AI_CHAT.md) for options)
- `temperature` - Creativity level (0.0-2.0)
- `max_tokens` - Response length limit

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

- **[AI_CHAT.md](AI_CHAT.md)** - AI chat feature documentation (models, setup, troubleshooting)
- **[KNOWLEDGE_BASE.md](KNOWLEDGE_BASE.md)** - Knowledge base system for context-aware responses
- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference with step-by-step examples
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - GitHub Pages deployment guide
- **[MARKDOWN_PARSER.md](MARKDOWN_PARSER.md)** - Markdown syntax and features reference
- **[YAML_PARSER.md](YAML_PARSER.md)** - YAML configuration guide
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
- **AI**: WebLLM for in-browser inference (optional)
- **Markdown**: Custom parser with extended syntax support
  - Superscript/subscript, strikethrough, highlight
  - Task lists, front matter
  - See [MARKDOWN_PARSER.md](MARKDOWN_PARSER.md)
- **YAML**: Custom parser for simple subset
  - Configuration files, front matter
  - See [YAML_PARSER.md](YAML_PARSER.md)
- **Build tools**: None
- **Dependencies**: Zero (WebLLM loaded via CDN when AI enabled)

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

## Hidden Commands

For site owner/admin use, there are hidden commands not shown in `/help`:

- **`/goldfinger:enableai`** - Enable AI at runtime (bypasses `ai.enabled: false` config, session-only)

See [ARCHITECTURE.md](ARCHITECTURE.md) for complete documentation. These commands are intentionally hidden to maintain a clean user interface while giving the site owner special capabilities.

## License

This system is designed for personal use. Adapt and modify as needed for your own homepage.

---

**Remember**: No build step means immediate feedback. Edit, reload, see results. Keep it simple!
