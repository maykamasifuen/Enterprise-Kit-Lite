package com.enterprise.starter.kit.modules.auth.service;

import com.enterprise.starter.kit.modules.auth.dto.AuthResponse;
import com.enterprise.starter.kit.modules.auth.dto.LoginRequest;
import com.enterprise.starter.kit.modules.auth.dto.RegisterRequest;
import com.enterprise.starter.kit.modules.auth.entity.User;
import com.enterprise.starter.kit.modules.auth.repository.UserRepository;
import com.enterprise.starter.kit.config.security.JwtUtils;
import com.enterprise.starter.kit.shared.email.EmailService;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import com.enterprise.starter.kit.modules.tenant.entity.Company;
import com.enterprise.starter.kit.modules.tenant.repository.CompanyRepository;
import com.enterprise.starter.kit.modules.auth.repository.RoleRepository;
import com.enterprise.starter.kit.modules.auth.dto.TenantRegistrationRequest;
import com.enterprise.starter.kit.shared.tenant.TenantContext;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/// Authentication service providing user registration and login functionality.
///
/// This service handles:
/// - User authentication via username or email
/// - New user registration with duplicate checks
/// - JWT token generation for authenticated users
/// - Password encoding using BCrypt
/// - Role-based claims in JWT tokens
/// - Password reset with email verification
/// - Tenant self-service registration with welcome emails
///
/// **Usage Example:**
/// ```java
/// AuthResponse response = authService.login(new LoginRequest("user@example.com", "password"));
/// String jwtToken = response.token();
/// ```
///
/// @see com.enterprise.starter.kit.modules.auth.controller.AuthController for
///      REST endpoints
/// @see JwtUtils for token generation logic
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final RoleRepository roleRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    public AuthService(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            CompanyRepository companyRepository,
            RoleRepository roleRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.roleRepository = roleRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
    }

    /// Authenticates a user and generates a JWT token.
    ///
    /// The username field accepts either the actual username or email address. Upon
    /// successful authentication, a JWT token is generated containing the user's
    /// roles.
    ///
    /// @param request login credentials (username/email and password)
    /// @return AuthResponse containing JWT token and token type
    /// @throws org.springframework.security.core.AuthenticationException if
    ///                                                                   credentials
    ///                                                                   are invalid
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Check if account is locked before attempting auth
        userRepository.findByUsernameOrEmail(request.username(), request.username())
                .ifPresent(u -> {
                    if (u.getLockedUntil() != null && u.getLockedUntil().isAfter(LocalDateTime.now())) {
                        throw new LockedException("Account locked until " + u.getLockedUntil()
                                + ". Too many failed login attempts.");
                    }
                });

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));

            if (!(authentication.getPrincipal() instanceof User user)) {
                throw new IllegalStateException("Unexpected principal type");
            }
            // Reset failed attempts on success
            if (user.getFailedLoginAttempts() > 0) {
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(null);
                userRepository.save(user);
            }
            String refreshToken = refreshTokenService.createRefreshToken(user.getUsername());
            return new AuthResponse(jwtUtils.generateToken(user), "Bearer", refreshToken);

        } catch (BadCredentialsException ex) {
            // Increment failed counter
            userRepository.findByUsernameOrEmail(request.username(), request.username())
                    .ifPresent(u -> {
                        int attempts = u.getFailedLoginAttempts() + 1;
                        u.setFailedLoginAttempts(attempts);
                        if (attempts >= MAX_FAILED_ATTEMPTS) {
                            u.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
                            log.warn("Account locked for user: {} after {} failed attempts", u.getUsername(), attempts);
                        }
                        userRepository.save(u);
                    });
            throw ex;
        }
    }

    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken) {
        var rt = refreshTokenService.validateRefreshToken(refreshToken);
        User user = userRepository.findByUsername(rt.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String newRefreshToken = refreshTokenService.createRefreshToken(user.getUsername());
        return new AuthResponse(jwtUtils.generateToken(user), "Bearer", newRefreshToken);
    }

    @Transactional
    public void logout(String username) {
        refreshTokenService.revokeByUsername(username);
    }

    /// Registers a new user account and generates a JWT token.
    ///
    /// Validates that the username and email are not already in use. Passwords are
    /// encrypted using BCrypt before storage.
    ///
    /// @param request registration details (username, email, password)
    /// @return AuthResponse containing JWT token for the newly registered user
    /// @throws IllegalArgumentException if username or email already exists
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPreferredLanguage("en");
        userRepository.save(user);
        return new AuthResponse(jwtUtils.generateToken(user), "Bearer");
    }

    /// Initiates password reset process by generating a reset token and sending a
    /// password reset email to the user.
    ///
    /// For security, this method always returns success to prevent email
    /// enumeration.
    ///
    /// @param email the user's email address
    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
            log.info("Password reset token generated for: {}", email);
        });
        // Always return success to prevent email enumeration attacks
    }

    /// Resets user password using a valid reset token.
    ///
    /// Validates the token exists and has not expired, then updates the user's
    /// password and clears the reset token fields.
    ///
    /// @param token       the password reset token
    /// @param newPassword the new password
    /// @throws IllegalArgumentException if token is invalid or expired
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            throw new IllegalArgumentException("Reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    /// Registers a new Tenant (Company) and its initial Admin user. Sends a welcome
    /// email to the new admin after successful registration.
    ///
    /// @param request tenant registration details
    /// @return AuthResponse containing JWT token for the admin
    @Transactional
    public AuthResponse registerTenant(TenantRegistrationRequest request) {
        // 1. Generate unique Tenant ID
        String tenantId = generateTenantId(request.companyName());
        if (companyRepository.existsByTenantId(tenantId)) {
            tenantId = tenantId + "-" + UUID.randomUUID().toString().substring(0, 4);
        }

        Company company = Company.builder()
                .tenantId(tenantId)
                .name(request.companyName())
                .isActive(true)
                .email(request.adminEmail())
                .build();
        companyRepository.save(company);

        // 3. Switch Context to new Tenant to ensure User is saved correctly
        try {
            TenantContext.setTenantId(tenantId);

            // 4. Create Admin User
            if (userRepository.existsByEmail(request.adminEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }

            User user = new User();
            user.setUsername(request.adminEmail()); // Use email as username
            user.setEmail(request.adminEmail());
            user.setPassword(passwordEncoder.encode(request.adminPassword()));
            user.setPreferredLanguage("en");

            // Assign ADMIN role
            roleRepository.findByName("ADMIN").ifPresent(role -> user.getRoles().add(role));

            userRepository.save(user);

            // 5. Send welcome email
            emailService.sendWelcomeEmail(request.adminEmail(), request.companyName());

            return new AuthResponse(jwtUtils.generateToken(user), "Bearer");

        } finally {
            TenantContext.clear();
        }
    }

    private String generateTenantId(String companyName) {
        return companyName.toLowerCase().replaceAll("[^a-z0-9]", "-");
    }
}
