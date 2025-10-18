package com.enterprise.starter.kit.modules.settings.service;

import com.enterprise.starter.kit.modules.settings.dto.TenantSettingsDto;
import com.enterprise.starter.kit.modules.tenant.entity.Company;
import com.enterprise.starter.kit.modules.tenant.repository.CompanyRepository;
import com.enterprise.starter.kit.shared.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TenantSettingsService Unit Tests")
class TenantSettingsServiceTest {

    @Mock
    private CompanyRepository companyRepository;
    @InjectMocks
    private TenantSettingsService service;

    private static final String TENANT = "tenant-1";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    private Company sampleCompany() {
        Company c = new Company();
        c.setTenantId(TENANT);
        c.setName("Acme Corp");
        c.setCurrency("USD");
        c.setInvoicePrefix("INV-");
        c.setTimezone("UTC");
        c.setDateFormat("yyyy-MM-dd");
        c.setLogoUrl("https://example.com/logo.png");
        c.setPrimaryColor("#6366f1");
        c.setCompanyTagline("Build the future");
        return c;
    }

    @Test
    @DisplayName("getSettings() returns current tenant settings")
    void getSettings_returnsSettings() {
        Company company = sampleCompany();
        when(companyRepository.findByTenantId(TENANT)).thenReturn(Optional.of(company));

        TenantSettingsDto result = service.getSettings();

        assertThat(result.companyName()).isEqualTo("Acme Corp");
        assertThat(result.currency()).isEqualTo("USD");
        assertThat(result.logoUrl()).isEqualTo("https://example.com/logo.png");
        assertThat(result.primaryColor()).isEqualTo("#6366f1");
        assertThat(result.companyTagline()).isEqualTo("Build the future");
    }

    @Test
    @DisplayName("getSettings() throws when company not found")
    void getSettings_throwsWhenCompanyNotFound() {
        when(companyRepository.findByTenantId(TENANT)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getSettings())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not found");
    }

    @Test
    @DisplayName("updateSettings() persists branding fields")
    void updateSettings_persistsBranding() {
        Company company = sampleCompany();
        when(companyRepository.findByTenantId(TENANT)).thenReturn(Optional.of(company));
        when(companyRepository.save(any(Company.class))).thenAnswer(i -> i.getArgument(0));

        TenantSettingsDto dto = new TenantSettingsDto(
                null, null, null, null, null, null,
                null, null, null, null, null, null,
                null, null,
                "https://example.com/new-logo.png", "#ff6600",
                "https://example.com/favicon.ico", "New Tagline");

        TenantSettingsDto result = service.updateSettings(dto);

        assertThat(company.getLogoUrl()).isEqualTo("https://example.com/new-logo.png");
        assertThat(company.getPrimaryColor()).isEqualTo("#ff6600");
        assertThat(company.getFaviconUrl()).isEqualTo("https://example.com/favicon.ico");
        assertThat(company.getCompanyTagline()).isEqualTo("New Tagline");
        verify(companyRepository).save(company);
    }

    @Test
    @DisplayName("updateSettings() only updates non-null fields")
    void updateSettings_onlyUpdatesNonNullFields() {
        Company company = sampleCompany();
        company.setCurrency("SAR");
        when(companyRepository.findByTenantId(TENANT)).thenReturn(Optional.of(company));
        when(companyRepository.save(any(Company.class))).thenAnswer(i -> i.getArgument(0));

        // Only update company name, leave currency null (should not be overwritten)
        TenantSettingsDto dto = new TenantSettingsDto(
                "New Corp", null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null, null, null);

        service.updateSettings(dto);

        assertThat(company.getName()).isEqualTo("New Corp");
        assertThat(company.getCurrency()).isEqualTo("SAR"); // unchanged
    }

    @Test
    @DisplayName("updateSettings() persists invoice settings")
    void updateSettings_persistsInvoiceSettings() {
        Company company = sampleCompany();
        when(companyRepository.findByTenantId(TENANT)).thenReturn(Optional.of(company));
        when(companyRepository.save(any(Company.class))).thenAnswer(i -> i.getArgument(0));

        TenantSettingsDto dto = new TenantSettingsDto(
                null, null, null, null, null, null,
                "BILL-", 100, "EUR", 20.0, 30, "Thank you",
                null, null, null, null, null, null);

        service.updateSettings(dto);

        assertThat(company.getInvoicePrefix()).isEqualTo("BILL-");
        assertThat(company.getCurrency()).isEqualTo("EUR");
        assertThat(company.getDefaultTaxRate()).isEqualTo(20.0);
    }
}
