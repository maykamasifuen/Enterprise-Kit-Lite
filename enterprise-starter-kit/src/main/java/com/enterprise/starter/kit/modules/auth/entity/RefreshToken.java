package com.enterprise.starter.kit.modules.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 512)
    private String token;

    @Column(nullable = false, length = 150)
    private String username;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public RefreshToken() {}

    public RefreshToken(String token, String username, LocalDateTime expiresAt) {
        this.token = token;
        this.username = username;
        this.expiresAt = expiresAt;
    }

    public Long getId() { return id; }
    public String getToken() { return token; }
    public String getUsername() { return username; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isExpired() { return expiresAt.isBefore(LocalDateTime.now()); }
}

