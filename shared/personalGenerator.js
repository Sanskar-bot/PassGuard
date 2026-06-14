/**
 * personalGenerator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Personalized Secure password generator.
 *
 * Core philosophy
 * ───────────────
 *  Personal data is used only as INSPIRATION, never as a direct component.
 *  The engine derives themed "memory anchors" from profile fields, then
 *  combines those anchors with curated words from the word bank to produce
 *  passwords that feel personal and memorable, but resist targeted attacks.
 *
 * What is NEVER placed directly in a generated password
 * ───────────────────────────────────────────────────────
 *  • The user's first name or surname (on their own, or + predictable suffix)
 *  • The user's birth year (full YYYY)
 *  • Name + birth year combinations
 *  • Pet name + predictable number (Bruno123)
 *  • Any pattern found in the personal attack dictionary
 *
 * What IS allowed
 * ───────────────
 *  • Pet name as ONE word among 2+ others (BrunoQuantumFalcon88  ✓)
 *  • Themed words derived from the user's data (pet "Bruno" → animals category)
 *  • A 2-digit number suffix that is NOT the birth year
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { WORD_BANK, ALL_WORDS } from './wordBank.js';
import { analyseStrength }      from './strength.js';
import { detectPatterns }       from './patterns.js';
import { checkWordlist }        from './wordlist.js';
import { computeScore }         from './scorer.js';
import { generatePersonalDictionary } from './personalDictionaryGenerator.js';
import { findPasswordInDictionary }   from './personalDictionaryScorer.js';

// ── Constants ──────────────────────────────────────────────────────────────

const MIN_SCORE    = 80;
const MAX_ATTEMPTS = 30;

// Neutral username result (required by computeScore)
const NO_USERNAME = { checked: false, contains: false, nearMatch: false,
                      variation: false, reversed: false, usernameScore: 10 };

// ── Crypto helpers ─────────────────────────────────────────────────────────

function rand(max) {
  const arr   = new Uint32Array(1);
  const limit = 0x100000000 - (0x100000000 % max);
  let v;
  do { globalThis.crypto.getRandomValues(arr); v = arr[0]; } while (v >= limit);
  return v % max;
}
function pick(arr) { return arr[rand(arr.length)]; }
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Anchor derivation ──────────────────────────────────────────────────────

/**
 * Map profile fields to themed word categories and optionally include
 * the raw pet name (if it reads like a real word and is 3-10 chars).
 *
 * Returns { anchorWords: string[], categories: string[] }
 */
function deriveAnchors(profile = {}) {
  const categories = new Set(['general']);
  const extraWords = [];   // raw words we allow (e.g. pet name itself)

  // Pet name  → direct anchor word allowed (e.g. Bruno) + animals category
  const pet = (profile.pet || '').trim();
  if (pet.length >= 3 && pet.length <= 10 && /^[a-zA-Z]+$/.test(pet)) {
    extraWords.push(pet.charAt(0).toUpperCase() + pet.slice(1).toLowerCase());
    categories.add('animals');
  }

  // First name  → determines category by length (NOT the name itself)
  const name = (profile.name || '').trim();
  if (name.length > 0) {
    if (name.length <= 4) categories.add('general');
    else if (name.length <= 6) categories.add('science');
    else categories.add('space');
  }

  // Last name  → fantasy or tech by first letter
  const surname = (profile.surname || '').trim();
  if (surname.length > 0) {
    const c = surname[0].toLowerCase();
    if ('abcdefg'.includes(c))       categories.add('fantasy');
    else if ('hijklmn'.includes(c))  categories.add('tech');
    else if ('opqrstu'.includes(c))  categories.add('science');
    else                              categories.add('space');
  }

  // DOB  → space/nature (era themed — NOT the year itself)
  if (profile.dob) {
    categories.add('space');
    categories.add('nature');
  }

  // Company  → tech category
  if ((profile.company || '').trim()) categories.add('tech');

  // Partner  → fantasy category
  if ((profile.partner || '').trim()) categories.add('fantasy');

  // Nickname / alias → nature category
  if ((profile.nick || '').trim() || (profile.commonAlias || '').trim()) {
    categories.add('nature');
  }

  // Favorite number → science (number → precision → science)
  if ((profile.favoriteNumber || '').trim()) categories.add('science');

  // Sports team → animals (action/power animals)
  if ((profile.sportsTeam || '').trim()) categories.add('animals');

  // Gamer tag  → tech + fantasy
  if ((profile.gamerTag || '').trim()) {
    categories.add('tech');
    categories.add('fantasy');
  }

  // Custom keywords → derive category from first letter of each keyword
  const keywords = Array.isArray(profile.customKeywords)
    ? profile.customKeywords.filter(k => k && String(k).trim().length >= 2)
    : [];
  if (keywords.length > 0) {
    keywords.forEach(kw => {
      const c = String(kw).trim()[0]?.toLowerCase() || '';
      if ('abcde'.includes(c))       categories.add('animals');
      else if ('fghij'.includes(c))  categories.add('tech');
      else if ('klmno'.includes(c))  categories.add('nature');
      else if ('pqrst'.includes(c))  categories.add('space');
      else                            categories.add('science');
    });
  }

  // Build word pool from all derived categories
  const pool = [];
  for (const cat of categories) {
    if (WORD_BANK[cat]) pool.push(...WORD_BANK[cat]);
  }

  // Merge extra raw words (pet name) and de-duplicate
  const allWords = [...new Set([...extraWords, ...pool])];

  return { anchorWords: allWords, categories: [...categories], hasPetAnchor: extraWords.length > 0 };
}

// ── Number suffix (NOT the birth year) ────────────────────────────────────

/**
 * Generate a safe 2-digit number that avoids the user's birth year digits.
 * If favoriteNumber is set, offset it so it's not obviously the lucky number.
 */
function safeNumber(profile = {}) {
  const dobYear = profile.dob ? profile.dob.slice(0, 4) : '';
  const dobYY   = dobYear.slice(-2);
  const favNum  = String(profile.favoriteNumber || '').trim();

  for (let attempt = 0; attempt < 50; attempt++) {
    const n = String(10 + rand(90)); // 10–99

    // Avoid: raw birth year last-2-digits
    if (n === dobYY) continue;

    // Avoid: favNumber exactly
    if (favNum && n === favNum) continue;

    return n;
  }
  // Fallback: always safe
  return String(10 + rand(60) + 20);
}

// ── Core generator ─────────────────────────────────────────────────────────

/**
 * Generate one candidate Personalized Secure password.
 * Structure: [anchor?][word1][word2][number]
 * - If a pet name is available, sometimes place it first
 * - Remaining slots filled from themed word pool
 * - Always ends in a safe 2-digit number
 */
function genOnePersonal(anchorWords, hasPetAnchor, profile, opts = {}) {
  const count   = Math.max(2, Math.min(4, opts.wordCount ?? 3));
  const sep     = opts.separator ?? '';
  const useSym  = opts.symbols ?? false;
  const doCapit = opts.capitalize !== false;

  const words = [];

  // Pet name anchor appears in roughly half of generated passwords
  if (hasPetAnchor && rand(2) === 0) {
    const petWord = anchorWords[0]; // pet word is always first if present
    words.push(doCapit
      ? petWord.charAt(0).toUpperCase() + petWord.slice(1).toLowerCase()
      : petWord
    );
  }

  // Fill remaining slots from the anchor pool (excluding already-picked pet)
  const pool = hasPetAnchor ? anchorWords.slice(1) : anchorWords;
  while (words.length < count) {
    const w = pick(pool.length > 0 ? pool : ALL_WORDS);
    words.push(doCapit
      ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      : w.toLowerCase()
    );
  }

  // Shuffle so pet name doesn't always appear first among all words
  shuffle(words);

  let pw = words.join(sep);
  pw += safeNumber(profile);
  if (useSym) pw += pick('!@#$%&*?'.split(''));

  return pw;
}

// ── Vulnerability checker ──────────────────────────────────────────────────

/**
 * Returns { vulnerable: boolean, reason: string } for a candidate password.
 *
 * Checks for patterns that would be trivially guessable from the profile:
 *   1. Name alone / name + simple suffix
 *   2. Name + birth year (any form)
 *   3. Pet name + birth year
 *   4. Pet name + simple suffix only (Bruno123)
 *   5. Found in the personal dictionary
 */
export function checkVulnerability(pw, profile = {}, dictionary = null) {
  const pwLow = pw.toLowerCase();

  const name    = (profile.name    || '').trim().toLowerCase();
  const surname = (profile.surname || '').trim().toLowerCase();
  const pet     = (profile.pet     || '').trim().toLowerCase();
  const nick    = (profile.nick    || '').trim().toLowerCase();
  const dobYear = profile.dob ? profile.dob.slice(0, 4) : '';
  const dobYY   = dobYear.slice(-2);

  // 1. Name + birth year (full year or 2-digit)
  if (name.length >= 3 && dobYear) {
    if (pwLow.includes(name) && (pwLow.includes(dobYear) || pwLow.includes(dobYY))) {
      return { vulnerable: true, reason: 'Contains name + birth year — predictable pattern' };
    }
  }

  // 2. Surname + birth year
  if (surname.length >= 3 && dobYear) {
    if (pwLow.includes(surname) && (pwLow.includes(dobYear) || pwLow.includes(dobYY))) {
      return { vulnerable: true, reason: 'Contains surname + birth year — predictable pattern' };
    }
  }

  // 3. Pet + birth year
  if (pet.length >= 3 && dobYear) {
    if (pwLow.includes(pet) && (pwLow.includes(dobYear) || pwLow.includes(dobYY))) {
      return { vulnerable: true, reason: 'Contains pet name + birth year — predictable pattern' };
    }
  }

  // 4. Name + trivial suffix only (no other word)
  if (name.length >= 3) {
    const afterName = pwLow.replace(name, '');
    if (/^[@#!$.]?(?:1{1,6}|12|123|1234|12345|111|0+)?[@#!$.]?$/.test(afterName) && afterName.length < 6) {
      return { vulnerable: true, reason: 'Name followed by predictable number — trivially guessable' };
    }
  }

  // 5. Pet alone + trivial suffix
  if (pet.length >= 3) {
    const afterPet = pwLow.replace(pet, '');
    if (/^[@#!$.]?(?:1{1,6}|12|123|1234|12345|111|0+)?[@#!$.]?$/.test(afterPet) && afterPet.length < 6) {
      return { vulnerable: true, reason: 'Pet name + predictable suffix — too guessable' };
    }
  }

  // 6. Nick + trivial suffix
  if (nick.length >= 3) {
    const afterNick = pwLow.replace(nick, '');
    if (/^[@#!$.]?(?:1{1,6}|12|123|1234|12345|111|0+)?[@#!$.]?$/.test(afterNick) && afterNick.length < 6) {
      return { vulnerable: true, reason: 'Nickname + predictable suffix — too guessable' };
    }
  }

  // 7. Check against provided personal dictionary
  if (dictionary && dictionary.length > 0) {
    const { found, rank } = findPasswordInDictionary(pw, dictionary);
    if (found) {
      return { vulnerable: true, reason: `Found in your personal attack dictionary at rank #${rank?.toLocaleString() ?? '?'}` };
    }
  }

  return { vulnerable: false, reason: '' };
}

// ── Score helper ───────────────────────────────────────────────────────────

function scorePassword(pw) {
  const strength = analyseStrength(pw);
  const patterns = detectPatterns(pw);
  const wordlist = checkWordlist(pw);
  return computeScore(strength, wordlist, patterns, NO_USERNAME);
}

// ── Public: generate ───────────────────────────────────────────────────────

/**
 * Generate a Personalized Secure password from a user profile.
 *
 * @param {object} profile  User profile fields (all optional)
 * @param {object} opts     Generation options
 * @param {number} [opts.wordCount=3]
 * @param {string} [opts.separator='']
 * @param {boolean}[opts.symbols=false]
 * @param {boolean}[opts.capitalize=true]
 * @param {string[]|null} [opts.dictionary=null]  Pre-built personal dictionary for fast rejection
 *
 * @returns {{ password, score, category, color, entropy, length, charsetSize,
 *             personalScore, explanation, categories, hasPetAnchor } | null}
 */
export function generatePersonalPassword(profile = {}, opts = {}) {
  const { anchorWords, categories, hasPetAnchor } = deriveAnchors(profile);
  const dictionary = opts.dictionary ?? null;

  let best      = null;
  let bestScore = -1;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const pw       = genOnePersonal(anchorWords, hasPetAnchor, profile, opts);
    const scoreRes = scorePassword(pw);
    const { vulnerable, reason } = checkVulnerability(pw, profile, dictionary);

    if (vulnerable) continue; // skip — too guessable

    if (scoreRes.score > bestScore) {
      const strength = analyseStrength(pw);
      best = {
        password:    pw,
        score:       scoreRes.score,
        category:    scoreRes.category,
        color:       scoreRes.color,
        entropy:     strength.entropy,
        length:      strength.length,
        charsetSize: strength.charsetSize,
        categories,
        hasPetAnchor,
      };
      bestScore = scoreRes.score;
    }

    if (scoreRes.score >= MIN_SCORE) break;
  }

  return best;
}

// ── Public: explain ────────────────────────────────────────────────────────

/**
 * Build a human-readable explanation for a generated password.
 *
 * @param {string} pw
 * @param {object} profile
 * @param {object} scoreRes  Result from scorePassword / computeScore
 * @param {object|null} personalRes  Result from runPersonalizedAnalysis (optional, can be null)
 * @param {string[]} usedCategories  Categories used in derivation
 *
 * @returns {{ strengthLine: string, personalLine: string, reason: string }}
 */
export function explainPassword(pw, profile, scoreRes, personalRes, usedCategories = []) {
  const strengthLine = `${scoreRes.score ?? '—'}/100 — ${scoreRes.category ?? ''}`;

  let personalLine = '—';
  if (personalRes) {
    personalLine = `${personalRes.score}/100 — ${personalRes.riskLevel?.label ?? ''}`;
  }

  // Build reason sentence from what was used
  const parts = [];
  const hasPet   = (profile.pet     || '').trim().length > 0;
  const hasName  = (profile.name    || '').trim().length > 0;
  const hasDOB   = (profile.dob     || '').trim().length > 0;
  const hasComp  = (profile.company || '').trim().length > 0;

  if (hasPet) parts.push('pet name as memory anchor');
  if (hasName && !hasPet) parts.push('name-derived themed words');
  if (hasDOB) parts.push('era-themed vocabulary (not the birth year)');
  if (hasComp) parts.push('tech-domain vocabulary');

  const themeNames = usedCategories.filter(c => c !== 'general')
    .map(c => c.charAt(0).toUpperCase() + c.slice(1));

  let reason = '';
  if (parts.length > 0) {
    reason = `Uses ${parts.join(' and ')} to create memorable associations. `;
  }
  if (themeNames.length > 0) {
    reason += `Word themes drawn from: ${themeNames.join(', ')}. `;
  }
  reason += 'Raw personal data (name, birth year) is never placed directly in the password.';

  return { strengthLine, personalLine, reason };
}

// ── Public: profile persistence (localStorage) ────────────────────────────

const STORAGE_KEY = 'passguard_pg_profile';

/**
 * Load the saved profile from localStorage.
 * Returns an empty object if nothing is saved.
 */
export function loadSavedProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save the profile to localStorage for future sessions.
 */
export function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage errors (private browsing etc.)
  }
}

/**
 * Check whether a profile has at least one useful field filled.
 */
export function isProfileFilled(profile = {}) {
  const fields = ['name','surname','nick','username','pet','partner',
                  'company','dob','favoriteNumber','gamerTag','sportsTeam',
                  'commonAlias'];
  return fields.some(k => {
    const v = profile[k];
    if (!v) return false;
    return String(v).trim().length > 0;
  }) || (Array.isArray(profile.customKeywords) && profile.customKeywords.some(k => k?.trim()));
}

/**
 * Count filled fields.
 */
export function countFilledFields(profile = {}) {
  const fields = ['name','surname','nick','username','pet','partner',
                  'company','dob','favoriteNumber','gamerTag','sportsTeam','commonAlias'];
  let count = fields.filter(k => (profile[k] || '').toString().trim().length > 0).length;
  if (Array.isArray(profile.customKeywords) && profile.customKeywords.some(k => k?.trim())) count++;
  return count;
}
