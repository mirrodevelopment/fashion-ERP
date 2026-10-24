/**
 * HAULO BOUTIQUE ERP — Haute Couture Garments Module Controller
 * garments.js — Catalog of atelier garments, bespoke silhouettes, and craftsmanship details
 */

import api, { Auth } from '../api.js';

// ─── Inline Clean Silhouette Placeholder (Zero Synthetic Photo Mocks) ─────
export const EMPTY_GARMENT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z'/%3E%3C/svg%3E";

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
  return EMPTY_GARMENT_PLACEHOLDER;
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
    detCraftingHours: document.getElementById('detCraftingHours'),
    detAssigned: document.getElementById('detAssigned'),
    detBranch: document.getElementById('detBranch'),
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

// ─── Load Dynamic Filter Dropdowns (Silhouettes, Collections, Fabrics, Branches, Artisans) ──────
async function loadDynamicFilterDropdowns() {
  try {
    const opts = api?.garments?.filterOptions ? await api.garments.filterOptions() : null;
    if (!opts) return;

    // 1. Silhouettes / Garment Types
    const selType = document.getElementById('filterGarmentType');
    if (selType && Array.isArray(opts.garmentTypes) && opts.garmentTypes.length > 0) {
      selType.innerHTML = '<option value="all">Silhouette</option>' +
        opts.garmentTypes.map(t => `<option value="${escapeHTML(t)}">${escapeHTML(t)}</option>`).join('');
    }

    // 2. Collections from DB
    const selCol = document.getElementById('filterCollection');
    if (selCol && Array.isArray(opts.collections) && opts.collections.length > 0) {
      selCol.innerHTML = '<option value="all">Collection</option>' +
        opts.collections.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('');
    }

    // 3. Fabrics from DB
    const selFab = document.getElementById('filterFabric');
    if (selFab && Array.isArray(opts.fabrics) && opts.fabrics.length > 0) {
      selFab.innerHTML = '<option value="all">Fabric</option>' +
        opts.fabrics.map(f => `<option value="${escapeHTML(f)}">${escapeHTML(f)}</option>`).join('');
    }

    // 4. Branches from DB
    const selBranch = document.getElementById('filterBranch');
    if (selBranch && Array.isArray(opts.branches) && opts.branches.length > 0) {
      selBranch.innerHTML = '<option value="all">Branch</option>' +
        opts.branches.map(b => `<option value="${escapeHTML(b)}">${escapeHTML(b)}</option>`).join('');
    }

    // 5. Designers & Artisans from DB
    const selDesigner = document.getElementById('filterDesigner');
    if (selDesigner && Array.isArray(opts.designers) && opts.designers.length > 0) {
      selDesigner.innerHTML = '<option value="all">Artisan</option>' +
        opts.designers.map(d => `<option value="${escapeHTML(d)}">${escapeHTML(d)}</option>`).join('');
    }

    // 6. Atelier Status & Production Stages from DB
    const selStatus = document.getElementById('filterStatus');
    if (selStatus) {
      let stageDefs = [];
      try {
        if (api?.production?.stageDefinitions?.list) {
          stageDefs = await api.production.stageDefinitions.list({ activeOnly: true });
        }
      } catch (_) {}
      const stageOpts = (Array.isArray(stageDefs) && stageDefs.length > 0)
        ? stageDefs.map(s => `<option value="${escapeHTML(s.displayName || s.stageKey)}">${escapeHTML(s.displayName || s.stageKey)}</option>`).join('')
        : '<option value="In Production">In Production</option><option value="Ready">Ready</option>';

      selStatus.innerHTML = '<option value="all">Status</option>' +
        '<option value="In Production">In Production</option>' +
        stageOpts +
        '<option value="Archived">Archived</option>';
    }
  } catch (err) {
    console.warn('[Garments] Filter dropdown loading error:', err);
  }
}

// ─── Load Atelier KPI Metrics ─────────────────────────────────────────────
async function loadKpiMetrics() {
  try {
    const activeBranch = localStorage.getItem('haulo_active_branch');
    const kpiParams = (activeBranch && activeBranch !== 'ALL') ? { branch: activeBranch, catalogOnly: true } : { catalogOnly: true };
    const kpis = await api.garments.kpis(kpiParams);
    if (!kpis) return;

    if (DOM.valTotalGarments) DOM.valTotalGarments.textContent = kpis.totalGarments ?? 0;
    if (DOM.valInProduction) DOM.valInProduction.textContent = kpis.inProduction ?? 0;
    if (DOM.valReady) DOM.valReady.textContent = kpis.ready ?? 0;
    if (DOM.valAwaitingQc) DOM.valAwaitingQc.textContent = kpis.awaitingQc ?? 0;
    if (DOM.valBridalCount) DOM.valBridalCount.textContent = kpis.bridalCount ?? 0;
    if (DOM.valAvgCrafting) {
      const hrs = kpis.avgCraftingHours ? Math.round(kpis.avgCraftingHours) : 0;
      DOM.valAvgCrafting.textContent = hrs > 0 ? `${hrs}h` : '0h';
    }
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
      catalogOnly: true,
    };

    if (state.searchQuery) params.search = state.searchQuery.trim();
    if (state.filters.garmentType && state.filters.garmentType !== 'all') params.garmentType = state.filters.garmentType;
    if (state.filters.collection && state.filters.collection !== 'all') params.collection = state.filters.collection;
    if (state.filters.fabric && state.filters.fabric !== 'all') params.fabric = state.filters.fabric;
    if (state.filters.status && state.filters.status !== 'all') params.status = state.filters.status;
    if (state.filters.designer && state.filters.designer !== 'all') params.designer = state.filters.designer;
    const activeBranch = localStorage.getItem('haulo_active_branch');
    if (state.filters.branch && state.filters.branch !== 'all') {
      params.branch = state.filters.branch;
    } else if (activeBranch && activeBranch !== 'ALL') {
      params.branch = activeBranch;
    }

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

    const imgThumb = resolveGarmentImage(g);

    const colorHex = g.colorHex || 'transparent';
    const colorName = g.colorName || '—';

    return `
      <tr class="${isSelected ? 'selected' : ''}" onclick="window.selectGarment('${g.id}')" ondblclick="window.viewGarmentDetails()" title="Click to inspect garment, double-click to launch 360° Dossier" style="cursor:pointer;">
        <td>
          <div class="cell-garment-info">
            <img class="garment-thumb-img" src="${imgThumb}" alt="${escapeHTML(g.title || '')}" onerror="this.src=EMPTY_GARMENT_PLACEHOLDER" />
            <div class="garment-texts">
              <span class="garment-code-title">
                <span class="garment-code-chip">${escapeHTML(g.garmentCode || '—')}</span>
                <span class="garment-title-text">${escapeHTML(g.title || 'Untitled Garment')}</span>
              </span>
              <span class="garment-spec-sub">${escapeHTML(g.silhouette || g.specs || '—')}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge-silhouette-type">${escapeHTML(g.garmentType || 'Bespoke')}</span>
        </td>
        <td>
          <div class="cell-design-col">
            <span class="collection-name-bold">${escapeHTML(g.collectionName || '—')}</span>
            <span class="design-code-sub">${escapeHTML(g.designCode || '—')}</span>
          </div>
        </td>
        <td>
          <div class="cell-fabric-craft">
            <span class="fabric-title">${escapeHTML(g.primaryFabric || '—')}</span>
            <span class="craft-sub">${escapeHTML(g.embroideryType || '—')}</span>
          </div>
        </td>
        <td>
          <div class="cell-color-swatch">
            <span class="swatch-dot" style="background-color: ${colorHex};" title="${colorName}"></span>
            <span class="color-name-text">${escapeHTML(colorName)}</span>
          </div>
        </td>
        <td>
          <div class="cell-artisan-branch">
            <span class="branch-name-bold">${escapeHTML(g.branch || '—')}</span>
            <span class="artisan-sub">${escapeHTML(g.assignedTo || g.designer || '—')}</span>
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
  if (DOM.detCollection) DOM.detCollection.textContent = g.collectionName || '—';
  if (DOM.detDesign) DOM.detDesign.textContent = g.designCode || '—';
  if (DOM.detFabric) DOM.detFabric.textContent = g.primaryFabric || '—';
  if (DOM.detEmbroidery) DOM.detEmbroidery.textContent = g.embroideryType || '—';

  if (DOM.detColorDot) {
    DOM.detColorDot.style.backgroundColor = g.colorHex || 'transparent';
  }
  if (DOM.detColorName) {
    DOM.detColorName.textContent = g.colorName || '—';
  }

  if (DOM.detSilhouette) DOM.detSilhouette.textContent = g.silhouette || g.specs || '—';

  if (DOM.detCraftingHours) {
    DOM.detCraftingHours.textContent = g.craftingHours ? `${g.craftingHours} artisan hours` : '—';
  }
  if (DOM.detAssigned) DOM.detAssigned.textContent = g.assignedTo || g.designer || '—';
  if (DOM.detBranch) DOM.detBranch.textContent = g.branch || '—';

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
    const materials = (g.materials && g.materials.length > 0) ? g.materials : [];

    if (materials.length === 0) {
      DOM.inspectorMaterialsList.innerHTML = `
        <div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">
          No materials assigned to this garment.
        </div>
      `;
    } else {
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
  }

  // Pane 3: Silhouette Specs & Anatomical Measurements
  if (DOM.inspectorMeasurementsList) {
    const measurements = (g.measurements && g.measurements.length > 0) ? g.measurements : [];

    if (measurements.length === 0) {
      DOM.inspectorMeasurementsList.innerHTML = `
        <div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">
          No custom specifications or measurements recorded.
        </div>
      `;
    } else {
      DOM.inspectorMeasurementsList.innerHTML = measurements.map(item => `
        <div class="spec-measure-card">
          <span class="spec-measure-label">${escapeHTML(item.label)}</span>
          <span class="spec-measure-value">${escapeHTML(item.value)}</span>
        </div>
      `).join('');
    }
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

// ─── View Garment 360° Dossier Navigation ─────────────────────────────────
window.viewGarmentDetails = function() {
  const g = state.selectedGarment || (state.garments && state.garments[0]);
  if (!g || !g.id) {
    showToast('Please select a garment from the catalog first', 'info');
    return;
  }
  const code = g.garmentCode || g.code || '';
  const id = g.id;
  const params = new URLSearchParams();
  if (id) params.set('id', id);
  if (code) params.set('code', code);
  window.location.href = `garment360/garment360.html?${params.toString()}`;
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
  if (DOM.filterDesigner) DOM.filterDesigner.value = 'all';
  if (DOM.filterBranch) DOM.filterBranch.value = 'all';

  state.searchQuery = '';
  state.filters = {
    garmentType: 'all',
    collection: 'all',
    fabric: 'all',
    status: 'all',
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
  const headers = ['Garment Code', 'Title', 'Silhouette Type', 'Collection', 'Design Blueprint', 'Primary Fabric', 'Embroidery Craft', 'Color', 'Crafting Hours', 'Lead Artisan', 'Branch', 'Status'];
  const rows = state.garments.map(g => [
    `"${g.garmentCode || ''}"`,
    `"${g.title || ''}"`,
    `"${g.garmentType || ''}"`,
    `"${g.collectionName || ''}"`,
    `"${g.designCode || ''}"`,
    `"${g.primaryFabric || ''}"`,
    `"${g.embroideryType || ''}"`,
    `"${g.colorName || ''}"`,
    `"${g.craftingHours || ''}"`,
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
