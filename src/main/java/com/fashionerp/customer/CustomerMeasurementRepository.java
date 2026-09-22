package com.fashionerp.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerMeasurementRepository extends JpaRepository<CustomerMeasurement, UUID> {
    List<CustomerMeasurement> findByCustomerMobileOrderByRecordedAtDesc(String customerMobile);
    Optional<CustomerMeasurement> findByCustomerMobileAndGarmentType(String customerMobile, String garmentType);
    Optional<CustomerMeasurement> findFirstByCustomerMobileAndIsActiveProfileTrue(String customerMobile);
    void deleteByCustomerMobile(String customerMobile);
}
