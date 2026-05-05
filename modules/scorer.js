/**
 * scorer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Aggregates outputs from all analysis modules into a single 0–100 score
 * and a category label.
 *
 * Score breakdown (max 100):
 *   Length      25 pts   (from strength.js)
 *   Variety     20 pts   (from strength.js)
 *   Entropy     20 pts   (from strength.js)
 *   Wordlist    15 pts   (from wordlist.js)
 *   Patterns    10 pts   (from patterns.js)
 *   Username    10 pts   (from username.js)
 *
 * Categories:
 *   0–24   Weak
 *   25–49  Moderate
 *   50–74  Strong
 *   75–100 Very Strong
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CATEGORIES = [
  { min: 75, label: "Very Strong", color: "#22c55e", class: "very-strong" },
  { min: 50, label: "Strong",      color: "#84cc16", class: "strong"      },
  { min: 25, label: "Moderate",    color: "#f59e0b", class: "moderate"    },
  { min: 0,  label: "Weak",        color: "#ef4444", class: "weak"        },
];

/**
 * Compute the overall password score and category.
 *
 * @param {{
 *   lengthScore:    number,
 *   varietyScore:   number,
 *   entropyScore:   number,
 * }} strengthResult   from analyseStrength()
 *
 * @param {{ wordlistScore: number }} wordlistResult  from checkWordlist()
 * @param {{ patternScore:  number }} patternResult   from detectPatterns()
 * @param {{ usernameScore: number }} usernameResult  from checkUsername()
 *
 * @returns {{
 *   score:    number,       // 0–100
 *   category: string,       // "Weak" | "Moderate" | "Strong" | "Very Strong"
 *   color:    string,       // hex colour for UI
 *   cssClass: string,
 *   breakdown: object,      // individual component scores
 * }}
 */
export function computeScore(strengthResult, wordlistResult, patternResult, usernameResult) {
  const breakdown = {
    length:   strengthResult.lengthScore,
    variety:  strengthResult.varietyScore,
    entropy:  strengthResult.entropyScore,
    wordlist: wordlistResult.wordlistScore,
    patterns: patternResult.patternScore,
    username: usernameResult.usernameScore,
  };

  const raw = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const score = Math.min(100, Math.max(0, Math.round(raw)));

  const cat = CATEGORIES.find(c => score >= c.min) ?? CATEGORIES[CATEGORIES.length - 1];

  return {
    score,
    category: cat.label,
    color:    cat.color,
    cssClass: cat.class,
    breakdown,
  };
}
