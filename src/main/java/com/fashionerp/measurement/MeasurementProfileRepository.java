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

    @org.springframework.data.jpa.repository.Query("""
        SELECT mp FROM MeasurementProfile mp
        WHERE mp.companyId = :companyId
          AND (:customerMobile IS NULL OR mp.customer.mobileNumber = :customerMobile)
          AND (:branch IS NULL OR mp.branch = :branch OR mp.branch IS NULL)
        ORDER BY mp.recordedAt DESC
    """)
    List<MeasurementProfile> searchProfiles(@org.springframework.data.repository.query.Param("companyId") UUID companyId,
                                           @org.springframework.data.repository.query.Param("customerMobile") String customerMobile,
                                           @org.springframework.data.repository.query.Param("branch") String branch);
}
