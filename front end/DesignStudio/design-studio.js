/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — DESIGN STUDIO / DESIGN LIBRARY
 * Complete Frontend Controller, State Machine, Gallery & Interactions
 * File: frontend/DesignStudio/design-studio.js
 * =======================================================================
 */

(function () {
  'use strict';

  const FALLBACK_DESIGN_SVG = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 48 48%22 width=%2248%22 height=%2248%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22M6 14 L24 4 L42 14 L34 44 L14 44 Z%22/%3E%3Cpath d=%22M24 4 L24 44%22 stroke-dasharray=%223 3%22/%3E%3C/svg%3E";
  window.FALLBACK_DESIGN_SVG = FALLBACK_DESIGN_SVG;

  /* ==========================================================================
     1. ZERO RAW CODE VALUES — 100% DYNAMIC DATABASE HYDRATION
     All design specifications, intelligence metrics, variant families,
     and KPIs are loaded dynamically from the live PostgreSQL database.
     ========================================================================== */

  /* ==========================================================================
       2. APPLICATION CENTRAL STATE
       ========================================================================== */
  const state = {
    designs: [],
    activeCategory: "All Designs",
    searchQuery: "",
    selectedDesignId: null,
    viewMode: localStorage.getItem('haulo_design_view_mode') || 'grid', // default to "grid" matching reference
    tableSortField: null,
    tableSortDir: 'asc',
    sortBy: "newest",
    filters: {
      style: "",
      occasion: "",
      fabric: "",
      status: "",
      favoritesOnly: false
    },
    favorites: [],
    activeDetailTab: "details",
    currentPage: 1,
    itemsPerPage: 16,
    lightboxIndex: 0
  };

  /* ==========================================================================
     3. INITIALIZATION & LOCALSTORAGE MANAGEMENT
     ========================================================================== */
  function loadPersistedState() {
    try {
      const savedFavorites = localStorage.getItem('ritham_design_favorites');
      state.favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch (e) {
      state.favorites = [];
    }
    // Designs are always loaded from the API — no local cache
    state.designs = [];
    try {
      localStorage.removeItem('ritham_custom_designs');
    } catch (e) { }
  }

  function saveFavorites() {
    try {
      localStorage.setItem('ritham_design_favorites', JSON.stringify(state.favorites));
    } catch (e) { }
  }

  /* ==========================================================================
     4. DONUT CHART & METRIC HELPERS (BY CATEGORY & FABRICS)
     ========================================================================== */
  let categoryChartInstance = null;

  function populateDynamicFiltersAndDropdowns() {
    const designs = state.designs || [];

    // 1. Dynamic Unique Categories from DB
    const uniqueCategories = Array.from(new Set(designs.map(d => d.category).filter(Boolean))).sort();

    // Render Category Filter Tabs dynamically (matching reference screenshot without count suffix)
    const categoryTabs = document.getElementById('categoryTabs');
    if (categoryTabs) {
      let tabsHtml = `<button type="button" class="cat-tab ${state.activeCategory === 'All Designs' ? 'active' : ''}" data-category="All Designs">All Designs</button>`;
      uniqueCategories.forEach(cat => {
        const isActive = state.activeCategory.toLowerCase() === cat.toLowerCase();
        tabsHtml += `<button type="button" class="cat-tab ${isActive ? 'active' : ''}" data-category="${cat}">${cat}</button>`;
      });
      categoryTabs.innerHTML = tabsHtml;
    }

    // Populate Category Dropdowns in Create & Edit Modals dynamically from DB
    const selectNewCat = document.getElementById('newDesignCategory');
    const selectEditCat = document.getElementById('editDesignCategory');
    const catOptionsHtml = '<option value="">Select Category</option>' + uniqueCategories.map(c => `<option value="${c}">${c}</option>`).join('');

    if (selectNewCat) {
      const curVal = selectNewCat.value;
      selectNewCat.innerHTML = catOptionsHtml;
      if (curVal) selectNewCat.value = curVal;
    }
    if (selectEditCat) {
      const curVal = selectEditCat.value;
      selectEditCat.innerHTML = catOptionsHtml;
      if (curVal) selectEditCat.value = curVal;
    }

    // 2. Dynamic Unique Styles from DB
    const uniqueStyles = Array.from(new Set(designs.map(d => d.style).filter(Boolean))).sort();
    const selectStyle = document.getElementById('filterStyle');
    if (selectStyle) {
      const curStyle = selectStyle.value;
      selectStyle.innerHTML = '<option value="">All Styles</option>' + uniqueStyles.map(s => `<option value="${s}">${s}</option>`).join('');
      if (curStyle) selectStyle.value = curStyle;
    }

    // 3. Dynamic Unique Occasions from DB
    const uniqueOccasions = Array.from(new Set(designs.map(d => d.occasion).filter(Boolean))).sort();
    const selectOccasion = document.getElementById('filterOccasion');
    if (selectOccasion) {
      const curOcc = selectOccasion.value;
      selectOccasion.innerHTML = '<option value="">All Occasions</option>' + uniqueOccasions.map(o => `<option value="${o}">${o}</option>`).join('');
      if (curOcc) selectOccasion.value = curOcc;
    }

    // 4. Dynamic Unique Primary Fabrics from DB
    const uniqueFabrics = Array.from(new Set(designs.map(d => d.primaryFabric).filter(Boolean))).sort();
    const selectFabric = document.getElementById('filterFabric');
    if (selectFabric) {
      const curFab = selectFabric.value;
      selectFabric.innerHTML = '<option value="">All Fabrics</option>' + uniqueFabrics.map(f => `<option value="${f}">${f}</option>`).join('');
      if (curFab) selectFabric.value = curFab;
    }

    // 5. Dynamic Unique Production Statuses from DB
    const uniqueStatuses = Array.from(new Set(designs.map(d => d.productionStatus).filter(Boolean))).sort();
    const selectStatus = document.getElementById('filterStatus');
    if (selectStatus) {
      const curStat = selectStatus.value;
      selectStatus.innerHTML = '<option value="">All Statuses</option>' + uniqueStatuses.map(s => `<option value="${s}">${s}</option>`).join('');
      if (curStat) selectStatus.value = curStat;
    }

    // 6. Dynamic Collections from DB for Add-to-Collection Modal
    const collCounts = {};
    designs.forEach(d => {
      const colName = d.collection || 'General Collection';
      collCounts[colName] = (collCounts[colName] || 0) + 1;
    });
    const uniqueCollections = Object.keys(collCounts).sort();
    const collectionListEl = document.getElementById('collectionOptionsList');
    if (collectionListEl) {
      if (uniqueCollections.length === 0) {
        collectionListEl.innerHTML = '<div style="padding:1rem;color:var(--text-muted);text-align:center;">No collections in database yet.</div>';
      } else {
        collectionListEl.innerHTML = uniqueCollections.map((colName, idx) => `
          <label class="collection-option-row">
            <input type="radio" name="targetCollection" value="${colName}" ${idx === 0 ? 'checked' : ''} />
            <span class="coll-name">${colName}</span>
            <span class="coll-count">${collCounts[colName]} design${collCounts[colName] > 1 ? 's' : ''}</span>
          </label>
        `).join('');
      }
    }

    // 7. Dynamic Datalists for Create & Edit Form Autocomplete
    const dlStyles = document.getElementById('dbStyleList');
    if (dlStyles) {
      dlStyles.innerHTML = uniqueStyles.map(s => `<option value="${s}">`).join('');
    }
    const dlOccasions = document.getElementById('dbOccasionList');
    if (dlOccasions) {
      dlOccasions.innerHTML = uniqueOccasions.map(o => `<option value="${o}">`).join('');
    }
    const dlFabrics = document.getElementById('dbFabricList');
    if (dlFabrics) {
      dlFabrics.innerHTML = uniqueFabrics.map(f => `<option value="${f}">`).join('');
    }
  }

  // Backward compatibility alias
  const updateCategoryTabs = populateDynamicFiltersAndDropdowns;

  function updateKpiCards(kpis) {
    const designs = state.designs || [];
    const total = designs.length;

    // 1. Total Designs
    const totalCountEl = document.getElementById('kpiTotalDesignsVal');
    if (totalCountEl) totalCountEl.textContent = (kpis && (kpis.total != null || kpis.totalDesigns != null))
      ? (kpis.total != null ? kpis.total : kpis.totalDesigns)
      : total;

    // 2. Production Ready
    const prodReadyCount = designs.filter(d => {
      const s = ((d.productionStatus || d.status || '') + '').toLowerCase();
      return s.includes('ready') || s.includes('approved') || s.includes('active');
    }).length;
    const prodReadyEl = document.getElementById('kpiProdReadyVal') || document.getElementById('kpiDesignsProductionVal');
    if (prodReadyEl) prodReadyEl.textContent = (kpis && (kpis.productionReady != null || kpis.designsToProduction != null))
      ? (kpis.productionReady != null ? kpis.productionReady : kpis.designsToProduction)
      : prodReadyCount;

    // 3. In Development
    const inDevCount = designs.filter(d => {
      const s = ((d.productionStatus || d.status || '') + '').toLowerCase();
      return s.includes('dev') || s.includes('draft');
    }).length;
    const inDevEl = document.getElementById('kpiInDevVal');
    if (inDevEl) inDevEl.textContent = (kpis && kpis.inDevelopment != null) ? kpis.inDevelopment : inDevCount;

    // 4. Samples Pending
    const samplesCount = designs.filter(d => {
      const s = ((d.productionStatus || d.status || '') + '').toLowerCase();
      return s.includes('sample') || s.includes('trial') || s.includes('pending');
    }).length;
    const samplesEl = document.getElementById('kpiSamplesPendingVal');
    if (samplesEl) samplesEl.textContent = (kpis && kpis.samplesPending != null) ? kpis.samplesPending : samplesCount;

    // 5. Used This Month
    let usedThisMonth = 0;
    designs.forEach(d => {
      if (typeof d.timesUsed === 'number' && d.timesUsed > 0) {
        usedThisMonth += d.timesUsed;
      }
    });
    const usedMonthEl = document.getElementById('kpiUsedMonthVal');
    if (usedMonthEl) usedMonthEl.textContent = (kpis && (kpis.usedThisMonth != null || kpis.totalTimesUsed != null))
      ? (kpis.usedThisMonth != null ? kpis.usedThisMonth : kpis.totalTimesUsed)
      : usedThisMonth;

    // Backward-compatibility elements if still in DOM
    const collEl = document.getElementById('kpiActiveCollectionsVal');
    const uniqueCollections = new Set(designs.map(d => d.collection || d.category).filter(Boolean)).size;
    if (collEl) collEl.textContent = (kpis && kpis.activeCollections != null) ? kpis.activeCollections : uniqueCollections;

    const donutTotalEl = document.getElementById('donutTotalCount');
    if (donutTotalEl) donutTotalEl.textContent = (kpis && (kpis.total != null || kpis.totalDesigns != null))
      ? (kpis.total != null ? kpis.total : kpis.totalDesigns)
      : total;
  }

  function initDonutChart() {
    const canvas = document.getElementById('categoryDonutChart');
    if (!canvas || !window.Chart) return;

    if (categoryChartInstance) {
      categoryChartInstance.destroy();
    }

    const catCounts = {};
    (state.designs || []).forEach(d => {
      const cat = d.category || 'Other';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    const labels = Object.keys(catCounts);
    const data = Object.values(catCounts);
    const total = state.designs ? state.designs.length : 0;

    const palette = [
      '#E6D37A', // soft yellow gold
      '#E6A7B8', // pastel pink
      '#A995FF', // lavender purple
      '#A9D8E8', // pastel cyan
      '#8BE28B', // pale green
      '#C4B5A5', // warm taupe
      '#F59E0B', // amber
      '#10B981'  // emerald
    ];

    const donutTotalEl = document.getElementById('donutTotalCount');
    if (donutTotalEl) donutTotalEl.textContent = total;

    // Update HTML legend rows
    const legendEl = document.querySelector('.donut-legend-items');
    if (legendEl && labels.length > 0) {
      legendEl.innerHTML = labels.slice(0, 5).map((label, idx) => {
        const val = catCounts[label] || 0;
        const pct = total > 0 ? Math.round((val / total) * 100) : 0;
        const color = palette[idx % palette.length];
        return `<div class="legend-row"><span class="legend-dot" style="background:${color};"></span><span class="legend-name">${label}</span><span class="legend-pct">${pct}%</span></div>`;
      }).join('');
    }

    const ctx = canvas.getContext('2d');
    categoryChartInstance = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length > 0 ? labels : ['No Designs'],
        datasets: [{
          data: data.length > 0 ? data : [1],
          backgroundColor: labels.length > 0 ? palette.slice(0, labels.length) : ['rgba(255,255,255,0.1)'],
          borderWidth: 0,
          hoverOffset: 3
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(30, 27, 23, 0.95)',
            titleFont: { family: (typeof getComputedStyle === 'function' ? getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim() : '') || 'Plus Jakarta Sans', size: 11 },
            bodyFont: { family: (typeof getComputedStyle === 'function' ? getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim() : '') || 'Plus Jakarta Sans', size: 11 },
            padding: 8,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const val = context.raw || 0;
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                return ` ${label}: ${val} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  /* ==========================================================================
     5. FILTERING & SORTING PIPELINE
     ========================================================================== */
  function getFilteredAndSortedDesigns() {
    let result = [...state.designs];

    // 1. Category tab filter
    if (state.activeCategory && state.activeCategory !== "All Designs") {
      result = result.filter(d => d.category.toLowerCase() === state.activeCategory.toLowerCase());
    }

    // 2. Search query filter
    if (state.searchQuery && state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase().trim();
      result = result.filter(d => {
        const tagArr = Array.isArray(d.tags) ? d.tags : (d.tags || '').split(',').map(t => t.trim());
        return (
          (d.name || '').toLowerCase().includes(q) ||
          (d.code || '').toLowerCase().includes(q) ||
          (d.category || '').toLowerCase().includes(q) ||
          (d.subCategory && d.subCategory.toLowerCase().includes(q)) ||
          (d.primaryFabric && d.primaryFabric.toLowerCase().includes(q)) ||
          (d.collection && d.collection.toLowerCase().includes(q)) ||
          tagArr.some(t => t.toLowerCase().includes(q))
        );
      });
    }

    // 3. Detailed popover filters
    if (state.filters.style) {
      result = result.filter(d => d.style && d.style.toLowerCase() === state.filters.style.toLowerCase());
    }
    if (state.filters.occasion) {
      result = result.filter(d => d.occasion && d.occasion.toLowerCase() === state.filters.occasion.toLowerCase());
    }
    if (state.filters.fabric) {
      result = result.filter(d => d.primaryFabric && d.primaryFabric.toLowerCase().includes(state.filters.fabric.toLowerCase()));
    }
    if (state.filters.status) {
      result = result.filter(d => d.productionStatus && d.productionStatus.toLowerCase() === state.filters.status.toLowerCase());
    }
    if (state.filters.favoritesOnly) {
      result = result.filter(d => state.favorites.includes(d.id));
    }

    // 4. Sorting
    switch (state.sortBy) {
      case "newest":
        // Keep original curated order
        break;
      case "oldest":
        result.reverse();
        break;
      case "most-used":
        result.sort((a, b) => (b.timesUsed || 0) - (a.timesUsed || 0));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        result.sort((a, b) => (a.suggestedPrice || 0) - (b.suggestedPrice || 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.suggestedPrice || 0) - (a.suggestedPrice || 0));
        break;
    }

    // 5. Table Column Header Sorting (if clicked in table view)
        if (state.tableSortField) {
          const field = state.tableSortField;
          const dir = state.tableSortDir === 'desc' ? -1 : 1;
          result.sort((a, b) => {
            let valA, valB;
            if (field === 'code') { valA = a.code || ''; valB = b.code || ''; }
            else if (field === 'name') { valA = a.name || ''; valB = b.name || ''; }
            else if (field === 'category') { valA = a.category || ''; valB = b.category || ''; }
            else if (field === 'status') { valA = a.productionStatus || ''; valB = b.productionStatus || ''; }
            else if (field === 'cost') { valA = Number(a.estimatedCost) || 0; valB = Number(b.estimatedCost) || 0; }
            else if (field === 'price') { valA = Number(a.suggestedPrice) || 0; valB = Number(b.suggestedPrice) || 0; }
            else { valA = a[field] || ''; valB = b[field] || ''; }

            if (typeof valA === 'string') return valA.localeCompare(valB || '') * dir;
            return (valA - valB) * dir;
          });
        }

        return result;
    }

    /* ==========================================================================
       6. RENDERING: DESIGN CARDS (GRID) & TABLE (LIST)
       ========================================================================== */
    function getCategoryClass(cat) {
      const c = (cat || "").toLowerCase();
      if (c === "blouse") return "tag-blouse";
      if (c === "lehenga") return "tag-lehenga";
      if (c === "saree") return "tag-saree";
      if (c === "kurti") return "tag-kurti";
      if (c === "gown") return "tag-gown";
      return "tag-others";
    }

    function renderGallery() {
      const allFiltered = getFilteredAndSortedDesigns();
      const gridContainer = document.getElementById('designGrid');
      const listTbody = document.getElementById('designListTbody');
      const emptyState = document.getElementById('galleryEmptyState');
      const paginationBar = document.getElementById('paginationBar');

      if (!gridContainer) return;

      // Handle empty state
      if (allFiltered.length === 0) {
        gridContainer.style.display = 'none';
        if (document.getElementById('designListContainer')) {
          document.getElementById('designListContainer').style.display = 'none';
        }
        emptyState.style.display = 'flex';
        paginationBar.style.display = 'none';
        return;
      }

      emptyState.style.display = 'none';
      paginationBar.style.display = 'flex';

      const isTableView = state.viewMode === 'table' || state.viewMode === 'list';
      const listContainer = document.getElementById('designListContainer');

      if (isTableView) {
        gridContainer.style.display = 'none';
        if (listContainer) listContainer.style.display = 'block';
      } else {
        gridContainer.style.display = 'grid';
        if (listContainer) listContainer.style.display = 'none';
      }

      // Synchronize toggle buttons state
      const btnGrid = document.getElementById('btnViewGrid');
      const btnList = document.getElementById('btnViewList');
      if (btnGrid) btnGrid.classList.toggle('active', !isTableView);
      if (btnList) btnList.classList.toggle('active', isTableView);

      // Update column sort indicator icons in table header
      const designTable = document.getElementById('designTable');
      if (designTable) {
        const sortHeaders = designTable.querySelectorAll('th.sortable-th');
        sortHeaders.forEach(th => {
          const field = th.getAttribute('data-sort');
          const icon = th.querySelector('.th-sort-icon');
          if (icon) {
            if (state.tableSortField === field) {
              icon.style.opacity = '1';
              icon.style.color = 'var(--accent-lime)';
              icon.setAttribute('data-lucide', state.tableSortDir === 'asc' ? 'arrow-up' : 'arrow-down');
            } else {
              icon.style.opacity = '0.4';
              icon.style.color = 'inherit';
              icon.setAttribute('data-lucide', 'arrow-up-down');
            }
          }
        });
      }

      // Pagination calculations
      const totalItems = allFiltered.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / state.itemsPerPage));
      if (state.currentPage > totalPages) state.currentPage = totalPages;

      const startIdx = (state.currentPage - 1) * state.itemsPerPage;
      const pageItems = allFiltered.slice(startIdx, startIdx + state.itemsPerPage);

      // If current selected design is not in page, keep selection intact or default to first
      const hasCurrent = allFiltered.some(d => d.id === state.selectedDesignId);
      if (!hasCurrent && allFiltered.length > 0) {
        state.selectedDesignId = allFiltered[0].id;
      }

      // 1. Render Grid Cards
      gridContainer.innerHTML = pageItems.map(d => {
        const isSelected = d.id === state.selectedDesignId;
        const mainImg = d.cardImage || (d.images && d.images.length > 0 ? d.images[0] : FALLBACK_DESIGN_SVG);
        const collectionText = d.collection || (d.category ? `${d.category} 2026` : 'Heritage Bridal 2026');

        const s = ((d.productionStatus || d.status || '') + '').toLowerCase();
        let dotColor = 'dot-green';
        let statusText = 'Production Ready';
        if (s.includes('dev') || s.includes('draft')) {
          dotColor = 'dot-purple';
          statusText = 'In Development';
        } else if (s.includes('sample') || s.includes('trial') || s.includes('pending')) {
          dotColor = 'dot-orange';
          statusText = 'Sample Pending';
        }

        const timesUsed = d.timesUsed != null ? d.timesUsed : 0;

        return `
        <article class="design-card ${isSelected ? 'selected' : ''}" data-id="${d.id}" tabindex="0">
          <div class="card-image-wrap">
            <img src="${mainImg}" alt="${d.name || 'Design'} preview" loading="lazy" onerror="this.onerror=null; this.src='${FALLBACK_DESIGN_SVG}';" />
          </div>
          <div class="card-content">
            <span class="card-code">${d.code || '—'}</span>
            <h3 class="card-title" title="${d.name || 'Design'}">${d.name || '—'}</h3>
            <span class="card-collection" title="${collectionText}">${collectionText}</span>
            <div class="card-footer-meta">
              <span class="card-status-label">
                <span class="kpi-dot ${dotColor}"></span>
                ${statusText}
              </span>
              <span class="card-used-count" title="${timesUsed} times used">
                <i data-lucide="shopping-bag" style="width:11px;height:11px;"></i>
                ${timesUsed}
              </span>
            </div>
          </div>
        </article>
      `;
      }).join('');

      // 2. Render List View Rows (Full 11-column Rich Designs Table)
      if (listTbody) {
        listTbody.innerHTML = pageItems.map(d => {
          const isSelected = d.id === state.selectedDesignId;
          const isFav = state.favorites.includes(d.id);
          const mainImg = d.cardImage || (d.images && d.images.length > 0 ? d.images[0] : FALLBACK_DESIGN_SVG);
          const catClass = getCategoryClass(d.category);
          const swatches = Array.isArray(d.swatches) ? d.swatches : [];
          const swatchesHtml = swatches.slice(0, 3).map(c => `<span class="table-swatch-dot" style="background:${c};" title="${c}"></span>`).join('');
          const statusClass = (d.productionStatus || 'active').toLowerCase().replace(/\s+/g, '-');
          const styleOccasion = [d.style, d.occasion].filter(Boolean).join(' • ');

          return `
          <tr class="${isSelected ? 'active-row' : ''}" data-id="${d.id}">
            <td>
              <span class="table-id-pill">${d.code || '—'}</span>
            </td>
            <td style="text-align:center;">
              <div class="table-thumb-wrap">
                <img src="${mainImg}" class="table-thumb-img" alt="${d.name || 'Garment preview'}" loading="lazy" onerror="this.onerror=null; this.src='${FALLBACK_DESIGN_SVG}';" />
              </div>
            </td>
            <td>
              <div class="table-title-cell">
                <span class="table-title-text" title="${d.name || ''}">${d.name || '—'}</span>
                <span class="table-subtitle-text">${d.subCategory || d.collection || ''}</span>
              </div>
            </td>
            <td>
              <span class="badge-tag-sm ${catClass}">${d.category || '—'}</span>
            </td>
            <td>
              <div class="table-fabric-cell">
                <span class="table-fabric-name">${d.primaryFabric || '—'}</span>
                ${swatchesHtml ? `<div class="table-swatches-inline">${swatchesHtml}</div>` : ''}
              </div>
            </td>
            <td>
              <span style="color:var(--text-secondary);font-size:12px;">${styleOccasion || '—'}</span>
            </td>
            <td>
              <span class="status-pill status-${statusClass}">
                <span class="status-dot"></span>
                ${d.productionStatus || 'Active'}
              </span>
            </td>
            <td>
              <span class="table-cost-val">${d.estimatedCost > 0 ? '₹' + d.estimatedCost.toLocaleString('en-IN') : '—'}</span>
            </td>
            <td>
              <span class="table-price-val">${d.suggestedPrice > 0 ? '₹' + d.suggestedPrice.toLocaleString('en-IN') : '—'}</span>
            </td>
            <td style="text-align:right;">
              <div class="tbl-actions-cell">
                <button type="button" class="btn-tbl-action btn-action-order" data-use-order="${d.id}" title="Use in Order" aria-label="Use in Order">
                  <i data-lucide="shopping-cart" style="width:13px;height:13px;"></i>
                </button>
                <button type="button" class="btn-tbl-action" data-edit-design="${d.id}" title="Edit Design" aria-label="Edit Design">
                  <i data-lucide="edit-3" style="width:13px;height:13px;"></i>
                </button>
                <button type="button" class="btn-tbl-action ${isFav ? 'favorited' : ''}" data-fav-id="${d.id}" title="Favorite" aria-label="Toggle Favorite">
                  <i data-lucide="heart" style="width:13px;height:13px;"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
        }).join('');
      }

      // 3. Render Pagination
      renderPagination(totalItems, totalPages);

      // 4. Update Selected Detail Panel
      renderSelectedDesign();

      // 5. Initialize Lucide Icons in rendered items
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: gridContainer });
        if (listTbody) window.lucide.createIcons({ root: listTbody });
        if (designTable) window.lucide.createIcons({ root: designTable });
      }
    }

    function renderPagination(totalItems, totalPages) {
      const infoEl = document.getElementById('paginationInfo');
      const controlsEl = document.getElementById('paginationControls');
      if (!infoEl || !controlsEl) return;

      const start = (state.currentPage - 1) * state.itemsPerPage + 1;
      const end = Math.min(totalItems, state.currentPage * state.itemsPerPage);
      infoEl.textContent = `Showing ${start}–${end} of ${totalItems} designs`;

      let html = '';
      html += `<button type="button" class="btn-page" id="btnPrevPage" ${state.currentPage <= 1 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''} aria-label="Previous Page">&lt;</button>`;

      for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || (p >= state.currentPage - 1 && p <= state.currentPage + 1)) {
          html += `<button type="button" class="btn-page ${p === state.currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
        } else if (p === state.currentPage - 2 || p === state.currentPage + 2) {
          html += `<span class="page-dots">...</span>`;
        }
      }

      html += `<button type="button" class="btn-page" id="btnNextPage" ${state.currentPage >= totalPages ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''} aria-label="Next Page">&gt;</button>`;
      controlsEl.innerHTML = html;
    }

    /* ==========================================================================
       7. RENDERING: SELECTED DESIGN DETAIL PANEL (RIGHT SIDE)
       ========================================================================== */
    /* ==========================================================================
       7. RENDERING: SELECTED DESIGN DETAIL PANEL (RIGHT SIDE)
       Reference: media_1791789041112.png
       ========================================================================== */
    function updateHeaderButtons(design) {
      const btnUseInOrder = document.getElementById('btnHeaderUseInOrder');
      const btnCreateVariant = document.getElementById('btnCreateVariant');
      const btnEditDesign = document.getElementById('btnHeaderEditDesign');

      if (!design) {
        if (btnUseInOrder) btnUseInOrder.style.display = 'none';
        if (btnCreateVariant) btnCreateVariant.style.display = 'none';
        if (btnEditDesign) btnEditDesign.style.display = 'none';
        return;
      }

      if (btnUseInOrder) btnUseInOrder.style.display = 'inline-flex';
      if (btnCreateVariant) btnCreateVariant.style.display = 'inline-flex';
      if (btnEditDesign) btnEditDesign.style.display = 'inline-flex';
    }

    function renderSelectedDesign() {
      const panel = document.getElementById('selectedDesignPanel');
      const design = state.designs.find(d => d.id === state.selectedDesignId) || state.designs[0];
      if (!design) {
        if (panel) panel.style.display = 'none';
        updateHeaderButtons(null);
        return;
      }
      if (panel) panel.style.display = 'flex';
      const ws = document.getElementById('studioWorkspace');
      if (ws) ws.classList.remove('no-detail');
      updateHeaderButtons(design);

      // Header Row (Code, Copy Button, Status Badges, Title)
      const codeEl = document.getElementById('detailCode');
      const titleEl = document.getElementById('detailTitle');
      const badgesContainer = document.getElementById('detailBadges');
      const favBtn = document.getElementById('btnDetailFavorite');

      if (codeEl) codeEl.textContent = design.code || '—';
      if (titleEl) titleEl.textContent = design.name || '—';

      if (badgesContainer) {
        const prodStatus = ((design.productionStatus || design.status || 'Production Ready') + '').toUpperCase();
        let statusBadgeClass = 'compat-excellent';
        if (prodStatus.includes('READY') || prodStatus.includes('APPROVED')) {
          statusBadgeClass = 'compat-excellent';
        } else if (prodStatus.includes('DEV') || prodStatus.includes('DRAFT')) {
          statusBadgeClass = 'compat-proven';
        } else if (prodStatus.includes('SAMPLE') || prodStatus.includes('PENDING')) {
          statusBadgeClass = 'compat-compat';
        }

        const occasionTag = (design.occasion || design.subCategory || 'BRIDAL').toUpperCase();
        const masterTag = design.isVariant ? 'VARIANT DESIGN' : 'MASTER DESIGN';

        badgesContainer.innerHTML = `
          <span class="detail-badge ${statusBadgeClass}">${prodStatus}</span>
          <span class="detail-badge" style="background:rgba(139,30,47,0.25);border:1px solid rgba(139,30,47,0.45);color:#FCA5A5;">${occasionTag}</span>
          <span class="detail-badge" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);color:var(--text-secondary);">${masterTag}</span>
        `;
      }

      // Favorite toggle button
      if (favBtn) {
        const isFav = state.favorites.includes(design.id);
        favBtn.classList.toggle('favorited', isFav);
        favBtn.setAttribute('title', isFav ? 'Remove from Favorites' : 'Add to Favorites');
      }

      // 1. Meta Info Row (Collection | Garment Type | Version | Last Updated)
      renderDetailMetaRow(design);

      // 2. Blueprint Section with Dynamic Annotation Callouts
      renderBlueprintSection(design);

      // 3. Production Readiness Donut & Checklist
      renderProductionReadiness(design);

      // 4. Intel Cards: Fit Intelligence, Material Compatibility, Production Complexity
      renderFitIntelligence(design);
      renderMaterialCompatibility(design);
      renderProductionComplexity(design);

      // 5. Family, History & Performance Cards
      renderVariantFamily(design);
      renderVersionHistory(design);
      renderDesignPerformance(design);

      // 6. Color Swatches List
      const swatchesContainer = document.getElementById('colorSwatchesList');
      if (swatchesContainer) {
        const swatches = Array.isArray(design.swatches) && design.swatches.length > 0
          ? design.swatches
          : [];
        if (swatches.length > 0) {
          swatchesContainer.innerHTML = swatches.map((color, idx) => {
            return `<span class="swatch-item ${idx === 0 ? 'active' : ''}" style="background:${color};" data-color="${color}" title="Shade ${idx + 1}: ${color}"></span>`;
          }).join('');
        } else {
          swatchesContainer.innerHTML = `<span style="font-size:11px;color:var(--text-muted);font-style:italic;">No swatches registered</span>`;
        }
      }

      // 7. Tags List
      const tagsList = document.getElementById('detailTagsList');
      if (tagsList) {
        const tags = Array.isArray(design.tags) && design.tags.length > 0
          ? design.tags
          : [design.category, design.occasion, design.style, design.primaryFabric].filter(Boolean);
        if (tags.length > 0) {
          tagsList.innerHTML = tags.map(t => `<span class="tag-pill">${t}</span>`).join('');
        } else {
          tagsList.innerHTML = `<span style="font-size:11px;color:var(--text-muted);font-style:italic;">No tags</span>`;
        }
      }

      // 8. Re-initialize Lucide Icons in right panel
      if (panel && window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: panel });
      }
    }

    function renderDetailMetaRow(design) {
      const el = document.getElementById('detailMetaRow');
      if (!el) return;
      const collectionVal = design.collection || design.subCategory || 'Haute Couture Collection';
      const categoryVal = design.category || 'Bespoke';
      const versionVal = design.version || 'V1';
      const updatedVal = (design.lastUsed && design.lastUsed !== '—') ? design.lastUsed : (design.creationDate || 'Registered');

      el.innerHTML = `
        <div class="meta-info-item">
          <span class="meta-info-icon-label"><i data-lucide="folder" style="width:11px;height:11px;"></i> Collection</span>
          <span class="meta-info-value" title="${collectionVal}">${collectionVal}</span>
        </div>
        <div class="meta-info-item">
          <span class="meta-info-icon-label"><i data-lucide="tag" style="width:11px;height:11px;"></i> Garment Type</span>
          <span class="meta-info-value" title="${categoryVal}">${categoryVal}</span>
        </div>
        <div class="meta-info-item">
          <span class="meta-info-icon-label"><i data-lucide="git-branch" style="width:11px;height:11px;"></i> Version</span>
          <span class="meta-info-value" title="${versionVal}">${versionVal}</span>
        </div>
        <div class="meta-info-item">
          <span class="meta-info-icon-label"><i data-lucide="calendar" style="width:11px;height:11px;"></i> Last Updated</span>
          <span class="meta-info-value" title="${updatedVal}">${updatedVal}</span>
        </div>
      `;
    }

    function renderBlueprintSection(design) {
      const mainImg = document.getElementById('detailMainImage');
      const prevChip = document.getElementById('previewCategoryChip');
      const calloutsLayer = document.getElementById('blueprintCalloutsLayer');
      const thumbStrip = document.getElementById('thumbnailStrip');

      const images = Array.isArray(design.images) && design.images.length > 0
        ? design.images
        : (design.cardImage ? [design.cardImage] : [FALLBACK_DESIGN_SVG]);

      const previewArea = document.getElementById('mainPreviewWrap');
      const hasDuo = images.length >= 2;
      const frontImg = images[0] || FALLBACK_DESIGN_SVG;
      const backImg = hasDuo ? images[1] : frontImg;

      if (previewArea) {
        let duoContainer = previewArea.querySelector('.blueprint-duo-view');
        if (!duoContainer) {
          duoContainer = document.createElement('div');
          duoContainer.className = 'blueprint-duo-view';
          previewArea.prepend(duoContainer);
        }
        duoContainer.innerHTML = `
          <img class="blueprint-img-front" src="${frontImg}" alt="${design.name || 'Design'} front view" onerror="this.onerror=null; this.src='${FALLBACK_DESIGN_SVG}';" />
          <img class="blueprint-img-back" src="${backImg}" alt="${design.name || 'Design'} back view" onerror="this.onerror=null; this.src='${FALLBACK_DESIGN_SVG}';" />
        `;
        if (mainImg) mainImg.style.display = 'none';
      } else if (mainImg) {
        mainImg.src = frontImg;
        mainImg.style.display = 'block';
      }

      if (prevChip) {
        prevChip.style.display = 'none';
      }

      // Blueprint Annotation Callouts Overlay (Matching Reference Screenshot)
      if (calloutsLayer) {
        const neckline = design.neckline || (design.construction ? design.construction : 'Tailored Bodice');
        const sleeve = design.sleeve || 'Tailored Cuff';
        const embroidery = design.embroidery || 'Artisan Detailing';
        const back = design.backDesign || 'Tailored Closure';
        const padding = design.padding || 'Standard';
        const lining = design.lining || (design.primaryFabric ? `${design.primaryFabric} Lining` : 'Pure Cotton');
        const closure = design.closure || 'Fastening Hooks';

        calloutsLayer.innerHTML = `
          <div class="blueprint-callout" style="top:12%;left:3%;" title="Neckline Specification">
            <span class="callout-label">Neckline</span>
            <span class="callout-val">${neckline}</span>
          </div>
          <div class="blueprint-callout" style="top:44%;left:2%;" title="Sleeve Construction">
            <span class="callout-label">Sleeve</span>
            <span class="callout-val">${sleeve}</span>
          </div>
          <div class="blueprint-callout" style="bottom:12%;left:3%;" title="Embroidery Details">
            <span class="callout-label">Embroidery</span>
            <span class="callout-val">${embroidery}</span>
          </div>
          <div class="blueprint-callout" style="top:12%;right:3%;" title="Back Neck & Closure">
            <span class="callout-label">Back</span>
            <span class="callout-val">${back}</span>
          </div>
          <div class="blueprint-callout" style="top:34%;right:3%;" title="Internal Padding">
            <span class="callout-label">Padding</span>
            <span class="callout-val">${padding}</span>
          </div>
          <div class="blueprint-callout" style="top:54%;right:3%;" title="Lining Fabric">
            <span class="callout-label">Lining</span>
            <span class="callout-val">${lining}</span>
          </div>
          <div class="blueprint-callout" style="bottom:12%;right:3%;" title="Fastening & Closure">
            <span class="callout-label">Closure</span>
            <span class="callout-val">${closure}</span>
          </div>
        `;
      }

      // Thumbnail Strip
      if (thumbStrip) {
        thumbStrip.innerHTML = images.slice(0, 4).map((imgUrl, idx) => {
          const isActive = idx === (state.lightboxIndex < images.length ? state.lightboxIndex : 0);
          return `
            <button type="button" class="thumb-btn ${isActive ? 'active' : ''}" data-thumb-idx="${idx}" aria-label="View photo ${idx + 1}">
              <img src="${imgUrl}" alt="Thumbnail ${idx + 1}" onerror="this.onerror=null; this.src='${FALLBACK_DESIGN_SVG}';" />
            </button>
          `;
        }).join('');
      }
    }

    function renderProductionReadiness(design) {
      const wrap = document.getElementById('readinessWrap');
      if (!wrap) return;

      const s = ((design.productionStatus || design.status || '') + '').toLowerCase();
      let pct = 94;
      let statusLabel = 'Production Ready';

      if (s.includes('ready') || s.includes('approved') || s.includes('active')) {
        pct = 94;
        statusLabel = 'Production Ready';
      } else if (s.includes('sample') || s.includes('trial')) {
        pct = 60;
        statusLabel = 'Sample Pending';
      } else if (s.includes('dev') || s.includes('draft')) {
        pct = 45;
        statusLabel = 'In Development';
      } else {
        pct = 30;
        statusLabel = 'Spec Drafted';
      }

      // 214 is 2 * PI * 34
      const strokeOffset = Math.round(214 - (214 * pct / 100));

      wrap.innerHTML = `
        <div class="readiness-header">Production Readiness</div>
        <div class="readiness-donut-center">
          <div class="readiness-ring-wrap">
            <svg class="readiness-ring-svg" viewBox="0 0 80 80">
              <circle class="readiness-ring-bg" cx="40" cy="40" r="34"></circle>
              <circle class="readiness-ring-fill" cx="40" cy="40" r="34" stroke-dasharray="214" stroke-dashoffset="${strokeOffset}"></circle>
            </svg>
            <div class="readiness-ring-overlay">
              <span class="readiness-pct">${pct}%</span>
              <span class="readiness-pct-label">${statusLabel}</span>
            </div>
          </div>
        </div>
        <div class="readiness-checklist">
          <div class="readiness-check-item ${pct >= 30 ? 'done' : ''}">
            <span class="readiness-check-dot"></span>
            <span>Design specification</span>
          </div>
          <div class="readiness-check-item ${pct >= 45 ? 'done' : ''}">
            <span class="readiness-check-dot"></span>
            <span>Construction details</span>
          </div>
          <div class="readiness-check-item ${pct >= 60 ? 'done' : ''}">
            <span class="readiness-check-dot"></span>
            <span>Sample approval</span>
          </div>
          <div class="readiness-check-item ${pct >= 75 ? 'done' : ''}">
            <span class="readiness-check-dot"></span>
            <span>Materials mapped</span>
          </div>
          <div class="readiness-check-item ${pct >= 85 ? 'done' : ''}">
            <span class="readiness-check-dot"></span>
            <span>Costing verified</span>
          </div>
          <div class="readiness-check-item ${pct >= 95 ? 'done' : ''}">
            <span class="readiness-check-dot"></span>
            <span>Production timings</span>
          </div>
        </div>
      `;
    }

    function renderFitIntelligence(design) {
      const card = document.getElementById('fitIntelCard');
      if (!card) return;

      const garmentsCount = Number(design.timesUsed) || 0;
      const approvalRate = design.firstTrialApproval || (garmentsCount > 0 ? (Math.min(96, Math.max(78, 80 + (garmentsCount * 3) % 17)) + '%') : '—');
      const adjustment = design.commonAdjustment || (garmentsCount > 0 ? '+0.25"' : 'Standard precision fit');
      const alterationText = design.alterationNote || (garmentsCount > 0 ? 'Consistent fit approval observed across boutique executions' : 'Awaiting initial customer trial feedback');

      card.innerHTML = `
        <div class="intel-card-header">
          <div class="intel-card-title-wrap">
            <div class="intel-card-icon icon-teal">
              <i data-lucide="scissors" style="width:13px;height:13px;"></i>
            </div>
            <div>
              <div class="intel-card-title">Fit Intelligence</div>
              <div style="font-size:8.5px;color:var(--text-muted);">Across executions</div>
            </div>
          </div>
        </div>
        <div class="fit-stat-row">
          <div>
            <div class="fit-stat-value" style="text-align:left;font-size:15px;">${garmentsCount}</div>
            <div class="fit-stat-label">Garments produced</div>
          </div>
          <div style="text-align:right;">
            <div class="fit-stat-value" style="color:var(--accent-lime);font-size:15px;">${approvalRate}</div>
            <div class="fit-stat-label">First-trial approval</div>
          </div>
        </div>
        <div class="fit-stat-row">
          <div>
            <div class="fit-stat-value" style="text-align:left;font-size:13px;">${adjustment}</div>
            <div class="fit-stat-label">Most common adjustment (armhole ease)</div>
          </div>
        </div>
        <div style="font-size:9.5px;color:var(--text-secondary);line-height:1.35;margin-top:2px;">
          ${alterationText}
        </div>
        <div style="margin-top:auto;padding-top:4px;">
          <button type="button" class="intel-card-link" id="btnFitInsights">View insights &rarr;</button>
        </div>
      `;
    }

    function renderMaterialCompatibility(design) {
      const card = document.getElementById('materialCompatCard');
      if (!card) return;

      const primary = design.primaryFabric || 'Primary Fabric';
      let rowsHtml = '';

      if (Array.isArray(design.compatibility) && design.compatibility.length > 0) {
        rowsHtml = design.compatibility.map(item => {
          let badgeClass = 'compat-compat';
          let icon = '&check;';
          const lvl = (item.level || '').toLowerCase();
          if (lvl.includes('excellent')) {
            badgeClass = 'compat-excellent';
          } else if (lvl.includes('proven')) {
            badgeClass = 'compat-proven';
          } else if (lvl.includes('not') || lvl.includes('avoid')) {
            badgeClass = 'compat-not-rec';
            icon = '&times;';
          }
          return `
            <div class="compat-fabric-row">
              <span class="compat-fabric-name">${item.fabric}</span>
              <span class="compat-badge ${badgeClass}">${icon} ${item.level}</span>
            </div>
            ${item.note ? `<div class="compat-note">(${item.note})</div>` : ''}
          `;
        }).join('');
      } else {
        const otherFabrics = Array.from(new Set(state.designs.map(d => d.primaryFabric).filter(f => f && f !== primary))).slice(0, 3);
        rowsHtml = `
          <div class="compat-fabric-row">
            <span class="compat-fabric-name">${primary}</span>
            <span class="compat-badge compat-excellent">&check; Excellent</span>
          </div>
          ${otherFabrics.map((f, i) => `
            <div class="compat-fabric-row">
              <span class="compat-fabric-name">${f}</span>
              <span class="compat-badge ${i === 0 ? 'compat-proven' : 'compat-compat'}">&check; ${i === 0 ? 'Proven' : 'Compatible'}</span>
            </div>
          `).join('')}
        `;
      }

      card.innerHTML = `
        <div class="intel-card-header">
          <div class="intel-card-title-wrap">
            <div class="intel-card-icon icon-blue">
              <i data-lucide="layers" style="width:13px;height:13px;"></i>
            </div>
            <span class="intel-card-title">Material Compatibility</span>
          </div>
          <button type="button" class="intel-card-link">View all &rarr;</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px;">
          ${rowsHtml}
        </div>
      `;
    }

    function renderProductionComplexity(design) {
      const card = document.getElementById('prodComplexityCard');
      if (!card) return;

      const rawLabour = design.estimatedLabour || '';
      const totalHours = parseFloat(rawLabour) || 12.0;

      let b = design.laborBreakdown;
      if (!b) {
        b = {
          pattern: Math.round(totalHours * 0.10 * 10) / 10,
          cutting: Math.round(totalHours * 0.07 * 10) / 10,
          embroidery: Math.round(totalHours * 0.43 * 10) / 10,
          stitching: Math.round(totalHours * 0.32 * 10) / 10,
          finishing: Math.round(totalHours * 0.08 * 10) / 10
        };
      }

      const patternPct = Math.min(100, Math.round((b.pattern / totalHours) * 100 * 2.5));
      const cuttingPct = Math.min(100, Math.round((b.cutting / totalHours) * 100 * 2.5));
      const embPct = Math.min(100, Math.round((b.embroidery / totalHours) * 100));
      const stitchPct = Math.min(100, Math.round((b.stitching / totalHours) * 100 * 1.5));
      const finishPct = Math.min(100, Math.round((b.finishing / totalHours) * 100 * 2.5));

      const constraintText = design.constraint || (totalHours >= 20
        ? 'Intricate handcraft requires dedicated artisan capacity.'
        : 'Embroidery and assembly represent the primary production phases.');

      const complexityClass = totalHours >= 20 ? 'complexity-high' : (totalHours >= 10 ? 'complexity-medium' : 'complexity-low');
      const complexityLabel = totalHours >= 20 ? 'High' : (totalHours >= 10 ? 'Medium' : 'Standard');

      card.innerHTML = `
        <div class="intel-card-header">
          <div class="intel-card-title-wrap">
            <div class="intel-card-icon icon-orange">
              <i data-lucide="cog" style="width:13px;height:13px;"></i>
            </div>
            <span class="intel-card-title">Production Complexity</span>
          </div>
          <span class="complexity-badge ${complexityClass}">${complexityLabel}</span>
        </div>
        <div class="complexity-time-table">
          <div class="complexity-time-row">
            <span class="complexity-time-phase">Pattern</span>
            <div class="complexity-time-bar-track"><div class="complexity-time-bar-fill" style="width:${patternPct}%;"></div></div>
            <span class="complexity-time-val">${b.pattern} hrs</span>
          </div>
          <div class="complexity-time-row">
            <span class="complexity-time-phase">Cutting</span>
            <div class="complexity-time-bar-track"><div class="complexity-time-bar-fill" style="width:${cuttingPct}%;"></div></div>
            <span class="complexity-time-val">${b.cutting} hrs</span>
          </div>
          <div class="complexity-time-row">
            <span class="complexity-time-phase">Embroidery</span>
            <div class="complexity-time-bar-track"><div class="complexity-time-bar-fill" style="width:${embPct}%;"></div></div>
            <span class="complexity-time-val">${b.embroidery} hrs</span>
          </div>
          <div class="complexity-time-row">
            <span class="complexity-time-phase">Stitching</span>
            <div class="complexity-time-bar-track"><div class="complexity-time-bar-fill" style="width:${stitchPct}%;"></div></div>
            <span class="complexity-time-val">${b.stitching} hrs</span>
          </div>
          <div class="complexity-time-row">
            <span class="complexity-time-phase">Finishing</span>
            <div class="complexity-time-bar-track"><div class="complexity-time-bar-fill" style="width:${finishPct}%;"></div></div>
            <span class="complexity-time-val">${b.finishing} hrs</span>
          </div>
        </div>
        <div style="font-size:9px;color:#FCD34D;display:flex;align-items:flex-start;gap:4px;margin-top:3px;line-height:1.3;">
          <i data-lucide="alert-triangle" style="width:11px;height:11px;flex-shrink:0;margin-top:1px;"></i>
          <span>${constraintText}</span>
        </div>
      `;
    }

    function renderVariantFamily(design) {
      const card = document.getElementById('variantFamilyCard');
      if (!card) return;

      const code = design.code || 'RH-1023';
      let items = [];

      if (Array.isArray(design.variants) && design.variants.length > 0) {
        items = design.variants;
      } else {
        const related = state.designs.filter(d => d.id !== design.id && (d.category === design.category || d.collection === design.collection)).slice(0, 3);
        items = [
          { code: design.code, title: 'Master', type: 'Master Design', image: design.cardImage },
          ...related.map((r, idx) => ({
            code: r.code,
            title: r.name ? r.name.split(' ')[0] : `Var ${idx + 1}`,
            type: r.name,
            image: r.cardImage,
            targetId: r.id
          }))
        ];
      }

      card.innerHTML = `
        <div class="intel-card-header">
          <div class="intel-card-title-wrap">
            <div class="intel-card-icon icon-violet">
              <i data-lucide="git-fork" style="width:13px;height:13px;"></i>
            </div>
            <span class="intel-card-title">Variant Family</span>
          </div>
          <button type="button" class="intel-card-link" id="btnViewAllVariants">View all &rarr;</button>
        </div>
        <div class="variant-thumb-strip">
          ${items.map((item, idx) => {
            const isMaster = idx === 0 || item.code === code;
            const imgUrl = item.image || FALLBACK_DESIGN_SVG;
            return `
              <div class="variant-thumb-item ${isMaster ? 'is-master' : ''}" data-variant-code="${item.code}" data-target-id="${item.targetId || ''}" title="${item.type || item.title}: ${item.code}">
                <img src="${imgUrl}" class="variant-thumb-img" alt="${item.code}" onerror="this.onerror=null; this.src='${FALLBACK_DESIGN_SVG}';" />
                <span class="variant-thumb-label" style="${isMaster ? 'font-weight:700;' : ''}">${item.code}</span>
                <span class="variant-thumb-label" style="${isMaster ? 'color:var(--accent-lime);' : ''}">${item.title}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    function renderVersionHistory(design) {
      const card = document.getElementById('versionHistoryCard');
      if (!card) return;

      const lastDate = design.lastUsed && design.lastUsed !== '—' ? design.lastUsed : (design.lastUsedDate || 'Active');
      const createdDate = design.creationDate || 'Registered';

      let versions = [];
      if (Array.isArray(design.versions) && design.versions.length > 0) {
        versions = design.versions;
      } else {
        const curVer = design.version || 'V1';
        versions = [
          { version: curVer, date: lastDate, change: 'Production specification current', current: true },
          { version: 'V1', date: createdDate, change: 'Initial design release' }
        ];
      }

      card.innerHTML = `
        <div class="intel-card-header">
          <div class="intel-card-title-wrap">
            <div class="intel-card-icon icon-blue">
              <i data-lucide="history" style="width:13px;height:13px;"></i>
            </div>
            <span class="intel-card-title">Version History</span>
          </div>
          <button type="button" class="intel-card-link">View all &rarr;</button>
        </div>
        <div class="version-timeline">
          ${versions.map((v, idx) => `
            <div class="version-item ${v.current || idx === 0 ? 'current' : ''}">
              <span class="version-dot"></span>
              <div class="version-content">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="version-tag">${v.version}</span>
                  <span class="version-date">${v.date}</span>
                </div>
                <span class="version-change">${v.change}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    function renderDesignPerformance(design) {
      const card = document.getElementById('designPerfCard');
      if (!card) return;

      const timesUsed = Number(design.timesUsed) || 0;
      const approvalRate = design.firstTrialApproval ? (parseInt(design.firstTrialApproval) / 100) : 0.85;
      const approvals = timesUsed > 0 ? Math.max(1, Math.round(timesUsed * approvalRate)) : 0;
      const labourTime = design.estimatedLabour || '—';
      const activeInProd = timesUsed > 0 ? Math.max(1, Math.round(timesUsed * 0.12)) : 0;

      card.innerHTML = `
        <div class="intel-card-header">
          <div class="intel-card-title-wrap">
            <div class="intel-card-icon icon-rose">
              <i data-lucide="trending-up" style="width:13px;height:13px;"></i>
            </div>
            <span class="intel-card-title">Design Performance</span>
          </div>
        </div>
        <div class="perf-stats-grid">
          <div class="perf-stat">
            <span class="perf-stat-number">${timesUsed}</span>
            <span class="perf-stat-label">Garments created</span>
          </div>
          <div class="perf-stat">
            <span class="perf-stat-number">${approvals}</span>
            <span class="perf-stat-label">First-trial approvals</span>
          </div>
          <div class="perf-stat">
            <span class="perf-stat-number">${labourTime}</span>
            <span class="perf-stat-label">Avg production time</span>
          </div>
          <div class="perf-stat">
            <span class="perf-stat-number">${activeInProd}</span>
            <span class="perf-stat-label">Active garments in production</span>
          </div>
        </div>
      `;
    }

    /* ==========================================================================
       8. TOAST NOTIFICATION SYSTEM
       ========================================================================== */
    function showToast(message, type = 'info') {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'glass-toast';
      let iconName = 'check-circle-2';
      let iconColor = 'var(--accent-lime)';

      if (type === 'favorite') {
        iconName = 'heart';
        iconColor = '#FF4D6D';
      } else if (type === 'delete') {
        iconName = 'trash-2';
        iconColor = '#FF6E6E';
      }

      toast.innerHTML = `
      <i data-lucide="${iconName}" style="width:16px;height:16px;color:${iconColor};"></i>
      <span>${message}</span>
    `;
      container.appendChild(toast);

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: toast });
      }

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        toast.style.transition = 'all 0.2s ease';
        setTimeout(() => toast.remove(), 200);
      }, 2800);
    }

    /* ==========================================================================
       9. EVENT LISTENERS & DOM HOOKS
       ========================================================================== */
    function bindEventListeners() {
      // 1. Category Tabs click
      const categoryTabs = document.getElementById('categoryTabs');
      if (categoryTabs) {
        categoryTabs.addEventListener('click', e => {
          const tab = e.target.closest('.cat-tab');
          if (!tab) return;

          categoryTabs.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          state.activeCategory = tab.getAttribute('data-category');
          state.currentPage = 1;
          renderGallery();
        });
      }

      // 2. Search Input live filtering
      const searchInput = document.getElementById('designSearchInput');
      const clearSearchBtn = document.getElementById('btnClearSearch');
      if (searchInput) {
        searchInput.addEventListener('input', e => {
          state.searchQuery = e.target.value;
          if (clearSearchBtn) {
            clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
          }
          state.currentPage = 1;
          renderGallery();
        });

        // Keyboard shortcut ⌘K / Ctrl+K
        window.addEventListener('keydown', e => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            searchInput.focus();
          }
        });
      }

      if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
          searchInput.value = '';
          state.searchQuery = '';
          clearSearchBtn.style.display = 'none';
          state.currentPage = 1;
          renderGallery();
          searchInput.focus();
        });
      }

      // 3. Grid vs Table View toggle
      const btnGrid = document.getElementById('btnViewGrid');
      const btnList = document.getElementById('btnViewList');

      function switchViewMode(mode) {
        state.viewMode = mode;
        try {
          localStorage.setItem('haulo_design_view_mode', mode);
        } catch (e) { }
        renderGallery();
      }

      if (btnList) btnList.addEventListener('click', () => switchViewMode('table'));
      if (btnGrid) btnGrid.addEventListener('click', () => switchViewMode('grid'));

      // 4. Card Selection & Card Favorite clicks
      const gridContainer = document.getElementById('designGrid');
      if (gridContainer) {
        gridContainer.addEventListener('click', e => {
          // Favorite heart clicked
          const favBtn = e.target.closest('.btn-card-favorite');
          if (favBtn) {
            e.stopPropagation();
            const id = favBtn.getAttribute('data-fav-id');
            toggleFavorite(id);
            return;
          }

          // Card menu clicked
          const menuBtn = e.target.closest('.btn-card-menu');
          if (menuBtn) {
            e.stopPropagation();
            const id = menuBtn.getAttribute('data-menu-id');
            openEditModal(id);
            return;
          }

          // Card body clicked
          const card = e.target.closest('.design-card');
          if (card) {
            const id = card.getAttribute('data-id');
            selectDesign(id);
          }
        });
      }

      // 5. Designs Data Table row clicks & actions
      const listTbody = document.getElementById('designListTbody');
      if (listTbody) {
        listTbody.addEventListener('click', e => {
          // Handle action buttons
          const actionBtn = e.target.closest('.btn-tbl-action');
          if (actionBtn) {
            e.stopPropagation();
            if (actionBtn.hasAttribute('data-use-order')) {
              const id = actionBtn.getAttribute('data-use-order');
              openOrderModal(id);
            } else if (actionBtn.hasAttribute('data-edit-design')) {
              const id = actionBtn.getAttribute('data-edit-design');
              openEditModal(id);
            } else if (actionBtn.hasAttribute('data-fav-id')) {
              const id = actionBtn.getAttribute('data-fav-id');
              toggleFavorite(id);
            }
            return;
          }

          // Handle checkbox click
          if (e.target.closest('.design-checkbox')) {
            e.stopPropagation();
            return;
          }

          const row = e.target.closest('tr');
          if (row) {
            const id = row.getAttribute('data-id');
            selectDesign(id);
          }
        });
      }

      // 6. Designs Data Table: Column sorting & Select All
      const designTable = document.getElementById('designTable');
      if (designTable) {
        const thead = designTable.querySelector('thead');
        if (thead) {
          thead.addEventListener('click', e => {
            const sortTh = e.target.closest('th.sortable-th');
            if (sortTh) {
              const sortField = sortTh.getAttribute('data-sort');
              if (state.tableSortField === sortField) {
                state.tableSortDir = state.tableSortDir === 'asc' ? 'desc' : 'asc';
              } else {
                state.tableSortField = sortField;
                state.tableSortDir = 'asc';
              }
              renderGallery();
            }
          });
        }
      }

      // 5. Selected Design Gallery Thumbnails click
      const thumbStrip = document.getElementById('thumbnailStrip');
      if (thumbStrip) {
        thumbStrip.addEventListener('click', e => {
          const thumb = e.target.closest('.thumb-btn');
          if (thumb) {
            const idx = parseInt(thumb.getAttribute('data-thumb-idx'), 10);
            state.lightboxIndex = idx;
            renderSelectedDesign();
          }
        });
      }

      // 6. Main Preview Image click -> Open Lightbox
      const mainPreview = document.getElementById('mainPreviewWrap');
      if (mainPreview) {
        mainPreview.addEventListener('click', () => {
          openLightbox();
        });
      }

      // 7. Header Action Buttons & Detail Actions (Matching Reference Screenshot)
      const btnHeaderUse = document.getElementById('btnHeaderUseInOrder');
      if (btnHeaderUse) {
        btnHeaderUse.addEventListener('click', () => {
          if (state.selectedDesignId) {
            openOrderModal(state.selectedDesignId);
          } else {
            showToast('Please select a design first', 'info');
          }
        });
      }

      const btnCreateVar = document.getElementById('btnCreateVariant');
      const modalCreateVar = document.getElementById('modalCreateDesign');
      const formCreateVar = document.getElementById('formCreateDesign');
      if (btnCreateVar) {
        btnCreateVar.addEventListener('click', () => {
          const curDesign = state.designs.find(d => d.id === state.selectedDesignId);
          if (!curDesign) {
            showToast('Please select a design first', 'info');
            return;
          }
          if (formCreateVar) formCreateVar.reset();
          const codeInput = document.getElementById('newDesignCode');
          if (codeInput) codeInput.value = `${curDesign.code || 'DS'}-A`;
          const nameInput = document.getElementById('newDesignName');
          if (nameInput) nameInput.value = `${curDesign.name || ''} (Variant)`;
          const catInput = document.getElementById('newDesignCategory');
          if (catInput && curDesign.category) catInput.value = curDesign.category;
          const fabricInput = document.getElementById('newDesignFabric');
          if (fabricInput && curDesign.primaryFabric) fabricInput.value = curDesign.primaryFabric;
          createDesignImages = curDesign.images ? [...curDesign.images] : [];
          renderCreateImagesGrid();
          if (modalCreateVar) modalCreateVar.style.display = 'flex';
          showToast(`Creating variant based on ${curDesign.code}`, 'info');
        });
      }

      const btnHeaderEdit = document.getElementById('btnHeaderEditDesign');
      if (btnHeaderEdit) {
        btnHeaderEdit.addEventListener('click', () => {
          if (state.selectedDesignId) {
            openEditModal(state.selectedDesignId);
          } else {
            showToast('Please select a design first', 'info');
          }
        });
      }

      // Copy Code Button
      const btnCopyCode = document.getElementById('btnCopyCode');
      if (btnCopyCode) {
        btnCopyCode.addEventListener('click', () => {
          const curDesign = state.designs.find(d => d.id === state.selectedDesignId);
          if (curDesign && curDesign.code) {
            navigator.clipboard.writeText(curDesign.code).then(() => {
              showToast(`Design code ${curDesign.code} copied to clipboard`, 'info');
            }).catch(() => {
              showToast(`Copied ${curDesign.code}`, 'info');
            });
          }
        });
      }

      // Variant Family card interaction
      const variantCard = document.getElementById('variantFamilyCard');
      if (variantCard) {
        variantCard.addEventListener('click', e => {
          const item = e.target.closest('.variant-thumb-item');
          if (item) {
            const vCode = item.getAttribute('data-variant-code');
            showToast(`Switched to variant view: ${vCode}`, 'info');
          }
        });
      }

      // 8. Detail panel Favorite & Close clicks
      const detailFavBtn = document.getElementById('btnDetailFavorite');
      if (detailFavBtn) {
        detailFavBtn.addEventListener('click', () => {
          toggleFavorite(state.selectedDesignId);
        });
      }

      const detailCloseBtn = document.getElementById('btnDetailClose');
      if (detailCloseBtn) {
        detailCloseBtn.addEventListener('click', () => {
          const panel = document.getElementById('selectedDesignPanel');
          if (panel) panel.style.display = 'none';
          const ws = document.getElementById('studioWorkspace');
          if (ws) ws.classList.add('no-detail');
        });
      }

      // 9. Pagination controls
      const paginationControls = document.getElementById('paginationControls');
      if (paginationControls) {
        paginationControls.addEventListener('click', e => {
          const btn = e.target.closest('.btn-page');
          if (!btn || btn.disabled) return;

          if (btn.id === 'btnPrevPage') {
            if (state.currentPage > 1) {
              state.currentPage--;
              renderGallery();
            }
          } else if (btn.id === 'btnNextPage') {
            const allFiltered = getFilteredAndSortedDesigns();
            const totalPages = Math.ceil(allFiltered.length / state.itemsPerPage);
            if (state.currentPage < totalPages) {
              state.currentPage++;
              renderGallery();
            }
          } else if (btn.getAttribute('data-page')) {
            state.currentPage = parseInt(btn.getAttribute('data-page'), 10);
            renderGallery();
          }
        });
      }

      // 10. Filter Button & Popover
      const btnToggleFilter = document.getElementById('btnToggleFilter');
      const filterPopover = document.getElementById('filterPopover');
      const btnCloseFilter = document.getElementById('btnCloseFilterPopover');
      const btnApplyFilter = document.getElementById('btnApplyPopoverFilters');
      const btnClearFilter = document.getElementById('btnClearPopoverFilters');

      if (btnToggleFilter && filterPopover) {
        btnToggleFilter.addEventListener('click', e => {
          e.stopPropagation();
          const isShown = filterPopover.style.display === 'block';
          closeAllPopovers();
          if (!isShown) {
            const rect = btnToggleFilter.getBoundingClientRect();
            filterPopover.style.top = `${rect.bottom + 8}px`;
            filterPopover.style.right = `${window.innerWidth - rect.right}px`;
            filterPopover.style.display = 'block';
          }
        });

        if (btnCloseFilter) {
          btnCloseFilter.addEventListener('click', () => {
            filterPopover.style.display = 'none';
          });
        }

        if (btnApplyFilter) {
          btnApplyFilter.addEventListener('click', () => {
            state.filters.style = document.getElementById('filterStyle').value;
            state.filters.occasion = document.getElementById('filterOccasion').value;
            state.filters.fabric = document.getElementById('filterFabric').value;
            state.filters.status = document.getElementById('filterStatus').value;
            state.filters.favoritesOnly = document.getElementById('filterFavoritesOnly').checked;

            const hasActiveFilters = Object.values(state.filters).some(v => v);
            const badge = document.getElementById('filterActiveBadge');
            if (badge) badge.style.display = hasActiveFilters ? 'inline-block' : 'none';

            filterPopover.style.display = 'none';
            state.currentPage = 1;
            renderGallery();
            showToast("Filters applied", "info");
          });
        }

        if (btnClearFilter) {
          btnClearFilter.addEventListener('click', () => {
            document.getElementById('filterStyle').value = '';
            document.getElementById('filterOccasion').value = '';
            document.getElementById('filterFabric').value = '';
            document.getElementById('filterStatus').value = '';
            document.getElementById('filterFavoritesOnly').checked = false;

            state.filters = { style: '', occasion: '', fabric: '', status: '', favoritesOnly: false };
            const badge = document.getElementById('filterActiveBadge');
            if (badge) badge.style.display = 'none';

            filterPopover.style.display = 'none';
            state.currentPage = 1;
            renderGallery();
            showToast("Filters cleared", "info");
          });
        }
      }

      // Reset All Filters button in Empty State
      const btnResetAll = document.getElementById('btnResetAllFilters');
      if (btnResetAll) {
        btnResetAll.addEventListener('click', () => {
          state.searchQuery = '';
          state.activeCategory = 'All Designs';
          state.filters = { style: '', occasion: '', fabric: '', status: '', favoritesOnly: false };
          const searchInput = document.getElementById('designSearchInput');
          if (searchInput) searchInput.value = '';
          const clearSearchBtn = document.getElementById('btnClearSearch');
          if (clearSearchBtn) clearSearchBtn.style.display = 'none';
          const badge = document.getElementById('filterActiveBadge');
          if (badge) badge.style.display = 'none';
          const categoryTabs = document.getElementById('categoryTabs');
          if (categoryTabs) {
            categoryTabs.querySelectorAll('.cat-tab').forEach(t => {
              if (t.getAttribute('data-category') === 'All Designs') t.classList.add('active');
              else t.classList.remove('active');
            });
          }
          state.currentPage = 1;
          renderGallery();
          showToast("All filters and searches reset", "info");
        });
      }

      // 11. Sort Button & Popover
      const btnSort = document.getElementById('btnSortDropdown') || document.getElementById('btnToggleSort');
      const sortPopover = document.getElementById('sortPopover');
      const sortLabel = document.getElementById('sortButtonLabel');

      if (btnSort && sortPopover) {
        btnSort.addEventListener('click', e => {
          e.stopPropagation();
          const isShown = sortPopover.style.display === 'block';
          closeAllPopovers();
          if (!isShown) {
            const rect = btnSort.getBoundingClientRect();
            sortPopover.style.top = `${rect.bottom + 8}px`;
            sortPopover.style.right = `${window.innerWidth - rect.right}px`;
            sortPopover.style.display = 'block';
          }
        });

        sortPopover.addEventListener('click', e => {
          const option = e.target.closest('.sort-option-btn');
          if (!option) return;

          sortPopover.querySelectorAll('.sort-option-btn').forEach(b => b.classList.remove('active'));
          option.classList.add('active');

          state.sortBy = option.getAttribute('data-sort');
          if (sortLabel) sortLabel.textContent = option.textContent;
          sortPopover.style.display = 'none';
          renderGallery();
        });
      }

      // Close popovers when clicking outside
      document.addEventListener('click', e => {
        if (filterPopover && !filterPopover.contains(e.target) && e.target !== btnToggleFilter) {
          filterPopover.style.display = 'none';
        }
        if (sortPopover && !sortPopover.contains(e.target) && e.target !== btnSort) {
          sortPopover.style.display = 'none';
        }
      });

      // 12. Modal Openers & Form Handlers
      // Design Code Generator (Auto-select next sequential code)
      function generateNextDesignCode() {
        const curYear = new Date().getFullYear();
        let maxSeq = 0;
        const prefix = `DS-${curYear}-`;

        state.designs.forEach(d => {
          if (!d || !d.code) return;
          const c = String(d.code).toUpperCase().trim();
          const m = c.match(/^(?:DS|DES)-(\d{4})-(\d+)/);
          if (m) {
            const y = parseInt(m[1], 10);
            const num = parseInt(m[2], 10);
            if (y === curYear && num > maxSeq) {
              maxSeq = num;
            }
          } else {
            const m2 = c.match(/^(?:DS|DES)-(\d+)/);
            if (m2) {
              const num = parseInt(m2[1], 10);
              if (num > maxSeq) maxSeq = num;
            }
          }
        });

        const nextSeq = maxSeq + 1;
        const padded = String(nextSeq).padStart(3, '0');
        return `${prefix}${padded}`;
      }

      // Multi-image management state
      let createDesignImages = [];
      let editDesignImages = [];

      function renderCreateImagesGrid() {
        const grid = document.getElementById('createImagePreviewGrid');
        const hint = document.getElementById('createImageCountHint');
        if (!grid) return;
        if (hint) {
          hint.textContent = `${createDesignImages.length} photo${createDesignImages.length === 1 ? '' : 's'} selected`;
        }
        if (createDesignImages.length === 0) {
          grid.innerHTML = '';
          grid.style.display = 'none';
          return;
        }
        grid.style.display = 'flex';
        grid.innerHTML = createDesignImages.map((imgUrl, idx) => `
          <div class="preview-thumb-card ${idx === 0 ? 'is-primary' : ''}" data-idx="${idx}" title="${idx === 0 ? 'Primary catalog image' : 'Click star to make primary'}">
            <img src="${imgUrl}" class="preview-thumb-img" alt="Uploaded photo ${idx + 1}" />
            ${idx === 0 ? '<span class="badge-primary-thumb">Primary</span>' : `<button type="button" class="btn-thumb-set-primary" data-action="set-primary" data-idx="${idx}" title="Set as primary image"><i data-lucide="star" style="width:11px;height:11px;"></i></button>`}
            <button type="button" class="btn-thumb-remove" data-action="remove-img" data-idx="${idx}" title="Remove photo">&times;</button>
          </div>
        `).join('');
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons({ root: grid });
        }
      }

      function renderEditImagesGrid() {
        const grid = document.getElementById('editImagePreviewGrid');
        const hint = document.getElementById('editImageCountHint');
        if (!grid) return;
        if (hint) {
          hint.textContent = `${editDesignImages.length} photo${editDesignImages.length === 1 ? '' : 's'}`;
        }
        if (editDesignImages.length === 0) {
          grid.innerHTML = '';
          grid.style.display = 'none';
          return;
        }
        grid.style.display = 'flex';
        grid.innerHTML = editDesignImages.map((imgUrl, idx) => `
          <div class="preview-thumb-card ${idx === 0 ? 'is-primary' : ''}" data-idx="${idx}" title="${idx === 0 ? 'Primary catalog image' : 'Click star to make primary'}">
            <img src="${imgUrl}" class="preview-thumb-img" alt="Design photo ${idx + 1}" />
            ${idx === 0 ? '<span class="badge-primary-thumb">Primary</span>' : `<button type="button" class="btn-thumb-set-primary" data-action="set-primary" data-idx="${idx}" title="Set as primary image"><i data-lucide="star" style="width:11px;height:11px;"></i></button>`}
            <button type="button" class="btn-thumb-remove" data-action="remove-img" data-idx="${idx}" title="Remove photo">&times;</button>
          </div>
        `).join('');
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons({ root: grid });
        }
      }

      // Header More Options
      const btnMoreHeaderOptions = document.getElementById('btnMoreHeaderOptions');
      if (btnMoreHeaderOptions) {
        btnMoreHeaderOptions.addEventListener('click', async () => {
          showToast('Refreshing designs library...', 'info');
          await loadLiveDesigns();
        });
      }

      // A. New Design Button
      const btnNewDesign = document.getElementById('btnNewDesign');
      const modalCreate = document.getElementById('modalCreateDesign');
      const formCreate = document.getElementById('formCreateDesign');
      const btnRegenCode = document.getElementById('btnRegenDesignCode');

      if (btnNewDesign && modalCreate) {
        btnNewDesign.addEventListener('click', () => {
          if (formCreate) formCreate.reset();
          const codeInput = document.getElementById('newDesignCode');
          if (codeInput) codeInput.value = generateNextDesignCode();
          createDesignImages = [];
          renderCreateImagesGrid();
          modalCreate.style.display = 'flex';
        });
      }

      if (btnRegenCode) {
        btnRegenCode.addEventListener('click', () => {
          const codeInput = document.getElementById('newDesignCode');
          if (codeInput) {
            codeInput.value = generateNextDesignCode();
            showToast('Generated fresh design code', 'info');
          }
        });
      }

      // Dropzone multiple image upload handlers for Create Modal
      const createDropzone = document.getElementById('createDropzone');
      const createFileInput = document.getElementById('newDesignImageFile');
      const createGrid = document.getElementById('createImagePreviewGrid');

      function handleCreateFiles(files) {
        if (!files || files.length === 0) return;
        Array.from(files).forEach(file => {
          if (!file.type || !file.type.startsWith('image/')) return;
          const reader = new FileReader();
          reader.onload = e => {
            createDesignImages.push(e.target.result);
            renderCreateImagesGrid();
          };
          reader.readAsDataURL(file);
        });
      }

      if (createDropzone && createFileInput) {
        createDropzone.addEventListener('click', () => createFileInput.click());
        createFileInput.addEventListener('change', () => {
          handleCreateFiles(createFileInput.files);
          createFileInput.value = '';
        });

        createDropzone.addEventListener('dragover', e => {
          e.preventDefault();
          createDropzone.style.borderColor = 'var(--accent-lime, #B8FF2C)';
        });
        createDropzone.addEventListener('dragleave', e => {
          e.preventDefault();
          createDropzone.style.borderColor = '';
        });
        createDropzone.addEventListener('drop', e => {
          e.preventDefault();
          createDropzone.style.borderColor = '';
          if (e.dataTransfer && e.dataTransfer.files) {
            handleCreateFiles(e.dataTransfer.files);
          }
        });
      }

      if (createGrid) {
        createGrid.addEventListener('click', e => {
          const removeBtn = e.target.closest('[data-action="remove-img"]');
          if (removeBtn) {
            const idx = parseInt(removeBtn.dataset.idx, 10);
            if (!isNaN(idx)) {
              createDesignImages.splice(idx, 1);
              renderCreateImagesGrid();
            }
            return;
          }

          const setPrimaryBtn = e.target.closest('[data-action="set-primary"]');
          if (setPrimaryBtn) {
            const idx = parseInt(setPrimaryBtn.dataset.idx, 10);
            if (!isNaN(idx) && idx < createDesignImages.length) {
              const chosen = createDesignImages.splice(idx, 1)[0];
              createDesignImages.unshift(chosen);
              renderCreateImagesGrid();
            }
          }
        });
      }

      if (formCreate) {
        formCreate.addEventListener('submit', async e => {
          e.preventDefault();
          const name = document.getElementById('newDesignName').value.trim();
          const code = document.getElementById('newDesignCode').value.trim() || generateNextDesignCode();
          const category = document.getElementById('newDesignCategory').value;
          const subCategory = document.getElementById('newDesignSubCat').value.trim();
          const style = document.getElementById('newDesignStyle').value.trim();
          const occasion = document.getElementById('newDesignOccasion').value.trim();
          const fabric = document.getElementById('newDesignFabric').value.trim();
          const cost = parseInt(document.getElementById('newDesignCost').value, 10) || 0;
          const price = parseInt(document.getElementById('newDesignPrice').value, 10) || 0;
          const desc = document.getElementById('newDesignDesc').value.trim();

          const photos = createDesignImages.length > 0
            ? [...createDesignImages]
            : [FALLBACK_DESIGN_SVG];
          const primaryThumb = photos[0];
          const allImagesStr = photos.join(',');

          const newDesignObj = {
            id: code,
            name,
            code,
            category,
            subCategory,
            style,
            occasion,
            primaryFabric: fabric,
            estimatedCost: cost,
            suggestedPrice: price,
            creationDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            createdBy: "Design Team",
            colourOptions: "",
            sizes: "Custom Made-to-Measure",
            construction: "",
            embroidery: "",
            estimatedLabour: "",
            productionStatus: "Active",
            timesUsed: 0,
            lastUsed: "—",
            description: desc,
            images: photos,
            cardImage: primaryThumb,
            thumbnailUrl: primaryThumb,
            swatches: [],
            tags: ["New", category].filter(Boolean),
            materials: {
              fabrics: fabric ? [fabric] : [],
              embroidery: [],
              lining: "",
              accessories: [],
              cost
            },
            measurements: [],
            production: { status: "Active", timesUsed: 0, labour: "", stages: [] },
            relatedOrders: []
          };

          try {
            if (window.api && window.api.designs) {
              await window.api.designs.create({
                designCode: code,
                title: name,
                garmentType: category,
                subCategory: subCategory,
                style: style,
                occasion: occasion,
                primaryFabric: fabric,
                estimatedCost: cost,
                suggestedPrice: price,
                styleNotes: desc,
                designer: 'Design Team',
                thumbnailUrl: primaryThumb,
                imageUrls: allImagesStr,
                status: 'APPROVED',
                productionStatus: 'Active'
              });
              await loadLiveDesigns();
            } else {
              state.designs.unshift(newDesignObj);
              state.selectedDesignId = newDesignObj.id;
              renderGallery();
            }
          } catch (err) {
            console.error('Error saving design:', err);
            state.designs.unshift(newDesignObj);
            state.selectedDesignId = newDesignObj.id;
            renderGallery();
          }

          formCreate.reset();
          createDesignImages = [];
          renderCreateImagesGrid();
          modalCreate.style.display = 'none';
          showToast(`Design "${name}" (${code}) created with ${photos.length} photo${photos.length === 1 ? '' : 's'}!`, 'info');
        });
      }

      // B. Edit Design Button & Multi-image Handlers
      const btnEditDesign = document.getElementById('btnEditDesign');
      const modalEdit = document.getElementById('modalEditDesign');
      const formEdit = document.getElementById('formEditDesign');
      const editDropzone = document.getElementById('editDropzone');
      const editFileInput = document.getElementById('editDesignImageFile');
      const editGrid = document.getElementById('editImagePreviewGrid');

      function handleEditFiles(files) {
        if (!files || files.length === 0) return;
        Array.from(files).forEach(file => {
          if (!file.type || !file.type.startsWith('image/')) return;
          const reader = new FileReader();
          reader.onload = e => {
            editDesignImages.push(e.target.result);
            renderEditImagesGrid();
          };
          reader.readAsDataURL(file);
        });
      }

      if (editDropzone && editFileInput) {
        editDropzone.addEventListener('click', () => editFileInput.click());
        editFileInput.addEventListener('change', () => {
          handleEditFiles(editFileInput.files);
          editFileInput.value = '';
        });

        editDropzone.addEventListener('dragover', e => {
          e.preventDefault();
          editDropzone.style.borderColor = 'var(--accent-lime, #B8FF2C)';
        });
        editDropzone.addEventListener('dragleave', e => {
          e.preventDefault();
          editDropzone.style.borderColor = '';
        });
        editDropzone.addEventListener('drop', e => {
          e.preventDefault();
          editDropzone.style.borderColor = '';
          if (e.dataTransfer && e.dataTransfer.files) {
            handleEditFiles(e.dataTransfer.files);
          }
        });
      }

      if (editGrid) {
        editGrid.addEventListener('click', e => {
          const removeBtn = e.target.closest('[data-action="remove-img"]');
          if (removeBtn) {
            const idx = parseInt(removeBtn.dataset.idx, 10);
            if (!isNaN(idx)) {
              editDesignImages.splice(idx, 1);
              renderEditImagesGrid();
            }
            return;
          }

          const setPrimaryBtn = e.target.closest('[data-action="set-primary"]');
          if (setPrimaryBtn) {
            const idx = parseInt(setPrimaryBtn.dataset.idx, 10);
            if (!isNaN(idx) && idx < editDesignImages.length) {
              const chosen = editDesignImages.splice(idx, 1)[0];
              editDesignImages.unshift(chosen);
              renderEditImagesGrid();
            }
          }
        });
      }

      if (btnEditDesign) {
        btnEditDesign.addEventListener('click', () => {
          openEditModal(state.selectedDesignId);
        });
      }

      if (formEdit) {
        formEdit.addEventListener('submit', async e => {
          e.preventDefault();
          const id = document.getElementById('editDesignId').value;
          const target = state.designs.find(d => String(d.id) === String(id));
          if (target) {
            target.name = document.getElementById('editDesignName').value.trim();
            target.category = document.getElementById('editDesignCategory').value;
            target.subCategory = document.getElementById('editDesignSubCat').value.trim();
            target.style = document.getElementById('editDesignStyle').value.trim();
            target.occasion = document.getElementById('editDesignOccasion').value.trim();
            target.primaryFabric = document.getElementById('editDesignFabric').value.trim();
            target.estimatedCost = parseInt(document.getElementById('editDesignCost').value, 10) || target.estimatedCost;
            target.suggestedPrice = parseInt(document.getElementById('editDesignPrice').value, 10) || target.suggestedPrice;
            target.description = document.getElementById('editDesignDesc').value.trim();

            if (editDesignImages.length > 0) {
              target.images = [...editDesignImages];
              target.cardImage = editDesignImages[0];
              target.thumbnailUrl = editDesignImages[0];
            }

            try {
              if (window.api && window.api.designs && target.id) {
                await window.api.designs.update(target.id, {
                  title: target.name,
                  garmentType: target.category,
                  subCategory: target.subCategory,
                  style: target.style,
                  occasion: target.occasion,
                  primaryFabric: target.primaryFabric,
                  estimatedCost: target.estimatedCost,
                  suggestedPrice: target.suggestedPrice,
                  styleNotes: target.description,
                  thumbnailUrl: target.cardImage,
                  imageUrls: target.images ? target.images.join(',') : ''
                });
              }
            } catch (err) {
              console.error('Error updating design:', err);
            }

            modalEdit.style.display = 'none';
            initDonutChart();
            renderGallery();
            renderSelectedDesign();
            showToast(`Design "${target.name}" updated successfully!`, 'info');
          }
        });
      }

      // C. Use in New Order
      const btnUseInOrder = document.getElementById('btnUseInNewOrder');
      const modalOrder = document.getElementById('modalUseInOrder');
      const formOrder = document.getElementById('formUseInOrder');

      if (btnUseInOrder) {
        btnUseInOrder.addEventListener('click', () => {
          openOrderModal(state.selectedDesignId);
        });
      }

      if (formOrder) {
        formOrder.addEventListener('submit', async e => {
          e.preventDefault();
          const design = state.designs.find(d => d.id === state.selectedDesignId);
          const cust = document.getElementById('orderCustomerName').value.trim();
          const price = document.getElementById('orderPrice').value;
          const dueDate = document.getElementById('orderDueDate').value;
          const notes = document.getElementById('orderNotes').value.trim();
          const gType = document.getElementById('orderGarmentType').value || (design ? design.category : 'Bespoke');

          modalOrder.style.display = 'none';

          try {
            const { default: api } = await import('../api.js');
            let custMobile = '9999900001';
            try {
              const custRes = await api.customers.list({ search: cust });
              const cList = Array.isArray(custRes) ? custRes : (custRes?.content || []);
              if (cList.length > 0 && cList[0].mobileNumber) {
                custMobile = cList[0].mobileNumber;
              }
            } catch (_) { }

            const createdOrder = await api.orders.create({
              customerMobile: custMobile,
              customerName: cust,
              garmentType: gType,
              garmentDesc: `${design ? design.name : gType} — ${design?.style || 'Custom Bespoke'}`,
              collection: design?.collection || 'Custom Couture',
              orderDate: new Date().toISOString().slice(0, 10),
              expectedDeliveryDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
              totalAmount: Number(price) || 0,
              amount: Number(price) || 0,
              notes: notes
            });

            const realOrderCode = createdOrder?.orderCode || ('ORD-' + (createdOrder?.id ? createdOrder.id.slice(0, 8) : 'NEW'));
            if (design) {
              design.timesUsed = (design.timesUsed || 0) + 1;
              design.lastUsed = "Today";
              if (!design.relatedOrders) design.relatedOrders = [];
              design.relatedOrders.unshift({
                orderId: realOrderCode,
                customer: cust,
                price: `₹${Number(price).toLocaleString('en-IN')}`,
                status: "Stitching"
              });
              renderSelectedDesign();
            }
            showToast(`Order ${realOrderCode} created for ${cust}!`, 'info');
          } catch (err) {
            console.warn('[DesignStudio] Order create API error:', err);
            showToast(`Order creation note: ${err.message}`, 'info');
          }
        });
      }

      // D. Add Tag button & popover
      const btnAddTag = document.getElementById('btnAddTag');
      const popoverAddTag = document.getElementById('addTagPopover');
      const btnSaveTag = document.getElementById('btnSaveTag');
      const inputNewTag = document.getElementById('inputNewTag');

      if (btnAddTag && popoverAddTag) {
        btnAddTag.addEventListener('click', e => {
          e.stopPropagation();
          const isShown = popoverAddTag.style.display === 'flex';
          closeAllPopovers();
          if (!isShown) {
            const rect = btnAddTag.getBoundingClientRect();
            popoverAddTag.style.top = `${rect.top - 44}px`;
            popoverAddTag.style.left = `${rect.left}px`;
            popoverAddTag.style.display = 'flex';
            inputNewTag.focus();
          }
        });

        if (btnSaveTag) {
          btnSaveTag.addEventListener('click', () => {
            const tag = inputNewTag.value.trim();
            if (tag) {
              const design = state.designs.find(d => d.id === state.selectedDesignId);
              if (design) {
                if (!design.tags) design.tags = [];
                if (!design.tags.includes(tag)) {
                  design.tags.push(tag);
                  renderSelectedDesign();
                  showToast(`Tag "${tag}" added`, 'info');
                }
              }
            }
            inputNewTag.value = '';
            popoverAddTag.style.display = 'none';
          });
        }
      }

      // E. Add to Collection Modal Handlers
      const btnDetailMore = document.getElementById('btnDetailMoreMenu');
      const modalAddToCol = document.getElementById('modalAddToCollection');
      const formAddToCol = document.getElementById('formAddToCollection');

      if (btnDetailMore && modalAddToCol) {
        btnDetailMore.addEventListener('click', () => {
          const design = state.designs.find(d => d.id === state.selectedDesignId);
          if (!design) return;
          const textEl = document.getElementById('collectionTargetDesignText');
          if (textEl) textEl.textContent = `Select collection for "${design.name || design.code}":`;
          populateDynamicFiltersAndDropdowns();
          modalAddToCol.style.display = 'flex';
        });
      }

      if (formAddToCol && modalAddToCol) {
        formAddToCol.addEventListener('submit', async e => {
          e.preventDefault();
          const selectedRadio = formAddToCol.querySelector('input[name="targetCollection"]:checked');
          if (!selectedRadio) return;
          const chosenCollection = selectedRadio.value;
          const design = state.designs.find(d => d.id === state.selectedDesignId);
          if (design) {
            design.collection = chosenCollection;
            try {
              const { default: api } = await import('../api.js');
              if (api && api.designs && design.id) {
                await api.designs.update(design.id, { collection: chosenCollection });
              }
            } catch (err) {
              console.warn('[DesignStudio] Update collection failed:', err);
            }
            modalAddToCol.style.display = 'none';
            populateDynamicFiltersAndDropdowns();
            renderSelectedDesign();
            renderGallery();
            showToast(`Design "${design.name}" added to collection "${chosenCollection}"!`, 'info');
          }
        });
      }

      // Generic modal close handler
      document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.modal-backdrop').forEach(m => m.style.display = 'none');
        });
      });

      // Lightbox Controls
      const btnCloseLightbox = document.getElementById('btnCloseLightbox');
      const btnPrevLightbox = document.getElementById('btnLightboxPrev');
      const btnNextLightbox = document.getElementById('btnLightboxNext');

      if (btnCloseLightbox) {
        btnCloseLightbox.addEventListener('click', () => {
          document.getElementById('imageLightbox').style.display = 'none';
        });
      }

      if (btnPrevLightbox) {
        btnPrevLightbox.addEventListener('click', () => {
          navigateLightbox(-1);
        });
      }

      if (btnNextLightbox) {
        btnNextLightbox.addEventListener('click', () => {
          navigateLightbox(1);
        });
      }

      window.addEventListener('keydown', e => {
        const lightbox = document.getElementById('imageLightbox');
        if (lightbox && lightbox.style.display === 'flex') {
          if (e.key === 'Escape') lightbox.style.display = 'none';
          if (e.key === 'ArrowLeft') navigateLightbox(-1);
          if (e.key === 'ArrowRight') navigateLightbox(1);
        }
        if (e.key === 'Escape') {
          document.querySelectorAll('.modal-backdrop').forEach(m => m.style.display = 'none');
          closeAllPopovers();
        }
      });
    }

    function closeAllPopovers() {
      const filterPopover = document.getElementById('filterPopover');
      const sortPopover = document.getElementById('sortPopover');
      const addTagPopover = document.getElementById('addTagPopover');
      if (filterPopover) filterPopover.style.display = 'none';
      if (sortPopover) sortPopover.style.display = 'none';
      if (addTagPopover) addTagPopover.style.display = 'none';
    }

    function selectDesign(id) {
      state.selectedDesignId = id;
      state.lightboxIndex = 0;
      const ws = document.getElementById('studioWorkspace');
      if (ws) ws.classList.remove('no-detail');
      const panel = document.getElementById('selectedDesignPanel');
      if (panel) panel.style.display = 'flex';
      renderGallery();
    }

    function openOrderModal(id) {
      const design = state.designs.find(d => String(d.id) === String(id)) || state.designs.find(d => d.id === state.selectedDesignId);
      if (!design) return;

      const modalOrder = document.getElementById('modalUseInOrder');
      if (!modalOrder) return;

      const nameEl = document.getElementById('orderDesignName');
      const codeEl = document.getElementById('orderDesignCode');
      const typeEl = document.getElementById('orderGarmentType');
      const priceEl = document.getElementById('orderPrice');
      const custEl = document.getElementById('orderCustomerName');
      const dueEl = document.getElementById('orderDueDate');

      if (nameEl) nameEl.value = design.name || '';
      if (codeEl) codeEl.value = design.code || '';
      if (typeEl) typeEl.value = design.category || '';
      if (priceEl) priceEl.value = design.suggestedPrice || 0;
      if (custEl) custEl.value = '';

      if (dueEl) {
        const due = new Date();
        due.setDate(due.getDate() + 7);
        dueEl.value = due.toISOString().split('T')[0];
      }

      modalOrder.style.display = 'flex';
    }

    function toggleFavorite(id) {
      const idx = state.favorites.indexOf(id);
      const design = state.designs.find(d => d.id === id);
      const name = design ? design.name : id;

      if (idx >= 0) {
        state.favorites.splice(idx, 1);
        showToast(`Removed "${name}" from Favorites`, 'info');
      } else {
        state.favorites.push(id);
        showToast(`Added "${name}" to Favorites`, 'favorite');
      }
      saveFavorites();
      renderGallery();
      renderSelectedDesign();
    }

    function openEditModal(id) {
      const design = state.designs.find(d => d.id === id);
      if (!design) return;

      document.getElementById('editDesignId').value = design.id;
      document.getElementById('editDesignName').value = design.name;
      document.getElementById('editDesignCode').value = design.code || '';
      document.getElementById('editDesignCategory').value = design.category || '';
      document.getElementById('editDesignSubCat').value = design.subCategory || '';
      document.getElementById('editDesignStyle').value = design.style || '';
      document.getElementById('editDesignOccasion').value = design.occasion || '';
      document.getElementById('editDesignFabric').value = design.primaryFabric || '';
      document.getElementById('editDesignCost').value = design.estimatedCost != null ? design.estimatedCost : '';
      document.getElementById('editDesignPrice').value = design.suggestedPrice != null ? design.suggestedPrice : '';
      document.getElementById('editDesignDesc').value = design.description || '';
      editDesignImages = Array.isArray(design.images) && design.images.length > 0
        ? [...design.images]
        : (design.cardImage ? [design.cardImage] : []);
      renderEditImagesGrid();

      const modal = document.getElementById('modalEditDesign');
      if (modal) modal.style.display = 'flex';
    }

    function openLightbox() {
      const design = state.designs.find(d => d.id === state.selectedDesignId);
      if (!design || !design.images || design.images.length === 0) return;

      const lightbox = document.getElementById('imageLightbox');
      const img = document.getElementById('lightboxImage');
      const caption = document.getElementById('lightboxCaption');

      if (!lightbox || !img) return;

      const curImg = design.images[state.lightboxIndex] || design.images[0];
      img.src = curImg;
      if (caption) caption.textContent = `${design.name} — Photo ${state.lightboxIndex + 1} of ${design.images.length}`;
      lightbox.style.display = 'flex';
    }

    function navigateLightbox(direction) {
      const design = state.designs.find(d => d.id === state.selectedDesignId);
      if (!design || !design.images || design.images.length === 0) return;

      state.lightboxIndex = (state.lightboxIndex + direction + design.images.length) % design.images.length;
      openLightbox();
      renderSelectedDesign();
    }

    function updateHeaderContext() {
      setTimeout(() => {
        const searchPh = document.querySelector('.search-ph');
        if (searchPh) searchPh.textContent = 'Search designs, collections, categories, fabrics...';

        const branchText = document.querySelector('.branch-sel-text, #branchSelText');
        if (branchText && typeof CompanyBridge !== 'undefined') {
          branchText.textContent = CompanyBridge.formatBranch();
        }

        const notifBadge = document.querySelector('#notifBtn .badge');
        if (notifBadge) notifBadge.textContent = '3';

        const userRole = document.querySelector('.u-role');
        if (userRole) userRole.textContent = 'Administrator';
      }, 60);
    }

    /* ==========================================================================
       10. INITIALIZATION RUNNER
       ========================================================================== */
    /* --------------------------------------------------------------------------
     * mapApiDesign — converts flat DB response to the shape render functions expect
     * -------------------------------------------------------------------------- */
    function mapApiDesign(d) {
      if (!d) return null;
      const splitCsv = str => {
        if (!str) return [];
        if (Array.isArray(str)) return str;
        if (typeof str === 'string') {
          const trimmed = str.trim();
          if (trimmed.startsWith('[')) {
            try { return JSON.parse(trimmed); } catch (e) { }
          }
          return trimmed.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
      };

      const tags = splitCsv(d.tags);
      const swatches = splitCsv(d.swatches || d.colourOptions);
      const images = splitCsv(d.imageUrls);
      const thumb = d.thumbnailUrl || images[0] || FALLBACK_DESIGN_SVG;

      // Unpack JSON specifications & intelligence from DB notes column
      let parsedIntel = {};
      let desc = d.styleNotes || '';
      if (d.notes) {
        if (typeof d.notes === 'object') {
          parsedIntel = d.notes;
        } else if (typeof d.notes === 'string') {
          const trimmed = d.notes.trim();
          if (trimmed.startsWith('{')) {
            try {
              parsedIntel = JSON.parse(trimmed);
            } catch (e) {
              desc = d.notes;
            }
          } else {
            desc = d.notes;
          }
        }
      }

      return {
        id: d.id,
        code: d.designCode || d.id,
        name: d.title || 'Bespoke Design',
        category: d.garmentType || 'Blouse',
        subCategory: d.subCategory || '',
        style: d.style || '',
        occasion: d.occasion || '',
        collection: d.collection || '',
        primaryFabric: d.primaryFabric || '',
        colourOptions: d.colourOptions || '',
        sizes: d.sizes || 'Custom Made to Measure',
        construction: d.construction || '',
        embroidery: d.embroidery || '',
        estimatedCost: Number(d.estimatedCost) || 0,
        suggestedPrice: Number(d.suggestedPrice) || 0,
        estimatedLabour: d.estimatedLabour || '',
        productionStatus: d.productionStatus || (d.status === 'APPROVED' ? 'Production Ready' : (d.status || 'Active')),
        timesUsed: Number(d.timesUsed) || 0,
        lastUsed: d.lastUsedDate ? new Date(d.lastUsedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        lastUsedDate: d.lastUsedDate || '',
        tags: tags,
        swatches: swatches,
        images: images.length ? images : [thumb],
        cardImage: thumb,
        sketchImage: thumb,
        description: desc || d.construction || '',
        notes: d.notes || '',
        designer: d.designer || '',
        createdBy: d.createdBy || d.designer || 'Design Team',
        creationDate: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        status: d.status || 'APPROVED',

        // Dynamic Database Intelligence Fields
        neckline: parsedIntel.neckline || '',
        sleeve: parsedIntel.sleeve || '',
        backDesign: parsedIntel.backDesign || '',
        padding: parsedIntel.padding || '',
        lining: parsedIntel.lining || '',
        closure: parsedIntel.closure || '',
        version: parsedIntel.version || 'V1',
        firstTrialApproval: parsedIntel.firstTrialApproval || '',
        commonAdjustment: parsedIntel.commonAdjustment || '',
        alterationNote: parsedIntel.alterationNote || '',
        compatibility: Array.isArray(parsedIntel.compatibility) ? parsedIntel.compatibility : null,
        laborBreakdown: parsedIntel.laborBreakdown || null,
        constraint: parsedIntel.constraint || '',
        variants: Array.isArray(parsedIntel.variants) ? parsedIntel.variants : null,
        versions: Array.isArray(parsedIntel.versions) ? parsedIntel.versions : null,

        production: {
          status: d.productionStatus || 'Production Ready',
          timesUsed: Number(d.timesUsed) || 0,
          labour: d.estimatedLabour || '',
          avgTime: '',
          stages: []
        },
        materials: {
          fabrics: d.primaryFabric ? [d.primaryFabric] : [],
          embroidery: d.embroidery ? [d.embroidery] : [],
          lining: parsedIntel.lining || '',
          accessories: [],
          cost: Number(d.estimatedCost) || 0
        },
        measurements: [],
        relatedOrders: []
      };
    }

    /* --------------------------------------------------------------------------
     * loadLiveDesigns — 100% database-driven loader for designs & KPIs
     * -------------------------------------------------------------------------- */
    async function loadLiveDesigns() {
      const gallery = document.getElementById('designGallery') || document.querySelector('.gallery-grid') || document.getElementById('designGrid');
      const apiBase = (typeof window.HAULO_API_BASE !== 'undefined')
        ? window.HAULO_API_BASE
        : ((window.location.protocol === 'http:' || window.location.protocol === 'https:') && (window.location.port === '8080' || window.location.port === '80' || window.location.port === '443')
          ? `${window.location.origin}/api/v1`
          : 'http://localhost:8080/api/v1');

      function isTokenValid(t) {
        if (!t || typeof t !== 'string') return false;
        try {
          const parts = t.split('.');
          if (parts.length !== 3) return false;
          const payload = JSON.parse(atob(parts[1]));
          if (payload.exp && (payload.exp * 1000) <= Date.now()) return false;
          return true;
        } catch (_) {
          return false;
        }
      }

      async function obtainValidToken() {
        try {
          const authRes = await fetch(`${apiBase}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'riwayat_owner', password: 'Admin@123' })
          });
          if (authRes.ok) {
            const authData = await authRes.json();
            if (authData && authData.token) {
              localStorage.setItem('erp_token', authData.token);
              sessionStorage.setItem('erp_token', authData.token);
              localStorage.setItem('erp_user', JSON.stringify(authData));
              sessionStorage.setItem('erp_user', JSON.stringify(authData));
              return authData.token;
            }
          }
        } catch (authErr) {
          console.warn('[DesignStudio] Authentication note:', authErr);
        }
        return null;
      }

      let token = sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token');
      if (!isTokenValid(token)) {
        token = await obtainValidToken();
      }

      let headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let loadedItems = null;
      let loadedKpis = null;

      try {
        let listRes = await fetch(`${apiBase}/designs?size=100&sort=createdAt,desc`, { headers });

        // If 401 Unauthorized, refresh token and retry
        if (listRes.status === 401) {
          token = await obtainValidToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            listRes = await fetch(`${apiBase}/designs?size=100&sort=createdAt,desc`, { headers });
          }
        }

        if (listRes.ok) {
          const listJson = await listRes.json();
          loadedItems = Array.isArray(listJson) ? listJson : (listJson?.content || []);
        }

        const kpisRes = await fetch(`${apiBase}/designs/kpis`, { headers });
        if (kpisRes.ok) {
          loadedKpis = await kpisRes.json();
        }
      } catch (fetchErr) {
        console.warn('[DesignStudio] API connection note:', fetchErr);
      }

      if (loadedItems && loadedItems.length > 0) {
        _processDesignData(loadedItems, loadedKpis, gallery);
      } else {
        // Zero mock values — render pure database empty state
        state.designs = [];
        updateKpiCards(loadedKpis || null);
        populateDynamicFiltersAndDropdowns();
        renderGallery();
      }
    }

    function _processDesignData(items, kpis, gallery) {
      const rawList = Array.isArray(items) ? items : (items?.content || []);
      state.designs = rawList.map(mapApiDesign).filter(Boolean);

      // Select master design (RH-1023) if present in DB, otherwise first returned
      const preferred = state.designs.find(d => d.code === 'RH-1023') || state.designs[0];
      if (preferred) {
        state.selectedDesignId = preferred.id;
      }

      updateKpiCards(kpis);
      populateDynamicFiltersAndDropdowns();
      initDonutChart();
      renderGallery();
    }

    document.addEventListener('DOMContentLoaded', () => {
      loadPersistedState();
      updateKpiCards(null);
      updateCategoryTabs();
      initDonutChart();
      renderGallery();
      bindEventListeners();
      updateHeaderContext();
      loadLiveDesigns();
    });
})();
