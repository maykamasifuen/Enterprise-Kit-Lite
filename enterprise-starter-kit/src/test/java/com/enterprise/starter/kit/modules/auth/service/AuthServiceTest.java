package com.enterprise.starter.kit.modules.auth.service;

import com.enterprise.starter.kit.config.security.JwtUtils;
import com.enterprise.starter.kit.config.security.OAuth2Properties;
import com.enterprise.starter.kit.modules.auth.dto.LoginRequest;
import com.enterprise.starter.kit.modules.auth.dto.RegisterRequest;
import com.enterprise.starter.kit.modules.auth.entity.RefreshToken;
import com.enterprise.starter.kit.modules.auth.entity.Role;
import com.enterprise.starter.kit.modules.auth.entity.User;
import com.enterprise.starter.kit.modules.auth.repository.RoleRepository;
import com.enterprise.starter.kit.modules.auth.repository.UserRepository;
import com.enterprise.starter.kit.modules.notification.service.EmailService;
import com.enterprise.starter.kit.modules.tenant.repository.CompanyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private AuthenticationManager authManager;
    @Mock private UserRepository userRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private EmailService emailService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtils jwtUtils;
    @Mock private RefreshTokenService refreshTokenService;
    @Mock private OAuth2Properties oauth2Properties;

    @InjectMocks private AuthService authService;

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User activeUser(String username, String email) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword("encoded");
        u.setFailedLoginAttempts(0);
        u.setLockedUntil(null);
        return u;
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("login: valid credentials → returns AuthResponse with token")
    void login_validCredentials_returnsAuthResponse() {
        User user = activeUser("alice", "alice@example.com");
        var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        when(userRepository.findByUsernameOrEmail("alice", "alice")).thenReturn(Optional.of(user));
        when(authManager.authenticate(any())).thenReturn(auth);
        when(refreshTokenService.createRefreshToken("alice")).thenReturn("rt-token");
        when(jwtUtils.generateToken(user)).thenReturn("jwt-token");

        var result = authService.login(new LoginRequest("alice", "secret"));

        assertThat(result.token()).isEqualTo("jwt-token");
        assertThat(result.tokenType()).isEqualTo("Bearer");
        assertThat(result.refreshToken()).isEqualTo("rt-token");
    }

    @Test
    @DisplayName("login: resets failed-attempts counter on success")
    void login_resetsFailedAttemptsOnSuccess() {
        User user = activeUser("bob", "bob@example.com");
        user.setFailedLoginAttempts(3);
        var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        when(userRepository.findByUsernameOrEmail("bob", "bob")).thenReturn(Optional.of(user));
        when(authManager.authenticate(any())).thenReturn(auth);
        when(refreshTokenService.createRefreshToken("bob")).thenReturn("rt");
        when(jwtUtils.generateToken(user)).thenReturn("jwt");

        authService.login(new LoginRequest("bob", "pass"));

        assertThat(user.getFailedLoginAttempts()).isZero();
        assertThat(user.getLockedUntil()).isNull();
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("login: increments failed-attempts on bad credentials")
    void login_incrementsFailedAttempts_onBadCredentials() {
        User user = activeUser("carol", "carol@example.com");
        when(userRepository.findByUsernameOrEmail("carol", "carol")).thenReturn(Optional.of(user));
        when(authManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("carol", "wrong")))
                .isInstanceOf(BadCredentialsException.class);

        assertThat(user.getFailedLoginAttempts()).isEqualTo(1);
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("login: locks account after 5 consecutive failures")
    void login_locksAccountAfterMaxFailures() {
        User user = activeUser("dave", "dave@example.com");
        user.setFailedLoginAttempts(4);
        when(userRepository.findByUsernameOrEmail("dave", "dave")).thenReturn(Optional.of(user));
        when(authManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("dave", "wrong")))
                .isInstanceOf(BadCredentialsException.class);

        assertThat(user.getLockedUntil()).isAfter(LocalDateTime.now());
        assertThat(user.getFailedLoginAttempts()).isEqualTo(5);
    }

    @Test
    @DisplayName("login: throws LockedException when account is still locked")
    void login_throwsLocked_whenAccountLockedUntilFuture() {
        User user = activeUser("eve", "eve@example.com");
        user.setLockedUntil(LocalDateTime.now().plusMinutes(10));
        when(userRepository.findByUsernameOrEmail("eve", "eve")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(new LoginRequest("eve", "pass")))
                .isInstanceOf(LockedException.class);

        verify(authManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("login: expired lock is ignored and proceeds with auth")
    void login_expiredLock_proceedsNormally() {
        User user = activeUser("frank", "frank@example.com");
        user.setLockedUntil(LocalDateTime.now().minusMinutes(1)); // expired
        var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        when(userRepository.findByUsernameOrEmail("frank", "frank")).thenReturn(Optional.of(user));
        when(authManager.authenticate(any())).thenReturn(auth);
        when(refreshTokenService.createRefreshToken("frank")).thenReturn("rt");
        when(jwtUtils.generateToken(user)).thenReturn("jwt");

        var result = authService.login(new LoginRequest("frank", "pass"));

        assertThat(result.token()).isEqualTo("jwt");
    }

    // ── register ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("register: new user → persists and returns token")
    void register_newUser_persistsAndReturnsToken() {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("StrongPass1!")).thenReturn("encoded");

        User saved = activeUser("newuser", "new@example.com");
        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(jwtUtils.generateToken(any(User.class))).thenReturn("jwt-new");

        var result = authService.register(new RegisterRequest("newuser", "new@example.com", "StrongPass1!"));

        assertThat(result.token()).isEqualTo("jwt-new");
        assertThat(result.tokenType()).isEqualTo("Bearer");
        verify(passwordEncoder).encode("StrongPass1!");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register: duplicate username → throws IllegalArgumentException")
    void register_duplicateUsername_throws() {
        when(userRepository.existsByUsername("taken")).thenReturn(true);

        assertThatThrownBy(() ->
                authService.register(new RegisterRequest("taken", "other@example.com", "Pass12345!")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username");
    }

    @Test
    @DisplayName("register: duplicate email → throws IllegalArgumentException")
    void register_duplicateEmail_throws() {
        when(userRepository.existsByUsername("unique")).thenReturn(false);
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        assertThatThrownBy(() ->
                authService.register(new RegisterRequest("unique", "dup@example.com", "Pass12345!")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email");
    }

    // ── forgotPassword ────────────────────────────────────────────────────────

    @Test
    @DisplayName("forgotPassword: known email → saves reset token and sends email")
    void forgotPassword_knownEmail_savesTokenAndSendsEmail() {
        User user = activeUser("grace", "grace@example.com");
        when(userRepository.findByEmail("grace@example.com")).thenReturn(Optional.of(user));

        authService.forgotPassword("grace@example.com");

        assertThat(user.getResetToken()).isNotNull();
        assertThat(user.getResetTokenExpiry()).isAfter(LocalDateTime.now());
        verify(userRepository).save(user);
        verify(emailService).sendPasswordResetEmail(eq("grace@example.com"), anyString());
    }

    @Test
    @DisplayName("forgotPassword: unknown email → silently succeeds (no enumeration)")
    void forgotPassword_unknownEmail_silentlySucceeds() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatCode(() -> authService.forgotPassword("unknown@example.com")).doesNotThrowAnyException();
        verify(emailService, never()).sendPasswordResetEmail(any(), any());
    }

    // ── resetPassword ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("resetPassword: valid token → updates password and clears token")
    void resetPassword_validToken_updatesPassword() {
        User user = activeUser("hank", "hank@example.com");
        user.setResetToken("valid-token");
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        when(userRepository.findByResetToken("valid-token")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPass123!")).thenReturn("encoded-new");

        authService.resetPassword("valid-token", "NewPass123!");

        assertThat(user.getPassword()).isEqualTo("encoded-new");
        assertThat(user.getResetToken()).isNull();
        assertThat(user.getResetTokenExpiry()).isNull();
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("resetPassword: invalid token → throws IllegalArgumentException")
    void resetPassword_invalidToken_throws() {
        when(userRepository.findByResetToken("bad-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.resetPassword("bad-token", "NewPass123!"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid");
    }

    @Test
    @DisplayName("resetPassword: expired token → throws and clears token fields")
    void resetPassword_expiredToken_throwsAndClearsToken() {
        User user = activeUser("ivy", "ivy@example.com");
        user.setResetToken("expired-token");
        user.setResetTokenExpiry(LocalDateTime.now().minusHours(1)); // expired
        when(userRepository.findByResetToken("expired-token")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.resetPassword("expired-token", "NewPass123!"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("expired");

        assertThat(user.getResetToken()).isNull();
        assertThat(user.getResetTokenExpiry()).isNull();
    }

    // ── refreshAccessToken ────────────────────────────────────────────────────

    @Test
    @DisplayName("refreshAccessToken: valid token → returns new token pair")
    void refreshAccessToken_validToken_returnsNewPair() {
        RefreshToken rt = new RefreshToken("rt-value", "jack", LocalDateTime.now().plusDays(6));
        User user = activeUser("jack", "jack@example.com");
        when(refreshTokenService.validateRefreshToken("rt-value")).thenReturn(rt);
        when(userRepository.findByUsername("jack")).thenReturn(Optional.of(user));
        when(jwtUtils.generateToken(user)).thenReturn("new-jwt");
        when(refreshTokenService.createRefreshToken("jack")).thenReturn("new-rt");

        var result = authService.refreshAccessToken("rt-value");

        assertThat(result.token()).isEqualTo("new-jwt");
        assertThat(result.refreshToken()).isEqualTo("new-rt");
    }

    @Test
    @DisplayName("refreshAccessToken: user not found → throws")
    void refreshAccessToken_userNotFound_throws() {
        RefreshToken rt = new RefreshToken("rt-value", "ghost", LocalDateTime.now().plusDays(1));
        when(refreshTokenService.validateRefreshToken("rt-value")).thenReturn(rt);
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refreshAccessToken("rt-value"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");
    }

    // ── logout ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("logout: revokes refresh tokens for the user")
    void logout_revokesRefreshTokens() {
        authService.logout("alice");
        verify(refreshTokenService).revokeByUsername("alice");
    }
}

