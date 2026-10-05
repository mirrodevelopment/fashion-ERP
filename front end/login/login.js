/**
 * HAULO BOUTIQUE ERP — Login Controller
 * Redesigned Luxury Fashion Interface
 * Handles form validation, interactive password toggle, JWT auth, and redirects.
 * Supports Sign In and Create Account (register) tabs.
 */

import api, { Auth } from '../api.js';

function getApiBase() {
  if (typeof window !== 'undefined' && window.location) {
    const p = window.location.port;
    if (p === '8080' || p === '' || p === '80' || p === '443') {
      return `${window.location.origin}/api/v1`;
    }
  }
  return 'http://localhost:8080/api/v1';
}

// ── Pre-flight: already-logged-in redirect ─────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
if (Auth.isLoggedIn() && !urlParams.has('force') && !urlParams.has('logout') && urlParams.get('reason') !== 'session_expired') {
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
      // Check if company setup is needed even for existing sessions
      _redirectPostAuth(null);
    } else {
      Auth.clear();
    }
  }).catch(() => Auth.clear());
}

// ── DOM Elements ───────────────────────────────────────────────────────────
const form            = document.getElementById('login-form');
const usernameInput   = document.getElementById('username');
const passwordInput   = document.getElementById('password');
const rememberChk     = document.getElementById('remember');
const btnLogin        = document.getElementById('btn-login');
const btnText         = document.getElementById('btn-text');
const btnSpinner      = document.getElementById('btn-spinner');
const arrowIcon       = document.getElementById('signin-arrow-icon');
const errorBanner     = document.getElementById('error-banner');
const errorMsg        = document.getElementById('error-msg');
const togglePw        = document.getElementById('toggle-pw');
const eyeIconSvg      = document.getElementById('eye-icon-svg');
const btnAutoLogin    = document.getElementById('btn-auto-login');
const btnAutoText     = document.getElementById('btn-auto-text');
const btnContact      = document.getElementById('btn-contact');
const forgotPwLink    = document.getElementById('link-forgot-pw');
const btnGoogle       = document.getElementById('btn-google-login');
const btnMicrosoft    = document.getElementById('btn-ms-login');

// Register form elements
const registerForm    = document.getElementById('register-form');
const regFullname     = document.getElementById('reg-fullname');
const regUsername     = document.getElementById('reg-username');
const regPhone        = document.getElementById('reg-phone');
const regPassword     = document.getElementById('reg-password');
const regConfirm      = document.getElementById('reg-confirm');
const regTogglePw     = document.getElementById('reg-toggle-pw');
const regEyeSvg       = document.getElementById('reg-eye-svg');
const regErrorBanner  = document.getElementById('reg-error-banner');
const regErrorMsg     = document.getElementById('reg-error-msg');
const regBtnText      = document.getElementById('reg-btn-text');
const regSpinner      = document.getElementById('reg-spinner');
const regArrow        = document.getElementById('reg-arrow');

// Tab / heading elements
const cardTitle       = document.getElementById('card-title');
const cardSubtitle    = document.getElementById('card-subtitle');
const tabLogin        = document.getElementById('tab-login');
const tabRegister     = document.getElementById('tab-register');
const sectionLogin    = document.getElementById('section-login');
const sectionRegister = document.getElementById('section-register');

// ── 1. Tab Mode Switcher ───────────────────────────────────────────────────
let currentMode = 'login';

window.switchAuthMode = function(mode) {
  currentMode = mode;
  const isLogin = (mode === 'login');

  // Tabs
  if (tabLogin)    { tabLogin.classList.toggle('active', isLogin);    tabLogin.setAttribute('aria-selected', String(isLogin)); }
  if (tabRegister) { tabRegister.classList.toggle('active', !isLogin); tabRegister.setAttribute('aria-selected', String(!isLogin)); }

  // Sections
  if (sectionLogin)    sectionLogin.style.display    = isLogin ? '' : 'none';
  if (sectionRegister) sectionRegister.style.display = isLogin ? 'none' : '';

  // Heading
  if (cardTitle)    cardTitle.textContent    = isLogin ? 'Welcome Back' : 'Register Your Boutique';
  if (cardSubtitle) cardSubtitle.textContent = isLogin
    ? 'Sign in to your account and continue building something beautiful.'
    : 'Configure your boutique details first. You will create your admin login at the end.';

  hideError();
};

if (tabLogin)    tabLogin.addEventListener('click', () => switchAuthMode('login'));
if (tabRegister) tabRegister.addEventListener('click', () => switchAuthMode('register'));

// Check URL param for auto-switch
if (urlParams.get('tab') === 'register') {
  switchAuthMode('register');
}

// ── 2. Password Visibility Toggle (Login) ─────────────────────────────────
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

// Password Visibility Toggle (Register)
if (regTogglePw && regPassword && regEyeSvg) {
  regTogglePw.addEventListener('click', () => {
    const isMasked = regPassword.type === 'password';
    regPassword.type = isMasked ? 'text' : 'password';
    regTogglePw.setAttribute('aria-label', isMasked ? 'Hide password' : 'Show password');
    regEyeSvg.innerHTML = isMasked
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
}

// ── 3. Error Helpers ───────────────────────────────────────────────────────
function showError(message) {
  if (errorMsg && errorBanner) { errorMsg.textContent = message; errorBanner.style.display = 'flex'; }
}
function hideError() {
  if (errorBanner) errorBanner.style.display = 'none';
}
function showRegError(message) {
  if (regErrorMsg && regErrorBanner) { regErrorMsg.textContent = message; regErrorBanner.style.display = 'flex'; }
}
function hideRegError() {
  if (regErrorBanner) regErrorBanner.style.display = 'none';
}

// ── 4. Loading State ───────────────────────────────────────────────────────
function setLoading(loading) {
  if (!btnLogin) return;
  btnLogin.disabled = loading;
  if (btnText)    btnText.textContent = loading ? 'Signing in...' : 'Sign In';
  if (arrowIcon)  arrowIcon.style.display  = loading ? 'none' : 'inline-block';
  if (btnSpinner) btnSpinner.style.display = loading ? 'inline-block' : 'none';
  if (btnAutoLogin) btnAutoLogin.style.pointerEvents = loading ? 'none' : 'auto';
}

function setRegLoading(loading) {
  const btn = document.getElementById('btn-register');
  if (!btn) return;
  btn.disabled = loading;
  if (regBtnText) regBtnText.textContent = loading ? 'Creating account...' : 'Create My Boutique';
  if (regArrow)   regArrow.style.display   = loading ? 'none' : 'inline-block';
  if (regSpinner) regSpinner.style.display = loading ? 'inline-block' : 'none';
}

// ── 5. Post-Auth Redirect with Company Setup Guard ─────────────────────────
async function _redirectPostAuth(needsCompanySetup) {
  // If the server told us explicitly whether setup is needed, use that
  if (needsCompanySetup === true) {
    window.location.href = '../company/setup/setup.html';
    return;
  }
  if (needsCompanySetup === false) {
    _goToDashboard();
    return;
  }
  // needsCompanySetup is null (e.g. already logged in preflight) — check via API
  try {
    const token = Auth.getToken();
    const res = await fetch(`${getApiBase()}/company/status`, {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    if (res.ok) {
      const data = await res.json();
      if (!data.configured) {
        window.location.href = '../company/setup/setup.html';
        return;
      }
    }
  } catch (_) {
    // If can't reach server just go to dashboard
  }
  _goToDashboard();
}

function _goToDashboard() {
  const redirectUrl = urlParams.get('redirect') ||
                      sessionStorage.getItem('haulo_redirect_after_login') ||
                      localStorage.getItem('haulo_redirect_after_login');
  sessionStorage.removeItem('haulo_redirect_after_login');
  localStorage.removeItem('haulo_redirect_after_login');
  const destination = (redirectUrl && !redirectUrl.includes('login') && !redirectUrl.includes('session-expired'))
    ? redirectUrl
    : '../dashboard/dashboard.html';
  window.location.href = destination;
}

// ── 6. Perform Login ───────────────────────────────────────────────────────
async function performLogin(username, password, remember) {
  hideError();
  setLoading(true);

  try {
    const resp = await api.auth.login(username, password);
    Auth.setToken(resp.token, remember);
    Auth.setUser({
      userId:   resp.userId,
      username: resp.username,
      fullName: resp.fullName,
      role:     resp.role,
    });
    sessionStorage.removeItem('erp_allowed_modules');

    const loginTime = Date.now();
    sessionStorage.setItem('haulo_session_start', String(loginTime));
    localStorage.setItem('haulo_session_start', String(loginTime));
    sessionStorage.setItem('haulo_last_activity', String(loginTime));
    localStorage.setItem('haulo_last_activity', String(loginTime));

    if (btnText) btnText.textContent = 'Welcome back!';

    // Use the needsCompanySetup flag from the response
    const needsSetup = resp.needsCompanySetup === true;
    setTimeout(() => _redirectPostAuth(needsSetup), 250);

  } catch (err) {
    console.error('Login error:', err);
    showError(
      err.message === 'Invalid username or password' || err.status === 401
        ? 'Incorrect email/username or password. Please verify your credentials.'
        : (err.message || 'Unable to connect to the server. Please check your network.')
    );
    if (passwordInput) { passwordInput.value = ''; passwordInput.focus(); }
    if (btnAutoText)   btnAutoText.textContent = 'Auto-Fill Admin Credentials';
  } finally {
    setLoading(false);
  }
}

// ── 7. Start Setup Flow ────────────────────────────────────────────────────
function startSetupFlow() {
  const compInput = document.getElementById('reg-company-name');
  const compName  = (compInput?.value || '').trim();

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

// ── 8. Form Submit Handlers ────────────────────────────────────────────────
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const username = (usernameInput?.value || '').trim();
    const password = passwordInput?.value || '';
    const remember = rememberChk ? rememberChk.checked : true;

    if (!username && !password) { showError('Please enter your email address and password.'); usernameInput?.focus(); return; }
    if (!username) { showError('Please enter your email or username.'); usernameInput?.focus(); return; }
    if (!password) { showError('Please enter your password.'); passwordInput?.focus(); return; }

    await performLogin(username, password, remember);
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    startSetupFlow();
  });
}

// ── 9. Auto-Fill Admin Shortcut ────────────────────────────────────────────
if (btnAutoLogin) {
  btnAutoLogin.addEventListener('click', async () => {
    hideError();
    if (usernameInput) usernameInput.value = 'admin';
    if (passwordInput) passwordInput.value = 'Admin@123';
    if (rememberChk)   rememberChk.checked = true;
    if (btnAutoText)   btnAutoText.textContent = 'Signing in as Admin...';

    usernameInput?.closest('.input-glass-wrap')?.classList.add('highlight-lime');
    passwordInput?.closest('.input-glass-wrap')?.classList.add('highlight-lime');
    setTimeout(() => {
      usernameInput?.closest('.input-glass-wrap')?.classList.remove('highlight-lime');
      passwordInput?.closest('.input-glass-wrap')?.classList.remove('highlight-lime');
    }, 500);

    await performLogin('admin', 'Admin@123', true);
  });
}

// ── 10. Contact / Forgot PW / Social ──────────────────────────────────────
if (btnContact) {
  btnContact.addEventListener('click', () => {
    const sysName = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('systemName')) || 'Haulo Boutique ERP';
    const email   = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('emails.support')) || 'support@haulo.luxury';
    const phone   = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('telephony.primaryMobile')) || '+91 98765 43210';
    const city    = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('headquarters.city')) || 'Coimbatore';
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
