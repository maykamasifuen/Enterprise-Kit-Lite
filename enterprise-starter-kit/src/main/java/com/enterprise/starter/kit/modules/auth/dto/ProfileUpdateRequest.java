package com.enterprise.starter.kit.modules.auth.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating user profile information.
 */
public record ProfileUpdateRequest(
        @Size(max = 255, message = "Full name must not exceed 255 characters")
        String fullName,

        @Size(max = 50, message = "Phone number must not exceed 50 characters")
        @Pattern(regexp = "^[+]?[0-9\\s\\-()]*$", message = "Invalid phone number format")
        String phoneNumber,

        @Pattern(regexp = "^(en|ar|fr)$", message = "Preferred language must be 'en', 'ar' or 'fr'")
        String preferredLanguage
) {
}
