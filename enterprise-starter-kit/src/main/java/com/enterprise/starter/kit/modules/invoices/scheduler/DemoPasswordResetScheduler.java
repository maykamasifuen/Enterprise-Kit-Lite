package com.enterprise.starter.kit.modules.invoices.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Resets demo user passwords every day at 03:00 AM.
 *
 * Active only when the "demo" Spring profile is enabled.
 * Enable it by setting:  SPRING_PROFILES_ACTIVE=docker,demo  (or prod,demo)
 *
 * No Docker changes, no pg_cron extension, no shell scripts —
 * runs entirely as a Spring scheduled job inside the application.
 */
@Component
@Profile("demo")
public class DemoPasswordResetScheduler {

    private static final Logger log = LoggerFactory.getLogger(DemoPasswordResetScheduler.class);

    // BCrypt hashes — must match the values in V22 / V1 migrations
    private static final String HASH_DEMO123       = "$2b$10$4/zrsaGts1BWK4Uo5QrxF.HFb9W3XQKyMbY1lk.OkNvAVl5N2HcwG";
    private static final String HASH_ADMIN123      = "$2b$10$IeOAoh9ni/lWDXbN1xmLWesCBUoa0oNt0lgh8gXfkQqmRh/wZVpxW";
    private static final String HASH_SUPERADMIN123 = "$2a$10$BMcF3podZtH2iAUx.j4hF.UjknCjfzwbAD6ZtMKx1OUnaWr6L9vaa";

    private final JdbcTemplate jdbc;

    public DemoPasswordResetScheduler(JdbcTemplate jdbcTemplate) {
        this.jdbc = jdbcTemplate;
    }

    /** Runs every day at 03:00 AM */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void resetDemoPasswords() {
        log.info("Demo password reset started...");

        // 1. Reset demo tenant users → demo123
        int demoCount = jdbc.update("""
                UPDATE users
                SET    password              = ?,
                       failed_login_attempts = 0,
                       locked_until          = NULL,
                       is_active             = TRUE
                WHERE  username IN ('acme.admin', 'acme.user', 'alnoor.admin', 'sd.admin', 'testuser')
                """, HASH_DEMO123);

        // 2. Reset admin → admin123
        int adminCount = jdbc.update("""
                UPDATE users
                SET    password              = ?,
                       failed_login_attempts = 0,
                       locked_until          = NULL,
                       is_active             = TRUE
                WHERE  username = 'admin'
                """, HASH_ADMIN123);

        // 3. Reset superadmin → superadmin123
        int superCount = jdbc.update("""
                UPDATE users
                SET    password              = ?,
                       failed_login_attempts = 0,
                       locked_until          = NULL,
                       is_active             = TRUE
                WHERE  username = 'superadmin'
                """, HASH_SUPERADMIN123);

        // 4. Unlock any locked accounts
        jdbc.update("""
                UPDATE users
                SET    failed_login_attempts = 0,
                       locked_until          = NULL
                WHERE  locked_until IS NOT NULL
                   OR  failed_login_attempts > 0
                """);

        // 5. Invalidate all refresh tokens — forces re-login with reset passwords
        jdbc.update("DELETE FROM refresh_tokens");

        log.info("Demo password reset complete — demo users: {}, admin: {}, superadmin: {}",
                demoCount, adminCount, superCount);
    }
}

