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
      const reason = encodeURIComponent(options.reason || 'inactivity_20m');
      const returnUrl = options.returnUrl || window.location.href;
      try {
        sessionStorage.setItem('haulo_redirect_after_login', returnUrl);
        localStorage.setItem('haulo_redirect_after_login', returnUrl);
      } catch (_) {}
      window.location.href = this.resolvePath(`session-expired/session-expired.html?reason=${reason}&returnUrl=${encodeURIComponent(returnUrl)}`);
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
      const STANDARD_IDLE_LIMIT = 20 * 60 * 1000;       // 20 minutes
      const STANDARD_WARN_TIME  = 18 * 60 * 1000;       // 18 minutes (2 min grace)
      const EXTENDED_SESSION_THRESHOLD = 3 * 60 * 60 * 1000; // 3 hours continuous session
      const STRICT_IDLE_LIMIT   = 5 * 60 * 1000;        // 5 minutes
      const STRICT_WARN_TIME    = 4 * 60 * 1000;        // 4 minutes (1 min grace)
      const HEARTBEAT_THROTTLE  = 10 * 1000;            // Write to storage at most once every 10s

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
          const sessionStart = ensureSessionStart();
          const isExtended = (Date.now() - sessionStart) >= EXTENDED_SESSION_THRESHOLD;
          terminateSession(isExtended ? 'extended_session_5m' : 'inactivity_20m');
        });
      }

      function showWarningModal(secondsRemaining, isExtendedSession) {
        ensureWarningModal();
        if (!warningModalEl) return;

        warningVisible = true;
        warningModalEl.classList.add('is-active');

        if (warningCountdownEl) {
          warningCountdownEl.textContent = `${secondsRemaining}s`;
        }

        if (warningNoticeEl) {
          if (isExtendedSession) {
            warningNoticeEl.innerHTML = `Workstation security policy: Following <strong>3 hours</strong> of active shift, the idle threshold is <strong>5 minutes</strong>.<br />Your session will lock in <span class="haulo-session-warn-countdown">${secondsRemaining}s</span>.`;
          } else {
            warningNoticeEl.innerHTML = `You have been inactive for <strong>18 minutes</strong>. For atelier security, your session will expire in <span class="haulo-session-warn-countdown">${secondsRemaining}s</span>.`;
          }
        }
      }

      function dismissWarningModal() {
        if (warningModalEl && warningVisible) {
          warningVisible = false;
          warningModalEl.classList.remove('is-active');
        }
      }

      function terminateSession(reason) {
        dismissWarningModal();
        sessionStorage.removeItem('erp_token');
        sessionStorage.removeItem('erp_user');
        sessionStorage.removeItem('erp_allowed_modules');
        sessionStorage.removeItem('haulo_session_start');
        sessionStorage.removeItem('haulo_last_activity');
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
        localStorage.removeItem('erp_allowed_modules');
        localStorage.removeItem('haulo_session_start');
        localStorage.removeItem('haulo_last_activity');

        HauloSystem.toSessionExpired({ reason });
      }

      // Check loop every 3 seconds for smooth precision
      setInterval(() => {
        const token = sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token');
        if (!token) return;

        const now = Date.now();
        const sessionStart = ensureSessionStart();

        // Read stored activity or fall back to local
        const storedActivity = parseInt(localStorage.getItem('haulo_last_activity') || sessionStorage.getItem('haulo_last_activity') || localLastActivity, 10);
        const lastEffectiveActivity = Math.max(localLastActivity, storedActivity);

        const sessionAge = now - sessionStart;
        const idleTime = now - lastEffectiveActivity;

        const isExtendedSession = sessionAge >= EXTENDED_SESSION_THRESHOLD;
        const idleLimit = isExtendedSession ? STRICT_IDLE_LIMIT : STANDARD_IDLE_LIMIT;
        const warnThreshold = isExtendedSession ? STRICT_WARN_TIME : STANDARD_WARN_TIME;

        if (idleTime >= idleLimit) {
          terminateSession(isExtendedSession ? 'extended_session_5m' : 'inactivity_20m');
        } else if (idleTime >= warnThreshold) {
          const remainingSec = Math.max(1, Math.ceil((idleLimit - idleTime) / 1000));
          showWarningModal(remainingSec, isExtendedSession);
        } else {
          dismissWarningModal();
        }
      }, 3000);
    }
  }

  return HauloSystem;
});
