"use strict";

/**
 * Knowledge Base v2 - Keyword-based indexing with lazy PDF loading
 * 
 * Architecture:
 * - Token/keyword database mapping to files (markdown + PDFs)
 * - Eager loading: All markdown content indexed at startup
 * - Lazy loading: PDFs loaded only when relevant keywords match
 * - Context injection: Search for relevant files and embed into LLM prompt
 * 
 * Usage:
 * 1. Initialize at startup: knowledgeBase.initialize()
 * 2. Query context: knowledgeBase.getRelevantContext(userQuery)
 * 3. Context is automatically injected into AI prompt
 */

class KnowledgeBase {
  constructor() {
    // Keyword index: token -> Set of file references
    this.keywordIndex = new Map();
    
    // File cache: filename -> { type, content, keywords, metadata }
    this.fileCache = new Map();
    
    // PDF cache: filename -> { loaded: bool, text: string }
    this.pdfCache = new Map();
    
    this.initialized = false;
    
    // Markdown content files (loaded eagerly)
    this.markdownFiles = [
      'home', 'highlights', 'publications', 'opensource', 
      'education', 'experience', 'honors', 'services', 
      'mentoring', 'hobbies'
    ];
    
    // PDF papers (loaded lazily when keywords match)
    this.pdfFiles = [
      { name: 'artemis_sosp23', keywords: ['artemis', 'jit', 'compiler', 'testing', 'fuzzing', 'hotspot', 'openj9', 'graal', 'art', 'sosp', 'best paper'] },
      { name: 'csx_tocs25', keywords: ['csx', 'compiler', 'bug', 'report', 'tocs', 'oracle'] },
      { name: 'elegant_apsec18', keywords: ['elegant', 'duplicate', 'bug', 'report', 'apsec'] },
      { name: 'hqcm_ase24', keywords: ['hqcm', 'quality', 'commit', 'message', 'ase', 'llm'] },
      { name: 'jigsaw_icse22', keywords: ['jigsaw', 'slice', 'oracle', 'differential', 'testing', 'icse'] },
      { name: 'llmorch_tse25', keywords: ['llm', 'orchestration', 'software', 'engineering', 'tse', 'agent'] },
      { name: 'metamut_asplos24', keywords: ['metamut', 'mutation', 'testing', 'llm', 'asplos', 'test', 'quality'] },
      { name: 'rnrsurvey_jos22', keywords: ['survey', 'record', 'replay', 'determinism', 'jos'] },
      { name: 'rx_esecfse22', keywords: ['rx', 'record', 'replay', 'concurrency', 'fse', 'esec'] }
    ];
  }

  /**
   * Initialize the knowledge base by loading and indexing all markdown files
   */
  async initialize() {
    if (this.initialized) return;

    console.log("📚 Initializing knowledge base v2...");
    
    // Load all markdown files
    for (const file of this.markdownFiles) {
      try {
        const response = await fetch(`content/${file}.md`);
        const text = await response.text();
        await this.indexMarkdownFile(file, text);
      } catch (error) {
        console.error(`Failed to load ${file}.md:`, error);
      }
    }
    
    // Register PDF metadata (but don't load content yet)
    for (const pdf of this.pdfFiles) {
      this.registerPDFMetadata(pdf.name, pdf.keywords);
    }

    this.initialized = true;
    console.log(`✅ Knowledge base initialized:`);
    console.log(`   - ${this.fileCache.size} files indexed`);
    console.log(`   - ${this.keywordIndex.size} unique keywords`);
    console.log(`   - ${this.pdfFiles.length} PDFs registered (lazy load)`);
  }

  /**
   * Index a markdown file: extract keywords and store content
   */
  async indexMarkdownFile(filename, content) {
    // Remove front matter
    content = content.replace(/^---[\s\S]*?---\n/, '');
    
    // Extract keywords from content
    const keywords = this.extractKeywords(content);
    
    // Extract title from content or use filename
    const extractedTitle = this.extractTitle(content);
    const title = extractedTitle || this.filenameToTitle(filename);
    
    // Store in file cache
    this.fileCache.set(filename, {
      type: 'markdown',
      content: content,
      keywords: keywords,
      metadata: {
        source: `content/${filename}.md`,
        title: title
      }
    });
    
    // Update keyword index
    for (const keyword of keywords) {
      if (!this.keywordIndex.has(keyword)) {
        this.keywordIndex.set(keyword, new Set());
      }
      this.keywordIndex.get(keyword).add(filename);
    }
  }

  /**
   * Register PDF metadata without loading the full content
   */
  registerPDFMetadata(filename, keywords) {
    // Store minimal metadata
    this.fileCache.set(filename, {
      type: 'pdf',
      content: null, // Lazy load
      keywords: keywords,
      metadata: {
        source: `pdfs/${filename}.pdf`,
        title: this.pdfNameToTitle(filename)
      }
    });
    
    // Update keyword index
    for (const keyword of keywords) {
      if (!this.keywordIndex.has(keyword)) {
        this.keywordIndex.set(keyword, new Set());
      }
      this.keywordIndex.get(keyword).add(filename);
    }
    
    // Mark as not loaded yet
    this.pdfCache.set(filename, { loaded: false, text: null });
  }

  /**
   * Extract keywords from text content
   * Uses simple tokenization and filtering
   */
  extractKeywords(text) {
    // Convert to lowercase and tokenize
    const tokens = text.toLowerCase()
      .replace(/[^\w\s-]/g, ' ') // Remove punctuation except hyphens
      .split(/\s+/)
      .filter(token => token.length > 2); // Filter short tokens
    
    // Remove common stop words
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 
      'were', 'been', 'have', 'has', 'had', 'but', 'not', 'can', 'will',
      'about', 'also', 'into', 'through', 'our', 'their', 'such', 'which',
      'when', 'where', 'who', 'how', 'what', 'more', 'than', 'some', 'all'
    ]);
    
    // Extract unique keywords
    const keywords = new Set();
    for (const token of tokens) {
      if (!stopWords.has(token) && token.length > 2) {
        keywords.add(token);
      }
    }
    
    // Also extract multi-word phrases (bigrams)
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (bigram.length > 5 && !stopWords.has(words[i]) && !stopWords.has(words[i + 1])) {
        keywords.add(bigram);
      }
    }
    
    return Array.from(keywords);
  }

  /**
   * Extract title from markdown content
   */
  extractTitle(content) {
    // Try to match # or ## or ### headers
    const match = content.match(/^#{1,3}\s+(.+)$/m);
    return match ? match[1] : null;
  }
  
  /**
   * Get friendly title from filename
   */
  filenameToTitle(filename) {
    const titleMap = {
      'home': 'About Cong Li',
      'highlights': 'Research Highlights',
      'publications': 'Publications',
      'opensource': 'Open Source Tools',
      'education': 'Education',
      'experience': 'Work Experience',
      'honors': 'Honors & Awards',
      'services': 'Community Services',
      'mentoring': 'Teaching & Mentoring',
      'hobbies': 'Hobbies & Interests'
    };
    
    return titleMap[filename] || filename.charAt(0).toUpperCase() + filename.slice(1);
  }

  /**
   * Convert PDF filename to readable title
   */
  pdfNameToTitle(filename) {
    // artemis_sosp23 -> Artemis (SOSP'23)
    const parts = filename.split('_');
    if (parts.length >= 2) {
      const name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const venue = parts[1].replace(/\d+/, (m) => `'${m.slice(-2)}`).toUpperCase();
      return `${name} (${venue})`;
    }
    return filename;
  }

  /**
   * Lazily load PDF content when needed
   * Note: PDF.js would be ideal here, but for now we return metadata
   */
  async loadPDF(filename) {
    const cached = this.pdfCache.get(filename);
    if (cached && cached.loaded) {
      return cached.text;
    }
    
    // In a real implementation, you'd use PDF.js here:
    // const pdf = await pdfjsLib.getDocument(`pdfs/${filename}.pdf`).promise;
    // Extract text from all pages...
    
    // For now, return a placeholder with rich metadata
    const fileInfo = this.fileCache.get(filename);
    const metadata = `
PDF: ${fileInfo.metadata.title}
Keywords: ${fileInfo.keywords.join(', ')}
Location: ${fileInfo.metadata.source}

Note: This is a research paper. For detailed content, the user should view the PDF directly.
The paper focuses on: ${fileInfo.keywords.slice(0, 5).join(', ')}.
    `.trim();
    
    this.pdfCache.set(filename, { loaded: true, text: metadata });
    return metadata;
  }

  /**
   * Find relevant files based on query keywords
   * Returns ranked list of files with relevance scores
   */
  findRelevantFiles(query) {
    const queryKeywords = this.extractKeywords(query);
    const fileScores = new Map(); // filename -> score
    
    // Score each file based on keyword matches
    for (const keyword of queryKeywords) {
      // Exact match
      if (this.keywordIndex.has(keyword)) {
        for (const filename of this.keywordIndex.get(keyword)) {
          fileScores.set(filename, (fileScores.get(filename) || 0) + 2);
        }
      }
      
      // Partial match (fuzzy)
      for (const [indexedKeyword, files] of this.keywordIndex.entries()) {
        if (indexedKeyword.includes(keyword) || keyword.includes(indexedKeyword)) {
          for (const filename of files) {
            fileScores.set(filename, (fileScores.get(filename) || 0) + 1);
          }
        }
      }
    }
    
    // Sort by score (descending)
    const rankedFiles = Array.from(fileScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([filename, score]) => ({ filename, score }));
    
    return rankedFiles;
  }

  /**
   * Get relevant context for a user query
   * Returns formatted context string to inject into LLM prompt
   */
  async getRelevantContext(query, maxFiles = 3, maxChars = 1500) {
    if (!this.initialized) {
      console.warn("Knowledge base not initialized");
      return null;
    }
    
    const rankedFiles = this.findRelevantFiles(query);
    
    if (rankedFiles.length === 0) {
      return null;
    }
    
    const contextParts = [];
    let totalChars = 0;
    
    // Gather context from top ranked files
    for (const { filename, score } of rankedFiles.slice(0, maxFiles)) {
      if (totalChars >= maxChars) break;
      
      const fileInfo = this.fileCache.get(filename);
      if (!fileInfo) continue;
      
      let content = fileInfo.content;
      
      // Lazy load PDF if needed
      if (fileInfo.type === 'pdf' && !content) {
        content = await this.loadPDF(filename);
        fileInfo.content = content; // Cache it
      }
      
      // Extract relevant snippet
      const snippet = this.extractRelevantSnippet(content, query, 500);
      
      // Format context
      const contextBlock = `
[Source: ${fileInfo.metadata.title}]
${snippet}
`.trim();
      
      const blockLength = contextBlock.length;
      if (totalChars + blockLength > maxChars) {
        // Truncate to fit
        const remaining = maxChars - totalChars;
        if (remaining > 100) {
          contextParts.push(contextBlock.substring(0, remaining - 3) + '...');
        }
        break;
      }
      
      contextParts.push(contextBlock);
      totalChars += blockLength;
    }
    
    if (contextParts.length === 0) {
      return null;
    }
    
    return contextParts.join('\n\n---\n\n');
  }

  /**
   * Extract most relevant snippet from content based on query
   */
  extractRelevantSnippet(content, query, maxLength = 500) {
    if (!content) return '';
    
    const queryKeywords = this.extractKeywords(query);
    const sentences = content.split(/[.!?]\s+/);
    
    // Score each sentence based on keyword presence
    const scoredSentences = sentences.map((sentence, index) => {
      const lowerSentence = sentence.toLowerCase();
      let score = 0;
      
      for (const keyword of queryKeywords) {
        if (lowerSentence.includes(keyword)) {
          score += 2;
        }
      }
      
      // Bonus for being near the beginning
      score += Math.max(0, 10 - index) * 0.5;
      
      return { sentence, score, index };
    });
    
    // Sort by score and take top sentences
    scoredSentences.sort((a, b) => b.score - a.score);
    
    // Combine top sentences up to maxLength
    let snippet = '';
    const addedIndices = new Set();
    
    for (const { sentence, index } of scoredSentences) {
      if (snippet.length + sentence.length > maxLength) break;
      if (addedIndices.has(index)) continue;
      
      addedIndices.add(index);
      snippet += sentence.trim() + '. ';
    }
    
    // If snippet is still too long, truncate
    if (snippet.length > maxLength) {
      snippet = snippet.substring(0, maxLength - 3) + '...';
    }
    
    return snippet.trim() || content.substring(0, maxLength);
  }

  /**
   * Suggest relevant commands based on query
   */
  suggestCommands(query) {
    const rankedFiles = this.findRelevantFiles(query);
    const suggestions = new Set();
    
    // Map markdown filenames to commands
    const commandMap = {
      'highlights': '/highlights',
      'publications': '/publications',
      'opensource': '/opensourcetools',
      'education': '/education',
      'experience': '/experiences',
      'honors': '/honors',
      'services': '/services',
      'mentoring': '/mentoring',
      'hobbies': '/hobbies'
    };
    
    for (const { filename } of rankedFiles.slice(0, 3)) {
      if (commandMap[filename]) {
        suggestions.add(commandMap[filename]);
      }
    }
    
    return Array.from(suggestions);
  }

  /**
   * Debug: Get statistics about the knowledge base
   */
  getStats() {
    return {
      initialized: this.initialized,
      totalFiles: this.fileCache.size,
      markdownFiles: Array.from(this.fileCache.values()).filter(f => f.type === 'markdown').length,
      pdfFiles: Array.from(this.fileCache.values()).filter(f => f.type === 'pdf').length,
      totalKeywords: this.keywordIndex.size,
      loadedPDFs: Array.from(this.pdfCache.values()).filter(p => p.loaded).length
    };
  }
}

// Create singleton instance
const knowledgeBase = new KnowledgeBase();

// Make it available globally
if (typeof window !== 'undefined') {
  window.knowledgeBase = knowledgeBase;
}
