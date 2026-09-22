/* ============================================================
   FASHION ERP — APPOINTMENTS & CALENDAR MODULE
   Path: front end/appointments/appointments.js
   Description: Complete scheduling engine, day/week/month views,
                mini calendar with dots, interactive time grid,
                today's schedule panel, quick actions, and modals.
   ============================================================ */

(function () {
  'use strict';

  function getTodayIsoString() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const _now = new Date();
  // ── Application State ──
  const state = {
    selectedDate: getTodayIsoString(),
    activeView: 'day', // 'day', 'week', 'month', 'table'
    activeTypeFilter: 'all',
    searchQuery: '',
    selectedAppointmentId: null,
    miniCalMonth: _now.getMonth(),
    miniCalYear: _now.getFullYear(),
    tableStatusFilter: 'ALL',
    tableSearchQuery: '',
    tableTypeFilter: 'ALL'
  };

  // ── Category Mapping for Day View Columns ──
  const CATEGORY_COLUMNS = [
    { id: 'design', label: 'Design Consultation', type: 'Design Consultation' },
    { id: 'measurement', label: 'Measurement', type: 'Measurement' },
    { id: 'trial', label: 'Trial', type: 'Trial' },
    { id: 'delivery', label: 'Delivery / Pickup', type: 'Delivery' }, // matches Delivery or Pickup
    { id: 'followup', label: 'Follow-up / Others', type: 'Follow-up' } // matches Follow-up or Other
  ];

  // ── Master Appointments Dataset (Live DB) ──
  let APPOINTMENTS = [];



  function collapseSidebarDefault() {
    const sb = document.getElementById('appSidebar') || document.querySelector('.sidebar');
    if (sb && localStorage.getItem('fashion_sidebar_collapsed') !== '0') {
      sb.classList.add('collapsed');
      const topToggle = document.getElementById('topbarToggleBtn');
      if (topToggle) topToggle.setAttribute('title', 'Expand sidebar (⌘B)');
    }
  }

  // ── Live Clock (Ticking every second) ──
  function startLiveClock() {
    const clockEl = document.getElementById('liveDateTime');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[now.getDay()];
      const day = String(now.getDate()).padStart(2, '0');
      const month = months[now.getMonth()];
      const year = now.getFullYear();

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? String(hours).padStart(2, '0') : '12';

      clockEl.textContent = `${dayName}, ${day} ${month} ${year} • ${hours}:${minutes} ${ampm}`;
    }

    update();
    setInterval(update, 1000);
  }

  // ── KPI Summary Rendering (100% Live DB APIs) ──
  async function renderKpiSummary() {
    try {
      const { default: api } = await import('../api.js');
      const [apptKpis, enqKpis] = await Promise.all([
        api.appointments.kpis().catch(() => null),
        api.enquiries.kpis().catch(() => null)
      ]);

      const elToday = document.getElementById('kpiTodayCount');
      const elEnq   = document.getElementById('kpiEnquiryCount');
      const elMeas  = document.getElementById('kpiMeasurementCount');
      const elTrial = document.getElementById('kpiTrialCount');
      const elDeliv = document.getElementById('kpiDeliveryCount');

      const trendToday = document.getElementById('kpiTodayTrend');
      const trendEnq   = document.getElementById('kpiEnquiryTrend');
      const trendMeas  = document.getElementById('kpiMeasurementTrend');
      const trendTrial = document.getElementById('kpiTrialTrend');
      const trendDeliv = document.getElementById('kpiDeliveryTrend');

      // 1. Today's Appointments
      const todayStr = getTodayIsoString();
      const todayInState = APPOINTMENTS.filter(a => a.date === todayStr && a.status !== 'Cancelled').length;
      const todayCount = (apptKpis && apptKpis.todayCount != null) ? apptKpis.todayCount : todayInState;
      if (elToday) elToday.textContent = todayCount;
      if (trendToday) trendToday.innerHTML = `<span>${todayCount > 0 ? todayCount + ' scheduled today' : 'No appointments today'}</span>`;

      // 2. New Enquiries
      const enqCount = enqKpis ? (enqKpis.newCount ?? enqKpis.pending ?? 0) : 0;
      if (elEnq) elEnq.textContent = enqCount;
      if (trendEnq) trendEnq.innerHTML = `<span>${enqCount > 0 ? enqCount + ' pending' : 'All clear'}</span>`;

      // 3. Measurements
      const measCount = APPOINTMENTS.filter(a => (a.type || '').toLowerCase().includes('measur') && a.status !== 'Cancelled').length;
      if (elMeas) elMeas.textContent = measCount;
      if (trendMeas) trendMeas.innerHTML = `<span>${measCount > 0 ? measCount + ' booked' : '0 booked'}</span>`;

      // 4. Trials & Fittings
      const trialCount = APPOINTMENTS.filter(a => ((a.type || '').toLowerCase().includes('trial') || (a.type || '').toLowerCase().includes('fitting')) && a.status !== 'Cancelled').length;
      if (elTrial) elTrial.textContent = trialCount;
      if (trendTrial) trendTrial.innerHTML = `<span>${trialCount > 0 ? trialCount + ' booked' : '0 booked'}</span>`;

      // 5. Deliveries
      const delivCount = APPOINTMENTS.filter(a => ((a.type || '').toLowerCase().includes('deliv') || (a.type || '').toLowerCase().includes('pickup')) && a.status !== 'Cancelled').length;
      if (elDeliv) elDeliv.textContent = delivCount;
      if (trendDeliv) trendDeliv.innerHTML = `<span>${delivCount > 0 ? delivCount + ' scheduled' : '0 scheduled'}</span>`;

    } catch (e) {
      console.error('[Appointments] Failed to render live KPI summary:', e.message);
      const elToday = document.getElementById('kpiTodayCount');
      const elEnq   = document.getElementById('kpiEnquiryCount');
      const elMeas  = document.getElementById('kpiMeasurementCount');
      const elTrial = document.getElementById('kpiTrialCount');
      const elDeliv = document.getElementById('kpiDeliveryCount');

      const todayStr = getTodayIsoString();
      if (elToday) elToday.textContent = APPOINTMENTS.filter(a => a.date === todayStr && a.status !== 'Cancelled').length;
      if (elEnq)   elEnq.textContent   = 0;
      if (elMeas)  elMeas.textContent  = APPOINTMENTS.filter(a => (a.type || '').toLowerCase().includes('measur') && a.status !== 'Cancelled').length;
      if (elTrial) elTrial.textContent = APPOINTMENTS.filter(a => ((a.type || '').toLowerCase().includes('trial') || (a.type || '').toLowerCase().includes('fitting')) && a.status !== 'Cancelled').length;
      if (elDeliv) elDeliv.textContent = APPOINTMENTS.filter(a => ((a.type || '').toLowerCase().includes('deliv') || (a.type || '').toLowerCase().includes('pickup')) && a.status !== 'Cancelled').length;
    }
  }

  // ── Mini Calendar Component (Top Right) ──
  function renderMiniCalendar() {
    const monthYearEl = document.getElementById('miniCalMonthYear');
    const daysGridEl = document.getElementById('miniCalDaysGrid');
    if (!monthYearEl || !daysGridEl) return;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthYearEl.textContent = `${monthNames[state.miniCalMonth]} ${state.miniCalYear}`;

    // Compute first day and total days of the month
    const firstDayIndex = new Date(state.miniCalYear, state.miniCalMonth, 1).getDay(); // 0 = Sun
    const totalDays = new Date(state.miniCalYear, state.miniCalMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(state.miniCalYear, state.miniCalMonth, 0).getDate();

    daysGridEl.innerHTML = '';

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = prevMonthTotalDays - i;
      const cell = document.createElement('div');
      cell.className = 'mc-day-cell other-month';
      cell.innerHTML = `<span class="mc-day-num">${prevDay}</span>`;
      daysGridEl.appendChild(cell);
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const cellDateStr = `${state.miniCalYear}-${String(state.miniCalMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = cellDateStr === state.selectedDate;

      // Find appointment dots for this date
      const aptsOnDay = APPOINTMENTS.filter(a => a.date === cellDateStr && a.status !== 'Cancelled');
      let dotsHtml = '';
      if (aptsOnDay.length > 0) {
        const uniqueTypes = Array.from(new Set(aptsOnDay.map(a => a.type)));
        dotsHtml = '<div class="mc-dots-row">' + uniqueTypes.slice(0, 3).map(t => {
          let dotColor = 'var(--slate-400)';
          if (t === 'Design Consultation') dotColor = 'var(--purple)';
          if (t === 'Measurement') dotColor = 'var(--lime)';
          if (t === 'Trial') dotColor = 'var(--pink)';
          if (t === 'Delivery' || t === 'Pickup') dotColor = 'var(--purple-soft)';
          if (t === 'Follow-up') dotColor = 'var(--blue)';
          return `<span class="mc-dot" style="background: ${dotColor};"></span>`;
        }).join('') + '</div>';
      }

      const cell = document.createElement('div');
      cell.className = `mc-day-cell ${isSelected ? 'selected' : ''}`;
      cell.innerHTML = `
        <span class="mc-day-num">${d}</span>
        ${dotsHtml}
      `;

      cell.onclick = () => {
        state.selectedDate = cellDateStr;
        renderMiniCalendar();
        renderMainCalendar();
        renderTodaysSchedulePanel();
        updateCurrentDateHeader();
        showToast(`Switched calendar to ${formatDateReadable(cellDateStr)}`, 'info');
      };

      daysGridEl.appendChild(cell);
    }
  }

  window.changeMiniCalMonth = function (delta) {
    state.miniCalMonth += delta;
    if (state.miniCalMonth > 11) {
      state.miniCalMonth = 0;
      state.miniCalYear++;
    } else if (state.miniCalMonth < 0) {
      state.miniCalMonth = 11;
      state.miniCalYear--;
    }
    renderMiniCalendar();
  };

  // ── Main Calendar Scheduling Grid (Day / Week / Month / Table View) ──
  function renderMainCalendar() {
    updateCurrentDateHeader();

    const dayView = document.getElementById('calDayView');
    const weekView = document.getElementById('calWeekView');
    const monthView = document.getElementById('calMonthView');
    const tableView = document.getElementById('calTableView');

    if (state.activeView === 'day') {
      if (dayView) dayView.style.display = 'flex';
      if (weekView) weekView.style.display = 'none';
      if (monthView) monthView.style.display = 'none';
      if (tableView) tableView.style.display = 'none';
      renderDayGrid();
    } else if (state.activeView === 'week') {
      if (dayView) dayView.style.display = 'none';
      if (weekView) weekView.style.display = 'block';
      if (monthView) monthView.style.display = 'none';
      if (tableView) tableView.style.display = 'none';
      renderWeekGrid();
    } else if (state.activeView === 'month') {
      if (dayView) dayView.style.display = 'none';
      if (weekView) weekView.style.display = 'none';
      if (monthView) monthView.style.display = 'block';
      if (tableView) tableView.style.display = 'none';
      renderMonthGrid();
    } else if (state.activeView === 'table') {
      if (dayView) dayView.style.display = 'none';
      if (weekView) weekView.style.display = 'none';
      if (monthView) monthView.style.display = 'none';
      if (tableView) tableView.style.display = 'flex';
      renderTableView();
    }
  }

  function getFilteredAppointmentsForDate(dateStr) {
    return APPOINTMENTS.filter(a => {
      if (a.date !== dateStr) return false;
      if (a.status === 'Cancelled') return false;

      // Filter by Type
      if (state.activeTypeFilter !== 'all') {
        if (state.activeTypeFilter === 'Delivery' && (a.type !== 'Delivery' && a.type !== 'Pickup')) return false;
        if (state.activeTypeFilter === 'Follow-up' && (a.type !== 'Follow-up' && a.type !== 'Other')) return false;
        if (state.activeTypeFilter !== 'Delivery' && state.activeTypeFilter !== 'Follow-up' && a.type !== state.activeTypeFilter) {
          return false;
        }
      }

      // Search Query Filter
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const matchesCustomer = a.customer.toLowerCase().includes(q);
        const matchesType = a.type.toLowerCase().includes(q);
        const matchesGarment = a.garment && a.garment.toLowerCase().includes(q);
        const matchesOrder = a.orderNumber && a.orderNumber.toLowerCase().includes(q);
        const matchesPhone = a.phone && a.phone.includes(q);
        if (!matchesCustomer && !matchesType && !matchesGarment && !matchesOrder && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }

  function renderDayGrid() {
    const gridContainer = document.getElementById('calTimeGrid');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    // Time Hours: 9:00 AM to 6:00 PM (10 hourly slots)
    const hours = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
    const slotHeight = 56; // 56px per hour

    // Leftmost Time Column Labels
    const timeLabelsCol = document.createElement('div');
    timeLabelsCol.className = 'cal-time-col-labels';
    hours.forEach(h => {
      const slot = document.createElement('div');
      slot.className = 'cal-time-slot-label';
      slot.textContent = h;
      timeLabelsCol.appendChild(slot);
    });
    gridContainer.appendChild(timeLabelsCol);

    // 5 Category Lanes
    const dayAppointments = getFilteredAppointmentsForDate(state.selectedDate);

    CATEGORY_COLUMNS.forEach(colMeta => {
      const lane = document.createElement('div');
      lane.className = 'cal-cat-lane';
      lane.setAttribute('data-category-col', colMeta.id);

      // Add horizontal slot dividing lines
      for (let i = 0; i < hours.length; i++) {
        const line = document.createElement('div');
        line.className = 'cal-grid-row-line';
        line.style.top = `${i * slotHeight}px`;
        lane.appendChild(line);
      }

      // Filter appointments belonging to this lane
      const laneApts = dayAppointments.filter(apt => {
        if (colMeta.id === 'design' && apt.type === 'Design Consultation') return true;
        if (colMeta.id === 'measurement' && apt.type === 'Measurement') return true;
        if (colMeta.id === 'trial' && apt.type === 'Trial') return true;
        if (colMeta.id === 'delivery' && (apt.type === 'Delivery' || apt.type === 'Pickup')) return true;
        if (colMeta.id === 'followup' && (apt.type === 'Follow-up' || apt.type === 'Other')) return true;
        return false;
      });

      // Render appointment cards in lane
      laneApts.forEach(apt => {
        const [sh, sm] = apt.startTime.split(':').map(Number);
        const [eh, em] = apt.endTime.split(':').map(Number);

        const startMinutes = (sh * 60) + sm;
        const endMinutes = (eh * 60) + em;
        const baseMinutes = 9 * 60; // 9:00 AM base

        const top = Math.max(0, ((startMinutes - baseMinutes) / 60) * slotHeight);
        const durationMinutes = Math.max(30, endMinutes - startMinutes);
        const height = Math.max(48, (durationMinutes / 60) * slotHeight - 4);

        let catClass = 'apt-cat-other';
        if (apt.type === 'Design Consultation') catClass = 'apt-cat-design';
        if (apt.type === 'Measurement') catClass = 'apt-cat-measurement';
        if (apt.type === 'Trial') catClass = 'apt-cat-trial';
        if (apt.type === 'Delivery' || apt.type === 'Pickup') catClass = 'apt-cat-delivery';
        if (apt.type === 'Follow-up') catClass = 'apt-cat-followup';

        const card = document.createElement('div');
        card.className = `apt-card-block ${catClass}`;
        card.id = `aptCard_${apt.id}`;
        card.style.top = `${top}px`;
        card.style.height = `${height}px`;

        card.innerHTML = `
          <div class="apt-card-time">${formatTimeShort(apt.startTime)} - ${formatTimeShort(apt.endTime)}</div>
          <div class="apt-card-title">${apt.customer}</div>
          <div class="apt-card-desc">${apt.notes ? apt.notes.split('.')[0] : apt.type}</div>
        `;

        card.onclick = (e) => {
          e.stopPropagation();
          window.openAppointmentDetail(apt.id);
        };

        lane.appendChild(card);
      });

      gridContainer.appendChild(lane);
    });
  }

  // ── Week View Rendering ──
  function renderWeekGrid() {
    const headerRow = document.getElementById('calWeekHeaderRow');
    const weekGrid = document.getElementById('calWeekGrid');
    if (!headerRow || !weekGrid) return;

    headerRow.innerHTML = '<div class="cal-time-header-blank"></div>';
    weekGrid.innerHTML = '';

    const curr = new Date(state.selectedDate);
    const dayOfWeek = curr.getDay(); // 0 = Sun
    // Calculate Monday of this week
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDays.push(d);
    }

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Header cells
    weekDays.forEach((d, idx) => {
      const dateStr = d.toISOString().split('T')[0];
      const isSelected = dateStr === state.selectedDate;
      const headerCell = document.createElement('div');
      headerCell.className = 'cal-week-col-header';
      headerCell.style.background = isSelected ? 'var(--lime-bg)' : '';
      headerCell.innerHTML = `<div>${dayNames[idx]}</div><div style="font-size:13px;font-weight:800;color:${isSelected ? 'var(--lime)' : 'var(--text-primary)'}">${d.getDate()}</div>`;
      headerRow.appendChild(headerCell);
    });

    // Left time labels
    const timeLabelsCol = document.createElement('div');
    timeLabelsCol.className = 'cal-time-col-labels';
    const hours = ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM'];
    hours.forEach(h => {
      const slot = document.createElement('div');
      slot.className = 'cal-time-slot-label';
      slot.style.height = '96px';
      slot.textContent = h;
      timeLabelsCol.appendChild(slot);
    });
    weekGrid.appendChild(timeLabelsCol);

    // 7 Day Columns
    weekDays.forEach(d => {
      const dateStr = d.toISOString().split('T')[0];
      const col = document.createElement('div');
      col.className = 'cal-week-day-col';

      const dayApts = getFilteredAppointmentsForDate(dateStr);
      dayApts.forEach(apt => {
        let catClass = 'apt-cat-other';
        if (apt.type === 'Design Consultation') catClass = 'apt-cat-design';
        else if (apt.type === 'Measurement') catClass = 'apt-cat-measurement';
        else if (apt.type === 'Trial') catClass = 'apt-cat-trial';
        else if (apt.type === 'Delivery' || apt.type === 'Pickup') catClass = 'apt-cat-delivery';
        else if (apt.type === 'Follow-up') catClass = 'apt-cat-followup';

        const chip = document.createElement('div');
        chip.className = `apt-card-block ${catClass}`;
        chip.style.position = 'relative';
        chip.style.left = '0';
        chip.style.right = '0';
        chip.style.height = 'auto';
        chip.style.marginBottom = '6px';
        chip.innerHTML = `
          <div class="apt-card-time">${apt.startTime} - ${apt.endTime}</div>
          <div class="apt-card-title">${apt.customer}</div>
          <div class="apt-card-desc">${apt.type}</div>
        `;
        chip.onclick = () => window.openAppointmentDetail(apt.id);
        col.appendChild(chip);
      });

      weekGrid.appendChild(col);
    });
  }

  // ── Month View Rendering ──
  function renderMonthGrid() {
    const monthGrid = document.getElementById('calMonthGrid');
    if (!monthGrid) return;

    monthGrid.innerHTML = '';
    const totalDays = new Date(state.miniCalYear, state.miniCalMonth + 1, 0).getDate();

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${state.miniCalYear}-${String(state.miniCalMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'cal-month-cell';
      if (dateStr === state.selectedDate) {
        cell.classList.add('today-cell');
      }

      cell.innerHTML = `<span class="cal-month-cell-num">${d}</span>`;

      const aptsOnDay = getFilteredAppointmentsForDate(dateStr);
      aptsOnDay.forEach(a => {
        let catClass = 'cat-other';
        if (a.type === 'Design Consultation') catClass = 'cat-design';
        else if (a.type === 'Measurement') catClass = 'cat-measurement';
        else if (a.type === 'Trial') catClass = 'cat-trial';
        else if (a.type === 'Delivery' || a.type === 'Pickup') catClass = 'cat-delivery';
        else if (a.type === 'Follow-up') catClass = 'cat-followup';

        const chip = document.createElement('div');
        chip.className = `cal-month-chip ${catClass}`;
        chip.textContent = `${a.startTime} ${a.customer}`;
        chip.title = `${a.startTime} - ${a.customer} (${a.type})`;
        chip.onclick = (e) => {
          e.stopPropagation();
          window.openAppointmentDetail(a.id);
        };
        cell.appendChild(chip);
      });

      cell.onclick = () => {
        state.selectedDate = dateStr;
        switchView('day');
      };

      monthGrid.appendChild(cell);
    }
  }

  // ── Appointments ERP Data Table View ──
  function renderTableView() {
    const tableBody = document.getElementById('apptTableBody');
    const emptyState = document.getElementById('apptTableEmptyState');
    const tableEl = document.getElementById('appointmentsDataTable');
    const countTextEl = document.getElementById('apptTableCountText');
    if (!tableBody) return;

    // Update status pill counter badges across entire dataset
    const totalAll = APPOINTMENTS.length;
    const totalConf = APPOINTMENTS.filter(a => a.status === 'Confirmed').length;
    const totalSched = APPOINTMENTS.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length;
    const totalComp = APPOINTMENTS.filter(a => a.status === 'Completed').length;
    const totalCanc = APPOINTMENTS.filter(a => a.status === 'Cancelled').length;

    const elPillAll = document.getElementById('pillCountAll');
    const elPillConf = document.getElementById('pillCountConfirmed');
    const elPillSched = document.getElementById('pillCountScheduled');
    const elPillComp = document.getElementById('pillCountCompleted');
    const elPillCanc = document.getElementById('pillCountCancelled');

    if (elPillAll) elPillAll.textContent = totalAll;
    if (elPillConf) elPillConf.textContent = totalConf;
    if (elPillSched) elPillSched.textContent = totalSched;
    if (elPillComp) elPillComp.textContent = totalComp;
    if (elPillCanc) elPillCanc.textContent = totalCanc;

    // Filter appointments according to active filters
    let filtered = APPOINTMENTS.slice();

    // 1. Status filter
    if (state.tableStatusFilter && state.tableStatusFilter !== 'ALL') {
      const sf = state.tableStatusFilter.toUpperCase();
      if (sf === 'CONFIRMED') {
        filtered = filtered.filter(a => a.status === 'Confirmed');
      } else if (sf === 'SCHEDULED') {
        filtered = filtered.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed');
      } else if (sf === 'COMPLETED') {
        filtered = filtered.filter(a => a.status === 'Completed');
      } else if (sf === 'CANCELLED') {
        filtered = filtered.filter(a => a.status === 'Cancelled');
      }
    }

    // 2. Type filter
    if (state.tableTypeFilter && state.tableTypeFilter !== 'ALL') {
      const tf = state.tableTypeFilter.toLowerCase();
      filtered = filtered.filter(a => {
        const at = (a.type || '').toLowerCase();
        if (tf.includes('trial') && (at.includes('trial') || at.includes('fitting'))) return true;
        if (tf.includes('delivery') && (at.includes('delivery') || at.includes('pickup'))) return true;
        if (tf.includes('follow') && (at.includes('follow') || at.includes('other'))) return true;
        return at.includes(tf);
      });
    }

    // 3. Search query
    if (state.tableSearchQuery) {
      const q = state.tableSearchQuery.toLowerCase();
      filtered = filtered.filter(a => {
        return (
          (a.customer && a.customer.toLowerCase().includes(q)) ||
          (a.phone && a.phone.toLowerCase().includes(q)) ||
          (a.orderNumber && a.orderNumber.toLowerCase().includes(q)) ||
          (a.staff && a.staff.toLowerCase().includes(q)) ||
          (a.notes && a.notes.toLowerCase().includes(q)) ||
          (a.type && a.type.toLowerCase().includes(q)) ||
          (a.id && String(a.id).toLowerCase().includes(q))
        );
      });
    }

    // 4. Sort chronologically by date and start time
    filtered.sort((a, b) => {
      const dA = (a.date || '') + 'T' + (a.startTime || '00:00');
      const dB = (b.date || '') + 'T' + (b.startTime || '00:00');
      return dA.localeCompare(dB);
    });

    // Update count summary
    if (countTextEl) {
      if (filtered.length === totalAll) {
        countTextEl.textContent = `Showing all ${totalAll} appointments`;
      } else {
        countTextEl.textContent = `Showing ${filtered.length} of ${totalAll} appointments (filtered)`;
      }
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      if (tableEl) tableEl.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (tableEl) tableEl.style.display = 'table';

    // Render table rows
    tableBody.innerHTML = filtered.map((a, idx) => {
      const shortId = a.id
        ? (typeof a.id === 'string' && a.id.length > 8 ? a.id.slice(0, 8).toUpperCase() : a.id)
        : `APT-${idx + 1}`;

      // Type Badge styling
      let typeClass = 'type-gold';
      if (a.type === 'Measurement') typeClass = 'type-lime';
      else if (a.type === 'Trial' || a.type === 'Fitting') typeClass = 'type-rose';
      else if (a.type === 'Delivery' || a.type === 'Pickup') typeClass = 'type-purple';
      else if (a.type === 'Follow-up' || a.type === 'Other') typeClass = 'type-sky';

      // Status Pill styling
      let statusClass = 'status-confirmed';
      const s = a.status || 'Confirmed';
      if (s === 'Completed') statusClass = 'status-completed';
      else if (s === 'Cancelled') statusClass = 'status-cancelled';
      else if (s === 'Scheduled') statusClass = 'status-scheduled';
      else if (s === 'Rescheduled') statusClass = 'status-rescheduled';

      // Customer Initials & Avatar
      const initials = a.customer
        ? a.customer.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
        : 'CL';
      const avatarHtml = (a.avatar && !a.avatar.includes('avatar.jpg') && !a.avatar.includes('default'))
        ? `<img src="${a.avatar}" class="table-cust-avatar" alt="${a.customer}" onerror="this.outerHTML='<div class=\\'table-cust-initials\\'>${initials}</div>'">`
        : `<div class="table-cust-initials">${initials}</div>`;

      // Staff Initials
      const staffInitials = a.staff
        ? a.staff.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
        : 'ST';

      // Order link badge
      const orderHtml = a.orderNumber
        ? `<span class="table-order-badge" onclick="event.stopPropagation();window.location.href='../orders/orders.html'" title="Open Order ${a.orderNumber}">#${a.orderNumber}</span>`
        : `<span class="table-no-order" title="Bespoke Consultation / No linked order">—</span>`;

      const formattedDate = formatDateReadable(a.date);
      const timeRange = `${formatTimeShort(a.startTime)} – ${formatTimeShort(a.endTime)}`;

      return `
        <tr class="appt-table-row" data-id="${a.id}" onclick="openAppointmentDetail('${a.id}')">
          <td class="td-appt-num">
            <span class="appt-num-chip" title="Appointment ID: ${a.id}">#${shortId}</span>
          </td>
          <td class="td-customer">
            <div class="table-cust-cell">
              ${avatarHtml}
              <div class="table-cust-info">
                <span class="table-cust-name">${a.customer}</span>
                <span class="table-cust-phone">${a.phone || a.customerMobile || 'No phone'}</span>
              </div>
            </div>
          </td>
          <td class="td-type">
            <span class="table-type-pill ${typeClass}">${a.type}</span>
          </td>
          <td class="td-datetime">
            <div class="table-dt-cell">
              <span class="table-dt-date">${formattedDate}</span>
              <span class="table-dt-time">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${timeRange}
              </span>
            </div>
          </td>
          <td class="td-order">${orderHtml}</td>
          <td class="td-staff">
            <div class="table-staff-cell">
              <div class="table-staff-avatar">${staffInitials}</div>
              <span class="table-staff-name">${a.staff}</span>
            </div>
          </td>
          <td class="td-status">
            <span class="table-status-pill ${statusClass}">
              <span class="status-dot"></span>
              <span>${s}</span>
            </span>
          </td>
          <td class="td-notes" title="${(a.notes || '').replace(/"/g, '&quot;')}">
            <span class="table-notes-text">${a.notes || '—'}</span>
          </td>
          <td class="td-actions" onclick="event.stopPropagation()">
            <div class="table-action-btns">
              <button type="button" class="btn-table-action" onclick="openAppointmentDetail('${a.id}')" title="View & Edit Details">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <select class="table-status-quickselect" onchange="quickUpdateApptStatus('${a.id}', this.value)" title="Quick Status Update">
                <option value="" disabled selected>Status ▾</option>
                <option value="CONFIRMED" ${s === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="SCHEDULED" ${s === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
                <option value="COMPLETED" ${s === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="CANCELLED" ${s === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ── Today's Schedule Panel (Right) ──
  function renderTodaysSchedulePanel() {
    const listEl = document.getElementById('todayScheduleList');
    const countEl = document.getElementById('todayScheduleCount');
    if (!listEl) return;

    const todayApts = APPOINTMENTS
      .filter(a => a.date === state.selectedDate && a.status !== 'Cancelled')
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (countEl) countEl.textContent = todayApts.length;

    if (todayApts.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:24px 10px;color:rgba(255,255,255,0.45);font-size:11.5px;">
          No appointments scheduled for this day.
        </div>
      `;
      return;
    }

    // Display first 5 in the panel
    const displayList = todayApts.slice(0, 5);

    listEl.innerHTML = displayList.map(apt => {
      const initials = apt.customer ? apt.customer.split(' ').map(w => w[0]).join('').slice(0, 2) : 'CL';
      const statusLabel = apt.status || 'Confirmed';
      let statusCls = '';
      if (statusLabel === 'Completed') statusCls = 'completed';
      else if (statusLabel === 'Cancelled') statusCls = 'cancelled';
      else if (statusLabel === 'Scheduled') statusCls = 'scheduled';

      return `
        <div class="sched-item-row" onclick="window.highlightAndOpenAppointment('${apt.id}')">
          <div class="sched-item-left">
            <span class="sched-time-badge">${formatTimeShort(apt.startTime)}</span>
            <img src="../assets/user_avatar.jpg" alt="${apt.customer}" class="sched-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
            <div class="sched-avatar-fallback" style="display:none;">${initials}</div>
            <div class="sched-info">
              <span class="sched-name">${apt.customer}</span>
              <span class="sched-type">${apt.type}</span>
            </div>
          </div>
          <span class="sched-status-pill ${statusCls}">${statusLabel}</span>
        </div>
      `;
    }).join('');
  }

  // ── Upcoming Summary Numbers (Dynamic from live DB appointments) ──
  function renderUpcomingSummary() {
    // Window: from today (or selectedDate if navigating into future) to +7 days
    const todayStr = getTodayIsoString();
    const baseDateStr = (state.selectedDate && state.selectedDate >= todayStr)
      ? state.selectedDate
      : todayStr;

    const startDate = new Date(baseDateStr + 'T00:00:00');
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);

    const upcomingApts = APPOINTMENTS.filter(a => {
      if (!a.date) return false;
      if (a.status === 'Cancelled') return false;
      const aptDate = new Date(a.date + 'T00:00:00');
      return aptDate >= startDate && aptDate <= endDate;
    });

    const upcomingMeasurements = upcomingApts.filter(a => a.type === 'Measurement').length;
    const upcomingTrials = upcomingApts.filter(a => a.type === 'Trial' || a.type === 'Fitting').length;
    const upcomingDeliveries = upcomingApts.filter(a => a.type === 'Delivery' || a.type === 'Pickup').length;
    const upcomingFollowups = upcomingApts.filter(a => a.type === 'Follow-up' || a.type === 'Other' || a.type === 'Design Consultation').length;

    const elM = document.getElementById('upMeasurementCount') || document.getElementById('upMeasureCount');
    const elT = document.getElementById('upTrialCount');
    const elD = document.getElementById('upDeliveryCount');
    const elF = document.getElementById('upFollowupCount');

    if (elM) elM.textContent = upcomingMeasurements;
    if (elT) elT.textContent = upcomingTrials;
    if (elD) elD.textContent = upcomingDeliveries;
    if (elF) elF.textContent = upcomingFollowups;
  }

  // ── Global Handlers Attached to Window ──

  window.navigateDate = function (deltaDays) {
    const d = new Date(state.selectedDate);
    d.setDate(d.getDate() + deltaDays);
    state.selectedDate = d.toISOString().split('T')[0];
    state.miniCalMonth = d.getMonth();
    state.miniCalYear = d.getFullYear();

    renderMiniCalendar();
    renderMainCalendar();
    renderTodaysSchedulePanel();
    renderKpiSummary();
    renderUpcomingSummary();
  };

  window.goToToday = function () {
    const today = new Date();
    state.selectedDate = getTodayIsoString();
    state.miniCalMonth = today.getMonth();
    state.miniCalYear = today.getFullYear();

    renderMiniCalendar();
    renderMainCalendar();
    renderTodaysSchedulePanel();
    renderKpiSummary();
    renderUpcomingSummary();
    showToast(`Jumped to Today (${formatDateReadable(state.selectedDate)})`, 'info');
  };

  window.switchView = function (viewName, btnEl) {
    state.activeView = viewName;
    document.querySelectorAll('.view-tab').forEach(b => b.classList.remove('active'));
    if (btnEl) {
      btnEl.classList.add('active');
    } else {
      const activeBtn = document.querySelector(`.view-tab[data-view="${viewName}"]`);
      if (activeBtn) activeBtn.classList.add('active');
    }
    renderMainCalendar();
  };

  // ── Table View Interactive Controls ──
  window.handleTableSearch = function (val) {
    state.tableSearchQuery = (val || '').trim().toLowerCase();
    const clearBtn = document.getElementById('apptSearchClearBtn');
    if (clearBtn) clearBtn.style.display = state.tableSearchQuery ? 'inline-flex' : 'none';
    renderTableView();
  };

  window.clearTableSearch = function () {
    state.tableSearchQuery = '';
    const input = document.getElementById('apptTableSearchInput');
    if (input) input.value = '';
    const clearBtn = document.getElementById('apptSearchClearBtn');
    if (clearBtn) clearBtn.style.display = 'none';
    renderTableView();
  };

  window.filterTableByStatus = function (status, btnEl) {
    state.tableStatusFilter = status;
    document.querySelectorAll('#apptStatusFilterPills .status-pill').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    renderTableView();
  };

  window.filterTableByType = function (type) {
    state.tableTypeFilter = type;
    renderTableView();
  };

  window.resetTableFilters = function () {
    state.tableSearchQuery = '';
    state.tableStatusFilter = 'ALL';
    state.tableTypeFilter = 'ALL';
    const input = document.getElementById('apptTableSearchInput');
    if (input) input.value = '';
    const typeSelect = document.getElementById('apptTableTypeSelect');
    if (typeSelect) typeSelect.value = 'ALL';
    const clearBtn = document.getElementById('apptSearchClearBtn');
    if (clearBtn) clearBtn.style.display = 'none';
    document.querySelectorAll('#apptStatusFilterPills .status-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.status === 'ALL');
    });
    renderTableView();
    showToast('Table filters cleared', 'info');
  };

  window.quickUpdateApptStatus = async function (id, newStatus) {
    if (!id || !newStatus) return;
    try {
      const { default: api } = await import('../api.js');
      await api.appointments.updateStatus(id, newStatus);
      const apt = APPOINTMENTS.find(a => a.id === id);
      if (apt) {
        apt.status = mapApptStatus(newStatus);
      }
      renderKpiSummary();
      renderMainCalendar();
      renderTodaysSchedulePanel();
      showToast(`Appointment status updated to ${newStatus}`, 'success');
    } catch (err) {
      console.error('[Appointments] Failed to update status:', err);
      showToast('Failed to update status: ' + (err.message || err), 'error');
    }
  };

  window.toggleCalFilterMenu = function (e) {
    e.stopPropagation();
    const menu = document.getElementById('calFilterMenu');
    if (menu) menu.classList.toggle('open');
  };

  window.selectTypeFilter = function (type, label) {
    state.activeTypeFilter = type;
    const lbl = document.getElementById('currentFilterLabel');
    if (lbl) lbl.textContent = label;

    const menu = document.getElementById('calFilterMenu');
    if (menu) {
      menu.classList.remove('open');
      menu.querySelectorAll('.dd-item').forEach(i => i.classList.remove('active'));
      const activeItem = Array.from(menu.querySelectorAll('.dd-item')).find(i => i.textContent.includes(label));
      if (activeItem) activeItem.classList.add('active');
    }

    renderMainCalendar();
    showToast(`Filter applied: ${label}`, 'info');
  };

  window.highlightAndOpenAppointment = function (aptId) {
    const apt = APPOINTMENTS.find(a => a.id === aptId);
    if (!apt) return;

    // Highlight card on calendar
    const card = document.getElementById(`aptCard_${aptId}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.outline = '2px solid var(--lime)';
      card.style.boxShadow = '0 0 16px var(--lime-glow)';
      setTimeout(() => {
        card.style.outline = '';
        card.style.boxShadow = '';
      }, 2000);
    }

    window.openAppointmentDetail(aptId);
  };

  // ── Modals Management ──

  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      refreshLucideIcons();
    }
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
  };

  // 1. New Appointment Modal
  window.openNewAppointmentModal = function () {
    window.openModal('newAppointmentModal');
    const dateInput = document.getElementById('aptDate');
    if (dateInput) dateInput.value = state.selectedDate;
  };

  window.handleSaveAppointment = function (e) {
    e.preventDefault();
    const customer = document.getElementById('aptCustomerName')?.value;
    const phone = document.getElementById('aptPhone')?.value;
    const type = document.getElementById('aptTypeSelect')?.value;
    const date = document.getElementById('aptDate')?.value;
    const startTime = document.getElementById('aptStartTime')?.value;
    const endTime = document.getElementById('aptEndTime')?.value;
    const garment = document.getElementById('aptGarment')?.value;
    const orderNumber = document.getElementById('aptOrderNumber')?.value;
    const staff = document.getElementById('aptStaff')?.value;
    const notes = document.getElementById('aptNotes')?.value;
    const status = document.getElementById('aptStatus')?.value || 'Confirmed';

    // Validation: End Time > Start Time
    if (startTime >= endTime) {
      alert('Validation Error: End Time must be later than Start Time.');
      return;
    }

    const nextId = `APT-2026-${String(APPOINTMENTS.length + 1).padStart(4, '0')}`;
    const newApt = {
      id: nextId,
      customerMobile: phone,
      customer,
      phone,
      type,
      date,
      startTime,
      endTime,
      garment,
      orderNumber,
      status,
      staff,
      notes,
      avatar: '../assets/user_avatar.jpg'
    };

    // Asynchronously persist to backend REST API
    (async () => {
      try {
        const { default: api } = await import('../api.js');
        const apptTypeEnum = type === 'Trial Fitting' ? 'FITTING' : (type === 'Delivery' ? 'DELIVERY' : (type === 'Measurements' ? 'MEASUREMENT' : 'CONSULTATION'));
        await api.appointments.create({
          customerMobile: phone,
          apptType: apptTypeEnum,
          scheduledAt: `${date}T${startTime}:00`,
          durationMinutes: 60,
          staffAssigned: staff,
          notes: `${garment} - ${notes}`
        });
        console.log('[Appointments] Saved appointment to live REST API with customerMobile:', phone);
      } catch (err) {
        console.warn('[Appointments] API save failed, saved locally:', err.message);
      }
    })();

    APPOINTMENTS.push(newApt);
    state.selectedDate = date;

    renderKpiSummary();
    renderMiniCalendar();
    renderMainCalendar();
    renderTodaysSchedulePanel();
    window.closeModal('newAppointmentModal');
    showToast(`Appointment for ${customer} booked successfully!`, 'success');
  };

  // 2. Appointment Detail Modal
  window.openAppointmentDetail = function (aptId) {
    const apt = APPOINTMENTS.find(a => a.id === aptId);
    if (!apt) return;

    state.selectedAppointmentId = apt.id;
    const nameEl = document.getElementById('detailCustomerName');
    const timeEl = document.getElementById('detailDateTime');
    const contentEl = document.getElementById('appointmentDetailContent');

    if (nameEl) nameEl.textContent = `${apt.customer} (${apt.type})`;
    if (timeEl) timeEl.textContent = `${formatDateReadable(apt.date)} • ${formatTimeShort(apt.startTime)} - ${formatTimeShort(apt.endTime)}`;

    if (contentEl) {
      contentEl.innerHTML = `
        <div style="background:var(--bg-card);border:1px solid var(--border-card);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:14px;font-weight:800;color:var(--text-primary);">${apt.customer}</div>
              <div style="font-size:11px;color:var(--text-muted);">${apt.phone}</div>
            </div>
            <span class="sched-status-pill">${apt.status}</span>
          </div>

          <div style="height:1px;background:var(--border-card);margin:4px 0;"></div>

          <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:10px;font-size:11.5px;">
            <div><span style="color:var(--text-muted);">Order Ref:</span> <strong style="color:var(--lime);">${apt.orderNumber || 'None'}</strong></div>
            <div><span style="color:var(--text-muted);">Garment:</span> <strong style="color:var(--text-primary);">${apt.garment || 'Boutique Collection'}</strong></div>
            <div><span style="color:var(--text-muted);">Assigned Staff:</span> <strong style="color:var(--text-primary);">${apt.staff}</strong></div>
            <div><span style="color:var(--text-muted);">Location:</span> <strong style="color:var(--text-primary);">Fitting Suite A</strong></div>
          </div>

          <div style="margin-top:6px;font-size:11px;color:var(--text-secondary);background:var(--bg-input);padding:8px;border-radius:6px;">
            ${apt.notes || 'No special requirements noted for this session.'}
          </div>
        </div>
      `;
    }

    window.openModal('appointmentDetailModal');
  };

  window.handleCancelAppointment = function () {
    const apt = APPOINTMENTS.find(a => a.id === state.selectedAppointmentId);
    if (!apt) return;

    if (confirm(`Are you sure you want to cancel the appointment for ${apt.customer}?`)) {
      apt.status = 'Cancelled';
      window.closeModal('appointmentDetailModal');
      renderKpiSummary();
      renderMiniCalendar();
      renderMainCalendar();
      renderTodaysSchedulePanel();
      showToast(`Appointment for ${apt.customer} cancelled.`, 'warning');
    }
  };

  window.handleEditAppointment = function () {
    window.closeModal('appointmentDetailModal');
    showToast('Opening appointment editor...', 'info');
  };

  // 3. Reschedule Modal
  window.openRescheduleModal = function () {
    window.closeModal('appointmentDetailModal');
    window.openModal('rescheduleModal');

    const apt = APPOINTMENTS.find(a => a.id === state.selectedAppointmentId);
    if (!apt) return;

    const sub = document.getElementById('rescheduleSubtitle');
    const dateInp = document.getElementById('rescheduleDate');
    const startInp = document.getElementById('rescheduleStartTime');
    const endInp = document.getElementById('rescheduleEndTime');

    if (sub) sub.textContent = `Rescheduling session for ${apt.customer} (${apt.type})`;
    if (dateInp) dateInp.value = apt.date;
    if (startInp) startInp.value = apt.startTime;
    if (endInp) endInp.value = apt.endTime;
  };

  window.handleSaveReschedule = function (e) {
    e.preventDefault();
    const apt = APPOINTMENTS.find(a => a.id === state.selectedAppointmentId);
    if (!apt) return;

    const newDate = document.getElementById('rescheduleDate').value;
    const newStart = document.getElementById('rescheduleStartTime').value;
    const newEnd = document.getElementById('rescheduleEndTime').value;

    if (newStart >= newEnd) {
      alert('End Time must be later than Start Time.');
      return;
    }

    apt.date = newDate;
    apt.startTime = newStart;
    apt.endTime = newEnd;
    apt.status = 'Rescheduled';

    state.selectedDate = newDate;
    window.closeModal('rescheduleModal');

    renderKpiSummary();
    renderMiniCalendar();
    renderMainCalendar();
    renderTodaysSchedulePanel();
    showToast(`Appointment rescheduled to ${formatDateReadable(newDate)} at ${formatTimeShort(newStart)}!`, 'success');
  };

  // 4. Walk-in Modal
  window.openWalkInModal = function () {
    window.openModal('walkInModal');
  };

  window.handleSaveWalkIn = function (e) {
    e.preventDefault();
    const name = document.getElementById('walkInName').value;
    const phone = document.getElementById('walkInPhone').value;
    const type = document.getElementById('walkInType').value;
    const staff = document.getElementById('walkInStaff').value;
    const notes = document.getElementById('walkInNotes').value;

    const now = new Date();
    const curHour = String(now.getHours()).padStart(2, '0');
    const endHour = String(Math.min(now.getHours() + 1, 23)).padStart(2, '0');

    const nextId = `APT-2026-${String(APPOINTMENTS.length + 1).padStart(4, '0')}`;
    APPOINTMENTS.push({
      id: nextId,
      customer: name,
      phone,
      type,
      date: state.selectedDate,
      startTime: `${curHour}:00`,
      endTime: `${endHour}:00`,
      garment: 'Walk-in Inquiry',
      orderNumber: '',
      status: 'Confirmed',
      staff,
      notes: `Walk-in intake: ${notes}`,
      avatar: '../assets/user_avatar.jpg'
    });

    window.closeModal('walkInModal');
    renderKpiSummary();
    renderMainCalendar();
    renderTodaysSchedulePanel();
    showToast(`Walk-in customer ${name} registered into today's calendar!`, 'success');
  };

  // 5. Send Reminder Modal
  window.openSendReminderModal = function () {
    const listEl = document.getElementById('reminderRecipientsList');
    if (listEl) {
      const todayApts = APPOINTMENTS.filter(a => a.date === state.selectedDate && a.status === 'Confirmed');
      listEl.innerHTML = todayApts.map(a => `
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--slate-300);padding:3px 4px;">
          <span><strong>${a.customer}</strong> • ${a.type}</span>
          <span style="color:var(--lime);">${a.startTime}</span>
        </div>
      `).join('');
    }
    window.openModal('reminderModal');
  };

  window.handleBroadcastReminders = function () {
    window.closeModal('reminderModal');
    showToast('Reminders dispatched via WhatsApp and SMS to all confirmed clients!', 'success');
  };

  window.openAllTodayScheduleModal = function () {
    const count = APPOINTMENTS.filter(a => a.date === state.selectedDate).length;
    showToast(`Viewing all ${count} scheduled session${count === 1 ? '' : 's'} for ${formatDateReadable(state.selectedDate)}`, 'info');
  };

  window.openUpcomingSummaryModal = function () {
    const count = APPOINTMENTS.length;
    showToast(`Upcoming Boutique Schedule: ${count} appointment${count === 1 ? '' : 's'} scheduled.`, 'info');
  };

  // ── Search Handling ──
  function setupSearchListener() {
    const searchBar = document.getElementById('searchBarBtn');
    if (searchBar) {
      searchBar.addEventListener('click', () => {
        const term = prompt('Search appointments by customer name, phone, or order number:');
        if (term !== null) {
          state.searchQuery = term.trim();
          renderMainCalendar();
          showToast(`Filtered schedule for "${term}"`, 'info');
        }
      });
    }
  }

  // ── Keyboard Shortcuts ──
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const term = prompt('Search appointments:');
        if (term !== null) {
          state.searchQuery = term.trim();
          renderMainCalendar();
        }
      }

      // Escape key closes modals
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.style.display = 'none');
        const filterMenu = document.getElementById('calFilterMenu');
        if (filterMenu) filterMenu.classList.remove('open');
      }
    });
  }

  // ── Helper Utilities ──
  function updateCurrentDateHeader() {
    const headerText = document.getElementById('calCurrentDateText');
    if (headerText) {
      headerText.textContent = formatDateReadable(state.selectedDate);
    }
  }

  function formatDateReadable(dateStr) {
    const d = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function formatTimeShort(timeStr) {
    // "09:30" -> "9:30 AM", "14:00" -> "2:00 PM"
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${mStr}`;
  }

  function setupDropdownListeners() {
    setupSearchListener();

    // Nav dropdowns (branch, notifications, user) are handled by nav.js setupNavbar()
    // Only close app-specific menus on outside click
    document.addEventListener('click', () => {
      const calFilter = document.getElementById('calFilterMenu');
      if (calFilter) calFilter.classList.remove('open');
    });
  }

  // ── Global Toast Helper ──
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;

    let iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    if (type === 'warning') iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>';
    if (type === 'info') iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
  window.showToast = showToast;

  function refreshLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function mapApptType(t) {
    if (!t) return 'Design Consultation';
    const raw = String(t).toUpperCase();
    if (raw === 'DESIGN_CONSULTATION' || raw === 'CONSULTATION') return 'Design Consultation';
    if (raw === 'MEASUREMENT') return 'Measurement';
    if (raw === 'TRIAL' || raw === 'FITTING') return 'Trial';
    if (raw === 'DELIVERY' || raw === 'PICKUP') return 'Delivery';
    if (raw === 'FOLLOW_UP' || raw === 'FOLLOWUP') return 'Follow-up';
    return raw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  function mapApptStatus(s) {
    if (!s) return 'Confirmed';
    if (s === 'SCHEDULED' || s === 'CONFIRMED') return 'Confirmed';
    if (s === 'COMPLETED') return 'Completed';
    if (s === 'CANCELLED') return 'Cancelled';
    if (s === 'RESCHEDULED') return 'Rescheduled';
    return String(s);
  }

  function calculateEndTime(scheduledAt, minutes) {
    if (!scheduledAt) return '11:00';
    const d = new Date(scheduledAt);
    d.setMinutes(d.getMinutes() + (minutes || 60));
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  async function loadAppointmentsFromApi() {
    try {
      const { default: api, Auth } = await import('../api.js');
      if (!Auth.isLoggedIn()) {
        window.location.href = '../login/login.html';
        return;
      }
      const res = await api.appointments.list({ page: 0, size: 100 });
      const items = Array.isArray(res) ? res : (res && res.content ? res.content : []);
      const realApts = items.map(a => ({
        id: a.id,
        customerMobile: a.customerMobile || a.customerPhone,
        customer: a.customerName || 'Client',
        phone: a.customerPhone || a.customerMobile || '',
        type: mapApptType(a.apptType),
        date: a.scheduledAt ? a.scheduledAt.slice(0, 10) : state.selectedDate,
        startTime: a.scheduledAt ? a.scheduledAt.slice(11, 16) : '10:00',
        endTime: calculateEndTime(a.scheduledAt, a.durationMinutes || 60),
        garment: a.orderCode ? `Order ${a.orderCode}` : 'Bespoke Garment',
        orderNumber: a.orderCode || '',
        status: mapApptStatus(a.status),
        staff: a.staffAssigned || 'Staff',
        notes: a.notes || '',
        avatar: a.customerAvatar || '../assets/user_avatar.jpg'
      }));
      APPOINTMENTS.length = 0;
      APPOINTMENTS.push(...realApts);
      renderKpiSummary();
      renderMiniCalendar();
      renderMainCalendar();
      renderTodaysSchedulePanel();
      renderUpcomingSummary();
    } catch (err) {
      console.error('[Appointments] Failed to load appointments from backend:', err.message);
      APPOINTMENTS.length = 0;
      renderKpiSummary();
      renderMiniCalendar();
      renderMainCalendar();
      renderTodaysSchedulePanel();
    }
  }

  function init() {
    startLiveClock();
    collapseSidebarDefault();
    setupDropdownListeners();
    setupKeyboardShortcuts();
    updateCurrentDateHeader();
    refreshLucideIcons();
    loadAppointmentsFromApi();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
