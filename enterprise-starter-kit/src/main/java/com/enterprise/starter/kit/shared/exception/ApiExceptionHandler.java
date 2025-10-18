package com.enterprise.starter.kit.shared.exception;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global API exception handler.
 *
 * <p>Primary goal: return predictable, client-friendly error responses.
 *
 * <p>This handler intentionally maps {@link IllegalArgumentException} to HTTP 400.
 * The Excel import pipeline (Apache POI + reflection-based conversion) uses
 * {@code IllegalArgumentException} to signal invalid input such as:
 * <ul>
 *   <li>Unsupported target field types</li>
 *   <li>Invalid numeric values (e.g., non-numeric amount)</li>
 *   <li>Invalid dates (e.g., wrong LocalDate format)</li>
 * </ul>
 */
@ControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    // ── 400 Bad Request ──────────────────────────────────────────────────────

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.debug("Bad request: {}", ex.getMessage());
        // Duplicate resource messages → 409
        String msg = ex.getMessage() != null ? ex.getMessage() : "";
        if (msg.contains("already exists") || msg.contains("duplicate") || msg.contains("Duplicate")) {
            return errorResponse(HttpStatus.CONFLICT, "Conflict", msg);
        }
        return errorResponse(HttpStatus.BAD_REQUEST, "Bad Request", msg);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.debug("Data integrity violation: {}", ex.getMessage());
        return errorResponse(HttpStatus.CONFLICT, "Conflict", "A record with the same unique value already exists.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());
        Map<String, Object> body = baseBody(HttpStatus.BAD_REQUEST, "Validation Failed");
        body.put("errors", fieldErrors);
        log.debug("Validation failed: {}", fieldErrors);
        return ResponseEntity.badRequest().contentType(MediaType.APPLICATION_JSON).body(body);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String msg = "Parameter '%s' must be of type %s".formatted(
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        return errorResponse(HttpStatus.BAD_REQUEST, "Type Mismatch", msg);
    }

    // ── 401 Unauthorized ─────────────────────────────────────────────────────

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        log.debug("Bad credentials: {}", ex.getMessage());
        return errorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", "Invalid username or password.");
    }

    // ── 403 Forbidden ────────────────────────────────────────────────────────

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return errorResponse(HttpStatus.FORBIDDEN, "Forbidden",
                "You do not have permission to perform this action.");
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, Object>> handleSecurity(SecurityException ex) {
        log.warn("Security violation: {}", ex.getMessage());
        return errorResponse(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage());
    }

    // ── 423 Locked ───────────────────────────────────────────────────────────

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<Map<String, Object>> handleLocked(LockedException ex) {
        log.warn("Account locked: {}", ex.getMessage());
        return errorResponse(HttpStatus.valueOf(423), "Account Locked", ex.getMessage());
    }

    // ── 404 Not Found ────────────────────────────────────────────────────────

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFound(EntityNotFoundException ex) {
        log.debug("Entity not found: {}", ex.getMessage());
        return errorResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage());
    }

    // ── 409 Conflict ─────────────────────────────────────────────────────────

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        log.warn("Conflict: {}", ex.getMessage());
        return errorResponse(HttpStatus.CONFLICT, "Conflict", ex.getMessage());
    }

    // ── 500 Internal Server Error ────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                "An unexpected error occurred. Please try again later.");
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> errorResponse(HttpStatus status, String error, String message) {
        Map<String, Object> body = baseBody(status, error);
        body.put("message", message);
        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_JSON).body(body);
    }

    private Map<String, Object> baseBody(HttpStatus status, String error) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", error);
        return body;
    }
}
