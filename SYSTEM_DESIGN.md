# 📐 System Design

This document details the high-level and low-level system design of the Password Strength Analyzer.

> **[AI Prompt: System Design Visual]**  
> *Prompt: "A sleek technical blueprint of a software system. White lines on a dark blueprint background showing data flowing from a user input node through various processing filters (Entropy, Patterns, Dictionary) into a final scoring algorithm."*

## High-Level Design (HLD)

The system operates as a pure client-side application. The data never leaves the user's browser context.

```mermaid
graph TD
    UI[User Interface / Web App / Extension Content Script] --> |Input Event| D[Debouncer 120ms]
    D --> E[Analysis Engine Orchestrator]
    
    E --> M1[strength.js: Entropy]
    E --> M2[patterns.js: Keyboard Walks]
    E --> M3[wordlist.js: Trie / Hash-Set]
    E --> M4[username.js: Similarity]
    
    M1 --> S[scorer.js: Aggregator]
    M2 --> S
    M3 --> S
    M4 --> S
    
    S --> UI_Update[UI Render: Score, Ring, Crack Time]
    S --> Sug[suggestions.js: Improvement Tips]
    Sug --> UI_Update
```

## Low-Level Design (LLD): Context-Aware Generator

The Context-Aware Generator is a sophisticated pipeline ensuring generated passwords are both personal and highly secure.

```mermaid
sequenceDiagram
    participant User
    participant Ext as Extension UI
    participant Ctx as Context Detector
    participant Gen as Password Generator
    participant Val as Validator Engine
    
    User->>Ext: Clicks "Generate Password"
    Ext->>Ctx: Detect Form Context
    Ctx-->>Ext: Returns domain, context keywords
    Ext->>Gen: Request generation (Profile + Context)
    
    loop Max 120 attempts
        Gen->>Gen: Pick Template (e.g. Profile + Number + Site + Random + Symbol)
        Gen->>Gen: Build candidate string
        Gen->>Val: validateGeneratedPassword(candidate)
        Val->>Val: Check Entropy (>80)
        Val->>Val: Check Personalized Attack Engine (>80)
        Val->>Val: Check Naked Patterns
        Val-->>Gen: Passed? (Yes/No)
    end
    
    Gen-->>Ext: Return Secure Candidate
    Ext-->>User: Display Password
```

## Data Flow: Web Worker Dictionary Generation

Generating personalized attack dictionaries is computationally expensive. It is offloaded to a Web Worker.

```mermaid
graph LR
    Main[Main Thread: Extension UI] -->|postMessage: Profile Data| Worker[dictionary.worker.js]
    Worker -->|Generate Permutations| Engine[personalDictionaryGenerator.js]
    Engine -->|10,000+ words| Worker
    Worker -->|postMessage: ArrayBuffer| Main
    Main --> Storage[chrome.storage.local]
```

## Storage Architecture

Because the project relies on zero-backend architecture, it relies on Chrome Storage APIs carefully partitioned by sensitivity.

1.  **`chrome.storage.sync`**: Used for non-sensitive extension settings (e.g., default password length, dark mode preference).
2.  **`chrome.storage.local`**: Used for sensitive profile data (names, pets, dates). This data is kept strictly on the local device.
3.  **Hashed Reuse Signatures**: When a user generates a password, its plaintext is **never** saved. Instead, a SHA-256 hash representation of its features is stored to prevent cross-domain reuse.
