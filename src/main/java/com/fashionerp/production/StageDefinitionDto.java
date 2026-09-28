package com.fashionerp.production;

import com.fashionerp.workforce.EmployeeDto;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class StageDefinitionDto {

    // ─── Request DTO ──────────────────────────────────────────────────────────
    @Getter
    @Setter
    public static class Request {
        /** User-friendly label — e.g. "Maggam Work" */
        private String displayName;

        /** Optional description of this stage */
        private String description;

        /**
         * Employee role required — must match values in employees.role
         * e.g. DESIGNER, TAILOR, CUTTER, EMBROIDERER, FINISHER, SUPERVISOR, MANAGER
         */
        private String requiredRole;

        /** Human-friendly department label — shown in modals */
        private String deptLabel;

        /**
         * CSS color token — one of:
         * dot-purple, dot-blue, dot-pink, dot-yellow, dot-green, dot-cyan, dot-coral, dot-silver
         */
        private String colorClass;

        /** Position in Kanban (1-based; auto-computed if null) */
        private Integer sortOrder;

        /** Whether this stage is active (visible in Kanban) */
        private Boolean active;

        /** Optional stage artwork/photo URL */
        private String imageUrl;
    }

    // ─── Reorder Request ──────────────────────────────────────────────────────
    @Getter
    @Setter
    public static class ReorderRequest {
        /** Ordered list of stage definition UUIDs */
        private List<UUID> ids;
    }

    // ─── Response DTO ─────────────────────────────────────────────────────────
    @Getter
    @Setter
    public static class Response {
        private UUID id;
        private String stageKey;
        private String displayName;
        private String description;
        private String requiredRole;
        private String deptLabel;
        private String colorClass;
        private int sortOrder;
        private boolean active;
        private String imageUrl;
        private long linkedOrderCount;        // number of active production_stages rows
        private List<EmployeeDto.Response> pinnedEmployees;
        private boolean systemFixed;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(StageDefinition s) {
            Response r = new Response();
            r.id           = s.getId();
            r.stageKey     = s.getStageKey();
            r.displayName  = s.getDisplayName();
            r.description  = s.getDescription();
            r.requiredRole = s.getRequiredRole();
            r.deptLabel    = s.getDeptLabel();
            r.colorClass   = s.getColorClass();
            r.sortOrder    = s.getSortOrder() != null ? s.getSortOrder() : 0;
            r.active       = Boolean.TRUE.equals(s.getActive());
            r.imageUrl     = s.getImageUrl();
            r.systemFixed  = "ORDER_TAKEN".equalsIgnoreCase(s.getStageKey()) || "READY_TO_DELIVER".equalsIgnoreCase(s.getStageKey());
            r.createdAt    = s.getCreatedAt();
            r.updatedAt    = s.getUpdatedAt();
            return r;
        }
    }
}
