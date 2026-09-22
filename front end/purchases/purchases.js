/**
 * Purchase & Supplier Management — Boutique Fashion ERP
 * purchases.js
 * 
 * Handles interactive charts, data filtering, pagination, search,
 * modals, dynamic order calculation, row action menus, and state management.
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. INITIAL STATE & MOCK DATA (Matches reference media_1789190336193.png)
     ========================================================================== */

  const SUPPLIER_AVATARS = {
    'Shree Textiles': { initials: 'ST', cls: 'st', color: '#10b981' },
    'Kumar Buttons': { initials: 'KB', cls: 'kb', color: '#60a5fa' },
    'Zari World': { initials: 'ZW', cls: 'zw', color: '#a855f7' },
    'Apex Trims': { initials: 'AT', cls: 'at', color: '#f59e0b' },
    'Sri Balaji Fashions': { initials: 'SB', cls: 'sb', color: '#14b8a6' },
    'R.K. Linings': { initials: 'RL', cls: 'rl', color: '#ec4899' },
    'Metro Labels': { initials: 'ML', cls: 'ml', color: '#3b82f6' },
    'Chennai Zippers': { initials: 'CZ', cls: 'cz', color: '#ef4444' },
    'Kala Silk Mills': { initials: 'KS', cls: 'st', color: '#a855f7' },
    'Sunrise Buttons': { initials: 'SB', cls: 'sb', color: '#10b981' }
  };

  // Full 24 Purchase Orders (Page 1 corresponds exactly to the 8 rows in reference image)
  // Master Purchase Orders Dataset (loaded from API)
  let INITIAL_POS = [];

  // Dynamic collections populated via API
  let RECENT_GRNS = [];
  let TOP_SUPPLIERS = [];
  let MONTHLY_DATA = [];

  // App State
  let state = {
    pos: loadStoredData() || INITIAL_POS,
    activeFilter: 'all',
    searchQuery: '',
    supplierFilter: 'all',
    currentPage: 1,
    pageSize: 8,
    selectedPoIds: new Set(),
    activeActionPoId: null
  };

  /* ==========================================================================
     2. PERSISTENCE HELPERS
     ========================================================================== */

  function loadStoredData() {
    try {
      const stored = localStorage.getItem('haulo_erp_purchases_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed reading localStorage', e);
    }
    return null;
  }

  function saveStoredData() {
    try {
      localStorage.setItem('haulo_erp_purchases_v2', JSON.stringify(state.pos));
    } catch (e) {
      console.warn('Failed writing to localStorage', e);
    }
  }

  function formatRupees(num) {
    if (typeof num !== 'number') num = Number(num) || 0;
    return '₹' + num.toLocaleString('en-IN');
  }

  /* ==========================================================================
     3. RENDER: KPI METRICS (Calibrated to reference image ₹8,42,500 base)
     ========================================================================== */

  async function updateKpiMetrics() {
    try {
      const { default: api } = await import('../api.js');
      const kpis = await api.purchases.kpis().catch(() => null);
      if (kpis) {
        const kpiTotalPos = document.getElementById('kpiTotalPos');
        const kpiTotalVal = document.getElementById('kpiTotalValue');
        const kpiPending = document.getElementById('kpiPendingDeliveries');
        const kpiReceived = document.getElementById('kpiGoodsReceived');
        const kpiSuppliers = document.getElementById('kpiActiveSuppliers');

        if (kpiTotalPos && kpis.totalPos != null) kpiTotalPos.textContent = kpis.totalPos;
        if (kpiTotalVal && kpis.totalValue != null) kpiTotalVal.textContent = formatRupees(Number(kpis.totalValue));
        if (kpiPending && kpis.pendingDeliveries != null) kpiPending.textContent = kpis.pendingDeliveries;
        if (kpiReceived && kpis.goodsReceived != null) kpiReceived.textContent = kpis.goodsReceived;
        if (kpiSuppliers && kpis.activeSuppliers != null) kpiSuppliers.textContent = kpis.activeSuppliers;
        return;
      }
    } catch (_) {}

    const totalCount = state.pos.length;
    const displayTotalVal = state.pos.reduce((sum, p) => sum + (Number(p.totalValue) || 0), 0);
    const pendingDeliv = state.pos.filter(p => p.status === 'Sent' || p.status === 'Partially Received' || p.status === 'Ordered').length;
    const goodsReceived = state.pos.filter(p => p.status === 'Received').length;
    const activeSuppliers = new Set(state.pos.map(p => p.supplier)).size;

    const kpiTotalPos = document.getElementById('kpiTotalPos');
    const kpiTotalVal = document.getElementById('kpiTotalValue');
    const kpiPending = document.getElementById('kpiPendingDeliveries');
    const kpiReceived = document.getElementById('kpiGoodsReceived');
    const kpiSuppliers = document.getElementById('kpiActiveSuppliers');

    if (kpiTotalPos) kpiTotalPos.textContent = totalCount;
    if (kpiTotalVal) kpiTotalVal.textContent = formatRupees(displayTotalVal);
    if (kpiPending) kpiPending.textContent = pendingDeliv;
    if (kpiReceived) kpiReceived.textContent = goodsReceived;
    if (kpiSuppliers) kpiSuppliers.textContent = activeSuppliers;
  }

  /* ==========================================================================
     4. RENDER: DONUT CHART (Purchase Order Status)
     ========================================================================== */

  function renderStatusDonutChart() {
    const svg = document.getElementById('poStatusDonut');
    const legend = document.getElementById('poStatusLegend');
    const donutTotalCount = document.getElementById('donutTotalCount');
    if (!svg || !legend) return;

    // Calculate current distribution
    const counts = {
      'Draft': 0,
      'Sent': 0,
      'Partially Received': 0,
      'Received': 0,
      'Cancelled': 0
    };

    state.pos.forEach(p => {
      if (counts[p.status] !== undefined) counts[p.status]++;
    });

    const total = state.pos.length || 1;
    if (donutTotalCount) donutTotalCount.textContent = total;

    const segments = [
      { key: 'Draft',              label: 'Draft',              color: '#f59e0b', count: counts['Draft'] },
      { key: 'Sent',               label: 'Sent',               color: '#60a5fa', count: counts['Sent'] },
      { key: 'Partially Received', label: 'Partially Received', color: '#a855f7', count: counts['Partially Received'] },
      { key: 'Received',           label: 'Received',           color: '#10b981', count: counts['Received'] },
      { key: 'Cancelled',          label: 'Cancelled',          color: '#ef4444', count: counts['Cancelled'] }
    ];

    // Compute stroke dasharray on viewBox 0 0 36 36 (radius = 15.9155 => circumference = 100)
    let accumulated = 0;
    let svgHtml = '';

    segments.forEach(seg => {
      const pct = (seg.count / total) * 100;
      if (pct <= 0) return;
      
      const strokeDash = `${pct} ${100 - pct}`;
      const strokeOffset = 100 - accumulated + 25; // start from top (rotate 90deg equivalent)

      svgHtml += `
        <circle class="donut-ring-segment"
                cx="18" cy="18" r="15.91549430918954"
                fill="transparent"
                stroke="${seg.color}"
                stroke-width="3.8"
                stroke-dasharray="${strokeDash}"
                stroke-dashoffset="${strokeOffset}"
                data-key="${seg.key}"
                title="${seg.label}: ${seg.count} (${Math.round(pct)}%)">
        </circle>
      `;
      accumulated += pct;
    });

    svg.innerHTML = svgHtml;

    // Render legend using exact CSS classes
    legend.innerHTML = segments.map(seg => {
      const pct = Math.round((seg.count / total) * 100);
      return `
        <div class="status-legend-row" data-filter="${seg.key}" style="cursor:pointer;" title="Filter by ${seg.label}">
          <div class="legend-label-col">
            <span class="color-dot" style="background:${seg.color};"></span>
            <span class="legend-name">${seg.label}</span>
          </div>
          <div class="legend-val-col">
            <span>${seg.count} (${pct}%)</span>
          </div>
        </div>
      `;
    }).join('');

    // Allow clicking legend row to filter table
    legend.querySelectorAll('.status-legend-row').forEach(row => {
      row.addEventListener('click', () => {
        const filterKey = row.getAttribute('data-filter');
        setFilter(filterKey);
      });
    });
  }

  /* ==========================================================================
     5. RENDER: MONTHLY STACKED BAR CHART
     ========================================================================== */

  function renderMonthlyBarChart() {
    const container = document.getElementById('monthlyBarChartContainer');
    if (!container) return;

    // Max value scale is 8 Lakhs
    const maxVal = 8.5; // Lakhs scale
    const chartHeight = 155;
    const chartWidth = 520;
    const paddingLeft = 38;
    const paddingRight = 14;
    const paddingTop = 12;
    const paddingBottom = 26;

    const plotHeight = chartHeight - paddingTop - paddingBottom;
    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const numBars = MONTHLY_DATA.length;
    const barSlotWidth = plotWidth / numBars;
    const barWidth = 14; // clean slender bar matching reference

    // Y Axis levels: 8L, 6L, 4L, 2L, 0
    const yLevels = [8, 6, 4, 2, 0];
    let gridLinesHtml = '';
    let yLabelsHtml = '';

    yLevels.forEach(lvl => {
      const yPos = paddingTop + plotHeight - ((lvl / maxVal) * plotHeight);
      gridLinesHtml += `
        <line x1="${paddingLeft}" y1="${yPos}" x2="${chartWidth - paddingRight}" y2="${yPos}" 
              stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="${lvl === 0 ? '0' : '3 3'}" />
      `;
      yLabelsHtml += `
        <text x="${paddingLeft - 8}" y="${yPos + 3.5}" fill="rgba(255,255,255,0.38)" 
              font-size="9.5" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="end">${lvl}L</text>
      `;
    });

    let barsHtml = '';
    MONTHLY_DATA.forEach((item, idx) => {
      const centerX = paddingLeft + (idx * barSlotWidth) + (barSlotWidth / 2);
      const barX = centerX - (barWidth / 2);

      const matHeight = (item.materials / maxVal) * plotHeight;
      const trimHeight = (item.trims / maxVal) * plotHeight;

      const baseY = paddingTop + plotHeight;
      const matY = baseY - matHeight;
      const trimY = matY - trimHeight;

      barsHtml += `
        <g class="bar-group" data-month="${item.month}" data-val="${item.totalVal}" data-mat="₹${item.materials}L" data-trim="₹${item.trims}L">
          <!-- Background hover track -->
          <rect x="${barX - 4}" y="${paddingTop}" width="${barWidth + 8}" height="${plotHeight}" 
                fill="transparent" class="bar-hover-zone" rx="4" />
          
          <!-- Materials Bar (Purple bottom) -->
          <rect x="${barX}" y="${matY}" width="${barWidth}" height="${matHeight}" 
                fill="#a855f7" rx="0" class="bar-mat" />

          <!-- Trims Bar (Lime top, rounded upper corners) -->
          <path d="M ${barX} ${trimY + 3} 
                   Q ${barX} ${trimY} ${barX + 3} ${trimY} 
                   L ${barX + barWidth - 3} ${trimY} 
                   Q ${barX + barWidth} ${trimY} ${barX + barWidth} ${trimY + 3} 
                   L ${barX + barWidth} ${matY} 
                   L ${barX} ${matY} Z" 
                fill="#d4ff32" class="bar-trim" />

          <!-- Month Label -->
          <text x="${centerX}" y="${baseY + 16}" fill="rgba(255,255,255,0.45)" 
                font-size="10" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">${item.month}</text>
        </g>
      `;
    });

    container.innerHTML = `
      <svg viewBox="0 0 ${chartWidth} ${chartHeight}" class="monthly-svg-chart" style="width:100%; height:100%;">
        ${gridLinesHtml}
        ${yLabelsHtml}
        ${barsHtml}
      </svg>
      <div class="chart-tooltip" id="chartTooltip"></div>
    `;

    // Add interactive hover tooltip
    const tooltip = container.querySelector('#chartTooltip');
    container.querySelectorAll('.bar-group').forEach(group => {
      group.addEventListener('mouseenter', (e) => {
        const month = group.getAttribute('data-month');
        const val = group.getAttribute('data-val');
        const mat = group.getAttribute('data-mat');
        const trim = group.getAttribute('data-trim');

        tooltip.innerHTML = `
          <div class="tt-header">${month} 2026: <strong>${val}</strong></div>
          <div class="tt-row"><span class="tt-dot purple"></span>Materials: ${mat}</div>
          <div class="tt-row"><span class="tt-dot lime"></span>Trims: ${trim}</div>
        `;
        tooltip.style.opacity = '1';
      });

      group.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left + 12;
        const y = e.clientY - rect.top - 38;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      });

      group.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
      });
    });
  }

  /* ==========================================================================
     6. RENDER: TOP SUPPLIERS BY PURCHASE VALUE
     ========================================================================== */

  function renderTopSuppliers() {
    const list = document.getElementById('topSuppliersList');
    if (!list) return;

    list.innerHTML = TOP_SUPPLIERS.map(s => {
      return `
        <div class="supplier-rank-row">
          <div class="supplier-rank-avatar ${s.cls}">${s.initials}</div>
          <div class="supplier-rank-name" title="${s.name}">${s.name}</div>
          <div class="supplier-progress-track">
            <div class="supplier-progress-fill" style="width: ${s.percent}%; background: ${s.color};"></div>
          </div>
          <div class="supplier-rank-val">${formatRupees(s.value)} <span style="font-size:9.5px; opacity:0.65;">(${s.percent}%)</span></div>
        </div>
      `;
    }).join('');
  }

  /* ==========================================================================
     7. RENDER: RECENT GOODS RECEIPTS
     ========================================================================== */

  function renderRecentGrns() {
    const tbody = document.getElementById('grnTableBody');
    if (!tbody) return;

    tbody.innerHTML = RECENT_GRNS.map(grn => {
      const statusClass = grn.status === 'Received' ? 'status-received' : 'status-partially';
      return `
        <tr>
          <td><span class="grn-id-badge">${grn.id}</span></td>
          <td><span class="grn-po-link" data-po="${grn.po}">${grn.po}</span></td>
          <td style="color:rgba(255,255,255,0.65);">${grn.date}</td>
          <td style="text-align:center; font-weight:600; color:rgba(255,255,255,0.85);">${grn.items}</td>
          <td><span class="grn-status-pill ${statusClass}">${grn.status}</span></td>
        </tr>
      `;
    }).join('');

    // Clicking PO link searches for that PO
    tbody.querySelectorAll('.grn-po-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const poId = link.getAttribute('data-po');
        const searchInput = document.getElementById('poSearchInput');
        if (searchInput) {
          searchInput.value = poId;
          state.searchQuery = poId.toLowerCase();
          state.currentPage = 1;
          renderTable();
          showToast(`Filtered to PO: ${poId}`, 'info');
        }
      });
    });
  }

  /* ==========================================================================
     8. RENDER: PURCHASE ORDERS TABLE, TABS, SEARCH, PAGINATION
     ========================================================================== */

  function getFilteredPOs() {
    return state.pos.filter(po => {
      // 1. Status Filter
      if (state.activeFilter !== 'all') {
        if (po.status !== state.activeFilter) return false;
      }

      // 2. Supplier Filter (from modal or quick click)
      if (state.supplierFilter !== 'all') {
        if (po.supplier !== state.supplierFilter) return false;
      }

      // 3. Search Query
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        const matchesId = po.id.toLowerCase().includes(query);
        const matchesSupplier = po.supplier.toLowerCase().includes(query);
        const matchesStatus = po.status.toLowerCase().includes(query);
        const matchesItem = po.itemsList && po.itemsList.some(i => i.name.toLowerCase().includes(query));
        if (!matchesId && !matchesSupplier && !matchesStatus && !matchesItem) return false;
      }

      return true;
    });
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Draft': return 'draft';
      case 'Sent': return 'sent';
      case 'Partially Received': return 'partially-received';
      case 'Received': return 'received';
      case 'Cancelled': return 'cancelled';
      default: return 'draft';
    }
  }

  function renderTable() {
    const tbody = document.getElementById('poTableBody');
    const selectAllCb = document.getElementById('selectAllPoCheckbox');
    const summarySpan = document.getElementById('paginationSummary');
    if (!tbody) return;

    const filtered = getFilteredPOs();
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / state.pageSize));

    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const startIndex = (state.currentPage - 1) * state.pageSize;
    const pageItems = filtered.slice(startIndex, startIndex + state.pageSize);

    // Update Pagination Summary
    if (summarySpan) {
      if (totalItems === 0) {
        summarySpan.textContent = 'No matching purchase orders found';
      } else {
        const displayStart = startIndex + 1;
        const displayEnd = Math.min(startIndex + state.pageSize, totalItems);
        summarySpan.textContent = `Showing ${displayStart}–${displayEnd} of ${totalItems} purchase orders`;
      }
    }

    // Render Rows
    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding: 42px 16px; color:rgba(255,255,255,0.4);">
            <div style="font-size: 28px; margin-bottom: 8px;">📑</div>
            <div style="font-size: 14px; font-weight: 500; color:rgba(255,255,255,0.7);">No Purchase Orders Match Your Criteria</div>
            <div style="font-size: 12px; margin-top: 4px;">Try clearing filters or search terms.</div>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = pageItems.map(po => {
        const avatarInfo = SUPPLIER_AVATARS[po.supplier] || { initials: po.supplier.substring(0, 2).toUpperCase(), cls: 'st', color: '#10b981' };
        const statusBadgeCls = getStatusBadgeClass(po.status);

        return `
          <tr data-po-id="${po.id}">
            <td>
              <span class="po-id-txt po-id-link" data-po-id="${po.id}">${po.id}</span>
            </td>
            <td>
              <span class="po-date-cell">${po.date}</span>
            </td>
            <td>
              <div class="supplier-cell">
                <div class="supplier-badge-sm ${avatarInfo.cls}">${avatarInfo.initials}</div>
                <span class="supplier-name-txt" title="${po.supplier}">${po.supplier}</span>
              </div>
            </td>
            <td style="text-align:center;">
              <span class="items-count-pill">${po.itemsCount}</span>
            </td>
            <td>
              <span class="val-txt">${formatRupees(po.totalValue)}</span>
            </td>
            <td>
              <span class="status-pill ${statusBadgeCls}">${po.status}</span>
            </td>
            <td>
              <span class="delivery-date-cell">${po.expectedDelivery}</span>
            </td>
            <td style="text-align:center;">
              <button type="button" class="btn-action-dots" data-po-id="${po.id}" title="Row Options" aria-label="Actions for ${po.id}">
                &bull;&bull;&bull;
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // PO ID click opens quick detail
    tbody.querySelectorAll('.po-id-link').forEach(link => {
      link.addEventListener('click', () => {
        const id = link.getAttribute('data-po-id');
        openPoDetailsToast(id);
      });
    });

    // Bind row action trigger buttons (•••)
    tbody.querySelectorAll('.btn-action-dots').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-po-id');
        toggleRowActionsMenu(btn, id);
      });
    });

    renderPaginationControls(totalPages);
    updateFilterTabCounts();
  }

  function renderPaginationControls(totalPages) {
    const controls = document.getElementById('paginationControls');
    if (!controls) return;

    let html = `
      <button type="button" class="page-nav-btn prev ${state.currentPage === 1 ? 'disabled' : ''}" id="prevPageBtn" title="Previous Page">&lsaquo;</button>
    `;

    for (let p = 1; p <= totalPages; p++) {
      html += `
        <button type="button" class="page-num-btn ${p === state.currentPage ? 'active' : ''}" data-page="${p}">${p}</button>
      `;
    }

    html += `
      <button type="button" class="page-nav-btn next ${state.currentPage === totalPages ? 'disabled' : ''}" id="nextPageBtn" title="Next Page">&rsaquo;</button>
    `;

    controls.innerHTML = html;

    // Bind page buttons
    controls.querySelectorAll('.page-num-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = Number(btn.getAttribute('data-page'));
        if (page !== state.currentPage) {
          state.currentPage = page;
          renderTable();
        }
      });
    });

    const prevBtn = controls.querySelector('#prevPageBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
          state.currentPage--;
          renderTable();
        }
      });
    }

    const nextBtn = controls.querySelector('#nextPageBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.currentPage < totalPages) {
          state.currentPage++;
          renderTable();
        }
      });
    }
  }

  function updateFilterTabCounts() {
    const tabsContainer = document.getElementById('poFilterTabs');
    if (!tabsContainer) return;

    const counts = {
      'all': state.pos.length,
      'Draft': state.pos.filter(p => p.status === 'Draft').length,
      'Sent': state.pos.filter(p => p.status === 'Sent').length,
      'Partially Received': state.pos.filter(p => p.status === 'Partially Received').length,
      'Received': state.pos.filter(p => p.status === 'Received').length,
      'Cancelled': state.pos.filter(p => p.status === 'Cancelled').length
    };

    tabsContainer.querySelectorAll('.tab-pill').forEach(btn => {
      const filterKey = btn.getAttribute('data-filter');
      let label = 'All POs';
      if (filterKey === 'Draft') label = 'Draft';
      else if (filterKey === 'Sent') label = 'Sent';
      else if (filterKey === 'Partially Received') label = 'Partially Received';
      else if (filterKey === 'Received') label = 'Received';
      else if (filterKey === 'Cancelled') label = 'Cancelled';

      const count = counts[filterKey] !== undefined ? counts[filterKey] : 0;
      btn.textContent = `${label} (${count})`;
      if (filterKey === state.activeFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function setFilter(filterVal) {
    state.activeFilter = filterVal;
    state.currentPage = 1;
    updateFilterTabCounts();
    renderTable();
  }

  /* ==========================================================================
     9. ROW CONTEXT ACTION DROPDOWN MENU
     ========================================================================== */

  const rowDropdown = document.getElementById('rowActionsDropdown');

  function toggleRowActionsMenu(buttonEl, poId) {
    if (!rowDropdown) return;

    if (state.activeActionPoId === poId && rowDropdown.style.display === 'block') {
      closeRowActionsMenu();
      return;
    }

    state.activeActionPoId = poId;
    rowDropdown.style.display = 'block';

    const rect = buttonEl.getBoundingClientRect();
    const dropdownWidth = 190;
    const dropdownHeight = 220;

    let top = rect.bottom + window.scrollY + 4;
    let left = rect.right + window.scrollX - dropdownWidth;

    // Prevent viewport overflow
    if (left < 10) left = 10;
    if (rect.bottom + dropdownHeight > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - dropdownHeight - 4;
    }

    rowDropdown.style.top = `${top}px`;
    rowDropdown.style.left = `${left}px`;
  }

  function closeRowActionsMenu() {
    if (rowDropdown) {
      rowDropdown.style.display = 'none';
    }
    state.activeActionPoId = null;
  }

  function initRowActions() {
    if (!rowDropdown) return;

    // Handle menu clicks
    rowDropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        const poId = state.activeActionPoId;
        closeRowActionsMenu();
        if (!poId) return;

        handleRowAction(action, poId);
      });
    });

    // Close when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (rowDropdown && rowDropdown.style.display === 'block') {
        if (!rowDropdown.contains(e.target) && !e.target.closest('.btn-table-action')) {
          closeRowActionsMenu();
        }
      }
    });

    window.addEventListener('resize', closeRowActionsMenu);
    window.addEventListener('scroll', closeRowActionsMenu, { passive: true });
  }

  function handleRowAction(action, poId) {
    const po = state.pos.find(p => p.id === poId);
    if (!po) return;

    switch (action) {
      case 'view':
        openPoDetailsToast(poId);
        break;
      case 'edit':
        showToast(`Editing ${po.id} — Status: ${po.status}`, 'info');
        break;
      case 'receive':
        if (po.status === 'Received') {
          showToast(`${po.id} has already been fully received.`, 'warning');
        } else {
          po.status = 'Received';
          saveStoredData();
          updateKpiMetrics();
          renderStatusDonutChart();
          renderTable();
          showToast(`Goods received recorded for ${po.id}! Status updated to Received.`, 'success');
        }
        break;
      case 'duplicate':
        const newPoId = generateNextPoNumber();
        const copy = JSON.parse(JSON.stringify(po));
        copy.id = newPoId;
        copy.status = 'Draft';
        copy.date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        state.pos.unshift(copy);
        saveStoredData();
        updateKpiMetrics();
        renderStatusDonutChart();
        renderTable();
        showToast(`Purchase order duplicated as ${newPoId}`, 'success');
        break;
      case 'download':
        showToast(`Generated and downloaded PDF purchase order for ${po.id}`, 'info');
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${po.id}? This action cannot be undone.`)) {
          state.pos = state.pos.filter(p => p.id !== poId);
          state.selectedPoIds.delete(poId);
          saveStoredData();
          updateKpiMetrics();
          renderStatusDonutChart();
          renderTable();
          showToast(`Purchase order ${poId} deleted.`, 'info');
        }
        break;
    }
  }

  function openPoDetailsToast(poId) {
    const po = state.pos.find(p => p.id === poId);
    if (!po) return;

    showToast(`
      <strong>${po.id}</strong> &bull; ${po.supplier}<br>
      Total: ${formatRupees(po.totalValue)} &bull; ${po.itemsCount} items<br>
      Status: <em>${po.status}</em> &bull; Expected: ${po.expectedDelivery}
    `, 'info', 5000);
  }

  /* ==========================================================================
     10. CREATE PURCHASE ORDER MODAL & LINE ITEM CALCULATIONS
     ========================================================================== */

  function generateNextPoNumber() {
    let maxNum = 24;
    state.pos.forEach(p => {
      const match = p.id.match(/PO-2026-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `PO-2026-${String(maxNum + 1).padStart(4, '0')}`;
  }

  function initCreatePoModal() {
    const openBtn = document.getElementById('openCreatePoModalBtn');
    const modal = document.getElementById('createPoModal');
    const closeBtn = document.getElementById('closeCreatePoModal');
    const cancelBtn = document.getElementById('cancelCreatePoModal');
    const form = document.getElementById('createPoForm');
    const addItemBtn = document.getElementById('addPoLineItemBtn');
    const itemsTbody = document.getElementById('poLineItemsBody');
    const poNumberInput = document.getElementById('poNumberInput');
    const poDateInput = document.getElementById('poDateInput');
    const poExpectedDelivery = document.getElementById('poExpectedDeliveryInput');

    if (!modal) return;

    // Set today's date and default +7 days delivery
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    function openModal() {
      if (poNumberInput) poNumberInput.value = generateNextPoNumber();
      if (poDateInput) poDateInput.value = todayStr;
      if (poExpectedDelivery) poExpectedDelivery.value = nextWeekStr;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      calculateModalTotals();
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Close on overlay backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Add new order line item
    if (addItemBtn && itemsTbody) {
      addItemBtn.addEventListener('click', () => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><input type="text" class="form-input-sm" placeholder="Material / Fabric name" required /></td>
          <td><input type="number" class="form-input-sm qty-input" value="1" min="1" required /></td>
          <td><input type="number" class="form-input-sm price-input" value="500" min="0" required /></td>
          <td class="line-total-td">₹500</td>
          <td style="text-align:center;"><button type="button" class="btn-del-line" title="Remove line">&times;</button></td>
        `;
        itemsTbody.appendChild(tr);
        bindLineItemEvents(tr);
        calculateModalTotals();
      });
    }

    // Bind initial line items
    if (itemsTbody) {
      itemsTbody.querySelectorAll('tr').forEach(tr => bindLineItemEvents(tr));
    }

    function bindLineItemEvents(tr) {
      const qtyInput = tr.querySelector('.qty-input');
      const priceInput = tr.querySelector('.price-input');
      const totalTd = tr.querySelector('.line-total-td');
      const delBtn = tr.querySelector('.btn-del-line');

      function updateLine() {
        const qty = parseFloat(qtyInput.value) || 0;
        const rate = parseFloat(priceInput.value) || 0;
        const total = qty * rate;
        totalTd.textContent = formatRupees(total);
        calculateModalTotals();
      }

      if (qtyInput) qtyInput.addEventListener('input', updateLine);
      if (priceInput) priceInput.addEventListener('input', updateLine);

      if (delBtn) {
        delBtn.addEventListener('click', () => {
          if (itemsTbody.querySelectorAll('tr').length <= 1) {
            showToast('A purchase order must have at least one line item.', 'warning');
            return;
          }
          tr.remove();
          calculateModalTotals();
        });
      }
    }

    function calculateModalTotals() {
      let subtotal = 0;
      itemsTbody.querySelectorAll('tr').forEach(tr => {
        const qty = parseFloat(tr.querySelector('.qty-input')?.value) || 0;
        const rate = parseFloat(tr.querySelector('.price-input')?.value) || 0;
        subtotal += (qty * rate);
      });

      const tax = Math.round(subtotal * 0.05); // 5% GST
      const grandTotal = subtotal + tax;

      const subtotalEl = document.getElementById('modalSubtotal');
      const taxEl = document.getElementById('modalTax');
      const grandEl = document.getElementById('modalGrandTotal');

      if (subtotalEl) subtotalEl.textContent = formatRupees(subtotal);
      if (taxEl) taxEl.textContent = formatRupees(tax);
      if (grandEl) grandEl.textContent = formatRupees(grandTotal);
    }

    // Submit new PO
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const poNumber = poNumberInput.value.trim() || generateNextPoNumber();
        const supplier = document.getElementById('poSupplierSelect').value;
        const orderDate = poDateInput.value;
        const expDate = poExpectedDelivery.value;

        // Parse date for table format: "12 Sep 2026"
        const dObj = new Date(orderDate);
        const formattedDate = isNaN(dObj.getTime())
          ? '12 Sep 2026'
          : dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const expObj = new Date(expDate);
        const formattedExpDate = isNaN(expObj.getTime())
          ? '19 Sep 2026'
          : expObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        // Collect items
        const items = [];
        let itemsCount = 0;
        let grandTotal = 0;

        itemsTbody.querySelectorAll('tr').forEach(tr => {
          const nameInput = tr.querySelector('input[type="text"]');
          const qty = parseFloat(tr.querySelector('.qty-input')?.value) || 1;
          const rate = parseFloat(tr.querySelector('.price-input')?.value) || 0;
          const lineTotal = qty * rate;

          items.push({
            name: nameInput?.value || 'Fabric Item',
            qty: qty,
            rate: rate,
            total: lineTotal
          });
          itemsCount += qty;
          grandTotal += lineTotal;
        });

        const newPo = {
          id: poNumber,
          date: formattedDate,
          supplier: supplier,
          itemsCount: itemsCount,
          totalValue: grandTotal,
          status: 'Sent',
          expectedDelivery: formattedExpDate,
          itemsList: items
        };

        // Add to state
        state.pos.unshift(newPo);
        saveStoredData();

        // Update UI
        updateKpiMetrics();
        renderStatusDonutChart();
        setFilter('all');
        closeModal();

        showToast(`Purchase Order <strong>${poNumber}</strong> created and transmitted to ${supplier}!`, 'success');
      });
    }
  }

  /* ==========================================================================
     11. ADVANCED FILTER MODAL
     ========================================================================== */

  function initFilterModal() {
    const filterBtn = document.getElementById('openFilterModalBtn');
    const modal = document.getElementById('filterModal');
    const closeBtn = document.getElementById('closeFilterModal');
    const resetBtn = document.getElementById('resetFilterModal');
    const applyBtn = document.getElementById('applyFilterModal');
    const statusSelect = document.getElementById('filterStatusSelect');
    const supplierSelect = document.getElementById('filterSupplierSelect');

    if (!modal) return;

    function openModal() {
      if (statusSelect) statusSelect.value = state.activeFilter;
      if (supplierSelect) supplierSelect.value = state.supplierFilter;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }

    if (filterBtn) filterBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.activeFilter = 'all';
        state.supplierFilter = 'all';
        state.searchQuery = '';
        const searchInput = document.getElementById('poSearchInput');
        if (searchInput) searchInput.value = '';
        state.currentPage = 1;
        renderTable();
        closeModal();
        showToast('All filters cleared', 'info');
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        state.activeFilter = statusSelect.value;
        state.supplierFilter = supplierSelect.value;
        state.currentPage = 1;
        updateFilterTabCounts();
        renderTable();
        closeModal();
        showToast('Filter criteria applied', 'info');
      });
    }
  }

  /* ==========================================================================
     12. SEARCH & TABS LISTENERS
     ========================================================================== */

  function initSearchAndTabs() {
    const searchInput = document.getElementById('poSearchInput');
    const tabsContainer = document.getElementById('poFilterTabs');

    // Search bar live filter
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        state.searchQuery = searchInput.value;
        state.currentPage = 1;
        renderTable();
      });
    }

    // Status tabs
    if (tabsContainer) {
      tabsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-pill');
        if (!btn) return;
        const filterVal = btn.getAttribute('data-filter');
        setFilter(filterVal);
      });
    }
  }

  /* ==========================================================================
     13. BOTTOM SUMMARY & QUICK ACTIONS
     ========================================================================== */

  function initQuickActions() {
    const quickPrBtn = document.getElementById('quickPurchaseRequestBtn');
    const quickPoBtn = document.getElementById('quickPurchaseOrderBtn');
    const quickGrnBtn = document.getElementById('quickRecordGrnBtn');
    const quickSuppliersBtn = document.getElementById('quickManageSuppliersBtn');

    if (quickPrBtn) {
      quickPrBtn.addEventListener('click', () => {
        showToast('Purchase Requisition draft created. Ready for HOD review.', 'info');
      });
    }

    if (quickPoBtn) {
      quickPoBtn.addEventListener('click', () => {
        const openBtn = document.getElementById('openCreatePoModalBtn');
        if (openBtn) openBtn.click();
      });
    }

    if (quickGrnBtn) {
      quickGrnBtn.addEventListener('click', () => {
        showToast('Opening Goods Receipt Note (GRN) scanner & logger...', 'info');
      });
    }

    if (quickSuppliersBtn) {
      quickSuppliersBtn.addEventListener('click', () => {
        const supplierCard = document.querySelector('.panel-supplier-360');
        if (supplierCard) {
          supplierCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          supplierCard.style.outline = '2px solid #d4ff32';
          setTimeout(() => { supplierCard.style.outline = ''; }, 1800);
        }
      });
    }

    // View profile button in Supplier 360
    const viewProfileBtn = document.getElementById('s360ViewProfileBtn');
    if (viewProfileBtn) {
      viewProfileBtn.addEventListener('click', () => {
        showToast('Viewing 360° Vendor Dossier: Shree Textiles (Surat, Gujarat)', 'info');
      });
    }

    // Bottom alert links
    const pendingAppLink = document.getElementById('pendingApprovalsAction');
    if (pendingAppLink) {
      pendingAppLink.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('3 Purchase Requests pending director authorization.', 'warning');
      });
    }

    const priceVarLink = document.getElementById('priceVarianceAction');
    if (priceVarLink) {
      priceVarLink.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Alert: Raw Silk rates increased +6% in Surat mandi.', 'warning');
      });
    }

    const lowStockLink = document.getElementById('lowStockAction');
    if (lowStockLink) {
      lowStockLink.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Suggested Reorders: 12 inventory items below safety stock.', 'info');
      });
    }
  }

  /* ==========================================================================
     14. TOAST NOTIFICATION SYSTEM
     ========================================================================== */

  function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    else if (type === 'warning') iconName = 'alert-triangle';
    else if (type === 'danger') iconName = 'x-circle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <div class="toast-content">${message}</div>
      <button type="button" class="toast-close" aria-label="Dismiss">&times;</button>
    `;

    container.appendChild(toast);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: toast });
    }

    const closeBtn = toast.querySelector('.toast-close');
    let timer = setTimeout(removeToast, duration);

    function removeToast() {
      clearTimeout(timer);
      toast.classList.add('toast-fade-out');
      setTimeout(() => { toast.remove(); }, 240);
    }

    if (closeBtn) closeBtn.addEventListener('click', removeToast);
  }

  /* ==========================================================================
     15. INITIALIZATION
     ========================================================================== */

  async function updateKpiMetrics() {
    try {
      const { default: api } = await import('../api.js');
      const kpis = await api.purchases.kpis().catch(() => null);
      if (!kpis) return;

      const elTotalPos = document.getElementById('kpiTotalPos');
      const elTotalVal = document.getElementById('kpiTotalValue');
      const elPending  = document.getElementById('kpiPendingDeliveries');
      const elReceived = document.getElementById('kpiGoodsReceived');
      const elSuppliers= document.getElementById('kpiActiveSuppliers');

      if (elTotalPos)  elTotalPos.textContent  = Number(kpis.totalPos || 0).toLocaleString('en-IN');
      if (elTotalVal)  elTotalVal.textContent  = '₹' + Number(kpis.totalValue || 0).toLocaleString('en-IN');
      if (elPending)   elPending.textContent   = Number(kpis.pendingDeliveries || 0).toLocaleString('en-IN');
      if (elReceived)  elReceived.textContent  = Number(kpis.goodsReceived || 0).toLocaleString('en-IN');
      if (elSuppliers) elSuppliers.textContent = Number(kpis.activeSuppliers || 0).toLocaleString('en-IN');
    } catch (e) {
      console.error('[Purchases] Failed to update KPI metrics:', e.message);
    }
  }

  function init() {
    updateKpiMetrics();
    renderStatusDonutChart();
    renderMonthlyBarChart();
    renderTopSuppliers();
    renderRecentGrns();
    renderTable();
    initRowActions();
    initCreatePoModal();
    initFilterModal();
    initSearchAndTabs();
    initQuickActions();

    (async () => {
      try {
        const { default: api } = await import('../api.js');
        const [poList, kpis] = await Promise.all([
          api.purchases.list({ page: 0, size: 50 }).catch(() => []),
          api.purchases.kpis().catch(() => null)
        ]);
        const items = Array.isArray(poList) ? poList : (poList?.content || []);
        if (items.length > 0) {
          state.pos = items.map(po => {
            const supplierName = po.supplier ? po.supplier.name : 'Premium Supplier';
            const itemsArr = (po.items && po.items.length > 0) ? po.items : [{ itemName: 'Fabric Materials', quantity: 1, unitPrice: po.totalAmount }];
            return {
              id: po.poCode || `PO-${po.id}`,
              date: po.orderDate ? String(po.orderDate) : '',
              supplier: supplierName,
              itemsCount: itemsArr.length,
              totalValue: Number(po.totalAmount) || 0,
              status: po.status === 'SENT' ? 'Sent' : po.status === 'RECEIVED' ? 'Received' : po.status === 'PARTIALLY_RECEIVED' ? 'Partially Received' : 'Draft',
              expectedDelivery: po.expectedDate ? String(po.expectedDate) : '',
              itemsList: itemsArr.map(it => ({
                name: it.itemName || 'Material',
                qty: Number(it.quantity) || 1,
                rate: Number(it.unitPrice) || 0,
                total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
              }))
            };
          });

          RECENT_GRNS = state.pos
            .filter(p => p.status === 'Received' || p.status === 'Partially Received')
            .slice(0, 5)
            .map((p, idx) => ({
              id: 'GRN-' + String(28 - idx).padStart(4, '0'),
              po: p.id,
              date: p.date || 'Recent',
              items: p.itemsCount,
              status: p.status
            }));
        }

        if (kpis) {
          if (kpis.topSuppliers && kpis.topSuppliers.length > 0) {
            const colors = ['#d4ff32', '#a855f7', '#60a5fa', '#f59e0b', '#10b981'];
            TOP_SUPPLIERS = kpis.topSuppliers.map((s, idx) => ({
              name: s.name,
              initials: s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
              cls: 'st',
              percent: s.percent || 0,
              value: Number(s.value) || 0,
              color: colors[idx % colors.length]
            }));
          }
          if (kpis.monthlySpend && kpis.monthlySpend.length > 0) {
            MONTHLY_DATA = kpis.monthlySpend.map(m => {
              const valNum = Number(m.total) || 0;
              const inLakhs = (valNum / 100000).toFixed(1);
              return {
                month: m.month,
                materials: (valNum * 0.7 / 100000).toFixed(1),
                trims: (valNum * 0.3 / 100000).toFixed(1),
                totalVal: '₹' + inLakhs + 'L'
              };
            });
          }
        }

        renderTable();
        updateKpiMetrics();
        renderStatusDonutChart();
        renderMonthlyBarChart();
        renderTopSuppliers();
        renderRecentGrns();
      } catch (err) {
        console.error('[Purchases] Error loading live data:', err.message);
      }
    })();

    // Re-trigger Lucide icons for static markup
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
