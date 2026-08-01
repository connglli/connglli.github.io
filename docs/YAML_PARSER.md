# YAML Parser Documentation

Technical reference for `scripts/yaml-parser.js` (Lightweight YAML subset parser).

## Overview

The YAML parser is a zero-dependency parser designed specifically for `console.config.yaml` and Markdown front matter headers.

## API Reference

### `parseYAML(text)`
Parses a YAML string into a JavaScript object.

```javascript
const config = parseYAML(yamlString);
```

### `parseValue(val)`
Internal helper that evaluates string primitives into numbers, booleans, inline JSON, or trimmed strings.

## Supported Features

```yaml
# 1. Key-Value Pairs
name: "Cong Li"
handle: "user@eth"

# 2. Primitives
port: 8080
enabled: true
debug: false

# 3. Quoted Strings
title: "Quoted \"string\""
single: 'Single quote'

# 4. Nested Objects
site:
  name: "Cong Li"
  title: "Profile"

# 5. Lists & Arrays
tags:
  - security
  - compilers

# 6. Lists of Objects
commands:
  - name: home
    aliases: ["about"]
    content: "content/home.md"

# 7. Inline JSON
aliases: ["home", "main"]
meta: {"version": 1}
```

## Known Limitations

- ❌ **No Multi-line Strings**: Folded (`>`) or literal (`|`) blocks are not supported.
- ❌ **No Anchors / Aliases**: (`&anchor`, `*alias`) syntax is not supported.
- ❌ **Max 2 Levels Nesting**: Deeply nested trees should use inline JSON.
- ❌ **Inline Comments**: Only full-line comments (`# comment`) are supported.
