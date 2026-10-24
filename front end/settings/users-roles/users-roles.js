/* ============================================================
   HAULO BOUTIQUE ERP — Users & Roles Settings Controller
   Path: front end/settings/users-roles/users-roles.js
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  UsersSettings.init();
});

const UsersSettings = (() => {

  const _getApiBase = () => {
    if (typeof window !== 'undefined' && window.HAULO_API_BASE) return window.HAULO_API_BASE;
    if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:')) {
      return `${window.location.origin}/api/v1`;
    }
    return 'http://localhost:8080/api/v1';
  };

  function _getAuthToken() {
    const keys = ['erp_token', 'haulo_token', 'fashion_erp_token'];
    for (const k of keys) {
      const t = sessionStorage.getItem(k) || localStorage.getItem(k);
      if (t) return t;
    }
    return null;
  }

  function _escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function _setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
  }

  let _users = [];
  let _branches = [];
  let _usersLoading = false;
  let _modalMonogram = '';
  let _customMonogramTyped = false;

  function _generateCandidateMonograms(fullName, username) {
    const candidates = new Set();
    if (fullName && fullName.trim()) {
      const parts = fullName.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        candidates.add((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
        if (parts[0].length >= 2) candidates.add(parts[0].substring(0, 2).toUpperCase());
        if (parts.length >= 3) candidates.add((parts[0][0] + parts[1][0]).toUpperCase());
        if (parts[parts.length - 1].length >= 2) candidates.add(parts[parts.length - 1].substring(0, 2).toUpperCase());
      } else if (parts.length === 1) {
        const name = parts[0];
        if (name.length >= 2) candidates.add(name.substring(0, 2).toUpperCase());
        if (name.length >= 3) candidates.add((name[0] + name[2]).toUpperCase());
        if (name.length >= 4) candidates.add((name[0] + name[name.length - 1]).toUpperCase());
      }
    }
    if (username && username.trim()) {
      const cleanU = username.trim().replace(/[^a-zA-Z0-9]/g, '');
      if (cleanU.length >= 2) candidates.add(cleanU.substring(0, 2).toUpperCase());
    }
    const filtered = Array.from(candidates).filter(c => c && c.length === 2);
    return filtered.length > 0 ? filtered : ['NU'];
  }

  function updateMonogramOptions() {
    const fullName = (document.getElementById('modalUserFullName')?.value || '').trim();
    const username = (document.getElementById('modalUserUsername')?.value || '').trim();
    const suggestions = _generateCandidateMonograms(fullName, username);

    if (!_customMonogramTyped || !_modalMonogram) {
      _modalMonogram = suggestions[0] || 'NU';
    }

    const preview = document.getElementById('modalMonogramPreview');
    const container = document.getElementById('modalMonogramSuggestions');
    const customInput = document.getElementById('modalCustomMonogram');

    if (container) {
      if (!fullName && !username) {
        container.innerHTML = '<span style="font-size:11.5px;color:rgba(255,255,255,0.35);">Type name to see options...</span>';
      } else {
        container.innerHTML = suggestions.map(m => {
          const isSel = (m === _modalMonogram);
          return `<button type="button" class="modal-monogram-pill ${isSel ? 'selected' : ''}" onclick="UsersSettings.selectMonogram('${m}')">${_escapeHtml(m)}</button>`;
        }).join('');
      }
    }

    if (preview) preview.textContent = _modalMonogram || '--';
    if (customInput && !_customMonogramTyped) customInput.value = _modalMonogram || '';
  }

  function selectMonogram(m) {
    if (!m) return;
    const clean = m.toUpperCase().slice(0, 2);
    _modalMonogram = clean;
    _customMonogramTyped = false;

    const container = document.getElementById('modalMonogramSuggestions');
    if (container) {
      container.querySelectorAll('.modal-monogram-pill').forEach(btn => {
        btn.classList.toggle('selected', btn.textContent.trim() === clean);
      });
    }

    const preview = document.getElementById('modalMonogramPreview');
    const customInput = document.getElementById('modalCustomMonogram');
    if (preview) preview.textContent = clean;
    if (customInput) customInput.value = clean;
  }

  function handleCustomMonogram(val) {
    const clean = (val || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 2);
    const customInput = document.getElementById('modalCustomMonogram');
    if (customInput && customInput.value !== clean) customInput.value = clean;

    const preview = document.getElementById('modalMonogramPreview');
    const container = document.getElementById('modalMonogramSuggestions');

    if (clean.length === 2) {
      _modalMonogram = clean;
      _customMonogramTyped = true;
      if (preview) preview.textContent = clean;
      if (container) {
        container.querySelectorAll('.modal-monogram-pill').forEach(btn => {
          btn.classList.toggle('selected', btn.textContent.trim() === clean);
        });
      }
    } else if (clean.length === 0) {
      _customMonogramTyped = false;
      updateMonogramOptions();
    }
  }

  function init() {
    loadUsers();
    _loadBranchesDropdown();
  }

  async function _loadBranchesDropdown() {
    try {
      const token = _getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${_getApiBase()}/branches?size=100`, { headers });
      if (res.ok) {
        const data = await res.json();
        _branches = (data && data.content) ? data.content : (Array.isArray(data) ? data : []);
        const sel = document.getElementById('modalUserBranch');
        if (sel) {
          sel.innerHTML = '<option value="">All Branches / Central HQ</option>' +
            _branches.map(b => `<option value="${_escapeHtml(b.name)}">${_escapeHtml(b.name)}${b.branchCode ? ' (' + _escapeHtml(b.branchCode) + ')' : ''}</option>`).join('');
        }
      }
    } catch (_) {}
  }

  async function loadUsers() {
    if (_usersLoading) return;
    _usersLoading = true;
    const tbody = document.getElementById('usersTableBody');
    if (tbody && _users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:28px;color:rgba(255,255,255,0.4);">Loading users...</td></tr>`;
    }

    try {
      const token = _getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${_getApiBase()}/users`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      _users = Array.isArray(data) ? data : (data.content || []);
      _renderUsersTable(_users);
    } catch (err) {
      console.error('[UsersSettings] Load error:', err);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:28px;color:#f87171;">Failed to load users. <button class="btn-ghost-sm" onclick="UsersSettings.loadUsers()" style="margin-left:8px;">Retry</button></td></tr>`;
      }
    } finally {
      _usersLoading = false;
    }
  }

  function filterUsers() {
    const q = (document.getElementById('userSearchInput')?.value || '').trim().toLowerCase();
    const roleFilter = document.getElementById('userRoleFilter')?.value || 'ALL';
    const statusFilter = document.getElementById('userStatusFilter')?.value || 'ALL';

    const filtered = _users.filter(u => {
      const matchQ = !q || (u.fullName && u.fullName.toLowerCase().includes(q)) ||
                     (u.username && u.username.toLowerCase().includes(q)) ||
                     (u.email && u.email.toLowerCase().includes(q));
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' ||
                          (statusFilter === 'ACTIVE' && u.active) ||
                          (statusFilter === 'INACTIVE' && !u.active);
      return matchQ && matchRole && matchStatus;
    });

    _renderUsersTable(filtered);
  }

  function _renderUsersTable(list) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:36px;color:rgba(255,255,255,0.4);">No user accounts found. Click <strong>+ Add User</strong> to provision one.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(u => {
      const isActive = u.active !== false;
      const role = u.role || 'BRANCH_ADMIN';
      const branch = u.assignedBranch || 'Central HQ / All';
      const initials = (u.avatarUrl && u.avatarUrl.startsWith('monogram:'))
        ? u.avatarUrl.substring(9).trim().slice(0, 2).toUpperCase()
        : (u.fullName || u.username || 'U').split(/\s+/).map(p => p[0]).join('').substring(0, 2).toUpperCase();

      let roleColor = 'rgba(255,255,255,0.7)';
      let roleBg = 'rgba(255,255,255,0.06)';
      let roleBorder = 'rgba(255,255,255,0.1)';

      if (role === 'ADMIN' || role === 'OWNER') {
        roleColor = '#b8ff3d'; roleBg = 'rgba(184,255,61,0.12)'; roleBorder = 'rgba(184,255,61,0.25)';
      } else if (role === 'BRANCH_ADMIN') {
        roleColor = '#60a5fa'; roleBg = 'rgba(59,130,246,0.12)'; roleBorder = 'rgba(59,130,246,0.25)';
      } else {
        roleColor = '#C084FC'; roleBg = 'rgba(192,132,252,0.12)'; roleBorder = 'rgba(192,132,252,0.25)';
      }

      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="user-avatar-initials">${initials}</div>
              <div>
                <div style="font-weight:600;color:#fff;">${_escapeHtml(u.fullName || u.username)}</div>
                <div style="font-size:11.5px;color:rgba(255,255,255,0.45);">${_escapeHtml(u.email || '@' + u.username)}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="display:inline-block;padding:2px 8px;border-radius:5px;font-size:11px;font-weight:700;color:${roleColor};background:${roleBg};border:1px solid ${roleBorder};">
              ${_escapeHtml(role)}
            </span>
          </td>
          <td style="font-size:12.5px;color:rgba(255,255,255,0.7);">${_escapeHtml(branch)}</td>
          <td>
            <span class="badge-status ${isActive ? 'active' : 'inactive'}">
              <span style="width:5px;height:5px;border-radius:50%;background:currentColor;"></span>
              ${isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <div style="display:inline-flex;gap:6px;">
              <a href="../../users-roles/create-user/create-user.html?edit=${encodeURIComponent(u.id)}" class="btn-ghost-sm" title="Edit user profile" style="text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
                <i data-lucide="edit-3" style="width:13px;height:13px;"></i> Edit
              </a>
              <button class="btn-ghost-sm" onclick="UsersSettings.toggleUserStatus('${u.id}', ${isActive})" title="${isActive ? 'Deactivate' : 'Activate'} user" style="${!isActive ? 'color:#4ade80;' : 'color:rgba(255,255,255,0.6);'}">
                <i data-lucide="${isActive ? 'user-x' : 'user-check'}" style="width:13px;height:13px;"></i> ${isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function openUserModal(userId = null) {
    if (userId) {
      window.location.href = `../../users-roles/create-user/create-user.html?edit=${encodeURIComponent(userId)}`;
    } else {
      window.location.href = `../../users-roles/create-user/create-user.html`;
    }
  }

  function closeUserModal() {
    const modal = document.getElementById('quickUserModal');
    if (modal) modal.style.display = 'none';
  }

  async function saveUser() {
    const id = document.getElementById('modalUserId')?.value;
    const fullName = (document.getElementById('modalUserFullName')?.value || '').trim();
    const username = (document.getElementById('modalUserUsername')?.value || '').trim();
    const email = (document.getElementById('modalUserEmail')?.value || '').trim();
    const password = (document.getElementById('modalUserPassword')?.value || '').trim();
    const role = document.getElementById('modalUserRole')?.value || 'BRANCH_ADMIN';
    const assignedBranch = document.getElementById('modalUserBranch')?.value || '';
    const active = document.getElementById('modalUserActive')?.checked || false;

    if (!fullName) {
      showToast('Please enter full name', 'error');
      return;
    }
    if (!id && !username) {
      showToast('Please enter a username', 'error');
      return;
    }
    if (!id && !password) {
      showToast('Please enter a password', 'error');
      return;
    }

    const chosenMonogram = (_modalMonogram || (fullName ? fullName.substring(0, 2) : 'NU')).trim().substring(0, 2).toUpperCase();

    const payload = {
      fullName,
      email,
      role,
      assignedBranch: assignedBranch || null,
      avatarUrl: `monogram:${chosenMonogram}`,
      status: active ? 'ACTIVE' : 'SUSPENDED'
    };
    if (!id) {
      payload.username = username;
      payload.password = password;
    }

    const btn = document.getElementById('btnSaveUser');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

    try {
      const token = _getAuthToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = id ? `${_getApiBase()}/users/${id}` : `${_getApiBase()}/users`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      showToast(id ? '✓ User updated successfully' : '✓ User created successfully', 'success');
      closeUserModal();
      await loadUsers();
    } catch (err) {
      console.error('[UsersSettings] Error saving user:', err);
      showToast('Failed to save user: ' + err.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Save User'; }
    }
  }

  async function toggleUserStatus(userId, currentActive) {
    try {
      const token = _getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`${_getApiBase()}/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      showToast(`✓ User account ${currentActive ? 'deactivated' : 'activated'}`, 'success');
      await loadUsers();
    } catch (err) {
      console.error('[UsersSettings] Error toggling status:', err);
      showToast('Failed to toggle user status', 'error');
    }
  }

  let _toastTimer = null;
  function showToast(msg, type = 'success') {
    const t = document.getElementById('settingsToast');
    if (!t) return;
    clearTimeout(_toastTimer);
    t.className = `settings-toast ${type}`;
    t.textContent = msg;
    t.classList.add('show');
    _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  return {
    init,
    loadUsers,
    filterUsers,
    openUserModal,
    closeUserModal,
    updateMonogramOptions,
    selectMonogram,
    handleCustomMonogram,
    saveUser,
    toggleUserStatus,
    showToast
  };
})();
