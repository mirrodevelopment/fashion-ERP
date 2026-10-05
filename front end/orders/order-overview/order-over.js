/* ============================================================
   HAULO BOUTIQUE ERP — ORDERS OVERVIEW
   order-over.js — Card-based order grid, filtering, pagination, drawer
   ============================================================ */

'use strict';

// ── API Integration ──────────────────────────────────────────
import api, { Auth } from '../../api.js';
if (!Auth.isLoggedIn()) { window.location.href = '../../login/login.html'; }

function mapStatus(s) {
  if (!s) return 'pending';
  const l = String(s).toLowerCase().replace('_', '-');
  if (l === 'in-progress' || l === 'inprogress') return 'in-progress';
  if (l === 'ready' || l === 'ready-for-delivery') return 'ready';
  if (l === 'delivered') return 'delivered';
  if (l === 'cancelled') return 'cancelled';
  return 'pending';
}

function apiToLocal(o) {
  const tot = Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0;
  const adv = Number(o.advancePaid) || 0;
  const bal = Number(o.balanceAmount !== undefined ? o.balanceAmount : (tot - adv)) || 0;
  const expDeliv = o.expectedDeliveryDate ? String(o.expectedDeliveryDate) : (o.dueDate ? String(o.dueDate) : '');
  const deliv = o.deliveredDate ? String(o.deliveredDate) : '';

  return {
    id: o.orderCode || o.id,
    rawId: o.id,
    customer: o.customerName || 'Client',
    customerMobile: o.customerMobile || o.customerId || '',
    avatar: (o.customerAvatar && !o.customerAvatar.includes('user_avatar.jpg')) ? o.customerAvatar : '',
    garment: o.garmentDesc || o.garmentType || 'Bespoke Garment',
    garmentType: o.garmentType || 'Blouse',
    orderDate: o.orderDate ? String(o.orderDate) : '',
    expectedDeliveryDate: expDeliv,
    deliveredDate: deliv,
    dueDate: expDeliv,
    totalAmount: tot,
    advancePaid: adv,
    balanceAmount: bal,
    amount: tot,
    status: mapStatus(o.status),
    currentStage: o.currentStage || '',
    progress: (o.progressStages && o.progressStages.length > 0) ? o.progressStages : []
  };
}

function formatStageImgUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const clean = url.replace(/^\/?front\s*end\//i, '').replace(/^\/+/, '');
  const origin = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ? window.location.origin
    : '';
  return origin ? `${origin}/front%20end/${clean}` : `/${clean}`;
}

let liveStageDefinitions = [];

async function loadLiveStageDefinitions() {
  try {
    if (api?.production?.stageDefinitions?.list) {
      const list = await api.production.stageDefinitions.list({ activeOnly: true });
      if (Array.isArray(list) && list.length > 0) {
        liveStageDefinitions = list
          .filter(s => s.active !== false)
          .slice()
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
    }
  } catch (e) {
    console.warn('[OrderOverview] Live stage definitions load error:', e.message);
  }
}

const PAGE_SIZE = 9;

/* ────────────────────────────────────────────────────────────
   STATE
   ──────────────────────────────────────────────────────────── */
let state = {
  orders: [],
  filtered: [],
  currentPage: 1,
  filter: 'all',
  search: '',
  sort: 'date-desc',
};

/* ────────────────────────────────────────────────────────────
   DOM REFS
   ──────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const els = {};

function cacheDom() {
  els.cardGrid = $('ordersCardGrid');
  els.skeleton = $('skeletonGrid');
  els.emptyState = $('emptyState');
  els.panelCount = $('panelCount');
  els.pageInfo = $('pageInfo');
  els.pageNumbers = $('pageNumbers');
  els.btnPrev = $('btnPrevPage');
  els.btnNext = $('btnNextPage');
  els.searchInput = $('searchInput');
  els.sortSelect = $('sortSelect');

  // KPIs
  els.kpiTotal = $('kpiTotalVal');
  els.kpiPending = $('kpiPendingVal');
  els.kpiProd = $('kpiProdVal');
  els.kpiReady = $('kpiReadyVal');
  els.kpiRevenue = $('kpiRevenueVal');

  // Drawer
  els.backdrop = $('drawerBackdrop');
  els.drawer = $('orderDrawer');
  els.drawerOrderId = $('drawerOrderId');
  els.drawerBadge = $('drawerStatusBadge');
  els.drawerBody = $('drawerBody');
  els.drawerViewFull = $('drawerViewFull');
  els.btnDrawerView = $('btnDrawerView');
  els.btnDrawerCancel = $('btnDrawerCancel');
  els.drawerClose = $('drawerClose');
}

/* ────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────── */
function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtAmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
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

function isOverdue(dueStr, status) {
  if (['delivered', 'cancelled'].includes(status)) return false;
  return new Date(dueStr + 'T23:59:59') < new Date();
}

function statusLabel(s) {
  const map = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return map[s] || s;
}

function statusBadgeHTML(s) {
  return `<span class="status-badge ${s}"><span class="status-dot ${s}"></span>${statusLabel(s)}</span>`;
}

function getCurrentStage(order) {
  const totalStages = liveStageDefinitions.length > 0 ? liveStageDefinitions.length : 1;
  const firstStage = liveStageDefinitions.length > 0 ? liveStageDefinitions[0] : null;
  const lastStage = liveStageDefinitions.length > 0 ? liveStageDefinitions[liveStageDefinitions.length - 1] : null;

  if (order.status === 'cancelled') {
    let stepNum = 1;
    if (order.currentStage && liveStageDefinitions.length > 0) {
      const currentKey = String(order.currentStage || '').toUpperCase().trim();
      const idx = liveStageDefinitions.findIndex(s =>
        String(s.stageKey || '').toUpperCase().trim() === currentKey ||
        String(s.displayName || '').toUpperCase().trim() === currentKey
      );
      if (idx >= 0) stepNum = idx + 1;
    }
    const haltedStage = liveStageDefinitions[stepNum - 1];
    const stageName = haltedStage?.displayName || haltedStage?.stageKey || 'Stage ' + stepNum;
    return {
      label: `cancaled at ${stageName}`,
      countText: `cancaled at ${stageName}`,
      isCancelled: true,
      step: stepNum,
      total: totalStages,
      imageUrl: haltedStage?.imageUrl ? formatStageImgUrl(haltedStage.imageUrl) : ''
    };
  }
  if (order.status === 'delivered') {
    const readyImg = lastStage && lastStage.imageUrl ? formatStageImgUrl(lastStage.imageUrl) : '';
    return {
      label: 'Delivered to Client',
      countText: 'Delivered',
      isComplete: true,
      step: totalStages,
      total: totalStages,
      imageUrl: readyImg
    };
  }

  const currentKey = String(order.currentStage || '').toUpperCase().trim();
  const stageIdx = liveStageDefinitions.findIndex(s =>
    String(s.stageKey || '').toUpperCase().trim() === currentKey ||
    String(s.displayName || '').toUpperCase().trim() === currentKey
  );

  if (stageIdx >= 0) {
    const s = liveStageDefinitions[stageIdx];
    const step = stageIdx + 1;
    return {
      label: s.displayName || s.stageKey,
      countText: `Stage ${step} of ${totalStages}`,
      step: step,
      total: totalStages,
      imageUrl: s.imageUrl ? formatStageImgUrl(s.imageUrl) : ''
    };
  }

  if (order.status === 'ready' && lastStage) {
    return {
      label: lastStage.displayName || lastStage.stageKey,
      countText: `Stage ${totalStages} of ${totalStages}`,
      step: totalStages,
      total: totalStages,
      imageUrl: lastStage.imageUrl ? formatStageImgUrl(lastStage.imageUrl) : ''
    };
  }

  if (firstStage) {
    return {
      label: firstStage.displayName || firstStage.stageKey,
      countText: `Stage 1 of ${totalStages}`,
      step: 1,
      total: totalStages,
      imageUrl: firstStage.imageUrl ? formatStageImgUrl(firstStage.imageUrl) : ''
    };
  }

  return {
    label: order.currentStage || 'Order Registered',
    countText: `Stage 1 of ${totalStages}`,
    step: 1,
    total: totalStages,
    imageUrl: ''
  };
}

/* ────────────────────────────────────────────────────────────
   KPI COUNTER
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

async function updateKPIs() {
  try {
    const kpis = await api.orders.kpis().catch(() => null);
    if (kpis) {
      const total = (Number(kpis.pendingCount) || 0) + (Number(kpis.inProgressCount) || 0) +
        (Number(kpis.readyCount) || 0) + (Number(kpis.deliveredCount) || 0) +
        (Number(kpis.cancelledCount) || 0);

      animateNum(els.kpiTotal, total);
      animateNum(els.kpiPending, Number(kpis.pendingCount) || 0);
      animateNum(els.kpiProd, Number(kpis.inProgressCount) || 0);
      animateNum(els.kpiReady, (Number(kpis.readyCount) || 0) + (Number(kpis.deliveredCount) || 0));
      animateNum(els.kpiRevenue, Number(kpis.totalRevenue) || 0, '₹');

      const setChip = (id, label, count) => {
        const btn = $(id);
        if (btn) btn.innerHTML = `${label} <span style="font-size:11px;opacity:0.75;margin-left:3px;">(${count})</span>`;
      };
      setChip('filterAll', 'All', total);
      setChip('filterPending', 'Pending', Number(kpis.pendingCount) || 0);
      setChip('filterInProgress', 'In Progress', Number(kpis.inProgressCount) || 0);
      setChip('filterReady', 'Ready', Number(kpis.readyCount) || 0);
      setChip('filterDelivered', 'Delivered', Number(kpis.deliveredCount) || 0);
      setChip('filterCancelled', 'Cancelled', Number(kpis.cancelledCount) || 0);
      return;
    }
  } catch (_) { }

  const all = state.orders;
  const total = all.length;
  const pending = all.filter(o => o.status === 'pending').length;
  const prod = all.filter(o => o.status === 'in-progress').length;
  const rdydlv = all.filter(o => ['ready', 'delivered'].includes(o.status)).length;
  const revenue = all.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.amount, 0);

  animateNum(els.kpiTotal, total);
  animateNum(els.kpiPending, pending);
  animateNum(els.kpiProd, prod);
  animateNum(els.kpiReady, rdydlv);
  animateNum(els.kpiRevenue, revenue, '₹');

  const setChip = (id, label, count) => {
    const btn = $(id);
    if (btn) btn.innerHTML = `${label} <span style="font-size:11px;opacity:0.75;margin-left:3px;">(${count})</span>`;
  };
  setChip('filterAll', 'All', total);
  setChip('filterPending', 'Pending', pending);
  setChip('filterInProgress', 'In Progress', prod);
  setChip('filterReady', 'Ready', all.filter(o => o.status === 'ready').length);
  setChip('filterDelivered', 'Delivered', all.filter(o => o.status === 'delivered').length);
  setChip('filterCancelled', 'Cancelled', all.filter(o => o.status === 'cancelled').length);
}

/* ────────────────────────────────────────────────────────────
   FILTER + SORT
   ──────────────────────────────────────────────────────────── */
function applyFilters() {
  let data = [...state.orders];

  // Status filter
  if (state.filter !== 'all') {
    data = data.filter(o => o.status === state.filter);
  }

  // Search
  const q = state.search.trim().toLowerCase();
  if (q) {
    data = data.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      (o.customerMobile && o.customerMobile.toLowerCase().includes(q)) ||
      o.garment.toLowerCase().includes(q)
    );
  }

  // Sort
  switch (state.sort) {
    case 'date-desc': data.sort((a, b) => b.orderDate.localeCompare(a.orderDate)); break;
    case 'date-asc': data.sort((a, b) => a.orderDate.localeCompare(b.orderDate)); break;
    case 'amount-desc': data.sort((a, b) => b.amount - a.amount); break;
    case 'amount-asc': data.sort((a, b) => a.amount - b.amount); break;
    case 'customer': data.sort((a, b) => a.customer.localeCompare(b.customer)); break;
  }

  state.filtered = data;
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
   RENDER — ORDER CARD
   ──────────────────────────────────────────────────────────── */
function renderCard(order) {
  const div = document.createElement('article');
  const overdue = isOverdue(order.dueDate, order.status);
  div.className = `order-card ${overdue ? 'overdue' : ''}`;
  div.dataset.id = order.id;

  const stage = getCurrentStage(order);
  const totalSteps = stage.total;
  const activePip = order.status === 'delivered'
    ? totalSteps
    : Math.min(totalSteps, Math.max(1, stage.step || 1));

  // Exactly N pips corresponding 1:1 with user's active stages
  let pipsHtml = '';
  for (let i = 0; i < totalSteps; i++) {
    let pipClass = 'card-pip';
    if (order.status === 'cancelled') {
      pipClass += ' cancelled';
    } else if (i < activePip - 1) {
      pipClass += ' done';
    } else if (i === activePip - 1) {
      pipClass += order.status === 'delivered' ? ' done' : ' active';
    }
    const stepObj = liveStageDefinitions[i];
    const stepTitle = stepObj ? (stepObj.displayName || stepObj.stageKey) : `Stage ${i + 1}`;
    pipsHtml += `<span class="${pipClass}" title="${stepTitle} (${i + 1}/${totalSteps})"></span>`;
  }

  const viewUrl = `../view-order/view-order.html?id=${encodeURIComponent(order.id)}`;

  div.innerHTML = `
    <!-- Header: Customer Avatar + Name + Order ID + Status -->
    <div class="card-header">
      <div class="card-avatar" style="overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;">
        ${typeof window.renderPatronAvatarHtml === 'function'
          ? window.renderPatronAvatarHtml(order.customer, order.avatar, 'haulo-avatar-md')
          : `<div class="haulo-patron-avatar-initials haulo-avatar-md" style="background:${avatarBg(order.customer)};color:#fff;">${initials(order.customer)}</div>`}
      </div>
      <div class="card-customer-info">
        <h3 class="card-customer-name" title="${order.customer}">${order.customer}</h3>
        <div class="card-order-id">#${order.id}</div>
      </div>
      ${statusBadgeHTML(order.status)}
    </div>

    <!-- Garment Row -->
    <div class="card-garment" title="${order.garment}">
      <i data-lucide="sparkles" class="card-garment-icon" style="width:14px;height:14px;"></i>
      <span class="card-garment-name">${order.garment}</span>
    </div>

    <!-- Dates: Ordered & Due/Delivered -->
    <div class="card-dates">
      <div class="card-date-item">
        <span class="card-date-label">Order Date</span>
        <span class="card-date-val">${fmtDate(order.orderDate)}</span>
      </div>
      <div class="card-date-item">
        <span class="card-date-label">${order.status === 'delivered' ? 'Delivered Date' : 'Delivery Due'}</span>
        <span class="card-date-val ${overdue ? 'overdue' : ''}">${fmtDate(order.status === 'delivered' && order.deliveredDate ? order.deliveredDate : (order.expectedDeliveryDate || order.dueDate))}</span>
      </div>
    </div>

    <!-- Production Stage & Progress Pips -->
    <div class="card-progress">
      <div class="card-stage-row">
        <span class="card-stage-label" style="display:inline-flex;align-items:center;gap:6px;">
          ${stage.imageUrl ? `<img src="${stage.imageUrl}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(212,175,55,0.7);box-shadow:0 2px 4px rgba(0,0,0,0.4);" alt="${stage.label}" onerror="this.remove()" />` : '<span class="card-stage-dot"></span>'}
          <span>${stage.label}</span>
        </span>
        <span class="card-stage-count">${stage.countText}</span>
      </div>
      <div class="card-pip-track" aria-label="Progress pipeline">
        ${pipsHtml}
      </div>
    </div>

    <!-- Footer: Amount Breakdown & Overdue Alert -->
    <div class="card-footer" style="display:flex;flex-direction:column;gap:5px;align-items:stretch;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span class="card-amount" title="Total Amount">${fmtAmt(order.totalAmount || order.amount)}</span>
        ${overdue ? `<span class="card-overdue-chip"><i data-lucide="alert-triangle" style="width:11px;height:11px;"></i> Overdue</span>` : ''}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;">
        <span>Adv: <strong style="color:#e2e8f0;">${fmtAmt(order.advancePaid)}</strong></span>
        <span>Bal: <strong style="color:${order.balanceAmount > 0 ? '#f59e0b' : '#10b981'};">${fmtAmt(order.balanceAmount)}</strong></span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="card-actions">
      <a href="${viewUrl}" class="btn-view" onclick="event.stopPropagation()">
        <i data-lucide="eye" style="width:13px;height:13px;"></i>
        <span>View Details</span>
      </a>
      <button type="button" class="btn-quick" aria-label="Quick order preview">
        <i data-lucide="maximize-2" style="width:12px;height:12px;"></i>
        <span>Quick View</span>
      </button>
    </div>
  `;

  // Clicking anywhere on card or quick button opens drawer
  div.addEventListener('click', () => openDrawer(order));
  const quickBtn = div.querySelector('.btn-quick');
  if (quickBtn) {
    quickBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDrawer(order);
    });
  }

  return div;
}

/* ────────────────────────────────────────────────────────────
   MASTER RENDER
   ──────────────────────────────────────────────────────────── */
function render() {
  const slice = pageSlice();
  const totalP = totalPages();
  const count = state.filtered.length;

  // Hide skeleton, show grid
  if (els.skeleton) els.skeleton.hidden = true;
  if (els.cardGrid) els.cardGrid.hidden = false;

  // Panel count
  if (els.panelCount) {
    els.panelCount.textContent = count === 0
      ? 'No orders'
      : `${count} order${count !== 1 ? 's' : ''}`;
  }

  // Empty state toggle
  if (els.emptyState) {
    els.emptyState.hidden = count > 0;
  }

  // Populate card grid
  if (els.cardGrid) {
    els.cardGrid.innerHTML = '';
    slice.forEach(order => {
      els.cardGrid.appendChild(renderCard(order));
    });
  }

  // Refresh lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Pagination controls
  if (els.pageInfo) {
    els.pageInfo.textContent = `Page ${state.currentPage} of ${totalP}`;
  }
  if (els.btnPrev) {
    els.btnPrev.disabled = state.currentPage <= 1;
  }
  if (els.btnNext) {
    els.btnNext.disabled = state.currentPage >= totalP;
  }

  // Page numbers
  if (els.pageNumbers) {
    els.pageNumbers.innerHTML = '';
    const MAX_VIS = 5;
    const half = Math.floor(MAX_VIS / 2);
    let start = Math.max(1, state.currentPage - half);
    let end = Math.min(totalP, start + MAX_VIS - 1);
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
   QUICK-VIEW DRAWER
   ──────────────────────────────────────────────────────────── */
function openDrawer(order) {
  const viewUrl = `../view-order/view-order.html?id=${encodeURIComponent(order.id)}`;

  // Header
  if (els.drawerOrderId) {
    els.drawerOrderId.textContent = `#${order.id}`;
  }
  if (els.drawerBadge) {
    els.drawerBadge.innerHTML = statusBadgeHTML(order.status);
  }

  // Full view link buttons
  if (els.drawerViewFull) els.drawerViewFull.href = viewUrl;
  if (els.btnDrawerView) els.btnDrawerView.href = viewUrl;

  // Drawer Cancel Order button
  if (els.btnDrawerCancel) {
    if (order.status === 'cancelled') {
      els.btnDrawerCancel.style.display = 'none';
    } else {
      els.btnDrawerCancel.style.display = 'inline-flex';
      els.btnDrawerCancel.onclick = async () => {
        if (!confirm(`Are you sure you want to cancel order ${order.id}?`)) return;
        try {
          els.btnDrawerCancel.disabled = true;
          els.btnDrawerCancel.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:14px;height:14px;"></i> Cancelling...`;
          if (api && api.orders && api.orders.update) {
            await api.orders.update(order.rawId || order.id, {
              status: 'CANCELLED',
              totalAmount: order.totalAmount,
              advancePaid: order.advancePaid,
              balanceAmount: order.balanceAmount
            });
          }
          order.status = 'cancelled';
          const found = state.orders.find(o => (o.rawId === order.rawId || o.id === order.id));
          if (found) found.status = 'cancelled';

          await updateKPIs();
          applyFilters();
          openDrawer(order);
        } catch (err) {
          console.error('[OrderOverview] Failed to cancel order:', err);
          alert('Failed to cancel order: ' + (err.message || 'Server error'));
        } finally {
          if (els.btnDrawerCancel) {
            els.btnDrawerCancel.disabled = false;
            els.btnDrawerCancel.innerHTML = `<i data-lucide="x-circle" style="width:14px;height:14px;"></i> Cancel Order`;
            if (window.lucide) lucide.createIcons();
          }
        }
      };
    }
  }

  const overdue = isOverdue(order.dueDate, order.status);
  const stage = getCurrentStage(order);
  const currentStepNum = stage.step || 1;

  // Dynamic workflow steps generated directly from user's live stage definitions
  const isCancelled = order.status === 'cancelled';
  const progressHTML = liveStageDefinitions.map((stepObj, idx) => {
    let statusClass = 'pending';
    let circleContent = '';
    const stepArt = stepObj.imageUrl ? formatStageImgUrl(stepObj.imageUrl) : '';

    if (isCancelled) {
      if (idx + 1 < currentStepNum) {
        statusClass = 'done past-cancelled';
        circleContent = stepArt
          ? `<img src="${stepArt}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;opacity:0.6;" alt="${stepObj.displayName || stepObj.stageKey}" onerror="this.remove()" />`
          : `<span style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.7);">${idx + 1}</span>`;
        circleContent += '<span style="position:absolute;inset:0;background:rgba(34,197,94,0.4);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff;">✓</span>';
      } else if (idx + 1 === currentStepNum) {
        statusClass = 'active-frozen-cancelled';
        circleContent = '<span style="position:absolute;inset:0;background:rgba(239,68,68,0.92);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#fff;box-shadow:0 0 12px rgba(239,68,68,0.8);">✕</span>';
      } else {
        statusClass = 'pending locked-cancelled';
        circleContent = '<span style="width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.25);display:block;margin:auto;"></span>';
      }
    } else {
      const isDone = (idx + 1) < currentStepNum || order.status === 'delivered';
      const isActive = (idx + 1) === currentStepNum && order.status !== 'delivered';
      statusClass = isDone ? 'done' : (isActive ? 'active' : 'pending');
      circleContent = stepArt
        ? `<img src="${stepArt}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;" alt="${stepObj.displayName || stepObj.stageKey}" onerror="this.remove()" />`
        : `<span style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.7);">${idx + 1}</span>`;
      if (isDone) {
        circleContent += '<span style="position:absolute;inset:0;background:rgba(34,197,94,0.85);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#0b1406;">✓</span>';
      }
    }

    const labelExtra = (isCancelled && idx + 1 === currentStepNum)
      ? ' <span style="font-size:8.5px;color:#fca5a5;background:rgba(239,68,68,0.25);border:1px solid rgba(239,68,68,0.5);padding:1px 5px;border-radius:4px;margin-left:6px;font-weight:800;">cancaled here</span>'
      : '';

    return `
      <div class="drawer-progress-step ${statusClass}">
        <div class="drawer-step-num" style="position:relative;overflow:hidden;padding:0;border:1.5px solid ${isCancelled && idx + 1 === currentStepNum ? '#ef4444' : 'rgba(212,175,55,0.7)'};">
          ${circleContent}
        </div>
        <span class="drawer-step-label">${stepObj.displayName || stepObj.stageKey}${labelExtra}</span>
      </div>
    `;
  }).join('');

  if (els.drawerBody) {
    els.drawerBody.innerHTML = `
      <!-- Customer & Garment Section -->
      <div class="drawer-section">
        <div class="drawer-section-title">Customer & Garment</div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Customer</span>
          <span class="drawer-detail-val">
            <a href="../../customer/Customer360/customer360.html?mobile=${encodeURIComponent(order.customerMobile || order.customer)}" style="color:var(--lime,#84cc16);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;" title="Open Customer 360° Profile">
              ${order.customer}
              <i data-lucide="external-link" style="width:11px;height:11px;"></i>
            </a>
          </span>
        </div>
        ${order.customerMobile ? `
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Mobile No</span>
          <span class="drawer-detail-val" style="font-family:var(--font-mono);letter-spacing:0.5px;">${order.customerMobile}</span>
        </div>` : ''}
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Garment</span>
          <span class="drawer-detail-val">${order.garment}</span>
        </div>
      </div>

      <!-- Financials Section -->
      <div class="drawer-section">
        <div class="drawer-section-title">Financial Summary</div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Total Amount</span>
          <span class="drawer-detail-val" style="font-weight:700;">${fmtAmt(order.totalAmount || order.amount)}</span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Advance Paid</span>
          <span class="drawer-detail-val" style="color:var(--lime,#d4ff32);font-weight:600;">${fmtAmt(order.advancePaid)}</span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Balance Due</span>
          <span class="drawer-detail-val" style="color:${order.balanceAmount > 0 ? '#f59e0b' : '#10b981'};font-weight:700;">${fmtAmt(order.balanceAmount)}</span>
        </div>
      </div>

      <!-- Schedule Section -->
      <div class="drawer-section">
        <div class="drawer-section-title">Timeline & Dates</div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Order Date</span>
          <span class="drawer-detail-val">${fmtDate(order.orderDate)}</span>
        </div>
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Expected Delivery</span>
          <span class="drawer-detail-val" style="${overdue ? 'color:var(--orange);font-weight:700;' : ''}">
            ${fmtDate(order.expectedDeliveryDate || order.dueDate)} ${overdue ? '⚠️ (Overdue)' : ''}
          </span>
        </div>
        ${order.deliveredDate ? `
        <div class="drawer-detail-row">
          <span class="drawer-detail-key">Delivered Date</span>
          <span class="drawer-detail-val" style="color:#10b981;font-weight:600;">${fmtDate(order.deliveredDate)}</span>
        </div>` : ''}
      </div>

      <!-- Production Pipeline -->
      <div class="drawer-section">
        <div class="drawer-section-title">Production Workflow Progress</div>
        <div class="drawer-progress-track">
          ${progressHTML}
        </div>
      </div>
    `;
  }

  if (window.lucide) lucide.createIcons();

  // Open drawer
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
    if (els.drawer) els.drawer.hidden = true;
    if (els.backdrop) els.backdrop.hidden = true;
    if (els.drawer) els.drawer.classList.remove('closing');
    document.body.style.overflow = '';
  }, 180);
}

/* ────────────────────────────────────────────────────────────
   EVENTS
   ──────────────────────────────────────────────────────────── */
function bindEvents() {
  // Search
  if (els.searchInput) {
    els.searchInput.addEventListener('input', () => {
      state.search = els.searchInput.value;
      applyFilters();
    });
  }

  // Sort
  if (els.sortSelect) {
    els.sortSelect.addEventListener('change', () => {
      state.sort = els.sortSelect.value;
      applyFilters();
    });
  }

  // Status Filter Chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.filter = chip.dataset.filter;
      applyFilters();
    });
  });

  // Pagination Prev / Next
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

  // Drawer Close
  if (els.drawerClose) els.drawerClose.addEventListener('click', closeDrawer);
  if (els.backdrop) els.backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && els.drawer && !els.drawer.hidden) {
      closeDrawer();
    }
  });

  // Export CSV
  const btnExport = $('btnExport');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const rows = [
        ['Order ID', 'Customer', 'Garment', 'Order Date', 'Due Date', 'Amount (₹)', 'Status', 'Production Stage'],
        ...state.filtered.map(o => [
          o.id,
          o.customer,
          o.garment,
          o.orderDate,
          o.dueDate,
          o.amount,
          statusLabel(o.status),
          getCurrentStage(o).countText
        ])
      ];
      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const bSlug = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('shortName').toLowerCase()) || 'orders';
      a.download = `${bSlug}-orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}

/* ────────────────────────────────────────────────────────────
   INIT (API-backed)
   ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  cacheDom();
  bindEvents();

  // 1. Load live stage definitions dynamically (zero hardcoded URLs)
  await loadLiveStageDefinitions();

  try {
    const res = await api.orders.list({ page: 0, size: 100 });
    const items = Array.isArray(res) ? res : (res && res.content ? res.content : []);
    const realOrders = items.map(apiToLocal);
    state.orders = realOrders;
    state.filtered = [...realOrders];
  } catch (err) {
    console.error('[OrderOverview] Failed to load orders from backend:', err.message);
    state.orders = [];
    state.filtered = [];
  }

  // Render cards and KPIs
  applyFilters();
  await updateKPIs();
});
