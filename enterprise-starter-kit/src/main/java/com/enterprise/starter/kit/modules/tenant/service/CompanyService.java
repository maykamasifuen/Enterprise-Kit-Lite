package com.enterprise.starter.kit.modules.tenant.service;

import com.enterprise.starter.kit.modules.auth.entity.Role;
import com.enterprise.starter.kit.modules.auth.entity.User;
import com.enterprise.starter.kit.modules.auth.repository.RoleRepository;
import com.enterprise.starter.kit.modules.auth.repository.UserRepository;
import com.enterprise.starter.kit.modules.invoices.repository.InvoiceRepository;
import com.enterprise.starter.kit.modules.tenant.dto.CompanyRequest;
import com.enterprise.starter.kit.modules.tenant.dto.CompanyResponse;
import com.enterprise.starter.kit.modules.tenant.entity.Company;
import com.enterprise.starter.kit.modules.tenant.repository.CompanyRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final InvoiceRepository invoiceRepository;
    private final PasswordEncoder passwordEncoder;

    public CompanyService(
            CompanyRepository companyRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            InvoiceRepository invoiceRepository,
            PasswordEncoder passwordEncoder) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.invoiceRepository = invoiceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Get all companies with pagination
     */
    public Page<CompanyResponse> getAllCompanies(Pageable pageable) {
        return companyRepository.findAll(pageable)
                .map(company -> {
                    long userCount = userRepository.countByTenantId(company.getTenantId());
                    long invoiceCount = invoiceRepository.countByTenantId(company.getTenantId());
                    return CompanyResponse.fromEntityWithStats(company, userCount, invoiceCount);
                });
    }

    /**
     * Search companies
     */
    public Page<CompanyResponse> searchCompanies(String query, Pageable pageable) {
        return companyRepository.search(query, pageable)
                .map(CompanyResponse::fromEntity);
    }

    /**
     * Get company by ID
     */
    public CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found with ID: " + id));

        long userCount = userRepository.countByTenantId(company.getTenantId());
        long invoiceCount = invoiceRepository.countByTenantId(company.getTenantId());

        return CompanyResponse.fromEntityWithStats(company, userCount, invoiceCount);
    }

    /**
     * Get company by tenant ID
     */
    public CompanyResponse getCompanyByTenantId(String tenantId) {
        Company company = companyRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Company not found with tenant ID: " + tenantId));
        return CompanyResponse.fromEntity(company);
    }

    /**
     * Create a new company with an admin user
     */
    public CompanyResponse createCompany(CompanyRequest request, String adminEmail, String adminPassword) {
        // Generate unique tenant ID
        String tenantId = generateTenantId(request.name());

        // Create company
        Company company = new Company();
        company.setTenantId(tenantId);
        company.setName(request.name());
        company.setDescription(request.description());
        company.setEmail(request.email());
        company.setPhone(request.phone());
        company.setAddress(request.address());
        company.setCity(request.city());
        company.setCountry(request.country());
        company.setTaxNumber(request.taxNumber());
        company.setWebsite(request.website());
        company.setIsActive(true);

        company = companyRepository.save(company);

        // Create admin user for the company
        if (adminEmail != null && adminPassword != null) {
            createCompanyAdmin(tenantId, adminEmail, adminPassword, request.name());
        }

        return CompanyResponse.fromEntity(company);
    }

    /**
     * Update company
     */
    public CompanyResponse updateCompany(Long id, CompanyRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found with ID: " + id));

        company.setName(request.name());
        company.setDescription(request.description());
        company.setEmail(request.email());
        company.setPhone(request.phone());
        company.setAddress(request.address());
        company.setCity(request.city());
        company.setCountry(request.country());
        company.setTaxNumber(request.taxNumber());
        company.setWebsite(request.website());

        company = companyRepository.save(company);
        return CompanyResponse.fromEntity(company);
    }

    /**
     * Activate/Deactivate company
     */
    public CompanyResponse toggleCompanyStatus(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found with ID: " + id));

        company.setIsActive(!company.getIsActive());
        company = companyRepository.save(company);
        return CompanyResponse.fromEntity(company);
    }

    /**
     * Delete company (soft delete by deactivating)
     */
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found with ID: " + id));
        company.setIsActive(false);
        companyRepository.save(company);
    }

    /**
     * Create admin user for a company
     */
    private void createCompanyAdmin(String tenantId, String email, String password, String companyName) {
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

        User adminUser = new User();
        adminUser.setUsername(email.split("@")[0] + "_" + tenantId);
        adminUser.setEmail(email);
        adminUser.setPassword(passwordEncoder.encode(password));
        adminUser.setFullName(companyName + " Admin");
        adminUser.setTenantId(tenantId);
        adminUser.setRoles(Set.of(adminRole));
        adminUser.setPreferredLanguage("en");

        userRepository.save(adminUser);
    }

    /**
     * Generate unique tenant ID from company name
     */
    private String generateTenantId(String companyName) {
        String base = companyName.toLowerCase()
                .replaceAll("[^a-z0-9]", "")
                .substring(0, Math.min(companyName.length(), 20));

        String tenantId = base;
        int counter = 1;

        while (companyRepository.existsByTenantId(tenantId)) {
            tenantId = base + counter++;
        }

        return tenantId;
    }

    /**
     * Get system-wide statistics for super admin
     */
    /**
     * Get system-wide statistics for super admin
     */
    public SystemStats getSystemStats() {
        long totalCompanies = companyRepository.count();
        long activeCompanies = companyRepository.countActiveCompanies();
        long totalUsers = userRepository.count();
        long totalInvoices = invoiceRepository.count();
        java.math.BigDecimal totalRevenue = invoiceRepository.sumTotalPaidAmount();

        return new SystemStats(
                totalCompanies,
                activeCompanies,
                totalUsers,
                totalInvoices,
                totalRevenue);
    }

    public record SystemStats(
            long totalCompanies,
            long activeCompanies,
            long totalUsers,
            long totalInvoices,
            java.math.BigDecimal totalRevenue) {
    }
}
