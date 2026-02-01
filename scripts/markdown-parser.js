"use strict";

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

  // Tables (must be processed early, before other inline formatting)
  html = parseTables(html);

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Horizontal rules (must check for standalone --- on its own line)
  html = html.replace(/^---$/gm, '<div class="sep"></div>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Strikethrough (must be before subscript to handle ~~ before ~)
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Highlight/Mark
  html = html.replace(/==(.+?)==/g, "<mark>$1</mark>");

  // Shadow text (dimmed text) - must be after horizontal rules check
  // Use negative lookahead to avoid matching horizontal rules
  html = html.replace(/--(.+?)--/g, "<span class=\"shadow\">$1</span>");

  // Superscript and subscript
  html = html.replace(/\^([^^]+)\^/g, "<sup>$1</sup>");
  html = html.replace(/~([^~]+)~/g, "<sub>$1</sub>");

  // Code/kbd
  html = html.replace(/`([^`]+)`/g, '<span class="kbd">$1</span>');

  // Images with attributes (must be before links since ![...](...) also matches link pattern)
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+([^)]+))?\)/g, (match, alt, src, attrs) => {
    let imgTag = `<img src="${src}" alt="${alt}"`;
    if (attrs) {
      // Parse attributes like width=50% height=100px class="my-class"
      const attrPairs = attrs.match(/(\w+)=["']?([^"'\s]+)["']?/g);
      if (attrPairs) {
        attrPairs.forEach(pair => {
          const [key, value] = pair.split('=');
          const cleanValue = value.replace(/["']/g, '');
          imgTag += ` ${key}="${cleanValue}"`;
        });
      }
    }
    imgTag += ' />';
    return imgTag;
  });

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    if (url.startsWith("http") || url.startsWith("#")) {
      return `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
    }
    return `<a href="${url}">${text}</a>`;
  });

  // Task lists (must be before regular lists)
  html = html.replace(/^- \[ \] (.+)$/gm, '<li class="task-item"><input type="checkbox" disabled> $1</li>');
  html = html.replace(/^- \[x\] (.+)$/gm, '<li class="task-item"><input type="checkbox" checked disabled> $1</li>');

  // Lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="clean">$&</ul>');

  // Paragraphs
  const lines = html.split("\n");
  const processed = [];
  let inList = false;
  let inBlock = false;
  let inTable = false;

  for (let line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith("<table")) {
      if (inBlock && processed[processed.length - 1] !== "</p>") processed.push("</p>");
      processed.push(line);
      inBlock = false;
      inTable = true;
    } else if (trimmed.startsWith("</table")) {
      processed.push(line);
      inTable = false;
    } else if (trimmed.startsWith("<h") || trimmed.startsWith("<div") || trimmed.startsWith("<ul") || trimmed.startsWith("<img")) {
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
    } else if (inTable || trimmed.startsWith("<tr") || trimmed.startsWith("<thead") || trimmed.startsWith("<tbody")) {
      processed.push(line);
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

function parseTables(text) {
  const lines = text.split("\n");
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this line looks like a table header
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      // Check if next line is a separator line
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (nextLine.match(/^\|[\s\-:|]+\|$/)) {
          // This is a table! Parse it
          const tableLines = [line, nextLine];
          let j = i + 2;
          
          // Collect all subsequent table rows
          while (j < lines.length && lines[j].trim().startsWith("|") && lines[j].trim().endsWith("|")) {
            tableLines.push(lines[j]);
            j++;
          }
          
          // Parse the table
          const tableHtml = parseTableLines(tableLines);
          result.push(tableHtml);
          i = j;
          continue;
        }
      }
    }
    
    result.push(line);
    i++;
  }

  return result.join("\n");
}

function parseTableLines(tableLines) {
  if (tableLines.length < 2) return tableLines.join("\n");

  const headerLine = tableLines[0];
  const separatorLine = tableLines[1];
  const dataLines = tableLines.slice(2);

  // Parse header
  const headers = headerLine.split("|").slice(1, -1).map(h => h.trim());

  // Parse alignment from separator line
  const alignments = separatorLine.split("|").slice(1, -1).map(sep => {
    const trimmed = sep.trim();
    if (trimmed.startsWith(":") && trimmed.endsWith(":")) return "center";
    if (trimmed.endsWith(":")) return "right";
    if (trimmed.startsWith(":")) return "left";
    return "";
  });

  // Build table HTML
  let html = '<table>\n<thead>\n<tr>\n';
  
  headers.forEach((header, idx) => {
    const align = alignments[idx] ? ` style="text-align: ${alignments[idx]}"` : "";
    html += `<th${align}>${header}</th>\n`;
  });
  
  html += '</tr>\n</thead>\n<tbody>\n';

  // Parse data rows
  dataLines.forEach(line => {
    const cells = line.split("|").slice(1, -1).map(c => c.trim());
    html += '<tr>\n';
    cells.forEach((cell, idx) => {
      const align = alignments[idx] ? ` style="text-align: ${alignments[idx]}"` : "";
      html += `<td${align}>${cell}</td>\n`;
    });
    html += '</tr>\n';
  });

  html += '</tbody>\n</table>';
  
  return html;
}
