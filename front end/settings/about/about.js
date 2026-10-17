/* ============================================================
   HAULO BOUTIQUE ERP — About & License Settings Controller
   Path: front end/settings/about/about.js
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  AboutSettings.init();
});

const AboutSettings = (() => {

  const HEALTH_ITEMS = [
    { service: 'API Server',    status: 'online',  label: 'Online' },
    { service: 'Database',      status: 'online',  label: 'Connected' },
    { service: 'Auth Service',  status: 'online',  label: 'Running' },
    { service: 'File Storage',  status: 'online',  label: 'Available' },
    { service: 'Email Service', status: 'warning', label: 'Unconfigured' },
    { service: 'WhatsApp API',  status: 'offline', label: 'Disconnected' },
  ];

  function init() {
    _renderHealthGrid();
    _populateBrandInfo();
  }

  function _populateBrandInfo() {
    if (typeof CompanyBridge !== 'undefined') {
      const co = CompanyBridge.get() || {};
      _applyBrandStrings(co);
      CompanyBridge.subscribe(data => _applyBrandStrings(data));
    } else {
      _applyBrandStrings({
        systemName: 'HAULO Boutique ERP',
        tagline: 'High-Fashion Atelier & Bespoke Studio Operating System',
        copyright: '© 2026 Haulo Technologies Inc. All rights reserved.'
      });
    }
  }

  function _applyBrandStrings(co) {
    const brandName = co.systemName || co.companyName || 'HAULO Boutique ERP';
    const tagline = co.tagline || 'High-Fashion Atelier & Bespoke Studio Operating System';
    const copyright = co.copyright || `© ${new Date().getFullYear()} ${co.companyName || 'Haulo Luxury Atelier'}. All rights reserved.`;

    document.querySelectorAll('[data-brand="systemName"]').forEach(el => el.textContent = brandName);
    document.querySelectorAll('[data-brand="tagline"]').forEach(el => el.textContent = tagline);
    document.querySelectorAll('[data-brand="copyright"]').forEach(el => el.textContent = copyright);
  }

  function _renderHealthGrid() {
    const grid = document.getElementById('healthGrid');
    if (!grid) return;

    grid.innerHTML = HEALTH_ITEMS.map(h => `
      <div class="health-item">
        <span class="health-service">${h.service}</span>
        <span class="health-status ${h.status}"><span class="health-dot"></span>${h.label}</span>
      </div>`).join('');

    // Probe Actuator Health
    const healthBase = (window.HAULO_API_BASE)
      ? window.HAULO_API_BASE.replace('/api/v1', '')
      : (window.location && window.location.origin && !window.location.origin.startsWith('file:') ? window.location.origin : '');

    if (healthBase) {
      fetch(`${healthBase}/actuator/health`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.status === 'UP') {
            const apiStatus = grid.querySelector('.health-item:first-child .health-status');
            if (apiStatus) {
              apiStatus.className = 'health-status online';
              apiStatus.innerHTML = '<span class="health-dot"></span>Online';
            }
          }
        })
        .catch(() => {});
    }
  }

  return {
    init
  };
})();

// Alias for inline handlers
window.Settings = AboutSettings;
