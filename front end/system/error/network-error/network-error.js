/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — NETWORK ERROR CONTROLLER
 * Path: front end/system/error/network-error/network-error.js
 * =======================================================================
 */

(function () {
  'use strict';

  // 1. Elements
  const btnTryAgain = document.getElementById('btnTryAgain');
  const btnTryAgainText = document.getElementById('btnTryAgainText');
  const btnGoBack = document.getElementById('btnGoBack');
  const btnOpenSupport = document.getElementById('btnOpenSupport');
  const supportModal = document.getElementById('supportModal');
  const closeSupportModal = document.getElementById('closeSupportModal');
  const btnCopyDiag = document.getElementById('btnCopyDiag');
  const toastNotice = document.getElementById('toastNotice');
  const toastNoticeMsg = document.getElementById('toastNoticeMsg');
  const currentYearSpan = document.getElementById('currentYear');

  let toastTimeout = null;

  // Initialize copyright year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Parse dynamic query parameters
  const params = new URLSearchParams(window.location.search);
  const failingEndpoint = params.get('endpoint');
  const httpMethod = params.get('method') || 'GET';

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
                              refFile.includes('network-error') || 
                              refFile.includes('offline') || 
                              refFile.includes('500');

        if (!isSelfOrError) {
          window.location.href = document.referrer;
          return;
        }
      } catch (_) {
        if (document.referrer !== curUrl && !document.referrer.includes('network-error') && !document.referrer.includes('offline')) {
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

    if (storedLastPage && storedLastPage !== curUrl && !storedLastPage.includes('network-error') && !storedLastPage.includes('offline')) {
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
  function showToast(message, duration = 3200) {
    if (!toastNotice) return;
    if (toastNoticeMsg) toastNoticeMsg.textContent = message;

    clearTimeout(toastTimeout);
    toastNotice.classList.add('show');

    toastTimeout = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, duration);
  }

  /**
   * Try Again / Network Test Controller with Active Endpoint Probe
   */
  async function handleTryAgain() {
    if (!btnTryAgain) return;
    if (btnTryAgain.classList.contains('is-loading')) return;

    btnTryAgain.classList.add('is-loading');
    if (btnTryAgainText) btnTryAgainText.textContent = 'Probing Server...';

    const _sysLabel = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('systemName')) || 'ERP';
    showToast(`Probing connection to ${_sysLabel} servers...`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Probe backend endpoint or health check
      const probeUrl = '/api/v1/company';
      const response = await fetch(probeUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // If server responds (even 401/403/404), network & server are responsive!
      showToast('Connection verified! Returning to atelier...');
      setTimeout(() => {
        navigateToLastVisitedPage();
      }, 700);
    } catch (err) {
      btnTryAgain.classList.remove('is-loading');
      if (btnTryAgainText) btnTryAgainText.textContent = 'Try Again';
      if (!navigator.onLine) {
        showToast('Your device is currently offline. Please check Wi-Fi/data.');
      } else {
        showToast('Server still unreachable. Retrying in background...');
      }
    }
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
   * Copy Network Diagnostics Telemetry
   */
  function copyDiagnostics() {
    const sysName = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('systemName')) || 'Haulo Boutique ERP';
    const tracePrefix = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('shortName')) || 'ERP';
    const coName = (typeof CompanyBridge !== 'undefined' && CompanyBridge.get() && CompanyBridge.get().companyName) || '';

    const errorLog = [
      '==================================================',
      `${sysName.toUpperCase()} — NETWORK DIAGNOSTIC TELEMETRY`,
      '==================================================',
      `Platform Brand:   ${sysName}`,
      `Atelier / Tenant: ${coName || 'Default Boutique Atelier'}`,
      `Timestamp:        ${new Date().toISOString()}`,
      `Error Type:       NETWORK_CONNECTION_TIMEOUT`,
      `Failing Endpoint: ${failingEndpoint || 'API Gateway'} (${httpMethod})`,
      `Status:           Unable to resolve server host`,
      `Current URL:      ${window.location.href}`,
      `Referrer:         ${document.referrer || 'Direct Navigation / None'}`,
      `Last Visited:     ${sessionStorage.getItem('haulo_last_visited_page') || 'N/A'}`,
      `Navigator State:  ${navigator.onLine ? 'Browser reports Online' : 'Browser reports Offline'}`,
      `User Agent:       ${navigator.userAgent}`,
      `Platform:         ${navigator.platform}`,
      `Screen Bounds:    ${window.innerWidth}x${window.innerHeight}`,
      `Session ID:       ${tracePrefix}-NET-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      '=================================================='
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(errorLog)
        .then(() => {
          showToast('Network telemetry log copied to clipboard!');
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
      showToast('Network telemetry log copied to clipboard!');
    } catch (_) {
      showToast('Failed to copy. Please manually note error details.');
    }
    document.body.removeChild(ta);
  }

  // 2. Attach Event Listeners
  if (btnTryAgain) {
    btnTryAgain.addEventListener('click', (e) => {
      e.preventDefault();
      handleTryAgain();
    });
  }

  if (btnGoBack) {
    btnGoBack.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToLastVisitedPage();
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

  // Auto-detect when internet connectivity is restored
  window.addEventListener('online', () => {
    showToast('Internet connection restored! Resuming session...', 2500);
    setTimeout(() => {
      navigateToLastVisitedPage();
    }, 1500);
  });

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
