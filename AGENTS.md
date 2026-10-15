# AGENTS.md

Guidelines for AI coding agents working in this repository. The system documentation lives under [docs/](docs/index.md), and [docs/AGENTS.md](docs/AGENTS.md) is the writing standard for documentation, code comments, and commit messages; follow it whenever you write prose.

## Project overview

A personal academic homepage that renders as a terminal. Vanilla JavaScript (ES6+), HTML5, and CSS3, with no build step. Content is fetched at runtime from `console.config.yaml` and Markdown files under `content/`. An optional AI chat runs a WebLLM model in the browser; the only declared npm package, `@mlc-ai/web-llm`, is loaded from a CDN by `scripts/webllm-loader.js` rather than from `node_modules`.

Design, module map, and execution flows: [docs/architecture.md](docs/architecture.md).

## Commands

No build, compilation, bundling, linting, or test tooling exists. Edit a source file and reload the browser.

```bash
# View locally. fetch() requires HTTP, so file:// URLs do not work.
python3 -m http.server 8080
# Open http://localhost:8080/index.html

# Deploy: prints changed files, asks for confirmation, commits, pushes.
./deploy.sh
```

## Manual testing

1. Run the local server and open http://localhost:8080/index.html.
2. Run slash commands (`/help`, `/about` as a home alias, `/publications`) and confirm the page does not refresh.
3. Test tab completion and command history with Up/Down.
4. Open a deep link such as http://localhost:8080/#/about and confirm it renders without a page refresh.
5. Toggle `/theme` and `/fullscreen`.
6. With AI enabled, send a greeting (instant response) and a research question (model response).
7. With AI disabled, confirm freeform input returns the unknown-command message and a `/help` hint.
8. Check the responsive layout at a narrow viewport.
9. Check the browser console for errors after each change.

## Code style

### JavaScript (`scripts/*.js`)

Language features:
* Modern ES6+ syntax, no transpilation; `"use strict";` at the top of every file.
* `async`/`await` for asynchronous work; no callbacks.
* Template literals, destructuring, and arrow functions for callbacks and simple returns; regular functions for main logic.

Naming:
* Functions and variables in `camelCase` (`parseYAML`, `commandMap`).
* Constants in `camelCase`, not `SCREAMING_SNAKE_CASE`.
* DOM elements in `camelCase` (`input`, `form`, `title`).
* No underscore prefixes for private functions.

Declarations:
* `const` by default, `let` for loop counters and mutable state, never `var`.

Organization:
* Group related functions under section dividers:

  ```javascript
  // ============================================================================
  // Section name
  // ============================================================================
  ```

* Order sections utilities, parsers, renderers, application logic, and keep functions focused and single-purpose.

Style:
* Pure utility functions have no side effects.
* Fetch content with `async`/`await` and let rejected promises propagate; add `try`/`catch` only when recovery is possible.
* Comments explain why, not what.
* No imports; every utility is inline in its file.

### CSS (`styles/*.css`)

* Custom properties in `:root`; organize as reset, layout, components, responsive.
* `kebab-case` classes, semantic single words where possible (`.shell`, `.titlebar`, `.line.muted`).
* Grid and Flexbox for layout, no floats.
* Mostly single-class selectors, media queries for responsive behavior, `prefers-reduced-motion` respected.

### HTML (`index.html`)

* Semantic HTML5 (`main`, `header`, `form`), 2-space indentation, minimal inline styles.
* ARIA attributes for accessibility, such as `aria-live="polite"` on the output region.
* Do not restructure `index.html`; it is the stable shell.

### YAML (`console.config.yaml`)

* 2-space indentation and section comments.
* Arrays inline (`["item1", "item2"]`) or as `-` lists.
* Keep the `ai.model` option comments in sync with `getModelInfo()` in `scripts/llm-runner.js`.

### Markdown and prose

Writing rules for `content/`, `docs/`, code comments, and commit messages: [docs/AGENTS.md](docs/AGENTS.md). For content pages specifically, front matter, templates, and variable substitution are in [docs/quick_start.md](docs/quick_start.md).

## Git workflow

```bash
git add .
git commit -m "Descriptive message in imperative mood"
git push
```

Before committing:
* Verify the change in the browser (see Manual testing) and check it for potential bugs.
* Ask the author whether the changes and the commit message are appropriate.
* Commit only after the author approves.

Commit message style: [docs/AGENTS.md](docs/AGENTS.md).

## Common pitfalls

* Do not add build tools; the project has no build step on purpose.
* Do not add npm packages; the runtime stays dependency-free (see the overview for the one declared package).
* Do not introduce frameworks; stay vanilla JS.
* Do not create test files; there is no test infrastructure.
* Do not add TypeScript; this is a pure JavaScript project.
* Do not restructure `index.html`; it is the stable shell.
* Do not inline large data structures; use `content/*.md`.

## Documentation

* [docs/index.md](docs/index.md): the documentation index and system overview.
* [docs/AGENTS.md](docs/AGENTS.md): the writing standard for documents, comments, and commit messages.

## When making changes

1. Read the existing documentation first, starting at [docs/index.md](docs/index.md), and this file for engineering rules.
2. Follow the existing code style and patterns.
3. Test manually in the browser.
4. Keep it simple; prefer clarity over clever solutions.
5. Preserve the config/content/logic/style separation.
6. Keep changes backward compatible.
7. When you write or update documentation, follow [docs/AGENTS.md](docs/AGENTS.md).

---

This is a minimalist, content-first project: keep it easy to maintain by editing Markdown files and YAML configuration.
