package com.enterprise.starter.kit.modules.tenant.dto;

import com.enterprise.starter.kit.modules.tenant.entity.Company;

import java.time.Instant;

public record CompanyResponse(
        Long id,
        String tenantId,
        String name,
        String description,
        String email,
        String phone,
        String address,
        String city,
        String country,
        String taxNumber,
        String website,
        String logoUrl,
        Boolean isActive,
        Instant createdAt,
        Instant updatedAt,
        Long userCount,
        Long invoiceCount) {
    public static CompanyResponse fromEntity(Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getTenantId(),
                company.getName(),
                company.getDescription(),
                company.getEmail(),
                company.getPhone(),
                company.getAddress(),
                company.getCity(),
                company.getCountry(),
                company.getTaxNumber(),
                company.getWebsite(),
                company.getLogoUrl(),
                company.getIsActive(),
                company.getCreatedAt(),
                company.getUpdatedAt(),
                null,
                null);
    }

    public static CompanyResponse fromEntityWithStats(Company company, Long userCount, Long invoiceCount) {
        return new CompanyResponse(
                company.getId(),
                company.getTenantId(),
                company.getName(),
                company.getDescription(),
                company.getEmail(),
                company.getPhone(),
                company.getAddress(),
                company.getCity(),
                company.getCountry(),
                company.getTaxNumber(),
                company.getWebsite(),
                company.getLogoUrl(),
                company.getIsActive(),
                company.getCreatedAt(),
                company.getUpdatedAt(),
                userCount,
                invoiceCount);
    }
}
