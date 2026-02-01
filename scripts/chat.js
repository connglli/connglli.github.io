"use strict";

/**
 * Chat Module - Orchestrates conversations with the LLM
 * 
 * Handles:
 * - Message history management
 * - System prompt injection
 * - Response generation
 * - Integration with UI
 */

class ChatManager {
  constructor() {
    this.messages = [];
    this.maxHistoryLength = 20; // Keep last 20 messages
  }

  /**
   * Build system prompt with context from knowledge base
   * @param {string} userMessage - Optional user message for context-aware prompt
   * @returns {Promise<string>} - System prompt with context
   */
  async buildSystemPrompt(userMessage = "") {
    const aiName = window.aiName || 'Pico';
    let contextInfo = "";
    
    // Get current page context if available (user is viewing a specific page)
    if (window.currentPageContext && window.currentPageContext.content) {
      const pageContext = window.currentPageContext;
      const timeSinceLoad = Date.now() - (pageContext.timestamp || 0);
      
      // Only include if page was loaded recently (within 10 minutes)
      if (timeSinceLoad < 600000) {
        contextInfo += `\n\nCURRENT PAGE CONTEXT:\n==============BEGIN PAGE CONTEXT==============\nThe user is currently viewing: /${pageContext.command} (${pageContext.title})\n\nPage content:\n${pageContext.content.substring(0, 2000)}\n`;
        if (pageContext.content.length > 2000) {
          contextInfo += "\n[Content truncated - full content available via slash command]\n";
        }
        contextInfo += "==============END PAGE CONTEXT==============\n";
      }
    }
    
    // Get relevant context from knowledge base if available (async now!)
    if (userMessage && window.knowledgeBase && window.knowledgeBase.initialized) {
      const relevantContext = await window.knowledgeBase.getRelevantContext(userMessage);
      if (relevantContext) {
        contextInfo += `\n\nRELEVANT CONTEXT FROM KNOWLEDGE BASE:\n==============BEGIN KNOWLEDGE CONTEXT==============\n${relevantContext}\n==============END KNOWLEDGE CONTEXT==============\n`;
      }
    }
    
    return `You are ${aiName}, a geeky, hacker-vibe AI assistant embedded in Cong Li's personal homepage console.

PERSONALITY:
- Use hacker/terminal slang and references (e.g., "sudo", "grep", "404", etc.)
- Make programming jokes and puns
- Be helpful but playful and witty
- Keep responses SHORT and snappy (2-3 sentences unless asked for detail)
- Sometimes use ASCII art for fun
- Act like a cool terminal companion

ABOUT CONG LI:
- Postdoc researcher at ETH Zurich
- PhD from Nanjing University, China
- Male, Chinese, late 90s birth
- Works on compilers and language virtual machines
- Interested in LLMs for compiler optimization and fuzzing
- Has published papers on systems and software engineering${contextInfo}

AVAILABLE COMMANDS:
The console supports slash commands like:
- /help - show all commands
- /highlights - research highlights
- /publications - full publication list
- /opensourcetools - open source tools
- /education - academic background
- /experiences - work experience
- /honors - honors and awards
- /services - community work
- /mentoring - teaching and mentoring
- /hobbies - personal interests
- /clear - clear the console

YOUR ROLE:
- Help visitors explore Cong's work in a fun way
- Suggest relevant commands based on questions
- Answer questions about Cong's research casually
- Keep it entertaining and engaging
- Drop hints about easter eggs
- NEVER execute commands yourself, only suggest them

Remember: Keep it short, geeky, and fun! 🤓`;
  }

  /**
   * Get command suggestions for a query
   * @param {string} query - User query
   * @returns {Array} - Suggested commands
   */
  getCommandSuggestions(query) {
    if (window.knowledgeBase && window.knowledgeBase.initialized) {
      return window.knowledgeBase.suggestCommands(query);
    }
    return [];
  }

  /**
   * Add a user message to history
   * @param {string} content - User message
   */
  addUserMessage(content) {
    this.messages.push({
      role: "user",
      content: content
    });
    this.trimHistory();
  }

  /**
   * Add an assistant message to history
   * @param {string} content - Assistant message
   */
  addAssistantMessage(content) {
    this.messages.push({
      role: "assistant",
      content: content
    });
    this.trimHistory();
  }

  /**
   * Trim history to max length
   */
  trimHistory() {
    // Keep system message + last N messages
    if (this.messages.length > this.maxHistoryLength) {
      this.messages = this.messages.slice(-this.maxHistoryLength);
    }
  }

  /**
   * Build messages array for LLM with system prompt
   * @param {string} userMessage - Current user message for context
   * @returns {Promise<Array>} - Messages in OpenAI format
   */
  async buildMessages(userMessage = "") {
    const systemPrompt = await this.buildSystemPrompt(userMessage);
    return [
      { role: "system", content: systemPrompt },
      ...this.messages
    ];
  }

  /**
   * Generate a response (non-streaming)
   * @param {string} userMessage - User's message
   * @returns {Promise<string>} - AI response
   */
  async generateResponse(userMessage) {
    this.addUserMessage(userMessage);

    try {
      const messages = await this.buildMessages(userMessage);
      // Use default config values from llmRunner
      const response = await window.llmRunner.chat(messages);

      const content = response.choices[0].message.content;
      this.addAssistantMessage(content);
      return content;
    } catch (error) {
      console.error("Failed to generate response:", error);
      throw error;
    }
  }

  /**
   * Generate a streaming response
   * @param {string} userMessage - User's message
   * @returns {AsyncGenerator<string>} - Stream of response chunks
   */
  async* generateStreamingResponse(userMessage) {
    this.addUserMessage(userMessage);

    try {
      const messages = await this.buildMessages(userMessage);
      let fullResponse = "";

      // Use default config values from llmRunner
      for await (const chunk of window.llmRunner.chatStream(messages)) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          fullResponse += delta;
          yield delta;
        }
      }

      this.addAssistantMessage(fullResponse);
    } catch (error) {
      console.error("Failed to generate streaming response:", error);
      throw error;
    }
  }

  /**
   * Reset conversation history
   */
  reset() {
    this.messages = [];
    if (window.llmRunner && window.llmRunner.isLoaded) {
      window.llmRunner.reset();
    }
  }

  /**
   * Get conversation history
   * @returns {Array} - Message history
   */
  getHistory() {
    return [...this.messages];
  }
}

// Export singleton instance
const chatManager = new ChatManager();

// Make it available globally
if (typeof window !== 'undefined') {
  window.chatManager = chatManager;
}
