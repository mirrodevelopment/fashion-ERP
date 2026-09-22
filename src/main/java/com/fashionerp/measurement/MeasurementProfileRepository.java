package com.fashionerp.measurement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface MeasurementProfileRepository extends JpaRepository<MeasurementProfile, UUID> {
    List<MeasurementProfile> findByCustomerMobileNumberOrderByRecordedAtDesc(String customerMobile);
    List<MeasurementProfile> findByCustomerMobileNumberAndGarmentTypeIgnoreCase(String customerMobile, String garmentType);
}
