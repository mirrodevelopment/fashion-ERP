/* ============================================================
   HAULO BOUTIQUE ERP — Branding & Theme Controller
   Path: front end/settings/branding/branding.js
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  BrandingSettings.init();
});

const BrandingSettings = (() => {

  function init() {
    _setupColorPickers();
    _loadSavedBranding();
    setTimeout(() => _syncThemeUI(), 150);
  }

  function _setupColorPickers() {
    const pairs = [
      { picker: 'invoiceHeaderColor', hex: 'invoiceHeaderColorHex' },
      { picker: 'accentColor',        hex: 'accentColorHex'        },
    ];
    pairs.forEach(({ picker, hex }) => {
      const p = document.getElementById(picker);
      const h = document.getElementById(hex);
      if (!p || !h) return;
      p.addEventListener('input', () => { h.value = p.value; });
      h.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(h.value)) p.value = h.value;
      });
    });
  }

  function _loadSavedBranding() {
    try {
      const saved = localStorage.getItem('haulo_branding_prefs');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.headerColor) {
          _setVal('invoiceHeaderColor', d.headerColor);
          _setVal('invoiceHeaderColorHex', d.headerColor);
        }
        if (d.accentColor) {
          _setVal('accentColor', d.accentColor);
          _setVal('accentColorHex', d.accentColor);
        }
        if (d.invoiceTemplate) _setVal('invoiceTemplate', d.invoiceTemplate);
        if (d.invoiceFont) _setVal('invoiceFont', d.invoiceFont);
        if (d.invoiceFooterText) _setVal('invoiceFooterText', d.invoiceFooterText);
      }
    } catch (_) {}
  }

  function _syncThemeUI() {
    const currentTheme = (typeof HauloTheme !== 'undefined' && HauloTheme.get)
      ? HauloTheme.get()
      : (localStorage.getItem('haulo-theme') || 'classic');

    document.querySelectorAll('.theme-preset').forEach(btn => {
      const isMatch = btn.dataset.theme === currentTheme;
      btn.classList.toggle('active', isMatch);
      const check = btn.querySelector('.theme-check');
      if (check) check.style.display = isMatch ? 'inline-block' : 'none';
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function selectTheme(themeId, btn) {
    if (typeof HauloTheme !== 'undefined' && HauloTheme.set) {
      HauloTheme.set(themeId, true);
    } else {
      localStorage.setItem('haulo-theme', themeId);
      if (themeId === 'classic') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', themeId);
      }
    }
    _syncThemeUI();
    showToast(`✓ Theme switched to ${btn ? btn.querySelector('span')?.textContent.trim() : themeId}`, 'success');
  }

  function save() {
    const btn = document.getElementById('btnSaveAll');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin .6s linear infinite"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Saving…';
    }

    const payload = {
      headerColor: document.getElementById('invoiceHeaderColor')?.value || '#1F211F',
      accentColor: document.getElementById('accentColor')?.value || '#B8FF3D',
      invoiceTemplate: document.getElementById('invoiceTemplate')?.value || 'luxury',
      invoiceFont: document.getElementById('invoiceFont')?.value || 'Montserrat',
      invoiceFooterText: document.getElementById('invoiceFooterText')?.value || ''
    };

    try {
      localStorage.setItem('haulo_branding_prefs', JSON.stringify(payload));
      showToast('✓ Branding & Theme preferences saved successfully', 'success');
    } catch (e) {
      showToast('Failed to save branding preferences', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="save" style="width:15px;height:15px;"></i> Save Changes';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  }

  function _setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null) el.value = val;
  }

  let _toastTimer = null;
  function showToast(msg, type = 'success') {
    const t = document.getElementById('settingsToast');
    if (!t) return;
    clearTimeout(_toastTimer);
    t.className = `settings-toast ${type}`;
    t.textContent = msg;
    t.classList.add('show');
    _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  return {
    init,
    selectTheme,
    save,
    showToast
  };
})();
