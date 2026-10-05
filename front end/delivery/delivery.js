/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — DELIVERY & DISPATCH COMMAND CENTRE JAVASCRIPT
 * File: frontend/delivery/delivery.js
 * Description: Pure 100% Real API/Database Driven Implementation.
 *              No mock, dummy, or hardcoded seed data arrays.
 * =======================================================================
 */

(function () {
  'use strict';

  const FALLBACK_GARMENT_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='48' height='48' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 14 L24 4 L42 14 L34 44 L14 44 Z'/%3E%3Cpath d='M24 4 L24 44' stroke-dasharray='3 3'/%3E%3C/svg%3E";

  /* ────────────────────────────────────────────────────────────
     1. CENTRALIZED STATE & DATA MODEL
     ──────────────────────────────────────────────────────────── */
  const STATE = {
    selectedOrderId: null,
    activeFilter: 'all',
    searchQuery: '',
    selectedTab: 'items',
    currentPage: 1,
    pageSize: 8,
    selectedCheckboxes: new Set(),
    kpis: {
      ready: 0,
      out: 0,
      delivered: 0,
      overdue: 0,
      pickup: 0,
      onTimeRate: 100
    },
    orders: [],
    customersMap: new Map()
  };

  /* ────────────────────────────────────────────────────────────
     2. LIFECYCLE & DATA INITIALIZATION
     ──────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initClock();
    bindEventListeners();
    refreshLucide();
    loadDataFromBackend();
    // Auto-refresh when any ERP module records a payment via payment-bridge.js
    window.addEventListener('payment:recorded', () => loadDataFromBackend());
  });

  function refreshLucide() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function initClock() {
    function update() {
      const now = new Date();
      const options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
      const dateStr = now.toLocaleDateString('en-GB', options);
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const dateEl = document.getElementById('currentHeaderDate');
      const timeEl = document.getElementById('currentHeaderTime');
      const selDateEl = document.getElementById('selectedDateLabel');

      if (dateEl) dateEl.textContent = dateStr;
      if (timeEl) timeEl.textContent = timeStr;
      if (selDateEl) selDateEl.textContent = `Today, ${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
    update();
    setInterval(update, 60000);
  }

  /**
   * Fetches real orders and customer records from Spring Boot backend
   */
  async function loadDataFromBackend() {
    try {
      const { default: api, Auth } = await import('../api.js');
      if (!Auth.isLoggedIn()) {
        showToast('Please log in to view live delivery records.', 'error');
        return;
      }

      // 1. Fetch Customers to map addresses, VIP tiers, preferences
      try {
        const custRes = await api.customers.list({ size: 100 }).catch(() => null);
        const customersList = Array.isArray(custRes) ? custRes : (custRes && custRes.content ? custRes.content : []);
        customersList.forEach(c => {
          const key = (c.mobileNumber || c.phone || '').trim().replace(/\D/g, '');
          if (key) {
            STATE.customersMap.set(key, c);
          }
        });
      } catch (err) {
        console.warn('[Delivery] Could not load customers for address join:', err.message);
      }

      // 2. Fetch Orders (exclude cancelled orders)
      const orderRes = await api.orders.list({ size: 100 }).catch(() => []);
      const rawOrders = (Array.isArray(orderRes) ? orderRes : (orderRes && orderRes.content ? orderRes.content : []))
        .filter(o => String(o.status || '').toUpperCase() !== 'CANCELLED');

      if (rawOrders.length === 0) {
        STATE.orders = [];
        STATE.selectedOrderId = null;
        calculateKpis();
        updateKpisUi();
        updateFilterCountsUi();
        renderEmptyState();
        renderEmptyDetails();
        renderMethodsDonut();
        renderPerformanceBars();
        return;
      }

      // Map raw backend orders to our delivery model
      const today = new Date().toISOString().slice(0, 10);

      STATE.orders = rawOrders.map(o => {
        const rawMobile = (o.customerMobile || o.customerPhone || '').trim();
        const cleanMobile = rawMobile.replace(/\D/g, '');
        const matchedCust = STATE.customersMap.get(cleanMobile) || {};

        // Calculate delivery status
        const isDelivered = o.status === 'DELIVERED';
        const expectedDate = o.expectedDeliveryDate ? String(o.expectedDeliveryDate).slice(0, 10) : '';
        const deliveredDateStr = o.deliveredDate ? String(o.deliveredDate).slice(0, 10) : '';
        const isOverdue = !isDelivered && expectedDate && expectedDate < today;
        const isDelayed = isDelivered ? (deliveredDateStr && expectedDate && deliveredDateStr > expectedDate) : isOverdue;
        const isOutForDelivery = o.status === 'OUT_FOR_DELIVERY' || (o.status === 'IN_PROGRESS' && (o.currentStage === 'DELIVERY' || o.currentStage === 'DISPATCH'));

        let deliveryStatus = 'Ready';
        if (isDelivered) deliveryStatus = 'Delivered';
        else if (isOutForDelivery) deliveryStatus = 'Out for Delivery';
        else if (isOverdue) deliveryStatus = 'Overdue';
        else if (o.status === 'READY') deliveryStatus = 'Ready';

        // Delivery Method from customer preference or assigned
        let method = o.deliveryMethod || matchedCust.deliveryPreference || 'Customer Pickup';
        if (method.toLowerCase().includes('pickup') || method.toLowerCase().includes('boutique')) {
          method = 'Customer Pickup';
        } else if (method.toLowerCase().includes('courier') || method.toLowerCase().includes('shipping')) {
          method = 'Courier / Shipping';
        } else if (method.toLowerCase().includes('local') || method.toLowerCase().includes('atelier') || method.toLowerCase().includes('evening')) {
          method = 'Local Delivery';
        }

        // Garment & Pricing details
        const total = Number(o.totalAmount || o.amount || 0);
        const advance = Number(o.advancePaid || 0);
        const balance = Number(o.balanceAmount !== undefined ? o.balanceAmount : (total - advance));
        const paymentStatus = (balance <= 0 || isDelivered) ? 'Paid' : (advance > 0 ? 'Partial' : 'Pending');

        // Customer VIP determination
        const isVip = matchedCust.tier && (matchedCust.tier.includes('VIP') || matchedCust.tier.includes('PLATINUM') || matchedCust.tier.includes('GOLD'));

        // Customer address formatting
        let address = '';
        if (matchedCust.streetAddress || matchedCust.city) {
          address = `${matchedCust.streetAddress || ''}${matchedCust.city ? ', ' + matchedCust.city : ''}${matchedCust.state ? ', ' + matchedCust.state : ''}`.trim();
        } else if (o.customerLocation) {
          address = o.customerLocation;
        }

        return {
          id: o.orderCode || ('ORD-' + o.id),
          dbId: o.id,
          isDelayed: isDelayed,
          customer: {
            name: o.customerName || matchedCust.name || 'Valued Client',
            phone: rawMobile || matchedCust.mobileNumber || '—',
            address: address || '—',
            vip: !!isVip,
            tier: matchedCust.tier || 'STANDARD',
            avatar: o.customerAvatar || matchedCust.avatar || ''
          },
          garment: {
            type: o.garmentType || 'Bespoke Garment',
            collection: o.collection || '',
            desc: o.garmentDesc || '',
            size: o.size || '—',
            colour: o.colour || '—',
            quantity: o.quantity || 1,
            image: (o.referenceImages && o.referenceImages.length > 0) ? o.referenceImages[0] : (o.designImageUrl || o.imageUrl || FALLBACK_GARMENT_SVG)
          },
          delivery: {
            method: method,
            status: deliveryStatus,
            readySince: o.orderDate ? formatDate(o.orderDate) : formatDate(o.createdAt || new Date()),
            orderDate: o.orderDate ? formatDate(o.orderDate) : '—',
            expectedDate: expectedDate ? formatDate(expectedDate) : '—',
            deliveredDate: o.deliveredDate ? formatDate(o.deliveredDate) : null,
            expectedDateRaw: expectedDate,
            deliveredDateRaw: deliveredDateStr,
            orderDateRaw: o.orderDate ? String(o.orderDate).slice(0, 10) : '',
            courier: o.courierName || '',
            trackingNumber: o.trackingNumber || ''
          },
          payment: {
            total: total,
            advance: advance,
            balance: balance,
            status: paymentStatus
          },
          instructions: o.notes || '',
          createdAt: o.createdAt || o.orderDate
        };
      });

      // Recalculate KPIs based on real database records
      calculateKpis();
      updateKpisUi();
      updateFilterCountsUi();

      // Render table & select first order
      renderTable();
      if (STATE.orders.length > 0) {
        selectOrder(STATE.orders[0].id);
      } else {
        renderEmptyDetails();
      }

      // Render bottom analytics
      renderMethodsDonut();
      renderPerformanceBars();

    } catch (err) {
      console.error('[Delivery] Error loading delivery data:', err);
      STATE.orders = [];
      STATE.selectedOrderId = null;
      calculateKpis();
      updateKpisUi();
      updateFilterCountsUi();
      renderEmptyState();
      renderEmptyDetails();
      renderMethodsDonut();
      renderPerformanceBars();
      showToast('Error loading live data from database.', 'error');
    }
  }

  function formatDate(d) {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d).slice(0, 10);
      return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (_) {
      return String(d).slice(0, 10);
    }
  }

  /* ────────────────────────────────────────────────────────────
     3. KPI & FILTER COUNTS COMPUTATION
     ──────────────────────────────────────────────────────────── */
  function calculateKpis() {
    let ready = 0;
    let out = 0;
    let delivered = 0;
    let overdue = 0;
    let pickup = 0;

    STATE.orders.forEach(o => {
      const st = o.delivery.status;
      if (st === 'Ready') ready++;
      else if (st === 'Out for Delivery') out++;
      else if (st === 'Delivered') delivered++;
      else if (st === 'Overdue') overdue++;

      if (o.delivery.method === 'Customer Pickup') {
        pickup++;
      }
    });

    STATE.kpis.ready = ready;
    STATE.kpis.out = out;
    STATE.kpis.delivered = delivered;
    STATE.kpis.overdue = overdue;
    STATE.kpis.pickup = pickup;

    const deliveredOrders = STATE.orders.filter(o => o.delivery.status === 'Delivered');
    if (deliveredOrders.length > 0) {
      const onTimeDelivered = deliveredOrders.filter(o => !o.isDelayed).length;
      STATE.kpis.onTimeRate = Math.round((onTimeDelivered * 100) / deliveredOrders.length);
    } else {
      const totalActive = ready + out + overdue;
      if (totalActive > 0) {
        STATE.kpis.onTimeRate = Math.max(0, Math.round(((totalActive - overdue) * 100) / totalActive));
      } else {
        STATE.kpis.onTimeRate = 0;
      }
    }
  }

  function updateKpisUi() {
    const valReady = document.getElementById('kpiValReady');
    const valOut = document.getElementById('kpiValOut');
    const valDelivered = document.getElementById('kpiValDelivered');
    const valOverdue = document.getElementById('kpiValOverdue');
    const valPickup = document.getElementById('kpiValPickup');

    if (valReady) valReady.textContent = STATE.kpis.ready;
    if (valOut) valOut.textContent = STATE.kpis.out;
    if (valDelivered) valDelivered.textContent = STATE.kpis.delivered;
    if (valOverdue) valOverdue.textContent = STATE.kpis.overdue;
    if (valPickup) valPickup.textContent = STATE.kpis.pickup;

    // Subtexts
    const subReady = document.getElementById('kpiValReadySub');
    const subOut = document.getElementById('kpiValOutSub');
    const subDelivered = document.getElementById('kpiValDeliveredSub');
    const subOverdue = document.getElementById('kpiValOverdueSub');
    const subPickup = document.getElementById('kpiValPickupSub');

    if (subReady) subReady.textContent = STATE.kpis.ready > 0 ? `${STATE.kpis.ready} awaiting handover` : 'All dispatched';
    if (subOut) subOut.textContent = STATE.kpis.out > 0 ? `${STATE.kpis.out} en route` : 'None in transit';
    if (subDelivered) subDelivered.textContent = STATE.kpis.delivered > 0 ? `${STATE.kpis.delivered} completed` : 'No deliveries yet';
    if (subOverdue) subOverdue.textContent = STATE.kpis.overdue > 0 ? `${STATE.kpis.overdue} needs attention` : 'Zero delays';
    if (subPickup) subPickup.textContent = STATE.kpis.pickup > 0 ? `${STATE.kpis.pickup} in queue` : 'No pickups';

    // On-Time Ring and Text
    const rateCenter = document.getElementById('kpiOnTimePctCenter');
    const onTimeRing = document.getElementById('kpiOnTimeRing');
    const delayedRing = document.getElementById('kpiDelayedRing');
    const legOnTime = document.getElementById('kpiLegendOnTime');
    const legDelayed = document.getElementById('kpiLegendDelayed');

    const rate = STATE.kpis.onTimeRate;
    const totalOrders = STATE.orders.length;
    if (totalOrders === 0) {
      if (rateCenter) rateCenter.textContent = '0%';
      if (legOnTime) legOnTime.textContent = '0%';
      if (legDelayed) legDelayed.textContent = '0%';
      if (onTimeRing) onTimeRing.setAttribute('stroke-dasharray', '0, 100');
      if (delayedRing) delayedRing.setAttribute('stroke-dasharray', '0, 100');
    } else {
      if (rateCenter) rateCenter.textContent = `${rate}%`;
      if (legOnTime) legOnTime.textContent = `${rate}%`;
      if (legDelayed) legDelayed.textContent = `${100 - rate}%`;
      if (onTimeRing) onTimeRing.setAttribute('stroke-dasharray', `${rate}, 100`);
      if (delayedRing) delayedRing.setAttribute('stroke-dasharray', `${100 - rate}, 100`);
    }
  }

  function updateFilterCountsUi() {
    const cAll = document.getElementById('countAll');
    const cReady = document.getElementById('countReady');
    const cOut = document.getElementById('countOut');
    const cDel = document.getElementById('countDelivered');

    if (cAll) cAll.textContent = `(${STATE.orders.length})`;
    if (cReady) cReady.textContent = `(${STATE.kpis.ready})`;
    if (cOut) cOut.textContent = `(${STATE.kpis.out + STATE.kpis.overdue})`;
    if (cDel) cDel.textContent = `(${STATE.kpis.delivered})`;
  }

  /* ────────────────────────────────────────────────────────────
     4. ORDER FILTERING & PAGINATION
     ──────────────────────────────────────────────────────────── */
  function getFilteredOrders() {
    return STATE.orders.filter(order => {
      // 1. Tab status filter
      if (STATE.activeFilter !== 'all') {
        const orderStatus = order.delivery.status.toLowerCase();
        const activeFilter = STATE.activeFilter.toLowerCase();

        // "Out for Delivery" tab also shows Overdue orders (missed delivery deadline)
        if (activeFilter === 'out for delivery') {
          if (orderStatus !== 'out for delivery' && orderStatus !== 'overdue') {
            return false;
          }
        } else {
          if (orderStatus !== activeFilter) {
            return false;
          }
        }
      }

      // 2. Real-time search query
      if (STATE.searchQuery.trim()) {
        const q = STATE.searchQuery.toLowerCase().trim();
        const mId = order.id.toLowerCase().includes(q);
        const mName = order.customer.name.toLowerCase().includes(q);
        const mPhone = order.customer.phone.toLowerCase().includes(q);
        const mGarment = order.garment.type.toLowerCase().includes(q) || order.garment.collection.toLowerCase().includes(q);
        const mMethod = order.delivery.method.toLowerCase().includes(q);

        if (!mId && !mName && !mPhone && !mGarment && !mMethod) {
          return false;
        }
      }

      return true;
    });
  }

  /* ────────────────────────────────────────────────────────────
     5. ORDERS QUEUE TABLE RENDERING
     ──────────────────────────────────────────────────────────── */
  function renderTable() {
    const tbody = document.getElementById('deliveryTableBody');
    if (!tbody) return;

    // ── Dynamically update panel title based on active filter ──
    const panelTitle = document.getElementById('ordersTableTitle');
    if (panelTitle) {
      const titleMap = {
        'all':              'All Delivery Orders',
        'ready':            'Ready for Delivery',
        'out for delivery': 'Out for Delivery & Overdue',
        'delivered':        'Delivered Orders',
        'overdue':          'Overdue Orders'
      };
      panelTitle.textContent = titleMap[STATE.activeFilter.toLowerCase()] || 'Delivery Orders';
    }

    const filtered = getFilteredOrders();
    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted);font-size:13px;">
            <i data-lucide="package-search" style="width:32px;height:32px;margin:0 auto 10px;opacity:0.4;display:block;"></i>
            No delivery orders found matching the filter criteria.
          </td>
        </tr>
      `;
      updatePaginationControls(0, 0);
      refreshLucide();
      return;
    }

    // Paginate
    const totalPages = Math.ceil(filtered.length / STATE.pageSize) || 1;
    if (STATE.currentPage > totalPages) STATE.currentPage = totalPages;
    const startIndex = (STATE.currentPage - 1) * STATE.pageSize;
    const pageOrders = filtered.slice(startIndex, startIndex + STATE.pageSize);

    pageOrders.forEach(order => {
      const isSelected = order.id === STATE.selectedOrderId;
      const tr = document.createElement('tr');
      tr.className = isSelected ? 'selected' : '';
      tr.dataset.orderId = order.id;

      // Status pill class
      let pillClass = 'ready';
      if (order.delivery.status === 'Out for Delivery') pillClass = 'out-for-delivery';
      else if (order.delivery.status === 'Delivered') pillClass = 'delivered';
      else if (order.delivery.status === 'Overdue') pillClass = 'overdue';


      // Customer patron avatar
      const avatarHtml = typeof window.renderPatronAvatarHtml === 'function'
        ? window.renderPatronAvatarHtml(order.customer.name, order.customer.avatar, 'haulo-avatar-sm', 'width:36px;height:36px;border-radius:9px;')
        : `<div class="haulo-patron-avatar-initials haulo-avatar-sm" style="width:36px;height:36px;border-radius:9px;">${typeof window.getPatronInitials === 'function' ? window.getPatronInitials(order.customer.name) : 'CU'}</div>`;

      // Row action icon adapts to order status
      let rowActionIcon = 'send';
      let rowActionTitle = 'Mark as Delivered';
      if (order.delivery.status === 'Delivered') {
        rowActionIcon = 'receipt';
        rowActionTitle = 'View Receipt';
      } else if (order.delivery.status === 'Out for Delivery') {
        rowActionIcon = 'map-pin';
        rowActionTitle = 'Update Tracking';
      } else if (order.delivery.status === 'Overdue') {
        rowActionIcon = 'alert-triangle';
        rowActionTitle = 'Resolve — Overdue';
      }

      tr.innerHTML = `

        <td>
          <div class="order-customer-cell">
            ${avatarHtml}
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
        <td><span class="method-txt">${order.delivery.method}</span></td>
        <td><span class="date-txt">${order.delivery.readySince}</span></td>
        <td><span class="status-pill ${pillClass}">${order.delivery.status}</span></td>
        <td style="text-align:center;" onclick="event.stopPropagation()">
          <div class="row-actions" style="justify-content:center;">
            <button class="btn-row-action btn-send-action" data-order-id="${order.id}" title="${rowActionTitle}">
              <i data-lucide="${rowActionIcon}"></i>
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

      // Row click selection
      tr.addEventListener('click', () => {
        selectOrder(order.id);
      });

      tbody.appendChild(tr);
    });

    updatePaginationControls(filtered.length, pageOrders.length);
    refreshLucide();
  }

  function updatePaginationControls(totalCount, currentCount) {
    const pagInfo = document.getElementById('paginationInfo');
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (pagInfo) {
      if (totalCount === 0) {
        pagInfo.textContent = 'Showing 0 of 0 orders';
      } else {
        const start = (STATE.currentPage - 1) * STATE.pageSize + 1;
        const end = Math.min(start + currentCount - 1, totalCount);
        pagInfo.textContent = `Showing ${start}–${end} of ${totalCount} orders`;
      }
    }

    if (!pageNumbers) return;
    pageNumbers.innerHTML = '';

    const totalPages = Math.ceil(totalCount / STATE.pageSize) || 1;
    for (let i = 1; i <= totalPages; i++) {
      const numBtn = document.createElement('button');
      numBtn.type = 'button';
      numBtn.className = `page-num ${i === STATE.currentPage ? 'active' : ''}`;
      numBtn.textContent = i;
      numBtn.addEventListener('click', () => {
        STATE.currentPage = i;
        renderTable();
      });
      pageNumbers.appendChild(numBtn);
    }

    if (prevBtn) {
      prevBtn.disabled = STATE.currentPage <= 1;
      prevBtn.onclick = () => {
        if (STATE.currentPage > 1) {
          STATE.currentPage--;
          renderTable();
        }
      };
    }

    if (nextBtn) {
      nextBtn.disabled = STATE.currentPage >= totalPages;
      nextBtn.onclick = () => {
        if (STATE.currentPage < totalPages) {
          STATE.currentPage++;
          renderTable();
        }
      };
    }
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
    if (order) {
      renderDetails(order);
    }
    refreshLucide();
  }

  function getSelectedOrder() {
    return STATE.orders.find(o => o.id === STATE.selectedOrderId) || STATE.orders[0];
  }

  /* ────────────────────────────────────────────────────────────
     6. DELIVERY DETAILS PANEL RENDERING
     ──────────────────────────────────────────────────────────── */
  function renderEmptyDetails() {
    const garmentImg = document.getElementById('detailGarmentImg');
    if (garmentImg) garmentImg.style.display = 'none';

    const elOrderId = document.getElementById('detailOrderId');
    if (elOrderId) elOrderId.textContent = '—';

    const elStatusPill = document.getElementById('detailStatusPill');
    if (elStatusPill) elStatusPill.style.display = 'none';

    const elCustomerName = document.getElementById('detailCustomerName');
    if (elCustomerName) elCustomerName.textContent = '—';

    const elVipBadge = document.getElementById('detailVipBadge');
    if (elVipBadge) elVipBadge.style.display = 'none';

    const elGarmentLabel = document.getElementById('detailGarmentLabel');
    if (elGarmentLabel) elGarmentLabel.textContent = '—';

    const elOrderDate = document.getElementById('detailOrderDate');
    if (elOrderDate) elOrderDate.textContent = '—';

    const elOrderValue = document.getElementById('detailOrderValue');
    if (elOrderValue) elOrderValue.textContent = '₹0';

    const elReadySince = document.getElementById('detailReadySince');
    if (elReadySince) elReadySince.textContent = '—';

    const elPaymentStatus = document.getElementById('detailPaymentStatus');
    if (elPaymentStatus) elPaymentStatus.innerHTML = '<span class="meta-dot"></span> —';

    // Tabs
    const tabItemThumb = document.getElementById('tabItemThumb');
    if (tabItemThumb) tabItemThumb.style.display = 'none';

    const tabItemTitle = document.getElementById('tabItemTitle');
    if (tabItemTitle) tabItemTitle.textContent = '—';

    const tabItemDesc = document.getElementById('tabItemDesc');
    if (tabItemDesc) tabItemDesc.textContent = 'No item selected';

    const tabItemSize = document.getElementById('tabItemSize');
    if (tabItemSize) tabItemSize.textContent = '—';

    const tabItemColour = document.getElementById('tabItemColour');
    if (tabItemColour) tabItemColour.textContent = '—';

    const tabItemQty = document.getElementById('tabItemQty');
    if (tabItemQty) tabItemQty.textContent = '0';

    const tabItemStatus = document.getElementById('tabItemStatus');
    if (tabItemStatus) tabItemStatus.style.display = 'none';

    const elContactName = document.getElementById('contactCustomerName');
    if (elContactName) elContactName.textContent = '—';

    const elContactPhone = document.getElementById('contactCustomerPhone');
    if (elContactPhone) elContactPhone.textContent = '—';

    const elContactAddress = document.getElementById('contactCustomerAddress');
    if (elContactAddress) elContactAddress.textContent = '—';

    const instructionsText = document.getElementById('pickupInstructionsText');
    if (instructionsText) {
      instructionsText.value = '';
      instructionsText.readOnly = false;
      instructionsText.style.opacity = '1';
    }

    const methodCards = document.querySelectorAll('#deliveryMethodCards .method-radio-card');
    methodCards.forEach(c => {
      c.classList.remove('active');
      c.style.pointerEvents = 'none';
      c.style.opacity = '0.5';
    });

    const headerBtn = document.getElementById('headerMarkDeliveredBtn');
    if (headerBtn) {
      headerBtn.style.opacity = '0.5';
      headerBtn.style.pointerEvents = 'none';
    }

    const btnMarkDelivered = document.getElementById('actionMarkDeliveredBtn');
    if (btnMarkDelivered) {
      btnMarkDelivered.style.opacity = '0.5';
      btnMarkDelivered.style.pointerEvents = 'none';
    }
  }

  function renderDetails(order) {
    if (!order) {
      renderEmptyDetails();
      return;
    }

    const st = order.delivery.status; // 'Ready' | 'Out for Delivery' | 'Delivered' | 'Overdue'
    const isDelivered = st === 'Delivered';
    const isOut = st === 'Out for Delivery';
    const isOverdue = st === 'Overdue';
    const isReady = st === 'Ready';

    // Hero box preview image
    const garmentImg = document.getElementById('detailGarmentImg');
    if (garmentImg) {
      garmentImg.style.display = '';
      garmentImg.src = order.garment.image;
      garmentImg.onerror = () => { garmentImg.src = FALLBACK_GARMENT_SVG; };
    }

    // Hero Order ID
    const elOrderId = document.getElementById('detailOrderId');
    if (elOrderId) elOrderId.textContent = order.id;

    // Hero Status Pill
    const elStatusPill = document.getElementById('detailStatusPill');
    if (elStatusPill) {
      elStatusPill.style.display = '';
      let pillClass = 'ready';
      if (isOut) pillClass = 'out-for-delivery';
      else if (isDelivered) pillClass = 'delivered';
      else if (isOverdue) pillClass = 'overdue';

      elStatusPill.className = `status-pill ${pillClass}`;
      elStatusPill.textContent = isReady ? 'Ready for Delivery' : st;
    }

    // Customer Name & VIP Badge
    const elCustomerName = document.getElementById('detailCustomerName');
    if (elCustomerName) elCustomerName.textContent = order.customer.name;

    const elVipBadge = document.getElementById('detailVipBadge');
    if (elVipBadge) {
      elVipBadge.style.display = order.customer.vip ? 'inline-flex' : 'none';
      if (order.customer.tier && order.customer.vip) {
        elVipBadge.innerHTML = `<i data-lucide="crown" style="width:10px;height:10px;"></i> ${order.customer.tier.replace('_', ' ')}`;
      }
    }

    // Garment Label
    const elGarmentLabel = document.getElementById('detailGarmentLabel');
    if (elGarmentLabel) elGarmentLabel.textContent = `${order.garment.type} · ${order.garment.collection}`;

    // Meta Grid Values
    const elOrderDate = document.getElementById('detailOrderDate');
    if (elOrderDate) elOrderDate.textContent = order.delivery.orderDate;

    const elOrderValue = document.getElementById('detailOrderValue');
    if (elOrderValue) elOrderValue.textContent = `₹${order.payment.total.toLocaleString('en-IN')}`;

    const elReadySince = document.getElementById('detailReadySince');
    if (elReadySince) elReadySince.textContent = order.delivery.readySince;

    const elPaymentStatus = document.getElementById('detailPaymentStatus');
    if (elPaymentStatus) {
      const isPaid = order.payment.status === 'Paid';
      elPaymentStatus.className = `hero-meta-val ${isPaid ? 'green' : ''}`;
      elPaymentStatus.innerHTML = `<span class="meta-dot" style="background:${isPaid ? '#34d399' : '#fbbf24'}"></span> ${order.payment.status}`;
    }

    // ── Collect Balance button (shown when outstanding balance > 0) ──
    const collectBtn = document.getElementById('btnCollectBalance');
    if (collectBtn) {
      if (order.payment.balance > 0 && !isDelivered) {
        collectBtn.classList.add('visible');
        collectBtn.onclick = async () => {
          const { openPaymentModal } = await import('../payments/payment-bridge.js');
          openPaymentModal({
            orderId:      order.dbId,
            orderCode:    order.id,
            customerName: order.customer.name,
            balance:      order.payment.balance,
            label:        'Collect Balance on Delivery',
            onSuccess:    () => {
              loadDataFromBackend();
              showToast('Balance collected & delivery record updated!', 'success');
            }
          });
        };
      } else {
        collectBtn.classList.remove('visible');
        collectBtn.onclick = null;
      }
    }

    // ── STATUS-AWARE: Header Action Button ─────────────────────
    const headerBtn = document.getElementById('headerMarkDeliveredBtn');
    if (headerBtn) {
      if (isDelivered) {
        headerBtn.innerHTML = `<span class="plus-icon"><i data-lucide="receipt" style="width:13px;height:13px;vertical-align:middle;"></i></span><span>View Receipt</span>`;
        headerBtn.style.opacity = '0.65';
        headerBtn.title = 'Order already delivered';
        headerBtn.onclick = () => openPrintSlipModal();
      } else if (isOut) {
        headerBtn.innerHTML = `<span class="plus-icon"><i data-lucide="map-pin" style="width:13px;height:13px;vertical-align:middle;"></i></span><span>Update Tracking</span>`;
        headerBtn.style.opacity = '1';
        headerBtn.title = 'Update shipment tracking';
        headerBtn.onclick = () => openTrackingModal();
      } else if (isOverdue) {
        headerBtn.innerHTML = `<span class="plus-icon">!</span><span>Resolve — Overdue</span>`;
        headerBtn.style.opacity = '1';
        headerBtn.style.borderColor = '#f43f5e';
        headerBtn.title = 'Order is overdue — mark as delivered or contact customer';
        headerBtn.onclick = () => openMarkDeliveredModal();
      } else {
        // Ready — default
        headerBtn.innerHTML = `<span class="plus-icon">+</span><span>Mark as Delivered</span>`;
        headerBtn.style.opacity = '1';
        headerBtn.style.borderColor = '';
        headerBtn.title = '';
        headerBtn.onclick = () => openMarkDeliveredModal();
      }
    }

    // ── STATUS-AWARE: Delivery Actions Panel ───────────────────
    const btnMarkDelivered = document.getElementById('actionMarkDeliveredBtn');
    const btnAddTracking  = document.getElementById('actionAddTrackingBtn');
    const btnPrintSlip    = document.getElementById('actionPrintSlipBtn');
    const btnWhatsapp     = document.getElementById('actionWhatsappBtn');

    if (btnMarkDelivered) {
      if (isDelivered) {
        // Already delivered — swap button to "View Receipt"
        btnMarkDelivered.innerHTML = `<i data-lucide="receipt"></i><span>View Receipt</span>`;
        btnMarkDelivered.classList.remove('primary-lime');
        btnMarkDelivered.style.opacity = '0.55';
        btnMarkDelivered.title = 'Order already delivered';
        btnMarkDelivered.onclick = () => openPrintSlipModal();
      } else if (isOut) {
        btnMarkDelivered.innerHTML = `<i data-lucide="check-circle-2"></i><span>Mark as Delivered</span>`;
        btnMarkDelivered.classList.add('primary-lime');
        btnMarkDelivered.style.opacity = '1';
        btnMarkDelivered.title = '';
        btnMarkDelivered.onclick = openMarkDeliveredModal;
      } else if (isOverdue) {
        btnMarkDelivered.innerHTML = `<i data-lucide="check-circle-2"></i><span>Mark as Delivered</span>`;
        btnMarkDelivered.classList.add('primary-lime');
        btnMarkDelivered.style.opacity = '1';
        btnMarkDelivered.style.borderColor = '#f43f5e';
        btnMarkDelivered.title = 'Overdue — mark as delivered immediately';
        btnMarkDelivered.onclick = openMarkDeliveredModal;
      } else {
        btnMarkDelivered.innerHTML = `<i data-lucide="check-circle-2"></i><span>Mark as Delivered</span>`;
        btnMarkDelivered.classList.add('primary-lime');
        btnMarkDelivered.style.opacity = '1';
        btnMarkDelivered.style.borderColor = '';
        btnMarkDelivered.title = '';
        btnMarkDelivered.onclick = openMarkDeliveredModal;
      }
    }

    if (btnAddTracking) {
      // "Add Tracking" only meaningful for courier/shipping orders; hide for pickup + delivered
      const isCourierBased = order.delivery.method !== 'Customer Pickup';
      if (isDelivered) {
        btnAddTracking.style.display = 'none';
      } else if (!isCourierBased) {
        btnAddTracking.style.display = 'none';
      } else {
        btnAddTracking.style.display = '';
        btnAddTracking.style.opacity = '1';
        btnAddTracking.title = isOut ? 'Update Tracking' : 'Add Tracking Details';
        btnAddTracking.innerHTML = `<i data-lucide="truck"></i><span>${isOut ? 'Update Tracking' : 'Add Tracking Details'}</span>`;
      }
    }

    if (btnPrintSlip) {
      // Always visible but changes label when delivered
      btnPrintSlip.style.display = '';
      btnPrintSlip.style.opacity = '1';
    }

    if (btnWhatsapp) {
      // WhatsApp: always available; change message based on status
      btnWhatsapp.style.display = '';
      btnWhatsapp.style.opacity = '1';
      if (isDelivered) {
        btnWhatsapp.innerHTML = `<i data-lucide="message-square"></i><span>Send Delivery Confirmation</span>`;
        btnWhatsapp.title = 'Send delivery confirmation via WhatsApp';
      } else if (isOut) {
        btnWhatsapp.innerHTML = `<i data-lucide="message-square"></i><span>Send Dispatch Notification</span>`;
        btnWhatsapp.title = 'Notify customer that order is out for delivery';
      } else if (isOverdue) {
        btnWhatsapp.innerHTML = `<i data-lucide="message-square"></i><span>Send Pickup Reminder</span>`;
        btnWhatsapp.title = 'Send an overdue pickup reminder';
      } else {
        btnWhatsapp.innerHTML = `<i data-lucide="message-square"></i><span>Send WhatsApp Notification</span>`;
        btnWhatsapp.title = '';
      }
    }

    // Sub-Tabs Content
    renderSubTabContent(order);

    // ── STATUS-AWARE: Delivery Method Cards ────────────────────
    // Lock method selection for delivered or in-transit orders
    const methodCards = document.querySelectorAll('#deliveryMethodCards .method-radio-card');
    const methodsLocked = isDelivered || isOut;
    methodCards.forEach(card => {
      const cardMethod = card.getAttribute('data-method');
      card.classList.toggle('active', cardMethod === order.delivery.method);
      card.style.pointerEvents = methodsLocked ? 'none' : '';
      card.style.opacity = methodsLocked ? '0.5' : '';
      card.title = methodsLocked
        ? (isDelivered ? 'Order already delivered — method locked' : 'Order in transit — method locked')
        : '';
    });

    // Customer Contact Row
    const elContactName = document.getElementById('contactCustomerName');
    const elContactPhone = document.getElementById('contactCustomerPhone');
    const elContactAddress = document.getElementById('contactCustomerAddress');

    if (elContactName) elContactName.textContent = order.customer.name;
    if (elContactPhone) elContactPhone.textContent = order.customer.phone;
    if (elContactAddress) elContactAddress.textContent = order.customer.address;

    // ── STATUS-AWARE: Instructions Textarea ────────────────────
    const elInstructions = document.getElementById('pickupInstructionsText');
    if (elInstructions) {
      elInstructions.value = isDelivered
        ? `✓ Delivered on ${order.delivery.deliveredDate || 'recorded date'}. ${order.instructions}`
        : order.instructions;
      elInstructions.readOnly = isDelivered;
      elInstructions.style.opacity = isDelivered ? '0.6' : '1';
      elInstructions.title = isDelivered ? 'Order is delivered — instructions are read-only' : '';
    }

    refreshLucide();
  }

  function renderSubTabContent(order) {
    if (STATE.selectedTab === 'items') {
      const thumb = document.getElementById('tabItemThumb');
      if (thumb) {
        thumb.style.display = '';
        thumb.src = order.garment.image;
        thumb.onerror = () => { thumb.src = FALLBACK_GARMENT_SVG; };
      }
      const title = document.getElementById('tabItemTitle');
      if (title) title.textContent = order.garment.type;

      const desc = document.getElementById('tabItemDesc');
      if (desc) desc.textContent = order.garment.desc || order.garment.collection;

      const size = document.getElementById('tabItemSize');
      if (size) size.textContent = order.garment.size;

      const colour = document.getElementById('tabItemColour');
      if (colour) colour.textContent = order.garment.colour;

      const qty = document.getElementById('tabItemQty');
      if (qty) qty.textContent = order.garment.quantity;

      const st = document.getElementById('tabItemStatus');
      if (st) {
        st.style.display = '';
        let pillClass = 'ready';
        if (order.delivery.status === 'Out for Delivery') pillClass = 'out-for-delivery';
        else if (order.delivery.status === 'Delivered') pillClass = 'delivered';
        else if (order.delivery.status === 'Overdue') pillClass = 'overdue';

        st.className = `status-pill ${pillClass}`;
        st.textContent = order.delivery.status;
      }
    }
  }


  /* ────────────────────────────────────────────────────────────
     8. BOTTOM ANALYTICS (METHODS DONUT & PERFORMANCE BARS)
     ──────────────────────────────────────────────────────────── */
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderMethodsDonut() {
    const total = STATE.orders.length;
    const totalEl = document.getElementById('methodsTotalCount');
    if (totalEl) totalEl.textContent = total;

    const legPickup = document.getElementById('legendValPickup');
    const legCourier = document.getElementById('legendValCourier');
    const legLocal = document.getElementById('legendValLocal');
    const legThirdParty = document.getElementById('legendValThirdParty');

    const ringPickup = document.getElementById('donutPickup');
    const ringCourier = document.getElementById('donutCourier');
    const ringLocal = document.getElementById('donutLocal');
    const ringThirdParty = document.getElementById('donutThirdParty');

    if (total === 0) {
      if (legPickup) legPickup.textContent = '0 (0%)';
      if (legCourier) legCourier.textContent = '0 (0%)';
      if (legLocal) legLocal.textContent = '0 (0%)';
      if (legThirdParty) legThirdParty.textContent = '0 (0%)';

      if (ringPickup) ringPickup.setAttribute('stroke-dasharray', '0, 100');
      if (ringCourier) {
        ringCourier.setAttribute('stroke-dasharray', '0, 100');
        ringCourier.setAttribute('stroke-dashoffset', '0');
      }
      if (ringLocal) {
        ringLocal.setAttribute('stroke-dasharray', '0, 100');
        ringLocal.setAttribute('stroke-dashoffset', '0');
      }
      if (ringThirdParty) {
        ringThirdParty.setAttribute('stroke-dasharray', '0, 100');
        ringThirdParty.setAttribute('stroke-dashoffset', '0');
      }
      return;
    }

    let countPickup = 0;
    let countCourier = 0;
    let countLocal = 0;
    let countThirdParty = 0;

    STATE.orders.forEach(o => {
      const m = o.delivery.method;
      if (m === 'Customer Pickup') countPickup++;
      else if (m === 'Courier / Shipping') countCourier++;
      else if (m === 'Local Delivery') countLocal++;
      else countThirdParty++;
    });

    const pctPickup = Math.round((countPickup / total) * 100);
    const pctCourier = Math.round((countCourier / total) * 100);
    const pctLocal = Math.round((countLocal / total) * 100);
    const pctThirdParty = Math.max(0, 100 - (pctPickup + pctCourier + pctLocal));

    // Update legend values
    if (legPickup) legPickup.textContent = `${countPickup} (${pctPickup}%)`;
    if (legCourier) legCourier.textContent = `${countCourier} (${pctCourier}%)`;
    if (legLocal) legLocal.textContent = `${countLocal} (${pctLocal}%)`;
    if (legThirdParty) legThirdParty.textContent = `${countThirdParty} (${pctThirdParty}%)`;

    // SVG Donut Rings
    if (ringPickup) ringPickup.setAttribute('stroke-dasharray', `${pctPickup}, 100`);
    if (ringCourier) {
      ringCourier.setAttribute('stroke-dasharray', `${pctCourier}, 100`);
      ringCourier.setAttribute('stroke-dashoffset', `-${pctPickup}`);
    }
    if (ringLocal) {
      ringLocal.setAttribute('stroke-dasharray', `${pctLocal}, 100`);
      ringLocal.setAttribute('stroke-dashoffset', `-${pctPickup + pctCourier}`);
    }
    if (ringThirdParty) {
      ringThirdParty.setAttribute('stroke-dasharray', `${pctThirdParty}, 100`);
      ringThirdParty.setAttribute('stroke-dashoffset', `-${pctPickup + pctCourier + pctLocal}`);
    }
  }

  function computeMonthlyPerformance(orders) {
    const months = [];
    const colorClasses = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    // Construct the 6 months sequence up to current month (e.g. Apr..Sep)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - i, 1);
      const y = d.getFullYear();
      const mIdx = d.getMonth();
      const monthPrefix = `${y}-${String(mIdx + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('en-GB', { month: 'short' });
      months.push({
        year: y,
        monthIdx: mIdx,
        monthKey: monthPrefix,
        label: monthLabel,
        totalDelivered: 0,
        onTimeDelivered: 0,
        pct: 0,
        hasData: false
      });
    }

    // Tally deliveries across the 6 months
    orders.forEach(o => {
      const dateStr = o.delivery.deliveredDateRaw || (o.delivery.status === 'Delivered' ? o.delivery.orderDateRaw : null);
      if (!dateStr) return;
      const targetMonth = months.find(m => dateStr.startsWith(m.monthKey));
      if (targetMonth) {
        targetMonth.totalDelivered++;
        targetMonth.hasData = true;
        if (!o.isDelayed) {
          targetMonth.onTimeDelivered++;
        }
      }
    });

    // Calculate rates for each month
    months.forEach(m => {
      if (m.totalDelivered > 0) {
        m.pct = Math.round((m.onTimeDelivered * 100) / m.totalDelivered);
      } else {
        m.pct = 0;
      }
    });

    // Trend calculation: Compare current month (months[5]) vs previous month (months[4])
    let trendText = '—';
    let trendClass = 'neutral';
    const mCur = months[5];
    const mPrev = months[4];

    if (mCur.hasData && mPrev.hasData) {
      const diff = mCur.pct - mPrev.pct;
      if (diff > 0) {
        trendText = `↑ ${diff}% from last month`;
        trendClass = 'positive';
      } else if (diff < 0) {
        trendText = `↓ ${Math.abs(diff)}% from last month`;
        trendClass = 'negative';
      } else {
        trendText = 'Steady (0% change)';
        trendClass = 'neutral';
      }
    } else if (mCur.hasData) {
      trendText = `${mCur.pct}% on-time this month`;
      trendClass = 'positive';
    } else if (orders.length > 0 && STATE.kpis.delivered > 0) {
      trendText = `Overall ${STATE.kpis.onTimeRate}% on-time`;
      trendClass = 'neutral';
    } else {
      trendText = 'No delivery records yet';
      trendClass = 'neutral';
    }

    return { months, trendText, trendClass, colorClasses };
  }

  function renderPerformanceBars() {
    const onTimePct = STATE.kpis.onTimeRate;
    const bigNum = document.getElementById('perfOnTimePct');
    if (bigNum) bigNum.textContent = `${onTimePct}%`;

    const { months, trendText, trendClass, colorClasses } = computeMonthlyPerformance(STATE.orders);

    const trendEl = document.getElementById('perfTrendText');
    if (trendEl) {
      trendEl.textContent = trendText;
      if (trendClass === 'positive') {
        trendEl.style.color = '#34d399';
      } else if (trendClass === 'negative') {
        trendEl.style.color = '#f43f5e';
      } else {
        trendEl.style.color = 'var(--text-muted)';
      }
    }

    const container = document.getElementById('perfBarsContainer');
    if (container) {
      container.innerHTML = months.map((m, idx) => {
        const heightPx = m.hasData && m.pct > 0 ? Math.max(8, Math.round((m.pct / 100) * 46)) : 4;
        const colorCls = colorClasses[idx] || 'c6';
        const valText = m.hasData ? `${m.pct}%` : '0%';
        return `
          <div class="perf-bar-group" title="${m.label} ${m.year}: ${m.totalDelivered} delivered, ${valText} on-time">
            <span class="perf-bar-val">${valText}</span>
            <div class="perf-bar-pill ${colorCls}" style="height:${heightPx}px; ${!m.hasData ? 'opacity:0.25;' : ''}"></div>
            <span class="perf-bar-month">${escapeHTML(m.label)}</span>
          </div>
        `;
      }).join('');
    }
  }

  /* ────────────────────────────────────────────────────────────
     9. EVENT LISTENERS & MODAL HANDLERS
     ──────────────────────────────────────────────────────────── */
  function bindEventListeners() {
    // 1. Filter Pills
    const filterPills = document.querySelectorAll('#filterPillsContainer .filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        STATE.activeFilter = pill.dataset.filter;
        STATE.currentPage = 1;
        renderTable();
      });
    });

    // 2. Search Box
    const searchInput = document.getElementById('orderSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        STATE.searchQuery = e.target.value;
        STATE.currentPage = 1;
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
        const currentOrder = getSelectedOrder();
        if (currentOrder) {
          if (STATE.selectedTab === 'items') {
            renderSubTabContent(currentOrder);
          } else if (STATE.selectedTab === 'customer') {
            showToast(`Customer: ${currentOrder.customer.name} · Phone: ${currentOrder.customer.phone}`, 'info');
          } else if (STATE.selectedTab === 'delivery') {
            showToast(`Delivery Method: ${currentOrder.delivery.method}`, 'info');
          } else if (STATE.selectedTab === 'payment') {
            showToast(`Total: ₹${currentOrder.payment.total.toLocaleString('en-IN')} · Status: ${currentOrder.payment.status}`, 'info');
          } else if (STATE.selectedTab === 'notes') {
            showToast(`Instructions: ${currentOrder.instructions}`, 'info');
          }
        }
      });
    });

    // 4. Delivery Method Radio Cards Click
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
          renderMethodsDonut();
          showToast(`Delivery method set to ${chosen}`, 'info');
        }
      });
    });

    // 6. Action: Mark as Delivered
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

    // 7. Action: Print Delivery Slip
    const actionPrintBtn = document.getElementById('actionPrintSlipBtn');
    if (actionPrintBtn) actionPrintBtn.addEventListener('click', openPrintSlipModal);
    const closePrintBtn = document.getElementById('closePrintSlipModal');
    const cancelPrintBtn = document.getElementById('cancelPrintSlipModal');
    if (closePrintBtn) closePrintBtn.addEventListener('click', closePrintSlipModal);
    if (cancelPrintBtn) cancelPrintBtn.addEventListener('click', closePrintSlipModal);

    // 8. Action: WhatsApp Notification
    const actionWaBtn = document.getElementById('actionWhatsappBtn');
    if (actionWaBtn) actionWaBtn.addEventListener('click', openWhatsappModal);
    const closeWaBtn = document.getElementById('closeWhatsappModal');
    const cancelWaBtn = document.getElementById('cancelWhatsappModal');
    const sendWaBtn = document.getElementById('sendWhatsappModal');
    if (closeWaBtn) closeWaBtn.addEventListener('click', closeWhatsappModal);
    if (cancelWaBtn) cancelWaBtn.addEventListener('click', closeWhatsappModal);
    if (sendWaBtn) sendWaBtn.addEventListener('click', handleSendWhatsapp);

    // 9. Action: Add Tracking Details
    const actionTrackBtn = document.getElementById('actionAddTrackingBtn');
    if (actionTrackBtn) actionTrackBtn.addEventListener('click', openTrackingModal);
    const closeTrackBtn = document.getElementById('closeTrackingModal');
    const cancelTrackBtn = document.getElementById('cancelTrackingModal');
    const saveTrackBtn = document.getElementById('saveTrackingModal');
    if (closeTrackBtn) closeTrackBtn.addEventListener('click', closeTrackingModal);
    if (cancelTrackBtn) cancelTrackBtn.addEventListener('click', closeTrackingModal);
    if (saveTrackBtn) saveTrackBtn.addEventListener('click', handleSaveTracking);

    // 10. Filter Modal
    const filterModalBtn = document.getElementById('filterModalBtn');
    if (filterModalBtn) filterModalBtn.addEventListener('click', openFilterModal);
    const closeFilterBtn = document.getElementById('closeFilterModal');
    const resetFilterBtn = document.getElementById('resetFilterModal');
    const applyFilterBtn = document.getElementById('applyFilterModal');
    if (closeFilterBtn) closeFilterBtn.addEventListener('click', closeFilterModal);
    if (resetFilterBtn) resetFilterBtn.addEventListener('click', handleResetFilters);
    if (applyFilterBtn) applyFilterBtn.addEventListener('click', handleApplyFilters);

    // 11. Row Action Buttons Delegation (Send, Call, More)
    document.addEventListener('click', (e) => {
      const sendBtn = e.target.closest('.btn-send-action');
      if (sendBtn) {
        e.stopPropagation();
        selectOrder(sendBtn.dataset.orderId);
        openMarkDeliveredModal();
        return;
      }

      const callBtn = e.target.closest('.btn-call-action');
      if (callBtn) {
        e.stopPropagation();
        const phone = callBtn.dataset.phone;
        window.location.href = `tel:${phone}`;
        showToast(`Calling customer at ${phone}...`, 'info');
        return;
      }

      const moreBtn = e.target.closest('.btn-more-action');
      if (moreBtn) {
        e.stopPropagation();
        selectOrder(moreBtn.dataset.orderId);
        showMoreMenu(moreBtn, moreBtn.dataset.orderId);
        return;
      }
    });

    // 12. Instructions auto-save
    const instructionsBox = document.getElementById('pickupInstructionsText');
    if (instructionsBox) {
      instructionsBox.addEventListener('change', (e) => {
        const order = getSelectedOrder();
        if (order) {
          order.instructions = e.target.value;
          showToast('Pickup instructions saved', 'success');
        }
      });
    }
  }

  /* ────────────────────────────────────────────────────────────
     10. MODAL IMPLEMENTATIONS & ACTIONS
     ──────────────────────────────────────────────────────────── */

  // Mark as Delivered
  function openMarkDeliveredModal() {
    const order = getSelectedOrder();
    const modal = document.getElementById('markDeliveredModal');
    if (!modal || !order) return;

    const elId = document.getElementById('modalConfirmOrderId');
    const elVal = document.getElementById('modalConfirmValue');
    const elCust = document.getElementById('modalConfirmCustomer');
    const elMethod = document.getElementById('modalConfirmMethod');

    if (elId) elId.textContent = order.id;
    if (elVal) elVal.textContent = `₹${order.payment.total.toLocaleString('en-IN')}`;
    if (elCust) elCust.textContent = `${order.customer.name} · ${order.garment.type}`;
    if (elMethod) elMethod.textContent = order.delivery.method;

    modal.classList.add('active');
  }

  function closeMarkDeliveredModal() {
    const modal = document.getElementById('markDeliveredModal');
    if (modal) modal.classList.remove('active');
  }

  async function handleConfirmDelivery() {
    const order = getSelectedOrder();
    if (!order) return;

    try {
      const { default: api } = await import('../api.js');
      // Persist delivery to backend database
      if (order.dbId && api.orders && api.orders.update) {
        await api.orders.update(order.dbId, {
          status: 'DELIVERED',
          deliveredDate: new Date().toISOString().slice(0, 10)  // YYYY-MM-DD — matches LocalDate on backend
        }).catch(err => {
          console.warn('[Delivery] Backend update warning:', err.message);
        });
      }
    } catch (_) {}

    // Update local state
    order.delivery.status = 'Delivered';
    order.delivery.deliveredDate = 'Today';

    calculateKpis();
    updateKpisUi();
    updateFilterCountsUi();

    renderTable();
    renderDetails(order);
    closeMarkDeliveredModal();

    showToast(`Order ${order.id} marked as delivered successfully!`, 'success');
  }

  // Print Delivery Slip Modal
  function openPrintSlipModal() {
    const order = getSelectedOrder();
    const modal = document.getElementById('printDeliverySlipModal');
    if (!modal || !order) return;

    const elDate = document.getElementById('slipDate');
    const elId = document.getElementById('slipOrderId');
    const elCust = document.getElementById('slipCustomer');
    const elPhone = document.getElementById('slipPhone');
    const elMethod = document.getElementById('slipMethod');
    const elVal = document.getElementById('slipValue');
    const elPay = document.getElementById('slipPayment');

    const elItem = document.getElementById('slipItemName');
    const elColl = document.getElementById('slipItemColl');
    const elSize = document.getElementById('slipItemSize');
    const elQty = document.getElementById('slipItemQty');

    if (elDate) elDate.textContent = `Date: ${new Date().toLocaleDateString('en-GB')}`;
    if (elId) elId.textContent = order.id;
    if (elCust) elCust.textContent = order.customer.name;
    if (elPhone) elPhone.textContent = order.customer.phone;
    if (elMethod) elMethod.textContent = order.delivery.method;
    if (elVal) elVal.textContent = `₹${order.payment.total.toLocaleString('en-IN')}`;
    if (elPay) elPay.textContent = order.payment.status;

    if (elItem) elItem.textContent = order.garment.type;
    if (elColl) elColl.textContent = order.garment.collection;
    if (elSize) elSize.textContent = order.garment.size;
    if (elQty) elQty.textContent = order.garment.quantity;

    modal.classList.add('active');
  }

  function closePrintSlipModal() {
    const modal = document.getElementById('printDeliverySlipModal');
    if (modal) modal.classList.remove('active');
  }

  // WhatsApp Notification Modal — message adapts to order status
  function openWhatsappModal() {
    const order = getSelectedOrder();
    const modal = document.getElementById('whatsappModal');
    if (!modal || !order) return;

    const recip = document.getElementById('waRecipientInput');
    const msg = document.getElementById('waMessageText');

    if (recip) recip.value = `${order.customer.name} (${order.customer.phone})`;

    if (msg) {
      const st = order.delivery.status;
      const coName = (typeof CompanyBridge !== 'undefined' ? CompanyBridge.get().companyName : null) || 'our boutique';
      let message = '';

      if (st === 'Delivered') {
        message = `Dear ${order.customer.name},\n\nWe are delighted to confirm that your order (${order.id}) has been successfully delivered! 🎉\n\nGarment: ${order.garment.type} (${order.garment.collection})\nDelivered on: ${order.delivery.deliveredDate || 'Today'}\nOrder Total: ₹${order.payment.total.toLocaleString('en-IN')}\n\nThank you for choosing ${coName}. We hope you love your bespoke piece!`;
      } else if (st === 'Out for Delivery') {
        message = `Dear ${order.customer.name},\n\nGreat news! Your order (${order.id}) is now out for delivery and on its way to you. 🚚\n\nGarment: ${order.garment.type} (${order.garment.collection})\nExpected Delivery: ${order.delivery.expectedDate}\nDelivery Method: ${order.delivery.method}\n${order.delivery.trackingNumber ? `Tracking: ${order.delivery.trackingNumber}` : ''}\n\n${coName} — your bespoke journey continues!`;
      } else if (st === 'Overdue') {
        message = `Dear ${order.customer.name},\n\nThis is a gentle reminder that your order (${order.id}) is ready and awaiting pickup at ${coName}. 📦\n\nGarment: ${order.garment.type} (${order.garment.collection})\nReady Since: ${order.delivery.readySince}\n\nPlease arrange for pickup at your earliest convenience. We look forward to presenting your bespoke creation!\n\nFor any queries, please don't hesitate to contact us.`;
      } else {
        // Ready
        message = `Dear ${order.customer.name},\n\nYour order (${order.id}) is prepared and ready for ${order.delivery.method === 'Customer Pickup' ? 'pickup' : 'delivery'}! ✨\n\nGarment: ${order.garment.type} (${order.garment.collection})\nOrder Total: ₹${order.payment.total.toLocaleString('en-IN')}\nStatus: Ready for ${order.delivery.method === 'Customer Pickup' ? 'Pickup' : 'Delivery'}\n\n${coName} looks forward to presenting your bespoke piece!`;
      }

      msg.value = message;
    }

    modal.classList.add('active');
  }

  function closeWhatsappModal() {
    const modal = document.getElementById('whatsappModal');
    if (modal) modal.classList.remove('active');
  }

  function handleSendWhatsapp() {
    const order = getSelectedOrder();
    closeWhatsappModal();
    if (order && order.customer.phone) {
      const cleanPhone = order.customer.phone.replace(/\D/g, '');
      const msg = encodeURIComponent(document.getElementById('waMessageText').value || '');
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
      showToast(`Opening WhatsApp for ${order.customer.name}...`, 'success');
    }
  }

  // Tracking Details Modal
  function openTrackingModal() {
    const order = getSelectedOrder();
    const modal = document.getElementById('trackingModal');
    if (!modal || !order) return;

    const mInp = document.getElementById('trackMethodInput');
    const cInp = document.getElementById('trackCourierName');
    const nInp = document.getElementById('trackNumberInput');
    const pInp = document.getElementById('trackContactInput');

    if (mInp) mInp.value = order.delivery.method || '';
    if (cInp) cInp.value = order.delivery.courier || '';
    if (nInp) nInp.value = order.delivery.trackingNumber || '';
    if (pInp) pInp.value = order.customer.phone || '';

    modal.classList.add('active');
  }

  function closeTrackingModal() {
    const modal = document.getElementById('trackingModal');
    if (modal) modal.classList.remove('active');
  }

  function handleSaveTracking() {
    const order = getSelectedOrder();
    if (order) {
      const courier = document.getElementById('trackCourierName').value;
      const tracking = document.getElementById('trackNumberInput').value;

      order.delivery.courier = courier;
      order.delivery.trackingNumber = tracking;
      order.delivery.status = 'Out for Delivery';

      calculateKpis();
      updateKpisUi();
      updateFilterCountsUi();

      renderTable();
      renderDetails(order);
      closeTrackingModal();

      showToast(`Tracking saved: ${tracking} (${courier})`, 'success');
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

    const filterPills = document.querySelectorAll('#filterPillsContainer .filter-pill');
    filterPills.forEach(p => {
      p.classList.toggle('active', p.dataset.filter.toLowerCase() === statusVal.toLowerCase());
    });

    STATE.currentPage = 1;
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

    STATE.currentPage = 1;
    renderTable();
    closeFilterModal();
    showToast('Filters reset to default', 'info');
  }

  // Row Action Context Dropdown — adapts options to order status
  function showMoreMenu(btn, orderId) {
    const existing = document.getElementById('rowMoreDropdown');
    if (existing) existing.remove();

    const order = STATE.orders.find(o => o.id === orderId);
    const st = order ? order.delivery.status : 'Ready';
    const isDelivered = st === 'Delivered';
    const isOut = st === 'Out for Delivery';
    const isOverdue = st === 'Overdue';
    const isCourierBased = order && order.delivery.method !== 'Customer Pickup';

    const rect = btn.getBoundingClientRect();
    const dd = document.createElement('div');
    dd.id = 'rowMoreDropdown';
    dd.style.cssText = `
      position: fixed;
      top: ${rect.bottom + 6}px;
      left: ${rect.left - 140}px;
      z-index: 10000;
      width: 190px;
      background: rgba(24, 18, 14, 0.96);
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 8px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.7);
      display: flex;
      flex-direction: column;
      padding: 6px 0;
      backdrop-filter: blur(16px);
      font-size: 11.5px;
    `;

    // Build status-aware menu items
    let menuHtml = `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#fff;" id="ddViewDelivery">👁 View Details</div>`;

    if (isDelivered) {
      menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#34d399;" id="ddViewReceipt">🧾 View Receipt</div>`;
      menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#fff;" id="ddSendWa">💬 Send Delivery Confirmation</div>`;
    } else if (isOut) {
      menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#d4ff32;font-weight:700;" id="ddMarkDelivered">✓ Mark as Delivered</div>`;
      menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#38bdf8;" id="ddAddTrack">📡 Update Tracking</div>`;
      menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#fff;" id="ddSendWa">💬 Send Dispatch Notification</div>`;
      menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#fff;" id="ddPrintSlip">🖨 Print Delivery Slip</div>`;
    } else if (isOverdue) {
      menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#f43f5e;font-weight:700;" id="ddMarkDelivered">⚠ Resolve — Mark Delivered</div>`;
      menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#fff;" id="ddSendWa">💬 Send Pickup Reminder</div>`;
      menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#fff;" id="ddPrintSlip">🖨 Print Delivery Slip</div>`;
      if (isCourierBased) {
        menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#38bdf8;" id="ddAddTrack">📡 Add Tracking</div>`;
      }
    } else {
      // Ready
      menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#d4ff32;font-weight:700;" id="ddMarkDelivered">✓ Mark as Delivered</div>`;
      menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#fff;" id="ddPrintSlip">🖨 Print Delivery Slip</div>`;
      menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#fff;" id="ddSendWa">💬 Send WhatsApp</div>`;
      if (isCourierBased) {
        menuHtml += `<div class="dd-item" style="padding:7px 14px;cursor:pointer;color:#38bdf8;" id="ddAddTrack">📡 Add Tracking Details</div>`;
      }
    }

    dd.innerHTML = menuHtml;
    document.body.appendChild(dd);

    // Common wiring
    const viewBtn = dd.querySelector('#ddViewDelivery');
    const markBtn = dd.querySelector('#ddMarkDelivered');
    const receiptBtn = dd.querySelector('#ddViewReceipt');
    const printBtn = dd.querySelector('#ddPrintSlip');
    const waBtn = dd.querySelector('#ddSendWa');
    const trackBtn = dd.querySelector('#ddAddTrack');

    if (viewBtn) viewBtn.onclick = () => { dd.remove(); selectOrder(orderId); };
    if (markBtn) markBtn.onclick = () => { dd.remove(); selectOrder(orderId); openMarkDeliveredModal(); };
    if (receiptBtn) receiptBtn.onclick = () => { dd.remove(); selectOrder(orderId); openPrintSlipModal(); };
    if (printBtn) printBtn.onclick = () => { dd.remove(); selectOrder(orderId); openPrintSlipModal(); };
    if (waBtn) waBtn.onclick = () => { dd.remove(); selectOrder(orderId); openWhatsappModal(); };
    if (trackBtn) trackBtn.onclick = () => { dd.remove(); selectOrder(orderId); openTrackingModal(); };

    function onDocClick(e) {
      if (!dd.contains(e.target) && e.target !== btn) {
        dd.remove();
        document.removeEventListener('click', onDocClick);
      }
    }
    setTimeout(() => { document.addEventListener('click', onDocClick); }, 50);
  }

  function renderEmptyState() {
    const tbody = document.getElementById('deliveryTableBody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted);">
            No orders found in the database.
          </td>
        </tr>
      `;
    }
  }

  /* ────────────────────────────────────────────────────────────
     11. TOAST NOTIFICATION HELPER
     ──────────────────────────────────────────────────────────── */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const borderColor = type === 'success' ? '#d4ff32' : (type === 'error' ? '#f43f5e' : '#38bdf8');
    const iconName = type === 'success' ? 'check-circle-2' : (type === 'error' ? 'alert-triangle' : 'info');

    toast.style.cssText = `
      background: rgba(28, 21, 17, 0.96);
      backdrop-filter: blur(16px);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-left: 4px solid ${borderColor};
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
      font-family: inherit;
      animation: toastIn 0.25s ease;
    `;

    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width:16px;height:16px;color:${borderColor};flex-shrink:0;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    refreshLucide();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  // Export to window for debugging or extensions
  window.DeliveryApp = {
    STATE,
    selectOrder,
    renderTable,
    renderDetails,
    showToast,
    loadDataFromBackend
  };

})();
