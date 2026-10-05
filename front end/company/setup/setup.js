/**
 * HAULO BOUTIQUE ERP — Company Setup Wizard Controller
 * 4-Step Onboarding Flow:
 *   Step 1: Boutique Identity (Brand Name, Short Code, Type, Tagline, Logo)
 *   Step 2: Contact Details (Phone, WhatsApp, Email, Website)
 *   Step 3: Location & Tax (Address, City, State, PIN, Country, GSTIN, PAN)
 *   Step 4: Administrator Account (Full Name, Username, Phone, Password, Confirm)
 *   Step 5: Launch / Success Screen
 */

'use strict';

// ── 1. Helpers ────────────────────────────────────────────────────────────────
function getApiBase() {
  if (typeof window !== 'undefined' && window.location) {
    const p = window.location.port;
    if (p === '8080' || p === '' || p === '80' || p === '443') {
      return `${window.location.origin}/api/v1`;
    }
  }
  return 'http://localhost:8080/api/v1';
}

function getToken() {
  const keys = ['erp_token', 'haulo_token', 'fashion_erp_token'];
  for (const k of keys) {
    const t = sessionStorage.getItem(k) || localStorage.getItem(k);
    if (t) return t;
  }
  return null;
}

// ── 2. Check Existing Authentication ─────────────────────────────────────────
let activeToken = getToken();
let isLoggedInUser = false;
let loggedInUsername = '';

if (activeToken) {
  try {
    const payload = JSON.parse(atob(activeToken.split('.')[1]));
    if (payload.exp && payload.exp * 1000 > Date.now()) {
      isLoggedInUser = true;
      loggedInUsername = payload.sub || payload.username || 'Admin';
    } else {
      activeToken = null;
    }
  } catch (_) {
    activeToken = null;
  }
}

// ── 3. State ──────────────────────────────────────────────────────────────────
let currentStep = 1;
const TOTAL_STEPS = 4;
const DRAFT_KEY = 'haulo_setup_draft';

// Form Data Store
const formData = {
  // Step 1: Identity
  companyName: '', shortName: '', businessType: 'Bespoke Atelier',
  tagline: '', logoBase64: null,

  // Step 2: Contact
  primaryPhone: '', whatsapp: '', email: '', website: '',

  // Step 3: Location & Legal
  streetAddress: '', city: '', state: '', pinCode: '', country: 'India',
  gstin: '', panNumber: '',

  // Step 4: Administrator Account
  adminFullName: '', adminUsername: '', adminPhone: '',
  adminPassword: '', adminConfirm: '',
};

// ── 4. DOM Elements ───────────────────────────────────────────────────────────
const errorBanner    = document.getElementById('setup-error-banner');
const errorMsg       = document.getElementById('setup-error-msg');
const progressFill   = document.getElementById('progressFill');
const hdrStepNum     = document.getElementById('hdr-step-num');
const progressBar    = document.getElementById('progressBar');
const submitBtn      = document.getElementById('btn-submit-final');
const submitText     = document.getElementById('submit-btn-text');
const submitSpinner  = document.getElementById('submit-spinner');
const submitArrow    = document.getElementById('submit-arrow');
const logoZone       = document.getElementById('logo-upload-zone');
const logoInput      = document.getElementById('f-logo');
const logoPreview    = document.getElementById('logo-preview');
const logoPrevImg    = document.getElementById('logo-preview-img');
const logoPlaceholder= document.getElementById('logo-placeholder');

// Admin Account Fields (Step 4)
const adminFullNameInput = document.getElementById('f-adminFullName');
const adminUsernameInput = document.getElementById('f-adminUsername');
const adminPhoneInput    = document.getElementById('f-adminPhone');
const adminPasswordInput = document.getElementById('f-adminPassword');
const adminConfirmInput  = document.getElementById('f-adminConfirm');
const toggleAdminPwBtn   = document.getElementById('toggle-admin-pw');
const adminEyeSvg        = document.getElementById('admin-eye-svg');
const alreadyLoggedInBox = document.getElementById('already-logged-in-box');
const loggedInUserSpan   = document.getElementById('logged-in-admin-user');
const adminFormGrid      = document.getElementById('admin-account-form-grid');

// ── 5. Feedback Helpers ───────────────────────────────────────────────────────
function showError(msg) {
  if (errorMsg && errorBanner) {
    errorMsg.textContent = msg;
    errorBanner.style.display = 'flex';
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
function hideError() {
  if (errorBanner) errorBanner.style.display = 'none';
}

function saveDraft() {
  try {
    // Save draft excluding passwords for security
    const draft = { ...formData, adminPassword: '', adminConfirm: '' };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (_) {}
}

function restoreDraft() {
  try {
    const saved = sessionStorage.getItem(DRAFT_KEY);
    if (saved) {
      const d = JSON.parse(saved);
      Object.assign(formData, d);
      // Populate fields
      setFieldValue('f-companyName', d.companyName);
      setFieldValue('f-shortName', d.shortName);
      setFieldValue('f-businessType', d.businessType);
      setFieldValue('f-tagline', d.tagline);
      setFieldValue('f-primaryPhone', d.primaryPhone);
      setFieldValue('f-whatsapp', d.whatsapp);
      setFieldValue('f-email', d.email);
      setFieldValue('f-website', d.website);
      setFieldValue('f-streetAddress', d.streetAddress);
      setFieldValue('f-city', d.city);
      setFieldValue('f-state', d.state);
      setFieldValue('f-pinCode', d.pinCode);
      setFieldValue('f-country', d.country || 'India');
      setFieldValue('f-gstin', d.gstin);
      setFieldValue('f-panNumber', d.panNumber);
      setFieldValue('f-adminFullName', d.adminFullName);
      setFieldValue('f-adminUsername', d.adminUsername);
      setFieldValue('f-adminPhone', d.adminPhone);
      if (d.logoBase64 && logoPrevImg && logoPreview && logoPlaceholder) {
        logoPrevImg.src = d.logoBase64;
        logoPreview.style.display = 'block';
        logoPlaceholder.style.display = 'none';
      }
    }
  } catch (_) {}
}

function setFieldValue(id, val) {
  const el = document.getElementById(id);
  if (!el || val == null) return;
  if (el.tagName === 'SELECT') el.value = val || el.options[0].value;
  else el.value = val || '';
}

function getFieldValue(id) {
  const el = document.getElementById(id);
  if (!el) return '';
  return el.value.trim();
}

// ── 6. Progress UI ────────────────────────────────────────────────────────────
function updateProgress(step) {
  const pct = (step / TOTAL_STEPS) * 100;
  if (progressFill) progressFill.style.width = pct + '%';
  if (hdrStepNum)   hdrStepNum.textContent = Math.min(step, TOTAL_STEPS);
  if (progressBar)  progressBar.setAttribute('aria-valuenow', step);

  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dotItem    = document.getElementById(`dot-${i}`);
    const dotCircle  = document.getElementById(`dot-circle-${i}`);
    if (!dotItem || !dotCircle) continue;

    dotItem.classList.remove('active', 'done');
    dotCircle.classList.remove('active', 'done');

    if (i < step) {
      dotItem.classList.add('done');
      dotCircle.classList.add('done');
      dotCircle.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (i === step) {
      dotItem.classList.add('active');
      dotCircle.classList.add('active');
      dotCircle.textContent = i;
    } else {
      dotCircle.textContent = i;
    }
  }
}

// ── 7. Step Navigation ────────────────────────────────────────────────────────
function showStep(step, direction = 'forward') {
  document.querySelectorAll('.step-panel').forEach(p => {
    p.classList.remove('active', 'going-back');
    p.style.display = 'none';
  });

  const nextPanel = document.getElementById(`step-${step}`);
  if (nextPanel) {
    nextPanel.classList.add('active');
    if (direction === 'back') nextPanel.classList.add('going-back');
    nextPanel.style.display = 'block';
  }

  currentStep = step;
  updateProgress(step);
  hideError();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 8. Step Collection & Validation ──────────────────────────────────────────
function collectStep(step) {
  switch (step) {
    case 1:
      formData.companyName  = getFieldValue('f-companyName');
      formData.shortName    = getFieldValue('f-shortName').toUpperCase();
      formData.businessType = getFieldValue('f-businessType');
      formData.tagline      = getFieldValue('f-tagline');
      break;
    case 2:
      formData.primaryPhone = getFieldValue('f-primaryPhone');
      formData.whatsapp     = getFieldValue('f-whatsapp');
      formData.email        = getFieldValue('f-email');
      formData.website      = getFieldValue('f-website');
      break;
    case 3:
      formData.streetAddress = getFieldValue('f-streetAddress');
      formData.city          = getFieldValue('f-city');
      formData.state         = getFieldValue('f-state');
      formData.pinCode       = getFieldValue('f-pinCode');
      formData.country       = getFieldValue('f-country') || 'India';
      formData.gstin         = getFieldValue('f-gstin').toUpperCase();
      formData.panNumber     = getFieldValue('f-panNumber').toUpperCase();
      break;
    case 4:
      formData.adminFullName = getFieldValue('f-adminFullName');
      formData.adminUsername = getFieldValue('f-adminUsername').toLowerCase();
      formData.adminPhone    = getFieldValue('f-adminPhone');
      formData.adminPassword = adminPasswordInput ? adminPasswordInput.value : '';
      formData.adminConfirm  = adminConfirmInput ? adminConfirmInput.value : '';
      break;
  }
  saveDraft();
}

function validateStep(step) {
  hideError();
  switch (step) {
    case 1:
      if (!formData.companyName) { showError('Please enter your business / boutique name.'); return false; }
      if (!formData.shortName)   { showError('Please enter a short name / brand code.'); return false; }
      return true;
    case 2:
      return true; // Contact details are optional and can be updated anytime
    case 3:
      return true; // Location and legal fields are optional
    case 4:
      if (isLoggedInUser) return true;
      if (!formData.adminFullName) {
        showError('Please enter your full name for the administrator account.');
        adminFullNameInput?.focus();
        return false;
      }
      if (!formData.adminUsername) {
        showError('Please choose a username or email for your login account.');
        adminUsernameInput?.focus();
        return false;
      }
      if (!formData.adminPassword || formData.adminPassword.length < 8) {
        showError('Password must be at least 8 characters long.');
        adminPasswordInput?.focus();
        return false;
      }
      if (formData.adminPassword !== formData.adminConfirm) {
        showError('Passwords do not match. Please re-enter your password.');
        adminConfirmInput?.focus();
        return false;
      }
      return true;
    default:
      return true;
  }
}

// ── 9. Public Navigation Functions ───────────────────────────────────────────
window.goNext = function(step) {
  collectStep(step);
  if (!validateStep(step)) return;
  showStep(step + 1, 'forward');
};

window.goBack = function(step) {
  collectStep(step);
  showStep(step - 1, 'back');
};

window.skipTo = function(step) {
  collectStep(currentStep);
  showStep(step, 'forward');
};

// ── 10. Logo Upload ──────────────────────────────────────────────────────────
if (logoInput) {
  logoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showError('Logo file is too large. Maximum size is 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      formData.logoBase64 = ev.target.result;
      if (logoPrevImg)     logoPrevImg.src = ev.target.result;
      if (logoPreview)     logoPreview.style.display = 'block';
      if (logoPlaceholder) logoPlaceholder.style.display = 'none';
      saveDraft();
    };
    reader.readAsDataURL(file);
  });
}

if (logoZone) {
  logoZone.addEventListener('dragover', (e) => { e.preventDefault(); logoZone.classList.add('drag-over'); });
  logoZone.addEventListener('dragleave', ()  => logoZone.classList.remove('drag-over'));
  logoZone.addEventListener('drop', (e) => {
    e.preventDefault();
    logoZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && logoInput) {
      logoInput.files = e.dataTransfer.files;
      logoInput.dispatchEvent(new Event('change'));
    }
  });
}

window.removeLogo = function(e) {
  if (e) e.stopPropagation();
  formData.logoBase64 = null;
  if (logoInput)       logoInput.value = '';
  if (logoPrevImg)     logoPrevImg.src = '';
  if (logoPreview)     logoPreview.style.display = 'none';
  if (logoPlaceholder) logoPlaceholder.style.display = 'flex';
  saveDraft();
};

// ── 11. Password Visibility Toggle (Step 4) ──────────────────────────────────
if (toggleAdminPwBtn && adminPasswordInput && adminEyeSvg) {
  toggleAdminPwBtn.addEventListener('click', () => {
    const isMasked = adminPasswordInput.type === 'password';
    adminPasswordInput.type = isMasked ? 'text' : 'password';
    toggleAdminPwBtn.setAttribute('aria-label', isMasked ? 'Hide password' : 'Show password');
    adminEyeSvg.innerHTML = isMasked
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
}

// ── 12. Submit Setup ─────────────────────────────────────────────────────────
window.submitSetup = async function() {
  collectStep(4);
  if (!validateStep(4)) return;

  setSubmitLoading(true);
  hideError();

  try {
    if (isLoggedInUser && activeToken) {
      // Existing logged-in user: save company details via PUT
      const companyPayload = {
        companyName:   formData.companyName   || 'My Boutique',
        shortName:     formData.shortName     || 'BOUTIQUE',
        businessType:  formData.businessType  || 'Bespoke Atelier',
        tagline:       formData.tagline       || null,
        ownerName:     loggedInUsername,
        primaryPhone:  formData.primaryPhone  || null,
        whatsapp:      formData.whatsapp      || null,
        email:         formData.email         || null,
        website:       formData.website       || null,
        streetAddress: formData.streetAddress || null,
        city:          formData.city          || null,
        state:         formData.state         || null,
        pinCode:       formData.pinCode       || null,
        country:       formData.country       || 'India',
        gstin:         formData.gstin         || null,
        panNumber:     formData.panNumber     || null,
        logoBase64:    formData.logoBase64    || null,
      };

      const res = await fetch(`${getApiBase()}/company`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + activeToken,
        },
        body: JSON.stringify(companyPayload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error: ${res.status}`);
      }

    } else {
      // New boutique registration: atomically create Admin user + Company profile via /auth/onboard
      const onboardPayload = {
        fullName:      formData.adminFullName,
        username:      formData.adminUsername.toLowerCase(),
        password:      formData.adminPassword,
        userPhone:     formData.adminPhone || null,
        companyName:   formData.companyName   || 'My Boutique',
        shortName:     formData.shortName     || 'BOUTIQUE',
        businessType:  formData.businessType  || 'Bespoke Atelier',
        tagline:       formData.tagline       || null,
        ownerName:     formData.adminFullName,
        primaryPhone:  formData.primaryPhone  || formData.adminPhone || null,
        whatsapp:      formData.whatsapp      || null,
        email:         formData.email         || (formData.adminUsername.includes('@') ? formData.adminUsername : null),
        website:       formData.website       || null,
        streetAddress: formData.streetAddress || null,
        city:          formData.city          || null,
        state:         formData.state         || null,
        pinCode:       formData.pinCode       || null,
        country:       formData.country       || 'India',
        gstin:         formData.gstin         || null,
        panNumber:     formData.panNumber     || null,
        logoBase64:    formData.logoBase64    || null,
      };

      const res = await fetch(`${getApiBase()}/auth/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardPayload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Onboarding failed (${res.status})`);
      }

      const resp = await res.json();

      // Store authentication tokens & user state
      const tokenKeys = ['erp_token', 'haulo_token', 'fashion_erp_token'];
      tokenKeys.forEach(k => {
        localStorage.setItem(k, resp.token);
        sessionStorage.setItem(k, resp.token);
      });

      const userObj = {
        userId:   resp.userId,
        username: resp.username,
        fullName: resp.fullName,
        role:     resp.role,
      };
      localStorage.setItem('erp_user', JSON.stringify(userObj));
      sessionStorage.setItem('erp_user', JSON.stringify(userObj));

      const now = Date.now();
      localStorage.setItem('haulo_session_start', String(now));
      sessionStorage.setItem('haulo_session_start', String(now));
      localStorage.setItem('haulo_last_activity', String(now));
      sessionStorage.setItem('haulo_last_activity', String(now));
    }

    // Mark company configured and clean up draft
    try { sessionStorage.removeItem(DRAFT_KEY); } catch (_) {}
    try { sessionStorage.removeItem('haulo_setup_initial_name'); } catch (_) {}
    localStorage.setItem('haulo_company_configured', 'true');

    // Show launch screen
    showSuccessPanel();

  } catch (err) {
    showError(err.message || 'Unable to save setup. Please check your connection.');
    setSubmitLoading(false);
  }
};

function setSubmitLoading(loading) {
  if (!submitBtn) return;
  submitBtn.disabled = loading;
  if (submitText)    submitText.textContent = loading ? 'Creating Boutique…' : 'Complete Setup & Launch ERP';
  if (submitSpinner) submitSpinner.style.display = loading ? 'inline-block' : 'none';
  if (submitArrow)   submitArrow.style.display   = loading ? 'none' : 'inline-block';
}

function showSuccessPanel() {
  document.querySelectorAll('.step-panel').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  const successPanel = document.getElementById('step-success');
  if (successPanel) {
    successPanel.classList.add('active');
    successPanel.style.display = 'block';
  }

  // Populate success panel greetings
  const successName    = document.getElementById('success-name');
  const successCompany = document.getElementById('success-company');
  const displayName    = formData.adminFullName || loggedInUsername || 'Admin';
  if (successName)    successName.textContent = displayName.split(' ')[0];
  if (successCompany) successCompany.textContent = formData.companyName || 'Your Boutique';

  // Hide progress indicators on completion
  const progressWrap = document.querySelector('.setup-progress-wrap');
  if (progressWrap) progressWrap.style.display = 'none';
  const hdrCounter = document.querySelector('.setup-step-counter');
  if (hdrCounter)   hdrCounter.style.display = 'none';
  if (progressFill) progressFill.style.width = '100%';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 13. Auto-fill shortName from companyName ─────────────────────────────────
const companyNameInput = document.getElementById('f-companyName');
const shortNameInput   = document.getElementById('f-shortName');
if (companyNameInput && shortNameInput) {
  companyNameInput.addEventListener('input', () => {
    if (shortNameInput._userEdited) return;
    const words = companyNameInput.value.trim().split(/\s+/).filter(Boolean);
    const abbr = words.map(w => w[0]).join('').toUpperCase().slice(0, 8);
    shortNameInput.value = abbr;
    formData.shortName = abbr;
  });
  shortNameInput.addEventListener('input', () => {
    shortNameInput._userEdited = true;
    shortNameInput.value = shortNameInput.value.toUpperCase();
  });
}

// ── 14. Initialize ────────────────────────────────────────────────────────────
(function init() {
  // Show Step 1
  document.querySelectorAll('.step-panel').forEach(p => p.style.display = 'none');
  const first = document.getElementById('step-1');
  if (first) { first.classList.add('active'); first.style.display = 'block'; }
  updateProgress(1);

  // Restore draft if any
  restoreDraft();

  // Check if company name was pre-filled from login page
  const urlParams = new URLSearchParams(window.location.search);
  const initialName = urlParams.get('companyName') || sessionStorage.getItem('haulo_setup_initial_name');
  if (initialName && companyNameInput && !companyNameInput.value) {
    companyNameInput.value = initialName;
    formData.companyName = initialName;
    companyNameInput.dispatchEvent(new Event('input'));
  }

  // If already authenticated, adapt Step 4
  if (isLoggedInUser) {
    if (alreadyLoggedInBox) alreadyLoggedInBox.style.display = 'block';
    if (loggedInUserSpan)   loggedInUserSpan.textContent = loggedInUsername;
    if (adminFormGrid)      adminFormGrid.style.display = 'none';
    if (submitText)         submitText.textContent = 'Save Boutique & Launch ERP';
  }

  // Brand text in header
  try {
    const hdrBrand = document.getElementById('hdr-brand-name');
    if (hdrBrand && formData.shortName) hdrBrand.textContent = formData.shortName;
  } catch (_) {}
})();
