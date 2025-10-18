package com.enterprise.starter.kit.modules.auth.repository;

import com.enterprise.starter.kit.modules.auth.entity.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Page<User> findByTenantId(String tenantId, Pageable pageable);

    long countByTenantId(String tenantId);

    Optional<User> findByResetToken(String resetToken);

    Optional<User> findByUsernameOrEmail(String username, String email);
}
