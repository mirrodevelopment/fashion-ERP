/**
 * ================================================================
 * HAULO BOUTIQUE ERP — Multi-Theme Switch Controller
 * Path: front end/fragments/theme/theme-switch.js
 *
 * Manages cyclic switching between:
 *   1. "classic"     → default :root (warm boutique glassmorphism)
 *   2. "haulo-dark"  → solid dark obsidian minimalist
 *   3. "haulo-light" → luxury haute couture atelier daylight
 *
 * Usage:
 *   HauloTheme.toggle()           — cycle to next theme
 *   HauloTheme.set('haulo-light') — set specific theme
 *   HauloTheme.get()              — returns current theme id
 *   HauloTheme.getAll()           — returns list of available themes
 *
 * State persisted in localStorage under key "haulo-theme".
 * ================================================================ */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'haulo-theme';
  const BTN_ID      = 'hauloThemeToggleBtn';

  const THEMES = [
    {
      id: 'classic',
      name: 'Classic Warm Glass',
      attr: null,
      iconType: 'moon',
      indicatorColor: '#B8FF3D'
    },
    {
      id: 'haulo-dark',
      name: 'Haulo Obsidian Dark',
      attr: 'haulo-dark',
      iconType: 'orb',
      indicatorColor: '#A3E635'
    },
    {
      id: 'haulo-light',
      name: 'Haulo Atelier Light',
      attr: 'haulo-light',
      iconType: 'sun',
      indicatorColor: '#65A30D'
    }
  ];

  /* ── Read / Write Saved Preference ── */
  function _getSaved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  }
  function _save(themeId) {
    try { localStorage.setItem(STORAGE_KEY, themeId); } catch (_) {}
  }

  /* ── Apply Theme to <html> ── */
  function _apply(themeId, animate) {
    const html = document.documentElement;
    const themeObj = THEMES.find(t => t.id === themeId) || THEMES[0];

    if (animate) {
      html.classList.add('theme-switching');
      setTimeout(() => html.classList.remove('theme-switching'), 350);
    }

    if (themeObj.attr) {
      html.setAttribute('data-theme', themeObj.attr);
    } else {
      html.removeAttribute('data-theme');
    }

    _save(themeObj.id);
    _updateButtons(themeObj.id);
    window.dispatchEvent(new CustomEvent('haulo-theme-changed', {
      detail: { theme: themeObj.id, themeName: themeObj.name }
    }));
  }

  /* ── Update Injected Toggle Buttons ── */
  function _updateButtons(currentThemeId) {
    const currentIndex = THEMES.findIndex(t => t.id === currentThemeId);
    const resolvedIndex = currentIndex >= 0 ? currentIndex : 0;
    const currentTheme = THEMES[resolvedIndex];
    const nextIndex = (resolvedIndex + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex];

    const label = `Theme: ${currentTheme.name} (Click for ${nextTheme.name})`;

    document.querySelectorAll('[data-haulo-theme-btn]').forEach(btn => {
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);

      if (currentTheme.iconType === 'orb') {
        btn.innerHTML = _orbIcon();
      } else if (currentTheme.iconType === 'sun') {
        btn.innerHTML = _sunIcon();
      } else {
        btn.innerHTML = _moonIcon();
      }
    });
  }

  /* ── Dynamic Theme SVGs ── */
  function _moonIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" style="width:15px;height:15px;">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>`;
  }

  function _orbIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" style="width:15px;height:15px;">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 3a9 9 0 0 0 0 18v-18z" fill="currentColor"/>
            </svg>`;
  }

  function _sunIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" style="width:15px;height:15px;">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>`;
  }

  /* ── Public API ── */
  const HauloTheme = {

    /** Returns the current active theme id */
    get: function () {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'haulo-dark') return 'haulo-dark';
      if (attr === 'haulo-light') return 'haulo-light';
      return 'classic';
    },

    /** Returns all available theme objects */
    getAll: function () {
      return THEMES.map(t => ({ id: t.id, name: t.name }));
    },

    /** Set a specific theme by id */
    set: function (themeId, animate) {
      const valid = THEMES.some(t => t.id === themeId);
      if (!valid) {
        console.warn('[HauloTheme] Unknown theme:', themeId, '— valid:', THEMES.map(t => t.id).join(', '));
        return;
      }
      _apply(themeId, animate !== false);
    },

    /** Cycle to the next theme in sequence */
    toggle: function () {
      const current = HauloTheme.get();
      const currentIndex = THEMES.findIndex(t => t.id === current);
      const nextIndex = (currentIndex + 1) % THEMES.length;
      _apply(THEMES[nextIndex].id, true);
    },

    /**
     * Inject a theme-toggle button into an existing container.
     * Called by nav.js after the topbar renders.
     */
    injectButton: function (container, opts) {
      if (!container) return;
      if (document.getElementById(BTN_ID)) return; // already injected

      const btn = document.createElement('button');
      btn.id = BTN_ID;
      btn.className = 'icon-btn haulo-theme-btn';
      btn.setAttribute('data-haulo-theme-btn', '');
      btn.setAttribute('type', 'button');
      btn.style.cssText = [
        'display:inline-flex',
        'align-items:center',
        'justify-content:center',
        'width:30px',
        'height:30px',
        'border-radius:8px',
        'border:1px solid var(--border-card, rgba(255,255,255,0.12))',
        'background:var(--bg-card, rgba(255,255,255,0.07))',
        'cursor:pointer',
        'color:var(--text-secondary)',
        'transition:all 0.18s ease',
        'flex-shrink:0',
      ].join(';');

      btn.addEventListener('click', function () { HauloTheme.toggle(); });
      btn.addEventListener('mouseenter', function () {
        btn.style.background  = 'var(--bg-card-hover, rgba(255,255,255,0.14))';
        btn.style.borderColor = 'var(--border-card-hover, rgba(255,255,255,0.22))';
        btn.style.color       = 'var(--text-primary)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.background  = 'var(--bg-card, rgba(255,255,255,0.07))';
        btn.style.borderColor = 'var(--border-card, rgba(255,255,255,0.12))';
        btn.style.color       = 'var(--text-secondary)';
      });

      if (opts && opts.insertBefore) {
        const ref = container.querySelector(opts.insertBefore);
        if (ref) { container.insertBefore(btn, ref); }
        else     { container.appendChild(btn); }
      } else {
        container.appendChild(btn);
      }

      _updateButtons(HauloTheme.get());
    },

    /** Restore persisted theme on page load (call ASAP before DOM renders) */
    init: function () {
      const saved = _getSaved();
      const valid = THEMES.some(t => t.id === saved);
      if (saved && valid) {
        _apply(saved, false);
      } else {
        _apply('classic', false);
      }
    }
  };

  /* ── Auto-init on script load ── */
  HauloTheme.init();

  /* ── Re-inject button after topbar renders ── */
  window.addEventListener('haulo-nav-ready', function () {
    const topbarRight = document.querySelector('.topbar-right');
    if (topbarRight) {
      HauloTheme.injectButton(topbarRight, { insertBefore: '#notifWrap' });
    }
  });

  /* ── DOM fallback listener ── */
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      const topbarRight = document.querySelector('.topbar-right');
      if (topbarRight && !document.getElementById(BTN_ID)) {
        HauloTheme.injectButton(topbarRight, { insertBefore: '#notifWrap' });
      }
    }, 120);
  });

  /* ── Expose globally ── */
  window.HauloTheme = HauloTheme;

})(window);
