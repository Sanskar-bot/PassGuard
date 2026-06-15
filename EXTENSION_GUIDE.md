# 🛡️ Extension User Guide

The VaultZero Password Intelligence extension brings enterprise-grade password analysis directly to your browser. This guide explains how to leverage its features.

> **[AI Prompt: Extension Workflow]**  
> *Prompt: "A visual mockup showing a browser extension dropdown menu popping out of a chrome browser. Inside the menu is a sleek cyber-security dashboard with a circular score ring at 98% and personalized attack statistics."*

## 1. The Inline Widget (Real-Time Feedback)

Whenever you visit a login or signup page, the extension automatically injects a discreet widget below the password input field.

*   **How it works**: As you type, the widget updates instantly with your password score and entropy.
*   **Privacy**: The content script reads the DOM locally. Nothing is transmitted over the network.
*   **Dismissal**: The widget uses Shadow DOM to prevent CSS conflicts and will disappear when the input field loses focus.

## 2. Context-Aware Password Generation

The extension intelligently detects when you are creating an account or changing a password (standard logins are ignored). 

1.  Click the **Generate Password** button in the inline widget.
2.  The extension pulls your personal profile (if provided) and the current website's context.
3.  It generates a password that is highly memorable but mathematically impenetrable (e.g., `StorySans47Orbit#`).
4.  You can manually edit the generated password; the strength meters will update in real-time.
5.  Click **Use Password** to automatically fill both the "New Password" and "Confirm Password" fields.

## 3. The Personalized Attack Simulator (CUPP)

If you've ever wondered how easily a hacker who knows you could guess your password, this feature is for you.

1.  Open the extension popup and navigate to the **Attack Sim** tab.
2.  Fill out your profile (First Name, Pet Name, Date of Birth, Custom Keywords).
3.  Click **Run Attack Simulation**.
4.  The extension spins up a Web Worker and generates 10,000+ permutations (e.g., `[Name][Year]!`).
5.  It evaluates your current password against this highly targeted dictionary to ensure you aren't using a trivial combination.

## 4. Extension Badge

The extension icon in your browser toolbar features a live badge. Whenever you are typing in a password field, the badge updates dynamically to reflect your score (e.g., `12` in red, `98` in green).

## 5. Security & Permissions

VaultZero requires specific permissions to function correctly:

| Permission | Reason |
|------------|--------|
| `activeTab` | Required to inject the inline widget and analyze the password field you are currently interacting with. |
| `storage` | Required to save your extension settings, personal profile, and hashed reuse signatures locally. |
| `scripting` | Required to execute the content scripts that detect login forms. |

**Zero Network Requests:** VaultZero does not require host permissions (`*://*/*`) to send data, because it doesn't send data anywhere. Your information stays on your device.
