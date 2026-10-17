/* =======================================================================
   HAULO BOUTIQUE ERP — COMMON BREADCRUMBS CONTROLLER
   Path: front end/fragments/breadcrumbs/breadcrumbs.js
   Dynamic routing, auto-hierarchy resolution & glassmorphic rendering
   ======================================================================= */

'use strict';

(function () {
  if (window.HauloBreadcrumbs) return;

  const CHEVRON_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="haulo-bc-sep-icon" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  `;

  const HOME_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="haulo-bc-icon" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `;

  // Standard Route Registry for ERP Modules & Subpages
  const ROUTE_REGISTRY = {
    'dashboard': { label: 'Dashboard', path: 'dashboard/dashboard.html' },
    'enquiries': { label: 'Enquiries', path: 'enquiries/enquiries.html', parent: 'dashboard' },
    'appointments': { label: 'Appointments', path: 'appointments/appointments.html', parent: 'dashboard' },
    
    // Customers
    'customers': { label: 'Customers', path: 'customer/customer-overview/customer-overview.html', parent: 'dashboard' },
    'customer-overview': { label: 'Customers', path: 'customer/customer-overview/customer-overview.html', parent: 'dashboard' },
    'customer360': { label: 'Customer 360', path: 'customer/Customer360/customer360.html', parent: 'customers' },
    'new-customer': { label: 'New Customer', path: 'customer/new-customer/new-customer.html', parent: 'customers' },

    // Orders
    'orders': { label: 'Orders', path: 'orders/order-overview/order-over.html', parent: 'dashboard' },
    'order-overview': { label: 'Orders', path: 'orders/order-overview/order-over.html', parent: 'dashboard' },
    'new-order': { label: 'New Order', path: 'orders/new-order/new-order.html', parent: 'orders' },
    'view-order': { label: 'Order Details', path: 'orders/view-order/view-order.html', parent: 'orders' },

    // Finance & Production
    'payments': { label: 'Finance & Payments', path: 'payments/payments.html', parent: 'dashboard' },
    'garments': { label: 'Garments', path: 'garments/garments.html', parent: 'dashboard' },
    'garaments 360': { label: 'Garment 360°', path: 'garments/garaments 360/garament360.html', parent: 'garments' },
    'garament360': { label: 'Garment 360°', path: 'garments/garaments 360/garament360.html', parent: 'garments' },
    'new-garment': { label: 'New Garment', path: 'garments/new-garment/new-garment.html', parent: 'garments' },
    'designs': { label: 'Design Studio', path: 'DesignStudio/design-studio.html', parent: 'dashboard' },
    'designstudio': { label: 'Design Studio', path: 'DesignStudio/design-studio.html', parent: 'dashboard' },
    
    // Measurements
    'measurements': { label: 'Measurements', path: 'Measurements/measurement-overview/measurement-overview.html', parent: 'dashboard' },
    'measurement-overview': { label: 'Measurements', path: 'Measurements/measurement-overview/measurement-overview.html', parent: 'dashboard' },
    'measurement360': { label: 'Client Measurements', path: 'Measurements/measurement360/measurement360.html', parent: 'measurements' },

    // Materials, Production & Trials
    'fabrics': { label: 'Fabrics & Materials', path: 'fabrics-materials/fabrics-materials.html', parent: 'dashboard' },
    'fabrics-materials': { label: 'Fabrics & Materials', path: 'fabrics-materials/fabrics-materials.html', parent: 'dashboard' },
    'collections': { label: 'Collections', path: 'collections/collections.html', parent: 'dashboard' },
    'production': { label: 'Production Floor', path: 'production/production.html', parent: 'dashboard' },
    'production-stages': { label: 'Production Stages', path: 'production/stages/stages.html', parent: 'production' },
    'trials-alterations': { label: 'Trials & Alterations', path: 'trials-alterations/trials-alterations.html', parent: 'dashboard' },
    'quality-control': { label: 'Quality Control', path: 'quality-control/quality-control.html', parent: 'dashboard' },

    // Operations
    'inventory': { label: 'Stock & Inventory', path: 'inventory/inventory.html', parent: 'dashboard' },
    'purchases': { label: 'Purchases & GRN', path: 'purchases/purchases.html', parent: 'dashboard' },
    'suppliers': { label: 'Suppliers', path: 'suppliers/suppliers.html', parent: 'dashboard' },
    'delivery': { label: 'Delivery & Logistics', path: 'delivery/delivery.html', parent: 'dashboard' },
    'workforce': { label: 'Workforce Management', path: 'WorkforceManagement/workforce.html', parent: 'dashboard' },
    'branches': { label: 'Branches', path: 'branches/branches.html', parent: 'dashboard' },

    // Settings & Users
    'company': { label: 'Company Profile', path: 'settings/company-profile/company-profile.html', parent: 'settings' },
    'company-setup': { label: 'Boutique Setup', path: 'settings/company-profile/company-profile.html', parent: 'settings' },
    'profile': { label: 'My Profile', path: 'profile/profile.html', parent: 'dashboard' },
    'settings': { label: 'Settings', path: 'settings/company-profile/company-profile.html', parent: 'dashboard' },
    'users-roles': { label: 'Users & Roles', path: 'users-roles/users-roles.html', parent: 'dashboard' },
    'create-user': { label: 'Add User', path: 'users-roles/create-user/create-user.html', parent: 'users-roles' },
    'recent-access': { label: 'Recent Access', path: 'users-roles/recent-access/recent-access.html', parent: 'users-roles' }
  };

  class BreadcrumbsController {
    constructor() {
      this.currentItems = [];
      this.container = null;
    }

    getPrefix() {
      if (window.Nav && typeof window.Nav.getPrefix === 'function') {
        return window.Nav.getPrefix();
      }
      if (typeof window.FRAGMENT_BASE === 'string') {
        return window.FRAGMENT_BASE.replace('fragments/', '');
      }
      // Dynamic depth calculation relative to /front end/ or /front%20end/
      const norm = window.location.pathname.replace(/\\/g, '/');
      const marker = '/front end/';
      const markerEncoded = '/front%20end/';
      let sub = '';
      const idx = norm.toLowerCase().indexOf(marker);
      const idxEncoded = norm.toLowerCase().indexOf(markerEncoded);
      if (idx !== -1) {
        sub = norm.substring(idx + marker.length);
      } else if (idxEncoded !== -1) {
        sub = norm.substring(idxEncoded + markerEncoded.length);
      }
      if (sub) {
        const depth = (sub.match(/\//g) || []).length;
        return depth > 0 ? '../'.repeat(depth) : '';
      }
      const parts = norm.split('/').filter(Boolean);
      if (parts.length > 2) return '../../';
      if (parts.length > 1) return '../';
      return '';
    }

    /* Auto-detect page hierarchy from location pathname */
    autoDetectHierarchy() {
      const rawPath = window.location.pathname.replace(/\\/g, '/').toLowerCase();
      const prefix = this.getPrefix();
      const items = [{ label: 'Home', href: `${prefix}dashboard/dashboard.html`, isHome: true }];

      // Dashboard special handling
      if (rawPath.endsWith('/dashboard.html') || rawPath.endsWith('/dashboard/') || rawPath.endsWith('/dashboard')) {
        items.push({ label: 'Dashboard', isCurrent: true });
        return items;
      }

      // Design Studio
      if (rawPath.includes('/designstudio/new-design/') || rawPath.includes('/new-design/')) {
        items.push({ label: 'Design Studio', href: `${prefix}DesignStudio/design-studio.html` });
        items.push({ label: 'New Blueprint', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/designstudio/') || rawPath.includes('/design-studio.')) {
        items.push({ label: 'Design Studio', isCurrent: true });
        return items;
      }

      // Measurements & 3D Mannequin
      if (rawPath.includes('/3d mannequin/') || rawPath.includes('/mannequin3d/')) {
        items.push({ label: 'Measurements', href: `${prefix}Measurements/measurement-overview/measurement-overview.html` });
        items.push({ label: '3D Mannequin', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/measurements/measurement360/')) {
        items.push({ label: 'Measurements', href: `${prefix}Measurements/measurement-overview/measurement-overview.html` });
        items.push({ label: 'Client Measurements', isCurrent: true, id: 'bcCustomerName' });
        return items;
      }
      if (rawPath.includes('/measurements/')) {
        items.push({ label: 'Measurements', isCurrent: true });
        return items;
      }

      // Users & Roles
      if (rawPath.includes('/users-roles/recent-access/')) {
        items.push({ label: 'Users & Roles', href: `${prefix}users-roles/users-roles.html` });
        items.push({ label: 'Recent Access', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/users-roles/create-user/')) {
        items.push({ label: 'Users & Roles', href: `${prefix}users-roles/users-roles.html` });
        items.push({ label: 'Add User', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/users-roles/')) {
        items.push({ label: 'Users & Roles', isCurrent: true });
        return items;
      }

      // Customers
      if (rawPath.includes('/customer/customer360/')) {
        items.push({ label: 'Customers', href: `${prefix}customer/customer-overview/customer-overview.html` });
        items.push({ label: 'Customer 360', isCurrent: true, id: 'bcCustomerName' });
        return items;
      }
      if (rawPath.includes('/customer/new-customer/')) {
        items.push({ label: 'Customers', href: `${prefix}customer/customer-overview/customer-overview.html` });
        items.push({ label: 'New Customer', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/customer/')) {
        items.push({ label: 'Customers', isCurrent: true });
        return items;
      }

      // Orders
      if (rawPath.includes('/orders/new-order/')) {
        items.push({ label: 'Orders', href: `${prefix}orders/order-overview/order-over.html` });
        items.push({ label: 'New Order', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/orders/view-order/')) {
        items.push({ label: 'Orders', href: `${prefix}orders/order-overview/order-over.html` });
        items.push({ label: 'Order Details', isCurrent: true, id: 'bcOrderNumber' });
        return items;
      }
      if (rawPath.includes('/orders/')) {
        items.push({ label: 'Orders', isCurrent: true });
        return items;
      }

      // Garments
      if (rawPath.includes('/garments/garaments 360/') || rawPath.includes('/garments/garments-360/') || rawPath.includes('/garaments%20360/')) {
        items.push({ label: 'Garments', href: `${prefix}garments/garments.html` });
        items.push({ label: 'Garment 360°', isCurrent: true, id: 'bcGarmentCode' });
        return items;
      }
      if (rawPath.includes('/garments/new-garment/') || rawPath.includes('/new-garment/')) {
        items.push({ label: 'Garments', href: `${prefix}garments/garments.html` });
        items.push({ label: 'New Garment', isCurrent: true });
        return items;
      }

      // Production
      if (rawPath.includes('/production/stages/')) {
        items.push({ label: 'Production Floor', href: `${prefix}production/production.html` });
        items.push({ label: 'Production Stages', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/production/')) {
        items.push({ label: 'Production Floor', isCurrent: true });
        return items;
      }

      // Company & Setup
      if (rawPath.includes('/company/setup/') || rawPath.includes('/company/setup/setup.html')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'Boutique Setup', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/company/')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'Company Profile', isCurrent: true });
        return items;
      }
      // Settings Sub-Pages
      if (rawPath.includes('/settings/company-profile/')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'Company & Boutique Profile', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/settings/branding/')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'Branding & Theme', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/settings/regional/')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'Regional & Currency', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/settings/branches/')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'Branches & Locations', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/settings/users-roles/')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'Users & Roles', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/settings/security/')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'Security & Access', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/settings/orders-production/')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'Orders & Production', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/settings/notifications/')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'Notifications', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/settings/integrations/')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'Integrations', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/settings/data-backup/')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'Data & Backup', isCurrent: true });
        return items;
      }
      if (rawPath.includes('/settings/about/')) {
        items.push({ label: 'Settings', href: `${prefix}settings/company-profile/company-profile.html` });
        items.push({ label: 'About & License', isCurrent: true });
        return items;
      }

      // Single level modules
      for (const [key, meta] of Object.entries(ROUTE_REGISTRY)) {
        if (rawPath.includes(`/${key}/`) || rawPath.endsWith(`/${key}.html`)) {
          if (meta.parent && ROUTE_REGISTRY[meta.parent] && meta.parent !== 'dashboard') {
            const p = ROUTE_REGISTRY[meta.parent];
            items.push({ label: p.label, href: `${prefix}${p.path}` });
          }
          items.push({ label: meta.label, isCurrent: true });
          return items;
        }
      }

      // Default fallback from document title
      let pageTitle = document.title ? document.title.split('—')[0].split('-')[0].trim() : 'Overview';
      if (!pageTitle || pageTitle.toLowerCase() === 'haulo' || pageTitle.toLowerCase() === 'fashion erp') {
        pageTitle = 'Overview';
      }
      items.push({ label: pageTitle, isCurrent: true });
      return items;
    }

    /* Renders breadcrumbs into target element */
    render(items) {
      if (!items || !items.length) items = this.autoDetectHierarchy();
      this.currentItems = items;

      const container = this.getContainer();
      if (!container) return;

      let html = `
        <nav class="haulo-bc-nav" id="appBreadcrumbs" aria-label="Breadcrumb navigation">
          <ol class="haulo-bc-list" id="hauloBcList">
      `;

      items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const isHome = item.isHome || (index === 0 && item.label === 'Home');
        const idAttr = item.id ? `id="${item.id}"` : '';

        html += `<li class="haulo-bc-item">`;

        if (isLast || item.isCurrent) {
          html += `
            <span class="haulo-bc-current" ${idAttr} aria-current="page">
              ${item.icon ? item.icon + ' ' : ''}${this.escape(item.label)}
            </span>
          `;
        } else {
          const href = item.href || '#';
          if (isHome) {
            html += `
              <a href="${href}" class="haulo-bc-link haulo-bc-home" title="Dashboard">
                ${HOME_SVG}
                <span class="haulo-bc-label">Home</span>
              </a>
            `;
          } else {
            html += `
              <a href="${href}" class="haulo-bc-link" ${idAttr}>
                ${item.icon ? item.icon + ' ' : ''}<span>${this.escape(item.label)}</span>
              </a>
            `;
          }
        }

        if (!isLast) {
          html += `
            <span class="haulo-bc-sep" aria-hidden="true">
              ${CHEVRON_SVG}
            </span>
          `;
        }

        html += `</li>`;
      });

      html += `
          </ol>
        </nav>
      `;

      container.innerHTML = html;
    }

    /* Set custom breadcrumb items */
    set(items) {
      if (Array.isArray(items)) {
        this.render(items);
      }
    }

    /* Update the dynamic leaf node label (e.g., dynamic Customer Name, Order #) */
    setDynamic(label) {
      if (!label) return;
      const currentEl = document.querySelector('.haulo-bc-current, #bcCustomerName, #bcOrderNo');
      if (currentEl) {
        currentEl.textContent = label;
      } else if (this.currentItems.length > 0) {
        this.currentItems[this.currentItems.length - 1].label = label;
        this.render(this.currentItems);
      }
    }

    getContainer() {
      return (
        document.getElementById('breadcrumbSlot') ||
        document.querySelector('.haulo-bc-slot') ||
        document.getElementById('appBreadcrumbs') ||
        document.querySelector('.breadcrumb-nav') ||
        document.querySelector('.cu-breadcrumb-nav')
      );
    }

    escape(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    init() {
      const container = this.getContainer();
      if (!container) return;

      // Check if container specifies custom breadcrumbs declaratively via data-breadcrumb
      const declarativeData = container.getAttribute('data-breadcrumb');
      if (declarativeData) {
        try {
          const parsed = JSON.parse(declarativeData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.render(parsed);
            return;
          }
        } catch (_) {}
      }

      // If container already has fully structured server/page markup and is not an empty slot, leave as is or enhance
      if (container.id === 'breadcrumbSlot' || container.innerHTML.trim() === '') {
        this.render();
      }

      // Listen for custom global events
      document.addEventListener('haulo:breadcrumbs-set', (e) => {
        if (e.detail) this.set(e.detail);
      });
      document.addEventListener('haulo:breadcrumbs-dynamic', (e) => {
        if (e.detail) this.setDynamic(e.detail);
      });
    }
  }

  window.HauloBreadcrumbs = new BreadcrumbsController();

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.HauloBreadcrumbs.init());
  } else {
    window.HauloBreadcrumbs.init();
  }

  // Also re-check when fragments or nav finish injection
  document.addEventListener('fragments:ready', () => {
    window.HauloBreadcrumbs.init();
  });
  document.addEventListener('nav:ready', () => {
    window.HauloBreadcrumbs.init();
  });
  document.addEventListener('nav:fragmentLoaded', () => {
    window.HauloBreadcrumbs.init();
  });
})();
