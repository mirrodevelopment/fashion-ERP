/* ============================================================
   HAULO BOUTIQUE ERP — Branches & Locations Controller
   Path: front end/settings/branches/branches.js
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  BranchesSettings.init();
});

const BranchesSettings = (() => {

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

  let _branches = [];
  let _branchesLoading = false;

  function init() {
    loadBranches();
  }

  async function loadBranches() {
    if (_branchesLoading) return;
    _branchesLoading = true;
    const tbody = document.getElementById('branchesTableBody');
    if (tbody && _branches.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:28px;color:rgba(255,255,255,0.4);">Loading branches...</td></tr>`;
    }

    try {
      const token = _getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${_getApiBase()}/branches?size=100`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      _branches = (data && data.content) ? data.content : (Array.isArray(data) ? data : []);
      _renderBranchesTable(_branches);
    } catch (err) {
      console.error('[BranchesSettings] Load error:', err);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:28px;color:#f87171;">Failed to load branches. <button class="btn-ghost-sm" onclick="BranchesSettings.loadBranches()" style="margin-left:8px;">Retry</button></td></tr>`;
      }
    } finally {
      _branchesLoading = false;
    }
  }

  function filterBranches() {
    const q = (document.getElementById('branchSearchInput')?.value || '').trim().toLowerCase();
    const typeFilter = document.getElementById('branchTypeFilter')?.value || 'ALL';
    const statusFilter = document.getElementById('branchStatusFilter')?.value || 'ALL';

    const filtered = _branches.filter(b => {
      const matchQ = !q || (b.name && b.name.toLowerCase().includes(q)) ||
                     (b.branchCode && b.branchCode.toLowerCase().includes(q)) ||
                     (b.city && b.city.toLowerCase().includes(q));
      const matchType = typeFilter === 'ALL' || b.type === typeFilter;
      const matchStatus = statusFilter === 'ALL' ||
                          (statusFilter === 'ACTIVE' && b.active) ||
                          (statusFilter === 'INACTIVE' && !b.active);
      return matchQ && matchType && matchStatus;
    });

    _renderBranchesTable(filtered);
  }

  function _renderBranchesTable(list) {
    const tbody = document.getElementById('branchesTableBody');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:36px;color:rgba(255,255,255,0.4);">No branches found. Click <strong>+ Add Branch</strong> to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(b => {
      const isHq = Boolean(b.isHeadquarters);
      const isActive = Boolean(b.active);
      const typeLabel = b.type ? b.type.replace(/_/g, ' ') : 'Showroom';
      const cityLoc = [b.city, b.state].filter(Boolean).join(', ') || '—';
      const contact = [b.phone, b.email].filter(Boolean).join(' · ') || '—';

      return `
        <tr>
          <td>
            <div class="branch-name-wrap">
              <span style="font-weight:600;color:#fff;">${_escapeHtml(b.name || 'Unnamed Branch')}</span>
              ${b.branchCode ? `<span class="branch-code-pill">${_escapeHtml(b.branchCode)}</span>` : ''}
              ${isHq ? `<span class="badge-hq">HQ</span>` : ''}
            </div>
          </td>
          <td><span class="badge-type">${_escapeHtml(typeLabel)}</span></td>
          <td>${_escapeHtml(cityLoc)}</td>
          <td style="font-size:12px;color:rgba(255,255,255,0.65);">${_escapeHtml(contact)}</td>
          <td>
            <span class="badge-status ${isActive ? 'active' : 'inactive'}">
              <span style="width:5px;height:5px;border-radius:50%;background:currentColor;"></span>
              ${isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <div style="display:inline-flex;gap:6px;">
              <button class="btn-ghost-sm" onclick="BranchesSettings.openBranchModal('${b.id}')" title="Edit branch details">
                <i data-lucide="edit-3" style="width:13px;height:13px;"></i> Edit
              </button>
              <button class="btn-ghost-sm" onclick="BranchesSettings.toggleBranchStatus('${b.id}', ${isActive})" title="${isActive ? 'Deactivate' : 'Activate'} branch" style="${!isActive ? 'color:#4ade80;' : 'color:rgba(255,255,255,0.6);'}">
                <i data-lucide="${isActive ? 'power-off' : 'check'}" style="width:13px;height:13px;"></i> ${isActive ? 'Disable' : 'Enable'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function openBranchModal(branchId = null) {
    const modal = document.getElementById('branchModal');
    if (!modal) return;
    const title = document.getElementById('branchModalTitle');
    const idInput = document.getElementById('modalBranchId');

    if (branchId) {
      const b = _branches.find(x => String(x.id) === String(branchId));
      if (!b) return;
      if (title) title.textContent = 'Edit Branch';
      if (idInput) idInput.value = b.id;
      _setVal('modalBranchName', b.name || '');
      _setVal('modalBranchCode', b.branchCode || '');
      _setVal('modalBranchType', b.type || 'SHOWROOM');
      _setVal('modalBranchPhone', b.phone || '');
      _setVal('modalBranchEmail', b.email || '');
      _setVal('modalBranchCity', b.city || '');
      _setVal('modalBranchState', b.state || '');
      _setVal('modalBranchPinCode', b.pinCode || '');
      _setVal('modalBranchAddress', b.streetAddress || '');
      const hqCheck = document.getElementById('modalBranchHq');
      if (hqCheck) hqCheck.checked = Boolean(b.isHeadquarters);
      const activeCheck = document.getElementById('modalBranchActive');
      if (activeCheck) activeCheck.checked = b.active !== false;
    } else {
      if (title) title.textContent = 'Add New Branch';
      if (idInput) idInput.value = '';
      _setVal('modalBranchName', '');
      _setVal('modalBranchCode', '');
      _setVal('modalBranchType', 'SHOWROOM');
      _setVal('modalBranchPhone', '');
      _setVal('modalBranchEmail', '');
      _setVal('modalBranchCity', '');
      _setVal('modalBranchState', '');
      _setVal('modalBranchPinCode', '');
      _setVal('modalBranchAddress', '');
      const hqCheck = document.getElementById('modalBranchHq');
      if (hqCheck) hqCheck.checked = false;
      const activeCheck = document.getElementById('modalBranchActive');
      if (activeCheck) activeCheck.checked = true;
    }

    modal.style.display = 'flex';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function closeBranchModal() {
    const modal = document.getElementById('branchModal');
    if (modal) modal.style.display = 'none';
  }

  async function saveBranch() {
    const id = document.getElementById('modalBranchId')?.value;
    const name = (document.getElementById('modalBranchName')?.value || '').trim();
    const branchCode = (document.getElementById('modalBranchCode')?.value || '').trim().toUpperCase();
    const type = document.getElementById('modalBranchType')?.value || 'SHOWROOM';
    const city = (document.getElementById('modalBranchCity')?.value || '').trim();

    if (!name) {
      showToast('Please enter a branch name', 'error');
      return;
    }
    if (!city) {
      showToast('Please enter a city', 'error');
      return;
    }

    const payload = {
      name,
      branchCode,
      type,
      phone: (document.getElementById('modalBranchPhone')?.value || '').trim(),
      email: (document.getElementById('modalBranchEmail')?.value || '').trim(),
      city,
      state: (document.getElementById('modalBranchState')?.value || '').trim(),
      pinCode: (document.getElementById('modalBranchPinCode')?.value || '').trim(),
      streetAddress: (document.getElementById('modalBranchAddress')?.value || '').trim(),
      isHeadquarters: document.getElementById('modalBranchHq')?.checked || false,
      active: document.getElementById('modalBranchActive')?.checked || false
    };

    const btn = document.getElementById('btnSaveBranch');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

    try {
      const token = _getAuthToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = id ? `${_getApiBase()}/branches/${id}` : `${_getApiBase()}/branches`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      showToast(id ? '✓ Branch updated successfully' : '✓ Branch created successfully', 'success');
      closeBranchModal();
      await loadBranches();
    } catch (err) {
      console.error('[BranchesSettings] Error saving branch:', err);
      showToast('Failed to save branch: ' + err.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Save Branch'; }
    }
  }

  async function toggleBranchStatus(branchId, currentActive) {
    try {
      const token = _getAuthToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const endpoint = currentActive ? 'deactivate' : 'activate';

      const res = await fetch(`${_getApiBase()}/branches/${branchId}/${endpoint}`, {
        method: 'PATCH',
        headers
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      showToast(`✓ Branch ${currentActive ? 'deactivated' : 'activated'}`, 'success');
      await loadBranches();
    } catch (err) {
      console.error('[BranchesSettings] Error toggling branch status:', err);
      showToast('Failed to update branch status', 'error');
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
    loadBranches,
    filterBranches,
    openBranchModal,
    closeBranchModal,
    saveBranch,
    toggleBranchStatus,
    showToast
  };
})();
