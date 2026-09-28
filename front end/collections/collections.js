/**
 * HAULO BOUTIQUE ERP — Collections Module Controller
 * collections.js — Rebuilt to match the reference visual design exactly
 * Real Database Integration via api.js
 */

import api, { Auth } from '../api.js';

// ─── Module State ──────────────────────────────────────────────────────────
const state = {
  collections: [],
  selectedCollection: null,
  editingCollectionId: null,
  activeTab: 'overview',
  filterMode: 'active', // 'active' or 'archived'
  viewMode: 'grid',     // 'grid' or 'list'
  searchQuery: '',
  filtersLoaded: false,
  filters: {
    season: 'all',
    year: 'all',
    status: 'all',
    designer: 'all',
    branch: 'all',
  },
  loading: false,
};

// ─── DOM Elements Cache ───────────────────────────────────────────────────
let DOM = {};

function cacheDOM() {
  DOM = {
    // Header
    tabModeCollections: document.getElementById('tabModeCollections'),
    tabModeArchived: document.getElementById('tabModeArchived'),
    moreDropdownMenu: document.getElementById('moreDropdownMenu'),

    // KPIs
    valTotalCollections: document.getElementById('valTotalCollections'),
    // deltaTotalCollections / deltaActiveCollections removed — DEAD-2: cached but never written
    valActiveCollections: document.getElementById('valActiveCollections'),
    valCurrentSeason: document.getElementById('valCurrentSeason'),
    subCurrentSeason: document.getElementById('subCurrentSeason'),
    valTotalGarments: document.getElementById('valTotalGarments'),
    valTotalDesigns: document.getElementById('valTotalDesigns'),
    valDraftCollections: document.getElementById('valDraftCollections'),

    // Workspace Left
    featuredLargeCard: document.getElementById('featuredLargeCard'),
    featuredSubgrid: document.getElementById('featuredSubgrid'),
    allCollectionsCountHeading: document.getElementById('allCollectionsCountHeading'),
    collectionsGrid: document.getElementById('collectionsGrid'),
    collectionsEmptyState: document.getElementById('collectionsEmptyState'),
    inputCollectionSearch: document.getElementById('inputCollectionSearch'),
    filterSeason: document.getElementById('filterSeason'),
    filterYear: document.getElementById('filterYear'),
    filterStatus: document.getElementById('filterStatus'),
    filterDesigner: document.getElementById('filterDesigner'),
    filterBranch: document.getElementById('filterBranch'),
    btnResetFilters: document.getElementById('btnResetFilters'),
    btnViewGrid: document.getElementById('btnViewGrid'),
    btnViewList: document.getElementById('btnViewList'),

    // Workspace Right (Inspector)
    workspaceRightPanel: document.getElementById('workspaceRightPanel'),
    inspectorHero: document.getElementById('inspectorHero'),
    inspectorHeroTitle: document.getElementById('inspectorHeroTitle'),
    inspectorHeroSubtitle: document.getElementById('inspectorHeroSubtitle'),
    inspectorHeroBadge: document.getElementById('inspectorHeroBadge'),

    // Inspector Overview Pane
    detCode: document.getElementById('detCode'),
    detSeason: document.getElementById('detSeason'),
    detLaunchDate: document.getElementById('detLaunchDate'),
    detDeadlineVal: document.getElementById('detDeadlineVal'),
    detDaysRemaining: document.getElementById('detDaysRemaining'),
    detDesigner: document.getElementById('detDesigner'),
    detBranch: document.getElementById('detBranch'),
    detCreatedOn: document.getElementById('detCreatedOn'),
    detStatusBadge: document.getElementById('detStatusBadge'),
    statGarmentsNum: document.getElementById('statGarmentsNum'),
    statDesignsNum: document.getElementById('statDesignsNum'),
    statFabricsNum: document.getElementById('statFabricsNum'),
    statEstValueNum: document.getElementById('statEstValueNum'),
    ringOverallFill: document.getElementById('ringOverallFill'),
    ringOverallPct: document.getElementById('ringOverallPct'),
    progDesignVal: document.getElementById('progDesignVal'),
    progMaterialsVal: document.getElementById('progMaterialsVal'),
    progProductionVal: document.getElementById('progProductionVal'),
    progQcVal: document.getElementById('progQcVal'),
    compositionBars: document.getElementById('compositionBars'),
    prodDoughnutSvg: document.getElementById('prodDoughnutSvg'),
    doughnutCenterNum: document.getElementById('doughnutCenterNum'),
    prodLegendList: document.getElementById('prodLegendList'),
    keyFabricsTitle: document.getElementById('keyFabricsTitle'),
    keyFabricsGrid: document.getElementById('keyFabricsGrid'),
    recentActivityList: document.getElementById('recentActivityList'),

    heroStatGarments: document.getElementById('heroStatGarments'),
    heroStatDesigns: document.getElementById('heroStatDesigns'),
    heroStatLaunch: document.getElementById('heroStatLaunch'),

    // Inspector Other Panes
    tabDesignsList: document.getElementById('tabDesignsList'),
    designsTabBadge: document.getElementById('designsTabBadge'),
    tabGarmentsList: document.getElementById('tabGarmentsList'),
    garmentsTabBadge: document.getElementById('garmentsTabBadge'),
    tabFabricsList: document.getElementById('tabFabricsList'),
    fabricsTabBadge: document.getElementById('fabricsTabBadge'),
    tabMoodboardGallery: document.getElementById('tabMoodboardGallery'),
    tabActivityTimeline: document.getElementById('tabActivityTimeline'),

    // Modals
    modalNewCollection: document.getElementById('modalNewCollection'),
    modalEditCollection: document.getElementById('modalEditCollection'),
    toastContainer: document.getElementById('toastContainer'),
  };
}

// ─── Initialization ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  cacheDOM();

  // Ensure authenticated session
  if (!Auth.isLoggedIn()) {
    try {
      const authRes = await api.auth.login('admin', 'Admin@123');
      if (authRes && authRes.token) {
        Auth.setToken(authRes.token, true);
        Auth.setUser({
          userId: authRes.userId,
          username: authRes.username,
          fullName: authRes.fullName,
          role: authRes.role
        });
      }
    } catch (e) {
      console.warn('Could not auto-login with master admin:', e);
    }
  }

  // Close more menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.more-menu-wrapper')) {
      if (DOM.moreDropdownMenu) DOM.moreDropdownMenu.classList.remove('show');
    }
  });

  // Re-render Lucide icons
  if (window.lucide) window.lucide.createIcons();

  // Load live data from PostgreSQL database via api client
  await loadCollectionsData();
});

// ─── Dynamic Filter Options from Database ─────────────────────────────────
async function populateDynamicFilters(collections) {
  const seasons = new Set();
  const years = new Set();
  const designers = new Set();
  const branches = new Set();

  (collections || []).forEach(c => {
    if (c.season && c.season.trim()) seasons.add(c.season.trim());
    if (c.year) years.add(Number(c.year)); // BUG-3: normalise to Number so Set.has(Number(val)) works correctly
    if (c.designer && c.designer.trim()) designers.add(c.designer.trim());
    if (c.branch && c.branch.trim()) branches.add(c.branch.trim());
  });

  // BUG-4: removed outer try/catch(_){} that silently swallowed all errors
  const emps = await api.employees.list().catch(() => []);
  emps.forEach(e => {
    const name = e.fullName || e.name;
    if (name && name.trim()) designers.add(name.trim());
    if (e.branch && e.branch.trim()) branches.add(e.branch.trim());
  });

  // 1. Season Filter & Datalist
  if (DOM.filterSeason) {
    const currentVal = DOM.filterSeason.value || 'all';
    DOM.filterSeason.innerHTML = '<option value="all">Season: All</option>' +
      Array.from(seasons).sort().map(s => `<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join('');
    DOM.filterSeason.value = seasons.has(currentVal) ? currentVal : 'all';
  }

  const seasonsDatalist = document.getElementById('seasonsDatalist');
  if (seasonsDatalist) {
    seasonsDatalist.innerHTML = Array.from(seasons).sort().map(s => `<option value="${escapeHTML(s)}"></option>`).join('');
  }

  // 2. Year Filter
  if (DOM.filterYear) {
    const currentVal = DOM.filterYear.value || 'all';
    DOM.filterYear.innerHTML = '<option value="all">Year: All</option>' +
      Array.from(years).sort((a, b) => b - a).map(y => `<option value="${y}">${y}</option>`).join('');
    DOM.filterYear.value = years.has(Number(currentVal)) ? currentVal : 'all';
  }

  // 3. Designer Filter & Modals
  if (DOM.filterDesigner) {
    const currentVal = DOM.filterDesigner.value || 'all';
    DOM.filterDesigner.innerHTML = '<option value="all">Designer: All</option>' +
      Array.from(designers).sort().map(d => `<option value="${escapeHTML(d)}">${escapeHTML(d)}</option>`).join('');
    DOM.filterDesigner.value = designers.has(currentVal) ? currentVal : 'all';
  }

  const newColDesigner = document.getElementById('newColDesigner');
  if (newColDesigner) {
    const cur = newColDesigner.value;
    newColDesigner.innerHTML = '<option value="">Select Designer...</option>' +
      Array.from(designers).sort().map(d => `<option value="${escapeHTML(d)}">${escapeHTML(d)}</option>`).join('');
    if (cur) newColDesigner.value = cur;
  }

  const editColDesigner = document.getElementById('editColDesigner');
  if (editColDesigner) {
    const cur = editColDesigner.value;
    editColDesigner.innerHTML = '<option value="">Select Designer...</option>' +
      Array.from(designers).sort().map(d => `<option value="${escapeHTML(d)}">${escapeHTML(d)}</option>`).join('');
    if (cur) editColDesigner.value = cur;
  }

  // 4. Branch Filter
  if (DOM.filterBranch) {
    const currentVal = DOM.filterBranch.value || 'all';
    DOM.filterBranch.innerHTML = '<option value="all">Branch: All</option>' +
      Array.from(branches).sort().map(b => `<option value="${escapeHTML(b)}">${escapeHTML(b)}</option>`).join('');
    DOM.filterBranch.value = branches.has(currentVal) ? currentVal : 'all';
  }
}

// ─── Reset Filters ────────────────────────────────────────────────────────
export function resetFilters() {
  state.searchQuery = '';
  state.filters = {
    season: 'all',
    year: 'all',
    status: 'all',
    designer: 'all',
    branch: 'all',
  };
  if (DOM.inputCollectionSearch) DOM.inputCollectionSearch.value = '';
  if (DOM.filterSeason) DOM.filterSeason.value = 'all';
  if (DOM.filterYear) DOM.filterYear.value = 'all';
  if (DOM.filterStatus) DOM.filterStatus.value = 'all';
  if (DOM.filterDesigner) DOM.filterDesigner.value = 'all';
  if (DOM.filterBranch) DOM.filterBranch.value = 'all';
  loadCollectionsData();
}
window.resetFilters = resetFilters;

// ─── Load Collections & KPIs from Database ─────────────────────────────────
async function loadCollectionsData() {
  state.loading = true;
  try {
    // 1. Fetch KPIs
    const kpis = await api.collections.kpis().catch(() => null);
    if (kpis) {
      renderKPIs(kpis);
    } else {
      renderKPIs({ totalCollections: 0, activeCollections: 0, currentSeasonCount: 0, currentSeasonName: '—', totalGarments: 0, totalDesigns: 0, draftCollections: 0 });
    }

    // 2. Populate dynamic dropdown choices from DB once or after modifications
    if (!state.filtersLoaded) {
      const allCols = await api.collections.list({}).catch(() => []);
      await populateDynamicFilters(allCols);
      state.filtersLoaded = true;
    }

    // 3. Fetch Collections list with active mode
    const isArchived = state.filterMode === 'archived';
    const params = {
      archived: isArchived
    };
    if (state.searchQuery && state.searchQuery.trim()) {
      params.search = state.searchQuery.trim();
    }
    if (state.filters.season && state.filters.season !== 'all') {
      params.season = state.filters.season;
    }
    if (state.filters.year && state.filters.year !== 'all') {
      params.year = state.filters.year;
    }
    if (state.filters.status && state.filters.status !== 'all') {
      params.status = state.filters.status;
    }
    if (state.filters.designer && state.filters.designer !== 'all') {
      params.designer = state.filters.designer;
    }
    if (state.filters.branch && state.filters.branch !== 'all') {
      params.branch = state.filters.branch;
    }

    const collections = await api.collections.list(params).catch(() => []);

    state.collections = collections || [];

    if (state.collections.length === 0) {
      state.selectedCollection = null;
    } else {
      state.collections.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
      if (!state.selectedCollection) {
        const featured = state.collections.find(c => c.isFeatured) || state.collections[0];
        state.selectedCollection = featured;
      } else {
        const refreshed = state.collections.find(c => c.id === state.selectedCollection.id || (c.name || '').toLowerCase() === (state.selectedCollection.name || '').toLowerCase());
        state.selectedCollection = refreshed || state.collections[0];
      }
    }

    // Fetch live detail breakdown for selected collection
    if (state.selectedCollection && state.selectedCollection.id) {
      try {
        const detail = await api.collections.getById(state.selectedCollection.id);
        if (detail) {
          state.selectedCollection = { ...state.selectedCollection, ...detail };
        }
      } catch (e) {
        console.warn('Could not load detailed collection breakdown:', e);
      }
    }

    // 4. Render Views
    renderFeaturedSection();
    renderAllCollectionsGrid();
    renderInspectorDetails();

  } catch (err) {
    console.error('Error loading collections:', err);
    state.collections = [];
    state.selectedCollection = null;
    renderKPIs({ totalCollections: 0, activeCollections: 0, currentSeasonCount: 0, currentSeasonName: '—', totalGarments: 0, totalDesigns: 0, draftCollections: 0 });
    renderFeaturedSection();
    renderAllCollectionsGrid();
    renderInspectorDetails();
  } finally {
    state.loading = false;
    if (window.lucide) window.lucide.createIcons();
  }
}

// ─── Render Dashboard KPI Cards ────────────────────────────────────────────
function renderKPIs(kpis) {
  if (!kpis) return;
  if (DOM.valTotalCollections) DOM.valTotalCollections.textContent = kpis.totalCollections ?? 0;
  if (DOM.valActiveCollections) DOM.valActiveCollections.textContent = kpis.activeCollections ?? 0;
  if (DOM.valCurrentSeason) DOM.valCurrentSeason.textContent = kpis.currentSeasonCount ?? 0;
  if (DOM.subCurrentSeason) DOM.subCurrentSeason.textContent = kpis.currentSeasonName || '—';
  if (DOM.valTotalGarments) DOM.valTotalGarments.textContent = kpis.totalGarments ?? 0;
  if (DOM.valTotalDesigns) DOM.valTotalDesigns.textContent = kpis.totalDesigns ?? 0;
  if (DOM.valDraftCollections) DOM.valDraftCollections.textContent = kpis.draftCollections ?? 0;
}

// ─── Render Featured Collections Section ──────────────────────────────────
function renderFeaturedSection() {
  if (!state.collections || state.collections.length === 0) {
    if (DOM.featuredLargeCard) DOM.featuredLargeCard.style.display = 'none';
    if (DOM.featuredSubgrid) DOM.featuredSubgrid.style.display = 'none';
    return;
  }

  if (DOM.featuredLargeCard) DOM.featuredLargeCard.style.display = 'flex';
  if (DOM.featuredSubgrid) DOM.featuredSubgrid.style.display = 'grid';

  const featuredList = state.collections.filter(c => c.isFeatured);
  const items = featuredList.length >= 5 ? featuredList : state.collections;
  if (!items || items.length === 0) return;

  const largeItem = items[0];
  const smallItems = items.slice(1, 5);

  // 1. Render Large Featured Card
  if (DOM.featuredLargeCard && largeItem) {
    const isSelected = state.selectedCollection && (state.selectedCollection.name || '').toLowerCase() === (largeItem.name || '').toLowerCase();
    DOM.featuredLargeCard.className = `featured-large-card featured-hero-card ${isSelected ? 'selected' : ''}`;
    DOM.featuredLargeCard.style.backgroundImage = largeItem.coverImageUrl ? `url('${encodeURI(largeItem.coverImageUrl)}')` : 'none';
    DOM.featuredLargeCard.onclick = () => selectCollection(largeItem.name);

    DOM.featuredLargeCard.innerHTML = `
      <div class="featured-large-content">
        <h3 class="featured-large-title">${escapeHTML(largeItem.name)}</h3>
        <p class="featured-large-subtitle">${escapeHTML(largeItem.subtitle || '')}</p>
        <p class="featured-large-desc">${escapeHTML(largeItem.description || '')}</p>
        <div style="margin-bottom:12px;">
          <span class="badge-status ${getBadgeClass(largeItem.status)}">${escapeHTML(largeItem.status || 'Active')}</span>
        </div>
        <div class="featured-large-footer">
          <div class="featured-metrics">
            <div class="featured-metric-item">
              <span class="featured-metric-num">${largeItem.garmentsCount ?? 0}</span>
              <span class="featured-metric-lbl">Garments</span>
            </div>
            <div class="featured-metric-item">
              <span class="featured-metric-num">${largeItem.designsCount ?? 0}</span>
              <span class="featured-metric-lbl">Designs</span>
            </div>
            <div class="featured-metric-item">
              <span class="featured-metric-num">${largeItem.fabricsCount ?? 0}</span>
              <span class="featured-metric-lbl">Fabrics</span>
            </div>
          </div>
          <div class="featured-arrow-btn">
            <i data-lucide="arrow-right" style="width:15px;height:15px;"></i>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Render 2x2 Subgrid of Smaller Cards
  if (DOM.featuredSubgrid) {
    DOM.featuredSubgrid.innerHTML = smallItems.map(item => {
      const isSelected = state.selectedCollection && (state.selectedCollection.name || '').toLowerCase() === (item.name || '').toLowerCase();
      const thumbBg = item.coverImageUrl ? `background-image: url('${encodeURI(item.coverImageUrl)}');` : 'background-color: #20211e;';
      return `
        <div class="featured-small-card featured-sub-card ${isSelected ? 'selected' : ''}"
             onclick="window.selectCollection('${escapeHTML(item.name)}')">
          <div class="featured-small-thumb featured-sub-thumb" style="${thumbBg}"></div>
          <div class="featured-small-content featured-sub-body">
            <div>
              <h4 class="featured-small-title featured-sub-title">${escapeHTML(item.name)}</h4>
              <div class="featured-small-sub featured-sub-tagline">${escapeHTML(item.subtitle || '')}</div>
            </div>
            <div class="featured-small-count featured-sub-count">${item.garmentsCount ?? 0} Garments</div>
          </div>
        </div>
      `;
    }).join('');
  }
}



// ─── Render All Collections Grid ───────────────────────────────────────────
function renderAllCollectionsGrid() {
  const count = state.collections.length;
  if (DOM.allCollectionsCountHeading) {
    DOM.allCollectionsCountHeading.textContent = `All Collections (${count})`;
  }

  if (count === 0) {
    if (DOM.collectionsGrid) DOM.collectionsGrid.style.display = 'none';
    if (DOM.collectionsEmptyState) DOM.collectionsEmptyState.style.display = 'flex';
    return;
  }

  if (DOM.collectionsEmptyState) DOM.collectionsEmptyState.style.display = 'none';
  if (DOM.collectionsGrid) DOM.collectionsGrid.style.display = state.viewMode === 'grid' ? 'grid' : 'flex';

  if (state.viewMode === 'list') {
    renderListView();
    return;
  }

  DOM.collectionsGrid.className = 'collections-grid-view';
  DOM.collectionsGrid.innerHTML = state.collections.map(col => {
    const isSelected = state.selectedCollection && (state.selectedCollection.name || '').toLowerCase() === (col.name || '').toLowerCase(); // BUG-2: null guard

    // Dynamic thumbnails extracted from PostgreSQL database records & designs
    let thumbs = Array.isArray(col.thumbnails) && col.thumbnails.length > 0 ? col.thumbnails : [];
    if (thumbs.length === 0 && col.coverImageUrl) {
      thumbs = [col.coverImageUrl];
    }
    const displayThumbs = [...thumbs];
    while (displayThumbs.length < 4 && thumbs.length > 0) {
      displayThumbs.push(thumbs[displayThumbs.length % thumbs.length]);
    }

    const progressPct = col.progressPercentage !== undefined && col.progressPercentage !== null ? col.progressPercentage : 0;

    return `
      <div class="collection-card ${isSelected ? 'selected' : ''}" onclick="window.selectCollection('${escapeHTML(col.name)}')">
        <div class="collection-card-header">
          <div class="collection-card-header-left">
            <h3 class="collection-card-title">${escapeHTML(col.name)}</h3>
            <p class="collection-card-sub">${escapeHTML(col.subtitle || '')}</p>
          </div>
          <button type="button" class="collection-card-more-btn" title="Actions" onclick="event.stopPropagation(); window.openEditCollectionModal('${escapeHTML(col.id)}')">
            <i data-lucide="more-vertical" style="width:14px;height:14px;"></i>
          </button>
        </div>

        <div class="collection-card-thumbs">
          ${displayThumbs.length > 0 ? displayThumbs.slice(0, 4).map(t => `
            <div class="thumb-crop">
              <img src="${t}" alt="${escapeHTML(col.name)}" onerror="this.style.opacity='0'" />
            </div>
          `).join('') : `
            <div class="thumb-crop empty-thumb" style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; background: #1c1d1a; color: var(--text-muted); font-size: 11px;">
              <span>No Images</span>
            </div>
          `}
        </div>

        <div class="collection-card-counts">
          <span>${col.garmentsCount ?? 0}</span> Garments &nbsp;&bull;&nbsp;
          <span>${col.designsCount ?? 0}</span> Designs &nbsp;&bull;&nbsp;
          <span>${col.fabricsCount ?? 0}</span> Fabrics
        </div>

        <div class="collection-card-footer">
          <span class="badge-status ${getBadgeClass(col.status)}">${escapeHTML(col.status || 'Active')}</span>
          <div class="card-mini-progress">
            <div class="card-progress-track">
              <div class="card-progress-fill" style="width: ${progressPct}%;"></div>
            </div>
            <span class="card-progress-pct">${progressPct}%</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderListView() {
  DOM.collectionsGrid.className = 'collections-list-view';
  DOM.collectionsGrid.innerHTML = state.collections.map(col => {
    const isSelected = state.selectedCollection && (state.selectedCollection.name || '').toLowerCase() === (col.name || '').toLowerCase(); // BUG-2: null guard
    return `
      <div class="collection-list-row ${isSelected ? 'selected' : ''}" onclick="window.selectCollection('${escapeHTML(col.name)}')">
        <div style="display:flex;align-items:center;gap:14px;">
          ${col.coverImageUrl ? `
            <img src="${col.coverImageUrl}" style="width:48px;height:48px;border-radius:6px;object-fit:cover;" onerror="this.style.display='none'" />
          ` : `
            <div style="width:48px;height:48px;border-radius:6px;background:#20211e;display:flex;align-items:center;justify-content:center;color:var(--text-muted);border:1px solid var(--border-subtle);">
              <i data-lucide="folder" style="width:20px;height:20px;"></i>
            </div>
          `}
          <div>
            <h4 style="margin:0;font-size:14px;color:#fff;font-family:var(--font-serif);">${escapeHTML(col.name)}</h4>
            <span style="font-size:11.5px;color:var(--text-muted);">${escapeHTML(col.subtitle || '')} &bull; ${escapeHTML(col.code || '')}</span>
          </div>
        </div>
        <div style="font-size:12px;color:var(--text-muted);">
          <strong style="color:#fff;">${col.garmentsCount ?? 0}</strong> Garments &nbsp;|&nbsp;
          <strong style="color:#fff;">${col.designsCount ?? 0}</strong> Designs &nbsp;|&nbsp;
          <strong style="color:#fff;">${col.fabricsCount ?? 0}</strong> Fabrics
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="badge-status ${getBadgeClass(col.status)}">${escapeHTML(col.status || 'Active')}</span>
          <span style="font-size:12px;color:#fff;font-weight:600;">${col.stats?.formattedValue || col.estimatedValue || '₹0'}</span>
          <div class="card-arrow-circle">
            <i data-lucide="arrow-right" style="width:13px;height:13px;"></i>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Render Collection Details Inspector (Right Column) ───────────────────
function renderEmptyInspectorDetails() {
  // 1. Hero Header
  if (DOM.inspectorHero) {
    DOM.inspectorHero.style.backgroundImage = 'none';
  }
  if (DOM.inspectorHeroTitle) DOM.inspectorHeroTitle.textContent = '—';
  if (DOM.inspectorHeroSubtitle) DOM.inspectorHeroSubtitle.textContent = 'No collection selected';
  if (DOM.inspectorHeroBadge) DOM.inspectorHeroBadge.style.display = 'none';
  if (DOM.heroStatGarments) DOM.heroStatGarments.textContent = '0 Garments';
  if (DOM.heroStatDesigns) DOM.heroStatDesigns.textContent = '0 Designs';
  if (DOM.heroStatLaunch) DOM.heroStatLaunch.textContent = '—';

  // 2. Collection Details & Timeline
  if (DOM.detCode) DOM.detCode.textContent = '—';
  if (DOM.detSeason) DOM.detSeason.textContent = '—';
  if (DOM.detDesigner) DOM.detDesigner.textContent = '—';
  if (DOM.detBranch) DOM.detBranch.textContent = '—';
  if (DOM.detCreatedOn) DOM.detCreatedOn.textContent = '—';
  if (DOM.detStatusBadge) DOM.detStatusBadge.style.display = 'none';

  if (DOM.detLaunchDate) DOM.detLaunchDate.textContent = '—';
  if (DOM.detDeadlineVal) DOM.detDeadlineVal.textContent = '—';
  if (DOM.detDaysRemaining) DOM.detDaysRemaining.style.display = 'none';

  // 3. Collection Snapshot Triad
  if (DOM.statGarmentsNum) DOM.statGarmentsNum.textContent = '0';
  if (DOM.statDesignsNum) DOM.statDesignsNum.textContent = '0';
  if (DOM.statFabricsNum) DOM.statFabricsNum.textContent = '0';
  if (DOM.statEstValueNum) DOM.statEstValueNum.textContent = '₹0';

  // 4. Collection Progress Ring & Breakdown
  if (DOM.ringOverallPct) DOM.ringOverallPct.textContent = '0%';
  if (DOM.ringOverallFill) {
    const circ = 2 * Math.PI * 40; // ~251.327
    DOM.ringOverallFill.style.strokeDasharray = `${circ}`;
    DOM.ringOverallFill.style.strokeDashoffset = `${circ}`;
  }
  if (DOM.progDesignVal) DOM.progDesignVal.textContent = '0%';
  if (DOM.progMaterialsVal) DOM.progMaterialsVal.textContent = '0%';
  if (DOM.progProductionVal) DOM.progProductionVal.textContent = '0%';
  if (DOM.progQcVal) DOM.progQcVal.textContent = '0%';

  // 5. Garment Composition
  if (DOM.compositionBars) {
    DOM.compositionBars.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:8px 0;">No garments recorded in this collection yet.</div>';
  }

  // 6. Production Status
  if (DOM.doughnutCenterNum) DOM.doughnutCenterNum.textContent = '0';
  if (DOM.prodLegendList) {
    DOM.prodLegendList.innerHTML = '<div style="color:var(--text-muted);font-size:11.5px;padding:6px 0;">No active production orders</div>';
  }
  if (DOM.prodDoughnutSvg) {
    DOM.prodDoughnutSvg.innerHTML = '<circle cx="60" cy="60" r="45" fill="none" stroke="#2a2c28" stroke-width="12" />';
  }

  // 7. Key Fabrics
  if (DOM.keyFabricsTitle) DOM.keyFabricsTitle.textContent = 'Key Fabrics (0)';
  if (DOM.keyFabricsGrid) {
    DOM.keyFabricsGrid.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:8px 0;grid-column:1/-1;">No key fabrics recorded for this collection.</div>';
  }

  // 8. Recent Activity
  if (DOM.recentActivityList) {
    DOM.recentActivityList.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:8px 0;">No recent activities logged for this collection.</div>';
  }

  // 9. Secondary Tabs
  if (DOM.designsTabBadge) DOM.designsTabBadge.textContent = '0 Designs';
  if (DOM.tabDesignsList) DOM.tabDesignsList.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px;">No individual designs registered under this collection yet.</div>';

  if (DOM.garmentsTabBadge) DOM.garmentsTabBadge.textContent = '0 Garments';
  if (DOM.tabGarmentsList) DOM.tabGarmentsList.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px;">No client orders currently logged under this collection.</div>';

  if (DOM.fabricsTabBadge) DOM.fabricsTabBadge.textContent = '0 Fabrics';
  if (DOM.tabFabricsList) DOM.tabFabricsList.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px;">No fabrics allocated to this collection yet.</div>';

  if (DOM.tabMoodboardGallery) DOM.tabMoodboardGallery.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px;">No moodboard images uploaded.</div>';
  if (DOM.tabActivityTimeline) DOM.tabActivityTimeline.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px;">No activity logs found.</div>';
}

function renderInspectorDetails() {
  const col = state.selectedCollection;
  if (!col) {
    renderEmptyInspectorDetails();
    return;
  }

  // 1. Hero Header
  if (DOM.inspectorHero) {
    DOM.inspectorHero.style.backgroundImage = col.coverImageUrl ? `url('${col.coverImageUrl}')` : 'none';
  }
  if (DOM.inspectorHeroTitle) DOM.inspectorHeroTitle.textContent = col.name || '—';
  if (DOM.inspectorHeroSubtitle) DOM.inspectorHeroSubtitle.textContent = col.subtitle || '';
  if (DOM.inspectorHeroBadge) {
    if (col.status) {
      DOM.inspectorHeroBadge.style.display = '';
      DOM.inspectorHeroBadge.textContent = col.status;
      DOM.inspectorHeroBadge.className = `badge-status ${getBadgeClass(col.status)}`;
    } else {
      DOM.inspectorHeroBadge.style.display = 'none';
    }
  }

  // 2. Collection Details & Timeline
  if (DOM.detCode) DOM.detCode.textContent = col.code || '—';
  if (DOM.detSeason) DOM.detSeason.textContent = col.season || '—';
  if (DOM.detLaunchDate) DOM.detLaunchDate.textContent = col.launchDate ? formatShortDate(col.launchDate) : '—';
  if (DOM.detDeadlineVal) DOM.detDeadlineVal.textContent = col.productionDeadline ? formatShortDate(col.productionDeadline) : '—';
  if (DOM.detDaysRemaining) {
    const rem = col.daysRemaining;
    if (rem !== undefined && rem !== null) {
      DOM.detDaysRemaining.style.display = '';
      DOM.detDaysRemaining.textContent = `${rem} days remaining`;
    } else {
      DOM.detDaysRemaining.style.display = 'none';
    }
  }
  if (DOM.detDesigner) DOM.detDesigner.textContent = col.designer || '—';
  if (DOM.detBranch) DOM.detBranch.textContent = col.branch || '—';
  const createdDate = col.createdAt ? formatShortDate(col.createdAt) : (col.createdOn ? formatShortDate(col.createdOn) : '—');
  if (DOM.detCreatedOn) DOM.detCreatedOn.textContent = createdDate;
  if (DOM.detStatusBadge) {
    if (col.status) {
      DOM.detStatusBadge.style.display = '';
      DOM.detStatusBadge.textContent = col.status;
      DOM.detStatusBadge.className = `badge-status ${getBadgeClass(col.status)}`;
    } else {
      DOM.detStatusBadge.style.display = 'none';
    }
  }

  // 3. Collection Snapshot Triad
  const stats = col.stats;
  if (DOM.statGarmentsNum) DOM.statGarmentsNum.textContent = stats?.garmentsCount ?? col.garmentsCount ?? 0;
  if (DOM.statDesignsNum) DOM.statDesignsNum.textContent = stats?.designsCount ?? col.designsCount ?? 0;
  if (DOM.statFabricsNum) DOM.statFabricsNum.textContent = stats?.fabricsCount ?? col.fabricsCount ?? 0;
  if (DOM.statEstValueNum) DOM.statEstValueNum.textContent = stats?.formattedValue || col.estimatedValue || '₹0';

  // 4. Collection Progress Ring & Breakdown
  const overallPct = col.progressPercentage !== undefined && col.progressPercentage !== null ? col.progressPercentage : 0;
  if (DOM.ringOverallPct) DOM.ringOverallPct.textContent = `${overallPct}%`;
  if (DOM.ringOverallFill) {
    const radius = 40;
    const circ = 2 * Math.PI * radius; // ~251.327
    const offset = circ - (overallPct / 100) * circ;
    DOM.ringOverallFill.style.strokeDasharray = `${circ}`;
    DOM.ringOverallFill.style.strokeDashoffset = `${offset}`;
  }
  if (DOM.progDesignVal) DOM.progDesignVal.textContent = `${col.designProgress ?? 0}%`;
  if (DOM.progMaterialsVal) DOM.progMaterialsVal.textContent = `${col.materialsProgress ?? 0}%`;
  if (DOM.progProductionVal) DOM.progProductionVal.textContent = `${col.productionProgress ?? 0}%`;
  if (DOM.progQcVal) DOM.progQcVal.textContent = `${col.qcProgress ?? 0}%`;

  // 4. Garment Composition Progress Bars
  if (DOM.compositionBars) {
    const bars = col.garmentComposition || [];
    if (bars.length === 0) {
      DOM.compositionBars.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:8px 0;">No garments recorded in this collection yet.</div>';
    } else {
      const maxVal = Math.max(...bars.map(b => b.count), 1);
      DOM.compositionBars.innerHTML = bars.map(b => {
        const pct = Math.round((b.count / maxVal) * 100);
        return `
          <div class="comp-row">
            <span class="comp-label">${escapeHTML(b.category)}</span>
            <div class="comp-bar-track">
              <div class="comp-bar-fill" style="width:${pct}%;background-color:${b.color};"></div>
            </div>
            <span class="comp-count">${b.count}</span>
          </div>
        `;
      }).join('');
    }
  }

  // 5. Production Status (Doughnut Chart + Legend)
  renderProductionStatusDoughnut(col);

  // Update stats line in hero
  if (DOM.heroStatGarments) DOM.heroStatGarments.textContent = `${stats?.garmentsCount ?? col.garmentsCount ?? 0} Garments`;
  if (DOM.heroStatDesigns) DOM.heroStatDesigns.textContent = `${stats?.designsCount ?? col.designsCount ?? 0} Designs`;
  if (DOM.heroStatLaunch) DOM.heroStatLaunch.textContent = col.launchDate ? `Launches ${formatShortDate(col.launchDate)}` : 'Active Collection';

  // 6. Key Fabrics Row (Populated dynamically from database inventory & designs)
  const rawFabrics = Array.isArray(col.keyFabrics) ? col.keyFabrics : [];
  if (DOM.keyFabricsTitle) {
    DOM.keyFabricsTitle.textContent = `Key Fabrics (${rawFabrics.length})`;
  }
  if (DOM.keyFabricsGrid) {
    if (rawFabrics.length === 0) {
      DOM.keyFabricsGrid.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:8px 0;grid-column:1/-1;">No key fabrics recorded for this collection.</div>';
    } else {
      DOM.keyFabricsGrid.innerHTML = rawFabrics.slice(0, 5).map(f => {
        const fname = f.name || 'Fabric';
        const fmeters = f.meters !== undefined && f.meters !== null ? `${f.meters}m` : '';
        const fimg = f.imageUrl;
        return `
          <div class="fabric-thumb-card" onclick="window.switchInspectorTab('fabrics')">
            <div class="fabric-img-wrap">
              ${fimg ? `<img src="${fimg}" alt="${escapeHTML(fname)}" onerror="this.style.display='none'" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#20211e;"><i data-lucide="layers" style="width:16px;height:16px;color:var(--text-muted);"></i></div>`}
            </div>
            <span class="fabric-name">${escapeHTML(fname)}</span>
            <span class="fabric-meters">${escapeHTML(fmeters)}</span>
          </div>
        `;
      }).join('');
    }
  }

  // 7. Recent Activity Timeline (Populated dynamically from collection_activities table)
  if (DOM.recentActivityList) {
    const activities = Array.isArray(col.recentActivity) ? col.recentActivity : [];
    if (activities.length === 0) {
      DOM.recentActivityList.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:8px 0;">No recent activities logged for this collection.</div>';
    } else {
      DOM.recentActivityList.innerHTML = activities.map(a => `
        <div class="timeline-item">
          <div class="timeline-dot" style="background-color:${a.color || '#a855f7'};"></div>
          <div class="timeline-content">
            <span class="timeline-date">${escapeHTML(a.date)}</span>
            <span class="timeline-desc">${escapeHTML(a.description || a.text || '')}</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Render secondary tabs
  renderSecondaryTabs(col);
  if (window.lucide) window.lucide.createIcons();

  // DEAD-3: restore the user's previously selected inspector tab after every re-render
  if (state.activeTab && state.activeTab !== 'overview') {
    switchInspectorTab(state.activeTab);
  }
}

// ─── Production Status SVG Doughnut Chart ──────────────────────────────────
function renderProductionStatusDoughnut(col) {
  let stageList = [];
  if (Array.isArray(col.productionStatus)) {
    stageList = col.productionStatus;
  } else if (col.productionStatus && typeof col.productionStatus === 'object') {
    const stageColors = {
      Designing: '#3b82f6',
      Cutting:   '#f43f5e',
      Stitching: '#8b5cf6',
      Trial:     '#f59e0b',
      QC:        '#14b8a6',
      Ready:     '#22c55e'
    };
    stageList = Object.entries(col.productionStatus).map(([stage, count]) => ({
      stage,
      count,
      color: stageColors[stage] || '#888'
    }));
  }

  const total = stageList.reduce((sum, item) => sum + (item.count || 0), 0);
  if (DOM.doughnutCenterNum) DOM.doughnutCenterNum.textContent = total;

  if (DOM.prodLegendList) {
    if (stageList.length === 0 || total === 0) {
      DOM.prodLegendList.innerHTML = '<div style="color:var(--text-muted);font-size:11.5px;padding:6px 0;">No active production orders</div>';
    } else {
      DOM.prodLegendList.innerHTML = stageList.map(item => `
        <div class="prod-legend-item">
          <div class="prod-legend-left">
            <div class="prod-legend-dot" style="background-color:${item.color || '#888'};"></div>
            <span>${escapeHTML(item.stage)}</span>
          </div>
          <span class="prod-legend-val">${item.count}</span>
        </div>
      `).join('');
    }
  }

  // Draw SVG doughnut segments
  if (DOM.prodDoughnutSvg) {
    if (total === 0) {
      DOM.prodDoughnutSvg.innerHTML = `
        <circle cx="60" cy="60" r="45" fill="none" stroke="#2a2c28" stroke-width="12" />
      `;
    } else {
      const radius = 45;
      const circumference = 2 * Math.PI * radius;
      let accumulatedOffset = 0;

      const segGap = 2; // BUG-5: 2px visual gap between doughnut segments to prevent colour bleed
      const circles = stageList.map(item => {
        const strokeLen = Math.max(0, (item.count / total) * circumference - segGap);
        const strokeGap = circumference - strokeLen;
        const offset = -accumulatedOffset;
        accumulatedOffset += strokeLen + segGap;

        return `
          <circle cx="60" cy="60" r="${radius}"
                  fill="none"
                  stroke="${item.color || '#888'}"
                  stroke-width="12"
                  stroke-dasharray="${strokeLen} ${strokeGap}"
                  stroke-dashoffset="${offset}" />
        `;
      });

      DOM.prodDoughnutSvg.innerHTML = circles.join('');
    }
  }
}

// ─── Secondary Tabs Content (Designs, Garments, Fabrics, Moodboard, Activity)
function renderSecondaryTabs(col) {
  // Designs Tab
  if (DOM.tabDesignsList) {
    const designs = col.designs || [];
    if (DOM.designsTabBadge) DOM.designsTabBadge.textContent = `${designs.length} Designs`;
    if (designs.length === 0) {
      DOM.tabDesignsList.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px;">No individual designs registered under this collection yet.</div>';
    } else {
      DOM.tabDesignsList.innerHTML = designs.map(d => `
        <div style="display:flex;align-items:center;gap:12px;background:#20211e;padding:8px 10px;border-radius:6px;border:1px solid var(--border-subtle);">
          ${d.thumbnailUrl ? `<img src="${d.thumbnailUrl}" style="width:38px;height:38px;border-radius:4px;object-fit:cover;" onerror="this.style.display='none'" />` : `<div style="width:38px;height:38px;border-radius:4px;background:#2a2b27;display:flex;align-items:center;justify-content:center;"><i data-lucide="scissors" style="width:16px;height:16px;color:var(--text-muted);"></i></div>`}
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(d.title)}</div>
            <div style="font-size:10.5px;color:var(--text-muted);">${escapeHTML(d.garmentType || 'Design')} &bull; ${escapeHTML(d.designer || '')}</div>
          </div>
          <span style="font-size:11.5px;font-weight:600;color:var(--lime-accent);">${d.suggestedPrice ? ('₹' + d.suggestedPrice) : '₹0'}</span>
        </div>
      `).join('');
    }
  }

  // Garments Tab
  if (DOM.tabGarmentsList) {
    const orders = col.orders || [];
    if (DOM.garmentsTabBadge) DOM.garmentsTabBadge.textContent = `${orders.length} Garments`;
    if (orders.length === 0) {
      DOM.tabGarmentsList.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px;">No client orders currently logged under this collection.</div>';
    } else {
      DOM.tabGarmentsList.innerHTML = orders.map(o => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#20211e;border-radius:6px;margin-bottom:6px;border:1px solid var(--border-subtle);">
          <div>
            <div style="font-size:12px;font-weight:600;color:#fff;">${escapeHTML(o.orderCode || '')}${o.customerName ? ` &bull; ${escapeHTML(o.customerName)}` : ''}</div>
            <div style="font-size:10.5px;color:var(--text-muted);">${escapeHTML(o.garmentType || '')}</div>
          </div>
          <span class="badge-status ${getBadgeClass(o.status)}">${escapeHTML(o.status || '')}</span>
        </div>
      `).join('');
    }
  }

  // Fabrics Tab
  if (DOM.tabFabricsList) {
    const fabrics = Array.isArray(col.keyFabrics) ? col.keyFabrics : [];
    if (DOM.fabricsTabBadge) DOM.fabricsTabBadge.textContent = `${fabrics.length} Fabrics`;
    if (fabrics.length === 0) {
      DOM.tabFabricsList.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px;">No fabrics allocated to this collection yet.</div>';
    } else {
      DOM.tabFabricsList.innerHTML = fabrics.map(f => {
        const img = f.imageUrl || f.image;
        return `
          <div style="display:flex;align-items:center;gap:12px;padding:8px 10px;background:#20211e;border-radius:6px;margin-bottom:6px;border:1px solid var(--border-subtle);">
            ${img ? `<img src="${img}" style="width:36px;height:36px;border-radius:4px;object-fit:cover;" onerror="this.style.display='none'" />` : `<div style="width:36px;height:36px;border-radius:4px;background:#2a2b27;display:flex;align-items:center;justify-content:center;"><i data-lucide="layers" style="width:16px;height:16px;color:var(--text-muted);"></i></div>`}
            <div style="flex:1;">
              <div style="font-size:12px;font-weight:600;color:#fff;">${escapeHTML(f.name)}</div>
              <div style="font-size:10.5px;color:var(--text-muted);">Stock in Inventory: ${f.meters ?? 0} Meters</div>
            </div>
            <span style="font-size:12px;color:var(--lime-accent);font-weight:600;">${f.meters ?? 0} Meters</span>
          </div>
        `;
      }).join('');
    }
  }

  // Moodboard Tab
  if (DOM.tabMoodboardGallery) {
    const thumbs = Array.isArray(col.thumbnails) && col.thumbnails.length > 0 
      ? col.thumbnails 
      : (col.coverImageUrl ? [col.coverImageUrl] : []);
    if (thumbs.length === 0) {
      DOM.tabMoodboardGallery.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px;">No moodboard images uploaded.</div>';
    } else {
      DOM.tabMoodboardGallery.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:8px;">
          ${thumbs.map(t => `
            <div style="aspect-ratio:3/4;border-radius:6px;overflow:hidden;border:1px solid var(--border-subtle);background:#20211e;">
              <img src="${t}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.display='none'" />
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  // Activity Tab
  if (DOM.tabActivityTimeline) {
    const acts = Array.isArray(col.recentActivity) ? col.recentActivity : [];
    if (acts.length === 0) {
      DOM.tabActivityTimeline.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px;">No activity logs found.</div>';
    } else {
      DOM.tabActivityTimeline.innerHTML = acts.map(a => `
        <div class="timeline-item" style="margin-bottom:12px;">
          <div class="timeline-dot" style="background-color:${a.color || '#a855f7'};"></div>
          <div class="timeline-content">
            <span class="timeline-date">${escapeHTML(a.date)}</span>
            <span class="timeline-desc">${escapeHTML(a.description || a.text || '')}</span>
          </div>
        </div>
      `).join('');
    }
  }
}

// ─── Interaction Handlers ──────────────────────────────────────────────────
export async function selectCollection(name) {
  const found = state.collections.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (found) {
    state.selectedCollection = found;
    renderFeaturedSection();
    renderAllCollectionsGrid();
    renderInspectorDetails();

    if (found.id) {
      try {
        const detail = await api.collections.getById(found.id);
        if (detail && state.selectedCollection && state.selectedCollection.id === found.id) {
          state.selectedCollection = { ...state.selectedCollection, ...detail };
          renderInspectorDetails();
        }
      } catch (err) {
        console.warn('Could not load detailed collection breakdown:', err);
      }
    }

    // If mobile, ensure right panel is visible
    if (window.innerWidth <= 1200 && DOM.workspaceRightPanel) {
      DOM.workspaceRightPanel.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
window.selectCollection = selectCollection;

export function switchInspectorTab(tabId) {
  state.activeTab = tabId;
  const tabButtons = document.querySelectorAll('.inspector-tab');
  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  const panes = document.querySelectorAll('.tab-pane');
  panes.forEach(pane => {
    pane.classList.remove('active');
  });

  const targetPane = document.getElementById(`pane${capitalize(tabId)}`);
  if (targetPane) targetPane.classList.add('active');

  if (window.lucide) window.lucide.createIcons();
}
window.switchInspectorTab = switchInspectorTab;

export function setMode(mode) {
  state.filterMode = mode;
  if (DOM.tabModeCollections) DOM.tabModeCollections.classList.toggle('active', mode === 'active');
  if (DOM.tabModeArchived) DOM.tabModeArchived.classList.toggle('active', mode === 'archived');
  loadCollectionsData();
}
window.setMode = setMode;

export function setViewMode(mode) {
  state.viewMode = mode;
  if (DOM.btnViewGrid) DOM.btnViewGrid.classList.toggle('active', mode === 'grid');
  if (DOM.btnViewList) DOM.btnViewList.classList.toggle('active', mode === 'list');
  renderAllCollectionsGrid();
  if (window.lucide) window.lucide.createIcons();
}
window.setViewMode = setViewMode;

export function handleSearch(query) {
  state.searchQuery = query;
  loadCollectionsData();
}
window.handleSearch = handleSearch;

export function handleFilterChange() {
  state.filters.season = DOM.filterSeason ? DOM.filterSeason.value : 'all';
  state.filters.year = DOM.filterYear ? DOM.filterYear.value : 'all';
  state.filters.status = DOM.filterStatus ? DOM.filterStatus.value : 'all';
  state.filters.designer = DOM.filterDesigner ? DOM.filterDesigner.value : 'all';
  state.filters.branch = DOM.filterBranch ? DOM.filterBranch.value : 'all';
  loadCollectionsData();
}
window.handleFilterChange = handleFilterChange;

export function toggleMoreMenu(e) {
  e.stopPropagation();
  if (DOM.moreDropdownMenu) {
    DOM.moreDropdownMenu.classList.toggle('show');
  }
}
window.toggleMoreMenu = toggleMoreMenu;

// DEAD-1: toggleRightPanel removed — exported but never called from HTML; mobile handled by scrollIntoView at line 986

export function refreshCollectionsData() {
  if (DOM.moreDropdownMenu) DOM.moreDropdownMenu.classList.remove('show');
  showToast('Refreshing collections dataset...', 'info');
  loadCollectionsData();
}
window.refreshCollectionsData = refreshCollectionsData;

export function exportLookbook() {
  if (DOM.moreDropdownMenu) DOM.moreDropdownMenu.classList.remove('show');
  const colName = state.selectedCollection ? state.selectedCollection.name : 'Collections';
  showToast(`Generating lookbook export for ${colName}...`, 'info');
  setTimeout(() => {
    window.print();
  }, 500);
}
window.exportLookbook = exportLookbook;

// ─── Modal Workflows (Create / Edit / Archive) ─────────────────────────────
export function openNewCollectionModal() {
  if (DOM.modalNewCollection) {
    DOM.modalNewCollection.classList.add('show');
    const input = document.getElementById('newColName');
    if (input) input.focus();
  }
}
window.openNewCollectionModal = openNewCollectionModal;

export function openEditCollectionModal(colId) {
  let col = null;
  if (colId) {
    col = state.collections.find(c => c.id === colId);
  }
  if (!col) col = state.selectedCollection;
  if (!col || !DOM.modalEditCollection) return;

  state.editingCollectionId = col.id;

  const origName = document.getElementById('editColOriginalName');
  const nameInput = document.getElementById('editColName');
  const subInput = document.getElementById('editColSubtitle');
  const seasonSelect = document.getElementById('editColSeason');
  const statusSelect = document.getElementById('editColStatus');
  const designerSelect = document.getElementById('editColDesigner');
  const branchInput = document.getElementById('editColBranch');
  const coverInput = document.getElementById('editColCover');
  const descText = document.getElementById('editColDesc');

  if (origName) origName.value = col.name || '';
  if (nameInput) nameInput.value = col.name || '';
  if (subInput) subInput.value = col.subtitle || '';
  if (seasonSelect) seasonSelect.value = col.season || '';
  if (statusSelect) statusSelect.value = col.status || 'ACTIVE';
  if (designerSelect) designerSelect.value = col.designer || '';
  if (branchInput) branchInput.value = col.branch || '';
  if (coverInput) coverInput.value = col.coverImageUrl || '';
  if (descText) descText.value = col.description || '';

  DOM.modalEditCollection.classList.add('show');
}
window.openEditCollectionModal = openEditCollectionModal;

export function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('show');
}
window.closeModal = closeModal;

export async function handleCreateCollectionSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('newColName')?.value.trim();
  const subtitle = document.getElementById('newColSubtitle')?.value.trim();
  const season = document.getElementById('newColSeason')?.value?.trim();
  const year = parseInt(document.getElementById('newColYear')?.value) || 2026;
  const designer = document.getElementById('newColDesigner')?.value?.trim();
  const branch = document.getElementById('newColBranch')?.value?.trim();
  const status = document.getElementById('newColStatus')?.value;
  const description = document.getElementById('newColDesc')?.value.trim();
  const isFeatured = document.getElementById('newColFeatured')?.checked;
  const coverImageUrl = document.getElementById('newColCover')?.value?.trim() || null;

  if (!name) {
    showToast('Collection name is required', 'error');
    return;
  }

  try {
    const created = await api.collections.create({
      name,
      subtitle,
      season,
      year,
      designer,
      branch,
      status,
      description,
      isFeatured,
      coverImageUrl
    });

    closeModal('modalNewCollection');
    showToast(`Collection "${name}" created successfully!`, 'success');
    document.getElementById('formNewCollection')?.reset();

    // Reload with refreshed DB options and select
    state.filtersLoaded = false;
    await loadCollectionsData();
    await selectCollection(name); // BUG-1: must await — selectCollection is async
  } catch (err) {
    console.error('Failed to create collection:', err);
    showToast('Failed to create collection', 'error');
  }
}
window.handleCreateCollectionSubmit = handleCreateCollectionSubmit;

export async function handleEditCollectionSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('editColName')?.value.trim();
  const subtitle = document.getElementById('editColSubtitle')?.value.trim();
  const season = document.getElementById('editColSeason')?.value?.trim();
  const status = document.getElementById('editColStatus')?.value;
  const designer = document.getElementById('editColDesigner')?.value?.trim();
  const branch = document.getElementById('editColBranch')?.value.trim();
  const coverImageUrl = document.getElementById('editColCover')?.value?.trim() || null;
  const description = document.getElementById('editColDesc')?.value.trim();

  if (!name) {
    showToast('Collection name is required', 'error');
    return;
  }

  try {
    const colId = state.editingCollectionId || state.selectedCollection?.id;
    if (!colId) {
      showToast('Collection ID not found', 'error');
      return;
    }

    await api.collections.update(colId, {
      name,
      subtitle,
      season,
      status,
      designer,
      branch,
      coverImageUrl,
      description
    });

    closeModal('modalEditCollection');
    showToast('Collection updated successfully!', 'success');
    state.filtersLoaded = false;
    await loadCollectionsData();
    await selectCollection(name); // BUG-1: must await — selectCollection is async
  } catch (err) {
    console.error('Failed to update collection:', err);
    showToast('Failed to update collection', 'error');
  }
}
window.handleEditCollectionSubmit = handleEditCollectionSubmit;

export async function archiveCurrentCollection() {
  const col = state.selectedCollection;
  if (!col) return;
  if (!confirm(`Are you sure you want to archive collection "${col.name}"?`)) return;

  try {
    await api.collections.archive(col.id);
    // BUG-6: only close edit modal if it is actually open
    const editModal = document.getElementById('modalEditCollection');
    if (editModal && editModal.classList.contains('show')) {
      closeModal('modalEditCollection');
    }
    showToast(`Collection "${col.name}" archived`, 'info');
    await loadCollectionsData();
  } catch (err) {
    console.error('Failed to archive collection:', err);
    showToast('Failed to archive collection', 'error');
  }
}
window.archiveCurrentCollection = archiveCurrentCollection;

// ─── Utility Helpers ───────────────────────────────────────────────────────
function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  if (/^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getBadgeClass(status) {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE') return 'badge-active';
  if (s === 'PLANNING') return 'badge-planning';
  if (s === 'DRAFT') return 'badge-draft';
  if (s === 'ARCHIVED') return 'badge-archived';
  return 'badge-active';
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;'); // DEAD-6 / BUG: escape single-quotes to prevent XSS in inline onclick attrs
}

function showToast(message, type = 'info') {
  if (!DOM.toastContainer) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  DOM.toastContainer.appendChild(t);
  setTimeout(() => {
    t.remove();
  }, 4000);
}
window.showToast = showToast;

window.navigateCollection = function(direction) {
  if (!state.collections || state.collections.length === 0) return;
  const currentIdx = state.collections.findIndex(c => c.name.toLowerCase() === state.selectedCollection?.name?.toLowerCase());
  let newIdx = (currentIdx === -1 ? 0 : currentIdx) + direction;
  if (newIdx < 0) newIdx = state.collections.length - 1;
  if (newIdx >= state.collections.length) newIdx = 0;
  selectCollection(state.collections[newIdx].name);
};

window.scrollToAllCollections = function() {
  const el = document.getElementById('allCollectionsSection');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

// DEAD-4: openLookbookModal removed — was a one-line wrapper for switchInspectorTab('moodboard')
// Any HTML onclick should call switchInspectorTab('moodboard') directly
