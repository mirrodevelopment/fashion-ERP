package com.fashionerp.company;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CompanySettingsRepository extends JpaRepository<CompanySettings, UUID> {

    /**
     * Returns the singleton company settings row (the first and only row).
     */
    Optional<CompanySettings> findFirstByOrderByCreatedAtAsc();

    /**
     * Finds a company by name (case-insensitive).
     * Used by the login company-lookup endpoint (Step 1 of multi-step login).
     */
    Optional<CompanySettings> findByCompanyNameIgnoreCase(String companyName);
}
