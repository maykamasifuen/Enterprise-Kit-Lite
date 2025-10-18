package com.enterprise.starter.kit.config.security;

import com.enterprise.starter.kit.modules.auth.entity.Role;
import com.enterprise.starter.kit.modules.auth.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Utility service for JWT token generation, validation, and claims extraction.
 *
 * <p>Uses jjwt 0.12.x fluent API. Configuration via {@code application.yml}:
 * <ul>
 *   <li>{@code jwt.secret} — Base64-encoded HMAC secret key</li>
 *   <li>{@code jwt.expiration} — token TTL in seconds (default 3600)</li>
 * </ul>
 */
@Component
public class JwtUtils {

    private final SecretKey signingKey;
    private final long expirationSeconds;

    public JwtUtils(
            @Value("${jwt.secret}") String secretBase64,
            @Value("${jwt.expiration:3600}") long expirationSeconds) {
        this.signingKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretBase64));
        this.expirationSeconds = expirationSeconds;
    }

    /**
     * Generates a JWT token for the given user with tenantId, roles, fullName,
     * and preferredLanguage claims.
     */
    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(expirationSeconds);

        List<String> roles = user.getRoles() == null
                ? Collections.emptyList()
                : user.getRoles().stream().map(Role::getName).collect(Collectors.toList());

        return Jwts.builder()
                .subject(user.getUsername())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .claim("tenantId", user.getTenantId())
                .claim("roles", roles)
                .claim("fullName", user.getFullName())
                .claim("preferredLanguage",
                        user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "en")
                .signWith(signingKey)
                .compact();
    }

    /** Returns {@code true} if the token is valid and not expired for the given user. */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            return extractUsername(token).equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /** Extracts the username (subject) from a JWT token. */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Extracts the roles list from the JWT token claims. */
    public List<String> extractRoles(String token) {
        List<?> roles = extractClaim(token, c -> c.get("roles", List.class));
        return roles == null ? Collections.emptyList()
                : roles.stream().map(String::valueOf).toList();
    }

    /** Extracts a named String claim from the JWT token. */
    public String getClaimFromToken(String token, String claimName) {
        return extractClaim(token, c -> c.get(claimName, String.class));
    }

    /** Generic claim extractor. */
    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }
    /** Extracts tenantId from the JWT token claims. */
    public String getTenantIdFromToken(String token) {
        try {
            String tenantId = getClaimFromToken(token, "tenantId");
            return tenantId != null ? tenantId : "system";
        } catch (Exception e) {
            return "system";
        }
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
}
