package com.fashionerp.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerBodyMeasurementRepository extends JpaRepository<CustomerBodyMeasurement, UUID> {

    Optional<CustomerBodyMeasurement> findByCustomerMobileAndGarmentTypeIgnoreCaseAndIsCurrentTrue(
            String customerMobile, String garmentType);

    Optional<CustomerBodyMeasurement> findFirstByCustomerMobileAndGarmentTypeIgnoreCaseAndIsCurrentFalseOrderByVersionDesc(
            String customerMobile, String garmentType);

    List<CustomerBodyMeasurement> findByCustomerMobileAndIsCurrentTrue(String customerMobile);

    List<CustomerBodyMeasurement> findByCustomerMobileAndGarmentTypeIgnoreCaseOrderByVersionDesc(
            String customerMobile, String garmentType);

    List<CustomerBodyMeasurement> findByCustomerMobileOrderByGarmentTypeAscVersionDesc(String customerMobile);

    void deleteByCustomerMobile(String customerMobile);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT m.customerMobile) FROM CustomerBodyMeasurement m WHERE m.isCurrent = true")
    long countDistinctCustomerByIsCurrentTrue();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT m.customerMobile) FROM CustomerBodyMeasurement m WHERE m.version > 1")
    long countDistinctCustomerWithVersionGreaterThanOne();

    @org.springframework.data.jpa.repository.Query("SELECT LOWER(m.garmentType), COUNT(m) FROM CustomerBodyMeasurement m WHERE m.isCurrent = true GROUP BY LOWER(m.garmentType)")
    List<Object[]> countCurrentByGarmentType();
}
