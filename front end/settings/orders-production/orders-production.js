/* ============================================================
   HAULO BOUTIQUE ERP — Orders & Production Settings Controller
   Path: front end/settings/orders-production/orders-production.js
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  OrdersSettings.init();
});

const OrdersSettings = (() => {

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

  function init() {
    _setupOrderCodePreview();
    _loadSavedSettings();
  }

  function _setupOrderCodePreview() {
    const prefix = document.getElementById('orderPrefix');
    const preview = document.getElementById('orderCodePreview');
    if (!prefix || !preview) return;

    const curYear = new Date().getFullYear();
    const updatePreview = () => {
      const p = (prefix.value || 'ORD').trim().toUpperCase().slice(0, 6) || 'ORD';
      preview.textContent = `${p}-${curYear}-0001`;
    };

    prefix.addEventListener('input', updatePreview);
    updatePreview();
  }

  function _loadSavedSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem('haulo_orders_settings') || '{}');
      if (saved.orderPrefix !== undefined) {
        const el = document.getElementById('orderPrefix');
        if (el) el.value = saved.orderPrefix;
      }
      if (saved.defaultLeadDays !== undefined) {
        const el = document.getElementById('defaultLeadDays');
        if (el) el.value = saved.defaultLeadDays;
      }
      if (saved.advancePaymentPct !== undefined) {
        const el = document.getElementById('advancePaymentPct');
        if (el) el.value = saved.advancePaymentPct;
      }
      if (saved.overdueAlert !== undefined) {
        const el = document.getElementById('overdueAlert');
        if (el) el.checked = Boolean(saved.overdueAlert);
      }
      if (saved.blockOnQcFail !== undefined) {
        const el = document.getElementById('blockOnQcFail');
        if (el) el.checked = Boolean(saved.blockOnQcFail);
      }
      if (saved.autoAssignTailor !== undefined) {
        const el = document.getElementById('autoAssignTailor');
        if (el) el.checked = Boolean(saved.autoAssignTailor);
      }

      // Re-trigger preview update
      const prefix = document.getElementById('orderPrefix');
      if (prefix) {
        const curYear = new Date().getFullYear();
        const p = (prefix.value || 'ORD').trim().toUpperCase().slice(0, 6) || 'ORD';
        const preview = document.getElementById('orderCodePreview');
        if (preview) preview.textContent = `${p}-${curYear}-0001`;
      }
    } catch (_) {}
  }

  async function saveAll() {
    const btn = document.getElementById('btnSaveAll');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader" style="width:14px;height:14px;animation:spin 1s linear infinite;"></i> Saving...`;
    }

    try {
      const prefixEl = document.getElementById('orderPrefix');
      const leadEl   = document.getElementById('defaultLeadDays');
      const advEl    = document.getElementById('advancePaymentPct');
      const overdueEl= document.getElementById('overdueAlert');
      const qcEl     = document.getElementById('blockOnQcFail');
      const tailorEl = document.getElementById('autoAssignTailor');

      const config = {
        orderPrefix: prefixEl ? prefixEl.value.trim().toUpperCase() : 'ORD',
        defaultLeadDays: leadEl ? parseInt(leadEl.value, 10) || 14 : 14,
        advancePaymentPct: advEl ? parseInt(advEl.value, 10) || 50 : 50,
        overdueAlert: overdueEl ? overdueEl.checked : true,
        blockOnQcFail: qcEl ? qcEl.checked : true,
        autoAssignTailor: tailorEl ? tailorEl.checked : false,
      };

      localStorage.setItem('haulo_orders_settings', JSON.stringify(config));

      if (typeof CompanyBridge !== 'undefined' && CompanyBridge.save) {
        await CompanyBridge.save({
          orderPrefix: config.orderPrefix
        });
      }

      showToast('✓ Orders & Production settings saved', 'success');
    } catch (err) {
      showToast('Failed to save settings: ' + (err.message || 'error'), 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="save" style="width:14px;height:14px;"></i> Save Changes`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  }

  return {
    init,
    showToast,
    saveAll
  };
})();

// Alias for inline calls
window.Settings = OrdersSettings;
