package com.enterprise.starter.kit.modules.auth.controller;

import com.enterprise.starter.kit.modules.auth.dto.AuthResponse;
import com.enterprise.starter.kit.modules.auth.dto.ForgotPasswordRequest;
import com.enterprise.starter.kit.modules.auth.dto.LoginRequest;
import com.enterprise.starter.kit.modules.auth.dto.RegisterRequest;
import com.enterprise.starter.kit.modules.auth.dto.ResetPasswordRequest;
import com.enterprise.starter.kit.modules.auth.service.AuthService;
import com.enterprise.starter.kit.shared.exception.ApiExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    MockMvc mockMvc;
    final ObjectMapper objectMapper = new ObjectMapper();

    @Mock AuthService authService;
    @InjectMocks AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/auth/login → 200 with tokens on valid credentials")
    void login_validCredentials_returns200() throws Exception {
        var response = new AuthResponse("access-token", "Bearer", "refresh-token");
        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("user@example.com", "password"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    @DisplayName("POST /api/auth/login → 401 on bad credentials")
    void login_badCredentials_returns401() throws Exception {
        when(authService.login(any(LoginRequest.class))).thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("user@example.com", "wrong"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/login → 423 when account is locked")
    void login_lockedAccount_returns423() throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new LockedException("Account locked"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("locked@example.com", "pass"))))
                .andExpect(status().is(423))
                .andExpect(jsonPath("$.error").value("Account Locked"));
    }

    @Test
    @DisplayName("POST /api/auth/login → 400 on blank body")
    void login_blankBody_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register → 200 on new user")
    void register_newUser_returns200() throws Exception {
        var response = new AuthResponse("token", "Bearer", null);
        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("newuser", "new@example.com", "StrongPass1!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"));
    }

    @Test
    @DisplayName("POST /api/auth/register → 409 on duplicate email")
    void register_duplicateEmail_returns409() throws Exception {
        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new IllegalStateException("Email already in use"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("user2", "dup@example.com", "ValidPass1!"))))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /api/auth/register → 400 when username too short (<3 chars)")
    void register_shortUsername_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("ab", "ok@example.com", "StrongPass1!"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register → 400 when password too short (<8 chars)")
    void register_shortPassword_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("validuser", "ok@example.com", "short"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register → 400 when email is malformed")
    void register_invalidEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("validuser", "not-an-email", "StrongPass1!"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/forgot-password → 200 always (no enumeration)")
    void forgotPassword_returns200_always() throws Exception {
        doNothing().when(authService).forgotPassword(any());

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ForgotPasswordRequest("anyone@example.com"))))
                .andExpect(status().isOk());

        verify(authService).forgotPassword("anyone@example.com");
    }

    @Test
    @DisplayName("POST /api/auth/forgot-password → 400 when email is blank")
    void forgotPassword_blankEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/reset-password → 200 on valid token")
    void resetPassword_validToken_returns200() throws Exception {
        doNothing().when(authService).resetPassword(eq("valid-token"), any());

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ResetPasswordRequest("valid-token", "NewPass123!"))))
                .andExpect(status().isOk());

        verify(authService).resetPassword("valid-token", "NewPass123!");
    }

    @Test
    @DisplayName("POST /api/auth/reset-password → 400 on expired/invalid token")
    void resetPassword_invalidToken_returns400() throws Exception {
        doThrow(new IllegalArgumentException("Invalid or expired reset token"))
                .when(authService).resetPassword(eq("bad-token"), any());

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ResetPasswordRequest("bad-token", "NewPass123!"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh → 200 with new token pair")
    void refresh_validToken_returns200() throws Exception {
        var response = new AuthResponse("new-access", "Bearer", "new-refresh");
        when(authService.refreshAccessToken("my-refresh-token")).thenReturn(response);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"my-refresh-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("new-access"))
                .andExpect(jsonPath("$.refreshToken").value("new-refresh"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh → 400 when refresh token is invalid")
    void refresh_invalidToken_returns400() throws Exception {
        when(authService.refreshAccessToken("expired")).thenThrow(
                new IllegalArgumentException("Refresh token has expired"));

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"expired\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login → response body has timestamp and status fields")
    void login_errorResponse_hasTimestampAndStatusFields() throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("bad"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("u", "p"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.message").exists());
    }
}
