package com.enterprise.starter.kit.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * Global OpenAPI / Swagger configuration.
 *
 * Defines:
 * - API metadata (title, version, contact)
 * - Bearer JWT security scheme used across all secured endpoints
 * - Default servers for dev and production
 */
@Configuration
@OpenAPIDefinition(info = @Info(title = "Mayk Enterprise Kit Lite API", version = "1.1.0", description = "Open-source multi-tenant REST API with JWT authentication and "
                +
                "invoice management. (Advanced features like Expense Tracking, 2FA, OAuth2, and Reporting available in Pro edition).", contact = @Contact(name = "Enterprise Solutions Team", email = "support@maykamasifuen.com"), license = @License(name = "MIT License / Open Source")), servers = {
                                @Server(url = "http://localhost:8080", description = "Local Development"),
                                @Server(url = "https://api.maykamasifuen.com", description = "Production")
                }, security = @SecurityRequirement(name = "Bearer"))
@SecurityScheme(name = "Bearer", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT", description = "Provide the JWT access token obtained from POST /api/auth/login")
public class OpenApiConfig {
        // No beans needed — annotations drive springdoc configuration
}
