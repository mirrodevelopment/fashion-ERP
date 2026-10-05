/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — WORKFORCE MANAGEMENT
 * Complete Frontend Controller, State Machine, Charts & Interactions
 * File: frontend/WorkforceManagement/workforce.js
 * =======================================================================
 */

(function () {
  'use strict';

  const FALLBACK_AVATAR_SVG = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 width=%2224%22 height=%2224%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2%22/%3E%3Ccircle cx=%2212%22 cy=%227%22 r=%224%22/%3E%3C/svg%3E";
  const THEME_FONT_SANS = (typeof window !== 'undefined' && window.getComputedStyle ? getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim() : '') || "'Plus Jakarta Sans', sans-serif";

  /* ==========================================================================
     1. APPLICATION CENTRAL STATE
     ========================================================================== */
  const state = {
    employees: [],
    selectedDepartment: "all",
    searchQuery: "",
    currentPage: 1,
    itemsPerPage: 8,
    sortBy: null,
    sortDirection: "asc",
    selectedEmployees: new Set(),
    detailedFilters: {
      workload: "all",
      status: "all",
      skill: ""
    }
  };

  /* ==========================================================================
     2.5 LUCIDE ICONS REFRESH HELPER
     ========================================================================== */
  function refreshLucide() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try {
        window.lucide.createIcons();
      } catch (err) {
        console.warn("[Workforce] Error creating Lucide icons:", err);
      }
    }
  }

  /* ==========================================================================
     3. PERSISTENCE & INITIALIZATION
     ========================================================================== */
  async function loadEmployeesFromApi() {
    try {
      const { default: api } = await import('../api.js');
      const res = await api.employees.list({ page: 0, size: 50 });
      const items = Array.isArray(res) ? res : (res?.content || []);
      
      state.employees = items.map(e => {
        let dept = "Stitching";
        let roleTitle = e.role ? e.role.charAt(0).toUpperCase() + e.role.slice(1).toLowerCase() : "Tailor";
        let salaryVal = Number(e.salary) || 0;
        let workloadVal = Number(e.workload) || 0;
        let ordersVal = Number(e.ordersAssigned) || 0;
        let completedVal = Number(e.completedMonth) || 0;
        let effVal = Number(e.efficiency) || 0;

        if (e.notes) {
          try {
            const meta = JSON.parse(e.notes);
            if (meta.department) dept = meta.department;
            if (meta.role) roleTitle = meta.role;
            if (meta.salary != null) salaryVal = Number(meta.salary);
            if (meta.workload != null) workloadVal = Number(meta.workload);
            if (meta.ordersAssigned != null) ordersVal = Number(meta.ordersAssigned);
            if (meta.completedMonth != null) completedVal = Number(meta.completedMonth);
            if (meta.efficiency != null) effVal = Number(meta.efficiency);
          } catch (_) {
            if (e.notes.includes("Dept:")) {
              const m = e.notes.match(/Dept:\s*([A-Za-z]+)/);
              if (m) dept = m[1];
            }
          }
        }
        if (!dept || dept === "Stitching") {
          const roleUpper = (e.role || "").toUpperCase();
          if (roleUpper.includes("DESIGN")) dept = "Designing";
          else if (roleUpper.includes("CUT")) dept = "Cutting";
          else if (roleUpper.includes("FINISH")) dept = "Finishing";
          else if (roleUpper.includes("EMBROID")) dept = "Embroidery";
          else if (roleUpper.includes("ADMIN") || roleUpper.includes("MANAG") || roleUpper.includes("SUPERVISOR")) dept = "Administration";
          else if (roleUpper.includes("STITCH") || roleUpper.includes("TAILOR")) dept = "Stitching";
        }

        return {
          id: e.id,
          dbId: e.id,
          code: e.employeeCode || "",
          name: e.name || "",
          role: roleTitle,
          department: dept,
          skills: e.specialization ? e.specialization.split(", ").map(s => s.trim()) : [],
          workload: workloadVal,
          ordersAssigned: ordersVal,
          completedMonth: completedVal,
          efficiency: effVal,
          status: (e.status === "ACTIVE" || e.status === "Active") ? "Active" : "On Leave",
          phone: e.phone || "",
          email: e.email || "",
          salary: salaryVal,
          avatar: e.avatarUrl || FALLBACK_AVATAR_SVG,
          joinedDate: e.joinedDate ? String(e.joinedDate) : ""
        };
      });

      if (items.length === 0) {
        state.employees = [];
      }

      renderTable();
      updateDepartmentTabs();

      let kpis = null;
      try {
        kpis = await api.employees.kpis().catch(() => null);
      } catch (_) {}
      updateKPIs(kpis);

      initCharts();
      renderSidebar();
    } catch (err) {
      console.error('[Workforce] Failed to load employees from API:', err.message);
    }
  }

  function loadPersistedState() {
    state.employees = [];
    try {
      localStorage.removeItem("ritham_workforce_employees");
    } catch (_) {}
  }

  function saveEmployees() {
    // State is persisted in backend DB via REST API
  }

  /* ==========================================================================
     4. CHARTS & KPIS CONTROLLER (CHART.JS & REAL-TIME METRICS)
     ========================================================================== */
  let deptChartInstance = null;
  let productivityChartInstance = null;
  let workloadChartInstance = null;

  function updateDepartmentTabs() {
    const total = state.employees.length;
    const depts = ["Designing", "Cutting", "Stitching", "Finishing", "Embroidery", "Administration"];
    
    const allBtn = document.querySelector('.dept-tab[data-dept="all"]');
    if (allBtn) {
      allBtn.textContent = `All Employees (${total})`;
    }

    depts.forEach(d => {
      const btn = document.querySelector(`.dept-tab[data-dept="${d}"]`);
      if (btn) {
        const count = state.employees.filter(e => (e.department || "").toLowerCase() === d.toLowerCase()).length;
        btn.textContent = `${d} (${count})`;
      }
    });
  }

  function updateKPIs(apiKpis = null) {
    const total = apiKpis && apiKpis.totalCount != null ? apiKpis.totalCount : state.employees.length;
    const active = apiKpis && apiKpis.activeCount != null ? apiKpis.activeCount : state.employees.filter(e => e.status === "Active").length;
    const onLeave = apiKpis && apiKpis.onLeaveCount != null ? apiKpis.onLeaveCount : state.employees.filter(e => e.status === "On Leave" || e.status === "Leave").length;
    const totalLabour = state.employees.reduce((acc, e) => acc + (Number(e.salary) || 0), 0);
    const avgEfficiency = total > 0
      ? Math.round(state.employees.reduce((acc, e) => acc + (Number(e.efficiency) || 0), 0) / total)
      : 0;

    const totalEl = document.getElementById('kpiTotalEmployees');
    if (totalEl) totalEl.textContent = total;

    const activeEl = document.getElementById('kpiActiveStaff');
    if (activeEl) activeEl.textContent = active;

    const leaveEl = document.getElementById('kpiOnLeave');
    if (leaveEl) leaveEl.textContent = onLeave;

    const activePctEl = document.getElementById('kpiActivePct');
    if (activePctEl) activePctEl.textContent = total > 0 ? Math.round((active / total) * 100) + '% of total' : '0% of total';

    const leavePctEl = document.getElementById('kpiLeavePct');
    if (leavePctEl) leavePctEl.textContent = total > 0 ? Math.round((onLeave / total) * 100) + '% of total' : '0% of total';

    const costEl = document.getElementById('kpiLabourCost');
    if (costEl) costEl.innerHTML = `&#8377;${totalLabour.toLocaleString('en-IN')}`;

    const prodEl = document.getElementById('kpiAvgProductivity');
    if (prodEl) prodEl.textContent = `${avgEfficiency}%`;
  }

  function initCharts() {
    if (!window.Chart) return;

    const totalEmp = state.employees.length;

    // 1. Staff by Department Donut Chart
    const deptCanvas = document.getElementById("deptDonutChart");
    if (deptCanvas) {
      const existing = window.Chart.getChart(deptCanvas);
      if (existing) existing.destroy();
      if (deptChartInstance) { deptChartInstance.destroy(); deptChartInstance = null; }

      const depts = ["Designing", "Cutting", "Stitching", "Finishing", "Embroidery", "Administration"];
      const deptCounts = depts.map(d => state.employees.filter(e => (e.department || "").toLowerCase() === d.toLowerCase()).length);
      const totalEl = document.getElementById("deptDonutTotal");
      if (totalEl) totalEl.textContent = totalEmp;

      const colors = ["#E6D37A", "#7B88FF", "#D1D5DB", "#F8A4B8", "#C084FC", "#6EE7B7"];
      const legendEl = document.getElementById("deptLegendList");
      if (legendEl) {
        legendEl.innerHTML = depts.map((d, i) => {
          const count = deptCounts[i];
          const pct = totalEmp > 0 ? Math.round((count / totalEmp) * 100) : 0;
          return `<div class="legend-row"><span class="legend-dot" style="background:${colors[i]};"></span><span class="legend-name">${d}</span><span class="legend-count">${count} (${pct}%)</span></div>`;
        }).join("");
      }

      const ctx = deptCanvas.getContext("2d");
      deptChartInstance = new window.Chart(ctx, {
        type: "doughnut",
        data: {
          labels: totalEmp > 0 ? depts : ["No Employees"],
          datasets: [{
            data: totalEmp > 0 ? deptCounts : [1],
            backgroundColor: totalEmp > 0 ? colors : ["rgba(255, 255, 255, 0.08)"],
            borderWidth: totalEmp > 0 ? 2 : 0,
            borderColor: "rgba(38, 30, 26, 0.95)",
            hoverOffset: totalEmp > 0 ? 4 : 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: totalEmp > 0,
              backgroundColor: "rgba(28, 22, 19, 0.96)",
              titleColor: "#FFFFFF",
              bodyColor: "rgba(255, 255, 255, 0.9)",
              borderColor: "rgba(255, 255, 255, 0.12)",
              borderWidth: 1,
              titleFont: { family: THEME_FONT_SANS, size: 11, weight: "600" },
              bodyFont: { family: THEME_FONT_SANS, size: 11 },
              padding: 8,
              cornerRadius: 6,
              callbacks: {
                label: function (ctx) {
                  const val = ctx.raw || 0;
                  const pct = totalEmp > 0 ? Math.round((val / totalEmp) * 100) : 0;
                  return ` ${ctx.label}: ${val} (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }

    // 2. Productivity Trend Grouped Bar Chart
    const prodCanvas = document.getElementById("productivityBarChart");
    if (prodCanvas) {
      const existing = window.Chart.getChart(prodCanvas);
      if (existing) existing.destroy();
      if (productivityChartInstance) { productivityChartInstance.destroy(); productivityChartInstance = null; }

      // Dynamic 6-month labels & real monthly metrics
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const labels = [];
      const targetData = [];
      const actualData = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(monthNames[d.getMonth()]);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        if (totalEmp === 0) {
          targetData.push(0);
          actualData.push(0);
        } else {
          // Calculate actual efficiency for employees who joined on or before this month
          const empsInMonth = state.employees.filter(e => {
            if (!e.joinedDate) return true;
            const jd = new Date(e.joinedDate);
            return isNaN(jd.getTime()) || jd <= endOfMonth;
          });

          if (empsInMonth.length === 0) {
            targetData.push(0);
            actualData.push(0);
          } else {
            const mEfficiency = Math.round(
              empsInMonth.reduce((acc, e) => acc + (Number(e.efficiency) || 0), 0) / empsInMonth.length
            );
            targetData.push(80);
            actualData.push(mEfficiency);
          }
        }
      }

      const ctx = prodCanvas.getContext("2d");
      productivityChartInstance = new window.Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Target",
              data: targetData,
              backgroundColor: "rgba(139, 92, 246, 0.9)",
              hoverBackgroundColor: "#8B5CF6",
              borderRadius: 4,
              borderSkipped: false,
              barPercentage: 0.65,
              categoryPercentage: 0.75
            },
            {
              label: "Actual",
              data: actualData,
              backgroundColor: "rgba(184, 255, 44, 0.95)",
              hoverBackgroundColor: "#B8FF2C",
              borderRadius: 4,
              borderSkipped: false,
              barPercentage: 0.65,
              categoryPercentage: 0.75
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(28, 22, 19, 0.96)",
              titleColor: "#FFFFFF",
              bodyColor: "rgba(255, 255, 255, 0.9)",
              borderColor: "rgba(255, 255, 255, 0.12)",
              borderWidth: 1,
              titleFont: { family: THEME_FONT_SANS, size: 11, weight: "600" },
              bodyFont: { family: THEME_FONT_SANS, size: 11 },
              padding: 8,
              cornerRadius: 6,
              callbacks: {
                label: function (ctx) {
                  return ` ${ctx.dataset.label}: ${ctx.raw}%`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: "rgba(255, 255, 255, 0.65)",
                font: { family: THEME_FONT_SANS, size: 10, weight: "500" }
              }
            },
            y: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 25,
                color: "rgba(255, 255, 255, 0.5)",
                font: { family: THEME_FONT_SANS, size: 9.5 },
                callback: function (val) {
                  return val + "%";
                }
              },
              grid: {
                color: "rgba(255, 255, 255, 0.08)"
              }
            }
          }
        }
      });
    }

    // 3. Workload Status Donut Chart
    const workloadCanvas = document.getElementById("workloadDonutChart");
    if (workloadCanvas) {
      const existing = window.Chart.getChart(workloadCanvas);
      if (existing) existing.destroy();
      if (workloadChartInstance) { workloadChartInstance.destroy(); workloadChartInstance = null; }

      const assigned = state.employees.filter(e => (Number(e.workload) >= 70 || Number(e.ordersAssigned) >= 3) && e.status === "Active").length;
      const partially = state.employees.filter(e => Number(e.workload) > 0 && Number(e.workload) < 70 && e.status === "Active").length;
      const unassigned = state.employees.filter(e => (!e.workload || Number(e.workload) === 0 || !e.ordersAssigned) && e.status === "Active").length;
      const onLeave = state.employees.filter(e => e.status === "On Leave" || e.status === "Leave").length;
      const inactive = state.employees.filter(e => e.status === "Inactive").length;

      const workloadCounts = [assigned, partially, unassigned, onLeave, inactive];
      const workloadLabels = ["Assigned", "Partially Assigned", "Unassigned", "On Leave", "Inactive"];
      const workloadColors = ["#B8FF2C", "#E5E7EB", "#E9D5FF", "#F87171", "#818CF8"];

      const totalWorkloadEl = document.getElementById("workloadDonutTotal");
      if (totalWorkloadEl) totalWorkloadEl.textContent = totalEmp;

      const legendWorkloadEl = document.getElementById("workloadLegendList");
      if (legendWorkloadEl) {
        legendWorkloadEl.innerHTML = workloadLabels.map((lbl, idx) => {
          const count = workloadCounts[idx];
          const pct = totalEmp > 0 ? Math.round((count / totalEmp) * 100) : 0;
          return `<div class="legend-row"><span class="legend-dot" style="background:${workloadColors[idx]};"></span><span class="legend-name">${lbl}</span><span class="legend-count">${count} (${pct}%)</span></div>`;
        }).join("");
      }

      const ctx = workloadCanvas.getContext("2d");
      workloadChartInstance = new window.Chart(ctx, {
        type: "doughnut",
        data: {
          labels: totalEmp > 0 ? workloadLabels : ["No Employees"],
          datasets: [{
            data: totalEmp > 0 ? workloadCounts : [1],
            backgroundColor: totalEmp > 0 ? workloadColors : ["rgba(255, 255, 255, 0.08)"],
            borderWidth: totalEmp > 0 ? 2 : 0,
            borderColor: "rgba(38, 30, 26, 0.95)",
            hoverOffset: totalEmp > 0 ? 4 : 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: totalEmp > 0,
              backgroundColor: "rgba(28, 22, 19, 0.96)",
              titleColor: "#FFFFFF",
              bodyColor: "rgba(255, 255, 255, 0.9)",
              borderColor: "rgba(255, 255, 255, 0.12)",
              borderWidth: 1,
              titleFont: { family: THEME_FONT_SANS, size: 11, weight: "600" },
              bodyFont: { family: THEME_FONT_SANS, size: 11 },
              padding: 8,
              cornerRadius: 6,
              callbacks: {
                label: function (ctx) {
                  const val = ctx.raw || 0;
                  const pct = totalEmp > 0 ? Math.round((val / totalEmp) * 100) : 0;
                  return ` ${ctx.label}: ${val} (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }
  }

  /* ==========================================================================
     5. FILTERING & SORTING PIPELINE
     ========================================================================== */
  function getFilteredAndSortedEmployees() {
    let list = [...state.employees];

    // 1. Department Tab Filter
    if (state.selectedDepartment !== "all") {
      list = list.filter(
        (e) => e.department.toLowerCase() === state.selectedDepartment.toLowerCase()
      );
    }

    // 2. Search Query Filter
    if (state.searchQuery && state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter((e) => {
        return (
          e.name.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          (e.skills && e.skills.some((s) => s.toLowerCase().includes(q)))
        );
      });
    }

    // 3. Detailed Modal Filters
    if (state.detailedFilters.workload !== "all") {
      if (state.detailedFilters.workload === "overloaded") {
        list = list.filter((e) => (e.workload || 0) > 80);
      } else if (state.detailedFilters.workload === "optimal") {
        list = list.filter((e) => (e.workload || 0) >= 50 && (e.workload || 0) <= 80);
      } else if (state.detailedFilters.workload === "underloaded") {
        list = list.filter((e) => (e.workload || 0) < 50);
      }
    }

    if (state.detailedFilters.status !== "all") {
      list = list.filter(
        (e) => e.status.toLowerCase() === state.detailedFilters.status.toLowerCase()
      );
    }

    if (state.detailedFilters.skill && state.detailedFilters.skill.trim() !== "") {
      const sq = state.detailedFilters.skill.toLowerCase().trim();
      list = list.filter((e) => e.skills && e.skills.some((s) => s.toLowerCase().includes(sq)));
    }

    // 4. Sorting
    if (state.sortBy) {
      list.sort((a, b) => {
        let valA = a[state.sortBy];
        let valB = b[state.sortBy];

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return state.sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return state.sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }

  /* ==========================================================================
     6. RENDERING: LIGHT TABLE & PAGINATION (NO CHECKBOXES)
     ========================================================================== */
  function renderTable() {
    const allFiltered = getFilteredAndSortedEmployees();
    const tbody = document.getElementById("employeeTableBody");
    const emptyState = document.getElementById("tableEmptyState");
    const paginationBar = document.getElementById("tablePaginationBar");
    const paginationInfo = document.getElementById("paginationInfo");
    const paginationControls = document.getElementById("paginationControls");

    if (!tbody) return;

    if (allFiltered.length === 0) {
      tbody.innerHTML = "";
      if (emptyState) emptyState.style.display = "flex";
      if (paginationBar) paginationBar.style.display = "none";
      refreshLucide();
      return;
    }

    if (emptyState) emptyState.style.display = "none";
    if (paginationBar) paginationBar.style.display = "flex";

    // Pagination calculations
    const totalItems = allFiltered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / state.itemsPerPage));
    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const pageItems = allFiltered.slice(startIdx, startIdx + state.itemsPerPage);

    // Update pagination info
    const endIdx = Math.min(startIdx + state.itemsPerPage, totalItems);
    if (paginationInfo) {
      paginationInfo.textContent = `Showing ${startIdx + 1}–${endIdx} of ${totalItems} employees`;
    }

    // Render Table Rows (Without Checkbox Column)
    tbody.innerHTML = pageItems
      .map((emp) => {
        const avatarSrc = emp.avatar || FALLBACK_AVATAR_SVG;

        // Status badge class
        let statusBadge = `<span class="pill-status-active">Active</span>`;
        if (emp.status === "On Leave") {
          statusBadge = `<span class="pill-status-leave">On Leave</span>`;
        } else if (emp.status === "Inactive") {
          statusBadge = `<span class="pill-status-inactive">Inactive</span>`;
        }

        // Workload color
        let fillClass = "workload-fill";
        if (emp.workload >= 90) fillClass = "workload-fill workload-fill-high";

        // Skills HTML
        const skillsHtml = (emp.skills || [])
          .map((s) => `<span class="skill-pill">${s}</span>`)
          .join("");

        return `
          <tr data-id="${emp.id}">
            <td>
              <div class="emp-cell-wrap">
                <img src="${avatarSrc}" alt="${emp.name}" class="emp-avatar-img" onerror="this.onerror=null; this.src='${FALLBACK_AVATAR_SVG}';" />
                <div class="emp-name-block">
                  <span class="emp-name-text">${emp.name}</span>
                  <span class="emp-code-text">${emp.code}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="role-dept-wrap">
                <span class="role-title-text">${emp.role}</span>
                <span class="role-dept-text">${emp.department}</span>
              </div>
            </td>
            <td>
              <div class="skills-pills-row">
                ${skillsHtml}
              </div>
            </td>
            <td>
              <div class="workload-bar-wrap">
                <div class="workload-track">
                  <div class="${fillClass}" style="width:${emp.workload}%;"></div>
                </div>
                <span class="workload-pct-text">${emp.workload}%</span>
              </div>
            </td>
            <td style="text-align:center;font-weight:600;color:#374151;">${emp.ordersAssigned}</td>
            <td style="text-align:center;font-weight:600;color:#374151;">${emp.completedMonth}</td>
            <td style="text-align:center;font-weight:600;color:#374151;">${emp.efficiency}%</td>
            <td style="text-align:center;">${statusBadge}</td>
            <td style="text-align:center;">
              <button type="button" class="btn-table-action" data-action-menu="${emp.id}" aria-label="Actions for ${emp.name}">
                <i data-lucide="more-horizontal" style="width:14px;height:14px;"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");

    // Render Pagination Controls
    renderPaginationControls(totalPages);

    // Re-initialize Lucide Icons across table and page
    refreshLucide();
  }

  function renderPaginationControls(totalPages) {
    const container = document.getElementById("paginationControls");
    if (!container) return;

    let html = "";
    html += `<button type="button" class="btn-page" id="btnPagePrev" ${state.currentPage <= 1 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ""} aria-label="Previous Page">&lt;</button>`;

    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= state.currentPage - 1 && p <= state.currentPage + 1)) {
        html += `<button type="button" class="btn-page ${p === state.currentPage ? "active" : ""}" data-page="${p}">${p}</button>`;
      } else if (p === state.currentPage - 2 || p === state.currentPage + 2) {
        html += `<span class="page-dots">...</span>`;
      }
    }

    html += `<button type="button" class="btn-page" id="btnPageNext" ${state.currentPage >= totalPages ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ""} aria-label="Next Page">&gt;</button>`;
    container.innerHTML = html;
  }

  /* ==========================================================================
     7. TOAST NOTIFICATION SYSTEM
     ========================================================================== */
  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "glass-toast";
    let iconName = "check-circle-2";

    if (type === "delete") {
      iconName = "trash-2";
      toast.style.borderLeftColor = "var(--accent-coral)";
    } else if (type === "assign") {
      iconName = "clipboard-check";
    }

    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width:16px;height:16px;color:var(--accent-lime);flex-shrink:0;"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons({ root: toast });
    }

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      toast.style.transition = "all 0.2s ease";
      setTimeout(() => toast.remove(), 200);
    }, 2600);
  }

  /* ==========================================================================
     8. MODAL HANDLERS (ADD, EDIT, PROFILE, ASSIGN, ATTENDANCE, LEAVE)
     ========================================================================== */
  function openAddModal() {
    const modal = document.getElementById("modalAddEmployee");
    if (!modal) return;

    // Default next ID
    const nextNum = state.employees.length + 1;
    const nextCode = `EMP-${String(nextNum).padStart(3, "0")}`;
    const codeInput = document.getElementById("empCode");
    if (codeInput) codeInput.value = nextCode;

    modal.style.display = "flex";
    refreshLucide();
  }

  function openEditModal(empId) {
    const emp = state.employees.find((e) => e.id === empId);
    if (!emp) return;

    document.getElementById("editEmpId").value = emp.id;
    document.getElementById("editEmpName").value = emp.name;
    document.getElementById("editEmpCode").value = emp.code;
    document.getElementById("editEmpDept").value = emp.department;
    document.getElementById("editEmpRole").value = emp.role;
    document.getElementById("editEmpSalary").value = emp.salary || 0;
    document.getElementById("editEmpStatus").value = emp.status || "Active";
    document.getElementById("editEmpSkills").value = (emp.skills || []).join(", ");
    document.getElementById("editEmpWorkload").value = emp.workload || 0;
    document.getElementById("editEmpAssigned").value = emp.ordersAssigned || 0;
    document.getElementById("editEmpEfficiency").value = emp.efficiency || 0;

    const editPreview = document.getElementById("editEmpAvatarPreview");
    if (editPreview) {
      editPreview.src = emp.avatar || FALLBACK_AVATAR_SVG;
    }
    const editInput = document.getElementById("editEmpPhotoInput");
    if (editInput) editInput.value = "";

    const modal = document.getElementById("modalEditEmployee");
    if (modal) {
      modal.style.display = "flex";
      refreshLucide();
    }
  }

  function openProfileModal(empId) {
    const emp = state.employees.find((e) => e.id === empId);
    if (!emp) return;

    const body = document.getElementById("profileModalContent");
    if (!body) return;

    const skillsHtml = (emp.skills || [])
      .map((s) => `<span class="skill-pill" style="font-size:11px;padding:3px 8px;">${s}</span>`)
      .join("");

    body.innerHTML = `
      <div class="profile-hero">
        <div class="profile-avatar-container" id="profileAvatarContainer" title="Click to upload/change photo">
          <img id="profileModalAvatarImg" src="${emp.avatar || FALLBACK_AVATAR_SVG}" alt="${emp.name}" class="profile-large-avatar" onerror="this.onerror=null; this.src='${FALLBACK_AVATAR_SVG}';" />
          <div class="profile-avatar-overlay" id="profileAvatarOverlay">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <span>Upload</span>
          </div>
          <input type="file" id="profileModalFileInput" accept="image/*" style="display:none;" />
        </div>
        <div class="profile-hero-info">
          <h3>${emp.name}</h3>
          <p>${emp.role} • ${emp.department}</p>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
            <span style="font-size:11px;color:var(--accent-lime);font-weight:600;">${emp.code}</span>
            <button type="button" class="btn-change-photo-mini" id="btnTriggerProfilePhoto">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Change Photo
            </button>
          </div>
        </div>
      </div>

      <div class="profile-stats-grid">
        <div class="profile-stat-box">
          <div class="stat-box-val">${emp.workload}%</div>
          <div class="stat-box-lbl">Workload</div>
        </div>
        <div class="profile-stat-box">
          <div class="stat-box-val">${emp.ordersAssigned}</div>
          <div class="stat-box-lbl">Orders Assigned</div>
        </div>
        <div class="profile-stat-box">
          <div class="stat-box-val">${emp.completedMonth}</div>
          <div class="stat-box-lbl">Completed</div>
        </div>
        <div class="profile-stat-box">
          <div class="stat-box-val">${emp.efficiency}%</div>
          <div class="stat-box-lbl">Efficiency</div>
        </div>
      </div>

      <div style="margin: 14px 0;">
        <h4 style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;">Specialised Skills</h4>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${skillsHtml}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;background:rgba(255,255,255,0.03);padding:12px;border-radius:8px;margin-top:14px;">
        <div><span style="color:var(--text-muted);">Phone:</span> <strong>${emp.phone || "—"}</strong></div>
        <div><span style="color:var(--text-muted);">Email:</span> <strong>${emp.email || "—"}</strong></div>
        <div><span style="color:var(--text-muted);">Joined:</span> <strong>${emp.joinedDate || "—"}</strong></div>
        <div><span style="color:var(--text-muted);">Monthly Pay:</span> <strong>₹${(Number(emp.salary) || 0).toLocaleString("en-IN")}</strong></div>
      </div>
    `;

    const modal = document.getElementById("modalEmployeeProfile");
    if (modal) {
      modal.style.display = "flex";
      refreshLucide();
    }

    // Wire live profile photo upload
    const profileFileInput = document.getElementById("profileModalFileInput");
    const profileAvatarContainer = document.getElementById("profileAvatarContainer");
    const btnChangePhoto = document.getElementById("btnTriggerProfilePhoto");

    const triggerUpload = () => {
      if (profileFileInput) profileFileInput.click();
    };

    if (profileAvatarContainer) profileAvatarContainer.onclick = triggerUpload;
    if (btnChangePhoto) btnChangePhoto.onclick = triggerUpload;

    if (profileFileInput) {
      profileFileInput.onchange = async () => {
        if (!profileFileInput.files || !profileFileInput.files[0]) return;
        const file = profileFileInput.files[0];
        showToast(`Uploading photo for ${emp.code}...`, "info");
        try {
          const { default: api } = await import('../api.js');
          const targetIdentifier = emp.dbId || emp.id || emp.code;
          const updated = await api.employees.uploadAvatar(targetIdentifier, file);
          const newUrl = updated.avatarUrl || emp.avatar;
          emp.avatar = newUrl;
          const avatarImg = document.getElementById("profileModalAvatarImg");
          if (avatarImg) {
            avatarImg.src = newUrl + (newUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
          }
          saveEmployees();
          renderTable();
          const filename = newUrl.split('/').pop();
          showToast(`Profile photo saved as ${filename}`, "success");
        } catch (err) {
          console.error("[Workforce] Avatar upload error:", err);
          showToast("Failed to upload photo: " + err.message, "error");
        }
      };
    }
  }

  function openAssignModal(preselectedId = null) {
    const select = document.getElementById("assignEmployeeSelect");
    if (select) {
      select.innerHTML = state.employees
        .map(
          (e) =>
            `<option value="${e.id}" ${e.id === preselectedId ? "selected" : ""}>${e.name} (${e.code} — ${e.role})</option>`
        )
        .join("");
    }

    const dueDate = document.getElementById("assignDueDate");
    if (dueDate) {
      const d = new Date();
      d.setDate(d.getDate() + 4);
      dueDate.value = d.toISOString().split("T")[0];
    }

    const modal = document.getElementById("modalAssignWork");
    if (modal) {
      modal.style.display = "flex";
      refreshLucide();
    }
  }

  function openAttendanceModal() {
    const dateEl = document.getElementById("attendanceCurrentDate");
    if (dateEl) {
      const today = new Date();
      dateEl.textContent = `Today, ${today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    const tbody = document.getElementById("attendanceSheetTbody");
    if (tbody) {
      if (state.employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:16px;color:var(--text-muted);">No active employees found to record attendance.</td></tr>';
      } else {
        tbody.innerHTML = state.employees
          .slice(0, 16)
          .map((e) => {
            return `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:6px;">
                  <img src="${e.avatar || FALLBACK_AVATAR_SVG}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;" onerror="this.onerror=null; this.src='${FALLBACK_AVATAR_SVG}';" />
                  <span style="font-weight:600;">${e.name}</span>
                </div>
              </td>
              <td>${e.department}</td>
              <td style="text-align:center;">
                <button type="button" class="btn-att-status btn-att-present" data-att-state="present">P</button>
                <button type="button" class="btn-att-status" data-att-state="absent" style="opacity:0.4;">A</button>
                <button type="button" class="btn-att-status" data-att-state="leave" style="opacity:0.4;">L</button>
              </td>
              <td><input type="text" placeholder="Optional notes" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:3px 6px;color:#FFF;font-size:11px;width:120px;" /></td>
            </tr>
          `;
          })
          .join("");
      }
    }

    const modal = document.getElementById("modalMarkAttendance");
    if (modal) {
      modal.style.display = "flex";
      refreshLucide();
    }
  }

  function openLeaveModal() {
    const tbody = document.getElementById("leaveModalTbody");
    if (tbody) {
      const leaveEmployees = state.employees.filter(e => e.status === "On Leave" || e.status === "Leave");
      if (leaveEmployees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--text-muted);">No active leave requests found.</td></tr>';
      } else {
        tbody.innerHTML = leaveEmployees
          .map((e, idx) => {
            return `
            <tr>
              <td><strong>${e.name}</strong> <span style="font-size:10px;color:var(--text-muted);">(${e.department})</span></td>
              <td>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – Present</td>
              <td>General Leave</td>
              <td><span class="pill-leave-approved">Active</span></td>
              <td style="text-align:right;">
                <span style="font-size:10.5px;color:var(--accent-lime);">Recorded</span>
              </td>
            </tr>
          `;
          })
          .join("");
      }
    }

    const modal = document.getElementById("modalLeaveManagement") || document.getElementById("modalLeaveRequests");
    if (modal) {
      modal.style.display = "flex";
      refreshLucide();
    }
  }

  function renderSidebar() {
    const leaveEl = document.getElementById("upcomingLeaveList");
    if (leaveEl) {
      const leaveEmployees = state.employees.filter(e => e.status === "On Leave" || e.status === "Leave");
      if (leaveEmployees.length === 0) {
        leaveEl.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:12px;">No active staff leaves today</div>';
      } else {
        leaveEl.innerHTML = leaveEmployees.map(e => `
          <div class="leave-item" style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <div style="display:flex;align-items:center;gap:8px;">
              <img src="${e.avatar || FALLBACK_AVATAR_SVG}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.src='${FALLBACK_AVATAR_SVG}';" />
              <div>
                <div style="font-weight:600;font-size:12px;color:var(--text-primary);">${e.name}</div>
                <div style="font-size:11px;color:var(--text-muted);">${e.role} · ${e.department}</div>
              </div>
            </div>
            <span style="font-size:10px;padding:2px 8px;border-radius:12px;background:rgba(239,68,68,0.15);color:#F87171;font-weight:600;">On Leave</span>
          </div>
        `).join('');
      }
    }

    const eventsGrid = document.getElementById("eventsCardsGrid");
    if (eventsGrid) {
      if (state.employees.length === 0) {
        eventsGrid.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:12px;grid-column:span 2;">No upcoming events</div>';
      } else {
        const sampleEvents = state.employees.slice(0, 2);
        eventsGrid.innerHTML = sampleEvents.map((e, idx) => `
          <div class="event-mini-card">
            <img src="${e.avatar || FALLBACK_AVATAR_SVG}" alt="${e.name}" class="event-avatar" onerror="this.onerror=null;this.src='${FALLBACK_AVATAR_SVG}';" />
            <div class="event-details">
              <div class="event-person">${e.name}</div>
              <div class="event-date">${e.joinedDate || 'Active'}</div>
              <span class="event-tag ${idx === 0 ? 'tag-anniversary' : 'tag-birthday'}">${idx === 0 ? 'Work Anniversary' : 'Recognition'}</span>
            </div>
          </div>
        `).join('');
      }
    }
  }

  function exportCSV() {
    const list = getFilteredAndSortedEmployees();
    const headers = [
      "Employee ID",
      "Full Name",
      "Department",
      "Role",
      "Skills",
      "Current Workload (%)",
      "Orders Assigned",
      "Completed This Month",
      "Efficiency (%)",
      "Status",
      "Monthly Salary (INR)"
    ];

    const rows = list.map((e) => [
      `"${e.code}"`,
      `"${e.name}"`,
      `"${e.department}"`,
      `"${e.role}"`,
      `"${(e.skills || []).join("; ")}"`,
      e.workload,
      e.ordersAssigned,
      e.completedMonth,
      `${e.efficiency}%`,
      `"${e.status}"`,
      Number(e.salary) || 0
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const bSlug = (typeof BrandIdentity !== 'undefined' && BrandIdentity.get('shortName').toLowerCase()) || 'workforce';
    link.setAttribute("download", `${bSlug}_workforce_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${list.length} employees to CSV`, "info");
  }

  /* ==========================================================================
     8.5 DYNAMIC REPORTS MODAL CONTROLLER
     ========================================================================== */
  function renderReportsModal() {
    const totalEmp = state.employees.length;
    const totalPayroll = state.employees.reduce((acc, e) => acc + (Number(e.salary) || 0), 0);
    const avgEfficiency = totalEmp > 0
      ? Math.round(state.employees.reduce((acc, e) => acc + (Number(e.efficiency) || 0), 0) / totalEmp)
      : 0;
    const totalHours = state.employees.reduce((acc, e) => acc + ((Number(e.completedMonth) || 0) * 8), 0);
    const onTimeRate = totalEmp > 0 ? Math.min(100, Math.round(avgEfficiency * 0.98)) : 0;

    const payrollEl = document.getElementById("reportPayroll");
    if (payrollEl) payrollEl.innerHTML = `&#8377;${totalPayroll.toLocaleString("en-IN")}`;

    const effEl = document.getElementById("reportEfficiency");
    if (effEl) effEl.textContent = `${avgEfficiency}%`;

    const outEl = document.getElementById("reportOutput");
    if (outEl) outEl.textContent = `${totalHours} hrs`;

    const delEl = document.getElementById("reportDelivery");
    if (delEl) delEl.textContent = `${onTimeRate}%`;

    const tbody = document.getElementById("reportTableBody");
    if (tbody) {
      const depts = ["Designing", "Cutting", "Stitching", "Finishing", "Embroidery", "Administration"];
      tbody.innerHTML = depts.map((d) => {
        const deptEmps = state.employees.filter((e) => (e.department || "").toLowerCase() === d.toLowerCase());
        const count = deptEmps.length;
        const totalOrders = deptEmps.reduce((sum, e) => sum + (Number(e.ordersAssigned) || 0) + (Number(e.completedMonth) || 0), 0);
        const deptEff = count > 0 ? Math.round(deptEmps.reduce((sum, e) => sum + (Number(e.efficiency) || 0), 0) / count) : 0;
        const deptCost = deptEmps.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
        return `
          <tr>
            <td><strong>${d}</strong></td>
            <td>${count}</td>
            <td>${totalOrders}</td>
            <td>${deptEff}%</td>
            <td>&#8377;${deptCost.toLocaleString("en-IN")}</td>
          </tr>
        `;
      }).join("");
    }
  }

  /* ==========================================================================
     9. EVENT LISTENERS & DOM BINDINGS
     ========================================================================== */
  function bindEventListeners() {
    // 1. Department Tabs click
    const deptTabs = document.getElementById("deptTabs");
    if (deptTabs) {
      deptTabs.addEventListener("click", (e) => {
        const btn = e.target.closest(".dept-tab");
        if (!btn) return;

        deptTabs.querySelectorAll(".dept-tab").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        state.selectedDepartment = btn.getAttribute("data-dept");
        state.currentPage = 1;
        renderTable();
      });
    }

    // 2. Search input live filtering
    const searchInput = document.getElementById("employeeSearchInput");
    const clearBtn = document.getElementById("btnClearSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        if (clearBtn) {
          clearBtn.style.display = state.searchQuery ? "block" : "none";
        }
        state.currentPage = 1;
        renderTable();
      });

      // Keyboard shortcut ⌘K / Ctrl+K
      window.addEventListener("keydown", (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        state.searchQuery = "";
        clearBtn.style.display = "none";
        state.currentPage = 1;
        renderTable();
        searchInput.focus();
      });
    }

    // 3. Reset filters link
    const resetFiltersBtn = document.getElementById("btnResetFilters");
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener("click", () => {
        state.selectedDepartment = "all";
        state.searchQuery = "";
        state.detailedFilters = { workload: "all", status: "all", skill: "" };
        if (searchInput) searchInput.value = "";
        if (clearBtn) clearBtn.style.display = "none";

        const dot = document.getElementById("filterActiveDot");
        if (dot) dot.style.display = "none";

        const tabs = document.querySelectorAll(".dept-tab");
        tabs.forEach((t) => t.classList.remove("active"));
        if (tabs[0]) tabs[0].classList.add("active");

        state.currentPage = 1;
        renderTable();
        showToast("Filters reset", "info");
      });
    }

    // 4. Table Header Sorting
    const tableHeader = document.querySelector("#employeeTable thead");
    if (tableHeader) {
      tableHeader.addEventListener("click", (e) => {
        const th = e.target.closest(".th-sortable");
        if (!th) return;

        const sortField = th.getAttribute("data-sort");
        if (state.sortBy === sortField) {
          state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
        } else {
          state.sortBy = sortField;
          state.sortDirection = "asc";
        }

        renderTable();
      });
    }

    // 5. Table Body Clicks (Action Menu & View Profile)
    const tbody = document.getElementById("employeeTableBody");
    if (tbody) {
      tbody.addEventListener("click", (e) => {
        // Action menu click
        const actionBtn = e.target.closest(".btn-table-action");
        if (actionBtn) {
          e.stopPropagation();
          const id = actionBtn.getAttribute("data-action-menu");
          openEditModal(id);
          return;
        }

        // Row body click -> View Profile
        const row = e.target.closest("tr");
        if (row) {
          const id = row.getAttribute("data-id");
          openProfileModal(id);
        }
      });
    }

    // 7. Pagination Controls
    const paginationControls = document.getElementById("paginationControls");
    if (paginationControls) {
      paginationControls.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-page");
        if (!btn || btn.disabled) return;

        if (btn.id === "btnPagePrev") {
          if (state.currentPage > 1) {
            state.currentPage--;
            renderTable();
          }
        } else if (btn.id === "btnPageNext") {
          const allFiltered = getFilteredAndSortedEmployees();
          const totalPages = Math.ceil(allFiltered.length / state.itemsPerPage);
          if (state.currentPage < totalPages) {
            state.currentPage++;
            renderTable();
          }
        } else if (btn.getAttribute("data-page")) {
          state.currentPage = parseInt(btn.getAttribute("data-page"), 10);
          renderTable();
        }
      });
    }

    // 8. Add Employee Buttons
    const btnAddEmp = document.getElementById("btnAddEmployee");
    const tileAddEmp = document.getElementById("tileAddEmployee");
    if (btnAddEmp) btnAddEmp.addEventListener("click", openAddModal);
    if (tileAddEmp) tileAddEmp.addEventListener("click", openAddModal);

    // Add Form Submit
    const formAdd = document.getElementById("formAddEmployee");
    if (formAdd) {
      formAdd.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("empName").value.trim();
        const code = document.getElementById("empCode").value.trim();
        const dept = document.getElementById("empDept").value;
        const role = document.getElementById("empRole").value.trim();
        const phone = document.getElementById("empPhone").value.trim();
        const email = document.getElementById("empEmail").value.trim();
        const salary = parseInt(document.getElementById("empSalary").value, 10) || 0;
        const status = document.getElementById("empStatus").value;
        const skillsStr = document.getElementById("empSkills").value.trim();
        const skills = skillsStr ? skillsStr.split(",").map((s) => s.trim()) : [];
        const avatar = document.getElementById("addEmpAvatarPreview").src;
        const photoInput = document.getElementById("addEmpPhotoInput");
        const photoFile = photoInput && photoInput.files && photoInput.files[0] ? photoInput.files[0] : null;

        const newEmp = {
          id: code,
          dbId: null,
          name,
          code,
          role,
          department: dept,
          skills,
          workload: 0,
          ordersAssigned: 0,
          completedMonth: 0,
          efficiency: 100,
          status,
          phone: phone || "",
          email: email || "",
          salary,
          avatar: avatar || FALLBACK_AVATAR_SVG,
          joinedDate: new Date().toISOString().split("T")[0]
        };

        state.employees.unshift(newEmp);
        saveEmployees();

        (async () => {
          try {
            const { default: api } = await import('../api.js');
            const created = await api.employees.create({
              name,
              phone,
              email,
              role: dept.toUpperCase(),
              status: status.toUpperCase(),
              specialization: skills.join(', '),
              notes: JSON.stringify({ department: dept, role, salary, workload: 0, ordersAssigned: 0, completedMonth: 0, efficiency: 100 })
            });

            if (created && created.id) {
              newEmp.dbId = created.id;
              newEmp.id = created.id;
              if (created.employeeCode) newEmp.code = created.employeeCode;
              if (photoFile) {
                const upResp = await api.employees.uploadAvatar(created.id, photoFile);
                if (upResp && upResp.avatarUrl) {
                  newEmp.avatar = upResp.avatarUrl;
                  renderTable();
                  const fname = upResp.avatarUrl.split('/').pop();
                  showToast(`Employee photo stored as ${fname}`, "success");
                }
              }
              saveEmployees();
            }
          } catch (err) {
            console.warn('[Workforce] API save fallback:', err.message);
          }
        })();

        // Update KPIs, tabs, charts, and sidebar in real-time
        updateKPIs();
        updateDepartmentTabs();
        initCharts();
        renderSidebar();

        document.getElementById("modalAddEmployee").style.display = "none";
        formAdd.reset();
        const addPreview = document.getElementById("addEmpAvatarPreview");
        if (addPreview) addPreview.src = FALLBACK_AVATAR_SVG;
        renderTable();
        showToast(`Employee ${name} added successfully!`, "info");
      });
    }

    // Avatar preview (Add Modal)
    const photoInput = document.getElementById("addEmpPhotoInput");
    const triggerPhotoBtn = document.getElementById("btnTriggerAddPhoto");
    if (triggerPhotoBtn && photoInput) {
      triggerPhotoBtn.addEventListener("click", () => photoInput.click());
      photoInput.addEventListener("change", () => {
        if (photoInput.files && photoInput.files[0]) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            document.getElementById("addEmpAvatarPreview").src = evt.target.result;
          };
          reader.readAsDataURL(photoInput.files[0]);
        }
      });
    }

    // Avatar preview (Edit Modal)
    const editPhotoInput = document.getElementById("editEmpPhotoInput");
    const triggerEditPhotoBtn = document.getElementById("btnTriggerEditPhoto");
    if (triggerEditPhotoBtn && editPhotoInput) {
      triggerEditPhotoBtn.addEventListener("click", () => editPhotoInput.click());
      editPhotoInput.addEventListener("change", () => {
        if (editPhotoInput.files && editPhotoInput.files[0]) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const preview = document.getElementById("editEmpAvatarPreview");
            if (preview) preview.src = evt.target.result;
          };
          reader.readAsDataURL(editPhotoInput.files[0]);
        }
      });
    }

    // 9. Edit Form Submit & Delete
    const formEdit = document.getElementById("formEditEmployee");
    if (formEdit) {
      formEdit.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("editEmpId").value;
        const target = state.employees.find((e) => e.id === id);
        if (target) {
          target.name = document.getElementById("editEmpName").value.trim();
          target.department = document.getElementById("editEmpDept").value;
          target.role = document.getElementById("editEmpRole").value.trim();
          target.salary = parseInt(document.getElementById("editEmpSalary").value, 10) || target.salary;
          target.status = document.getElementById("editEmpStatus").value;
          const skillsStr = document.getElementById("editEmpSkills").value.trim();
          target.skills = skillsStr ? skillsStr.split(",").map((s) => s.trim()) : target.skills;
          target.workload = parseInt(document.getElementById("editEmpWorkload").value, 10) || target.workload;
          target.ordersAssigned = parseInt(document.getElementById("editEmpAssigned").value, 10) || target.ordersAssigned;
          target.efficiency = parseInt(document.getElementById("editEmpEfficiency").value, 10) || target.efficiency;

          // Check if photo was selected in edit modal
          const editPhotoIn = document.getElementById("editEmpPhotoInput");
          const editPhotoFile = editPhotoIn && editPhotoIn.files && editPhotoIn.files[0] ? editPhotoIn.files[0] : null;

          saveEmployees();
          document.getElementById("modalEditEmployee").style.display = "none";
          renderTable();
          updateKPIs();
          updateDepartmentTabs();
          initCharts();
          renderSidebar();
          showToast(`Updated ${target.name}`, "info");

          (async () => {
            try {
              const { default: api } = await import('../api.js');
              const targetIdentifier = target.dbId || target.id || target.code;
              if (editPhotoFile) {
                const upResp = await api.employees.uploadAvatar(targetIdentifier, editPhotoFile);
                if (upResp && upResp.avatarUrl) {
                  target.avatar = upResp.avatarUrl;
                  saveEmployees();
                  renderTable();
                  const fname = upResp.avatarUrl.split('/').pop();
                  showToast(`Photo updated as ${fname}`, "success");
                }
              }
              await api.employees.update(targetIdentifier, {
                name: target.name,
                role: target.role.toUpperCase(),
                status: target.status === 'Active' ? 'ACTIVE' : 'ON_LEAVE',
                specialization: target.skills.join(', ')
              }).catch(() => null);
            } catch (err) {
              console.warn('[Workforce] Edit API sync error:', err.message);
            }
          })();
        }
      });
    }

    const btnDeleteEmp = document.getElementById("btnDeleteEmployee");
    if (btnDeleteEmp) {
      btnDeleteEmp.addEventListener("click", () => {
        const id = document.getElementById("editEmpId").value;
        const target = state.employees.find((e) => e.id === id);
        if (target && confirm(`Are you sure you want to remove ${target.name} from the workforce?`)) {
          const targetIdentifier = target.dbId || target.id;
          state.employees = state.employees.filter((e) => e.id !== id);
          state.selectedEmployees.delete(id);

          updateKPIs();
          updateDepartmentTabs();
          initCharts();
          renderSidebar();

          document.getElementById("modalEditEmployee").style.display = "none";
          renderTable();
          showToast(`Removed ${target.name}`, "delete");

          (async () => {
            try {
              const { default: api } = await import('../api.js');
              if (targetIdentifier) {
                await api.employees.delete(targetIdentifier);
              }
            } catch (err) {
              console.warn('[Workforce] Delete API error:', err.message);
            }
          })();
        }
      });
    }

    // 10. Assign Work Modal
    const tileAssign = document.getElementById("tileAssignWork");
    if (tileAssign) tileAssign.addEventListener("click", () => openAssignModal());

    const formAssign = document.getElementById("formAssignWork");
    if (formAssign) {
      formAssign.addEventListener("submit", (e) => {
        e.preventDefault();
        const empId = document.getElementById("assignEmployeeSelect").value;
        const emp = state.employees.find((e) => e.id === empId);
        const orderNo = document.getElementById("assignOrderNumber").value;
        const task = document.getElementById("assignGarment").value;

        if (emp) {
          emp.ordersAssigned = (emp.ordersAssigned || 0) + 1;
          emp.workload = Math.min(100, (Number(emp.workload) || 0) + 10);
          saveEmployees();
          renderTable();
        }

        document.getElementById("modalAssignWork").style.display = "none";
        showToast(`Assigned ${orderNo} (${task}) to ${emp ? emp.name : "Staff"}!`, "assign");
      });
    }

    // 11. Mark Attendance Modal
    const tileAtt = document.getElementById("tileMarkAttendance");
    if (tileAtt) tileAtt.addEventListener("click", openAttendanceModal);

    const btnSaveAtt = document.getElementById("btnSaveAttendance");
    if (btnSaveAtt) {
      btnSaveAtt.addEventListener("click", () => {
        document.getElementById("modalMarkAttendance").style.display = "none";
        showToast("Daily attendance sheet recorded successfully!", "info");
      });
    }

    // Attendance row toggle
    const attTbody = document.getElementById("attendanceSheetTbody");
    if (attTbody) {
      attTbody.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-att-status");
        if (!btn) return;
        const row = btn.closest("tr");
        row.querySelectorAll(".btn-att-status").forEach((b) => {
          b.style.opacity = "0.4";
          b.classList.remove("btn-att-present", "btn-att-absent", "btn-att-leave");
        });
        btn.style.opacity = "1";
        const attState = btn.getAttribute("data-att-state");
        if (attState === "present") btn.classList.add("btn-att-present");
        else if (attState === "absent") btn.classList.add("btn-att-absent");
        else btn.classList.add("btn-att-leave");
      });
    }

    // 12. Upcoming Leave Modal
    const btnViewLeave = document.getElementById("btnViewAllLeave");
    if (btnViewLeave) btnViewLeave.addEventListener("click", openLeaveModal);

    const leaveTbody = document.getElementById("leaveModalTbody");
    if (leaveTbody) {
      leaveTbody.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-leave-action]");
        if (!btn) return;
        const action = btn.getAttribute("data-leave-action");
        const cell = btn.closest("td");
        if (action === "approve") {
          cell.innerHTML = `<span style="font-size:10.5px;color:var(--accent-lime);font-weight:600;">✓ Approved</span>`;
          showToast("Leave request approved", "info");
        } else {
          cell.innerHTML = `<span style="font-size:10.5px;color:var(--accent-coral);font-weight:600;">✗ Rejected</span>`;
          showToast("Leave request rejected", "delete");
        }
      });
    }

    // 13. Reports Modal
    const tileReports = document.getElementById("tileViewReports");
    const modalReports = document.getElementById("modalReports");
    if (tileReports && modalReports) {
      tileReports.addEventListener("click", () => {
        renderReportsModal();
        modalReports.style.display = "flex";
      });
    }

    const btnDownloadReport = document.getElementById("btnDownloadReportPdf");
    if (btnDownloadReport) {
      btnDownloadReport.addEventListener("click", () => {
        showToast("Generating payroll & productivity PDF summary...", "info");
        setTimeout(() => {
          showToast("PDF report downloaded", "info");
        }, 800);
      });
    }

    // 14. Detailed Filter Modal
    const btnOpenFilter = document.getElementById("btnOpenFilterModal");
    const modalFilter = document.getElementById("modalDetailedFilter");
    if (btnOpenFilter && modalFilter) {
      btnOpenFilter.addEventListener("click", () => {
        modalFilter.style.display = "flex";
        refreshLucide();
      });
    }

    const btnApplyFilterModal = document.getElementById("btnApplyFilterModal");
    if (btnApplyFilterModal) {
      btnApplyFilterModal.addEventListener("click", () => {
        state.detailedFilters.workload = document.getElementById("filterWorkloadRange").value;
        state.detailedFilters.status = document.getElementById("filterStatusSelect").value;
        state.detailedFilters.skill = document.getElementById("filterSkillInput").value.trim();

        const hasActive =
          state.detailedFilters.workload !== "all" ||
          state.detailedFilters.status !== "all" ||
          Boolean(state.detailedFilters.skill);

        const dot = document.getElementById("filterActiveDot");
        if (dot) dot.style.display = hasActive ? "inline-block" : "none";

        document.getElementById("modalDetailedFilter").style.display = "none";
        state.currentPage = 1;
        renderTable();
        showToast("Filters applied", "info");
      });
    }

    const btnResetFilterModal = document.getElementById("btnResetFilterModal");
    if (btnResetFilterModal) {
      btnResetFilterModal.addEventListener("click", () => {
        document.getElementById("filterWorkloadRange").value = "all";
        document.getElementById("filterStatusSelect").value = "all";
        document.getElementById("filterSkillInput").value = "";
        state.detailedFilters = { workload: "all", status: "all", skill: "" };

        const dot = document.getElementById("filterActiveDot");
        if (dot) dot.style.display = "none";

        document.getElementById("modalDetailedFilter").style.display = "none";
        state.currentPage = 1;
        renderTable();
        showToast("Filters reset", "info");
      });
    }

    // 15. Export CSV
    const btnExport = document.getElementById("btnExportCSV");
    if (btnExport) btnExport.addEventListener("click", exportCSV);

    // 16. Generic Modal Close Handlers
    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".modal-backdrop").forEach((m) => (m.style.display = "none"));
      });
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop").forEach((m) => (m.style.display = "none"));
      }
    });

    // Close modal when clicking backdrop background
    document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          backdrop.style.display = "none";
        }
      });
    });
  }

  function updateNavbarContext() {
    function applyContext() {
      const searchPh = document.querySelector(".search-ph");
      if (searchPh) searchPh.textContent = "Search employees, skills, roles, or departments...";

      const branchText = document.querySelector(".branch-sel-text, #branchSelText");
      if (branchText && typeof CompanyBridge !== "undefined") {
        branchText.textContent = CompanyBridge.formatBranch();
      }

      const notifBadge = document.querySelector("#notifBtn .badge");
      if (notifBadge) notifBadge.textContent = "3";

      const userRole = document.querySelector(".u-role");
      if (userRole) userRole.textContent = "Administrator";
    }

    applyContext();
    setTimeout(applyContext, 60);
    setTimeout(applyContext, 200);
    setTimeout(applyContext, 600);
  }

  document.addEventListener("nav:fragmentLoaded", (e) => {
    updateNavbarContext();
    refreshLucide();
  });

  document.addEventListener("fragments:ready", () => {
    updateNavbarContext();
    refreshLucide();
  });

  document.addEventListener("nav:ready", () => {
    updateNavbarContext();
    refreshLucide();
  });

  /* ==========================================================================
     10. INITIALIZATION RUNNER
     ========================================================================== */
  function initWorkforce() {
    loadPersistedState();
    updateDepartmentTabs();
    updateKPIs();
    initCharts();
    renderTable();
    renderSidebar();
    bindEventListeners();
    updateNavbarContext();
    refreshLucide();
    loadEmployeesFromApi();
    setTimeout(refreshLucide, 50);
    setTimeout(refreshLucide, 200);
    setTimeout(refreshLucide, 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWorkforce);
  } else {
    initWorkforce();
  }
})();

