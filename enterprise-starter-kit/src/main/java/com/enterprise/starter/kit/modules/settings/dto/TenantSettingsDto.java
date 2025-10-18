package com.enterprise.starter.kit.modules.settings.dto;

/**
 * DTO for reading and writing per-tenant application settings.
 */
public record TenantSettingsDto(
                // Company
                String companyName,
                String taxNumber,
                String address,
                String phone,
                String email,
                String website,

                // Invoice
                String invoicePrefix,
                Integer nextInvoiceNumber,
                String currency,
                Double defaultTaxRate,
                Integer paymentTerms,
                String defaultNotes,

                // Regional
                String dateFormat,
                String timezone,

                // Branding
                String logoUrl,
                String primaryColor,
                String faviconUrl,
                String companyTagline) {
}
