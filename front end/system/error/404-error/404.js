/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — 404 ERROR PAGE INTERACTIVE CONTROLLER
 * Path: front end/system/error/404-error/404.js
 * =======================================================================
 */

(function () {
  'use strict';

  // 1. Calculate relative path prefix to frontend root
  function getFrontendPrefix() {
    // Current folder is front end/system/error/404-error/ -> 3 levels up to front end/
    return '../../../';
  }

  const prefix = getFrontendPrefix();

  // 2. Comprehensive ERP Modules Registry for Quick Search
  const ERP_PAGES = [
    {
      title: 'Executive Dashboard',
      sub: 'KPI metrics, revenue overview & boutique analytics',
      url: `${prefix}dashboard/dashboard.html`,
      category: 'Overview',
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>'
    },
    {
      title: 'Customer Directory & 360',
      sub: 'Client profiles, fitting history & contact database',
      url: `${prefix}customer/customer-overview/customer-overview.html`,
      category: 'Clients',
      icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'
    },
    {
      title: 'Orders Management',
      sub: 'Order tracking, bespoke apparel & status workflow',
      url: `${prefix}orders/order-overview/order-over.html`,
      category: 'Orders',
      icon: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>'
    },
    {
      title: 'Create New Order',
      sub: 'Start custom tailoring or ready-to-wear order entry',
      url: `${prefix}orders/new-order/new-order.html`,
      category: 'Orders',
      icon: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'
    },
    {
      title: 'Stock & Materials Inventory',
      sub: 'Fabric bolts, trims, threads, stock alerts & levels',
      url: `${prefix}inventory/inventory.html`,
      category: 'Inventory',
      icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>'
    },
    {
      title: 'Fabrics & Materials Library',
      sub: 'Luxury silks, laces, brocades, linens & swatch books',
      url: `${prefix}fabrics-materials/fabrics-materials.html`,
      category: 'Inventory',
      icon: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>'
    },
    {
      title: 'Design Studio & CAD',
      sub: 'Sketch canvas, silhouette moodboards & pattern drafts',
      url: `${prefix}DesignStudio/design-studio.html`,
      category: 'Creative',
      icon: '<circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>'
    },
    {
      title: 'Measurements Directory',
      sub: 'Custom tailor measurements & anatomical body profiles',
      url: `${prefix}Measurements/measurement-overview/measurement-overview.html`,
      category: 'Tailoring',
      icon: '<path d="M21.3 8.7l-6-6a2.12 2.12 0 0 0-3 0l-9.6 9.6a2.12 2.12 0 0 0 0 3l6 6c.8.8 2.2.8 3 0l9.6-9.6a2.12 2.12 0 0 0 0-3z"></path>'
    },
    {
      title: 'Garments & Styles Catalogue',
      sub: 'Finished dresses, suits, lehengas & couture archive',
      url: `${prefix}garments/garments.html`,
      category: 'Collection',
      icon: '<path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>'
    },
    {
      title: 'Production Floor & Stages',
      sub: 'Cutting, stitching, embroidery & workshop stages',
      url: `${prefix}production/production.html`,
      category: 'Workshop',
      icon: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>'
    },
    {
      title: 'Quality Control (QC)',
      sub: 'Garment inspection, defect logs & approval stages',
      url: `${prefix}quality-control/quality-control.html`,
      category: 'Quality',
      icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
    },
    {
      title: 'Trials & Alterations',
      sub: 'Client fitting trials, pin adjustments & revision logs',
      url: `${prefix}trials-alterations/trials-alterations.html`,
      category: 'Fitting',
      icon: '<circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line>'
    },
    {
      title: 'Payments & Financials',
      sub: 'Client deposits, invoices, balance settlements',
      url: `${prefix}payments/payments.html`,
      category: 'Finance',
      icon: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>'
    },
    {
      title: 'Dispatch & Delivery',
      sub: 'Packaging, courier tracking & client handovers',
      url: `${prefix}delivery/delivery.html`,
      category: 'Logistics',
      icon: '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>'
    },
    {
      title: 'Branches & Boutiques',
      sub: 'Flagship stores, workshops, studios & addresses',
      url: `${prefix}branches/branches.html`,
      category: 'Admin',
      icon: '<rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>'
    },
    {
      title: 'Workforce & Tailors',
      sub: 'Master tailors, embroiders, stylists & attendance',
      url: `${prefix}WorkforceManagement/workforce.html`,
      category: 'HR',
      icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>'
    },
    {
      title: 'Users & Roles Management',
      sub: 'Staff system access, permissions & ERP accounts',
      url: `${prefix}users-roles/users-roles.html`,
      category: 'Admin',
      icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>'
    },
    {
      title: 'Company Settings',
      sub: 'Brand identity, tax configurations & company profile',
      url: `${prefix}company/company.html`,
      category: 'Admin',
      icon: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>'
    }
  ];

  // 3. Setup Navigation Links
  function setupLinks() {
    const dashboardUrl = `${prefix}dashboard/dashboard.html`;
    const loginUrl = `${prefix}login/login.html`;
    const token = sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token');
    const homeTarget = token ? dashboardUrl : loginUrl;

    const brandLink = document.getElementById('brandLink');
    if (brandLink) brandLink.href = homeTarget;

    const backHomeBtn = document.getElementById('backHomeBtn');
    if (backHomeBtn) {
      backHomeBtn.href = homeTarget;
      backHomeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const curUrl = window.location.href;
        const curFile = window.location.pathname.split('/').pop().toLowerCase();

        // 1. Check document.referrer
        if (document.referrer) {
          try {
            const refUrl = new URL(document.referrer, window.location.origin);
            const refFile = refUrl.pathname.split('/').pop().toLowerCase();
            if (refUrl.href !== curUrl && refFile !== curFile && !refFile.includes('404')) {
              window.location.href = document.referrer;
              return;
            }
          } catch (_) {
            if (document.referrer !== curUrl && !document.referrer.includes('404')) {
              window.location.href = document.referrer;
              return;
            }
          }
        }

        // 2. Check stored last visited page
        const storedLastPage = sessionStorage.getItem('haulo_last_visited_page') || 
                               localStorage.getItem('haulo_last_visited_page') ||
                               sessionStorage.getItem('haulo_current_page') ||
                               localStorage.getItem('haulo_current_page');

        if (storedLastPage && storedLastPage !== curUrl && !storedLastPage.includes('404')) {
          window.location.href = storedLastPage;
          return;
        }

        // 3. Fallback to browser history back
        if (window.history.length > 1) {
          window.history.back();
          return;
        }

        // 4. Default safe fallback
        window.location.href = homeTarget;
      });
    }

    const btnDashboard = document.getElementById('btnDashboard');
    if (btnDashboard) btnDashboard.href = dashboardUrl;
  }

  // 4. Quick Search / Command Palette Controller
  const modal = document.getElementById('searchModal');
  const input = document.getElementById('searchPagesInput');
  const resultsContainer = document.getElementById('searchResultsList');
  const openBtn = document.getElementById('btnSearchPages');
  const closeBtn = document.getElementById('searchCloseBtn');
  let selectedIndex = 0;
  let currentFiltered = [];

  function openSearchModal() {
    if (!modal) return;
    modal.classList.add('open');
    renderSearchResults('');
    setTimeout(() => {
      if (input) {
        input.value = '';
        input.focus();
      }
    }, 60);
  }

  function closeSearchModal() {
    if (!modal) return;
    modal.classList.remove('open');
  }

  function renderSearchResults(query) {
    if (!resultsContainer) return;
    const q = (query || '').toLowerCase().trim();

    currentFiltered = ERP_PAGES.filter(p => {
      if (!q) return true;
      return p.title.toLowerCase().includes(q) ||
             p.sub.toLowerCase().includes(q) ||
             p.category.toLowerCase().includes(q);
    });

    selectedIndex = 0;

    if (currentFiltered.length === 0) {
      resultsContainer.innerHTML = '<div class="search-empty-msg">No matching ERP pages found. Try searching "orders", "inventory", or "clients".</div>';
      return;
    }

    resultsContainer.innerHTML = currentFiltered.map((p, idx) => `
      <a href="${p.url}" class="search-result-item ${idx === 0 ? 'selected' : ''}" data-index="${idx}">
        <div class="search-item-left">
          <svg viewBox="0 0 24 24" fill="none" class="search-item-icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${p.icon}
          </svg>
          <div>
            <div class="search-item-title">${escapeHtml(p.title)}</div>
            <div class="search-item-sub">${escapeHtml(p.sub)}</div>
          </div>
        </div>
        <span class="search-item-category">${escapeHtml(p.category)}</span>
      </a>
    `).join('');
  }

  function updateSelected() {
    const items = resultsContainer.querySelectorAll('.search-result-item');
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === selectedIndex);
      if (idx === selectedIndex) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function wireSearchModal() {
    if (openBtn) openBtn.addEventListener('click', openSearchModal);
    if (closeBtn) closeBtn.addEventListener('click', closeSearchModal);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSearchModal();
      });
    }

    if (input) {
      input.addEventListener('input', (e) => {
        renderSearchResults(e.target.value);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (currentFiltered.length > 0) {
            selectedIndex = (selectedIndex + 1) % currentFiltered.length;
            updateSelected();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentFiltered.length > 0) {
            selectedIndex = (selectedIndex - 1 + currentFiltered.length) % currentFiltered.length;
            updateSelected();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (currentFiltered[selectedIndex]) {
            window.location.href = currentFiltered[selectedIndex].url;
          }
        } else if (e.key === 'Escape') {
          closeSearchModal();
        }
      });
    }

    // Global keyboard shortcut: Command/Ctrl + K to open search
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (modal.classList.contains('open')) {
          closeSearchModal();
        } else {
          openSearchModal();
        }
      }
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeSearchModal();
      }
    });
  }

  // 5. Dynamic Path Diagnostic
  function initDiagnosticPath() {
    const params = new URLSearchParams(window.location.search);
    const brokenPath = params.get('path');
    if (!brokenPath) return;

    const subtitleEl = document.querySelector('.error-subtitle');
    if (subtitleEl) {
      subtitleEl.innerHTML = `The requested route <code style="color: #a3e635; background: rgba(163,230,53,0.12); padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 13px;">${escapeHtml(brokenPath)}</code> could not be found or has been relocated.<br />Explore the boutique directory below to continue.`;
    }

    const parts = brokenPath.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1] || '';
    const cleanTerm = lastPart.replace(/\.html?$/i, '').replace(/[-_]/g, ' ');
    if (cleanTerm && cleanTerm.length > 2) {
      const searchInput = document.getElementById('searchPagesInput');
      if (searchInput) {
        searchInput.value = cleanTerm;
        renderSearchResults(cleanTerm);
      }
    }
  }

  // 6. Dynamic Company Branding Integration
  function hydrateCompanyBranding() {
    try {
      const coStr = localStorage.getItem('erp_company') || sessionStorage.getItem('erp_company');
      if (coStr) {
        const co = JSON.parse(coStr);
        if (co.shortName) {
          document.querySelectorAll('[data-company="shortName"]').forEach(el => el.textContent = co.shortName);
        }
        if (co.shortNameUpper || co.shortName) {
          const up = (co.shortNameUpper || co.shortName || '').toUpperCase();
          document.querySelectorAll('[data-company="shortNameUpper"]').forEach(el => el.textContent = up);
        }
        if (co.companyName) {
          document.querySelectorAll('[data-company="companyName"]').forEach(el => el.textContent = co.companyName);
        }
      }
    } catch (_) {}
  }

  // 7. Init
  document.addEventListener('DOMContentLoaded', () => {
    setupLinks();
    wireSearchModal();
    initDiagnosticPath();
    hydrateCompanyBranding();
  });
})();
