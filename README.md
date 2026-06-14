<div align="center">

![PassGuard Banner](docs/images/banner.png)

```
           
    
       
         
           
               
```

# PassGuard  Unified Password Security Platform

**A high-performance, offline, browser-based password security engine and Chrome Extension.**  
PassGuard provides strict, offline password analysis combined with advanced personalized attack resistance algorithms.

[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/)
[![Web Workers](https://img.shields.io/badge/Web_Workers-Async-ff69b4?style=for-the-badge)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen?style=for-the-badge)](.)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

</div>

---

## Core Differentiators

PassGuard extends beyond standard entropy analysis by introducing a **Targeted Attack Simulator**. By generating a personalized dictionary based on user traits (names, affiliations, birth years), PassGuard accurately models targeted spear-phishing or dictionary attacks.

- **Advanced Personalized Attack Simulator**  Generates 20,000+ targeted permutations locally.
- **Web Worker Offloading**  Dictionary generation runs asynchronously in the background, ensuring zero UI latency.
- **Trie-powered Substring Search**  Detects common words embedded within complex strings.
- **Leet-speak Normalization**  Automatically identifies and normalizes common character substitutions.
- **Unified Architecture**  The analysis engine powers both the standalone Web Application and the Chrome Extension.
- **Strictly Offline**  Telemetry and password data never leave the local machine environment.

---

## Unified Platform Architecture

The repository follows a decoupled architecture, separating the core analysis engine from the presentation interfaces.

```text
 Password-analyzer/
  shared/                   CORE ANALYSIS ENGINE
    strength.js              Entropy & character-set analysis
    wordlist.js              Hash-Set + Trie lookup engine
    personalDictionaryGenerator.js  Targeted permutation engine
    scorer.js                Aggregate scoring and risk penalties
    dictCache.js             O(1) in-memory lookup system

  app/                      WEB APPLICATION
    index.html               Standalone UI dashboard
    style.css                Design system
    app.js                   DOM wiring and module orchestrator

  extension/                CHROME EXTENSION
    manifest.json            MV3 Extension Manifest
    background.js            Service worker event orchestrator
    content/content.js       Injects real-time UI widget
    workers/                 Background Web Workers
    popup/                   Extension interface

 server.js                    Zero-dependency Node.js static server
 start.bat                    Windows executable launcher
```

---

## Analysis Pipeline

The evaluation pipeline executes in under 50ms, assessing passwords across multiple heuristic dimensions before calculating a weighted score.

```mermaid
graph TD
    A[Password Input] --> B(Debounce 120ms)
    B --> C{Core Analysis Layer}
    
    subgraph Shared Engine
    C --> D[Strength / Entropy]
    C --> E[Pattern Detection]
    C --> F[Wordlist / Trie Scan]
    C --> G[Username Similarity]
    end
    
    subgraph Personalized Attack Simulation
    H[(Local Profile Store)] --> I(Web Worker: Generator)
    I -->|20,000+ permutations| J[(Targeted Dictionary Cache)]
    J --> K{O(1) Exact/Substring Lookup}
    end
    
    F --> K
    
    K --> L[Scoring Module]
    L -->|Penalty applied if targeted| M[Final Score 0-100]
    
    M --> N[Brute-Force Estimator]
    M --> O[Suggestion Engine]
    
    N --> P((UI Render))
    O --> P
```

---

## Personalized Attack Resistance (CUPP Integration)

PassGuard implements a highly optimized, JavaScript-native implementation of the Common User Passwords Profiler (CUPP) logic.

Upon supplying basic profile parameters (Affiliations, Names, Birth Year), PassGuard utilizes a Web Worker to silently generate a custom targeted dictionary.

### Generation Priorities
1. **Tier 1 (Critical Risk):** Exact names, Names + standard suffixes, Names + Birth Year.
2. **Tier 2:** Nicknames and Affiliation permutations.
3. **Tier 3:** Leet-speak mutations (`a -> 4`, `e -> 3`, `i -> 1`, `o -> 0`, `s -> 5`).
4. **Tier 4:** Standard corporate password structures (e.g., `Company2025!`).

### Dynamic Penalty Scoring
If a password calculates to a standard `100/100` score but is detected by the Personalized Engine at an early rank, the Scoring Module actively penalizes the final result by up to 50 points, downgrading it to a "Moderate" or "Weak" security classification.

---

## Scoring System & Risk Levels

```text
Score Range  Category     Meaning

  75  100   Very Strong  Excellent  safe against standard & targeted attacks
  50   74   Strong       Good  minor improvements recommended
  25   49   Moderate     Risky  vulnerable to targeted guessing
   0   24   Weak         Dangerous  immediate change required
```

---

## Deployment  Standalone Web App

**Method 1: Windows Executable**
Execute the `start.bat` file. This automatically initializes the Node.js server and launches the default browser.

**Method 2: Command Line**
1. Ensure Node.js is installed on the host system.
2. Clone the repository.
3. Run `node server.js`
4. Access `http://localhost:5500` via a web browser.

---

## Installation  Chrome Extension

The PassGuard extension injects the offline analysis engine directly into the browser, analyzing password fields in real-time.

1. Open Google Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle).
3. Select **Load unpacked**.
4. Select the `Password-analyzer/` root directory.
5. Pin the extension to the browser toolbar.

> **Note:** The extension operates entirely offline. It does not request network access permissions. Profile and password telemetry remain strictly isolated within the local browser sandbox.

---

## Privacy Architecture

```text

                                                 
   Password data is strictly localized.          
                                                 
   - No backend servers                          
   - No network requests                         
   - No telemetry or tracking modules            
   - Fully offline architecture                  
                                                 

```

---

## License

Distributed under the MIT License.

<div align="center">

Developed by [Sanskar Phougat](https://github.com/Sanskar-bot)

</div>
