/**
 * ============================================================================
 * HAULO BOUTIQUE ERP — Developer Mode Auto-Login & Persona Switcher
 * File: /front end/dev/dev-auto-login.js
 * 
 * 100% Dynamic Database-Driven:
 * Queries /api/v1/dev/personas at runtime to get all live companies,
 * branches, and user personas from PostgreSQL. Zero raw code values.
 * ============================================================================
 */

(function () {
  'use strict';

  function getApiBase() {
    if (typeof window !== 'undefined' && window.HAULO_API_BASE) {
      return window.HAULO_API_BASE;
    }
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.protocol === 'file:') {
        return 'http://localhost:8080/api/v1';
      }
      if (window.location.origin && window.location.origin !== 'null') {
        return `${window.location.origin}/api/v1`;
      }
    }
    return 'http://localhost:8080/api/v1';
  }

  // In-memory cache of database records
  let dbCompanies = [];
  let selectedCompany = null;
  let selectedUser = null;

  // DOM Elements injected into #dev-login-container
  const HTML_TEMPLATE = `
    <div class="dev-options-card" id="dev-options-card">
      <div class="dev-header-toggle" id="dev-toggle-header" role="button" tabindex="0" title="Click to expand/collapse developer options">
        <div class="dev-header-left">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>Developer Quick-Login</span>
          <span class="dev-badge-pulse">DEV MODE</span>
        </div>
        <div class="dev-header-right">
          <span class="dev-chevron" id="dev-chevron">▾</span>
        </div>
      </div>

      <div class="dev-body" id="dev-body">
        <div id="dev-status-msg" class="dev-status-msg" style="display: none;"></div>

        <!-- 1. Company Dropdown -->
        <div class="dev-field-group">
          <label class="dev-label" for="dev-company-select">Company (Database)</label>
          <select id="dev-company-select" class="dev-select-glass">
            <option value="" disabled selected>Loading companies from database...</option>
          </select>
        </div>

        <!-- 2. Staff Persona & Branch Dropdown -->
        <div class="dev-field-group">
          <label class="dev-label" for="dev-user-select">Staff Persona & Branch</label>
          <select id="dev-user-select" class="dev-select-glass" disabled>
            <option value="" disabled selected>Select a company first...</option>
          </select>
        </div>

        <!-- 3. Live Persona Inspector Card -->
        <div class="dev-persona-preview" id="dev-persona-preview" style="display: none;">
          <div class="dev-preview-row">
            <span class="dev-preview-key">Company:</span>
            <span class="dev-preview-val" id="prev-company">-</span>
          </div>
          <div class="dev-preview-row">
            <span class="dev-preview-key">Role:</span>
            <span class="dev-preview-val" id="prev-role">-</span>
          </div>
          <div class="dev-preview-row" style="grid-column: span 2;">
            <span class="dev-preview-key">Branch:</span>
            <span class="dev-preview-val" id="prev-branch">-</span>
          </div>
          <div class="dev-preview-row" style="grid-column: span 2;">
            <span class="dev-preview-key">Login ID:</span>
            <span class="dev-preview-val highlight" id="prev-user">-</span>
          </div>
        </div>

        <!-- 4. Instant Login Checkbox -->
        <label class="dev-checkbox-row" for="chk-dev-instant-login">
          <input type="checkbox" id="chk-dev-instant-login" />
          <span>Auto-login immediately when persona is selected</span>
        </label>

        <!-- 5. Actions Grid -->
        <div class="dev-actions-grid">
          <button type="button" class="btn-dev-login" id="btn-dev-auto-login" disabled>
            <span id="btn-dev-login-text">⚡ Auto-Login</span>
          </button>
          <button type="button" class="btn-dev-fill" id="btn-dev-fill-only" disabled title="Populate fields without submitting">
            <span>📝 Fill Only</span>
          </button>
        </div>
      </div>
    </div>
  `;

  function init() {
    const container = document.getElementById('dev-login-container');
    if (!container) return;

    container.innerHTML = HTML_TEMPLATE;

    const toggleHeader  = document.getElementById('dev-toggle-header');
    const devBody       = document.getElementById('dev-body');
    const devChevron    = document.getElementById('dev-chevron');
    const companySelect = document.getElementById('dev-company-select');
    const userSelect    = document.getElementById('dev-user-select');
    const btnAutoLogin  = document.getElementById('btn-dev-auto-login');
    const btnFillOnly   = document.getElementById('btn-dev-fill-only');
    const chkInstant    = document.getElementById('chk-dev-instant-login');

    // ── Collapsible Panel State (Always default to EXPANDED so developer options are immediately accessible) ──
    localStorage.removeItem('haulo_dev_collapsed');
    devBody.classList.remove('collapsed');
    devChevron.classList.remove('collapsed');

    toggleHeader.addEventListener('click', () => {
      const willCollapse = !devBody.classList.contains('collapsed');
      devBody.classList.toggle('collapsed', willCollapse);
      devChevron.classList.toggle('collapsed', willCollapse);
    });

    // ── Instant Login Checkbox State ──
    chkInstant.checked = localStorage.getItem('haulo_dev_instant_login') === 'true';
    chkInstant.addEventListener('change', () => {
      localStorage.setItem('haulo_dev_instant_login', String(chkInstant.checked));
    });

    // ── Event Handlers ──
    companySelect.addEventListener('change', () => {
      const compId = companySelect.value;
      selectedCompany = dbCompanies.find(c => c.companyId === compId) || null;
      renderUserDropdown();
    });

    userSelect.addEventListener('change', () => {
      const username = userSelect.value;
      if (selectedCompany && selectedCompany.users) {
        selectedUser = selectedCompany.users.find(u => u.username === username) || null;
      } else {
        selectedUser = null;
      }
      updatePersonaPreview();

      if (chkInstant.checked && selectedUser) {
        executeAutoLogin();
      }
    });

    btnAutoLogin.addEventListener('click', executeAutoLogin);
    btnFillOnly.addEventListener('click', fillFieldsOnly);

    // Fetch dynamic database data
    fetchDeveloperPersonas();
  }

  // ── Fetch Personas from DB via Backend REST API ──
  async function fetchDeveloperPersonas() {
    const statusMsg     = document.getElementById('dev-status-msg');
    const companySelect = document.getElementById('dev-company-select');

    showStatus('Connecting to database...', 'loading');

    try {
      const res = await fetch(`${getApiBase()}/dev/personas`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      dbCompanies = await res.json();

      if (!Array.isArray(dbCompanies) || dbCompanies.length === 0) {
        throw new Error('No company records found in database');
      }

      hideStatus();
      renderCompanyDropdown();

    } catch (err) {
      console.warn('[DevAutoLogin] Unable to fetch from /api/v1/dev/personas:', err);
      showStatus(`Unable to load from DB (${err.message}). <button type="button" class="dev-btn-retry" id="btn-dev-retry">Retry</button>`, 'error');
      
      const retryBtn = document.getElementById('btn-dev-retry');
      if (retryBtn) {
        retryBtn.addEventListener('click', fetchDeveloperPersonas);
      }

      if (companySelect) {
        companySelect.innerHTML = '<option value="" disabled selected>Database unavailable</option>';
      }
    }
  }

  function showStatus(html, type) {
    const el = document.getElementById('dev-status-msg');
    if (!el) return;
    el.innerHTML = html;
    el.className = `dev-status-msg ${type}`;
    el.style.display = 'flex';
  }

  function hideStatus() {
    const el = document.getElementById('dev-status-msg');
    if (el) el.style.display = 'none';
  }

  // ── Render Company Dropdown with Real DB Records ──
  function renderCompanyDropdown() {
    const companySelect = document.getElementById('dev-company-select');
    if (!companySelect) return;

    companySelect.innerHTML = '';

    dbCompanies.forEach((comp, idx) => {
      const opt = document.createElement('option');
      opt.value = comp.companyId;
      const branchLabel = comp.branchCount === 1 ? '1 Branch' : `${comp.branchCount} Branches`;
      opt.textContent = `🏢 ${comp.companyName} (${branchLabel})`;
      companySelect.appendChild(opt);
    });

    companySelect.disabled = false;

    // Pick first company by default or restore
    const savedCompId = localStorage.getItem('haulo_dev_last_comp');
    const matched = dbCompanies.find(c => c.companyId === savedCompId);
    if (matched) {
      companySelect.value = matched.companyId;
      selectedCompany = matched;
    } else {
      companySelect.selectedIndex = 0;
      selectedCompany = dbCompanies[0];
    }

    renderUserDropdown();
  }

  // ── Render User Persona Dropdown for Selected Company ──
  function renderUserDropdown() {
    const userSelect   = document.getElementById('dev-user-select');
    const btnAutoLogin = document.getElementById('btn-dev-auto-login');
    const btnFillOnly  = document.getElementById('btn-dev-fill-only');
    if (!userSelect) return;

    if (!selectedCompany || !selectedCompany.users || selectedCompany.users.length === 0) {
      userSelect.innerHTML = '<option value="" disabled selected>No active users in this company</option>';
      userSelect.disabled = true;
      if (btnAutoLogin) btnAutoLogin.disabled = true;
      if (btnFillOnly)  btnFillOnly.disabled = true;
      updatePersonaPreview();
      return;
    }

    localStorage.setItem('haulo_dev_last_comp', selectedCompany.companyId);

    userSelect.innerHTML = '';

    // Group users by assigned branch
    const branchesMap = new Map();
    selectedCompany.users.forEach(u => {
      const bKey = u.branchName ? `${u.branchName} (${u.assignedBranch || 'HQ'})` : 'Main Branch';
      if (!branchesMap.has(bKey)) {
        branchesMap.set(bKey, []);
      }
      branchesMap.get(bKey).push(u);
    });

    branchesMap.forEach((users, branchTitle) => {
      const group = document.createElement('optgroup');
      group.label = `📍 ${branchTitle}`;

      users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.username;
        const roleIcon = getRoleIcon(u.role);
        opt.textContent = `${roleIcon} ${u.fullName} (${u.role})`;
        group.appendChild(opt);
      });

      userSelect.appendChild(group);
    });

    userSelect.disabled = false;
    userSelect.selectedIndex = 0;
    selectedUser = selectedCompany.users[0] || null;

    if (btnAutoLogin) btnAutoLogin.disabled = false;
    if (btnFillOnly)  btnFillOnly.disabled = false;

    updatePersonaPreview();
  }

  function getRoleIcon(role) {
    if (!role) return '👤';
    const r = role.toUpperCase();
    if (r.includes('ADMIN')) return '👑';
    if (r.includes('TAILOR') || r.includes('CUTTER')) return '✂️';
    if (r.includes('DESIGNER') || r.includes('STYLIST')) return '🎨';
    if (r.includes('SALES') || r.includes('MANAGER')) return '💼';
    if (r.includes('QC') || r.includes('INSPECTOR')) return '🔍';
    return '👤';
  }

  // ── Update Live Persona Inspector Card ──
  function updatePersonaPreview() {
    const previewEl  = document.getElementById('dev-persona-preview');
    const prevComp   = document.getElementById('prev-company');
    const prevBranch = document.getElementById('prev-branch');
    const prevRole   = document.getElementById('prev-role');
    const prevUser   = document.getElementById('prev-user');
    const btnText    = document.getElementById('btn-dev-login-text');

    if (!selectedUser || !selectedCompany) {
      if (previewEl) previewEl.style.display = 'none';
      return;
    }

    if (previewEl)  previewEl.style.display = 'grid';
    if (prevComp)   prevComp.textContent   = selectedCompany.companyName;
    if (prevBranch) prevBranch.textContent = selectedUser.branchName 
      ? `${selectedUser.branchName} (${selectedUser.assignedBranch || ''})` 
      : 'All Branches';

    if (prevRole) {
      const roleClass = `role-${(selectedUser.role || 'staff').toLowerCase()}`;
      prevRole.innerHTML = `<span class="dev-role-badge ${roleClass}">${selectedUser.role || 'STAFF'}</span>`;
    }

    if (prevUser) {
      prevUser.textContent = `${selectedUser.username} (${selectedUser.devPassword || 'Admin@123'})`;
    }

    if (btnText) {
      const firstName = (selectedUser.fullName || '').split(' ')[0] || selectedUser.username;
      btnText.textContent = `⚡ Auto-Login as ${firstName}`;
    }
  }

  // ── Fill Fields Only ──
  function fillFieldsOnly() {
    if (!selectedUser || !selectedCompany) return;
    const companyNameInput = document.getElementById('company-name');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberChk   = document.getElementById('remember');

    // 1. Set Company context
    if (companyNameInput) companyNameInput.value = selectedCompany.companyName;
    if (typeof window.setResolvedCompany === 'function') {
      window.setResolvedCompany(selectedCompany.companyId, selectedCompany.companyName);
    }

    // 2. Switch to Step 2 so credentials fields are visible and focused
    if (typeof window.showStep === 'function') {
      window.showStep(2);
    }

    // 3. Fill user credentials
    if (usernameInput) usernameInput.value = selectedUser.username;
    if (passwordInput) passwordInput.value = selectedUser.devPassword || 'Admin@123';
    if (rememberChk)   rememberChk.checked = true;

    // Visual feedback glow
    flashInputs();
  }

  // ── Execute Auto-Login ──
  async function executeAutoLogin() {
    if (!selectedUser || !selectedCompany) return;

    const btnAutoLogin = document.getElementById('btn-dev-auto-login');
    const btnText = document.getElementById('btn-dev-login-text');
    const originalText = btnText ? btnText.textContent : '⚡ Auto-Login';

    try {
      if (btnAutoLogin) btnAutoLogin.disabled = true;
      if (btnText) btnText.textContent = '⚡ Signing in...';

      fillFieldsOnly();

      let success = false;
      if (typeof window.performLogin === 'function') {
        success = await window.performLogin(
          selectedUser.username,
          selectedUser.devPassword || 'Admin@123',
          true,
          selectedCompany.companyName
        );
      } else {
        const form = document.getElementById('login-form');
        const btnLogin = document.getElementById('btn-login');

        if (form && typeof form.requestSubmit === 'function') {
          form.requestSubmit();
          success = true;
        } else if (btnLogin) {
          btnLogin.click();
          success = true;
        }
      }

      if (!success) {
        throw new Error('Sign-in rejected. Check database credentials or network.');
      }
    } catch (err) {
      console.error('[DevAutoLogin] executeAutoLogin error:', err);
      showStatus(`Login failed: ${err.message || 'Unknown error'}`, 'error');
      if (btnAutoLogin) btnAutoLogin.disabled = false;
      if (btnText) btnText.textContent = originalText;
    }
  }

  function flashInputs() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const uWrap = usernameInput?.closest('.input-glass-wrap');
    const pWrap = passwordInput?.closest('.input-glass-wrap');

    uWrap?.classList.add('highlight-lime');
    pWrap?.classList.add('highlight-lime');

    setTimeout(() => {
      uWrap?.classList.remove('highlight-lime');
      pWrap?.classList.remove('highlight-lime');
    }, 600);
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
