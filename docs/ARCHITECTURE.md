# Console Homepage Architecture

System design documentation for the modular, config-driven console homepage.

## Core Architectural Principles

1. **Zero Build Pipeline**: Pure vanilla JavaScript (ES6+), HTML5, and CSS3. Runtime loading via `fetch()`.
2. **Config-Driven Layout**: Navigation structure, site metadata, and AI parameters managed entirely through `console.config.yaml`.
3. **Decoupled Content**: Dynamic content stored independently in Markdown files under `content/`.
4. **Local Execution**: Optional in-browser LLM via WebLLM with zero server infrastructure dependencies.

## Component Overview

```text
[Browser Entry Point: index.html]
         │
         ▼
 ┌───────────────┐      fetches      ┌─────────────────────┐
 │  console.js   │ ────────────────► │ console.config.yaml │
 └───────┬───────┘                   └─────────────────────┘
         │
         ├─── Command Execution (Slash Commands)
         │    ├── yaml-parser.js       (Parses config & front matter)
         │    ├── markdown-parser.js   (Converts MD to HTML)
         │    └── Content Files        (Fetches content/*.md)
         │
         └─── Chat Execution (Non-Slash Input)
              ├── chat.js              (Chat orchestration & streaming)
              ├── personality.js       (Instant responses & easter eggs)
              ├── knowledge.js (Context extraction & RAG indexing)
              └── llm-runner.js        (WebLLM interface via WebGPU)
```

### Module Responsibilities

- **`scripts/console.js`**: Application entry point, command dispatcher, UI output management, tab completion, command history, and router.
- **`scripts/yaml-parser.js`**: Lightweight parser supporting basic YAML structures and Markdown front matter.
- **`scripts/markdown-parser.js`**: Converts extended Markdown (tables, task lists, formatting extensions) into HTML.
- **`scripts/chat.js`**: Coordinates consent flow, user input routing, and streams AI model responses.
- **`scripts/personality.js`**: Pre-evaluates queries for easter eggs and instant canned responses.
- **`scripts/knowledge.js`**: Performs keyword indexing across Markdown files and lazy-loaded PDF metadata to construct context prompts.
- **`scripts/llm-runner.js`**: Wrapper for WebLLM engine initialization and model inference.

## Execution Flows

### 1. Slash Command Flow (`/command`)
```text
User enters /about ──► console.js looks up route in command map 
                   ──► Fetches content/about.md 
                   ──► Extracts front matter & parses MD to HTML 
                   ──► Applies template (default/intro) ──► Appends to DOM
```

### 2. AI Chat Flow (Freeform Input)
```text
User enters query ──► Check personality.js for instant match
                  │     └─► [Match] Render instant response
                  ▼
              Check if LLM is loaded
                  │     ├─► [No] Show consent dialog / load WebLLM model
                  ▼
              Query knowledge.js for relevant context snippets
                  │
                  ▼
              Build prompt (System prompt + Knowledge context + History)
                  │
                  ▼
              Stream response from WebLLM model via GPU
```

## Command Reference

### Built-in Shell Commands
Hardcoded in `scripts/console.js`:
- `/clear`: Clears current terminal buffer output.
- `/exit` / `/quit`: Navigates to `about:blank`.
- `/reload` / `/refresh`: Reloads current webpage state.
- `/fullscreen`: Toggles browser document full-screen mode.
- `/theme`: Toggles or sets terminal theme (`light` or `dark`).

### Hidden Admin Commands (Goldfinger)
Runtime override commands for administrative control:
- `/goldfinger:enableai`: Activates AI chat for current browser session without altering `console.config.yaml`.
- `/goldfinger:aistatus`: Displays real-time diagnostic telemetry (WebLLM load status, model ready state, user consent status).
