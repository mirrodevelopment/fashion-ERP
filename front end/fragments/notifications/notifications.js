/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — Dynamic Notification Center Engine
 * Path: front end/fragments/notifications/notifications.js
 *
 * Provides a unified notification engine for the entire ERP system:
 * • Dynamic state store with localStorage persistence
 * • Dynamic relative time-ago calculations ("Just now", "15m ago", "2h ago")
 * • Interactive "Mark all read", individual dismiss, and filter tabs
 * • Inter-module event bus: NotificationCenter.push(...)
 * • Live luxury toast popups: NotificationCenter.toast(...)
 * • Zero-raw-data dynamic DOM rendering
 * ======================================================================= */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'haulo_notifications_v3';
  const BADGE_ID    = 'notifBadge';
  const PANEL_ID    = 'notifPanel';
  const CONTAINER_ID = 'notifListContainer';

  /* ── Notification Store State (Strictly Dynamic — Zero Raw Code Dummy Data) ── */
  let _notifications = [];
  let _activeFilter  = 'all'; // 'all' | 'unread'
  let _toastContainer = null;
  let _isSyncing = false;

  /* ── Load & Persist ── */
  function _load() {
    try {
      // Purge legacy mock seed storage keys completely
      localStorage.removeItem('haulo_notifications_v2');
      localStorage.removeItem('haulo_notifications_seed');

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Filter out any legacy dummy mock items if they ever got stored
          _notifications = parsed.filter(n => n && n.id &&
            !n.id.startsWith('notif-trial-') &&
            !n.id.startsWith('notif-stock-') &&
            !n.id.startsWith('notif-order-') &&
            !n.id.startsWith('notif-garment-') &&
            !n.id.startsWith('notif-purchase-')
          );
        } else {
          _notifications = [];
        }
      } else {
        _notifications = [];
      }
    } catch (_) {
      _notifications = [];
    }
  }

  function _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_notifications));
    } catch (_) {}
  }

  /**
   * Dynamically queries backend REST APIs for real alerts:
   * - Real inventory low stock items
   * - Real orders ready for delivery or in progress
   * - Real scheduled trials for today
   * - Real appointments for today
   */
  async function _syncDynamicFromBackend() {
    if (_isSyncing) return;
    _isSyncing = true;

    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('erp_token')) ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('erp_token'));
      if (!token) return;

      const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
      const baseUrl = (typeof window !== 'undefined' && window.location && window.location.origin)
        ? `${window.location.origin}/api/v1`
        : 'http://localhost:8080/api/v1';

      // 1. Check real low-stock inventory items
      try {
        const invRes = await fetch(`${baseUrl}/inventory?size=50`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
        if (invRes && Array.isArray(invRes.content)) {
          invRes.content.forEach(item => {
            const stock = Number(item.stock || item.quantity || 0);
            const reorder = Number(item.reorderPoint || item.minStock || 10);
            if (stock <= reorder) {
              const id = `dynamic-inv-${item.id || item.code}`;
              if (!_notifications.some(n => n.id === id)) {
                _notifications.unshift({
                  id,
                  type: 'fabrics',
                  module: 'Inventory & Materials',
                  severity: 'danger',
                  title: `Low Stock: ${item.name || item.itemName || item.code}`,
                  message: `Current stock is ${stock} ${item.uom || 'm'} (reorder threshold: ${reorder} ${item.uom || 'm'}).`,
                  timestamp: Date.now() - 1000 * 60 * 5,
                  read: false,
                  actionUrl: '../fabrics-materials/fabrics-materials.html'
                });
              }
            }
          });
        }
      } catch (_) {}

      // 2. Check real orders ready for delivery
      try {
        const ordRes = await fetch(`${baseUrl}/orders?status=READY&size=20`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
        if (ordRes && Array.isArray(ordRes.content)) {
          ordRes.content.forEach(order => {
            const id = `dynamic-ord-${order.id || order.orderNumber || order.orderCode}`;
            if (!_notifications.some(n => n.id === id)) {
              _notifications.unshift({
                id,
                type: 'orders',
                module: 'Orders & Production',
                severity: 'success',
                title: `Order ${order.orderNumber || order.orderCode || 'Ready'}`,
                message: `Garment for ${order.customerName || 'customer'} is ready for delivery.`,
                timestamp: Date.now() - 1000 * 60 * 15,
                read: false,
                actionUrl: '../orders/order-overview/order-over.html'
              });
            }
          });
        }
      } catch (_) {}

      // 3. Check real trials scheduled for today
      try {
        const triRes = await fetch(`${baseUrl}/trials?size=20`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
        if (triRes && Array.isArray(triRes.content)) {
          const todayStr = new Date().toISOString().slice(0, 10);
          triRes.content.forEach(trial => {
            if (trial.trialDate && trial.trialDate.startsWith(todayStr)) {
              const id = `dynamic-trial-${trial.id}`;
              if (!_notifications.some(n => n.id === id)) {
                _notifications.unshift({
                  id,
                  type: 'trials',
                  module: 'Trials & Alterations',
                  severity: 'warn',
                  title: `Trial Fitting: ${trial.customerName || trial.orderCode || 'Today'}`,
                  message: `Fitting session scheduled for ${trial.trialTime || 'today'}.`,
                  timestamp: Date.now() - 1000 * 60 * 30,
                  read: false,
                  actionUrl: '../trials-alterations/trials-alterations.html'
                });
              }
            }
          });
        }
      } catch (_) {}

      // 4. Check real appointments scheduled for today
      try {
        const appRes = await fetch(`${baseUrl}/appointments/today`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
        if (Array.isArray(appRes)) {
          appRes.forEach(app => {
            const id = `dynamic-app-${app.id}`;
            if (!_notifications.some(n => n.id === id)) {
              _notifications.unshift({
                id,
                type: 'appointments',
                module: 'Appointments',
                severity: 'info',
                title: `Appointment: ${app.customerName || 'Client'}`,
                message: `${app.serviceType || 'Fitting & Consultation'} at ${app.appointmentTime || app.startTime || 'today'}.`,
                timestamp: Date.now() - 1000 * 60 * 10,
                read: false,
                actionUrl: '../appointments/appointments.html'
              });
            }
          });
        }
      } catch (_) {}

      _save();
      _renderPanel();
    } finally {
      _isSyncing = false;
    }
  }

  /* ── Relative Time Formatter ── */
  function _formatTime(timestamp) {
    if (!timestamp) return 'Recently';
    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsed < 60) return 'Just now';
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)} mins ago`;
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
    if (elapsed < 172800) return 'Yesterday';
    return `${Math.floor(elapsed / 86400)}d ago`;
  }

  /* ── SVG Icons ── */
  function _getModuleIcon(type) {
    switch (type) {
      case 'garments':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`;
      case 'trials':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
      case 'fabrics':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`;
      case 'orders':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
      case 'purchases':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
    }
  }

  function _escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ── Update Badge Counter ── */
  function _updateBadge() {
    const unreadCount = _notifications.filter(n => !n.read).length;
    const badge = document.getElementById(BADGE_ID);
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.textContent = '0';
        badge.style.display = 'none';
      }
    }
  }

  /* ── Render Notification Panel DOM ── */
  function _renderPanel() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;

    const unreadCount = _notifications.filter(n => !n.read).length;
    const items = _activeFilter === 'unread'
      ? _notifications.filter(n => !n.read)
      : _notifications;

    panel.innerHTML = `
      <div class="dd-panel-header notif-panel-header">
        <div class="notif-header-title-row">
          <span class="notif-header-title">Notifications</span>
          ${unreadCount > 0 ? `<span class="notif-count-badge">${unreadCount} new</span>` : ''}
        </div>
        <div class="notif-header-actions">
          ${unreadCount > 0 ? `<button type="button" class="notif-clear-btn" id="notifMarkAllReadBtn">Mark all read</button>` : ''}
        </div>
      </div>

      <div class="notif-filter-strip">
        <button type="button" class="notif-filter-chip ${_activeFilter === 'all' ? 'active' : ''}" data-filter="all">All (${_notifications.length})</button>
        <button type="button" class="notif-filter-chip ${_activeFilter === 'unread' ? 'active' : ''}" data-filter="unread">Unread (${unreadCount})</button>
      </div>

      <div class="notif-list" id="${CONTAINER_ID}">
        ${items.length === 0 ? `
          <div class="notif-empty-state">
            <svg class="notif-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              <line x1="2" y1="2" x2="22" y2="22"/>
            </svg>
            <div class="notif-empty-title">All caught up!</div>
            <div class="notif-empty-desc">${_activeFilter === 'unread' ? 'No unread notifications right now.' : 'You have no notifications.'}</div>
          </div>
        ` : items.map(n => `
          <div class="notif-item ${n.read ? 'read' : 'unread'}" data-notif-id="${n.id}">
            <div class="notif-dot ${n.severity || 'info'}"></div>
            <div class="notif-content">
              <div class="notif-meta-line">
                <span class="notif-module-tag">${_escapeHTML(n.module || n.type || 'ERP')}</span>
                <span class="notif-time">${_formatTime(n.timestamp)}</span>
              </div>
              <div class="notif-title">${_escapeHTML(n.title)}</div>
              <div class="notif-sub">${_escapeHTML(n.message)}</div>
            </div>
            <button type="button" class="notif-dismiss-btn" data-dismiss-id="${n.id}" title="Dismiss">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        `).join('')}
      </div>
    `;

    _bindEvents(panel);
    _updateBadge();
  }

  /* ── Bind Panel Interactive Events ── */
  function _bindEvents(panel) {
    // Filter Chips
    panel.querySelectorAll('.notif-filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        _activeFilter = chip.getAttribute('data-filter') || 'all';
        _renderPanel();
      });
    });

    // Mark All Read
    const markAllBtn = panel.querySelector('#notifMarkAllReadBtn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        HauloNotifications.markAllRead();
      });
    }

    // Dismiss Single Item
    panel.querySelectorAll('.notif-dismiss-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-dismiss-id');
        HauloNotifications.dismiss(id);
      });
    });

    // Click Notification to Navigate & Mark Read
    panel.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = item.getAttribute('data-notif-id');
        const notif = _notifications.find(n => n.id === id);
        if (notif) {
          notif.read = true;
          _save();
          _updateBadge();
          panel.classList.remove('open');
          if (notif.actionUrl) {
            window.location.href = notif.actionUrl;
          }
        }
      });
    });
  }

  /* ── Global Live Toast Engine ── */
  function _ensureToastContainer() {
    if (!_toastContainer) {
      _toastContainer = document.getElementById('hauloToastContainer');
      if (!_toastContainer) {
        _toastContainer = document.createElement('div');
        _toastContainer.id = 'hauloToastContainer';
        _toastContainer.className = 'haulo-toast-container';
        document.body.appendChild(_toastContainer);
      }
    }
    return _toastContainer;
  }

  function _showToast(notif) {
    const container = _ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = 'haulo-toast';

    toast.innerHTML = `
      <div class="haulo-toast-icon notif-dot ${notif.severity || 'info'}"></div>
      <div class="haulo-toast-body">
        <div class="haulo-toast-title">${_escapeHTML(notif.title)}</div>
        <div class="haulo-toast-message">${_escapeHTML(notif.message)}</div>
      </div>
    `;

    toast.addEventListener('click', () => {
      if (notif.actionUrl) {
        window.location.href = notif.actionUrl;
      }
      toast.remove();
    });

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, notif.duration || 4500);
  }

  /* ── Public API ── */
  const HauloNotifications = {

    /** Returns all notifications */
    getAll: function () {
      return _notifications.slice();
    },

    /** Returns count of unread notifications */
    getUnreadCount: function () {
      return _notifications.filter(n => !n.read).length;
    },

    /**
     * Push a new dynamic notification into the system
     * @param {object} notif
     *   notif.title     {string}
     *   notif.message   {string}
     *   notif.severity  {'info'|'warn'|'danger'|'success'}
     *   notif.type      {'garments'|'trials'|'fabrics'|'orders'|'purchases'|'qc'|'payments'}
     *   notif.module    {string} (optional display name)
     *   notif.actionUrl {string} (optional link)
     *   notif.silent    {boolean} (if true, does not trigger live toast)
     */
    push: function (notif) {
      if (!notif || !notif.title) return;

      const item = {
        id: notif.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: notif.type || 'general',
        module: notif.module || 'System',
        severity: notif.severity || 'info',
        title: notif.title,
        message: notif.message || '',
        timestamp: notif.timestamp || Date.now(),
        read: false,
        actionUrl: notif.actionUrl || ''
      };

      _notifications.unshift(item);
      // Keep store under 50 items
      if (_notifications.length > 50) {
        _notifications = _notifications.slice(0, 50);
      }

      _save();
      _renderPanel();

      if (!notif.silent) {
        _showToast(item);
      }

      window.dispatchEvent(new CustomEvent('haulo-notification-received', { detail: item }));
    },

    /** Mark a single notification as read */
    markRead: function (id) {
      const notif = _notifications.find(n => n.id === id);
      if (notif) {
        notif.read = true;
        _save();
        _renderPanel();
      }
    },

    /** Mark all notifications as read */
    markAllRead: function () {
      _notifications.forEach(n => { n.read = true; });
      _save();
      _renderPanel();
    },

    /** Dismiss / delete a notification */
    dismiss: function (id) {
      _notifications = _notifications.filter(n => n.id !== id);
      _save();
      _renderPanel();
    },

    /** Trigger a live luxury toast popup */
    toast: function (opts) {
      _showToast(opts);
    },

    /** Trigger dynamic sync from real backend REST APIs */
    sync: function () {
      return _syncDynamicFromBackend();
    },

    /** Clear all notifications (removes all saved notifications) */
    clearAll: function () {
      _notifications = [];
      _save();
      _renderPanel();
    },

    /** Re-render the panel UI */
    refresh: function () {
      _renderPanel();
      _syncDynamicFromBackend();
    },

    /** Initialize controller */
    init: function () {
      _load();
      _renderPanel();
      _syncDynamicFromBackend();

      // Listen for navbar injection events
      window.addEventListener('haulo-nav-ready', function () {
        _renderPanel();
        _syncDynamicFromBackend();
      });

      // Periodically refresh relative times and sync real backend alerts every 60s
      setInterval(() => {
        const panel = document.getElementById(PANEL_ID);
        if (panel && panel.classList.contains('open')) {
          _renderPanel();
        }
        _syncDynamicFromBackend();
      }, 60000);
    }
  };

  /* ── Auto-init on script load ── */
  _load();

  document.addEventListener('DOMContentLoaded', function () {
    HauloNotifications.init();
  });

  // Global aliases
  window.HauloNotifications = HauloNotifications;
  window.NotificationCenter = HauloNotifications;

})(window);
