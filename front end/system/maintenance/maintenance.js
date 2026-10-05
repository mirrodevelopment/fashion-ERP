/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — SYSTEM UNDER MAINTENANCE CONTROLLER
 * Path: front end/system/maintenance/maintenance.js
 * =======================================================================
 */

(function () {
  'use strict';

  // 1. Elements
  const btnGoBack = document.getElementById('btnGoBack');
  const btnRefresh = document.getElementById('btnRefresh');
  const btnRefreshText = document.getElementById('btnRefreshText');
  const gear3d = document.getElementById('gear3d');

  const btnSupport = document.getElementById('btnSupport');
  const linkInlineSupport = document.getElementById('linkInlineSupport');
  const supportModal = document.getElementById('supportModal');
  const closeSupportModal = document.getElementById('closeSupportModal');
  const btnCopyDiag = document.getElementById('btnCopyDiag');
  const estCompletionTime = document.getElementById('estCompletionTime');

  const toastNotice = document.getElementById('toastNotice');
  const toastNoticeMsg = document.getElementById('toastNoticeMsg');

  let isChecking = false;

  // 2. Format Time Helper
  function formatBoutiqueTime(date) {
    const d = date || new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  }

  // 3. Initialize dynamic maintenance estimate
  let activeEtaMinutes = 35;
  function initEstimate() {
    const params = new URLSearchParams(window.location.search);
    const parsedEta = parseInt(params.get('eta'), 10);
    if (!isNaN(parsedEta) && parsedEta > 0) {
      activeEtaMinutes = parsedEta;
    }

    const estMinutesText = document.getElementById('estMinutesText');
    if (estMinutesText) {
      estMinutesText.textContent = `${activeEtaMinutes} MINS`;
    }

    if (estCompletionTime) {
      const completionDate = new Date(Date.now() + activeEtaMinutes * 60 * 1000);
      let hours = completionDate.getHours();
      const minutes = String(completionDate.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? String(hours).padStart(2, '0') : '12';
      estCompletionTime.textContent = `approx. ${hours}:${minutes} ${ampm} (in ~${activeEtaMinutes} mins)`;
    }
  }

  // 4. Toast Notification
  let toastTimeout = null;
  function showToast(message, duration = 3200) {
    if (toastNoticeMsg) toastNoticeMsg.textContent = message;
    if (toastNotice) {
      toastNotice.classList.add('show');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toastNotice.classList.remove('show');
      }, duration);
    }
  }

  // 5. Test Backend Availability
  async function testSystemStatus() {
    if (isChecking) return;
    isChecking = true;

    if (btnRefresh) btnRefresh.classList.add('is-loading');
    if (btnRefreshText) btnRefreshText.textContent = 'Checking Status...';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch('/api/v1/company', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // If server responds with 200 or auth required (401/403), the backend is online and running!
      if (response.ok || response.status === 401 || response.status === 403) {
        showToast('System is back online! Redirecting...');
        if (btnRefreshText) btnRefreshText.textContent = 'System Online!';

        setTimeout(() => {
          if (document.referrer && !document.referrer.includes('maintenance')) {
            window.location.href = document.referrer;
          } else {
            window.location.href = '../../dashboard/dashboard.html';
          }
        }, 1200);
        return;
      }
    } catch (err) {
      // Backend still down or unreachable
    }

    // Still in maintenance
    setTimeout(() => {
      isChecking = false;
      if (btnRefresh) btnRefresh.classList.remove('is-loading');
      if (btnRefreshText) btnRefreshText.textContent = 'Refresh Page';
      showToast('Maintenance still in progress. Thank you for your patience.');
    }, 1000);
  }

  // 6. Reliable Go Back Handler (Always goes to last visited page)
  function navigateToLastVisitedPage() {
    const curUrl = window.location.href;
    const curFile = window.location.pathname.split('/').pop().toLowerCase();

    // 1. Check document.referrer
    if (document.referrer) {
      try {
        const refUrl = new URL(document.referrer, window.location.origin);
        const refFile = refUrl.pathname.split('/').pop().toLowerCase();
        if (refUrl.href !== curUrl && refFile !== curFile && !refFile.includes('maintenance')) {
          window.location.href = document.referrer;
          return;
        }
      } catch (_) {
        if (document.referrer !== curUrl && !document.referrer.includes('maintenance')) {
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

    if (storedLastPage && storedLastPage !== curUrl && !storedLastPage.includes('maintenance')) {
      window.location.href = storedLastPage;
      return;
    }

    // 3. Check browser history length
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    // 4. Default safe fallback: Dashboard
    window.location.href = '../../dashboard/dashboard.html';
  }

  if (btnGoBack) {
    btnGoBack.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToLastVisitedPage();
    });
  }

  // 7. Refresh Button Listener
  if (btnRefresh) {
    btnRefresh.addEventListener('click', (e) => {
      e.preventDefault();
      testSystemStatus();
    });
  }

  // 7. Interactive Gear Animation on Click
  if (gear3d) {
    let currentRotation = 0;
    gear3d.addEventListener('click', () => {
      currentRotation += 180;
      gear3d.style.transform = `translateX(-50%) rotate(${currentRotation}deg)`;
    });
  }

  // 8. Support Modal Controls
  function openSupportModal() {
    if (supportModal) {
      supportModal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }
  }

  function hideSupportModal() {
    if (supportModal) {
      supportModal.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  }

  if (btnSupport) {
    btnSupport.addEventListener('click', (e) => {
      e.preventDefault();
      openSupportModal();
    });
  }

  if (linkInlineSupport) {
    linkInlineSupport.addEventListener('click', (e) => {
      e.preventDefault();
      openSupportModal();
    });
  }

  if (closeSupportModal) {
    closeSupportModal.addEventListener('click', hideSupportModal);
  }

  if (supportModal) {
    supportModal.addEventListener('click', (e) => {
      if (e.target === supportModal) hideSupportModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && supportModal && supportModal.classList.contains('is-active')) {
      hideSupportModal();
    }
  });

  // 9. Copy Diagnostic System Telemetry
  if (btnCopyDiag) {
    btnCopyDiag.addEventListener('click', async () => {
      const sysName = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('systemName')) || 'Haulo Boutique ERP';
      const diagData = [
        `=== ${sysName.toUpperCase()} MAINTENANCE TELEMETRY ===`,
        `Timestamp: ${new Date().toISOString()}`,
        `Formatted: ${formatBoutiqueTime(new Date())}`,
        `Status: Scheduled Maintenance`,
        `Estimated Outage: ${activeEtaMinutes} minutes`,
        `Navigator Online: ${navigator.onLine}`,
        `User Agent: ${navigator.userAgent}`,
        `Screen Resolution: ${window.screen.width}x${window.screen.height}`,
        `Current URL: ${window.location.href}`,
        `Referrer: ${document.referrer || 'Direct'}`,
        '================================================='
      ].join('\n');

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(diagData);
        } else {
          const ta = document.createElement('textarea');
          ta.value = diagData;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        showToast('Diagnostic details copied to clipboard!');
      } catch (err) {
        showToast('Failed to copy. Please allow clipboard permissions.');
      }
    });
  }

  // 10. Auto-check availability every 60 seconds
  setInterval(() => {
    if (!isChecking) {
      testSystemStatus();
    }
  }, 60000);

  // Initialize
  initEstimate();

})();
