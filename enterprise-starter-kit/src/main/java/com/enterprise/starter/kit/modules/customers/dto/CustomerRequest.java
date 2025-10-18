package com.enterprise.starter.kit.modules.customers.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/// DTO for creating or updating a customer.
public record CustomerRequest(
    @NotBlank(message = "Customer name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    String name,

    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    String email,

    @Size(max = 50, message = "Phone must not exceed 50 characters")
    String phone,

    @Size(max = 500, message = "Address must not exceed 500 characters")
    String address,

    @Size(max = 100, message = "City must not exceed 100 characters")
    String city,

    @Size(max = 100, message = "Country must not exceed 100 characters")
    String country,

    @Size(max = 50, message = "Tax number must not exceed 50 characters")
    String taxNumber,

    @Size(max = 255, message = "Contact person must not exceed 255 characters")
    String contactPerson,

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    String notes
) {}
