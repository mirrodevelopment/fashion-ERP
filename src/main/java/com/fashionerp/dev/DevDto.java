package com.fashionerp.dev;

import lombok.*;
import java.util.List;
import java.util.UUID;

/**
 * Developer Tooling DTOs
 * Used by /api/v1/dev/personas to return live database records
 * of companies, branches, and staff personas for auto-login.
 */
public class DevDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CompanyPersonaResponse {
        private UUID companyId;
        private String companyName;
        private String shortName;
        private String city;
        private int branchCount;
        private boolean shareAcrossBranches;
        private List<BranchSummary> branches;
        private List<UserPersona> users;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BranchSummary {
        private UUID id;
        private String branchCode;
        private String name;
        private String city;
        private boolean isHeadquarters;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserPersona {
        private UUID id;
        private String username;
        private String fullName;
        private String role;
        private String designation;
        private String assignedBranch;
        private String branchName;
        private List<String> allowedBranches;
        private String devPassword; // Standard development password "Admin@123"
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DevLoginRequest {
        private String username;
        private UUID companyId;
    }
}
