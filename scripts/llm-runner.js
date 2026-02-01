"use strict";

/**
 * LLM Runner - Manages WebLLM model loading and inference
 * 
 * This module handles:
 * - Lazy model loading (only load when first chat happens)
 * - Progress tracking during model download
 * - Inference with streaming support
 * - Error handling and recovery
 */

// We'll use WebLLM from CDN for now (easier than bundling)
// Import will be handled in index.html via script tag

class LLMRunner {
  constructor() {
    this.engine = null;
    this.modelId = "Qwen2-0.5B-Instruct-q4f16_1-MLC"; // Qwen 0.5B model
    this.isLoading = false;
    this.isLoaded = false;
    this.loadProgress = 0;
    this.onProgress = null; // Callback for progress updates
  }

  /**
   * Initialize the model (lazy loading)
   * @param {Function} progressCallback - Called with progress updates
   * @returns {Promise<void>}
   */
  async initialize(progressCallback) {
    if (this.isLoaded) return;
    if (this.isLoading) {
      throw new Error("Model is already loading");
    }

    this.isLoading = true;
    this.onProgress = progressCallback;

    try {
      // Check if WebLLM is available
      if (typeof webllm === 'undefined') {
        throw new Error("WebLLM library not loaded. Make sure to include it in index.html");
      }

      // Create engine with progress callback
      this.engine = await webllm.CreateMLCEngine(
        this.modelId,
        {
          initProgressCallback: (progress) => {
            this.loadProgress = progress.progress || 0;
            if (this.onProgress) {
              this.onProgress(progress);
            }
          }
        }
      );

      this.isLoaded = true;
      this.isLoading = false;
      console.log("✅ LLM Engine loaded successfully");
    } catch (error) {
      this.isLoading = false;
      this.isLoaded = false;
      console.error("❌ Failed to load LLM engine:", error);
      throw error;
    }
  }

  /**
   * Generate a chat completion
   * @param {Array} messages - Chat messages in OpenAI format
   * @param {Object} options - Generation options (temperature, max_tokens, etc.)
   * @returns {Promise<Object>} - Response from the model
   */
  async chat(messages, options = {}) {
    if (!this.isLoaded) {
      throw new Error("Model not loaded. Call initialize() first.");
    }

    try {
      const response = await this.engine.chat.completions.create({
        messages,
        temperature: options.temperature || 0.8,
        max_tokens: options.max_tokens || 512,
        stream: false,
        ...options
      });

      return response;
    } catch (error) {
      console.error("❌ Chat completion failed:", error);
      throw error;
    }
  }

  /**
   * Generate a streaming chat completion
   * @param {Array} messages - Chat messages in OpenAI format
   * @param {Object} options - Generation options
   * @returns {AsyncGenerator} - Stream of response chunks
   */
  async* chatStream(messages, options = {}) {
    if (!this.isLoaded) {
      throw new Error("Model not loaded. Call initialize() first.");
    }

    try {
      const chunks = await this.engine.chat.completions.create({
        messages,
        temperature: options.temperature || 0.8,
        max_tokens: options.max_tokens || 512,
        stream: true,
        stream_options: { include_usage: true },
        ...options
      });

      for await (const chunk of chunks) {
        yield chunk;
      }
    } catch (error) {
      console.error("❌ Streaming chat failed:", error);
      throw error;
    }
  }

  /**
   * Get runtime stats
   * @returns {Promise<Object>} - Runtime statistics
   */
  async getRuntimeStats() {
    if (!this.isLoaded) return null;
    return await this.engine.runtimeStatsText();
  }

  /**
   * Reset the conversation state
   */
  async reset() {
    if (this.isLoaded && this.engine) {
      await this.engine.resetChat();
    }
  }

  /**
   * Unload the model to free memory
   */
  async unload() {
    if (this.engine) {
      await this.engine.unload();
      this.isLoaded = false;
      this.engine = null;
      console.log("🔄 LLM Engine unloaded");
    }
  }
}

// Export singleton instance
const llmRunner = new LLMRunner();

// Make it available globally
if (typeof window !== 'undefined') {
  window.llmRunner = llmRunner;
}
