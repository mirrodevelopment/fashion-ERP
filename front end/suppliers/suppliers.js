/**
 * Supplier Directory — HAULO Boutique ERP
 * suppliers.js
 *
 * Full lifecycle supplier directory management:
 * - Live backend integration via api.js (/api/v1/suppliers & /api/v1/purchases)
 * - Dynamic KPI computation (Total, Active Month, With POs, Specializations, Spend)
 * - Search & specialization filtering
 * - Split-pane layout with interactive Supplier 360° profile side panel
 * - Table / Card grid view switching
 * - Add / Edit / Delete supplier modals with validation
 * - Row context actions and toasts
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. STATE & CONSTANTS
     ========================================================================== */
  const state = {
    suppliers: [],
    pos: [],
    selectedSupplier: null,
    searchQuery: '',
    activeSpec: 'all',
    viewMode: 'table', // 'table' | 'card'
    currentPage: 1,
    pageSize: 15,
    activeActionSupplier: null, // supplier targeted by row dropdown
    supplierToDelete: null
  };

  /* ==========================================================================
     2. HELPERS
     ========================================================================== */
  function getSupplierAvatar(name) {
    if (!name || typeof name !== 'string') {
      return { initials: 'SP', color: '#B8FF3D', bg: 'rgba(184, 255, 61, 0.14)', border: 'rgba(184, 255, 61, 0.35)' };
    }
    const clean = name.trim();
    const parts = clean.split(/\s+/);
    let initials = '';
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (clean.length >= 2) {
      initials = clean.slice(0, 2).toUpperCase();
    } else {
      initials = (clean[0] || 'S').toUpperCase();
    }

    const accents = [
      { color: '#B8FF3D', bg: 'rgba(184, 255, 61, 0.14)', border: 'rgba(184, 255, 61, 0.35)' },
      { color: '#34d399', bg: 'rgba(52, 211, 153, 0.14)', border: 'rgba(52, 211, 153, 0.35)' },
      { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.14)', border: 'rgba(56, 189, 248, 0.35)' },
      { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.14)', border: 'rgba(251, 191, 36, 0.35)' },
      { color: '#f472b6', bg: 'rgba(244, 114, 182, 0.14)', border: 'rgba(244, 114, 182, 0.35)' },
      { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.14)', border: 'rgba(167, 139, 250, 0.35)' }
    ];
    let hash = 0;
    for (let i = 0; i < clean.length; i++) hash = (hash << 5) - hash + clean.charCodeAt(i);
    const accent = accents[Math.abs(hash) % accents.length];
    return { initials, color: accent.color, bg: accent.bg, border: accent.border };
  }

  function getInitials(name) {
    return getSupplierAvatar(name).initials;
  }

  function formatRupees(num) {
    const val = Number(num) || 0;
    return '₹' + Math.round(val).toLocaleString('en-IN');
  }

  function formatDate(d) {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d);
      return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (_) {
      return String(d);
    }
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  function getSupplierStats(supplierId, supplierName) {
    if (!state.pos || state.pos.length === 0) {
      return { totalPos: 0, totalValue: 0, lastOrder: '—', hasActivePo: false };
    }
    const matching = state.pos.filter(po => {
      if (po.supplier && (po.supplier.id === supplierId || po.supplier.name === supplierName)) return true;
      if (po.supplierId === supplierId) return true;
      return false;
    });

    const totalPos = matching.length;
    const totalValue = matching.reduce((sum, po) => sum + (Number(po.totalAmount) || 0), 0);
    let lastOrder = '—';
    if (matching.length > 0) {
      const dates = matching
        .map(po => po.orderDate || po.createdAt)
        .filter(Boolean)
        .sort()
        .reverse();
      if (dates[0]) lastOrder = formatDate(dates[0]);
    }
    const hasActivePo = matching.some(po => {
      const st = (po.status || '').toUpperCase();
      return st !== 'COMPLETED' && st !== 'CANCELLED' && st !== 'RECEIVED';
    });

    return { totalPos, totalValue, lastOrder, hasActivePo };
  }

  /* ==========================================================================
     3. KPI METRICS
     ========================================================================== */
  function renderKpis() {
    const totalEl = document.getElementById('kpiTotal');
    const totalTrendEl = document.getElementById('kpiTotalTrend');
    const activeEl = document.getElementById('kpiActive');
    const activeTrendEl = document.getElementById('kpiActiveTrend');
    const withPosEl = document.getElementById('kpiWithPos');
    const withPosTrendEl = document.getElementById('kpiWithPosTrend');
    const specsEl = document.getElementById('kpiSpecializations');
    const specsTrendEl = document.getElementById('kpiSpecializationsTrend');
    const valueEl = document.getElementById('kpiTotalValue');
    const valueTrendEl = document.getElementById('kpiTotalValueTrend');

    const totalCount = state.suppliers.length;
    if (totalEl) totalEl.textContent = totalCount;
    if (totalTrendEl) totalTrendEl.textContent = `${totalCount} registered vendors`;

    // Active this month: suppliers with PO within 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const activeVendorNames = new Set();
    let totalSpend = 0;
    let vendorsWithActivePosCount = 0;

    state.suppliers.forEach(s => {
      const stats = getSupplierStats(s.id, s.name);
      if (stats.hasActivePo) vendorsWithActivePosCount++;
    });

    state.pos.forEach(po => {
      totalSpend += (Number(po.totalAmount) || 0);
      const poDate = po.orderDate ? new Date(po.orderDate) : (po.createdAt ? new Date(po.createdAt) : null);
      if (poDate && poDate >= thirtyDaysAgo) {
        if (po.supplier && po.supplier.name) activeVendorNames.add(po.supplier.name);
      }
    });

    if (activeEl) activeEl.textContent = activeVendorNames.size;
    if (activeTrendEl) activeTrendEl.textContent = activeVendorNames.size > 0 ? `${activeVendorNames.size} ordered past 30d` : 'No recent orders';

    if (withPosEl) withPosEl.textContent = vendorsWithActivePosCount;
    if (withPosTrendEl) withPosTrendEl.textContent = vendorsWithActivePosCount > 0 ? `${vendorsWithActivePosCount} pending delivery` : 'All orders fulfilled';

    // Distinct specializations
    const specsSet = new Set();
    state.suppliers.forEach(s => {
      if (s.specialization && s.specialization.trim()) {
        s.specialization.split(/[,&/]/).forEach(p => {
          const trimmed = p.trim();
          if (trimmed) specsSet.add(trimmed);
        });
      }
    });

    if (specsEl) specsEl.textContent = specsSet.size;
    if (specsTrendEl) specsTrendEl.textContent = `${specsSet.size} material domains`;

    if (valueEl) valueEl.textContent = formatRupees(totalSpend);
    if (valueTrendEl) valueTrendEl.textContent = 'Cumulative procurement';
  }

  /* ==========================================================================
     4. SPECIALIZATION FILTER PILLS
     ========================================================================== */
  function renderSpecializationPills() {
    const container = document.getElementById('specializationPills');
    if (!container) return;

    // Collect distinct primary categories
    const specCounts = {};
    state.suppliers.forEach(s => {
      if (s.specialization && s.specialization.trim()) {
        const parts = s.specialization.split(/[,/]/).map(x => x.trim()).filter(Boolean);
        parts.forEach(p => {
          specCounts[p] = (specCounts[p] || 0) + 1;
        });
      }
    });

    const topSpecs = Object.entries(specCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(entry => entry[0]);

    let html = `<button type="button" class="tab-pill ${state.activeSpec === 'all' ? 'active' : ''}" data-spec="all">All (${state.suppliers.length})</button>`;
    topSpecs.forEach(spec => {
      const activeCls = state.activeSpec === spec ? 'active' : '';
      html += `<button type="button" class="tab-pill ${activeCls}" data-spec="${encodeURIComponent(spec)}">${spec} (${specCounts[spec]})</button>`;
    });

    container.innerHTML = html;

    container.querySelectorAll('.tab-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeSpec = decodeURIComponent(btn.getAttribute('data-spec') || 'all');
        state.currentPage = 1;
        container.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSuppliers();
      });
    });
  }

  /* ==========================================================================
     5. FILTERING & SEARCH
     ========================================================================== */
  function getFilteredSuppliers() {
    let list = [...state.suppliers];

    // Filter by Specialization
    if (state.activeSpec && state.activeSpec !== 'all') {
      const specLower = state.activeSpec.toLowerCase();
      list = list.filter(s => (s.specialization || '').toLowerCase().includes(specLower));
    }

    // Search query
    if (state.searchQuery && state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      list = list.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.supplierCode || '').toLowerCase().includes(q) ||
        (s.contactPerson || '').toLowerCase().includes(q) ||
        (s.phone || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.address || '').toLowerCase().includes(q) ||
        (s.specialization || '').toLowerCase().includes(q)
      );
    }

    return list;
  }

  /* ==========================================================================
     6. RENDER: TABLE VIEW & CARD VIEW
     ========================================================================== */
  function renderSuppliers() {
    const filtered = getFilteredSuppliers();
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / state.pageSize));

    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const startIdx = (state.currentPage - 1) * state.pageSize;
    const pagedItems = filtered.slice(startIdx, startIdx + state.pageSize);

    // Update Pagination Summary
    const summaryEl = document.getElementById('paginationSummary');
    if (summaryEl) {
      if (totalItems === 0) {
        summaryEl.textContent = 'Showing 0 suppliers';
      } else {
        const endIdx = Math.min(startIdx + state.pageSize, totalItems);
        summaryEl.textContent = `Showing ${startIdx + 1}–${endIdx} of ${totalItems} suppliers`;
      }
    }

    renderPaginationControls(totalPages);

    if (state.viewMode === 'table') {
      renderTableView(pagedItems);
    } else {
      renderCardView(pagedItems);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function renderTableView(items) {
    const tbody = document.getElementById('supplierTableBody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="table-empty-state">
            <i data-lucide="package-search"></i>
            <div>No suppliers found matching your criteria.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(s => {
      const isSelected = state.selectedSupplier && state.selectedSupplier.id === s.id;
      const av = getSupplierAvatar(s.name);
      const code = s.supplierCode || 'SUP-—';
      const contact = s.contactPerson || '—';
      const phone = s.phone || '';
      const email = s.email || '';
      const spec = s.specialization || 'General Supplies';
      const dateStr = formatDate(s.createdAt);

      return `
        <tr class="${isSelected ? 'active-row' : ''}" data-supplier-id="${s.id}">
          <td>
            <span class="supplier-code-badge">${code}</span>
          </td>
          <td>
            <div class="supplier-name-cell">
              <div class="supplier-avatar-sm" style="background:${av.bg};color:${av.color};border:1px solid ${av.border};">${av.initials}</div>
              <div>
                <div class="supplier-primary-name">${escapeHtml(s.name)}</div>
                ${s.address ? `<div class="supplier-sub-city">${escapeHtml(s.address.split(',')[0] || '')}</div>` : ''}
              </div>
            </div>
          </td>
          <td>
            <div class="contact-cell">
              <span class="contact-name">${escapeHtml(contact)}</span>
            </div>
          </td>
          <td>
            <div class="contact-cell">
              ${phone ? `<span class="contact-phone">${escapeHtml(phone)}</span>` : ''}
              ${email ? `<a href="mailto:${escapeHtml(email)}" class="contact-email" onclick="event.stopPropagation()">${escapeHtml(email)}</a>` : (!phone ? '<span class="contact-phone">—</span>' : '')}
            </div>
          </td>
          <td>
            <span class="spec-badge" title="${escapeHtml(spec)}">${escapeHtml(spec)}</span>
          </td>
          <td style="color:rgba(255,255,255,0.55);font-size:11.5px;">
            ${dateStr}
          </td>
          <td style="text-align:center;">
            <button type="button" class="row-action-btn action-menu-trigger" data-supplier-id="${s.id}" title="Actions" aria-label="Actions">
              <i data-lucide="more-vertical"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row clicks for selection
    tbody.querySelectorAll('tr').forEach(tr => {
      tr.addEventListener('click', (e) => {
        if (e.target.closest('.action-menu-trigger') || e.target.closest('a')) return;
        const id = tr.getAttribute('data-supplier-id');
        const sup = state.suppliers.find(x => x.id === id);
        if (sup) selectSupplier(sup);
      });
    });

    // Attach action dropdown triggers
    tbody.querySelectorAll('.action-menu-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-supplier-id');
        const sup = state.suppliers.find(x => x.id === id);
        if (sup) openActionDropdown(btn, sup);
      });
    });
  }

  function renderCardView(items) {
    const cardGrid = document.getElementById('cardViewSection');
    if (!cardGrid) return;

    if (items.length === 0) {
      cardGrid.innerHTML = `
        <div class="table-empty-state" style="grid-column: 1 / -1;">
          <i data-lucide="package-search"></i>
          <div>No suppliers found matching your criteria.</div>
        </div>
      `;
      return;
    }

    cardGrid.innerHTML = items.map(s => {
      const isSelected = state.selectedSupplier && state.selectedSupplier.id === s.id;
      const av = getSupplierAvatar(s.name);
      const code = s.supplierCode || 'SUP-—';
      const stats = getSupplierStats(s.id, s.name);

      return `
        <div class="supplier-grid-card ${isSelected ? 'active-card' : ''}" data-supplier-id="${s.id}">
          <div class="grid-card-head">
            <div class="grid-card-supplier">
              <div class="supplier-avatar-sm" style="width:36px;height:36px;font-size:12px;background:${av.bg};color:${av.color};border:1px solid ${av.border};">${av.initials}</div>
              <div>
                <div class="grid-card-title">${escapeHtml(s.name)}</div>
                <span class="supplier-code-badge" style="margin-top:2px;">${code}</span>
              </div>
            </div>
            <button type="button" class="row-action-btn action-menu-trigger" data-supplier-id="${s.id}" title="Actions">
              <i data-lucide="more-vertical"></i>
            </button>
          </div>
          <div class="grid-card-info">
            ${s.contactPerson ? `<div class="grid-card-info-item"><i data-lucide="user"></i><span>${escapeHtml(s.contactPerson)}</span></div>` : ''}
            ${s.phone ? `<div class="grid-card-info-item"><i data-lucide="phone"></i><span>${escapeHtml(s.phone)}</span></div>` : ''}
            ${s.specialization ? `<div class="grid-card-info-item"><i data-lucide="tag"></i><span class="spec-badge">${escapeHtml(s.specialization)}</span></div>` : ''}
          </div>
          <div class="grid-card-foot">
            <span style="font-size:11px;color:rgba(255,255,255,0.45);">${stats.totalPos} Orders</span>
            <span style="font-size:12px;font-weight:700;color:#34d399;">${formatRupees(stats.totalValue)}</span>
          </div>
        </div>
      `;
    }).join('');

    cardGrid.querySelectorAll('.supplier-grid-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.action-menu-trigger')) return;
        const id = card.getAttribute('data-supplier-id');
        const sup = state.suppliers.find(x => x.id === id);
        if (sup) selectSupplier(sup);
      });
    });

    cardGrid.querySelectorAll('.action-menu-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-supplier-id');
        const sup = state.suppliers.find(x => x.id === id);
        if (sup) openActionDropdown(btn, sup);
      });
    });
  }

  function renderPaginationControls(totalPages) {
    const controls = document.getElementById('paginationControls');
    if (!controls) return;

    if (totalPages <= 1) {
      controls.innerHTML = '';
      return;
    }

    let btns = '';
    btns += `<button type="button" class="page-btn" id="prevPageBtn" ${state.currentPage === 1 ? 'disabled' : ''}>&larr; Prev</button>`;

    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - state.currentPage) <= 1) {
        btns += `<button type="button" class="page-btn ${p === state.currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
      } else if (p === 2 || p === totalPages - 1) {
        btns += `<span style="padding:0 3px;color:rgba(255,255,255,0.3);">…</span>`;
      }
    }

    btns += `<button type="button" class="page-btn" id="nextPageBtn" ${state.currentPage === totalPages ? 'disabled' : ''}>Next &rarr;</button>`;
    controls.innerHTML = btns;

    controls.querySelectorAll('[data-page]').forEach(b => {
      b.addEventListener('click', () => {
        state.currentPage = parseInt(b.getAttribute('data-page'), 10);
        renderSuppliers();
      });
    });

    const prevBtn = controls.querySelector('#prevPageBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
          state.currentPage--;
          renderSuppliers();
        }
      });
    }

    const nextBtn = controls.querySelector('#nextPageBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.currentPage < totalPages) {
          state.currentPage++;
          renderSuppliers();
        }
      });
    }
  }

  /* ==========================================================================
     7. SUPPLIER 360° PROFILE SIDE PANEL
     ========================================================================== */
  function selectSupplier(sup) {
    state.selectedSupplier = sup;

    // Highlight row / card
    document.querySelectorAll('#supplierTableBody tr').forEach(tr => {
      tr.classList.toggle('active-row', tr.getAttribute('data-supplier-id') === sup.id);
    });
    document.querySelectorAll('.supplier-grid-card').forEach(c => {
      c.classList.toggle('active-card', c.getAttribute('data-supplier-id') === sup.id);
    });

    const emptyBox = document.getElementById('profilePanelEmpty');
    const contentBox = document.getElementById('profilePanelContent');
    if (emptyBox) emptyBox.style.display = 'none';
    if (contentBox) contentBox.style.display = 'flex';

    // Populate profile fields
    const avatarEl = document.getElementById('profileAvatar');
    const nameEl = document.getElementById('profileName');
    const codeEl = document.getElementById('profileCode');
    const specEl = document.getElementById('profileSpec');
    const contactEl = document.getElementById('profileContactPerson');
    const phoneEl = document.getElementById('profilePhone');
    const emailEl = document.getElementById('profileEmail');
    const addressEl = document.getElementById('profileAddress');
    const posEl = document.getElementById('profileTotalPos');
    const valEl = document.getElementById('profileTotalValue');
    const lastOrderEl = document.getElementById('profileLastOrder');
    const sinceEl = document.getElementById('profileSince');
    const notesSec = document.getElementById('profileNotesSection');
    const notesEl = document.getElementById('profileNotes');
    const viewPosLink = document.getElementById('profileViewPosBtn');

    const av = getSupplierAvatar(sup.name);
    if (avatarEl) {
      avatarEl.textContent = av.initials;
      avatarEl.style.background = av.bg;
      avatarEl.style.color = av.color;
      avatarEl.style.border = `1px solid ${av.border}`;
    }
    if (nameEl) nameEl.textContent = sup.name || '—';
    if (codeEl) codeEl.textContent = sup.supplierCode || 'SUP-—';
    if (specEl) specEl.textContent = sup.specialization || 'General Supplies';
    if (contactEl) contactEl.textContent = sup.contactPerson || 'No contact person specified';
    if (phoneEl) phoneEl.textContent = sup.phone || 'No phone number';
    if (emailEl) emailEl.textContent = sup.email || 'No email address';
    if (addressEl) addressEl.textContent = sup.address || 'No physical address provided';

    const stats = getSupplierStats(sup.id, sup.name);
    if (posEl) posEl.textContent = stats.totalPos;
    if (valEl) valEl.textContent = formatRupees(stats.totalValue);
    if (lastOrderEl) lastOrderEl.textContent = stats.lastOrder;
    if (sinceEl) sinceEl.textContent = formatDate(sup.createdAt);

    if (notesSec && notesEl) {
      if (sup.notes && sup.notes.trim()) {
        notesEl.textContent = sup.notes;
        notesSec.style.display = 'flex';
      } else {
        notesSec.style.display = 'none';
      }
    }

    if (viewPosLink) {
      viewPosLink.href = `../purchases/purchases.html?supplier=${encodeURIComponent(sup.name)}`;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function closeProfilePanel() {
    state.selectedSupplier = null;
    const emptyBox = document.getElementById('profilePanelEmpty');
    const contentBox = document.getElementById('profilePanelContent');
    if (emptyBox) emptyBox.style.display = 'flex';
    if (contentBox) contentBox.style.display = 'none';

    document.querySelectorAll('#supplierTableBody tr').forEach(tr => tr.classList.remove('active-row'));
    document.querySelectorAll('.supplier-grid-card').forEach(c => c.classList.remove('active-card'));
  }

  /* ==========================================================================
     8. ROW CONTEXT ACTIONS DROPDOWN
     ========================================================================== */
  function openActionDropdown(triggerBtn, supplier) {
    state.activeActionSupplier = supplier;
    const dd = document.getElementById('rowActionsDropdown');
    if (!dd) return;

    const rect = triggerBtn.getBoundingClientRect();
    const ddWidth = 180;
    let left = rect.left - ddWidth + 30;
    if (left < 10) left = 10;
    let top = rect.bottom + 6;

    dd.style.left = `${left}px`;
    dd.style.top = `${top}px`;
    dd.style.display = 'flex';

    if (window.lucide) window.lucide.createIcons();
  }

  function closeActionDropdown() {
    const dd = document.getElementById('rowActionsDropdown');
    if (dd) dd.style.display = 'none';
    state.activeActionSupplier = null;
  }

  /* ==========================================================================
     9. ADD / EDIT SUPPLIER MODAL
     ========================================================================== */
  function openSupplierModal(sup = null) {
    const modal = document.getElementById('supplierModal');
    const form = document.getElementById('supplierForm');
    const titleEl = document.getElementById('supplierModalTitle');
    const submitLabel = document.getElementById('submitSupplierLabel');
    if (!modal || !form) return;

    form.reset();

    if (sup) {
      // Edit mode
      if (titleEl) titleEl.textContent = 'Edit Supplier';
      if (submitLabel) submitLabel.textContent = 'Save Changes';
      document.getElementById('supplierIdField').value = sup.id || '';
      document.getElementById('supplierNameInput').value = sup.name || '';
      document.getElementById('supplierCodeInput').value = sup.supplierCode || '';
      document.getElementById('supplierContactInput').value = sup.contactPerson || '';
      document.getElementById('supplierPhoneInput').value = sup.phone || '';
      document.getElementById('supplierEmailInput').value = sup.email || '';
      document.getElementById('supplierSpecInput').value = sup.specialization || '';
      document.getElementById('supplierAddressInput').value = sup.address || '';
      document.getElementById('supplierNotesInput').value = sup.notes || '';
    } else {
      // Add mode
      if (titleEl) titleEl.textContent = 'Add Supplier';
      if (submitLabel) submitLabel.textContent = 'Add Supplier';
      document.getElementById('supplierIdField').value = '';
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      const nameInput = document.getElementById('supplierNameInput');
      if (nameInput) nameInput.focus();
    }, 50);

    if (window.lucide) window.lucide.createIcons();
  }

  function closeSupplierModal() {
    const modal = document.getElementById('supplierModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  async function handleSupplierSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('supplierIdField').value.trim();
    const name = document.getElementById('supplierNameInput').value.trim();
    const supplierCode = document.getElementById('supplierCodeInput').value.trim();
    const contactPerson = document.getElementById('supplierContactInput').value.trim();
    const phone = document.getElementById('supplierPhoneInput').value.trim();
    const email = document.getElementById('supplierEmailInput').value.trim();
    const specialization = document.getElementById('supplierSpecInput').value.trim();
    const address = document.getElementById('supplierAddressInput').value.trim();
    const notes = document.getElementById('supplierNotesInput').value.trim();

    if (!name) {
      showToast('Supplier Name is required.', 'error');
      return;
    }

    const payload = {
      name,
      supplierCode: supplierCode || undefined,
      contactPerson: contactPerson || null,
      phone: phone || null,
      email: email || null,
      specialization: specialization || null,
      address: address || null,
      notes: notes || null
    };

    const submitBtn = document.getElementById('submitSupplierBtn');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const { default: api } = await import('../api.js');

      let saved;
      if (id) {
        saved = await api.suppliers.update(id, payload);
        showToast(`Supplier "${name}" updated successfully.`, 'success');
      } else {
        saved = await api.suppliers.create(payload);
        showToast(`Supplier "${name}" created successfully.`, 'success');
      }

      closeSupplierModal();
      await loadAllData();
      if (saved) selectSupplier(saved);
    } catch (err) {
      console.error('[Suppliers] Save failed:', err);
      showToast(`Error saving supplier: ${err.message || 'Server error'}`, 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  /* ==========================================================================
     10. DELETE CONFIRMATION MODAL
     ========================================================================== */
  function openDeleteModal(sup) {
    state.supplierToDelete = sup;
    const modal = document.getElementById('deleteSupplierModal');
    const nameEl = document.getElementById('deleteSupplierName');
    if (!modal) return;

    if (nameEl) nameEl.textContent = sup.name;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    if (window.lucide) window.lucide.createIcons();
  }

  function closeDeleteModal() {
    const modal = document.getElementById('deleteSupplierModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
    state.supplierToDelete = null;
  }

  async function confirmDeleteSupplier() {
    if (!state.supplierToDelete) return;
    const sup = state.supplierToDelete;
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) confirmBtn.disabled = true;

    try {
      const { default: api } = await import('../api.js');
      await api.suppliers.delete(sup.id);
      showToast(`Supplier "${sup.name}" deleted.`, 'success');
      closeDeleteModal();
      if (state.selectedSupplier && state.selectedSupplier.id === sup.id) {
        closeProfilePanel();
      }
      await loadAllData();
    } catch (err) {
      console.error('[Suppliers] Delete failed:', err);
      showToast(err.message || 'Cannot delete supplier with active purchase orders.', 'error');
    } finally {
      if (confirmBtn) confirmBtn.disabled = false;
    }
  }

  /* ==========================================================================
     11. LIVE BACKEND DATA FETCHING
     ========================================================================== */
  async function loadAllData() {
    try {
      const { default: api } = await import('../api.js');

      const [supResult, poResult] = await Promise.all([
        api.suppliers.list({ size: 300 }).catch(err => {
          console.warn('[Suppliers] suppliers.list failed:', err);
          return [];
        }),
        api.purchases.list({ size: 500 }).catch(err => {
          console.warn('[Suppliers] purchases.list failed:', err);
          return [];
        })
      ]);

      state.suppliers = Array.isArray(supResult) ? supResult : (supResult?.content || []);
      state.pos = Array.isArray(poResult) ? poResult : (poResult?.content || []);

      renderKpis();
      renderSpecializationPills();
      renderSuppliers();

      // If a supplier was selected, refresh their stats
      if (state.selectedSupplier) {
        const fresh = state.suppliers.find(x => x.id === state.selectedSupplier.id);
        if (fresh) selectSupplier(fresh);
      } else if (state.suppliers.length > 0) {
        // Automatically select the first supplier for immediate rich experience
        selectSupplier(state.suppliers[0]);
      }
    } catch (err) {
      console.error('[Suppliers] loadAllData error:', err);
      showToast('Could not load suppliers from server.', 'error');
    }
  }

  /* ==========================================================================
     12. EVENT LISTENERS SETUP
     ========================================================================== */
  function setupEventListeners() {
    // Add Supplier Button
    const addBtn = document.getElementById('openAddSupplierBtn');
    if (addBtn) addBtn.addEventListener('click', () => openSupplierModal(null));

    // Close Modals
    const closeAddModal = document.getElementById('closeSupplierModal');
    if (closeAddModal) closeAddModal.addEventListener('click', closeSupplierModal);
    const cancelAddModal = document.getElementById('cancelSupplierModal');
    if (cancelAddModal) cancelAddModal.addEventListener('click', closeSupplierModal);

    const closeDelModal = document.getElementById('closeDeleteModal');
    if (closeDelModal) closeDelModal.addEventListener('click', closeDeleteModal);
    const cancelDelModal = document.getElementById('cancelDeleteModal');
    if (cancelDelModal) cancelDelModal.addEventListener('click', closeDeleteModal);
    const confirmDelBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDelBtn) confirmDelBtn.addEventListener('click', confirmDeleteSupplier);

    // Supplier Form Submit
    const form = document.getElementById('supplierForm');
    if (form) form.addEventListener('submit', handleSupplierSubmit);

    // Close Profile Side Panel
    const closePanelBtn = document.getElementById('closeProfilePanelBtn');
    if (closePanelBtn) closePanelBtn.addEventListener('click', closeProfilePanel);

    // Profile Panel Action Buttons
    const profileEditBtn = document.getElementById('profileEditBtn');
    if (profileEditBtn) {
      profileEditBtn.addEventListener('click', () => {
        if (state.selectedSupplier) openSupplierModal(state.selectedSupplier);
      });
    }

    const profileDeleteBtn = document.getElementById('profileDeleteBtn');
    if (profileDeleteBtn) {
      profileDeleteBtn.addEventListener('click', () => {
        if (state.selectedSupplier) openDeleteModal(state.selectedSupplier);
      });
    }

    // View Toggle (Table vs Cards)
    const tableViewBtn = document.getElementById('tableViewBtn');
    const cardViewBtn = document.getElementById('cardViewBtn');
    const tableSection = document.getElementById('tableViewSection');
    const cardSection = document.getElementById('cardViewSection');

    if (tableViewBtn && cardViewBtn) {
      tableViewBtn.addEventListener('click', () => {
        state.viewMode = 'table';
        tableViewBtn.classList.add('active');
        cardViewBtn.classList.remove('active');
        if (tableSection) tableSection.style.display = 'block';
        if (cardSection) cardSection.style.display = 'none';
        renderSuppliers();
      });

      cardViewBtn.addEventListener('click', () => {
        state.viewMode = 'card';
        cardViewBtn.classList.add('active');
        tableViewBtn.classList.remove('active');
        if (tableSection) tableSection.style.display = 'none';
        if (cardSection) cardSection.style.display = 'grid';
        renderSuppliers();
      });
    }

    // Search input
    const searchInput = document.getElementById('supplierSearchInput');
    if (searchInput) {
      let debounceTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          state.searchQuery = e.target.value;
          state.currentPage = 1;
          renderSuppliers();
        }, 200);
      });
    }

    // Context Dropdown Action Click Handler
    const dropdown = document.getElementById('rowActionsDropdown');
    if (dropdown) {
      dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          const action = item.getAttribute('data-action');
          const sup = state.activeActionSupplier;
          closeActionDropdown();
          if (!sup) return;

          if (action === 'view') {
            selectSupplier(sup);
          } else if (action === 'edit') {
            openSupplierModal(sup);
          } else if (action === 'pos') {
            window.location.href = `../purchases/purchases.html?supplier=${encodeURIComponent(sup.name)}`;
          } else if (action === 'delete') {
            openDeleteModal(sup);
          }
        });
      });
    }

    // Close Dropdowns and Modals on outside click
    document.addEventListener('click', (e) => {
      const dd = document.getElementById('rowActionsDropdown');
      if (dd && dd.style.display !== 'none' && !e.target.closest('#rowActionsDropdown') && !e.target.closest('.action-menu-trigger')) {
        closeActionDropdown();
      }
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSupplierModal();
        closeDeleteModal();
        closeActionDropdown();
      }
    });

    // Reload when branch or company changes in top bar
    window.addEventListener('haulo:branch-changed', () => {
      loadAllData();
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ==========================================================================
     13. INIT
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadAllData();
  });
})();
