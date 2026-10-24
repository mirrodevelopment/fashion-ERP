package com.fashionerp.auth;

import com.fashionerp.profile.UserProfile;
import com.fashionerp.profile.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Business logic for the Users & Roles management page.
 *
 * No raw/hardcoded strings:
 * - Roles are always typed as UserRole enum constants or parsed with
 * UserRole.valueOf()
 * - All display values are derived from AppUser entity fields
 * - Password hash is never returned to callers
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final AppUserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.fashionerp.branch.BranchRepository branchRepository;
    private final UserDelegationRepository delegationRepository;
    private final UserAccessLogRepository accessLogRepository;
    private final UserActiveSessionRepository activeSessionRepository;

    /**
     * Activates all users within the company/system.
     * Sets active = true and status = 'ACTIVE' for all users.
     */
    @Transactional
    public int activateAllUsers() {
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        List<AppUser> userList = (companyId != null)
                ? userRepository.findByCompanyId(companyId)
                : userRepository.findAll();

        int count = 0;
        for (AppUser user : userList) {
            boolean changed = false;
            if (!Boolean.TRUE.equals(user.getActive())) {
                user.setActive(true);
                changed = true;
            }
            if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
                user.setStatus("ACTIVE");
                changed = true;
            }
            if (changed) {
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
                count++;
            }
        }
        log.info("Activated {} users to active=true and status=ACTIVE", count);
        return count;
    }

    // ─── Read ──────────────────────────────────────────────────────────────

    /**
     * Returns all users, optionally filtered by search, role, active status.
     */
    @Transactional(readOnly = true)
    public List<UserManagementDto.UserSummary> listUsers(String search, String roleFilter, Boolean activeFilter) {
        return listUsers(search, roleFilter, activeFilter, null, null, null, null);
    }

    /**
     * Returns all users with multi-faceted governance filtering.
     */
    @Transactional(readOnly = true)
    public List<UserManagementDto.UserSummary> listUsers(
            String search,
            String roleFilter,
            Boolean activeFilter,
            String tab,
            String branchFilter,
            String statusFilter,
            String scopeFilter) {
        UserRole roleEnum = null;
        if (roleFilter != null && !roleFilter.isBlank() && !"ALL".equalsIgnoreCase(roleFilter.trim())) {
            try {
                roleEnum = UserRole.valueOf(roleFilter.trim().toUpperCase());
            } catch (Exception ignored) {
            }
        }

        final UserRole finalRole = roleEnum;
        final String searchLower = (search != null && !search.isBlank()) ? search.trim().toLowerCase() : null;
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        String callerBranch = com.fashionerp.common.TenantContext.getAssignedBranch();
        boolean isBranchAdmin = com.fashionerp.common.TenantContext.isBranchAdmin();

        List<AppUser> userList = (companyId != null)
                ? userRepository.findByCompanyId(companyId)
                : userRepository.findAll();

        return userList.stream()
                .filter(u -> {
                    // Branch Admin Scoping
                    if (isBranchAdmin && callerBranch != null && !callerBranch.isBlank()) {
                        boolean isOwnerOrAdmin = (u.getRole() == UserRole.OWNER || u.getRole() == UserRole.ADMIN);
                        boolean isOwnBranch = (u.getAssignedBranch() != null
                                && u.getAssignedBranch().equalsIgnoreCase(callerBranch.trim()));
                        if (!isOwnerOrAdmin && !isOwnBranch)
                            return false;
                    }

                    // Tab filter
                    if (tab != null && !tab.isBlank() && !"ALL".equalsIgnoreCase(tab.trim())) {
                        String t = tab.trim().toUpperCase();
                        if ("REQUESTS".equals(t) || "ACCESS_REQUESTS".equals(t)) {
                            boolean isReview = "REVIEW".equalsIgnoreCase(u.getStatus())
                                    || computeAccessHealthScore(u) < 85;
                            if (!isReview)
                                return false;
                        } else if ("SUSPENDED".equals(t)) {
                            boolean isSuspended = !Boolean.TRUE.equals(u.getActive())
                                    || "SUSPENDED".equalsIgnoreCase(u.getStatus());
                            if (!isSuspended)
                                return false;
                        }
                    }

                    // Active filter (null-safe)
                    if (activeFilter != null && !activeFilter.equals(u.getActive()))
                        return false;

                    // Role filter
                    if (finalRole != null && u.getRole() != finalRole)
                        return false;

                    // Branch filter
                    if (branchFilter != null && !branchFilter.isBlank()
                            && !"ALL".equalsIgnoreCase(branchFilter.trim())) {
                        String bf = branchFilter.trim().toLowerCase();
                        boolean matchesAssigned = u.getAssignedBranch() != null
                                && u.getAssignedBranch().toLowerCase().contains(bf);
                        boolean matchesAllowed = u.getAllowedBranches() != null
                                && u.getAllowedBranches().toLowerCase().contains(bf);
                        if (!matchesAssigned && !matchesAllowed)
                            return false;
                    }

                    // Status filter
                    if (statusFilter != null && !statusFilter.isBlank()
                            && !"ALL".equalsIgnoreCase(statusFilter.trim())) {
                        String sf = statusFilter.trim().toUpperCase();
                        String uStatus = (u.getStatus() != null && !u.getStatus().isBlank())
                                ? u.getStatus().toUpperCase()
                                : (Boolean.TRUE.equals(u.getActive()) ? "ACTIVE" : "SUSPENDED");
                        if (!uStatus.equalsIgnoreCase(sf))
                            return false;
                    }

                    // Access Scope filter
                    if (scopeFilter != null && !scopeFilter.isBlank() && !"ALL".equalsIgnoreCase(scopeFilter.trim())) {
                        String scf = scopeFilter.trim().toLowerCase();
                        String uScope = u.getAccessScope() != null ? u.getAccessScope().toLowerCase() : "";
                        if (!uScope.contains(scf))
                            return false;
                    }

                    // Text search across username, fullName, email
                    if (searchLower != null) {
                        boolean matches = (u.getUsername() != null
                                && u.getUsername().toLowerCase().contains(searchLower)) ||
                                (u.getFullName() != null && u.getFullName().toLowerCase().contains(searchLower)) ||
                                (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)) ||
                                (u.getDesignation() != null && u.getDesignation().toLowerCase().contains(searchLower));
                        if (!matches)
                            return false;
                    }
                    return true;
                })
                .map(this::mapToSummary)
                .collect(Collectors.toList());
    }

    /**
     * Dynamic tenant-scoped KPI Statistics.
     */
    @Transactional(readOnly = true)
    public UserManagementDto.KpiStats getKpiStats() {
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        List<AppUser> userList = (companyId != null)
                ? userRepository.findByCompanyId(companyId)
                : userRepository.findAll();

        long total = userList.size();
        long active = userList.stream().filter(u -> Boolean.TRUE.equals(u.getActive())).count();
        long pending = userList.stream().filter(u -> "INVITED".equalsIgnoreCase(u.getStatus())
                || (!Boolean.TRUE.equals(u.getActive()) && u.getLastLogin() == null)).count();
        long adminLevel = userList.stream().filter(u -> u.getRole() == UserRole.OWNER || u.getRole() == UserRole.ADMIN
                || u.getRole() == UserRole.BRANCH_ADMIN).count();
        long elevated = userList.stream().filter(u -> u.getRole() == UserRole.OWNER || u.getRole() == UserRole.ADMIN
                || u.getApprovalLimit() == null
                || (u.getApprovalLimit() != null && u.getApprovalLimit().compareTo(new BigDecimal("50000")) >= 0))
                .count();
        long reviewDue = userList.stream()
                .filter(u -> "REVIEW".equalsIgnoreCase(u.getStatus()) || computeAccessHealthScore(u) < 85).count();

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long newUsersLastMonth = userList.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(thirtyDaysAgo)).count();
        String totalTrend = newUsersLastMonth > 0
                ? "↑ " + (newUsersLastMonth * 100 / Math.max(1, total)) + "% new users (30d)"
                : "Stable";
        long activePct = total > 0 ? (active * 100 / total) : 0;
        String activeTrend = activePct + "% of users active";
        String pendingTrend = pending > 0 ? pending + " pending invites" : "All invitations accepted";
        String adminTrend = adminLevel + " privileged roles";
        String elevatedTrend = elevated > 0 ? elevated + " with elevated limits" : "Standard baseline";
        String reviewTrend = reviewDue > 0 ? reviewDue + " requires audit" : "All reviews clear";

        return UserManagementDto.KpiStats.builder()
                .totalUsers(total)
                .totalUsersTrend(totalTrend)
                .activeUsers(active)
                .activeUsersTrend(activeTrend)
                .pendingInvites(pending)
                .pendingInvitesTrend(pendingTrend)
                .adminLevel(adminLevel)
                .adminLevelTrend(adminTrend)
                .elevatedAccess(elevated)
                .elevatedAccessTrend(elevatedTrend)
                .accessReviewDue(reviewDue)
                .accessReviewDueTrend(reviewTrend)
                .build();
    }

    /**
     * Returns a single user by UUID.
     */
    @Transactional(readOnly = true)
    public UserManagementDto.UserSummary getUser(UUID id) {
        AppUser user = findById(id);
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(user.getCompanyId())) {
            throw new IllegalArgumentException("User not found: " + id);
        }
        return mapToSummary(user);
    }

    /**
     * Returns full governance intelligence detail for the right-side detail panel.
     */
    @Transactional(readOnly = true)
    public UserManagementDto.UserDetail getUserDetail(UUID id) {
        AppUser user = findById(id);
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(user.getCompanyId())) {
            throw new IllegalArgumentException("User not found: " + id);
        }

        UserManagementDto.UserSummary summary = mapToSummary(user);
        List<String> modules = resolveAllowedModules(user);
        boolean isOwner = user.getRole() == UserRole.OWNER || user.getRole() == UserRole.ADMIN;
        boolean isBranchAdmin = user.getRole() == UserRole.BRANCH_ADMIN;

        // ─── Real Database-Backed Access Intelligence ───────────────────────────
        List<String> allowed = new java.util.ArrayList<>();
        List<String> denied = new java.util.ArrayList<>();

        // 1. Operational Clearance: Create Orders
        if (isOwner || modules.contains("orders.create") || modules.contains("orders")) {
            allowed.add("Can create and draft customer orders");
        } else {
            denied.add("Cannot create or draft customer orders");
        }

        // 2. Operational Clearance: Delete Orders
        if (isOwner || modules.contains("orders.delete")) {
            allowed.add("Can delete and cancel customer orders");
        } else {
            denied.add("Cannot delete or void customer orders");
        }

        // 3. Operational Clearance: View Financial Data
        if (isOwner || modules.contains("finance.view") || modules.contains("reports") || modules.contains("payments")) {
            allowed.add("Can view financial data, pricing & revenue");
        } else {
            denied.add("Cannot access financial reports or revenue data");
        }

        // 4. Fashion Atelier: Garments & Design Studio
        boolean hasFashion = isOwner || modules.stream().anyMatch(m -> m.equals("garments") || m.equals("designs") || m.equals("fabrics") || m.equals("measurements") || m.equals("collections"));
        if (hasFashion) {
            allowed.add("Can manage garment catalog and design atelier");
        } else {
            denied.add("Cannot access garment catalog or design studio");
        }

        // 5. Production & Quality Control
        boolean hasProduction = isOwner || modules.stream().anyMatch(m -> m.equals("production-room") || m.equals("quality-control") || m.equals("trials-alterations") || m.equals("job-cards"));
        if (hasProduction) {
            allowed.add("Can manage workshop production and QC sign-offs");
        } else {
            denied.add("Cannot access workshop production room or QC");
        }

        // 6. Inventory & Warehouse Stock
        boolean hasInventory = isOwner || modules.stream().anyMatch(m -> m.equals("stock") || m.equals("purchases") || m.equals("delivery"));
        if (hasInventory) {
            allowed.add("Can manage warehouse stock, materials & purchases");
        } else {
            denied.add("Cannot perform inventory stock adjustments or purchases");
        }

        // 7. Client CRM & Front Desk
        boolean hasCrm = isOwner || modules.stream().anyMatch(m -> m.equals("customers") || m.equals("appointments") || m.equals("enquiries"));
        if (hasCrm) {
            allowed.add("Can manage client appointments and CRM records");
        } else {
            denied.add("No access to client appointments or customer CRM");
        }

        // 8. Administration, Users & Settings
        boolean hasAdmin = isOwner || (isBranchAdmin && modules.contains("users-roles"));
        if (hasAdmin) {
            allowed.add("Can administer branch staff, users and security roles");
        } else {
            denied.add("Cannot administer users, security roles, or settings");
        }

        // 9. Purchase Order Approval Limits
        if (isOwner || user.getRole() == UserRole.ADMIN) {
            allowed.add("Purchase approval authority: Unlimited");
        } else if (user.getApprovalLimit() != null && user.getApprovalLimit().compareTo(BigDecimal.ZERO) > 0) {
            allowed.add("Purchase approval authority: Up to ₹" + formatLimitNumber(user.getApprovalLimit()));
        } else {
            denied.add("Cannot approve purchase orders (limit ₹0)");
        }

        // 10. Multi-Branch vs Single-Branch Scope
        boolean hasMultiBranch = isOwner || (user.getAllowedBranches() != null && user.getAllowedBranches().contains(",") && !user.getAllowedBranches().equals("[]"));
        if (hasMultiBranch) {
            allowed.add("Authorized for multi-branch location switching");
        } else if (!isOwner) {
            String lockedBranch = user.getAssignedBranch() != null && !user.getAssignedBranch().isBlank() ? user.getAssignedBranch() : "Assigned Branch";
            denied.add("Locked to single branch location (" + lockedBranch + ")");
        }

        // Authority & Approval Limits
        int discountPct = isOwner ? 25
                : (isBranchAdmin ? 15
                        : (user.getApprovalLimit() != null && user.getApprovalLimit().compareTo(BigDecimal.ZERO) > 0
                                ? 10
                                : 5));
        BigDecimal refundAmt = isOwner ? new BigDecimal("50000")
                : (isBranchAdmin ? new BigDecimal("10000") : new BigDecimal("5000"));
        BigDecimal poAmt = isOwner ? null : user.getApprovalLimit();
        BigDecimal stockAmt = isOwner ? new BigDecimal("100000")
                : (isBranchAdmin ? new BigDecimal("50000") : new BigDecimal("25000"));

        UserManagementDto.AuthorityLimitsDto authority = UserManagementDto.AuthorityLimitsDto.builder()
                .discountApprovalPercent(discountPct)
                .refundApproval(refundAmt)
                .refundApprovalFormatted("₹" + formatLimitNumber(refundAmt))
                .purchaseOrderApproval(poAmt)
                .purchaseOrderApprovalFormatted(poAmt == null ? "Unlimited" : "₹" + formatLimitNumber(poAmt))
                .stockAdjustment(stockAmt)
                .stockAdjustmentFormatted("₹" + formatLimitNumber(stockAmt))
                .orderCancellation(isOwner ? "Direct Execution" : "Manager Approval")
                .build();

        // Dynamic Branch Access Scopes from REAL branches in database
        List<com.fashionerp.branch.Branch> realBranches = (user.getCompanyId() != null)
                ? branchRepository.findByCompanyId(user.getCompanyId())
                : branchRepository.findAll();

        List<UserManagementDto.BranchAccessScopeDto> branchScopes = new java.util.ArrayList<>();
        List<String> allowedBranchList = resolveAllowedBranches(user);

        if (realBranches.isEmpty()) {
            branchScopes.add(UserManagementDto.BranchAccessScopeDto.builder()
                    .branchName(user.getAssignedBranch() != null ? user.getAssignedBranch() : "Primary Workspace")
                    .branchCode("MAIN")
                    .accessLevel("Full Access")
                    .badgeType("success")
                    .build());
        } else {
            for (com.fashionerp.branch.Branch b : realBranches) {
                String bName = b.getName();
                boolean isAssigned = (user.getAssignedBranch() != null
                        && user.getAssignedBranch().equalsIgnoreCase(bName));
                boolean isInAllowed = allowedBranchList.stream().anyMatch(ab -> ab.equalsIgnoreCase(bName)
                        || (b.getBranchCode() != null && ab.equalsIgnoreCase(b.getBranchCode())));

                String level;
                String badge;
                if (isOwner) {
                    level = "Full Access";
                    badge = "success";
                } else if (isAssigned) {
                    level = "Full Access";
                    badge = "success";
                } else if (isInAllowed) {
                    if (b.getType() != null && b.getType().toUpperCase().contains("PRODUCTION")) {
                        level = "Production Access";
                        badge = "warning";
                    } else if (b.getType() != null && b.getType().toUpperCase().contains("WAREHOUSE")) {
                        level = "Inventory Access";
                        badge = "accent";
                    } else {
                        level = "View Only";
                        badge = "info";
                    }
                } else {
                    level = "No Access";
                    badge = "danger";
                }

                branchScopes.add(UserManagementDto.BranchAccessScopeDto.builder()
                        .branchName(bName)
                        .branchCode(b.getBranchCode() != null ? b.getBranchCode() : "BRN")
                        .accessLevel(level)
                        .badgeType(badge)
                        .build());
            }
        }

        // Delegations from database
        List<UserDelegation> delegationList = delegationRepository.findByUserIdOrderByValidUntilAsc(user.getId());
        List<UserManagementDto.DelegationDto> delegations = delegationList.stream().map(d -> {
            long days = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), d.getValidUntil());
            return UserManagementDto.DelegationDto.builder()
                    .id(d.getId())
                    .title(d.getTitle())
                    .validUntil(d.getValidUntil())
                    .validUntilFormatted(d.getValidUntil().format(DateTimeFormatter.ofPattern("dd MMM yyyy, h:mm a")))
                    .expiresInDays((int) Math.max(0, days))
                    .grantedBy(d.getGrantedBy())
                    .description(d.getDescription())
                    .build();
        }).collect(Collectors.toList());

        // Access logs from database
        List<UserAccessLog> logList = accessLogRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<UserManagementDto.AccessLogDto> accessLogs;
        if (!logList.isEmpty()) {
            accessLogs = logList.stream().map(l -> UserManagementDto.AccessLogDto.builder()
                    .id(l.getId())
                    .actionType(l.getActionType())
                    .description(l.getDescription())
                    .location(l.getLocation())
                    .clientInfo(l.getClientInfo())
                    .createdAt(l.getCreatedAt())
                    .timeFormatted(formatRelativeTime(l.getCreatedAt()))
                    .isRecent(l.getCreatedAt().isAfter(LocalDateTime.now().minusHours(24)))
                    .build()).collect(Collectors.toList());
        } else {
            accessLogs = Collections.emptyList();
        }

        // Active sessions from database
        List<UserActiveSession> sessionList = activeSessionRepository.findByUserIdOrderByLastSeenAtDesc(user.getId());
        List<UserManagementDto.ActiveSessionDto> sessions;
        if (!sessionList.isEmpty()) {
            sessions = sessionList.stream().map(s -> UserManagementDto.ActiveSessionDto.builder()
                    .id(s.getId())
                    .device(s.getDevice())
                    .location(s.getLocation())
                    .lastSeenAt(s.getLastSeenAt())
                    .lastSeenFormatted(formatRelativeTime(s.getLastSeenAt()))
                    .isCurrent(s.getIsCurrent())
                    .build()).collect(Collectors.toList());
        } else {
            sessions = Collections.emptyList();
        }

        DateTimeFormatter joinedFmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        String joinedFormatted = (user.getCreatedAt() != null)
                ? "Joined " + user.getCreatedAt().format(joinedFmt)
                : "Active User";

        return UserManagementDto.UserDetail.builder()
                .summary(summary)
                .phone(user.getPhone() != null && !user.getPhone().isBlank() ? user.getPhone() : "—")
                .email(user.getEmail() != null && !user.getEmail().isBlank() ? user.getEmail() : "—")
                .joinedDate(user.getCreatedAt())
                .joinedDateFormatted(joinedFormatted)
                .permissionsAllowed(allowed)
                .permissionsDenied(denied)
                .allowedModules(modules)
                .riskLevel(user.getRiskLevel() != null ? user.getRiskLevel() : "LOW")
                .riskNotes(user.getRiskNotes() != null ? user.getRiskNotes()
                        : "No critical permission conflicts detected.")
                .authorityLimits(authority)
                .branchAccessScopes(branchScopes)
                .delegations(delegations)
                .recentActivities(accessLogs)
                .activeSessions(sessions)
                .build();
    }

    /**
     * Returns metadata for all available roles defined in the UserRole enum.
     * Prevents any hardcoding on frontend clients.
     * If caller is a Branch Admin, only subordinate roles they can provision are
     * returned.
     */
    public List<UserManagementDto.RoleInfo> getAvailableRoles() {
        boolean isBranchAdmin = com.fashionerp.common.TenantContext.isBranchAdmin();

        List<UserManagementDto.RoleInfo> subordinateRoles = List.of(
                UserManagementDto.RoleInfo.builder()
                        .name(UserRole.CUSTOM.name())
                        .displayName("Custom Atelier Role")
                        .description(
                                "Created by users as needed with custom job title / designation and tailored module access.")
                        .capabilities(List.of("Custom Job Title / Role", "Tailored Module Access",
                                "Flexible Atelier Permissions"))
                        .isSystemDefault(false)
                        .isCustom(true)
                        .build());

        if (isBranchAdmin) {
            return subordinateRoles;
        }

        List<UserManagementDto.RoleInfo> allRoles = new java.util.ArrayList<>();
        allRoles.add(UserManagementDto.RoleInfo.builder()
                .name(UserRole.OWNER.name())
                .displayName("Company Owner (Default System User)")
                .description(
                        "Default root user when company enters. Full enterprise ownership, multi-branch governance, and leadership.")
                .capabilities(List.of("Unlimited Company Authority", "Multi-Branch Oversight",
                        "Financial & System Setup", "Provision Branch Admins"))
                .isSystemDefault(true)
                .isCustom(false)
                .build());
        allRoles.add(UserManagementDto.RoleInfo.builder()
                .name(UserRole.BRANCH_ADMIN.name())
                .displayName("Branch Administrator (Default Branch User)")
                .description(
                        "Default root user when branch is created. Complete management authority over assigned branch operations and staff.")
                .capabilities(List.of("Assigned Branch Domain Authority", "Provision Branch Staff",
                        "Orders & Inventory Management", "Local Production & QC"))
                .isSystemDefault(true)
                .isCustom(false)
                .build());
        allRoles.addAll(subordinateRoles);
        return allRoles;
    }

    /**
     * Complete ERP module registry organized by section.
     * Prevents hardcoding on frontend clients.
     */
    public List<UserManagementDto.ModuleInfo> getModuleRegistry() {
        return List.of(
                // Overview
                UserManagementDto.ModuleInfo.builder().key("dashboard").label("Dashboard").section("Overview")
                        .icon("layout-dashboard").available(true).build(),

                // Front Office
                UserManagementDto.ModuleInfo.builder().key("enquiries").label("Enquiries").section("Front Office")
                        .icon("help-circle").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("appointments").label("Appointments").section("Front Office")
                        .icon("calendar").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("customers").label("Customers").section("Front Office")
                        .icon("users").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("orders").label("Orders").section("Front Office")
                        .icon("shopping-bag").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("payments").label("Payments").section("Front Office")
                        .icon("credit-card").available(true).build(),

                // Fashion
                UserManagementDto.ModuleInfo.builder().key("garments").label("Garments").section("Fashion")
                        .icon("scissors").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("designs").label("Designs").section("Fashion")
                        .icon("palette").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("measurements").label("Measurements").section("Fashion")
                        .icon("ruler").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("fabrics").label("Fabrics & Materials").section("Fashion")
                        .icon("layers").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("collections").label("Collections").section("Fashion")
                        .icon("sparkles").available(true).build(),

                // Production
                UserManagementDto.ModuleInfo.builder().key("production-room").label("Production Room")
                        .section("Production").icon("activity").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("job-cards").label("Job Cards").section("Production")
                        .icon("clipboard-list").available(false).build(),
                UserManagementDto.ModuleInfo.builder().key("trials-alterations").label("Trials & Alterations")
                        .section("Production").icon("refresh-cw").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("quality-control").label("Quality Control")
                        .section("Production").icon("check-circle-2").available(true).build(),

                // Inventory
                UserManagementDto.ModuleInfo.builder().key("stock").label("Stock & Materials").section("Inventory")
                        .icon("boxes").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("purchases").label("Purchases").section("Inventory")
                        .icon("shopping-cart").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("delivery").label("Delivery").section("Inventory")
                        .icon("truck").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("suppliers").label("Suppliers").section("Inventory")
                        .icon("truck").available(false).build(),

                // Business
                UserManagementDto.ModuleInfo.builder().key("reports").label("Reports & Analytics").section("Business")
                        .icon("bar-chart-3").available(false).build(),
                UserManagementDto.ModuleInfo.builder().key("expenses").label("Expenses").section("Business")
                        .icon("wallet").available(false).build(),
                UserManagementDto.ModuleInfo.builder().key("profitability").label("Profitability").section("Business")
                        .icon("trending-up").available(false).build(),

                // Communication
                UserManagementDto.ModuleInfo.builder().key("whatsapp").label("WhatsApp").section("Communication")
                        .icon("message-circle").available(false).build(),
                UserManagementDto.ModuleInfo.builder().key("campaigns").label("Campaigns").section("Communication")
                        .icon("megaphone").available(false).build(),

                // Administration
                UserManagementDto.ModuleInfo.builder().key("employees").label("Employees").section("Administration")
                        .icon("user-check").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("branches").label("Branches").section("Administration")
                        .icon("git-branch").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("users-roles").label("Users & Roles")
                        .section("Administration").icon("shield-check").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("settings").label("Settings").section("Administration")
                        .icon("settings").available(true).build(),

                // Action & Operational Clearances
                UserManagementDto.ModuleInfo.builder().key("orders.create").label("Create Orders")
                        .section("Action Clearances").icon("shopping-bag").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("orders.delete").label("Delete Orders")
                        .section("Action Clearances").icon("trash-2").available(true).build(),
                UserManagementDto.ModuleInfo.builder().key("finance.view").label("View Financial Data")
                        .section("Action Clearances").icon("dollar-sign").available(true).build());
    }

    /**
     * Resolves default allowed modules for a given role enum.
     */
    public List<String> getDefaultModulesForRole(UserRole role) {
        if (role == null)
            return List.of();
        if (role == UserRole.OWNER || role == UserRole.ADMIN) {
            return getModuleRegistry().stream().map(m -> m.getKey()).collect(Collectors.toList());
        } else if (role == UserRole.BRANCH_ADMIN) {
            return List.of(
                    "dashboard", "enquiries", "appointments", "customers", "orders", "payments",
                    "orders.create",
                    "garments", "designs", "measurements", "fabrics", "collections",
                    "production-room", "job-cards", "trials-alterations", "quality-control",
                    "stock", "purchases", "delivery", "employees", "branches", "users-roles");
        }
        return List.of("dashboard");
    }

    // ─── Write ─────────────────────────────────────────────────────────────

    /**
     * Creates a new system user.
     * Enforces authority hierarchy: Company Owners can create any role; Branch
     * Admins can only create
     * subordinate roles within their assigned branch.
     */
    @Transactional
    public UserManagementDto.UserSummary createUser(UserManagementDto.CreateUserRequest req) {
        boolean isOwner = com.fashionerp.common.TenantContext.isCompanyOwner();
        boolean isBranchAdmin = com.fashionerp.common.TenantContext.isBranchAdmin();
        String callerBranch = com.fashionerp.common.TenantContext.getAssignedBranch();

        if (!isOwner && !isBranchAdmin) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Only Company Owners and Branch Admins can create users.");
        }

        // Username uniqueness check
        if (req.getUsername() == null || req.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (userRepository.existsByUsername(req.getUsername().trim())) {
            throw new IllegalArgumentException("Username already exists: " + req.getUsername().trim());
        }

        // Password validation
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }

        // Role validation
        if (req.getRole() == null || req.getRole().isBlank()) {
            throw new IllegalArgumentException("Role is required.");
        }
        UserRole role = UserRole.valueOf(req.getRole().trim().toUpperCase());

        // Domain hierarchy guardrails
        List<String> branchesToSet = (req.getAllowedBranches() != null)
                ? new java.util.ArrayList<>(req.getAllowedBranches())
                : new java.util.ArrayList<>();

        if (isBranchAdmin) {
            if (role == UserRole.OWNER || role == UserRole.ADMIN || role == UserRole.BRANCH_ADMIN) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Branch Admins cannot create Company Owner or Branch Admin accounts.");
            }
            // Lock user's branch to the Branch Admin's branch
            req.setAssignedBranch(callerBranch);
            branchesToSet = (callerBranch != null && !callerBranch.isBlank())
                    ? List.of(callerBranch.trim())
                    : List.of();
        } else {
            // Owner/Admin creating Branch Admin
            if (role == UserRole.BRANCH_ADMIN
                    && (req.getAssignedBranch() == null || req.getAssignedBranch().isBlank())) {
                throw new IllegalArgumentException("Assigned branch is required when creating a Branch Admin.");
            }
            if (branchesToSet.isEmpty()) {
                if (req.getAssignedBranch() != null && !req.getAssignedBranch().isBlank()) {
                    branchesToSet.add(req.getAssignedBranch().trim());
                }
            } else {
                if (req.getAssignedBranch() == null || req.getAssignedBranch().isBlank()) {
                    req.setAssignedBranch(branchesToSet.get(0));
                } else if (!branchesToSet.contains(req.getAssignedBranch().trim())) {
                    branchesToSet.add(req.getAssignedBranch().trim());
                }
            }
        }

        List<String> modulesToSet = req.getAllowedModules();
        if (modulesToSet == null) {
            modulesToSet = getDefaultModulesForRole(role);
        }

        UUID companyId = com.fashionerp.common.TenantContext.requireCompanyId();

        String scope = resolveDefaultAccessScope(role, req.getDesignation(), req.getAccessScope());

        AppUser user = AppUser.builder()
                .companyId(companyId)
                .username(req.getUsername().trim())
                .fullName(req.getFullName() != null ? req.getFullName().trim() : req.getUsername().trim())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .active(true)
                .email(req.getEmail() != null ? req.getEmail().trim() : null)
                .phone(req.getPhone() != null ? req.getPhone().trim() : null)
                .designation(req.getDesignation() != null ? req.getDesignation().trim() : null)
                .department(req.getDepartment() != null ? req.getDepartment().trim() : null)
                .assignedBranch(req.getAssignedBranch() != null ? req.getAssignedBranch().trim() : null)
                .allowedBranches(serializeBranches(branchesToSet))
                .allowedModules(serializeModules(modulesToSet))
                .accessScope(scope)
                .approvalLimit(req.getApprovalLimit())
                .avatarUrl(req.getAvatarUrl() != null && !req.getAvatarUrl().isBlank() ? req.getAvatarUrl().trim() : null)
                .status(req.getStatus() != null && !req.getStatus().isBlank() ? req.getStatus().trim() : "ACTIVE")
                .riskLevel(
                        req.getRiskLevel() != null && !req.getRiskLevel().isBlank() ? req.getRiskLevel().trim() : "LOW")
                .lastActiveAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        AppUser saved = userRepository.save(user);
        createProfileForUser(saved, modulesToSet);
        recordAccessLog(saved.getId(), "USER_CREATED", "Account created with role " + saved.getRole().name() + " (" + saved.getFullName() + ")", saved.getAssignedBranch(), "Admin Console");
        log.info("User created: username={}, role={}", saved.getUsername(), saved.getRole().name());
        return mapToSummary(saved);
    }

    /**
     * Updates an existing user.
     * Enforces branch and role authority boundaries.
     */
    @Transactional
    public UserManagementDto.UserSummary updateUser(UUID id, UserManagementDto.UpdateUserRequest req) {
        AppUser user = findById(id);
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(user.getCompanyId())) {
            throw new IllegalArgumentException("User not found: " + id);
        }

        boolean isOwner = com.fashionerp.common.TenantContext.isCompanyOwner();
        boolean isBranchAdmin = com.fashionerp.common.TenantContext.isBranchAdmin();
        String callerBranch = com.fashionerp.common.TenantContext.getAssignedBranch();

        if (!isOwner && !isBranchAdmin) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Only Company Owners and Branch Admins can modify users.");
        }

        if (isBranchAdmin) {
            // Cannot modify administrative accounts
            if (user.getRole() == UserRole.OWNER || user.getRole() == UserRole.ADMIN
                    || user.getRole() == UserRole.BRANCH_ADMIN) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Branch Admins cannot modify Owner, Admin, or Branch Admin accounts.");
            }
            // Must belong to caller's branch
            if (callerBranch == null || !callerBranch.equalsIgnoreCase(user.getAssignedBranch())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Branch Admins can only modify users within their assigned branch (" + callerBranch + ").");
            }
            // Lock branch assignment
            req.setAssignedBranch(callerBranch);
            req.setAllowedBranches(
                    (callerBranch != null && !callerBranch.isBlank()) ? List.of(callerBranch.trim()) : List.of());
            // Cannot promote to administrative role
            if (req.getRole() != null && !req.getRole().isBlank()) {
                UserRole targetRole = UserRole.valueOf(req.getRole().trim().toUpperCase());
                if (targetRole == UserRole.OWNER || targetRole == UserRole.ADMIN
                        || targetRole == UserRole.BRANCH_ADMIN) {
                    throw new org.springframework.security.access.AccessDeniedException(
                            "Branch Admins cannot promote users to Owner, Admin, or Branch Admin.");
                }
            }
        }

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            user.setFullName(req.getFullName().trim());
        }
        if (req.getEmail() != null) {
            user.setEmail(req.getEmail().isBlank() ? null : req.getEmail().trim());
        }
        if (req.getPhone() != null) {
            user.setPhone(req.getPhone().isBlank() ? null : req.getPhone().trim());
        }
        if (req.getDesignation() != null) {
            user.setDesignation(req.getDesignation().isBlank() ? null : req.getDesignation().trim());
        }
        if (req.getDepartment() != null) {
            user.setDepartment(req.getDepartment().isBlank() ? null : req.getDepartment().trim());
        }
        if (req.getAllowedBranches() != null) {
            user.setAllowedBranches(serializeBranches(req.getAllowedBranches()));
            if (!req.getAllowedBranches().isEmpty()) {
                if (user.getAssignedBranch() == null || !req.getAllowedBranches().contains(user.getAssignedBranch())) {
                    user.setAssignedBranch(req.getAllowedBranches().get(0));
                }
            }
        }
        if (req.getAssignedBranch() != null) {
            user.setAssignedBranch(req.getAssignedBranch().isBlank() ? null : req.getAssignedBranch().trim());
            List<String> currentAllowed = resolveAllowedBranches(user);
            if (user.getAssignedBranch() != null && !currentAllowed.contains(user.getAssignedBranch())) {
                List<String> updatedAllowed = new java.util.ArrayList<>(currentAllowed);
                updatedAllowed.add(user.getAssignedBranch());
                user.setAllowedBranches(serializeBranches(updatedAllowed));
            }
        }
        if (req.getAllowedModules() != null) {
            user.setAllowedModules(serializeModules(req.getAllowedModules()));
        }

        // Role update — enum-validated, no raw string
        if (req.getRole() != null && !req.getRole().isBlank()) {
            UserRole newRole = UserRole.valueOf(req.getRole().trim().toUpperCase());
            // Guard: cannot demote the last active OWNER or ADMIN
            if ((user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.OWNER)
                    && (newRole != UserRole.ADMIN && newRole != UserRole.OWNER)) {
                long activeAdminCount = (companyId != null)
                        ? userRepository.countByCompanyIdAndRoleInAndActiveTrue(companyId,
                                List.of(UserRole.ADMIN, UserRole.OWNER))
                        : userRepository.countByRoleInAndActiveTrue(List.of(UserRole.ADMIN, UserRole.OWNER));
                if (activeAdminCount <= 1) {
                    throw new IllegalArgumentException(
                            "Cannot change role: this is the only active owner/administrator for this company.");
                }
            }
            if (user.getRole() != newRole) {
                user.setRole(newRole);
                if (req.getAllowedModules() == null) {
                    user.setAllowedModules(serializeModules(getDefaultModulesForRole(newRole)));
                }
            }
        }

        // Password update — only if non-blank; minimum 6 characters
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            if (req.getPassword().length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters.");
            }
            user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }

        if (req.getAccessScope() != null && !req.getAccessScope().isBlank()) {
            user.setAccessScope(req.getAccessScope().trim());
        }
        if (req.getApprovalLimit() != null) {
            user.setApprovalLimit(req.getApprovalLimit());
        }
        if (req.getAvatarUrl() != null) {
            user.setAvatarUrl(req.getAvatarUrl().trim().isEmpty() ? null : req.getAvatarUrl().trim());
        }
        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            String st = req.getStatus().trim();
            user.setStatus(st);
            if ("SUSPENDED".equalsIgnoreCase(st) || "INACTIVE".equalsIgnoreCase(st)) {
                user.setActive(false);
            } else if ("ACTIVE".equalsIgnoreCase(st)) {
                user.setActive(true);
            }
        }
        if (req.getRiskLevel() != null && !req.getRiskLevel().isBlank()) {
            user.setRiskLevel(req.getRiskLevel().trim());
        }

        user.setUpdatedAt(LocalDateTime.now());
        AppUser saved = userRepository.save(user);

        // Keep user_profiles table in sync
        syncUserProfile(saved, req);

        recordAccessLog(saved.getId(), "USER_UPDATED", "Account details or permissions updated (" + saved.getFullName() + ")", saved.getAssignedBranch(), "Admin Console");
        log.info("User updated: id={}, username={}", saved.getId(), saved.getUsername());
        return mapToSummary(saved);
    }

    /**
     * Toggles a user's active flag (soft-activate / soft-deactivate).
     * Guards against deactivating the last active OWNER or ADMIN.
     */
    @Transactional
    public UserManagementDto.UserSummary toggleActive(UUID id) {
        AppUser user = findById(id);
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        if (companyId != null && !companyId.equals(user.getCompanyId())) {
            throw new IllegalArgumentException("User not found: " + id);
        }

        boolean isOwner = com.fashionerp.common.TenantContext.isCompanyOwner();
        boolean isBranchAdmin = com.fashionerp.common.TenantContext.isBranchAdmin();
        String callerBranch = com.fashionerp.common.TenantContext.getAssignedBranch();

        if (!isOwner && !isBranchAdmin) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Only Company Owners and Branch Admins can activate or deactivate users.");
        }

        if (isBranchAdmin) {
            if (user.getRole() == UserRole.OWNER || user.getRole() == UserRole.ADMIN
                    || user.getRole() == UserRole.BRANCH_ADMIN) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Branch Admins cannot activate or deactivate Owner, Admin, or Branch Admin accounts.");
            }
            if (callerBranch == null || !callerBranch.equalsIgnoreCase(user.getAssignedBranch())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Branch Admins can only modify users within their assigned branch.");
            }
        }

        boolean newActive = !Boolean.TRUE.equals(user.getActive());

        // Guard: cannot deactivate the last active OWNER or ADMIN
        if (!newActive && (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.OWNER)) {
            long activeAdminCount = (companyId != null)
                    ? userRepository.countByCompanyIdAndRoleInAndActiveTrue(companyId,
                            List.of(UserRole.ADMIN, UserRole.OWNER))
                    : userRepository.countByRoleInAndActiveTrue(List.of(UserRole.ADMIN, UserRole.OWNER));
            if (activeAdminCount <= 1) {
                throw new IllegalArgumentException(
                        "Cannot deactivate: this is the only active owner/administrator for this company.");
            }
        }

        user.setActive(newActive);
        user.setStatus(newActive ? "ACTIVE" : "SUSPENDED");
        user.setUpdatedAt(LocalDateTime.now());
        AppUser saved = userRepository.save(user);

        userProfileRepository.findByUserId(saved.getId()).ifPresent(p -> {
            p.setUpdatedAt(LocalDateTime.now());
            userProfileRepository.save(p);
        });

        log.info("User {} toggled active={}: id={}", saved.getUsername(), newActive, saved.getId());
        recordAccessLog(saved.getId(), newActive ? "USER_ACTIVATED" : "USER_SUSPENDED", "User account status toggled to " + (newActive ? "ACTIVE" : "SUSPENDED") + " (" + saved.getFullName() + ")", saved.getAssignedBranch(), "Admin Console");
        return mapToSummary(saved);
    }

    // ─── Profile Synchronization Helpers ────────────────────────────────────

    private void syncUserProfile(AppUser user, UserManagementDto.UpdateUserRequest req) {
        userProfileRepository.findByUserId(user.getId()).ifPresentOrElse(profile -> {
            if (user.getFullName() != null && !user.getFullName().isBlank()) {
                profile.setFullName(user.getFullName().trim());
            }
            if (user.getEmail() != null) {
                profile.setEmail(user.getEmail().trim());
            }
            if (user.getPhone() != null) {
                profile.setPhone(user.getPhone().trim());
            }
            if (user.getDesignation() != null) {
                profile.setDisplayTitle(user.getDesignation().trim());
            }
            if (user.getDepartment() != null) {
                profile.setDepartment(user.getDepartment().trim());
            }
            if (user.getAssignedBranch() != null) {
                profile.setAssignedBranch(user.getAssignedBranch().trim());
            }
            if (user.getBio() != null) {
                profile.setBio(user.getBio().trim());
            }
            if (user.getAvatarUrl() != null) {
                profile.setAvatarUrl(user.getAvatarUrl());
            }
            if (req != null && req.getRole() != null && !req.getRole().isBlank()) {
                profile.setClearanceLevel(deriveClearanceLevel(user.getRole()));
                profile.setSystemRoleLabel(deriveSystemRoleLabel(user.getRole()));
            }
            List<String> modules = resolveAllowedModules(user);
            profile.setPrivilegesSummary(derivePrivilegesSummary(modules));
            profile.setUpdatedAt(LocalDateTime.now());
            userProfileRepository.save(profile);
            log.info("Synchronized existing UserProfile for user: {}", user.getUsername());
        }, () -> {
            List<String> modules = resolveAllowedModules(user);
            createProfileForUser(user, modules);
            log.info("Created and synchronized new UserProfile for user: {}", user.getUsername());
        });
    }

    private UserProfile createProfileForUser(AppUser user, List<String> modules) {
        String joinDate = user.getCreatedAt() != null
                ? user.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM yyyy"))
                : LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM yyyy"));
        String encType = user.getPasswordHash() != null && user.getPasswordHash().startsWith("$2")
                ? "BCrypt (Cost Factor 12)"
                : "BCrypt";

        UserProfile profile = UserProfile.builder()
                .companyId(user.getCompanyId())
                .user(user)
                .fullName(user.getFullName() != null && !user.getFullName().isBlank()
                        ? user.getFullName().trim()
                        : user.getUsername())
                .displayTitle(user.getDesignation() != null ? user.getDesignation().trim() : "")
                .department(user.getDepartment() != null ? user.getDepartment().trim() : "")
                .email(user.getEmail() != null ? user.getEmail().trim() : "")
                .phone(user.getPhone() != null ? user.getPhone().trim() : "")
                .assignedBranch(user.getAssignedBranch() != null ? user.getAssignedBranch().trim() : "")
                .bio(user.getBio() != null ? user.getBio().trim() : "")
                .avatarUrl(user.getAvatarUrl())
                .clearanceLevel(deriveClearanceLevel(user.getRole()))
                .systemRoleLabel(deriveSystemRoleLabel(user.getRole()))
                .privilegesSummary(derivePrivilegesSummary(modules))
                .memberSince(joinDate)
                .tenureTier(
                        (user.getRole() == UserRole.OWNER || user.getRole() == UserRole.ADMIN) ? "Founding Leadership"
                                : (user.getRole() == UserRole.BRANCH_ADMIN ? "Branch Leadership" : "Atelier Staff"))
                .securityStatus(encType)
                .sessionLifetime("24 Hours (Stateless JWT)")
                .emergencyContact(null)
                .workShift((user.getRole() == UserRole.OWNER || user.getRole() == UserRole.ADMIN) ? "Executive Hours"
                        : (user.getRole() == UserRole.BRANCH_ADMIN ? "Branch Operations (09:30 AM - 08:00 PM)"
                                : "Standard Atelier (10:00 AM - 7:00 PM)"))
                .build();
        return userProfileRepository.save(profile);
    }

    private String deriveClearanceLevel(UserRole role) {
        if (role == UserRole.OWNER || role == UserRole.ADMIN)
            return "Level 5 Clearance";
        if (role == UserRole.BRANCH_ADMIN)
            return "Level 4 Clearance";
        return "Level 3 Clearance";
    }

    private String deriveSystemRoleLabel(UserRole role) {
        if (role == UserRole.OWNER)
            return "COMPANY OWNER (DEFAULT ROOT)";
        if (role == UserRole.ADMIN)
            return "COMPANY ADMINISTRATOR (SYSTEM ADMIN)";
        if (role == UserRole.BRANCH_ADMIN)
            return "BRANCH ADMINISTRATOR (DEFAULT BRANCH ROOT)";
        if (role == UserRole.CUSTOM)
            return "BESPOKE USER ROLE";
        return (role != null) ? role.name() : "USER ROLE";
    }

    private String derivePrivilegesSummary(List<String> modules) {
        if (modules == null || modules.isEmpty())
            return "0 Modules Active";
        long count = modules.stream().filter(m -> m != null && !m.isBlank()).distinct().count();
        int total = getModuleRegistry().size();
        if (count >= total) {
            return "All " + total + " Modules Unlocked";
        }
        return count + " Modules Active";
    }

    // ─── Private Helpers ───────────────────────────────────────────────────

    private AppUser findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    public static String resolveDefaultAccessScope(UserRole role, String designation, String requestedScope) {
        if (requestedScope != null && !requestedScope.isBlank()) {
            return requestedScope.trim();
        }
        if (role == UserRole.OWNER || role == UserRole.ADMIN) {
            return "Full System";
        }
        if (role == UserRole.BRANCH_ADMIN) {
            return "Branch + Production";
        }
        if (designation != null && !designation.isBlank()) {
            String d = designation.toLowerCase();
            if (d.contains("production")) return "Production Only";
            if (d.contains("sales")) return "Customers + Orders";
            if (d.contains("account") || d.contains("finance")) return "Finance + Purchases";
            if (d.contains("inventory") || d.contains("stock")) return "Inventory Only";
            if (d.contains("qc") || d.contains("quality")) return "QC + Production";
            if (d.contains("purchase")) return "Purchases Only";
            if (d.contains("design")) return "Designs + Samples";
        }
        return "Full System";
    }

    private static List<String> parseJsonStringArray(String json) {
        if (json == null || json.isBlank()) return new java.util.ArrayList<>();
        String trimmed = json.trim();
        List<String> result = new java.util.ArrayList<>();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("\"([^\"]*)\"|'([^']*)'").matcher(trimmed);
            while (m.find()) {
                String val = m.group(1) != null ? m.group(1) : m.group(2);
                if (val != null && !val.isBlank() && !result.contains(val.trim())) {
                    result.add(val.trim());
                }
            }
            if (!result.isEmpty()) {
                return result;
            }
            trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
        }
        if (trimmed.isEmpty()) return result;
        for (String part : trimmed.split(",")) {
            String clean = part.replace("\"", "").replace("'", "").replace("[", "").replace("]", "").replace("{", "").replace("}", "").trim();
            if (!clean.isBlank() && !result.contains(clean)) {
                result.add(clean);
            }
        }
        return result;
    }

    private String serializeModules(List<String> modules) {
        if (modules == null || modules.isEmpty()) return "[]";
        return "[" + modules.stream()
                .filter(m -> m != null && !m.isBlank())
                .distinct()
                .map(m -> "\"" + m.trim().replace("\\", "\\\\").replace("\"", "\\\"") + "\"")
                .collect(Collectors.joining(",")) + "]";
    }

    private List<String> deserializeModules(String json) {
        return parseJsonStringArray(json);
    }

    public static String serializeBranches(List<String> branches) {
        if (branches == null || branches.isEmpty()) return "[]";
        return "[" + branches.stream()
                .filter(b -> b != null && !b.isBlank())
                .distinct()
                .map(b -> "\"" + b.trim().replace("\\", "\\\\").replace("\"", "\\\"") + "\"")
                .collect(Collectors.joining(",")) + "]";
    }

    public static List<String> deserializeBranches(String json) {
        return parseJsonStringArray(json);
    }

    public static List<String> resolveAllowedBranches(AppUser user) {
        List<String> branches = deserializeBranches(user.getAllowedBranches());
        if (branches.isEmpty() && user.getAssignedBranch() != null && !user.getAssignedBranch().isBlank()) {
            return List.of(user.getAssignedBranch().trim());
        }
        return branches;
    }

    private List<String> resolveAllowedModules(AppUser user) {
        List<String> modules = deserializeModules(user.getAllowedModules());
        if (modules == null && user.getRole() != null) {
            return getDefaultModulesForRole(user.getRole());
        }
        return modules != null ? modules : new java.util.ArrayList<>();
    }

    /**
     * Maps AppUser entity to UserSummary DTO.
     * All values derived from entity fields — passwordHash is never included.
     */
    public int computeAccessHealthScore(AppUser user) {
        int score = 40;
        if (Boolean.TRUE.equals(user.getActive()))
            score += 20;
        if (user.getEmail() != null && !user.getEmail().isBlank())
            score += 10;
        if (user.getPhone() != null && !user.getPhone().isBlank())
            score += 10;
        if (user.getLastLogin() != null) {
            if (user.getLastLogin().isAfter(LocalDateTime.now().minusDays(7)))
                score += 15;
            else if (user.getLastLogin().isAfter(LocalDateTime.now().minusDays(30)))
                score += 10;
            else
                score += 5;
        } else if (Boolean.TRUE.equals(user.getActive())) {
            score += 5;
        }
        if (user.getAssignedBranch() != null && !user.getAssignedBranch().isBlank())
            score += 5;
        return Math.min(100, Math.max(0, score));
    }

    private String formatApprovalLimit(BigDecimal limit, UserRole role) {
        if (role == UserRole.OWNER || role == UserRole.ADMIN || limit == null) {
            return "Unlimited";
        }
        if (limit.compareTo(BigDecimal.ZERO) == 0) {
            return "None";
        }
        return "₹" + formatLimitNumber(limit);
    }

    private String formatLimitNumber(BigDecimal amt) {
        if (amt == null)
            return "0";
        long val = amt.longValue();
        java.text.NumberFormat nf = java.text.NumberFormat.getInstance(java.util.Locale.forLanguageTag("en-IN"));
        return nf.format(val);
    }

    private String formatRelativeTime(LocalDateTime dt) {
        if (dt == null)
            return "Never";
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(dt, now).toMinutes();
        if (minutes < 0)
            minutes = 0;
        if (minutes < 2)
            return "Now";
        if (minutes < 60)
            return minutes + " min ago";
        long hours = minutes / 60;
        if (hours < 24)
            return (hours == 1 ? "1 hr ago" : hours + " hrs ago");
        long days = hours / 24;
        if (days == 1)
            return "Yesterday";
        if (days < 7)
            return days + " days ago";
        return dt.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
    }

    private UserManagementDto.UserSummary mapToSummary(AppUser user) {
        List<String> modules = resolveAllowedModules(user);
        List<String> branches = resolveAllowedBranches(user);

        String scope = resolveDefaultAccessScope(user.getRole(), user.getDesignation(), user.getAccessScope());

        int healthScore = (user.getAccessHealthScore() != null)
                ? user.getAccessHealthScore()
                : computeAccessHealthScore(user);

        BigDecimal approvalLimit = user.getApprovalLimit();
        String limitFormatted = formatApprovalLimit(approvalLimit, user.getRole());

        String status = (user.getStatus() != null && !user.getStatus().isBlank())
                ? user.getStatus()
                : (Boolean.TRUE.equals(user.getActive()) ? "ACTIVE" : "SUSPENDED");
        if (!Boolean.TRUE.equals(user.getActive()) && "ACTIVE".equalsIgnoreCase(status)) {
            status = "SUSPENDED";
        }

        LocalDateTime lastActive = (user.getLastActiveAt() != null)
                ? user.getLastActiveAt()
                : (user.getLastLogin() != null ? user.getLastLogin() : user.getUpdatedAt());
        String lastActiveFormatted = formatRelativeTime(lastActive);

        return UserManagementDto.UserSummary.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName() != null && !user.getFullName().isBlank()
                        ? user.getFullName().trim()
                        : user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .active(user.getActive())
                .designation(user.getDesignation())
                .department(user.getDepartment())
                .assignedBranch(user.getAssignedBranch())
                .allowedBranches(branches)
                .avatarUrl(user.getAvatarUrl())
                .allowedModules(modules)
                .lastLogin(user.getLastLogin())
                .accessScope(scope)
                .approvalLimit(approvalLimit)
                .approvalLimitFormatted(limitFormatted)
                .accessHealthScore(healthScore)
                .status(status)
                .lastActiveAt(lastActive)
                .lastActiveFormatted(lastActiveFormatted)
                .riskLevel(user.getRiskLevel() != null ? user.getRiskLevel() : "LOW")
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    /**
     * Records a live enterprise access / audit event.
     */
    public void recordAccessLog(UUID userId, String actionType, String description, String location, String clientInfo) {
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        if (companyId == null || userId == null || accessLogRepository == null) return;
        try {
            accessLogRepository.save(UserAccessLog.builder()
                    .companyId(companyId)
                    .userId(userId)
                    .actionType(actionType != null ? actionType : "AUDIT")
                    .description(description != null ? description : "Security audit event")
                    .location(location != null ? location : "System")
                    .clientInfo(clientInfo != null ? clientInfo : "ERP Core")
                    .createdAt(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to record access log: {}", e.getMessage());
        }
    }

    /**
     * Returns paginated, searchable access logs for the tenant company.
     */
    @Transactional(readOnly = true)
    public UserManagementDto.AccessLogPageResponse listAccessLogs(int page, int size, String actionType, UUID userId, String search) {
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        if (companyId == null) {
            return UserManagementDto.AccessLogPageResponse.builder()
                    .items(Collections.emptyList())
                    .totalElements(0)
                    .totalPages(0)
                    .currentPage(page)
                    .pageSize(size)
                    .build();
        }

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by("createdAt").descending());
        String normalizedAction = (actionType != null && !actionType.isBlank() && !"ALL".equalsIgnoreCase(actionType.trim()))
                ? actionType.trim().toUpperCase() : null;
        String normalizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<UserAccessLog> logPage;
        if (normalizedSearch == null && normalizedAction == null && userId == null) {
            logPage = accessLogRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, pageable);
        } else {
            logPage = accessLogRepository.searchLogs(companyId, userId, normalizedAction, normalizedSearch, pageable);
        }

        Map<UUID, AppUser> userCache = new HashMap<>();

        List<UserManagementDto.AccessLogDto> dtos = logPage.getContent().stream().map(l -> {
            AppUser u = userCache.computeIfAbsent(l.getUserId(), uid -> userRepository.findById(uid).orElse(null));
            String name = u != null ? u.getFullName() : "User " + l.getUserId().toString().substring(0, 8);
            String email = u != null ? u.getEmail() : "—";
            String role = (u != null && u.getRole() != null) ? u.getRole().name() : "USER";

            String act = l.getActionType() != null ? l.getActionType() : "EVENT";
            String severity = "INFO";
            if (act.contains("SUSPEND") || act.contains("FAIL") || act.contains("ALERT")) {
                severity = "CRITICAL";
            } else if (act.contains("ROLE") || act.contains("ELEVAT") || act.contains("PASSWORD") || act.contains("LIMIT") || act.contains("UPDATE")) {
                severity = "WARNING";
            }

            return UserManagementDto.AccessLogDto.builder()
                    .id(l.getId())
                    .userId(l.getUserId())
                    .userName(name)
                    .userEmail(email)
                    .userRole(role)
                    .actionType(act)
                    .description(l.getDescription())
                    .location(l.getLocation() != null ? l.getLocation() : "Terminal")
                    .clientInfo(l.getClientInfo() != null ? l.getClientInfo() : "Browser")
                    .createdAt(l.getCreatedAt())
                    .timeFormatted(formatRelativeTime(l.getCreatedAt()))
                    .severity(severity)
                    .isRecent(l.getCreatedAt() != null && l.getCreatedAt().isAfter(LocalDateTime.now().minusHours(2)))
                    .build();
        }).collect(Collectors.toList());

        return UserManagementDto.AccessLogPageResponse.builder()
                .items(dtos)
                .totalElements(logPage.getTotalElements())
                .totalPages(logPage.getTotalPages())
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    /**
     * Returns aggregate KPI metrics for the Recent Access audit dashboard.
     */
    @Transactional(readOnly = true)
    public UserManagementDto.AccessLogStats getAccessLogStats() {
        UUID companyId = com.fashionerp.common.TenantContext.getCompanyId();
        if (companyId == null) {
            return UserManagementDto.AccessLogStats.builder().build();
        }

        long total = accessLogRepository.countByCompanyId(companyId);
        LocalDateTime past24h = LocalDateTime.now().minusHours(24);
        long loginsToday = accessLogRepository.countByCompanyIdAndActionTypeAndCreatedAtAfter(companyId, "LOGIN", past24h);
        long roleUpdates = accessLogRepository.countByCompanyIdAndActionType(companyId, "ROLE_UPDATE")
                + accessLogRepository.countByCompanyIdAndActionType(companyId, "USER_CREATED")
                + accessLogRepository.countByCompanyIdAndActionType(companyId, "USER_UPDATED");
        long securityAlerts = accessLogRepository.countByCompanyIdAndActionType(companyId, "USER_SUSPENDED")
                + accessLogRepository.countByCompanyIdAndActionType(companyId, "FAILED_LOGIN");

        long locations = 0;
        try {
            locations = branchRepository.countByCompanyId(companyId);
        } catch (Exception ignored) {}

        return UserManagementDto.AccessLogStats.builder()
                .totalEvents(total)
                .loginsToday(loginsToday)
                .elevatedEvents(roleUpdates)
                .securityAlerts(securityAlerts)
                .activeLocationsCount(locations)
                .build();
    }
}
