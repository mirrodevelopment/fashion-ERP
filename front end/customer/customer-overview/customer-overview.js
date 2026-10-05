/* ============================================================
   HAULO BOUTIQUE ERP — CUSTOMER OVERVIEW
   customer-overview.js — Client directory cards, filtering, drawer & modal
   ============================================================ */

'use strict';

// ── API Integration ──────────────────────────────────────────
import api, { Auth } from '../../api.js';
if (!Auth.isLoggedIn()) {
  window.location.href = '../../login/login.html';
}

// Maps API tier enum to display label used in the rest of this file
function mapTier(t) {
  if (!t) return 'Regular';
  const upper = String(t).toUpperCase();
  if (upper === 'VIP_PLATINUM' || upper === 'PREMIUM') return 'VIP Platinum';
  if (upper === 'VIP_GOLD' || upper === 'VIP')     return 'VIP Gold';
  return 'Regular';
}

// Converts API customer to the shape this file expects
function apiToLocal(c) {
  const mobile = c.mobileNumber || c.phone || '';
  return {
    id:               mobile,
    mobileNumber:     mobile,
    name:             c.name,
    avatar:           c.avatarUrl || '',
    tier:             mapTier(c.tier),
    phone:            mobile,
    email:            c.email || '',
    location:         c.location || '',
    totalOrders:      0,        // will be fetched separately if needed
    ordersInProcess:  0,
    totalSpend:       Number(c.totalSpend) || 0,
    balance:          Number(c.balance) || 0,
    lastOrderDate:    c.createdAt ? c.createdAt.slice(0,10) : '',
    favoriteGarment:  c.favoriteGarment || '',
    measurementsOnFile: c.measurementsOnFile || false,
    // V16 preference fields
    preferredNeck:      c.preferredNeck || '',
    preferredSleeve:    c.preferredSleeve || '',
    preferredOccasions: c.preferredOccasions || '',
    deliveryPreference: c.deliveryPreference || '',
  };
}

const PAGE_SIZE = 9;

let state = {
  customers:   [],
  filtered:    [],
  currentPage: 1,
  filter:      'all',
  search:      '',
  sort:        'spend-desc',
};

/* ────────────────────────────────────────────────────────────
   DOM CACHE
   ──────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const els = {};

function cacheDom() {
  els.cardGrid    = $('customerCardGrid');
  els.skeleton    = $('skeletonGrid');
  els.emptyState  = $('emptyState');
  els.panelCount  = $('panelCount');
  els.pageInfo    = $('pageInfo');
  els.pageNumbers = $('pageNumbers');
  els.btnPrev     = $('btnPrevPage');
  els.btnNext     = $('btnNextPage');
  els.searchInput = $('searchInput');
  els.sortSelect  = $('sortSelect');

  // KPI elements
  els.kpiTotal    = $('kpiTotalVal');
  els.kpiActive   = $('kpiActiveVal');
  els.kpiRevenue  = $('kpiRevenueVal');
  els.kpiBalance  = $('kpiBalanceVal');
  els.kpiVip      = $('kpiVipVal');

  // Drawer elements
  els.backdrop        = $('drawerBackdrop');
  els.drawer          = $('customerDrawer');
  els.drawerAvatar    = $('drawerAvatarWrap');
  els.drawerName      = $('drawerClientName');
  els.drawerId        = $('drawerClientId');
  els.drawerBody      = $('drawerBody');
  els.drawerViewFull  = $('drawerViewFull');
  els.btnDrawerFull   = $('btnDrawerFull');
  els.drawerClose     = $('drawerClose');

  // Actions
  els.btnNewCustomer  = $('btnNewCustomer');
  els.btnExport = $('btnExport');
}

/* ────────────────────────────────────────────────────────────
   HELPERS & FORMATTERS
   ──────────────────────────────────────────────────────────── */
function fmtAmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(name) {
  if (typeof window.getPatronInitials === 'function') {
    return window.getPatronInitials(name);
  }
  if (!name || typeof name !== 'string') return 'CU';
  const clean = name.trim();
  const tokens = clean.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 'CU';
  if (tokens.length === 1) {
    const s = tokens[0].replace(/[^a-zA-Z0-9]/g, '');
    return s.length >= 2 ? s.substring(0, 2).toUpperCase() : (s || tokens[0].substring(0, 2)).toUpperCase();
  }
  return (tokens[0][0] + tokens[1][0]).toUpperCase();
}

function avatarBg(name) {
  const gradients = [
    'linear-gradient(135deg, #10b981, #047857)',
    'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    'linear-gradient(135deg, #f59e0b, #b45309)',
    'linear-gradient(135deg, #ec4899, #be185d)',
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #06b6d4, #0e7490)',
    'linear-gradient(135deg, #84cc16, #4d7c0f)',
    'linear-gradient(135deg, #f43f5e, #be123c)',
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function tierBadgeHTML(tier) {
  if (tier === 'VIP Platinum') {
    return `<span class="tier-badge platinum"><i data-lucide="crown" style="width:11px;height:11px;"></i> Platinum</span>`;
  }
  if (tier === 'VIP Gold') {
    return `<span class="tier-badge gold"><i data-lucide="award" style="width:11px;height:11px;"></i> Gold</span>`;
  }
  return `<span class="tier-badge regular"><i data-lucide="user" style="width:11px;height:11px;"></i> Regular</span>`;
}

function showToast(message) {
  const container = $('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast-msg';
  t.textContent = message;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(-8px)';
    t.style.transition = 'all 200ms ease';
    setTimeout(() => t.remove(), 220);
  }, 2800);
}

/* ────────────────────────────────────────────────────────────
   KPI COUNTER ANIMATIONS
   ──────────────────────────────────────────────────────────── */
function animateNum(el, target, prefix = '', suffix = '') {
  if (!el) return;
  const dur = 600, startTime = performance.now();
  function step(now) {
    const pct = Math.min((now - startTime) / dur, 1);
    const val = Math.round(pct * target);
    el.textContent = prefix + val.toLocaleString('en-IN') + suffix;
    if (pct < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function updateKPIs() {
  const list = state.customers;
  const totalClients = list.length;
  const inProcessJobs = list.reduce((s, c) => s + c.ordersInProcess, 0);
  const totalRevenue = list.reduce((s, c) => s + c.totalSpend, 0);
  const totalBalance = list.reduce((s, c) => s + c.balance, 0);
  const vipCount = list.filter(c => c.tier.includes('VIP')).length;

  animateNum(els.kpiTotal,   totalClients);
  animateNum(els.kpiActive,  inProcessJobs);
  animateNum(els.kpiRevenue, totalRevenue, '₹ ');
  animateNum(els.kpiBalance, totalBalance, '₹ ');
  animateNum(els.kpiVip,     vipCount);
}

/* ────────────────────────────────────────────────────────────
   FILTER + SORT
   ──────────────────────────────────────────────────────────── */
function applyFilters() {
  let data = [...state.customers];

  // Chip filters
  if (state.filter === 'vip') {
    data = data.filter(c => c.tier.includes('VIP'));
  } else if (state.filter === 'active') {
    data = data.filter(c => c.ordersInProcess > 0);
  } else if (state.filter === 'balance') {
    data = data.filter(c => c.balance > 0);
  } else if (state.filter === 'measurements') {
    data = data.filter(c => c.measurementsOnFile);
  }

  // Search filter
  const q = state.search.trim().toLowerCase();
  if (q) {
    data = data.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.favoriteGarment.toLowerCase().includes(q) ||
      (c.preferredNeck || '').toLowerCase().includes(q) ||
      (c.preferredOccasions || '').toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }

  // Sorter
  switch (state.sort) {
    case 'spend-desc':   data.sort((a, b) => b.totalSpend - a.totalSpend); break;
    case 'orders-desc':  data.sort((a, b) => b.totalOrders - a.totalOrders); break;
    case 'balance-desc': data.sort((a, b) => b.balance - a.balance); break;
    case 'name-asc':     data.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'recent':       data.sort((a, b) => b.lastOrderDate.localeCompare(a.lastOrderDate)); break;
  }

  state.filtered    = data;
  state.currentPage = 1;
  render();
}

function pageSlice() {
  const start = (state.currentPage - 1) * PAGE_SIZE;
  return state.filtered.slice(start, start + PAGE_SIZE);
}

function totalPages() {
  return Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
}

/* ────────────────────────────────────────────────────────────
   RENDER CUSTOMER CARD
   ──────────────────────────────────────────────────────────── */
function renderCard(customer) {
  const card = document.createElement('article');
  const hasBalance = customer.balance > 0;
  card.className = `customer-card ${hasBalance ? 'has-balance' : ''}`;
  card.dataset.id = customer.id;

  const profileUrl = `../Customer360/customer360.html?mobile=${encodeURIComponent(customer.mobileNumber || customer.phone || customer.name)}`;
  const cleanPhone = (customer.mobileNumber || customer.phone || '').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}`;

  card.innerHTML = `
    <!-- Header: Avatar, Name, Phone, Tier -->
    <div class="card-header">
      <div class="card-avatar" style="overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;">
        ${typeof window.renderPatronAvatarHtml === 'function'
          ? window.renderPatronAvatarHtml(customer.name, customer.avatar, 'haulo-avatar-md')
          : `<div class="haulo-patron-avatar-initials haulo-avatar-md" style="background:${avatarBg(customer.name)};color:#fff;">${initials(customer.name)}</div>`}
      </div>
      <div class="card-customer-info">
        <h3 class="card-customer-name" title="${customer.name}">${customer.name}</h3>
        <div class="card-customer-phone">
          <i data-lucide="phone" style="width:11px;height:11px;color:var(--lime);"></i>
          <span>${customer.phone}</span>
        </div>
      </div>
      ${tierBadgeHTML(customer.tier)}
    </div>

    <!-- Garment Style Preference -->
    <div class="card-garment-style" title="Style preference: ${customer.favoriteGarment}">
      <i data-lucide="sparkles" class="card-style-icon" style="width:13px;height:13px;"></i>
      <span class="card-style-text">${customer.favoriteGarment}</span>
    </div>

    <!-- Key Metrics Grid: Orders & Financials -->
    <div class="card-metrics-row">
      <div class="card-metric-tile">
        <span class="metric-tile-label">Orders</span>
        <div class="metric-tile-val">
          ${customer.totalOrders} total
          ${customer.ordersInProcess > 0 ? `<span class="active-jobs-pill">${customer.ordersInProcess} active</span>` : ''}
        </div>
      </div>
      <div class="card-metric-tile">
        <span class="metric-tile-label">Total Spend</span>
        <span class="metric-tile-val lime">${fmtAmt(customer.totalSpend)}</span>
      </div>
      <div class="card-metric-tile">
        <span class="metric-tile-label">Account Balance</span>
        <span class="metric-tile-val ${hasBalance ? 'orange' : 'settled'}">
          ${hasBalance ? fmtAmt(customer.balance) : '✓ Settled'}
        </span>
      </div>
      <div class="card-metric-tile">
        <span class="metric-tile-label">Measurements</span>
        <span class="metric-tile-val" style="font-size:12px;font-weight:600;color:${customer.measurementsOnFile ? 'var(--lime)' : 'var(--text-3)'}">
          ${customer.measurementsOnFile ? '✓ On Record' : 'Pending'}
        </span>
      </div>
    </div>

    <!-- Meta line: Location & Last Activity -->
    <div class="card-meta-line">
      <span class="card-meta-item">
        <i data-lucide="map-pin" style="width:11px;height:11px;"></i>
        <span>${customer.location}</span>
      </span>
      <span class="card-meta-item">
        <i data-lucide="calendar" style="width:11px;height:11px;"></i>
        <span>${fmtDate(customer.lastOrderDate)}</span>
      </span>
    </div>

    <!-- Action Buttons -->
    <div class="card-actions">
      <a href="${profileUrl}" class="btn-profile-360" onclick="event.stopPropagation()">
        <i data-lucide="user-check" style="width:13px;height:13px;"></i>
        <span>View 360° Profile</span>
      </a>
      <button type="button" class="btn-quick-preview" aria-label="Quick preview client">
        <i data-lucide="eye" style="width:13px;height:13px;"></i>
        <span>Quick View</span>
      </button>
    </div>
  `;

  // Clicking card or preview opens quick-view drawer
  card.addEventListener('click', () => openDrawer(customer));
  const quickBtn = card.querySelector('.btn-quick-preview');
  if (quickBtn) {
    quickBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDrawer(customer);
    });
  }

  return card;
}

/* ────────────────────────────────────────────────────────────
   MASTER RENDER
   ──────────────────────────────────────────────────────────── */
function render() {
  const slice  = pageSlice();
  const totalP = totalPages();
  const count  = state.filtered.length;

  // Toggle skeleton and card grid
  if (els.skeleton) els.skeleton.hidden = true;
  if (els.cardGrid) els.cardGrid.hidden = false;

  // Update header count
  if (els.panelCount) {
    els.panelCount.textContent = count === 0
      ? 'No clients found'
      : `${count} client${count !== 1 ? 's' : ''} on record`;
  }

  // Toggle empty state
  if (els.emptyState) {
    els.emptyState.hidden = count > 0;
  }

  // Render cards
  if (els.cardGrid) {
    els.cardGrid.innerHTML = '';
    slice.forEach(customer => {
      els.cardGrid.appendChild(renderCard(customer));
    });
  }

  // Refresh lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Pagination updates
  if (els.pageInfo) {
    els.pageInfo.textContent = `Page ${state.currentPage} of ${totalP}`;
  }
  if (els.btnPrev) {
    els.btnPrev.disabled = state.currentPage <= 1;
  }
  if (els.btnNext) {
    els.btnNext.disabled = state.currentPage >= totalP;
  }

  // Number buttons
  if (els.pageNumbers) {
    els.pageNumbers.innerHTML = '';
    const MAX_VIS = 5;
    const half = Math.floor(MAX_VIS / 2);
    let start = Math.max(1, state.currentPage - half);
    let end   = Math.min(totalP, start + MAX_VIS - 1);
    if (end - start < MAX_VIS - 1) start = Math.max(1, end - MAX_VIS + 1);

    for (let p = start; p <= end; p++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'page-num' + (p === state.currentPage ? ' active' : '');
      btn.textContent = p;
      btn.addEventListener('click', () => {
        state.currentPage = p;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      els.pageNumbers.appendChild(btn);
    }
  }
}

/* ────────────────────────────────────────────────────────────
   CUSTOMER QUICK-VIEW DRAWER
   ──────────────────────────────────────────────────────────── */
function openDrawer(customer) {
  const profileUrl = `../Customer360/customer360.html?mobile=${encodeURIComponent(customer.mobileNumber || customer.phone || customer.name)}`;
  const cleanPhone = (customer.mobileNumber || customer.phone || '').replace(/[^0-9]/g, '');

  if (els.drawerAvatar) {
    if (typeof window.applyPatronAvatarElement === 'function') {
      window.applyPatronAvatarElement(els.drawerAvatar, customer.name, customer.avatar, 'haulo-avatar-lg');
    } else if (typeof window.renderPatronAvatarHtml === 'function') {
      els.drawerAvatar.innerHTML = window.renderPatronAvatarHtml(customer.name, customer.avatar, 'haulo-avatar-lg');
    } else {
      els.drawerAvatar.style.background = avatarBg(customer.name);
      els.drawerAvatar.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;height:100%;font-weight:700;color:#fff;">${initials(customer.name)}</span>`;
    }
  }
  if (els.drawerName) els.drawerName.textContent = customer.name;
  if (els.drawerId)   els.drawerId.textContent   = `${customer.mobileNumber || customer.phone} • ${customer.tier}`;

  if (els.drawerViewFull) els.drawerViewFull.href = profileUrl;
  if (els.btnDrawerFull)  els.btnDrawerFull.href  = profileUrl;

  const hasBalance = customer.balance > 0;

  if (els.drawerBody) {
    els.drawerBody.innerHTML = `
      <!-- Contact & Identity -->
      <div class="drawer-section">
        <div class="drawer-section-title">Client Identity & Contact</div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Phone / WhatsApp</span>
          <span class="drawer-detail-val" style="color:var(--lime);">${customer.phone}</span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Email Address</span>
          <span class="drawer-detail-val">${customer.email}</span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Primary Location</span>
          <span class="drawer-detail-val">${customer.location}</span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Client Tier</span>
          <span class="drawer-detail-val">${customer.tier}</span>
        </div>
      </div>

      <!-- Atelier & Orders Summary -->
      <div class="drawer-section">
        <div class="drawer-section-title">Atelier & Order Portfolio</div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Preferred Attire</span>
          <span class="drawer-detail-val">${customer.favoriteGarment}</span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Total Orders Placed</span>
          <span class="drawer-detail-val" style="font-weight:700;">${customer.totalOrders} completed</span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Current Jobs In Process</span>
          <span class="drawer-detail-val" style="color:${customer.ordersInProcess > 0 ? 'var(--blue)' : 'var(--text-2)'};font-weight:700;">
            ${customer.ordersInProcess} active in atelier
          </span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Measurements Profile</span>
          <span class="drawer-detail-val" style="color:${customer.measurementsOnFile ? 'var(--lime)' : 'var(--text-3)'};">
            ${customer.measurementsOnFile ? 'Complete & Verified' : 'Measurements Needed'}
          </span>
        </div>
      </div>

      <!-- Financials & Account Balance -->
      <div class="drawer-section">
        <div class="drawer-section-title">Financial Summary & Balance</div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Lifetime Spend</span>
          <span class="drawer-detail-val" style="color:var(--lime);font-size:14px;font-weight:700;">${fmtAmt(customer.totalSpend)}</span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Outstanding Balance</span>
          <span class="drawer-detail-val" style="color:${hasBalance ? 'var(--orange)' : 'var(--green)'};font-weight:700;">
            ${hasBalance ? `${fmtAmt(customer.balance)} (Payment Pending)` : '✓ Fully Settled'}
          </span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Last Order Date</span>
          <span class="drawer-detail-val">${fmtDate(customer.lastOrderDate)}</span>
        </div>
      </div>

      <!-- Tailoring Preferences -->
      <div class="drawer-section">
        <div class="drawer-section-title">Tailoring Preferences</div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Neck Style</span>
          <span class="drawer-detail-val">${customer.preferredNeck || '—'}</span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Sleeve Style</span>
          <span class="drawer-detail-val">${customer.preferredSleeve || '—'}</span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Occasions</span>
          <span class="drawer-detail-val">${customer.preferredOccasions || '—'}</span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Delivery Preference</span>
          <span class="drawer-detail-val">${customer.deliveryPreference || '—'}</span>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="drawer-section" style="margin-top:6px;">
        <div style="display:flex;gap:10px;">
          <a href="https://wa.me/${cleanPhone}" target="_blank" rel="noopener" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 12px;border-radius:9px;background:rgba(74,222,128,0.15);border:1px solid rgba(74,222,128,0.3);color:var(--green);font-size:12px;font-weight:600;text-decoration:none;">
            <i data-lucide="message-circle" style="width:14px;height:14px;"></i>
            <span>WhatsApp Client</span>
          </a>
          <a href="tel:${customer.phone}" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 12px;border-radius:9px;background:rgba(255,255,255,0.06);border:1px solid var(--border);color:var(--text-1);font-size:12px;font-weight:600;text-decoration:none;">
            <i data-lucide="phone-call" style="width:14px;height:14px;"></i>
            <span>Call Phone</span>
          </a>
        </div>
      </div>
    `;
  }

  if (window.lucide) lucide.createIcons();

  if (els.backdrop) els.backdrop.hidden = false;
  if (els.drawer) {
    els.drawer.hidden = false;
    els.drawer.classList.remove('closing');
  }
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  if (!els.drawer || els.drawer.hidden) return;
  els.drawer.classList.add('closing');
  setTimeout(() => {
    if (els.drawer)   els.drawer.hidden = true;
    if (els.backdrop) els.backdrop.hidden = true;
    if (els.drawer)   els.drawer.classList.remove('closing');
    document.body.style.overflow = '';
  }, 180);
}

/* ────────────────────────────────────────────────────────────
   EVENTS BINDING
   ──────────────────────────────────────────────────────────── */
function bindEvents() {
  // Search
  if (els.searchInput) {
    els.searchInput.addEventListener('input', () => {
      state.search = els.searchInput.value;
      applyFilters();
    });
  }

  // Sorter
  if (els.sortSelect) {
    els.sortSelect.addEventListener('change', () => {
      state.sort = els.sortSelect.value;
      applyFilters();
    });
  }

  // Filter Chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.filter = chip.dataset.filter;
      applyFilters();
    });
  });

  // Pagination
  if (els.btnPrev) {
    els.btnPrev.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
  if (els.btnNext) {
    els.btnNext.addEventListener('click', () => {
      if (state.currentPage < totalPages()) {
        state.currentPage++;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Drawer
  if (els.drawerClose) els.drawerClose.addEventListener('click', closeDrawer);
  if (els.backdrop)    els.backdrop.addEventListener('click', closeDrawer);

  // Modal & Navigation
  if (els.btnNewCustomer) {
    els.btnNewCustomer.addEventListener('click', () => {
      window.location.href = '../new-customer/new-customer.html';
    });
  }
  // Escape key closes drawer
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (els.drawer && !els.drawer.hidden) {
        closeDrawer();
      }
    }
  });

  // CSV Export
  if (els.btnExport) {
    els.btnExport.addEventListener('click', () => {
      const rows = [
        ['Customer ID', 'Full Name', 'Phone', 'Email', 'Tier', 'Preferred Garment', 'Total Orders', 'In-Process', 'Total Spend (₹)', 'Balance Due (₹)', 'Location', 'Last Order Date'],
        ...state.filtered.map(c => [
          c.id,
          c.name,
          c.phone,
          c.email,
          c.tier,
          c.favoriteGarment,
          c.totalOrders,
          c.ordersInProcess,
          c.totalSpend,
          c.balance,
          c.location,
          c.lastOrderDate
        ])
      ];
      const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const bSlug = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('shortName').toLowerCase()) || 'client';
      a.download = `${bSlug}-client-directory-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}

/* ────────────────────────────────────────────────────────────
   INIT
   ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  cacheDom();
  bindEvents();

  try {
    const res = await api.customers.list({ page: 0, size: 100 });
    const items = Array.isArray(res) ? res : (res && res.content ? res.content : []);
    const realCustomers = items.map(apiToLocal);

    // Merge with locally registered customers from localStorage
    const localRaw = localStorage.getItem('haulo_registered_customers');
    let localList = [];
    if (localRaw) {
      try { localList = JSON.parse(localRaw); } catch (_) { localList = []; }
      if (!Array.isArray(localList)) localList = [];
    }
    const existingMobiles = new Set(realCustomers.map(c => (c.mobileNumber || c.phone || '').replace(/\D/g, '')));
    const merged = [...realCustomers];
    localList.forEach(lc => {
      const mobDigits = (lc.mobileNumber || lc.phone || '').replace(/\D/g, '');
      if (mobDigits && !existingMobiles.has(mobDigits)) {
        merged.unshift(lc);
        existingMobiles.add(mobDigits);
      }
    });

    state.customers = merged;
    state.filtered  = [...merged];

    // Enrich customer records with live order counts
    try {
      const ordRes = await api.orders.list({ page: 0, size: 500 }).catch(() => []);
      const orders = Array.isArray(ordRes) ? ordRes : (ordRes && ordRes.content ? ordRes.content : []);
      if (orders.length > 0) {
        const orderCountsByMobile = {};
        const inProcessCountsByMobile = {};
        orders.forEach(o => {
          const m = (o.customerMobile || '').replace(/\D/g, '');
          if (m) {
            orderCountsByMobile[m] = (orderCountsByMobile[m] || 0) + 1;
            const st = (o.status || '').toUpperCase();
            if (st === 'IN_PRODUCTION' || st === 'IN_PROGRESS' || st === 'PENDING') {
              inProcessCountsByMobile[m] = (inProcessCountsByMobile[m] || 0) + 1;
            }
          }
        });
        state.customers.forEach(c => {
          const m = (c.mobileNumber || c.phone || '').replace(/\D/g, '');
          if (orderCountsByMobile[m] !== undefined) {
            c.totalOrders = orderCountsByMobile[m];
          }
          if (inProcessCountsByMobile[m] !== undefined) {
            c.ordersInProcess = inProcessCountsByMobile[m];
          }
        });
      }
    } catch (ordErr) {
      console.warn('[CustomerOverview] Could not enrich with orders:', ordErr);
    }
  } catch (err) {
    console.error('[CustomerOverview] Failed to load customers from backend:', err.message);
    const localRaw = localStorage.getItem('haulo_registered_customers');
    let localList = [];
    if (localRaw) {
      try { localList = JSON.parse(localRaw); } catch (_) { localList = []; }
      if (!Array.isArray(localList)) localList = [];
    }
    state.customers = localList;
    state.filtered  = [...localList];
  }

  // Render cards and KPIs
  setTimeout(() => {
    applyFilters();
    updateKPIs();
  }, 250);
});

