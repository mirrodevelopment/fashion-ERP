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
  selectedBranches: new Set()
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
    toastContainer: document.getElementById('cuToastContainer')
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

  // Attempt draft restoration
  restoreUserDraft();

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

// ─── Live User Preview Synchronization ───
window.syncUserPreview = function() {
  if (!dom.sumFullName) return;

  const fullName = dom.fullNameInput ? dom.fullNameInput.value.trim() : '';
  const username = dom.usernameInput ? dom.usernameInput.value.trim() : '';

  // Full Name
  dom.sumFullName.textContent = fullName || '— New User';

  // Username
  dom.sumUsername.textContent = username ? `@${username}` : '@username';

  // Avatar Initials
  if (dom.sumAvatarInitials) {
    let initials = 'NU';
    if (fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);
      initials = parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
    } else if (username) {
      initials = username.substring(0, 2).toUpperCase();
    }
    dom.sumAvatarInitials.textContent = initials;
  }

  // Role Pill
  if (dom.sumRoleText) {
    const currentRole = userState.role || 'ROLE';
    const roleObj = userState.rolesList.find(r => r.name === currentRole);
    dom.sumRoleText.textContent = roleObj ? (roleObj.displayName || roleObj.name) : currentRole;
  }

  // Status Pill
  const isActive = dom.userActiveToggle ? dom.userActiveToggle.checked : true;
  userState.active = isActive;
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

  // Page Access Count
  if (dom.sumAccessCount) {
    const selCount = userState.selectedModules.size;
    const totCount = userState.moduleRegistry.length || 28;
    dom.sumAccessCount.textContent = `${selCount} of ${totCount} modules`;
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
};

// ─── Draft Support (localStorage) ───
window.saveUserDraft = function() {
  const draft = {
    username: dom.usernameInput ? dom.usernameInput.value.trim() : '',
    fullName: dom.fullNameInput ? dom.fullNameInput.value.trim() : '',
    role: userState.role,
    active: dom.userActiveToggle ? dom.userActiveToggle.checked : true,
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
    if (draft.role) selectRole(draft.role);
    if (dom.userActiveToggle && typeof draft.active === 'boolean') {
      dom.userActiveToggle.checked = draft.active;
      handleStatusToggle(draft.active);
    }
    if (dom.designationInput && draft.designation) dom.designationInput.value = draft.designation;
    if (dom.departmentInput && draft.department) dom.departmentInput.value = draft.department;
    if (dom.assignedBranchSelect && draft.assignedBranch) dom.assignedBranchSelect.value = draft.assignedBranch;
    if (dom.emailInput && draft.email) dom.emailInput.value = draft.email;
    if (dom.phoneInput && draft.phone) dom.phoneInput.value = draft.phone;
    if (Array.isArray(draft.allowedModules) && draft.allowedModules.length > 0) {
      userState.selectedModules = new Set(draft.allowedModules);
      refreshAllTileVisuals();
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

// ─── Render Module Access Grid ───
function renderModuleAccessGrid(modules) {
  if (!dom.moduleAccessGrid) return;

  const sectionMap = new Map();
  modules.forEach(m => {
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
  refreshAllTileVisuals();
  syncAccessCounter();
  syncUserPreview();
};

window.clearAllModules = function() {
  userState.selectedModules.clear();
  refreshAllTileVisuals();
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
  const count = userState.selectedModules.size;
  const total = userState.moduleRegistry.length;
  if (dom.accessCounter) {
    dom.accessCounter.textContent = `${count} of ${total} modules selected`;
  }
}

function applyRoleDefaultModules(roleName) {
  const r = (roleName || '').toUpperCase();
  userState.selectedModules.clear();

  if (r === 'OWNER' || r === 'ADMIN') {
    userState.moduleRegistry.forEach(m => userState.selectedModules.add(m.key));
  } else if (r === 'BRANCH_ADMIN') {
    const branchDefaults = [
      'dashboard', 'enquiries', 'appointments', 'customers', 'orders', 'payments',
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
  syncAccessCounter();
  syncUserPreview();
}

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

  if (username.length < 3) {
    showToast('Username must be at least 3 characters.', 'error');
    if (dom.usernameInput) dom.usernameInput.focus();
    return;
  }

  if (!fullName) {
    showToast('Full Name is required.', 'error');
    if (dom.fullNameInput) dom.fullNameInput.focus();
    return;
  }

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

  // Construct payload with strict types
  const payload = {
    username: username,
    fullName: fullName,
    password: password,
    role: role,
    active: dom.userActiveToggle ? dom.userActiveToggle.checked : true,
    designation: dom.designationInput && dom.designationInput.value.trim() ? dom.designationInput.value.trim() : null,
    department: dom.departmentInput && dom.departmentInput.value.trim() ? dom.departmentInput.value.trim() : null,
    assignedBranch: branchVal || (selectedBranchesList.length > 0 ? selectedBranchesList[0] : null),
    allowedBranches: selectedBranchesList,
    email: email || null,
    phone: phoneRaw ? `+91 ${phoneRaw}` : null,
    allowedModules: Array.from(userState.selectedModules)
  };

  // Submit button state
  const btn = dom.btnSubmitUser;
  const originalHTML = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="cu-spin" style="width:16px;height:16px;"></i> <span>Creating User...</span>`;
    if (window.lucide) window.lucide.createIcons({ root: btn });
  }

  try {
    const createdUser = await window.api.users.create(payload);

    // Clear saved draft on success
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}

    showToast(`User ${escapeHtml(createdUser.username || username)} provisioned successfully!`, 'success');

    // Redirect to users & roles directory with query param for toast
    setTimeout(() => {
      window.location.href = `../users-roles.html?created=${encodeURIComponent(createdUser.username || username)}`;
    }, 600);

  } catch (err) {
    console.error('[CreateUser] Creation failed:', err);
    showToast(err.message || 'Failed to create user. Please check server logs.', 'error');
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
