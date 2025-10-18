package com.enterprise.starter.kit.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.web.client.RestTemplate;
import java.util.Optional;

/**
 * Application-wide configuration.
 *
 * <ul>
 *   <li><b>JPA Auditing</b> — populates {@code createdAt}, {@code updatedAt},
 *       {@code createdBy}, {@code lastModifiedBy} on every {@link com.enterprise.starter.kit.shared.BaseEntity}.</li>
 * </ul>
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class AppConfig {

    private static final Logger log = LoggerFactory.getLogger(AppConfig.class);

    /** Supplies the current username to JPA Auditing ({@code createdBy} / {@code lastModifiedBy}). */
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return Optional.of("system");
            }
            Object principal = auth.getPrincipal();
            if (principal instanceof UserDetails ud) {
                return Optional.of(ud.getUsername());
            }
            return Optional.of(principal.toString());
        };
    }

    /**
     * Application-wide {@link ObjectMapper} — ISO-8601 dates, no timestamp serialization,
     * Java Time support via {@link JavaTimeModule}.
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        return mapper;
    }


    /**
     * RestTemplate bean for outgoing HTTP calls (e.g. webhook delivery).
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

