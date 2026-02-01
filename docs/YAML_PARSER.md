# YAML Parser Documentation

The YAML parser (`scripts/yaml-parser.js`) is a simple YAML subset parser designed to handle configuration files and front matter in markdown documents.

## Supported Features

The parser supports a basic subset of YAML that covers common configuration use cases:

### 1. Key-Value Pairs

```yaml
name: "Cong Li"
handle: "cong@eth"
title: "Cong Li (李聪)"
tagline: "Postdoc @ ETH Zurich"
```

### 2. Numbers and Booleans

```yaml
port: 8080
enabled: true
debug: false
timeout: 30
```

### 3. Quoted Strings

Both single and double quotes are supported:

```yaml
name: "John Doe"
title: 'Software Engineer'
description: "A \"quoted\" value"
```

### 4. Objects/Nested Structures

```yaml
site:
  name: "Cong Li"
  handle: "cong@eth"
  title: "Cong Li (李聪)"
```

### 5. Arrays/Lists

Simple lists:

```yaml
tags:
  - security
  - programming
  - research
```

Lists with objects:

```yaml
commands:
  - name: home
    aliases: ["about"]
    title: "cong@eth:~ (welcome)"
    content: "content/home.md"
    
  - name: help
    aliases: []
    title: "cong@eth:~ (help)"
    content: "content/help.md"
```

### 6. Inline JSON

Arrays and objects can also be written in JSON format:

```yaml
aliases: ["about", "intro", "welcome"]
metadata: {"version": 1, "author": "Cong Li"}
```

### 7. Comments

Lines starting with `#` are treated as comments:

```yaml
# This is a comment
name: "Cong Li"  # Inline comments are NOT supported
```

## Usage

### In Console Application

The YAML parser is used in two places:

1. **Configuration File** (`console.config.yaml`):
   ```javascript
   const config = await loadConfig();
   // Automatically parsed as YAML
   ```

2. **Markdown Front Matter**:
   ```javascript
   const { frontMatter, content } = parseFrontMatter(markdown);
   // Front matter between --- delimiters is parsed as YAML
   ```

### Front Matter Example

```markdown
---
template: intro
photo: "images/avatar.jpg"
email: "cong.li@example.com"
links:
  - text: "GitHub"
    url: "https://github.com/connglli"
---

# Your markdown content here
```

## API Reference

### `parseYAML(text: string): object`

Parses a YAML string and returns a JavaScript object.

**Parameters:**
- `text` (string): The YAML text to parse

**Returns:**
- (object): Parsed JavaScript object

**Example:**
```javascript
const yaml = `
name: "Cong Li"
tags:
  - research
  - security
`;

const result = parseYAML(yaml);
// { name: "Cong Li", tags: ["research", "security"] }
```

### `parseValue(value: string): any`

Internal helper that parses individual YAML values.

**Handles:**
- JSON arrays: `[1, 2, 3]`
- JSON objects: `{"key": "value"}`
- Quoted strings: `"text"` or `'text'`
- Booleans: `true`, `false`
- Numbers: `123`, `45.67`
- Plain strings: `text`

## Limitations

This is a simple parser with some limitations:

### Not Supported:
- ❌ Multi-line strings (folded `>` or literal `|`)
- ❌ Anchors and aliases (`&anchor`, `*alias`)
- ❌ Complex nested structures beyond 2 levels
- ❌ Tags (`!!str`, `!!int`, etc.)
- ❌ Multiple documents in one file (`---` separators)
- ❌ Inline comments (only full-line comments starting with `#`)
- ❌ Advanced data types (dates, null, infinity, etc.)

### Supported:
- ✅ Simple key-value pairs
- ✅ Nested objects (one level deep)
- ✅ Arrays/lists
- ✅ Objects in arrays
- ✅ Numbers, booleans, strings
- ✅ Comments (full line only)
- ✅ Inline JSON syntax for arrays/objects

## Example Configuration

Here's a complete example from `console.config.yaml`:

```yaml
# Console Configuration
site:
  name: "Cong Li"
  handle: "cong@eth"
  title: "Cong Li (李聪)"
  tagline: "Postdoc @ ETH Zurich"

commands:
  - name: home
    aliases: ["about"]
    title: "cong@eth:~ (welcome)"
    content: "content/home.md"
    template: "default"
    
  - name: help
    aliases: []
    title: "cong@eth:~ (help)"
    content: "content/help.md"
    template: "default"

builtins:
  - clear
  - cls

links:
  - text: "github"
    url: "https://github.com/connglli"
    target: "_blank"
```

This parses to:

```javascript
{
  site: {
    name: "Cong Li",
    handle: "cong@eth",
    title: "Cong Li (李聪)",
    tagline: "Postdoc @ ETH Zurich"
  },
  commands: [
    {
      name: "home",
      aliases: ["about"],
      title: "cong@eth:~ (welcome)",
      content: "content/home.md",
      template: "default"
    },
    {
      name: "help",
      aliases: [],
      title: "cong@eth:~ (help)",
      content: "content/help.md",
      template: "default"
    }
  ],
  builtins: ["clear", "cls"],
  links: [
    {
      text: "github",
      url: "https://github.com/connglli",
      target: "_blank"
    }
  ]
}
```

## Error Handling

The parser is lenient and will:
- Skip empty lines and comments
- Attempt to parse malformed values as strings
- Return empty object `{}` for invalid input

For production use with untrusted input, consider using a full-featured YAML library like [js-yaml](https://github.com/nodeca/js-yaml).
