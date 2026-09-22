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

  /* â”€â”€ Mark the active nav item â”€â”€ */
  function markActiveNav() {
    let module = document.body.dataset.module || 'dashboard';
    if (module === 'design-studio') module = 'designs';
    if (module === 'workforce') module = 'employees';
    if (module === 'production-floor') module = 'production-room';
    if (module === 'delivery') module = 'delivery';
    if (module === 'payments') module = 'payments';
    document.querySelectorAll('.nav-item').forEach(item => {
      const itemModule = item.dataset.module;
      const isMatch = itemModule === module ||
        (module === 'production-room' && itemModule === 'production-floor') ||
        (module === 'delivery' && (itemModule === 'delivery' || itemModule === 'packages')) ||
        (module === 'payments' && itemModule === 'payments');
      item.classList.toggle('active', isMatch);
    });
  }

  /* â”€â”€ Tag uncompleted nav items with red glow â”€â”€ */
  function markUncompletedNav() {
    const uncompletedList = ['garments', 'job-cards', 'suppliers', 'reports', 'expenses', 'profitability', 'whatsapp', 'campaigns', 'branches', 'users-roles', 'settings'];
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

    // Notifications
    const notifBtn = topBar.querySelector('#notifBtn');
    const notifPanel = topBar.querySelector('#notifPanel');
    const notifClearBtn = topBar.querySelector('#notifClearBtn');
    const notifBadge = topBar.querySelector('#notifBadge');
    if (notifBtn && notifPanel) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = notifPanel.classList.contains('open');
        closeDropdowns();
        if (!isOpen) notifPanel.classList.add('open');
      });
    }
    if (notifClearBtn) {
      notifClearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (notifBadge) notifBadge.style.display = 'none';
        topBar.querySelectorAll('.notif-item').forEach(i => i.classList.remove('unread'));
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
    'garments': null,
    'designs': `${prefix}DesignStudio/design-studio.html`,
    'design-studio': `${prefix}DesignStudio/design-studio.html`,
    'measurements': `${prefix}Measurements/measurement-overview/measurement-overview.html`,
    'measurement-overview': `${prefix}Measurements/measurement-overview/measurement-overview.html`,
    'measurement360': `${prefix}Measurements/measurement360/measurement360.html`,
    'fabrics': `${prefix}fabrics-materials/fabrics-materials.html`,
    'collections': `${prefix}DesignStudio/design-studio.html`,
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
