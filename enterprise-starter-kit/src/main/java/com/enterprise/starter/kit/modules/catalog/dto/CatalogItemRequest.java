package com.enterprise.starter.kit.modules.catalog.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CatalogItemRequest(
        @NotBlank String name,
        String description,
        @NotNull @DecimalMin("0.00") BigDecimal unitPrice,
        @JsonAlias("unitType") String unit,
        @JsonAlias("active") Boolean isActive
) {}

