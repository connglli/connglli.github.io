# Console Homepage - Architecture

## What Was Built

A fully modular, config-driven console/terminal homepage interface with optional AI chat functionality. All content is loaded at runtime from YAML config and Markdown files.

## Key Features

### 1. Modular Architecture
- **Config-driven**: All commands and AI settings defined in `console.config.yaml`
- **Content separation**: Each section in its own markdown file (`content/`)
- **Runtime loading**: No hardcoded content in JavaScript
- **Easy maintenance**: Edit config or markdown, reload page

### 2. AI Chat Integration (Optional)
- **Configurable**: Enable/disable via `ai.enabled` in config
- **In-browser LLM**: Powered by WebLLM, no server required
- **Multiple models**: Choose from Qwen, SmolLM, or Gemma
- **Context-aware**: Knowledge base and current page context injection
- **Personality**: Easter eggs, quick responses, hacker-vibe

### 3. Simple to Extend
Adding a new command takes 3 steps:
1. Create `content/newcommand.md`
2. Add entry to `console.config.yaml`
3. Update `content/help.md`

No JavaScript knowledge required!

### 4. Powerful Markdown
- Front matter support (YAML metadata)
- Variable substitution (`{{variable}}`)
- Standard markdown syntax
- Two templates: `default` and `intro`

### 5. User-Friendly Console
- **AI Chat**: Conversational interface (optional)
- **Slash commands**: `/about`, `/publications`, etc.
- **Command history** (Up/Down arrows)
- **Tab completion**
- **Deep linking**: `#/about`
- **Full-screen dark theme** with high readability
- **SPA** (Single Page Application) - no page refreshes

## File Organization

```
homepage/
├── README.md                # Quick start guide
├── index.html               # Entry point
├── console.config.yaml      # Main config: commands, site info, AI settings
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
│   ├── AI_CHAT.md           # AI chat feature documentation
│   ├── QUICKSTART.md        # Quick reference with examples
│   ├── ARCHITECTURE.md      # This file (system architecture)
│   └── DEPLOYMENT.md        # GitHub Pages deployment
│
├── scripts/
│   ├── console.js           # Console engine (loads & renders + chat routing)
│   ├── chat.js              # AI chat orchestration
│   ├── llm-runner.js        # WebLLM wrapper
│   ├── personality.js       # Easter eggs & quick responses
│   ├── knowledge-base-v2.js # RAG-lite knowledge base
│   └── webllm-loader.js     # WebLLM ES module loader
├── styles/
│   ├── console.css          # Full-screen dark theme styling
│   └── chat.css             # Chat-specific styling
├── images/                  # Photos and assets
├── pdfs/                    # Research papers
└── favicons/                # Site icons
```

## How It Works

### Standard Command Flow

1. **Page loads** → `console.js` runs
2. **Fetch config** → Parse `console.config.yaml`
3. **Build command map** → Map aliases to commands
4. **Initialize AI** (if enabled) → Load WebLLM and knowledge base
5. **User types command** → e.g., `/about`
6. **Fetch markdown** → Load `content/about.md`
7. **Parse content** → Extract front matter, convert markdown to HTML
8. **Apply template** → Render using `default` or `intro` template
9. **Display** → Show in console output area

### AI Chat Flow (When Enabled)

1. **User types message** (without `/`) → e.g., "hello"
2. **Check for instant responses** → Easter eggs, quick responses
3. **If model not loaded** → Ask for consent, load model in background
4. **Build system prompt** → Include personality, page context, knowledge base
5. **Generate response** → Stream from WebLLM
6. **Display** → Show in chat format with thinking tags support

## Configuration Format

### console.config.yaml

```yaml
site:
  name: "Your Name"
  handle: "user@host"
  title: "Display Name"

ai:
  enabled: true                      # Enable/disable AI chat
  name: "Pico"                       # AI assistant name
  model: "Qwen3-1.7B-q4f16_1-MLC"   # Model selection
  temperature: 0.8                   # Creativity (0.0-2.0)
  max_tokens: 4096                   # Response length

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
2. **Optional AI**: Enable powerful chat without complexity
3. **No build step**: Changes reflected immediately on reload
4. **Git-friendly**: Plain text files, easy diffs
5. **Extensible**: Add new templates, commands, features
6. **Self-documenting**: Config file shows all available commands
7. **Portable**: All content in markdown, can migrate to any system
8. **Privacy-first**: AI runs in-browser, no data sent to servers

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
- **AI Integration**: WebLLM for in-browser LLM inference (optional)
- **CSS custom properties**: Easy theming
- **Modern HTML5**: Semantic markup, accessibility
- **Zero npm dependencies**: Self-contained (WebLLM loaded via CDN)

## Next Steps

To customize your console:

1. **Enable/disable AI**: Set `ai.enabled: true/false` in `console.config.yaml`
2. **Configure AI model**: Choose from Qwen, SmolLM, or Gemma (see [AI_CHAT.md](AI_CHAT.md))
3. **Edit site info**: Update `site:` section in `console.config.yaml`
4. **Edit content**: Modify `content/*.md` files
5. **Optional**: Customize `styles/console.css` (colors, fonts)
6. **Optional**: Add new templates in `scripts/console.js`

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions or [README.md](README.md) for comprehensive documentation.

---

## Hidden Commands (Goldfinger)

For site owner/admin use, there are hidden commands not shown in `/help` or user-facing documentation:

### `/goldfinger:enableai`

**Purpose**: Enable AI at runtime, bypassing config setting  
**Behavior**:
- When AI is **already enabled** (`ai.enabled: true` or already activated): Shows status message with current model
- When AI is **disabled** (`ai.enabled: false`): Immediately initializes and activates AI for current session

**Key Features**:
- ✅ **Runtime override**: Bypasses `ai.enabled: false` in config
- ✅ **Session-only**: AI stays active until page refresh
- ✅ **No file modification**: Config file remains unchanged
- ✅ **Hidden**: Not listed in `/help` or user-facing docs
- ✅ **Owner access**: Allows site owner to use AI while keeping it disabled for visitors

**Use Case**: 
You maintain `ai.enabled: false` in production so regular visitors only see slash commands. When you visit your own site and want to test/use AI, type `/goldfinger:enableai` to activate it for your session without modifying the config file.

**Implementation Details**:
- Located in `scripts/console.js` → `runCommand()` function
- Calls `initializeAI()` function which sets up WebLLM runner
- Sets `aiEnabled = true` flag
- Model loads on first chat message (lazy loading)

**Security Note**: This is client-side only - any visitor who discovers the command can use it. For true access control, implement server-side authentication.
