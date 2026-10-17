/* ============================================================
   HAULO BOUTIQUE ERP — Integrations Settings Controller
   Path: front end/settings/integrations/integrations.js
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  IntegrationsSettings.init();
});

const IntegrationsSettings = (() => {

  let _toastTimer = null;

  const DEFAULT_INTEGRATIONS = [
    { name: 'WhatsApp Business', category: 'Messaging',  icon: '💬', desc: 'Send automated order updates, trial reminders and payment receipts to clients via WhatsApp.', connected: false },
    { name: 'Google Calendar',   category: 'Scheduling', icon: '📅', desc: 'Sync appointment bookings and trial sessions with your Google Calendar automatically.',       connected: false },
    { name: 'Razorpay',          category: 'Payments',   icon: '💳', desc: 'Accept online payments via UPI, cards, net banking and wallets through Razorpay gateway.',      connected: false },
    { name: 'Tally Prime',       category: 'Accounting', icon: '📊', desc: 'Sync invoices, payments and ledger entries directly into Tally Prime accounting software.',   connected: false },
    { name: 'Gmail / SMTP',      category: 'Email',      icon: '📧', desc: 'Send automated emails for order confirmations, invoices, trial reminders and notifications.',     connected: false },
    { name: 'Shiprocket',        category: 'Shipping',   icon: '🚚', desc: 'Book courier pickups and track deliveries across 17,000+ pin codes via Shiprocket.',             connected: false },
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

  function _getSavedIntegrations() {
    try {
      const saved = localStorage.getItem('haulo_integrations_status');
      if (saved) {
        const parsed = JSON.parse(saved);
        return DEFAULT_INTEGRATIONS.map(i => ({
          ...i,
          connected: parsed[i.name] !== undefined ? Boolean(parsed[i.name]) : false
        }));
      }
    } catch (_) {}
    return DEFAULT_INTEGRATIONS;
  }

  function init() {
    _renderIntegrations();
  }

  function _renderIntegrations() {
    const grid = document.getElementById('integrationsGrid');
    if (!grid) return;
    const integrations = _getSavedIntegrations();
    grid.innerHTML = integrations.map(i => `
      <div class="integration-card ${i.connected ? 'connected' : ''}" data-name="${i.name}">
        <div class="integration-top">
          <div class="integration-logo">${i.icon}</div>
          <div class="integration-info">
            <h3 class="integration-name">${i.name}</h3>
            <p class="integration-category">${i.category}</p>
          </div>
        </div>
        <p class="integration-desc">${i.desc}</p>
        <div class="integration-status">
          <span class="integration-badge ${i.connected ? 'connected' : 'available'}">${i.connected ? 'Connected' : 'Available'}</span>
          <button class="btn-outline-sm" onclick="IntegrationsSettings.toggleIntegration('${i.name}', this, ${i.connected})" type="button" style="font-size:11.5px;padding:5px 12px;">
            ${i.connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>`).join('');
  }

  function toggleIntegration(name, btn, wasConnected) {
    const card = btn.closest('.integration-card');
    const badge = card.querySelector('.integration-badge');
    const newStatus = !wasConnected;

    if (wasConnected) {
      card.classList.remove('connected');
      badge.className = 'integration-badge available';
      badge.textContent = 'Available';
      btn.textContent = 'Connect';
      btn.setAttribute('onclick', `IntegrationsSettings.toggleIntegration('${name}', this, false)`);
      showToast(`${name} disconnected`, 'success');
    } else {
      card.classList.add('connected');
      badge.className = 'integration-badge connected';
      badge.textContent = 'Connected';
      btn.textContent = 'Disconnect';
      btn.setAttribute('onclick', `IntegrationsSettings.toggleIntegration('${name}', this, true)`);
      showToast(`✓ ${name} connected`, 'success');
    }

    try {
      const saved = JSON.parse(localStorage.getItem('haulo_integrations_status') || '{}');
      saved[name] = newStatus;
      localStorage.setItem('haulo_integrations_status', JSON.stringify(saved));
    } catch (_) {}
  }

  return {
    init,
    showToast,
    toggleIntegration
  };
})();

// Alias for inline onclick handlers
window.Settings = IntegrationsSettings;
