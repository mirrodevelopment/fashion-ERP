/* ============================================================
   HAULO BOUTIQUE ERP — Company Data Bridge & Universal Sync
   Path: front end/fragments/company-bridge.js
   Single Source of Truth: PostgreSQL company_settings table
   ============================================================ */

'use strict';

const CompanyBridge = (() => {
  const API_URL = 'http://localhost:8080/api/v1/company';
  const STORAGE_KEY = 'haulo_company_settings';
  const CHANNEL_NAME = 'haulo_company_sync';
  const TOKEN_STORAGE_KEYS = ['erp_token', 'haulo_token', 'fashion_erp_token'];

  // In-memory cache
  let _data = null;
  const _subscribers = [];

  // BroadcastChannel for cross-tab synchronization
  const _channel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

  if (_channel) {
    _channel.onmessage = (event) => {
      if (event && event.data && event.data.type === 'UPDATE' && event.data.payload) {
        _data = event.data.payload;
        _saveToStorage(_data);
        _notifySubscribers(_data);
        CompanyBridge.applyToDOM();
      }
    };
  }

  // Cross-tab fallback via window storage event
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        _data = JSON.parse(e.newValue);
        _notifySubscribers(_data);
        CompanyBridge.applyToDOM();
      } catch (_) {}
    }
  });

  // Local event listener
  document.addEventListener('haulo:company-updated', (e) => {
    if (e.detail) {
      _data = e.detail;
      _saveToStorage(_data);
      _notifySubscribers(_data);
      CompanyBridge.applyToDOM();
    }
  });

  function _loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }

  function _saveToStorage(data) {
    try {
      if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function _getToken() {
    for (const key of TOKEN_STORAGE_KEYS) {
      const t = sessionStorage.getItem(key) || localStorage.getItem(key);
      if (t) {
        try {
          const p = JSON.parse(atob(t.split('.')[1]));
          if (!p.exp || p.exp * 1000 > Date.now()) return t;
        } catch (_) {}
      }
    }
    return null;
  }

  function _notifySubscribers(data) {
    _subscribers.forEach(cb => {
      try { cb(data); } catch (err) { console.error('[CompanyBridge] subscriber error:', err); }
    });
  }

  function _getInitials(name) {
    if (!name) return 'HB';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  function _isCanonicalBrandOnly() {
    if (typeof window !== 'undefined' && window.location && window.location.pathname.toLowerCase().includes('login')) return true;
    if (typeof document !== 'undefined' && document.body && document.body.hasAttribute('data-canonical-brand-only')) return true;
    return false;
  }

  return {
    /**
     * Initializes the bridge: loads cache immediately (0ms),
     * then refreshes from API in background.
     */
    async init() {
      if (_isCanonicalBrandOnly()) return;

      // 1. Synchronously load from local storage
      if (!_data) {
        _data = _loadFromStorage();
      }
      if (_data) {
        this.applyToDOM();
      }

      // 2. Fetch fresh from backend API
      await this.fetch();
    },

    /**
     * Synchronous getter for current company settings.
     */
    get() {
      if (!_data) {
        _data = _loadFromStorage() || {
          companyName: 'Haulo Designs',
          shortName: 'HAULO',
          tagline: 'Bespoke Couture · Luxury Tailoring',
          ownerName: '',
          businessType: 'Bespoke Haute Couture Atelier & Luxury Fashion House',
          primaryPhone: '+91 98765 43210',
          whatsapp: '+91 98765 43210',
          email: 'support@haulo.luxury',
          website: 'https://haulo.luxury',
          streetAddress: 'Cross Cut Road, Gandhipuram',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          pinCode: '641012',
          country: 'India',
          logoBase64: null,
          gstin: '33AABCH1234F1Z9',
          panNumber: 'AABCH1234F'
        };
      }
      return Object.assign({}, _data);
    },

    /**
     * Fetches current settings from backend API.
     */
    async fetch() {
      if (_isCanonicalBrandOnly()) return this.get();
      try {
        const headers = {};
        const token = _getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(API_URL, { headers });
        if (!res.ok) return this.get();

        const json = await res.json();
        if (json && json.companyName) {
          _data = json;
          _saveToStorage(_data);
          _notifySubscribers(_data);
          this.applyToDOM();
        }
        return this.get();
      } catch (err) {
        return this.get();
      }
    },

    /**
     * Updates company settings in backend, updates local caches,
     * broadcasts to all open tabs, and updates DOM.
     */
    async save(payload) {
      const token = _getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(API_URL, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const updated = await res.json();
      _data = updated;
      _saveToStorage(updated);

      // Broadcast to other tabs
      if (_channel) {
        try {
          _channel.postMessage({ type: 'UPDATE', payload: updated });
        } catch (_) {}
      }

      // Notify local document
      document.dispatchEvent(new CustomEvent('haulo:company-updated', { detail: updated }));
      _notifySubscribers(updated);
      this.applyToDOM();

      return updated;
    },

    /**
     * Returns formatted branch string: "${companyName} — ${branchName}"
     */
    formatBranch(branchName) {
      const co = this.get();
      const b = branchName || localStorage.getItem('haulo_active_branch') || 'Main Branch';
      return `${co.companyName || 'Haulo Designs'} — ${b}`;
    },

    /**
     * Subscribe to company changes.
     */
    subscribe(callback) {
      if (typeof callback === 'function') {
        _subscribers.push(callback);
        if (_data) {
          try { callback(_data); } catch (_) {}
        }
      }
      return () => {
        const idx = _subscribers.indexOf(callback);
        if (idx !== -1) _subscribers.splice(idx, 1);
      };
    },

    /**
     * Scans root and hydrates all elements with company attributes & standard selectors.
     */
    applyToDOM(root = document) {
      if (_isCanonicalBrandOnly() || !root) return;
      const co = this.get();
      const activeBranch = localStorage.getItem('haulo_active_branch') || 'Main Branch';

      // 1. Declarative data-company and data-company-field bindings
      root.querySelectorAll('[data-company], [data-company-field]').forEach(el => {
        const field = el.getAttribute('data-company') || el.getAttribute('data-company-field');
        if (!field) return;

        switch (field) {
          case 'name':
          case 'companyName':
            el.textContent = co.companyName || '';
            break;
          case 'nameUpper':
          case 'companyNameUpper':
            el.textContent = (co.companyName || '').toUpperCase();
            break;
          case 'initials':
            el.textContent = _getInitials(co.companyName || co.shortName);
            break;
          case 'shortName':
            el.textContent = co.shortName || '';
            break;
          case 'shortNameUpper':
            el.textContent = (co.shortName || '').toUpperCase();
            break;
          case 'tagline':
            el.textContent = co.tagline || '';
            break;
          case 'taglineOrName':
            el.textContent = co.tagline || co.companyName || '';
            break;
          case 'branchTitle':
            el.textContent = `${co.companyName || ''} — ${activeBranch}`;
            break;
          case 'ownerName':
            el.textContent = co.ownerName || '';
            break;
          case 'businessType':
            el.textContent = co.businessType || '';
            break;
          case 'phone':
          case 'primaryPhone':
            el.textContent = co.primaryPhone || '';
            break;
          case 'whatsapp':
            el.textContent = co.whatsapp || co.primaryPhone || '';
            break;
          case 'email':
            el.textContent = co.email || '';
            break;
          case 'website':
            if (el.tagName === 'A') el.href = co.website || '#';
            el.textContent = co.website || '';
            break;
          case 'gstin':
            el.textContent = co.gstin || '';
            break;
          case 'pan':
          case 'panNumber':
            el.textContent = co.panNumber || '';
            break;
          case 'city':
            el.textContent = co.city || '';
            break;
          case 'addressFull': {
            const parts = [co.streetAddress, co.city, co.state, co.pinCode, co.country].filter(Boolean);
            el.textContent = parts.join(', ');
            break;
          }
          case 'receiptSub': {
            const loc = [co.city, co.state].filter(Boolean).join(', ');
            el.textContent = `${co.companyName || ''} • ${activeBranch}${loc ? ' • ' + loc : ''}`;
            break;
          }
          case 'copyright':
            el.innerHTML = `&copy; ${new Date().getFullYear()} ${co.companyName || ''}. All rights reserved.`;
            break;
          case 'logo':
            if (el.tagName === 'IMG') {
              if (co.logoBase64) {
                el.src = co.logoBase64;
                el.style.display = '';
              } else {
                el.style.display = 'none';
              }
            }
            break;
        }
      });

      // 1b. Declarative link href attributes via [data-company-href]
      root.querySelectorAll('[data-company-href]').forEach(el => {
        if (el.tagName !== 'A') return;
        const key = el.getAttribute('data-company-href');
        switch (key) {
          case 'phone':
          case 'primaryPhone':
            el.href = `tel:${(co.primaryPhone || '').replace(/\s+/g, '')}`;
            break;
          case 'whatsapp':
            el.href = `https://wa.me/${(co.whatsapp || co.primaryPhone || '').replace(/[^0-9]/g, '')}`;
            break;
          case 'email':
            el.href = `mailto:${co.email || ''}`;
            break;
          case 'website':
            el.href = co.website || '#';
            break;
        }
      });

      // 2. Standard Global Chrome elements
      const brandName = root.querySelector('.brand-name');
      if (brandName && co.shortName) brandName.textContent = co.shortName;

      const brandSub = root.querySelector('.brand-sub');
      if (brandSub && co.companyName) brandSub.textContent = co.companyName;

      const branchChips = root.querySelectorAll('#branchSelText, .branch-sel-text');
      branchChips.forEach(chip => {
        if (co.companyName) chip.textContent = `${co.companyName} — ${activeBranch}`;
      });

      const footerCompany = root.querySelector('#appFooter .footer-company-name, .footer-company-name, .footer-brand-name');
      if (footerCompany && co.shortName) footerCompany.textContent = co.shortName;

      const footerTagline = root.querySelector('#footerTagline');
      if (footerTagline && co.tagline) footerTagline.textContent = co.tagline;

      // 3. Update document title suffix
      if (document.title && co.companyName) {
        const titleParts = document.title.split(/ [—|] /);
        if (titleParts.length > 1) {
          document.title = `${titleParts[0]} — ${co.companyName}`;
        }
      }
    }
  };
})();

// Auto-run on DOM ready and expose globally
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CompanyBridge.init());
} else {
  CompanyBridge.init();
}

// Re-apply DOM bindings whenever active branch changes
document.addEventListener('haulo:branch-changed', () => {
  CompanyBridge.applyToDOM();
});

window.CompanyBridge = CompanyBridge;
window.CompanyIdentity = CompanyBridge;
