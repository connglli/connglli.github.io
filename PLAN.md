# Qwen 3 0.5b Chat Integration Plan

## Project Overview
Transform the console homepage to support conversational chat (non-slash commands) using Qwen 3 0.5b, while maintaining existing slash command functionality.

**Goal**: Make the homepage fun and engaging for visitors through an AI chatbot with a geeky hacker personality.

---

## Architecture

```
User Input (console.js)
  │
  ├─ Starts with "/" ? ──> Slash Command Handler (existing)
  │
  └─ No ──> Chat Handler (NEW)
              │
              ├─ Initialize WebLLM (lazy, first time only)
              ├─ Build context (knowledge base + chat history)
              ├─ Generate response (streaming)
              └─ Render chat bubbles
```

---

## Implementation Phases

### ✅ Phase 0: Planning & Setup
- [x] Create PLAN.md
- [x] Review WebLLM documentation
- [x] Install @mlc-ai/web-llm package (v0.2.80)
- [ ] Test model availability (Qwen2 0.5B)

### 🔧 Phase 1: Core Chat Infrastructure (4-6 hours)

#### Step 1.1: Add Dependencies
- [x] Research WebLLM vs Transformers.js for Qwen 0.5b
- [x] Add WebLLM via CDN to index.html
- [ ] Test model loading in browser

**Files**: `index.html` ✅

#### Step 1.2: Create Chat Module
- [x] Create `scripts/chat.js`
  - [x] Export chat initialization function
  - [x] Handle user message input
  - [x] Return AI responses with streaming
  - [x] Error handling
  - [x] Geeky hacker personality system prompt

**Files**: `scripts/chat.js` ✅

#### Step 1.3: Create LLM Runner
- [x] Create `scripts/llm-runner.js`
  - [x] Lazy model loading
  - [x] Loading progress indicator
  - [x] Model initialization
  - [x] Inference with streaming
  - [x] Cache management

**Files**: `scripts/llm-runner.js` ✅

#### Step 1.4: Modify Console Input Handler
- [x] Update `console.js` `runCommand()`
  - [x] Detect non-slash input
  - [x] Route to chat handler
  - [x] Keep slash commands unchanged
  - [x] Add handleChatMessage function
  - [x] Model loading overlay
  - [x] Streaming response rendering

**Files**: `scripts/console.js` ✅

#### Step 1.5: Create Chat UI
- [x] Create `styles/chat.css`
  - [x] Chat bubble styling (user/AI distinct)
  - [x] Loading indicator
  - [x] Typing animation
  - [x] Error states
  - [x] Model loading progress overlay
  - [x] Mobile responsive design

**Files**: `styles/chat.css` ✅, `index.html` ✅

---

### 🤖 Phase 2: AI Personality & Context (3-4 hours)

#### Step 2.1: System Prompt Engineering
- [x] Create `scripts/personality.js`
  - [x] Base system prompt (hacker vibe) - in chat.js
  - [x] Response templates
  - [x] Tone guidelines
  - [x] Easter eggs collection
  - [x] Quick response patterns
  - [x] Programming jokes database
  - [x] ASCII art library

**Files**: `scripts/personality.js` ✅

#### Step 2.2: Knowledge Base Builder
- [ ] Create `scripts/knowledge.js`
  - [ ] Parse markdown content files
  - [ ] Extract key facts about Cong
  - [ ] Build command mapping
  - [ ] Return relevant context for queries

**Files**: `scripts/knowledge.js` (PENDING)

#### Step 2.3: Context Integration
- [ ] Update chat.js to use knowledge base
- [ ] Implement RAG-lite (retrieve relevant info)
- [ ] Inject context into prompts

**Files**: `scripts/chat.js` (PENDING)

---

### 🎮 Phase 3: Fun Features (5-7 hours)

#### Step 3.1: Easter Eggs & Secrets
- [ ] Create easter egg detection
  - [ ] Special keyword triggers
  - [ ] Hidden commands
  - [ ] Fun surprises

**Files**: `scripts/personality.js` (MODIFY)

#### Step 3.2: ASCII Art
- [ ] Create `scripts/ascii-art.js`
  - [ ] ASCII art library
  - [ ] Random art selector
  - [ ] Themed collections (welcome, thinking, celebration)

**Files**: `scripts/ascii-art.js` (NEW)

#### Step 3.3: Mini-Games
- [ ] Create `scripts/games.js`
  - [ ] "Guess the Paper" game
  - [ ] Terminal trivia
  - [ ] Word scramble
  - [ ] Game state management

**Files**: `scripts/games.js` (NEW)

#### Step 3.4: Context-Aware Help
- [ ] Track user navigation
- [ ] Detect confusion patterns
- [ ] Smart command suggestions
- [ ] Adaptive responses

**Files**: `scripts/chat.js` (MODIFY)

#### Step 3.5: Jokes & Entertainment
- [ ] Programming jokes database
- [ ] Security puns
- [ ] Fun facts
- [ ] Random humor injection

**Files**: `scripts/personality.js` (MODIFY)

---

### ✨ Phase 4: Polish & Optimization (2-3 hours)

#### Step 4.1: Performance Optimization
- [ ] Implement model caching
- [ ] Optimize prompt size
- [ ] Response streaming
- [ ] Lazy loading verification

**Files**: `scripts/llm-runner.js` (MODIFY)

#### Step 4.2: Mobile & Accessibility
- [ ] Touch-friendly interface
- [ ] Screen reader support (ARIA labels)
- [ ] Responsive chat bubbles
- [ ] WebGPU fallback detection

**Files**: `styles/chat.css` (MODIFY), `scripts/chat.js` (MODIFY)

#### Step 4.3: Visual Enhancements
- [ ] Smooth animations
- [ ] Typing indicators
- [ ] Scroll behavior
- [ ] CRT effects (optional)

**Files**: `styles/chat.css` (MODIFY)

#### Step 4.4: Error Handling
- [ ] Graceful degradation
- [ ] Retry mechanisms
- [ ] User-friendly error messages
- [ ] Fallback responses

**Files**: `scripts/chat.js` (MODIFY), `scripts/llm-runner.js` (MODIFY)

---

## File Structure

```
homepage/
├── PLAN.md                 [NEW] - This file
├── index.html              [MODIFY] - Add dependencies & chat CSS
├── scripts/
│   ├── console.js          [MODIFY] - Route chat vs commands
│   ├── chat.js             [NEW] - Chat orchestrator
│   ├── llm-runner.js       [NEW] - WebLLM wrapper
│   ├── personality.js      [NEW] - Prompts & character
│   ├── games.js            [NEW] - Mini-games
│   ├── knowledge.js        [NEW] - Parse & serve content
│   └── ascii-art.js        [NEW] - ASCII art library
├── styles/
│   └── chat.css            [NEW] - Chat styling
└── content/
    └── (existing files)
```

---

## Technical Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Model** | Qwen 0.5b via WebLLM | Client-side, no server, privacy-friendly |
| **Loading** | Lazy (first chat message) | Fast initial page load |
| **Streaming** | Yes | Better UX, perception of speed |
| **Context** | Pre-parsed markdown | 0.5b needs concise context |
| **Fallback** | Predefined responses | Works without model |
| **Storage** | localStorage for chat history | Persist across refreshes |

---

## Design Principles

1. **Fun First**: Prioritize entertainment and engagement
2. **Non-Intrusive**: Don't break existing slash commands
3. **Progressive Enhancement**: Works without AI (fallback)
4. **Performance**: Lazy loading, caching, optimization
5. **Geeky Aesthetic**: Match terminal/hacker theme

---

## Key Configuration Answers

- **Primary Role**: Mix of navigation, entertainment, and games
- **Personality**: Geeky hacker vibe
- **Priority Features**: All (context help, Q&A, games, jokes, ASCII art, easter eggs)
- **Runtime**: Client-side in browser
- **Model Load**: Lazy (on first chat)
- **Response Length**: Short & snappy (2-3 sentences) with option for detail
- **Chat History**: Persist in localStorage
- **Command Execution**: AI can suggest but not auto-execute slash commands

---

## Progress Tracking

### Commits Made
*This section will be updated as commits are made*

1. ✅ `791eb0a` - docs: add comprehensive implementation plan for Qwen 3 0.5b chat integration
2. ✅ `8d4a18f` - feat: install @mlc-ai/web-llm package for in-browser LLM inference
3. ✅ `3c99801` - feat: implement core chat infrastructure with WebLLM integration
4. ✅ `d9bb359` - docs: update PLAN.md - Phase 1 core infrastructure complete
5. ✅ `20a485d` - fix: properly load WebLLM as ES module and make it globally available
6. ✅ `96c85bc` - feat: add personality module with easter eggs and instant responses

### Current Status
**Phase**: 1 ✅ Complete, Phase 2 🔄 In Progress (50% done)
**Last Updated**: 2025-02-01
**Blockers**: None
**Next**: Test chat functionality in browser, then create knowledge base

### Notes
- WebLLM provides comprehensive model support via MLC format
- Package installed: @mlc-ai/web-llm@0.2.80
- Using Qwen2-0.5B-Instruct-q4f16_1-MLC model
- Phase 1 complete! Core infrastructure ready
- Phase 2 partially complete: personality and easter eggs working
- Easter eggs provide instant fun responses without waiting for model
- Local server started on port 8080 for testing
- Ready to test basic chat functionality before proceeding

---

## Testing Checklist

- [ ] Slash commands still work
- [ ] Chat messages render correctly
- [ ] Model loads successfully
- [ ] Streaming works
- [ ] Mobile responsive
- [ ] Error states handled
- [ ] Easter eggs functional
- [ ] Games playable
- [ ] Knowledge base accurate
- [ ] ASCII art displays correctly

---

## Future Enhancements (Post-Launch)

- Voice input/output
- Multi-language support
- Personalized responses (remember user)
- More complex games
- Integration with external APIs
- Model fine-tuning with Cong's specific content

---

## Notes & Observations

*Space for implementation notes, learnings, and observations*

