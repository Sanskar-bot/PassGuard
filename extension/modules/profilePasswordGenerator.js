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

// ── SLOT 1: Personal name word ─────────────────────────────────────────────
// Takes a RANDOM profile field on each call, finds word-bank words starting
// with that field's first letter. Raw values are never exposed.

function buildNameAnchorSources(profile = {}) {
  const candidates = [
    profile.firstName   || profile.name,
    profile.lastName    || profile.surname,
    profile.nickname    || profile.nick,
    profile.petName     || profile.pet,
    profile.partnerName,
    profile.gamerTag,
    profile.commonAlias,
    profile.companyName || profile.company,
    profile.sportsTeam,
    ...parseCustomKeywords(profile),
  ].filter(v => v && typeof v === 'string' && v.trim().length >= 2);

  // Build a pool per unique first-letter so every call can differ
  const byLetter = new Map();
  for (const val of candidates) {
    const letter = val.trim().charAt(0).toUpperCase();
    if (!byLetter.has(letter)) {
      const words = ALL_WORDS.filter(w => w.charAt(0).toUpperCase() === letter);
      if (words.length > 0) byLetter.set(letter, { letter, source: val.trim(), words });
    }
  }
  return [...byLetter.values()];
}

function pickNameWord(sources, excluded = new Set()) {
  if (sources.length === 0) return titleCase(pick(ALL_WORDS));
  const shuffled = shuffle(sources);
  for (const { words } of shuffled) {
    const word = pick(shuffle(words).filter(w =>
      w.length >= 4 && !excluded.has(w.toLowerCase())
    ));
    if (word) return titleCase(word);
  }
  return titleCase(pick(ALL_WORDS));
}

// ── SLOT 2: Personal number ────────────────────────────────────────────────
// Builds a pool of ALL numbers that have personal meaning, picks ONE at random.

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
      pool.add(n * 7);        // 7 → 49
      pool.add(n * 9);        // 7 → 63
      pool.add(n * 12);       // 7 → 84
    } else if (n >= 10 && n <= 99) {
      pool.add(n);
      if (n + 3 <= 99)  pool.add(n + 3);
      if (n - 3 >= 10)  pool.add(n - 3);
      pool.add(Math.floor(n / 10) * 11); // leading digit doubled: 26 → 22
    } else if (n >= 100) {
      pool.add(n % 100 >= 10 ? n % 100 : (n % 10) * 11);
    }
  }

  // Date of birth
  const dob = String(profile.dob || profile.dateOfBirth || '');
  if (dob) {
    const parts = dob.split(/[-\/]/);
    const isYMD = parts[0]?.length === 4;
    const day   = parseInt(isYMD ? parts[2] : parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year  = parseInt(isYMD ? parts[0] : parts[2], 10);

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
// One word from the current site's brand keywords.

function pickSiteWord(websiteContext, excluded = new Set()) {
  const pool = (websiteContext?.keywords?.length ? websiteContext.keywords : ['Account'])
    .filter(w => !excluded.has(w.toLowerCase()));
  return pool.length > 0 ? titleCase(pick(pool)) : 'Account';
}

// ── SLOT 4: Random secure word ─────────────────────────────────────────────
// One random word from the full word bank — adds entropy, no personal info.

function pickRandomWord(excluded = new Set()) {
  const shuffled = shuffle(ALL_WORDS);
  for (const w of shuffled) {
    if (w.length >= 4 && !excluded.has(w.toLowerCase())) return titleCase(w);
  }
  return titleCase(shuffled[0]);
}

// ── Candidate builder ──────────────────────────────────────────────────────
//
// FIXED STRUCTURE (positions 1-4 always present, symbol at end):
//
//   Slot 1  → Personal name word    (letter-pivot from a random profile field)
//   Slot 2  → Personal number       (random pick from personal number pool)
//   Slot 3  → Website keyword       (one of the site's brand words)
//   Slot 4  → Random secure word    (from full word bank)
//   Symbol  → Random special char
//
// Example: Stellar49CreativeNexus!
//           ↑      ↑  ↑        ↑  ↑
//           S=name 49 Instagram  word sym

function makeCandidate(profile, websiteContext, anchorSources, options = {}) {
  const used = new Set();

  // Slot 1 — name word from profile (e.g. Stellar for Sanskar)
  const nameWord = pickNameWord(anchorSources, used);
  used.add(nameWord.toLowerCase());

  // Slot 2 — personal number (e.g. 49, 17, 77...)
  const number = pickPersonalNumber(profile);

  // Slot 3 — website keyword (e.g. Creative, Photo, Story)
  const siteWord = pickSiteWord(websiteContext, used);
  used.add(siteWord.toLowerCase());

  // Slot 4 — one random secure word from word bank
  const randomWord = pickRandomWord(used);

  // Symbol
  const symbol = options.symbols === false ? '' : pick(SYMBOLS);

  // Assemble: NameWord + Number + SiteWord + RandomWord + Symbol
  return `${nameWord}${number}${siteWord}${randomWord}${symbol}`;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function generateContextAwarePassword({
  profile        = {},
  websiteContext = {},
  username       = '',
  validation     = {},
  options        = {},
} = {}) {
  const anchorSources = buildNameAnchorSources(profile);

  let best = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const password = makeCandidate(profile, websiteContext, anchorSources, options);
    const result   = await validateGeneratedPassword(password, {
      ...validation,
      profile,
      username,
      domain: websiteContext.domain || validation.domain || '',
    });

    if (!best || result.strengthScore > best.validation.strengthScore) {
      best = { password, validation: result, attempt };
    }
    if (result.passed) {
      return { password, validation: result, attempt, websiteContext };
    }
  }

  const error = new Error(
    best?.validation?.reasoning ||
    'Unable to produce a password that passes all validation checks.'
  );
  error.bestCandidate = best;
  throw error;
}
