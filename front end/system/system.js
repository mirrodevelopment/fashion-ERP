/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — CENTRAL SYSTEM CONTROLLER & BRIDGE
 * Path: front end/system/system.js
 * Universal router and handler for System & Error pages:
 * Session Expired, Maintenance, Coming Soon, Under Construction,
 * 403 Forbidden, 404 Not Found, 500 Server Error, Network Error, Offline.
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

  /**
   * Dynamically resolves the relative URL path to `front end/system/`
   * from any page or module in the application.
   */
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
      // segments.length - 1 represents how many folders deep we are relative to "front end/"
      const depth = Math.max(0, segments.length - 1);
      if (depth === 0) return 'system/';
      return '../'.repeat(depth) + 'system/';
    }

    // Direct filesystem or root URL fallback
    if (pathname.includes('/system/')) {
      const parts = pathname.split('/system/');
      const after = parts[1] || '';
      const depth = after.split('/').filter(Boolean).length;
      return '../'.repeat(Math.max(1, depth));
    }

    return '/front end/system/';
  }

  /**
   * Preserves current page in storage before transitioning away to a system page.
   */
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
    /**
     * Compute clean relative path to any subpath inside `system/`
     */
    resolvePath(relativePath) {
      const prefix = getSystemPrefix();
      const cleanSub = String(relativePath || '').replace(/^\/+/, '');
      return prefix + cleanSub;
    },

    /**
     * 1. Session Expired (JWT timeout / 401 Unauthorized)
     */
    toSessionExpired(options = {}) {
      saveCurrentPage();
      const reason = encodeURIComponent(options.reason || 'inactivity_20m');
      const returnUrl = options.returnUrl || window.location.href;
      try {
        sessionStorage.setItem('haulo_redirect_after_login', returnUrl);
        localStorage.setItem('haulo_redirect_after_login', returnUrl);
      } catch (_) {}

      const target = this.resolvePath(`session-expired/session-expired.html?reason=${reason}&returnUrl=${encodeURIComponent(returnUrl)}`);
      window.location.href = target;
    },

    /**
     * 2. Access Denied / Forbidden (403)
     */
    toForbidden(options = {}) {
      saveCurrentPage();
      const feature = encodeURIComponent(options.feature || 'Restricted Action');
      const role = encodeURIComponent(options.requiredRole || 'Administrator / Manager');
      const target = this.resolvePath(`error/403-error/403.html?feature=${feature}&role=${role}`);
      window.location.href = target;
    },

    /**
     * 3. Not Found (404)
     */
    toNotFound(options = {}) {
      saveCurrentPage();
      const path = encodeURIComponent(options.targetUrl || window.location.pathname);
      const target = this.resolvePath(`error/404-error/404.html?path=${path}`);
      window.location.href = target;
    },

    /**
     * 4. Server Error (500 / 502 / 504)
     */
    toServerError(options = {}) {
      saveCurrentPage();
      const code = encodeURIComponent(options.status || 500);
      const msg = encodeURIComponent(options.message || 'Internal Server Fault');
      const prefix = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('system.error500TracePrefix')) || 'ERP-500-';
      const trace = encodeURIComponent(options.traceId || (prefix + Math.random().toString(36).substring(2, 8).toUpperCase()));
      const target = this.resolvePath(`error/500-error/500.html?code=${code}&msg=${msg}&trace=${trace}`);
      window.location.href = target;
    },

    /**
     * 5. Network Error (DNS failure, gateway timeout, connection refused)
     */
    toNetworkError(options = {}) {
      saveCurrentPage();
      const endpoint = encodeURIComponent(options.endpoint || 'API Gateway');
      const method = encodeURIComponent(options.method || 'GET');
      const target = this.resolvePath(`error/network-error/network-error.html?endpoint=${endpoint}&method=${method}`);
      window.location.href = target;
    },

    /**
     * 6. Offline Status (Browser disconnected)
     */
    toOffline(options = {}) {
      saveCurrentPage();
      const origin = encodeURIComponent(options.origin || window.location.href);
      const target = this.resolvePath(`error/offline/offline.html?origin=${origin}`);
      window.location.href = target;
    },

    /**
     * 7. Maintenance Mode (503 Service Unavailable)
     */
    toMaintenance(options = {}) {
      saveCurrentPage();
      const eta = encodeURIComponent(options.estMinutes || 35);
      const target = this.resolvePath(`maintenance/maintenance.html?eta=${eta}`);
      window.location.href = target;
    },

    /**
     * 8. Coming Soon (Roadmap feature placeholder)
     */
    toComingSoon(options = {}) {
      saveCurrentPage();
      const defaultFeature = (typeof BrandIdentity !== 'undefined' && (BrandIdentity.get('shortName') + ' Bespoke Feature')) || 'Bespoke Feature';
      const feature = encodeURIComponent(options.feature || defaultFeature);
      const eta = encodeURIComponent(options.eta || 'Q4 2026');
      const target = this.resolvePath(`coming-soon/coming-soon.html?feature=${feature}&eta=${eta}`);
      window.location.href = target;
    },

    /**
     * 9. Under Construction (Module currently in active sprint)
     */
    toUnderConstruction(options = {}) {
      saveCurrentPage();
      const moduleName = encodeURIComponent(options.module || 'Production Module');
      const sprint = encodeURIComponent(options.sprint || 'Active Sprint');
      const target = this.resolvePath(`under-construction/under-construction.html?module=${moduleName}&sprint=${sprint}`);
      window.location.href = target;
    }
  };

  return HauloSystem;
});
