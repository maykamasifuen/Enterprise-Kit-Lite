package com.enterprise.starter.kit.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/// Request DTO for resetting password with a token.
///
/// @param token the password reset token
/// @param newPassword the new password
public record ResetPasswordRequest(
    @NotBlank(message = "Reset token is required")
    String token,

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String newPassword
) {}
