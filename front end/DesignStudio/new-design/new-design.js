/* ==========================================================================
   HAULO BOUTIQUE ERP — ATELIER STUDIO: NEW DESIGN & VARIANT WORKSPACE
   File: front end/DesignStudio/new-design/new-design.js
   Supports Dual Mode:
     1. Variant Creation (?baseId=...&mode=variant)
     2. New Master Design (?mode=new)
   Pure Database-Driven Architecture:
     - 100% data loaded from backend PostgreSQL via /api/v1/designs
     - Zero seed constants or hardcoded mock arrays
     - Dynamic dropdowns & datalists aggregated from DB records
     - Dynamic palette presets extracted from DB design swatches
     - Next sequence variant code computed against actual DB records
     - Live Design Studio Catalog Card Mirror & Lineage Alteration Diff Matrix
   ========================================================================== */

import api from '../../api.js';

'use strict';

(function () {
  /* ==========================================================================
     1. COMPONENT STATE
     ========================================================================== */
  const state = {
    mode: 'variant', // 'variant' | 'new'
    baseId: null,
    masterDesign: null,
    allDesigns: [],
    variantsOfMaster: [],
    swatches: [],
    mediaList: [],
    primaryMediaIndex: 0,
    readinessScore: 0,
    isSubmitting: false
  };

  /* ==========================================================================
     2. DOM ELEMENT REFERENCES (HYDRATED ON BOOTSTRAP)
     ========================================================================== */
  let dom = {};

  function initDom() {
    dom = {
      // Header & Navigation
      pageHeaderTitle: document.getElementById('pageHeaderTitle'),
      pageHeaderSubtitle: document.getElementById('pageHeaderSubtitle'),
      badgeMode: document.getElementById('badgeMode'),
      bcCurrent: document.getElementById('bcCurrent'),
      workflowStepper: document.getElementById('workflowStepper'),

      // Master Lineage Banner
      masterLineageBanner: document.getElementById('masterLineageBanner'),
      btnChangeMaster: document.getElementById('btnChangeMaster'),
      btnChangeMasterText: document.getElementById('btnChangeMasterText'),
      masterThumbImg: document.getElementById('masterThumbImg'),
      masterCodeLabel: document.getElementById('masterCodeLabel'),
      masterTitleLabel: document.getElementById('masterTitleLabel'),
      masterMetaLabel: document.getElementById('masterMetaLabel'),
      masterStatusDot: document.getElementById('masterStatusDot'),
      masterStatusLabel: document.getElementById('masterStatusLabel'),

      // Master Picker Modal
      modalMasterPicker: document.getElementById('modalMasterPicker'),
      btnCloseMasterPicker: document.getElementById('btnCloseMasterPicker'),
      pickerSearchInput: document.getElementById('pickerSearchInput'),
      pickerDesignsGrid: document.getElementById('pickerDesignsGrid'),

      // Form Sections
      form: document.getElementById('newDesignForm'),

      // Identity & Lineage
      varCode: document.getElementById('varCode'),
      btnRegenCode: document.getElementById('btnRegenCode'),
      varTitle: document.getElementById('varTitle'),
      varCategory: document.getElementById('varCategory'),
      varSubCategory: document.getElementById('varSubCategory'),
      varCollection: document.getElementById('varCollection'),
      varOccasion: document.getElementById('varOccasion'),
      varDesigner: document.getElementById('varDesigner'),
      varSizes: document.getElementById('varSizes'),

      // Silhouette & Blueprint
      varNeckline: document.getElementById('varNeckline'),
      varSleeve: document.getElementById('varSleeve'),
      varBackDesign: document.getElementById('varBackDesign'),
      varPadding: document.getElementById('varPadding'),
      varLining: document.getElementById('varLining'),
      varAlterationNotes: document.getElementById('varAlterationNotes'),
      varConstruction: document.getElementById('varConstruction'),

      // Materials & Palette
      varPrimaryFabric: document.getElementById('varPrimaryFabric'),
      varAccentFabric: document.getElementById('varAccentFabric'),
      activeSwatchesList: document.getElementById('activeSwatchesList'),
      swatchCountHint: document.getElementById('swatchCountHint'),
      quickPresetsList: document.getElementById('quickPresetsList'),
      customColorPicker: document.getElementById('customColorPicker'),
      customColorHex: document.getElementById('customColorHex'),
      btnAddColor: document.getElementById('btnAddColor'),
      varEmbroidery: document.getElementById('varEmbroidery'),
      varComplexity: document.getElementById('varComplexity'),

      // Costing & Commercial
      varCostMaterial: document.getElementById('varCostMaterial'),
      varCostLabour: document.getElementById('varCostLabour'),
      varLabourHours: document.getElementById('varLabourHours'),
      varTotalCost: document.getElementById('varTotalCost'),
      varSuggestedPrice: document.getElementById('varSuggestedPrice'),
      marginVal: document.getElementById('marginVal'),
      marginStatusTag: document.getElementById('marginStatusTag'),
      varTurnaround: document.getElementById('varTurnaround'),
      varProductionStatus: document.getElementById('varProductionStatus'),
      varTags: document.getElementById('varTags'),

      // Media
      mediaDropzone: document.getElementById('mediaDropzone'),
      mediaFileInput: document.getElementById('mediaFileInput'),
      btnBrowseFiles: document.getElementById('btnBrowseFiles'),
      inputDirectImageUrl: document.getElementById('inputDirectImageUrl'),
      btnAddImageUrl: document.getElementById('btnAddImageUrl'),
      mediaReelGrid: document.getElementById('mediaReelGrid'),
      reelCount: document.getElementById('reelCount'),

      // Right Column: Live Card Mirror
      liveDesignCard: document.getElementById('liveDesignCard'),
      liveCardImg: document.getElementById('liveCardImg'),
      liveCardPlaceholder: document.getElementById('liveCardPlaceholder'),
      liveCardCode: document.getElementById('liveCardCode'),
      liveCardTitle: document.getElementById('liveCardTitle'),
      liveCardCollection: document.getElementById('liveCardCollection'),
      liveCardStatusDot: document.getElementById('liveCardStatusDot'),
      liveCardStatusText: document.getElementById('liveCardStatusText'),
      liveCardPrice: document.getElementById('liveCardPrice'),

      // Right Column: Lineage Diff Card
      lineageDiffCard: document.getElementById('lineageDiffCard'),
      diffBaseCode: document.getElementById('diffBaseCode'),
      diffVarCode: document.getElementById('diffVarCode'),
      diffBaseNeck: document.getElementById('diffBaseNeck'),
      diffVarNeck: document.getElementById('diffVarNeck'),
      diffBaseFabric: document.getElementById('diffBaseFabric'),
      diffVarFabric: document.getElementById('diffVarFabric'),
      diffBaseSleeve: document.getElementById('diffBaseSleeve'),
      diffVarSleeve: document.getElementById('diffVarSleeve'),
      diffBasePrice: document.getElementById('diffBasePrice'),
      diffVarPrice: document.getElementById('diffVarPrice'),

      // Right Column: Readiness
      readinessScoreVal: document.getElementById('readinessScoreVal'),
      readinessFill: document.getElementById('readinessFill'),
      chkIdentity: document.getElementById('chkIdentity'),
      chkBlueprint: document.getElementById('chkBlueprint'),
      chkFabric: document.getElementById('chkFabric'),
      chkCosting: document.getElementById('chkCosting'),
      chkMedia: document.getElementById('chkMedia'),

      // Action Buttons
      btnStickyPublish: document.getElementById('btnStickyPublish'),
      btnPublishText: document.getElementById('btnPublishText'),
      btnStickyDraft: document.getElementById('btnStickyDraft'),
      btnBottomSubmit: document.getElementById('btnBottomSubmit'),
      btnBottomDraft: document.getElementById('btnBottomDraft'),

      // Toast Container
      toastContainer: document.getElementById('toastContainer'),

      // Datalists
      collectionDatalist: document.getElementById('collectionDatalist'),
      fabricDatalist: document.getElementById('fabricDatalist'),
      necklineDatalist: document.getElementById('necklineDatalist'),
      sleeveDatalist: document.getElementById('sleeveDatalist'),
      backDatalist: document.getElementById('backDatalist'),
      liningDatalist: document.getElementById('liningDatalist'),
      occasionDatalist: document.getElementById('occasionDatalist'),
      embroideryDatalist: document.getElementById('embroideryDatalist')
    };
  }

  /* ==========================================================================
     3. UTILITIES & TOAST NOTIFICATION
     ========================================================================== */
  function showToast(message, type = 'success') {
    if (!dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'glass-toast';

    let iconName = 'check-circle';
    let iconColor = 'var(--accent-lime)';
    if (type === 'error') {
      iconName = 'alert-triangle';
      iconColor = '#ef4444';
    } else if (type === 'info') {
      iconName = 'info';
      iconColor = 'var(--accent-warm)';
    }

    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width:16px;height:16px;color:${iconColor};flex-shrink:0;"></i>
      <span>${message}</span>
    `;
    dom.toastContainer.appendChild(toast);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: toast });
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function formatCurrency(val) {
    const num = Number(val) || 0;
    return '₹' + num.toLocaleString('en-IN');
  }

  /* ==========================================================================
     4. DATABASE ENTITY MAPPER (Pure DB to Atelier Model)
     ========================================================================== */
  function mapDbDesign(item) {
    if (!item) return null;
    let parsedNotes = {};
    if (item.notes && typeof item.notes === 'string' && item.notes.trim().startsWith('{')) {
      try { parsedNotes = JSON.parse(item.notes); } catch (_) {}
    }

    const primaryFabric = item.primaryFabric || parsedNotes.primaryFabric || '';
    const accentFabric = parsedNotes.accentFabric || '';
    const neckline = item.neckline || parsedNotes.neckline || '';
    const sleeve = item.sleeveStyle || item.sleeve || parsedNotes.sleeve || '';
    const backDesign = item.backDesign || parsedNotes.backDesign || '';
    const padding = item.padding || parsedNotes.padding || 'Medium';
    const lining = item.lining || parsedNotes.lining || '';
    const embroidery = item.embroidery || item.embroideryDetails || parsedNotes.embroidery || '';
    const complexity = item.complexity || parsedNotes.complexity || 'High';
    const labourHours = item.estimatedLabour || parsedNotes.labourHours || '';
    const turnaroundDays = item.turnaroundDays || parsedNotes.turnaroundDays || 12;

    let images = [];
    if (item.imageUrls) {
      images = item.imageUrls.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (images.length === 0 && item.thumbnailUrl) {
      images = [item.thumbnailUrl];
    }

    return {
      id: item.id,
      code: item.designCode || item.code || '',
      name: item.title || item.name || '',
      title: item.title || item.name || '',
      category: item.garmentType || item.category || 'Blouse',
      subCategory: item.subCategory || parsedNotes.subCategory || '',
      collection: item.collection || '',
      occasion: item.occasion || '',
      designer: item.designer || '',
      sizes: item.sizes || '',
      suggestedPrice: Number(item.suggestedPrice) || 0,
      estimatedCost: Number(item.estimatedCost) || 0,
      cardImage: item.thumbnailUrl || images[0] || '',
      heroImage: item.thumbnailUrl || images[0] || '',
      images: images,
      primaryFabric: primaryFabric,
      accentFabric: accentFabric,
      neckline: neckline,
      sleeve: sleeve,
      backDesign: backDesign,
      padding: padding,
      lining: lining,
      construction: item.construction || '',
      embroidery: embroidery,
      complexity: complexity,
      labourHours: labourHours,
      turnaroundDays: turnaroundDays,
      tags: item.tags || parsedNotes.tags || '',
      swatches: item.swatches || item.colourOptions || '',
      productionStatus: item.productionStatus || 'Active',
      readiness: item.readinessScore || 0,
      isVariant: !!item.isVariant,
      parentDesignId: item.parentDesignId,
      parentDesignCode: item.parentDesignCode
    };
  }

  /* ==========================================================================
     5. DYNAMIC DROPDOWNS, DATALISTS & PALETTES FROM DB
     ========================================================================== */
  function populateDynamicCatalogLists() {
    if (!state.allDesigns || state.allDesigns.length === 0) return;

    // 1. Garment Categories for <select id="varCategory">
    if (dom.varCategory) {
      const currentSelected = dom.varCategory.value;
      const categories = [...new Set(state.allDesigns.map(d => d.category).filter(Boolean))];
      if (categories.length > 0) {
        dom.varCategory.innerHTML = '<option value="" disabled>Select garment category...</option>' +
          categories.map(c => `<option value="${c}">${c}</option>`).join('');
        if (currentSelected && categories.includes(currentSelected)) {
          dom.varCategory.value = currentSelected;
        } else if (categories.length > 0) {
          dom.varCategory.value = categories[0];
        }
      }
    }

    // Helper to populate <datalist> with unique DB values
    function populateDatalist(datalistEl, values) {
      if (!datalistEl) return;
      const unique = [...new Set(values.map(v => (v || '').trim()).filter(Boolean))];
      datalistEl.innerHTML = unique.map(v => `<option value="${v}"></option>`).join('');
    }

    populateDatalist(dom.collectionDatalist, state.allDesigns.map(d => d.collection));
    populateDatalist(dom.fabricDatalist, state.allDesigns.map(d => d.primaryFabric));
    populateDatalist(dom.necklineDatalist, state.allDesigns.map(d => d.neckline));
    populateDatalist(dom.sleeveDatalist, state.allDesigns.map(d => d.sleeve));
    populateDatalist(dom.backDatalist, state.allDesigns.map(d => d.backDesign));
    populateDatalist(dom.liningDatalist, state.allDesigns.map(d => d.lining));
    populateDatalist(dom.occasionDatalist, state.allDesigns.map(d => d.occasion));
    populateDatalist(dom.embroideryDatalist, state.allDesigns.map(d => d.embroidery));

    // Dynamic Atelier Palette Presets from DB swatches
    if (dom.quickPresetsList) {
      const allHexes = new Set();
      state.allDesigns.forEach(d => {
        if (!d.swatches) return;
        const tokens = d.swatches.split(/[,;\s]+/);
        tokens.forEach(tok => {
          const t = tok.trim().toUpperCase();
          if (/^#[0-9A-F]{3,8}$/.test(t)) {
            allHexes.add(t);
          }
        });
      });

      const hexArray = Array.from(allHexes);
      if (hexArray.length > 0) {
        dom.quickPresetsList.innerHTML = `
          <span class="preset-label">Atelier Palette:</span>
          ${hexArray.slice(0, 12).map(hex => `
            <button type="button" class="preset-btn" data-color="${hex}" style="background:${hex};" title="Add ${hex}"></button>
          `).join('')}
        `;

        // Bind preset click events
        dom.quickPresetsList.querySelectorAll('.preset-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            addSwatch(color);
          });
        });
      } else {
        dom.quickPresetsList.innerHTML = '';
      }
    }
  }

  /* ==========================================================================
     6. CODE GENERATION LOGIC (DATABASE-DRIVEN SEQUENCING)
     ========================================================================== */
  function generateNextVariantCode(master) {
    if (!master || !master.code) return 'RH-1001-V1';
    const baseCode = master.code.replace(/-V\d+$/i, '').trim();

    // Check all existing DB designs and variants for highest variant suffix
    let maxSuffix = 0;
    const allPool = [...state.allDesigns, ...state.variantsOfMaster];

    allPool.forEach(d => {
      if (!d) return;
      const c = String(d.code || d.designCode || '').toUpperCase().trim();
      const regex = new RegExp(`^${baseCode}-V(\\d+)$`, 'i');
      const match = c.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSuffix) maxSuffix = num;
      }
    });

    return `${baseCode}-V${maxSuffix + 1}`;
  }

  function generateNextMasterCode() {
    let maxSeq = 1000;
    state.allDesigns.forEach(d => {
      if (!d) return;
      const c = String(d.code || d.designCode || '').toUpperCase().trim();
      const m = c.match(/^RH-(\d+)$/i);
      if (m) {
        const num = parseInt(m[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    });
    return `RH-${maxSeq + 1}`;
  }

  /* ==========================================================================
     7. PRE-POPULATION & MODE CONFIGURATION
     ========================================================================== */
  function applyMode(mode, master) {
    state.mode = mode;
    state.masterDesign = master;

    if (mode === 'variant') {
      if (dom.pageHeaderTitle) dom.pageHeaderTitle.textContent = 'Create Design Variant';
      if (dom.pageHeaderSubtitle) dom.pageHeaderSubtitle.textContent = 'Derive a new bespoke design variant from an atelier master piece with custom silhouette, materials, and pricing.';
      if (dom.badgeMode) {
        dom.badgeMode.textContent = 'Variant Mode';
        dom.badgeMode.className = 'badge-mode-pill';
      }
      if (dom.bcCurrent) dom.bcCurrent.textContent = 'New Variant';
      if (dom.btnPublishText) dom.btnPublishText.textContent = 'Publish Variant';
      if (dom.btnBottomSubmit?.querySelector('span')) dom.btnBottomSubmit.querySelector('span').textContent = 'Publish Variant';

      // Show Lineage elements
      if (dom.masterLineageBanner) dom.masterLineageBanner.style.display = 'flex';
      if (dom.lineageDiffCard) dom.lineageDiffCard.style.display = 'block';

      if (master) {
        // Prepopulate Master Banner from DB
        if (dom.masterCodeLabel) dom.masterCodeLabel.textContent = master.code || '—';
        if (dom.masterTitleLabel) dom.masterTitleLabel.textContent = master.name || 'Master Design';
        if (dom.masterMetaLabel) {
          const parts = [master.collection, master.category, formatCurrency(master.suggestedPrice)].filter(Boolean);
          dom.masterMetaLabel.textContent = parts.join(' • ') || '—';
        }
        if (dom.masterThumbImg && (master.cardImage || master.heroImage)) {
          dom.masterThumbImg.src = master.cardImage || master.heroImage;
        }
        if (dom.masterStatusLabel) dom.masterStatusLabel.textContent = master.productionStatus || 'Active';
        if (dom.masterStatusDot) dom.masterStatusDot.style.display = 'inline-block';

        // Prepopulate Variant Identity from DB Master
        const nextCode = generateNextVariantCode(master);
        if (dom.varCode) dom.varCode.value = nextCode;
        if (dom.varTitle) dom.varTitle.value = master.name ? `${master.name} (Variant)` : '';
        if (dom.varCategory && master.category) dom.varCategory.value = master.category;
        if (dom.varSubCategory) dom.varSubCategory.value = master.subCategory || '';
        if (dom.varCollection) dom.varCollection.value = master.collection || '';
        if (dom.varOccasion) dom.varOccasion.value = master.occasion || '';
        if (dom.varDesigner) dom.varDesigner.value = master.designer || '';
        if (dom.varSizes) dom.varSizes.value = master.sizes || '';

        // Prepopulate Silhouette from DB Master
        if (dom.varNeckline) dom.varNeckline.value = master.neckline || '';
        if (dom.varSleeve) dom.varSleeve.value = master.sleeve || '';
        if (dom.varBackDesign) dom.varBackDesign.value = master.backDesign || '';
        if (dom.varPadding) dom.varPadding.value = master.padding || 'Medium';
        if (dom.varLining) dom.varLining.value = master.lining || '';
        if (dom.varAlterationNotes) {
          dom.varAlterationNotes.value = master.code ? `Derived from ${master.code} with bespoke alterations.` : '';
        }
        if (dom.varConstruction) dom.varConstruction.value = master.construction || '';

        // Prepopulate Materials from DB Master
        if (dom.varPrimaryFabric) dom.varPrimaryFabric.value = master.primaryFabric || '';
        if (dom.varAccentFabric) dom.varAccentFabric.value = master.accentFabric || '';
        if (dom.varEmbroidery) dom.varEmbroidery.value = master.embroidery || '';
        if (dom.varComplexity) dom.varComplexity.value = master.complexity || 'High';

        // Prepopulate Costing from DB Master
        const baseCost = master.estimatedCost || 0;
        if (baseCost > 0) {
          if (dom.varCostMaterial) dom.varCostMaterial.value = Math.round(baseCost * 0.6);
          if (dom.varCostLabour) dom.varCostLabour.value = Math.round(baseCost * 0.4);
        } else {
          if (dom.varCostMaterial) dom.varCostMaterial.value = '';
          if (dom.varCostLabour) dom.varCostLabour.value = '';
        }
        if (dom.varLabourHours) dom.varLabourHours.value = master.labourHours || '';
        if (dom.varSuggestedPrice) dom.varSuggestedPrice.value = master.suggestedPrice || '';
        if (dom.varTurnaround) dom.varTurnaround.value = master.turnaroundDays || '';

        // Prepopulate Lineage Diff Master Column
        if (dom.diffBaseCode) dom.diffBaseCode.textContent = master.code || '—';
        if (dom.diffBaseNeck) dom.diffBaseNeck.textContent = master.neckline || '—';
        if (dom.diffBaseFabric) dom.diffBaseFabric.textContent = master.primaryFabric || '—';
        if (dom.diffBaseSleeve) dom.diffBaseSleeve.textContent = master.sleeve || '—';
        if (dom.diffBasePrice) dom.diffBasePrice.textContent = master.suggestedPrice ? formatCurrency(master.suggestedPrice) : '—';

        // Parse Master Swatches from DB
        state.swatches = [];
        if (master.swatches) {
          const swList = master.swatches.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
          swList.forEach(c => {
            if (/^#[0-9A-F]{3,8}$/i.test(c)) {
              state.swatches.push({ color: c.toUpperCase(), name: c.toUpperCase() });
            }
          });
        }

        // Garment media starts empty; appears only when user uploads an image
        state.mediaList = [];
        state.primaryMediaIndex = 0;
      }
    } else {
      // New Master Design Mode (100% clean blank form)
      if (dom.pageHeaderTitle) dom.pageHeaderTitle.textContent = 'New Master Design';
      if (dom.pageHeaderSubtitle) dom.pageHeaderSubtitle.textContent = 'Architect a brand new atelier master design piece into the haute couture catalog.';
      if (dom.badgeMode) {
        dom.badgeMode.textContent = 'Master Design Mode';
        dom.badgeMode.className = 'badge-mode-pill mode-master';
      }
      if (dom.bcCurrent) dom.bcCurrent.textContent = 'New Master Design';
      if (dom.btnPublishText) dom.btnPublishText.textContent = 'Publish Master Design';
      if (dom.btnBottomSubmit?.querySelector('span')) dom.btnBottomSubmit.querySelector('span').textContent = 'Publish Master Design';

      // Hide Master Lineage Banner & Diff Table
      if (dom.masterLineageBanner) dom.masterLineageBanner.style.display = 'none';
      if (dom.lineageDiffCard) dom.lineageDiffCard.style.display = 'none';

      // Generate next Master Code from DB sequence
      if (dom.varCode) dom.varCode.value = generateNextMasterCode();
      if (dom.varTitle) dom.varTitle.value = '';
      if (dom.varSubCategory) dom.varSubCategory.value = '';
      if (dom.varCollection) dom.varCollection.value = '';
      if (dom.varOccasion) dom.varOccasion.value = '';
      if (dom.varDesigner) dom.varDesigner.value = '';
      if (dom.varSizes) dom.varSizes.value = '';
      if (dom.varNeckline) dom.varNeckline.value = '';
      if (dom.varSleeve) dom.varSleeve.value = '';
      if (dom.varBackDesign) dom.varBackDesign.value = '';
      if (dom.varPadding) dom.varPadding.value = 'Medium';
      if (dom.varLining) dom.varLining.value = '';
      if (dom.varAlterationNotes) dom.varAlterationNotes.value = '';
      if (dom.varConstruction) dom.varConstruction.value = '';
      if (dom.varPrimaryFabric) dom.varPrimaryFabric.value = '';
      if (dom.varAccentFabric) dom.varAccentFabric.value = '';
      if (dom.varEmbroidery) dom.varEmbroidery.value = '';
      if (dom.varComplexity) dom.varComplexity.value = 'High';
      if (dom.varCostMaterial) dom.varCostMaterial.value = '';
      if (dom.varCostLabour) dom.varCostLabour.value = '';
      if (dom.varLabourHours) dom.varLabourHours.value = '';
      if (dom.varSuggestedPrice) dom.varSuggestedPrice.value = '';
      if (dom.varTurnaround) dom.varTurnaround.value = '';

      state.swatches = [];
      state.mediaList = [];
      state.primaryMediaIndex = 0;
    }

    renderSwatches();
    renderMediaReel();
    updateCostingAndMargin();
    updateLivePreview();
    updateProductionReadiness();
  }

  /* ==========================================================================
     8. SWATCHES MANAGER
     ========================================================================== */
  function renderSwatches() {
    if (!dom.activeSwatchesList) return;
    dom.activeSwatchesList.innerHTML = state.swatches.map((swatch, idx) => `
      <div class="swatch-chip" data-idx="${idx}">
        <span class="swatch-color-circle" style="background:${swatch.color};"></span>
        <span class="swatch-name">${swatch.name || swatch.color}</span>
        <button type="button" class="swatch-remove-btn" data-action="remove-swatch" data-idx="${idx}" title="Remove colorway">&times;</button>
      </div>
    `).join('');

    if (dom.swatchCountHint) {
      dom.swatchCountHint.textContent = `${state.swatches.length} colorway swatch${state.swatches.length === 1 ? '' : 'es'} added`;
    }
  }

  function addSwatch(color, name) {
    if (!color) return;
    let hex = color.trim().toUpperCase();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (!/^#[0-9A-F]{3,8}$/.test(hex)) {
      showToast('Please enter a valid Hex code (e.g. #C59B27)', 'info');
      return;
    }
    if (state.swatches.some(s => s.color.toUpperCase() === hex)) {
      showToast('Swatch color already added', 'info');
      return;
    }
    state.swatches.push({ color: hex, name: name || hex });
    renderSwatches();
    updateProductionReadiness();
  }

  function removeSwatch(index) {
    if (index >= 0 && index < state.swatches.length) {
      state.swatches.splice(index, 1);
      renderSwatches();
      updateProductionReadiness();
    }
  }

  /* ==========================================================================
     9. MEDIA MANAGEMENT & REEL
     ========================================================================== */
  function renderMediaReel() {
    if (!dom.mediaReelGrid) return;
    if (dom.reelCount) dom.reelCount.textContent = state.mediaList.length;

    dom.mediaReelGrid.innerHTML = state.mediaList.map((imgUrl, idx) => {
      const isPrimary = idx === state.primaryMediaIndex;
      return `
        <div class="media-thumb-card ${isPrimary ? 'is-hero' : ''}" data-idx="${idx}">
          <img src="${imgUrl}" alt="Garment Photo ${idx + 1}" />
          <span class="media-badge-hero">${isPrimary ? 'Hero' : ''}</span>
          <div class="media-thumb-actions">
            ${!isPrimary ? `<button type="button" class="btn-media-action" data-action="set-hero" data-idx="${idx}" title="Set as primary hero photo"><i data-lucide="star" style="width:11px;height:11px;"></i></button>` : ''}
            <button type="button" class="btn-media-action btn-media-remove" data-action="remove-media" data-idx="${idx}" title="Remove photo">&times;</button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: dom.mediaReelGrid });
    }

    // Sync Live Mirror Image: Only appears when user uploads an image
    const currentHero = state.mediaList[state.primaryMediaIndex];
    if (dom.liveCardImg && dom.liveCardPlaceholder) {
      if (currentHero) {
        dom.liveCardImg.src = currentHero;
        dom.liveCardImg.style.display = 'block';
        dom.liveCardPlaceholder.style.display = 'none';
      } else {
        dom.liveCardImg.src = '';
        dom.liveCardImg.style.display = 'none';
        dom.liveCardPlaceholder.style.display = 'flex';
      }
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function' && dom.liveDesignCard) {
      window.lucide.createIcons({ root: dom.liveDesignCard });
    }
  }

  function handleUploadedFiles(files) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      if (!file.type || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        state.mediaList.push(e.target.result);
        renderMediaReel();
        updateProductionReadiness();
      };
      reader.readAsDataURL(file);
    });
    showToast(`Added ${files.length} design photo${files.length === 1 ? '' : 's'}`);
  }

  /* ==========================================================================
     10. COMMERCIAL COSTING & GROSS MARGIN ENGINE
     ========================================================================== */
  function updateCostingAndMargin() {
    const matCost = parseFloat(dom.varCostMaterial.value) || 0;
    const labCost = parseFloat(dom.varCostLabour.value) || 0;
    const totalCost = matCost + labCost;
    const price = parseFloat(dom.varSuggestedPrice.value) || 0;

    dom.varTotalCost.value = totalCost > 0 ? totalCost : '';

    if (price > 0 && totalCost > 0) {
      const marginPct = ((price - totalCost) / price) * 100;
      const rounded = marginPct.toFixed(1);
      dom.marginVal.textContent = `${rounded}% Margin`;

      if (marginPct >= 55) {
        dom.marginStatusTag.textContent = 'Healthy';
        dom.marginStatusTag.className = 'margin-status-tag tag-healthy';
      } else if (marginPct >= 40) {
        dom.marginStatusTag.textContent = 'Moderate';
        dom.marginStatusTag.className = 'margin-status-tag tag-moderate';
      } else {
        dom.marginStatusTag.textContent = 'Tight';
        dom.marginStatusTag.className = 'margin-status-tag tag-tight';
      }
    } else {
      dom.marginVal.textContent = '—';
      dom.marginStatusTag.textContent = price > 0 ? 'Enter Costs' : 'Enter Price';
      dom.marginStatusTag.className = 'margin-status-tag tag-moderate';
    }

    if (dom.diffVarPrice) {
      dom.diffVarPrice.textContent = price > 0 ? formatCurrency(price) : '—';
    }
    if (dom.liveCardPrice) {
      dom.liveCardPrice.textContent = price > 0 ? formatCurrency(price) : '₹0';
    }

    updateProductionReadiness();
  }

  /* ==========================================================================
     11. LIVE MIRROR & DIFF MATRIX REAL-TIME SYNC
     ========================================================================== */
  function updateLivePreview() {
    const code = dom.varCode.value.trim() || '—';
    const title = dom.varTitle.value.trim() || '—';
    const collection = dom.varCollection.value.trim() || '—';
    const status = dom.varProductionStatus.value;

    // Card Mirror Sync
    if (dom.liveCardCode) dom.liveCardCode.textContent = code;
    if (dom.liveCardTitle) dom.liveCardTitle.textContent = title;
    if (dom.liveCardCollection) dom.liveCardCollection.textContent = collection;
    if (dom.liveCardStatusText) dom.liveCardStatusText.textContent = status;

    if (dom.liveCardStatusDot) {
      dom.liveCardStatusDot.style.display = 'inline-block';
      if (status === 'Active') {
        dom.liveCardStatusDot.className = 'kpi-dot dot-green';
      } else if (status === 'In Development') {
        dom.liveCardStatusDot.className = 'kpi-dot dot-purple';
      } else {
        dom.liveCardStatusDot.className = 'kpi-dot dot-orange';
      }
    }

    // Lineage Diff Matrix Sync
    if (dom.diffVarCode) dom.diffVarCode.textContent = code;
    if (dom.diffVarNeck) dom.diffVarNeck.textContent = dom.varNeckline.value.trim() || '—';
    if (dom.diffVarFabric) dom.diffVarFabric.textContent = dom.varPrimaryFabric.value.trim() || '—';
    if (dom.diffVarSleeve) dom.diffVarSleeve.textContent = dom.varSleeve.value.trim() || '—';

    updateProductionReadiness();
  }

  /* ==========================================================================
     12. PRODUCTION READINESS GAUGE
     ========================================================================== */
  function updateProductionReadiness() {
    let score = 0;

    // 1. Identity & Codes
    const hasIdentity = !!(dom.varCode.value.trim() && dom.varTitle.value.trim() && dom.varCategory.value);
    if (hasIdentity) score += 20;
    if (dom.chkIdentity) dom.chkIdentity.classList.toggle('active', hasIdentity);

    // 2. Blueprint & Silhouette
    const hasBlueprint = !!(dom.varNeckline.value.trim() && dom.varSleeve.value.trim() && dom.varBackDesign.value.trim());
    if (hasBlueprint) score += 20;
    if (dom.chkBlueprint) dom.chkBlueprint.classList.toggle('active', hasBlueprint);

    // 3. Fabrics & Palette
    const hasFabric = !!(dom.varPrimaryFabric.value.trim() && state.swatches.length > 0);
    if (hasFabric) score += 20;
    if (dom.chkFabric) dom.chkFabric.classList.toggle('active', hasFabric);

    // 4. Costing & Pricing
    const totalCost = parseFloat(dom.varTotalCost.value) || 0;
    const price = parseFloat(dom.varSuggestedPrice.value) || 0;
    const hasCosting = !!(price > 0 && totalCost > 0);
    if (hasCosting) score += 20;
    if (dom.chkCosting) dom.chkCosting.classList.toggle('active', hasCosting);

    // 5. Media
    const hasMedia = state.mediaList.length > 0;
    if (hasMedia) score += 20;
    if (dom.chkMedia) dom.chkMedia.classList.toggle('active', hasMedia);

    state.readinessScore = score;
    if (dom.readinessScoreVal) dom.readinessScoreVal.textContent = `${score}%`;
    if (dom.readinessFill) dom.readinessFill.style.width = `${score}%`;
  }

  /* ==========================================================================
     13. MASTER SELECTION MODAL PICKER (PURE DB DESIGNS)
     ========================================================================== */
  function openMasterPicker() {
    if (!dom.modalMasterPicker) return;
    renderMasterPickerGrid('');
    if (dom.pickerSearchInput) {
      dom.pickerSearchInput.value = '';
      dom.pickerSearchInput.focus();
    }
    dom.modalMasterPicker.style.display = 'flex';
  }

  function closeMasterPicker() {
    if (dom.modalMasterPicker) dom.modalMasterPicker.style.display = 'none';
  }

  function renderMasterPickerGrid(query) {
    if (!dom.pickerDesignsGrid) return;
    const q = (query || '').toLowerCase().trim();

    const filtered = state.allDesigns.filter(d => {
      if (!d) return false;
      const code = (d.code || '').toLowerCase();
      const name = (d.name || d.title || '').toLowerCase();
      const col = (d.collection || '').toLowerCase();
      const cat = (d.category || '').toLowerCase();
      const fab = (d.primaryFabric || '').toLowerCase();
      return !q || code.includes(q) || name.includes(q) || col.includes(q) || cat.includes(q) || fab.includes(q);
    });

    if (filtered.length === 0) {
      dom.pickerDesignsGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">
          No master designs found matching "${query}".
        </div>
      `;
      return;
    }

    dom.pickerDesignsGrid.innerHTML = filtered.map(d => {
      const isSelected = state.masterDesign && state.masterDesign.code === d.code;
      const thumb = d.cardImage || d.heroImage || '';
      return `
        <div class="picker-card ${isSelected ? 'selected' : ''}" data-code="${d.code}">
          <div class="picker-card-thumb">
            ${thumb ? `<img src="${thumb}" alt="${d.name || d.code}" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);color:#888;"><i data-lucide="image" style="width:24px;height:24px;"></i></div>`}
          </div>
          <div class="picker-card-body">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span class="picker-card-code">${d.code}</span>
              <span class="picker-card-price">${formatCurrency(d.suggestedPrice)}</span>
            </div>
            <h4 class="picker-card-title">${d.name || d.title || 'Master Design'}</h4>
            <div class="picker-card-meta">${d.collection || 'Collection'} • ${d.category || 'Garment'}</div>
            <button type="button" class="btn-picker-select ${isSelected ? 'is-active' : ''}" data-action="choose-master" data-code="${d.code}">
              ${isSelected ? 'Currently Selected' : 'Select as Base Master'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: dom.pickerDesignsGrid });
    }
  }

  async function selectMasterDesignByCode(code) {
    const found = state.allDesigns.find(d => String(d.code).toUpperCase() === String(code).toUpperCase())
      || state.allDesigns.find(d => String(d.id) === String(code));

    if (found) {
      // Query DB for variants of this master to generate accurate next sequence
      try {
        if (api && api.designs && typeof api.designs.variants === 'function') {
          const varRes = await api.designs.variants(found.id || found.code);
          state.variantsOfMaster = Array.isArray(varRes) ? varRes : (varRes?.content || []);
        }
      } catch (_) {
        state.variantsOfMaster = [];
      }

      applyMode('variant', found);
      closeMasterPicker();
      showToast(`Selected ${found.code} — ${found.name} as Base Master`);
    }
  }

  /* ==========================================================================
     14. WORKFLOW STEPPER INTERACTIVITY
     ========================================================================== */
  function initStepper() {
    if (!dom.workflowStepper) return;
    const stepNodes = dom.workflowStepper.querySelectorAll('.step-node');
    const sections = [
      document.getElementById('cardIdentity'),
      document.getElementById('cardSilhouette'),
      document.getElementById('cardPalette'),
      document.getElementById('cardCosting'),
      document.getElementById('cardMedia')
    ];

    stepNodes.forEach((node, idx) => {
      node.addEventListener('click', () => {
        const target = sections[idx];
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        stepNodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');
      });
    });

    const scrollContainer = document.getElementById('newDesignScroll');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', () => {
        const top = scrollContainer.scrollTop + 140;
        sections.forEach((sec, idx) => {
          if (!sec) return;
          const secTop = sec.offsetTop;
          const secHeight = sec.offsetHeight;
          if (top >= secTop && top < secTop + secHeight) {
            stepNodes.forEach(n => n.classList.remove('active'));
            if (stepNodes[idx]) stepNodes[idx].classList.add('active');
          }
        });
      }, { passive: true });
    }
  }

  /* ==========================================================================
     15. FORM SUBMISSION & BACKEND API DISPATCH (100% DB PERSISTENCE)
     ========================================================================== */
  async function handleSubmit(isDraft = false) {
    if (state.isSubmitting) return;

    // Validate Required Inputs
    const code = dom.varCode.value.trim();
    const title = dom.varTitle.value.trim();
    const category = dom.varCategory.value;
    const neckline = dom.varNeckline.value.trim();
    const primaryFabric = dom.varPrimaryFabric.value.trim();
    const price = parseFloat(dom.varSuggestedPrice.value) || 0;

    if (!code) {
      showToast('Variant Code is required', 'error');
      dom.varCode.focus();
      return;
    }
    if (!title) {
      showToast('Design Title / Name is required', 'error');
      dom.varTitle.focus();
      return;
    }
    if (!neckline && !isDraft) {
      showToast('Neckline Cut is required', 'error');
      dom.varNeckline.focus();
      return;
    }
    if (!primaryFabric && !isDraft) {
      showToast('Primary Fabric is required', 'error');
      dom.varPrimaryFabric.focus();
      return;
    }
    if (price <= 0 && !isDraft) {
      showToast('Suggested Retail Price must be greater than zero', 'error');
      dom.varSuggestedPrice.focus();
      return;
    }

    state.isSubmitting = true;
    if (dom.btnStickyPublish) dom.btnStickyPublish.disabled = true;
    if (dom.btnBottomSubmit) dom.btnBottomSubmit.disabled = true;

    showToast(isDraft ? 'Saving draft to database...' : 'Publishing design to database...', 'info');

    const heroImage = state.mediaList[state.primaryMediaIndex] || '';
    const allImagesStr = state.mediaList.join(',');
    const swatchesStr = state.swatches.map(s => s.color).join(',');
    const isVariantMode = state.mode === 'variant';

    const payload = {
      designCode: code,
      title: title,
      garmentType: category,
      subCategory: dom.varSubCategory.value.trim(),
      collection: dom.varCollection.value.trim(),
      occasion: dom.varOccasion.value.trim(),
      designer: dom.varDesigner.value.trim() || 'Atelier Design Team',
      sizes: dom.varSizes.value.trim(),

      // Blueprint specs (columns in DB)
      neckline: neckline,
      sleeveStyle: dom.varSleeve.value.trim(),
      backDesign: dom.varBackDesign.value.trim(),
      padding: dom.varPadding.value,
      lining: dom.varLining.value.trim(),
      variantAlterationNotes: dom.varAlterationNotes.value.trim(),
      construction: dom.varConstruction.value.trim(),
      styleNotes: dom.varAlterationNotes.value.trim() || dom.varConstruction.value.trim(),

      // Materials & Crafts
      primaryFabric: primaryFabric,
      accentFabric: dom.varAccentFabric ? dom.varAccentFabric.value.trim() : '',
      complexity: dom.varComplexity ? dom.varComplexity.value : 'High',
      colourOptions: swatchesStr,
      swatches: swatchesStr,
      embroidery: dom.varEmbroidery.value.trim(),

      // Commercial
      estimatedCost: parseFloat(dom.varTotalCost.value) || 0,
      suggestedPrice: price,
      estimatedLabour: dom.varLabourHours.value.trim(),
      productionStatus: isDraft ? 'In Development' : dom.varProductionStatus.value,
      status: isDraft ? 'DRAFT' : 'APPROVED',
      readinessScore: state.readinessScore,
      tags: dom.varTags.value.trim(),
      turnaroundDays: parseInt(dom.varTurnaround.value, 10) || 12,

      // Lineage & Variants
      isVariant: isVariantMode,
      parentDesignId: isVariantMode && state.masterDesign && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(state.masterDesign.id)) ? state.masterDesign.id : null,
      parentDesignCode: isVariantMode && state.masterDesign ? state.masterDesign.code : null,
      variantSuffix: isVariantMode ? (code.split('-').pop() || 'V1') : null,

      // Media
      thumbnailUrl: heroImage,
      imageUrls: allImagesStr
    };

    try {
      if (!api || !api.designs || typeof api.designs.create !== 'function') {
        throw new Error('API Client is not ready');
      }

      const created = await api.designs.create(payload);

      showToast(isDraft ? `Draft "${title}" saved to database!` : `Design "${title}" (${code}) published to catalog!`);

      // Smooth return back to Design Studio
      setTimeout(() => {
        window.location.href = `../design-studio.html?highlight=${encodeURIComponent(code)}`;
      }, 1200);

    } catch (err) {
      console.error('[NewDesign] Database Save Error:', err);
      showToast(err.message || 'Failed to save design to database', 'error');
    } finally {
      state.isSubmitting = false;
      if (dom.btnStickyPublish) dom.btnStickyPublish.disabled = false;
      if (dom.btnBottomSubmit) dom.btnBottomSubmit.disabled = false;
    }
  }

  /* ==========================================================================
     16. EVENT LISTENERS BINDING
     ========================================================================== */
  function bindEventListeners() {
    // 1. Live Sync Listeners
    const syncInputs = [
      dom.varCode, dom.varTitle, dom.varCollection,
      dom.varNeckline, dom.varPrimaryFabric, dom.varSleeve,
      dom.varBackDesign, dom.varProductionStatus
    ];
    syncInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', updateLivePreview);
        input.addEventListener('change', updateLivePreview);
      }
    });

    // Costing Listeners
    [dom.varCostMaterial, dom.varCostLabour, dom.varSuggestedPrice].forEach(input => {
      if (input) {
        input.addEventListener('input', updateCostingAndMargin);
        input.addEventListener('change', updateCostingAndMargin);
      }
    });

    // 2. Code Regenerator
    if (dom.btnRegenCode) {
      dom.btnRegenCode.addEventListener('click', () => {
        if (state.mode === 'variant') {
          dom.varCode.value = generateNextVariantCode(state.masterDesign);
        } else {
          dom.varCode.value = generateNextMasterCode();
        }
        updateLivePreview();
        showToast('Generated fresh design code', 'info');
      });
    }

    // 3. Swatches Controls
    if (dom.btnAddColor && dom.customColorHex) {
      dom.btnAddColor.addEventListener('click', () => {
        const hex = dom.customColorHex.value.trim();
        addSwatch(hex);
        dom.customColorHex.value = '';
      });
    }

    if (dom.customColorPicker && dom.customColorHex) {
      dom.customColorPicker.addEventListener('input', e => {
        dom.customColorHex.value = e.target.value.toUpperCase();
      });
      dom.customColorHex.addEventListener('input', e => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          dom.customColorPicker.value = val;
        }
      });
    }

    // Swatches delegation (Remove)
    if (dom.activeSwatchesList) {
      dom.activeSwatchesList.addEventListener('click', e => {
        const removeBtn = e.target.closest('[data-action="remove-swatch"]');
        if (removeBtn) {
          const idx = parseInt(removeBtn.getAttribute('data-idx'), 10);
          removeSwatch(idx);
        }
      });
    }

    // 4. Media Reel & Dropzone
    if (dom.btnBrowseFiles && dom.mediaFileInput) {
      dom.btnBrowseFiles.addEventListener('click', () => dom.mediaFileInput.click());
    }
    if (dom.mediaDropzone && dom.mediaFileInput) {
      dom.mediaDropzone.addEventListener('click', e => {
        if (e.target !== dom.btnBrowseFiles) {
          dom.mediaFileInput.click();
        }
      });
      dom.mediaFileInput.addEventListener('change', () => {
        handleUploadedFiles(dom.mediaFileInput.files);
        dom.mediaFileInput.value = '';
      });

      dom.mediaDropzone.addEventListener('dragover', e => {
        e.preventDefault();
        dom.mediaDropzone.classList.add('drag-over');
      });
      dom.mediaDropzone.addEventListener('dragleave', e => {
        e.preventDefault();
        dom.mediaDropzone.classList.remove('drag-over');
      });
      dom.mediaDropzone.addEventListener('drop', e => {
        e.preventDefault();
        dom.mediaDropzone.classList.remove('drag-over');
        if (e.dataTransfer && e.dataTransfer.files) {
          handleUploadedFiles(e.dataTransfer.files);
        }
      });
    }

    // Direct Image URL Adder
    if (dom.btnAddImageUrl && dom.inputDirectImageUrl) {
      dom.btnAddImageUrl.addEventListener('click', () => {
        const url = dom.inputDirectImageUrl.value.trim();
        if (url) {
          state.mediaList.push(url);
          dom.inputDirectImageUrl.value = '';
          renderMediaReel();
          updateProductionReadiness();
          showToast('Image URL added to reel');
        }
      });
    }

    // Media Reel delegation (Set Hero / Remove)
    if (dom.mediaReelGrid) {
      dom.mediaReelGrid.addEventListener('click', e => {
        const setHeroBtn = e.target.closest('[data-action="set-hero"]');
        if (setHeroBtn) {
          const idx = parseInt(setHeroBtn.getAttribute('data-idx'), 10);
          if (!isNaN(idx) && idx < state.mediaList.length) {
            state.primaryMediaIndex = idx;
            renderMediaReel();
            showToast('Set as hero catalog image', 'info');
          }
          return;
        }

        const removeBtn = e.target.closest('[data-action="remove-media"]');
        if (removeBtn) {
          const idx = parseInt(removeBtn.getAttribute('data-idx'), 10);
          if (!isNaN(idx) && idx < state.mediaList.length) {
            state.mediaList.splice(idx, 1);
            if (state.primaryMediaIndex >= state.mediaList.length) {
              state.primaryMediaIndex = Math.max(0, state.mediaList.length - 1);
            }
            renderMediaReel();
            updateProductionReadiness();
          }
        }
      });
    }

    // 5. Master Picker Modal Openers & Actions
    if (dom.btnChangeMaster) {
      dom.btnChangeMaster.addEventListener('click', openMasterPicker);
    }
    if (dom.btnCloseMasterPicker) {
      dom.btnCloseMasterPicker.addEventListener('click', closeMasterPicker);
    }
    if (dom.modalMasterPicker) {
      dom.modalMasterPicker.addEventListener('click', e => {
        if (e.target === dom.modalMasterPicker) closeMasterPicker();
      });
    }
    if (dom.pickerSearchInput) {
      dom.pickerSearchInput.addEventListener('input', e => {
        renderMasterPickerGrid(e.target.value);
      });
    }
    if (dom.pickerDesignsGrid) {
      dom.pickerDesignsGrid.addEventListener('click', e => {
        const chooseBtn = e.target.closest('[data-action="choose-master"]') || e.target.closest('.picker-card');
        if (chooseBtn) {
          const code = chooseBtn.getAttribute('data-code');
          if (code) selectMasterDesignByCode(code);
        }
      });
    }

    // 6. Form Submission Handlers
    if (dom.form) {
      dom.form.addEventListener('submit', e => {
        e.preventDefault();
        handleSubmit(false);
      });
    }
    if (dom.btnStickyPublish) {
      dom.btnStickyPublish.addEventListener('click', () => handleSubmit(false));
    }
    if (dom.btnBottomDraft) {
      dom.btnBottomDraft.addEventListener('click', () => handleSubmit(true));
    }
    if (dom.btnStickyDraft) {
      dom.btnStickyDraft.addEventListener('click', () => handleSubmit(true));
    }

    // Keyboard Escape for Modal
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && dom.modalMasterPicker && dom.modalMasterPicker.style.display === 'flex') {
        closeMasterPicker();
      }
    });
  }

  /* ==========================================================================
     17. DATA LOADER & BOOTSTRAP (100% PURE DB)
     ========================================================================== */
  async function loadDataAndBootstrap() {
    initDom();
    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get('mode') || (params.get('baseId') || params.get('baseCode') ? 'variant' : 'variant');
    const requestedBaseId = params.get('baseId') || params.get('baseCode');

    // 1. Fetch live designs directly from PostgreSQL DB
    try {
      if (api && api.designs && typeof api.designs.list === 'function') {
        const listRes = await api.designs.list({ size: 100 });
        const listItems = Array.isArray(listRes) ? listRes : (listRes?.content || []);
        state.allDesigns = listItems.map(mapDbDesign).filter(Boolean);
      }
    } catch (apiErr) {
      console.error('[NewDesign] Failed to load designs from DB:', apiErr);
      showToast('Could not load designs from database', 'error');
    }

    // 2. Populate dynamic category selector, datalists and palette presets from actual DB records
    populateDynamicCatalogLists();

    // 3. Resolve Master Design from DB
    let targetMaster = null;
    if (requestedBaseId) {
      // First check in already loaded DB designs
      targetMaster = state.allDesigns.find(d =>
        String(d.id).toLowerCase() === requestedBaseId.toLowerCase() ||
        String(d.code).toLowerCase() === requestedBaseId.toLowerCase()
      );

      // If not in the initial list, fetch directly from DB by code or ID
      if (!targetMaster && api && api.designs && typeof api.designs.get === 'function') {
        try {
          const directRes = await api.designs.get(requestedBaseId);
          if (directRes) {
            targetMaster = mapDbDesign(directRes);
            if (targetMaster && !state.allDesigns.some(d => d.code === targetMaster.code)) {
              state.allDesigns.push(targetMaster);
              populateDynamicCatalogLists();
            }
          }
        } catch (fetchErr) {
          console.warn('[NewDesign] Direct master fetch notice:', fetchErr);
        }
      }
    }

    // Fallback: If in variant mode and no targetMaster found, use first DB design
    if (requestedMode === 'variant' && !targetMaster && state.allDesigns.length > 0) {
      targetMaster = state.allDesigns[0];
    }

    // 4. If Master exists, fetch any variants of this master from DB
    if (targetMaster && api && api.designs && typeof api.designs.variants === 'function') {
      try {
        const varRes = await api.designs.variants(targetMaster.id || targetMaster.code);
        state.variantsOfMaster = Array.isArray(varRes) ? varRes : (varRes?.content || []);
      } catch (_) {
        state.variantsOfMaster = [];
      }
    }

    // 5. Apply Mode & Prepopulate
    applyMode(requestedMode, targetMaster);

    // 6. Initialize Stepper & Listeners
    initStepper();
    bindEventListeners();

    // 7. Initialize Lucide Icons
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Document Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDataAndBootstrap);
  } else {
    loadDataAndBootstrap();
  }
})();
