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
        if (req.getTagline() != null) {
            settings.setTagline(clean(req.getTagline()));
        }
        if (req.getOwnerName() != null) {
            settings.setOwnerName(clean(req.getOwnerName()));
        }
        if (req.getBusinessType() != null && !req.getBusinessType().isBlank()) {
            settings.setBusinessType(clean(req.getBusinessType()));
        }
        if (req.getGstin() != null) {
            settings.setGstin(clean(req.getGstin()));
        }
        if (req.getPanNumber() != null) {
            settings.setPanNumber(clean(req.getPanNumber()));
        }
        if (req.getPrimaryPhone() != null) {
            settings.setPrimaryPhone(clean(req.getPrimaryPhone()));
        }
        if (req.getWhatsapp() != null) {
            settings.setWhatsapp(clean(req.getWhatsapp()));
        }
        if (req.getEmail() != null) {
            settings.setEmail(clean(req.getEmail()));
        }
        if (req.getWebsite() != null) {
            settings.setWebsite(clean(req.getWebsite()));
        }
        if (req.getStreetAddress() != null) {
            settings.setStreetAddress(clean(req.getStreetAddress()));
        }
        if (req.getCity() != null) {
            settings.setCity(clean(req.getCity()));
        }
        if (req.getState() != null) {
            settings.setState(clean(req.getState()));
        }
        if (req.getPinCode() != null) {
            settings.setPinCode(clean(req.getPinCode()));
        }
        if (req.getCountry() != null && !req.getCountry().isBlank()) {
            settings.setCountry(clean(req.getCountry()));
        }
        // logo is large — only update if explicitly provided
        if (req.getLogoBase64() != null) {
            settings.setLogoBase64(req.getLogoBase64().isBlank() ? null : req.getLogoBase64());
        }

        /* ── Branch Data Sharing Policies ── */
        if (req.getShareCustomersAcrossBranches() != null) {
            settings.setShareCustomersAcrossBranches(req.getShareCustomersAcrossBranches());
        }
        if (req.getShareOrdersAcrossBranches() != null) {
            settings.setShareOrdersAcrossBranches(req.getShareOrdersAcrossBranches());
        }
        if (req.getShareEnquiriesAcrossBranches() != null) {
            settings.setShareEnquiriesAcrossBranches(req.getShareEnquiriesAcrossBranches());
        }
        if (req.getShareMeasurementsAcrossBranches() != null) {
            settings.setShareMeasurementsAcrossBranches(req.getShareMeasurementsAcrossBranches());
        }
        if (req.getShareInventoryAcrossBranches() != null) {
            settings.setShareInventoryAcrossBranches(req.getShareInventoryAcrossBranches());
        }
        if (req.getShareGarmentsAcrossBranches() != null) {
            settings.setShareGarmentsAcrossBranches(req.getShareGarmentsAcrossBranches());
        }
        if (req.getShareTrialsAcrossBranches() != null) {
            settings.setShareTrialsAcrossBranches(req.getShareTrialsAcrossBranches());
        }
        if (req.getShareDesignsAcrossBranches() != null) {
            settings.setShareDesignsAcrossBranches(req.getShareDesignsAcrossBranches());
        }
        if (req.getSharePurchasesAcrossBranches() != null) {
            settings.setSharePurchasesAcrossBranches(req.getSharePurchasesAcrossBranches());
        }
        if (req.getShareWorkforceAcrossBranches() != null) {
            settings.setShareWorkforceAcrossBranches(req.getShareWorkforceAcrossBranches());
        }
        if (req.getCurrencySymbol() != null && !req.getCurrencySymbol().isBlank()) {
            settings.setCurrencySymbol(clean(req.getCurrencySymbol()));
        }
        if (req.getOrderPrefix() != null && !req.getOrderPrefix().isBlank()) {
            settings.setOrderPrefix(clean(req.getOrderPrefix()));
        }
        if (req.getInvoicePrefix() != null && !req.getInvoicePrefix().isBlank()) {
            settings.setInvoicePrefix(clean(req.getInvoicePrefix()));
        }
        if (req.getSessionTimeoutMinutes() != null && req.getSessionTimeoutMinutes() >= 0) {
            settings.setSessionTimeoutMinutes(req.getSessionTimeoutMinutes());
        }

        return CompanySettingsDto.Response.from(repository.save(settings));
    }

    /* ── Private: trim and strip unsafe chars ── */
    private String clean(String value) {
        if (value == null) return null;
        return value.trim().replaceAll("[<>]", "");
    }
}
