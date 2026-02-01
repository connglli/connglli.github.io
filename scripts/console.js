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

  // Build builtins
  (config.builtins || []).forEach(name => {
    commandMap[name] = { name, builtin: true };
  });

  // Initialize LLM Runner with config settings
  const aiConfig = config.ai || {};
  window.llmRunner = new window.LLMRunner({
    modelId: aiConfig.model || "Qwen2-0.5B-Instruct-q4f16_1-MLC",
    temperature: aiConfig.temperature ?? 0.8,
    maxTokens: aiConfig.max_tokens ?? 256
  });

  // Initialize Knowledge Base (load content files for RAG-lite)
  if (window.knowledgeBase) {
    window.knowledgeBase.initialize().catch(err => {
      console.warn("Failed to initialize knowledge base:", err);
    });
  }

  function clear() {
    output.innerHTML = "";
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

  /**
   * Show model loading progress bar (thin bar above input)
   */
  function showModelLoadingBar(progress) {
    const progressBar = document.getElementById("model-progress-bar");
    const progressFill = document.getElementById("model-progress-fill");
    
    if (!progressBar || !progressFill) return;
    
    if (progress) {
      const percent = Math.round((progress.progress || 0) * 100);
      progressBar.style.display = 'block';
      progressFill.style.width = `${percent}%`;
      
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
    if (progressBar) {
      // Fade out
      progressBar.style.opacity = '0';
      setTimeout(() => {
        progressBar.style.display = 'none';
        progressBar.style.opacity = '1';
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
    
    modelLoading = true;
    
    // Show progress bar (not modal)
    showModelLoadingBar({ progress: 0 });

    window.llmRunner.initialize((progress) => {
      // Update progress bar
      showModelLoadingBar(progress);
    }).then(() => {
      modelInitialized = true;
      modelLoading = false;
      
      // Hide progress bar
      hideModelLoadingBar();
      
      // Show success message in chat
      output.appendChild(createChatMessage(
        "🎉 AI is ready! You can now chat with me about Cong's research. Try asking something or type 'games' to play!",
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
        <button class="think-toggle" onclick="document.getElementById('${thinkId}').classList.toggle('collapsed')">
          <span class="think-icon">💭</span>
          <span class="think-label">Thinking process</span>
          <span class="think-arrow">▼</span>
        </button>
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
    if (thinkCounter === 0) {
      element.textContent = fullText;
    }
  }

  /**
   * Ask user for consent to use AI
   */
  function askAIConsent(userMessage) {
    const modelInfo = window.llmRunner.getModelInfo();
    
    const consentHtml = `
      <div class="chat-message system">
        <p><strong>🤖 Would you like to chat with AI?</strong></p>
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
            "Great! 🎉 Loading the AI model in the background. This might take a minute on first load...",
            "system"
          ));
          scrollToBottom(output);
          
          // Start loading in background
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
  }

  async function runCommand(raw, opts) {
    const { name } = normalizeCommand(raw);
    const cmd = commandMap[name];

    if (!raw.trim()) {
      renderScreen("", "<h2>Hint</h2><p>Type <span class=\"kbd\">/help</span> or just chat with me!</p>");
      return;
    }

    // NEW: Handle chat messages (non-slash commands)
    if (!raw.trim().startsWith("/")) {
      await handleChatMessage(raw.trim());
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
    if (v.trim()) {
      history.push(v);
      historyIdx = history.length;
    }
    await runCommand(v);
    input.value = "";
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
