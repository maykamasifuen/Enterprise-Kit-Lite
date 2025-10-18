package com.enterprise.starter.kit.modules.tenant.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Company/Tenant entity representing a business organization.
 * Each tenant has its own isolated data (invoices, customers, users).
 */
@Entity
@Table(name = "companies")
@EntityListeners(AuditingEntityListener.class)
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false, unique = true, length = 100)
    private String tenantId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(length = 255)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String country;

    @Column(name = "tax_number", length = 50)
    private String taxNumber;

    @Column(length = 500)
    private String website;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // ---- Invoice settings ----
    @Column(name = "invoice_prefix", length = 20)
    private String invoicePrefix = "INV-";

    @Column(name = "next_invoice_number")
    private Integer nextInvoiceNumber = 1;

    @Column(name = "currency", length = 10)
    private String currency = "USD";

    @Column(name = "default_tax_rate")
    private Double defaultTaxRate = 0.0;

    @Column(name = "payment_terms")
    private Integer paymentTerms = 30;

    @Column(name = "default_notes", length = 1000)
    private String defaultNotes;

    // ---- Regional settings ----
    @Column(name = "date_format", length = 30)
    private String dateFormat = "yyyy-MM-dd";

    @Column(name = "timezone", length = 50)
    private String timezone = "UTC";

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by", updatable = false)
    private String createdBy;

    // Manual Getters and Setters to avoid Lombok issues during migration
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getTaxNumber() {
        return taxNumber;
    }

    public void setTaxNumber(String taxNumber) {
        this.taxNumber = taxNumber;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getInvoicePrefix() {
        return invoicePrefix;
    }

    public void setInvoicePrefix(String invoicePrefix) {
        this.invoicePrefix = invoicePrefix;
    }

    public Integer getNextInvoiceNumber() {
        return nextInvoiceNumber;
    }

    public void setNextInvoiceNumber(Integer nextInvoiceNumber) {
        this.nextInvoiceNumber = nextInvoiceNumber;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Double getDefaultTaxRate() {
        return defaultTaxRate;
    }

    public void setDefaultTaxRate(Double defaultTaxRate) {
        this.defaultTaxRate = defaultTaxRate;
    }

    public Integer getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(Integer paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public String getDefaultNotes() {
        return defaultNotes;
    }

    public void setDefaultNotes(String defaultNotes) {
        this.defaultNotes = defaultNotes;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Company() {
    }

    public Company(Long id, String tenantId, String name, String description, String email, String phone,
            String address, String city, String country, String taxNumber, String website, String logoUrl,
            Boolean isActive, Instant createdAt, Instant updatedAt,
            String createdBy) {
        this.id = id;
        this.tenantId = tenantId;
        this.name = name;
        this.description = description;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.country = country;
        this.taxNumber = taxNumber;
        this.website = website;
        this.logoUrl = logoUrl;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
    }

    public static CompanyBuilder builder() {
        return new CompanyBuilder();
    }

    public static class CompanyBuilder {
        private Long id;
        private String tenantId;
        private String name;
        private String description;
        private String email;
        private String phone;
        private String address;
        private String city;
        private String country;
        private String taxNumber;
        private String website;
        private String logoUrl;
        private Boolean isActive;
        private Instant createdAt;
        private Instant updatedAt;
        private String createdBy;

        CompanyBuilder() {
        }

        public CompanyBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CompanyBuilder tenantId(String tenantId) {
            this.tenantId = tenantId;
            return this;
        }

        public CompanyBuilder name(String name) {
            this.name = name;
            return this;
        }

        public CompanyBuilder description(String description) {
            this.description = description;
            return this;
        }

        public CompanyBuilder email(String email) {
            this.email = email;
            return this;
        }

        public CompanyBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public CompanyBuilder address(String address) {
            this.address = address;
            return this;
        }

        public CompanyBuilder city(String city) {
            this.city = city;
            return this;
        }

        public CompanyBuilder country(String country) {
            this.country = country;
            return this;
        }

        public CompanyBuilder taxNumber(String taxNumber) {
            this.taxNumber = taxNumber;
            return this;
        }

        public CompanyBuilder website(String website) {
            this.website = website;
            return this;
        }

        public CompanyBuilder logoUrl(String logoUrl) {
            this.logoUrl = logoUrl;
            return this;
        }

        public CompanyBuilder isActive(Boolean isActive) {
            this.isActive = isActive;
            return this;
        }

        public CompanyBuilder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public CompanyBuilder updatedAt(Instant updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public CompanyBuilder createdBy(String createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public Company build() {
            return new Company(id, tenantId, name, description, email, phone, address, city, country, taxNumber,
                    website, logoUrl, isActive, createdAt, updatedAt,
                    createdBy);
        }
    }
}
