/**
 * HAULO BOUTIQUE ERP — Executive Profile Controller
 * File: front end/profile/profile.js
 * Modeled on Customer 360 Architecture & Design System
 * Connects to PostgreSQL via Spring Boot REST APIs (/api/v1/profile)
 */

import api, { Auth } from '../api.js';

// ─── Module State ──────────────────────────────────────────────────────────
let currentProfile = null;
let isEditMode = false;

// ─── Token Helper ──────────────────────────────────────────────────────────
function getToken() {
  return Auth.getToken();
}

// ─── Toast Notification System ─────────────────────────────────────────────
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    display: flex; align-items: center; gap: 10px;
    background: ${type === 'success' ? '#182018' : type === 'error' ? '#291414' : '#1f201d'};
    color: ${type === 'success' ? '#B8FF3D' : type === 'error' ? '#f87171' : '#ffffff'};
    border: 1px solid ${type === 'success' ? 'rgba(184,255,61,0.35)' : type === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.14)'};
    padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 10px;
    animation: fadeIn 0.25s ease;
  `;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}
window.showToast = showToast;

// ─── Fetch and Hydrate Profile ─────────────────────────────────────────────
async function loadProfile() {
  const token = getToken();
  if (!token) {
    showToast('Session expired. Redirecting to login...', 'error');
    setTimeout(() => window.location.href = '../login/login.html', 1500);
    return;
  }

  try {
    const data = await api.profile.get();
    currentProfile = data;
    populateUI(currentProfile);
  } catch (err) {
    console.error('[Profile] Failed to load profile via api:', err);

    // Fallback: direct fetch
    try {
      const res = await fetch('http://localhost:8080/api/v1/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        currentProfile = await res.json();
        populateUI(currentProfile);
        return;
      }
    } catch (_) {}

    // Fallback: session storage without fabricated dummy values
    const sessionUser = Auth.getUser();
    if (sessionUser) {
      populateUI({
        username: sessionUser.username || '',
        fullName: sessionUser.fullName || sessionUser.username || '',
        role: sessionUser.role || '',
        email: sessionUser.email || '',
        phone: sessionUser.phone || '',
        designation: sessionUser.designation || '',
        department: sessionUser.department || '',
        assignedBranch: sessionUser.branch || '',
        bio: sessionUser.bio || ''
      });
    }
  }
}

// ─── Populate UI Components Matching Customer 360 ──────────────────────────
function populateUI(p) {
  if (!p) return;

  // 1. Profile Banner Left
  const profileName = document.getElementById('profileName');
  const profileRoleBadge = document.getElementById('profileRoleBadge');
  const profileClearanceBadge = document.getElementById('profileClearanceBadge');
  const profileUsername = document.getElementById('profileUsername');
  const profilePhone = document.getElementById('profilePhone');
  const profileEmail = document.getElementById('profileEmail');
  const profileBranch = document.getElementById('profileBranch');
  const profileQuote = document.getElementById('profileQuote');
  const profileQuoteAuthor = document.getElementById('profileQuoteAuthor');
  const bcProfileName = document.getElementById('bcProfileName');

  const displayName = p.fullName || p.username || 'User Profile';
  if (profileName) profileName.textContent = displayName;
  if (bcProfileName) bcProfileName.textContent = displayName;
  if (profileRoleBadge) profileRoleBadge.textContent = p.role || '—';
  if (profileClearanceBadge) profileClearanceBadge.textContent = p.clearanceLevel || '—';
  if (profileUsername) profileUsername.textContent = `@${p.username || 'user'}`;
  if (profilePhone) profilePhone.textContent = p.phone || '—';
  if (profileEmail) profileEmail.textContent = p.email || '—';
  if (profileBranch) profileBranch.textContent = p.assignedBranch || '—';

  if (p.bio && p.bio.trim() !== '') {
    if (profileQuote) profileQuote.textContent = `“${p.bio}”`;
  } else {
    if (profileQuote) profileQuote.textContent = '“No personal philosophy recorded.”';
  }
  if (profileQuoteAuthor) {
    profileQuoteAuthor.textContent = p.displayTitle ? `— ${p.displayTitle}` : (p.designation ? `— ${p.designation}` : (p.fullName ? `— ${p.fullName}` : '—'));
  }

  // 2. Profile Banner Right Metrics
  const statMemberSince = document.getElementById('statMemberSince');
  const statTenureTier = document.getElementById('statTenureTier');
  const statLastLogin = document.getElementById('statLastLogin');
  const statLastLoginSub = document.getElementById('statLastLoginSub');
  const statRoleValue = document.getElementById('statRoleValue');
  const statPrivilegesSummary = document.getElementById('statPrivilegesSummary');
  const statSecurityValue = document.getElementById('statSecurityValue');
  const statSessionLifetime = document.getElementById('statSessionLifetime');

  if (statMemberSince) statMemberSince.textContent = p.memberSince || '—';
  if (statTenureTier) statTenureTier.textContent = p.tenureTier || '—';

  if (statLastLogin) {
    if (p.lastLogin) {
      const d = new Date(p.lastLogin);
      statLastLogin.textContent = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      if (statLastLoginSub) statLastLoginSub.textContent = 'Active Session';
    } else {
      statLastLogin.textContent = 'Active now';
      if (statLastLoginSub) statLastLoginSub.textContent = 'Current Session';
    }
  }

  if (statRoleValue) statRoleValue.textContent = p.role || '—';
  if (statPrivilegesSummary) statPrivilegesSummary.textContent = p.privilegesSummary || '—';
  if (statSecurityValue) statSecurityValue.textContent = p.securityStatus ? p.securityStatus.split(' ')[0] : '—';
  if (statSessionLifetime) statSessionLifetime.textContent = p.sessionLifetime || '—';

  // 3. Atelier & Clearance Highlights (Middle & Right Columns)
  const respTitle = document.getElementById('respTitle');
  const respDept = document.getElementById('respDept');
  const respShift = document.getElementById('respShift');
  const respBranch = document.getElementById('respBranch');
  const respEmergency = document.getElementById('respEmergency');

  if (respTitle) respTitle.textContent = p.displayTitle || p.designation || '—';
  if (respDept) respDept.textContent = p.department || '—';
  if (respShift) respShift.textContent = p.workShift || '—';
  if (respBranch) respBranch.textContent = p.assignedBranch || '—';
  if (respEmergency) respEmergency.textContent = p.emergencyContact || '—';

  const clearanceTitle = document.getElementById('clearanceTitle');
  const clearanceSub = document.getElementById('clearanceSub');
  const pillModules = document.getElementById('pillModules');
  const metaUserId = document.getElementById('metaUserId');
  const metaProfileId = document.getElementById('metaProfileId');
  const metaSecurityStatus = document.getElementById('metaSecurityStatus');
  const metaSessionLifetime = document.getElementById('metaSessionLifetime');
  const metaWorkShift = document.getElementById('metaWorkShift');
  const metaAccountStatus = document.getElementById('metaAccountStatus');

  if (clearanceTitle) clearanceTitle.textContent = p.systemRoleLabel || p.role || '—';
  if (clearanceSub) clearanceSub.textContent = p.clearanceLevel ? `${p.clearanceLevel} • System Clearance` : 'System Clearance';
  if (pillModules) pillModules.textContent = p.privilegesSummary || 'Modules Active';

  if (p.userId && metaUserId) {
    metaUserId.textContent = String(p.userId).slice(0, 18) + '...';
    metaUserId.title = p.userId;
  }
  if (p.profileId && metaProfileId) {
    metaProfileId.textContent = String(p.profileId).slice(0, 18) + '...';
    metaProfileId.title = p.profileId;
  }
  if (metaSecurityStatus) metaSecurityStatus.textContent = p.securityStatus || '—';
  if (metaSessionLifetime) metaSessionLifetime.textContent = p.sessionLifetime || '—';
  if (metaWorkShift) metaWorkShift.textContent = p.workShift || '—';
  if (metaAccountStatus) metaAccountStatus.textContent = p.active ? 'Verified • Active' : 'Suspended';

  // 3. Avatar Application
  applyAvatar(p.avatarUrl, p.fullName);

  // 4. Form Fields
  const inputFullName = document.getElementById('inputFullName');
  const inputUsername = document.getElementById('inputUsername');
  const inputEmail = document.getElementById('inputEmail');
  const inputPhone = document.getElementById('inputPhone');
  const inputDesignation = document.getElementById('inputDesignation');
  const inputDepartment = document.getElementById('inputDepartment');
  const inputAssignedBranch = document.getElementById('inputAssignedBranch');
  const inputBio = document.getElementById('inputBio');
  const bioPreviewText = document.getElementById('bioPreviewText');

  if (inputFullName) inputFullName.value = p.fullName || '';
  if (inputUsername) inputUsername.value = (p.username || '').replace(/^@/, '');
  if (inputEmail) inputEmail.value = p.email || '';
  if (inputPhone) inputPhone.value = p.phone || '';
  if (inputDesignation) inputDesignation.value = p.designation || '';
  if (inputDepartment) inputDepartment.value = p.department || '';
  populateBranchSelect(p.assignedBranch || '');
  if (inputBio) {
    inputBio.value = p.bio || '';
    if (bioPreviewText) {
      bioPreviewText.textContent = p.bio ? `“${p.bio}”` : '“No personal philosophy recorded.”';
    }
    inputBio.oninput = () => {
      if (bioPreviewText) {
        bioPreviewText.textContent = inputBio.value ? `“${inputBio.value}”` : '“No personal philosophy recorded.”';
      }
    };
  }

  disableEditMode();

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// ─── Avatar Propagation ───────────────────────────────────────────────────
function applyAvatar(avatarUrl, fullName) {
  const heroImg = document.getElementById('heroAvatarImg');
  const heroFallback = document.getElementById('customerAvatarInitials');
  const sideImg = document.getElementById('sideAvatarImg');

  const initials = (fullName || 'AD').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (heroFallback) heroFallback.textContent = initials;

  if (avatarUrl && avatarUrl.trim() !== '') {
    if (heroImg) {
      heroImg.src = avatarUrl;
      heroImg.style.display = 'block';
      if (heroFallback) heroFallback.style.display = 'none';
    }
    if (sideImg) sideImg.src = avatarUrl;

    // Propagate to topbar user avatar
    document.querySelectorAll('.u-avatar-img').forEach(img => {
      img.src = avatarUrl;
      img.style.display = 'block';
    });
    document.querySelectorAll('.u-avatar').forEach(el => el.style.display = 'none');
    localStorage.setItem('erp_user_avatar', avatarUrl);
  } else {
    if (heroImg) heroImg.style.display = 'none';
    if (heroFallback) heroFallback.style.display = 'flex';
  }
}

// ─── Edit Mode Management ──────────────────────────────────────────────────
function enableEditMode() {
  isEditMode = true;

  const editableInputs = [
    document.getElementById('inputFullName'),
    document.getElementById('inputEmail'),
    document.getElementById('inputPhone'),
    document.getElementById('inputDesignation'),
    document.getElementById('inputDepartment'),
    document.getElementById('inputBio')
  ];

  editableInputs.forEach(input => {
    if (input) {
      input.readOnly = false;
      input.disabled = false;
      input.classList.remove('is-view-mode');
      input.classList.add('is-editing-mode');
    }
  });

  const branchSelect = document.getElementById('inputAssignedBranch');
  if (branchSelect) {
    branchSelect.disabled = false;
    branchSelect.classList.remove('is-view-mode');
    branchSelect.classList.add('is-editing-mode');
  }

  // Update card action buttons
  const viewActions = document.getElementById('formViewActions');
  const editActions = document.getElementById('formEditActions');
  if (viewActions) viewActions.style.display = 'none';
  if (editActions) editActions.style.display = 'flex';

  // Update header button
  const headerBtn = document.getElementById('btnHeaderEdit');
  const headerText = document.getElementById('btnHeaderEditText');
  if (headerBtn) {
    headerBtn.classList.add('btn-editing-active');
    headerBtn.title = 'Cancel editing';
  }
  if (headerText) headerText.textContent = 'Cancel';

  // Update topbar action button
  const topSaveBtn = document.getElementById('topSaveBtn');
  if (topSaveBtn) {
    topSaveBtn.innerHTML = `<i data-lucide="check"></i><span id="topSaveBtnText">Save Changes</span>`;
  }

  // Focus full name input
  document.getElementById('inputFullName')?.focus();

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}
window.enableEditMode = enableEditMode;

function disableEditMode() {
  isEditMode = false;

  const editableInputs = [
    document.getElementById('inputFullName'),
    document.getElementById('inputEmail'),
    document.getElementById('inputPhone'),
    document.getElementById('inputDesignation'),
    document.getElementById('inputDepartment'),
    document.getElementById('inputBio')
  ];

  editableInputs.forEach(input => {
    if (input) {
      input.readOnly = true;
      input.classList.remove('is-editing-mode');
      input.classList.add('is-view-mode');
    }
  });

  const branchSelect = document.getElementById('inputAssignedBranch');
  if (branchSelect) {
    branchSelect.disabled = true;
    branchSelect.classList.remove('is-editing-mode');
    branchSelect.classList.add('is-view-mode');
  }

  // Update card action buttons
  const viewActions = document.getElementById('formViewActions');
  const editActions = document.getElementById('formEditActions');
  if (viewActions) viewActions.style.display = 'flex';
  if (editActions) editActions.style.display = 'none';

  // Update header button
  const headerBtn = document.getElementById('btnHeaderEdit');
  const headerText = document.getElementById('btnHeaderEditText');
  if (headerBtn) {
    headerBtn.classList.remove('btn-editing-active');
    headerBtn.title = 'Click to edit profile details';
  }
  if (headerText) headerText.textContent = 'Edit';

  // Update topbar action button
  const topSaveBtn = document.getElementById('topSaveBtn');
  if (topSaveBtn) {
    topSaveBtn.innerHTML = `<i data-lucide="edit-3"></i><span id="topSaveBtnText">Edit Profile</span>`;
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}
window.disableEditMode = disableEditMode;

function cancelEditMode() {
  resetPersonalForm();
  disableEditMode();
  showToast('Edit mode closed. Changes discarded.', 'info');
}
window.cancelEditMode = cancelEditMode;

function toggleEditMode() {
  if (isEditMode) {
    cancelEditMode();
  } else {
    enableEditMode();
  }
}
window.toggleEditMode = toggleEditMode;

function handleTopAction() {
  if (isEditMode) {
    savePersonalDetails();
  } else {
    enableEditMode();
  }
}
window.handleTopAction = handleTopAction;

// ─── Save Personal Details ─────────────────────────────────────────────────
async function savePersonalDetails() {
  const fullName = document.getElementById('inputFullName')?.value.trim();
  if (!fullName) {
    showToast('Full name is required.', 'error');
    return;
  }

  const payload = {
    fullName,
    email: document.getElementById('inputEmail')?.value.trim() || '',
    phone: document.getElementById('inputPhone')?.value.trim() || '',
    designation: document.getElementById('inputDesignation')?.value.trim() || '',
    department: document.getElementById('inputDepartment')?.value.trim() || '',
    assignedBranch: document.getElementById('inputAssignedBranch')?.value.trim() || '',
    bio: document.getElementById('inputBio')?.value.trim() || ''
  };

  const btn = document.getElementById('btnSavePersonal');
  const topSaveBtn = document.getElementById('topSaveBtn');
  if (btn) btn.disabled = true;
  if (topSaveBtn) topSaveBtn.disabled = true;

  try {
    const updated = await api.profile.update(payload);
    currentProfile = updated;
    populateUI(updated);
    disableEditMode();

    // Update topbar name across document
    document.querySelectorAll('.u-name').forEach(el => el.textContent = updated.fullName);

    // Update local session
    const u = Auth.getUser();
    if (u) {
      u.fullName = updated.fullName;
      sessionStorage.setItem('erp_user', JSON.stringify(u));
    }

    showToast('Executive profile updated successfully!', 'success');
  } catch (err) {
    console.error('[Profile] Save failed:', err);
    showToast(err.message || 'Failed to save changes.', 'error');
  } finally {
    if (btn) btn.disabled = false;
    if (topSaveBtn) topSaveBtn.disabled = false;
  }
}
window.savePersonalDetails = savePersonalDetails;

// ─── Avatar Upload (Up to 20 MB) ───────────────────────────────────────────
function triggerAvatarUpload() {
  const fileInput = document.getElementById('avatarFileInput');
  if (fileInput) fileInput.click();
}
window.triggerAvatarUpload = triggerAvatarUpload;

async function handleAvatarFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // Max 20 MB size validation
  const MAX_BYTES = 20 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    showToast(`File size ${(file.size / (1024 * 1024)).toFixed(1)} MB exceeds the 20 MB limit.`, 'error');
    event.target.value = '';
    return;
  }

  // Type check
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file (JPEG, PNG, WEBP, SVG).', 'error');
    event.target.value = '';
    return;
  }

  // Immediate preview
  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUri = e.target?.result;
    applyAvatar(dataUri, currentProfile?.fullName);

    const formData = new FormData();
    formData.append('file', file);

    try {
      showToast('Uploading profile avatar...', 'info');
      const data = await api.profile.uploadAvatar(formData);
      showToast('Profile photo updated successfully!', 'success');
      if (currentProfile) currentProfile.avatarUrl = data.avatarUrl;
      applyAvatar(data.avatarUrl, currentProfile?.fullName);
    } catch (err) {
      console.error('[Profile] Avatar upload failed:', err);
      // Fallback: update base64 directly
      try {
        const data = await api.profile.uploadAvatarBase64(dataUri);
        showToast('Profile photo updated successfully!', 'success');
        if (currentProfile) currentProfile.avatarUrl = data.avatarUrl;
      } catch (e2) {
        showToast(err.message || 'Avatar upload failed. Displaying local preview.', 'error');
      }
    }
  };
  reader.readAsDataURL(file);
}
window.handleAvatarFileSelect = handleAvatarFileSelect;

function removeCustomAvatar() {
  applyAvatar('', currentProfile?.fullName);
  localStorage.removeItem('erp_user_avatar');

  api.profile.uploadAvatarBase64('').catch(() => {});
  showToast('Avatar reset to default.', 'info');
}
window.removeCustomAvatar = removeCustomAvatar;

// ─── Change Password ───────────────────────────────────────────────────────
async function changePassword() {
  const currentPassword = document.getElementById('inputCurrentPassword')?.value;
  const newPassword = document.getElementById('inputNewPassword')?.value;
  const confirmPassword = document.getElementById('inputConfirmPassword')?.value;

  if (!currentPassword) {
    showToast('Please enter your current password.', 'error');
    return;
  }
  if (!newPassword || newPassword.length < 6) {
    showToast('New password must be at least 6 characters long.', 'error');
    return;
  }
  if (newPassword !== confirmPassword) {
    showToast('New password and confirm password do not match.', 'error');
    return;
  }

  const btn = document.getElementById('btnUpdatePassword');
  if (btn) btn.disabled = true;

  try {
    await api.profile.changePassword({ currentPassword, newPassword, confirmPassword });

    document.getElementById('formPassword')?.reset();
    const meterWrap = document.getElementById('strengthMeterWrap');
    if (meterWrap) meterWrap.style.display = 'none';
    const matchFeedback = document.getElementById('matchFeedback');
    if (matchFeedback) matchFeedback.textContent = '';
    showToast('Password changed successfully!', 'success');
  } catch (err) {
    console.error('[Profile] Password update failed:', err);
    showToast(err.message || 'Could not update password. Check current password.', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}
window.changePassword = changePassword;

// ─── Password Strength & Match Helpers ─────────────────────────────────────
function evaluatePasswordStrength(val) {
  const wrap = document.getElementById('strengthMeterWrap');
  const fill = document.getElementById('strengthBarFill');
  const text = document.getElementById('strengthText');
  const ruleLength = document.getElementById('ruleLength');
  const ruleCase = document.getElementById('ruleCase');
  const ruleNumber = document.getElementById('ruleNumber');

  if (!val) {
    if (wrap) wrap.style.display = 'none';
    return;
  }
  if (wrap) wrap.style.display = 'flex';

  let score = 0;
  if (val.length >= 6) {
    score++;
    ruleLength?.classList.add('pass');
  } else {
    ruleLength?.classList.remove('pass');
  }

  if (/[a-z]/.test(val) && /[A-Z]/.test(val)) {
    score++;
    ruleCase?.classList.add('pass');
  } else {
    ruleCase?.classList.remove('pass');
  }

  if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) {
    score++;
    ruleNumber?.classList.add('pass');
  } else {
    ruleNumber?.classList.remove('pass');
  }

  if (score === 1) {
    fill.style.width = '33%';
    fill.style.backgroundColor = '#ef4444';
    text.textContent = 'Strength: Weak';
    text.style.color = '#ef4444';
  } else if (score === 2) {
    fill.style.width = '66%';
    fill.style.backgroundColor = '#f59e0b';
    text.textContent = 'Strength: Medium';
    text.style.color = '#f59e0b';
  } else if (score >= 3) {
    fill.style.width = '100%';
    fill.style.backgroundColor = '#b8ff3d';
    text.textContent = 'Strength: Strong';
    text.style.color = '#b8ff3d';
  }
}
window.evaluatePasswordStrength = evaluatePasswordStrength;

function checkPasswordMatch() {
  const p1 = document.getElementById('inputNewPassword')?.value;
  const p2 = document.getElementById('inputConfirmPassword')?.value;
  const feedback = document.getElementById('matchFeedback');
  if (!feedback) return;

  if (!p2) {
    feedback.textContent = '';
    return;
  }
  if (p1 === p2) {
    feedback.textContent = '✓ Passwords match';
    feedback.style.color = '#b8ff3d';
  } else {
    feedback.textContent = '✗ Passwords do not match';
    feedback.style.color = '#ef4444';
  }
}
window.checkPasswordMatch = checkPasswordMatch;

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

function resetPersonalForm() {
  if (currentProfile) populateUI(currentProfile);
}
window.resetPersonalForm = resetPersonalForm;

// ─── Tab Switching (Customer 360 Mechanism) ────────────────────────────────
function switchProfileTab(tabName, btn) {
  const cleanTab = String(tabName || 'overview').toLowerCase().trim();

  // 1. Update active tab pill
  const tabs = document.querySelectorAll('.c360-nav-tabs .tab-pill');
  tabs.forEach(t => {
    const tTab = (t.dataset.tab || t.textContent.trim()).toLowerCase();
    if (tTab === cleanTab || (btn && t === btn)) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  // 2. Toggle Sub-Page Views
  const allViews = document.querySelectorAll('.c360-tab-view');
  allViews.forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });

  const targetView = document.getElementById(`tabView-${cleanTab}`);
  if (targetView) {
    targetView.classList.add('active');
    targetView.style.display = 'block';
  } else {
    const overviewView = document.getElementById('tabView-overview');
    if (overviewView) {
      overviewView.classList.add('active');
      overviewView.style.display = 'block';
    }
  }

  // 3. Smooth scroll
  const navTabsBar = document.querySelector('.c360-nav-tabs');
  if (navTabsBar) {
    navTabsBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // 4. Re-render Lucide icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
// ─── Dynamic Branch Options Population ─────────────────────────────────────
async function populateBranchSelect(selectedBranch) {
  const branchSelect = document.getElementById('inputAssignedBranch');
  if (!branchSelect) return;
  try {
    const branches = await api.branches.list().catch(() => []);
    const items = Array.isArray(branches) ? branches : (branches.content || []);
    branchSelect.innerHTML = '<option value="">Select Primary Branch</option>';
    items.forEach(b => {
      if (b.name) {
        const opt = document.createElement('option');
        opt.value = b.name;
        opt.textContent = b.name;
        if (selectedBranch && b.name.toLowerCase() === selectedBranch.toLowerCase()) {
          opt.selected = true;
        }
        branchSelect.appendChild(opt);
      }
    });
    if (selectedBranch && !items.some(b => (b.name || '').toLowerCase() === selectedBranch.toLowerCase())) {
      const opt = document.createElement('option');
      opt.value = selectedBranch;
      opt.textContent = selectedBranch;
      opt.selected = true;
      branchSelect.appendChild(opt);
    }
  } catch (_) {
    if (!branchSelect.innerHTML) {
      branchSelect.innerHTML = '<option value="">Select Primary Branch</option>';
    }
  }
}

// ─── Initialization ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
});
