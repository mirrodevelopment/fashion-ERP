package com.fashionerp.company;

import com.fashionerp.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanySettingsService {

    private final CompanySettingsRepository repository;

    /* ── Is Configured (used by status endpoint) ── */
    @Transactional(readOnly = true)
    public boolean isConfigured() {
        UUID companyId = TenantContext.getCompanyId();
        var companyOpt = companyId != null
            ? repository.findById(companyId)
            : repository.findFirstByOrderByCreatedAtAsc();

        return companyOpt
            .map(s -> (s.getPrimaryPhone() != null && !s.getPrimaryPhone().isBlank())
                   || (s.getEmail() != null && !s.getEmail().isBlank())
                   || (s.getStreetAddress() != null && !s.getStreetAddress().isBlank())
                   || (s.getGstin() != null && !s.getGstin().isBlank()))
            .orElse(false);
    }

    /* ── Get (current tenant company) ── */
    @Transactional(readOnly = true)
    public CompanySettingsDto.Response get() {
        UUID companyId = TenantContext.getCompanyId();
        CompanySettings settings = (companyId != null
            ? repository.findById(companyId)
            : repository.findFirstByOrderByCreatedAtAsc())
            .orElseGet(() -> CompanySettings.builder()
                .companyName("Fashion ERP Boutique")
                .country("India")
                .build());
        return CompanySettingsDto.Response.from(settings);
    }

    /* ── Update current tenant company ── */
    @Transactional
    public CompanySettingsDto.Response update(CompanySettingsDto.Request req) {
        UUID companyId = TenantContext.getCompanyId();
        CompanySettings settings = (companyId != null
            ? repository.findById(companyId)
            : repository.findFirstByOrderByCreatedAtAsc())
            .orElseGet(() -> CompanySettings.builder().build());

        if (req.getCompanyName() != null && !req.getCompanyName().isBlank()) {
            settings.setCompanyName(clean(req.getCompanyName()));
        }
        if (req.getShortName() != null && !req.getShortName().isBlank()) {
            settings.setShortName(clean(req.getShortName()));
        }
        settings.setTagline(clean(req.getTagline()));
        settings.setOwnerName(clean(req.getOwnerName()));
        if (req.getBusinessType() != null && !req.getBusinessType().isBlank()) {
            settings.setBusinessType(clean(req.getBusinessType()));
        }
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
        if (req.getCountry() != null && !req.getCountry().isBlank()) {
            settings.setCountry(clean(req.getCountry()));
        }
        // logo is large — only update if explicitly provided
        if (req.getLogoBase64() != null) {
            settings.setLogoBase64(req.getLogoBase64().isBlank() ? null : req.getLogoBase64());
        }

        return CompanySettingsDto.Response.from(repository.save(settings));
    }

    /* ── Private: trim and strip unsafe chars ── */
    private String clean(String value) {
        if (value == null) return null;
        return value.trim().replaceAll("[<>]", "");
    }
}
