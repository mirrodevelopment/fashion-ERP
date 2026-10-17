/* ============================================================
   HAULO BOUTIQUE ERP — Company Profile Settings Controller
   Path: front end/settings/company-profile/company-profile.js
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  CompanyProfileSettings.init();
});

const CompanyProfileSettings = (() => {

  function init() {
    if (typeof CompanyBridge !== 'undefined') {
      _populate(CompanyBridge.get());
      CompanyBridge.subscribe(data => _populate(data));
      CompanyBridge.fetch().then(data => _populate(data));
    }
  }

  function _populate(data) {
    if (!data) return;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined && val !== null) el.value = val;
    };

    setVal('boutiqueName', data.companyName);
    setVal('shortName', data.shortName);
    setVal('boutiqueTagline', data.tagline);
    setVal('ownerName', data.ownerName);
    if (data.businessType) {
      const bt = document.getElementById('businessType');
      if (bt) bt.value = data.businessType;
    }
    setVal('gstin', data.gstin);
    setVal('panNumber', data.panNumber);
    setVal('cinNumber', data.cinNumber);
    setVal('tanNumber', data.tanNumber);
    setVal('primaryPhone', data.primaryPhone);
    setVal('whatsappNumber', data.whatsapp);
    setVal('boutiqueEmail', data.email);
    setVal('boutiqueWebsite', data.website);
    setVal('streetAddress', data.streetAddress);
    setVal('city', data.city);
    setVal('state', data.state);
    setVal('pinCode', data.pinCode);
    if (data.country) {
      const co = document.getElementById('country');
      if (co) co.value = data.country;
    }

    const setChecked = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined && val !== null) el.checked = Boolean(val);
    };
    setChecked('shareCustomersAcrossBranches', data.shareCustomersAcrossBranches !== false);
    setChecked('shareOrdersAcrossBranches', data.shareOrdersAcrossBranches !== false);
    setChecked('shareEnquiriesAcrossBranches', data.shareEnquiriesAcrossBranches !== false);
    setChecked('shareMeasurementsAcrossBranches', data.shareMeasurementsAcrossBranches !== false);
    setChecked('shareInventoryAcrossBranches', data.shareInventoryAcrossBranches !== false);
    setChecked('shareGarmentsAcrossBranches', data.shareGarmentsAcrossBranches !== false);
    setChecked('shareTrialsAcrossBranches', data.shareTrialsAcrossBranches !== false);

    if (data.logoBase64) {
      const preview = document.getElementById('logoPreview');
      if (preview) {
        preview.innerHTML = `<img src="${data.logoBase64}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;" alt="Logo" /><div class="logo-upload-overlay" onclick="document.getElementById('logoFileInput').click()"><i data-lucide="camera" style="width:18px;height:18px;"></i></div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    } else {
      const initEl = document.getElementById('logoInitials');
      if (initEl) {
        const name = data.companyName || data.shortName || '';
        const parts = name.trim().split(/\s+/);
        initEl.textContent = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase() || '—';
      }
    }
  }

  async function save() {
    const btn = document.getElementById('btnSaveAll');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin .6s linear infinite"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Saving…';
    }

    if (typeof CompanyBridge === 'undefined') {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="save" style="width:15px;height:15px;"></i> Save Changes'; }
      return;
    }

    const current = CompanyBridge.get() || {};
    const val = id => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const preview = document.getElementById('logoPreview');
    const img = preview ? preview.querySelector('img') : null;
    const logoBase64 = img ? img.src : (current.logoBase64 || null);

    const payload = {
      id: current.id || 1,
      companyName: val('boutiqueName') || current.companyName || '',
      shortName: val('shortName') || current.shortName || (val('boutiqueName') ? val('boutiqueName').split(/\s+/)[0].toUpperCase() : ''),
      tagline: val('boutiqueTagline'),
      ownerName: val('ownerName'),
      businessType: val('businessType') || 'Bespoke Atelier',
      gstin: val('gstin'),
      panNumber: val('panNumber'),
      cinNumber: val('cinNumber'),
      tanNumber: val('tanNumber'),
      primaryPhone: val('primaryPhone'),
      whatsapp: val('whatsappNumber'),
      email: val('boutiqueEmail'),
      website: val('boutiqueWebsite'),
      streetAddress: val('streetAddress'),
      city: val('city'),
      state: val('state'),
      pinCode: val('pinCode'),
      country: val('country') || 'India',
      shareCustomersAcrossBranches: document.getElementById('shareCustomersAcrossBranches')?.checked ?? true,
      shareOrdersAcrossBranches: document.getElementById('shareOrdersAcrossBranches')?.checked ?? true,
      shareEnquiriesAcrossBranches: document.getElementById('shareEnquiriesAcrossBranches')?.checked ?? true,
      shareMeasurementsAcrossBranches: document.getElementById('shareMeasurementsAcrossBranches')?.checked ?? true,
      shareInventoryAcrossBranches: document.getElementById('shareInventoryAcrossBranches')?.checked ?? true,
      shareGarmentsAcrossBranches: document.getElementById('shareGarmentsAcrossBranches')?.checked ?? true,
      shareTrialsAcrossBranches: document.getElementById('shareTrialsAcrossBranches')?.checked ?? true,
      logoBase64: logoBase64,
      sessionTimeoutMinutes: current.sessionTimeoutMinutes || 20,
      invoicePrefix: current.invoicePrefix || 'HB',
      currencySymbol: current.currencySymbol || '₹',
      dateFormat: current.dateFormat || 'DD/MM/YYYY'
    };

    try {
      await CompanyBridge.save(payload);
      showToast('✓ Company & Boutique Profile saved successfully', 'success');
    } catch (e) {
      console.error('[CompanyProfile] Failed to save settings:', e);
      showToast('Failed to save settings: ' + e.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="save" style="width:15px;height:15px;"></i> Save Changes';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      showToast('Logo must be under 20 MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const rawData = ev.target.result;
      const preview = document.getElementById('logoPreview');
      const renderImg = (src) => {
        if (!preview) return;
        preview.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;" alt="Logo" /><div class="logo-upload-overlay" onclick="document.getElementById('logoFileInput').click()"><i data-lucide="camera" style="width:18px;height:18px;"></i></div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      };

      if (file.type === 'image/svg+xml' || file.size < 400 * 1024) {
        renderImg(rawData);
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
          renderImg(canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.92));
        };
        img.onerror = () => renderImg(rawData);
        img.src = rawData;
      }
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    const preview = document.getElementById('logoPreview');
    if (!preview) return;
    const name = (document.getElementById('boutiqueName')?.value || 'HD').trim();
    const parts = name.split(/\s+/);
    const initials = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    preview.innerHTML = `<span class="logo-initials" id="logoInitials">${initials}</span><div class="logo-upload-overlay" onclick="document.getElementById('logoFileInput').click()"><i data-lucide="camera" style="width:18px;height:18px;"></i></div>`;
    const inp = document.getElementById('logoFileInput');
    if (inp) inp.value = '';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    showToast('Logo removed — click Save Changes to persist', 'success');
  }

  let _toastTimer = null;
  function showToast(msg, type = 'success') {
    const t = document.getElementById('settingsToast');
    if (!t) return;
    clearTimeout(_toastTimer);
    t.className = `settings-toast ${type}`;
    t.textContent = msg;
    t.classList.add('show');
    _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  return {
    init,
    save,
    handleLogoUpload,
    removeLogo,
    showToast
  };
})();
