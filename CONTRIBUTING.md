# 🤝 Contributing to Password Strength Analyzer

First off, thank you for considering contributing to the Password Strength Analyzer! It's people like you that make this tool stronger.

## Code of Conduct

By participating in this project, you agree to maintain a respectful, welcoming, and inclusive environment. 

## How Can I Contribute?

### 1. Adding to the Dictionary
The `data/common_passwords.js` file contains our local dictionary. You can contribute by finding new, highly prevalent weak passwords or patterns to include in the Hash-Set or Trie engine.

### 2. Improving Pattern Detection
Human stupidity knows no bounds. If you identify a new, common keyboard walk or sequential pattern (e.g., non-QWERTY layouts like Dvorak or AZERTY), you can add detection logic to `modules/patterns.js`.

### 3. Website Context Mapping
In `modules/websiteContext.js`, we map domains (like `github.com`) to specific context keywords (like `Repo`, `Commit`). Contributing mappings for top 100 websites significantly improves the Context-Aware Generator.

### 4. UI/UX Enhancements
The Web App is built in Vanilla JS/CSS. Any improvements to accessibility, responsive design, or visual aesthetics in `style.css` are welcome.

## Development Setup

1. Fork the repo and clone it locally.
2. The project has **zero dependencies**. No `npm install` needed.
3. Start the server using `node server.js`.
4. Open `http://localhost:5500`.

## Submission Guidelines

*   **No Build Tools**: Keep the frontend pure Vanilla JS (ES Modules). We are actively avoiding Webpack, Babel, or React overhead.
*   **Security First**: Never add external CDNs, tracking scripts, or analytics. The app must remain 100% offline capable.
*   **Test Your Changes**: Run the built-in browser console tests by calling `runTests()` to ensure your changes didn't break the scoring algorithm.

## Pull Request Process

1. Create a descriptive branch name (`feature/add-dvorak-patterns`).
2. Commit your changes with clear, concise commit messages.
3. Push to your fork and submit a Pull Request to `main`.
4. Provide screenshots if you altered the UI.
