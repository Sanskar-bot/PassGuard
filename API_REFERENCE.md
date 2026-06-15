# 📚 API Reference

This document outlines the core modules, their primary responsibilities, and key exported functions within the `modules/` directory.

> **[AI Prompt: API Visualization]**  
> *Prompt: "A clean, modern interface showing connected nodes representing JavaScript modules. Each node has a glowing function name. Developer-focused, minimalist dark design."*

## Analysis Modules

### `strength.js`
Calculates mathematical entropy and character variety.
*   `analyseStrength(password)`: Returns an object containing the charset size, entropy bits, and length score.
*   `getCharsetSize(password)`: Evaluates uppercase, lowercase, numbers, and symbol inclusion.

### `patterns.js`
Detects human predictable typing patterns.
*   `detectPatterns(password)`: Returns matches and penalty scores for sequential runs, repeats, and keyboard walks.
*   `normalizeLeet(text)`: Converts 1337-speak strings back to standard characters.

### `wordlist.js`
The dictionary engine.
*   `checkWordlist(password)`: Performs both O(1) Hash-Set lookup against top passwords and O(N) Trie substring scanning.

### `username.js`
Evaluates similarity against known identifiers.
*   `checkUsername(password, user)`: Checks for exact matches, reversed matches, and calculates Levenshtein distance for close matches.

### `scorer.js`
The final aggregator.
*   `computeScore(strength, wordlist, patterns, username)`: Weights the outputs of all analysis modules to return a normalized `0-100` score.

### `bruteforce.js`
Time-to-crack estimation.
*   `estimateCrackTimes(charset, len)`: Returns human-readable time estimates across 5 attack scenarios (Throttled Online to GPU Cluster).

### `suggestions.js`
Generates actionable UI feedback.
*   `generateSuggestions(analysisResults)`: Prioritizes and returns strings instructing the user on how to improve their specific password flaws.

## Generator Modules

### `generator.js`
Cryptographically secure baseline generator.
*   `generatePassword(options)`: Uses `crypto.getRandomValues()` to generate a string based on requested length and charsets.

### `websiteContext.js`
Extracts semantic context from domains.
*   `extractWebsiteContext(location)`: Returns `{ brand, domain, keywords }` based on known lists or fallback heuristics.

### `profilePasswordGenerator.js`
The context-aware engine.
*   `generateContextAwarePassword(config)`: Loops generation through templates and the validator pipeline until a mathematically and personally secure candidate is found.

### `generatorValidator.js`
The security gatekeeper for generated passwords.
*   `validateGeneratedPassword(password, config)`: Pushes a candidate through the full Analysis Engine and the Personalized Attack Simulator.
*   `hasNakedSimplePattern(password, profileTokens)`: Ensures profile data isn't exposed in a trivial manner.
