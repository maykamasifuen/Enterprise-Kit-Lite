package com.enterprise.starter.kit.modules.auth.dto;

/**
 * Response DTO for user profile information.
 * Contains public user details (excludes sensitive data like password).
 */
public record ProfileResponse(
        Long id,
        String username,
        String email,
        String fullName,
        String phoneNumber,
        String avatarUrl,
        String preferredLanguage
) {
}
