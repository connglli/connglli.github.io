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
// YAML Parser (simple, supports basic YAML subset)
// ============================================================================

function parseValue(value) {
  // Handle JSON arrays and objects
  if ((value.startsWith("[") && value.endsWith("]")) || 
      (value.startsWith("{") && value.endsWith("}"))) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  
  // Handle quoted strings
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  // Handle booleans
  if (value === "true") return true;
  if (value === "false") return false;
  
  // Handle numbers
  if (!isNaN(value) && value !== "") return Number(value);
  
  return value;
}

function parseYAML(text) {
  const lines = text.split("\n");
  const result = {};
  let currentKey = null;
  let currentList = null;
  let currentObj = null;
  let indent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip comments and empty lines
    if (line.trim().startsWith("#") || line.trim() === "") continue;

    const spaces = line.match(/^(\s*)/)[0].length;
    const trimmed = line.trim();

    // Top-level key
    if (trimmed.includes(":") && spaces === 0) {
      const [key, ...rest] = trimmed.split(":");
      const value = rest.join(":").trim();
      currentKey = key.trim();

      if (value === "" || value === "[]" || value === "{}") {
        // Look ahead to see if next non-empty line is a list item
        let isArray = value === "[]";
        if (value === "") {
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j];
            if (nextLine.trim() === "" || nextLine.trim().startsWith("#")) continue;
            const nextSpaces = nextLine.match(/^(\s*)/)[0].length;
            if (nextSpaces > spaces && nextLine.trim().startsWith("-")) {
              isArray = true;
            }
            break;
          }
        }
        
        result[currentKey] = isArray ? [] : {};
        currentList = Array.isArray(result[currentKey]) ? result[currentKey] : null;
        currentObj = null;
      } else {
        result[currentKey] = parseValue(value);
        currentList = null;
        currentObj = null;
      }
      indent = spaces;
      continue;
    }

    // List item
    if (trimmed.startsWith("-") && spaces > indent) {
      const content = trimmed.substring(1).trim();
      
      // Ensure we have a list to push to
      if (!currentList && currentKey) {
        result[currentKey] = [];
        currentList = result[currentKey];
      }
      
      if (content.includes(":")) {
        // Object in list
        const obj = {};
        const [k, ...v] = content.split(":");
        const val = v.join(":").trim();
        obj[k.trim()] = parseValue(val);
        if (currentList) {
          currentList.push(obj);
          currentObj = currentList[currentList.length - 1];
        }
      } else {
        // Simple list item
        if (currentList) currentList.push(parseValue(content));
      }
      continue;
    }

    // Nested key-value
    if (trimmed.includes(":") && spaces > indent) {
      const [key, ...rest] = trimmed.split(":");
      const value = rest.join(":").trim();
      
      if (currentObj) {
        currentObj[key.trim()] = parseValue(value);
      } else if (currentKey && typeof result[currentKey] === "object" && !Array.isArray(result[currentKey])) {
        result[currentKey][key.trim()] = parseValue(value);
      }
    }
  }

  return result;
}

// ============================================================================
// Markdown Parser (simple, converts to HTML)
// ============================================================================

function parseFrontMatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontMatter: {}, content: text };
  
  const frontMatter = parseYAML(match[1]);
  const content = match[2];
  return { frontMatter, content };
}

function parseMarkdown(text) {
  let html = text;

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Horizontal rules
  html = html.replace(/^---$/gm, '<div class="sep"></div>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Code/kbd
  html = html.replace(/`([^`]+)`/g, '<span class="kbd">$1</span>');

  // Images (must be before links since ![...](...) also matches link pattern)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    if (url.startsWith("http") || url.startsWith("#")) {
      return `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
    }
    return `<a href="${url}">${text}</a>`;
  });

  // Lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="clean">$&</ul>');

  // Paragraphs
  const lines = html.split("\n");
  const processed = [];
  let inList = false;
  let inBlock = false;

  for (let line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith("<h") || trimmed.startsWith("<div") || trimmed.startsWith("<ul") || trimmed.startsWith("<img")) {
      if (inBlock && processed[processed.length - 1] !== "</p>") processed.push("</p>");
      processed.push(line);
      inBlock = false;
      inList = trimmed.startsWith("<ul");
    } else if (trimmed.startsWith("</ul")) {
      processed.push(line);
      inList = false;
    } else if (trimmed === "") {
      if (inBlock) {
        processed.push("</p>");
        inBlock = false;
      }
    } else if (!trimmed.startsWith("<li>") && !inList) {
      if (!inBlock) {
        processed.push("<p>");
        inBlock = true;
      }
      processed.push(line);
    } else {
      processed.push(line);
    }
  }

  if (inBlock) processed.push("</p>");
  
  return processed.join("\n");
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

  function clear() {
    output.innerHTML = "";
  }

  function renderScreen(headerLine, html) {
    clear();
    if (headerLine) output.appendChild(createLine(headerLine, "muted"));
    if (html) output.appendChild(createHtmlBlock(html));
    scrollToBottom(output);
  }

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
      renderScreen("", "<h2>Hint</h2><p>Type <span class=\"kbd\">/help</span></p>");
      return;
    }

    if (!raw.trim().startsWith("/")) {
      renderScreen(
        `$ ${raw.trim()}`,
        "<h2 class=\"error\">Error</h2><p>Commands start with <span class=\"kbd\">/</span>. Try <a href=\"#/help\">/help</a>.</p>"
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
