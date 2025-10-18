package com.enterprise.starter.kit.modules.auth.service;

import com.enterprise.starter.kit.modules.auth.entity.User;
import com.enterprise.starter.kit.modules.auth.repository.UserRepository;
import java.util.Optional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/// Custom UserDetailsService implementation that loads users by username or email.
///
/// This service integrates with Spring Security's authentication mechanism and supports
/// flexible user lookup by either username or email address (case-insensitive).
///
/// @see org.springframework.security.core.userdetails.UserDetailsService
/// @see SecurityConfig for integration with authentication provider
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        if (usernameOrEmail.isBlank()) {
            throw new UsernameNotFoundException("Username/email is blank");
        }

        String key = usernameOrEmail.trim();

        Optional<User> user = userRepository.findByUsernameIgnoreCase(key);
        if (user.isEmpty()) {
            user = userRepository.findByEmailIgnoreCase(key);
        }

        return user.orElseThrow(() -> new UsernameNotFoundException("User not found: " + usernameOrEmail));
    }
}
