# Royal Cinema ERP — Stage 4 Final Project Structure

**Generated**: November 17, 2026  
**Status**: Stage 4 Canonical Architecture Established  
**Git Baseline Commit**: `482d358bddd2b5392fba555436b4782810d1b6b5`  

---

## 1. Architectural Overview

The Royal Cinema ERP repository has been restructured from a mixed monolith into an enterprise-grade, decoupled architecture separating the standalone **Offline-First Electron Desktop ERP** from the **Cloud SaaS Multi-Tenant Platform**.

```
Royal-Cinema-ERP-Setup-0.3.0/
├── enterprise-production/              # Modular Cloud SaaS Platform (Monorepo Workspaces)
│   ├── apps/                           # Independent Web & API Deployables
│   │   ├── public-website/             # Public Marketing, Pricing, & Features (Port 3001)
│   │   ├── client-portal/              # Subscribed Cinema Owner & Manager Portal (Port 3002)
│   │   ├── super-admin/                # SaaS Master Multi-Tenant Control Panel (Port 3003)
│   │   └── backend-api/                # NestJS 10 Enterprise REST & WebSocket API (Port 4000)
│   ├── packages/                       # Shared Internal Packages
│   │   ├── shared-types/               # Domain Entities, Tenant Types, DTOs
│   │   ├── shared-ui/                  # Rich Orange Design System Components & Theme
│   │   ├── api-client/                 # Unified Axios Client targeting Port 4000
│   │   └── validation/                 # Zod Schemas & RBAC Policies
│   └── infrastructure/                 # Deployment & Infrastructure as Code
│       ├── docker/                     # Docker Compose & Container Configurations
│       └── terraform/                  # Cloud Provisioning Templates
│
├── legacy-desktop/                     # Canonical Standalone Electron Desktop Application
│   └── electron-app/                   # Self-Contained Desktop Runtime (Port 3000)
│       ├── Royal Cinema ERP.exe        # Packaged Electron Desktop Binary (249.8 MB)
│       ├── locales/                    # 55 Chromium Language Resource Bundles
│       ├── resources/                  # Application ASAR Archive & Source Tree
│       │   ├── app.asar                # Packaged Production Runtime Archive
│       │   ├── elevate.exe             # UAC Elevation Utility
│       │   └── app/                    # Unbundled Development Source Tree
│       │       ├── backend/            # Embedded Node.js Services, SQLite/JSON Engine, Sync
│       │       ├── workspaces/         # Mission-Critical Desktop Workspaces
│       │       │   ├── city_lite_cinema_erp_multi_counter_role_login.html (Box Office POS)
│       │       │   ├── city_lite_f_b_counter_pos_role_login.html (F&B Concessions POS)
│       │       │   ├── city_lite_cinema_erp_command_center_role_login.html (Manager Console)
│       │       │   └── customer-ticket-booking.html (Self-Service Kiosk)
│       │       ├── main.cjs            # Electron Main Process & Native Window Lifecycle
│       │       ├── preload.cjs         # Context-Isolated Secure IPC Bridge
│       │       ├── server.cjs          # Embedded Desktop HTTP Web Server (Port 3000)
│       │       └── index.html          # Role-Based Authentication & Workstation Selector
│       └── *.dll, *.pak, *.bin         # Chromium & V8 Dynamic Link Libraries and Snapshots
│
├── tools/                              # Operational, Maintenance & Migration Utilities
│   ├── launch-desktop.ps1              # One-Click PowerShell Launcher for Desktop Application
│   └── migration/                      # Archived Migration & Utility Scripts
│       ├── quarantine/                 # Quarantined Original Root Files (Rollback Archive)
│       │   └── root-desktop-quarantine/# Exact 18 Root Desktop Items Preserved Intact
│       ├── archive/                    # Archived Pre-Modularization Remnants
│       │   └── legacy-staging/         # Legacy backend-nestjs & frontend-nextjs
│       └── *.cjs                       # Archived Root Utility Scripts
│
├── package.json                        # Root Monorepo Orchestrator (npm Workspaces)
└── [Architectural Governance Reports]  # Audit Trails, Safety Reports, & Verification Matrices
```

---

## 2. Port & Execution Matrix

Every component has a verified, non-conflicting port allocation:

| Component | Default Port | Working Directory | Launch Command |
|:---|:---:|:---|:---|
| **Canonical Desktop Server** | **3000** | `legacy-desktop/electron-app/` | `npm run dev:desktop`<br>*(or `tools/launch-desktop.ps1`)* |
| **Public Marketing Website** | **3001** | `enterprise-production/apps/public-website/` | `npm run dev:website` |
| **Client Subscription Portal** | **3002** | `enterprise-production/apps/client-portal/` | `npm run dev:portal` |
| **Super Admin Portal** | **3003** | `enterprise-production/apps/super-admin/` | `npm run dev:admin` |
| **Central Backend API** | **4000** | `enterprise-production/apps/backend-api/` | `npm run dev:api` |

---

## 3. Data Flow & Boundary Rules

1. **Workspace Boundary**:
   - `legacy-desktop/electron-app` is strictly excluded from `package.json` workspaces. It functions as an independent, self-contained desktop runtime requiring zero external npm dependencies.
2. **Persistence Boundary**:
   - The desktop application stores all local databases, seat reservations, and offline journals in `%APPDATA%/royal-cinema-erp-desktop/royal-erp-data/`, ensuring total independence from source code restructuring.
3. **SaaS Cloud Alignment**:
   - All frontend applications (`public-website`, `client-portal`, `super-admin`) communicate with the central NestJS API on **Port 4000** via `@royal-cinema/api-client`.
4. **Quarantine Safety Layer**:
   - The original root desktop components are preserved in `tools/migration/quarantine/root-desktop-quarantine/` for immediate rollback capability.
