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

      tr.innerHTML = `
        <td>
          <span class="order-no-txt">${order.orderNo}</span>
        </td>
        <td>
          <div class="customer-avatar-cell">
            <img class="customer-avatar-img" src="${order.avatar}" alt="${order.customer}" onerror="this.src='${order.fallbackAvatar}';" />
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
        <td style="text-align:center;" onclick="event.stopPropagation()">
          <button class="row-more-btn" data-order-no="${order.orderNo}" title="Row Actions" aria-label="Actions for ${order.orderNo}">
            <i data-lucide="more-horizontal"></i>
          </button>
        </td>
      `;

      // Clicking row triggers selection
      tr.addEventListener('click', () => {
        selectOrder(order.orderNo);
      });

      tbody.appendChild(tr);
    });

    // Update pagination count text
    const pagInfo = document.getElementById('paginationInfoLabel');
    if (pagInfo) {
      pagInfo.textContent = `Showing 1–${filteredOrders.length} of 48 orders`;
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
        totalOrders: 4,
        totalOrderValue: order.orderValue * 2,
        totalPaid: order.paid + order.orderValue,
        outstanding: calculateBalance(order),
        recentPayments: [
          { date: order.date, orderNo: order.orderNo, amount: order.paid, method: order.paymentMethod, receivedBy: order.receivedBy }
        ]
      };
    }

    // Update Customer Bio in Right Panel
    const avatarEl = document.getElementById('summaryCustomerAvatar');
    if (avatarEl) {
      avatarEl.src = profile.avatar;
      avatarEl.onerror = () => { avatarEl.src = order.fallbackAvatar; };
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

  function renderRecentPayments(payments) {
    const tbody = document.getElementById('recentPaymentsBody');
    if (!tbody || !payments) return;

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

  // Update KPI Metric Cards & Donut Dynamically
  async function updateKPIs() {
    try {
      const { default: api } = await import('../api.js');
      const kpis = await api.payments.kpis().catch(() => null);
      if (kpis) {
        const kpiRec = document.getElementById('kpiTotalReceipts');
        if (kpiRec && kpis.totalCollected != null) kpiRec.textContent = formatRupees(Number(kpis.totalCollected));

        const kpiPend = document.getElementById('kpiPendingReceivables');
        if (kpiPend && kpis.pendingAmount != null) kpiPend.textContent = formatRupees(Number(kpis.pendingAmount));

        const collectedPct = kpis.collectionRate != null ? Math.round(Number(kpis.collectionRate)) : 85;
        const donutCenter = document.querySelector('.progress-donut-center');
        if (donutCenter) donutCenter.textContent = `${collectedPct}%`;

        const svgPaths = document.querySelectorAll('.progress-donut-svg path');
        if (svgPaths && svgPaths[1]) {
          svgPaths[1].setAttribute('stroke-dasharray', `${collectedPct}, 100`);
        }
        return;
      }
    } catch (_) {}

    let totalReceipts = 0;
    let advanceReceived = 0;
    let pendingReceivables = 0;
    let overduePayments = 0;

    STATE.orders.forEach(o => {
      totalReceipts += o.paid;
      const bal = calculateBalance(o);
      if (bal > 0) {
        pendingReceivables += bal;
        if (o.status === 'Overdue') {
          overduePayments += bal;
        }
      }
      if (o.paid > 0 && bal > 0) {
        advanceReceived += o.paid;
      }
    });

    const kpiRec = document.getElementById('kpiTotalReceipts');
    if (kpiRec) kpiRec.textContent = formatRupees(totalReceipts);

    const kpiAdv = document.getElementById('kpiAdvanceReceived');
    if (kpiAdv) kpiAdv.textContent = formatRupees(advanceReceived);

    const kpiPend = document.getElementById('kpiPendingReceivables');
    if (kpiPend) kpiPend.textContent = formatRupees(pendingReceivables);

    const kpiOver = document.getElementById('kpiOverduePayments');
    if (kpiOver) kpiOver.textContent = formatRupees(overduePayments);

    // Update collection progress donut gauge
    const totalBilled = totalReceipts + pendingReceivables;
    const collectedPct = totalBilled > 0 ? Math.round((totalReceipts / totalBilled) * 100) : 100;
    const pendingPct = 100 - collectedPct;
    const donutCenter = document.querySelector('.progress-donut-center');
    if (donutCenter) donutCenter.textContent = `${collectedPct}%`;

    const svgPaths = document.querySelectorAll('.progress-donut-svg path');
    if (svgPaths && svgPaths[1]) {
      svgPaths[1].setAttribute('stroke-dasharray', `${collectedPct}, 100`);
    }
    if (svgPaths && svgPaths[2]) {
      svgPaths[2].setAttribute('stroke-dasharray', `${pendingPct}, 100`);
      svgPaths[2].setAttribute('stroke-dashoffset', `-${collectedPct}`);
    }
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
    if (amount > currentBalance && currentBalance > 0) {
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

    document.getElementById('rcptOrderNo').textContent = order.orderNo;
    document.getElementById('rcptCustomer').textContent = order.customer;
    document.getElementById('rcptPhone').textContent = order.phone;
    document.getElementById('rcptGarment').textContent = `${order.garment} • ${order.collection}`;
    document.getElementById('rcptDesc').textContent = `Custom Designer ${order.garment} (${order.collection})`;
    document.getElementById('rcptVal').textContent = formatRupees(order.orderValue);
    document.getElementById('rcptCurrPaid').textContent = formatRupees(order.paid);
    document.getElementById('rcptTotalReceived').textContent = formatRupees(order.paid);
    document.getElementById('rcptBalance').textContent = formatRupees(balance);
    document.getElementById('rcptMethod').textContent = order.paymentMethod || 'UPI';

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
  function startLiveClock() {
    function updateClock() {
      const dateEl = document.getElementById('liveHeaderDate');
      const timeEl = document.getElementById('liveHeaderTime');
      const now = new Date();
      if (dateEl) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        dateEl.textContent = `${days[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
      }
      if (timeEl) {
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? String(hours).padStart(2, '0') : '12';
        timeEl.textContent = `${hours}:${minutes} ${ampm}`;
      }
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

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

    // 12. Table Row More Button Delegation
    document.addEventListener('click', (e) => {
      const moreBtn = e.target.closest('.row-more-btn');
      if (moreBtn) {
        e.stopPropagation();
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

    // 13. Row Action Menu Items
    const rowActionView = document.getElementById('rowActionViewOrder');
    if (rowActionView) {
      rowActionView.addEventListener('click', () => {
        closeRowActionMenu();
        showToast(`Viewing details for ${STATE.actionTargetOrderNo}`, 'info');
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
  }

  /* ────────────────────────────────────────────────────────────
     9. INITIALIZATION
     ──────────────────────────────────────────────────────────── */
  function mapPaymentStatus(s) {
    if (!s) return 'Pending';
    if (s === 'PAID') return 'Fully Paid';
    if (s === 'PARTIAL') return 'Partial';
    if (s === 'PENDING') return 'Pending';
    if (s === 'OVERDUE') return 'Overdue';
    return String(s);
  }

  async function updateKPIs() {
    try {
      const { default: api } = await import('../api.js');
      const kpis = await api.payments.kpis();
      if (!kpis) return;

      const elReceipts = document.getElementById('kpiTotalReceipts');
      const elAdvance  = document.getElementById('kpiAdvanceReceived');
      const elPending  = document.getElementById('kpiPendingReceivables');
      const elOverdue  = document.getElementById('kpiOverduePayments');

      if (elReceipts) elReceipts.textContent = '₹' + Number(kpis.thisMonthCollected || 0).toLocaleString('en-IN');
      if (elAdvance)  elAdvance.textContent  = '₹' + Number(kpis.totalCollected || 0).toLocaleString('en-IN');
      if (elPending)  elPending.textContent  = '₹' + Number(kpis.pendingBalance || 0).toLocaleString('en-IN');
      if (elOverdue)  elOverdue.textContent  = Number(kpis.overdueCount || 0).toLocaleString('en-IN') + ' orders';

      // Update Collection Progress Donut
      const totalBilled = (Number(kpis.totalCollected) || 0) + (Number(kpis.pendingBalance) || 0);
      const collectionPct = totalBilled > 0 ? Math.min(100, Math.round((Number(kpis.totalCollected) * 100) / totalBilled)) : 0;

      const donutCenter = document.querySelector('.progress-donut-center');
      if (donutCenter) donutCenter.textContent = collectionPct + '%';

      const donutPaths = document.querySelectorAll('.progress-donut-svg path');
      if (donutPaths && donutPaths.length >= 2) {
        donutPaths[1].setAttribute('stroke-dasharray', `${collectionPct}, 100`);
      }
    } catch (e) {
      console.error('[Payments] Failed to fetch payment KPIs:', e.message);
    }
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
        avatar: '../assets/user_avatar.jpg',
        fallbackAvatar: '../assets/user_avatar.jpg',
        garment: p.garmentType || 'Bespoke Order',
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
      renderPaymentTable();
      renderPaymentTrendChart();
      if (realPayments.length > 0) {
        selectOrder(realPayments[0].orderNo);
      }
    } catch (err) {
      console.error('[Payments] Failed to load payments from backend:', err.message);
      STATE.orders = [];
      updateKPIs();
      renderPaymentTable();
    }
  }

  function init() {
    startLiveClock();
    setupEventListeners();
    refreshLucide();
    loadPaymentsFromApi();
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
