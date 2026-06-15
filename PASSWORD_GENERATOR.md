# 🔑 Password Generator Deep Dive

Traditional password generators create output like `xK9#mQ!2L`. These are mathematically secure, but completely alien to human memory. The user is forced to copy-paste or write them down. 

Our **Context-Aware Password Generator** approaches this differently.

> **[AI Prompt: Generator Workflow]**  
> *Prompt: "A glowing machine combining different gears. One gear is labeled 'Profile', another 'Website Context', another 'Crypto Randomness'. The machine outputs a shining, impenetrable password lock."*

## 1. Core Cryptography (`generator.js`)

Before context or personalization is applied, the foundation must be cryptographically secure.

*   **`window.crypto.getRandomValues()`**: We never use `Math.random()`. Instead, we tap directly into the operating system's secure entropy pool.
*   **Modulo Bias Prevention**: When picking a random character from an array, simple modulo arithmetic (`rand % array.length`) creates statistical bias. We use Rejection Sampling to guarantee a perfectly uniform distribution.

## 2. Context Extraction (`websiteContext.js`)

When the extension detects a signup form, it reads the current website to build context.
*   **Domain Parsing**: `github.com` becomes `Github`.
*   **Curated Keywords**: Known sites trigger curated keyword lists. For example, `github.com` pulls `Repo`, `Commit`, `Code`, `Push`.
*   **Fallback Inference**: Unknown sites use the capitalized domain name as the primary keyword.

## 3. Personalization (`profilePasswordGenerator.js`)

The user's local profile provides memory anchors.
*   The generator extracts values from `firstName`, `petName`, `customKeywords`, and `favoriteNumber`.
*   **Transformations**: To avoid placing a full 15-character name in a password, strings over 8 characters are intelligently truncated, maintaining the memory anchor without bloating the password length.

## 4. Slot-Order Templates

If we always generated passwords as `[Profile][Number][Site][Random]`, attackers could write regex to easily guess the structure. To defeat structural predictability, the generator uses 6 rotating slot-order templates:

1.  `Template A`: ProfileWord + Number + SiteWord + RandomWord + Symbol
2.  `Template B`: SiteWord + ProfileWord + RandomWord + Number + Symbol
3.  `Template C`: RandomWord + ProfileWord + SiteWord + Number + Symbol
4.  `Template D`: Number + SiteWord + ProfileWord + RandomWord + Symbol
5.  `Template E`: SiteWord + RandomWord + ProfileWord + Number + Symbol
6.  `Template F`: ProfileWord + SiteWord + Number + RandomWord + Symbol

## 5. The Validation Pipeline (`generatorValidator.js`)

Generating the password is only step 1. The generator runs a loop (up to 120 attempts) where each candidate is thrown into the full Analysis Engine.

A password is ONLY returned to the user if it passes:
1.  `strengthScore > 80`
2.  `personalizedAttackScore > 80`
3.  No naked trivial patterns (e.g., `[Name]123` is rejected, but `[Name]47[Site][Random]!` is accepted).
4.  No Hash-Set or Trie dictionary matches.
5.  No cross-domain reuse signatures detected.
