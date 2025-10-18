package com.enterprise.starter.kit.modules.usermanagement.controller;

import com.enterprise.starter.kit.modules.usermanagement.dto.CreateUserRequest;
import com.enterprise.starter.kit.modules.usermanagement.dto.UpdateUserRequest;
import com.enterprise.starter.kit.modules.usermanagement.dto.UserResponse;
import com.enterprise.starter.kit.modules.usermanagement.service.UserManagementService;
import com.enterprise.starter.kit.modules.auth.dto.ProfileUpdateRequest;
import com.enterprise.starter.kit.modules.auth.dto.ProfileResponse;
import com.enterprise.starter.kit.modules.auth.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    private final UserManagementService userManagementService;
    private final ProfileService profileService;

    public UserManagementController(UserManagementService userManagementService, ProfileService profileService) {
        this.userManagementService = userManagementService;
        this.profileService = profileService;
    }

    /** Get current authenticated user's profile */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getMyProfile() {
        return ResponseEntity.ok(userManagementService.getCurrentUserProfile());
    }

    /** Profile alias — tests call GET /api/users/profile */
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getProfile());
    }

    /** Profile update alias — tests call PUT /api/users/profile */
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }

    /** Change-password alias — tests call PUT /api/users/change-password */
    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordAlias request) {
        profileService.changePassword(
            new com.enterprise.starter.kit.modules.auth.dto.ChangePasswordRequest(
                request.oldPassword(), request.newPassword()));
        return ResponseEntity.ok().build();
    }

    public record ChangePasswordAlias(String oldPassword, String newPassword) {}

    /** Get all users — returns a flat list so tests can call Array.isArray() */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(userManagementService.getUsersForTenant(
                org.springframework.data.domain.PageRequest.of(0, 1000,
                        Sort.by(Sort.Direction.DESC, "createdAt"))).getContent());
    }

    /** Get all users system-wide (SUPER_ADMIN only) */
    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(userManagementService.getAllUsers(pageable));
    }

    /** Get users by tenant ID (SUPER_ADMIN only) */
    @GetMapping("/tenant/{tenantId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Page<UserResponse>> getUsersByTenant(
            @PathVariable String tenantId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(userManagementService.getUsersByTenantId(tenantId, pageable));
    }

    /** Get user by ID */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userManagementService.getUserById(id));
    }

    /** Create a new user */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userManagementService.createUser(request));
    }

    /** Update user profile */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userManagementService.updateUser(id, request));
    }

    /** Toggle user active/inactive status */
    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<UserResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userManagementService.toggleUserStatus(id));
    }

    /** Alias used by automation tests */
    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<UserResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(userManagementService.toggleUserStatus(id));
    }

    /** Update user roles */
    @PutMapping("/{id}/roles")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<UserResponse> updateUserRoles(
            @PathVariable Long id, @RequestBody Set<String> roles) {
        return ResponseEntity.ok(userManagementService.updateUserRoles(id, roles));
    }

    /** Reset user password */
    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> resetUserPassword(
            @PathVariable Long id, @RequestBody PasswordResetRequest request) {
        userManagementService.resetUserPassword(id, request.newPassword());
        return ResponseEntity.ok().build();
    }

    /** Delete user */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userManagementService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /** Get available roles */
    @GetMapping("/roles")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<String>> getAvailableRoles() {
        return ResponseEntity.ok(userManagementService.getAvailableRoles(false));
    }

    /** Get all roles including SUPER_ADMIN */
    @GetMapping("/roles/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<String>> getAllRoles() {
        return ResponseEntity.ok(userManagementService.getAvailableRoles(true));
    }

    public record PasswordResetRequest(String newPassword) {}
}