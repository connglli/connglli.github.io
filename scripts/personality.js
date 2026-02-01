"use strict";

/**
 * Personality Module - Defines AI personality, easter eggs, and fallback responses
 * 
 * This provides:
 * - Predefined responses for common queries (instant responses)
 * - Easter eggs for fun discoveries
 * - ASCII art collection
 * - Jokes and programming humor
 */

// ============================================================================
// ASCII Art Collection
// ============================================================================

const asciiArt = {
  welcome: `
    ██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗
    ██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝
    ██║ █╗ ██║█████╗  ██║     ██║     ██║   ██║██╔████╔██║█████╗  
    ██║███╗██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╔╝██║██╔══╝  
    ╚███╔███╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚═╝ ██║███████╗
     ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝
  `,

  robot: `
      _____
     |     |
     | O O |
     |  ^  |
     |_____|
    /|     |\\
   / |     | \\
  `,

  thinking: `
    ( o.o )
     > ^ <
    /|   |\\
  `,

  happy: `
    \\(^_^)/
  `,

  hacker: `
     _____
    /     \\
   | () () |
    \\  ^  /
     |||||
     |||||
  `,

  coffee: `
    ( (
     ) )
   ....
   |  |]
   |  |
   \\__/
  `
};

// ============================================================================
// Easter Eggs
// ============================================================================

const easterEggs = {
  'sudo': `
Nice try! 😄 But I'm afraid I don't have sudo access here.
(Though between you and me, being an AI means I'm basically root already... 🤫)

Try asking me about Cong's research or type /help for commands!
  `,

  'sudo make me a sandwich': `
${asciiArt.coffee}

Okay. *makes you a sandwich* 🥪

But seriously, check out /highlights to see Cong's cool research, or just chat with me!
  `,

  'hello world': `
${asciiArt.robot}

Hello, World! 👋 Classic first program vibes!

I'm your friendly AI sidekick here. Want to explore Cong's work?
Try /publications or ask me anything!
  `,

  '404': `
Error 404: Brain not found! 🧠❌

Just kidding, I'm right here. What can I help you find?
  `,

  'rm -rf /': `
⚠️  WHOA THERE! Let's not nuke anything today! 

That command is a bit too spicy even for me. 🌶️
How about we explore something safer, like /opensource?
  `,

  'hack the planet': `
${asciiArt.hacker}

HACK THE PLANET! 🌍💻

Now THAT's the spirit! Though Cong prefers to hack bugs, not systems.
Check out his fuzzing work with /highlights!
  `,

  'konami code': `
⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️

You've unlocked the secret level! 🎮

*Achievement unlocked: Console Wizard* ✨

Fun fact: Cong's research helps find bugs in games too!
  `,

  'the answer': `
42. 🌌

The Answer to the Ultimate Question of Life, the Universe, and Everything!

Now that we've solved that, want to explore something? Try /hobbies to see what Cong enjoys!
  `,

  'do a barrel roll': `
*360° spin* 🌀

Wheeee! That was fun! 

While we're being playful, check out /highlights for some seriously cool research!
  `
};

// ============================================================================
// Programming Jokes
// ============================================================================

const jokes = [
  "Why do programmers prefer dark mode? Because light attracts bugs! 🐛💡",
  "Why did the developer go broke? Because he used up all his cache! 💰",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
  "Why do Java developers wear glasses? Because they don't C#! 👓",
  "What's a programmer's favorite hangout? The Foo Bar! 🍺",
  "Why did the programmer quit his job? He didn't get arrays! 📊",
  "What do you call a programmer from Finland? Nerdic! 🇫🇮",
  "Why was the JavaScript developer sad? Because he didn't Node how to Express himself! 😢",
  "What's the object-oriented way to become wealthy? Inheritance! 💰",
  "Why do programmers hate nature? It has too many bugs! 🌳🐛"
];

// ============================================================================
// Quick Responses (for common queries)
// ============================================================================

const quickResponses = {
  patterns: [
    {
      regex: /^(hi|hello|hey|yo|sup|what'?s up|greetings)/i,
      response: () => {
        const greetings = [
          `Hey there, hacker! 👾 Welcome to Cong's console. I'm your AI sidekick. Need help navigating? Try /help or just ask me anything!`,
          `Yo! 🤖 Ready to explore some cool security research? Ask me about Cong's work or type /help for commands!`,
          `Hello, friend! 💚 I'm here to help you explore Cong's research in the geeky way possible. What's up?`,
          `*beep boop* 🤖 Greetings, human! Want to know about fuzzing? Or maybe /hobbies? Just ask!`
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
      }
    },
    {
      regex: /^(bye|goodbye|see ya|exit|quit)/i,
      response: () => "So long, and thanks for all the fish! 🐟 Come back anytime! (Type /clear to clean up)"
    },
    {
      regex: /^(thanks|thank you|thx)/i,
      response: () => "You're welcome! 😊 Happy to help. Want to explore more? Try /publications or /opensource!"
    },
    {
      regex: /tell (me )?a joke|joke|funny/i,
      response: () => jokes[Math.floor(Math.random() * jokes.length)]
    },
    {
      regex: /who (are|r) you|what are you/i,
      response: () => "I'm a geeky AI assistant running in your browser! 🤖 I'm here to help you explore Cong's research and have some fun. Powered by WebLLM!"
    },
    {
      regex: /help|how (do|can) i|what can you/i,
      response: () => "I can help you explore Cong's work! Try:\n- Asking about his research (fuzzing, security, etc.)\n- Using slash commands like /highlights or /publications\n- Just chatting for fun!\n\nType /help to see all commands! 🎮"
    }
  ]
};

// ============================================================================
// Personality Functions
// ============================================================================

/**
 * Check if message matches an easter egg
 * @param {string} message - User message
 * @returns {string|null} - Easter egg response or null
 */
function checkEasterEgg(message) {
  const lower = message.toLowerCase().trim();
  return easterEggs[lower] || null;
}

/**
 * Check if message matches a quick response pattern
 * @param {string} message - User message
 * @returns {string|null} - Quick response or null
 */
function checkQuickResponse(message) {
  for (const pattern of quickResponses.patterns) {
    if (pattern.regex.test(message)) {
      return pattern.response();
    }
  }
  return null;
}

/**
 * Get a random joke
 * @returns {string} - Random programming joke
 */
function getRandomJoke() {
  return jokes[Math.floor(Math.random() * jokes.length)];
}

/**
 * Get ASCII art by name
 * @param {string} name - Art name
 * @returns {string|null} - ASCII art or null
 */
function getAsciiArt(name) {
  return asciiArt[name] || null;
}

/**
 * Get a random ASCII art
 * @returns {string} - Random ASCII art
 */
function getRandomAsciiArt() {
  const keys = Object.keys(asciiArt);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return asciiArt[randomKey];
}

// Export to window
if (typeof window !== 'undefined') {
  window.personality = {
    checkEasterEgg,
    checkQuickResponse,
    getRandomJoke,
    getAsciiArt,
    getRandomAsciiArt,
    asciiArt,
    jokes
  };
}
