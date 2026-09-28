/**
 * HAULO BOUTIQUE ERP — Production Command Centre
 * Handles Kanban Workflow, Drag and Drop, Filtering, Modals, Live Clock, and Dynamic Analytics
 * Path: front end/production/production.js
 */

// Fallback image in case any image fails to load
const FALLBACK_IMAGE = '../assets/designs/blouse-stage.png';

// Local Garment Images
const GARMENT_IMAGES = {
  Blouse: '../assets/designs/blouse-stage.png',
  'Bridal Blouse': '../assets/designs/zari-bloom-front.jpg',
  Saree: '../assets/designs/saree-stage.png',
  'Silk Saree Work': '../assets/designs/saree-stage.png',
  Lehenga: '../assets/designs/lehenga-stage.png',
  'Designer Lehenga': '../assets/designs/lehenga-mannequin.png',
  Chudi: '../assets/designs/chudi-stage.png',
  'Chudi Set': '../assets/designs/chudi-stage.png',
  Gown: '../assets/designs/gown-stage.png',
  'Reception Gown': '../assets/designs/gown-mannequin.png',
  Kurti: '../assets/designs/kurti-stage.png',
  'Anarkali Kurti': '../assets/designs/kurti-mannequin.png',
  default: '../assets/designs/blouse-stage.png'
};

// Available Stages — populated from stage_definitions table on load.
// STAGES_FALLBACK contains strictly the 2 fixed system stages used as a safety net
// when the API is unreachable. All other intermediate stages are 100% user-managed.
const STAGES_FALLBACK = [
  { id: 'ordertaken', name: 'Order Taken', dot: 'dot-emerald', barClass: 'bar-emerald', pillClass: 'pill-emerald', stageKey: 'ORDER_TAKEN', deptLabel: 'Order Intake & Reception', imageUrl: '/front end/assets/stages/Order_Taken_1010.jpg' },
  { id: 'readytodeliver', name: 'Ready to Deliver', dot: 'dot-silver', barClass: 'bar-silver', pillClass: 'pill-silver', stageKey: 'READY_TO_DELIVER', deptLabel: 'Delivery & Handover', imageUrl: '/front end/assets/stages/Ready_8043.jpg' }
];
let STAGES = [...STAGES_FALLBACK];

// Workflow Collapse State Keys & Variables (declared early to prevent TDZ ReferenceErrors)
var _COL_STORAGE_KEY = 'haulo_prod_collapsed_cols';
var _SEC_KEY = 'haulo_prod_section_collapsed';
var _ALL_KEY = 'haulo_prod_all_collapsed';
var _allCollapsed = false;

function isFinalStage(stageId) {
  return stageId === 'readytodeliver' || stageId === 'ready';
}

function isInitialStage(stageId) {
  return stageId === 'ordertaken' || stageId === 'order';
}

function mapCurrentStageToKanban(st, status) {
  const s = String(st || '').toUpperCase().trim();

  // System-recognized first stage
  if (s === 'ORDER_TAKEN' || s === 'ORDER' || s === 'NEW') return 'ordertaken';
  // System-recognized final stages
  if (s === 'READY_TO_DELIVER' || s === 'READY' || s === 'DELIVERED' || s === 'DELIVERY') return 'readytodeliver';

  // Dynamic match against live STAGES from the database (covers all user-defined intermediate stages)
  const normalized = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const match = STAGES.find(stage =>
    stage.id === normalized ||
    (stage.stageKey && stage.stageKey.toUpperCase() === s) ||
    (stage.name && stage.name.toUpperCase() === s)
  );
  if (match) return match.id;

  // Status-based fallback
  if (status === 'READY' || status === 'DELIVERED') return 'readytodeliver';
  if (status === 'PENDING') return 'ordertaken';
  return 'ordertaken';
}

function mapKanbanToBackendStage(kanbanStageId) {
  // Always try live STAGES first — covers all user-defined intermediate stages dynamically
  const stageObj = STAGES.find(s => s.id === kanbanStageId);
  if (stageObj && stageObj.stageKey) return stageObj.stageKey;
  // Fallback aliases for system-mandatory stages only
  const lookup = {
    'ordertaken': 'ORDER_TAKEN',
    'readytodeliver': 'READY_TO_DELIVER',
    'ready': 'READY_TO_DELIVER'
  };
  return lookup[kanbanStageId] || kanbanStageId.toUpperCase();
}

function getStageHeaderIconSvg(stageId) {
  if (stageId === 'ordertaken' || stageId === 'order') {
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
  }
  if (stageId === 'readytodeliver' || stageId === 'ready') {
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>`;
  }
  // Dynamic workflow icon for all user-defined intermediate stages
  return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.85;"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>`;
}

/**
 * Builds the STAGES array from live stage_definitions API data.
 * Called on init and whenever stages are updated.
 */
async function loadStageDefinitions(api) {
  try {
    let defs = await api.production.stageDefinitions.list({ activeOnly: true });
    if (!defs || defs.length === 0) return; // keep fallback

    // Client-side boundary invariant enforcement:
    // 1. Enforce ORDER_TAKEN is strictly at index 0 (Stage 1)
    const otIdx = defs.findIndex(d => (d.stageKey || '').toUpperCase().trim() === 'ORDER_TAKEN');
    if (otIdx > 0) {
      const [ot] = defs.splice(otIdx, 1);
      defs.unshift(ot);
    } else if (otIdx === -1) {
      defs.unshift({
        stageKey: 'ORDER_TAKEN',
        displayName: 'Order Taken',
        colorClass: 'stage-emerald',
        deptLabel: 'Order Intake & Reception',
        imageUrl: '/front end/assets/stages/Order_Taken_1010.jpg',
        sortOrder: 1
      });
    }

    // 2. Enforce READY_TO_DELIVER is strictly at the last index (Final Stage)
    const rdIdx = defs.findIndex(d => (d.stageKey || '').toUpperCase().trim() === 'READY_TO_DELIVER');
    if (rdIdx >= 0 && rdIdx < defs.length - 1) {
      const [rd] = defs.splice(rdIdx, 1);
      defs.push(rd);
    } else if (rdIdx === -1) {
      defs.push({
        stageKey: 'READY_TO_DELIVER',
        displayName: 'Ready to Deliver',
        colorClass: 'stage-silver',
        deptLabel: 'Delivery & Handover',
        imageUrl: '/front end/assets/stages/Ready_8043.jpg',
        sortOrder: defs.length + 1
      });
    }

    const dotFallbacks = ['dot-emerald', 'dot-purple', 'dot-blue', 'dot-yellow', 'dot-pink', 'dot-green', 'dot-cyan', 'dot-coral', 'dot-silver'];
    STAGES = defs.map((d, idx) => {
      const dot = d.colorClass || dotFallbacks[idx % dotFallbacks.length];
      const color = dot.replace('dot-', '');
      // Derive id from stage key: ORDER_TAKEN → ordertaken, READY_TO_DELIVER → readytodeliver
      const id = d.stageKey.toLowerCase().replace(/_/g, '');
      return {
        id,
        name: d.displayName,
        dot,
        barClass: `bar-${color}`,
        pillClass: `pill-${color}`,
        stageKey: d.stageKey,
        deptLabel: d.deptLabel,
        requiredRole: d.requiredRole,
        imageUrl: d.imageUrl,
        pinnedEmployees: d.pinnedEmployees || []
      };
    });

    if (cachedEmployees && cachedEmployees.length > 0) {
      updateStageLeadsFromEmployees(cachedEmployees);
    }

    renderKanbanColumns();
    updateModalStageOptions();
    renderKanban();
  } catch (err) {
    console.warn('[Production] Could not load stage definitions, using fallback:', err.message);
  }
}

function renderKanbanColumns() {
  const board = document.getElementById('kanbanBoard');
  if (!board) return;

  board.innerHTML = STAGES.map(stage => {
    const imgHtml = stage.imageUrl
      ? `<img src="${formatStageImgUrl(stage.imageUrl)}" class="stage-col-thumb" alt="${stage.name}" onerror="this.style.display='none'" />`
      : getStageHeaderIconSvg(stage.id);

    return `
      <div class="kanban-col col-${stage.id}" data-stage-id="${stage.id}" ondragover="handleDragOver(event)"
        ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, '${stage.id}')">
        <div class="k-col-header" onclick="toggleCollapseCol(event,'${stage.id}')" style="cursor:pointer;">
          <div class="k-title-group">
            <span class="stage-dot ${stage.dot}"></span>
            ${imgHtml}
            <span class="k-col-name">${stage.name}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="k-col-count" id="count-${stage.id}">0</span>
            <button class="k-col-collapse-btn" onclick="toggleCollapseCol(event,'${stage.id}')" title="Collapse column" aria-label="Toggle ${stage.name} column">
              <svg class="chevron-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          </div>
        </div>
        <div class="k-cards-zone" id="zone-${stage.id}">
          <!-- Injected via JS -->
        </div>
        <button class="btn-add-order-col" onclick="openNewOrderModal('${stage.id}')">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Order</span>
        </button>
      </div>
    `;
  }).join('');

  // Restore collapse state after DOM rebuild
  if (typeof restoreCollapsedCols === 'function') restoreCollapsedCols();
}

function updateModalStageOptions() {
  const moStage = document.getElementById('moStage');
  if (moStage) {
    const curVal = moStage.value;
    moStage.innerHTML = STAGES.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    if (curVal && STAGES.some(s => s.id === curVal)) {
      moStage.value = curVal;
    } else if (STAGES.length > 0) {
      moStage.value = STAGES[0].id;
    }
  }

  const assignStageSelect = document.getElementById('assignStageSelect');
  if (assignStageSelect) {
    const curVal = assignStageSelect.value;
    assignStageSelect.innerHTML = STAGES.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    if (curVal && STAGES.some(s => s.id === curVal)) {
      assignStageSelect.value = curVal;
    } else if (STAGES.length > 0) {
      assignStageSelect.value = STAGES[0].id;
    }
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

// Lead specialists assigned by stage (computed dynamically from active employees)
let STAGE_LEADS = {};

function updateStageLeadsFromEmployees(employees) {
  if (!employees || employees.length === 0) return;

  STAGES.forEach(st => {
    // Tier 1: User-assigned pinned specialist from stage definitions management
    if (st.pinnedEmployees && st.pinnedEmployees.length > 0) {
      const p = st.pinnedEmployees[0];
      STAGE_LEADS[st.id] = `${p.name} (${p.role || st.requiredRole || 'Specialist'})`;
      return;
    }

    // Tier 2: Match active employee whose role matches user-configured requiredRole
    const targetRole = st.requiredRole ? String(st.requiredRole).toUpperCase().trim() : null;
    if (targetRole) {
      const match = employees.find(e => String(e.role || '').toUpperCase().trim() === targetRole);
      if (match) {
        STAGE_LEADS[st.id] = `${match.name} (${match.role})`;
        return;
      }
    }

    // Tier 3: User-defined department label, or fallback to unassigned
    if (st.deptLabel && st.deptLabel.trim()) {
      STAGE_LEADS[st.id] = st.deptLabel.trim();
    } else {
      STAGE_LEADS[st.id] = 'Unassigned';
    }
  });

  // Update in-memory orders if team was unassigned
  if (Array.isArray(productionOrders)) {
    productionOrders.forEach(o => {
      if (!o.team || o.team === 'Unassigned') {
        o.team = STAGE_LEADS[o.stage] || 'Unassigned';
      }
    });
  }
}

// Production Orders Store
let productionOrders = [];
let cachedEmployees = [];

// Active dragging & transition tracking
let draggedOrderId = null;
let pendingTransition = null;
let currentDetailOrderId = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initSearchShortcuts();
  renderKanbanColumns();
  renderKanban();

  (async () => {
    try {
      const { default: api } = await import('../api.js');
      window.api = api;

      // 0. Load stage definitions first (so STAGES is dynamic before orders render)
      await loadStageDefinitions(api);

      // 1. Fetch Orders from Database (include cancelled orders to display as frozen at their current stage)
      const res = await api.orders.list({ page: 0, size: 100 });
      const items = (Array.isArray(res) ? res : (res?.content || []));
      if (items.length > 0) {
        const todayIso = new Date().toISOString().split('T')[0];

        productionOrders = items.map(o => {
          const isCancelled = String(o.status || '').toUpperCase() === 'CANCELLED';
          const stage = mapCurrentStageToKanban(o.currentStage, o.status);
          const dueDateStr = o.dueDate ? String(o.dueDate) : (o.expectedDeliveryDate ? String(o.expectedDeliveryDate) : todayIso);
          const isDelayed = !isCancelled && dueDateStr < todayIso && !isFinalStage(stage);

          return {
            id: o.orderCode || ('ORD-' + o.id),
            dbId: o.id,
            customer: o.customerName || 'Valued Client',
            garment: o.garmentType || 'Bespoke Garment',
            category: o.garmentType || 'Blouse',
            stage: stage,
            status: o.status || 'IN_PROGRESS',
            isCancelled: isCancelled,
            priority: o.priority || (stage === 'handwork' || stage === 'stitching' ? 'High' : 'Normal'),
            team: STAGE_LEADS[stage] || 'Unassigned',
            fabric: o.collection || 'Pure Silk',
            notes: o.productionNotes || o.notes || 'Custom specifications applied.',
            dueDate: dueDateStr,
            dueLabel: isCancelled ? 'Frozen (Cancelled)' : (isFinalStage(stage) ? 'Completed' : (isDelayed ? `Overdue (${dueDateStr})` : `Due: ${dueDateStr}`)),
            delayed: isDelayed,
            qcReworkCount: Number(o.qcReworkCount) || 0,
            image: GARMENT_IMAGES[o.garmentType] || GARMENT_IMAGES.default
          };
        });

        // Populate garment filter dynamically from real orders
        const filterGarmentSelect = document.getElementById('filterGarment');
        if (filterGarmentSelect && items.length > 0) {
          const uniqueGarments = [...new Set(items.map(o => o.garmentType).filter(Boolean))];
          if (uniqueGarments.length > 0) {
            filterGarmentSelect.innerHTML = '<option value="all">All Garments</option>' +
              uniqueGarments.map(g => `<option value="${g}">${g}</option>`).join('');
          }
        }

        renderKanban();
      }

      // 2. Load Specialists from Database
      try {
        const employees = await api.employees.list({ status: 'ACTIVE' }).catch(() => []);
        cachedEmployees = Array.isArray(employees) ? employees : (employees?.content || []);
        if (cachedEmployees.length > 0) {
          updateStageLeadsFromEmployees(cachedEmployees);

          // Populate Assign Specialist modal dropdown
          const selectEl = document.getElementById('assignSpecialistSelect');
          if (selectEl) {
            selectEl.innerHTML = '<option value="">Select Specialist...</option>' +
              cachedEmployees.map(e => `<option value="${e.name}">${e.name} (${e.role || 'Specialist'})</option>`).join('');
          }

          // Populate New Order Specialist dropdown
          const moTeamSelect = document.getElementById('moTeam');
          if (moTeamSelect) {
            moTeamSelect.innerHTML = '<option value="">Auto-assign Lead Specialist</option>' +
              cachedEmployees.map(e => `<option value="${e.name} (${e.role || 'Specialist'})">${e.name} (${e.role || 'Specialist'})</option>`).join('');
          }

          // Populate Workflow Filter Team dropdown
          const filterTeamSelect = document.getElementById('filterTeam');
          if (filterTeamSelect) {
            filterTeamSelect.innerHTML = '<option value="all">All Specialists</option>' +
              cachedEmployees.map(e => `<option value="${e.name}">${e.name} (${e.role || 'Specialist'})</option>`).join('');
          }

          updateTeamPerformance(cachedEmployees);
          renderKanban();
        }
      } catch (empErr) {
        console.warn('[Production] Failed to load employees:', empErr.message);
      }
    } catch (err) {
      console.error('[Production] Failed to load orders from API:', err.message);
    }
  })();

  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/**
 * Live Clock Updater
 */
function initClock() {
  function updateTime() {
    const now = new Date();
    const dateOpts = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-GB', dateOpts);

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    const liveDate = document.getElementById('liveDateDisplay');
    const liveTime = document.getElementById('liveTimeDisplay');
    if (liveDate) liveDate.textContent = dateStr;
    if (liveTime) liveTime.textContent = timeStr;
  }
  updateTime();
  setInterval(updateTime, 1000);
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
    }
  });
}

function focusSearch() {
  const searchInput = document.getElementById('globalSearchInput') || document.getElementById('workflowSearchInput');
  if (searchInput) {
    searchInput.focus();
    searchInput.select();
  }
}

/**
 * Render Kanban Board Columns and Cards
 */
function renderKanban(filteredList = null) {
  const listToRender = filteredList || productionOrders;

  STAGES.forEach((stage) => {
    const zone = document.getElementById(`zone-${stage.id}`);
    const countBadge = document.getElementById(`count-${stage.id}`);
    if (!zone) return;

    const stageOrders = listToRender.filter(o => o.stage === stage.id);

    if (countBadge) {
      countBadge.textContent = stageOrders.length;
    }

    zone.innerHTML = '';
    if (stageOrders.length === 0) {
      zone.innerHTML = `
        <div style="padding: 24px 10px; text-align: center; color: rgba(255,255,255,0.3); font-size: 11px; border: 1px dashed rgba(255,255,255,0.06); border-radius: 8px;">
          No orders in ${stage.name}
        </div>
      `;
      return;
    }

    stageOrders.forEach(order => {
      const card = createOrderCardElement(order);
      zone.appendChild(card);
    });
  });

  // Dynamically compute and refresh all analytics
  updateAnalytics();
  if (typeof _renderStageSummaryStrip === 'function') {
    const sec = document.querySelector('.workflow-section');
    if (sec && sec.classList.contains('section-collapsed')) {
      _renderStageSummaryStrip();
    }
  }
}

/**
 * Create Kanban Card DOM Element
 */
function createOrderCardElement(order) {
  const card = document.createElement('div');
  let cardClass = 'kanban-card';
  if (order.isCancelled) cardClass += ' card-cancelled-frozen';
  else if (order.qcReworkCount > 0) cardClass += ' qc-rework-card';
  card.className = cardClass;
  card.setAttribute('draggable', order.isCancelled ? 'false' : 'true');
  card.setAttribute('data-order-id', order.id);

  card.addEventListener('dragstart', (e) => handleDragStart(e, order.id));
  card.addEventListener('dragend', handleDragEnd);

  card.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    openOrderDetails(order.id);
  });

  const prioClass = order.priority ? order.priority.toLowerCase() : 'normal';
  const statusClass = order.isCancelled ? 'cancelled' : (order.stage === 'ready' ? 'ontrack' : (order.delayed ? 'delayed' : 'ontrack'));
  const statusText = order.isCancelled ? 'Frozen (Cancelled)' : (order.stage === 'ready' ? 'Completed' : (order.delayed ? 'Delayed' : 'On Track'));

  const stageObj = STAGES.find(s => s.id === order.stage);

  card.innerHTML = `
    <div class="kc-header">
      <div class="kc-thumb-wrap">
        <img 
          src="${order.image || GARMENT_IMAGES.default}" 
          alt="${order.garment}" 
          class="kc-thumb-img" 
          loading="lazy"
          onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
        />
        ${stageObj?.imageUrl ? `<img src="${formatStageImgUrl(stageObj.imageUrl)}" class="kc-stage-badge" alt="${stageObj.name}" title="${stageObj.name} Stage" onerror="this.style.display='none'" />` : ''}
      </div>
      <div class="kc-info">
        <div class="kc-title-row">
          <span class="kc-garment" title="${order.garment}">${order.garment}</span>
          <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
            ${order.isCancelled ? `<span class="kc-cancelled-badge" title="Production workflow halted and frozen">✕ FROZEN</span>` : ''}
            ${order.qcReworkCount > 0 ? `<span class="qc-rework-pill" title="Sent for QC rework ${order.qcReworkCount} time(s)">⚠ QC Rework${order.qcReworkCount > 1 ? ` ×${order.qcReworkCount}` : ''}</span>` : ''}
            <span class="kc-prio-badge ${prioClass}">${order.priority}</span>
          </div>
        </div>
        <span class="kc-customer" title="${order.customer}">${order.customer}</span>
        <span class="kc-order-id">${order.id}</span>
      </div>
    </div>

    <div class="kc-body">
      <div class="kc-spec-row">
        <span>Lead:</span>
        <span class="kc-spec-val" title="${order.team}">${order.team || 'Unassigned'}</span>
      </div>
      <div class="kc-spec-row">
        <span>Fabric:</span>
        <span class="kc-spec-val" title="${order.fabric}">${order.fabric || 'Standard'}</span>
      </div>
    </div>

    <div class="kc-footer">
      <div class="kc-due-badge ${order.isCancelled ? 'cancelled' : (order.delayed ? 'delayed' : '')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        <span>${order.dueLabel || order.dueDate}</span>
      </div>
      <span class="kc-status-pill ${statusClass}">${statusText}</span>
    </div>
  `;

  return card;
}

/**
 * HTML5 Drag and Drop Handlers
 */
function handleDragStart(e, orderId) {
  const order = productionOrders.find(o => o.id === orderId);
  if (order && order.isCancelled) {
    e.preventDefault();
    showToast('Cannot move a cancelled order. Production is frozen at this stage.', 'warn');
    return;
  }
  draggedOrderId = orderId;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', orderId);
  e.currentTarget.classList.add('is-dragging');
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('is-dragging');
  document.querySelectorAll('.kanban-col').forEach(col => {
    col.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const col = e.currentTarget;
  if (!col.classList.contains('drag-over')) {
    col.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  const col = e.currentTarget;
  col.classList.remove('drag-over');
}

function handleDrop(e, targetStage) {
  e.preventDefault();
  const col = e.currentTarget;
  col.classList.remove('drag-over');

  const orderId = e.dataTransfer.getData('text/plain') || draggedOrderId;
  if (!orderId) return;

  const order = productionOrders.find(o => o.id === orderId);
  if (!order) return;
  if (order.stage === targetStage) return;

  // Requirement: To move from one stage to another, the user MUST assign an employee on that stage.
  openStageTransitionModal(order, targetStage);
}

/**
 * Mapping of boutique production stages to department specializations & roles
 */
const STAGE_DEPARTMENT_MAP = {
  'ordertaken': { roles: ['STYLIST', 'DESIGNER', 'MANAGER'], label: 'Order Intake & Reception' },
  'designing': { roles: ['DESIGNER'], label: 'Design Studio' },
  'lining': { roles: ['FINISHER'], label: 'Finishing & Lining' },
  'handwork': { roles: ['EMBROIDERER'], label: 'Embroidery & Maggam' },
  'cutting': { roles: ['CUTTER'], label: 'Master Cutting' },
  'stitching': { roles: ['TAILOR'], label: 'Tailoring & Stitching' },
  'trial': { roles: ['SUPERVISOR', 'TAILOR'], label: 'Fitting & Trial' },
  'qc': { roles: ['MANAGER', 'SUPERVISOR'], label: 'Quality Control' },
  'readytodeliver': { roles: ['DISPATCHER', 'MANAGER', 'SUPERVISOR'], label: 'Delivery & Handover' },
  'ready': { roles: ['DISPATCHER', 'MANAGER', 'SUPERVISOR'], label: 'Delivery & Handover' }
};

/**
 * Open Stage Transition & Specialist Assignment Modal
 */
function openStageTransitionModal(order, targetStage) {
  pendingTransition = { order, targetStage };

  const currentStageObj = STAGES.find(s => s.id === order.stage);
  const targetStageObj = STAGES.find(s => s.id === targetStage);

  const orderLabel = document.getElementById('transOrderLabel');
  const clientGarment = document.getElementById('transClientGarment');
  const currentBadge = document.getElementById('transCurrentBadge');
  const targetBadge = document.getElementById('transTargetBadge');
  const deptHint = document.getElementById('transDeptHint');
  const employeeSelect = document.getElementById('transEmployeeSelect');
  const notesInput = document.getElementById('transNotesInput');
  const errorMsg = document.getElementById('transErrorMsg');

  if (orderLabel) orderLabel.textContent = order.id;
  if (clientGarment) clientGarment.textContent = `${order.customer} • ${order.garment} (${order.fabric || 'Pure Silk'})`;
  if (currentBadge) {
    const curImg = currentStageObj?.imageUrl
      ? `<img src="${formatStageImgUrl(currentStageObj.imageUrl)}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:6px;border:1.5px solid rgba(212,175,55,0.7);box-shadow:0 2px 6px rgba(0,0,0,0.35);" onerror="this.style.display='none'" />`
      : '';
    currentBadge.innerHTML = `${curImg}<span>${currentStageObj ? currentStageObj.name : order.stage}</span>`;
  }
  if (targetBadge) {
    const tgtImg = targetStageObj?.imageUrl
      ? `<img src="${formatStageImgUrl(targetStageObj.imageUrl)}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:6px;border:1.5px solid rgba(212,175,55,0.7);box-shadow:0 2px 6px rgba(0,0,0,0.35);" onerror="this.style.display='none'" />`
      : '';
    targetBadge.innerHTML = `${tgtImg}<span>${targetStageObj ? targetStageObj.name : targetStage}</span>`;
  }

  if (errorMsg) errorMsg.style.display = 'none';
  if (notesInput) notesInput.value = '';

  const recDept = STAGE_DEPARTMENT_MAP[targetStage] || { roles: [], role: '', label: 'Production Specialists' };
  if (deptHint) deptHint.textContent = `Target Dept: ${recDept.label}`;

  if (employeeSelect) {
    if (cachedEmployees.length === 0) {
      employeeSelect.innerHTML = '<option value="">-- None / Unassigned (Optional) --</option>';
    } else {
      const targetRoles = (recDept.roles || (recDept.role ? [recDept.role] : [])).map(r => String(r || '').toUpperCase());

      // STRICTLY display ONLY the employees under the stage's category/department
      const categoryEmployees = cachedEmployees.filter(e => {
        const empRole = String(e.role || '').toUpperCase();
        if (targetRoles.length === 0) return true;
        return targetRoles.some(r => empRole.includes(r));
      });

      let html = '<option value="">-- None / Unassigned (Optional) --</option>';

      if (categoryEmployees.length > 0) {
        html += `<optgroup label="${recDept.label} Specialists (${categoryEmployees.length} Available)">`;
        categoryEmployees.forEach(e => {
          const code = e.employeeCode ? `[${e.employeeCode}] ` : '';
          const spec = e.specialization ? ` — ${e.specialization}` : '';
          html += `<option value="${e.id || e.name}" data-name="${e.name}" data-role="${e.role || 'Specialist'}">${code}${e.name} (${e.role || 'Specialist'}${spec})</option>`;
        });
        html += '</optgroup>';
      } else {
        html += `<optgroup label="All Available Specialists (${cachedEmployees.length} Available)">`;
        cachedEmployees.forEach(e => {
          const code = e.employeeCode ? `[${e.employeeCode}] ` : '';
          const spec = e.specialization ? ` — ${e.specialization}` : '';
          html += `<option value="${e.id || e.name}" data-name="${e.name}" data-role="${e.role || 'Specialist'}">${code}${e.name} (${e.role || 'Specialist'}${spec})</option>`;
        });
        html += '</optgroup>';
      }

      employeeSelect.innerHTML = html;
      employeeSelect.value = '';
    }
  }

  openModal('stageTransitionModal');
}

/**
 * Confirm Stage Transition with Assigned Specialist (Optional)
 */
function confirmStageTransition(e) {
  if (e && e.preventDefault) e.preventDefault();

  if (!pendingTransition) {
    closeModal('stageTransitionModal');
    return;
  }

  const employeeSelect = document.getElementById('transEmployeeSelect');
  const errorMsg = document.getElementById('transErrorMsg');
  const selectedVal = employeeSelect ? employeeSelect.value.trim() : '';

  if (errorMsg) errorMsg.style.display = 'none';

  let empId = null;
  let empName = 'Unassigned';
  let empRole = 'General Atelier';

  if (selectedVal && employeeSelect && employeeSelect.selectedIndex >= 0) {
    const selectedOpt = employeeSelect.options[employeeSelect.selectedIndex];
    empId = selectedVal;
    empName = selectedOpt.getAttribute('data-name') || selectedOpt.text;
    empRole = selectedOpt.getAttribute('data-role') || 'Specialist';
  }

  const notes = document.getElementById('transNotesInput')?.value?.trim() || '';

  const { order, targetStage } = pendingTransition;
  const targetStageObj = STAGES.find(s => s.id === targetStage);
  const targetStageName = targetStageObj ? targetStageObj.name : targetStage;

  // 1. Update order in local store
  order.stage = targetStage;
  order.team = empId ? `${empName} (${empRole})` : 'Unassigned';
  if (notes) {
    order.notes = notes;
  }

  const todayIsoStr = new Date().toISOString().split('T')[0];
  if (isFinalStage(targetStage)) {
    order.delayed = false;
    order.dueLabel = 'Completed';
  } else if (order.dueDate && order.dueDate < todayIsoStr) {
    order.delayed = true;
    order.dueLabel = `Overdue (${order.dueDate})`;
  } else {
    order.delayed = false;
    order.dueLabel = `Due: ${order.dueDate}`;
  }

  // 2. Refresh UI immediately
  applyWorkflowFilters();
  closeModal('stageTransitionModal');
  closeModal('orderDetailsModal');

  if (empId) {
    showToast(`Assigned ${empName} & moved ${order.id} to ${targetStageName}!`);
  } else {
    showToast(`Moved ${order.id} to ${targetStageName}!`);
  }

  // 3. Persist transition to PostgreSQL backend
  const backendStage = mapKanbanToBackendStage(targetStage);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(empId);

  let backendStatus = 'IN_PROGRESS';
  if (isInitialStage(targetStage)) backendStatus = 'PENDING';
  else if (isFinalStage(targetStage)) backendStatus = 'READY';

  if (order.dbId && window.api) {
    if (window.api.production && window.api.production.transition) {
      window.api.production.transition(order.dbId, backendStage, isUuid ? empId : null, notes)
        .then(res => console.log('[Production] Stage transition saved to backend:', res))
        .catch(err => {
          console.warn('[Production] Transition API error, falling back to orders.update:', err.message);
          if (window.api.orders) {
            window.api.orders.update(order.dbId, {
              currentStage: backendStage,
              status: backendStatus,
              productionNotes: notes || order.notes
            }).catch(e => console.warn('[Production] Fallback update failed:', e.message));
          }
        });
    } else if (window.api.orders) {
      window.api.orders.update(order.dbId, {
        currentStage: backendStage,
        status: backendStatus,
        productionNotes: notes || order.notes
      }).catch(e => console.warn('[Production] Fallback update failed:', e.message));
    }
  }

  pendingTransition = null;
}

/**
 * Cancel Stage Transition
 */
function cancelStageTransition() {
  pendingTransition = null;
  const errorMsg = document.getElementById('transErrorMsg');
  if (errorMsg) errorMsg.style.display = 'none';
  closeModal('stageTransitionModal');
  showToast('Stage move cancelled. Order retained in current stage.');
}

/**
 * Advance order to next sequential stage from Order Details Job Card
 */
function advanceOrderFromModal() {
  if (!currentDetailOrderId) return;
  const order = productionOrders.find(o => o.id === currentDetailOrderId);
  if (!order) return;

  const currentIdx = STAGES.findIndex(s => s.id === order.stage);
  if (currentIdx < 0 || currentIdx >= STAGES.length - 1) {
    showToast('This order has already reached the final stage (Ready)!');
    return;
  }

  const nextStage = STAGES[currentIdx + 1];
  openStageTransitionModal(order, nextStage.id);
}

/**
 * Multi-filter and Search Processing
 */
function handleWorkflowSearch() {
  applyWorkflowFilters();
}

function applyWorkflowFilters() {
  const searchVal = (document.getElementById('workflowSearchInput')?.value || '').toLowerCase().trim();
  const garmentVal = document.getElementById('filterGarment')?.value || 'all';
  const teamVal = document.getElementById('filterTeam')?.value || 'all';
  const dueVal = document.getElementById('filterDueDate')?.value || 'all';

  const filtered = productionOrders.filter(order => {
    if (searchVal) {
      const matchText = `${order.id} ${order.customer} ${order.garment} ${order.fabric} ${order.team}`.toLowerCase();
      if (!matchText.includes(searchVal)) return false;
    }

    if (garmentVal !== 'all') {
      if (order.category !== garmentVal && !order.garment.toLowerCase().includes(garmentVal.toLowerCase())) {
        return false;
      }
    }

    if (teamVal !== 'all') {
      if (!order.team.toLowerCase().includes(teamVal.toLowerCase())) return false;
    }

    if (dueVal !== 'all') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      if (dueVal === 'overdue' && !order.delayed) return false;
      if (dueVal === 'today' && order.dueDate !== todayStr) return false;
      if (dueVal === 'tomorrow' && order.dueDate !== tomorrowStr) return false;
      if (dueVal === 'week' && (order.dueDate < todayStr || order.dueDate > nextWeekStr)) return false;
    }

    return true;
  });

  renderKanban(filtered);
}

/**
 * Filter by clicking Bottlenecks or Chart Bars
 */
function filterByStage(stageId) {
  const col = document.querySelector(`.col-${stageId}`);
  if (col) {
    col.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    col.style.transition = 'box-shadow 0.3s ease';
    col.style.boxShadow = '0 0 24px rgba(163, 230, 53, 0.45)';
    setTimeout(() => {
      col.style.boxShadow = '';
    }, 1500);
  }
}

/**
 * Master Analytics Computation & Real-Time Rendering
 */
function updateAnalytics() {
  const total = productionOrders.length;
  const inProduction = productionOrders.filter(o => !isFinalStage(o.stage)).length;
  const delayed = productionOrders.filter(o => o.delayed && !isFinalStage(o.stage)).length;
  const onTrack = Math.max(0, inProduction - delayed);
  const completed = productionOrders.filter(o => isFinalStage(o.stage)).length;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const dueThisWeek = productionOrders.filter(o =>
    !isFinalStage(o.stage) &&
    o.dueDate &&
    o.dueDate >= todayStr &&
    o.dueDate <= nextWeekStr
  ).length;

  // 1. Top KPI Cards
  const elTotal = document.getElementById('kpiTotalOrders');
  const elTotalSub = document.getElementById('kpiTotalOrdersSub');
  const elInProd = document.getElementById('kpiInProduction');
  const elInProdSub = document.getElementById('kpiInProductionSub');
  const elOnTrack = document.getElementById('kpiOnTrack');
  const elOnTrackSub = document.getElementById('kpiOnTrackSub');
  const elDelayed = document.getElementById('kpiDelayed');
  const elDelayedSub = document.getElementById('kpiDelayedSub');
  const elDueWeek = document.getElementById('kpiDueThisWeek');
  const elDueWeekSub = document.getElementById('kpiDueThisWeekSub');

  if (elTotal) elTotal.textContent = total;
  if (elTotalSub) elTotalSub.textContent = total > 0 ? `${total} active in boutique` : '0 active';

  if (elInProd) elInProd.textContent = inProduction;
  if (elInProdSub) elInProdSub.textContent = total > 0 ? `${Math.round((inProduction / total) * 100)}% of total` : '0%';

  if (elOnTrack) elOnTrack.textContent = onTrack;
  if (elOnTrackSub) elOnTrackSub.textContent = inProduction > 0 ? `${Math.round((onTrack / inProduction) * 100)}% on schedule` : '100%';

  if (elDelayed) elDelayed.textContent = delayed;
  if (elDelayedSub) elDelayedSub.textContent = delayed > 0 ? `${Math.round((delayed / (inProduction || 1)) * 100)}% attention needed` : '0% delayed';

  if (elDueWeek) elDueWeek.textContent = dueThisWeek;
  if (elDueWeekSub) elDueWeekSub.textContent = `${dueThisWeek} in next 7 days`;

  // 2. Production Completion Donut (r = 38, perimeter = 2 * PI * 38 ≈ 238.76)
  const C_COMP = 238.76;
  const compPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const donutPctEl = document.getElementById('kpiDonutPct');
  if (donutPctEl) donutPctEl.textContent = `${compPct}%`;

  const lenComp = total > 0 ? (completed / total) * C_COMP : 0;
  const lenProg = total > 0 ? (onTrack / total) * C_COMP : 0;
  const lenDel = total > 0 ? (delayed / total) * C_COMP : 0;

  const segComp = document.getElementById('donutSegCompleted');
  const segProg = document.getElementById('donutSegProgress');
  const segDel = document.getElementById('donutSegDelayed');

  if (segComp) {
    segComp.setAttribute('stroke-dasharray', `${lenComp.toFixed(1)} ${C_COMP.toFixed(1)}`);
    segComp.setAttribute('stroke-dashoffset', '0');
  }
  if (segProg) {
    segProg.setAttribute('stroke-dasharray', `${lenProg.toFixed(1)} ${C_COMP.toFixed(1)}`);
    segProg.setAttribute('stroke-dashoffset', `-${lenComp.toFixed(1)}`);
  }
  if (segDel) {
    segDel.setAttribute('stroke-dasharray', `${lenDel.toFixed(1)} ${C_COMP.toFixed(1)}`);
    segDel.setAttribute('stroke-dashoffset', `-${(lenComp + lenProg).toFixed(1)}`);
  }

  const legComp = document.getElementById('kpiLegendCompleted');
  const legProg = document.getElementById('kpiLegendProgress');
  const legDel = document.getElementById('kpiLegendDelayed');
  if (legComp) legComp.textContent = completed;
  if (legProg) legProg.textContent = inProduction;
  if (legDel) legDel.textContent = delayed;

  // 3. On-Time vs Delayed Donut (r = 44, perimeter = 2 * PI * 44 ≈ 276.46)
  const C_OT = 276.46;
  const activeOrdersCount = inProduction || 1;
  const onTimePct = inProduction > 0 ? Math.round((onTrack / activeOrdersCount) * 100) : 100;
  const delayedPct = 100 - onTimePct;

  const otPctDisplay = document.getElementById('otPctDisplay');
  if (otPctDisplay) otPctDisplay.textContent = `${onTimePct}%`;

  const otValOntime = document.getElementById('otValOntime');
  const otValDelayed = document.getElementById('otValDelayed');
  if (otValOntime) otValOntime.textContent = `${onTimePct}% (${onTrack})`;
  if (otValDelayed) otValDelayed.textContent = `${delayedPct}% (${delayed})`;

  const lenOt = (onTrack / activeOrdersCount) * C_OT;
  const lenOtDel = (delayed / activeOrdersCount) * C_OT;

  const otSegOntime = document.getElementById('otSegOntime');
  const otSegDelayed = document.getElementById('otSegDelayed');
  if (otSegOntime) {
    otSegOntime.setAttribute('stroke-dasharray', `${lenOt.toFixed(1)} ${C_OT.toFixed(1)}`);
    otSegOntime.setAttribute('stroke-dashoffset', '69');
  }
  if (otSegDelayed) {
    otSegDelayed.setAttribute('stroke-dasharray', `${lenOtDel.toFixed(1)} ${C_OT.toFixed(1)}`);
    otSegDelayed.setAttribute('stroke-dashoffset', `${(69 - lenOt).toFixed(1)}`);
  }

  // 4. Update Sub-Charts and Panels
  updateBarChart();
  updateAvgTimeChart();
  updateBottlenecks();
  updateDeadlines();
  if (cachedEmployees.length > 0) {
    updateTeamPerformance(cachedEmployees);
  }
}

/**
 * Render Production Load Bar Chart (All 8 Stages)
 */
function updateBarChart() {
  const chart = document.getElementById('stageBarChart');
  if (!chart) return;

  const stageCounts = STAGES.map(st => ({
    stage: st,
    count: productionOrders.filter(o => o.stage === st.id).length
  }));
  const maxCount = Math.max(1, ...stageCounts.map(s => s.count));

  chart.innerHTML = stageCounts.map(({ stage, count }) => {
    const heightPct = Math.max(16, Math.round((count / maxCount) * 100));
    return `
      <div class="bar-col" data-stage="${stage.name}" title="${stage.name}: ${count} garments" onclick="filterByStage('${stage.id}')" style="cursor: pointer;">
        <span class="bar-count">${count}</span>
        <div class="bar-track">
          <div class="bar-fill ${stage.barClass}" style="height: ${heightPct}%;"></div>
        </div>
        <span class="bar-label">${stage.name}</span>
      </div>
    `;
  }).join('');
}

/**
 * Render Average Production Time
 */
function updateAvgTimeChart() {
  const container = document.getElementById('avgTimeChart');
  if (!container) return;

  const stageGroups = [
    { label: 'Intake & Design', stages: ['ordertaken', 'designing'], bar: 'bar-emerald' },
    { label: 'Prep & Cutting', stages: ['lining', 'cutting'], bar: 'bar-yellow' },
    { label: 'Embroidery & Stitching', stages: ['handwork', 'stitching', 'embroidery'], bar: 'bar-green' },
    { label: 'QC & Delivery', stages: ['trial', 'qc', 'finishing', 'readytodeliver', 'ready'], bar: 'bar-silver' }
  ];

  const times = stageGroups.map(grp => {
    const matchedOrders = productionOrders.filter(o => grp.stages.includes(o.stage));
    let totalTurnaround = 0;
    let counted = 0;
    matchedOrders.forEach(o => {
      if (o.dueDate) {
        const dDue = new Date(o.dueDate);
        const dCreated = o.createdAt ? new Date(o.createdAt) : new Date();
        const diffDays = Math.max(1, Math.round((dDue - dCreated) / (1000 * 60 * 60 * 24)));
        totalTurnaround += Math.max(1, Math.round(diffDays / 4));
        counted++;
      }
    });
    const avg = counted > 0 ? Math.max(1, Math.round(totalTurnaround / counted)) : 2;
    return { label: grp.label, days: avg, bar: grp.bar };
  });

  const maxDays = Math.max(1, ...times.map(t => t.days));

  container.innerHTML = times.map(t => {
    const heightPct = Math.round((t.days / maxDays) * 100);
    return `
      <div class="at-col" title="${t.label}: ${t.days} days average turnaround">
        <span class="at-val">${t.days}d</span>
        <div class="at-track">
          <div class="at-fill ${t.bar}" style="height: ${heightPct}%;"></div>
        </div>
        <span class="at-label">${t.label}</span>
      </div>
    `;
  }).join('');
}

/**
 * Render Bottlenecks Panel (Stages with Highest Active Load or Delays)
 */
function updateBottlenecks() {
  const container = document.getElementById('bottlenecksList');
  if (!container) return;

  const stageStats = STAGES
    .filter(s => !isFinalStage(s.id))
    .map(st => {
      const orders = productionOrders.filter(o => o.stage === st.id);
      const delayed = orders.filter(o => o.delayed).length;
      return { stage: st, count: orders.length, delayed };
    })
    .sort((a, b) => (b.delayed * 10 + b.count) - (a.delayed * 10 + a.count))
    .slice(0, 3);

  container.innerHTML = stageStats.map(({ stage, count, delayed }) => `
    <div class="bn-row" onclick="filterByStage('${stage.id}')" style="cursor: pointer;" title="Filter by ${stage.name}">
      <div class="bn-stage-pill ${stage.pillClass}">
        <span class="stage-dot ${stage.dot}"></span>
      </div>
      <span class="bn-name">${stage.name}</span>
      <span class="bn-count">${count} orders</span>
      <span class="bn-delay" style="${delayed > 0 ? 'color:#f87171;' : 'color:rgba(255,255,255,0.5);'}">
        ${delayed > 0 ? `(${delayed} delayed)` : '(On track)'}
      </span>
    </div>
  `).join('');
}

/**
 * Render Upcoming Deadlines Panel (Sorted by Delivery Due Date)
 */
function updateDeadlines() {
  const container = document.getElementById('deadlinesList');
  if (!container) return;

  const activeOrders = productionOrders
    .filter(o => !isFinalStage(o.stage) && o.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  if (activeOrders.length === 0) {
    container.innerHTML = `<div style="padding:16px;text-align:center;color:rgba(255,255,255,0.4);font-size:11px;">No pending deadlines</div>`;
    return;
  }

  container.innerHTML = activeOrders.map(o => {
    const stageObj = STAGES.find(s => s.id === o.stage);
    const stageName = stageObj ? stageObj.name : o.stage;
    const dot = stageObj ? stageObj.dot : 'dot-emerald';
    const dateFormatted = new Date(o.dueDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return `
      <div class="dl-row" onclick="openOrderDetails('${o.id}')" style="cursor:pointer;" title="Click to view details of ${o.id}">
        <span class="dl-dot ${dot}"></span>
        <span class="dl-date">${dateFormatted}</span>
        <span class="dl-orders">${o.id} (${o.garment.split(' ')[0]})</span>
        <span class="dl-stage">${stageName}</span>
      </div>
    `;
  }).join('');
}

/**
 * Render Team Performance Panel
 */
function updateTeamPerformance(empList) {
  const perfList = document.getElementById('teamPerfList');
  if (!perfList) return;

  if (!empList || empList.length === 0) {
    perfList.innerHTML = `<div class="empty-state-notice" style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;">No specialist data recorded</div>`;
    return;
  }

  const colors = ['fill-purple', 'fill-lime', 'fill-cyan', 'fill-green', 'fill-pink'];
  const roleToStageMap = {
    'DESIGNER': 'designing',
    'CUTTER': 'cutting',
    'TAILOR': 'stitching',
    'FINISHER': 'lining',
    'EMBROIDERER': 'handwork',
    'SUPERVISOR': 'trial',
    'MANAGER': 'qc'
  };

  const topEmps = empList.slice(0, 5);
  perfList.innerHTML = topEmps.map((e, idx) => {
    const stageKey = roleToStageMap[e.role] || 'stitching';
    const count = productionOrders.filter(o => o.stage === stageKey).length;
    const widthPct = Math.min(100, Math.max(30, count * 12));
    return `
      <div class="team-perf-row" title="${e.name} — ${e.role} (${e.specialization || ''})">
        <span class="tp-name">${e.name}</span>
        <div class="tp-bar-track">
          <div class="tp-bar-fill ${colors[idx % colors.length]}" style="width: ${widthPct}%;"></div>
        </div>
        <span class="tp-val">${count} active</span>
      </div>
    `;
  }).join('');
}

/**
 * Modals Management
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.classList.remove('active');
  });
}

/**
 * + New Order Modal
 */
function openNewOrderModal(preferredStage = 'designing') {
  const stageSelect = document.getElementById('moStage');
  if (stageSelect) {
    stageSelect.value = preferredStage;
  }

  const dueInput = document.getElementById('moDueDate');
  if (dueInput && !dueInput.value) {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    dueInput.value = d.toISOString().split('T')[0];
  }

  openModal('newOrderModal');
}

async function handleCreateOrderSubmit(e) {
  e.preventDefault();
  const customer = document.getElementById('moCustomer').value.trim();
  const garment = document.getElementById('moGarment').value;
  const stage = document.getElementById('moStage').value;
  const dueDate = document.getElementById('moDueDate').value;
  const team = document.getElementById('moTeam')?.value || '';
  const priority = document.getElementById('moPriority').value;
  const notes = document.getElementById('moNotes').value.trim();

  if (!customer || !dueDate) {
    alert('Please complete all required fields.');
    return;
  }

  const backendStage = mapKanbanToBackendStage(stage);
  let backendStatus = 'IN_PROGRESS';
  if (isInitialStage(stage)) backendStatus = 'PENDING';
  else if (isFinalStage(stage)) backendStatus = 'READY';

  let createdOrder = null;
  if (window.api && window.api.orders) {
    try {
      createdOrder = await window.api.orders.create({
        customerName: customer,
        garmentType: garment,
        currentStage: backendStage,
        status: backendStatus,
        dueDate: dueDate,
        expectedDeliveryDate: dueDate,
        priority: priority,
        productionNotes: notes
      });
    } catch (apiErr) {
      console.warn('[Production] Failed to save order to API:', apiErr.message);
    }
  }

  const todayIso = new Date().toISOString().split('T')[0];
  const isDelayed = dueDate < todayIso && !isFinalStage(stage);
  const assignedTeam = team || STAGE_LEADS[stage] || 'Unassigned';

  const newOrder = {
    id: createdOrder?.orderCode || `ORD-${Date.now().toString().slice(-4)}`,
    dbId: createdOrder?.id,
    customer,
    garment,
    category: garment,
    stage,
    priority,
    team: assignedTeam,
    fabric: 'Pure Silk',
    notes: notes || 'Custom specifications applied.',
    dueDate,
    dueLabel: isFinalStage(stage) ? 'Completed' : (isDelayed ? `Overdue (${dueDate})` : `Due: ${dueDate}`),
    delayed: isDelayed,
    image: GARMENT_IMAGES[garment] || GARMENT_IMAGES.default
  };

  productionOrders.unshift(newOrder);
  renderKanban();
  closeModal('newOrderModal');
  document.getElementById('newOrderForm').reset();
  showToast(`Order ${newOrder.id} for ${customer} created successfully!`);
}

/**
 * Order Details & Job Card Preview
 */
function openOrderDetails(orderId) {
  const order = productionOrders.find(o => o.id === orderId);
  if (!order) return;
  currentDetailOrderId = orderId;

  const titleEl = document.getElementById('odModalTitle');
  if (titleEl) titleEl.textContent = `Job Card — ${order.id}`;

  const bodyEl = document.getElementById('orderDetailsContent');
  if (!bodyEl) return;

  const stageObj = STAGES.find(s => s.id === order.stage);
  const stageName = stageObj ? stageObj.name : order.stage;

  // Configure advance button in modal
  const advanceBtn = document.getElementById('btnAdvanceFromDetails');
  if (advanceBtn) {
    if (order.isCancelled) {
      advanceBtn.style.display = 'inline-flex';
      advanceBtn.disabled = true;
      advanceBtn.innerHTML = `Production Frozen (cancaled at ${stageName})`;
      advanceBtn.style.background = '#dc2626';
      advanceBtn.style.cursor = 'not-allowed';
      advanceBtn.style.opacity = '0.75';
    } else {
      advanceBtn.disabled = false;
      advanceBtn.style.background = '';
      advanceBtn.style.cursor = 'pointer';
      advanceBtn.style.opacity = '1';
      const curIdx = STAGES.findIndex(s => s.id === order.stage);
      if (curIdx >= 0 && curIdx < STAGES.length - 1) {
        const nextStage = STAGES[curIdx + 1];
        advanceBtn.style.display = 'inline-flex';
        advanceBtn.innerHTML = `Advance to ${nextStage.name} & Assign Specialist ➔`;
      } else {
        advanceBtn.style.display = 'none';
      }
    }
  }

  const cancelledBannerHtml = order.isCancelled ? `
    <div style="background:rgba(239,68,68,0.16);border:1px solid rgba(239,68,68,0.55);color:#fca5a5;padding:8px 14px;border-radius:8px;margin-bottom:14px;font-size:12.5px;font-weight:700;">
      cancaled at ${stageName}
    </div>
  ` : '';

  bodyEl.innerHTML = `
    ${cancelledBannerHtml}
    <div class="od-hero">
      <img 
        src="${order.image || GARMENT_IMAGES.default}" 
        alt="${order.garment}" 
        class="od-image"
        onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
      />
      <div class="od-info">
        <h4 class="od-name">${order.garment}</h4>
        <span class="od-customer">Client: <strong>${order.customer}</strong></span>
        <div class="od-badge-row">
          ${order.isCancelled ? `<span class="kc-cancelled-badge" style="font-size:10px;padding:2px 8px;">✕ FROZEN (CANCELLED)</span>` : ''}
          ${order.qcReworkCount > 0 ? `<span class="qc-rework-pill" style="font-size:10px;padding:2px 8px;">⚠ QC Rework ×${order.qcReworkCount}</span>` : ''}
          <span class="kc-prio-badge ${order.priority.toLowerCase()}">${order.priority} Priority</span>
          <span class="kc-status-pill ${order.isCancelled ? 'cancelled' : (isFinalStage(order.stage) ? 'ontrack' : (order.delayed ? 'delayed' : 'ontrack'))}">
            ${order.isCancelled ? 'Frozen (Cancelled)' : (isFinalStage(order.stage) ? 'Completed' : (order.delayed ? 'Delayed' : 'On Track'))}
          </span>
        </div>
      </div>
    </div>

    <div class="od-grid">
      <div class="od-item">
        <span class="od-item-label">Current Stage</span>
        <span class="od-item-value" style="display:flex;align-items:center;gap:7px;color:#a3e635;">
          ${stageObj?.imageUrl ? `<img src="${formatStageImgUrl(stageObj.imageUrl)}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(212,175,55,0.7);box-shadow:0 2px 6px rgba(0,0,0,0.35);" onerror="this.style.display='none'" />` : ''}
          <span>${stageName}</span>
        </span>
      </div>
      <div class="od-item">
        <span class="od-item-label">Assigned Team / Lead</span>
        <span class="od-item-value">${order.team || 'Unassigned'}</span>
      </div>
      <div class="od-item">
        <span class="od-item-label">Target Due Date</span>
        <span class="od-item-value">${order.dueDate}</span>
      </div>
      <div class="od-item" style="grid-column: span 3;">
        <span class="od-item-label">Tailoring Notes & Work Instructions</span>
        <p style="font-size: 11.5px; color: rgba(255,255,255,0.85); line-height: 1.4; margin-top: 4px;">
          ${order.notes}
        </p>
      </div>
    </div>
  `;

  openModal('orderDetailsModal');
}

/**
 * Assign Team Modal (Strictly filters specialists by stage category)
 */
function handleAssignStageChange() {
  const stageSelect = document.getElementById('assignStageSelect');
  const specSelect = document.getElementById('assignSpecialistSelect');
  if (!stageSelect || !specSelect) return;

  const stage = stageSelect.value;
  const stageObj = STAGES.find(s => s.id === stage);
  const thumbEl = document.getElementById('assignStageThumb');
  if (thumbEl) {
    if (stageObj && stageObj.imageUrl) {
      thumbEl.src = formatStageImgUrl(stageObj.imageUrl);
      thumbEl.style.display = 'block';
    } else {
      thumbEl.style.display = 'none';
    }
  }

  const recDept = STAGE_DEPARTMENT_MAP[stage] || { roles: [], label: 'Specialists' };
  const targetRoles = (recDept.roles || (recDept.role ? [recDept.role] : [])).map(r => String(r || '').toUpperCase());

  const categoryEmployees = cachedEmployees.filter(e => {
    const empRole = String(e.role || '').toUpperCase();
    if (targetRoles.length === 0) return true;
    return targetRoles.some(r => empRole.includes(r));
  });

  if (categoryEmployees.length > 0) {
    let html = `<option value="">-- Select Specialist (${recDept.label}) --</option>`;
    html += `<optgroup label="${recDept.label} Specialists (${categoryEmployees.length} Available)">`;
    categoryEmployees.forEach(e => {
      const code = e.employeeCode ? `[${e.employeeCode}] ` : '';
      const spec = e.specialization ? ` — ${e.specialization}` : '';
      html += `<option value="${e.name}">${code}${e.name} (${e.role || 'Specialist'}${spec})</option>`;
    });
    html += '</optgroup>';
    specSelect.innerHTML = html;
    specSelect.value = categoryEmployees[0].name;
  } else {
    specSelect.innerHTML = '<option value="">No specialists found for this stage category</option>';
  }
}

function openAssignTeamModal() {
  handleAssignStageChange();
  openModal('assignTeamModal');
}

function submitTeamAssignment() {
  const stage = document.getElementById('assignStageSelect').value;
  const specialist = document.getElementById('assignSpecialistSelect').value;

  if (specialist) {
    STAGE_LEADS[stage] = specialist;
    productionOrders.forEach(o => {
      if (o.stage === stage) o.team = specialist;
    });
    renderKanban();
  }

  showToast(`Assigned ${specialist || 'specialist'} to lead ${stage.toUpperCase()} stage!`);
  closeModal('assignTeamModal');
}

/**
 * Quick Action Triggers
 */
function openUpdateProductionModal() {
  showToast('Opening Production Status Batch Updater...');
}

function printJobCard() {
  showToast('Sending Job Card to Workshop Receipt Printer...');
  setTimeout(() => {
    window.print();
  }, 350);
}

function viewAllStages() {
  const el = document.getElementById('kanbanBoard');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function focusBottlenecks() {
  const worstStage = STAGES
    .filter(s => !isFinalStage(s.id))
    .map(st => {
      const orders = productionOrders.filter(o => o.stage === st.id);
      const delayed = orders.filter(o => o.delayed).length;
      return { stageId: st.id, score: delayed * 10 + orders.length };
    })
    .sort((a, b) => b.score - a.score)[0];

  const targetId = worstStage ? worstStage.stageId : 'stitching';
  filterByStage(targetId);
}

function viewAllDeadlines() {
  const select = document.getElementById('filterDueDate');
  if (select) {
    select.value = 'week';
    applyWorkflowFilters();
    showToast('Filtered orders due this week');
  }
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
    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 3200);
}

// Attach functions to window for HTML event handlers
window.openStageTransitionModal = openStageTransitionModal;
window.confirmStageTransition = confirmStageTransition;
window.cancelStageTransition = cancelStageTransition;
window.advanceOrderFromModal = advanceOrderFromModal;
window.openOrderDetails = openOrderDetails;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.handleDrop = handleDrop;
window.handleDragStart = handleDragStart;
window.handleDragEnd = handleDragEnd;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.openNewOrderModal = openNewOrderModal;
window.handleCreateOrderSubmit = handleCreateOrderSubmit;
window.openAssignTeamModal = openAssignTeamModal;
window.handleAssignStageChange = handleAssignStageChange;
window.submitTeamAssignment = submitTeamAssignment;
window.openUpdateProductionModal = openUpdateProductionModal;
window.printJobCard = printJobCard;
window.viewAllStages = viewAllStages;
window.focusBottlenecks = focusBottlenecks;
window.viewAllDeadlines = viewAllDeadlines;
window.filterByStage = filterByStage;
window.applyWorkflowFilters = applyWorkflowFilters;
window.resetWorkflowFilters = resetWorkflowFilters;
window.showToast = showToast;

// ==========================================================
// LEVEL 1 — PER-COLUMN HORIZONTAL COLLAPSE  (‹ / ›)
// ==========================================================

function _colGetSaved() {
  try { return JSON.parse(localStorage.getItem(_COL_STORAGE_KEY) || '{}'); }
  catch (_) { return {}; }
}

function _colSave(state) {
  localStorage.setItem(_COL_STORAGE_KEY, JSON.stringify(state));
}

/**
 * Toggle a Kanban column open/closed (horizontally to 38px strip).
 * Exposed on window so HTML onclick="toggleCollapseCol(...)" works.
 */
function toggleCollapseCol(e, stageId) {
  if (e) e.stopPropagation();
  const col = document.querySelector(`.kanban-col[data-stage-id="${stageId}"]`);
  if (!col) return;
  const nowCollapsed = col.classList.toggle('col-collapsed');
  const s = _colGetSaved();
  s[stageId] = nowCollapsed;
  _colSave(s);
  col.querySelectorAll('.k-col-collapse-btn').forEach(btn => {
    btn.title = nowCollapsed ? 'Expand column' : 'Collapse column';
  });
}
window.toggleCollapseCol = toggleCollapseCol;

/**
 * Restore each column's open/closed state from localStorage.
 * Called on page load and after renderKanbanColumns() rebuilds the DOM.
 */
function restoreCollapsedCols() {
  const s = _colGetSaved();
  document.querySelectorAll('.kanban-col').forEach(col => {
    const id = col.dataset.stageId;
    if (!id) return;
    if (s[id]) {
      col.classList.add('col-collapsed');
    } else {
      col.classList.remove('col-collapsed');
    }
    // Allow clicking the whole collapsed column body to expand it
    if (!col._collapseListenerBound) {
      col._collapseListenerBound = true;
      col.addEventListener('click', ev => {
        if (!col.classList.contains('col-collapsed')) return;
        if (ev.target.closest('.k-col-collapse-btn')) return;
        toggleCollapseCol(null, col.dataset.stageId);
      });
    }
  });
}
window.restoreCollapsedCols = restoreCollapsedCols;

// Auto-expand a collapsed column when a card is dropped onto it
const _colOrigDrop = window.handleDrop;
window.handleDrop = function (e, stageId) {
  const col = document.querySelector(`.kanban-col[data-stage-id="${stageId}"]`);
  if (col && col.classList.contains('col-collapsed')) {
    col.classList.remove('col-collapsed');
    const s = _colGetSaved();
    delete s[stageId];
    _colSave(s);
  }
  if (typeof _colOrigDrop === 'function') _colOrigDrop(e, stageId);
};

// ==========================================================
// LEVEL 2 — SECTION COLLAPSE  (‹ on section header)
// ==========================================================

function toggleWorkflowSection(e) {
  if (e) e.stopPropagation();
  const section = document.querySelector('.workflow-section');
  if (!section) return;
  const nowCollapsed = section.classList.toggle('section-collapsed');
  localStorage.setItem(_SEC_KEY, nowCollapsed ? '1' : '0');
  const btn = document.getElementById('wfSectionCollapseBtn');
  if (btn) btn.title = nowCollapsed ? 'Expand board' : 'Collapse board';
  if (nowCollapsed) _renderStageSummaryStrip();
}
window.toggleWorkflowSection = toggleWorkflowSection;

function _renderStageSummaryStrip() {
  const strip = document.getElementById('wfStageSummaryStrip');
  if (!strip) return;
  const orders = (typeof productionOrders !== 'undefined' && Array.isArray(productionOrders)) ? productionOrders : [];
  strip.innerHTML = STAGES.map(stage => {
    const count = orders.filter(o => o.stage === stage.id).length;
    const img = stage.imageUrl
      ? `<img src="${formatStageImgUrl(stage.imageUrl)}" class="pill-thumb" alt="" onerror="this.style.display='none'">`
      : `<span class="stage-dot ${stage.dot}" style="flex-shrink:0;width:10px;height:10px;"></span>`;
    return `<div class="wf-stage-pill"
                 onclick="expandSectionTo('${stage.id}')"
                 title="Expand and go to ${stage.name}">
      ${img}
      <span>${stage.name}</span>
      <span class="pill-count">${count}</span>
    </div>`;
  }).join('');
}
window._renderStageSummaryStrip = _renderStageSummaryStrip;

function expandSectionTo(stageId) {
  const section = document.querySelector('.workflow-section');
  if (section && section.classList.contains('section-collapsed')) {
    section.classList.remove('section-collapsed');
    localStorage.setItem(_SEC_KEY, '0');
    const btn = document.getElementById('wfSectionCollapseBtn');
    if (btn) btn.title = 'Collapse board section';
  }
  setTimeout(() => {
    const col = document.querySelector(`.kanban-col[data-stage-id="${stageId}"]`);
    if (col) {
      if (col.classList.contains('col-collapsed')) {
        toggleCollapseCol(null, stageId);
      }
      col.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  }, 400);
}
window.expandSectionTo = expandSectionTo;

function _restoreSectionState() {
  if (localStorage.getItem(_SEC_KEY) === '1') {
    const section = document.querySelector('.workflow-section');
    if (section) {
      section.classList.add('section-collapsed');
      const btn = document.getElementById('wfSectionCollapseBtn');
      if (btn) btn.title = 'Expand board';
      _renderStageSummaryStrip();
    }
  }
}

// ==========================================================
// LEVEL 3 — COLLAPSE-ALL  (‹ All button)
// ==========================================================

function toggleCollapseAll(e) {
  if (e) e.stopPropagation();
  _allCollapsed = !_allCollapsed;
  localStorage.setItem(_ALL_KEY, _allCollapsed ? '1' : '0');
  const board = document.getElementById('kanbanBoard');
  const btn = document.getElementById('btnCollapseAll');
  if (board) board.classList.toggle('board-all-collapsed', _allCollapsed);
  if (btn) btn.classList.toggle('all-collapsed', _allCollapsed);
  const label = document.querySelector('.collapse-all-label');
  if (label) label.textContent = _allCollapsed ? 'Expand' : 'All';
  if (btn) btn.title = _allCollapsed ? 'Expand all columns' : 'Collapse all columns';

  const s = _colGetSaved();
  document.querySelectorAll('.kanban-col').forEach(col => {
    const id = col.dataset.stageId;
    if (!id) return;
    col.classList.toggle('col-collapsed', _allCollapsed);
    s[id] = _allCollapsed;
    col.querySelectorAll('.k-col-collapse-btn').forEach(b => {
      b.title = _allCollapsed ? 'Expand column' : 'Collapse column';
    });
  });
  _colSave(s);
}
window.toggleCollapseAll = toggleCollapseAll;

function _restoreCollapseAllState() {
  if (localStorage.getItem(_ALL_KEY) === '1') {
    _allCollapsed = true;
    document.getElementById('kanbanBoard')?.classList.add('board-all-collapsed');
    const btn = document.getElementById('btnCollapseAll');
    if (btn) {
      btn.classList.add('all-collapsed');
      btn.title = 'Expand all columns';
    }
    const label = document.querySelector('.collapse-all-label');
    if (label) label.textContent = 'Expand';
    document.querySelectorAll('.kanban-col').forEach(col => {
      col.classList.add('col-collapsed');
      col.querySelectorAll('.k-col-collapse-btn').forEach(b => {
        b.title = 'Expand column';
      });
    });
  }
}

// Restore all states on page load
function _restoreAllCollapseStates() {
  restoreCollapsedCols();
  _restoreSectionState();
  _restoreCollapseAllState();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _restoreAllCollapseStates);
} else {
  _restoreAllCollapseStates();
}

