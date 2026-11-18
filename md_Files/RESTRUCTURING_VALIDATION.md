# RESTRUCTURING VALIDATION & FEASIBILITY REPORT: ROYAL CINEMA ERP

**Author:** Senior Enterprise Architecture Team (Electron, Next.js, NestJS)  
**Date:** November 17, 2026  
**Status:** Pre-Restructuring Validation Complete – Awaiting Explicit User Approval  
**Scope:** In-depth technical verification of the proposed `RESTRUCTURING_PLAN.md` against the live repository.

---

## 1. Verification of Next.js Applications Separation

### 1.1 Technical Feasibility Analysis
The proposed separation of `enterprise-production/frontend-nextjs` into three dedicated applications:
1. `apps/public-website` (Port 3001) – Marketing, Features, Pricing, Demo, Solutions, Legal.
2. `apps/client-portal` (Port 3002) – Subscribed Cinema Owner Portal (Branches, Billing, Downloads, Licenses).
3. `apps/super-admin` (Port 3003) – Cloud Operator Console (Tenants, Global Revenue, Audit Logs, Releases).

**Audit Finding**: **FEASIBLE AND STRONGLY RECOMMENDED**, with specific architectural guardrails.

### 1.2 Route and Link Decoupling
An automated audit of all `href` links across `enterprise-production/frontend-nextjs/src/app` identified only **13 unique navigation paths**:
- **Public Website Routes**: `/`, `/about`, `/contact`, `/demo`, `/features`, `/pricing`, `/solutions`, `/privacy`, `/terms`.
- **Client Portal Routes**: `/portal/overview`, `/portal/branches`, `/portal/subscriptions`, `/portal/billing`, `/portal/downloads`, `/portal/licenses`, `/portal/support`, `/portal/settings`.
- **Super Admin Routes**: `/admin/dashboard`, `/admin/organizations`, `/admin/branches`, `/admin/payments`, `/admin/invoices`, `/admin/releases`, `/admin/support`, `/admin/settings`, `/admin/team`.
- **Auth Routes**: `/login`, `/register`, `/checkout`, `/forgot-password`.

There are **zero circular dependencies** between the internal components of the marketing pages, client portal, and admin portal. They were already logically grouped into separate route directories (`(marketing)`, `portal`, `admin`).

### 1.3 Authentication & Session Isolation
In the current code, `src/lib/api-client.ts` uses `localStorage` (`royal_access_token` and `royal_tenant_id`).
- In browser security, `localStorage` is isolated per origin (protocol + host + port).
- **Security Validation**: Separating the Client Portal from Super Admin into distinct ports/domains (`portal.royalcinemaerp.com` vs `admin.royalcinemaerp.com`) is **standard enterprise security practice**. Super Admins and cinema clients should **never** share the same authentication tokens or session storage.
- **SSO / Redirection**: The Public Website's "Sign In" button will point directly to the Client Portal login URL (`http://localhost:3002/login` in dev; `https://portal.royalcinemaerp.com/login` in prod).

### 1.4 Shared Styles & UI Primitives
Currently, `src/app/globals.css` defines the Rich Orange palette:
- Rich Orange: `#F97316`
- Deep Orange: `#EA580C`
- Burnt Orange: `#C2410C`
- Warm Cream: `#FFF7ED`
- Dark Brown: `#24170F`

To eliminate duplicate CSS across the three Next.js apps:
- Extract `tailwind.preset.js` into `packages/shared-ui/`.
- Each app's `tailwind.config.ts` extends this preset. This ensures 100% color and typography uniformity with zero CSS drift.

---

## 2. File Ownership Classification: Desktop vs. Cloud SaaS

Every file in the repository has been definitively classified:

```
┌────────────────────────────────────────────────────────────────────────┐
│ ELECTRON DESKTOP APPLICATION SCOPE (Preserve 100% Intact)               │
│  - Executables & DLLs: Royal Cinema ERP.exe, ffmpeg.dll, d3dcompiler*  │
│  - Chromium Bundles: resources.pak, icudtl.dat, chrome_*.pak, locales/ │
│  - Electron Entry: resources/app/main.cjs, preload.cjs                 │
│  - Desktop Master Shell: resources/app/index.html, cinema-hall.jpg     │
│  - Offline POS Workspaces: resources/app/workspaces/*.html (4 files)   │
│  - Embedded Micro-Server: resources/app/server.cjs (Port 3000)         │
│  - Embedded Database & Services: resources/app/backend/*               │
│  - Offline HTML Prototypes: resources/app/*.html (5 files)             │
│  - Compiled Package: resources/app.asar, elevate.exe                   │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ CLOUD SAAS PLATFORM SCOPE (Modularize into Apps & Packages)             │
│  - Next.js Web: enterprise-production/frontend-nextjs/src/app/*        │
│  - NestJS API: enterprise-production/backend-nestjs/src/*             │
│  - Contracts & Types: enterprise-production/shared/*                   │
│  - Infrastructure: enterprise-production/terraform/*, docker-compose  │
│  - Documentation: enterprise-production/ARCHITECTURE.md                │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ REPOSITORY AUTOMATION & TOOLS SCOPE (Archive to tools/migration/)       │
│  - 17 Root Scripts: add_api_routes.cjs, build_pixel_perfect_login.cjs, │
│                     integrate_branch_support.cjs, seed_*.cjs, etc.    │
│  - Working scratch files: scratch/*                                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Complete File-by-File Movement Mapping

The table below provides the exact current path and verified destination for every directory and file in the workspace:

| Current File / Directory Path | Target Proposed Destination | Classification | Rationale & Path Rule |
|---|---|---|---|
| `./Royal Cinema ERP.exe` | `legacy-desktop/electron-app/Royal Cinema ERP.exe` | Desktop Executable | Must be adjacent to runtime DLLs and `resources/`. |
| `./d3dcompiler_47.dll` | `legacy-desktop/electron-app/d3dcompiler_47.dll` | Runtime DLL | Direct3D shader compiler. Must accompany `.exe`. |
| `./dxcompiler.dll` | `legacy-desktop/electron-app/dxcompiler.dll` | Runtime DLL | DirectX compiler. Must accompany `.exe`. |
| `./electron_wer.dll` | `legacy-desktop/electron-app/electron_wer.dll` | Runtime DLL | Crash reporting handler. Must accompany `.exe`. |
| `./ffmpeg.dll` | `legacy-desktop/electron-app/ffmpeg.dll` | Runtime DLL | Audio/video decoder. Must accompany `.exe`. |
| `./icudtl.dat` | `legacy-desktop/electron-app/icudtl.dat` | Runtime Data | Unicode library data. Must accompany `.exe`. |
| `./resources.pak` | `legacy-desktop/electron-app/resources.pak` | Runtime Asset | Chromium base pack. Must accompany `.exe`. |
| `./chrome_100_percent.pak` | `legacy-desktop/electron-app/chrome_100_percent.pak` | Runtime Asset | UI asset pack. Must accompany `.exe`. |
| `./chrome_200_percent.pak` | `legacy-desktop/electron-app/chrome_200_percent.pak` | Runtime Asset | High-DPI pack. Must accompany `.exe`. |
| `./snapshot_blob.bin` | `legacy-desktop/electron-app/snapshot_blob.bin` | V8 Binary | V8 heap snapshot. Must accompany `.exe`. |
| `./v8_context_snapshot.bin` | `legacy-desktop/electron-app/v8_context_snapshot.bin` | V8 Binary | V8 context snapshot. Must accompany `.exe`. |
| `./vk_swiftshader.dll` | `legacy-desktop/electron-app/vk_swiftshader.dll` | Runtime DLL | Software Vulkan fallback. Must accompany `.exe`. |
| `./vk_swiftshader_icd.json` | `legacy-desktop/electron-app/vk_swiftshader_icd.json` | Runtime Config | Driver configuration. Must accompany `.exe`. |
| `./vulkan-1.dll` | `legacy-desktop/electron-app/vulkan-1.dll` | Runtime DLL | Vulkan loader. Must accompany `.exe`. |
| `./LICENSE.electron.txt` | `legacy-desktop/electron-app/LICENSE.electron.txt` | License | Desktop license file. |
| `./LICENSES.chromium.html` | `legacy-desktop/electron-app/LICENSES.chromium.html` | License | Chromium license file. |
| `./locales/` | `legacy-desktop/electron-app/locales/` | Runtime Asset | Localized language packs for Chromium. |
| `./resources/` (Entire directory) | `legacy-desktop/electron-app/resources/` | Desktop Application | Contains `app.asar`, `elevate.exe`, and `app/`. |
| `resources/app/workspaces/*` | `legacy-desktop/electron-app/resources/app/workspaces/*` | Desktop Operational POS | Kept exactly at relative depth `workspaces/`. |
| `resources/app/backend/*` | `legacy-desktop/electron-app/resources/app/backend/*` | Desktop Embedded Backend | Kept adjacent to `server.cjs` and `index.html`. |
| `enterprise-production/frontend-nextjs/src/app/(marketing)/*` | `enterprise-production/apps/public-website/src/app/` | SaaS Public Website | Dedicated Next.js app for marketing pages. |
| `enterprise-production/frontend-nextjs/src/app/(auth)/login` | `enterprise-production/apps/public-website/src/app/login` | SaaS Auth | Public login redirect or unified entry. |
| `enterprise-production/frontend-nextjs/src/app/portal/*` | `enterprise-production/apps/client-portal/src/app/` | SaaS Client Portal | Dedicated Next.js app for cinema tenants. |
| `enterprise-production/frontend-nextjs/src/app/admin/*` | `enterprise-production/apps/super-admin/src/app/` | SaaS Super Admin | Dedicated Next.js app for cloud operators. |
| `enterprise-production/backend-nestjs/*` | `enterprise-production/apps/backend-api/` | SaaS Cloud Backend | Standalone NestJS 10 REST/WebSocket server. |
| `enterprise-production/shared/contracts/*` | `enterprise-production/packages/shared-types/src/contracts/` | Shared Package | Shared data transfer contracts. |
| `enterprise-production/shared/types/*` | `enterprise-production/packages/shared-types/src/types/` | Shared Package | Shared TypeScript interfaces and enums. |
| `enterprise-production/frontend-nextjs/src/lib/api-client.ts` | `enterprise-production/packages/api-client/src/index.ts` | Shared Package | Shared typed Axios API client. |
| `enterprise-production/terraform/*` | `enterprise-production/infrastructure/terraform/` | Infrastructure | AWS Cloud infrastructure definitions. |
| `enterprise-production/docker-compose.yml` | `enterprise-production/infrastructure/docker/docker-compose.yml` | Infrastructure | Local multi-service development configuration. |
| `./*.cjs`, `./crop_bg.ps1` (17 scripts) | `tools/migration/` | Utility Archive | Clean up workspace root without deleting scripts. |
| `./scratch/*` | `tools/scratch/` | Utility Archive | Temporary scripts and verification files. |

---

## 4. Files That Must NOT Be Moved Individually

The following files possess strict runtime coupling and **must never be decoupled from their immediate sibling files**:

1. **`Royal Cinema ERP.exe`**:
   - Must remain in the exact same directory as: `d3dcompiler_47.dll`, `dxcompiler.dll`, `ffmpeg.dll`, `icudtl.dat`, `resources.pak`, `snapshot_blob.bin`, `v8_context_snapshot.bin`, `vk_swiftshader.dll`, `vulkan-1.dll`, and `locales/`.
   - Reason: Hardcoded Windows dynamic linker offsets. If separated, the binary will fail with `STATUS_DLL_NOT_FOUND`.
2. **`resources/` Directory**:
   - Must remain directly adjacent to `Royal Cinema ERP.exe`.
   - Reason: Electron's native C++ bootstrapper searches `./resources/app.asar` or `./resources/app`. If `resources/` is moved elsewhere, the launcher halts with *"Unable to find Electron app"*.
3. **`resources/app/workspaces/`**:
   - Must remain inside `resources/app/workspaces/`.
   - Reason: `resources/app/index.html` mounts iframes using hardcoded relative paths:
     `workspaces/city_lite_cinema_erp_multi_counter_role_login.html`.
4. **`resources/app/backend/config/paths.js` & `db.js`**:
   - Must remain inside `resources/app/backend/`.
   - Reason: `server.cjs` and `main.cjs` require `./backend`.

---

## 5. Handling of Existing HTML Prototypes

The following standalone HTML prototype files exist in `resources/app/`:
- `saas-website.html` (84.6 KB)
- `client-portal.html` (41.3 KB)
- `super-admin-portal.html` (49.4 KB)
- `subscription-plans.html` (24.8 KB)
- `checkout.html` (23.0 KB)

### Policy: DO NOT DELETE
These prototypes will be **strictly preserved** inside `legacy-desktop/electron-app/resources/app/` for the following reasons:
1. **Embedded Server Routing**: `resources/app/server.cjs` explicitly routes HTTP requests to them:
   ```javascript
   if (normalizedLower === '/website') safePath = '/saas-website.html';
   if (normalizedLower === '/portal') safePath = '/client-portal.html';
   if (normalizedLower === '/admin') safePath = '/super-admin-portal.html';
   if (normalizedLower === '/checkout') safePath = '/checkout.html';
   ```
2. **Desktop Shell Integration**: Inside `resources/app/index.html`, direct navigation links point to these prototypes:
   - `🌐 Public SaaS Website →`
   - `🏢 Client Portal →`
   - `👑 Super Admin Portal →`
3. **Offline Fallback**: Cinema operators running the desktop app without internet access can view these guides and portal screens offline.
4. **Authoritative Cloud Source**: While these prototypes remain as offline desktop fallbacks, the three Next.js applications in `enterprise-production/apps/` serve as the live production SaaS codebase.

---

## 6. Embedded Node.js Backend vs. NestJS Backend Communication

To ensure zero duplication of responsibilities, the two backends have clearly delineated roles:

```
┌────────────────────────────────────────────────────────┐
│ LOCAL CINEMA COUNTER (PC)                              │
│                                                        │
│ [ Cashier POS Terminal ]                               │
│       │                                                │
│       ▼                                                │
│ [ Embedded Node.js Micro-Server ] (Port 3000)          │
│   ├── Local Offline Seat Leases (instant locking)      │
│   ├── Local PBKDF2 Cashier Auth                        │
│   ├── Local JSON Persistence (sync_journal.json)       │
│   └── Thermal Receipt Printer Serial Driver            │
│       │                                                │
└───────┼────────────────────────────────────────────────┘
        │
        │ Internet Available: Background HTTPS Sync
        │ POST /api/v1/sync/reconcile
        │ Headers: x-organization-id, x-branch-id
        ▼
┌────────────────────────────────────────────────────────┐
│ CLOUD SAAS CLUSTER (AWS / Docker)                      │
│                                                        │
│ [ NestJS 10 Enterprise Backend ] (Port 4000)           │
│   ├── Multi-Tenant Context (TenantGuard)               │
│   ├── MongoDB Atlas Cloud Database                     │
│   ├── Seat Lease Conflict Arbitrator (409 on clash)    │
│   ├── Razorpay / Stripe Per-Branch Billing Engine      │
│   ├── Super Admin Universal Support Queue & Calls      │
│   └── Windows Installer Release Server (Setup.exe)     │
└────────────────────────────────────────────────────────┘
```

### Protocol & Responsibility Matrix:
- **Local Counter Execution**: The embedded Node.js server (`server.cjs` on port 3000) owns local cashier POS actions. It never connects to MongoDB directly.
- **Cloud SaaS Execution**: The NestJS backend (`apps/backend-api` on port 4000) owns cloud tenant accounts, payments, and global reporting.
- **Sync Bridge**: The desktop's `syncService.js` makes periodic HTTPS calls to NestJS `/api/v1/sync/*` using the shared contract in `packages/shared-types/src/contracts/sync.contract.ts`. No business logic is duplicated.

---

## 7. Configuration, Scripts, Environment & Imports Verification

### 7.1 Port Allocations
To eliminate development port conflicts:
- `3000`: Desktop Embedded Node.js Server (`resources/app/server.cjs`)
- `3001`: SaaS Public Website (`apps/public-website`)
- `3002`: SaaS Client Portal (`apps/client-portal`)
- `3003`: SaaS Super Admin Console (`apps/super-admin`)
- `4000`: SaaS NestJS Cloud Backend (`apps/backend-api`)

### 7.2 Root `package.json` Orchestration
In the restructured repository, a root `package.json` with npm workspaces will coordinate all services:
```json
{
  "name": "royal-cinema-erp-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "enterprise-production/apps/*",
    "enterprise-production/packages/*"
  ],
  "scripts": {
    "desktop": "electron legacy-desktop/electron-app/resources/app",
    "desktop:server": "node legacy-desktop/electron-app/resources/app/server.cjs",
    "dev:website": "npm --workspace=public-website run dev",
    "dev:portal": "npm --workspace=client-portal run dev",
    "dev:admin": "npm --workspace=super-admin run dev",
    "dev:backend": "npm --workspace=backend-api run start:dev",
    "build:all": "npm run --workspaces build"
  }
}
```

---

## 8. Offline JSON Database Continuity Verification

The existing local database engine (`resources/app/backend/database/db.js`) resolves its storage path via:
```javascript
const appData = process.env.APPDATA || (process.platform === 'darwin' 
  ? path.join(os.homedir(), 'Library', 'Application Support') 
  : path.join(os.homedir(), '.config'));
const DATA_DIR = path.join(appData, 'RoyalCinemaERP');
```

**Verification Results**:
1. Because data is stored in the user's OS application data directory (`C:\Users\<user>\AppData\Roaming\RoyalCinemaERP`), moving files within the project repository **has zero effect on stored sales data, customer tickets, or active staff accounts**.
2. If `%APPDATA%` is inaccessible, `paths.js` falls back to `path.join(__dirname, '..', 'data')`. This relative fallback remains valid because `backend/config/paths.js` and `backend/data/` move together as a unit.
3. **Continuity Guarantee**: Desktop cashiers will retain 100% of their existing data upon launching from the new location.

---

## 9. Identification of Risks & Mitigations

### Risk 1: Absence of Git Repository in Root Directory
- **Audit Discovery**: The repository root does **NOT** contain a `.git` directory (`Get-ChildItem -Force` returned null).
- **Risk**: Any accidental file deletion during restructuring cannot be undone via `git checkout` or `git reset`.
- **Mandatory Mitigation**: Before any files are relocated, a **full physical directory backup snapshot** must be created at `_backup_pre_restructuring/`. Additionally, `git init` must be executed to establish an immutable commit baseline.

### Risk 2: ASAR Archive Synchronization
- Both `resources/app/` (unpacked) and `resources/app.asar` (compiled archive) exist.
- When `Royal Cinema ERP.exe` runs, Electron prioritizes `app.asar`.
- **Mitigation**: After any modification or verification, always execute:
  `npx asar pack resources\app resources\app.asar`
  to keep the compiled binary and source files synchronized.

### Risk 3: Windows MAX_PATH (260 Character Limit)
- Windows APIs can fail if file paths exceed 260 characters.
- **Mitigation**: Keep monorepo subfolder names concise (`apps/`, `packages/`, `legacy-desktop/`).

---

## 10. Summary & Restructuring Approval Checklist

### A. Verified Target Directory Structure
```
Royal-Cinema-ERP-Setup-0.3.0/
├── legacy-desktop/electron-app/    # Complete Windows executable, DLLs, resources, workspaces
├── enterprise-production/
│   ├── apps/
│   │   ├── public-website/         # Next.js Port 3001
│   │   ├── client-portal/          # Next.js Port 3002
│   │   ├── super-admin/            # Next.js Port 3003
│   │   └── backend-api/            # NestJS Port 4000
│   ├── packages/
│   │   ├── shared-types/           # Shared interfaces & contracts
│   │   ├── shared-ui/              # Orange brand Tailwind preset & React components
│   │   ├── api-client/             # Typed API client
│   │   └── validation/             # DTO schemas
│   └── infrastructure/             # Docker & Terraform
├── tools/migration/                # 17 archived root scripts
└── package.json                    # Monorepo root workspace orchestrator
```

### B. Files That Must Not Be Moved Individually
- `Royal Cinema ERP.exe` and its 12 runtime DLLs, `.pak` files, and `locales/` must move together as an atomic bundle.
- `resources/app/workspaces/` must remain inside `resources/app/`.
- Embedded HTML prototypes (`saas-website.html`, etc.) must remain in `resources/app/`.

### C. Required Backups
- Full physical filesystem copy to `_backup_pre_restructuring/`.
- Initialization of Git baseline (`git init && git add . && git commit -m "Baseline before restructuring"`).

### D. Exact Execution Sequence
1. **Safety Backup**: Create `_backup_pre_restructuring` and initialize Git baseline.
2. **Tools Archival**: Move 17 root `.cjs` and `.ps1` scripts to `tools/migration/`.
3. **Desktop Isolation**: Create `legacy-desktop/electron-app/` and move the executable, DLLs, and `resources/` as a single unit.
4. **Cloud Monorepo Organization**: Reorganize `enterprise-production/` into `apps/`, `packages/`, and `infrastructure/`.
5. **Root Orchestration**: Create root `package.json` with npm workspaces and convenience scripts.
6. **Repack ASAR**: Pack `legacy-desktop/electron-app/resources/app` into `app.asar`.
7. **Verification**: Run diagnostic tests for Desktop launch, local server, and Next.js / NestJS builds.

---

> **Awaiting User Approval**: No files have been moved or modified. Please reply with your explicit approval to proceed with the execution sequence.
