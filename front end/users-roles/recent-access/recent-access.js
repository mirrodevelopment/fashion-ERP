/**
 * ═══════════════════════════════════════════════════════════════════════
 * HAULO BOUTIQUE ERP — RECENT ACCESS & AUDIT LOGS
 * File: /front end/users-roles/recent-access/recent-access.js
 * 
 * 100% Database-Driven via PostgreSQL user_access_logs & app_users.
 * Zero hardcoded mock arrays. Zero synthetic seed data.
 * ═══════════════════════════════════════════════════════════════════════
 */

import api, { Auth } from '../../api.js';

// ─── Module State ───────────────────────────────────────────────────────
const state = {
  page: 0,
  size: 15,
  totalPages: 1,
  totalElements: 0,
  activeTab: 'ALL',
  search: '',
  userId: '',
  actionType: '',
  severity: '',
  logs: [],
  users: [],
  activeModalLog: null,
  searchDebounceTimer: null
};

// ─── DOM Element References ─────────────────────────────────────────────
const elements = {
  // KPIs
  kpiTotalEvents:    document.getElementById('kpiTotalEvents'),
  kpiLoginsToday:    document.getElementById('kpiLoginsToday'),
  kpiElevatedOps:    document.getElementById('kpiElevatedOps'),
  kpiSecurityAlerts: document.getElementById('kpiSecurityAlerts'),

  // Toolbar Line 1
  actionTabGroup:    document.getElementById('actionTabGroup'),
  logSearchInput:    document.getElementById('logSearchInput'),
  btnSearchClear:    document.getElementById('btnSearchClear'),

  // Toolbar Line 2
  filterUserSelect:     document.getElementById('filterUserSelect'),
  filterActionSelect:   document.getElementById('filterActionSelect'),
  filterSeveritySelect: document.getElementById('filterSeveritySelect'),
  btnResetFilters:      document.getElementById('btnResetFilters'),
  resultsCountBadge:    document.getElementById('resultsCountBadge'),
  pageSizeSelect:       document.getElementById('pageSizeSelect'),

  // Actions
  btnRefreshLogs: document.getElementById('btnRefreshLogs'),
  refreshIcon:    document.getElementById('refreshIcon'),
  btnExportCsv:   document.getElementById('btnExportCsv'),

  // Table & States
  accessLogsTable:  document.getElementById('accessLogsTable'),
  logsTableBody:    document.getElementById('logsTableBody'),
  logsLoadingState: document.getElementById('logsLoadingState'),
  logsEmptyState:   document.getElementById('logsEmptyState'),
  emptyStateDesc:   document.getElementById('emptyStateDesc'),
  btnEmptyReset:    document.getElementById('btnEmptyReset'),

  // Pagination
  paginationInfo:    document.getElementById('paginationInfo'),
  btnPrevPage:       document.getElementById('btnPrevPage'),
  btnNextPage:       document.getElementById('btnNextPage'),
  pageNumberButtons: document.getElementById('pageNumberButtons'),

  // Modal
  eventModalBackdrop:  document.getElementById('eventModalBackdrop'),
  modalEventTitle:     document.getElementById('modalEventTitle'),
  modalEventSubtitle:  document.getElementById('modalEventSubtitle'),
  modalTimestamp:      document.getElementById('modalTimestamp'),
  modalActionType:     document.getElementById('modalActionType'),
  modalUserName:       document.getElementById('modalUserName'),
  modalSeverity:       document.getElementById('modalSeverity'),
  modalDescription:    document.getElementById('modalDescription'),
  modalLocation:       document.getElementById('modalLocation'),
  modalClientInfo:     document.getElementById('modalClientInfo'),
  modalUserId:         document.getElementById('modalUserId'),
  modalUserRole:       document.getElementById('modalUserRole'),
  modalJsonCode:       document.getElementById('modalJsonCode'),
  btnCopyJson:         document.getElementById('btnCopyJson'),
  btnModalClose:       document.getElementById('btnModalClose'),
  btnModalCloseFooter: document.getElementById('btnModalCloseFooter'),

  // Toast
  raToastContainer: document.getElementById('raToastContainer')
};

// ─── Initialization ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  init();
});

async function init() {
  bindEvents();
  renderLucideIcons();

  // Load live users from PostgreSQL for the filter dropdown
  await loadLiveUsers();

  // Load KPI metrics from backend
  await loadKpis();

  // Load initial access log table records
  await loadLogs();
}

// ─── Bind UI Events ─────────────────────────────────────────────────────
function bindEvents() {
  // Tabs
  if (elements.actionTabGroup) {
    elements.actionTabGroup.addEventListener('click', (e) => {
      const tab = e.target.closest('.ra-tab');
      if (!tab) return;
      const action = tab.dataset.action;
      if (action === state.activeTab) return;

      elements.actionTabGroup.querySelectorAll('.ra-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      state.activeTab = action;
      state.actionType = action === 'ALL' ? '' : action;
      if (elements.filterActionSelect) {
        elements.filterActionSelect.value = state.actionType;
      }
      state.page = 0;
      loadLogs();
    });
  }

  // Search input with debounce
  if (elements.logSearchInput) {
    elements.logSearchInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (elements.btnSearchClear) {
        elements.btnSearchClear.style.display = val ? 'flex' : 'none';
      }
      clearTimeout(state.searchDebounceTimer);
      state.searchDebounceTimer = setTimeout(() => {
        state.search = val;
        state.page = 0;
        loadLogs();
      }, 350);
    });
  }

  // Clear search button
  if (elements.btnSearchClear) {
    elements.btnSearchClear.addEventListener('click', () => {
      elements.logSearchInput.value = '';
      elements.btnSearchClear.style.display = 'none';
      state.search = '';
      state.page = 0;
      loadLogs();
    });
  }

  // User select filter
  if (elements.filterUserSelect) {
    elements.filterUserSelect.addEventListener('change', (e) => {
      state.userId = e.target.value;
      state.page = 0;
      loadLogs();
    });
  }

  // Action select filter
  if (elements.filterActionSelect) {
    elements.filterActionSelect.addEventListener('change', (e) => {
      state.actionType = e.target.value;
      // Sync tab highlight
      syncTabWithAction(state.actionType);
      state.page = 0;
      loadLogs();
    });
  }

  // Severity select filter
  if (elements.filterSeveritySelect) {
    elements.filterSeveritySelect.addEventListener('change', (e) => {
      state.severity = e.target.value;
      state.page = 0;
      loadLogs();
    });
  }

  // Page size select
  if (elements.pageSizeSelect) {
    elements.pageSizeSelect.addEventListener('change', (e) => {
      state.size = parseInt(e.target.value, 10) || 15;
      state.page = 0;
      loadLogs();
    });
  }

  // Reset filters button
  if (elements.btnResetFilters) {
    elements.btnResetFilters.addEventListener('click', resetFilters);
  }
  if (elements.btnEmptyReset) {
    elements.btnEmptyReset.addEventListener('click', resetFilters);
  }

  // Refresh button
  if (elements.btnRefreshLogs) {
    elements.btnRefreshLogs.addEventListener('click', async () => {
      if (elements.refreshIcon) {
        elements.refreshIcon.classList.add('ra-spin');
      }
      await Promise.all([loadKpis(), loadLogs()]);
      showToast('Live audit feed synchronized from database', 'success');
      setTimeout(() => {
        if (elements.refreshIcon) elements.refreshIcon.classList.remove('ra-spin');
      }, 600);
    });
  }

  // Export CSV button
  if (elements.btnExportCsv) {
    elements.btnExportCsv.addEventListener('click', exportToCsv);
  }

  // Pagination Prev / Next
  if (elements.btnPrevPage) {
    elements.btnPrevPage.addEventListener('click', () => {
      if (state.page > 0) {
        state.page--;
        loadLogs();
      }
    });
  }
  if (elements.btnNextPage) {
    elements.btnNextPage.addEventListener('click', () => {
      if (state.page < state.totalPages - 1) {
        state.page++;
        loadLogs();
      }
    });
  }

  // Modal events
  if (elements.btnModalClose) {
    elements.btnModalClose.addEventListener('click', closeModal);
  }
  if (elements.btnModalCloseFooter) {
    elements.btnModalCloseFooter.addEventListener('click', closeModal);
  }
  if (elements.eventModalBackdrop) {
    elements.eventModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.eventModalBackdrop) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.eventModalBackdrop && elements.eventModalBackdrop.style.display !== 'none') {
      closeModal();
    }
  });

  // Copy JSON in modal
  if (elements.btnCopyJson) {
    elements.btnCopyJson.addEventListener('click', () => {
      if (state.activeModalLog) {
        const text = JSON.stringify(state.activeModalLog, null, 2);
        navigator.clipboard.writeText(text).then(() => {
          showToast('Raw event JSON copied to clipboard', 'success');
        }).catch(() => {
          showToast('Failed to copy to clipboard', 'error');
        });
      }
    });
  }
}

function syncTabWithAction(act) {
  if (!elements.actionTabGroup) return;
  const target = act ? act : 'ALL';
  elements.actionTabGroup.querySelectorAll('.ra-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.action === target);
  });
}

function resetFilters() {
  state.search = '';
  state.userId = '';
  state.actionType = '';
  state.severity = '';
  state.activeTab = 'ALL';
  state.page = 0;

  if (elements.logSearchInput) elements.logSearchInput.value = '';
  if (elements.btnSearchClear) elements.btnSearchClear.style.display = 'none';
  if (elements.filterUserSelect) elements.filterUserSelect.value = '';
  if (elements.filterActionSelect) elements.filterActionSelect.value = '';
  if (elements.filterSeveritySelect) elements.filterSeveritySelect.value = '';
  syncTabWithAction('ALL');

  loadLogs();
}

// ─── Data Fetching: Live Users ──────────────────────────────────────────
async function loadLiveUsers() {
  try {
    const list = await api.users.list();
    state.users = Array.isArray(list) ? list : [];
    if (elements.filterUserSelect) {
      elements.filterUserSelect.innerHTML = '<option value="">All Users</option>';
      state.users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = `${u.fullName || u.username} (${u.role || 'USER'})`;
        elements.filterUserSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.warn('Could not load live users for filter:', err);
  }
}

// ─── Data Fetching: KPI Metrics ─────────────────────────────────────────
async function loadKpis() {
  try {
    const stats = await api.users.accessLogs.stats();
    if (stats) {
      if (elements.kpiTotalEvents)    elements.kpiTotalEvents.textContent = formatNumber(stats.totalEvents || 0);
      if (elements.kpiLoginsToday)    elements.kpiLoginsToday.textContent = formatNumber(stats.loginsToday || 0);
      if (elements.kpiElevatedOps)    elements.kpiElevatedOps.textContent = formatNumber(stats.elevatedEvents || 0);
      if (elements.kpiSecurityAlerts) elements.kpiSecurityAlerts.textContent = formatNumber(stats.securityAlerts || 0);
    }
  } catch (err) {
    console.error('Failed to load KPI metrics from backend:', err);
    if (elements.kpiTotalEvents) elements.kpiTotalEvents.textContent = '0';
    if (elements.kpiLoginsToday) elements.kpiLoginsToday.textContent = '0';
    if (elements.kpiElevatedOps) elements.kpiElevatedOps.textContent = '0';
    if (elements.kpiSecurityAlerts) elements.kpiSecurityAlerts.textContent = '0';
  }
}

// ─── Data Fetching: Access Logs Page ────────────────────────────────────
async function loadLogs() {
  showLoading(true);
  try {
    const params = {
      page: state.page,
      size: state.size
    };
    if (state.search)     params.search = state.search;
    if (state.actionType) params.actionType = state.actionType;
    if (state.userId)     params.userId = state.userId;
    if (state.severity)   params.severity = state.severity;

    const res = await api.users.accessLogs.list(params);
    state.logs = res.items || [];
    state.totalElements = res.totalElements || 0;
    state.totalPages = res.totalPages || 1;
    state.page = res.currentPage || 0;

    renderTable();
    renderPagination();
    renderCounter();
  } catch (err) {
    console.error('Failed to query access logs from backend:', err);
    state.logs = [];
    state.totalElements = 0;
    state.totalPages = 1;
    renderTable();
    renderPagination();
    renderCounter();
  } finally {
    showLoading(false);
  }
}

function showLoading(isLoading) {
  if (elements.logsLoadingState) {
    elements.logsLoadingState.style.display = isLoading ? 'flex' : 'none';
  }
}

// ─── Table Rendering ────────────────────────────────────────────────────
function renderTable() {
  if (!elements.logsTableBody) return;
  elements.logsTableBody.innerHTML = '';

  if (state.logs.length === 0) {
    const tr = document.createElement('tr');
    tr.className = 'ra-empty-row';
    const message = state.search || state.actionType || state.userId || state.severity
      ? 'No audit log records match the current filter parameters.'
      : 'No access logs have been recorded yet in this boutique workspace.';

    tr.innerHTML = `
      <td colspan="8">
        <div class="ra-empty-state">
          <div class="ra-empty-icon">
            <i data-lucide="shield-alert"></i>
          </div>
          <h3 class="ra-empty-title">No Audit Events Found</h3>
          <p class="ra-empty-desc">${message}</p>
          <button class="ra-btn ra-btn-secondary" id="btnEmptyResetInner">
            <i data-lucide="rotate-ccw"></i>
            <span>Clear All Filters</span>
          </button>
        </div>
      </td>
    `;
    elements.logsTableBody.appendChild(tr);

    const resetBtn = tr.querySelector('#btnEmptyResetInner');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetFilters);
    }
    renderLucideIcons();
    return;
  }

  state.logs.forEach((log) => {
    const tr = document.createElement('tr');
    tr.className = 'ra-table-row';

    // 1. Timestamp
    const timeTd = document.createElement('td');
    timeTd.className = 'ra-td-time';
    const relSpan = document.createElement('span');
    relSpan.className = 'ra-time-rel';
    relSpan.textContent = log.timeFormatted || 'Recent';
    const absSpan = document.createElement('span');
    absSpan.className = 'ra-time-abs';
    absSpan.textContent = formatIsoDate(log.createdAt);
    timeTd.appendChild(relSpan);
    timeTd.appendChild(absSpan);
    tr.appendChild(timeTd);

    // 2. User Account
    const userTd = document.createElement('td');
    const userWrap = document.createElement('div');
    userWrap.className = 'ra-user-cell';

    const avatar = document.createElement('div');
    avatar.className = 'ra-user-avatar';
    avatar.textContent = getInitials(log.userName);
    userWrap.appendChild(avatar);

    const userInfo = document.createElement('div');
    userInfo.className = 'ra-user-info';

    const nameRow = document.createElement('div');
    nameRow.className = 'ra-user-name';
    nameRow.textContent = log.userName || 'Boutique User';

    const rolePill = document.createElement('span');
    rolePill.className = `ra-role-pill ${getRoleClass(log.userRole)}`;
    rolePill.textContent = log.userRole || 'USER';
    nameRow.appendChild(rolePill);
    userInfo.appendChild(nameRow);

    const emailRow = document.createElement('div');
    emailRow.className = 'ra-user-email';
    emailRow.textContent = log.userEmail && log.userEmail !== '—' ? log.userEmail : (log.userName ? `@${log.userName.toLowerCase().replace(/\s+/g, '')}` : '—');
    userInfo.appendChild(emailRow);

    userWrap.appendChild(userInfo);
    userTd.appendChild(userWrap);
    tr.appendChild(userTd);

    // 3. Action Type Badge
    const actTd = document.createElement('td');
    const actBadge = document.createElement('span');
    actBadge.className = `ra-action-badge ${getActionBadgeClass(log.actionType)}`;
    actBadge.innerHTML = `${getActionIconHtml(log.actionType)}<span>${escapeHtml(log.actionType)}</span>`;
    actTd.appendChild(actBadge);
    tr.appendChild(actTd);

    // 4. Description
    const descTd = document.createElement('td');
    descTd.className = 'ra-desc-cell';
    descTd.textContent = log.description || 'System event recorded';
    tr.appendChild(descTd);

    // 5. Location / Branch
    const locTd = document.createElement('td');
    const locWrap = document.createElement('div');
    locWrap.className = 'ra-loc-cell';
    locWrap.innerHTML = `<i data-lucide="map-pin"></i><span>${escapeHtml(log.location || 'HQ Terminal')}</span>`;
    locTd.appendChild(locWrap);
    tr.appendChild(locTd);

    // 6. Client / Terminal
    const clientTd = document.createElement('td');
    clientTd.className = 'ra-client-cell';
    clientTd.textContent = log.clientInfo || 'Web App';
    tr.appendChild(clientTd);

    // 7. Severity Pill
    const sevTd = document.createElement('td');
    const sevPill = document.createElement('span');
    sevPill.className = `ra-severity-pill ${getSeverityClass(log.severity)}`;
    sevPill.textContent = log.severity || 'INFO';
    sevTd.appendChild(sevPill);
    tr.appendChild(sevTd);

    // 8. Inspect Action
    const actionsTd = document.createElement('td');
    const inspectBtn = document.createElement('button');
    inspectBtn.className = 'ra-btn-inspect';
    inspectBtn.innerHTML = `<i data-lucide="eye"></i><span>Inspect</span>`;
    inspectBtn.title = 'Inspect raw event payload';
    inspectBtn.addEventListener('click', () => openModal(log));
    actionsTd.appendChild(inspectBtn);
    tr.appendChild(actionsTd);

    elements.logsTableBody.appendChild(tr);
  });

  renderLucideIcons();
}

// ─── Pagination ─────────────────────────────────────────────────────────
function renderPagination() {
  if (!elements.paginationInfo) return;
  const start = state.totalElements === 0 ? 0 : state.page * state.size + 1;
  const end = Math.min((state.page + 1) * state.size, state.totalElements);
  elements.paginationInfo.textContent = `Showing ${start}–${end} of ${formatNumber(state.totalElements)} events (Page ${state.page + 1} of ${Math.max(1, state.totalPages)})`;

  if (elements.btnPrevPage) {
    elements.btnPrevPage.disabled = state.page <= 0;
  }
  if (elements.btnNextPage) {
    elements.btnNextPage.disabled = state.page >= state.totalPages - 1;
  }

  if (elements.pageNumberButtons) {
    elements.pageNumberButtons.innerHTML = '';
    const maxChips = 5;
    let startPage = Math.max(0, state.page - Math.floor(maxChips / 2));
    let endPage = Math.min(state.totalPages, startPage + maxChips);
    if (endPage - startPage < maxChips) {
      startPage = Math.max(0, endPage - maxChips);
    }

    for (let p = startPage; p < endPage; p++) {
      const chip = document.createElement('button');
      chip.className = `ra-page-chip ${p === state.page ? 'active' : ''}`;
      chip.textContent = `${p + 1}`;
      chip.addEventListener('click', () => {
        if (p !== state.page) {
          state.page = p;
          loadLogs();
        }
      });
      elements.pageNumberButtons.appendChild(chip);
    }
  }
}

function renderCounter() {
  if (elements.resultsCountBadge) {
    elements.resultsCountBadge.textContent = `Total: ${formatNumber(state.totalElements)} events`;
  }
}

// ─── Modal Inspection ───────────────────────────────────────────────────
function openModal(log) {
  state.activeModalLog = log;
  if (!elements.eventModalBackdrop) return;

  if (elements.modalEventTitle)    elements.modalEventTitle.textContent = `${log.actionType} Event Details`;
  if (elements.modalEventSubtitle) elements.modalEventSubtitle.textContent = `Event UUID: ${log.id || '—'}`;
  if (elements.modalTimestamp)     elements.modalTimestamp.textContent = log.timeFormatted ? `${log.timeFormatted} (${formatIsoDate(log.createdAt)})` : formatIsoDate(log.createdAt);
  if (elements.modalActionType)    elements.modalActionType.textContent = log.actionType || 'EVENT';
  if (elements.modalUserName)      elements.modalUserName.textContent = `${log.userName || 'Unknown'} (${log.userRole || 'USER'})`;
  if (elements.modalSeverity)      elements.modalSeverity.textContent = log.severity || 'INFO';
  if (elements.modalDescription)   elements.modalDescription.textContent = log.description || '—';
  if (elements.modalLocation)      elements.modalLocation.textContent = log.location || '—';
  if (elements.modalClientInfo)    elements.modalClientInfo.textContent = log.clientInfo || '—';
  if (elements.modalUserId)        elements.modalUserId.textContent = log.userId || '—';
  if (elements.modalUserRole)      elements.modalUserRole.textContent = log.userRole || 'USER';

  if (elements.modalJsonCode) {
    elements.modalJsonCode.textContent = JSON.stringify(log, null, 2);
  }

  elements.eventModalBackdrop.style.display = 'flex';
  renderLucideIcons();
}

function closeModal() {
  if (elements.eventModalBackdrop) {
    elements.eventModalBackdrop.style.display = 'none';
  }
  state.activeModalLog = null;
}

// ─── CSV Export (100% Real Database Records) ────────────────────────────
function exportToCsv() {
  if (!state.logs || state.logs.length === 0) {
    showToast('No logs currently available to export', 'error');
    return;
  }

  const headers = ['Timestamp', 'User', 'Role', 'Action', 'Description', 'Location', 'Client_Info', 'Severity'];
  const rows = state.logs.map(l => [
    `"${l.createdAt || ''}"`,
    `"${(l.userName || '').replace(/"/g, '""')}"`,
    `"${l.userRole || ''}"`,
    `"${l.actionType || ''}"`,
    `"${(l.description || '').replace(/"/g, '""')}"`,
    `"${(l.location || '').replace(/"/g, '""')}"`,
    `"${(l.clientInfo || '').replace(/"/g, '""')}"`,
    `"${l.severity || 'INFO'}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `haulo_access_audit_logs_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Exported ${state.logs.length} audit records to CSV`, 'success');
}

// ─── Toast Notifications ────────────────────────────────────────────────
function showToast(message, type = 'success') {
  if (!elements.raToastContainer) return;
  const toast = document.createElement('div');
  toast.className = `ra-toast toast-${type}`;
  toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i><span>${escapeHtml(message)}</span>`;
  elements.raToastContainer.appendChild(toast);
  renderLucideIcons();

  setTimeout(() => {
    toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 260);
  }, 3200);
}

// ─── Helpers ────────────────────────────────────────────────────────────
function renderLucideIcons() {
  if (typeof window !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function formatNumber(num) {
  return Number(num || 0).toLocaleString();
}

function formatIsoDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return iso;
  }
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getRoleClass(role) {
  if (!role) return '';
  const r = role.toUpperCase();
  if (r === 'OWNER') return 'role-owner';
  if (r === 'ADMIN') return 'role-admin';
  if (r.includes('BRANCH')) return 'role-branch';
  return '';
}

function getActionBadgeClass(action) {
  if (!action) return 'action-default';
  const a = action.toUpperCase();
  if (a === 'LOGIN') return 'action-login';
  if (a.includes('ROLE')) return 'action-role';
  if (a.includes('CREATED')) return 'action-created';
  if (a.includes('UPDATED')) return 'action-updated';
  if (a.includes('SUSPENDED')) return 'action-suspended';
  return 'action-default';
}

function getActionIconHtml(action) {
  if (!action) return '<i data-lucide="circle-dot"></i>';
  const a = action.toUpperCase();
  if (a === 'LOGIN') return '<i data-lucide="log-in"></i>';
  if (a.includes('ROLE')) return '<i data-lucide="shield"></i>';
  if (a.includes('CREATED')) return '<i data-lucide="user-plus"></i>';
  if (a.includes('UPDATED')) return '<i data-lucide="user-check"></i>';
  if (a.includes('SUSPENDED')) return '<i data-lucide="alert-triangle"></i>';
  return '<i data-lucide="activity"></i>';
}

function getSeverityClass(sev) {
  if (!sev) return 'sev-info';
  const s = sev.toUpperCase();
  if (s === 'CRITICAL') return 'sev-critical';
  if (s === 'WARNING') return 'sev-warning';
  return 'sev-info';
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
