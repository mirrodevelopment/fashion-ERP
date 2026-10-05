package com.fashionerp.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerBodyMeasurementRepository extends JpaRepository<CustomerBodyMeasurement, UUID> {

    Optional<CustomerBodyMeasurement> findByCompanyIdAndCustomerMobileAndGarmentTypeIgnoreCaseAndIsCurrentTrue(
            UUID companyId, String customerMobile, String garmentType);

    Optional<CustomerBodyMeasurement> findByCustomerMobileAndGarmentTypeIgnoreCaseAndIsCurrentTrue(
            String customerMobile, String garmentType);

    Optional<CustomerBodyMeasurement> findFirstByCompanyIdAndCustomerMobileAndGarmentTypeIgnoreCaseAndIsCurrentFalseOrderByVersionDesc(
            UUID companyId, String customerMobile, String garmentType);

    Optional<CustomerBodyMeasurement> findFirstByCustomerMobileAndGarmentTypeIgnoreCaseAndIsCurrentFalseOrderByVersionDesc(
            String customerMobile, String garmentType);

    List<CustomerBodyMeasurement> findByCompanyIdAndCustomerMobileAndIsCurrentTrue(UUID companyId, String customerMobile);

    List<CustomerBodyMeasurement> findByCustomerMobileAndIsCurrentTrue(String customerMobile);

    List<CustomerBodyMeasurement> findByCompanyIdAndCustomerMobileAndGarmentTypeIgnoreCaseOrderByVersionDesc(
            UUID companyId, String customerMobile, String garmentType);

    List<CustomerBodyMeasurement> findByCustomerMobileAndGarmentTypeIgnoreCaseOrderByVersionDesc(
            String customerMobile, String garmentType);

    List<CustomerBodyMeasurement> findByCompanyIdAndCustomerMobileOrderByGarmentTypeAscVersionDesc(UUID companyId, String customerMobile);

    List<CustomerBodyMeasurement> findByCustomerMobileOrderByGarmentTypeAscVersionDesc(String customerMobile);

    void deleteByCompanyIdAndCustomerMobile(UUID companyId, String customerMobile);

    void deleteByCustomerMobile(String customerMobile);

    long countByCompanyId(UUID companyId);

    @Query("SELECT COUNT(DISTINCT m.customerMobile) FROM CustomerBodyMeasurement m WHERE (:companyId IS NULL OR m.companyId = :companyId) AND m.isCurrent = true")
    long countDistinctCustomerByCompanyIdAndIsCurrentTrue(@Param("companyId") UUID companyId);

    @Query("SELECT COUNT(DISTINCT m.customerMobile) FROM CustomerBodyMeasurement m WHERE m.isCurrent = true")
    long countDistinctCustomerByIsCurrentTrue();

    @Query("SELECT COUNT(DISTINCT m.customerMobile) FROM CustomerBodyMeasurement m WHERE (:companyId IS NULL OR m.companyId = :companyId) AND m.version > 1")
    long countDistinctCustomerByCompanyIdAndVersionGreaterThanOne(@Param("companyId") UUID companyId);

    @Query("SELECT COUNT(DISTINCT m.customerMobile) FROM CustomerBodyMeasurement m WHERE m.version > 1")
    long countDistinctCustomerWithVersionGreaterThanOne();

    @Query("SELECT LOWER(m.garmentType), COUNT(m) FROM CustomerBodyMeasurement m WHERE (:companyId IS NULL OR m.companyId = :companyId) AND m.isCurrent = true GROUP BY LOWER(m.garmentType)")
    List<Object[]> countCurrentByCompanyIdAndGarmentType(@Param("companyId") UUID companyId);

    @Query("SELECT LOWER(m.garmentType), COUNT(m) FROM CustomerBodyMeasurement m WHERE m.isCurrent = true GROUP BY LOWER(m.garmentType)")
    List<Object[]> countCurrentByGarmentType();
}

