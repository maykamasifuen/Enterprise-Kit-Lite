package com.enterprise.starter.kit.modules.auth.service;

import com.enterprise.starter.kit.modules.auth.dto.ChangePasswordRequest;
import com.enterprise.starter.kit.modules.auth.dto.ProfileResponse;
import com.enterprise.starter.kit.modules.auth.dto.ProfileUpdateRequest;
import com.enterprise.starter.kit.modules.auth.entity.User;
import com.enterprise.starter.kit.modules.auth.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing user profile operations.
 * Handles profile retrieval, updates, and password changes.
 */
@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Gets the currently authenticated user from the security context.
     *
     * @return the authenticated User entity
     * @throws IllegalStateException if no user is authenticated
     */
    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            // Refresh from database to get latest data
            return userRepository.findById(user.getId())
                    .orElseThrow(() -> new IllegalStateException("Current user not found in database"));
        }
        throw new IllegalStateException("No authenticated user found");
    }

    /**
     * Retrieves the current user's profile information.
     *
     * @return ProfileResponse containing user details
     */
    @Transactional(readOnly = true)
    public ProfileResponse getProfile() {
        User user = getCurrentUser();
        return new ProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getAvatarUrl(),
                user.getPreferredLanguage()
        );
    }

    /**
     * Updates the current user's profile information.
     *
     * @param request the profile update data
     * @return updated ProfileResponse
     */
    @Transactional
    public ProfileResponse updateProfile(ProfileUpdateRequest request) {
        User user = getCurrentUser();

        // Update fields if provided
        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }
        if (request.phoneNumber() != null) {
            user.setPhoneNumber(request.phoneNumber());
        }
        if (request.preferredLanguage() != null) {
            user.setPreferredLanguage(request.preferredLanguage());
        }

        userRepository.save(user);

        return new ProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getAvatarUrl(),
                user.getPreferredLanguage()
        );
    }

    /**
     * Changes the current user's password.
     * Validates the old password before updating.
     *
     * @param request containing old and new passwords
     * @throws IllegalArgumentException if old password is incorrect
     */
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        // Verify old password
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Validate new password is different
        if (request.oldPassword().equals(request.newPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }
}
