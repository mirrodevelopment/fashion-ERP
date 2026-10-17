/**
 * HAULO BOUTIQUE ERP — NEW GARMENT CONTROLLER
 * Path: front end/garments/new-garment/new-garment.js
 * Handles customer search autocomplete, live preview calculations,
 * sequential code generation, and POST /api/v1/garments creation.
 */

let api = window.api || null;
let Auth = window.Auth || {
  getToken: () => sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token') || '',
  isLoggedIn: () => Boolean(sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token'))
};

// ── State ───────────────────────────────────────────────────────────────────
let searchDebounceTimer = null;
let createdGarmentRecord = null;
window._customerSearchCache = [];

// ── Lifecycle & Initialization ─────────────────────────────────────────────
async function initNewGarmentWorkspace() {
  // Sync fragment base
  if (typeof window.FRAGMENT_BASE === 'undefined') {
    window.FRAGMENT_BASE = '../../fragments/';
  }

  // 1. Generate fresh sequential Garment Code
  generateNewGarmentCode();

  // 2. Set default commitment dates
  setDefaultDates();

  // 3. Load dynamic branches & collections from backend
  await loadReferenceOptions();

  // 4. Initial Live Preview sync with default high-res image preset
  const txtImgInit = document.getElementById('txtImageUrl');
  const initialImg = (txtImgInit && txtImgInit.value) ? txtImgInit.value : '../../assets/garments/bridal_blouse_zardozi.jpg';
  window.setImagePreset(initialImg);
  calculateBalance();

  // 5. Setup Stepper Scroll Spy & Outside Click Dismissal
  setupStepperScrollSpy();
  setupOutsideClickListener();

  // 6. Check for local draft
  checkAndRestoreDraft();

  // 7. Initialize Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewGarmentWorkspace);
} else {
  initNewGarmentWorkspace();
}

// ── Sequential Code Generation ─────────────────────────────────────────────
window.generateNewGarmentCode = function() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const code = `GAR-${year}-${randomSuffix}`;
  const input = document.getElementById('txtGarmentCode');
  if (input) {
    input.value = code;
  }
  updateLivePreview();
};

function setDefaultDates() {
  const today = new Date();
  
  // Trial date default: +7 days
  const trialDate = new Date(today);
  trialDate.setDate(today.getDate() + 7);
  const txtTrial = document.getElementById('txtTrialDate');
  if (txtTrial) txtTrial.value = trialDate.toISOString().split('T')[0];

  // Delivery due date default: +12 days
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 12);
  const txtDue = document.getElementById('txtDueDate');
  if (txtDue) txtDue.value = dueDate.toISOString().split('T')[0];
}

// ── Load Reference Options from Database ────────────────────────────────────
async function loadReferenceOptions() {
  try {
    // 1. Populate Branches if API available
    if (api?.branches?.list) {
      const branches = await api.branches.list();
      const selBranch = document.getElementById('selBranch');
      if (selBranch && Array.isArray(branches) && branches.length > 0) {
        selBranch.innerHTML = branches.map((b, i) => `
          <option value="${escapeHTML(b.name)}" ${i === 0 ? 'selected' : ''}>${escapeHTML(b.name)}</option>
        `).join('');
      }
    }

    // 2. Populate Collections if API available
    if (api?.collections?.list) {
      const collections = await api.collections.list();
      const selCol = document.getElementById('selCollection');
      if (selCol && Array.isArray(collections) && collections.length > 0) {
        selCol.innerHTML = collections.map((c, i) => `
          <option value="${escapeHTML(c.name || c.title)}" ${i === 0 ? 'selected' : ''}>${escapeHTML(c.name || c.title)}</option>
        `).join('');
      }
    }

    // 3. Populate Employees / Artisans & Designers from DB
    if (api?.employees?.list) {
      const empRes = await api.employees.list({ size: 100 });
      const emps = empRes?.content || (Array.isArray(empRes) ? empRes : []);
      if (Array.isArray(emps) && emps.length > 0) {
        const selAssigned = document.getElementById('selAssignedTo');
        if (selAssigned) {
          selAssigned.innerHTML = emps.map((e, i) => `
            <option value="${escapeHTML(e.name)}" ${i === 0 ? 'selected' : ''}>${escapeHTML(e.name)}${e.role ? ` (${escapeHTML(e.role)})` : ''}</option>
          `).join('');
        }

        const selDesigner = document.getElementById('selDesigner');
        if (selDesigner) {
          const designers = emps.filter(e => {
            const r = (e.role || '').toUpperCase();
            const d = (e.department || '').toUpperCase();
            return r.includes('DESIGNER') || r.includes('LEAD') || d.includes('DESIGN');
          });
          const list = designers.length > 0 ? designers : emps;
          selDesigner.innerHTML = list.map((e, i) => `
            <option value="${escapeHTML(e.name)}" ${i === 0 ? 'selected' : ''}>${escapeHTML(e.name)}${e.role ? ` (${escapeHTML(e.role)})` : ''}</option>
          `).join('');
        }
      }
    }

    // 4. Populate Dynamic Stages from stage_definitions table
    if (api?.production?.stageDefinitions?.list) {
      const defs = await api.production.stageDefinitions.list({ activeOnly: true });
      const selStage = document.getElementById('selProductionStage');
      if (selStage && Array.isArray(defs) && defs.length > 0) {
        selStage.innerHTML = defs.map((d, i) => `
          <option value="${escapeHTML(d.displayName || d.stageKey)}" ${i === 0 ? 'selected' : ''}>${escapeHTML(d.displayName || d.stageKey)}</option>
        `).join('');
      }
    }
  } catch (err) {
    console.warn('[New Garment] Reference lookup fallback:', err);
  }
}

// ── Customer Search Autocomplete ───────────────────────────────────────────
window.handleCustomerSearch = function(query) {
  clearTimeout(searchDebounceTimer);
  const dropdown = document.getElementById('customerDropdownList');
  if (!dropdown) return;

  const trimmed = (query || '').trim();
  if (trimmed.length < 2) {
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
    window._customerSearchCache = [];
    return;
  }

  searchDebounceTimer = setTimeout(async () => {
    try {
      let customers = [];
      if (api?.customers?.list) {
        const res = await api.customers.list({ search: trimmed, size: 6 });
        customers = res.content || (Array.isArray(res) ? res : []);
      } else {
        const token = Auth?.getToken() || '';
        const raw = await fetch(`/api/v1/customers?search=${encodeURIComponent(trimmed)}&size=6`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (raw.ok) {
          const data = await raw.json();
          customers = data.content || (Array.isArray(data) ? data : []);
        }
      }

      window._customerSearchCache = customers;

      let html = '';
      if (customers.length > 0) {
        html += customers.map((c, idx) => `
          <div class="search-item-row" onclick="selectCustomerByIndex(${idx})">
            <div>
              <span class="search-item-name">${escapeHTML(c.name)}</span>
              <span class="search-item-phone">${escapeHTML(c.mobileNumber || c.mobile || 'No Mobile')}</span>
            </div>
            <span style="font-size:9.5px;color:var(--lime);font-weight:700;">${escapeHTML(c.tier || 'CLIENT')}</span>
          </div>
        `).join('');
      } else {
        html += `
          <div style="padding:10px;font-size:11.5px;color:var(--text-muted);text-align:center;">
            No existing client found matching "${escapeHTML(trimmed)}"
          </div>
        `;
      }

      // Actionable Walk-In Client Fallback — prevents user from being blocked
      html += `
        <div class="search-item-row" onclick="selectWalkInCustomer('${encodeURIComponent(trimmed)}')" style="background:rgba(184,255,61,0.06);border-top:1px dashed rgba(184,255,61,0.25);">
          <div>
            <span class="search-item-name" style="color:var(--lime);">+ Use "${escapeHTML(trimmed)}" as Walk-in Client</span>
            <span class="search-item-phone">Register as direct atelier client</span>
          </div>
          <span style="font-size:9px;color:var(--lime);font-weight:700;border:1px solid rgba(184,255,61,0.3);padding:2px 6px;border-radius:4px;">DIRECT</span>
        </div>
      `;

      dropdown.innerHTML = html;
      dropdown.style.display = 'block';
    } catch (e) {
      console.warn('[New Garment] Customer search failed:', e);
    }
  }, 220);
};

window.selectCustomerByIndex = function(idx) {
  const c = window._customerSearchCache ? window._customerSearchCache[idx] : null;
  if (!c) return;
  selectCustomer(c.name, c.mobileNumber || c.mobile || '');
};

window.selectWalkInCustomer = function(encodedName) {
  const name = decodeURIComponent(encodedName || '').trim();
  if (!name) return;
  selectCustomer(name, '+91 Walk-in Client');
  showToast(`Selected "${name}" as walk-in client.`, 'info');
};

window.selectCustomer = async function(name, phone) {
  const hiddenName = document.getElementById('hiddenCustomerName');
  const hiddenMobile = document.getElementById('hiddenCustomerMobile');
  const searchInput = document.getElementById('txtCustomerSearch');
  const dropdown = document.getElementById('customerDropdownList');
  const selectedPill = document.getElementById('selectedCustomerCard');

  if (hiddenName) hiddenName.value = name;
  if (hiddenMobile) hiddenMobile.value = phone;
  if (searchInput) searchInput.value = '';
  if (dropdown) dropdown.style.display = 'none';

  // Display selected customer badge
  if (selectedPill) {
    document.getElementById('custAvatarChar').textContent = (name || 'C').charAt(0).toUpperCase();
    document.getElementById('custSelectedName').textContent = name;
    document.getElementById('custSelectedPhone').textContent = phone || 'Direct Client';
    selectedPill.style.display = 'flex';
  }

  // Auto-suggest recent order if order field is empty
  const txtOrder = document.getElementById('txtOrderCode');
  if (txtOrder && (!txtOrder.value || txtOrder.value.trim() === '')) {
    txtOrder.value = `ORD-${Math.floor(2000 + Math.random() * 8000)}`;
  }

  updateLivePreview();
};

window.clearSelectedCustomer = function() {
  document.getElementById('hiddenCustomerName').value = '';
  document.getElementById('hiddenCustomerMobile').value = '';
  document.getElementById('selectedCustomerCard').style.display = 'none';
  document.getElementById('txtCustomerSearch').value = '';
  updateLivePreview();
};

function setupOutsideClickListener() {
  document.addEventListener('click', (e) => {
    const searchInput = document.getElementById('txtCustomerSearch');
    const dropdown = document.getElementById('customerDropdownList');
    if (dropdown && dropdown.style.display !== 'none') {
      if (!dropdown.contains(e.target) && e.target !== searchInput) {
        dropdown.style.display = 'none';
      }
    }
  });
}

// ── Spec Helper Tags & Presets ─────────────────────────────────────────────
window.appendSpec = function(tag) {
  const txtSpecs = document.getElementById('txtSpecs');
  if (!txtSpecs) return;

  const current = txtSpecs.value.trim();
  if (!current) {
    txtSpecs.value = tag;
  } else if (!current.toLowerCase().includes(tag.toLowerCase())) {
    txtSpecs.value = `${current}, ${tag}`;
  }
  updateLivePreview();
};

// ── Image Upload & Dropzone Management ─────────────────────────────────────
window.triggerImageUpload = function() {
  const fileInput = document.getElementById('fileGarmentImage');
  if (fileInput) fileInput.click();
};

window.handleFileSelect = function(e) {
  const file = e.target?.files?.[0];
  if (file) processUploadedFile(file);
};

window.handleDragOver = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('imageDropzone');
  if (dropzone) dropzone.classList.add('drag-active');
};

window.handleDragLeave = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('imageDropzone');
  if (dropzone) dropzone.classList.remove('drag-active');
};

window.handleDrop = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('imageDropzone');
  if (dropzone) dropzone.classList.remove('drag-active');

  const file = e.dataTransfer?.files?.[0];
  if (file) processUploadedFile(file);
};

// ── Preview Hero Drag & Drop ───────────────────────────────────────────────
window.handleDragOverPreview = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const wrap = document.getElementById('previewHeroWrap');
  if (wrap) wrap.classList.add('drag-active');
};

window.handleDragLeavePreview = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const wrap = document.getElementById('previewHeroWrap');
  if (wrap) wrap.classList.remove('drag-active');
};

window.handleDropPreview = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const wrap = document.getElementById('previewHeroWrap');
  if (wrap) wrap.classList.remove('drag-active');

  const file = e.dataTransfer?.files?.[0];
  if (file) processUploadedFile(file);
};

function processUploadedFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload a valid image file (PNG, JPG, WEBP).');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert(`File ${file.name} exceeds the 5MB limit. Please choose a smaller file.`);
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const txtImg = document.getElementById('txtImageUrl');
    if (txtImg) txtImg.value = dataUrl;

    // Show Dropzone Preview
    const emptyState = document.getElementById('dropzoneEmpty');
    const previewState = document.getElementById('dropzonePreview');
    const thumb = document.getElementById('uploadedImgThumb');
    const nameEl = document.getElementById('uploadedFileName');
    const sizeEl = document.getElementById('uploadedFileSize');

    if (emptyState) emptyState.style.display = 'none';
    if (previewState) previewState.style.display = 'flex';
    if (thumb) thumb.src = dataUrl;
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = `${(file.size / 1024).toFixed(1)} KB • Stored in assets/garments`;

    updateLivePreview();

    // Persist directly to front end/assets/garments/ on backend
    const garmentCode = document.getElementById('txtGarmentCode')?.value || 'GAR';
    if (typeof api !== 'undefined' && api?.garments?.uploadImage) {
      api.garments.uploadImage(file, garmentCode)
        .then((res) => {
          if (res && res.imageUrl) {
            const txtImg = document.getElementById('txtImageUrl');
            if (txtImg) txtImg.value = res.imageUrl;
            console.log('[NewGarment] Saved to assets/garments:', res.imageUrl);
          }
        })
        .catch((err) => {
          console.warn('[NewGarment] Offline or local storage fallback:', err);
        });
    }
  };
  reader.readAsDataURL(file);
}

window.removeUploadedImage = function() {
  const fileInput = document.getElementById('fileGarmentImage');
  const txtImg = document.getElementById('txtImageUrl');
  const emptyState = document.getElementById('dropzoneEmpty');
  const previewState = document.getElementById('dropzonePreview');

  if (fileInput) fileInput.value = '';
  if (txtImg) txtImg.value = '';
  if (emptyState) emptyState.style.display = 'flex';
  if (previewState) previewState.style.display = 'none';

  updateLivePreview();
};

window.toggleUrlInput = function() {
  const container = document.getElementById('urlInputContainer');
  if (container) {
    container.style.display = container.style.display === 'none' ? 'flex' : 'none';
    if (container.style.display === 'flex') {
      document.getElementById('txtImageUrl')?.focus();
    }
  }
};

window.handleUrlInputChange = function() {
  const url = document.getElementById('txtImageUrl')?.value?.trim();
  if (url) {
    const emptyState = document.getElementById('dropzoneEmpty');
    const previewState = document.getElementById('dropzonePreview');
    const thumb = document.getElementById('uploadedImgThumb');
    const nameEl = document.getElementById('uploadedFileName');
    const sizeEl = document.getElementById('uploadedFileSize');

    if (emptyState) emptyState.style.display = 'none';
    if (previewState) previewState.style.display = 'flex';
    if (thumb) thumb.src = url;
    if (nameEl) nameEl.textContent = url.split('/').pop() || 'Artwork URL';
    if (sizeEl) sizeEl.textContent = 'Linked Artwork';
  }
  updateLivePreview();
};

window.setImagePreset = function(url) {
  const txtImg = document.getElementById('txtImageUrl');
  if (txtImg) txtImg.value = url;

  const emptyState = document.getElementById('dropzoneEmpty');
  const previewState = document.getElementById('dropzonePreview');
  const thumb = document.getElementById('uploadedImgThumb');
  const nameEl = document.getElementById('uploadedFileName');
  const sizeEl = document.getElementById('uploadedFileSize');

  if (emptyState) emptyState.style.display = 'none';
  if (previewState) previewState.style.display = 'flex';
  if (thumb) thumb.src = url;
  if (nameEl) nameEl.textContent = url.split('/').pop();
  if (sizeEl) sizeEl.textContent = 'Atelier Reference';

  updateLivePreview();
};

window.handleTypeChange = function() {
  const selType = document.getElementById('selGarmentType')?.value;
  const txtTitle = document.getElementById('txtTitle');

  // If title is blank or generic, auto-fill standard title
  if (txtTitle && (!txtTitle.value || txtTitle.value.includes('Bespoke') || txtTitle.value.includes('Royal') || txtTitle.value.includes('Heritage') || txtTitle.value.includes('Pure') || txtTitle.value.includes('Raw Silk') || txtTitle.value.includes('Banarasi') || txtTitle.value.includes('Architectural'))) {
    const titles = {
      BRIDAL: 'Royal Zardozi Bridal Blouse',
      LEHENGA: 'Heritage Embroidered Bridal Lehenga',
      ANARKALI: 'Pure Georgette Chikankari Anarkali',
      SHERWANI: 'Raw Silk Embroidered Groom Sherwani',
      SAREE_BLOUSE: 'Banarasi Organza Pre-Draped Saree',
      KURTA_SET: 'Pure Handloom Chikankari Kurta Set',
      GOWN: 'Architectural Sculpted Evening Gown',
      INDO_WESTERN: 'Heritage Zardozi Gharara Ensemble',
      BESPOKE: 'Bespoke Custom Silhouette'
    };
    txtTitle.value = titles[selType] || 'Custom Bespoke Garment';
  }

  // Auto-suggest matching existing image if no custom file uploaded
  const fileInput = document.getElementById('fileGarmentImage');
  const isUploadedFile = fileInput && fileInput.files && fileInput.files.length > 0;
  if (!isUploadedFile) {
    const typeImages = {
      BRIDAL: '../../assets/garments/bridal_blouse_zardozi.jpg',
      LEHENGA: '../../assets/garments/heritage_lehenga_pink.jpg',
      ANARKALI: '../../assets/garments/anarkali_chikankari.jpg',
      SHERWANI: '../../assets/garments/raw_silk_sherwani.jpg',
      SAREE_BLOUSE: '../../assets/garments/banarasi_organza_saree.jpg',
      KURTA_SET: '../../assets/garments/anarkali_chikankari.jpg',
      GOWN: '../../assets/garments/champagne_evening_gown.jpg',
      INDO_WESTERN: '../../assets/garments/zardozi_handwork.jpg',
      BESPOKE: '../../assets/garments/bridal_blouse_zardozi.jpg'
    };
    if (typeImages[selType] && typeof window.setImagePreset === 'function') {
      window.setImagePreset(typeImages[selType]);
    }
  }

  updateLivePreview();
};

// ── Live Preview & Financial Calculations ──────────────────────────────────
window.calculateBalance = function() {
  const total = Number(document.getElementById('numTotalAmount')?.value || 0);
  const paid = Number(document.getElementById('numPaidAmount')?.value || 0);
  const balance = Math.max(0, total - paid);

  const lblBalance = document.getElementById('lblBalanceDue');
  if (lblBalance) {
    lblBalance.textContent = `₹${balance.toLocaleString('en-IN')}`;
  }

  const badgePayment = document.getElementById('badgePaymentStatus');
  if (badgePayment) {
    if (paid >= total && total > 0) {
      badgePayment.textContent = 'PAID IN FULL';
      badgePayment.style.background = 'rgba(16, 185, 129, 0.16)';
      badgePayment.style.color = '#34d399';
    } else if (paid > 0) {
      badgePayment.textContent = 'PARTIAL ADVANCE';
      badgePayment.style.background = 'rgba(245, 158, 11, 0.16)';
      badgePayment.style.color = '#fbbf24';
    } else {
      badgePayment.textContent = 'PENDING';
      badgePayment.style.background = 'rgba(239, 68, 68, 0.16)';
      badgePayment.style.color = '#f87171';
    }
  }

  const previewPrice = document.getElementById('previewPrice');
  if (previewPrice) {
    previewPrice.textContent = `₹${total.toLocaleString('en-IN')}`;
  }
};

window.updateLivePreview = function() {
  const code = document.getElementById('txtGarmentCode')?.value || 'GAR-2026-0001';
  const title = document.getElementById('txtTitle')?.value || 'Bespoke Garment';
  const stage = document.getElementById('selProductionStage')?.value || 'Stitching';
  const customer = document.getElementById('hiddenCustomerName')?.value || '—';
  const order = document.getElementById('txtOrderCode')?.value || '—';
  const tailor = document.getElementById('selAssignedTo')?.value || 'Ravi M';
  const due = document.getElementById('txtDueDate')?.value || '';
  const imgUrl = document.getElementById('txtImageUrl')?.value?.trim();
  const priority = document.querySelector('input[name="priority"]:checked')?.value || 'NORMAL';

  // Live Inspector Updates
  const previewCode = document.getElementById('previewCode');
  if (previewCode) previewCode.textContent = code;

  const previewStage = document.getElementById('previewStage');
  if (previewStage) previewStage.textContent = stage.toUpperCase();

  const previewTitle = document.getElementById('previewTitle');
  if (previewTitle) previewTitle.textContent = title;

  const previewCust = document.getElementById('previewCustomer');
  if (previewCust) previewCust.innerHTML = `<i data-lucide="user" style="width:12px;height:12px;"></i> Client: ${escapeHTML(customer)}`;

  const previewOrd = document.getElementById('previewOrder');
  if (previewOrd) previewOrd.innerHTML = `<i data-lucide="package" style="width:12px;height:12px;"></i> Order: ${escapeHTML(order)}`;

  const previewTailor = document.getElementById('previewTailor');
  if (previewTailor) previewTailor.innerHTML = `<i data-lucide="user-check" style="width:12px;height:12px;"></i> Tailor: ${escapeHTML(tailor.split(' ')[0])}`;

  const previewDue = document.getElementById('previewDelivery');
  if (previewDue) previewDue.innerHTML = `<i data-lucide="calendar" style="width:12px;height:12px;"></i> Due: ${due ? formatShortDate(due) : '—'}`;

  // Image & Upload Placeholder Toggle in Preview Card
  const previewImg = document.getElementById('previewImg');
  const previewPlaceholder = document.getElementById('previewUploadPlaceholder');
  const previewHover = document.getElementById('previewHoverOverlay');

  if (imgUrl) {
    if (previewImg) {
      previewImg.src = imgUrl;
      previewImg.style.display = 'block';
    }
    if (previewPlaceholder) previewPlaceholder.style.display = 'none';
    if (previewHover) previewHover.style.display = 'flex';
  } else {
    if (previewImg) {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
    if (previewPlaceholder) previewPlaceholder.style.display = 'flex';
    if (previewHover) previewHover.style.display = 'none';
  }

  const previewPriority = document.getElementById('previewPriority');
  if (previewPriority) {
    previewPriority.textContent = `${priority} PRIORITY`;
    previewPriority.style.color = priority === 'URGENT' ? '#f87171' : (priority === 'HIGH' ? '#fbbf24' : '#34d399');
  }

  if (window.lucide) window.lucide.createIcons();
};

// ── Form Submission Handler ────────────────────────────────────────────────
window.handleGarmentSubmit = async function(e) {
  e.preventDefault();

  const btnSubmit = document.getElementById('btnSubmitGarment');
  const originalHtml = btnSubmit.innerHTML;

  // 1. Validate Required Fields
  const garmentCode = document.getElementById('txtGarmentCode')?.value?.trim();
  const title = document.getElementById('txtTitle')?.value?.trim();
  const customerName = document.getElementById('hiddenCustomerName')?.value?.trim();
  const customerMobile = document.getElementById('hiddenCustomerMobile')?.value?.trim();
  const orderCode = document.getElementById('txtOrderCode')?.value?.trim();
  const totalAmount = Number(document.getElementById('numTotalAmount')?.value || 0);
  const dueDate = document.getElementById('txtDueDate')?.value;

  if (!customerName) {
    showToast('Please select or search for a customer to link this garment.', 'error');
    document.getElementById('txtCustomerSearch')?.focus();
    return;
  }
  if (!orderCode) {
    showToast('Please enter an Order Code.', 'error');
    document.getElementById('txtOrderCode')?.focus();
    return;
  }
  if (!totalAmount || totalAmount <= 0) {
    showToast('Please specify the total price amount.', 'error');
    document.getElementById('numTotalAmount')?.focus();
    return;
  }
  if (!dueDate) {
    showToast('Please select a commitment Due Date.', 'error');
    document.getElementById('txtDueDate')?.focus();
    return;
  }

  // 2. Prepare Payload
  const paidAmount = Number(document.getElementById('numPaidAmount')?.value || 0);
  let paymentStatus = 'PENDING';
  if (paidAmount >= totalAmount && totalAmount > 0) paymentStatus = 'PAID';
  else if (paidAmount > 0) paymentStatus = 'PARTIAL';

  const payload = {
    garmentCode: garmentCode || `GAR-${Date.now() % 100000}`,
    title: title || 'Bespoke Garment',
    garmentType: document.getElementById('selGarmentType')?.value || 'BESPOKE',
    collectionName: document.getElementById('selCollection')?.value || 'Main Edit',
    designCode: document.getElementById('txtDesignCode')?.value?.trim() || 'Custom Silhouette',
    customerName: customerName,
    customerMobile: customerMobile || '+91 98000 00000',
    orderCode: orderCode,
    branch: document.getElementById('selBranch')?.value || 'Main Branch',
    specs: document.getElementById('txtSpecs')?.value?.trim() || 'Standard bespoke tailoring specs',
    imageUrl: document.getElementById('txtImageUrl')?.value?.trim() || '../../assets/garments/bridal_blouse_zardozi.jpg',
    notes: document.getElementById('txtNotes')?.value?.trim() || '',
    productionStage: document.getElementById('selProductionStage')?.value || 'Stitching',
    priority: document.querySelector('input[name="priority"]:checked')?.value || 'NORMAL',
    assignedTo: document.getElementById('selAssignedTo')?.value || 'Ravi M',
    designer: document.getElementById('selDesigner')?.value || 'Meera S',
    materialStatus: document.getElementById('selMaterialStatus')?.value || 'READY',
    trialDate: document.getElementById('txtTrialDate')?.value || null,
    dueDate: dueDate,
    totalAmount: totalAmount,
    paidAmount: paidAmount,
    paymentStatus: paymentStatus,
    status: 'IN_PRODUCTION'
  };

  try {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span>Registering Garment...</span>`;

    let created = null;
    if (api?.garments?.create) {
      created = await api.garments.create(payload);
    } else {
      const token = Auth?.getToken() || '';
      const res = await fetch('/api/v1/garments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Failed with HTTP ${res.status}`);
      }
      created = await res.json();
    }

    createdGarmentRecord = created || payload;

    // Cache in sessionStorage for immediate Garment 360 consumption
    sessionStorage.setItem('haulo_selected_garment', JSON.stringify(createdGarmentRecord));

    // Clear saved draft on successful registration
    localStorage.removeItem('haulo_garment_draft');

    // Show Success Modal
    openSuccessModal(createdGarmentRecord);

  } catch (err) {
    console.error('[New Garment] Submission error:', err);
    showToast(`Could not create garment: ${err.message || err}`, 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = originalHtml;
  }
};

function openSuccessModal(g) {
  const modal = document.getElementById('successModal');
  const desc = document.getElementById('modalSuccessDesc');
  const btn360 = document.getElementById('btnLaunch360Modal');

  if (desc) {
    desc.textContent = `Garment ${g.garmentCode || '—'} for ${g.customerName || 'Client'} has been registered and routed to atelier production.`;
  }

  if (btn360) {
    btn360.onclick = () => {
      const q = g.id ? `id=${g.id}&code=${g.garmentCode}` : `code=${g.garmentCode}`;
      window.location.href = `../garaments 360/garament360.html?${q}`;
    };
  }

  if (modal) modal.classList.add('active');
  if (window.lucide) window.lucide.createIcons();
}

window.createAnotherGarment = function() {
  document.getElementById('successModal')?.classList.remove('active');
  document.getElementById('newGarmentForm')?.reset();
  clearSelectedCustomer();
  generateNewGarmentCode();
  setDefaultDates();
  updateLivePreview();
  calculateBalance();
};

window.saveFormDraft = function() {
  const draft = {
    garmentCode: document.getElementById('txtGarmentCode')?.value,
    title: document.getElementById('txtTitle')?.value,
    garmentType: document.getElementById('selGarmentType')?.value,
    collection: document.getElementById('selCollection')?.value,
    designCode: document.getElementById('txtDesignCode')?.value,
    customerName: document.getElementById('hiddenCustomerName')?.value,
    customerMobile: document.getElementById('hiddenCustomerMobile')?.value,
    orderCode: document.getElementById('txtOrderCode')?.value,
    branch: document.getElementById('selBranch')?.value,
    specs: document.getElementById('txtSpecs')?.value,
    imageUrl: document.getElementById('txtImageUrl')?.value,
    notes: document.getElementById('txtNotes')?.value,
    productionStage: document.getElementById('selProductionStage')?.value,
    priority: document.querySelector('input[name="priority"]:checked')?.value || 'NORMAL',
    assignedTo: document.getElementById('selAssignedTo')?.value,
    designer: document.getElementById('selDesigner')?.value,
    dueDate: document.getElementById('txtDueDate')?.value,
    trialDate: document.getElementById('txtTrialDate')?.value,
    materialStatus: document.getElementById('selMaterialStatus')?.value,
    totalAmount: document.getElementById('numTotalAmount')?.value,
    paidAmount: document.getElementById('numPaidAmount')?.value,
    timestamp: new Date().toISOString()
  };

  try {
    localStorage.setItem('haulo_garment_draft', JSON.stringify(draft));
    showToast('Garment draft saved locally.', 'success');
  } catch (err) {
    showToast('Could not save draft: storage full', 'error');
  }
};

window.checkAndRestoreDraft = function() {
  const raw = localStorage.getItem('haulo_garment_draft');
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    if (!draft || !draft.garmentCode) return;

    if (confirm(`A saved draft for "${draft.title || draft.garmentCode}" exists. Restore draft?`)) {
      if (draft.garmentCode && document.getElementById('txtGarmentCode')) document.getElementById('txtGarmentCode').value = draft.garmentCode;
      if (draft.title && document.getElementById('txtTitle')) document.getElementById('txtTitle').value = draft.title;
      if (draft.garmentType && document.getElementById('selGarmentType')) document.getElementById('selGarmentType').value = draft.garmentType;
      if (draft.collection && document.getElementById('selCollection')) document.getElementById('selCollection').value = draft.collection;
      if (draft.designCode && document.getElementById('txtDesignCode')) document.getElementById('txtDesignCode').value = draft.designCode;
      if (draft.customerName) selectCustomer(draft.customerName, draft.customerMobile || '');
      if (draft.orderCode && document.getElementById('txtOrderCode')) document.getElementById('txtOrderCode').value = draft.orderCode;
      if (draft.branch && document.getElementById('selBranch')) document.getElementById('selBranch').value = draft.branch;
      if (draft.specs && document.getElementById('txtSpecs')) document.getElementById('txtSpecs').value = draft.specs;
      if (draft.imageUrl && document.getElementById('txtImageUrl')) {
        setImagePreset(draft.imageUrl);
      }
      if (draft.notes && document.getElementById('txtNotes')) document.getElementById('txtNotes').value = draft.notes;
      if (draft.productionStage && document.getElementById('selProductionStage')) document.getElementById('selProductionStage').value = draft.productionStage;
      if (draft.priority) {
        const rad = document.querySelector(`input[name="priority"][value="${draft.priority}"]`);
        if (rad) rad.checked = true;
      }
      if (draft.assignedTo && document.getElementById('selAssignedTo')) document.getElementById('selAssignedTo').value = draft.assignedTo;
      if (draft.designer && document.getElementById('selDesigner')) document.getElementById('selDesigner').value = draft.designer;
      if (draft.dueDate && document.getElementById('txtDueDate')) document.getElementById('txtDueDate').value = draft.dueDate;
      if (draft.trialDate && document.getElementById('txtTrialDate')) document.getElementById('txtTrialDate').value = draft.trialDate;
      if (draft.materialStatus && document.getElementById('selMaterialStatus')) document.getElementById('selMaterialStatus').value = draft.materialStatus;
      if (draft.totalAmount && document.getElementById('numTotalAmount')) document.getElementById('numTotalAmount').value = draft.totalAmount;
      if (draft.paidAmount && document.getElementById('numPaidAmount')) document.getElementById('numPaidAmount').value = draft.paidAmount;

      updateLivePreview();
      calculateBalance();
      showToast('Draft restored successfully.', 'success');
    }
  } catch (e) {
    console.warn('[New Garment] Draft parse error:', e);
  }
};

window.showToast = function(message, type = 'info') {
  if (window.HauloNotifications && typeof window.HauloNotifications.notify === 'function') {
    window.HauloNotifications.notify({
      title: type === 'error' ? 'Validation Error' : (type === 'success' ? 'Success' : 'Notice'),
      message: message,
      type: type
    });
    return;
  }

  const container = document.getElementById('toastContainer');
  if (!container) {
    console.warn(`[Toast ${type}]`, message);
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    background: ${type === 'error' ? 'rgba(239, 68, 68, 0.95)' : (type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(30, 41, 59, 0.95)')};
    color: #fff;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    backdrop-filter: blur(8px);
    z-index: 9999;
  `;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// ── Stepper Navigation ─────────────────────────────────────────────────────
window.jumpToStep = function(stepNum) {
  const cards = {
    1: 'cardIdentity',
    2: 'cardCustomer',
    3: 'cardBlueprint',
    4: 'cardRouting',
    5: 'cardSchedule'
  };

  const targetId = cards[stepNum];
  const targetEl = document.getElementById(targetId);
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setActiveStepNode(stepNum);
  }
};

function setActiveStepNode(stepNum) {
  const nodes = document.querySelectorAll('.workflow-stepper .step-node');
  nodes.forEach(n => {
    const s = Number(n.dataset.step);
    n.classList.toggle('active', s === stepNum);
    n.classList.toggle('completed', s < stepNum);
  });
}

function setupStepperScrollSpy() {
  const scrollContainer = document.getElementById('newGarmentScroll');
  if (!scrollContainer) return;

  scrollContainer.addEventListener('scroll', () => {
    // Simple top-based spy
    const stepCards = [
      { step: 1, el: document.getElementById('cardIdentity') },
      { step: 2, el: document.getElementById('cardCustomer') },
      { step: 3, el: document.getElementById('cardBlueprint') },
      { step: 4, el: document.getElementById('cardRouting') },
      { step: 5, el: document.getElementById('cardSchedule') }
    ];

    const containerTop = scrollContainer.scrollTop;
    for (const sc of stepCards) {
      if (sc.el && sc.el.offsetTop <= containerTop + 200) {
        setActiveStepNode(sc.step);
      }
    }
  }, { passive: true });
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatShortDate(dStr) {
  if (!dStr) return '';
  const d = new Date(dStr);
  if (isNaN(d.getTime())) return dStr;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
}
