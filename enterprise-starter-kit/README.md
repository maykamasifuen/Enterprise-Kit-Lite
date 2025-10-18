# 🏗️ Mayk Enterprise Kit — Backend (v5.2)

![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.1-green?style=flat-square&logo=spring)
![Java](https://img.shields.io/badge/Java-25-orange?style=flat-square&logo=openjdk)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?style=flat-square&logo=postgresql)
![Liquibase](https://img.shields.io/badge/Liquibase-V1--V11-lightgrey?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-83_passing-brightgreen?style=flat-square)

> Spring Boot 4.0.1 · Java 25 · Multi-tenant SaaS backend · 83 tests · v5.2.0

---

## Overview

The `enterprise-starter-kit` module is a production-ready Spring Boot backend providing:

- ✅ **JWT Authentication** + 7-day refresh tokens + account lockout
- ✅ **Multi-tenancy** — single-schema Hibernate filter, `TenantContext` ThreadLocal
- ✅ **Role-based access** — `SUPER_ADMIN` / `ADMIN` / `USER`
- ✅ **Invoice CRUD** — pagination, search, bulk ops
- ✅ **Product Catalog** — item management
- ✅ **Customer CRM** — CRUD, search, bulk delete
- ✅ **Security Headers** — CSP, HSTS, X-Frame-Options
- ✅ **Caffeine Cache** — dashboard stats with 60s TTL
- ✅ **OpenAPI** — Swagger UI with Bearer JWT scheme

---

## Quick Start

```bash
# H2 in-memory (dev — zero config)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Local PostgreSQL
mvn spring-boot:run -Dspring-boot.run.profiles=local-pg

# Docker (full stack)
cd ..
docker compose up -d
```

Liquibase runs **V1–V11** migrations automatically on first start.

**Swagger UI:** http://localhost:8080/swagger-ui.html  
**Health check:** http://localhost:8080/actuator/health

---

## Module Structure

```
src/main/java/.../
├── config/
│   ├── security/          JwtFilter, SecurityHeadersFilter
│   ├── web/               CORS, OpenAPI config
│   └── tenant/            TenantContext, HibernateFilter, TenantInterceptor
├── modules/
│   ├── auth/              Login, register, forgot/reset password, refresh, logout
│   ├── invoices/          CRUD, pagination, search, bulk ops
│   ├── customers/         Customer CRM — CRUD, search, bulk delete
│   ├── catalog/           Product/service catalog
│   ├── dashboard/         Stats + monthly trends (Caffeine-cached, 60s TTL)
│   ├── settings/          Per-tenant company settings
│   └── users/             User CRUD + profile management
└── shared/
    ├── exception/         GlobalExceptionHandler → consistent error JSON
    ├── dto/               Shared request/response DTOs
    └── util/              TenantUtils, DateUtils
```

---

## Database Migrations (Liquibase)

| Version | Tables / Changes |
|---------|-----------------|
| V1 | `users`, `roles`, `user_roles`, `companies` |
| V2 | `invoices` |
| V3 | `customers` |
| V4 | `catalog_items` |
| V5 | `refresh_tokens` |
| V6 | `failed_login_attempts`, `locked_until` on `users` |
| V7 | Settings columns on `companies` |
| V8 | Extended settings columns |
| V9 | Test users seed data |
| V10 | Fix demo user passwords |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | ✅ | — | Base64 JWT signing secret (min 64 chars) |
| `JWT_EXPIRATION` | — | `3600000` | Access token TTL (ms) |
| `DB_URL` | — | H2 (dev) | JDBC URL |
| `DB_USERNAME` | — | `sa` (dev) | DB username |
| `DB_PASSWORD` | — | — | DB password |
| `MAIL_HOST` | — | — | SMTP host |
| `MAIL_USERNAME` | — | — | SMTP username |
| `MAIL_PASSWORD` | — | — | SMTP password |

---

## Running Tests

```bash
# All 83 tests
mvn test

# Specific module
mvn test -Dtest=InvoiceControllerTest

# With coverage report
mvn verify
```

**Test breakdown:**
- Unit tests — service layer mocks (Mockito)
- `@WebMvcTest` — controller layer tests with MockMvc
- Integration tests — H2 in-memory database

---

## API Summary

Full reference: [Documentation/05_API_REFERENCE.md](../Documentation/05_API_REFERENCE.md)

| Group | Endpoints |
|-------|-----------|
| Auth | login, register, register-tenant, refresh, logout, forgot/reset password |
| Invoices | CRUD, pagination, search, bulk delete/status |
| Customers | CRUD, search, bulk delete |
| Dashboard | Stats, monthly trends |
| Catalog | CRUD |
| Users | CRUD, profile, avatar |
| Settings | Get/update company settings |

---

---

*© 2026 Mayk Enterprise Kit. All Rights Reserved.*
*v5.2.0 · Spring Boot 4.0.1 · Java 25 · Updated March 2, 2026*
