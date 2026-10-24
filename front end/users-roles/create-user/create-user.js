/* ============================================================
   HAULO BOUTIQUE ERP — CREATE NEW USER WORKSPACE CONTROLLER
   File: front end/users-roles/create-user/create-user.js
   Dynamic role & branch binding, zero raw code values,
   real-time preview sync, strength calculation, and draft support.
   ============================================================ */

'use strict';

// ─── Global State ───
const userState = {
  username: '',
  fullName: '',
  password: '',
  confirmPassword: '',
  role: '', // Set from server response
  active: true,
  designation: '',
  department: '',
  assignedBranch: '',
  email: '',
  phone: '',
  rolesList: [],
  branchesList: [],
  moduleRegistry: [],
  selectedModules: new Set(),
  selectedBranches: new Set(),
  selectedMonogram: '',
  customMonogramTyped: false,
  isEditMode: false,
  editUserId: null
};

const DRAFT_KEY = 'haulo_create_user_draft';

// ─── DOM References Cache ───
let dom = {};

function cacheDom() {
  dom = {
    form: document.getElementById('createUserForm'),
    scrollContainer: document.getElementById('createUserScroll'),
    // Account inputs
    usernameInput: document.getElementById('usernameInput'),
    fullNameInput: document.getElementById('fullNameInput'),
    passwordInput: document.getElementById('passwordInput'),
    confirmPasswordInput: document.getElementById('confirmPasswordInput'),
    userActiveToggle: document.getElementById('userActiveToggle'),
    statusToggleText: document.getElementById('statusToggleText'),
    strengthBar: document.getElementById('strengthBar'),
    strengthLabel: document.getElementById('strengthLabel'),
    passwordMatchHint: document.getElementById('passwordMatchHint'),
    // Monogram Avatar elements
    cuMonogramPreview: document.getElementById('cuMonogramPreview'),
    cuMonogramSuggestions: document.getElementById('cuMonogramSuggestions'),
    cuCustomMonogramInput: document.getElementById('cuCustomMonogramInput'),
    // Role elements
    rolesContainer: document.getElementById('rolesContainer'),
    roleCapabilitiesBox: document.getElementById('roleCapabilitiesBox'),
    capTitle: document.getElementById('capTitle'),
    capPillsContainer: document.getElementById('capPillsContainer'),
    // Organization inputs
    designationInput: document.getElementById('designationInput'),
    departmentInput: document.getElementById('departmentInput'),
    assignedBranchSelect: document.getElementById('assignedBranchSelect'),
    branchClearanceContainer: document.getElementById('branchClearanceContainer'),
    branchClearanceActionBtns: document.getElementById('branchClearanceActionBtns'),
    // Contact inputs
    emailInput: document.getElementById('emailInput'),
    phoneInput: document.getElementById('phoneInput'),
    // Card 5 Access elements
    cardAccess: document.getElementById('cardAccess'),
    accessCounter: document.getElementById('accessCounter'),
    moduleAccessGrid: document.getElementById('moduleAccessGrid'),
    sumAccessCount: document.getElementById('sumAccessCount'),
    // Live Preview elements
    sumAvatarCircle: document.getElementById('sumAvatarCircle'),
    sumAvatarInitials: document.getElementById('sumAvatarInitials'),
    sumFullName: document.getElementById('sumFullName'),
    sumUsername: document.getElementById('sumUsername'),
    sumRolePill: document.getElementById('sumRolePill'),
    sumRoleText: document.getElementById('sumRoleText'),
    sumStatusPill: document.getElementById('sumStatusPill'),
    sumStatusText: document.getElementById('sumStatusText'),
    sumDesignation: document.getElementById('sumDesignation'),
    sumDepartment: document.getElementById('sumDepartment'),
    sumBranch: document.getElementById('sumBranch'),
    sumEmail: document.getElementById('sumEmail'),
    sumPhone: document.getElementById('sumPhone'),
    sumProvisionDate: document.getElementById('sumProvisionDate'),
    // Buttons
    btnSubmitUser: document.getElementById('btnCreateUser') || document.getElementById('btnSubmitUser'),
    btnSubmitText: document.getElementById('btnSubmitText'),
    btnSaveDraft: document.getElementById('btnSaveDraft'),
    toastContainer: document.getElementById('cuToastContainer'),
    // Edit Mode Banner elements
    cuEditModeBanner: document.getElementById('cuEditModeBanner'),
    cuEditBannerUser: document.getElementById('cuEditBannerUser'),
    cuEditBannerName: document.getElementById('cuEditBannerName'),
    btnSwitchToCreate: document.getElementById('btnSwitchToCreate')
  };
}

// ─── Date Formatter using Intl.DateTimeFormat (Zero Raw Formats) ───
function formatCurrentDateTime() {
  try {
    const formatter = new Intl.DateTimeFormat(navigator.language || 'en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    return formatter.format(new Date());
  } catch (e) {
    return new Date().toLocaleDateString();
  }
}

// ─── Edit Mode Support ───
async function initEditMode(userId) {
  try {
    userState.isEditMode = true;
    userState.editUserId = userId;

    // Fetch user from API
    const user = await (window.api.users.get ? window.api.users.get(userId) : window.api.users.getById(userId));
    if (!user) throw new Error('User not found on server.');

    userState.originalUsername = user.username || '';

    // Show Edit Mode Banner
    if (dom.cuEditModeBanner) {
      dom.cuEditModeBanner.style.display = 'flex';
      if (dom.cuEditBannerUser) dom.cuEditBannerUser.textContent = '@' + (user.username || '');
      if (dom.cuEditBannerName) dom.cuEditBannerName.textContent = user.fullName || user.username || '';
    }

    // Update Header
    const titleEl = document.querySelector('.cu-page-title');
    if (titleEl) {
      titleEl.innerHTML = '<i data-lucide="user-cog" class="cu-title-icon"></i> Edit User Access &amp; Permissions';
    }
    const subEl = document.querySelector('.cu-page-subtitle');
    if (subEl) {
      subEl.textContent = `Modifying account credentials, branch clearance, and module access for @${user.username || 'user'}.`;
    }

    // Update Submit Button & Actions
    if (dom.btnSubmitText) dom.btnSubmitText.textContent = `Save Changes to @${user.username || 'user'}`;
    if (dom.btnSubmitUser) {
      const icon = dom.btnSubmitUser.querySelector('svg, i');
      if (icon) icon.setAttribute('data-lucide', 'save');
    }
    if (dom.btnSaveDraft) dom.btnSaveDraft.style.display = 'none';

    // Password is optional in edit mode
    if (dom.passwordInput) {
      dom.passwordInput.removeAttribute('required');
      dom.passwordInput.placeholder = 'Leave blank to retain current password';
    }
    if (dom.confirmPasswordInput) {
      dom.confirmPasswordInput.removeAttribute('required');
      dom.confirmPasswordInput.placeholder = 'Leave blank to retain current password';
    }
    const passReq = document.querySelectorAll('#cardAccount .cu-field .cu-req');
    if (passReq.length >= 2) {
      passReq[passReq.length - 2].style.display = 'none';
      passReq[passReq.length - 1].style.display = 'none';
    }

    // Populate Fields
    if (dom.usernameInput) {
      dom.usernameInput.value = user.username || '';
      dom.usernameInput.disabled = true;
      dom.usernameInput.style.opacity = '0.7';
      dom.usernameInput.style.cursor = 'not-allowed';
      userState.username = user.username || '';
    }
    if (dom.fullNameInput) {
      dom.fullNameInput.value = user.fullName || '';
      userState.fullName = user.fullName || '';
    }
    if (dom.emailInput) dom.emailInput.value = user.email || '';
    if (dom.phoneInput) {
      dom.phoneInput.value = (user.phone || '').replace(/\+91\s*/, '').trim();
    }
    if (dom.designationInput) dom.designationInput.value = user.designation || '';
    if (dom.departmentInput) dom.departmentInput.value = user.department || '';

    userState.active = (user.active !== false && user.status !== 'SUSPENDED');

    // Monogram Avatar
    if (user.avatarUrl && user.avatarUrl.startsWith('monogram:')) {
      const savedMono = user.avatarUrl.substring(9).trim().slice(0, 2).toUpperCase();
      userState.selectedMonogram = savedMono;
      userState.customMonogramTyped = true;
      if (dom.cuCustomMonogramInput) dom.cuCustomMonogramInput.value = savedMono;
      if (dom.cuMonogramPreview) dom.cuMonogramPreview.textContent = savedMono;
    } else {
      userState.selectedMonogram = '';
      userState.customMonogramTyped = false;
    }

    // Role
    if (user.role) {
      selectRole(user.role);
    }

    // Assigned Branch
    if (dom.assignedBranchSelect && user.assignedBranch) {
      dom.assignedBranchSelect.value = user.assignedBranch;
      userState.assignedBranch = user.assignedBranch;
    }

    // Allowed Branches
    if (Array.isArray(user.allowedBranches) && user.allowedBranches.length > 0) {
      userState.selectedBranches = new Set(user.allowedBranches);
    } else if (user.assignedBranch) {
      userState.selectedBranches = new Set([user.assignedBranch]);
    }
    renderBranchClearanceCards();

    // Allowed Modules
    if (Array.isArray(user.allowedModules) && user.allowedModules.length > 0) {
      userState.selectedModules = new Set(user.allowedModules);
      refreshAllTileVisuals();
      syncClearanceVisuals();
      syncAccessCounter();
    }

    // Refresh icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    if (typeof updateStepperCompletion === 'function') {
      updateStepperCompletion();
    }
  } catch (err) {
    console.error('[CreateUser] Failed to load user for editing:', err);
    showToast('Failed to load user for editing: ' + (err.message || 'Server error'), 'error');
  }
}

// ─── Switch to Create New User Mode ───
window.switchToCreateMode = function() {
  userState.isEditMode = false;
  userState.editUserId = null;
  userState.originalUsername = '';

  // Clean URL: Remove ?edit= query parameter
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ''));
  } catch (_) {}

  // Hide edit mode banner
  if (dom.cuEditModeBanner) dom.cuEditModeBanner.style.display = 'none';

  // Restore Header
  const titleEl = document.querySelector('.cu-page-title');
  if (titleEl) {
    titleEl.innerHTML = '<i data-lucide="user-plus" class="cu-title-icon"></i> Create New User';
  }
  const subEl = document.querySelector('.cu-page-subtitle');
  if (subEl) {
    subEl.textContent = 'Provision account credentials, assign role privileges, branch location, and contact information.';
  }

  // Restore Submit Button
  if (dom.btnSubmitText) dom.btnSubmitText.textContent = 'Create User';
  if (dom.btnSubmitUser) {
    const icon = dom.btnSubmitUser.querySelector('svg, i');
    if (icon) icon.setAttribute('data-lucide', 'user-plus');
  }
  if (dom.btnSaveDraft) dom.btnSaveDraft.style.display = 'inline-flex';

  // Re-enable and reset username input
  if (dom.usernameInput) {
    dom.usernameInput.value = '';
    dom.usernameInput.disabled = false;
    dom.usernameInput.style.opacity = '1';
    dom.usernameInput.style.cursor = 'text';
    userState.username = '';
  }

  // Reset other inputs
  if (dom.fullNameInput) { dom.fullNameInput.value = ''; userState.fullName = ''; }
  if (dom.passwordInput) {
    dom.passwordInput.value = '';
    dom.passwordInput.setAttribute('required', 'required');
    dom.passwordInput.placeholder = '••••••••••••';
    userState.password = '';
  }
  if (dom.confirmPasswordInput) {
    dom.confirmPasswordInput.value = '';
    dom.confirmPasswordInput.setAttribute('required', 'required');
    dom.confirmPasswordInput.placeholder = '••••••••••••';
    userState.confirmPassword = '';
  }
  const passReq = document.querySelectorAll('#cardAccount .cu-field .cu-req');
  passReq.forEach(el => el.style.display = '');

  if (dom.emailInput) dom.emailInput.value = '';
  if (dom.phoneInput) dom.phoneInput.value = '';
  if (dom.designationInput) dom.designationInput.value = '';
  if (dom.departmentInput) dom.departmentInput.value = '';
  if (dom.cuCustomMonogramInput) dom.cuCustomMonogramInput.value = '';

  userState.active = true;
  userState.selectedMonogram = '';
  userState.customMonogramTyped = false;

  // Reset roles and modules
  if (userState.rolesList && userState.rolesList.length > 0) {
    selectRole(userState.rolesList[0].name);
  }
  userState.selectedBranches.clear();
  renderBranchClearanceCards();

  if (window.lucide) {
    window.lucide.createIcons();
  }

  syncUserPreview();
  if (typeof updateStepperCompletion === 'function') {
    updateStepperCompletion();
  }

  showToast('Switched to Create New User mode. Fields cleared.', 'info');
};

// ─── Initialization ───
document.addEventListener('DOMContentLoaded', async () => {
  if (window.Auth && !Auth.requireLogin()) return;
  userState.currentUser = (window.Auth && window.Auth.getUser()) || {};
  cacheDom();

  // Set provision date in preview
  if (dom.sumProvisionDate) {
    dom.sumProvisionDate.textContent = formatCurrentDateTime();
  }

  // Fetch server data: Roles, Branches, and Modules in parallel
  await Promise.all([
    fetchAvailableRoles(),
    fetchActiveBranches(),
    fetchModuleRegistry()
  ]);

  // Check URL for ?edit= parameter
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');

  if (editId) {
    await initEditMode(editId);
  } else {
    // Attempt draft restoration only in create mode
    restoreUserDraft();
  }

  // Initial preview sync
  syncUserPreview();

  // Scrollspy for 5-step workflow stepper
  initScrollSpy();

  // Refresh icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// ─── Fetch Roles (Zero Raw Values) ───
async function fetchAvailableRoles() {
  try {
    let roles = await window.api.users.roles();
    if (userState.currentUser && userState.currentUser.role === 'BRANCH_ADMIN') {
      roles = roles.filter(r => r.name !== 'OWNER' && r.name !== 'ADMIN' && r.name !== 'BRANCH_ADMIN');
    }
    if (Array.isArray(roles) && roles.length > 0) {
      userState.rolesList = roles;
      renderRoleCards(roles);
      // Select first role if none chosen yet
      if (!userState.role) {
        selectRole(roles[0].name);
      }
    } else {
      dom.rolesContainer.innerHTML = '<div class="cu-field-hint" style="color:#FF5A5A;padding:12px;">No roles returned by server.</div>';
    }
  } catch (err) {
    console.error('[CreateUser] Failed to fetch roles:', err);
    dom.rolesContainer.innerHTML = `
      <div class="cu-field-hint" style="color:#FF5A5A;padding:12px;">
        Failed to load roles: ${escapeHtml(err.message || 'Server error')}
      </div>`;
  }
}

// ─── Render Role Radio Cards ───
function renderRoleCards(roles) {
  if (!dom.rolesContainer) return;

  dom.rolesContainer.innerHTML = roles.map(r => {
    const isSelected = (r.name === userState.role);
    const iconName = getRoleIconName(r.name);
    const badgeHtml = r.isSystemDefault
      ? `<span style="font-size:10px; font-weight:700; color:#d4af37; background:rgba(212,175,55,0.14); border:1px solid rgba(212,175,55,0.35); padding:2px 6px; border-radius:4px; margin-left:auto;">DEFAULT ROOT</span>`
      : (r.isCustom
        ? `<span style="font-size:10px; font-weight:700; color:hsl(270,75%,70%); background:rgba(168,85,247,0.14); border:1px solid rgba(168,85,247,0.35); padding:2px 6px; border-radius:4px; margin-left:auto;">CUSTOM ROLE</span>`
        : `<span style="font-size:10px; font-weight:600; color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px; margin-left:auto;">PRESET</span>`);

    return `
      <label class="cu-role-card ${isSelected ? 'active' : ''}" data-role-name="${escapeHtml(r.name)}" onclick="selectRole('${escapeHtml(r.name)}')">
        <input type="radio" name="userRole" value="${escapeHtml(r.name)}" ${isSelected ? 'checked' : ''} />
        <div class="cu-role-card-top">
          <div class="cu-role-icon-box">
            <i data-lucide="${iconName}" style="width:16px;height:16px;"></i>
          </div>
          ${badgeHtml}
          <div class="cu-role-radio-dot" style="margin-left:8px;"></div>
        </div>
        <div class="cu-role-name">${escapeHtml(r.displayName || r.name)}</div>
        <p class="cu-role-desc">${escapeHtml(r.description || '')}</p>
      </label>
    `;
  }).join('');

  if (window.lucide) {
    window.lucide.createIcons({ root: dom.rolesContainer });
  }
}

function getRoleIconName(roleName) {
  const norm = (roleName || '').toUpperCase();
  if (norm.includes('OWNER')) return 'crown';
  if (norm.includes('BRANCH_ADMIN')) return 'shield';
  if (norm.includes('ADMIN')) return 'crown';
  if (norm.includes('CUSTOM')) return 'sparkles';
  return 'user';
}

// ─── Select Role & Update Capabilities ───
window.selectRole = function(roleName) {
  userState.role = roleName;

  // Toggle custom role title input group
  const customGroup = document.getElementById('customRoleInputGroup');
  if (customGroup) {
    customGroup.style.display = (roleName === 'CUSTOM') ? 'block' : 'none';
    if (roleName === 'CUSTOM') {
      const inp = document.getElementById('customRoleTitleInput');
      if (inp) {
        if (!inp.value && userState.designation) inp.value = userState.designation;
        inp.focus();
      }
    }
  }

  // Update card visual active states
  document.querySelectorAll('.cu-role-card').forEach(card => {
    const match = card.getAttribute('data-role-name') === roleName;
    card.classList.toggle('active', match);
    const radio = card.querySelector('input[type="radio"]');
    if (radio) radio.checked = match;
  });

  // Find role metadata from fetched list
  const roleObj = userState.rolesList.find(r => r.name === roleName);
  if (roleObj && dom.capPillsContainer) {
    if (dom.capTitle) {
      dom.capTitle.textContent = `${roleObj.displayName || roleObj.name} Capabilities`;
    }
    const caps = Array.isArray(roleObj.capabilities) ? roleObj.capabilities : [];
    dom.capPillsContainer.innerHTML = caps.map(c => `
      <span class="cu-cap-pill">
        <i data-lucide="check" style="width:12px;height:12px;"></i>
        <span>${escapeHtml(c)}</span>
      </span>
    `).join('');
    if (window.lucide) {
      window.lucide.createIcons({ root: dom.capPillsContainer });
    }
  }

  // Pre-set role default module permissions
  applyRoleDefaultModules(roleName);

  syncUserPreview();
};

window.handleCustomRoleTitle = function(val) {
  userState.designation = val || '';
  if (dom.designationInput) {
    dom.designationInput.value = val || '';
  }
  syncUserPreview();
};

// ─── Fetch Branches (Zero Raw Values) ───
async function fetchActiveBranches() {
  try {
    const branches = await window.api.branches.list();
    userState.branchesList = Array.isArray(branches) ? branches : [];

    if (dom.assignedBranchSelect) {
      dom.assignedBranchSelect.innerHTML = '<option value="">— Select Primary Branch Location —</option>';
      userState.branchesList.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.branchCode || b.name;
        opt.textContent = `${b.name} (${b.branchCode || b.type || 'BRN'})`;
        dom.assignedBranchSelect.appendChild(opt);
      });

      // Branch Admin lock
      if (userState.currentUser && userState.currentUser.role === 'BRANCH_ADMIN' && userState.currentUser.assignedBranch) {
        const myBranch = userState.currentUser.assignedBranch;
        for (let i = 0; i < dom.assignedBranchSelect.options.length; i++) {
          const optVal = dom.assignedBranchSelect.options[i].value;
          if (optVal.toLowerCase() === myBranch.toLowerCase()) {
            dom.assignedBranchSelect.selectedIndex = i;
            break;
          }
        }
        dom.assignedBranchSelect.disabled = true;
        userState.assignedBranch = myBranch;
        userState.selectedBranches.clear();
        userState.selectedBranches.add(myBranch);

        const hint = document.getElementById('assignedBranchHint') || dom.assignedBranchSelect.parentElement?.nextElementSibling;
        if (hint) {
          hint.innerHTML = `<span style="color:#d4af37;font-weight:600;">🔒 Locked to your assigned branch: ${escapeHtml(myBranch)}</span> (Branch Admin scope)`;
        }
        if (dom.branchClearanceActionBtns) {
          dom.branchClearanceActionBtns.style.display = 'none';
        }
      }
    }

    renderBranchClearanceCards();
  } catch (err) {
    console.warn('[CreateUser] Failed to fetch branches, defaulting to empty:', err);
  }
}

window.handlePrimaryBranchChange = function(branch) {
  userState.assignedBranch = branch || '';
  if (branch) {
    userState.selectedBranches.add(branch);
  }
  renderBranchClearanceCards();
  syncUserPreview();
};

window.toggleBranchClearance = function(branch) {
  if (userState.currentUser && userState.currentUser.role === 'BRANCH_ADMIN') return;
  if (userState.selectedBranches.has(branch)) {
    userState.selectedBranches.delete(branch);
    if (dom.assignedBranchSelect && dom.assignedBranchSelect.value === branch) {
      const remaining = Array.from(userState.selectedBranches);
      dom.assignedBranchSelect.value = remaining.length > 0 ? remaining[0] : '';
      userState.assignedBranch = dom.assignedBranchSelect.value;
    }
  } else {
    userState.selectedBranches.add(branch);
    if (dom.assignedBranchSelect && !dom.assignedBranchSelect.value) {
      dom.assignedBranchSelect.value = branch;
      userState.assignedBranch = branch;
    }
  }
  renderBranchClearanceCards();
  syncUserPreview();
};

window.selectAllBranches = function() {
  if (userState.currentUser && userState.currentUser.role === 'BRANCH_ADMIN') return;
  userState.branchesList.forEach(b => {
    const val = b.branchCode || b.name;
    userState.selectedBranches.add(val);
  });
  if (dom.assignedBranchSelect && !dom.assignedBranchSelect.value && userState.branchesList.length > 0) {
    dom.assignedBranchSelect.value = userState.branchesList[0].branchCode || userState.branchesList[0].name;
    userState.assignedBranch = dom.assignedBranchSelect.value;
  }
  renderBranchClearanceCards();
  syncUserPreview();
};

window.clearAllBranches = function() {
  if (userState.currentUser && userState.currentUser.role === 'BRANCH_ADMIN') return;
  userState.selectedBranches.clear();
  if (dom.assignedBranchSelect) {
    dom.assignedBranchSelect.value = '';
    userState.assignedBranch = '';
  }
  renderBranchClearanceCards();
  syncUserPreview();
};

function renderBranchClearanceCards() {
  if (!dom.branchClearanceContainer) return;
  const primaryVal = dom.assignedBranchSelect ? dom.assignedBranchSelect.value : '';
  const isBranchAdmin = (userState.currentUser && userState.currentUser.role === 'BRANCH_ADMIN');

  let html = '';
  userState.branchesList.forEach(b => {
    const val = b.branchCode || b.name;
    const isSelected = userState.selectedBranches.has(val) || (primaryVal && primaryVal.toLowerCase() === val.toLowerCase());
    const isPrimary = (primaryVal && primaryVal.toLowerCase() === val.toLowerCase());
    const isDisabled = isBranchAdmin && userState.currentUser.assignedBranch && userState.currentUser.assignedBranch.toLowerCase() !== val.toLowerCase();

    html += `
      <div class="cu-branch-card ${isSelected ? 'selected' : ''} ${isPrimary ? 'is-primary' : ''}" 
           style="${isDisabled ? 'opacity:0.35;cursor:not-allowed;pointer-events:none;' : ''}"
           onclick="toggleBranchClearance('${escapeHtml(val)}')">
        <div class="cu-branch-card-info">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="cu-branch-card-name">${escapeHtml(b.name)}</span>
            ${isPrimary ? '<span class="cu-branch-primary-badge">PRIMARY</span>' : ''}
          </div>
          <span class="cu-branch-card-meta">
            ${b.branchCode ? `<span>${escapeHtml(b.branchCode)}</span> • ` : ''}
            <span>${escapeHtml(b.city || 'Atelier')}</span>
          </span>
        </div>
        <div class="cu-tile-checkbox">
          <svg class="cu-tile-check-icon" viewBox="0 0 24 24" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
    `;
  });
  dom.branchClearanceContainer.innerHTML = html;
}

// ─── Double-Letter Monogram Candidate Generator & Handlers ───
function generateCandidateMonograms(fullName, username) {
  const candidates = new Set();

  if (fullName && fullName.trim()) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      // First + Last initial (e.g. Priya Sundaram -> PS)
      candidates.add((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
      // First 2 of first name (e.g. Priya -> PR)
      if (parts[0].length >= 2) {
        candidates.add(parts[0].substring(0, 2).toUpperCase());
      }
      // If 3 or more parts, First + Middle (e.g. Priya Mary Sundaram -> PM)
      if (parts.length >= 3) {
        candidates.add((parts[0][0] + parts[1][0]).toUpperCase());
      }
      // First 2 of last name (e.g. Sundaram -> SU)
      if (parts[parts.length - 1].length >= 2) {
        candidates.add(parts[parts.length - 1].substring(0, 2).toUpperCase());
      }
    } else if (parts.length === 1) {
      const name = parts[0];
      if (name.length >= 2) {
        candidates.add(name.substring(0, 2).toUpperCase());
      }
      if (name.length >= 3) {
        candidates.add((name[0] + name[2]).toUpperCase());
      }
      if (name.length >= 4) {
        candidates.add((name[0] + name[name.length - 1]).toUpperCase());
      }
    }
  }

  if (username && username.trim()) {
    const cleanU = username.trim().replace(/[^a-zA-Z0-9]/g, '');
    if (cleanU.length >= 2) {
      candidates.add(cleanU.substring(0, 2).toUpperCase());
    }
  }

  // Filter only valid 2-character uppercase alphabetic / alphanumeric
  const filtered = Array.from(candidates).filter(c => c && c.length === 2);
  return filtered.length > 0 ? filtered : ['NU'];
}

function updateMonogramOptions(fullName, username) {
  const suggestions = generateCandidateMonograms(fullName, username);

  // If user hasn't typed a custom monogram, select top suggestion
  if (!userState.customMonogramTyped || !userState.selectedMonogram) {
    userState.selectedMonogram = suggestions[0] || 'NU';
  }

  // Render suggestion pills
  if (dom.cuMonogramSuggestions) {
    if (!fullName && !username) {
      dom.cuMonogramSuggestions.innerHTML = '<span style="font-size:11.5px;color:rgba(255,255,255,0.35);">Type name to see suggestions...</span>';
    } else {
      dom.cuMonogramSuggestions.innerHTML = suggestions.map(m => {
        const isSel = (m === userState.selectedMonogram);
        return `<button type="button" class="cu-monogram-pill ${isSel ? 'selected' : ''}" onclick="selectMonogram('${m}')">${escapeHtml(m)}</button>`;
      }).join('');
    }
  }

  // Sync the circle & custom input
  if (dom.cuMonogramPreview) {
    dom.cuMonogramPreview.textContent = userState.selectedMonogram || '--';
  }
  if (dom.cuCustomMonogramInput && !userState.customMonogramTyped) {
    dom.cuCustomMonogramInput.value = userState.selectedMonogram || '';
  }
}

window.selectMonogram = function(monogram) {
  if (!monogram) return;
  const clean = monogram.toUpperCase().slice(0, 2);
  userState.selectedMonogram = clean;
  userState.customMonogramTyped = false;

  // Update pills visual
  if (dom.cuMonogramSuggestions) {
    dom.cuMonogramSuggestions.querySelectorAll('.cu-monogram-pill').forEach(btn => {
      btn.classList.toggle('selected', btn.textContent.trim() === clean);
    });
  }

  // Update preview circle and custom input
  if (dom.cuMonogramPreview) dom.cuMonogramPreview.textContent = clean;
  if (dom.cuCustomMonogramInput) dom.cuCustomMonogramInput.value = clean;
  if (dom.sumAvatarInitials) dom.sumAvatarInitials.textContent = clean;
};

window.handleCustomMonogramInput = function(val) {
  const clean = (val || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 2);
  if (dom.cuCustomMonogramInput && dom.cuCustomMonogramInput.value !== clean) {
    dom.cuCustomMonogramInput.value = clean;
  }

  if (clean.length === 2) {
    userState.selectedMonogram = clean;
    userState.customMonogramTyped = true;
    if (dom.cuMonogramPreview) dom.cuMonogramPreview.textContent = clean;
    if (dom.sumAvatarInitials) dom.sumAvatarInitials.textContent = clean;

    // Check if any pill matches
    if (dom.cuMonogramSuggestions) {
      dom.cuMonogramSuggestions.querySelectorAll('.cu-monogram-pill').forEach(btn => {
        btn.classList.toggle('selected', btn.textContent.trim() === clean);
      });
    }
  } else if (clean.length === 0) {
    userState.customMonogramTyped = false;
    const fullName = dom.fullNameInput ? dom.fullNameInput.value.trim() : '';
    const username = dom.usernameInput ? dom.usernameInput.value.trim() : '';
    updateMonogramOptions(fullName, username);
    if (dom.sumAvatarInitials) dom.sumAvatarInitials.textContent = userState.selectedMonogram || 'NU';
  }
};

// ─── Live User Preview Synchronization ───
window.syncUserPreview = function() {
  if (!dom.sumFullName) return;

  const fullName = dom.fullNameInput ? dom.fullNameInput.value.trim() : '';
  const username = dom.usernameInput ? dom.usernameInput.value.trim() : '';

  // Full Name
  dom.sumFullName.textContent = fullName || '— New User';

  // Username
  dom.sumUsername.textContent = username ? `@${username}` : '@username';

  // Update monogram suggestions & sync avatar
  updateMonogramOptions(fullName, username);

  // Avatar Initials
  if (dom.sumAvatarInitials) {
    dom.sumAvatarInitials.textContent = userState.selectedMonogram || 'NU';
  }

  // Role Pill
  if (dom.sumRoleText) {
    const currentRole = userState.role || 'ROLE';
    const roleObj = userState.rolesList.find(r => r.name === currentRole);
    dom.sumRoleText.textContent = roleObj ? (roleObj.displayName || roleObj.name) : currentRole;
  }

  // Status Pill
  const isActive = (userState.active !== false);
  if (dom.sumStatusPill && dom.sumStatusText) {
    dom.sumStatusPill.className = `cu-status-pill ${isActive ? 'active' : ''}`;
    dom.sumStatusText.textContent = isActive ? 'ACTIVE' : 'INACTIVE';
  }

  // Organization
  const desig = dom.designationInput ? dom.designationInput.value.trim() : '';
  const dept = dom.departmentInput ? dom.departmentInput.value.trim() : '';
  const branch = dom.assignedBranchSelect ? dom.assignedBranchSelect.value : '';

  if (dom.sumDesignation) dom.sumDesignation.textContent = desig || '—';
  if (dom.sumDepartment) dom.sumDepartment.textContent = dept || '—';
  if (dom.sumBranch) {
    const branchCount = userState.selectedBranches.size;
    if (branchCount > 1) {
      dom.sumBranch.textContent = `${branchCount} Branches (${Array.from(userState.selectedBranches).join(', ')})`;
    } else if (branchCount === 1) {
      dom.sumBranch.textContent = Array.from(userState.selectedBranches)[0];
    } else {
      dom.sumBranch.textContent = branch || 'Central HQ';
    }
  }

  // Contact
  const email = dom.emailInput ? dom.emailInput.value.trim() : '';
  const phone = dom.phoneInput ? dom.phoneInput.value.trim() : '';

  if (dom.sumEmail) dom.sumEmail.textContent = email || '—';
  if (dom.sumPhone) dom.sumPhone.textContent = phone ? `+91 ${phone}` : '—';

  // Page Access Count (excluding operational clearances)
  if (dom.sumAccessCount) {
    const pageModsOnly = Array.from(userState.selectedModules).filter(k => !CLEARANCE_KEYS.includes(k));
    const selCount = pageModsOnly.length;
    const totCount = userState.moduleRegistry.filter(m => !CLEARANCE_KEYS.includes(m.key)).length || 28;
    dom.sumAccessCount.textContent = `${selCount} of ${totCount} modules`;
  }

  // Clearances Summary Badges in Live User Preview
  const sumClearancesEl = document.getElementById('sumClearances');
  if (sumClearancesEl) {
    const hasCreate = userState.selectedModules.has('orders.create');
    const hasDelete = userState.selectedModules.has('orders.delete');
    const hasFinance = userState.selectedModules.has('finance.view');

    sumClearancesEl.innerHTML = `
      <span class="cu-pr-badge ${hasCreate ? 'active-create' : 'disabled'}" title="${hasCreate ? 'Permitted to create orders' : 'Cannot create orders'}">+ Order</span>
      <span class="cu-pr-badge ${hasDelete ? 'active-delete' : 'disabled'}" title="${hasDelete ? 'Permitted to delete orders' : 'Cannot delete orders'}">✕ Del</span>
      <span class="cu-pr-badge ${hasFinance ? 'active-finance' : 'disabled'}" title="${hasFinance ? 'Permitted to view financial metrics' : 'Finance data masked'}">₹ Finance</span>
    `;
  }

  // Real-time Stepper & Checkmark Sync
  if (typeof updateStepperCompletion === 'function') {
    updateStepperCompletion();
  }
};

// ─── Username Handling ───
window.handleUsernameInput = function(input) {
  // Normalize: lowercased, allow only letters, numbers, dots, underscores
  const clean = input.value.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  if (clean !== input.value) {
    input.value = clean;
  }
  userState.username = clean;
  syncUserPreview();
};

// ─── Phone Number Input ───
window.handlePhoneInput = function(input) {
  const digits = input.value.replace(/\D/g, '').substring(0, 10);
  input.value = digits;
  syncUserPreview();
};

// ─── Status Toggle ───
window.handleStatusToggle = function(checked) {
  userState.active = checked;
  if (dom.statusToggleText) {
    dom.statusToggleText.textContent = checked ? 'Account Active' : 'Account Inactive';
  }
  syncUserPreview();
};

// ─── Password Show/Hide Toggle ───
window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = (input.type === 'password');
  input.type = isPass ? 'text' : 'password';

  if (btn) {
    btn.innerHTML = isPass
      ? '<i data-lucide="eye-off" style="width:16px;height:16px;"></i>'
      : '<i data-lucide="eye" style="width:16px;height:16px;"></i>';
    if (window.lucide) {
      window.lucide.createIcons({ root: btn });
    }
  }
};

// ─── Password Strength Calculation ───
window.handlePasswordInput = function() {
  const pass = dom.passwordInput ? dom.passwordInput.value : '';
  userState.password = pass;

  let score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 10) score++;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (!pass) {
    dom.strengthBar.className = 'cu-strength-bar';
    dom.strengthLabel.className = 'cu-strength-label';
    dom.strengthLabel.textContent = 'Enter password';
  } else if (score <= 2) {
    dom.strengthBar.className = 'cu-strength-bar weak';
    dom.strengthLabel.className = 'cu-strength-label weak';
    dom.strengthLabel.textContent = 'Weak password';
  } else if (score <= 4) {
    dom.strengthBar.className = 'cu-strength-bar fair';
    dom.strengthLabel.className = 'cu-strength-label fair';
    dom.strengthLabel.textContent = 'Fair security';
  } else {
    dom.strengthBar.className = 'cu-strength-bar strong';
    dom.strengthLabel.className = 'cu-strength-label strong';
    dom.strengthLabel.textContent = 'Strong password';
  }

  handleConfirmPasswordInput();
};

// ─── Password Match Check ───
window.handleConfirmPasswordInput = function() {
  const pass = dom.passwordInput ? dom.passwordInput.value : '';
  const confirm = dom.confirmPasswordInput ? dom.confirmPasswordInput.value : '';
  userState.confirmPassword = confirm;

  if (!dom.passwordMatchHint) return;

  if (!confirm) {
    dom.passwordMatchHint.textContent = 'Both passwords must match identically.';
    dom.passwordMatchHint.style.color = '';
    if (dom.confirmPasswordInput) dom.confirmPasswordInput.classList.remove('invalid');
  } else if (pass !== confirm) {
    dom.passwordMatchHint.textContent = 'Passwords do not match.';
    dom.passwordMatchHint.style.color = '#FF5A5A';
    if (dom.confirmPasswordInput) dom.confirmPasswordInput.classList.add('invalid');
  } else {
    dom.passwordMatchHint.textContent = '✓ Passwords match successfully.';
    dom.passwordMatchHint.style.color = 'var(--lime)';
    if (dom.confirmPasswordInput) dom.confirmPasswordInput.classList.remove('invalid');
  }

  if (typeof updateStepperCompletion === 'function') {
    updateStepperCompletion();
  }
};

// ─── Draft Support (localStorage) ───
window.saveUserDraft = function() {
  const draft = {
    username: dom.usernameInput ? dom.usernameInput.value.trim() : '',
    fullName: dom.fullNameInput ? dom.fullNameInput.value.trim() : '',
    role: userState.role,
    selectedMonogram: userState.selectedMonogram,
    customMonogramTyped: userState.customMonogramTyped,
    active: (userState.active !== false),
    designation: dom.designationInput ? dom.designationInput.value.trim() : '',
    department: dom.departmentInput ? dom.departmentInput.value.trim() : '',
    assignedBranch: dom.assignedBranchSelect ? dom.assignedBranchSelect.value : '',
    email: dom.emailInput ? dom.emailInput.value.trim() : '',
    phone: dom.phoneInput ? dom.phoneInput.value.trim() : '',
    allowedModules: Array.from(userState.selectedModules),
    timestamp: new Date().toISOString()
  };

  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    showToast('User provisioning draft saved to this browser.', 'success');
  } catch (err) {
    showToast('Failed to save draft.', 'error');
  }
};

function restoreUserDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (!draft) return;

    if (dom.usernameInput && draft.username) dom.usernameInput.value = draft.username;
    if (dom.fullNameInput && draft.fullName) dom.fullNameInput.value = draft.fullName;
    if (draft.selectedMonogram) {
      userState.selectedMonogram = draft.selectedMonogram;
      userState.customMonogramTyped = !!draft.customMonogramTyped;
      if (dom.cuCustomMonogramInput) dom.cuCustomMonogramInput.value = draft.selectedMonogram;
      if (dom.cuMonogramPreview) dom.cuMonogramPreview.textContent = draft.selectedMonogram;
      if (dom.sumAvatarInitials) dom.sumAvatarInitials.textContent = draft.selectedMonogram;
    }
    if (draft.role) selectRole(draft.role);
    if (typeof draft.active === 'boolean') {
      userState.active = draft.active;
    }
    if (dom.designationInput && draft.designation) dom.designationInput.value = draft.designation;
    if (dom.departmentInput && draft.department) dom.departmentInput.value = draft.department;
    if (dom.assignedBranchSelect && draft.assignedBranch) dom.assignedBranchSelect.value = draft.assignedBranch;
    if (dom.emailInput && draft.email) dom.emailInput.value = draft.email;
    if (dom.phoneInput && draft.phone) dom.phoneInput.value = draft.phone;
    if (Array.isArray(draft.allowedModules) && draft.allowedModules.length > 0) {
      userState.selectedModules = new Set(draft.allowedModules);
      refreshAllTileVisuals();
      syncClearanceVisuals();
      syncAccessCounter();
    }
  } catch (err) {
    console.warn('[CreateUser] Failed to restore draft:', err);
  }
}

// ─── Fetch Module Registry (Zero Raw Values) ───
async function fetchModuleRegistry() {
  try {
    const modules = await window.api.users.modules();
    if (Array.isArray(modules) && modules.length > 0) {
      userState.moduleRegistry = modules;
      renderModuleAccessGrid(modules);
      // Pre-select role defaults if role already selected
      if (userState.role) {
        applyRoleDefaultModules(userState.role);
      }
    } else {
      if (dom.moduleAccessGrid) {
        dom.moduleAccessGrid.innerHTML = '<div class="cu-field-hint" style="color:#FF5A5A;padding:12px;">No modules returned by server.</div>';
      }
    }
  } catch (err) {
    console.error('[CreateUser] Failed to fetch modules:', err);
    if (dom.moduleAccessGrid) {
      dom.moduleAccessGrid.innerHTML = `
        <div class="cu-field-hint" style="color:#FF5A5A;padding:12px;">
          Failed to load modules: ${escapeHtml(err.message || 'Server error')}
        </div>`;
    }
  }
}

// ─── Operational & Financial Clearances Constants & Handlers ───
const CLEARANCE_KEYS = ['orders.create', 'orders.delete', 'finance.view'];

window.toggleClearance = function(key) {
  if (userState.selectedModules.has(key)) {
    userState.selectedModules.delete(key);
  } else {
    userState.selectedModules.add(key);
  }
  syncClearanceVisuals();
  syncAccessCounter();
  syncUserPreview();
};

function syncClearanceVisuals() {
  CLEARANCE_KEYS.forEach(k => {
    const card = document.getElementById(`clearanceCard-${k}`);
    if (card) {
      card.classList.toggle('active', userState.selectedModules.has(k));
    }
  });
}

// ─── Render Module Access Grid ───
function renderModuleAccessGrid(modules) {
  if (!dom.moduleAccessGrid) return;

  const sectionMap = new Map();
  modules.forEach(m => {
    if (m.section === 'Action Clearances' || CLEARANCE_KEYS.includes(m.key)) {
      return; // Handled in top clearance cards
    }
    const sec = m.section || 'General';
    if (!sectionMap.has(sec)) sectionMap.set(sec, []);
    sectionMap.get(sec).push(m);
  });

  let html = '';
  sectionMap.forEach((mods, sectionName) => {
    html += `
      <div class="cu-module-section">
        <div class="cu-module-section-header">
          <span class="cu-module-section-title">${escapeHtml(sectionName)}</span>
          <span class="cu-module-section-count">${mods.length} modules</span>
        </div>
        <div class="cu-module-grid">
          ${mods.map(m => {
            const isChecked = userState.selectedModules.has(m.key);
            return `
              <div class="cu-module-tile ${isChecked ? 'selected' : ''}"
                   id="tile-${escapeHtml(m.key)}"
                   data-module-key="${escapeHtml(m.key)}"
                   onclick="toggleModule('${escapeHtml(m.key)}')">
                <div class="cu-tile-icon-box">
                  <i data-lucide="${escapeHtml(m.icon || 'circle')}"></i>
                </div>
                <div class="cu-tile-info">
                  <span class="cu-tile-label">${escapeHtml(m.label)}</span>
                  ${!m.available ? '<span class="cu-tile-badge-wip">In Progress</span>' : ''}
                </div>
                <div class="cu-tile-checkbox">
                  <svg class="cu-tile-check-icon" viewBox="0 0 24 24" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });

  dom.moduleAccessGrid.innerHTML = html;
  if (window.lucide) {
    window.lucide.createIcons({ root: dom.moduleAccessGrid });
  }
  syncClearanceVisuals();
  syncAccessCounter();
}

// ─── Module Selection Helpers ───
window.toggleModule = function(key) {
  if (userState.selectedModules.has(key)) {
    userState.selectedModules.delete(key);
  } else {
    userState.selectedModules.add(key);
  }
  updateTileVisual(key);
  syncAccessCounter();
  syncUserPreview();
};

function updateTileVisual(key) {
  const tile = document.getElementById(`tile-${key}`);
  if (tile) {
    tile.classList.toggle('selected', userState.selectedModules.has(key));
  }
}

window.selectAllModules = function() {
  userState.moduleRegistry.forEach(m => userState.selectedModules.add(m.key));
  CLEARANCE_KEYS.forEach(k => userState.selectedModules.add(k));
  refreshAllTileVisuals();
  syncClearanceVisuals();
  syncAccessCounter();
  syncUserPreview();
};

window.clearAllModules = function() {
  userState.selectedModules.clear();
  refreshAllTileVisuals();
  syncClearanceVisuals();
  syncAccessCounter();
  syncUserPreview();
};

window.resetToRoleDefaults = function() {
  applyRoleDefaultModules(userState.role);
};

function refreshAllTileVisuals() {
  userState.moduleRegistry.forEach(m => updateTileVisual(m.key));
}

function syncAccessCounter() {
  const pageModsOnly = Array.from(userState.selectedModules).filter(k => !CLEARANCE_KEYS.includes(k));
  const count = pageModsOnly.length;
  const total = userState.moduleRegistry.filter(m => !CLEARANCE_KEYS.includes(m.key)).length || 28;
  if (dom.accessCounter) {
    dom.accessCounter.textContent = `${count} of ${total} modules selected`;
  }
}

function applyRoleDefaultModules(roleName) {
  const r = (roleName || '').toUpperCase();
  userState.selectedModules.clear();

  if (r === 'OWNER' || r === 'ADMIN') {
    userState.moduleRegistry.forEach(m => userState.selectedModules.add(m.key));
    CLEARANCE_KEYS.forEach(k => userState.selectedModules.add(k));
  } else if (r === 'BRANCH_ADMIN') {
    const branchDefaults = [
      'dashboard', 'enquiries', 'appointments', 'customers', 'orders', 'payments',
      'orders.create',
      'garments', 'designs', 'measurements', 'fabrics', 'collections',
      'production-room', 'job-cards', 'trials-alterations', 'quality-control',
      'stock', 'purchases', 'delivery', 'employees', 'branches', 'users-roles'
    ];
    branchDefaults.forEach(k => userState.selectedModules.add(k));
  } else {
    // Custom user created as needed: initial default is dashboard; user customizes access
    userState.selectedModules.add('dashboard');
  }

  refreshAllTileVisuals();
  syncClearanceVisuals();
  syncAccessCounter();
  syncUserPreview();
}

// ─── Real-Time Stepper Completion System ───
function checkStep1Completed() {
  const fullName = (dom.fullNameInput || document.getElementById('fullNameInput'))?.value?.trim() || '';
  const username = (dom.usernameInput || document.getElementById('usernameInput'))?.value?.trim() || '';
  const password = (dom.passwordInput || document.getElementById('passwordInput'))?.value || '';
  const confirm = (dom.confirmPasswordInput || document.getElementById('confirmPasswordInput'))?.value || '';

  if (userState.isEditMode) {
    if (!fullName) return false;
    if (password) {
      return password.length >= 6 && password === confirm;
    }
    return true;
  }

  // Create Mode:
  if (!fullName) return false;
  if (!username || username.length < 3) return false;
  if (!password || password.length < 6) return false;
  if (password !== confirm) return false;
  return true;
}

function checkStep2Completed() {
  return Boolean(userState.role && userState.role.trim().length > 0);
}

function checkStep3Completed() {
  const branchVal = (dom.assignedBranchSelect || document.getElementById('assignedBranchSelect'))?.value || '';
  const desigVal = (dom.designationInput || document.getElementById('designationInput'))?.value?.trim() || '';
  const deptVal = (dom.departmentInput || document.getElementById('departmentInput'))?.value?.trim() || '';
  const hasBranches = userState.selectedBranches && userState.selectedBranches.size > 0;
  const stateBranch = Boolean(userState.assignedBranch);

  return Boolean(branchVal || stateBranch || hasBranches || desigVal || deptVal);
}

function checkStep4Completed() {
  const email = (dom.emailInput || document.getElementById('emailInput'))?.value?.trim() || '';
  const phone = (dom.phoneInput || document.getElementById('phoneInput'))?.value?.trim() || '';

  const isEmailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = phone.replace(/\D/g, '').length >= 10;

  return isEmailValid || isPhoneValid;
}

function checkStep5Completed() {
  return Boolean(userState.selectedModules && userState.selectedModules.size > 0);
}

window.updateStepperCompletion = function() {
  const isCompleted = {
    1: checkStep1Completed(),
    2: checkStep2Completed(),
    3: checkStep3Completed(),
    4: checkStep4Completed(),
    5: checkStep5Completed()
  };

  const checkSvg = `<svg class="cu-step-check" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-6"/></svg>`;
  const badgeCheckSvg = `<svg class="cu-badge-check" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-6"/></svg>`;

  for (let step = 1; step <= 5; step++) {
    const done = !!isCompleted[step];
    const node = document.querySelector(`.cu-step-node[data-step="${step}"]`);
    if (node) {
      node.classList.toggle('completed', done);
      const circle = node.querySelector('.cu-step-circle');
      if (circle) {
        circle.innerHTML = done ? checkSvg : String(step);
      }
    }

    const badge = document.querySelector(`.cu-step-badge[data-step-badge="${step}"]`);
    if (badge) {
      badge.classList.toggle('completed', done);
      badge.innerHTML = done ? badgeCheckSvg : String(step);
    }
  }

  for (let line = 1; line <= 4; line++) {
    const lineEl = document.querySelector(`.cu-step-line[data-line="${line}"]`);
    if (lineEl) {
      lineEl.classList.toggle('completed', !!isCompleted[line]);
    }
  }
};

// ─── Stepper Navigation & ScrollSpy ───
window.scrollToCard = function(cardId) {
  const el = document.getElementById(cardId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateActiveStepFromCard(cardId);
  }
};

function updateActiveStepFromCard(cardId) {
  const stepMap = {
    cardAccount: 1,
    cardRole: 2,
    cardOrg: 3,
    cardContact: 4,
    cardAccess: 5
  };
  const targetStep = stepMap[cardId] || 1;
  document.querySelectorAll('.cu-step-node').forEach(node => {
    const stepNum = parseInt(node.getAttribute('data-step'), 10);
    node.classList.toggle('active', stepNum === targetStep);
  });
}

function initScrollSpy() {
  const cards = [
    { id: 'cardAccount', step: 1 },
    { id: 'cardRole', step: 2 },
    { id: 'cardOrg', step: 3 },
    { id: 'cardContact', step: 4 },
    { id: 'cardAccess', step: 5 }
  ];

  const scrollContainer = dom.scrollContainer || document.getElementById('createUserScroll');
  if (!scrollContainer) return;

  scrollContainer.addEventListener('scroll', () => {
    const containerTop = scrollContainer.getBoundingClientRect().top;
    let currentStep = 1;

    for (const item of cards) {
      const el = document.getElementById(item.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top - containerTop <= 150) {
          currentStep = item.step;
        }
      }
    }

    document.querySelectorAll('.cu-step-node').forEach(node => {
      const stepNum = parseInt(node.getAttribute('data-step'), 10);
      node.classList.toggle('active', stepNum === currentStep);
    });
  }, { passive: true });
}

// ─── Form Submission ───
window.handleUserSubmit = async function(event) {
  if (event) event.preventDefault();

  const username = dom.usernameInput ? dom.usernameInput.value.trim() : '';
  const fullName = dom.fullNameInput ? dom.fullNameInput.value.trim() : '';
  const password = dom.passwordInput ? dom.passwordInput.value : '';
  const confirm = dom.confirmPasswordInput ? dom.confirmPasswordInput.value : '';
  const role = userState.role;

  // Validation
  if (!username) {
    showToast('Username is required.', 'error');
    if (dom.usernameInput) dom.usernameInput.focus();
    return;
  }

  if (!userState.isEditMode && username.length < 3) {
    showToast('Username must be at least 3 characters.', 'error');
    if (dom.usernameInput) dom.usernameInput.focus();
    return;
  }

  if (!fullName) {
    showToast('Full Name is required.', 'error');
    if (dom.fullNameInput) dom.fullNameInput.focus();
    return;
  }

  if (!userState.isEditMode) {
    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      if (dom.passwordInput) dom.passwordInput.focus();
      return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match. Please verify.', 'error');
      if (dom.confirmPasswordInput) dom.confirmPasswordInput.focus();
      return;
    }
  } else if (password) {
    if (password.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      if (dom.passwordInput) dom.passwordInput.focus();
      return;
    }
    if (password !== confirm) {
      showToast('New passwords do not match. Please verify.', 'error');
      if (dom.confirmPasswordInput) dom.confirmPasswordInput.focus();
      return;
    }
  }

  if (!role) {
    showToast('Please select a system role for this user.', 'error');
    return;
  }

  const email = dom.emailInput ? dom.emailInput.value.trim() : '';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    if (dom.emailInput) dom.emailInput.focus();
    return;
  }

  const phoneRaw = dom.phoneInput ? dom.phoneInput.value.trim() : '';
  if (phoneRaw && phoneRaw.length < 10) {
    showToast('Mobile phone must be 10 digits.', 'error');
    if (dom.phoneInput) dom.phoneInput.focus();
    return;
  }

  const branchVal = (userState.currentUser && userState.currentUser.role === 'BRANCH_ADMIN' && userState.currentUser.assignedBranch)
    ? userState.currentUser.assignedBranch
    : (dom.assignedBranchSelect && dom.assignedBranchSelect.value ? dom.assignedBranchSelect.value : null);

  const selectedBranchesList = Array.from(userState.selectedBranches);
  if (branchVal && !selectedBranchesList.includes(branchVal)) {
    selectedBranchesList.unshift(branchVal);
  }

  // Double-letter monogram selection resolution
  const chosenMonogram = (userState.selectedMonogram || (dom.sumAvatarInitials ? dom.sumAvatarInitials.textContent : 'NU')).trim().substring(0, 2).toUpperCase();

  // Construct payload with strict types
  const payload = {
    fullName: fullName,
    role: role,
    avatarUrl: `monogram:${chosenMonogram}`,
    active: (userState.active !== false),
    designation: dom.designationInput && dom.designationInput.value.trim() ? dom.designationInput.value.trim() : null,
    department: dom.departmentInput && dom.departmentInput.value.trim() ? dom.departmentInput.value.trim() : null,
    assignedBranch: branchVal || (selectedBranchesList.length > 0 ? selectedBranchesList[0] : null),
    allowedBranches: selectedBranchesList,
    email: email || null,
    phone: phoneRaw ? `+91 ${phoneRaw}` : null,
    allowedModules: Array.from(userState.selectedModules),
    status: (userState.active !== false) ? 'ACTIVE' : 'SUSPENDED'
  };

  if (!userState.isEditMode) {
    payload.username = username;
    payload.password = password;
  } else if (password) {
    payload.password = password;
  }

  // Form submission guard: If in edit mode, ensure user is aware they are modifying an existing account
  if (userState.isEditMode) {
    const origUser = userState.originalUsername || username;
    const confirmMsg = `Save changes to existing user "@${origUser}"?\n\n- Click OK to update this existing user account.\n- Click Cancel if you intended to create a brand-new user instead.`;
    if (!confirm(confirmMsg)) {
      return;
    }
  }

  // Submit button state
  const btn = dom.btnSubmitUser;
  const originalHTML = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    const actionLabel = userState.isEditMode ? 'Saving Changes...' : 'Creating User...';
    btn.innerHTML = `<i data-lucide="loader-2" class="cu-spin" style="width:16px;height:16px;"></i> <span>${actionLabel}</span>`;
    if (window.lucide) window.lucide.createIcons({ root: btn });
  }

  try {
    if (userState.isEditMode) {
      const updatedUser = await window.api.users.update(userState.editUserId, payload);
      showToast(`User ${escapeHtml(updatedUser.fullName || username)} updated successfully!`, 'success');
      setTimeout(() => {
        window.location.href = `../users-roles.html?updated=${encodeURIComponent(updatedUser.username || username)}`;
      }, 600);
    } else {
      const createdUser = await window.api.users.create(payload);
      // Clear saved draft on success
      try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
      showToast(`User ${escapeHtml(createdUser.username || username)} provisioned successfully!`, 'success');
      setTimeout(() => {
        window.location.href = `../users-roles.html?created=${encodeURIComponent(createdUser.username || username)}`;
      }, 600);
    }
  } catch (err) {
    console.error('[CreateUser] Submission failed:', err);
    showToast(err.message || (userState.isEditMode ? 'Failed to update user.' : 'Failed to create user.'), 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
      if (window.lucide) window.lucide.createIcons({ root: btn });
    }
  }
};

// ─── Toast Notifications ───
function showToast(message, type = 'info') {
  const container = dom.toastContainer || document.getElementById('cuToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `cu-toast ${type}`;
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';

  toast.innerHTML = `
    <i data-lucide="${icon}" style="width:18px;height:18px;flex-shrink:0;"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) {
    window.lucide.createIcons({ root: toast });
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ─── Security Helper ───
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
