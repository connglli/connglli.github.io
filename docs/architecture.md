# Console homepage architecture

The design behind the console homepage: constraints, layout, module responsibilities, and the two execution flows.

## Principles

1. Zero build pipeline: vanilla JavaScript (ES6+), HTML5, and CSS3 run directly in the browser.
2. Config-driven: commands, site metadata, and AI settings live in [console.config.yaml](../console.config.yaml).
3. Decoupled content: pages are Markdown files under `content/`, loaded on demand.
4. Local execution: the optional AI chat runs a WebLLM model through WebGPU in the browser.

## Repository layout

```text
.
├── index.html              HTML shell: loads styles and scripts; holds the static fallback and SEO metadata
├── console.config.yaml     Live configuration: site metadata, AI settings, commands, links
├── content/                Markdown pages, one file per command; help.md is the command list users see
├── docs/                   System documentation (this folder)
├── scripts/                Application modules; index.html loads them in dependency order
├── styles/                 console.css for the terminal UI, chat.css for the chat UI
├── images/ and pdfs/       Static assets; PDFs are registered with the knowledge base
├── deploy.sh               Deployment helper for GitHub Pages
└── favicons/, manifest.json, robots.txt, sitemap.xml   PWA and SEO assets
```

## Modules

* `scripts/console.js`: entry point. Loads the config, builds the command map with aliases, renders command output through the template layer, and owns history, tab completion, hash routing, built-in commands, the AI consent flow, and the chat UI.
* `scripts/yaml-parser.js`: parses the YAML subset used by the config and front matter; see [yaml_parser.md](./yaml_parser.md).
* `scripts/markdown-parser.js`: converts page Markdown to HTML and splits front matter; see [markdown_parser.md](./markdown_parser.md).
* `scripts/chat.js`: chat orchestration: system prompt assembly, message history, and streaming generation.
* `scripts/personality.js`: instant responses and easter eggs, checked before the model.
* `scripts/knowledge.js`: keyword index over content pages and PDF metadata, ranking and context extraction; see [knowledge_base.md](./knowledge_base.md).
* `scripts/llm-runner.js`: WebLLM wrapper: lazy model initialization, model metadata, streaming completions, runtime stats, unload.
* `scripts/webllm-loader.js`: imports WebLLM from the CDN and signals readiness through window events.
* `scripts/ascii-art.js`: ASCII art used by fun responses.
* `scripts/games.js`: mini-games started from chat input (`play guess-paper`, `play trivia`, `play scramble`).

On load, `console.js` renders the home command and sets up the input form; `knowledgeBase.initialize()` runs when the AI components initialize, not before.

## Command flow

```text
/command ─► resolve the name (aliases included) in the command map
         ─► fetch content/*.md and split front matter
         ─► substitute {{key}} values, convert Markdown to HTML
         ─► apply the template (default or intro)
         ─► replace the terminal content and set the #/command hash route
```

Built-in commands never reach the content loader; they are registered in `scripts/console.js`:

* `/clear`: clears the output buffer.
* `/exit`, `/quit`: navigate to `about:blank`.
* `/reload`, `/refresh`: reload the page.
* `/fullscreen`: toggles document fullscreen.
* `/theme`: toggles the theme, or sets `light`/`dark`.

Unknown names are matched against registered prefixes for suggestions. The command list users see is `content/help.md`; the definitions are in [console.config.yaml](../console.config.yaml). The hidden `/goldfinger:` admin commands are documented in [ai_chat.md](./ai_chat.md).

## Chat flow

```text
freeform input ─► AI disabled? answer with the unknown-command message and a /help hint
               ▼
           consent not yet answered? show the consent prompt
               │    └─ decline: the session stays in command-only mode
               ▼
           game in progress? route the input to the game
               │    └─ "play <name>" starts one
               ▼
           easter egg or quick response? answer instantly, with no model
               ▼
           model still loading? report that and let the user retry
               ▼
           build the prompt: persona + current page + ranked knowledge snippets + history
               ▼
           stream the reply into the terminal
```
