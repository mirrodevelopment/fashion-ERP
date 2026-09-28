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
      title: '—',
      assignee: '—',
      buttonText: 'Mark as Started'
    },
    photos: [],
    activityHistory: [],
    measurements: [],
    rawCreatedAt: null,
    deliveredDate: null,
    paymentTransactions: [],
    sessionActivities: []
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
      _api = api;

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

      orderState.rawCreatedAt = order.createdAt || null;
      orderState.deliveredDate = order.deliveredDate || null;

      // Fetch live payment transactions for this order if available
      try {
        if (api && api.payments && api.payments.list) {
          const pList = await api.payments.list({ search: orderState.orderId });
          const orderPayments = Array.isArray(pList) ? pList : (pList?.content || []);
          const matched = orderPayments.find(p => p.orderCode === orderState.orderId || p.orderId === order.id);
          if (matched && Array.isArray(matched.transactions)) {
            orderState.paymentTransactions = matched.transactions;
          }
        }
      } catch (perr) {
        console.warn('[ViewOrder] Could not fetch live payment transactions:', perr.message);
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

      // ─── Lock all editing if order is cancelled ───
      if (orderState.status === 'CANCELLED') {
        lockCancelledOrderUI();
      }

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

  function formatDateTimeParts(isoOrDateStr) {
    if (!isoOrDateStr) return { date: '—', time: '', rawTime: 0 };
    try {
      const d = new Date(isoOrDateStr);
      if (isNaN(d.getTime())) return { date: String(isoOrDateStr).slice(0, 10), time: '', rawTime: 0 };
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const datePart = `${y}-${m}-${day}`;
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timePart = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
      return { date: datePart, time: timePart, rawTime: d.getTime() };
    } catch (_) {
      return { date: String(isoOrDateStr), time: '', rawTime: 0 };
    }
  }

  function getCurrentStaffName() {
    try {
      if (window.Auth && window.Auth.getUser) {
        const u = window.Auth.getUser();
        if (u && (u.fullName || u.name || u.username)) {
          return u.fullName || u.name || u.username;
        }
      }
      const rawUser = sessionStorage.getItem('erp_user') || localStorage.getItem('erp_user') ||
        sessionStorage.getItem('user') || localStorage.getItem('user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u && (u.fullName || u.name || u.username)) {
          return u.fullName || u.name || u.username;
        }
      }
      // Decode JWT token payload as fallback to extract authenticated staff identity
      const token = (window.Auth && window.Auth.getToken && window.Auth.getToken()) ||
        sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token');
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload && (payload.fullName || payload.name || payload.sub)) {
            return payload.fullName || payload.name || payload.sub;
          }
        }
      }
      return '';
    } catch (_) {
      return '';
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
    if (!url || url.includes('user_avatar.jpg')) return '';
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

  // Fallback blueprint if stage definitions table is not yet reachable (strictly 2 fixed stages)
  const DEFAULT_STAGES = [
    { code: 'ORDER_TAKEN',      label: 'Order Taken',      role: 'STYLIST',    sortOrder: 1 },
    { code: 'READY_TO_DELIVER', label: 'Ready to Deliver', role: 'DISPATCHER', sortOrder: 2 }
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

    // Customer Compact Card Avatar & Patron Badge
    const ccBox = document.getElementById('ccAvatarBox');
    const customerName = (orderState.customer && orderState.customer.name) || 'Customer';
    const formattedAvatar = formatAvatarUrl(orderState.customer ? orderState.customer.avatar : '');

    if (ccBox) {
      if (typeof window.applyPatronAvatarElement === 'function') {
        window.applyPatronAvatarElement(ccBox, customerName, formattedAvatar, 'haulo-avatar-md', 'width:44px;height:44px;border-radius:10px;');
      } else if (typeof window.renderPatronAvatarHtml === 'function') {
        ccBox.innerHTML = window.renderPatronAvatarHtml(customerName, formattedAvatar, 'haulo-avatar-md', 'width:44px;height:44px;border-radius:10px;');
      } else {
        const inits = typeof window.getPatronInitials === 'function' ? window.getPatronInitials(customerName) : 'CU';
        ccBox.innerHTML = `<div class="haulo-patron-avatar-initials haulo-avatar-md" style="width:44px;height:44px;border-radius:10px;">${inits}</div>`;
      }
    }
    if (window.lucide) {
      try { window.lucide.createIcons(); } catch (_) {}
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
        ccPaymentBadge.className = 'cc-stat-sub green';
      } else if (adv > 0) {
        ccPaymentBadge.textContent = 'Advance Paid';
        ccPaymentBadge.className = 'cc-stat-sub green';
      } else {
        ccPaymentBadge.textContent = 'Unpaid';
        ccPaymentBadge.className = 'cc-stat-sub red';
      }
    }

    const customerBtn = document.getElementById('btnCustomerQuickOptions');
    if (customerBtn && orderState.customer.phone) {
      customerBtn.onclick = () => {
        window.location.href = `../../customer/Customer360/customer360.html?mobile=${encodeURIComponent(orderState.customer.phone)}`;
      };
    }

    // Toggle Order Cancelled banner
    const cancelledBanner = document.getElementById('orderCancelledBanner');
    if (cancelledBanner) {
      cancelledBanner.style.display = orderState.status === 'CANCELLED' ? 'flex' : 'none';
    }

    // Update menu cancel option
    const menuCancel = document.getElementById('menuCancelOrder');
    if (menuCancel) {
      if (orderState.status === 'CANCELLED') {
        menuCancel.innerHTML = '<i data-lucide="slash" style="width:13px;height:13px;margin-right:8px;"></i>Order Cancelled';
        menuCancel.style.opacity = '0.5';
        menuCancel.style.pointerEvents = 'none';
      } else {
        menuCancel.innerHTML = '<i data-lucide="x-circle" style="width:13px;height:13px;margin-right:8px;"></i>Cancel Order';
        menuCancel.style.opacity = '1';
        menuCancel.style.pointerEvents = 'auto';
      }
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
    const totalDefs = defs.length;
    let curIdx = 0;

    if (orderState.status === 'CANCELLED') {
      // Find the specific stage where production halted
      if (orderState.currentStage && orderState.currentStage.toUpperCase() !== 'CANCELLED') {
        curIdx = findStageIndex(orderState.currentStage);
      } else if (orderState.liveStages && Array.isArray(orderState.liveStages)) {
        const inProg = orderState.liveStages.find(ls => ls.status === 'IN_PROGRESS');
        if (inProg) {
          curIdx = findStageIndex(inProg.stageName);
        } else {
          const completedStages = orderState.liveStages.filter(ls => ls.status === 'COMPLETED');
          if (completedStages.length > 0) {
            const lastComp = completedStages[completedStages.length - 1];
            curIdx = findStageIndex(lastComp.stageName);
          }
        }
      }
      curIdx = Math.max(0, Math.min(curIdx, totalDefs - 1));
    } else {
      curIdx = findStageIndex(orderState.currentStage || orderState.status);
      curIdx = Math.max(0, Math.min(curIdx, totalDefs - 1));
    }

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
          // IMPORTANT: If cancelled, do NOT allow liveStages to mark stages after curIdx as completed or in progress!
          if (orderState.status !== 'CANCELLED') {
            if (matched.status === 'COMPLETED') st = 'completed';
            else if (matched.status === 'IN_PROGRESS') st = 'current';
          }

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
    const isCancelled = orderState.status === 'CANCELLED';

    // Strictly clamp curIdx to a valid stage in [0, totalStages - 1]
    let curIdx = orderState.currentStageIndex;
    if (typeof curIdx !== 'number' || isNaN(curIdx) || curIdx < 0) {
      curIdx = 0;
    }
    if (totalStages > 0 && curIdx >= totalStages) {
      curIdx = totalStages - 1;
    }
    orderState.currentStageIndex = curIdx;

    const trackerWrap = document.querySelector('.production-progress-tracker-wrap');
    if (trackerWrap) {
      if (isCancelled) {
        trackerWrap.classList.add('tracker-cancelled');
      } else {
        trackerWrap.classList.remove('tracker-cancelled');
      }
    }

    if (isCancelled) {
      stepperContainer.classList.add('stepper-cancelled');
      // Update top warning banner with exact halted stage details
      const cancelledBanner = document.getElementById('orderCancelledBanner');
      if (cancelledBanner) {
        const frozenStageName = orderState.stages[curIdx]?.name || 'Current Stage';
        cancelledBanner.innerHTML = `<span style="font-weight:700;color:#f87171;font-size:12.5px;letter-spacing:0.3px;">cancaled at ${frozenStageName}</span>`;
        cancelledBanner.style.display = 'flex';
      }
    } else {
      stepperContainer.classList.remove('stepper-cancelled');
      const cancelledBanner = document.getElementById('orderCancelledBanner');
      if (cancelledBanner) cancelledBanner.style.display = 'none';
    }

    orderState.stages.forEach((stage, idx) => {
      const node = document.createElement('div');
      node.setAttribute('data-stage-idx', idx);

      let circleContent = '';
      let stageClass = stage.status;
      let labelExtra = '';

      if (isCancelled) {
        if (idx < curIdx) {
          stageClass = 'completed past-cancelled';
          circleContent = '✓';
        } else if (idx === curIdx) {
          // The current stage where production halted/froze turns RED!
          stageClass = 'current frozen-cancelled';
          circleContent = '<span class="step-halt-x">✕</span>';
          labelExtra = '<span class="step-freeze-tag">cancaled at this stage</span>';
        } else {
          stageClass = 'upcoming locked-cancelled';
          circleContent = '<span class="step-lock-dot"></span>';
        }
      } else {
        if (stage.status === 'completed') {
          circleContent = '✓';
        } else if (stage.status === 'current') {
          circleContent = '<span class="step-cur-dot"></span>';
        } else {
          circleContent = '<span class="step-pending-dot"></span>';
        }
      }

      node.className = `step-node ${stageClass}`;
      node.setAttribute('title', isCancelled && idx === curIdx
        ? `Production Frozen at ${stage.name} · Order Cancelled`
        : `${stage.name} · Assigned to ${stage.assignee}`);

      node.innerHTML = `
        <div class="step-circle">${circleContent}</div>
        <span class="step-label">${stage.name}</span>
        ${labelExtra}
      `;

      node.addEventListener('click', () => handleStageClick(idx));
      stepperContainer.appendChild(node);

      if (idx < totalStages - 1) {
        const connector = document.createElement('div');
        connector.className = 'step-connector';

        if (isCancelled) {
          if (idx < curIdx - 1) {
            connector.classList.add('completed', 'past-connector');
          } else if (idx === curIdx - 1) {
            // Track leading directly into the frozen/cancelled stage turns bold glowing RED!
            connector.classList.add('connector-cancelled-active');
          } else {
            // Track beyond the cancelled stage is dead/frozen
            connector.classList.add('connector-cancelled-dead');
          }
        } else {
          if (idx < curIdx) {
            connector.classList.add('completed');
          } else if (idx === curIdx) {
            connector.classList.add('active-to-current');
          }
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
    if (orderState.status === 'CANCELLED') {
      const curStage = orderState.stages[orderState.currentStageIndex];
      const stageName = curStage ? curStage.name : 'this stage';
      showToast(`Production is frozen at "${stageName}". Order has been cancelled.`, 'warn');
      return;
    }
    const targetStage = orderState.stages[stageIdx];
    if (!targetStage) return;

    if (stageIdx === orderState.currentStageIndex) {
      showToast(`Current Stage: ${targetStage.name} (Assigned to ${targetStage.assignee})`, 'info');
      return;
    }

    await transitionToStage(stageIdx);
  }

  async function transitionToStage(stageIdx) {
    if (orderState.status === 'CANCELLED') {
      showToast('Cannot progress stages on a cancelled order.', 'warn');
      return;
    }
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
    // Record real-time live activity entry
    const nowParts = formatDateTimeParts(new Date().toISOString());
    orderState.sessionActivities.push({
      date: nowParts.date,
      time: nowParts.time,
      rawTime: nowParts.rawTime,
      title: `Stage Advanced: ${targetDef.name}`,
      user: (targetDef.assignee && targetDef.assignee !== 'Unassigned')
        ? `Assigned to ${targetDef.assignee} · Live Transition`
        : 'Live Transition',
      dot: 'purple',
      status: 'completed',
      stage: targetDef.name
    });

    renderTimelineAndActivityCard();
    refreshLucideIcons();

    if (_api && _api.production && _api.production.transition && orderState.rawId) {
      try {
        await _api.production.transition(orderState.rawId, targetDef.code);
        // Refresh live stages from backend
        try {
          orderState.liveStages = await _api.production.getByOrder(orderState.rawId);
          renderTimelineAndActivityCard();
        } catch (_) {}
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
    const uploadedImgs = Array.isArray(orderState.referenceImages)
      ? orderState.referenceImages.filter(Boolean)
      : [];

    // Strictly customer given images — NO mock/static fallback images!
    const photos = uploadedImgs.map((src, idx) => ({
      src: src,
      title: `Customer Reference ${idx + 1}`,
      uploaded: true,
      slot: idx + 1
    }));
    orderState.photos = photos;

    // Helper to render individual slot HTML
    function getSlotHtml(slotNum, isLarge = false) {
      const photo = photos[slotNum - 1];
      if (photo && photo.src) {
        if (isLarge) {
          return `
            <div class="dp-large dr-thumb-wrap" onclick="openLightbox(0)" title="${photo.title}">
              <img id="drLargeImg" src="${photo.src}" alt="Customer Reference 1" />
              <button class="dr-thumb-delete" title="Remove image" onclick="event.stopPropagation(); deleteRefImage(1)">✕</button>
            </div>`;
        } else {
          const idx = slotNum - 1;
          return `
            <div class="dp-thumb dr-thumb-wrap" onclick="openLightbox(${idx})" title="${photo.title}">
              <img id="drThumb${idx}Img" src="${photo.src}" alt="Customer Reference ${slotNum}" />
              <button class="dr-thumb-delete" title="Remove image" onclick="event.stopPropagation(); deleteRefImage(${slotNum})">✕</button>
            </div>`;
        }
      }

      // Empty Frame
      if (isLarge) {
        return `
          <div class="dp-large dr-empty-frame dr-large-empty" onclick="triggerRefUpload(1)" title="Empty frame • Click to upload customer reference image 1">
            <div class="dr-empty-content">
              <i data-lucide="image" class="dr-empty-icon-lg"></i>
              <span class="dr-empty-badge">Empty Frame</span>
              <span class="dr-empty-text">No Customer Image</span>
              <small class="dr-empty-hint">+ Click to Upload</small>
            </div>
          </div>`;
      } else {
        return `
          <div class="dp-thumb dr-thumb-wrap dr-empty-frame dr-thumb-empty" onclick="triggerRefUpload(${slotNum})" title="Empty frame • Click to upload reference image ${slotNum}">
            <div class="dr-upload-placeholder">
              <i data-lucide="plus" class="dr-empty-icon-sm"></i>
              <span class="dr-empty-frame-tag">Empty Frame</span>
              <small class="dr-empty-sub-tag">Upload</small>
            </div>
          </div>`;
      }
    }

    const grid = document.getElementById('designPhotosGrid');
    if (grid) {
      const moreCount = Math.max(0, photos.length - 5);
      const slot5Html = moreCount > 0
        ? `<div class="dp-thumb dr-more-count" onclick="openAllDesignReferences()" title="View all ${photos.length} references">+${moreCount}</div>`
        : getSlotHtml(5, false);

      grid.innerHTML = `
        <div class="dp-large" id="drLargeSlot">
          ${getSlotHtml(1, true)}
        </div>
        <div class="dp-middle-col" id="drMidCol">
          ${getSlotHtml(2, false)}
          ${getSlotHtml(3, false)}
        </div>
        <div class="dp-right-col" id="drRightCol">
          ${getSlotHtml(4, false)}
          ${slot5Html}
        </div>
      `;
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

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch (_) {}
    }
  }

  // ─── Card 2: Order Details ───
  function renderOrderDetailsCard() {
    const gType = orderState.garmentType || '—';
    const gDesc = orderState.garmentDesc || '';

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
    if (odCollection) odCollection.textContent = orderState.collection || '—';
    if (odCategory) odCategory.textContent = orderState.designCategory || (gDesc ? 'Custom Bespoke Design' : '—');
    if (odNeck) odNeck.textContent = orderState.neckStyle || (orderState.customer?.preferredNeck || '—');
    if (odSleeve) odSleeve.textContent = orderState.sleeveStyle || (orderState.customer?.preferredSleeve || '—');
    if (odLining) odLining.textContent = orderState.lining || '—';
    if (odEmb) odEmb.textContent = orderState.embroidery || '—';
    if (odFab) odFab.textContent = orderState.fabric || gDesc || '—';
    if (odNotes) odNotes.textContent = orderState.customer?.notes || orderState.productionNotes || gDesc || '—';
  }

  // ─── Card 3: Fabric & Materials ───
  function renderFabricAndMaterialsCard() {
    const fabThumb = document.getElementById('fabThumbImg');
    const fabThumbEmpty = document.getElementById('fabThumbEmpty');
    const fabBadge = document.getElementById('fabBadge');
    const fabName = document.getElementById('fabName');
    const fabColor = document.getElementById('fabColor');
    const fabQty = document.getElementById('fabQty');
    const addMatsList = document.getElementById('fabAdditionalList');

    const customerFabricImg = (orderState.fabricImage && !orderState.fabricImage.includes('pink_silk') && !orderState.fabricImage.includes('chanderi') && !orderState.fabricImage.includes('georgette'))
      ? orderState.fabricImage
      : '';

    if (customerFabricImg && fabThumb) {
      fabThumb.src = customerFabricImg;
      fabThumb.style.display = 'block';
      if (fabThumbEmpty) fabThumbEmpty.style.display = 'none';
      fabThumb.onerror = () => {
        fabThumb.style.display = 'none';
        if (fabThumbEmpty) fabThumbEmpty.style.display = 'flex';
      };
    } else {
      if (fabThumb) fabThumb.style.display = 'none';
      if (fabThumbEmpty) fabThumbEmpty.style.display = 'flex';
    }

    if (fabBadge) {
      if (orderState.fabricSource) {
        fabBadge.textContent = orderState.fabricSource;
        fabBadge.style.display = 'inline-block';
      } else {
        fabBadge.textContent = '';
        fabBadge.style.display = 'none';
      }
    }
    if (fabName) {
      const fName = orderState.fabric || orderState.fabricName || orderState.garmentDesc;
      fabName.textContent = fName || '—';
    }
    if (fabColor) {
      if (orderState.fabricColor) {
        fabColor.textContent = String(orderState.fabricColor);
        fabColor.style.display = 'block';
      } else {
        fabColor.textContent = '';
        fabColor.style.display = 'none';
      }
    }
    if (fabQty) {
      if (orderState.fabricQty) {
        fabQty.textContent = String(orderState.fabricQty);
        fabQty.style.display = 'block';
      } else {
        fabQty.textContent = '';
        fabQty.style.display = 'none';
      }
    }

    if (addMatsList) {
      const mats = Array.isArray(orderState.additionalMaterials) ? orderState.additionalMaterials : [];
      if (mats.length > 0) {
        addMatsList.innerHTML = mats.map(m => `
          <div class="mat-item-line">
            <span class="dot ${m.dot || 'green'}"></span>
            <span class="mat-item-name">${m.name}</span>
            <span class="mat-item-val">${m.val || m.quantity || ''}</span>
          </div>
        `).join('');
      } else {
        addMatsList.innerHTML = `
          <div style="font-size:11px;color:var(--text-muted);padding:6px 0;">No additional materials recorded.</div>
        `;
      }
    }
    if (window.lucide) {
      try { window.lucide.createIcons(); } catch (_) {}
    }
  }

  // ─── Card 4: Production Team ───
  async function renderProductionTeamCard(api) {
    const teamContainer = document.getElementById('teamMembersList');
    if (!teamContainer) return;

    let employees = [];

    // Gather ONLY real assigned craftsmen from the order's live stages (zero fake/raw mock data)
    if (orderState.liveStages && Array.isArray(orderState.liveStages)) {
      orderState.liveStages.forEach(ls => {
        if (ls.assignedTo && typeof ls.assignedTo === 'object' && ls.assignedTo.name) {
          const empId = ls.assignedTo.id || ls.assignedTo.name;
          const stageLabel = ls.stageName ? formatStageLabel(ls.stageName) : (ls.assignedTo.role || '');
          const existing = employees.find(e => e.id === empId);
          if (existing) {
            if (!existing.stages.includes(stageLabel)) {
              existing.stages.push(stageLabel);
            }
          } else {
            employees.push({
              id: empId,
              name: ls.assignedTo.name,
              stages: [stageLabel],
              role: ls.assignedTo.role || ls.assignedTo.specialization || '',
              avatar: ls.assignedTo.avatar || ls.assignedTo.imageUrl || ''
            });
          }
        }
      });
    }

    if (employees.length === 0) {
      teamContainer.innerHTML = `
        <div class="team-empty-state" style="padding:22px 14px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;">
          <div style="width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px dashed rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;color:var(--text-muted);">
            <i data-lucide="users" style="width:18px;height:18px;opacity:0.6;"></i>
          </div>
          <div>
            <div style="font-size:12.5px;font-weight:600;color:var(--text-secondary);margin-bottom:3px;">No Team Assigned</div>
            <div style="font-size:11px;color:var(--text-muted);line-height:1.4;max-width:220px;margin:0 auto;">Craftsmen and specialists have not been assigned to this order yet.</div>
          </div>
          <button type="button" class="btn-ghost" onclick="openAssignTeamModal()" style="font-size:11.5px;padding:6px 14px;border-radius:8px;border:1px solid rgba(212,175,55,0.35);color:var(--lime);display:inline-flex;align-items:center;gap:6px;background:rgba(212,175,55,0.08);cursor:pointer;">
            <i data-lucide="user-plus" style="width:12px;height:12px;"></i>
            <span>Assign Craftsman</span>
          </button>
        </div>
      `;
      refreshLucideIcons();
      return;
    }

    teamContainer.innerHTML = `
      ${employees.map((emp, i) => {
        const initials = emp.name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'AT';
        const colorClass = `color-${i % 4}`;
        const avatarUrl = formatAvatarUrl(emp.avatar);
        const avatarInner = avatarUrl
          ? `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;display:block;" alt="${emp.name}" onerror="this.parentNode.innerHTML='${initials}'" />`
          : initials;
        const roleOrStages = emp.stages.join(' • ') || emp.role;

        return `
          <div class="team-member-row">
            <div class="tm-avatar ${colorClass}" style="overflow:hidden;padding:0;display:flex;align-items:center;justify-content:center;">
              ${avatarInner}
            </div>
            <div class="tm-meta">
              <span class="tm-name">${emp.name}</span>
              <span class="tm-role" title="${roleOrStages}">${roleOrStages}</span>
            </div>
            <button type="button" class="tm-chat-btn" onclick="openChatWithStaff('${emp.name.replace(/'/g, "\\'")}')" title="Message ${emp.name}">
              <i data-lucide="message-square" style="width:14px;height:14px;"></i>
            </button>
          </div>
        `;
      }).join('')}
      <div style="margin-top:10px;text-align:center;">
        <button type="button" class="btn-ghost" onclick="openAssignTeamModal()" style="font-size:11px;padding:5px 12px;width:100%;border-radius:8px;border:1px dashed rgba(255,255,255,0.15);color:var(--text-secondary);display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;">
          <i data-lucide="user-plus" style="width:12px;height:12px;"></i>
          <span>Assign / Reassign Stage</span>
        </button>
      </div>
    `;

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

    // Measurements profile from DB or empty
    const p = profile || {};
    orderState.measurementsProfile = p;
    const fmt = (v) => (v !== undefined && v !== null && v !== '' ? `${v}"` : '—');

    // 8 markers on Card
    let cardMarkers = [];
    if (targetProfileType === 'CHUDI') {
      cardMarkers = [
        { badge: '1', name: 'Shoulder', val: fmt(p.shoulder) },
        { badge: '2', name: 'Bust', val: fmt(p.bust) },
        { badge: '3', name: 'Waist', val: fmt(p.waist) },
        { badge: '4', name: 'Hip', val: fmt(p.hip) },
        { badge: '5', name: 'Top Length', val: fmt(p.topLength) },
        { badge: '6', name: 'Sleeve Length', val: fmt(p.sleeveLength) },
        { badge: '7', name: 'Armhole', val: fmt(p.armhole) },
        { badge: '8', name: 'Pant Length', val: fmt(p.pantLength) }
      ];
    } else if (targetProfileType === 'BLOUSE') {
      cardMarkers = [
        { badge: '1', name: 'Shoulder', val: fmt(p.shoulder) },
        { badge: '2', name: 'Bust', val: fmt(p.bust) },
        { badge: '3', name: 'Under Bust', val: fmt(p.underBust) },
        { badge: '4', name: 'Waist', val: fmt(p.waist) },
        { badge: '5', name: 'Blouse Length', val: fmt(p.blouseLength) },
        { badge: '6', name: 'Back Neck Depth', val: fmt(p.backNeckDepth) },
        { badge: '7', name: 'Armhole', val: fmt(p.armhole) },
        { badge: '8', name: 'Sleeve Length', val: fmt(p.sleeveLength) }
      ];
    } else if (targetProfileType === 'LEHENGA') {
      cardMarkers = [
        { badge: '1', name: 'Waist', val: fmt(p.waist) },
        { badge: '2', name: 'Hip', val: fmt(p.hip) },
        { badge: '3', name: 'Skirt Length', val: fmt(p.skirtLength) },
        { badge: '4', name: 'Flare (Ghera)', val: fmt(p.flare) },
        { badge: '5', name: 'Choli Bust', val: fmt(p.bust) },
        { badge: '6', name: 'Choli Length', val: fmt(p.blouseLength) },
        { badge: '7', name: 'Armhole', val: fmt(p.armhole) },
        { badge: '8', name: 'Sleeve', val: fmt(p.sleeveLength) }
      ];
    } else {
      cardMarkers = [
        { badge: '1', name: 'Shoulder', val: fmt(p.shoulder) },
        { badge: '2', name: 'Bust', val: fmt(p.bust) },
        { badge: '3', name: 'Waist', val: fmt(p.waist) },
        { badge: '4', name: 'Hip', val: fmt(p.hip) },
        { badge: '5', name: 'Full Length', val: fmt(p.fullLength) },
        { badge: '6', name: 'Sleeve Length', val: fmt(p.sleeveLength) },
        { badge: '7', name: 'Armhole', val: fmt(p.armhole) },
        { badge: '8', name: 'Neck Depth', val: fmt(p.frontNeckDepth) }
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
            <td>${p.recordedBy || '—'}</td>
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
    let notes = [];
    if (Array.isArray(orderState.productionNotes)) {
      notes = orderState.productionNotes.map(l => String(l).trim()).filter(Boolean);
    } else if (typeof orderState.productionNotes === 'string' && orderState.productionNotes.trim()) {
      notes = orderState.productionNotes
        .split(/\n+/)
        .map(l => l.trim())
        .filter(Boolean);
    }

    if (notes.length > 0) {
      checklist.innerHTML = notes.map(n => `
        <div class="check-item"><span class="check-icon">✓</span><span>${n}</span></div>
      `).join('');
    } else {
      checklist.innerHTML = `
        <div class="empty-state-notice" style="padding:18px 12px;text-align:center;color:var(--text-muted);font-size:12px;">
          No production notes recorded yet.
          <div style="margin-top:8px;">
            <button type="button" class="btn-card-edit" onclick="openEditNotesModal()" style="display:inline-flex;">+ Add Note</button>
          </div>
        </div>
      `;
    }
  }

  // ─── Card 7: Photos & Updates ───
  function renderPhotosAndUpdatesCard() {
    const strip = document.getElementById('productionPhotosStrip');
    if (!strip) return;

    const prodPhotos = (orderState.productionPhotos && Array.isArray(orderState.productionPhotos))
      ? orderState.productionPhotos.filter(Boolean)
      : [];

    if (prodPhotos.length > 0) {
      strip.innerHTML = prodPhotos.map((p, idx) => `
        <div class="prod-thumb" onclick="openLightbox(${idx})"><img src="${p}" alt="Stage Photo ${idx + 1}" /></div>
      `).join('') + `
        <div class="prod-add-tile" onclick="document.getElementById('photoUploadInput').click()">
          <i data-lucide="plus" style="width:13px;height:13px;"></i>
          <span>+ Add</span>
        </div>
      `;
    } else {
      strip.innerHTML = `
        <div class="prod-thumb-empty-frame" onclick="document.getElementById('photoUploadInput').click()" title="Click to add production progress photo">
          <i data-lucide="camera" style="width:18px;height:18px;opacity:0.6;"></i>
          <span style="font-size:11px;font-weight:600;color:var(--text-secondary);">Empty Frame</span>
          <small style="font-size:9.5px;color:var(--lime,#d4ff32);cursor:pointer;">+ Add Photo</small>
        </div>
      `;
    }
    if (window.lucide) {
      try { window.lucide.createIcons(); } catch (_) {}
    }
  }

  // ─── Real-Time Timeline Builder ───
  function buildRealTimeTimelineItems() {
    const items = [];

    // 1. Real Order Registration Event (from DB order.createdAt)
    const createdDt = formatDateTimeParts(orderState.rawCreatedAt || orderState.dates.orderDate);
    const custName = (orderState.customer && orderState.customer.name && orderState.customer.name !== '—')
      ? orderState.customer.name
      : 'Customer';
    items.push({
      date: createdDt.date,
      time: createdDt.time || 'Registered',
      rawTime: createdDt.rawTime || 1,
      title: `Order Registered (#${orderState.orderId})`,
      user: `Atelier Desk · ${custName}`,
      dot: 'green',
      status: 'completed',
      stage: 'Order Taken'
    });

    // 2. Real Payment Transactions / Advance
    const adv = Number(orderState.financials.paidAmount) || 0;
    const pTxs = Array.isArray(orderState.paymentTransactions) ? orderState.paymentTransactions : [];
    if (pTxs.length > 0) {
      pTxs.forEach((tx, idx) => {
        const txDt = formatDateTimeParts(tx.transactionDate || orderState.rawCreatedAt);
        const methodStr = tx.method ? String(tx.method).toUpperCase() : 'UPI/CASH';
        const recvStr = tx.receivedBy ? ` · Received by ${tx.receivedBy}` : '';
        const refStr = tx.referenceNo ? ` · Ref: ${tx.referenceNo}` : '';
        const amtStr = Number(tx.amount || 0).toLocaleString('en-IN');
        items.push({
          date: txDt.date,
          time: txDt.time || '',
          rawTime: txDt.rawTime || (createdDt.rawTime ? createdDt.rawTime + (idx + 1) * 60000 : 2),
          title: `Payment Received (₹${amtStr})`,
          user: `Method: ${methodStr}${recvStr}${refStr}`,
          dot: 'green',
          status: 'completed',
          stage: 'Payment'
        });
      });
    } else if (adv > 0) {
      items.push({
        date: createdDt.date,
        time: createdDt.time || '',
        rawTime: createdDt.rawTime ? createdDt.rawTime + 1000 : 2,
        title: `Advance Payment Confirmed (₹${adv.toLocaleString('en-IN')})`,
        user: `Advance collected upon booking`,
        dot: 'green',
        status: 'completed',
        stage: 'Payment'
      });
    }

    // 3. Live Stages from Database (orderState.liveStages)
    const liveStages = Array.isArray(orderState.liveStages) ? orderState.liveStages : [];
    liveStages.forEach((ls, idx) => {
      const stageLabel = formatStageLabel(ls.stageName);
      const isInitialOrderTaken = (ls.stageName && (ls.stageName.toUpperCase() === 'ORDER_TAKEN' || ls.stageName.toUpperCase() === 'ORDER')) || ls.sortOrder === 1;

      const empName = (ls.assignedTo && typeof ls.assignedTo === 'object' && ls.assignedTo.name)
        ? ls.assignedTo.name
        : (typeof ls.assignedTo === 'string' && ls.assignedTo.trim() ? ls.assignedTo.trim() : '');
      const empRole = (ls.assignedTo && typeof ls.assignedTo === 'object' && ls.assignedTo.role)
        ? ` (${ls.assignedTo.role})`
        : '';
      const actorLabel = empName ? `by ${empName}${empRole}` : (ls.notes || 'Stage completed');

      if (ls.status === 'COMPLETED') {
        if (!isInitialOrderTaken) {
          const compDt = formatDateTimeParts(ls.completedAt || ls.startedAt || orderState.rawCreatedAt);
          items.push({
            date: compDt.date,
            time: compDt.time || '',
            rawTime: compDt.rawTime || (createdDt.rawTime ? createdDt.rawTime + (idx + 1) * 3600000 : 10),
            title: `${stageLabel} Passed`,
            user: actorLabel,
            dot: 'green',
            status: 'completed',
            stage: stageLabel
          });
        }
      } else if (ls.status === 'IN_PROGRESS') {
        const startDt = formatDateTimeParts(ls.startedAt || new Date().toISOString());
        items.push({
          date: startDt.date,
          time: startDt.time || 'In Progress',
          rawTime: startDt.rawTime || Date.now(),
          title: `${stageLabel} in Progress`,
          user: empName ? `Assigned to ${empName}${empRole}` : 'Stage in progress',
          dot: 'yellow pulse',
          status: 'current',
          stage: stageLabel
        });
      } else if (ls.status === 'BLOCKED') {
        const blkDt = formatDateTimeParts(ls.startedAt || new Date().toISOString());
        items.push({
          date: blkDt.date,
          time: blkDt.time || 'Hold',
          rawTime: blkDt.rawTime || Date.now(),
          title: `${stageLabel} Attention Needed`,
          user: ls.notes ? `Remarks: ${ls.notes}` : 'On hold / rework required',
          dot: 'red pulse',
          status: 'current',
          stage: stageLabel
        });
      }
    });

    // 4. Session Real-Time Activities
    if (Array.isArray(orderState.sessionActivities)) {
      orderState.sessionActivities.forEach(act => {
        items.push({
          date: act.date,
          time: act.time,
          rawTime: act.rawTime || Date.now(),
          title: act.title,
          user: act.user,
          dot: act.dot || 'purple',
          status: act.status || 'completed',
          stage: act.stage || 'Update'
        });
      });
    }

    // 5. Scheduled Client Handover or Cancelled
    if (orderState.status === 'CANCELLED') {
      const cancelDt = formatDateTimeParts(new Date().toISOString());
      items.push({
        date: cancelDt.date,
        time: cancelDt.time || 'Halted',
        rawTime: Date.now() + 100000,
        title: 'Order Cancelled',
        user: 'Production stopped · Order marked as cancelled',
        dot: 'red',
        status: 'completed',
        stage: 'Cancelled'
      });
    } else if (orderState.status === 'DELIVERED') {
      const delDt = formatDateTimeParts(orderState.deliveredDate || orderState.dates.expectedDelivery);
      items.push({
        date: delDt.date,
        time: delDt.time || 'Completed',
        rawTime: delDt.rawTime || (Date.now() + 100000),
        title: 'Order Delivered to Client',
        user: `Handover verified · Client received order`,
        dot: 'green',
        status: 'completed',
        stage: 'Handover'
      });
    } else {
      const expDate = orderState.dates.expectedDelivery;
      items.push({
        date: expDate || 'Scheduled',
        time: 'Target Handover',
        rawTime: expDate ? new Date(expDate).getTime() : 9999999999999,
        title: 'Scheduled Client Handover',
        user: `Target Delivery Date: ${expDate || 'Pending scheduling'}`,
        dot: 'gray dim',
        status: 'upcoming',
        stage: 'Handover'
      });
    }

    // Sort chronologically ascending
    items.sort((a, b) => (a.rawTime || 0) - (b.rawTime || 0));

    return items;
  }

  // ─── Card 8: Timeline & Activity ───
  function renderTimelineAndActivityCard() {
    const list = document.getElementById('activityTimelineList');
    if (!list) return;

    const items = buildRealTimeTimelineItems();

    orderState.activityHistory = items.map(it => ({
      dateTime: `${it.date} ${it.time}`.trim(),
      activity: it.title,
      actor: it.user,
      stage: it.stage || 'Production',
      notes: it.status === 'completed' ? 'Verified record' : (it.status === 'upcoming' ? 'Scheduled milestone' : 'Active milestone')
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

    // ── Record Payment inline button (visible only when balance remains) ──
    const existingRecordBtn = document.getElementById('btnViewOrderRecordPayment');
    if (existingRecordBtn) existingRecordBtn.remove();

    if (bal > 0) {
      const paymentGaugeContainer = payBal ? payBal.closest('.gauge-card, .payment-gauge, .financials-card, [class*="gauge"], [class*="financials"]') : null;
      const recordBtn = document.createElement('button');
      recordBtn.id = 'btnViewOrderRecordPayment';
      recordBtn.className = 'pb-inline-record-btn';
      recordBtn.innerHTML = '<i data-lucide="plus-circle"></i> Record Payment';
      recordBtn.addEventListener('click', async () => {
        const { openPaymentModal } = await import('../../payments/payment-bridge.js');
        openPaymentModal({
          orderId:      orderState.rawId,
          orderCode:    orderState.orderId,
          customerName: orderState.customer.name,
          balance:      orderState.financials.balanceAmount,
          onSuccess:    () => loadOrderFromApi()
        });
      });
      if (paymentGaugeContainer) {
        paymentGaugeContainer.appendChild(recordBtn);
      } else if (payBal) {
        payBal.parentElement.appendChild(recordBtn);
      }
      if (window.lucide) window.lucide.createIcons();
    }

    // Card 10: Next Action Area
    const curStage = orderState.stages[orderState.currentStageIndex];
    const nextStage = orderState.stages[orderState.currentStageIndex + 1];

    let nextTitle = nextStage ? `${nextStage.name} to begin` : 'Order Fulfilled & Handover Complete';
    let nextAssignee = nextStage?.assignee || curStage?.assignee || 'Unassigned';
    let btnText = nextStage ? 'Mark as Started' : 'Order Delivered ✓';

    if (orderState.currentStageIndex >= orderState.stages.length - 1) {
      nextTitle = 'Order Fulfilled & Delivered';
      btnText = 'Delivered ✓';
    }

    if (orderState.status === 'CANCELLED') {
      nextTitle = 'Order Cancelled';
      nextAssignee = 'Production Cancelled';
      btnText = 'Order Cancelled';
    }

    orderState.nextAction = { title: nextTitle, assignee: nextAssignee, buttonText: btnText };

    const naTitleEl = document.getElementById('nextActionTitle');
    const naAssigneeEl = document.getElementById('nextActionAssignee');
    const btnMarkStarted = document.getElementById('btnMarkStarted');

    if (naTitleEl) naTitleEl.textContent = nextTitle;
    if (naAssigneeEl) naAssigneeEl.textContent = (orderState.status === 'CANCELLED')
      ? 'Production Halted'
      : ((nextAssignee && nextAssignee !== 'Unassigned') ? `Assigned to ${nextAssignee}` : 'Unassigned');

    if (btnMarkStarted) {
      if (orderState.status === 'CANCELLED') {
        btnMarkStarted.innerHTML = `<span>Order Cancelled</span> <i data-lucide="x-circle" style="width:14px;height:14px;"></i>`;
        btnMarkStarted.disabled = true;
        btnMarkStarted.classList.add('btn-mark-cancelled');
      } else {
        btnMarkStarted.innerHTML = `<span>${btnText}</span> <span>→</span>`;
        btnMarkStarted.disabled = false;
        btnMarkStarted.classList.remove('btn-mark-cancelled');
      }
    }
  }

  window.advanceNextActionStage = async function () {
    if (orderState.status === 'CANCELLED') {
      showToast('This order is cancelled. No further stage actions can be taken.', 'warn');
      return;
    }
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
    if (jcLoc) jcLoc.textContent = orderState.customer.location || '—';
    if (jcODate) jcODate.textContent = `Order Date: ${orderState.dates.orderDate || '—'}`;
    if (jcDDate) jcDDate.textContent = `Due Date: ${orderState.dates.expectedDelivery || '—'}`;
    if (jcStat) jcStat.textContent = `Status: ${orderState.status || 'PENDING'}`;
    if (jcGar) jcGar.textContent = `${orderState.garmentType || '—'} (${orderState.collection || '—'})`;
    if (jcCat) jcCat.textContent = orderState.designCategory || (orderState.garmentDesc ? 'Custom Bespoke Design' : '—');

    const sleevesAndLining = [orderState.sleeveStyle, orderState.lining].filter(Boolean).join(' · ');
    if (jcSleeves) jcSleeves.textContent = sleevesAndLining || '—';
    if (jcEmb) jcEmb.textContent = orderState.embroidery || '—';
    const fabInfo = [orderState.fabric, orderState.fabricColor, orderState.fabricQty].filter(Boolean).join(' · ');
    if (jcFab) jcFab.textContent = fabInfo || orderState.garmentDesc || '—';
    if (jcNotes) {
      const specialNote = orderState.customer?.notes || orderState.productionNotes;
      jcNotes.textContent = specialNote ? (typeof specialNote === 'string' ? specialNote : specialNote.join('\n')) : 'No special instructions recorded.';
    }

    const jcMeasGrid = document.getElementById('jcMeasGrid');
    if (jcMeasGrid) {
      const p = orderState.measurementsProfile || {};
      const fmt = (v) => (v !== undefined && v !== null && v !== '' ? `${v}"` : '—');
      jcMeasGrid.innerHTML = `
        <div>Shoulder: <strong>${fmt(p.shoulder)}</strong></div>
        <div>Bust: <strong>${fmt(p.bust)}</strong></div>
        <div>Waist: <strong>${fmt(p.waist)}</strong></div>
        <div>Length: <strong>${fmt(p.topLength || p.blouseLength || p.fullLength || p.skirtLength)}</strong></div>
      `;
    }
  }

  // ─── Lifecycle Setup ───
  document.addEventListener('DOMContentLoaded', () => {
    bindMeasurementTabs();
    bindDropdowns();
    bindKeyboardShortcuts();
    refreshLucideIcons();
    loadOrderFromApi();
    // Auto-refresh when any ERP module records a payment via payment-bridge.js
    window.addEventListener('payment:recorded', () => loadOrderFromApi());
  });

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
    if (!orderState.photos || orderState.photos.length === 0) {
      showToast('No customer design references uploaded yet. Click any frame to upload.', 'info');
      triggerRefUpload(1);
      return;
    }
    currentLightboxIndex = Math.max(0, Math.min(index || 0, orderState.photos.length - 1));
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
    if (!orderState.photos || orderState.photos.length === 0) {
      showToast('No customer design references uploaded yet. Click any frame to upload.', 'info');
      triggerRefUpload(1);
      return;
    }
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
    if (orderState.status === 'CANCELLED') {
      showToast('Cannot edit notes on a cancelled order.', 'warn');
      return;
    }
    const modal = document.getElementById('editNotesModal');
    const textarea = document.getElementById('editNotesTextarea');
    if (textarea) {
      if (Array.isArray(orderState.productionNotes)) {
        textarea.value = orderState.productionNotes.join('\n');
      } else {
        textarea.value = orderState.productionNotes || '';
      }
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

      // Sync to backend if order update API available
      if (orderState.rawId && _api && _api.orders && _api.orders.update) {
        try {
          await _api.orders.update(orderState.rawId, { productionNotes: lines.join('\n') });
        } catch (e) {
          console.warn('[ViewOrder] Could not sync production notes to backend:', e.message);
        }
      }

      // Record real-time live activity entry
      const nowParts = formatDateTimeParts(new Date().toISOString());
      const staffName = getCurrentStaffName();
      orderState.sessionActivities.push({
        date: nowParts.date,
        time: nowParts.time,
        rawTime: nowParts.rawTime,
        title: 'Production Notes Updated',
        user: staffName ? `${lines.length} checklist item(s) recorded · ${staffName}` : `${lines.length} checklist item(s) recorded`,
        dot: 'purple',
        status: 'completed',
        stage: 'Production Notes'
      });

      renderProductionNotesCard();
      renderTimelineAndActivityCard();
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

  window.openAssignTeamModal = async function () {
    if (orderState.status === 'CANCELLED') {
      showToast('Cannot reassign team on a cancelled order.', 'warn');
      return;
    }
    const modal = document.getElementById('assignTeamModal');
    if (!modal) return;

    const stageSelect = document.getElementById('assignStageSelect');
    const empSelect = document.getElementById('assignEmployeeSelect');

    // Populate stage options dynamically from order's live stages
    if (stageSelect) {
      if (orderState.liveStages && Array.isArray(orderState.liveStages) && orderState.liveStages.length > 0) {
        stageSelect.innerHTML = orderState.liveStages.map(ls => {
          const assignedText = ls.assignedTo ? ` (Current: ${ls.assignedTo.name})` : ' (Unassigned)';
          return `<option value="${ls.id}">${formatStageLabel(ls.stageName)}${assignedText}</option>`;
        }).join('');
      } else {
        stageSelect.innerHTML = '<option value="">No stages available</option>';
      }
    }

    // Populate employees dynamically from live database
    if (empSelect) {
      empSelect.innerHTML = '<option value="">Loading artisans...</option>';
      try {
        const client = _api || window.api;
        const empRes = await (client?.employees ? client.employees.list({ status: 'ACTIVE' }) : Promise.resolve([]));
        const list = Array.isArray(empRes) ? empRes : (empRes?.content || []);
        empSelect.innerHTML = `
          <option value="">-- Select Artisan / Specialist --</option>
          ${list.map(emp => {
            const spec = emp.specialization ? ` — ${emp.specialization.split(',')[0].trim()}` : (emp.role ? ` — ${emp.role}` : '');
            return `<option value="${emp.id}">${emp.name}${spec}</option>`;
          }).join('')}
        `;
      } catch (err) {
        empSelect.innerHTML = '<option value="">Failed to load employees</option>';
      }
    }

    modal.style.display = 'flex';
    refreshLucideIcons();
  };

  window.closeAssignTeamModal = function () {
    const modal = document.getElementById('assignTeamModal');
    if (modal) modal.style.display = 'none';
  };

  window.openTeamModal = function () {
    window.openAssignTeamModal();
  };

  window.submitAssignTeam = async function () {
    const stageSelect = document.getElementById('assignStageSelect');
    const empSelect = document.getElementById('assignEmployeeSelect');
    const stageId = stageSelect?.value;
    const empId = empSelect?.value;

    if (!stageId) {
      showToast('Please select a production stage.', 'warn');
      return;
    }
    if (!empId) {
      showToast('Please select an artisan or specialist.', 'warn');
      return;
    }

    const btn = document.getElementById('btnSubmitAssignTeam');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Assigning...';
    }

    try {
      const client = _api || window.api;
      if (!client || !client.production || !client.production.assignEmployee) {
        throw new Error('API client not available');
      }

      await client.production.assignEmployee(stageId, empId);
      showToast('Craftsman assigned successfully!', 'success');
      window.closeAssignTeamModal();

      // Refresh live stages from backend
      if (orderState.rawId) {
        orderState.liveStages = await client.production.getByOrder(orderState.rawId);
      }
      await renderProductionTeamCard(client);
      renderTimelineAndActivityCard();
    } catch (err) {
      console.error('[ViewOrder] Failed to assign employee:', err);
      showToast(err.message || 'Failed to assign craftsman to stage.', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Assign to Order';
      }
    }
  };

  window.openChatWithStaff = function (staffName) {
    showToast(`Opening internal chat with ${staffName}...`, 'info');
  };

  window.handleEditOrder = function () {
    if (orderState.status === 'CANCELLED') {
      showToast('Cannot edit a cancelled order.', 'warn');
      return;
    }
    showToast('Redirecting to order editor...', 'info');
    setTimeout(() => {
      window.location.href = `../new-order/new-order.html?editId=${encodeURIComponent(orderState.rawId || '')}`;
    }, 600);
  };

  window.handleDuplicateOrder = function () {
    showToast(`Order ${orderState.orderId || ''} duplicated as draft!`, 'success');
  };

  window.handleCancelOrder = function () {
    if (orderState.status === 'CANCELLED') {
      showToast('Order is already cancelled.', 'info');
      return;
    }
    if (orderState.status === 'DELIVERED') {
      showToast('Delivered orders cannot be cancelled.', 'warn');
      return;
    }

    const moreMenu = document.getElementById('moreDropdownMenu');
    if (moreMenu) moreMenu.classList.remove('open');

    const modal = document.getElementById('cancelOrderModal');
    const codeEl = document.getElementById('cancelModalOrderCode');
    if (codeEl) codeEl.textContent = orderState.orderId || 'this order';
    if (modal) modal.style.display = 'flex';
    if (window.lucide) window.lucide.createIcons();
  };

  window.closeCancelOrderModal = function () {
    const modal = document.getElementById('cancelOrderModal');
    if (modal) modal.style.display = 'none';
  };

  window.submitConfirmCancelOrder = async function () {
    const btn = document.getElementById('btnConfirmCancelOrder');
    const reasonSelect = document.getElementById('cancelReasonSelect');
    const reason = reasonSelect ? reasonSelect.value : 'Client Cancellation Request';

    try {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span style="display:inline-block;animation:spin 1s linear infinite;">⏳</span> Cancelling...';
      }

      // Ensure API client is available
      let api = window.api || _api;
      if (!api || !api.orders) {
        try {
          const mod = await import('../../api.js');
          api = mod.default || mod.api || window.api;
        } catch (_) { }
      }

      // Ensure targetId is resolved (UUID or code)
      let targetId = orderState.rawId;
      if (!targetId && api && api.orders) {
        try {
          const fetched = await api.orders.get(orderState.orderId);
          if (fetched && fetched.id) {
            targetId = fetched.id;
            orderState.rawId = fetched.id;
          }
        } catch (_) { }
      }

      if (!targetId) {
        throw new Error('Order identifier not found. Please refresh and try again.');
      }

      // 1. Call Backend REST API to persist CANCELLED status in PostgreSQL
      if (api && api.orders && api.orders.update) {
        await api.orders.update(targetId, {
          status: 'CANCELLED',
          totalAmount: orderState.financials.orderValue,
          advancePaid: orderState.financials.paidAmount,
          balanceAmount: orderState.financials.balanceAmount,
          notes: (orderState.customer.notes ? orderState.customer.notes + '\n' : '') + `[Cancelled: ${reason}]`
        });
      }

      // 2. Update local centralized state
      orderState.status = 'CANCELLED';

      // 3. Record real-time session activity for the timeline
      const nowParts = formatDateTimeParts(new Date().toISOString());
      const staffName = getCurrentStaffName();
      orderState.sessionActivities.push({
        date: nowParts.date,
        time: nowParts.time,
        rawTime: nowParts.rawTime,
        title: 'Order Cancelled',
        user: staffName ? `Cancelled by ${staffName} (${reason})` : `Order cancelled (${reason})`,
        dot: 'red',
        status: 'completed',
        stage: 'Cancelled'
      });

      // 4. Update Header status pill, collection, and banner
      renderHeaderAndCustomerCard();

      // 5. Update Gauges & Next Action (locks action button)
      renderGaugesAndNextAction(
        orderState.dates.daysLeft ? Math.max(1, 14 - orderState.dates.daysLeft) : 4,
        orderState.dates.totalLeadDays || 14,
        orderState.dates.daysLeft || 10
      );

      // 6. Refresh stepper, timeline, job card modal & icons
      setupProductionStages();
      initProductionStepper();
      renderTimelineAndActivityCard();
      populateJobCardModal();
      refreshLucideIcons();

      closeCancelOrderModal();
      showToast(`Order ${orderState.orderId} cancelled. Production is frozen.`, 'success');
    } catch (err) {
      console.error('[ViewOrder] Cancel order failed:', err);
      showToast('Failed to cancel order: ' + (err.message || 'Server error'), 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="x-circle" style="width:14px;height:14px;"></i>Confirm Cancellation';
        if (window.lucide) window.lucide.createIcons();
      }
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

        // Record real-time live activity entry
        const nowParts = formatDateTimeParts(new Date().toISOString());
        const staffName = getCurrentStaffName();
        orderState.sessionActivities.push({
          date: nowParts.date,
          time: nowParts.time,
          rawTime: nowParts.rawTime,
          title: 'Production Progress Photo Added',
          user: staffName ? `File: ${file.name} · ${staffName}` : `File: ${file.name}`,
          dot: 'purple',
          status: 'completed',
          stage: 'Photos & Updates'
        });
        renderTimelineAndActivityCard();

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
    if (orderState.status === 'CANCELLED') {
      showToast('Cannot upload images on a cancelled order.', 'warn');
      return;
    }
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

        // Record real-time live activity entry
        const nowParts = formatDateTimeParts(new Date().toISOString());
        const staffName = getCurrentStaffName();
        orderState.sessionActivities.push({
          date: nowParts.date,
          time: nowParts.time,
          rawTime: nowParts.rawTime,
          title: `Customer Design Reference ${slot} Uploaded`,
          user: staffName ? `File: ${file.name} · ${staffName}` : `File: ${file.name}`,
          dot: 'purple',
          status: 'completed',
          stage: 'Design Reference'
        });
        renderTimelineAndActivityCard();

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
    if (orderState.status === 'CANCELLED') {
      showToast('Cannot remove images from a cancelled order.', 'warn');
      return;
    }
    if (!orderState.rawId) return;
    if (!confirm(`Remove reference image ${slot}?`)) return;
    try {
      const updated = await _api.orders.deleteReferenceImage(orderState.rawId, slot);
      orderState.referenceImages = Array.isArray(updated.referenceImages)
        ? updated.referenceImages.filter(Boolean)
        : [];
      renderDesignReferenceCard();

      // Record real-time live activity entry
      const nowParts = formatDateTimeParts(new Date().toISOString());
      const staffName = getCurrentStaffName();
      orderState.sessionActivities.push({
        date: nowParts.date,
        time: nowParts.time,
        rawTime: nowParts.rawTime,
        title: `Design Reference ${slot} Removed`,
        user: staffName ? `Removed by ${staffName}` : `Slot ${slot} cleared`,
        dot: 'gray',
        status: 'completed',
        stage: 'Design Reference'
      });
      renderTimelineAndActivityCard();

      showToast(`Reference image ${slot} removed.`, 'info');
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };


  // ==========================================================================
  // CANCELLED ORDER UI LOCK
  // ==========================================================================
  /**
   * Called after all cards render when orderState.status === 'CANCELLED'.
   * Disables all buttons and links that mutate order data.
   */
  function lockCancelledOrderUI() {
    // IDs of buttons/links to disable
    const buttonIds = [
      'btnMarkStarted',
      'btnEditNotes',
      'btnAssignTeam',
      'btnEditOrder',
      'btnAddPhoto',
      'btnUploadPhoto',
      'btnAdvanceFromDetails'
    ];
    buttonIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.disabled = true;
        el.style.opacity = '0.45';
        el.style.cursor = 'not-allowed';
        el.style.pointerEvents = 'none';
      }
    });

    // Disable all buttons with class action-btn or btn-outline-sm inside the more-menu
    const actionBtns = document.querySelectorAll(
      '.more-dropdown-menu .dropdown-item, .header-actions .btn-outline-sm, .btn-action-row button, [data-cancel-lock]'
    );
    actionBtns.forEach(el => {
      if (el.id === 'btnCancelOrder' || el.id === 'btnPrintJobCard' || el.id === 'btnShareOrder') return; // keep read-only actions
      el.disabled = true;
      el.style.opacity = '0.45';
      el.style.cursor = 'not-allowed';
      el.style.pointerEvents = 'none';
    });

    // Add a body-level CSS class so CSS can target locked elements
    document.body.classList.add('order-is-cancelled');

    // Hide "Edit Order" in dropdown
    const editItem = document.querySelector('[onclick="handleEditOrder()"]');
    if (editItem) {
      editItem.style.opacity = '0.4';
      editItem.style.pointerEvents = 'none';
      editItem.style.cursor = 'not-allowed';
    }

    // Hide upload/delete buttons inside the design reference card
    document.querySelectorAll('.dr-thumb-upload, .dr-thumb-delete, .dr-upload-slot').forEach(el => {
      el.style.display = 'none';
    });

    // Hide the "Add Photo" button from timeline/photos card
    document.querySelectorAll('.photo-upload-btn, .btn-add-photo, [onclick="handleProductionPhotoUpload()"]').forEach(el => {
      el.style.display = 'none';
    });
  }

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
