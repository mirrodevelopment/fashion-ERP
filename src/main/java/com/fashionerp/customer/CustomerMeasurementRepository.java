package com.fashionerp.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerMeasurementRepository extends JpaRepository<CustomerMeasurement, UUID> {
    List<CustomerMeasurement> findByCompanyIdAndCustomerMobileOrderByRecordedAtDesc(UUID companyId, String customerMobile);
    List<CustomerMeasurement> findByCustomerMobileOrderByRecordedAtDesc(String customerMobile);

    Optional<CustomerMeasurement> findByCompanyIdAndCustomerMobileAndGarmentType(UUID companyId, String customerMobile, String garmentType);
    Optional<CustomerMeasurement> findByCustomerMobileAndGarmentType(String customerMobile, String garmentType);

    Optional<CustomerMeasurement> findFirstByCompanyIdAndCustomerMobileAndIsActiveProfileTrue(UUID companyId, String customerMobile);
    Optional<CustomerMeasurement> findFirstByCustomerMobileAndIsActiveProfileTrue(String customerMobile);

    void deleteByCompanyIdAndCustomerMobile(UUID companyId, String customerMobile);
    void deleteByCustomerMobile(String customerMobile);
}

