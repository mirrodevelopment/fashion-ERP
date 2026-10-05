package com.fashionerp.measurement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MeasurementProfileRepository extends JpaRepository<MeasurementProfile, UUID> {
    List<MeasurementProfile> findByCustomerMobileNumberAndCompanyIdOrderByRecordedAtDesc(String customerMobile, UUID companyId);
    List<MeasurementProfile> findByCustomerMobileNumberAndGarmentTypeIgnoreCaseAndCompanyId(String customerMobile, String garmentType, UUID companyId);
    Optional<MeasurementProfile> findByIdAndCompanyId(UUID id, UUID companyId);
}
