/**
 * WebLLM Loader - Loads WebLLM library and makes it globally available
 */

(async function() {
  try {
    // Dynamically import WebLLM
    const webllm = await import('https://esm.run/@mlc-ai/web-llm');
    
    // Make it globally available
    window.webllm = webllm;
    
    console.log('✅ WebLLM library loaded successfully');
    
    // Dispatch event so other scripts know it's ready
    window.dispatchEvent(new Event('webllm-loaded'));
  } catch (error) {
    console.error('❌ Failed to load WebLLM library:', error);
    window.dispatchEvent(new Event('webllm-load-failed'));
  }
})();
