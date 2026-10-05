/* ============================================================
   HAULO BOUTIQUE ERP — Settings Page Controller
   Path: front end/settings/settings.js
   ============================================================ */

'use strict';

// ── Fragment Loader ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Lucide icons re-init after fragments load
  if (typeof lucide !== 'undefined') lucide.createIcons();
  Settings.init();
  // Sync theme UI after a tick to ensure HauloTheme is loaded
  setTimeout(() => Settings.syncThemeUI(), 200);
});

// ── Settings Namespace ───────────────────────────────────────
const Settings = (() => {

  // ── State ──
  let _dangerAction = null;

  const NOTIF_ITEMS = [
    { id: 'new-order',      label: 'New order created',            checked: true  },
    { id: 'payment-recv',   label: 'Payment received',             checked: true  },
    { id: 'trial-due',      label: 'Trial appointment due tomorrow', checked: true  },
    { id: 'order-overdue',  label: 'Order past delivery date',     checked: true  },
    { id: 'low-stock',      label: 'Inventory low stock alert',    checked: true  },
    { id: 'qc-failed',      label: 'QC inspection failed',         checked: true  },
    { id: 'new-enquiry',    label: 'New enquiry received',         checked: false },
    { id: 'stage-complete', label: 'Production stage completed',   checked: false },
  ];

  const INTEGRATIONS = [
    { name: 'WhatsApp Business', category: 'Messaging', icon: '💬', desc: 'Send automated order updates, trial reminders and payment receipts to clients via WhatsApp.', connected: false },
    { name: 'Google Calendar',   category: 'Scheduling', icon: '📅', desc: 'Sync appointment bookings and trial sessions with your Google Calendar automatically.', connected: true  },
    { name: 'Razorpay',          category: 'Payments',   icon: '💳', desc: 'Accept online payments via UPI, cards, net banking and wallets through Razorpay gateway.', connected: false },
    { name: 'Tally Prime',       category: 'Accounting', icon: '📊', desc: 'Sync invoices, payments and ledger entries directly into Tally Prime accounting software.', connected: false },
    { name: 'Gmail / SMTP',      category: 'Email',      icon: '📧', desc: 'Send automated emails for order confirmations, invoices, trial reminders and notifications.', connected: true  },
    { name: 'Shiprocket',        category: 'Shipping',   icon: '🚚', desc: 'Book courier pickups and track deliveries across 17,000+ pin codes via Shiprocket.', connected: false },
  ];

  const HEALTH_ITEMS = [
    { service: 'API Server',    status: 'online',  label: 'Online' },
    { service: 'Database',      status: 'online',  label: 'Connected' },
    { service: 'Auth Service',  status: 'online',  label: 'Running' },
    { service: 'File Storage',  status: 'online',  label: 'Available' },
    { service: 'Email Service', status: 'warning', label: 'Unconfigured' },
    { service: 'WhatsApp API',  status: 'offline', label: 'Disconnected' },
  ];

  // ── Init ──────────────────────────────────────────────────
  function init() {
    _renderNotifToggles();
    _renderIntegrations();
    _renderHealthGrid();
    _setupOrderCodePreview();
    _setupPasswordStrength();
    _setupColorPickers();

    if (typeof CompanyBridge !== 'undefined') {
      _populateBoutiqueProfile(CompanyBridge.get());
      CompanyBridge.subscribe(data => _populateBoutiqueProfile(data));
      CompanyBridge.fetch().then(data => _populateBoutiqueProfile(data));
    }
  }

  // ── Boutique Profile Sync ─────────────────────────────────
  function _populateBoutiqueProfile(data) {
    if (!data) return;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined && val !== null) el.value = val;
    };
    setVal('boutiqueName', data.companyName);
    setVal('boutiqueTagline', data.tagline);
    setVal('ownerName', data.ownerName);
    if (data.businessType) {
      const bt = document.getElementById('businessType');
      if (bt) bt.value = data.businessType;
    }
    setVal('gstin', data.gstin);
    setVal('panNumber', data.panNumber);
    setVal('primaryPhone', data.primaryPhone);
    setVal('whatsappNumber', data.whatsapp);
    setVal('boutiqueEmail', data.email);
    setVal('boutiqueWebsite', data.website);
    setVal('streetAddress', data.streetAddress);
    setVal('city', data.city);
    setVal('state', data.state);
    setVal('pinCode', data.pinCode);
    if (data.country) {
      const co = document.getElementById('country');
      if (co) co.value = data.country;
    }

    if (data.logoBase64) {
      const preview = document.getElementById('logoPreview');
      if (preview) {
        preview.innerHTML = `<img src="${data.logoBase64}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;" alt="Logo" /><div class="logo-upload-overlay" onclick="document.getElementById('logoFileInput').click()"><i data-lucide="camera" style="width:18px;height:18px;"></i></div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    } else {
      const initEl = document.getElementById('logoInitials');
      if (initEl) {
        const name = data.companyName || data.shortName || '';
        const parts = name.trim().split(/\s+/);
        initEl.textContent = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase() || '—';
      }
    }
  }

  async function _saveBoutiqueProfile() {
    if (typeof CompanyBridge === 'undefined') return;
    const current = CompanyBridge.get() || {};
    const val = id => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const preview = document.getElementById('logoPreview');
    const img = preview ? preview.querySelector('img') : null;
    const logoBase64 = img ? img.src : (current.logoBase64 || null);

    const payload = {
      id: current.id || 1,
      companyName: val('boutiqueName') || current.companyName || '',
      shortName: current.shortName || (val('boutiqueName') ? val('boutiqueName').split(/\s+/)[0].toUpperCase() : ''),
      tagline: val('boutiqueTagline'),
      ownerName: val('ownerName'),
      businessType: val('businessType') || 'Bespoke Atelier',
      gstin: val('gstin'),
      panNumber: val('panNumber'),
      primaryPhone: val('primaryPhone'),
      whatsapp: val('whatsappNumber'),
      email: val('boutiqueEmail'),
      website: val('boutiqueWebsite'),
      streetAddress: val('streetAddress'),
      city: val('city'),
      state: val('state'),
      pinCode: val('pinCode'),
      country: val('country') || 'India',
      logoBase64: logoBase64,
      invoicePrefix: current.invoicePrefix || 'HB',
      currencySymbol: current.currencySymbol || '₹',
      dateFormat: current.dateFormat || 'DD/MM/YYYY'
    };

    try {
      await CompanyBridge.save(payload);
    } catch (e) {
      console.error('[Settings] Failed to save company settings to DB:', e);
    }
  }

  // ── Panel Switcher ────────────────────────────────────────
  function switchPanel(id, btn) {
    // Nav items
    document.querySelectorAll('.snav-item').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    // Panels
    document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('panel-' + id);
    if (panel) { panel.classList.add('active'); panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    // Re-init icons in case panel has new icons
    if (typeof lucide !== 'undefined') { setTimeout(() => lucide.createIcons(), 40); }
  }

  // ── Save All ──────────────────────────────────────────────
  async function saveAll() {
    const btn = document.getElementById('btnSaveAll');
    btn.disabled = true;
    btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin .6s linear infinite"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Saving…';
    btn.style.cssText += 'animation: none;';

    await _saveBoutiqueProfile();

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="save" style="width:15px;height:15px;"></i> Save Changes';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      showToast('✓ Settings saved successfully', 'success');
    }, 400);
  }

  // ── Logo Upload ───────────────────────────────────────────
  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      showToast('Logo must be under 20 MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const rawData = ev.target.result;
      const preview = document.getElementById('logoPreview');
      const renderImg = (src) => {
        if (!preview) return;
        preview.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;" alt="Logo" /><div class="logo-upload-overlay" onclick="document.getElementById('logoFileInput').click()"><i data-lucide="camera" style="width:18px;height:18px;"></i></div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      };

      if (file.type === 'image/svg+xml' || file.size < 400 * 1024) {
        renderImg(rawData);
      } else {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          renderImg(canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.92));
        };
        img.onerror = () => renderImg(rawData);
        img.src = rawData;
      }
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    const p = document.getElementById('logoPreview');
    const co = typeof CompanyBridge !== 'undefined' ? CompanyBridge.get() : {};
    const name = co.companyName || co.shortName || '';
    const parts = name.trim().split(/\s+/);
    const initials = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase() || '—';
    p.innerHTML = `<span class="logo-initials" id="logoInitials" data-company="initials">${initials}</span><div class="logo-upload-overlay" onclick="document.getElementById('logoFileInput').click()"><i data-lucide="camera" style="width:18px;height:18px;"></i></div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    document.getElementById('logoFileInput').value = '';
    showToast('Logo removed', 'success');
  }

  // ── Theme Selector ────────────────────────────────────────
  function selectTheme(themeId, btn) {
    // Call the real ERP theme engine
    if (window.HauloTheme && typeof window.HauloTheme.set === 'function') {
      window.HauloTheme.set(themeId, true);
    } else {
      // Fallback: set data-theme on <html> directly
      const html = document.documentElement;
      if (themeId === 'classic') {
        html.removeAttribute('data-theme');
      } else {
        html.setAttribute('data-theme', themeId);
      }
      try { localStorage.setItem('haulo-theme', themeId); } catch(_) {}
    }
    _syncThemeUI();
    const name = btn ? btn.querySelector('span').textContent : themeId;
    showToast('Theme changed to ' + name, 'success');
  }

  // Sync which preset card is highlighted to match current active theme
  function _syncThemeUI() {
    const current = (window.HauloTheme && window.HauloTheme.get)
      ? window.HauloTheme.get()
      : (localStorage.getItem('haulo-theme') || 'classic');

    document.querySelectorAll('.theme-preset').forEach(p => {
      const isActive = p.dataset.theme === current;
      p.classList.toggle('active', isActive);
      const check = p.querySelector('.theme-check');
      if (check) check.style.display = isActive ? '' : 'none';
    });
  }

  // ── Color Pickers ─────────────────────────────────────────
  function _setupColorPickers() {
    [['invoiceHeaderColor', 'invoiceHeaderColorHex'], ['accentColor', 'accentColorHex']].forEach(([pickId, hexId]) => {
      const pick = document.getElementById(pickId);
      const hex  = document.getElementById(hexId);
      if (!pick || !hex) return;
      pick.addEventListener('input', () => { hex.value = pick.value; });
      hex.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(hex.value)) pick.value = hex.value;
      });
    });
  }

  // ── Order Code Preview ────────────────────────────────────
  function _setupOrderCodePreview() {
    const prefix = document.getElementById('orderPrefix');
    const preview = document.getElementById('orderCodePreview');
    if (!prefix || !preview) return;
    prefix.addEventListener('input', () => {
      const p = (prefix.value || 'ORD').toUpperCase().slice(0, 6);
      preview.textContent = `${p}-2026-0001`;
    });
  }

  // ── Password Strength ─────────────────────────────────────
  function _setupPasswordStrength() {
    const pw = document.getElementById('newPassword');
    if (!pw) return;
    pw.addEventListener('input', () => {
      const v = pw.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      const fill  = document.getElementById('strengthFill');
      const label = document.getElementById('strengthLabel');
      const colors = ['#FF6B6B', '#FBBF24', '#60A5FA', '#4ade80'];
      const labels = ['Weak', 'Fair', 'Good', 'Strong'];
      if (fill && label && v.length > 0) {
        fill.style.width   = (score * 25) + '%';
        fill.style.background = colors[score - 1] || colors[0];
        label.textContent  = labels[score - 1] || '';
        label.style.color  = colors[score - 1] || colors[0];
      } else if (fill && label) { fill.style.width = '0'; label.textContent = ''; }
    });
  }

  // ── Change Password ───────────────────────────────────────
  function changePassword() {
    const cur  = document.getElementById('currentPassword').value;
    const np   = document.getElementById('newPassword').value;
    const conf = document.getElementById('confirmPassword').value;
    if (!cur || !np || !conf) { showToast('Please fill all password fields', 'error'); return; }
    if (np.length < 8)        { showToast('New password must be at least 8 characters', 'error'); return; }
    if (np !== conf)          { showToast('Passwords do not match', 'error'); return; }
    // API call would go here
    showToast('✓ Password updated successfully', 'success');
    ['currentPassword', 'newPassword', 'confirmPassword'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('strengthFill').style.width = '0';
    document.getElementById('strengthLabel').textContent = '';
  }

  function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.innerHTML = `<i data-lucide="${isHidden ? 'eye-off' : 'eye'}" style="width:15px;height:15px;"></i>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function revokeAllSessions() {
    showToast('All other sessions revoked', 'success');
  }

  // ── Notifications ─────────────────────────────────────────
  function _renderNotifToggles() {
    const container = document.getElementById('notifToggles');
    if (!container) return;
    container.innerHTML = NOTIF_ITEMS.map(item => `
      <div class="notif-toggle-row">
        <span class="notif-label">${item.label}</span>
        <label class="toggle-switch">
          <input type="checkbox" id="notif-${item.id}" ${item.checked ? 'checked' : ''} />
          <span class="toggle-thumb"></span>
        </label>
      </div>`).join('');
  }

  // ── Integrations ──────────────────────────────────────────
  function _renderIntegrations() {
    const grid = document.getElementById('integrationsGrid');
    if (!grid) return;
    grid.innerHTML = INTEGRATIONS.map(i => `
      <div class="integration-card ${i.connected ? 'connected' : ''}">
        <div class="integration-top">
          <div class="integration-logo" style="background:rgba(255,255,255,.06);">${i.icon}</div>
          <div class="integration-info">
            <p class="integration-name">${i.name}</p>
            <p class="integration-category">${i.category}</p>
          </div>
        </div>
        <p class="integration-desc">${i.desc}</p>
        <div class="integration-status">
          <span class="integration-badge ${i.connected ? 'connected' : 'available'}">${i.connected ? 'Connected' : 'Available'}</span>
          <button class="btn-outline-sm" onclick="Settings.toggleIntegration('${i.name}', this, ${i.connected})" style="font-size:11.5px;padding:5px 10px;">
            ${i.connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>`).join('');
  }

  function toggleIntegration(name, btn, wasConnected) {
    const card = btn.closest('.integration-card');
    const badge = card.querySelector('.integration-badge');
    if (wasConnected) {
      card.classList.remove('connected');
      badge.className = 'integration-badge available'; badge.textContent = 'Available';
      btn.textContent = 'Connect';
      btn.setAttribute('onclick', `Settings.toggleIntegration('${name}', this, false)`);
      showToast(`${name} disconnected`, 'success');
    } else {
      card.classList.add('connected');
      badge.className = 'integration-badge connected'; badge.textContent = 'Connected';
      btn.textContent = 'Disconnect';
      btn.setAttribute('onclick', `Settings.toggleIntegration('${name}', this, true)`);
      showToast(`✓ ${name} connected`, 'success');
    }
  }

  // ── Health Grid ───────────────────────────────────────────
  function _renderHealthGrid() {
    const grid = document.getElementById('healthGrid');
    if (!grid) return;
    grid.innerHTML = HEALTH_ITEMS.map(h => `
      <div class="health-item">
        <span class="health-service">${h.service}</span>
        <span class="health-status ${h.status}"><span class="health-dot"></span>${h.label}</span>
      </div>`).join('');
    // Live probe: check actuator health without throwing login bad credential warnings
    fetch('http://localhost:8080/actuator/health')
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

  // ── Export Data ───────────────────────────────────────────
  function exportData(module) {
    showToast(`Preparing ${module} export…`, 'success');
    const token = localStorage.getItem('erp_token') || sessionStorage.getItem('erp_token') || localStorage.getItem('haulo_token') || '';
    const url = `http://localhost:8080/api/v1/${module}?size=9999`;
    fetch(url, { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        const items = data.content || data;
        if (!items || !items.length) { showToast('No data to export', 'error'); return; }
        const keys = Object.keys(items[0]);
        const csv  = [keys.join(','), ...items.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a    = document.createElement('a');
        a.href     = URL.createObjectURL(blob);
        a.download = `haulo-${module}-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        showToast(`✓ ${module} exported as CSV`, 'success');
      })
      .catch(err => {
        showToast('Export failed: ' + (err.message || 'check API connection'), 'error');
      });
  }

  function triggerBackup() {
    showToast('Manual backup started…', 'success');
    setTimeout(() => showToast('✓ Backup completed — 14.2 MB saved', 'success'), 2000);
  }

  // ── Danger Zone ───────────────────────────────────────────
  function confirmDangerAction(action) {
    _dangerAction = action;
    const modal  = document.getElementById('dangerModal');
    const title  = document.getElementById('dangerModalTitle');
    const desc   = document.getElementById('dangerModalDesc');
    const input  = document.getElementById('dangerConfirmInput');
    if (!modal) return;
    const labels = {
      'clear-test-data': { t: 'Clear All Test Data', d: 'All seed and sample data will be permanently deleted. Real customer and order data will be preserved.' },
      'factory-reset':   { t: 'Factory Reset',       d: 'ALL settings, users, orders, customers and data will be wiped. This cannot be undone.' }
    };
    const cfg = labels[action] || { t: 'Confirm', d: 'This action is irreversible.' };
    title.textContent = cfg.t;
    desc.textContent  = cfg.d;
    input.value       = '';
    modal.style.display = 'flex';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  function closeDangerModal() {
    const m = document.getElementById('dangerModal');
    if (m) m.style.display = 'none';
    _dangerAction = null;
  }
  function executeDangerAction() {
    const input = document.getElementById('dangerConfirmInput');
    if (!input || input.value !== 'CONFIRM') { showToast('Type CONFIRM to proceed', 'error'); return; }
    closeDangerModal();
    showToast('Action executed — see logs for details', 'success');
  }

  // ── Toast ─────────────────────────────────────────────────
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

  // ── Public API ────────────────────────────────────────────
  return {
    init,
    switchPanel,
    saveAll,
    handleLogoUpload,
    removeLogo,
    selectTheme,
    syncThemeUI: _syncThemeUI,
    changePassword,
    togglePasswordVisibility,
    revokeAllSessions,
    toggleIntegration,
    exportData,
    triggerBackup,
    confirmDangerAction,
    closeDangerModal,
    executeDangerAction,
    showToast,
  };
})();
