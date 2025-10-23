﻿# 📚 AMaykEnterprise Kit Lite — Documentation Index

> **Version:** Lite Edition · **Updated:** March 2026
> **Stack:** Spring Boot 4.0.1 · Java 25 · Angular 21 · PrimeNG 21 · PostgreSQL 17

> [!NOTE]
> This is the **Lite (open-source)** documentation. Some docs below reference premium features
> (AI Chatbot, Stripe, JasperReports, Audit Logs, WebSockets, GDPR Export) that are only
> Ignore those sections when working with the Lite codebase.

---

## 📂 Documentation Files

| # | File | Description | Best For |
|---|------|-------------|----------|
| **01** | [01_OVERVIEW.md](./01_OVERVIEW.md) | Product overview, feature matrix, tech stack, project structure | Presentations, quick reference |
| **02** | [02_QUICK_START.md](./02_QUICK_START.md) | 5-minute setup guide — manual install, proxy config, credentials | New developers, evaluators |
| **03** | [03_USER_GUIDE.md](./03_USER_GUIDE.md) | End-user walkthrough for all 3 roles (Super Admin, Admin, User) | Demos, videos, end users |
| **04** | [04_BACKEND_ARCHITECTURE.md](./04_BACKEND_ARCHITECTURE.md) | Spring Boot architecture, security model, multi-tenancy, database, Liquibase | Technical deep-dives |
| **05** | [05_API_REFERENCE.md](./05_API_REFERENCE.md) | REST endpoint groups with request/response examples, HTTP status codes | Developers, integrators |
| **06** | [06_FRONTEND_ARCHITECTURE.md](./06_FRONTEND_ARCHITECTURE.md) | Angular 21 architecture, proxy config, RTL, dark/light mode, services | Frontend developers |
| **07** | [07_COMPONENT_REFERENCE.md](./07_COMPONENT_REFERENCE.md) | Component inputs, outputs, signals, usage examples, and i18n keys | UI developers, contributors |
| **08** | [08_DEPLOYMENT_GUIDE.md](./08_DEPLOYMENT_GUIDE.md) | Docker, Docker Compose, Nginx, CI/CD, environment variables | DevOps, self-hosting |
| **10** | [10_V5_FEATURES.md](./10_V5_FEATURES.md) | Version history and feature changelog | Developers, feature reference |

**Also at root level:**
- [README.md](../README.md) — Main product README with quick start and Lite vs Pro comparison

---

## 🏗️ Architecture at a Glance

- **Backend:** Spring Boot 4.0.1 + Java 25, multi-tenant Hibernate filter, JWT
- **Frontend:** Angular 21 standalone SPA, PrimeNG 21, signals-based state
- **Database:** PostgreSQL 17 / H2 (dev), Liquibase auto-migrations
- **Security:** JWT, rate limiting

---

*© 2026 Mayk Enterprise Kit. MIT License.*
