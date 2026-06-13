# Password Strength Analyzer: Detailed Project Guide

This document breaks down the architecture, data flow, and underlying logic of the **Password Strength Analyzer** project. 

> [!IMPORTANT]  
> **Clarification on "Encryption"**: 
> This project is a **Password Analyzer**, not a password manager or vault. Therefore, **it does not perform encryption** (like AES-GCM or RSA). Its primary goal is to *evaluate* the mathematical and practical strength of a plaintext password. It does feature a **cryptographically secure random password generator**, which uses the browser's native `crypto.getRandomValues()` API to generate numbers, but it does not encrypt or decrypt data. It runs 100% offline in the browser.

---

## 1. High-Level Architecture

The project is a purely frontend web application built using **Vanilla JavaScript (ES Modules)**, HTML, and CSS. Because it uses ES Modules (`import/export`), it must be served over an HTTP connection, which is why a tiny zero-dependency Node.js server (`server.js`) is included.

### Directory Breakdown
- **`index.html` & `style.css`**: The UI skeleton and styling.
- **`app.js`**: The main orchestrator. It listens to user typing, calls the analysis modules, and updates the UI.
- **`server.js`**: A minimal HTTP server to bypass CORS restrictions for ES Modules.
- **`modules/`**: The "brain" of the app. Each file here handles one specific type of security check.
- **`data/`**: Contains static datasets, like `common_passwords.js` (a massive list of terrible passwords and dictionary words).

---

## 2. The Data Flow (Pipeline)

When a user types a password into the input field, the following sequence occurs:

1. **Debouncing (`app.js`)**
   - The app waits for 120ms after the user stops typing. This prevents the heavy mathematical analysis from freezing the browser while the user is actively hitting keys.
2. **Analysis Execution (`app.js`)**
   - The raw password is simultaneously fed into several isolated analysis modules.
3. **Scoring (`scorer.js`)**
   - The results from all modules are aggregated. The `scorer.js` script weights the results and calculates a final score out of 100.
4. **Crack Time Estimation (`bruteforce.js`)**
   - Using the length and character set of the password, the app calculates how long it would take various attackers (from a simple web login script to a massive GPU cluster) to guess the password.
5. **UI Update (`app.js`)**
   - The UI is painted with the new score, progress ring, crack times, and specific improvement suggestions.

---

## 3. Deep Dive into the Modules

The true power of this analyzer lies in its modular checks. Here is exactly what happens inside the `modules/` folder:

### A. Strength & Entropy (`strength.js`)
* **What it does:** Looks at the raw math of the password.
* **How it works:** It calculates the **Character Set Size**. If you use only lowercase letters, the charset size is 26. If you use lowercase + uppercase + numbers + symbols, the charset size jumps to 94. 
* **Entropy Math:** It uses the formula `Length × log2(Charset Size)`. A password with high entropy is mathematically unpredictable. 

### B. Wordlist & Substring Scanning (`wordlist.js`)
* **What it does:** Checks if the password contains common dictionary words or is a known leaked password.
* **How it works:** 
  1. **Hash-Set (O(1) lookup):** It checks if the entire password perfectly matches a known bad password (like "123456"). This is instantaneous.
  2. **Trie Engine (Prefix Tree):** It loads dictionary words into a tree structure. It then scans the user's password character-by-character to see if a dictionary word is *hiding* inside it (e.g., finding "apple" inside "my_apple_99!").
  3. **Leet-Speak Normalization:** Before checking the Trie, it converts "1337-speak" back to normal letters. So `P@ssw0rd` is analyzed as `password`.

### C. Pattern Detection (`patterns.js`)
* **What it does:** Looks for lazy human typing habits.
* **How it works:** It uses regular expressions and mapping to detect:
  - **Keyboard Walks:** e.g., "qwerty", "asdfgh".
  - **Sequential Runs:** e.g., "123456", "abcdef".
  - **Repeats:** e.g., "abcabc", "111111".
  - **Dates:** e.g., "2024", "1999".

### D. Username Matching (`username.js`)
* **What it does:** Ensures the password isn't easily guessable based on the user's identity.
* **How it works:** If a username is provided, it checks if the password contains the username, contains the username backwards, or is a very close match (using similarity algorithms).

### E. Bruteforce Math (`bruteforce.js`)
* **What it does:** Gives a human-readable estimate of how long cracking would take.
* **How it works:** It takes the total number of possible combinations (`CharsetSize ^ Length`) and divides it by different "guesses per second" speeds:
  - Throttled Online: 10 guesses/sec
  - Unthrottled Online: 1,000 guesses/sec
  - Offline Bcrypt: 10,000 guesses/sec
  - Offline GPU MD5: 10,000,000,000 guesses/sec

### F. Scoring (`scorer.js`)
* **What it does:** Generates the final 0–100 grade.
* **How it works:** 
  - Length (25 max pts)
  - Variety (20 max pts)
  - Entropy (20 max pts)
  - Wordlist (15 max pts)
  - Patterns (10 max pts)
  - Username (10 max pts)
  - *Note: Exact dictionary matches instantly subtract massive points.*

---

## 4. The Password Generator (`generator.js`)

While the app doesn't do encryption, it does do cryptographic generation. 

> [!TIP]
> Never use `Math.random()` for security purposes, as it is highly predictable.

This project's generator uses the **Web Crypto API** (`window.crypto.getRandomValues()`). This taps directly into the operating system's secure entropy pool (the same stuff used to secure HTTPS connections). It uses **rejection sampling** to ensure that every character has an exactly equal probability of being chosen, completely avoiding "modulo bias" which can weaken generated passwords.

## Summary

This project is a masterclass in **frontend data structures and algorithms**. By combining Hash-Sets for instant lookups, Tries for complex substring scanning, and rigorous entropy math, it achieves a deep analysis of password strength entirely within the user's browser, without ever needing to send sensitive keystrokes to a remote server.
