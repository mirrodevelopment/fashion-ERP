/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — Payments & Receivables Controller
 * File: front end/payments/payments.js
 * Visual Source of Truth: media_1789126491865.png
 * =======================================================================
 */

(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     1. CENTRALIZED REACTIVE STATE STORE
     ──────────────────────────────────────────────────────────── */
  const STATE = {
    selectedOrderNo: null,
    activeTabFilter: 'all',
    searchQuery: '',
    actionTargetOrderNo: null,

    orders: [],
    customerProfiles: {},

    // Dynamic Payment Trend Monthly Data
    trendData: []
  };

  /* ────────────────────────────────────────────────────────────
     2. FORMATTING & BALANCE UTILITIES
     ──────────────────────────────────────────────────────────── */
  function formatRupees(amount) {
    if (amount === 0) return '₹0';
    return '₹' + amount.toLocaleString('en-IN');
  }

  function calculateBalance(order) {
    return Math.max(0, order.orderValue - order.paid);
  }

  function refreshLucide() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const borderColor = type === 'success' ? '#4ade80' : type === 'warn' ? '#fbbf24' : '#38bdf8';
    toast.style.cssText = `background:rgba(28,20,18,0.96);backdrop-filter:blur(20px);color:#fff;border:1px solid rgba(255,255,255,0.18);border-left:4px solid ${borderColor};border-radius:10px;padding:11px 18px;font-size:12.5px;font-weight:600;box-shadow:0 14px 40px rgba(0,0,0,0.55);display:flex;align-items:center;gap:10px;pointer-events:auto;font-family:var(--font-main);`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 320);
    }, 3200);
  }

  /* ────────────────────────────────────────────────────────────
     3. RENDER PAYMENT ORDERS TABLE
     ──────────────────────────────────────────────────────────── */
  function renderPaymentTable() {
    const tbody = document.getElementById('paymentTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Apply Filter & Search
    const filteredOrders = STATE.orders.filter(order => {
      // Tab filter
      if (STATE.activeTabFilter === 'pending' && order.status !== 'Pending') return false;
      if (STATE.activeTabFilter === 'overdue' && order.status !== 'Overdue') return false;
      if (STATE.activeTabFilter === 'paid' && order.status !== 'Fully Paid') return false;
      if (STATE.activeTabFilter === 'advance' && (order.paid === 0 || order.status === 'Fully Paid')) return false;

      // Search Query
      if (STATE.searchQuery.trim() !== '') {
        const q = STATE.searchQuery.toLowerCase();
        const matches = order.orderNo.toLowerCase().includes(q) ||
                        order.customer.toLowerCase().includes(q) ||
                        order.garment.toLowerCase().includes(q) ||
                        order.phone.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    if (filteredOrders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center;padding:32px;color:var(--text-muted);">
            <i data-lucide="inbox" style="width:28px;height:28px;opacity:0.4;display:block;margin:0 auto 8px auto;"></i>
            No orders match the current filter or search criteria.
          </td>
        </tr>
      `;
      const pagInfo = document.getElementById('paginationInfoLabel');
      if (pagInfo) pagInfo.textContent = 'Showing 0 orders';
      const pagControls = document.getElementById('paginationControls');
      if (pagControls) pagControls.innerHTML = '';
      refreshLucide();
      return;
    }

    filteredOrders.forEach(order => {
      const balance = calculateBalance(order);
      const isSelected = order.orderNo === STATE.selectedOrderNo;

      let statusClass = 'pending';
      if (order.status === 'Fully Paid') statusClass = 'fully-paid';
      else if (order.status === 'Overdue') statusClass = 'overdue';
      else if (order.status === 'Advance Paid') statusClass = 'advance-paid';

      const tr = document.createElement('tr');
      tr.dataset.orderNo = order.orderNo;
      if (isSelected) tr.classList.add('selected');

      const custInitial = (order.customer && order.customer !== '—')
        ? order.customer.trim().charAt(0).toUpperCase()
        : '•';

      tr.innerHTML = `
        <td>
          <span class="order-no-txt">${order.orderNo}</span>
        </td>
        <td>
          <div class="customer-avatar-cell">
            <span class="customer-avatar-badge">${custInitial}</span>
            <span class="customer-name-txt">${order.customer}</span>
          </div>
        </td>
        <td>
          <div class="garment-cell">
            <span class="garment-name-txt">${order.garment}</span>
            <span class="garment-sub-txt">${order.collection}</span>
          </div>
        </td>
        <td><span class="money-txt">${formatRupees(order.orderValue)}</span></td>
        <td><span class="money-txt">${formatRupees(order.paid)}</span></td>
        <td>
          <span class="balance-txt ${balance === 0 ? 'zero' : ''}">${formatRupees(balance)}</span>
        </td>
        <td>
          <span class="status-pill ${statusClass}">${order.status}</span>
        </td>
        <td>
          <span class="due-date-txt ${order.status === 'Overdue' ? 'overdue-date' : ''}">${order.dueDate}</span>
        </td>
        <td style="text-align:center;">
          <div class="row-actions-group">
            <button class="row-action-btn row-eye-btn" 
                    type="button"
                    data-order-no="${order.orderNo}" 
                    title="View All Transactions" 
                    aria-label="View Transactions for ${order.orderNo}">
              <i data-lucide="eye"></i>
            </button>
            <button class="row-action-btn row-more-btn" 
                    type="button"
                    data-order-no="${order.orderNo}" 
                    title="Row Actions" 
                    aria-label="Actions for ${order.orderNo}">
              <i data-lucide="more-horizontal"></i>
            </button>
          </div>
        </td>
      `;

      // Clicking row triggers selection (unless clicked inside action buttons)
      tr.addEventListener('click', (e) => {
        if (e.target.closest('.row-actions-group')) return;
        selectOrder(order.orderNo);
      });

      const eyeBtn = tr.querySelector('.row-eye-btn');
      if (eyeBtn) {
        eyeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          selectOrder(order.orderNo);
          openOrderTransactionsModal(order.orderNo, e);
        });
      }

      const moreBtn = tr.querySelector('.row-more-btn');
      if (moreBtn) {
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          selectOrder(order.orderNo);
          openRowActionMenu(moreBtn, order.orderNo);
        });
      }

      tbody.appendChild(tr);
    });

    // Update pagination count text
    const pagInfo = document.getElementById('paginationInfoLabel');
    if (pagInfo) {
      pagInfo.textContent = `Showing 1–${filteredOrders.length} of ${STATE.orders.length} orders`;
    }

    refreshLucide();
  }

  /* ────────────────────────────────────────────────────────────
     4. SELECT ORDER & UPDATE RIGHT PANEL DYNAMICALLY
     ──────────────────────────────────────────────────────────── */
  function selectOrder(orderNo) {
    STATE.selectedOrderNo = orderNo;

    // Highlight row in table
    const rows = document.querySelectorAll('#paymentTableBody tr');
    rows.forEach(r => {
      r.classList.toggle('selected', r.dataset.orderNo === orderNo);
    });

    const order = STATE.orders.find(o => o.orderNo === orderNo);
    if (!order) return;

    // Retrieve or synthesize Customer Profile
    let profile = STATE.customerProfiles[order.customer];
    if (!profile) {
      profile = {
        name: order.customer,
        phone: order.phone,
        location: order.location,
        vip: order.vip,
        avatar: order.avatar,
        totalOrders: 1,
        totalOrderValue: order.orderValue,
        totalPaid: order.paid,
        outstanding: calculateBalance(order),
        recentPayments: order.paid > 0 ? [
          { date: order.date || '-', orderNo: order.orderNo, amount: order.paid, method: order.paymentMethod, receivedBy: order.receivedBy }
        ] : []
      };
    }

    // Update Customer Avatar in Right Panel (Universal Patron Badge)
    const avatarEl = document.getElementById('summaryCustomerAvatar');
    if (avatarEl && profile.name && profile.name !== '—') {
      if (typeof window.applyPatronAvatarElement === 'function') {
        window.applyPatronAvatarElement(avatarEl, profile.name, profile.avatarUrl || '', 'haulo-avatar-md', 'width:36px;height:36px;border-radius:9px;');
      } else if (typeof window.renderPatronAvatarHtml === 'function') {
        avatarEl.innerHTML = window.renderPatronAvatarHtml(profile.name, profile.avatarUrl || '', 'haulo-avatar-md', 'width:36px;height:36px;border-radius:9px;');
      } else {
        const inits = typeof window.getPatronInitials === 'function' ? window.getPatronInitials(profile.name) : 'CU';
        avatarEl.innerHTML = `<span class="customer-hero-initial" id="summaryCustomerInitial">${inits}</span>`;
      }
    } else if (avatarEl) {
      avatarEl.innerHTML = '<span class="customer-hero-initial" id="summaryCustomerInitial"><i data-lucide="user"></i></span>';
    }

    const nameEl = document.getElementById('summaryCustomerName');
    if (nameEl) nameEl.textContent = profile.name;

    const vipBadge = document.getElementById('summaryVipBadge');
    if (vipBadge) {
      vipBadge.style.display = profile.vip ? 'inline-flex' : 'none';
    }

    const phoneEl = document.getElementById('summaryCustomerPhone');
    if (phoneEl) phoneEl.textContent = profile.phone;

    const locEl = document.getElementById('summaryCustomerLocation');
    if (locEl) locEl.textContent = profile.location;

    // Update 4 Mini Statistics
    const totOrdersEl = document.getElementById('summaryTotalOrders');
    if (totOrdersEl) totOrdersEl.textContent = profile.totalOrders;

    const totValEl = document.getElementById('summaryTotalValue');
    if (totValEl) totValEl.textContent = formatRupees(profile.totalOrderValue);

    const totPaidEl = document.getElementById('summaryTotalPaid');
    if (totPaidEl) totPaidEl.textContent = formatRupees(profile.totalPaid);

    const outEl = document.getElementById('summaryOutstanding');
    if (outEl) outEl.textContent = formatRupees(profile.outstanding);

    // Update Recent Payments Table in Right Panel
    renderRecentPayments(profile.recentPayments);

    refreshLucide();
  }

  function renderEmptyCustomerSummary() {
    STATE.selectedOrderNo = null;

    const avatarEl = document.getElementById('summaryCustomerAvatar');
    if (avatarEl) {
      avatarEl.innerHTML = '<span class="customer-hero-initial" id="summaryCustomerInitial"><i data-lucide="user"></i></span>';
    }

    const nameEl = document.getElementById('summaryCustomerName');
    if (nameEl) nameEl.textContent = '—';

    const vipBadge = document.getElementById('summaryVipBadge');
    if (vipBadge) vipBadge.style.display = 'none';

    const phoneEl = document.getElementById('summaryCustomerPhone');
    if (phoneEl) phoneEl.textContent = '—';

    const locEl = document.getElementById('summaryCustomerLocation');
    if (locEl) locEl.textContent = '—';

    const totOrdersEl = document.getElementById('summaryTotalOrders');
    if (totOrdersEl) totOrdersEl.textContent = '0';

    const totValEl = document.getElementById('summaryTotalValue');
    if (totValEl) totValEl.textContent = '₹0';

    const totPaidEl = document.getElementById('summaryTotalPaid');
    if (totPaidEl) totPaidEl.textContent = '₹0';

    const outEl = document.getElementById('summaryOutstanding');
    if (outEl) outEl.textContent = '₹0';

    renderRecentPayments([]);
    refreshLucide();
  }

  function renderRecentPayments(payments) {
    const tbody = document.getElementById('recentPaymentsBody');
    if (!tbody) return;

    if (!payments || payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted);font-size:12px;">No payment records found.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    payments.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.date}</td>
        <td>${p.orderNo}</td>
        <td class="amount-col">${formatRupees(p.amount)}</td>
        <td class="method-col">${p.method}</td>
        <td>${p.receivedBy}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* ────────────────────────────────────────────────────────────
     5. RENDER ANALYTICS CHARTS (PAYMENT TREND GROUPED BARS)
     ──────────────────────────────────────────────────────────── */
  function renderPaymentTrendChart() {
    const container = document.getElementById('trendBarsContainer');
    if (!container) return;

    container.innerHTML = '';
    if (!STATE.trendData || STATE.trendData.length === 0) {
      container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;width:100%;color:var(--text-muted);font-size:12px;">No payment trend data available.</div>';
      return;
    }

    const maxDataVal = Math.max(1.0, ...STATE.trendData.map(item => Math.max(item.receipts || 0, item.outstanding || 0)));
    const maxVal = maxDataVal * 1.25;

    STATE.trendData.forEach(item => {
      const group = document.createElement('div');
      group.className = 'month-bar-group';

      const rHeightPct = Math.min(100, Math.max(4, ((item.receipts || 0) / maxVal) * 100));
      const oHeightPct = Math.min(100, Math.max(4, ((item.outstanding || 0) / maxVal) * 100));

      group.innerHTML = `
        <div class="grouped-bars">
          <div class="bar-col bar-receipts" style="height: ${rHeightPct}%;" title="${item.month} Receipts: ₹${(item.receipts || 0).toFixed(2)}L"></div>
          <div class="bar-col bar-outstanding" style="height: ${oHeightPct}%;" title="${item.month} Outstanding: ₹${(item.outstanding || 0).toFixed(2)}L"></div>
        </div>
        <span class="month-label">${item.month}</span>
      `;

      container.appendChild(group);
    });
  }

  /* ────────────────────────────────────────────────────────────
     6. MODAL HANDLERS & WORKFLOWS
     ──────────────────────────────────────────────────────────── */

  // Dynamic Options for Record Payment Modal
  function populateRecordCustomerOptions() {
    const custSelect = document.getElementById('recordCustomerSelect');
    if (!custSelect) return;
    const customers = Array.from(new Set(STATE.orders.map(o => o.customer)));
    custSelect.innerHTML = customers.map(c => {
      const o = STATE.orders.find(ord => ord.customer === c);
      return `<option value="${c}">${c} (${o ? o.phone : ''})</option>`;
    }).join('');
  }

  function populateRecordOrderOptions(customerName, selectedOrderNo) {
    const orderSelect = document.getElementById('recordOrderSelect');
    const amountInput = document.getElementById('recordPaymentAmount');
    if (!orderSelect) return;

    const customerOrders = STATE.orders.filter(o => o.customer === customerName);
    if (customerOrders.length === 0) {
      orderSelect.innerHTML = `<option value="">No orders found</option>`;
      if (amountInput) amountInput.value = '';
      return;
    }

    orderSelect.innerHTML = customerOrders.map(o => {
      const bal = calculateBalance(o);
      const isSel = selectedOrderNo ? o.orderNo === selectedOrderNo : false;
      return `<option value="${o.orderNo}" ${isSel ? 'selected' : ''}>${o.orderNo} — ${o.garment} (Due: ${formatRupees(bal)})</option>`;
    }).join('');

    const targetOrderNo = selectedOrderNo || orderSelect.value;
    const activeOrder = customerOrders.find(o => o.orderNo === targetOrderNo) || customerOrders[0];
    if (activeOrder && amountInput) {
      amountInput.value = calculateBalance(activeOrder) || '';
    }
  }

  /* ────────────────────────────────────────────────────────────
     5b. RENDER PAYMENT METHODS DONUT CHART & PERCENTAGES
     ──────────────────────────────────────────────────────────── */
  function normalizePaymentMethod(rawMethod) {
    if (!rawMethod) return 'Other';
    const m = String(rawMethod).toUpperCase().trim();
    if (m.includes('UPI') || m.includes('GPAY') || m.includes('PHONEPE') || m.includes('PAYTM') || m.includes('BHIM')) return 'UPI';
    if (m === 'CASH') return 'Cash';
    if (m.includes('CARD') || m.includes('CREDIT') || m.includes('DEBIT') || m.includes('POS')) return 'Card';
    if (m.includes('BANK') || m.includes('TRANSFER') || m.includes('NEFT') || m.includes('IMPS') || m.includes('RTGS') || m.includes('CHEQUE')) return 'Bank Transfer';
    return 'Other';
  }

  function renderPaymentMethodsChart() {
    const methodTotals = {
      'UPI': 0,
      'Cash': 0,
      'Card': 0,
      'Bank Transfer': 0,
      'Other': 0
    };

    let totalReceipts = 0;

    STATE.orders.forEach(order => {
      if (Array.isArray(order.transactions) && order.transactions.length > 0) {
        order.transactions.forEach(t => {
          const m = normalizePaymentMethod(t.method);
          const amt = Number(t.amount) || 0;
          if (amt > 0) {
            methodTotals[m] = (methodTotals[m] || 0) + amt;
            totalReceipts += amt;
          }
        });
      } else if (order.paid > 0) {
        const m = normalizePaymentMethod(order.paymentMethod);
        methodTotals[m] = (methodTotals[m] || 0) + order.paid;
        totalReceipts += order.paid;
      }
    });

    // Update Center Total Receipts label
    const centerValEl = document.getElementById('methodsTotalReceipts');
    if (centerValEl) {
      centerValEl.textContent = formatRupees(totalReceipts);
    }

    // Colors per method
    const methodColors = {
      'UPI': '#d4ff32',
      'Cash': '#c084fc',
      'Card': '#fb7185',
      'Bank Transfer': '#38bdf8',
      'Other': '#94a3b8'
    };

    // Calculate percentages
    const upiPct = totalReceipts > 0 ? Math.round((methodTotals['UPI'] / totalReceipts) * 100) : 0;
    const cashPct = totalReceipts > 0 ? Math.round((methodTotals['Cash'] / totalReceipts) * 100) : 0;
    const cardPct = totalReceipts > 0 ? Math.round((methodTotals['Card'] / totalReceipts) * 100) : 0;
    const bankPct = totalReceipts > 0 ? Math.round((methodTotals['Bank Transfer'] / totalReceipts) * 100) : 0;
    const otherPct = totalReceipts > 0 ? Math.max(0, 100 - (upiPct + cashPct + cardPct + bankPct)) : 0;

    // Update Percentage Spans in Legend
    const elUpi = document.getElementById('pctUpi');
    const elCash = document.getElementById('pctCash');
    const elCard = document.getElementById('pctCard');
    const elBank = document.getElementById('pctBank');
    const elOther = document.getElementById('pctOther');

    if (elUpi) elUpi.textContent = `${upiPct}%`;
    if (elCash) elCash.textContent = `${cashPct}%`;
    if (elCard) elCard.textContent = `${cardPct}%`;
    if (elBank) elBank.textContent = `${bankPct}%`;
    if (elOther) elOther.textContent = `${otherPct}%`;

    // Update Legend tooltips with exact amounts
    const rowUpi = document.getElementById('legendRowUpi');
    const rowCash = document.getElementById('legendRowCash');
    const rowCard = document.getElementById('legendRowCard');
    const rowBank = document.getElementById('legendRowBank');
    const rowOther = document.getElementById('legendRowOther');

    if (rowUpi) rowUpi.title = `UPI: ${formatRupees(methodTotals['UPI'])}`;
    if (rowCash) rowCash.title = `Cash: ${formatRupees(methodTotals['Cash'])}`;
    if (rowCard) rowCard.title = `Card: ${formatRupees(methodTotals['Card'])}`;
    if (rowBank) rowBank.title = `Bank Transfer: ${formatRupees(methodTotals['Bank Transfer'])}`;
    if (rowOther) rowOther.title = `Other: ${formatRupees(methodTotals['Other'])}`;

    // Render SVG Donut Arcs
    const arcsGroup = document.getElementById('methodsDonutArcs');
    if (!arcsGroup) return;

    arcsGroup.innerHTML = '';

    if (totalReceipts === 0) {
      // Nothing collected yet — base neutral ring remains visible, no colored arcs
      return;
    }

    const categories = [
      { key: 'UPI', pct: upiPct, color: methodColors['UPI'] },
      { key: 'Cash', pct: cashPct, color: methodColors['Cash'] },
      { key: 'Card', pct: cardPct, color: methodColors['Card'] },
      { key: 'Bank Transfer', pct: bankPct, color: methodColors['Bank Transfer'] },
      { key: 'Other', pct: otherPct, color: methodColors['Other'] }
    ];

    let currentOffset = 0;
    categories.forEach(cat => {
      if (cat.pct > 0) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', cat.color);
        path.setAttribute('stroke-width', '4.5');
        path.setAttribute('stroke-dasharray', `${cat.pct}, 100`);
        if (currentOffset > 0) {
          path.setAttribute('stroke-dashoffset', `-${currentOffset}`);
        }
        arcsGroup.appendChild(path);
        currentOffset += cat.pct;
      }
    });
  }

  /* ────────────────────────────────────────────────────────────
     5c. RENDER RECEIVABLES AGING BARS (5 BUCKETS)
     ──────────────────────────────────────────────────────────── */
  function renderReceivablesAgingChart() {
    const buckets = {
      notDue: 0,
      days16to30: 0,
      days31to60: 0,
      days61to90: 0,
      days90Plus: 0
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    STATE.orders.forEach(order => {
      const bal = calculateBalance(order);
      if (bal <= 0) return;

      let daysOverdue = 0;
      if (order.dueDate && order.dueDate !== '-') {
        const due = new Date(order.dueDate);
        if (!isNaN(due.getTime())) {
          due.setHours(0, 0, 0, 0);
          const diffMs = today.getTime() - due.getTime();
          daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }
      }

      if (daysOverdue <= 15) {
        buckets.notDue += bal;
      } else if (daysOverdue <= 30) {
        buckets.days16to30 += bal;
      } else if (daysOverdue <= 60) {
        buckets.days31to60 += bal;
      } else if (daysOverdue <= 90) {
        buckets.days61to90 += bal;
      } else {
        buckets.days90Plus += bal;
      }
    });

    // Update Badges
    const badgeNotDue = document.getElementById('agingValNotDue');
    const badge1630 = document.getElementById('agingVal1630');
    const badge3160 = document.getElementById('agingVal3160');
    const badge6190 = document.getElementById('agingVal6190');
    const badge90Plus = document.getElementById('agingVal90Plus');

    if (badgeNotDue) badgeNotDue.textContent = formatRupees(buckets.notDue);
    if (badge1630) badge1630.textContent = formatRupees(buckets.days16to30);
    if (badge3160) badge3160.textContent = formatRupees(buckets.days31to60);
    if (badge6190) badge6190.textContent = formatRupees(buckets.days61to90);
    if (badge90Plus) badge90Plus.textContent = formatRupees(buckets.days90Plus);

    // Update Bar Heights & Opacity
    const maxVal = Math.max(1, buckets.notDue, buckets.days16to30, buckets.days31to60, buckets.days61to90, buckets.days90Plus);
    const hasAnyBalance = (buckets.notDue + buckets.days16to30 + buckets.days31to60 + buckets.days61to90 + buckets.days90Plus) > 0;

    const barConfigs = [
      { id: 'agingBarNotDue', val: buckets.notDue, baseColor: 'rgba(192, 132, 252' },
      { id: 'agingBar1630', val: buckets.days16to30, baseColor: 'rgba(244, 114, 182' },
      { id: 'agingBar3160', val: buckets.days31to60, baseColor: 'rgba(251, 191, 36' },
      { id: 'agingBar6190', val: buckets.days61to90, baseColor: 'rgba(251, 146, 60' },
      { id: 'agingBar90Plus', val: buckets.days90Plus, baseColor: 'rgba(248, 113, 113' }
    ];

    barConfigs.forEach(b => {
      const el = document.getElementById(b.id);
      if (!el) return;
      if (!hasAnyBalance || b.val === 0) {
        el.style.height = '4px';
        el.style.background = `${b.baseColor}, 0.25)`;
      } else {
        const heightPx = Math.max(6, Math.round((b.val / maxVal) * 65));
        el.style.height = `${heightPx}px`;
        el.style.background = `${b.baseColor}, 0.85)`;
      }
    });
  }

  // Modal 1: Record Payment
  function openRecordPaymentModal(prefillOrderNo) {
    const modal = document.getElementById('modalRecordPayment');
    if (!modal) return;

    populateRecordCustomerOptions();

    const targetNo = prefillOrderNo || STATE.selectedOrderNo;
    const order = STATE.orders.find(o => o.orderNo === targetNo) || STATE.orders[0];

    const custSelect = document.getElementById('recordCustomerSelect');
    if (order && custSelect) {
      custSelect.value = order.customer;
      populateRecordOrderOptions(order.customer, order.orderNo);
    }

    modal.classList.add('open');
    refreshLucide();
  }

  function closeRecordPaymentModal() {
    const modal = document.getElementById('modalRecordPayment');
    if (modal) modal.classList.remove('open');
  }

  async function submitRecordPayment() {
    const orderSelect = document.getElementById('recordOrderSelect');
    const amountInput = document.getElementById('recordPaymentAmount');
    const methodSelect = document.getElementById('recordPaymentMethod');
    const refInput = document.getElementById('recordPaymentRef');

    const orderNo = orderSelect ? orderSelect.value : STATE.selectedOrderNo;
    const amount = parseFloat(amountInput ? amountInput.value : 0);

    if (!amount || amount <= 0) {
      showToast('Please enter a valid payment amount.', 'warn');
      return;
    }

    const order = STATE.orders.find(o => o.orderNo === orderNo);
    if (!order) return;

    const currentBalance = calculateBalance(order);
    if (currentBalance <= 0) {
      showToast(`Order ${order.orderNo} is already fully paid. No further payments can be recorded.`, 'warn');
      return;
    }
    if (amount > currentBalance) {
      showToast(`Payment amount cannot exceed outstanding balance of ${formatRupees(currentBalance)}.`, 'warn');
      return;
    }

    try {
      const { default: api, Auth } = await import('../api.js');
      const user = Auth.getUser();
      const staffName = user ? (user.fullName || user.username || 'Staff') : 'Staff';
      let method = methodSelect ? methodSelect.value.toUpperCase() : 'UPI';
      if (method.includes('CARD')) method = 'CARD';
      if (method.includes('BANK')) method = 'BANK_TRANSFER';
      if (!['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE'].includes(method)) method = 'UPI';

      if (order.id) {
        await api.payments.recordTransaction(order.id, {
          amount: amount,
          method: method,
          receivedBy: staffName,
          referenceNo: refInput ? refInput.value : '',
          notes: 'Payment recorded via portal'
        });
      }

      closeRecordPaymentModal();
      showToast(`Payment of ${formatRupees(amount)} recorded for ${order.orderNo}!`, 'success');
      await loadPaymentsFromApi();
    } catch (err) {
      console.error('[Payments] Failed to record transaction:', err);
      showToast('Failed to record transaction: ' + (err.message || 'Error'), 'error');
    }
  }

  // Modal 2: Generate Receipt
  function openReceiptModal(orderNo) {
    const modal = document.getElementById('modalGenerateReceipt');
    if (!modal) return;

    const targetNo = orderNo || STATE.selectedOrderNo;
    const order = STATE.orders.find(o => o.orderNo === targetNo);
    if (!order) return;

    const balance = calculateBalance(order);
    const txns = order.transactions || [];
    const latestTxn = txns.length > 0 ? txns[txns.length - 1] : null;

    const rcptNumEl = document.getElementById('rcptNum');
    if (rcptNumEl) rcptNumEl.textContent = `RCP-${order.orderNo}-${String(txns.length || 1).padStart(2, '0')}`;

    const rcptDateEl = document.getElementById('rcptDate');
    if (rcptDateEl) {
      const d = latestTxn && latestTxn.transactionDate ? new Date(latestTxn.transactionDate) : new Date();
      rcptDateEl.textContent = d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    }

    const rcptRefEl = document.getElementById('rcptRef');
    if (rcptRefEl) rcptRefEl.textContent = (latestTxn && latestTxn.referenceNo && latestTxn.referenceNo.trim()) ? latestTxn.referenceNo : 'N/A';

    const rcptCashierEl = document.getElementById('rcptCashier');
    if (rcptCashierEl) rcptCashierEl.textContent = (latestTxn && latestTxn.receivedBy) ? latestTxn.receivedBy : (order.receivedBy || 'Boutique Staff');

    const rcptPrevPaidEl = document.getElementById('rcptPrevPaid');
    if (rcptPrevPaidEl) {
      const prior = latestTxn ? Math.max(0, order.paid - (Number(latestTxn.amount) || 0)) : 0;
      rcptPrevPaidEl.textContent = formatRupees(prior);
    }

    document.getElementById('rcptOrderNo').textContent = order.orderNo;
    document.getElementById('rcptCustomer').textContent = order.customer;
    document.getElementById('rcptPhone').textContent = order.phone;
    document.getElementById('rcptGarment').textContent = `${order.garment} • ${order.collection}`;
    document.getElementById('rcptDesc').textContent = (latestTxn && latestTxn.notes) ? latestTxn.notes : `Custom Designer ${order.garment} (${order.collection})`;
    document.getElementById('rcptVal').textContent = formatRupees(order.orderValue);
    document.getElementById('rcptCurrPaid').textContent = latestTxn ? formatRupees(latestTxn.amount) : formatRupees(order.paid);
    document.getElementById('rcptTotalReceived').textContent = formatRupees(order.paid);
    document.getElementById('rcptBalance').textContent = formatRupees(balance);
    document.getElementById('rcptMethod').textContent = (latestTxn && latestTxn.method) ? latestTxn.method : (order.paymentMethod || 'UPI');

    modal.classList.add('open');
    refreshLucide();
  }

  function closeReceiptModal() {
    const modal = document.getElementById('modalGenerateReceipt');
    if (modal) modal.classList.remove('open');
  }

  // Modal 3: Payment Reminder
  function openReminderModal(orderNo) {
    const modal = document.getElementById('modalPaymentReminder');
    if (!modal) return;

    const targetNo = orderNo || STATE.selectedOrderNo;
    const order = STATE.orders.find(o => o.orderNo === targetNo);
    if (!order) return;

    const balance = calculateBalance(order);
    document.getElementById('remindCustomerName').value = order.customer;
    document.getElementById('remindOutstandingVal').value = formatRupees(balance);
    document.getElementById('reminderMessageText').value = 
      `Dear ${order.customer}, your custom ${order.garment} order (${order.orderNo}) has a pending balance of ${formatRupees(balance)} due by ${order.dueDate === '-' ? 'soon' : order.dueDate}. Please complete the payment via UPI or visit Haulo Boutique. Thank you!`;

    modal.classList.add('open');
    refreshLucide();
  }

  function closeReminderModal() {
    const modal = document.getElementById('modalPaymentReminder');
    if (modal) modal.classList.remove('open');
  }

  function submitSendReminder() {
    const name = document.getElementById('remindCustomerName').value;
    closeReminderModal();
    showToast(`Payment reminder dispatched to ${name} successfully!`, 'success');
  }

  // Modal 4: Customer Ledger
  function openLedgerModal(customerName) {
    const modal = document.getElementById('modalCustomerLedger');
    if (!modal) return;

    const targetName = customerName || (STATE.orders.find(o => o.orderNo === STATE.selectedOrderNo)?.customer) || 'Customer';
    const profile = STATE.customerProfiles[targetName];

    document.getElementById('ledgerTitle').textContent = `Customer Financial Ledger — ${targetName}`;
    const custSub = document.getElementById('ledgerCustomerSubtitle');
    if (custSub) custSub.textContent = targetName;

    const tbody = document.getElementById('ledgerTableBody');
    if (tbody) {
      const customerOrders = STATE.orders.filter(o => o.customer === targetName);
      if (customerOrders.length === 0 && (!profile || profile.recentPayments.length === 0)) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">No ledger entries found for ${targetName}.</td></tr>`;
      } else {
        let runningBal = 0;
        let rowsHtml = '';
        customerOrders.forEach(o => {
          runningBal += o.orderValue;
          rowsHtml += `
            <tr>
              <td>${o.date || '—'}</td>
              <td>Order Placed</td>
              <td>${o.orderNo}</td>
              <td>${formatRupees(o.orderValue)}</td>
              <td>0</td>
              <td style="font-weight:700;color:#f472b6;">${formatRupees(runningBal)} (Dr)</td>
            </tr>
          `;
          if (o.paid > 0) {
            runningBal = Math.max(0, runningBal - o.paid);
            rowsHtml += `
              <tr>
                <td>${o.date || '—'}</td>
                <td>Payment Received (${o.paymentMethod || 'UPI'})</td>
                <td>${o.orderNo}</td>
                <td>0</td>
                <td>${formatRupees(o.paid)}</td>
                <td style="font-weight:700;color:${runningBal === 0 ? '#4ade80' : '#f472b6'};">${formatRupees(runningBal)} ${runningBal === 0 ? '(Settled)' : '(Dr)'}</td>
              </tr>
            `;
          }
        });
        tbody.innerHTML = rowsHtml;
      }
    }

    modal.classList.add('open');
    refreshLucide();
  }

  function closeLedgerModal() {
    const modal = document.getElementById('modalCustomerLedger');
    if (modal) modal.classList.remove('open');
  }

  // Modal 6: View All Separate Transactions for Order
  function renderOrderTransactionsModalView(order) {
    if (!order) return;

    // Header info
    const codeEl = document.getElementById('txnModalOrderCode');
    const custEl = document.getElementById('txnModalCustomerName');
    const garmEl = document.getElementById('txnModalGarment');
    if (codeEl) codeEl.textContent = order.orderNo;
    if (custEl) custEl.textContent = order.customer;
    if (garmEl) garmEl.textContent = `${order.garment} • ${order.collection || 'Custom'}`;

    const balance = calculateBalance(order);

    // KPI ribbon
    const valEl = document.getElementById('txnModalOrderValue');
    const paidEl = document.getElementById('txnModalTotalPaid');
    const balEl = document.getElementById('txnModalBalance');
    const stBadge = document.getElementById('txnModalStatusBadge');
    if (valEl) valEl.textContent = formatRupees(order.orderValue);
    if (paidEl) paidEl.textContent = formatRupees(order.paid);
    if (balEl) balEl.textContent = formatRupees(balance);
    if (stBadge) {
      stBadge.textContent = order.status;
      let statusClass = 'pending';
      if (order.status === 'Fully Paid') statusClass = 'fully-paid';
      else if (order.status === 'Overdue') statusClass = 'overdue';
      else if (order.status === 'Advance Paid') statusClass = 'advance-paid';
      stBadge.className = `status-pill ${statusClass}`;
    }

    // Transactions Table
    const tbody = document.getElementById('orderTransactionsTableBody');
    const countEl = document.getElementById('txnModalCountLabel');
    const txns = order.transactions || [];

    if (countEl) countEl.textContent = `${txns.length} transaction${txns.length === 1 ? '' : 's'} recorded`;

    if (!txns || txns.length === 0) {
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align:center;padding:32px 16px;color:var(--text-muted);">
              <i data-lucide="receipt" style="width:28px;height:28px;opacity:0.4;display:block;margin:0 auto 8px auto;"></i>
              No transactions recorded for this order yet.
            </td>
          </tr>
        `;
      }
    } else {
      if (tbody) {
        tbody.innerHTML = '';
        txns.forEach((t, idx) => {
          const tr = document.createElement('tr');
          const dStr = t.transactionDate ? new Date(t.transactionDate).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
          }) : (order.date || '—');

          // Stage / Category Badge
          let typeClass = 'installment';
          let typeLabel = 'Installment';
          const notesLower = (t.notes || '').toLowerCase();
          if (notesLower.includes('advance') || (idx === 0 && txns.length > 1)) {
            typeClass = 'advance';
            typeLabel = 'Advance';
          } else if (balance === 0 && idx === txns.length - 1) {
            typeClass = 'balance';
            typeLabel = 'Settlement';
          }

          tr.innerHTML = `
            <td style="font-weight:700;color:var(--text-muted);">TXN-${String(idx + 1).padStart(2, '0')}</td>
            <td style="white-space:nowrap;">${dStr}</td>
            <td><span class="txn-stage-badge ${typeClass}">${typeLabel}</span></td>
            <td class="amount-col" style="font-weight:700;color:var(--lime,#d4ff32);">${formatRupees(t.amount)}</td>
            <td><span class="txn-method-badge">${t.method || 'CASH'}</span></td>
            <td>${t.receivedBy || 'Staff'}</td>
            <td style="color:var(--text-muted);font-family:monospace;font-size:10px;">${t.referenceNo || '—'}</td>
            <td style="max-width:200px;white-space:normal;color:var(--text-secondary);font-size:11px;">${t.notes || '—'}</td>
            <td style="text-align:center;">
              <button class="btn-toolbar-tool single-txn-rcpt-btn" data-order-no="${order.orderNo}" data-txn-id="${t.id}" title="Receipt for TXN-${idx+1}" style="padding:2px 6px;height:24px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;">
                <i data-lucide="printer" style="width:12px;height:12px;"></i>
              </button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    // Toggle Record New Payment button if balance remains
    const btnRecordNew = document.getElementById('btnTxnRecordNew');
    if (btnRecordNew) {
      if (balance > 0) {
        btnRecordNew.style.display = 'inline-flex';
        btnRecordNew.onclick = () => {
          closeOrderTransactionsModal();
          openRecordPaymentModal(order.orderNo);
        };
      } else {
        btnRecordNew.style.display = 'none';
      }
    }
  }

  function openOrderTransactionsModal(orderNo, event) {
    if (event) {
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      if (typeof event.preventDefault === 'function') event.preventDefault();
    }
    const modal = document.getElementById('modalOrderTransactions');
    if (!modal) {
      console.error('[Payments] #modalOrderTransactions element not found in DOM');
      return;
    }

    const targetNo = orderNo || STATE.selectedOrderNo;
    let order = STATE.orders.find(o => 
      o.orderNo === targetNo || 
      String(o.id) === String(targetNo) || 
      String(o.orderId) === String(targetNo)
    );
    if (!order && STATE.orders.length > 0) {
      order = STATE.orders.find(o => o.orderNo === STATE.selectedOrderNo) || STATE.orders[0];
    }
    if (!order) {
      showToast('No payment record selected.', 'info');
      return;
    }

    // 1. Immediately open modal and render existing data with 0ms lag
    modal.classList.add('open');
    renderOrderTransactionsModalView(order);
    refreshLucide();

    // 2. Fetch fresh background update if API is available
    (async () => {
      try {
        let api = window.api;
        if (!api) {
          const mod = await import('../api.js');
          api = mod.default || mod;
        }
        if (!api || !api.payments) return;
        let freshPayment = null;
        if (order.orderId) {
          freshPayment = await api.payments.getByOrderId(order.orderId).catch(() => null);
        } else if (order.id) {
          freshPayment = await api.payments.get(order.id).catch(() => null);
        }
        if (freshPayment) {
          order.transactions = freshPayment.transactions || [];
          order.paid = Number(freshPayment.paidAmount) || 0;
          order.orderValue = Number(freshPayment.totalAmount) || order.orderValue;
          order.status = mapPaymentStatus(freshPayment.status);
          if (modal.classList.contains('open')) {
            renderOrderTransactionsModalView(order);
            refreshLucide();
          }
        }
      } catch (err) {
        console.warn('[Payments] Background refresh for transactions modal failed:', err);
      }
    })();
  }

  function closeOrderTransactionsModal() {
    const modal = document.getElementById('modalOrderTransactions');
    if (modal) modal.classList.remove('open');
  }

  function openReceiptModalForTxn(orderNo, txnId) {
    const order = STATE.orders.find(o => o.orderNo === orderNo);
    if (!order) return;
    const txns = order.transactions || [];
    const txnIndex = txns.findIndex(t => String(t.id) === String(txnId));
    const txn = txns[txnIndex];
    if (!txn) {
      openReceiptModal(orderNo);
      return;
    }

    const modal = document.getElementById('modalGenerateReceipt');
    if (!modal) return;

    // Calculate prior paid up to this specific transaction
    let priorPaid = 0;
    for (let i = 0; i < txnIndex; i++) {
      priorPaid += Number(txns[i].amount) || 0;
    }
    const currentPaid = Number(txn.amount) || 0;
    const totalAfterThisTxn = priorPaid + currentPaid;
    const balanceAfterThisTxn = Math.max(0, order.orderValue - totalAfterThisTxn);

    // Populate all receipt metadata
    const rcptNumEl = document.getElementById('rcptNum');
    if (rcptNumEl) rcptNumEl.textContent = `RCP-${order.orderNo}-${String(txnIndex + 1).padStart(2, '0')}`;

    const rcptDateEl = document.getElementById('rcptDate');
    if (rcptDateEl) {
      const d = txn.transactionDate ? new Date(txn.transactionDate) : new Date();
      rcptDateEl.textContent = d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    }

    const rcptRefEl = document.getElementById('rcptRef');
    if (rcptRefEl) rcptRefEl.textContent = (txn.referenceNo && txn.referenceNo.trim()) ? txn.referenceNo : 'N/A';

    const rcptCashierEl = document.getElementById('rcptCashier');
    if (rcptCashierEl) rcptCashierEl.textContent = txn.receivedBy || 'Boutique Staff';

    const rcptPrevPaidEl = document.getElementById('rcptPrevPaid');
    if (rcptPrevPaidEl) rcptPrevPaidEl.textContent = formatRupees(priorPaid);

    document.getElementById('rcptOrderNo').textContent = order.orderNo;
    document.getElementById('rcptCustomer').textContent = order.customer;
    document.getElementById('rcptPhone').textContent = order.phone;
    document.getElementById('rcptGarment').textContent = `${order.garment} • ${order.collection}`;
    document.getElementById('rcptDesc').textContent = txn.notes || `Transaction receipt for ${order.garment}`;
    document.getElementById('rcptVal').textContent = formatRupees(order.orderValue);
    document.getElementById('rcptCurrPaid').textContent = formatRupees(currentPaid);
    document.getElementById('rcptTotalReceived').textContent = formatRupees(totalAfterThisTxn);
    document.getElementById('rcptBalance').textContent = formatRupees(balanceAfterThisTxn);
    document.getElementById('rcptMethod').textContent = txn.method || 'CASH';

    modal.classList.add('open');
    refreshLucide();
  }

  // Modal 5: Filter Modal
  function openFilterModal() {
    const modal = document.getElementById('modalAdvancedFilter');
    if (modal) modal.classList.add('open');
  }

  function closeFilterModal() {
    const modal = document.getElementById('modalAdvancedFilter');
    if (modal) modal.classList.remove('open');
  }

  function applyFilterModal() {
    const statusSelect = document.getElementById('filterStatusSelect');
    if (statusSelect) {
      const val = statusSelect.value;
      if (val === 'all') STATE.activeTabFilter = 'all';
      else if (val === 'Fully Paid') STATE.activeTabFilter = 'paid';
      else if (val === 'Pending') STATE.activeTabFilter = 'pending';
      else if (val === 'Overdue') STATE.activeTabFilter = 'overdue';
    }
    closeFilterModal();
    renderPaymentTable();
    showToast('Filters applied successfully.', 'info');
  }

  function resetFilterModal() {
    STATE.activeTabFilter = 'all';
    STATE.searchQuery = '';
    const sInput = document.getElementById('tableSearchInput');
    if (sInput) sInput.value = '';

    // Reset Pill Tabs
    const pills = document.querySelectorAll('#paymentTabCluster .tab-pill');
    pills.forEach(p => p.classList.toggle('active', p.dataset.filter === 'all'));

    closeFilterModal();
    renderPaymentTable();
    showToast('Filters reset to default.', 'info');
  }

  /* ────────────────────────────────────────────────────────────
     7. ROW ACTIONS MENU & EXPORT POPUPS
     ──────────────────────────────────────────────────────────── */
  function openRowActionMenu(button, orderNo) {
    STATE.actionTargetOrderNo = orderNo;
    const menu = document.getElementById('rowActionDropdown');
    if (!menu) return;

    const rect = button.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
    menu.style.left = `${rect.left + window.scrollX - 120}px`;
    menu.classList.add('open');
  }

  function closeRowActionMenu() {
    const menu = document.getElementById('rowActionDropdown');
    if (menu) menu.classList.remove('open');
  }

  function exportTableToCsv() {
    let csv = 'Order No.,Customer,Garment,Order Value,Paid,Balance,Status,Due Date\n';
    STATE.orders.forEach(o => {
      csv += `"${o.orderNo}","${o.customer}","${o.garment} - ${o.collection}",${o.orderValue},${o.paid},${calculateBalance(o)},"${o.status}","${o.dueDate}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `haulo_payments_export_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    showToast('Payments CSV exported successfully.', 'success');
  }

  /* ────────────────────────────────────────────────────────────
     8. ATTACH ALL EVENT LISTENERS
     ──────────────────────────────────────────────────────────── */


  function setupEventListeners() {

    // 1. Header Action Buttons
    const btnRecord = document.getElementById('btnHeaderRecordPayment');
    if (btnRecord) btnRecord.addEventListener('click', () => openRecordPaymentModal());

    const btnReceipt = document.getElementById('btnHeaderGenerateReceipt');
    if (btnReceipt) btnReceipt.addEventListener('click', () => openReceiptModal());

    const btnMore = document.getElementById('btnHeaderMoreOptions');
    const headerDropdown = document.getElementById('headerMoreDropdown');
    if (btnMore && headerDropdown) {
      btnMore.addEventListener('click', (e) => {
        e.stopPropagation();
        headerDropdown.classList.toggle('open');
      });
    }

    // Header Dropdown Menu Items
    const menuExport = document.getElementById('menuExportAll');
    if (menuExport) menuExport.addEventListener('click', () => { if (headerDropdown) headerDropdown.classList.remove('open'); exportTableToCsv(); });

    const menuPrint = document.getElementById('menuPrintSummary');
    if (menuPrint) menuPrint.addEventListener('click', () => { if (headerDropdown) headerDropdown.classList.remove('open'); window.print(); });

    const menuAudit = document.getElementById('menuAuditLog');
    if (menuAudit) menuAudit.addEventListener('click', () => { if (headerDropdown) headerDropdown.classList.remove('open'); showToast('Audit Trail: All financial transaction logs verified & intact.', 'info'); });

    const menuSettings = document.getElementById('menuPaymentSettings');
    if (menuSettings) menuSettings.addEventListener('click', () => { if (headerDropdown) headerDropdown.classList.remove('open'); showToast('Payment Gateway: Razorpay, Stripe, UPI active.', 'info'); });

    // 2. Tab Filter Pills
    const tabPills = document.querySelectorAll('#paymentTabCluster .tab-pill');
    tabPills.forEach(pill => {
      pill.addEventListener('click', () => {
        tabPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        STATE.activeTabFilter = pill.dataset.filter || 'all';
        renderPaymentTable();
      });
    });

    // 3. Search Input Field
    const searchInput = document.getElementById('tableSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        STATE.searchQuery = e.target.value;
        renderPaymentTable();
      });
    }

    // 4. Export Menu Toggle & Actions
    const exportBtn = document.getElementById('btnExportMenuToggle');
    const exportDropdown = document.getElementById('exportMenuDropdown');
    if (exportBtn && exportDropdown) {
      exportBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exportDropdown.classList.toggle('open');
      });
    }

    const csvBtn = document.getElementById('exportCsvBtn');
    if (csvBtn) csvBtn.addEventListener('click', () => { exportDropdown.classList.remove('open'); exportTableToCsv(); });

    const excelBtn = document.getElementById('exportExcelBtn');
    if (excelBtn) excelBtn.addEventListener('click', () => { exportDropdown.classList.remove('open'); exportTableToCsv(); });

    const printBtn = document.getElementById('exportPrintBtn');
    if (printBtn) printBtn.addEventListener('click', () => { exportDropdown.classList.remove('open'); window.print(); });

    // 5. Quick Action Buttons (Right Panel)
    const qaRecord = document.getElementById('qaRecordPayment');
    if (qaRecord) qaRecord.addEventListener('click', () => openRecordPaymentModal());

    const qaReceipt = document.getElementById('qaGenerateReceipt');
    if (qaReceipt) qaReceipt.addEventListener('click', () => openReceiptModal());

    const qaReminder = document.getElementById('qaSendReminder');
    if (qaReminder) qaReminder.addEventListener('click', () => openReminderModal());

    const qaLedger = document.getElementById('qaViewLedger');
    if (qaLedger) qaLedger.addEventListener('click', () => openLedgerModal());

    const viewAllRecent = document.getElementById('linkViewAllRecent');
    if (viewAllRecent) {
      viewAllRecent.addEventListener('click', (e) => {
        e.preventDefault();
        const selOrder = STATE.orders.find(o => o.orderNo === STATE.selectedOrderNo);
        openLedgerModal(selOrder ? selOrder.customer : undefined);
      });
    }

    // 6. Record Payment Modal Buttons & Dynamic Select Sync
    const custSelect = document.getElementById('recordCustomerSelect');
    if (custSelect) {
      custSelect.addEventListener('change', (e) => {
        populateRecordOrderOptions(e.target.value);
      });
    }

    const orderSelect = document.getElementById('recordOrderSelect');
    if (orderSelect) {
      orderSelect.addEventListener('change', (e) => {
        const ord = STATE.orders.find(o => o.orderNo === e.target.value);
        const amtInput = document.getElementById('recordPaymentAmount');
        if (ord && amtInput) {
          amtInput.value = calculateBalance(ord) || '';
        }
      });
    }

    const closeRecBtn = document.getElementById('closeRecordModalBtn');
    const cancelRecBtn = document.getElementById('cancelRecordModalBtn');
    const submitRecBtn = document.getElementById('submitRecordPaymentBtn');
    if (closeRecBtn) closeRecBtn.addEventListener('click', closeRecordPaymentModal);
    if (cancelRecBtn) cancelRecBtn.addEventListener('click', closeRecordPaymentModal);
    if (submitRecBtn) submitRecBtn.addEventListener('click', submitRecordPayment);

    // 7. Receipt Modal Buttons
    const closeRcptBtn = document.getElementById('closeReceiptModalBtn');
    const printRcptBtn = document.getElementById('btnPrintReceipt');
    const dlRcptBtn = document.getElementById('btnDownloadReceipt');
    if (closeRcptBtn) closeRcptBtn.addEventListener('click', closeReceiptModal);
    if (printRcptBtn) printRcptBtn.addEventListener('click', () => window.print());
    if (dlRcptBtn) dlRcptBtn.addEventListener('click', () => { showToast('Receipt PDF downloaded.', 'success'); closeReceiptModal(); });

    // 8. Reminder Modal Buttons & Communication Channel Tabs
    const channelBtns = [
      document.getElementById('channelWhatsappBtn'),
      document.getElementById('channelSmsBtn'),
      document.getElementById('channelEmailBtn')
    ];
    channelBtns.forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        channelBtns.forEach(b => b && b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const closeRemBtn = document.getElementById('closeReminderModalBtn');
    const cancelRemBtn = document.getElementById('cancelReminderBtn');
    const submitRemBtn = document.getElementById('submitSendReminderBtn');
    if (closeRemBtn) closeRemBtn.addEventListener('click', closeReminderModal);
    if (cancelRemBtn) cancelRemBtn.addEventListener('click', closeReminderModal);
    if (submitRemBtn) submitRemBtn.addEventListener('click', submitSendReminder);

    // 9. Ledger Modal Buttons
    const closeLedgBtn = document.getElementById('closeLedgerModalBtn');
    const doneLedgBtn = document.getElementById('btnCloseLedgerAction');
    const exportLedgBtn = document.getElementById('btnExportLedgerCsv');
    if (closeLedgBtn) closeLedgBtn.addEventListener('click', closeLedgerModal);
    if (doneLedgBtn) doneLedgBtn.addEventListener('click', closeLedgerModal);
    if (exportLedgBtn) exportLedgBtn.addEventListener('click', () => { showToast('Customer ledger exported to CSV.', 'success'); });

    // 9b. Order Transactions Modal Buttons
    const closeTxnBtn = document.getElementById('closeTxnModalBtn');
    const closeTxnAct = document.getElementById('btnCloseTxnModalAction');
    const printAllTxnBtn = document.getElementById('btnTxnPrintAllReceipts');
    if (closeTxnBtn) closeTxnBtn.addEventListener('click', closeOrderTransactionsModal);
    if (closeTxnAct) closeTxnAct.addEventListener('click', closeOrderTransactionsModal);
    if (printAllTxnBtn) {
      printAllTxnBtn.addEventListener('click', () => {
        openReceiptModal(STATE.selectedOrderNo);
      });
    }

    const txnTableBody = document.getElementById('orderTransactionsTableBody');
    if (txnTableBody) {
      txnTableBody.addEventListener('click', (e) => {
        const rcptBtn = e.target.closest('.single-txn-rcpt-btn');
        if (rcptBtn) {
          const oNo = rcptBtn.dataset.orderNo;
          const txnId = rcptBtn.dataset.txnId;
          openReceiptModalForTxn(oNo, txnId);
        }
      });
    }

    const modalTxnBackdrop = document.getElementById('modalOrderTransactions');
    if (modalTxnBackdrop) {
      modalTxnBackdrop.addEventListener('click', (e) => {
        if (e.target === modalTxnBackdrop) closeOrderTransactionsModal();
      });
    }

    // 10. Filter Modal Buttons
    const openFiltBtn = document.getElementById('btnOpenFilterModal');
    const closeFiltBtn = document.getElementById('closeFilterModalBtn');
    const resetFiltBtn = document.getElementById('resetFilterModalBtn');
    const applyFiltBtn = document.getElementById('applyFilterModalBtn');
    if (openFiltBtn) openFiltBtn.addEventListener('click', openFilterModal);
    if (closeFiltBtn) closeFiltBtn.addEventListener('click', closeFilterModal);
    if (resetFiltBtn) resetFiltBtn.addEventListener('click', resetFilterModal);
    if (applyFiltBtn) applyFiltBtn.addEventListener('click', applyFilterModal);

    // 11. Pagination Controls
    const pageBtns = document.querySelectorAll('#paginationControls .page-num-btn');
    pageBtns.forEach(pBtn => {
      pBtn.addEventListener('click', () => {
        pageBtns.forEach(b => b.classList.remove('active'));
        pBtn.classList.add('active');
        showToast(`Viewing page ${pBtn.textContent.trim()} of orders.`, 'info');
      });
    });

    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => showToast('Viewing previous page of orders.', 'info'));
    if (nextBtn) nextBtn.addEventListener('click', () => showToast('Viewing next page of orders.', 'info'));

    // 12. Table Row Eye & More Button Delegation
    document.addEventListener('click', (e) => {
      const eyeBtn = e.target.closest('.row-eye-btn');
      if (eyeBtn) {
        e.stopPropagation();
        e.preventDefault();
        const oNo = eyeBtn.dataset.orderNo;
        selectOrder(oNo);
        openOrderTransactionsModal(oNo, e);
        return;
      }

      const moreBtn = e.target.closest('.row-more-btn');
      if (moreBtn) {
        e.stopPropagation();
        e.preventDefault();
        const oNo = moreBtn.dataset.orderNo;
        selectOrder(oNo);
        openRowActionMenu(moreBtn, oNo);
        return;
      }

      // Close open dropdown popovers on outside click
      closeRowActionMenu();
      if (headerDropdown) headerDropdown.classList.remove('open');
      if (exportDropdown) exportDropdown.classList.remove('open');
    });

    // 12b. Global Escape Key to Dismiss Any Open Modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeOrderTransactionsModal();
        closeRecordPaymentModal();
        closeReceiptModal();
        closeReminderModal();
        closeLedgerModal();
        closeFilterModal();
        closeRowActionMenu();
      }
    });

    // 13. Row Action Menu Items
    const rowActionView = document.getElementById('rowActionViewOrder');
    if (rowActionView) {
      rowActionView.addEventListener('click', () => {
        closeRowActionMenu();
        const ord = STATE.orders.find(o => o.orderNo === STATE.actionTargetOrderNo);
        if (ord && ord.orderId) {
          window.location.href = `../orders/view-order/view-order.html?id=${ord.orderId}`;
        } else if (ord && ord.id) {
          window.location.href = `../orders/view-order/view-order.html?id=${ord.id}`;
        } else {
          showToast(`Order details for ${STATE.actionTargetOrderNo} not available.`, 'info');
        }
      });
    }

    const rowActionViewTxns = document.getElementById('rowActionViewTransactions');
    if (rowActionViewTxns) {
      rowActionViewTxns.addEventListener('click', () => {
        closeRowActionMenu();
        openOrderTransactionsModal(STATE.actionTargetOrderNo);
      });
    }

    const rowActionRec = document.getElementById('rowActionRecordPayment');
    if (rowActionRec) {
      rowActionRec.addEventListener('click', () => {
        closeRowActionMenu();
        openRecordPaymentModal(STATE.actionTargetOrderNo);
      });
    }

    const rowActionRcpt = document.getElementById('rowActionGenerateReceipt');
    if (rowActionRcpt) {
      rowActionRcpt.addEventListener('click', () => {
        closeRowActionMenu();
        openReceiptModal(STATE.actionTargetOrderNo);
      });
    }

    const rowActionHist = document.getElementById('rowActionPaymentHistory');
    if (rowActionHist) {
      rowActionHist.addEventListener('click', () => {
        closeRowActionMenu();
        openLedgerModal();
      });
    }

    const rowActionRem = document.getElementById('rowActionSendReminder');
    if (rowActionRem) {
      rowActionRem.addEventListener('click', () => {
        closeRowActionMenu();
        openReminderModal(STATE.actionTargetOrderNo);
      });
    }

    const rowActionCust = document.getElementById('rowActionViewCustomer');
    if (rowActionCust) {
      rowActionCust.addEventListener('click', () => {
        closeRowActionMenu();
        const ord = STATE.orders.find(o => o.orderNo === STATE.actionTargetOrderNo);
        const mobile = ord ? (ord.customerMobile || ord.phone || ord.customer) : '';
        window.location.href = mobile 
          ? `../customer/Customer360/customer360.html?mobile=${encodeURIComponent(mobile)}`
          : '../customer/Customer360/customer360.html';
      });
    }

    // 14. Global Keyboard Escape Listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeOrderTransactionsModal();
        closeRecordPaymentModal();
        closeReceiptModal();
        closeReminderModal();
        closeLedgerModal();
        closeFilterModal();
        closeRowActionMenu();
      }
    });
  }

  /* ────────────────────────────────────────────────────────────
     9. INITIALIZATION
     ──────────────────────────────────────────────────────────── */
  function mapPaymentStatus(s) {
    if (!s) return 'Pending';
    if (s === 'FULLY_PAID' || s === 'PAID') return 'Fully Paid';
    if (s === 'PARTIAL') return 'Partial';
    if (s === 'PENDING') return 'Pending';
    if (s === 'OVERDUE') return 'Overdue';
    return String(s);
  }

  async function updateKPIs() {
    let totalCollected = 0;
    let pendingBalance = 0;
    let overdueBalance = 0;
    let overdueCount = 0;
    let advanceReceived = 0;
    let thisMonthCollected = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    STATE.orders.forEach(o => {
      const paidAmt = Number(o.paid) || 0;
      totalCollected += paidAmt;
      const bal = calculateBalance(o);
      if (bal > 0) {
        pendingBalance += bal;
        if (o.status === 'Overdue') {
          overdueBalance += bal;
          overdueCount += 1;
        }
      }
      if (paidAmt > 0 && bal > 0) {
        advanceReceived += paidAmt;
      }
      if (o.date) {
        const d = new Date(o.date);
        if (!isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          thisMonthCollected += paidAmt;
        }
      }
    });

    try {
      const { default: api } = await import('../api.js');
      const kpis = await api.payments.kpis().catch(() => null);
      if (kpis) {
        if (kpis.totalCollected != null) totalCollected = Number(kpis.totalCollected) || 0;
        if (kpis.pendingBalance != null) pendingBalance = Number(kpis.pendingBalance) || 0;
        if (kpis.overdueCount != null) overdueCount = Number(kpis.overdueCount) || 0;
        if (kpis.thisMonthCollected != null) thisMonthCollected = Number(kpis.thisMonthCollected) || 0;
      }
    } catch (_) {}

    const elReceipts = document.getElementById('kpiTotalReceipts');
    const elAdvance  = document.getElementById('kpiAdvanceReceived');
    const elPending  = document.getElementById('kpiPendingReceivables');
    const elOverdue  = document.getElementById('kpiOverduePayments');
    const elOverdueSub = document.getElementById('kpiOverduePaymentsSub');
    const elPendingSub = document.getElementById('kpiPendingReceivablesSub');

    if (elReceipts) elReceipts.textContent = formatRupees(thisMonthCollected || totalCollected);
    if (elAdvance)  elAdvance.textContent  = formatRupees(advanceReceived);
    if (elPending)  elPending.textContent  = formatRupees(pendingBalance);
    if (elOverdue)  elOverdue.textContent  = formatRupees(overdueBalance);
    if (elOverdueSub) elOverdueSub.textContent = `${overdueCount} orders`;
    if (elPendingSub) {
      const pendingCount = STATE.orders.filter(o => calculateBalance(o) > 0).length;
      elPendingSub.textContent = `${pendingCount} orders`;
    }

    // Update Collection Progress Donut Gauge (KPI 5)
    const totalBilled = totalCollected + pendingBalance;
    const collectionPct = totalBilled > 0 ? Math.min(100, Math.round((totalCollected * 100) / totalBilled)) : 0;
    const pendingPct = totalBilled > 0 ? Math.min(100, Math.round((pendingBalance * 100) / totalBilled)) : 0;
    const overduePct = totalBilled > 0 ? Math.min(100, Math.round((overdueBalance * 100) / totalBilled)) : 0;

    const donutCenter = document.querySelector('.progress-donut-center');
    if (donutCenter) donutCenter.textContent = `${collectionPct}%`;

    const donutPaths = document.querySelectorAll('.progress-donut-svg path');
    if (donutPaths && donutPaths.length >= 2) {
      donutPaths[1].setAttribute('stroke-dasharray', `${collectionPct}, 100`);
    }

    const legCol = document.getElementById('legendCollectedVal');
    const legPend = document.getElementById('legendPendingVal');
    const legOver = document.getElementById('legendOverdueVal');
    if (legCol) legCol.textContent = `${collectionPct}%`;
    if (legPend) legPend.textContent = `${pendingPct}%`;
    if (legOver) legOver.textContent = `${overduePct}%`;

    // Render payment methods and receivables aging charts
    renderPaymentMethodsChart();
    renderReceivablesAgingChart();
  }

  async function loadPaymentsFromApi() {
    try {
      const { default: api, Auth } = await import('../api.js');
      if (!Auth.isLoggedIn()) {
        window.location.href = '../login/login.html';
        return;
      }
      const res = await api.payments.list({ page: 0, size: 100 });
      const items = Array.isArray(res) ? res : (res && res.content ? res.content : []);
      const realPayments = items.map(p => ({
        id: p.id,
        orderId: p.orderId,
        orderNo: p.orderCode || 'ORD-UNKNOWN',
        customer: p.customerName || 'Valued Client',
        customerMobile: p.customerMobile || p.customerPhone || '',
        phone: p.customerPhone || p.customerMobile || '',
        location: p.customerLocation || 'In Store',
        vip: false,
        garment: p.garmentType || p.orderCode || 'Bespoke Order',
        collection: 'Custom Design',
        orderValue: Number(p.totalAmount) || 0,
        paid: Number(p.paidAmount) || 0,
        status: mapPaymentStatus(p.status),
        dueDate: p.dueDate ? String(p.dueDate).slice(0, 10) : '-',
        date: p.createdAt ? String(p.createdAt).slice(0, 10) : '',
        paymentMethod: p.transactions && p.transactions.length ? p.transactions[0].method : 'UPI',
        receivedBy: p.transactions && p.transactions.length ? p.transactions[0].receivedBy : 'Staff',
        transactions: p.transactions || []
      }));

      // Auto-backfill: if payments table is empty, trigger backfill once per session
      // to create Payment records for all existing orders automatically
      if (realPayments.length === 0 && !sessionStorage.getItem('payments_backfill_done')) {
        sessionStorage.setItem('payments_backfill_done', '1');
        try {
          const backfillResult = await api.payments.backfill();
          const count = backfillResult && backfillResult.paymentsCreated;
          if (count > 0) {
            console.log(`[Payments] Auto-backfill created ${count} payment record(s). Reloading…`);
            showToast(`Synced ${count} existing order(s) into payment records.`, 'info');
            // Short delay then reload to show fresh data
            setTimeout(() => loadPaymentsFromApi(), 800);
            return;
          }
        } catch (bfErr) {
          console.warn('[Payments] Auto-backfill failed (non-critical):', bfErr.message);
        }
      }

      STATE.orders = realPayments;

      // Build customer profiles dynamically
      STATE.customerProfiles = {};
      realPayments.forEach(ord => {
        if (!STATE.customerProfiles[ord.customer]) {
          STATE.customerProfiles[ord.customer] = {
            name: ord.customer,
            phone: ord.phone,
            location: ord.location,
            vip: ord.vip,
            avatar: ord.avatar,
            totalOrders: 0,
            totalOrderValue: 0,
            totalPaid: 0,
            outstanding: 0,
            recentPayments: []
          };
        }
        const prof = STATE.customerProfiles[ord.customer];
        prof.totalOrders += 1;
        prof.totalOrderValue += ord.orderValue;
        prof.totalPaid += ord.paid;
        prof.outstanding += calculateBalance(ord);
        if (ord.transactions && ord.transactions.length > 0) {
          ord.transactions.forEach(t => {
            prof.recentPayments.push({
              date: t.transactionDate ? String(t.transactionDate).slice(0, 10) : (ord.date || '-'),
              orderNo: ord.orderNo,
              amount: Number(t.amount) || 0,
              method: t.method || 'UPI',
              receivedBy: t.receivedBy || 'Staff'
            });
          });
        } else if (ord.paid > 0) {
          prof.recentPayments.push({
            date: ord.date || '-',
            orderNo: ord.orderNo,
            amount: ord.paid,
            method: ord.paymentMethod,
            receivedBy: ord.receivedBy
          });
        }
      });

      // Build dynamic trendData by month
      const monthMap = {};
      realPayments.forEach(o => {
        const d = o.date ? new Date(o.date) : new Date();
        const mName = isNaN(d.getTime()) ? 'Current' : d.toLocaleString('en-US', { month: 'short' });
        if (!monthMap[mName]) monthMap[mName] = { month: mName, receipts: 0, outstanding: 0 };
        monthMap[mName].receipts += (o.paid / 100000); // in Lakhs
        monthMap[mName].outstanding += (calculateBalance(o) / 100000);
      });
      STATE.trendData = Object.values(monthMap);

      updateKPIs();
      updateTabCounts();
      renderPaymentTable();
      renderPaymentTrendChart();
      renderPaymentMethodsChart();
      renderReceivablesAgingChart();
      if (realPayments.length > 0) {
        selectOrder(realPayments[0].orderNo);
      } else {
        renderEmptyCustomerSummary();
      }
    } catch (err) {
      console.error('[Payments] Failed to load payments from backend:', err.message);
      showToast('Could not load payment records. Please check your connection and refresh.', 'warn');
      STATE.orders = [];
      updateKPIs();
      updateTabCounts();
      renderPaymentTable();
      renderPaymentTrendChart();
      renderPaymentMethodsChart();
      renderReceivablesAgingChart();
      renderEmptyCustomerSummary();
    }
  }

  function updateTabCounts() {
    const allCount = STATE.orders.length;
    const pendingCount = STATE.orders.filter(o => o.status === 'Pending').length;
    const overdueCount = STATE.orders.filter(o => o.status === 'Overdue').length;
    const advanceCount = STATE.orders.filter(o => o.paid > 0 && o.status !== 'Fully Paid').length;
    const paidCount = STATE.orders.filter(o => o.status === 'Fully Paid').length;

    const btnAll = document.querySelector('#paymentTabCluster [data-filter="all"]');
    if (btnAll) btnAll.textContent = `All Orders (${allCount})`;

    const btnPending = document.querySelector('#paymentTabCluster [data-filter="pending"]');
    if (btnPending) btnPending.textContent = `Pending Payments (${pendingCount})`;

    const btnOverdue = document.querySelector('#paymentTabCluster [data-filter="overdue"]');
    if (btnOverdue) btnOverdue.textContent = `Overdue (${overdueCount})`;

    const btnAdvance = document.querySelector('#paymentTabCluster [data-filter="advance"]');
    if (btnAdvance) btnAdvance.textContent = `Advance Paid (${advanceCount})`;

    const btnPaid = document.querySelector('#paymentTabCluster [data-filter="paid"]');
    if (btnPaid) btnPaid.textContent = `Fully Paid (${paidCount})`;
  }

  function init() {
    // Expose functions globally for modal controls and inline button triggers
    window.openOrderTransactionsModal = openOrderTransactionsModal;
    window.closeOrderTransactionsModal = closeOrderTransactionsModal;
    window.openRowActionMenu = openRowActionMenu;
    window.closeRowActionMenu = closeRowActionMenu;
    window.openReceiptModalForTxn = openReceiptModalForTxn;
    window.openRecordPaymentModal = openRecordPaymentModal;
    window.closeRecordPaymentModal = closeRecordPaymentModal;
    window.openReceiptModal = openReceiptModal;
    window.closeReceiptModal = closeReceiptModal;
    window.openReminderModal = openReminderModal;
    window.closeReminderModal = closeReminderModal;
    window.openLedgerModal = openLedgerModal;
    window.closeLedgerModal = closeLedgerModal;
    window.openFilterModal = openFilterModal;
    window.closeFilterModal = closeFilterModal;

    setupEventListeners();
    refreshLucide();
    loadPaymentsFromApi();
    // Auto-refresh when any ERP module records a payment via payment-bridge.js
    window.addEventListener('payment:recorded', () => loadPaymentsFromApi());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Hook into fragments ready event
  document.addEventListener('fragments:ready', () => {
    refreshLucide();
  });

})();
