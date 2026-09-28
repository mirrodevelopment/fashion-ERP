/**
 * HAULO BOUTIQUE ERP — Inventory Command Centre Logic
 * Manages Stock Levels, Categories, Live Search/Filter, Pagination, Stock Alerts,
 * Movements, Top Consumed Items, Donut Charts, and Stock Adjustments.
 * Path: front end/inventory/inventory.js
 */

// Fallback image in case an external image fails to load
const FALLBACK_IMG = '../assets/fabrics/silk.jpg';

// Local Image Dictionary for Boutique Materials
const MATERIAL_IMG_MAP = {
  'Banarasi Silk': '../assets/fabrics/silk.jpg',
  'Georgette': '../assets/fabrics/georgette.jpg',
  'Satoon Lining': '../assets/fabrics/lining.jpg',
  'Embroidery Thread': '../assets/fabrics/thread-gold.jpg',
  'Designer Button': '../assets/fabrics/button-gold.jpg',
  'Invisible Zip': '../assets/fabrics/zipper.jpg',
  'Zardosi Motif': '../assets/fabrics/zari-motif.jpg',
  'Garment Cover': '../assets/fabrics/lining.jpg',
  'Pearl Beads 4mm': '../assets/fabrics/button-gold.jpg',
  'Hook Set': '../assets/fabrics/zipper.jpg',
  'Satoon Lining (Black)': '../assets/fabrics/lining.jpg',
  default: '../assets/fabrics/silk.jpg'
};

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
    supplier: i.supplierName || 'Primary Supplier',
    purchasePrice: Number(i.purchasePrice) || 0,
    image: i.imageUrl || MATERIAL_IMG_MAP[i.name] || MATERIAL_IMG_MAP.default
  };
}

async function loadInventoryFromApi() {
  try {
    const { default: api, Auth } = await import('../api.js');
    if (!Auth.isLoggedIn()) {
      window.location.href = '../login/login.html';
      return;
    }
    const res = await api.inventory.list({ page: 0, size: 100 });
    const items = Array.isArray(res) ? res : (res && res.content ? res.content : []);
    inventoryItems = items.map(apiToInventoryItem);

    // Generate movements from live database items
    stockMovements = inventoryItems.slice(0, 5).map((item, idx) => ({
      date: 'Live DB',
      item: item.name,
      type: idx % 2 === 0 ? 'Receive' : 'Issue',
      qty: (idx % 2 === 0 ? '+ ' : '- ') + Math.round(item.available * 0.1 || 5) + ' ' + (item.unit || 'units'),
      ref: 'INV-' + (item.code || '0001')
    }));

    renderInventoryTable();
    await updateKPISummaries();
    renderMovementsTable();
    populateAdjustmentDropdown();
  } catch (err) {
    console.error('[Inventory] Failed to load inventory from backend:', err.message);
  }
}

async function updateKPISummaries() {
  try {
    const { default: api } = await import('../api.js');
    const kpis = await api.inventory.kpis();
    if (!kpis) return;

    const elTotal = document.getElementById('kpiTotalItems');
    const elValue = document.getElementById('kpiTotalStockValue');
    const elLow   = document.getElementById('kpiLowStockItems');
    const elOut   = document.getElementById('kpiOutOfStock');
    const elDonut = document.getElementById('donutCategoryTotal');

    if (elTotal) elTotal.textContent = Number(kpis.totalItems || 0).toLocaleString('en-IN');
    if (elValue) elValue.textContent = '₹' + Number(kpis.totalValue || 0).toLocaleString('en-IN');
    if (elLow)   elLow.textContent   = Number(kpis.lowStockCount || 0).toLocaleString('en-IN');
    if (elOut)   elOut.textContent   = Number(kpis.outOfStockCount || 0).toLocaleString('en-IN');
    if (elDonut) elDonut.textContent = Number(kpis.totalItems || 0).toLocaleString('en-IN');

    // Update Category Donut SVG and Legend if breakdown available
    if (kpis.categoryBreakdown && Array.isArray(kpis.categoryBreakdown) && kpis.categoryBreakdown.length > 0) {
      const colors = ['#a3e635', '#c084fc', '#fbbf24', '#f472b6', '#38bdf8', '#fb7185'];
      const total = Number(kpis.totalItems) || 1;
      const circum = 239;
      let offset = 0;

      const svg = document.querySelector('.donut-svg');
      if (svg) {
        let svgHtml = '<circle cx="50" cy="50" r="38" class="donut-bg" />';
        kpis.categoryBreakdown.forEach((cat, idx) => {
          const count = Number(cat.count) || 0;
          const segLen = Math.round((count / total) * circum);
          const color = colors[idx % colors.length];
          svgHtml += `<circle cx="50" cy="50" r="38" class="donut-seg" stroke="${color}" stroke-dasharray="${segLen} ${circum}" stroke-dashoffset="${-offset}" />`;
          offset += segLen;
        });
        svg.innerHTML = svgHtml;
      }

      const legend = document.querySelector('.donut-legend');
      if (legend) {
        let legHtml = '<div class="legend-title">Items by Category</div>';
        kpis.categoryBreakdown.forEach((cat, idx) => {
          const count = Number(cat.count) || 0;
          const pct = Math.round((count / total) * 100);
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
  } catch (err) {
    console.error('[Inventory] Failed to load inventory KPIs:', err.message);
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
  const inp = document.getElementById('globalSearchInput');
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
// 5. KPI & METRICS CALCULATIONS
// ─────────────────────────────────────────────
async function updateKPISummaries() {
  try {
    const { default: api } = await import('../api.js');
    const kpis = await api.inventory.kpis().catch(() => null);
    if (kpis) {
      const kpiItems = document.getElementById('kpiTotalItems');
      if (kpiItems && kpis.totalItems != null) kpiItems.textContent = Number(kpis.totalItems).toLocaleString('en-IN');

      const kpiVal = document.getElementById('kpiTotalStockValue');
      if (kpiVal && kpis.totalStockValue != null) kpiVal.textContent = '₹' + Math.round(Number(kpis.totalStockValue)).toLocaleString('en-IN');

      const kpiLow = document.getElementById('kpiLowStockItems');
      if (kpiLow && kpis.lowStockItems != null) kpiLow.textContent = kpis.lowStockItems;

      const kpiOut = document.getElementById('kpiOutOfStock');
      if (kpiOut && kpis.outOfStockItems != null) kpiOut.textContent = kpis.outOfStockItems;

      const donutCatTotal = document.getElementById('donutCategoryTotal');
      if (donutCatTotal && kpis.totalItems != null) donutCatTotal.textContent = kpis.totalItems;
      return;
    }
  } catch (_) {}

  const totalItems = inventoryItems.length;
  let totalValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let onOrderCount = 0;

  inventoryItems.forEach(item => {
    totalValue += (item.available * (item.purchasePrice || 100));
    if (item.available <= 0) {
      outOfStockCount++;
    } else if (item.available <= item.reorderLevel) {
      lowStockCount++;
    }
    if (item.status === 'On Order') {
      onOrderCount++;
    }
  });

  const kpiItems = document.getElementById('kpiTotalItems');
  if (kpiItems) kpiItems.textContent = totalItems.toLocaleString('en-IN');

  const kpiVal = document.getElementById('kpiTotalStockValue');
  if (kpiVal) kpiVal.textContent = '₹' + Math.round(totalValue).toLocaleString('en-IN');

  const kpiLow = document.getElementById('kpiLowStockItems');
  if (kpiLow) kpiLow.textContent = lowStockCount;

  const kpiOut = document.getElementById('kpiOutOfStock');
  if (kpiOut) kpiOut.textContent = outOfStockCount;

  const kpiOrder = document.getElementById('kpiOnOrder');
  if (kpiOrder) kpiOrder.textContent = onOrderCount;

  const donutCatTotal = document.getElementById('donutCategoryTotal');
  if (donutCatTotal) donutCatTotal.textContent = totalItems;
}

// ─────────────────────────────────────────────
// 6. STOCK MOVEMENTS TABLE
// ─────────────────────────────────────────────
function renderMovementsTable() {
  const tbody = document.getElementById('movementsTableBody');
  if (!tbody) return;

  tbody.innerHTML = stockMovements.slice(0, 5).map(mv => {
    const isNeg = mv.qty.startsWith('-');
    const tagClass = mv.type.toLowerCase();

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
function setAlertsTab(tab, btn) {
  activeAlertsTab = tab;
  document.querySelectorAll('.alerts-subtab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const list = document.getElementById('alertsItemsList');
  if (!list) return;

  let filtered = [];
  if (tab === 'low') {
    filtered = inventoryItems.filter(i => i.status === 'Low Stock' || (i.available > 0 && i.available <= i.reorderLevel));
  } else if (tab === 'out') {
    filtered = inventoryItems.filter(i => i.status === 'Out of Stock' || i.available <= 0);
  } else {
    filtered = inventoryItems.filter(i => i.status === 'On Order');
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:12px;">No items in this alert category.</div>';
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

function handleSaveNewItem(e) {
  e.preventDefault();

  const name = document.getElementById('newItemName').value.trim();
  const code = document.getElementById('newItemCode').value.trim().toUpperCase();
  const category = document.getElementById('newItemCategory').value;
  const variant = document.getElementById('newItemVariant').value.trim() || 'Standard';
  const supplier = document.getElementById('newItemSupplier').value.trim() || 'Internal Stock';
  const unit = document.getElementById('newItemUnit').value;
  const stock = parseInt(document.getElementById('newItemStockQty').value, 10) || 0;
  const reorder = parseInt(document.getElementById('newItemReorderLevel').value, 10) || 20;
  const price = parseFloat(document.getElementById('newItemPurchasePrice').value) || 250;
  const customImg = document.getElementById('newItemImage').value.trim();

  // Status calculation
  let status = 'In Stock';
  if (stock <= 0) status = 'Out of Stock';
  else if (stock <= reorder) status = 'Low Stock';

  const newItem = {
    code: code,
    name: name,
    category: category,
    variant: variant,
    unit: unit,
    stockQty: stock,
    reserved: 0,
    available: stock,
    reorderLevel: reorder,
    status: status,
    supplier: supplier,
    purchasePrice: price,
    image: customImg || MATERIAL_IMG_MAP[name] || MATERIAL_IMG_MAP.default
  };

  // Prepend to list
  inventoryItems.unshift(newItem);

  // Record a movement
  stockMovements.unshift({
    date: '08 Sep 2026',
    item: name,
    type: 'Receive',
    qty: `+ ${stock} ${unit.toLowerCase()}`,
    ref: `INIT-${code}`
  });

  closeModal('addItemModal');
  updateKPISummaries();
  renderInventoryTable();
  renderMovementsTable();
  populateAdjustmentDropdown();

  showToast(`Item "${name}" added successfully with code ${code}!`);
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

function handleSaveAdjustment(e) {
  e.preventDefault();

  const code = document.getElementById('adjItemSelect').value;
  const type = document.getElementById('adjType').value;
  const qty = parseInt(document.getElementById('adjQuantity').value, 10) || 0;
  const ref = document.getElementById('adjReference').value.trim() || `ADJ-${Date.now().toString().slice(-6)}`;
  const reason = document.getElementById('adjReason').value.trim();

  const item = inventoryItems.find(i => i.code === code);
  if (!item) {
    alert('Please select a valid item.');
    return;
  }

  let isPositive = (type === 'Add Stock' || type === 'Return');
  if (isPositive) {
    item.stockQty += qty;
    item.available += qty;
  } else {
    item.stockQty = Math.max(0, item.stockQty - qty);
    item.available = Math.max(0, item.available - qty);
  }

  // Recalculate status
  if (item.available <= 0) {
    item.status = 'Out of Stock';
  } else if (item.available <= item.reorderLevel) {
    item.status = 'Low Stock';
  } else {
    item.status = 'In Stock';
  }

  // Append movement
  stockMovements.unshift({
    date: '08 Sep 2026',
    item: item.name,
    type: isPositive ? 'Receive' : 'Issue',
    qty: `${isPositive ? '+' : '-'} ${qty} ${item.unit.toLowerCase()}`,
    ref: ref
  });

  closeModal('stockAdjustmentModal');
  updateKPISummaries();
  renderInventoryTable();
  renderMovementsTable();

  showToast(`Stock updated for ${item.name} (${type}: ${qty} ${item.unit})`);
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
    showToast(`Supplier for ${item.name}: ${item.supplier || 'Varanasi Silks Ltd.'}`);
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
function openItemDetailsModal(item) {
  const title = document.getElementById('idmItemTitle');
  const content = document.getElementById('idmContent');
  if (!title || !content) return;

  title.textContent = `${item.name} (${item.code})`;
  contextTargetCode = item.code;

  content.innerHTML = `
    <div style="display: flex; gap: 12px; margin-bottom: 12px;">
      <div style="width: 72px; height: 72px; border-radius: 8px; overflow: hidden; background: #231b16; border: 1px solid rgba(255,255,255,0.15); flex-shrink: 0;">
        <img src="${item.image || FALLBACK_IMG}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;" onerror="handleImgError(this)" />
      </div>
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <h4 style="font-size: 13px; font-weight: 800; color: #fff;">${item.name}</h4>
        <span style="font-size: 9.5px; color: rgba(255,255,255,0.6);">${item.category} • Variant: ${item.variant || 'Standard'}</span>
        <span style="font-size: 9.5px; color: rgba(255,255,255,0.6);">Supplier: ${item.supplier || 'National Crafts Ltd.'}</span>
        <span style="font-size: 9px; font-weight: 700; color: #a3e635; margin-top: 3px;">Unit Cost: ₹${item.purchasePrice || 250} / ${item.unit}</span>
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
      <div style="display: flex; justify-content: space-between; font-size: 8.5px; padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.04);">
        <span>08 Sep 2026</span>
        <span style="color: #4ade80;">+ 50 ${item.unit} (Receive)</span>
        <span style="font-family: monospace; opacity: 0.6;">GRN-0142</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 8.5px; padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.04);">
        <span>05 Sep 2026</span>
        <span style="color: #fb7185;">- 12 ${item.unit} (Cutting Issue)</span>
        <span style="font-family: monospace; opacity: 0.6;">ORD-0528</span>
      </div>
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
  showToast('Generating Total Stock Valuation Statement (₹18,42,500)...');
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
