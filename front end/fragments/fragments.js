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
      else if (path.includes('/production')) currentModule = 'production-room';
      else if (path.includes('/trials-alterations') || path.includes('/trial')) currentModule = 'trials-alterations';
      else if (path.includes('/quality-control') || path.includes('/qc')) currentModule = 'quality-control';
      else if (path.includes('/inventory') || path.includes('/stock')) currentModule = 'stock';
      else if (path.includes('/purchases')) currentModule = 'purchases';
      else if (path.includes('/delivery') || path.includes('/dispatch')) currentModule = 'delivery';
      else if (path.includes('/workforcemanagement') || path.includes('/workforce') || path.includes('/employee')) currentModule = 'employees';
      else if (path.includes('order')) currentModule = 'orders';
      else currentModule = 'dashboard';
    }

    function canonicalize(m) {
      const s = (m || '').toLowerCase().trim();
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
      return s;
    }

    const activeMod = canonicalize(currentModule);
    document.querySelectorAll('.nav-item').forEach(item => {
      const itemMod = canonicalize(item.dataset.module || item.getAttribute('data-module') || '');
      const itemId = (item.id || '').toLowerCase().trim();
      const tooltip = (item.getAttribute('data-tooltip') || '').toLowerCase().trim();
      const isMatch = (
        (itemMod && itemMod === activeMod) ||
        (itemId && itemId === `nav-${activeMod}`) ||
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
        (activeMod === 'employees' && (itemId === 'nav-employees' || itemId === 'nav-workforce' || itemMod === 'employees' || tooltip.includes('employee')))
      );
      item.classList.toggle('active', Boolean(isMatch));
    });
  }

  /* â”€â”€ Tag uncompleted nav items with red glow â”€â”€ */
  function markUncompletedNav() {
    const uncompletedList = ['job-cards', 'suppliers', 'reports', 'expenses', 'profitability', 'whatsapp', 'campaigns', 'branches', 'users-roles', 'settings'];
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

  /* â”€â”€ Main bootstrap â”€â”€ */
  async function bootstrap() {
    await Promise.all([
      loadFragment('sidebarSlot', 'sidebar.html'),
      loadFragment('navbarSlot', 'navbar.html'),
      loadFragment('footerSlot', 'footer.html'),
    ]);
    markActiveNav();
    markUncompletedNav();
    restoreSidebarState();

    // Auto-resolve avatar image path based on page depth
    const prefix = window.FRAGMENT_BASE ? window.FRAGMENT_BASE.replace('fragments/', '') : '../';
    document.querySelectorAll('.u-avatar-img').forEach(img => {
      img.src = `${prefix}assets/user_avatar.jpg`;
    });

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
        if (!isOpen) branchDd.classList.add('open');
      });
      branchDd.querySelectorAll('.dd-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          branchDd.querySelectorAll('.dd-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          const name = item.dataset.branch || item.textContent.trim();
          const textEl = branchSel.querySelector('.branch-sel-text, #branchSelText');
          if (textEl) textEl.textContent = `Haulo Designs — ${name}`;
          closeDropdowns();
        });
      });
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
    'branches': null,
    'users-roles': null,
    'settings': null,
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
    'users-roles': 'Users & Roles',
    'settings': 'Settings'
  };

  const url = moduleMap[module];
  if (url && url !== '#') {
    window.location.href = url;
  } else {
    const title = labelMap[module] || module.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    showInProcessToast(`${title} â€” This page is in process`);
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
  toast.style.cssText = 'background:rgba(36,28,24,0.96);backdrop-filter:blur(18px);color:#fff;border:1px solid rgba(255,255,255,0.18);border-left:4px solid #38bdf8;border-radius:10px;padding:10px 16px;font-size:12px;font-weight:600;box-shadow:0 12px 36px rgba(0,0,0,0.5);display:flex;align-items:center;gap:10px;pointer-events:auto;font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;';
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
