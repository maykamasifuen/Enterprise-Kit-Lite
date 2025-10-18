package com.enterprise.starter.kit.modules.auth.controller;

import com.enterprise.starter.kit.modules.auth.dto.ChangePasswordRequest;
import com.enterprise.starter.kit.modules.auth.dto.ProfileResponse;
import com.enterprise.starter.kit.modules.auth.dto.ProfileUpdateRequest;
import com.enterprise.starter.kit.modules.auth.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for user profile management.
 * Provides endpoints for viewing and updating user profile information.
 */
@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "User profile management endpoints")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * Gets the current authenticated user's profile.
     *
     * @return ProfileResponse containing user details
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get current user profile",
            description = """
                    Returns the profile information for the currently authenticated user.
                    Includes username, email, full name, phone number, avatar URL, and preferred language.
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Profile retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ProfileResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - missing or invalid JWT token",
                    content = @Content
            )
    })
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getProfile());
    }

    /**
     * Updates the current user's profile information.
     *
     * @param request profile update data
     * @return updated ProfileResponse
     */
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Update user profile",
            description = """
                    Updates the current user's profile information.
                    You can update full name, phone number, and preferred language.
                    All fields are optional - only provided fields will be updated.
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Profile updated successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ProfileResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid input data",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - missing or invalid JWT token",
                    content = @Content
            )
    })
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }

    /**
     * Changes the current user's password.
     *
     * @param request containing old and new passwords
     * @return success message
     */
    @PutMapping("/password")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Change user password",
            description = """
                    Changes the current user's password.
                    Requires the current password for verification.
                    The new password must be at least 8 characters long.
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Password changed successfully",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid password or validation error",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - missing or invalid JWT token",
                    content = @Content
            )
    })
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            profileService.changePassword(request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
