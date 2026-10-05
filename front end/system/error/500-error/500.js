/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — 500 SOMETHING WENT WRONG CONTROLLER
 * Path: front end/system/error/500-error/500.js
 * =======================================================================
 */

(function () {
  'use strict';

  // 1. Elements
  const btnGoBack = document.getElementById('btnGoBack');
  const btnTryAgain = document.getElementById('btnTryAgain');
  const btnTryAgainText = document.getElementById('btnTryAgainText');
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
  const errorCode = params.get('code') || '500';
  const errorMessage = params.get('msg');
  const traceId = params.get('trace') || ('HAULO-500-' + Math.random().toString(36).substring(2, 9).toUpperCase());

  if (errorSubtitle && errorMessage) {
    errorSubtitle.innerHTML = `We encountered an unexpected server fault (HTTP ${escapeHtml(errorCode)}):<br /><span style="display:inline-block; margin-top:6px; margin-bottom:6px; font-family: monospace; font-size: 13px; color: #fae2b3; background: rgba(250, 226, 179, 0.08); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(223, 183, 108, 0.2);">${escapeHtml(errorMessage)}</span><br /><span style="font-size: 11.5px; opacity: 0.7; letter-spacing: 0.04em;">TRACE ID: ${escapeHtml(traceId)}</span>`;
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
                              refFile.includes('500') || 
                              refFile.includes('offline');

        if (!isSelfOrError) {
          window.location.href = document.referrer;
          return;
        }
      } catch (_) {
        if (document.referrer !== curUrl && !document.referrer.includes('500') && !document.referrer.includes('offline')) {
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

    if (storedLastPage && storedLastPage !== curUrl && !storedLastPage.includes('500') && !storedLastPage.includes('offline')) {
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
   * Try Again Action
   */
  function handleTryAgain() {
    if (!btnTryAgain) return;
    if (btnTryAgain.classList.contains('is-loading')) return;

    btnTryAgain.classList.add('is-loading');
    if (btnTryAgainText) btnTryAgainText.textContent = 'Retrying...';

    const sysName = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('systemName')) || 'Haulo Boutique ERP';
    const tracePrefix = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('shortName')) || 'HAULO';

    showToast(`Re-establishing connection to ${sysName} servers...`);

    setTimeout(() => {
      // If there's a referrer or stored page, retry navigating to it
      if (document.referrer && !document.referrer.includes('500') && !document.referrer.includes('offline')) {
        window.location.href = document.referrer;
      } else {
        const stored = sessionStorage.getItem('haulo_last_visited_page') || localStorage.getItem('haulo_last_visited_page');
        if (stored && !stored.includes('500') && !stored.includes('offline')) {
          window.location.href = stored;
        } else {
          window.location.reload();
        }
      }
    }, 900);
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
   * Copy Error Diagnostics Telemetry
   */
  function copyDiagnostics() {
    const sysName = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('systemName')) || 'Haulo Boutique ERP';
    const tracePrefix = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('shortName')) || 'ERP';
    const coName = (typeof CompanyBridge !== 'undefined' && CompanyBridge.get() && CompanyBridge.get().companyName) || '';

    const errorLog = [
      '==================================================',
      `${sysName.toUpperCase()} — ERROR DIAGNOSTIC TELEMETRY`,
      '==================================================',
      `Platform Brand:  ${sysName}`,
      `Atelier/Tenant:  ${coName || 'Default Boutique Atelier'}`,
      `Timestamp:       ${new Date().toISOString()}`,
      `Error Code:      HTTP ${errorCode}`,
      `Error Message:   ${errorMessage || 'Internal Server Fault'}`,
      `Trace ID:        ${traceId}`,
      `Status:          Something Went Wrong`,
      `Current URL:     ${window.location.href}`,
      `Referrer:        ${document.referrer || 'Direct Entry / None'}`,
      `Last Visited:    ${sessionStorage.getItem('haulo_last_visited_page') || 'N/A'}`,
      `User Agent:      ${navigator.userAgent}`,
      `Platform:        ${navigator.platform}`,
      `Screen Bounds:   ${window.innerWidth}x${window.innerHeight} (Device Pixel Ratio: ${window.devicePixelRatio || 1})`,
      `Online State:    ${navigator.onLine ? 'Connected' : 'Disconnected'}`,
      `Session ID:      ${tracePrefix}-ERR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      '=================================================='
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(errorLog)
        .then(() => {
          showToast('Diagnostics telemetry copied to clipboard!');
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
      showToast('Diagnostics telemetry copied to clipboard!');
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

  if (btnTryAgain) {
    btnTryAgain.addEventListener('click', (e) => {
      e.preventDefault();
      handleTryAgain();
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
    } else if (e.key === 'r' || e.key === 'R') {
      if (!supportModal || !supportModal.classList.contains('is-active')) {
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          handleTryAgain();
        }
      }
    }
  });

})();
