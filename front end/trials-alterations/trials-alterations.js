/**
 * ============================================================
 * HAULO BOUTIQUE ERP — TRIAL & ALTERATIONS LOGIC CONTROLLER
 * Path: front end/trials-alterations/trials-alterations.js
 * Description: Real database binding, live KPIs, dynamic customer
 *              measurements, garment artwork mapping, fit assessment,
 *              alterations checklist, and modal interactions.
 * ============================================================
 */

(function () {
  'use strict';

  // ── Master Trials Dataset (loaded from API) ──
  let TRIALS_DATA = [];

  // Application State
  const state = {
    selectedTrialId: null,
    filterTab: 'all',
    searchQuery: '',
    activeMiddleTab: 'design',
    lightboxIndex: 0,
    notifyChannel: 'whatsapp'
  };

  function parseFitCheckpoints(raw) {
    const defaultCheckpoints = {
      "Neck": "PERFECT",
      "Chest / Bust": "PERFECT",
      "Waist": "PERFECT",
      "Hip": "PERFECT",
      "Shoulders": "PERFECT",
      "Armhole": "PERFECT",
      "Sleeves": "PERFECT",
      "Total Length": "PERFECT"
    };
    if (!raw) return defaultCheckpoints;
    if (typeof raw === 'object') return { ...defaultCheckpoints, ...raw };
    try {
      const parsed = JSON.parse(raw);
      return { ...defaultCheckpoints, ...parsed };
    } catch (e) {
      return defaultCheckpoints;
    }
  }

  let AVAILABLE_ORDERS = [];

  // ── Helper: Get Active Trial ──
  function getActiveTrial() {
    if (!TRIALS_DATA.length) return null;
    return TRIALS_DATA.find(t => t.id === state.selectedTrialId) || TRIALS_DATA[0];
  }

  // ── Initialization ──
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  function initApp() {
    setupEventListeners();
    loadTrialsFromApi();
    initClock();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // ── Load Trials from API ──
  async function loadTrialsFromApi() {
    try {
      const { default: api, Auth } = await import('../api.js');
      if (!Auth.isLoggedIn()) {
        window.location.href = '../login/login.html';
        return;
      }

      const res = await api.trials.list({ page: 0, size: 50 }).catch(() => null);
      const items = Array.isArray(res) ? res : (res?.content || []);

      if (items.length > 0) {
        TRIALS_DATA.length = 0;
        items.forEach(t => {
          const rawFit = (t.fitStatus || '').toUpperCase();
          let initialFit = 'minor';
          if (rawFit === 'PERFECT') initialFit = 'perfect';
          else if (rawFit === 'MINOR' || rawFit === 'ALTERATIONS_NEEDED') initialFit = 'minor';
          else if (rawFit === 'MAJOR') initialFit = 'major';
          else if (rawFit === 'RETRIAL') initialFit = 'retrial';
          else if ((t.status || '').toUpperCase() === 'COMPLETED') initialFit = 'perfect';
          else if ((t.alterations || []).length > 0) initialFit = 'minor';
          else initialFit = 'perfect';

          const alts = (t.alterations || []).map((a, i) => ({
            id: a.id ? String(a.id) : ('ALT-' + i),
            dbId: a.id || null,
            desc: a.description || a.desc || a,
            category: a.category || 'General',
            checked: a.completed || a.checked || false,
            assignedTailor: a.assignedTailor || 'Master Tailor',
            priority: a.priority || 'Normal',
            targetDate: a.targetDate || '',
            tailorNotes: a.tailorNotes || ''
          }));

          const references = (Array.isArray(t.referenceImages) && t.referenceImages.length > 0)
            ? t.referenceImages
            : [];

          TRIALS_DATA.push({
            id: t.id || t.trialId || ('TRIAL-' + Date.now()),
            trialCode: t.trialCode || '',
            orderId: t.orderCode || t.orderId || '',
            trialAttempt: t.trialAttempt != null ? t.trialAttempt : 1,
            alterationCount: t.alterationCount != null ? t.alterationCount : alts.length,
            customerFeedback: t.customerFeedback || '',
            customerRating: t.customerRating != null ? t.customerRating : 5,
            fitPreference: t.fitPreference || 'Comfort / Regular Fit',
            fitCheckpoints: parseFitCheckpoints(t.fitCheckpoints),
            fitNotes: t.fitNotes || '',
            customer: {
              name: t.customerName || t.customer?.name || '—',
              phone: t.customerMobile || t.customer?.phone || '—',
              email: t.customerEmail || '—',
              location: t.customerLocation || '—',
              vip: t.vip || false,
              image: t.customerAvatar || ''
            },
            garment: {
              type: t.garmentType || '—',
              collection: t.collection || ''
            },
            trial: {
              date: t.trialDate || t.appointmentDate || '—',
              time: t.trialTime || t.appointmentTime || '',
              rawDate: t.trialDate || '',
              status: t.status || t.trialStatus || 'Scheduled',
              fitStatus: initialFit
            },
            designer: t.designerName || t.staffName || '—',
            deliveryDate: t.deliveryDate || '',
            sendProdDate: null,
            expectedCompDate: null,
            nextTrialDate: null,
            specs: {
              neck: t.neckStyle || '—',
              sleeve: t.sleeveStyle || '—',
              lining: t.lining || '—',
              embroidery: t.embroidery || '—',
              fabric: t.fabric || '—',
              notes: t.specNotes || '—'
            },
            references: references,
            alterations: alts,
            additionalNotes: t.notes || '',
            measurements: {},
            fullMeasurements: [],
            _measurementsLoaded: false,
            previousTrials: [],
            notes: t.notes ? [
              {
                text: t.notes,
                author: t.designerName || t.staffName || 'Staff',
                date: t.trialDate || 'Consultation'
              }
            ] : [],
            history: [
              {
                action: `Trial Session (Attempt #${t.trialAttempt || 1} • ${t.stage || 'Fitting Stage'})`,
                time: t.trialDate || 'Scheduled',
                staff: t.designerName || t.staffName || 'Staff'
              }
            ]
          });
        });

        // Link real previous trials for the same order
        TRIALS_DATA.forEach(cur => {
          const prior = TRIALS_DATA.filter(o => o.orderId && o.orderId === cur.orderId && o.id !== cur.id);
          if (prior.length > 0) {
            cur.previousTrials = prior.map(p => ({
              date: p.trial.date || p.trial.rawDate || 'Previous Session',
              attempt: p.trialAttempt || 1,
              result: p.trial.fitStatus === 'perfect' ? 'Perfect Fit' :
                      p.trial.fitStatus === 'major' ? 'Major Alterations' :
                      p.trial.fitStatus === 'retrial' ? 'Re-trial Required' : 'Minor Alterations',
              alterations: p.alterations && p.alterations.length > 0
                ? p.alterations.map(a => `${a.desc} [${a.assignedTailor || 'Tailor'}]`).join('; ')
                : (p.additionalNotes || 'Fit assessed.'),
              tailor: (p.designer && p.designer !== '—') ? p.designer : 'Tailor'
            }));
          }
        });

        if (TRIALS_DATA.length > 0) {
          state.selectedTrialId = TRIALS_DATA[0].id;
          loadMeasurementsForTrial(TRIALS_DATA[0]);
        }
      }

      // Load dynamic employees into modalRetrialStaff and modalAltTailor
      try {
        const emps = await api.employees.list({ status: 'ACTIVE' }).catch(() => []);
        const empList = Array.isArray(emps) ? emps : (emps?.content || []);
        const staffSelect = document.getElementById('modalRetrialStaff');
        const tailorSelect = document.getElementById('modalAltTailor');
        const optionsHtml = '<option value="">Select Staff...</option>' +
          empList.map(e => `<option value="${e.name}">${e.name} (${e.role || 'Tailor'})</option>`).join('');
        if (staffSelect && empList.length > 0) staffSelect.innerHTML = optionsHtml;
        if (tailorSelect && empList.length > 0) tailorSelect.innerHTML = optionsHtml;
      } catch (empErr) {
        console.warn('[TrialsAlterations] Employee load error:', empErr.message);
      }
    } catch (err) {
      console.warn('[TrialsAlterations] API load error:', err.message);
    } finally {
      renderTrialList();
      renderTrialDetails();
      updateKPIs();
    }
  }

  // ── Load Dynamic Measurements for Trial ──
  async function loadMeasurementsForTrial(trial) {
    if (!trial || !trial.customer || !trial.customer.phone) return;
    if (trial._measurementsLoaded) return;

    try {
      const { default: api } = await import('../api.js');
      const res = await api.customers.bodyMeasurements.list(trial.customer.phone).catch(() => []);
      const list = Array.isArray(res) ? res : (res?.content || []);

      if (list && list.length > 0) {
        const gType = (trial.garment.type || '').toUpperCase();
        let matched = list.find(m => gType.includes(m.garmentType)) ||
                      list.find(m => m.garmentType === 'BLOUSE' && (gType.includes('SAREE') || gType.includes('BLOUSE'))) ||
                      list.find(m => m.garmentType === 'CHUDI' && (gType.includes('KURTI') || gType.includes('SUIT') || gType.includes('ANARKALI'))) ||
                      list.find(m => m.garmentType === 'LEHENGA' && gType.includes('LEHENGA')) ||
                      list[0];

        if (matched) {
          const u = matched.unit === 'in' ? '"' : (matched.unit ? ` ${matched.unit}` : '"');
          const measMap = {};
          const fullRows = [];

          const addDim = (label, val, tol = '±0.25"') => {
            if (val != null && val !== '') {
              const formatted = `${val}${u}`;
              measMap[label] = formatted;
              fullRows.push({
                point: label,
                standard: formatted,
                current: formatted,
                target: formatted,
                tolerance: tol
              });
            }
          };

          if (matched.bust) addDim('Bust', matched.bust);
          if (matched.waist) addDim('Waist', matched.waist);
          if (matched.hip) addDim('Hip', matched.hip);
          if (matched.shoulder) addDim('Shoulder', matched.shoulder);
          if (matched.underBust) addDim('Under Bust', matched.underBust);
          if (matched.blouseLength) addDim('Blouse Length', matched.blouseLength);
          if (matched.topLength) addDim('Top Length', matched.topLength);
          if (matched.skirtLength) addDim('Skirt / Lehenga Length', matched.skirtLength);
          if (matched.pantLength) addDim('Pant Length', matched.pantLength);
          if (matched.armhole) addDim('Armhole', matched.armhole);
          if (matched.upperArm) addDim('Upper Arm', matched.upperArm);
          if (matched.sleeveLength) addDim('Sleeve Length', matched.sleeveLength);
          if (matched.sleeveRound) addDim('Sleeve Round', matched.sleeveRound);
          if (matched.frontNeckDepth) addDim('Front Neck Depth', matched.frontNeckDepth);
          if (matched.backNeckDepth) addDim('Back Neck Depth', matched.backNeckDepth);
          if (matched.bustPoint) addDim('Bust Point', matched.bustPoint);
          if (matched.shoulderToWaist) addDim('Shoulder to Waist', matched.shoulderToWaist);
          if (matched.frontWidth) addDim('Front Width', matched.frontWidth);
          if (matched.backWidth) addDim('Back Width', matched.backWidth);
          if (matched.pantWaist) addDim('Pant Waist', matched.pantWaist);
          if (matched.pantHip) addDim('Pant Hip', matched.pantHip);
          if (matched.bottomOpening) addDim('Bottom Opening', matched.bottomOpening);
          if (matched.flare) addDim('Flare', matched.flare, '±1.0"');

          trial.measurements = measMap;
          trial.fullMeasurements = fullRows;
          trial._measurementsLoaded = true;

          const active = getActiveTrial();
          if (active && active.id === trial.id) {
            renderMeasurementsTab(trial);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('[TrialsAlterations] Failed to load customer body measurements:', err.message);
    }

    // Clean empty state when no measurements exist in database
    trial.measurements = {};
    trial.fullMeasurements = [];
    trial._measurementsLoaded = true;
    const active = getActiveTrial();
    if (active && active.id === trial.id) {
      renderMeasurementsTab(trial);
    }
  }

  // ── Event Listeners Setup ──
  function setupEventListeners() {
    // Filter Pills
    const filterContainer = document.getElementById('filterPills');
    if (filterContainer) {
      filterContainer.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          filterContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.filterTab = btn.getAttribute('data-filter');
          renderTrialList();
        });
      });
    }

    // Search Input
    const searchInput = document.getElementById('trialSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderTrialList();
      });
    }

    // Detail Tabs
    const tabsNav = document.getElementById('detailsTabsNav');
    if (tabsNav) {
      tabsNav.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          tabsNav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.activeMiddleTab = btn.getAttribute('data-tab');
          showTabPanel(state.activeMiddleTab);
        });
      });
    }

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      const lightbox = document.getElementById('lightboxOverlay');
      if (lightbox && lightbox.classList.contains('open')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevLightboxImage();
        if (e.key === 'ArrowRight') nextLightboxImage();
      }
    });
  }

  // ── Live Clock ──
  function initClock() {
    const timeEl = document.getElementById('currentHeaderTime');
    const dateEl = document.getElementById('currentHeaderDate');
    function tick() {
      const now = new Date();
      if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
      if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    tick();
    setInterval(tick, 30000);
  }

  // ── Update Dynamic Counts on Filter Pills ──
  function updateFilterCounts() {
    const total = TRIALS_DATA.length;
    const todayCount = TRIALS_DATA.filter(t => (t.trial.status || '').toLowerCase() === 'today').length;
    const overdueCount = TRIALS_DATA.filter(t => (t.trial.status || '').toLowerCase() === 'overdue').length;
    const weekCount = TRIALS_DATA.filter(t => (t.trial.status || '').toLowerCase() !== 'overdue').length;

    const elAll = document.getElementById('countAll');
    if (elAll) elAll.textContent = total;

    const elToday = document.getElementById('countToday');
    if (elToday) elToday.textContent = todayCount;

    const elWeek = document.getElementById('countWeek');
    if (elWeek) elWeek.textContent = weekCount;

    const elOverdue = document.getElementById('countOverdue');
    if (elOverdue) elOverdue.textContent = overdueCount;
  }

  // ── Render Upcoming Trials List ──
  function renderTrialList() {
    updateFilterCounts();

    const container = document.getElementById('trialListContainer');
    if (!container) return;

    const filtered = TRIALS_DATA.filter(item => {
      const statusLower = (item.trial.status || '').toLowerCase();
      // Tab filter
      if (state.filterTab === 'today' && statusLower !== 'today') return false;
      if (state.filterTab === 'overdue' && statusLower !== 'overdue') return false;
      if (state.filterTab === 'week') {
        if (statusLower === 'overdue') return false;
      }

      // Search query
      if (state.searchQuery) {
        const query = state.searchQuery;
        const nameMatch = item.customer.name.toLowerCase().includes(query);
        const orderMatch = item.orderId.toLowerCase().includes(query);
        const garmentMatch = item.garment.type.toLowerCase().includes(query);
        const phoneMatch = item.customer.phone.toLowerCase().includes(query);
        const statusMatch = item.trial.status.toLowerCase().includes(query);
        return nameMatch || orderMatch || garmentMatch || phoneMatch || statusMatch;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: rgba(255,255,255,0.4); font-size: 12.5px;">
          No matching trials found.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => {
      const isSelected = item.id === state.selectedTrialId;
      const statusClass = (item.trial.status || 'scheduled').toLowerCase().replace(/\s+/g, '-');

      return `
        <div class="trial-item ${isSelected ? 'selected' : ''}" 
             data-trial-code="${item.trialCode || ''}" 
             onclick="window.selectTrial('${item.id}')">
          <div class="trial-item-avatar-col">
            ${typeof window.renderPatronAvatarHtml === 'function'
              ? window.renderPatronAvatarHtml(item.customer.name, item.customer.image, 'haulo-avatar-sm', 'width:38px;height:38px;border-radius:10px;')
              : `<div class="haulo-patron-avatar-initials haulo-avatar-sm" style="width:38px;height:38px;border-radius:10px;">${typeof window.getPatronInitials === 'function' ? window.getPatronInitials(item.customer.name) : 'CU'}</div>`}
          </div>
          <div class="trial-item-body">
            <div class="trial-row-top">
              <span class="trial-customer-name" title="${item.customer.name}">${item.customer.name}</span>
              <span class="status-badge-sm ${statusClass}">${item.trial.status}</span>
            </div>
            <div class="trial-row-garment" title="${item.garment.type}">${item.garment.type}</div>
            <div class="trial-row-meta">
              <span class="trial-order-chip">${item.orderId}</span>
              <span class="trial-meta-dot">&bull;</span>
              <span class="trial-schedule-info">
                <i data-lucide="clock" class="mini-icon"></i>
                <span>${item.trial.date}</span>
                <span class="trial-schedule-time">${item.trial.time}</span>
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: container });
    }
  }

  // ── Select a Trial ──
  window.selectTrial = function (trialId) {
    state.selectedTrialId = trialId;
    const trial = getActiveTrial();
    if (trial && !trial._measurementsLoaded) {
      loadMeasurementsForTrial(trial);
    }
    renderTrialList();
    renderTrialDetails();
  };

  function renderTrialDetails() {
    const trial = getActiveTrial();
    if (!trial) {
      const ids = [
        'detailCustomerName', 'detailCustomerPhone', 'detailCustomerEmail', 'detailCustomerLoc',
        'detailOrderId', 'detailGarment', 'detailTrialDate', 'detailDeliveryDate',
        'detailDesigner', 'detailStage', 'specNeck', 'specSleeve', 'specLining',
        'specEmbroidery', 'specFabric', 'specSpecialNotes', 'stepSendProd',
        'stepExpectedComp', 'stepNextTrial', 'stepFinalDeliv'
      ];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
      });
      const avatarBox = document.getElementById('detailCustomerAvatarBox');
      if (avatarBox) avatarBox.innerHTML = '<div class="haulo-patron-avatar-initials haulo-avatar-md" style="width:48px;height:48px;border-radius:12px;">CU</div>';
      const vipBadge = document.getElementById('detailVipBadge');
      if (vipBadge) vipBadge.style.display = 'none';
      const checklist = document.getElementById('alterationChecklist');
      if (checklist) checklist.innerHTML = '<div style="color:rgba(255,255,255,0.45);font-size:12px;padding:8px 0;">No trial selected.</div>';
      const addNotesEl = document.getElementById('alterationAdditionalNotes');
      if (addNotesEl) addNotesEl.value = '';

      const gallery = document.getElementById('designGalleryGrid');
      if (gallery) gallery.innerHTML = '<div style="color:rgba(255,255,255,0.45);font-size:12px;padding:16px 4px;grid-column:1/-1;">No trial selected.</div>';
      const measGrid = document.getElementById('measurementsGridContainer');
      if (measGrid) measGrid.innerHTML = '<div style="color:rgba(255,255,255,0.45);font-size:12.5px;grid-column:span 4;padding:16px 0;text-align:center;">No trial selected.</div>';
      const prevContainer = document.getElementById('previousTrialsContainer');
      if (prevContainer) prevContainer.innerHTML = '<div style="color:rgba(255,255,255,0.45);font-size:12px;padding:8px 0;">No trial selected.</div>';
      const notesContainer = document.getElementById('trialNotesContainer');
      if (notesContainer) notesContainer.innerHTML = '<div style="color:rgba(255,255,255,0.45);font-size:12px;padding:8px 0;">No trial selected.</div>';
      const histContainer = document.getElementById('trialHistoryContainer');
      if (histContainer) histContainer.innerHTML = '<div style="color:rgba(255,255,255,0.45);font-size:12px;padding:8px 0;">No trial selected.</div>';
      document.querySelectorAll('.fit-option').forEach(opt => opt.classList.remove('active'));
      return;
    }

    // 1. Customer Card & Order Meta (Universal Patron Engine)
    const avatarBox = document.getElementById('detailCustomerAvatarBox');
    if (avatarBox) {
      if (typeof window.applyPatronAvatarElement === 'function') {
        window.applyPatronAvatarElement(avatarBox, trial.customer.name, trial.customer.image, 'haulo-avatar-md', 'width:48px;height:48px;border-radius:12px;');
      } else if (typeof window.renderPatronAvatarHtml === 'function') {
        avatarBox.innerHTML = window.renderPatronAvatarHtml(trial.customer.name, trial.customer.image, 'haulo-avatar-md', 'width:48px;height:48px;border-radius:12px;');
      } else {
        const inits = typeof window.getPatronInitials === 'function' ? window.getPatronInitials(trial.customer.name) : 'CU';
        avatarBox.innerHTML = `<div class="haulo-patron-avatar-initials haulo-avatar-md" style="width:48px;height:48px;border-radius:12px;">${inits}</div>`;
      }
    }

    const nameEl = document.getElementById('detailCustomerName');
    if (nameEl) nameEl.textContent = trial.customer.name;

    const vipBadge = document.getElementById('detailVipBadge');
    if (vipBadge) vipBadge.style.display = trial.customer.vip ? 'inline-block' : 'none';

    const phoneEl = document.getElementById('detailCustomerPhone');
    if (phoneEl) phoneEl.textContent = trial.customer.phone;

    const emailEl = document.getElementById('detailCustomerEmail');
    if (emailEl) emailEl.textContent = trial.customer.email;

    const locEl = document.getElementById('detailCustomerLoc');
    if (locEl) locEl.textContent = trial.customer.location;

    // Order specs
    const orderIdEl = document.getElementById('detailOrderId');
    if (orderIdEl) orderIdEl.textContent = trial.orderId;

    const garmentEl = document.getElementById('detailGarment');
    if (garmentEl) garmentEl.textContent = trial.garment.type;

    const trialDateEl = document.getElementById('detailTrialDate');
    if (trialDateEl) trialDateEl.textContent = `${trial.trial.date}, ${trial.trial.time}`;

    const delivDateEl = document.getElementById('detailDeliveryDate');
    if (delivDateEl) delivDateEl.textContent = trial.deliveryDate || '—';

    const designerEl = document.getElementById('detailDesigner');
    if (designerEl) designerEl.textContent = trial.designer;

    const stageEl = document.getElementById('detailStage');
    if (stageEl) stageEl.textContent = (trial.trial.status || '').toLowerCase() === 'completed' ? 'Completed' : 'Trial & Fitting';

    // 2. Garment Specifications
    const specNeck = document.getElementById('specNeck');
    if (specNeck) specNeck.textContent = trial.specs.neck;

    const specSleeve = document.getElementById('specSleeve');
    if (specSleeve) specSleeve.textContent = trial.specs.sleeve;

    const specLining = document.getElementById('specLining');
    if (specLining) specLining.textContent = trial.specs.lining;

    const specEmb = document.getElementById('specEmbroidery');
    if (specEmb) specEmb.textContent = trial.specs.embroidery;

    const specFabric = document.getElementById('specFabric');
    if (specFabric) specFabric.textContent = trial.specs.fabric;

    const specNotes = document.getElementById('specSpecialNotes');
    if (specNotes) specNotes.textContent = trial.specs.notes;

    // 3. Tab Contents
    renderDesignGallery(trial);
    renderMeasurementsTab(trial);
    renderPreviousTrialsTab(trial);
    renderNotesTab(trial);
    renderHistoryTab(trial);

    // 4. Fit Assessment
    updateFitAssessmentUI(trial.trial.fitStatus);

    // 5. Alterations Checklist
    renderAlterationsChecklist(trial);

    // 6. Additional Notes
    const addNotesEl = document.getElementById('alterationAdditionalNotes');
    if (addNotesEl) addNotesEl.value = trial.additionalNotes || '';

    // 7. Dynamic Milestone Dates for Next Steps
    function formatDisplayDate(d) {
      if (!d) return '—';
      const dateObj = (d instanceof Date) ? d : new Date(d);
      if (isNaN(dateObj.getTime())) return String(d);
      return dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    }

    const isFitApproved = trial.trial.fitStatus === 'perfect';

    const stepSendProd = document.getElementById('stepSendProd');
    if (stepSendProd) {
      stepSendProd.textContent = isFitApproved
        ? 'Not required (Fit Approved)'
        : (trial.sendProdDate ? formatDisplayDate(trial.sendProdDate) : '—');
    }

    const stepExp = document.getElementById('stepExpectedComp');
    if (stepExp) {
      stepExp.textContent = isFitApproved
        ? 'Ready for Final Pressing'
        : (trial.expectedCompDate ? formatDisplayDate(trial.expectedCompDate) : '—');
    }

    const stepNext = document.getElementById('stepNextTrial');
    if (stepNext) {
      if (trial.trial.fitStatus === 'retrial') {
        stepNext.textContent = trial.nextTrialDate ? formatDisplayDate(trial.nextTrialDate) : 'To be scheduled';
      } else if (trial.trial.fitStatus === 'minor' || trial.trial.fitStatus === 'major') {
        stepNext.textContent = 'Optional on request';
      } else {
        stepNext.textContent = 'Not required (Fit Approved)';
      }
    }

    const stepFinal = document.getElementById('stepFinalDeliv');
    if (stepFinal) {
      stepFinal.textContent = trial.deliveryDate ? formatDisplayDate(trial.deliveryDate) : '—';
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // ── Show Tab Panel ──
  function showTabPanel(tabKey) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    const map = {
      'design': 'tabPanelDesign',
      'measurements': 'tabPanelMeasurements',
      'previous': 'tabPanelPrevious',
      'notes': 'tabPanelNotes',
      'history': 'tabPanelHistory'
    };
    const target = document.getElementById(map[tabKey]);
    if (target) target.classList.add('active');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // ── Render Design Gallery ──
  function renderDesignGallery(trial) {
    const grid = document.getElementById('designGalleryGrid');
    if (!grid) return;

    const refs = trial.references || [];

    const imagesHtml = refs.map((imgSrc, idx) => `
      <div class="gallery-item" onclick="openLightbox(${idx})">
        <img src="${imgSrc}" alt="Design Reference ${idx + 1}" onerror="this.style.opacity='0.25';" />
      </div>
    `).join('');

    const emptyNotice = refs.length === 0
      ? `<div style="color:rgba(255,255,255,0.45);font-size:12px;padding:16px 4px;grid-column:1/-1;">No reference artwork uploaded.</div>`
      : '';

    const uploadTile = `
      <div class="gallery-add-tile" onclick="triggerImageUpload()">
        <i data-lucide="plus" style="width:22px;height:22px;"></i>
        <div class="add-tile-title">Add Images</div>
        <div class="add-tile-sub">JPG, PNG (Max 5MB)</div>
        <input type="file" id="imageUploadInput" accept="image/png, image/jpeg, image/webp" style="display:none;" onchange="handleImageUpload(event)" multiple />
      </div>
    `;

    grid.innerHTML = emptyNotice + imagesHtml + uploadTile;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: grid });
    }
  }

  // ── Render Measurements Tab ──
  function renderMeasurementsTab(trial) {
    const grid = document.getElementById('measurementsGridContainer');
    if (!grid) return;

    const keys = Object.keys(trial.measurements || {});
    if (!keys.length) {
      grid.innerHTML = `<div style="color:rgba(255,255,255,0.45);font-size:12.5px;grid-column:span 4;padding:16px 0;text-align:center;">No body measurements recorded for this customer.</div>`;
      return;
    }

    grid.innerHTML = keys.map(k => `
      <div class="meas-box">
        <span class="meas-k">${k}</span>
        <span class="meas-v">${trial.measurements[k]}</span>
      </div>
    `).join('');
  }

  // ── Render Previous Trials Tab ──
  function renderPreviousTrialsTab(trial) {
    const container = document.getElementById('previousTrialsContainer');
    if (!container) return;

    const prior = trial.previousTrials || [];
    const attempt = trial.trialAttempt || 1;
    const altsCount = trial.alterationCount != null ? trial.alterationCount : (trial.alterations ? trial.alterations.length : 0);

    let html = `
      <div style="margin-bottom: 12px; padding: 10px 14px; background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); border-radius: var(--radius-inner);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; font-weight:700; color:#c084fc;">Current Session: Attempt #${attempt} ${attempt > 1 ? `(Re-trial ×${attempt - 1})` : '(First Fitting)'}</span>
          <span style="font-size:11px; color:#fbbf24; font-weight:600;">Rating: ${trial.customerRating || 5} ★</span>
        </div>
        <div style="font-size:11px; color:rgba(255,255,255,0.7); margin-top:4px;">
          Fit Style: <strong>${trial.fitPreference || 'Comfort / Regular Fit'}</strong> &bull; Alterations Cycle: <strong>Round ${altsCount}</strong>
        </div>
        ${trial.customerFeedback ? `<div style="font-size:11px; color:rgba(255,255,255,0.55); font-style:italic; margin-top:4px;">&ldquo;${trial.customerFeedback}&rdquo;</div>` : ''}
      </div>
    `;

    if (!prior.length) {
      html += `<div style="color:rgba(255,255,255,0.45);font-size:12px;padding:8px 0;">This is the first trial attempt recorded for this garment order. No prior attempts on record.</div>`;
    } else {
      html += prior.map((pt, idx) => {
        const isMinor = (pt.result || '').toLowerCase().includes('minor');
        const pillClass = isMinor ? 'minor' : 'perfect';
        const priorAttemptNum = pt.attempt || (prior.length - idx);
        return `
          <div class="prev-trial-card">
            <div class="prev-trial-header">
              <span class="prev-date">Attempt #${priorAttemptNum} &bull; ${pt.date}</span>
              <span class="prev-result ${pillClass}">${pt.result}</span>
            </div>
            <div class="prev-notes">${pt.alterations}</div>
            <div class="prev-tailor">Tailor / Specialist: ${pt.tailor}</div>
          </div>
        `;
      }).join('');
    }

    container.innerHTML = html;
  }

  // ── Render Notes Tab ──
  function renderNotesTab(trial) {
    const container = document.getElementById('trialNotesContainer');
    if (!container) return;

    if (!trial.notes || !trial.notes.length) {
      container.innerHTML = `<div style="color:rgba(255,255,255,0.4);font-size:12px;padding:8px 0;">No fitting notes yet. Add one below.</div>`;
      return;
    }

    container.innerHTML = trial.notes.map(n => `
      <div class="note-item">
        <span class="note-text">${n.text}</span>
        <span class="note-meta">${n.author} &bull; ${n.date}</span>
      </div>
    `).join('');
  }

  // ── Add Note Handler ──
  window.handleAddNote = function () {
    const input = document.getElementById('newNoteInput');
    if (!input || !input.value.trim()) return;

    const trial = getActiveTrial();
    const newNote = {
      text: input.value.trim(),
      author: (trial.designer && trial.designer !== '—') ? trial.designer : 'Staff',
      date: 'Just now'
    };

    if (!trial.notes) trial.notes = [];
    trial.notes.unshift(newNote);
    input.value = '';

    renderNotesTab(trial);
    showToast('Trial note added successfully', 'success');
  };

  // ── Render History Tab ──
  function renderHistoryTab(trial) {
    const container = document.getElementById('trialHistoryContainer');
    if (!container) return;

    if (!trial.history || !trial.history.length) {
      container.innerHTML = `<div style="color:rgba(255,255,255,0.4);font-size:12px;padding:8px 0;">No activity logged yet.</div>`;
      return;
    }

    container.innerHTML = trial.history.map(h => `
      <div class="history-row">
        <div class="hist-dot"></div>
        <div class="hist-action">${h.action} (${h.staff})</div>
        <div class="hist-time">${h.time}</div>
      </div>
    `).join('');
  }


  // ── Fit Assessment Interaction ──
  window.selectFitStatus = function (fitKey) {
    const trial = getActiveTrial();
    if (!trial) return;
    trial.trial.fitStatus = fitKey;

    updateFitAssessmentUI(fitKey);

    (async () => {
      try {
        const { default: api } = await import('../api.js');
        if (trial.id) {
          const apiStatus = fitKey === 'perfect' ? 'PERFECT' :
                            fitKey === 'minor' ? 'MINOR' :
                            fitKey === 'major' ? 'MAJOR' : 'RETRIAL';
          await api.trials.updateFitStatus(trial.id, apiStatus);
        }
      } catch (err) {
        console.warn('[TrialsAlterations] Failed to update fit status on backend:', err.message);
      }
    })();

    // Update status based on fit
    if (fitKey === 'perfect') {
      trial.trial.status = 'Completed';
      showToast('Fit assessment set to Perfect Fit', 'success');
    } else if (fitKey === 'minor') {
      trial.trial.status = 'In Alteration';
      showToast('Fit assessment set to Minor Alterations', 'info');
    } else if (fitKey === 'major') {
      trial.trial.status = 'In Alteration';
      showToast('Fit assessment set to Major Alterations', 'warn');
    } else if (fitKey === 'retrial') {
      trial.trial.status = 'Re-trial Required';
      showToast('Re-trial required for this garment', 'warn');
    }

    renderTrialDetails();
    renderTrialList();
    updateKPIs();
  };

  function updateFitAssessmentUI(fitKey) {
    document.querySelectorAll('.fit-option').forEach(opt => {
      const optFit = opt.getAttribute('data-fit');
      opt.classList.toggle('active', optFit === fitKey);
    });
  }

  // ── Render Alterations Checklist ──
  function renderAlterationsChecklist(trial) {
    const container = document.getElementById('alterationChecklist');
    if (!container) return;

    if (!trial.alterations || !trial.alterations.length) {
      container.innerHTML = `
        <div style="color:rgba(255,255,255,0.45);font-size:12px;padding:8px 0;">
          No alterations requested. Garment is verified and ready for delivery.
        </div>
      `;
      return;
    }

    container.innerHTML = trial.alterations.map(alt => {
      const catClass = (alt.category || 'general').toLowerCase();
      const priorityClass = (alt.priority || 'normal').toLowerCase();
      return `
        <div class="alt-item">
          <div class="alt-left">
            <input type="checkbox" class="alt-checkbox" ${alt.checked ? 'checked' : ''} onchange="window.toggleAlterationCheck('${alt.id}', this.checked)" />
            <div>
              <span class="alt-desc" style="${alt.checked ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${alt.desc}</span>
              <div class="alt-meta-sub">
                <span class="alt-tailor-tag">✂ ${alt.assignedTailor || 'Master Tailor'}</span>
                <span class="alt-priority-tag ${priorityClass}">${alt.priority || 'Normal'}</span>
                ${alt.targetDate ? `<span>• Due ${alt.targetDate}</span>` : ''}
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="alt-badge ${catClass}">${alt.category || 'General'}</span>
            <button type="button" class="btn-alt-delete" onclick="window.deleteAlterationItem('${alt.id}')" title="Delete alteration" style="background:transparent;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:16px;line-height:1;padding:2px 5px;border-radius:4px;transition:color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='rgba(255,255,255,0.3)'">&times;</button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.toggleAlterationCheck = async function (altId, isChecked) {
    const trial = getActiveTrial();
    if (!trial) return;
    const item = (trial.alterations || []).find(a => a.id === altId);
    if (item) {
      item.checked = isChecked;
      renderAlterationsChecklist(trial);
      updateKPIs();

      try {
        const { default: api } = await import('../api.js');
        if (trial.id && item.dbId) {
          const authUser = window.Auth?.getUser?.();
          const staffName = authUser?.fullName || authUser?.username || 'Master Tailor';
          await api.trials.toggleAlteration(trial.id, item.dbId, isChecked, staffName);
        }
      } catch (err) {
        console.warn('[TrialsAlterations] Failed to toggle alteration on backend:', err.message);
      }
    }
  };

  window.deleteAlterationItem = async function (altId) {
    const trial = getActiveTrial();
    if (!trial) return;
    const item = (trial.alterations || []).find(a => a.id === altId);
    if (!item) return;

    if (!confirm(`Delete alteration item: "${item.desc}"?`)) return;

    try {
      const { default: api } = await import('../api.js');
      if (trial.id && item.dbId) {
        await api.trials.deleteAlteration(trial.id, item.dbId);
        await loadTrialsFromApi();
        if (trial.id) window.selectTrial(trial.id);
      } else {
        trial.alterations = (trial.alterations || []).filter(a => a.id !== altId);
        trial.alterationCount = trial.alterations.length;
        renderAlterationsChecklist(trial);
        renderTrialDetails();
        updateKPIs();
      }
      showToast('Alteration item deleted', 'info');
    } catch (err) {
      showToast('Failed to delete alteration: ' + err.message, 'warn');
    }
  };

  // ── Save Alterations & Client Feedback ──
  window.handleSaveAlterations = function () {
    const trial = getActiveTrial();
    if (!trial) return;

    const notesEl = document.getElementById('alterationAdditionalNotes');
    if (notesEl) {
      trial.additionalNotes = notesEl.value;
    }
    const feedbackNotesEl = document.getElementById('customerFeedbackNotes');
    if (feedbackNotesEl) {
      trial.customerFeedback = feedbackNotesEl.value;
    }

    trial.history.unshift({
      action: `Fitting Assessment & Feedback Saved (Attempt #${trial.trialAttempt || 1})`,
      time: 'Just now',
      staff: (trial.designer && trial.designer !== '—') ? trial.designer : 'Staff'
    });
    renderHistoryTab(trial);

    (async () => {
      try {
        const { default: api } = await import('../api.js');
        if (trial.id) {
          await api.trials.update(trial.id, {
            orderCode: trial.orderId,
            customerMobile: trial.customer.phone,
            customerName: trial.customer.name,
            garmentType: trial.garment.type,
            notes: trial.additionalNotes,
            status: trial.trial.status,
            fitStatus: (trial.trial.fitStatus || 'PENDING').toUpperCase(),
            trialAttempt: trial.trialAttempt || 1,
            alterationCount: trial.alterationCount != null ? trial.alterationCount : (trial.alterations ? trial.alterations.length : 0),
            customerFeedback: trial.customerFeedback,
            customerRating: trial.customerRating,
            fitPreference: trial.fitPreference,
            fitCheckpoints: JSON.stringify(trial.fitCheckpoints || {}),
            alterations: (trial.alterations || []).map(a => ({
              id: a.dbId,
              description: a.desc,
              category: a.category,
              completed: a.checked,
              assignedTailor: a.assignedTailor,
              priority: a.priority,
              targetDate: (a.targetDate && typeof a.targetDate === 'string' && a.targetDate.trim().length > 0) ? a.targetDate.trim() : null,
              tailorNotes: a.tailorNotes || ''
            }))
          });
          await loadTrialsFromApi();
          if (trial.id) window.selectTrial(trial.id);
        }
      } catch (err) {
        console.warn('[TrialsAlterations] Failed to persist alterations to backend:', err.message);
      }
    })();

    showToast('Alterations checklist & client feedback saved successfully', 'success');
  };

  // ── Add Alteration Modal ──
  window.openAddAlterationModal = function () {
    document.getElementById('modalAltDesc').value = '';
    document.getElementById('modalAltNotes').value = '';
    const now = new Date();
    now.setDate(now.getDate() + 2);
    const targetDateEl = document.getElementById('modalAltTargetDate');
    if (targetDateEl) targetDateEl.value = now.toISOString().split('T')[0];

    openModal('addAlterationModal');
  };

  window.submitAddAlteration = async function () {
    const desc = document.getElementById('modalAltDesc').value.trim();
    const cat = document.getElementById('modalAltCat').value;
    const priority = document.getElementById('modalAltPriority').value;
    const tailor = document.getElementById('modalAltTailor').value;
    const targetDate = document.getElementById('modalAltTargetDate').value;
    const notes = document.getElementById('modalAltNotes').value.trim();

    if (!desc) {
      showToast('Please enter alteration description', 'warn');
      return;
    }

    const trial = getActiveTrial();
    if (!trial) return;

    try {
      const { default: api } = await import('../api.js');
      const itemData = {
        description: desc,
        category: cat,
        priority: priority || 'Normal',
        assignedTailor: tailor || (trial.designer && trial.designer !== '—' ? trial.designer : 'Master Tailor'),
        targetDate: (targetDate && targetDate.trim()) ? targetDate.trim() : null,
        tailorNotes: notes,
        completed: false
      };

      if (trial.id) {
        await api.trials.addAlteration(trial.id, itemData);
        await loadTrialsFromApi();
        if (trial.id) window.selectTrial(trial.id);
      } else {
        const newAlt = {
          id: `ALT-${Date.now()}`,
          dbId: null,
          desc: desc,
          category: cat,
          priority: priority || 'Normal',
          assignedTailor: tailor || 'Master Tailor',
          targetDate: targetDate || '',
          tailorNotes: notes,
          checked: false
        };
        trial.alterations = trial.alterations || [];
        trial.alterations.push(newAlt);
        trial.alterationCount = trial.alterations.length;
        renderAlterationsChecklist(trial);
        renderTrialDetails();
        updateKPIs();
      }

      closeModal('addAlterationModal');
      showToast(`Added alteration ticket`, 'success');
    } catch (err) {
      showToast('Failed to add alteration: ' + err.message, 'warn');
    }
  };

  // ── Advance to QC ──
  window.handleAdvanceToQC = async function () {
    const trial = getActiveTrial();
    if (!trial) return;

    try {
      const { default: api } = await import('../api.js');
      showToast('Advancing order to Quality Check (QC)...', 'info');
      const authUser = window.Auth?.getUser?.();
      const staffName = authUser?.fullName || authUser?.username || 'Staff';
      await api.trials.completeAndAdvance(trial.id, staffName);

      trial.trial.status = 'Completed';
      trial.trial.fitStatus = 'perfect';
      trial.history.unshift({
        action: `Passed Fitting (Attempt #${trial.trialAttempt || 1}) — Advanced to Quality Check (QC)`,
        time: 'Just now',
        staff: staffName
      });

      await loadTrialsFromApi();
      if (trial.id) window.selectTrial(trial.id);
      updateKPIs();
      showToast(`Order ${trial.orderId} verified & advanced to Quality Check (QC)!`, 'success');
    } catch (err) {
      showToast('Failed to advance order to QC: ' + err.message, 'warn');
    }
  };

  // ── Schedule Re-trial Modal ──
  window.openScheduleRetrialModal = function () {
    const trial = getActiveTrial();
    document.getElementById('modalRetrialNotes').value = '';
    const now = new Date();
    now.setDate(now.getDate() + 3);
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = '11:00';
    const dateInput = document.getElementById('modalRetrialDate');
    const timeInput = document.getElementById('modalRetrialTime');
    if (dateInput) dateInput.value = todayStr;
    if (timeInput) timeInput.value = timeStr;
    openModal('scheduleRetrialModal');
  };

  window.submitScheduleRetrial = async function () {
    const date = document.getElementById('modalRetrialDate').value;
    const time = document.getElementById('modalRetrialTime').value;
    const staff = document.getElementById('modalRetrialStaff').value;
    const notes = document.getElementById('modalRetrialNotes').value;

    const trial = getActiveTrial();
    if (!trial) return;

    try {
      const { default: api } = await import('../api.js');
      const resp = await api.trials.scheduleRetrial(trial.id, {
        trialDate: date,
        trialTime: time,
        designerName: staff,
        notes: notes
      });

      closeModal('scheduleRetrialModal');
      await loadTrialsFromApi();
      if (trial.id) window.selectTrial(trial.id);
      updateKPIs();
      showToast(`Re-trial (Attempt #${resp?.trialAttempt || ((trial.trialAttempt || 1) + 1)}) scheduled for ${date}`, 'success');
    } catch (err) {
      showToast('Failed to schedule re-trial: ' + err.message, 'warn');
    }
  };

  // ── Order Picker Modal Logic ──
  window.openOrderPickerModal = async function () {
    openModal('selectOrderModal');
    const container = document.getElementById('orderPickerListContainer');
    if (container) {
      container.innerHTML = `
        <div style="padding: 28px; text-align: center; color: rgba(255,255,255,0.5); font-size: 13px;">
          <div>Loading customer orders from database...</div>
        </div>
      `;
    }

    try {
      const { default: api } = await import('../api.js');
      const orders = await api.trials.ordersForTrial().catch(() => []);
      AVAILABLE_ORDERS = Array.isArray(orders) ? orders : [];
      renderOrderPickerList(AVAILABLE_ORDERS);
    } catch (err) {
      if (container) {
        container.innerHTML = `<div style="padding:20px;text-align:center;color:#ef4444;">Failed to load orders: ${err.message}</div>`;
      }
    }
  };
  window.openSelectOrderModal = window.openOrderPickerModal;

  let orderPickerSearchTimer = null;
  window.handleOrderPickerSearch = function (e) {
    const q = (e.target.value || '').toLowerCase().trim();
    if (!q) {
      renderOrderPickerList(AVAILABLE_ORDERS);
      return;
    }
    const filtered = AVAILABLE_ORDERS.filter(o => {
      return (o.orderCode || '').toLowerCase().includes(q) ||
             (o.customerName || '').toLowerCase().includes(q) ||
             (o.customerMobile || '').toLowerCase().includes(q) ||
             (o.garmentType || '').toLowerCase().includes(q) ||
             (o.currentStage || '').toLowerCase().includes(q);
    });
    renderOrderPickerList(filtered);

    clearTimeout(orderPickerSearchTimer);
    orderPickerSearchTimer = setTimeout(async () => {
      try {
        const { default: api } = await import('../api.js');
        const serverOrders = await api.trials.ordersForTrial({ search: q }).catch(() => []);
        if (Array.isArray(serverOrders) && serverOrders.length > 0) {
          renderOrderPickerList(serverOrders);
        }
      } catch (_) {}
    }, 300);
  };

  function renderOrderPickerList(orders) {
    const container = document.getElementById('orderPickerListContainer');
    if (!container) return;

    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div style="padding: 32px; text-align: center; color: rgba(255,255,255,0.45); font-size: 13px;">
          No matching customer orders found.
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(o => {
      const trialCount = o.trialCount || 0;
      const isNew = trialCount === 0;
      return `
        <div class="order-picker-card" onclick="window.selectOrderForTrial('${o.id}')">
          <div class="order-picker-card-left">
            <div class="order-picker-code-row">
              <span class="order-picker-code">${o.orderCode}</span>
              <span class="order-picker-stage-pill">${o.currentStage || 'PRODUCTION'}</span>
            </div>
            <div class="order-picker-cust-name">${o.customerName || 'Customer'} &bull; ${o.customerMobile || '—'}</div>
            <div class="order-picker-garment-meta">${o.garmentType || 'Garment'} ${o.collection ? `(${o.collection})` : ''} &bull; Delivery: ${o.deliveryDate || '—'}</div>
          </div>
          <div class="order-picker-card-right">
            <span class="order-picker-trial-count ${isNew ? 'new-trial' : 'has-trials'}">
              ${isNew ? '⚡ New (0 Trials)' : `🎯 ${trialCount} Trial${trialCount > 1 ? 's' : ''} on record`}
            </span>
            <button type="button" class="btn-open-order-trial" onclick="event.stopPropagation(); window.selectOrderForTrial('${o.id}')">
              ${isNew ? 'Start First Trial &rarr;' : 'Open / Log Fitting &rarr;'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: container });
    }
  }

  window.selectOrderForTrial = async function (orderId) {
    try {
      showToast('Opening trial fitting session...', 'info');
      const { default: api } = await import('../api.js');
      const trialResp = await api.trials.createFromOrder(orderId);
      closeModal('selectOrderModal');

      await loadTrialsFromApi();
      if (trialResp && trialResp.id) {
        window.selectTrial(trialResp.id);
      }
      showToast(`Trial fitting session loaded for ${trialResp?.orderCode || 'order'}`, 'success');
    } catch (err) {
      showToast('Error opening trial for order: ' + err.message, 'warn');
    }
  };

  // ── Notify Customer Modal ──
  window.openNotifyModal = function () {
    const trial = getActiveTrial();
    const recipientInput = document.getElementById('notifyRecipient');
    if (recipientInput) recipientInput.value = trial.customer.phone;

    const messageText = document.getElementById('notifyMessageText');
    if (messageText) {
      const coName = (typeof CompanyBridge !== 'undefined' ? CompanyBridge.get().companyName : null) || 'our boutique';
      messageText.value = `Dear ${trial.customer.name}, your dress trial for order ${trial.orderId} (${trial.garment.type}) is scheduled on ${trial.trial.date} at ${trial.trial.time} at ${coName}. We look forward to fitting you!`;
    }

    openModal('notifyCustomerModal');
  };

  window.selectNotifyChannel = function (channel) {
    state.notifyChannel = channel;
    const trial = getActiveTrial();
    document.querySelectorAll('.channel-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-channel') === channel);
    });

    const recipientInput = document.getElementById('notifyRecipient');
    if (recipientInput) {
      recipientInput.value = channel === 'email' ? trial.customer.email : trial.customer.phone;
    }
  };

  window.submitNotification = function () {
    const trial = getActiveTrial();
    const recipient = document.getElementById('notifyRecipient')?.value || trial?.customer?.phone || '';
    const message = document.getElementById('notifyMessageText')?.value || '';

    closeModal('notifyCustomerModal');

    if (state.notifyChannel === 'whatsapp') {
      let cleanPhone = recipient.replace(/[^0-9]/g, '');
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
      if (cleanPhone) {
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        showToast(`Opened WhatsApp chat for ${trial.customer.name}`, 'success');
        return;
      }
    }
    showToast(`Notification queued for ${trial.customer.name} via ${state.notifyChannel.toUpperCase()}`, 'success');
  };

  // ── Print Trial Slip ──
  window.handlePrintTrialSlip = function () {
    const trial = getActiveTrial();

    document.getElementById('printSlipOrder').textContent = trial.orderId;
    document.getElementById('printSlipDate').textContent = trial.trial.date;
    document.getElementById('printSlipCustomer').textContent = trial.customer.name;
    document.getElementById('printSlipPhone').textContent = trial.customer.phone;
    document.getElementById('printSlipGarment').textContent = trial.garment.type;
    document.getElementById('printSlipDesigner').textContent = trial.designer;

    const fitLabels = {
      'perfect': 'Perfect Fit (No changes)',
      'minor': 'Minor Alterations (Adjustments)',
      'major': 'Major Alterations (Significant changes)',
      'retrial': 'Re-trial Required'
    };
    document.getElementById('printSlipFit').textContent = fitLabels[trial.trial.fitStatus] || 'Perfect Fit';
    document.getElementById('printSlipDelivery').textContent = trial.deliveryDate || '—';

    const printAttemptEl = document.getElementById('printSlipAttempt');
    if (printAttemptEl) {
      const att = trial.trialAttempt || 1;
      printAttemptEl.textContent = `Attempt #${att} ${att > 1 ? `(Re-trial ×${att - 1})` : '(First Trial)'}`;
    }
    const printRoundEl = document.getElementById('printSlipRound');
    if (printRoundEl) {
      const rnd = trial.alterationCount != null ? trial.alterationCount : (trial.alterations ? trial.alterations.length : 0);
      printRoundEl.textContent = `Round ${rnd}`;
    }

    const listEl = document.getElementById('printSlipAlterationsList');
    if (trial.alterations && trial.alterations.length) {
      listEl.innerHTML = trial.alterations.map(a => `<li>[${a.category || 'General'}] ${a.desc} ${a.assignedTailor ? `(Tailor: ${a.assignedTailor})` : ''} ${a.checked ? '— [COMPLETED]' : '— [PENDING]'}</li>`).join('');
    } else {
      listEl.innerHTML = `<li>No alterations requested - verified fit.</li>`;
    }

    const notesEl = document.getElementById('printSlipNotes');
    notesEl.textContent = trial.customerFeedback ? `Client feedback: "${trial.customerFeedback}"\n${trial.additionalNotes || ''}` : (trial.additionalNotes || '—');

    openModal('printSlipModal');
  };

  // ── Full Measurements Modal ──
  window.openFullMeasurementsModal = function () {
    const trial = getActiveTrial();
    const title = document.getElementById('fullMeasCustomerTitle');
    if (title) title.textContent = `Full Measurements — ${trial.customer.name} (${trial.orderId})`;

    const tbody = document.getElementById('fullMeasTableBody');
    if (tbody) {
      if (trial.fullMeasurements && trial.fullMeasurements.length) {
        tbody.innerHTML = trial.fullMeasurements.map(m => `
          <tr>
            <td><strong>${m.point}</strong></td>
            <td>${m.standard}</td>
            <td>${m.current}</td>
            <td style="color:var(--lime);">${m.target}</td>
            <td style="color:rgba(255,255,255,0.45);">${m.tolerance}</td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center;padding:16px;color:rgba(255,255,255,0.45);">No detailed measurement logs recorded for this garment.</td>
          </tr>
        `;
      }
    }

    openModal('fullMeasurementsModal');
  };

  // ── Mark as Completed ──
  window.handleMarkCompletedClick = function () {
    const trial = getActiveTrial();
    document.getElementById('completeCustomerName').textContent = trial.customer.name;
    document.getElementById('completeOrderNum').textContent = trial.orderId;
    openModal('markCompletedModal');
  };
  window.openMarkCompletedModal = window.handleMarkCompletedClick;

  window.confirmMarkCompleted = async function () {
    const trial = getActiveTrial();
    if (!trial) return;

    try {
      const { default: api } = await import('../api.js');
      showToast('Marking trial as completed and advancing order to QC...', 'info');
      const authUser = window.Auth?.getUser?.();
      const staffName = authUser?.fullName || authUser?.username || 'Boutique Manager';
      await api.trials.completeAndAdvance(trial.id, staffName);

      trial.trial.status = 'Completed';
      trial.trial.fitStatus = 'perfect';

      trial.history.unshift({
        action: 'Trial Session Marked as Completed (Fit Approved & Advanced to QC)',
        time: 'Just now',
        staff: staffName
      });

      closeModal('markCompletedModal');
      await loadTrialsFromApi();
      if (trial.id) window.selectTrial(trial.id);
      updateKPIs();
      showToast(`Order ${trial.orderId} marked as Completed & advanced to QC!`, 'success');
    } catch (err) {
      showToast('Failed to complete trial: ' + err.message, 'warn');
    }
  };

  // ── Lightbox Gallery ──
  window.openLightbox = function (index) {
    const trial = getActiveTrial();
    state.lightboxIndex = index;
    updateLightbox();
    const overlay = document.getElementById('lightboxOverlay');
    if (overlay) overlay.classList.add('open');
  };

  window.closeLightbox = function () {
    const overlay = document.getElementById('lightboxOverlay');
    if (overlay) overlay.classList.remove('open');
  };

  window.prevLightboxImage = function () {
    const trial = getActiveTrial();
    if (!trial.references || !trial.references.length) return;
    if (state.lightboxIndex > 0) {
      state.lightboxIndex--;
    } else {
      state.lightboxIndex = trial.references.length - 1;
    }
    updateLightbox();
  };

  window.nextLightboxImage = function () {
    const trial = getActiveTrial();
    if (!trial.references || !trial.references.length) return;
    if (state.lightboxIndex < trial.references.length - 1) {
      state.lightboxIndex++;
    } else {
      state.lightboxIndex = 0;
    }
    updateLightbox();
  };

  function updateLightbox() {
    const trial = getActiveTrial();
    const img = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    const refs = trial?.references || [];
    if (img && refs[state.lightboxIndex]) {
      img.src = refs[state.lightboxIndex];
    } else if (img) {
      img.src = '';
    }
    if (counter) {
      counter.textContent = refs.length > 0 ? `${state.lightboxIndex + 1} / ${refs.length}` : '—';
    }
  }

  // ── Upload Image Handler ──
  window.triggerImageUpload = function () {
    const input = document.getElementById('imageUploadInput');
    if (input) input.click();
  };

  window.handleImageUpload = function (event) {
    const files = event.target.files;
    if (!files || !files.length) return;

    const trial = getActiveTrial();
    for (let i = 0; i < files.length; i++) {
      const url = URL.createObjectURL(files[i]);
      trial.references.push(url);
    }

    renderDesignGallery(trial);
    showToast(`${files.length} image(s) uploaded`, 'success');
  };

  // ── Update KPIs Count (Live DB & Dynamic Count) ──
  async function updateKPIs() {
    let upcoming = 0;
    let today = 0;
    let pendingAlts = 0;
    let retrials = 0;
    let readyDelivery = 0;
    let fromBackend = false;

    try {
      const { default: api } = await import('../api.js');
      const kpis = await api.trials.kpis().catch(() => null);
      if (kpis) {
        upcoming = kpis.upcoming != null ? kpis.upcoming : 0;
        today = kpis.today != null ? kpis.today : 0;
        retrials = kpis.retrialsRequired != null ? kpis.retrialsRequired : (kpis.retrial != null ? kpis.retrial : 0);
        pendingAlts = kpis.pendingAlterations != null ? kpis.pendingAlterations : 0;
        readyDelivery = kpis.completed != null ? kpis.completed : 0;
        fromBackend = true;
      }
    } catch (err) {
      console.warn('[TrialsAlterations] KPI fetch error:', err.message);
    }

    // Dynamic fallbacks only if backend call failed
    if (!fromBackend) {
      if (upcoming === 0 && TRIALS_DATA.length > 0) {
        upcoming = TRIALS_DATA.filter(t => (t.trial.status || '').toLowerCase() === 'upcoming' || (t.trial.status || '').toLowerCase() === 'scheduled').length;
      }
      if (today === 0 && TRIALS_DATA.length > 0) {
        today = TRIALS_DATA.filter(t => (t.trial.status || '').toLowerCase() === 'today').length;
      }
      pendingAlts = TRIALS_DATA.reduce((acc, t) => acc + (t.alterations || []).filter(a => !a.checked).length, 0);
      if (retrials === 0 && TRIALS_DATA.length > 0) {
        retrials = TRIALS_DATA.filter(t => (t.trial.status || '').toLowerCase().includes('retrial') || t.trial.fitStatus === 'retrial' || (t.trialAttempt || 1) > 1).length;
      }
      if (readyDelivery === 0 && TRIALS_DATA.length > 0) {
        readyDelivery = TRIALS_DATA.filter(t => (t.trial.status || '').toLowerCase() === 'completed' || t.trial.fitStatus === 'perfect').length;
      }
    }

    // Bind values and meaningful subtexts
    const elUpcoming = document.getElementById('kpiValUpcoming');
    if (elUpcoming) elUpcoming.textContent = upcoming;
    const subUpcoming = document.getElementById('kpiSubUpcoming');
    if (subUpcoming) subUpcoming.textContent = `${upcoming} scheduled`;

    const elToday = document.getElementById('kpiValToday');
    if (elToday) elToday.textContent = today;
    const subToday = document.getElementById('kpiSubToday');
    if (subToday) subToday.textContent = `${today} active today`;

    const elAlterations = document.getElementById('kpiValAlterations');
    if (elAlterations) elAlterations.textContent = pendingAlts;
    const subAlterations = document.getElementById('kpiSubAlterations');
    if (subAlterations) subAlterations.textContent = `${pendingAlts} in progress`;

    const elRetrials = document.getElementById('kpiValRetrials');
    if (elRetrials) elRetrials.textContent = retrials;
    const subRetrials = document.getElementById('kpiSubRetrials');
    if (subRetrials) subRetrials.textContent = retrials > 0 ? `${retrials} requested` : 'Follow-up sessions';

    const elDelivery = document.getElementById('kpiValDelivery');
    if (elDelivery) elDelivery.textContent = readyDelivery;
    const subDelivery = document.getElementById('kpiSubDelivery');
    if (subDelivery) subDelivery.textContent = `${readyDelivery} ready for pickup`;
  }

  // ── Modal Utilities ──
  window.openModal = function (modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add('open');
  };

  window.closeModal = function (modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('open');
  };

  // ── Toast Notifications & NotificationCenter Integration ──
  function showToast(message, type = 'info') {
    if (window.NotificationCenter && typeof window.NotificationCenter.toast === 'function') {
      const sevMap = { error: 'danger', danger: 'danger', warn: 'warn', warning: 'warn', success: 'success', info: 'info' };
      const sev = sevMap[type] || 'info';
      window.NotificationCenter.toast({
        title: type === 'success' ? 'Trials & Alterations' : (type === 'warn' ? 'Trial Notice' : 'Trial Update'),
        message: message,
        severity: sev,
        duration: 3800
      });

      // If this is an important lifecycle update, persist as dynamic notification too
      if (type === 'success' && (message.includes('advanced to Quality Check') || message.includes('scheduled for') || message.includes('Completed'))) {
        window.NotificationCenter.push({
          type: 'trials',
          module: 'Trials & Alterations',
          severity: 'success',
          title: message.includes('advanced') ? 'Trial Approved — Advanced to QC' : 'Trial Update',
          message: message,
          silent: true,
          actionUrl: '../trials-alterations/trials-alterations.html'
        });
      }
      return;
    }

    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'warn') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width:16px;height:16px;flex-shrink:0;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: toast });
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(30px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

})();
