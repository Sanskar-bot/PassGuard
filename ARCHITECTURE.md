# 🏗️ Architecture Overview

> **[AI Prompt: Architecture Diagram]**  
> *Prompt: "A high-tech, futuristic architectural diagram showing interconnected nodes representing 'Web Application', 'Extension', and 'Core Engine'. Glowing data lines connect a browser UI to a central processing brain. Dark theme with cyan and magenta accents."*

The Password Strength Analyzer is built on a modular, decentralized architecture that allows the same core analysis engine to power both a standalone web application and a browser extension.

## 1. Frontend Architecture (Web App)
The web application (`index.html`, `app.js`, `style.css`) serves as the standalone playground for the analysis engine. 
*   **Zero-Framework UI**: The application is built entirely using Vanilla JavaScript (ES2022) to minimize overhead.
*   **Debounced Execution**: Input is debounced by 120ms to prevent the heavy mathematics (Trie traversals, entropy calculations) from blocking the main thread during rapid typing.
*   **Node.js Static Server**: A zero-dependency Node.js server (`server.js`) bypasses local CORS restrictions required for native ES Modules (`type="module"`).

## 2. Browser Extension Architecture (Manifest V3)
The extension injects the analysis engine directly into the user's browsing experience.
*   **Content Script (`content.js`)**: Injects the inline UI widget below detected password fields. Uses a `MutationObserver` to watch for DOM changes (e.g., dynamically rendered login modals in React/Vue).
*   **Service Worker (`background.js`)**: Manages the extension badge score and handles cross-tab state.
*   **Web Workers (`workers/dictionary.worker.js`)**: Offloads the heavy CUPP-inspired personalized attack dictionary generation to a background thread, preventing UI lockups.
*   **Shadow DOM**: The inline widget and generator use the Shadow DOM to encapsulate CSS, preventing conflicts with the host website's stylesheets.

## 3. Analysis Engine
The engine (`modules/`) is the mathematical core, consumed by both the web app and the extension.
*   `strength.js`: Determines dynamic character set sizes and computes Shannon entropy.
*   `patterns.js`: Regex and map-based detection for sequential typing (`1234`), keyboard walks (`qwerty`), and date detection.
*   `wordlist.js`: A hybrid Hash-Set and Trie engine.
*   `scorer.js`: Aggregates the results from all other modules into a normalized 0-100 score based on weighted criteria.

## 4. Dictionary Engine (Trie + Hash-Set)
To provide real-time dictionary detection without memory bloat:
1.  **Hash-Set**: Stores the top 500 exact-match worst passwords for instant O(1) rejection.
2.  **Trie (Prefix Tree)**: Stores an 800+ word dictionary. The engine scans the password character-by-character to detect substrings (e.g., finding `dragon` inside `myDr4g0n99!`).
3.  **Leet-Speak Normalization**: Converts `P@ssw0rd` back to `password` before traversing the Trie.

## 5. Profile & Attack System
*   **Profile Storage**: User-provided profile data (names, pets, custom keywords) is stored securely in `chrome.storage.local`.
*   **Personalized Attack Simulator**: Analyzes the profile to generate 10,000+ permutations (e.g., `Sanskar2024!`, `Bruno_123`) inside a Web Worker.
*   **Context-Aware Generator**: Reads the current website's domain, extracts keywords (e.g., `Instagram` -> `Story`, `Photo`), and securely mixes them with the profile data to generate mathematically secure, memorable passwords.
