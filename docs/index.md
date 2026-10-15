# Console homepage documentation

The console homepage is a personal academic site that presents itself as a terminal. Pages are Markdown files fetched at runtime, so the browser does all the work.

* Slash commands in a terminal UI, with tab completion and command history.
* Deep links such as `#/publications` that render without a page refresh.
* Markdown content pages with front matter, templates, and variable substitution.
* Optional in-browser AI chat (WebLLM) grounded in the site content.
* No build step: edit a file and reload the browser.

## Documentation

* [quick_start.md](./quick_start.md): run the site locally, add a command, author content pages, and edit site metadata.
* [architecture.md](./architecture.md): design principles, repository layout, modules, and execution flows.
* [ai_chat.md](./ai_chat.md): model selection, AI configuration, the consent flow, and admin commands.
* [knowledge_base.md](./knowledge_base.md): the retrieval engine behind AI answers.
* [deployment.md](./deployment.md): publishing to GitHub Pages.
* [yaml_parser.md](./yaml_parser.md): the YAML subset parser used for configuration and front matter.
* [markdown_parser.md](./markdown_parser.md): the Markdown converter and its extended syntax.
* [AGENTS.md](./AGENTS.md): the writing standard for these documents.
