/**
 * HAULO BOUTIQUE ERP — Login Controller
 * Redesigned Luxury Fashion Interface
 * Handles form validation, interactive password toggle, JWT auth, and redirects.
 */

import api, { Auth } from '../api.js';

// If already logged in, verify the token is still valid before redirecting to dashboard
const urlParams = new URLSearchParams(window.location.search);
if (Auth.isLoggedIn() && !urlParams.has('force') && !urlParams.has('logout')) {
  // Verify token is still accepted by the backend before auto-redirecting
  fetch('/api/v1/customers?size=1', {
    headers: { 'Authorization': 'Bearer ' + Auth.getToken() }
  }).then(res => {
    if (res.ok || res.status === 403) {
      // 200 = valid token, 403 = valid token but no permission (shouldn't happen for admin)
      window.location.href = '../dashboard/dashboard.html';
    } else {
      // 401 = token expired or invalid — clear it and stay on login page
      Auth.clear();
    }
  }).catch(() => {
    // Network error — stay on login page, don't auto-redirect
    Auth.clear();
  });
}

// DOM Elements
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

// ── 1. Interactive Password Visibility Toggle ──────────────────────────────
if (togglePw && passwordInput && eyeIconSvg) {
  togglePw.addEventListener('click', () => {
    const isMasked = passwordInput.type === 'password';
    passwordInput.type = isMasked ? 'text' : 'password';
    togglePw.setAttribute('aria-label', isMasked ? 'Hide password' : 'Show password');
    togglePw.setAttribute('title', isMasked ? 'Hide password' : 'Show password');

    if (isMasked) {
      // Show eye-off icon (slash through)
      eyeIconSvg.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    } else {
      // Show standard open eye icon
      eyeIconSvg.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    }
  });
}

// ── 2. Error Display Helpers ───────────────────────────────────────────────
function showError(message) {
  if (errorMsg && errorBanner) {
    errorMsg.textContent = message;
    errorBanner.style.display = 'flex';
  }
}

function hideError() {
  if (errorBanner) {
    errorBanner.style.display = 'none';
  }
}

// ── 3. Loading State ───────────────────────────────────────────────────────
function setLoading(loading) {
  if (!btnLogin) return;
  btnLogin.disabled = loading;
  if (btnText) btnText.textContent = loading ? 'Signing in...' : 'Sign In';
  if (arrowIcon) arrowIcon.style.display = loading ? 'none' : 'inline-block';
  if (btnSpinner) btnSpinner.style.display = loading ? 'inline-block' : 'none';
  if (btnAutoLogin) btnAutoLogin.style.pointerEvents = loading ? 'none' : 'auto';
}

// ── 4. Perform Authentication Request ──────────────────────────────────────
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

    // Provide smooth visual transition before redirect
    if (btnText) btnText.textContent = 'Welcome back!';
    setTimeout(() => {
      window.location.href = '../dashboard/dashboard.html';
    }, 250);

  } catch (err) {
    console.error('Login error:', err);
    showError(
      err.message === 'Invalid username or password' || err.status === 401
        ? 'Incorrect email/username or password. Please verify your credentials.'
        : (err.message || 'Unable to connect to the server. Please check your network.')
    );
    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.focus();
    }
    if (btnAutoText) {
      btnAutoText.textContent = 'Auto-Fill Admin Credentials';
    }
  } finally {
    setLoading(false);
  }
}

// ── 5. Form Submission Handler ─────────────────────────────────────────────
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const username = (usernameInput?.value || '').trim();
    const password = passwordInput?.value || '';
    const remember = rememberChk ? rememberChk.checked : true;

    if (!username && !password) {
      showError('Please enter your email address and password.');
      usernameInput?.focus();
      return;
    }
    if (!username) {
      showError('Please enter your email or username.');
      usernameInput?.focus();
      return;
    }
    if (!password) {
      showError('Please enter your password.');
      passwordInput?.focus();
      return;
    }

    await performLogin(username, password, remember);
  });
}

// ── 6. Auto Fill Admin Shortcut ────────────────────────────────────────────
if (btnAutoLogin) {
  btnAutoLogin.addEventListener('click', async () => {
    hideError();
    if (usernameInput) usernameInput.value = 'admin';
    if (passwordInput) passwordInput.value = 'Admin@123';
    if (rememberChk)   rememberChk.checked = true;

    if (btnAutoText) btnAutoText.textContent = 'Signing in as Admin...';

    // Highlight inputs briefly
    usernameInput?.closest('.input-glass-wrap')?.classList.add('highlight-lime');
    passwordInput?.closest('.input-glass-wrap')?.classList.add('highlight-lime');
    setTimeout(() => {
      usernameInput?.closest('.input-glass-wrap')?.classList.remove('highlight-lime');
      passwordInput?.closest('.input-glass-wrap')?.classList.remove('highlight-lime');
    }, 500);

    await performLogin('admin', 'Admin@123', true);
  });
}

// ── 7. Contact Us Modal / Notification ─────────────────────────────────────
if (btnContact) {
  btnContact.addEventListener('click', () => {
    alert(
      "Haulo Boutique ERP Support\n\n" +
      "• Sales & Onboarding: sales@haulo.in\n" +
      "• Dedicated Helpline: +91 98765 43210 (Mon-Sat, 9AM-8PM IST)\n" +
      "• Atelier Headquarters: Haulo Designs Flagship Studio"
    );
  });
}

// ── 8. Forgot Password Handler ─────────────────────────────────────────────
if (forgotPwLink) {
  forgotPwLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert(
      "Password Reset Assistance\n\n" +
      "For security reasons, password resets are handled by your boutique administrator.\n\n" +
      "Default master admin: admin / Admin@123"
    );
  });
}

// ── 9. Social Login Providers ──────────────────────────────────────────────
if (btnGoogle) {
  btnGoogle.addEventListener('click', () => {
    alert("Google Workspace SSO is configured for enterprise accounts. Please sign in with your Haulo administrator credentials (admin / Admin@123).");
  });
}

if (btnMicrosoft) {
  btnMicrosoft.addEventListener('click', () => {
    alert("Microsoft 365 SSO is configured for enterprise accounts. Please sign in with your Haulo administrator credentials (admin / Admin@123).");
  });
}
