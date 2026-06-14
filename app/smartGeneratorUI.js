/**
 * smartGeneratorUI.js
 * ─────────────────────────────────────────────────────────────────────────────
 * UI controller for the Smart Password Generator section.
 *
 * Responsibilities:
 *  - Wire DOM controls to shared/smartGenerator.js
 *  - Drive live analysis on every keystroke in the editable password field
 *  - Manage mode tabs and customisation panel state
 *  - Send password to the main analyser on request
 *
 * This file contains NO generation or scoring logic.
 * All business logic lives in shared/smartGenerator.js.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { generateSmartPassword, scoreGeneratedPassword } from '../shared/smartGenerator.js';
import { estimateCrackTimes } from '../shared/bruteforce.js';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const pwInput      = document.getElementById('sg-password');
const generateBtn  = document.getElementById('sg-generate-btn');
const regenBtn     = document.getElementById('sg-regen-btn');
const copyBtn      = document.getElementById('sg-copy-btn');
const analyseBtn   = document.getElementById('sg-analyse-btn');
const scoreCard    = document.getElementById('sg-score-card');
const barTrack     = document.getElementById('sg-bar-track');
const barFill      = document.getElementById('sg-bar-fill');
const ringFill     = document.getElementById('sg-ring-fill');
const scoreVal     = document.getElementById('sg-score-val');
const scoreCat     = document.getElementById('sg-score-cat');
const entropyEl    = document.getElementById('sg-entropy');
const lengthEl     = document.getElementById('sg-length');
const crackLine    = document.getElementById('sg-crack-line');
const modeDesc     = document.getElementById('sg-mode-desc');
const tabs         = document.querySelectorAll('.sg-tab');
const customToggle = document.getElementById('sg-custom-toggle');
const customPanel  = document.getElementById('sg-custom-panel');
const customCaret  = document.getElementById('sg-custom-caret');
const wcField      = document.getElementById('sg-wc-field');
const sepField     = document.getElementById('sg-sep-field');
const capsField    = document.getElementById('sg-caps-field');
const catField     = document.getElementById('sg-cat-field');
const wcSlider     = document.getElementById('sg-word-count');
const wcVal        = document.getElementById('sg-wc-val');
const useNums      = document.getElementById('sg-use-nums');
const useSyms      = document.getElementById('sg-use-syms');
const capitalize   = document.getElementById('sg-capitalize');
const categoryEl   = document.getElementById('sg-category');
const sepBtns      = document.querySelectorAll('.sg-sep-btn');

// ── State ─────────────────────────────────────────────────────────────────────
let currentMode = 'smartMemorable';
let separator   = '';
let liveDebounce = null;

const RING_CIRC = 2 * Math.PI * 50; // r=50

const MODE_META = {
  smartMemorable: {
    desc: 'Title-cased words + number suffix \u2014 easy to type, hard to crack',
    showWc: true, showSep: true, showCaps: true, showCat: true,
  },
  passphrase: {
    desc: 'Multiple lowercase words joined by a separator \u2014 high entropy through length',
    showWc: true, showSep: true, showCaps: false, showCat: false,
  },
  maxSecurity: {
    desc: 'Maximum entropy character-pool password \u2014 highest security, hardest to memorise',
    showWc: false, showSep: false, showCaps: false, showCat: false,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOpts() {
  return {
    wordCount:  parseInt(wcSlider.value, 10),
    separator,
    digits:     useNums.checked,
    symbols:    useSyms.checked,
    capitalize: capitalize.checked,
    category:   categoryEl.value || undefined,
  };
}

function showActionButtons() {
  regenBtn.style.display   = '';
  copyBtn.style.display    = '';
  analyseBtn.style.display = '';
}

function updateModeUI(mode) {
  const meta = MODE_META[mode];
  modeDesc.textContent = meta.desc;
  wcField.style.display    = meta.showWc   ? '' : 'none';
  sepField.style.display   = meta.showSep  ? '' : 'none';
  capsField.style.display  = meta.showCaps ? '' : 'none';
  catField.style.display   = meta.showCat  ? '' : 'none';
}

// ── Score rendering ───────────────────────────────────────────────────────────

function renderScore(res) {
  if (!res) return;

  // Ring
  const offset = RING_CIRC * (1 - res.score / 100);
  ringFill.style.strokeDasharray  = RING_CIRC;
  ringFill.style.strokeDashoffset = offset;
  ringFill.style.stroke           = res.color;

  // Text
  scoreVal.textContent = res.score;
  scoreCat.textContent = res.category;
  scoreCat.style.color = res.color;

  // Entropy + length
  entropyEl.textContent = res.entropy ?? '—';
  lengthEl.textContent  = res.length  ?? 0;

  // Crack time (online throttled only — same rationale as widget)
  try {
    const times = estimateCrackTimes(res.charsetSize, res.length);
    const ct    = times.find(t => t.id === 'online_throttled') || times[0];
    crackLine.textContent = ct ? `Online login: ${ct.display}` : '';
    crackLine.style.color = ct?.severity === 'safe' ? '#22c55e'
                          : ct?.severity === 'moderate' ? '#84cc16'
                          : ct?.severity === 'warning'  ? '#f59e0b'
                          : '#ef4444';
  } catch (_) {}

  // Strength bar
  barFill.style.width      = `${res.score}%`;
  barFill.style.background = res.color;

  // Show panels
  scoreCard.style.display = '';
  barTrack.style.display  = '';
}

// ── Core: generate ────────────────────────────────────────────────────────────

function generate() {
  generateBtn.textContent = 'Generating…';
  generateBtn.disabled    = true;

  // Use setTimeout(0) to allow the button label to repaint before the CPU work
  setTimeout(() => {
    try {
      const result = generateSmartPassword(currentMode, getOpts());
      if (result) {
        pwInput.value = result.password;
        renderScore(result);
        showActionButtons();
        generateBtn.textContent = 'Generate';
      }
    } catch (e) {
      console.error('[SmartGenerator]', e);
      pwInput.value = '';
      pwInput.placeholder = 'Generation failed — try different options';
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate';
    }
  }, 0);
}

// ── Core: live analyse while editing ─────────────────────────────────────────

function liveAnalyse() {
  const pw = pwInput.value;
  if (!pw) {
    scoreCard.style.display = 'none';
    barTrack.style.display  = 'none';
    return;
  }
  const res = scoreGeneratedPassword(pw);
  renderScore(res);
  showActionButtons();
}

// ── Events ────────────────────────────────────────────────────────────────────

// Mode tabs
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    currentMode = tab.dataset.mode;
    updateModeUI(currentMode);
  });
});

// Generate button
generateBtn.addEventListener('click', generate);

// Regenerate button
regenBtn.addEventListener('click', generate);

// Copy button
copyBtn.addEventListener('click', () => {
  const pw = pwInput.value;
  if (!pw) return;
  navigator.clipboard.writeText(pw).then(() => {
    const orig = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = orig; }, 1500);
  });
});

// Send to main analyser
analyseBtn.addEventListener('click', () => {
  const mainInput = document.getElementById('password-input');
  if (!mainInput || !pwInput.value) return;
  mainInput.value = pwInput.value;
  mainInput.dispatchEvent(new Event('input', { bubbles: true }));
  mainInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Live analysis while editing
pwInput.addEventListener('input', () => {
  clearTimeout(liveDebounce);
  liveDebounce = setTimeout(liveAnalyse, 80);
});

// Customisation toggle
customToggle.addEventListener('click', () => {
  const isOpen = !customPanel.hidden;
  customPanel.hidden = isOpen;
  customToggle.setAttribute('aria-expanded', String(!isOpen));
  customCaret.innerHTML = isOpen ? '&#9660;' : '&#9650;';
});

// Word count slider
wcSlider.addEventListener('input', () => {
  wcVal.textContent = wcSlider.value;
});

// Separator buttons
sepBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sepBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    separator = btn.dataset.sep;
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────
updateModeUI(currentMode);
// Auto-generate one password on load so the section feels alive
generate();
