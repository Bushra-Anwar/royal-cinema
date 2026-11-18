# DEPENDENCY MAP: ROYAL CINEMA ERP

**Author:** Enterprise Architecture Team  
**Date:** November 17, 2026  
**Status:** Phase 1 Complete – Pre-Restructuring Audit  
**Scope:** Complete inventory of package dependencies, binary runtimes, inter-process communication channels, and network protocols.

---

## 1. System Dependency Overview

Royal Cinema ERP consists of three distinct runtime tiers, each with its own dependency isolation model:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 1: DESKTOP APPLICATION RUNTIME (Zero External npm Dependencies)    │
│  - Chromium 124 / Node 20.x Bundled Engine                             │
│  - 249MB Native Windows Binaries & Hardware Acceleration DLLs           │
│  - Built-in Node modules: http, fs, path, crypto, url, events          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Local Loopback HTTP (Port 3000)
                                    ▼ & IPC via contextBridge
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 2: CLOUD SAAS FRONTEND (Next.js 14 App Router)                     │
│  - React 18.3, Next.js 14.2, Tailwind CSS 3.4, Lucide React, Three.js  │
│  - Axios HTTP Client with automatic tenant header injection            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS REST / WebSockets
                                    ▼ (Bearer JWT + Tenant Headers)
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 3: CLOUD SAAS BACKEND (NestJS 10 Enterprise API)                  │
│  - NestJS 10, TypeScript 5.4, Mongoose 8.4, Passport JWT, Throttler    │
│  - AWS SDK (S3, SES, SQS, Cognito), Razorpay, Stripe, Redis            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Package Dependency Inventory

### 2.1 Desktop Application (`resources/app/package.json`)
```json
{
  "name": "royal-cinema-erp-desktop",
  "version": "0.3.0",
  "private": true,
  "description": "Royal Cinema two-station desktop prototype",
  "main": "main.cjs"
}
```
- **External npm Dependencies**: **0** (Zero).
- **Core Strategy**: The desktop application operates entirely without an external `node_modules` folder. It utilizes Node.js core libraries exclusively:
  - `node:http`: Serves local HTTP on port 3000 (`server.cjs`).
  - `node:fs`: Reads and writes local database files atomically (`backend/database/db.js`).
  - `node:crypto`: Performs PBKDF2/scrypt password hashing (`backend/services/passwordService.js`).
  - `node:path` & `node:url`: Resolves paths and parses API queries.
- **Advantage**: Extreme stability, instant boot times, zero risk of corrupted or missing `node_modules` in production cinema counters.

---

### 2.2 Cloud SaaS Frontend (`enterprise-production/frontend-nextjs/package.json`)

| Package Name | Specified Version | Purpose in Application |
|---|---|---|
| `next` | `14.2.3` | React meta-framework, App Router, SSR, Route Groups. |
| `react` & `react-dom` | `^18.3.1` | Core UI rendering engine. |
| `lucide-react` | `^0.383.0` | Enterprise iconography across admin and client portals. |
| `tailwindcss` | `^3.4.3` | Utility-first styling framework implementing Royal Cinema brand colors. |
| `clsx` & `tailwind-merge` | `^2.1.1` / `^2.3.0` | Conditional CSS class merging and style deduplication. |
| `three` & `@types/three` | `^0.164.1` | Interactive 3D auditorium seat selection visualization. |
| `axios` | `^1.7.2` | REST API client for backend communication. |
| `typescript` | `^5.4.5` | Static type checking and interface validation. |

---

### 2.3 Cloud SaaS Backend (`enterprise-production/backend-nestjs/package.json`)

| Category | Packages | Version | Role in Architecture |
|---|---|---|---|
| **Core Framework** | `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | `^10.3.0` | Dependency injection, routing, lifecycle, middleware. |
| **Database & ODM** | `mongoose`, `@nestjs/mongoose` | `^8.4.1` / `^10.0.6` | MongoDB Atlas object-document modeling and tenant scoping. |
| **Authentication & Security** | `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`, `bcrypt` | `^10.x` / `^5.1.1` | Multi-tenant JWT generation, verification, and bcrypt hashing. |
| **API Protection** | `helmet`, `@nestjs/throttler` | `^7.1.0` / `^5.1.2` | HTTP security headers and IP/Tenant rate limiting. |
| **Validation** | `class-validator`, `class-transformer` | `^0.14.1` / `^0.5.1` | Strict DTO runtime payload validation. |
| **Payment Gateways** | `razorpay`, `stripe` | `^2.9.4` / `^15.10.0` | Per-branch subscription billing (UPI/Card/NetBanking). |
| **AWS Cloud SDK** | `@aws-sdk/client-s3`, `@aws-sdk/client-ses`, `@aws-sdk/client-sqs`, `@aws-sdk/client-cognito-identity-provider` | `^3.600.0` | Private asset storage, transactional emails, async queue processing. |
| **Caching** | `ioredis` | `^5.4.1` | Distributed seat lease locks and session caching. |
| **Documentation** | `@nestjs/swagger` | `^7.3.1` | Automated OpenAPI 3.0 specification generator. |

---

## 3. Native Windows Binary Runtime Dependencies

The desktop executable `Royal Cinema ERP.exe` requires the following Windows dynamic libraries in the application directory:

```
Royal Cinema ERP.exe (Entry Binary)
├── d3dcompiler_47.dll       (Direct3D HLSL Compiler)
├── dxcompiler.dll           (DirectX Shader Compiler)
├── electron_wer.dll         (Windows Error Reporting)
├── ffmpeg.dll               (Audio/Video Decoder)
├── icudtl.dat               (Unicode Normalization Data)
├── vk_swiftshader.dll       (Vulkan CPU Software Rasterizer)
├── vk_swiftshader_icd.json  (Vulkan Driver Spec)
├── vulkan-1.dll             (Vulkan Runtime Loader)
├── resources.pak            (Chromium Base Resource Bundle)
├── chrome_100_percent.pak   (1x UI Icons and Assets)
├── chrome_200_percent.pak   (2x UI Icons and Assets)
└── resources/app.asar       (Main Application JavaScript Archive)
```

> **Warning**: Moving `Royal Cinema ERP.exe` away from these DLLs will cause an instant `STATUS_DLL_NOT_FOUND` crash on launch.

---

## 4. Cross-Project Invocation & Communication Matrix

The table below documents how different layers communicate across boundaries:

```
┌──────────────────┐    IPC invoke()    ┌──────────────────┐
│  Desktop Window  │ ─────────────────> │   preload.cjs    │
│  (index.html)    │ <───────────────── │ (window.royalERP)│
└────────┬─────────┘    Return Promise  └────────┬─────────┘
         │                                       │
         │ HTTP fetch('http://localhost:3000')   │ IPC Handler
         ▼                                       ▼
┌──────────────────┐                    ┌──────────────────┐
│    server.cjs    │                    │     main.cjs     │
│ (Embedded HTTP)  │                    │ (Main Electron)  │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         ▼                                       ▼
┌──────────────────────────────────────────────────────────┐
│            resources/app/backend/ Services               │
│ (authService, branchService, companyService, syncService)│
└────────────────────────────┬─────────────────────────────┘
                             │
                             │ HTTPS /api/sync/*
                             │ (Tenant & Branch Context)
                             ▼
┌──────────────────────────────────────────────────────────┐
│       Cloud NestJS Backend (backend-nestjs)              │
│       - TenantGuard validation                           │
│       - MongoDB Atlas cloud reconciliation               │
└──────────────────────────────────────────────────────────┘
```

| Source Process | Target Process | Protocol / Channel | Payload / Context Transferred |
|---|---|---|---|
| `resources/app/index.html` | `resources/app/preload.cjs` | ContextBridge Method Calls | Login credentials, company registration, subscription queries. |
| `resources/app/preload.cjs` | `resources/app/main.cjs` | Electron IPC Channels (`auth:login`, etc.) | Asynchronous invocation between isolated renderer and main process. |
| `resources/app/index.html` (DOM) | `resources/app/server.cjs` | HTTP GET / POST (`http://localhost:3000/api/*`) | Ticket booking confirmations, branch switching, live seat status. |
| `resources/app/index.html` (Iframe) | `workspaces/*.html` | DOM `window.parent` / postMessage | Active cashier context, role permissions, branch identifiers. |
| Desktop `syncService.js` | Cloud `backend-nestjs` | HTTPS REST (`/api/sync/reconcile`) | JSON offline booking journal entries + seat lease reservation requests. |
| Next.js Frontend | NestJS Backend | HTTPS REST (`/api/*`) | Bearer JWT token, `x-organization-id`, `x-branch-id` headers. |

---

## 5. Critical Paths That Must Not Be Broken

1. **ASAR Extraction Path**: Electron expects `resources/app.asar` or `resources/app` directly inside `resources/` relative to `Royal Cinema ERP.exe`.
2. **Iframe Relative URLs**: `resources/app/index.html` loads workspaces using relative path `workspaces/city_lite_cinema_erp_multi_counter_role_login.html`. Changing the directory depth will break workspace rendering.
3. **Loopback Server Port**: `server.cjs` binds to port 3000. Next.js development server is configured to run on port 3001 to prevent port collisions.
4. **AppData Data Storage**: `backend/config/paths.js` reads `%APPDATA%/RoyalCinemaERP/`. Existing cashier and sales data is stored there and must not be touched during restructuring.
