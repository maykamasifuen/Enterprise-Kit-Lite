package com.enterprise.starter.kit.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class EnvironmentLogger {
    private static final Logger log = LoggerFactory.getLogger(EnvironmentLogger.class);

    @EventListener(ApplicationReadyEvent.class)
    public void logEnvironmentVariables() {
        log.info("=== Railway Environment Variables ===");
        log.info("DATABASE_URL: {}", maskIfPresent(System.getenv("DATABASE_URL")));
        log.info("PGHOST: {}", System.getenv("PGHOST"));
        log.info("PGPORT: {}", System.getenv("PGPORT"));
        log.info("PGDATABASE: {}", System.getenv("PGDATABASE"));
        log.info("PGUSER: {}", System.getenv("PGUSER"));
        log.info("PGPASSWORD: {}", maskIfPresent(System.getenv("PGPASSWORD")));
        log.info("DB_USERNAME: {}", System.getenv("DB_USERNAME"));
        log.info("DB_PASSWORD: {}", maskIfPresent(System.getenv("DB_PASSWORD")));
        log.info("JWT_SECRET: {}", maskIfPresent(System.getenv("JWT_SECRET")));
        log.info("PORT: {}", System.getenv("PORT"));
        log.info("SPRING_PROFILES_ACTIVE: {}", System.getenv("SPRING_PROFILES_ACTIVE"));
        log.info("====================================");
    }

    private String maskIfPresent(String value) {
        return value != null ? "***" + value.substring(Math.max(0, value.length() - 4)) : "null";
    }
}
