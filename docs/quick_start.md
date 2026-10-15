# Quick start

## Run locally

The site fetches its content at runtime, so `file://` URLs hit CORS errors; serve the directory over HTTP:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/index.html.

## Add a command

### 1. Create the content file

`content/mycommand.md`:

```markdown
## My section title

Content goes here using standard **Markdown**. Extended syntax such as ==highlight== is available; see the Markdown parser documentation.
```

### 2. Register the command in console.config.yaml

```yaml
commands:
  - name: mycommand
    aliases: ["mycmd"]
    title: "cong@eth:~ (mycommand)"
    content: "content/mycommand.md"
    template: "default"
```

The `title` appears in the title bar; when it starts with the site handle, the handle links back to home. The `template` selects the renderer (see Templates below).

### 3. Add it to the help page

Add a line to `content/help.md`:

```markdown
- [/mycommand](#/mycommand) - Brief description of the command
```

Reload the page and type `/mycommand` or `/mycmd`.

## Author content pages

### Templates

* `default` renders the Markdown as-is.
* `intro` renders a two-column card: content on the left, avatar on the right, with email, address, and links in a key-value panel below the content.

The `intro` template reads `photo`, `email`, `address`, and `links` (`text` and `url` per entry) from front matter. Example:

```markdown
---
photo: images/photo.jpg
email: you@example.com
address: Building 1, Street 2
links:
  - text: GitHub
    url: https://github.com/username
---

## Bio header

Bio content...
```

### Variable substitution

`{{key}}` in the body is replaced with the string value of `key` from front matter. Only string values are substituted; arrays such as `links` are not.

Front matter is optional, fenced by `---` lines, and parsed as YAML; see [yaml_parser.md](./yaml_parser.md) for the format and [markdown_parser.md](./markdown_parser.md) for the syntax of the page body.

## Edit site metadata and links

`console.config.yaml`:

```yaml
site:
  name: "Your Name"
  handle: "user@host"
  title: "Displayed title"
  tagline: "Short subtitle"

links:
  - text: "github"
    url: "https://github.com/username"
    target: "_blank"
```

The `links` entries fill the badge in the top-right corner. The live values are in [console.config.yaml](../console.config.yaml).

## Enable AI chat

Set `ai.enabled: true` in [console.config.yaml](../console.config.yaml). Model selection, limits, and behavior are documented in [ai_chat.md](./ai_chat.md).

## Deploy

See [deployment.md](./deployment.md).
