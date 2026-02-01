"use strict";

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
