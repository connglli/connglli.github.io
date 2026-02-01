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
  constructor(config = {}) {
    this.engine = null;
    this.modelId = config.modelId || "Qwen3-0.6B-q4f16_1-MLC";
    this.temperature = config.temperature || 0.8;
    this.maxTokens = config.maxTokens || 256;
    this.isLoading = false;
    this.isLoaded = false;
    this.loadProgress = 0;
    this.onProgress = null; // Callback for progress updates
    this.webllmReady = false;
    
    console.log(`🤖 LLMRunner initialized with model: ${this.modelId}`);
    
    // Wait for WebLLM to load
    if (typeof window !== 'undefined') {
      window.addEventListener('webllm-loaded', () => {
        this.webllmReady = true;
        console.log('✅ LLMRunner: WebLLM is ready');
      });
      
      window.addEventListener('webllm-load-failed', () => {
        console.error('❌ LLMRunner: WebLLM failed to load');
      });
    }
  }

  /**
   * Get model display name and size info
   */
  getModelInfo() {
    const modelInfo = {
      "Qwen3-0.6B-q4f16_1-MLC": { name: "Qwen 3 0.6B", size: "~350MB" },
      "Qwen3-1.7B-q4f16_1-MLC": { name: "Qwen 3 1.7B", size: "~1GB" },
      "SmolLM2-360M-Instruct-q4f16_1-MLC": { name: "SmolLM2 360M", size: "~360MB" },
      "SmolLM2-1.7B-Instruct-q4f16_1-MLC": { name: "SmolLM2 1.7B", size: "~1.7GB" },
      "gemma-2-2b-it-q4f16_1-MLC": { name: "Gemma 2 2B", size: "~1.3GB" }
    };
    return modelInfo[this.modelId] || { name: this.modelId, size: "unknown" };
  }

  /**
   * Wait for WebLLM library to be loaded
   */
  async waitForWebLLM() {
    if (this.webllmReady) return;
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("WebLLM library failed to load within timeout"));
      }, 30000); // 30 second timeout
      
      window.addEventListener('webllm-loaded', () => {
        clearTimeout(timeout);
        this.webllmReady = true;
        resolve();
      }, { once: true });
      
      window.addEventListener('webllm-load-failed', () => {
        clearTimeout(timeout);
        reject(new Error("WebLLM library failed to load"));
      }, { once: true });
    });
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
      // Wait for WebLLM library to be loaded
      await this.waitForWebLLM();
      
      // Check if WebLLM is available
      if (typeof window.webllm === 'undefined') {
        throw new Error("WebLLM library not loaded. Make sure to include it in index.html");
      }

      // Create engine with progress callback
      this.engine = await window.webllm.CreateMLCEngine(
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
        temperature: options.temperature ?? this.temperature,
        max_tokens: options.max_tokens ?? this.maxTokens,
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
        temperature: options.temperature ?? this.temperature,
        max_tokens: options.max_tokens ?? this.maxTokens,
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

// Make the class available globally (will be instantiated in console.js with config)
if (typeof window !== 'undefined') {
  window.LLMRunner = LLMRunner;
}
