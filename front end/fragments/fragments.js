/* ============================================================
   FASHION ERP â€” Fragments Loader
   Path: front end/fragments/fragments.js

   Usage: Include this script in any page BEFORE page-specific JS.
   It will:
     1. Fetch sidebar.html and footer.html from the fragments folder
     2. Inject them into #sidebarSlot and #footerSlot
     3. Mark the active nav item based on data-module
     4. Restore sidebar collapsed state from localStorage
     5. Expose toggleSidebar() and navNavigate() globally
   ============================================================ */

'use strict';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CONFIGURATION â€” adjust relative path per page depth
// Each page sets window.FRAGMENT_BASE before loading this script.
// Default: one level up from dashboard/ -> fragments/
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function () {
  const BASE = window.FRAGMENT_BASE || '../fragments/';

  // Auto-load theme switch controller if not already present
  if (!window.HauloTheme && !document.querySelector('script[src*="theme-switch.js"]')) {
    const ts = document.createElement('script');
    ts.src = BASE + 'theme/theme-switch.js';
    document.head.appendChild(ts);
  }

  // Auto-load dynamic notifications controller and styles if not already present
  if (!document.querySelector('link[href*="notifications.css"]')) {
    const nc = document.createElement('link');
    nc.rel = 'stylesheet';
    nc.href = BASE + 'notifications/notifications.css';
    document.head.appendChild(nc);
  }
  if (!window.HauloNotifications && !document.querySelector('script[src*="notifications.js"]')) {
    const ns = document.createElement('script');
    ns.src = BASE + 'notifications/notifications.js';
    document.head.appendChild(ns);
  }

  // Auto-load brand identity controller if not already present
  if (!window.BrandIdentity && !document.querySelector('script[src*="brand-identity.js"]')) {
    const bis = document.createElement('script');
    bis.src = BASE + 'brand-identity/brand-identity.js';
    bis.onload = () => {
      if (window.BrandIdentity && typeof window.BrandIdentity.applyToDOM === 'function') {
        window.BrandIdentity.applyToDOM();
      }
    };
    document.head.appendChild(bis);
  }

  // Auto-load company bridge controller if not already present
  if (!window.CompanyBridge && !document.querySelector('script[src*="company-bridge.js"]')) {
    const cs = document.createElement('script');
    cs.src = BASE + 'company-bridge.js';
    document.head.appendChild(cs);
  }

  // Auto-load system bridge controller if not already present
  if (!window.HauloSystem && !document.querySelector('script[src*="system-bridge.js"]')) {
    const sysScript = document.createElement('script');
    sysScript.src = BASE + 'system-bridge.js';
    document.head.appendChild(sysScript);
  }

  /* â”€â”€ Load a fragment and inject into a slot â”€â”€
     Priority: 1) window.FRAGMENT_HTML inline bundle (works on file://)
               2) fetch from server (works when served via http)
     Skips if slot already has content. */
  async function loadFragment(slot, file) {
    const el = document.getElementById(slot);
    if (!el) return;
    // If already populated skip
    if (el.innerHTML.trim() !== '') return;

    // 1. Try inline bundle (file:// compatible â€” no network needed)
    const key = file.replace('.html', ''); // 'sidebar.html' -> 'sidebar'
    if (window.FRAGMENT_HTML && window.FRAGMENT_HTML[key]) {
      el.innerHTML = window.FRAGMENT_HTML[key];
      return;
    }

    // 2. Fallback: fetch from server (http/https)
    try {
      const res = await fetch(BASE + file);
      if (!res.ok) throw new Error(res.status);
      el.innerHTML = await res.text();
    } catch (err) {
      console.warn('[Fragments] Could not load', file, err.message);
    }
  }

  /* ── Canonicalize Module Key ── */
  function canonicalize(m) {
    const s = (m || '').toLowerCase().trim();
    if (s === 'company') return 'settings';
    if (s === 'production-floor' || s === 'production' || s === 'production-room') return 'production-room';
    if (s === 'design-studio' || s === 'designs') return 'designs';
    if (s === 'collections') return 'collections';
    if (s === 'garment' || s === 'garments') return 'garments';
    if (s === 'workforce' || s === 'employees') return 'employees';
    if (s === 'inventory' || s === 'stock') return 'stock';
    if (s === 'packages' || s === 'dispatch' || s === 'delivery') return 'delivery';
    if (s === 'finance' || s === 'payments') return 'payments';
    if (s === 'customer' || s === 'customers') return 'customers';
    if (s === 'order' || s === 'orders') return 'orders';
    if (s === 'measurement' || s === 'measurements' || s === 'measurement360' || s === 'measurement-overview') return 'measurements';
    if (s === 'trial' || s === 'trials' || s === 'alterations' || s === 'trials-alterations') return 'trials-alterations';
    if (s === 'qc' || s === 'quality' || s === 'quality-control') return 'quality-control';
    if (s === 'procurement' || s === 'purchases' || s === 'purchase') return 'purchases';
    if (s === 'users-roles' || s === 'users' || s === 'roles') return 'users-roles';
    return s;
  }

  /* ── Module Access Permissions Enforcement ── */
  async function applyModuleAccessPolicy() {
    const isLogin = window.location.pathname.includes('/login/');
    const isSetup = window.location.pathname.includes('/setup/');
    if (isLogin || isSetup) return;

    // ── Company Setup Guard ──────────────────────────────────────────────────
    // If the company has not yet been configured and the user is authenticated,
    // redirect them to the setup wizard before anything else loads.
    try {
      const setupRes = await fetch('http://localhost:8080/api/v1/company/status');
      if (setupRes.ok) {
        const statusData = await setupRes.json();
        if (!statusData.configured) {
          // Only redirect authenticated users — guests should see the login page
          const tokenKeys = ['erp_token', 'haulo_token', 'fashion_erp_token'];
          const hasToken = tokenKeys.some(k => !!(sessionStorage.getItem(k) || localStorage.getItem(k)));
          if (hasToken) {
            const prefix = window.FRAGMENT_BASE ? window.FRAGMENT_BASE.replace('fragments/', '') : '../';
            window.location.replace(`${prefix}company/setup/setup.html`);
            return;
          }
        }
      }
    } catch (_) {
      // Server unreachable — don't block navigation
    }

    let allowedModules = null;
    try {
      const cached = sessionStorage.getItem('erp_allowed_modules');
      if (cached) {
        allowedModules = JSON.parse(cached);
      } else if (window.api && window.api.auth && typeof window.api.auth.me === 'function') {
        const me = await window.api.auth.me();
        if (me) {
          allowedModules = me.allowedModules || null;
          if (allowedModules) {
            sessionStorage.setItem('erp_allowed_modules', JSON.stringify(allowedModules));
          }
          sessionStorage.setItem('erp_user', JSON.stringify(me));
        }
      }
    } catch (err) {
      console.warn('[Fragments] Unable to fetch user module policy:', err);
    }

    // If allowedModules is null, user is unrestricted (e.g. ADMIN)
    if (!allowedModules || !Array.isArray(allowedModules)) {
      return;
    }

    const allowedSet = new Set(allowedModules.map(m => m.toLowerCase().trim()));

    // Hide sidebar links not in allowedModules
    document.querySelectorAll('#appSidebar .nav-item[data-module]').forEach(item => {
      const rawMod = item.getAttribute('data-module') || '';
      const mod = canonicalize(rawMod);
      if (mod && mod !== 'dashboard' && !allowedSet.has(mod)) {
        item.classList.add('nav-item-hidden');
      }
    });

    // Hide any nav-section whose items are all hidden
    document.querySelectorAll('#appSidebar .nav-section').forEach(sec => {
      const allItems = sec.querySelectorAll('.nav-item');
      if (allItems.length > 0) {
        const allHidden = Array.from(allItems).every(i => i.classList.contains('nav-item-hidden'));
        if (allHidden) {
          sec.classList.add('nav-section-hidden');
        }
      }
    });

    // Client-side page navigation gate
    const currentModule = (document.body && (document.body.dataset.module || document.body.getAttribute('data-module'))) || '';
    if (currentModule) {
      const canonical = canonicalize(currentModule);
      if (canonical && canonical !== 'dashboard' && canonical !== 'profile' && !allowedSet.has(canonical)) {
        console.warn(`[Fragments] Access to module '${canonical}' is not permitted for this account.`);
        const prefix = window.FRAGMENT_BASE ? window.FRAGMENT_BASE.replace('fragments/', '') : '../';
        window.location.replace(`${prefix}dashboard/dashboard.html?denied=${encodeURIComponent(canonical)}`);
      }
    }
  }

  /* ── Mark the active nav item ── */
  function markActiveNav() {
    let currentModule = (document.body && (document.body.dataset.module || document.body.getAttribute('data-module'))) || '';
    if (!currentModule) {
      const path = window.location.pathname.toLowerCase().replace(/\\/g, '/');
      if (path.includes('/dashboard')) currentModule = 'dashboard';
      else if (path.includes('/enquiries')) currentModule = 'enquiries';
      else if (path.includes('/appointments') || path.includes('/calendar')) currentModule = 'appointments';
      else if (path.includes('/customer')) currentModule = 'customers';
      else if (path.includes('/orders/') || path.includes('order-over') || path.includes('new-order') || path.includes('view-order')) currentModule = 'orders';
      else if (path.includes('/payments') || path.includes('/finance')) currentModule = 'payments';
      else if (path.includes('/garments') || path.includes('/garment')) currentModule = 'garments';
      else if (path.includes('/designstudio') || path.includes('/design-studio')) currentModule = 'designs';
      else if (path.includes('/measurements') || path.includes('/measurement360') || path.includes('/measurement-overview')) currentModule = 'measurements';
      else if (path.includes('/fabrics-materials') || path.includes('/fabrics')) currentModule = 'fabrics';
      else if (path.includes('/collections')) currentModule = 'collections';
      else if (path.includes('/production')) currentModule = 'production-room';
      else if (path.includes('/trials-alterations') || path.includes('/trial')) currentModule = 'trials-alterations';
      else if (path.includes('/quality-control') || path.includes('/qc')) currentModule = 'quality-control';
      else if (path.includes('/inventory') || path.includes('/stock')) currentModule = 'stock';
      else if (path.includes('/purchases')) currentModule = 'purchases';
      else if (path.includes('/delivery') || path.includes('/dispatch')) currentModule = 'delivery';
      else if (path.includes('/workforcemanagement') || path.includes('/workforce') || path.includes('/employee')) currentModule = 'employees';
      else if (path.includes('/branches')) currentModule = 'branches';
      else if (path.includes('/profile')) currentModule = 'profile';
      else if (path.includes('/users-roles')) currentModule = 'users-roles';
      else if (path.includes('/company')) currentModule = 'settings';
      else if (path.includes('/settings')) currentModule = 'settings';
      else if (path.includes('order')) currentModule = 'orders';
      else currentModule = 'dashboard';
    }

    const activeMod = canonicalize(currentModule);
    let matchedItem = null;
    document.querySelectorAll('.nav-item').forEach(item => {
      const itemMod = canonicalize(item.dataset.module || item.getAttribute('data-module') || '');
      const itemId = (item.id || '').toLowerCase().trim();
      const tooltip = (item.getAttribute('data-tooltip') || '').toLowerCase().trim();
      const isMatch = (
        (itemMod && itemMod === activeMod) ||
        (itemId && itemId === `nav-${activeMod}`) ||
        (activeMod === 'collections' && (itemId === 'nav-collections' || itemMod === 'collections' || tooltip.includes('collection'))) ||
        (activeMod === 'garments' && (itemId === 'nav-garments' || itemMod === 'garments' || tooltip.includes('garment'))) ||
        (activeMod === 'production-room' && (itemId === 'nav-production-room' || itemMod === 'production-room' || tooltip.includes('production'))) ||
        (activeMod === 'designs' && (itemId === 'nav-designs' || itemMod === 'designs' || tooltip.includes('design'))) ||
        (activeMod === 'measurements' && (itemId === 'nav-measurements' || itemMod === 'measurements' || tooltip.includes('measurement'))) ||
        (activeMod === 'orders' && (itemId === 'nav-orders' || itemMod === 'orders' || tooltip === 'orders')) ||
        (activeMod === 'customers' && (itemId === 'nav-customers' || itemMod === 'customers' || tooltip === 'customers')) ||
        (activeMod === 'dashboard' && (itemId === 'nav-dashboard' || itemMod === 'dashboard' || tooltip === 'dashboard')) ||
        (activeMod === 'appointments' && (itemId === 'nav-appointments' || itemMod === 'appointments' || tooltip.includes('appointment'))) ||
        (activeMod === 'enquiries' && (itemId === 'nav-enquiries' || itemMod === 'enquiries' || tooltip.includes('enquir'))) ||
        (activeMod === 'payments' && (itemId === 'nav-payments' || itemMod === 'payments' || tooltip.includes('payment'))) ||
        (activeMod === 'fabrics' && (itemId === 'nav-fabrics' || itemMod === 'fabrics' || tooltip.includes('fabric'))) ||
        (activeMod === 'trials-alterations' && (itemId === 'nav-trials-alterations' || itemMod === 'trials-alterations' || tooltip.includes('trial'))) ||
        (activeMod === 'quality-control' && (itemId === 'nav-quality-control' || itemMod === 'quality-control' || tooltip.includes('quality'))) ||
        (activeMod === 'stock' && (itemId === 'nav-stock' || itemMod === 'stock' || tooltip.includes('stock') || tooltip.includes('inventory'))) ||
        (activeMod === 'purchases' && (itemId === 'nav-purchases' || itemMod === 'purchases' || tooltip.includes('purchase'))) ||
        (activeMod === 'delivery' && (itemId === 'nav-packages' || itemId === 'nav-delivery' || itemMod === 'delivery' || tooltip.includes('delivery'))) ||
        (activeMod === 'employees' && (itemId === 'nav-employees' || itemId === 'nav-workforce' || itemMod === 'employees' || tooltip.includes('employee'))) ||
        (activeMod === 'branches' && (itemId === 'nav-branches' || itemMod === 'branches' || tooltip.includes('branch'))) ||
        (activeMod === 'users-roles' && (itemId === 'nav-users-roles' || itemMod === 'users-roles' || tooltip.includes('users') || tooltip.includes('roles'))) ||
        (activeMod === 'settings' && (itemId === 'nav-settings' || itemMod === 'settings' || tooltip.includes('setting')))
      );
      item.classList.toggle('active', Boolean(isMatch));
      if (isMatch) matchedItem = item;
    });

    if (matchedItem) {
      setTimeout(() => {
        try {
          matchedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } catch (_) {}
      }, 100);
    }
  }

  /* ── Tag uncompleted nav items with red glow ── */
  function markUncompletedNav() {
    const uncompletedList = ['job-cards', 'suppliers', 'reports', 'expenses', 'profitability', 'whatsapp', 'campaigns'];
    document.querySelectorAll('.nav-item').forEach(item => {
      const href = item.getAttribute('href');
      const mod = item.dataset.module;
      const isUncompleted = href === '#' || href === '' || item.classList.contains('uncompleted') || uncompletedList.includes(mod);
      if (isUncompleted && !item.classList.contains('active')) {
        item.classList.add('uncompleted');
        const tt = item.getAttribute('data-tooltip');
        if (tt && !tt.includes('In Progress')) {
          item.setAttribute('data-tooltip', `${tt} (In Progress)`);
        }
      }
    });
  }

  /* â”€â”€ Restore sidebar collapsed state â”€â”€ */
  function restoreSidebarState() {
    try {
      const sidebar = document.getElementById('appSidebar');
      const btn = document.getElementById('sidebarToggleBtn');
      const isCol = localStorage.getItem('sidebarCollapsed') === '1' || localStorage.getItem('fashion_sidebar_collapsed') === 'true';
      if (isCol) {
        sidebar && sidebar.classList.add('collapsed');
        if (btn) { btn.title = 'Expand sidebar'; btn.setAttribute('aria-label', 'Expand sidebar'); }
      }
    } catch (_) { }
  }

  // ── Helper to read a valid JWT token ──
  function _fragmentsGetToken() {
    const keys = ['erp_token', 'haulo_token', 'fashion_erp_token'];
    for (const k of keys) {
      const t = sessionStorage.getItem(k) || localStorage.getItem(k);
      if (t) {
        try {
          const p = JSON.parse(atob(t.split('.')[1]));
          if (!p.exp || p.exp * 1000 > Date.now()) return t;
        } catch (_) {}
      }
    }
    return null;
  }

  // ── Fetch company settings from backend API and hydrate sidebar & navbar ──
  async function _fetchCompanyAndHydrate() {
    try {
      const token = _fragmentsGetToken();
      if (!token) return;
      const res = await fetch('http://localhost:8080/api/v1/company', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const co = await res.json();
      if (!co) return;

      // Update sidebar brand text
      const brandNameEl = document.querySelector('.brand-name');
      const brandSubEl  = document.querySelector('.brand-sub');
      if (brandNameEl && co.shortName)   brandNameEl.textContent = co.shortName;
      if (brandSubEl  && co.companyName) brandSubEl.textContent  = co.companyName;

      // Update navbar branch selector prefix
      const selText = document.querySelector('#branchSelText, .branch-sel-text');
      if (selText && co.companyName) {
        const savedBranch = localStorage.getItem('haulo_active_branch') || 'Main Branch';
        selText.textContent = `${co.companyName} — ${savedBranch}`;
      }

      if (window.CompanyBridge && typeof window.CompanyBridge.applyToDOM === 'function') {
        window.CompanyBridge.applyToDOM();
      }
      if (window.BrandIdentity && typeof window.BrandIdentity.applyToDOM === 'function') {
        window.BrandIdentity.applyToDOM();
      }
    } catch (_) {
      // silently ignore
    }
  }

  // Listen for company updates in case company details are saved on this page
  document.addEventListener('haulo:company-updated', (e) => {
    const co = e.detail;
    if (!co) return;
    const brandNameEl = document.querySelector('.brand-name');
    const brandSubEl  = document.querySelector('.brand-sub');
    if (brandNameEl && co.shortName)   brandNameEl.textContent = co.shortName;
    if (brandSubEl  && co.companyName) brandSubEl.textContent  = co.companyName;
    const selText = document.querySelector('#branchSelText, .branch-sel-text');
    if (selText && co.companyName) {
      const savedBranch = localStorage.getItem('haulo_active_branch') || 'Main Branch';
      selText.textContent = `${co.companyName} — ${savedBranch}`;
    }
    if (window.CompanyBridge && typeof window.CompanyBridge.applyToDOM === 'function') {
      window.CompanyBridge.applyToDOM();
    }
    if (window.BrandIdentity && typeof window.BrandIdentity.applyToDOM === 'function') {
      window.BrandIdentity.applyToDOM();
    }
  });

  // Listen for branch changes across components
  document.addEventListener('haulo:branch-changed', (e) => {
    const branch = e.detail;
    if (!branch || !branch.name) return;
    const selText = document.querySelector('#branchSelText, .branch-sel-text');
    if (selText) {
      if (window.CompanyBridge && typeof window.CompanyBridge.formatBranch === 'function') {
        selText.textContent = window.CompanyBridge.formatBranch(branch.name);
      } else {
        const brandSub = document.querySelector('.brand-sub')?.textContent || 'Haulo Designs';
        selText.textContent = `${brandSub} — ${branch.name}`;
      }
    }
    if (window.CompanyBridge && typeof window.CompanyBridge.applyToDOM === 'function') {
      window.CompanyBridge.applyToDOM();
    }
  });

  let _footerClockTimer = null;
  function _updateFooterClock() {
    const el = document.getElementById('lastUpdated');
    if (!el) return;
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const m = months[now.getMonth()];
    const y = now.getFullYear();
    let h = now.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const min = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `${d} ${m} ${y}, ${String(h).padStart(2, '0')}:${min} ${ampm}`;
  }

  function _initFooterTimestamp() {
    _updateFooterClock();
    if (!_footerClockTimer) {
      _footerClockTimer = setInterval(_updateFooterClock, 1000);
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
          _updateFooterClock();
        }
      });
    }
  }

  /* ── Network Speed & Telemetry Monitor (Real Benchmark Engine) ── */
  function _initNetworkSpeedMonitor() {
    const badge = document.getElementById('wifiSpeedBadge');
    const speedVal = document.getElementById('wifiSpeedVal');
    if (!badge || !speedVal) return;

    let probeTimer = null;
    let isProbing = false;

    // High-performance public CDN test endpoints with open CORS (Access-Control-Allow-Origin: *)
    const TEST_ENDPOINTS = [
      { url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', name: 'Cloudflare Edge' },
      { url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css', name: 'jsDelivr Global' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/330px-Image_created_with_a_mobile_phone.png', name: 'Wikimedia CDN' }
    ];

    function formatSpeed(mbps) {
      if (typeof mbps !== 'number' || isNaN(mbps) || mbps <= 0) return 'Offline';
      if (mbps >= 100) return `${Math.round(mbps)} Mbps`;
      if (mbps >= 10) return `${mbps.toFixed(1)} Mbps`;
      if (mbps >= 1) return `${mbps.toFixed(1)} Mbps`;
      return `${Math.round(mbps * 1000)} Kbps`;
    }

    function applyTierStyle(mbps, latencyMs, details) {
      badge.classList.remove('speed-offline', 'speed-slow', 'speed-good', 'speed-excellent');
      if (typeof mbps !== 'number' || isNaN(mbps) || mbps <= 0) {
        badge.classList.add('speed-offline');
        badge.title = details || 'Network: Offline (No internet connection)';
        speedVal.textContent = 'Offline';
        return;
      }

      const formatted = formatSpeed(mbps);
      speedVal.textContent = formatted;

      if (mbps >= 25 || (latencyMs && latencyMs < 50)) {
        badge.classList.add('speed-excellent');
      } else if (mbps >= 10 || (latencyMs && latencyMs < 120)) {
        badge.classList.add('speed-good');
      } else {
        badge.classList.add('speed-slow');
      }

      badge.title = details || `Internet Speed: ${formatted} | Latency: ${latencyMs ? latencyMs + 'ms' : 'Normal'} | Click to re-test`;
    }

    async function measureRealInternetSpeed() {
      if (isProbing) return;
      isProbing = true;

      // 1. Check if browser detects offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        applyTierStyle(0, null, 'Network: Offline (No internet connection)');
        isProbing = false;
        return;
      }

      // 2. Perform live download speed test across CDN endpoints
      let measuredResult = null;

      for (const ep of TEST_ENDPOINTS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        try {
          const cacheBuster = `_cb=${Date.now()}_${Math.floor(Math.random() * 100000)}`;
          const separator = ep.url.includes('?') ? '&' : '?';
          const targetUrl = `${ep.url}${separator}${cacheBuster}`;

          const tStart = performance.now();
          const response = await fetch(targetUrl, {
            method: 'GET',
            cache: 'no-store',
            mode: 'cors',
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!response.ok) continue;

          const blob = await response.blob();
          const tEnd = performance.now();

          const durationSec = (tEnd - tStart) / 1000;
          if (durationSec <= 0.005) continue; // Ignore cached/abnormal anomaly

          const bytes = blob.size;
          if (bytes < 1000) continue;

          // Mathematical formula: (Bytes * 8 bits) / seconds / 1,000,000 = true Mbps
          const bits = bytes * 8;
          const trueMbps = (bits / durationSec) / 1000000;
          const latencyMs = Math.round(tEnd - tStart);

          measuredResult = {
            mbps: trueMbps,
            latencyMs: latencyMs,
            bytes: bytes,
            durationMs: Math.round(tEnd - tStart),
            provider: ep.name
          };
          break; // Test successful
        } catch (_) {
          clearTimeout(timeoutId);
          continue;
        }
      }

      if (measuredResult) {
        const kbSize = Math.round(measuredResult.bytes / 1024);
        const tooltip = `Internet Speed: ${formatSpeed(measuredResult.mbps)} | Transferred: ${kbSize} KB in ${measuredResult.durationMs}ms | Latency: ${measuredResult.latencyMs}ms | Verified via ${measuredResult.provider} | Click to re-test`;
        applyTierStyle(measuredResult.mbps, measuredResult.latencyMs, tooltip);
        isProbing = false;
        return;
      }

      // 3. Fallback: Browser Network Information API (hardware link bandwidth)
      const conn = (typeof navigator !== 'undefined') && 
        (navigator.connection || navigator.mozConnection || navigator.webkitConnection);

      if (conn && typeof conn.downlink === 'number' && conn.downlink > 0) {
        const rtt = typeof conn.rtt === 'number' ? conn.rtt : null;
        const tooltip = `Internet Speed: ${formatSpeed(conn.downlink)} | Type: ${conn.effectiveType || 'Network'} | RTT: ${rtt ? rtt + 'ms' : 'Normal'} | Via Browser Link Telemetry | Click to re-test`;
        applyTierStyle(conn.downlink, rtt, tooltip);
        isProbing = false;
        return;
      }

      // 4. If all external tests failed and no connection telemetry is available
      applyTierStyle(0, null, 'Network: No internet connection detected | Click to retry');
      isProbing = false;
    }

    // Fast initial check with browser link speed while measurement starts
    const initialConn = (typeof navigator !== 'undefined') && 
      (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
    if (initialConn && typeof initialConn.downlink === 'number' && initialConn.downlink > 0) {
      applyTierStyle(initialConn.downlink, initialConn.rtt, 'Testing live internet speed...');
    }

    // Run real download benchmark
    measureRealInternetSpeed();

    // Event listeners
    window.addEventListener('online', () => measureRealInternetSpeed());
    window.addEventListener('offline', () => applyTierStyle(0, null, 'Network: Offline'));

    if (initialConn && typeof initialConn.addEventListener === 'function') {
      initialConn.addEventListener('change', () => measureRealInternetSpeed());
    }

    // Periodic benchmark every 35 seconds
    if (!probeTimer) {
      probeTimer = setInterval(measureRealInternetSpeed, 35000);
    }

    // On-demand click benchmark
    badge.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      speedVal.textContent = 'Measuring...';
      badge.classList.remove('speed-offline', 'speed-slow', 'speed-good', 'speed-excellent');
      setTimeout(measureRealInternetSpeed, 100);
    });
  }

  /* ── Main bootstrap ── */
  async function bootstrap() {
    await Promise.all([
      loadFragment('sidebarSlot', 'sidebar.html'),
      loadFragment('navbarSlot', 'navbar.html'),
      loadFragment('footerSlot', 'footer.html'),
    ]);
    if (window.BrandIdentity && typeof window.BrandIdentity.applyToDOM === 'function') {
      window.BrandIdentity.applyToDOM();
    }
    markActiveNav();
    markUncompletedNav();
    restoreSidebarState();
    await applyModuleAccessPolicy();

    // Auto-resolve avatar image path based on page depth and custom avatar
    const prefix = window.FRAGMENT_BASE ? window.FRAGMENT_BASE.replace('fragments/', '') : '../';
    const customAvatar = localStorage.getItem('erp_user_avatar');
    document.querySelectorAll('.u-avatar-img').forEach(img => {
      if (customAvatar && customAvatar.trim() !== '') {
        img.src = customAvatar;
        img.style.display = 'block';
      } else {
        img.src = `${prefix}assets/user_avatar.jpg`;
      }
    });

    // Auto-resolve user name and role from session
    try {
      const storedUser = JSON.parse(sessionStorage.getItem('erp_user') || localStorage.getItem('erp_user') || 'null');
      if (storedUser && storedUser.fullName) {
        document.querySelectorAll('.u-name').forEach(el => el.textContent = storedUser.fullName);
      }
      if (storedUser && storedUser.role) {
        document.querySelectorAll('.u-role').forEach(el => el.textContent = storedUser.role);
      }
    } catch (_) {}

    // Ensure searchOverlay is attached to body for proper fixed positioning and z-indexing
    const overlay = document.getElementById('searchOverlay');
    if (overlay && overlay.parentElement && overlay.parentElement !== document.body) {
      document.body.appendChild(overlay);
    }

    // Wire navbar with Nav controller or standalone fallback
    const topBar = document.getElementById('appTopBar') || document.querySelector('.top-bar');
    if (window.Nav && typeof window.Nav.setupNavbar === 'function' && topBar) {
      window.Nav.setupNavbar(topBar);
    } else if (topBar) {
      wireNavbarFallback(topBar);
    }

    // Hydrate company details from API across all pages
    _fetchCompanyAndHydrate();
    _initFooterTimestamp();
    _initNetworkSpeedMonitor();

    // Wire topbar toggle button after navbar is injected
    const toggleBtn = document.getElementById('topbarToggleBtn');
    if (toggleBtn) {
      toggleBtn.removeAttribute('onclick');
      toggleBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
      };
    }

    // Global shortcut listeners (Cmd+K and Cmd+B)
    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window._openSearch) window._openSearch();
        else {
          const ov = document.getElementById('searchOverlay');
          const inp = document.getElementById('searchInput');
          if (ov) { ov.classList.add('open'); setTimeout(() => inp && inp.focus(), 60); }
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.key === 'Escape') {
        if (window._closeSearch) window._closeSearch();
        else {
          const ov = document.getElementById('searchOverlay');
          if (ov) ov.classList.remove('open');
        }
        document.querySelectorAll('.dd-panel').forEach(p => p.classList.remove('open'));
      }
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Fire a custom event so page JS can hook in after fragments load
    document.dispatchEvent(new CustomEvent('fragments:ready'));

    // Fire haulo-nav-ready so theme-switch.js can inject the theme toggle button
    window.dispatchEvent(new CustomEvent('haulo-nav-ready'));
    if (window.HauloTheme && typeof window.HauloTheme.injectButton === 'function') {
      const topbarRight = document.querySelector('.topbar-right');
      if (topbarRight && !document.getElementById('hauloThemeToggleBtn')) {
        window.HauloTheme.injectButton(topbarRight, { insertBefore: '#notifWrap' });
      }
    }
  }

  function wireNavbarFallback(topBar) {
    function closeDropdowns() {
      document.querySelectorAll('.dd-panel').forEach(p => p.classList.remove('open'));
      const b = document.getElementById('branchSel');
      if (b) b.classList.remove('active');
    }

    // Search trigger
    const searchBar = topBar.querySelector('#searchBarBtn');
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');

    function openSearch() {
      if (overlay) {
        overlay.classList.add('open');
        setTimeout(() => input && input.focus(), 60);
      }
    }
    function closeSearch() {
      if (overlay) overlay.classList.remove('open');
    }
    if (searchBar) searchBar.addEventListener('click', openSearch);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('.sp-esc')) closeSearch();
      });
    }

    // Live search filter
    if (input) {
      input.addEventListener('input', () => {
        const q = input.value.toLowerCase().trim();
        const activeCat = document.querySelector('.sp-cat.active')?.dataset.cat || 'all';
        document.querySelectorAll('.sp-row').forEach(row => {
          const rowCat = row.dataset.cat || '';
          const text = row.textContent.toLowerCase();
          const matchCat = (activeCat === 'all' || rowCat === activeCat);
          const matchQuery = (!q || text.includes(q));
          row.style.display = (matchCat && matchQuery) ? 'flex' : 'none';
        });
      });
    }

    // Category chips
    document.querySelectorAll('.sp-cat').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.sp-cat').forEach(c => c.classList.remove('active'));
        b.classList.add('active');
        if (input) input.dispatchEvent(new Event('input'));
      });
    });

    // Branch selector
    const branchSel = topBar.querySelector('#branchSel');
    const branchDd = topBar.querySelector('#branchDd');
    if (branchSel && branchDd) {
      branchSel.addEventListener('click', (e) => {
        if (e.target.closest('#branchDd')) return;
        e.stopPropagation();
        const isOpen = branchDd.classList.contains('open');
        closeDropdowns();
        if (!isOpen) {
          branchDd.classList.add('open');
          branchSel.classList.add('active');
          branchSel.setAttribute('aria-expanded', 'true');
        }
      });

      if (window.Nav && typeof window.Nav.syncNavbarBranches === 'function') {
        window.Nav.syncNavbarBranches(topBar);
      }
    }

    // Notifications Integration with Dynamic NotificationCenter
    const notifBtn = topBar.querySelector('#notifBtn');
    const notifPanel = topBar.querySelector('#notifPanel');
    const notifClearBtn = topBar.querySelector('#notifClearBtn');
    const notifBadge = topBar.querySelector('#notifBadge');

    if (window.NotificationCenter && typeof window.NotificationCenter.refresh === 'function') {
      window.NotificationCenter.refresh();
    }

    if (notifBtn && notifPanel) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = notifPanel.classList.contains('open');
        closeDropdowns();
        if (!isOpen) {
          notifPanel.classList.add('open');
          if (window.NotificationCenter && typeof window.NotificationCenter.refresh === 'function') {
            window.NotificationCenter.refresh();
          }
        }
      });
    }
    if (notifClearBtn) {
      notifClearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.NotificationCenter && typeof window.NotificationCenter.markAllRead === 'function') {
          window.NotificationCenter.markAllRead();
        } else {
          if (notifBadge) notifBadge.style.display = 'none';
          topBar.querySelectorAll('.notif-item').forEach(i => i.classList.remove('unread'));
        }
      });
    }

    // User profile
    const userBtn = topBar.querySelector('#userBtn');
    const userDd = topBar.querySelector('#userDd');
    if (userBtn && userDd) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = userDd.classList.contains('open');
        closeDropdowns();
        if (!isOpen) userDd.classList.add('open');
      });
    }

    document.addEventListener('click', closeDropdowns);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   GLOBAL HELPERS â€” called from sidebar.html onclick attributes
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/** Toggle sidebar collapsed state */
function toggleSidebar(forceState) {
  if (window._toggleSidebar) {
    window._toggleSidebar(forceState);
    return;
  }
  const sidebar = document.getElementById('appSidebar') || document.querySelector('.sidebar');
  const btn = document.getElementById('sidebarToggleBtn');
  if (!sidebar) return;
  const isCollapsed = sidebar.classList.contains('collapsed');
  const shouldCollapse = forceState !== undefined ? forceState : !isCollapsed;
  sidebar.classList.toggle('collapsed', shouldCollapse);
  if (btn) {
    const label = shouldCollapse ? 'Expand sidebar' : 'Collapse sidebar';
    btn.title = label;
    btn.setAttribute('aria-label', label);
  }
  const topToggle = document.getElementById('topbarToggleBtn');
  if (topToggle) {
    const label = shouldCollapse ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)';
    topToggle.title = label;
    topToggle.setAttribute('aria-label', label);
  }
  try {
    localStorage.setItem('sidebarCollapsed', shouldCollapse ? '1' : '0');
    localStorage.setItem('fashion_sidebar_collapsed', shouldCollapse ? '1' : '0');
  } catch (_) { }
  window.dispatchEvent(new Event('resize'));
}
window.toggleSidebar = toggleSidebar;

/** Navigate from sidebar â€” pages can override this */
function navNavigate(module, event) {
  if (event) event.preventDefault();
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const clickedItem = event && (event.currentTarget || (event.target && event.target.closest('.nav-item')));
  if (clickedItem && clickedItem.classList) {
    clickedItem.classList.add('active');
  }

  const prefix = window.FRAGMENT_BASE ? window.FRAGMENT_BASE.replace('fragments/', '') : '../';

  const moduleMap = {
    'dashboard': `${prefix}dashboard/dashboard.html`,
    'enquiries': `${prefix}enquiries/enquiries.html`,
    'appointments': `${prefix}appointments/appointments.html`,
    'customers': `${prefix}customer/customer-overview/customer-overview.html`,
    'orders': `${prefix}orders/order-overview/order-over.html`,
    'payments': `${prefix}payments/payments.html`,
    'garments': `${prefix}garments/garments.html`,
    'designs': `${prefix}DesignStudio/design-studio.html`,
    'design-studio': `${prefix}DesignStudio/design-studio.html`,
    'measurements': `${prefix}Measurements/measurement-overview/measurement-overview.html`,
    'measurement-overview': `${prefix}Measurements/measurement-overview/measurement-overview.html`,
    'measurement360': `${prefix}Measurements/measurement360/measurement360.html`,
    'fabrics': `${prefix}fabrics-materials/fabrics-materials.html`,
    'collections': `${prefix}collections/collections.html`,
    'product-library': `${prefix}DesignStudio/design-studio.html`,
    'production-room': `${prefix}production/production.html`,
    'production-floor': `${prefix}production/production.html`,
    'job-cards': null,
    'trials-alterations': `${prefix}trials-alterations/trials-alterations.html`,
    'quality-control': `${prefix}quality-control/quality-control.html`,
    'stock': `${prefix}inventory/inventory.html`,
    'packages': `${prefix}delivery/delivery.html`,
    'delivery': `${prefix}delivery/delivery.html`,
    'purchases': `${prefix}purchases/purchases.html`,
    'suppliers': null,
    'reports': null,
    'expenses': null,
    'profitability': null,
    'whatsapp': null,
    'campaigns': null,
    'employees': `${prefix}WorkforceManagement/workforce.html`,
    'attendance': `${prefix}WorkforceManagement/workforce.html`,
    'workforce': `${prefix}WorkforceManagement/workforce.html`,
    'branches': `${prefix}branches/branches.html`,
    'company': `${prefix}company/company.html`,
    'profile': `${prefix}profile/profile.html`,
    'users-roles': `${prefix}users-roles/users-roles.html`,
    'settings': `${prefix}settings/settings.html`,
  };

  const labelMap = {
    'dashboard': 'Dashboard',
    'enquiries': 'Enquiries',
    'appointments': 'Appointments',
    'customers': 'Customers',
    'orders': 'Orders',
    'payments': 'Payments',
    'garments': 'Garments',
    'designs': 'Designs',
    'design-studio': 'Design Studio',
    'measurements': 'Measurements',
    'fabrics': 'Fabrics & Materials',
    'collections': 'Collections',
    'production-room': 'Production Room',
    'job-cards': 'Job Cards',
    'trials-alterations': 'Trials & Alterations',
    'quality-control': 'Quality Control',
    'stock': 'Stock & Materials',
    'packages': 'Delivery',
    'delivery': 'Delivery',
    'purchases': 'Purchases',
    'suppliers': 'Suppliers',
    'reports': 'Reports & Analytics',
    'expenses': 'Expenses',
    'profitability': 'Profitability',
    'whatsapp': 'WhatsApp',
    'campaigns': 'Campaigns',
    'employees': 'Employees',
    'branches': 'Branches',
    'company': 'Company Details',
    'users-roles': 'Users & Roles',
    'settings': 'Settings'
  };

  const url = moduleMap[module];
  if (url && url !== '#') {
    window.location.href = url;
  } else {
    const title = labelMap[module] || module.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    showInProcessToast(`${title} — This page is in process`);
  }
}

/** Global in-process toast notice */
function showInProcessToast(message) {
  if (typeof showToast === 'function') {
    showToast(message, 'info');
    return;
  }

  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText = 'background:rgba(36,28,24,0.96);backdrop-filter:blur(18px);color:#fff;border:1px solid rgba(255,255,255,0.18);border-left:4px solid #38bdf8;border-radius:10px;padding:10px 16px;font-size:12px;font-weight:600;box-shadow:0 12px 36px rgba(0,0,0,0.5);display:flex;align-items:center;gap:10px;pointer-events:auto;font-family:var(--font-sans);';
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.25s, transform 0.25s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 260);
  }, 3500);
}

/* ============================================================
   UNIVERSAL PATRON AVATAR & INITIALS ENGINE
   - Multi-word names: First letter of first name + First letter of second name
   - Single-word names: First 2 letters of name
   - Automatic honorific cleaning (Ms., Mr., Mrs., Dr., etc.)
   - Deterministic dark luxury glassmorphism palettes
   ============================================================ */

window.getPatronInitials = function (name) {
  if (!name || typeof name !== 'string') return 'CU';
  const clean = name.trim();
  if (!clean || clean === '-') return 'CU';

  const HONORIFICS = new Set(['MS.', 'MS', 'MR.', 'MR', 'MRS.', 'MRS', 'MISS', 'DR.', 'DR', 'PROF.', 'PROF', 'SMT.', 'SMT', 'SHRI']);
  let rawTokens = clean.split(/\s+/).filter(Boolean);
  if (rawTokens.length > 1 && HONORIFICS.has(rawTokens[0].toUpperCase())) {
    rawTokens.shift();
  }

  if (rawTokens.length === 0) return 'CU';

  if (rawTokens.length === 1) {
    const single = rawTokens[0].replace(/[^a-zA-Z0-9]/g, '');
    if (!single) return rawTokens[0].substring(0, 2).toUpperCase();
    return single.length >= 2 ? single.substring(0, 2).toUpperCase() : single.toUpperCase();
  }

  const firstTokenClean = rawTokens[0].replace(/[^a-zA-Z0-9]/g, '');
  const secondTokenClean = rawTokens[1].replace(/[^a-zA-Z0-9]/g, '');
  const firstLetter = firstTokenClean[0] || rawTokens[0][0];
  const secondLetter = secondTokenClean[0] || rawTokens[1][0];
  return (firstLetter + secondLetter).toUpperCase();
};

window.getPatronAvatarTheme = function (name) {
  const PALETTES = [
    { bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.22), rgba(184, 255, 61, 0.18))', border: 'rgba(234, 179, 8, 0.35)', color: '#facc15' },
    { bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.22), rgba(139, 92, 246, 0.18))', border: 'rgba(168, 85, 247, 0.35)', color: '#c084fc' },
    { bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(184, 255, 61, 0.18))', border: 'rgba(184, 255, 61, 0.35)', color: '#b8ff3d' },
    { bg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.22), rgba(251, 113, 133, 0.18))', border: 'rgba(244, 63, 94, 0.35)', color: '#fb7185' },
    { bg: 'linear-gradient(135deg, rgba(14, 165, 233, 0.22), rgba(56, 189, 248, 0.18))', border: 'rgba(56, 189, 248, 0.35)', color: '#38bdf8' },
    { bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(129, 140, 248, 0.18))', border: 'rgba(99, 102, 241, 0.35)', color: '#818cf8' }
  ];
  let hash = 0;
  const str = String(name || 'Customer');
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTES[Math.abs(hash) % PALETTES.length];
};

window.renderPatronAvatarHtml = function (name, avatarUrl, sizeClass = 'haulo-avatar-md', extraStyles = '') {
  const inits = window.getPatronInitials(name);
  const theme = window.getPatronAvatarTheme(name);
  const isImageValid = avatarUrl &&
    !avatarUrl.includes('user_avatar.jpg') &&
    !avatarUrl.includes('default') &&
    avatarUrl !== 'null' &&
    avatarUrl !== 'undefined';

  const safeName = (name || 'Customer').replace(/"/g, '&quot;');
  const initialsTile = `<div class="haulo-patron-avatar-initials ${sizeClass}" style="background:${theme.bg};border:1.5px solid ${theme.border};color:${theme.color};${extraStyles}" title="${safeName}">${inits}</div>`;

  if (!isImageValid) {
    return initialsTile;
  }

  return `<div class="haulo-patron-avatar-wrap ${sizeClass}" style="position:relative;display:inline-flex;overflow:hidden;border-radius:inherit;${extraStyles}"><img src="${avatarUrl}" alt="${safeName}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="this.parentElement.outerHTML=\`${initialsTile.replace(/"/g, '&quot;')}\`" /></div>`;
};

window.applyPatronAvatarElement = function (containerEl, name, avatarUrl, sizeClass = 'haulo-avatar-md', extraStyles = '') {
  if (!containerEl) return;
  containerEl.innerHTML = window.renderPatronAvatarHtml(name, avatarUrl, sizeClass, extraStyles);
};
