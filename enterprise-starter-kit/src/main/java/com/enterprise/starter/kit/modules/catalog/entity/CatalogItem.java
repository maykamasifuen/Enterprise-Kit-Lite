package com.enterprise.starter.kit.modules.catalog.entity;

import com.enterprise.starter.kit.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * A reusable product/service item that can be picked when creating invoices.
 * Scoped per tenant via BaseEntity's tenantId + Hibernate filter.
 */
@Entity
@Table(name = "catalog_items")
@Getter
@Setter
@NoArgsConstructor
public class CatalogItem extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(name = "unit_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal unitPrice;

    /** e.g. "HOUR", "ITEM", "MONTH", "DAY" */
    @Column(length = 50)
    private String unit;

    @Column(nullable = false)
    private Boolean isActive = true;

    // Explicit accessors for Boolean fields (Lombok generates isActive() not getIsActive())
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public java.math.BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(java.math.BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
