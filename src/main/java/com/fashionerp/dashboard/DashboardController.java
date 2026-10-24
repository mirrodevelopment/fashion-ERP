package com.fashionerp.dashboard;

import com.fashionerp.common.TenantContext;
import com.fashionerp.customer.CustomerRepository;
import com.fashionerp.inventory.InventoryRepository;
import com.fashionerp.inventory.InventoryStatus;
import com.fashionerp.order.OrderRepository;
import com.fashionerp.order.OrderStatus;
import com.fashionerp.payment.PaymentRepository;
import com.fashionerp.payment.PaymentStatus;
import com.fashionerp.workforce.EmployeeRepository;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.time.DayOfWeek;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final PaymentRepository paymentRepository;
    private final EmployeeRepository employeeRepository;
    private final com.fashionerp.branch.BranchRepository branchRepository;

    @PersistenceContext
    private EntityManager em;

    @GetMapping("/kpis")
    @SuppressWarnings("unchecked")
    public Map<String, Object> kpis(@RequestParam(required = false) String branch,
            @RequestParam(required = false) String revenuePeriod,
            @RequestParam(required = false) String orderPeriod) {
        UUID companyId = TenantContext.requireCompanyId();
        String branchFilter = (branch != null && !branch.isBlank() && !"ALL".equalsIgnoreCase(branch.trim()))
                ? branch.trim()
                : TenantContext.getActiveBranchFilter();

        // ── Identify Main Branch / Headquarters ──────────────────
        List<com.fashionerp.branch.Branch> companyBranches = branchRepository.findByCompanyId(companyId);
        com.fashionerp.branch.Branch mainBranch = companyBranches.stream()
                .filter(b -> b != null && b.isHeadquarters())
                .findFirst()
                .or(() -> companyBranches.stream()
                        .filter(b -> b.getName() != null && (b.getName().toLowerCase().contains("main")
                                || b.getName().toLowerCase().contains("flagship")))
                        .findFirst())
                .orElse(null);

        String mainBranchName = mainBranch != null ? mainBranch.getName() : "Main Branch";
        String mainBranchCode = mainBranch != null ? mainBranch.getBranchCode() : null;

        // ── Basic counts (branch-scoped if selected, otherwise all company data) ──
        long totalCustomers = customerRepository.countByCompanyId(companyId);
        long totalOrders;
        long pendingOrders;
        long inProgressOrders;
        long readyOrders;
        long deliveredOrders;
        long cancelledOrders;

        if (branchFilter != null && !branchFilter.isBlank()) {
            var probe = org.springframework.data.domain.PageRequest.of(0, 1);
            totalOrders = orderRepository.search(companyId, branchFilter, null, null, probe).getTotalElements();
            pendingOrders = orderRepository.search(companyId, branchFilter, null, OrderStatus.PENDING, probe)
                    .getTotalElements();
            inProgressOrders = orderRepository.search(companyId, branchFilter, null, OrderStatus.IN_PROGRESS, probe)
                    .getTotalElements()
                    + orderRepository.search(companyId, branchFilter, null, OrderStatus.IN_PRODUCTION, probe)
                            .getTotalElements();
            readyOrders = orderRepository.search(companyId, branchFilter, null, OrderStatus.READY, probe)
                    .getTotalElements()
                    + orderRepository.search(companyId, branchFilter, null, OrderStatus.COMPLETED, probe)
                            .getTotalElements();
            deliveredOrders = orderRepository.search(companyId, branchFilter, null, OrderStatus.DELIVERED, probe)
                    .getTotalElements();
            cancelledOrders = orderRepository.search(companyId, branchFilter, null, OrderStatus.CANCELLED, probe)
                    .getTotalElements();
        } else {
            totalOrders = orderRepository.countByCompanyId(companyId);
            pendingOrders = orderRepository.countByCompanyIdAndStatus(companyId, OrderStatus.PENDING);
            inProgressOrders = orderRepository.countByCompanyIdAndStatus(companyId, OrderStatus.IN_PROGRESS)
                    + orderRepository.countByCompanyIdAndStatus(companyId, OrderStatus.IN_PRODUCTION);
            readyOrders = orderRepository.countByCompanyIdAndStatus(companyId, OrderStatus.READY)
                    + orderRepository.countByCompanyIdAndStatus(companyId, OrderStatus.COMPLETED);
            deliveredOrders = orderRepository.countByCompanyIdAndStatus(companyId, OrderStatus.DELIVERED);
            cancelledOrders = orderRepository.countByCompanyIdAndStatus(companyId, OrderStatus.CANCELLED);
        }

        long lowStockItems = branchFilter != null
                ? inventoryRepository.countByCompanyIdAndStatusAndBranch(companyId, InventoryStatus.LOW_STOCK,
                        branchFilter)
                : inventoryRepository.countByCompanyIdAndStatus(companyId, InventoryStatus.LOW_STOCK);
        long outOfStockItems = branchFilter != null
                ? inventoryRepository.countByCompanyIdAndStatusAndBranch(companyId, InventoryStatus.OUT_OF_STOCK,
                        branchFilter)
                : inventoryRepository.countByCompanyIdAndStatus(companyId, InventoryStatus.OUT_OF_STOCK);

        // ── Revenue Calculations (All Branches vs Main Branch vs Selected Branch) ──
        BigDecimal rawAllRevenue = paymentRepository.sumPaidAmount(companyId);
        BigDecimal allBranchesRevenue = rawAllRevenue != null ? rawAllRevenue : BigDecimal.ZERO;

        BigDecimal rawMainRevenue = paymentRepository.sumPaidAmountByBranch(companyId, mainBranchName);
        if ((rawMainRevenue == null || rawMainRevenue.compareTo(BigDecimal.ZERO) == 0) && mainBranchCode != null) {
            BigDecimal codeRev = paymentRepository.sumPaidAmountByBranch(companyId, mainBranchCode);
            if (codeRev != null && codeRev.compareTo(BigDecimal.ZERO) > 0) {
                rawMainRevenue = codeRev;
            }
        }
        if ((rawMainRevenue == null || rawMainRevenue.compareTo(BigDecimal.ZERO) == 0)
                && !"Main Branch".equalsIgnoreCase(mainBranchName)) {
            BigDecimal defRev = paymentRepository.sumPaidAmountByBranch(companyId, "Main Branch");
            if (defRev != null && defRev.compareTo(BigDecimal.ZERO) > 0) {
                rawMainRevenue = defRev;
            }
        }
        // If still 0 or empty, all company revenue belongs to headquarters/main branch
        if ((rawMainRevenue == null || rawMainRevenue.compareTo(BigDecimal.ZERO) == 0)) {
            rawMainRevenue = allBranchesRevenue;
        }
        BigDecimal mainBranchRevenue = rawMainRevenue != null ? rawMainRevenue : BigDecimal.ZERO;

        BigDecimal branchRevenue;
        BigDecimal pendingPayments;
        long pendingPaymentsCount;

        if (branchFilter != null && !branchFilter.isBlank()) {
            boolean isFilterForMainBranch = branchFilter.equalsIgnoreCase(mainBranchName)
                    || (mainBranchCode != null && branchFilter.equalsIgnoreCase(mainBranchCode))
                    || branchFilter.equalsIgnoreCase("Main Branch")
                    || branchFilter.toLowerCase().contains("main")
                    || branchFilter.toLowerCase().contains("flagship");

            if (isFilterForMainBranch) {
                branchRevenue = mainBranchRevenue;
            } else {
                BigDecimal rawBranchRevenue = paymentRepository.sumPaidAmountByBranch(companyId, branchFilter);
                branchRevenue = rawBranchRevenue != null ? rawBranchRevenue : BigDecimal.ZERO;
            }

            BigDecimal rawBranchPending = paymentRepository.sumPendingAmountByBranch(companyId, branchFilter);
            pendingPayments = rawBranchPending != null ? rawBranchPending : BigDecimal.ZERO;
            pendingPaymentsCount = paymentRepository.countPendingPaymentsByBranch(companyId, branchFilter);
        } else {
            branchRevenue = allBranchesRevenue;
            BigDecimal rawPending = paymentRepository.sumPendingAmount(companyId);
            pendingPayments = rawPending != null ? rawPending : BigDecimal.ZERO;
            pendingPaymentsCount = paymentRepository.countByCompanyIdAndStatus(companyId, PaymentStatus.PARTIAL)
                    + paymentRepository.countByCompanyIdAndStatus(companyId, PaymentStatus.PENDING);
        }

        BigDecimal totalRevenue = branchRevenue;

        // ── Order status breakdown for donut chart (respecting orderPeriod)
        // ────────────────
        long donutTotal = totalOrders;
        long donutPending = pendingOrders;
        long donutInProgress = inProgressOrders;
        long donutReady = readyOrders;
        long donutDelivered = deliveredOrders;
        long donutCancelled = cancelledOrders;

        if (orderPeriod != null && !orderPeriod.isBlank() && !"all".equalsIgnoreCase(orderPeriod.trim())) {
            String op = orderPeriod.trim().toLowerCase();
            LocalDateTime sinceDate = null;
            LocalDateTime now = LocalDateTime.now();
            if ("today".equals(op)) {
                sinceDate = now.toLocalDate().atStartOfDay();
            } else if ("week".equals(op)) {
                sinceDate = now.toLocalDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
            } else if ("month".equals(op)) {
                sinceDate = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
            } else if ("quarter".equals(op)) {
                int startMonth = (((now.getMonthValue() - 1) / 3) * 3) + 1;
                sinceDate = now.toLocalDate().withMonth(startMonth).withDayOfMonth(1).atStartOfDay();
            } else if ("year".equals(op)) {
                sinceDate = now.toLocalDate().withDayOfYear(1).atStartOfDay();
            }

            if (sinceDate != null) {
                try {
                    var breakdownQ = em.createNativeQuery(
                            "SELECT o.status, COUNT(*) FROM orders o " +
                                    "WHERE (:companyId IS NULL OR o.company_id = :companyId) " +
                                    "  AND (CAST(:branchFilter AS text) IS NULL " +
                                    "       OR o.branch = CAST(:branchFilter AS text) " +
                                    "       OR o.branch IN (SELECT b.branch_code FROM branches b WHERE b.name = CAST(:branchFilter AS text)) "
                                    +
                                    "       OR o.branch IN (SELECT b.name FROM branches b WHERE b.branch_code = CAST(:branchFilter AS text))) "
                                    +
                                    "  AND o.created_at >= :sinceDate " +
                                    "GROUP BY o.status");
                    breakdownQ.setParameter("companyId", companyId);
                    breakdownQ.setParameter("branchFilter", branchFilter);
                    breakdownQ.setParameter("sinceDate", sinceDate);
                    List<Object[]> rows = breakdownQ.getResultList();

                    donutPending = 0;
                    donutInProgress = 0;
                    donutReady = 0;
                    donutDelivered = 0;
                    donutCancelled = 0;
                    for (Object[] r : rows) {
                        String st = (String) r[0];
                        long cnt = ((Number) r[1]).longValue();
                        if ("PENDING".equalsIgnoreCase(st))
                            donutPending += cnt;
                        else if ("IN_PROGRESS".equalsIgnoreCase(st) || "IN_PRODUCTION".equalsIgnoreCase(st))
                            donutInProgress += cnt;
                        else if ("READY".equalsIgnoreCase(st) || "COMPLETED".equalsIgnoreCase(st))
                            donutReady += cnt;
                        else if ("DELIVERED".equalsIgnoreCase(st))
                            donutDelivered += cnt;
                        else if ("CANCELLED".equalsIgnoreCase(st))
                            donutCancelled += cnt;
                    }
                    donutTotal = donutPending + donutInProgress + donutReady + donutDelivered + donutCancelled;
                } catch (Exception ex) {
                    log.warn("Could not calculate order status breakdown for period {}: {}", op, ex.getMessage());
                }
            }
        }

        List<Map<String, Object>> orderStatusBreakdown = new ArrayList<>();
        long[] statusCounts = { donutPending, donutInProgress, donutReady, donutDelivered, donutCancelled };
        String[] statusNames = { "PENDING", "IN_PROGRESS", "READY", "DELIVERED", "CANCELLED" };
        for (int i = 0; i < statusNames.length; i++) {
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("status", statusNames[i]);
            s.put("count", statusCounts[i]);
            s.put("pct", donutTotal > 0
                    ? BigDecimal.valueOf(statusCounts[i] * 100.0 / donutTotal).setScale(1, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO);
            orderStatusBreakdown.add(s);
        }

        // ── Revenue trend (monthly, weekly, quarterly, yearly) ───────────────────────
        List<Map<String, Object>> monthlyRevenue = buildRevenueTrend(companyId, branchFilter, revenuePeriod);

        // ── Production pulse (stage counts) ──────────────────────
        List<Map<String, Object>> productionPulse = buildProductionPulse(companyId, branchFilter);

        // ── Business Health metrics ───────────────────────────────
        Map<String, Object> businessHealth = buildBusinessHealth(companyId,
                totalRevenue, totalOrders, deliveredOrders, totalCustomers);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRevenue", totalRevenue);
        result.put("totalOrders", totalOrders);
        result.put("orderCompletionTotal", donutTotal);
        result.put("orderPeriod", orderPeriod != null ? orderPeriod.trim().toLowerCase() : "month");
        result.put("revenuePeriod", revenuePeriod != null ? revenuePeriod.trim().toLowerCase() : "monthly");
        result.put("totalCustomers", totalCustomers);
        result.put("pendingOrders", pendingOrders);
        result.put("inProgressOrders", inProgressOrders);
        result.put("readyOrders", readyOrders);
        result.put("deliveredOrders", deliveredOrders);
        result.put("cancelledOrders", cancelledOrders);
        result.put("ordersInProduction", inProgressOrders);
        result.put("lowStockItems", lowStockItems);
        result.put("outOfStockItems", outOfStockItems);
        result.put("pendingPayments", pendingPayments);
        result.put("pendingPaymentsCount", pendingPaymentsCount);
        result.put("allBranchesRevenue", allBranchesRevenue);
        result.put("mainBranchRevenue", mainBranchRevenue);
        result.put("mainBranchName", mainBranchName);
        result.put("branchRevenue", branchRevenue);
        result.put("branchFilter", branchFilter);
        result.put("isBranchScoped", branchFilter != null && !branchFilter.isBlank());
        result.put("orderStatusBreakdown", orderStatusBreakdown);
        result.put("monthlyRevenue", monthlyRevenue);
        result.put("productionPulse", productionPulse);
        result.put("businessHealth", businessHealth);
        return result;
    }

    private LocalDateTime toLocalDateTime(Object val) {
        if (val == null)
            return null;
        if (val instanceof LocalDateTime)
            return (LocalDateTime) val;
        if (val instanceof java.sql.Timestamp)
            return ((java.sql.Timestamp) val).toLocalDateTime();
        if (val instanceof java.sql.Date)
            return ((java.sql.Date) val).toLocalDate().atStartOfDay();
        return LocalDateTime.parse(val.toString().replace(" ", "T"));
    }

    private List<Map<String, Object>> buildRevenueTrend(UUID companyId, String branchFilter, String period) {
        String p = (period != null && !period.isBlank()) ? period.trim().toLowerCase() : "monthly";
        if ("weekly".equals(p)) {
            return buildWeeklyRevenue(companyId, branchFilter);
        } else if ("quarterly".equals(p)) {
            return buildQuarterlyRevenue(companyId, branchFilter);
        } else if ("yearly".equals(p)) {
            return buildYearlyRevenue(companyId, branchFilter);
        }
        return buildMonthlyRevenue(companyId, branchFilter);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildWeeklyRevenue(UUID companyId, String branchFilter) {
        var query = em.createNativeQuery(
                "SELECT DATE_TRUNC('week', p.created_at) AS period_start, " +
                        "       COALESCE(SUM(p.paid_amount), 0) AS revenue " +
                        "FROM payments p " +
                        "JOIN orders o ON p.order_id = o.id " +
                        "WHERE (:companyId IS NULL OR p.company_id = :companyId) " +
                        "  AND (CAST(:branchFilter AS text) IS NULL " +
                        "       OR o.branch = CAST(:branchFilter AS text) " +
                        "       OR o.branch IN (SELECT b.branch_code FROM branches b WHERE b.name = CAST(:branchFilter AS text)) "
                        +
                        "       OR o.branch IN (SELECT b.name FROM branches b WHERE b.branch_code = CAST(:branchFilter AS text))) "
                        +
                        "  AND p.created_at >= NOW() - INTERVAL '6 weeks' " +
                        "GROUP BY 1 ORDER BY 1");
        query.setParameter("companyId", companyId);
        query.setParameter("branchFilter", branchFilter);
        List<Object[]> rows = query.getResultList();

        Map<LocalDate, BigDecimal> revenueMap = new LinkedHashMap<>();
        for (Object[] row : rows) {
            LocalDateTime ldt = toLocalDateTime(row[0]);
            if (ldt != null) {
                LocalDate ld = ldt.toLocalDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                BigDecimal rev = row[1] instanceof BigDecimal ? (BigDecimal) row[1] : new BigDecimal(row[1].toString());
                revenueMap.put(ld, rev);
            }
        }

        Map<LocalDate, BigDecimal> costMap = new LinkedHashMap<>();
        try {
            var costQuery = em.createNativeQuery(
                    "SELECT DATE_TRUNC('week', created_at) AS period_start, " +
                            "       COALESCE(SUM(total_amount), 0) AS spend " +
                            "FROM purchase_orders " +
                            "WHERE (:companyId IS NULL OR company_id = :companyId) " +
                            "  AND created_at >= NOW() - INTERVAL '6 weeks' " +
                            "GROUP BY 1 ORDER BY 1");
            costQuery.setParameter("companyId", companyId);
            List<Object[]> costRows = costQuery.getResultList();
            for (Object[] crow : costRows) {
                LocalDateTime cldt = toLocalDateTime(crow[0]);
                if (cldt != null) {
                    LocalDate cld = cldt.toLocalDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                    BigDecimal spend = crow[1] instanceof BigDecimal ? (BigDecimal) crow[1]
                            : new BigDecimal(crow[1].toString());
                    costMap.put(cld, spend);
                }
            }
        } catch (Exception ignored) {
        }

        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate currentWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        for (int i = 5; i >= 0; i--) {
            LocalDate wk = currentWeek.minusWeeks(i);
            BigDecimal rev = revenueMap.getOrDefault(wk, BigDecimal.ZERO);
            BigDecimal cost = costMap.getOrDefault(wk, BigDecimal.ZERO);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", "W" + (6 - i) + " (" + wk.format(DateTimeFormatter.ofPattern("d MMM")) + ")");
            m.put("revenue", rev);
            m.put("cost", cost);
            result.add(m);
        }
        return result;
    }

    private List<Map<String, Object>> buildQuarterlyRevenue(UUID companyId, String branchFilter) {
        List<Map<String, Object>> months = buildMonthlyRevenue(companyId, branchFilter);
        Map<String, BigDecimal> qRev = new LinkedHashMap<>();
        Map<String, BigDecimal> qCost = new LinkedHashMap<>();
        for (int q = 1; q <= 4; q++) {
            qRev.put("Q" + q, BigDecimal.ZERO);
            qCost.put("Q" + q, BigDecimal.ZERO);
        }
        for (Map<String, Object> m : months) {
            String monthStr = (String) m.get("month");
            BigDecimal rev = (BigDecimal) m.get("revenue");
            BigDecimal cost = (BigDecimal) m.get("cost");
            if (monthStr != null) {
                int qNum = 1;
                if (monthStr.startsWith("Jan") || monthStr.startsWith("Feb") || monthStr.startsWith("Mar"))
                    qNum = 1;
                else if (monthStr.startsWith("Apr") || monthStr.startsWith("May") || monthStr.startsWith("Jun"))
                    qNum = 2;
                else if (monthStr.startsWith("Jul") || monthStr.startsWith("Aug") || monthStr.startsWith("Sep"))
                    qNum = 3;
                else
                    qNum = 4;
                String qKey = "Q" + qNum;
                qRev.put(qKey, qRev.getOrDefault(qKey, BigDecimal.ZERO).add(rev != null ? rev : BigDecimal.ZERO));
                qCost.put(qKey, qCost.getOrDefault(qKey, BigDecimal.ZERO).add(cost != null ? cost : BigDecimal.ZERO));
            }
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (String qKey : qRev.keySet()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("month", qKey);
            item.put("revenue", qRev.get(qKey));
            item.put("cost", qCost.get(qKey));
            result.add(item);
        }
        return result;
    }

    private List<Map<String, Object>> buildYearlyRevenue(UUID companyId, String branchFilter) {
        int curYear = LocalDate.now().getYear();
        List<Map<String, Object>> result = new ArrayList<>();
        for (int yr = curYear - 2; yr <= curYear; yr++) {
            LocalDateTime start = LocalDate.of(yr, 1, 1).atStartOfDay();
            LocalDateTime end = LocalDate.of(yr, 12, 31).atTime(23, 59, 59);

            var q = em.createNativeQuery(
                    "SELECT COALESCE(SUM(p.paid_amount), 0) FROM payments p " +
                            "JOIN orders o ON p.order_id = o.id " +
                            "WHERE (:companyId IS NULL OR p.company_id = :companyId) " +
                            "  AND (CAST(:branchFilter AS text) IS NULL " +
                            "       OR o.branch = CAST(:branchFilter AS text) " +
                            "       OR o.branch IN (SELECT b.branch_code FROM branches b WHERE b.name = CAST(:branchFilter AS text)) "
                            +
                            "       OR o.branch IN (SELECT b.name FROM branches b WHERE b.branch_code = CAST(:branchFilter AS text))) "
                            +
                            "  AND p.created_at >= :start AND p.created_at <= :end");
            q.setParameter("companyId", companyId);
            q.setParameter("branchFilter", branchFilter);
            q.setParameter("start", start);
            q.setParameter("end", end);
            Object singleRes = q.getSingleResult();
            BigDecimal rev = singleRes instanceof BigDecimal ? (BigDecimal) singleRes
                    : new BigDecimal(singleRes.toString());

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("month", String.valueOf(yr));
            item.put("revenue", rev);
            item.put("cost", BigDecimal.ZERO);
            result.add(item);
        }
        return result;
    }

    // ── Monthly Revenue: last 9 months ────────────────────────────
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildMonthlyRevenue(UUID companyId, String branchFilter) {
        var query = em.createNativeQuery(
                "SELECT DATE_TRUNC('month', p.created_at) AS month_start, " +
                        "       COALESCE(SUM(p.paid_amount), 0) AS revenue " +
                        "FROM payments p " +
                        "JOIN orders o ON p.order_id = o.id " +
                        "WHERE (:companyId IS NULL OR p.company_id = :companyId) " +
                        "  AND (CAST(:branchFilter AS text) IS NULL " +
                        "       OR o.branch = CAST(:branchFilter AS text) " +
                        "       OR o.branch IN (SELECT b.branch_code FROM branches b WHERE b.name = CAST(:branchFilter AS text)) "
                        +
                        "       OR o.branch IN (SELECT b.name FROM branches b WHERE b.branch_code = CAST(:branchFilter AS text))) "
                        +
                        "  AND p.created_at >= NOW() - INTERVAL '9 months' " +
                        "GROUP BY 1 ORDER BY 1");
        query.setParameter("companyId", companyId);
        query.setParameter("branchFilter", branchFilter);
        List<Object[]> rows = query.getResultList();

        Map<YearMonth, BigDecimal> revenueMap = new LinkedHashMap<>();
        for (Object[] row : rows) {
            LocalDateTime ldt;
            if (row[0] instanceof LocalDateTime) {
                ldt = (LocalDateTime) row[0];
            } else if (row[0] instanceof java.sql.Timestamp) {
                ldt = ((java.sql.Timestamp) row[0]).toLocalDateTime();
            } else {
                ldt = LocalDateTime.parse(row[0].toString().replace(" ", "T"));
            }
            YearMonth ym = YearMonth.of(ldt.getYear(), ldt.getMonth());
            BigDecimal rev = row[1] instanceof BigDecimal ? (BigDecimal) row[1] : new BigDecimal(row[1].toString());
            revenueMap.put(ym, rev);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        Map<YearMonth, BigDecimal> costMap = new LinkedHashMap<>();
        try {
            var costQuery = em.createNativeQuery(
                    "SELECT DATE_TRUNC('month', created_at) AS month_start, " +
                            "       COALESCE(SUM(total_amount), 0) AS spend " +
                            "FROM purchase_orders " +
                            "WHERE (:companyId IS NULL OR company_id = :companyId) " +
                            "  AND created_at >= NOW() - INTERVAL '9 months' " +
                            "GROUP BY 1 ORDER BY 1");
            costQuery.setParameter("companyId", companyId);
            List<Object[]> costRows = costQuery.getResultList();
            for (Object[] crow : costRows) {
                LocalDateTime cldt;
                if (crow[0] instanceof LocalDateTime) {
                    cldt = (LocalDateTime) crow[0];
                } else if (crow[0] instanceof java.sql.Timestamp) {
                    cldt = ((java.sql.Timestamp) crow[0]).toLocalDateTime();
                } else {
                    cldt = LocalDateTime.parse(crow[0].toString().replace(" ", "T"));
                }
                YearMonth cym = YearMonth.of(cldt.getYear(), cldt.getMonth());
                BigDecimal spend = crow[1] instanceof BigDecimal ? (BigDecimal) crow[1]
                        : new BigDecimal(crow[1].toString());
                costMap.put(cym, spend);
            }
        } catch (Exception e) {
            log.warn("Could not calculate purchase spend history: {}", e.getMessage());
        }

        for (int i = 8; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            BigDecimal rev = revenueMap.getOrDefault(ym, BigDecimal.ZERO);
            BigDecimal cost = costMap.getOrDefault(ym, BigDecimal.ZERO);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + ym.getYear());
            m.put("revenue", rev);
            m.put("cost", cost);
            result.add(m);
        }
        return result;
    }

    // ── Production Pulse: stage counts & bespoke artworks ─────────
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildProductionPulse(UUID companyId, String branchFilter) {
        var defQuery = em.createNativeQuery(
                "SELECT sd.stage_key, sd.display_name, sd.color_class, sd.image_url, " +
                        "COALESCE(cnt_tbl.cnt, 0) AS cnt " +
                        "FROM stage_definitions sd " +
                        "LEFT JOIN (" +
                        "    SELECT ps.stage_name, COUNT(*) AS cnt " +
                        "    FROM production_stages ps " +
                        "    JOIN orders o ON ps.order_id = o.id " +
                        "    WHERE (:companyId IS NULL OR ps.company_id = :companyId) " +
                        "      AND (CAST(:branchFilter AS text) IS NULL " +
                        "           OR o.branch = CAST(:branchFilter AS text) " +
                        "           OR o.branch IN (SELECT b.branch_code FROM branches b WHERE b.name = CAST(:branchFilter AS text)) "
                        +
                        "           OR o.branch IN (SELECT b.name FROM branches b WHERE b.branch_code = CAST(:branchFilter AS text))) "
                        +
                        "      AND ps.status IN ('IN_PROGRESS','NOT_STARTED') " +
                        "    GROUP BY ps.stage_name" +
                        ") cnt_tbl ON UPPER(cnt_tbl.stage_name) = UPPER(sd.stage_key) " +
                        "WHERE (:companyId IS NULL OR sd.company_id = :companyId) " +
                        "  AND sd.active = TRUE " +
                        "ORDER BY sd.sort_order ASC");
        defQuery.setParameter("companyId", companyId);
        defQuery.setParameter("branchFilter", branchFilter);
        List<Object[]> defRows = defQuery.getResultList();

        Map<String, String> colorMap = Map.of(
                "dot-purple", "#c084fc",
                "dot-blue", "#38bdf8",
                "dot-pink", "#fb7185",
                "dot-yellow", "#fbbf24",
                "dot-green", "#4ade80",
                "dot-cyan", "#2dd4bf",
                "dot-coral", "#f472b6",
                "dot-silver", "#a3e635");

        List<Map<String, Object>> result = new ArrayList<>();
        int fallbackIdx = 0;
        String[] fallbackColors = { "#c084fc", "#fbbf24", "#4ade80", "#fb7185", "#f472b6", "#38bdf8", "#e879f9",
                "#2dd4bf", "#a3e635" };

        for (Object[] row : defRows) {
            String stageKey = (String) row[0];
            String displayName = (String) row[1];
            String colorClass = (String) row[2];
            String imageUrl = (String) row[3];
            long count = row[4] != null ? ((Number) row[4]).longValue() : 0L;

            String hexColor = colorClass != null
                    ? colorMap.getOrDefault(colorClass, fallbackColors[fallbackIdx % fallbackColors.length])
                    : fallbackColors[fallbackIdx % fallbackColors.length];
            fallbackIdx++;

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("stage", stageKey);
            m.put("name", displayName != null ? displayName : stageKey);
            m.put("count", count);
            m.put("color", hexColor);
            m.put("imageUrl", imageUrl);
            result.add(m);
        }

        // If stage_definitions returned nothing, fallback to legacy query
        if (result.isEmpty()) {
            var legacyQuery = em.createNativeQuery(
                    "SELECT ps.stage_name, COUNT(*) AS cnt " +
                            "FROM production_stages ps " +
                            "JOIN orders o ON ps.order_id = o.id " +
                            "WHERE (:companyId IS NULL OR ps.company_id = :companyId) " +
                            "  AND (CAST(:branchFilter AS text) IS NULL OR o.branch = CAST(:branchFilter AS text)) " +
                            "  AND ps.status IN ('IN_PROGRESS','NOT_STARTED') " +
                            "GROUP BY ps.stage_name ORDER BY MIN(ps.sort_order)");
            legacyQuery.setParameter("companyId", companyId);
            legacyQuery.setParameter("branchFilter", branchFilter);
            List<Object[]> legacyRows = legacyQuery.getResultList();

            String[] stageColors = {
                    "#c084fc", "#fbbf24", "#4ade80", "#fb7185", "#f472b6",
                    "#38bdf8", "#e879f9", "#2dd4bf", "#a3e635"
            };
            int colorIdx = 0;
            for (Object[] row : legacyRows) {
                String stage = (String) row[0];
                long count = ((Number) row[1]).longValue();
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("stage", stage);
                m.put("name", stage);
                m.put("count", count);
                m.put("color", stageColors[colorIdx % stageColors.length]);
                m.put("imageUrl", null);
                result.add(m);
                colorIdx++;
            }
        }
        return result;
    }

    // ── Business Health ───────────────────────────────────────────
    private Map<String, Object> buildBusinessHealth(UUID companyId, BigDecimal totalRevenue, long totalOrders,
            long deliveredOrders, long totalCustomers) {
        // Financial: paid / total billed
        BigDecimal rawBilled = companyId != null ? paymentRepository.sumTotalAmount(companyId) : BigDecimal.ZERO;
        BigDecimal totalBilled = rawBilled != null ? rawBilled : BigDecimal.ZERO;
        BigDecimal safeRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;
        int financial = totalBilled.compareTo(BigDecimal.ZERO) > 0
                ? safeRevenue.multiply(BigDecimal.valueOf(100)).divide(totalBilled, 0, RoundingMode.HALF_UP).intValue()
                : 0;
        financial = Math.min(financial, 100);

        // Operational: completed orders / total orders
        int operational = totalOrders > 0
                ? (int) Math.min(100, deliveredOrders * 100L / totalOrders)
                : 0;

        // Customer: customers who ordered in last 90 days / total
        long activeCustomers = customerRepository.countActiveIn90Days(companyId);
        int customer = totalCustomers > 0
                ? (int) Math.min(100, activeCustomers * 100L / totalCustomers)
                : 0;

        // People: active employees / total
        long totalEmployees = employeeRepository.countByCompanyId(companyId);
        long activeEmployees = employeeRepository.countByCompanyIdAndStatus(companyId, "ACTIVE");
        int people = totalEmployees > 0
                ? (int) Math.min(100, activeEmployees * 100L / totalEmployees)
                : 0;

        Map<String, Object> health = new LinkedHashMap<>();
        health.put("financial", financial);
        health.put("operational", operational);
        health.put("customer", customer);
        health.put("people", people);
        return health;
    }
}
