package com.fashionerp.collection;

import com.fashionerp.design.Design;
import com.fashionerp.design.DesignRepository;
import com.fashionerp.inventory.InventoryItem;
import com.fashionerp.inventory.InventoryRepository;
import com.fashionerp.order.Order;
import com.fashionerp.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final DesignRepository designRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final CollectionActivityRepository collectionActivityRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final String[] PALETTE = {
            "#a855f7", "#ec4899", "#eab308", "#84cc16", "#c084fc", "#f97316", "#38bdf8", "#06b6d4", "#94a3b8"
    };

    @Transactional(readOnly = true)
    public Page<CollectionDto.SummaryResponse> search(
            String search,
            String status,
            String season,
            Integer year,
            String designer,
            String branch,
            Boolean archived,
            Pageable pageable) {

        if (search != null && search.isBlank()) search = null;
        if ("all".equalsIgnoreCase(status) || (status != null && status.isBlank())) status = null;
        if ("all".equalsIgnoreCase(season) || (season != null && season.isBlank())) season = null;
        if ("all".equalsIgnoreCase(designer) || (designer != null && designer.isBlank())) designer = null;
        if ("all".equalsIgnoreCase(branch) || (branch != null && branch.isBlank())) branch = null;
        if (Boolean.TRUE.equals(archived) && status == null) status = "ARCHIVED";

        Page<Collection> page = collectionRepository.search(search, status, season, year, designer, branch, pageable);

        List<String> collectionNames = page.getContent().stream()
                .map(Collection::getName)
                .filter(n -> n != null && !n.isBlank())
                .map(String::toLowerCase)
                .toList();

        Map<String, List<Design>> designsByCollection = collectionNames.isEmpty()
                ? Collections.emptyMap()
                : designRepository.findByCollectionInIgnoreCase(collectionNames).stream()
                        .filter(d -> d.getCollection() != null)
                        .collect(Collectors.groupingBy(d -> d.getCollection().toLowerCase()));

        Map<String, List<Order>> ordersByCollection = collectionNames.isEmpty()
                ? Collections.emptyMap()
                : orderRepository.findByCollectionInIgnoreCase(collectionNames).stream()
                        .filter(o -> o.getCollection() != null)
                        .collect(Collectors.groupingBy(o -> o.getCollection().toLowerCase()));

        List<CollectionDto.SummaryResponse> dtos = page.getContent().stream()
                .map(c -> {
                    String key = c.getName() != null ? c.getName().toLowerCase() : "";
                    List<Design> designs = designsByCollection.getOrDefault(key, Collections.emptyList());
                    List<Order> orders = ordersByCollection.getOrDefault(key, Collections.emptyList());
                    return toSummaryResponse(c, designs, orders);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public CollectionDto.KpiResponse getKpis() {
        long totalCollections = collectionRepository.count();
        long activeCollections = collectionRepository.countByStatusIgnoreCase("ACTIVE");
        String currentSeasonName = totalCollections > 0
                ? collectionRepository.findCurrentSeasonName().orElse("—")
                : "—";
        long currentSeasonCount = collectionRepository.countBySeasonIgnoreCase(currentSeasonName);
        long totalGarments = orderRepository.count();
        long totalDesigns = designRepository.count();
        long draftCollections = collectionRepository.countByStatusIgnoreCase("DRAFT");

        return CollectionDto.KpiResponse.builder()
                .totalCollections(totalCollections)
                .activeCollections(activeCollections)
                .currentSeasonCount(currentSeasonCount)
                .currentSeasonName(currentSeasonName)
                .totalGarments(totalGarments)
                .totalDesigns(totalDesigns)
                .draftCollections(draftCollections)
                .build();
    }

    @Transactional(readOnly = true)
    public CollectionDto.DetailResponse getById(UUID id) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collection not found with id: " + id));
        return toDetailResponse(collection);
    }

    @Transactional(readOnly = true)
    public CollectionDto.DetailResponse getByName(String name) {
        Collection collection = collectionRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new IllegalArgumentException("Collection not found with name: " + name));
        return toDetailResponse(collection);
    }

    @Transactional
    public CollectionDto.SummaryResponse create(CollectionDto.CreateRequest req) {
        if (collectionRepository.existsByNameIgnoreCase(req.getName())) {
            throw new IllegalArgumentException("Collection with name '" + req.getName() + "' already exists");
        }

        String code = req.getCode();
        if (code == null || code.isBlank()) {
            long count = collectionRepository.count() + 1;
            code = String.format("COL-%03d", count);
        }

        if (collectionRepository.existsByCode(code)) {
            code = "COL-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        }

        Collection collection = Collection.builder()
                .code(code)
                .name(req.getName().trim())
                .subtitle(req.getSubtitle())
                .description(req.getDescription())
                .season(req.getSeason() != null && !req.getSeason().isBlank() ? req.getSeason() : collectionRepository.findCurrentSeasonName().orElse(null))
                .year(req.getYear() != null ? req.getYear() : LocalDate.now().getYear())
                .status(req.getStatus() != null && !req.getStatus().isBlank() ? req.getStatus().toUpperCase() : "ACTIVE")
                .designer(req.getDesigner() != null && !req.getDesigner().isBlank() ? req.getDesigner() : null)
                .branch(req.getBranch() != null && !req.getBranch().isBlank() ? req.getBranch() : null)
                .launchDate(req.getLaunchDate())
                .isFeatured(req.getIsFeatured() != null ? req.getIsFeatured() : false)
                .coverImageUrl(req.getCoverImageUrl())
                .thumbnailUrls(req.getThumbnailUrls())
                .build();

        Collection saved = collectionRepository.save(collection);
        return toSummaryResponse(saved);
    }

    @Transactional
    public CollectionDto.SummaryResponse update(UUID id, CollectionDto.UpdateRequest req) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collection not found with id: " + id));

        if (req.getName() != null && !req.getName().isBlank()) {
            if (!collection.getName().equalsIgnoreCase(req.getName()) &&
                collectionRepository.existsByNameIgnoreCase(req.getName())) {
                throw new IllegalArgumentException("Collection with name '" + req.getName() + "' already exists");
            }
            collection.setName(req.getName().trim());
        }

        if (req.getSubtitle() != null) collection.setSubtitle(req.getSubtitle());
        if (req.getDescription() != null) collection.setDescription(req.getDescription());
        if (req.getSeason() != null) collection.setSeason(req.getSeason());
        if (req.getYear() != null) collection.setYear(req.getYear());
        if (req.getStatus() != null) collection.setStatus(req.getStatus().toUpperCase());
        if (req.getDesigner() != null) collection.setDesigner(req.getDesigner());
        if (req.getBranch() != null) collection.setBranch(req.getBranch());
        if (req.getLaunchDate() != null) collection.setLaunchDate(req.getLaunchDate());
        if (req.getIsFeatured() != null) collection.setIsFeatured(req.getIsFeatured());
        if (req.getCoverImageUrl() != null) collection.setCoverImageUrl(req.getCoverImageUrl());
        if (req.getThumbnailUrls() != null) collection.setThumbnailUrls(req.getThumbnailUrls());

        Collection saved = collectionRepository.save(collection);
        return toSummaryResponse(saved);
    }

    @Transactional
    public CollectionDto.SummaryResponse toggleArchive(UUID id) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collection not found with id: " + id));

        if ("ARCHIVED".equalsIgnoreCase(collection.getStatus())) {
            collection.setStatus("ACTIVE");
        } else {
            collection.setStatus("ARCHIVED");
        }

        Collection saved = collectionRepository.save(collection);
        return toSummaryResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        if (!collectionRepository.existsById(id)) {
            throw new IllegalArgumentException("Collection not found with id: " + id);
        }
        collectionRepository.deleteById(id);
    }

    @lombok.Data
    @lombok.Builder
    private static class ProgressMetrics {
        private int designProgress;
        private int materialsProgress;
        private int productionProgress;
        private int qcProgress;
        private int overallProgress;
    }

    private ProgressMetrics calculateProgressMetrics(List<Design> designs, List<Order> orders, Integer fallbackPct) {
        int designProgress = 0;
        int materialsProgress = 0;
        int productionProgress = 0;
        int qcProgress = 0;

        if (designs != null && !designs.isEmpty()) {
            long totalDesigns = designs.size();
            long approved = designs.stream()
                    .filter(d -> d.getStatus() != null && "APPROVED".equalsIgnoreCase(d.getStatus()))
                    .count();
            designProgress = (int) Math.round((approved * 100.0) / totalDesigns);
        }

        if (orders != null && !orders.isEmpty()) {
            long totalOrders = orders.size();
            long ordersWithMaterials = orders.stream()
                    .filter(o -> !matchesStage(o, "DESIGN", "DESIGNING", "PENDING"))
                    .count();
            materialsProgress = (int) Math.round((ordersWithMaterials * 100.0) / totalOrders);

            long ordersInProduction = orders.stream()
                    .filter(o -> matchesStage(o, "STITCHING", "HAND_WORK", "HEMMING", "TRIAL", "QC", "READY", "DELIVERED"))
                    .count();
            productionProgress = (int) Math.round((ordersInProduction * 100.0) / totalOrders);

            long ordersPassedQc = orders.stream()
                    .filter(o -> matchesStage(o, "READY", "DELIVERED"))
                    .count();
            qcProgress = (int) Math.round((ordersPassedQc * 100.0) / totalOrders);
        }

        int overallPct = 0;
        int activeStages = 0;
        if (designs != null && !designs.isEmpty()) { overallPct += designProgress; activeStages++; }
        if (orders != null && !orders.isEmpty()) { overallPct += (materialsProgress + productionProgress + qcProgress); activeStages += 3; }
        int calculatedOverall = activeStages > 0 ? (int) Math.round((double) overallPct / activeStages) : (fallbackPct != null ? fallbackPct : 0);

        return ProgressMetrics.builder()
                .designProgress(designProgress)
                .materialsProgress(materialsProgress)
                .productionProgress(productionProgress)
                .qcProgress(qcProgress)
                .overallProgress(calculatedOverall)
                .build();
    }

    private CollectionDto.SummaryResponse toSummaryResponse(Collection c) {
        List<Design> designs = designRepository.findByCollectionIgnoreCase(c.getName());
        List<Order> orders = orderRepository.findByCollectionIgnoreCase(c.getName());
        return toSummaryResponse(c, designs, orders);
    }

    private CollectionDto.SummaryResponse toSummaryResponse(Collection c, List<Design> designs, List<Order> orders) {
        long garmentsCount = !orders.isEmpty() ? orders.size() : designs.size();

        Set<String> distinctFabrics = designs.stream()
                .filter(Objects::nonNull)
                .map(d -> d.getPrimaryFabric())
                .filter(f -> f != null && !f.isBlank())
                .collect(Collectors.toSet());

        List<String> thumbs = extractThumbnails(c, designs);
        ProgressMetrics metrics = calculateProgressMetrics(designs, orders, c.getProgressPercentage());

        return CollectionDto.SummaryResponse.builder()
                .id(c.getId())
                .code(c.getCode())
                .name(c.getName())
                .subtitle(c.getSubtitle())
                .description(c.getDescription())
                .season(c.getSeason())
                .year(c.getYear())
                .status(c.getStatus())
                .designer(c.getDesigner())
                .branch(c.getBranch())
                .launchDate(c.getLaunchDate())
                .isFeatured(c.getIsFeatured())
                .coverImageUrl(c.getCoverImageUrl())
                .thumbnails(thumbs)
                .designsCount(designs.size())
                .garmentsCount(garmentsCount)
                .fabricsCount(distinctFabrics.size())
                .progressPercentage(metrics.getOverallProgress())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private CollectionDto.DetailResponse toDetailResponse(Collection c) {
        List<Design> designs = designRepository.findByCollectionIgnoreCase(c.getName());
        List<Order> orders = orderRepository.findByCollectionIgnoreCase(c.getName());

        long garmentsCount = !orders.isEmpty() ? orders.size() : designs.size();

        Set<String> distinctFabrics = designs.stream()
                .filter(Objects::nonNull)
                .map(d -> d.getPrimaryFabric())
                .filter(f -> f != null && !f.isBlank())
                .collect(Collectors.toSet());

        // Calculate Estimated Value
        BigDecimal totalValue = designs.stream()
                .filter(Objects::nonNull)
                .map(d -> d.getSuggestedPrice())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        if (totalValue.compareTo(BigDecimal.ZERO) == 0 && !orders.isEmpty()) {
            totalValue = orders.stream()
                    .filter(Objects::nonNull)
                    .map(o -> o.getTotalAmount())
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));
        }

        String formattedValue = formatCurrencyLakhs(totalValue);

        CollectionDto.CollectionStats stats = CollectionDto.CollectionStats.builder()
                .garmentsCount(garmentsCount)
                .fabricsCount(distinctFabrics.size())
                .estimatedValue(totalValue)
                .formattedValue(formattedValue)
                .build();

        // Garment Composition
        List<CollectionDto.CompositionItem> composition = calculateComposition(orders, designs);

        // Production Status
        List<CollectionDto.ProductionStageItem> productionStages = calculateProductionStages(orders, designs);

        // Key Fabrics
        List<CollectionDto.FabricItem> keyFabrics = resolveKeyFabrics(distinctFabrics, designs);

        // Recent Activity
        List<CollectionDto.ActivityItem> activity = resolveRecentActivity(c);

        List<String> thumbs = extractThumbnails(c, designs);

        Integer daysRemaining = null;
        if (c.getProductionDeadline() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), c.getProductionDeadline());
            daysRemaining = (int) Math.max(0, days);
        }

        ProgressMetrics metrics = calculateProgressMetrics(designs, orders, c.getProgressPercentage());

        return CollectionDto.DetailResponse.builder()
                .id(c.getId())
                .code(c.getCode())
                .name(c.getName())
                .subtitle(c.getSubtitle())
                .description(c.getDescription())
                .season(c.getSeason())
                .year(c.getYear())
                .status(c.getStatus())
                .designer(c.getDesigner())
                .branch(c.getBranch())
                .launchDate(c.getLaunchDate())
                .productionDeadline(c.getProductionDeadline())
                .daysRemaining(daysRemaining)
                .progressPercentage(metrics.getOverallProgress())
                .designProgress(metrics.getDesignProgress())
                .materialsProgress(metrics.getMaterialsProgress())
                .productionProgress(metrics.getProductionProgress())
                .qcProgress(metrics.getQcProgress())
                .isFeatured(c.getIsFeatured())
                .coverImageUrl(c.getCoverImageUrl())
                .thumbnails(thumbs)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .stats(stats)
                .garmentComposition(composition)
                .productionStatus(productionStages)
                .keyFabrics(keyFabrics)
                .recentActivity(activity)
                .build();
    }

    private List<String> extractThumbnails(Collection c, List<Design> designs) {
        List<String> thumbs = new ArrayList<>();

        // 1. If explicit thumbnails are defined in collections.thumbnail_urls, prioritize them
        if (c.getThumbnailUrls() != null && !c.getThumbnailUrls().isBlank()) {
            for (String t : c.getThumbnailUrls().split(",")) {
                String clean = t.trim();
                if (!clean.isEmpty() && !thumbs.contains(clean)) {
                    thumbs.add(clean);
                }
                if (thumbs.size() >= 4) break;
            }
        }

        // 2. If fewer than 4, supplement with design thumbnails
        if (thumbs.size() < 4 && designs != null && !designs.isEmpty()) {
            for (Design d : designs) {
                if (d.getThumbnailUrl() != null && !d.getThumbnailUrl().isBlank() && !thumbs.contains(d.getThumbnailUrl())) {
                    thumbs.add(d.getThumbnailUrl());
                }
                if (thumbs.size() >= 4) break;
            }
        }

        // 3. Fallback to cover image if still empty
        if (thumbs.isEmpty() && c.getCoverImageUrl() != null && !c.getCoverImageUrl().isBlank()) {
            thumbs.add(c.getCoverImageUrl());
        }

        return thumbs;
    }

    private List<CollectionDto.CompositionItem> calculateComposition(List<Order> orders, List<Design> designs) {
        Map<String, Long> countByType;
        long total;

        if (orders != null && !orders.isEmpty()) {
            countByType = orders.stream()
                    .collect(Collectors.groupingBy(
                            o -> normalizeGarmentType(o.getGarmentType()),
                            Collectors.counting()
                    ));
            total = orders.size();
        } else if (designs != null && !designs.isEmpty()) {
            countByType = designs.stream()
                    .collect(Collectors.groupingBy(
                            d -> normalizeGarmentType(d.getGarmentType()),
                            Collectors.counting()
                    ));
            total = designs.size();
        } else {
            return Collections.emptyList();
        }

        List<CollectionDto.CompositionItem> items = new ArrayList<>();
        List<Map.Entry<String, Long>> sortedEntries = countByType.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .toList();

        int colorIdx = 0;
        for (Map.Entry<String, Long> entry : sortedEntries) {
            String type = entry.getKey();
            Long count = entry.getValue();
            int pct = total > 0 ? (int) Math.round((count * 100.0) / total) : 0;
            String color = PALETTE[colorIdx % PALETTE.length];
            colorIdx++;

            items.add(CollectionDto.CompositionItem.builder()
                    .category(type)
                    .count(count)
                    .percentage(pct)
                    .color(color)
                    .build());
        }

        return items;
    }

    private String normalizeGarmentType(String raw) {
        if (raw == null || raw.isBlank()) return "Others";
        return raw.trim();
    }

    private List<CollectionDto.ProductionStageItem> calculateProductionStages(List<Order> orders, List<Design> designs) {
        List<CollectionDto.ProductionStageItem> stages = new ArrayList<>();

        if (orders != null && !orders.isEmpty()) {
            long designing = orders.stream().filter(o -> matchesStage(o, "DESIGN", "DESIGNING", "PENDING")).count();
            long cutting = orders.stream().filter(o -> matchesStage(o, "CUTTING")).count();
            long stitching = orders.stream().filter(o -> matchesStage(o, "STITCHING", "HAND_WORK", "HEMMING")).count();
            long trial = orders.stream().filter(o -> matchesStage(o, "TRIAL")).count();
            long qc = orders.stream().filter(o -> matchesStage(o, "QC")).count();
            long ready = orders.stream().filter(o -> matchesStage(o, "READY", "DELIVERED")).count();

            stages.add(new CollectionDto.ProductionStageItem("Designing", designing, "#a855f7"));
            stages.add(new CollectionDto.ProductionStageItem("Cutting", cutting, "#38bdf8"));
            stages.add(new CollectionDto.ProductionStageItem("Stitching", stitching, "#eab308"));
            stages.add(new CollectionDto.ProductionStageItem("Trial", trial, "#f97316"));
            stages.add(new CollectionDto.ProductionStageItem("QC", qc, "#ec4899"));
            stages.add(new CollectionDto.ProductionStageItem("Ready", ready, "#22c55e"));
        } else if (designs != null && !designs.isEmpty()) {
            long total = designs.size();
            long ready = designs.stream().filter(d -> "APPROVED".equalsIgnoreCase(d.getStatus())).count();
            long designing = total - ready;

            stages.add(new CollectionDto.ProductionStageItem("Designing", designing, "#a855f7"));
            stages.add(new CollectionDto.ProductionStageItem("Cutting", 0, "#38bdf8"));
            stages.add(new CollectionDto.ProductionStageItem("Stitching", 0, "#eab308"));
            stages.add(new CollectionDto.ProductionStageItem("Trial", 0, "#f97316"));
            stages.add(new CollectionDto.ProductionStageItem("QC", 0, "#ec4899"));
            stages.add(new CollectionDto.ProductionStageItem("Ready", ready, "#22c55e"));
        }

        return stages;
    }

    private boolean matchesStage(Order o, String... candidates) {
        String stage = o.getCurrentStage();
        String status = o.getStatus() != null ? o.getStatus().name() : "";
        for (String c : candidates) {
            if (stage != null && stage.equalsIgnoreCase(c)) return true;
            if (status.equalsIgnoreCase(c)) return true;
        }
        return false;
    }

    private List<CollectionDto.FabricItem> resolveKeyFabrics(Set<String> fabricNames, List<Design> designs) {
        List<InventoryItem> allInventory = inventoryRepository.findFabrics();
        List<CollectionDto.FabricItem> list = new ArrayList<>();

        if (fabricNames != null && !fabricNames.isEmpty()) {
            for (String rawFabric : fabricNames) {
                // Match inventory item directly by exact name or variant from the database
                InventoryItem matchingItem = allInventory.stream()
                        .filter(i -> i.getName() != null && (
                                i.getName().equalsIgnoreCase(rawFabric) ||
                                (i.getVariant() != null && !i.getVariant().isBlank() &&
                                 rawFabric.toLowerCase().contains(i.getVariant().toLowerCase()))
                        ))
                        .findFirst()
                        .orElse(null);

                String displayName;
                if (matchingItem != null && matchingItem.getVariant() != null && !matchingItem.getVariant().isBlank()) {
                    displayName = matchingItem.getVariant();
                } else if (matchingItem != null && matchingItem.getName() != null && !matchingItem.getName().isBlank()) {
                    displayName = matchingItem.getName();
                } else {
                    displayName = rawFabric;
                }

                long meters = (matchingItem != null && matchingItem.getStockQty() != null)
                        ? matchingItem.getStockQty().longValue()
                        : 10;

                String imageUrl = (matchingItem != null && matchingItem.getImageUrl() != null && !matchingItem.getImageUrl().isBlank())
                        ? matchingItem.getImageUrl()
                        : null;

                list.add(CollectionDto.FabricItem.builder()
                        .name(displayName)
                        .meters(meters)
                        .imageUrl(imageUrl)
                        .build());

                if (list.size() >= 5) break;
            }
        }

        // If list has fewer than 5 fabrics, fill from remaining inventory fabric items
        if (list.size() < 5) {
            for (InventoryItem inv : allInventory) {
                if (inv.getCategory() != null && inv.getCategory().equalsIgnoreCase("FABRIC")) {
                    String name = (inv.getVariant() != null && !inv.getVariant().isBlank()) ? inv.getVariant() : inv.getName();
                    boolean alreadyPresent = list.stream().anyMatch(f -> f.getName().equalsIgnoreCase(name));
                    if (!alreadyPresent) {
                        list.add(CollectionDto.FabricItem.builder()
                                .name(name)
                                .meters(inv.getStockQty() != null ? inv.getStockQty().longValue() : 5)
                                .imageUrl(inv.getImageUrl() != null ? inv.getImageUrl() : null)
                                .build());
                    }
                    if (list.size() >= 5) break;
                }
            }
        }

        return list;
    }

    private List<CollectionDto.ActivityItem> resolveRecentActivity(Collection c) {
        List<CollectionActivity> dbActivities = collectionActivityRepository.findByCollectionIdOrderByActivityDateDesc(c.getId());
        if (dbActivities != null && !dbActivities.isEmpty()) {
            return dbActivities.stream()
                    .map(a -> new CollectionDto.ActivityItem(
                            a.getActivityDate().format(DATE_FMT),
                            a.getDescription(),
                            a.getActivityType(),
                            a.getColor()
                    ))
                    .collect(Collectors.toList());
        }

        String activityDateStr = c.getCreatedAt() != null 
                ? c.getCreatedAt().format(DATE_FMT) 
                : (c.getLaunchDate() != null ? c.getLaunchDate().format(DATE_FMT) : "Recent");
        return List.of(new CollectionDto.ActivityItem(activityDateStr, "Collection published as " + c.getStatus(), "SYSTEM", "#22c55e"));
    }

    private String formatCurrencyLakhs(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return "₹0";
        }
        if (amount.compareTo(BigDecimal.valueOf(100000)) >= 0) {
            BigDecimal lakhs = amount.divide(BigDecimal.valueOf(100000), 1, RoundingMode.HALF_UP);
            return "₹" + lakhs + "L";
        }
        if (amount.compareTo(BigDecimal.valueOf(1000)) >= 0) {
            BigDecimal k = amount.divide(BigDecimal.valueOf(1000), 1, RoundingMode.HALF_UP);
            return "₹" + k + "K";
        }
        return "₹" + new DecimalFormat("#,##0").format(amount);
    }
}
