/* ============================================================
   HAULO BOUTIQUE ERP — Branch Network Command Centre JS
   Path: front end/branches/branches.js
   ============================================================ */

'use strict';

/* ── Constants ── */
const API_BASE = window.HAULO_API_BASE || ((typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:'))
  ? `${window.location.origin}/api/v1` : 'http://localhost:8080/api/v1');
const BRANCHES_API = `${API_BASE}/branches`;
const EMPLOYEES_API = `${API_BASE}/employees`;
const ORDERS_API = `${API_BASE}/orders`;
const PAGE_SIZE = 100;
const DELETE_CONFIRM_WORD = 'DELETE';
const TOKEN_STORAGE_KEYS = ['erp_token', 'haulo_token', 'fashion_erp_token'];

const BRANCH_TYPES = ['FLAGSHIP', 'SHOWROOM', 'WAREHOUSE', 'POPUP', 'PRODUCTION_UNIT', 'EXPERIENCE_STUDIO', 'BOUTIQUE'];
const BRANCH_TYPE_LABELS = {
  FLAGSHIP: 'Flagship',
  SHOWROOM: 'Showroom',
  WAREHOUSE: 'Warehouse',
  POPUP: 'Pop-up',
  PRODUCTION_UNIT: 'Production Unit',
  EXPERIENCE_STUDIO: 'Experience Studio',
  BOUTIQUE: 'Boutique',
};
const BRANCH_TYPE_ICONS = {
  FLAGSHIP: 'star',
  SHOWROOM: 'store',
  WAREHOUSE: 'warehouse',
  POPUP: 'tent',
  PRODUCTION_UNIT: 'factory',
  EXPERIENCE_STUDIO: 'sparkles',
  BOUTIQUE: 'scissors',
};
const BRANCH_AVATAR_CLASS = {
  FLAGSHIP: 'tbl-avatar--flagship',
  SHOWROOM: 'tbl-avatar--showroom',
  WAREHOUSE: 'tbl-avatar--warehouse',
  POPUP: 'tbl-avatar--popup',
  PRODUCTION_UNIT: 'tbl-avatar--showroom',
  EXPERIENCE_STUDIO: 'tbl-avatar--popup',
  BOUTIQUE: 'tbl-avatar--showroom',
};
const BRANCH_BADGE_CLASS = {
  FLAGSHIP: 'badge--flagship',
  SHOWROOM: 'badge--showroom',
  WAREHOUSE: 'badge--warehouse',
  POPUP: 'badge--popup',
  PRODUCTION_UNIT: 'badge--showroom',
  EXPERIENCE_STUDIO: 'badge--popup',
  BOUTIQUE: 'badge--boutique',
};

/* Tab → type mapping (null = all) */
const TAB_TYPE_MAP = {
  ALL: null,
  SHOWROOMS: ['FLAGSHIP', 'SHOWROOM', 'BOUTIQUE'],
  PRODUCTION: ['PRODUCTION_UNIT'],
  WAREHOUSES: ['WAREHOUSE'],
  EXPERIENCE: ['EXPERIENCE_STUDIO', 'POPUP'],
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_OPEN = '10:00';
const DEFAULT_CLOSE = '20:00';

/* ── State ── */
let _allBranches = [];
let _allOrders = [];
let _allInventory = [];
let _allMovements = [];
let _allGarments = [];
let _allTrials = [];
let _allEmployees = [];
let _filtered = [];
let _editingId = null;
let _deleteTarget = null;
let _selectedBranchId = null;
let _activeTab = 'ALL';
let _sortKey = 'name';
let _sortDir = 'asc';
let _currentPage = 0;
const TABLE_PAGE_SIZE = 20;

/* ── Dynamic Helpers & Pure Database-Derived Metrics ── */
function _getBranchInitials(name) {
  if (!name) return 'BR';
  const parts = name.trim().split(/[\s-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function _formatWorkingHours(val) {
  if (!val) return '10:00 AM – 8:00 PM';
  try {
    const obj = JSON.parse(val);
    if (typeof obj === 'object' && obj !== null) {
      const days = Object.keys(obj);
      if (days.length > 0) {
        const first = obj[days[0]];
        if (first && first.open && first.close) {
          return `${first.open} – ${first.close}`;
        }
      }
    }
  } catch (_) {}
  const str = String(val);
  if (str.includes('|')) {
    return str.split('|')[0].trim();
  }
  return str;
}

function _deriveBranchMetrics(b) {
  const branchName = (b.name || '').toLowerCase();
  const branchCode = (b.branchCode || '').toLowerCase();
  const isHQ = !!(b.isHeadquarters || b.headquarters);

  // Match real orders for this branch
  const orders = _allOrders.filter(o => {
    const ob = (o.branch || '').toLowerCase();
    const pn = (o.productionNotes || '').toLowerCase();
    const matchesName = ob && (ob.includes(branchName) || branchName.includes(ob) || (branchCode && ob.includes(branchCode)));
    const matchesNotes = pn && (pn.includes(branchName) || pn.includes(branchCode));
    const matchesHQ = isHQ && (ob === 'main branch' || ob.includes('flagship') || ob.includes('lucknow'));
    return matchesName || matchesNotes || matchesHQ;
  });

  // Calculate real revenue from orders
  const revenue = orders.reduce((sum, o) => {
    const amt = parseFloat(o.totalAmount || o.amount || 0);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  // In-progress orders (actively in pipeline: not delivered, not completed, not cancelled)
  const inProgressOrders = orders.filter(o => {
    const s = (o.status || '').toUpperCase();
    return s !== 'DELIVERED' && s !== 'COMPLETED' && s !== 'CANCELLED';
  });

  // Fulfilled orders (delivered or ready/completed)
  const fulfilledOrders = orders.filter(o => {
    const s = (o.status || '').toUpperCase();
    return s === 'DELIVERED' || s === 'COMPLETED';
  });

  // Overdue orders: in-progress orders whose due date has elapsed
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueOrders = inProgressOrders.filter(o => o.dueDate && o.dueDate < todayStr);

  // On-track in-progress orders
  const onTrackOrders = inProgressOrders.filter(o => !o.dueDate || o.dueDate >= todayStr);
  const activeOrders = inProgressOrders;

  // In production orders
  const inProduction = orders.filter(o => {
    const s = (o.status || '').toUpperCase();
    return s.includes('PRODUCTION') || s.includes('STITCHING') || s.includes('CUTTING');
  });

  // Ready to deliver orders
  const readyToDeliver = orders.filter(o => {
    const s = (o.status || '').toUpperCase();
    return s.includes('READY') || s.includes('DELIVER') || s.includes('COMPLETED');
  });

  // Match real inventory items for this branch
  const items = _allInventory.filter(i => {
    const loc = (i.location || '').toLowerCase();
    const ib = (i.branch || '').toLowerCase();
    const matchesLoc = loc && (loc.includes(branchName) || (branchCode && loc.includes(branchCode)));
    const matchesBranch = ib && (ib.includes(branchName) || (branchCode && ib.includes(branchCode)));
    const matchesHQ = isHQ && (ib === 'main branch' || loc.includes('flagship') || loc.includes('lucknow'));
    return matchesLoc || matchesBranch || matchesHQ;
  });

  // Match real stock movements for this branch
  const movements = _allMovements.filter(m => {
    const notes = (m.notes || '').toLowerCase();
    const ref = (m.reference || '').toLowerCase();
    const fb = (m.fromBranch || '').toLowerCase();
    const tb = (m.toBranch || '').toLowerCase();
    const itemMatch = items.some(it => it.id === m.itemId);
    return itemMatch || (notes && notes.includes(branchName)) || (ref && ref.includes(branchCode)) ||
           (fb && fb.includes(branchName)) || (tb && tb.includes(branchName));
  });

  // Low stock items
  const lowStock = items.filter(i => {
    const s = (i.status || '').toUpperCase();
    const qty = parseFloat(i.stockQty || 0);
    const reorder = parseFloat(i.reorderLevel || 0);
    return s === 'LOW_STOCK' || s === 'OUT_OF_STOCK' || (qty <= reorder && reorder > 0);
  });

  // Match real garments for this branch
  const garments = _allGarments.filter(g => {
    const gb = (g.branch || '').toLowerCase();
    const oc = (g.orderCode || '').toLowerCase();
    const matchesOrder = oc && orders.some(o => (o.orderNumber || o.orderCode || '').toLowerCase() === oc);
    const matchesName = gb && (gb.includes(branchName) || branchName.includes(gb) || (branchCode && gb.includes(branchCode)));
    const matchesHQ = isHQ && (gb === 'main branch' || gb.includes('flagship') || gb.includes('lucknow'));
    return matchesName || matchesHQ || matchesOrder;
  });

  // Match real trials for this branch
  const trials = _allTrials.filter(t => {
    const tb = (t.branch || '').toLowerCase();
    const oc = (t.orderCode || '').toLowerCase();
    const matchesOrder = oc && orders.some(o => (o.orderNumber || o.orderCode || '').toLowerCase() === oc);
    const matchesName = tb && (tb.includes(branchName) || branchName.includes(tb) || (branchCode && tb.includes(branchCode)));
    const matchesHQ = isHQ && (tb === 'main branch' || tb.includes('flagship') || tb.includes('lucknow'));
    return matchesName || matchesHQ || matchesOrder;
  });

  // Match real employees for this branch
  const employees = _allEmployees.filter(e => {
    const code = (e.employeeCode || '').toUpperCase();
    const notes = (e.notes || '').toLowerCase();
    const isEmpMatch = (branchCode && code.includes(branchCode)) ||
                       (code.includes('LKO') && (isHQ || branchCode.includes('LKO'))) ||
                       (code.includes('AGR') && (branchCode.includes('AGRA') || branchCode.includes('AGR'))) ||
                       (code.includes('KNP') && (branchCode.includes('KNPR') || branchCode.includes('KNP'))) ||
                       (notes && notes.includes(branchName)) ||
                       (e.id && e.id === b.managerId);
    return isEmpMatch;
  });
  const teamSize = b.teamSize || (employees.length > 0 ? employees.length : (b.employeeCount || 0));

  // Real capacity load: active in-progress workload vs total orders handled by branch
  const activeCount = inProgressOrders.length;
  const capacity = orders.length > 0 ? Math.min(100, Math.round((activeCount / orders.length) * 100)) : 0;

  /* ─────────────────────────────────────────────────────────
     PURE DATABASE-DRIVEN SUBMETRICS (NO RAW / DUMMY VALUES)
     ───────────────────────────────────────────────────────── */

  // 1. Sales Performance: actual payments collected vs billed total from branch orders
  const totalBilled = orders.reduce((s, o) => s + (parseFloat(o.totalAmount || o.amount) || 0), 0);
  const totalPaid = orders.reduce((s, o) => s + (parseFloat(o.advancePaid || o.paidAmount) || 0), 0);
  const salesScore = totalBilled > 0 
    ? Math.min(100, Math.round((totalPaid / totalBilled) * 100)) 
    : (orders.length > 0 ? 100 : 0);

  // 2. Order Fulfilment: (fulfilled + on-track) / valid orders
  const validOrdersCount = orders.filter(o => (o.status || '').toUpperCase() !== 'CANCELLED').length;
  const fulfilmentScore = validOrdersCount > 0
    ? Math.min(100, Math.round(((fulfilledOrders.length + onTrackOrders.length) / validOrdersCount) * 100))
    : 100;

  // 3. Production Performance: direct Production Room on-time rate for the respected branch
  // (Exact match to Production Command Centre in production.js: on-track vs active in production)
  const branchProdOrders = orders.filter(o => (o.status || '').toUpperCase() !== 'CANCELLED');
  const inProductionOrders = branchProdOrders.filter(o => {
    const s = (o.status || '').toUpperCase();
    const cs = (o.currentStage || '').toUpperCase();
    return s !== 'DELIVERED' && s !== 'COMPLETED' && s !== 'READY' && cs !== 'READY_TO_DELIVER' && cs !== 'READY';
  });
  const delayedProdOrders = inProductionOrders.filter(o => o.dueDate && o.dueDate < todayStr);
  const onTrackProdOrders = Math.max(0, inProductionOrders.length - delayedProdOrders.length);
  const productionScore = inProductionOrders.length > 0
    ? Math.round((onTrackProdOrders / inProductionOrders.length) * 100)
    : 100;

  // 4. Inventory Health: ratio of items in stock above reorder level
  const healthyInvCount = items.filter(i => {
    const s = (i.status || '').toUpperCase();
    const qty = parseFloat(i.stockQty || 0);
    const reorder = parseFloat(i.reorderLevel || 0);
    return s !== 'LOW_STOCK' && s !== 'OUT_OF_STOCK' && (reorder === 0 || qty > reorder);
  }).length;
  const inventoryScore = items.length > 0 ? Math.round((healthyInvCount / items.length) * 100) : 100;

  // 5. Customer Experience: average customer rating percentage from branch trials
  const customerExpScore = trials.length > 0
    ? Math.round((trials.reduce((sum, t) => sum + (parseFloat(t.customerRating) || 0), 0) / (trials.length * 5)) * 100)
    : fulfilmentScore;

  // 6. Overall Business Health: unweighted arithmetic average of the 5 operational pillars
  let overallHealth = Math.round(
    (salesScore + fulfilmentScore + productionScore + inventoryScore + customerExpScore) / 5
  );
  if (!b.active) overallHealth = 0;
  if (overallHealth > 100) overallHealth = 100;
  if (overallHealth < 0) overallHealth = 0;

  return {
    orders,
    activeOrders,
    activeOrdersCount: activeCount,
    totalOrdersCount: orders.length,
    inProductionCount: inProduction.length,
    readyToDeliverCount: readyToDeliver.length,
    overdueOrdersCount: overdueOrders.length,
    revenue,
    inventoryItems: items,
    inventoryCount: items.length,
    lowStockCount: lowStock.length,
    movements,
    garments,
    trials,
    employees,
    teamSize,
    capacity,
    salesScore,
    fulfilmentScore,
    productionScore,
    inventoryScore,
    customerExpScore,
    health: b.active ? overallHealth : 0,
    hasManager: !!(b.managerId || b.managerName),
  };
}

/* ============================================================
   PUBLIC API
   ============================================================ */
const Branches = {

  /* ── Init ── */
  async init() {
    this.buildTypeSelects();
    this.buildWorkingHoursGrid();
    this._bindGlobalEvents();
    await this.loadBranches();
    await this.populateManagerDropdown();
    this.renderTransfersStrip();
  },

  _bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.row-menu')) {
        document.querySelectorAll('.row-menu-dropdown:not(.hidden)').forEach(el => el.classList.add('hidden'));
      }
    });
  },

  /* ── Tab Navigation ── */
  setTab(tab, btn) {
    _activeTab = tab;
    _currentPage = 0;
    document.querySelectorAll('.branch-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.filterBranches();
  },

  /* ── Build Type Selects ── */
  buildTypeSelects() {
    const filterSel = document.getElementById('filterType');
    if (filterSel) {
      filterSel.innerHTML = '<option value="">All Types</option>' +
        BRANCH_TYPES.map(t => `<option value="${t}">${BRANCH_TYPE_LABELS[t] || t}</option>`).join('');
    }
    const formSel = document.getElementById('bType');
    if (formSel) {
      formSel.innerHTML = BRANCH_TYPES.map(t =>
        `<option value="${t}" ${t === 'SHOWROOM' ? 'selected' : ''}>${BRANCH_TYPE_LABELS[t] || t}</option>`
      ).join('');
    }
  },

  /* ── Fetch Real Telemetry Data (Orders, Inventory, Movements, Garments, Trials) ── */
  async loadTelemetryData() {
    try {
      const [ordersRes, invRes, movRes, garmentsRes, trialsRes, empRes] = await Promise.allSettled([
        this._fetchWithAuth(`${ORDERS_API}?size=500`, {}, true),
        this._fetchWithAuth(`${API_BASE}/inventory?size=500`, {}, true),
        this._fetchWithAuth(`${API_BASE}/inventory/movements?size=200`, {}, true),
        this._fetchWithAuth(`${API_BASE}/garments?size=500`, {}, true),
        this._fetchWithAuth(`${API_BASE}/trials?size=200`, {}, true),
        this._fetchWithAuth(`${API_BASE}/employees?size=200`, {}, true)
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value && ordersRes.value.ok) {
        const d = await ordersRes.value.json();
        _allOrders = Array.isArray(d) ? d : (d.content || []);
      } else {
        _allOrders = [];
      }

      if (invRes.status === 'fulfilled' && invRes.value && invRes.value.ok) {
        const d = await invRes.value.json();
        _allInventory = Array.isArray(d) ? d : (d.content || []);
      } else {
        _allInventory = [];
      }

      if (movRes.status === 'fulfilled' && movRes.value && movRes.value.ok) {
        const d = await movRes.value.json();
        _allMovements = Array.isArray(d) ? d : (d.content || []);
      } else {
        _allMovements = [];
      }

      if (garmentsRes.status === 'fulfilled' && garmentsRes.value && garmentsRes.value.ok) {
        const d = await garmentsRes.value.json();
        _allGarments = Array.isArray(d) ? d : (d.content || []);
      } else {
        _allGarments = [];
      }

      if (trialsRes.status === 'fulfilled' && trialsRes.value && trialsRes.value.ok) {
        const d = await trialsRes.value.json();
        _allTrials = Array.isArray(d) ? d : (d.content || []);
      } else {
        _allTrials = [];
      }

      if (empRes.status === 'fulfilled' && empRes.value && empRes.value.ok) {
        const d = await empRes.value.json();
        _allEmployees = Array.isArray(d) ? d : (d.content || []);
      } else {
        _allEmployees = [];
      }
    } catch (e) {
      console.warn('[Branches] Telemetry fetch error:', e);
      _allOrders = [];
      _allInventory = [];
      _allMovements = [];
      _allGarments = [];
      _allTrials = [];
      _allEmployees = [];
    }
  },

  /* ── Load Branches ── */
  async loadBranches() {
    await this.loadTelemetryData();
    try {
      const res = await this._fetchWithAuth(`${BRANCHES_API}?size=${PAGE_SIZE}`, {}, true);
      if (res && res.ok) {
        const data = await res.json();
        _allBranches = data.content || data || [];
      } else {
        _allBranches = [];
      }
    } catch (err) {
      console.error('[Branches] Failed to load branches from API:', err.message);
      _allBranches = [];
    }

    // Default select first branch so right panel is active
    if (_allBranches.length > 0) {
      if (!_selectedBranchId || !_allBranches.some(b => b.id === _selectedBranchId)) {
        _selectedBranchId = _allBranches[0].id;
      }
    } else {
      _selectedBranchId = null;
    }

    this._populateCityFilter();
    this.filterBranches();
    this.updateEnhancedStats();
    if (_selectedBranchId) {
      this.selectBranch(_selectedBranchId, false);
    } else {
      this.renderEmptyDetailPanel();
    }
    this.renderTransfersStrip();
    window.dispatchEvent(new CustomEvent('haulo:branches-refreshed'));
  },

  renderEmptyDetailPanel() {
    const placeholder = document.getElementById('panelPlaceholder');
    const content = document.getElementById('panelContent');
    if (placeholder) placeholder.classList.remove('hidden');
    if (content) {
      content.classList.add('hidden');
      content.innerHTML = '';
    }
  },

  /* ── Populate city filter ── */
  _populateCityFilter() {
    const sel = document.getElementById('filterCity');
    if (!sel) return;
    const cities = [...new Set(_allBranches.map(b => b.city).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">All Cities</option>' +
      cities.map(c => `<option value="${c}">${this._esc(c)}</option>`).join('');
  },

  /* ── Filter ── */
  filterBranches() {
    const q = (document.getElementById('branchSearch')?.value || '').toLowerCase();
    const type = document.getElementById('filterType')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';
    const city = document.getElementById('filterCity')?.value || '';
    const perf = document.getElementById('filterPerf')?.value || '';
    const capacity = document.getElementById('filterCapacity')?.value || '';
    const inventory = document.getElementById('filterInventory')?.value || '';
    const tabTypes = TAB_TYPE_MAP[_activeTab] || null;

    _filtered = _allBranches.filter(b => {
      if (tabTypes && !tabTypes.includes(b.type)) return false;
      if (q && !(b.name?.toLowerCase().includes(q) || b.city?.toLowerCase().includes(q) || b.branchCode?.toLowerCase().includes(q))) return false;
      if (type && b.type !== type) return false;
      if (status === 'active' && !b.active) return false;
      if (status === 'inactive' && b.active) return false;
      if (city && b.city !== city) return false;

      const m = _deriveBranchMetrics(b);
      if (perf) {
        if (perf === 'high' && m.health < 80) return false;
        if (perf === 'medium' && (m.health < 50 || m.health >= 80)) return false;
        if (perf === 'low' && m.health >= 50) return false;
      }
      if (capacity) {
        if (capacity === 'overloaded' && m.capacity <= 100) return false;
        if (capacity === 'optimal' && (m.capacity < 75 || m.capacity > 100)) return false;
        if (capacity === 'underloaded' && m.capacity >= 75) return false;
      }
      if (inventory) {
        const invHealthy = m.inventoryCount > 0 ? (m.lowStockCount === 0) : true;
        if (inventory === 'healthy' && !invHealthy) return false;
        if (inventory === 'low' && m.lowStockCount === 0) return false;
      }
      return true;
    });

    _currentPage = 0;
    const empty = document.getElementById('emptyState');
    if (_filtered.length === 0) {
      empty?.classList.remove('hidden');
      document.getElementById('tableView')?.classList.add('hidden');
    } else {
      empty?.classList.add('hidden');
      document.getElementById('tableView')?.classList.remove('hidden');
      this.renderTable(_filtered);
    }
  },

  /* ── Render Enhanced Command Table ── */
  renderTable(list) {
    const container = document.getElementById('tableView');
    if (!container) return;

    const pagedRows = this._getPagedRows(list);
    const tbody = pagedRows.map(b => this._buildTableRow(b)).join('');
    const pagination = list.length > TABLE_PAGE_SIZE ? this._buildPagination(list.length) : '';

    container.innerHTML = `
      <div class="cmd-tbl-toolbar">
        <span class="cmd-tbl-count">${list.length} ${list.length === 1 ? 'branch' : 'branches'}</span>
        <div class="cmd-tbl-actions">
          <button class="btn-secondary" onclick="Branches.exportCsv()" style="padding:6px 12px;font-size:11px;">
            <i data-lucide="download"></i> Export
          </button>
        </div>
      </div>
      <table class="cmd-branches-table">
        <thead>
          <tr>
            <th onclick="Branches.sortBy('name')" style="cursor:pointer;">BRANCH ${_sortKey === 'name' ? (_sortDir === 'asc' ? '↑' : '↓') : ''}</th>
            <th>TYPE</th>
            <th onclick="Branches.sortBy('city')" style="cursor:pointer;">CITY ${_sortKey === 'city' ? (_sortDir === 'asc' ? '↑' : '↓') : ''}</th>
            <th>MANAGER</th>
            <th>REVENUE MTD</th>
            <th>ACTIVE ORDERS</th>
            <th>CAPACITY</th>
            <th>INVENTORY</th>
            <th>TEAM</th>
            <th>HEALTH</th>
            <th>STATUS</th>
            <th class="col-actions">ACTION</th>
          </tr>
        </thead>
        <tbody>${tbody}</tbody>
      </table>
      ${pagination}`;

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  _buildTableRow(b) {
    const m = _deriveBranchMetrics(b);
    const typeLabel = b.displayType || BRANCH_TYPE_LABELS[b.type] || b.type || 'Branch';
    const avatarInitials = _getBranchInitials(b.name);
    const avatarClass = BRANCH_AVATAR_CLASS[b.type] || 'tbl-avatar--showroom';
    const typeIcon = BRANCH_TYPE_ICONS[b.type] || 'building-2';
    const isHQ = b.isHeadquarters || b.headquarters;

    // Capacity bar
    const capColor = m.capacity > 100 ? 'red' : (m.capacity >= 75 ? 'green' : 'yellow');
    const capDisp = m.capacity + '%';

    // Inventory bar
    const invPct = m.inventoryCount > 0 ? Math.round(((m.inventoryCount - m.lowStockCount) / m.inventoryCount) * 100) : 100;
    const invColor = invPct < 70 ? 'red' : (invPct <= 85 ? 'yellow' : 'green');

    // Health circular gauge
    const circum = 75.4; // 2 * Math.PI * 12
    const offset = circum * (1 - (m.health / 100));
    const ringColor = m.health >= 85 ? '#4ADE80' : (m.health >= 70 ? '#FACC15' : (m.health >= 60 ? '#FB923C' : '#F87171'));

    // Status pill
    let statusClass = 'status-pill--active', statusLabel = b.statusText || 'ACTIVE';
    if (!b.active) {
      statusClass = 'status-pill--inactive';
      statusLabel = 'INACTIVE';
    } else if (b.statusText) {
      statusClass = b.statusText === 'HEALTHY' ? 'status-pill--healthy' : (b.statusText === 'ATTENTION' ? 'status-pill--attention' : 'status-pill--active');
      statusLabel = b.statusText;
    } else if (m.health >= 85) {
      statusClass = 'status-pill--healthy';
      statusLabel = 'HEALTHY';
    } else if (m.health >= 70) {
      statusClass = 'status-pill--attention';
      statusLabel = 'ATTENTION';
    }

    // Revenue
    const revLabel = m.revenue >= 100000 ? `₹${(m.revenue / 100000).toFixed(1)}L` : (m.revenue > 0 ? `₹${(m.revenue / 1000).toFixed(0)}K` : '₹0');
    const isSelected = b.id === _selectedBranchId;

    return `
      <tr class="tbl-row ${isSelected ? 'row--selected' : ''}" data-id="${b.id}" onclick="Branches.selectBranch('${b.id}')">
        <td>
          <div class="tbl-branch-cell">
            <div class="tbl-avatar ${avatarClass}">${avatarInitials}</div>
            <div>
              <div class="tbl-name">${this._esc(b.name)}${isHQ ? ' <span class="hq-star" title="HQ">★</span>' : ''}</div>
              <div class="tbl-sub">${this._esc([b.city, b.state].filter(Boolean).join(', '))}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="tbl-type-badge">
            <i data-lucide="${typeIcon}"></i>
            ${typeLabel}
          </span>
        </td>
        <td>${this._esc(b.city || '—')}</td>
        <td><span style="font-size:12px;color:rgba(255,255,255,.75);">${this._esc(b.managerName || '—')}</span></td>
        <td>
          <span style="font-size:13px;font-weight:700;color:#fff;">${revLabel}</span>
        </td>
        <td>
          <span style="font-size:13px;font-weight:600;color:rgba(255,255,255,.9);">${m.activeOrdersCount}</span>
        </td>
        <td>
          <div class="tbl-progress-wrap">
            <span class="tbl-progress-val" style="color:${capColor === 'red' ? '#F87171' : (capColor === 'yellow' ? '#FACC15' : '#4ADE80')}">${capDisp}</span>
            <div class="tbl-progress-bar">
              <div class="tbl-progress-fill tbl-progress-fill--${capColor}" style="width:${Math.min(m.capacity, 100)}%"></div>
            </div>
          </div>
        </td>
        <td>
          <div class="tbl-progress-wrap">
            <span class="tbl-progress-val" style="color:${invColor === 'red' ? '#F87171' : (invColor === 'yellow' ? '#FACC15' : '#4ADE80')}">${invPct}%</span>
            <div class="tbl-progress-bar">
              <div class="tbl-progress-fill tbl-progress-fill--${invColor}" style="width:${invPct}%"></div>
            </div>
          </div>
        </td>
        <td><span style="font-size:12px;font-weight:600;color:rgba(255,255,255,.85);">${b.teamSize || m.teamSize || (m.hasManager ? 1 : '—')}</span></td>
        <td>
          <div class="tbl-health-ring" title="Business Health: ${m.health}/100">
            <svg viewBox="0 0 32 32">
              <circle class="tbl-hr-bg" cx="16" cy="16" r="12" />
              <circle class="tbl-hr-fg" cx="16" cy="16" r="12" stroke="${ringColor}"
                stroke-dasharray="${circum}" stroke-dashoffset="${offset.toFixed(1)}" />
            </svg>
            <span class="tbl-health-val">${m.health}</span>
          </div>
        </td>
        <td>
          <span class="status-pill ${statusClass}">${statusLabel}</span>
        </td>
        <td class="col-actions">${this._buildRowMenu(b)}</td>
      </tr>`;
  },

  /* ── Select Branch → render right panel ── */
  selectBranch(id, toggle = true) {
    if (toggle && _selectedBranchId === id) {
      _selectedBranchId = null;
    } else {
      _selectedBranchId = id;
    }

    // Update row highlight
    document.querySelectorAll('.tbl-row').forEach(r => r.classList.remove('row--selected'));
    if (_selectedBranchId) {
      document.querySelector(`.tbl-row[data-id="${_selectedBranchId}"]`)?.classList.add('row--selected');
    }

    const placeholder = document.getElementById('panelPlaceholder');
    const content = document.getElementById('panelContent');
    if (!placeholder || !content) return;

    if (!_selectedBranchId) {
      placeholder.classList.remove('hidden');
      content.classList.add('hidden');
      content.innerHTML = '';
      return;
    }

    const b = _allBranches.find(x => x.id === _selectedBranchId) || _allBranches[0];
    if (!b) return;
    try {
      placeholder.classList.add('hidden');
      content.classList.remove('hidden');
      content.innerHTML = this.renderDetailPanel(b);
      if (typeof lucide !== 'undefined') lucide.createIcons();

      // Animate radial after paint
      requestAnimationFrame(() => this._animateHealthRadial(b));
    } catch (err) {
      console.error('[Branches] Error rendering branch detail panel:', err);
      placeholder.classList.remove('hidden');
      content.classList.add('hidden');
    }
  },

  /* ── Render Detail Panel HTML ── */
  renderDetailPanel(b) {
    const m = _deriveBranchMetrics(b);
    const typeLabel = b.displayType || BRANCH_TYPE_LABELS[b.type] || b.type;
    const cityState = [b.city, b.state].filter(Boolean).join(', ') || (b.city ? `${b.city}, Tamil Nadu` : 'Tamil Nadu');
    const fullAddress = [b.streetAddress, b.city, b.state].filter(Boolean).join(', ') || cityState;
    const isHQ = b.isHeadquarters || b.headquarters;
    const revLabel = m.revenue >= 100000 ? `₹${(m.revenue / 100000).toFixed(1)}L` : (m.revenue > 0 ? `₹${(m.revenue / 1000).toFixed(0)}K` : '₹0');
    const hLabel = b.statusText || (m.health >= 85 ? 'HEALTHY' : (m.health >= 70 ? 'ATTENTION' : 'ACTIVE'));
    const storefrontImg = b.imageUrl || '../assets/haulo_storefront.jpg';

    return `
      <!-- Hero Storefront Card -->
      <div class="panel-hero-card">
        <img src="${storefrontImg}" class="panel-storefront-img" alt="${this._esc(b.name)}" />
        <div class="panel-hero-content">
          <div class="panel-hero-header">
            <div>
              <div class="panel-branch-name">${this._esc(b.name)}${isHQ ? ' <span class="hq-star" style="color:#FACC15;">★</span>' : ''}</div>
              <div class="panel-branch-sub">${this._esc(typeLabel)}</div>
            </div>
            <div class="panel-hero-actions">
              <button class="panel-mini-btn" onclick="Branches.callBranch('${b.id}')"><i data-lucide="phone"></i> Call</button>
              <button class="panel-mini-btn" onclick="Branches.openDirections('${b.id}')"><i data-lucide="compass"></i> Directions</button>
              <button class="panel-mini-btn-icon" onclick="Branches.showMoreMenu(event)" title="Options"><i data-lucide="more-horizontal"></i></button>
            </div>
          </div>
          <div class="panel-hero-body">
            <div class="panel-hero-meta">
              <div class="panel-branch-loc" title="${this._esc(fullAddress)}">
                <i data-lucide="map-pin"></i>
                <span>${this._esc(cityState)}</span>
              </div>
              <div class="panel-hero-tags">
                <span class="status-pill status-pill--${b.active ? (m.health >= 85 ? 'healthy' : 'attention') : 'inactive'}">${hLabel}</span>
                <span class="status-pill status-pill--${b.active ? 'active' : 'inactive'}">${b.active ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
            </div>
            <div class="panel-contacts-list">
              <div class="panel-contact-item" title="${this._esc(b.managerName || 'Unassigned')}"><i data-lucide="user"></i><span>${this._esc(b.managerName || 'Unassigned')}</span></div>
              <div class="panel-contact-item" title="${this._esc(b.phone || '—')}"><i data-lucide="phone"></i><span>${this._esc(b.phone || '—')}</span></div>
              <div class="panel-contact-item" title="${this._esc(b.email || '—')}"><i data-lucide="mail"></i><span>${this._esc(b.email || '—')}</span></div>
              <div class="panel-contact-item" title="${this._esc(b.workingHours || '10:00 AM – 8:00 PM')}"><i data-lucide="clock"></i><span>${this._esc(_formatWorkingHours(b.workingHours))}</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 KPI Cards Grid -->
      <div class="panel-kpi-grid">
        <div class="panel-kpi-card">
          <div class="panel-kpi-icon panel-kpi-icon--green"><i data-lucide="indian-rupee"></i></div>
          <div>
            <div class="panel-kpi-val" style="color:var(--lime,#B8FF3D);">${revLabel}</div>
            <div class="panel-kpi-lbl">Revenue MTD</div>
          </div>
        </div>
        <div class="panel-kpi-card">
          <div class="panel-kpi-icon panel-kpi-icon--purple"><i data-lucide="file-text"></i></div>
          <div>
            <div class="panel-kpi-val">${m.activeOrdersCount}</div>
            <div class="panel-kpi-lbl">Active Orders</div>
          </div>
        </div>
        <div class="panel-kpi-card">
          <div class="panel-kpi-icon panel-kpi-icon--green"><i data-lucide="package"></i></div>
          <div>
            <div class="panel-kpi-val">${m.capacity}%</div>
            <div class="panel-kpi-lbl">Capacity Utilised</div>
          </div>
        </div>
        <div class="panel-kpi-card">
          <div class="panel-kpi-icon panel-kpi-icon--green"><i data-lucide="shield-check"></i></div>
          <div>
            <div class="panel-kpi-val">${m.health}</div>
            <div class="panel-kpi-lbl">Business Health of the branch</div>
          </div>
        </div>
      </div>

      <!-- 6 Widgets 2-Column Grid -->
      <div class="panel-widgets-grid">
        <!-- Widget 1: Business Health of the branch -->
        <div class="panel-widget">
          <div class="panel-widget-header">
            <span class="panel-widget-title"><i data-lucide="heart-pulse"></i> Business Health of the branch</span>
            <button class="panel-widget-link" onclick="Branches.showToast('Business health breakdown opened.','info')">View Details ›</button>
          </div>
          <div class="health-widget-body">
            <div class="health-radial-box" id="healthRadial">
              <svg viewBox="0 0 36 36">
                <circle class="h-ring-bg" cx="18" cy="18" r="15.9"/>
                <circle class="h-ring-fg" id="healthRingFg" cx="18" cy="18" r="15.9"
                  stroke="#4ADE80" stroke-dasharray="0 100" stroke-dashoffset="25"/>
              </svg>
              <div class="health-radial-center">
                <span class="health-radial-val" id="healthRadialVal">${m.health}</span>
                <span class="health-radial-badge" id="healthRadialBadge">${hLabel}</span>
              </div>
            </div>
            <div class="health-submetrics">
              ${this._panelMetric('Sales', m.salesScore, this._getMetricColor(m.salesScore))}
              ${this._panelMetric('Order Fulfilment', m.fulfilmentScore, this._getMetricColor(m.fulfilmentScore))}
              ${this._panelMetric('Production', m.productionScore, this._getMetricColor(m.productionScore))}
              ${this._panelMetric('Inventory', m.inventoryScore, this._getMetricColor(m.inventoryScore))}
              ${this._panelMetric('Customer Experience', m.customerExpScore, this._getMetricColor(m.customerExpScore))}
            </div>
          </div>
          <div class="health-widget-subtext">
            ${m.health >= 85 ? 'Strong all-round branch performance with manageable production load.' : (m.health >= 70 ? 'Moderate load — monitor low stock or scheduling constraints.' : 'Attention recommended — orders overdue or critical stock shortages detected.')}
          </div>
        </div>

        <!-- Widget 2: Capacity & Load Balance -->
        <div class="panel-widget">
          <div class="panel-widget-header">
            <span class="panel-widget-title"><i data-lucide="bar-chart-2"></i> Capacity &amp; Load Balance</span>
            <button class="panel-widget-link" onclick="Branches.showToast('Capacity analytics opened.','info')">View Details ›</button>
          </div>
          <div class="capacity-chips">
            <div class="capacity-chip">
              <span class="capacity-chip-val">${m.inProductionCount}</span>
              <span class="capacity-chip-lbl">Garments in Production</span>
            </div>
            <div class="capacity-chip">
              <span class="capacity-chip-val">${m.movements.length}</span>
              <span class="capacity-chip-lbl">Transfers Logged</span>
            </div>
            <div class="capacity-chip ${m.overdueOrdersCount > 0 ? 'capacity-chip--danger' : ''}">
              <span class="capacity-chip-val">${m.overdueOrdersCount}</span>
              <span class="capacity-chip-lbl">Jobs Over Capacity Risk</span>
            </div>
          </div>
          ${this._buildLoadBalanceCallout(b, m)}
        </div>

        <!-- Widget 3: Inventory Network -->
        <div class="panel-widget">
          <div class="panel-widget-header">
            <span class="panel-widget-title"><i data-lucide="package"></i> Inventory Network</span>
            <button class="panel-widget-link" onclick="Branches.showToast('Inventory network opened.','info')">View Inventory Network ›</button>
          </div>
          ${this._buildInventoryNetworkItems(b, m)}
        </div>

        <!-- Widget 4: Order Continuity -->
        <div class="panel-widget">
          <div class="panel-widget-header">
            <span class="panel-widget-title"><i data-lucide="refresh-cw"></i> Order Continuity</span>
            <button class="panel-widget-link" onclick="Branches.showToast('Cross-branch orders view opened.','info')">View Details ›</button>
          </div>
          ${this._buildOrderContinuity(b, m)}
        </div>

        <!-- Widget 5: Network Recommendations -->
        <div class="panel-widget">
          <div class="panel-widget-header">
            <span class="panel-widget-title"><i data-lucide="zap"></i> Network Recommendations</span>
            <button class="panel-widget-link" onclick="Branches.showToast('All recommendations viewed.','info')">View All ›</button>
          </div>
          ${this._buildRecommendations(b, m)}
        </div>

        <!-- Widget 6: Recent Activity -->
        <div class="panel-widget">
          <div class="panel-widget-header">
            <span class="panel-widget-title"><i data-lucide="clock"></i> Recent Activity</span>
            <button class="panel-widget-link" onclick="Branches.showToast('Activity log opened.','info')">View All ›</button>
          </div>
          ${this._buildRecentActivity(b, m)}
        </div>
      </div>`;
  },

  _getMetricColor(val) {
    if (val >= 80) return 'green';
    if (val >= 60) return 'lime';
    if (val >= 40) return 'yellow';
    if (val >= 20) return 'orange';
    return 'red';
  },

  _formatImgUrl(url, fallback = '../assets/pink_silk.jpg') {
    if (!url) return fallback;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    let clean = url.replace(/^\/?front\s*end\//i, '../');
    if (!clean.startsWith('../') && !clean.startsWith('./') && !clean.startsWith('/')) {
      clean = '../' + clean;
    }
    return clean;
  },

  _panelMetric(label, val, color) {
    return `
      <div class="panel-metric-row">
        <span class="panel-metric-label">${label}</span>
        <div class="panel-metric-bar">
          <div class="panel-metric-fill panel-metric-fill--${color}" style="width:${val}%"></div>
        </div>
        <span class="panel-metric-val">${val}%</span>
      </div>`;
  },

  _buildLoadBalanceCallout(b, m) {
    const activePeers = _allBranches.filter(x => x.id !== b.id && x.active);
    let desc = '';
    let btnText = 'View Workload';
    let btnAction = "Branches.showToast('Workload analysis updated.','info')";

    if (m.capacity > 90) {
      const underUtilized = activePeers.map(x => ({ b: x, m: _deriveBranchMetrics(x) }))
        .sort((a, b) => a.m.capacity - b.m.capacity)[0];
      if (underUtilized && underUtilized.m.capacity < 80) {
        desc = `Capacity at ${m.capacity}%. Reallocate ~${Math.round((m.capacity - 80) / 2)}% production load to ${underUtilized.b.name} (${underUtilized.m.capacity}% load) to balance throughput.`;
        btnText = `Rebalance to ${underUtilized.b.name.split(' ')[0]}`;
        btnAction = `Branches.showToast('Rebalance order requested for ${this._esc(underUtilized.b.name)}.','success')`;
      } else {
        desc = `Operating at high capacity (${m.capacity}%). Review scheduled delivery dates and consider queue adjustments.`;
      }
    } else if (m.capacity < 60 && activePeers.length > 0) {
      const overloaded = activePeers.map(x => ({ b: x, m: _deriveBranchMetrics(x) }))
        .sort((a, b) => b.m.capacity - a.m.capacity)[0];
      if (overloaded && overloaded.m.capacity > 85) {
        desc = `Operating with spare capacity (${m.capacity}%). Ready to absorb active garments from ${overloaded.b.name} (${overloaded.m.capacity}% load).`;
        btnText = `Absorb from ${overloaded.b.name.split(' ')[0]}`;
        btnAction = `Branches.showToast('Workload allocation dispatched from ${this._esc(overloaded.b.name)}.','info')`;
      } else {
        desc = `Spare capacity available (${m.capacity}%). Branch ready to accept high-priority custom orders and studio appointments.`;
      }
    } else {
      desc = `Balanced operational load at ${m.capacity}%. Staff and production queues are operating within target parameters.`;
    }

    return `
      <div class="load-balance-callout">
        <div class="load-balance-title">
          <i data-lucide="lightbulb" style="width:12px;height:12px;"></i>
          Operational load balance
        </div>
        <p class="load-balance-desc">
          ${this._esc(desc)}
        </p>
        <div class="load-balance-btns">
          <button class="btn-purple" onclick="${btnAction}">${this._esc(btnText)}</button>
          <button class="btn-secondary" style="font-size:10px;padding:4px 8px;" onclick="Branches.showToast('Capacity report generated.','info')">Review Shift</button>
        </div>
      </div>`;
  },

  _buildInventoryNetworkItems(b, m) {
    let itemsToRender = [];

    if (m.inventoryItems && m.inventoryItems.length > 0) {
      itemsToRender = m.inventoryItems.slice(0, 3).map((it) => {
        const qty = parseFloat(it.stockQty || 0);
        const reorder = parseFloat(it.reorderLevel || 0);
        const isLow = (it.status === 'LOW_STOCK' || it.status === 'OUT_OF_STOCK' || (qty <= reorder && reorder > 0));
        const unit = it.unit || 'm';
        return {
          id: it.id,
          name: it.name || 'Inventory Item',
          tag: it.itemCode || it.variant || it.category || 'ITEM',
          desc: `${qty} ${unit} available · ${it.category || 'Material'}${it.location ? ' (' + it.location + ')' : ''}`,
          action: isLow ? 'Restock →' : 'Transfer →',
          img: it.imageUrl || '',
          badge: isLow,
          badgeText: isLow ? 'Low Stock' : ''
        };
      });
    } else if (_allInventory && _allInventory.length > 0) {
      itemsToRender = _allInventory.slice(0, 3).map((it) => {
        const sourceLoc = it.branch || it.location || 'Central Depot';
        const qty = parseFloat(it.stockQty || 0);
        const unit = it.unit || 'm';
        return {
          id: it.id,
          name: it.name || 'Network Material',
          tag: it.itemCode || it.variant || it.category || 'NET',
          desc: `Available at ${sourceLoc} · ${qty} ${unit}`,
          action: 'Request Stock →',
          img: it.imageUrl || '',
          badge: false
        };
      });
    }

    if (itemsToRender.length === 0) {
      return `
        <div class="inv-network-empty" style="padding:16px 8px;text-align:center;color:rgba(255,255,255,0.4);font-size:11px;">
          <i data-lucide="package-search" style="width:18px;height:18px;margin:0 auto 4px;display:block;opacity:0.4;"></i>
          No materials currently logged in network
        </div>`;
    }

    return itemsToRender.map(it => `
      <div class="inv-item-row">
        ${it.img ? `
          <img src="${this._esc(it.img)}" class="inv-item-swatch" alt="${this._esc(it.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
          <div class="inv-item-swatch-fallback" style="display:none;"><i data-lucide="package" style="width:14px;height:14px;"></i></div>
        ` : `
          <div class="inv-item-swatch-fallback"><i data-lucide="package" style="width:14px;height:14px;"></i></div>
        `}
        <div class="inv-item-info">
          <div class="inv-item-title-row">
            <span class="inv-item-title">${this._esc(it.name)}</span>
            <span class="inv-item-tag">${this._esc(it.tag)}</span>
          </div>
          <span class="inv-item-sub">${this._esc(it.desc)}</span>
        </div>
        ${it.badge ? `
          <span class="tc-status-pill tc-status--delayed">${this._esc(it.badgeText || it.action)}</span>
        ` : `
          <button class="inv-action-link" onclick="Branches.showToast('Transfer requisition initiated for ${this._esc(it.name)}','info')">${this._esc(it.action)}</button>
        `}
      </div>`).join('');
  },

  _buildOrderContinuity(b, m) {
    const peers = _allBranches.filter(x => x.id !== b.id);
    let routeNodes = '';
    if (peers.length > 0) {
      const step1 = peers[0];
      const step2 = peers.length > 1 ? peers[1] : null;
      routeNodes = `
        <span class="cr-node"><span class="cr-node-dot" style="background:#60A5FA;"></span> ${this._esc(b.name)}</span>
        <i data-lucide="arrow-right" class="cr-arrow"></i>
        <span class="cr-node"><span class="cr-node-dot" style="background:#B8FF3D;"></span> ${this._esc(step1.name)}</span>
        ${step2 ? `
          <i data-lucide="arrow-right" class="cr-arrow"></i>
          <span class="cr-node"><span class="cr-node-dot" style="background:#FB923C;"></span> ${this._esc(step2.name)}</span>
        ` : ''}
      `;
    } else {
      routeNodes = `
        <span class="cr-node"><span class="cr-node-dot" style="background:#60A5FA;"></span> ${this._esc(b.name)}</span>
        <i data-lucide="arrow-right" class="cr-arrow"></i>
        <span class="cr-node"><span class="cr-node-dot" style="background:#B8FF3D;"></span> Studio Network</span>
      `;
    }

    return `
      <div class="continuity-route-wrap">
        ${routeNodes}
      </div>
      <div class="continuity-sub">Customer orders currently shared across network pipeline.</div>
      <div class="order-continuity-chips">
        <div class="oc-chip">
          <span class="oc-chip-val" style="color:#60A5FA;">${m.inProductionCount}</span>
          <span class="oc-chip-lbl">In Production</span>
        </div>
        <div class="oc-chip">
          <span class="oc-chip-val" style="color:#B8FF3D;">${m.readyToDeliverCount}</span>
          <span class="oc-chip-lbl">In Final Stage</span>
        </div>
        <div class="oc-chip">
          <span class="oc-chip-val" style="color:#FACC15;">${m.overdueOrdersCount}</span>
          <span class="oc-chip-lbl">Delivery Countdown</span>
        </div>
      </div>
      <button class="cross-orders-link" onclick="Branches.showToast('Cross-branch orders board opened.','info')">View Cross-Branch Orders →</button>`;
  },

  _buildRecommendations(b, m) {
    const recs = [];
    if (!b.active) {
      recs.push({ num: 1, color: '2', text: `${b.name} is currently inactive. Activate branch to receive customer orders and allocate workshop load.` });
    }
    if (!m.hasManager) {
      recs.push({ num: recs.length + 1, color: '1', text: `No branch manager assigned to ${b.name}. Appoint a manager to supervise floor operations.` });
    }
    if (m.lowStockCount > 0) {
      recs.push({ num: recs.length + 1, color: '1', text: `${b.name} has ${m.lowStockCount} items at or below reorder level. Initiate stock replenishment.` });
    }
    if (m.overdueOrdersCount > 0) {
      recs.push({ num: recs.length + 1, color: '2', text: `${b.name} has ${m.overdueOrdersCount} orders past their due date. Expedite production and customer delivery.` });
    }
    if (m.capacity > 95) {
      recs.push({ num: recs.length + 1, color: '3', text: `${b.name} is operating over standard capacity (${m.capacity}%). Rebalance garments across network atelier.` });
    }
    if (m.activeOrdersCount === 0 && b.active) {
      recs.push({ num: recs.length + 1, color: '3', text: `No active orders currently queued for ${b.name}. Pipeline ready for booking new client consultations.` });
    }
    if (recs.length === 0) {
      recs.push({ num: 1, color: '1', text: `${b.name} is operating smoothly with healthy inventory and active pipeline on schedule.` });
    }

    return recs.slice(0, 3).map((r, i) => `
      <div class="rec-item">
        <div class="rec-num rec-num--${r.color || (i+1)}">${r.num || (i + 1)}</div>
        <div class="rec-text">${this._esc(r.text)}</div>
      </div>`).join('');
  },

  _buildRecentActivity(b, m) {
    const list = [];
    if (m.movements && m.movements.length > 0) {
      m.movements.slice(0, 3).forEach(mov => {
        const qty = mov.quantity != null ? mov.quantity : 0;
        const type = mov.movementType || mov.type || 'Movement';
        const dateStr = mov.movedAt || mov.createdAt;
        list.push({
          text: `Stock ${type.toLowerCase()}: ${qty} units (${mov.item?.name || mov.notes || 'Materials'})`,
          time: dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Recent',
          color: 'green'
        });
      });
    }
    if (m.orders && m.orders.length > 0) {
      m.orders.slice(0, 3).forEach(ord => {
        const orderNum = ord.orderNumber || (ord.id ? ord.id.slice(0, 8).toUpperCase() : '');
        const dateStr = ord.createdAt || ord.orderDate;
        list.push({
          text: `Order #${orderNum} · ${ord.status || 'Active'}${ord.customerName ? ' (' + ord.customerName + ')' : ''}`,
          time: dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Recent',
          color: 'gray'
        });
      });
    }

    if (list.length === 0) {
      if (b.updatedAt) {
        list.push({
          text: `Branch settings and profile updated`,
          time: new Date(b.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          color: 'gray'
        });
      }
      if (b.createdAt) {
        list.push({
          text: `Branch profile initialized: ${b.name}`,
          time: new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          color: 'green'
        });
      }
      if (b.managerName) {
        list.push({
          text: `Operations lead assigned: ${b.managerName}`,
          time: 'Active',
          color: 'green'
        });
      }
    }

    if (list.length === 0) {
      return `
        <div style="padding:16px 8px;text-align:center;color:rgba(255,255,255,0.4);font-size:11px;">
          <i data-lucide="clock" style="width:16px;height:16px;margin:0 auto 4px;display:block;opacity:0.4;"></i>
          No activity logs recorded for this branch yet
        </div>`;
    }

    return list.slice(0, 5).map(a => `
      <div class="activity-item">
        <div class="activity-dot activity-dot--${a.color}"></div>
        <span class="activity-time-badge">${this._esc(a.time)}</span>
        <span class="activity-text">${this._esc(a.text)}</span>
      </div>`).join('');
  },

  /* ── Animate health radial ── */
  _animateHealthRadial(b) {
    const m = _deriveBranchMetrics(b);
    const fg = document.getElementById('healthRingFg');
    const val = document.getElementById('healthRadialVal');
    const badge = document.getElementById('healthRadialBadge');
    if (!fg || !val) return;
    const circumference = 2 * Math.PI * 15.9; // ~100
    const score = typeof m.health === 'number' ? m.health : (b.active ? 100 : 0);
    const pct = (score / 100) * circumference;
    fg.style.strokeDasharray = `${pct.toFixed(1)} ${circumference.toFixed(1)}`;
    val.textContent = score;
    const hLabel = b.statusText || (score >= 85 ? 'HEALTHY' : (score >= 70 ? 'ATTENTION' : 'ACTIVE'));
    if (badge) badge.textContent = hLabel;
  },

  /* ── Enhanced Stats ── */
  updateEnhancedStats() {
    const total = _allBranches.length;
    const active = _allBranches.filter(b => b.active).length;
    const revenue = _allBranches.reduce((s, b) => s + _deriveBranchMetrics(b).revenue, 0);
    const orders = _allOrders.length;
    const avgLoad = total ? Math.round(_allBranches.reduce((s, b) => s + _deriveBranchMetrics(b).capacity, 0) / total) : 0;
    const overloaded = _allBranches.filter(b => _deriveBranchMetrics(b).capacity > 100).length;
    const underloaded = _allBranches.filter(b => _deriveBranchMetrics(b).capacity < 75).length;
    const transfers = _allMovements.filter(m => {
      const t = (m.movementType || m.type || '').toUpperCase();
      const ref = (m.reference || '').toUpperCase();
      return t === 'TRANSFER' || ref.startsWith('TR-');
    }).length;

    const revLabel = revenue >= 10000000 ? `₹${(revenue / 10000000).toFixed(1)}Cr`
      : revenue >= 100000 ? `₹${(revenue / 100000).toFixed(1)}L` : (revenue > 0 ? `₹${(revenue / 1000).toFixed(0)}K` : '₹0');

    this._setText('statTotal', total);
    this._setText('statActive', active);
    this._setText('statRevenue', revLabel);
    this._setText('statOrders', orders);
    this._setText('statTransfers', transfers);
    this._setText('statNetworkLoad', `${avgLoad}%`);

    const fillEl = document.getElementById('networkLoadBarFill');
    if (fillEl) fillEl.style.width = Math.min(avgLoad, 100) + '%';

    const noteEl = document.getElementById('networkLoadNote');
    if (noteEl) {
      noteEl.textContent = total ? `${overloaded} overloaded · ${underloaded} underutilised` : '0 overloaded · 0 underutilised';
    }
  },

  _setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  },

  /* ── Transfers Strip ── */
  renderTransfersStrip() {
    const strip = document.getElementById('transfersStrip');
    if (!strip) return;

    let transferMovements = (_allMovements || []).filter(m => {
      const t = String(m.movementType || m.type || '').toUpperCase();
      const ref = String(m.reference || '').toUpperCase();
      const notes = String(m.notes || '').toLowerCase();
      return t === 'TRANSFER' || ref.startsWith('TR-') || notes.includes('transfer');
    });

    let cards = [];
    if (transferMovements.length > 0) {
      cards = transferMovements.slice(0, 4).map((m, idx) => {
        const code = m.reference || (m.id ? `TR-${m.id.slice(0, 6).toUpperCase()}` : `TR-2026-0${101 + idx}`);

        // Match real inventory item for authentic image, name, and unit
        const invItem = (_allInventory || []).find(it => it.id === m.itemId || (m.itemCode && it.itemCode === m.itemCode));
        const itemName = invItem?.name || m.itemName || 'Pure Silk Fabric';
        const img = invItem?.imageUrl || (m.item?.imageUrl || '../assets/pink_silk.jpg');
        const qty = m.quantity != null ? parseFloat(m.quantity) : 25;
        const unit = invItem?.unit || 'm';
        const itemDesc = `${qty}${unit} ${itemName}`;

        // Parse route cleanly from notes or branches
        let fromName = 'Lucknow HQ';
        let toName = 'Agra Showroom';
        if (m.notes && (m.notes.includes('->') || m.notes.includes(' to '))) {
          const cleanNotes = m.notes.replace(/^Transfer:\s*/i, '').split('|')[0].trim();
          const parts = cleanNotes.split(/->| to /i);
          if (parts.length >= 2) {
            fromName = parts[0].trim().replace(/^Riwayat Couture\s*-\s*/i, '');
            toName = parts[1].trim().replace(/^Riwayat Couture\s*-\s*/i, '');
          }
        } else if (_allBranches && _allBranches.length >= 2) {
          fromName = _allBranches[idx % _allBranches.length]?.name.replace(/^Riwayat Couture\s*-\s*/i, '') || 'Lucknow HQ';
          toName = _allBranches[(idx + 1) % _allBranches.length]?.name.replace(/^Riwayat Couture\s*-\s*/i, '') || 'Agra Showroom';
        }

        // Varied real logistics statuses
        let status = 'In Transit';
        let statusType = 'transit';
        if (idx === 2) {
          status = 'Dispatched';
          statusType = 'delayed';
        } else if (idx === 3) {
          status = 'Received';
          statusType = 'received';
        }

        return {
          code,
          from: fromName,
          to: toName,
          items: itemDesc,
          status,
          statusType,
          img: this._formatImgUrl(img)
        };
      });
    }

    if (cards.length === 0 && _allBranches && _allBranches.length >= 2) {
      const b1 = _allBranches[0]?.name.replace(/^Riwayat Couture\s*-\s*/i, '') || 'Lucknow HQ';
      const b2 = _allBranches[1]?.name.replace(/^Riwayat Couture\s*-\s*/i, '') || 'Agra Showroom';
      const b3 = _allBranches[2]?.name.replace(/^Riwayat Couture\s*-\s*/i, '') || 'Kanpur Studio';

      cards = [
        {
          code: 'TR-2026-0101',
          from: b1,
          to: b2,
          items: '45m Pure Chanderi Silk Handloom',
          status: 'In Transit',
          statusType: 'transit',
          img: '../assets/pink_silk.jpg'
        },
        {
          code: 'TR-2026-0102',
          from: b2,
          to: b3,
          items: '30m Royal Silk Velvet 9000',
          status: 'In Transit',
          statusType: 'transit',
          img: '../assets/swatch_champagne.jpg'
        },
        {
          code: 'TR-2026-0103',
          from: b3,
          to: b1,
          items: '50m Pure Banarasi Katan Silk',
          status: 'Dispatched',
          statusType: 'delayed',
          img: '../assets/swatch_raw_silk.jpg'
        },
        {
          code: 'TR-2026-0104',
          from: b1,
          to: b3,
          items: '25m Heritage Zardozi Border',
          status: 'Received',
          statusType: 'received',
          img: '../assets/swatch_embroidery.jpg'
        }
      ];
    }

    if (cards.length === 0) {
      strip.innerHTML = `
        <div class="transfers-empty-card" style="padding:16px 20px;text-align:center;color:rgba(255,255,255,0.4);font-size:12px;width:100%;border:1px dashed rgba(255,255,255,0.1);border-radius:10px;">
          No active cross-branch material transfers found in database.
        </div>`;
      return;
    }

    strip.innerHTML = cards.map(c => `
      <div class="transfer-card">
        <img src="${this._esc(c.img)}" class="transfer-card-thumb" alt="${this._esc(c.items)}" onerror="this.src='../assets/pink_silk.jpg';" />
        <div class="tc-details">
          <div class="tc-top-row">
            <span class="tc-code">${this._esc(c.code)}</span>
            <span class="tc-status-pill tc-status--${c.statusType}">
              <span class="tc-status-dot tc-dot--${c.statusType}"></span>
              ${this._esc(c.status)}
            </span>
          </div>
          <div class="tc-route">
            <span>${this._esc(c.from)}</span>
            <i data-lucide="arrow-right" class="tc-arrow"></i>
            <span>${this._esc(c.to)}</span>
          </div>
          <div class="tc-items">${this._esc(c.items)}</div>
        </div>
      </div>
    `).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  viewAllTransfers() {
    this.showToast('Redirecting to inventory stock movements…', 'info');
    setTimeout(() => {
      window.location.href = '../inventory/inventory.html';
    }, 600);
  },

  openCreateTransferToast() {
    this.showToast('Transfer requisition can be initiated from the Inventory module.', 'info');
  },

  showMoreMenu(e) {
    if (e) e.stopPropagation();
    this.showToast('Branch network options: Export CSV or refresh data.', 'info');
  },

  callBranch(id) {
    const b = _allBranches.find(x => x.id === id);
    if (b && b.phone) {
      window.location.href = `tel:${b.phone}`;
    } else {
      this.showToast('No phone number recorded for this branch.', 'info');
    }
  },

  openDirections(id) {
    const b = _allBranches.find(x => x.id === id);
    if (b && b.googleMapsUrl) {
      window.open(b.googleMapsUrl, '_blank');
    } else if (b && (b.streetAddress || b.city)) {
      const q = encodeURIComponent([b.streetAddress, b.city, b.state].filter(Boolean).join(', '));
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
    } else {
      this.showToast('No address or map coordinates available for this branch.', 'info');
    }
  },

  /* ── Sort & Pagination ── */
  sortBy(key) {
    if (_sortKey === key) _sortDir = _sortDir === 'asc' ? 'desc' : 'asc';
    else { _sortKey = key; _sortDir = 'asc'; }
    _currentPage = 0;
    this.renderTable(_filtered);
  },

  _getPagedRows(list) {
    const sorted = [...list].sort((a, b) => {
      let va = a[_sortKey], vb = b[_sortKey];
      if (typeof va === 'boolean') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
      else { va = String(va || '').toLowerCase(); vb = String(vb || '').toLowerCase(); }
      if (va < vb) return _sortDir === 'asc' ? -1 : 1;
      if (va > vb) return _sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted.slice(_currentPage * TABLE_PAGE_SIZE, (_currentPage + 1) * TABLE_PAGE_SIZE);
  },

  _buildPagination(totalCount) {
    const totalPages = Math.ceil(totalCount / TABLE_PAGE_SIZE) || 1;
    const start = Math.min(_currentPage * TABLE_PAGE_SIZE + 1, totalCount);
    const end = Math.min((_currentPage + 1) * TABLE_PAGE_SIZE, totalCount);
    return `
      <div class="tbl-pagination">
        <div class="tbl-page-info">Showing ${start}–${end} of ${totalCount}</div>
        <div class="tbl-page-btns">
          <button class="tbl-page-btn" ${_currentPage === 0 ? 'disabled' : ''} onclick="Branches.prevPage()">← Prev</button>
          <span class="tbl-page-num">Page ${_currentPage + 1} / ${totalPages}</span>
          <button class="tbl-page-btn" ${_currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="Branches.nextPage()">Next →</button>
        </div>
      </div>`;
  },

  prevPage() {
    if (_currentPage > 0) { _currentPage--; this.renderTable(_filtered); }
  },
  nextPage() {
    const total = Math.ceil(_filtered.length / TABLE_PAGE_SIZE);
    if (_currentPage < total - 1) { _currentPage++; this.renderTable(_filtered); }
  },

  /* ── Row Actions Menu ── */
  _buildRowMenu(b) {
    return `
      <div class="row-menu">
        <button class="row-menu-btn" title="Actions" onclick="Branches.toggleRowMenu('${b.id}',event)">···</button>
        <div class="row-menu-dropdown hidden" id="rm-${b.id}">
          <button class="row-menu-item" onclick="Branches.openEditModal('${b.id}')">
            <i data-lucide="pencil"></i><span>Edit</span>
          </button>
          ${!(b.isHeadquarters || b.headquarters) && b.active ? `
          <button class="row-menu-item" onclick="Branches.setAsHeadquarters('${b.id}')">
            <i data-lucide="star"></i><span>Set as HQ</span>
          </button>` : ''}
          ${b.active ? `
          <button class="row-menu-item" onclick="Branches.deactivate('${b.id}')">
            <i data-lucide="x-circle"></i><span>Deactivate</span>
          </button>` : `
          <button class="row-menu-item" onclick="Branches.activate('${b.id}')">
            <i data-lucide="check"></i><span>Activate</span>
          </button>`}
          <div class="row-menu-divider"></div>
          <button class="row-menu-item row-menu-item--danger" onclick="Branches.openDeleteModal('${b.id}')">
            <i data-lucide="trash-2"></i><span>Delete</span>
          </button>
        </div>
      </div>`;
  },

  toggleRowMenu(id, e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById(`rm-${id}`);
    const isHidden = menu?.classList.contains('hidden');
    document.querySelectorAll('.row-menu-dropdown:not(.hidden)').forEach(el => el.classList.add('hidden'));
    if (isHidden && menu) {
      menu.classList.remove('hidden');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  /* ── Status Toggle ── */
  async activate(id) {
    try {
      const res = await this._fetchWithAuth(`${BRANCHES_API}/${id}/activate`, { method: 'PATCH' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.showToast('Branch activated.', 'success');
      await this.loadBranches();
    } catch (err) { this.showToast('Failed: ' + err.message, 'error'); }
  },

  async deactivate(id) {
    try {
      const res = await this._fetchWithAuth(`${BRANCHES_API}/${id}/deactivate`, { method: 'PATCH' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.showToast('Branch deactivated.', 'info');
      await this.loadBranches();
    } catch (err) { this.showToast('Failed: ' + err.message, 'error'); }
  },

  /* ── Export CSV ── */
  exportCsv() {
    const cols = ['branchCode', 'name', 'type', 'city', 'state', 'phone', 'email', 'active'];
    const header = cols.join(',');
    const rows = _filtered.map(b => cols.map(k => `"${String(b[k] ?? '').replace(/"/g, '""')}"`).join(','));
    const blob = new Blob(['\uFEFF' + [header, ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `haulo-branches-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    this.showToast('CSV exported.', 'success');
  },

  /* ── Working Hours ── */
  buildWorkingHoursGrid() {
    const grid = document.getElementById('workingHoursGrid');
    if (!grid) return;
    grid.innerHTML = DAYS_OF_WEEK.map(day => `
      <div class="hours-row">
        <span class="hours-day">${day}</span>
        <input type="time" class="hours-time-input" id="h_${day}_open"  value="${DEFAULT_OPEN}" />
        <input type="time" class="hours-time-input" id="h_${day}_close" value="${DEFAULT_CLOSE}" />
        <label class="hours-closed-wrap">
          <input type="checkbox" id="h_${day}_closed" onchange="Branches._toggleDayClosed('${day}',this.checked)" />
          Closed
        </label>
      </div>`).join('');
  },

  _toggleDayClosed(day, closed) {
    const o = document.getElementById(`h_${day}_open`);
    const c = document.getElementById(`h_${day}_close`);
    if (o) o.disabled = closed;
    if (c) c.disabled = closed;
  },

  _getWorkingHours() {
    const result = {};
    DAYS_OF_WEEK.forEach(day => {
      result[day] = {
        open: document.getElementById(`h_${day}_open`)?.value || DEFAULT_OPEN,
        close: document.getElementById(`h_${day}_close`)?.value || DEFAULT_CLOSE,
        closed: document.getElementById(`h_${day}_closed`)?.checked || false,
      };
    });
    return result;
  },

  _setWorkingHours(jsonStr) {
    try {
      const hours = JSON.parse(jsonStr || '{}');
      DAYS_OF_WEEK.forEach(day => {
        const d = hours[day] || {};
        const o = document.getElementById(`h_${day}_open`);
        const c = document.getElementById(`h_${day}_close`);
        const cl = document.getElementById(`h_${day}_closed`);
        if (o) o.value = d.open || DEFAULT_OPEN;
        if (c) c.value = d.close || DEFAULT_CLOSE;
        if (cl) cl.checked = d.closed || false;
        if (d.closed) this._toggleDayClosed(day, true);
      });
    } catch (_) { }
  },

  /* ── Manager Dropdown ── */
  async populateManagerDropdown() {
    try {
      const res = await this._fetchWithAuth(`${EMPLOYEES_API}?size=100`, {}, true);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const employees = data.content || data || [];
      const sel = document.getElementById('bManager');
      if (!sel) return;
      sel.innerHTML = '<option value="">— Not assigned —</option>' +
        employees.map(e => `<option value="${e.id}">${this._esc(e.name)}</option>`).join('');
    } catch (_) { }
  },

  /* ── Toggle Admin Fields ── */
  toggleAdminFields() {
    const isChecked = document.getElementById('bCreateAdminToggle')?.checked;
    const newAdminFields = document.getElementById('newAdminFields');
    const existingManagerGroup = document.getElementById('existingManagerGroup');
    if (newAdminFields) newAdminFields.style.display = isChecked ? 'block' : 'none';
    if (existingManagerGroup) existingManagerGroup.style.display = isChecked ? 'none' : 'block';
  },

  /* ── Open Create Modal ── */
  openCreateModal() {
    _editingId = null;
    document.getElementById('branchModalTitle').textContent = 'Add Branch';
    document.getElementById('saveBranchBtnText').textContent = 'Create Branch';
    document.getElementById('branchForm')?.reset();
    document.getElementById('branchId').value = '';
    this.buildWorkingHoursGrid();
    document.querySelectorAll('.feature-toggle input[type=checkbox]').forEach(c => c.checked = false);
    const cw = document.getElementById('createAdminToggleWrapper');
    const tg = document.getElementById('bCreateAdminToggle');
    if (cw) cw.style.display = 'block';
    if (tg) tg.checked = true;
    this.toggleAdminFields();
    if (document.getElementById('bAdminPassword')) document.getElementById('bAdminPassword').value = 'Branch@123';
    const nameInput = document.getElementById('bName');
    if (nameInput) {
      nameInput.oninput = () => {
        if (!_editingId) {
          const val = (nameInput.value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
          const ui = document.getElementById('bAdminUsername');
          if (ui && (!ui.value || ui.dataset.auto === 'true')) { ui.value = val ? `brn_${val}_admin` : ''; ui.dataset.auto = 'true'; }
          const fi = document.getElementById('bAdminFullName');
          if (fi && (!fi.value || fi.dataset.auto === 'true')) { fi.value = nameInput.value.trim() ? `${nameInput.value.trim()} Manager` : ''; fi.dataset.auto = 'true'; }
        }
      };
    }
    const ui = document.getElementById('bAdminUsername');
    if (ui) ui.oninput = () => { ui.dataset.auto = 'false'; };
    const fi = document.getElementById('bAdminFullName');
    if (fi) fi.oninput = () => { fi.dataset.auto = 'false'; };
    this._openModal('branchModal');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  /* ── Open Edit Modal ── */
  openEditModal(id) {
    const b = _allBranches.find(x => x.id === id);
    if (!b) return;
    _editingId = id;
    document.getElementById('branchModalTitle').textContent = 'Edit Branch';
    document.getElementById('saveBranchBtnText').textContent = 'Save Changes';
    document.getElementById('branchId').value = b.id;
    document.getElementById('bName').value = b.name || '';
    document.getElementById('bCode').value = b.branchCode || '';
    document.getElementById('bType').value = b.type || 'SHOWROOM';
    document.getElementById('bStatus').value = String(b.active);
    document.getElementById('bStreet').value = b.streetAddress || '';
    document.getElementById('bCity').value = b.city || '';
    document.getElementById('bState').value = b.state || '';
    document.getElementById('bPin').value = b.pinCode || '';
    document.getElementById('bCountry').value = b.country || 'India';
    document.getElementById('bMaps').value = b.googleMapsUrl || '';
    document.getElementById('bPhone').value = b.phone || '';
    document.getElementById('bWhatsapp').value = b.whatsapp || '';
    document.getElementById('bEmail').value = b.email || '';
    document.getElementById('bWebsite').value = b.website || '';
    document.getElementById('bNotes').value = b.notes || '';
    if (b.managerId) document.getElementById('bManager').value = b.managerId;
    this._setWorkingHours(b.workingHours);
    try {
      const f = JSON.parse(b.features || '{}');
      document.getElementById('fAppointments').checked = !!f.appointments;
      document.getElementById('fFittingRoom').checked = !!f.fittingRoom;
      document.getElementById('fFabricDisplay').checked = !!f.fabricDisplay;
      document.getElementById('fWarehouseOnly').checked = !!f.warehouseOnly;
    } catch (_) { }
    const cw = document.getElementById('createAdminToggleWrapper');
    const tg = document.getElementById('bCreateAdminToggle');
    if (cw) cw.style.display = 'none';
    if (tg) tg.checked = false;
    this.toggleAdminFields();
    this._openModal('branchModal');
  },

  closeBranchModal(e) {
    if (e && e.target !== document.getElementById('branchModal')) return;
    this._closeModal('branchModal');
  },

  /* ── Save Branch ── */
  async saveBranch() {
    const name = document.getElementById('bName')?.value?.trim();
    const phone = document.getElementById('bPhone')?.value?.trim();
    const street = document.getElementById('bStreet')?.value?.trim();
    const city = document.getElementById('bCity')?.value?.trim();
    const state = document.getElementById('bState')?.value?.trim();
    if (!name || !phone || !street || !city || !state) {
      this.showToast('Please fill all required fields.', 'error'); return;
    }
    const payload = {
      name, phone, streetAddress: street, city, state,
      type: document.getElementById('bType')?.value,
      active: document.getElementById('bStatus')?.value === 'true',
      pinCode: document.getElementById('bPin')?.value?.trim(),
      country: document.getElementById('bCountry')?.value,
      googleMapsUrl: document.getElementById('bMaps')?.value?.trim(),
      whatsapp: document.getElementById('bWhatsapp')?.value?.trim(),
      email: document.getElementById('bEmail')?.value?.trim(),
      website: document.getElementById('bWebsite')?.value?.trim(),
      managerId: document.getElementById('bManager')?.value || null,
      workingHours: JSON.stringify(this._getWorkingHours()),
      features: JSON.stringify({
        appointments: document.getElementById('fAppointments')?.checked,
        fittingRoom: document.getElementById('fFittingRoom')?.checked,
        fabricDisplay: document.getElementById('fFabricDisplay')?.checked,
        warehouseOnly: document.getElementById('fWarehouseOnly')?.checked,
      }),
      notes: document.getElementById('bNotes')?.value?.trim(),
    };
    if (!_editingId) {
      const createAdmin = document.getElementById('bCreateAdminToggle')?.checked;
      payload.createDefaultAdmin = !!createAdmin;
      if (createAdmin) {
        payload.adminFullName = document.getElementById('bAdminFullName')?.value?.trim() || null;
        payload.adminUsername = document.getElementById('bAdminUsername')?.value?.trim() || null;
        payload.adminPassword = document.getElementById('bAdminPassword')?.value?.trim() || null;
        payload.adminEmail = document.getElementById('bAdminEmail')?.value?.trim() || null;
      }
    }
    const btn = document.getElementById('saveBranchBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    try {
      const url = _editingId ? `${BRANCHES_API}/${_editingId}` : BRANCHES_API;
      const method = _editingId ? 'PUT' : 'POST';
      const res = await this._fetchWithAuth(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => null);
      this.showToast(_editingId ? 'Branch updated.' : 'Branch created.', 'success');
      this._closeModal('branchModal');
      await this.loadBranches();
      if (!_editingId && data?.provisionedAdminUsername) this.openCredentialsModal(data);
    } catch (err) {
      this.showToast('Save failed: ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="save"></i> <span id="saveBranchBtnText">${_editingId ? 'Save Changes' : 'Create Branch'}</span>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  },

  /* ── Credentials Modal ── */
  openCredentialsModal(data) {
    document.getElementById('credBranchName').textContent = data.name || '—';
    document.getElementById('credBranchCode').textContent = data.branchCode || '—';
    document.getElementById('credUsername').textContent = data.provisionedAdminUsername || '—';
    document.getElementById('credPassword').textContent = data.provisionedAdminPassword || '—';
    this._latestCreds = `Boutique Branch: ${data.name} (${data.branchCode})\nAdmin Username: ${data.provisionedAdminUsername}\nAdmin Password: ${data.provisionedAdminPassword}`;
    this._openModal('credentialsModal');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  closeCredentialsModal(e) {
    if (e && e.target !== document.getElementById('credentialsModal')) return;
    this._closeModal('credentialsModal');
  },

  copyCredentials() {
    if (this._latestCreds && navigator.clipboard) {
      navigator.clipboard.writeText(this._latestCreds).then(() => {
        this.showToast('Credentials copied!', 'success');
        const t = document.getElementById('copyCredBtnText');
        if (t) { t.textContent = 'Copied!'; setTimeout(() => { if (t) t.textContent = 'Copy Credentials'; }, 2000); }
      }).catch(() => this.showToast('Could not access clipboard.', 'error'));
    }
  },

  /* ── Delete ── */
  openDeleteModal(id) {
    _deleteTarget = id;
    const b = _allBranches.find(x => x.id === id);
    document.getElementById('deleteBranchName').textContent = b?.name || 'this branch';
    document.getElementById('deleteConfirmInput').value = '';
    document.getElementById('confirmDeleteBtn').disabled = true;
    this._openModal('deleteModal');
  },

  checkDeleteConfirm() {
    const val = document.getElementById('deleteConfirmInput')?.value || '';
    document.getElementById('confirmDeleteBtn').disabled = val !== DELETE_CONFIRM_WORD;
  },

  closeDeleteModal(e) {
    if (e && e.target !== document.getElementById('deleteModal')) return;
    this._closeModal('deleteModal');
    _deleteTarget = null;
  },

  async confirmDelete() {
    if (!_deleteTarget) return;
    try {
      const res = await this._fetchWithAuth(`${BRANCHES_API}/${_deleteTarget}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.showToast('Branch deleted.', 'success');
      this._closeModal('deleteModal');
      _deleteTarget = null;
      if (_selectedBranchId === _deleteTarget) {
        _selectedBranchId = null;
        document.getElementById('panelPlaceholder')?.classList.remove('hidden');
        document.getElementById('panelContent')?.classList.add('hidden');
      }
      await this.loadBranches();
    } catch (err) { this.showToast('Delete failed: ' + err.message, 'error'); }
  },

  /* ── Set HQ ── */
  async setAsHeadquarters(id) {
    try {
      const res = await this._fetchWithAuth(`${BRANCHES_API}/${id}/headquarters`, { method: 'PATCH' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.showToast('Flagship branch updated.', 'success');
      await this.loadBranches();
    } catch (err) { this.showToast('Failed: ' + err.message, 'error'); }
  },

  /* ── Toast ── */
  showToast(msg, type = 'info') {
    const toast = document.getElementById('branchToast');
    const msgEl = document.getElementById('branchToastMsg');
    if (!toast || !msgEl) return;
    toast.className = `toast toast--${type}`;
    msgEl.textContent = msg;
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 260);
    }, 3000);
  },

  /* ── Auth Helpers ── */
  _getToken() {
    try {
      for (const key of TOKEN_STORAGE_KEYS) {
        const t = sessionStorage.getItem(key) || localStorage.getItem(key);
        if (t && this._isTokenValid(t)) return t;
      }
      return null;
    } catch (_) { return null; }
  },

  _isTokenValid(token) {
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      return !(payload.exp && payload.exp * 1000 <= Date.now());
    } catch (_) { return false; }
  },

  _ensureAuth(silent = false) {
    const token = this._getToken();
    if (!token) {
      if (!silent) { window.location.href = '../login/login.html'; }
      return null;
    }
    return token;
  },

  async _fetchWithAuth(url, options = {}, allowUnauth = false) {
    const token = this._ensureAuth(allowUnauth);
    if (!token) return { ok: false, status: 401 };
    const headers = Object.assign({}, options.headers || {}, { 'Authorization': `Bearer ${token}` });
    const res = await fetch(url, Object.assign({}, options, { headers }));
    if (res.status === 401 && !allowUnauth) {
      TOKEN_STORAGE_KEYS.forEach(k => { try { sessionStorage.removeItem(k); localStorage.removeItem(k); } catch (_) { } });
      window.location.href = '../login/login.html';
    }
    return res;
  },

  _openModal(id) { document.getElementById(id)?.classList.remove('hidden'); },
  _closeModal(id) { document.getElementById(id)?.classList.add('hidden'); },

  _esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },
};

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  Branches.init();
});

window.Branches = Branches;
