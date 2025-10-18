package com.enterprise.starter.kit.modules.auth.controller;

import com.enterprise.starter.kit.modules.auth.dto.AuthResponse;
import com.enterprise.starter.kit.modules.auth.dto.ForgotPasswordRequest;
import com.enterprise.starter.kit.modules.auth.dto.LoginRequest;
import com.enterprise.starter.kit.modules.auth.dto.RegisterRequest;
import com.enterprise.starter.kit.modules.auth.dto.ResetPasswordRequest;
import com.enterprise.starter.kit.modules.auth.dto.TenantRegistrationRequest;
import com.enterprise.starter.kit.modules.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Authentication and token management")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate and receive access + refresh tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Register", description = "Create a new user account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Exchange a valid refresh token for a new access + refresh token pair")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refreshAccessToken(request.refreshToken()));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Logout", description = "Revoke all refresh tokens for the current user")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserDetails userDetails) {
        authService.logout(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Send a password reset email")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset password using a valid token")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register-tenant")
    @Operation(summary = "Register tenant", description = "Self-service tenant + admin registration")
    public ResponseEntity<AuthResponse> registerTenant(
            @Valid @RequestBody TenantRegistrationRequest request) {
        return ResponseEntity.ok(authService.registerTenant(request));
    }

    public record RefreshRequest(String refreshToken) {
    }
}
