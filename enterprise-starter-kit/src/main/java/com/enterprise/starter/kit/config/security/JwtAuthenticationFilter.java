package com.enterprise.starter.kit.config.security;

import com.enterprise.starter.kit.modules.auth.service.CustomUserDetailsService;
import com.enterprise.starter.kit.shared.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/// Spring Security filter that intercepts HTTP requests to validate JWT tokens.
///
/// This filter executes once per request and performs the following steps:
/// 1. Extracts the JWT token from the Authorization header (Bearer scheme)
/// 2. Validates the token and extracts the username
/// 3. Loads user details from the database
/// 4. Sets the authentication in SecurityContext if valid
///
/// **Token Format:**
/// ```
/// Authorization: Bearer <jwt-token>
/// ```
///
/// **Behavior:**
/// - If no token is present or invalid, the request continues without authentication
/// - Spring Security's authorization filters will deny access to protected endpoints
/// - Exceptions during token processing are logged but don't fail the request
///
/// @see SecurityConfig for filter chain integration
/// @see JwtUtils for token validation logic
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, CustomUserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                String tokenParam = request.getParameter("token");
                if (tokenParam != null && !tokenParam.isBlank()) {
                    authHeader = "Bearer " + tokenParam.trim();
                }
            }
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtUtils.extractUsername(token);
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    if (jwtUtils.isTokenValid(token, userDetails)) {
                        String tenantId = jwtUtils.getClaimFromToken(token, "tenantId");
                        log.debug("Extracted tenantId from token: {}", tenantId);
                        if (tenantId != null) {
                            try {
                                TenantContext.setTenantId(tenantId);
                            } catch (Exception e) {
                                log.warn("Could not set tenantId in TenantContext: {}", e.getMessage());
                            }
                        }
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Authentication check failed: {}", e.getMessage());
        }
        try {
            filterChain.doFilter(request, response);
        } finally {
            try {
                TenantContext.clear();
            } catch (Exception e) {
                log.warn("Could not clear TenantContext: {}", e.getMessage());
            }
        }
    }
}