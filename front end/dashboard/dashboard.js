/* ============================================================
   HAULO BOUTIQUE ERP — Dashboard Controller
   Matches Reference Visual Specification Exactly
   Handles: real API data, SVG icons, Chart.js, interactions, clock
   ============================================================ */

'use strict';

// ── API integration (ES module import at module level) ──────
// Note: dashboard.html must add type="module" to the script tag.
import api, { Auth } from '../api.js?v=6';

// ─────────────────────────────────────────────
// DATA STORE (Reactive — strictly populated via API)
// ─────────────────────────────────────────────
const dashboardData = {
  user: {
    name: 'Administrator',
    role: 'Administrator',
    initials: 'AD',
    avatar: '../assets/user_avatar.jpg'
  },
  kpi: [
    { label: 'Total Revenue',        value: '—', sub: '—', subClass: 'kpi-growth', iconClass: 'kpi-lime',     icon: 'rupee'    },
    { label: 'Total Orders',         value: '—', sub: '—', subClass: 'kpi-growth', iconClass: 'kpi-lavender', icon: 'orders'   },
    { label: 'Active Customers',     value: '—', sub: '—', subClass: 'kpi-growth', iconClass: 'kpi-pink',     icon: 'users'    },
    { label: 'Orders in Production', value: '—', sub: '—', subClass: 'kpi-note',   iconClass: 'kpi-gold',     icon: 'scissors' },
    { label: 'Low Stock Items',      value: '—', sub: '—', subClass: 'kpi-warn',   iconClass: 'kpi-blue',     icon: 'box'      },
    { label: 'Pending Payments',     value: '—', sub: '—', subClass: 'kpi-warn',   iconClass: 'kpi-red',      icon: 'card'     },
  ],
  healthMetrics: [
    { label: 'Financial Health',   pct: 0, growth: '—', color: '#a3e635' },
    { label: 'Operational Health', pct: 0, growth: '—', color: '#38bdf8' },
    { label: 'Customer Health',    pct: 0, growth: '—', color: '#fbbf24' },
    { label: 'People Health',      pct: 0, growth: '—', color: '#c084fc' },
  ],
  revenue: {
    labels: [],
    revenue: [],
    cost: [],
  },
  orders: [],
  production: [],
  schedule: [],
  recentOrders: [],
  quickActions: [
    { label: 'New Order',        icon: 'plus',     bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', nav: 'orders'        },
    { label: 'New Enquiry',      icon: 'chat',     bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff', nav: 'enquiries'     },
    { label: 'Add Customer',     icon: 'users',    bg: '#ffe4e6', color: '#be123c', border: '#fecdd3', nav: 'customers'     },
    { label: 'Book Appointment', icon: 'calendar', bg: '#fef3c7', color: '#b45309', border: '#fde68a', nav: 'appointments'  },
    { label: 'Create Design',    icon: 'pen',      bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe', nav: 'design-studio' },
    { label: 'Check Inventory',  icon: 'box',      bg: '#ccfbf1', color: '#0f766e', border: '#99f6e4', nav: 'stock'         },
    { label: 'Record Payment',   icon: 'card',     bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', nav: 'payments'      },
    { label: 'Generate Report',  icon: 'chart',    bg: '#fce7f3', color: '#be185d', border: '#fbcfe8', nav: 'reports'       },
  ]
};

// ─────────────────────────────────────────────
// SVG ICON LIBRARY
// ─────────────────────────────────────────────
function icon(name, size = 18, stroke = 'currentColor', sw = 2) {
  const s = `viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" width="${size}" height="${size}"`;
  const icons = {
    rupee:    `<svg ${s}><path d="M6 3h12M6 8h12M9 21l-3-13h12M14 21l-2-5"/><path d="M6 8c0 0 0 4 5 4s5-4 5-4"/></svg>`,
    orders:   `<svg ${s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    users:    `<svg ${s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    scissors: `<svg ${s}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
    box:      `<svg ${s}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    card:     `<svg ${s}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    plus:     `<svg ${s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    chat:     `<svg ${s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    calendar: `<svg ${s}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    pen:      `<svg ${s}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    chart:    `<svg ${s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    pencil:   `<svg ${s}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    layers:   `<svg ${s}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    star:     `<svg ${s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    needle:   `<svg ${s}><line x1="5" y1="19" x2="19" y2="5"/><circle cx="17" cy="7" r="2"/><path d="M5 19c0 0 4-1 6-3s3-6 3-6"/></svg>`,
    anchor:   `<svg ${s}><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`,
    person:   `<svg ${s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    shield:   `<svg ${s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    check:    `<svg ${s}><polyline points="20 6 9 17 4 12"/></svg>`,
  };
  return icons[name] || `<svg ${s}><circle cx="12" cy="12" r="5"/></svg>`;
}

// ─────────────────────────────────────────────
// LIVE CLOCK & GREETING
// ─────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const day    = days[now.getDay()];
  const d      = now.getDate();
  const m      = months[now.getMonth()];
  const y      = now.getFullYear();
  let h        = now.getHours();
  const min    = String(now.getMinutes()).padStart(2, '0');
  const ampm   = h >= 12 ? 'PM' : 'AM';
  const h12    = h % 12 || 12;

  const dateEl = document.getElementById('liveDate');
  const timeEl = document.getElementById('liveTime');
  const lastEl = document.getElementById('lastUpdated');
  const todEl  = document.getElementById('timeOfDay');

  if (dateEl) dateEl.textContent = `${day}, ${d} ${m} ${y}`;
  if (timeEl) timeEl.textContent = `${String(h12).padStart(2, '0')}:${min} ${ampm}`;
  if (lastEl) lastEl.textContent = `Last updated: ${d} ${m} ${y}, ${String(h12).padStart(2, '0')}:${min} ${ampm}`;
  if (todEl) {
    todEl.textContent = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }
}

// ─────────────────────────────────────────────
// RENDER 6 KPI CARDS
// ─────────────────────────────────────────────
function renderKPI() {
  const container = document.getElementById('kpiRow');
  if (!container) return;
  container.innerHTML = dashboardData.kpi.map(k => `
    <div class="card kpi-card">
      <div class="kpi-icon-wrap ${k.iconClass}">${icon(k.icon, 18, 'currentColor', 2)}</div>
      <div class="kpi-body">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-sub ${k.subClass}">${k.sub}</div>
      </div>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────
// RENDER HEALTH METRICS
// ─────────────────────────────────────────────
function renderHealthMetrics() {
  const el = document.getElementById('healthMetrics');
  if (!el) return;
  el.innerHTML = dashboardData.healthMetrics.map(m => `
    <div class="health-metric-item">
      <div class="health-metric-header">
        <div class="health-metric-dot" style="background:${m.color};"></div>
        <div class="health-metric-pct">${m.pct}%</div>
        <div class="health-metric-growth">${m.growth}</div>
      </div>
      <div class="health-metric-label">${m.label}</div>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────
// RENDER ORDER COMPLETION LEGEND
// ─────────────────────────────────────────────
function renderOrdersLegend() {
  const el = document.getElementById('ordersLegend');
  if (!el) return;
  if (!dashboardData.orders || dashboardData.orders.length === 0) {
    el.innerHTML = '<div style="color:rgba(255,255,255,0.4);font-size:11.5px;padding:8px 0;">No active order records</div>';
    return;
  }
  el.innerHTML = dashboardData.orders.map(o => `
    <div class="order-legend-row">
      <div class="order-legend-dot" style="background:${o.color};"></div>
      <span class="order-legend-label">${o.label}</span>
      <span class="order-legend-count">${o.count}</span>
      <span class="order-legend-pct">${o.pct}</span>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────
// RENDER PRODUCTION PULSE PIPELINE
// ─────────────────────────────────────────────
function formatStageImg(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const clean = url.replace(/^\/?front\s*end\//i, '').replace(/^\/+/, '');
  const origin = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ? window.location.origin
    : '';
  return origin ? `${origin}/front%20end/${clean}` : `/${clean}`;
}

function renderProduction() {
  const el = document.getElementById('productionPipeline');
  if (!el) return;
  const stages = dashboardData.production;
  if (!stages || stages.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:16px;color:rgba(255,255,255,0.4);font-size:12.5px;width:100%;">No active production stages.</div>';
    return;
  }
  let html = '';
  stages.forEach((s, i) => {
    const imgSrc = s.imageUrl ? formatStageImg(s.imageUrl) : '';
    const circleContent = imgSrc
      ? `<img src="${imgSrc}" alt="${s.name}" class="prod-circle-img" onerror="this.onerror=null; this.parentElement.classList.remove('has-img'); this.parentElement.innerHTML='${icon(s.icon || 'needle', 17, s.color, 2)}';" />`
      : `${icon(s.icon || 'needle', 17, s.color, 2)}`;

    html += `
      <div class="pipeline-stage-wrap" onclick="navigate('production-floor')" title="View ${s.name} (${s.count} garments)">
        <div class="prod-circle ${imgSrc ? 'has-img' : ''}" style="${imgSrc ? `border-color:${s.color || 'rgba(212,175,55,0.6)'};` : `background:${s.color}22; border-color:${s.color}66;`}">
          ${circleContent}
        </div>
        <div class="prod-num">${s.count}</div>
        <div class="prod-name">${s.name}</div>
      </div>
    `;
    if (i < stages.length - 1) {
      html += `<div class="pipeline-connector"><div class="pipeline-connector-line"></div></div>`;
    }
  });
  el.innerHTML = html;
  setupProductionScroll();
}

function setupProductionScroll() {
  const viewport = document.getElementById('productionScrollViewport');
  const prevBtn = document.getElementById('pipePrevBtn');
  const nextBtn = document.getElementById('pipeNextBtn');
  if (!viewport) return;

  function updateArrows() {
    if (!prevBtn || !nextBtn) return;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    prevBtn.disabled = viewport.scrollLeft <= 3;
    nextBtn.disabled = maxScroll <= 3 || viewport.scrollLeft >= maxScroll - 3;
  }

  if (prevBtn && !prevBtn._wired) {
    prevBtn._wired = true;
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const stage = viewport.querySelector('.pipeline-stage-wrap');
      const step = stage ? (stage.offsetWidth + 16) * 2 : 180;
      viewport.scrollBy({ left: -step, behavior: 'smooth' });
    });
  }

  if (nextBtn && !nextBtn._wired) {
    nextBtn._wired = true;
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const stage = viewport.querySelector('.pipeline-stage-wrap');
      const step = stage ? (stage.offsetWidth + 16) * 2 : 180;
      viewport.scrollBy({ left: step, behavior: 'smooth' });
    });
  }

  if (!viewport._wired) {
    viewport._wired = true;
    viewport.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);

    // Mouse drag-to-scroll
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    viewport.addEventListener('mousedown', (e) => {
      isDown = true;
      hasMoved = false;
      startX = e.pageX - viewport.offsetLeft;
      scrollLeft = viewport.scrollLeft;
      viewport.style.cursor = 'grabbing';
      viewport.style.userSelect = 'none';
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      viewport.style.cursor = '';
      viewport.style.removeProperty('user-select');
    });

    viewport.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - viewport.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 4) hasMoved = true;
      viewport.scrollLeft = scrollLeft - walk;
    });

    viewport.addEventListener('click', (e) => {
      if (hasMoved) {
        e.stopPropagation();
        e.preventDefault();
        hasMoved = false;
      }
    }, true);
  }

  requestAnimationFrame(() => updateArrows());
}

// ─────────────────────────────────────────────
// RENDER TODAY'S SCHEDULE
// ─────────────────────────────────────────────
function renderSchedule() {
  const el = document.getElementById('scheduleList');
  if (!el) return;
  if (!dashboardData.schedule || dashboardData.schedule.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.4);font-size:12.5px;">No appointments scheduled for today.</div>';
    return;
  }
  el.innerHTML = dashboardData.schedule.map(s => {
    const avatarMarkup = typeof window.renderPatronAvatarHtml === 'function'
      ? window.renderPatronAvatarHtml(s.name, s.avatar, 'haulo-avatar-xs', 'width:30px;height:30px;border-radius:8px;')
      : `<div class="schedule-avatar">${s.initials}</div>`;

    return `
      <div class="schedule-row" onclick="navigate('appointments')" title="Appointment with ${s.name}">
        <div class="schedule-time">${s.time}</div>
        ${avatarMarkup}
        <div class="schedule-info">
          <div class="schedule-name">${s.name}</div>
          <div class="schedule-type">${s.type}</div>
        </div>
        <div class="schedule-tag">${s.loc}</div>
      </div>
    `;
  }).join('');
}

// ─────────────────────────────────────────────
// RENDER RECENT ORDERS TABLE
// ─────────────────────────────────────────────
function getStatusBadge(status) {
  const map = {
    'In Production':     'status-in-prod',
    'Cutting':           'status-cutting',
    'Ready for Delivery':'status-ready',
    'Trial':             'status-trial',
  };
  const stLower = (status || '').toLowerCase().trim();
  // Dynamically resolve image from live production stages data (zero hardcoded URLs)
  const matched = (dashboardData.production || []).find(p => {
    const nameMatch = p.name && p.name.toLowerCase() === stLower;
    const stageMatch = p.stage && p.stage.toLowerCase() === stLower.replace(/[\s-]+/g, '_');
    const inProdMatch = (stLower === 'in production' || stLower === 'in-progress') && (p.stage === 'STITCHING' || p.stage === 'CUTTING');
    const readyMatch = (stLower.includes('ready') || stLower.includes('delivery')) && (p.stage === 'READY');
    return nameMatch || stageMatch || inProdMatch || readyMatch;
  });
  const art = matched?.imageUrl ? formatStageImg(matched.imageUrl) : '';
  const imgHtml = art ? `<img src="${art}" style="width:14px;height:14px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:5px;border:1px solid rgba(212,175,55,0.7);" alt="" onerror="this.remove()" />` : '';
  return `<span class="status-badge ${map[status] || 'status-in-prod'}" style="display:inline-flex;align-items:center;">${imgHtml}<span>${status}</span></span>`;
}
function getPaymentBadge(pay) {
  const map = {
    'Paid':         'pay-paid',
    'Advance Paid': 'pay-advance',
    'Partial':      'pay-partial'
  };
  return `<span class="payment-badge ${map[pay] || 'pay-partial'}">${pay}</span>`;
}
function renderOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;
  if (!dashboardData.recentOrders || dashboardData.recentOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:rgba(255,255,255,0.4);">No recent orders found.</td></tr>';
    return;
  }
  tbody.innerHTML = dashboardData.recentOrders.map(o => `
    <tr>
      <td><span class="order-num">${o.id}</span></td>
      <td>${o.date}</td>
      <td class="order-customer">${o.customer}</td>
      <td>${o.garments}</td>
      <td class="order-amount">${o.amount}</td>
      <td>${getStatusBadge(o.status)}</td>
      <td>${getPaymentBadge(o.payment)}</td>
      <td>${o.due}</td>
      <td><button class="view-btn" onclick="navigate('orders')">View</button></td>
    </tr>
  `).join('');
}

// ─────────────────────────────────────────────
// RENDER QUICK ACTIONS
// ─────────────────────────────────────────────
function renderQuickActions() {
  const el = document.getElementById('quickGrid');
  if (!el) return;
  el.innerHTML = dashboardData.quickActions.map(q => `
    <div class="quick-btn" onclick="navigate('${q.nav}')" title="${q.label}" style="background:${q.bg}; border: 1px solid ${q.border}; color:${q.color};">
      <div class="quick-btn-icon" style="color:${q.color};">
        ${icon(q.icon, 15, q.color, 2.2)}
      </div>
      <span class="quick-btn-label">${q.label}</span>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────
// CHARTS (Chart.js Configs)
// ─────────────────────────────────────────────
function applyChartDefaults() {
  if (typeof Chart !== 'undefined') {
    Chart.defaults.color = 'rgba(255, 255, 255, 0.6)';
    Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
    Chart.defaults.font.size = 10;
  }
}

let healthChartInstance = null;
let revenueChartInstance = null;
let donutChartInstance = null;

// 1. Business Health Doughnut Chart
function initHealthChart() {
  if (typeof Chart === 'undefined') return;
  const canvas = document.getElementById('healthChart');
  if (!canvas) return;
  if (healthChartInstance) {
    healthChartInstance.destroy();
    healthChartInstance = null;
  }
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 100);
  gradient.addColorStop(0, '#b4f039');
  gradient.addColorStop(1, '#8dc63f');

  const validMetrics = dashboardData.healthMetrics.filter(h => h.pct > 0);
  const avgScore = validMetrics.length > 0
    ? Math.round((validMetrics.reduce((sum, h) => sum + (h.pct || 0), 0)) / validMetrics.length)
    : 0;
  const healthPctEl = document.getElementById('healthOverallPct') || document.querySelector('.health-pct');
  if (healthPctEl) healthPctEl.textContent = avgScore + '%';

  healthChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [avgScore, Math.max(0, 100 - avgScore)],
        backgroundColor: [gradient, 'rgba(255, 255, 255, 0.08)'],
        borderWidth: 0,
        hoverOffset: 0,
      }]
    },
    options: {
      cutout: '76%',
      rotation: -90,
      circumference: 360,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { animateRotate: true, duration: 1000 },
    }
  });
}

// 2. Revenue Trend Grouped Bar Chart
function initRevenueChart() {
  if (typeof Chart === 'undefined') return;
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;
  if (revenueChartInstance) {
    revenueChartInstance.destroy();
    revenueChartInstance = null;
  }
  const ctx = canvas.getContext('2d');
  const d = dashboardData.revenue;
  const tooltip = document.getElementById('chartTooltip');

  const labels = (d.labels && d.labels.length > 0) ? d.labels : ['—'];
  const revData = (d.revenue && d.revenue.length > 0) ? d.revenue : [0];
  const costData = (d.cost && d.cost.length > 0) ? d.cost : [0];

  revenueChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Revenue',
          data: revData,
          backgroundColor: '#a3e635',
          borderRadius: 4,
          borderSkipped: false,
          barPercentage: 0.46,
          categoryPercentage: 0.72,
        },
        {
          label: 'Cost',
          data: costData,
          backgroundColor: '#c084fc',
          borderRadius: 4,
          borderSkipped: false,
          barPercentage: 0.46,
          categoryPercentage: 0.72,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          external(context) {
            const { chart, tooltip: tt } = context;
            if (tt.opacity === 0) { tooltip?.classList.remove('visible'); return; }
            if (!tooltip) return;
            const pos = chart.canvas.getBoundingClientRect();
            const revVal = tt.dataPoints && tt.dataPoints[0] ? Number(tt.dataPoints[0].raw).toLocaleString('en-IN') : '0';
            const costVal = tt.dataPoints && tt.dataPoints[1] ? Number(tt.dataPoints[1].raw).toLocaleString('en-IN') : '0';
            tooltip.innerHTML = `
              <div class="tooltip-title">${(tt.title && tt.title[0]) || ''}</div>
              <div class="tooltip-row"><div class="tooltip-dot" style="background:#a3e635;"></div> Revenue: ₹${revVal}</div>
              <div class="tooltip-row"><div class="tooltip-dot" style="background:#c084fc;"></div> Cost: ₹${costVal}</div>
            `;
            tooltip.style.left = pos.left + window.scrollX + tt.caretX + 'px';
            tooltip.style.top  = pos.top  + window.scrollY + tt.caretY - 60 + 'px';
            tooltip.classList.add('visible');
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: 'rgba(255, 255, 255, 0.55)', font: { size: 9.5 } }
        },
        y: { display: false, grid: { display: false } }
      }
    }
  });
}

// 3. Order Completion Doughnut Chart
function initDonutChart() {
  if (typeof Chart === 'undefined') return;
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;
  if (donutChartInstance) {
    donutChartInstance.destroy();
    donutChartInstance = null;
  }
  const ctx = canvas.getContext('2d');
  const d = dashboardData.orders;
  const tooltip = document.getElementById('chartTooltip');

  if (!d || d.length === 0) {
    donutChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['No Orders'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(255, 255, 255, 0.08)'],
          borderWidth: 0,
        }]
      },
      options: {
        cutout: '70%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      }
    });
    return;
  }

  donutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: d.map(o => o.label),
      datasets: [{
        data: d.map(o => o.count),
        backgroundColor: d.map(o => o.color),
        hoverBackgroundColor: d.map(o => o.color),
        borderWidth: 2,
        borderColor: 'rgba(45, 36, 32, 0.7)',
        hoverOffset: 3,
      }]
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          external(context) {
            const { chart, tooltip: tt } = context;
            if (tt.opacity === 0) { tooltip?.classList.remove('visible'); return; }
            if (!tooltip) return;
            const pos = chart.canvas.getBoundingClientRect();
            const idx = tt.dataPoints[0].dataIndex;
            const item = d[idx];
            tooltip.innerHTML = `
              <div class="tooltip-title">${item.label}</div>
              <div class="tooltip-row"><div class="tooltip-dot" style="background:${item.color};"></div> Count: ${item.count} (${item.pct})</div>
            `;
            tooltip.style.left = pos.left + window.scrollX + tt.caretX + 'px';
            tooltip.style.top  = pos.top  + window.scrollY + tt.caretY - 50 + 'px';
            tooltip.classList.add('visible');
          }
        }
      },
      animation: { animateRotate: true, duration: 900 }
    }
  });
}

// ─────────────────────────────────────────────
// NAVIGATION HANDLER
// ─────────────────────────────────────────────
function navigate(module) {
  if (typeof navNavigate === 'function') {
    navNavigate(module);
    return;
  }
  const moduleMap = {
    'orders':          null,
    'enquiries':       '../enquiries/enquiries.html',
    'customers':       '../customer/customer-overview/customer-overview.html',
    'designs':         '../DesignStudio/design-studio.html',
    'design-studio':   '../DesignStudio/design-studio.html',
    'measurements':    '../Measurements/measurement-overview/measurement-overview.html',
    'measurement-overview': '../Measurements/measurement-overview/measurement-overview.html',
    'measurement360':  '../Measurements/measurement360/measurement360.html',
    'workforce':       '../WorkforceManagement/workforce.html',
    'employees':       '../WorkforceManagement/workforce.html',
    'attendance':      '../WorkforceManagement/workforce.html',
    'stock':           null,
    'payments':        null,
    'appointments':    null,
    'production-room': null,
    'production-floor':null,
    'job-cards':       null,
    'trials-alterations': '../trials-alterations/trials-alterations.html',
    'quality-control': null,
    'reports':         null,
    'expenses':        null,
    'profitability':   null,
    'whatsapp':        null,
    'campaigns':       null,
    'collections':     '../collections/collections.html',
    'fabrics':         '../fabrics-materials/fabrics-materials.html',
    'branches':        null,
    'users-roles':     null,
    'settings':        null,
  };

  if (moduleMap[module]) {
    window.location.href = moduleMap[module];
  } else {
    const title = module.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    showToast(`${title} — This page is in process`, 'info');
  }
}
window.navigate = navigate;

// ─────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────
function showToast(msg, variant = 'lime') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const colors = { lime: '#a3e635', lavender: '#c084fc', red: '#f87171', teal: '#2dd4bf', blue: '#38bdf8' };
  const c = colors[variant] || colors.lime;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon" style="background:${c}25;color:${c};">
      ${icon('check', 14, c, 2.5)}
    </div>
    <div class="toast-msg">${msg}</div>
    <div class="toast-close" onclick="this.parentElement.remove()">✕</div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// ─────────────────────────────────────────────
// DROPDOWNS & BUTTONS
// ─────────────────────────────────────────────
function setupDropdowns() {
  const notifBtn  = document.getElementById('notifBtn');
  const notifDrop = document.getElementById('notifDropdown');
  if (notifBtn && notifDrop) {
    notifBtn.addEventListener('click', e => {
      e.stopPropagation();
      notifDrop.classList.toggle('open');
      document.getElementById('profileDropdown')?.classList.remove('open');
    });
  }

  const profBtn  = document.getElementById('userProfileBtn');
  const profDrop = document.getElementById('profileDropdown');
  if (profBtn && profDrop) {
    profBtn.addEventListener('click', e => {
      e.stopPropagation();
      profDrop.classList.toggle('open');
      notifDrop?.classList.remove('open');
    });
  }

  document.addEventListener('click', () => {
    notifDrop?.classList.remove('open');
    profDrop?.classList.remove('open');
  });

  document.getElementById('branchBtn')?.addEventListener('click', () => {
    showToast('Branch Switcher: Haulo Designs (Main Branch)', 'blue');
  });

  document.getElementById('revFilterBtn')?.addEventListener('click', () => {
    showToast('Revenue Trend period set to: Monthly', 'lime');
  });
  document.getElementById('ordFilterBtn')?.addEventListener('click', () => {
    showToast('Order Completion filter set to: This Month', 'lavender');
  });
}

// ─────────────────────────────────────────────
// KEYBOARD SHORTCUTS & SEARCH
// ─────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      input.focus();
      input.select();
    }
    if (e.key === 'Escape') input.blur();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      showToast(`Searching for "${input.value.trim()}"…`, 'teal');
    }
  });
}

// ─────────────────────────────────────────────
// USER INITIALIZATION
// ─────────────────────────────────────────────
function setupUser() {
  const sessionUser = Auth.getUser();
  const name = sessionUser?.fullName || sessionUser?.username || dashboardData.user.name || 'Administrator';
  const role = sessionUser?.role || dashboardData.user.role || 'Administrator';
  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  dashboardData.user.name = name;
  dashboardData.user.role = role;
  dashboardData.user.initials = initials;

  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');
  const greetEl= document.getElementById('greetName');
  if (nameEl)  nameEl.textContent  = name;
  if (roleEl)  roleEl.textContent  = role;
  if (greetEl) greetEl.textContent = name.split(' ')[0] || 'Admin';
}

// ─────────────────────────────────────────────
// MAIN INITIALIZATION
// ─────────────────────────────────────────────
async function init() {
  setupUser();
  updateClock();
  setInterval(updateClock, 1000);
  applyChartDefaults();

  // Initial render with clean placeholder state
  renderKPI();
  renderHealthMetrics();
  renderOrdersLegend();
  renderProduction();
  renderSchedule();
  renderOrdersTable();
  renderQuickActions();
  setupDropdowns();
  setupSearch();

  // Fetch live KPIs from API and patch dashboardData
  try {
    let kpis = await api.dashboard.kpis().catch(() => null);
    if (!kpis) {
      kpis = await api.dashboard.kpis().catch(() => null);
    }
    if (kpis) {
      const kpiMap = dashboardData.kpi;
      if (kpis.totalRevenue != null) {
        kpiMap[0].value = '₹' + Number(kpis.totalRevenue).toLocaleString('en-IN');
        kpiMap[0].sub = kpis.deliveredOrders != null ? `${kpis.deliveredOrders} delivered` : 'Realised';
      }
      if (kpis.totalOrders != null) {
        kpiMap[1].value = Number(kpis.totalOrders).toLocaleString('en-IN');
        kpiMap[1].sub = `${kpis.pendingOrders ?? 0} pending`;
      }
      if (kpis.totalCustomers != null) {
        kpiMap[2].value = Number(kpis.totalCustomers).toLocaleString('en-IN');
        kpiMap[2].sub = 'Active clients';
      }
      if (kpis.inProgressOrders != null || kpis.ordersInProduction != null) {
        kpiMap[3].value = Number(kpis.inProgressOrders ?? kpis.ordersInProduction ?? 0).toLocaleString('en-IN');
        kpiMap[3].sub = 'Active';
      }
      if (kpis.lowStockItems != null) {
        kpiMap[4].value = Number(kpis.lowStockItems).toLocaleString('en-IN');
        kpiMap[4].sub = kpis.lowStockItems > 0 ? 'Reorder needed' : 'Optimal';
      }
      if (kpis.pendingPayments != null) {
        kpiMap[5].value = '₹' + Number(kpis.pendingPayments).toLocaleString('en-IN');
        kpiMap[5].sub = `${kpis.pendingPaymentsCount ?? 0} bills`;
      }

      // Update Health metrics
      if (kpis.businessHealth) {
        if (kpis.businessHealth.financial != null) {
          dashboardData.healthMetrics[0].pct = kpis.businessHealth.financial;
          dashboardData.healthMetrics[0].growth = kpis.businessHealth.financial >= 50 ? 'Optimal' : 'Attention';
        }
        if (kpis.businessHealth.operational != null) {
          dashboardData.healthMetrics[1].pct = kpis.businessHealth.operational;
          dashboardData.healthMetrics[1].growth = kpis.businessHealth.operational >= 50 ? 'Active' : 'Moderate';
        }
        if (kpis.businessHealth.customer != null) {
          dashboardData.healthMetrics[2].pct = kpis.businessHealth.customer;
          dashboardData.healthMetrics[2].growth = kpis.businessHealth.customer >= 50 ? 'Strong' : 'Growing';
        }
        if (kpis.businessHealth.people != null) {
          dashboardData.healthMetrics[3].pct = kpis.businessHealth.people;
          dashboardData.healthMetrics[3].growth = kpis.businessHealth.people >= 80 ? 'Optimal' : 'Staffing';
        }
      }

      // Update Monthly Revenue
      if (kpis.monthlyRevenue && kpis.monthlyRevenue.length > 0) {
        dashboardData.revenue.labels = kpis.monthlyRevenue.map(m => m.month ? m.month.split(' ')[0] : '—');
        dashboardData.revenue.revenue = kpis.monthlyRevenue.map(m => Number(m.revenue) || 0);
        dashboardData.revenue.cost = kpis.monthlyRevenue.map(m => Number(m.cost) || 0);
      }

      // Update Production Pulse
      if (kpis.productionPulse && kpis.productionPulse.length > 0) {
        dashboardData.production = kpis.productionPulse.map(p => ({
          name: p.name || (p.stage ? p.stage.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'Stage'),
          count: Number(p.count) || 0,
          color: p.color || '#c084fc',
          icon: 'needle',
          imageUrl: p.imageUrl || null
        }));
      }

      // Update Donut Chart Order Status Breakdown
      if (kpis.orderStatusBreakdown && kpis.orderStatusBreakdown.length > 0) {
        const colorMap = {
          'PENDING': '#fbbf24',
          'IN_PROGRESS': '#c084fc',
          'READY': '#a3e635',
          'DELIVERED': '#38bdf8',
          'CANCELLED': '#f87171'
        };
        dashboardData.orders = kpis.orderStatusBreakdown.map(s => ({
          label: s.status ? s.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown',
          count: Number(s.count) || 0,
          pct: (s.pct != null ? s.pct : 0) + '%',
          color: colorMap[s.status] || '#94a3b8'
        }));
      }

      // Update Big Stat Numbers
      const revBigEl = document.getElementById('revenueBig');
      if (revBigEl && kpis.totalRevenue != null) {
        revBigEl.textContent = '₹' + Number(kpis.totalRevenue).toLocaleString('en-IN');
      }

      const revGrowthEl = document.getElementById('revenueGrowth');
      if (revGrowthEl) {
        revGrowthEl.textContent = kpis.deliveredOrders != null ? `↑ ${kpis.deliveredOrders} delivered` : '↑ Active';
      }

      const donutTotalEl = document.getElementById('donutTotal');
      if (donutTotalEl && kpis.totalOrders != null) {
        donutTotalEl.textContent = kpis.totalOrders;
      }

      const prodSubEl = document.getElementById('prodSubtitle');
      if (prodSubEl) {
        const totalPulse = (kpis.productionPulse || []).reduce((acc, p) => acc + (Number(p.count) || 0), 0);
        prodSubEl.textContent = `${totalPulse} active garments across all stages`;
      }

      const welcomeSubEl = document.getElementById('welcomeSub');
      if (welcomeSubEl) {
        const pending = kpis.pendingOrders ?? 0;
        welcomeSubEl.textContent = `Your boutique is on track. ${pending} order${pending === 1 ? '' : 's'} need your attention today.`;
      }
    }

    // Fetch appointments from DB
    const appts = await api.appointments.today().catch(() => []);
    if (appts && appts.length > 0) {
      dashboardData.schedule = appts.map(a => {
        const typeRaw = a.appointmentType || a.apptType || 'CONSULTATION';
        return {
          time:     a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
          initials: typeof window.getPatronInitials === 'function'
            ? window.getPatronInitials(a.customerName)
            : (() => {
                const cName = a.customerName || 'Client';
                const parts = cName.trim().split(/\s+/).filter(Boolean);
                if (parts.length === 0) return 'CL';
                if (parts.length === 1) {
                  const s = parts[0].replace(/[^a-zA-Z0-9]/g, '');
                  return s.length >= 2 ? s.substring(0, 2).toUpperCase() : s.toUpperCase();
                }
                return (parts[0][0] + parts[1][0]).toUpperCase();
              })(),
          avatar:   a.customerAvatar || '',
          name:     a.customerName || 'Client',
          type:     typeRaw.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + (a.orderCode ? ' — ' + a.orderCode : ''),
          loc:      a.staffAssigned || 'In Store'
        };
      });

      const schedSubEl = document.getElementById('scheduleSubtitle');
      if (schedSubEl) {
        schedSubEl.textContent = `${dashboardData.schedule.length} appointments`;
      }
    } else {
      dashboardData.schedule = [];
      const schedSubEl = document.getElementById('scheduleSubtitle');
      if (schedSubEl) {
        schedSubEl.textContent = '0 appointments today';
      }
    }

    // Fetch live recent orders from DB
    const ordersRes = await api.orders.list({ page: 0, size: 5 }).catch(() => []);
    const liveOrders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.content || []);
    if (liveOrders && liveOrders.length > 0) {
      dashboardData.recentOrders = liveOrders.map(o => {
        const rawStatus = (o.status || 'PENDING').toUpperCase();
        let displayStatus = 'In Production';
        if (rawStatus === 'PENDING') displayStatus = 'Pending';
        else if (rawStatus === 'READY') displayStatus = 'Ready for Delivery';
        else if (rawStatus === 'DELIVERED') displayStatus = 'Delivered';
        else if (rawStatus === 'CANCELLED') displayStatus = 'Cancelled';

        const rawAmount = Number(o.totalAmount || o.amount || 0);
        const advance = Number(o.advancePaid || 0);
        const bal = Number(o.balanceAmount ?? (rawAmount - advance));
        const paymentLabel = (bal <= 0 || o.paymentStatus === 'PAID') ? 'Paid' : (advance > 0 ? 'Advance Paid' : 'Partial');

        return {
          id:       o.orderCode || ('ORD-' + o.id),
          date:     o.orderDate || (o.createdAt ? String(o.createdAt).slice(0, 10) : '—'),
          customer: o.customerName || 'Valued Client',
          garments: o.garmentType || 'Bespoke Garment',
          amount:   '₹' + rawAmount.toLocaleString('en-IN'),
          status:   displayStatus,
          payment:  paymentLabel,
          due:      o.dueDate || o.expectedDeliveryDate || '—'
        };
      });
    } else {
      dashboardData.recentOrders = [];
    }
  } catch (e) {
    console.error('[Dashboard] Failed to fetch live dashboard data:', e.message);
  }

  // Re-render UI with live data
  renderKPI();
  renderHealthMetrics();
  renderOrdersLegend();
  renderProduction();
  renderSchedule();
  renderOrdersTable();

  // Staggered Chart Rendering after initial DOM layout
  requestAnimationFrame(() => {
    setTimeout(initHealthChart,  40);
    setTimeout(initRevenueChart, 80);
    setTimeout(initDonutChart,  120);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
