/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — Enquiries Module Controller
 * File: frontend/enquiries/enquiries.js
 * Powered by real-time PostgreSQL database via /api/v1/enquiries
 * =======================================================================
 */

'use strict';

// ─────────────────────────────────────────────
// DATA STATE
// ─────────────────────────────────────────────
let enquiriesData = [];
let existingCustomers = [];
let totalEnquiriesCount = 0;
let currentPage = 0;
let totalPages = 1;
let pageSize = 10;

// Global State
let currentStatusFilter = 'all';
let currentSearchQuery = '';
let currentStep = 1;
let uploadedImages = [];
let apiInstance = null;

// ─────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initLiveClock();
  initTabPills();
  initSearch();
  initPageSizeSelector();
  initRowSelection();
  initFormSteps();
  loadSavedDraft();
  initNotificationsToggle();
  initKeyboardShortcuts();

  try {
    const { default: api } = await import('../api.js');
    apiInstance = api;

    // Load initial data concurrently from backend
    await Promise.all([
      loadKpis(),
      loadEnquiries(0),
      loadCustomersAndStaff()
    ]);
  } catch (err) {
    console.error('[Enquiries] Failed to initialize live data:', err);
  }
});

// ─────────────────────────────────────────────
// LOAD LIVE KPIS & FILTER COUNTS DIRECTLY FROM BACKEND
// ─────────────────────────────────────────────
async function loadKpis() {
  if (!apiInstance) return;
  try {
    const kpisPromise = apiInstance.enquiries.kpis().catch(() => null);

    // Fetch live counts for every status directly from backend database
    const [kpis, allRes, newRes, inDiscRes, quoteRes, convRes, closedRes, followRes] = await Promise.all([
      kpisPromise,
      apiInstance.enquiries.page({ size: 1 }).catch(() => null),
      apiInstance.enquiries.page({ status: 'NEW', size: 1 }).catch(() => null),
      apiInstance.enquiries.page({ status: 'IN_DISCUSSION', size: 1 }).catch(() => null),
      apiInstance.enquiries.page({ status: 'QUOTATION_SENT', size: 1 }).catch(() => null),
      apiInstance.enquiries.page({ status: 'CONVERTED', size: 1 }).catch(() => null),
      apiInstance.enquiries.page({ status: 'CLOSED', size: 1 }).catch(() => null),
      apiInstance.enquiries.page({ status: 'FOLLOW_UP', size: 1 }).catch(() => null)
    ]);

    const totalCount = allRes?.totalElements ?? kpis?.total ?? 0;
    const newCount = newRes?.totalElements ?? kpis?.newCount ?? 0;
    const inDiscussionCount = inDiscRes?.totalElements ?? kpis?.inDiscussion ?? 0;
    const quotationCount = quoteRes?.totalElements ?? 0;
    const convertedCount = convRes?.totalElements ?? kpis?.converted ?? 0;
    const followUpCount = followRes?.totalElements ?? kpis?.followUp ?? 0;
    const closedCount = (closedRes?.totalElements ?? 0) + followUpCount;

    // Update top KPI cards
    const totalEl = document.getElementById('kpiTotal');
    const newEl = document.getElementById('kpiNew');
    const convEl = document.getElementById('kpiConverted');
    const apptEl = document.getElementById('kpiAppointments');
    const pendEl = document.getElementById('kpiPending');

    if (totalEl) totalEl.textContent = totalCount;
    if (newEl) newEl.textContent = kpis?.newThisWeek != null ? kpis.newThisWeek : newCount;
    if (convEl) convEl.textContent = convertedCount;
    if (apptEl) apptEl.textContent = inDiscussionCount;
    if (pendEl) pendEl.textContent = followUpCount;

    // Update filter tab count badges directly with REAL database counts
    const setTabCount = (selector, count) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = count != null ? count : '0';
    };

    setTabCount('.tab-pill[data-status="all"] .tab-num', totalCount);
    setTabCount('.tab-pill[data-status="new"] .tab-num', newCount);
    setTabCount('.tab-pill[data-status="in-discussion"] .tab-num', inDiscussionCount);
    setTabCount('.tab-pill[data-status="quotation-sent"] .tab-num', quotationCount);
    setTabCount('.tab-pill[data-status="converted"] .tab-num', convertedCount);
    setTabCount('.tab-pill[data-status="closed"] .tab-num', closedCount);

  } catch (err) {
    console.error('[Enquiries] Failed to load live backend KPIs:', err);
  }
}

// ─────────────────────────────────────────────
// MAP STATUS FILTER TO BACKEND PARAMETER
// ─────────────────────────────────────────────
function mapFilterStatusToBackend(status) {
  if (!status || status === 'all') return null;
  const s = status.toLowerCase().replace(/[\s_]+/g, '-');
  switch (s) {
    case 'new': return 'NEW';
    case 'in-discussion': return 'IN_DISCUSSION';
    case 'quotation-sent': return 'QUOTATION_SENT';
    case 'converted': return 'CONVERTED';
    case 'closed': return 'CLOSED';
    case 'follow-up': return 'FOLLOW_UP';
    default: return status.toUpperCase().replace(/-/g, '_');
  }
}

// ─────────────────────────────────────────────
// LOAD LIVE ENQUIRIES PAGE FROM POSTGRESQL
// ─────────────────────────────────────────────
async function loadEnquiries(page = 0) {
  if (!apiInstance) return;
  try {
    const params = {
      page: page,
      size: pageSize,
      sort: 'createdAt,desc'
    };

    if (currentSearchQuery) {
      params.search = currentSearchQuery;
    }

    // Special handling for closed tab which combines CLOSED + FOLLOW_UP
    if (currentStatusFilter === 'closed') {
      const [closedPage, followPage] = await Promise.all([
        apiInstance.enquiries.page({ ...params, status: 'CLOSED' }).catch(() => null),
        apiInstance.enquiries.page({ ...params, status: 'FOLLOW_UP' }).catch(() => null)
      ]);
      const combined = [
        ...(closedPage?.content || []),
        ...(followPage?.content || [])
      ];
      totalEnquiriesCount = (closedPage?.totalElements || 0) + (followPage?.totalElements || 0);
      totalPages = Math.ceil(totalEnquiriesCount / pageSize) || 1;
      currentPage = page;
      enquiriesData = combined.slice(0, pageSize).map(mapEnquiryRecord);
      renderEnquiriesTable();
      renderPaginationControls();
      return;
    }

    const backendStatus = mapFilterStatusToBackend(currentStatusFilter);
    if (backendStatus) {
      params.status = backendStatus;
    }

    const res = await apiInstance.enquiries.page(params);
    const content = res?.content || (Array.isArray(res) ? res : []);
    totalEnquiriesCount = res?.totalElements ?? content.length;
    currentPage = res?.number ?? page;
    totalPages = res?.totalPages ?? Math.ceil(totalEnquiriesCount / pageSize);

    enquiriesData = content.map(mapEnquiryRecord);
    renderEnquiriesTable();
    renderPaginationControls();
  } catch (err) {
    console.error('[Enquiries] Failed to load enquiries list from backend:', err);
  }
}

// ─────────────────────────────────────────────
// MAP DATABASE RECORD TO DISPLAY MODEL
// ─────────────────────────────────────────────
function mapEnquiryRecord(e) {
  const customerName = e.customerName || 'Valued Client';
  const avatarInfo = getAvatarInfo(customerName, e.avatarUrl);

  return {
    id: e.enquiryCode || `ENQ-${e.id}`,
    date: formatDate(e.createdAt),
    customer: customerName,
    photo: avatarInfo.photo,
    avatarClass: avatarInfo.avatarClass,
    initials: avatarInfo.initials,
    contact: e.phone || '—',
    email: e.email || '',
    garment: e.garmentType || 'Bespoke Garment',
    occasion: e.occasion || (e.notes ? e.notes.slice(0, 30) : 'Bespoke Order'),
    source: formatSource(e.source),
    status: formatStatus(e.status),
    nextAction: e.nextAction || (e.followUpDate ? `Follow up: ${e.followUpDate}` : 'Follow up required'),
    budget: e.estimatedBudget || 0,
    fabricBrought: !!e.fabricBrought
  };
}

function getAvatarInfo(name, avatarUrl) {
  let validPhoto = null;
  if (avatarUrl && !avatarUrl.includes('user_avatar.jpg') && (avatarUrl.startsWith('http') || avatarUrl.startsWith('/') || avatarUrl.startsWith('../'))) {
    validPhoto = avatarUrl;
  }

  const initials = typeof window.getPatronInitials === 'function'
    ? window.getPatronInitials(name)
    : (() => {
        if (!name) return 'CU';
        const p = name.trim().split(/\s+/).filter(Boolean);
        if (p.length === 0) return 'CU';
        if (p.length === 1) {
          const s = p[0].replace(/[^a-zA-Z0-9]/g, '');
          return s.length >= 2 ? s.substring(0, 2).toUpperCase() : s.toUpperCase();
        }
        return (p[0][0] + p[1][0]).toUpperCase();
      })();

  const colorClasses = ['avatar-lm', 'avatar-sr', 'avatar-ar', 'avatar-dk', 'avatar-ni', 'avatar-ap'];
  const hash = Math.abs((name || 'Customer').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const avatarClass = colorClasses[hash % colorClasses.length];

  return { photo: validPhoto, initials, avatarClass };
}

function formatStatus(s) {
  if (!s) return 'New';
  const u = s.toUpperCase().replace('-', '_');
  if (u === 'NEW' || u === 'PENDING') return 'New';
  if (u === 'IN_DISCUSSION') return 'In Discussion';
  if (u === 'QUOTATION_SENT') return 'Quotation Sent';
  if (u === 'CONVERTED') return 'Converted';
  if (u === 'FOLLOW_UP') return 'Follow Up';
  if (u === 'CLOSED') return 'Closed';
  return s;
}

function formatSource(s) {
  if (!s) return 'Walk-in';
  const u = s.toUpperCase();
  if (u === 'INSTAGRAM') return 'Instagram';
  if (u === 'WALK_IN' || u === 'WALKIN') return 'Walk-in';
  if (u === 'REFERRAL') return 'Referral';
  if (u === 'WHATSAPP') return 'WhatsApp';
  if (u === 'WEBSITE') return 'Website';
  return s;
}

function formatDate(d) {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (_) {
    return String(d).slice(0, 10);
  }
}

// ─────────────────────────────────────────────
// LOAD EXISTING CUSTOMERS & EMPLOYEES
// ─────────────────────────────────────────────
async function loadCustomersAndStaff() {
  if (!apiInstance) return;
  try {
    const [custList, empList] = await Promise.all([
      apiInstance.customers.list({ page: 0, size: 50 }).catch(() => []),
      apiInstance.employees.list({ status: 'ACTIVE' }).catch(() => [])
    ]);

    const customers = Array.isArray(custList) ? custList : (custList?.content || []);
    const employees = Array.isArray(empList) ? empList : (empList?.content || []);

    const staffSelect = document.getElementById('assignedStaff');
    if (staffSelect && employees.length > 0) {
      staffSelect.innerHTML = '<option value="Unassigned">Unassigned</option>' +
        employees.map(e => `<option value="${escapeHtml(e.name)}">${escapeHtml(e.name)} (${escapeHtml(e.role || 'Staff')})</option>`).join('');
    }

    if (customers.length > 0) {
      existingCustomers = customers.map(c => ({
        name: c.name,
        phone: (c.mobileNumber || c.phone || '').replace('+91', '').trim(),
        email: c.email || '',
        tag: c.tier === 'VIP_PLATINUM' ? 'VIP Customer' : 'Client',
        preferredNeck: c.preferredNeck || '',
        preferredSleeve: c.preferredSleeve || '',
        preferredOccasions: c.preferredOccasions || '',
        deliveryPreference: c.deliveryPreference || ''
      }));
    }
  } catch (err) {
    console.warn('[Enquiries] Customers/Staff load warning:', err.message);
  }
}

// ─────────────────────────────────────────────
// LIVE DATE & TIME DISPLAY
// ─────────────────────────────────────────────
function initLiveClock() {
  function updateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-GB', dateOptions);
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const timeStr = now.toLocaleTimeString('en-US', timeOptions);

    const dateEl = document.getElementById('liveDateText');
    const timeEl = document.getElementById('liveTimeText');
    if (dateEl) dateEl.textContent = dateStr;
    if (timeEl) timeEl.textContent = timeStr;
  }
  updateTime();
  setInterval(updateTime, 30000);
}

// ─────────────────────────────────────────────
// RENDER ENQUIRIES TABLE (Always ensures at least 10 rows visible)
// ─────────────────────────────────────────────
function renderEnquiriesTable() {
  const tbody = document.getElementById('enquiryTableBody');
  if (!tbody) return;

  const minRows = 10;

  if (enquiriesData.length === 0) {
    let emptyRows = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 26px 14px; color: rgba(255, 255, 255, 0.45);">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">No enquiries found</div>
          <div style="font-size: 11px;">Try adjusting your search query or filter tab.</div>
        </td>
      </tr>
    `;
    for (let i = 1; i < minRows; i++) {
      emptyRows += `
        <tr class="empty-table-row">
          <td colspan="10">&nbsp;</td>
        </tr>
      `;
    }
    tbody.innerHTML = emptyRows;
    updatePaginationInfo(0, totalEnquiriesCount);
    renderPaginationControls();
    return;
  }

  let html = enquiriesData.map(item => {
    const sourceClass = getSourceClass(item.source);
    const statusClass = getStatusClass(item.status);

    const avatarHtml = typeof window.renderPatronAvatarHtml === 'function'
      ? window.renderPatronAvatarHtml(item.customer, item.photo, 'haulo-avatar-sm', 'width:32px;height:32px;border-radius:8px;')
      : (item.photo
        ? `<img src="${item.photo}" class="avatar-img" alt="${escapeHtml(item.customer)}" onerror="this.outerHTML='<div class=\\'avatar-circle ${item.avatarClass || 'avatar-kn'}\\'>${item.initials}</div>';" />`
        : `<div class="avatar-circle ${item.avatarClass || 'avatar-kn'}">${item.initials}</div>`);

    const isConverted = item.status.toLowerCase() === 'converted';
    const actionHtml = isConverted
      ? `<span class="action-converted-order">${escapeHtml(item.nextAction)}</span>`
      : `<span>${escapeHtml(item.nextAction)}</span>`;

    return `
      <tr data-id="${item.id}">
        <td class="col-id">${item.id}</td>
        <td class="col-date">${item.date}</td>
        <td class="col-customer">
          <div class="customer-cell" onclick="openCustomerDetails('${escapeHtml(item.customer)}')" style="cursor:pointer;" title="View Customer">
            ${avatarHtml}
            <span class="customer-name-text">${escapeHtml(item.customer)}</span>
          </div>
        </td>
        <td class="col-contact">${item.contact}</td>
        <td class="col-garment">
          <div class="garment-cell">
            <span class="garment-title">${escapeHtml(item.garment)}</span>
            <span class="garment-sub">${escapeHtml(item.occasion)}</span>
          </div>
        </td>
        <td class="col-source">
          <span class="badge-source ${sourceClass}">${escapeHtml(item.source)}</span>
        </td>
        <td class="col-status">
          <span class="badge-status ${statusClass}">${escapeHtml(item.status)}</span>
        </td>
        <td class="col-action action-cell">${actionHtml}</td>
        <td class="col-more">
          <button class="row-action-btn" onclick="openRowActions('${item.id}', event)" title="Enquiry options">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Always append empty rows up to minimum 10 rows so the table is never squashed or uneven
  if (enquiriesData.length < minRows) {
    for (let i = enquiriesData.length; i < minRows; i++) {
      html += `
        <tr class="empty-table-row">
          <td class="col-id">&nbsp;</td>
          <td class="col-date">&nbsp;</td>
          <td class="col-customer">&nbsp;</td>
          <td class="col-contact">&nbsp;</td>
          <td class="col-garment">&nbsp;</td>
          <td class="col-source">&nbsp;</td>
          <td class="col-status">&nbsp;</td>
          <td class="col-action">&nbsp;</td>
          <td class="col-more">&nbsp;</td>
        </tr>
      `;
    }
  }

  tbody.innerHTML = html;
  updatePaginationInfo(enquiriesData.length, totalEnquiriesCount);
  renderPaginationControls();
}

// ─────────────────────────────────────────────
// BADGE STYLING HELPERS
// ─────────────────────────────────────────────
function getSourceClass(source) {
  switch ((source || '').toLowerCase()) {
    case 'instagram': return 'source-instagram';
    case 'walk-in':   return 'source-walkin';
    case 'referral':  return 'source-referral';
    case 'whatsapp':  return 'source-whatsapp';
    case 'website':   return 'source-website';
    default:          return 'source-walkin';
  }
}

function getStatusClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'new':            return 'status-new';
    case 'in discussion':  return 'status-in-discussion';
    case 'quotation sent': return 'status-quotation';
    case 'converted':      return 'status-converted';
    case 'follow up':      return 'status-follow-up';
    case 'closed':         return 'status-closed';
    default:               return 'status-new';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function updatePaginationInfo(showingCount, totalCount) {
  const el = document.getElementById('paginationInfo');
  if (el) {
    const start = totalCount === 0 ? 0 : (currentPage * pageSize + 1);
    const end = Math.min((currentPage + 1) * pageSize, totalCount);
    el.textContent = `Showing ${start}–${end} of ${totalCount} enquiries`;
  }
}

function renderPaginationControls() {
  const container = document.getElementById('paginationControls');
  if (!container) return;

  const validTotalPages = Math.max(1, totalPages || 1);
  let html = `<button class="page-arrow" id="prevPageBtn" title="Previous page" ${currentPage <= 0 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">‹</button>`;
  const pagesToShow = Math.max(1, Math.min(validTotalPages, 5));
  for (let i = 0; i < pagesToShow; i++) {
    html += `<button class="page-num ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i + 1}</button>`;
  }
  html += `<button class="page-arrow" id="nextPageBtn" title="Next page" ${currentPage >= validTotalPages - 1 ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">›</button>`;

  container.innerHTML = html;
}

function goToPage(page) {
  if (page < 0 || page >= totalPages) return;
  loadEnquiries(page);
}

// ─────────────────────────────────────────────
// TAB PILLS FILTERING
// ─────────────────────────────────────────────
function initTabPills() {
  const tabs = document.querySelectorAll('.tab-pill');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentStatusFilter = tab.dataset.status || 'all';
      loadEnquiries(0);
    });
  });
}

function filterByStatus(status) {
  currentStatusFilter = status;
  const tabs = document.querySelectorAll('.tab-pill');
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.status === status);
  });
  loadEnquiries(0);
}

// ─────────────────────────────────────────────
// SEARCH INPUTS
// ─────────────────────────────────────────────
function initSearch() {
  let debounceTimer = null;
  const handleSearch = (q) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearchQuery = q.trim();
      loadEnquiries(0);
    }, 250);
  };

  const tableSearch = document.getElementById('tableSearchInput');
  if (tableSearch) {
    tableSearch.addEventListener('input', (e) => handleSearch(e.target.value));
  }

  const globalSearch = document.getElementById('globalSearchInput');
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      if (tableSearch) tableSearch.value = e.target.value;
      handleSearch(e.target.value);
    });
  }
}

function initPageSizeSelector() {
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  if (pageSizeSelect) {
    pageSizeSelect.value = String(pageSize);
    pageSizeSelect.addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value, 10) || 10;
      currentPage = 0;
      loadEnquiries(0);
    });
  }
  renderPaginationControls();
}

// ─────────────────────────────────────────────
// ROW SELECTION (SELECT ALL & PER-ROW CHECKBOXES)
// ─────────────────────────────────────────────
function initRowSelection() {
  const tbody = document.getElementById('enquiryTableBody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      // Ignore click on interactive buttons or customer drawer link
      if (e.target.closest('.row-action-btn') || e.target.closest('.customer-cell')) {
        return;
      }
      const row = e.target.closest('tr');
      if (row && !row.classList.contains('empty-table-row')) {
        const wasSelected = row.classList.contains('row-selected');
        document.querySelectorAll('#enquiryTableBody tr.row-selected').forEach(r => r.classList.remove('row-selected'));
        if (!wasSelected) {
          row.classList.add('row-selected');
        }
      }
    });
  }
}

// ─────────────────────────────────────────────
// MULTI-STEP FORM NAVIGATION
// ─────────────────────────────────────────────
function initFormSteps() {
  const stepTabs = document.querySelectorAll('.step-tab');
  stepTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const step = parseInt(tab.dataset.step, 10);
      switchStep(step);
    });
  });
}

function switchStep(step) {
  if (step > 1 && currentStep === 1) {
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const sourceSelect = document.getElementById('enquirySource');
    const garmentSelect = document.getElementById('garmentType');

    if (!nameInput.value.trim()) {
      showToast('Please enter Customer Name', 'warning');
      nameInput.focus();
      return;
    }
    if (!phoneInput.value.trim()) {
      showToast('Please enter Mobile Number', 'warning');
      phoneInput.focus();
      return;
    }
    if (!sourceSelect.value) {
      showToast('Please select Enquiry Source', 'warning');
      sourceSelect.focus();
      return;
    }
    if (!garmentSelect.value) {
      showToast('Please select Garment Type', 'warning');
      garmentSelect.focus();
      return;
    }
  }

  currentStep = step;

  document.querySelectorAll('.step-tab').forEach(t => {
    t.classList.toggle('active', parseInt(t.dataset.step, 10) === step);
  });

  document.querySelectorAll('.step-content').forEach((pane, idx) => {
    pane.classList.toggle('active', idx + 1 === step);
  });

  const nextBtn = document.getElementById('nextStepBtn');
  const submitBtn = document.getElementById('submitEnquiryBtn');
  if (step === 3) {
    if (nextBtn) nextBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'block';
  } else {
    if (nextBtn) nextBtn.style.display = 'block';
    if (submitBtn) submitBtn.style.display = 'none';
  }
}

function goToNextStep() {
  if (currentStep < 3) {
    switchStep(currentStep + 1);
  }
}

// ─────────────────────────────────────────────
// FILE UPLOAD & PREVIEW HANDLER
// ─────────────────────────────────────────────
function handleFileSelect(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const container = document.getElementById('imagePreviewsContainer');
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      uploadedImages.push(dataUrl);

      const thumb = document.createElement('div');
      thumb.className = 'preview-thumb';
      thumb.innerHTML = `
        <img src="${dataUrl}" alt="Ref image" />
        <span class="preview-remove" onclick="removeImage(${uploadedImages.length - 1}, this)">✕</span>
      `;
      container.appendChild(thumb);
    };
    reader.readAsDataURL(file);
  });
}

function removeImage(index, el) {
  uploadedImages.splice(index, 1);
  const thumb = el.closest('.preview-thumb');
  if (thumb) thumb.remove();
}

// ─────────────────────────────────────────────
// DRAFT STORAGE (localStorage)
// ─────────────────────────────────────────────
function saveFormDraft() {
  const form = document.getElementById('enquiryForm');
  if (!form) return;

  const draftData = {
    customerName: document.getElementById('customerName')?.value || '',
    customerPhone: document.getElementById('customerPhone')?.value || '',
    customerEmail: document.getElementById('customerEmail')?.value || '',
    enquirySource: document.getElementById('enquirySource')?.value || '',
    enquiryOccasion: document.getElementById('enquiryOccasion')?.value || '',
    preferredDate: document.getElementById('preferredDate')?.value || '',
    garmentType: document.getElementById('garmentType')?.value || '',
    estimatedBudget: document.getElementById('estimatedBudget')?.value || '',
    quickNotes: document.getElementById('quickNotes')?.value || '',
    fabricBrought: document.getElementById('fabricBroughtToggle')?.checked || false,
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem('fashion_enquiry_draft', JSON.stringify(draftData));
    showToast('Draft saved successfully', 'info');
  } catch (err) {
    showToast('Could not save draft to local storage', 'error');
  }
}

function loadSavedDraft() {
  try {
    const raw = localStorage.getItem('fashion_enquiry_draft');
    if (!raw) return;
    const draft = JSON.parse(raw);

    const setIf = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined && val !== '') el.value = val;
    };

    setIf('customerName', draft.customerName);
    setIf('customerPhone', draft.customerPhone);
    setIf('customerEmail', draft.customerEmail);
    setIf('enquirySource', draft.enquirySource);
    setIf('enquiryOccasion', draft.enquiryOccasion);
    setIf('preferredDate', draft.preferredDate);
    setIf('garmentType', draft.garmentType);
    setIf('estimatedBudget', draft.estimatedBudget);
    setIf('quickNotes', draft.quickNotes);

    const fabricToggle = document.getElementById('fabricBroughtToggle');
    if (fabricToggle && draft.fabricBrought) {
      fabricToggle.checked = draft.fabricBrought;
    }
  } catch (_) {}
}

// ─────────────────────────────────────────────
// FORM SUBMIT HANDLER -> POSTS TO POSTGRESQL API
// ─────────────────────────────────────────────
async function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('customerName')?.value.trim();
  const phone = document.getElementById('customerPhone')?.value.trim();
  const email = document.getElementById('customerEmail')?.value.trim();
  const source = document.getElementById('enquirySource')?.value || 'Walk-in';
  const occasion = document.getElementById('enquiryOccasion')?.value || 'Bespoke Order';
  const prefDate = document.getElementById('preferredDate')?.value;
  const garment = document.getElementById('garmentType')?.value;
  const budget = document.getElementById('estimatedBudget')?.value;
  const notes = document.getElementById('quickNotes')?.value.trim();
  const fabricBrought = document.getElementById('fabricBroughtToggle')?.checked || false;
  const assignedStaff = document.getElementById('assignedStaff')?.value;
  const followUpDate = document.getElementById('followUpDate')?.value;
  const followUpAction = document.getElementById('followUpAction')?.value.trim() || 'Initial consultation';

  if (!name || !phone || !garment) {
    showToast('Please fill all required fields (*)', 'warning');
    switchStep(1);
    return;
  }

  const payload = {
    customerName: name,
    phone: phone,
    email: email,
    source: source.toUpperCase().replace('-', '_'),
    occasion: occasion,
    preferredDate: prefDate || null,
    garmentType: garment,
    estimatedBudget: budget ? parseFloat(budget) : null,
    notes: notes,
    status: 'NEW',
    assignedTo: assignedStaff !== 'Unassigned' ? assignedStaff : null,
    followUpDate: followUpDate || null,
    nextAction: followUpAction,
    fabricBrought: fabricBrought
  };

  try {
    if (apiInstance && apiInstance.enquiries) {
      const created = await apiInstance.enquiries.create(payload);
      showToast(`Enquiry ${created?.enquiryCode || 'created'} saved successfully for ${name}!`, 'success');
    } else {
      showToast(`Enquiry created successfully for ${name}!`, 'success');
    }

    // Reset Form
    document.getElementById('enquiryForm').reset();
    uploadedImages = [];
    const container = document.getElementById('imagePreviewsContainer');
    if (container) container.innerHTML = '';
    try { localStorage.removeItem('fashion_enquiry_draft'); } catch (_) {}

    // Reset to Step 1
    switchStep(1);

    // Refresh real-time table & KPIs from database
    await Promise.all([
      loadKpis(),
      loadEnquiries(0)
    ]);
  } catch (err) {
    console.error('[Enquiries] Submit error:', err);
    showToast(err.message || 'Failed to create enquiry in database', 'error');
  }
}

// ─────────────────────────────────────────────
// SEARCH EXISTING CUSTOMER MODAL
// ─────────────────────────────────────────────
function openExistingCustomerSearch(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('customerSearchModal');
  if (!modal) return;
  modal.classList.add('show');
  renderModalCustomers(existingCustomers);
  const input = document.getElementById('modalSearchCustomerInput');
  if (input) {
    input.value = '';
    input.focus();
  }
}

function closeCustomerSearchModal() {
  const modal = document.getElementById('customerSearchModal');
  if (modal) modal.classList.remove('show');
}

function filterModalCustomers(e) {
  const query = e.target.value.toLowerCase().trim();
  const filtered = existingCustomers.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.phone.includes(query) ||
    c.email.toLowerCase().includes(query)
  );
  renderModalCustomers(filtered);
}

function renderModalCustomers(list) {
  const container = document.getElementById('modalCustomerList');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 20px; color:#64748b; font-size:11px;">No customer found.</div>';
    return;
  }

  container.innerHTML = list.map(c => `
    <div class="modal-cust-item" onclick="selectExistingCustomer('${escapeHtml(c.name)}', '${escapeHtml(c.phone)}', '${escapeHtml(c.email)}')">
      <div>
        <div class="modal-cust-name">${escapeHtml(c.name)} <span style="font-size:9.5px; font-weight:normal; color:#be123c;">(${escapeHtml(c.tag)})</span></div>
        <div class="modal-cust-phone">+91 ${escapeHtml(c.phone)} · ${escapeHtml(c.email)}</div>
      </div>
      <button type="button" style="background:#881337; color:#fff; border:none; padding:4px 8px; border-radius:6px; font-size:10px; cursor:pointer;">Select</button>
    </div>
  `).join('');
}

function selectExistingCustomer(name, phone, email) {
  document.getElementById('customerName').value = name;
  document.getElementById('customerPhone').value = phone;
  if (email && email !== 'undefined') {
    document.getElementById('customerEmail').value = email;
  }

  const cust = existingCustomers.find(c => c.name === name || c.phone === phone);
  const prefBadge = document.getElementById('enquiryCustPrefBadge');
  const prefText = document.getElementById('enquiryCustPrefText');
  if (prefBadge && prefText && cust) {
    const parts = [
      cust.preferredNeck ? `Neck: ${cust.preferredNeck}` : '',
      cust.preferredSleeve ? `Sleeve: ${cust.preferredSleeve}` : '',
      cust.preferredOccasions ? `Occasions: ${cust.preferredOccasions}` : '',
      cust.deliveryPreference ? `Delivery: ${cust.deliveryPreference}` : ''
    ].filter(Boolean);
    if (parts.length > 0) {
      prefText.textContent = `Client Preferences: ${parts.join(' · ')}`;
      prefBadge.style.display = 'flex';
      if (window.lucide) lucide.createIcons();
    } else {
      prefBadge.style.display = 'none';
    }
  }

  closeCustomerSearchModal();
  showToast(`Loaded details for ${name}`, 'info');
}

// ─────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.25s, transform 0.25s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// ─────────────────────────────────────────────
// FORM RESET BUTTON
// ─────────────────────────────────────────────
function initNotificationsToggle() {
  const closeCardBtn = document.getElementById('closeCardBtn');
  if (closeCardBtn) {
    closeCardBtn.addEventListener('click', () => {
      if (confirm('Clear New Enquiry form fields?')) {
        document.getElementById('enquiryForm').reset();
        const prefBadge = document.getElementById('enquiryCustPrefBadge');
        if (prefBadge) prefBadge.style.display = 'none';
        uploadedImages = [];
        const container = document.getElementById('imagePreviewsContainer');
        if (container) container.innerHTML = '';
        switchStep(1);
        showToast('Form cleared', 'info');
      }
    });
  }
}

// ─────────────────────────────────────────────
// KEYBOARD SHORTCUTS (Cmd+K / Ctrl+K)
// ─────────────────────────────────────────────
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('tableSearchInput') || document.getElementById('globalSearchInput');
      if (searchInput) searchInput.focus();
    }
  });
}

// ─────────────────────────────────────────────
// ROW INTERACTIONS
// ─────────────────────────────────────────────
function openCustomerDetails(customerName) {
  window.location.href = `../customer/Customer360/customer360.html?customer=${encodeURIComponent(customerName)}`;
}

function openRowActions(enquiryId, event) {
  if (event) event.stopPropagation();
  showToast(`Options for ${enquiryId}: Convert to Order, Schedule Appointment, or Print Quotation`, 'info');
}
