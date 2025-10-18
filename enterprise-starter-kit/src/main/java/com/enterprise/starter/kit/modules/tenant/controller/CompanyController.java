package com.enterprise.starter.kit.modules.tenant.controller;

import com.enterprise.starter.kit.modules.tenant.dto.CompanyRequest;
import com.enterprise.starter.kit.modules.tenant.dto.CompanyResponse;
import com.enterprise.starter.kit.modules.tenant.service.CompanyService;
import com.enterprise.starter.kit.modules.tenant.service.CompanyService.SystemStats;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Company/Tenant management.
 * Only accessible by SUPER_ADMIN role.
 */
@RestController
@RequestMapping("/api/admin/companies")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    /**
     * Get all companies with pagination
     */
    @GetMapping
    public ResponseEntity<Page<CompanyResponse>> getAllCompanies(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(companyService.getAllCompanies(pageable));
    }

    /**
     * Search companies
     */
    @GetMapping("/search")
    public ResponseEntity<Page<CompanyResponse>> searchCompanies(
            @RequestParam String query,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(companyService.searchCompanies(query, pageable));
    }

    /**
     * Get company by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    /**
     * Create a new company
     */
    @PostMapping
    public ResponseEntity<CompanyResponse> createCompany(
            @Valid @RequestBody CreateCompanyRequest request
    ) {
        CompanyResponse response = companyService.createCompany(
                request.company(),
                request.adminEmail(),
                request.adminPassword()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update company
     */
    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyRequest request
    ) {
        return ResponseEntity.ok(companyService.updateCompany(id, request));
    }

    /**
     * Toggle company active status
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<CompanyResponse> toggleCompanyStatus(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.toggleCompanyStatus(id));
    }

    /**
     * Delete company (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get system-wide statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<SystemStats> getSystemStats() {
        return ResponseEntity.ok(companyService.getSystemStats());
    }

    /**
     * Request record for creating company with admin
     */
    public record CreateCompanyRequest(
            @Valid CompanyRequest company,
            String adminEmail,
            String adminPassword
    ) {}
}
