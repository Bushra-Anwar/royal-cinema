# RESTRUCTURING PLAN: ROYAL CINEMA ERP

**Author:** Enterprise Architecture Team  
**Date:** November 17, 2026  
**Status:** Phase 1 Complete – Proposed Plan for Review & Approval  
**Objective:** Cleanly separate the legacy desktop application from the enterprise SaaS cloud platform into an enterprise-grade monorepo without breaking existing operational counter workflows.

---

## 1. Architectural Principles & Non-Negotiables

1. **Protect the Working Desktop Application**: The existing Electron desktop app must continue to launch and execute ticket bookings, F&B counter orders, command center ledger reports, and thermal printing without regression.
2. **Strict Separation of SaaS Applications**: The Public Marketing Website, Client Subscription Portal, and Super Admin Cloud Console must be isolated into distinct applications with independent access boundaries.
3. **Dedicated Shared Packages**: Only truly generic and reusable elements (types, API client, validation schemas, shared UI primitives) belong in `packages/`. Domain-specific logic remains encapsulated in its owning application.
4. **Royal Cinema Brand Integrity**: All new SaaS user interfaces adhere strictly to the Rich Orange identity:
   - Primary: **Rich Orange** (`#F97316`)
   - Accent / Hover: **Deep Orange** (`#EA580C`)
   - Active / Focus: **Burnt Orange** (`#C2410C`)
   - Backgrounds & Cards: **Warm Cream** (`#FFF7ED`) & Pure White (`#FFFFFF`)
   - Typography: **Dark Brown** (`#24170F`) & Slate Dark
   - *Navy Blue is strictly prohibited as a primary brand colour.*
   - Existing Electron operational screens remain visually untouched.
5. **Enforced Multi-Tenant Security**: Every cloud endpoint enforces server-side tenant scoping (`organizationId`, `branchId`, role permissions). No client-side filtering for tenant isolation.

---

## 2. Target Repository Directory Structure

```
Royal-Cinema-ERP-Setup-0.3.0/
│
├── legacy-desktop/                       # DEDICATED DESKTOP APPLICATION RUNTIME
│   └── electron-app/
│       ├── Royal Cinema ERP.exe          # Main Windows executable (249MB)
│       ├── [Runtime DLLs & PAKs]         # ffmpeg.dll, d3dcompiler_47.dll, resources.pak
│       ├── locales/                      # Chromium localization packs
│       └── resources/
│           ├── app.asar                  # Compiled production ASAR package
│           ├── elevate.exe               # Windows UAC escalation helper
│           └── app/                      # Unpacked desktop source
│               ├── main.cjs              # Electron main process
│               ├── preload.cjs           # Secure IPC bridge
│               ├── index.html            # Desktop master shell & login
│               ├── server.cjs            # Embedded Node HTTP server (Port 3000)
│               ├── cinema-hall.jpg       # Login card background asset
│               ├── package.json          # Desktop package config
│               ├── workspaces/           # 4 Mission-Critical Operational Workspaces
│               │   ├── city_lite_cinema_erp_multi_counter_role_login.html (POS)
│               │   ├── city_lite_f_b_counter_pos_role_login.html (F&B)
│               │   ├── city_lite_cinema_erp_command_center_role_login.html (Ledger)
│               │   └── customer-ticket-booking.html (Kiosk)
│               └── backend/              # Embedded Node.js Microservice & JSON DB
│                   ├── config/           # env.js, paths.js
│                   ├── database/         # db.js, seed.js (Local JSON engine)
│                   ├── routes/           # apiRouter.js
│                   └── services/         # auth, branch, company, sync, support, etc.
│
├── enterprise-production/                # DEDICATED SAAS CLOUD PLATFORM
│   ├── apps/
│   │   ├── public-website/               # Next.js Public Website (Marketing, Pricing, Demo)
│   │   ├── client-portal/                # Next.js Client Subscription & Branch Management
│   │   ├── super-admin/                  # Next.js Cloud Provider Console (Tenants, Revenue)
│   │   └── backend-api/                  # NestJS Enterprise REST API & WebSocket Server
│   │
│   ├── packages/
│   │   ├── shared-types/                 # Universal TypeScript interfaces & enums
│   │   ├── shared-ui/                    # Reusable Orange Brand UI Components (Buttons, Cards)
│   │   ├── api-client/                   # Typed HTTP API client with tenant headers
│   │   └── validation/                   # Universal DTO validation schemas
│   │
│   ├── infrastructure/
│   │   ├── docker/                       # Dockerfiles and docker-compose.yml
│   │   └── terraform/                    # AWS ECS Fargate, ALB, CloudFront, VPC IaC
│   │
│   ├── docs/                             # Architecture specifications & API references
│   └── tests/                            # E2E test suites & sync reconciliation tests
│
├── tools/                                # REPOSITORY SCRIPTS & MIGRATION UTILITIES
│   └── migration/                        # Archived root automation scripts (*.cjs, *.ps1)
│
├── ARCHITECTURE_AUDIT.md                 # Full architectural assessment report
├── CURRENT_PROJECT_STRUCTURE.md          # Current pre-restructuring directory tree
├── DUPLICATE_FILES_REPORT.md             # Code overlap and duplication analysis
├── DEPENDENCY_MAP.md                     # Package dependencies and binary runtime map
├── RESTRUCTURING_PLAN.md                 # This plan
└── RISK_AND_BREAKING_CHANGE_REPORT.md    # Risk analysis and rollback safeguards
```

---

## 3. Detailed File Movement & Mapping Table

| Source Location (Current) | Target Location (Proposed) | Action | Required Path & Configuration Adjustments |
|---|---|---|---|
| `Royal Cinema ERP.exe` | `legacy-desktop/electron-app/Royal Cinema ERP.exe` | Move | Keep adjacent to runtime DLLs and `resources/`. |
| `*.dll`, `*.pak`, `*.bin`, `*.dat` (Root) | `legacy-desktop/electron-app/` | Move | Move as a single atomic unit to preserve dynamic linking. |
| `locales/` | `legacy-desktop/electron-app/locales/` | Move | Move as a unit with root binaries. |
| `resources/` (Entire folder) | `legacy-desktop/electron-app/resources/` | Move | Preserve internal relative paths (`app/`, `app.asar`, `elevate.exe`). |
| `enterprise-production/frontend-nextjs/src/app/(marketing)/*` | `enterprise-production/apps/public-website/src/app/` | Move / Isolate | Configure dedicated Next.js app on port 3001. |
| `enterprise-production/frontend-nextjs/src/app/portal/*` | `enterprise-production/apps/client-portal/src/app/` | Move / Isolate | Configure dedicated Next.js app on port 3002. |
| `enterprise-production/frontend-nextjs/src/app/admin/*` | `enterprise-production/apps/super-admin/src/app/` | Move / Isolate | Configure dedicated Next.js app on port 3003. |
| `enterprise-production/backend-nestjs/*` | `enterprise-production/apps/backend-api/` | Move | Configure standalone NestJS service on port 4000. |
| `enterprise-production/shared/contracts/*` | `enterprise-production/packages/shared-types/src/contracts/` | Reorganize | Update import paths in backend-api and web apps. |
| `enterprise-production/shared/types/*` | `enterprise-production/packages/shared-types/src/types/` | Reorganize | Export from central `index.ts`. |
| `enterprise-production/frontend-nextjs/src/lib/api-client.ts` | `enterprise-production/packages/api-client/src/` | Extract | Package as shared API client with auth interceptors. |
| `enterprise-production/terraform/*` | `enterprise-production/infrastructure/terraform/` | Move | Update paths in deployment scripts. |
| `enterprise-production/docker-compose.yml` | `enterprise-production/infrastructure/docker/docker-compose.yml` | Move | Update relative build contexts for each service. |
| `*.cjs`, `crop_bg.ps1` (17 Root scripts) | `tools/migration/` | Move | Archive utility scripts out of root. |
| `scratch/*` | `tools/scratch/` | Move | Clean up root workspace. |

---

## 4. Separation Strategy for the Three SaaS Web Applications

To satisfy Requirement 5 ("Keep these three SaaS interfaces separate"), the current single Next.js project will be structured into three isolated, independently deployable applications:

### A. Public Website (`apps/public-website`)
- **Port**: 3001
- **Domain**: `royalcinemaerp.com`
- **Pages**:
  - `/`: Hero, product overview, live statistics.
  - `/features`: Deep dive into Ticketing, F&B, Command Center, Hardware.
  - `/solutions`: Single Screen vs. Twin vs. Multiplex Chain solutions.
  - `/pricing`: Per-Branch monthly & yearly subscription plans.
  - `/book-demo`: Lead capture and demonstration booking form.
  - `/contact`: Sales, support, and office contact information.
  - `/faq`: Common operational, pricing, and hardware questions.
  - `/privacy` & `/terms`: Legal agreements and compliance disclosures.
- **Security**: 100% public access, static generation where feasible, zero portal/admin code included in client bundle.

### B. Client Portal (`apps/client-portal`)
- **Port**: 3002
- **Domain**: `portal.royalcinemaerp.com`
- **Pages**:
  - `/overview`: Active plan status, days remaining, branch quick switcher.
  - `/branches`: Add new cinema branch, manage counters, terminal licenses.
  - `/subscriptions`: Billing cycle details, 1-click renewal, upgrade tier.
  - `/billing`: Invoices, tax receipts, GST breakdown, payment history.
  - `/downloads`: Download Windows installer (`Royal Cinema ERP Setup.exe`).
  - `/licenses`: Active workstation keys, deactivate old terminal.
  - `/support`: Submit ticket, WhatsApp integration, schedule callback.
  - `/notifications`: Operational alerts, renewal reminders.
  - `/settings`: Cinema business profile, tax details, contact info.
- **Security**: Authenticated via JWT bearer token. Enforces `TenantGuard` with `organizationId` scoping. No access to Super Admin endpoints.

### C. Super Admin Portal (`apps/super-admin`)
- **Port**: 3003
- **Domain**: `admin.royalcinemaerp.com`
- **Pages**:
  - `/dashboard`: Total MRR/ARR, active cinema count, system health metrics.
  - `/organizations`: Full list of cinema clients, suspend/reactivate tenant.
  - `/branches`: Global branch directory and terminal counts.
  - `/demo-requests`: Incoming leads, schedule demos, assign sales rep.
  - `/plans`: Configure pricing tiers, features, and trial durations.
  - `/subscriptions`: Master subscription ledger and manual extensions.
  - `/payments`: Razorpay transaction status and reconciliation.
  - `/invoices`: Automated invoice generator and credit notes.
  - `/support`: Universal ticket queue, live customer chat console.
  - `/releases`: Publish new desktop application versions (`Setup.exe`).
  - `/team`: Super Admin team members and granular permissions.
  - `/audit-logs`: Immutable audit trail of every administrative action.
  - `/settings`: Global SMTP, Razorpay API keys, AWS credentials.
- **Security**: Restricted to `SUPER_ADMIN` role with optional MFA. Strict IP allow-listing and audit logging.

---

## 5. Safe Phased Implementation Process

The restructuring will strictly adhere to the user's sequential phases:

```
Phase 1: Architecture Audit & Documentation (CURRENT - COMPLETE)
   │
   ▼
Phase 2: Review & Approval of Restructuring Plan (USER DECISION GATE)
   │
   ▼
Phase 3: Pre-Movement Risk Assessment & Backup Snapshot
   │
   ▼
Phase 4: Create Dedicated Migration Git Branch or Safety Snapshot
   │
   ▼
Phase 5: Execute Controlled File Relocation (Group by Group)
   │     Group A: Archive root scripts to tools/migration/
   │     Group B: Relocate Electron binaries & resources to legacy-desktop/
   │     Group C: Organize enterprise-production/ into apps/, packages/, infrastructure/
   │
   ▼
Phase 6: Update Relative Imports, Configuration Files, and Package JSONs
   │
   ▼
Phase 7: Build, Typecheck, and Unit Test Verification across all packages
   │
   ▼
Phase 8: Runtime Operational Workflow Verification (Electron boot, POS, Ticketing, F&B)
   │
   ▼
Phase 9: Final Acceptance Review & Documentation Delivery
```

> **IMPORTANT**: No files will be moved, renamed, or modified until the user explicitly reviews and approves this plan.
