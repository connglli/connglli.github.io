# Quick Start Guide

## Running Locally

Must be served via HTTP (due to `fetch()` CORS policies on `file://` URLs):

```bash
python3 -m http.server 8080
# Open http://localhost:8080/index.html
```

## Adding a New Command in 3 Steps

### 1. Create Content File (`content/mycommand.md`)
```markdown
## My Section Title

Content goes here using standard **Markdown**.

- Feature 1
- Feature 2
```

### 2. Register Command in `console.config.yaml`
```yaml
commands:
  - name: mycommand
    aliases: ["mycmd"]
    title: "user@host:~ (mycommand)"
    content: "content/mycommand.md"
    template: "default"  # Options: "default" or "intro"
```

### 3. Add to Help Menu (`content/help.md`)
```markdown
- [/mycommand](#/mycommand) - Brief description of your new command
```

Now test by refreshing the page and typing `/mycommand` or `/mycmd`.

## Configuration Reference

### Site & AI Setup (`console.config.yaml`)
```yaml
site:
  name: "Your Name"
  handle: "user@host"
  title: "Display Title"

ai:
  enabled: true                      # Set to false to disable AI chat
  name: "Pico"                       # AI assistant name
  model: "Qwen3-1.7B-q4f16_1-MLC"    # See AI_CHAT.md for model options
  temperature: 0.8
  max_tokens: 4096

links:
  - text: "github"
    url: "https://github.com/username"
    target: "_blank"
```

### Front Matter & Templates

- **`default` template**: Renders standard Markdown.
- **`intro` template**: Renders 2-column layout (avatar + metadata left, content right). Requires front matter:

```markdown
---
photo: images/photo.jpg
email: user@example.com
links:
  - text: GitHub
    url: https://github.com/username
---

## Bio Header
Bio content...
```

Variable substitution allows using `{{key}}` in Markdown content to reference front matter keys.

## Admin / Debug Commands

- `/goldfinger:enableai` – Enable AI chat for current session without modifying config.
- `/goldfinger:aistatus` – Show WebLLM loading and model initialization state.

## Deployment

Deploy changes to GitHub Pages:
```bash
./deploy.sh
```
