package com.enterprise.starter.kit.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TenantRegistrationRequest(
                @NotBlank @Size(min = 2, max = 100) String companyName,
                @NotBlank @Email String adminEmail,
                @NotBlank @Size(min = 8, max = 255) String adminPassword) {
}
