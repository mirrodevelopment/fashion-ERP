package com.fashionerp.measurement;

import com.fashionerp.common.TenantContext;
import com.fashionerp.customer.Customer;
import com.fashionerp.customer.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MeasurementService {

    private final MeasurementProfileRepository profileRepository;
    private final CustomerRepository customerRepository;
    private final com.fashionerp.common.BranchAccessService branchAccessService;

    public List<MeasurementDto.Response> getByCustomer(String customerMobile) {
        UUID companyId = TenantContext.getCompanyId();
        String branchFilter = branchAccessService.getEffectiveBranchFilter(com.fashionerp.common.BranchAccessService.BranchModule.MEASUREMENTS);
        return profileRepository.searchProfiles(companyId, customerMobile, branchFilter)
                .stream().map(MeasurementDto.Response::from).toList();
    }

    public MeasurementDto.Response getById(UUID id) {
        UUID companyId = TenantContext.getCompanyId();
        return profileRepository.findByIdAndCompanyId(id, companyId)
                .map(MeasurementDto.Response::from)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found: " + id));
    }

    @Transactional
    public MeasurementDto.Response create(MeasurementDto.Request req) {
        UUID companyId = TenantContext.getCompanyId();
        String mobile = req.getEffectiveMobile();
        Customer customer = customerRepository.findByMobileNumberAndCompanyId(mobile, companyId)
                .or(() -> customerRepository.findByFlexibleMobile(companyId, mobile))
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with mobile: " + mobile));
        MeasurementProfile profile = MeasurementProfile.builder()
                .companyId(companyId)
                .customer(customer)
                .garmentType(req.getGarmentType())
                .recordedBy(req.getRecordedBy())
                .branch(branchAccessService.getDefaultBranchForCreation())
                .notes(req.getNotes())
                .build();
        if (req.getPoints() != null) {
            int order = 0;
            for (MeasurementDto.PointRequest pr : req.getPoints()) {
                MeasurementPoint pt = MeasurementPoint.builder()
                        .profile(profile)
                        .pointName(pr.getPointName())
                        .value(pr.getValue())
                        .unit(pr.getUnit() != null ? pr.getUnit() : "\"")
                        .markerIndex(pr.getMarkerIndex())
                        .sortOrder(pr.getSortOrder() != null ? pr.getSortOrder() : order++)
                        .build();
                profile.getPoints().add(pt);
            }
        }
        // Mark customer as having measurements
        customer.setMeasurementsOnFile(true);
        customerRepository.save(customer);
        return MeasurementDto.Response.from(profileRepository.save(profile));
    }

    @Transactional
    public MeasurementDto.Response update(UUID id, MeasurementDto.Request req) {
        UUID companyId = TenantContext.getCompanyId();
        MeasurementProfile profile = profileRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found: " + id));
        profile.setGarmentType(req.getGarmentType());
        if (req.getRecordedBy() != null) profile.setRecordedBy(req.getRecordedBy());
        if (req.getNotes() != null) profile.setNotes(req.getNotes());
        profile.setUpdatedAt(LocalDateTime.now());
        // Replace points
        if (req.getPoints() != null) {
            profile.getPoints().clear();
            int order = 0;
            for (MeasurementDto.PointRequest pr : req.getPoints()) {
                MeasurementPoint pt = MeasurementPoint.builder()
                        .profile(profile)
                        .pointName(pr.getPointName())
                        .value(pr.getValue())
                        .unit(pr.getUnit() != null ? pr.getUnit() : "\"")
                        .markerIndex(pr.getMarkerIndex())
                        .sortOrder(pr.getSortOrder() != null ? pr.getSortOrder() : order++)
                        .build();
                profile.getPoints().add(pt);
            }
        }
        return MeasurementDto.Response.from(profileRepository.save(profile));
    }

    @Transactional
    public void delete(UUID id) {
        UUID companyId = TenantContext.getCompanyId();
        MeasurementProfile profile = profileRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found: " + id));
        profileRepository.delete(profile);
    }
}
