# AI Chat Testing Guide

## 🚀 Quick Start

### 1. Start Local Server
```bash
python3 -m http.server 8080
```

Then open: http://localhost:8080/index.html

### 2. Test Scenarios

#### ✅ Test 1: Slash Commands (Should Work As Before)
- Type: `/help`
- Expected: Shows list of available commands
- Type: `/highlights`
- Expected: Shows research highlights

#### ✅ Test 2: First Chat Message (Consent Dialog)
- Type: `hello` (without slash)
- Expected: 
  - Shows consent dialog asking if you want to use AI
  - Two buttons: "Yes, let's chat!" and "No, I'll use commands"
  - Mentions model download size and suggests /help

#### ✅ Test 3: Accept AI (Background Loading)
- Click "Yes, let's chat!"
- Expected:
  - Shows "Loading AI model in background..." message
  - Model loading progress bar appears (overlay)
  - Processes your original "hello" message
  - If you type `/help` or other slash commands during load, they should work!
  - If you type another chat message during load, it says "model is still loading..."

#### ✅ Test 4: Decline AI (Command-Only Mode)
- Type: `hi` (without slash)
- Click "No, I'll use commands"
- Expected:
  - Shows helpful message about using /help
  - Future non-slash messages remind you to use commands
  - Slash commands work normally

#### ✅ Test 5: Easter Eggs (Instant Responses)
Try these for instant fun responses (no model loading needed):
- `sudo`
- `sudo make me a sandwich`
- `hack the planet`
- `hello world`
- `404`
- `rm -rf /`
- `konami code`
- `the answer`
- `do a barrel roll`

#### ✅ Test 6: Quick Responses (Instant)
Try these for instant responses:
- `hello` / `hi` / `hey`
- `tell me a joke`
- `who are you`
- `help`
- `thanks`
- `bye`

#### ✅ Test 7: AI Chat (After Model Loads)
Once model is loaded (you'll see "🎉 AI is ready!" message):
- Type: `what does cong research?`
- Expected: Streaming response about Cong's work in fuzzing and security
- Type: `tell me about fuzzing`
- Expected: Geeky explanation with personality

#### ✅ Test 8: Mixed Mode
After AI loads:
- Type: `/publications` (slash command)
- Expected: Shows publications
- Type: `explain the first paper` (chat)
- Expected: AI explains it
- Type: `/clear` (slash command)
- Expected: Clears console

## 🎮 Key Features to Verify

### User Experience Flow
1. ✅ First non-slash input → consent dialog
2. ✅ User accepts → model loads in background
3. ✅ Slash commands work during loading
4. ✅ Progress bar shows loading status
5. ✅ Success message when ready
6. ✅ Streaming responses after ready

### Instant Responses (No Wait)
- ✅ Easter eggs work immediately
- ✅ Quick responses work immediately
- ✅ Slash commands always work

### Error Handling
- ✅ If model fails to load, shows clear error
- ✅ Suggests fallback to slash commands
- ✅ Mentions WebGPU requirement

## 🐛 Common Issues

### Issue: "WebLLM library not loaded"
**Solution**: Check browser console, make sure webllm-loader.js is loading correctly

### Issue: Model download very slow
**Expected**: First download is ~300-500MB, can take 2-10 minutes depending on connection

### Issue: "Your browser doesn't support WebGPU"
**Solution**: 
- Use Chrome 113+ or Edge 113+
- Make sure hardware acceleration is enabled in browser settings

### Issue: Model loads but no response
**Check**: 
- Browser console for errors
- Make sure you typed a non-slash message after model loaded
- Try refreshing and testing again

## 📊 Browser Compatibility

✅ **Supported:**
- Chrome 113+
- Edge 113+
- (WebGPU required)

❌ **Not Supported:**
- Firefox (no WebGPU yet)
- Safari (limited WebGPU)
- Older Chrome/Edge versions

## 💡 Pro Tips

1. **Test Easter Eggs First**: They're instant and don't require model loading
2. **Use /clear**: Clears console for clean testing
3. **Check Network Tab**: To see model download progress (first time only)
4. **Cached After First Load**: Second visit is much faster (model cached)
5. **Try During Loading**: Test slash commands while model loads to verify non-blocking

## 🎨 Visual Checks

- ✅ User messages: blue-ish bubble
- ✅ AI messages: green-ish bubble  
- ✅ System messages: yellow-ish
- ✅ Error messages: red-ish
- ✅ Loading indicator: animated dots
- ✅ Progress bar: animated with shimmer effect
- ✅ ASCII art: monospace, properly formatted
- ✅ Buttons: green, hover effects

## 🚨 What NOT to Do

- ❌ Don't push to upstream (as requested)
- ❌ Don't test on file:// protocol (won't work, needs http://)
- ❌ Don't expect instant AI responses on first message (model needs to load)
- ❌ Don't spam messages during loading (be patient)

## ✨ Expected Behavior Summary

```
User types non-slash for first time
  ↓
Consent dialog appears
  ↓
User clicks "Yes, let's chat!"
  ↓
Model starts loading in background (progress bar)
  ↓
MEANWHILE: Slash commands still work!
  ↓
Model finishes loading
  ↓
Success message: "🎉 AI is ready!"
  ↓
Now chat works with streaming responses
```

---

**Happy Testing! 🎉**

If you find any issues, check the browser console for detailed error messages.
