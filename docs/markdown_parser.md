# Markdown parser

`scripts/markdown-parser.js` converts page Markdown to HTML in the browser. It implements a fixed subset with a few extensions; it is not CommonMark.

## API

* `parseMarkdown(text)`: converts a Markdown string to HTML.

  ```javascript
  parseMarkdown("# Hello\n**Bold** text");
  // "<h1>Hello</h1>\n<p>\n<strong>Bold</strong> text\n</p>"
  ```

* `parseFrontMatter(text)`: splits a leading `---` fenced block into an object and the body, parsed with the YAML subset documented in [yaml_parser.md](./yaml_parser.md).

  ```javascript
  const { frontMatter, content } = parseFrontMatter(text);
  // Without a block: { frontMatter: {}, content: text }
  ```

## Inline syntax

| Feature | Syntax | HTML |
|:--|:--|:--|
| Bold | `**text**` | `<strong>text</strong>` |
| Italic | `*text*` | `<em>text</em>` |
| Strikethrough | `~~text~~` | `<del>text</del>` |
| Highlight | `==text==` | `<mark>text</mark>` |
| Shadow (dimmed) | `--text--` | `<span class="shadow">text</span>` |
| Superscript | `^text^` | `<sup>text</sup>` |
| Subscript | `~text~` | `<sub>text</sub>` |
| Inline code | `` `text` `` | `<span class="kbd">text</span>` |

## Block syntax

* Headings: `#`, `##`, and `###` only.
* Horizontal rule: a standalone `---` line becomes `<div class="sep"></div>`.
* Tables with alignment:

  ```markdown
  | Left | Center | Right |
  |:-----|:------:|------:|
  | Cell | Cell   | Cell  |
  ```

* Task lists: `- [ ]` and `- [x]` become disabled checkboxes.
* Lists: `- item` lines become a `<ul class="clean">`.
* Links: `[text](url)`; `http...` and `#...` targets open in a new tab with `rel="noopener"`.
* Images with attributes: `![alt](src width=100px height=100px class="rounded")`.
* Front matter: a leading `---` fenced block is stripped from the body by `parseFrontMatter()`.

## Not supported

* Block quotes and fenced code blocks.
* Nested lists and ordered lists.
* Reference-style links.

## Test fixture

Paste this into a content page to verify a parser change end to end:

```markdown
**Formatting**: **Bold**, *Italic*, ~~Strikethrough~~, ==Highlight==, --Shadow--.
**Subscript and superscript**: H~2~O, E = mc^2^
**Inline code**: `code block`

| Feature | Status | Priority | Alignment |
|:--------|:------:|:--------:|----------:|
| Tables | pass | ==HIGH== | Left |
| Subscript H~2~O | pass | MED | Center |

- [x] Completed task
- [ ] Pending task

![Avatar](avatar.jpg width=100px height=100px class="rounded" id="profile-pic")
```
