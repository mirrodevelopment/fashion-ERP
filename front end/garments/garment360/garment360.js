/* ============================================================
   HAULO BOUTIQUE ERP — Garment 360° Technical Dossier Controller
   Path: front end/garments/garment360/garment360.js
   Dynamic, 100% Database-Backed, Zero Hardcoded Values/Seed Data
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  Garment360.init();
});

const Garment360 = (() => {

  let _toastTimer = null;
  let _images = [];
  let _activeImgIndex = 0;
  let _currentGarment = null;

  function showToast(msg, type = 'success') {
    const t = document.getElementById('g360Toast');
    if (!t) return;
    clearTimeout(_toastTimer);
    t.className = `settings-toast ${type}`;
    t.textContent = msg;
    t.classList.add('show');
    _toastTimer = setTimeout(() => t.classList.remove('show'), 3400);
  }

  function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatShortDate(d) {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (_) {
      return d;
    }
  }

  function init() {
    _loadGarmentFromParams();
    _setupKeyboardListeners();
  }

  // ── Data Loading & Dynamic Param Population ────────────────
  async function _loadGarmentFromParams() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const code = params.get('code');

    const emptyCard = document.getElementById('g360EmptyState');
    const workspace = document.getElementById('g360Workspace');

    if (!id && !code) {
      if (emptyCard) emptyCard.style.display = 'block';
      if (workspace) workspace.style.display = 'none';
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    try {
      let g = null;
      if (typeof api !== 'undefined' && api?.garments?.get && id) {
        g = await api.garments.get(id);
      }

      if (!g && typeof api !== 'undefined' && api?.garments?.list && code) {
        const listRes = await api.garments.list({ search: code, size: 1 });
        const items = listRes?.content || (Array.isArray(listRes) ? listRes : []);
        if (items.length > 0) {
          g = items[0];
          if (g.id && api?.garments?.get) {
            g = await api.garments.get(g.id);
          }
        }
      }

      if (!g) {
        const stored = sessionStorage.getItem('haulo_selected_garment');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.id === id || parsed.garmentCode === code)) {
            g = parsed;
          }
        }
      }

      if (g) {
        if (emptyCard) emptyCard.style.display = 'none';
        if (workspace) workspace.style.display = 'flex';
        _currentGarment = g;
        _populateUI(g);
      } else {
        if (emptyCard) emptyCard.style.display = 'block';
        if (workspace) workspace.style.display = 'none';
      }
    } catch (err) {
      console.warn('[Garment360] Notice while retrieving dynamic garment record:', err);
      if (emptyCard) emptyCard.style.display = 'block';
      if (workspace) workspace.style.display = 'none';
    } finally {
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function _populateUI(g) {
    if (!g) return;

    // 1. Header Identity
    const codeEl = document.getElementById('g360Code');
    const titleEl = document.getElementById('g360Title');
    const statusEl = document.getElementById('g360Status');

    if (codeEl) codeEl.textContent = g.garmentCode || '—';
    if (titleEl) titleEl.textContent = g.title || g.garmentType || 'Bespoke Atelier Garment';
    if (statusEl) {
      statusEl.textContent = g.status ? g.status.replace(/_/g, ' ') : '—';
      if (g.status === 'Completed' || g.status === 'Delivered') {
        statusEl.style.color = '#34d399';
        statusEl.style.borderColor = 'rgba(52, 211, 153, 0.4)';
        statusEl.style.background = 'rgba(52, 211, 153, 0.12)';
      } else if (g.status === 'Cancelled') {
        statusEl.style.color = '#f87171';
        statusEl.style.borderColor = 'rgba(248, 113, 113, 0.4)';
        statusEl.style.background = 'rgba(248, 113, 113, 0.12)';
      }
    }

    // Header Tags
    const tagType = document.getElementById('tagGarmentType');
    const tagCol = document.getElementById('tagCollection');
    const tagPri = document.getElementById('tagPriority');
    if (tagType) tagType.textContent = (g.garmentType || 'BESPOKE').toUpperCase();
    if (tagCol) tagCol.textContent = g.collectionName || 'MAIN ATELIER';
    if (tagPri) {
      tagPri.textContent = `${(g.priority || 'NORMAL').toUpperCase()} PRIORITY`;
      if (g.priority === 'URGENT') {
        tagPri.style.color = '#f87171';
      } else if (g.priority === 'HIGH') {
        tagPri.style.color = '#fbbf24';
      } else {
        tagPri.style.color = 'var(--g360-text-sec)';
      }
    }

    // 2. Header KPI Strip
    const kpiSugPrice = document.getElementById('kpiSuggestedPrice');
    const kpiTotAmt = document.getElementById('kpiTotalAmount');
    const kpiEstCost = document.getElementById('kpiEstimatedCost');
    const kpiCraftHours = document.getElementById('kpiCraftingHours');

    if (kpiSugPrice) {
      const p = g.suggestedPrice != null && Number(g.suggestedPrice) > 0 ? Number(g.suggestedPrice) : Number(g.totalAmount || 0);
      kpiSugPrice.textContent = p > 0 ? `₹${p.toLocaleString('en-IN')}` : '—';
    }
    if (kpiTotAmt) {
      kpiTotAmt.textContent = g.totalAmount != null ? `₹${Number(g.totalAmount).toLocaleString('en-IN')}` : '₹0';
    }
    if (kpiEstCost) {
      kpiEstCost.textContent = g.estimatedCost != null && Number(g.estimatedCost) > 0
        ? `₹${Number(g.estimatedCost).toLocaleString('en-IN')}`
        : '—';
    }
    if (kpiCraftHours) {
      kpiCraftHours.textContent = g.craftingHours != null && Number(g.craftingHours) > 0
        ? `${g.craftingHours}h`
        : '0h';
    }

    // 3. Showcase Image Gallery
    _images = [];
    if (g.imageUrl) {
      _images.push(g.imageUrl);
    }
    _activeImgIndex = 0;
    _renderGallery();

    // 4. Technical Passport
    const propType = document.getElementById('propGarmentType');
    const propCol = document.getElementById('propColour');
    const propDot = document.getElementById('propColorDot');
    const propFab = document.getElementById('propFabric');
    const propEmb = document.getElementById('propEmbroidery');
    const propSil = document.getElementById('propSilhouette');
    const propColl = document.getElementById('propCollection');
    const propDes = document.getElementById('propDesigner');
    const propArt = document.getElementById('propArtisan');
    const propBr = document.getElementById('propBranch');
    const propSm = document.getElementById('propSample');
    const propNts = document.getElementById('propNotes');

    if (propType) propType.textContent = g.garmentType || '—';
    if (propCol) propCol.textContent = g.colorName || '—';
    if (propDot) {
      if (g.colorHex) {
        propDot.style.display = 'inline-block';
        propDot.style.backgroundColor = g.colorHex;
      } else {
        propDot.style.display = 'none';
      }
    }
    if (propFab) propFab.textContent = g.primaryFabric || '—';
    if (propEmb) propEmb.textContent = g.embroideryType || '—';
    if (propSil) propSil.textContent = g.silhouette || g.specs || '—';
    if (propColl) propColl.textContent = g.collectionName || '—';
    if (propDes) propDes.textContent = g.designer || '—';
    if (propArt) propArt.textContent = g.assignedTo || '—';
    if (propBr) propBr.textContent = g.branch || '—';
    if (propSm) propSm.textContent = g.isSample ? 'Atelier Prototype / Sample' : 'Standard Production';
    if (propNts) propNts.textContent = g.notes || 'No special notes recorded.';

    // 5. Card 1: Production Pipeline
    const bdStage = document.getElementById('badgeStage');
    const valMat = document.getElementById('valMaterialStatus');
    const valTrl = document.getElementById('valTrial');
    const valDue = document.getElementById('valDueDate');
    const valSch = document.getElementById('valScheduleDays');
    const valOrd = document.getElementById('valOrderCode');
    const valCust = document.getElementById('valCustomer');

    if (bdStage) bdStage.textContent = (g.productionStage || 'REGISTERED').toUpperCase();
    if (valMat) valMat.textContent = g.materialStatus || '—';
    if (valTrl) {
      valTrl.textContent = g.trialDate
        ? `${formatShortDate(g.trialDate)}${g.trialStatus ? ` (${g.trialStatus})` : ''}`
        : (g.trialStatus || '—');
    }
    if (valDue) valDue.textContent = formatShortDate(g.dueDate);
    if (valSch) {
      if (g.daysRemaining != null) {
        valSch.textContent = g.daysRemaining < 0
          ? `${Math.abs(g.daysRemaining)} days overdue`
          : `${g.daysRemaining} days remaining`;
        valSch.style.color = g.daysRemaining < 0 ? '#f87171' : '#34d399';
      } else {
        valSch.textContent = '—';
      }
    }
    if (valOrd) valOrd.textContent = g.orderCode || '—';
    if (valCust) {
      valCust.textContent = g.customerName
        ? `${g.customerName}${g.customerMobile ? ` (${g.customerMobile})` : ''}`
        : '—';
    }

    // 6. Card 2: Financial Valuation
    const bdPay = document.getElementById('badgePayment');
    const valTot = document.getElementById('valTotalVal');
    const valPd = document.getElementById('valPaidVal');
    const valBal = document.getElementById('valBalanceVal');

    const tot = Number(g.totalAmount || 0);
    const pd = Number(g.paidAmount || 0);
    const bal = Math.max(0, tot - pd);

    if (bdPay) {
      bdPay.textContent = (g.paymentStatus || 'PENDING').toUpperCase();
      if (pd >= tot && tot > 0) {
        bdPay.style.color = '#34d399';
      } else if (pd > 0) {
        bdPay.style.color = '#fbbf24';
      } else {
        bdPay.style.color = '#f87171';
      }
    }
    if (valTot) valTot.textContent = `₹${tot.toLocaleString('en-IN')}`;
    if (valPd) valPd.textContent = `₹${pd.toLocaleString('en-IN')}`;
    if (valBal) valBal.textContent = `₹${bal.toLocaleString('en-IN')}`;

    // 7. Card 3: Specifications & Measurements
    const specsContainer = document.getElementById('g360SpecsContainer');
    if (specsContainer) {
      if (Array.isArray(g.measurements) && g.measurements.length > 0) {
        specsContainer.innerHTML = g.measurements.map(m => `
          <div class="g360-spec-chip">
            <span class="lbl">${escapeHTML(m.label || 'Specification')}:</span>
            <span class="val">${escapeHTML(m.value)}</span>
          </div>
        `).join('');
      } else if (g.specs) {
        const parts = g.specs.split(/[,;]/).map(s => s.trim()).filter(Boolean);
        if (parts.length > 0) {
          specsContainer.innerHTML = parts.map(p => `
            <div class="g360-spec-chip">
              <span class="val">${escapeHTML(p)}</span>
            </div>
          `).join('');
        } else {
          specsContainer.innerHTML = `<span style="font-size:12px;color:var(--g360-text-dim);">No custom specifications recorded.</span>`;
        }
      } else {
        specsContainer.innerHTML = `<span style="font-size:12px;color:var(--g360-text-dim);">No custom specifications recorded.</span>`;
      }
    }

    // 8. Card 4: Materials & Trims
    const matContainer = document.getElementById('g360MaterialsContainer');
    if (matContainer) {
      if (Array.isArray(g.materials) && g.materials.length > 0) {
        matContainer.innerHTML = g.materials.map(m => `
          <div class="g360-material-row">
            <div class="g360-material-info">
              <span class="g360-material-name">${escapeHTML(m.name)}</span>
              <span class="g360-material-desc">${escapeHTML(m.variant || '')}</span>
            </div>
            <span class="g360-material-badge">${escapeHTML(m.status || 'ALLOCATED')}</span>
          </div>
        `).join('');
      } else {
        matContainer.innerHTML = `<span style="font-size:12px;color:var(--g360-text-dim);">No allocated materials recorded.</span>`;
      }
    }

    // 9. Card 5: Timeline
    const timelineContainer = document.getElementById('g360TimelineContainer');
    if (timelineContainer) {
      if (Array.isArray(g.timeline) && g.timeline.length > 0) {
        timelineContainer.innerHTML = g.timeline.map(t => `
          <div class="g360-timeline-item">
            <div class="g360-timeline-header">
              <span class="g360-timeline-stage">${escapeHTML(t.stage)}</span>
              <span class="g360-timeline-date">${escapeHTML(formatShortDate(t.date))}</span>
            </div>
            ${t.description ? `<div class="g360-timeline-desc">${escapeHTML(t.description)}</div>` : ''}
            ${t.actor ? `<div class="g360-timeline-actor">${escapeHTML(t.actor)}</div>` : ''}
          </div>
        `).join('');
      } else {
        timelineContainer.innerHTML = `<span style="font-size:12px;color:var(--g360-text-dim);">No activity timeline logged for this garment.</span>`;
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // ── Gallery Thumbnail Navigation ───────────────────────────
  function _renderGallery() {
    const mainImg = document.getElementById('mainShowcaseImg');
    const noImg = document.getElementById('noImagePlaceholder');
    const expandBtn = document.getElementById('btnExpandPreview');
    const row = document.getElementById('thumbnailsRow');

    if (_images.length > 0) {
      if (mainImg) {
        mainImg.src = _images[_activeImgIndex] || _images[0];
        mainImg.style.display = 'block';
      }
      if (noImg) noImg.style.display = 'none';
      if (expandBtn) expandBtn.style.display = 'flex';
    } else {
      if (mainImg) {
        mainImg.src = '';
        mainImg.style.display = 'none';
      }
      if (noImg) noImg.style.display = 'flex';
      if (expandBtn) expandBtn.style.display = 'none';
    }

    if (row) {
      let thumbsHtml = '';
      _images.forEach((url, idx) => {
        thumbsHtml += `
          <button type="button" class="g360-thumb ${idx === _activeImgIndex ? 'active' : ''}" onclick="Garment360.selectImage(${idx}, this)">
            <img src="${escapeHTML(url)}" alt="Garment Artwork ${idx + 1}" />
          </button>
        `;
      });
      thumbsHtml += `
        <button type="button" class="g360-thumb g360-thumb-add" onclick="Garment360.triggerAddPhoto()" title="Upload swatch or artwork">
          <i data-lucide="plus" style="width:18px;height:18px;"></i>
        </button>
      `;
      row.innerHTML = thumbsHtml;
    }
  }

  function selectImage(index, btnEl) {
    if (index < 0 || index >= _images.length) return;
    _activeImgIndex = index;

    const mainImg = document.getElementById('mainShowcaseImg');
    if (mainImg) {
      mainImg.style.opacity = '0.6';
      mainImg.src = _images[index];
      setTimeout(() => {
        mainImg.style.opacity = '1';
      }, 140);
    }

    document.querySelectorAll('#thumbnailsRow .g360-thumb').forEach((el, idx) => {
      if (idx === index) el.classList.add('active');
      else el.classList.remove('active');
    });
  }

  function triggerAddPhoto() {
    const input = document.getElementById('g360PhotoInput');
    if (input) input.click();
  }

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const dataUri = e.target.result;
      _images.push(dataUri);
      _activeImgIndex = _images.length - 1;
      _renderGallery();
      showToast('✓ Swatch or artwork added to specimen gallery', 'success');
      if (window.lucide) window.lucide.createIcons();
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  // ── Lightbox Zoom Modal ────────────────────────────────────
  function openLightbox() {
    if (_images.length === 0) return;
    const box = document.getElementById('g360Lightbox');
    const img = document.getElementById('lightboxImg');
    if (box && img) {
      img.src = _images[_activeImgIndex] || _images[0];
      box.style.display = 'flex';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }

  function closeLightbox() {
    const box = document.getElementById('g360Lightbox');
    if (box) box.style.display = 'none';
  }

  function _setupKeyboardListeners() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  return {
    init,
    showToast,
    selectImage,
    triggerAddPhoto,
    handlePhotoUpload,
    openLightbox,
    closeLightbox
  };
})();

// Global alias for event handlers
window.Garment360 = Garment360;
