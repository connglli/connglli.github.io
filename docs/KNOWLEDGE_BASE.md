# Knowledge Base System Documentation

Design specification for `scripts/knowledge.js` (RAG-lite document retrieval engine).

## Overview

The Knowledge Base dynamically retrieves relevant document snippets from site content and injects them into the AI system prompt for context-aware responses.

## Loading Strategy

- **Eager Loading**: All Markdown files (`content/*.md`) are fetched, tokenized, and indexed at application startup.
- **Lazy Loading**: Research paper PDFs (`pdfs/*.pdf`) are registered as metadata and loaded only when user query keywords match their associated keyword map.
- **Caching**: Fetched text content is cached in memory for subsequent queries.

## Retrieval Pipeline

```text
User Query ──► Tokenization & Normalization
            ──► Stop word removal & Bigram generation
            ──► Keyword index lookup
            ──► Score ranking (Exact match: +2, Partial match: +1)
            ──► Snippet extraction & length truncation (Default max: 1500 chars)
            ──► Injected into AI System Prompt
```

## Registering PDF Metadata

PDF papers are registered in `scripts/knowledge.js`:

```javascript
{
  name: 'artemis_sosp23',
  keywords: ['artemis', 'jit', 'compiler', 'testing', 'fuzzing', 'sosp']
}
```

### Adding New PDFs
1. Place PDF file in `pdfs/`.
2. Add metadata record to `pdfFiles` array in `scripts/knowledge.js`.

## API & Debugging

Execute in browser developer console:

```javascript
// View index stats
knowledgeBase.getStats();
// Returns: { totalFiles: 19, markdownFiles: 10, pdfFiles: 9, totalKeywords: 1247, loadedPDFs: 1 }

// Inspect ranked matches for query
knowledgeBase.findRelevantFiles("compiler fuzzing");

// Preview generated prompt context
await knowledgeBase.getRelevantContext("compiler fuzzing");
```
