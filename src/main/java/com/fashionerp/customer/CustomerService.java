package com.fashionerp.customer;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMeasurementRepository measurementRepository;
    private final CustomerBodyMeasurementRepository bodyMeasurementRepository;
    private final CustomerNoteRepository noteRepository;

    public Page<CustomerDto.Response> list(String search, String tier, Pageable pageable) {
        CustomerTier tierEnum = (tier != null && !tier.isBlank()) ? CustomerTier.valueOf(tier.toUpperCase()) : null;
        return customerRepository.search(search, tierEnum, pageable)
                .map(CustomerDto.Response::from);
    }

    public CustomerDto.Response getByMobile(String mobileNumber) {
        String cleanMobile = cleanPhone(mobileNumber);
        return customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .map(CustomerDto.Response::from)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with mobile: " + mobileNumber));
    }

    @Transactional
    public CustomerDto.Response create(CustomerDto.Request req) {
        String mobile = req.getEffectiveMobile();
        if (mobile == null || mobile.isBlank()) {
            throw new IllegalArgumentException("Mobile number is required as primary key.");
        }
        String cleanMobile = cleanPhone(mobile);

        Customer customer = customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .orElse(null);
        if (customer == null) {
            customer = Customer.builder()
                    .mobileNumber(cleanMobile)
                    .name(req.getName())
                    .salutation(req.getSalutation())
                    .firstName(req.getFirstName())
                    .lastName(req.getLastName())
                    .gender(req.getGender() != null ? req.getGender() : "Female")
                    .email(req.getEmail())
                    .altPhone(req.getAltPhone())
                    .instagramHandle(req.getInstagramHandle())
                    .preferredChannel(req.getPreferredChannel() != null ? req.getPreferredChannel() : "WhatsApp")
                    .dob(req.getDob())
                    .anniversary(req.getAnniversary())
                    .location(req.getLocation())
                    .streetAddress(req.getStreetAddress())
                    .city(req.getCity())
                    .state(req.getState())
                    .pincode(req.getPincode())
                    .landmark(req.getLandmark())
                    .avatarUrl(req.getAvatarUrl())
                    .tier(req.getTier() != null ? req.getTier() : CustomerTier.REGULAR)
                    .creditLimit(req.getCreditLimit() != null ? req.getCreditLimit() : BigDecimal.ZERO)
                    .favoriteGarment(req.getFavoriteGarment())
                    .fitPreference(req.getFitPreference())
                    .fabricAllergies(req.getFabricAllergies())
                    .preferredNeck(req.getPreferredNeck())
                    .preferredSleeve(req.getPreferredSleeve())
                    .preferredOccasions(req.getPreferredOccasions())
                    .deliveryPreference(req.getDeliveryPreference())
                    .notes(req.getNotes())
                    .measurementsOnFile(req.getInitialMeasurement() != null)
                    .build();
        } else {
            // Update existing profile
            updateFields(customer, req);
        }

        Customer saved = customerRepository.save(customer);

        // Save initial measurement set if provided
        if (req.getInitialMeasurement() != null) {
            saveMeasurement(cleanMobile, req.getInitialMeasurement());
            saved.setMeasurementsOnFile(true);
            saved = customerRepository.save(saved);
        }

        return CustomerDto.Response.from(saved);
    }

    @Transactional
    public CustomerDto.Response update(String mobileNumber, CustomerDto.Request req) {
        String cleanMobile = cleanPhone(mobileNumber);
        Customer customer = customerRepository.findById(cleanMobile)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with mobile: " + mobileNumber));

        updateFields(customer, req);
        return CustomerDto.Response.from(customerRepository.save(customer));
    }

    @Transactional
    public void delete(String mobileNumber) {
        String cleanMobile = cleanPhone(mobileNumber);
        if (!customerRepository.existsById(cleanMobile)) {
            throw new IllegalArgumentException("Customer not found with mobile: " + mobileNumber);
        }
        measurementRepository.deleteByCustomerMobile(cleanMobile);
        customerRepository.deleteById(cleanMobile);
    }

    // ── Avatar / Profile Photo Upload ────────────────────────────────────

    @Transactional
    public CustomerDto.Response uploadAvatar(String mobileNumber, MultipartFile file) {
        String cleanMobile = cleanPhone(mobileNumber);
        Customer customer = customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + mobileNumber));

        try {
            // Build safe filename: <CustomerName>_<4digits>.<ext>
            String customerName = (customer.getName() != null ? customer.getName() : "customer")
                    .trim()
                    .replaceAll("[^a-zA-Z0-9\\s]", "")
                    .replaceAll("\\s+", "_");
            String originalFilename = file.getOriginalFilename();
            String ext = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                    : ".png";
            int fourDigits = 1000 + new Random().nextInt(9000);
            String filename = customerName + "_" + fourDigits + ext;

            // Resolve storage directory: <project-root>/front end/assets/user uploads/user img/
            Path storageDir = Paths.get("front end", "assets", "user uploads", "user img")
                    .toAbsolutePath();
            Files.createDirectories(storageDir);

            // Write file
            Path filePath = storageDir.resolve(filename);
            Files.write(filePath, file.getBytes());

            // Build a browser-accessible relative URL
            String avatarUrl = "/front end/assets/user uploads/user img/" + filename;

            // Persist URL to DB
            customer.setAvatarUrl(avatarUrl);
            customerRepository.save(customer);

            return CustomerDto.Response.from(customer);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save customer avatar image: " + e.getMessage(), e);
        }
    }

    // ── Dedicated Separate Measurements Operations ───────────────────────

    public List<CustomerDto.MeasurementResponse> getMeasurements(String mobileNumber) {
        String cleanMobile = cleanPhone(mobileNumber);
        String targetMobile = customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .map(c -> c.getMobileNumber())
                .orElse(cleanMobile);
        return measurementRepository.findByCustomerMobileOrderByRecordedAtDesc(targetMobile).stream()
                .map(CustomerDto.MeasurementResponse::from)
                .collect(Collectors.toList());
    }

    public CustomerDto.MeasurementResponse getMeasurementByGarment(String mobileNumber, String garmentType) {
        String cleanMobile = cleanPhone(mobileNumber);
        String targetMobile = customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .map(c -> c.getMobileNumber())
                .orElse(cleanMobile);
        return measurementRepository.findByCustomerMobileAndGarmentType(targetMobile, garmentType)
                .map(CustomerDto.MeasurementResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("No measurements found for garment " + garmentType));
    }

    @Transactional
    public CustomerDto.MeasurementResponse saveMeasurement(String mobileNumber, CustomerDto.MeasurementRequest req) {
        String cleanMobile = cleanPhone(mobileNumber);
        Customer c = customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .orElse(null);
        String targetMobile = (c != null) ? c.getMobileNumber() : cleanMobile;
        String gType = (req.getGarmentType() != null && !req.getGarmentType().isBlank()) ? req.getGarmentType() : "General";

        CustomerMeasurement m = measurementRepository.findByCustomerMobileAndGarmentType(targetMobile, gType)
                .orElse(CustomerMeasurement.builder()
                        .customerMobile(targetMobile)
                        .garmentType(gType)
                        .build());

        m.setBust(req.getBust());
        m.setUpperBust(req.getUpperBust());
        m.setUnderBust(req.getUnderBust());
        m.setWaist(req.getWaist());
        m.setHighHip(req.getHighHip());
        m.setFullHip(req.getFullHip());
        m.setShoulder(req.getShoulder());
        m.setCrossFront(req.getCrossFront());
        m.setCrossBack(req.getCrossBack());
        m.setArmhole(req.getArmhole());
        m.setSleeveLength(req.getSleeveLength());
        m.setBicep(req.getBicep());
        m.setWrist(req.getWrist());
        m.setFrontNeck(req.getFrontNeck());
        m.setBackNeck(req.getBackNeck());
        m.setApexPoint(req.getApexPoint());
        m.setGarmentLength(req.getGarmentLength());
        m.setPostureNotes(req.getPostureNotes());
        m.setShapeNotes(req.getShapeNotes());
        if (req.getRecordedBy() != null) m.setRecordedBy(req.getRecordedBy());

        CustomerMeasurement saved = measurementRepository.save(m);

        // Update measurements_on_file flag on customer
        if (c != null) {
            c.setMeasurementsOnFile(true);
            customerRepository.save(c);
        }

        return CustomerDto.MeasurementResponse.from(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // TAILORED BODY MEASUREMENTS WITH CURRENT VS OLD VERSIONING
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public CustomerDto.BodyMeasurementResponse saveBodyMeasurement(String mobileNumber, CustomerDto.BodyMeasurementRequest req) {
        String cleanMobile = cleanPhone(mobileNumber);
        Customer c = customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .orElse(null);

        String targetMobile = (c != null) ? c.getMobileNumber() : cleanMobile;
        String customerName = (c != null) ? c.getName() : 
                (req.getCustomerName() != null && !req.getCustomerName().isBlank() ? req.getCustomerName() : "Valued Customer");

        String garmentType = (req.getGarmentType() != null && !req.getGarmentType().isBlank()) 
                ? req.getGarmentType().trim().toUpperCase() : "BLOUSE";

        // 1. Check if there is an existing CURRENT measurement
        int nextVersion = 1;
        var currentOpt = bodyMeasurementRepository
                .findByCustomerMobileAndGarmentTypeIgnoreCaseAndIsCurrentTrue(targetMobile, garmentType);

        if (currentOpt.isPresent()) {
            CustomerBodyMeasurement existing = currentOpt.get();
            existing.setIsCurrent(false);
            existing.setMeasurementType("OLD");
            existing.setUpdatedAt(LocalDateTime.now());
            bodyMeasurementRepository.save(existing);
            nextVersion = existing.getVersion() + 1;
        }

        // 2. Create and persist new CURRENT measurement record
        CustomerBodyMeasurement newMeas = CustomerBodyMeasurement.builder()
                .customerMobile(targetMobile)
                .customerName(customerName)
                .garmentType(garmentType)
                .measurementType("CURRENT")
                .isCurrent(true)
                .version(nextVersion)
                .unit(req.getUnit() != null ? req.getUnit() : "in")
                .shoulder(req.getShoulder())
                .bust(req.getBust())
                .underBust(req.getUnderBust())
                .waist(req.getWaist())
                .hip(req.getHip())
                .blouseLength(req.getBlouseLength())
                .topLength(req.getTopLength())
                .fullLength(req.getFullLength())
                .skirtLength(req.getSkirtLength())
                .pantLength(req.getPantLength())
                .armhole(req.getArmhole())
                .upperArm(req.getUpperArm())
                .sleeveLength(req.getSleeveLength())
                .sleeveRound(req.getSleeveRound())
                .elbowRound(req.getElbowRound())
                .wristRound(req.getWristRound())
                .frontNeckDepth(req.getFrontNeckDepth())
                .backNeckDepth(req.getBackNeckDepth())
                .bustPoint(req.getBustPoint())
                .bustPointToBustPoint(req.getBustPointToBustPoint())
                .shoulderToBust(req.getShoulderToBust())
                .shoulderToWaist(req.getShoulderToWaist())
                .frontWidth(req.getFrontWidth())
                .backWidth(req.getBackWidth())
                .pantWaist(req.getPantWaist())
                .pantHip(req.getPantHip())
                .thighRound(req.getThighRound())
                .kneeRound(req.getKneeRound())
                .calfRound(req.getCalfRound())
                .ankleRound(req.getAnkleRound())
                .crotchLength(req.getCrotchLength())
                .bottomOpening(req.getBottomOpening())
                .waistToHip(req.getWaistToHip())
                .flare(req.getFlare())
                .postureNotes(req.getPostureNotes())
                .shapeNotes(req.getShapeNotes())
                .notes(req.getNotes())
                .recordedBy(req.getRecordedBy() != null ? req.getRecordedBy() : "Master Tailor")
                .recordedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        CustomerBodyMeasurement saved = bodyMeasurementRepository.save(newMeas);

        // Update customer profile flag
        if (c != null) {
            c.setMeasurementsOnFile(true);
            customerRepository.save(c);
        }

        return CustomerDto.BodyMeasurementResponse.from(saved);
    }

    public CustomerDto.GarmentMeasurementComparisonResponse getGarmentMeasurementComparison(String mobileNumber, String garmentType) {
        String cleanMobile = cleanPhone(mobileNumber);
        Customer c = customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .orElse(null);

        String targetMobile = (c != null) ? c.getMobileNumber() : cleanMobile;
        String customerName = (c != null) ? c.getName() : "Valued Customer";
        String gType = (garmentType != null && !garmentType.isBlank()) ? garmentType.trim().toUpperCase() : "BLOUSE";

        CustomerBodyMeasurement current = bodyMeasurementRepository
                .findByCustomerMobileAndGarmentTypeIgnoreCaseAndIsCurrentTrue(targetMobile, gType)
                .orElse(null);

        CustomerBodyMeasurement old = bodyMeasurementRepository
                .findFirstByCustomerMobileAndGarmentTypeIgnoreCaseAndIsCurrentFalseOrderByVersionDesc(targetMobile, gType)
                .orElse(null);

        Map<String, String> variances = calculateVariances(current, old);

        return CustomerDto.GarmentMeasurementComparisonResponse.builder()
                .customerMobile(targetMobile)
                .customerName(customerName)
                .garmentType(gType)
                .current(CustomerDto.BodyMeasurementResponse.from(current))
                .old(CustomerDto.BodyMeasurementResponse.from(old))
                .variance(variances)
                .build();
    }

    public List<CustomerDto.BodyMeasurementResponse> getCustomerCurrentBodyMeasurements(String mobileNumber) {
        String cleanMobile = cleanPhone(mobileNumber);
        String targetMobile = customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .map(c -> c.getMobileNumber())
                .orElse(cleanMobile);

        return bodyMeasurementRepository.findByCustomerMobileAndIsCurrentTrue(targetMobile).stream()
                .map(CustomerDto.BodyMeasurementResponse::from)
                .collect(Collectors.toList());
    }

    public List<CustomerDto.BodyMeasurementResponse> getGarmentMeasurementHistory(String mobileNumber, String garmentType) {
        String cleanMobile = cleanPhone(mobileNumber);
        String targetMobile = customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .map(c -> c.getMobileNumber())
                .orElse(cleanMobile);

        return bodyMeasurementRepository
                .findByCustomerMobileAndGarmentTypeIgnoreCaseOrderByVersionDesc(targetMobile, garmentType).stream()
                .map(CustomerDto.BodyMeasurementResponse::from)
                .collect(Collectors.toList());
    }

    private Map<String, String> calculateVariances(CustomerBodyMeasurement curr, CustomerBodyMeasurement old) {
        Map<String, String> map = new LinkedHashMap<>();
        if (curr == null || old == null) return map;

        checkVar(map, "shoulder", curr.getShoulder(), old.getShoulder());
        checkVar(map, "bust", curr.getBust(), old.getBust());
        checkVar(map, "underBust", curr.getUnderBust(), old.getUnderBust());
        checkVar(map, "waist", curr.getWaist(), old.getWaist());
        checkVar(map, "hip", curr.getHip(), old.getHip());
        checkVar(map, "blouseLength", curr.getBlouseLength(), old.getBlouseLength());
        checkVar(map, "topLength", curr.getTopLength(), old.getTopLength());
        checkVar(map, "fullLength", curr.getFullLength(), old.getFullLength());
        checkVar(map, "skirtLength", curr.getSkirtLength(), old.getSkirtLength());
        checkVar(map, "pantLength", curr.getPantLength(), old.getPantLength());
        checkVar(map, "armhole", curr.getArmhole(), old.getArmhole());
        checkVar(map, "upperArm", curr.getUpperArm(), old.getUpperArm());
        checkVar(map, "sleeveLength", curr.getSleeveLength(), old.getSleeveLength());
        checkVar(map, "sleeveRound", curr.getSleeveRound(), old.getSleeveRound());
        checkVar(map, "elbowRound", curr.getElbowRound(), old.getElbowRound());
        checkVar(map, "wristRound", curr.getWristRound(), old.getWristRound());
        checkVar(map, "frontNeckDepth", curr.getFrontNeckDepth(), old.getFrontNeckDepth());
        checkVar(map, "backNeckDepth", curr.getBackNeckDepth(), old.getBackNeckDepth());
        checkVar(map, "bustPoint", curr.getBustPoint(), old.getBustPoint());
        checkVar(map, "bustPointToBustPoint", curr.getBustPointToBustPoint(), old.getBustPointToBustPoint());
        checkVar(map, "shoulderToBust", curr.getShoulderToBust(), old.getShoulderToBust());
        checkVar(map, "shoulderToWaist", curr.getShoulderToWaist(), old.getShoulderToWaist());
        checkVar(map, "frontWidth", curr.getFrontWidth(), old.getFrontWidth());
        checkVar(map, "backWidth", curr.getBackWidth(), old.getBackWidth());
        checkVar(map, "pantWaist", curr.getPantWaist(), old.getPantWaist());
        checkVar(map, "pantHip", curr.getPantHip(), old.getPantHip());
        checkVar(map, "thighRound", curr.getThighRound(), old.getThighRound());
        checkVar(map, "kneeRound", curr.getKneeRound(), old.getKneeRound());
        checkVar(map, "calfRound", curr.getCalfRound(), old.getCalfRound());
        checkVar(map, "ankleRound", curr.getAnkleRound(), old.getAnkleRound());
        checkVar(map, "crotchLength", curr.getCrotchLength(), old.getCrotchLength());
        checkVar(map, "bottomOpening", curr.getBottomOpening(), old.getBottomOpening());
        checkVar(map, "waistToHip", curr.getWaistToHip(), old.getWaistToHip());
        checkVar(map, "flare", curr.getFlare(), old.getFlare());

        return map;
    }

    private void checkVar(Map<String, String> map, String key, BigDecimal vCurr, BigDecimal vOld) {
        if (vCurr != null && vOld != null) {
            BigDecimal diff = vCurr.subtract(vOld);
            if (diff.compareTo(BigDecimal.ZERO) == 0) {
                map.put(key, "0.00");
            } else if (diff.compareTo(BigDecimal.ZERO) > 0) {
                map.put(key, "+" + diff.setScale(2, RoundingMode.HALF_UP));
            } else {
                map.put(key, diff.setScale(2, RoundingMode.HALF_UP).toString());
            }
        }
    }

    public long count() {
        return customerRepository.count();
    }

    private void updateFields(Customer customer, CustomerDto.Request req) {
        if (req.getName() != null) customer.setName(req.getName());
        if (req.getSalutation() != null) customer.setSalutation(req.getSalutation());
        if (req.getFirstName() != null) customer.setFirstName(req.getFirstName());
        if (req.getLastName() != null) customer.setLastName(req.getLastName());
        if (req.getGender() != null) customer.setGender(req.getGender());
        if (req.getEmail() != null) customer.setEmail(req.getEmail());
        if (req.getAltPhone() != null) customer.setAltPhone(req.getAltPhone());
        if (req.getInstagramHandle() != null) customer.setInstagramHandle(req.getInstagramHandle());
        if (req.getPreferredChannel() != null) customer.setPreferredChannel(req.getPreferredChannel());
        if (req.getDob() != null) customer.setDob(req.getDob());
        if (req.getAnniversary() != null) customer.setAnniversary(req.getAnniversary());
        if (req.getLocation() != null) customer.setLocation(req.getLocation());
        if (req.getStreetAddress() != null) customer.setStreetAddress(req.getStreetAddress());
        if (req.getCity() != null) customer.setCity(req.getCity());
        if (req.getState() != null) customer.setState(req.getState());
        if (req.getPincode() != null) customer.setPincode(req.getPincode());
        if (req.getLandmark() != null) customer.setLandmark(req.getLandmark());
        if (req.getAvatarUrl() != null) customer.setAvatarUrl(req.getAvatarUrl());
        if (req.getTier() != null) customer.setTier(req.getTier());
        if (req.getCreditLimit() != null) customer.setCreditLimit(req.getCreditLimit());
        if (req.getFavoriteGarment() != null) customer.setFavoriteGarment(req.getFavoriteGarment());
        if (req.getFitPreference() != null) customer.setFitPreference(req.getFitPreference());
        if (req.getFabricAllergies() != null) customer.setFabricAllergies(req.getFabricAllergies());
        if (req.getPreferredNeck() != null) customer.setPreferredNeck(req.getPreferredNeck());
        if (req.getPreferredSleeve() != null) customer.setPreferredSleeve(req.getPreferredSleeve());
        if (req.getPreferredOccasions() != null) customer.setPreferredOccasions(req.getPreferredOccasions());
        if (req.getDeliveryPreference() != null) customer.setDeliveryPreference(req.getDeliveryPreference());
        if (req.getNotes() != null) customer.setNotes(req.getNotes());
    }

    // ── Customer Notes Operations ─────────────────────────────────────────

    public List<CustomerDto.NoteResponse> getNotes(String mobileNumber) {
        String cleanMobile = cleanPhone(mobileNumber);
        String targetMobile = customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .map(Customer::getMobileNumber)
                .orElse(cleanMobile);
        return noteRepository.findByCustomerMobileOrderByCreatedAtDesc(targetMobile).stream()
                .map(CustomerDto.NoteResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerDto.NoteResponse addNote(String mobileNumber, CustomerDto.NoteRequest req) {
        String cleanMobile = cleanPhone(mobileNumber);
        Customer customer = customerRepository.findById(cleanMobile)
                .or(() -> customerRepository.findByFlexibleMobile(cleanMobile))
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + mobileNumber));

        String author = (req.getAuthorName() != null && !req.getAuthorName().isBlank()) ? req.getAuthorName().trim() : "Atelier Staff";
        String badge = (req.getAuthorBadge() != null && !req.getAuthorBadge().isBlank()) ? req.getAuthorBadge().trim() : "AS";

        CustomerNote note = CustomerNote.builder()
                .customerMobile(customer.getMobileNumber())
                .noteText(req.getNoteText())
                .authorName(author)
                .authorBadge(badge)
                .category(req.getCategory() != null ? req.getCategory().toUpperCase() : "GENERAL")
                .build();

        return CustomerDto.NoteResponse.from(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(java.util.UUID noteId) {
        noteRepository.deleteById(noteId);
    }

    private String cleanPhone(String phone) {
        if (phone == null) return "";
        String trimmed = phone.trim();
        if (phone.startsWith(" ") && !trimmed.startsWith("+")) {
            trimmed = "+" + trimmed;
        }
        return trimmed;
    }
}
