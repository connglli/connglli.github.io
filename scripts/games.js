"use strict";

/**
 * Games Module - Interactive mini-games for the console
 * 
 * Provides:
 * - Guess the Paper: Match paper titles to topics
 * - Terminal Trivia: Fun questions about Cong's work
 * - Word Scramble: Unscramble research-related terms
 * - Game state management
 */

class GameManager {
  constructor() {
    this.currentGame = null;
    this.gameState = {};
  }

  /**
   * Start a new game
   * @param {string} gameName - Name of the game to start
   * @returns {string} - Game intro message
   */
  startGame(gameName) {
    const games = {
      'guess-paper': this.guessThePaper.bind(this),
      'trivia': this.trivia.bind(this),
      'scramble': this.wordScramble.bind(this)
    };

    if (games[gameName]) {
      this.currentGame = gameName;
      this.gameState = { score: 0, round: 1 };
      return games[gameName]('start');
    }

    return null;
  }

  /**
   * Process a game answer
   * @param {string} answer - User's answer
   * @returns {string} - Response message
   */
  processAnswer(answer) {
    if (!this.currentGame) return null;

    const games = {
      'guess-paper': this.guessThePaper.bind(this),
      'trivia': this.trivia.bind(this),
      'scramble': this.wordScramble.bind(this)
    };

    return games[this.currentGame]('answer', answer);
  }

  /**
   * End current game
   */
  endGame() {
    const score = this.gameState.score || 0;
    this.currentGame = null;
    this.gameState = {};
    return score;
  }

  /**
   * Guess the Paper game - Match titles to research areas
   */
  guessThePaper(action, answer = null) {
    if (action === 'start') {
      const questions = [
        {
          question: "Which paper won the Best Paper Award at SOSP '23?",
          options: ["A) Artemis", "B) MetaMut", "C) Jigsaw", "D) Rx"],
          answer: "A",
          hint: "It's about JIT compiler testing!"
        },
        {
          question: "Which tool uses LLMs to generate mutation operators?",
          options: ["A) Artemis", "B) MetaMut", "C) HQCM", "D) Jigsaw"],
          answer: "B",
          hint: "Meta + Mutation = ?"
        },
        {
          question: "Which paper is about Android watch app synthesis?",
          options: ["A) Rx", "B) HQCM", "C) Jigsaw", "D) Artemis"],
          answer: "C",
          hint: "Like a puzzle that fits pieces together!"
        }
      ];

      this.gameState.questions = questions;
      this.gameState.currentQ = 0;
      const q = questions[0];
      
      return `
🎮 GUESS THE PAPER! 🎮

Match Cong's papers to their descriptions!
Type the letter (A, B, C, or D) to answer, or 'hint' for a clue.
Type 'quit' to exit.

Question 1/${questions.length}:
${q.question}

${q.options.join('\n')}

Your answer?`;
    }

    if (action === 'answer') {
      const answerUpper = answer.toUpperCase().trim();
      
      if (answerUpper === 'QUIT' || answerUpper === 'EXIT') {
        const score = this.endGame();
        return `Game over! Final score: ${score}/${this.gameState.questions.length}\n\nThanks for playing! Type '/publications' to learn more about these papers!`;
      }

      if (answerUpper === 'HINT') {
        const q = this.gameState.questions[this.gameState.currentQ];
        return `💡 Hint: ${q.hint}\n\nTry again!`;
      }

      const q = this.gameState.questions[this.gameState.currentQ];
      let response = "";

      if (answerUpper === q.answer || answerUpper === q.answer.toLowerCase()) {
        this.gameState.score++;
        response = `✅ Correct! Well done!\n\n`;
      } else {
        response = `❌ Oops! The correct answer was ${q.answer}.\n\n`;
      }

      this.gameState.currentQ++;

      if (this.gameState.currentQ >= this.gameState.questions.length) {
        const score = this.gameState.score;
        const total = this.gameState.questions.length;
        const percentage = Math.round((score / total) * 100);
        this.endGame();
        
        let message = `🎉 GAME COMPLETE! 🎉\n\nYour score: ${score}/${total} (${percentage}%)\n\n`;
        if (percentage === 100) {
          message += "Perfect score! You're a Cong Li research expert! 🏆";
        } else if (percentage >= 66) {
          message += "Great job! You know your stuff! 👍";
        } else {
          message += "Not bad! Check out /publications to learn more!";
        }
        
        return response + message;
      }

      const nextQ = this.gameState.questions[this.gameState.currentQ];
      return response + `Question ${this.gameState.currentQ + 1}/${this.gameState.questions.length}:
${nextQ.question}

${nextQ.options.join('\n')}

Your answer?`;
    }

    return null;
  }

  /**
   * Terminal Trivia - Fun facts and questions
   */
  trivia(action, answer = null) {
    if (action === 'start') {
      const questions = [
        {
          question: "How many JIT compiler bugs has Artemis found?",
          answer: "80",
          hints: ["It's between 50 and 100", "Think ate-y"],
          options: ["60", "70", "80", "90"]
        },
        {
          question: "At which university did Cong get his PhD?",
          answer: "NJU",
          hints: ["It's in Nanjing", "Abbreviated as NJU"],
          options: ["NJU", "ETH", "PKU", "THU"]
        },
        {
          question: "What conference hosted Cong's best paper award?",
          answer: "SOSP",
          hints: ["It's about Operating Systems", "SOSP '23"],
          options: ["ICSE", "SOSP", "ASPLOS", "FSE"]
        }
      ];

      this.gameState.questions = questions.map(q => ({...q}));
      this.gameState.currentQ = 0;
      this.gameState.hintsUsed = 0;
      const q = questions[0];

      return `
🧠 TERMINAL TRIVIA! 🧠

Test your knowledge about Cong's research!
Type your answer or 'hint' for help. 'quit' to exit.

Question 1/${questions.length}:
${q.question}

Options: ${q.options.join(' | ')}`;
    }

    if (action === 'answer') {
      const answerUpper = answer.toUpperCase().trim();

      if (answerUpper === 'QUIT' || answerUpper === 'EXIT') {
        const score = this.endGame();
        return `Game over! Score: ${score}/${this.gameState.questions.length}\nThanks for playing!`;
      }

      if (answerUpper === 'HINT') {
        const q = this.gameState.questions[this.gameState.currentQ];
        const hintIdx = Math.min(this.gameState.hintsUsed, q.hints.length - 1);
        this.gameState.hintsUsed++;
        return `💡 Hint: ${q.hints[hintIdx]}\n\nTry again!`;
      }

      const q = this.gameState.questions[this.gameState.currentQ];
      let response = "";

      if (answerUpper === q.answer.toUpperCase()) {
        this.gameState.score++;
        response = `✅ That's right! Awesome!\n\n`;
      } else {
        response = `❌ Not quite! The answer was: ${q.answer}\n\n`;
      }

      this.gameState.currentQ++;
      this.gameState.hintsUsed = 0;

      if (this.gameState.currentQ >= this.gameState.questions.length) {
        const score = this.gameState.score;
        const total = this.gameState.questions.length;
        this.endGame();
        return response + `🎊 Final Score: ${score}/${total}!\n\n` +
          (score === total ? "Perfect! You're a trivia master! 🏆" : "Great effort! Keep exploring!");
      }

      const nextQ = this.gameState.questions[this.gameState.currentQ];
      return response + `Question ${this.gameState.currentQ + 1}/${this.gameState.questions.length}:
${nextQ.question}

Options: ${nextQ.options.join(' | ')}`;
    }

    return null;
  }

  /**
   * Word Scramble - Unscramble research terms
   */
  wordScramble(action, answer = null) {
    if (action === 'start') {
      const words = [
        { word: "FUZZING", scrambled: "GNZUFIZ", hint: "Finding bugs by random testing" },
        { word: "COMPILER", scrambled: "LICOMPRE", hint: "Turns code into machine code" },
        { word: "ARTEMIS", scrambled: "MIRESAT", hint: "Cong's JIT compiler tester" },
        { word: "METAMUT", scrambled: "TAMMEUT", hint: "LLM-based mutation tool" },
        { word: "SYMBOLIC", scrambled: "SYMBOILC", hint: "Type of execution analysis" }
      ];

      this.gameState.words = words;
      this.gameState.currentW = 0;
      const w = words[0];

      return `
🔤 WORD SCRAMBLE! 🔤

Unscramble these research-related terms!
Type 'hint' for a clue or 'skip' to move on. 'quit' to exit.

Word 1/${words.length}:
${w.scrambled}

What's the word?`;
    }

    if (action === 'answer') {
      const answerUpper = answer.toUpperCase().trim();

      if (answerUpper === 'QUIT' || answerUpper === 'EXIT') {
        const score = this.endGame();
        return `Game over! You unscrambled ${score}/${this.gameState.words.length} words!\nNice work!`;
      }

      if (answerUpper === 'HINT') {
        const w = this.gameState.words[this.gameState.currentW];
        return `💡 Hint: ${w.hint}\n\nTry again!`;
      }

      if (answerUpper === 'SKIP') {
        const w = this.gameState.words[this.gameState.currentW];
        this.gameState.currentW++;
        
        if (this.gameState.currentW >= this.gameState.words.length) {
          const score = this.gameState.score || 0;
          this.endGame();
          return `The answer was: ${w.word}\n\n🎮 Game Over!\nYou got ${score}/${this.gameState.words.length} correct!`;
        }

        const nextW = this.gameState.words[this.gameState.currentW];
        return `The answer was: ${w.word}\n\nWord ${this.gameState.currentW + 1}/${this.gameState.words.length}:
${nextW.scrambled}`;
      }

      const w = this.gameState.words[this.gameState.currentW];
      let response = "";

      if (answerUpper === w.word) {
        this.gameState.score = (this.gameState.score || 0) + 1;
        response = `✅ Correct! It's ${w.word}!\n\n`;
      } else {
        response = `❌ Not quite. The answer was: ${w.word}\n\n`;
      }

      this.gameState.currentW++;

      if (this.gameState.currentW >= this.gameState.words.length) {
        const score = this.gameState.score || 0;
        const total = this.gameState.words.length;
        this.endGame();
        return response + `🎉 All done!\nFinal score: ${score}/${total}\n\n` +
          (score === total ? "Perfect! You're a word wizard! 🧙" : "Good job!");
      }

      const nextW = this.gameState.words[this.gameState.currentW];
      return response + `Word ${this.gameState.currentW + 1}/${this.gameState.words.length}:
${nextW.scrambled}`;
    }

    return null;
  }

  /**
   * Check if user is in a game
   * @returns {boolean}
   */
  isInGame() {
    return this.currentGame !== null;
  }

  /**
   * Get available games list
   * @returns {string}
   */
  static getGamesList() {
    return `
🎮 Available Games:

1. **guess-paper** - Match Cong's papers to their topics
2. **trivia** - Answer questions about his research
3. **scramble** - Unscramble research-related words

To play, just say "play [game-name]", for example:
- "play guess-paper"
- "play trivia"
- "play scramble"

Have fun! 🎉
    `;
  }
}

// Create singleton instance
const gameManager = new GameManager();

// Make it available globally
if (typeof window !== 'undefined') {
  window.gameManager = gameManager;
}
