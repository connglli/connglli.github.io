# Markdown Features

This document demonstrates all the markdown syntax supported by the parser.

## Text Formatting

### Basic Formatting
- **Bold text** using `**bold**`
- *Italic text* using `*italic*`
- ~~Strikethrough text~~ using `~~strikethrough~~`
- Shadow text using `--shadow--` (dimmed without strikethrough)
- ==Highlighted text== using `==highlight==`
- `Inline code` using backticks

### Advanced Formatting
- Superscript: E = mc^2^ using `^2^`
- Subscript: H~2~O using `~2~`
- Combined: x^2^ + y~i~ = z

## Headers

Use `#`, `##`, or `###` for headers:

# H1 Header
## H2 Header
### H3 Header

## Tables

Basic table:
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

Table with alignment:
```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| A1   | A2     | A3    |
| B1   | B2     | B3    |
```

**Alignment:**
- `:---` = Left align (default)
- `:---:` = Center align
- `---:` = Right align

## Lists

### Regular List
- Item 1
- Item 2
- Item 3

### Task List
- [ ] Unchecked task using `- [ ]`
- [x] Completed task using `- [x]`
- [ ] Another pending task

## Links and Images

### Links
```markdown
[Link text](https://example.com)
[Internal link](#section)
```

### Images

Basic image:
```markdown
![Alt text](path/to/image.png)
```

Image with attributes:
```markdown
![Avatar](avatar.jpg width=100px height=100px)
![Logo](logo.png width=50%)
![Banner](banner.jpg width=100% class="rounded")
```

**Supported attributes:**
- `width` - e.g., `100px`, `50%`
- `height` - e.g., `100px`, `auto`
- `class` - CSS class name
- `id` - Element ID
- Any HTML attribute

## Other Elements

### Horizontal Rule
Use `---` on its own line:

---

### Code/Keyboard Shortcuts
Use backticks for inline code: `npm install`

## Complete Example

Here's a scientific formula: E = mc^2^

Chemical formula: H~2~O + O~2~ → H~2~O~2~

### Performance Table

| Algorithm  | Time       | Space  |
|:-----------|:----------:|-------:|
| Quick Sort | O(n log n) | O(1)   |
| Merge Sort | O(n log n) | O(n)   |
| Heap Sort  | O(n log n) | O(1)   |

### Task List

- [x] Add superscript support
- [x] Add subscript support
- [x] Add strikethrough support
- [x] Add highlight support
- [x] Add task list support
- [x] Add table support
- [x] Add image attributes support
- [ ] Test all features

**Important:** This is ==highlighted important text==.

~~This text is deprecated~~.

### Image Examples

```markdown
![Small icon](icon.png width=32px height=32px)
![Profile](profile.jpg width=150px height=150px class="rounded")
```
