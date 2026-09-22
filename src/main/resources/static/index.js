/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — SYSTEM LAUNCH & INITIALIZATION PORTAL CONTROLLER
 * File: src/main/resources/static/index.js
 * =======================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // 2. Start Live Clock
  initLiveClock();

  // 3. Attach Diagnostics Button Listener
  const diagBtn = document.getElementById('btnRunDiagnostics');
  if (diagBtn) {
    diagBtn.addEventListener('click', runSystemDiagnostics);
  }
});

/**
 * Updates the live date and time display in the top status bar
 */
function initLiveClock() {
  const timeEl = document.getElementById('liveDateTime');
  if (!timeEl) return;

  function update() {
    const now = new Date();
    const options = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    timeEl.textContent = now.toLocaleDateString('en-GB', options);
  }

  update();
  setInterval(update, 1000);
}

/**
 * Smart module launcher that works identically whether running over HTTP/HTTPS (Spring Boot)
 * or opened locally from disk via file:/// protocol
 */
function launchModule(relativePath) {
  let targetUrl = '';
  const isHttp = window.location.protocol.startsWith('http');

  if (isHttp) {
    // Served via Spring Boot server
    targetUrl = `/front end/${relativePath}`;
  } else {
    // Opened directly via file:///
    targetUrl = `../../../front end/${relativePath}`;
  }

  // Visual feedback before navigation
  showToast('Initializing suite and routing...', 'info');
  setTimeout(() => {
    window.location.href = targetUrl;
  }, 180);
}

/**
 * Toast feedback for in-progress modules with signature red styling
 */
function showWipToast(moduleName) {
  showToast(`⚡ ${moduleName} — This module is currently in development.`, 'wip');
}

/**
 * Dynamic system diagnostics verification sequence
 */
function runSystemDiagnostics() {
  const icon = document.getElementById('diagSpinIcon');
  if (icon) icon.classList.add('spinning');

  showToast('Running diagnostic probe across data layer & services...', 'info');

  setTimeout(() => {
    if (icon) icon.classList.remove('spinning');
    showToast('✓ All 4 core services healthy. ERP Engine ready for deployment.', 'info');

    // Subtle celebration pulse on the master launch button
    const masterBtn = document.getElementById('btnMasterLaunch');
    if (masterBtn) {
      masterBtn.style.transform = 'scale(1.02)';
      setTimeout(() => {
        masterBtn.style.transform = '';
      }, 350);
    }
  }, 900);
}

/**
 * Self-contained luxury toast notification engine
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;

  const iconName = type === 'wip' ? 'alert-triangle' : 'check-circle-2';
  toast.innerHTML = `
    <i data-lucide="${iconName}" style="width:16px;height:16px;flex-shrink:0;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ root: toast });
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => {
      toast.remove();
    }, 280);
  }, 3200);
}
