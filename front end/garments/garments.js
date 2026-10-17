/**
 * HAULO BOUTIQUE ERP — Haute Couture Garments Module Controller
 * garments.js — Catalog of atelier garments, bespoke silhouettes, and craftsmanship details
 */

import api, { Auth } from '../api.js';

// ─── Existing Haute Couture Image Assets Pool ──────────────────────────────
export const EXISTING_GARMENT_ASSETS = {
  blouse: '../assets/garments/bridal_blouse_zardozi.jpg',
  lehenga: '../assets/garments/heritage_lehenga_pink.jpg',
  anarkali: '../assets/garments/anarkali_chikankari.jpg',
  sherwani: '../assets/garments/raw_silk_sherwani.jpg',
  saree: '../assets/garments/banarasi_organza_saree.jpg',
  gown: '../assets/garments/champagne_evening_gown.jpg',
  kurti: '../assets/garments/zardozi_handwork.jpg',
  chudi: '../assets/garments/bridal_blouse_zardozi.jpg',
  default: '../assets/garments/bridal_blouse_zardozi.jpg'
};

export function resolveGarmentImage(g) {
  if (g && g.imageUrl && typeof g.imageUrl === 'string' && g.imageUrl.trim() !== '' && !g.imageUrl.startsWith('data:image/svg')) {
    let url = g.imageUrl.trim();
    if (url.startsWith('/front end/')) {
      return '..' + url.replace('/front end', '');
    }
    if (url.startsWith('/assets/')) {
      return '../' + url.slice(1);
    }
    if (url.startsWith('../../assets/')) {
      return url.replace('../../assets/', '../assets/');
    }
    return url;
  }

  const text = ((g?.garmentType || '') + ' ' + (g?.title || '') + ' ' + (g?.silhouette || '')).toLowerCase();
  if (text.includes('blouse') || text.includes('choli')) return EXISTING_GARMENT_ASSETS.blouse;
  if (text.includes('lehenga') || text.includes('skirt') || text.includes('bridal')) return EXISTING_GARMENT_ASSETS.lehenga;
  if (text.includes('anarkali') || text.includes('chikankari')) return EXISTING_GARMENT_ASSETS.anarkali;
  if (text.includes('sherwani') || text.includes('kurta') || text.includes('jacket')) return EXISTING_GARMENT_ASSETS.sherwani;
  if (text.includes('saree') || text.includes('organza') || text.includes('banarasi')) return EXISTING_GARMENT_ASSETS.saree;
  if (text.includes('gown') || text.includes('evening') || text.includes('corset')) return EXISTING_GARMENT_ASSETS.gown;
  if (text.includes('kurti') || text.includes('sharara') || text.includes('peplum') || text.includes('chudi')) return EXISTING_GARMENT_ASSETS.kurti;

  return EXISTING_GARMENT_ASSETS.default;
}
window.resolveGarmentImage = resolveGarmentImage;

// ─── Module State ──────────────────────────────────────────────────────────
let searchDebounceTimer = null;

const state = {
  garments: [],
  selectedGarment: null,
  selectedIds: new Set(),
  searchQuery: '',
  filters: {
    garmentType: 'all',
    collection: 'all',
    fabric: 'all',
    status: 'all',
    materialStatus: 'all',
    designer: 'all',
    branch: 'all',
  },
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
  activeTab: 'overview',
  loading: false,
};

// ─── DOM Cache ─────────────────────────────────────────────────────────────
let DOM = {};

function cacheDOM() {
  DOM = {
    // Header
    headerDropdownMenu: document.getElementById('headerDropdownMenu'),

    // KPIs
    valTotalGarments: document.getElementById('valTotalGarments'),
    deltaTotalGarments: document.getElementById('deltaTotalGarments'),
    valInProduction: document.getElementById('valInProduction'),
    deltaInProduction: document.getElementById('deltaInProduction'),
    valReady: document.getElementById('valReady'),
    deltaReady: document.getElementById('deltaReady'),
    valAwaitingQc: document.getElementById('valAwaitingQc'),
    deltaAwaitingQc: document.getElementById('deltaAwaitingQc'),
    valBridalCount: document.getElementById('valBridalCount'),
    deltaBridal: document.getElementById('deltaBridal'),
    valAvgCrafting: document.getElementById('valAvgCrafting'),
    deltaAvgCrafting: document.getElementById('deltaAvgCrafting'),

    // Filters & Search
    searchGarments: document.getElementById('searchGarments'),
    filterGarmentType: document.getElementById('filterGarmentType'),
    filterCollection: document.getElementById('filterCollection'),
    filterFabric: document.getElementById('filterFabric'),
    filterStatus: document.getElementById('filterStatus'),
    filterMaterialStatus: document.getElementById('filterMaterialStatus'),
    filterDesigner: document.getElementById('filterDesigner'),
    filterBranch: document.getElementById('filterBranch'),

    // Table & Pagination
    checkSelectAll: document.getElementById('checkSelectAll'),
    garmentsTable: document.getElementById('garmentsTable'),
    garmentsTableBody: document.getElementById('garmentsTableBody'),
    emptyState: document.getElementById('emptyState'),
    paginationInfo: document.getElementById('paginationInfo'),
    paginationControls: document.getElementById('paginationControls'),
    pageSizeSelect: document.getElementById('pageSizeSelect'),

    // Inspector Drawer
    garmentInspector: document.getElementById('garmentInspector'),
    inspectorHeroImg: document.getElementById('inspectorHeroImg'),
    inspectorHeroSilhouette: document.getElementById('inspectorHeroSilhouette'),
    inspectorCode: document.getElementById('inspectorCode'),
    inspectorTitle: document.getElementById('inspectorTitle'),
    inspectorStatusBadge: document.getElementById('inspectorStatusBadge'),
    
    // Inspector Overview Pane Elements
    detType: document.getElementById('detType'),
    detCollection: document.getElementById('detCollection'),
    detDesign: document.getElementById('detDesign'),
    detFabric: document.getElementById('detFabric'),
    detEmbroidery: document.getElementById('detEmbroidery'),
    detColorDot: document.getElementById('detColorDot'),
    detColorName: document.getElementById('detColorName'),
    detSilhouette: document.getElementById('detSilhouette'),
    detSuggestedPrice: document.getElementById('detSuggestedPrice'),
    detEstimatedCost: document.getElementById('detEstimatedCost'),
    detCraftingHours: document.getElementById('detCraftingHours'),
    detAssigned: document.getElementById('detAssigned'),
    detBranch: document.getElementById('detBranch'),
    detMaterialStatus: document.getElementById('detMaterialStatus'),
    inspectorNotesBox: document.getElementById('inspectorNotesBox'),
    detNotes: document.getElementById('detNotes'),

    // Inspector Tab Panes
    paneOverview: document.getElementById('paneOverview'),
    paneMaterials: document.getElementById('paneMaterials'),
    paneMeasurements: document.getElementById('paneMeasurements'),
    inspectorMaterialsList: document.getElementById('inspectorMaterialsList'),
    inspectorMeasurementsList: document.getElementById('inspectorMeasurementsList'),

    toastContainer: document.getElementById('toastContainer'),
  };
}

// ─── Lifecycle & Initialization ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  cacheDOM();

  // Highlight active sidebar navigation
  function highlightGarmentsNav() {
    const navGarments = document.getElementById('nav-garments');
    if (navGarments) {
      document.querySelectorAll('.sidebar .nav-item').forEach(el => el.classList.remove('active'));
      navGarments.classList.add('active');
      navGarments.classList.remove('uncompleted');
    }
  }
  highlightGarmentsNav();
  document.addEventListener('nav:ready', highlightGarmentsNav);
  document.addEventListener('nav:fragmentLoaded', highlightGarmentsNav);

  // Close header dropdown on outside click
  document.addEventListener('click', (e) => {
    if (DOM.headerDropdownMenu && !e.target.closest('.header-actions')) {
      DOM.headerDropdownMenu.classList.remove('active');
    }
  });

  // Enable mouse wheel horizontal scrolling for single-line filter bar
  const fw = document.querySelector('.filters-wrap');
  if (fw) {
    fw.addEventListener('wheel', (evt) => {
      if (evt.deltaY !== 0) {
        fw.scrollLeft += evt.deltaY;
        evt.preventDefault();
      }
    }, { passive: false });
  }

  // Load dynamic filter options, KPIs & Garments catalog
  await loadDynamicFilterDropdowns();

  await Promise.all([
    loadKpiMetrics(),
    loadGarmentsData()
  ]);

  if (window.lucide) window.lucide.createIcons();
});

// ─── Load Dynamic Filter Dropdowns (Branches, Designers, Collections) ──────
async function loadDynamicFilterDropdowns() {
  try {
    // 1. Populate Branches from DB
    if (api?.branches?.list) {
      const branches = await api.branches.list();
      const select = document.getElementById('filterBranch');
      if (select && Array.isArray(branches) && branches.length > 0) {
        select.innerHTML = '<option value="all">Branch</option>' +
          branches.map(b => `<option value="${escapeHTML(b.name)}">${escapeHTML(b.name)}</option>`).join('');
      }
    }

    // 2. Populate Designers & Artisans from DB
    if (api?.employees?.list) {
      const empRes = await api.employees.list({ size: 100 });
      const emps = empRes?.content || (Array.isArray(empRes) ? empRes : []);
      const select = document.getElementById('filterDesigner');
      if (select && Array.isArray(emps) && emps.length > 0) {
        select.innerHTML = '<option value="all">Artisan</option>' +
          emps.map(e => `<option value="${escapeHTML(e.name)}">${escapeHTML(e.name)}</option>`).join('');
      }
    }

    // 3. Populate Collections from DB if available
    if (api?.collections?.list) {
      const colRes = await api.collections.list();
      const cols = Array.isArray(colRes) ? colRes : (colRes?.content || []);
      const select = document.getElementById('filterCollection');
      if (select && cols.length > 0) {
        select.innerHTML = '<option value="all">Collection</option>' +
          cols.map(c => `<option value="${escapeHTML(c.name || c.title)}">${escapeHTML(c.name || c.title)}</option>`).join('');
      }
    }
  } catch (err) {
    console.warn('[Garments] Filter dropdown loading error:', err);
  }
}

// ─── Load Atelier KPI Metrics ─────────────────────────────────────────────
async function loadKpiMetrics() {
  try {
    const kpis = await api.garments.kpis();
    if (!kpis) return;

    if (DOM.valTotalGarments) DOM.valTotalGarments.textContent = kpis.totalGarments ?? 0;
    if (DOM.valInProduction) DOM.valInProduction.textContent = kpis.inProduction ?? 0;
    if (DOM.valReady) DOM.valReady.textContent = kpis.ready ?? 0;
    if (DOM.valAwaitingQc) DOM.valAwaitingQc.textContent = kpis.awaitingQc ?? 0;
    if (DOM.valBridalCount) DOM.valBridalCount.textContent = kpis.bridalCount ?? 0;
    if (DOM.valAvgCrafting) DOM.valAvgCrafting.textContent = (kpis.avgCraftingHours ? Math.round(kpis.avgCraftingHours) + 'h' : '28h');
  } catch (err) {
    console.warn('Could not load garment atelier KPIs:', err);
  }
}

// ─── Load Garments Table Data ─────────────────────────────────────────────
async function loadGarmentsData() {
  state.loading = true;
  try {
    const params = {
      page: state.pagination.page,
      size: state.pagination.size,
    };

    if (state.searchQuery) params.search = state.searchQuery.trim();
    if (state.filters.garmentType && state.filters.garmentType !== 'all') params.garmentType = state.filters.garmentType;
    if (state.filters.collection && state.filters.collection !== 'all') params.collection = state.filters.collection;
    if (state.filters.fabric && state.filters.fabric !== 'all') params.fabric = state.filters.fabric;
    if (state.filters.status && state.filters.status !== 'all') params.status = state.filters.status;
    if (state.filters.materialStatus && state.filters.materialStatus !== 'all') params.materialStatus = state.filters.materialStatus;
    if (state.filters.designer && state.filters.designer !== 'all') params.designer = state.filters.designer;
    if (state.filters.branch && state.filters.branch !== 'all') params.branch = state.filters.branch;

    const res = await api.garments.list(params);
    const list = res.content || [];
    state.garments = list;

    state.pagination.totalElements = res.totalElements ?? list.length;
    state.pagination.totalPages = res.totalPages ?? Math.ceil(state.pagination.totalElements / state.pagination.size);

    // If no garment selected yet, select first
    if ((!state.selectedGarment || !state.garments.some(g => g.id === state.selectedGarment.id)) && state.garments.length > 0) {
      selectGarment(state.garments[0].id);
    } else if (state.garments.length === 0) {
      state.selectedGarment = null;
    }

    renderTable();
    renderPagination();
  } catch (err) {
    console.error('Failed to load garments:', err);
    showToast('Failed to load garments catalog from database', 'error');
  } finally {
    state.loading = false;
    if (window.lucide) window.lucide.createIcons();
  }
}

// ─── Render Garments Table ────────────────────────────────────────────────
function renderTable() {
  if (!DOM.garmentsTableBody) return;

  if (state.garments.length === 0) {
    DOM.garmentsTableBody.innerHTML = '';
    if (DOM.emptyState) DOM.emptyState.style.display = 'flex';
    if (DOM.garmentInspector) DOM.garmentInspector.style.display = 'none';
    return;
  }

  if (DOM.emptyState) DOM.emptyState.style.display = 'none';
  if (state.selectedGarment && DOM.garmentInspector) {
    DOM.garmentInspector.style.display = 'flex';
  }

  DOM.garmentsTableBody.innerHTML = state.garments.map(g => {
    const isSelected = state.selectedGarment && state.selectedGarment.id === g.id;
    const isChecked = state.selectedIds.has(g.id);

    const matClass = (g.materialStatus || 'READY').toLowerCase();
    const imgThumb = resolveGarmentImage(g);

    const colorHex = g.colorHex || '#9B111E';
    const colorName = g.colorName || 'Royal Tone';
    const priceFormatted = g.suggestedPrice ? '₹' + Number(g.suggestedPrice).toLocaleString('en-IN') : '₹—';
    const costFormatted = g.estimatedCost ? 'Cost: ₹' + Number(g.estimatedCost).toLocaleString('en-IN') : 'Cost: —';

    return `
      <tr class="${isSelected ? 'selected' : ''}" onclick="window.selectGarment('${g.id}')" ondblclick="window.viewGarmentDetails()" title="Click to inspect garment, double-click to launch 360° Dossier" style="cursor:pointer;">
        <td>
          <div class="cell-garment-info">
            <img class="garment-thumb-img" src="${imgThumb}" alt="${escapeHTML(g.title)}" onerror="this.src='${EXISTING_GARMENT_ASSETS.default}'" />
            <div class="garment-texts">
              <span class="garment-code-title">
                <span class="garment-code-chip">${escapeHTML(g.garmentCode)}</span>
                <span class="garment-title-text">${escapeHTML(g.title)}</span>
              </span>
              <span class="garment-spec-sub">${escapeHTML(g.silhouette || g.specs || 'Custom Atelier Cut')}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge-silhouette-type">${escapeHTML(g.garmentType)}</span>
        </td>
        <td>
          <div class="cell-design-col">
            <span class="collection-name-bold">${escapeHTML(g.collectionName || 'Main Haute Edit')}</span>
            <span class="design-code-sub">${escapeHTML(g.designCode || 'Custom Blueprint')}</span>
          </div>
        </td>
        <td>
          <div class="cell-fabric-craft">
            <span class="fabric-title">${escapeHTML(g.primaryFabric || 'Pure Silk / Brocade')}</span>
            <span class="craft-sub">${escapeHTML(g.embroideryType || 'Artisanal Embroidery')}</span>
          </div>
        </td>
        <td>
          <div class="cell-color-swatch">
            <span class="swatch-dot" style="background-color: ${colorHex};" title="${colorName}"></span>
            <span class="color-name-text">${escapeHTML(colorName)}</span>
          </div>
        </td>
        <td>
          <div class="cell-material-readiness">
            <span class="material-status-badge ${matClass}">
              <span class="dot-status ${matClass}"></span>
              <span>${capitalize(g.materialStatus || 'Ready')}</span>
            </span>
          </div>
        </td>
        <td>
          <div class="cell-artisan-branch">
            <span class="branch-name-bold">${escapeHTML(g.branch || 'Main Atelier')}</span>
            <span class="artisan-sub">${escapeHTML(g.assignedTo || g.designer || 'Master Artisan')}</span>
          </div>
        </td>
        <td>
          <div class="cell-pricing">
            <span class="suggested-price-val">${priceFormatted}</span>
            <span class="cost-estimate-sub">${costFormatted}</span>
          </div>
        </td>
        <td class="td-actions" onclick="event.stopPropagation()">
          <button type="button" class="btn-row-action" title="Garment Options" onclick="window.openRowMenu('${g.id}', event)">
            <i data-lucide="more-horizontal" style="width:16px;height:16px;"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── Select & Inspect Garment ─────────────────────────────────────────────
window.selectGarment = async function(id) {
  const g = state.garments.find(item => item.id === id);
  if (!g) return;

  state.selectedGarment = g;

  // Re-highlight row in table
  document.querySelectorAll('#garmentsTableBody tr').forEach(tr => tr.classList.remove('selected'));
  const allRows = Array.from(document.querySelectorAll('#garmentsTableBody tr'));
  const idx = state.garments.findIndex(item => item.id === id);
  if (allRows[idx]) allRows[idx].classList.add('selected');

  // Open inspector
  if (DOM.garmentInspector) DOM.garmentInspector.style.display = 'flex';

  // Fetch full detail with materials, measurement specs & lifecycle
  try {
    const detail = await api.garments.get(id);
    populateInspector(detail || g);
  } catch (err) {
    console.warn('Could not load garment detailed spec, falling back to summary:', err);
    populateInspector(g);
  }
};

function populateInspector(g) {
  if (!g) return;

  // Hero Image & Badges
  const heroImg = DOM.inspectorHeroImg || document.getElementById('inspectorHeroImg');
  if (heroImg) {
    heroImg.src = resolveGarmentImage(g);
  }
  const heroWrap = document.querySelector('.inspector-hero-wrap');
  if (heroWrap) {
    heroWrap.style.display = 'block';
  }
  if (DOM.inspectorHeroSilhouette) {
    DOM.inspectorHeroSilhouette.textContent = g.garmentType || 'Bespoke';
  }
  if (DOM.inspectorCode) DOM.inspectorCode.textContent = g.garmentCode || '—';
  if (DOM.inspectorTitle) DOM.inspectorTitle.textContent = g.title || '—';

  // Status Badge
  if (DOM.inspectorStatusBadge) {
    const sClass = getStatusCapsuleClass(g.status);
    DOM.inspectorStatusBadge.className = `badge-status-capsule ${sClass}`;
    DOM.inspectorStatusBadge.innerHTML = `<span class="status-dot"></span> ${escapeHTML(g.status || 'Active')}`;
  }

  // Pane 1: Overview
  if (DOM.detType) DOM.detType.textContent = g.garmentType || '—';
  if (DOM.detCollection) DOM.detCollection.textContent = g.collectionName || 'Main Collection';
  if (DOM.detDesign) DOM.detDesign.textContent = g.designCode || 'Atelier Blueprint';
  if (DOM.detFabric) DOM.detFabric.textContent = g.primaryFabric || 'Pure Raw Silk';
  if (DOM.detEmbroidery) DOM.detEmbroidery.textContent = g.embroideryType || 'Artisanal Handwork';

  if (DOM.detColorDot) {
    DOM.detColorDot.style.backgroundColor = g.colorHex || '#9B111E';
  }
  if (DOM.detColorName) {
    DOM.detColorName.textContent = g.colorName || 'Royal Crimson';
  }

  if (DOM.detSilhouette) DOM.detSilhouette.textContent = g.silhouette || g.specs || 'Custom Cut';

  if (DOM.detSuggestedPrice) {
    DOM.detSuggestedPrice.textContent = g.suggestedPrice ? '₹' + Number(g.suggestedPrice).toLocaleString('en-IN') : (g.totalAmount ? '₹' + Number(g.totalAmount).toLocaleString('en-IN') : '₹—');
  }
  if (DOM.detEstimatedCost) {
    DOM.detEstimatedCost.textContent = g.estimatedCost ? '₹' + Number(g.estimatedCost).toLocaleString('en-IN') : '₹—';
  }
  if (DOM.detCraftingHours) {
    DOM.detCraftingHours.textContent = g.craftingHours ? `${g.craftingHours} artisan hours` : '32 artisan hours';
  }
  if (DOM.detAssigned) DOM.detAssigned.textContent = g.assignedTo || g.designer || 'Master Artisan';
  if (DOM.detBranch) DOM.detBranch.textContent = g.branch || 'Main Atelier';

  if (DOM.detMaterialStatus) {
    DOM.detMaterialStatus.textContent = capitalize(g.materialStatus || 'Ready');
    const dot = DOM.detMaterialStatus.previousElementSibling;
    if (dot) dot.className = `dot-status ${(g.materialStatus || 'READY').toLowerCase()}`;
  }

  if (DOM.inspectorNotesBox && DOM.detNotes) {
    if (g.notes && g.notes.trim()) {
      DOM.detNotes.textContent = g.notes;
      DOM.inspectorNotesBox.style.display = 'block';
    } else {
      DOM.inspectorNotesBox.style.display = 'none';
    }
  }

  // Pane 2: Materials & Fabrics
  if (DOM.inspectorMaterialsList) {
    const materials = g.materials && g.materials.length > 0 ? g.materials : [
      { name: g.primaryFabric || 'Pure Micro Velvet 9000', variant: 'Main Body Fabric', meters: '3.50 m', status: 'READY', imageUrl: '../assets/swatch_raw_silk.jpg' },
      { name: g.embroideryType || 'Zardozi Dabka & Mukaish', variant: 'Artisanal Embellishment', meters: 'Gold Thread & Pearls', status: 'READY', imageUrl: '../assets/swatch_embroidery.jpg' },
      { name: 'Pure Cotton Silk Lining 80g', variant: 'Internal Structured Canvas', meters: '2.50 m', status: 'READY', imageUrl: '../assets/pink_silk.jpg' }
    ];

    DOM.inspectorMaterialsList.innerHTML = materials.map(m => `
      <div class="material-item-card">
        <img class="material-swatch-img" src="${m.imageUrl || '../assets/swatch_raw_silk.jpg'}" alt="${escapeHTML(m.name)}" onerror="this.src='../assets/swatch_raw_silk.jpg'" />
        <div class="material-meta">
          <span class="material-name">${escapeHTML(m.name)}</span>
          <span class="material-sub">${escapeHTML(m.variant || 'Atelier Sourced')} &bull; ${escapeHTML(m.meters || 'Ready')}</span>
        </div>
        <span class="badge-mat-status ${(m.status || 'READY').toLowerCase()}">${capitalize(m.status || 'Ready')}</span>
      </div>
    `).join('');
  }

  // Pane 3: Silhouette Specs & Anatomical Measurements
  if (DOM.inspectorMeasurementsList) {
    const measurements = g.measurements && g.measurements.length > 0 ? g.measurements : [
      { label: 'Silhouette Flare / Sweep', value: '180.0"' },
      { label: 'Waistband Circumference', value: '32.0"' },
      { label: 'Hip Ease Allowance', value: '+3.5"' },
      { label: 'Garment Length', value: '42.0"' },
      { label: 'Neckline Anchor Depth', value: '7.5"' },
      { label: 'Can-Can Stiffener Layers', value: 'Double Layer' }
    ];

    DOM.inspectorMeasurementsList.innerHTML = measurements.map(item => `
      <div class="spec-measure-card">
        <span class="spec-measure-label">${escapeHTML(item.label)}</span>
        <span class="spec-measure-value">${escapeHTML(item.value)}</span>
      </div>
    `).join('');
  }

  if (window.lucide) window.lucide.createIcons();
}

// ─── Inspector Tabs Switcher ──────────────────────────────────────────────
window.switchInspectorTab = function(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.inspector-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });

  const tabPanes = {
    overview: DOM.paneOverview,
    materials: DOM.paneMaterials,
    measurements: DOM.paneMeasurements
  };

  Object.keys(tabPanes).forEach(k => {
    if (tabPanes[k]) {
      tabPanes[k].classList.toggle('active', k === tabName);
    }
  });

  if (window.lucide) window.lucide.createIcons();
};

window.closeInspector = function() {
  if (DOM.garmentInspector) DOM.garmentInspector.style.display = 'none';
  document.querySelectorAll('#garmentsTableBody tr').forEach(tr => tr.classList.remove('selected'));
  state.selectedGarment = null;
};

window.toggleInspectorExpand = function() {
  if (DOM.garmentInspector) {
    DOM.garmentInspector.classList.toggle('expanded');
  }
};

// ─── View 360° Dossier Navigation ─────────────────────────────────────────
window.viewGarmentDetails = function() {
  const g = state.selectedGarment || (state.garments && state.garments[0]);
  if (!g) {
    showToast('Select a garment to view its 360° Dossier', 'info');
    return;
  }
  const query = g.id ? `id=${encodeURIComponent(g.id)}&code=${encodeURIComponent(g.garmentCode || '')}` : `code=${encodeURIComponent(g.garmentCode || '')}`;
  window.location.href = `garaments 360/garament360.html?${query}`;
};

window.editGarmentRecord = function() {
  const g = state.selectedGarment;
  if (!g) return;
  // Route to edit garment if supported or alert
  showToast(`Editing specifications for ${g.garmentCode}`, 'info');
};

window.printSingleGarment = function() {
  const g = state.selectedGarment;
  if (!g) return;
  window.print();
};

window.printGarmentBatch = function() {
  window.print();
};

// ─── Filter & Search Handlers ─────────────────────────────────────────────
window.handleSearchInput = function(e) {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    state.searchQuery = e.target.value || '';
    state.pagination.page = 0;
    loadGarmentsData();
  }, 300);
};

window.handleFilterChange = function() {
  state.filters.garmentType = DOM.filterGarmentType?.value || 'all';
  state.filters.collection = DOM.filterCollection?.value || 'all';
  state.filters.fabric = DOM.filterFabric?.value || 'all';
  state.filters.status = DOM.filterStatus?.value || 'all';
  state.filters.materialStatus = DOM.filterMaterialStatus?.value || 'all';
  state.filters.designer = DOM.filterDesigner?.value || 'all';
  state.filters.branch = DOM.filterBranch?.value || 'all';

  state.pagination.page = 0;
  loadGarmentsData();
};

window.clearAllFilters = function() {
  if (DOM.searchGarments) DOM.searchGarments.value = '';
  if (DOM.filterGarmentType) DOM.filterGarmentType.value = 'all';
  if (DOM.filterCollection) DOM.filterCollection.value = 'all';
  if (DOM.filterFabric) DOM.filterFabric.value = 'all';
  if (DOM.filterStatus) DOM.filterStatus.value = 'all';
  if (DOM.filterMaterialStatus) DOM.filterMaterialStatus.value = 'all';
  if (DOM.filterDesigner) DOM.filterDesigner.value = 'all';
  if (DOM.filterBranch) DOM.filterBranch.value = 'all';

  state.searchQuery = '';
  state.filters = {
    garmentType: 'all',
    collection: 'all',
    fabric: 'all',
    status: 'all',
    materialStatus: 'all',
    designer: 'all',
    branch: 'all',
  };
  state.pagination.page = 0;
  loadGarmentsData();
};

// ─── Pagination ───────────────────────────────────────────────────────────
function renderPagination() {
  const { page, size, totalElements, totalPages } = state.pagination;
  const start = totalElements === 0 ? 0 : page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);

  if (DOM.paginationInfo) {
    DOM.paginationInfo.textContent = `Showing ${start}–${end} of ${totalElements} silhouettes`;
  }

  if (!DOM.paginationControls) return;

  let btns = '';
  // Prev button
  btns += `<button type="button" class="btn-page-nav" ${page === 0 ? 'disabled' : ''} onclick="changePage(${page - 1})"><i data-lucide="chevron-left"></i></button>`;

  // Page Numbers
  const maxButtons = 5;
  let startP = Math.max(0, page - 2);
  let endP = Math.min(totalPages, startP + maxButtons);
  if (endP - startP < maxButtons) {
    startP = Math.max(0, endP - maxButtons);
  }

  for (let p = startP; p < endP; p++) {
    btns += `<button type="button" class="btn-page-num ${p === page ? 'active' : ''}" onclick="changePage(${p})">${p + 1}</button>`;
  }

  // Next button
  btns += `<button type="button" class="btn-page-nav" ${page >= totalPages - 1 ? 'disabled' : ''} onclick="changePage(${page + 1})"><i data-lucide="chevron-right"></i></button>`;

  DOM.paginationControls.innerHTML = btns;
  if (window.lucide) window.lucide.createIcons();
}

window.changePage = function(newPage) {
  if (newPage < 0 || newPage >= state.pagination.totalPages) return;
  state.pagination.page = newPage;
  loadGarmentsData();
};

window.handlePageSizeChange = function(newSize) {
  state.pagination.size = Number(newSize) || 10;
  state.pagination.page = 0;
  loadGarmentsData();
};

// ─── Selection Checkbox Handlers ──────────────────────────────────────────
window.toggleSelectAll = function(master) {
  const checked = master.checked;
  if (checked) {
    state.garments.forEach(g => state.selectedIds.add(g.id));
  } else {
    state.selectedIds.clear();
  }
  renderTable();
};

window.toggleRowSelect = function(id, e) {
  e.stopPropagation();
  if (state.selectedIds.has(id)) {
    state.selectedIds.delete(id);
  } else {
    state.selectedIds.add(id);
  }
  if (DOM.checkSelectAll) {
    DOM.checkSelectAll.checked = state.garments.length > 0 && state.garments.every(g => state.selectedIds.has(g.id));
  }
};

// ─── Header & Row Actions ─────────────────────────────────────────────────
window.toggleMoreMenu = function(e) {
  e.stopPropagation();
  if (DOM.headerDropdownMenu) {
    DOM.headerDropdownMenu.classList.toggle('active');
  }
};

window.refreshGarmentsData = async function() {
  showToast('Refreshing garments catalog...', 'info');
  await Promise.all([loadKpiMetrics(), loadGarmentsData()]);
  showToast('Catalog refreshed', 'success');
};

window.exportGarmentsCsv = function() {
  if (!state.garments || state.garments.length === 0) {
    showToast('No garment records to export', 'info');
    return;
  }
  const headers = ['Garment Code', 'Title', 'Silhouette Type', 'Collection', 'Design Blueprint', 'Primary Fabric', 'Embroidery Craft', 'Color', 'Material Readiness', 'Crafting Hours', 'Suggested Price', 'Estimated Cost', 'Lead Artisan', 'Branch', 'Status'];
  const rows = state.garments.map(g => [
    `"${g.garmentCode || ''}"`,
    `"${g.title || ''}"`,
    `"${g.garmentType || ''}"`,
    `"${g.collectionName || ''}"`,
    `"${g.designCode || ''}"`,
    `"${g.primaryFabric || ''}"`,
    `"${g.embroideryType || ''}"`,
    `"${g.colorName || ''}"`,
    `"${g.materialStatus || 'Ready'}"`,
    `"${g.craftingHours || ''}"`,
    `"${g.suggestedPrice || ''}"`,
    `"${g.estimatedCost || ''}"`,
    `"${g.assignedTo || g.designer || ''}"`,
    `"${g.branch || ''}"`,
    `"${g.status || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `haulo_garments_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('Garments catalog exported to CSV', 'success');
};

window.openRowMenu = function(id, e) {
  e.stopPropagation();
  window.selectGarment(id);
  const actions = [
    { label: 'View 360° Dossier', icon: 'compass', action: () => window.viewGarmentDetails() },
    { label: 'Print Spec Sheet', icon: 'printer', action: () => window.printSingleGarment() }
  ];
  // Simple prompt or direct inspection
  window.viewGarmentDetails();
};

window.toggleSavedViews = function() {
  showToast('Default atelier view active: Haute Couture Collection', 'info');
};

// ─── Helper Classes ───────────────────────────────────────────────────────

function getStatusCapsuleClass(status) {
  const s = (status || '').toUpperCase();
  if (s.includes('READY')) return 'ready';
  if (s.includes('PRODUCTION')) return 'in-production';
  if (s.includes('QC')) return 'awaiting-qc';
  if (s.includes('HOLD')) return 'on-hold';
  return 'active';
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
}

function showToast(message, type = 'info') {
  if (!DOM.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
