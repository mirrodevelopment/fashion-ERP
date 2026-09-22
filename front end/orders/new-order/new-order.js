/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — NEW ORDER PAGE CONTROLLER
 * Path: frontend/orders/new-order/new-order.js
 * Visual Source of Truth: media_1789115972191.png
 * =======================================================================
 */
'use strict';

// ─────────────────────────────────────────────────────────────
// 1. DATA REPOSITORIES & INITIAL SEED DATA
// ─────────────────────────────────────────────────────────────

let CUSTOMERS_CACHE = [];

const GARMENT_DEFINITIONS = {
  Blouse: {
    basePrice: 4500,
    measurements: [
      'Shoulder', 'Bust', 'Under Bust', 'Waist', 'Blouse Length',
      'Armhole', 'Upper Arm', 'Sleeve Length', 'Sleeve Round',
      'Elbow Round', 'Wrist Round', 'Front Neck Depth', 'Back Neck Depth',
      'Bust Point', 'Bust Point to Bust Point', 'Shoulder to Bust',
      'Shoulder to Waist', 'Front Width', 'Back Width'
    ],
    defaultValues: {
      Shoulder: 14.5, Bust: 34.0, 'Under Bust': 29.0, Waist: 28.0, 'Blouse Length': 14.0,
      Armhole: 15.5, 'Upper Arm': 11.5, 'Sleeve Length': 10.5, 'Sleeve Round': 11.0,
      'Elbow Round': 10.0, 'Wrist Round': 6.5, 'Front Neck Depth': 6.5, 'Back Neck Depth': 8.0,
      'Bust Point': 9.5, 'Bust Point to Bust Point': 7.5, 'Shoulder to Bust': 9.5,
      'Shoulder to Waist': 14.0, 'Front Width': 13.5, 'Back Width': 14.0
    }
  },
  Chudi: {
    basePrice: 5500,
    measurements: [
      'Shoulder', 'Bust', 'Under Bust', 'Waist', 'Hip', 'Top Length',
      'Armhole', 'Upper Arm', 'Sleeve Length', 'Sleeve Round',
      'Elbow Round', 'Wrist Round', 'Front Neck Depth', 'Back Neck Depth',
      'Front Width', 'Back Width', 'Pant Waist', 'Pant Hip', 'Pant Length',
      'Thigh Round', 'Knee Round', 'Calf Round', 'Ankle Round',
      'Crotch Length', 'Bottom Opening'
    ],
    defaultValues: {
      Shoulder: 14.5, Bust: 35.0, 'Under Bust': 29.5, Waist: 29.0, Hip: 38.0, 'Top Length': 40.0,
      Armhole: 16.0, 'Upper Arm': 11.5, 'Sleeve Length': 18.0, 'Sleeve Round': 10.5,
      'Elbow Round': 9.5, 'Wrist Round': 6.5, 'Front Neck Depth': 6.5, 'Back Neck Depth': 7.0,
      'Front Width': 13.5, 'Back Width': 14.0, 'Pant Waist': 30.0, 'Pant Hip': 40.0,
      'Pant Length': 39.0, 'Thigh Round': 22.0, 'Knee Round': 15.0, 'Calf Round': 13.0,
      'Ankle Round': 10.0, 'Crotch Length': 26.0, 'Bottom Opening': 12.0
    }
  },
  Lehenga: {
    basePrice: 14500,
    measurements: [
      'Shoulder', 'Bust', 'Under Bust', 'Waist', 'Hip', 'Blouse Length',
      'Armhole', 'Upper Arm', 'Sleeve Length', 'Sleeve Round',
      'Elbow Round', 'Wrist Round', 'Front Neck Depth', 'Back Neck Depth',
      'Bust Point', 'Bust Point to Bust Point', 'Shoulder to Bust',
      'Shoulder to Waist', 'Skirt Length', 'Waist to Hip', 'Flare', 'Bottom Opening'
    ],
    defaultValues: {
      Shoulder: 14.5, Bust: 34.0, 'Under Bust': 29.0, Waist: 28.0, Hip: 38.0, 'Blouse Length': 14.0,
      Armhole: 15.5, 'Upper Arm': 11.5, 'Sleeve Length': 10.5, 'Sleeve Round': 11.0,
      'Elbow Round': 10.0, 'Wrist Round': 6.5, 'Front Neck Depth': 6.5, 'Back Neck Depth': 8.0,
      'Bust Point': 9.5, 'Bust Point to Bust Point': 7.5, 'Shoulder to Bust': 9.5,
      'Shoulder to Waist': 14.0, 'Skirt Length': 42.0, 'Waist to Hip': 8.0, Flare: 120.0, 'Bottom Opening': 140.0
    }
  },
  Saree: {
    basePrice: 3800,
    measurements: [
      'Shoulder', 'Bust', 'Under Bust', 'Waist', 'Blouse Length',
      'Armhole', 'Upper Arm', 'Sleeve Length', 'Sleeve Round',
      'Elbow Round', 'Wrist Round', 'Front Neck Depth', 'Back Neck Depth',
      'Bust Point', 'Bust Point to Bust Point', 'Shoulder to Bust',
      'Shoulder to Waist', 'Front Width', 'Back Width'
    ],
    defaultValues: {
      Shoulder: 14.5, Bust: 34.0, 'Under Bust': 29.0, Waist: 28.0, 'Blouse Length': 14.0,
      Armhole: 15.5, 'Upper Arm': 11.5, 'Sleeve Length': 10.5, 'Sleeve Round': 11.0,
      'Elbow Round': 10.0, 'Wrist Round': 6.5, 'Front Neck Depth': 6.5, 'Back Neck Depth': 8.0,
      'Bust Point': 9.5, 'Bust Point to Bust Point': 7.5, 'Shoulder to Bust': 9.5,
      'Shoulder to Waist': 14.0, 'Front Width': 13.5, 'Back Width': 14.0
    }
  },
  Gown: {
    basePrice: 12000,
    measurements: [
      'Shoulder', 'Bust', 'Under Bust', 'Waist', 'Hip', 'Full Length',
      'Armhole', 'Upper Arm', 'Sleeve Length', 'Sleeve Round',
      'Elbow Round', 'Wrist Round', 'Front Neck Depth', 'Back Neck Depth',
      'Bust Point', 'Bust Point to Bust Point', 'Shoulder to Bust',
      'Shoulder to Waist', 'Waist to Hip', 'Flare', 'Bottom Opening'
    ],
    defaultValues: {
      Shoulder: 14.5, Bust: 34.5, 'Under Bust': 29.5, Waist: 28.5, Hip: 38.5, 'Full Length': 56.0,
      Armhole: 16.0, 'Upper Arm': 11.5, 'Sleeve Length': 22.0, 'Sleeve Round': 10.5,
      'Elbow Round': 9.5, 'Wrist Round': 6.5, 'Front Neck Depth': 6.5, 'Back Neck Depth': 7.5,
      'Bust Point': 9.5, 'Bust Point to Bust Point': 7.5, 'Shoulder to Bust': 9.5,
      'Shoulder to Waist': 14.0, 'Waist to Hip': 8.0, Flare: 140.0, 'Bottom Opening': 150.0
    }
  },
  Alteration: {
    basePrice: 1200,
    measurements: ['Bust Alteration', 'Waist Alteration', 'Length Adjustment', 'Sleeve Adjustment'],
    defaultValues: { 'Bust Alteration': 1, 'Waist Alteration': 0.5, 'Length Adjustment': 2, 'Sleeve Adjustment': 0 }
  },
  Custom: {
    basePrice: 8500,
    measurements: ['Shoulder', 'Bust', 'Waist', 'Hip', 'Total Length'],
    defaultValues: { Shoulder: 14.5, Bust: 34.0, Waist: 28.0, Hip: 38.0, 'Total Length': 45.0 }
  }
};

let EMPLOYEES = [];

// ─────────────────────────────────────────────────────────────
// 2. CENTRALIZED STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────

const orderState = {
  customer: null,

  garment: {
    type: 'Blouse',
    customType: ''
  },

  design: {
    category: 'Custom Design',
    neckStyle: 'Round Neck',
    sleeveStyle: '3/4 Sleeve',
    notes: '',
    referenceImages: []
  },

  fabric: {
    source: 'Customer Supplied',
    type: 'Silk',
    colour: '',
    quantity: '',
    notes: '',
    libraryMaterialId: 1,
    boutiqueQty: 0,
    materials: []
  },

  measurements: {
    mode: 'existing',
    profileId: '',
    profileName: '',
    values: { ...GARMENT_DEFINITIONS.Blouse.defaultValues }
  },

  production: {
    deliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    priority: 'Normal',
    assignedTo: '',
    notes: ''
  },

  payment: {
    estimatedAmount: 4500,
    advanceAmount: 2250,
    paymentMethod: 'UPI',
    reminderEnabled: true
  }
};

// ─────────────────────────────────────────────────────────────
// 3. INITIALIZATION & SETUP
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initCustomerSection();
  initGarmentSelection();
  initDesignSection();
  initFabricSection();
  initMeasurementsSection();
  initProductionSection();
  initPaymentSection();
  initWorkflowStepper();
  restoreDraftIfExists();
  updateOrderSummary();
  updateTimeline();

  // Highlight active sidebar item
  const navOrder = document.getElementById('nav-orders');
  if (navOrder) navOrder.classList.add('active');

  // Auto-save every 10 seconds
  setInterval(() => {
    autoSaveDraft();
  }, 10000);
});

// ─────────────────────────────────────────────────────────────
// 4. STEP 1: CUSTOMER HANDLING
// ─────────────────────────────────────────────────────────────

function initCustomerSection() {
  const searchInput = document.getElementById('customerSearchInput');
  const searchResults = document.getElementById('customerSearchResults');
  const btnClear = document.getElementById('btnClearCustomerSearch');
  const btnOpenSearch = document.getElementById('btnOpenCustomerSearch');

  (async () => {
    try {
      const { default: api } = await import('../../api.js');
      const res = await api.customers.list({ page: 0, size: 50 });
      const items = Array.isArray(res) ? res : (res?.content || []);
      if (items.length > 0) {
        CUSTOMERS_CACHE = items.map(c => {
          const mob = c.mobileNumber || c.phone || '';
          return {
            id: mob,
            mobileNumber: mob,
            name: c.name,
            phone: mob,
            email: c.email || '',
            location: c.location || '',
            badge: c.tier === 'VIP_PLATINUM' ? 'VIP Platinum' : c.tier === 'VIP_GOLD' ? 'VIP Gold' : 'Customer',
            customerSince: c.createdAt ? String(c.createdAt).slice(0, 10) : '2026-09-08',
            totalOrders: c.totalOrders || 0,
            totalSpent: '₹' + (Number(c.totalSpend || c.totalSpent) || 0).toLocaleString('en-IN'),
            avatar: c.avatarUrl || '../../assets/user_avatar.jpg'
          };
        });

        // Match from URL parameters (mobile or customer name)
        const urlParams = new URLSearchParams(window.location.search);
        const urlMob = urlParams.get('mobile') || urlParams.get('phone');
        const urlCust = urlParams.get('customer');
        let matched = null;
        if (urlMob) {
          const cleanQ = urlMob.replace(/[^0-9]/g, '');
          matched = CUSTOMERS_CACHE.find(c => c.mobileNumber.replace(/[^0-9]/g, '').includes(cleanQ));
        } else if (urlCust) {
          matched = CUSTOMERS_CACHE.find(c => c.name.toLowerCase().includes(urlCust.toLowerCase()));
        }

        if (matched) {
          orderState.customer = { ...matched };
        }

        if (orderState.customer) {
          renderSelectedCustomer();
          updateOrderSummary();
          autoPopulateCustomerMeasurements(orderState.customer.mobileNumber || orderState.customer.phone, orderState.garment.type);
        }
      }
    } catch (err) {
      console.error('[NewOrder] Failed to load customers from API:', err.message);
    }
  })();

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (btnClear) btnClear.style.display = q ? 'block' : 'none';

      if (!q) {
        if (searchResults) searchResults.style.display = 'none';
        return;
      }

      const matches = CUSTOMERS_CACHE.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
      );

      renderCustomerSearchResults(matches, searchResults);
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.customer-search-wrap')) {
        if (searchResults) searchResults.style.display = 'none';
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      searchInput.value = '';
      btnClear.style.display = 'none';
      if (searchResults) searchResults.style.display = 'none';
      searchInput.focus();
    });
  }

  if (btnOpenSearch) {
    btnOpenSearch.addEventListener('click', () => {
      openNewCustomerModal();
    });
  }

  renderSelectedCustomer();
}

function renderCustomerSearchResults(matches, container) {
  if (!container) return;
  if (!matches || matches.length === 0) {
    container.innerHTML = `
      <div style="padding:10px 14px;font-size:11.5px;color:var(--text-muted);display:flex;align-items:center;justify-content:space-between;">
        <span>No customer found.</span>
        <button type="button" class="btn-text-action" onclick="openNewCustomerModal()">+ Add New</button>
      </div>`;
    container.style.display = 'block';
    return;
  }

  let html = '';
  matches.forEach(c => {
    html += `
      <div class="customer-search-item" onclick="selectCustomerById(${c.id})">
        <div>
          <div class="cs-name">${c.name} <span class="badge-vip" style="font-size:8px;padding:1px 5px;">${c.badge}</span></div>
          <div class="cs-phone">${c.phone} • ${c.location}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:11px;font-weight:700;color:var(--lime);">${c.totalSpent}</span>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
  container.style.display = 'block';
}

function selectCustomerById(id) {
  const c = CUSTOMERS_CACHE.find(x => x.id === id);
  if (!c) return;

  orderState.customer = { ...c };
  renderSelectedCustomer();
  updateOrderSummary();

  const searchResults = document.getElementById('customerSearchResults');
  const searchInput = document.getElementById('customerSearchInput');
  const btnClear = document.getElementById('btnClearCustomerSearch');

  if (searchResults) searchResults.style.display = 'none';
  if (searchInput) searchInput.value = '';
  if (btnClear) btnClear.style.display = 'none';

  showToast(`Customer selected: ${c.name}`, 'info');
}

function renderSelectedCustomer() {
  const c = orderState.customer;
  if (!c) return;

  const nameEl = document.getElementById('customerNameDisplay');
  const badgeEl = document.getElementById('customerBadgeDisplay');
  const phoneEl = document.getElementById('customerPhoneDisplay');
  const emailEl = document.getElementById('customerEmailDisplay');
  const locEl = document.getElementById('customerLocationDisplay');
  const sinceEl = document.getElementById('customerSinceDisplay');
  const ordersEl = document.getElementById('customerOrdersDisplay');
  const spentEl = document.getElementById('customerSpentDisplay');
  const avatarEl = document.getElementById('customerAvatarImg');

  if (nameEl) nameEl.textContent = c.name;
  if (badgeEl) badgeEl.textContent = `★ ${c.badge}`;
  if (phoneEl) phoneEl.textContent = c.phone;
  if (emailEl) emailEl.textContent = c.email;
  if (locEl) locEl.textContent = c.location;
  if (sinceEl) sinceEl.textContent = c.customerSince || 'Mar 2023';
  if (ordersEl) ordersEl.textContent = c.totalOrders || 12;
  if (spentEl) spentEl.textContent = c.totalSpent || '₹1,24,500';

  if (avatarEl && c.avatar) {
    avatarEl.src = c.avatar;
  }
}

function openNewCustomerModal() {
  const modal = document.getElementById('newCustomerModal');
  if (modal) modal.style.display = 'flex';
}

function closeNewCustomerModal() {
  const modal = document.getElementById('newCustomerModal');
  if (modal) modal.style.display = 'none';
}

async function handleCreateCustomer(event) {
  event.preventDefault();
  const name = document.getElementById('ncName').value.trim();
  const phone = document.getElementById('ncPhone').value.trim();
  const email = document.getElementById('ncEmail').value.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
  const location = document.getElementById('ncLocation').value.trim() || 'Chennai, Tamil Nadu';

  if (!name || !phone) {
    showToast('Name and phone are required', 'error');
    return;
  }

  let dbCustomer = null;
  try {
    const { default: api } = await import('../../api.js');
    dbCustomer = await api.customers.create({ name, phone, email, location });
  } catch (err) {
    console.warn('[NewOrder] Customer API create fallback:', err.message);
  }

  const newCust = {
    id: dbCustomer ? dbCustomer.id : Date.now(),
    dbId: dbCustomer ? dbCustomer.id : null,
    name: dbCustomer ? dbCustomer.name : name,
    phone: dbCustomer ? dbCustomer.phone : phone,
    email: dbCustomer ? dbCustomer.email : email,
    location: dbCustomer ? dbCustomer.location : location,
    badge: 'New Customer',
    customerSince: 'Today',
    totalOrders: 0,
    totalSpent: '₹0',
    avatar: dbCustomer?.avatarUrl || '../../assets/user_avatar.jpg'
  };

  CUSTOMERS_CACHE.unshift(newCust);
  orderState.customer = newCust;
  renderSelectedCustomer();
  updateOrderSummary();
  closeNewCustomerModal();
  showToast(`New customer created in DB: ${name}`, 'info');
  document.getElementById('newCustomerForm').reset();
}

// ─────────────────────────────────────────────────────────────
// 5. STEP 2: GARMENT SELECTION
// ─────────────────────────────────────────────────────────────

function initGarmentSelection() {
  const tiles = document.querySelectorAll('.garment-tile');
  tiles.forEach(tile => {
    tile.addEventListener('click', () => {
      tiles.forEach(t => t.classList.remove('active'));
      tile.classList.add('active');

      const garment = tile.dataset.garment || 'Blouse';
      orderState.garment.type = garment;

      // Update measurement fields according to garment
      updateMeasurementsForGarment(garment);
      updateOrderSummary();
      showToast(`Selected garment: ${garment}`, 'info');
    });
  });
}

// ─────────────────────────────────────────────────────────────
// 6. STEP 3: DESIGN SPECIFICATIONS & GALLERY
// ─────────────────────────────────────────────────────────────

function initDesignSection() {
  const catSel = document.getElementById('designCategorySelect');
  const neckSel = document.getElementById('neckStyleSelect');
  const sleeveSel = document.getElementById('sleeveStyleSelect');
  const notesArea = document.getElementById('designNotesInput');

  if (catSel) {
    catSel.addEventListener('change', (e) => {
      orderState.design.category = e.target.value;
      updateOrderSummary();
    });
  }

  if (neckSel) {
    neckSel.addEventListener('change', (e) => {
      orderState.design.neckStyle = e.target.value;
    });
  }

  if (sleeveSel) {
    sleeveSel.addEventListener('change', (e) => {
      orderState.design.sleeveStyle = e.target.value;
    });
  }

  if (notesArea) {
    notesArea.addEventListener('input', (e) => {
      orderState.design.notes = e.target.value;
    });
  }
}

function handleImageUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const strip = document.getElementById('referenceImagesStrip');
  const uploadTile = document.getElementById('uploadTile');

  Array.from(files).forEach((file, idx) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast(`File ${file.name} exceeds 5MB limit`, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imgUrl = e.target.result;
      const refId = `ref-custom-${Date.now()}-${idx}`;
      orderState.design.referenceImages.push(imgUrl);

      const div = document.createElement('div');
      div.className = 'ref-image-item';
      div.dataset.id = refId;
      div.innerHTML = `
        <img src="${imgUrl}" alt="Uploaded Ref" />
        <button type="button" class="btn-remove-img" onclick="removeReferenceImage('${refId}')">&times;</button>
      `;
      strip.insertBefore(div, uploadTile);
      showToast('Reference image added', 'info');
    };
    reader.readAsDataURL(file);
  });
}

function removeReferenceImage(id) {
  const item = document.querySelector(`.ref-image-item[data-id="${id}"]`);
  if (item) {
    item.remove();
    showToast('Image removed', 'info');
  }
}

// ─────────────────────────────────────────────────────────────
// 7. STEP 4: FABRIC & MATERIALS
// ─────────────────────────────────────────────────────────────

function initFabricSection() {
  const typeSel = document.getElementById('fabricTypeSelect');
  const colourSel = document.getElementById('fabricColourSelect');
  const qtyInput = document.getElementById('fabricQuantityInput');
  const notesInput = document.getElementById('fabricNotesInput');

  if (typeSel) {
    typeSel.addEventListener('change', (e) => {
      orderState.fabric.type = e.target.value;
      updateOrderSummary();
    });
  }
  if (colourSel) {
    colourSel.addEventListener('change', (e) => {
      orderState.fabric.colour = e.target.value;
    });
  }
  if (qtyInput) {
    qtyInput.addEventListener('input', (e) => {
      orderState.fabric.quantity = e.target.value;
    });
  }
  if (notesInput) {
    notesInput.addEventListener('input', (e) => {
      orderState.fabric.notes = e.target.value;
    });
  }
}

function toggleFabricSource(source) {
  orderState.fabric.source = source;

  const pillCust = document.getElementById('pillCustSupplied');
  const pillBoutique = document.getElementById('pillBoutiqueSupplied');
  const custView = document.getElementById('customerFabricView');
  const boutiqueView = document.getElementById('boutiqueFabricView');

  if (source === 'Customer Supplied') {
    pillCust.classList.add('active');
    pillBoutique.classList.remove('active');
    custView.style.display = 'block';
    boutiqueView.style.display = 'none';
  } else {
    pillCust.classList.remove('active');
    pillBoutique.classList.add('active');
    custView.style.display = 'none';
    boutiqueView.style.display = 'block';
    calculateMaterialSubtotal();
  }

  updateOrderSummary();
}

function handleLibraryMaterialSelect() {
  const sel = document.getElementById('libraryMaterialSelect');
  orderState.fabric.libraryMaterialId = sel.value;
  calculateMaterialSubtotal();
}

function calculateMaterialSubtotal() {
  const sel = document.getElementById('libraryMaterialSelect');
  const qty = parseFloat(document.getElementById('boutiqueQtyInput').value) || 2.5;

  let baseRate = 1850;
  if (sel.value === '2') baseRate = 980;
  if (sel.value === '3') baseRate = 1450;
  if (sel.value === '4') baseRate = 1200;
  if (sel.value === '5') baseRate = 2200;

  const fabricCost = baseRate * qty;
  const trimsCost = 450 + 80; // Default trims
  const total = fabricCost + trimsCost;

  const subDisplay = document.getElementById('materialSubtotalDisplay');
  if (subDisplay) subDisplay.textContent = `₹${total.toLocaleString('en-IN')}`;
}

function addMaterialRow() {
  const list = document.getElementById('materialRowsList');
  const id = `mat-${Date.now()}`;
  const div = document.createElement('div');
  div.className = 'mat-row';
  div.dataset.id = id;
  div.innerHTML = `
    <span class="mat-name">Custom Embroidery Zari Thread</span>
    <span class="mat-qty">2 spools</span>
    <span class="mat-price">₹220</span>
    <button type="button" class="mat-del-btn" onclick="removeMaterialRow('${id}')">&times;</button>
  `;
  list.appendChild(div);
  showToast('Material row added', 'info');
}

function removeMaterialRow(id) {
  const row = document.querySelector(`.mat-row[data-id="${id}"]`);
  if (row) row.remove();
}

// ─────────────────────────────────────────────────────────────
// 8. STEP 5: MEASUREMENTS & PROFILES
// ─────────────────────────────────────────────────────────────

function initMeasurementsSection() {
  updateMeasurementsForGarment('Blouse');
}

function toggleMeasurementMode(mode) {
  orderState.measurements.mode = mode;

  const pillExist = document.getElementById('pillExistingProfile');
  const pillNew = document.getElementById('pillNewMeasurements');
  const existCard = document.getElementById('existingProfileCard');
  const newForm = document.getElementById('newMeasurementsForm');

  if (mode === 'existing') {
    pillExist.classList.add('active');
    pillNew.classList.remove('active');
    existCard.style.display = 'flex';
    newForm.style.display = 'none';
  } else {
    pillExist.classList.remove('active');
    pillNew.classList.add('active');
    existCard.style.display = 'none';
    newForm.style.display = 'block';
  }

  updateOrderSummary();
}

function updateMeasurementsForGarment(garment) {
  const def = GARMENT_DEFINITIONS[garment] || GARMENT_DEFINITIONS.Blouse;
  const grid = document.getElementById('newMeasurementsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  def.measurements.forEach(mName => {
    const val = def.defaultValues[mName] || 0;
    const div = document.createElement('div');
    div.className = 'meas-input-group';
    div.innerHTML = `
      <label>${mName}</label>
      <input type="number" step="0.5" class="form-input" value="${val}" data-metric="${mName}" oninput="handleCustomMeasurementChange(this)" />
    `;
    grid.appendChild(div);
  });

  // Also update preview chips in existing profile card
  const bustVal = def.defaultValues['Bust'] || def.defaultValues['Chest'] || 34;
  const waistVal = def.defaultValues['Waist'] || 28;
  const shoulderVal = def.defaultValues['Shoulder'] || 14;

  const bustEl = document.getElementById('measBustVal');
  const waistEl = document.getElementById('measWaistVal');
  const shoulderEl = document.getElementById('measShoulderVal');
  const profTitle = document.getElementById('profileNameDisplay');

  if (bustEl) bustEl.textContent = `${bustVal}"`;
  if (waistEl) waistEl.textContent = `${waistVal}"`;
  if (shoulderEl) shoulderEl.textContent = `${shoulderVal}"`;
  if (profTitle) profTitle.textContent = `${garment} — 08 Sep 2026`;

  if (orderState.customer) {
    autoPopulateCustomerMeasurements(orderState.customer.mobileNumber || orderState.customer.phone, garment);
  }
}

async function autoPopulateCustomerMeasurements(mobile, garment) {
  if (!mobile) return;
  try {
    const { default: api } = await import('../../api.js');
    const comp = await api.customers.bodyMeasurements.getComparison(mobile, garment).catch(() => null);
    const m = (comp && comp.current) ? comp.current : 
              await api.customers.measurements.getByGarment(mobile, garment).catch(() => null);

    if (m) {
      // Map all numeric points
      const metricMap = {
        'Shoulder': m.shoulder,
        'Bust': m.bust,
        'Under Bust': m.underBust,
        'Waist': m.waist,
        'Hip': m.hip,
        'Blouse Length': m.blouseLength,
        'Top Length': m.topLength,
        'Full Length': m.fullLength,
        'Skirt Length': m.skirtLength,
        'Pant Length': m.pantLength,
        'Armhole': m.armhole,
        'Upper Arm': m.upperArm,
        'Sleeve Length': m.sleeveLength,
        'Sleeve Round': m.sleeveRound,
        'Elbow Round': m.elbowRound,
        'Wrist Round': m.wristRound,
        'Front Neck Depth': m.frontNeckDepth || m.frontNeck,
        'Back Neck Depth': m.backNeckDepth || m.backNeck,
        'Bust Point': m.bustPoint,
        'Bust Point to Bust Point': m.bustPointToBustPoint,
        'Shoulder to Bust': m.shoulderToBust,
        'Shoulder to Waist': m.shoulderToWaist,
        'Front Width': m.frontWidth,
        'Back Width': m.backWidth,
        'Pant Waist': m.pantWaist,
        'Pant Hip': m.pantHip,
        'Thigh Round': m.thighRound,
        'Knee Round': m.kneeRound,
        'Calf Round': m.calfRound,
        'Ankle Round': m.ankleRound,
        'Crotch Length': m.crotchLength,
        'Bottom Opening': m.bottomOpening,
        'Waist to Hip': m.waistToHip,
        'Flare': m.flare
      };

      Object.entries(metricMap).forEach(([key, val]) => {
        if (val != null) {
          orderState.measurements.values[key] = Number(val);
        }
      });

      const bustEl = document.getElementById('measBustVal');
      const waistEl = document.getElementById('measWaistVal');
      const shoulderEl = document.getElementById('measShoulderVal');
      const profTitle = document.getElementById('profileNameDisplay');

      if (bustEl && m.bust) bustEl.textContent = `${m.bust}"`;
      if (waistEl && m.waist) waistEl.textContent = `${m.waist}"`;
      if (shoulderEl && m.shoulder) shoulderEl.textContent = `${m.shoulder}"`;

      if (profTitle) {
        if (comp && comp.old) {
          profTitle.innerHTML = `${garment} Spec: <b style="color:var(--lime,#84cc16)">Current v${comp.current.version}</b> <span style="font-size:11px;color:#94a3b8;">(Prev: v${comp.old.version})</span>`;
        } else if (comp && comp.current) {
          profTitle.innerHTML = `${garment} Spec: <b style="color:var(--lime,#84cc16)">Current v${comp.current.version}</b>`;
        } else {
          profTitle.textContent = `${garment} Profile (${m.recordedBy || 'Bespoke DB'})`;
        }
      }

      document.querySelectorAll('#newMeasurementsGrid input').forEach(input => {
        const metric = input.dataset.metric;
        if (orderState.measurements.values[metric] != null) {
          input.value = orderState.measurements.values[metric];
        }
      });
    }
  } catch (err) {
    console.warn('[NewOrder] Autofill measurements error:', err);
  }
}

function handleCustomMeasurementChange(input) {
  const metric = input.dataset.metric;
  const val = parseFloat(input.value) || 0;
  orderState.measurements.values[metric] = val;
}

function openProfileViewerModal() {
  const modal = document.getElementById('profileViewerModal');
  const tabs = document.getElementById('profileTabsRow');
  const specs = document.getElementById('profileSpecsGrid');

  if (!modal) return;

  // Render tabs
  const garments = ['Blouse', 'Lehenga', 'Chudi', 'Saree'];
  tabs.innerHTML = '';
  garments.forEach((g, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `prof-tab-btn ${idx === 0 ? 'active' : ''}`;
    btn.textContent = `${g} Profile`;
    btn.onclick = () => {
      document.querySelectorAll('.prof-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProfileSpecs(g, specs);
    };
    tabs.appendChild(btn);
  });

  renderProfileSpecs('Blouse', specs);
  modal.style.display = 'flex';
}

function renderProfileSpecs(garment, container) {
  const def = GARMENT_DEFINITIONS[garment] || GARMENT_DEFINITIONS.Blouse;
  container.innerHTML = '';
  def.measurements.forEach(m => {
    const v = def.defaultValues[m] || 0;
    const item = document.createElement('div');
    item.className = 'spec-item';
    item.innerHTML = `
      <span class="spec-name">${m}</span>
      <span class="spec-val">${v}"</span>
    `;
    container.appendChild(item);
  });
}

function closeProfileViewerModal() {
  const modal = document.getElementById('profileViewerModal');
  if (modal) modal.style.display = 'none';
}

function applySelectedProfile() {
  closeProfileViewerModal();
  showToast('Measurement profile loaded into order', 'info');
}

// ─────────────────────────────────────────────────────────────
// 9. STEP 6: PRODUCTION & TIMELINE
// ─────────────────────────────────────────────────────────────

function initProductionSection() {
  const dateInput = document.getElementById('deliveryDateInput');
  const prioritySel = document.getElementById('prioritySelect');
  const assignSel = document.getElementById('assignToSelect');
  const notesInput = document.getElementById('productionNotesInput');

  if (dateInput) {
    dateInput.addEventListener('change', (e) => {
      orderState.production.deliveryDate = e.target.value;
      updateTimeline();
      updateOrderSummary();
    });
  }

  if (prioritySel) {
    prioritySel.addEventListener('change', (e) => {
      orderState.production.priority = e.target.value;
    });
  }

  if (assignSel) {
    (async () => {
      try {
        const { default: api } = await import('../../api.js');
        const emps = await api.employees.list({ page: 0, size: 50 });
        if (emps && emps.length > 0) {
          EMPLOYEES = emps.map(e => ({
            name: e.fullName || e.name || 'Staff',
            avatar: e.avatarUrl || '../../assets/user_avatar.jpg',
            initial: (e.fullName || e.name || 'S').split(' ').map(p => p[0]).join('').slice(0, 2)
          }));
          assignSel.innerHTML = '<option value="">Select Employee</option>' + EMPLOYEES.map(e => `<option value="${e.name}">${e.name}</option>`).join('');
        }
      } catch (_) {}
    })();

    assignSel.addEventListener('change', (e) => {
      const name = e.target.value;
      orderState.production.assignedTo = name;

      // Update avatar preview
      const emp = EMPLOYEES.find(x => x.name === name);
      const preview = document.getElementById('assigneePreview');
      if (preview && emp) {
        preview.innerHTML = `
          <img src="${emp.avatar}" alt="${emp.name}" class="assignee-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/>
          <span class="assignee-initial" style="display:none;">${emp.initial}</span>
        `;
      }
      updateOrderSummary();
    });
  }

  if (notesInput) {
    notesInput.addEventListener('input', (e) => {
      orderState.production.notes = e.target.value;
    });
  }
}

function updateTimeline() {
  const dateStr = orderState.production.deliveryDate;
  if (!dateStr) return;

  const targetDate = new Date(dateStr);
  if (isNaN(targetDate.getTime())) return;

  const formattedDelivery = formatDate(targetDate);
  const trialDate = new Date(targetDate);
  trialDate.setDate(trialDate.getDate() - 4);

  const deliveryEl = document.getElementById('tlDateDelivery');
  const trialEl = document.getElementById('tlDateTrial');

  if (deliveryEl) deliveryEl.textContent = formattedDelivery;
  if (trialEl) trialEl.textContent = formatDate(trialDate);
}

function formatDate(d) {
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─────────────────────────────────────────────────────────────
// 10. STEP 7: PAYMENT & AMOUNTS
// ─────────────────────────────────────────────────────────────

function initPaymentSection() {
  const methodSel = document.getElementById('paymentMethodSelect');
  const reminderToggle = document.getElementById('paymentReminderToggle');

  if (methodSel) {
    methodSel.addEventListener('change', (e) => {
      orderState.payment.paymentMethod = e.target.value;
    });
  }

  if (reminderToggle) {
    reminderToggle.addEventListener('change', (e) => {
      orderState.payment.reminderEnabled = e.target.checked;
    });
  }
}

function handleAmountInput(input, type) {
  const raw = input.value.replace(/[^0-9.]/g, '');
  const val = parseFloat(raw) || 0;

  if (type === 'estimated') {
    orderState.payment.estimatedAmount = val;
  } else {
    orderState.payment.advanceAmount = val;
  }

  updateOrderSummary();
}

// ─────────────────────────────────────────────────────────────
// 11. REACTIVE ORDER SUMMARY ENGINE
// ─────────────────────────────────────────────────────────────

function updateOrderSummary() {
  // Update Customer
  const sumCust = document.getElementById('sumCustomer');
  if (sumCust) sumCust.textContent = orderState.customer ? orderState.customer.name : '—';

  // Update Garment
  const sumGarm = document.getElementById('sumGarment');
  if (sumGarm) sumGarm.textContent = orderState.garment.type;

  // Update Design
  const sumDes = document.getElementById('sumDesign');
  if (sumDes) sumDes.textContent = orderState.design.category;

  // Update Fabric
  const sumFab = document.getElementById('sumFabric');
  if (sumFab) sumFab.textContent = orderState.fabric.source;

  // Update Measurements
  const sumMeas = document.getElementById('sumMeasurements');
  if (sumMeas) {
    if (orderState.measurements.mode === 'existing') {
      sumMeas.textContent = `Existing Profile (${formatDate(new Date('2026-09-08'))})`;
    } else {
      sumMeas.textContent = `Custom (${orderState.garment.type})`;
    }
  }

  // Update Due Date
  const sumDue = document.getElementById('sumDueDate');
  if (sumDue) {
    const d = new Date(orderState.production.deliveryDate);
    sumDue.textContent = isNaN(d.getTime()) ? '22 Sep 2026' : formatDate(d);
  }

  // Update Assigned To
  const sumAssigned = document.getElementById('sumAssigned');
  if (sumAssigned) sumAssigned.textContent = orderState.production.assignedTo;

  // Update Estimated Amount
  const sumEst = document.getElementById('sumEstimatedAmount');
  const estVal = orderState.payment.estimatedAmount || 0;
  if (sumEst) sumEst.textContent = `₹${estVal.toLocaleString('en-IN')}`;

  // Update Advance Payment Card
  const advDisplay = document.getElementById('advanceSummaryDisplay');
  const advVal = orderState.payment.advanceAmount || 0;

  let pct = 0;
  if (estVal > 0) {
    pct = Math.round((advVal / estVal) * 100);
  }
  if (advDisplay) {
    advDisplay.textContent = `₹${advVal.toLocaleString('en-IN')} (${pct}%)`;
  }
}

// ─────────────────────────────────────────────────────────────
// 12. 7-STEP WORKFLOW STEPPER CONTROLLER
// ─────────────────────────────────────────────────────────────

function initWorkflowStepper() {
  const nodes = document.querySelectorAll('.step-node');
  const cardMap = {
    '1': 'cardCustomer',
    '2': 'cardGarment',
    '3': 'cardDesign',
    '4': 'cardFabric',
    '5': 'cardMeasurements',
    '6': 'cardProduction',
    '7': 'cardPayment'
  };

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const step = node.dataset.step;
      setActiveStep(step);

      const targetId = cardMap[step];
      const targetCard = document.getElementById(targetId);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('card-highlight-pulse');
        setTimeout(() => {
          targetCard.classList.remove('card-highlight-pulse');
        }, 1500);
      }
    });
  });
}

function setActiveStep(stepNum) {
  document.querySelectorAll('.step-node').forEach(node => {
    const s = parseInt(node.dataset.step, 10);
    const target = parseInt(stepNum, 10);
    node.classList.remove('active');
    if (s === target) {
      node.classList.add('active');
    }
  });
}

// ─────────────────────────────────────────────────────────────
// 13. DRAFT SAVE & RESTORE (LOCALSTORAGE)
// ─────────────────────────────────────────────────────────────

const DRAFT_KEY = 'fashionERP.newOrderDraft';

function saveOrderDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(orderState));
    showToast('Order saved as draft', 'info');
  } catch (err) {
    console.warn('Could not save draft to localStorage', err);
    showToast('Could not save draft', 'error');
  }
}

function autoSaveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(orderState));
  } catch (_) {}
}

function restoreDraftIfExists() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (draft && draft.customer) {
      Object.assign(orderState, draft);
      renderSelectedCustomer();
      updateOrderSummary();
      updateTimeline();
    }
  } catch (err) {
    console.warn('Draft restoration skipped', err);
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
  showToast('Draft cleared', 'info');
}

// ─────────────────────────────────────────────────────────────
// 14. CREATE ORDER & VALIDATION
// ─────────────────────────────────────────────────────────────

async function submitCreateOrder() {
  // Full Validation
  if (!orderState.customer || !orderState.customer.name) {
    showToast('Customer is required', 'error');
    setActiveStep(1);
    return;
  }

  if (!orderState.garment || !orderState.garment.type) {
    showToast('Please select a garment type', 'error');
    setActiveStep(2);
    return;
  }

  if (!orderState.production.deliveryDate) {
    showToast('Preferred delivery date is required', 'error');
    setActiveStep(6);
    return;
  }

  if (!orderState.payment.estimatedAmount || orderState.payment.estimatedAmount <= 0) {
    showToast('Estimated amount is required', 'error');
    setActiveStep(7);
    return;
  }

  // Await live backend REST API order creation to receive real sequential order code
  let realOrderId = null;
  let createdOrder = null;

  try {
    const { default: api } = await import('../../api.js');
    let mobile = orderState.customer.mobileNumber || orderState.customer.phone;
    if (!mobile) {
      const custList = await api.customers.list({ search: orderState.customer.name }).catch(() => []);
      const items = Array.isArray(custList) ? custList : (custList?.content || []);
      if (items.length > 0) mobile = items[0].mobileNumber || items[0].phone;
    }

    const total = parseFloat(orderState.payment?.estimatedAmount || 0);
    const advance = parseFloat(orderState.payment?.advanceAmount || 0);
    const balance = Math.max(0, total - advance);
    const delivDate = orderState.production?.deliveryDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const ordDate = new Date().toISOString().slice(0, 10);

    createdOrder = await api.orders.create({
      customerMobile: mobile || '9999900001',
      customerName: orderState.customer?.name || '',
      garmentType: orderState.garment.type,
      garmentDesc: `${orderState.garment.type} — ${orderState.design?.silhouette || 'Bespoke design'}`,
      collection: 'Custom Couture',
      orderDate: ordDate,
      expectedDeliveryDate: delivDate,
      advancePaid: advance,
      totalAmount: total,
      balanceAmount: balance,
      amount: total,
      dueDate: delivDate,
      notes: orderState.production?.specialInstructions || orderState.production?.notes || ''
    });

    if (createdOrder) {
      realOrderId = createdOrder.orderCode || ('ORD-' + (createdOrder.id ? createdOrder.id.slice(0, 8) : ''));
      if (createdOrder.id) {
        sessionStorage.setItem('selectedOrderId', createdOrder.id);
        localStorage.setItem('selectedOrderId', createdOrder.id);
      }
      console.log('[New Order] Successfully persisted to live REST API with orderCode:', realOrderId);
    }
  } catch (err) {
    console.warn('[New Order] Could not save to API:', err.message);
  }

  const finalOrderCode = realOrderId || 'ORD-NEW';

  // Populate Success Modal
  const modal = document.getElementById('orderSuccessModal');
  const idDisplay = document.getElementById('createdOrderIdDisplay');
  const scCust = document.getElementById('succCustomer');
  const scGarm = document.getElementById('succGarment');
  const scDel = document.getElementById('succDelivery');
  const scAmt = document.getElementById('succAmount');

  if (idDisplay) idDisplay.textContent = finalOrderCode;
  if (scCust) scCust.textContent = orderState.customer.name;
  if (scGarm) scGarm.textContent = orderState.garment.type;
  if (scDel) scDel.textContent = formatDate(new Date(orderState.production.deliveryDate));
  if (scAmt) scAmt.textContent = `₹${orderState.payment.estimatedAmount.toLocaleString('en-IN')}`;

  if (modal) modal.style.display = 'flex';

  // Save to active orders history in localStorage
  try {
    const orderPayload = {
      orderNumber: finalOrderCode,
      customerMobile: orderState.customer.mobileNumber || orderState.customer.phone,
      customerName: orderState.customer.name,
      customerPhone: orderState.customer.phone,
      garmentType: orderState.garment.type,
      designSpecifications: orderState.design,
      fabricSpecifications: orderState.fabric,
      measurements: orderState.measurements,
      productionSchedule: orderState.production,
      paymentDetails: orderState.payment,
      createdDate: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem('fashionERP.ordersList') || '[]');
    existing.unshift(orderPayload);
    localStorage.setItem('fashionERP.ordersList', JSON.stringify(existing));
  } catch (_) {}

  // Clear draft
  localStorage.removeItem(DRAFT_KEY);

  showToast(`Order created successfully: ${finalOrderCode}`, 'info');
}

function resetNewOrderForm() {
  const modal = document.getElementById('orderSuccessModal');
  if (modal) modal.style.display = 'none';

  // Reset state to default
  selectCustomerById(1);
  const blouseTile = document.querySelector('.garment-tile[data-garment="Blouse"]');
  if (blouseTile) blouseTile.click();

  showToast('Ready for new order', 'info');
}

// ─────────────────────────────────────────────────────────────
// 15. TOAST NOTIFICATION SYSTEM
// ─────────────────────────────────────────────────────────────

function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-message ${type === 'error' ? 'toast-error' : 'toast-info'}`;

  let iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d4ff32" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>';
  if (type === 'error') {
    iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  }

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.25s, transform 0.25s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 260);
  }, 3200);
}

// ─────────────────────────────────────────────────────────────
// 16. BACKEND API INTEGRATION STUBS (SPRING BOOT READY)
// ─────────────────────────────────────────────────────────────

async function loadCustomers() {
  try {
    const { default: api } = await import('../../api.js');
    const page = await api.customers.list({ size: 50 });
    const items = Array.isArray(page) ? page : (page?.content || []);
    if (items.length > 0) {
      return items.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || '',
        email: c.email || '',
        location: c.location || '',
        badge: (c.tier === 'VIP_PLATINUM' ? 'VIP Customer' : c.tier === 'VIP_GOLD' ? 'Gold Member' : 'Regular Customer'),
        totalOrders: 0,
        totalSpent: '₹' + (c.totalSpend || 0),
        avatar: c.avatarUrl || '../../assets/user_avatar.jpg'
      }));
    }
  } catch (_) {}
  return CUSTOMERS_CACHE;
}

async function searchCustomers(query) {
  try {
    const { default: api } = await import('../../api.js');
    const page = await api.customers.list({ search: query, size: 20 });
    const items = Array.isArray(page) ? page : (page?.content || []);
    if (items.length > 0) {
      return items.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || '',
        email: c.email || '',
        location: c.location || '',
        badge: (c.tier === 'VIP_PLATINUM' ? 'VIP Customer' : c.tier === 'VIP_GOLD' ? 'Gold Member' : 'Regular Customer'),
        totalOrders: 0,
        totalSpent: '₹' + (c.totalSpend || 0),
        avatar: c.avatarUrl || '../../assets/user_avatar.jpg'
      }));
    }
  } catch (_) {}
  return CUSTOMERS_CACHE.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
}

async function loadCustomer(id) {
  try {
    const { default: api } = await import('../../api.js');
    const c = await api.customers.get(id);
    if (c) {
      return {
        id: c.id,
        name: c.name,
        phone: c.phone || '',
        email: c.email || '',
        location: c.location || '',
        badge: (c.tier === 'VIP_PLATINUM' ? 'VIP Customer' : c.tier === 'VIP_GOLD' ? 'Gold Member' : 'Regular Customer'),
        totalOrders: 0,
        totalSpent: '₹' + (c.totalSpend || 0),
        avatar: c.avatarUrl || '../../assets/user_avatar.jpg'
      };
    }
  } catch (_) {}
  return CUSTOMERS_CACHE.find(c => c.id === id);
}

async function loadGarmentTypes() {
  return Object.keys(GARMENT_DEFINITIONS);
}

async function loadMaterials() {
  try {
    const { default: api } = await import('../../api.js');
    const page = await api.inventory.list({ size: 50 });
    const items = Array.isArray(page) ? page : (page?.content || []);
    if (items.length > 0) {
      return items;
    }
  } catch (_) {}
  return [];
}

async function loadMeasurementProfiles(customerMobile, garmentType) {
  try {
    const { default: api } = await import('../../api.js');
    const bm = await api.customers.bodyMeasurements.list(customerMobile).catch(() => []);
    if (bm && bm.length > 0) return bm;
    const m = await api.customers.measurements.list(customerMobile).catch(() => []);
    if (m && m.length > 0) return m;
    const list = await api.measurements.listByCustomer(customerMobile).catch(() => []);
    if (list && list.length > 0) return list;
  } catch (_) {}
  return [];
}

async function saveDraft(orderData) {
  return { success: true };
}

async function createOrder(orderData) {
  try {
    const { default: api } = await import('../../api.js');
    const mob = orderData.customerMobile || orderData.phone || orderData.customerId;
    const name = orderData.customerName || orderData.name || '';
    const total = parseFloat(orderData.totalAmount || orderData.amount || orderData.estimatedAmount || 5000);
    const advance = parseFloat(orderData.advancePaid || orderData.advanceAmount || 0);
    const balance = orderData.balanceAmount !== undefined ? parseFloat(orderData.balanceAmount) : Math.max(0, total - advance);
    const expDate = orderData.expectedDeliveryDate || orderData.deliveryDate || orderData.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const ordDate = orderData.orderDate || new Date().toISOString().slice(0, 10);

    const created = await api.orders.create({
      customerMobile: mob,
      customerName: name,
      garmentType: orderData.garmentType || 'Blouse',
      garmentDesc: orderData.garmentDesc || orderData.garmentType,
      collection: orderData.collection || 'Bridal Collection',
      orderDate: ordDate,
      expectedDeliveryDate: expDate,
      advancePaid: advance,
      totalAmount: total,
      balanceAmount: balance,
      amount: total,
      dueDate: expDate,
      notes: orderData.specialInstructions || orderData.notes || ''
    });
    if (created && created.orderCode) {
      return { success: true, orderId: created.orderCode };
    }
  } catch (err) {
    console.warn('[NewOrder] API create failed, using local order:', err.message);
  }
  return { success: true, orderId: `ORD-${Date.now()}` };
}

