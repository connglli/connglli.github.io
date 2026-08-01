# Markdown Parser Documentation

Technical reference, syntax guide, and test fixtures for `scripts/markdown-parser.js`.

## API Reference

### `parseMarkdown(text)`
Converts a Markdown string to formatted HTML.

```javascript
const html = parseMarkdown("# Hello\n**Bold** text");
// Returns: "<h1>Hello</h1>\n<p><strong>Bold</strong> text</p>"
```

### `parseFrontMatter(text)`
Splits Markdown text into front matter object and body string.

```javascript
const { frontMatter, content } = parseFrontMatter(text);
```

## Syntax Reference

| Feature | Syntax | HTML Output |
| :--- | :--- | :--- |
| **Bold** | `**text**` | `<strong>text</strong>` |
| *Italic* | `*text*` | `<em>text</em>` |
| ~~Strikethrough~~ | `~~text~~` | `<del>text</del>` |
| Shadow (Dimmed) | `--text--` | `<span class="shadow">text</span>` |
| Highlight | `==text==` | `<mark>text</mark>` |
| Superscript | `^text^` | `<sup>text</sup>` |
| Subscript | `~text~` | `<sub>text</sub>` |
| Inline Code | `` `text` `` | `<span class="kbd">text</span>` |

### Headings
```markdown
# H1 Header
## H2 Header
### H3 Header
```

### Tables & Alignment
```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| Cell | Cell   | Cell  |
```

### Task Lists
```markdown
- [ ] Unchecked task
- [x] Completed task
```

### Links & Images with Attributes
```markdown
[Link Text](https://example.com)
![Alt text](image.png width=100px height=100px class="rounded")
```
*(External links automatically append `target="_blank" rel="noopener"`).*

### Front Matter Format
```markdown
---
template: intro
photo: images/photo.jpg
---
# Page Content
```

## Test Fixture Sample

Sample input to verify parser feature rendering:

**Formatting**: **Bold**, *Italic*, ***Bold Italic***, ~~Strikethrough~~, ==Highlight==, --Shadow--.  
**Subscript & Superscript**: H~2~O, E = mc^2^, x^2^ + y~i~ = z  
**Inline Code**: `code block`

**Table Alignment**:

| Feature | Status | Priority | Alignment |
|:--------|:------:|:--------:|----------:|
| **Tables** | ✓ | ==HIGH== | Left |
| Subscript H~2~O | ✓ | MED | Center |

**Task List**:
- [x] Completed task
- [ ] Pending task

**Images**:
![Avatar](avatar.jpg width=100px height=100px class="rounded" id="profile-pic")
