# AGENTS.md

This file contains guidelines for AI coding agents operating in this repository.

## Project Overview

**Type**: Personal academic homepage with simulated terminal/console interface + optional AI chat  
**Language**: Vanilla JavaScript (ES6+), HTML5, CSS3  
**Build System**: None - runtime loading, no build step  
**Dependencies**: Zero npm packages (WebLLM loaded via CDN when AI enabled)

## Build/Lint/Test Commands

### No Build Step
This project has NO build, compilation, or transpilation. Edit source files and refresh the browser.

```bash
# View locally - MUST use web server (file:// won't work)
python3 -m http.server 8080
# Then open http://localhost:8080/index.html

# Push changes
./deploy.sh  # deployment script (stages, commits, pushes)

# There are no:
# - npm/yarn commands
# - test runners or test files
# - linting tools (eslint, prettier)
# - compilation steps
# - bundling processes
```

### Testing
**No test infrastructure exists.** Manual testing only:
1. Run `python3 -m http.server 8080` and open http://localhost:8080/index.html
2. Test slash commands: `/help`, `/about`, `/publications`, etc.
3. Test AI chat (if enabled): Type "hello" or other messages without `/`
4. Verify tab completion, command history (up/down arrows)
5. Check responsive design on mobile
6. Test deep linking with URL hash (e.g., `#/about`)
7. Verify SPA behavior (page should NOT refresh when running commands)
8. Test AI enable/disable toggle in `console.config.yaml`

## Code Style Guidelines

### JavaScript (`scripts/console.js`)

**Language Features:**
- Modern ES6+ syntax (no transpilation)
- Strict mode: `"use strict";` at top of files
- Async/await for asynchronous operations (no callbacks)
- Template literals for strings
- Destructuring assignments
- Arrow functions for callbacks/simple returns
- Regular functions for main logic

**Naming Conventions:**
- Functions: `camelCase` (`parseYAML`, `loadConfig`, `renderTemplate`)
- Variables: `camelCase` (`commandMap`, `output`, `config`)
- Constants: `camelCase` (not SCREAMING_SNAKE_CASE)
- DOM elements: `camelCase` (`input`, `form`, `title`)
- No underscore prefixes for private functions

**Variable Declarations:**
- Use `const` by default (immutable bindings)
- Use `let` for loop counters and mutable state
- **Never use `var`**

**Code Organization:**
- Group related functions into sections with headers:
  ```javascript
  // ============================================================================
  // Section Name
  // ============================================================================
  ```
- Order: utilities → parsers → renderers → application logic
- Keep functions focused and single-purpose

**Function Style:**
```javascript
// Pure utility functions (no side effects)
function nowIsoDate() {
  return new Date().toISOString().split('T')[0];
}

// Async/await for I/O
async function loadConfig() {
  const res = await fetch('console.config.yaml');
  const yaml = await res.text();
  return parseYAML(yaml);
}

// Object destructuring
const { name, args } = normalizeCommand(raw);
const { frontMatter, content } = parseFrontMatter(markdown);

// Template literals for HTML
return `<div class="intro">${html}</div>`;
```

**Error Handling:**
- Use graceful fallbacks for missing data
- Show user-friendly error messages in UI
- Avoid try-catch unless necessary for recovery
- Let fetch promises reject naturally

**Comments:**
- Section dividers with ASCII art (`===`)
- Minimal inline comments (prefer self-documenting code)
- Comments explain "why" not "what"
- No TODO comments (create issues instead)

**Imports/Dependencies:**
- No imports (single-file vanilla JS)
- No external libraries or frameworks
- All utilities are inline

### CSS (`styles/console.css`)

**Organization:**
- CSS custom properties (variables) in `:root`
- Logical grouping: reset → layout → components → responsive
- Mobile-first responsive design

**Naming Conventions:**
- Classes: `kebab-case` (`.inputbar`, `.intro-left`)
- Prefer single-word classes (`.shell`, `.wrap`, `.block`)
- Semantic names (`.titlebar`, `.output`, `.prompt`)
- BEM-like modifiers (`.line.muted`, `.line.error`)

**CSS Variables:**
```css
:root {
  --bg0: #f6f3ea;
  --ink: #0b1220;
  --mono: "IBM Plex Mono", "Menlo", monospace;
}
```

**Patterns:**
- Use CSS Grid and Flexbox (no floats)
- Custom properties for theming
- Minimal specificity (mostly single-class selectors)
- Media queries for responsive design
- Include `prefers-reduced-motion` for accessibility

### HTML (`index.html`)

**Structure:**
- Semantic HTML5 (`<main>`, `<header>`, `<form>`)
- Include ARIA attributes for accessibility
- Clean indentation (2 spaces)
- Minimal inline styles/attributes

**Accessibility:**
```html
<main class="shell" aria-label="Cong Li console">
<div id="output" aria-live="polite" aria-relevant="additions">
<div class="dots" aria-hidden="true">
```

### YAML (`console.config.yaml`)

**Format:**
- 2-space indentation
- Clear section comments
- Descriptive keys
- Array syntax: `["item1", "item2"]` or multi-line with `-`

### Markdown (`content/*.md`)

**Structure:**
- Optional YAML front matter at top
- Headers: `##` for title, `###` for subsections
- Horizontal rules: `---` (triple dash)
- Links: `[text](url)` with full URLs

**Front Matter:**
```markdown
---
photo: images/photo.jpg
email: user@example.com
links:
  - text: GitHub
    url: https://github.com/username
---

## Content starts here
```

**Variable Substitution:**
- Use `{{variableName}}` to reference front matter values
- Example: `Email: {{email}}`

## Project Architecture

### Core Principles
1. **No build step** - Edit and reload (no webpack, vite, etc.)
2. **Config-driven** - Everything in YAML/Markdown
3. **Modular** - Separate concerns (config, content, logic, style)
4. **Runtime loading** - Fetch content on-demand
5. **Zero dependencies** - Self-contained, no npm packages
6. **Vanilla JS** - No frameworks (React, Vue, etc.)

### File Structure
```
homepage/
├── README.md               # User guide (Publishing, Editing, Debugging)
├── AGENTS.md               # This file (AI agent guidelines)
├── index.html              # Static HTML shell (source file, no build)
├── console.config.yaml     # Main configuration
├── deploy.sh               # Deployment script
├── content/*.md            # Markdown content (13 files)
├── docs/                   # Documentation
├── scripts/console.js      # Console engine (~500 lines)
├── styles/console.css      # Terminal styling (~400 lines)
└── images/                 # Assets
```

### Key Components
- **Console Engine** (`console.js`): Command parser, renderer, history, tab completion
- **Config** (`console.config.yaml`): Command definitions, aliases, site metadata
- **Content** (`content/*.md`): Individual pages with optional front matter
- **Templates**: `default` (simple) and `intro` (with photo/links)

## Development Workflow

### Adding New Content
1. Create `content/newpage.md` with content
2. Add entry to `console.config.yaml` commands array
3. Update `content/help.md` with new command
4. Reload `index.html` in browser to test

### Modifying Existing Content
1. Edit markdown file in `content/` directory
2. Reload browser (no build step)

### Git Workflow
```bash
git add .
git commit -m "Descriptive message in imperative mood"
git push
```

**Commit Messages:**
- Imperative mood: "Add feature" not "Added feature"
- Descriptive: Explain what and why
- Examples: "Remove build step dependencies", "Add cleanup documentation"

**Before Committing:**
- Double check changes to remove all potential bugs
- Ask the author whether your changes and commit messages are appropriate
- Commit your changes once the author approves them

## Common Pitfalls

1. **Don't add build tools** - This project intentionally has no build step
2. **Don't install npm packages** - Keep it dependency-free
3. **Don't use frameworks** - Stay vanilla JS
4. **Don't create test files** - No testing infrastructure exists
5. **Don't add TypeScript** - Pure JavaScript project
6. **Don't modify index.html structure** - It's the stable shell
7. **Don't inline large data** - Use separate .md files

## Resources

- `docs/README.md` - Comprehensive system documentation
- `docs/QUICKSTART.md` - Quick reference with step-by-step examples
- `docs/ARCHITECTURE.md` - System architecture overview
- `docs/DEPLOYMENT.md` - GitHub Pages deployment guide

## When Making Changes

1. **Read existing documentation first** - Check guides before asking
2. **Follow existing patterns** - Match the current code style
3. **Test manually** - Open in browser and verify commands work
4. **Keep it simple** - Prefer simplicity over clever solutions
5. **Preserve modularity** - Config/content/logic/style separation
6. **No breaking changes** - Maintain backward compatibility
7. **Document if needed** - Update guides for significant changes

---

**Remember**: This is a minimalist, content-first project. The goal is easy maintenance by editing markdown files and YAML configuration, not complex build pipelines or frameworks.
