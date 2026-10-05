/* ============================================================
   HAULO BOUTIQUE ERP — Company Details Controller
   Path: front end/company/company.js
   ============================================================ */

'use strict';

/* ── Constants (no raw values elsewhere) ── */
const API_BASE            = 'http://localhost:8080/api/v1';
const COMPANY_API         = `${API_BASE}/company`;
const TOKEN_STORAGE_KEYS  = ['erp_token', 'haulo_token', 'fashion_erp_token'];

const BUSINESS_TYPES = [
  'Bespoke Atelier',
  'Luxury Boutique',
  'Garment Manufacturer',
  'Bridal Studio',
  'Fashion House',
];

const COUNTRIES = [
  'India',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Singapore',
  'Canada',
  'Australia',
];

const FORM_FIELDS = {
  companyName:   'coName',
  shortName:     'coShortName',
  tagline:       'coTagline',
  ownerName:     'coOwnerName',
  businessType:  'coBusinessType',
  gstin:         'coGstin',
  panNumber:     'coPan',
  primaryPhone:  'coPhone',
  whatsapp:      'coWhatsapp',
  email:         'coEmail',
  website:       'coWebsite',
  streetAddress: 'coStreet',
  city:          'coCity',
  state:         'coState',
  pinCode:       'coPinCode',
  country:       'coCountry',
};

/* ── State ── */
let _currentData  = {};
let _logoBase64   = null;

/* ============================================================
   COMPANY OBJECT
   ============================================================ */
const Company = {

  /* ── Init ── */
  async init() {
    this._buildBusinessTypeSelect();
    this._buildCountrySelect();
    this._bindLivePreview();
    await this._load();
  },

  /* ── Load from API ── */
  async _load() {
    let data = null;
    try {
      const res = await this._fetchWithAuth(COMPANY_API, { method: 'GET' });
      if (res.ok) {
        data = await res.json();
      }
    } catch (err) {
      console.warn('[Company] Could not load settings from API:', err.message);
    }

    if (!data || !data.companyName) {
      if (window.CompanyBridge && typeof window.CompanyBridge.get === 'function') {
        data = window.CompanyBridge.get();
      } else if (window.BrandIdentity) {
        const b = window.BrandIdentity.getAll();
        data = {
          companyName: b.companyName,
          shortName: b.shortName,
          tagline: b.tagline,
          businessType: 'Bespoke Atelier',
          primaryPhone: b.telephony.primaryMobile,
          whatsapp: b.telephony.whatsapp,
          email: b.emails.support,
          website: b.contact.website,
          streetAddress: b.headquarters.streetAddress,
          city: b.headquarters.city,
          state: b.headquarters.state,
          pinCode: b.headquarters.pinCode,
          country: b.headquarters.country,
          gstin: b.compliance.gstin,
          panNumber: b.compliance.pan
        };
      }
    }

    if (data) {
      _currentData = data;
      _logoBase64  = data.logoBase64 || null;
      this._populateForm(data);
      this._renderLogo(data.logoBase64, data.shortName);
      this._updatePreview(data);
    }
  },

  /* ── Populate Form ── */
  _populateForm(data) {
    Object.entries(FORM_FIELDS).forEach(([key, elementId]) => {
      const el = document.getElementById(elementId);
      if (!el) return;
      el.value = data[key] || '';
    });
  },

  /* ── Build Selects ── */
  _buildBusinessTypeSelect() {
    const sel = document.getElementById('coBusinessType');
    if (!sel) return;
    sel.innerHTML = BUSINESS_TYPES.map(t =>
      `<option value="${t}">${t}</option>`
    ).join('');
  },

  _buildCountrySelect() {
    const sel = document.getElementById('coCountry');
    if (!sel) return;
    sel.innerHTML = COUNTRIES.map(c =>
      `<option value="${c}">${c}</option>`
    ).join('');
  },

  /* ── Live Preview ── */
  _bindLivePreview() {
    const previewFields = ['coName', 'coShortName'];
    previewFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this._updatePreviewFromInputs());
    });
  },

  _updatePreviewFromInputs() {
    const name  = document.getElementById('coName')?.value.trim()      || 'Company Name';
    const short = document.getElementById('coShortName')?.value.trim() || 'CO';
    this._setPreviewValues(short, name);
  },

  _updatePreview(data) {
    this._setPreviewValues(
      data.shortName   || '—',
      data.companyName || '—'
    );
  },

  _setPreviewValues(shortName, companyName) {
    const brandNameEl  = document.getElementById('previewBrandName');
    const brandSubEl   = document.getElementById('previewBrandSub');
    const branchNameEl = document.getElementById('previewBranchName');
    if (brandNameEl)  brandNameEl.textContent  = shortName.toUpperCase().slice(0, 8);
    if (brandSubEl)   brandSubEl.textContent   = companyName;
    if (branchNameEl) branchNameEl.textContent = `${companyName} — Main Branch`;
  },

  /* ── Logo ── */
  _renderLogo(base64, shortName) {
    const preview  = document.getElementById('coLogoPreview');
    const initials = document.getElementById('coLogoInitials');
    if (!preview) return;

    if (base64) {
      preview.innerHTML = `
        <img src="${base64}" alt="Company Logo"
             style="width:100%;height:100%;object-fit:cover;border-radius:16px;" />
        <div class="co-logo-overlay" onclick="document.getElementById('coLogoInput').click()">
          <i data-lucide="camera" style="width:18px;height:18px;"></i>
        </div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    } else {
      const text = this._initials(shortName || (_currentData.companyName || '—'));
      preview.innerHTML = `
        <span class="co-logo-initials" id="coLogoInitials">${text}</span>
        <div class="co-logo-overlay" onclick="document.getElementById('coLogoInput').click()">
          <i data-lucide="camera" style="width:18px;height:18px;"></i>
        </div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      this.showToast('Logo must be under 20 MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const rawData = ev.target.result;
      if (file.type === 'image/svg+xml' || file.size < 400 * 1024) {
        _logoBase64 = rawData;
        this._renderLogo(_logoBase64, null);
      } else {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          _logoBase64 = canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.92);
          this._renderLogo(_logoBase64, null);
        };
        img.onerror = () => {
          _logoBase64 = rawData;
          this._renderLogo(_logoBase64, null);
        };
        img.src = rawData;
      }
    };
    reader.readAsDataURL(file);
  },

  removeLogo() {
    _logoBase64 = '';
    this._renderLogo(null, _currentData.shortName || _currentData.companyName || '—');
    const fileInput = document.getElementById('coLogoInput');
    if (fileInput) fileInput.value = '';
    this.showToast('Logo removed — click Save to apply', 'success');
  },

  /* ── Save ── */
  async save() {
    const companyName = document.getElementById('coName')?.value.trim();
    const shortName   = document.getElementById('coShortName')?.value.trim();

    if (!companyName) {
      this.showToast('Company Name is required', 'error');
      document.getElementById('coName')?.focus();
      return;
    }
    if (!shortName) {
      this.showToast('Short Name is required', 'error');
      document.getElementById('coShortName')?.focus();
      return;
    }

    const payload = {
      companyName,
      shortName:     shortName.toUpperCase().slice(0, 8),
      tagline:       document.getElementById('coTagline')?.value.trim()     || '',
      ownerName:     document.getElementById('coOwnerName')?.value.trim()   || '',
      businessType:  document.getElementById('coBusinessType')?.value       || BUSINESS_TYPES[0],
      gstin:         document.getElementById('coGstin')?.value.trim()       || '',
      panNumber:     document.getElementById('coPan')?.value.trim()         || '',
      primaryPhone:  document.getElementById('coPhone')?.value.trim()       || '',
      whatsapp:      document.getElementById('coWhatsapp')?.value.trim()    || '',
      email:         document.getElementById('coEmail')?.value.trim()       || '',
      website:       document.getElementById('coWebsite')?.value.trim()     || '',
      streetAddress: document.getElementById('coStreet')?.value.trim()      || '',
      city:          document.getElementById('coCity')?.value.trim()        || '',
      state:         document.getElementById('coState')?.value.trim()       || '',
      pinCode:       document.getElementById('coPinCode')?.value.trim()     || '',
      country:       document.getElementById('coCountry')?.value            || COUNTRIES[0],
      logoBase64:    _logoBase64 !== null ? _logoBase64 : undefined,
    };

    const btn = document.getElementById('coBtnSave');
    if (btn) {
      btn.disabled     = true;
      btn.innerHTML    = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin .6s linear infinite"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Saving…';
    }

    try {
      const res = await this._fetchWithAuth(COMPANY_API, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      _currentData = updated;
      this._updatePreview(updated);
      this.showToast('✓ Company details saved', 'success');

      // Notify company bridge & other pages
      document.dispatchEvent(new CustomEvent('haulo:company-updated', { detail: updated }));
      if (typeof CompanyBridge !== 'undefined') {
        CompanyBridge.applyToDOM();
      }
    } catch (err) {
      this.showToast('Save failed — ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled  = false;
        btn.innerHTML = '<i data-lucide="save" style="width:14px;height:14px;"></i> Save Changes';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  },

  /* ── Toast ── */
  showToast(msg, type = 'success') {
    const toast  = document.getElementById('coToast');
    const msgEl  = document.getElementById('coToastMsg');
    if (!toast || !msgEl) return;
    clearTimeout(Company._toastTimer);
    toast.className  = `co-toast ${type} show`;
    msgEl.textContent = msg;
    Company._toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  },

  /* ── Helpers ── */
  _initials(str) {
    if (!str) return '—';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return str.substring(0, 2).toUpperCase() || '—';
  },

  /* ── Auth: identical pattern to branches.js ── */
  _getToken() {
    try {
      for (const key of TOKEN_STORAGE_KEYS) {
        const t = sessionStorage.getItem(key) || localStorage.getItem(key);
        if (t && this._isTokenValid(t)) return t;
      }
      return null;
    } catch (_) {
      return null;
    }
  },

  _isTokenValid(token) {
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && (payload.exp * 1000) <= Date.now()) return false;
      return true;
    } catch (_) {
      return false;
    }
  },

  _ensureAuth() {
    const token = this._getToken();
    if (!token) {
      window.location.href = '../login/login.html';
      return null;
    }
    return token;
  },

  async _fetchWithAuth(url, options = {}) {
    const token = this._ensureAuth();
    if (!token) return { ok: false, status: 401 };

    const headers = Object.assign({}, options.headers || {});
    headers['Authorization'] = `Bearer ${token}`;
    const finalOptions = Object.assign({}, options, { headers });

    const res = await fetch(url, finalOptions);
    if (res.status === 401 || res.status === 403) {
      try {
        TOKEN_STORAGE_KEYS.forEach(k => {
          sessionStorage.removeItem(k);
          localStorage.removeItem(k);
        });
      } catch (_) {}
      window.location.href = '../login/login.html';
    }
    return res;
  },

  _toastTimer: null,
};

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  Company.init();
});

window.Company = Company;
