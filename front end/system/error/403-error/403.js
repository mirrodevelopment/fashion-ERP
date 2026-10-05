/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — 403 ACCESS DENIED CONTROLLER
 * Path: front end/system/error/403-error/403.js
 * =======================================================================
 */

(function () {
  'use strict';

  // 1. Elements
  const btnGoBack = document.getElementById('btnGoBack');
  const btnLogin = document.getElementById('btnLogin');
  const btnOpenSupport = document.getElementById('btnOpenSupport');
  const supportModal = document.getElementById('supportModal');
  const closeSupportModal = document.getElementById('closeSupportModal');
  const btnCopyDiag = document.getElementById('btnCopyDiag');
  const toastNotice = document.getElementById('toastNotice');
  const toastNoticeMsg = document.getElementById('toastNoticeMsg');
  const currentYearSpan = document.getElementById('currentYear');
  const errorSubtitle = document.querySelector('.error-subtitle');

  let toastTimeout = null;

  // Initialize copyright year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Parse dynamic query parameters
  const params = new URLSearchParams(window.location.search);
  const targetFeature = params.get('feature');
  const requiredRole = params.get('role');

  if (errorSubtitle && (targetFeature || requiredRole)) {
    let msg = `You don’t have authorization to access <strong>${escapeHtml(targetFeature || 'this module')}</strong>.`;
    if (requiredRole) {
      msg += `<br />Required privilege level: <span style="color: #dfb76c; font-weight: 600;">${escapeHtml(requiredRole)}</span>.`;
    }
    msg += `<br />Please contact your system administrator if you require access.`;
    errorSubtitle.innerHTML = msg;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Universal 4-Tier Navigation Handler:
   * Always navigates back to the user's last visited ERP page.
   */
  function navigateToLastVisitedPage() {
    const curUrl = window.location.href;
    const curFile = window.location.pathname.split('/').pop().toLowerCase();

    // 1. Check document.referrer
    if (document.referrer) {
      try {
        const refUrl = new URL(document.referrer, window.location.origin);
        const refFile = refUrl.pathname.split('/').pop().toLowerCase();
        const isSelfOrError = refUrl.href === curUrl || 
                              refFile === curFile || 
                              refFile.includes('403') || 
                              refFile.includes('500') || 
                              refFile.includes('offline');

        if (!isSelfOrError) {
          window.location.href = document.referrer;
          return;
        }
      } catch (_) {
        if (document.referrer !== curUrl && !document.referrer.includes('403') && !document.referrer.includes('offline')) {
          window.location.href = document.referrer;
          return;
        }
      }
    }

    // 2. Check persistent storage for last recorded app page
    const storedLastPage = sessionStorage.getItem('haulo_last_visited_page') || 
                           localStorage.getItem('haulo_last_visited_page') ||
                           sessionStorage.getItem('haulo_current_page') ||
                           localStorage.getItem('haulo_current_page');

    if (storedLastPage && storedLastPage !== curUrl && !storedLastPage.includes('403') && !storedLastPage.includes('offline')) {
      window.location.href = storedLastPage;
      return;
    }

    // 3. Fallback to browser history back
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    // 4. Default safe fallback: Dashboard
    window.location.href = '../../../dashboard/dashboard.html';
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
   * Copy Access Request Diagnostics Telemetry
   */
  function copyDiagnostics() {
    const sysName = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('systemName')) || 'Haulo Boutique ERP';
    const tracePrefix = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('system.authTracePrefix')) || 'AUTH';
    const coName = (typeof CompanyBridge !== 'undefined' && CompanyBridge.get() && CompanyBridge.get().companyName) || '';

    const errorLog = [
      '==================================================',
      `${sysName.toUpperCase()} — 403 ACCESS REQUEST TELEMETRY`,
      '==================================================',
      `Platform Brand:  ${sysName}`,
      `Atelier/Tenant:  ${coName || 'Default Boutique Atelier'}`,
      `Timestamp:       ${new Date().toISOString()}`,
      `Error Code:      HTTP 403 (FORBIDDEN)`,
      `Status:          Access Denied — Role Insufficient`,
      `Feature:         ${targetFeature || 'Restricted Action'}`,
      `Required Role:   ${requiredRole || 'Administrator / Manager'}`,
      `Target Resource: ${window.location.href}`,
      `Referrer:        ${document.referrer || 'Direct Navigation / None'}`,
      `Last Visited:    ${sessionStorage.getItem('haulo_last_visited_page') || 'N/A'}`,
      `User Agent:      ${navigator.userAgent}`,
      `Platform:        ${navigator.platform}`,
      `Screen Bounds:   ${window.innerWidth}x${window.innerHeight}`,
      `Active Session:  ${tracePrefix}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      '=================================================='
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(errorLog)
        .then(() => {
          showToast('Access request telemetry copied to clipboard!');
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
      showToast('Access request telemetry copied to clipboard!');
    } catch (_) {
      showToast('Failed to copy. Please manually note error details.');
    }
    document.body.removeChild(ta);
  }

  // 2. Attach Event Listeners
  if (btnGoBack) {
    btnGoBack.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToLastVisitedPage();
    });
  }

  if (btnLogin) {
    btnLogin.addEventListener('click', () => {
      // Clear credentials and active tokens so user can sign in with higher role / different account
      try {
        sessionStorage.removeItem('erp_token');
        sessionStorage.removeItem('erp_user');
        sessionStorage.removeItem('erp_allowed_modules');
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
        localStorage.removeItem('erp_allowed_modules');
      } catch (_) {}
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
