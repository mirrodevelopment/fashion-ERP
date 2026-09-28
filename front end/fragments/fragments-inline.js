/* ============================================================
   FASHION ERP â€” Fragments Inline Bundle
   Path: front end/fragments/fragments-inline.js

   Contains the HTML content of all fragment files as JS template
   literals. This works with file:// protocol (no fetch needed).
   fragments.js uses this as its primary injection source.
   ============================================================ */

window.FRAGMENT_HTML = {

  sidebar: `<aside class="sidebar" id="appSidebar">

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
  <nav class="sidebar-nav">

    <!-- Dashboard -->
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
      <a href="../appointments/appointments.html" class="nav-item" id="nav-appointments" data-tooltip="Appointments" data-module="appointments" onclick="navNavigate('appointments',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>Appointments</span>
      </a>
      <a href="../customer/customer-overview/customer-overview.html" class="nav-item" id="nav-customers" data-tooltip="Customers" data-module="customers" onclick="navNavigate('customers',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>Customers</span>
      </a>
      <a href="../orders/order-overview/order-over.html" class="nav-item" id="nav-orders" data-tooltip="Orders" data-module="orders" onclick="navNavigate('orders',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span>Orders</span>
      </a>
      <a href="../payments/payments.html" class="nav-item" id="nav-payments" data-tooltip="Payments" data-module="payments" onclick="navNavigate('payments',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 8h12M6 13l7.5 8M6 13h4a4 4 0 0 0 0-8H6v13"/></svg>
        <span>Payments</span>
      </a>
    </div>

    <!-- Fashion -->
    <div class="nav-section">
      <span class="nav-section-label">Fashion</span>
      <a href="../garments/garments.html" class="nav-item" id="nav-garments" data-tooltip="Garments" data-module="garments" onclick="navNavigate('garments',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span>Garments</span>
      </a>
      <a href="../DesignStudio/design-studio.html" class="nav-item" id="nav-designs" data-tooltip="Designs" data-module="designs" onclick="navNavigate('designs',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
        <span>Designs</span>
      </a>
      <a href="../Measurements/measurement-overview/measurement-overview.html" class="nav-item" id="nav-measurements" data-tooltip="Measurements" data-module="measurements" onclick="navNavigate('measurements',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 8.7l-6-6a2.12 2.12 0 0 0-3 0l-9.6 9.6a2.12 2.12 0 0 0 0 3l6 6c.8.8 2.2.8 3 0l9.6-9.6a2.12 2.12 0 0 0 0-3z"/><line x1="7.5" y1="10.5" x2="9.5" y2="8.5"/><line x1="10.5" y1="13.5" x2="12.5" y2="11.5"/><line x1="13.5" y1="16.5" x2="15.5" y2="14.5"/></svg>
        <span>Measurements</span>
      </a>
      <a href="../fabrics-materials/fabrics-materials.html" class="nav-item" id="nav-fabrics" data-tooltip="Fabrics &amp; Materials" data-module="fabrics" onclick="navNavigate('fabrics',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>Fabrics &amp; Materials</span>
      </a>
      <a href="../collections/collections.html" class="nav-item" id="nav-collections" data-tooltip="Collections" data-module="collections" onclick="navNavigate('collections',event)">
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
      <a href="../trials-alterations/trials-alterations.html" class="nav-item" id="nav-trials-alterations" data-tooltip="Trials &amp; Alterations" data-module="trials-alterations" onclick="navNavigate('trials-alterations',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
        <span>Trials &amp; Alterations</span>
      </a>
      <a href="../quality-control/quality-control.html" class="nav-item" id="nav-quality-control" data-tooltip="Quality Control" data-module="quality-control" onclick="navNavigate('quality-control',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><polyline points="9 14 11 16 15 11"/></svg>
        <span>Quality Control</span>
      </a>
    </div>

    <!-- Inventory -->
    <div class="nav-section">
      <span class="nav-section-label">Inventory</span>
      <a href="../inventory/inventory.html" class="nav-item" id="nav-stock" data-tooltip="Stock &amp; Materials" data-module="stock" onclick="navNavigate('stock',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        <span>Stock &amp; Materials</span>
      </a>
      <a href="../purchases/purchases.html" class="nav-item" id="nav-purchases" data-tooltip="Purchases" data-module="purchases" onclick="navNavigate('purchases',event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span>Purchases</span>
      </a>
      <a href="../delivery/delivery.html" class="nav-item" id="nav-packages" data-tooltip="Delivery" data-module="delivery" onclick="navNavigate('delivery',event)">
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

  navbar: `<header class="top-bar" id="appTopBar">
  <!-- Left: Sidebar Toggle Button -->
  <button class="icon-btn topbar-toggle-btn" id="topbarToggleBtn" title="Toggle Sidebar (⌘B)" aria-label="Toggle sidebar" onclick="toggleSidebar()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
  </button>

  <!-- Center-Left: Global Quick Search Bar Trigger -->
  <div class="search-bar" id="searchBarBtn" tabindex="0" role="button" aria-label="Open command palette search">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <span class="search-ph">Search customers, orders, designs, fabrics...</span>
    <kbd class="search-kbd">&#8984; K</kbd>
  </div>

  <!-- Right: Actions & Profile -->
  <div class="topbar-right">
    <!-- Branch Selector Dropdown -->
    <div class="branch-sel" id="branchSel" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false" title="Switch Branch">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;opacity:0.75;"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      <span class="branch-sel-text" id="branchSelText">Haulo Designs &mdash; Main Branch</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="branch-chevron" style="width:11px;height:11px;opacity:0.6;"><polyline points="6 9 12 15 18 9"/></svg>
      <div class="branch-dd dd-panel" id="branchDd">
        <div class="dd-panel-header">Active Branch</div>
        <div class="dd-item active" data-branch="Main Branch">
          <svg viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="branch-check" style="width:13px;height:13px;flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Main Branch (Haulo Designs)</span>
        </div>
        <div class="dd-item" data-branch="Boutique Studio">
          <svg viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="branch-check" style="width:13px;height:13px;flex-shrink:0;opacity:0;"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Boutique Studio &mdash; Flagship</span>
        </div>
        <div class="dd-item" data-branch="Couture Workshop">
          <svg viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="branch-check" style="width:13px;height:13px;flex-shrink:0;opacity:0;"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Couture Workshop &mdash; Unit 2</span>
        </div>
      </div>
    </div>

    <!-- Theme Toggle (Classic & Haulo Dark) -->
    <button class="icon-btn haulo-theme-btn" id="hauloThemeToggleBtn" data-haulo-theme-btn aria-label="Switch Theme" title="Switch Theme" onclick="if(window.HauloTheme)window.HauloTheme.toggle();" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.07);cursor:pointer;color:var(--text-secondary);transition:all 0.18s ease;flex-shrink:0;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>

    <!-- Notifications Menu -->
    <div class="notif-wrap" id="notifWrap">
      <button class="icon-btn" id="notifBtn" aria-label="Notifications" title="Notifications" aria-haspopup="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span class="badge" id="notifBadge" style="display:none;">0</span>
      </button>
      <div class="notif-panel dd-panel" id="notifPanel">
        <!-- Dynamically rendered by NotificationCenter -->
      </div>
    </div>

    <!-- User Profile Dropdown -->
    <div class="user-wrap" id="userWrap">
      <button class="user-btn" id="userBtn" aria-label="User profile menu" aria-haspopup="true">
        <img src="../assets/user_avatar.jpg" alt="Pranesh B" class="u-avatar-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/>
        <div class="u-avatar" style="display:none;">PB</div>
        <div class="u-info">
          <div class="u-name">Pranesh B</div>
          <div class="u-role">Administrator</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="user-chevron" style="width:11px;height:11px;opacity:0.5;"><polyline points="6 9 12 15 18 9"/></svg>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;margin-right:8px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </div>
        <div class="dd-item" id="navDdSettings" onclick="navNavigate('settings',event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;margin-right:8px;"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
          Settings &amp; Preferences
        </div>
        <div class="dd-divider"></div>
        <div class="dd-item" id="logoutBtn" style="color:#f87171;cursor:pointer;" onclick="(function(){sessionStorage.removeItem('erp_token');sessionStorage.removeItem('erp_user');localStorage.removeItem('erp_token');window.location.href='/front%20end/login/login.html?logout=1';})()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;margin-right:8px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </div>
      </div>
    </div>
  </div>
</header>
<div class="search-overlay" id="searchOverlay" aria-modal="true" role="dialog" aria-label="Global Search">
  <div class="search-palette">
    <div class="sp-input-row">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sp-search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sp-row-icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <div class="sp-row-content">
            <span class="sp-row-title">Customer Directory</span>
            <span class="sp-row-sub">Search, view and manage client profiles &amp; measurements</span>
          </div>
          <span class="sp-badge">Customers</span>
        </div>
        <div class="sp-row" data-cat="orders" data-module="orders" onclick="navNavigate('orders',event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sp-row-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <div class="sp-row-content">
            <span class="sp-row-title">Orders Management</span>
            <span class="sp-row-sub">Track bespoke garment orders, stages and delivery dates</span>
          </div>
          <span class="sp-badge">Orders</span>
        </div>
        <div class="sp-row" data-cat="designs" data-module="designs" onclick="navNavigate('designs',event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sp-row-icon"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
          <div class="sp-row-content">
            <span class="sp-row-title">Design Studio &amp; Library</span>
            <span class="sp-row-sub">Browse couture collections, necklines, sketches &amp; specs</span>
          </div>
          <span class="sp-badge">Designs</span>
        </div>
        <div class="sp-row" data-cat="purchases" data-module="purchases" onclick="navNavigate('purchases',event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sp-row-icon"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <div class="sp-row-content">
            <span class="sp-row-title">Purchase &amp; Supplier Management</span>
            <span class="sp-row-sub">Purchase orders, vendors, incoming fabric consignments &amp; GRNs</span>
          </div>
          <span class="sp-badge">Procurement</span>
        </div>
        <div class="sp-row" data-cat="fabrics" data-module="fabrics" onclick="navNavigate('fabrics',event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sp-row-icon"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          <div class="sp-row-content">
            <span class="sp-row-title">Fabrics &amp; Materials Library</span>
            <span class="sp-row-sub">Silks, brocades, linings, laces, trims and material stock</span>
          </div>
          <span class="sp-badge">Inventory</span>
        </div>
        <div class="sp-row" data-cat="appointments" data-module="appointments" onclick="navNavigate('appointments',event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sp-row-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
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
</div>`,

  footer: `<footer class="status-bar" id="appFooter">
  <div class="status-bar-left">
    <strong>HAULO</strong> &nbsp;|&nbsp; Intelligent Operations. Inspired Fashion.
  </div>
  <div class="status-bar-right">
    <div class="live-dot"></div>
    <span>Live Data</span>
    <span class="status-bar-sep">|</span>
    <span id="lastUpdated"></span>
  </div>
</footer>`

};

/* ============================================================
   UNIVERSAL PATRON AVATAR & INITIALS ENGINE
   - Multi-word names: First letter of first name + First letter of second name
   - Single-word names: First 2 letters of name
   - Automatic honorific cleaning (Ms., Mr., Mrs., Dr., etc.)
   - Deterministic dark luxury glassmorphism palettes
   ============================================================ */

if (typeof window.getPatronInitials !== 'function') {
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
}

if (typeof window.getPatronAvatarTheme !== 'function') {
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
}

if (typeof window.renderPatronAvatarHtml !== 'function') {
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
}

if (typeof window.applyPatronAvatarElement !== 'function') {
  window.applyPatronAvatarElement = function (containerEl, name, avatarUrl, sizeClass = 'haulo-avatar-md', extraStyles = '') {
    if (!containerEl) return;
    containerEl.innerHTML = window.renderPatronAvatarHtml(name, avatarUrl, sizeClass, extraStyles);
  };
}
