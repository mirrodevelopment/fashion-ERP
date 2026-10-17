/* ============================================================
   HAULO BOUTIQUE ERP — Regional & Currency Controller
   Path: front end/settings/regional/regional.js
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  RegionalSettings.init();
});

const RegionalSettings = (() => {

  const CURRENCY_SYMBOLS = {
    INR: '₹',
    AED: 'د.إ',
    USD: '$',
    GBP: '£',
    SGD: 'S$'
  };

  function init() {
    _loadPreferences();
    _bindEvents();
    _updateSample();
  }

  function _bindEvents() {
    ['currency', 'currencyPosition', 'dateFormat'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', _updateSample);
    });
  }

  function _loadPreferences() {
    try {
      const saved = localStorage.getItem('haulo_regional_prefs');
      if (saved) {
        const d = JSON.parse(saved);
        _setVal('currency', d.currency || 'INR');
        _setVal('currencyPosition', d.currencyPosition || 'Prefix');
        _setVal('dateFormat', d.dateFormat || 'DD/MM/YYYY');
        _setVal('timeFormat', d.timeFormat || '12-hour (AM/PM)');
        _setVal('timezone', d.timezone || 'Asia/Kolkata');
        _setVal('language', d.language || 'English');
        _setVal('taxName', d.taxName || 'GST');
        _setVal('defaultTaxRate', d.defaultTaxRate !== undefined ? d.defaultTaxRate : 5);
      }
    } catch (_) {}
  }

  function _updateSample() {
    const cur = document.getElementById('currency')?.value || 'INR';
    const pos = document.getElementById('currencyPosition')?.value || 'Prefix';
    const sym = CURRENCY_SYMBOLS[cur] || '₹';
    const sampleEl = document.getElementById('currencySample');
    if (sampleEl) {
      sampleEl.textContent = pos.includes('Suffix') ? `12,500 ${sym}` : `${sym}12,500`;
    }
  }

  async function save() {
    const btn = document.getElementById('btnSaveAll');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin .6s linear infinite"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Saving…';
    }

    const cur = document.getElementById('currency')?.value || 'INR';
    const sym = CURRENCY_SYMBOLS[cur] || '₹';
    const dFmt = document.getElementById('dateFormat')?.value || 'DD/MM/YYYY';

    const payload = {
      currency: cur,
      currencySymbol: sym,
      currencyPosition: document.getElementById('currencyPosition')?.value || 'Prefix',
      dateFormat: dFmt,
      timeFormat: document.getElementById('timeFormat')?.value || '12-hour',
      timezone: document.getElementById('timezone')?.value || 'Asia/Kolkata',
      language: document.getElementById('language')?.value || 'English',
      taxName: document.getElementById('taxName')?.value || 'GST',
      defaultTaxRate: parseFloat(document.getElementById('defaultTaxRate')?.value || '5')
    };

    try {
      localStorage.setItem('haulo_regional_prefs', JSON.stringify(payload));
      localStorage.setItem('haulo_currency_symbol', sym);

      if (typeof CompanyBridge !== 'undefined') {
        const curComp = CompanyBridge.get() || {};
        await CompanyBridge.save({
          ...curComp,
          currencySymbol: sym,
          dateFormat: dFmt
        });
      }

      showToast('✓ Regional & Currency preferences saved successfully', 'success');
    } catch (e) {
      console.error('[Regional] Save error:', e);
      showToast('Failed to save regional preferences', 'error');
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
    save,
    showToast
  };
})();
