package com.fashionerp.company;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CompanySettingsRepository extends JpaRepository<CompanySettings, UUID> {

    /**
     * Returns the singleton company settings row (the first and only row).
     */
    Optional<CompanySettings> findFirstByOrderByCreatedAtAsc();
}
