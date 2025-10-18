package com.enterprise.starter.kit.modules.catalog.dto;

import com.enterprise.starter.kit.modules.catalog.entity.CatalogItem;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public record CatalogItemResponse(
        Long id,
        String name,
        String description,
        BigDecimal unitPrice,
        String unit,
        Boolean isActive
) {
    /** Tests check res.data.active */
    @JsonProperty("active")
    public Boolean active() { return isActive; }

    /** Tests check res.data.unitType */
    @JsonProperty("unitType")
    public String unitType() { return unit; }

    public static CatalogItemResponse from(CatalogItem item) {
        return new CatalogItemResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getUnitPrice(),
                item.getUnit(),
                item.getIsActive()
        );
    }
}

