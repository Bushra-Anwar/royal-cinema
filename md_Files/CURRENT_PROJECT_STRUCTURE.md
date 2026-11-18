# CURRENT PROJECT STRUCTURE: ROYAL CINEMA ERP

**Author:** Enterprise Architecture Team  
**Date:** November 17, 2026  
**Status:** Phase 1 Complete – Pre-Restructuring Inventory  
**Scope:** Complete physical directory tree, file classifications, and runtime bindings.

---

## 1. High-Level Directory Overview

```
c:\Users\boxoffice2\Downloads\Royal-Cinema-ERP-Setup-0.3.0\
│
├── [Root Executables & DLLs]         # Unpacked Electron/Chromium Windows runtime binaries
├── [Root Helper & Build Scripts]     # Standalone Node.js automation and migration utilities
│
├── resources/                        # Packaged Electron desktop runtime resources
│   ├── app.asar                      # Compiled Electron ASAR archive package (1.43MB)
│   ├── elevate.exe                   # Windows UAC privilege escalation helper
│   └── app/                          # Unpacked active Electron desktop application root
│       ├── main.cjs                  # Electron Main Process entry point
│       ├── preload.cjs               # Electron Preload IPC bridge
│       ├── index.html                # Master desktop shell & unified login interface
│       ├── server.cjs                # Autonomous embedded Node HTTP server (Port 3000)
│       ├── cinema-hall.jpg           # Auditorium hero asset for desktop login UI
│       ├── package.json              # Desktop application metadata (version 0.3.0)
│       ├── workspaces/               # Core cinema operations (POS, F&B, Booking, Ledger)
│       ├── backend/                  # Local Node.js microservice & JSON database engine
│       └── [HTML Prototypes]         # Standalone HTML previews for SaaS pages
│
├── enterprise-production/            # Modern Cloud SaaS Platform Architecture
│   ├── frontend-nextjs/              # Next.js 14 Web Application (Marketing, Portal, Admin)
│   ├── backend-nestjs/               # NestJS 10 Enterprise REST API Backend
│   ├── shared/                       # Shared TypeScript types and contracts
│   ├── terraform/                    # AWS Infrastructure as Code
│   ├── docker-compose.yml            # Multi-container local orchestration
│   ├── ARCHITECTURE.md               # 21-Section Enterprise Architecture Specification
│   └── .github/workflows/ci-cd.yml   # Automated CI/CD deployment pipeline
│
├── locales/                          # Chromium localized resource packs (55 language PAKs)
└── scratch/                          # Working test and diagnostic scripts
```

---

## 2. File-by-File Inventory & Classification

### 2.1 Root Binary Runtime Files (Windows Electron Environment)
These files constitute the compiled Chromium/V8 execution environment for the desktop application. They must never be deleted or modified in-place:

| File Name | Size | Role & Runtime Purpose |
|---|---|---|
| `Royal Cinema ERP.exe` | 249.8 MB | Main Windows binary. Boots Chromium and executes `resources/app/main.cjs`. |
| `d3dcompiler_47.dll` | 4.75 MB | Direct3D HLSL compiler for Windows graphics rendering. |
| `dxcompiler.dll` | 25.7 MB | DirectX shader compiler for hardware acceleration. |
| `electron_wer.dll` | 425 KB | Windows Error Reporting handler for Electron crashes. |
| `ffmpeg.dll` | 3.10 MB | Media playback codec container (video trailers, sound effects). |
| `icudtl.dat` | 10.8 MB | International Components for Unicode database. |
| `resources.pak` | 13.3 MB | Chromium packaged UI assets and localized strings. |
| `chrome_100_percent.pak`| 568 KB | 100% scale icons and UI elements. |
| `chrome_200_percent.pak`| 927 KB | High-DPI 200% scale icons and UI elements. |
| `snapshot_blob.bin` | 374 KB | V8 initial heap snapshot for instant JavaScript startup. |
| `v8_context_snapshot.bin`| 753 KB| V8 context snapshot for renderer initialization. |
| `vk_swiftshader.dll` | 5.45 MB | Vulkan software rasterizer fallback for non-GPU hardware. |
| `vk_swiftshader_icd.json`| 106 B | Vulkan Installable Client Driver JSON configuration. |
| `vulkan-1.dll` | 957 KB | Vulkan graphics driver loader. |
| `LICENSE.electron.txt` | 1.1 KB | Electron open-source license. |
| `LICENSES.chromium.html`| 5.7 MB | Chromium third-party component licenses. |

---

### 2.2 Desktop Application Files (`resources/app/`)
This directory contains the operational desktop codebase loaded by `Royal Cinema ERP.exe`:

| Path | Size | Description & Component Role |
|---|---|---|
| `package.json` | 166 B | Desktop package definition: `name: "royal-cinema-erp-desktop"`, `main: "main.cjs"`. |
| `main.cjs` | 3.6 KB | Electron main process: window creation, IPC handlers, lifecycle management. |
| `preload.cjs` | 1.1 KB | Security preload script: exposes `window.royalERP` via contextBridge. |
| `index.html` | 109 KB | Main desktop renderer UI: unified login, workspace tab host, staff autofill. |
| `server.cjs` | 3.1 KB | Embedded Node.js HTTP server: serves port 3000, proxies `/api/*` to router. |
| `.env` | 964 B | Local configuration (Port, Super Admin credentials, AppData flags). |
| `cinema-hall.jpg` | 49 KB | High-resolution background for desktop authentication card. |
| `cinema-login-hero.jpg` | 267 KB | Secondary branding graphic asset. |

#### Operational Workspaces (`resources/app/workspaces/`):
| File Name | Size | Operational Function |
|---|---|---|
| `city_lite_cinema_erp_multi_counter_role_login.html` | 138 KB | **Box Office POS**: Screen seat maps, booking hold timers, cash/UPI checkout, thermal receipt printing. |
| `city_lite_f_b_counter_pos_role_login.html` | 177 KB | **Concessions POS**: F&B quick ordering, combo discounts, inventory deduction. |
| `city_lite_cinema_erp_command_center_role_login.html` | 104 KB | **Manager Command Center**: Daily collection reports (DCR), distributor settlements, tax records. |
| `customer-ticket-booking.html` | 250 KB | **Self-Service Kiosk**: Customer ticket selection and simulated payment flow. |

#### Desktop Backend Microservices (`resources/app/backend/`):
| File Name | Size | Architectural Responsibility |
|---|---|---|
| `index.js` | 960 B | Module exports aggregator for backend services. |
| `config/env.js` | 1.4 KB | Environment variable loader and fallback provider. |
| `config/paths.js` | 1.3 KB | Data directory resolver (`%APPDATA%/RoyalCinemaERP/`). |
| `database/db.js` | 11.3 KB | JSON database engine: file reads/writes, transactional locking, indexing. |
| `database/seed.js` | 2.4 KB | Default cinema initialization (Super Admin, Palanpur Flagship company). |
| `routes/apiRouter.js` | 18.7 KB | REST routing engine for all `/api/*` endpoints. |
| `services/authService.js` | 6.2 KB | Login verification, PBKDF2 salt checks, session resolution. |
| `services/branchService.js`| 8.5 KB | Multi-branch routing, branch switching, branch configuration. |
| `services/companyService.js`| 7.1 KB | Company registration, subscription expiry checks, 1-click renewal. |
| `services/syncService.js` | 5.8 KB | Offline seat lease acquisition, duplicate check, cloud reconciliation journal. |
| `services/notificationService.js`| 4.8 KB | In-app alerts, WhatsApp/Gmail notification triggers. |
| `services/supportService.js`| 4.0 KB | Support ticket dispatching and call request queue. |
| `services/supportRbacService.js`| 4.8 KB | Support engineer tenant isolation (masked client data). |
| `services/workflowService.js`| 8.5 KB | Cinema business process automation workflows. |
| `services/salesService.js` | 2.5 KB | Ticket sales logging and revenue aggregation. |
| `services/userService.js` | 2.2 KB | Staff account provisioning and role assignments. |
| `services/passwordService.js`| 800 B | Native Node.js `crypto.scryptSync` password hashing. |

#### Standalone HTML Prototypes (`resources/app/`):
| File Name | Size | Prototype Description |
|---|---|---|
| `saas-website.html` | 84.6 KB | Monolithic prototype of Public SaaS Website. |
| `client-portal.html` | 41.3 KB | Monolithic prototype of Client Subscription Portal. |
| `super-admin-portal.html` | 49.4 KB | Monolithic prototype of Super Admin Cloud Console. |
| `subscription-plans.html` | 24.8 KB | Standalone prototype of Pricing & Plans comparison matrix. |
| `checkout.html` | 23.0 KB | Standalone prototype of Razorpay / UPI checkout flow. |

---

### 2.3 Cloud SaaS Platform Files (`enterprise-production/`)

#### Next.js Frontend (`enterprise-production/frontend-nextjs/`):
- `package.json`: Dependencies for Next.js 14, Tailwind CSS, Lucide React, Three.js.
- `src/app/(auth)/`: Authenticated checkout, login, register, verify screens.
- `src/app/(marketing)/`: Public pages (Home, About, Features, Solutions, Pricing, Book Demo, Contact, Privacy, Terms).
- `src/app/portal/`: Subscribed client cinema dashboard (Branches, Subscriptions, Billing, Downloads, Licenses, Support).
- `src/app/admin/`: Super Admin console (Tenants, Branches, Payments, Invoices, Demos, Support, Releases, Audit Logs).
- `src/lib/api-client.ts`: Typed REST client with automatic tenant header injection.

#### NestJS Backend (`enterprise-production/backend-nestjs/`):
- `package.json`: Dependencies for NestJS 10, Mongoose, Passport, AWS SDK, Razorpay.
- `src/main.ts`: Application bootstrap with global ValidationPipes, CORS, and Helmet.
- `src/app.module.ts`: Root module orchestrating 18 domain modules:
  `AuthModule`, `OrganizationsModule`, `BranchesModule`, `UsersModule`, `RolesModule`, `PlansModule`, `SubscriptionsModule`, `PaymentsModule`, `InvoicesModule`, `LicensesModule`, `DevicesModule`, `DemoRequestsModule`, `SupportModule`, `ChatModule`, `CallsModule`, `NotificationsModule`, `ReleasesModule`, `AnalyticsModule`, `AuditLogsModule`, `SyncModule`, `BookingsModule`, `ConcessionsModule`.
- `src/common/guards/`: `TenantGuard`, `RolesGuard`, `CompanyStatusGuard`.
- `src/common/decorators/`: `@Tenant()`, `@Roles()`, `@CurrentUser()`.

#### Shared Contracts & Infrastructure:
- `enterprise-production/shared/contracts/sync.contract.ts`: Offline seat leasing data contract.
- `enterprise-production/shared/types/`: `tenant.types.ts`, `support.types.ts`.
- `enterprise-production/terraform/`: `main.tf`, `variables.tf`, `outputs.tf` for AWS deployment.
- `enterprise-production/docker-compose.yml`: Local multi-service development environment.

---

### 2.4 Root Automation & Migration Scripts (`*.cjs`, `*.ps1`)
Over previous development sessions, 17 automation scripts were generated in the root directory:
1. `add_api_routes.cjs`: Scaffolding script for desktop REST API routes.
2. `add_sync_routes.cjs`: Scaffolding script for desktop sync endpoints.
3. `append_sections_15_20.cjs`: Documentation builder script.
4. `append_section_21.cjs`: Blueprint documentation extension script.
5. `build_pixel_perfect_login.cjs`: HTML/CSS generator for `resources/app/index.html`.
6. `crop_bg.ps1`: Image manipulation script for auditorium hero asset.
7. `integrate_branch_support.cjs`: Multi-branch modal injector for desktop shell.
8. `patch_handlers.cjs`: Script patcher for index.html interactive events.
9. `scaffold_nestjs_modules.cjs`: Modular generator for NestJS domain modules.
10. `seed_multi_clients.cjs`: Multi-tenant mock database seeder.
11. `setup_target_structure.cjs`: Directory scaffolding utility.
12. `test_multi_client_sync.cjs`: Integration test runner for offline seat leasing.
13. `update_app_module.cjs`: Module registration patcher for NestJS.
14. `update_architecture_md.cjs`: Architecture markdown generator.
15. `update_index_clean.cjs`: HTML cleanup script.
16. `update_index_ui.cjs`: DOM query analyzer.
17. `update_super_admin.cjs`: Super Admin portal HTML updater.

---

## 3. Structural Bottlenecks & Overlaps

1. **Mixing Application Types in Root**: Compiled binary DLLs and application scripts reside side-by-side in the repository root.
2. **Double Maintenance Burden**: Prototype HTML files in `resources/app/` replicate pages already built in Next.js TypeScript.
3. **Packaging Dependency**: `Royal Cinema ERP.exe` requires the `resources/` folder to be situated directly adjacent to its executable. Moving `resources/` without a redirection wrapper will immediately break desktop app execution.
