package com.enterprise.starter.kit.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter for authentication endpoints.
 *
 * <p>Allows up to {@value #MAX_REQUESTS} requests per IP per {@value #WINDOW_SECONDS}-second
 * window on any {@code /api/auth/**} endpoint. Returns HTTP 429 when the limit is
 * exceeded.
 *
 * <p>This is a lightweight, zero-dependency implementation. For production
 * deployments behind multiple instances, replace with Redis-based rate limiting.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int    MAX_REQUESTS    = 20;
    private static final long   WINDOW_SECONDS  = 60L;
    private static final String AUTH_PATH       = "/api/auth/";

    private record RequestCount(AtomicInteger count, Instant windowStart) {}

    private final Map<String, RequestCount> ipBuckets = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith(AUTH_PATH);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {

        String ip = resolveClientIp(request);
        Instant now = Instant.now();

        RequestCount bucket = ipBuckets.compute(ip, (key, existing) -> {
            if (existing == null || now.isAfter(existing.windowStart().plusSeconds(WINDOW_SECONDS))) {
                return new RequestCount(new AtomicInteger(1), now);
            }
            existing.count().incrementAndGet();
            return existing;
        });

        if (bucket.count().get() > MAX_REQUESTS) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"error\":\"Too many requests. Please try again in " + WINDOW_SECONDS + " seconds.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

