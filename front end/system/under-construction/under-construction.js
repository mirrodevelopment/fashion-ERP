/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — UNDER CONSTRUCTION CONTROLLER
 * Path: front end/system/under-construction/under-construction.js
 * =======================================================================
 */

(function () {
  'use strict';

  // 1. Elements
  const btnGoBack = document.getElementById('btnGoBack');
  const hardHat = document.getElementById('hardHat');
  const btnSupport = document.getElementById('btnSupport');
  const supportModal = document.getElementById('supportModal');
  const closeSupportModal = document.getElementById('closeSupportModal');
  const btnCopyDiag = document.getElementById('btnCopyDiag');

  const toastNotice = document.getElementById('toastNotice');
  const toastNoticeMsg = document.getElementById('toastNoticeMsg');

  // Parse dynamic query parameters
  const params = new URLSearchParams(window.location.search);
  const targetModule = params.get('module');
  const targetSprint = params.get('sprint');

  const sprintBadgeText = document.getElementById('sprintBadgeText');
  const constructionSubtitle = document.querySelector('.construction-subtitle');

  if (targetSprint && sprintBadgeText) {
    sprintBadgeText.textContent = `${targetSprint.toUpperCase()} • IN PROGRESS`;
  }
  if (targetModule && constructionSubtitle) {
    constructionSubtitle.innerHTML = `We’re actively crafting the <strong>${escapeHtml(targetModule)}</strong> module (${escapeHtml(targetSprint || 'Active Sprint')}).<br />Please check back soon or explore other atelier workspaces.`;
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

  // 3. Toast Notification Helper
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

  // 4. Reliable Go Back Handler (Always goes to last visited page)
  function navigateToLastVisitedPage() {
    const curUrl = window.location.href;
    const curFile = window.location.pathname.split('/').pop().toLowerCase();

    // 1. Check document.referrer
    if (document.referrer) {
      try {
        const refUrl = new URL(document.referrer, window.location.origin);
        const refFile = refUrl.pathname.split('/').pop().toLowerCase();
        if (refUrl.href !== curUrl && refFile !== curFile && !refFile.includes('under-construction')) {
          window.location.href = document.referrer;
          return;
        }
      } catch (_) {
        if (document.referrer !== curUrl && !document.referrer.includes('under-construction')) {
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

    if (storedLastPage && storedLastPage !== curUrl && !storedLastPage.includes('under-construction')) {
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

  // 5. Hard Hat Interactive Jiggle
  if (hardHat) {
    hardHat.addEventListener('click', () => {
      hardHat.style.transform = 'rotate(-10deg) scale(1.15) translateY(-8px)';
      showToast('Safety First! Construction underway.');
      setTimeout(() => {
        hardHat.style.transform = '';
      }, 500);
    });
  }

  // 6. Interactive Floating Tiles
  const floatingTiles = document.querySelectorAll('.floating-tile');
  floatingTiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      const title = tile.getAttribute('title') || 'Construction Component';
      showToast(`${title} — Active craftsmanship!`);
      tile.style.transform = 'scale(1.2) translateY(-6px)';
      setTimeout(() => {
        tile.style.transform = '';
      }, 400);
    });
  });

  // 7. Support Modal Controls
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

  // 8. Copy Diagnostic Telemetry
  if (btnCopyDiag) {
    btnCopyDiag.addEventListener('click', async () => {
      const sysName = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('systemName')) || 'Haulo Boutique ERP';
      const diagData = [
        `=== ${sysName.toUpperCase()} MODULE CONSTRUCTION LOG ===`,
        `Timestamp: ${new Date().toISOString()}`,
        `Formatted: ${formatBoutiqueTime(new Date())}`,
        `Status: Under Active Construction`,
        `Module: ${targetModule || 'Production Module'}`,
        `Sprint: ${targetSprint || 'Active Sprint'}`,
        `Current URL: ${window.location.href}`,
        `Referrer: ${document.referrer || 'Direct'}`,
        `User Agent: ${navigator.userAgent}`,
        '=================================================='
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
        showToast('Module diagnostics copied to clipboard!');
      } catch (err) {
        showToast('Failed to copy. Please allow clipboard permissions.');
      }
    });
  }

})();
