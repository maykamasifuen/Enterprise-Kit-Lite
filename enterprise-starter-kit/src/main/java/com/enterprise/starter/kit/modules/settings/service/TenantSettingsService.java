package com.enterprise.starter.kit.modules.settings.service;

import com.enterprise.starter.kit.modules.settings.dto.TenantSettingsDto;
import com.enterprise.starter.kit.modules.tenant.entity.Company;
import com.enterprise.starter.kit.modules.tenant.repository.CompanyRepository;
import com.enterprise.starter.kit.shared.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to read and persist tenant-level application settings.
 *
 * <p>
 * Company (tenant) information is stored in the {@code companies} table.
 * Invoice / regional preferences are stored in the same row via dedicated
 * columns added in migration V8.
 */
@Service
public class TenantSettingsService {

    private final CompanyRepository companyRepository;

    public TenantSettingsService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    /** Returns the current tenant's settings. */
    @Transactional(readOnly = true)
    public TenantSettingsDto getSettings() {
        Company company = currentCompany();
        return toDto(company);
    }

    /** Persists updated settings for the current tenant. */
    @Transactional
    public TenantSettingsDto updateSettings(TenantSettingsDto dto) {
        Company company = currentCompany();

        // Company info
        if (dto.companyName() != null)
            company.setName(dto.companyName());
        if (dto.taxNumber() != null)
            company.setTaxNumber(dto.taxNumber());
        if (dto.address() != null)
            company.setAddress(dto.address());
        if (dto.phone() != null)
            company.setPhone(dto.phone());
        if (dto.email() != null)
            company.setEmail(dto.email());
        if (dto.website() != null)
            company.setWebsite(dto.website());

        // Invoice settings
        if (dto.invoicePrefix() != null)
            company.setInvoicePrefix(dto.invoicePrefix());
        if (dto.nextInvoiceNumber() != null)
            company.setNextInvoiceNumber(dto.nextInvoiceNumber());
        if (dto.currency() != null)
            company.setCurrency(dto.currency());
        if (dto.defaultTaxRate() != null)
            company.setDefaultTaxRate(dto.defaultTaxRate());
        if (dto.paymentTerms() != null)
            company.setPaymentTerms(dto.paymentTerms());
        if (dto.defaultNotes() != null)
            company.setDefaultNotes(dto.defaultNotes());

        // Regional settings
        if (dto.dateFormat() != null)
            company.setDateFormat(dto.dateFormat());
        if (dto.timezone() != null)
            company.setTimezone(dto.timezone());

        companyRepository.save(company);
        return toDto(company);
    }

    // -------------------------------------------------------------------------
    private Company currentCompany() {
        String tenantId = TenantContext.getTenantId();
        return companyRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Company not found for tenant: " + tenantId));
    }

    private TenantSettingsDto toDto(Company c) {
        return new TenantSettingsDto(
                c.getName(),
                c.getTaxNumber(),
                c.getAddress(),
                c.getPhone(),
                c.getEmail(),
                c.getWebsite(),
                c.getInvoicePrefix(),
                c.getNextInvoiceNumber(),
                c.getCurrency(),
                c.getDefaultTaxRate(),
                c.getPaymentTerms(),
                c.getDefaultNotes(),
                c.getDateFormat(),
                c.getTimezone(),
                c.getLogoUrl(),
                null, // primaryColor - branding feature removed
                null, // faviconUrl - branding feature removed
                null); // companyTagline - branding feature removed
    }
}
