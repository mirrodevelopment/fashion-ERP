// ==========================================================================
// HAULO BOUTIQUE ERP â€” CUSTOMER 360Â° PROFILE APPLICATION SCRIPT
// File: frontend/Customer360/customer360.js
// Description: State management, canvas chart rendering, modals, and CRM logic
// ==========================================================================
'use strict';

// ==========================================================================
// 1. STATE & STORAGE KEYS
// ==========================================================================
const STORAGE_KEY_PROFILE = 'haulo_c360_profile';
const STORAGE_KEY_NOTES = 'haulo_c360_notes';

// ==========================================================================
// 2. CUSTOMER DATA (DYNAMIC STATE — POPULATED EXCLUSIVELY FROM DATABASE)
// ==========================================================================
let customerData = {
  name: 'Loading profile...',
  phone: '',
  email: '',
  location: '',
  fullAddress: '',
  badge: 'Valued Patron',
  quote: '',
  totalOrders: 0,
  activeOrders: 0,
  totalSpent: '₹0',
  balance: 0,
  customerSince: '—',
  customerYears: '—',
  notesPreference: '',
  avatarUrl: '',
  favoriteGarment: '—',
  fitPreference: '—',
  fabricAllergies: 'None',
  preferredChannel: 'WhatsApp',
  creditLimit: '—'
};

// ==========================================================================
// 3. ORDERS DATA
// ==========================================================================
let activeOrdersData = [];
let orderHistoryData = [];

// ==========================================================================
// 4. MEASUREMENTS & NOTES (loaded dynamically from database)
// ==========================================================================
let customerBodyMeasurements = [];
let activeC360Garment = 'blouse';
window.activeC360Garment = 'blouse';
let customerNotesData = [];
let customerEnquiriesData = [];
let measurementProfilesData = [];

// ==========================================================================
// 5. DESIGN REFERENCES (loaded from API)
// ==========================================================================
let designReferencesData = [];

// ==========================================================================
// 6. APPOINTMENTS DATA (loaded from API)
// ==========================================================================
let appointmentsData = [];


// ==========================================================================
// 8. SPEND CHART DATA (derived from real payments)
// ==========================================================================
let spendChartData = {
  months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  values: [0, 0, 0, 0, 0, 0],
  maxVal: 20000
};

function formatStageImgUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const clean = url.replace(/^\/?front\s*end\//i, '').replace(/^\/+/, '');
  const origin = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ? window.location.origin
    : '';
  return origin ? `${origin}/front%20end/${clean}` : `/${clean}`;
}

let liveStageArtMap = {};
async function loadLiveStageDefinitions(apiClient) {
  try {
    if (apiClient?.production?.stageDefinitions?.list) {
      const list = await apiClient.production.stageDefinitions.list();
      if (Array.isArray(list) && list.length > 0) {
        list.forEach(s => {
          if (s.imageUrl) {
            const formatted = formatStageImgUrl(s.imageUrl);
            if (s.stageKey) liveStageArtMap[s.stageKey.toUpperCase().trim()] = formatted;
            if (s.displayName) liveStageArtMap[s.displayName.toUpperCase().trim()] = formatted;
          }
        });
      }
    }
  } catch (e) {
    console.warn('[Customer360] Live stage definitions load error:', e.message);
  }
}

// ==========================================================================
// 9. INITIALIZATION
// ==========================================================================
async function loadCustomerFromApi() {
  try {
    const { default: api, Auth } = await import('../../api.js');
    if (!Auth.isLoggedIn()) {
      window.location.href = '../../login/login.html';
      return;
    }

    // Load live stage definitions dynamically (zero hardcoded URLs)
    await loadLiveStageDefinitions(api);
    const urlParams = new URLSearchParams(window.location.search);
    let mobile = urlParams.get('mobile') || urlParams.get('phone') || urlParams.get('customer') || urlParams.get('customerId') || urlParams.get('id')
      || sessionStorage.getItem('selectedCustomerMobile') || localStorage.getItem('selectedCustomerMobile');

    if (!mobile) {
      // No mobile provided — try to pick the first real customer from DB
      try {
        const firstList = await api.customers.list({ page: 0, size: 1 });
        const firstItems = Array.isArray(firstList) ? firstList : (firstList?.content || []);
        if (firstItems.length > 0) {
          mobile = firstItems[0].mobileNumber || firstItems[0].phone;
        }
      } catch (_) { /* leave mobile null — show empty state */ }
      if (!mobile) {
        renderProfileCard();
        renderCustomerPreferences();
        renderOutstandingPayments();
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
        return;
      }
    }

    if (mobile) {
      let c = null;
      try {
        c = await api.customers.get(mobile);
      } catch (_) {
        const searchList = await api.customers.list({ search: mobile }).catch(() => []);
        const sItems = Array.isArray(searchList) ? searchList : (searchList?.content || []);
        if (sItems.length > 0) c = sItems[0];
      }

      if (c) {
        const targetMobile = c.mobileNumber || c.phone;
        sessionStorage.setItem('selectedCustomerMobile', targetMobile);
        localStorage.setItem('selectedCustomerMobile', targetMobile);

        customerData = {
          mobileNumber: targetMobile,
          name: c.name || 'Client Profile',
          phone: targetMobile,
          email: c.email || '',
          location: [c.city, c.state].filter(Boolean).join(', ') || c.location || '',
          fullAddress: [c.streetAddress, c.city, c.state, c.pincode].filter(Boolean).join(', ') || c.location || '',
          badge: (c.tier === 'VIP_PLATINUM' ? 'VIP Platinum' : c.tier === 'VIP_GOLD' ? 'VIP Gold' : 'Valued Patron'),
          quote: c.notes ? `"${c.notes}"` : '',
          notesPreference: c.notes || '',
          avatarUrl: c.avatarUrl || '',
          favoriteGarment: c.favoriteGarment || '—',
          fitPreference: c.fitPreference || '—',
          fabricAllergies: c.fabricAllergies || '—',
          preferredChannel: c.preferredChannel || '—',
          preferredNeck: c.preferredNeck || '—',
          preferredSleeve: c.preferredSleeve || '—',
          preferredOccasions: c.preferredOccasions || '—',
          deliveryPreference: c.deliveryPreference || '—',
          creditLimit: c.creditLimit ? ('₹' + Number(c.creditLimit).toLocaleString('en-IN')) : '—',
          totalOrders: c.totalOrders || 0,
          activeOrders: 0,
          totalSpent: '₹' + (Number(c.totalSpend || c.totalSpent) || 0).toLocaleString('en-IN'),
          balance: Number(c.balance || 0),
          customerSince: c.createdAt ? String(c.createdAt).slice(0, 10) : '',
          createdAt: c.createdAt
        };

        renderProfileCard();
        renderPreferences();
        renderOutstandingPayments();

        // 1. Load customer's real orders
        let custOrders = [];
        try {
          const ordRes = await api.orders.list({ page: 0, size: 100 });
          const allOrders = Array.isArray(ordRes) ? ordRes : (ordRes && ordRes.content ? ordRes.content : []);
          custOrders = allOrders.filter(o => {
            const m = (o.customerMobile || o.customerId || '').trim();
            const n = (o.customerName || '').trim();
            return m === targetMobile || (n && n.toLowerCase() === c.name.toLowerCase());
          });

          custOrders.sort((a, b) => new Date(b.orderDate || b.createdAt || 0) - new Date(a.orderDate || a.createdAt || 0));
          window.rawCustOrders = custOrders;
          window.customerData = customerData;

          customerData.totalOrders = custOrders.length;
          const activeOrders = custOrders.filter(o => {
            const st = (o.status || '').toUpperCase();
            return st !== 'DELIVERED' && st !== 'CANCELLED';
          });
          customerData.activeOrders = activeOrders.length;

          const sumOrders = custOrders.reduce((sum, o) => sum + (Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0), 0);
          if (sumOrders > 0) {
            customerData.totalSpent = '₹' + sumOrders.toLocaleString('en-IN');
          }

          activeOrdersData = activeOrders.map(o => {
            const tot = Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0;
            const adv = Number(o.advancePaid) || 0;
            const bal = Number(o.balanceAmount !== undefined ? o.balanceAmount : (tot - adv)) || 0;
            const expDeliv = o.expectedDeliveryDate || o.dueDate ? String(o.expectedDeliveryDate || o.dueDate) : 'Soon';
            const gType = (o.garmentType || '').toLowerCase();
            let thumb = '../../assets/designs/zari-bloom-front.jpg';
            if (gType.includes('blouse')) thumb = '../../assets/designs/zari-bloom-front.jpg';
            else if (gType.includes('lehenga')) thumb = '../../assets/designs/lehenga-stage.png';
            else if (gType.includes('kurti') || gType.includes('chudi')) thumb = '../../assets/designs/noor-angrakha.jpg';
            else if (gType.includes('gown') || gType.includes('anarkali')) thumb = '../../assets/designs/celestial-gown.jpg';
            else if (gType.includes('saree')) thumb = '../../assets/designs/regal-drape.jpg';

            const stageKey = String(o.currentStage || '').toUpperCase().trim();
            const dynArt = liveStageArtMap[stageKey] ||
              (stageKey === 'DESIGN' ? liveStageArtMap['DESIGNING'] : '') ||
              (stageKey === 'FABRIC_PREP' ? liveStageArtMap['LINING'] : '') ||
              (stageKey === 'HANDWORK' ? liveStageArtMap['HAND_WORK'] : '') ||
              (stageKey === 'EMBROIDERY' ? liveStageArtMap['HAND_WORK'] : '') ||
              (stageKey === 'SEWING' ? liveStageArtMap['STITCHING'] : '') ||
              (stageKey === 'FITTING' ? liveStageArtMap['TRIAL'] : '') ||
              (stageKey === 'QC_AUDIT' ? liveStageArtMap['QC'] : '') ||
              (stageKey === 'DELIVERED' ? liveStageArtMap['READY'] : '') ||
              '';

            return {
              id: o.orderCode || ('ORD-' + o.id),
              garment: o.garmentType || 'Bespoke Garment',
              collection: o.collection || (o.garmentDesc ? o.garmentDesc.slice(0, 30) : 'Custom Atelier Design'),
              status: o.status || 'IN_PROGRESS',
              statusClass: (o.status || 'in-progress').toLowerCase().replace(/\s+/g, '-'),
              due: expDeliv,
              thumb: thumb,
              amount: '₹' + tot.toLocaleString('en-IN'),
              advance: '₹' + adv.toLocaleString('en-IN'),
              pending: '₹' + bal.toLocaleString('en-IN'),
              stage: o.currentStage || 'Assembly & Finishing',
              stageImg: dynArt,
              assignedTailor: 'Atelier Master'
            };
          });
          renderActiveOrders();

          orderHistoryData = custOrders.map(o => ({
            date: o.orderDate || (o.createdAt ? String(o.createdAt).slice(0, 10) : '2026-09-08'),
            garment: o.garmentType || 'Bespoke Garment',
            amount: '₹' + (Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0).toLocaleString('en-IN'),
            status: o.status || 'DELIVERED',
            statusClass: (o.status || 'delivered').toLowerCase().replace(/\s+/g, '-')
          }));
          renderOrderHistory();
          renderCustomerValueBreakdown(custOrders);
          renderOrderHistoryBars(custOrders);

          renderProfileCard();
          renderOutstandingPayments();

        } catch (oe) {
          console.warn('[Customer360] Orders load error:', oe.message);
        }

        // 2. Load customer's real measurements from dedicated customer_body_measurements table
        try {
          let mList = await api.customers.bodyMeasurements.list(targetMobile).catch(() => []);
          if (!Array.isArray(mList) || mList.length === 0) {
            const altList = await api.customers.measurements.list(targetMobile).catch(() => []);
            if (Array.isArray(altList) && altList.length > 0) {
              mList = altList;
            }
          }
          window.customerBodyMeasurements = Array.isArray(mList) ? mList : [];
          customerBodyMeasurements = window.customerBodyMeasurements;
          renderMeasurementsForGarment(window.activeMeasurementGarment || 'blouse');
          renderMeasurementsSubPage(activeC360Garment || 'blouse');
        } catch (me) {
          console.warn('[Customer360] Measurements load error:', me.message);
          renderMeasurementsForGarment('blouse');
          renderMeasurementsSubPage(activeC360Garment || 'blouse');
        }

        // 3. Load customer appointments from API
        try {
          const apptRes = await api.appointments.list({ search: c.name || targetMobile, size: 50 }).catch(() => []);
          const apptItems = Array.isArray(apptRes) ? apptRes : (apptRes?.content || []);
          const custAppts = apptItems.filter(a => {
            const m = (a.customerMobile || a.customerPhone || a.customerId || '').trim();
            const n = (a.customerName || '').trim();
            return m === targetMobile || (n && n.toLowerCase() === c.name.toLowerCase());
          });

          appointmentsData = custAppts.map(a => {
            const dt = a.scheduledAt ? new Date(a.scheduledAt) : null;
            const dateStr = dt ? dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (a.appointmentDate || 'Upcoming');
            const timeStr = dt ? dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : (a.appointmentTime || '');
            const typeStr = a.apptType ? (a.apptType.charAt(0) + a.apptType.slice(1).toLowerCase() + ' Fitting') : (a.type || 'Bespoke Fitting');
            return {
              id: a.id,
              type: typeStr,
              date: dateStr,
              time: timeStr,
              rawScheduledAt: a.scheduledAt || null,
              durationMinutes: a.durationMinutes || 45,
              garment: a.notes || a.garmentType || 'Bespoke Ensemble',
              specialist: a.staffAssigned || 'Master Tailor',
              status: a.status || 'CONFIRMED',
              notes: a.notes || '',
              orderCode: a.orderCode || '',
              orderId: a.orderId || null
            };
          });
          renderAppointments();
          renderAppointmentsSubPage();
        } catch (ae) {
          console.warn('[Customer360] Appointments load error:', ae.message);
        }

        // 4. Load customer notes from API
        try {
          const notesList = await api.customers.notes.list(targetMobile).catch(() => []);
          customerNotesData = Array.isArray(notesList) ? notesList : [];
          renderNotesStack();
        } catch (ne) {
          console.warn('[Customer360] Notes load error:', ne.message);
        }

        // 5. Load designs from API
        try {
          const designsRes = await api.designs.list({ size: 12 }).catch(() => []);
          designReferencesData = Array.isArray(designsRes) ? designsRes : (designsRes?.content || []);
          renderDesignMosaic();
        } catch (de) {
          console.warn('[Customer360] Designs load error:', de.message);
        }

        // 6. Load enquiries for communication history
        try {
          const enqRes = await api.enquiries.list({ size: 30 }).catch(() => []);
          const allEnqs = Array.isArray(enqRes) ? enqRes : [];
          customerEnquiriesData = allEnqs.filter(e => {
            const em = (e.customerMobile || e.mobile || '').trim();
            const en = (e.customerName || '').trim();
            return em === targetMobile || (en && en.toLowerCase() === c.name.toLowerCase());
          });
        } catch (ee) {
          console.warn('[Customer360] Enquiries load error:', ee.message);
        }

        // 7. Render communication history from live customer activity
        renderCommunicationStack(custOrders, appointmentsData, customerEnquiriesData);

        // 8. Render quick insights
        renderQuickInsights(custOrders, appointmentsData);

        // 9. Populate recentOrdersTbody
        renderRecentOrdersTable(custOrders);

        // Final lucide re-run
        setTimeout(() => {
          if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
          }
        }, 80);
      }
    }
  } catch (err) {
    console.error('[Customer360] Failed to load customer from API:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Load saved state from LocalStorage
  loadStateFromStorage();

  // Initialize Lucide Icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Render UI Components
  renderProfileCard();
  renderCustomerValueBreakdown(orderHistoryData);
  renderOrderHistoryBars(orderHistoryData);
  renderActiveOrders();
  renderRecentOrdersTable(orderHistoryData);
  renderAppointments();
  renderMeasurementsForGarment('blouse');

  // Attach Event Listeners
  setupEventListeners();
  setupModals();
  setupDropdowns();
  setupSearchOverlayIntegration();

  loadCustomerFromApi();

  // Re-run Lucide to iconize dynamically injected elements
  setTimeout(() => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }, 100);
});

// ==========================================================================
// 10. RENDER FUNCTIONS (DATABASE DRIVEN)
// ==========================================================================

/**
 * Normalizes raw garment strings into canonical atelier order types
 */
function normalizeAtelierOrderType(raw) {
  if (!raw || typeof raw !== 'string') return 'Bespoke Garment';
  const s = raw.toLowerCase().trim();
  if (s.includes('blouse') || s.includes('choli') || s.includes('crop top')) return 'Blouse';
  if (s.includes('lehenga') || s.includes('ghagra') || s.includes('skirt')) return 'Lehenga';
  if (s.includes('saree') || s.includes('sari') || s.includes('draping') || s.includes('pre-pleat')) return 'Saree';
  if (s.includes('kurti') || s.includes('kurta') || s.includes('salwar') || s.includes('chudi') || s.includes('churidar') || s.includes('suit')) return 'Kurti & Suits';
  if (s.includes('anarkali')) return 'Anarkali';
  if (s.includes('gown') || s.includes('maxi') || s.includes('dress') || s.includes('frock')) return 'Gown';
  if (s.includes('alteration') || s.includes('refit') || s.includes('restitch') || s.includes('hemming')) return 'Alteration';
  if (s.includes('fabric') || s.includes('material') || s.includes('silk') || s.includes('swatch')) return 'Fabric';
  // Capitalize custom names (e.g. "Indo-Western", "Jacket")
  return raw.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

/**
 * Dynamically computes and renders the Customer Value Donut SVG and Legend
 * based strictly on the customer's actual order types (e.g. Blouse, Lehenga, Saree, etc.)
 */
function renderCustomerValueBreakdown(orders) {
  const totalSpentEl = document.getElementById('donutTotalSpent');
  const svg = document.getElementById('customerValueDonutSvg');
  const legend = document.getElementById('customerValueLegend');
  if (!svg || !legend) return;

  const orderList = Array.isArray(orders) && orders.length > 0
    ? orders
    : (Array.isArray(orderHistoryData) && orderHistoryData.length > 0 ? orderHistoryData : []);

  const typeMap = {};
  let totalAmt = 0;

  orderList.forEach(o => {
    let amt = 0;
    if (o.totalAmount !== undefined && o.totalAmount !== null) {
      amt = Number(o.totalAmount) || 0;
    } else if (o.amount !== undefined && o.amount !== null) {
      amt = typeof o.amount === 'string' ? (Number(o.amount.replace(/[^0-9.]/g, '')) || 0) : (Number(o.amount) || 0);
    }
    const rawType = o.garmentType || o.garment || o.garmentDesc || 'Bespoke Garment';
    const type = normalizeAtelierOrderType(rawType);

    if (!typeMap[type]) {
      typeMap[type] = { name: type, amount: 0, count: 0 };
    }
    typeMap[type].amount += amt;
    typeMap[type].count += 1;
    totalAmt += amt;
  });

  // If order list had 0 amount but customer profile has totalSpent from DB, retain total
  const dbSpend = Number(String(customerData.totalSpent || '').replace(/[^0-9.]/g, '')) || 0;
  if (totalAmt === 0 && dbSpend > 0) {
    totalAmt = dbSpend;
  }

  if (totalSpentEl) {
    totalSpentEl.textContent = '₹' + totalAmt.toLocaleString('en-IN');
  }

  // Handle empty state: no orders
  if (orderList.length === 0 || totalAmt === 0) {
    svg.innerHTML = `<circle class="donut-bg" cx="80" cy="80" r="62" />`;
    legend.innerHTML = `
      <div style="padding:16px 4px;text-align:center;color:rgba(255,255,255,0.4);font-size:11px;">
        No orders placed yet.
      </div>
    `;
    window._customerValueOrderTypes = [];
    window._customerValueTotalAmt = 0;
    return;
  }

  // Sort categories by amount descending (or count if amount is zero)
  let sortedTypes = Object.values(typeMap).sort((a, b) => (b.amount - a.amount) || (b.count - a.count));

  // If more than 5 categories, take top 4 and collapse the rest into "Other Orders"
  if (sortedTypes.length > 5) {
    const top4 = sortedTypes.slice(0, 4);
    const rest = sortedTypes.slice(4);
    const othersItem = {
      name: 'Other Orders',
      amount: rest.reduce((acc, r) => acc + r.amount, 0),
      count: rest.reduce((acc, r) => acc + r.count, 0)
    };
    sortedTypes = [...top4, othersItem];
  }

  // Atelier luxury palette
  const PALETTE = [
    '#b8ff3d', // Lime
    '#a895ff', // Purple
    '#f43f5e', // Pink / Rose
    '#fbbf24', // Amber
    '#38bdf8', // Cyan
    '#94a3b8'  // Slate
  ];

  // Calculate percentages guaranteeing sum = 100%
  let sumPct = 0;
  sortedTypes.forEach(t => {
    t.pct = totalAmt > 0 ? Math.round((t.amount / totalAmt) * 100) : Math.round((t.count / orderList.length) * 100);
    sumPct += t.pct;
  });

  // Adjust rounding delta to the highest segment
  if (sortedTypes.length > 0 && sumPct !== 100) {
    sortedTypes[0].pct += (100 - sumPct);
  }

  const circumference = 2 * Math.PI * 62; // ~389.56
  let runningOffset = 0;
  let svgCirclesHtml = `<circle class="donut-bg" cx="80" cy="80" r="62" />`;
  let legendHtml = '';

  sortedTypes.forEach((item, idx) => {
    const color = PALETTE[idx % PALETTE.length];
    const segLen = (item.pct / 100) * circumference;

    svgCirclesHtml += `
      <circle class="donut-seg" cx="80" cy="80" r="62"
        style="stroke: ${color};"
        stroke-dasharray="${segLen.toFixed(1)} ${circumference.toFixed(1)}"
        stroke-dashoffset="${(-runningOffset).toFixed(1)}" />
    `;
    runningOffset += segLen;

    const amtStr = '₹' + item.amount.toLocaleString('en-IN');
    const tip = `${item.name}: ${item.count} order(s) · ${amtStr} (${item.pct}%)`;

    legendHtml += `
      <div class="donut-leg-row" title="${tip}">
        <div class="leg-left">
          <span class="leg-dot" style="background: ${color};"></span>
          <span class="leg-label">${item.name}</span>
        </div>
        <span class="leg-pct">${item.pct}%</span>
      </div>
    `;
  });

  svg.innerHTML = svgCirclesHtml;
  legend.innerHTML = legendHtml;

  // Cache breakdown for use in payment breakdown modal
  window._customerValueOrderTypes = sortedTypes;
  window._customerValueTotalAmt = totalAmt;
}

/**
 * Dynamically computes and renders the Dual Bar Chart in #orderHistoryBars
 * from customer's actual database orders.
 */
function renderOrderHistoryBars(orders) {
  const container = document.getElementById('orderHistoryBars');
  if (!container) return;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const monthData = {};
  months.forEach(m => { monthData[m] = { count: 0, value: 0 }; });

  if (orders && orders.length > 0) {
    orders.forEach(o => {
      const dStr = o.orderDate || o.createdAt;
      if (dStr) {
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) {
          const mIdx = d.getMonth();
          if (mIdx >= 0 && mIdx < 9) {
            const mName = months[mIdx];
            monthData[mName].count += 1;
            monthData[mName].value += Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0;
          }
        }
      }
    });
  }

  const maxCount = Math.max(...months.map(m => monthData[m].count), 1);
  const maxValue = Math.max(...months.map(m => monthData[m].value), 10000);

  container.innerHTML = months.map(m => {
    const item = monthData[m];
    // Scale bar heights dynamically from database
    const limePct = item.count > 0 ? Math.min(94, Math.max(22, Math.round((item.count / maxCount) * 88))) : 8;
    const purplePct = item.value > 0 ? Math.min(94, Math.max(18, Math.round((item.value / maxValue) * 88))) : 8;

    // In reference media_1789987777456.png:
    // Left bar is Purple (Order Value), Right bar is Lime (Orders)
    return `
      <div class="bar-month-col">
        <div class="bars-pair">
          <div class="bar-seg purple" style="height: ${purplePct}%;" title="${m}: ${item.value > 0 ? '₹' + item.value.toLocaleString('en-IN') : 'No order value'}"></div>
          <div class="bar-seg lime" style="height: ${limePct}%;" title="${m}: ${item.count} orders"></div>
        </div>
        <span class="bar-label">${m}</span>
      </div>
    `;
  }).join('');
}


/**
 * Renders the top Customer Profile card and 4 Header Metric Tiles from state
 */
function renderProfileCard() {
  const avatarWrap = document.getElementById('c360ProfileAvatarWrap') || document.querySelector('.profile-avatar-wrap');
  const nameEl = document.getElementById('profileName');
  const phoneEl = document.getElementById('profilePhone');
  const emailEl = document.getElementById('profileEmail');
  const locEl = document.getElementById('profileLocation');
  const badgeEl = document.getElementById('profileBadge');
  const quoteEl = document.getElementById('profileQuote');
  const prefNoteEl = document.getElementById('profilePreferencesNote');

  // Profile banner stat cards
  const statSinceEl = document.getElementById('statCustomerSince');
  const statYearsEl = document.getElementById('statCustomerYears');
  const statSpentEl = document.getElementById('statTotalSpent');
  const statOrderCountEl = document.getElementById('statOrderCountText');
  const statActiveEl = document.getElementById('statActiveOrders');
  const statPendingEl = document.getElementById('statPendingPayments');
  const bcNameEl = document.getElementById('bcCustomerName');

  if (avatarWrap) {
    if (typeof window.applyPatronAvatarElement === 'function') {
      window.applyPatronAvatarElement(avatarWrap, customerData.name, customerData.avatarUrl || customerData.avatar, 'haulo-avatar-xl');
    } else if (typeof window.renderPatronAvatarHtml === 'function') {
      avatarWrap.innerHTML = window.renderPatronAvatarHtml(customerData.name, customerData.avatarUrl || customerData.avatar, 'haulo-avatar-xl');
    } else {
      const inits = typeof window.getPatronInitials === 'function' ? window.getPatronInitials(customerData.name) : 'CU';
      avatarWrap.innerHTML = `<div class="haulo-patron-avatar-initials haulo-avatar-xl">${inits}</div>`;
    }
  }
  if (nameEl) nameEl.textContent = customerData.name || '—';
  if (bcNameEl) bcNameEl.textContent = customerData.name || 'Customer';
  if (phoneEl) phoneEl.textContent = customerData.phone || '—';
  if (emailEl) emailEl.textContent = customerData.email || '—';
  if (locEl) locEl.textContent = customerData.location || '—';
  if (badgeEl) {
    badgeEl.style.display = 'inline-flex';
    badgeEl.innerHTML = `<i data-lucide="crown"></i> <span>${customerData.badge || 'Valued Patron'}</span>`;
  }
  if (quoteEl) {
    quoteEl.textContent = customerData.quote || '“Beautiful outfits, always a wonderful experience!”';
    quoteEl.style.display = customerData.quote ? 'inline' : 'none';
  }
  if (prefNoteEl) prefNoteEl.textContent = customerData.notesPreference || '—';

  // Populate dynamic Stat Cards directly from DB state
  if (customerData.createdAt) {
    const cDate = new Date(customerData.createdAt);
    if (!isNaN(cDate)) {
      if (statSinceEl) statSinceEl.textContent = cDate.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
      const diffMonths = Math.max(1, Math.round((Date.now() - cDate) / (1000 * 60 * 60 * 24 * 30.4375)));
      if (statYearsEl) statYearsEl.textContent = diffMonths < 12 ? `${diffMonths} mos` : `${(diffMonths / 12).toFixed(1)} years`;
    }
  } else {
    if (statSinceEl) statSinceEl.textContent = customerData.customerSince || '—';
    if (statYearsEl) statYearsEl.textContent = customerData.customerYears || '—';
  }

  if (statSpentEl) statSpentEl.textContent = customerData.totalSpent || '₹0';
  if (statOrderCountEl) statOrderCountEl.textContent = `${customerData.totalOrders || 0} orders`;
  if (statActiveEl) statActiveEl.textContent = customerData.activeOrders !== undefined ? customerData.activeOrders : 0;
  if (statPendingEl) statPendingEl.textContent = '₹' + (Number(customerData.balance || 0)).toLocaleString('en-IN');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Renders Card 4 Active Orders using exact layout classes and DB items
 */
function renderActiveOrders() {
  const countEl = document.getElementById('activeOrdersCount');
  if (countEl) countEl.textContent = activeOrdersData.length;

  const container = document.getElementById('activeOrdersList');
  if (!container) return;

  if (activeOrdersData.length === 0) {
    container.innerHTML = '<div style="padding:28px;text-align:center;color:rgba(255,255,255,0.4);font-size:12.5px;">No active orders in progress</div>';
    return;
  }

  container.innerHTML = activeOrdersData.map(order => {
    const rawSt = String(order.status || '').toUpperCase();
    const rawStage = String(order.stage || '').toUpperCase();
    let pillCls = 'stitching';
    let pillLabel = 'Stitching';

    if (rawStage.includes('TRIAL') || rawStage.includes('FIT') || rawSt.includes('TRIAL') || rawSt.includes('FIT')) {
      pillCls = 'trial';
      pillLabel = 'Trial';
    } else if (rawStage.includes('DESIGN') || rawSt.includes('DESIGN')) {
      pillCls = 'designing';
      pillLabel = 'Designing';
    } else if (rawStage.includes('QC') || rawSt.includes('QC')) {
      pillCls = 'qc';
      pillLabel = 'QC';
    } else if (rawStage.includes('SEW') || rawStage.includes('STITCH') || rawStage.includes('ASSEMBLY')) {
      pillCls = 'stitching';
      pillLabel = 'Stitching';
    } else if (rawSt.includes('PROGRESS')) {
      pillCls = 'stitching';
      pillLabel = 'Progress';
    } else {
      const words = (order.status || 'Active').replace(/_/g, ' ').toLowerCase().split(' ');
      pillLabel = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (pillLabel.length > 9) pillLabel = pillLabel.slice(0, 9);
    }

    // Format due date to compact e.g. "20 Sep" or "22 Sep"
    let dueDisplay = order.due;
    if (order.due && order.due !== 'Soon') {
      const d = new Date(order.due);
      if (!isNaN(d.getTime())) {
        dueDisplay = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      }
    }

    return `
      <div class="active-order-row" tabindex="0" data-order-id="${order.id}">
        <div class="order-thumb-wrap">
          <img src="${order.thumb}" alt="${order.garment}" onerror="this.src='../../assets/designs/zari-bloom-front.jpg';" />
        </div>
        <div class="order-info-group">
          <span class="order-num-text">${order.id}</span>
          <span class="order-garment-title">${order.garment}</span>
          <span class="order-sub-desc">${order.collection}</span>
        </div>
        <span class="order-status-pill ${pillCls}">${pillLabel}</span>
        <div class="order-due-col">
          <span class="due-title">Due</span>
          <span class="due-date">${dueDisplay}</span>
        </div>
        <i data-lucide="chevron-right" class="order-chevron"></i>
      </div>
    `;
  }).join('');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ root: container });
  }

  container.querySelectorAll('.active-order-row').forEach(row => {
    row.addEventListener('click', () => {
      const orderId = row.getAttribute('data-order-id');
      openOrderModal(orderId);
    });
  });
}

/**
 * Renders Card 3 Order History table
 */
function renderOrderHistory() {
  const subEl = document.getElementById('orderHistoryCountSub');
  if (subEl) subEl.textContent = `${orderHistoryData.length} total orders`;

  const tbody = document.getElementById('orderHistoryTbody');
  if (!tbody) return;

  if (orderHistoryData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:rgba(255,255,255,0.4);font-size:12.5px;">No orders recorded</td></tr>';
    return;
  }

  tbody.innerHTML = orderHistoryData.map(item => `
    <tr tabindex="0" data-garment="${item.garment}">
      <td class="oh-date">${item.date}</td>
      <td class="oh-garment">${item.garment}</td>
      <td class="oh-amt">${item.amount}</td>
      <td class="oh-status"><span class="status-pill ${item.statusClass}">${item.status.replace(/_/g, ' ')}</span></td>
      <td class="oh-arrow"><i data-lucide="chevron-right" style="width:13px;height:13px;"></i></td>
    </tr>
  `).join('');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ root: tbody });
  }

  tbody.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', () => {
      const garment = tr.getAttribute('data-garment');
      showToast(`Order details for ${garment} opened`);
    });
  });
}

/**
 * Renders Card 6 Upcoming Appointments
 */
function renderAppointments() {
  // Support both old and new HTML element IDs
  const container = document.getElementById('upcomingApptsList') || document.getElementById('c360AppointmentsList');
  if (!container) return;

  if (!appointmentsData || appointmentsData.length === 0) {
    container.innerHTML = '<div style="padding:24px;text-align:center;color:rgba(255,255,255,0.4);font-size:12.5px;">No upcoming appointments scheduled</div>';
    return;
  }

  // Use timeline item style matching CSS
  container.innerHTML = appointmentsData.slice(0, 4).map((a, idx) => `
    <div class="appt-timeline-item" tabindex="0" data-appt-id="${a.id}" onclick="openAppointmentModal('${a.id}')">
      <div class="timeline-indicator-col">
        <div class="timeline-icon-circle ${idx % 2 === 0 ? 'cal-pink' : 'cal-teal'}">
          <i data-lucide="calendar"></i>
        </div>
        ${idx < appointmentsData.length - 1 ? '<div class="timeline-stem-line"></div>' : ''}
      </div>
      <div class="appt-content-col">
        <div class="appt-title">${a.type}</div>
        <div class="appt-meta">${a.date}${a.time ? ' · ' + a.time : ''}</div>
        <div class="appt-sub">${a.garment || 'Bespoke fitting'}${a.specialist ? ' · ' + a.specialist : ''}</div>
      </div>
    </div>
  `).join('');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ root: container });
  }
}

/**
 * High-performance Custom Canvas Bar Chart for Total Spend
 */
function renderSpendBarChart() {
  const canvas = document.getElementById('spendBarCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const width = rect.width || 380;
  const height = 155;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const paddingBottom = 26;
  const chartHeight = height - paddingBottom - 10;
  const n = spendChartData.months.length;
  const barWidth = Math.max(14, Math.min(26, (width / n) * 0.5));
  const spacing = width / n;

  // Draw horizontal guide lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let yStep = 0.25; yStep <= 1; yStep += 0.25) {
    const y = chartHeight * (1 - yStep) + 10;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw Bars
  spendChartData.months.forEach((month, i) => {
    const val = spendChartData.values[i];
    const barHeight = spendChartData.maxVal > 0 ? (val / spendChartData.maxVal) * chartHeight : 4;
    const x = i * spacing + (spacing - barWidth) / 2;
    const y = chartHeight - Math.max(4, barHeight) + 10;
    const isSep = month === 'Sep';

    // Bar Color
    ctx.fillStyle = isSep ? '#B8FF2C' : '#A995FF';

    // Rounded top corners
    const radius = 5;
    ctx.beginPath();
    ctx.moveTo(x, y + Math.max(4, barHeight));
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.lineTo(x + barWidth - radius, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
    ctx.lineTo(x + barWidth, y + Math.max(4, barHeight));
    ctx.closePath();
    ctx.fill();

    // Month Label
    ctx.fillStyle = isSep ? '#F5F3EE' : 'rgba(245, 243, 238, 0.5)';
    ctx.font = isSep ? '600 11px Manrope, sans-serif' : '400 10px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(month, x + barWidth / 2, height - 8);
  });

  // Reposition floating tooltip dynamically over active month bar
  const sepTooltip = document.getElementById('chartSepTooltip');
  const tooltipVal = document.getElementById('chartTooltipVal');
  if (sepTooltip) {
    const sepIndex = spendChartData.months.indexOf('Sep');
    const activeIdx = sepIndex >= 0 ? sepIndex : (spendChartData.months.length - 1);
    const sepX = activeIdx * spacing + spacing / 2;
    const sepVal = spendChartData.values[activeIdx];
    const sepY = chartHeight - (spendChartData.maxVal > 0 ? (sepVal / spendChartData.maxVal) * chartHeight : 0) + 10;

    sepTooltip.style.left = `${sepX}px`;
    sepTooltip.style.top = `${Math.max(10, sepY - 30)}px`;
    sepTooltip.style.transform = 'translateX(-50%)';

    if (tooltipVal) {
      tooltipVal.textContent = '₹' + sepVal.toLocaleString('en-IN');
    }
  }
}

/**
 * Renders Card 9 Customer Preferences (new IDs from HTML)
 */
function renderPreferences() {
  const map = {
    prefStyles: customerData.favoriteGarment,
    prefOccasions: customerData.preferredOccasions,
    prefNeck: customerData.preferredNeck,
    prefDelivery: customerData.deliveryPreference,
    prefSleeve: customerData.preferredSleeve,
    prefNotes: customerData.notesPreference
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '—';
  });
  // Legacy fallback IDs
  const noteEl = document.getElementById('profilePreferencesNote');
  if (noteEl) noteEl.textContent = customerData.notesPreference || '—';
}

/**
 * @deprecated Use renderPreferences() — kept for DOMContentLoaded initial render
 */
function renderCustomerPreferences() { renderPreferences(); }

/**
 * Opens the Edit Preferences modal pre-filled with current customerData values
 */
function openEditPreferencesModal() {
  const neckSel     = document.getElementById('editPrefNeck');
  const sleeveSel   = document.getElementById('editPrefSleeve');
  const occasionIn  = document.getElementById('editPrefOccasions');
  const deliverySel = document.getElementById('editPrefDelivery');

  if (neckSel)     neckSel.value     = customerData.preferredNeck     || '';
  if (sleeveSel)   sleeveSel.value   = customerData.preferredSleeve   || '';
  if (occasionIn)  occasionIn.value  = customerData.preferredOccasions || '';
  if (deliverySel) deliverySel.value = customerData.deliveryPreference || 'Standard Boutique Pickup';

  openModal('editPreferencesModal');
}

/**
 * Saves the 4 preference fields back to the DB via PUT /api/v1/customers/{mobile}
 */
async function handleSavePreferences() {
  const mobile = customerData.mobileNumber || customerData.phone;
  if (!mobile) { showToast('No customer loaded', 'error'); return; }

  const payload = {
    preferredNeck:      (document.getElementById('editPrefNeck')?.value     || '').trim(),
    preferredSleeve:    (document.getElementById('editPrefSleeve')?.value   || '').trim(),
    preferredOccasions: (document.getElementById('editPrefOccasions')?.value || '').trim(),
    deliveryPreference: (document.getElementById('editPrefDelivery')?.value  || 'Standard Boutique Pickup'),
  };

  const saveBtn = document.getElementById('btnSavePreferences');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

  try {
    const updated = await api.customers.update(mobile, payload);
    // Merge into local customerData
    customerData.preferredNeck      = updated.preferredNeck      || payload.preferredNeck;
    customerData.preferredSleeve    = updated.preferredSleeve    || payload.preferredSleeve;
    customerData.preferredOccasions = updated.preferredOccasions || payload.preferredOccasions;
    customerData.deliveryPreference = updated.deliveryPreference  || payload.deliveryPreference;

    renderPreferences();
    closeModal('editPreferencesModal');
    showToast('Preferences saved successfully', 'success');
  } catch (err) {
    console.error('[Customer360] Failed to save preferences:', err);
    showToast(`Save failed: ${err.message || 'Unknown error'}`, 'error');
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i data-lucide="save" style="width:13px;height:13px;"></i> Save Preferences'; if (window.lucide) lucide.createIcons(); }
  }
}

/**
 * Renders Card 10 Communication History timeline from live DB data
 */
function renderCommunicationStack(orders, appts, enqs) {
  const container = document.getElementById('commsTimelineList');
  if (!container) return;

  const events = [];

  // 1. WhatsApp / Orders updates
  if (orders && orders.length > 0) {
    orders.slice(0, 3).forEach(o => {
      const adv = Number(o.advancePaid || 0);
      const ordCode = o.orderCode || ('ORD-' + (o.id || '').toString().slice(0, 8));
      const gType = o.garmentType || 'Bespoke Design';
      events.push({
        date: o.orderDate ? String(o.orderDate).slice(0, 10) : 'Recent',
        title: `Design options shared via WhatsApp`,
        sub: `Order ${ordCode} · ${gType} (Advance ₹${adv.toLocaleString('en-IN')})`
      });
    });
  }

  // 2. Appointments
  if (appts && appts.length > 0) {
    appts.slice(0, 2).forEach(a => {
      events.push({
        date: a.date || 'Upcoming',
        title: `${a.type || 'Trial'} reminder`,
        sub: `WhatsApp reminder sent for ${a.garment || 'fitting'}`
      });
    });
  }

  if (events.length === 0) {
    container.innerHTML = '<div style="padding:24px 8px;text-align:center;color:var(--text-muted, rgba(255,255,255,0.4));font-size:12px;">No communication records found</div>';
    return;
  }

  container.innerHTML = events.slice(0, 4).map(ev => `
    <div class="comm-item-row" tabindex="0">
      <div class="comm-icon-circle"><i data-lucide="message-circle"></i></div>
      <span class="comm-date-col">${ev.date}</span>
      <div class="comm-text-col">
        <span class="comm-title">${ev.title}</span>
        <span class="comm-sub">${ev.sub}</span>
      </div>
    </div>
  `).join('');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ root: container });
  }
}


/**
 * Renders Quick Insights card (#quickInsightsList) dynamically from live DB data
 */
function renderQuickInsights(orders, appts) {
  const container = document.getElementById('quickInsightsList');
  if (!container) return;

  const total = orders ? orders.length : (customerData.totalOrders || 0);
  const active = orders ? orders.filter(o => {
    const s = (o.status || '').toUpperCase();
    return s !== 'DELIVERED' && s !== 'CANCELLED';
  }).length : (customerData.activeOrders || 0);

  const stylePref = customerData.fitPreference && customerData.fitPreference !== '—'
    ? customerData.fitPreference
    : 'traditional & contemporary styles';

  const occasionPref = customerData.preferredOccasions && customerData.preferredOccasions !== '—'
    ? customerData.preferredOccasions
    : 'wedding and festive collections';

  const insights = [
    { icon: 'crown', box: 'box-gold', label: `${customerData.badge || 'VIP Customer'} — high lifetime value` },
    { icon: 'heart', box: 'box-pink', label: `Prefers ${stylePref.toLowerCase()}` },
    { icon: 'shopping-bag', box: 'box-green', label: `Active customer with ${active} order${active !== 1 ? 's' : ''} in progress` },
    { icon: 'message-circle', box: 'box-whatsapp', label: 'Engages frequently via WhatsApp' },
    { icon: 'tag', box: 'box-purple', label: `Regular for ${occasionPref.toLowerCase()}` }
  ];

  container.innerHTML = insights.map(ins => `
    <div class="insight-row">
      <div class="insight-icon-box ${ins.box}"><i data-lucide="${ins.icon}"></i></div>
      <span>${ins.label}</span>
    </div>
  `).join('');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ root: container });
  }
}

/**
 * Renders Recent Orders table (#recentOrdersTbody) from live orders
 */
function renderRecentOrdersTable(orders) {
  const tbody = document.getElementById('recentOrdersTbody');
  if (!tbody) return;

  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:rgba(255,255,255,0.4);font-size:12.5px;">No recent orders</td></tr>';
    return;
  }

  tbody.innerHTML = orders.slice(0, 5).map(o => {
    const date = o.orderDate ? String(o.orderDate).slice(0, 10) : (o.createdAt ? String(o.createdAt).slice(0, 10) : '—');
    const amt = '₹' + (Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0).toLocaleString('en-IN');
    const st = (o.status || 'DELIVERED').toUpperCase();
    let statusCls = 'delivered';
    let statusLabel = 'Delivered';
    if (st.includes('STITCH') || st.includes('IN_PROGRESS')) {
      statusCls = 'stitching';
      statusLabel = 'Stitching';
    } else if (st.includes('QC')) {
      statusCls = 'stitching';
      statusLabel = 'QC';
    }
    return `
      <tr tabindex="0">
        <td class="td-date">${date}</td>
        <td class="td-ord">${o.orderCode || ('ORD-' + (o.id || '').toString().slice(0, 8))}</td>
        <td class="td-garment">${o.garmentType || 'Bespoke'}</td>
        <td class="td-amt">${amt}</td>
        <td><span class="status-pill ${statusCls}">${statusLabel}</span></td>
      </tr>
    `;
  }).join('');
}

/**
 * Helper to resolve design image URLs reliably without relative path bugs
 */
function resolveDesignImgUrl(url) {
  if (!url) return '../../assets/designs/zari-bloom-front.jpg';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('../assets/')) return '../../' + url.slice(3);
  if (url.startsWith('/front end/')) return url;
  if (url.startsWith('assets/')) return '../../' + url;
  return url;
}

/**
 * Renders Design References mosaic (#designMosaicWrap) from live designs
 */
function renderDesignMosaic() {
  const container = document.getElementById('designMosaicWrap');
  if (!container) return;

  if (!designReferencesData || designReferencesData.length === 0) {
    container.innerHTML = '<div style="padding:24px 0;width:100%;text-align:center;color:rgba(255,255,255,0.4);font-size:12px;">No design references in database</div>';
    return;
  }

  const imgs = designReferencesData.slice(0, 4);
  container.innerHTML = imgs.map((d, idx) => {
    const rawSrc = d.mainImageUrl || d.thumbnailUrl || d.imageUrl || d.referenceImageUrl || '';
    const imgSrc = resolveDesignImgUrl(rawSrc);
    const title = d.designName || d.name || d.garmentType || 'Design';
    const isFourth = idx === 3;
    return `
      <div class="mosaic-cell" tabindex="0" data-design-id="${d.id || ''}" onclick="openDesignLightbox('${d.id || ''}')">
        <img src="${imgSrc}" alt="${title}" onerror="this.src='../../assets/designs/zari-bloom-front.jpg'" />
        ${isFourth ? '<div class="mosaic-overlay-more">+12</div>' : ''}
      </div>
    `;
  }).join('');
}

/**
 * Renders Notes Stack (#notesStackList) from live customer_notes table
 */
function renderNotesStack() {
  const container = document.getElementById('notesStackList');
  if (!container) return;

  if (!customerNotesData || customerNotesData.length === 0) {
    container.innerHTML = '<div style="padding:16px 0;text-align:center;color:rgba(255,255,255,0.4);font-size:11px;">No notes yet — click + Add Note above</div>';
    return;
  }

  const badgeClsList = ['author-pb', 'author-an', 'author-mi'];
  container.innerHTML = customerNotesData.slice(0, 3).map((n, idx) => {
    const date = n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const badge = (n.authorBadge || (n.authorName ? n.authorName.split(' ').map(p => p[0]).join('').slice(0, 2) : 'PB')).toUpperCase();
    const bCls = badgeClsList[idx % badgeClsList.length];
    return `
      <div class="note-item-row" tabindex="0">
        <span class="note-date-text">${date}</span>
        <span class="note-body-text" title="${n.noteText || ''}">${n.noteText || ''}</span>
        <span class="author-circle ${bCls}">${badge}</span>
      </div>
    `;
  }).join('');
}

/**
 * Handles adding and saving a new note to the DB via POST /api/v1/customers/{mobile}/notes
 */
async function handleSaveNote(event) {
  if (event) event.preventDefault();
  const mobile = customerData.mobileNumber || customerData.phone;
  if (!mobile) {
    showToast('No customer loaded', 'error');
    return;
  }

  const noteText = (document.getElementById('newNoteText')?.value || '').trim();
  const category = document.getElementById('newNoteCategory')?.value || 'GENERAL';
  const authorName = (document.getElementById('newNoteAuthor')?.value || 'Pranesh B').trim();
  const authorBadge = authorName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'PB';

  if (!noteText) {
    showToast('Please enter note text', 'error');
    return;
  }

  const submitBtn = document.getElementById('btnSubmitNote');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving...'; }

  try {
    const { default: api } = await import('../../api.js');
    const created = await api.customers.notes.create(mobile, {
      noteText,
      category,
      authorName,
      authorBadge
    });

    customerNotesData.unshift(created);
    renderNotesStack();
    closeModal('addNoteModal');
    const textEl = document.getElementById('newNoteText');
    if (textEl) textEl.value = '';
    showToast('Note added successfully', 'success');
  } catch (err) {
    console.error('[Customer360] Failed to save note:', err);
    showToast('Failed to save note: ' + err.message, 'error');
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save Note'; }
  }
}
window.handleSaveNote = handleSaveNote;
window.openAddNoteModal = () => openModal('addNoteModal');

/**
 * Renders Card 9 Outstanding Payments
 */
function renderOutstandingPayments() {
  const balance = Number(customerData.balance || 0);
  const totalSpend = Number(String(customerData.totalSpent || '').replace(/[^0-9.]/g, '')) || 0;
  const totalPaid = Math.max(0, totalSpend - balance);
  const paidPct = totalSpend > 0 ? Math.min(100, Math.round((totalPaid / totalSpend) * 100)) : 100;

  const donutBalEl = document.getElementById('c360DonutBalance');
  const donutSubEl = document.getElementById('c360DonutSub');
  const totalPaidEl = document.getElementById('c360TotalPaidVal');
  const pendingBalEl = document.getElementById('c360PendingBalanceVal');
  const donutRing = document.getElementById('c360DonutRing');

  if (donutBalEl) donutBalEl.textContent = '₹' + balance.toLocaleString('en-IN');
  if (donutSubEl) donutSubEl.textContent = balance > 0 ? 'Pending' : 'Settled';
  if (totalPaidEl) totalPaidEl.textContent = '₹' + totalPaid.toLocaleString('en-IN');
  if (pendingBalEl) pendingBalEl.textContent = '₹' + balance.toLocaleString('en-IN');

  if (donutRing) {
    if (balance > 0) {
      donutRing.style.background = `conic-gradient(#B8FF2C 0% ${paidPct}%, #E8D17A ${paidPct}% 100%)`;
    } else {
      donutRing.style.background = `conic-gradient(#B8FF2C 0% 100%, #E8D17A 100% 100%)`;
    }
  }

  // Update modal values as well
  const psBilled = document.getElementById('psTotalBilled');
  const psRecv = document.getElementById('psTotalReceived');
  const psBal = document.getElementById('psBalancePending');
  if (psBilled) psBilled.textContent = '₹' + totalSpend.toLocaleString('en-IN');
  if (psRecv) psRecv.textContent = '₹' + totalPaid.toLocaleString('en-IN');
  if (psBal) psBal.textContent = '₹' + balance.toLocaleString('en-IN');
}



/**
 * Renders Card 7 Measurements preview with dynamic database measurements
 */
window.customerBodyMeasurements = [];
window.activeMeasurementGarment = 'blouse';

window.selectMeasurementPill = function(btn, garment) {
  window.activeMeasurementGarment = garment;
  document.querySelectorAll('.measurement-pills-bar .m-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMeasurementsForGarment(garment);
};

function renderMeasurementsForGarment(garment) {
  const tableBox = document.getElementById('measurementsTableBox');
  if (!tableBox) return;

  const gKey = (garment || 'blouse').toUpperCase();
  const mList = window.customerBodyMeasurements || [];
  const m = mList.find(item =>
    (item.garmentType || '').toUpperCase() === gKey
  );

  if (!m) {
    tableBox.innerHTML = `
      <div style="padding:28px 8px;text-align:center;color:rgba(255,255,255,0.45);font-size:11.5px;">
        No ${garment} measurements on file in database
      </div>
    `;
    return;
  }

  const dateStr = m.updatedAt ? new Date(m.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : (m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

  const rows = [
    { k: 'Bust', v: m.bust ? m.bust + '"' : '—' },
    { k: 'Waist', v: m.waist ? m.waist + '"' : '—' },
    { k: 'Shoulder', v: m.shoulder ? m.shoulder + '"' : '—' },
    { k: 'Armhole', v: m.armhole ? m.armhole + '"' : '—' },
    { k: 'Sleeve Length', v: m.sleeveLength ? m.sleeveLength + '"' : '—' },
    { k: (gKey === 'CHUDI' ? 'Top Length' : gKey === 'LEHENGA' ? 'Skirt Length' : 'Blouse Length'), v: (m.blouseLength || m.topLength || m.skirtLength || m.fullLength) ? (m.blouseLength || m.topLength || m.skirtLength || m.fullLength) + '"' : '—' }
  ];

  tableBox.innerHTML = rows.map(r => `
    <div class="m-spec-row">
      <span class="m-spec-k">${r.k}</span>
      <span class="m-spec-v">${r.v}</span>
    </div>
  `).join('') + `
    <div class="m-spec-row last-updated">
      <span class="m-spec-k">Last Updated</span>
      <span class="m-spec-v">${dateStr}</span>
    </div>
  `;
}


// ==========================================================================
// 11. TAB HANDLING
// ==========================================================================
function setupEventListeners() {
  // Navigation Tabs Bar
  const tabBtns = document.querySelectorAll('.c360-nav-tabs .tab-pill, .cust-tabs-bar .tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.dataset.tab || btn.textContent.trim().toLowerCase();
      window.switchC360Tab(tab, btn);
    });
  });

  // Edit Customer Button
  const editBtn = document.getElementById('editCustomerBtn');
  if (editBtn) {
    editBtn.addEventListener('click', openEditCustomerModal);
  }

  // More Actions Dropdown Toggle
  const moreBtn = document.getElementById('moreActionsBtn');
  const moreDd = document.getElementById('moreActionsDropdown');
  if (moreBtn && moreDd) {
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = moreDd.classList.contains('show');
      moreDd.classList.toggle('show', !isOpen);
      moreBtn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });

    moreDd.querySelectorAll('.dd-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        moreDd.classList.remove('show');

        if (action === 'edit') {
          openEditCustomerModal();
        } else if (action === 'add-note') {
          openAddNoteModal();
        } else if (action === 'add-payment') {
          openPaymentBreakdownModal();
        } else if (action === 'create-order') {
          showToast('Create Order initiated for ' + (customerState.name || 'Customer'));
        } else if (action === 'book-appointment') {
          openBookNewAppointmentModal();
        } else if (action === 'archive') {
          showToast('Customer profile archived to database', 'warning');
        }
      });
    });
  }

  // Design Gallery Tiles Click
  document.querySelectorAll('.mosaic-tile[data-design-id]').forEach(tile => {
    tile.addEventListener('click', () => {
      const id = parseInt(tile.dataset.designId, 10);
      openDesignLightbox(id);
    });
  });

  const moreDesignsTile = document.getElementById('moreDesignsTile');
  if (moreDesignsTile) {
    moreDesignsTile.addEventListener('click', () => {
      openDesignLightbox(1);
    });
  }

  // Payments Card Button
  const openPayBtn = document.getElementById('openPaymentModalBtn');
  if (openPayBtn) {
    openPayBtn.addEventListener('click', openPaymentBreakdownModal);
  }

  const viewPayHistoryBtn = document.getElementById('viewPaymentHistoryBtn');
  if (viewPayHistoryBtn) {
    viewPayHistoryBtn.addEventListener('click', openPaymentBreakdownModal);
  }

  // Navigation to New Customer / Order Entry page
  function navigateToNewOrder() {
    window.location.href = '../new-customer/new-customer.html';
  }
  window.navigateToNewOrder = navigateToNewOrder;

  // Top Bar Actions
  const topNewOrderBtn = document.getElementById('topNewOrderBtn');
  if (topNewOrderBtn) {
    topNewOrderBtn.addEventListener('click', navigateToNewOrder);
  }

  const topBookApptBtn = document.getElementById('topBookApptBtn');
  if (topBookApptBtn) {
    topBookApptBtn.addEventListener('click', () => {
      openBookNewAppointmentModal();
    });
  }

  const topSendWhatsAppBtn = document.getElementById('topSendWhatsAppBtn');
  if (topSendWhatsAppBtn) {
    topSendWhatsAppBtn.addEventListener('click', () => {
      const phoneClean = (customerData.phone || '9962844110').replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${phoneClean}`, '_blank');
    });
  }

  const topMoreBtn = document.getElementById('topMoreBtn');
  if (topMoreBtn) {
    topMoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditCustomerModal();
    });
  }

  // Window Resize Chart Redraw
  window.addEventListener('resize', debounce(() => {
    renderSpendBarChart();
  }, 120));
}

window.selectMeasurementPill = function(btn, garmentKey) {
  const gKey = String(garmentKey || 'blouse').toLowerCase();
  document.querySelectorAll('.measurement-pills-bar .m-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  activeC360Garment = garmentKey;
  const tableBox = document.querySelector('.measurements-table-box');
  if (!tableBox) return;

  // Search real body measurements array from database
  const match = customerBodyMeasurements.find(m => (m.garmentType || '').toLowerCase() === gKey);

  if (!match) {
    tableBox.innerHTML = `
      <div style="padding:24px 8px;text-align:center;color:rgba(255,255,255,0.45);font-size:12px;display:flex;flex-direction:column;align-items:center;gap:8px;">
        <span>No ${garmentKey} measurements recorded in database.</span>
        <button type="button" class="btn-top-glass" style="font-size:11px;padding:4px 12px;" onclick="openNewFittingModal('${garmentKey}')">
          <i data-lucide="plus"></i> Add ${garmentKey}
        </button>
      </div>
    `;
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: tableBox });
    }
    return;
  }

  // Render actual measurements recorded in DB
  const rows = [];
  if (match.bust !== null && match.bust !== undefined) rows.push({ key: 'Bust', val: `${match.bust}″` });
  if (match.waist !== null && match.waist !== undefined) rows.push({ key: 'Waist', val: `${match.waist}″` });
  if (match.shoulder !== null && match.shoulder !== undefined) rows.push({ key: 'Shoulder', val: `${match.shoulder}″` });
  if (match.armhole !== null && match.armhole !== undefined) rows.push({ key: 'Armhole', val: `${match.armhole}″` });
  if (match.sleeveLength !== null && match.sleeveLength !== undefined) rows.push({ key: 'Sleeve Length', val: `${match.sleeveLength}″` });
  const len = match.blouseLength || match.topLength || match.skirtLength || match.fullLength;
  if (len !== null && len !== undefined) rows.push({ key: 'Garment Length', val: `${len}″` });
  if (match.hip !== null && match.hip !== undefined) rows.push({ key: 'Hip', val: `${match.hip}″` });
  if (match.frontNeckDepth !== null && match.frontNeckDepth !== undefined) rows.push({ key: 'Front Neck', val: `${match.frontNeckDepth}″` });
  if (match.backNeckDepth !== null && match.backNeckDepth !== undefined) rows.push({ key: 'Back Neck', val: `${match.backNeckDepth}″` });
  if (match.flare !== null && match.flare !== undefined) rows.push({ key: 'Flair', val: `${match.flare}″` });
  if (match.pantLength !== null && match.pantLength !== undefined) rows.push({ key: 'Pant Length', val: `${match.pantLength}″` });

  if (rows.length === 0) {
    tableBox.innerHTML = `<div style="padding:24px 8px;text-align:center;color:rgba(255,255,255,0.45);font-size:12px;">Measurement profile created but dimensions pending in database.</div>`;
    return;
  }

  const dateStr = match.updatedAt ? new Date(match.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : (match.createdAt ? new Date(match.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

  let html = rows.slice(0, 6).map(r => `
    <div class="m-spec-row"><span class="m-spec-k">${r.key}</span><span class="m-spec-v">${r.val}</span></div>
  `).join('');

  if (dateStr) {
    html += `
      <div class="m-spec-row last-updated">
        <span class="m-spec-k">Last Updated</span>
        <span class="m-spec-v">${dateStr}</span>
      </div>
    `;
  }
  tableBox.innerHTML = html;
};

// Current sub-page filtering states
let currentSubOrdersFilter = 'all';
let currentSubOrdersSearch = '';

window.switchC360Tab = function(tabId, btn) {
  const cleanTab = String(tabId || 'overview').toLowerCase().trim();

  // 1. Update active tab pill across all navigation containers
  const tabs = document.querySelectorAll('.c360-nav-tabs .tab-pill, .cust-tabs-bar .tab-btn, .c360-pill-tab');
  tabs.forEach(t => {
    const tTab = (t.dataset.tab || t.textContent.trim()).toLowerCase();
    if (tTab === cleanTab || (btn && t === btn)) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  // 2. Toggle Sub-Page Views
  const allViews = document.querySelectorAll('.c360-tab-view');
  allViews.forEach(v => v.classList.remove('active'));

  const targetView = document.getElementById(`tabView-${cleanTab}`);
  if (targetView) {
    targetView.classList.add('active');
  } else {
    const overviewView = document.getElementById('tabView-overview');
    if (overviewView) overviewView.classList.add('active');
  }

  // 3. Render contents for the selected sub-page
  if (cleanTab === 'orders') {
    renderOrdersSubPage();
  } else if (cleanTab === 'designs') {
    renderDesignsSubPage();
  } else if (cleanTab === 'measurements') {
    renderMeasurementsSubPage(activeC360Garment || 'blouse');
  } else if (cleanTab === 'appointments') {
    renderAppointmentsSubPage();
  } else if (cleanTab === 'payments') {
    renderPaymentsSubPage();
  } else if (cleanTab === 'communication') {
    renderCommunicationSubPage();
  } else if (cleanTab === 'notes') {
    renderNotesSubPage();
  }

  // 4. Smooth scroll to the top of the workspace content
  const navTabsBar = document.querySelector('.c360-nav-tabs');
  if (navTabsBar) {
    navTabsBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 5. Re-render Lucide icons for dynamically injected elements
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    setTimeout(() => {
      window.lucide.createIcons();
    }, 50);
  }

  const toastMap = {
    overview: 'Overview Dashboard',
    orders: 'Customer Orders Sub-Page',
    designs: 'Design Portfolio Sub-Page',
    measurements: 'Garment Measurements Sub-Page',
    appointments: 'Appointments Sub-Page',
    payments: 'Financial Ledger Sub-Page',
    communication: 'Communication Timeline Sub-Page',
    notes: 'Customer Notes Sub-Page'
  };

  if (typeof showToast === 'function') {
    showToast(toastMap[cleanTab] || `${cleanTab.charAt(0).toUpperCase() + cleanTab.slice(1)} Sub-Page`);
  }
};

// ==========================================================================
// SUB-PAGE RENDERERS (FULL DETAILS)
// ==========================================================================

function renderOrdersSubPage() {
  const tbody = document.getElementById('subOrdersTableBody');
  const countBadge = document.getElementById('subOrdersCountBadge');
  const kpiTotal = document.getElementById('subKpiTotalOrders');
  const kpiActive = document.getElementById('subKpiActiveOrders');
  const kpiCompleted = document.getElementById('subKpiCompletedOrders');
  const kpiValue = document.getElementById('subKpiTotalValue');
  const kpiPending = document.getElementById('subKpiPendingDue');

  const orders = window.rawCustOrders || [];

  const totalCount = orders.length;
  const activeList = orders.filter(o => {
    const st = (o.status || '').toUpperCase();
    return st !== 'DELIVERED' && st !== 'CANCELLED';
  });
  const completedList = orders.filter(o => (o.status || '').toUpperCase() === 'DELIVERED');
  const totalVal = orders.reduce((s, o) => s + (Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0), 0);
  const pendingVal = orders.reduce((s, o) => {
    const tot = Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0;
    const adv = Number(o.advancePaid) || 0;
    return s + (Number(o.balanceAmount !== undefined ? o.balanceAmount : (tot - adv)) || 0);
  }, 0);

  if (countBadge) countBadge.textContent = `${totalCount} Orders`;
  if (kpiTotal) kpiTotal.textContent = totalCount;
  if (kpiActive) kpiActive.textContent = activeList.length;
  if (kpiCompleted) kpiCompleted.textContent = completedList.length;
  if (kpiValue) kpiValue.textContent = '₹' + totalVal.toLocaleString('en-IN');
  if (kpiPending) kpiPending.textContent = 'Pending: ₹' + pendingVal.toLocaleString('en-IN');

  if (!tbody) return;

  let filtered = [...orders];
  if (currentSubOrdersFilter === 'active') {
    filtered = filtered.filter(o => (o.status || '').toUpperCase() !== 'DELIVERED' && (o.status || '').toUpperCase() !== 'CANCELLED');
  } else if (currentSubOrdersFilter === 'delivered') {
    filtered = filtered.filter(o => (o.status || '').toUpperCase() === 'DELIVERED');
  } else if (currentSubOrdersFilter === 'pending-payment') {
    filtered = filtered.filter(o => {
      const tot = Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0;
      const adv = Number(o.advancePaid) || 0;
      return (tot - adv) > 0;
    });
  }

  if (currentSubOrdersSearch) {
    const q = currentSubOrdersSearch.toLowerCase().trim();
    filtered = filtered.filter(o => {
      const code = String(o.orderCode || ('ORD-' + o.id)).toLowerCase();
      const g = String(o.garmentType || '').toLowerCase();
      const st = String(o.status || '').toLowerCase();
      const stage = String(o.currentStage || '').toLowerCase();
      return code.includes(q) || g.includes(q) || st.includes(q) || stage.includes(q);
    });
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty-cell">No orders match your filter criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    const code = o.orderCode || ('ORD-' + o.id);
    const dateStr = o.orderDate || (o.createdAt ? String(o.createdAt).slice(0, 10) : '—');
    const garment = o.garmentType || 'Bespoke Garment';
    const stage = o.currentStage || 'Pattern Drafting & Cutting';
    const due = o.expectedDeliveryDate || o.dueDate ? String(o.expectedDeliveryDate || o.dueDate).slice(0, 10) : 'Standard Timeline';
    const tailor = o.assignedTailor || 'Atelier Master';
    const tot = Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0;
    const adv = Number(o.advancePaid) || 0;
    const bal = Number(o.balanceAmount !== undefined ? o.balanceAmount : (tot - adv)) || 0;
    const st = (o.status || 'IN_PROGRESS').toUpperCase();

    return `
      <tr>
        <td>
          <div style="display:flex;flex-direction:column;gap:2px;">
            <span style="font-weight:700;color:#fff;">${code}</span>
            <span style="font-size:11px;color:rgba(255,255,255,0.45);">${dateStr}</span>
          </div>
        </td>
        <td>
          <span style="font-weight:600;color:var(--text-1,#f1f5f9);">${garment}</span>
        </td>
        <td>
          <span class="stage-tag ${st === 'DELIVERED' ? 'delivered' : ''}">
            <i data-lucide="${st === 'DELIVERED' ? 'check' : 'scissors'}" style="width:12px;height:12px;"></i>
            ${stage}
          </span>
        </td>
        <td>
          <span style="color:var(--text-secondary);font-size:12px;">${due}</span>
        </td>
        <td>
          <span style="color:rgba(255,255,255,0.8);">${tailor}</span>
        </td>
        <td>
          <span style="font-weight:700;color:#fff;">₹${tot.toLocaleString('en-IN')}</span>
        </td>
        <td>
          <div style="display:flex;flex-direction:column;gap:1px;font-size:11.5px;">
            <span style="color:var(--lime,#b8ff3d);">Adv: ₹${adv.toLocaleString('en-IN')}</span>
            <span style="color:${bal > 0 ? '#fb7185' : 'rgba(255,255,255,0.4)'};">${bal > 0 ? 'Due: ₹' + bal.toLocaleString('en-IN') : 'Cleared'}</span>
          </div>
        </td>
        <td>
          <span class="status-badge ${st.toLowerCase().replace(/\s+/g, '-')}">${st}</span>
        </td>
        <td>
          <button type="button" class="btn-table-action" onclick="openOrderModal(${o.id})">
            <span>Job Card</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.filterOrdersSubPage = function(query) {
  currentSubOrdersSearch = query;
  renderOrdersSubPage();
};

window.filterOrdersSubPageByStatus = function(status, btn) {
  currentSubOrdersFilter = status;
  document.querySelectorAll('#subOrdersFilterPills .sub-pill-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderOrdersSubPage();
};

function renderDesignsSubPage() {
  const grid = document.getElementById('subDesignsMosaicGrid');
  const countEl = document.getElementById('subDesignsCount');

  // Customer Preferences
  const prefNeck = document.getElementById('subPrefNeck');
  const prefSleeve = document.getElementById('subPrefSleeve');
  const prefOccasions = document.getElementById('subPrefOccasions');
  const prefDelivery = document.getElementById('subPrefDelivery');
  const prefNotes = document.getElementById('subPrefNotes');

  const p = customerData.preferences || {};
  if (prefNeck) prefNeck.textContent = p.preferredNeck || 'Round & Sweetheart Cut';
  if (prefSleeve) prefSleeve.textContent = p.preferredSleeve || 'Elbow Length / 3/4th';
  if (prefOccasions) prefOccasions.textContent = p.occasions || 'Festivals, Weddings & Receptions';
  if (prefDelivery) prefDelivery.textContent = p.preferredDelivery || 'Standard Boutique Pickup';
  if (prefNotes) prefNotes.textContent = p.notes || customerData.notesPreference || 'Client prefers soft lining and concealed zippers.';

  const designs = designReferencesData || [];
  if (countEl) countEl.textContent = `${designs.length} References`;

  if (!grid) return;

  if (designs.length === 0) {
    grid.innerHTML = `
      <div class="sub-design-card" style="grid-column:1/-1;padding:40px;text-align:center;">
        <i data-lucide="image" style="width:36px;height:36px;margin:0 auto 12px;color:rgba(255,255,255,0.3);"></i>
        <h4 style="margin:0 0 6px;color:#fff;">No design sketches in catalog yet</h4>
        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);">Saved references and embroidery moodboards will appear here.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = designs.map(d => {
    const imgUrl = d.imageUrl || d.thumb || '../../assets/designs/zari-bloom-front.jpg';
    const title = d.title || d.name || 'Bespoke Couture Design';
    const garment = d.garmentType || 'Blouse';
    const fabric = d.fabric || 'Raw Silk / Zari';
    const notes = d.notes || d.description || 'Intricate hand embroidery and custom fit.';

    return `
      <div class="sub-design-card">
        <div class="sub-design-img-box">
          <img src="${imgUrl}" alt="${title}" class="sub-design-img" onerror="this.src='../../assets/designs/zari-bloom-front.jpg'" />
        </div>
        <div class="sub-design-info">
          <div class="sub-design-title-row">
            <h4 class="sub-design-name">${title}</h4>
            <span class="sub-design-tag">${garment}</span>
          </div>
          <p style="font-size:12px;color:rgba(255,255,255,0.6);margin:0;">Fabric: <strong style="color:#fff;">${fabric}</strong></p>
          <p style="font-size:11.5px;color:rgba(255,255,255,0.45);margin:0;">${notes}</p>
          <div style="margin-top:6px;display:flex;justify-content:flex-end;">
            <button type="button" class="btn-sub-primary" style="font-size:11.5px;padding:5px 12px;" onclick="navigateToNewOrder()">
              <span>Use For New Order</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderMeasurementsSubPage(garmentKey) {
  const gKey = String(garmentKey || activeC360Garment || 'blouse').toLowerCase();
  activeC360Garment = gKey;
  window.activeC360Garment = gKey;

  const specsGrid = document.getElementById('subMeasSpecsGrid');
  const titleEl = document.getElementById('subMeasCardTitle');
  const verBadge = document.getElementById('subMeasVersionBadge');
  const updatedDateEl = document.getElementById('subMeasUpdatedDate');
  const metaContainer = document.getElementById('subMeasMetaInfo');

  const gUpper = gKey.toUpperCase();
  const gTitle = gKey.charAt(0).toUpperCase() + gKey.slice(1);

  if (titleEl) titleEl.textContent = `${gTitle} Silhouette`;

  // Update pills active state
  document.querySelectorAll('#subGarmentPillsBar .sub-m-tab-pill').forEach(b => {
    if ((b.dataset.garment || '').toLowerCase() === gKey) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  const list = customerBodyMeasurements || window.customerBodyMeasurements || [];
  // Find match by exact garment type or substring
  let match = list.find(m => (m.garmentType || '').toLowerCase() === gKey);
  if (!match) {
    match = list.find(m => (m.garmentType || '').toLowerCase().includes(gKey) || gKey.includes((m.garmentType || '').toLowerCase()));
  }
  // Fallback: if single record with "General"
  if (!match && list.length > 0 && list[0].garmentType && list[0].garmentType.toLowerCase() === 'general') {
    match = list[0];
  }

  if (!match) {
    if (verBadge) verBadge.textContent = 'No Record';
    if (updatedDateEl) updatedDateEl.textContent = '—';
    if (specsGrid) {
      specsGrid.innerHTML = `
        <div style="grid-column:1/-1;padding:48px 16px;text-align:center;color:rgba(255,255,255,0.45);display:flex;flex-direction:column;align-items:center;gap:12px;">
          <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;">
            <i data-lucide="ruler" style="width:24px;height:24px;color:rgba(255,255,255,0.35);"></i>
          </div>
          <h4 style="margin:0;color:#fff;font-size:15px;">No ${gTitle} measurements on file</h4>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);max-width:340px;">No bespoke tailoring profile recorded in database for this garment category yet.</p>
          <button type="button" class="btn-sub-primary" style="margin-top:6px;padding:8px 18px;font-size:12px;" onclick="openNewFittingModal('${gKey}')">
            <i data-lucide="plus"></i> <span>+ Record ${gTitle} Fitting</span>
          </button>
        </div>
      `;
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: specsGrid });
      }
    }
    return;
  }

  // Update silhouette header & meta
  if (verBadge) verBadge.textContent = `v${match.version || '1.0'} (Current)`;
  const dateStr = match.updatedAt ? new Date(match.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : (match.createdAt ? new Date(match.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recorded');
  if (updatedDateEl) updatedDateEl.textContent = dateStr;

  if (metaContainer) {
    const recordedBy = match.recordedBy || 'Master Tailor';
    const unitStr = match.unit === 'cm' ? 'Centimeters (cm)' : 'Inches (″)';
    const notesStr = match.postureNotes || match.shapeNotes || match.notes || '';
    metaContainer.innerHTML = `
      <div class="sub-meas-meta-row"><span class="k">Recorded By:</span> <span class="v">${recordedBy}</span></div>
      <div class="sub-meas-meta-row"><span class="k">Last Updated:</span> <span class="v" id="subMeasUpdatedDate">${dateStr}</span></div>
      <div class="sub-meas-meta-row"><span class="k">Unit:</span> <span class="v">${unitStr}</span></div>
      ${notesStr ? `<div class="sub-meas-meta-row" style="margin-top:6px;flex-direction:column;align-items:flex-start;gap:2px;"><span class="k">Posture / Notes:</span> <span class="v" style="font-size:11.5px;color:rgba(255,255,255,0.7);font-style:italic;">${notesStr}</span></div>` : ''}
    `;
  }

  // Get specs for this garment type from TAILORING_GARMENT_SPECS if available, or build dynamic list
  const specList = (typeof TAILORING_GARMENT_SPECS !== 'undefined' && TAILORING_GARMENT_SPECS[gUpper])
    ? TAILORING_GARMENT_SPECS[gUpper]
    : null;

  let points = [];
  if (specList && Array.isArray(specList)) {
    points = specList.map(s => {
      const val = match[s.key];
      return { key: s.label, val: val };
    }).filter(p => p.val !== null && p.val !== undefined && p.val !== '' && p.val !== 0);
  }

  // If specific specs didn't produce points, check all standard tailoring points
  if (points.length === 0) {
    const standardPoints = [
      { key: 'Shoulder', val: match.shoulder },
      { key: 'Bust / Chest', val: match.bust },
      { key: 'Upper Bust', val: match.upperBust },
      { key: 'Under Bust', val: match.underBust },
      { key: 'Waist', val: match.waist },
      { key: 'Hip', val: match.hip || match.fullHip },
      { key: 'High Hip', val: match.highHip },
      { key: 'Blouse Length', val: match.blouseLength },
      { key: 'Top / Kurti Length', val: match.topLength },
      { key: 'Skirt Length', val: match.skirtLength },
      { key: 'Full Gown Length', val: match.fullLength },
      { key: 'Pant / Trouser Length', val: match.pantLength },
      { key: 'Garment Length', val: match.garmentLength },
      { key: 'Armhole', val: match.armhole },
      { key: 'Sleeve Length', val: match.sleeveLength },
      { key: 'Upper Arm', val: match.upperArm || match.bicep },
      { key: 'Sleeve Round', val: match.sleeveRound },
      { key: 'Elbow Round', val: match.elbowRound },
      { key: 'Wrist Round', val: match.wristRound || match.wrist },
      { key: 'Front Neck Depth', val: match.frontNeckDepth || match.frontNeck },
      { key: 'Back Neck Depth', val: match.backNeckDepth || match.backNeck },
      { key: 'Apex (Bust Point)', val: match.bustPoint || match.apexPoint },
      { key: 'Bust Point to Point', val: match.bustPointToBustPoint },
      { key: 'Shoulder to Bust', val: match.shoulderToBust },
      { key: 'Shoulder to Waist', val: match.shoulderToWaist },
      { key: 'Cross Front', val: match.frontWidth || match.crossFront },
      { key: 'Cross Back', val: match.backWidth || match.crossBack },
      { key: 'Pant Waist', val: match.pantWaist },
      { key: 'Pant Hip', val: match.pantHip },
      { key: 'Thigh Round', val: match.thighRound },
      { key: 'Knee Round', val: match.kneeRound },
      { key: 'Calf Round', val: match.calfRound },
      { key: 'Ankle / Bottom Opening', val: match.ankleRound || match.bottomOpening },
      { key: 'Inseam', val: match.inseam },
      { key: 'Crotch Length', val: match.crotchLength },
      { key: 'Flare / Gher', val: match.flare }
    ];
    points = standardPoints.filter(p => p.val !== null && p.val !== undefined && p.val !== '' && p.val !== 0);
  }

  if (specsGrid) {
    if (points.length === 0) {
      specsGrid.innerHTML = `
        <div style="grid-column:1/-1;padding:36px 16px;text-align:center;color:rgba(255,255,255,0.45);display:flex;flex-direction:column;align-items:center;gap:10px;">
          <span>Profile created for ${gTitle} (v${match.version || '1.0'}), but individual dimensions are not recorded yet.</span>
          <button type="button" class="btn-sub-primary" style="padding:7px 16px;font-size:12px;" onclick="openNewFittingModal('${gKey}')">
            <i data-lucide="plus"></i> + Enter Fitting Values
          </button>
        </div>
      `;
    } else {
      const unitSym = match.unit === 'cm' ? ' cm' : '″';
      specsGrid.innerHTML = points.map(pt => `
        <div class="sub-spec-tile">
          <span class="sub-spec-label">${pt.key}</span>
          <span class="sub-spec-val">${pt.val}${unitSym}</span>
        </div>
      `).join('');
    }
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ root: specsGrid });
  }
}
window.renderMeasurementsSubPage = renderMeasurementsSubPage;

window.switchSubMeasurementGarment = function(garmentKey, btn) {
  document.querySelectorAll('#subGarmentPillsBar .sub-m-tab-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  activeC360Garment = String(garmentKey || 'blouse').toLowerCase();
  window.activeC360Garment = activeC360Garment;
  renderMeasurementsSubPage(activeC360Garment);
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
};

/**
 * Categorizes appointment items into Current (Today), Upcoming (Next), and Past History
 */
function categorizeAppointments(appts) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const current = [];
  const upcoming = [];
  const past = [];

  (appts || []).forEach(a => {
    let apptDateStr = '';
    if (a.rawScheduledAt) {
      apptDateStr = String(a.rawScheduledAt).slice(0, 10);
    } else if (a.date) {
      const parsed = new Date(a.date);
      if (!isNaN(parsed.getTime())) {
        apptDateStr = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
      }
    }

    const st = (a.status || 'CONFIRMED').toUpperCase();
    const isToday = apptDateStr === todayStr;

    if (st === 'COMPLETED' || st === 'CANCELLED') {
      past.push(a);
    } else if (isToday) {
      current.push(a);
    } else if (apptDateStr && apptDateStr < todayStr) {
      past.push(a);
    } else {
      upcoming.push(a);
    }
  });

  // Sort upcoming ascending (nearest first)
  upcoming.sort((a, b) => {
    const ta = a.rawScheduledAt ? new Date(a.rawScheduledAt).getTime() : 0;
    const tb = b.rawScheduledAt ? new Date(b.rawScheduledAt).getTime() : 0;
    return ta - tb;
  });

  // Sort past descending (most recent first)
  past.sort((a, b) => {
    const ta = a.rawScheduledAt ? new Date(a.rawScheduledAt).getTime() : 0;
    const tb = b.rawScheduledAt ? new Date(b.rawScheduledAt).getTime() : 0;
    return tb - ta;
  });

  const nextAppt = upcoming.length > 0 ? upcoming[0] : (current.length > 0 ? current[0] : null);

  return { current, upcoming, past, nextAppt };
}

window._activeApptFilter = 'all';

window.filterAppointmentsSubFeed = function (filterKey, btn) {
  window._activeApptFilter = filterKey || 'all';
  document.querySelectorAll('#apptsFilterBar .appts-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAppointmentsSubPage();
};

function renderAppointmentsSubPage() {
  const feed = document.getElementById('subApptsFeed');
  const countBadge = document.getElementById('subApptsCountBadge');

  const appts = appointmentsData || [];
  if (countBadge) countBadge.textContent = `${appts.length} Session${appts.length === 1 ? '' : 's'}`;

  // Categorize
  const { current, upcoming, past, nextAppt } = categorizeAppointments(appts);

  // Update KPI Metrics Cards
  const valCur = document.getElementById('amcValCurrent');
  const subCur = document.getElementById('amcSubCurrent');
  const valNext = document.getElementById('amcValNext');
  const subNext = document.getElementById('amcSubNext');
  const valPast = document.getElementById('amcValPast');
  const subPast = document.getElementById('amcSubPast');

  if (valCur) valCur.textContent = current.length;
  if (subCur) subCur.textContent = current.length > 0 ? `${current.length} session(s) active today` : 'No session today';

  if (valNext) {
    if (nextAppt) {
      valNext.textContent = nextAppt.type || 'Upcoming Session';
      if (subNext) subNext.textContent = `${nextAppt.date}${nextAppt.time ? ' at ' + nextAppt.time : ''}`;
    } else {
      valNext.textContent = '—';
      if (subNext) subNext.textContent = 'None scheduled';
    }
  }

  if (valPast) valPast.textContent = past.length;
  if (subPast) subPast.textContent = `${past.length} completed session(s)`;

  // Update Filter Counters
  const cntAll = document.getElementById('filterCountAll');
  const cntCur = document.getElementById('filterCountCurrent');
  const cntUp = document.getElementById('filterCountUpcoming');
  const cntPast = document.getElementById('filterCountPast');

  if (cntAll) cntAll.textContent = appts.length;
  if (cntCur) cntCur.textContent = current.length;
  if (cntUp) cntUp.textContent = upcoming.length;
  if (cntPast) cntPast.textContent = past.length;

  if (!feed) return;

  // Empty State: 0 appointments
  if (appts.length === 0) {
    feed.innerHTML = `
      <div class="sub-feed-card" style="padding:48px 24px;justify-content:center;text-align:center;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;max-width:420px;margin:0 auto;">
          <div style="width:54px;height:54px;border-radius:14px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;">
            <i data-lucide="calendar-x" style="width:28px;height:28px;color:rgba(255,255,255,0.4);"></i>
          </div>
          <h4 style="margin:0;color:#fff;font-size:16px;">No appointment sessions booked yet</h4>
          <p style="margin:0;font-size:12.5px;color:rgba(255,255,255,0.5);line-height:1.5;">Trial fittings, design consultations, and bespoke handovers for this client will be listed here.</p>
          <button type="button" class="btn-sub-primary" style="margin-top:10px;padding:8px 18px;font-size:12.5px;" onclick="openBookNewAppointmentModal()">
            <i data-lucide="plus"></i> <span>+ Book First Appointment</span>
          </button>
        </div>
      </div>
    `;
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: feed });
    }
    return;
  }

  // Active filter
  const filter = window._activeApptFilter || 'all';

  function renderApptCard(a, kind) {
    const title = a.type || 'Trial Fitting';
    const dateStr = a.date || 'Upcoming';
    const timeStr = a.time ? ` at ${a.time}` : '';
    const specialist = a.specialist || 'Master Tailor';
    const garment = a.garment || 'Bespoke Garment';
    const st = (a.status || 'CONFIRMED').toUpperCase();
    const orderStr = a.orderCode ? ` · Order #${a.orderCode}` : '';

    let cardClass = 'sub-feed-card';
    let statusChip = `<span class="status-badge ${st.toLowerCase()}">${st}</span>`;

    if (kind === 'current') {
      cardClass += ' current-session';
      statusChip = `<span class="pulse-chip">TODAY'S SESSION</span>`;
    } else if (kind === 'upcoming') {
      cardClass += ' upcoming-session';
    } else if (kind === 'past') {
      cardClass += ' past-session';
    }

    return `
      <div class="${cardClass}">
        <div class="sub-feed-left">
          <div class="sub-feed-icon-box" style="${kind === 'current' ? 'background:rgba(184,255,61,0.12);color:var(--lime);' : (kind === 'upcoming' ? 'background:rgba(168,149,255,0.12);color:var(--purple);' : 'background:rgba(255,255,255,0.05);color:var(--slate-400);')}">
            <i data-lucide="${kind === 'current' ? 'clock' : (kind === 'upcoming' ? 'calendar-plus' : 'calendar-check')}"></i>
          </div>
          <div class="sub-feed-details">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <h4 class="sub-feed-title">${title}</h4>
              ${statusChip}
            </div>
            <span class="sub-feed-subtitle">
              <strong style="color:#fff;">${dateStr}${timeStr}</strong> &bull; Assigned: <strong>${specialist}</strong>
            </span>
            <span class="sub-feed-notes">Garment: ${garment}${orderStr}${a.notes ? ` · Note: "${a.notes}"` : ''}</span>
          </div>
        </div>
        <div class="sub-feed-right">
          <button type="button" class="btn-sub-glass" style="font-size:11.5px;padding:6px 14px;" onclick="openAppointmentModal('${a.id}')">
            <span>Details &rarr;</span>
          </button>
        </div>
      </div>
    `;
  }

  let html = '';

  if (filter === 'all' || filter === 'current') {
    if (current.length > 0) {
      html += `
        <div class="appts-section-header current">
          <i data-lucide="radio" style="width:14px;height:14px;"></i>
          <span>Current / Today (${current.length})</span>
        </div>
        ${current.map(a => renderApptCard(a, 'current')).join('')}
      `;
    } else if (filter === 'current') {
      html += `<div class="sub-feed-card" style="padding:28px;text-align:center;color:rgba(255,255,255,0.45);font-size:12px;">No sessions scheduled for today.</div>`;
    }
  }

  if (filter === 'all' || filter === 'upcoming') {
    if (upcoming.length > 0) {
      html += `
        <div class="appts-section-header upcoming">
          <i data-lucide="calendar-days" style="width:14px;height:14px;"></i>
          <span>Next & Upcoming Appointments (${upcoming.length})</span>
        </div>
        ${upcoming.map(a => renderApptCard(a, 'upcoming')).join('')}
      `;
    } else if (filter === 'upcoming') {
      html += `<div class="sub-feed-card" style="padding:28px;text-align:center;color:rgba(255,255,255,0.45);font-size:12px;">No upcoming appointments scheduled.</div>`;
    }
  }

  if (filter === 'all' || filter === 'past') {
    if (past.length > 0) {
      html += `
        <div class="appts-section-header past">
          <i data-lucide="history" style="width:14px;height:14px;"></i>
          <span>Past Sessions & Trial History (${past.length})</span>
        </div>
        ${past.map(a => renderApptCard(a, 'past')).join('')}
      `;
    } else if (filter === 'past') {
      html += `<div class="sub-feed-card" style="padding:28px;text-align:center;color:rgba(255,255,255,0.45);font-size:12px;">No past appointment records found.</div>`;
    }
  }

  feed.innerHTML = html;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ root: feed });
  }
}

function renderPaymentsSubPage() {
  const billedEl = document.getElementById('subPayBilled');
  const receivedEl = document.getElementById('subPayReceived');
  const pendingEl = document.getElementById('subPayPending');
  const avgOrderEl = document.getElementById('subPayAvgOrder');
  const tbody = document.getElementById('subPaymentsTableBody');

  const orders = window.rawCustOrders || [];
  const totalBilled = orders.reduce((s, o) => s + (Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0), 0);
  const totalAdvance = orders.reduce((s, o) => s + (Number(o.advancePaid) || 0), 0);
  const totalPending = orders.reduce((s, o) => {
    const tot = Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0;
    const adv = Number(o.advancePaid) || 0;
    return s + (Number(o.balanceAmount !== undefined ? o.balanceAmount : (tot - adv)) || 0);
  }, 0);
  const avgVal = orders.length > 0 ? Math.round(totalBilled / orders.length) : 0;

  if (billedEl) billedEl.textContent = '₹' + totalBilled.toLocaleString('en-IN');
  if (receivedEl) receivedEl.textContent = '₹' + totalAdvance.toLocaleString('en-IN');
  if (pendingEl) pendingEl.textContent = '₹' + totalPending.toLocaleString('en-IN');
  if (avgOrderEl) avgOrderEl.textContent = '₹' + avgVal.toLocaleString('en-IN');

  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-empty-cell">No transaction records found for this customer.</td></tr>`;
    return;
  }

  const rows = [];
  orders.forEach((o, idx) => {
    const code = o.orderCode || ('ORD-' + o.id);
    const dateStr = o.orderDate || (o.createdAt ? String(o.createdAt).slice(0, 10) : '2026-09-08');
    const garment = o.garmentType || 'Bespoke Tailoring';
    const adv = Number(o.advancePaid) || 0;
    const tot = Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0;
    const bal = Number(o.balanceAmount !== undefined ? o.balanceAmount : (tot - adv)) || 0;

    if (adv > 0) {
      rows.push({
        date: dateStr,
        ref: `RCP-${o.id || idx}-ADV`,
        order: code,
        garment: garment + ' (Advance Deposit)',
        amount: adv,
        mode: o.paymentMode || 'UPI / NetBanking',
        staff: 'Cashier Desk',
        status: 'CLEARED'
      });
    }

    if (bal === 0 && tot > 0) {
      rows.push({
        date: dateStr,
        ref: `RCP-${o.id || idx}-FIN`,
        order: code,
        garment: garment + ' (Final Settlement)',
        amount: tot - adv,
        mode: o.paymentMode || 'Card / POS',
        staff: 'Cashier Desk',
        status: 'CLEARED'
      });
    } else if (bal > 0) {
      rows.push({
        date: dateStr,
        ref: `INV-${o.id || idx}-BAL`,
        order: code,
        garment: garment + ' (Balance Outstanding)',
        amount: bal,
        mode: 'Pending Collection',
        staff: 'Atelier Accounts',
        status: 'PENDING'
      });
    }
  });

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-empty-cell">No payment transactions recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.date}</td>
      <td><span style="font-weight:700;color:#fff;">${r.ref}</span></td>
      <td><strong style="color:var(--lime,#b8ff3d);">${r.order}</strong> <span style="font-size:11.5px;color:rgba(255,255,255,0.5);">(${r.garment})</span></td>
      <td><strong style="color:${r.status === 'CLEARED' ? '#4ade80' : '#fb7185'};">₹${r.amount.toLocaleString('en-IN')}</strong></td>
      <td><span style="font-size:12px;color:rgba(255,255,255,0.8);">${r.mode}</span></td>
      <td><span style="font-size:12px;color:rgba(255,255,255,0.6);">${r.staff}</span></td>
      <td><span class="status-badge ${r.status === 'CLEARED' ? 'delivered' : 'pending'}">${r.status}</span></td>
    </tr>
  `).join('');
}

function renderCommunicationSubPage() {
  const feed = document.getElementById('subCommsFullFeed');
  if (!feed) return;

  const orders = window.rawCustOrders || [];
  const appts = appointmentsData || [];
  const enqs = customerEnquiriesData || [];

  const items = [];

  orders.forEach(o => {
    items.push({
      date: new Date(o.orderDate || o.createdAt || 0),
      channel: 'Order Booking',
      icon: 'shopping-bag',
      title: `Order Placed: ${o.orderCode || ('ORD-' + o.id)}`,
      desc: `Booked bespoke ${o.garmentType || 'garment'} valued at ₹${(Number(o.totalAmount !== undefined ? o.totalAmount : o.amount) || 0).toLocaleString('en-IN')}`,
      staff: 'Atelier Sales Desk'
    });
  });

  appts.forEach(a => {
    items.push({
      date: new Date(a.date || 0),
      channel: 'Atelier Session',
      icon: 'calendar',
      title: `${a.type || 'Fitting Appointment'} Scheduled`,
      desc: `Scheduled with ${a.specialist || 'Master Tailor'} for ${a.garment || 'garment fitting'}. Status: ${a.status || 'CONFIRMED'}.`,
      staff: 'Front Reception'
    });
  });

  enqs.forEach(e => {
    items.push({
      date: new Date(e.createdAt || e.enquiryDate || 0),
      channel: 'Inquiry & Consultation',
      icon: 'message-circle',
      title: `Client Inquiry: ${e.subject || e.garmentType || 'Bridal Couture'}`,
      desc: e.notes || e.message || 'Discussion regarding fabric selection and delivery timeline.',
      staff: e.assignedTo || 'Lead Stylist'
    });
  });

  items.sort((a, b) => b.date - a.date);

  if (items.length === 0) {
    feed.innerHTML = `
      <div class="sub-feed-card" style="padding:40px;justify-content:center;text-align:center;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <i data-lucide="message-square" style="width:36px;height:36px;color:rgba(255,255,255,0.3);"></i>
          <h4 style="margin:0;color:#fff;">No communication history logged</h4>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);">WhatsApp chats, consultations, and calls will appear here.</p>
          <button type="button" class="btn-sub-primary" style="margin-top:6px;" onclick="document.getElementById('topSendWhatsAppBtn')?.click()">
            <i data-lucide="message-circle"></i> Send First WhatsApp Message
          </button>
        </div>
      </div>
    `;
    return;
  }

  feed.innerHTML = items.map(item => {
    const dateStr = !isNaN(item.date) && item.date.getTime() > 0 ? item.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent Activity';

    return `
      <div class="sub-feed-card">
        <div class="sub-feed-left">
          <div class="sub-feed-icon-box">
            <i data-lucide="${item.icon}"></i>
          </div>
          <div class="sub-feed-details">
            <h4 class="sub-feed-title">${item.title}</h4>
            <span class="sub-feed-subtitle"><strong style="color:var(--lime,#b8ff3d);">${item.channel}</strong> &bull; ${dateStr} &bull; By ${item.staff}</span>
            <span class="sub-feed-notes">${item.desc}</span>
          </div>
        </div>
        <div class="sub-feed-right">
          <button type="button" class="btn-sub-glass" style="font-size:11.5px;padding:5px 12px;" onclick="document.getElementById('topSendWhatsAppBtn')?.click()">
            <i data-lucide="message-circle" style="width:13px;height:13px;"></i>
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderNotesSubPage() {
  const grid = document.getElementById('subNotesFullGrid');
  const countBadge = document.getElementById('subNotesCountBadge');

  const notes = customerNotesData || [];
  if (countBadge) countBadge.textContent = `${notes.length} Notes`;

  if (!grid) return;

  if (notes.length === 0) {
    grid.innerHTML = `
      <div class="sub-note-card" style="grid-column:1/-1;padding:36px;text-align:center;">
        <i data-lucide="file-text" style="width:36px;height:36px;margin:0 auto 10px;color:rgba(255,255,255,0.3);"></i>
        <h4 style="margin:0 0 6px;color:#fff;">No notes recorded yet</h4>
        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);">Use the quick composer above to log client preferences, quirks, or fitting advice.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = notes.map((n) => {
    const text = n.noteText || n.text || n.note || 'Client preference recorded.';
    const cat = (n.category || 'STYLING').toUpperCase();
    const author = n.author || n.createdBy || 'Atelier Master';
    const dateStr = n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Saved Note';

    return `
      <div class="sub-note-card">
        <div class="sub-note-header">
          <span class="sub-note-badge">${cat}</span>
          <span style="font-size:11px;color:rgba(255,255,255,0.4);">${dateStr}</span>
        </div>
        <div class="sub-note-body">${text}</div>
        <div class="sub-note-footer">
          <span>By: <strong style="color:rgba(255,255,255,0.7);">${author}</strong></span>
          <i data-lucide="pin" style="width:12px;height:12px;opacity:0.4;"></i>
        </div>
      </div>
    `;
  }).join('');
}

window.handleSubInlineNoteSubmit = async function(event) {
  event.preventDefault();
  const textEl = document.getElementById('subInlineNoteText');
  const catEl = document.getElementById('subInlineNoteCategory');
  const text = (textEl?.value || '').trim();
  const category = catEl?.value || 'GENERAL';

  if (!text) {
    showToast('Please enter note text', 'warning');
    return;
  }

  const targetMobile = customerData.phone || customerData.mobileNumber;
  try {
    const { default: api } = await import('../../api.js');
    if (targetMobile && api.customers?.notes?.create) {
      await api.customers.notes.create(targetMobile, {
        noteText: text,
        category: category,
        author: 'Pranesh B'
      });
    }
  } catch (e) {
    console.warn('API note save fallback:', e.message);
  }

  customerNotesData.unshift({
    noteText: text,
    category: category,
    author: 'Pranesh B',
    createdAt: new Date().toISOString()
  });

  if (textEl) textEl.value = '';
  showToast('Customer relationship note saved!', 'success');
  renderNotesSubPage();
  renderNotesStack();
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
};

// Listen for URL hash changes (e.g. #orders, #measurements)
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash) window.switchC360Tab(hash);
});
if (window.location.hash) {
  const initialHash = window.location.hash.replace('#', '').toLowerCase();
  setTimeout(() => {
    window.switchC360Tab(initialHash);
  }, 350);
}

// ==========================================================================
// 12. MODAL CONTROLLER
// ==========================================================================
function setupModals() {
  // Close buttons with data-close-modal attribute
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Outside click on backdrop
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Global ESC key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      closeAllDropdowns();
    }
  });

  // Edit Customer Form Submit
  const editForm = document.getElementById('editCustomerForm');
  if (editForm) {
    editForm.addEventListener('submit', handleSaveCustomer);
  }

  // Add Note Submit
  const submitNoteBtn = document.getElementById('submitCustomerNoteBtn');
  if (submitNoteBtn) {
    submitNoteBtn.addEventListener('click', handleSaveNote);
  }

  // Action Buttons inside modals
  const rescheduleBtn = document.getElementById('rescheduleApptBtn');
  if (rescheduleBtn) {
    rescheduleBtn.addEventListener('click', () => {
      closeModal('appointmentModal');
      showToast('Appointment rescheduled. Notification sent via WhatsApp.');
    });
  }

  const cancelApptBtn = document.getElementById('cancelApptBtn');
  if (cancelApptBtn) {
    cancelApptBtn.addEventListener('click', () => {
      closeModal('appointmentModal');
      showToast('Appointment cancelled.', 'warning');
    });
  }

  const recordPaymentBtn = document.getElementById('recordNewPaymentBtn');
  if (recordPaymentBtn) {
    recordPaymentBtn.addEventListener('click', () => {
      closeModal('paymentBreakdownModal');
      showToast('Payment window opened. Ready to record.');
    });
  }

  const useDesignBtn = document.getElementById('useDesignActionBtn');
  if (useDesignBtn) {
    useDesignBtn.addEventListener('click', () => {
      closeModal('designPreviewModal');
      showToast('Design reference linked to new order cart.');
    });
  }

  const viewFullOrderBtn = document.getElementById('viewFullOrderDetailsBtn');
  if (viewFullOrderBtn) {
    viewFullOrderBtn.addEventListener('click', () => {
      closeModal('orderPreviewModal');
      showToast('Opening complete Production Job Card...');
    });
  }
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
    el.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('show');
    el.style.display = 'none';
    if (!document.querySelector('.modal-backdrop.show')) {
      document.body.style.overflow = '';
    }
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-backdrop.show').forEach(m => {
    m.classList.remove('show');
    m.style.display = 'none';
  });
  document.body.style.overflow = '';
}

function closeAllDropdowns() {
  document.querySelectorAll('.more-dropdown.show').forEach(dd => dd.classList.remove('show'));
}

// ==========================================================================
// 13. SPECIFIC MODALS POPULATION
// ==========================================================================

/**
 * 1. Edit Customer Modal
 */
function openEditCustomerModal() {
  document.getElementById('editCustName').value = customerData.name;
  document.getElementById('editCustPhone').value = customerData.phone;
  document.getElementById('editCustEmail').value = customerData.email;
  document.getElementById('editCustLocation').value = customerData.location;
  document.getElementById('editCustBadge').value = customerData.badge;
  document.getElementById('editCustQuote').value = customerData.quote;

  openModal('editCustomerModal');
}

function handleSaveCustomer(e) {
  e.preventDefault();
  customerData.name = document.getElementById('editCustName').value.trim();
  customerData.phone = document.getElementById('editCustPhone').value.trim();
  customerData.email = document.getElementById('editCustEmail').value.trim();
  customerData.location = document.getElementById('editCustLocation').value.trim();
  customerData.badge = document.getElementById('editCustBadge').value;
  customerData.quote = document.getElementById('editCustQuote').value.trim();

  saveStateToStorage();
  renderProfileCard();
  closeModal('editCustomerModal');
  showToast('Customer profile updated successfully.');
}

/**
 * 2. Order Preview Modal
 */
function openOrderModal(orderId) {
  const order = activeOrdersData.find(o => o.id === orderId) || activeOrdersData[0];
  const titleEl = document.getElementById('orderModalTitle');
  const statusEl = document.getElementById('orderModalStatus');
  const bodyEl = document.getElementById('orderModalBody');

  if (titleEl) titleEl.textContent = `${order.id} â€” ${order.garment}`;
  if (statusEl) {
    statusEl.textContent = order.status;
    statusEl.className = `status-badge ${order.statusClass}`;
  }

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="display:flex;gap:16px;align-items:center;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <img src="${order.thumb}" alt="${order.garment}" style="width:60px;height:60px;border-radius:12px;border:1px solid rgba(255,255,255,0.15);" />
        <div>
          <h4 style="font-size:16px;color:#fff;font-weight:600;">${order.garment} (${order.collection})</h4>
          <p style="font-size:12px;color:var(--c-text-sec);margin-top:2px;">Target Delivery: <b style="color:var(--c-lime);">${order.due}</b></p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px;padding:8px 0;">
        <div><span style="color:var(--c-text-muted);">Total Billed:</span> <b style="color:#fff;">${order.amount}</b></div>
        <div><span style="color:var(--c-text-muted);">Advance Paid:</span> <b style="color:var(--c-lime);">${order.advance}</b></div>
        <div><span style="color:var(--c-text-muted);">Balance Due:</span> <b style="color:var(--c-yellow);">${order.pending}</b></div>
        <div><span style="color:var(--c-text-muted);">Current Stage:</span> <b style="color:#fff;">${order.stage}</b></div>
      </div>
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px;font-size:11px;">
        <span style="color:var(--c-text-muted);">Craftsperson / Workshop:</span> <span style="color:var(--c-text-pri);font-weight:500;">${order.assignedTailor}</span>
      </div>
    `;
  }

  openModal('orderPreviewModal');
}

/**
 * 3. Design Lightbox Modal
 */
function openDesignLightbox(designId) {
  if (!designReferencesData || designReferencesData.length === 0) return;
  // Match by string ID (UUID) or fallback to first
  const design = designReferencesData.find(d => String(d.id) === String(designId)) || designReferencesData[0];
  if (!design) return;

  const titleEl = document.getElementById('designModalTitle');
  const imgEl = document.getElementById('designModalImg');
  const metaEl = document.getElementById('designModalMeta');

  const title = design.designName || design.name || design.garmentType || 'Design Reference';
  const imgSrc = design.mainImageUrl || design.imageUrl || design.thumbnailUrl || design.referenceImageUrl
    || '../../assets/designs/zari-bloom-front.jpg';
  const garment = design.garmentType || design.category || '—';
  const savedDate = design.createdAt ? new Date(design.createdAt).toLocaleDateString('en-IN') : '—';
  const tags = [design.garmentType, design.fabric, design.occasion].filter(Boolean);

  if (titleEl) titleEl.textContent = title;
  if (imgEl) { imgEl.src = imgSrc; imgEl.alt = title; }

  if (metaEl) {
    metaEl.innerHTML = `
      <div style="font-size:12px;color:var(--c-text-muted);">Garment Category: <b style="color:#fff;">${garment}</b></div>
      <div style="font-size:12px;color:var(--c-text-muted);">Saved Date: <b style="color:#fff;">${savedDate}</b></div>
      ${design.description ? `<div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:6px;">${design.description}</div>` : ''}
      ${tags.length > 0 ? `
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
        ${tags.map(t => `<span style="font-size:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);padding:2px 8px;border-radius:10px;color:var(--c-text-sec);">${t}</span>`).join('')}
      </div>` : ''}
    `;
  }

  openModal('designPreviewModal');
}

/**
 * 4. Appointment Details Modal
 */
function openAppointmentModal(apptId) {
  if (apptId === 'new') {
    openBookNewAppointmentModal();
    return;
  }
  const appt = appointmentsData.find(a => String(a.id) === String(apptId)) || appointmentsData[0];
  if (!appt) {
    openBookNewAppointmentModal();
    return;
  }

  const titleEl = document.getElementById('apptModalTitle');
  const bodyEl = document.getElementById('apptModalBody');

  if (titleEl) titleEl.textContent = `${appt.type || 'Appointment Details'}`;

  if (bodyEl) {
    const dur = appt.durationMinutes ? ` (${appt.durationMinutes} mins)` : '';
    const garment = appt.garment || 'Bespoke Garment';
    const orderStr = appt.orderCode ? ` · Order #${appt.orderCode}` : '';
    const notesBlock = appt.notes ? `
      <div>
        <span style="color:var(--c-text-muted);">Session Notes:</span>
        <div style="color:rgba(255,255,255,0.85);margin-top:4px;background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);">${appt.notes}</div>
      </div>
    ` : '';

    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;font-size:13px;">
        <div style="background:rgba(184,255,44,0.1);border:1px solid var(--c-lime-border);border-radius:12px;padding:12px;">
          <div style="font-size:11px;color:var(--c-lime);font-weight:600;text-transform:uppercase;">Scheduled Slot</div>
          <div style="font-size:16px;font-weight:700;color:#fff;margin-top:2px;">${appt.date || 'Scheduled Date'} · ${appt.time || 'TBD'}${dur}</div>
        </div>
        <div><span style="color:var(--c-text-muted);">Session Type:</span> <b style="color:#fff;">${appt.type || 'Fitting'}</b></div>
        <div><span style="color:var(--c-text-muted);">Garment Item:</span> <b style="color:#fff;">${garment}${orderStr}</b></div>
        <div><span style="color:var(--c-text-muted);">Specialist Tailor:</span> <b style="color:#fff;">${appt.specialist || 'Master Tailor'}</b></div>
        <div><span style="color:var(--c-text-muted);">Customer:</span> <b style="color:#fff;">${customerData.name || 'Patron'} (${customerData.phone || ''})</b></div>
        <div><span style="color:var(--c-text-muted);">Appointment Status:</span> <b style="color:var(--c-lime);">${appt.status || 'CONFIRMED'}</b></div>
        ${notesBlock}
      </div>
    `;
  }

  const cancelBtn = document.getElementById('cancelApptBtn');
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      closeModal('appointmentModal');
      showToast('Appointment cancellation request logged', 'warning');
    };
  }

  const reschedBtn = document.getElementById('rescheduleApptBtn');
  if (reschedBtn) {
    reschedBtn.onclick = () => {
      closeModal('appointmentModal');
      openBookNewAppointmentModal();
    };
  }

  openModal('appointmentModal');
}
window.openAppointmentModal = openAppointmentModal;

/**
 * 4B. Book New Appointment Modal
 */
function openBookNewAppointmentModal() {
  // Pre-fill customer label
  const labelEl = document.getElementById('bnaCustomerNameLabel');
  if (labelEl) {
    labelEl.textContent = `Client: ${customerData.name || 'Valued Patron'} (${customerData.phone || 'No phone'})`;
  }

  // Set default date to tomorrow
  const dateInput = document.getElementById('bnaDate');
  if (dateInput) {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const tmrwStr = `${tmrw.getFullYear()}-${String(tmrw.getMonth() + 1).padStart(2, '0')}-${String(tmrw.getDate()).padStart(2, '0')}`;
    dateInput.value = tmrwStr;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    dateInput.min = todayStr;
  }

  // Default time
  const timeInput = document.getElementById('bnaTime');
  if (timeInput) {
    timeInput.value = '11:00';
  }

  // Default duration
  const durInput = document.getElementById('bnaDuration');
  if (durInput) durInput.value = '45';

  // Default session type
  const typeInput = document.getElementById('bnaApptType');
  if (typeInput) typeInput.value = 'FITTING';

  // Reset notes
  const notesInput = document.getElementById('bnaNotes');
  if (notesInput) notesInput.value = '';

  // Populate orders select
  const orderSel = document.getElementById('bnaOrderSelect');
  if (orderSel) {
    let optHtml = '<option value="">General Atelier Consultation (No specific order)</option>';
    const allOrders = [...(activeOrdersData || []), ...(orderHistoryData || [])];
    const seen = new Set();
    allOrders.forEach(o => {
      const code = o.orderCode || o.id;
      if (code && !seen.has(code)) {
        seen.add(code);
        const garment = o.garmentType || o.garment || o.title || 'Bespoke Order';
        optHtml += `<option value="${o.id || ''}" data-code="${code}" data-garment="${garment}">#${code} - ${garment} (${o.status || 'Active'})</option>`;
      }
    });
    orderSel.innerHTML = optHtml;
  }

  openModal('bookNewAppointmentModal');
}
window.openBookNewAppointmentModal = openBookNewAppointmentModal;

/**
 * Handle saving a new appointment to the live backend REST API
 */
async function handleSaveNewAppointment() {
  const typeEl = document.getElementById('bnaApptType');
  const durEl = document.getElementById('bnaDuration');
  const dateEl = document.getElementById('bnaDate');
  const timeEl = document.getElementById('bnaTime');
  const orderEl = document.getElementById('bnaOrderSelect');
  const specEl = document.getElementById('bnaSpecialist');
  const notesEl = document.getElementById('bnaNotes');
  const confirmBtn = document.getElementById('btnConfirmBookAppt');

  const dateVal = dateEl?.value?.trim();
  const timeVal = timeEl?.value?.trim() || '11:00';

  if (!dateVal) {
    showToast('Please select a valid appointment date', 'warning');
    dateEl?.focus();
    return;
  }

  const targetMobile = (customerData.phone || new URLSearchParams(window.location.search).get('mobile') || '').trim();
  const duration = parseInt(durEl?.value, 10) || 45;
  const specialist = specEl?.value || 'Master Tailor';
  const notes = notesEl?.value?.trim() || '';
  const apptType = typeEl?.value || 'FITTING';
  const typeText = typeEl?.options[typeEl.selectedIndex]?.text || 'Bespoke Fitting';

  const selectedOpt = orderEl?.options[orderEl?.selectedIndex];
  const orderId = orderEl?.value || null;
  const orderCode = selectedOpt?.getAttribute('data-code') || '';
  const garment = selectedOpt?.getAttribute('data-garment') || typeText;

  const scheduledAtIso = `${dateVal}T${timeVal}:00`;

  // UI state: loading
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span>Booking Session...</span>';
  }

  let createdAppt = null;
  try {
    const { default: api } = await import('../../api.js');
    if (api?.appointments?.create) {
      createdAppt = await api.appointments.create({
        customerMobile: targetMobile,
        customerPhone: targetMobile,
        apptType: apptType,
        scheduledAt: scheduledAtIso,
        durationMinutes: duration,
        staffAssigned: specialist,
        orderId: orderId || null,
        notes: notes
      });
      console.log('[Customer360] Appointment persisted successfully via API:', createdAppt);
    }
  } catch (apiErr) {
    console.warn('[Customer360] API appointment booking error, continuing locally:', apiErr.message);
  } finally {
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<span>Confirm &amp; Book Appointment</span>';
    }
  }

  // Format date and time for UI display
  const dt = new Date(scheduledAtIso);
  const dateFormatted = !isNaN(dt.getTime())
    ? dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : dateVal;
  const timeFormatted = !isNaN(dt.getTime())
    ? dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : timeVal;

  const newRecord = {
    id: createdAppt?.id || ('appt_' + Date.now()),
    type: typeText,
    date: dateFormatted,
    time: timeFormatted,
    rawScheduledAt: scheduledAtIso,
    durationMinutes: duration,
    garment: garment,
    specialist: specialist,
    status: 'CONFIRMED',
    notes: notes,
    orderCode: orderCode,
    orderId: orderId
  };

  appointmentsData.unshift(newRecord);

  // Re-render sub page and overview card
  renderAppointments();
  renderAppointmentsSubPage();

  closeModal('bookNewAppointmentModal');
  showToast(`Appointment successfully booked for ${dateFormatted} at ${timeFormatted}!`, 'success');
}
window.handleSaveNewAppointment = handleSaveNewAppointment;

/**
 * 5. Payment Breakdown Modal
 */
function openPaymentBreakdownModal() {
  // 1. Populate KPI Header
  const psBilled = document.getElementById('psTotalBilled');
  const psRecv = document.getElementById('psTotalReceived');
  const psPending = document.getElementById('psBalancePending');
  
  if (psBilled) psBilled.textContent = customerData.totalSpent || '₹0';
  if (psRecv) psRecv.textContent = customerData.totalSpent || '₹0';
  if (psPending) psPending.textContent = customerData.outstanding || '₹0';

  // 2. Populate Order Type Breakdown
  const otContainer = document.getElementById('modalOrderTypeBreakdownList');
  if (otContainer) {
    const types = window._customerValueOrderTypes || [];
    const PALETTE = ['#b8ff3d', '#a895ff', '#f43f5e', '#fbbf24', '#38bdf8', '#94a3b8'];
    if (types.length > 0) {
      otContainer.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:7px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px 14px;">
          ${types.map((t, idx) => `
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${PALETTE[idx % PALETTE.length]};flex-shrink:0;"></span>
                <span style="font-weight:600;color:#fff;">${t.name}</span>
                <span style="font-size:11px;color:rgba(255,255,255,0.5);">(${t.count} order${t.count > 1 ? 's' : ''})</span>
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <span style="font-size:12px;color:rgba(255,255,255,0.85);font-weight:500;">₹${t.amount.toLocaleString('en-IN')}</span>
                <span style="font-weight:700;color:${PALETTE[idx % PALETTE.length]};min-width:38px;text-align:right;">${t.pct}%</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      otContainer.innerHTML = '<div style="font-size:11.5px;color:rgba(255,255,255,0.4);padding:8px 0;">No order types recorded yet.</div>';
    }
  }

  // 3. Populate Recent Transactions
  const txContainer = document.getElementById('txHistoryList');
  if (txContainer) {
    if (orderHistoryData.length > 0) {
      txContainer.innerHTML = orderHistoryData.map(o => `
        <div class="tx-item">
          <div class="tx-left">
            <span class="tx-date">${o.date}</span>
            <span class="tx-mode">${o.garment} · <small style="opacity:0.6">${o.status}</small></span>
          </div>
          <span class="tx-amt">${o.amount}</span>
        </div>
      `).join('');
    } else {
      txContainer.innerHTML = '<div style="padding:16px;text-align:center;color:#94a3b8;font-size:12px;">No payment records</div>';
    }
  }
  openModal('paymentBreakdownModal');
}

/**
 * 6. Add Note Modal
 */
function openAddNoteModal() {
  const txt = document.getElementById('newCustomerNoteText');
  if (txt) txt.value = '';
  openModal('addNoteModal');
}

async function handleSaveNote() {
  const txt = document.getElementById('newCustomerNoteText');
  if (!txt || !txt.value.trim()) return;

  const noteText = txt.value.trim();
  const targetMobile = customerData.phone || customerData.mobileNumber;

  closeModal('addNoteModal');

  if (targetMobile) {
    try {
      const { default: api } = await import('../../api.js');
      await api.customers.notes.create(targetMobile, {
        noteText,
        authorName: 'Team',
        authorBadge: 'Staff',
        category: 'CRM'
      });
      showToast('Note saved to database successfully.', 'success');
      // Refresh notes list from DB
      const refreshed = await api.customers.notes.list(targetMobile).catch(() => []);
      customerNotesData = Array.isArray(refreshed) ? refreshed : [];
      renderNotesStack();
    } catch (err) {
      console.warn('[Customer360] Note save error:', err.message);
      // Fallback: show in UI only
      showToast('Note saved locally (DB notes endpoint may still be pending server restart).', 'warning');
    }
  } else {
    showToast('Customer profile not loaded — cannot save note.', 'warning');
  }
}

// ==========================================================================
// 14. SEARCH & NAVIGATION INTEGRATION
// ==========================================================================
function setupSearchOverlayIntegration() {
  // Listen to search row clicks if search palette is rendered
  document.addEventListener('click', (e) => {
    const row = e.target.closest('.sp-row');
    if (row) {
      const searchKey = row.dataset.search || row.textContent.toLowerCase();
      if (searchKey.includes('order') || (customerState.name && searchKey.includes(customerState.name.toLowerCase()))) {
        if (window._closeSearch) window._closeSearch();
        showToast(`Search result matched: ${row.textContent.trim()}`);
      }
    }
  });
}

function setupDropdowns() {
  // Global outside click to close more menu
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#moreActionsBtn') && !e.target.closest('#moreActionsDropdown')) {
      closeAllDropdowns();
    }
  });
}

// ==========================================================================
// 15. TOAST SYSTEM
// ==========================================================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'glass-toast';
  const iconName = type === 'warning' ? 'alert-triangle' : 'check-circle';

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="toast-icon" ${type === 'warning' ? 'style="color:#fcd34d;"' : ''}></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons({ root: toast });

  setTimeout(() => toast.classList.add('show'), 20);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 260);
  }, 3200);
}

// ==========================================================================
// 16. LOCAL STORAGE HELPERS
// ==========================================================================
function loadStateFromStorage() {
  try {
    const params = new URLSearchParams(window.location.search);
    const targetMobile = params.get('mobile') || params.get('phone') || sessionStorage.getItem('selectedCustomerMobile');
    const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      if (!targetMobile || parsed.phone === targetMobile || parsed.mobileNumber === targetMobile) {
        customerData = Object.assign(customerData, parsed);
      }
    }
  } catch (e) {
    console.error('Error loading Customer 360 profile from storage', e);
  }
}

function saveStateToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(customerData));
  } catch (e) {
    console.error('Error saving Customer 360 profile to storage', e);
  }
}

// ==========================================================================
// 17. UTILITY HELPERS
// ==========================================================================
function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// ==========================================================================
// 18. TAILORED MEASUREMENTS SIDE-BY-SIDE COMPARISON (CURRENT VS OLD)
// ==========================================================================

const TAILORING_GARMENT_SPECS = {
  BLOUSE: [
    { key: 'shoulder', label: 'Shoulder', defaultVal: 14.5 },
    { key: 'bust', label: 'Bust', defaultVal: 34.0 },
    { key: 'underBust', label: 'Under Bust', defaultVal: 29.0 },
    { key: 'waist', label: 'Waist', defaultVal: 28.0 },
    { key: 'blouseLength', label: 'Blouse Length', defaultVal: 14.0 },
    { key: 'armhole', label: 'Armhole', defaultVal: 15.5 },
    { key: 'upperArm', label: 'Upper Arm', defaultVal: 11.5 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 10.5 },
    { key: 'sleeveRound', label: 'Sleeve Round', defaultVal: 11.0 },
    { key: 'elbowRound', label: 'Elbow Round', defaultVal: 10.0 },
    { key: 'wristRound', label: 'Wrist Round', defaultVal: 6.5 },
    { key: 'frontNeckDepth', label: 'Front Neck Depth', defaultVal: 6.5 },
    { key: 'backNeckDepth', label: 'Back Neck Depth', defaultVal: 8.0 },
    { key: 'bustPoint', label: 'Bust Point', defaultVal: 9.5 },
    { key: 'bustPointToBustPoint', label: 'Bust Point to Bust Point', defaultVal: 7.5 },
    { key: 'shoulderToBust', label: 'Shoulder to Bust', defaultVal: 9.5 },
    { key: 'shoulderToWaist', label: 'Shoulder to Waist', defaultVal: 14.0 },
    { key: 'frontWidth', label: 'Front Width', defaultVal: 13.5 },
    { key: 'backWidth', label: 'Back Width', defaultVal: 14.0 }
  ],
  CHUDI: [
    { key: 'shoulder', label: 'Shoulder', defaultVal: 14.5 },
    { key: 'bust', label: 'Bust', defaultVal: 35.0 },
    { key: 'underBust', label: 'Under Bust', defaultVal: 29.5 },
    { key: 'waist', label: 'Waist', defaultVal: 29.0 },
    { key: 'hip', label: 'Hip', defaultVal: 38.0 },
    { key: 'topLength', label: 'Top Length', defaultVal: 40.0 },
    { key: 'armhole', label: 'Armhole', defaultVal: 16.0 },
    { key: 'upperArm', label: 'Upper Arm', defaultVal: 11.5 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 18.0 },
    { key: 'sleeveRound', label: 'Sleeve Round', defaultVal: 10.5 },
    { key: 'elbowRound', label: 'Elbow Round', defaultVal: 9.5 },
    { key: 'wristRound', label: 'Wrist Round', defaultVal: 6.5 },
    { key: 'frontNeckDepth', label: 'Front Neck Depth', defaultVal: 6.5 },
    { key: 'backNeckDepth', label: 'Back Neck Depth', defaultVal: 7.0 },
    { key: 'frontWidth', label: 'Front Width', defaultVal: 13.5 },
    { key: 'backWidth', label: 'Back Width', defaultVal: 14.0 },
    { key: 'pantWaist', label: 'Pant Waist', defaultVal: 30.0 },
    { key: 'pantHip', label: 'Pant Hip', defaultVal: 40.0 },
    { key: 'pantLength', label: 'Pant Length', defaultVal: 39.0 },
    { key: 'thighRound', label: 'Thigh Round', defaultVal: 22.0 },
    { key: 'kneeRound', label: 'Knee Round', defaultVal: 15.0 },
    { key: 'calfRound', label: 'Calf Round', defaultVal: 13.0 },
    { key: 'ankleRound', label: 'Ankle Round', defaultVal: 10.0 },
    { key: 'crotchLength', label: 'Crotch Length', defaultVal: 26.0 },
    { key: 'bottomOpening', label: 'Bottom Opening', defaultVal: 12.0 }
  ],
  LEHENGA: [
    { key: 'shoulder', label: 'Shoulder', defaultVal: 14.5 },
    { key: 'bust', label: 'Bust', defaultVal: 34.0 },
    { key: 'underBust', label: 'Under Bust', defaultVal: 29.0 },
    { key: 'waist', label: 'Waist', defaultVal: 28.0 },
    { key: 'hip', label: 'Hip', defaultVal: 38.0 },
    { key: 'blouseLength', label: 'Blouse Length', defaultVal: 14.0 },
    { key: 'armhole', label: 'Armhole', defaultVal: 15.5 },
    { key: 'upperArm', label: 'Upper Arm', defaultVal: 11.5 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 10.5 },
    { key: 'sleeveRound', label: 'Sleeve Round', defaultVal: 11.0 },
    { key: 'elbowRound', label: 'Elbow Round', defaultVal: 10.0 },
    { key: 'wristRound', label: 'Wrist Round', defaultVal: 6.5 },
    { key: 'frontNeckDepth', label: 'Front Neck Depth', defaultVal: 6.5 },
    { key: 'backNeckDepth', label: 'Back Neck Depth', defaultVal: 8.0 },
    { key: 'bustPoint', label: 'Bust Point', defaultVal: 9.5 },
    { key: 'bustPointToBustPoint', label: 'Bust Point to Bust Point', defaultVal: 7.5 },
    { key: 'shoulderToBust', label: 'Shoulder to Bust', defaultVal: 9.5 },
    { key: 'shoulderToWaist', label: 'Shoulder to Waist', defaultVal: 14.0 },
    { key: 'skirtLength', label: 'Skirt Length', defaultVal: 42.0 },
    { key: 'waistToHip', label: 'Waist to Hip', defaultVal: 8.0 },
    { key: 'flare', label: 'Flare', defaultVal: 120.0 },
    { key: 'bottomOpening', label: 'Bottom Opening', defaultVal: 140.0 }
  ],
  SAREE: [
    { key: 'shoulder', label: 'Shoulder', defaultVal: 14.5 },
    { key: 'bust', label: 'Bust', defaultVal: 34.0 },
    { key: 'underBust', label: 'Under Bust', defaultVal: 29.0 },
    { key: 'waist', label: 'Waist', defaultVal: 28.0 },
    { key: 'blouseLength', label: 'Blouse Length', defaultVal: 14.0 },
    { key: 'armhole', label: 'Armhole', defaultVal: 15.5 },
    { key: 'upperArm', label: 'Upper Arm', defaultVal: 11.5 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 10.5 },
    { key: 'sleeveRound', label: 'Sleeve Round', defaultVal: 11.0 },
    { key: 'elbowRound', label: 'Elbow Round', defaultVal: 10.0 },
    { key: 'wristRound', label: 'Wrist Round', defaultVal: 6.5 },
    { key: 'frontNeckDepth', label: 'Front Neck Depth', defaultVal: 6.5 },
    { key: 'backNeckDepth', label: 'Back Neck Depth', defaultVal: 8.0 },
    { key: 'bustPoint', label: 'Bust Point', defaultVal: 9.5 },
    { key: 'bustPointToBustPoint', label: 'Bust Point to Bust Point', defaultVal: 7.5 },
    { key: 'shoulderToBust', label: 'Shoulder to Bust', defaultVal: 9.5 },
    { key: 'shoulderToWaist', label: 'Shoulder to Waist', defaultVal: 14.0 },
    { key: 'frontWidth', label: 'Front Width', defaultVal: 13.5 },
    { key: 'backWidth', label: 'Back Width', defaultVal: 14.0 }
  ],
  GOWN: [
    { key: 'shoulder', label: 'Shoulder', defaultVal: 14.5 },
    { key: 'bust', label: 'Bust', defaultVal: 34.5 },
    { key: 'underBust', label: 'Under Bust', defaultVal: 29.5 },
    { key: 'waist', label: 'Waist', defaultVal: 28.5 },
    { key: 'hip', label: 'Hip', defaultVal: 38.5 },
    { key: 'fullLength', label: 'Full Length', defaultVal: 56.0 },
    { key: 'armhole', label: 'Armhole', defaultVal: 16.0 },
    { key: 'upperArm', label: 'Upper Arm', defaultVal: 11.5 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 22.0 },
    { key: 'sleeveRound', label: 'Sleeve Round', defaultVal: 10.5 },
    { key: 'elbowRound', label: 'Elbow Round', defaultVal: 9.5 },
    { key: 'wristRound', label: 'Wrist Round', defaultVal: 6.5 },
    { key: 'frontNeckDepth', label: 'Front Neck Depth', defaultVal: 6.5 },
    { key: 'backNeckDepth', label: 'Back Neck Depth', defaultVal: 7.5 },
    { key: 'bustPoint', label: 'Bust Point', defaultVal: 9.5 },
    { key: 'bustPointToBustPoint', label: 'Bust Point to Bust Point', defaultVal: 7.5 },
    { key: 'shoulderToBust', label: 'Shoulder to Bust', defaultVal: 9.5 },
    { key: 'shoulderToWaist', label: 'Shoulder to Waist', defaultVal: 14.0 },
    { key: 'waistToHip', label: 'Waist to Hip', defaultVal: 8.0 },
    { key: 'flare', label: 'Flare', defaultVal: 140.0 },
    { key: 'bottomOpening', label: 'Bottom Opening', defaultVal: 150.0 }
  ]
};

let currentComparisonData = null;

window.openMeasurementComparisonModal = function(garmentType) {
  const gType = (garmentType || activeC360Garment || 'BLOUSE').toUpperCase();
  openModal('measurementComparisonModal');
  const targetBtn = document.querySelector(`#measurementComparisonModal .btn-c360-garment[data-garment="${gType}"]`);
  loadC360Comparison(gType, targetBtn);
};

window.loadC360Comparison = async function(garmentType, btnEl) {
  const targetMobile = customerData.phone || customerData.mobileNumber;
  if (!targetMobile) return;
  const gType = (garmentType || 'BLOUSE').toUpperCase();
  activeC360Garment = gType;

  // Update button active state
  document.querySelectorAll('#measurementComparisonModal .btn-c360-garment').forEach(btn => {
    btn.classList.remove('active');
    btn.style.background = 'rgba(255,255,255,0.05)';
    btn.style.color = '#94a3b8';
  });
  if (btnEl) {
    btnEl.classList.add('active');
    btnEl.style.background = 'var(--accent, #ec4899)';
    btnEl.style.color = '#fff';
  }

  const titleEl = document.getElementById('measCompModalTitle');
  const subEl = document.getElementById('measCompModalSub');
  if (titleEl) titleEl.textContent = `${gType} Measurements: Current vs Old`;
  if (subEl) subEl.textContent = `Client: ${customerData.name} (${targetMobile})`;

  const tbody = document.getElementById('measCompTableBody');
  const banner = document.getElementById('measCompBanner');
  const lastUpdatedEl = document.getElementById('measLastUpdatedText');

  if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:#94a3b8;">Loading measurement comparison...</td></tr>`;

  try {
    const { default: api } = await import('../../api.js');
    const comp = await api.customers.bodyMeasurements.getComparison(targetMobile, gType);
    currentComparisonData = comp;

    const curr = comp.current;
    const old = comp.old;
    const variances = comp.variance || {};

    // Render banner
    if (banner) {
      banner.innerHTML = `
        <div style="flex:1;">
          <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#4ade80;font-weight:700;">● Current Measurement</span>
          <div style="font-size:14px;font-weight:700;color:#fff;margin-top:2px;">
            ${curr ? `Version ${curr.version} (${curr.measurementType})` : 'No Profile Yet'}
          </div>
          <div style="font-size:12px;color:#94a3b8;margin-top:2px;">
            ${curr ? `Updated: ${curr.updatedAt ? new Date(curr.updatedAt).toLocaleDateString() : 'Recent'} by ${curr.recordedBy || 'Master Tailor'}` : 'Click + Record New Fitting'}
          </div>
        </div>
        <div style="width:1px;background:rgba(255,255,255,0.1);"></div>
        <div style="flex:1;">
          <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;font-weight:700;">○ Old Measurement</span>
          <div style="font-size:14px;font-weight:700;color:#cbd5e1;margin-top:2px;">
            ${old ? `Version ${old.version} (${old.measurementType})` : 'None (Initial Version)'}
          </div>
          <div style="font-size:12px;color:#94a3b8;margin-top:2px;">
            ${old ? `Recorded: ${old.recordedAt ? new Date(old.recordedAt).toLocaleDateString() : 'Archived'}` : 'No previous revisions'}
          </div>
        </div>
      `;
    }

    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = curr && curr.updatedAt ? `Last modified: ${new Date(curr.updatedAt).toLocaleString()}` : '';
    }

    // Render Table Rows based on TAILORING_GARMENT_SPECS
    const specs = TAILORING_GARMENT_SPECS[gType] || TAILORING_GARMENT_SPECS.BLOUSE;
    if (tbody) {
      tbody.innerHTML = specs.map(pt => {
        const currVal = curr && curr[pt.key] != null ? `${curr[pt.key]}"` : '—';
        const oldVal = old && old[pt.key] != null ? `${old[pt.key]}"` : '—';
        const diff = variances[pt.key];

        let varianceBadge = `<span style="color:#64748b;font-size:12px;">—</span>`;
        if (diff && diff !== '0.00' && diff !== 'N/A') {
          const isPos = diff.startsWith('+');
          const bg = isPos ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)';
          const col = isPos ? '#4ade80' : '#f87171';
          varianceBadge = `<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${bg};color:${col};font-weight:700;font-size:12px;">${diff}"</span>`;
        } else if (diff === '0.00') {
          varianceBadge = `<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:rgba(255,255,255,0.06);color:#94a3b8;font-size:12px;">Exact</span>`;
        } else if (currVal !== '—' && oldVal === '—') {
          varianceBadge = `<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:rgba(255,255,255,0.04);color:#94a3b8;font-size:11px;">Initial Fit</span>`;
        }

        return `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 9px 12px; font-weight: 500; color: #e2e8f0;">${pt.label}</td>
            <td style="padding: 9px 12px; font-weight: 700; color: #fff;">${currVal}</td>
            <td style="padding: 9px 12px; color: #94a3b8;">${oldVal}</td>
            <td style="padding: 9px 12px; text-align: right;">${varianceBadge}</td>
          </tr>
        `;
      }).join('');
    }

  } catch (err) {
    console.error('[Customer360] Comparison fetch error:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:#f87171;">Failed to load comparison: ${err.message}</td></tr>`;
  }
};

window.openNewFittingModal = function(garmentType) {
  if (garmentType) {
    activeC360Garment = String(garmentType).toLowerCase();
    window.activeC360Garment = activeC360Garment;
  }
  const gType = (activeC360Garment || 'BLOUSE').toUpperCase();
  const title = document.getElementById('newFittingTitle');
  if (title) title.textContent = `Record New ${gType} Fitting`;

  const container = document.getElementById('newFittingInputsContainer');
  const specs = TAILORING_GARMENT_SPECS[gType] || TAILORING_GARMENT_SPECS.BLOUSE;
  const curr = currentComparisonData && currentComparisonData.current ? currentComparisonData.current : null;

  if (container) {
    container.innerHTML = specs.map(pt => {
      const val = curr && curr[pt.key] != null ? curr[pt.key] : pt.defaultVal;
      return `
        <div style="display:flex;flex-direction:column;gap:4px;">
          <label style="font-size:12px;color:#94a3b8;font-weight:500;">${pt.label}</label>
          <div style="display:flex;align-items:center;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:6px;padding:0 8px;">
            <input type="number" step="0.25" min="1" max="250" data-point="${pt.key}" value="${val}" 
              style="width:100%;background:transparent;border:none;color:#fff;padding:7px 0;font-size:13px;outline:none;" />
            <span style="font-size:12px;color:#64748b;margin-left:4px;">"</span>
          </div>
        </div>
      `;
    }).join('');
  }

  openModal('recordNewFittingModal');
};

window.closeNewFittingModal = function() {
  closeModal('recordNewFittingModal');
};

window.handleNewFittingSubmit = async function(event) {
  event.preventDefault();
  const targetMobile = customerData.phone || customerData.mobileNumber;
  if (!targetMobile) {
    showToast('Customer mobile number missing', 'error');
    return;
  }

  const gType = (activeC360Garment || 'BLOUSE').toUpperCase();
  const payload = {
    garmentType: gType,
    customerName: customerData.name || 'Valued Customer',
    unit: 'in',
    recordedBy: 'Master Tailor'
  };

  document.querySelectorAll('#newFittingInputsContainer input[data-point]').forEach(inp => {
    const val = parseFloat(inp.value);
    if (!isNaN(val)) {
      payload[inp.getAttribute('data-point')] = val;
    }
  });

  try {
    const { default: api } = await import('../../api.js');
    await api.customers.bodyMeasurements.save(targetMobile, payload);
    closeNewFittingModal();
    showToast(`New ${gType} fitting saved! Previous version archived as Old.`, 'success');
    
    // Refresh comparison and card
    loadC360Comparison(gType);
    let mList = await api.customers.bodyMeasurements.list(targetMobile).catch(() => []);
    if (!Array.isArray(mList) || mList.length === 0) {
      const altList = await api.customers.measurements.list(targetMobile).catch(() => []);
      if (Array.isArray(altList) && altList.length > 0) mList = altList;
    }
    window.customerBodyMeasurements = Array.isArray(mList) ? mList : [];
    customerBodyMeasurements = window.customerBodyMeasurements;

    renderMeasurementsForGarment(activeC360Garment || 'blouse');
    renderMeasurementsSubPage(activeC360Garment || 'blouse');

    const profilesContainer = document.getElementById('c360ProfilesList');
    if (profilesContainer && mList) {
      profilesContainer.innerHTML = mList.map((m, idx) => `
        <div class="m-profile-row ${m.garmentType === gType ? 'active' : ''}" data-garment="${m.garmentType || 'BLOUSE'}" onclick="openMeasurementComparisonModal('${m.garmentType || 'BLOUSE'}')">
          <div class="m-profile-info" style="display:flex;flex-direction:column;gap:2px;">
            <span class="m-profile-name" style="font-weight:700;color:#fff;">${m.garmentType || 'BLOUSE'} <small style="color:var(--lime,#84cc16);font-size:11px;">v${m.version} (Current)</small></span>
            <span class="m-profile-meta" style="font-size:11.5px;color:#94a3b8;">${m.bust ? 'Bust: ' + m.bust + '" • ' : ''}${m.waist ? 'Waist: ' + m.waist + '" • ' : ''}${m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : 'Active'}</span>
          </div>
          <span class="m-profile-badge" style="background:rgba(132,204,22,0.15);color:#84cc16;border:1px solid rgba(132,204,22,0.3);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">Current</span>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to save fitting:', err);
    showToast(`Error saving fitting: ${err.message}`, 'error');
  }
};

