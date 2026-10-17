/* ============================================================
   HAULO BOUTIQUE ERP — Notifications Settings Controller
   Path: front end/settings/notifications/notifications.js
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  NotificationsSettings.init();
});

const NotificationsSettings = (() => {

  let _toastTimer = null;

  const DEFAULT_NOTIF_ITEMS = [
    { id: 'new-order',      label: 'New order created',               checked: true  },
    { id: 'payment-recv',   label: 'Payment received',                checked: true  },
    { id: 'trial-due',      label: 'Trial appointment due tomorrow',  checked: true  },
    { id: 'order-overdue',  label: 'Order past delivery date',        checked: true  },
    { id: 'low-stock',      label: 'Inventory low stock alert',       checked: true  },
    { id: 'qc-failed',      label: 'QC inspection failed',            checked: true  },
    { id: 'new-enquiry',    label: 'New enquiry received',            checked: false },
    { id: 'stage-complete', label: 'Production stage completed',      checked: false },
  ];

  function showToast(msg, type = 'success') {
    const t = document.getElementById('settingsToast');
    if (!t) return;
    clearTimeout(_toastTimer);
    t.className = `settings-toast ${type}`;
    t.textContent = msg;
    t.classList.add('show');
    _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function _getSavedNotifs() {
    try {
      const saved = localStorage.getItem('haulo_notif_prefs');
      if (saved) {
        const parsed = JSON.parse(saved);
        return DEFAULT_NOTIF_ITEMS.map(it => ({
          ...it,
          checked: parsed[it.id] !== undefined ? Boolean(parsed[it.id]) : it.checked
        }));
      }
    } catch (_) {}
    return DEFAULT_NOTIF_ITEMS;
  }

  function init() {
    _renderNotifToggles();
    _loadSavedEmailSettings();
  }

  function _renderNotifToggles() {
    const container = document.getElementById('notifToggles');
    if (!container) return;
    const items = _getSavedNotifs();
    container.innerHTML = items.map(item => `
      <div class="notif-toggle-row">
        <span class="notif-label">${item.label}</span>
        <label class="toggle-switch">
          <input type="checkbox" id="notif-${item.id}" ${item.checked ? 'checked' : ''} onchange="NotificationsSettings.saveNotifPref('${item.id}', this.checked)" />
          <span class="toggle-thumb"></span>
        </label>
      </div>`).join('');
  }

  function saveNotifPref(id, checked) {
    try {
      const saved = JSON.parse(localStorage.getItem('haulo_notif_prefs') || '{}');
      saved[id] = Boolean(checked);
      localStorage.setItem('haulo_notif_prefs', JSON.stringify(saved));
    } catch (_) {}
  }

  function _loadSavedEmailSettings() {
    try {
      // Check CompanyBridge first for boutique email
      if (typeof CompanyBridge !== 'undefined') {
        const co = CompanyBridge.get() || {};
        if (co.email) {
          const emailInput = document.getElementById('notifEmail');
          if (emailInput && !emailInput.value) emailInput.value = co.email;
        }
      }

      const emailSaved = JSON.parse(localStorage.getItem('haulo_email_notifs') || '{}');
      if (emailSaved.notifEmail) {
        const emailInput = document.getElementById('notifEmail');
        if (emailInput) emailInput.value = emailSaved.notifEmail;
      }
      if (emailSaved.dailySummaryEmail !== undefined) {
        const el = document.getElementById('dailySummaryEmail');
        if (el) el.checked = Boolean(emailSaved.dailySummaryEmail);
      }
      if (emailSaved.orderConfirmEmail !== undefined) {
        const el = document.getElementById('orderConfirmEmail');
        if (el) el.checked = Boolean(emailSaved.orderConfirmEmail);
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
      const emailVal = document.getElementById('notifEmail')?.value.trim() || '';
      const dailySummary = document.getElementById('dailySummaryEmail')?.checked ?? true;
      const orderConfirm = document.getElementById('orderConfirmEmail')?.checked ?? true;

      const emailConfig = {
        notifEmail: emailVal,
        dailySummaryEmail: dailySummary,
        orderConfirmEmail: orderConfirm
      };
      localStorage.setItem('haulo_email_notifs', JSON.stringify(emailConfig));

      // Collect all in-app toggles
      const notifsObj = {};
      DEFAULT_NOTIF_ITEMS.forEach(it => {
        const el = document.getElementById(`notif-${it.id}`);
        if (el) notifsObj[it.id] = el.checked;
      });
      localStorage.setItem('haulo_notif_prefs', JSON.stringify(notifsObj));

      showToast('✓ Notification preferences saved', 'success');
    } catch (err) {
      showToast('Failed to save notification preferences: ' + (err.message || 'error'), 'error');
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
    saveNotifPref,
    saveAll
  };
})();

// Alias for inline handlers
window.Settings = NotificationsSettings;
