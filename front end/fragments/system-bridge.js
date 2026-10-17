/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — SHARED SYSTEM BRIDGE & LIFECYCLE LISTENERS
 * Path: front end/fragments/system-bridge.js
 * Injected with fragments to govern offline, session inactivity, and error routing.
 * =======================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HauloSystem = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function getSystemPrefix() {
    if (typeof window === 'undefined' || !window.location) {
      return '/front end/system/';
    }
    const pathname = window.location.pathname.replace(/\\/g, '/');
    const marker = '/front end/';
    const idx = pathname.toLowerCase().indexOf(marker);

    if (idx !== -1) {
      const sub = pathname.substring(idx + marker.length);
      const segments = sub.split('/').filter(Boolean);
      const depth = Math.max(0, segments.length - 1);
      if (depth === 0) return 'system/';
      return '../'.repeat(depth) + 'system/';
    }

    if (pathname.includes('/system/')) {
      const parts = pathname.split('/system/');
      const after = parts[1] || '';
      const depth = after.split('/').filter(Boolean).length;
      return '../'.repeat(Math.max(1, depth));
    }

    return '/front end/system/';
  }

  function saveCurrentPage() {
    if (typeof window === 'undefined' || !window.location) return;
    try {
      const cur = window.location.href;
      const isSys = cur.includes('/system/') || cur.includes('/error/');
      if (!isSys) {
        sessionStorage.setItem('haulo_last_visited_page', cur);
        localStorage.setItem('haulo_last_visited_page', cur);
      }
    } catch (_) {}
  }

  const HauloSystem = {
    resolvePath(relativePath) {
      const prefix = getSystemPrefix();
      const cleanSub = String(relativePath || '').replace(/^\/+/, '');
      return prefix + cleanSub;
    },

    toSessionExpired(options = {}) {
      saveCurrentPage();
      const reason = encodeURIComponent(options.reason || 'inactivity');
      const minutesParam = options.minutes ? `&minutes=${encodeURIComponent(options.minutes)}` : '';
      const returnUrl = options.returnUrl || window.location.href;
      try {
        sessionStorage.setItem('haulo_redirect_after_login', returnUrl);
        localStorage.setItem('haulo_redirect_after_login', returnUrl);
      } catch (_) {}
      window.location.href = this.resolvePath(`session-expired/session-expired.html?reason=${reason}${minutesParam}&returnUrl=${encodeURIComponent(returnUrl)}`);
    },

    toForbidden(options = {}) {
      saveCurrentPage();
      const feature = encodeURIComponent(options.feature || 'Restricted Action');
      const role = encodeURIComponent(options.requiredRole || 'Administrator / Manager');
      window.location.href = this.resolvePath(`error/403-error/403.html?feature=${feature}&role=${role}`);
    },

    toNotFound(options = {}) {
      saveCurrentPage();
      const path = encodeURIComponent(options.targetUrl || window.location.pathname);
      window.location.href = this.resolvePath(`error/404-error/404.html?path=${path}`);
    },

    toServerError(options = {}) {
      saveCurrentPage();
      const code = encodeURIComponent(options.status || 500);
      const msg = encodeURIComponent(options.message || 'Internal Server Fault');
      const trace = encodeURIComponent(options.traceId || ('HAULO-500-' + Math.random().toString(36).substring(2, 8).toUpperCase()));
      window.location.href = this.resolvePath(`error/500-error/500.html?code=${code}&msg=${msg}&trace=${trace}`);
    },

    toNetworkError(options = {}) {
      saveCurrentPage();
      const endpoint = encodeURIComponent(options.endpoint || 'API Gateway');
      const method = encodeURIComponent(options.method || 'GET');
      window.location.href = this.resolvePath(`error/network-error/network-error.html?endpoint=${endpoint}&method=${method}`);
    },

    toOffline(options = {}) {
      saveCurrentPage();
      const origin = encodeURIComponent(options.origin || window.location.href);
      window.location.href = this.resolvePath(`error/offline/offline.html?origin=${origin}`);
    },

    toMaintenance(options = {}) {
      saveCurrentPage();
      const eta = encodeURIComponent(options.estMinutes || 35);
      window.location.href = this.resolvePath(`maintenance/maintenance.html?eta=${eta}`);
    },

    toComingSoon(options = {}) {
      saveCurrentPage();
      const feature = encodeURIComponent(options.feature || 'Haulo Bespoke Feature');
      const eta = encodeURIComponent(options.eta || 'Q4 2026');
      window.location.href = this.resolvePath(`coming-soon/coming-soon.html?feature=${feature}&eta=${eta}`);
    },

    toUnderConstruction(options = {}) {
      saveCurrentPage();
      const moduleName = encodeURIComponent(options.module || 'Production Module');
      const sprint = encodeURIComponent(options.sprint || 'Active Sprint');
      window.location.href = this.resolvePath(`under-construction/under-construction.html?module=${moduleName}&sprint=${sprint}`);
    }
  };

  // -------------------------------------------------------------
  // Automatic Life-Cycle Listeners
  // -------------------------------------------------------------
  if (typeof window !== 'undefined') {
    const isSysPage = window.location.pathname.includes('/system/') || window.location.pathname.includes('/error/');

    // 1. Automatic Offline Detection
    window.addEventListener('offline', () => {
      if (!isSysPage) {
        HauloSystem.toOffline();
      }
    });

    // 2. Click Delegation for WIP / Roadmap Status Elements
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-status="coming-soon"], [data-status="under-construction"]');
      if (!target) return;
      e.preventDefault();

      const status = target.getAttribute('data-status');
      const name = target.getAttribute('data-feature-name') || target.textContent.trim() || 'Feature';

      if (status === 'coming-soon') {
        const eta = target.getAttribute('data-eta') || 'Q4 2026';
        HauloSystem.toComingSoon({ feature: name, eta });
      } else if (status === 'under-construction') {
        const sprint = target.getAttribute('data-sprint') || 'Sprint 4';
        HauloSystem.toUnderConstruction({ module: name, sprint });
      }
    });

    // 3. Dual-Tier User Inactivity & Session Lifecycle Watcher
    // - Tier 1 (Session age < 3h): 20 minutes idle timeout (warning at 18 min)
    // - Tier 2 (Session age >= 3h): 5 minutes idle timeout (warning at 4 min)
    // - Multi-tab synchronization via localStorage & storage event
    // - Elegant, non-blocking atelier countdown warning modal
    if (!isSysPage && !window.location.pathname.includes('login.html')) {
      const HEARTBEAT_THROTTLE  = 10 * 1000;            // Write to storage at most once every 10s

      // Dynamic Inactivity Limit from Settings (PostgreSQL & localStorage)
      const getCustomIdleMinutes = () => {
        try {
          const raw = localStorage.getItem('haulo_session_timeout_minutes')
            || sessionStorage.getItem('haulo_session_timeout_minutes');
          if (raw !== null && raw !== undefined && raw !== '') {
            const parsed = parseInt(raw, 10);
            if (!isNaN(parsed)) return parsed;
          }
          if (window.CompanyBridge && typeof window.CompanyBridge.get === 'function') {
            const co = window.CompanyBridge.get();
            if (co && co.sessionTimeoutMinutes !== undefined && co.sessionTimeoutMinutes !== null) {
              const coMins = parseInt(co.sessionTimeoutMinutes, 10);
              if (!isNaN(coMins)) return coMins;
            }
          }
        } catch (_) {}
        return 20; // Default 20 minutes
      };

      let localLastActivity = Date.now();
      let lastStorageWrite = 0;
      let warningModalEl = null;
      let warningCountdownEl = null;
      let warningNoticeEl = null;
      let warningVisible = false;

      // Ensure session start exists
      const ensureSessionStart = () => {
        let start = localStorage.getItem('haulo_session_start') || sessionStorage.getItem('haulo_session_start');
        if (!start) {
          start = String(Date.now());
          try {
            localStorage.setItem('haulo_session_start', start);
            sessionStorage.setItem('haulo_session_start', start);
          } catch (_) {}
        }
        return parseInt(start, 10) || Date.now();
      };

      // Heartbeat recorder
      const recordActivity = (forceStorage = false) => {
        const now = Date.now();
        localLastActivity = now;

        if (warningVisible) {
          dismissWarningModal();
        }

        if (forceStorage || (now - lastStorageWrite) > HEARTBEAT_THROTTLE) {
          lastStorageWrite = now;
          try {
            localStorage.setItem('haulo_last_activity', String(now));
            sessionStorage.setItem('haulo_last_activity', String(now));
          } catch (_) {}
        }
      };

      // Listen for local user interactions
      ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach((evt) => {
        window.addEventListener(evt, () => recordActivity(false), { passive: true });
      });

      // Synchronize across browser tabs
      window.addEventListener('storage', (e) => {
        if (e.key === 'haulo_last_activity' && e.newValue) {
          const remoteTime = parseInt(e.newValue, 10);
          if (remoteTime > localLastActivity) {
            localLastActivity = remoteTime;
            if (warningVisible) {
              dismissWarningModal();
            }
          }
        }
      });

      // Warning Modal Injection
      function ensureWarningModal() {
        if (warningModalEl) return;

        const modalDiv = document.createElement('div');
        modalDiv.id = 'hauloSessionWarningModal';
        modalDiv.className = 'haulo-session-warn-backdrop';
        modalDiv.setAttribute('role', 'alertdialog');
        modalDiv.setAttribute('aria-modal', 'true');
        modalDiv.innerHTML = `
          <div class="haulo-session-warn-card">
            <div class="haulo-session-warn-icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#dfb76c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 class="haulo-session-warn-title">Session Expiring Soon</h3>
            <p class="haulo-session-warn-msg" id="hauloSessionWarnNotice">
              You have been idle for a while. For boutique data security, your session will expire in
              <span class="haulo-session-warn-countdown" id="hauloSessionWarnCountdown">60s</span>.
            </p>
            <div class="haulo-session-warn-actions">
              <button type="button" class="haulo-session-btn-stay" id="hauloSessionBtnStay">Stay Signed In</button>
              <button type="button" class="haulo-session-btn-logout" id="hauloSessionBtnLogout">Lock Workstation</button>
            </div>
          </div>
        `;

        // Inject styles
        const style = document.createElement('style');
        style.textContent = `
          .haulo-session-warn-backdrop {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(10, 10, 14, 0.78);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 999999;
            display: none;
            align-items: center;
            justify-content: center;
            animation: hauloFadeIn 0.25s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .haulo-session-warn-backdrop.is-active {
            display: flex;
          }
          .haulo-session-warn-card {
            background: #14171f;
            border: 1px solid rgba(223, 183, 108, 0.35);
            border-radius: 16px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 0 40px rgba(223, 183, 108, 0.15);
            width: 90%;
            max-width: 440px;
            padding: 32px 28px;
            text-align: center;
            color: #f3f4f6;
            animation: hauloSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .haulo-session-warn-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 16px;
            border-radius: 50%;
            background: rgba(223, 183, 108, 0.12);
            border: 1px solid rgba(223, 183, 108, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .haulo-session-warn-title {
            font-size: 20px;
            font-weight: 600;
            color: #ffffff;
            margin: 0 0 10px;
            letter-spacing: 0.01em;
          }
          .haulo-session-warn-msg {
            font-size: 14px;
            line-height: 1.55;
            color: #9ca3af;
            margin: 0 0 24px;
          }
          .haulo-session-warn-countdown {
            display: inline-block;
            color: #fae2b3;
            font-weight: 700;
            font-size: 15px;
            background: rgba(223, 183, 108, 0.15);
            padding: 2px 8px;
            border-radius: 6px;
            border: 1px solid rgba(223, 183, 108, 0.25);
          }
          .haulo-session-warn-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
          }
          .haulo-session-btn-stay {
            background: linear-gradient(135deg, #dfb76c 0%, #be934c 100%);
            color: #11141a;
            border: none;
            border-radius: 999px;
            padding: 11px 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 14px rgba(190, 147, 76, 0.35);
          }
          .haulo-session-btn-stay:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(190, 147, 76, 0.5);
          }
          .haulo-session-btn-logout {
            background: transparent;
            color: #9ca3af;
            border: 1px solid rgba(156, 163, 175, 0.25);
            border-radius: 999px;
            padding: 11px 20px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .haulo-session-btn-logout:hover {
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.4);
            background: rgba(255, 255, 255, 0.05);
          }
          @keyframes hauloFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes hauloSlideUp {
            from { opacity: 0; transform: translateY(14px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modalDiv);

        warningModalEl = modalDiv;
        warningCountdownEl = modalDiv.querySelector('#hauloSessionWarnCountdown');
        warningNoticeEl = modalDiv.querySelector('#hauloSessionWarnNotice');

        modalDiv.querySelector('#hauloSessionBtnStay').addEventListener('click', () => {
          recordActivity(true);
        });

        modalDiv.querySelector('#hauloSessionBtnLogout').addEventListener('click', () => {
          const configuredMins = getCustomIdleMinutes();
          terminateSession(configuredMins > 0 ? `inactivity_${configuredMins}m` : 'manual_lock', configuredMins);
        });
      }

      let _countdownInterval = null;

      function showWarningModal(secondsRemaining, minutes) {
        ensureWarningModal();
        if (!warningModalEl) return;

        warningVisible = true;
        warningModalEl.classList.add('is-active');

        let sec = secondsRemaining;
        if (warningCountdownEl) {
          warningCountdownEl.textContent = `${sec}s`;
        }

        if (warningNoticeEl) {
          const displayMins = (minutes && minutes > 0) ? `${minutes} minutes` : 'a period';
          warningNoticeEl.innerHTML = `You have been idle for a while (policy: <strong>${displayMins}</strong>).<br />For boutique data security, your session will lock and expire in <span class="haulo-session-warn-countdown" id="hauloSessionWarnCountdown">${sec}s</span>.`;
        }

        clearInterval(_countdownInterval);
        _countdownInterval = setInterval(() => {
          if (!warningVisible) {
            clearInterval(_countdownInterval);
            return;
          }
          sec--;
          const cntEl = warningModalEl.querySelector('#hauloSessionWarnCountdown');
          if (cntEl) cntEl.textContent = `${Math.max(0, sec)}s`;
          if (sec <= 0) {
            clearInterval(_countdownInterval);
            terminateSession(`inactivity_${minutes}m`, minutes);
          }
        }, 1000);
      }

      function dismissWarningModal() {
        clearInterval(_countdownInterval);
        if (warningModalEl && warningVisible) {
          warningVisible = false;
          warningModalEl.classList.remove('is-active');
        }
      }

      function terminateSession(reason, minutes = 20) {
        dismissWarningModal();
        sessionStorage.removeItem('erp_token');
        sessionStorage.removeItem('erp_user');
        sessionStorage.removeItem('erp_allowed_modules');
        sessionStorage.removeItem('haulo_session_start');
        sessionStorage.removeItem('haulo_last_activity');
        sessionStorage.removeItem('haulo_token');
        sessionStorage.removeItem('fashion_erp_token');
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
        localStorage.removeItem('erp_allowed_modules');
        localStorage.removeItem('haulo_session_start');
        localStorage.removeItem('haulo_last_activity');
        localStorage.removeItem('haulo_token');
        localStorage.removeItem('fashion_erp_token');

        HauloSystem.toSessionExpired({ reason, minutes });
      }

      // Expose test and manual lock methods
      HauloSystem.testSessionLock = function(seconds = 30) {
        const configuredMins = getCustomIdleMinutes();
        showWarningModal(seconds, configuredMins);
      };

      HauloSystem.lockSessionNow = function() {
        const configuredMins = getCustomIdleMinutes();
        terminateSession('manual_lock', configuredMins);
      };

      // Check loop every 2 seconds for smooth precision
      setInterval(() => {
        const token = sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token')
          || sessionStorage.getItem('haulo_token') || localStorage.getItem('haulo_token')
          || sessionStorage.getItem('fashion_erp_token') || localStorage.getItem('fashion_erp_token')
          || sessionStorage.getItem('erp_user') || localStorage.getItem('erp_user');
        if (!token) return;

        const configuredMins = getCustomIdleMinutes();
        if (configuredMins <= 0) {
          // Inactivity auto-logout disabled
          dismissWarningModal();
          return;
        }

        const now = Date.now();
        const storedActivity = parseInt(localStorage.getItem('haulo_last_activity') || sessionStorage.getItem('haulo_last_activity') || localLastActivity, 10);
        const lastEffectiveActivity = Math.max(localLastActivity, storedActivity);

        const idleTime = now - lastEffectiveActivity;
        const idleLimit = configuredMins * 60 * 1000;
        
        // Dynamic grace period for warning countdown:
        // <= 2 min: warn 30s before; <= 5 min: warn 60s before; > 5 min: warn 120s before
        const warnGraceMs = idleLimit <= 2 * 60 * 1000 ? 30 * 1000 : (idleLimit <= 5 * 60 * 1000 ? 60 * 1000 : 120 * 1000);
        const warnThreshold = Math.max(5 * 1000, idleLimit - warnGraceMs);

        if (idleTime >= idleLimit) {
          terminateSession(`inactivity_${configuredMins}m`, configuredMins);
        } else if (idleTime >= warnThreshold) {
          if (!warningVisible) {
            const remainingSec = Math.max(1, Math.ceil((idleLimit - idleTime) / 1000));
            showWarningModal(remainingSec, configuredMins);
          }
        } else {
          dismissWarningModal();
        }
      }, 2000);
    }
  }

  return HauloSystem;
});
