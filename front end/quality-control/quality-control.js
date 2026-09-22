/**
 * HAULO BOUTIQUE ERP — Quality Control & Final Inspection Logic
 * Handles Order Selection, Interactive Checklist, Dynamic Donut & KPIs, Filtering, Pagination, and QC Result Saving
 * Path: front end/quality-control/quality-control.js
 */

// Fallback image in case any image fails to load
const FALLBACK_IMG = '../assets/designs/blouse-stage.png';

// Local Garment Images Map
const GARMENT_IMG_MAP = {
  Blouse: '../assets/designs/blouse-stage.png',
  'Bridal Blouse': '../assets/designs/zari-bloom-front.jpg',
  Lehenga: '../assets/designs/lehenga-stage.png',
  'Designer Lehenga': '../assets/designs/lehenga-mannequin.png',
  'Chudi Set': '../assets/designs/chudi-stage.png',
  Chudi: '../assets/designs/chudi-stage.png',
  Saree: '../assets/designs/saree-stage.png',
  'Silk Saree': '../assets/designs/saree-stage.png',
  Gown: '../assets/designs/gown-stage.png',
  default: '../assets/designs/blouse-stage.png'
};

// QC Orders (loaded from API)
let qcOrders = [];
let qcStageImageUrl = '';
let dynamicProductionStages = [];
let dynamicEmployees = [];

function createDefaultChecklist() {
  return {
    stitching: { status: 'Pending', problem: '', severity: 'Major', images: [] },
    measurements: { status: 'Pending', problem: '', severity: 'Major', images: [] },
    fabric: { status: 'Pending', problem: '', severity: 'Major', images: [] },
    finishing: { status: 'Pending', problem: '', severity: 'Major', images: [] },
    accessories: { status: 'Pending', problem: '', severity: 'Major', images: [] },
    overall: { status: 'Pending', problem: '', severity: 'Major', images: [] }
  };
}

function ensureOrderChecklist(order) {
  if (!order) return;
  if (!order.checklist) {
    order.checklist = createDefaultChecklist();
    return;
  }
  const defaultKeys = ['stitching', 'measurements', 'fabric', 'finishing', 'accessories', 'overall'];
  defaultKeys.forEach(key => {
    const item = order.checklist[key];
    if (!item) {
      order.checklist[key] = { status: 'Pending', problem: '', severity: 'Major', images: [] };
    } else if (typeof item === 'string') {
      order.checklist[key] = { status: item, problem: '', severity: 'Major', images: [] };
    } else {
      if (!item.status) item.status = 'Pending';
      if (item.problem === undefined) item.problem = '';
      if (!item.severity) item.severity = 'Major';
      if (!Array.isArray(item.images)) item.images = [];
    }
  });
}

/**
 * Load dynamic stage definitions from DB via api.production.stageDefinitions.list()
 * If user creates new stages in the production board, they appear automatically in rework dropdown.
 */
async function loadDynamicReworkStages() {
  try {
    const { default: api } = await import('../api.js');
    if (!api?.production?.stageDefinitions?.list) return;

    const stages = await api.production.stageDefinitions.list({ activeOnly: true }).catch(() => []);
    const stageList = Array.isArray(stages) ? stages : (stages?.content || []);

    // Filter out stages that are not rework targets (QC, READY, DELIVERED)
    dynamicProductionStages = stageList
      .filter(s => {
        const k = (s.stageKey || '').toUpperCase().trim();
        return k !== 'QC' && k !== 'READY' && k !== 'COMPLETED' && k !== 'DELIVERED';
      })
      .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  } catch (err) {
    console.warn('[QC] Could not load dynamic rework stages:', err);
  }
}

/**
 * Helper to turn SCREAMING_SNAKE_CASE into Title Case
 */
function formatStageTitle(key) {
  if (!key) return '';
  return key.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Load the selected order's actual production stages dynamically from the database (production_stages table)
 * according to user order data.
 */
async function loadOrderProductionStages(order) {
  if (!order) return;

  const stageSelect = document.getElementById('reworkTargetStage');
  if (!stageSelect) return;

  // Initialize stage map on order: maps stageKey/stageName -> assigned employee info & status
  if (!order.stageAssigneeMap) order.stageAssigneeMap = {};
  if (!order.productionStagesList) order.productionStagesList = [];

  // If order has an orderId, fetch its actual production stages from backend
  if (order.orderId) {
    try {
      const { default: api } = await import('../api.js');
      if (api?.production?.getByOrder) {
        const orderStages = await api.production.getByOrder(order.orderId).catch(() => []);
        if (Array.isArray(orderStages) && orderStages.length > 0) {
          order.productionStagesList = orderStages;
          orderStages.forEach(s => {
            const rawKey = (s.stageName || '').toUpperCase().trim();
            if (rawKey) {
              order.stageAssigneeMap[rawKey] = s.assignedTo || null;
            }
          });
        }
      }
    } catch (err) {
      console.warn('[QC] Could not fetch order production stages:', err);
    }
  }

  // Filter out QC, READY, COMPLETED, DELIVERED stages from rework candidates
  const isExcluded = (k) => {
    const norm = (k || '').toUpperCase().trim();
    return norm === 'QC' || norm === 'QUALITY' || norm === 'QUALITY_CONTROL' ||
           norm === 'READY' || norm === 'COMPLETED' || norm === 'DELIVERED';
  };

  const garmentStages = (order.productionStagesList || [])
    .filter(s => !isExcluded(s.stageName))
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

  // Build stage options
  let html = '<option value="">-- Choose Stage to Rework --</option>';
  const garmentStageKeys = new Set();

  if (garmentStages.length > 0) {
    html += '<optgroup label="This Garment\'s Production Stages">';
    garmentStages.forEach(s => {
      const key = (s.stageName || '').toUpperCase().trim();
      garmentStageKeys.add(key);

      // Match displayName from blueprint if available, or format title
      const def = dynamicProductionStages.find(d => (d.stageKey || '').toUpperCase().trim() === key);
      const displayName = def?.displayName || formatStageTitle(key);

      let extraInfo = '';
      if (s.assignedTo?.name) {
        extraInfo = ` — Assigned: ${s.assignedTo.name}`;
      } else if (s.status && s.status !== 'NOT_STARTED') {
        extraInfo = ` (${s.status.replace(/_/g, ' ')})`;
      }

      html += `<option value="${key}">${displayName}${extraInfo}</option>`;
    });
    html += '</optgroup>';
  }

  // Additional active production stages (blueprints) that were not in this garment's pipeline
  const otherStages = dynamicProductionStages.filter(d => {
    const key = (d.stageKey || d.id || '').toUpperCase().trim();
    return !isExcluded(key) && !garmentStageKeys.has(key);
  });

  if (otherStages.length > 0) {
    const groupLabel = garmentStages.length > 0 ? 'Other Available Production Stages' : 'Production Stages';
    html += `<optgroup label="${groupLabel}">`;
    otherStages.forEach(d => {
      const key = d.stageKey || d.id;
      const name = d.displayName || formatStageTitle(key);
      html += `<option value="${key}">${name} (${key})</option>`;
    });
    html += '</optgroup>';
  }

  const previousVal = stageSelect.value;
  stageSelect.innerHTML = html;

  // Restore current selection if valid for this order
  const targetToSelect = order.reworkStage || previousVal;
  if (targetToSelect && Array.from(stageSelect.options).some(o => o.value === targetToSelect)) {
    stageSelect.value = targetToSelect;
    order.reworkStage = targetToSelect;
  } else if (!order.reworkStage) {
    stageSelect.value = '';
  }

  // Now update the employee dropdown for the currently selected stage
  const selectedStage = stageSelect.value;
  const previousWorker = order.stageAssigneeMap?.[(selectedStage || '').toUpperCase().trim()];
  const preselectId = order.reworkAssigneeId || previousWorker?.id || '';
  updateReworkAssigneeDropdown(selectedStage, preselectId, order);
}

/**
 * Extract department and specific title/role from employee record
 */
function getEmpDepartmentAndRole(emp) {
  let dept = '';
  let title = emp.role || 'Staff';
  if (emp.notes) {
    try {
      const parsed = typeof emp.notes === 'string' ? JSON.parse(emp.notes) : emp.notes;
      if (parsed.department) dept = parsed.department;
      if (parsed.role) title = parsed.role;
    } catch (_) {}
  }
  return { dept, title };
}

/**
 * Check if employee is matched to a specific production stage
 */
function isEmployeeForStage(emp, stageDef, stageKey, order = null) {
  if (!stageDef && !stageKey) return false;
  const sKey = (stageKey || stageDef?.stageKey || '').toUpperCase().trim();
  const sName = (stageDef?.displayName || '').toUpperCase().trim();
  const reqRole = (stageDef?.requiredRole || '').toUpperCase().trim();
  const deptLabel = (stageDef?.deptLabel || '').toUpperCase().trim();

  // 0. Previous worker on this order's stage always matches!
  if (order?.stageAssigneeMap?.[sKey]?.id === emp.id) return true;

  const { dept, title } = getEmpDepartmentAndRole(emp);
  const empRole = (emp.role || '').toUpperCase().trim();
  const empDept = dept.toUpperCase().trim();

  // 1. Pinned employee explicitly linked to this stage definition in DB
  if (stageDef?.pinnedEmployees?.some(p => p.id === emp.id)) return true;

  // 2. Exact match on requiredRole
  if (reqRole && empRole === reqRole) return true;

  // 3. Exact match on deptLabel
  if (deptLabel && (empDept === deptLabel || empRole === deptLabel)) return true;

  // 4. Keyword matches for standard boutique workflows
  if (sKey.includes('STITCH') || sName.includes('STITCH')) {
    if (empRole === 'TAILOR' || empDept.includes('STITCH') || title.toLowerCase().includes('tailor')) return true;
  }
  if (sKey.includes('CUT') || sName.includes('CUT')) {
    if (empRole === 'CUTTER' || empDept.includes('CUT') || title.toLowerCase().includes('cutter')) return true;
  }
  if (sKey.includes('HAND') || sKey.includes('EMBROID') || sName.includes('HAND') || sName.includes('EMBROID') || sName.includes('MAGGAM') || sName.includes('ZARI')) {
    if (empRole === 'EMBROIDERER' || empDept.includes('EMBROID') || title.toLowerCase().includes('artisan') || title.toLowerCase().includes('embroidery')) return true;
  }
  if (sKey.includes('FINISH') || sKey.includes('PRESS') || sName.includes('FINISH')) {
    if (empRole === 'FINISHER' || empDept.includes('FINISH') || title.toLowerCase().includes('finishing') || title.toLowerCase().includes('pressing')) return true;
  }
  if (sKey.includes('LINING') || sName.includes('LINING')) {
    if (empRole === 'FINISHER' || empRole === 'TAILOR' || empRole === 'CUTTER') return true;
  }
  if (sKey.includes('DESIGN') || sName.includes('DESIGN')) {
    if (empRole === 'DESIGNER' || empDept.includes('DESIGN') || title.toLowerCase().includes('designer') || title.toLowerCase().includes('stylist')) return true;
  }
  if (sKey.includes('TRIAL') || sKey.includes('FIT') || sName.includes('TRIAL') || sName.includes('FIT')) {
    if (empRole === 'TAILOR' || empRole === 'SUPERVISOR' || empRole === 'MANAGER') return true;
  }

  return false;
}

/**
 * Dynamically filter and populate the Assignee dropdown based strictly on the selected rework stage
 */
function updateReworkAssigneeDropdown(stageKey, preselectedEmpId = '', orderContext = null) {
  const assigneeSelect = document.getElementById('reworkAssignee');
  const labelHint = document.getElementById('reworkAssigneeHint');
  if (!assigneeSelect) return;

  if (!stageKey) {
    assigneeSelect.innerHTML = '<option value="">-- Select Stage First to View Employees --</option>';
    assigneeSelect.disabled = true;
    if (labelHint) labelHint.textContent = '(Select stage first)';
    return;
  }

  assigneeSelect.disabled = false;

  const order = orderContext || qcOrders.find(o => o.id === currentSelectedOrderId);
  const normStageKey = (stageKey || '').toUpperCase().trim();

  const stageDef = dynamicProductionStages.find(s =>
    (s.stageKey || s.id || '').toUpperCase().trim() === normStageKey ||
    (s.displayName && s.displayName.toUpperCase().trim() === normStageKey)
  );

  const stageDisplayName = stageDef?.displayName || formatStageTitle(stageKey);

  // Check if a worker previously worked on this stage for this specific order
  const prevWorker = order?.stageAssigneeMap?.[normStageKey];
  const prevWorkerId = prevWorker?.id || '';

  // Filter employees strictly for this stage
  const matched = dynamicEmployees.filter(e => isEmployeeForStage(e, stageDef, stageKey, order));

  let finalPreselect = preselectedEmpId || prevWorkerId;

  if (labelHint) {
    if (prevWorker?.name) {
      labelHint.textContent = `(Original worker auto-selected: ${prevWorker.name})`;
    } else {
      labelHint.textContent = `(${matched.length} specialist${matched.length === 1 ? '' : 's'} for ${stageDisplayName})`;
    }
  }

  let html = `<option value="">-- Choose Employee for ${stageDisplayName} (${matched.length} Available) --</option>`;

  // 1. If this order has a previous worker for this stage, place them at the very top with special highlight
  const addedIds = new Set();
  if (prevWorker && prevWorker.id) {
    const prevEmpRecord = dynamicEmployees.find(e => e.id === prevWorker.id);
    const { title } = prevEmpRecord ? getEmpDepartmentAndRole(prevEmpRecord) : { title: prevWorker.role || 'Specialist' };
    const empName = prevEmpRecord ? prevEmpRecord.name : prevWorker.name;
    html += `<option value="${prevWorker.id}">★ Worked on this Order: ${empName} (${title})</option>`;
    addedIds.add(prevWorker.id);
  }

  // 2. List all other matched employees for this stage
  if (matched.length > 0) {
    matched.forEach(e => {
      if (addedIds.has(e.id)) return;
      const { title } = getEmpDepartmentAndRole(e);
      const isPinned = stageDef?.pinnedEmployees?.some(p => p.id === e.id);
      const prefix = isPinned ? '★ ' : '';
      html += `<option value="${e.id}">${prefix}${e.name} (${title || e.role})</option>`;
      addedIds.add(e.id);
    });
  }

  // 3. Fallback if no matching specialists found for custom stage
  if (addedIds.size === 0) {
    html += `<option value="" disabled>No dedicated specialists found for ${stageDisplayName}</option>`;
    dynamicEmployees.forEach(e => {
      const { title } = getEmpDepartmentAndRole(e);
      html += `<option value="${e.id}">${e.name} (${title || e.role})</option>`;
    });
  }

  assigneeSelect.innerHTML = html;

  // Auto-select
  if (finalPreselect && (addedIds.has(finalPreselect) || dynamicEmployees.some(e => e.id === finalPreselect))) {
    assigneeSelect.value = finalPreselect;
    if (order) order.reworkAssigneeId = finalPreselect;
  } else {
    assigneeSelect.value = '';
    if (order) order.reworkAssigneeId = '';
  }
}

/**
 * Load active staff/tailors to assign for rework
 */
async function loadReworkAssignees() {
  try {
    const { default: api } = await import('../api.js');
    if (!api?.employees?.list) return;

    const emps = await api.employees.list({ status: 'ACTIVE' }).catch(() => []);
    dynamicEmployees = Array.isArray(emps) ? emps : (emps?.content || []);

    const stageSelect = document.getElementById('reworkTargetStage');
    const currentStageKey = stageSelect ? stageSelect.value : '';
    const currentAssigneeVal = document.getElementById('reworkAssignee')?.value || '';
    updateReworkAssigneeDropdown(currentStageKey, currentAssigneeVal);
  } catch (err) {
    console.warn('[QC] Could not load rework assignees:', err);
  }
}

function formatStageImgUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const clean = url.replace(/^\/?front\s*end\//i, '').replace(/^\/+/, '');
  const origin = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ? window.location.origin
    : '';
  return origin ? `${origin}/front%20end/${clean}` : `/${clean}`;
}

async function loadQcOrdersFromApi() {
  try {
    const { default: api, Auth } = await import('../api.js');
    if (!Auth.isLoggedIn()) { window.location.href = '../login/login.html'; return; }

    // Dynamically load QC stage artwork from live stage definitions
    try {
      if (api?.production?.stageDefinitions?.list) {
        const stageDefs = await api.production.stageDefinitions.list();
        if (Array.isArray(stageDefs) && stageDefs.length > 0) {
          const qcDef = stageDefs.find(s => s.stageKey === 'QC' || (s.displayName && s.displayName.toUpperCase().includes('QC')));
          if (qcDef?.imageUrl) {
            qcStageImageUrl = formatStageImgUrl(qcDef.imageUrl);
          }
        }
      }
    } catch (stgErr) {
      console.warn('[QC] Could not load dynamic stage artwork:', stgErr.message);
    }

    const res = await api.orders.list({ page: 0, size: 200 }).catch(() => null);
    const items = Array.isArray(res) ? res : (res?.content || []);
    qcOrders = items
      .filter(o => {
        const stg = String(o.currentStage || o.stage || '').toUpperCase().trim();
        const sts = String(o.status || '').toUpperCase().trim();
        return stg === 'QC' || stg === 'QUALITY' || stg === 'QUALITY_CONTROL' || sts === 'QC' ||
               stg === 'READY' || sts === 'READY' ||
               stg === 'READY_TO_DELIVER' || sts === 'READY_TO_DELIVER';
      })
      .map(o => {
        const stg = String(o.currentStage || o.stage || '').toUpperCase().trim();
        const sts = String(o.status || '').toUpperCase().trim();
        let displayStatus = 'Awaiting QC';
        if (sts === 'READY' || stg === 'READY' || sts === 'READY_TO_DELIVER' || stg === 'READY_TO_DELIVER') {
          displayStatus = 'Ready for Delivery';
        } else if (o.qcStatus) {
          displayStatus = o.qcStatus;
        }

        const rawDueDate = o.dueDate || o.expectedDeliveryDate || o.deliveryDate || '';
        let formattedDue = rawDueDate;
        if (rawDueDate && rawDueDate.includes('-')) {
          try {
            const parts = rawDueDate.split('-');
            if (parts.length === 3) {
              const dt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              if (!isNaN(dt.getTime())) {
                formattedDue = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
              }
            }
          } catch (_) {}
        }

        let refImgs = [];
        if (Array.isArray(o.referenceImages)) refImgs = o.referenceImages;
        else if (typeof o.referenceImages === 'string' && o.referenceImages.trim().startsWith('[')) {
          try { refImgs = JSON.parse(o.referenceImages); } catch (_) {}
        }

        const val = Number(o.totalAmount || o.amount) || 0;

        return {
          id: o.orderCode || ('ORD-' + o.id),
          orderId: o.id,                           // backend UUID — needed for transition/fail APIs
          customer: o.customerName || (o.customer?.name) || 'Client',
          garment: o.garmentType || 'Garment',
          collection: o.collection || 'Custom Bespoke',
          stage: (stg === 'READY' || sts === 'READY' || stg === 'READY_TO_DELIVER' || sts === 'READY_TO_DELIVER') ? 'READY' : 'QC',
          dueDate: formattedDue || '—',
          urgency: '',
          status: displayStatus,
          orderValue: '₹' + val.toLocaleString('en-IN'),
          image: (refImgs && refImgs.length > 0) ? refImgs[0] : (GARMENT_IMG_MAP[o.garmentType] || GARMENT_IMG_MAP.default),
          refImages: refImgs,
          customerNotes: o.notes || '',
          checklist: createDefaultChecklist(),
          remarks: o.productionNotes || '',
          qcReworkCount: Number(o.qcReworkCount) || 0,
          reworkStage: '',
          reworkAssigneeId: '',
          reworkPriority: 'NORMAL',
          reworkNotes: '',
          result: 'On Hold',
          inspector: '',
          inspectionDate: ''
        };
      });

    // Populate dynamic rework stages & assignees alongside orders
    await loadDynamicReworkStages();
    await loadReworkAssignees();

    // Auto-select first order if none selected or previous selection gone
    if (qcOrders.length > 0) {
      if (!currentSelectedOrderId || !qcOrders.some(o => o.id === currentSelectedOrderId)) {
        await selectOrder(qcOrders[0].id);
      } else {
        await selectOrder(currentSelectedOrderId);
      }
    } else {
      clearInspectionWorkspace();
    }

    // Dynamically populate inspectors from backend
    try {
      const inspectors = await api.employees.list({ status: 'ACTIVE' }).catch(() => []);
      const empList = Array.isArray(inspectors) ? inspectors : (inspectors?.content || []);
      if (empList.length > 0) {
        const opts = empList.map(e => `<option value="${e.name}">${e.name} (${e.role || 'Inspector'})</option>`).join('');
        const elAssign = document.getElementById('assignedInspector');
        const elNew = document.getElementById('newQcInspector');
        const elFilter = document.getElementById('advFilterInspector');
        if (elAssign) elAssign.innerHTML = '<option value="">Select Inspector...</option>' + opts;
        if (elNew) elNew.innerHTML = '<option value="">Select Inspector...</option>' + opts;
        if (elFilter) elFilter.innerHTML = '<option value="all">All Inspectors</option>' + empList.map(e => `<option value="${e.name}">${e.name}</option>`).join('');
      }
    } catch (empErr) {
      console.warn('[QC] Could not populate employees:', empErr);
    }
  } catch (err) {
    console.warn('[QualityControl] API load error:', err.message);
  } finally {
    renderOrdersTable();
    updateKPISummaries();
  }
}

function clearInspectionWorkspace() {
  currentSelectedOrderId = '';
  const heroImg = document.getElementById('selectedGarmentImg');
  const heroOrderId = document.getElementById('selectedOrderId');
  const heroCustomer = document.getElementById('selectedCustomer');
  const heroGarmentDesc = document.getElementById('selectedGarmentDesc');
  const heroStatusBadge = document.getElementById('selectedStatusBadge');
  const heroDueDate = document.getElementById('selectedDueDate');
  const heroDueUrgency = document.getElementById('selectedDueUrgency');
  const heroOrderValue = document.getElementById('selectedOrderValue');

  if (heroImg) heroImg.src = FALLBACK_IMG;
  if (heroOrderId) heroOrderId.textContent = '—';
  if (heroCustomer) heroCustomer.textContent = 'No Order Selected';
  if (heroGarmentDesc) heroGarmentDesc.textContent = 'Advance an order to QC in Production';
  if (heroStatusBadge) { heroStatusBadge.textContent = '—'; heroStatusBadge.className = 'badge-status yellow'; }
  if (heroDueDate) heroDueDate.textContent = '—';
  if (heroDueUrgency) heroDueUrgency.style.display = 'none';
  if (heroOrderValue) heroOrderValue.textContent = '—';
}

// Active State
let currentSelectedOrderId = '';
let activeFilterTab = 'all';
let searchQuery = '';
let currentPage = 1;
const itemsPerPage = 8;
let activeSubtab = 'checklist';

async function updateKPISummaries() {
  try {
    const { default: api } = await import('../api.js');
    const kpis = await api.qc.kpis().catch(() => null);
    if (!kpis) return;

    const elAwaiting = document.getElementById('kpiAwaitingQC');
    const elInInsp   = document.getElementById('kpiInInspection');
    const elPassed   = document.getElementById('kpiPassedQC');
    const elRework   = document.getElementById('kpiReworkRequired');
    const elReady    = document.getElementById('kpiReadyDelivery');

    if (elAwaiting) elAwaiting.textContent = (kpis.awaitingQc != null ? kpis.awaitingQc : '—');
    if (elInInsp)   elInInsp.textContent   = (kpis.inInspection != null ? kpis.inInspection : '—');
    if (elPassed)   elPassed.textContent   = (kpis.passedQc != null ? kpis.passedQc : '—');
    if (elRework)   elRework.textContent   = (kpis.reworkRequired != null ? kpis.reworkRequired : '—');
    if (elReady)    elReady.textContent    = (kpis.readyForDelivery != null ? kpis.readyForDelivery : '—');

    const elDonutPct = document.getElementById('donutPercentage');
    const elLegPass  = document.getElementById('legPassedCount');
    const elLegRew   = document.getElementById('legReworkCount');
    const elLegPend  = document.getElementById('legPendingCount');

    if (elDonutPct && kpis.passRate != null) elDonutPct.textContent = Math.round(kpis.passRate) + '%';
    if (elLegPass && kpis.passedQc != null) elLegPass.textContent = kpis.passedQc;
    if (elLegRew && kpis.reworkRequired != null) elLegRew.textContent = kpis.reworkRequired;
    if (elLegPend && kpis.awaitingQc != null) elLegPend.textContent = kpis.awaitingQc;
  } catch (e) {
    console.error('[QC] Failed to update KPI summaries:', e.message);
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initSearchShortcuts();
  updateKPISummaries();
  populateNewQcDropdown();
  loadDynamicReworkStages();
  loadReworkAssignees();
  loadQcOrdersFromApi(); // Loads real orders from API, then renders table

  // Create lucide icons if available
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/**
 * Handle Image Loading Errors with Safe Fallback
 */
function handleImgError(img) {
  img.onerror = null;
  img.src = FALLBACK_IMG;
}

/**
 * Global Keyboard Shortcut (⌘K / Ctrl+K)
 */
function initSearchShortcuts() {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      focusSearch();
    }
    if (e.key === 'Escape') {
      closeAllModals();
      closeContextMenu();
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#orderActionMenu') && !e.target.closest('.btn-more-dots') && !e.target.closest('.btn-row-menu')) {
      closeContextMenu();
    }
  });
}

function focusSearch() {
  const searchInput = document.getElementById('globalSearchInput') || document.getElementById('orderSearchInput');
  if (searchInput) {
    searchInput.focus();
    searchInput.select();
  }
}

/**
 * Render Orders Table (Filtered & Paginated)
 */
function renderOrdersTable() {
  const tbody = document.getElementById('qcOrdersTableBody');
  if (!tbody) return;

  const filteredOrders = getFilteredOrders();
  const totalCount = filteredOrders.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIdx = (currentPage - 1) * itemsPerPage;
  const pageOrders = filteredOrders.slice(startIdx, startIdx + itemsPerPage);

  tbody.innerHTML = '';

  if (pageOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 30px; color: rgba(255,255,255,0.4); font-size: 11px;">
          No matching QC orders found.
        </td>
      </tr>
    `;
    updatePaginationControls(0, 0, 0);
    return;
  }

  pageOrders.forEach(order => {
    const tr = document.createElement('tr');
    tr.id = `row-${order.id}`;
    if (order.id === currentSelectedOrderId) {
      tr.classList.add('selected-row');
    }
    if (order.qcReworkCount > 0) {
      tr.classList.add('qc-rework-row');
    }

    tr.onclick = (e) => {
      if (e.target.closest('input[type="checkbox"]') || e.target.closest('.btn-row-menu')) return;
      selectOrder(order.id);
    };

    const statusBadgeClass = getStatusBadgeClass(order.status);
    const urgencyClass = order.urgency ? 'alert' : '';

    tr.innerHTML = `
      <td>
        <input type="checkbox" data-order-id="${order.id}" onclick="event.stopPropagation()" />
      </td>
      <td>
        <div class="order-user-cell">
          <img src="${order.image}" alt="${order.garment}" class="row-thumb" onerror="handleImgError(this)" loading="lazy" />
          <div class="row-user-meta">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span class="row-order-id">${order.id}</span>
              ${order.qcReworkCount > 0 ? `<span class="qc-rework-badge" title="Sent for QC rework ${order.qcReworkCount} time(s)">⚠ QC Rework ×${order.qcReworkCount}</span>` : ''}
            </div>
            <span class="row-customer">${order.customer}</span>
          </div>
        </div>
      </td>
      <td>
        <div class="row-garment-meta">
          <span class="row-garment-name">${order.garment}</span>
          <span class="row-garment-sub">${order.collection}</span>
        </div>
      </td>
      <td>
        <span class="stage-pill ${order.stage.toLowerCase()}" style="display:inline-flex;align-items:center;gap:5px;">
          ${order.stage === 'QC' && qcStageImageUrl ? `<img src="${qcStageImageUrl}" style="width:16px;height:16px;border-radius:50%;object-fit:cover;border:1px solid rgba(212,175,55,0.7);box-shadow:0 1px 4px rgba(0,0,0,0.4);" alt="QC" onerror="this.remove()" />` : ''}
          <span>${order.stage}</span>
        </span>
      </td>
      <td>
        <div class="due-cell-wrap">
          <span class="due-date-val">${order.dueDate}</span>
          ${order.urgency ? `<span class="due-urgency-val ${urgencyClass}">${order.urgency}</span>` : ''}
        </div>
      </td>
      <td>
        <span class="badge-status ${statusBadgeClass}">${order.status}</span>
      </td>
      <td>
        <button class="btn-row-menu" onclick="openRowMenu(event, '${order.id}')" title="Actions">•••</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  updatePaginationControls(startIdx + 1, Math.min(startIdx + itemsPerPage, totalCount), totalCount);
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Awaiting QC': return 'yellow';
    case 'In Inspection': return 'purple';
    case 'Rework': return 'red';
    case 'Passed': return 'green';
    case 'Ready for Delivery': return 'emerald';
    default: return 'yellow';
  }
}

/**
 * Filter Logic
 */
function getFilteredOrders() {
  return qcOrders.filter(order => {
    // Tab filter
    if (activeFilterTab !== 'all') {
      if (activeFilterTab === 'awaiting' && order.status !== 'Awaiting QC') return false;
      if (activeFilterTab === 'inspection' && order.status !== 'In Inspection') return false;
      if (activeFilterTab === 'rework' && order.status !== 'Rework') return false;
      if (activeFilterTab === 'passed' && order.status !== 'Passed') return false;
      if (activeFilterTab === 'ready' && order.status !== 'Ready for Delivery') return false;
    }

    // Search filter
    if (searchQuery) {
      const matchStr = `${order.id} ${order.customer} ${order.garment} ${order.collection} ${order.status}`.toLowerCase();
      if (!matchStr.includes(searchQuery.toLowerCase())) return false;
    }

    return true;
  });
}

function setQcTab(tabKey, btnElement) {
  activeFilterTab = tabKey;
  currentPage = 1;

  document.querySelectorAll('#qcTabsGroup .tab-pill').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  renderOrdersTable();
}

function handleOrderSearch() {
  const input = document.getElementById('orderSearchInput');
  searchQuery = (input?.value || '').trim();
  currentPage = 1;
  renderOrdersTable();
}

/**
 * Order Selection & Workspace Update
 */
async function selectOrder(orderId) {
  currentSelectedOrderId = orderId;

  // Update row highlighting
  document.querySelectorAll('#qcOrdersTableBody tr').forEach(r => r.classList.remove('selected-row'));
  const row = document.getElementById(`row-${orderId}`);
  if (row) row.classList.add('selected-row');

  await loadOrderIntoInspection(orderId);
}

async function loadOrderIntoInspection(orderId) {
  const order = qcOrders.find(o => o.id === orderId);
  if (!order) return;
  ensureOrderChecklist(order);

  // Header Elements
  const heroImg = document.getElementById('selectedGarmentImg');
  const heroOrderId = document.getElementById('selectedOrderId');
  const heroCustomer = document.getElementById('selectedCustomer');
  const heroGarmentDesc = document.getElementById('selectedGarmentDesc');
  const heroStatusBadge = document.getElementById('selectedStatusBadge');
  const heroDueDate = document.getElementById('selectedDueDate');
  const heroDueUrgency = document.getElementById('selectedDueUrgency');
  const heroOrderValue = document.getElementById('selectedOrderValue');

  if (heroImg) heroImg.src = order.image;
  if (heroOrderId) {
    if (order.qcReworkCount > 0) {
      heroOrderId.innerHTML = `${order.id} <span class="qc-rework-badge" style="vertical-align:middle;margin-left:6px;" title="Sent for QC rework ${order.qcReworkCount} time(s)">⚠ QC Rework ×${order.qcReworkCount}</span>`;
    } else {
      heroOrderId.textContent = order.id;
    }
  }
  if (heroCustomer) heroCustomer.textContent = order.customer;
  if (heroGarmentDesc) heroGarmentDesc.textContent = `${order.garment} • ${order.collection}`;

  if (heroStatusBadge) {
    heroStatusBadge.textContent = order.status;
    heroStatusBadge.className = `badge-status ${getStatusBadgeClass(order.status)}`;
  }

  if (heroDueDate) heroDueDate.textContent = order.dueDate;
  if (heroDueUrgency) {
    if (order.urgency) {
      heroDueUrgency.textContent = order.urgency;
      heroDueUrgency.style.display = 'inline';
    } else {
      heroDueUrgency.style.display = 'none';
    }
  }
  if (heroOrderValue) heroOrderValue.textContent = order.orderValue;

  // Render all 6 Checklist Items and Defect Drawers
  const keys = ['stitching', 'measurements', 'fabric', 'finishing', 'accessories', 'overall'];
  keys.forEach(key => {
    updateCheckItemUI(key, order.checklist[key]);
  });

  // Dynamically load the order's actual production stages from user data
  await loadOrderProductionStages(order);

  const prioritySelect = document.getElementById('reworkPriority');
  if (prioritySelect && order.reworkPriority) prioritySelect.value = order.reworkPriority;

  const notesEl = document.getElementById('reworkCompiledNotes');
  if (notesEl && order.reworkNotes) notesEl.value = order.reworkNotes;

  // Synchronize Quality Gate radio and warning states
  syncQualityGateUI(order);

  // Remarks
  const remarksInput = document.getElementById('qcRemarksInput');
  if (remarksInput) remarksInput.value = order.remarks || '';

  // Inspector & Date
  const inspectorSelect = document.getElementById('assignedInspector');
  if (inspectorSelect && order.inspector) inspectorSelect.value = order.inspector;
  const dateText = document.getElementById('qcInspectionDateText');
  if (dateText) dateText.textContent = order.inspectionDate || '—';

  // Customer Notes
  const notesBubble = document.getElementById('customerNotesText');
  if (notesBubble) notesBubble.textContent = order.customerNotes || 'No specific tailoring remarks.';

  // Reference Images Grid
  renderRefImages(order.refImages || []);
}

function renderRefImages(imagesList) {
  const grid = document.getElementById('refImagesGrid');
  if (!grid) return;

  // Retain Add Photos tile
  const addTile = grid.querySelector('.add-photo-tile');
  grid.innerHTML = '';

  imagesList.forEach((src, idx) => {
    const tile = document.createElement('div');
    tile.className = 'ref-tile';
    tile.onclick = () => openLightbox(src);
    tile.innerHTML = `<img src="${src}" alt="Ref ${idx + 1}" class="ref-img" onerror="handleImgError(this)" />`;
    grid.appendChild(tile);
  });

  if (addTile) {
    grid.appendChild(addTile);
  }
}

/**
 * Toggle Checklist Item Result: Pending -> Pass -> Fail -> Pending
 */
function toggleCheckResult(btn, checkKey) {
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (!order) return;
  ensureOrderChecklist(order);

  const currentStatus = order.checklist[checkKey]?.status || 'Pending';
  let nextStatus = 'Pass';
  if (currentStatus === 'Pass') nextStatus = 'Fail';
  else if (currentStatus === 'Fail') nextStatus = 'Pending';
  else nextStatus = 'Pass';

  order.checklist[checkKey].status = nextStatus;

  // Re-render this specific check item UI & defect drawer
  updateCheckItemUI(checkKey, order.checklist[checkKey]);

  // Synchronize Quality Gate logic across the page
  syncQualityGateUI(order);
}

/**
 * Update UI for a single check item and its defect drawer
 */
function updateCheckItemUI(key, item) {
  if (!item) return;
  const itemRow = document.querySelector(`.check-item-row[data-check-id="${key}"]`);
  const group = document.querySelector(`.check-item-group[data-item-group="${key}"]`);
  const drawer = document.getElementById(`defectDrawer-${key}`);

  if (itemRow) {
    const btn = itemRow.querySelector('.btn-ci-status');
    const icon = itemRow.querySelector('.ci-icon');
    if (btn) {
      btn.textContent = item.status;
      btn.className = `btn-ci-status ${item.status.toLowerCase()}`;
    }
    if (icon) {
      icon.className = `ci-icon ${item.status === 'Pass' ? 'passed' : (item.status === 'Fail' ? 'failed' : 'pending')}`;
    }
  }

  if (item.status === 'Fail') {
    if (group) group.classList.add('has-defect');
    if (drawer) {
      drawer.style.display = 'flex';
      const txt = document.getElementById(`defectProblem-${key}`);
      const sev = document.getElementById(`defectSeverity-${key}`);
      if (txt) txt.value = item.problem || '';
      if (sev) sev.value = item.severity || 'Major';
      renderDefectPhotoThumbs(key, item.images);
    }
  } else {
    if (group) group.classList.remove('has-defect');
    if (drawer) drawer.style.display = 'none';
  }
}

/**
 * Defect Problem Description handler
 */
function handleDefectProblemInput(checkKey, val) {
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (!order) return;
  ensureOrderChecklist(order);
  order.checklist[checkKey].problem = val;
  updateCompiledReworkNotes(order);
}

/**
 * Defect Severity Change handler
 */
function handleDefectSeverityChange(checkKey, val) {
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (!order) return;
  ensureOrderChecklist(order);
  order.checklist[checkKey].severity = val;
  updateCompiledReworkNotes(order);
}

/**
 * Trigger file dialog for defect photo
 */
function triggerChecklistPhotoUpload(checkKey) {
  const input = document.getElementById(`defectPhotoInput-${checkKey}`);
  if (input) input.click();
}

/**
 * Handle defect photo upload and thumbnail preview
 */
function handleChecklistPhotoUpload(e, checkKey) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (!order) return;
  ensureOrderChecklist(order);

  const item = order.checklist[checkKey];
  if (!Array.isArray(item.images)) item.images = [];

  let loadedCount = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      item.images.push(evt.target.result);
      loadedCount++;
      if (loadedCount === files.length) {
        renderDefectPhotoThumbs(checkKey, item.images);
        updateCompiledReworkNotes(order);
        showToast(`Attached ${files.length} defect photo(s) to ${checkKey}`);
      }
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
}

/**
 * Remove an attached defect photo
 */
function removeChecklistPhoto(checkKey, photoIdx) {
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (!order) return;
  const item = order.checklist?.[checkKey];
  if (item && Array.isArray(item.images)) {
    item.images.splice(photoIdx, 1);
    renderDefectPhotoThumbs(checkKey, item.images);
    updateCompiledReworkNotes(order);
    showToast('Removed defect photo');
  }
}

/**
 * Render thumbnail gallery inside a defect drawer
 */
function renderDefectPhotoThumbs(checkKey, images = []) {
  const container = document.getElementById(`defectThumbs-${checkKey}`);
  if (!container) return;

  if (!images || images.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = images.map((src, idx) => `
    <div class="defect-thumb-item">
      <img src="${src}" class="defect-thumb-img" onclick="openLightbox('${src}')" title="Click to view full photo" />
      <button type="button" class="defect-thumb-del" onclick="removeChecklistPhoto('${checkKey}', ${idx})" title="Remove photo">&times;</button>
    </div>
  `).join('');
}

/**
 * Quick Action: Pass All Items
 */
function quickPassAllChecklist() {
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (!order) return;
  ensureOrderChecklist(order);

  const keys = ['stitching', 'measurements', 'fabric', 'finishing', 'accessories', 'overall'];
  keys.forEach(k => {
    order.checklist[k].status = 'Pass';
    updateCheckItemUI(k, order.checklist[k]);
  });

  syncQualityGateUI(order);
  showToast('All 6 inspection checkpoints marked as Pass');
}

/**
 * Quick Action: Reset Checklist
 */
function quickResetChecklist() {
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (!order) return;
  ensureOrderChecklist(order);

  const keys = ['stitching', 'measurements', 'fabric', 'finishing', 'accessories', 'overall'];
  keys.forEach(k => {
    order.checklist[k].status = 'Pending';
    order.checklist[k].problem = '';
    order.checklist[k].images = [];
    updateCheckItemUI(k, order.checklist[k]);
  });

  syncQualityGateUI(order);
  showToast('Checklist reset to Pending');
}

/**
 * Quality Gate Rule Enforcement:
 * 1. Every checklist item must pass.
 * 2. If even one fails, result is locked to "Rework Required" and "Pass" is disabled.
 * 3. Inline defect drawer opens under failed item.
 * 4. Rework routing card displays dynamically with backend stage definitions.
 */
function syncQualityGateUI(order) {
  if (!order) return;
  ensureOrderChecklist(order);

  const keys = ['stitching', 'measurements', 'fabric', 'finishing', 'accessories', 'overall'];
  const failedItems = keys.filter(k => order.checklist[k].status === 'Fail');
  const pendingItems = keys.filter(k => order.checklist[k].status === 'Pending');
  const hasFailed = failedItems.length > 0;
  const hasPending = pendingItems.length > 0;
  const allPassed = !hasFailed && !hasPending;

  const radioPass = document.getElementById('resPass');
  const radioRework = document.getElementById('resRework');
  const radioOnHold = document.getElementById('resOnHold');
  const labelPass = document.getElementById('labelResPass');
  const warningEl = document.getElementById('qcQualityGateWarning');
  const reworkCard = document.getElementById('reworkRoutingCard');

  if (hasFailed) {
    // Quality Gate: 1 or more failed -> MUST BE REWORK
    if (radioPass) {
      radioPass.disabled = true;
      radioPass.checked = false;
    }
    if (labelPass) {
      labelPass.classList.add('disabled');
      labelPass.title = 'Cannot pass QC: 1 or more checklist items have failed inspection';
    }
    if (radioRework) radioRework.checked = true;
    order.result = 'Rework Required';

    if (warningEl) {
      warningEl.style.display = 'inline-flex';
      warningEl.textContent = `⚠️ ${failedItems.length} checkpoint${failedItems.length > 1 ? 's' : ''} failed (${failedItems.join(', ')}) — Rework Required`;
    }
    if (reworkCard) reworkCard.style.display = 'block';

    autoSuggestReworkStage(failedItems);
    updateCompiledReworkNotes(order);

  } else if (allPassed) {
    // All 6 items passed!
    if (radioPass) {
      radioPass.disabled = false;
      radioPass.checked = true;
    }
    if (labelPass) {
      labelPass.classList.remove('disabled');
      labelPass.removeAttribute('title');
    }
    order.result = 'Pass';

    if (warningEl) warningEl.style.display = 'none';
    if (reworkCard) reworkCard.style.display = 'none';

  } else {
    // No failures, but some pending items remain
    if (radioPass) {
      radioPass.disabled = true; // Cannot pass until all items are reviewed and passed!
      radioPass.checked = false;
    }
    if (labelPass) {
      labelPass.classList.add('disabled');
      labelPass.title = 'Cannot pass QC: complete all pending checklist items first';
    }
    if (radioOnHold) radioOnHold.checked = true;
    order.result = 'On Hold';

    if (warningEl) warningEl.style.display = 'none';
    if (reworkCard) reworkCard.style.display = 'none';
  }
}

/**
 * Auto-suggest target stage based on failed checklist categories
 */
function autoSuggestReworkStage(failedKeys) {
  const stageSelect = document.getElementById('reworkTargetStage');
  if (!stageSelect) return;
  if (stageSelect.value) return; // Retain user selection if already made

  const availableKeys = Array.from(stageSelect.options)
    .map(o => o.value)
    .filter(Boolean);
  if (availableKeys.length === 0) return;

  function findMatch(patterns) {
    for (const pat of patterns) {
      const match = availableKeys.find(k => k.toUpperCase().includes(pat));
      if (match) return match;
    }
    return null;
  }

  let suggested = null;
  if (failedKeys.includes('fabric')) {
    suggested = findMatch(['CUTTING', 'FABRIC', 'PATTERN']);
  }
  if (!suggested && (failedKeys.includes('stitching') || failedKeys.includes('measurements'))) {
    suggested = findMatch(['STITCH', 'SEWING', 'TAILOR']);
  }
  if (!suggested && failedKeys.includes('finishing')) {
    suggested = findMatch(['FINISH', 'PRESS', 'IRON']);
  }
  if (!suggested && failedKeys.includes('accessories')) {
    suggested = findMatch(['HAND', 'EMBROID', 'FINISH', 'STITCH']);
  }
  if (!suggested) {
    suggested = availableKeys[0];
  }

  if (suggested) {
    stageSelect.value = suggested;
    const order = qcOrders.find(o => o.id === currentSelectedOrderId);
    if (order) {
      order.reworkStage = suggested;
      const prevWorker = order.stageAssigneeMap?.[(suggested || '').toUpperCase().trim()];
      const preselectId = order.reworkAssigneeId || prevWorker?.id || '';
      order.reworkAssigneeId = preselectId;
      updateReworkAssigneeDropdown(suggested, preselectId, order);
    }
  }
}

/**
 * Auto-compile formatted defect notes from all failed checklist items
 */
function updateCompiledReworkNotes(order) {
  if (!order) return;
  const notesEl = document.getElementById('reworkCompiledNotes');
  if (!notesEl) return;

  const keys = ['stitching', 'measurements', 'fabric', 'finishing', 'accessories', 'overall'];
  const titles = {
    stitching: 'Stitching Quality',
    measurements: 'Measurements',
    fabric: 'Fabric & Embroidery',
    finishing: 'Finishing & Pressing',
    accessories: 'Accessories & Fasteners',
    overall: 'Overall Appearance'
  };

  const lines = [];
  keys.forEach(k => {
    const item = order.checklist?.[k];
    if (item && item.status === 'Fail') {
      const sev = (item.severity || 'Major').toUpperCase();
      const prob = item.problem?.trim() || 'Defect noted during QC inspection';
      const photoCount = item.images?.length || 0;
      const photoNote = photoCount > 0 ? ` (${photoCount} photo${photoCount > 1 ? 's' : ''} attached)` : '';
      lines.push(`[${sev}] ${titles[k]}: ${prob}${photoNote}`);
    }
  });

  const compiled = lines.join('\n');
  notesEl.value = compiled;
  order.reworkNotes = compiled;
}

function handleReworkStageChange(val) {
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  let preselectId = '';
  if (order) {
    order.reworkStage = val;
    const prevWorker = order.stageAssigneeMap?.[(val || '').toUpperCase().trim()];
    preselectId = prevWorker?.id || '';
    order.reworkAssigneeId = preselectId;
  }
  updateReworkAssigneeDropdown(val, preselectId, order);
}

function handleReworkAssigneeChange(val) {
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (order) {
    order.reworkAssigneeId = val;
  }
}

function handleReworkPriorityChange(val) {
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (order) order.reworkPriority = val;
}

function handleResultRadioChange(val) {
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (!order) return;
  ensureOrderChecklist(order);

  const keys = ['stitching', 'measurements', 'fabric', 'finishing', 'accessories', 'overall'];
  const failed = keys.filter(k => order.checklist[k].status === 'Fail');
  const pending = keys.filter(k => order.checklist[k].status === 'Pending');

  if (val === 'Pass') {
    if (failed.length > 0) {
      showToast(`⚠️ Cannot mark Pass! ${failed.length} checkpoint(s) have failed.`);
      syncQualityGateUI(order);
      return;
    }
    if (pending.length > 0) {
      showToast(`⚠️ Cannot mark Pass! ${pending.length} checkpoint(s) are still pending.`);
      syncQualityGateUI(order);
      return;
    }
    order.result = 'Pass';
    const reworkCard = document.getElementById('reworkRoutingCard');
    if (reworkCard) reworkCard.style.display = 'none';
  } else if (val === 'Rework Required') {
    order.result = 'Rework Required';
    const reworkCard = document.getElementById('reworkRoutingCard');
    if (reworkCard) reworkCard.style.display = 'block';
  } else {
    order.result = 'On Hold';
    const reworkCard = document.getElementById('reworkRoutingCard');
    if (reworkCard) reworkCard.style.display = 'none';
  }
}

/**
 * Save QC Result — executes real backend transitions.
 *
 * PASS            -> transitions order to READY
 * REWORK REQUIRED -> transitions order back to dynamically selected production stage,
 *                    remains on the QC page, updates local order state and table KPIs.
 * ON HOLD         -> saves inspector notes locally and remains in inspection.
 */
async function saveQCResult() {
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (!order) return;
  ensureOrderChecklist(order);

  const keys = ['stitching', 'measurements', 'fabric', 'finishing', 'accessories', 'overall'];
  const failedItems = keys.filter(k => order.checklist[k].status === 'Fail');
  const pendingItems = keys.filter(k => order.checklist[k].status === 'Pending');
  const selectedRadio = document.querySelector('input[name="qcResultRadio"]:checked')?.value || 'On Hold';
  const generalRemarks = document.getElementById('qcRemarksInput')?.value.trim() || '';
  const inspector = document.getElementById('assignedInspector')?.value || '';

  // Enforce Quality Gate Check:
  if (selectedRadio === 'Pass') {
    if (failedItems.length > 0) {
      showToast(`⚠️ Inspection cannot pass: ${failedItems.length} failed checkpoint(s). Rework is required.`);
      syncQualityGateUI(order);
      return;
    }
    if (pendingItems.length > 0) {
      showToast(`⚠️ Inspection cannot pass: Please review all ${pendingItems.length} pending checkpoint(s).`);
      syncQualityGateUI(order);
      return;
    }
  }

  // If Rework Required is selected:
  let targetStage = '';
  let reworkAssigneeId = '';
  let compiledReworkNotes = '';
  let priority = 'NORMAL';

  if (selectedRadio === 'Rework Required') {
    const stageSelect = document.getElementById('reworkTargetStage');
    targetStage = stageSelect?.value || order.reworkStage || '';
    if (!targetStage) {
      showToast('⚠️ Please select which production stage will rectify the defects.');
      if (stageSelect) {
        stageSelect.focus();
        stageSelect.style.borderColor = '#f87171';
        setTimeout(() => { if (stageSelect) stageSelect.style.borderColor = ''; }, 2500);
      }
      return;
    }

    const assigneeSelect = document.getElementById('reworkAssignee');
    reworkAssigneeId = assigneeSelect?.value || '';
    priority = document.getElementById('reworkPriority')?.value || 'NORMAL';
    compiledReworkNotes = document.getElementById('reworkCompiledNotes')?.value.trim() || '';
    if (!compiledReworkNotes && generalRemarks) {
      compiledReworkNotes = generalRemarks;
    }
  }

  // Persist to local order object
  order.result = selectedRadio;
  order.remarks = generalRemarks;
  order.inspector = inspector;
  order.inspectionDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const dateEl = document.getElementById('qcInspectionDateText');
  if (dateEl) dateEl.textContent = order.inspectionDate;

  // Lock save button
  const saveBtn = document.querySelector('.btn-save-qc-result, .btn-save-qc');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span>Saving QC Result…</span>';
  }

  try {
    const { default: api } = await import('../api.js');

    // ── PASS ─────────────────────────────────────────────────────────────────
    if (selectedRadio === 'Pass') {
      let nextStageKey = 'READY_TO_DELIVER';
      let nextDisplayName = 'Ready to Deliver';
      try {
        if (api.qc?.pass) {
          const passRes = await api.qc.pass(order.orderId, generalRemarks || 'Passed QC Inspection');
          if (passRes?.currentStage) nextStageKey = passRes.currentStage;
        } else {
          const nextInfo = await api.production.getNextAfterQc().catch(() => ({ stageKey: 'READY_TO_DELIVER', displayName: 'Ready to Deliver' }));
          nextStageKey = nextInfo?.stageKey || 'READY_TO_DELIVER';
          nextDisplayName = nextInfo?.displayName || 'Ready to Deliver';
          await api.production.transition(order.orderId, nextStageKey, null, generalRemarks || 'Passed QC Inspection');
        }
      } catch (e) {
        console.warn('[QC] Pass API call fallback:', e.message);
        try {
          await api.production.transition(order.orderId, 'NEXT_AFTER_QC', null, generalRemarks || 'Passed QC Inspection');
        } catch (e2) {
          console.warn('[QC] Transition API error (pass):', e2.message);
        }
      }

      order.status = 'Ready for Delivery';
      order.stage = nextStageKey;
      showToast(`✅ Order ${order.id} PASSED all 6 checkpoints — Moved to ${nextDisplayName}!`);

    // ── REWORK ───────────────────────────────────────────────────────────────
    } else if (selectedRadio === 'Rework Required') {
      const notesToSend = `[QC REWORK - ${priority}] Target: ${targetStage}\n${compiledReworkNotes}\nInspector: ${inspector || 'QC Inspector'}`;

      try {
        if (api.qc?.rework) {
          const reworkRes = await api.qc.rework(order.orderId, targetStage, reworkAssigneeId || null, notesToSend);
          if (reworkRes && reworkRes.qcReworkCount != null) {
            order.qcReworkCount = reworkRes.qcReworkCount;
          } else {
            order.qcReworkCount = (order.qcReworkCount || 0) + 1;
          }
        } else {
          await api.production.transition(order.orderId, targetStage, reworkAssigneeId || null, notesToSend);
          order.qcReworkCount = (order.qcReworkCount || 0) + 1;
        }
      } catch (e) {
        console.warn('[QC] Rework API call fallback:', e.message);
        try {
          await api.production.transition(order.orderId, targetStage, reworkAssigneeId || null, notesToSend);
        } catch (e2) {
          console.warn('[QC] Transition API error (rework):', e2.message);
        }
        order.qcReworkCount = (order.qcReworkCount || 0) + 1;
      }

      order.status = 'Rework';
      order.stage = targetStage;
      order.currentStage = targetStage;
      order.reworkStage = targetStage;
      order.reworkNotes = compiledReworkNotes;

      // Find user-friendly stage name from dynamic list
      const matchedDef = dynamicProductionStages.find(s => (s.stageKey || s.id) === targetStage);
      const stageName = matchedDef ? matchedDef.displayName : targetStage;

      // NOTE: Do NOT redirect! Remain on QC page as requested by user.
      showToast(`⚠️ Order ${order.id} routed back to ${stageName} for rework (Rework ×${order.qcReworkCount}).`);

    // ── ON HOLD ──────────────────────────────────────────────────────────────
    } else {
      order.status = 'In Inspection';
      showToast(`QC status for ${order.id} saved as On Hold.`);
    }

    // Refresh inspection workspace and table with updated status
    await loadOrderIntoInspection(order.id);
    renderOrdersTable();
    await updateKPISummaries();

  } catch (err) {
    console.error('[QC] saveQCResult error:', err);
    showToast('❌ Error saving QC result: ' + (err.message || 'Please try again'));
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `
        <span>Save QC Result</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      `;
    }
  }
}

/**
 * Update Top KPI Summaries, Tab Counters & Donut Engine
 */
async function updateKPISummaries() {
  const awaiting = qcOrders.filter(o => o.status === 'Awaiting QC').length;
  const inInspection = qcOrders.filter(o => o.status === 'In Inspection').length;
  const passed = qcOrders.filter(o => o.status === 'Passed').length;
  const rework = qcOrders.filter(o => o.status === 'Rework').length;
  const ready = qcOrders.filter(o => o.status === 'Ready for Delivery').length;
  const total = qcOrders.length;

  // 1. Tab counts — ALWAYS updated immediately from live qcOrders
  const tabAll = document.getElementById('countTabAll');
  const tabAwaiting = document.getElementById('countTabAwaiting');
  const tabInspection = document.getElementById('countTabInspection');
  const tabRework = document.getElementById('countTabRework');
  const tabPassed = document.getElementById('countTabPassed');
  const tabReady = document.getElementById('countTabReady');

  if (tabAll) tabAll.textContent = total;
  if (tabAwaiting) tabAwaiting.textContent = awaiting;
  if (tabInspection) tabInspection.textContent = inInspection;
  if (tabRework) tabRework.textContent = rework;
  if (tabPassed) tabPassed.textContent = passed;
  if (tabReady) tabReady.textContent = ready;

  // 2. Fetch API KPIs for backend-wide totals if available
  let apiKpis = null;
  try {
    const { default: api } = await import('../api.js');
    apiKpis = await api.qc.kpis().catch(() => null);
  } catch (_) {}

  const finalAwaiting = (apiKpis && apiKpis.awaitingQc != null && apiKpis.awaitingQc > 0) ? apiKpis.awaitingQc : awaiting;
  const finalInspection = (apiKpis && apiKpis.inInspection != null && apiKpis.inInspection > 0) ? apiKpis.inInspection : inInspection;
  const finalPassed = (apiKpis && apiKpis.passedQc != null) ? apiKpis.passedQc : passed;
  const finalRework = (apiKpis && apiKpis.reworkRequired != null) ? apiKpis.reworkRequired : rework;
  const finalReady = (apiKpis && apiKpis.readyDelivery != null) ? apiKpis.readyDelivery : ready;

  // 3. Top KPI Value Cards
  const elAwaiting = document.getElementById('kpiAwaitingQC');
  const elInspection = document.getElementById('kpiInInspection');
  const elPassed = document.getElementById('kpiPassedQC');
  const elRework = document.getElementById('kpiReworkRequired');
  const elReady = document.getElementById('kpiReadyDelivery');

  if (elAwaiting) elAwaiting.textContent = finalAwaiting;
  if (elInspection) elInspection.textContent = finalInspection;
  if (elPassed) elPassed.textContent = finalPassed;
  if (elRework) elRework.textContent = finalRework;
  if (elReady) elReady.textContent = finalReady;

  // 4. Donut legend counts
  const legPassed = document.getElementById('legPassedCount');
  const legRework = document.getElementById('legReworkCount');
  const legPending = document.getElementById('legPendingCount');

  if (legPassed) legPassed.textContent = finalPassed;
  if (legRework) legRework.textContent = finalRework;
  if (legPending) legPending.textContent = finalAwaiting;

  // 5. Pass rate calculation & Donut Graphic
  let passRate = 100;
  if (apiKpis && apiKpis.passRate != null) {
    passRate = Math.round(Number(apiKpis.passRate));
  } else {
    const totalAudited = finalPassed + finalRework;
    if (totalAudited > 0) {
      passRate = Math.round((finalPassed / totalAudited) * 100);
    }
  }

  const donutPct = document.getElementById('donutPercentage');
  if (donutPct) donutPct.textContent = `${passRate}%`;

  updateDonutSegments(finalPassed, finalAwaiting, finalRework);
}

function updateDonutSegments(passed, pending, rework) {
  const total = (passed + pending + rework) || 1;
  const circumference = 239; // 2 * PI * 38 ≈ 238.76

  const passLen = Math.round((passed / total) * circumference);
  const pendLen = Math.round((pending / total) * circumference);
  const rewLen = circumference - passLen - pendLen;

  const segPassed = document.querySelector('.donut-seg.seg-passed');
  const segPending = document.querySelector('.donut-seg.seg-pending');
  const segRework = document.querySelector('.donut-seg.seg-rework');

  if (segPassed) {
    segPassed.setAttribute('stroke-dasharray', `${passLen} ${circumference}`);
    segPassed.setAttribute('stroke-dashoffset', '0');
  }
  if (segPending) {
    segPending.setAttribute('stroke-dasharray', `${pendLen} ${circumference}`);
    segPending.setAttribute('stroke-dashoffset', `-${passLen}`);
  }
  if (segRework) {
    segRework.setAttribute('stroke-dasharray', `${Math.max(0, rewLen)} ${circumference}`);
    segRework.setAttribute('stroke-dashoffset', `-${passLen + pendLen}`);
  }
}

/**
 * Pagination Controls
 */
function updatePaginationControls(start, end, total) {
  const info = document.getElementById('paginationInfo');
  if (info) {
    info.textContent = `Showing ${start}–${end} of ${total} orders`;
  }

  const controls = document.getElementById('paginationControls');
  if (!controls) return;

  const totalPages = Math.ceil(total / itemsPerPage) || 1;
  let html = `<button class="page-nav-btn prev" onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

  for (let i = 1; i <= Math.min(5, totalPages); i++) {
    html += `<button class="page-num-btn ${currentPage === i ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  if (totalPages > 5) {
    html += `<span class="page-dots">…</span>`;
  }
  html += `<button class="page-nav-btn next" onclick="changePage(1)" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;

  controls.innerHTML = html;
}

function changePage(delta) {
  currentPage += delta;
  renderOrdersTable();
}

function goToPage(page) {
  currentPage = page;
  renderOrdersTable();
}

/**
 * Subtab Switcher
 */
function setSubTab(tabId, btnElement) {
  activeSubtab = tabId;
  document.querySelectorAll('.inspection-subtabs .subtab-btn').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  const mainGrid = document.getElementById('subtabContentChecklist');
  const measPane = document.getElementById('subtabContentMeasurements');
  const photoPane = document.getElementById('subtabContentPhotos');
  const notesPane = document.getElementById('subtabContentNotes');
  const histPane = document.getElementById('subtabContentHistory');

  if (mainGrid) mainGrid.style.display = tabId === 'checklist' ? 'grid' : 'none';
  if (measPane) measPane.style.display = tabId === 'measurements' ? 'block' : 'none';
  if (photoPane) photoPane.style.display = tabId === 'photos' ? 'block' : 'none';
  if (notesPane) notesPane.style.display = tabId === 'notes' ? 'block' : 'none';
  if (histPane) histPane.style.display = tabId === 'history' ? 'block' : 'none';

  if (tabId !== 'checklist') {
    showToast(`Viewing ${tabId.charAt(0).toUpperCase() + tabId.slice(1)} records for ${currentSelectedOrderId}`);
  }
}

/**
 * Add / Upload Reference Photo
 */
function triggerPhotoUpload() {
  const input = document.getElementById('photoUploadInput');
  if (input) input.click();
}

function handlePhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const order = qcOrders.find(o => o.id === currentSelectedOrderId);
    if (order) {
      if (!order.refImages) order.refImages = [];
      order.refImages.push(evt.target.result);
      renderRefImages(order.refImages);
      showToast('Reference photo attached successfully!');
    }
  };
  reader.readAsDataURL(file);
}

/**
 * Lightbox & Full View
 */
function openLightbox(src) {
  const modal = document.getElementById('photoLightboxModal');
  const img = document.getElementById('lightboxImg');
  if (modal && img) {
    img.src = src;
    modal.classList.add('active');
  }
}

function openPhotoViewerModal() {
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (order && order.refImages && order.refImages.length > 0) {
    openLightbox(order.refImages[0]);
  }
}

/**
 * New QC Check Modal
 */
function openNewQcModal() {
  populateNewQcDropdown();
  openModal('newQcModal');
}

function populateNewQcDropdown() {
  const select = document.getElementById('newQcOrderSelect');
  if (!select) return;

  select.innerHTML = '<option value="">-- Choose Order to Inspect --</option>';
  qcOrders.forEach(order => {
    select.innerHTML += `<option value="${order.id}">${order.id} — ${order.customer} (${order.garment})</option>`;
  });
}

function handleSelectOrderToInspect(select) {
  const orderId = select.value;
  const order = qcOrders.find(o => o.id === orderId);
  if (!order) return;

  const custInput = document.getElementById('newQcCustomer');
  const garmInput = document.getElementById('newQcGarment');
  const dueInput = document.getElementById('newQcDueDate');

  if (custInput) custInput.value = order.customer;
  if (garmInput) garmInput.value = order.garment;
  if (dueInput) dueInput.value = order.dueDate;
}

function handleStartNewQc(e) {
  e.preventDefault();
  const orderId = document.getElementById('newQcOrderSelect').value;
  const inspector = document.getElementById('newQcInspector').value;

  const order = qcOrders.find(o => o.id === orderId);
  if (!order) return;

  order.status = 'In Inspection';
  order.inspector = inspector;

  closeModal('newQcModal');
  selectOrder(orderId);
  renderOrdersTable();
  updateKPISummaries();

  showToast(`Inspection initiated for ${order.id} (${order.customer})!`);
}

/**
 * Filter Modal
 */
function toggleFilterModal() {
  openModal('filterModal');
}

function applyAdvancedFilters() {
  const status = document.getElementById('advFilterStatus').value;
  const garment = document.getElementById('advFilterGarment').value;
  const dueDate = document.getElementById('advFilterDueDate').value;

  if (status !== 'all') {
    searchQuery = status;
  } else if (garment !== 'all') {
    searchQuery = garment;
  } else if (dueDate === 'today') {
    searchQuery = 'Today';
  } else if (dueDate === 'tomorrow') {
    searchQuery = 'Tomorrow';
  } else {
    searchQuery = '';
  }

  currentPage = 1;
  renderOrdersTable();
  closeModal('filterModal');
  showToast('Applied custom filters');
}

function resetAdvancedFilters() {
  searchQuery = '';
  const searchInput = document.getElementById('orderSearchInput');
  if (searchInput) searchInput.value = '';
  currentPage = 1;
  renderOrdersTable();
  closeModal('filterModal');
  showToast('Reset all filters');
}

/**
 * Context & Action Menu
 */
function openRowMenu(e, orderId) {
  e.stopPropagation();
  currentSelectedOrderId = orderId;
  const menu = document.getElementById('orderActionMenu');
  if (!menu) return;

  menu.style.display = 'flex';
  menu.style.top = `${e.clientY + 5}px`;
  menu.style.left = `${Math.min(e.clientX - 100, window.innerWidth - 180)}px`;
}

function openOrderActionMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('orderActionMenu');
  if (!menu) return;

  menu.style.display = 'flex';
  menu.style.top = `${e.clientY + 20}px`;
  menu.style.left = `${Math.min(e.clientX - 120, window.innerWidth - 180)}px`;
}

function closeContextMenu() {
  const menu = document.getElementById('orderActionMenu');
  if (menu) menu.style.display = 'none';
}

function handleMenuAction(action) {
  closeContextMenu();
  const order = qcOrders.find(o => o.id === currentSelectedOrderId);
  if (!order) return;

  if (action === 'print-sheet') {
    showToast(`Generating printable QC Inspection Sheet for ${order.id}...`);
    setTimeout(() => window.print(), 300);
  } else if (action === 'view-measurements') {
    setSubTab('measurements', document.querySelectorAll('.subtab-btn')[1]);
  } else {
    showToast(`Navigating to ${action.replace('-', ' ')} for ${order.id}...`);
  }
}

/**
 * Export QC Report
 */
function exportQcReport() {
  showToast('Generating Quality Inspection Audit CSV Report...');
}

/**
 * Modal Utilities
 */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

/**
 * Global Toast Notification
 */
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#a3e635" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// Window exports for explicit global binding (handles inline onclick/onchange/oninput)
if (typeof window !== 'undefined') {
  window.toggleCheckResult = toggleCheckResult;
  window.updateCheckItemUI = updateCheckItemUI;
  window.handleDefectProblemInput = handleDefectProblemInput;
  window.handleDefectSeverityChange = handleDefectSeverityChange;
  window.triggerChecklistPhotoUpload = triggerChecklistPhotoUpload;
  window.handleChecklistPhotoUpload = handleChecklistPhotoUpload;
  window.removeChecklistPhoto = removeChecklistPhoto;
  window.renderDefectPhotoThumbs = renderDefectPhotoThumbs;
  window.quickPassAllChecklist = quickPassAllChecklist;
  window.quickResetChecklist = quickResetChecklist;
  window.syncQualityGateUI = syncQualityGateUI;
  window.handleReworkStageChange = handleReworkStageChange;
  window.handleReworkPriorityChange = handleReworkPriorityChange;
  window.handleResultRadioChange = handleResultRadioChange;
  window.saveQCResult = saveQCResult;
  window.selectOrder = selectOrder;
  window.openLightbox = openLightbox;
  window.setSubTab = setSubTab;
  window.setQcTab = setQcTab;
  window.handleOrderSearch = handleOrderSearch;
  window.loadDynamicReworkStages = loadDynamicReworkStages;
  window.loadOrderProductionStages = loadOrderProductionStages;
  window.formatStageTitle = formatStageTitle;
  window.loadReworkAssignees = loadReworkAssignees;
  window.handleReworkAssigneeChange = handleReworkAssigneeChange;
  window.updateReworkAssigneeDropdown = updateReworkAssigneeDropdown;
}
