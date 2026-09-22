/**
 * =======================================================================
 * FASHION ERP â€” UNIFIED NAVIGATION SCRIPT
 * File: frontend/fragments/nav.js
 * Description: Self-Contained Controller & Loader for Sidebar & Top Navigation Bar
 * =======================================================================
 */
(function() {
  'use strict';

  // Calculate relative prefix to frontend root
  function calculatePrefix() {
    // 1. If script element src is present, extract prefix from it directly
    const navScript = document.currentScript || document.querySelector('script[src*="nav.js"]');
    if (navScript && navScript.getAttribute('src')) {
      const src = navScript.getAttribute('src');
      const match = src.match(/^((\.\.\/)*)fragments\/nav\.js/);
      if (match) {
        return match[1] || '';
      }
    }

    // 2. Otherwise calculate based on URL path depth
    const path = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    if (path.includes('/orders/new-order') || path.includes('/orders/view-order') || path.includes('/orders/order-overview') || path.includes('/orders/order-details') || path.includes('/customer/') || path.includes('/pages/quality-control/') || path.includes('/pages/trial-alterations/') || path.includes('/measurements/') || path.includes('/measurement360') || path.includes('/measurement-overview')) {
      return '../../';
    }
    if (path.includes('/pages/')) {
      const partsAfterPages = path.split('/pages/')[1] || '';
      const slashes = (partsAfterPages.match(/\//g) || []).length;
      return slashes >= 2 ? '../../../' : '../../';
    }
    if (path.includes('/payments') || path.includes('/delivery') || path.includes('/trials-alterations') || path.includes('/measurements') || path.includes('/enquiries') || path.includes('/orders') || path.includes('/operations') || path.includes('/production') || path.includes('/desks/') || path.includes('/designstudio') || path.includes('/design-studio') || path.includes('/workforcemanagement') || path.includes('/workforce-management') || path.includes('/workforce') || path.includes('/dashboard') || path.includes('/quality-control') || path.includes('/inventory') || path.includes('/fabrics-materials') || path.includes('/fabrics') || path.includes('/purchases') || path.includes('/appointments')) {
      return '../';
    }
    return '';
  }

  const rootPrefix = calculatePrefix();
  const basePath = `${rootPrefix}fragments/`;

  // 1. Automatically ensure nav.css is loaded
  function ensureNavCss() {
    const existing = document.querySelector('link[href*="nav.css"]');
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${basePath}nav.css`;
      document.head.appendChild(link);
    }
  }

  // 2. Embedded Fallback Templates (for offline / file:/// protocol support)
  const TEMPLATES = {
    sidebar: `<!-- Sidebar Navigation -->
<aside class="sidebar" id="appSidebar">

  <!-- Logo + Toggle -->
  <div class="sidebar-logo">
    <div class="logo-icon" onclick="toggleSidebar()" title="Toggle sidebar">
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <rect x="3.5" y="2.5" width="5" height="11" rx="2.5" fill="#a3e635"/>
        <circle cx="6" cy="18.5" r="2.5" fill="#a3e635"/>
        <circle cx="18" cy="5.5" r="2.5" fill="#a3e635"/>
        <rect x="15.5" y="10.5" width="5" height="11" rx="2.5" fill="#a3e635"/>
      </svg>
    </div>
    <div class="logo-text">
      <span class="brand-name">HAULO</span>
      <span class="brand-sub">BOUTIQUE ERP</span>
    </div>
    <button class="sidebar-toggle" id="sidebarToggleBtn" onclick="toggleSidebar()" title="Collapse sidebar" aria-label="Collapse sidebar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
  </div>

  <!-- Navigation -->
  <nav class="sidebar-nav">    <!-- Dashboard -->
    <div class="nav-section">
      <a href="../dashboard/dashboard.html" class="nav-item" id="nav-dashboard" data-tooltip="Dashboard" data-module="dashboard" onclick="navNavigate('dashboard',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Dashboard</span>
      </a>
    </div>

    <!-- Front Office -->
    <div class="nav-section">
      <span class="nav-section-label">Front Office</span>
      <a href="../enquiries/enquiries.html" class="nav-item" id="nav-enquiries" data-tooltip="Enquiries" data-module="enquiries" onclick="navNavigate('enquiries',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>Enquiries</span>
      </a>
      <a href="${rootPrefix}appointments/appointments.html" class="nav-item" id="nav-appointments" data-tooltip="Appointments" data-module="appointments" onclick="navNavigate('appointments',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>Appointments</span>
      </a>
      <a href="${rootPrefix}customer/customer-overview/customer-overview.html" class="nav-item" id="nav-customers" data-tooltip="Customers" data-module="customers" onclick="navNavigate('customers',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>Customers</span>
      </a>
      <a href="${rootPrefix}orders/order-overview/order-over.html" class="nav-item" id="nav-orders" data-tooltip="Orders" data-module="orders" onclick="navNavigate('orders',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span>Orders</span>
      </a>
      <a href="${rootPrefix}payments/payments.html" class="nav-item" id="nav-payments" data-tooltip="Payments" data-module="payments" onclick="navNavigate('payments',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 8h12M6 13l7.5 8M6 13h4a4 4 0 0 0 0-8H6v13"/></svg>
        <span>Payments</span>
      </a>
    </div>

    <!-- Fashion -->
    <div class="nav-section">
      <span class="nav-section-label">Fashion</span>
      <a href="#" class="nav-item uncompleted" id="nav-garments" data-tooltip="Garments (In Progress)" data-module="garments" onclick="navNavigate('garments',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span>Garments</span>
      </a>
      <a href="../DesignStudio/design-studio.html" class="nav-item" id="nav-designs" data-tooltip="Designs" data-module="designs" onclick="navNavigate('designs',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
        <span>Designs</span>
      </a>
      <a href="${rootPrefix}Measurements/measurement-overview/measurement-overview.html" class="nav-item" id="nav-measurements" data-tooltip="Measurements" data-module="measurements" onclick="navNavigate('measurements',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 8.7l-6-6a2.12 2.12 0 0 0-3 0l-9.6 9.6a2.12 2.12 0 0 0 0 3l6 6c.8.8 2.2.8 3 0l9.6-9.6a2.12 2.12 0 0 0 0-3z"/><line x1="7.5" y1="10.5" x2="9.5" y2="8.5"/><line x1="10.5" y1="13.5" x2="12.5" y2="11.5"/><line x1="13.5" y1="16.5" x2="15.5" y2="14.5"/></svg>
        <span>Measurements</span>
      </a>
      <a href="${rootPrefix}fabrics-materials/fabrics-materials.html" class="nav-item" id="nav-fabrics" data-tooltip="Fabrics &amp; Materials" data-module="fabrics" onclick="navNavigate('fabrics',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>Fabrics &amp; Materials</span>
      </a>
      <a href="../DesignStudio/design-studio.html" class="nav-item" id="nav-collections" data-tooltip="Collections" data-module="collections" onclick="navNavigate('collections',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span>Collections</span>
      </a>
    </div>

    <!-- Production -->
    <div class="nav-section">
      <span class="nav-section-label">Production</span>
      <a href="../production/production.html" class="nav-item" id="nav-production-room" data-tooltip="Production Room" data-module="production-room" onclick="navNavigate('production-room',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        <span>Production Room</span>
      </a>
      <a href="#" class="nav-item uncompleted" id="nav-job-cards" data-tooltip="Job Cards (In Progress)" data-module="job-cards" onclick="navNavigate('job-cards',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        <span>Job Cards</span>
      </a>
      <a href="${rootPrefix}trials-alterations/trials-alterations.html" class="nav-item" id="nav-trials-alterations" data-tooltip="Trials &amp; Alterations" data-module="trials-alterations" onclick="navNavigate('trials-alterations',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
        <span>Trials &amp; Alterations</span>
      </a>
      <a href="${rootPrefix}quality-control/quality-control.html" class="nav-item" id="nav-quality-control" data-tooltip="Quality Control" data-module="quality-control" onclick="navNavigate('quality-control',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><polyline points="9 14 11 16 15 11"/></svg>
        <span>Quality Control</span>
      </a>
    </div>

    <!-- Inventory -->
    <div class="nav-section">
      <span class="nav-section-label">Inventory</span>
      <a href="${rootPrefix}inventory/inventory.html" class="nav-item" id="nav-stock" data-tooltip="Stock &amp; Materials" data-module="stock" onclick="navNavigate('stock',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        <span>Stock &amp; Materials</span>
      </a>
      <a href="${rootPrefix}purchases/purchases.html" class="nav-item" id="nav-purchases" data-tooltip="Purchases" data-module="purchases" onclick="navNavigate('purchases',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span>Purchases</span>
      </a>
      <a href="${rootPrefix}delivery/delivery.html" class="nav-item" id="nav-packages" data-tooltip="Delivery" data-module="delivery" onclick="navNavigate('delivery',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        <span>Delivery</span>
      </a>
      <a href="#" class="nav-item uncompleted" id="nav-suppliers" data-tooltip="Suppliers (In Progress)" data-module="suppliers" onclick="navNavigate('suppliers',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        <span>Suppliers</span>
      </a>
    </div>

    <!-- Business -->
    <div class="nav-section">
      <span class="nav-section-label">Business</span>
      <a href="#" class="nav-item uncompleted" id="nav-reports" data-tooltip="Reports &amp; Analytics (In Progress)" data-module="reports" onclick="navNavigate('reports',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        <span>Reports &amp; Analytics</span>
      </a>
      <a href="#" class="nav-item uncompleted" id="nav-expenses" data-tooltip="Expenses (In Progress)" data-module="expenses" onclick="navNavigate('expenses',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <span>Expenses</span>
      </a>
      <a href="#" class="nav-item uncompleted" id="nav-profitability" data-tooltip="Profitability (In Progress)" data-module="profitability" onclick="navNavigate('profitability',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        <span>Profitability</span>
      </a>
    </div>

    <!-- Communication -->
    <div class="nav-section">
      <span class="nav-section-label">Communication</span>
      <a href="#" class="nav-item uncompleted" id="nav-whatsapp" data-tooltip="WhatsApp (In Progress)" data-module="whatsapp" onclick="navNavigate('whatsapp',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        <span>WhatsApp</span>
      </a>
      <a href="#" class="nav-item uncompleted" id="nav-campaigns" data-tooltip="Campaigns (In Progress)" data-module="campaigns" onclick="navNavigate('campaigns',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        <span>Campaigns</span>
      </a>
    </div>

    <!-- Administration -->
    <div class="nav-section">
      <span class="nav-section-label">Administration</span>
      <a href="../WorkforceManagement/workforce.html" class="nav-item" id="nav-employees" data-tooltip="Employees" data-module="employees" onclick="navNavigate('employees',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Employees</span>
      </a>
      <a href="#" class="nav-item uncompleted" id="nav-branches" data-tooltip="Branches (In Progress)" data-module="branches" onclick="navNavigate('branches',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <span>Branches</span>
      </a>
      <a href="#" class="nav-item uncompleted" id="nav-users-roles" data-tooltip="Users &amp; Roles (In Progress)" data-module="users-roles" onclick="navNavigate('users-roles',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Users &amp; Roles</span>
      </a>
      <a href="#" class="nav-item uncompleted" id="nav-settings" data-tooltip="Settings (In Progress)" data-module="settings" onclick="navNavigate('settings',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M2 12h2M20 12h2M12 2v2M12 20v2"/></svg>
        <span>Settings</span>
      </a>
    </div>

  </nav>

</aside>`,

    navbar: `<!-- Top Navigation Bar -->
<header class="top-bar" id="appTopBar">
  <button class="icon-btn topbar-toggle-btn" id="topbarToggleBtn" title="Toggle Sidebar (⌘B)" aria-label="Toggle sidebar">
    <i data-lucide="panel-left" style="width:16px;height:16px;"></i>
  </button>

  <div class="search-bar" id="searchBarBtn" tabindex="0" role="button" aria-label="Open command palette search">
    <i data-lucide="search" class="search-icon"></i>
    <span class="search-ph">Search customers, orders, designs, fabrics...</span>
    <kbd class="search-kbd">⌘ K</kbd>
  </div>

  <div class="topbar-right">
    <!-- Branch Selector -->
    <div class="branch-sel" id="branchSel" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false" title="Switch Branch">
      <i data-lucide="building-2" style="width:13px;height:13px;opacity:0.75;"></i>
      <span class="branch-sel-text" id="branchSelText">Haulo Designs — Main Branch</span>
      <i data-lucide="chevron-down" class="branch-chevron" style="width:12px;height:12px;opacity:0.5;transition:transform 180ms ease;"></i>
      <div class="branch-dd dd-panel" id="branchDd">
        <div class="dd-panel-header">Active Branch</div>
        <div class="dd-item active" data-branch="Main Branch">
          <i data-lucide="check" class="branch-check" style="width:13px;height:13px;color:var(--nav-lime);flex-shrink:0;"></i>
          <span>Main Branch (Haulo Designs)</span>
        </div>
        <div class="dd-item" data-branch="Boutique Studio">
          <i data-lucide="check" class="branch-check" style="width:13px;height:13px;color:var(--nav-lime);flex-shrink:0;opacity:0;"></i>
          <span>Boutique Studio — Flagship</span>
        </div>
        <div class="dd-item" data-branch="Couture Workshop">
          <i data-lucide="check" class="branch-check" style="width:13px;height:13px;color:var(--nav-lime);flex-shrink:0;opacity:0;"></i>
          <span>Couture Workshop — Unit 2</span>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="notif-wrap" id="notifWrap">
      <button class="icon-btn" id="notifBtn" aria-label="Notifications" title="Notifications" aria-haspopup="true">
        <i data-lucide="bell" style="width:15px;height:15px;"></i>
        <span class="badge" id="notifBadge">3</span>
      </button>
      <div class="notif-panel dd-panel" id="notifPanel">
        <div class="dd-panel-header notif-panel-header">
          <span>Notifications</span>
          <button type="button" class="notif-clear-btn" id="notifClearBtn" title="Mark all as read">Mark all read</button>
        </div>
        <div class="notif-list" id="notifListContainer">
          <div class="notif-item unread" onclick="navNavigate('purchases',event)">
            <div class="notif-dot info"></div>
            <div class="notif-content">
              <div class="notif-title">PO-2026-008 Goods Received</div>
              <div class="notif-sub">Zari World consignment verified by store</div>
              <span class="notif-time">10 mins ago</span>
            </div>
          </div>
          <div class="notif-item unread" onclick="navNavigate('trials-alterations',event)">
            <div class="notif-dot warn"></div>
            <div class="notif-content">
              <div class="notif-title">Trial Scheduled: Priya Sharma</div>
              <div class="notif-sub">Bridal Lehenga final fitting at 4:30 PM</div>
              <span class="notif-time">25 mins ago</span>
            </div>
          </div>
          <div class="notif-item unread" onclick="navNavigate('fabrics',event)">
            <div class="notif-dot danger"></div>
            <div class="notif-content">
              <div class="notif-title">Low Stock Alert</div>
              <div class="notif-sub">Banarasi Brocade Gold below reorder level (4.2m)</div>
              <span class="notif-time">1 hour ago</span>
            </div>
          </div>
          <div class="notif-item read" onclick="navNavigate('orders',event)">
            <div class="notif-dot success"></div>
            <div class="notif-content">
              <div class="notif-title">Order ORD-2026-089 Ready</div>
              <div class="notif-sub">Completed QC check and ready for dispatch</div>
              <span class="notif-time">3 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User -->
    <div class="user-wrap" id="userWrap">
      <button class="user-btn" id="userBtn" aria-label="User profile menu" aria-haspopup="true">
        <img src="../assets/user_avatar.jpg" alt="Pranesh B" class="u-avatar-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/>
        <div class="u-avatar" style="display:none;">PB</div>
        <div class="u-info">
          <div class="u-name">Pranesh B</div>
          <div class="u-role">Administrator</div>
        </div>
        <i data-lucide="chevron-down" style="width:12px;height:12px;opacity:0.5;"></i>
      </button>
      <div class="user-dd dd-panel" id="userDd">
        <div class="dd-panel-header" style="display:flex;gap:10px;align-items:center;">
          <div class="u-avatar-lg">PB</div>
          <div>
            <div class="u-name" style="font-size:12px;font-weight:700;color:#fff;">Pranesh B</div>
            <div class="u-role" style="font-size:9.5px;color:rgba(255,255,255,0.5);">Administrator</div>
          </div>
        </div>
        <div class="dd-divider"></div>
        <div class="dd-item" id="navDdDashboard" onclick="navNavigate('dashboard',event)">
          <i data-lucide="layout-dashboard" style="width:13px;height:13px;margin-right:8px;"></i>
          Dashboard
        </div>
        <div class="dd-item" id="navDdSettings" onclick="navNavigate('settings',event)">
          <i data-lucide="settings" style="width:13px;height:13px;margin-right:8px;"></i>
          Settings &amp; Preferences
        </div>
        <div class="dd-divider"></div>
        <div class="dd-item" id="logoutBtn" style="color:#f87171;cursor:pointer;" onclick="(function(){sessionStorage.removeItem('erp_token');sessionStorage.removeItem('erp_user');localStorage.removeItem('erp_token');window.location.href='/front%20end/login/login.html?logout=1';})()">
          <i data-lucide="log-out" style="width:13px;height:13px;margin-right:8px;"></i>
          Logout
        </div>
      </div>
    </div>
  </div>
</header>
<div class="search-overlay" id="searchOverlay" aria-modal="true" role="dialog" aria-label="Global Search">
  <div class="search-palette">
    <div class="sp-input-row">
      <i data-lucide="search" class="sp-search-icon" style="width:18px;height:18px;"></i>
      <input type="text" id="searchInput" class="sp-input" placeholder="Search customers, orders, designs, fabrics, staff..." autocomplete="off" spellcheck="false" />
      <kbd class="sp-esc" title="Press Escape to close">ESC</kbd>
    </div>
    <div class="sp-cats">
      <button class="sp-cat active" type="button" data-cat="all">All</button>
      <button class="sp-cat" type="button" data-cat="customers">Customers</button>
      <button class="sp-cat" type="button" data-cat="orders">Orders</button>
      <button class="sp-cat" type="button" data-cat="designs">Designs</button>
      <button class="sp-cat" type="button" data-cat="purchases">Purchases</button>
      <button class="sp-cat" type="button" data-cat="fabrics">Fabrics</button>
      <button class="sp-cat" type="button" data-cat="appointments">Appointments</button>
    </div>
    <div class="sp-results" id="spResults">
      <div class="sp-section-group" data-group="recent">
        <div class="sp-label">Quick Jump &amp; Frequent Modules</div>
        <div class="sp-row" data-cat="customers" data-module="customers" onclick="navNavigate('customers',event)">
          <i data-lucide="users" class="sp-row-icon" style="width:16px;height:16px;"></i>
          <div class="sp-row-content">
            <span class="sp-row-title">Customer Directory</span>
            <span class="sp-row-sub">Search, view and manage client profiles &amp; measurements</span>
          </div>
          <span class="sp-badge">Customers</span>
        </div>
        <div class="sp-row" data-cat="orders" data-module="orders" onclick="navNavigate('orders',event)">
          <i data-lucide="clipboard-list" class="sp-row-icon" style="width:16px;height:16px;"></i>
          <div class="sp-row-content">
            <span class="sp-row-title">Orders Management</span>
            <span class="sp-row-sub">Track bespoke garment orders, stages and delivery dates</span>
          </div>
          <span class="sp-badge">Orders</span>
        </div>
        <div class="sp-row" data-cat="designs" data-module="designs" onclick="navNavigate('designs',event)">
          <i data-lucide="palette" class="sp-row-icon" style="width:16px;height:16px;"></i>
          <div class="sp-row-content">
            <span class="sp-row-title">Design Studio &amp; Library</span>
            <span class="sp-row-sub">Browse couture collections, necklines, sketches &amp; specs</span>
          </div>
          <span class="sp-badge">Designs</span>
        </div>
        <div class="sp-row" data-cat="purchases" data-module="purchases" onclick="navNavigate('purchases',event)">
          <i data-lucide="shopping-bag" class="sp-row-icon" style="width:16px;height:16px;"></i>
          <div class="sp-row-content">
            <span class="sp-row-title">Purchase &amp; Supplier Management</span>
            <span class="sp-row-sub">Purchase orders, vendors, incoming fabric consignments &amp; GRNs</span>
          </div>
          <span class="sp-badge">Procurement</span>
        </div>
        <div class="sp-row" data-cat="fabrics" data-module="fabrics" onclick="navNavigate('fabrics',event)">
          <i data-lucide="layers" class="sp-row-icon" style="width:16px;height:16px;"></i>
          <div class="sp-row-content">
            <span class="sp-row-title">Fabrics &amp; Materials Library</span>
            <span class="sp-row-sub">Silks, brocades, linings, laces, trims and material stock</span>
          </div>
          <span class="sp-badge">Inventory</span>
        </div>
        <div class="sp-row" data-cat="appointments" data-module="appointments" onclick="navNavigate('appointments',event)">
          <i data-lucide="calendar" class="sp-row-icon" style="width:16px;height:16px;"></i>
          <div class="sp-row-content">
            <span class="sp-row-title">Appointments &amp; Consultations</span>
            <span class="sp-row-sub">Client fitting schedules, designer consultations &amp; calendar</span>
          </div>
          <span class="sp-badge">Front Desk</span>
        </div>
      </div>
    </div>
    <div class="sp-footer">
      <div class="sp-footer-item"><kbd>↑</kbd> <kbd>↓</kbd> <span>Navigate</span></div>
      <div class="sp-footer-item"><kbd>↵</kbd> <span>Select</span></div>
      <div class="sp-footer-item"><kbd>ESC</kbd> <span>Close</span></div>
    </div>
  </div>
</div>`
  };

  const Nav = {
    /**
     * Loads and replaces a container with the specified fragment
     */
    async load(container, fragmentName) {
      if (!container) return false;

      let html = '';
      const url = `${basePath}${fragmentName}.html`;

      if (window.location.protocol.startsWith('http')) {
        try {
          const res = await fetch(url);
          if (res.ok) html = await res.text();
        } catch (e) {
          // Fall through to embedded template
        }
      }

      if (!html) {
        html = TEMPLATES[fragmentName] || '';
      }

      if (!html) return false;

      const wrapper = document.createElement('div');
      wrapper.innerHTML = html.trim();
      const elements = Array.from(wrapper.children);

      if (elements.length > 0) {
        const fragmentElement = elements[0];
        container.replaceWith(fragmentElement);

        // Attach any extra root elements (such as search overlay) to body
        for (let i = 1; i < elements.length; i++) {
          const existing = document.getElementById(elements[i].id);
          if (existing) {
            existing.replaceWith(elements[i]);
          } else {
            document.body.appendChild(elements[i]);
          }
        }

        this.normalizeLinks(fragmentElement);
        this.highlightActiveRoute(fragmentElement);

        if (fragmentName === 'sidebar') {
          this.setupSidebar(fragmentElement);
        } else if (fragmentName === 'navbar') {
          this.setupNavbar(fragmentElement);
        }

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons({ root: fragmentElement });
          for (let i = 1; i < elements.length; i++) {
            window.lucide.createIcons({ root: elements[i] });
          }
        }

        document.dispatchEvent(new CustomEvent('nav:fragmentLoaded', {
          detail: { fragmentName, element: fragmentElement }
        }));

        return true;
      }

      return false;
    },

    /**
     * Normalizes href links for subdirectories vs root
     */
    normalizeLinks(element) {
      const prefix = calculatePrefix();
      const path = window.location.pathname.toLowerCase().replace(/\\/g, '/');
      const isMeasurements = path.includes('/measurements') || path.includes('/measurement360');
      const isCustomer360 = path.includes('/customer360');

      const dashLink = element.querySelector('a[title="Dashboard"]');
      const measLink = element.querySelector('a[title="Measurements"]');
      const custLink = element.querySelector('a[title="Customers"]');
      const orderLink = element.querySelector('a[title="Orders"]');
      const prodLink = element.querySelector('a[title="Production Floor"], a[title="Production"]');
      const trialLink = element.querySelector('a[title="Trials & Alterations"], #nav-trials-alterations, [data-module="trials-alterations"]');
      const qcLink = element.querySelector('a[title="Quality Control"], #nav-quality-control, [data-module="quality-control"]');
      const deliveryLink = element.querySelector('a[title="Dispatch / Delivery"], a[title="Dispatch"], a[title="Delivery"]');

      if (dashLink) {
        dashLink.setAttribute('href', `${prefix}dashboard/dashboard.html`);
      }
      if (measLink) {
        measLink.setAttribute('href', `${prefix}Measurements/measurement-overview/measurement-overview.html`);
      }
      if (custLink) {
        custLink.setAttribute('href', `${prefix}customer/customer-overview/customer-overview.html`);
      }
      const designsLink = element.querySelector('a[title="Designs"]');
      if (designsLink) {
        designsLink.setAttribute('href', `${prefix}DesignStudio/design-studio.html`);
      }
      const fabricsLink = element.querySelector('a[title="Fabrics & Materials"], #nav-fabrics');
      if (fabricsLink) {
        fabricsLink.setAttribute('href', `${prefix}fabrics-materials/fabrics-materials.html`);
      }
      if (orderLink) {
        orderLink.setAttribute('href', `${prefix}orders/order-overview/order-over.html`);
      }
      if (prodLink) {
        prodLink.setAttribute('href', `${prefix}production/production.html`);
      }
      if (trialLink) {
        trialLink.setAttribute('href', `${prefix}trials-alterations/trials-alterations.html`);
      }
      if (qcLink) {
        qcLink.setAttribute('href', `${prefix}quality-control/quality-control.html`);
      }
      let delLink = element.querySelector('a[title="Dispatch / Delivery"], a[title="Dispatch"], a[title="Delivery"], #nav-packages, [data-module="delivery"], [data-module="packages"]');
      if (delLink) {
        delLink.setAttribute('href', `${prefix}delivery/delivery.html`);
      }
      const paymentsLink = element.querySelector('a[title="Payments"], #nav-payments, [data-module="payments"]');
      if (paymentsLink) {
        paymentsLink.setAttribute('href', `${prefix}payments/payments.html`);
      }
      const appointmentsLink = element.querySelector('a[title="Appointments"], #nav-appointments');
      if (appointmentsLink) {
        appointmentsLink.setAttribute('href', `${prefix}appointments/appointments.html`);
      }
      const inventoryLink = element.querySelector('a[title="Inventory"], a[title="Stock & Materials"], #nav-stock');
      if (inventoryLink) {
        inventoryLink.setAttribute('href', `${prefix}inventory/inventory.html`);
      }
      let purchasesLink = element.querySelector('a[title="Purchases"], a[title="Procurement"], #nav-purchases');
      if (purchasesLink) {
        purchasesLink.setAttribute('href', `${prefix}purchases/purchases.html`);
      } else if (inventoryLink && inventoryLink.parentNode) {
        const pLink = document.createElement('a');
        pLink.href = `${prefix}purchases/purchases.html`;
        pLink.className = 'nav-item';
        pLink.id = 'nav-purchases';
        pLink.setAttribute('data-tooltip', 'Purchases');
        pLink.setAttribute('data-module', 'purchases');
        pLink.setAttribute('onclick', "navNavigate('purchases',event)");
        pLink.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><span>Purchases</span>`;
        inventoryLink.parentNode.insertBefore(pLink, inventoryLink.nextSibling);
      }
      const employeesLink = element.querySelector('a[title="Employees"]');
      if (employeesLink) {
        employeesLink.setAttribute('href', `${prefix}WorkforceManagement/workforce.html`);
      }

      // Tag all uncompleted / WIP items
      const uncompletedMods = ['garments', 'job-cards', 'suppliers', 'reports', 'expenses', 'profitability', 'whatsapp', 'campaigns', 'branches', 'users-roles', 'settings'];
      element.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        const mod = item.getAttribute('data-module');
        const isUncompleted = href === '#' || href === '' || item.classList.contains('uncompleted') || uncompletedMods.includes(mod);
        if (isUncompleted) {
          item.classList.add('uncompleted');
          const tt = item.getAttribute('data-tooltip');
          if (tt && !tt.includes('In Progress')) {
            item.setAttribute('data-tooltip', `${tt} (In Progress)`);
          }
        }
      });
    },

    /**
     * Highlights active navigation item based on route
     */
    highlightActiveRoute(element) {
      const path = window.location.pathname.toLowerCase().replace(/\\/g, '/');
      const isMeasurements = path.includes('/measurements') || path.includes('/measurement360');
      const isCustomer360 = path.includes('/customer');
      const isOrders = path.includes('order');
      const isTrials = path.includes('trial');
      const isQc = path.includes('quality') || path.includes('qc');
      const isDelivery = path.includes('delivery') || path.includes('dispatch');
      const isFinance = path.includes('finance') || path.includes('payment') || path.includes('receivable');
      const isAppointments = path.includes('/appointments') || path.includes('/calendar');
      const isPurchases = path.includes('purchase');
      const isProcurement = path.includes('procurement') || path.includes('supplier');
      const isInventory = path.includes('inventory') || path.includes('stock');
      const isFabrics = path.includes('fabric');
      const isProduction = path.includes('production');
      const isDesigns = path.includes('designstudio') || path.includes('design-studio') || (path.includes('design') && !path.includes('order'));
      const isWorkforce = path.includes('workforce') || path.includes('employee');
      const links = element.querySelectorAll('.nav-item');

      links.forEach(link => {
        const title = link.getAttribute('title');
        if (isAppointments) {
          link.classList.toggle('active', title === 'Appointments' || link.id === 'nav-appointments' || link.getAttribute('data-module') === 'appointments');
        } else if (isPurchases) {
          link.classList.toggle('active', title === 'Purchases' || link.id === 'nav-purchases' || link.getAttribute('data-module') === 'purchases');
        } else if (isFabrics) {
          link.classList.toggle('active', title === 'Fabrics & Materials' || link.id === 'nav-fabrics' || link.getAttribute('data-module') === 'fabrics');
        } else if (isWorkforce) {
          link.classList.toggle('active', title === 'Employees');
        } else if (isProcurement) {
          link.classList.toggle('active', title === 'Purchases');
        } else if (isInventory) {
          link.classList.toggle('active', title === 'Inventory' || title === 'Stock & Materials');
        } else if (isFinance) {
          link.classList.toggle('active', title === 'Payments' || link.id === 'nav-payments' || link.getAttribute('data-module') === 'payments');
        } else if (isDelivery) {
          link.classList.toggle('active', title === 'Dispatch / Delivery' || title === 'Dispatch' || title === 'Delivery' || title === 'Packages' || link.id === 'nav-packages' || link.id === 'nav-delivery' || link.getAttribute('data-module') === 'delivery' || link.getAttribute('data-module') === 'packages');
        } else if (isQc) {
          link.classList.toggle('active', title === 'Quality Control');
        } else if (isTrials) {
          link.classList.toggle('active', title === 'Trials & Alterations' || link.id === 'nav-trials-alterations' || link.getAttribute('data-module') === 'trials-alterations');
        } else if (isProduction) {
          link.classList.toggle('active', title === 'Production Floor' || title === 'Production');
        } else if (isDesigns) {
          link.classList.toggle('active', title === 'Designs');
        } else if (isOrders) {
          link.classList.toggle('active', title === 'Orders' || link.id === 'nav-orders' || link.getAttribute('data-module') === 'orders');
        } else if (isCustomer360) {
          link.classList.toggle('active', title === 'Customers' || link.id === 'nav-customers' || link.getAttribute('data-module') === 'customers');
        } else if (isMeasurements) {
          link.classList.toggle('active', title === 'Measurements' || link.id === 'nav-measurements' || link.getAttribute('data-module') === 'measurements');
        } else {
          link.classList.toggle('active', title === 'Dashboard');
        }
      });
    },

    /**
     * Powers sidebar collapse/expand, keyboard shortcut (âŒ˜B), and state persistence
     */
    setupSidebar(sidebar) {
      const toggleBtn = sidebar.querySelector('#sidebarToggleBtn');
      const brandLogo = sidebar.querySelector('#sidebarBrandLogo');
      const topToggle = document.getElementById('topbarToggleBtn');

      function toggle(forceState) {
        if (window._toggleSidebarBusy) return;
        window._toggleSidebarBusy = true;
        setTimeout(() => { window._toggleSidebarBusy = false; }, 250);

        const isCollapsed = sidebar.classList.contains('collapsed');
        const shouldCollapse = forceState !== undefined ? forceState : !isCollapsed;

        sidebar.classList.toggle('collapsed', shouldCollapse);
        try {
          localStorage.setItem('fashion_sidebar_collapsed', shouldCollapse ? '1' : '0');
          localStorage.setItem('sidebarCollapsed', shouldCollapse ? '1' : '0');
          localStorage.setItem('ritham_sidebar_collapsed', shouldCollapse ? '1' : '0');
        } catch (_) {}

        const btn = document.getElementById('sidebarToggleBtn');
        if (btn) {
          const label = shouldCollapse ? 'Expand sidebar' : 'Collapse sidebar';
          btn.title = label;
          btn.setAttribute('aria-label', label);
        }

        const currentTopToggle = document.getElementById('topbarToggleBtn');
        if (currentTopToggle) {
          const label = shouldCollapse ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)';
          currentTopToggle.setAttribute('title', label);
          currentTopToggle.setAttribute('aria-label', label);
        }

        window.dispatchEvent(new Event('resize'));
      }

      // Restore saved state
      if (localStorage.getItem('fashion_sidebar_collapsed') === '1' || localStorage.getItem('sidebarCollapsed') === '1' || localStorage.getItem('ritham_sidebar_collapsed') === '1') {
        sidebar.classList.add('collapsed');
        if (topToggle) {
          topToggle.setAttribute('title', 'Expand sidebar (⌘B)');
          topToggle.setAttribute('aria-label', 'Expand sidebar (⌘B)');
        }
        if (toggleBtn) {
          toggleBtn.setAttribute('title', 'Expand sidebar');
          toggleBtn.setAttribute('aria-label', 'Expand sidebar');
        }
      }

      if (toggleBtn) {
        toggleBtn.removeAttribute('onclick');
        toggleBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggle(); };
      }
      if (brandLogo) {
        brandLogo.removeAttribute('onclick');
        brandLogo.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggle(); };
      }
      if (topToggle) {
        topToggle.removeAttribute('onclick');
        topToggle.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggle(); };
      }

      // Nav item selection for non-links
      sidebar.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
          if (item.tagName === 'A') return;
          sidebar.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        });
      });

      // Global shortcuts: ⌘B (sidebar), ⌘K (search), ESC (close modals & dropdowns)
      document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
          e.preventDefault();
          toggle();
        }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          if (window._openSearch) window._openSearch();
        }
        if (e.key === 'Escape') {
          if (window._closeSearch) window._closeSearch();
          if (window._closeAllNavDropdowns) window._closeAllNavDropdowns();
        }
      });

      window._toggleSidebar = toggle;
    },

    /**
     * Powers topbar dropdowns, search trigger, and theme switcher
     */
    setupNavbar(navbar) {
      // ── closeAllDropdowns — declared first so all event listeners below can call it ──
      function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-panel, .dd-panel').forEach(p => {
          p.classList.remove('open');
          p.classList.remove('show');
        });
        const b = document.getElementById('branchSel');
        if (b) {
          b.classList.remove('active');
          b.setAttribute('aria-expanded', 'false');
        }
      }
      window._closeAllNavDropdowns = closeAllDropdowns;

      const topToggle = navbar.querySelector('#topbarToggleBtn') || document.getElementById('topbarToggleBtn');
      if (topToggle) {
        topToggle.removeAttribute('onclick');
        topToggle.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (window._toggleSidebar) window._toggleSidebar();
          else if (typeof window.toggleSidebar === 'function') window.toggleSidebar();
        };
      }

      // Dynamic Avatar resolution
      const avatarImg = navbar.querySelector('.u-avatar-img');
      if (avatarImg) {
        avatarImg.src = `${rootPrefix}assets/user_avatar.jpg`;
      }

      // Search bar trigger & overlay management
      const searchBar = navbar.querySelector('#searchBarBtn');
      function openSearch() {
        const overlay = document.getElementById('searchOverlay');
        const input = document.getElementById('searchInput');
        if (overlay) {
          overlay.classList.add('open');
          setTimeout(() => {
            if (input) {
              input.value = '';
              input.focus();
              filterSearchResults();
            }
          }, 80);
        }
      }

      function closeSearch() {
        const overlay = document.getElementById('searchOverlay');
        if (overlay) overlay.classList.remove('open');
      }

      function filterSearchResults() {
        const input = document.getElementById('searchInput');
        const query = (input ? input.value : '').toLowerCase().trim();
        const activeCatBtn = document.querySelector('.sp-cat.active');
        const cat = activeCatBtn ? (activeCatBtn.getAttribute('data-cat') || 'all').toLowerCase() : 'all';

        let firstVisible = null;
        document.querySelectorAll('.sp-row').forEach(row => {
          const rowCat = (row.getAttribute('data-cat') || '').toLowerCase();
          const title = (row.querySelector('.sp-row-title')?.textContent || '').toLowerCase();
          const sub = (row.querySelector('.sp-row-sub')?.textContent || '').toLowerCase();
          const text = (title + ' ' + sub).toLowerCase();
          
          const matchesCat = (cat === 'all' || rowCat === cat);
          const matchesQuery = (!query || text.includes(query) || rowCat.includes(query));
          const visible = matchesCat && matchesQuery;
          row.style.display = visible ? 'flex' : 'none';
          if (visible && !firstVisible) firstVisible = row;
        });

        document.querySelectorAll('.sp-row').forEach(r => r.classList.remove('selected'));
        if (firstVisible) firstVisible.classList.add('selected');
      }

      if (searchBar) {
        searchBar.addEventListener('click', openSearch);
      }

      // Search input typing & keyboard navigation (Arrows + Enter)
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('input', filterSearchResults);
        searchInput.addEventListener('keydown', (e) => {
          const visibleRows = Array.from(document.querySelectorAll('.sp-row')).filter(r => r.style.display !== 'none');
          if (!visibleRows.length) return;
          let currentIndex = visibleRows.findIndex(r => r.classList.contains('selected'));
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % visibleRows.length;
            visibleRows.forEach(r => r.classList.remove('selected'));
            visibleRows[nextIndex].classList.add('selected');
            visibleRows[nextIndex].scrollIntoView({ block: 'nearest' });
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + visibleRows.length) % visibleRows.length;
            visibleRows.forEach(r => r.classList.remove('selected'));
            visibleRows[prevIndex].classList.add('selected');
            visibleRows[prevIndex].scrollIntoView({ block: 'nearest' });
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const target = currentIndex >= 0 ? visibleRows[currentIndex] : visibleRows[0];
            if (target) {
              closeSearch();
              target.click();
            }
          }
        });
      }

      // Delegate events on search overlay once in DOM
      document.addEventListener('click', (e) => {
        const overlay = document.getElementById('searchOverlay');
        if (overlay && overlay.classList.contains('open')) {
          if (e.target === overlay || e.target.closest('.sp-esc')) {
            closeSearch();
          }
        }
      });

      document.querySelectorAll('.sp-cat').forEach(b => {
        b.addEventListener('click', () => {
          document.querySelectorAll('.sp-cat').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          filterSearchResults();
        });
      });

      window._openSearch = openSearch;
      window._closeSearch = closeSearch;

      // Branch Selector with Persistence
      const branchSel = navbar.querySelector('#branchSel');
      const branchDd = navbar.querySelector('#branchDd');
      if (branchSel && branchDd) {
        const savedBranch = localStorage.getItem('haulo_active_branch') || 'Main Branch';
        const selText = branchSel.querySelector('.branch-sel-text, #branchSelText');
        if (selText) selText.textContent = `Haulo Designs — ${savedBranch}`;

        branchDd.querySelectorAll('.dd-item').forEach(i => {
          const bName = i.getAttribute('data-branch') || '';
          const isAct = bName === savedBranch;
          i.classList.toggle('active', isAct);
          const chk = i.querySelector('.branch-check');
          if (chk) chk.style.opacity = isAct ? '1' : '0';
        });

        branchSel.addEventListener('click', (e) => {
          if (e.target.closest('#branchDd')) return;
          e.stopPropagation();
          const isOpen = branchDd.classList.contains('open');
          closeAllDropdowns();
          if (!isOpen) {
            branchDd.classList.add('open');
            branchSel.classList.add('active');
            branchSel.setAttribute('aria-expanded', 'true');
          }
        });

        branchDd.querySelectorAll('.dd-item').forEach(item => {
          item.addEventListener('click', (e) => {
            e.stopPropagation();
            branchDd.querySelectorAll('.dd-item').forEach(i => {
              i.classList.remove('active');
              const chk = i.querySelector('.branch-check');
              if (chk) chk.style.opacity = '0';
            });
            item.classList.add('active');
            const chk = item.querySelector('.branch-check');
            if (chk) {
              chk.style.opacity = '1';
              chk.style.color = 'var(--nav-lime)';
            }
            const branchName = item.getAttribute('data-branch') || item.querySelector('span')?.textContent || item.textContent.trim();
            try { localStorage.setItem('haulo_active_branch', branchName); } catch (_) {}
            if (selText) selText.textContent = `Haulo Designs — ${branchName}`;
            closeAllDropdowns();
          });
        });
      }

      // Notification Dropdown & Clear All Read
      const notifBtn = navbar.querySelector('#notifBtn');
      const notifPanel = navbar.querySelector('#notifPanel');
      const notifClearBtn = navbar.querySelector('#notifClearBtn');
      const notifBadge = navbar.querySelector('#notifBadge');

      if (localStorage.getItem('haulo_notifs_read') === 'true' && notifBadge) {
        notifBadge.style.display = 'none';
        navbar.querySelectorAll('.notif-item').forEach(item => item.classList.remove('unread'));
      }

      if (notifClearBtn) {
        notifClearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (notifBadge) {
            notifBadge.textContent = '0';
            notifBadge.style.display = 'none';
          }
          navbar.querySelectorAll('.notif-item').forEach(item => item.classList.remove('unread'));
          try { localStorage.setItem('haulo_notifs_read', 'true'); } catch (_) {}
        });
      }

      if (notifBtn && notifPanel) {
        notifBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = notifPanel.classList.contains('open');
          closeAllDropdowns();
          if (!isOpen) notifPanel.classList.add('open');
        });
      }

      // User Profile Dropdown
      const userBtn = navbar.querySelector('#userBtn');
      const userDd = navbar.querySelector('#userDd');
      if (userBtn && userDd) {
        // Populate real user info from session storage
        const storedUser = (() => {
          try {
            const u = sessionStorage.getItem('erp_user');
            return u ? JSON.parse(u) : null;
          } catch { return null; }
        })();

        if (storedUser) {
          const displayName = storedUser.fullName || storedUser.username || 'User';
          const displayRole = storedUser.role
            ? storedUser.role.replace('ROLE_', '').replace(/_/g, ' ')
            : 'Staff';

          // Update avatar initials
          const avatarDiv = userBtn.querySelector('.u-avatar');
          if (avatarDiv) {
            const parts = displayName.trim().split(' ');
            avatarDiv.textContent = parts.length >= 2
              ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
              : displayName.substring(0, 2).toUpperCase();
          }

          // Update name and role in button
          const uName = userBtn.querySelector('.u-name');
          const uRole = userBtn.querySelector('.u-role');
          if (uName) uName.textContent = displayName;
          if (uRole) uRole.textContent = displayRole;

          // Update name and role in dropdown header
          const ddHeader = userDd.querySelector('.dd-panel-header');
          if (ddHeader) {
            const hn = ddHeader.querySelector('.u-name');
            const hr = ddHeader.querySelector('.u-role');
            if (hn) hn.textContent = displayName;
            if (hr) hr.textContent = displayRole;
          }
        }

        userBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = userDd.classList.contains('open');
          closeAllDropdowns();
          if (!isOpen) userDd.classList.add('open');
        });

        // Wire up the Logout item
        const logoutItem = userDd.querySelector('.dd-item[style*="f87171"], .dd-item[style*="color:#f87171"]');
        if (logoutItem) {
          logoutItem.style.cursor = 'pointer';
          logoutItem.addEventListener('click', (e) => {
            e.stopPropagation();
            // Clear all auth tokens
            sessionStorage.removeItem('erp_token');
            sessionStorage.removeItem('erp_user');
            localStorage.removeItem('erp_token');
            // Redirect to login with logout flag so the page doesn't auto-redirect back
            window.location.href = '/front%20end/login/login.html?logout=1';
          });
        }
      }


      // Theme Toggle
      const themeToggleBtn = navbar.querySelector('#themeToggleBtn');
      const themeIcon = navbar.querySelector('#themeIcon');
      if (themeToggleBtn) {
        function applyTheme(isDark) {
          document.body.classList.toggle('dark-theme', isDark);
          localStorage.setItem('fashion_erp_theme', isDark ? 'dark' : 'light');
          if (themeIcon) {
            themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
            if (window.lucide) lucide.createIcons({ root: themeToggleBtn });
          }
          document.dispatchEvent(new CustomEvent('fashion:themeChanged', { detail: { isDark } }));
        }

        if (localStorage.getItem('fashion_erp_theme') === 'dark') {
          applyTheme(true);
        }

        themeToggleBtn.addEventListener('click', () => {
          const isDark = document.body.classList.contains('dark-theme');
          applyTheme(!isDark);
        });
      }

      document.addEventListener('click', (e) => {
        if (!e.target.closest('#branchSel') &&
            !e.target.closest('#notifWrap') &&
            !e.target.closest('#userWrap')) {
          closeAllDropdowns();
        }
      });
    },

    /**
     * Initializes all navigation placeholders
     */
    async init() {
      ensureNavCss();

      const placeholders = Array.from(document.querySelectorAll('[data-fragment="sidebar"], [data-fragment="navbar"], #sidebarSlot, #navbarSlot'));
      if (!placeholders.length) return;

      for (const el of placeholders) {
        // Skip if already loaded
        if (el.innerHTML && el.innerHTML.trim() !== '' && !el.getAttribute('data-fragment')) continue;
        const name = el.getAttribute('data-fragment') || (el.id === 'sidebarSlot' ? 'sidebar' : el.id === 'navbarSlot' ? 'navbar' : '');
        if (name) {
          await this.load(el, name);
        }
      }

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }

      document.dispatchEvent(new CustomEvent('nav:ready'));
    }
  };

  // Expose globally as Nav and FragmentsLoader
  window.Nav = Nav;
  window.FragmentsLoader = Nav;

  window.toggleSidebar = function(forceState) {
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
      localStorage.setItem('ritham_sidebar_collapsed', shouldCollapse ? '1' : '0');
    } catch (_) {}
    window.dispatchEvent(new Event('resize'));
  };

  window.navNavigate = function(module, event) {
    if (event) event.preventDefault();
    const prefix = calculatePrefix();
    const moduleMap = {
      'dashboard':          `${prefix}dashboard/dashboard.html`,
      'enquiries':          `${prefix}enquiries/enquiries.html`,
      'appointments':       `${prefix}appointments/appointments.html`,
      'customers':          `${prefix}customer/customer-overview/customer-overview.html`,
      'orders':             `${prefix}orders/order-overview/order-over.html`,
      'payments':           `${prefix}payments/payments.html`,
      'garments':           null,
      'designs':            `${prefix}DesignStudio/design-studio.html`,
      'design-studio':      `${prefix}DesignStudio/design-studio.html`,
      'measurements':          `${prefix}Measurements/measurement-overview/measurement-overview.html`,
      'measurement-overview':  `${prefix}Measurements/measurement-overview/measurement-overview.html`,
      'measurement360':        `${prefix}Measurements/measurement360/measurement360.html`,
      'fabrics':            `${prefix}fabrics-materials/fabrics-materials.html`,
      'collections':        `${prefix}DesignStudio/design-studio.html`,
      'production-room':    `${prefix}production/production.html`,
      'production-floor':   `${prefix}production/production.html`,
      'job-cards':          null,
      'trials-alterations': `${prefix}trials-alterations/trials-alterations.html`,
      'quality-control':    `${prefix}quality-control/quality-control.html`,
      'stock':              `${prefix}inventory/inventory.html`,
      'packages':           `${prefix}delivery/delivery.html`,
      'delivery':           `${prefix}delivery/delivery.html`,
      'purchases':          `${prefix}purchases/purchases.html`,
      'suppliers':          null,
      'reports':            null,
      'expenses':           null,
      'profitability':      null,
      'whatsapp':           null,
      'campaigns':          null,
      'employees':          `${prefix}WorkforceManagement/workforce.html`,
      'branches':           null,
      'users-roles':        null,
      'settings':           null,
    };

    const labelMap = {
      'dashboard':          'Dashboard',
      'enquiries':          'Enquiries',
      'appointments':       'Appointments',
      'customers':          'Customers',
      'orders':             'Orders',
      'payments':           'Payments',
      'garments':           'Garments',
      'designs':            'Designs',
      'design-studio':      'Design Studio',
      'measurements':          'Measurements',
      'measurement-overview':  'Measurement Directory',
      'measurement360':        'Measurement 360',
      'fabrics':            'Fabrics & Materials',
      'collections':        'Collections',
      'production-room':    'Production Room',
      'job-cards':          'Job Cards',
      'trials-alterations': 'Trials & Alterations',
      'quality-control':    'Quality Control',
      'stock':              'Stock & Materials',
      'packages':           'Packages',
      'purchases':          'Purchases',
      'suppliers':          'Suppliers',
      'reports':            'Reports & Analytics',
      'expenses':           'Expenses',
      'profitability':      'Profitability',
      'whatsapp':           'WhatsApp',
      'campaigns':          'Campaigns',
      'employees':          'Employees',
      'branches':           'Branches',
      'users-roles':        'Users & Roles',
      'settings':           'Settings'
    };

    const url = moduleMap[module];
    if (url && url !== '#') {
      window.location.href = url;
    } else {
      const title = labelMap[module] || module.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const msg = `${title} â€” This page is in process`;
      if (typeof showToast === 'function') {
        showToast(msg, 'info');
      } else {
        const toast = document.createElement('div');
        toast.textContent = msg;
        toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(36,28,24,0.96);color:#38bdf8;padding:10px 20px;border-radius:20px;font-size:12px;font-weight:600;z-index:99999;box-shadow:0 12px 36px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.18);border-left:4px solid #38bdf8;font-family:\'Plus Jakarta Sans\',sans-serif;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2600);
      }
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Nav.init());
  } else {
    Nav.init();
  }
})();
