# AI Chat Feature Documentation

## Overview

This homepage now features an AI-powered chat interface that allows visitors to interact conversationally while maintaining all existing slash command functionality.

## Key Features

### ✅ **User-Friendly Design**
- **Lazy Loading**: AI model only loads when user types a non-slash command
- **User Consent**: Asks permission before downloading model
- **Background Loading**: Model loads non-blocking; slash commands work during load
- **Instant Responses**: Easter eggs and quick responses work immediately (no wait)

### ✅ **Configurable Models**
Choose from 5 different AI models in `console.config.yaml`:

| Model | Size | Speed | Capability | Best For |
|-------|------|-------|------------|----------|
| **Qwen 3 0.6B** (default) | ~350MB | Fast | Good | Balanced performance |
| **Qwen 3 1.7B** | ~1GB | Moderate | Better | More capable |
| **SmolLM2 360M** | ~360MB | Fast | Good | Balanced, smaller |
| **SmolLM2 1.7B** | ~1.7GB | Moderate | Very Good | Highly capable, compact |
| **Gemma 2 2B** | ~1.3GB | Moderate | Best | Complex conversations |

### ✅ **Personality & Fun**
- Geeky hacker-vibe assistant
- Programming jokes and puns
- ASCII art responses
- Easter eggs (try `sudo`, `hack the planet`, `404`, etc.)
- Terminal slang and references

### ✅ **Model Highlights**

**Qwen 3 0.6B** (default) is best for:
- Fast responses
- General conversation
- Smaller download size

**Gemma 2 2B** is best for:
- Complex conversations
- Detailed explanations
- Most capable model (but larger)

---

## Configuration

Edit `console.config.yaml` to customize AI settings:

```yaml
ai:
  # Enable or disable AI chat functionality (true/false)
  # When disabled, only slash commands work
  enabled: true
  
  # AI assistant name (shown in chat messages and greetings)
  # Examples: "Pico", "HAL", "Jarvis", "Friday", "Cortana", etc.
  name: "Pico"
  
  # Model to use (see table above)
  model: "Qwen3-1.7B-q4f16_1-MLC"
  
  # Temperature (0.0-2.0, higher = more creative)
  temperature: 0.8
  
  # Max tokens per response
  max_tokens: 4096
```

### Enabling/Disabling AI

**To disable AI completely:**
1. Open `console.config.yaml`
2. Set `enabled: false` under the `ai:` section
3. Save and refresh the page
4. Non-slash input will now show "Unknown command" (like before AI was added)
5. All slash commands continue to work normally

**To re-enable AI:**
1. Set `enabled: true` in `console.config.yaml`
2. Save and refresh
3. Chat functionality is restored

**Hidden Goldfinger Command:**
For admin/developer use, there's a secret command `/goldfinger:enableai` that can enable AI at runtime:
- When AI is **already enabled**: Shows a status message with current model
- When AI is **disabled**: Immediately activates AI for the current session (no config change needed)

⚠️ **Important Notes**:
- This command **bypasses** the `ai.enabled: false` config setting
- AI stays enabled only for the current browser session (resets on page refresh)
- The config file is **not modified** - this is a runtime-only override
- Intentionally hidden from `/help` and user-facing documentation
- Intended for the site owner to use when they want AI without changing the config

**Use Case**: You keep `ai.enabled: false` by default (so visitors don't see AI), but you can type `/goldfinger:enableai` when you visit your own site to activate AI for yourself.

**Note**: WebLLM library loads asynchronously from CDN. If you use goldfinger immediately after page load, you may see a warning that WebLLM is still loading. Wait 10-20 seconds and the library will be ready. Use `/goldfinger:aistatus` to check loading status.

### `/goldfinger:aistatus` - AI System Status (Hidden)

**Command**: `/goldfinger:aistatus`

**Purpose**: Shows detailed AI system status for debugging initialization issues.

**Output**:
```
🔍 AI System Status
AI Enabled:      ✅ Yes / ❌ No
WebLLM Library:  ✅ Loaded / ⏳ Loading...
LLM Runner:      ✅ Created / ❌ Not created
WebLLM Ready:    ✅ Yes / ⏳ Waiting...
Model Loaded:    ✅ Yes / ❌ No
Model Loading:   ⏳ Yes / ✅ No
User Consent:    ✅ Given / ❌ Not given
```

**When to Use**:
- After using `/goldfinger:enableai` to check if WebLLM has finished loading
- When troubleshooting AI initialization issues
- To verify AI system state before attempting to chat
- When model loading fails or times out

**Typical Flow**:
1. Type `/goldfinger:enableai` → AI Enabled: ✅ Yes, WebLLM Library: ⏳ Loading...
2. Wait 10-20 seconds
3. Type `/goldfinger:aistatus` → WebLLM Library: ✅ Loaded, LLM Runner: ✅ Created
4. Now chat normally

### Switching Models

1. Open `console.config.yaml`
2. Make sure `enabled: true`
3. Change the `model:` line to one of:
   - `"Qwen3-0.6B-q4f16_1-MLC"` (recommended)
   - `"Qwen3-1.7B-q4f16_1-MLC"`
   - `"SmolLM2-360M-Instruct-q4f16_1-MLC"`
   - `"SmolLM2-1.7B-Instruct-q4f16_1-MLC"`
   - `"gemma-2-2b-it-q4f16_1-MLC"`
4. Save and refresh the page
5. Clear browser cache if needed (Ctrl+Shift+Delete)

---

## User Experience Flow

```
Visitor opens page
  ↓
Types message without "/"
  ↓
Consent dialog appears:
  - Shows model name and size
  - Two buttons: "Yes" or "No"
  ↓
User clicks "Yes"
  ↓
Model loads in background (with progress bar)
  ↓
MEANWHILE: All slash commands still work!
  ↓
Model finishes loading
  ↓
"🎉 AI is ready!" message
  ↓
Chat works with streaming responses
```

---

## Chat vs Commands

### **Chat Mode** (non-slash input)
```
hello
what does cong research?
tell me about fuzzing
```
→ AI responds conversationally

### **Slash Commands** (existing functionality)
```
/help
/highlights
/publications
/clear
/exit (or /quit)
/reload (or /refresh)
/fullscreen
```
→ Show specific content pages or perform actions

### **Easter Eggs** (instant responses!)
```
sudo
sudo make me a sandwich
hack the planet
404
rm -rf /
konami code
the answer
do a barrel roll
tell me a joke
```
→ Fun instant responses, no model loading needed

---

## Browser Requirements

### ✅ **Supported**
- Chrome 113+ (recommended)
- Edge 113+
- Any browser with WebGPU support

### ❌ **Not Supported**
- Firefox (WebGPU not yet stable)
- Safari (limited WebGPU)
- Older browsers without WebGPU

**How to check**: Open DevTools → Console → Type `navigator.gpu`
- If it returns an object: ✅ Supported
- If undefined: ❌ Not supported

---

## Performance & Caching

### **First Visit**
- Model downloads (one-time only)
- Qwen 3 0.6B: ~350MB, 1-2 minutes
- Qwen 3 1.7B: ~1GB, 2-3 minutes
- SmolLM2 360M: ~360MB, 1-2 minutes
- SmolLM2 1.7B: ~1.7GB, 3-4 minutes
- Gemma 2 2B: ~1.3GB, 3-5 minutes

### **Subsequent Visits**
- Model loads from cache (5-10 seconds)
- Much faster!

### **Clearing Cache**
If you switch models or have issues:
1. Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. Select "Cached images and files"
3. Clear data
4. Refresh page

---

## Customization

### **Adjust Creativity (Temperature)**
In `console.config.yaml`:
```yaml
temperature: 0.8  # Default
# 0.0 = Deterministic, factual
# 0.5 = Balanced
# 1.0 = Creative
# 2.0 = Very creative (may be incoherent)
```

### **Adjust Response Length**
```yaml
max_tokens: 256  # Default (2-3 sentences)
# 128 = Very short
# 256 = Short (recommended)
# 512 = Medium
# 1024 = Long (may be slow)
```

### **Change Personality**
Edit `scripts/chat.js` → `buildSystemPrompt()` function to customize AI personality.

### **Add Easter Eggs**
Edit `scripts/personality.js` → `easterEggs` object to add new easter eggs.

---

## Troubleshooting

### **Issue: Empty output field on page load**
**Solution**: Check browser console (F12) for JavaScript errors. Make sure all script files are loading correctly.

### **Issue: "WebLLM library not loaded"**
**Solution**: 
- Check `scripts/webllm-loader.js` is loading
- Make sure you're using http:// not file://
- Check browser console for network errors

### **Issue: Model download very slow**
**Expected**: First download can take 1-5 minutes depending on model and connection
**Solution**: 
- Use SmolLM 135M for fastest download
- Ensure stable internet connection
- Be patient on first load

### **Issue: "Your browser doesn't support WebGPU"**
**Solution**:
- Use Chrome 113+ or Edge 113+
- Enable hardware acceleration in browser settings
- Update your browser to latest version

### **Issue: Chat not working after model loads**
**Solution**:
- Check browser console for errors
- Try refreshing the page
- Clear cache and try again
- Switch to a different model

### **Issue: Model keeps redownloading**
**Solution**:
- Check browser cache isn't disabled
- Make sure you're not in incognito/private mode
- Check available disk space

---

## Architecture

```
User Input
  ↓
console.js (routing)
  ↓
  ├─ Starts with "/" → Slash command handler (existing)
  ↓
  └─ No "/" → Chat handler (NEW)
      ↓
      ├─ Check easter eggs (personality.js) → Instant response
      ├─ Check quick responses (personality.js) → Instant response
      ↓
      └─ AI generation
          ↓
          ├─ chat.js (orchestration)
          ├─ llm-runner.js (WebLLM wrapper)
          └─ WebLLM (in-browser inference)
```

---

## File Structure

```
homepage/
├── console.config.yaml     [MODIFIED] - Added ai: section
├── index.html              [MODIFIED] - Added chat scripts
├── scripts/
│   ├── console.js          [MODIFIED] - Added chat routing
│   ├── chat.js             [NEW] - Chat orchestration
│   ├── llm-runner.js       [NEW] - WebLLM wrapper
│   ├── personality.js      [NEW] - Easter eggs & jokes
│   ├── webllm-loader.js    [NEW] - ES module loader
│   └── (existing files)
├── styles/
│   └── chat.css            [NEW] - Chat styling
└── PLAN.md                 [NEW] - Implementation plan
```

---

## Privacy & Security

✅ **Fully Client-Side**
- All AI processing happens in your visitor's browser
- No data sent to external servers
- No API keys or cloud services needed

✅ **Privacy-First**
- Conversations are not stored
- Chat history only kept in memory (lost on refresh)
- No tracking or analytics

✅ **Secure**
- Model files served over HTTPS
- No code injection vulnerabilities
- Sandboxed WebAssembly execution

---

## Future Enhancements (Optional)

Phase 3 features that could be added:
- **Mini-games**: "Guess the Paper", Terminal Trivia, Word Scrambles
- **Knowledge base**: Parse content files for smarter responses
- **Context-aware suggestions**: Better command recommendations
- **More ASCII art**: Expand visual library
- **Voice input/output**: Speech recognition and synthesis

---

## Credits

**Technology Stack:**
- [WebLLM](https://github.com/mlc-ai/web-llm) - In-browser LLM inference
- [MLC LLM](https://github.com/mlc-ai/mlc-llm) - Model compilation
- WebGPU - Hardware acceleration
- Models: Qwen, SmolLM, Gemma

**Models:**
- Qwen 3 by Alibaba Cloud
- SmolLM2 by Hugging Face
- Gemma by Google

---

## Support

For issues or questions:
1. Check browser console (F12) for error messages
2. Review TESTING.md for common scenarios
3. Check WebGPU compatibility: https://caniuse.com/webgpu
4. Try a different model or clear cache

---

**Happy Chatting! 🤖✨**
