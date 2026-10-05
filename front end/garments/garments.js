/**
 * HAULO BOUTIQUE ERP — Garments Module Controller
 * garments.js — Dynamic REST integration with PostgreSQL
 */

import api, { Auth } from '../api.js';

const FALLBACK_GARMENT_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='48' height='48' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 14 L24 4 L42 14 L34 44 L14 44 Z'/%3E%3Cpath d='M24 4 L24 44' stroke-dasharray='3 3'/%3E%3C/svg%3E";
const FALLBACK_FABRIC_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='48' height='48' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='6' y='6' width='36' height='36' rx='4'/%3E%3Cpath d='M6 18h36M6 30h36M18 6v36M30 6v36' stroke-dasharray='2 2'/%3E%3C/svg%3E";

// ─── Module State ──────────────────────────────────────────────────────────
let dynamicStageDefs = [];

const state = {
  garments: [],
  selectedGarment: null,
  selectedIds: new Set(),
  stageFilter: 'all',
  searchQuery: '',
  filters: {
    garmentType: 'all',
    collection: 'all',
    productionStage: 'all',
    status: 'all',
    priority: 'all',
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

// ─── DOM Elements Cache ───────────────────────────────────────────────────
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
    valInTrial: document.getElementById('valInTrial'),
    deltaInTrial: document.getElementById('deltaInTrial'),
    valAwaitingQc: document.getElementById('valAwaitingQc'),
    deltaAwaitingQc: document.getElementById('deltaAwaitingQc'),
    valReady: document.getElementById('valReady'),
    deltaReady: document.getElementById('deltaReady'),
    valDelivered: document.getElementById('valDelivered'),
    deltaDelivered: document.getElementById('deltaDelivered'),

    // Filters
    searchGarments: document.getElementById('searchGarments'),
    filterGarmentType: document.getElementById('filterGarmentType'),
    filterCollection: document.getElementById('filterCollection'),
    filterProductionStage: document.getElementById('filterProductionStage'),
    filterStatus: document.getElementById('filterStatus'),
    filterPriority: document.getElementById('filterPriority'),
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
    inspectorCode: document.getElementById('inspectorCode'),
    inspectorTitle: document.getElementById('inspectorTitle'),
    inspectorStatusBadge: document.getElementById('inspectorStatusBadge'),
    detCustomer: document.getElementById('detCustomer'),
    detOrder: document.getElementById('detOrder'),
    detType: document.getElementById('detType'),
    detCollection: document.getElementById('detCollection'),
    detDesign: document.getElementById('detDesign'),
    detDueDate: document.getElementById('detDueDate'),
    detPriority: document.getElementById('detPriority'),
    detMaterialStatus: document.getElementById('detMaterialStatus'),
    detTrial: document.getElementById('detTrial'),
    detPayment: document.getElementById('detPayment'),
    detAssigned: document.getElementById('detAssigned'),

    // Inspector Panes
    paneOverview: document.getElementById('paneOverview'),
    paneMaterials: document.getElementById('paneMaterials'),
    paneMeasurements: document.getElementById('paneMeasurements'),
    paneTimeline: document.getElementById('paneTimeline'),
    inspectorMaterialsList: document.getElementById('inspectorMaterialsList'),
    inspectorMeasurementsList: document.getElementById('inspectorMeasurementsList'),
    inspectorTimelineList: document.getElementById('inspectorTimelineList'),

    toastContainer: document.getElementById('toastContainer'),
  };
}

// ─── Lifecycle & Initialization ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  cacheDOM();

  // Highlight active sidebar item
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

  // Load dynamic stages, KPI data & initial page of garments
  await loadDynamicGarmentStages();
  populateDynamicStageDropdown();
  await Promise.all([
    loadKpiMetrics(),
    loadGarmentsData()
  ]);
  renderDynamicStagePills();

  if (window.lucide) window.lucide.createIcons();
});

// ─── Load Dynamic Stage Definitions ───────────────────────────────────────
async function loadDynamicGarmentStages() {
  try {
    if (api?.production?.stageDefinitions?.list) {
      const defs = await api.production.stageDefinitions.list({ activeOnly: true });
      if (Array.isArray(defs) && defs.length > 0) {
        dynamicStageDefs = defs;
      }
    }
  } catch (e) {
    console.warn('[Garments] Could not load dynamic stages:', e);
  }
}

function populateDynamicStageDropdown() {
  const select = document.getElementById('filterProductionStage');
  if (!select) return;

  const currentVal = select.value || 'all';
  let html = '<option value="all">Production Stage (All)</option>';
  dynamicStageDefs.forEach(def => {
    const name = def.displayName || def.stageKey;
    html += `<option value="${name}">${name}</option>`;
  });
  select.innerHTML = html;
  if (currentVal && select.querySelector(`option[value="${currentVal}"]`)) {
    select.value = currentVal;
  }
}

function renderDynamicStagePills(kpis) {
  const container = document.getElementById('stagePillsGroup');
  if (!container) return;

  const allCount = kpis?.allCount ?? state.pagination.totalElements ?? (state.garments ? state.garments.length : 0);
  const activeFilter = (state.stageFilter || 'all').toLowerCase();

  let html = `
    <button type="button" class="stage-pill ${activeFilter === 'all' ? 'active' : ''}" data-stage="all" onclick="setStageFilter('all')">
      <span>All</span> <span class="pill-badge" id="badgeStageAll">${allCount}</span>
    </button>
  `;

  dynamicStageDefs.forEach(def => {
    const stageName = def.displayName || def.stageKey;
    const stageKey = def.stageKey;
    const count = (state.garments || []).filter(g => {
      const gStage = (g.productionStage || g.stage || g.currentStage || '').toLowerCase();
      return gStage === stageName.toLowerCase() || gStage === stageKey.toLowerCase();
    }).length;

    const isActive = activeFilter === stageName.toLowerCase() || activeFilter === stageKey.toLowerCase();

    html += `
      <button type="button" class="stage-pill ${isActive ? 'active' : ''}" data-stage="${stageName}" onclick="setStageFilter('${stageName}')">
        <span>${stageName}</span> <span class="pill-badge">${count}</span>
      </button>
    `;
  });

  container.innerHTML = html;
}

// ─── Load KPI Metrics & Stage Counts ──────────────────────────────────────
async function loadKpiMetrics() {
  try {
    const kpis = await api.garments.kpis();
    if (!kpis) return;

    if (DOM.valTotalGarments) DOM.valTotalGarments.textContent = kpis.totalGarments ?? 0;
    if (DOM.valInProduction) DOM.valInProduction.textContent = kpis.inProduction ?? 0;
    if (DOM.valInTrial) DOM.valInTrial.textContent = kpis.inTrial ?? 0;
    if (DOM.valAwaitingQc) DOM.valAwaitingQc.textContent = kpis.awaitingQc ?? 0;
    if (DOM.valReady) DOM.valReady.textContent = kpis.ready ?? 0;
    if (DOM.valDelivered) DOM.valDelivered.textContent = kpis.delivered ?? 0;

    renderDynamicStagePills(kpis);
  } catch (err) {
    console.warn('Could not load garment KPIs:', err);
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
    if (state.stageFilter && state.stageFilter !== 'all') params.stage = state.stageFilter;
    if (state.filters.garmentType && state.filters.garmentType !== 'all') params.garmentType = state.filters.garmentType;
    if (state.filters.collection && state.filters.collection !== 'all') params.collection = state.filters.collection;
    if (state.filters.productionStage && state.filters.productionStage !== 'all') params.stage = state.filters.productionStage;
    if (state.filters.status && state.filters.status !== 'all') params.status = state.filters.status;
    if (state.filters.priority && state.filters.priority !== 'all') params.priority = state.filters.priority;
    if (state.filters.materialStatus && state.filters.materialStatus !== 'all') params.materialStatus = state.filters.materialStatus;
    if (state.filters.designer && state.filters.designer !== 'all') params.designer = state.filters.designer;
    if (state.filters.branch && state.filters.branch !== 'all') params.branch = state.filters.branch;

    const res = await api.garments.list(params);
    const list = res.content || [];
    state.garments = list;

    state.pagination.totalElements = res.totalElements ?? list.length;
    state.pagination.totalPages = res.totalPages ?? Math.ceil(state.pagination.totalElements / state.pagination.size);

    // If no garment selected yet, default to first item (e.g. BRD-0528)
    if ((!state.selectedGarment || !state.garments.some(g => g.id === state.selectedGarment.id)) && state.garments.length > 0) {
      selectGarment(state.garments[0].id);
    }

    renderTable();
    renderPagination();
    renderDynamicStagePills();
  } catch (err) {
    console.error('Failed to load garments:', err);
    showToast('Failed to load garments from database', 'error');
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
    renderEmptyInspector();
    return;
  }

  if (DOM.emptyState) DOM.emptyState.style.display = 'none';
  if (state.selectedGarment && DOM.garmentInspector) {
    DOM.garmentInspector.style.display = 'flex';
  }

  DOM.garmentsTableBody.innerHTML = state.garments.map(g => {
    const isSelected = state.selectedGarment && state.selectedGarment.id === g.id;
    const isChecked = state.selectedIds.has(g.id);

    const stageClass = getStageClass(g.productionStage);
    const matClass = (g.materialStatus || 'READY').toLowerCase();
    const priorityClass = (g.priority || 'NORMAL').toLowerCase();
    const paymentClass = (g.paymentStatus || 'PENDING').toLowerCase();
    const statusCapsuleClass = getStatusCapsuleClass(g.status);

    const daysLeftHtml = g.isOverdue
      ? `<span class="days-left-badge days-left-red">${Math.abs(g.daysRemaining)} days overdue</span>`
      : `<span class="days-left-badge days-left-green">${g.daysRemaining} days</span>`;

    const imgThumb = g.imageUrl || FALLBACK_GARMENT_SVG;

    return `
      <tr class="${isSelected ? 'selected' : ''}" onclick="window.selectGarment('${g.id}')">
        <td class="td-check" onclick="event.stopPropagation()">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="window.toggleRowSelect('${g.id}', event)" />
        </td>
        <td>
          <div class="cell-garment-info">
            <img class="garment-thumb-img" src="${imgThumb}" alt="${escapeHTML(g.title)}" onerror="this.src='${FALLBACK_GARMENT_SVG}'" />
            <div class="garment-texts">
              <span class="garment-code-title">
                ${escapeHTML(g.garmentCode)} &bull; ${escapeHTML(g.title)}
              </span>
              <span class="garment-spec-sub">${escapeHTML(g.specs || 'Custom Silhouette')}</span>
            </div>
          </div>
        </td>
        <td>
          <div class="cell-customer-order">
            <span class="customer-name-bold">${escapeHTML(g.customerName)}</span>
            <span class="order-code-sub">${escapeHTML(g.orderCode)}</span>
          </div>
        </td>
        <td>${escapeHTML(g.garmentType)}</td>
        <td>
          <div class="cell-design-col">
            <span class="design-code-bold">${escapeHTML(g.designCode || '-')}</span>
            <span class="collection-name-sub">${escapeHTML(g.collectionName || 'Main Edit')}</span>
          </div>
        </td>
        <td>
          <div class="cell-stage-mat">
            <span class="stage-badge-pill ${stageClass}">${escapeHTML(g.productionStage)}</span>
            <div class="material-status-line">
              <span class="dot-status ${matClass}"></span>
              <span>Materials ${capitalize(g.materialStatus)}</span>
            </div>
          </div>
        </td>
        <td>${escapeHTML(g.trialStatus || 'Not Required')}</td>
        <td>
          <div class="cell-due-date">
            <span class="due-date-str">${formatShortDate(g.dueDate)}</span>
            ${daysLeftHtml}
          </div>
        </td>
        <td>
          <span class="badge-priority ${priorityClass}">${escapeHTML(g.priority)}</span>
        </td>
        <td>
          <span class="badge-payment ${paymentClass}">${escapeHTML(g.paymentStatus)}</span>
        </td>
        <td>
          <span class="badge-status-capsule ${statusCapsuleClass}">
            <span class="status-dot"></span> ${escapeHTML(g.status || 'Active')}
          </span>
        </td>
        <td onclick="event.stopPropagation()">
          <button type="button" class="btn-row-action" title="Actions" onclick="window.openRowActionMenu('${g.id}', event)">
            <i data-lucide="more-horizontal" style="width:14px;height:14px;"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── Render Pagination Controls ───────────────────────────────────────────
function renderPagination() {
  const p = state.pagination;
  if (p.totalElements === 0) {
    if (DOM.paginationInfo) DOM.paginationInfo.textContent = 'Showing 0 garments';
    if (DOM.paginationControls) DOM.paginationControls.innerHTML = '';
    return;
  }

  const start = p.page * p.size + 1;
  const end = Math.min((p.page + 1) * p.size, p.totalElements);

  if (DOM.paginationInfo) {
    DOM.paginationInfo.textContent = `Showing ${start}–${end} of ${p.totalElements} garments`;
  }

  if (!DOM.paginationControls) return;

  const totalPages = Math.max(1, p.totalPages);
  const current = p.page;
  const btns = [];

  // Prev
  btns.push(`
    <button type="button" class="page-btn" ${current === 0 ? 'disabled' : ''} onclick="window.handlePageChange(${current - 1})">
      <i data-lucide="chevron-left" style="width:13px;height:13px;"></i>
    </button>
  `);

  const pagesToShow = [0];
  if (current > 2) pagesToShow.push(-1); // ellipsis
  for (let i = Math.max(1, current - 1); i <= Math.min(totalPages - 2, current + 1); i++) {
    if (!pagesToShow.includes(i)) pagesToShow.push(i);
  }
  if (current < totalPages - 3) pagesToShow.push(-2); // ellipsis
  if (totalPages > 1 && !pagesToShow.includes(totalPages - 1)) pagesToShow.push(totalPages - 1);

  pagesToShow.forEach(idx => {
    if (idx === -1 || idx === -2) {
      btns.push(`<span style="padding:0 4px;color:var(--text-muted);">&hellip;</span>`);
    } else {
      btns.push(`
        <button type="button" class="page-btn ${idx === current ? 'active' : ''}" onclick="window.handlePageChange(${idx})">
          ${idx + 1}
        </button>
      `);
    }
  });

  // Next
  btns.push(`
    <button type="button" class="page-btn" ${current >= totalPages - 1 ? 'disabled' : ''} onclick="window.handlePageChange(${current + 1})">
      <i data-lucide="chevron-right" style="width:13px;height:13px;"></i>
    </button>
  `);

  DOM.paginationControls.innerHTML = btns.join('');
}

// ─── Select & Render Garment in Inspector ──────────────────────────────────
export async function selectGarment(id) {
  const found = state.garments.find(g => g.id === id);
  if (!found) return;

  state.selectedGarment = found;
  renderTable(); // Update selected highlight in table rows
  renderInspectorBasics(found);

  try {
    const detail = await api.garments.getById(id);
    if (detail && state.selectedGarment && state.selectedGarment.id === id) {
      state.selectedGarment = { ...state.selectedGarment, ...detail };
      renderInspectorPanes(state.selectedGarment);
    }
  } catch (err) {
    console.warn('Could not load detailed garment info:', err);
  }

  if (window.lucide) window.lucide.createIcons();
}
window.selectGarment = selectGarment;

function renderInspectorBasics(g) {
  if (DOM.inspectorHeroImg) {
    DOM.inspectorHeroImg.src = g.imageUrl || FALLBACK_GARMENT_SVG;
    DOM.inspectorHeroImg.style.opacity = '1';
  }
  if (DOM.inspectorCode) DOM.inspectorCode.textContent = g.garmentCode;
  if (DOM.inspectorTitle) DOM.inspectorTitle.textContent = g.title;

  if (DOM.inspectorStatusBadge) {
    DOM.inspectorStatusBadge.className = `badge-status-capsule ${getStatusCapsuleClass(g.status)}`;
    DOM.inspectorStatusBadge.innerHTML = `<span class="status-dot"></span> ${escapeHTML(g.status || 'Active')}`;
  }

  // 2-Column Details
  if (DOM.detCustomer) DOM.detCustomer.textContent = g.customerName;
  if (DOM.detOrder) DOM.detOrder.textContent = g.orderCode;
  if (DOM.detType) DOM.detType.textContent = g.garmentType;
  if (DOM.detCollection) DOM.detCollection.textContent = g.collectionName || 'Boutique Edit';
  if (DOM.detDesign) DOM.detDesign.textContent = g.designCode || '-';
  if (DOM.detDueDate) {
    const daysStr = g.isOverdue ? `(${Math.abs(g.daysRemaining)} days overdue)` : `(${g.daysRemaining} days)`;
    DOM.detDueDate.textContent = `${formatShortDate(g.dueDate)} ${daysStr}`;
    DOM.detDueDate.className = `pair-value ${g.isOverdue ? 'days-left-red' : 'text-green'}`;
  }
  if (DOM.detPriority) {
    const pClass = (g.priority || 'NORMAL').toLowerCase();
    DOM.detPriority.textContent = g.priority;
    DOM.detPriority.className = `badge-priority ${pClass}`;
  }
  if (DOM.detMaterialStatus) {
    DOM.detMaterialStatus.textContent = capitalize(g.materialStatus || 'Ready');
    const dot = DOM.detMaterialStatus.parentElement?.querySelector('.dot-status');
    if (dot) dot.className = `dot-status ${(g.materialStatus || 'READY').toLowerCase()}`;
  }
  if (DOM.detTrial) DOM.detTrial.textContent = g.trialDate ? formatShortDate(g.trialDate) : (g.trialStatus || 'Not Required');
  if (DOM.detPayment) {
    const pClass = (g.paymentStatus || 'PENDING').toLowerCase();
    DOM.detPayment.innerHTML = `<span class="dot-payment ${pClass}"></span> ${escapeHTML(g.formattedPaymentRatio || '₹0 / ₹0')}`;
  }
  if (DOM.detAssigned) DOM.detAssigned.textContent = g.assignedTo || 'Unassigned';
}

function renderInspectorPanes(g) {
  // Materials Pane
  if (DOM.inspectorMaterialsList) {
    const mats = g.materials || [];
    DOM.inspectorMaterialsList.innerHTML = mats.map(m => `
      <div class="material-card-row">
        <img src="${m.imageUrl || FALLBACK_FABRIC_SVG}" alt="${escapeHTML(m.name)}" onerror="this.src='${FALLBACK_FABRIC_SVG}'" />
        <div style="flex:1;">
          <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${escapeHTML(m.name)}</div>
          <div style="font-size:10.5px;color:var(--text-muted);">${escapeHTML(m.variant)} &bull; ${escapeHTML(m.meters)}</div>
        </div>
        <span style="font-size:11px;color:var(--lime-accent);font-weight:600;">${escapeHTML(m.status)}</span>
      </div>
    `).join('');
  }

  // Measurements Pane
  if (DOM.inspectorMeasurementsList) {
    const meas = g.measurements || [];
    DOM.inspectorMeasurementsList.innerHTML = meas.map(m => `
      <div class="meas-item">
        <span class="meas-lbl">${escapeHTML(m.label)}</span>
        <span class="meas-val">${escapeHTML(m.value)}</span>
      </div>
    `).join('');
  }

  // Timeline Pane
  if (DOM.inspectorTimelineList) {
    const time = g.timeline || [];
    DOM.inspectorTimelineList.innerHTML = time.map(t => `
      <div class="timeline-feed-item">
        <div class="timeline-feed-dot" style="background-color:${t.color || 'var(--purple, #a855f7)'};"></div>
        <div class="timeline-feed-content">
          <span class="timeline-feed-date">${escapeHTML(t.date)} &bull; <strong>${escapeHTML(t.stage)}</strong></span>
          <span class="timeline-feed-desc">${escapeHTML(t.description)}</span>
        </div>
      </div>
    `).join('');
  }
}

function renderEmptyInspector() {
  state.selectedGarment = null;
  if (DOM.inspectorHeroImg) {
    DOM.inspectorHeroImg.src = '';
    DOM.inspectorHeroImg.style.opacity = '0';
  }
  if (DOM.inspectorCode) DOM.inspectorCode.textContent = '—';
  if (DOM.inspectorTitle) DOM.inspectorTitle.textContent = 'No Garment Selected';

  if (DOM.inspectorStatusBadge) {
    DOM.inspectorStatusBadge.className = 'badge-status-capsule capsule-gray';
    DOM.inspectorStatusBadge.innerHTML = `<span class="status-dot"></span> —`;
  }

  // 2-Column Details
  if (DOM.detCustomer) DOM.detCustomer.textContent = '—';
  if (DOM.detOrder) DOM.detOrder.textContent = '—';
  if (DOM.detType) DOM.detType.textContent = '—';
  if (DOM.detCollection) DOM.detCollection.textContent = '—';
  if (DOM.detDesign) DOM.detDesign.textContent = '—';
  if (DOM.detDueDate) DOM.detDueDate.textContent = '—';
  if (DOM.detPriority) DOM.detPriority.textContent = '—';
  if (DOM.detMaterialStatus) DOM.detMaterialStatus.textContent = '—';
  if (DOM.detTrial) DOM.detTrial.textContent = '—';
  if (DOM.detPayment) DOM.detPayment.textContent = '—';
  if (DOM.detAssigned) DOM.detAssigned.textContent = '—';

  // Secondary tabs
  if (DOM.paneOverview) {
    DOM.paneOverview.innerHTML = `
      <div style="padding:28px 16px;text-align:center;color:var(--text-muted);">
        <i data-lucide="package-open" style="width:36px;height:36px;margin:0 auto 8px auto;opacity:0.6;display:block;"></i>
        <div style="font-size:13px;font-weight:500;color:var(--text-secondary);">No Garment Selected</div>
        <div style="font-size:11.5px;color:var(--text-dim);margin-top:4px;">Select a garment from the list to view its real database details.</div>
      </div>
    `;
  }
  if (DOM.paneMaterials) DOM.paneMaterials.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;">No materials record.</div>';
  if (DOM.paneMeasurements) DOM.paneMeasurements.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;">No measurements record.</div>';
  if (DOM.paneTimeline) DOM.paneTimeline.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;">No timeline history.</div>';

  if (window.lucide) window.lucide.createIcons();
}

// ─── Filter & Search Handlers ─────────────────────────────────────────────
export function setStageFilter(stage) {
  state.stageFilter = stage;
  state.pagination.page = 0;
  renderDynamicStagePills();
  loadGarmentsData();
}
window.setStageFilter = setStageFilter;

export function handleSearchInput(e) {
  state.searchQuery = e.target.value;
  state.pagination.page = 0;
  clearTimeout(window._searchTimer);
  window._searchTimer = setTimeout(() => {
    loadGarmentsData();
  }, 300);
}
window.handleSearchInput = handleSearchInput;

export function handleFilterChange() {
  state.filters.garmentType = DOM.filterGarmentType ? DOM.filterGarmentType.value : 'all';
  state.filters.collection = DOM.filterCollection ? DOM.filterCollection.value : 'all';
  state.filters.productionStage = DOM.filterProductionStage ? DOM.filterProductionStage.value : 'all';
  state.filters.status = DOM.filterStatus ? DOM.filterStatus.value : 'all';
  state.filters.priority = DOM.filterPriority ? DOM.filterPriority.value : 'all';
  state.filters.materialStatus = DOM.filterMaterialStatus ? DOM.filterMaterialStatus.value : 'all';
  state.filters.designer = DOM.filterDesigner ? DOM.filterDesigner.value : 'all';
  state.filters.branch = DOM.filterBranch ? DOM.filterBranch.value : 'all';

  state.pagination.page = 0;
  loadGarmentsData();
}
window.handleFilterChange = handleFilterChange;

export function handlePageChange(newPage) {
  if (newPage < 0 || newPage >= state.pagination.totalPages) return;
  state.pagination.page = newPage;
  loadGarmentsData();
}
window.handlePageChange = handlePageChange;

export function handlePageSizeChange(newSize) {
  state.pagination.size = parseInt(newSize, 10) || 10;
  state.pagination.page = 0;
  loadGarmentsData();
}
window.handlePageSizeChange = handlePageSizeChange;

// ─── Selection Checkboxes ──────────────────────────────────────────────────
export function toggleSelectAll(masterCheckbox) {
  const isChecked = masterCheckbox.checked;
  if (isChecked) {
    state.garments.forEach(g => state.selectedIds.add(g.id));
  } else {
    state.selectedIds.clear();
  }
  renderTable();
}
window.toggleSelectAll = toggleSelectAll;

export function toggleRowSelect(id, event) {
  if (event) event.stopPropagation();
  if (state.selectedIds.has(id)) {
    state.selectedIds.delete(id);
  } else {
    state.selectedIds.add(id);
  }
  if (DOM.checkSelectAll) {
    DOM.checkSelectAll.checked = state.garments.length > 0 && state.selectedIds.size === state.garments.length;
  }
  renderTable();
}
window.toggleRowSelect = toggleRowSelect;

// ─── Inspector Tabs & Actions ─────────────────────────────────────────────
export function switchInspectorTab(tabId) {
  state.activeTab = tabId;
  const tabs = document.querySelectorAll('.inspector-tab');
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));

  const panes = document.querySelectorAll('.tab-pane');
  panes.forEach(p => p.classList.remove('active'));

  const activePane = document.getElementById(`pane${capitalize(tabId)}`);
  if (activePane) activePane.classList.add('active');

  if (window.lucide) window.lucide.createIcons();
}
window.switchInspectorTab = switchInspectorTab;

export function closeInspector() {
  if (DOM.garmentInspector) DOM.garmentInspector.style.display = 'none';
}
window.closeInspector = closeInspector;

export function toggleInspectorExpand() {
  const g = state.selectedGarment;
  if (g && g.imageUrl) {
    window.open(g.imageUrl, '_blank');
  }
}
window.toggleInspectorExpand = toggleInspectorExpand;

export function viewGarmentDetails() {
  const g = state.selectedGarment;
  if (!g) return;
  showToast(`Opening complete detail dossier for ${g.garmentCode}...`, 'info');
}
window.viewGarmentDetails = viewGarmentDetails;

export function viewOrder() {
  const g = state.selectedGarment;
  if (!g) return;
  window.location.href = `../orders/order-overview/order-over.html?search=${encodeURIComponent(g.orderCode)}`;
}
window.viewOrder = viewOrder;

export function viewCustomer() {
  const g = state.selectedGarment;
  if (!g) return;
  window.location.href = `../customer/customer-overview/customer-overview.html?search=${encodeURIComponent(g.customerName)}`;
}
window.viewCustomer = viewCustomer;

export function openNewGarmentModal() {
  showToast('New Garment Creation Modal opened', 'info');
}
window.openNewGarmentModal = openNewGarmentModal;

export function toggleMoreMenu(e) {
  e.stopPropagation();
  if (DOM.headerDropdownMenu) {
    DOM.headerDropdownMenu.classList.toggle('show');
  }
}
window.toggleMoreMenu = toggleMoreMenu;

export function toggleSavedViews(e) {
  e.stopPropagation();
  showToast('Saved Views: Active Production, Trials This Week, QC Backlog', 'info');
}
window.toggleSavedViews = toggleSavedViews;

export function refreshGarmentsData() {
  if (DOM.headerDropdownMenu) DOM.headerDropdownMenu.classList.remove('show');
  showToast('Refreshing garments list...', 'info');
  loadKpiMetrics();
  loadGarmentsData();
}
window.refreshGarmentsData = refreshGarmentsData;

export function exportGarmentsCsv() {
  if (DOM.headerDropdownMenu) DOM.headerDropdownMenu.classList.remove('show');
  const headers = ['Garment Code', 'Title', 'Customer', 'Order', 'Type', 'Collection', 'Stage', 'Status', 'Due Date'];
  const rows = state.garments.map(g => [
    g.garmentCode, g.title, g.customerName, g.orderCode, g.garmentType, g.collectionName, g.productionStage, g.status, g.dueDate
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'garments_export.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('Exported garments to CSV', 'success');
}
window.exportGarmentsCsv = exportGarmentsCsv;

export function printGarmentBatch() {
  if (DOM.headerDropdownMenu) DOM.headerDropdownMenu.classList.remove('show');
  window.print();
}
window.printGarmentBatch = printGarmentBatch;

export function openRowActionMenu(id, e) {
  e.stopPropagation();
  selectGarment(id);
  showToast(`Options for ${state.selectedGarment?.garmentCode}: Update Stage, Reassign Tailor, Reschedule Trial`, 'info');
}
window.openRowActionMenu = openRowActionMenu;

// ─── Utility Helpers ───────────────────────────────────────────────────────
function formatShortDate(dateStr) {
  if (!dateStr) return '-';
  if (/^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getStageClass(stage) {
  const s = (stage || '').toLowerCase().trim();
  const match = dynamicStageDefs.find(d => 
    (d.displayName && d.displayName.toLowerCase() === s) ||
    (d.stageKey && d.stageKey.toLowerCase() === s)
  );
  if (match && match.colorClass) {
    const col = match.colorClass.replace('dot-', '');
    return `stage-${col}`;
  }
  if (s.includes('order')) return 'stage-emerald';
  if (s.includes('stitch')) return 'stage-stitching';
  if (s.includes('ready')) return 'stage-ready';
  return 'stage-designing';
}

function getStatusCapsuleClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('production')) return 'in-production';
  if (s.includes('trial')) return 'trial';
  if (s.includes('qc')) return 'awaiting-qc';
  if (s.includes('ready')) return 'ready';
  if (s.includes('deliver')) return 'delivered';
  if (s.includes('hold')) return 'on-hold';
  return 'in-production';
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(message, type = 'info') {
  if (window.NotificationCenter && typeof window.NotificationCenter.toast === 'function') {
    const sevMap = { error: 'danger', danger: 'danger', warn: 'warn', warning: 'warn', success: 'success', info: 'info' };
    const titles = {
      success: 'Garments Updated',
      danger: 'Garment Alert',
      error: 'Garment Alert',
      warn: 'Notice',
      info: 'Garments'
    };
    const sev = sevMap[type] || 'info';
    window.NotificationCenter.toast({
      title: titles[sev] || 'Garments',
      message: message,
      severity: sev,
      duration: 4000
    });
    return;
  }
  if (!DOM.toastContainer) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  DOM.toastContainer.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}
window.showToast = showToast;
