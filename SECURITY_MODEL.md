# 🔒 Security Model

This document outlines the offensive security assumptions and defensive methodologies employed by the Password Strength Analyzer.

> **[AI Prompt: Security Threat Model]**  
> *Prompt: "A dark mode technical diagram showing a shield deflecting different types of cyber attacks represented as glowing red data streams: Dictionary Attack, Brute Force, Leet-speak, Pattern Matching."*

## 1. Offensive Threat Model

The analyzer is designed to protect against the following attacker profiles:

1.  **The Script Kiddie (Throttled Online Attack)**
    *   *Speed*: 10 - 100 guesses per second.
    *   *Method*: Using basic credential stuffing against web portals with rate-limiting.
    *   *Defense*: Moderate entropy easily defeats this.

2.  **The Database Thief (Fast Offline Attack)**
    *   *Speed*: 10,000,000,000+ guesses per second (GPU Clusters).
    *   *Method*: The attacker has stolen the hashed database (e.g., MD5/SHA1) and is cracking offline without rate limits.
    *   *Defense*: Requires high mathematical entropy and absolute avoidance of common dictionaries.

3.  **The Spear Phisher (Personalized Attack)**
    *   *Speed*: Target-specific.
    *   *Method*: The attacker has performed OSINT (Open Source Intelligence) on the victim and generated a custom dictionary using tools like CUPP (Common User Passwords Profiler).
    *   *Defense*: The personalized attack engine simulates this exact scenario to ensure passwords don't fall into trivial `[Name][DOB]` patterns.

## 2. Defensive Methodology

### Entropy Calculation (`strength.js`)
Entropy is the measure of mathematical unpredictability. We use the formula:
`Entropy (bits) = Length * log2(Charset Size)`

The dynamic charset size increases based on the classes of characters used:
*   Lowercase only: `26`
*   Alphanumeric: `62`
*   Full ASCII: `94`

### Dictionary Avoidance (`wordlist.js`)
A password with high entropy is useless if it is a known word.
*   **O(1) Hash-Set**: Checks the password against the top 500 worst passwords instantly.
*   **O(N*K) Trie Scanning**: Checks every substring of the password against a comprehensive dictionary. `dragon99` will trigger a penalty because `dragon` is detected by the prefix tree.

### Leet-Speak Normalization
Attackers use rulesets (e.g., Hashcat rules) to automatically substitute characters. Our engine normalizes passwords before dictionary checks:
*   `@` -> `a`
*   `0` -> `o`
*   `$` -> `s`
*   `1` -> `i` / `l`
*   `3` -> `e`

`P@55w0rd` is evaluated exactly the same as `password`.

### Trivial Pattern Rejection (`patterns.js`)
Human typing habits are highly predictable. The pattern engine detects and heavily penalizes:
*   **Keyboard Walks**: `qwerty`, `asdfgh`
*   **Sequential Runs**: `123456`, `abcdef`
*   **Repetition**: `abcabcabc`
*   **Dates**: `1999`, `2024`

## 3. Privacy Protections

*   **No Telemetry**: The application contains zero tracking pixels, Google Analytics, or external network requests.
*   **No Plaintext Storage**: The extension prevents cross-domain password reuse by storing only non-reversible SHA-256 signatures of passwords, never the passwords themselves.
*   **Local Profile**: The personalized attack profile is stored entirely offline using `chrome.storage.local`.
