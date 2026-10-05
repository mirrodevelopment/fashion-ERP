/* ============================================================
   FASHION ERP — FABRIC & MATERIAL LIBRARY CONTROLLER
   Path: front end/fabrics-materials/fabrics-materials.js
   Description: Data state, gallery rendering, 6-tab panel,
                live search, pagination, modals, and export
   ============================================================ */

'use strict';

const FALLBACK_FABRIC_SVG = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 48 48%22 width=%2248%22 height=%2248%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Crect x=%226%22 y=%226%22 width=%2236%22 height=%2236%22 rx=%224%22/%3E%3Cpath d=%22M6 18h36M6 30h36M18 6v36M30 6v36%22 stroke-dasharray=%222 2%22/%3E%3C/svg%3E";
window.FALLBACK_FABRIC_SVG = FALLBACK_FABRIC_SVG;

// ────────────────────────────────────────────────────────────
// 1. DATA REPOSITORY & DATABASE API INTEGRATION
// ────────────────────────────────────────────────────────────

let ALL_MATERIALS = [];
let currentFilterCategory = 'all';
let currentSearchTerm = '';
let currentViewMode = 'grid'; // 'grid' or 'list'
let currentPage = 1;
const ITEMS_PER_PAGE = 12;
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
  const sellingPrice = Number(item.sellingPrice || (cost > 0 ? Math.round(cost * 1.35) : 0));
  const fallbackImg = FALLBACK_FABRIC_SVG;
  const splitUrls = str => (str || '').split(/[\n,;|]+/).map(s => s.trim()).filter(Boolean);
  let parsedImages = [];
  if (Array.isArray(item.images)) {
    parsedImages = item.images.filter(Boolean);
  } else if (item.imageUrls) {
    parsedImages = splitUrls(item.imageUrls);
  } else if (item.imageUrl) {
    parsedImages = splitUrls(item.imageUrl);
  }
  const img = parsedImages[0] || (item.imageUrl && item.imageUrl.trim() !== '' ? item.imageUrl : fallbackImg);
  const images = parsedImages.length > 0 ? parsedImages : [img];

  return {
    id: item.id,
    code: item.itemCode || `MAT-${String(item.id).substring(0, 6).toUpperCase()}`,
    name: item.name || '',
    category: item.category || 'Fabrics',
    subCategory: item.variant || '',
    color: item.variant || '',
    composition: item.composition || '',
    width: item.width || '',
    gsm: item.gsm || '',
    weave: item.weave || '',
    origin: item.origin || '',
    hsn: item.hsnCode || '',
    uom: item.unit || 'm',
    cost: cost,
    price: sellingPrice,
    stock: stock,
    reserved: reserved,
    available: available,
    reorderLevel: Number(item.reorderLevel || 0),
    location: item.location || '',
    supplier: item.supplierName || '',
    supplierContact: item.supplierContact || '',
    leadTime: item.leadTime || '',
    image: img,
    images: images,
    notes: item.notes || ''
  };
}

async function loadMaterialsFromApi() {
  try {
    const { default: api, Auth } = await import('../api.js');
    if (!Auth.isLoggedIn()) {
      Auth.requireLogin();
      return;
    }
    const res = await api.inventory.list({ page: 0, size: 200 });
    const items = Array.isArray(res) ? res : (res && res.content ? res.content : []);
    ALL_MATERIALS = (items || []).map(mapInventoryToMaterial);
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
  const trims = ALL_MATERIALS.filter(m => {
    const c = (m.category || '').toLowerCase();
    return c.includes('trim') || c.includes('accessori');
  }).length;
  const consumables = ALL_MATERIALS.filter(m => {
    const c = (m.category || '').toLowerCase();
    return c.includes('consumable') || c.includes('thread') || c.includes('lining');
  }).length;
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
  const trimsCount = ALL_MATERIALS.filter(m => {
    const c = (m.category || '').toLowerCase();
    return c.includes('trim') || c.includes('accessori');
  }).length;
  const consumablesCount = ALL_MATERIALS.filter(m => {
    const c = (m.category || '').toLowerCase();
    return c.includes('consumable') || c.includes('thread') || c.includes('lining');
  }).length;
  const packagingCount = ALL_MATERIALS.filter(m => (m.category || '').toLowerCase().includes('packaging')).length;
  const othersCount = ALL_MATERIALS.filter(m => {
    const c = (m.category || '').toLowerCase();
    return !c.includes('fabric') && !c.includes('trim') && !c.includes('accessori') && !c.includes('thread') && !c.includes('lining') && !c.includes('packaging');
  }).length;

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
    list = list.filter(m => {
      const c = (m.category || '').toLowerCase();
      if (currentFilterCategory === 'fabrics') return c === 'fabrics';
      if (currentFilterCategory === 'trims') return c.includes('trim') || c.includes('accessori');
      if (currentFilterCategory === 'consumables') return c.includes('consumable') || c.includes('thread') || c.includes('lining');
      if (currentFilterCategory === 'packaging') return c.includes('packaging');
      if (currentFilterCategory === 'others') {
        return !c.includes('fabric') && !c.includes('trim') && !c.includes('accessori') && !c.includes('thread') && !c.includes('lining') && !c.includes('packaging');
      }
      return c === currentFilterCategory.toLowerCase();
    });
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
        <img src="${item.image}" alt="${escapeHtml(item.name)}" class="card-img" onerror="this.onerror=null;this.src='${FALLBACK_FABRIC_SVG}';" loading="lazy" />
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
      <td><img src="${item.image}" class="tbl-thumb" onerror="this.onerror=null;this.src='${FALLBACK_FABRIC_SVG}';"/></td>
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

function getColorHex(colorName) {
  if (!colorName) return 'rgba(255,255,255,0.4)';
  const c = colorName.toLowerCase().trim();
  const colorMap = {
    'skin nude': '#E8BEAC',
    'nude': '#E8BEAC',
    'beige': '#d4b996',
    'black': '#1c1917',
    'white': '#f8fafc',
    'ivory': '#fffff0',
    'silk ivory': '#fffff0',
    'cream': '#fdfbf7',
    'red': '#ef4444',
    'crimson': '#dc2626',
    'burgundy': '#800020',
    'blue': '#3b82f6',
    'navy': '#1e3a8a',
    'royal blue': '#1d4ed8',
    'green': '#10b981',
    'emerald': '#059669',
    'olive': '#84cc16',
    'yellow': '#eab308',
    'gold': '#d97706',
    'amber': '#f59e0b',
    'purple': '#a855f7',
    'violet': '#7c3aed',
    'pink': '#ec4899',
    'rose': '#f43f5e',
    'orange': '#f97316',
    'grey': '#6b7280',
    'gray': '#6b7280',
    'silver': '#9ca3af',
    'charcoal': '#374151',
    'brown': '#78350f',
    'tan': '#d2b48c'
  };
  for (const [key, hex] of Object.entries(colorMap)) {
    if (c.includes(key)) return hex;
  }
  return 'rgba(255,255,255,0.5)';
}

function isMaterialFavorite(id) {
  try {
    const favs = JSON.parse(localStorage.getItem('haulo_favorite_materials') || '[]');
    return favs.includes(String(id));
  } catch (e) {
    return false;
  }
}

function toggleMaterialFavorite(id) {
  try {
    let favs = JSON.parse(localStorage.getItem('haulo_favorite_materials') || '[]');
    const sId = String(id);
    let active = false;
    if (favs.includes(sId)) {
      favs = favs.filter(x => x !== sId);
      showToast('Removed from favorites', 'info');
      active = false;
    } else {
      favs.push(sId);
      showToast('Added to favorites', 'success');
      active = true;
    }
    localStorage.setItem('haulo_favorite_materials', JSON.stringify(favs));
    const favBtn = document.getElementById('productDetailFavBtn');
    if (favBtn) {
      favBtn.classList.toggle('active', active);
      const svg = favBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', active ? 'currentColor' : 'none');
    }
  } catch (e) {
    console.error(e);
  }
}

function selectDetailThumbnail(imgUrl, el) {
  const mainImg = document.getElementById('productDetailMainImg');
  if (mainImg) {
    mainImg.src = imgUrl;
  }
  const expandBtn = document.getElementById('productDetailExpandBtn');
  const m = getSelectedMaterial();
  if (expandBtn && m) {
    expandBtn.setAttribute('onclick', `openFullImageModal('${escapeHtml(imgUrl)}', '${escapeHtml(m.name)}')`);
  }
  document.querySelectorAll('.mat-thumb-item').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
}

function openFullImageModal(url, title) {
  const modal = document.getElementById('imageLightboxModal');
  const img = document.getElementById('lightboxImg');
  const titleEl = document.getElementById('lightboxTitle');
  if (modal && img) {
    img.src = url || FALLBACK_FABRIC_SVG;
    if (titleEl) titleEl.textContent = title || 'Product Image';
    modal.style.display = 'flex';
  }
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

  const status = getStockStatus(m);
  const activeImg = m.image || FALLBACK_FABRIC_SVG;
  const isFavorite = isMaterialFavorite(m.id);

  const metaParts = [...new Set([m.category, m.subCategory, m.color].filter(Boolean))];
  const metaCategory = metaParts.join(' / ') || 'Material';
  const subtitleParts = [...new Set([m.color, m.composition || m.subCategory].filter(Boolean))];
  const subtitle = subtitleParts.join(' • ');

  // Image Thumbnails (up to 5 thumbnails) - Only shown under the image if design/material has multiple images
  const imagesList = (m.images && m.images.length > 0) ? m.images : [activeImg];
  const hasMultipleImages = imagesList.length > 1;
  const maxThumbs = 5;
  const thumbsToShow = imagesList.slice(0, maxThumbs);
  const remainingCount = imagesList.length - maxThumbs;

  const thumbnailsHtml = hasMultipleImages ? `
    <div class="product-thumbnails-row">
      ${thumbsToShow.map((imgUrl, idx) => {
        const isLast = (idx === maxThumbs - 1) && remainingCount > 0;
        return `
          <div class="mat-thumb-item ${imgUrl === activeImg ? 'active' : ''}" onclick="selectDetailThumbnail('${escapeHtml(imgUrl)}', this)">
            <img src="${escapeHtml(imgUrl)}" alt="Thumbnail ${idx + 1}" onerror="this.onerror=null;this.src='${FALLBACK_FABRIC_SVG}';" />
            ${isLast ? `<div class="mat-thumb-overlay">+${remainingCount}</div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  ` : '';

  // Primary Supplier Box (Render only if supplier info exists)
  const hasSupplierInfo = m.supplier || m.location || m.leadTime || m.supplierContact;
  const supplierSectionHtml = hasSupplierInfo ? `
    <div class="product-supplier-section">
      <div class="supplier-section-header">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        <span>Primary Supplier</span>
      </div>
      <div class="supplier-card-box">
        <div class="supplier-left-details">
          <div class="supplier-icon-badge">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div class="supplier-text-group">
            <div class="supplier-main-name">${escapeHtml(m.supplier || 'Primary Supplier')}</div>
            ${m.location ? `
              <div class="supplier-detail-line">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${escapeHtml(m.location)}</span>
              </div>` : ''}
            ${m.leadTime ? `
              <div class="supplier-detail-line">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>Lead Time: ${escapeHtml(m.leadTime)}</span>
              </div>` : ''}
            ${m.supplierContact ? `
              <div class="supplier-detail-line">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>${escapeHtml(m.supplierContact)}</span>
              </div>` : ''}
          </div>
        </div>
        ${m.supplier ? `
          <button type="button" class="btn-contact-supplier" onclick="openSupplierContact('${escapeHtml(m.supplier)}')">
            <span>Contact Supplier</span>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>` : ''}
      </div>
    </div>
  ` : '';

  panel.innerHTML = `
    <!-- Upper 2-Column Split -->
    <div class="product-card-body-split">
      <!-- Left Side: Large Product Image & Thumbnails (50%) -->
      <div class="product-image-column">
        <div class="product-main-image-wrap">
          <img id="productDetailMainImg" src="${escapeHtml(activeImg)}" alt="${escapeHtml(m.name)}" class="product-main-img" onerror="this.onerror=null;this.src='${FALLBACK_FABRIC_SVG}';" />
          ${status.label ? `<span class="product-status-badge ${status.cssClass}">${status.label}</span>` : ''}
          <button type="button" class="product-fav-btn ${isFavorite ? 'active' : ''}" id="productDetailFavBtn" title="Favorite" onclick="toggleMaterialFavorite('${m.id}')">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button type="button" class="product-expand-btn" id="productDetailExpandBtn" title="View Full Image" onclick="openFullImageModal('${escapeHtml(activeImg)}', '${escapeHtml(m.name)}')">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            <span>View Full Image</span>
          </button>
        </div>

        <!-- Thumbnails Row (Only shown if design/material has multiple images) -->
        ${thumbnailsHtml}
      </div>

      <!-- Right Side: Product Information (55-60%) -->
      <div class="product-info-column">
        <!-- Top Row: Badges & Menu -->
        <div class="product-meta-row">
          <div class="product-meta-badges">
            <span class="badge-code">${escapeHtml(m.code)}</span>
            <span class="badge-cat">${escapeHtml(metaCategory)}</span>
          </div>
          <button type="button" class="btn-detail-menu" title="Actions" onclick="openContextMenu(event, '${m.id}')">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2"/></svg>
          </button>
        </div>

        <!-- Product Title & Details -->
        <h2 class="product-detail-title">${escapeHtml(m.name)}</h2>
        <div class="product-detail-subtitle">${escapeHtml(subtitle)}</div>

        <!-- Copy Code Action -->
        <div class="product-actions-line">
          <button type="button" class="btn-copy-code" onclick="copyMaterialCode('${escapeHtml(m.code)}')">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Copy Code</span>
          </button>
        </div>

        <!-- Description Box -->
        ${m.notes ? `
          <div class="product-desc-box">
            ${escapeHtml(m.notes)}
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Full Width Tabs Navigation -->
    <div class="details-tabs-nav">
      <button type="button" class="details-tab-btn ${currentDetailTab === 'overview' ? 'active' : ''}" onclick="switchDetailTab('overview')">Overview</button>
      <button type="button" class="details-tab-btn ${currentDetailTab === 'materials' ? 'active' : ''}" onclick="switchDetailTab('materials')">Materials</button>
      <button type="button" class="details-tab-btn ${currentDetailTab === 'measurements' ? 'active' : ''}" onclick="switchDetailTab('measurements')">Measurements</button>
      <button type="button" class="details-tab-btn ${currentDetailTab === 'production' ? 'active' : ''}" onclick="switchDetailTab('production')">Production</button>
      <button type="button" class="details-tab-btn ${currentDetailTab === 'images' ? 'active' : ''}" onclick="switchDetailTab('images')">Images</button>
    </div>

    <!-- Full Width Tab Content (Material Specifications, etc.) -->
    <div class="details-tab-content">
      ${renderActiveDetailTab(m, status)}
    </div>

    <!-- Lower Section: Primary Supplier (Full Width) -->
    ${supplierSectionHtml}
  `;
}

function switchDetailTab(tabName) {
  currentDetailTab = tabName;
  renderSelectedDetails();
}

function renderActiveDetailTab(m, status) {
  switch (currentDetailTab) {
    case 'overview':
      return `
        <!-- Material Specifications (Full Width) -->
        <div class="spec-section-card">
          <div class="spec-section-header">
            <div class="spec-section-title-wrap">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              <span>Material Specifications</span>
            </div>
            ${m.hsn ? `<span class="badge-hsn">HSN: ${escapeHtml(m.hsn)}</span>` : ''}
          </div>

          <div class="specs-table-rows">
            ${m.composition ? `
              <div class="spec-row">
                <span class="spec-label">Composition</span>
                <span class="spec-value">${escapeHtml(m.composition)}</span>
              </div>` : ''}
            ${m.width ? `
              <div class="spec-row">
                <span class="spec-label">Width / Size</span>
                <span class="spec-value">${escapeHtml(m.width)}</span>
              </div>` : ''}
            ${m.gsm ? `
              <div class="spec-row">
                <span class="spec-label">Weight / GSM</span>
                <span class="spec-value">${escapeHtml(m.gsm)}</span>
              </div>` : ''}
            ${m.weave ? `
              <div class="spec-row">
                <span class="spec-label">Weave / Style</span>
                <span class="spec-value">${escapeHtml(m.weave)}</span>
              </div>` : ''}
            ${m.color ? `
              <div class="spec-row">
                <span class="spec-label">Colour</span>
                <span class="spec-value">
                  <span class="spec-color-dot" style="background-color: ${getColorHex(m.color)};"></span>
                  <span>${escapeHtml(m.color.replace(/^size\s*[\d\w-]+\s*/i, '').trim() || m.color)}</span>
                </span>
              </div>` : ''}
            ${(m.origin || m.location) ? `
              <div class="spec-row">
                <span class="spec-label">Origin</span>
                <span class="spec-value">${escapeHtml(m.origin || m.location)}</span>
              </div>` : ''}
            ${m.uom ? `
              <div class="spec-row">
                <span class="spec-label">Unit of Measure</span>
                <span class="spec-value">${escapeHtml(m.uom)}</span>
              </div>` : ''}
          </div>
        </div>
      `;

    case 'materials':
      return `
        <div class="spec-section-card">
          <div class="spec-section-header">
            <div class="spec-section-title-wrap">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              <span>Fiber &amp; Material Properties</span>
            </div>
          </div>
          <div class="specs-table-rows">
            ${m.composition ? `<div class="spec-row"><span class="spec-label">Composition</span><span class="spec-value">${escapeHtml(m.composition)}</span></div>` : ''}
            ${m.weave ? `<div class="spec-row"><span class="spec-label">Weave Structure</span><span class="spec-value">${escapeHtml(m.weave)}</span></div>` : ''}
            ${m.color ? `<div class="spec-row"><span class="spec-label">Dye / Colorway</span><span class="spec-value"><span class="spec-color-dot" style="background-color: ${getColorHex(m.color)};"></span><span>${escapeHtml(m.color.replace(/^size\s*[\d\w-]+\s*/i, '').trim() || m.color)}</span></span></div>` : ''}
            ${m.origin ? `<div class="spec-row"><span class="spec-label">Country / Mill Origin</span><span class="spec-value">${escapeHtml(m.origin)}</span></div>` : ''}
          </div>
          ${m.notes ? `
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
              <div class="spec-label" style="margin-bottom: 4px;">Care &amp; Handling Notes</div>
              <div style="font-size: 11.5px; color: rgba(255,255,255,0.7); line-height: 1.45;">${escapeHtml(m.notes)}</div>
            </div>` : ''}
        </div>
      `;

    case 'measurements':
      return `
        <div class="spec-section-card">
          <div class="spec-section-header">
            <div class="spec-section-title-wrap">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/><path d="m14.5 3.5 6 6"/><path d="m7.5 10.5 2 2"/><path d="m10.5 13.5 2 2"/><path d="m13.5 16.5 2 2"/></svg>
              <span>Dimensional &amp; Weight Specs</span>
            </div>
          </div>
          <div class="specs-table-rows">
            ${m.width ? `<div class="spec-row"><span class="spec-label">Cuttable Width / Size</span><span class="spec-value">${escapeHtml(m.width)}</span></div>` : ''}
            ${m.gsm ? `<div class="spec-row"><span class="spec-label">Fabric Weight / GSM</span><span class="spec-value">${escapeHtml(m.gsm)}</span></div>` : ''}
            ${m.uom ? `<div class="spec-row"><span class="spec-label">Unit of Measure</span><span class="spec-value">${escapeHtml(m.uom)}</span></div>` : ''}
            ${m.hsn ? `<div class="spec-row"><span class="spec-label">HSN / Tariff Code</span><span class="spec-value">${escapeHtml(m.hsn)}</span></div>` : ''}
          </div>
        </div>
      `;

    case 'production':
      return `
        <div class="spec-section-card">
          <div class="spec-section-header">
            <div class="spec-section-title-wrap">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span>Garment Allocations &amp; Production</span>
            </div>
          </div>
          <div style="text-align: center; padding: 20px 12px; color: rgba(255,255,255,0.5); font-size: 12px;">
            <div>Material allocations are managed via active production orders.</div>
            <a href="../orders/order-overview/order-overview.html" style="display: inline-flex; align-items: center; gap: 4px; color: var(--lime, #B8FF3D); text-decoration: none; font-weight: 600; margin-top: 8px;">
              <span>View Production Orders</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
          </div>
        </div>
      `;

    case 'images':
      const imagesList = (m.images && m.images.length > 0) ? m.images : [m.image];
      return `
        <div class="spec-section-card">
          <div class="spec-section-header">
            <div class="spec-section-title-wrap">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>Swatches &amp; High-Res Photos</span>
            </div>
            <button type="button" class="btn-detail-small" onclick="openAddImageModal()">+ Add Photo</button>
          </div>
          <div class="swatches-grid">
            ${imagesList.map((img, i) => `
              <div class="swatch-item" onclick="selectDetailThumbnail('${escapeHtml(img)}'); openFullImageModal('${escapeHtml(img)}', '${escapeHtml(m.name)}')">
                <img src="${escapeHtml(img)}" alt="Swatch ${i + 1}" onerror="this.onerror=null;this.src='${FALLBACK_FABRIC_SVG}';"/>
              </div>
            `).join('')}
            <div class="btn-add-swatch" onclick="openAddImageModal()">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              <span>Add Swatch</span>
            </div>
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
  const subCategory = document.getElementById('newMatSubCat').value.trim();
  const color = document.getElementById('newMatColor').value.trim();
  const composition = document.getElementById('newMatComposition').value.trim();
  const width = document.getElementById('newMatWidth').value.trim();
  const gsm = document.getElementById('newMatGsm').value.trim();
  const uom = document.getElementById('newMatUom').value;
  const cost = parseFloat(document.getElementById('newMatCost').value) || 0;
  const price = parseFloat(document.getElementById('newMatPrice').value) || 0;
  const stock = parseFloat(document.getElementById('newMatStock').value) || 0;
  const reorder = parseFloat(document.getElementById('newMatReorder').value) || 0;
  const supplier = document.getElementById('newMatSupplier').value.trim();
  const imageUrl = document.getElementById('newMatImageUrl').value.trim();

  try {
    const { default: api } = await import('../api.js');
    const created = await api.inventory.create({
      name,
      category,
      variant: subCategory || color || 'Standard',
      unit: uom,
      stockQty: stock,
      reservedQty: 0,
      reorderLevel: reorder,
      purchasePrice: cost,
      sellingPrice: price,
      supplierName: supplier,
      composition,
      width,
      gsm,
      imageUrl: imageUrl || null
    });

    const newMaterial = mapInventoryToMaterial(created);
    ALL_MATERIALS.unshift(newMaterial);
    selectedMaterialId = newMaterial.id;

    closeModal('addMaterialModal');
    event.target.reset();

    populateSupplierFilter();
    updateKpiNumbers();
    updateCategoryCounts();
    renderMaterialList();
    renderSelectedDetails();

    showToast(`Material ${newMaterial.code} created and saved to database!`, 'success');
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
      <img src="${adjustmentTargetMaterial.image}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;" onerror="this.src='${FALLBACK_FABRIC_SVG}';"/>
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
    const { default: api } = await import('../api.js');
    if (adjustmentTargetMaterial.id) {
      const updated = await api.inventory.adjust(adjustmentTargetMaterial.id, delta, reason, 'Admin');
      if (updated) {
        adjustmentTargetMaterial.stock = Number(updated.stockQty || 0);
        adjustmentTargetMaterial.available = Number(updated.availableQty != null ? updated.availableQty : Math.max(0, adjustmentTargetMaterial.stock - adjustmentTargetMaterial.reserved));
      }
    }
    if (location) {
      adjustmentTargetMaterial.location = location;
      api.inventory.update(adjustmentTargetMaterial.id, {
        name: adjustmentTargetMaterial.name,
        category: adjustmentTargetMaterial.category,
        variant: adjustmentTargetMaterial.color,
        unit: adjustmentTargetMaterial.uom,
        stockQty: adjustmentTargetMaterial.stock,
        reservedQty: adjustmentTargetMaterial.reserved,
        reorderLevel: adjustmentTargetMaterial.reorderLevel,
        purchasePrice: adjustmentTargetMaterial.cost,
        sellingPrice: adjustmentTargetMaterial.price,
        composition: adjustmentTargetMaterial.composition,
        weave: adjustmentTargetMaterial.weave,
        width: adjustmentTargetMaterial.width,
        gsm: adjustmentTargetMaterial.gsm,
        hsnCode: adjustmentTargetMaterial.hsn,
        origin: adjustmentTargetMaterial.origin,
        location: location,
        leadTime: adjustmentTargetMaterial.leadTime,
        supplierName: adjustmentTargetMaterial.supplier,
        supplierContact: adjustmentTargetMaterial.supplierContact,
        notes: adjustmentTargetMaterial.notes,
        imageUrl: adjustmentTargetMaterial.image
      }).catch(err => console.warn('Could not update location:', err));
    }

    closeModal('stockAdjustmentModal');
    event.target.reset();

    updateKpiNumbers();
    updateCategoryCounts();
    renderMaterialList();
    renderSelectedDetails();

    showToast(`Stock updated in database to ${adjustmentTargetMaterial.stock} ${adjustmentTargetMaterial.uom} (${reason})`, 'success');
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
    if (!m.images || m.images.length === 0) {
      m.images = [m.image || FALLBACK_FABRIC_SVG];
    }
    if (!m.images.includes(url)) {
      m.images.push(url);
    }
    closeModal('addImageModal');
    event.target.reset();
    renderSelectedDetails();
    showToast('Swatch image attached!', 'success');
  }
}

function selectDetailThumbnail(url, el) {
  const mainImg = document.getElementById('productDetailMainImg');
  if (mainImg) {
    mainImg.src = url;
  }
  const expandBtn = document.getElementById('productDetailExpandBtn');
  if (expandBtn) {
    const m = getSelectedMaterial();
    expandBtn.setAttribute('onclick', `openFullImageModal('${escapeHtml(url)}', '${escapeHtml(m ? m.name : '')}')`);
  }
  if (el) {
    const parent = el.closest('.product-thumbnails-row');
    if (parent) {
      parent.querySelectorAll('.mat-thumb-item').forEach(thumb => thumb.classList.remove('active'));
      el.classList.add('active');
    }
  }
}

function openFullImageModal(url, title) {
  const modal = document.getElementById('imageLightboxModal');
  const img = document.getElementById('lightboxImg');
  const titleEl = document.getElementById('lightboxTitle');
  if (modal && img) {
    img.src = url || FALLBACK_FABRIC_SVG;
    if (titleEl) titleEl.textContent = title || 'Product Image';
    modal.style.display = 'flex';
  }
}

function openImageLightbox(url) {
  const m = getSelectedMaterial();
  if (m) {
    m.image = url;
    renderSelectedDetails();
    showToast('Thumbnail view updated', 'info');
  }
}

// Save Notes from Tab
async function saveMaterialNotes() {
  const m = getSelectedMaterial();
  const textarea = document.getElementById('materialNotesInput');
  if (m && textarea) {
    const notes = textarea.value.trim();
    try {
      const { default: api } = await import('../api.js');
      await api.inventory.update(m.id, {
        name: m.name,
        category: m.category,
        variant: m.color,
        unit: m.uom,
        stockQty: m.stock,
        reservedQty: m.reserved,
        reorderLevel: m.reorderLevel,
        purchasePrice: m.cost,
        sellingPrice: m.price,
        composition: m.composition,
        weave: m.weave,
        width: m.width,
        gsm: m.gsm,
        hsnCode: m.hsn,
        origin: m.origin,
        location: m.location,
        leadTime: m.leadTime,
        supplierName: m.supplier,
        supplierContact: m.supplierContact,
        notes: notes,
        imageUrl: m.image
      });
      m.notes = notes;
      showToast('Care instructions and notes saved to database!', 'success');
    } catch (err) {
      console.error('Failed to save notes:', err);
      showToast('Failed to save notes: ' + (err.message || 'Unknown error'), 'error');
    }
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
  if (window.NotificationCenter && typeof window.NotificationCenter.toast === 'function') {
    const sevMap = { error: 'danger', danger: 'danger', warn: 'warn', warning: 'warn', success: 'success', info: 'info' };
    const sev = sevMap[type] || 'info';
    window.NotificationCenter.toast({
      title: type === 'success' ? 'Inventory & Materials' : (type === 'warn' ? 'Stock Warning' : 'Materials'),
      message: message,
      severity: sev,
      duration: 3800
    });

    // If this is a reorder or significant stock event, push dynamic notification
    if (type === 'success' && (message.includes('Reorder drafted') || message.includes('Stock updated') || message.includes('created and saved'))) {
      window.NotificationCenter.push({
        type: 'fabrics',
        module: 'Inventory & Materials',
        severity: 'success',
        title: message.includes('Reorder') ? 'Reorder Drafted' : 'Stock Updated',
        message: message,
        silent: true,
        actionUrl: '../fabrics-materials/fabrics-materials.html'
      });
    }
    return;
  }

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

// ────────────────────────────────────────────────────────────
// EXPOSE HANDLERS TO WINDOW (For HTML onclick and module safety)
// ────────────────────────────────────────────────────────────
window.exportMaterialsCSV = exportMaterialsCSV;
window.openStockAdjustmentModal = openStockAdjustmentModal;
window.openAddMaterialModal = openAddMaterialModal;
window.selectCategoryFilter = selectCategoryFilter;
window.handleSearch = handleSearch;
window.openFilterModal = openFilterModal;
window.setViewMode = setViewMode;
window.changePage = changePage;
window.goToPage = goToPage;
window.closeModal = closeModal;
window.handleSaveNewMaterial = handleSaveNewMaterial;
window.updateAdjTypeLabels = updateAdjTypeLabels;
window.handleSaveStockAdjustment = handleSaveStockAdjustment;
window.resetFilters = resetFilters;
window.applyAdvancedFilters = applyAdvancedFilters;
window.openAddImageModal = openAddImageModal;
window.handleSaveImage = handleSaveImage;
window.handleCardMenuAction = handleCardMenuAction;
window.selectMaterial = selectMaterial;
window.switchDetailTab = switchDetailTab;
window.openStockAdjustmentForCurrent = openStockAdjustmentForCurrent;
window.openSupplierContact = openSupplierContact;
window.openImageLightbox = openImageLightbox;
window.saveMaterialNotes = saveMaterialNotes;
window.openContextMenu = openContextMenu;
window.copyMaterialCode = copyMaterialCode;
window.showToast = showToast;
window.toggleMaterialFavorite = toggleMaterialFavorite;
window.isMaterialFavorite = isMaterialFavorite;
window.selectDetailThumbnail = selectDetailThumbnail;
window.openFullImageModal = openFullImageModal;
window.getColorHex = getColorHex;

