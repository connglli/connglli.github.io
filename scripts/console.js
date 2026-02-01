"use strict";

// ============================================================================
// Utilities
// ============================================================================

function $(sel) {
  return document.querySelector(sel);
}

function nowIsoDate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function createLine(text, className) {
  const el = document.createElement("div");
  el.className = className ? `line ${className}` : "line";
  el.textContent = text;
  return el;
}

function createHtmlBlock(html, className) {
  const el = document.createElement("div");
  el.className = className ? `block ${className}` : "block";
  el.innerHTML = html;
  return el;
}

function scrollToBottom(outputEl) {
  outputEl.scrollTop = outputEl.scrollHeight;
}

function normalizeCommand(raw) {
  const s = raw.trim();
  if (!s) return { name: "", args: [] };
  const tokens = s.split(/\s+/g);
  const cmd = tokens[0];
  const args = tokens.slice(1);
  const name = cmd.startsWith("/") ? cmd.slice(1) : cmd;
  return { name: name.toLowerCase(), args };
}

function setRoute(name) {
  const clean = name ? `#/${encodeURIComponent(name)}` : "#/";
  if (window.location.hash !== clean) window.location.hash = clean;
}

function parseRoute() {
  const h = window.location.hash || "";
  const m = h.match(/^#\/(.*)$/);
  if (!m) return "";
  return decodeURIComponent(m[1] || "").toLowerCase();
}

// ============================================================================
// Template Renderer
// ============================================================================

function renderTemplate(template, data, html) {
  console.log("Rendering template:", template, data);
  if (template === "intro") {
    return renderIntroTemplate(data, html);
  }
  return renderDefaultTemplate(html);
}

function renderDefaultTemplate(html) {
  return html;
}

function renderIntroTemplate(data, html) {
  const photo = data.photo || "";
  const email = data.email || "";
  const address = data.address || "";
  const links = data.links || [];

  const linksHtml = links.map(l => 
    `<a href="${l.url}" target="_blank" rel="noopener">${l.text}</a>`
  ).join(" · ");

  const kvs = `
    <div class="kvs">
      <div class="k">Email</div><div class="v">${email}</div>
      <div class="k">Address</div><div class="v">${address}</div>
      <div class="k">Links</div><div class="v">${linksHtml}</div>
    </div>
  `;

  const avatar = photo ? `
    <div class="intro-right" aria-hidden="true">
      <img class="avatar" src="${photo}" alt="">
    </div>
  ` : "";

  const updatedNote = `<p class="muted">Updated: ${nowIsoDate()}</p>`;

  return `
    <div class="intro">
      <div class="intro-left">
        ${html}
        <div class="sep"></div>
        ${kvs}
        ${updatedNote}
      </div>
      ${avatar}
    </div>
  `;
}

// ============================================================================
// Config & Content Loader
// ============================================================================

async function loadConfig() {
  try {
    const resp = await fetch("console.config.yaml");
    if (!resp.ok) {
      throw new Error(`Failed to load config: ${resp.status} ${resp.statusText}`);
    }
    const text = await resp.text();
    const parsed = parseYAML(text);
    console.log("Config loaded successfully:", parsed);
    return parsed;
  } catch (error) {
    console.error("Error loading config:", error);
    throw error;
  }
}

async function loadMarkdown(path) {
  try {
    const resp = await fetch(path);
    if (!resp.ok) {
      throw new Error(`Failed to load ${path}: ${resp.status} ${resp.statusText}`);
    }
    const text = await resp.text();
    return text;
  } catch (error) {
    console.error("Error loading markdown:", error);
    throw error;
  }
}

// ============================================================================
// Console Application
// ============================================================================

async function main() {
  try {
    const config = await loadConfig();
    const output = $("#output");
    const input = $("#cmd");
    const form = $("#cmdform");
    const title = $("#title");
    const hint = $("#hint");

    const history = [];
    let historyIdx = -1;

  // Build command lookup maps
  const commandMap = {}; // alias -> command
  const commandDefs = {}; // name -> command def

  config.commands.forEach(cmd => {
    commandDefs[cmd.name] = cmd;
    commandMap[cmd.name] = cmd;
    (cmd.aliases || []).forEach(alias => {
      commandMap[alias] = cmd;
    });
  });

  // Add built-in commands (hardcoded, no config needed)
  commandMap['clear'] = { name: 'clear', builtin: true };
  commandMap['cls'] = { name: 'cls', builtin: true };

  // Initialize LLM Runner with config settings
  const aiConfig = config.ai || {};
  let aiEnabled = aiConfig.enabled !== false; // Default to true if not specified
  
  // Function to initialize AI components (can be called on-demand)
  function initializeAI() {
    console.log("initializeAI() called");
    console.log("window.LLMRunner exists?", typeof window.LLMRunner !== 'undefined');
    console.log("window.llmRunner exists?", !!window.llmRunner);
    console.log("window.webllm exists?", typeof window.webllm !== 'undefined');
    
    // Check if LLMRunner class is available
    if (typeof window.LLMRunner === 'undefined') {
      console.error("LLMRunner class not loaded! Make sure llm-runner.js is included.");
      return false;
    }
    
    if (!window.llmRunner) {
      console.log("Creating new LLMRunner instance...");
      console.log("WebLLM status:", window.webllm ? "loaded" : "loading...");
      
      window.llmRunner = new window.LLMRunner({
        modelId: aiConfig.model || "Qwen2-0.5B-Instruct-q4f16_1-MLC",
        temperature: aiConfig.temperature ?? 0.8,
        maxTokens: aiConfig.max_tokens ?? 256
      });
      console.log("LLMRunner created successfully");

      // Set AI name as CSS variable for use in chat messages
      const aiName = aiConfig.name || "AI";
      document.documentElement.style.setProperty('--ai-name', `"${aiName}"`);
      
      // Store AI name for use in JavaScript
      window.aiName = aiName;

      // Initialize Knowledge Base (load content files for RAG-lite)
      if (window.knowledgeBase) {
        window.knowledgeBase.initialize().catch(err => {
          console.warn("Failed to initialize knowledge base:", err);
        });
      }
    }
    aiEnabled = true;
    console.log("AI enabled set to true");
    return true;
  }
  
  // Initialize AI if enabled in config
  if (aiEnabled) {
    initializeAI();
  }

  function clear() {
    output.innerHTML = "";
    // Clear current page context when console is cleared
    window.currentPageContext = {
      command: null,
      title: null,
      content: null,
      timestamp: null
    };
  }

  function renderScreen(headerLine, html) {
    clear();
    if (headerLine) output.appendChild(createLine(headerLine, "muted"));
    if (html) output.appendChild(createHtmlBlock(html));
    // Scroll to top for slash commands
    output.scrollTop = 0;
  }

  // ============================================================================
  // Chat Handling (NEW)
  // ============================================================================

  let modelInitialized = false;
  let modelLoading = false;
  let userConsentedToAI = false;
  let isGenerating = false;
  
  // Initialize current page context globally
  window.currentPageContext = {
    command: null,
    title: null,
    content: null,
    timestamp: null
  };

  /**
   * Show model loading progress bar (thin bar above input)
   */
  function showModelLoadingBar(progress) {
    const progressBar = document.getElementById("model-progress-bar");
    const progressFill = document.getElementById("model-progress-fill");
    const progressText = document.getElementById("model-progress-text");
    
    if (!progressBar || !progressFill) return;
    
    if (progress) {
      const percent = Math.round((progress.progress || 0) * 100);
      progressBar.style.display = 'block';
      progressFill.style.width = `${percent}%`;
      
      // Update text with progress percentage
      if (progressText) {
        if (percent === 0) {
          progressText.textContent = '🚀 Starting AI model download...';
        } else if (percent < 30) {
          progressText.textContent = `⬇️ Downloading AI model... ${percent}%`;
        } else if (percent < 70) {
          progressText.textContent = `📦 Loading AI model... ${percent}%`;
        } else if (percent < 100) {
          progressText.textContent = `⚡ Almost ready... ${percent}%`;
        } else {
          progressText.textContent = '✨ AI model loaded!';
        }
      }
      
      // Update fill color based on progress
      if (percent < 30) {
        progressFill.style.background = 'linear-gradient(90deg, #ff6464, #ff9632)';
      } else if (percent < 70) {
        progressFill.style.background = 'linear-gradient(90deg, #ffc864, #64c8ff)';
      } else {
        progressFill.style.background = 'linear-gradient(90deg, #64c8ff, #64ff96)';
      }
    }
  }

  /**
   * Hide model loading progress bar
   */
  function hideModelLoadingBar() {
    const progressBar = document.getElementById("model-progress-bar");
    const progressText = document.getElementById("model-progress-text");
    if (progressBar) {
      // Fade out
      progressBar.style.opacity = '0';
      if (progressText) {
        progressText.style.opacity = '0';
      }
      setTimeout(() => {
        progressBar.style.display = 'none';
        progressBar.style.opacity = '1';
        if (progressText) {
          progressText.style.opacity = '1';
        }
      }, 300);
    }
  }

  /**
   * Show model loading progress overlay (for important messages)
   */
  function showModelLoading(progress) {
    let overlay = document.getElementById("model-loading-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "model-loading-overlay";
      overlay.className = "model-loading";
      overlay.innerHTML = `
        <h3>🚀 Initializing AI Assistant...</h3>
        <div class="progress-bar">
          <div class="progress-fill" id="model-progress-fill-overlay" style="width: 0%"></div>
        </div>
        <div class="progress-text" id="model-progress-text">Loading model...</div>
        <div class="progress-details" id="model-progress-details"></div>
      `;
      document.body.appendChild(overlay);
    }

    const fill = document.getElementById("model-progress-fill-overlay");
    const text = document.getElementById("model-progress-text");
    const details = document.getElementById("model-progress-details");

    if (progress) {
      const percent = Math.round((progress.progress || 0) * 100);
      fill.style.width = `${percent}%`;
      text.textContent = progress.text || `Loading... ${percent}%`;
      if (progress.timeElapsed) {
        details.textContent = `${Math.round(progress.timeElapsed / 1000)}s elapsed`;
      }
    }
  }

  /**
   * Load model in background (non-blocking)
   */
  function loadModelInBackground() {
    if (modelLoading || modelInitialized) return;
    
    // Safety check: ensure llmRunner exists
    if (!window.llmRunner) {
      console.error("llmRunner not initialized! Cannot load model.");
      output.appendChild(createChatMessage(
        "❌ AI not properly initialized. Please refresh the page or use slash commands like /help.",
        "error"
      ));
      scrollToBottom(output);
      return;
    }
    
    modelLoading = true;
    
    // Show progress bar (not modal)
    showModelLoadingBar({ progress: 0 });

    window.llmRunner.initialize((progress) => {
      // Update progress bar
      console.log("Model loading progress:", progress);
      showModelLoadingBar(progress);
    }).then(() => {
      modelInitialized = true;
      modelLoading = false;
      
      // Hide progress bar
      hideModelLoadingBar();
      
      // Get model info for disclaimer
      const modelInfo = window.llmRunner.getModelInfo();
      
      // Show success message with disclaimer
      output.appendChild(createChatMessage(
        `🎉 AI is ready! Loaded ${modelInfo.name} (${modelInfo.size}).`,
        "system"
      ));
      output.appendChild(createChatMessage(
        "⚠️ Disclaimer: This is a small on-device AI model. It may play jokes, make mistakes, or give silly answers. " +
        "Feel free to play and chat, but don't take everything seriously! For accurate information, check the slash commands like /publications or /highlights.",
        "system"
      ));
      scrollToBottom(output);
    }).catch((error) => {
      console.error("Model loading failed:", error);
      modelLoading = false;
      
      // Hide progress bar
      hideModelLoadingBar();
      
      // Show error
      output.appendChild(createChatMessage(
        `Failed to load AI model: ${error.message}. You can still use slash commands like /help!`,
        "error"
      ));
      scrollToBottom(output);
    });
  }

  /**
   * Parse and render response with thinking tags
   * Supports <think>...</think> blocks that are collapsible
   */
  function renderThinkingResponse(element, fullText) {
    // Clear current content
    element.innerHTML = "";
    
    // Parse <think>...</think> tags
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    let lastIndex = 0;
    let match;
    let thinkCounter = 0;
    const thinkBlocks = [];
    
    // First pass: collect all thinking blocks
    while ((match = thinkRegex.exec(fullText)) !== null) {
      thinkBlocks.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1]
      });
    }
    
    // If there are thinking blocks, add a toggle button at the top
    if (thinkBlocks.length > 0) {
      const toggleContainer = document.createElement("span");
      toggleContainer.className = "think-toggle-inline";
      toggleContainer.innerHTML = `
        <button class="think-toggle-btn" onclick="this.closest('.chat-message').querySelectorAll('.think-content').forEach(el => el.classList.toggle('collapsed')); this.classList.toggle('expanded')">
          <span class="think-icon">💭</span>
          <span class="think-label">Thinking</span>
          <span class="think-arrow">▼</span>
        </button>
      `;
      element.appendChild(toggleContainer);
    }
    
    // Second pass: render content with thinking blocks
    lastIndex = 0;
    thinkRegex.lastIndex = 0; // Reset regex
    while ((match = thinkRegex.exec(fullText)) !== null) {
      // Add text before <think> tag
      if (match.index > lastIndex) {
        const textBefore = fullText.substring(lastIndex, match.index);
        const textNode = document.createElement("span");
        textNode.textContent = textBefore;
        element.appendChild(textNode);
      }
      
      // Create collapsible thinking block
      const thinkContent = match[1];
      const thinkId = `think-${Date.now()}-${thinkCounter++}`;
      
      const thinkBlock = document.createElement("div");
      thinkBlock.className = "think-block";
      thinkBlock.innerHTML = `
        <div id="${thinkId}" class="think-content collapsed">
          <pre>${thinkContent.trim()}</pre>
        </div>
      `;
      element.appendChild(thinkBlock);
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last </think> tag
    if (lastIndex < fullText.length) {
      const textAfter = fullText.substring(lastIndex);
      const textNode = document.createElement("span");
      textNode.textContent = textAfter;
      element.appendChild(textNode);
    }
    
    // If no <think> tags found, just display as plain text
    if (thinkBlocks.length === 0) {
      element.textContent = fullText;
    }
  }

  /**
   * Ask user for consent to use AI
   */
  function askAIConsent(userMessage) {
    const modelInfo = window.llmRunner.getModelInfo();
    const aiName = window.aiName || 'AI';
    
    const consentHtml = `
      <div class="chat-message system">
        <p><strong>🤖 Would you like to chat with ${aiName}?</strong></p>
        <p>I can help you explore this site in a fun, conversational way!</p>
        <p style="margin-top: 0.5em;">
          <strong>Model:</strong> ${modelInfo.name} (${modelInfo.size}, one-time download)
        </p>
        <p style="margin-top: 0.5em;">
          <strong>Note:</strong> While it loads in the background, you can still use slash commands.
        </p>
        <p style="margin-top: 0.5em; color: #64c8ff;">
          💡 <strong>Tip:</strong> Type <span class="kbd">/help</span> to see all available commands.
        </p>
        <p style="margin-top: 1em;">
          <button class="ai-consent-btn" data-consent="yes">Yes, let's chat! 🚀</button>
          <button class="ai-consent-btn" data-consent="no">No, I'll use commands</button>
        </p>
      </div>
    `;
    
    const consentEl = document.createElement("div");
    consentEl.innerHTML = consentHtml;
    output.appendChild(consentEl);
    scrollToBottom(output);
    
    // Handle button clicks
    consentEl.querySelectorAll('.ai-consent-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const consent = btn.getAttribute('data-consent');
        
        // Remove buttons
        consentEl.remove();
        
        if (consent === 'yes') {
          userConsentedToAI = true;
          
          // Show acceptance message
          output.appendChild(createChatMessage(
            "Great! 🎉 Loading the AI model now... Watch the progress bar above the input!",
            "system"
          ));
          scrollToBottom(output);
          
          // Start loading in background (this will show the progress bar)
          loadModelInBackground();
          
          // Process the original message
          handleChatMessage(userMessage);
        } else {
          userConsentedToAI = false;
          
          // Show helpful message
          output.appendChild(createChatMessage(
            "No problem! You can use slash commands to explore. Type /help to see all available commands. 👍",
            "system"
          ));
          scrollToBottom(output);
        }
      });
    });
  }

  /**
   * Create a chat message element
   */
  function createChatMessage(content, role) {
    const el = document.createElement("div");
    el.className = `chat-message ${role}`;
    el.textContent = content;
    return el;
  }

  /**
   * Create a loading indicator
   */
  function createChatLoading() {
    const el = document.createElement("div");
    el.className = "chat-loading";
    el.id = "chat-loading-indicator";
    el.innerHTML = '<span class="dots"></span>';
    return el;
  }

  /**
   * Handle chat message from user
   */
  async function handleChatMessage(userMessage) {
    // Check if user has consented to AI (first non-slash command)
    if (!userConsentedToAI && !modelInitialized && !modelLoading) {
      askAIConsent(userMessage);
      return;
    }
    
    // If user declined AI, remind them to use commands
    if (userConsentedToAI === false) {
      output.appendChild(createChatMessage(
        "I'm running in command-only mode. Type /help to see available commands! 🎮",
        "system"
      ));
      scrollToBottom(output);
      return;
    }

    // Check if user is in a game
    if (window.gameManager && window.gameManager.isInGame()) {
      const response = window.gameManager.processAnswer(userMessage);
      if (response) {
        output.appendChild(createChatMessage(response, "assistant"));
        scrollToBottom(output);
        return;
      }
    }

    // Check for game start commands
    const playMatch = userMessage.toLowerCase().match(/^play\s+([\w-]+)/);
    if (playMatch && window.gameManager) {
      const gameName = playMatch[1];
      const gameResponse = window.gameManager.startGame(gameName);
      if (gameResponse) {
        output.appendChild(createChatMessage(gameResponse, "assistant"));
        scrollToBottom(output);
        return;
      }
    }

    if (isGenerating) {
      output.appendChild(createChatMessage(
        "Please wait for the current response to finish...",
        "system"
      ));
      scrollToBottom(output);
      return;
    }

    isGenerating = true;

    try {
      // Show user message
      output.appendChild(createChatMessage(userMessage, "user"));
      scrollToBottom(output);

      // Check for easter eggs first (instant response!)
      if (window.personality) {
        const easterEggResponse = window.personality.checkEasterEgg(userMessage);
        if (easterEggResponse) {
          // Create ASCII art container if response contains art
          const responseEl = document.createElement("div");
          responseEl.className = "chat-message assistant";
          if (easterEggResponse.includes('╗') || easterEggResponse.includes('|') || easterEggResponse.includes('/')) {
            responseEl.innerHTML = `<pre class="ascii-art">${easterEggResponse}</pre>`;
          } else {
            responseEl.textContent = easterEggResponse;
          }
          output.appendChild(responseEl);
          scrollToBottom(output);
          isGenerating = false;
          return;
        }

        // Check for quick responses (instant response!)
        const quickResponse = window.personality.checkQuickResponse(userMessage);
        if (quickResponse) {
          output.appendChild(createChatMessage(quickResponse, "assistant"));
          scrollToBottom(output);
          isGenerating = false;
          return;
        }
      }

      // If model is still loading, inform user
      if (modelLoading && !modelInitialized) {
        output.appendChild(createChatMessage(
          "🔄 AI model is still loading in the background... This might take a minute on first use. " +
          "Meanwhile, you can use slash commands like /help, /highlights, /publications, etc.",
          "system"
        ));
        scrollToBottom(output);
        isGenerating = false;
        return;
      }

      // If model not loaded and not loading (shouldn't happen, but safety check)
      if (!modelInitialized && !modelLoading) {
        output.appendChild(createChatMessage(
          "AI model not loaded. Please refresh and try again, or use slash commands like /help.",
          "error"
        ));
        scrollToBottom(output);
        isGenerating = false;
        return;
      }

      // Show loading indicator
      const loadingEl = createChatLoading();
      output.appendChild(loadingEl);
      scrollToBottom(output);

      // Generate streaming response
      const assistantEl = createChatMessage("", "assistant");
      let responseText = "";

      // Remove loading, show assistant message
      loadingEl.remove();
      output.appendChild(assistantEl);

      // Stream the response
      for await (const chunk of window.chatManager.generateStreamingResponse(userMessage)) {
        responseText += chunk;
        renderThinkingResponse(assistantEl, responseText);
        scrollToBottom(output);
      }

      isGenerating = false;
    } catch (error) {
      console.error("Chat error:", error);
      isGenerating = false;

      // Remove loading indicator if present
      const loadingEl = document.getElementById("chat-loading-indicator");
      if (loadingEl) loadingEl.remove();

      // Show error message
      let errorMessage = "Failed to generate response. ";
      if (!modelInitialized) {
        errorMessage += "The model failed to load. Make sure your browser supports WebGPU and you have a stable internet connection for the first load.";
      } else {
        errorMessage += error.message || "Unknown error.";
      }

      output.appendChild(createChatMessage(errorMessage, "error"));
      scrollToBottom(output);
    }
  }

  // ============================================================================
  // End Chat Handling
  // ============================================================================

  async function renderCommand(cmd) {
    title.textContent = cmd.title || `${config.site.handle}:~`;
    
    const markdown = await loadMarkdown(cmd.content);
    const { frontMatter, content } = parseFrontMatter(markdown);
    
    // Apply simple variable substitution
    let processedContent = content;
    Object.keys(frontMatter).forEach(key => {
      const value = frontMatter[key];
      if (typeof value === "string") {
        processedContent = processedContent.replace(
          new RegExp(`\\{\\{${key}\\}\\}`, "g"),
          value
        );
      }
    });

    const html = parseMarkdown(processedContent);
    const rendered = renderTemplate(cmd.template, frontMatter, html);
    
    renderScreen(`$ /${cmd.name}`, rendered);
    
    // Store current page context for AI chat AFTER renderScreen (which calls clear())
    window.currentPageContext = {
      command: cmd.name,
      title: cmd.title || cmd.name,
      content: content, // Store the markdown content
      timestamp: Date.now()
    };
  }

  async function runCommand(raw, opts) {
    const { name } = normalizeCommand(raw);
    const cmd = commandMap[name];

    if (!raw.trim()) {
      const hintMessage = aiEnabled 
        ? "<h2>Hint</h2><p>Type <span class=\"kbd\">/help</span> or just chat with me!</p>"
        : "<h2>Hint</h2><p>Type <span class=\"kbd\">/help</span> to see available commands.</p>";
      renderScreen("", hintMessage);
      return;
    }

    // NEW: Handle chat messages (non-slash commands)
    if (!raw.trim().startsWith("/")) {
      // If AI is disabled, treat as unknown command
      if (!aiEnabled) {
        const suggestion = Object.keys(commandMap)
          .filter(c => c)
          .slice(0, 6)
          .map(c => `/${c}`)
          .join("  ");
        const extra = suggestion ? `<p class="muted">Available commands: ${suggestion} ...</p>` : "";
        renderScreen(
          `$ ${raw.trim()}`,
          `<h2>Error</h2><p>Unknown command: <span class="kbd">${raw.trim()}</span></p>${extra}<p class="muted">Try <a href="#/help">/help</a>.</p>`
        );
        return;
      }
      
      // AI is enabled, handle as chat message
      await handleChatMessage(raw.trim());
      return;
    }

    // Hidden goldfinger command to enable AI
    if (name === "goldfinger:enableai") {
      if (aiEnabled) {
        renderScreen(
          `$ /goldfinger:enableai`,
          `<h2>✓ AI Already Active</h2><p>AI is already enabled! Just type a message without "/" to chat.</p><p class="muted">Model: ${aiConfig.model || 'default'}</p>`
        );
      } else {
        // Initialize AI components
        const success = initializeAI();
        if (success) {
          const webllmStatus = window.webllm ? "✓ Ready" : "⏳ Loading...";
          renderScreen(
            `$ /goldfinger:enableai`,
            `<h2>🔓 AI Enabled</h2>
             <p>AI has been activated for this session!</p>
             <p class="muted">Model: ${aiConfig.model || 'Qwen3-1.7B-q4f16_1-MLC'}</p>
             <p class="muted">WebLLM Library: ${webllmStatus}</p>
             <p class="muted">Type a message without "/" to start chatting. The model will load on first use.</p>
             ${!window.webllm ? '<p class="muted">⚠️ WebLLM is still loading in the background. Please wait a moment before chatting.</p>' : ''}`
          );
        } else {
          renderScreen(
            `$ /goldfinger:enableai`,
            `<h2>❌ AI Initialization Failed</h2><p>Could not initialize AI components. Check console for errors.</p><p class="muted">You can still use slash commands like /help.</p>`
          );
        }
      }
      return;
    }

    // Hidden AI status command for debugging
    if (name === "goldfinger:aistatus") {
      const webllmLoaded = typeof window.webllm !== 'undefined';
      const llmRunnerExists = !!window.llmRunner;
      const llmRunnerReady = window.llmRunner ? window.llmRunner.webllmReady : false;
      const isModelLoaded = modelInitialized;
      const isModelLoading = modelLoading;
      
      renderScreen(
        `$ /goldfinger:aistatus`,
        `<h2>🔍 AI System Status</h2>
         <div class="kvs">
           <div class="k">AI Enabled</div><div class="v">${aiEnabled ? '✅ Yes' : '❌ No'}</div>
           <div class="k">WebLLM Library</div><div class="v">${webllmLoaded ? '✅ Loaded' : '⏳ Loading...'}</div>
           <div class="k">LLM Runner</div><div class="v">${llmRunnerExists ? '✅ Created' : '❌ Not created'}</div>
           <div class="k">WebLLM Ready</div><div class="v">${llmRunnerReady ? '✅ Yes' : '⏳ Waiting...'}</div>
           <div class="k">Model Loaded</div><div class="v">${isModelLoaded ? '✅ Yes' : '❌ No'}</div>
           <div class="k">Model Loading</div><div class="v">${isModelLoading ? '⏳ Yes' : '✅ No'}</div>
           <div class="k">User Consent</div><div class="v">${userConsentedToAI ? '✅ Given' : '❌ Not given'}</div>
         </div>
         <p class="muted">Use this to debug AI initialization issues.</p>`
      );
      return;
    }

    if (!cmd) {
      const suggestion = Object.keys(commandMap)
        .filter(c => c && c.startsWith(name))
        .slice(0, 6)
        .map(c => `/${c}`)
        .join("  ");
      const extra = suggestion ? `<p class="muted">Did you mean: ${suggestion}</p>` : "";
      renderScreen(
        `$ ${raw.trim()}`,
        `<h2>Error</h2><p>Unknown command: <span class="kbd">/${name}</span></p>${extra}<p class="muted">Try <a href="#/help">/help</a>.</p>`
      );
      return;
    }

    // Handle built-in commands
    if (cmd.builtin) {
      if (cmd.name === "clear" || cmd.name === "cls") {
        clear();
        return;
      }
    }

    // Render content-based command
    await renderCommand(cmd);
    if (!opts || !opts.skipRoute) setRoute(cmd.name);
  }

  function complete(prefix) {
    const p = prefix.startsWith("/") ? prefix.slice(1) : prefix;
    const candidates = Object.keys(commandMap).filter(c => c && c.startsWith(p));
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return `/${candidates[0]}`;
    renderScreen(
      "$ /help",
      `<h2>Matches</h2><p>${candidates.map(c => `<span class="kbd">/${c}</span>`).join(" ")}</p>`
    );
    return null;
  }

  async function boot() {
    const homeCmd = commandDefs.home || commandDefs[""];
    if (homeCmd) {
      await renderCommand(homeCmd);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const v = input.value;
    
    // Clear input immediately after capturing the value
    input.value = "";
    
    if (v.trim()) {
      history.push(v);
      historyIdx = history.length;
    }
    await runCommand(v);
    hint.textContent = "Tab: complete";
    input.focus();
    return false;
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      if (!history.length) return;
      e.preventDefault();
      historyIdx = Math.max(0, historyIdx - 1);
      input.value = history[historyIdx] || "";
      queueMicrotask(() => input.setSelectionRange(input.value.length, input.value.length));
      return;
    }
    if (e.key === "ArrowDown") {
      if (!history.length) return;
      e.preventDefault();
      historyIdx = Math.min(history.length, historyIdx + 1);
      input.value = history[historyIdx] || "";
      queueMicrotask(() => input.setSelectionRange(input.value.length, input.value.length));
      return;
    }
    if (e.key === "Tab") {
      const v = input.value.trim();
      if (!v.startsWith("/")) return;
      e.preventDefault();
      const c = complete(v);
      if (c) {
        input.value = c;
        hint.textContent = "Enter: run";
      }
      return;
    }
  });

  window.addEventListener("hashchange", async () => {
    const r = parseRoute();
    if (!r) return;
    const cmd = commandMap[r];
    if (!cmd || cmd.builtin) return;
    await renderCommand(cmd);
  });

  // Boot
  await boot();
  
  // Handle initial route
  const r = parseRoute();
  if (r && commandMap[r] && !commandMap[r].builtin) {
    await renderCommand(commandMap[r]);
  }

  input.focus();
  } catch (error) {
    console.error("Error initializing console:", error);
    const output = $("#output");
    if (output) {
      let errorDetails = error.message;
      let helpText = "";
      
      // Check if this is a CORS/file protocol issue
      if (window.location.protocol === "file:") {
        helpText = `
          <p><strong>You're opening this file directly (file:// protocol).</strong></p>
          <p>This prevents the console from loading content files.</p>
          <h3>Solution: Start a local web server</h3>
          <p>In the terminal, run:</p>
          <pre style="background: #1a1a1a; padding: 1em; border-radius: 4px; margin: 1em 0;">
cd /local/home/congli/Desktop/homepage
python3 -m http.server 8080</pre>
          <p>Then open <a href="http://localhost:8080/index.html">http://localhost:8080/index.html</a> in your browser.</p>
        `;
      } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        helpText = `
          <p><strong>Network Error</strong></p>
          <p>Make sure you're running a local web server and the files are accessible.</p>
        `;
      }
      
      output.innerHTML = `
        <div class="block">
          <h2 class="error">Initialization Error</h2>
          <p>Failed to load console.</p>
          <p class="muted">Error: ${errorDetails}</p>
          ${helpText}
        </div>
      `;
    }
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
