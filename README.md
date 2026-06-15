<div align="center">

```
██████╗  █████╗ ███████╗███████╗ ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗
██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗
██████╔╝███████║███████╗███████╗██║  ███╗██║   ██║███████║██████╔╝██║  ██║
██╔═══╝ ██╔══██║╚════██║╚════██║██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║
██║     ██║  ██║███████║███████║╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
```

# 🔐 Password Strength Analyzer

**A blazing-fast, fully offline, browser-based password security engine and context-aware extension.**  
No tracking. No APIs. No BS. Just pure, brutal password analysis.

[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-Server-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Vanilla-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen?style=for-the-badge)](.)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

> **[AI Prompt: Hero Project Banner]**  
> *Prompt: "A sleek, modern cybersecurity dashboard glowing in neon cyan and purple. In the center, an abstract lock is being broken down into 1s and 0s. The words 'PassGuard Intelligence' subtly integrated. High-tech SaaS style."*

</div>

---

## ⚡ What Makes This Different?

> Most password checkers just count characters. This one **thinks**.

- 🧠 **Entropy-based scoring** — mathematically measures unpredictability
- 🌳 **Trie-powered substring search** — finds `"dragon"` hiding inside `"myDragon99!"`
- 🔤 **Leet-speak normalization** — catches `"p@55w0rd"` same as `"password"`
- 👤 **Personalized Attack Engine** — acts like a hacker to test if your password is guessable from your profile
- 🧩 **Context-Aware Generator** — creates memorable passwords using website context and personal anchors
- ⚡ **120ms debounce** — real-time feedback without hammering the CPU
- 📡 **100% offline** — your passwords never leave your machine

---

## 📚 Comprehensive Documentation

We have prepared enterprise-grade documentation detailing every aspect of this project:

| Document | Description |
|---|---|
| [🌍 Project Overview](PROJECT_OVERVIEW.md) | The problem, motivation, and why this project exists. |
| [✨ Features](FEATURES.md) | Exhaustive list of web app and extension capabilities. |
| [🚀 Installation](INSTALLATION.md) | How to run the local server and install the Chrome extension. |
| [🏗️ Architecture](ARCHITECTURE.md) | High-level system layout and module interactions. |
| [📐 System Design](SYSTEM_DESIGN.md) | Component diagrams, data flow, and pipeline visuals. |
| [🔒 Security Model](SECURITY_MODEL.md) | Threat modeling, entropy math, and privacy methodology. |
| [🛡️ Extension Guide](EXTENSION_GUIDE.md) | How to use the inline widget, badges, and Shadow DOM UI. |
| [🔑 Password Generator](PASSWORD_GENERATOR.md) | Deep dive into the cryptographically secure template generator. |
| [🥷 Personalized Attack Engine](PERSONALIZED_ATTACK_ENGINE.md) | How the CUPP-inspired combinatorial Web Worker operates. |
| [📚 API Reference](API_REFERENCE.md) | Technical specs on classes and module functions. |
| [📂 Folder Structure](FOLDER_STRUCTURE.md) | Where everything lives in the codebase. |
| [🤝 Contributing](CONTRIBUTING.md) | How to submit PRs, update dictionaries, and add patterns. |

---

## 🔬 Analysis Pipeline Overview

```text
User types password
        │
        ▼ (debounced 120ms)
┌───────────────────────────────────────────────────────────┐
│                    ANALYSIS PIPELINE                       │
│                                                           │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────────┐  │
│  │ strength.js │   │ patterns.js │   │  wordlist.js  │  │
│  │             │   │             │   │               │  │
│  │ • Length    │   │ • Keyboard  │   │ • Hash-Set    │  │
│  │ • Entropy   │   │   walks     │   │   exact match │  │
│  │ • Char set  │   │ • Sequences │   │ • Trie        │  │
│  │ • Variety   │   │ • Repeats   │   │   substring   │  │
│  │             │   │ • Dates     │   │ • Leet-norm   │  │
│  └──────┬──────┘   └──────┬──────┘   └───────┬───────┘  │
│         │                 │                   │           │
│         ▼                 ▼                   ▼           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                   username.js                       │ │
│  │   contains? • variation? • reversed? • nearMatch?   │ │
│  └───────────────────────┬─────────────────────────────┘ │
│                          │                                │
│                          ▼                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                   scorer.js                         │ │
│  │                                                     │ │
│  │   Length   [████████░░]  25 pts                     │ │
│  │   Variety  [██████░░░░]  20 pts                     │ │
│  │   Entropy  [████████░░]  20 pts                     │ │
│  │   Wordlist [██████████]  15 pts                     │ │
│  │   Patterns [████░░░░░░]  10 pts                     │ │
│  │   Username [██████████]  10 pts                     │ │
│  │                          ─────                      │ │
│  │                   TOTAL: 100 pts                    │ │
│  └───────────────────────┬─────────────────────────────┘ │
│                          │                                │
│            ┌─────────────┼─────────────┐                 │
│            ▼             ▼             ▼                  │
│      bruteforce.js  suggestions.js   UI render            │
│      (crack times)  (fix tips)       (DOM update)         │
└───────────────────────────────────────────────────────────┘
```

> **[Screenshot Placeholder]**  
> *Path: `docs/images/analyzer-dashboard-view.png`*  
> *Caption: "The main dashboard evaluating a complex password and estimating a 100-year crack time."*

---

## 🌐 Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 109+ | ✅ Full |
| Edge 109+ | ✅ Full |
| Firefox 75+ | ✅ Full |
| Safari 14+ | ✅ Full |

---

## 🔒 Privacy

```text
┌─────────────────────────────────────────────────┐
│                                                 │
│   Your password NEVER leaves your computer.    │
│                                                 │
│   ✓ No network requests                        │
│   ✓ No analytics                               │
│   ✓ No plain-text localStorage writes          │
│   ✓ Fully offline capable                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📄 License

MIT License — do whatever you want with it. Just don't use it to store weak passwords. 😄

---

<div align="center">

Made with 🔐 by [Sanskar Phougat](https://github.com/Sanskar-bot)

*If this helped you secure your passwords, give it a ⭐ on GitHub!*

</div>
