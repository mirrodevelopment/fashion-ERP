package com.fashionerp.dashboard;

import com.fashionerp.customer.CustomerRepository;
import com.fashionerp.inventory.InventoryRepository;
import com.fashionerp.inventory.InventoryStatus;
import com.fashionerp.order.OrderRepository;
import com.fashionerp.order.OrderStatus;
import com.fashionerp.payment.PaymentRepository;
import com.fashionerp.payment.PaymentStatus;
import com.fashionerp.workforce.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final PaymentRepository paymentRepository;
    private final EmployeeRepository employeeRepository;

    @PersistenceContext
    private EntityManager em;

    @GetMapping("/kpis")
    public Map<String, Object> kpis() {
        // ── Basic counts ──────────────────────────────────────────
        long totalCustomers    = customerRepository.count();
        long totalOrders       = orderRepository.count();
        long pendingOrders     = orderRepository.countByStatus(OrderStatus.PENDING);
        long inProgressOrders  = orderRepository.countByStatus(OrderStatus.IN_PROGRESS);
        long readyOrders       = orderRepository.countByStatus(OrderStatus.READY);
        long deliveredOrders   = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledOrders   = orderRepository.countByStatus(OrderStatus.CANCELLED);
        long lowStockItems     = inventoryRepository.countByStatus(InventoryStatus.LOW_STOCK);
        long outOfStockItems   = inventoryRepository.countByStatus(InventoryStatus.OUT_OF_STOCK);
        BigDecimal totalRevenue   = paymentRepository.sumPaidAmount();
        BigDecimal pendingPayments = paymentRepository.sumPendingAmount();

        long pendingPaymentsCount = paymentRepository.countByStatus(PaymentStatus.PARTIAL)
                + paymentRepository.countByStatus(PaymentStatus.PENDING);

        // ── Order status breakdown for donut chart ────────────────
        List<Map<String, Object>> orderStatusBreakdown = new ArrayList<>();
        long[] statusCounts = {pendingOrders, inProgressOrders, readyOrders, deliveredOrders, cancelledOrders};
        String[] statusNames = {"PENDING", "IN_PROGRESS", "READY", "DELIVERED", "CANCELLED"};
        for (int i = 0; i < statusNames.length; i++) {
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("status", statusNames[i]);
            s.put("count", statusCounts[i]);
            s.put("pct", totalOrders > 0
                    ? BigDecimal.valueOf(statusCounts[i] * 100.0 / totalOrders).setScale(1, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO);
            orderStatusBreakdown.add(s);
        }

        // ── Monthly revenue (last 9 months) ───────────────────────
        List<Map<String, Object>> monthlyRevenue = buildMonthlyRevenue();

        // ── Production pulse (stage counts) ──────────────────────
        List<Map<String, Object>> productionPulse = buildProductionPulse();

        // ── Business Health metrics ───────────────────────────────
        Map<String, Object> businessHealth = buildBusinessHealth(
                totalRevenue, totalOrders, deliveredOrders, totalCustomers);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRevenue",         totalRevenue);
        result.put("totalOrders",          totalOrders);
        result.put("totalCustomers",       totalCustomers);
        result.put("pendingOrders",        pendingOrders);
        result.put("inProgressOrders",     inProgressOrders);
        result.put("readyOrders",          readyOrders);
        result.put("deliveredOrders",      deliveredOrders);
        result.put("cancelledOrders",      cancelledOrders);
        result.put("ordersInProduction",   inProgressOrders);
        result.put("lowStockItems",        lowStockItems);
        result.put("outOfStockItems",      outOfStockItems);
        result.put("pendingPayments",      pendingPayments);
        result.put("pendingPaymentsCount", pendingPaymentsCount);
        result.put("orderStatusBreakdown", orderStatusBreakdown);
        result.put("monthlyRevenue",       monthlyRevenue);
        result.put("productionPulse",      productionPulse);
        result.put("businessHealth",       businessHealth);
        return result;
    }

    // ── Monthly Revenue: last 9 months ────────────────────────────
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildMonthlyRevenue() {
        List<Object[]> rows = em.createNativeQuery(
            "SELECT DATE_TRUNC('month', created_at) AS month_start, " +
            "       COALESCE(SUM(paid_amount), 0) AS revenue " +
            "FROM payments " +
            "WHERE created_at >= NOW() - INTERVAL '9 months' " +
            "GROUP BY 1 ORDER BY 1"
        ).getResultList();

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
        for (int i = 8; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            BigDecimal rev = revenueMap.getOrDefault(ym, BigDecimal.ZERO);
            // Cost approximated at 40% of revenue
            BigDecimal cost = rev.multiply(BigDecimal.valueOf(0.40)).setScale(2, RoundingMode.HALF_UP);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month",   ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + ym.getYear());
            m.put("revenue", rev);
            m.put("cost",    cost);
            result.add(m);
        }
        return result;
    }

    // ── Production Pulse: stage counts & bespoke artworks ─────────
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildProductionPulse() {
        // Query active stage definitions ordered by sort_order
        List<Object[]> defRows = em.createNativeQuery(
            "SELECT sd.stage_key, sd.display_name, sd.color_class, sd.image_url, " +
            "COALESCE(cnt_tbl.cnt, 0) AS cnt " +
            "FROM stage_definitions sd " +
            "LEFT JOIN (" +
            "    SELECT stage_name, COUNT(*) AS cnt " +
            "    FROM production_stages " +
            "    WHERE status IN ('IN_PROGRESS','NOT_STARTED') " +
            "    GROUP BY stage_name" +
            ") cnt_tbl ON UPPER(cnt_tbl.stage_name) = UPPER(sd.stage_key) " +
            "WHERE sd.active = TRUE " +
            "ORDER BY sd.sort_order ASC"
        ).getResultList();

        Map<String, String> colorMap = Map.of(
            "dot-purple", "#c084fc",
            "dot-blue",   "#38bdf8",
            "dot-pink",   "#fb7185",
            "dot-yellow", "#fbbf24",
            "dot-green",  "#4ade80",
            "dot-cyan",   "#2dd4bf",
            "dot-coral",  "#f472b6",
            "dot-silver", "#a3e635"
        );

        List<Map<String, Object>> result = new ArrayList<>();
        int fallbackIdx = 0;
        String[] fallbackColors = {"#c084fc","#fbbf24","#4ade80","#fb7185","#f472b6","#38bdf8","#e879f9","#2dd4bf","#a3e635"};

        for (Object[] row : defRows) {
            String stageKey = (String) row[0];
            String displayName = (String) row[1];
            String colorClass = (String) row[2];
            String imageUrl = (String) row[3];
            long count = row[4] != null ? ((Number) row[4]).longValue() : 0L;

            String hexColor = colorClass != null ? colorMap.getOrDefault(colorClass, fallbackColors[fallbackIdx % fallbackColors.length])
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
            List<Object[]> legacyRows = em.createNativeQuery(
                "SELECT stage_name, COUNT(*) AS cnt " +
                "FROM production_stages " +
                "WHERE status IN ('IN_PROGRESS','NOT_STARTED') " +
                "GROUP BY stage_name ORDER BY MIN(sort_order)"
            ).getResultList();

            String[] stageColors = {
                "#c084fc","#fbbf24","#4ade80","#fb7185","#f472b6",
                "#38bdf8","#e879f9","#2dd4bf","#a3e635"
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
    private Map<String, Object> buildBusinessHealth(BigDecimal totalRevenue, long totalOrders,
                                                     long deliveredOrders, long totalCustomers) {
        // Financial: paid / total billed
        BigDecimal totalBilled = paymentRepository.sumTotalAmount();
        int financial = totalBilled != null && totalBilled.compareTo(BigDecimal.ZERO) > 0
                ? totalRevenue.multiply(BigDecimal.valueOf(100)).divide(totalBilled, 0, RoundingMode.HALF_UP).intValue()
                : 0;
        financial = Math.min(financial, 100);

        // Operational: completed orders / total orders
        int operational = totalOrders > 0
                ? (int) Math.min(100, deliveredOrders * 100L / totalOrders)
                : 0;

        // Customer: customers who ordered in last 90 days / total
        long activeCustomers = customerRepository.countActiveIn90Days();
        int customer = totalCustomers > 0
                ? (int) Math.min(100, activeCustomers * 100L / totalCustomers)
                : 0;

        // People: active employees / total
        long totalEmployees  = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus("ACTIVE");
        int people = totalEmployees > 0
                ? (int) Math.min(100, activeEmployees * 100L / totalEmployees)
                : 0;

        Map<String, Object> health = new LinkedHashMap<>();
        health.put("financial",   financial);
        health.put("operational", operational);
        health.put("customer",    customer);
        health.put("people",      people);
        return health;
    }
}
