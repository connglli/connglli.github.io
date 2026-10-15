# YAML parser

`scripts/yaml-parser.js` parses the subset of YAML this site uses: [console.config.yaml](../console.config.yaml) and Markdown front matter. It is not a general YAML implementation.

## API

* `parseYAML(text)`: parses a YAML string into an object.

  ```javascript
  const config = parseYAML(yamlString);
  ```

* `parseValue(val)`: internal helper for scalars: inline JSON (`[...]`, `{...}`), quoted strings, booleans, numbers, otherwise the string itself.

## Supported subset

```yaml
# key-value pairs
name: "Cong Li"
handle: "cong@eth"

# primitives
port: 8080
enabled: true
debug: false

# quoted strings; outer quotes are stripped, no escape processing
title: "Cong Li (李聪)"
single: 'Single quote'

# nested objects (one level)
site:
  name: "Cong Li"
  title: "Profile"

# lists
tags:
  - security
  - compilers

# lists of objects
commands:
  - name: home
    aliases: ["about"]
    content: "content/home.md"

# inline JSON
aliases: ["home", "main"]
meta: {"version": 1}
```

## Limitations

* No block scalars: folded (`>`) and literal (`|`) multi-line strings are not supported.
* No anchors or aliases (`&anchor`, `*alias`).
* Nesting works at most two levels; deeper trees come out flat. Use inline JSON for anything deeper.
* Comments are full-line only (`# comment`); a trailing comment becomes part of the value.
