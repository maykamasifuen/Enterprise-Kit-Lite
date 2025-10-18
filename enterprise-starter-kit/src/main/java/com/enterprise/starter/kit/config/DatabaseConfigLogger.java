package com.enterprise.starter.kit.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class DatabaseConfigLogger {
    private static final Logger log = LoggerFactory.getLogger(DatabaseConfigLogger.class);

    @Value("${spring.datasource.url:#{null}}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:#{null}}")
    private String datasourceUsername;

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${PGHOST:#{null}}")
    private String pgHost;

    @Value("${PGPORT:#{null}}")
    private String pgPort;

    @Value("${PGDATABASE:#{null}}")
    private String pgDatabase;

    @Value("${PGUSER:#{null}}")
    private String pgUser;

    @Value("${PGPASSWORD:#{null}}")
    private String pgPassword;

    // Static block runs before Spring context initialization
    static {
        Logger staticLog = LoggerFactory.getLogger(DatabaseConfigLogger.class);
        staticLog.info("=== STATIC: Environment Variables Check ===");
        staticLog.info("DATABASE_URL: {}", maskValue(System.getenv("DATABASE_URL")));
        staticLog.info("PGHOST: {}", System.getenv("PGHOST"));
        staticLog.info("PGPORT: {}", System.getenv("PGPORT"));
        staticLog.info("PGDATABASE: {}", System.getenv("PGDATABASE"));
        staticLog.info("PGUSER: {}", System.getenv("PGUSER"));
        staticLog.info("PGPASSWORD: {}", maskValue(System.getenv("PGPASSWORD")));
        staticLog.info("DB_USERNAME: {}", System.getenv("DB_USERNAME"));
        staticLog.info("DB_PASSWORD: {}", maskValue(System.getenv("DB_PASSWORD")));
        staticLog.info("SPRING_PROFILES_ACTIVE: {}", System.getenv("SPRING_PROFILES_ACTIVE"));
        staticLog.info("JWT_SECRET: {}", maskValue(System.getenv("JWT_SECRET")));
        staticLog.info("PORT: {}", System.getenv("PORT"));
        staticLog.info("===========================================");
    }

    @PostConstruct
    public void logDatabaseConfiguration() {
        log.info("=== Database Configuration at Startup ===");
        log.info("Resolved datasource URL: {}", maskUrl(datasourceUrl));
        log.info("Resolved datasource username: {}", datasourceUsername);
        log.info("DATABASE_URL env var: {}", maskUrl(databaseUrl));
        log.info("PGHOST env var: {}", pgHost);
        log.info("PGPORT env var: {}", pgPort);
        log.info("PGDATABASE env var: {}", pgDatabase);
        log.info("PGUSER env var: {}", pgUser);
        log.info("PGPASSWORD env var: {}", maskPassword(pgPassword));
        log.info("========================================");
    }

    private String maskUrl(String url) {
        if (url == null) return "null";
        // Mask password in JDBC URLs
        return url.replaceAll("password=[^&]*", "password=***");
    }

    private String maskPassword(String password) {
        return password != null ? "***" + password.substring(Math.max(0, password.length() - 4)) : "null";
    }

    private static String maskValue(String value) {
        return value != null ? "***" + value.substring(Math.max(0, value.length() - 4)) : "null";
    }
}
