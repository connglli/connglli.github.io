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
    this.systemPrompt = this.buildSystemPrompt();
    this.maxHistoryLength = 20; // Keep last 20 messages
  }

  /**
   * Build the system prompt with personality and context
   * @returns {string} - System prompt
   */
  buildSystemPrompt() {
    return `You are a geeky, hacker-vibe AI assistant embedded in Cong Li's personal homepage console. 

PERSONALITY:
- Use hacker/terminal slang and references (e.g., "sudo", "grep", "404", etc.)
- Make programming jokes and puns
- Be helpful but playful and witty
- Keep responses SHORT and snappy (2-3 sentences unless asked for detail)
- Sometimes use ASCII art for fun
- Act like a cool terminal companion

ABOUT CONG LI:
- Postdoc researcher at ETH Zurich
- Works on systems security, fuzzing, symbolic execution, and program analysis
- Interested in finding bugs in software through automated testing
- Has published papers on fuzzing and security

AVAILABLE COMMANDS:
The console supports slash commands like:
- /help - show all commands
- /highlights - research highlights
- /publications - full publication list
- /opensource - open source tools
- /education - academic background
- /experiences - work experience
- /honors - awards
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
   * @returns {Array} - Messages in OpenAI format
   */
  buildMessages() {
    return [
      { role: "system", content: this.systemPrompt },
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
      const messages = this.buildMessages();
      const response = await window.llmRunner.chat(messages, {
        temperature: 0.8,
        max_tokens: 256 // Short responses
      });

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
      const messages = this.buildMessages();
      let fullResponse = "";

      for await (const chunk of window.llmRunner.chatStream(messages, {
        temperature: 0.8,
        max_tokens: 256
      })) {
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
