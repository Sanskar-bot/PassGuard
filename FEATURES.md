# ✨ Features

> **[AI Prompt: Feature Highlights]**  
> *Prompt: "A grid of 4 sleek, modern icons. 1. A glowing brain (Intelligent Analysis), 2. A hacker silhouette with a shield (Attack Simulation), 3. A browser window with a lock (Extension), 4. A magic wand over a lock (Smart Generator). Dark theme, neon accents."*

The Password Strength Analyzer is divided into three core environments: the **Web Application**, the **Browser Extension**, and the **Analysis Engine**.

## 🧠 Core Analysis Engine
The beating heart of the project. A zero-dependency JavaScript engine that evaluates passwords mathematically and practically.

*   **Entropy Calculation**: Computes Shannon entropy based on dynamic character set detection.
*   **Hash-Set Dictionary Lookup**: O(1) detection of the top 500 worst passwords.
*   **Trie-Based Substring Scanning**: Detects dictionary words hiding inside larger passwords (e.g., `SuperSecret99` flags `Secret`).
*   **Leet-Speak Normalization**: Translates `P@55w0rd` to `password` before analysis.
*   **Keyboard Walk Detection**: Identifies lazy typing patterns like `qwerty` or `asdfgh`.
*   **Sequence & Repeat Detection**: Flags `123456` or `abcabc`.
*   **Username Similarity Engine**: Prevents passwords derived from usernames (e.g., `JohnDoe` -> `eodnhoj`).
*   **Crack Time Estimation**: Calculates time-to-crack against throttled APIs, fast offline hashes, and GPU clusters.
*   **Actionable Suggestions**: Provides specific, prioritized tips to improve the password.

## 🌐 Web Application
A blazing-fast, serverless UI for testing passwords.

*   **120ms Debounce Architecture**: Analyzes the password in real-time as you type without freezing the UI.
*   **Dynamic Visual Scoring**: A 0-100 score with a color-coded circular progress ring (Weak/Moderate/Strong/Very Strong).
*   **Detailed Breakdown Dashboard**: Visualizes exactly where the password lost or gained points.
*   **Cryptographically Secure Generator UI**: Sliders and checkboxes to generate random passwords using the Web Crypto API.
*   **Zero-Tracking Guarantee**: Everything runs locally in the browser; no data is ever sent to a server.

## 🧩 Browser Extension (Manifest V3)
Brings the power of the engine directly into your daily browsing.

*   **Inline Input Widget**: Injects a live strength meter directly below `<input type="password">` fields on any website.
*   **Context-Aware Form Detection**: Automatically distinguishes between "Login", "Signup", and "Password Change" forms.
*   **Personalized Password Generator**: Appears automatically on account creation pages. Integrates website context (e.g., "Github", "Repo") and your personal profile.
*   **Personalized Attack Simulator**: A CUPP-inspired engine running in a Web Worker that generates 10,000+ targeted guesses based on your profile to see if your password is guessable.
*   **Cross-Domain Reuse Prevention**: Stores SHA-256 signatures of generated passwords to warn you if you reuse a password across different websites.
*   **Dictionary Export**: Download the custom targeted dictionary generated from your profile as a `.txt` file.
*   **Real-Time Toolbar Badge**: Shows the live password score directly on the extension icon while typing.
*   **100% Local Processing**: Analyzes DOM inputs without network requests.

> **[Screenshot Placeholder]**  
> *Path: `docs/images/extension-widget-demo.png`*  
> *Caption: "The inline widget evaluating a password in real-time on a login form."*
