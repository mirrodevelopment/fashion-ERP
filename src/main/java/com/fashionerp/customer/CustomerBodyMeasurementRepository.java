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
}
