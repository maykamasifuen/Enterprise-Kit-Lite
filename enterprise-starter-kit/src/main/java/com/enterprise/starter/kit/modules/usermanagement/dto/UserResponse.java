package com.enterprise.starter.kit.modules.usermanagement.dto;

import com.enterprise.starter.kit.modules.auth.entity.User;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

public record UserResponse(
    Long id,
    String username,
    String email,
    String fullName,
    String phoneNumber,
    String avatarUrl,
    String preferredLanguage,
    String tenantId,
    Set<String> roles,
    Instant createdAt,
    Instant updatedAt,
    boolean isEnabled
) {
    public static UserResponse fromEntity(User user) {
        Set<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());

        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getPhoneNumber(),
            user.getAvatarUrl(),
            user.getPreferredLanguage(),
            user.getTenantId(),
            roleNames,
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.isEnabled()
        );
    }
}
