/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — COMING SOON CONTROLLER
 * Path: front end/system/coming-soon/coming-soon.js
 * =======================================================================
 */

(function () {
  'use strict';

  // 1. Elements
  const btnGoBack = document.getElementById('btnGoBack');
  const btnSupport = document.getElementById('btnSupport');
  const supportModal = document.getElementById('supportModal');
  const closeSupportModal = document.getElementById('closeSupportModal');
  const btnCopyDiag = document.getElementById('btnCopyDiag');
  const toastNotice = document.getElementById('toastNotice');
  const toastNoticeMsg = document.getElementById('toastNoticeMsg');
  const currentYearSpan = document.getElementById('currentYear');
  const eyebrowEl = document.querySelector('.eyebrow-text');
  const subtitleEl = document.querySelector('.coming-soon-subtitle');

  let toastTimeout = null;

  // Initialize copyright year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Parse dynamic query parameters
  const params = new URLSearchParams(window.location.search);
  const featureName = params.get('feature');
  const featureEta = params.get('eta') || 'Q4 2026';

  if (featureName) {
    if (eyebrowEl) {
      eyebrowEl.textContent = `${featureName} • Target Release: ${featureEta}`;
    }
    if (subtitleEl) {
      subtitleEl.innerHTML = `We’re crafting the <strong>${escapeHtml(featureName)}</strong> experience for the atelier.<br />Target release is slated for <strong>${escapeHtml(featureEta)}</strong>. Stay tuned!`;
    }
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
                              refFile.includes('coming-soon') || 
                              refFile.includes('offline');

        if (!isSelfOrError) {
          window.location.href = document.referrer;
          return;
        }
      } catch (_) {
        if (document.referrer !== curUrl && !document.referrer.includes('coming-soon') && !document.referrer.includes('offline')) {
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

    if (storedLastPage && storedLastPage !== curUrl && !storedLastPage.includes('coming-soon') && !storedLastPage.includes('offline')) {
      window.location.href = storedLastPage;
      return;
    }

    // 3. Fallback to browser history back
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    // 4. Default safe fallback: Dashboard
    window.location.href = '../../dashboard/dashboard.html';
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
   * Modal Controls
   */
  function openModal() {
    if (!supportModal) return;
    supportModal.classList.add('is-active');
    if (btnSupport) btnSupport.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!supportModal) return;
    supportModal.classList.remove('is-active');
    if (btnSupport) btnSupport.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /**
   * Copy Feature Telemetry Log
   */
  function copyDiagnostics() {
    const sysName = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('systemName')) || 'Haulo Boutique ERP';
    const tracePrefix = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('shortName')) || 'FEAT';
    const coName = (typeof CompanyBridge !== 'undefined' && CompanyBridge.get() && CompanyBridge.get().companyName) || '';

    const featureLog = [
      '==================================================',
      `${sysName.toUpperCase()} — UPCOMING FEATURE TELEMETRY`,
      '==================================================',
      `Platform Brand:  ${sysName}`,
      `Atelier/Tenant:  ${coName || 'Default Boutique Atelier'}`,
      `Timestamp:       ${new Date().toISOString()}`,
      `Feature State:   COMING_SOON_ACTIVE_DEV`,
      `Feature Name:    ${featureName || 'Bespoke Feature'}`,
      `Target Release:  ${featureEta}`,
      `Requested Route: ${window.location.href}`,
      `Referrer:        ${document.referrer || 'Direct Navigation / None'}`,
      `Last Visited:    ${sessionStorage.getItem('haulo_last_visited_page') || 'N/A'}`,
      `User Agent:      ${navigator.userAgent}`,
      `Platform:        ${navigator.platform}`,
      `Screen Bounds:   ${window.innerWidth}x${window.innerHeight}`,
      `Session Trace:   ${tracePrefix}-FEAT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      '=================================================='
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(featureLog)
        .then(() => {
          showToast('Feature telemetry copied to clipboard!');
        })
        .catch(() => {
          fallbackCopyText(featureLog);
        });
    } else {
      fallbackCopyText(featureLog);
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
      showToast('Feature telemetry copied to clipboard!');
    } catch (_) {
      showToast('Failed to copy. Please manually note details.');
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

  if (btnSupport) {
    btnSupport.addEventListener('click', (e) => {
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
