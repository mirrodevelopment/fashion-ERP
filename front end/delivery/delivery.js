/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — DELIVERY & DISPATCH COMMAND CENTRE JAVASCRIPT
 * File: frontend/delivery/delivery.js
 * Description: Modular state management, table controllers, details panel,
 *              timeline updates, interactive modals, SVG charts, and toasts.
 * =======================================================================
 */

(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     1. CENTRALIZED STATE & DATA MODEL
     ──────────────────────────────────────────────────────────── */
  const STATE = {
    selectedOrderId: null,
    activeFilter: 'all',
    searchQuery: '',
    selectedTab: 'items',
    kpis: {
      ready: 0,
      out: 0,
      delivered: 0,
      overdue: 0,
      pickup: 0,
      onTimeRate: 100
    },
    orders: []
  };

  /* ────────────────────────────────────────────────────────────
     2. INITIALIZATION
     ──────────────────────────────────────────────────────────── */
  function updateKpiDisplay() {
    const elReady = document.getElementById('kpiValReady');
    const elOut = document.getElementById('kpiValOut');
    const elDelivered = document.getElementById('kpiValDelivered');
    const elOverdue = document.getElementById('kpiValOverdue');
    const elPickup = document.getElementById('kpiValPickup');

    if (elReady) elReady.textContent = STATE.kpis.ready;
    if (elOut) elOut.textContent = STATE.kpis.out;
    if (elDelivered) elDelivered.textContent = STATE.kpis.delivered;
    if (elOverdue) elOverdue.textContent = STATE.kpis.overdue;
    if (elPickup) elPickup.textContent = STATE.kpis.pickup;

    const total = (STATE.kpis.delivered || 0) + (STATE.kpis.ready || 0) + (STATE.kpis.out || 0);
    const onTimePct = total > 0 ? Math.round(((total - (STATE.kpis.overdue || 0)) * 100) / total) : 100;
    const centerEl = document.getElementById('kpiOnTimePctCenter');
    if (centerEl) centerEl.textContent = onTimePct + '%';

    const onTimeRing = document.getElementById('kpiOnTimeRing');
    if (onTimeRing) onTimeRing.setAttribute('stroke-dasharray', `${onTimePct}, 100`);

    const legendOnTime = document.getElementById('kpiLegendOnTime');
    if (legendOnTime) legendOnTime.textContent = onTimePct + '%';

    const legendDelayed = document.getElementById('kpiLegendDelayed');
    if (legendDelayed) legendDelayed.textContent = (100 - onTimePct) + '%';
  }

  async function loadDeliveriesFromApi() {
    try {
      const { default: api, Auth } = await import('../api.js');
      if (!Auth.isLoggedIn()) return;
      const res = await api.orders.list({ page: 0, size: 50 });
      const items = Array.isArray(res) ? res : (res && res.content ? res.content : []);
      const mapped = items.map(o => ({
        id: o.orderCode || ('ORD-' + o.id),
        customer: {
          name: o.customerName || 'Valued Client',
          phone: o.customerMobile || o.customerPhone || '—',
          location: o.customerLocation || 'In Store',
          vip: false,
          image: o.customerAvatar || '../assets/user_avatar.jpg',
          fallbackImg: '../assets/user_avatar.jpg'
        },
        garment: {
          type: o.garmentType || 'Bespoke Garment',
          collection: o.collection || 'Custom Couture',
          design: o.garmentDesc || 'Custom Design',
          size: '38',
          colour: 'Classic',
          quantity: 1,
          image: '../assets/designs/lehenga-stage.png',
          fallbackImg: '../assets/designs/lehenga-stage.png'
        },
        delivery: {
          method: 'Boutique Pickup',
          readySince: o.createdAt ? String(o.createdAt).slice(0, 10) : '—',
          status: o.status === 'DELIVERED' ? 'Delivered' : (o.status === 'READY' ? 'Ready' : (o.status === 'OVERDUE' ? 'Overdue' : 'Out for Delivery')),
          orderDate: o.orderDate ? String(o.orderDate).slice(0, 10) : '—',
          trackingNumber: null,
          courier: null,
          expectedDate: (o.expectedDeliveryDate || o.dueDate) ? String(o.expectedDeliveryDate || o.dueDate).slice(0, 10) : '—',
          deliveredDate: o.deliveredDate ? String(o.deliveredDate).slice(0, 10) : null
        },
        payment: {
          orderValue: Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0,
          advancePaid: Number(o.advancePaid) || 0,
          balanceAmount: Number(o.balanceAmount !== undefined ? o.balanceAmount : ((Number(o.totalAmount || o.amount) || 0) - (Number(o.advancePaid) || 0))) || 0,
          status: (Number(o.balanceAmount) <= 0 || o.status === 'DELIVERED') ? 'Paid' : 'Pending'
        },
        instructions: o.notes || 'Handle with care.',
        timeline: {
          confirmed: o.orderDate ? String(o.orderDate).slice(5) : '—',
          production: 'Completed',
          quality: 'Verified',
          ready: o.dueDate ? String(o.dueDate).slice(5) : '—'
        }
      }));
      STATE.orders = mapped;
      STATE.kpis.ready = mapped.filter(o => o.delivery.status === 'Ready').length;
      STATE.kpis.delivered = mapped.filter(o => o.delivery.status === 'Delivered').length;
      STATE.kpis.out = mapped.filter(o => o.delivery.status === 'Out for Delivery').length;
      STATE.kpis.overdue = mapped.filter(o => o.delivery.status === 'Overdue').length;
      STATE.kpis.pickup = mapped.filter(o => o.delivery.method.includes('Pickup')).length;
      updateKpiDisplay();
      renderTable();
      if (STATE.orders.length > 0) {
        selectOrder(STATE.orders[0].id);
      }
    } catch (e) {
      console.error('[Delivery] Failed to load deliveries from backend:', e.message);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initClock();
    renderTable();
    renderDetails(getSelectedOrder());
    bindEventListeners();
    refreshLucide();
    loadDeliveriesFromApi();
  });

  function refreshLucide() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function initClock() {
    function update() {
      const now = new Date();
      // Keep exact date & time from reference image or formatted realistically
      // Reference: Tue, 08 Sep 2026, 01:36 PM
      const dateEl = document.getElementById('currentHeaderDate');
      const timeEl = document.getElementById('currentHeaderTime');
      if (dateEl && !dateEl.dataset.custom) dateEl.textContent = 'Tue, 08 Sep 2026';
      if (timeEl && !timeEl.dataset.custom) timeEl.textContent = '01:36 PM';
    }
    update();
  }

  /* ────────────────────────────────────────────────────────────
     3. DATA ACCESSORS & HELPERS
     ──────────────────────────────────────────────────────────── */
  function getSelectedOrder() {
    return STATE.orders.find(o => o.id === STATE.selectedOrderId) || STATE.orders[0];
  }

  function getFilteredOrders() {
    return STATE.orders.filter(order => {
      // Filter tab check
      if (STATE.activeFilter !== 'all') {
        if (order.delivery.status.toLowerCase() !== STATE.activeFilter.toLowerCase()) {
          return false;
        }
      }

      // Search query check
      if (STATE.searchQuery.trim()) {
        const q = STATE.searchQuery.toLowerCase().trim();
        const matchId = order.id.toLowerCase().includes(q);
        const matchName = order.customer.name.toLowerCase().includes(q);
        const matchPhone = order.customer.phone.toLowerCase().includes(q);
        const matchGarment = order.garment.type.toLowerCase().includes(q) || order.garment.collection.toLowerCase().includes(q);
        const matchMethod = order.delivery.method.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchPhone && !matchGarment && !matchMethod) {
          return false;
        }
      }

      return true;
    });
  }

  /* ────────────────────────────────────────────────────────────
     4. ORDER TABLE RENDERING
     ──────────────────────────────────────────────────────────── */
  function renderTable() {
    const tbody = document.getElementById('deliveryTableBody');
    if (!tbody) return;

    const orders = getFilteredOrders();
    tbody.innerHTML = '';

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:36px;color:var(--text-muted);font-size:13px;">
            <i data-lucide="inbox" style="width:28px;height:28px;margin-bottom:8px;opacity:0.4;display:block;margin-inline:auto;"></i>
            No delivery orders found matching the filter criteria.
          </td>
        </tr>
      `;
      refreshLucide();
      return;
    }

    orders.forEach(order => {
      const isSelected = order.id === STATE.selectedOrderId;
      const tr = document.createElement('tr');
      tr.className = isSelected ? 'selected' : '';
      tr.dataset.orderId = order.id;

      // Status pill class
      let statusClass = 'ready';
      if (order.delivery.status === 'Overdue') statusClass = 'overdue';
      else if (order.delivery.status === 'Out for Delivery') statusClass = 'out-for-delivery';
      else if (order.delivery.status === 'Delivered') statusClass = 'delivered';

      tr.innerHTML = `
        <td>
          <div class="order-customer-cell">
            <img src="${order.customer.image}" alt="${order.customer.name}" class="table-avatar-img" onerror="this.src='${order.customer.fallbackImg}';" />
            <div class="order-info">
              <span class="order-id-txt">${order.id}</span>
              <span class="customer-name-txt">${order.customer.name}</span>
            </div>
          </div>
        </td>
        <td>
          <div class="garment-cell">
            <span class="garment-name">${order.garment.type}</span>
            <span class="garment-collection">${order.garment.collection}</span>
          </div>
        </td>
        <td><span class="qty-txt">${order.garment.quantity}</span></td>
        <td><span class="method-txt">${(order.tableMethod || order.delivery.method).replace('Courier / Shipping', 'Courier')}</span></td>
        <td><span class="date-txt">${order.delivery.readySince}</span></td>
        <td><span class="status-pill ${statusClass}">${order.delivery.status}</span></td>
        <td style="text-align:center;" onclick="event.stopPropagation()">
          <div class="row-actions" style="justify-content:center;">
            <button class="btn-row-action btn-send-action" data-order-id="${order.id}" title="Dispatch / Send Order">
              <i data-lucide="send"></i>
            </button>
            <button class="btn-row-action btn-call-action" data-phone="${order.customer.phone}" title="Call Customer">
              <i data-lucide="phone"></i>
            </button>
            <button class="btn-row-action btn-more-action" data-order-id="${order.id}" title="More Actions">
              <i data-lucide="more-horizontal"></i>
            </button>
          </div>
        </td>
      `;

      // Clicking row selects the order
      tr.addEventListener('click', () => {
        selectOrder(order.id);
      });

      tbody.appendChild(tr);
    });

    // Update pagination count text
    const pagInfo = document.getElementById('paginationInfo');
    if (pagInfo) {
      pagInfo.textContent = `Showing 1–${orders.length} of ${STATE.orders.length} orders`;
    }

    refreshLucide();
  }

  function selectOrder(orderId) {
    STATE.selectedOrderId = orderId;

    // Highlight row in table
    const tbody = document.getElementById('deliveryTableBody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');
      rows.forEach(r => {
        r.classList.toggle('selected', r.dataset.orderId === orderId);
      });
    }

    const order = getSelectedOrder();
    renderDetails(order);
    renderTimeline(order);
    refreshLucide();
  }

  /* ────────────────────────────────────────────────────────────
     5. DELIVERY DETAILS PANEL RENDERING
     ──────────────────────────────────────────────────────────── */
  function renderDetails(order) {
    if (!order) return;

    // 1. Hero Box
    const garmentImg = document.getElementById('detailGarmentImg');
    if (garmentImg) {
      garmentImg.src = order.garment.image;
      garmentImg.onerror = () => { garmentImg.src = order.garment.fallbackImg; };
    }

    const orderId = document.getElementById('detailOrderId');
    if (orderId) orderId.textContent = order.id;

    const statusPill = document.getElementById('detailStatusPill');
    if (statusPill) {
      let sc = 'ready';
      if (order.delivery.status === 'Overdue') sc = 'overdue';
      else if (order.delivery.status === 'Out for Delivery') sc = 'out-for-delivery';
      else if (order.delivery.status === 'Delivered') sc = 'delivered';
      statusPill.className = `status-pill ${sc}`;
      statusPill.textContent = order.delivery.status === 'Ready' ? 'Ready for Delivery' : order.delivery.status;
    }

    const customerName = document.getElementById('detailCustomerName');
    if (customerName) customerName.textContent = order.customer.name;

    const vipBadge = document.getElementById('detailVipBadge');
    if (vipBadge) {
      vipBadge.style.display = order.customer.vip ? 'inline-flex' : 'none';
    }

    const garmentLabel = document.getElementById('detailGarmentLabel');
    if (garmentLabel) garmentLabel.textContent = `${order.garment.type} · ${order.garment.collection}`;

    const orderDate = document.getElementById('detailOrderDate');
    if (orderDate) orderDate.textContent = order.delivery.orderDate || '22 Aug 2026';

    const readySince = document.getElementById('detailReadySince');
    if (readySince) readySince.textContent = order.delivery.readySince;

    const orderValue = document.getElementById('detailOrderValue');
    if (orderValue) orderValue.textContent = `₹${order.payment.orderValue.toLocaleString('en-IN')}`;

    const paymentStatus = document.getElementById('detailPaymentStatus');
    if (paymentStatus) {
      paymentStatus.innerHTML = `<span class="meta-dot"></span> ${order.payment.status}`;
    }

    // 2. Sub-Tabs Header
    renderActiveTabContent(order);

    // 3. Method Selection Cards
    const methodCards = document.querySelectorAll('#deliveryMethodCards .method-radio-card');
    methodCards.forEach(card => {
      const cardMethod = card.getAttribute('data-method');
      const isMatch = (cardMethod === order.delivery.method);
      card.classList.toggle('active', isMatch);
    });

    // 4. Contact Details
    const cName = document.getElementById('contactCustomerName');
    if (cName) cName.textContent = order.customer.name;

    const cPhone = document.getElementById('contactCustomerPhone');
    if (cPhone) cPhone.textContent = order.customer.phone;

    const cAddress = document.getElementById('contactCustomerAddress');
    if (cAddress) cAddress.textContent = order.customer.location;

    // 5. Pickup Instructions
    const instructions = document.getElementById('pickupInstructionsText');
    if (instructions) {
      instructions.value = order.instructions || 'Customer will pick up from store. Call 30 mins before pickup.';
    }

    // 6. Timeline
    renderTimeline(order);
  }

  function renderActiveTabContent(order) {
    const tabBody = document.getElementById('detailsTabBody');
    if (!tabBody) return;

    if (STATE.selectedTab === 'items') {
      // Default Items (1) view matching reference
      const tabThumb = document.getElementById('tabItemThumb');
      if (tabThumb) {
        tabThumb.src = order.garment.image;
        tabThumb.onerror = () => { tabThumb.src = order.garment.fallbackImg; };
      }
      const title = document.getElementById('tabItemTitle');
      if (title) title.textContent = order.garment.itemTitle || `${order.garment.type}`;
      const desc = document.getElementById('tabItemDesc');
      if (desc) desc.textContent = order.garment.subdesign || order.garment.design || order.garment.collection;

      const size = document.getElementById('tabItemSize');
      if (size) size.textContent = order.garment.size;

      const colour = document.getElementById('tabItemColour');
      if (colour) colour.textContent = order.garment.colour;

      const qty = document.getElementById('tabItemQty');
      if (qty) qty.textContent = order.garment.quantity;

      const st = document.getElementById('tabItemStatus');
      if (st) {
        let sc = 'ready';
        if (order.delivery.status === 'Overdue') sc = 'overdue';
        else if (order.delivery.status === 'Delivered') sc = 'delivered';
        st.className = `status-pill ${sc}`;
        st.textContent = order.delivery.status;
      }
    } else if (STATE.selectedTab === 'customer') {
      // Customer tab view
      showCustomerTab(order);
    } else if (STATE.selectedTab === 'delivery') {
      // Delivery tab view
      showDeliveryTab(order);
    } else if (STATE.selectedTab === 'payment') {
      // Payment tab view
      showPaymentTab(order);
    } else if (STATE.selectedTab === 'notes') {
      // Notes tab view
      showNotesTab(order);
    }
  }

  function showCustomerTab(order) {
    showToast(`Viewing Customer details for ${order.customer.name}`, 'info');
  }

  function showDeliveryTab(order) {
    showToast(`Delivery Method: ${order.delivery.method} | Tracking: ${order.delivery.trackingNumber || 'Awaiting dispatch'}`, 'info');
  }

  function showPaymentTab(order) {
    showToast(`Payment Status: ${order.payment.status} | Value: ₹${order.payment.orderValue.toLocaleString('en-IN')}`, 'info');
  }

  function showNotesTab(order) {
    showToast(`Notes: ${order.instructions}`, 'info');
  }

  /* ────────────────────────────────────────────────────────────
     6. TIMELINE RENDERING
     ──────────────────────────────────────────────────────────── */
  function renderTimeline(order) {
    const track = document.getElementById('deliveryTimelineTrack');
    if (!track) return;

    const status = order.delivery.status;
    const isDelivered = status === 'Delivered';
    const isOut = status === 'Out for Delivery';
    const isReady = status === 'Ready' || status === 'Overdue';

    track.innerHTML = `
      <!-- Step 1: Order Confirmed -->
      <div class="timeline-step completed">
        <div class="step-node"><i data-lucide="check"></i></div>
        <span class="step-name">Order Confirmed</span>
        <span class="step-date">${order.timeline.confirmed || '22 Aug'}</span>
      </div>

      <!-- Step 2: Production Completed -->
      <div class="timeline-step completed">
        <div class="step-node"><i data-lucide="check"></i></div>
        <span class="step-name">Production Completed</span>
        <span class="step-date">${order.timeline.production || '06 Sep'}</span>
      </div>

      <!-- Step 3: Quality Approved -->
      <div class="timeline-step completed">
        <div class="step-node"><i data-lucide="check"></i></div>
        <span class="step-name">Quality Approved</span>
        <span class="step-date">${order.timeline.quality || '08 Sep'}</span>
      </div>

      <!-- Step 4: Ready for Delivery -->
      <div class="timeline-step ${isDelivered || isOut ? 'completed' : (isReady ? 'active' : '')}">
        <div class="step-node">
          ${isDelivered || isOut ? '<i data-lucide="check"></i>' : ''}
        </div>
        <span class="step-name" style="${isReady && !isDelivered && !isOut ? 'color:var(--lime);' : ''}">Ready for Delivery</span>
        <span class="step-date">${order.timeline.ready || '08 Sep'}</span>
      </div>

      <!-- Step 5: Out for Delivery -->
      <div class="timeline-step ${isDelivered ? 'completed' : (isOut ? 'active' : '')}">
        <div class="step-node">
          ${isDelivered ? '<i data-lucide="check"></i>' : ''}
        </div>
        <span class="step-name" style="${isOut ? 'color:var(--blue-accent);' : (isDelivered ? '' : 'color:var(--text-muted);')}">Out for Delivery</span>
        <span class="step-date">${isOut || isDelivered ? '08 Sep' : '-'}</span>
      </div>

      <!-- Step 6: Delivered -->
      <div class="timeline-step ${isDelivered ? 'completed' : ''}">
        <div class="step-node">
          ${isDelivered ? '<i data-lucide="check"></i>' : ''}
        </div>
        <span class="step-name" style="${isDelivered ? 'color:#4ade80;' : 'color:var(--text-muted);'}">Delivered</span>
        <span class="step-date">${isDelivered ? 'Today' : '-'}</span>
      </div>
    `;

    refreshLucide();
  }

  /* ────────────────────────────────────────────────────────────
     7. EVENT LISTENERS & MODAL CONTROLLERS
     ──────────────────────────────────────────────────────────── */
  function bindEventListeners() {
    // 1. Filter Pills
    const filterPills = document.querySelectorAll('#filterPillsContainer .filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        STATE.activeFilter = pill.dataset.filter;
        renderTable();
      });
    });

    // 2. Search Input
    const searchInput = document.getElementById('orderSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        STATE.searchQuery = e.target.value;
        renderTable();
      });
    }

    // 3. Sub-Tabs in Delivery Details
    const subTabs = document.querySelectorAll('.details-tabs .details-tab');
    subTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        subTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        STATE.selectedTab = tab.dataset.tab;
        renderActiveTabContent(getSelectedOrder());
      });
    });

    // 4. Delivery Method Cards Selection
    const methodCards = document.querySelectorAll('#deliveryMethodCards .method-radio-card');
    methodCards.forEach(card => {
      card.addEventListener('click', () => {
        methodCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const chosen = card.getAttribute('data-method');
        const order = getSelectedOrder();
        if (order) {
          order.delivery.method = chosen;
          renderTable();
          showToast(`Delivery method changed to ${chosen}`, 'success');
        }
      });
    });

    // 5. Action: Mark as Delivered
    const headerMarkBtn = document.getElementById('headerMarkDeliveredBtn');
    const actionMarkBtn = document.getElementById('actionMarkDeliveredBtn');
    if (headerMarkBtn) headerMarkBtn.addEventListener('click', openMarkDeliveredModal);
    if (actionMarkBtn) actionMarkBtn.addEventListener('click', openMarkDeliveredModal);

    // Modal Mark Delivered Buttons
    const closeMarkBtn = document.getElementById('closeMarkDeliveredModal');
    const cancelMarkBtn = document.getElementById('cancelMarkDeliveredModal');
    const confirmMarkBtn = document.getElementById('confirmMarkDeliveredModal');
    if (closeMarkBtn) closeMarkBtn.addEventListener('click', closeMarkDeliveredModal);
    if (cancelMarkBtn) cancelMarkBtn.addEventListener('click', closeMarkDeliveredModal);
    if (confirmMarkBtn) confirmMarkBtn.addEventListener('click', handleConfirmDelivery);

    // 6. Action: Print Delivery Slip
    const actionPrintBtn = document.getElementById('actionPrintSlipBtn');
    if (actionPrintBtn) actionPrintBtn.addEventListener('click', openPrintSlipModal);
    const closePrintBtn = document.getElementById('closePrintSlipModal');
    const cancelPrintBtn = document.getElementById('cancelPrintSlipModal');
    if (closePrintBtn) closePrintBtn.addEventListener('click', closePrintSlipModal);
    if (cancelPrintBtn) cancelPrintBtn.addEventListener('click', closePrintSlipModal);

    // 7. Action: WhatsApp Notification
    const actionWaBtn = document.getElementById('actionWhatsappBtn');
    if (actionWaBtn) actionWaBtn.addEventListener('click', openWhatsappModal);
    const closeWaBtn = document.getElementById('closeWhatsappModal');
    const cancelWaBtn = document.getElementById('cancelWhatsappModal');
    const sendWaBtn = document.getElementById('sendWhatsappModal');
    if (closeWaBtn) closeWaBtn.addEventListener('click', closeWhatsappModal);
    if (cancelWaBtn) cancelWaBtn.addEventListener('click', closeWhatsappModal);
    if (sendWaBtn) sendWaBtn.addEventListener('click', handleSendWhatsapp);

    // 8. Action: Add Tracking Details
    const actionTrackBtn = document.getElementById('actionAddTrackingBtn');
    if (actionTrackBtn) actionTrackBtn.addEventListener('click', openTrackingModal);
    const closeTrackBtn = document.getElementById('closeTrackingModal');
    const cancelTrackBtn = document.getElementById('cancelTrackingModal');
    const saveTrackBtn = document.getElementById('saveTrackingModal');
    if (closeTrackBtn) closeTrackBtn.addEventListener('click', closeTrackingModal);
    if (cancelTrackBtn) cancelTrackBtn.addEventListener('click', closeTrackingModal);
    if (saveTrackBtn) saveTrackBtn.addEventListener('click', handleSaveTracking);

    // 9. Filter Modal
    const filterModalBtn = document.getElementById('filterModalBtn');
    if (filterModalBtn) filterModalBtn.addEventListener('click', openFilterModal);
    const closeFilterBtn = document.getElementById('closeFilterModal');
    const resetFilterBtn = document.getElementById('resetFilterModal');
    const applyFilterBtn = document.getElementById('applyFilterModal');
    if (closeFilterBtn) closeFilterBtn.addEventListener('click', closeFilterModal);
    if (resetFilterBtn) resetFilterBtn.addEventListener('click', handleResetFilters);
    if (applyFilterBtn) applyFilterBtn.addEventListener('click', handleApplyFilters);

    // 10. Date Selector Pill
    const dateBtn = document.getElementById('dateSelectorBtn');
    if (dateBtn) {
      dateBtn.addEventListener('click', () => {
        showToast('Viewing deliveries for Today, 08 Sep 2026', 'info');
      });
    }

    // 11. Table Row Actions Delegation (Send, Call, More)
    document.addEventListener('click', (e) => {
      // Send button
      const sendBtn = e.target.closest('.btn-send-action');
      if (sendBtn) {
        e.stopPropagation();
        const oId = sendBtn.dataset.orderId;
        selectOrder(oId);
        openMarkDeliveredModal();
        return;
      }

      // Call button
      const callBtn = e.target.closest('.btn-call-action');
      if (callBtn) {
        e.stopPropagation();
        const phone = callBtn.dataset.phone;
        window.location.href = `tel:${phone}`;
        showToast(`Calling customer at ${phone}...`, 'info');
        return;
      }

      // More button
      const moreBtn = e.target.closest('.btn-more-action');
      if (moreBtn) {
        e.stopPropagation();
        const oId = moreBtn.dataset.orderId;
        selectOrder(oId);
        showMoreMenu(moreBtn, oId);
        return;
      }
    });

    // 12. Select All Checkbox
    const selectAllCb = document.getElementById('selectAllCheckbox');
    if (selectAllCb) {
      selectAllCb.addEventListener('change', (e) => {
        const rowCbs = document.querySelectorAll('.row-checkbox');
        rowCbs.forEach(cb => { cb.checked = e.target.checked; });
        showToast(e.target.checked ? 'All orders selected' : 'Selections cleared', 'info');
      });
    }

    // 13. Pickup Instructions auto-save
    const instructionsBox = document.getElementById('pickupInstructionsText');
    if (instructionsBox) {
      instructionsBox.addEventListener('change', (e) => {
        const order = getSelectedOrder();
        if (order) {
          order.instructions = e.target.value;
          showToast('Pickup instructions updated', 'success');
        }
      });
    }
  }

  /* ────────────────────────────────────────────────────────────
     8. MODAL IMPLEMENTATIONS
     ──────────────────────────────────────────────────────────── */

  // Mark as Delivered
  function openMarkDeliveredModal() {
    const order = getSelectedOrder();
    const modal = document.getElementById('markDeliveredModal');
    if (!modal || !order) return;

    document.getElementById('modalConfirmOrderId').textContent = order.id;
    document.getElementById('modalConfirmValue').textContent = `₹${order.payment.orderValue.toLocaleString('en-IN')}`;
    document.getElementById('modalConfirmCustomer').textContent = `${order.customer.name} · ${order.garment.type}`;
    document.getElementById('modalConfirmMethod').textContent = order.delivery.method;

    modal.classList.add('active');
  }

  function closeMarkDeliveredModal() {
    const modal = document.getElementById('markDeliveredModal');
    if (modal) modal.classList.remove('active');
  }

  function handleConfirmDelivery() {
    const order = getSelectedOrder();
    if (!order) return;

    // Update status
    order.delivery.status = 'Delivered';

    // Update KPI numbers
    if (STATE.kpis.ready > 0) STATE.kpis.ready -= 1;
    STATE.kpis.delivered += 1;
    updateKpiDisplay();

    // Re-render
    renderTable();
    renderDetails(order);
    closeMarkDeliveredModal();

    showToast(`Order ${order.id} marked as delivered successfully!`, 'success');
  }

  async function updateKpiDisplay() {
    try {
      const { default: api } = await import('../api.js');
      const kpis = await api.delivery.kpis().catch(() => null);
      if (kpis) {
        const rEl = document.getElementById('kpiValReady');
        if (rEl && kpis.ready != null) rEl.textContent = kpis.ready;

        const outEl = document.getElementById('kpiValOut');
        if (outEl && kpis.outForDelivery != null) outEl.textContent = kpis.outForDelivery;

        const dEl = document.getElementById('kpiValDelivered');
        if (dEl && kpis.deliveredToday != null) dEl.textContent = kpis.deliveredToday;

        const ovEl = document.getElementById('kpiValOverdue');
        if (ovEl && kpis.overdue != null) ovEl.textContent = kpis.overdue;

        const pEl = document.getElementById('kpiValPickup');
        if (pEl && kpis.customerPickup != null) pEl.textContent = kpis.customerPickup;

        const cEl = document.getElementById('kpiValCourier');
        if (cEl && kpis.courierDelivery != null) cEl.textContent = kpis.courierDelivery;
        return;
      }
    } catch (_) {}

    const rEl = document.getElementById('kpiValReady');
    if (rEl) rEl.textContent = STATE.kpis.ready;

    const dEl = document.getElementById('kpiValDelivered');
    if (dEl) dEl.textContent = STATE.kpis.delivered;
  }

  // Print Delivery Slip Modal
  function openPrintSlipModal() {
    const order = getSelectedOrder();
    const modal = document.getElementById('printDeliverySlipModal');
    if (!modal || !order) return;

    document.getElementById('slipOrderId').textContent = order.id;
    document.getElementById('slipCustomer').textContent = order.customer.name;
    document.getElementById('slipPhone').textContent = order.customer.phone;
    document.getElementById('slipMethod').textContent = order.delivery.method;
    document.getElementById('slipValue').textContent = `₹${order.payment.orderValue.toLocaleString('en-IN')}`;
    document.getElementById('slipPayment').textContent = order.payment.status;

    document.getElementById('slipItemName').textContent = `${order.garment.type}`;
    document.getElementById('slipItemColl').textContent = order.garment.collection;
    document.getElementById('slipItemSize').textContent = order.garment.size;
    document.getElementById('slipItemQty').textContent = order.garment.quantity;

    modal.classList.add('active');
  }

  function closePrintSlipModal() {
    const modal = document.getElementById('printDeliverySlipModal');
    if (modal) modal.classList.remove('active');
  }

  // WhatsApp Notification Modal
  function openWhatsappModal() {
    const order = getSelectedOrder();
    const modal = document.getElementById('whatsappModal');
    if (!modal || !order) return;

    document.getElementById('waRecipientInput').value = `${order.customer.name} (${order.customer.phone})`;
    document.getElementById('waMessageText').value = `Hello ${order.customer.name},\n\nYour order ${order.id} is ready for delivery.\n\nGarment: ${order.garment.type} (${order.garment.collection})\nAmount: ₹${order.payment.orderValue.toLocaleString('en-IN')}\nStatus: ${order.delivery.status}\n\nThank you for choosing Haulo Boutique. We look forward to delighting you!`;

    modal.classList.add('active');
  }

  function closeWhatsappModal() {
    const modal = document.getElementById('whatsappModal');
    if (modal) modal.classList.remove('active');
  }

  function handleSendWhatsapp() {
    const order = getSelectedOrder();
    closeWhatsappModal();
    showToast(`WhatsApp notification sent to ${order.customer.name}!`, 'success');
  }

  // Tracking Details Modal
  function openTrackingModal() {
    const order = getSelectedOrder();
    const modal = document.getElementById('trackingModal');
    if (!modal || !order) return;

    document.getElementById('trackMethodInput').value = order.delivery.method;
    document.getElementById('trackCourierName').value = order.delivery.courier || 'BlueDart Express';
    document.getElementById('trackNumberInput').value = order.delivery.trackingNumber || 'BDX-7749210';
    document.getElementById('trackContactInput').value = order.customer.phone;

    modal.classList.add('active');
  }

  function closeTrackingModal() {
    const modal = document.getElementById('trackingModal');
    if (modal) modal.classList.remove('active');
  }

  function handleSaveTracking() {
    const order = getSelectedOrder();
    if (order) {
      order.delivery.courier = document.getElementById('trackCourierName').value;
      order.delivery.trackingNumber = document.getElementById('trackNumberInput').value;
      order.delivery.status = 'Out for Delivery';

      if (STATE.kpis.ready > 0) STATE.kpis.ready -= 1;
      STATE.kpis.out += 1;
      updateKpiDisplay();
      const outEl = document.getElementById('kpiValOut');
      if (outEl) outEl.textContent = STATE.kpis.out;

      renderTable();
      renderDetails(order);
      closeTrackingModal();
      showToast(`Tracking saved: ${order.delivery.trackingNumber} (${order.delivery.courier})`, 'success');
    }
  }

  // Filter Modal
  function openFilterModal() {
    const modal = document.getElementById('filterModal');
    if (modal) modal.classList.add('active');
  }

  function closeFilterModal() {
    const modal = document.getElementById('filterModal');
    if (modal) modal.classList.remove('active');
  }

  function handleApplyFilters() {
    const statusVal = document.getElementById('filterSelectStatus').value;
    STATE.activeFilter = statusVal;

    // Update filter pills UI
    const filterPills = document.querySelectorAll('#filterPillsContainer .filter-pill');
    filterPills.forEach(p => {
      p.classList.toggle('active', p.dataset.filter.toLowerCase() === statusVal.toLowerCase());
    });

    renderTable();
    closeFilterModal();
    showToast('Filters applied successfully', 'info');
  }

  function handleResetFilters() {
    document.getElementById('filterSelectStatus').value = 'all';
    document.getElementById('filterSelectMethod').value = 'all';
    document.getElementById('filterSelectPayment').value = 'all';
    STATE.activeFilter = 'all';

    const filterPills = document.querySelectorAll('#filterPillsContainer .filter-pill');
    filterPills.forEach(p => {
      p.classList.toggle('active', p.dataset.filter === 'all');
    });

    renderTable();
    closeFilterModal();
    showToast('Filters reset', 'info');
  }

  // Row Action "More" Context Menu
  function showMoreMenu(btn, orderId) {
    // Quick popover
    const existing = document.getElementById('rowMoreDropdown');
    if (existing) existing.remove();

    const rect = btn.getBoundingClientRect();
    const dd = document.createElement('div');
    dd.id = 'rowMoreDropdown';
    dd.className = 'dd-panel';
    dd.style.cssText = `
      position: fixed;
      top: ${rect.bottom + 6}px;
      left: ${rect.left - 130}px;
      z-index: 10000;
      width: 170px;
      background: rgba(28,22,19,0.96);
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 8px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.7);
      display: flex;
      flex-direction: column;
      padding: 6px 0;
      backdrop-filter: blur(16px);
      font-size: 11.5px;
    `;

    dd.innerHTML = `
      <div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#fff;" id="ddViewOrder">View Order</div>
      <div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#fff;" id="ddViewDelivery">View Delivery</div>
      <div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#4ade80;" id="ddMarkDelivered">Mark as Delivered</div>
      <div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#fff;" id="ddPrintSlip">Print Delivery Slip</div>
      <div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#fff;" id="ddSendWa">Send WhatsApp</div>
      <div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#38bdf8;" id="ddAddTrack">Add Tracking Details</div>
    `;

    document.body.appendChild(dd);

    // Handlers
    dd.querySelector('#ddViewOrder').onclick = () => {
      dd.remove();
      showToast(`Viewing Order ${orderId}`, 'info');
    };
    dd.querySelector('#ddViewDelivery').onclick = () => {
      dd.remove();
      selectOrder(orderId);
    };
    dd.querySelector('#ddMarkDelivered').onclick = () => {
      dd.remove();
      openMarkDeliveredModal();
    };
    dd.querySelector('#ddPrintSlip').onclick = () => {
      dd.remove();
      openPrintSlipModal();
    };
    dd.querySelector('#ddSendWa').onclick = () => {
      dd.remove();
      openWhatsappModal();
    };
    dd.querySelector('#ddAddTrack').onclick = () => {
      dd.remove();
      openTrackingModal();
    };

    function onDocClick(e) {
      if (!dd.contains(e.target) && e.target !== btn) {
        dd.remove();
        document.removeEventListener('click', onDocClick);
      }
    }
    setTimeout(() => { document.addEventListener('click', onDocClick); }, 50);
  }

  /* ────────────────────────────────────────────────────────────
     9. TOAST NOTIFICATION UTILITY
     ──────────────────────────────────────────────────────────── */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const borderColor = type === 'success' ? '#22c55e' : (type === 'error' ? '#ef4444' : '#38bdf8');
    const iconName = type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-triangle' : 'info');

    toast.style.cssText = `
      background: rgba(30, 24, 21, 0.95);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-left: 4px solid ${borderColor};
      border-radius: 10px;
      padding: 10px 16px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 12px 36px rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      animation: toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width:16px;height:16px;color:${borderColor};flex-shrink:0;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    refreshLucide();

    setTimeout(() => {
      toast.style.transition = 'opacity 0.25s, transform 0.25s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 260);
    }, 3500);
  }

  // Export to window for debugging or backend extension
  window.DeliveryApp = {
    STATE,
    selectOrder,
    renderTable,
    renderDetails,
    showToast
  };

})();
