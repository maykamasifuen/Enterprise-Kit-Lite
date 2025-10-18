package com.enterprise.starter.kit.modules.auth.dto;

public record AuthResponse(String token, String tokenType, String refreshToken) {
    /** Convenience constructor for callers that don't issue refresh tokens */
    public AuthResponse(String token, String tokenType) {
        this(token, tokenType, null);
    }
}
