# Markdown Parser Documentation

The Markdown parser (`scripts/markdown-parser.js`) converts markdown syntax to HTML for rendering in the console application.

## Table of Contents
- [Supported Features](#supported-features)
- [API Reference](#api-reference)
- [Syntax Guide](#syntax-guide)
- [Examples](#examples)

## Supported Features

### Text Formatting

| Feature | Syntax | HTML Output | Example |
|---------|--------|-------------|---------|
| **Bold** | `**text**` | `<strong>text</strong>` | **bold** |
| *Italic* | `*text*` | `<em>text</em>` | *italic* |
| ~~Strikethrough~~ | `~~text~~` | `<del>text</del>` | ~~deleted~~ |
| Shadow | `--text--` | `<span class="shadow">text</span>` | dimmed text |
| ==Highlight== | `==text==` | `<mark>text</mark>` | ==highlighted== |
| Superscript | `^text^` | `<sup>text</sup>` | E = mc^2^ |
| Subscript | `~text~` | `<sub>text</sub>` | H~2~O |
| `Code` | `` `text` `` | `<span class="kbd">text</span>` | `code` |

### Tables

Tables with column alignment support:

```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| A    | B      | C     |
```

**Alignment:**
- `:---` - Left align
- `:---:` - Center align  
- `---:` - Right align

### Headers

```markdown
# H1 Header
## H2 Header
### H3 Header
```

Converts to:
```html
<h1>H1 Header</h1>
<h2>H2 Header</h2>
<h3>H3 Header</h3>
```

### Lists

**Regular List:**
```markdown
- Item 1
- Item 2
- Item 3
```

**Task List:**
```markdown
- [ ] Unchecked task
- [x] Completed task
- [ ] Another pending task
```

Converts to:
```html
<ul class="clean">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>

<ul class="clean">
  <li class="task-item"><input type="checkbox" disabled> Unchecked task</li>
  <li class="task-item"><input type="checkbox" checked disabled> Completed task</li>
  <li class="task-item"><input type="checkbox" disabled> Another pending task</li>
</ul>
```

### Links and Images

**Links:**
```markdown
[Link text](https://example.com)
[Internal link](#section)
```

**Images:**
```markdown
![Alt text](path/to/image.png)
![Avatar](avatar.jpg width=100px height=100px)
![Logo](logo.png width=50% class="center")
```

**Image Attributes:**
You can add HTML attributes to images by including them after the URL:
- `width` - Image width (e.g., `100px`, `50%`)
- `height` - Image height (e.g., `100px`, `auto`)
- `class` - CSS class name
- Any other HTML attribute

External links automatically get `target="_blank"` and `rel="noopener"` attributes.

### Tables

Tables support alignment using colons in the separator row:

```markdown
| Left aligned | Center aligned | Right aligned |
|:-------------|:--------------:|--------------:|
| Cell 1       | Cell 2         | Cell 3        |
| Cell 4       | Cell 5         | Cell 6        |
```

**Alignment:**
- `:---` - Left aligned (default)
- `:---:` - Center aligned
- `---:` - Right aligned

Converts to:
```html
<table>
<thead>
<tr>
<th style="text-align: left">Left aligned</th>
<th style="text-align: center">Center aligned</th>
<th style="text-align: right">Right aligned</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left">Cell 1</td>
<td style="text-align: center">Cell 2</td>
<td style="text-align: right">Cell 3</td>
</tr>
</tbody>
</table>
```

### Horizontal Rules

```markdown
---
```

Converts to:
```html
<div class="sep"></div>
```

### Front Matter

Front matter is YAML metadata at the beginning of a markdown file:

```markdown
---
template: intro
photo: "images/avatar.jpg"
email: "cong.li@example.com"
address: "Zurich, Switzerland"
links:
  - text: "GitHub"
    url: "https://github.com/connglli"
---

# Your content here
```

Front matter is parsed separately and can be used for template variables.

## API Reference

### `parseMarkdown(text: string): string`

Converts markdown text to HTML.

**Parameters:**
- `text` (string): Markdown text to parse

**Returns:**
- (string): HTML string

**Example:**
```javascript
const markdown = "# Hello\n\nThis is **bold** text.";
const html = parseMarkdown(markdown);
// Returns: "<h1>Hello</h1>\n<p>\nThis is <strong>bold</strong> text.\n</p>"
```

### `parseFrontMatter(text: string): object`

Extracts and parses YAML front matter from markdown.

**Parameters:**
- `text` (string): Markdown text with optional front matter

**Returns:**
- (object): Object with `frontMatter` and `content` properties

**Example:**
```javascript
const text = `---
title: "My Page"
author: "Cong Li"
---

# Content here`;

const result = parseFrontMatter(text);
// {
//   frontMatter: { title: "My Page", author: "Cong Li" },
//   content: "# Content here"
// }
```

## Syntax Guide

### Basic Formatting

**Bold text:**
```markdown
This is **bold text** and this is also **important**.
```
→ This is **bold text** and this is also **important**.

**Italic text:**
```markdown
This is *italic text* for emphasis.
```
→ This is *italic text* for emphasis.

**Strikethrough:**
```markdown
This feature is ~~deprecated~~ no longer available.
```
→ This feature is ~~deprecated~~ no longer available.

**Shadow text (dimmed without strikethrough):**
```markdown
This is --secondary information-- or --less important text--.
```
→ This is dimmed secondary information or less important text.

**Highlight:**
```markdown
This is ==very important== information.
```
→ This is ==very important== information.

### Advanced Formatting

**Superscript (for exponents, footnotes, etc.):**
```markdown
Einstein's famous equation: E = mc^2^

Temperature: 25^°^C
```
→ Einstein's famous equation: E = mc²  
→ Temperature: 25°C

**Subscript (for chemical formulas, mathematical notation):**
```markdown
Water formula: H~2~O

Array notation: a~i~ = b~i~ + c~i~
```
→ Water formula: H₂O  
→ Array notation: aᵢ = bᵢ + cᵢ

**Combining subscript and superscript:**
```markdown
Complex formula: x^2^ + y~i~

Chemical reaction: H~2~O + O~2~ → H~2~O~2~
```

**Code/Keyboard shortcuts:**
```markdown
Press `Ctrl+C` to copy and `Ctrl+V` to paste.

Install using `npm install`.
```
→ Press `Ctrl+C` to copy and `Ctrl+V` to paste.

### Links

**External links:**
```markdown
Visit [GitHub](https://github.com) for more information.
```
→ Visit [GitHub](https://github.com) for more information.

**Internal/hash links:**
```markdown
Jump to [section](#features) in this page.
```

**Links in lists:**
```markdown
- [Homepage](/)
- [Documentation](/docs)
- [GitHub](https://github.com/connglli)
```

### Images

**Basic images:**
```markdown
![Profile picture](images/avatar.jpg)
![Diagram showing architecture](diagrams/system.png)
```

**Images with attributes:**
```markdown
![Avatar](images/avatar.jpg width=150px height=150px)
![Logo](images/logo.png width=50%)
![Banner](banner.jpg width=100% class="rounded")
```

**Supported attributes:**
- `width` - Width in pixels or percentage (e.g., `100px`, `50%`)
- `height` - Height in pixels or percentage
- `class` - CSS class name(s)
- `id` - Element ID
- `style` - Inline CSS styles
- Any valid HTML attribute

**Examples:**
```markdown
![Small icon](icon.png width=32px height=32px)
![Responsive image](hero.jpg width=100% height=auto)
![Centered logo](logo.png width=200px class="center")
```

### Tables

**Basic table:**
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

**Table with alignment:**
```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| A1   | A2     | A3    |
| B1   | B2     | B3    |
```

**Alignment syntax:**
- `:---` - Left align (default)
- `:---:` - Center align
- `---:` - Right align

**Example with mixed content:**
```markdown
| Name        | Score | Status    |
|:------------|:-----:|----------:|
| Alice       | 95    | ✓ Pass    |
| Bob         | 87    | ✓ Pass    |
| Charlie     | 62    | ✗ Fail    |
```

Tables can contain other inline markdown like **bold**, *italic*, `code`, etc.

### Task Lists

Great for documentation, project tracking, or to-do items:

```markdown
## Project Progress

- [x] Initial setup
- [x] Core functionality
- [ ] Testing
- [ ] Documentation
- [ ] Deployment
```

Renders as interactive checkboxes (disabled by default).

## Examples

### Scientific Writing

```markdown
# Quantum Mechanics

The Schrödinger equation is written as:

iℏ∂~t~|ψ⟩ = Ĥ|ψ⟩

Where:
- ℏ is the reduced Planck constant
- |ψ⟩ is the quantum state
- Ĥ is the Hamiltonian operator

Energy levels: E~n~ = n^2^ × (h^2^ / 8mL^2^)
```

### Chemistry

```markdown
# Common Reactions

**Combustion of methane:**
CH~4~ + 2O~2~ → CO~2~ + 2H~2~O

**Water formation:**
2H~2~ + O~2~ → 2H~2~O

==Note:== All reactions must be balanced!
```

### Technical Documentation

```markdown
# Installation Guide

## Prerequisites

- [x] Node.js v16+
- [x] npm or yarn
- [ ] Docker (optional)

## Steps

1. Clone the repository:
   ```
   git clone https://github.com/user/repo.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. ~~Run the old command~~ Use the new command:
   ```
   npm start
   ```

==Important:== Make sure port 8080 is available!

For more info, see the [documentation](https://docs.example.com).
```

### Data Tables

```markdown
# Performance Comparison

| Algorithm    | Time Complexity | Space Complexity | Best Use Case          |
|:-------------|:---------------:|:----------------:|:-----------------------|
| Quick Sort   | O(n log n)      | O(log n)         | General purpose        |
| Merge Sort   | O(n log n)      | O(n)             | Stable sorting needed  |
| Bubble Sort  | O(n^2^)         | O(1)             | Small datasets         |
| Heap Sort    | O(n log n)      | O(1)             | Priority queues        |

==Note:== Time complexities shown are average case.
```

### Images with Styling

```markdown
# Team

![Alice](team/alice.jpg width=150px height=150px class="avatar")
**Alice Johnson** - Lead Developer

![Bob](team/bob.jpg width=150px height=150px class="avatar")
**Bob Smith** - Designer

## Project Banner

![Project Banner](images/banner.jpg width=100% height=auto)
```

### Mixed Content

```markdown
# Research Paper Notes

## Key Points

- The algorithm runs in O(n^2^) time
- Memory usage: O(n log~2~ n)
- ==Critical finding:== Performance degrades with large datasets

## Tasks

- [x] Literature review
- [x] Implement baseline
- [ ] Run experiments
- [ ] Write paper

## References

1. [Smith et al.^[1]^](https://example.com/paper1)
2. [Jones et al.^[2]^](https://example.com/paper2)

~~Note: Reference [3] was retracted~~
```

## Processing Order

The parser processes markdown in this order:

1. Tables (`| ... |` with separator row)
2. Headers (`#`, `##`, `###`)
3. Horizontal rules (`---`)
4. Bold (`**text**`)
5. Italic (`*text*`)
6. Strikethrough (`~~text~~`)
7. Highlight (`==text==`)
8. Shadow text (`--text--`)
9. Superscript (`^text^`)
10. Subscript (`~text~`)
11. Code (`` `text` ``)
12. Images with attributes (`![alt](url width=100px)`)
13. Links (`[text](url)`)
14. Task lists (`- [ ]`, `- [x]`)
15. Regular lists (`- item`)
16. Paragraphs (automatic wrapping)

**Important:** 
- Tables are processed first to avoid interference with other patterns
- Horizontal rules (`---` on its own line) are checked before shadow text
- Strikethrough (`~~`) is processed before subscript (`~`) to prevent conflicts
- Shadow text (`--`) is processed after horizontal rules to avoid conflicts
- Images are processed before links since they share similar syntax

## Limitations

### Not Supported

The parser is intentionally simple and does not support:

- ❌ Nested lists
- ❌ Ordered lists (numbered)
- ❌ Blockquotes
- ❌ Code blocks (fenced with ``` or indented)
- ❌ HTML passthrough
- ❌ Escaping special characters
- ❌ Multiple blank lines (collapsed)
- ❌ Underline formatting
- ❌ Definition lists
- ❌ Footnotes
- ❌ Complex table features (colspan, rowspan, nested tables)

### Workarounds

For unsupported features, consider:
- Using HTML directly (if needed)
- Simplifying the content structure
- Using external tools for complex formatting

## Best Practices

1. **Use task lists for tracking:** Great for documentation and project management
2. **Highlight important info:** Use `==highlight==` sparingly for critical information
3. **Subscript/superscript for notation:** Perfect for scientific and mathematical content
4. **Strikethrough for deprecation:** Mark deprecated features or outdated information
5. **Combine features:** Mix bold, italic, and other formatting for rich content

## Integration with Console Application

In the console application, markdown files can include front matter:

```markdown
---
template: intro
photo: "images/avatar.jpg"
email: "cong.li@inf.ethz.ch"
address: "Zurich, Switzerland"
links:
  - text: "GitHub"
    url: "https://github.com/connglli"
  - text: "Blog"
    url: "https://blog.example.com"
---

# Cong Li

I'm a postdoc researcher at ETH Zurich working on ==systems security== and programming languages.

## Research Interests

- System security
- Memory safety
- ~~Legacy systems~~ Modern architectures
```

The front matter is parsed and passed to templates, while the content is converted to HTML using the markdown parser.
