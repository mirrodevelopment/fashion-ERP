/**
 * HAULO BOUTIQUE ERP — MEASUREMENT DIRECTORY & OVERVIEW
 * File: front end/Measurements/measurement-overview/measurement-overview.js
 * Comprehensive client measurement profiles, card grid, filtering, drawer & modal.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. DATASET: REAL MEASUREMENT PROFILES (Loaded from DB)
  // ==========================================================================
  let PROFILES_DATA = [];

  // ==========================================================================
  // 2. APPLICATION STATE
  // ==========================================================================
  const State = {
    profiles: [],
    activeFilter: 'all',
    searchQuery: '',
    sortOrder: 'recent',
    currentPage: 1,
    pageSize: 9,
    selectedProfile: null
  };

  // Avatar Palette generator
  const AVATAR_COLORS = [
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #6366f1, #4f46e5)',
    'linear-gradient(135deg, #ec4899, #db2777)',
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #14b8a6, #0d9488)',
    'linear-gradient(135deg, #f97316, #ea580c)'
  ];

  function getAvatarGradient(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const idx = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
  }

  function getInitials(name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }

  function formatDate(isoStr) {
    if (!isoStr) return '—';
    const [y, m, d] = isoStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
  }

  // ==========================================================================
  // 3. KPI CALCULATIONS
  // ==========================================================================
  function updateKPIs() {
    const total = State.profiles.length;
    const blouses = State.profiles.filter(p => p.garment === 'Blouse').length;
    const bridal = State.profiles.filter(p => p.garment === 'Lehenga' || p.garment === 'Saree').length;
    const suits = State.profiles.filter(p => p.garment === 'Chudi' || p.garment === 'Gown').length;
    const alerts = State.profiles.filter(p => p.needsRemeasure).length;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('kpiTotalVal', total);
    setVal('kpiBlousesVal', blouses);
    setVal('kpiBridalVal', bridal);
    setVal('kpiSuitsVal', suits);
    setVal('kpiAlertsVal', alerts);
  }

  // ==========================================================================
  // 4. FILTER, SEARCH & SORT LOGIC
  // ==========================================================================
  function getFilteredProfiles() {
    return State.profiles.filter(p => {
      // 1. Filter Chips
      if (State.activeFilter === 'vip' && !p.vip) return false;
      if (State.activeFilter === 'needs-remeasure' && !p.needsRemeasure) return false;
      if (['Blouse', 'Lehenga', 'Chudi', 'Gown', 'Saree'].includes(State.activeFilter)) {
        if (p.garment !== State.activeFilter) return false;
      }

      // 2. Search Query
      if (State.searchQuery) {
        const q = State.searchQuery.toLowerCase();
        const matchName = p.customerName.toLowerCase().includes(q);
        const matchPhone = p.phone.toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        const matchGarment = p.garment.toLowerCase().includes(q);
        const matchNotes = p.notes.toLowerCase().includes(q);
        const matchTailor = p.fittedBy.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchId && !matchGarment && !matchNotes && !matchTailor) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (State.sortOrder === 'recent') {
        return new Date(b.updatedDate) - new Date(a.updatedDate);
      }
      if (State.sortOrder === 'name-asc') {
        return a.customerName.localeCompare(b.customerName);
      }
      if (State.sortOrder === 'accuracy-desc') {
        return b.fitAccuracy - a.fitAccuracy;
      }
      if (State.sortOrder === 'profile-id') {
        return a.id.localeCompare(b.id);
      }
      return 0;
    });
  }

  // ==========================================================================
  // 5. CARD RENDERING
  // ==========================================================================
  function renderCard(p) {
    const card = document.createElement('article');
    card.className = `measurement-card ${p.needsRemeasure ? 'needs-remeasure' : ''}`;
    card.dataset.id = p.id;
    card.tabIndex = 0;

    const garmentClass = p.garment.toLowerCase();

    card.innerHTML = `
      <div class="card-header-row">
        <div class="card-avatar-wrap">
          <div class="card-avatar" style="background: ${getAvatarGradient(p.customerName)};">
            ${p.avatar ? `<img src="${p.avatar}" alt="${p.customerName}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />` : ''}
            <span style="${p.avatar ? 'display:none;' : ''}">${getInitials(p.customerName)}</span>
          </div>
          <div class="card-title-meta">
            <h3 class="card-customer-name" title="${p.customerName}">${p.customerName}</h3>
            <span class="card-customer-phone">
              <i data-lucide="phone" style="width:11px;height:11px;"></i>
              ${p.phone}
            </span>
          </div>
        </div>
        ${p.vip ? `
          <span class="vip-badge-pill" title="VIP Client">
            <i data-lucide="sparkles" style="width:11px;height:11px;"></i>
            VIP
          </span>
        ` : ''}
      </div>

      <div class="card-garment-row">
        <span class="garment-badge ${garmentClass}">
          <i data-lucide="shirt" style="width:12px;height:12px;"></i>
          ${p.garment}
        </span>
        <span class="card-profile-id">${p.id}</span>
      </div>

      <!-- 4 Core Dimensions Matrix -->
      <div class="card-dimensions-matrix">
        <div class="dim-box">
          <span class="dim-label">Shoulder</span>
          <span class="dim-val">${p.shoulder}"</span>
        </div>
        <div class="dim-box">
          <span class="dim-label">Bust</span>
          <span class="dim-val">${p.bust}"</span>
        </div>
        <div class="dim-box">
          <span class="dim-label">Waist</span>
          <span class="dim-val">${p.waist}"</span>
        </div>
        <div class="dim-box">
          <span class="dim-label">Length</span>
          <span class="dim-val">${p.length}"</span>
        </div>
      </div>

      <!-- Fit Meta -->
      <div class="card-fit-meta">
        <div class="fit-score-wrap">
          <i data-lucide="shield-check" style="width:13px;height:13px;"></i>
          <span>${p.fitAccuracy}% Fit Accuracy</span>
        </div>
        <span class="measured-date-wrap">${formatDate(p.updatedDate)}</span>
      </div>

      <!-- Card Action Buttons -->
      <div class="card-actions-row">
        <button type="button" class="btn-card-preview" title="Quick Specs Preview">
          <i data-lucide="eye" style="width:13px;height:13px;"></i>
          <span>Quick View</span>
        </button>
        <a href="../measurement360/measurement360.html?mobile=${encodeURIComponent(p.customerMobile || p.phone)}&garment=${encodeURIComponent(p.garment)}" class="btn-card-360" title="Open 360° Profile">
          <i data-lucide="ruler" style="width:13px;height:13px;"></i>
          <span>360° Profile</span>
        </a>
      </div>
    `;

    // Click handlers
    card.addEventListener('click', (e) => {
      // If user clicks the 360 button or its children, allow default navigation
      if (e.target.closest('.btn-card-360')) return;
      openDrawer(p);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        openDrawer(p);
      }
    });

    return card;
  }

  function renderGrid() {
    const grid = document.getElementById('measurementCardGrid');
    const skeleton = document.getElementById('skeletonGrid');
    const empty = document.getElementById('emptyState');
    const countEl = document.getElementById('panelCount');
    const paginationRow = document.getElementById('paginationRow');

    if (!grid) return;

    const filtered = getFilteredProfiles();
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / State.pageSize));

    if (State.currentPage > totalPages) {
      State.currentPage = totalPages;
    }

    // Hide skeleton, show grid or empty
    if (skeleton) skeleton.hidden = true;

    if (totalItems === 0) {
      grid.hidden = true;
      if (empty) empty.hidden = false;
      if (paginationRow) paginationRow.hidden = true;
      if (countEl) countEl.textContent = 'No matching profiles found';
      return;
    }

    grid.hidden = false;
    if (empty) empty.hidden = true;
    if (paginationRow) paginationRow.hidden = false;

    // Slice for pagination
    const start = (State.currentPage - 1) * State.pageSize;
    const end = Math.min(start + State.pageSize, totalItems);
    const pageItems = filtered.slice(start, end);

    if (countEl) {
      countEl.textContent = `Showing ${start + 1}–${end} of ${totalItems} measurement profiles`;
    }

    grid.innerHTML = '';
    pageItems.forEach(p => {
      grid.appendChild(renderCard(p));
    });

    renderPagination(totalPages);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================================================
  // 6. PAGINATION CONTROLLER
  // ==========================================================================
  function renderPagination(totalPages) {
    const pageInfo = document.getElementById('pageInfo');
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');
    const pageNumbers = document.getElementById('pageNumbers');

    if (pageInfo) {
      pageInfo.textContent = `Page ${State.currentPage} of ${totalPages}`;
    }

    if (btnPrev) btnPrev.disabled = State.currentPage === 1;
    if (btnNext) btnNext.disabled = State.currentPage === totalPages;

    if (pageNumbers) {
      pageNumbers.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const numBtn = document.createElement('button');
        numBtn.type = 'button';
        numBtn.className = `page-num ${i === State.currentPage ? 'active' : ''}`;
        numBtn.textContent = i;
        numBtn.addEventListener('click', () => {
          State.currentPage = i;
          renderGrid();
          window.scrollTo({ top: 300, behavior: 'smooth' });
        });
        pageNumbers.appendChild(numBtn);
      }
    }
  }

  // ==========================================================================
  // 7. QUICK-VIEW SIDE DRAWER
  // ==========================================================================
  function openDrawer(p) {
    State.selectedProfile = p;

    const drawer = document.getElementById('measurementDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    const avatarWrap = document.getElementById('drawerAvatarWrap');
    const nameEl = document.getElementById('drawerClientName');
    const metaEl = document.getElementById('drawerClientMeta');
    const bodyEl = document.getElementById('drawerBody');
    const fullLink = document.getElementById('drawerViewFull');
    const btnFull = document.getElementById('btnDrawerFull');

    if (!drawer || !backdrop) return;

    if (nameEl) nameEl.textContent = p.customerName;
    if (metaEl) metaEl.textContent = `${p.garment} Profile · ${p.phone} · ${p.id}`;

    if (avatarWrap) {
      avatarWrap.style.background = getAvatarGradient(p.customerName);
      avatarWrap.innerHTML = p.avatar 
        ? `<img src="${p.avatar}" alt="${p.customerName}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" /><span style="display:none;">${getInitials(p.customerName)}</span>`
        : `<span>${getInitials(p.customerName)}</span>`;
    }

    const fullUrl = `../measurement360/measurement360.html?mobile=${encodeURIComponent(p.customerMobile || p.phone)}&garment=${encodeURIComponent(p.garment)}`;
    if (fullLink) fullLink.href = fullUrl;
    if (btnFull) btnFull.href = fullUrl;

    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="drawer-specs-card">
          <div class="drawer-specs-header">
            <span class="specs-title">12-Point Fit Dimensions (${p.garment})</span>
            <span class="garment-badge ${p.garment.toLowerCase()}">${p.fitAccuracy}% Fit Score</span>
          </div>

          <div class="specs-grid">
            <div class="spec-item"><span class="spec-name">Shoulder</span><span class="spec-val">${p.shoulder}"</span></div>
            <div class="spec-item"><span class="spec-name">Bust / Chest</span><span class="spec-val">${p.bust}"</span></div>
            <div class="spec-item"><span class="spec-name">Under Bust</span><span class="spec-val">${p.underBust || '—'}"</span></div>
            <div class="spec-item"><span class="spec-name">Waist</span><span class="spec-val">${p.waist}"</span></div>
            <div class="spec-item"><span class="spec-name">Garment Length</span><span class="spec-val">${p.length}"</span></div>
            <div class="spec-item"><span class="spec-name">Sleeve Length</span><span class="spec-val">${p.sleeveLength || '—'}"</span></div>
            <div class="spec-item"><span class="spec-name">Front Neck Depth</span><span class="spec-val">${p.frontNeck || '—'}"</span></div>
            <div class="spec-item"><span class="spec-name">Back Neck Depth</span><span class="spec-val">${p.backNeck || '—'}"</span></div>
            <div class="spec-item"><span class="spec-name">Armhole</span><span class="spec-val">${p.armhole || '—'}"</span></div>
            <div class="spec-item"><span class="spec-name">Sleeve Round</span><span class="spec-val">${p.sleeveRound || '—'}"</span></div>
            <div class="spec-item"><span class="spec-name">Apex Length</span><span class="spec-val">${p.apexLength || '—'}"</span></div>
            <div class="spec-item"><span class="spec-name">Cross Front</span><span class="spec-val">${p.crossFront || '—'}"</span></div>
          </div>
        </div>

        <div class="drawer-notes-block">
          <div class="drawer-notes-title">
            <i data-lucide="file-text" style="width:13px;height:13px;"></i>
            Master Tailor Fitting Notes (${p.fittedBy})
          </div>
          <p>${p.notes}</p>
        </div>

        <div class="drawer-specs-card">
          <div class="drawer-specs-header">
            <span class="specs-title">Verification Meta</span>
            <span style="font-size:11px;color:var(--text-3);">${p.needsRemeasure ? '⚠️ Remeasurement Due' : '✅ Verified'}</span>
          </div>
          <p style="font-size:12px;color:var(--text-2);line-height:1.6;">
            Last measured on <strong>${formatDate(p.updatedDate)}</strong> by <strong>${p.fittedBy}</strong>. Dimensions are synced with client job cards and cutting masters across all workshops.
          </p>
        </div>
      `;
    }

    drawer.hidden = false;
    backdrop.hidden = false;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function closeDrawer() {
    const drawer = document.getElementById('measurementDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    if (drawer) drawer.hidden = true;
    if (backdrop) backdrop.hidden = true;
  }

  // ==========================================================================
  // 8. QUICK ADD MODAL
  // ==========================================================================
  function openAddModal() {
    const modal = document.getElementById('newMeasurementModal');
    if (modal) {
      modal.hidden = false;
      const firstInput = document.getElementById('inpCustomerName');
      if (firstInput) firstInput.focus();
    }
  }

  function closeAddModal() {
    const modal = document.getElementById('newMeasurementModal');
    if (modal) modal.hidden = true;
    const form = document.getElementById('newMeasurementForm');
    if (form) form.reset();
  }

  function handleSaveProfile(e) {
    e.preventDefault();

    const name = document.getElementById('inpCustomerName').value.trim();
    const phone = document.getElementById('inpPhone').value.trim();
    const garment = document.getElementById('inpGarment').value;
    const shoulder = parseFloat(document.getElementById('inpShoulder').value) || 0;
    const bust = parseFloat(document.getElementById('inpBust').value) || 0;
    const waist = parseFloat(document.getElementById('inpWaist').value) || 0;
    const length = parseFloat(document.getElementById('inpLength').value) || 0;
    const tailor = document.getElementById('inpTailor').value.trim() || '';
    const notes = document.getElementById('inpNotes').value.trim() || '';

    if (!name || !phone) {
      showToast('Please enter both client name and phone number.');
      return;
    }
    if (!tailor) {
      showToast('Please enter the tailor / staff name.');
      return;
    }

    const newId = `PRF-${Date.now()}`;

    const newProfile = {
      id: newId,
      customerMobile: phone,
      customerName: name,
      phone: phone,
      avatar: null,
      vip: false,
      garment: garment,
      shoulder: shoulder,
      bust: bust,
      underBust: 0,
      waist: waist,
      length: length,
      sleeveLength: 0,
      frontNeck: 0,
      backNeck: 0,
      armhole: 0,
      sleeveRound: 0,
      apexLength: 0,
      crossFront: 0,
      fitAccuracy: 0,
      fittedBy: tailor,
      updatedDate: new Date().toISOString().slice(0, 10),
      needsRemeasure: false,
      notes: notes
    };

    (async () => {
      try {
        const { default: api } = await import('../../api.js');
        const formattedMobile = phone.startsWith('+') ? phone : `+91 ${phone.replace(/\s+/g, '')}`;
        await api.customers.bodyMeasurements.save(formattedMobile, {
          garmentType: garment.toUpperCase(),
          shoulder: shoulder,
          bust: bust,
          underBust: bust - 4.0,
          waist: waist,
          blouseLength: length,
          topLength: length,
          fullLength: length,
          recordedBy: tailor,
          notes: notes
        });
        console.log('[MeasurementOverview] Saved measurement profile to customer_body_measurements table');
      } catch (err) {
        console.warn('[MeasurementOverview] API save error:', err.message);
      }
    })();

    State.profiles.unshift(newProfile);
    updateKPIs();
    renderGrid();
    closeAddModal();
    showToast(`Measurement Profile created for ${name}!`);
  }

  // ==========================================================================
  // 9. EXPORT CSV
  // ==========================================================================
  function exportCSV() {
    const data = getFilteredProfiles();
    if (data.length === 0) {
      showToast('No profiles to export.');
      return;
    }

    const headers = [
      'Profile ID',
      'Customer Name',
      'Phone',
      'Garment',
      'Shoulder (in)',
      'Bust (in)',
      'Waist (in)',
      'Length (in)',
      'Fit Accuracy (%)',
      'Fitted By',
      'Last Updated',
      'Notes'
    ];

    const rows = data.map(p => [
      `"${p.id}"`,
      `"${p.customerName}"`,
      `"${p.phone}"`,
      `"${p.garment}"`,
      p.shoulder,
      p.bust,
      p.waist,
      p.length,
      p.fitAccuracy,
      `"${p.fittedBy}"`,
      p.updatedDate,
      `"${p.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Haulo_Measurement_Profiles_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${data.length} measurement profiles to CSV`);
  }

  // ==========================================================================
  // 10. TOAST NOTIFICATION
  // ==========================================================================
  function showToast(msg) {
    const stack = document.getElementById('toastStack');
    if (!stack) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="check-circle" style="width:16px;height:16px;color:var(--lime);"></i>
      <span>${msg}</span>
    `;
    stack.appendChild(toast);

    if (window.lucide) {
      window.lucide.createIcons();
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }

  // ==========================================================================
  // 11. INITIALIZATION & EVENT LISTENERS
  // ==========================================================================
  function init() {
    // 1. Calculate & Render initial KPIs
    updateKPIs();

    // 2. Search Input with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          State.searchQuery = e.target.value.trim();
          State.currentPage = 1;
          renderGrid();
        }, 220);
      });
    }

    // 3. Filter Chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        State.activeFilter = chip.dataset.filter;
        State.currentPage = 1;
        renderGrid();
      });
    });

    // 4. Sort Select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        State.sortOrder = e.target.value;
        renderGrid();
      });
    }

    // 5. Pagination Prev / Next Buttons
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (State.currentPage > 1) {
          State.currentPage--;
          renderGrid();
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const totalPages = Math.ceil(getFilteredProfiles().length / State.pageSize);
        if (State.currentPage < totalPages) {
          State.currentPage++;
          renderGrid();
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }
      });
    }

    // 6. Drawer Close Listeners
    const drawerClose = document.getElementById('drawerClose');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

    // 7. Modal Open / Close Listeners
    const btnNew = document.getElementById('btnNewMeasurement');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const modalBackdrop = document.getElementById('newMeasurementModal');
    const modalForm = document.getElementById('newMeasurementForm');

    if (btnNew) btnNew.addEventListener('click', openAddModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeAddModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeAddModal);
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeAddModal();
      });
    }
    if (modalForm) modalForm.addEventListener('submit', handleSaveProfile);

    // 8. Export CSV
    const btnExport = document.getElementById('btnExport');
    if (btnExport) btnExport.addEventListener('click', exportCSV);

    // 9. Escape key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDrawer();
        closeAddModal();
      }
    });

    // 10. Shimmer delay simulation & render
    setTimeout(() => {
      renderGrid();
    }, 280);

    loadMeasurementsFromApi();
  }

  async function loadMeasurementsFromApi() {
    try {
      const { default: api, Auth } = await import('../../api.js');
      if (!Auth.isLoggedIn()) {
        window.location.href = '../../login/login.html';
        return;
      }
      const custPage = await api.customers.list({ page: 0, size: 50 });
      const custItems = Array.isArray(custPage) ? custPage : (custPage && custPage.content ? custPage.content : []);
      if (custItems.length > 0) {
        const fetchedProfiles = [];
        for (const c of custItems) {
          const mobile = c.mobileNumber || c.phone;
          try {
            let list = [];
            try {
              list = await api.customers.bodyMeasurements.list(mobile);
            } catch (_) {}
            if (!list || list.length === 0) {
              try {
                list = await api.customers.measurements.list(mobile);
              } catch (_) {}
            }
            if (!list || list.length === 0) {
              try {
                list = await api.measurements.listByCustomer(mobile);
              } catch (_) {}
            }

            if (list && list.length > 0) {
              for (const p of list) {
                const ptMap = {};
                (p.points || []).forEach(pt => {
                  ptMap[pt.pointName.toLowerCase().replace(/[^a-z]/g, '')] = Number(pt.value) || 0;
                });
                fetchedProfiles.push({
                  id: p.id,
                  customerMobile: mobile,
                  customerName: p.customerName || c.name,
                  phone: mobile,
                  avatar: c.avatarUrl || null,
                  vip: c.tier === 'VIP_PLATINUM' || c.tier === 'VIP_GOLD',
                  garment: p.garmentType || 'Blouse',
                  version: p.version || 1,
                  measurementType: p.measurementType || 'CURRENT',
                  isCurrent: p.isCurrent !== false,
                  shoulder: p.shoulder || ptMap['shoulder'] || 14,
                  bust: p.bust || ptMap['bust'] || ptMap['chest'] || 34,
                  underBust: p.underBust || ptMap['underbust'] || 30,
                  waist: p.waist || ptMap['waist'] || 28,
                  hip: p.hip || 38,
                  length: p.blouseLength || p.topLength || p.fullLength || p.garmentLength || ptMap['length'] || 14,
                  sleeveLength: p.sleeveLength || ptMap['sleevelength'] || 10.5,
                  frontNeck: p.frontNeckDepth || p.frontNeck || ptMap['frontneck'] || 6.5,
                  backNeck: p.backNeckDepth || p.backNeck || ptMap['backneck'] || 8.0,
                  armhole: p.armhole || ptMap['armhole'] || 16.0,
                  sleeveRound: p.sleeveRound || p.sleeveround || ptMap['sleeveround'] || 11.0,
                  apexLength: p.bustPoint || p.apexPoint || ptMap['apexlength'] || 10.0,
                  crossFront: p.frontWidth || p.crossFront || ptMap['crossfront'] || 12.5,
                  fitAccuracy: p.version && p.version > 1 ? 99 : 96,
                  fittedBy: p.recordedBy || 'Master Tailor',
                  updatedDate: p.updatedAt ? p.updatedAt.slice(0, 10) : (p.recordedAt ? p.recordedAt.slice(0, 10) : ''),
                  needsRemeasure: false,
                  notes: p.postureNotes || p.shapeNotes || p.notes || ''
                });
              }
            }
            // Customers with no measurements are excluded from the overview grid
            // (they should use the measurement360 page to record their first measurement)
          } catch (err) {
            console.warn('[Measurements] Error loading for customer:', mobile, err);
          }
        }
        PROFILES_DATA.length = 0;
        PROFILES_DATA.push(...fetchedProfiles);
        State.profiles = [...PROFILES_DATA];
        renderGrid();
        updateKPIs();
      }
    } catch (err) {
      console.error('[MeasurementOverview] Failed to load measurement profiles:', err.message);
    }
  }

  // Bootstrap when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
