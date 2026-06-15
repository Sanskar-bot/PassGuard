/**
 * nav.js  PassGuard shared navigation module
 *
 * Injects the persistent top navigation bar into every page.
 * Call inject() once in each page's <script type="module">.
 *
 * Usage:
 *   import { inject } from './nav.js';
 *   inject();
 */

const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/app/index.html',      match: /\/app\/index\.html$|^\/$/ },
  { label: 'Analyzer',   href: '/app/analyzer.html',   match: /analyzer/ },
  { label: 'Generator',  href: '/app/generator.html',  match: /generator/ },
  { label: 'Attack Lab', href: '/app/attack-lab.html', match: /attack-lab/ },
  { label: 'Academy',    href: '/app/academy.html',    match: /academy/ },
  { label: 'Extension',  href: '/app/extension.html',  match: /extension/ },
];

const LOGO_IMG = `<img src="/app/passguard_icon.png" alt="PassGuard" width="28" height="28"
  style="display:block;border-radius:4px;flex-shrink:0" />`;

const USER_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>`;

const MENU_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>`;

const CLOSE_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>`;

export function inject() {
  const path = window.location.pathname;

  const links = NAV_ITEMS.map(item => {
    const isActive = item.match.test(path);
    return `<li>
      <a href="${item.href}" class="pg-nav__link${isActive ? ' active' : ''}">${item.label}</a>
    </li>`;
  }).join('');

  const nav = document.createElement('nav');
  nav.className = 'pg-nav';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main navigation');
  nav.innerHTML = `
    <div class="pg-nav__inner">
      <a class="pg-nav__logo" href="/app/index.html" aria-label="PassGuard home">
        ${LOGO_IMG}
        PassGuard
      </a>
      <ul class="pg-nav__links" id="pg-nav-links">${links}</ul>
      <div class="pg-nav__right">
        <span class="pg-nav__sep" aria-hidden="true"></span>
        <a href="/app/profile.html"
           class="pg-nav__icon-btn${/profile/.test(path) ? ' active' : ''}"
           aria-label="Security Profile"
           title="Security Profile">
          ${USER_SVG}
        </a>
      </div>
      <button class="pg-nav__burger" id="pg-nav-burger"
              aria-label="Toggle menu" aria-expanded="false"
              aria-controls="pg-nav-links">
        <span id="pg-nav-burger-icon">${MENU_SVG}</span>
      </button>
    </div>`;

  document.body.prepend(nav);
  _bindBurger(nav);
}

function _bindBurger(nav) {
  const burger  = nav.querySelector('#pg-nav-burger');
  const icon    = nav.querySelector('#pg-nav-burger-icon');

  if (!burger) return;

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('pg-nav--open');
    burger.setAttribute('aria-expanded', String(isOpen));
    icon.innerHTML = isOpen ? CLOSE_SVG : MENU_SVG;
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      nav.classList.remove('pg-nav--open');
      burger.setAttribute('aria-expanded', 'false');
      icon.innerHTML = MENU_SVG;
    }
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('pg-nav--open')) {
      nav.classList.remove('pg-nav--open');
      burger.setAttribute('aria-expanded', 'false');
      icon.innerHTML = MENU_SVG;
      burger.focus();
    }
  });
}
