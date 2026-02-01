"use strict";

/**
 * Knowledge Base - Extract and serve context from content files
 * 
 * This module:
 * - Parses markdown content files
 * - Extracts key facts and information
 * - Provides relevant context based on queries
 * - Implements a simple RAG-lite system
 */

class KnowledgeBase {
  constructor() {
    this.knowledge = {};
    this.initialized = false;
    this.contentFiles = [
      'home', 'highlights', 'publications', 'opensource', 
      'education', 'experience', 'honors', 'services', 
      'mentoring', 'hobbies'
    ];
  }

  /**
   * Initialize the knowledge base by loading content
   */
  async initialize() {
    if (this.initialized) return;

    console.log("📚 Initializing knowledge base...");
    
    for (const file of this.contentFiles) {
      try {
        const response = await fetch(`content/${file}.md`);
        const text = await response.text();
        this.knowledge[file] = this.parseContent(text, file);
      } catch (error) {
        console.error(`Failed to load ${file}.md:`, error);
      }
    }

    this.initialized = true;
    console.log("✅ Knowledge base initialized with", Object.keys(this.knowledge).length, "files");
  }

  /**
   * Parse markdown content and extract key information
   */
  parseContent(markdown, source) {
    // Remove front matter
    const content = markdown.replace(/^---[\s\S]*?---\n/, '');
    
    // Extract sections
    const sections = [];
    const sectionRegex = /^#{1,3}\s+(.+)$/gm;
    let match;
    let lastIndex = 0;
    
    while ((match = sectionRegex.exec(content)) !== null) {
      if (lastIndex > 0) {
        // Save previous section
        const sectionContent = content.substring(lastIndex, match.index).trim();
        sections.push({
          title: sections[sections.length - 1]?.title || 'intro',
          content: sectionContent
        });
      }
      sections.push({ title: match[1], startIndex: match.index });
      lastIndex = match.index + match[0].length;
    }
    
    // Add last section
    if (lastIndex < content.length) {
      const sectionContent = content.substring(lastIndex).trim();
      if (sections.length > 0) {
        sections[sections.length - 1].content = sectionContent;
      }
    }

    // Extract key facts based on source
    const keyFacts = this.extractKeyFacts(content, source);
    
    return {
      source,
      raw: content,
      sections,
      keyFacts,
      summary: this.generateSummary(content, source)
    };
  }

  /**
   * Extract key facts from content based on source type
   */
  extractKeyFacts(content, source) {
    const facts = [];
    
    switch(source) {
      case 'home':
        // Extract affiliation, position, advisors
        if (content.includes('ETH Zurich')) {
          facts.push("Current: Postdoc at ETH Zurich's Advanced Software Technologies Lab");
        }
        if (content.includes('Zhendong Su')) {
          facts.push("Working with Prof. Zhendong Su");
        }
        if (content.includes('Nanjing University')) {
          facts.push("PhD from Nanjing University (NJU)");
        }
        break;
        
      case 'highlights':
        // Extract awards and key publications
        const bestPaperMatch = content.match(/Best Paper Award.*?(SOSP '23)/);
        if (bestPaperMatch) {
          facts.push("Won Best Paper Award at SOSP '23 for Artemis");
        }
        facts.push("Research in JIT compiler testing, fuzzing, and LLM-assisted development");
        facts.push("Published at SOSP, ASPLOS, ICSE, FSE, ASE");
        break;
        
      case 'publications':
        // Count publications
        const pubMatches = content.match(/^\s*-\s+\*/gm);
        if (pubMatches) {
          facts.push(`${pubMatches.length}+ publications in top conferences`);
        }
        break;
        
      case 'opensource':
        // Extract open source tools
        if (content.includes('Artemis')) {
          facts.push("Created Artemis - JIT compiler testing tool (80+ bugs found)");
        }
        if (content.includes('MetaMut')) {
          facts.push("Created MetaMut - LLM-based mutation testing");
        }
        break;
        
      case 'experience':
        facts.push("Experience at Ant Group, ETH Zurich, Nanjing University");
        break;
        
      default:
        // Generic extraction
        break;
    }
    
    return facts;
  }

  /**
   * Generate a concise summary of the content
   */
  generateSummary(content, source) {
    // Extract first meaningful paragraph
    const paragraphs = content.split('\n\n').filter(p => 
      p.trim().length > 50 && 
      !p.startsWith('#') && 
      !p.startsWith('---') &&
      !p.startsWith('!')
    );
    
    if (paragraphs.length > 0) {
      let summary = paragraphs[0].trim();
      // Remove markdown links
      summary = summary.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
      // Truncate if too long
      if (summary.length > 300) {
        summary = summary.substring(0, 297) + '...';
      }
      return summary;
    }
    
    return 'No summary available';
  }

  /**
   * Find relevant context based on a query
   * @param {string} query - User's query
   * @returns {string} - Relevant context
   */
  getRelevantContext(query) {
    if (!this.initialized) {
      return null;
    }

    const lowerQuery = query.toLowerCase();
    const relevantInfo = [];
    
    // Keyword matching for different topics
    const keywords = {
      research: ['research', 'paper', 'publication', 'work', 'study', 'phd', 'thesis'],
      fuzzing: ['fuzz', 'testing', 'bug', 'artemis', 'metamut', 'compiler'],
      jit: ['jit', 'compiler', 'hotspot', 'openj9', 'graal', 'art', 'vm'],
      llm: ['llm', 'language model', 'gpt', 'ai', 'machine learning'],
      education: ['education', 'degree', 'university', 'phd', 'study', 'school'],
      experience: ['experience', 'work', 'job', 'company', 'position'],
      opensource: ['open source', 'github', 'tool', 'software', 'project'],
      awards: ['award', 'honor', 'achievement', 'prize', 'best paper'],
      personal: ['hobby', 'interest', 'fun', 'life', 'personal']
    };

    // Find matching categories
    const matchedCategories = [];
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerQuery.includes(word))) {
        matchedCategories.push(category);
      }
    }

    // Map categories to content files
    const categoryMap = {
      research: ['highlights', 'publications'],
      fuzzing: ['highlights', 'opensource'],
      jit: ['highlights', 'opensource'],
      llm: ['highlights'],
      education: ['education'],
      experience: ['experience'],
      opensource: ['opensource'],
      awards: ['honors', 'highlights'],
      personal: ['hobbies']
    };

    // Gather relevant content
    const seenFiles = new Set();
    for (const category of matchedCategories) {
      const files = categoryMap[category] || [];
      for (const file of files) {
        if (seenFiles.has(file)) continue;
        seenFiles.add(file);
        
        if (this.knowledge[file]) {
          const info = this.knowledge[file];
          relevantInfo.push(`From /${file}:`);
          
          // Add key facts
          if (info.keyFacts && info.keyFacts.length > 0) {
            relevantInfo.push(...info.keyFacts.map(f => `- ${f}`));
          }
          
          // Add summary if no facts
          if (info.keyFacts.length === 0 && info.summary) {
            relevantInfo.push(`- ${info.summary.substring(0, 200)}`);
          }
        }
      }
    }

    // If no specific match, provide general overview
    if (relevantInfo.length === 0) {
      const home = this.knowledge['home'];
      if (home) {
        relevantInfo.push('General info:');
        relevantInfo.push(...home.keyFacts.map(f => `- ${f}`));
      }
    }

    // Limit context size
    const contextText = relevantInfo.join('\n');
    if (contextText.length > 800) {
      return contextText.substring(0, 797) + '...';
    }
    
    return contextText || null;
  }

  /**
   * Suggest relevant commands based on query
   */
  suggestCommands(query) {
    const lowerQuery = query.toLowerCase();
    const suggestions = [];

    if (/research|paper|publication/.test(lowerQuery)) {
      suggestions.push('/highlights', '/publications');
    }
    if (/tool|software|github|open source/.test(lowerQuery)) {
      suggestions.push('/opensource');
    }
    if (/education|degree|university/.test(lowerQuery)) {
      suggestions.push('/education');
    }
    if (/experience|work|job/.test(lowerQuery)) {
      suggestions.push('/experiences');
    }
    if (/award|honor|achievement/.test(lowerQuery)) {
      suggestions.push('/honors');
    }
    if (/hobby|interest|personal/.test(lowerQuery)) {
      suggestions.push('/hobbies');
    }
    if (/mentor|teach|student/.test(lowerQuery)) {
      suggestions.push('/mentoring');
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }
}

// Create singleton instance
const knowledgeBase = new KnowledgeBase();

// Make it available globally
if (typeof window !== 'undefined') {
  window.knowledgeBase = knowledgeBase;
}
