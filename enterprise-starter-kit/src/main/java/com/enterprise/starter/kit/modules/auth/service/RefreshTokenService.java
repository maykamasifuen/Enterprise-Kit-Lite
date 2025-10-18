package com.enterprise.starter.kit.modules.auth.service;

import com.enterprise.starter.kit.modules.auth.entity.RefreshToken;
import com.enterprise.starter.kit.modules.auth.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);
    private static final long REFRESH_TTL_DAYS = 7;

    private final RefreshTokenRepository repository;

    public RefreshTokenService(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public String createRefreshToken(String username) {
        // Revoke any existing tokens for this user (single active session per user)
        repository.deleteByUsername(username);
        String token = UUID.randomUUID().toString();
        repository.save(new RefreshToken(token, username, LocalDateTime.now().plusDays(REFRESH_TTL_DAYS)));
        return token;
    }

    @Transactional(readOnly = true)
    public RefreshToken validateRefreshToken(String token) {
        RefreshToken rt = repository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        if (rt.isExpired()) {
            repository.delete(rt);
            throw new IllegalArgumentException("Refresh token has expired. Please log in again.");
        }
        return rt;
    }

    @Transactional
    public void revokeByUsername(String username) {
        repository.deleteByUsername(username);
    }

    /** Purge expired tokens daily at 03:00 */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void purgeExpiredTokens() {
        repository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Purged expired refresh tokens");
    }
}

