/**
 * HAULO BOUTIQUE ERP — Login Controller
 * Multi-Step Login Flow:
 *   Step 1 → Company Name  (validated against backend)
 *   Step 2 → Username + Password  (JWT auth)
 *
 * Supports Sign In (2-step) and Create Account (register) tabs.
 * Developer auto-login panel is preserved on Step 1.
 */

import api, { Auth } from '../api.js';

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

// ── Pre-flight: Clear stale auth if logging out or stay on login desk ──────────
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('logout')) {
  Auth.clear();
}

// When navigating to the login desk, remain on the login page without auto-logging in.
// Only auto-redirect to dashboard if explicitly requested via ?auto_redirect=1
if (urlParams.has('auto_redirect') && Auth.isLoggedIn() && !urlParams.has('force') && urlParams.get('reason') !== 'session_expired') {
  fetch(`${getApiBase()}/customers?size=1`, {
    headers: { 'Authorization': 'Bearer ' + Auth.getToken() }
  }).then(res => {
    if (res.ok || res.status === 403) {
      if (!localStorage.getItem('haulo_session_start')) {
        const now = Date.now();
        localStorage.setItem('haulo_session_start', String(now));
        sessionStorage.setItem('haulo_session_start', String(now));
      }
      localStorage.setItem('haulo_last_activity', String(Date.now()));
      sessionStorage.setItem('haulo_last_activity', String(Date.now()));
      _redirectPostAuth(null);
    } else {
      Auth.clear();
    }
  }).catch(() => Auth.clear());
}

// ── DOM Elements ───────────────────────────────────────────────────────────
const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberChk = document.getElementById('remember');
const btnLogin = document.getElementById('btn-login');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const arrowIcon = document.getElementById('signin-arrow-icon');
const errorBanner = document.getElementById('error-banner');
const errorMsg = document.getElementById('error-msg');
const togglePw = document.getElementById('toggle-pw');
const eyeIconSvg = document.getElementById('eye-icon-svg');
const btnAutoLogin = document.getElementById('btn-auto-login');
const btnAutoText = document.getElementById('btn-auto-text');
const btnContact = document.getElementById('btn-contact');
const forgotPwLink = document.getElementById('link-forgot-pw');
const btnGoogle = document.getElementById('btn-google-login');
const btnMicrosoft = document.getElementById('btn-ms-login');

// Step elements
const loginStep1 = document.getElementById('login-step-1');
const loginStep2 = document.getElementById('login-step-2');
const companyNameInput = document.getElementById('company-name');
const btnContinue = document.getElementById('btn-company-continue');
const btnContinueText = document.getElementById('btn-continue-text');
const btnContinueSpin = document.getElementById('btn-continue-spinner');
const continueArrow = document.getElementById('continue-arrow-icon');
const companyBadge = document.getElementById('company-badge');
const companyBadgeName = document.getElementById('company-badge-name');
const btnBackToCompany = document.getElementById('btn-back-to-company');

// Tab / heading elements
const cardTitle = document.getElementById('card-title');
const cardSubtitle = document.getElementById('card-subtitle');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const sectionLogin = document.getElementById('section-login');
const sectionRegister = document.getElementById('section-register');

// ── Step State ─────────────────────────────────────────────────────────────
let resolvedCompanyId = null;   // UUID string from lookup response
let resolvedCompanyName = null;   // Exact name from server

// ── 1. Step Transition ─────────────────────────────────────────────────────
function showStep(stepNumber) {
  if (loginStep1) loginStep1.style.display = (stepNumber === 1) ? '' : 'none';
  if (loginStep2) loginStep2.style.display = (stepNumber === 2) ? '' : 'none';
  hideError();
  if (stepNumber === 1) {
    companyNameInput?.focus();
    // Update heading back to "Welcome Back"
    if (cardTitle) cardTitle.textContent = 'Welcome Back';
    if (cardSubtitle) cardSubtitle.textContent = 'Sign in to your account and continue building something beautiful.';
  } else {
    usernameInput?.focus();
    // Update heading to show which company they're signing into
    if (cardTitle) cardTitle.textContent = 'Sign In';
    if (cardSubtitle) cardSubtitle.textContent = resolvedCompanyName
      ? `Signing in to ${resolvedCompanyName}`
      : 'Enter your credentials to continue.';
  }
}

// ── 2. Tab Mode Switcher ───────────────────────────────────────────────────
let currentMode = 'login';

window.switchAuthMode = function (mode) {
  currentMode = mode;
  const isLogin = (mode === 'login');

  // Tabs
  if (tabLogin) { tabLogin.classList.toggle('active', isLogin); tabLogin.setAttribute('aria-selected', String(isLogin)); }
  if (tabRegister) { tabRegister.classList.toggle('active', !isLogin); tabRegister.setAttribute('aria-selected', String(!isLogin)); }

  // Sections
  if (sectionLogin) sectionLogin.style.display = isLogin ? '' : 'none';
  if (sectionRegister) sectionRegister.style.display = isLogin ? 'none' : '';

  // Heading
  if (isLogin) {
    // Reset to Step 1 whenever switching back to login tab
    resolvedCompanyId = null;
    resolvedCompanyName = null;
    showStep(1);
  } else {
    if (cardTitle) cardTitle.textContent = 'Register Your Boutique';
    if (cardSubtitle) cardSubtitle.textContent = 'Configure your boutique details first. You will create your admin login at the end.';
  }

  hideError();
};

if (tabLogin) tabLogin.addEventListener('click', () => switchAuthMode('login'));
if (tabRegister) tabRegister.addEventListener('click', () => switchAuthMode('register'));

// Check URL param for auto-switch
if (urlParams.get('tab') === 'register') {
  switchAuthMode('register');
}

// ── 3. Password Visibility Toggle (Login Step 2) ───────────────────────────
if (togglePw && passwordInput && eyeIconSvg) {
  togglePw.addEventListener('click', () => {
    const isMasked = passwordInput.type === 'password';
    passwordInput.type = isMasked ? 'text' : 'password';
    togglePw.setAttribute('aria-label', isMasked ? 'Hide password' : 'Show password');
    togglePw.setAttribute('title', isMasked ? 'Hide password' : 'Show password');
    eyeIconSvg.innerHTML = isMasked
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
}

// ── 4. Error Helpers ───────────────────────────────────────────────────────
function showError(message) {
  if (errorMsg && errorBanner) { errorMsg.textContent = message; errorBanner.style.display = 'flex'; }
}
function hideError() {
  if (errorBanner) errorBanner.style.display = 'none';
}

// ── 5. Loading States ──────────────────────────────────────────────────────
function setContinueLoading(loading) {
  if (!btnContinue) return;
  btnContinue.disabled = loading;
  if (btnContinueText) btnContinueText.textContent = loading ? 'Checking...' : 'Continue';
  if (continueArrow) continueArrow.style.display = loading ? 'none' : 'inline-block';
  if (btnContinueSpin) btnContinueSpin.style.display = loading ? 'inline-block' : 'none';
}

function setLoading(loading) {
  if (!btnLogin) return;
  btnLogin.disabled = loading;
  if (btnText) btnText.textContent = loading ? 'Signing in...' : 'Sign In';
  if (arrowIcon) arrowIcon.style.display = loading ? 'none' : 'inline-block';
  if (btnSpinner) btnSpinner.style.display = loading ? 'inline-block' : 'none';
  if (btnAutoLogin) btnAutoLogin.style.pointerEvents = loading ? 'none' : 'auto';
}

// ── 6. Step 1: Company Name Lookup ─────────────────────────────────────────
async function handleCompanyContinue() {
  const name = (companyNameInput?.value || '').trim();
  if (!name) {
    showError('Please enter your company name.');
    companyNameInput?.focus();
    return;
  }

  setContinueLoading(true);
  hideError();

  try {
    const data = await api.auth.lookupCompany(name);

    if (!data || !data.found) {
      showError(`No company found with the name "${name}". Please check and try again.`);
      companyNameInput?.select();
      return;
    }

    // Store resolved company context
    resolvedCompanyId = data.companyId;
    resolvedCompanyName = data.companyName;

    // Update the confirmed badge
    if (companyBadgeName) companyBadgeName.textContent = data.companyName;

    // Transition to Step 2
    showStep(2);

  } catch (err) {
    console.error('Company lookup error:', err);
    showError('Unable to reach the server. Please check your connection.');
  } finally {
    setContinueLoading(false);
  }
}

// Wire up the Continue button and Enter key on company input
if (btnContinue) {
  btnContinue.addEventListener('click', handleCompanyContinue);
}
if (companyNameInput) {
  companyNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleCompanyContinue(); }
  });
}

// ── 7. Step 2: "Change" (Back) Link ───────────────────────────────────────
if (btnBackToCompany) {
  btnBackToCompany.addEventListener('click', (e) => {
    e.preventDefault();
    resolvedCompanyId = null;
    resolvedCompanyName = null;
    // Clear credentials for security
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
    showStep(1);
  });
}

// ── 8. Post-Auth Redirect with Company Setup Guard ─────────────────────────
async function _redirectPostAuth(needsCompanySetup) {
  if (needsCompanySetup === true) {
    window.location.href = '../company/setup/setup.html';
    return;
  }
  _goToDashboard();
}

function _goToDashboard() {
  const redirectUrl = urlParams.get('redirect') ||
    sessionStorage.getItem('haulo_redirect_after_login') ||
    localStorage.getItem('haulo_redirect_after_login');
  sessionStorage.removeItem('haulo_redirect_after_login');
  localStorage.removeItem('haulo_redirect_after_login');
  const destination = (redirectUrl && !redirectUrl.includes('login') && !redirectUrl.includes('session-expired') && !redirectUrl.includes('setup'))
    ? redirectUrl
    : '../dashboard/dashboard.html';
  window.location.href = destination;
}

// ── 9. Perform Login (Step 2 Submit) ───────────────────────────────────────
async function performLogin(username, password, remember, companyName) {
  hideError();
  setLoading(true);

  try {
    const resp = await api.auth.login(username, password, companyName || resolvedCompanyName);
    Auth.setToken(resp.token, remember);
    const allowedBranches = Array.isArray(resp.allowedBranches) ? resp.allowedBranches : (resp.assignedBranch ? [resp.assignedBranch] : []);
    Auth.setUser({
      userId: resp.userId,
      username: resp.username,
      fullName: resp.fullName,
      role: resp.role,
      assignedBranch: resp.assignedBranch,
      allowedBranches: allowedBranches
    });
    sessionStorage.removeItem('erp_allowed_modules');

    const roleNorm = (resp.role || '').replace('ROLE_', '').toUpperCase();
    const isOwner = (roleNorm === 'OWNER' || roleNorm === 'ADMIN');
    if (!isOwner) {
      const initBranch = resp.assignedBranch || (allowedBranches.length > 0 ? allowedBranches[0] : 'Main Branch');
      localStorage.setItem('haulo_active_branch', initBranch);
      localStorage.setItem('haulo_active_branch_id', initBranch);
    }

    const loginTime = Date.now();
    sessionStorage.setItem('haulo_session_start', String(loginTime));
    localStorage.setItem('haulo_session_start', String(loginTime));
    sessionStorage.setItem('haulo_last_activity', String(loginTime));
    localStorage.setItem('haulo_last_activity', String(loginTime));

    if (btnText) btnText.textContent = 'Welcome back!';

    setTimeout(() => _goToDashboard(), 250);
    return true;

  } catch (err) {
    console.error('Login error:', err);
    showError(
      err.message === 'Invalid username or password' || err.status === 401
        ? 'Incorrect username or password. Please verify your credentials.'
        : (err.message || 'Unable to connect to the server. Please check your network.')
    );
    if (passwordInput) { passwordInput.value = ''; passwordInput.focus(); }
    if (btnAutoText) btnAutoText.textContent = 'Auto-Fill Admin Credentials';
    return false;
  } finally {
    setLoading(false);
  }
}

// Expose on window for Developer Mode and automation
if (typeof window !== 'undefined') {
  window.performLogin = performLogin;
  window.handleCompanyContinue = handleCompanyContinue;
  window.showStep = showStep;
  window.setResolvedCompany = function (id, name) {
    resolvedCompanyId = id;
    resolvedCompanyName = name;
    if (companyBadgeName) companyBadgeName.textContent = name;
    if (companyNameInput) companyNameInput.value = name;
  };
}

// ── 10. Form Submit Handler (Step 2) ───────────────────────────────────────
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const username = (usernameInput?.value || '').trim();
    const password = passwordInput?.value || '';
    const remember = rememberChk ? rememberChk.checked : true;

    if (!username && !password) { showError('Please enter your username and password.'); usernameInput?.focus(); return; }
    if (!username) { showError('Please enter your email or username.'); usernameInput?.focus(); return; }
    if (!password) { showError('Please enter your password.'); passwordInput?.focus(); return; }

    await performLogin(username, password, remember, resolvedCompanyName);
  });
}

// ── 11. Start Setup Flow (Register Tab) ────────────────────────────────────
function startSetupFlow() {
  const compInput = document.getElementById('reg-company-name');
  const compName = (compInput?.value || '').trim();

  // Clear any existing session so the new company setup creates fresh admin credentials
  ['erp_token', 'haulo_token', 'fashion_erp_token', 'erp_user', 'haulo_session_start', 'haulo_last_activity'].forEach(k => {
    try { localStorage.removeItem(k); } catch (_) { }
    try { sessionStorage.removeItem(k); } catch (_) { }
  });

  if (compName) {
    sessionStorage.setItem('haulo_setup_initial_name', compName);
  } else {
    sessionStorage.removeItem('haulo_setup_initial_name');
  }

  const query = compName ? `?companyName=${encodeURIComponent(compName)}` : '';
  window.location.href = `../company/setup/setup.html${query}`;
}

const btnStartSetup = document.getElementById('btn-start-setup');
if (btnStartSetup) {
  btnStartSetup.addEventListener('click', startSetupFlow);
}
const regCompInput = document.getElementById('reg-company-name');
if (regCompInput) {
  regCompInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      startSetupFlow();
    }
  });
}

// ── 12. Auto-Fill Admin Shortcut (Step 1 → auto-advance to Step 2) ─────────
if (btnAutoLogin) {
  btnAutoLogin.addEventListener('click', async () => {
    hideError();
    const originalText = '⚡ 1-Click Owner Quick Login';
    if (btnAutoText) btnAutoText.textContent = '⚡ Connecting to live database...';
    btnAutoLogin.style.pointerEvents = 'none';

    try {
      // 1. Fetch live companies and staff personas directly from database (zero hardcoded credentials)
      const pRes = await fetch(`${getApiBase()}/dev/personas`);
      if (!pRes.ok) {
        throw new Error(`Database connection failed (${pRes.status} ${pRes.statusText}). Is backend running?`);
      }

      const personas = await pRes.json();
      const pList = Array.isArray(personas) ? personas : [personas];
      if (pList.length === 0) {
        throw new Error('No company records found in the database. Please register a boutique first.');
      }

      const matchComp = pList[0];
      const targetCompany = matchComp.companyName || matchComp.shortName || '';
      const targetCompanyId = matchComp.companyId;

      if (!targetCompany) {
        throw new Error('Database company record has no company name.');
      }

      // Find live OWNER persona or primary user from this company's DB records
      const ownerUser = (matchComp.users || []).find(u => (u.role || '').toUpperCase() === 'OWNER') || (matchComp.users || [])[0];
      if (!ownerUser || !ownerUser.username) {
        throw new Error(`No active user accounts found in database for "${targetCompany}".`);
      }

      const autoUser = ownerUser.username;
      const autoPass = ownerUser.devPassword;

      // 2. Set company context and transition to Step 2
      if (companyNameInput) {
        companyNameInput.value = targetCompany;
        companyNameInput.closest('.input-glass-wrap')?.classList.add('highlight-lime');
        setTimeout(() => companyNameInput.closest('.input-glass-wrap')?.classList.remove('highlight-lime'), 500);
      }
      resolvedCompanyId = targetCompanyId;
      resolvedCompanyName = targetCompany;
      if (companyBadgeName) companyBadgeName.textContent = targetCompany;
      showStep(2);

      // 3. Fill live credentials retrieved from DB
      if (usernameInput) {
        usernameInput.value = autoUser;
        usernameInput.closest('.input-glass-wrap')?.classList.add('highlight-lime');
        setTimeout(() => usernameInput.closest('.input-glass-wrap')?.classList.remove('highlight-lime'), 500);
      }

      if (passwordInput && autoPass) {
        passwordInput.value = autoPass;
        passwordInput.closest('.input-glass-wrap')?.classList.add('highlight-lime');
        setTimeout(() => passwordInput.closest('.input-glass-wrap')?.classList.remove('highlight-lime'), 500);
      }
      if (rememberChk) rememberChk.checked = true;

      const firstName = (ownerUser.fullName || '').split(' ')[0] || autoUser;
      if (btnAutoText) btnAutoText.textContent = `⚡ Signing in as ${firstName}...`;

      // 4. Perform login with live credentials or direct dev login fallback
      if (autoPass) {
        await performLogin(autoUser, autoPass, true, resolvedCompanyName);
      } else {
        const dRes = await fetch(`${getApiBase()}/dev/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: autoUser, companyId: targetCompanyId })
        });
        if (!dRes.ok) {
          throw new Error('Sign-in rejected. Check database credentials or network.');
        }
        const resp = await dRes.json();
        Auth.setToken(resp.token, true);
        const allowedBranches = Array.isArray(resp.allowedBranches) ? resp.allowedBranches : (resp.assignedBranch ? [resp.assignedBranch] : []);
        Auth.setUser({
          userId: resp.userId,
          username: resp.username,
          fullName: resp.fullName,
          role: resp.role,
          assignedBranch: resp.assignedBranch,
          allowedBranches: allowedBranches
        });
        _goToDashboard();
      }

    } catch (err) {
      console.error('[QuickLogin] Live DB auto-login error:', err);
      showError(err.message || 'Quick login failed. Unable to read live credentials from database.');
    } finally {
      if (btnAutoText) btnAutoText.textContent = originalText;
      btnAutoLogin.style.pointerEvents = 'auto';
    }
  });

  btnAutoLogin.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btnAutoLogin.click();
    }
  });
}

// ── 13. Contact / Forgot PW / Social ──────────────────────────────────────
if (btnContact) {
  btnContact.addEventListener('click', () => {
    const sysName = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('systemName')) || 'Haulo Boutique ERP';
    const email = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('emails.support')) || 'support@haulo.luxury';
    const phone = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('telephony.primaryMobile')) || '+91 98765 43210';
    const city = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('headquarters.city')) || 'Coimbatore';
    alert(`${sysName} Concierge\n\n• Support & Inquiries: ${email}\n• Dedicated Helpline: ${phone}\n• Global Headquarters: ${city}, India`);
  });
}

if (forgotPwLink) {
  forgotPwLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Password Reset Assistance\n\nFor security reasons, password resets are handled by your boutique administrator.\n\nDefault master admin: admin / Admin@123");
  });
}

if (btnGoogle) {
  btnGoogle.addEventListener('click', () => {
    alert('Google Workspace SSO is configured for enterprise accounts. Please sign in with your admin credentials (admin / Admin@123).');
  });
}
if (btnMicrosoft) {
  btnMicrosoft.addEventListener('click', () => {
    alert('Microsoft 365 SSO is configured for enterprise accounts. Please sign in with your admin credentials (admin / Admin@123).');
  });
}
