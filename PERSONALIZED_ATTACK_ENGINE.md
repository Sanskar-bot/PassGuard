# 🥷 Personalized Attack Engine

> **[AI Prompt: Attack Simulator]**  
> *Prompt: "A matrix-style terminal screen rapidly generating thousands of password combinations based on a central profile holographic node. Cybersecurity red-team aesthetic."*

The Personalized Attack Engine is a JavaScript-native implementation inspired by offensive security tools like CUPP (Common User Passwords Profiler). It answers the question: *If a hacker stalked your social media, could they guess your password?*

## 1. Profile Inputs
The engine accepts an optional user profile consisting of:
*   First Name, Last Name
*   Nickname, Pet Name, Partner Name
*   Date of Birth
*   Company, Domain
*   Custom Keywords (e.g., sports teams, hobbies)

## 2. Permutation Engine (`personalDictionaryGenerator.js`)

The engine generates a highly targeted dictionary using combinatorial logic.

*   **Case Permutations**: `sanskar`, `Sanskar`, `SANSKAR`.
*   **Suffix/Prefix Appending**: Appending common years (`2024`, `1999`) and numbers (`123`, `01`).
*   **Combinations**: Mixing `firstName` + `petName`, or `partnerName` + `dob`.
*   **Leet-Speak**: Translating words to 1337-speak (`s@nsk@r`).
*   **Symbol Wrapping**: `[word]!`, `![word]!`.

Depending on the richness of the profile, this generates between 5,000 and 15,000 highly probable password guesses specific to the user.

## 3. Web Worker Integration (`dictionary.worker.js`)

Generating 15,000 strings and building a Trie data structure from them is a CPU-intensive task. If run on the main thread, the browser extension would freeze, disrupting the user experience.

*   The extension offloads the generation to a background Web Worker.
*   The Main Thread sends the JSON profile to the Worker via `postMessage`.
*   The Worker executes the combinatorial math and returns the resulting dictionary array.

## 4. Scoring Mechanism (`personalDictionaryScorer.js`)

When evaluating a user's password, we don't just return a boolean "Found / Not Found". We evaluate the *complexity* of the match.

If the user's password is `Bruno123`, it will be found near the very top of the generated dictionary (Rank #10). This results in a massive penalty.

If the user's password is `Bruno47StoryNova!`, the engine recognizes that while `Bruno` is in the profile, the surrounding context is highly complex and not easily guessable via brute-force combinations. It applies a nuanced penalty or allows it depending on the `allowProfileAnchors` flag.
