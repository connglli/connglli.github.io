# Knowledge base

`scripts/knowledge.js` is the retrieval layer behind AI answers. It indexes site content and returns ranked snippets that `scripts/chat.js` appends to the system prompt. Ranking is keyword-based; there are no embeddings and no external services.

## Loading strategy

* Eager: the page names in `markdownFiles` are fetched and indexed during `initialize()`. The `help` page is not indexed.
* Lazy: each entry in `pdfFiles` registers metadata at startup (title from the filename, keywords, source path). `loadPDF()` returns a metadata summary (title, keywords, location, focus terms), not extracted PDF text; text extraction is not implemented.
* Cached: fetched content stays in memory for the session; a reload rebuilds the index.

The index builds when the AI components initialize, which happens on page load when AI is enabled or on `/goldfinger:enableai` otherwise.

## Retrieval pipeline

```text
query ─► lowercase, strip punctuation except hyphens, split on whitespace
      ─► drop tokens shorter than three characters and stop words
      ─► add adjacent-word bigrams
      ─► score files: exact keyword match +2, substring match +1
      ─► rank, take the top 3 files, extract a 500-character snippet from each
      ─► cap the assembled context at 1500 characters
```

The scoring and caps are the defaults of `findRelevantFiles()` and `getRelevantContext()`.

## Registering a PDF

Add an entry to `pdfFiles` in `scripts/knowledge.js`:

```javascript
{ name: 'artemis_sosp23', keywords: ['artemis', 'jit', 'compiler', 'testing', 'fuzzing', 'sosp'] }
```

The `name` must match the file in `pdfs/`. Keywords should cover the paper name, venue, and topic terms a query is likely to use; they drive both ranking and the metadata summary.

## Debugging

In the browser console:

```javascript
knowledgeBase.getStats();
// { initialized, totalFiles, markdownFiles, pdfFiles, totalKeywords, loadedPDFs }
knowledgeBase.findRelevantFiles("compiler fuzzing");
// [{ filename, score }, ...] ranked by score
await knowledgeBase.getRelevantContext("compiler fuzzing");
// the exact context block appended to the system prompt
```

Statistics depend on the current tree; run `getStats()` rather than trusting a snapshot.
