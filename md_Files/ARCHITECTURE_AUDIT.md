# ARCHITECTURE AUDIT: ROYAL CINEMA ERP

**Author:** Enterprise Architecture Team  
**Date:** November 17, 2026  
**Status:** Phase 1 Complete – Pre-Restructuring Audit  
**Scope:** Complete repository assessment across Desktop Electron, Embedded Node Services, Next.js SaaS Web Applications, NestJS Enterprise Backend, and Data Persistence Layers.

---

## 1. Executive Summary

Royal Cinema ERP is currently an organic hybrid of two distinct generations of software:
1. **Generation 1: Operational Desktop ERP & POS Application**  
   A functional Windows Electron desktop application packaged as `Royal Cinema ERP.exe` with bundled Chromium/Node runtimes, an embedded HTTP micro-server (`server.cjs`), an embedded local JSON database engine (`resources/app/backend/`), and 4 high-capacity operational HTML5/JS workspaces (Box Office Multi-Counter POS, Food Concessions POS, Manager Command Center, and Customer Booking Kiosk).
2. **Generation 2: Multi-Tenant Cloud SaaS Platform**  
   A newly architected enterprise multi-tenant cloud platform located in `enterprise-production/`, containing a Next.js 14 frontend (`frontend-nextjs`), a NestJS 10 REST API backend (`backend-nestjs`), shared TypeScript contracts (`shared/`), Terraform IaC (`terraform/`), and Docker Compose definitions.

In addition to these two architectures, standalone HTML prototypes (`saas-website.html`, `client-portal.html`, `super-admin-portal.html`, `checkout.html`, `subscription-plans.html`) and 17 root-level automation scripts exist alongside the compiled Windows binaries.

This audit provides a factual analysis of all entry points, data flows, dependencies, and architectural boundaries without making any code changes.

---

## 2. Desktop Electron Application Architecture

```
[Royal Cinema ERP.exe] (Windows Executable, 249MB)
        │
        ├── Reads runtime DLLs: ffmpeg.dll, d3dcompiler_47.dll, vk_swiftshader.dll
        ├── Mounts resources/app.asar OR reads resources/app/
        │
        ▼
[resources/app/main.cjs] (Electron Main Process)
        │
        ├── Seeds default company & user credentials if empty
        ├── Registers IPC Main Handlers ('auth:login', 'subscription:get', etc.)
        ├── Spawns BrowserWindow (1520x980)
        │       └── Loads resources/app/index.html via file://
        │       └── Injects resources/app/preload.cjs (contextIsolation: true, sandbox: true)
        │
        ▼
[resources/app/preload.cjs] (IPC Bridge)
        │
        └── Exposes `window.royalERP` securely into the renderer window
                ├── login(credentials)
                ├── onboardCompany(data)
                ├── getSubscription(companyId)
                ├── renewCompany(companyId, renewData)
                ├── listUsers(companyId), addUser(data), deleteUser(userId)
                └── confirmBooking(data)
```

### 2.1 Electron Entry Points & Runtime Boundary
- **Executable Location**: `Royal Cinema ERP.exe` (Root directory, 249,831,936 bytes).
- **Application Bundle**: `resources/app/package.json` (`main: "main.cjs"`, `version: 0.3.0`).
- **Archive Archive**: `resources/app.asar` (1,429,500 bytes). When packaged, Electron defaults to executing from `resources/app.asar`.
- **Renderer Window**: `resources/app/index.html` (109KB). Serves as the master container shell.
- **Security Posture**:
  - `contextIsolation: true`
  - `nodeIntegration: false`
  - `sandbox: true`
  - Inter-process communication occurs strictly via `contextBridge.exposeInMainWorld('royalERP', ...)` to prevent remote code execution.

### 2.2 Operational Workspaces (Sub-Applications)
The desktop application hosts four mission-critical operational workspaces loaded into `<iframe>` containers inside `resources/app/index.html`:
1. **Box Office Multi-Counter POS (`resources/app/workspaces/city_lite_cinema_erp_multi_counter_role_login.html` - 138KB)**:
   - Audi auditorium seat matrix renderer (Silver, Gold, Platinum, VIP Recliner rows).
   - Real-time seat reservation, hold timers, and cashier checkout.
   - ESC/POS thermal receipt printing integration.
2. **Food & Beverage Concessions POS (`resources/app/workspaces/city_lite_f_b_counter_pos_role_login.html` - 177KB)**:
   - Combo meal builder, popcorn/beverage fast-key grid.
   - Inventory decrement, kitchen display routing, and tax invoicing.
3. **Theatre Command Center & Ledger (`resources/app/workspaces/city_lite_cinema_erp_command_center_role_login.html` - 104KB)**:
   - Daily collections register, occupancy analytics, DCR (Daily Collection Report).
   - Film distributor settlement ledgers and distributor share computations.
4. **Customer Ticket Booking Kiosk (`resources/app/workspaces/customer-ticket-booking.html` - 249KB)**:
   - Self-service booking workflow with mobile QR payment simulation and booking confirmation.

---

## 3. Embedded Node.js Microservice & Local Database Architecture

To enable offline-first counter operations and local network POS synchronization, the desktop environment embeds an autonomous Node.js HTTP server.

```
[resources/app/server.cjs] (Pure Node.js HTTP Server, Port 3000)
        │
        ├── Serves Static Assets & Route Aliases:
        │       ├── '/' -> resources/app/index.html
        │       ├── '/website' -> resources/app/saas-website.html
        │       ├── '/portal' -> resources/app/client-portal.html
        │       ├── '/admin' -> resources/app/super-admin-portal.html
        │       └── '/checkout' -> resources/app/checkout.html
        │
        ▼
[resources/app/backend/routes/apiRouter.js] (REST API Router)
        │
        ├── /api/auth/login, /api/auth/demo-accounts
        ├── /api/company/onboard, /api/company/check-subscription, /api/company/renew-direct
        ├── /api/branches/list, /api/branches/create, /api/branches/switch
        ├── /api/sync/seat-lease, /api/sync/offline-booking, /api/sync/reconcile
        ├── /api/support/tickets, /api/support/call-request, /api/support/chat
        └── /api/subscription/current, /api/subscription/update
```

### 3.1 Local Persistence Layer (`resources/app/backend/database/db.js`)
- **Storage Location**: Dynamic user data directory resolved via `%APPDATA%/RoyalCinemaERP/` (falls back to `resources/app/backend/data/` if undefined).
- **Format**: Atomic JSON flat files (`companies.json`, `users.json`, `tickets.json`, `sales.json`, `branches.json`, `support_tickets.json`, `sync_journal.json`).
- **Cryptographic Security**: Salted SHA-512 / PBKDF2 password hashing implemented via Node.js native `crypto.scryptSync` (`passwordService.js`). No external native npm binaries required.
- **Zero-Dependency Architecture**: Entire desktop backend relies exclusively on Node.js core libraries (`http`, `fs`, `path`, `crypto`, `url`, `events`).

---

## 4. Cloud SaaS Enterprise Architecture (`enterprise-production/`)

`enterprise-production/` represents the modern cloud-native deployment target designed for high scalability, multi-tenancy, and cloud billing.

```
enterprise-production/
├── frontend-nextjs/       # Next.js 14 (App Router, Tailwind CSS, Lucide Icons)
│   ├── src/app/(auth)/    # Login, Registration, Checkout, Verification
│   ├── src/app/(marketing)/# Public Website (Homepage, Features, Pricing, Demo)
│   ├── src/app/portal/    # Subscribed Cinema Client Self-Service Portal
│   ├── src/app/admin/     # Super Admin Cloud Provider Console
│   └── src/lib/api-client.ts
│
├── backend-nestjs/        # NestJS 10 (TypeScript, Mongoose, Passport, AWS SDK)
│   ├── src/modules/       # 18 Domain Modules (Auth, Organizations, Branches, 
│   │                      # Subscriptions, Payments, Licenses, Sync, Support, etc.)
│   └── src/common/        # TenantGuards, RolesGuards, Custom Decorators
│
├── shared/                # Shared Contracts & Domain TypeScript Types
│   ├── contracts/sync.contract.ts
│   └── types/tenant.types.ts, support.types.ts
│
├── terraform/             # AWS ECS Fargate, ALB, CloudFront, VPC, RDS/DocDB IaC
└── docker-compose.yml     # Local orchestration for Next.js, NestJS, MongoDB, Redis
```

### 4.1 Frontend App Router Composition (`enterprise-production/frontend-nextjs`)
- Framework: Next.js 14.2.3, React 18.3.1, Tailwind CSS 3.4.3.
- All three interfaces (Marketing Website, Client Portal, and Super Admin Portal) currently reside inside a single Next.js project under segmented route groups:
  - `src/app/(marketing)/*`: Public unauthenticated pages.
  - `src/app/(auth)/*`: Unified SaaS authentication & checkout pages.
  - `src/app/portal/*`: Client portal pages for cinema owners.
  - `src/app/admin/*`: Master cloud operator console.

### 4.2 Backend NestJS Architecture (`enterprise-production/backend-nestjs`)
- Framework: NestJS 10.3.0 with TypeScript 5.4.5.
- Multi-Tenant Engine: `TenantGuard` extracts and validates `x-organization-id`, `x-branch-id`, and JWT bearer tokens across every request.
- Database Target: MongoDB Atlas via `@nestjs/mongoose` with schemas for organizations, users, branches, subscriptions, invoices, licenses, and audit trails.
- Payment Gateways: Configured for Razorpay (India Per-Branch Billing) and Stripe (Global subscriptions).

---

## 5. Architectural Issues Identified

1. **Repository Root Clutter**:
   - The repository root currently contains an installed/unpacked Electron distribution (`Royal Cinema ERP.exe`, DLLs, `.pak` files) mixed with 17 standalone `.cjs` migration scripts.
2. **Prototype vs. Production Duplication**:
   - Monolithic standalone HTML prototypes (`saas-website.html`, `client-portal.html`, `super-admin-portal.html`) duplicate the routes implemented in `enterprise-production/frontend-nextjs`.
3. **Monolithic Next.js Application**:
   - Public marketing pages, authenticated tenant client portal, and provider super admin are hosted in one Next.js bundle rather than separated applications.
4. **Backend Duality**:
   - Two parallel backend implementations exist:
     a) Embedded Node CommonJS micro-server (`resources/app/backend/`) serving the desktop Electron app.
     b) NestJS TypeScript enterprise server (`enterprise-production/backend-nestjs/`) designed for cloud deployment.
   - Both must be preserved: the desktop app needs its offline local Node micro-server for counter POS, while the cloud SaaS needs the NestJS cluster.

---

## 6. Audit Conclusion & Approval Recommendation

The existing desktop ERP application is functional, self-contained, and operating without external npm dependencies. The enterprise cloud SaaS platform has been cleanly designed in Next.js and NestJS. 

**Next Action**: Proceed to Phase 2 (Restructuring Plan) without making code modifications until plan review and approval.
