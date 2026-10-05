/* ============================================================
   HAULO BOUTIQUE ERP — Branches Controller
   Path: front end/branches/branches.js
   ============================================================ */

'use strict';

/* ── Constants (no raw values elsewhere) ── */
const API_BASE            = 'http://localhost:8080/api/v1';
const BRANCHES_API        = `${API_BASE}/branches`;
const EMPLOYEES_API       = `${API_BASE}/employees`;
const PAGE_SIZE           = 50;
const VIEW_KEY            = 'branches_view';
const DELETE_CONFIRM_WORD = 'DELETE';
const TOKEN_STORAGE_KEYS  = ['erp_token', 'haulo_token', 'fashion_erp_token'];

const BRANCH_TYPES = ['FLAGSHIP', 'SHOWROOM', 'WAREHOUSE', 'POPUP'];
const BRANCH_TYPE_LABELS = {
  FLAGSHIP:  'Flagship',
  SHOWROOM:  'Showroom',
  WAREHOUSE: 'Warehouse',
  POPUP:     'Pop-up',
};
const BRANCH_TYPE_BADGE_CLASS = {
  FLAGSHIP:  'badge--flagship',
  SHOWROOM:  'badge--showroom',
  WAREHOUSE: 'badge--warehouse',
  POPUP:     'badge--popup',
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_OPEN  = '10:00';
const DEFAULT_CLOSE = '20:00';

/* ── Table Configuration Constants ── */
const TABLE_PAGE_SIZE = 15;

const TABLE_COLUMNS = [
  { key: 'name',       label: 'Branch',    sortable: true,  visible: true  },
  { key: 'branchCode', label: 'Code',      sortable: true,  visible: true  },
  { key: 'type',       label: 'Type',      sortable: true,  visible: true  },
  { key: 'city',       label: 'Location',  sortable: true,  visible: true  },
  { key: 'phone',      label: 'Contact',   sortable: false, visible: true  },
  { key: 'hours',      label: 'Hours',     sortable: false, visible: false },
  { key: 'features',   label: 'Features',  sortable: false, visible: false },
  { key: 'hq',         label: 'HQ',        sortable: false, visible: true  },
  { key: 'active',     label: 'Status',    sortable: true,  visible: true  },
  { key: 'actions',    label: 'Actions',   sortable: false, visible: true  },
];

const TABLE_SORT_DIRECTIONS = { ASC: 'asc', DESC: 'desc' };
const EMPTY_CELL_PLACEHOLDER = '—';
const CSV_FILENAME_PREFIX    = 'haulo-branches';
const CSV_EXPORT_COLUMNS     = ['branchCode', 'name', 'type', 'city', 'state', 'phone', 'email', 'active'];
const COL_VISIBILITY_KEY     = 'branches_col_visibility';

const ROW_ACTIONS = [
  { id: 'edit',       label: 'Edit',          icon: 'pencil',   handler: 'openEditModal' },
  { id: 'set-hq',     label: 'Set as HQ',     icon: 'star',     handler: 'setAsHeadquarters', showWhen: b => !(b.isHeadquarters || b.headquarters) },
  { id: 'activate',   label: 'Activate',      icon: 'check',    handler: 'activate',          showWhen: b => !b.active },
  { id: 'deactivate', label: 'Deactivate',    icon: 'x-circle', handler: 'deactivate',        showWhen: b => b.active  },
  { id: 'divider' },
  { id: 'delete',     label: 'Delete',        icon: 'trash-2',  handler: 'openDeleteModal',   danger: true },
];

/* ── State ── */
let _allBranches  = [];
let _filtered     = [];
let _editingId    = null;
let _deleteTarget = null;
let _sortKey      = 'name';
let _sortDir      = TABLE_SORT_DIRECTIONS.ASC;
let _currentPage  = 0;

/* ============================================================
   PUBLIC API
   ============================================================ */
const Branches = {

  /* ── Init ── */
  async init() {
    const saved = localStorage.getItem(VIEW_KEY) || 'cards';
    this.switchView(saved, document.getElementById(saved === 'table' ? 'viewBtnTable' : 'viewBtnCards'), false);
    this._initColumnVisibility();
    this.buildTypeSelects();
    this.buildWorkingHoursGrid();
    this._bindGlobalEvents();
    await this.loadBranches();
    await this.populateManagerDropdown();
  },

  /* ── Initialize Column Visibility from Storage ── */
  _initColumnVisibility() {
    try {
      const saved = localStorage.getItem(COL_VISIBILITY_KEY);
      if (saved) {
        const vis = JSON.parse(saved);
        TABLE_COLUMNS.forEach(col => {
          if (typeof vis[col.key] === 'boolean' && col.key !== 'actions') {
            col.visible = vis[col.key];
          }
        });
      }
    } catch (_) {}
  },

  /* ── Bind Outside Click Events ── */
  _bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.row-menu')) {
        document.querySelectorAll('.row-menu-dropdown:not(.hidden)').forEach(el => el.classList.add('hidden'));
      }
      if (!e.target.closest('.col-picker-wrap')) {
        const picker = document.getElementById('colPicker');
        if (picker && !picker.classList.contains('hidden')) {
          picker.classList.add('hidden');
        }
      }
    });
  },

  /* ── Populate Dynamic Type Selects (Filter & Form) ── */
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

  /* ── Load Branches ── */
  async loadBranches() {
    try {
      const res = await this._fetchWithAuth(`${BRANCHES_API}?size=${PAGE_SIZE}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      _allBranches = data.content || data || [];
    } catch (err) {
      console.error('[Branches] Failed to load branches from server:', err.message);
      _allBranches = [];
      this.showToast('Could not load branches from server: ' + err.message, 'error');
    }
    this.filterBranches();
    this.updateStats();
    window.dispatchEvent(new CustomEvent('haulo:branches-refreshed'));
  },

  /* ── Filter ── */
  filterBranches() {
    const q      = (document.getElementById('branchSearch')?.value || '').toLowerCase();
    const type   = document.getElementById('filterType')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';

    _filtered = _allBranches.filter(b => {
      const matchQ = !q || (b.name && b.name.toLowerCase().includes(q)) || (b.city && b.city.toLowerCase().includes(q));
      const matchT = !type   || b.type === type;
      const matchS = !status || (status === 'active' ? b.active : !b.active);
      return matchQ && matchT && matchS;
    });

    _currentPage = 0;

    const empty = document.getElementById('emptyState');
    if (_filtered.length === 0) {
      empty?.classList.remove('hidden');
      document.getElementById('cardsView')?.classList.add('hidden');
      document.getElementById('tableView')?.classList.add('hidden');
    } else {
      empty?.classList.add('hidden');
      const view = localStorage.getItem(VIEW_KEY) || 'cards';
      if (view === 'cards') {
        document.getElementById('cardsView')?.classList.remove('hidden');
        document.getElementById('tableView')?.classList.add('hidden');
      } else {
        document.getElementById('tableView')?.classList.remove('hidden');
        document.getElementById('cardsView')?.classList.add('hidden');
      }
      this.renderCards(_filtered);
      this.renderTable(_filtered);
    }
  },

  /* ── Render Cards ── */
  renderCards(list) {
    const grid = document.getElementById('branchesGrid');
    if (!grid) return;
    grid.innerHTML = list.map(b => this._buildCard(b)).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  _buildCard(b) {
    const badgeClass = BRANCH_TYPE_BADGE_CLASS[b.type] || 'badge--showroom';
    const typeLabel  = BRANCH_TYPE_LABELS[b.type] || b.type;
    const dotClass   = b.active ? 'branch-status-dot--active' : 'branch-status-dot--inactive';
    const location   = [b.city, b.state].filter(Boolean).join(', ');
    const hours      = this._formatHoursSummary(b.workingHours);

    return `
      <div class="branch-card" id="card-${b.id}">
        <div class="branch-card-header">
          <div class="badge-row">
            <span class="branch-type-badge ${badgeClass}">${typeLabel}</span>
            ${(b.isHeadquarters || b.headquarters) ? '<span class="branch-type-badge badge--flagship badge--flagship-hq">&#9733; HQ</span>' : ''}
          </div>
          <div class="branch-status-dot ${dotClass}" title="${b.active ? 'Active' : 'Inactive'}"></div>
        </div>
        <div class="branch-name">${this._esc(b.name)}</div>
        <div class="branch-code">${this._esc(b.branchCode)}</div>
        <div class="branch-details">
          ${location ? `<div class="branch-detail-row"><i data-lucide="map-pin"></i><span>${this._esc(location)}</span></div>` : ''}
          ${b.phone ? `<div class="branch-detail-row"><i data-lucide="phone"></i><span>${this._esc(b.phone)}</span></div>` : ''}
          ${b.email ? `<div class="branch-detail-row"><i data-lucide="mail"></i><span>${this._esc(b.email)}</span></div>` : ''}
          ${hours  ? `<div class="branch-detail-row"><i data-lucide="clock"></i><span>${hours}</span></div>` : ''}
        </div>
        <div class="branch-card-actions">
          <button class="branch-action-btn branch-action-btn--primary" onclick="Branches.openEditModal('${b.id}')">
            <i data-lucide="pencil"></i> Edit
          </button>
          <button class="branch-action-btn" onclick="Branches.openDeleteModal('${b.id}')">
            <i data-lucide="trash-2"></i> Delete
          </button>
          ${!(b.isHeadquarters || b.headquarters) && b.active ? `<button class="branch-action-btn" onclick="Branches.setAsHeadquarters('${b.id}')" title="Set as flagship">
            <i data-lucide="star"></i>
          </button>` : ''}
        </div>
      </div>`;
  },

  /* ── Render Enhanced Data Table ── */
  renderTable(list) {
    const container = document.getElementById('tableView');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="tbl-toolbar">
          <span class="tbl-count">0 branches</span>
          <div class="tbl-toolbar-right">
            ${this._buildColumnPicker()}
          </div>
        </div>
        <div class="table-card">
          <table class="branches-table">
            <thead><tr>${this._buildTableHeader()}</tr></thead>
            <tbody>
              <tr>
                <td colspan="${TABLE_COLUMNS.filter(c => c.visible).length}" class="tbl-empty-cell">
                  No branches match your filter criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    const pagedRows = this._getPagedRows(list);
    const thead = this._buildTableHeader();
    const tbody = pagedRows.map(b => this._buildTableRow(b)).join('');
    const pagination = this._buildPagination(list.length);

    container.innerHTML = `
      <div class="tbl-toolbar">
        <span class="tbl-count">${list.length} ${list.length === 1 ? 'branch' : 'branches'}</span>
        <div class="tbl-toolbar-right">
          ${this._buildColumnPicker()}
          <button class="btn-secondary" onclick="Branches.exportCsv()">
            <i data-lucide="download"></i> Export CSV
          </button>
        </div>
      </div>
      <div class="table-card">
        <table class="branches-table">
          <thead><tr>${thead}</tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
      ${pagination}`;

    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  /* ── Build Sortable Table Header ── */
  _buildTableHeader() {
    return TABLE_COLUMNS
      .filter(col => col.visible)
      .map(col => {
        if (col.key === 'actions') {
          return `<th class="tbl-th col-actions">${col.label}</th>`;
        }
        const active = _sortKey === col.key;
        const dirCls = active ? `tbl-th--${_sortDir}` : '';
        const sortCls = col.sortable ? 'tbl-th--sortable' : '';
        const onclick = col.sortable ? `onclick="Branches.sortBy('${col.key}')"` : '';
        return `<th class="tbl-th ${sortCls} ${dirCls}" ${onclick}>
          ${col.label}
          ${col.sortable ? '<span class="sort-arrow"></span>' : ''}
        </th>`;
      }).join('');
  },

  /* ── Build Table Row ── */
  _buildTableRow(b) {
    const cells = TABLE_COLUMNS
      .filter(col => col.visible)
      .map(col => {
        switch (col.key) {
          case 'name':
            return `<td>
              <div class="tbl-name">${this._esc(b.name)}</div>
              <div class="tbl-sub">${this._esc([b.city, b.state].filter(Boolean).join(', '))}</div>
            </td>`;
          case 'branchCode':
            return `<td><span class="tbl-code">${this._esc(b.branchCode)}</span></td>`;
          case 'type': {
            const badgeClass = BRANCH_TYPE_BADGE_CLASS[b.type] || 'badge--showroom';
            const typeLabel  = BRANCH_TYPE_LABELS[b.type] || b.type;
            return `<td><span class="branch-type-badge ${badgeClass}">${typeLabel}</span></td>`;
          }
          case 'city':
            return `<td>${this._esc(b.city || EMPTY_CELL_PLACEHOLDER)}</td>`;
          case 'phone':
            return `<td>${this._esc(b.phone || EMPTY_CELL_PLACEHOLDER)}</td>`;
          case 'hours':
            return `<td>${this._formatHoursSummary(b.workingHours) || EMPTY_CELL_PLACEHOLDER}</td>`;
          case 'features':
            return `<td>${this._buildFeaturePips(b.features)}</td>`;
          case 'hq':
            return `<td>${(b.isHeadquarters || b.headquarters) ? '<span class="hq-star" title="Headquarters">&#9733;</span>' : EMPTY_CELL_PLACEHOLDER}</td>`;
          case 'active': {
            const activeClass = b.active ? 'status-toggle--active' : 'status-toggle--inactive';
            const label = b.active ? 'Active' : 'Inactive';
            return `<td>
              <button class="status-toggle ${activeClass}" onclick="Branches.toggleStatus('${b.id}', event)">
                <span class="branch-status-dot ${b.active ? 'branch-status-dot--active' : 'branch-status-dot--inactive'} status-dot-inline"></span>
                ${label}
              </button>
            </td>`;
          }
          case 'actions':
            return `<td class="col-actions">${this._buildRowMenu(b)}</td>`;
          default:
            return `<td>${EMPTY_CELL_PLACEHOLDER}</td>`;
        }
      }).join('');

    return `<tr class="tbl-row" data-id="${b.id}">${cells}</tr>`;
  },

  /* ── Build Feature Pips ── */
  _buildFeaturePips(featuresJson) {
    try {
      const f = JSON.parse(featuresJson || '{}');
      const pips = [];
      if (f.appointments)  pips.push('<span class="feature-pip" title="Appointments">Appts</span>');
      if (f.fittingRoom)   pips.push('<span class="feature-pip" title="Fitting Room">Fitting</span>');
      if (f.fabricDisplay) pips.push('<span class="feature-pip" title="Fabric Display">Fabric</span>');
      if (f.warehouseOnly) pips.push('<span class="feature-pip" title="Warehouse Only">Whs</span>');
      return pips.length ? `<div class="feature-pips">${pips.join('')}</div>` : EMPTY_CELL_PLACEHOLDER;
    } catch (_) {
      return EMPTY_CELL_PLACEHOLDER;
    }
  },

  /* ── Build Row Actions Menu ── */
  _buildRowMenu(b) {
    const items = ROW_ACTIONS
      .filter(a => !a.showWhen || a.showWhen(b))
      .map(a => {
        if (a.id === 'divider') return `<div class="row-menu-divider"></div>`;
        const dangerCls = a.danger ? 'row-menu-item--danger' : '';
        return `<button class="row-menu-item ${dangerCls}" onclick="Branches.${a.handler}('${b.id}')">
          <i data-lucide="${a.icon}"></i>
          <span>${a.label}</span>
        </button>`;
      }).join('');

    return `<div class="row-menu">
      <button class="row-menu-btn" title="Actions" onclick="Branches.toggleRowMenu('${b.id}', event)">···</button>
      <div class="row-menu-dropdown hidden" id="rm-${b.id}">${items}</div>
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

  /* ── Column Picker ── */
  _buildColumnPicker() {
    const items = TABLE_COLUMNS
      .filter(c => c.key !== 'actions')
      .map(c =>
        `<label class="col-picker-item">
          <input type="checkbox" ${c.visible ? 'checked' : ''} onchange="Branches.toggleColumn('${c.key}')" />
          <span>${c.label}</span>
        </label>`
      ).join('');

    return `<div class="col-picker-wrap">
      <button class="btn-secondary" onclick="Branches.toggleColPicker(event)">
        <i data-lucide="columns"></i> Columns
      </button>
      <div class="col-picker-dropdown hidden" id="colPicker">${items}</div>
    </div>`;
  },

  toggleColPicker(e) {
    if (e) e.stopPropagation();
    const picker = document.getElementById('colPicker');
    picker?.classList.toggle('hidden');
  },

  toggleColumn(key) {
    const col = TABLE_COLUMNS.find(c => c.key === key);
    if (col) {
      col.visible = !col.visible;
      const vis = {};
      TABLE_COLUMNS.forEach(c => { vis[c.key] = c.visible; });
      localStorage.setItem(COL_VISIBILITY_KEY, JSON.stringify(vis));
      this.renderTable(_filtered);
    }
  },

  /* ── Sort & Pagination ── */
  sortBy(key) {
    if (_sortKey === key) {
      _sortDir = _sortDir === TABLE_SORT_DIRECTIONS.ASC ? TABLE_SORT_DIRECTIONS.DESC : TABLE_SORT_DIRECTIONS.ASC;
    } else {
      _sortKey = key;
      _sortDir = TABLE_SORT_DIRECTIONS.ASC;
    }
    _currentPage = 0;
    this.renderTable(_filtered);
  },

  _getPagedRows(list) {
    const sorted = [...list].sort((a, b) => {
      let va = a[_sortKey];
      let vb = b[_sortKey];
      if (typeof va === 'boolean') {
        va = va ? 1 : 0;
        vb = vb ? 1 : 0;
      } else {
        va = String(va || '').toLowerCase();
        vb = String(vb || '').toLowerCase();
      }
      if (va < vb) return _sortDir === TABLE_SORT_DIRECTIONS.ASC ? -1 : 1;
      if (va > vb) return _sortDir === TABLE_SORT_DIRECTIONS.ASC ? 1 : -1;
      return 0;
    });

    const start = _currentPage * TABLE_PAGE_SIZE;
    return sorted.slice(start, start + TABLE_PAGE_SIZE);
  },

  _buildPagination(totalCount) {
    const totalPages = Math.ceil(totalCount / TABLE_PAGE_SIZE) || 1;
    const startRow = Math.min(_currentPage * TABLE_PAGE_SIZE + 1, totalCount);
    const endRow = Math.min((_currentPage + 1) * TABLE_PAGE_SIZE, totalCount);

    return `
      <div class="tbl-pagination">
        <div class="tbl-page-info">
          Showing ${startRow}–${endRow} of ${totalCount}
        </div>
        <div class="tbl-page-btns">
          <button class="tbl-page-btn" ${_currentPage === 0 ? 'disabled' : ''} onclick="Branches.prevPage()">
            Previous
          </button>
          <span class="tbl-page-num">Page ${_currentPage + 1} of ${totalPages}</span>
          <button class="tbl-page-btn" ${_currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="Branches.nextPage()">
            Next
          </button>
        </div>
      </div>`;
  },

  prevPage() {
    if (_currentPage > 0) {
      _currentPage--;
      this.renderTable(_filtered);
    }
  },

  nextPage() {
    const totalPages = Math.ceil(_filtered.length / TABLE_PAGE_SIZE);
    if (_currentPage < totalPages - 1) {
      _currentPage++;
      this.renderTable(_filtered);
    }
  },

  /* ── Quick Inline Status Toggle ── */
  async toggleStatus(id, e) {
    if (e) e.stopPropagation();
    const b = _allBranches.find(x => x.id === id);
    if (!b) return;
    if (b.active) {
      await this.deactivate(id);
    } else {
      await this.activate(id);
    }
  },

  async activate(id) {
    try {
      const res = await this._fetchWithAuth(`${BRANCHES_API}/${id}/activate`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.showToast('Branch activated.', 'success');
      await this.loadBranches();
    } catch (err) {
      this.showToast('Failed to activate: ' + err.message, 'error');
    }
  },

  async deactivate(id) {
    try {
      const res = await this._fetchWithAuth(`${BRANCHES_API}/${id}/deactivate`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.showToast('Branch deactivated.', 'info');
      await this.loadBranches();
    } catch (err) {
      this.showToast('Failed to deactivate: ' + err.message, 'error');
    }
  },

  /* ── Export CSV ── */
  exportCsv() {
    const headers = CSV_EXPORT_COLUMNS
      .map(k => {
        const col = TABLE_COLUMNS.find(c => c.key === k);
        return `"${(col ? col.label : k).replace(/"/g, '""')}"`;
      })
      .join(',');

    const rows = _filtered.map(b =>
      CSV_EXPORT_COLUMNS
        .map(k => `"${String(b[k] !== undefined && b[k] !== null ? b[k] : '').replace(/"/g, '""')}"`)
        .join(',')
    );

    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${CSV_FILENAME_PREFIX}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('CSV exported successfully.', 'success');
  },

  /* ── View Toggle ── */
  switchView(mode, btn, persist = true) {
    const cardsView = document.getElementById('cardsView');
    const tableView = document.getElementById('tableView');
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    if (mode === 'table') {
      cardsView?.classList.add('hidden');
      tableView?.classList.remove('hidden');
    } else {
      tableView?.classList.add('hidden');
      cardsView?.classList.remove('hidden');
    }
    if (persist) localStorage.setItem(VIEW_KEY, mode);
  },

  /* ── Stats ── */
  updateStats() {
    document.getElementById('statTotal').textContent   = _allBranches.length;
    document.getElementById('statActive').textContent  = _allBranches.filter(b => b.active).length;
    document.getElementById('statFlagship').textContent = _allBranches.filter(b => b.isHeadquarters || b.headquarters).length;
    document.getElementById('statStaff').textContent   = '—';
  },

  /* ── Working Hours Grid ── */
  buildWorkingHoursGrid() {
    const grid = document.getElementById('workingHoursGrid');
    if (!grid) return;
    grid.innerHTML = DAYS_OF_WEEK.map(day => `
      <div class="hours-row">
        <span class="hours-day">${day}</span>
        <input type="time" class="hours-time-input" id="h_${day}_open" value="${DEFAULT_OPEN}" />
        <input type="time" class="hours-time-input" id="h_${day}_close" value="${DEFAULT_CLOSE}" />
        <label class="hours-closed-wrap">
          <input type="checkbox" id="h_${day}_closed" onchange="Branches._toggleDayClosed('${day}', this.checked)" />
          Closed
        </label>
      </div>`).join('');
  },

  _toggleDayClosed(day, closed) {
    const openEl = document.getElementById(`h_${day}_open`);
    const closeEl = document.getElementById(`h_${day}_close`);
    if (openEl) openEl.disabled = closed;
    if (closeEl) closeEl.disabled = closed;
  },

  _getWorkingHours() {
    const result = {};
    DAYS_OF_WEEK.forEach(day => {
      result[day] = {
        open:   document.getElementById(`h_${day}_open`)?.value  || DEFAULT_OPEN,
        close:  document.getElementById(`h_${day}_close`)?.value || DEFAULT_CLOSE,
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
        const open   = document.getElementById(`h_${day}_open`);
        const close  = document.getElementById(`h_${day}_close`);
        const closed = document.getElementById(`h_${day}_closed`);
        if (open)   open.value     = d.open   || DEFAULT_OPEN;
        if (close)  close.value    = d.close  || DEFAULT_CLOSE;
        if (closed) closed.checked = d.closed || false;
        if (d.closed) this._toggleDayClosed(day, true);
      });
    } catch (_) {}
  },

  _formatHoursSummary(jsonStr) {
    try {
      const h = JSON.parse(jsonStr || '{}');
      const mon = h['Monday'];
      if (!mon || mon.closed) return '';
      return `Mon ${mon.open}–${mon.close}`;
    } catch (_) { return ''; }
  },

  /* ── Manager Dropdown ── */
  async populateManagerDropdown() {
    try {
      const res = await this._fetchWithAuth(`${EMPLOYEES_API}?size=100`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const employees = data.content || data || [];
      const sel = document.getElementById('bManager');
      if (!sel) return;
      sel.innerHTML = '<option value="">— Not assigned —</option>' +
        employees.map(e => `<option value="${e.id}">${this._esc(e.name)}</option>`).join('');
    } catch (_) { /* Leave as default */ }
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
    this._openModal('branchModal');
  },

  /* ── Open Edit Modal ── */
  openEditModal(id) {
    const b = _allBranches.find(x => x.id === id);
    if (!b) return;
    _editingId = id;
    document.getElementById('branchModalTitle').textContent = 'Edit Branch';
    document.getElementById('saveBranchBtnText').textContent = 'Save Changes';
    document.getElementById('branchId').value  = b.id;
    document.getElementById('bName').value     = b.name || '';
    document.getElementById('bCode').value     = b.branchCode || '';
    document.getElementById('bType').value     = b.type || 'SHOWROOM';
    document.getElementById('bStatus').value   = String(b.active);
    document.getElementById('bStreet').value   = b.streetAddress || '';
    document.getElementById('bCity').value     = b.city || '';
    document.getElementById('bState').value    = b.state || '';
    document.getElementById('bPin').value      = b.pinCode || '';
    document.getElementById('bCountry').value  = b.country || 'India';
    document.getElementById('bMaps').value     = b.googleMapsUrl || '';
    document.getElementById('bPhone').value    = b.phone || '';
    document.getElementById('bWhatsapp').value = b.whatsapp || '';
    document.getElementById('bEmail').value    = b.email || '';
    document.getElementById('bWebsite').value  = b.website || '';
    document.getElementById('bNotes').value    = b.notes || '';
    if (b.managerId) document.getElementById('bManager').value = b.managerId;
    this._setWorkingHours(b.workingHours);
    try {
      const f = JSON.parse(b.features || '{}');
      document.getElementById('fAppointments').checked  = !!f.appointments;
      document.getElementById('fFittingRoom').checked   = !!f.fittingRoom;
      document.getElementById('fFabricDisplay').checked = !!f.fabricDisplay;
      document.getElementById('fWarehouseOnly').checked = !!f.warehouseOnly;
    } catch (_) {}
    this._openModal('branchModal');
  },

  closeBranchModal(e) {
    if (e && e.target !== document.getElementById('branchModal')) return;
    this._closeModal('branchModal');
  },

  /* ── Save Branch ── */
  async saveBranch() {
    const name   = document.getElementById('bName')?.value?.trim();
    const phone  = document.getElementById('bPhone')?.value?.trim();
    const street = document.getElementById('bStreet')?.value?.trim();
    const city   = document.getElementById('bCity')?.value?.trim();
    const state  = document.getElementById('bState')?.value?.trim();
    if (!name || !phone || !street || !city || !state) {
      this.showToast('Please fill all required fields.', 'error');
      return;
    }

    const payload = {
      name,
      type:           document.getElementById('bType')?.value,
      active:         document.getElementById('bStatus')?.value === 'true',
      streetAddress:  street,
      city,
      state,
      pinCode:        document.getElementById('bPin')?.value?.trim(),
      country:        document.getElementById('bCountry')?.value,
      googleMapsUrl:  document.getElementById('bMaps')?.value?.trim(),
      phone,
      whatsapp:       document.getElementById('bWhatsapp')?.value?.trim(),
      email:          document.getElementById('bEmail')?.value?.trim(),
      website:        document.getElementById('bWebsite')?.value?.trim(),
      managerId:      document.getElementById('bManager')?.value || null,
      workingHours:   JSON.stringify(this._getWorkingHours()),
      features:       JSON.stringify({
        appointments:  document.getElementById('fAppointments')?.checked,
        fittingRoom:   document.getElementById('fFittingRoom')?.checked,
        fabricDisplay: document.getElementById('fFabricDisplay')?.checked,
        warehouseOnly: document.getElementById('fWarehouseOnly')?.checked,
      }),
      notes: document.getElementById('bNotes')?.value?.trim(),
    };

    const btn = document.getElementById('saveBranchBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

    try {
      const url    = _editingId ? `${BRANCHES_API}/${_editingId}` : BRANCHES_API;
      const method = _editingId ? 'PUT' : 'POST';
      const res = await this._fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.showToast(_editingId ? 'Branch updated.' : 'Branch created.', 'success');
      this._closeModal('branchModal');
      await this.loadBranches();
    } catch (err) {
      this.showToast('Save failed: ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="save"></i> <span id="saveBranchBtnText">' + (_editingId ? 'Save Changes' : 'Create Branch') + '</span>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
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
      const res = await this._fetchWithAuth(`${BRANCHES_API}/${_deleteTarget}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.showToast('Branch deleted.', 'success');
      this._closeModal('deleteModal');
      _deleteTarget = null;
      await this.loadBranches();
    } catch (err) {
      this.showToast('Delete failed: ' + err.message, 'error');
    }
  },

  /* ── Set Headquarters ── */
  async setAsHeadquarters(id) {
    try {
      const res = await this._fetchWithAuth(`${BRANCHES_API}/${id}/headquarters`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.showToast('Flagship branch updated.', 'success');
      await this.loadBranches();
    } catch (err) {
      this.showToast('Failed: ' + err.message, 'error');
    }
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

  /* ── Helpers ── */
  _getToken() {
    try {
      for (const key of TOKEN_STORAGE_KEYS) {
        const t = sessionStorage.getItem(key) || localStorage.getItem(key);
        if (t && this._isTokenValid(t)) return t;
      }
      return null;
    } catch (_) {
      return null;
    }
  },

  _isTokenValid(token) {
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && (payload.exp * 1000) <= Date.now()) {
        return false;
      }
      return true;
    } catch (_) {
      return false;
    }
  },

  _ensureAuth() {
    const token = this._getToken();
    if (!token) {
      window.location.href = '../login/login.html';
      return null;
    }
    return token;
  },

  async _fetchWithAuth(url, options = {}) {
    const token = this._ensureAuth();
    if (!token) return { ok: false, status: 401 };

    const headers = Object.assign({}, options.headers || {});
    headers['Authorization'] = `Bearer ${token}`;
    const finalOptions = Object.assign({}, options, { headers });

    const res = await fetch(url, finalOptions);
    if (res.status === 401) {
      try {
        TOKEN_STORAGE_KEYS.forEach(k => {
          sessionStorage.removeItem(k);
          localStorage.removeItem(k);
        });
      } catch (_) {}
      window.location.href = '../login/login.html';
    }
    return res;
  },

  _openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  },

  _closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  },

  _esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },
};

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  Branches.init();
});

window.Branches = Branches;
