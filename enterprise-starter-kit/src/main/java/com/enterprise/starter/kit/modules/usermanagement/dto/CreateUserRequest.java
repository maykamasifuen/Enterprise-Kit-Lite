package com.enterprise.starter.kit.modules.usermanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record CreateUserRequest(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 150)
    String username,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255)
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100)
    String password,

    @Size(max = 255)
    String fullName,

    @Size(max = 50)
    String phoneNumber,

    String preferredLanguage,

    Set<String> roles
) {}
