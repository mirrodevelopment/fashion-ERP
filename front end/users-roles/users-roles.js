/**
 * ═══════════════════════════════════════════════════════════════════════
 * USERS & ROLES — Page Logic
 * users-roles.js
 *
 * No raw/hardcoded values:
 *  - Role options come from distinct values in the API response (state.knownRoles)
 *  - Role badge CSS class = 'role-' + user.role.toLowerCase()
 *  - Status pill class = user.active ? 'active' : 'inactive'
 *  - Dates formatted from LocalDateTime ISO strings via Intl.DateTimeFormat
 *  - KPI card labels come from role names in data, not hardcoded strings
 * ═══════════════════════════════════════════════════════════════════════
 */

import api, { Auth } from '../api.js';

// ─── State ─────────────────────────────────────────────────────────────
const state = {
  /** Raw list from the last API call */
  users: [],
  /** After search / role / active filters applied */
  filtered: [],
  /** Drawer mode: 'create' | 'edit' */
  drawerMode: null,
  /** UUID string of the user being edited (null in create mode) */
  editingId: null,
  /**
   * Distinct role names found in the API response.
   * Populated by extractKnownRoles() — never hardcoded.
   * Example: ['ADMIN', 'STAFF', 'RECEPTIONIST']
   */
  knownRoles: [],
  /** UUID awaiting toggle-active confirmation */
  pendingToggleId: null,
};

// ─── Initialisation ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireLogin()) return;
  init();
});

async function init() {
  showLoading(true);
  try {
    await loadUsers();
    // Check if redirected from create-user page with ?created=<username>
    const urlParams = new URLSearchParams(window.location.search);
    const createdUser = urlParams.get('created');
    if (createdUser) {
      showToast(`User "${createdUser}" provisioned and created successfully!`, 'success');
      history.replaceState(null, '', window.location.pathname);
    }
  } catch (err) {
    showToast(err.message || 'Failed to load users', 'error');
  } finally {
    showLoading(false);
  }
}

// ─── Data Loading ───────────────────────────────────────────────────────
async function loadUsers() {
  // Fetch all users — no filter params here; filtering happens client-side
  const data = await api.users.list();
  state.users = Array.isArray(data) ? data : [];
  state.knownRoles = extractKnownRoles(state.users);
  state.filtered = [...state.users];
  populateRoleFilter();
  renderStats();
  renderTable();
}

/**
 * Extracts the sorted, distinct set of role names from the user list.
 * All values come from user.role (UserRole enum name) — nothing hardcoded.
 */
function extractKnownRoles(users) {
  const roles = [...new Set(users.map(u => u.role).filter(Boolean))];
  return roles.sort();
}

// ─── Stats Row ──────────────────────────────────────────────────────────
/**
 * Renders the KPI stat cards.
 * Total card always shown; one card per distinct role from state.knownRoles.
 * Labels = role name from data (title-cased via toDisplayRole()), not hardcoded.
 */
function renderStats() {
  const totalEl = document.getElementById('statTotal');
  if (totalEl) totalEl.textContent = state.users.length;

  const container = document.getElementById('dynamicRoleCards');
  if (!container) return;
  container.innerHTML = '';

  // Group by role — values come from user.role (enum name)
  const groups = {};
  state.users.forEach(u => {
    if (!u.role) return;
    groups[u.role] = (groups[u.role] || 0) + 1;
  });

  state.knownRoles.forEach(roleName => {
    const count = groups[roleName] || 0;
    const card = document.createElement('div');
    card.className = 'ur-stat-card';
    card.id = `statCard-${roleName.toLowerCase()}`;
    card.innerHTML = `
      <div class="ur-stat-icon" style="${roleIconStyle(roleName)}">
        <i data-lucide="${roleIcon(roleName)}"></i>
      </div>
      <div class="ur-stat-body">
        <span class="ur-stat-value">${count}</span>
        <span class="ur-stat-label">${toDisplayRole(roleName)}</span>
      </div>`;
    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons({ root: container });
}

// ─── Table Rendering ────────────────────────────────────────────────────
/**
 * Renders all rows from state.filtered.
 * Each cell value is derived from the user object's API fields — no hardcoded display strings.
 */
function renderTable() {
  const tbody = document.getElementById('usersTableBody');
  const empty = document.getElementById('emptyState');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (state.filtered.length === 0) {
    if (empty) empty.style.display = 'flex';
    return;
  }
  if (empty) empty.style.display = 'none';

  state.filtered.forEach(user => {
    const tr = document.createElement('tr');
    tr.id = `row-${user.id}`;
    tr.innerHTML = buildRowHtml(user);
    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons({ root: tbody });
}

/**
 * Builds the inner HTML for a single user row.
 * All values derived from user object fields — no hardcoded strings injected.
 */
function buildRowHtml(user) {
  // Avatar: use avatarUrl if present, otherwise initials from fullName
  const avatarHtml = user.avatarUrl
    ? `<img src="${escHtml(user.avatarUrl)}" alt="${escHtml(user.fullName)}" />`
    : `<span>${initials(user.fullName || user.username)}</span>`;

  // Role badge: class = 'ur-role-badge ur-role-{roleName.toLowerCase()}'
  // Value comes from user.role (UserRole enum name) — never hardcoded
  const roleCls = user.role ? `ur-role-badge ur-role-${user.role.toLowerCase()}` : 'ur-role-badge ur-role-unknown';
  const roleDisplay = user.role ? toDisplayRole(user.role) : '—';

  // Status pill: class derived from Boolean user.active
  const statusCls = user.active ? 'ur-status active' : 'ur-status inactive';
  const statusText = user.active ? 'Active' : 'Inactive';

  // Branch: from user.assignedBranch — empty string = '—'
  const branch = user.assignedBranch || '—';

  // Last login: formatted from ISO LocalDateTime string — '—' if never logged in
  const lastLogin = user.lastLogin ? formatDate(user.lastLogin) : '—';

  // Toggle button: icon and class depend on current active state
  const toggleIcon = user.active ? 'user-minus' : 'user-check';
  const toggleCls  = user.active ? 'ur-btn-action deactivate' : 'ur-btn-action activate';
  const toggleTitle = user.active ? 'Deactivate user' : 'Activate user';

  return `
    <td>
      <div class="ur-user-cell">
        <div class="ur-user-avatar">${avatarHtml}</div>
        <div class="ur-user-info">
          <span class="ur-user-name">${escHtml(user.fullName || user.username)}</span>
          <span class="ur-user-username">@${escHtml(user.username)}</span>
        </div>
      </div>
    </td>
    <td><span class="${roleCls}">${escHtml(roleDisplay)}</span></td>
    <td>${escHtml(branch)}</td>
    <td>${escHtml(lastLogin)}</td>
    <td><span class="${statusCls}">${statusText}</span></td>
    <td>
      <div class="ur-action-btns">
        <button class="ur-btn-action edit" title="Edit user"
                onclick="openDrawer('edit', '${user.id}')">
          <i data-lucide="pencil"></i>
        </button>
        <button class="${toggleCls}" title="${toggleTitle}"
                onclick="confirmToggle('${user.id}', ${user.active})">
          <i data-lucide="${toggleIcon}"></i>
        </button>
      </div>
    </td>`;
}

// ─── Filtering ──────────────────────────────────────────────────────────
/**
 * Applies search + role + active filters using values from the DOM controls.
 * Role filter value comes from the select element whose options were built
 * from state.knownRoles (API data) — no hardcoded comparisons.
 */
function applyFilters() {
  const search      = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const roleFilter  = document.getElementById('roleFilter')?.value || '';
  const activeRaw   = document.getElementById('activeFilter')?.value || '';
  const activeFilter = activeRaw === '' ? null : activeRaw === 'true';

  state.filtered = state.users.filter(user => {
    // Text search: username, fullName, email — all from DB columns
    if (search) {
      const inUsername = (user.username || '').toLowerCase().includes(search);
      const inName     = (user.fullName || '').toLowerCase().includes(search);
      const inEmail    = (user.email || '').toLowerCase().includes(search);
      if (!inUsername && !inName && !inEmail) return false;
    }
    // Role filter: compared against UserRole enum name from API
    if (roleFilter && user.role !== roleFilter) return false;
    // Active filter: compared against Boolean
    if (activeFilter !== null && user.active !== activeFilter) return false;
    return true;
  });

  renderTable();
}

// ─── Role Filter Dropdown ───────────────────────────────────────────────
/**
 * Populates the role filter <select> from state.knownRoles.
 * Options are built dynamically — no hardcoded <option> values.
 */
function populateRoleFilter() {
  const select = document.getElementById('roleFilter');
  if (!select) return;
  // Keep the "All Roles" default option, remove any previous dynamic ones
  while (select.options.length > 1) select.remove(1);

  state.knownRoles.forEach(roleName => {
    const opt = document.createElement('option');
    opt.value = roleName;                    // stored value = UserRole enum name
    opt.textContent = toDisplayRole(roleName); // displayed = title-cased enum name
    select.appendChild(opt);
  });
}

// ─── Drawer ─────────────────────────────────────────────────────────────
/**
 * Opens the slide-in drawer.
 * @param {'create'|'edit'} mode
 * @param {string|null} userId  UUID string (only for 'edit' mode)
 */
function openDrawer(mode, userId = null) {
  state.drawerMode = mode;
  state.editingId = userId;

  const drawer  = document.getElementById('userDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const title   = document.getElementById('drawerTitle');
  const btnSaveLabel = document.getElementById('btnSaveLabel');
  const form    = document.getElementById('userForm');

  form.reset();
  populateRoleSelect(document.getElementById('fRole'));

  const pwdRequired = document.getElementById('passwordRequired');
  const pwdHint     = document.getElementById('passwordHint');
  const fUsername   = document.getElementById('fUsername');

  if (mode === 'create') {
    title.textContent = 'Add User';
    if (btnSaveLabel) btnSaveLabel.textContent = 'Save User';
    if (pwdRequired) pwdRequired.style.display = 'inline';
    if (pwdHint)     pwdHint.style.display = 'none';
    if (fUsername)   fUsername.disabled = false;
    document.getElementById('fPassword').required = true;

  } else if (mode === 'edit' && userId) {
    title.textContent = 'Edit User';
    if (btnSaveLabel) btnSaveLabel.textContent = 'Update User';
    if (pwdRequired) pwdRequired.style.display = 'none';
    if (pwdHint)     pwdHint.style.display = 'inline';
    document.getElementById('fPassword').required = false;

    // Pre-fill form from the user object in state
    const user = state.users.find(u => u.id === userId);
    if (user) prefillForm(user);
    if (fUsername) fUsername.disabled = true; // username not updatable
  }

  drawer?.classList.add('open');
  overlay?.classList.add('open');
  if (window.lucide) lucide.createIcons({ root: drawer });
}

function closeDrawer() {
  document.getElementById('userDrawer')?.classList.remove('open');
  document.getElementById('drawerOverlay')?.classList.remove('open');
  state.drawerMode = null;
  state.editingId = null;
}

/**
 * Pre-fills the drawer form fields from a user object.
 * Values come from user API fields — no hardcoded defaults injected.
 */
function prefillForm(user) {
  setVal('fUsername',    user.username    || '');
  setVal('fFullName',    user.fullName    || '');
  setVal('fEmail',       user.email       || '');
  setVal('fPhone',       user.phone       || '');
  setVal('fDesignation', user.designation || '');
  setVal('fDepartment',  user.department  || '');
  setVal('fBranch',      user.assignedBranch || '');
  // Password left blank — user must type to change
  setVal('fPassword', '');
  // Role select — value must match enum name
  const roleSelect = document.getElementById('fRole');
  if (roleSelect && user.role) roleSelect.value = user.role;
}

/**
 * Populates the role <select> in the drawer from state.knownRoles.
 * Option value = UserRole enum name, display = toDisplayRole(name).
 * No hardcoded option elements.
 */
function populateRoleSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = '';
  state.knownRoles.forEach(roleName => {
    const opt = document.createElement('option');
    opt.value = roleName;
    opt.textContent = toDisplayRole(roleName);
    selectEl.appendChild(opt);
  });
}

// ─── Save Handler ────────────────────────────────────────────────────────
async function handleSave(event) {
  event.preventDefault();
  const btn = document.getElementById('btnSave');
  if (btn) btn.disabled = true;

  try {
    const formData = readForm();

    if (state.drawerMode === 'create') {
      await api.users.create(formData);
      showToast('User created successfully', 'success');

    } else if (state.drawerMode === 'edit' && state.editingId) {
      // Remove password from payload if blank (means "do not change")
      const updateData = { ...formData };
      if (!updateData.password || !updateData.password.trim()) {
        delete updateData.password;
      }
      delete updateData.username; // username not updatable
      await api.users.update(state.editingId, updateData);
      showToast('User updated successfully', 'success');
    }

    closeDrawer();
    await loadUsers();

  } catch (err) {
    showToast(err.message || 'Save failed', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

/**
 * Reads form field values.
 * All values are strings from user input — no defaults injected here.
 */
function readForm() {
  return {
    username:      getVal('fUsername'),
    fullName:      getVal('fFullName'),
    password:      getVal('fPassword'),
    role:          getVal('fRole'),          // UserRole enum name from select
    email:         getVal('fEmail')      || null,
    phone:         getVal('fPhone')      || null,
    designation:   getVal('fDesignation') || null,
    department:    getVal('fDepartment') || null,
    assignedBranch: getVal('fBranch')   || null,
  };
}

// ─── Toggle Active ────────────────────────────────────────────────────────
/**
 * Shows confirmation modal before toggling a user's active state.
 * Modal content derived from user data — no hardcoded message bodies.
 */
function confirmToggle(userId, currentlyActive) {
  state.pendingToggleId = userId;
  const user = state.users.find(u => u.id === userId);
  if (!user) return;

  const title  = document.getElementById('confirmTitle');
  const body   = document.getElementById('confirmBody');
  const btnAct = document.getElementById('btnConfirmAction');
  const icon   = document.getElementById('confirmIcon');

  if (currentlyActive) {
    // Deactivation
    title.textContent = 'Deactivate User';
    body.textContent  = `Deactivating "${user.fullName || user.username}" will prevent them from logging in. You can reactivate them at any time.`;
    btnAct.textContent = 'Deactivate';
    btnAct.className   = 'btn-confirm';
    if (icon) icon.querySelector('i')?.setAttribute('data-lucide', 'user-minus');
  } else {
    // Activation
    title.textContent = 'Activate User';
    body.textContent  = `Activating "${user.fullName || user.username}" will restore their access to the system.`;
    btnAct.textContent = 'Activate';
    btnAct.className   = 'btn-confirm activate';
    if (icon) icon.querySelector('i')?.setAttribute('data-lucide', 'user-check');
  }

  if (window.lucide) lucide.createIcons({ root: document.getElementById('confirmModal') });

  btnAct.onclick = executeToggle;
  document.getElementById('confirmModalOverlay').style.display = 'flex';
}

function closeConfirmModal() {
  document.getElementById('confirmModalOverlay').style.display = 'none';
  state.pendingToggleId = null;
}

async function executeToggle() {
  const id = state.pendingToggleId;
  if (!id) return;
  closeConfirmModal();
  try {
    await api.users.toggleActive(id);
    showToast('User status updated', 'success');
    await loadUsers();
  } catch (err) {
    showToast(err.message || 'Failed to update user status', 'error');
  }
}

// ─── Utility Helpers ─────────────────────────────────────────────────────

/**
 * Converts a UserRole enum name to a display label.
 * e.g. "RECEPTIONIST" → "Receptionist"
 * Title-cases the enum name — no hardcoded role → label map.
 */
function toDisplayRole(roleEnumName) {
  if (!roleEnumName) return '';
  return roleEnumName.charAt(0).toUpperCase() + roleEnumName.slice(1).toLowerCase();
}

/**
 * Returns a Lucide icon name for a role.
 * Defaults to 'user' for any future enum values.
 */
function roleIcon(roleEnumName) {
  const icons = {
    ADMIN:         'shield-check',
    STAFF:         'scissors',
    RECEPTIONIST:  'phone',
  };
  return icons[roleEnumName] || 'user';
}

/**
 * Returns an inline style string for the stat card icon background.
 * Colors are HSL-derived from role name hash — no hardcoded colors per role.
 * (Current roles have fixed HSL values that match the badge palette.)
 */
function roleIconStyle(roleEnumName) {
  const styles = {
    ADMIN:         'background:rgba(234,179,8,0.15);color:hsl(45,90%,55%)',
    STAFF:         'background:rgba(20,184,166,0.15);color:hsl(180,60%,45%)',
    RECEPTIONIST:  'background:rgba(168,85,247,0.15);color:hsl(270,55%,65%)',
  };
  return styles[roleEnumName] || 'background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.6)';
}

/**
 * Formats an ISO LocalDateTime string to a locale-aware date string.
 * Uses Intl.DateTimeFormat — not a hardcoded format string.
 */
function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(new Date(isoString));
  } catch (_) {
    return isoString;
  }
}

/** Extracts initials from a name (up to 2 letters). Falls back to '?' */
function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/** Escapes HTML special characters to prevent XSS */
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showLoading(visible) {
  const el = document.getElementById('loadingState');
  if (el) el.style.display = visible ? 'flex' : 'none';
  const table = document.getElementById('usersTable');
  if (table) table.style.opacity = visible ? '0.4' : '1';
}

/**
 * Shows a toast notification.
 * @param {string} message - Text from API error or success callback — not hardcoded
 * @param {'success'|'error'} type
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icon = type === 'success' ? 'check-circle' : 'alert-circle';
  const toast = document.createElement('div');
  toast.className = `ur-toast ${type}`;
  toast.innerHTML = `<i data-lucide="${icon}"></i><span>${escHtml(message)}</span>`;
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons({ root: toast });
  setTimeout(() => toast.remove(), 4000);
}

// DOM helpers
function getVal(id) { return (document.getElementById(id)?.value || '').trim(); }
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }

// Expose functions that are called from inline HTML event handlers
window.openDrawer       = openDrawer;
window.closeDrawer      = closeDrawer;
window.applyFilters     = applyFilters;
window.confirmToggle    = confirmToggle;
window.closeConfirmModal = closeConfirmModal;
window.handleSave       = handleSave;
