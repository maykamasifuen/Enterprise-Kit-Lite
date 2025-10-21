# 🎨 Mayk Enterprise Kit — Frontend (v5.2)

![Angular](https://img.shields.io/badge/Angular-21-red?style=flat-square&logo=angular)
![PrimeNG](https://img.shields.io/badge/PrimeNG-21-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)
![ngx-translate](https://img.shields.io/badge/ngx--translate-16+-green?style=flat-square)

> Angular 21 · PrimeNG 21 · Standalone components · Signals · EN / AR / FR · Dark/Light mode · v5.2.0

---

## Overview

The `enterprise-starter-kit-frontend` module is a production-ready Angular 21 SPA providing:

- ✅ **Authentication** — JWT login, register, forgot/reset password
- ✅ **Dashboard** — KPI cards, Chart.js revenue line chart, monthly trends
- ✅ **Invoice Management** — CRUD, pagination, server-side search/filter, bulk ops
- ✅ **Customer CRM** — CRUD, search, bulk delete
- ✅ **Product Catalog** — CRUD, pricing, units
- ✅ **Settings** — company info, branding (logo/color/tagline)
- ✅ **User Profile** — personal info, preferred language, avatar
- ✅ **Admin Panel** — super admin + admin user management
- ✅ **i18n** — English / French, dynamic no-reload switching
- ✅ **Dark / Light Mode** — full PrimeNG + custom component theming

---

## Quick Start

```bash
npm install
npm start
```

`npm start` uses `ng serve` with `proxy.conf.json` — **all `/api` requests are automatically proxied to `http://localhost:8080`**. No manual proxy or CORS configuration needed.

**App:** http://localhost:4200  
**Backend required:** http://localhost:8080 (see backend README)

---

## Project Structure

```
src/
├── app/
│   ├── app.ts / app.routes.ts / app.config.ts   Root component + lazy routes
│   ├── auth/                   Login, register, forgot password, guards, JWT interceptor
│   ├── admin/                  Super Admin + Admin management panels
│   ├── catalog/                Product/service catalog CRUD
│   ├── customers/              Customer CRM
│   ├── dashboard/              KPI cards + Chart.js
│   ├── invoices/               Invoice CRUD + bulk
│   ├── navbar/                 Sidebar navigation (language switcher + dark/light toggle)
│   ├── profile/                User profile + preferred language
│   ├── settings/               Company settings + branding
│   ├── components/             Shared: EmptyState, LoadingSpinner, Skeleton, GlobalSearch
│   └── services/               All HTTP services (use environment.apiUrl)
├── assets/
│   └── i18n/
│       ├── en.json             English
│       └── fr.json             French
├── environments/
│   ├── environment.ts          { apiUrl: '' }  — proxied in dev
│   └── environment.prod.ts     { apiUrl: '/api' } — served via Nginx in prod
└── styles.scss                 Global styles, PrimeNG theming, dark/light CSS vars
```

---

## Dev Proxy Configuration

**`proxy.conf.json`** (root of project):
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info"
  }
}
```

Referenced in `angular.json` → `serve` → `development` → `"proxyConfig": "proxy.conf.json"`.

> ⚠️ All services use `environment.apiUrl` (empty string in dev) so API calls go to `/api/...` which the proxy intercepts. Never hardcode `http://localhost:8080` in service files.

---

## i18n — Languages

| Language | Code | Direction | File |
|----------|------|-----------|------|
| English | `en` | LTR | `assets/i18n/en.json` |
| French | `fr` | LTR | `assets/i18n/fr.json` |

**Language switching** (via sidebar dropdown or Profile → Preferred Language):
1. `LanguageService.switchLanguage(lang)` calls `translate.use(lang)`
2. Sets `document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')`
3. Sets `document.documentElement.setAttribute('lang', lang)` ← v5.1 fix (was hardcoded `'en'`)
4. Persists to `localStorage`
5. All `| translate` pipe bindings update automatically — no page reload

---

## Dark / Light Mode

Toggled via the 🌙 icon in the sidebar. Sets `data-theme="dark"` or `data-theme="light"` on `<html>`.

All components use CSS variables (`--app-bg`, `--app-card-bg`, `--app-text-primary`, etc.) defined in `styles.scss`.

---

## App Shell Layout (v5.1 Fix)

```
html (height:100%) → body (height:100%) → app-root (display:flex; flex-direction:column)
  ├── p-toast        (zero height, flex item — was previously causing height issues)
  └── .app-shell     (flex:1; min-height:0; overflow:hidden)
        └── .app-body (display:flex)
              ├── app-navbar    (flex:0 0 260px; align-self:stretch)
              │     └── .sidebar (flex:1; min-height:0; overflow:hidden)
              └── .app-content  (flex:1; min-height:0; overflow:auto)
```

Previously `app-root` was `display:block` — `p-toast` took document-flow space and pushed `.app-shell` down, making the sidebar shorter than the viewport.

---

## Building for Production

```bash
# Production build
npm run build

# Output: dist/enterprise-starter-kit-frontend/
# Served via Nginx in Docker — see docker-compose.prod.yml
```

---

## Key Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm start` | `ng serve --proxy-config proxy.conf.json` | Dev server with API proxy |
| `npm run build` | `ng build` | Production build |
| `npm test` | `ng test` | Unit tests (Karma + Jasmine) |
| `npm run lint` | `ng lint` | ESLint |

---

---

*© 2026 Mayk Enterprise Kit. All Rights Reserved.*
*v5.2.0 · Angular 21 · PrimeNG 21 · TypeScript 5 · Updated March 2, 2026*
