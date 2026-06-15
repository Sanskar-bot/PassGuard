/**
 * profilePasswordGenerator.js  VaultZero v3
 *
 * Generates passwords that are:
 *   - Personalized   : contain real profile words (name, pet, alias...)
 *   - Contextual     : contain website-specific keywords
 *   - Strong         : contain a personal number + random word + symbol
 *   - Memorable      : user can reconstruct from memory
 *   - Varied         : 6 slot-order templates so structure is unpredictable
 *
 * Password formula (one template chosen at random each call):
 *
 *   Template A:  ProfileWord + Number + SiteWord + RandomWord + Symbol
 *   Template B:  SiteWord + ProfileWord + RandomWord + Number + Symbol
 *   Template C:  RandomWord + ProfileWord + SiteWord + Number + Symbol
 *   Template D:  Number + SiteWord + ProfileWord + RandomWord + Symbol
 *   Template E:  SiteWord + RandomWord + ProfileWord + Number + Symbol
 *   Template F:  ProfileWord + SiteWord + Number + RandomWord + Symbol
 *
 * Examples (profile: Sanskar, Bruno, fav=7, Instagram):
 *   Bruno47StoryNova!
 *   StorySans47Orbit#
 *   NovaBruno47Photo@
 *   47SocialSans Delta$
 */

import { WORD_BANK, ALL_WORDS } from './wordBank.js';
import { validateGeneratedPassword } from './generatorValidator.js';

const SYMBOLS    = '!@#$%&*?';
const MAX_ATTEMPTS = 120;

// ── Crypto-safe random helpers ─────────────────────────────────────────────

function randomInt(max) {
  if (max <= 0) return 0;
  const buf   = new Uint32Array(1);
  const limit = 0x100000000 - (0x100000000 % max);
  do globalThis.crypto.getRandomValues(buf); while (buf[0] >= limit);
  return buf[0] % max;
}

function pick(arr)  { return arr[randomInt(arr.length)]; }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function titleCase(word) {
  const v = String(word || '').replace(/[^a-z]/gi, '');
  return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
}

// ── Custom keyword parser ──────────────────────────────────────────────────

function parseCustomKeywords(profile) {
  const raw = profile.customKeywords;
  if (Array.isArray(raw))      return raw.map(s => String(s).trim()).filter(Boolean);
  if (typeof raw === 'string') return raw.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

// ── SLOT 1: Profile memory anchor ─────────────────────────────────────────
// Chooses an actual transformed profile word.
// Transformation rules (prevent naked raw data):
//   Full word  (if 4–8 chars) : "Bruno"   → "Bruno"
//   First 4    (if >8 chars)  : "Sanskar" → "Sans" , "Alexander" → "Alex"
//   Pet name                  : "Charlie" → "Charlie"
//   Custom keyword            : "cricket" → "Cricket"
// We pick ONE source randomly on each call so the word differs every time.

function buildProfileWordPool(profile = {}) {
  const candidates = [];

  function add(raw) {
    if (!raw || typeof raw !== 'string') return;
    const clean = raw.trim();
    if (clean.length < 3) return;
    // Use first 4–8 chars so very long names are shortened but still recognizable
    const word = clean.length > 8 ? titleCase(clean.slice(0, 4)) : titleCase(clean);
    if (word.length >= 3) candidates.push(word);
  }

  add(profile.firstName || profile.name);
  add(profile.lastName  || profile.surname);
  add(profile.nickname  || profile.nick);
  add(profile.petName   || profile.pet);
  add(profile.partnerName || profile.partner);
  add(profile.gamerTag);
  add(profile.commonAlias);
  add(profile.sportsTeam);
  for (const kw of parseCustomKeywords(profile)) add(kw);

  // De-duplicate by lowercase
  const seen = new Set();
  return candidates.filter(w => {
    const k = w.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function pickProfileWord(pool) {
  if (pool.length === 0) return titleCase(pick(ALL_WORDS));
  return pick(pool);
}

// ── SLOT 2: Personal number ────────────────────────────────────────────────
// Builds a pool of ALL numbers that carry personal meaning.
// Picks ONE randomly so the number varies every generation.

function buildPersonalNumberPool(profile = {}) {
  const pool = new Set();

  const fav = String(profile.favoriteNumber || '').replace(/\D/g, '');
  if (fav.length >= 1) {
    const n = parseInt(fav, 10);
    if (n >= 1 && n <= 9) {
      pool.add(n * 10 + n);   // 7 → 77
      pool.add(10 + n);       // 7 → 17
      pool.add(20 + n);       // 7 → 27
      pool.add(30 + n);       // 7 → 37
      pool.add(40 + n);       // 7 → 47
      pool.add(50 + n);       // 7 → 57
      pool.add(n * 9);        // 7 → 63
      pool.add(n * 12);       // 7 → 84
    } else if (n >= 10 && n <= 99) {
      pool.add(n);
      pool.add(n + 1);
      pool.add(n - 1 > 9 ? n - 1 : n);
    } else if (n >= 100) {
      const yy = n % 100;
      pool.add(yy >= 10 ? yy : yy * 11);
    }
  }

  // Date of birth
  const dob = String(profile.dob || profile.dateOfBirth || '');
  if (dob) {
    const parts  = dob.split(/[-\/]/);
    const isYMD  = parts[0]?.length === 4;
    const day    = parseInt(isYMD ? parts[2] : parts[0], 10);
    const month  = parseInt(parts[1], 10);
    const year   = parseInt(isYMD ? parts[0] : parts[2], 10);

    if (!isNaN(day)   && day   >= 1 && day   <= 31) pool.add(day < 10 ? day * 11 : day);
    if (!isNaN(month) && month >= 1 && month <= 12) pool.add(month < 10 ? month * 11 : month);
    if (!isNaN(year)  && year  > 1900) {
      const yy = year % 100;
      pool.add(yy < 10 ? yy * 11 : yy);
    }
  }

  const valid = [...pool].filter(n => n >= 10 && n <= 999);
  if (valid.length === 0) valid.push(10 + randomInt(90));
  return valid;
}

function pickPersonalNumber(profile) {
  return String(pick(buildPersonalNumberPool(profile)));
}

// ── SLOT 3: Website keyword ────────────────────────────────────────────────

function pickSiteWord(websiteContext, excluded = new Set()) {
  const pool = (websiteContext?.keywords?.length ? websiteContext.keywords : ['Account'])
    .filter(w => !excluded.has(w.toLowerCase()));
  return pool.length > 0 ? titleCase(pick(pool)) : 'Account';
}

// ── SLOT 4: Random secure word ─────────────────────────────────────────────

function pickRandomWord(excluded = new Set()) {
  const shuffled = shuffle(ALL_WORDS);
  for (const w of shuffled) {
    if (w.length >= 4 && !excluded.has(w.toLowerCase())) return titleCase(w);
  }
  return titleCase(shuffled[0]);
}

// ── Template system ────────────────────────────────────────────────────────
// 6 slot-order templates so the position of each component varies.
// P = profile word, N = personal number, S = site word, R = random word, Y = symbol

const TEMPLATES = [
  (P, N, S, R, Y) => `${P}${N}${S}${R}${Y}`,    // A: Bruno47StoryNova!
  (P, N, S, R, Y) => `${S}${P}${R}${N}${Y}`,    // B: StoryBruno47Nova@
  (P, N, S, R, Y) => `${R}${P}${S}${N}${Y}`,    // C: NovaBrunoStory47#
  (P, N, S, R, Y) => `${N}${S}${P}${R}${Y}`,    // D: 47StoryBrunoNova$
  (P, N, S, R, Y) => `${S}${R}${P}${N}${Y}`,    // E: StoryNovaBruno47%
  (P, N, S, R, Y) => `${P}${S}${N}${R}${Y}`,    // F: BrunoStory47Nova&
];

// ── Candidate builder ──────────────────────────────────────────────────────

function makeCandidate(profile, websiteContext, profileWordPool, options = {}) {
  const profileWord = pickProfileWord(profileWordPool);
  const number      = pickPersonalNumber(profile);
  const symbol      = options.symbols === false ? '' : pick(SYMBOLS);

  const excluded = new Set([profileWord.toLowerCase()]);
  const siteWord  = pickSiteWord(websiteContext, excluded);
  excluded.add(siteWord.toLowerCase());
  const randomWord = pickRandomWord(excluded);

  const template = pick(TEMPLATES);
  return template(profileWord, number, siteWord, randomWord, symbol);
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function generateContextAwarePassword({
  profile        = {},
  websiteContext = {},
  username       = '',
  validation     = {},
  options        = {},
} = {}) {
  const profileWordPool = buildProfileWordPool(profile);

  let best = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const password = makeCandidate(profile, websiteContext, profileWordPool, options);
    const result   = await validateGeneratedPassword(password, {
      ...validation,
      profile,
      username,
      domain: websiteContext.domain || validation.domain || '',
      allowProfileAnchors: true,   // ← profile words are INTENTIONAL
    });

    if (!best || result.strengthScore > best.validation.strengthScore) {
      best = { password, validation: result, attempt };
    }
    if (result.passed) {
      return { password, validation: result, attempt, websiteContext };
    }
  }

  // Return best candidate even if it didn't fully pass
  if (best) {
    return { password: best.password, validation: best.validation, attempt: best.attempt, websiteContext };
  }

  throw new Error('Unable to produce a password that passes all validation checks.');
}
