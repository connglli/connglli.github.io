"use strict";

/**
 * ASCII Art Library - Collection of ASCII art for fun responses
 * 
 * Themed ASCII art grouped by occasion; each category is a class field below
 */

const ASCIIArt = {
  /**
   * Welcome and greeting art
   */
  welcome: [
    `
    ██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗
    ██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝
    ██║ █╗ ██║█████╗  ██║     ██║     ██║   ██║██╔████╔██║█████╗  
    ██║███╗██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╔╝██║██╔══╝  
    ╚███╔███╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚═╝ ██║███████╗
     ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝
    `,
    `
     _      __     __                   
    | | /| / /__  / /______  __ _  ___ 
    | |/ |/ / _ \\/ / __/ _ \\/  ' \\/ -_)
    |__/|__/\\___/_/\\__/\\___/_/_/_/\\__/ 
    `
  ],

  /**
   * Thinking and processing art
   */
  thinking: [
    `
      (o.o)
      (> <)  Hmm, let me think...
    `,
    `
       _____
      /     \\
     | () () |  *thinking*
      \\  ^  /
       |||||
    `,
    `
    ┌─┐
    │ │╱  Processing...
    └─┘
    `
  ],

  /**
   * Celebration and success art
   */
  celebration: [
    `
        ★ﾟ･｡★｡･ﾟ★｡･ﾟ☆
      ｡☆｡･ﾟ･｡☆ﾟSuccess! ﾟ☆｡
        ★ﾟ･｡★｡･ﾟ★｡･ﾟ☆
    `,
    `
     ██╗    ██╗ ██████╗  ██████╗ ████████╗
     ██║    ██║██╔═══██╗██╔═══██╗╚══██╔══╝
     ██║ █╗ ██║██║   ██║██║   ██║   ██║   
     ██║███╗██║██║   ██║██║   ██║   ██║   
     ╚███╔███╔╝╚██████╔╝╚██████╔╝   ██║   
      ╚══╝╚══╝  ╚═════╝  ╚═════╝    ╚═╝   
    `,
    `
    🎉 🎊 🥳 🎈
    `
  ],

  /**
   * Hacker and terminal themed art
   */
  hacker: [
    `
    ╔═╗┬ ┬┌┬┐┬ ┬┌─┐┬─┐┬┌─┐┌─┐┌┬┐
    ╠═╣│ │ │ ├─┤│ │├┬┘│┌─┘├┤  ││
    ╩ ╩└─┘ ┴ ┴ ┴└─┘┴└─┴└─┘└─┘─┴┘
    [Access Granted]
    `,
    `
    > sudo make me a sandwich
    [sudo] password: ********
    ✓ Sandwich.exe compiled successfully
    `,
    `
    01001000 01000001 01000011 01001011
    01000101 01010010  [DECODED]
    
    Welcome to the Matrix...
    `
  ],

  /**
   * Compiler and bug themed (relevant to Cong's research)
   */
  compiler: [
    `
    ╔═══════════════════════════╗
    ║  🐛 Bug Found!            ║
    ║                           ║
    ║  Fuzzing in progress...   ║
    ║  [████████████░░░] 85%    ║
    ╚═══════════════════════════╝
    `,
    `
     _____                     _ _           
    /  __ \\                   (_) |          
    | /  \\/ ___  _ __ ___  _ __| | | ___ _ __ 
    | |    / _ \\| '_ \` _ \\| '_ \\ | |/ _ \\ '__|
    | \\__/\\ (_) | | | | | | |_) | | |  __/ |   
     \\____/\\___/|_| |_| |_| .__/|_|_|\\___|_|   
                          | |                  
                          |_|                  
    `,
    `
    [JIT COMPILER TEST]
    Test Cases: 80+
    Status: ✓ Bugs found
    `,
    `
     /\\_/\\
    ( o.o )  Artemis is hunting bugs...
     > ^ <
    `
  ],

  /**
   * Fun and random art
   */
  fun: [
    `
       /\\_/\\
      ( ^.^ ) _
        \\"/  ( )
      ( | | )
     (__d b__)
    `,
    `
    ┌─┐┌─┐┌─┐┬  
    │  │ ││ ││  
    └─┘└─┘└─┘┴─┘
    `,
    `
       ___
      /   \\
     |     |  < Hello from the void!
     |     |
      \\___/
    `,
    `
    ▲ ▲
    █▀█ 404 - Humor not found
    `,
    `
         (__)
         (oo)
   /------\\/
  / |    ||
 *  /\\---/\\
    ~~   ~~
    `,
    `
    ╔═╗┬ ┬┌─┐┌─┐┌┬┐┬
    ╠═╝├─┤├┤ ├─┤ │ │
    ╩  ┴ ┴└  ┴ ┴ ┴ o
    `
  ],

  /**
   * Robot and AI themed
   */
  robot: [
    `
     [o_o]
     |ooo|  < Beep boop!
    _|___|_
    `,
    `
    ╔═══╗
    ║ ● ║ AI Assistant v3.0
    ╚═══╝ Online and ready!
    `,
    `
       _____
      |     |
      | 0 0 |
      |  -  |
      |_____|
     /|     |\\
    `,
    `
    01000001 01001001 
    🤖 Artificial Intelligence
    `
  ],

  /**
   * Error and warning art
   */
  error: [
    `
    ⚠️  WARNING ⚠️
    ╔════════════╗
    ║  SEGFAULT  ║
    ╚════════════╝
    `,
    `
     _____ ____  ____   ___  ____  
    | ____|  _ \\|  _ \\ / _ \\|  _ \\ 
    |  _| | |_) | |_) | | | | |_) |
    | |___|  _ <|  _ <| |_| |  _ < 
    |_____|_| \\_\\_| \\_\\\\___/|_| \\_\\
    `,
    `
    💥 BOOM! 💥
    Something went wrong...
    `
  ],

  /**
   * Get random art from a category
   * @param {string} category - Category name
   * @returns {string} - Random ASCII art or null
   */
  getRandom(category = 'fun') {
    const artList = this[category];
    if (!artList || artList.length === 0) return null;
    return artList[Math.floor(Math.random() * artList.length)];
  },

  /**
   * Get all categories
   * @returns {Array} - List of category names
   */
  getCategories() {
    return Object.keys(this).filter(key => 
      typeof this[key] !== 'function' && Array.isArray(this[key])
    );
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.ASCIIArt = ASCIIArt;
}
