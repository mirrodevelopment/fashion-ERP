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
    measurements: [
      'Shoulder', 'Bust', 'Under Bust', 'Waist', 'Blouse Length',
      'Armhole', 'Upper Arm', 'Sleeve Length', 'Sleeve Round',
      'Elbow Round', 'Wrist Round', 'Front Neck Depth', 'Back Neck Depth',
      'Bust Point', 'Bust Point to Bust Point', 'Shoulder to Bust',
      'Shoulder to Waist', 'Front Width', 'Back Width'
    ]
  },
  Chudi: {
    measurements: [
      'Shoulder', 'Bust', 'Under Bust', 'Waist', 'Hip', 'Top Length',
      'Armhole', 'Upper Arm', 'Sleeve Length', 'Sleeve Round',
      'Elbow Round', 'Wrist Round', 'Front Neck Depth', 'Back Neck Depth',
      'Front Width', 'Back Width', 'Pant Waist', 'Pant Hip', 'Pant Length',
      'Thigh Round', 'Knee Round', 'Calf Round', 'Ankle Round',
      'Crotch Length', 'Bottom Opening'
    ]
  },
  Lehenga: {
    measurements: [
      'Shoulder', 'Bust', 'Under Bust', 'Waist', 'Hip', 'Blouse Length',
      'Armhole', 'Upper Arm', 'Sleeve Length', 'Sleeve Round',
      'Elbow Round', 'Wrist Round', 'Front Neck Depth', 'Back Neck Depth',
      'Bust Point', 'Bust Point to Bust Point', 'Shoulder to Bust',
      'Shoulder to Waist', 'Skirt Length', 'Waist to Hip', 'Flare', 'Bottom Opening'
    ]
  },
  Saree: {
    measurements: [
      'Shoulder', 'Bust', 'Under Bust', 'Waist', 'Blouse Length',
      'Armhole', 'Upper Arm', 'Sleeve Length', 'Sleeve Round',
      'Elbow Round', 'Wrist Round', 'Front Neck Depth', 'Back Neck Depth',
      'Bust Point', 'Bust Point to Bust Point', 'Shoulder to Bust',
      'Shoulder to Waist', 'Front Width', 'Back Width'
    ]
  },
  Gown: {
    measurements: [
      'Shoulder', 'Bust', 'Under Bust', 'Waist', 'Hip', 'Full Length',
      'Armhole', 'Upper Arm', 'Sleeve Length', 'Sleeve Round',
      'Elbow Round', 'Wrist Round', 'Front Neck Depth', 'Back Neck Depth',
      'Bust Point', 'Bust Point to Bust Point', 'Shoulder to Bust',
      'Shoulder to Waist', 'Waist to Hip', 'Flare', 'Bottom Opening'
    ]
  },
  Alteration: {
    measurements: ['Bust Alteration', 'Waist Alteration', 'Length Adjustment', 'Sleeve Adjustment']
  },
  Custom: {
    measurements: ['Shoulder', 'Bust', 'Waist', 'Hip', 'Total Length']
  }
};

let EMPLOYEES = [];

// ─────────────────────────────────────────────────────────────
// 2. CENTRALIZED STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────

const orderState = {
  customer: null,

  garment: {
    type: '',
    customType: ''
  },

  design: {
    category: '',
    neckStyle: '',
    sleeveStyle: '',
    notes: '',
    referenceImages: [],
    referenceImageFiles: []  // Actual File objects queued for API upload after order creation
  },

  fabric: {
    source: '',
    type: '',
    colour: '',
    quantity: '',
    notes: '',
    libraryMaterialId: '',
    boutiqueQty: 0,
    materials: []
  },

  measurements: {
    mode: 'existing',
    profileId: '',
    profileName: '',
    values: {}
  },

  production: {
    deliveryDate: '',
    priority: '',
    assignedTo: '',
    notes: ''
  },

  payment: {
    estimatedAmount: 0,
    advanceAmount: 0,
    paymentMethod: '',
    reminderEnabled: false
  }
};

// ─────────────────────────────────────────────────────────────
// 3. INITIALIZATION & SETUP
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Purge any stale mock drafts or mock registered customers
  try {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem('haulo_registered_customers');
  } catch (_) {}

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
      const urlParams = new URLSearchParams(window.location.search);
      const urlMob = urlParams.get('mobile') || urlParams.get('phone');
      const urlCust = urlParams.get('customer');

      if (urlMob) {
        const c = await api.customers.getByMobile(urlMob).catch(() => null);
        if (c) {
          selectCustomerObject(c);
          return;
        }
      } else if (urlCust) {
        const res = await api.customers.list({ search: urlCust, size: 5 });
        const list = Array.isArray(res) ? res : (res?.content || []);
        if (list.length > 0) {
          selectCustomerObject(list[0]);
          return;
        }
      }
      renderSelectedCustomer();
      updateOrderSummary();
    } catch (err) {
      console.error('[NewOrder] Failed to initialize customer section:', err.message);
      renderSelectedCustomer();
    }
  })();

  let debounceTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (btnClear) btnClear.style.display = q ? 'block' : 'none';

      if (!q) {
        if (searchResults) searchResults.style.display = 'none';
        return;
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          const { default: api } = await import('../../api.js');
          const res = await api.customers.list({ search: q, size: 20 });
          const items = Array.isArray(res) ? res : (res?.content || []);
          const list = items.map(c => {
            const mob = c.mobileNumber || c.phone || '';
            return {
              id: mob,
              mobileNumber: mob,
              name: c.name || '',
              phone: mob,
              email: c.email || '',
              location: c.location || [c.city, c.state].filter(Boolean).join(', ') || '',
              badge: c.tier === 'VIP_PLATINUM' ? 'VIP Platinum' : c.tier === 'VIP_GOLD' ? 'VIP Gold' : (c.tier || 'Customer'),
              customerSince: c.createdAt ? String(c.createdAt).slice(0, 10) : '',
              totalOrders: c.totalOrders || 0,
              totalSpent: '₹' + (Number(c.totalSpend || c.totalSpent) || 0).toLocaleString('en-IN'),
              avatar: c.avatarUrl || ''
            };
          });
          CUSTOMERS_CACHE = list;
          renderCustomerSearchResults(list, searchResults);
        } catch (err) {
          console.error('[NewOrder] Customer search API error:', err);
        }
      }, 250);
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
  if (window.lucide) window.lucide.createIcons();
}

function renderCustomerSearchResults(matches, container) {
  if (!container) return;
  container.innerHTML = '';
  if (!matches || matches.length === 0) {
    container.innerHTML = `
      <div style="padding:10px 14px;font-size:11.5px;color:var(--text-muted);display:flex;align-items:center;justify-content:space-between;">
        <span>No customer found.</span>
        <button type="button" class="btn-text-action" onclick="openNewCustomerModal()">+ Add New</button>
      </div>`;
    container.style.display = 'block';
    return;
  }

  matches.forEach(c => {
    const div = document.createElement('div');
    div.className = 'customer-search-item';
    div.innerHTML = `
      <div>
        <div class="cs-name">${c.name} <span class="badge-vip" style="font-size:8px;padding:1px 5px;">${c.badge}</span></div>
        <div class="cs-phone">${c.phone} • ${c.location}</div>
      </div>
      <div style="text-align:right;">
        <span style="font-size:11px;font-weight:700;color:var(--lime);">${c.totalSpent}</span>
      </div>
    `;
    div.addEventListener('click', () => {
      selectCustomerObject(c);
    });
    container.appendChild(div);
  });
  container.style.display = 'block';
}

async function selectCustomerById(id) {
  try {
    const { default: api } = await import('../../api.js');
    const c = await api.customers.getByMobile(id).catch(() => null);
    if (c) {
      selectCustomerObject(c);
      return;
    }
  } catch (_) {}
  const cached = CUSTOMERS_CACHE.find(x => String(x.id) === String(id) || String(x.mobileNumber) === String(id));
  if (cached) selectCustomerObject(cached);
}

function selectCustomerObject(c) {
  const mob = c.mobileNumber || c.phone || '';
  orderState.customer = {
    id: mob,
    mobileNumber: mob,
    name: c.name || '',
    phone: mob,
    email: c.email || '',
    location: c.location || [c.city, c.state].filter(Boolean).join(', ') || '',
    badge: c.tier === 'VIP_PLATINUM' ? 'VIP Platinum' : c.tier === 'VIP_GOLD' ? 'VIP Gold' : (c.tier || 'Customer'),
    customerSince: c.createdAt ? String(c.createdAt).slice(0, 10) : '',
    totalOrders: c.totalOrders || 0,
    totalSpent: '₹' + (Number(c.totalSpend || c.totalSpent) || 0).toLocaleString('en-IN'),
    avatar: c.avatarUrl || ''
  };

  renderSelectedCustomer();
  updateOrderSummary();
  if (orderState.garment.type) {
    autoPopulateCustomerMeasurements(mob, orderState.garment.type);
  }

  const searchResults = document.getElementById('customerSearchResults');
  const searchInput = document.getElementById('customerSearchInput');
  const btnClear = document.getElementById('btnClearCustomerSearch');

  if (searchResults) searchResults.style.display = 'none';
  if (searchInput) searchInput.value = '';
  if (btnClear) btnClear.style.display = 'none';

  showToast(`Customer selected: ${orderState.customer.name}`, 'info');
}

function renderSelectedCustomer() {
  const c = orderState.customer;
  const nameDisplay = document.getElementById('customerNameDisplay');
  const phoneDisplay = document.getElementById('customerPhoneDisplay');
  const emailDisplay = document.getElementById('customerEmailDisplay');
  const locDisplay = document.getElementById('customerLocationDisplay');
  const badgeDisplay = document.getElementById('customerBadgeDisplay');
  const avatarBox = document.getElementById('customerAvatarBox');
  const sinceDisplay = document.getElementById('customerSinceDisplay');
  const ordersDisplay = document.getElementById('customerOrdersDisplay');
  const spentDisplay = document.getElementById('customerSpentDisplay');

  function getInitials(name) {
    if (typeof window.getPatronInitials === 'function') {
      return window.getPatronInitials(name);
    }
    if (!name || name === '—') return 'CU';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'CU';
    if (parts.length === 1) {
      const s = parts[0].replace(/[^a-zA-Z0-9]/g, '');
      return s.length >= 2 ? s.substring(0, 2).toUpperCase() : s.toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  if (c && c.name && c.name !== '—') {
    if (nameDisplay) nameDisplay.textContent = c.name || '—';
    if (phoneDisplay) phoneDisplay.textContent = c.phone || c.mobileNumber || '—';
    if (emailDisplay) emailDisplay.textContent = c.email || '—';
    if (locDisplay) locDisplay.textContent = c.location || '—';
    if (badgeDisplay) {
      const isVip = (c.tier && c.tier.includes('VIP')) || (c.badge && c.badge.includes('VIP'));
      badgeDisplay.style.display = isVip ? 'inline-block' : 'none';
      if (c.badge) badgeDisplay.textContent = c.badge;
    }
    if (sinceDisplay) sinceDisplay.textContent = c.customerSince || '—';
    if (ordersDisplay) ordersDisplay.textContent = c.totalOrders != null ? String(c.totalOrders) : '0';
    if (spentDisplay) spentDisplay.textContent = c.totalSpent || '₹0';

    if (avatarBox) {
      const formattedAvatar = (c.avatar && !c.avatar.includes('user_avatar.jpg')) ? c.avatar : '';
      if (typeof window.applyPatronAvatarElement === 'function') {
        window.applyPatronAvatarElement(avatarBox, c.name, formattedAvatar, 'haulo-avatar-lg', 'width:68px;height:68px;border-radius:12px;font-size:22px;');
      } else if (typeof window.renderPatronAvatarHtml === 'function') {
        avatarBox.innerHTML = window.renderPatronAvatarHtml(c.name, formattedAvatar, 'haulo-avatar-lg', 'width:68px;height:68px;border-radius:12px;font-size:22px;');
      } else {
        avatarBox.innerHTML = `<div class="haulo-patron-avatar-initials haulo-avatar-lg" style="width:68px;height:68px;border-radius:12px;font-size:22px;">${getInitials(c.name)}</div>`;
      }
    }
  } else {
    if (nameDisplay) nameDisplay.textContent = '—';
    if (phoneDisplay) phoneDisplay.textContent = '—';
    if (emailDisplay) emailDisplay.textContent = '—';
    if (locDisplay) locDisplay.textContent = '—';
    if (badgeDisplay) badgeDisplay.style.display = 'none';
    if (sinceDisplay) sinceDisplay.textContent = '—';
    if (ordersDisplay) ordersDisplay.textContent = '0';
    if (spentDisplay) spentDisplay.textContent = '₹0';

    if (avatarBox) {
      avatarBox.innerHTML = `
        <div class="customer-avatar-placeholder" id="customerAvatarPlaceholder">
          <i data-lucide="user" class="avatar-user-icon"></i>
          <span class="customer-avatar-initials" id="customerAvatarInitials" style="display:none;"></span>
        </div>`;
    }
  }

  if (window.lucide) {
    try { window.lucide.createIcons(); } catch (_) {}
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
  const email = document.getElementById('ncEmail').value.trim();
  const location = document.getElementById('ncLocation').value.trim();

  if (!name || !phone) {
    showToast('Name and phone are required', 'error');
    return;
  }

  let dbCustomer = null;
  try {
    const { default: api } = await import('../../api.js');
    dbCustomer = await api.customers.create({ name, phone, email, location });
  } catch (err) {
    console.error('[NewOrder] Customer create error:', err.message);
    showToast(err.message || 'Failed to create customer', 'error');
    return;
  }

  if (dbCustomer) {
    selectCustomerObject(dbCustomer);
    closeNewCustomerModal();
    showToast(`New customer created: ${name}`, 'info');
    document.getElementById('newCustomerForm').reset();
  }
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
      updateOrderSummary();
    });
  }

  if (sleeveSel) {
    sleeveSel.addEventListener('change', (e) => {
      orderState.design.sleeveStyle = e.target.value;
      updateOrderSummary();
    });
  }

  if (notesArea) {
    notesArea.addEventListener('input', (e) => {
      orderState.design.notes = e.target.value;
      updateOrderSummary();
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
      orderState.design.referenceImageFiles.push(file);  // Store File for API upload

      const div = document.createElement('div');
      div.className = 'ref-image-item';
      div.dataset.id = refId;
      div.innerHTML = `
        <img src="${imgUrl}" alt="Uploaded Ref" />
        <button type="button" class="btn-remove-img" onclick="removeReferenceImage('${refId}')">&times;</button>
      `;
      strip.insertBefore(div, uploadTile);
      updateOrderSummary();
      showToast('Reference image added', 'info');
    };
    reader.readAsDataURL(file);
  });
}

function removeReferenceImage(id) {
  const item = document.querySelector(`.ref-image-item[data-id="${id}"]`);
  if (item) {
    item.remove();
    updateOrderSummary();
    showToast('Image removed', 'info');
  }
}

// ─────────────────────────────────────────────────────────────
// 7. STEP 4: FABRIC & MATERIALS
// ─────────────────────────────────────────────────────────────

let INVENTORY_MATERIALS = [];

async function loadInventoryMaterials() {
  try {
    const { default: api } = await import('../../api.js');
    const res = await api.inventory.list({ size: 100 });
    const items = Array.isArray(res) ? res : (res?.content || []);
    if (items.length > 0) {
      INVENTORY_MATERIALS = items.map(item => ({
        id: item.id,
        name: item.name || 'Material',
        color: item.color || '',
        category: item.category || 'Fabric',
        unitPrice: Number(item.unitPrice) || 0,
        stockQuantity: Number(item.quantityOnHand || item.stockQuantity || item.quantity) || 0,
        unit: item.unitOfMeasure || 'm'
      }));

      const sel = document.getElementById('libraryMaterialSelect');
      if (sel) {
        sel.innerHTML = '<option value="">Select Material from Library...</option>' +
          INVENTORY_MATERIALS.map(m =>
            `<option value="${m.id}">${m.name} ${m.color ? '(' + m.color + ')' : ''} — ₹${m.unitPrice.toLocaleString('en-IN')}/${m.unit} [${m.stockQuantity}${m.unit} avail]</option>`
          ).join('');
      }
    }
  } catch (err) {
    console.warn('[NewOrder] Failed to load inventory materials:', err.message);
  }
}

function initFabricSection() {
  const typeSel = document.getElementById('fabricTypeSelect');
  const colourSel = document.getElementById('fabricColourSelect');
  const qtyInput = document.getElementById('fabricQuantityInput');
  const notesInput = document.getElementById('fabricNotesInput');

  loadInventoryMaterials();

  if (typeSel) {
    typeSel.addEventListener('change', (e) => {
      orderState.fabric.type = e.target.value;
      updateOrderSummary();
    });
  }
  if (colourSel) {
    colourSel.addEventListener('change', (e) => {
      orderState.fabric.colour = e.target.value;
      updateOrderSummary();
    });
  }
  if (qtyInput) {
    qtyInput.addEventListener('input', (e) => {
      orderState.fabric.quantity = e.target.value;
      updateOrderSummary();
    });
  }
  if (notesInput) {
    notesInput.addEventListener('input', (e) => {
      orderState.fabric.notes = e.target.value;
      updateOrderSummary();
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
  orderState.fabric.libraryMaterialId = sel ? sel.value : '';
  calculateMaterialSubtotal();
  updateOrderSummary();
}

function calculateMaterialSubtotal() {
  const sel = document.getElementById('libraryMaterialSelect');
  const qty = parseFloat(document.getElementById('boutiqueQtyInput')?.value) || 0;
  if (!sel) return;

  const mat = INVENTORY_MATERIALS.find(m => String(m.id) === String(sel.value));
  const baseRate = mat ? (Number(mat.unitPrice) || 0) : 0;
  const fabricCost = baseRate * qty;

  let trimsCost = 0;
  document.querySelectorAll('#materialRowsList .mat-row').forEach(row => {
    const p = parseFloat(row.dataset.price) || 0;
    trimsCost += p;
  });

  const total = fabricCost + trimsCost;
  const subDisplay = document.getElementById('materialSubtotalDisplay');
  if (subDisplay) subDisplay.textContent = `₹${total.toLocaleString('en-IN')}`;
  updateOrderSummary();
}

function addMaterialRow() {
  const list = document.getElementById('materialRowsList');
  if (!list) return;

  if (!INVENTORY_MATERIALS || INVENTORY_MATERIALS.length === 0) {
    showToast('No materials or trims available in inventory', 'info');
    return;
  }

  const trim = INVENTORY_MATERIALS.find(m => (m.category && m.category.toLowerCase().includes('trim')) || (m.category && m.category.toLowerCase().includes('access'))) || INVENTORY_MATERIALS[0];
  if (!trim) return;

  const id = `mat-${Date.now()}`;
  const div = document.createElement('div');
  div.className = 'mat-row';
  div.dataset.id = id;
  div.dataset.price = trim.unitPrice;
  div.innerHTML = `
    <span class="mat-name">${trim.name}</span>
    <span class="mat-qty">1 ${trim.unit || 'm'}</span>
    <span class="mat-price">₹${(Number(trim.unitPrice) || 0).toLocaleString('en-IN')}</span>
    <button type="button" class="mat-del-btn" onclick="removeMaterialRow('${id}')">&times;</button>
  `;
  list.appendChild(div);
  calculateMaterialSubtotal();
  showToast('Material added from inventory', 'info');
}

function removeMaterialRow(id) {
  const row = document.querySelector(`.mat-row[data-id="${id}"]`);
  if (row) {
    row.remove();
    calculateMaterialSubtotal();
  }
}

// ─────────────────────────────────────────────────────────────
// 8. STEP 5: MEASUREMENTS & PROFILES
// ─────────────────────────────────────────────────────────────

function initMeasurementsSection() {
  if (orderState.garment.type) {
    updateMeasurementsForGarment(orderState.garment.type);
  }
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
    const val = (orderState.measurements.values && orderState.measurements.values[mName] != null) ? orderState.measurements.values[mName] : '';
    const div = document.createElement('div');
    div.className = 'meas-input-group';
    div.innerHTML = `
      <label>${mName}</label>
      <input type="number" step="0.5" class="form-input" value="${val}" placeholder="—" data-metric="${mName}" oninput="handleCustomMeasurementChange(this)" />
    `;
    grid.appendChild(div);
  });

  // Update preview chips in existing profile card
  const bustEl = document.getElementById('measBustVal');
  const waistEl = document.getElementById('measWaistVal');
  const shoulderEl = document.getElementById('measShoulderVal');
  const profTitle = document.getElementById('profileNameDisplay');

  if (bustEl) bustEl.textContent = '—';
  if (waistEl) waistEl.textContent = '—';
  if (shoulderEl) shoulderEl.textContent = '—';
  if (profTitle) profTitle.textContent = 'No measurement profile selected';

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

    const bustEl = document.getElementById('measBustVal');
    const waistEl = document.getElementById('measWaistVal');
    const shoulderEl = document.getElementById('measShoulderVal');
    const profTitle = document.getElementById('profileNameDisplay');

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

      if (bustEl && m.bust) bustEl.textContent = `${m.bust}"`;
      if (waistEl && m.waist) waistEl.textContent = `${m.waist}"`;
      if (shoulderEl && m.shoulder) shoulderEl.textContent = `${m.shoulder}"`;

      let profName = `${garment} Profile` + (m.recordedBy ? ` (${m.recordedBy})` : '');
      if (comp && comp.current) {
        profName = `${garment} Spec: Current v${comp.current.version}`;
      }
      orderState.measurements.profileName = profName;
      if (profTitle) profTitle.textContent = profName;

      document.querySelectorAll('#newMeasurementsGrid input').forEach(input => {
        const metric = input.dataset.metric;
        if (orderState.measurements.values[metric] != null) {
          input.value = orderState.measurements.values[metric];
        }
      });
    } else {
      if (profTitle) profTitle.textContent = 'No measurement profile available';
      if (bustEl) bustEl.textContent = '—';
      if (waistEl) waistEl.textContent = '—';
      if (shoulderEl) shoulderEl.textContent = '—';
      orderState.measurements.profileName = '';
    }
    updateOrderSummary();
  } catch (err) {
    console.warn('[NewOrder] Autofill measurements error:', err);
  }
}

function handleCustomMeasurementChange(input) {
  const metric = input.dataset.metric;
  const val = parseFloat(input.value) || 0;
  orderState.measurements.values[metric] = val;
  updateOrderSummary();
}

function openProfileViewerModal() {
  const modal = document.getElementById('profileViewerModal');
  const tabs = document.getElementById('profileTabsRow');
  const specs = document.getElementById('profileSpecsGrid');

  if (!modal) return;

  // Render tabs from definitions
  const garments = Object.keys(GARMENT_DEFINITIONS);
  tabs.innerHTML = '';
  garments.forEach((g, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isAct = (orderState.garment.type ? g === orderState.garment.type : idx === 0);
    btn.className = `prof-tab-btn ${isAct ? 'active' : ''}`;
    btn.textContent = `${g} Profile`;
    btn.onclick = () => {
      document.querySelectorAll('.prof-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProfileSpecs(g, specs);
    };
    tabs.appendChild(btn);
  });

  const activeG = orderState.garment.type || garments[0];
  renderProfileSpecs(activeG, specs);
  modal.style.display = 'flex';
}

function renderProfileSpecs(garment, container) {
  const def = GARMENT_DEFINITIONS[garment] || GARMENT_DEFINITIONS.Blouse;
  container.innerHTML = '';
  def.measurements.forEach(m => {
    const v = (orderState.measurements.values && orderState.measurements.values[m] != null) ? orderState.measurements.values[m] : '—';
    const item = document.createElement('div');
    item.className = 'spec-item';
    item.innerHTML = `
      <span class="spec-name">${m}</span>
      <span class="spec-val">${v !== '—' ? v + '"' : '—'}</span>
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
    if (orderState.production.deliveryDate) {
      dateInput.value = orderState.production.deliveryDate;
    }
    dateInput.addEventListener('change', (e) => {
      orderState.production.deliveryDate = e.target.value;
      updateTimeline();
      updateOrderSummary();
    });
  }

  if (prioritySel) {
    prioritySel.addEventListener('change', (e) => {
      orderState.production.priority = e.target.value;
      updateOrderSummary();
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
            avatar: (e.avatarUrl && !e.avatarUrl.includes('user_avatar.jpg')) ? e.avatarUrl : '',
            initial: (e.fullName || e.name || 'S').split(' ').map(p => p[0]).join('').slice(0, 2)
          }));
          assignSel.innerHTML = '<option value="">Select Employee</option>' + EMPLOYEES.map(e => `<option value="${e.name}">${e.name}</option>`).join('');
        }
      } catch (_) { }
    })();

    assignSel.addEventListener('change', (e) => {
      const name = e.target.value;
      orderState.production.assignedTo = name;

      // Update avatar preview
      const emp = EMPLOYEES.find(x => x.name === name);
      const preview = document.getElementById('assigneePreview');
      if (preview && emp) {
        if (emp.avatar) {
          preview.innerHTML = `
            <img src="${emp.avatar}" alt="${emp.name}" class="assignee-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/>
            <span class="assignee-initial" style="display:none;">${emp.initial}</span>
          `;
        } else {
          preview.innerHTML = `<span class="assignee-initial">${emp.initial}</span>`;
        }
      } else if (preview) {
        preview.innerHTML = `<span class="assignee-initial">—</span>`;
      }
      updateOrderSummary();
    });
  }

  if (notesInput) {
    notesInput.addEventListener('input', (e) => {
      orderState.production.notes = e.target.value;
      updateOrderSummary();
    });
  }
}

function updateTimeline() {
  const dateStr = orderState.production.deliveryDate;
  const createdDate = new Date(); // Today
  const createdEl = document.getElementById('tlDateCreated');
  if (createdEl) createdEl.textContent = formatDate(createdDate);

  if (!dateStr) return;

  const targetDate = new Date(dateStr);
  if (isNaN(targetDate.getTime())) return;

  const diffMs = targetDate.getTime() - createdDate.getTime();
  const diffDays = Math.max(1, Math.round(diffMs / 86400000));

  // Dynamically calculate intermediate milestones based on total span
  const dDesign = new Date(createdDate.getTime() + Math.max(1, Math.round(diffDays * 0.15)) * 86400000);
  const dFabric = new Date(createdDate.getTime() + Math.max(2, Math.round(diffDays * 0.30)) * 86400000);
  const dProd = new Date(createdDate.getTime() + Math.max(3, Math.round(diffDays * 0.45)) * 86400000);
  const dTrial = new Date(targetDate.getTime() - Math.max(1, Math.round(diffDays * 0.25)) * 86400000);

  const designEl = document.getElementById('tlDateDesign');
  const fabricEl = document.getElementById('tlDateFabric');
  const prodEl = document.getElementById('tlDateProd');
  const trialEl = document.getElementById('tlDateTrial');
  const deliveryEl = document.getElementById('tlDateDelivery');

  if (designEl) designEl.textContent = formatDate(dDesign);
  if (fabricEl) fabricEl.textContent = formatDate(dFabric);
  if (prodEl) prodEl.textContent = formatDate(dProd);
  if (trialEl) trialEl.textContent = formatDate(dTrial);
  if (deliveryEl) deliveryEl.textContent = formatDate(targetDate);
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
  const estInput = document.getElementById('estimatedAmountInput');
  const advInput = document.getElementById('advanceAmountInput');

  if (estInput) {
    estInput.value = orderState.payment.estimatedAmount > 0 ? orderState.payment.estimatedAmount : '';
  }
  if (advInput) {
    advInput.value = orderState.payment.advanceAmount > 0 ? orderState.payment.advanceAmount : '';
  }

  if (methodSel) {
    methodSel.value = orderState.payment.paymentMethod || '';
    methodSel.addEventListener('change', (e) => {
      orderState.payment.paymentMethod = e.target.value;
      updateOrderSummary();
    });
  }

  if (reminderToggle) {
    reminderToggle.checked = Boolean(orderState.payment.reminderEnabled);
    reminderToggle.addEventListener('change', (e) => {
      orderState.payment.reminderEnabled = e.target.checked;
      updateOrderSummary();
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
  if (sumGarm) sumGarm.textContent = orderState.garment.type || '—';

  // Update Design
  const sumDes = document.getElementById('sumDesign');
  if (sumDes) sumDes.textContent = orderState.design.category || '—';

  // Update Fabric
  const sumFab = document.getElementById('sumFabric');
  if (sumFab) sumFab.textContent = orderState.fabric.source || '—';

  // Update Measurements
  const sumMeas = document.getElementById('sumMeasurements');
  if (sumMeas) {
    if (orderState.measurements.mode === 'existing') {
      sumMeas.textContent = (orderState.measurements.profileName && orderState.measurements.profileName !== 'No profile' && orderState.measurements.profileName !== 'No measurement profile selected')
        ? orderState.measurements.profileName
        : '—';
    } else {
      sumMeas.textContent = `Custom (${orderState.garment.type})`;
    }
  }

  // Update Due Date
  const sumDue = document.getElementById('sumDueDate');
  if (sumDue) {
    const d = new Date(orderState.production.deliveryDate);
    sumDue.textContent = !isNaN(d.getTime()) ? formatDate(d) : '—';
  }

  // Update Assigned To
  const sumAssigned = document.getElementById('sumAssigned');
  if (sumAssigned) sumAssigned.textContent = orderState.production.assignedTo || 'No employee assigned';

  // Update Estimated Amount
  const sumEst = document.getElementById('sumEstimatedAmount');
  const estVal = orderState.payment.estimatedAmount || 0;
  if (sumEst) sumEst.textContent = `₹${estVal.toLocaleString('en-IN')}`;

  // Update Advance Payment Card
  const advDisplay = document.getElementById('advanceSummaryDisplay');
  const advBadge = document.getElementById('advanceStatusBadge');
  const advText = document.getElementById('advanceStatusText');
  const advVal = orderState.payment.advanceAmount || 0;

  let pct = 0;
  if (estVal > 0) {
    pct = Math.round((advVal / estVal) * 100);
  }
  if (advDisplay) {
    advDisplay.textContent = `₹${advVal.toLocaleString('en-IN')} (${pct}%)`;
  }
  if (advBadge && advText) {
    if (advVal > 0) {
      advText.textContent = 'Collected';
      advBadge.className = 'collected-badge';
    } else {
      advText.textContent = 'Pending';
      advBadge.className = 'collected-badge badge-pending';
    }
  }

  updateWorkflowStepper();
}

// ─────────────────────────────────────────────────────────────
// 12. 7-STEP WORKFLOW STEPPER CONTROLLER
// ─────────────────────────────────────────────────────────────

function isStepFilled(stepNum) {
  switch (String(stepNum)) {
    case '1': {
      // Step 1: Customer Details
      const hasStateCust = Boolean(orderState.customer && orderState.customer.name && orderState.customer.name !== '—');
      const custNameEl = document.getElementById('customerNameDisplay');
      const hasDomCust = Boolean(custNameEl && custNameEl.textContent.trim() !== '—' && custNameEl.textContent.trim() !== '');
      return hasStateCust || hasDomCust;
    }
    case '2': {
      // Step 2: Garment Type
      const hasStateGarment = Boolean(orderState.garment && (orderState.garment.type || orderState.garment.customType));
      const hasActiveTile = Boolean(document.querySelector('.garment-tile.active'));
      return hasStateGarment || hasActiveTile;
    }
    case '3': {
      // Step 3: Design Details
      const hasStateDesign = Boolean(
        orderState.design && (
          orderState.design.category ||
          orderState.design.neckStyle ||
          orderState.design.sleeveStyle ||
          (orderState.design.notes && orderState.design.notes.trim()) ||
          (orderState.design.referenceImages && orderState.design.referenceImages.length > 0) ||
          (orderState.design.referenceImageFiles && orderState.design.referenceImageFiles.length > 0)
        )
      );
      const catVal = document.getElementById('designCategorySelect')?.value || '';
      const neckVal = document.getElementById('neckStyleSelect')?.value || '';
      const sleeveVal = document.getElementById('sleeveStyleSelect')?.value || '';
      const notesVal = document.getElementById('designNotesInput')?.value?.trim() || '';
      const hasDomRef = Boolean(document.querySelector('.ref-image-item'));
      return hasStateDesign || Boolean(catVal || neckVal || sleeveVal || notesVal || hasDomRef);
    }
    case '4': {
      // Step 4: Fabric & Materials
      const hasStateFabric = Boolean(
        orderState.fabric && (
          orderState.fabric.source ||
          orderState.fabric.type ||
          orderState.fabric.colour ||
          (orderState.fabric.quantity && String(orderState.fabric.quantity).trim()) ||
          (orderState.fabric.notes && orderState.fabric.notes.trim()) ||
          orderState.fabric.libraryMaterialId ||
          (orderState.fabric.materials && orderState.fabric.materials.length > 0)
        )
      );
      const pillCust = document.getElementById('pillCustSupplied')?.classList.contains('active');
      const pillBoutique = document.getElementById('pillBoutiqueSupplied')?.classList.contains('active');
      const fabType = document.getElementById('fabricTypeSelect')?.value || '';
      const fabCol = document.getElementById('fabricColourSelect')?.value || '';
      const fabQty = document.getElementById('fabricQuantityInput')?.value?.trim() || '';
      const fabNotes = document.getElementById('fabricNotesInput')?.value?.trim() || '';
      const libMat = document.getElementById('libraryMaterialSelect')?.value || '';
      const boutQty = document.getElementById('boutiqueQtyInput')?.value?.trim() || '';
      const hasDomMats = Boolean(document.querySelector('#materialRowsList .mat-row'));
      return hasStateFabric || Boolean(pillCust || pillBoutique || fabType || fabCol || fabQty || fabNotes || libMat || boutQty || hasDomMats);
    }
    case '5': {
      // Step 5: Measurements
      const profTitle = document.getElementById('profileNameDisplay')?.textContent?.trim() || '';
      const hasProfile = Boolean(
        profTitle &&
        !profTitle.toLowerCase().includes('no measurement profile') &&
        !profTitle.toLowerCase().includes('no profile')
      );
      const bustVal = document.getElementById('measBustVal')?.textContent?.trim() || '—';
      const hasChipData = bustVal !== '—' && bustVal !== '';
      const hasStateProfile = Boolean(
        orderState.measurements.profileId ||
        (orderState.measurements.profileName && !orderState.measurements.profileName.toLowerCase().includes('no profile'))
      );
      const hasCustomValues = Boolean(
        (orderState.measurements.values && Object.values(orderState.measurements.values).some(v => v !== '' && v !== null && v !== undefined && !isNaN(Number(v)) && Number(v) > 0)) ||
        Array.from(document.querySelectorAll('#newMeasurementsGrid input')).some(i => i.value.trim() !== '' && Number(i.value) > 0)
      );
      return (orderState.measurements.mode === 'existing' && (hasProfile || hasChipData || hasStateProfile)) || hasCustomValues;
    }
    case '6': {
      // Step 6: Production Details
      const hasStateProd = Boolean(
        orderState.production && (
          orderState.production.deliveryDate ||
          orderState.production.priority ||
          orderState.production.assignedTo ||
          (orderState.production.notes && orderState.production.notes.trim())
        )
      );
      const delivDate = document.getElementById('deliveryDateInput')?.value || '';
      const priority = document.getElementById('prioritySelect')?.value || '';
      const assigned = document.getElementById('assignToSelect')?.value || '';
      const prodNotes = document.getElementById('productionNotesInput')?.value?.trim() || '';
      return hasStateProd || Boolean(delivDate || priority || assigned || prodNotes);
    }
    case '7': {
      // Step 7: Payment Details
      const hasStatePay = Boolean(
        orderState.payment && (
          (Number(orderState.payment.estimatedAmount) > 0) ||
          (Number(orderState.payment.advanceAmount) > 0) ||
          Boolean(orderState.payment.paymentMethod)
        )
      );
      const estRaw = document.getElementById('estimatedAmountInput')?.value?.replace(/[^0-9.]/g, '') || '';
      const advRaw = document.getElementById('advanceAmountInput')?.value?.replace(/[^0-9.]/g, '') || '';
      const estVal = parseFloat(estRaw) || 0;
      const advVal = parseFloat(advRaw) || 0;
      const methodVal = document.getElementById('paymentMethodSelect')?.value || '';
      return hasStatePay || Boolean(estVal > 0 || advVal > 0 || (methodVal && methodVal !== ''));
    }
    default:
      return false;
  }
}

function updateWorkflowStepper() {
  const stepper = document.getElementById('workflowStepper');
  if (!stepper) return;

  const nodes = stepper.querySelectorAll('.step-node');
  const lines = stepper.querySelectorAll('.step-line');

  let firstUnfilledStep = null;

  nodes.forEach((node, idx) => {
    const stepNum = idx + 1;
    const filled = isStepFilled(stepNum);
    const circle = node.querySelector('.step-circle');

    if (filled) {
      node.classList.add('completed');
      if (circle) {
        circle.innerHTML = '<span class="step-check-mark">✓</span>';
        circle.setAttribute('title', `Step ${stepNum} Completed`);
      }
    } else {
      node.classList.remove('completed');
      if (circle) {
        circle.textContent = String(stepNum);
        circle.removeAttribute('title');
      }
      if (firstUnfilledStep === null) {
        firstUnfilledStep = stepNum;
      }
    }
  });

  // Connecting line progressive fills
  lines.forEach((line, idx) => {
    // line[idx] connects Step (idx+1) to Step (idx+2)
    // If Step (idx+1) is filled, line fills to the next step
    if (isStepFilled(idx + 1)) {
      line.classList.add('completed');
    } else {
      line.classList.remove('completed');
    }
  });

  // Also sync each card's header badge (.step-badge)
  const cardIds = [
    'cardCustomer',
    'cardGarment',
    'cardDesign',
    'cardFabric',
    'cardMeasurements',
    'cardProduction',
    'cardPayment'
  ];

  cardIds.forEach((cardId, idx) => {
    const cardEl = document.getElementById(cardId);
    if (!cardEl) return;
    const badge = cardEl.querySelector('.step-badge');
    if (!badge) return;
    const stepNum = idx + 1;
    if (isStepFilled(stepNum)) {
      badge.classList.add('completed');
      badge.innerHTML = '✓';
    } else {
      badge.classList.remove('completed');
      badge.textContent = String(stepNum);
    }
  });
}

function setActiveStep(stepNum) {
  const target = parseInt(stepNum, 10);
  document.querySelectorAll('.step-node').forEach(node => {
    const s = parseInt(node.dataset.step, 10);
    if (s === target) {
      node.classList.add('active');
    } else {
      node.classList.remove('active');
    }
  });
}

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

  // Track active card when interacting directly with form inputs
  const grid = document.querySelector('.order-grid');
  if (grid) {
    grid.addEventListener('input', () => updateWorkflowStepper());
    grid.addEventListener('change', () => updateWorkflowStepper());

    const reverseCardMap = {
      'cardCustomer': 1,
      'cardGarment': 2,
      'cardDesign': 3,
      'cardFabric': 4,
      'cardMeasurements': 5,
      'cardProduction': 6,
      'cardPayment': 7
    };

    grid.addEventListener('focusin', (e) => {
      const card = e.target.closest('.section-card');
      if (card && reverseCardMap[card.id]) {
        setActiveStep(reverseCardMap[card.id]);
      }
    });

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.section-card');
      if (card && reverseCardMap[card.id]) {
        setActiveStep(reverseCardMap[card.id]);
      }
    });
  }

  // Initial evaluation
  updateWorkflowStepper();
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
    if (orderState.customer && (orderState.payment.estimatedAmount > 0 || orderState.garment.type)) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(orderState));
    }
  } catch (_) { }
}

function restoreDraftIfExists() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (draft && draft.customer && draft.customer.name && CUSTOMERS_CACHE.some(c => String(c.id) === String(draft.customer.id))) {
      Object.assign(orderState, draft);
      renderSelectedCustomer();
      updateOrderSummary();
      updateTimeline();
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  } catch (err) {
    console.warn('Draft restoration skipped', err);
  }
}

// ─────────────────────────────────────────────────────────────
// 14. CREATE ORDER & VALIDATION
// ─────────────────────────────────────────────────────────────
async function submitCreateOrder() {
  // Full Validation
  if (!orderState.customer || !orderState.customer.name) {
    showToast('Customer name is required', 'error');
    setActiveStep(1);
    document.getElementById('customerSearchInput')?.focus();
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
    const delivDate = orderState.production?.deliveryDate || null;
    const ordDate = new Date().toISOString().slice(0, 10);

    createdOrder = await api.orders.create({
      customerMobile: mobile,
      customerName: orderState.customer?.name || '',
      garmentType: orderState.garment.type,
      garmentDesc: `${orderState.garment.type}${orderState.design?.category ? ' — ' + orderState.design.category : ''}`,
      collection: orderState.design?.category || '',
      orderDate: ordDate,
      expectedDeliveryDate: delivDate,
      advancePaid: advance,
      totalAmount: total,
      balanceAmount: balance,
      amount: total,
      dueDate: delivDate,
      notes: orderState.production?.notes || orderState.design?.notes || '',
      paymentMethod: orderState.payment?.paymentMethod || 'CASH'
    });

    if (createdOrder) {
      realOrderId = createdOrder.orderCode || createdOrder.id;
      if (createdOrder.id) {
        sessionStorage.setItem('selectedOrderId', createdOrder.id);
        localStorage.setItem('selectedOrderId', createdOrder.id);
      }
      console.log('[New Order] Successfully persisted to live REST API with orderCode:', realOrderId);

      // Upload reference images (non-blocking, fire-and-forget)
      const refFiles = orderState.design.referenceImageFiles || [];
      if (refFiles.length > 0 && createdOrder.id) {
        refFiles.forEach((imgFile, idx) => {
          api.orders.uploadReferenceImage(createdOrder.id, idx + 1, imgFile)
            .then(() => console.log(`[New Order] Reference image ${idx + 1} uploaded.`))
            .catch(err => console.warn(`[New Order] Reference image ${idx + 1} upload failed:`, err.message));
        });
      }
    }
  } catch (err) {
    console.error('[New Order] Could not save to API:', err.message);
    showToast(err.message || 'Failed to create order on server', 'error');
    return;
  }

  if (!createdOrder) {
    showToast('Failed to create order on server', 'error');
    return;
  }

  const finalOrderCode = realOrderId;

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
  if (scDel) scDel.textContent = orderState.production.deliveryDate ? formatDate(new Date(orderState.production.deliveryDate)) : '—';
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
  } catch (_) { }

  // Clear draft
  localStorage.removeItem(DRAFT_KEY);

  showToast(`Order created successfully: ${finalOrderCode}`, 'info');
}

function resetNewOrderForm() {
  const modal = document.getElementById('orderSuccessModal');
  if (modal) modal.style.display = 'none';

  orderState.customer = null;
  orderState.garment.type = '';
  orderState.garment.customType = '';
  orderState.design.category = '';
  orderState.design.neckStyle = '';
  orderState.design.sleeveStyle = '';
  orderState.design.notes = '';
  orderState.design.referenceImages = [];
  orderState.design.referenceImageFiles = [];
  orderState.fabric.source = '';
  orderState.fabric.type = '';
  orderState.fabric.colour = '';
  orderState.fabric.quantity = '';
  orderState.fabric.notes = '';
  orderState.measurements.mode = 'existing';
  orderState.measurements.profileId = '';
  orderState.measurements.profileName = '';
  orderState.measurements.values = {};
  orderState.payment.estimatedAmount = 0;
  orderState.payment.advanceAmount = 0;
  orderState.production.deliveryDate = '';
  orderState.production.priority = '';
  orderState.production.assignedTo = '';
  orderState.production.notes = '';

  // Deselect garment tiles
  document.querySelectorAll('.garment-tile').forEach(t => t.classList.remove('active'));

  // Reset selects
  const dCat = document.getElementById('designCategorySelect');
  if (dCat) dCat.selectedIndex = 0;
  const nStyle = document.getElementById('neckStyleSelect');
  if (nStyle) nStyle.selectedIndex = 0;
  const sStyle = document.getElementById('sleeveStyleSelect');
  if (sStyle) sStyle.selectedIndex = 0;
  const fType = document.getElementById('fabricTypeSelect');
  if (fType) fType.selectedIndex = 0;
  const fCol = document.getElementById('fabricColourSelect');
  if (fCol) fCol.selectedIndex = 0;
  const prio = document.getElementById('prioritySelect');
  if (prio) prio.selectedIndex = 0;
  const ass = document.getElementById('assignToSelect');
  if (ass) ass.selectedIndex = 0;
  const dDate = document.getElementById('deliveryDateInput');
  if (dDate) dDate.value = '';

  const pillCust = document.getElementById('pillCustSupplied');
  const pillBoutique = document.getElementById('pillBoutiqueSupplied');
  if (pillCust) pillCust.classList.remove('active');
  if (pillBoutique) pillBoutique.classList.remove('active');

  const dNotes = document.getElementById('designNotesInput');
  if (dNotes) dNotes.value = '';
  const fQty = document.getElementById('fabricQuantityInput');
  if (fQty) fQty.value = '';
  const fNotes = document.getElementById('fabricNotesInput');
  if (fNotes) fNotes.value = '';
  const eAmt = document.getElementById('estimatedAmountInput');
  if (eAmt) eAmt.value = '';
  const aAmt = document.getElementById('advanceAmountInput');
  if (aAmt) aAmt.value = '';

  const matList = document.getElementById('materialRowsList');
  if (matList) matList.innerHTML = '';
  const matSub = document.getElementById('materialSubtotalDisplay');
  if (matSub) matSub.textContent = '₹0';

  const measGrid = document.getElementById('newMeasurementsGrid');
  if (measGrid) measGrid.innerHTML = '';

  localStorage.removeItem(DRAFT_KEY);
  renderSelectedCustomer();
  updateOrderSummary();
  updateTimeline();

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

