# Markdown Parser Feature Test

This file tests all supported markdown features.

## 1. Text Formatting

**Bold text** and *italic text* and ***bold italic***.

~~Strikethrough text~~ and ==highlighted text== and --shadow text--.

Superscript: E = mc^2^ and x^n+1^

Subscript: H~2~O and a~i~

Combined: x^2^ + y~i~ = z~max~

Inline `code` and `commands`.

### Shadow vs Strikethrough

- ~~This is deprecated~~ (strikethrough)
- --This is less important-- (shadow/dimmed)
- **This is important** (bold)
- ==This is critical== (highlighted)

## 2. Tables

### Basic Table

| Name | Age | City |
|------|-----|------|
| Alice | 30 | NYC |
| Bob | 25 | LA |
| Charlie | 35 | SF |

### Table with Alignment

| Left aligned | Center aligned | Right aligned |
|:-------------|:--------------:|--------------:|
| Short | Medium text | Very long text here |
| A | B | C |
| 1 | 2 | 3 |

### Complex Table with Formatting

| Feature | Status | Priority | Notes |
|:--------|:------:|:--------:|:------|
| **Tables** | ✓ | ==HIGH== | Supports alignment |
| ~~Old API~~ | ✗ | --LOW-- | Deprecated |
| Subscript H~2~O | ✓ | MED | Chemical formulas |
| Superscript x^2^ | ✓ | MED | Math notation |
| `Code` blocks | ✓ | HIGH | Inline only |
| --Shadow text-- | ✓ | MED | --Optional feature-- |

### Performance Comparison

| Algorithm | Best Case | Average Case | Worst Case | Space |
|:----------|:---------:|:------------:|:----------:|------:|
| Quick Sort | O(n log n) | O(n log n) | O(n^2^) | O(log n) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Bubble Sort | O(n) | O(n^2^) | O(n^2^) | O(1) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) |

## 3. Lists

### Regular List
- First item
- Second item
- Third item

### Task List
- [x] Completed task
- [x] Another completed task
- [ ] Pending task
- [ ] Another pending task

### Mixed List
- **Bold item**
- *Italic item*
- `Code item`
- ==Highlighted item==
- --Shadow item--
- ~~Deleted item~~
- [Link item](https://example.com)

## 4. Images

### Basic Image
![Test image](test.jpg)

### Image with Width
![Avatar](avatar.jpg width=100px)

### Image with Width and Height
![Profile](profile.jpg width=150px height=150px)

### Image with Percentage Width
![Banner](banner.jpg width=100%)

### Image with Class
![Logo](logo.png width=200px class="center")

### Image with Multiple Attributes
![Thumbnail](thumb.jpg width=64px height=64px class="rounded" id="main-thumb")

## 5. Links

[External link](https://github.com)

[Internal link](#section)

[Another page](/about)

## 6. Chemical Formulas

Water: H~2~O

Oxygen: O~2~

Carbon dioxide: CO~2~

Hydrogen peroxide: H~2~O~2~

Sulfuric acid: H~2~SO~4~

Chemical reaction: 2H~2~ + O~2~ → 2H~2~O

## 7. Mathematical Notation

Einstein: E = mc^2^

Pythagorean: a^2^ + b^2^ = c^2^

Exponents: x^n^ where n > 0

Polynomials: ax^3^ + bx^2^ + cx + d

Complex: (x + y)^2^ = x^2^ + 2xy + y^2^

## 8. Mixed Content

The reaction of hydrogen (H~2~) with oxygen (O~2~) releases energy according to E = mc^2^.

### Comparison Table

| Metric | Python | JavaScript | Rust |
|:-------|:------:|:----------:|-----:|
| Speed | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Memory | O(n) | O(n) | O(n) |
| Safety | Medium | Low | ==High== |
| Status | ✓ Active | ✓ Active | ✓ Active |

### Code Examples

Use `npm install` to install packages.

Run `python script.py` to execute.

Press `Ctrl+C` to cancel.

## 9. Project Status

### Completed Features
- [x] Bold and italic
- [x] Strikethrough
- [x] Highlight
- [x] Superscript
- [x] Subscript
- [x] Tables
- [x] Table alignment
- [x] Image attributes
- [x] Task lists

### Pending Features
- [ ] Code blocks
- [ ] Blockquotes
- [ ] Ordered lists

## 10. Horizontal Rules

Above the line.

---

Below the line.

---

## 11. All Together Now

### Research Summary Table

| Experiment | Temp (^°^C) | Concentration | Result | Status |
|:-----------|:-----------:|:-------------:|:------:|-------:|
| Test A | 25^°^C | 0.5M H~2~SO~4~ | **Success** | ✓ |
| Test B | 50^°^C | 1.0M NaCl | ~~Failed~~ | ✗ |
| Test C | 37^°^C | 2.0M H~2~O~2~ | ==Pending== | ⏳ |

**Formula used:** E = mc^2^ where c = 3×10^8^ m/s

**Key reaction:** CH~4~ + 2O~2~ → CO~2~ + 2H~2~O

### Project Checklist

- [x] Setup environment
- [x] Write documentation  
- [x] Implement features
- [ ] Write tests
- [ ] Deploy to production

---

**End of test document**

All features should render correctly!
