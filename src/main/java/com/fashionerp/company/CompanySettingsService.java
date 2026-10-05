package com.fashionerp.company;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanySettingsService {

    private static final String DEFAULT_COMPANY_NAME  = "Haulo Designs";
    private static final String DEFAULT_SHORT_NAME    = "HAULO";
    private static final String DEFAULT_TAGLINE       = "Bespoke Couture · Luxury Tailoring";
    private static final String DEFAULT_BUSINESS_TYPE = "Bespoke Atelier";
    private static final String DEFAULT_COUNTRY       = "India";

    private final CompanySettingsRepository repository;

    /* ── Is Configured (used by status endpoint) ── */
    @Transactional(readOnly = true)
    public boolean isConfigured() {
        return repository.findFirstByOrderByCreatedAtAsc()
            .map(s -> (s.getPrimaryPhone() != null && !s.getPrimaryPhone().isBlank())
                   || (s.getEmail() != null && !s.getEmail().isBlank())
                   || (s.getStreetAddress() != null && !s.getStreetAddress().isBlank())
                   || (s.getGstin() != null && !s.getGstin().isBlank()))
            .orElse(false);
    }

    /* ── Get (singleton) ── */
    @Transactional(readOnly = true)
    public CompanySettingsDto.Response get() {
        CompanySettings settings = repository.findFirstByOrderByCreatedAtAsc()
            .orElseGet(this::buildDefault);
        return CompanySettingsDto.Response.from(settings);
    }

    /* ── Update ── */
    @Transactional
    public CompanySettingsDto.Response update(CompanySettingsDto.Request req) {
        CompanySettings settings = repository.findFirstByOrderByCreatedAtAsc()
            .orElseGet(this::buildDefault);

        if (req.getCompanyName() != null && !req.getCompanyName().isBlank()) {
            settings.setCompanyName(clean(req.getCompanyName()));
        }
        if (req.getShortName() != null && !req.getShortName().isBlank()) {
            settings.setShortName(clean(req.getShortName()));
        }
        settings.setTagline(clean(req.getTagline()));
        settings.setOwnerName(clean(req.getOwnerName()));
        settings.setBusinessType(
            req.getBusinessType() != null && !req.getBusinessType().isBlank()
                ? clean(req.getBusinessType())
                : DEFAULT_BUSINESS_TYPE
        );
        settings.setGstin(clean(req.getGstin()));
        settings.setPanNumber(clean(req.getPanNumber()));
        settings.setPrimaryPhone(clean(req.getPrimaryPhone()));
        settings.setWhatsapp(clean(req.getWhatsapp()));
        settings.setEmail(clean(req.getEmail()));
        settings.setWebsite(clean(req.getWebsite()));
        settings.setStreetAddress(clean(req.getStreetAddress()));
        settings.setCity(clean(req.getCity()));
        settings.setState(clean(req.getState()));
        settings.setPinCode(clean(req.getPinCode()));
        settings.setCountry(
            req.getCountry() != null && !req.getCountry().isBlank()
                ? clean(req.getCountry())
                : DEFAULT_COUNTRY
        );
        // logo is large — only update if explicitly provided
        if (req.getLogoBase64() != null) {
            settings.setLogoBase64(req.getLogoBase64().isBlank() ? null : req.getLogoBase64());
        }

        return CompanySettingsDto.Response.from(repository.save(settings));
    }

    /* ── Private: build transient default entity without saving ── */
    private CompanySettings buildDefault() {
        return CompanySettings.builder()
            .companyName(DEFAULT_COMPANY_NAME)
            .shortName(DEFAULT_SHORT_NAME)
            .tagline(DEFAULT_TAGLINE)
            .businessType(DEFAULT_BUSINESS_TYPE)
            .country(DEFAULT_COUNTRY)
            .build();
    }

    /* ── Private: trim and strip unsafe chars ── */
    private String clean(String value) {
        if (value == null) return null;
        return value.trim().replaceAll("[<>]", "");
    }
}
