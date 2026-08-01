# AI Chat Feature Documentation

In-browser conversational AI assistant powered by WebLLM and WebGPU.

## Overview

The AI Chat system allows visitors to interact conversationally with the homepage. It operates entirely client-side using WebLLM, ensuring privacy and eliminating backend server requirements.

## Supported Models

Configure the desired model key under `ai.model` in `console.config.yaml`:

| Model ID | VRAM / Download | Performance | Best For |
| :--- | :--- | :--- | :--- |
| `Qwen3-0.6B-q4f16_1-MLC` | ~350 MB | Fast | Low resource usage, quick setup |
| `Qwen3-1.7B-q4f16_1-MLC` (Default) | ~1.0 GB | Balanced | General purpose academic profile |
| `Qwen3-4B-q4f16_1-MLC` | ~2.3 GB | High | Complex technical reasoning |
| `SmolLM2-360M-Instruct-q4f16_1-MLC` | ~360 MB | Fast | Lightweight environments |
| `SmolLM2-1.7B-Instruct-q4f16_1-MLC` | ~1.7 GB | Good | Compact balanced assistant |
| `gemma-2-2b-it-q4f16_1-MLC` | ~1.3 GB | Very High | In-depth conversational queries |
| `Phi-3.5-mini-instruct-q4f32_1-MLC` | ~2.2 GB | High | Technical domain QA |

## Configuration (`console.config.yaml`)

```yaml
ai:
  enabled: true                      # Set false to disable chat mode completely
  name: "Pico"                       # Assistant name shown in output
  model: "Qwen3-1.7B-q4f16_1-MLC"    # Target WebLLM model ID
  temperature: 0.8                   # Sampling temperature (0.0 to 2.0)
  max_tokens: 4096                   # Max tokens generated per response
```

### Disabling AI
Set `enabled: false`. When disabled, non-slash queries return an "Unknown command" message, leaving slash commands operating as a pure terminal interface.

## Interaction Flow

1. **First Non-Slash Input**: Triggers explicit user consent modal displaying download size and model name.
2. **Acceptance**: Asynchronously fetches WebLLM module and model weights in background. Progress bar updates without blocking slash commands.
3. **Instant Responses**: Queries matching predefined easter eggs or quick responses (e.g., `sudo`, `hello`, `help`) respond immediately without waiting for model load.
4. **Active Session**: Injects relevant context from `knowledge.js` into prompt and streams AI response.

## Hidden Admin Commands (Goldfinger)

Administrative override commands (not listed in `/help`):

- **`/goldfinger:enableai`**: Enables AI chat dynamically for the current browser session, overriding `ai.enabled: false` without editing config.
- **`/goldfinger:aistatus`**: Displays initialization metrics and telemetry:

```text
🔍 AI System Status
AI Enabled:      ✅ Yes / ❌ No
WebLLM Library:  ✅ Loaded / ⏳ Loading...
LLM Runner:      ✅ Created / ❌ Not created
WebLLM Ready:    ✅ Yes / ⏳ Waiting...
Model Loaded:    ✅ Yes / ❌ No
```

## Browser Requirements

- WebGPU support required (Chrome 113+, Edge 113+).
- Hardware acceleration must be enabled in browser settings.
