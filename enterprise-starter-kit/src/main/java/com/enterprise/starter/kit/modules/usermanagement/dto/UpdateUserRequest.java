package com.enterprise.starter.kit.modules.usermanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
    @Size(max = 255)
    String fullName,

    @Size(max = 50)
    String phoneNumber,

    @Email(message = "Invalid email format")
    @Size(max = 255)
    String email,

    String preferredLanguage,

    Boolean isActive
) {}

