/**
 * smartGenerator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Smart password generator — 4 modes.
 *
 * Modes
 * ─────
 *  maxSecurity    — high-entropy character-soup (16–32 chars)
 *  passphrase     — multi-word lowercase with separator
 *  smartMemorable — Title-cased words + optional suffix number/symbol
 *  personalSecure — Derives themed anchors from user profile (separate module)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ALL_WORDS, WORD_BANK } from './wordBank.js';
import { analyseStrength }      from './strength.js';
import { detectPatterns }       from './patterns.js';
import { checkWordlist }        from './wordlist.js';
import { computeScore }         from './scorer.js';

// Neutral username result for passwords that have no associated username.
const NO_USERNAME_RESULT = { checked: false, contains: false, nearMatch: false,
                              variation: false, reversed: false, usernameScore: 10 };

const MIN_SCORE    = 80;
const MAX_ATTEMPTS = 25;

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

// ── Character sets ─────────────────────────────────────────────────────────

const LOWER   = 'abcdefghijklmnopqrstuvwxyz';
const UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS  = '0123456789';
const SYMBOLS = '!@#$%&*-_=+?';

function buildPool(opts) {
  let p = '';
  if (opts.lowercase !== false) p += LOWER;
  if (opts.uppercase !== false) p += UPPER;
  if (opts.digits    !== false) p += DIGITS;
  if (opts.symbols)              p += SYMBOLS;
  if (!p) p = LOWER + UPPER + DIGITS;
  return p;
}

// ── Mode generators ────────────────────────────────────────────────────────

function genMaxSecurity(opts = {}) {
  const len     = Math.max(16, opts.length ?? 20);
  const useSyms = opts.symbols !== false;
  const pool    = buildPool({ lowercase: true, uppercase: true, digits: true, symbols: useSyms });
  const required = [
    pick(LOWER.split('')), pick(UPPER.split('')), pick(DIGITS.split('')),
    ...(useSyms ? [pick(SYMBOLS.split(''))] : []),
  ];
  const extra = Array.from({ length: len - required.length }, () => pool[rand(pool.length)]);
  return shuffle([...required, ...extra]).join('');
}

function genPassphrase(opts = {}) {
  const count = Math.max(3, Math.min(6, opts.wordCount ?? 4));
  const sep   = opts.separator ?? '-';
  const words = Array.from({ length: count }, () => pick(ALL_WORDS).toLowerCase());
  let pw = words.join(sep);
  if (opts.digits !== false) pw += sep + (10 + rand(90));
  return pw;
}

function genSmartMemorable(opts = {}) {
  const count  = Math.max(2, Math.min(5, opts.wordCount ?? 3));
  const sep    = opts.separator ?? '';
  const useNum = opts.digits !== false;
  const useSym = opts.symbols ?? false;
  let pool = ALL_WORDS;
  if (opts.category && WORD_BANK[opts.category]) pool = WORD_BANK[opts.category];
  const words = Array.from({ length: count }, () => {
    const w = pick(pool);
    return opts.capitalize !== false
      ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      : w;
  });
  let pw = words.join(sep);
  if (useNum) pw += (10 + rand(90));
  if (useSym) pw += pick(SYMBOLS.split(''));
  return pw;
}

// ── Validator ──────────────────────────────────────────────────────────────

function scorePassword(pw) {
  const strength = analyseStrength(pw);
  const patterns = detectPatterns(pw);
  const wordlist = checkWordlist(pw);
  return computeScore(strength, wordlist, patterns, NO_USERNAME_RESULT);
}

// ── Public API ─────────────────────────────────────────────────────────────

export function generateSmartPassword(mode = 'smartMemorable', opts = {}) {
  const generator = {
    maxSecurity:    genMaxSecurity,
    passphrase:     genPassphrase,
    smartMemorable: genSmartMemorable,
  }[mode] ?? genSmartMemorable;

  let best = null;
  let bestScore = -1;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const pw       = generator(opts);
    const scoreRes = scorePassword(pw);
    if (scoreRes.score > bestScore) {
      best      = { password: pw, ...scoreRes, ...analyseStrength(pw) };
      bestScore = scoreRes.score;
    }
    if (scoreRes.score >= MIN_SCORE) break;
  }
  return best;
}

export function scoreGeneratedPassword(pw) {
  const strength = analyseStrength(pw);
  const patterns = detectPatterns(pw);
  const wordlist = checkWordlist(pw);
  const scoreRes = computeScore(strength, wordlist, patterns, NO_USERNAME_RESULT);
  return { ...scoreRes, ...strength };
}
