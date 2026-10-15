# AI chat

AI chat answers freeform input (anything without a leading `/`) with a WebLLM model that runs in the browser through WebGPU. It is configured under `ai:` in [console.config.yaml](../console.config.yaml); the shipped configuration disables it.

## Configuration

```yaml
ai:
  enabled: false                     # chat is inactive only when this is explicitly false
  name: "Pico"                       # assistant name in prompts and messages
  model: "Qwen3-4B-q4f16_1-MLC"      # WebLLM model ID
  temperature: 0.8                   # sampling temperature, 0.0 to 2.0
  max_tokens: 4096                   # generation cap per reply
```

`enabled` defaults to active when the key is absent. `name` and `model` also drive the consent prompt and the session override described below.

## Models

The active model is `ai.model`. Smaller models download less and answer faster; larger models reason better. The option list with download sizes is the comment block above `ai.model` in [console.config.yaml](../console.config.yaml), and the sizes shown in the consent prompt come from `getModelInfo()` in `scripts/llm-runner.js`. Both include the Qwen 3, SmolLM2, Gemma 2, and Phi-3.5 families.

## Interaction flow

1. The first freeform input shows a consent prompt with the model name and download size; declining keeps the session in command-only mode.
2. Accepting starts a background download with a progress bar above the input; slash commands keep working while it runs.
3. Easter eggs and quick responses (from `scripts/personality.js`) answer instantly, before the model is loaded.
4. The prompt combines the persona, the current page content, ranked knowledge snippets, and conversation history; the reply streams into the terminal.

## Admin commands

Two commands override AI state for the current session and are not listed in `/help`:

* `/goldfinger:enableai`: initializes the AI components without editing the config; reports the active model and whether the WebLLM library is ready.
* `/goldfinger:aistatus`: prints initialization telemetry.

```text
🔍 AI System Status
AI Enabled:      ✅ Yes / ❌ No
WebLLM Library:  ✅ Loaded / ⏳ Loading...
LLM Runner:      ✅ Created / ❌ Not created
WebLLM Ready:    ✅ Yes / ⏳ Waiting...
Model Loaded:    ✅ Yes / ❌ No
Model Loading:   ⏳ Yes / ✅ No
User Consent:    ✅ Given / ❌ Not given
```

## Browser requirements

* WebGPU: Chrome or Edge 113+ with hardware acceleration enabled.
* WebLLM and the model weights load from the network on first use; there is no API key.

## Troubleshooting

* Freeform input answers "Unknown command (AI disabled)": set `ai.enabled: true` or run `/goldfinger:enableai`.
* The library never becomes ready: check WebGPU support and network access to the CDN; `scripts/webllm-loader.js` logs failures in the browser console, and `scripts/llm-runner.js` gives up waiting after 60 seconds.
