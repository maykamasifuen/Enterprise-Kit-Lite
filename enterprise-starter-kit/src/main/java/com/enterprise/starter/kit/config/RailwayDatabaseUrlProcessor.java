package com.enterprise.starter.kit.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Rewrites Railway's native {@code DATABASE_URL} (postgres://user:pass@host:port/db)
 * into a JDBC-compatible {@code JDBC_DATABASE_URL} (jdbc:postgresql://host:port/db?user=...&password=...)
 * so Spring Boot / HikariCP can consume it directly.
 *
 * <p>Resolution priority (highest → lowest):
 * <ol>
 *   <li>{@code JDBC_DATABASE_URL} — already a jdbc: URL, used as-is</li>
 *   <li>{@code DATABASE_URL} starting with {@code jdbc:} — used as-is</li>
 *   <li>{@code DATABASE_URL} starting with {@code postgres://} or {@code postgresql://} — rewritten to JDBC format</li>
 * </ol>
 */
public class RailwayDatabaseUrlProcessor implements EnvironmentPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(RailwayDatabaseUrlProcessor.class);

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        // Already have a JDBC URL set explicitly — nothing to do
        String jdbcUrl = System.getenv("JDBC_DATABASE_URL");
        if (jdbcUrl != null && !jdbcUrl.isBlank()) {
            log.debug("JDBC_DATABASE_URL already set, skipping DATABASE_URL rewrite");
            return;
        }

        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            log.debug("DATABASE_URL not set, skipping rewrite");
            return;
        }

        // Already a proper JDBC URL
        if (databaseUrl.startsWith("jdbc:")) {
            log.info("DATABASE_URL is already in JDBC format, injecting as JDBC_DATABASE_URL");
            injectProperty(environment, "JDBC_DATABASE_URL", databaseUrl);
            return;
        }

        // Rewrite postgres:// or postgresql:// → jdbc:postgresql://
        if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
            String rewritten = rewriteToJdbc(databaseUrl);
            if (rewritten != null) {
                log.info("Rewrote DATABASE_URL from postgres:// to jdbc:postgresql:// format");
                injectProperty(environment, "JDBC_DATABASE_URL", rewritten);
            }
        }
    }

    /**
     * Converts {@code postgres://user:pass@host:port/dbname[?params]}
     * to {@code jdbc:postgresql://host:port/dbname?user=user&password=pass[&params]}.
     */
    static String rewriteToJdbc(String url) {
        try {
            // Strip the scheme
            String stripped = url.replaceFirst("^postgres(?:ql)?://", "");

            // Split userinfo from the rest: userinfo@host:port/db
            String userInfo = null;
            String hostPart;
            int atIdx = stripped.indexOf('@');
            if (atIdx >= 0) {
                userInfo = stripped.substring(0, atIdx);
                hostPart = stripped.substring(atIdx + 1);
            } else {
                hostPart = stripped;
            }

            // Build jdbc URL
            String jdbcUrl = "jdbc:postgresql://" + hostPart;

            // Append userinfo as query parameters
            if (userInfo != null && !userInfo.isBlank()) {
                String user;
                String password = null;
                int colonIdx = userInfo.indexOf(':');
                if (colonIdx >= 0) {
                    user = userInfo.substring(0, colonIdx);
                    password = userInfo.substring(colonIdx + 1);
                } else {
                    user = userInfo;
                }
                // Append to existing query string or start new one
                String separator = jdbcUrl.contains("?") ? "&" : "?";
                jdbcUrl = jdbcUrl + separator + "user=" + user;
                if (password != null && !password.isBlank()) {
                    jdbcUrl = jdbcUrl + "&password=" + password;
                }
            }

            // Railway Postgres requires SSL — add sslmode=require if not already present
            if (!jdbcUrl.contains("sslmode=") && !jdbcUrl.contains("ssl=")) {
                String separator = jdbcUrl.contains("?") ? "&" : "?";
                jdbcUrl = jdbcUrl + separator + "sslmode=require";
            }

            return jdbcUrl;
        } catch (Exception e) {
            log.error("Failed to rewrite DATABASE_URL to JDBC format: {}", e.getMessage());
            return null;
        }
    }

    private void injectProperty(ConfigurableEnvironment environment, String key, String value) {
        Map<String, Object> props = new HashMap<>();
        props.put(key, value);
        // Add with highest priority (first in property source list)
        environment.getPropertySources().addFirst(
                new MapPropertySource("railwayDatabaseUrlRewrite", props)
        );
    }
}

