# Console Homepage Documentation

Concise system documentation for the console-based personal homepage.

## Overview

The Console Homepage is a **config-driven**, **modular**, zero-build terminal interface for academic and personal websites. Content is fetched at runtime from YAML configuration and Markdown files.

### Key Features
- **Zero Build Tools**: Edit files and reload browser; no compilation or bundling required.
- **Config-Driven**: Define commands, site metadata, and AI settings in `console.config.yaml`.
- **Runtime Loading**: Dynamic fetching of Markdown content and front matter.
- **Optional In-Browser AI Chat**: Local LLM execution via WebLLM without external API costs or server backends.
- **SPA Navigation**: Hash-based deep linking (`#/about`) without page refreshes.

## File Structure

```text
homepage/
├── index.html               # HTML shell entry point
├── console.config.yaml      # Configuration (commands & AI settings)
├── deploy.sh                # GitHub Pages deployment script
├── content/                 # Markdown pages (about.md, publications.md, etc.)
├── docs/                    # System documentation
├── scripts/
│   ├── console.js           # Main console engine (routing, UI rendering)
│   ├── yaml-parser.js       # Light YAML & front matter parser
│   ├── markdown-parser.js   # Markdown to HTML converter
│   ├── chat.js              # AI chat orchestration
│   ├── llm-runner.js        # WebLLM interface wrapper
│   ├── personality.js       # Instant responses & easter eggs
│   ├── knowledge.js # RAG-lite document retrieval engine
│   └── webllm-loader.js     # Async WebLLM ES module loader
├── styles/                  # CSS styles (console.css, chat.css)
├── images/ & pdfs/          # Static media and publication PDFs
```

## High-Level Architecture

1. **Initialization**: `console.js` parses `console.config.yaml` to map commands and aliases.
2. **Command Handling**: Typing `/command` fetches `content/<command>.md`, extracts YAML front matter, converts markdown to HTML, and applies specified templates (`default` or `intro`).
3. **AI Integration**: Non-slash input triggers the AI chat agent (`chat.js`), using `knowledge.js` to supply context to WebLLM.

## Documentation Index

- **[QUICKSTART.md](QUICKSTART.md)** – Quick guide to adding commands and content.
- **[ARCHITECTURE.md](ARCHITECTURE.md)** – Core engine design, execution flow, and command specifications.
- **[AI_CHAT.md](AI_CHAT.md)** – AI chat setup, model selection, and hidden admin controls.
- **[KNOWLEDGE_BASE.md](KNOWLEDGE_BASE.md)** – Context extraction and RAG-lite indexing mechanism.
- **[DEPLOYMENT.md](DEPLOYMENT.md)** – GitHub Pages deployment instructions.
- **[YAML_PARSER.md](YAML_PARSER.md)** – Custom YAML parser specification & supported subset.
- **[MARKDOWN_PARSER.md](MARKDOWN_PARSER.md)** – Comprehensive Markdown parser reference, syntax guide, and test fixtures.
- **[TEST_AI.md](TEST_AI.md)** – Manual test protocol for AI chat features.

## Deployment & Running Locally

```bash
# Run locally (HTTP server required for fetch requests)
python3 -m http.server 8080
# Open http://localhost:8080/index.html

# Deploy to GitHub Pages
./deploy.sh
```
