# 🚀 Installation Guide

This project consists of a standalone web application and a browser extension. Both are fully self-contained and require zero external APIs or heavy build steps.

> **[AI Prompt: Setup Illustration]**  
> *Prompt: "A sleek, isometric 3D illustration of a laptop showing code, connected to a floating Chrome browser logo and a glowing shield. Tech-heavy, neon blue and dark grey color palette."*

---

## 💻 Web Application Installation

The web app requires a basic HTTP server to handle ES Modules (`import/export`).

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   Git (optional)

### Step-by-Step Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sanskar-bot/Password-analyzer.git
   cd Password-analyzer
   ```

2. **Start the local server:**
   ```bash
   node server.js
   ```
   *(If port 5500 is in use, you can specify another port: `node server.js 8080`)*

3. **Open the App:**
   Open your browser and navigate to:
   ```text
   http://localhost:5500
   ```

### ⚡ Windows One-Click Launch
If you are on Windows, you can simply double-click the `start.bat` file in the project root. It will automatically detect Node.js, start the server, and launch your default browser.

---

## 🧩 Browser Extension Installation

The extension is built using Manifest V3 and can be installed directly into Chrome, Edge, or Brave via Developer Mode.

### Step-by-Step Setup (Chrome/Edge)

1. **Open the Extensions Page:**
   *   Chrome: Navigate to `chrome://extensions/`
   *   Edge: Navigate to `edge://extensions/`

2. **Enable Developer Mode:**
   Toggle the "Developer mode" switch in the top right corner of the page.

3. **Load the Extension:**
   *   Click the **"Load unpacked"** button.
   *   Select the `extension/` folder located inside the cloned repository directory:
       `/path/to/Password-analyzer/extension/`

4. **Pin the Extension:**
   *   Click the puzzle piece icon in your browser toolbar.
   *   Click the pin icon next to **VaultZero** to keep it accessible.

> **[Screenshot Placeholder]**  
> *Path: `docs/images/chrome-load-unpacked.png`*  
> *Caption: "Enabling Developer Mode and clicking 'Load unpacked' in Chrome."*

### Updating the Extension
If you make changes to the extension's source code, simply return to the `chrome://extensions/` page and click the circular **Refresh** icon on the VaultZero extension card. Content script changes will also require you to refresh the webpage you are testing on.
