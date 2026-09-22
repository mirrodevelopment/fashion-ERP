package com.fashionerp.measurement;

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

    public List<MeasurementDto.Response> getByCustomer(String customerMobile) {
        return profileRepository.findByCustomerMobileNumberOrderByRecordedAtDesc(customerMobile)
                .stream().map(MeasurementDto.Response::from).toList();
    }

    public MeasurementDto.Response getById(UUID id) {
        return profileRepository.findById(id)
                .map(MeasurementDto.Response::from)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found: " + id));
    }

    @Transactional
    public MeasurementDto.Response create(MeasurementDto.Request req) {
        String mobile = req.getEffectiveMobile();
        Customer customer = customerRepository.findById(mobile)
                .or(() -> customerRepository.findByFlexibleMobile(mobile))
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with mobile: " + mobile));
        MeasurementProfile profile = MeasurementProfile.builder()
                .customer(customer)
                .garmentType(req.getGarmentType())
                .recordedBy(req.getRecordedBy())
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
        MeasurementProfile profile = profileRepository.findById(id)
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
        if (!profileRepository.existsById(id))
            throw new IllegalArgumentException("Profile not found: " + id);
        profileRepository.deleteById(id);
    }
}
