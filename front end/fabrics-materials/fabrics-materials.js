/* ============================================================
   FASHION ERP — FABRIC & MATERIAL LIBRARY CONTROLLER
   Path: front end/fabrics-materials/fabrics-materials.js
   Description: Data state, gallery rendering, 6-tab panel,
                live search, pagination, modals, and export
   ============================================================ */

'use strict';

// ────────────────────────────────────────────────────────────
// 1. DATA REPOSITORY & SYNTHETIC DATA INITIALIZATION
// ────────────────────────────────────────────────────────────

// High-definition local swatch images with fallback
const SAMPLE_IMAGES = {
  silk_pink: '../assets/fabrics/silk.jpg',
  organza_green: '../assets/fabrics/georgette.jpg',
  chanderi_ivory: '../assets/fabrics/chanderi.jpg',
  tissue_maroon: '../assets/fabrics/tissue.jpg',
  rawsilk_blue: '../assets/fabrics/rawsilk.jpg',
  lining_beige: '../assets/fabrics/lining.jpg',
  thread_gold: '../assets/fabrics/thread-gold.jpg',
  button_gold: '../assets/fabrics/button-gold.jpg',
  zipper_pink: '../assets/fabrics/zipper.jpg',
  motif_zari: '../assets/fabrics/zari-motif.jpg',
  velvet_maroon: '../assets/fabrics/velvet.jpg',
  lace_ivory: '../assets/fabrics/lace.jpg',
};

// 1. DATA REPOSITORY & DATABASE API INTEGRATION
let ALL_MATERIALS = [];
let currentFilterCategory = 'all';
let currentSearchTerm = '';
let currentViewMode = 'grid'; // 'grid' or 'list'
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let selectedMaterialId = null;
let currentDetailTab = 'overview';

// Advanced Filter State
let filterState = {
  inStock: true,
  lowStock: true,
  outStock: true,
  minPrice: null,
  maxPrice: null,
  supplier: '',
  sortBy: 'featured'
};

function mapInventoryToMaterial(item) {
  const stock = Number(item.stockQty || 0);
  const reserved = Number(item.reservedQty || 0);
  const available = item.availableQty != null ? Number(item.availableQty) : Math.max(0, stock - reserved);
  const cost = Number(item.purchasePrice || 0);
  const price = Math.round(cost * 1.35) || cost;
  return {
    id: item.id,
    code: item.itemCode || `MAT-${String(item.id).substring(0, 6).toUpperCase()}`,
    name: item.name || 'Untitled Material',
    category: item.category || 'Fabrics',
    subCategory: item.variant || 'General',
    color: item.variant || 'Standard',
    composition: item.composition || (item.name + ' fabric'),
    width: item.width || '44 inches',
    gsm: item.gsm || '120 GSM',
    weave: item.weave || 'Standard Mill Weave',
    origin: item.origin || 'India',
    hsn: item.hsn || '5007',
    uom: item.unit || 'm',
    cost: cost,
    price: price,
    stock: stock,
    reserved: reserved,
    available: available,
    reorderLevel: Number(item.reorderLevel || 15),
    location: item.location || 'Warehouse Storage Bin',
    supplier: item.supplierName || 'Textile Supplier',
    supplierContact: item.supplierContact || '+91 98390 12345',
    leadTime: item.leadTime || '5-7 days',
    image: item.imageUrl || SAMPLE_IMAGES.silk_pink,
    images: [item.imageUrl || SAMPLE_IMAGES.silk_pink],
    notes: 'Stored in climate-controlled boutique stockroom.'
  };
}

async function loadMaterialsFromApi() {
  try {
    if (window.api && window.api.inventory) {
      const items = await window.api.inventory.list({ size: 200 });
      ALL_MATERIALS = (items || []).map(mapInventoryToMaterial);
    }
  } catch (err) {
    console.error('Failed to load materials from API:', err);
    ALL_MATERIALS = [];
  }
}

// ────────────────────────────────────────────────────────────
// 2. LIFECYCLE & BOOTSTRAP
// ────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await initLibrary();
  setupKeyboardShortcuts();
  setupSidebarHoverEffects();
});

async function initLibrary() {
  await loadMaterialsFromApi();
  if (ALL_MATERIALS.length > 0) {
    selectedMaterialId = ALL_MATERIALS[0].id;
  }
  populateSupplierFilter();
  updateKpiNumbers();
  updateCategoryCounts();
  renderMaterialList();
  renderSelectedDetails();
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}

function populateSupplierFilter() {
  const sel = document.getElementById('fltSupplier');
  if (!sel) return;
  const current = sel.value;
  const suppliers = Array.from(new Set(ALL_MATERIALS.map(m => m.supplier).filter(Boolean))).sort();
  sel.innerHTML = '<option value="">All Suppliers</option>' + suppliers.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  if (current) sel.value = current;
}

// ────────────────────────────────────────────────────────────
// 3. KPI METRICS & CATEGORY TAB COUNTS
// ────────────────────────────────────────────────────────────

function updateKpiNumbers() {
  const total = ALL_MATERIALS.length;
  const fabrics = ALL_MATERIALS.filter(m => (m.category || '').toLowerCase() === 'fabrics').length;
  const trims = ALL_MATERIALS.filter(m => (m.category || '').toLowerCase().includes('trim')).length;
  const consumables = ALL_MATERIALS.filter(m => (m.category || '').toLowerCase().includes('consumable')).length;
  const others = total - fabrics - trims - consumables;
  const suppliers = new Set(ALL_MATERIALS.map(m => m.supplier).filter(Boolean)).size;

  const elTotal = document.getElementById('kpiTotalMaterials');
  const elFabrics = document.getElementById('kpiFabricsCount');
  const elTrims = document.getElementById('kpiTrimsCount');
  const elConsumables = document.getElementById('kpiConsumablesCount');
  const elSuppliers = document.getElementById('kpiSuppliersCount');

  if (elTotal) elTotal.textContent = total.toLocaleString();
  if (elFabrics) elFabrics.textContent = fabrics.toLocaleString();
  if (elTrims) elTrims.textContent = trims.toLocaleString();
  if (elConsumables) elConsumables.textContent = consumables.toLocaleString();
  if (elSuppliers) elSuppliers.textContent = suppliers.toLocaleString();

  // Badges
  const pctFabrics = total > 0 ? ((fabrics / total) * 100).toFixed(1) + '%' : '0%';
  const pctTrims = total > 0 ? ((trims / total) * 100).toFixed(1) + '%' : '0%';
  const pctConsumables = total > 0 ? ((consumables / total) * 100).toFixed(1) + '%' : '0%';

  const elFBadge = document.getElementById('kpiFabricsBadge');
  const elTBadge = document.getElementById('kpiTrimsBadge');
  const elCBadge = document.getElementById('kpiConsumablesBadge');
  if (elFBadge) elFBadge.textContent = pctFabrics;
  if (elTBadge) elTBadge.textContent = pctTrims;
  if (elCBadge) elCBadge.textContent = pctConsumables;

  // Donut chart
  const donutCenter = document.getElementById('donutCenterNumber');
  if (donutCenter) donutCenter.textContent = total.toLocaleString();

  const cFab = document.getElementById('donutFabricsLegend');
  const cTrm = document.getElementById('donutTrimsLegend');
  const cCon = document.getElementById('donutConsumablesLegend');
  const cOth = document.getElementById('donutOtherLegend');
  if (cFab) cFab.textContent = `Fabrics (${fabrics})`;
  if (cTrm) cTrm.textContent = `Trims (${trims})`;
  if (cCon) cCon.textContent = `Consumables (${consumables})`;
  if (cOth) cOth.textContent = `Other (${Math.max(0, others)})`;

  // SVG segments (circumference = 238.76)
  const circ = 238.76;
  const sFab = total > 0 ? (fabrics / total) * circ : 0;
  const sTrm = total > 0 ? (trims / total) * circ : 0;
  const sCon = total > 0 ? (consumables / total) * circ : 0;
  const sOth = total > 0 ? Math.max(0, total - fabrics - trims - consumables) / total * circ : 0;

  const segF = document.getElementById('donutSegmentFabrics');
  const segT = document.getElementById('donutSegmentTrims');
  const segC = document.getElementById('donutSegmentConsumables');
  const segO = document.getElementById('donutSegmentOthers');

  if (segF) {
    segF.setAttribute('stroke-dasharray', `${sFab.toFixed(1)} ${circ.toFixed(1)}`);
    segF.setAttribute('stroke-dashoffset', '0');
  }
  if (segT) {
    segT.setAttribute('stroke-dasharray', `${sTrm.toFixed(1)} ${circ.toFixed(1)}`);
    segT.setAttribute('stroke-dashoffset', `-${sFab.toFixed(1)}`);
  }
  if (segC) {
    segC.setAttribute('stroke-dasharray', `${sCon.toFixed(1)} ${circ.toFixed(1)}`);
    segC.setAttribute('stroke-dashoffset', `-${(sFab + sTrm).toFixed(1)}`);
  }
  if (segO) {
    segO.setAttribute('stroke-dasharray', `${sOth.toFixed(1)} ${circ.toFixed(1)}`);
    segO.setAttribute('stroke-dashoffset', `-${(sFab + sTrm + sCon).toFixed(1)}`);
  }
}

function updateCategoryCounts() {
  const allCount = ALL_MATERIALS.length;
  const fabricsCount = ALL_MATERIALS.filter(m => (m.category || '').toLowerCase() === 'fabrics').length;
  const trimsCount = ALL_MATERIALS.filter(m => (m.category || '').toLowerCase().includes('trim')).length;
  const consumablesCount = ALL_MATERIALS.filter(m => (m.category || '').toLowerCase().includes('consumable')).length;
  const packagingCount = ALL_MATERIALS.filter(m => (m.category || '').toLowerCase().includes('packaging')).length;
  const othersCount = ALL_MATERIALS.filter(m => (m.category || '').toLowerCase().includes('other')).length;

  setElText('tabCountAll', allCount.toLocaleString());
  setElText('tabCountFabrics', fabricsCount.toLocaleString());
  setElText('tabCountTrims', trimsCount.toLocaleString());
  setElText('tabCountConsumables', consumablesCount.toLocaleString());
  setElText('tabCountPackaging', packagingCount.toLocaleString());
  setElText('tabCountOthers', othersCount.toLocaleString());
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ────────────────────────────────────────────────────────────
// 4. FILTERING, SEARCH & SORTING PIPELINE
// ────────────────────────────────────────────────────────────

function getFilteredMaterials() {
  let list = [...ALL_MATERIALS];

  // 1. Category Filter
  if (currentFilterCategory !== 'all') {
    const map = {
      'fabrics': 'Fabrics',
      'trims': 'Trims',
      'consumables': 'Consumables',
      'packaging': 'Packaging',
      'others': 'Others'
    };
    const targetCat = map[currentFilterCategory] || currentFilterCategory;
    list = list.filter(m => m.category.toLowerCase() === targetCat.toLowerCase());
  }

  // 2. Search Term
  if (currentSearchTerm.trim() !== '') {
    const q = currentSearchTerm.toLowerCase().trim();
    list = list.filter(m =>
      m.code.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.color.toLowerCase().includes(q) ||
      (m.composition && m.composition.toLowerCase().includes(q)) ||
      (m.supplier && m.supplier.toLowerCase().includes(q)) ||
      (m.subCategory && m.subCategory.toLowerCase().includes(q))
    );
  }

  // 3. Advanced Filters (Stock Status)
  list = list.filter(m => {
    const isOut = m.stock <= 0;
    const isLow = m.stock > 0 && m.stock <= m.reorderLevel;
    const isIn = m.stock > m.reorderLevel;

    if (!filterState.inStock && isIn) return false;
    if (!filterState.lowStock && isLow) return false;
    if (!filterState.outStock && isOut) return false;
    return true;
  });

  // Price bounds
  if (filterState.minPrice !== null && !isNaN(filterState.minPrice)) {
    list = list.filter(m => m.price >= filterState.minPrice);
  }
  if (filterState.maxPrice !== null && !isNaN(filterState.maxPrice)) {
    list = list.filter(m => m.price <= filterState.maxPrice);
  }

  // Supplier
  if (filterState.supplier) {
    list = list.filter(m => m.supplier === filterState.supplier);
  }

  // 4. Sorting
  switch (filterState.sortBy) {
    case 'code_asc':
      list.sort((a, b) => a.code.localeCompare(b.code));
      break;
    case 'name_asc':
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'price_asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'stock_desc':
      list.sort((a, b) => b.stock - a.stock);
      break;
    case 'stock_asc':
      list.sort((a, b) => a.stock - b.stock);
      break;
    case 'featured':
    default:
      list.sort((a, b) => a.id - b.id);
      break;
  }

  return list;
}

// ────────────────────────────────────────────────────────────
// 5. MATERIAL GALLERY (GRID & LIST) RENDERING
// ────────────────────────────────────────────────────────────

function renderMaterialList() {
  const filtered = getFilteredMaterials();
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const pagedItems = filtered.slice(startIndex, endIndex);

  // If currently selected item is not in filtered list, select first of page
  if (pagedItems.length > 0 && !filtered.some(m => m.id === selectedMaterialId)) {
    selectedMaterialId = pagedItems[0].id;
    renderSelectedDetails();
  }

  // Render Grid View
  const grid = document.getElementById('materialsGrid');
  if (grid) {
    if (pagedItems.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px; text-align: center; color: rgba(255,255,255,0.45); font-size: 13px;">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 10px; opacity: 0.5;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <div>No materials match your current filter or search criteria.</div>
          <button type="button" class="btn-head-secondary" style="margin-top: 12px;" onclick="resetFilters()">Reset Filters</button>
        </div>
      `;
    } else {
      grid.innerHTML = pagedItems.map(item => createCardHtml(item)).join('');
    }
  }

  // Render List View
  const tbody = document.getElementById('materialsTableBody');
  if (tbody) {
    tbody.innerHTML = pagedItems.map(item => createTableRowHtml(item)).join('');
  }

  // Update Pagination Controls
  renderPaginationControls(startIndex, endIndex, totalItems, totalPages);
}

function createCardHtml(item) {
  const isSelected = String(item.id) === String(selectedMaterialId);
  const status = getStockStatus(item);

  return `
    <div class="material-card ${isSelected ? 'selected' : ''}" data-id="${item.id}" onclick="selectMaterial('${item.id}')">
      <div class="card-img-wrap">
        <img src="${item.image}" alt="${escapeHtml(item.name)}" class="card-img" onerror="this.onerror=null;this.src='../assets/boutique_bg.png';" loading="lazy" />
        <span class="card-status-badge ${status.cssClass}">${status.label}</span>
        <button type="button" class="card-menu-btn" title="Actions" onclick="openContextMenu(event, '${item.id}')">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2"/></svg>
        </button>
      </div>
      <div class="card-body">
        <div class="card-code">${escapeHtml(item.code)}</div>
        <div class="card-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
        <div class="card-spec" title="${escapeHtml(item.color)} • ${escapeHtml(item.composition || item.subCategory)}">
          ${escapeHtml(item.color)} • ${escapeHtml(item.composition || item.subCategory)}
        </div>
        <div class="card-footer-row">
          <span class="card-price">₹${item.price.toLocaleString()}/${item.uom}</span>
          <span class="card-stock-pill ${status.pillClass}">${item.stock} ${item.uom}</span>
        </div>
      </div>
    </div>
  `;
}

function createTableRowHtml(item) {
  const isSelected = String(item.id) === String(selectedMaterialId);
  const status = getStockStatus(item);

  return `
    <tr class="${isSelected ? 'selected' : ''}" onclick="selectMaterial('${item.id}')">
      <td><img src="${item.image}" class="tbl-thumb" onerror="this.onerror=null;this.src='../assets/boutique_bg.png';"/></td>
      <td><strong>${escapeHtml(item.name)}</strong></td>
      <td><span class="badge-code">${escapeHtml(item.code)}</span></td>
      <td>${escapeHtml(item.category)}</td>
      <td>${escapeHtml(item.color)}</td>
      <td>${escapeHtml(item.gsm || '—')}</td>
      <td><strong>${item.stock} ${item.uom}</strong></td>
      <td>₹${item.cost.toLocaleString()}/${item.uom}</td>
      <td><strong>₹${item.price.toLocaleString()}/${item.uom}</strong></td>
      <td><span class="card-status-badge ${status.cssClass}" style="position:static;display:inline-block;">${status.label}</span></td>
      <td>
        <button type="button" class="card-menu-btn" style="opacity:1;position:static;" onclick="openContextMenu(event, '${item.id}')">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2"/></svg>
        </button>
      </td>
    </tr>
  `;
}

function getStockStatus(item) {
  if (item.stock <= 0) {
    return { label: 'Out of Stock', cssClass: 'out-stock', pillClass: 'out' };
  } else if (item.stock <= item.reorderLevel) {
    return { label: 'Low Stock', cssClass: 'low-stock', pillClass: 'low' };
  } else {
    return { label: 'In Stock', cssClass: 'in-stock', pillClass: '' };
  }
}

function renderPaginationControls(startIndex, endIndex, totalItems, totalPages) {
  const elInfo = document.getElementById('paginationInfo');
  if (elInfo) {
    if (totalItems === 0) {
      elInfo.textContent = 'Showing 0 materials';
    } else {
      elInfo.textContent = `Showing ${startIndex + 1}–${endIndex} of ${totalItems.toLocaleString()} materials`;
    }
  }

  const btnPrev = document.getElementById('btnPrevPage');
  const btnNext = document.getElementById('btnNextPage');
  if (btnPrev) btnPrev.disabled = (currentPage <= 1);
  if (btnNext) btnNext.disabled = (currentPage >= totalPages);

  const numContainer = document.getElementById('pageNumberButtons');
  if (numContainer) {
    let html = '';
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      html += `
        <button type="button" class="page-num-btn ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">
          ${p}
        </button>
      `;
    }
    numContainer.innerHTML = html;
  }
}

function goToPage(page) {
  currentPage = page;
  renderMaterialList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function changePage(delta) {
  const filtered = getFilteredMaterials();
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const newPage = currentPage + delta;
  if (newPage >= 1 && newPage <= totalPages) {
    goToPage(newPage);
  }
}

// ────────────────────────────────────────────────────────────
// 6. SELECTED MATERIAL DETAILS PANEL (6 TABS)
// ────────────────────────────────────────────────────────────

function selectMaterial(id) {
  selectedMaterialId = id;
  // Update card selected highlight without full DOM rebuild
  document.querySelectorAll('.material-card').forEach(card => {
    card.classList.toggle('selected', String(card.dataset.id) === String(id));
  });
  document.querySelectorAll('.materials-table tr').forEach(row => {
    row.classList.remove('selected');
  });
  renderSelectedDetails();
}

function getSelectedMaterial() {
  if (!ALL_MATERIALS || ALL_MATERIALS.length === 0) return null;
  return ALL_MATERIALS.find(m => String(m.id) === String(selectedMaterialId)) || ALL_MATERIALS[0];
}

function renderSelectedDetails() {
  const panel = document.getElementById('materialDetailsPanel');
  if (!panel) return;
  const m = getSelectedMaterial();
  if (!m) {
    panel.innerHTML = `
      <div style="padding: 48px; text-align: center; color: rgba(255,255,255,0.45); font-size: 13px;">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 10px; opacity: 0.5;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <div>No materials in inventory</div>
      </div>
    `;
    return;
  }

  const marginPercent = m.price > 0 ? (((m.price - m.cost) / m.price) * 100).toFixed(1) : 0;
  const status = getStockStatus(m);

  panel.innerHTML = `
    <!-- Hero Header -->
    <div class="panel-hero">
      <div class="panel-hero-thumb-wrap">
        <img src="${m.image}" alt="${escapeHtml(m.name)}" class="panel-hero-thumb" onerror="this.onerror=null;this.src='../assets/boutique_bg.png';"/>
      </div>
      <div class="panel-hero-info">
        <div class="panel-badges-row">
          <span class="badge-code">${escapeHtml(m.code)}</span>
          <span class="badge-cat">${escapeHtml(m.category)} / ${escapeHtml(m.subCategory || 'Material')}</span>
        </div>
        <div class="panel-hero-title">${escapeHtml(m.name)}</div>
        <div class="panel-hero-subtitle">${escapeHtml(m.color)} • ${escapeHtml(m.composition || 'Premium Grade')}</div>
        <div class="panel-actions-row">
          <button type="button" class="panel-quick-btn primary" onclick="openStockAdjustmentForCurrent()">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Adjust Stock</span>
          </button>
          <button type="button" class="panel-quick-btn" onclick="copyMaterialCode('${escapeHtml(m.code)}')">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Copy Code</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 6 Tabs Navigation -->
    <div class="details-tabs-nav">
      <button type="button" class="details-tab-btn ${currentDetailTab === 'overview' ? 'active' : ''}" onclick="switchDetailTab('overview')">Overview</button>
      <button type="button" class="details-tab-btn ${currentDetailTab === 'pricing' ? 'active' : ''}" onclick="switchDetailTab('pricing')">Stock &amp; Pricing</button>
      <button type="button" class="details-tab-btn ${currentDetailTab === 'suppliers' ? 'active' : ''}" onclick="switchDetailTab('suppliers')">Suppliers</button>
      <button type="button" class="details-tab-btn ${currentDetailTab === 'usage' ? 'active' : ''}" onclick="switchDetailTab('usage')">Usage</button>
      <button type="button" class="details-tab-btn ${currentDetailTab === 'images' ? 'active' : ''}" onclick="switchDetailTab('images')">Images (${(m.images || []).length})</button>
      <button type="button" class="details-tab-btn ${currentDetailTab === 'notes' ? 'active' : ''}" onclick="switchDetailTab('notes')">Notes</button>
    </div>

    <!-- Tab Content Render -->
    <div class="details-tab-content">
      ${renderActiveDetailTab(m, marginPercent, status)}
    </div>
  `;
}

function switchDetailTab(tabName) {
  currentDetailTab = tabName;
  renderSelectedDetails();
}

function renderActiveDetailTab(m, marginPercent, status) {
  switch (currentDetailTab) {
    case 'overview':
      return `
        <!-- Material Specifications -->
        <div class="detail-section">
          <div class="detail-section-title">
            <span>Material Specifications</span>
            <span style="font-size:10px;color:#c084fc;">HSN: ${m.hsn || '5007'}</span>
          </div>
          <div class="specs-grid">
            <div class="spec-item"><span class="spec-lbl">Composition</span><span class="spec-val">${escapeHtml(m.composition || '100% Silk')}</span></div>
            <div class="spec-item"><span class="spec-lbl">Width</span><span class="spec-val">${escapeHtml(m.width || '44 inches')}</span></div>
            <div class="spec-item"><span class="spec-lbl">Weight / GSM</span><span class="spec-val">${escapeHtml(m.gsm || '180 GSM')}</span></div>
            <div class="spec-item"><span class="spec-lbl">Weave / Style</span><span class="spec-val">${escapeHtml(m.weave || 'Brocade')}</span></div>
            <div class="spec-item"><span class="spec-lbl">Origin</span><span class="spec-val">${escapeHtml(m.origin || 'Varanasi, UP')}</span></div>
            <div class="spec-item"><span class="spec-lbl">Unit of Measure</span><span class="spec-val">${escapeHtml(m.uom)}</span></div>
          </div>
        </div>

        <!-- Stock Level Breakdown (4 Tiles) -->
        <div class="detail-section">
          <div class="detail-section-title">
            <span>Stock Level Breakdown</span>
            <span class="card-status-badge ${status.cssClass}" style="position:static;display:inline-block;">${status.label}</span>
          </div>
          <div class="stock-tiles-grid">
            <div class="stock-tile">
              <div class="stock-tile-val">${m.stock} ${m.uom}</div>
              <div class="stock-tile-lbl">Current</div>
            </div>
            <div class="stock-tile">
              <div class="stock-tile-val" style="color:#fbbf24;">${m.reserved} ${m.uom}</div>
              <div class="stock-tile-lbl">Reserved</div>
            </div>
            <div class="stock-tile">
              <div class="stock-tile-val" style="color:#34d399;">${m.available} ${m.uom}</div>
              <div class="stock-tile-lbl">Available</div>
            </div>
            <div class="stock-tile">
              <div class="stock-tile-val" style="color:#c084fc;">${m.reorderLevel} ${m.uom}</div>
              <div class="stock-tile-lbl">Reorder</div>
            </div>
          </div>
        </div>

        <!-- Pricing & Margin Summary -->
        <div class="detail-section">
          <div class="detail-section-title">Pricing &amp; Margins</div>
          <div class="pricing-grid">
            <div class="price-box">
              <div class="price-box-val cost">₹${m.cost.toLocaleString()}</div>
              <div class="price-box-lbl">Cost / ${m.uom}</div>
            </div>
            <div class="price-box">
              <div class="price-box-val purple">₹${m.price.toLocaleString()}</div>
              <div class="price-box-lbl">Selling / ${m.uom}</div>
            </div>
            <div class="price-box">
              <div class="price-box-val">${marginPercent}%</div>
              <div class="price-box-lbl">Gross Margin</div>
            </div>
          </div>
        </div>

        <!-- Primary Supplier -->
        <div class="detail-section">
          <div class="detail-section-title">Primary Supplier</div>
          <div class="supplier-card-mini">
            <div class="supplier-mini-info">
              <div class="supplier-mini-name">${escapeHtml(m.supplier || 'Standard Supplier')}</div>
              <div class="supplier-mini-meta">Lead Time: ${escapeHtml(m.leadTime || '5-7 days')} • ${escapeHtml(m.supplierContact || '+91 98390 12345')}</div>
            </div>
            <button type="button" class="panel-quick-btn" onclick="openSupplierContact('${escapeHtml(m.supplier)}')">Contact</button>
          </div>
        </div>
      `;

    case 'pricing':
      const inventoryValuation = m.stock * m.cost;
      return `
        <div class="detail-section">
          <div class="detail-section-title">Warehouse &amp; Valuation</div>
          <div class="specs-grid">
            <div class="spec-item"><span class="spec-lbl">Storage Location</span><span class="spec-val">${escapeHtml(m.location || 'Warehouse Storage')}</span></div>
            <div class="spec-item"><span class="spec-lbl">Current Valuation</span><span class="spec-val" style="color:#34d399;">₹${inventoryValuation.toLocaleString()}</span></div>
            <div class="spec-item"><span class="spec-lbl">Purchase Cost</span><span class="spec-val">₹${m.cost.toLocaleString()} / ${m.uom}</span></div>
            <div class="spec-item"><span class="spec-lbl">Selling Price</span><span class="spec-val">₹${m.price.toLocaleString()} / ${m.uom}</span></div>
            <div class="spec-item"><span class="spec-lbl">Margin</span><span class="spec-val" style="color:#c084fc;">₹${(m.price - m.cost).toLocaleString()} (${marginPercent}%)</span></div>
            <div class="spec-item"><span class="spec-lbl">Minimum Order Qty</span><span class="spec-val">10 ${m.uom}</span></div>
          </div>
          <div style="margin-top: 14px;">
            <button type="button" class="btn-head-primary" style="width: 100%; justify-content: center;" onclick="openStockAdjustmentForCurrent()">
              Record Stock Adjustment
            </button>
          </div>
        </div>
      `;

    case 'suppliers':
      return `
        <div class="detail-section">
          <div class="detail-section-title">Supplier Information</div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div class="supplier-card-mini">
              <div class="supplier-mini-info">
                <div class="supplier-mini-name">${escapeHtml(m.supplier || 'Standard Supplier')} <span style="font-size:9.5px;color:#34d399;margin-left:4px;">● Preferred</span></div>
                <div class="supplier-mini-meta">Quote: ₹${m.cost}/${m.uom} • Lead: ${m.leadTime || '5-7 days'} • Contact: ${escapeHtml(m.supplierContact || '+91 98390 12345')}</div>
              </div>
              <button type="button" class="panel-quick-btn" onclick="showToast('Reorder request generated for ${escapeHtml(m.supplier)}', 'success')">Order</button>
            </div>
          </div>
        </div>
      `;

    case 'usage':
      return `
        <div class="detail-section">
          <div class="detail-section-title">Recent Garment Allocations</div>
          <div style="text-align:center;padding:24px 16px;color:var(--text-3);font-size:13px;">
            <i data-lucide="package" style="width:28px;height:28px;margin-bottom:8px;opacity:0.4;display:block;margin:0 auto 10px;"></i>
            Usage history is tracked via orders.<br>
            <a href="../orders/order-overview/order-overview.html" style="color:var(--lime);text-decoration:none;font-weight:600;">View Orders →</a>
          </div>
        </div>
      `;

    case 'images':
      const imagesList = m.images && m.images.length > 0 ? m.images : [m.image];
      return `
        <div class="detail-section">
          <div class="detail-section-title">
            <span>High-Res Swatches</span>
            <button type="button" class="panel-quick-btn" onclick="openAddImageModal()">+ Add Photo</button>
          </div>
          <div class="swatches-grid">
            ${imagesList.map((img, i) => `
              <div class="swatch-item" onclick="openImageLightbox('${img}')">
                <img src="${img}" alt="Swatch ${i + 1}" onerror="this.onerror=null;this.src='../assets/boutique_bg.png';"/>
              </div>
            `).join('')}
            <div class="btn-add-swatch" onclick="openAddImageModal()">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              <span>Add Swatch</span>
            </div>
          </div>
        </div>
      `;

    case 'notes':
      return `
        <div class="detail-section">
          <div class="detail-section-title">Care Guide &amp; Technical Notes</div>
          <textarea class="notes-textarea" id="materialNotesInput" rows="4">${escapeHtml(m.notes || 'Handle with care. Dry cleaning recommended.')}</textarea>
          <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
            <button type="button" class="btn-head-primary" onclick="saveMaterialNotes()">Save Notes</button>
          </div>
        </div>
      `;

    default:
      return '';
  }
}

// ────────────────────────────────────────────────────────────
// 7. USER INTERACTIONS, SEARCH & VIEW MODE
// ────────────────────────────────────────────────────────────

function selectCategoryFilter(categoryKey, btnElement) {
  currentFilterCategory = categoryKey;
  currentPage = 1;

  document.querySelectorAll('#categoryFilterTabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  if (btnElement) {
    btnElement.classList.add('active');
  }

  renderMaterialList();
}

function handleSearch(term) {
  currentSearchTerm = term;
  currentPage = 1;
  renderMaterialList();
}

function setViewMode(mode) {
  currentViewMode = mode;
  const btnGrid = document.getElementById('btnGridView');
  const btnList = document.getElementById('btnListView');
  const gridWrap = document.getElementById('materialsGrid');
  const listWrap = document.getElementById('materialsListWrap');

  if (mode === 'grid') {
    if (btnGrid) btnGrid.classList.add('active');
    if (btnList) btnList.classList.remove('active');
    if (gridWrap) gridWrap.style.display = 'grid';
    if (listWrap) listWrap.style.display = 'none';
  } else {
    if (btnGrid) btnGrid.classList.remove('active');
    if (btnList) btnList.classList.add('active');
    if (gridWrap) gridWrap.style.display = 'none';
    if (listWrap) listWrap.style.display = 'block';
  }
}

// ────────────────────────────────────────────────────────────
// 8. MODALS MANAGEMENT
// ────────────────────────────────────────────────────────────

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Close modal on outside backdrop click
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.style.display = 'none';
  }
  const ctx = document.getElementById('matContextMenu');
  if (ctx && !e.target.closest('#matContextMenu') && !e.target.closest('.card-menu-btn')) {
    ctx.style.display = 'none';
  }
});

// Modal 1: Add New Material
function openAddMaterialModal() {
  const codePrefix = currentFilterCategory === 'trims' ? 'TRM' : (currentFilterCategory === 'consumables' ? 'CON' : 'FAB');
  const nextNum = ALL_MATERIALS.length + 1;
  const defaultCode = `${codePrefix}-${String(nextNum).padStart(4, '0')}`;

  const inpCode = document.getElementById('newMatCode');
  if (inpCode) inpCode.value = defaultCode;

  openModal('addMaterialModal');
}

async function handleSaveNewMaterial(event) {
  event.preventDefault();

  const code = document.getElementById('newMatCode').value.trim();
  const name = document.getElementById('newMatName').value.trim();
  const category = document.getElementById('newMatCategory').value;
  const subCategory = document.getElementById('newMatSubCat').value.trim() || 'General';
  const color = document.getElementById('newMatColor').value.trim();
  const composition = document.getElementById('newMatComposition').value.trim() || 'Premium';
  const width = document.getElementById('newMatWidth').value.trim() || '44 inches';
  const gsm = document.getElementById('newMatGsm').value.trim() || '150 GSM';
  const uom = document.getElementById('newMatUom').value;
  const cost = parseFloat(document.getElementById('newMatCost').value) || 0;
  const price = parseFloat(document.getElementById('newMatPrice').value) || 0;
  const stock = parseFloat(document.getElementById('newMatStock').value) || 0;
  const reorder = parseFloat(document.getElementById('newMatReorder').value) || 15;
  const supplier = document.getElementById('newMatSupplier').value.trim() || 'Standard Supplier';
  const imageUrl = document.getElementById('newMatImageUrl').value.trim() || SAMPLE_IMAGES.silk_pink;

  try {
    let newMaterial;
    if (window.api && window.api.inventory) {
      const created = await window.api.inventory.create({
        name,
        category,
        variant: subCategory || color,
        unit: uom,
        stockQty: stock,
        reservedQty: 0,
        reorderLevel: reorder,
        purchasePrice: cost,
        supplierName: supplier,
        imageUrl: imageUrl
      });
      newMaterial = mapInventoryToMaterial(created);
    } else {
      const newId = Date.now();
      newMaterial = {
        id: newId,
        code,
        name,
        category,
        subCategory,
        color,
        composition,
        width,
        gsm,
        weave: 'Standard Quality',
        origin: 'India',
        hsn: '5007',
        uom,
        cost,
        price,
        stock,
        reserved: 0,
        available: stock,
        reorderLevel: reorder,
        location: 'Central Storage Bin',
        supplier,
        supplierContact: '+91 98390 12345',
        leadTime: '7 days',
        image: imageUrl,
        images: [imageUrl],
        notes: 'Newly added catalog material.'
      };
    }

    ALL_MATERIALS.unshift(newMaterial);
    selectedMaterialId = newMaterial.id;

    closeModal('addMaterialModal');
    event.target.reset();

    populateSupplierFilter();
    updateKpiNumbers();
    updateCategoryCounts();
    renderMaterialList();
    renderSelectedDetails();

    showToast(`Material ${newMaterial.code} created successfully!`, 'success');
  } catch (err) {
    console.error('Error creating material:', err);
    showToast('Failed to create material: ' + (err.message || 'Unknown error'), 'error');
  }
}

// Modal 2: Stock Adjustment
let adjustmentTargetMaterial = null;

function openStockAdjustmentModal(material) {
  adjustmentTargetMaterial = material || getSelectedMaterial();
  if (!adjustmentTargetMaterial) return;

  const preview = document.getElementById('adjSelectedMatPreview');
  if (preview) {
    preview.innerHTML = `
      <img src="${adjustmentTargetMaterial.image}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;" onerror="this.src='../assets/boutique_bg.png';"/>
      <div>
        <div style="font-weight:700;font-size:12.5px;">${escapeHtml(adjustmentTargetMaterial.name)} (${escapeHtml(adjustmentTargetMaterial.code)})</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);">Current Stock: <strong style="color:#ffffff;">${adjustmentTargetMaterial.stock} ${adjustmentTargetMaterial.uom}</strong></div>
      </div>
    `;
  }

  const inpMatId = document.getElementById('adjMatId');
  if (inpMatId) inpMatId.value = adjustmentTargetMaterial.id;

  const inpLoc = document.getElementById('adjLocation');
  if (inpLoc) inpLoc.value = adjustmentTargetMaterial.location || '';

  openModal('stockAdjustmentModal');
}

function openStockAdjustmentForCurrent() {
  openStockAdjustmentModal(getSelectedMaterial());
}

function updateAdjTypeLabels() {
  const radios = document.getElementsByName('adjType');
  let selected = 'add';
  radios.forEach(r => {
    if (r.checked) selected = r.value;
    r.closest('.adj-radio-btn').classList.toggle('active', r.checked);
  });

  const label = document.getElementById('adjQtyLabel');
  if (label) {
    if (selected === 'add') label.textContent = 'Quantity to Add *';
    else if (selected === 'sub') label.textContent = 'Quantity to Deduct *';
    else label.textContent = 'New Physical Stock Count *';
  }
}

async function handleSaveStockAdjustment(event) {
  event.preventDefault();
  if (!adjustmentTargetMaterial) return;

  const radios = document.getElementsByName('adjType');
  let adjType = 'add';
  radios.forEach(r => { if (r.checked) adjType = r.value; });

  const qty = parseFloat(document.getElementById('adjQuantity').value) || 0;
  const reason = document.getElementById('adjReason').value;
  const location = document.getElementById('adjLocation').value.trim();

  let delta = (adjType === 'add') ? qty : (adjType === 'sub' ? -qty : (qty - adjustmentTargetMaterial.stock));

  try {
    if (window.api && window.api.inventory && adjustmentTargetMaterial.id) {
      const updated = await window.api.inventory.adjust(adjustmentTargetMaterial.id, delta, reason, 'Admin');
      adjustmentTargetMaterial.stock = Number(updated.stockQty || 0);
      adjustmentTargetMaterial.available = Number(updated.availableQty != null ? updated.availableQty : Math.max(0, adjustmentTargetMaterial.stock - adjustmentTargetMaterial.reserved));
    } else {
      let newStock = adjustmentTargetMaterial.stock;
      if (adjType === 'add') newStock += qty;
      else if (adjType === 'sub') newStock = Math.max(0, newStock - qty);
      else newStock = Math.max(0, qty);
      adjustmentTargetMaterial.stock = newStock;
      adjustmentTargetMaterial.available = Math.max(0, newStock - adjustmentTargetMaterial.reserved);
    }
    if (location) adjustmentTargetMaterial.location = location;

    closeModal('stockAdjustmentModal');
    event.target.reset();

    updateKpiNumbers();
    updateCategoryCounts();
    renderMaterialList();
    renderSelectedDetails();

    showToast(`Stock updated to ${adjustmentTargetMaterial.stock} ${adjustmentTargetMaterial.uom} (${reason})`, 'success');
  } catch (err) {
    console.error('Error adjusting stock:', err);
    showToast('Failed to adjust stock: ' + (err.message || 'Unknown error'), 'error');
  }
}

// Modal 3: Advanced Filters
function openFilterModal() {
  openModal('filterModal');
}

function applyAdvancedFilters() {
  filterState.inStock = document.getElementById('fltStatusInStock').checked;
  filterState.lowStock = document.getElementById('fltStatusLowStock').checked;
  filterState.outStock = document.getElementById('fltStatusOutStock').checked;

  const minP = parseFloat(document.getElementById('fltMinPrice').value);
  filterState.minPrice = isNaN(minP) ? null : minP;

  const maxP = parseFloat(document.getElementById('fltMaxPrice').value);
  filterState.maxPrice = isNaN(maxP) ? null : maxP;

  filterState.supplier = document.getElementById('fltSupplier').value;
  filterState.sortBy = document.getElementById('fltSortBy').value;

  // Active filter badge
  let activeCount = 0;
  if (!filterState.inStock || !filterState.lowStock || !filterState.outStock) activeCount++;
  if (filterState.minPrice !== null || filterState.maxPrice !== null) activeCount++;
  if (filterState.supplier) activeCount++;

  const badge = document.getElementById('activeFilterBadge');
  if (badge) {
    badge.textContent = activeCount;
    badge.style.display = activeCount > 0 ? 'inline-block' : 'none';
  }

  currentPage = 1;
  closeModal('filterModal');
  renderMaterialList();
  showToast('Filters applied successfully', 'info');
}

function resetFilters() {
  filterState = {
    inStock: true,
    lowStock: true,
    outStock: true,
    minPrice: null,
    maxPrice: null,
    supplier: '',
    sortBy: 'featured'
  };

  const chkIn = document.getElementById('fltStatusInStock');
  const chkLow = document.getElementById('fltStatusLowStock');
  const chkOut = document.getElementById('fltStatusOutStock');
  if (chkIn) chkIn.checked = true;
  if (chkLow) chkLow.checked = true;
  if (chkOut) chkOut.checked = true;

  const minP = document.getElementById('fltMinPrice');
  const maxP = document.getElementById('fltMaxPrice');
  if (minP) minP.value = '';
  if (maxP) maxP.value = '';

  const sup = document.getElementById('fltSupplier');
  if (sup) sup.value = '';

  const sort = document.getElementById('fltSortBy');
  if (sort) sort.value = 'featured';

  const badge = document.getElementById('activeFilterBadge');
  if (badge) badge.style.display = 'none';

  currentSearchTerm = '';
  const searchInp = document.getElementById('libSearchInput');
  if (searchInp) searchInp.value = '';

  currentPage = 1;
  closeModal('filterModal');
  renderMaterialList();
  showToast('All filters have been reset', 'info');
}

// Modal 4: Add Swatch Image
function openAddImageModal() {
  openModal('addImageModal');
}

function handleSaveImage(event) {
  event.preventDefault();
  const url = document.getElementById('newImageUrlInput').value.trim();
  const m = getSelectedMaterial();

  if (url && m) {
    if (!m.images) m.images = [];
    m.images.push(url);
    closeModal('addImageModal');
    event.target.reset();
    renderSelectedDetails();
    showToast('Swatch image attached!', 'success');
  }
}

function openImageLightbox(url) {
  const m = getSelectedMaterial();
  m.image = url;
  renderSelectedDetails();
  showToast('Thumbnail view updated', 'info');
}

// Save Notes from Tab
function saveMaterialNotes() {
  const m = getSelectedMaterial();
  const textarea = document.getElementById('materialNotesInput');
  if (m && textarea) {
    m.notes = textarea.value.trim();
    showToast('Care instructions and notes saved!', 'success');
  }
}

// ────────────────────────────────────────────────────────────
// 9. CONTEXT MENU & QUICK ACTIONS
// ────────────────────────────────────────────────────────────

let contextMenuTargetId = null;

function openContextMenu(event, materialId) {
  event.stopPropagation();
  contextMenuTargetId = materialId;
  const menu = document.getElementById('matContextMenu');
  if (!menu) return;

  menu.style.display = 'block';
  const x = Math.min(window.innerWidth - 180, event.clientX + 5);
  const y = Math.min(window.innerHeight - 150, event.clientY + 5);
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
}

function handleCardMenuAction(action) {
  const menu = document.getElementById('matContextMenu');
  if (menu) menu.style.display = 'none';

  const target = ALL_MATERIALS.find(m => m.id === contextMenuTargetId);
  if (!target) return;

  switch (action) {
    case 'details':
      selectMaterial(target.id);
      break;
    case 'adjust':
      openStockAdjustmentModal(target);
      break;
    case 'copy_code':
      copyMaterialCode(target.code);
      break;
    case 'order_more':
      showToast(`Reorder drafted for ${target.code} (${target.supplier})`, 'success');
      break;
  }
}

function copyMaterialCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Copied ${code} to clipboard!`, 'info');
  }).catch(() => {
    showToast(`Code: ${code}`, 'info');
  });
}

function openSupplierContact(supplierName) {
  showToast(`Connecting to ${supplierName}...`, 'info');
}

// ────────────────────────────────────────────────────────────
// 10. EXPORT MATERIALS CSV
// ────────────────────────────────────────────────────────────

function exportMaterialsCSV() {
  const filtered = getFilteredMaterials();
  if (filtered.length === 0) {
    showToast('No materials to export', 'warn');
    return;
  }

  const headers = ['Code', 'Name', 'Category', 'Sub-Category', 'Color', 'GSM', 'Width', 'UOM', 'Cost Price (INR)', 'Selling Price (INR)', 'Stock', 'Reserved', 'Available', 'Reorder Level', 'Location', 'Supplier'];
  const rows = filtered.map(m => [
    m.code,
    `"${m.name.replace(/"/g, '""')}"`,
    m.category,
    m.subCategory || '',
    m.color,
    m.gsm || '',
    m.width || '',
    m.uom,
    m.cost,
    m.price,
    m.stock,
    m.reserved,
    m.available,
    m.reorderLevel,
    `"${(m.location || '').replace(/"/g, '""')}"`,
    `"${(m.supplier || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Fashion_ERP_Materials_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Exported ${filtered.length} materials to CSV!`, 'success');
}

// ────────────────────────────────────────────────────────────
// 11. KEYBOARD SHORTCUTS & HELPERS
// ────────────────────────────────────────────────────────────

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // ⌘K or Ctrl+K -> Focus Search
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const input = document.getElementById('libSearchInput');
      if (input) {
        input.focus();
        input.select();
      }
    }
    // ESC -> Close open modals
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.style.display = 'none';
      });
      const ctx = document.getElementById('matContextMenu');
      if (ctx) ctx.style.display = 'none';
    }
  });
}

function setupSidebarHoverEffects() {
  // Safe handler in case tooltips are used
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

// ────────────────────────────────────────────────────────────
// 12. FLOATING TOAST NOTIFICATION SYSTEM
// ────────────────────────────────────────────────────────────

function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconColor = '#38bdf8';
  if (type === 'success') iconColor = '#34d399';
  if (type === 'warn') iconColor = '#fbbf24';
  if (type === 'error') iconColor = '#f87171';

  toast.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="${iconColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.25s, transform 0.25s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 260);
  }, 3400);
}
