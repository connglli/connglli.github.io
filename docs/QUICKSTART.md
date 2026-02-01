# Quick Start Guide

## Using the Console

### Slash Commands
Type commands starting with `/` to navigate:
```
/help
/about
/publications
/clear
```

### AI Chat (if enabled)
Type messages without `/` to chat with AI:
```
hello
what does cong research?
tell me about fuzzing
```

**Note**: AI can be enabled/disabled in `console.config.yaml` by setting `ai.enabled: true/false`

---

## Adding a New Command

**Three simple steps** to add new content to your console homepage:

### 1. Create Content File

Create `content/mycommand.md`:

```markdown
## My New Section

Your content here with **markdown** formatting.

- List item 1
- List item 2

[Link to somewhere](https://example.com)
```

### 2. Register in Config

Edit `console.config.yaml` and add:

```yaml
commands:
  - name: mycommand
    aliases: ["mycmd"]
    title: "cong@eth:~ (mycommand)"
    content: "content/mycommand.md"
    template: "default"
```

### 3. Update Help

Edit `content/help.md` to include your command:

```markdown
- [/mycommand](#/mycommand) - description of what it does
```

### 4. Test

```bash
python3 -m http.server 8080
# Open http://localhost:8080/index.html
# Type /mycommand
```

Done! Your new command is working.

---

## Complete Example: Adding a "Blog" Command

Let's add a `/blog` command that lists blog posts.

### Step 1: Create `content/blog.md`

```markdown
## Blog Posts

Recent writings:

- [Understanding JIT Compilers](https://blog.example.com/jit-compilers) - Jan 2026
- [Fuzzing with LLMs](https://blog.example.com/llm-fuzzing) - Dec 2025
- [My Research Journey](https://blog.example.com/research-journey) - Nov 2025

---

See all posts at [my blog](https://github.com/connglli/blog-notes)
```

### Step 2: Add to `console.config.yaml`

```yaml
commands:
  # ... existing commands ...
  
  - name: blog
    aliases: ["posts", "writing"]
    title: "cong@eth:~ (blog)"
    content: "content/blog.md"
    template: "default"
```

### Step 3: Update `content/help.md`

```markdown
### Available Commands

- [/about](#/about) - bio + research focus
- [/blog](#/blog) - recent blog posts    ← ADD THIS
- [/publications](#/publications) - selected papers + full list
...
```

### Result

Now you can:
- Type `/blog` in the console
- Use aliases: `/posts` or `/writing`
- Deep link: `yoursite.com/#/blog`
- Tab complete: type `/bl` and press Tab

---

## Configuration Reference

### Command Properties

```yaml
- name: commandname        # Primary command name (required)
  aliases: ["alias1"]      # Alternative names (optional)
  title: "prompt (title)"  # Terminal title (required)
  content: "path/to.md"    # Markdown file path (required)
  template: "default"      # Template: "default" or "intro" (required)
```

### AI Configuration

```yaml
ai:
  enabled: true                     # Enable/disable AI chat
  name: "Pico"                      # AI assistant name
  model: "Qwen3-1.7B-q4f16_1-MLC"  # Model selection
  temperature: 0.8                  # Creativity (0.0-2.0)
  max_tokens: 4096                  # Response length
```

**Available Models** (see [AI_CHAT.md](AI_CHAT.md) for details):
- `Qwen3-0.6B-q4f16_1-MLC` (~350MB, fast)
- `Qwen3-1.7B-q4f16_1-MLC` (~1GB, balanced)
- `SmolLM2-360M-Instruct-q4f16_1-MLC` (~360MB, compact)
- `SmolLM2-1.7B-Instruct-q4f16_1-MLC` (~1.7GB, capable)
- `gemma-2-2b-it-q4f16_1-MLC` (~1.3GB, advanced)

### Templates

#### `default` Template
Standard single-column layout for most content.

#### `intro` Template
Two-column layout with photo and links (typically for homepage).

Requires front matter:
```markdown
---
photo: images/photo.jpg
email: your@email.com
links:
  - text: GitHub
    url: https://github.com/username
---

## Your content here
```

---

## Advanced: Front Matter & Variables

Add YAML metadata at the top of markdown files for dynamic content:

```markdown
---
blog_url: https://github.com/connglli/blog-notes
latest_post: Understanding JIT Compilers
post_date: 2026-01-31
---

## Blog Posts

Latest: [{{latest_post}}]({{blog_url}}) - {{post_date}}

Check out all my posts at [{{blog_url}}]({{blog_url}})
```

**Variable substitution**: Use `{{key}}` to reference front matter values.

---

## Markdown Cheat Sheet

```markdown
## Heading 2
### Heading 3

**bold** and *italic*

`code or keyboard`

[link text](https://url.com)

- List item 1
- List item 2

---  (horizontal separator)
```

---

## Tips

1. **One command = one topic** - Keep content focused
2. **Use aliases** - Provide short alternatives (`/pub` for `/publications`)
3. **Link between commands** - Use `[/about](#/about)` in markdown
4. **Test frequently** - Reload page after each change
5. **Lowercase names** - Use `mycommand` not `MyCommand` or `my command`
6. **Edit content/help.md** - Always update help so users can discover your new command
7. **Configure AI** - Enable/disable and choose models in `console.config.yaml`
8. **Debug AI issues** - Use `/goldfinger:aistatus` to check AI system status (hidden command)

---

## Hidden Commands

For debugging and admin use:

- **`/goldfinger:aistatus`** - Show AI system status (WebLLM loading, model state, etc.)
- **`/goldfinger:enableai`** - Enable AI at runtime without changing config

These are intentionally not shown in `/help`. See [AI_CHAT.md](AI_CHAT.md) for details.

---

## Deployment

When ready to publish:

```bash
./deploy.sh
```

This will commit all changes and push to GitHub.

---

## Need More Help?

- **AI Chat setup**: [AI_CHAT.md](AI_CHAT.md)
- **Detailed documentation**: [docs/README.md](README.md)
- **System architecture**: [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- **GitHub Pages setup**: [docs/DEPLOYMENT.md](DEPLOYMENT.md)
- **AI coding guidelines**: [../AGENTS.md](../AGENTS.md)
