package com.enterprise.starter.kit.shared.exception;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure-unit tests for ApiExceptionHandler — no Spring context required.
 * Each test instantiates the handler directly and verifies the HTTP status
 * and body returned for every exception type.
 */
@DisplayName("ApiExceptionHandler Unit Tests")
class ApiExceptionHandlerTest {

    private ApiExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ApiExceptionHandler();
    }

    // ── 400 ───────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("IllegalArgumentException → 400 Bad Request")
    void illegalArgument_returns400() {
        var resp = handler.handleIllegalArgument(new IllegalArgumentException("bad input"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertBody(resp.getBody(), 400, "Bad Request", "bad input");
    }

    @Test
    @DisplayName("IllegalArgumentException body has timestamp field")
    void illegalArgument_bodyHasTimestamp() {
        var resp = handler.handleIllegalArgument(new IllegalArgumentException("x"));
        assertThat(resp.getBody()).containsKey("timestamp");
    }

    // ── 401 ───────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("BadCredentialsException → 401 Unauthorized")
    void badCredentials_returns401() {
        var resp = handler.handleBadCredentials(new BadCredentialsException("bad"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertBody(resp.getBody(), 401, "Unauthorized", null);
    }

    // ── 403 ───────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("AccessDeniedException → 403 Forbidden")
    void accessDenied_returns403() {
        var resp = handler.handleAccessDenied(new AccessDeniedException("denied"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertBody(resp.getBody(), 403, "Forbidden", null);
    }

    @Test
    @DisplayName("SecurityException → 403 Forbidden with original message")
    void securityException_returns403() {
        var resp = handler.handleSecurity(new SecurityException("sec violation"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(resp.getBody()).containsEntry("message", "sec violation");
    }

    // ── 404 ───────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("EntityNotFoundException → 404 Not Found")
    void entityNotFound_returns404() {
        var resp = handler.handleEntityNotFound(new EntityNotFoundException("invoice 99 not found"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertBody(resp.getBody(), 404, "Not Found", "invoice 99 not found");
    }

    // ── 409 ───────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("IllegalStateException → 409 Conflict")
    void illegalState_returns409() {
        var resp = handler.handleIllegalState(new IllegalStateException("already exists"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertBody(resp.getBody(), 409, "Conflict", "already exists");
    }

    // ── 423 ───────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("LockedException → 423 Account Locked")
    void lockedException_returns423() {
        var resp = handler.handleLocked(new LockedException("Account locked for 15 minutes"));
        assertThat(resp.getStatusCode().value()).isEqualTo(423);
        assertBody(resp.getBody(), 423, "Account Locked", null);
    }

    // ── 500 ───────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Generic Exception → 500 Internal Server Error")
    void genericException_returns500() {
        var resp = handler.handleGeneric(new RuntimeException("unexpected"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertBody(resp.getBody(), 500, "Internal Server Error", null);
    }

    @Test
    @DisplayName("500 body hides internal message from client")
    void genericException_hidesInternalMessage() {
        var resp = handler.handleGeneric(new RuntimeException("secret DB error"));
        // The message should be generic, not expose the internal exception message
        assertThat((String) resp.getBody().get("message"))
                .doesNotContain("secret DB error");
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private void assertBody(Map<String, Object> body, int status, String error, String message) {
        assertThat(body).isNotNull();
        assertThat(body.get("status")).isEqualTo(status);
        assertThat(body.get("error")).isEqualTo(error);
        if (message != null) {
            assertThat(body.get("message")).isEqualTo(message);
        }
    }
}
