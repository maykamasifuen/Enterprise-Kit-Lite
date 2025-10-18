package com.enterprise.starter.kit.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Adds security-hardening HTTP response headers to every response.
 *
 * <ul>
 *   <li>X-Content-Type-Options: nosniff — prevents MIME-type sniffing</li>
 *   <li>X-Frame-Options: DENY — prevents clickjacking</li>
 *   <li>Content-Security-Policy — restricts resource origins</li>
 *   <li>Referrer-Policy — controls Referer header leakage</li>
 *   <li>Permissions-Policy — disables unused browser features</li>
 *   <li>Strict-Transport-Security — forces HTTPS (1 year)</li>
 * </ul>
 */
@Component
@Order(1)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Permissions-Policy",
                "camera=(), microphone=(), geolocation=(), payment=()");
        response.setHeader("Strict-Transport-Security",
                "max-age=31536000; includeSubDomains");
        response.setHeader("Content-Security-Policy",
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self' data:; " +
                "connect-src 'self'; " +
                "frame-ancestors 'none';");

        filterChain.doFilter(request, response);
    }
}

