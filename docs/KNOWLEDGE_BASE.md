# Knowledge Base v2 - Design Documentation

## Overview

The Knowledge Base provides intelligent context injection for the AI assistant by indexing content and dynamically retrieving relevant information based on user queries.

## Architecture

### Components

1. **Keyword Index**: Token/keyword → Set of file references
2. **File Cache**: Filename → File metadata and content
3. **PDF Cache**: Filename → Lazy-loaded PDF text
4. **Query Engine**: Finds relevant files and extracts snippets

### Loading Strategy

- **Eager Loading**: All markdown files (`.md`) are loaded and indexed at startup
- **Lazy Loading**: PDFs are only loaded when their keywords match a query
- **Caching**: Once loaded, content is cached in memory

## File Types

### Markdown Files (Eager Load)

Located in `content/`:
- `home.md` - About Cong
- `highlights.md` - Research highlights
- `publications.md` - Publication list
- `opensource.md` - Open source tools
- `education.md` - Academic background
- `experience.md` - Work experience
- `honors.md` - Awards and honors
- `services.md` - Community service
- `mentoring.md` - Teaching and mentoring
- `hobbies.md` - Personal interests

### PDF Files (Lazy Load)

Located in `pdfs/`:
- Research papers with predefined keyword sets
- Only loaded when query matches keywords
- Examples:
  - `artemis_sosp23.pdf` → keywords: artemis, jit, compiler, testing, sosp
  - `metamut_asplos24.pdf` → keywords: metamut, mutation, testing, llm, asplos
  - `llmorch_tse25.pdf` → keywords: llm, orchestration, software, engineering, tse

## How It Works

### 1. Initialization

```javascript
await knowledgeBase.initialize();
```

- Loads all markdown files from `content/`
- Extracts keywords from each file
- Builds keyword index (token → files map)
- Registers PDF metadata (but doesn't load content)

### 2. Query Processing

```javascript
const context = await knowledgeBase.getRelevantContext(userQuery);
```

**Steps:**
1. Extract keywords from user query
2. Find matching files using keyword index
3. Rank files by relevance score
4. Load content (lazy load PDFs if needed)
5. Extract relevant snippets from top files
6. Format and return context string

### 3. Context Injection

```javascript
// In chat.js
const systemPrompt = await buildSystemPrompt(userMessage);
// systemPrompt now includes: "RELEVANT CONTEXT FROM KNOWLEDGE BASE:\n..."
```

The context is automatically injected into the AI's system prompt.

## Keyword Extraction

### Tokenization

1. Convert text to lowercase
2. Remove punctuation (keep hyphens)
3. Split on whitespace
4. Filter tokens shorter than 3 characters
5. Remove common stop words

### Stop Words

Common words filtered out:
- Articles: the, a, an
- Conjunctions: and, but, or
- Prepositions: for, with, from, into
- Auxiliaries: are, was, were, has, had

### Bigrams

Two-word phrases are also extracted:
- "jit compiler"
- "fuzzing tool"
- "best paper"

## Relevance Scoring

Files are scored based on keyword matches:

- **Exact match**: +2 points
- **Partial match** (fuzzy): +1 point

Files are ranked by score (descending).

## Context Extraction

For each relevant file:

1. **Sentence Scoring**: Each sentence is scored based on:
   - Number of query keywords present (+2 per keyword)
   - Position in document (earlier = higher score)

2. **Snippet Building**: Top-scoring sentences are combined into a snippet

3. **Length Control**: Snippets are truncated to fit context limits

## Configuration

### Limits

```javascript
await getRelevantContext(query, maxFiles = 3, maxChars = 1500)
```

- `maxFiles`: Maximum number of files to include (default: 3)
- `maxChars`: Maximum total context length (default: 1500 chars)

### PDF Keywords

PDFs are registered with predefined keywords in `knowledge.js`:

```javascript
{ 
  name: 'artemis_sosp23', 
  keywords: ['artemis', 'jit', 'compiler', 'testing', 'fuzzing', 'hotspot', 'openj9', 'graal', 'art', 'sosp', 'best paper'] 
}
```

**To add a new PDF:**

1. Place PDF in `pdfs/` directory
2. Add entry to `pdfFiles` array in `knowledge.js`
3. Define relevant keywords

## Usage Examples

### Example 1: Query about Fuzzing

**Query**: "Tell me about Cong's fuzzing work"

**Keywords extracted**: fuzzing, cong, work

**Files matched**:
1. `highlights.md` (score: 4)
2. `opensource.md` (score: 3)
3. `artemis_sosp23` (score: 2)

**Context injected**:
```
[Source: Research Highlights]
Cong works on compiler testing and fuzzing. His tool Artemis found 80+ bugs in production JIT compilers...

---

[Source: Open Source Tools]
Artemis is a JIT compiler testing tool that uses differential testing to find bugs...
```

### Example 2: Query about LLMs

**Query**: "What research has Cong done with LLMs?"

**Keywords extracted**: research, cong, llms

**Files matched**:
1. `highlights.md` (score: 3)
2. `llmorch_tse25` (score: 2) ← **PDF lazy loaded!**
3. `hqcm_ase24` (score: 2)

**Context injected**:
```
[Source: Research Highlights]
Recent work on LLM orchestration for software engineering tasks...

---

[Source: LLM Orchestration (TSE'25)]
PDF: LLM Orchestration
Keywords: llm, orchestration, software, engineering, tse, agent
...
```

## Statistics

Check knowledge base status:

```javascript
knowledgeBase.getStats()
// Returns:
{
  initialized: true,
  totalFiles: 19,
  markdownFiles: 10,
  pdfFiles: 9,
  totalKeywords: 1247,
  loadedPDFs: 2
}
```

## Performance

- **Initialization**: ~500ms (loads 10 markdown files)
- **Query**: ~50ms (keyword lookup + ranking)
- **Lazy PDF load**: ~100ms per PDF (first time only)
- **Memory**: ~2-3MB for all markdown + loaded PDFs

## Future Enhancements

### Possible Improvements

1. **PDF.js Integration**: Extract actual text from PDFs instead of metadata
2. **Semantic Search**: Use embeddings for better relevance matching
3. **Caching**: Store processed PDFs in localStorage
4. **Incremental Loading**: Load PDFs in background after initialization
5. **User Feedback**: Learn from which contexts were most helpful
6. **Multi-language**: Support Chinese content

### PDF.js Integration

To add full PDF text extraction:

```javascript
// In loadPDF():
const pdf = await pdfjsLib.getDocument(`pdfs/${filename}.pdf`).promise;
let fullText = '';

for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const textContent = await page.getTextContent();
  const pageText = textContent.items.map(item => item.str).join(' ');
  fullText += pageText + '\n';
}

return fullText;
```

## Debugging

### Enable Debug Logging

```javascript
// In console
knowledgeBase.getStats()
// See statistics

knowledgeBase.findRelevantFiles("your query")
// See ranked file list with scores

await knowledgeBase.getRelevantContext("your query")
// See actual context returned
```

### Common Issues

**Issue**: "Knowledge base not initialized"
- **Fix**: Ensure `initialize()` is called on page load

**Issue**: Context is too generic
- **Fix**: Add more specific keywords to PDF metadata

**Issue**: PDFs not loading
- **Fix**: Check PDF filenames match entries in `pdfFiles` array

**Issue**: No context for query
- **Fix**: Check if query keywords match indexed keywords

## Summary

The Knowledge Base v2 provides:

✅ **Intelligent context retrieval** based on keyword matching  
✅ **Lazy PDF loading** for efficiency  
✅ **Automatic snippet extraction** from relevant content  
✅ **Scalable architecture** (easy to add more files)  
✅ **Fast query response** (<100ms typical)  
✅ **Memory efficient** (only loads what's needed)  

This enables the AI assistant to give more accurate, contextual answers about Cong's research!
