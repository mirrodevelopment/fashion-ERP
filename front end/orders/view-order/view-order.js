/**
 * ============================================================
 * HAULO BOUTIQUE ERP — VIEW ORDER / ORDER DETAILS CONTROLLER
 * Path: frontend/orders/view-order/view-order.js
 * Complete dynamic data binding to PostgreSQL orders & customer APIs
 * ============================================================
 */

(function () {
  'use strict';

  // ─── Centralized Order State (populated via API) ───
  const orderState = {
    rawId: '',
    orderId: '',
    garmentType: '',
    garmentDesc: '',
    collection: '',
    designCategory: 'Bespoke Custom Atelier',
    status: 'PENDING',
    priority: 'Normal',
    currentStage: 'ORDER',
    referenceImages: [],      // Up to 5 uploaded image URLs from the backend
    productionNotes: '',      // Free-form tailor notes from the backend
    customer: {
      name: '',
      isVip: false,
      phone: '',
      location: '',
      avatar: '',
      notes: '',
      preferredNeck: '',
      preferredSleeve: '',
      preferredOccasions: '',
      deliveryPreference: ''
    },
    dates: {
      orderDate: '',
      expectedDelivery: '',
      daysLeft: 0,
      totalLeadDays: 14
    },
    financials: {
      orderValue: 0,
      paidAmount: 0,
      balanceAmount: 0,
      paidPct: 0
    },
    stages: [],
    currentStageIndex: 0,
    nextAction: {
      title: 'Pattern Cutting to begin',
      assignee: 'Master Pattern Cutter Kavitha M',
      buttonText: 'Mark as Started'
    },
    photos: [],
    activityHistory: [],
    measurements: []
  };

  // Holds API reference for use inside card renders (set during load)
  let _api = null;

  // Lightbox state
  let currentLightboxIndex = 0;

  // ─── Initial Page Load & Binding ───
  async function loadOrderFromApi() {
    try {
      let api = window.api;
      let Auth = window.Auth;

      if (!api) {
        try {
          const mod = await import('../../api.js');
          api = mod.default || mod.api || window.api;
          Auth = mod.Auth || window.Auth;
        } catch (_) {
          api = window.api;
          Auth = window.Auth;
        }
      }

      const params = new URLSearchParams(window.location.search);
      let orderId = params.get('id') || params.get('orderId') || params.get('orderCode') ||
        sessionStorage.getItem('selectedOrderId') || localStorage.getItem('selectedOrderId');

      // Fallback: If no order ID, query first order
      if (!orderId && api && api.orders) {
        try {
          const list = await api.orders.list({ page: 0, size: 1 });
          const items = Array.isArray(list) ? list : (list && list.content ? list.content : []);
          if (items.length > 0) {
            orderId = items[0].id || items[0].orderCode;
          }
        } catch (_) { }
      }

      if (!orderId) {
        console.warn('[ViewOrder] No order specified in URL or storage');
        return;
      }

      // 1. Fetch Order Record
      let order = null;
      if (api && api.orders) {
        try {
          order = await api.orders.get(orderId);
        } catch (_) {
          // If ID lookup failed (e.g. orderId was a code like ORD-2026-0012)
          try {
            const searchRes = await api.orders.list({ page: 0, size: 50 });
            const sItems = Array.isArray(searchRes) ? searchRes : (searchRes?.content || []);
            order = sItems.find(o => (o.orderCode === orderId || o.id === orderId));
          } catch (_) { }
        }
      }

      if (!order) {
        console.warn('[ViewOrder] Order not found for identifier:', orderId);
        return;
      }

      // Persist selection
      orderState.rawId = order.id;
      sessionStorage.setItem('selectedOrderId', order.id);
      localStorage.setItem('selectedOrderId', order.id);

      orderState.orderId = order.orderCode || ('ORD-' + order.id);
      orderState.garmentType = order.garmentType || 'Bespoke Garment';
      orderState.garmentDesc = order.garmentDesc || '';
      orderState.collection = order.collection || 'Custom Atelier';
      orderState.status = (order.status || 'PENDING').toUpperCase();

      // ─── NEW: Populate from DB columns ───
      orderState.currentStage = order.currentStage || 'ORDER';
      orderState.referenceImages = Array.isArray(order.referenceImages) ? order.referenceImages.filter(Boolean) : [];
      orderState.productionNotes = order.productionNotes || '';
      // Fetch live stages for real assigned craftsmen
      try {
        if (api && api.production && api.production.getByOrder) {
          orderState.liveStages = await api.production.getByOrder(order.id);
        }
      } catch (err) {
        console.warn('[ViewOrder] Could not fetch live order stages:', err.message);
      }

      let tot = Number(order.totalAmount !== undefined ? order.totalAmount : order.amount) || 0;
      const adv = Number(order.advancePaid) || 0;
      let bal = Number(order.balanceAmount !== undefined ? order.balanceAmount : (tot - adv)) || 0;
      if (tot <= 0 && adv > 0) {
        tot = adv + Math.max(0, bal);
        bal = Math.max(0, tot - adv);
      }
      const paidPct = tot > 0 ? Math.min(100, Math.round((adv / tot) * 100)) : 100;

      orderState.financials.orderValue = tot;
      orderState.financials.paidAmount = adv;
      orderState.financials.balanceAmount = bal;
      orderState.financials.paidPct = paidPct;

      orderState.dates.orderDate = order.orderDate ? String(order.orderDate) : new Date().toISOString().slice(0, 10);
      orderState.dates.expectedDelivery = order.expectedDeliveryDate || order.dueDate ? String(order.expectedDeliveryDate || order.dueDate) : new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

      // Days left calculation
      const expDate = new Date(orderState.dates.expectedDelivery);
      const oDate = new Date(orderState.dates.orderDate);
      const now = new Date();
      const daysLeft = Math.round((expDate - now) / (1000 * 60 * 60 * 24));
      const totalLead = Math.max(7, Math.round((expDate - oDate) / (1000 * 60 * 60 * 24)));
      const daysElapsed = Math.max(1, Math.min(totalLead, Math.round((now - oDate) / (1000 * 60 * 60 * 24))));
      orderState.dates.daysLeft = daysLeft;
      orderState.dates.totalLeadDays = totalLead;
      orderState.priority = daysLeft <= 7 ? 'High' : (daysLeft <= 14 ? 'Medium' : 'Normal');

      // 2. Fetch Customer Details
      const targetMobile = order.customerMobile || order.customerId;
      let customer = null;
      if (api && api.customers && targetMobile) {
        try {
          customer = await api.customers.get(targetMobile);
        } catch (_) {
          try {
            const cList = await api.customers.list({ search: targetMobile });
            const cItems = Array.isArray(cList) ? cList : (cList?.content || []);
            if (cItems.length > 0) customer = cItems[0];
          } catch (_) { }
        }
      }

      orderState.customer.name = (customer?.name && customer.name.trim()) ||
                                 (order.customerName && order.customerName.trim()) ||
                                 sessionStorage.getItem('selectedCustomerName') ||
                                 '—';
      orderState.customer.phone = targetMobile || customer?.mobileNumber || customer?.phone || '—';
      orderState.customer.location = [customer?.city, customer?.state].filter(Boolean).join(', ') || customer?.location || '—';
      orderState.customer.avatar = formatAvatarUrl(customer?.avatarUrl || order.customerAvatar);
      orderState.customer.isVip = !!(customer?.tier && (customer.tier.toUpperCase().includes('VIP') || customer.tier.toUpperCase().includes('PLATINUM')));
      orderState.customer.notes = customer?.notes || order.notes || '';
      orderState.customer.preferredNeck = customer?.preferredNeck || '';
      orderState.customer.preferredSleeve = customer?.preferredSleeve || '';
      orderState.customer.preferredOccasions = customer?.preferredOccasions || '';
      orderState.customer.deliveryPreference = customer?.deliveryPreference || '';

      // ─── Populate Header & Customer Card ───
      renderHeaderAndCustomerCard();

      // ─── 10-Stage Horizontal Stepper (Dynamic Stage Definitions from Database) ───
      await loadLiveStageDefinitions(api);
      setupProductionStages();
      initProductionStepper();

      // ─── Card 1: Design Reference Images ───
      renderDesignReferenceCard();

      // ─── Card 2: Order Specifications ───
      renderOrderDetailsCard();

      // ─── Card 3: Fabric & Materials ───
      renderFabricAndMaterialsCard();

      // ─── Card 4: Production Team ───
      await renderProductionTeamCard(api);

      // ─── Card 5: Measurements ───
      await renderMeasurementsCard(api, targetMobile);

      // ─── Card 6: Production Notes ───
      renderProductionNotesCard();

      // ─── Card 7: Photos & Updates ───
      renderPhotosAndUpdatesCard();

      // ─── Card 8: Timeline & Activity ───
      renderTimelineAndActivityCard();

      // ─── Row 3 Gauges & Next Action ───
      renderGaugesAndNextAction(daysElapsed, totalLead, daysLeft);

      // ─── Populate Print Job Card Modal ───
      populateJobCardModal();

      refreshLucideIcons();

    } catch (err) {
      console.error('[ViewOrder] Failed to load order from backend:', err);
    }
  }

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  // ─── Dynamic Stage Definitions & Artwork (Loaded from PostgreSQL stage_definitions) ───
  let _liveStageDefinitions = [];
  const _liveStageArtMap = {};

  function formatDisplayDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch (_) {
      return dateStr;
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

  function formatAvatarUrl(url) {
    if (!url) return '../../assets/user_avatar.jpg';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    const clean = url.replace(/^\/?front\s*end\//i, '').replace(/^\/+/, '');
    const origin = (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:'))
      ? window.location.origin
      : '';
    const encoded = clean.split('/').map(encodeURIComponent).join('/');
    return origin ? `${origin}/front%20end/${encoded}` : `/${encoded}`;
  }

  async function loadLiveStageDefinitions(apiClient) {
    try {
      if (apiClient?.production?.stageDefinitions?.list) {
        const list = await apiClient.production.stageDefinitions.list({ activeOnly: true });
        if (Array.isArray(list) && list.length > 0) {
          _liveStageDefinitions = list.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          list.forEach(s => {
            if (s.imageUrl) {
              const formatted = formatStageImgUrl(s.imageUrl);
              if (s.stageKey) _liveStageArtMap[s.stageKey.toUpperCase()] = formatted;
              if (s.displayName) _liveStageArtMap[s.displayName.toUpperCase()] = formatted;
            }
          });
        }
      }
    } catch (e) {
      console.warn('[ViewOrder] Live stage definitions load error:', e.message);
    }
  }

  // Fallback blueprint if stage definitions table is not yet reachable
  const DEFAULT_STAGES = [
    { code: 'DESIGNING', label: 'Design', role: 'DESIGNER', sortOrder: 1 },
    { code: 'LINING', label: 'Lining', role: 'TAILOR', sortOrder: 2 },
    { code: 'HAND_WORK', label: 'Hand Work', role: 'EMBROIDERER', sortOrder: 3 },
    { code: 'CUTTING', label: 'Cutting', role: 'CUTTER', sortOrder: 4 },
    { code: 'STITCHING', label: 'Stitching', role: 'TAILOR', sortOrder: 5 },
    { code: 'HEMMING', label: 'Hemming', role: 'FINISHER', sortOrder: 6 },
    { code: 'TRIAL', label: 'Trial', role: 'TAILOR', sortOrder: 7 },
    { code: 'QC', label: 'QC', role: 'SUPERVISOR', sortOrder: 8 },
    { code: 'READY_TO_DELIVER', label: 'Ready', role: 'DISPATCHER', sortOrder: 9 },
    { code: 'DELIVERED', label: 'Delivered', role: 'DISPATCHER', sortOrder: 10 }
  ];

  function getEffectiveStageDefs() {
    if (_liveStageDefinitions && _liveStageDefinitions.length > 0) {
      return _liveStageDefinitions.map(sd => ({
        code: sd.stageKey,
        label: sd.displayName || sd.stageKey,
        role: sd.requiredRole || '',
        pinnedEmployees: sd.pinnedEmployees || [],
        sortOrder: sd.sortOrder || 0
      }));
    }
    return DEFAULT_STAGES;
  }

  function findStageIndex(stageCode) {
    if (!stageCode) return 0;
    const s = String(stageCode).trim().toUpperCase();
    const defs = getEffectiveStageDefs();
    let idx = defs.findIndex(d => d.code.toUpperCase() === s || d.label.toUpperCase() === s);
    if (idx >= 0) return idx;

    // Fuzzy matching
    if (s.includes('ORDER') || s.includes('NEW')) idx = defs.findIndex(d => d.code.includes('ORDER'));
    else if (s.includes('DESIGN')) idx = defs.findIndex(d => d.code.includes('DESIGN'));
    else if (s.includes('LINING') || s.includes('FABRIC')) idx = defs.findIndex(d => d.code.includes('LINING'));
    else if (s.includes('CUT')) idx = defs.findIndex(d => d.code.includes('CUT'));
    else if (s.includes('HAND') || s.includes('EMB') || s.includes('WORK')) idx = defs.findIndex(d => d.code.includes('HAND') || d.code.includes('EMB'));
    else if (s.includes('STITCH') || s.includes('SEW')) idx = defs.findIndex(d => d.code.includes('STITCH'));
    else if (s.includes('TRIAL') || s.includes('FIT')) idx = defs.findIndex(d => d.code.includes('TRIAL'));
    else if (s.includes('QC') || s.includes('QUAL')) idx = defs.findIndex(d => d.code.includes('QC'));
    else if (s.includes('READY')) idx = defs.findIndex(d => d.code.includes('READY'));
    else if (s.includes('DELIVER')) idx = defs.findIndex(d => d.code.includes('DELIVER'));

    return idx >= 0 ? idx : 0;
  }

  function formatStatusLabel(status) {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING') return 'Pending Review';
    if (s === 'READY') return 'Ready for Pickup';
    if (s === 'DELIVERED') return 'Delivered';
    if (s === 'CANCELLED') return 'Cancelled';
    return 'In Production';
  }

  function formatStageLabel(stage) {
    const defs = getEffectiveStageDefs();
    const idx = findStageIndex(stage);
    return defs[idx]?.label || stage;
  }

  function renderHeaderAndCustomerCard() {
    const bcNum = document.getElementById('bcOrderNumber');
    if (bcNum) bcNum.textContent = orderState.orderId;

    const titleDisplay = document.getElementById('orderTitleDisplay');
    if (titleDisplay) titleDisplay.textContent = orderState.orderId;

    const statusDisplay = document.getElementById('orderStatusDisplay');
    if (statusDisplay) {
      statusDisplay.innerHTML = '<span class="status-dot"></span> ' + formatStatusLabel(orderState.status);
      statusDisplay.className = 'status-pill ' + getStatusClass(orderState.status);
    }

    const colDisplay = document.getElementById('orderCollectionDisplay');
    if (colDisplay) {
      colDisplay.textContent = `${orderState.garmentType} • ${orderState.collection}`;
    }

    // Customer Compact Card
    const ccAvatar = document.getElementById('ccAvatarImg');
    if (ccAvatar) {
      ccAvatar.src = orderState.customer.avatar || '../../assets/user_avatar.jpg';
      ccAvatar.alt = orderState.customer.name;
    }

    const ccName = document.getElementById('ccName');
    if (ccName) ccName.textContent = orderState.customer.name;

    const ccBadge = document.getElementById('ccBadge');
    if (ccBadge) {
      ccBadge.style.display = orderState.customer.isVip ? 'inline-flex' : 'none';
    }

    const ccPhone = document.getElementById('ccPhone');
    if (ccPhone) ccPhone.textContent = orderState.customer.phone;

    const ccLoc = document.getElementById('ccLocation');
    if (ccLoc) ccLoc.textContent = orderState.customer.location;

    const ccPrefRow = document.getElementById('ccPrefRow');
    if (ccPrefRow) ccPrefRow.style.display = 'none';

    const ccOrderDate = document.getElementById('ccOrderDate');
    if (ccOrderDate) ccOrderDate.textContent = formatDisplayDate(orderState.dates.orderDate);

    const ccDeliveryDate = document.getElementById('ccDeliveryDate');
    if (ccDeliveryDate) ccDeliveryDate.textContent = formatDisplayDate(orderState.dates.expectedDelivery);

    const ccDaysLeft = document.getElementById('ccDaysLeft');
    if (ccDaysLeft) {
      const dl = orderState.dates.daysLeft;
      ccDaysLeft.textContent = dl > 0 ? `${dl} days left` : (dl === 0 ? 'Due Today' : `${Math.abs(dl)} days overdue`);
      ccDaysLeft.className = `cc-stat-sub ${dl <= 5 ? 'red' : (dl <= 10 ? 'yellow' : 'green')}`;
    }

    const ccPriority = document.getElementById('ccPriority');
    if (ccPriority) {
      ccPriority.textContent = orderState.priority;
      ccPriority.className = `priority-pill ${orderState.priority === 'High' ? 'red' : (orderState.priority === 'Medium' ? 'yellow' : 'green')}`;
    }

    const ccOrderValue = document.getElementById('ccOrderValue');
    if (ccOrderValue) {
      ccOrderValue.textContent = '₹' + orderState.financials.orderValue.toLocaleString('en-IN');
    }

    const ccPaymentBadge = document.getElementById('ccPaymentBadge');
    if (ccPaymentBadge) {
      const adv = orderState.financials.paidAmount;
      const bal = orderState.financials.balanceAmount;
      if (bal <= 0 && adv > 0) {
        ccPaymentBadge.textContent = 'Fully Paid';
      } else {
        ccPaymentBadge.textContent = 'Advance Paid';
      }
      ccPaymentBadge.className = 'cc-stat-sub green';
    }

    const customerBtn = document.getElementById('btnCustomerQuickOptions');
    if (customerBtn && orderState.customer.phone) {
      customerBtn.onclick = () => {
        window.location.href = `../../customer/Customer360/customer360.html?mobile=${encodeURIComponent(orderState.customer.phone)}`;
      };
    }
  }

  function getStatusClass(status) {
    switch ((status || '').toUpperCase()) {
      case 'PENDING': return 'status-pending';
      case 'READY': return 'status-ready';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-in-prod';
    }
  }

  // ─── Production Stage Stepper Setup (Connected to Live Database) ───
  function setupProductionStages() {
    const defs = getEffectiveStageDefs();
    const curIdx = findStageIndex(orderState.currentStage || orderState.status);
    orderState.currentStageIndex = curIdx;

    orderState.stages = defs.map((def, idx) => {
      let st = 'upcoming';
      if (idx < curIdx) st = 'completed';
      else if (idx === curIdx) st = 'current';

      // Find real assignee from live order stages or pinned employee
      let stageAssignee = 'Unassigned';
      if (orderState.liveStages && Array.isArray(orderState.liveStages)) {
        const matched = orderState.liveStages.find(ls => {
          if (!ls.stageName) return false;
          const lsUpper = ls.stageName.toUpperCase();
          return lsUpper === def.code.toUpperCase() || lsUpper === def.label.toUpperCase();
        });
        if (matched) {
          if (matched.status === 'COMPLETED') st = 'completed';
          else if (matched.status === 'IN_PROGRESS') st = 'current';

          if (matched.assignedTo && typeof matched.assignedTo === 'object' && matched.assignedTo.name) {
            stageAssignee = matched.assignedTo.name;
          } else if (typeof matched.assignedTo === 'string' && matched.assignedTo.trim()) {
            stageAssignee = matched.assignedTo.trim();
          }
        }
      }

      if (stageAssignee === 'Unassigned' && def.pinnedEmployees && def.pinnedEmployees.length > 0) {
        stageAssignee = def.pinnedEmployees[0].name || def.pinnedEmployees[0].fullName || 'Unassigned';
      }

      return {
        code: def.code,
        name: def.label,
        assignee: stageAssignee,
        status: st,
        sortOrder: def.sortOrder
      };
    });
  }

  function initProductionStepper() {
    const stepperContainer = document.getElementById('productionStepper');
    if (!stepperContainer) return;

    stepperContainer.innerHTML = '';
    const totalStages = orderState.stages.length;

    orderState.stages.forEach((stage, idx) => {
      const node = document.createElement('div');
      node.className = `step-node ${stage.status}`;
      node.setAttribute('data-stage-idx', idx);
      node.setAttribute('title', `${stage.name} · Assigned to ${stage.assignee}`);

      let circleContent = '';
      if (stage.status === 'completed') {
        circleContent = '✓';
      } else if (stage.status === 'current') {
        circleContent = '<span class="step-cur-dot"></span>';
      } else {
        circleContent = '<span class="step-pending-dot"></span>';
      }

      node.innerHTML = `
        <div class="step-circle">${circleContent}</div>
        <span class="step-label">${stage.name}</span>
      `;

      node.addEventListener('click', () => handleStageClick(idx));
      stepperContainer.appendChild(node);

      if (idx < totalStages - 1) {
        const connector = document.createElement('div');
        connector.className = 'step-connector';
        if (idx < orderState.currentStageIndex) {
          connector.classList.add('completed');
        } else if (idx === orderState.currentStageIndex) {
          connector.classList.add('active-to-current');
        }
        const pctLeft = ((idx + 0.5) / totalStages) * 100;
        const pctWidth = (1 / totalStages) * 100;
        connector.style.left = `${pctLeft}%`;
        connector.style.width = `${pctWidth}%`;
        stepperContainer.appendChild(connector);
      }
    });
  }

  async function handleStageClick(stageIdx) {
    const targetStage = orderState.stages[stageIdx];
    if (!targetStage) return;

    if (stageIdx === orderState.currentStageIndex) {
      showToast(`Current Stage: ${targetStage.name} (Assigned to ${targetStage.assignee})`, 'info');
      return;
    }

    await transitionToStage(stageIdx);
  }

  async function transitionToStage(stageIdx) {
    const targetDef = orderState.stages[stageIdx];
    if (!targetDef) return;

    orderState.currentStage = targetDef.code;
    orderState.currentStageIndex = stageIdx;

    let newStatus = 'IN_PROGRESS';
    if (stageIdx === 0) newStatus = 'PENDING';
    else if (targetDef.code.includes('READY')) newStatus = 'READY';
    else if (targetDef.code.includes('DELIVER')) newStatus = 'DELIVERED';
    orderState.status = newStatus;

    orderState.stages.forEach((s, i) => {
      if (i < stageIdx) s.status = 'completed';
      else if (i === stageIdx) s.status = 'current';
      else s.status = 'upcoming';
    });

    initProductionStepper();
    renderHeaderAndCustomerCard();
    renderGaugesAndNextAction(
      orderState.dates.daysLeft ? Math.max(1, 14 - orderState.dates.daysLeft) : 4,
      orderState.dates.totalLeadDays || 14,
      orderState.dates.daysLeft || 10
    );
    refreshLucideIcons();

    if (_api && _api.production && _api.production.transition && orderState.rawId) {
      try {
        await _api.production.transition(orderState.rawId, targetDef.code);
        showToast(`Order progressed to ${targetDef.name}!`, 'success');
      } catch (err) {
        try {
          if (_api.orders && _api.orders.update) {
            await _api.orders.update(orderState.rawId, {
              currentStage: targetDef.code,
              status: newStatus
            });
          }
        } catch (_) { }
        showToast(`Stage updated to ${targetDef.name}`, 'info');
      }
    } else {
      showToast(`Order transitioned to ${targetDef.name}`, 'success');
    }
  }

  // ─── Card 1: Design Reference Images ───
  function renderDesignReferenceCard() {
    const gType = orderState.garmentType.toLowerCase();
    const uploadedImgs = orderState.referenceImages; // From DB (may be empty)

    // Fallback static images by garment type
    let fallbacks = [];
    if (gType.includes('kurti') || gType.includes('chudi') || gType.includes('salwar')) {
      fallbacks = [
        { src: '../../assets/designs/festive-kurti-hero.jpg', title: `${orderState.garmentType} — Mustard Gold Chanderi Silk Silhouette` },
        { src: '../../assets/designs/festive-kurti-yoke.jpg', title: 'Mandarin Collar & Split-V Antique Zari Yoke Detailing' },
        { src: '../../assets/fabrics/chanderi.jpg', title: 'Mustard Gold Chanderi Silk Swatch' },
        { src: '../../assets/fabrics/zari-motif.jpg', title: 'Antique Gold Zari Border Motif' }
      ];
    } else if (gType.includes('blouse')) {
      fallbacks = [
        { src: '../../assets/designs/zari-bloom-back.jpg', title: 'Deep Back Neck & Dori Latkans' },
        { src: '../../assets/designs/zari-bloom-front.jpg', title: 'Sweetheart Front Neck Profile' },
        { src: '../../assets/designs/zari-bloom-detail.jpg', title: 'Aari & Zardosi Needlework Detail' },
        { src: '../../assets/pink_silk.jpg', title: 'Silk Swatch' }
      ];
    } else if (gType.includes('lehenga')) {
      fallbacks = [
        { src: '../../assets/designs/lehenga-stage.png', title: 'Bridal Lehenga Kalidar Silhouette' },
        { src: '../../assets/designs/midnight-grace.jpg', title: 'Zari Border & Flare Detail' },
        { src: '../../assets/designs/petal-charm.jpg', title: 'Custom Choli Design' },
        { src: '../../assets/fabrics/silk.jpg', title: 'Brocade Silk Fabric Swatch' }
      ];
    } else if (gType.includes('gown') || gType.includes('anarkali')) {
      fallbacks = [
        { src: '../../assets/designs/gown-stage.png', title: 'Flared Evening Gown Silhouette' },
        { src: '../../assets/designs/skyline.jpg', title: 'Sheer Bodice & Yoke Embellishment' },
        { src: '../../assets/designs/meadow-grace.jpg', title: 'Floor-length Drape Detail' },
        { src: '../../assets/fabrics/georgette.jpg', title: 'Georgette Silk Swatch' }
      ];
    } else {
      fallbacks = [
        { src: '../../assets/designs/regal-drape.jpg', title: 'Heritage Silk Drape' },
        { src: '../../assets/designs/saree-stage.png', title: 'Pleat & Pallu Structure' },
        { src: '../../assets/fabrics/silk.jpg', title: 'Pure Silk Swatch' },
        { src: '../../assets/fabrics/zari-motif.jpg', title: 'Korvai Gold Border' }
      ];
    }

    // Build effective photos: use uploaded images where available, fall back otherwise
    const MAX_SLOTS = 5;
    const photos = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
      if (uploadedImgs[i]) {
        photos.push({ src: uploadedImgs[i], title: `Reference Image ${i + 1}`, uploaded: true, slot: i + 1 });
      } else if (fallbacks[i]) {
        photos.push({ src: fallbacks[i].src, title: fallbacks[i].title, uploaded: false, slot: i + 1 });
      }
    }
    orderState.photos = photos;

    // Set main large image
    const largeEl = document.getElementById('drLargeImg');
    if (largeEl && photos.length > 0) largeEl.src = photos[0].src;

    // Build thumbnail strip (slots 2-4 shown + upload button for slot 5 / overflow)
    const thumbsContainer = document.getElementById('drThumbsContainer');
    if (thumbsContainer) {
      // Build thumb items for slots 2, 3, 4
      const thumbItems = [1, 2, 3].map(idx => {
        const photo = photos[idx];
        if (photo) {
          return `
            <div class="dr-thumb-wrap" data-slot="${photo.slot}" title="${photo.title}">
              <img id="drThumb${idx}Img" src="${photo.src}" alt="Ref ${photo.slot}" onclick="openLightbox(${idx})" />
              ${photo.uploaded ? `<button class="dr-thumb-delete" title="Remove image" onclick="deleteRefImage(${photo.slot})">✕</button>` : ''}
            </div>`;
        }
        // Empty slot — show upload target
        return `
          <div class="dr-thumb-wrap dr-thumb-empty" data-slot="${idx + 1}"
               onclick="triggerRefUpload(${idx + 1})" title="Upload reference image ${idx + 1}">
            <div class="dr-upload-placeholder"><span>＋</span><small>Upload</small></div>
          </div>`;
      }).join('');

      const moreCount = Math.max(0, photos.length - 4);
      const moreEl = moreCount > 0
        ? `<div class="dr-more-count" onclick="triggerRefUpload(5)" title="Upload ref 5">+${moreCount}</div>`
        : `<div class="dr-thumb-wrap dr-thumb-empty" data-slot="5"
               onclick="triggerRefUpload(5)" title="Upload reference image 5">
             <div class="dr-upload-placeholder"><span>＋</span><small>Upload</small></div>
           </div>`;

      thumbsContainer.innerHTML = thumbItems + moreEl;
    } else {
      // Fallback: legacy IDs
      const t1El = document.getElementById('drThumb1Img');
      const t2El = document.getElementById('drThumb2Img');
      const t3El = document.getElementById('drThumb3Img');
      const moreCountEl = document.getElementById('drMoreCount');
      if (t1El) t1El.src = photos[1]?.src || fallbacks[1]?.src || '';
      if (t2El) t2El.src = photos[2]?.src || fallbacks[2]?.src || '';
      if (t3El) t3El.src = photos[3]?.src || fallbacks[3]?.src || '';
      if (moreCountEl) moreCountEl.textContent = `+${Math.max(1, photos.length - 3)}`;
    }

    // ─── Upload reference image input (hidden) ───
    let refInput = document.getElementById('refImageUploadInput');
    if (!refInput) {
      refInput = document.createElement('input');
      refInput.type = 'file';
      refInput.id = 'refImageUploadInput';
      refInput.accept = 'image/*';
      refInput.style.display = 'none';
      document.body.appendChild(refInput);
    }
    refInput.onchange = null; // will be set by triggerRefUpload
  }

  // ─── Card 2: Order Details ───
  function renderOrderDetailsCard() {
    const gType = orderState.garmentType;
    const gTypeLower = gType.toLowerCase();
    const gDesc = orderState.garmentDesc;

    let neck = 'Mandarin Zari Collar & Split V';
    let sleeve = '3/4 Sleeve with Antique Zari Border';
    let lining = 'Mulmul Cotton Breathable Lining';
    let embroidery = 'Fine Antique Zari Needlework';
    let fabric = 'Chanderi Silk (Mustard Gold & Zari)';

    if (gTypeLower.includes('blouse')) {
      neck = 'Round Neck (Front), Deep U Back with Dori';
      sleeve = 'Elbow Length Fitted Sleeve';
      lining = 'Pure Butter Crepe Silk Lining';
      embroidery = 'Aari Zardosi & Bead Embellishment';
      fabric = 'Pure Raw Silk / Brocade';
    } else if (gTypeLower.includes('lehenga')) {
      neck = 'Sweetheart Choli Neckline';
      sleeve = 'Half Sleeve with Zari Piping';
      lining = 'Double Satin & Can-Can Interlining';
      embroidery = 'Heavy Zardosi Kalidar Work';
      fabric = 'Brocade Silk & Tissue Organza';
    } else if (gTypeLower.includes('gown')) {
      neck = 'Illusion Boat Neck with Sheer Yoke';
      sleeve = 'Fitted Full Sheer Sleeve';
      lining = 'Satin Crepe Full Lining';
      embroidery = 'Sequin Cutwork & Resham Thread Art';
      fabric = 'Soft Net & Shimmer Georgette';
    } else if (gTypeLower.includes('saree')) {
      neck = 'Traditional Drape Silhouette';
      sleeve = 'Cap Sleeve Maggam Work';
      lining = 'Cotton Voile Breathable Lining';
      embroidery = 'Korvai Zari Border & Pallu Resham';
      fabric = 'Kanchipuram Pure Silk';
    }

    const odGarment = document.getElementById('odGarmentType');
    const odCollection = document.getElementById('odCollection');
    const odCategory = document.getElementById('odCategory');
    const odNeck = document.getElementById('odNeckStyle');
    const odSleeve = document.getElementById('odSleeveStyle');
    const odLining = document.getElementById('odLining');
    const odEmb = document.getElementById('odEmbroidery');
    const odFab = document.getElementById('odFabric');
    const odNotes = document.getElementById('odSpecialNotes');

    if (odGarment) odGarment.textContent = gType;
    if (odCollection) odCollection.textContent = orderState.collection;
    if (odCategory) odCategory.textContent = 'Custom Bespoke Design';
    if (odNeck) odNeck.textContent = neck;
    if (odSleeve) odSleeve.textContent = sleeve;
    if (odLining) odLining.textContent = lining;
    if (odEmb) odEmb.textContent = embroidery;
    if (odFab) odFab.textContent = gDesc.includes('Silk') ? gDesc : fabric;
    if (odNotes) odNotes.textContent = orderState.customer.notes || gDesc || 'Handle with boutique atelier care.';
  }

  // ─── Card 3: Fabric & Materials ───
  function renderFabricAndMaterialsCard() {
    const gTypeLower = orderState.garmentType.toLowerCase();

    let thumb = '../../assets/fabrics/chanderi.jpg';
    let name = 'Chanderi Silk';
    let color = 'Mustard Gold';
    let qty = '3.5 m';
    let mats = [
      { dot: 'green', name: 'Lining (Mulmul Cotton)', val: '2.5 m' },
      { dot: 'pink', name: 'Gold Zari Thread', val: 'As required' },
      { dot: 'purple', name: 'Handmade Potli Buttons', val: '12 pcs' },
      { dot: 'coral', name: 'Side Concealed Zipper', val: '1 pc (12")' }
    ];

    if (gTypeLower.includes('blouse')) {
      thumb = '../../assets/pink_silk.jpg';
      name = 'Pure Raw Silk';
      color = 'Dusty Pink / Gold';
      qty = '1.2 m';
      mats = [
        { dot: 'green', name: 'Lining (Silk Crepe)', val: '1.2 m' },
        { dot: 'pink', name: 'Hooks & Eye Strip', val: '2 sets' },
        { dot: 'purple', name: 'Handcrafted Dori & Latkans', val: '1 pair' },
        { dot: 'coral', name: 'Aari Zardosi Thread', val: 'As required' }
      ];
    } else if (gTypeLower.includes('lehenga')) {
      thumb = '../../assets/fabrics/silk.jpg';
      name = 'Brocade Silk & Organza';
      color = 'Peach Coral & Gold';
      qty = '5.5 m';
      mats = [
        { dot: 'green', name: 'Can-Can Netting (Structure)', val: '3.0 m' },
        { dot: 'pink', name: 'Heavy Bridal Latkans', val: '1 pair' },
        { dot: 'purple', name: 'Satin Silk Lining', val: '4.5 m' },
        { dot: 'coral', name: 'Waistband Drawstring & Hook', val: '1 set' }
      ];
    } else if (gTypeLower.includes('gown')) {
      thumb = '../../assets/fabrics/georgette.jpg';
      name = 'Shimmer Georgette';
      color = 'Midnight Blue / Rose';
      qty = '6.0 m';
      mats = [
        { dot: 'green', name: 'Satin Crepe Underlay', val: '5.0 m' },
        { dot: 'pink', name: 'Boned Corset Cups', val: '1 pair' },
        { dot: 'purple', name: 'Invisible Back Zipper', val: '1 pc (22")' },
        { dot: 'coral', name: 'Micro Sequin Spool', val: 'As required' }
      ];
    }

    const fabThumb = document.getElementById('fabThumbImg');
    const fabBadge = document.getElementById('fabBadge');
    const fabName = document.getElementById('fabName');
    const fabColor = document.getElementById('fabColor');
    const fabQty = document.getElementById('fabQty');
    const addMatsList = document.getElementById('fabAdditionalList');

    if (fabThumb) fabThumb.src = thumb;
    if (fabBadge) fabBadge.textContent = 'Boutique Sourced';
    if (fabName) fabName.textContent = name;
    if (fabColor) fabColor.textContent = color;
    if (fabQty) fabQty.textContent = qty;

    if (addMatsList) {
      addMatsList.innerHTML = mats.map(m => `
        <div class="mat-item-line">
          <span class="dot ${m.dot}"></span>
          <span class="mat-item-name">${m.name}</span>
          <span class="mat-item-val">${m.val}</span>
        </div>
      `).join('');
    }
  }

  // ─── Card 4: Production Team ───
  async function renderProductionTeamCard(api) {
    const teamContainer = document.getElementById('teamMembersList');
    if (!teamContainer) return;

    let employees = [];

    // 1. Gather assigned craftsmen from live stages if available
    if (orderState.liveStages && Array.isArray(orderState.liveStages)) {
      orderState.liveStages.forEach(ls => {
        if (ls.assignedTo && typeof ls.assignedTo === 'object' && ls.assignedTo.name) {
          if (!employees.some(e => e.name === ls.assignedTo.name)) {
            employees.push({
              name: ls.assignedTo.name,
              role: ls.stageName ? formatStageLabel(ls.stageName) : (ls.assignedTo.role || 'Craftsman')
            });
          }
        }
      });
    }

    // 2. Query workforce employees from database
    if (employees.length < 4 && api && api.employees) {
      try {
        const empRes = await api.employees.list({ status: 'ACTIVE' });
        const list = Array.isArray(empRes) ? empRes : (empRes?.content || []);
        list.forEach(emp => {
          if (!employees.some(e => e.name === emp.name)) {
            employees.push({
              name: emp.name,
              role: emp.specialization ? emp.specialization.split(',')[0].trim() : (emp.role || 'Artisan')
            });
          }
        });
      } catch (e) {
        try {
          const empRes = await api.employees.list();
          const list = Array.isArray(empRes) ? empRes : (empRes?.content || []);
          list.forEach(emp => {
            if (!employees.some(e => e.name === emp.name)) {
              employees.push({
                name: emp.name,
                role: emp.role || 'Artisan'
              });
            }
          });
        } catch (_) { }
      }
    }

    if (employees.length === 0) {
      teamContainer.innerHTML = `
        <div style="padding:24px 12px;text-align:center;color:var(--text-muted);font-size:11.5px;">
          No assigned team members yet.
        </div>
      `;
      return;
    }

    teamContainer.innerHTML = employees.slice(0, 4).map((emp, i) => {
      const initials = emp.name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'AT';
      const colorClass = `color-${i % 4}`;
      return `
        <div class="team-member-row">
          <div class="tm-avatar ${colorClass}">${initials}</div>
          <div class="tm-meta">
            <span class="tm-name">${emp.name}</span>
            <span class="tm-role">${emp.role}</span>
          </div>
          <button type="button" class="tm-chat-btn" onclick="openChatWithStaff('${emp.name.replace(/'/g, "\\'")}')" title="Message ${emp.name}">
            <i data-lucide="message-square" style="width:14px;height:14px;"></i>
          </button>
        </div>
      `;
    }).join('');

    refreshLucideIcons();
  }

  // ─── Card 5: Measurements ───
  async function renderMeasurementsCard(api, targetMobile) {
    const gTypeLower = orderState.garmentType.toLowerCase();
    let targetProfileType = 'CHUDI';
    let silhouetteImg = '../../assets/mannequin-duo.jpg';

    if (gTypeLower.includes('blouse')) {
      targetProfileType = 'BLOUSE';
      silhouetteImg = '../../assets/mannequin-duo.jpg';
    } else if (gTypeLower.includes('lehenga')) {
      targetProfileType = 'LEHENGA';
      silhouetteImg = '../../assets/mannequin-duo.jpg';
    } else if (gTypeLower.includes('gown')) {
      targetProfileType = 'GOWN';
      silhouetteImg = '../../assets/mannequin-duo.jpg';
    }

    const headingEl = document.getElementById('measHeading');
    const modalTitleEl = document.getElementById('measModalTitle');
    if (headingEl) headingEl.textContent = 'Measurements';
    if (modalTitleEl) modalTitleEl.textContent = `Full Measurements — ${orderState.garmentType} Profile`;

    const mannequinImg = document.getElementById('measMannequinImg');
    if (mannequinImg) mannequinImg.src = silhouetteImg;

    // Fetch customer's body measurements
    let profile = null;
    if (api && api.customers && targetMobile) {
      try {
        const mList = await api.customers.bodyMeasurements.list(targetMobile);
        if (Array.isArray(mList) && mList.length > 0) {
          profile = mList.find(m => m.garmentType === targetProfileType) || mList[0];
        }
      } catch (me) {
        console.warn('[ViewOrder] Could not load customer measurements:', me.message);
      }
    }

    // Default values if no profile in DB
    const p = profile || {
      shoulder: 14.25,
      bust: 35.5,
      waist: 29.0,
      hip: 38.5,
      topLength: 41.0,
      sleeveLength: 17.0,
      armhole: 16.0,
      pantLength: 39.0,
      recordedBy: 'Master Tailor'
    };

    // 8 markers on Card
    let cardMarkers = [];
    if (targetProfileType === 'CHUDI') {
      cardMarkers = [
        { badge: '1', name: 'Shoulder', val: (p.shoulder || 14.25) + '"' },
        { badge: '2', name: 'Bust', val: (p.bust || 35.5) + '"' },
        { badge: '3', name: 'Waist', val: (p.waist || 29.0) + '"' },
        { badge: '4', name: 'Hip', val: (p.hip || 38.5) + '"' },
        { badge: '5', name: 'Top Length', val: (p.topLength || 41.0) + '"' },
        { badge: '6', name: 'Sleeve Length', val: (p.sleeveLength || 17.0) + '"' },
        { badge: '7', name: 'Armhole', val: (p.armhole || 16.0) + '"' },
        { badge: '8', name: 'Pant Length', val: (p.pantLength || 39.0) + '"' }
      ];
    } else if (targetProfileType === 'BLOUSE') {
      cardMarkers = [
        { badge: '1', name: 'Shoulder', val: (p.shoulder || 14.0) + '"' },
        { badge: '2', name: 'Bust', val: (p.bust || 34.0) + '"' },
        { badge: '3', name: 'Under Bust', val: (p.underBust || 30.0) + '"' },
        { badge: '4', name: 'Waist', val: (p.waist || 28.0) + '"' },
        { badge: '5', name: 'Blouse Length', val: (p.blouseLength || 14.0) + '"' },
        { badge: '6', name: 'Back Neck Depth', val: (p.backNeckDepth || 8.0) + '"' },
        { badge: '7', name: 'Armhole', val: (p.armhole || 16.0) + '"' },
        { badge: '8', name: 'Sleeve Length', val: (p.sleeveLength || 10.5) + '"' }
      ];
    } else if (targetProfileType === 'LEHENGA') {
      cardMarkers = [
        { badge: '1', name: 'Waist', val: (p.waist || 28.5) + '"' },
        { badge: '2', name: 'Hip', val: (p.hip || 38.0) + '"' },
        { badge: '3', name: 'Skirt Length', val: (p.skirtLength || 42.0) + '"' },
        { badge: '4', name: 'Flare (Ghera)', val: (p.flare || 140) + '"' },
        { badge: '5', name: 'Choli Bust', val: (p.bust || 35.0) + '"' },
        { badge: '6', name: 'Choli Length', val: (p.blouseLength || 14.5) + '"' },
        { badge: '7', name: 'Armhole', val: (p.armhole || 16.0) + '"' },
        { badge: '8', name: 'Sleeve', val: (p.sleeveLength || 11.0) + '"' }
      ];
    } else {
      cardMarkers = [
        { badge: '1', name: 'Shoulder', val: (p.shoulder || 14.5) + '"' },
        { badge: '2', name: 'Bust', val: (p.bust || 36.0) + '"' },
        { badge: '3', name: 'Waist', val: (p.waist || 29.5) + '"' },
        { badge: '4', name: 'Hip', val: (p.hip || 39.0) + '"' },
        { badge: '5', name: 'Full Length', val: (p.fullLength || 56.0) + '"' },
        { badge: '6', name: 'Sleeve Length', val: (p.sleeveLength || 18.0) + '"' },
        { badge: '7', name: 'Armhole', val: (p.armhole || 16.5) + '"' },
        { badge: '8', name: 'Neck Depth', val: (p.frontNeckDepth || 7.0) + '"' }
      ];
    }

    const valListContainer = document.getElementById('measValuesList');
    if (valListContainer) {
      valListContainer.innerHTML = cardMarkers.map(m => `
        <div class="meas-val-row" data-badge="${m.badge}">
          <span class="num-badge">${m.badge}</span>
          <span class="m-name">${m.name}</span>
          <span class="m-val">${m.val}</span>
        </div>
      `).join('');
    }

    // Modal Specification Rows
    const modalBody = document.getElementById('modalMeasurementsBody');
    if (modalBody) {
      const allPoints = [
        { name: 'Shoulder', val: p.shoulder },
        { name: 'Bust', val: p.bust },
        { name: 'Under Bust', val: p.underBust },
        { name: 'Waist', val: p.waist },
        { name: 'Hip', val: p.hip },
        { name: 'Top Length', val: p.topLength || p.blouseLength || p.fullLength },
        { name: 'Sleeve Length', val: p.sleeveLength },
        { name: 'Armhole', val: p.armhole },
        { name: 'Sleeve Round', val: p.sleeveRound },
        { name: 'Front Neck Depth', val: p.frontNeckDepth },
        { name: 'Back Neck Depth', val: p.backNeckDepth },
        { name: 'Pant / Bottom Length', val: p.pantLength || p.skirtLength },
        { name: 'Bottom Opening', val: p.bottomOpening }
      ].filter(pt => pt.val != null && pt.val !== '');

      if (allPoints.length > 0) {
        modalBody.innerHTML = allPoints.map((pt, idx) => `
          <tr>
            <td><span class="num-badge">${idx + 1}</span></td>
            <td>${pt.name}</td>
            <td><strong>${pt.val}"</strong></td>
            <td>Standard Bespoke</td>
            <td>${p.recordedBy || 'Master Tailor'}</td>
          </tr>
        `).join('');
      } else {
        modalBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted);">No measurement records linked to this profile</td></tr>';
      }
    }
  }

  // ─── Card 6: Production Notes ───
  function renderProductionNotesCard() {
    const checklist = document.getElementById('notesChecklist');
    if (!checklist) return;

    // Use real production notes from DB if available
    if (orderState.productionNotes && orderState.productionNotes.trim()) {
      // Split on newlines so tailors can enter multi-line notes
      const lines = orderState.productionNotes
        .split(/\n+/)
        .map(l => l.trim())
        .filter(Boolean);

      checklist.innerHTML = lines.map(n => `
        <div class="check-item"><span class="check-icon">✓</span><span>${n}</span></div>
      `).join('');
      return;
    }

    // Fallback: garment-type based defaults
    const gTypeLower = orderState.garmentType.toLowerCase();
    let notes = [];
    if (gTypeLower.includes('kurti') || gTypeLower.includes('chudi')) {
      notes = [
        'Kalidar cutting aligned with continuous pattern flow.',
        'Reinforce mandarin collar with lightweight fusible buckram.',
        'Mulmul lining attached with double overlock seams.',
        'Keep 1.5" alteration margin on both side seams.',
        orderState.customer.notes || 'Handle with boutique atelier care.'
      ];
    } else if (gTypeLower.includes('blouse')) {
      notes = [
        'Use matching pure silk crepe lining.',
        'Aari Zardosi needlework placed exactly as per reference.',
        'Ensure snug tailored fit across shoulder and armhole lines.',
        'Keep 0.5" seam margin for alterations.',
        orderState.customer.notes || 'Client requested soft removable cups.'
      ];
    } else if (gTypeLower.includes('lehenga')) {
      notes = [
        'Multi-panel kalidar cut with reinforced can-can flare.',
        'Zari border finishing stitched along ghera.',
        'Attach custom latkans and drawstring at waistband.',
        'Trial fitting required prior to final hem stitching.',
        orderState.customer.notes || 'Handle with boutique atelier care.'
      ];
    } else {
      notes = [
        'Structured corset boning inserted through bodice.',
        'Invisible back zipper cleanly concealed.',
        'Floor length drape pressed with steam iron.',
        orderState.customer.notes || 'Handle with boutique atelier care.'
      ];
    }

    checklist.innerHTML = notes.map(n => `
      <div class="check-item"><span class="check-icon">✓</span><span>${n}</span></div>
    `).join('');
  }

  // ─── Card 7: Photos & Updates ───
  function renderPhotosAndUpdatesCard() {
    const gTypeLower = orderState.garmentType.toLowerCase();
    let p1 = '../../assets/fabrics/chanderi.jpg';
    let p2 = '../../assets/designs/festive-kurti-yoke.jpg';
    let p3 = '../../assets/cutting_pattern.jpg';
    let p4 = '../../assets/designs/festive-kurti-hero.jpg';

    if (gTypeLower.includes('blouse')) {
      p1 = '../../assets/pink_silk.jpg';
      p2 = '../../assets/designs/zari-bloom-detail.jpg';
      p3 = '../../assets/cutting_pattern.jpg';
      p4 = '../../assets/designs/zari-bloom-back.jpg';
    } else if (gTypeLower.includes('lehenga')) {
      p1 = '../../assets/fabrics/silk.jpg';
      p2 = '../../assets/designs/midnight-grace.jpg';
      p3 = '../../assets/cutting_pattern.jpg';
      p4 = '../../assets/designs/lehenga-stage.png';
    } else if (gTypeLower.includes('gown')) {
      p1 = '../../assets/fabrics/georgette.jpg';
      p2 = '../../assets/designs/skyline.jpg';
      p3 = '../../assets/cutting_pattern.jpg';
      p4 = '../../assets/designs/gown-stage.png';
    }

    const strip = document.getElementById('productionPhotosStrip');
    if (strip) {
      strip.innerHTML = `
        <div class="prod-thumb" onclick="openLightbox(0)"><img src="${p1}" alt="Fabric" /></div>
        <div class="prod-thumb" onclick="openLightbox(1)"><img src="${p2}" alt="Embellishment" /></div>
        <div class="prod-thumb" onclick="openLightbox(2)"><img src="${p3}" alt="Cutting Pattern" /></div>
        <div class="prod-thumb" onclick="openLightbox(3)"><img src="${p4}" alt="Assembly Stage" /></div>
        <div class="prod-add-tile" onclick="document.getElementById('photoUploadInput').click()">
          <i data-lucide="plus" style="width:13px;height:13px;"></i>
          <span>+ Add</span>
        </div>
      `;
    }
  }

  // ─── Card 8: Timeline & Activity ───
  function renderTimelineAndActivityCard() {
    const list = document.getElementById('activityTimelineList');
    if (!list) return;

    const oDate = orderState.dates.orderDate;
    const adv = orderState.financials.paidAmount;

    const items = [
      {
        date: oDate,
        time: '10:30 AM',
        title: 'Order Registered',
        user: `by Atelier Concierge · ${orderState.customer.name}`,
        dot: 'green'
      },
      {
        date: oDate,
        time: '11:15 AM',
        title: 'Advance Payment Confirmed',
        user: `₹${adv.toLocaleString('en-IN')} received via UPI/Cash`,
        dot: 'green'
      },
      {
        date: oDate,
        time: '02:00 PM',
        title: 'Fabric Assigned & Inspected',
        user: 'by Draper Arun Kumar',
        dot: 'purple'
      },
      {
        date: 'Recent',
        time: '03:45 PM',
        title: orderState.status === 'PENDING' ? 'Pattern Drafting & Cutting' : (orderState.status === 'READY' ? 'Quality Audit Passed' : 'Machine Stitching in progress'),
        user: 'by Master Kavitha M',
        dot: 'yellow pulse'
      },
      {
        date: orderState.dates.expectedDelivery,
        time: '05:00 PM',
        title: 'Scheduled Client Handover',
        user: 'Final Fitting & Delivery',
        dot: 'gray dim'
      }
    ];

    orderState.activityHistory = items.map(it => ({
      dateTime: `${it.date} ${it.time}`,
      activity: it.title,
      actor: it.user,
      stage: orderState.stages[orderState.currentStageIndex]?.name || 'Production',
      notes: 'Bespoke atelier record'
    }));

    list.innerHTML = items.map(it => `
      <div class="act-item ${it.dot.includes('pulse') ? 'current' : (it.dot.includes('dim') ? 'upcoming' : 'completed')}">
        <div class="act-dot ${it.dot}"></div>
        <div class="act-body">
          <div class="act-time-row"><span class="act-date">${it.date}</span><span class="act-time">${it.time}</span></div>
          <div class="act-title ${it.dot.includes('dim') ? 'dim' : ''}">${it.title}</div>
          <div class="act-user">${it.user}</div>
        </div>
      </div>
    `).join('');
  }

  // ─── Row 3 Gauges & Next Action ───
  function renderGaugesAndNextAction(daysElapsed, totalLead, daysLeft) {
    const pctDays = Math.min(100, Math.round((daysElapsed / totalLead) * 100));

    // Gauge 1: Time in Production
    const prodDaysCount = document.getElementById('prodDaysCount');
    const prodDaysSub = document.getElementById('prodDaysSub');
    const prodFill = document.getElementById('prodProgressFill');
    const prodPct = document.getElementById('prodProgressPct');

    if (prodDaysCount) prodDaysCount.textContent = `${daysElapsed} days`;
    if (prodDaysSub) prodDaysSub.textContent = `of ${totalLead} days`;
    if (prodFill) prodFill.style.width = `${pctDays}%`;
    if (prodPct) prodPct.textContent = `${pctDays}%`;

    // Gauge 2: Estimated vs Actual Cost
    const costEst = document.getElementById('costEstimatedVal');
    const costAct = document.getElementById('costActualVal');
    const costFill = document.getElementById('costProgressFill');
    const costPct = document.getElementById('costProgressPct');

    const tot = orderState.financials.orderValue;
    const adv = orderState.financials.paidAmount;
    const costPctVal = tot > 0 ? Math.min(100, Math.round((adv / tot) * 100)) : 50;

    if (costEst) costEst.textContent = '₹' + tot.toLocaleString('en-IN');
    if (costAct) costAct.textContent = '₹' + adv.toLocaleString('en-IN');
    if (costFill) costFill.style.width = `${costPctVal}%`;
    if (costPct) costPct.textContent = `${costPctVal}%`;

    // Gauge 3: Payment Status
    const payPaid = document.getElementById('paymentPaidVal');
    const payBal = document.getElementById('paymentBalVal');
    const payLbl = document.getElementById('paymentPaidPctLbl');
    const payFill = document.getElementById('paymentProgressFill');

    const bal = orderState.financials.balanceAmount;
    const pPct = orderState.financials.paidPct;

    if (payPaid) payPaid.textContent = '₹' + adv.toLocaleString('en-IN');
    if (payBal) payBal.textContent = '₹' + bal.toLocaleString('en-IN');
    if (payLbl) payLbl.textContent = `Paid (${pPct}%)`;
    if (payFill) payFill.style.width = `${pPct}%`;

    // Card 10: Next Action Area
    const curStage = orderState.stages[orderState.currentStageIndex];
    const nextStage = orderState.stages[orderState.currentStageIndex + 1];

    let nextTitle = nextStage ? `${nextStage.name} to begin` : 'Order Fulfilled & Handover Complete';
    let nextAssignee = nextStage ? nextStage.assignee : (curStage ? curStage.assignee : 'Concierge Desk');
    let btnText = nextStage ? 'Mark as Started' : 'Order Delivered ✓';

    if (orderState.currentStageIndex >= orderState.stages.length - 1) {
      nextTitle = 'Order Fulfilled & Delivered';
      btnText = 'Delivered ✓';
    }

    orderState.nextAction = { title: nextTitle, assignee: nextAssignee, buttonText: btnText };

    const naTitleEl = document.getElementById('nextActionTitle');
    const naAssigneeEl = document.getElementById('nextActionAssignee');
    const btnMarkStarted = document.getElementById('btnMarkStarted');

    if (naTitleEl) naTitleEl.textContent = nextTitle;
    if (naAssigneeEl) naAssigneeEl.textContent = `Assigned to ${nextAssignee}`;
    if (btnMarkStarted) {
      btnMarkStarted.innerHTML = `<span>${btnText}</span> <span>→</span>`;
    }
  }

  window.advanceNextActionStage = async function () {
    if (orderState.currentStageIndex < orderState.stages.length - 1) {
      await transitionToStage(orderState.currentStageIndex + 1);
    } else {
      showToast('All production stages are already complete!', 'info');
    }
  };

  // ─── Modal: Print Job Card ───
  function populateJobCardModal() {
    const jcNum = document.getElementById('jcOrderNum');
    const jcName = document.getElementById('jcCustName');
    const jcPhone = document.getElementById('jcCustPhone');
    const jcLoc = document.getElementById('jcCustLocation');
    const jcODate = document.getElementById('jcOrderDate');
    const jcDDate = document.getElementById('jcDueDate');
    const jcStat = document.getElementById('jcStatus');
    const jcGar = document.getElementById('jcGarment');
    const jcCat = document.getElementById('jcCategory');
    const jcSleeves = document.getElementById('jcSleeves');
    const jcEmb = document.getElementById('jcEmbroidery');
    const jcFab = document.getElementById('jcFabric');
    const jcNotes = document.getElementById('jcSpecialNotes');

    if (jcNum) jcNum.textContent = orderState.orderId || '—';
    if (jcName) jcName.textContent = orderState.customer.name || '—';
    if (jcPhone) jcPhone.textContent = orderState.customer.phone || '—';
    if (jcLoc) jcLoc.textContent = orderState.customer.location || 'Chennai, Tamil Nadu';
    if (jcODate) jcODate.textContent = `Order Date: ${orderState.dates.orderDate || '—'}`;
    if (jcDDate) jcDDate.textContent = `Due Date: ${orderState.dates.expectedDelivery || '—'}`;
    if (jcStat) jcStat.textContent = `Status: ${orderState.status || 'PENDING'}`;
    if (jcGar) jcGar.textContent = `${orderState.garmentType} (${orderState.collection})`;
    if (jcCat) jcCat.textContent = 'Custom Bespoke Atelier';

    const gTypeLower = orderState.garmentType.toLowerCase();
    if (jcSleeves) jcSleeves.textContent = gTypeLower.includes('blouse') ? 'Elbow Length · Silk Crepe Lining' : '3/4 Sleeve · Mulmul Breathable Lining';
    if (jcEmb) jcEmb.textContent = gTypeLower.includes('blouse') ? 'Aari Zardosi Needlework' : 'Mandarin Collar Antique Zari Motif';
    if (jcFab) jcFab.textContent = orderState.garmentDesc || 'Chanderi Silk (Boutique Sourced)';
    if (jcNotes) jcNotes.textContent = orderState.customer.notes || 'Handle with boutique atelier care.';
  }

  // ─── Lifecycle Setup ───
  document.addEventListener('DOMContentLoaded', () => {
    bindMeasurementTabs();
    bindDropdowns();
    bindKeyboardShortcuts();
    refreshLucideIcons();
    loadOrderFromApi();
  });

  // ─── "Mark as Started" / Advance Stage Progression ───
  window.advanceNextActionStage = async function () {
    const nextIdx = orderState.currentStageIndex + 1;
    if (nextIdx < STAGE_DEFINITIONS.length) {
      await transitionToStage(nextIdx);
    } else {
      showToast('Order has already reached final delivery stage.', 'info');
    }
  };

  // ─── Measurement Views Switcher ───
  function bindMeasurementTabs() {
    const tabs = document.querySelectorAll('.meas-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const view = tab.getAttribute('data-view');
        switchMeasurementView(view);
      });
    });
  }

  window.switchMeasurementView = function (view) {
    const svgOverlay = document.querySelector('.meas-svg-overlay');
    if (view === 'front') {
      highlightMeasurementBadges([1, 2, 3, 4]);
      if (svgOverlay) {
        svgOverlay.querySelectorAll('circle, line, text, path').forEach((el) => {
          const cx = parseFloat(el.getAttribute('cx') || el.getAttribute('x1') || 0);
          el.style.opacity = cx > 200 ? '0.35' : '1';
        });
      }
    } else if (view === 'back') {
      highlightMeasurementBadges([5, 6, 7]);
      if (svgOverlay) {
        svgOverlay.querySelectorAll('circle, line, text, path').forEach((el) => {
          const cx = parseFloat(el.getAttribute('cx') || el.getAttribute('x1') || 0);
          el.style.opacity = (cx <= 200 && cx > 0) ? '0.35' : '1';
        });
      }
    } else if (view === 'side') {
      highlightMeasurementBadges([1, 2, 3, 4, 5, 6, 7, 8]);
      if (svgOverlay) {
        svgOverlay.querySelectorAll('circle, line, text, path').forEach((el) => {
          el.style.opacity = '1';
        });
      }
    }
  };

  function highlightMeasurementBadges(badgeNums) {
    const rows = document.querySelectorAll('.meas-val-row');
    rows.forEach((row) => {
      const badge = row.querySelector('.num-badge');
      if (!badge) return;
      const num = parseInt(badge.innerText, 10);
      if (badgeNums.includes(num)) {
        badge.style.background = '#d4ff32';
        badge.style.color = '#0f1406';
        row.style.opacity = '1';
      } else {
        badge.style.background = 'rgba(255, 255, 255, 0.12)';
        badge.style.color = 'var(--text-muted)';
        row.style.opacity = '0.45';
      }
    });
  }

  // ─── Lightbox Image Viewer ───
  window.openLightbox = function (index) {
    currentLightboxIndex = index || 0;
    updateLightboxContent();
    const modal = document.getElementById('lightboxModal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeLightbox = function () {
    const modal = document.getElementById('lightboxModal');
    if (modal) modal.style.display = 'none';
  };

  window.navigateLightbox = function (direction) {
    const total = orderState.photos.length || 1;
    currentLightboxIndex = (currentLightboxIndex + direction + total) % total;
    updateLightboxContent();
  };

  function updateLightboxContent() {
    const photo = orderState.photos[currentLightboxIndex];
    const imgEl = document.getElementById('lightboxActiveImg');
    const counterEl = document.getElementById('lightboxCounter');
    if (imgEl && photo) {
      imgEl.src = photo.src;
      imgEl.alt = photo.title;
    }
    if (counterEl) {
      counterEl.innerText = `${currentLightboxIndex + 1} / ${orderState.photos.length} — ${photo ? photo.title : ''}`;
    }
  }

  window.openAllDesignReferences = function () {
    openLightbox(0);
  };

  // ─── Modal Handlers ───
  window.openPrintJobCardModal = function () {
    populateJobCardModal();
    const modal = document.getElementById('printJobCardModal');
    if (modal) modal.style.display = 'flex';
    refreshLucideIcons();
  };

  window.closePrintJobCardModal = function () {
    const modal = document.getElementById('printJobCardModal');
    if (modal) modal.style.display = 'none';
  };

  window.openShareModal = function () {
    const modal = document.getElementById('shareModal');
    const sopId = document.getElementById('sopId');
    const sopCust = document.getElementById('sopCust');
    const sopStat = document.getElementById('sopStat');
    const shareInput = document.getElementById('shareLinkInput');

    if (sopId) sopId.textContent = orderState.orderId || '—';
    if (sopCust) sopCust.textContent = `${orderState.customer.name || '—'} · ${orderState.garmentType || ''} (${orderState.collection || ''})`;
    if (sopStat) sopStat.textContent = `Status: ${orderState.status || '—'} · Due: ${orderState.dates.expectedDelivery || '—'}`;
    if (shareInput) shareInput.value = window.location.href;

    if (modal) modal.style.display = 'flex';
    refreshLucideIcons();
  };

  window.closeShareModal = function () {
    const modal = document.getElementById('shareModal');
    if (modal) modal.style.display = 'none';
  };

  window.copyShareLink = function () {
    const input = document.getElementById('shareLinkInput');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value).then(() => {
        showToast('Link copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Link copied!', 'success');
      });
    }
  };

  window.simulateShare = function (channel) {
    const oCode = orderState.orderId || 'ORDER';
    const link = window.location.href;
    const text = encodeURIComponent(`Order ${oCode} Details: ${link}`);
    if (channel === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    } else if (channel === 'email') {
      window.location.href = `mailto:?subject=Order ${encodeURIComponent(oCode)} Details&body=${text}`;
    }
    closeShareModal();
    showToast(`Shared via ${channel}`, 'info');
  };

  window.openFullMeasurementsModal = function () {
    const modal = document.getElementById('fullMeasurementsModal');
    if (modal) modal.style.display = 'flex';
    refreshLucideIcons();
  };

  window.closeFullMeasurementsModal = function () {
    const modal = document.getElementById('fullMeasurementsModal');
    if (modal) modal.style.display = 'none';
  };

  window.openEditNotesModal = function () {
    const modal = document.getElementById('editNotesModal');
    const textarea = document.getElementById('editNotesTextarea');
    if (textarea) {
      textarea.value = orderState.productionNotes.join('\n');
    }
    if (modal) modal.style.display = 'flex';
    refreshLucideIcons();
  };

  window.closeEditNotesModal = function () {
    const modal = document.getElementById('editNotesModal');
    if (modal) modal.style.display = 'none';
  };

  window.saveEditedNotes = async function () {
    const textarea = document.getElementById('editNotesTextarea');
    if (textarea) {
      const lines = textarea.value.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      orderState.productionNotes = lines;

      const checklist = document.getElementById('notesChecklist');
      if (checklist) {
        checklist.innerHTML = lines.map((l) => `
          <div class="check-item"><span class="check-icon">✓</span><span>${l}</span></div>
        `).join('');
      }
      showToast('Production notes updated!', 'success');
    }
    closeEditNotesModal();
  };

  window.openActivityHistoryModal = function () {
    const tbody = document.getElementById('activityHistoryTableBody');
    if (tbody) {
      if (!orderState.activityHistory || orderState.activityHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted);">No activity history recorded yet.</td></tr>';
      } else {
        tbody.innerHTML = orderState.activityHistory.map((act) => `
          <tr>
            <td><strong>${act.dateTime}</strong></td>
            <td>${act.activity}</td>
            <td>${act.actor}</td>
            <td><span class="status-pill status-in-prod" style="font-size:10px;padding:2px 8px;">${act.stage}</span></td>
            <td style="color:var(--text-muted);">${act.notes}</td>
          </tr>
        `).join('');
      }
    }
    const modal = document.getElementById('activityHistoryModal');
    if (modal) modal.style.display = 'flex';
    refreshLucideIcons();
  };

  window.closeActivityHistoryModal = function () {
    const modal = document.getElementById('activityHistoryModal');
    if (modal) modal.style.display = 'none';
  };

  window.openFabricDetailsModal = function () {
    showToast(`Fabric Details: ${orderState.garmentType} Material Specifications`, 'info');
  };

  window.openTeamModal = function () {
    showToast('Production Team: Craftsmen and staff assigned to order', 'info');
  };

  window.openChatWithStaff = function (staffName) {
    showToast(`Opening internal chat with ${staffName}...`, 'info');
  };

  window.handleEditOrder = function () {
    showToast('Redirecting to order editor...', 'info');
    setTimeout(() => {
      window.location.href = `../new-order/new-order.html?editId=${encodeURIComponent(orderState.rawId || '')}`;
    }, 600);
  };

  window.handleDuplicateOrder = function () {
    showToast(`Order ${orderState.orderId || ''} duplicated as draft!`, 'success');
  };

  window.handleCancelOrder = async function () {
    if (!orderState.rawId) {
      showToast('No active order to cancel.', 'warn');
      return;
    }
    if (confirm(`Are you sure you want to cancel order ${orderState.orderId}?`)) {
      orderState.status = 'CANCELLED';
      const statusDisplay = document.getElementById('orderStatusDisplay');
      if (statusDisplay) {
        statusDisplay.textContent = 'CANCELLED';
        statusDisplay.className = 'status-pill status-cancelled';
      }
      showToast('Order has been cancelled.', 'info');
    }
  };

  window.handleArchiveOrder = function () {
    showToast(`Order ${orderState.orderId || ''} moved to archives.`, 'info');
  };

  window.handleProductionPhotoUpload = function (event) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const strip = document.getElementById('productionPhotosStrip');
        if (strip) {
          const newThumb = document.createElement('div');
          newThumb.className = 'prod-thumb';
          newThumb.innerHTML = `<img src="${e.target.result}" alt="Uploaded photo" />`;
          newThumb.onclick = () => openLightbox(orderState.photos.length);
          strip.insertBefore(newThumb, strip.children[strip.children.length - 1]);
        }
        orderState.photos.push({
          src: e.target.result,
          title: `Uploaded Photo (${file.name})`
        });
        showToast('Photo uploaded to order timeline!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Triggers file picker for a reference image slot (1-5).
   * On file selected, uploads via API and refreshes the card.
   */
  window.triggerRefUpload = function (slot) {
    if (!orderState.rawId) { showToast('Order not loaded yet', 'warn'); return; }
    let input = document.getElementById('refImageUploadInput');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'refImageUploadInput';
      input.accept = 'image/*';
      input.style.display = 'none';
      document.body.appendChild(input);
    }
    // Reset so re-selecting same file still fires change
    input.value = '';
    input.onchange = async function () {
      const file = input.files && input.files[0];
      if (!file) return;
      showToast(`Uploading reference image ${slot}…`, 'info');
      try {
        const updated = await _api.orders.uploadReferenceImage(orderState.rawId, slot, file);
        orderState.referenceImages = Array.isArray(updated.referenceImages)
          ? updated.referenceImages.filter(Boolean)
          : [];
        renderDesignReferenceCard();
        showToast(`Reference image ${slot} uploaded ✓`, 'success');
        if (window.lucide) lucide.createIcons();
      } catch (err) {
        showToast('Upload failed: ' + err.message, 'error');
      }
    };
    input.click();
  };

  /**
   * Deletes a reference image slot from the order.
   */
  window.deleteRefImage = async function (slot) {
    if (!orderState.rawId) return;
    if (!confirm(`Remove reference image ${slot}?`)) return;
    try {
      const updated = await _api.orders.deleteReferenceImage(orderState.rawId, slot);
      orderState.referenceImages = Array.isArray(updated.referenceImages)
        ? updated.referenceImages.filter(Boolean)
        : [];
      renderDesignReferenceCard();
      showToast(`Reference image ${slot} removed.`, 'info');
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };


  function bindDropdowns() {
    window.toggleMoreMenu = function (e) {
      e.stopPropagation();
      const dd = document.getElementById('moreDropdownMenu');
      if (dd) dd.classList.toggle('open');
    };

    document.addEventListener('click', () => {
      const moreMenu = document.getElementById('moreDropdownMenu');
      if (moreMenu) moreMenu.classList.remove('open');
    });
  }

  // ─── Keyboard Shortcuts ───
  function bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        showToast('Focusing global search...', 'info');
      }

      const lightboxModal = document.getElementById('lightboxModal');
      if (lightboxModal && lightboxModal.style.display === 'flex') {
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') navigateLightbox(-1);
        else if (e.key === 'ArrowRight') navigateLightbox(1);
      }

      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach((m) => {
          m.style.display = 'none';
        });
      }
    });
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span style="font-weight:700;">${type === 'success' ? '✓' : 'ℹ'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function refreshLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  window.OrderService = {
    async fetchOrderDetails(orderId) {
      try {
        const { default: api } = await import('../../api.js');
        return await api.orders.get(orderId);
      } catch (err) {
        return orderState;
      }
    }
  };

})();
