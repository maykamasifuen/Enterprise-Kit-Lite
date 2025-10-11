<div align="center">

# 🏢 Mayk Enterprise Kit — Lite Edition

### The Open-Source Foundation for Enterprise SaaS Applications

**Spring Boot 4.0.1 · Angular 21 · JWT · Multi-Tenancy · RTL**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-25-orange.svg)](https://openjdk.org/)
[![Angular](https://img.shields.io/badge/Angular-21-red.svg)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.1-brightgreen.svg)](https://spring.io/projects/spring-boot)

</div>

---

## ✨ What is Mayk Enterprise Kit Lite?

A **production-ready, open-source starter kit** for building enterprise-grade SaaS applications. Built with **Spring Boot 4.0.1** and **Angular 21**, it ships with everything you need to launch a multi-tenant B2B platform — authentication, invoicing, customer management, and full RTL support out of the box.

> **🔥 Need the Full Enterprise Experience?**
> Save 3+ months of development time. The PRO & AGENCY versions include Stripe Billing, Local AI Chatbots, JasperReports PDFs, 2FA, API Keys, WebSockets, and Cloud Attachments.
> [👉 Get the Full Version on Gumroad Here](https://mahmoudfarouk28.gumroad.com/l/mayk-enterprise-kit-V5-solo)


---

## 🚀 Core Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure stateless auth with access/refresh tokens (Email/Password only) |
| 🏗️ **Multi-Tenancy** | Single-schema multi-tenant architecture with Hibernate filters and automatic tenant isolation |
| 🌍 **i18n + RTL** | Full Mayk & English support with runtime language switching and automatic RTL layout |
| 🌙 **Dark/Light Mode** | System-aware theme toggle with smooth transitions |
| 🧾 **Invoice Management** | Full CRUD with status tracking |
| 👥 **Customer Management** | Customer registry with contact details, search, filtering, and pagination |
| 📦 **Product Catalog** | Item/service catalog with pricing, categories, and bulk operations |
| 📊 **Dashboard Analytics** | Real-time business metrics with charts (Chart.js) and KPI cards |
| 🛡️ **Role-Based Access** | Three-tier roles: User → Admin → Super Admin with `@PreAuthorize` guards |
| 👨‍💼 **Super Admin Panel** | Cross-tenant management, user administration, and system-wide dashboard |
| 🏢 **Self-Service Registration** | Tenant onboarding with automatic workspace creation and welcome emails |
| 📧 **Email Service** | Transactional HTML emails for password resets and onboarding (SMTP-based) |
| 📜 **Swagger/OpenAPI** | Interactive API documentation at `/swagger-ui.html` |
| 🔄 **Liquibase Migrations** | Version-controlled database schema management |
| ⚡ **Caffeine Cache** | In-memory caching for dashboard queries and hot paths |
| 🏥 **Actuator Health** | Built-in health checks and monitoring endpoints |

---

## 🏗️ Tech Stack

### Backend
- **Java 25** + **Spring Boot 4.0.1**
- Spring Data JPA + Hibernate (Oracle, MySQL, PostgreSQL, H2)
- Spring Security 7 (JWT)
- Liquibase for migrations
- SpringDoc OpenAPI 2.7

### Frontend
- **Angular 21** (Standalone Components)
- PrimeNG 21 component library
- ngx-translate (i18n)
- Chart.js for analytics
- Full RTL/LTR support

---

## ⚡ Quick Start

### Prerequisites
- Java 25+
- Node.js 22+ & npm
- MySQL 8+ or PostgreSQL 16+ or Oracle 19+

### 1. Clone & Configure

```bash
git clone https://github.com/MaykAmasifuen/mayk-enterprise-kit-lite.git
cd mayk-enterprise-kit-lite
```

Create `enterprise-starter-kit/.env`:
```env
JWT_SECRET=your-256-bit-secret-key
DB_PASSWORD=your-database-password
```

### 2. Start Backend

```bash
cd enterprise-starter-kit
mvn spring-boot:run
```

### 3. Start Frontend

```bash
cd enterprise-starter-kit-frontend
npm install
ng serve
```

Open **http://localhost:4200** — you're live! 🎉

---

## 📁 Project Structure

```
mayk-enterprise-kit-lite/
├── enterprise-starter-kit/              # Spring Boot Backend
│   └── src/main/java/.../
│       ├── config/                      # Security, CORS, OpenAPI, Cache
│       ├── modules/
│       │   ├── auth/                    # JWT Authentication
│       │   ├── invoices/                # Invoice CRUD
│       │   ├── customers/               # Customer management
│       │   ├── catalog/                 # Product/service catalog
│       │   ├── expenses/                # Expense tracking
│       │   ├── dashboard/               # Analytics & KPIs
│       │   └── admin/                   # Super Admin panel
│       └── shared/                      # Tenant context, base entities, utilities
├── enterprise-starter-kit-frontend/     # Angular Frontend
│   └── src/app/
│       ├── services/                    # Auth, HTTP, Language, Layout
│       ├── dashboard/                   # Dashboard views
│       ├── invoices/                    # Invoice components
│       ├── customers/                   # Customer components
│       ├── admin/                       # Admin components
│       ├── navbar/                      # Sidebar navigation
│       └── shared/                      # Paywall, guards, pipes
└── Documentation/                       # Guides & API reference
```

---

## 🔒 Security

- **Stateless JWT** — No sessions, no CSRF exposure
- **BCrypt password hashing** with configurable rounds
- **Rate limiting** on auth endpoints
- **CORS** centrally configured with credential support
- **Method-level security** via `@PreAuthorize`
- **Tenant isolation** enforced at the data layer via Hibernate filters

## 💎 Upgrade to Pro/Agency

The **Lite Edition** is perfect for learning, prototyping, and building MVPs. When you're ready to scale, **Pro/Agency Edition** unlocks powerful enterprise features:

| Feature | Lite ✅ | Pro 💎 |
|---------|:------:|:-----:|
| JWT Auth (Email/Password) | ✅ | ✅ |
| **🔐 2FA (TOTP/QR Codes)** | ❌ | ✅ |
| **🔑 Social Login (Google/GitHub)** | ❌ | ✅ |
| **🔑 API Key Management** | ❌ | ✅ |
| Multi-Tenancy | ✅ | ✅ |
| i18n + RTL | ✅ | ✅ |
| Dark/Light Mode | ✅ | ✅ |
| Invoice CRUD | ✅ | ✅ |
| **📄 Invoice Excel/CSV Export** | ❌ | ✅ |
| Customer Management | ✅ | ✅ |
| Product Catalog | ✅ | ✅ |
| **💰 Expense Tracking & P&L** | ❌ | ✅ |
| Dashboard Analytics | ✅ | ✅ |
| Super Admin Panel | ✅ | ✅ |
| Self-Service Registration | ✅ | ✅ |
| **🤖 AI Chatbot (Ollama/Spring AI)** | ❌ | ✅ |
| **💳 Stripe Billing & Subscriptions** | ❌ | ✅ |
| **📊 JasperReports PDF Generation** | ❌ | ✅ |
| **📝 Audit Logs & Activity Tracking** | ❌ | ✅ |
| **🔔 Real-Time WebSocket Notifications** | ❌ | ✅ |
| **🔏 GDPR Data Export (ZIP)** | ❌ | ✅ |
| **📋 VAT/Tax Reports** | ❌ | ✅ |
| **🎨 White-Label Branding** | ❌ | ✅ |
| **🔄 Recurring Invoices** | ❌ | ✅ |
| **Priority Support** | ❌ | ✅ |

<div align="center">

### 🚀 [Get Pro/Agency Edition on Gumroad →](https://mahmoudfarouk28.gumroad.com/l/mayk-enterprise-kit-V5-solo)

*One-time purchase · Full source code · Lifetime updates*

</div>

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the Mayk developer**

⭐ Star this repo if you find it useful!

</div>
