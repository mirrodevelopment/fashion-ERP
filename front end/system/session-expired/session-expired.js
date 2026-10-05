/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — SESSION EXPIRED CONTROLLER
 * Path: front end/system/session-expired/session-expired.js
 * =======================================================================
 */

(function () {
  'use strict';

  // 1. Elements
  const btnLoginAgain = document.getElementById('btnLoginAgain');
  const btnGoHome = document.getElementById('btnGoHome');
  const btnOpenSupport = document.getElementById('btnOpenSupport');
  const supportModal = document.getElementById('supportModal');
  const closeSupportModal = document.getElementById('closeSupportModal');
  const btnCopyDiag = document.getElementById('btnCopyDiag');
  const toastNotice = document.getElementById('toastNotice');
  const toastNoticeMsg = document.getElementById('toastNoticeMsg');
  const currentYearSpan = document.getElementById('currentYear');
  const sessionSubtitle = document.querySelector('.session-subtitle');

  let toastTimeout = null;

  // Initialize copyright year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Parse dynamic query parameters
  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason') || 'inactivity';
  const returnUrl = params.get('returnUrl') || sessionStorage.getItem('haulo_redirect_after_login') || document.referrer || '';

  // Preserve previous page to resume after re-login
  if (returnUrl && !returnUrl.includes('session-expired') && !returnUrl.includes('login')) {
    sessionStorage.setItem('haulo_redirect_after_login', returnUrl);
  }

  // Adapt description based on reason
  if (sessionSubtitle) {
    if (reason === 'unauthorized') {
      sessionSubtitle.textContent = 'Your session has ended because credentials were unauthorized or revoked. Please log in again to continue.';
    } else if (reason === 'inactivity_20m') {
      sessionSubtitle.textContent = 'Your session has expired after 20 minutes of inactivity for security reasons. Please log in again to continue.';
    } else if (reason === 'extended_session_5m') {
      sessionSubtitle.textContent = 'Workstation Security Notice: Following a 3-hour active shift, your session expired due to 5 minutes of idle time. Please log in again to resume.';
    } else {
      sessionSubtitle.textContent = 'Your session has expired due to inactivity for security reasons. Please log in again to continue.';
    }
  }

  // Wire Login Again href to forward redirect target
  if (btnLoginAgain) {
    const loginTarget = returnUrl 
      ? `../../login/login.html?redirect=${encodeURIComponent(returnUrl)}&reason=${encodeURIComponent(reason)}`
      : `../../login/login.html?reason=${encodeURIComponent(reason)}`;
    btnLoginAgain.href = loginTarget;
  }

  /**
   * Display temporary toast alert
   */
  function showToast(message, duration = 3000) {
    if (!toastNotice) return;
    if (toastNoticeMsg) toastNoticeMsg.textContent = message;

    clearTimeout(toastTimeout);
    toastNotice.classList.add('show');

    toastTimeout = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, duration);
  }

  /**
   * Modal Controls
   */
  function openModal() {
    if (!supportModal) return;
    supportModal.classList.add('is-active');
    if (btnOpenSupport) btnOpenSupport.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!supportModal) return;
    supportModal.classList.remove('is-active');
    if (btnOpenSupport) btnOpenSupport.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /**
   * Copy Session Expiration Telemetry
   */
  function copyDiagnostics() {
    let securityEvent = 'SESSION_TIMEOUT_INACTIVITY';
    if (reason === 'unauthorized') {
      securityEvent = 'SESSION_UNAUTHORIZED_REVOKED';
    } else if (reason === 'inactivity_20m') {
      securityEvent = 'SESSION_INACTIVITY_20M_TIMEOUT';
    } else if (reason === 'extended_session_5m') {
      securityEvent = 'EXTENDED_SESSION_STRICT_5M_TIMEOUT';
    }

    const sysName = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('systemName')) || 'Haulo Boutique ERP';
    const tracePrefix = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('system.sessionTracePrefix')) || 'TIMEOUT';
    const coName = (typeof CompanyBridge !== 'undefined' && CompanyBridge.get() && CompanyBridge.get().companyName) || '';

    const errorLog = [
      '==================================================',
      `${sysName.toUpperCase()} — SESSION EXPIRED TELEMETRY`,
      '==================================================',
      `Platform Brand:    ${sysName}`,
      `Atelier / Tenant:  ${coName || 'Default Boutique Atelier'}`,
      `Timestamp:         ${new Date().toISOString()}`,
      `Security Event:    ${securityEvent}`,
      `Reason:            ${reason}`,
      `Status:            JWT Token Invalid / Expired`,
      `Return Target:     ${returnUrl || 'N/A'}`,
      `Last Visited Page: ${sessionStorage.getItem('haulo_last_visited_page') || document.referrer || 'N/A'}`,
      `User Agent:        ${navigator.userAgent}`,
      `Platform:          ${navigator.platform}`,
      `Screen Resolution: ${window.innerWidth}x${window.innerHeight}`,
      `Session Trace:     ${tracePrefix}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      '=================================================='
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(errorLog)
        .then(() => {
          showToast('Session telemetry copied to clipboard!');
        })
        .catch(() => {
          fallbackCopyText(errorLog);
        });
    } else {
      fallbackCopyText(errorLog);
    }
  }

  function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Session telemetry copied to clipboard!');
    } catch (_) {
      showToast('Failed to copy. Please manually note details.');
    }
    document.body.removeChild(ta);
  }

  // 2. Attach Event Listeners
  if (btnLoginAgain) {
    btnLoginAgain.addEventListener('click', () => {
      // Clear expired tokens so clean re-auth occurs
      sessionStorage.removeItem('erp_token');
      localStorage.removeItem('erp_token');
    });
  }

  if (btnOpenSupport) {
    btnOpenSupport.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  if (closeSupportModal) {
    closeSupportModal.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  if (supportModal) {
    supportModal.addEventListener('click', (e) => {
      if (e.target === supportModal) {
        closeModal();
      }
    });
  }

  if (btnCopyDiag) {
    btnCopyDiag.addEventListener('click', (e) => {
      e.preventDefault();
      copyDiagnostics();
    });
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && supportModal && supportModal.classList.contains('is-active')) {
      closeModal();
    }
  });

})();
