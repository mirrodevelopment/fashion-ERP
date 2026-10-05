/**
 * HAULO BOUTIQUE ERP — Inventory Command Centre Logic
 * Manages Stock Levels, Categories, Live Search/Filter, Pagination, Stock Alerts,
 * Movements, Top Consumed Items, Donut Charts, and Stock Adjustments.
 * Path: front end/inventory/inventory.js
 */

// Fallback neutral SVG silhouette for items without a database image URL
const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 48 48%22 width=%2248%22 height=%2248%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Crect x=%226%22 y=%226%22 width=%2236%22 height=%2236%22 rx=%224%22/%3E%3Cpath d=%22M6 18h36M6 30h36M18 6v36M30 6v36%22 stroke-dasharray=%222 2%22/%3E%3C/svg%3E";


// ─────────────────────────────────────────────
// 1. MASTER INVENTORY DATASET (Loaded from Database via REST API)
// ─────────────────────────────────────────────
let inventoryItems = [];
let stockMovements = [];

// Active State
let currentTab = 'all';
let searchQuery = '';
let activeAlertsTab = 'low';
let currentPage = 1;
const itemsPerPage = 8;
let selectedItemCodes = new Set();
let contextTargetCode = null;

// Filter Object
let activeFilters = {
  category: '',
  status: '',
  minStock: null,
  maxStock: null
};

// ─────────────────────────────────────────────
// 3. INITIALIZATION
// ─────────────────────────────────────────────
function apiToInventoryItem(i) {
  const mapStatus = s => {
    if (!s) return 'In Stock';
    if (s === 'IN_STOCK') return 'In Stock';
    if (s === 'LOW_STOCK') return 'Low Stock';
    if (s === 'OUT_OF_STOCK') return 'Out of Stock';
    return String(s);
  };
  return {
    id: i.id,
    code: i.itemCode,
    name: i.name,
    category: i.category,
    variant: i.variant || '',
    unit: i.unit,
    stockQty: Number(i.stockQty) || 0,
    reserved: Number(i.reservedQty) || 0,
    available: Number(i.availableQty) || 0,
    reorderLevel: Number(i.reorderLevel) || 0,
    status: mapStatus(i.status),
    supplier: i.supplierName || '—',
    purchasePrice: Number(i.purchasePrice) || 0,
    image: i.imageUrl || FALLBACK_IMG
  };
}

async function getApi() {
  if (window.api) return window.api;
  try {
    const mod = await import('../api.js');
    return mod.default || mod.api || window.api;
  } catch (_) {
    return window.api;
  }
}

async function getAuth() {
  if (window.Auth) return window.Auth;
  try {
    const mod = await import('../api.js');
    return mod.Auth || window.Auth;
  } catch (_) {
    return window.Auth;
  }
}

async function loadInventoryFromApi() {
  try {
    const api = await getApi();
    const Auth = await getAuth();
    if (Auth && typeof Auth.isLoggedIn === 'function' && !Auth.isLoggedIn()) {
      window.location.href = '../login/login.html';
      return;
    }
    const res = (api && api.inventory) ? await api.inventory.list({ page: 0, size: 200 }).catch(() => []) : [];
    const items = Array.isArray(res) ? res : (res && res.content ? res.content : []);
    inventoryItems = items.map(apiToInventoryItem);

    // Fetch real movements from DB
    let movItems = [];
    if (api && api.inventory && typeof api.inventory.allMovements === 'function') {
      try {
        const movRes = await api.inventory.allMovements({ page: 0, size: 5 });
        movItems = Array.isArray(movRes) ? movRes : (movRes && movRes.content ? movRes.content : []);
      } catch (_) {}
    }
    stockMovements = movItems.map(m => ({
      date: m.createdAt ? String(m.createdAt).slice(0, 10) : '—',
      item: m.itemName || (m.item ? m.item.name : 'Material'),
      type: m.movementType || 'Adjustment',
      qty: (Number(m.quantity) >= 0 ? '+ ' : '') + m.quantity + ' ' + (m.unit || 'units'),
      ref: m.referenceNumber || ('MV-' + (m.id ? String(m.id).slice(0, 6) : '001'))
    }));

    // Fetch real backend KPIs
    let kpiData = null;
    if (api && api.inventory && typeof api.inventory.kpis === 'function') {
      try {
        kpiData = await api.inventory.kpis();
      } catch (kpiErr) {
        console.warn('[Inventory] /inventory/kpis failed:', kpiErr);
      }
    }

    renderInventoryTable();
    updateKPISummaries(kpiData);
    renderCategorySummaryCards(kpiData);
    updateCategoryTabs();
    renderStockAlerts();
    renderStockValueByCategory(kpiData);
    renderTopConsumedItems();
    renderMovementsTable();
    populateAdjustmentDropdown();
  } catch (err) {
    console.error('[Inventory] Failed to load inventory from backend:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initDateTimeClock();
  initSearchShortcuts();
  loadInventoryFromApi();

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Close context menu on outside click
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('rowContextMenu');
    if (menu && !menu.contains(e.target) && !e.target.closest('.btn-row-action')) {
      menu.style.display = 'none';
    }
  });
});

/**
 * Handle Remote Image Fallback
 */
function handleImgError(img) {
  img.onerror = null;
  img.src = FALLBACK_IMG;
}

/**
 * Real-time Header Clock
 */
function initDateTimeClock() {
  const dateEl = document.getElementById('headerDateText');
  const timeEl = document.getElementById('headerTimeText');
  if (!dateEl || !timeEl) return;

  function update() {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[now.getDay()];
    const day = String(now.getDate()).padStart(2, '0');
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    dateEl.textContent = `${dayName}, ${day} ${month} ${year}`;

    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }

  update();
  setInterval(update, 30000);
}

/**
 * Keyboard Shortcut (⌘K / Ctrl+K)
 */
function initSearchShortcuts() {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      focusGlobalSearch();
    }
  });
}

function focusGlobalSearch() {
  const inp = document.getElementById('inventorySearchInput') || document.getElementById('globalSearchInput');
  if (inp) inp.focus();
}

// ─────────────────────────────────────────────
// 4. TABLE RENDERING & FILTERING
// ─────────────────────────────────────────────
function getFilteredItems() {
  return inventoryItems.filter(item => {
    // Tab category filter
    if (currentTab !== 'all') {
      if (currentTab === 'Fabrics' && item.category !== 'Fabrics') return false;
      if (currentTab === 'Trims' && !['Linings', 'Threads', 'Buttons & Hooks', 'Zips & Fasteners', 'Embellishments'].includes(item.category)) return false;
      if (currentTab === 'Consumables' && !['Threads', 'Others'].includes(item.category)) return false;
      if (currentTab === 'Packaging' && item.category !== 'Packaging') return false;
      if (currentTab === 'Others' && item.category !== 'Others') return false;
    }

    // Modal filters
    if (activeFilters.category && item.category !== activeFilters.category) return false;
    if (activeFilters.status && item.status !== activeFilters.status) return false;
    if (activeFilters.minStock !== null && item.available < activeFilters.minStock) return false;
    if (activeFilters.maxStock !== null && item.available > activeFilters.maxStock) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.variant && item.variant.toLowerCase().includes(q)) ||
        (item.supplier && item.supplier.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;

  const filtered = getFilteredItems();
  const total = filtered.length;
  const totalPages = Math.ceil(total / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = 1;

  const start = (currentPage - 1) * itemsPerPage;
  const end = Math.min(start + itemsPerPage, total);
  const pageItems = filtered.slice(start, end);

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align: center; padding: 24px; color: rgba(255,255,255,0.45);">
          No matching inventory items found.
        </td>
      </tr>
    `;
    updatePaginationControls(0, 0, 0, 1);
    return;
  }

  tbody.innerHTML = pageItems.map(item => {
    const statusClass = item.status.toLowerCase().replace(/\s+/g, '-');

    return `
      <tr onclick="handleRowSelect(event, '${item.code}')">
        <td class="item-code-cell">${item.code}</td>
        <td>
          <div class="item-thumb-row">
            <div class="item-thumb-wrap">
              <img src="${item.image || FALLBACK_IMG}" alt="${item.name}" loading="lazy" onerror="handleImgError(this)" />
            </div>
            <span class="item-name-text">${item.name}</span>
          </div>
        </td>
        <td>${item.category}</td>
        <td>${item.variant || '—'}</td>
        <td>${item.unit}</td>
        <td>${item.stockQty}</td>
        <td>${item.reserved}</td>
        <td style="font-weight: 700; color: #ffffff;">${item.available}</td>
        <td>${item.reorderLevel}</td>
        <td>
          <span class="badge-status ${statusClass}">${item.status}</span>
        </td>
        <td onclick="event.stopPropagation()">
          <button class="btn-row-action" onclick="openRowActionMenu(event, '${item.code}')" title="Actions">•••</button>
        </td>
        <td></td>
      </tr>
    `;
  }).join('');

  updatePaginationControls(start + 1, end, total, totalPages);
}

function updatePaginationControls(start, end, total, totalPages) {
  const info = document.getElementById('paginationInfo');
  if (info) {
    info.textContent = total === 0 ? 'Showing 0 of 0 items' : `Showing ${start}–${end} of ${total} items`;
  }

  const controls = document.getElementById('paginationControls');
  if (!controls) return;

  let btnsHtml = `
    <button class="page-nav-btn prev" onclick="changePage(-1)" ${currentPage === 1 ? 'disabled style="opacity:0.3;"' : ''}>‹</button>
  `;

  for (let p = 1; p <= Math.min(5, totalPages); p++) {
    btnsHtml += `
      <button class="page-num-btn ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>
    `;
  }

  if (totalPages > 5) {
    btnsHtml += `<span class="page-dots">…</span>`;
  }

  btnsHtml += `
    <button class="page-nav-btn next" onclick="changePage(1)" ${currentPage === totalPages ? 'disabled style="opacity:0.3;"' : ''}>›</button>
  `;

  controls.innerHTML = btnsHtml;
}

function changePage(delta) {
  const filtered = getFilteredItems();
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const newPage = currentPage + delta;
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    renderInventoryTable();
  }
}

function goToPage(p) {
  currentPage = p;
  renderInventoryTable();
}

function setInventoryTab(tab, btn) {
  currentTab = tab;
  currentPage = 1;
  document.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderInventoryTable();
}

function selectCategoryFilter(category) {
  activeFilters.category = category;
  currentPage = 1;
  renderInventoryTable();
  showToast(`Filtered inventory by category: ${category}`);
}

function handleInventorySearch() {
  const input = document.getElementById('inventorySearchInput');
  searchQuery = input ? input.value.trim() : '';
  currentPage = 1;
  renderInventoryTable();
}

// ─────────────────────────────────────────────
// 5. KPI & METRICS CALCULATIONS (REAL DATABASE-DERIVED)
// ─────────────────────────────────────────────
function updateKPISummaries(kpiData) {
  const totalItems = kpiData?.totalItems != null ? Number(kpiData.totalItems) : inventoryItems.length;
  const totalValue = kpiData?.totalValue != null ? Number(kpiData.totalValue) : inventoryItems.reduce((acc, i) => acc + (i.available * (i.purchasePrice || 0)), 0);
  const lowStockCount = kpiData?.lowStockCount != null ? Number(kpiData.lowStockCount) : inventoryItems.filter(i => i.status === 'Low Stock' || (i.available > 0 && i.available <= i.reorderLevel)).length;
  const outOfStockCount = kpiData?.outOfStockCount != null ? Number(kpiData.outOfStockCount) : inventoryItems.filter(i => i.status === 'Out of Stock' || i.available <= 0).length;
  const onOrderCount = inventoryItems.filter(i => i.status === 'On Order').length;

  const elTotal = document.getElementById('kpiTotalItems');
  const elValue = document.getElementById('kpiTotalStockValue');
  const elLow   = document.getElementById('kpiLowStockItems');
  const elOut   = document.getElementById('kpiOutOfStock');
  const elOrder = document.getElementById('kpiOnOrder');
  const elDonut = document.getElementById('donutCategoryTotal');

  if (elTotal) elTotal.textContent = totalItems.toLocaleString('en-IN');
  if (elValue) elValue.textContent = '₹' + Math.round(totalValue).toLocaleString('en-IN');
  if (elLow)   elLow.textContent   = lowStockCount.toLocaleString('en-IN');
  if (elOut)   elOut.textContent   = outOfStockCount.toLocaleString('en-IN');
  if (elOrder) elOrder.textContent = onOrderCount.toLocaleString('en-IN');
  if (elDonut) elDonut.textContent = totalItems.toLocaleString('en-IN');

  const subTotal = document.getElementById('subtextTotalItems');
  if (subTotal) subTotal.textContent = totalItems > 0 ? `${totalItems} registered` : '0 items registered';

  const subVal = document.getElementById('subtextStockValue');
  if (subVal) subVal.textContent = totalValue > 0 ? `₹${Math.round(totalValue).toLocaleString('en-IN')} total valuation` : '₹0 stock valuation';

  const subLow = document.getElementById('subtextLowStock');
  if (subLow) subLow.textContent = lowStockCount > 0 ? `${lowStockCount} items need attention` : '0 items low';

  const subOut = document.getElementById('subtextOutOfStock');
  if (subOut) subOut.textContent = outOfStockCount > 0 ? `${outOfStockCount} items out of stock` : '0 items out of stock';

  const subOrder = document.getElementById('subtextOnOrder');
  if (subOrder) subOrder.textContent = onOrderCount > 0 ? `${onOrderCount} orders pending` : '0 orders pending';

  // Update Category Donut SVG and Legend
  const svg = document.getElementById('donutCategorySvg') || document.querySelector('.donut-svg');
  const legend = document.getElementById('donutCategoryLegend') || document.querySelector('.donut-legend');

  const breakdown = (kpiData && kpiData.categoryBreakdown && Array.isArray(kpiData.categoryBreakdown) && kpiData.categoryBreakdown.length > 0)
    ? kpiData.categoryBreakdown
    : (() => {
        const counts = {};
        inventoryItems.forEach(i => { counts[i.category] = (counts[i.category] || 0) + 1; });
        return Object.entries(counts).map(([category, count]) => ({ category, count }));
      })();

  if (totalItems === 0 || breakdown.length === 0) {
    if (svg) svg.innerHTML = '<circle cx="50" cy="50" r="38" class="donut-bg" />';
    if (legend) legend.innerHTML = '<div class="legend-title">Items by Category</div><div style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 8px;">No categories logged</div>';
    return;
  }

  const colors = ['#a3e635', '#c084fc', '#fbbf24', '#f472b6', '#38bdf8', '#fb7185'];
  const circum = 239;
  let offset = 0;

  if (svg) {
    let svgHtml = '<circle cx="50" cy="50" r="38" class="donut-bg" />';
    breakdown.forEach((cat, idx) => {
      const count = Number(cat.count) || 0;
      const segLen = Math.round((count / totalItems) * circum);
      const color = colors[idx % colors.length];
      svgHtml += `<circle cx="50" cy="50" r="38" class="donut-seg" stroke="${color}" stroke-dasharray="${segLen} ${circum}" stroke-dashoffset="${-offset}" />`;
      offset += segLen;
    });
    svg.innerHTML = svgHtml;
  }

  if (legend) {
    let legHtml = '<div class="legend-title">Items by Category</div>';
    breakdown.forEach((cat, idx) => {
      const count = Number(cat.count) || 0;
      const pct = Math.round((count / totalItems) * 100);
      const color = colors[idx % colors.length];
      legHtml += `
        <div class="leg-row">
          <span class="leg-dot" style="background:${color};"></span>
          <span class="leg-text">${cat.category}</span>
          <span class="leg-val">${pct}%</span>
        </div>`;
    });
    legend.innerHTML = legHtml;
  }
}

function renderCategorySummaryCards() {
  const catConfig = [
    { key: 'Fabrics', id: 'Fabrics' },
    { key: 'Linings', id: 'Linings' },
    { key: 'Threads', id: 'Threads' },
    { key: 'Buttons & Hooks', id: 'Buttons' },
    { key: 'Zips & Fasteners', id: 'Zips' },
    { key: 'Embellishments', id: 'Embellishments' },
    { key: 'Packaging', id: 'Packaging' },
    { key: 'Others', id: 'Others' }
  ];

  catConfig.forEach(cat => {
    const inCat = inventoryItems.filter(i => {
      if (cat.key === 'Buttons & Hooks') return i.category === 'Buttons & Hooks' || i.category === 'Buttons';
      if (cat.key === 'Zips & Fasteners') return i.category === 'Zips & Fasteners' || i.category === 'Zips';
      return i.category === cat.key;
    });
    const totalCount = inCat.length;
    const inStockCount = inCat.filter(i => i.available > 0).length;
    const pct = totalCount > 0 ? Math.round((inStockCount / totalCount) * 100) : 0;

    const countEl = document.getElementById(`catCount-${cat.id}`);
    const barEl = document.getElementById(`catBar-${cat.id}`);
    const pctEl = document.getElementById(`catPct-${cat.id}`);

    if (countEl) countEl.textContent = `${totalCount} items`;
    if (barEl) barEl.style.width = `${pct}%`;
    if (pctEl) pctEl.textContent = `${pct}% in stock`;
  });
}

function updateCategoryTabs() {
  const allCount = inventoryItems.length;
  const fabricsCount = inventoryItems.filter(i => i.category === 'Fabrics').length;
  const trimsCount = inventoryItems.filter(i => ['Linings', 'Threads', 'Buttons & Hooks', 'Buttons', 'Zips & Fasteners', 'Zips', 'Embellishments'].includes(i.category)).length;
  const consumablesCount = inventoryItems.filter(i => ['Threads', 'Others'].includes(i.category)).length;
  const packagingCount = inventoryItems.filter(i => i.category === 'Packaging').length;
  const othersCount = inventoryItems.filter(i => i.category === 'Others').length;

  const setTab = (id, cnt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `(${cnt})`;
  };

  setTab('tabCount-all', allCount);
  setTab('tabCount-Fabrics', fabricsCount);
  setTab('tabCount-Trims', trimsCount);
  setTab('tabCount-Consumables', consumablesCount);
  setTab('tabCount-Packaging', packagingCount);
  setTab('tabCount-Others', othersCount);
}

function renderStockValueByCategory(kpiData) {
  const totalValEl = document.getElementById('stockValTotal');
  const svgEl = document.getElementById('stockValSvg');
  const legendEl = document.getElementById('stockValLegend');

  const catValMap = {};
  let totalVal = 0;
  inventoryItems.forEach(i => {
    const v = Number(i.available) * (Number(i.purchasePrice) || 0);
    const c = i.category || 'Others';
    catValMap[c] = (catValMap[c] || 0) + v;
    totalVal += v;
  });

  if (kpiData && kpiData.totalValue != null) {
    totalVal = Number(kpiData.totalValue);
  }

  if (totalValEl) {
    if (totalVal >= 100000) {
      totalValEl.textContent = '₹' + (totalVal / 100000).toFixed(2) + 'L';
    } else {
      totalValEl.textContent = '₹' + Math.round(totalVal).toLocaleString('en-IN');
    }
  }

  if (totalVal === 0 || Object.keys(catValMap).length === 0) {
    if (svgEl) svgEl.innerHTML = '<circle cx="50" cy="50" r="38" class="donut-bg" />';
    if (legendEl) legendEl.innerHTML = '<div style="color: rgba(255,255,255,0.4); font-size: 12px; padding: 12px 0;">No stock value logged</div>';
    return;
  }

  const colors = ['#a3e635', '#c084fc', '#fbbf24', '#f472b6', '#38bdf8', '#fb7185'];
  const circum = 239;
  let offset = 0;
  let svgHtml = '<circle cx="50" cy="50" r="38" class="donut-bg" />';
  let legHtml = '';

  const entries = Object.entries(catValMap).sort((a, b) => b[1] - a[1]);
  entries.forEach(([cat, val], idx) => {
    const pct = totalVal > 0 ? Math.round((val / totalVal) * 100) : 0;
    const segLen = Math.round((pct / 100) * circum);
    const color = colors[idx % colors.length];

    svgHtml += `<circle cx="50" cy="50" r="38" class="donut-seg" stroke="${color}" stroke-dasharray="${segLen} ${circum}" stroke-dashoffset="${-offset}" />`;
    offset += segLen;

    const valFmt = val >= 100000 ? `₹${(val / 100000).toFixed(2)}L` : `₹${Math.round(val).toLocaleString('en-IN')}`;
    legHtml += `
      <div class="val-leg-row">
        <span class="val-dot" style="background:${color};"></span>
        <span class="val-name">${cat}</span>
        <span class="val-pct">${pct}%</span>
        <span class="val-num">${valFmt}</span>
      </div>`;
  });

  if (svgEl) svgEl.innerHTML = svgHtml;
  if (legendEl) legendEl.innerHTML = legHtml;
}

function renderTopConsumedItems() {
  const container = document.getElementById('consumedBarsList');
  if (!container) return;

  const consumed = inventoryItems
    .filter(i => (i.reserved && i.reserved > 0) || (i.stockQty > i.available))
    .map(i => ({
      name: i.name,
      val: (i.stockQty - i.available) || i.reserved,
      unit: i.unit || 'units'
    }))
    .sort((a, b) => b.val - a.val)
    .slice(0, 5);

  if (consumed.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 24px; color: rgba(255,255,255,0.4); font-size: 13px;">No material consumption recorded yet.</div>';
    return;
  }

  const maxVal = Math.max(...consumed.map(c => c.val), 1);
  const colors = ['green', 'yellow', 'pink', 'purple', 'blue'];

  container.innerHTML = consumed.map((c, idx) => {
    const pct = Math.min(100, Math.round((c.val / maxVal) * 100));
    const col = colors[idx % colors.length];
    return `
      <div class="consumed-bar-row">
        <span class="cb-name">${c.name}</span>
        <div class="cb-track">
          <div class="cb-fill ${col}" style="width: ${pct}%;"></div>
        </div>
        <span class="cb-val">${c.val} ${c.unit}</span>
      </div>`;
  }).join('');
}

// ─────────────────────────────────────────────
// 6. STOCK MOVEMENTS TABLE
// ─────────────────────────────────────────────
function renderMovementsTable() {
  const tbody = document.getElementById('movementsTableBody');
  if (!tbody) return;

  if (stockMovements.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: rgba(255,255,255,0.45);">No recent stock movements recorded.</td></tr>';
    return;
  }

  tbody.innerHTML = stockMovements.slice(0, 5).map(mv => {
    const isNeg = String(mv.qty).startsWith('-');
    const tagClass = (mv.type || '').toLowerCase();

    return `
      <tr>
        <td>${mv.date}</td>
        <td class="item-cell-name">${mv.item}</td>
        <td><span class="mv-tag ${tagClass}">${mv.type}</span></td>
        <td class="mv-qty ${isNeg ? 'neg' : 'pos'}">${mv.qty}</td>
        <td class="mv-ref">${mv.ref}</td>
      </tr>
    `;
  }).join('');
}

// ─────────────────────────────────────────────
// 7. STOCK ALERTS INTERACTION
// ─────────────────────────────────────────────
function renderStockAlerts() {
  const lowCount = inventoryItems.filter(i => i.status === 'Low Stock' || (i.available > 0 && i.available <= i.reorderLevel)).length;
  const outCount = inventoryItems.filter(i => i.status === 'Out of Stock' || i.available <= 0).length;
  const orderCount = inventoryItems.filter(i => i.status === 'On Order').length;

  const elLow = document.getElementById('alertCountLow');
  const elOut = document.getElementById('alertCountOut');
  const elOrder = document.getElementById('alertCountOrder');

  if (elLow) elLow.textContent = lowCount;
  if (elOut) elOut.textContent = outCount;
  if (elOrder) elOrder.textContent = orderCount;

  setAlertsTab(activeAlertsTab);
}

function setAlertsTab(tab, btn) {
  if (tab) activeAlertsTab = tab;
  document.querySelectorAll('.alerts-subtab').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const matchingBtn = document.querySelector(`.alerts-subtab[onclick*="'${activeAlertsTab}'"]`);
    if (matchingBtn) matchingBtn.classList.add('active');
  }

  const list = document.getElementById('alertsItemsList');
  if (!list) return;

  let filtered = [];
  if (activeAlertsTab === 'low') {
    filtered = inventoryItems.filter(i => i.status === 'Low Stock' || (i.available > 0 && i.available <= i.reorderLevel));
  } else if (activeAlertsTab === 'out') {
    filtered = inventoryItems.filter(i => i.status === 'Out of Stock' || i.available <= 0);
  } else {
    filtered = inventoryItems.filter(i => i.status === 'On Order');
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div style="text-align: center; padding: 32px 16px; color: rgba(255,255,255,0.4); font-size: 13px;">No stock alerts in this category.</div>';
    return;
  }

  list.innerHTML = filtered.map(it => `
    <div class="alert-item-row" onclick="inspectAlertItem('${it.code}')">
      <div class="air-thumb-wrap">
        <img src="${it.image || FALLBACK_IMG}" alt="${it.name}" onerror="handleImgError(this)" />
      </div>
      <div class="air-meta">
        <span class="air-name">${it.name}</span>
        <span class="air-code">${it.code}</span>
      </div>
      <div class="air-quantities">
        <span class="air-left alert">${it.available} left</span>
        <span class="air-reorder">Reorder at ${it.reorderLevel}</span>
      </div>
      <button class="air-action-btn" title="View Item">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>
  `).join('');
}

function inspectAlertItem(code) {
  const item = inventoryItems.find(i => i.code === code);
  if (item) {
    openItemDetailsModal(item);
  } else {
    showToast(`Navigating to alert item: ${code}`);
  }
}

// ─────────────────────────────────────────────
// 8. ADD NEW ITEM WORKFLOW
// ─────────────────────────────────────────────
function openAddItemModal() {
  const form = document.getElementById('addItemForm');
  if (form) form.reset();
  openModal('addItemModal');
}

async function handleSaveNewItem(e) {
  e.preventDefault();

  const name = document.getElementById('newItemName').value.trim();
  const category = document.getElementById('newItemCategory').value;
  const variant = document.getElementById('newItemVariant').value.trim();
  const supplier = document.getElementById('newItemSupplier').value.trim();
  const unit = document.getElementById('newItemUnit').value;
  const stock = parseFloat(document.getElementById('newItemStockQty').value) || 0;
  const reorder = parseFloat(document.getElementById('newItemReorderLevel').value) || 0;
  const price = parseFloat(document.getElementById('newItemPurchasePrice').value) || 0;
  const customImg = document.getElementById('newItemImage').value.trim();
  const notes = document.getElementById('newItemNotes') ? document.getElementById('newItemNotes').value.trim() : '';

  try {
    const api = await getApi();
    if (api && api.inventory && typeof api.inventory.create === 'function') {
      const payload = {
        name,
        category,
        variant,
        unit,
        stockQty: stock,
        reservedQty: 0,
        reorderLevel: reorder,
        purchasePrice: price,
        sellingPrice: price,
        supplierName: supplier,
        imageUrl: customImg || '',
        notes
      };
      await api.inventory.create(payload);
      closeModal('addItemModal');
      await loadInventoryFromApi();
      showToast(`Item "${name}" created and saved to database!`);
    } else {
      throw new Error('Inventory API not available');
    }
  } catch (err) {
    console.error('[Inventory] Error saving item:', err);
    showToast(`Failed to add item: ${err.message || 'Server error'}`);
  }
}

// ─────────────────────────────────────────────
// 9. STOCK ADJUSTMENT WORKFLOW
// ─────────────────────────────────────────────
function populateAdjustmentDropdown() {
  const sel = document.getElementById('adjItemSelect');
  if (!sel) return;

  sel.innerHTML = '<option value="">-- Choose Item to Adjust --</option>' +
    inventoryItems.slice(0, 50).map(item => `
      <option value="${item.code}">${item.code} — ${item.name} (${item.available} ${item.unit} avail)</option>
    `).join('');
}

function openStockAdjustmentModal(targetCode = null) {
  const sel = document.getElementById('adjItemSelect');
  if (sel && targetCode) {
    sel.value = targetCode;
  }
  openModal('stockAdjustmentModal');
}

function handleAdjItemChange(sel) {
  // Can be extended to load dynamic details
}

async function handleSaveAdjustment(e) {
  e.preventDefault();

  const code = document.getElementById('adjItemSelect').value;
  const type = document.getElementById('adjType').value;
  const qty = parseFloat(document.getElementById('adjQuantity').value) || 0;
  const ref = document.getElementById('adjReference').value.trim() || `ADJ-${Date.now().toString().slice(-6)}`;
  const reason = document.getElementById('adjReason').value.trim();
  const notes = document.getElementById('adjNotes')?.value?.trim();

  const item = inventoryItems.find(i => i.code === code);
  if (!item) {
    showToast('Please select a valid item.');
    return;
  }

  let isPositive = (type === 'Add Stock' || type === 'Return');
  let movType = 'ADJUSTMENT';
  if (type === 'Add Stock') movType = 'RECEIPT';
  else if (type === 'Remove Stock') movType = 'ISSUE';
  else if (type === 'Return') movType = 'RETURN';
  else movType = 'ADJUSTMENT';

  const adjustQty = isPositive ? qty : -qty;

  try {
    const api = await getApi();
    if (api && api.inventory && item.id) {
      await api.inventory.adjust(item.id, {
        quantity: adjustQty,
        movementType: movType,
        reference: ref,
        reason: [reason, notes].filter(Boolean).join(' - ') || 'Manual Stock Adjustment'
      });
      closeModal('stockAdjustmentModal');
      await loadInventoryFromApi();
      showToast(`Stock updated for ${item.name} (${type}: ${qty} ${item.unit})`);
    } else {
      throw new Error('Item ID or Inventory API not available');
    }
  } catch (err) {
    console.error('[Inventory] Error adjusting stock:', err);
    showToast(`Adjustment failed: ${err.message || 'Server error'}`);
  }
}

// ─────────────────────────────────────────────
// 10. ROW ACTIONS & CONTEXT MENU
// ─────────────────────────────────────────────
function openRowActionMenu(event, code) {
  event.stopPropagation();
  contextTargetCode = code;

  const menu = document.getElementById('rowContextMenu');
  if (!menu) return;

  menu.style.display = 'flex';
  menu.style.left = `${Math.min(window.innerWidth - 180, event.pageX - 120)}px`;
  menu.style.top = `${Math.min(window.innerHeight - 150, event.pageY + 10)}px`;
}

function handleMenuAction(action) {
  const menu = document.getElementById('rowContextMenu');
  if (menu) menu.style.display = 'none';

  const item = inventoryItems.find(i => i.code === contextTargetCode);
  if (!item) return;

  if (action === 'view' || action === 'history') {
    openItemDetailsModal(item);
  } else if (action === 'adjust') {
    openStockAdjustmentModal(item.code);
  } else if (action === 'request') {
    openPurchaseRequestModal(item.name);
  } else if (action === 'supplier') {
    showToast(`Supplier for ${item.name}: ${item.supplier || 'None recorded'}`);
  }
}

function handleRowSelect(event, code) {
  const item = inventoryItems.find(i => i.code === code);
  if (item) {
    openItemDetailsModal(item);
  }
}

// ─────────────────────────────────────────────
// 11. ITEM DETAILS MODAL
// ─────────────────────────────────────────────
async function openItemDetailsModal(item) {
  const title = document.getElementById('idmItemTitle');
  const content = document.getElementById('idmContent');
  if (!title || !content) return;

  title.textContent = `${item.name} (${item.code})`;
  contextTargetCode = item.code;

  let movementsHtml = '<div style="text-align: center; font-size: 8.5px; opacity: 0.5; padding: 10px 0;">No stock movements recorded for this item.</div>';

  let itemMovs = [];
  try {
    const api = await getApi();
    if (api && api.inventory && item.id) {
      const res = await api.inventory.movementsForItem(item.id);
      itemMovs = Array.isArray(res) ? res : (res && res.content ? res.content : []);
    }
  } catch (_) {
    itemMovs = [];
  }

  if (itemMovs.length > 0) {
    movementsHtml = itemMovs.map(m => {
      const isNeg = Number(m.quantity) < 0;
      const dateStr = m.createdAt ? String(m.createdAt).slice(0, 10) : '—';
      const refStr = m.reference || ('MV-' + (m.id ? String(m.id).slice(0, 6) : '001'));
      return `
        <div style="display: flex; justify-content: space-between; font-size: 8.5px; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.04);">
          <span>${dateStr}</span>
          <span style="color: ${isNeg ? '#fb7185' : '#4ade80'};">${isNeg ? '' : '+'}${m.quantity} ${item.unit} (${m.movementType || 'Adjustment'})</span>
          <span style="font-family: var(--font-mono); opacity: 0.6;">${refStr}</span>
        </div>
      `;
    }).join('');
  }

  content.innerHTML = `
    <div style="display: flex; gap: 12px; margin-bottom: 12px;">
      <div style="width: 72px; height: 72px; border-radius: 8px; overflow: hidden; background: #231b16; border: 1px solid rgba(255,255,255,0.15); flex-shrink: 0;">
        <img src="${item.image || FALLBACK_IMG}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;" onerror="handleImgError(this)" />
      </div>
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <h4 style="font-size: 13px; font-weight: 800; color: #fff;">${item.name}</h4>
        <span style="font-size: 9.5px; color: rgba(255,255,255,0.6);">${item.category} • Variant: ${item.variant || '—'}</span>
        <span style="font-size: 9.5px; color: rgba(255,255,255,0.6);">Supplier: ${item.supplier || '—'}</span>
        <span style="font-size: 9px; font-weight: 700; color: #a3e635; margin-top: 3px;">Unit Cost: ₹${item.purchasePrice || 0} / ${item.unit}</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px; margin-bottom: 12px;">
      <div style="text-align: center;">
        <span style="font-size: 8px; color: rgba(255,255,255,0.5); display: block;">Total Stock</span>
        <span style="font-size: 12px; font-weight: 800; color: #fff;">${item.stockQty}</span>
      </div>
      <div style="text-align: center;">
        <span style="font-size: 8px; color: rgba(255,255,255,0.5); display: block;">Reserved</span>
        <span style="font-size: 12px; font-weight: 800; color: #fbbf24;">${item.reserved}</span>
      </div>
      <div style="text-align: center;">
        <span style="font-size: 8px; color: rgba(255,255,255,0.5); display: block;">Available</span>
        <span style="font-size: 12px; font-weight: 800; color: #a3e635;">${item.available}</span>
      </div>
      <div style="text-align: center;">
        <span style="font-size: 8px; color: rgba(255,255,255,0.5); display: block;">Reorder Level</span>
        <span style="font-size: 12px; font-weight: 800; color: #f87171;">${item.reorderLevel}</span>
      </div>
    </div>

    <h5 style="font-size: 9.5px; font-weight: 700; color: rgba(255,255,255,0.85); margin-bottom: 4px;">Recent Movements for this Material</h5>
    <div style="max-height: 100px; overflow-y: auto; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 4px 6px;">
      ${movementsHtml}
    </div>
  `;

  openModal('itemDetailsModal');
}

function openAdjForItem() {
  closeModal('itemDetailsModal');
  if (contextTargetCode) {
    openStockAdjustmentModal(contextTargetCode);
  }
}

// ─────────────────────────────────────────────
// 12. FILTER MODAL
// ─────────────────────────────────────────────
function openFilterModal() {
  openModal('filterModal');
}

function handleApplyFilters(e) {
  e.preventDefault();
  activeFilters.category = document.getElementById('filterCategory').value;
  activeFilters.status = document.getElementById('filterStatus').value;

  const minVal = document.getElementById('filterMinStock').value;
  const maxVal = document.getElementById('filterMaxStock').value;
  activeFilters.minStock = minVal !== '' ? parseInt(minVal, 10) : null;
  activeFilters.maxStock = maxVal !== '' ? parseInt(maxVal, 10) : null;

  currentPage = 1;
  closeModal('filterModal');
  renderInventoryTable();
  showToast('Filters applied to inventory view.');
}

function handleResetFilters() {
  activeFilters = { category: '', status: '', minStock: null, maxStock: null };
  const form = document.getElementById('filterForm');
  if (form) form.reset();
  currentPage = 1;
  closeModal('filterModal');
  renderInventoryTable();
  showToast('Filters reset to default.');
}

// ─────────────────────────────────────────────
// 13. QUICK ACTIONS & EXPORT
// ─────────────────────────────────────────────
function openPurchaseRequestModal(itemName = null) {
  showToast(itemName ? `Opening Purchase Request for ${itemName}...` : 'Opening Purchase Request creation dialog...');
}

function openPurchaseOrderModal() {
  showToast('Opening Purchase Order creation dialog...');
}

function openStockValuationModal() {
  const totalVal = inventoryItems.reduce((acc, i) => acc + (i.available * (i.purchasePrice || 0)), 0);
  const formattedVal = totalVal >= 100000 ? `₹${(totalVal / 100000).toFixed(2)}L` : `₹${Math.round(totalVal).toLocaleString('en-IN')}`;
  showToast(`Total Stock Valuation: ${formattedVal} across ${inventoryItems.length} items.`);
}

function openAllAlertsModal() {
  showToast('Viewing full Stock Alerts audit report...');
}

function openAllMovementsModal() {
  showToast('Viewing complete Stock Movements Ledger...');
}

function exportInventoryCSV() {
  const filtered = getFilteredItems();
  const headers = ['Item Code', 'Item Name', 'Category', 'Colour/Variant', 'Unit', 'Stock Qty', 'Reserved', 'Available', 'Reorder Level', 'Status', 'Purchase Price'];
  const rows = filtered.map(i => [
    `"${i.code}"`,
    `"${i.name}"`,
    `"${i.category}"`,
    `"${i.variant || ''}"`,
    `"${i.unit}"`,
    i.stockQty,
    i.reserved,
    i.available,
    i.reorderLevel,
    `"${i.status}"`,
    i.purchasePrice || 0
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Exported ${filtered.length} inventory items to CSV!`);
}

// ─────────────────────────────────────────────
// 14. MODAL & TOAST HELPERS
// ─────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#a3e635" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}
