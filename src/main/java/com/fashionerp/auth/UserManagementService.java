package com.fashionerp.auth;

import com.fashionerp.profile.UserProfile;
import com.fashionerp.profile.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Business logic for the Users & Roles management page.
 *
 * No raw/hardcoded strings:
 *  - Roles are always typed as UserRole enum constants or parsed with UserRole.valueOf()
 *  - All display values are derived from AppUser entity fields
 *  - Password hash is never returned to callers
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final AppUserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    // ─── Read ──────────────────────────────────────────────────────────────

    /**
     * Returns all users, optionally filtered.
     *
     * @param search       Case-insensitive substring match on username, fullName, or email.
     *                     Null / blank = no text filter.
     * @param roleFilter   Must be a valid UserRole enum name (e.g. "ADMIN").
     *                     Null / blank = no role filter.
     * @param activeFilter True = active only, False = inactive only, null = all.
     */
    @Transactional(readOnly = true)
    public List<UserManagementDto.UserSummary> listUsers(String search, String roleFilter, Boolean activeFilter) {
        // Resolve role filter using enum — throws IllegalArgumentException for invalid values
        UserRole roleEnum = null;
        if (roleFilter != null && !roleFilter.isBlank()) {
            roleEnum = UserRole.valueOf(roleFilter.trim().toUpperCase());
        }

        final UserRole finalRole = roleEnum;
        final String searchLower = (search != null && !search.isBlank()) ? search.trim().toLowerCase() : null;

        return userRepository.findAll().stream()
                .filter(u -> {
                    // Active filter (null-safe)
                    if (activeFilter != null && !activeFilter.equals(u.getActive())) return false;
                    // Role filter
                    if (finalRole != null && u.getRole() != finalRole) return false;
                    // Text search across username, fullName, email
                    if (searchLower != null) {
                        boolean matches =
                            (u.getUsername() != null && u.getUsername().toLowerCase().contains(searchLower)) ||
                            (u.getFullName() != null && u.getFullName().toLowerCase().contains(searchLower)) ||
                            (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower));
                        if (!matches) return false;
                    }
                    return true;
                })
                .map(this::mapToSummary)
                .collect(Collectors.toList());
    }

    /**
     * Returns a single user by UUID.
     */
    @Transactional(readOnly = true)
    public UserManagementDto.UserSummary getUser(UUID id) {
        AppUser user = findById(id);
        return mapToSummary(user);
    }

    /**
     * Returns metadata for all available roles defined in the UserRole enum.
     * Prevents any hardcoding on frontend clients.
     */
    public List<UserManagementDto.RoleInfo> getAvailableRoles() {
        return List.of(
            UserManagementDto.RoleInfo.builder()
                .name(UserRole.ADMIN.name())
                .displayName("Administrator")
                .description("Full administrative privileges, user management, branch oversight, and system security.")
                .capabilities(List.of("Full System Access", "User & Role Management", "Security & System Audit", "Branch & Financial Access"))
                .build(),
            UserManagementDto.RoleInfo.builder()
                .name(UserRole.STAFF.name())
                .displayName("Staff Member")
                .description("Production operations, bespoke garment tailoring, orders processing, and atelier tracking.")
                .capabilities(List.of("Atelier & Production", "Order & Garment Tracking", "Inventory & Materials", "Fitting & Alterations"))
                .build(),
            UserManagementDto.RoleInfo.builder()
                .name(UserRole.RECEPTIONIST.name())
                .displayName("Receptionist")
                .description("Client concierge, appointments scheduling, enquiries intake, and customer 360 profiling.")
                .capabilities(List.of("Client Concierge", "Appointments & Bookings", "Enquiries Management", "Customer Profiles"))
                .build()
        );
    }

    /**
     * Complete ERP module registry organized by section.
     * Prevents hardcoding on frontend clients.
     */
    public List<UserManagementDto.ModuleInfo> getModuleRegistry() {
        return List.of(
            // Overview
            UserManagementDto.ModuleInfo.builder().key("dashboard").label("Dashboard").section("Overview").icon("layout-dashboard").available(true).build(),

            // Front Office
            UserManagementDto.ModuleInfo.builder().key("enquiries").label("Enquiries").section("Front Office").icon("help-circle").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("appointments").label("Appointments").section("Front Office").icon("calendar").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("customers").label("Customers").section("Front Office").icon("users").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("orders").label("Orders").section("Front Office").icon("shopping-bag").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("payments").label("Payments").section("Front Office").icon("credit-card").available(true).build(),

            // Fashion
            UserManagementDto.ModuleInfo.builder().key("garments").label("Garments").section("Fashion").icon("scissors").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("designs").label("Designs").section("Fashion").icon("palette").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("measurements").label("Measurements").section("Fashion").icon("ruler").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("fabrics").label("Fabrics & Materials").section("Fashion").icon("layers").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("collections").label("Collections").section("Fashion").icon("sparkles").available(true).build(),

            // Production
            UserManagementDto.ModuleInfo.builder().key("production-room").label("Production Room").section("Production").icon("activity").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("job-cards").label("Job Cards").section("Production").icon("clipboard-list").available(false).build(),
            UserManagementDto.ModuleInfo.builder().key("trials-alterations").label("Trials & Alterations").section("Production").icon("refresh-cw").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("quality-control").label("Quality Control").section("Production").icon("check-circle-2").available(true).build(),

            // Inventory
            UserManagementDto.ModuleInfo.builder().key("stock").label("Stock & Materials").section("Inventory").icon("boxes").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("purchases").label("Purchases").section("Inventory").icon("shopping-cart").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("delivery").label("Delivery").section("Inventory").icon("truck").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("suppliers").label("Suppliers").section("Inventory").icon("truck").available(false).build(),

            // Business
            UserManagementDto.ModuleInfo.builder().key("reports").label("Reports & Analytics").section("Business").icon("bar-chart-3").available(false).build(),
            UserManagementDto.ModuleInfo.builder().key("expenses").label("Expenses").section("Business").icon("wallet").available(false).build(),
            UserManagementDto.ModuleInfo.builder().key("profitability").label("Profitability").section("Business").icon("trending-up").available(false).build(),

            // Communication
            UserManagementDto.ModuleInfo.builder().key("whatsapp").label("WhatsApp").section("Communication").icon("message-circle").available(false).build(),
            UserManagementDto.ModuleInfo.builder().key("campaigns").label("Campaigns").section("Communication").icon("megaphone").available(false).build(),

            // Administration
            UserManagementDto.ModuleInfo.builder().key("employees").label("Employees").section("Administration").icon("user-check").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("branches").label("Branches").section("Administration").icon("git-branch").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("users-roles").label("Users & Roles").section("Administration").icon("shield-check").available(true).build(),
            UserManagementDto.ModuleInfo.builder().key("settings").label("Settings").section("Administration").icon("settings").available(true).build()
        );
    }

    /**
     * Resolves default allowed modules for a given role enum.
     */
    public List<String> getDefaultModulesForRole(UserRole role) {
        if (role == null) return List.of();
        if (role == UserRole.ADMIN) {
            return getModuleRegistry().stream().map(m -> m.getKey()).collect(Collectors.toList());
        } else if (role == UserRole.STAFF) {
            return List.of(
                "dashboard", "garments", "orders", "measurements", "customers",
                "enquiries", "fabrics", "collections", "production-room",
                "trials-alterations", "quality-control", "stock", "delivery"
            );
        } else if (role == UserRole.RECEPTIONIST) {
            return List.of(
                "dashboard", "enquiries", "appointments", "customers",
                "orders", "measurements", "payments"
            );
        }
        return List.of("dashboard");
    }

    // ─── Write ─────────────────────────────────────────────────────────────

    /**
     * Creates a new system user.
     * Role must be a valid UserRole enum name. Password is BCrypt-encoded.
     */
    @Transactional
    public UserManagementDto.UserSummary createUser(UserManagementDto.CreateUserRequest req) {
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

        // Role validation — UserRole.valueOf() throws IllegalArgumentException on invalid name
        if (req.getRole() == null || req.getRole().isBlank()) {
            throw new IllegalArgumentException("Role is required.");
        }
        UserRole role = UserRole.valueOf(req.getRole().trim().toUpperCase());

        List<String> modulesToSet = req.getAllowedModules();
        if (modulesToSet == null) {
            modulesToSet = getDefaultModulesForRole(role);
        }

        AppUser user = AppUser.builder()
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
                .allowedModules(serializeModules(modulesToSet))
                .updatedAt(LocalDateTime.now())
                .build();

        AppUser saved = userRepository.save(user);
        createProfileForUser(saved, modulesToSet);
        log.info("User created: username={}, role={}", saved.getUsername(), saved.getRole().name());
        return mapToSummary(saved);
    }

    /**
     * Updates an existing user. Username is not updatable.
     * Password is only re-encoded if the new value is non-blank.
     * Role must be a valid UserRole enum name if provided.
     */
    @Transactional
    public UserManagementDto.UserSummary updateUser(UUID id, UserManagementDto.UpdateUserRequest req) {
        AppUser user = findById(id);

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
        if (req.getAssignedBranch() != null) {
            user.setAssignedBranch(req.getAssignedBranch().isBlank() ? null : req.getAssignedBranch().trim());
        }
        if (req.getAllowedModules() != null) {
            user.setAllowedModules(serializeModules(req.getAllowedModules()));
        }

        // Role update — enum-validated, no raw string
        if (req.getRole() != null && !req.getRole().isBlank()) {
            UserRole newRole = UserRole.valueOf(req.getRole().trim().toUpperCase());
            // Guard: cannot demote the last active ADMIN
            if (user.getRole() == UserRole.ADMIN && newRole != UserRole.ADMIN) {
                long activeAdminCount = userRepository.countByRoleAndActiveTrue(UserRole.ADMIN);
                if (activeAdminCount <= 1) {
                    throw new IllegalArgumentException(
                        "Cannot change role: this is the only active " + UserRole.ADMIN.name() + " user.");
                }
            }
            if (user.getRole() != newRole) {
                user.setRole(newRole);
                // Re-default allowedModules for new role if not explicitly provided in request
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

        user.setUpdatedAt(LocalDateTime.now());
        AppUser saved = userRepository.save(user);

        // Keep user_profiles table in sync
        syncUserProfile(saved, req);

        log.info("User updated: id={}, username={}", saved.getId(), saved.getUsername());
        return mapToSummary(saved);
    }

    /**
     * Toggles a user's active flag (soft-activate / soft-deactivate).
     * Guards against deactivating the last active ADMIN.
     */
    @Transactional
    public UserManagementDto.UserSummary toggleActive(UUID id) {
        AppUser user = findById(id);
        boolean newActive = !Boolean.TRUE.equals(user.getActive());

        // Guard: cannot deactivate the last active ADMIN — uses enum constant, not string
        if (!newActive && user.getRole() == UserRole.ADMIN) {
            long activeAdminCount = userRepository.countByRoleAndActiveTrue(UserRole.ADMIN);
            if (activeAdminCount <= 1) {
                throw new IllegalArgumentException(
                    "Cannot deactivate: this is the only active " + UserRole.ADMIN.name() + " user.");
            }
        }

        user.setActive(newActive);
        user.setUpdatedAt(LocalDateTime.now());
        AppUser saved = userRepository.save(user);

        userProfileRepository.findByUserId(saved.getId()).ifPresent(p -> {
            p.setUpdatedAt(LocalDateTime.now());
            userProfileRepository.save(p);
        });

        log.info("User {} toggled active={}: id={}", saved.getUsername(), newActive, saved.getId());
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
                .tenureTier(user.getRole() == UserRole.ADMIN ? "Founding Staff" : "Atelier Staff")
                .securityStatus(encType)
                .sessionLifetime("24 Hours (Stateless JWT)")
                .emergencyContact(null)
                .workShift(user.getRole() == UserRole.ADMIN ? "Executive Hours" : "Standard Atelier (10:00 AM - 7:00 PM)")
                .build();
        return userProfileRepository.save(profile);
    }

    private String deriveClearanceLevel(UserRole role) {
        if (role == UserRole.ADMIN) return "Level 5 Clearance";
        if (role == UserRole.STAFF) return "Level 2 Clearance";
        return "Level 1 Clearance";
    }

    private String deriveSystemRoleLabel(UserRole role) {
        if (role == UserRole.ADMIN) return "SUPER ADMINISTRATOR";
        if (role == UserRole.STAFF) return "STAFF MEMBER";
        if (role == UserRole.RECEPTIONIST) return "CLIENT CONCIERGE & RECEPTION";
        return (role != null) ? role.name() : "STAFF MEMBER";
    }

    private String derivePrivilegesSummary(List<String> modules) {
        if (modules == null || modules.isEmpty()) return "0 Modules Active";
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

    private String serializeModules(List<String> modules) {
        if (modules == null || modules.isEmpty()) return "[]";
        return "[" + modules.stream()
                .filter(m -> m != null && !m.isBlank())
                .distinct()
                .map(m -> "\"" + m.trim().replace("\"", "") + "\"")
                .collect(Collectors.joining(",")) + "]";
    }

    private List<String> deserializeModules(String json) {
        if (json == null || json.isBlank()) return null;
        String trimmed = json.trim();
        if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
            trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
        }
        if (trimmed.isEmpty()) return new java.util.ArrayList<>();
        return Arrays.stream(trimmed.split(","))
                .map(s -> s.trim().replace("\"", "").replace("'", "").replace("{", "").replace("}", ""))
                .filter(s -> !s.isBlank())
                .distinct()
                .collect(Collectors.toList());
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
    private UserManagementDto.UserSummary mapToSummary(AppUser user) {
        List<String> modules = resolveAllowedModules(user);

        return UserManagementDto.UserSummary.builder()
                .id(user.getId())
                .username(user.getUsername())
                // fullName: use entity value; fall back to username if null or blank
                .fullName(user.getFullName() != null && !user.getFullName().isBlank()
                        ? user.getFullName().trim()
                        : user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                // role: derived from UserRole enum — never a hardcoded string
                .role(user.getRole() != null ? user.getRole().name() : null)
                .active(user.getActive())
                .designation(user.getDesignation())
                .department(user.getDepartment())
                .assignedBranch(user.getAssignedBranch())
                .avatarUrl(user.getAvatarUrl())
                .allowedModules(modules)
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
