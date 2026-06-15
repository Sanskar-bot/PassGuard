# 📂 Folder Structure

This repository acts as a monorepo containing both the standalone Web Application and the Browser Extension, with a shared analysis engine.

```text
📦 Password-analyzer/
├── 📄 index.html               ← Web App: Main UI shell
├── 🎨 style.css                ← Web App: Styling & dark theme
├── 🧠 app.js                   ← Web App: Orchestrator & DOM wiring
├── 🖥️  server.js               ← Zero-dependency Node.js static server
├── 🚀 start.bat                ← Windows one-click launcher
│
├── 📁 data/
│   └── 📋 common_passwords.js  ← Hash-set of top passwords + Trie dictionary words
│
├── 📁 extension/               ← The Manifest V3 Browser Extension
│   ├── 📄 manifest.json        ← Extension configuration
│   ├── 🧠 background.js        ← Service worker (badge updates, cross-tab tracking)
│   ├── 📁 content/             
│   │   └── 🧠 content.js       ← Injected script: Form detection & inline widget
│   ├── 📁 popup/
│   │   ├── 📄 popup.html       ← Extension dashboard UI
│   │   ├── 🧠 popup.js         ← Extension dashboard logic
│   │   └── 🎨 popup.css        
│   ├── 📁 workers/
│   │   └── 🧠 dictionary.worker.js ← Web worker for heavy combinatorial math
│   ├── 📁 pages/               ← Extension sub-pages (Settings, About, Dashboard)
│   └── 📁 modules/             ← Symbolic links / copied modules from shared core
│
├── 📁 shared/                  ← Shared utilities (if applicable in future versions)
├── 📁 tests/                   ← Automated unit and integration tests
│   ├── 🧠 contextual-generator.test.mjs
│   └── 🧠 demo-personal-gen.mjs
│
└── 📁 docs/                    ← Documentation visual assets (AI prompts)
    └── 📁 images/
```

## Core Modules (`modules/`)
The `modules/` folder is the brain of the application. These files are pure ES Modules designed to run locally in the browser.

*   `strength.js`: Entropy and charset math.
*   `wordlist.js`: Trie and Hash-Set dictionary engine.
*   `patterns.js`: Repetition and keyboard walk regex.
*   `username.js`: Distance and similarity checking.
*   `generator.js`: Core cryptographically secure random generator.
*   `profilePasswordGenerator.js`: Template-based context-aware generator.
*   `websiteContext.js`: Domain-to-keyword extraction.
*   `personalDictionaryGenerator.js`: Combinatorial math for attack simulation.
*   `generatorValidator.js`: The security gatekeeper combining all engine modules.
*   `scorer.js`: Aggregates the 0-100 score.
*   `suggestions.js`: Evaluates results and generates user feedback strings.
