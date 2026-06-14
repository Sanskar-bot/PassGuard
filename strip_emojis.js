/**
 * strip_emojis.js
 * Removes emoji characters from all JS/HTML/CSS files in the project
 * and replaces the colored-circle risk emojis with clean text severity labels.
 */
const fs   = require('fs');
const path = require('path');

// Emoji ranges to strip (broad unicode coverage)
const EMOJI_RE = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|\u{231A}|\u{231B}|\u{23E9}|\u{23F3}|\u{25FE}|\u{2614}|\u{2615}|\u{2648}|\u{26A0}/gu;

// Specific replacements BEFORE stripping so we keep the semantic
const REPLACEMENTS = [
  // Colored circle risk badges → clean text
  [/CRITICAL \s*/g,  'CRITICAL '],
  [/HIGH \s*/g,  'HIGH '],
  [/MED \s*/g,  'MED '],
  [/SAFE \s*/g,  'SAFE '],
  // Common decorative emoji → meaningful text or nothing
  [/\s*/g,  ''],
  [/?\s*/g, ''],
  [/\s*/g,  ''],
  [/\s*/g,  ''],
  [/?\s*/g, ''],
  [/\s*/g,  ''],
  [/\s*/g,  ''],
  [/\s*/g,  ''],
  [/?\s*/g, ''],
  [/?\s*/g, ''],
  [/\s*/g,   ''],
  [/\s*/g,   ''],  // remove leading warning triangle (section titles handle this via CSS)
  [/\s*/g,   ''],
];

const EXTS = new Set(['.js', '.html', '.css']);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git','node_modules','cupp-master'].includes(entry.name)) continue;
      walk(full);
    } else if (EXTS.has(path.extname(entry.name).toLowerCase())) {
      let src = fs.readFileSync(full, 'utf8');
      let out = src;
      for (const [pat, rep] of REPLACEMENTS) out = out.replace(pat, rep);
      out = out.replace(EMOJI_RE, '');
      if (out !== src) {
        fs.writeFileSync(full, out, 'utf8');
        console.log('Cleaned:', full.replace(process.cwd() + path.sep, ''));
      }
    }
  }
}

walk(path.join(__dirname));
console.log('Done.');
