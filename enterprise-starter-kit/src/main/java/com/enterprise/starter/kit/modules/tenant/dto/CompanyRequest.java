package com.enterprise.starter.kit.modules.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
    @NotBlank(message = "Company name is required")
    @Size(max = 255)
    String name,

    @Size(max = 500)
    String description,

    @Size(max = 255)
    String email,

    @Size(max = 50)
    String phone,

    @Size(max = 500)
    String address,

    @Size(max = 100)
    String city,

    @Size(max = 100)
    String country,

    @Size(max = 50)
    String taxNumber,

    @Size(max = 500)
    String website
) {}
