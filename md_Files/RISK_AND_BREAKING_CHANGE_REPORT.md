# RISK AND BREAKING CHANGE REPORT: ROYAL CINEMA ERP

**Author:** Enterprise Architecture Team  
**Date:** November 17, 2026  
**Status:** Phase 1 Complete – Pre-Restructuring Audit  
**Scope:** In-depth risk evaluation, breaking change identification, and rollback mitigation procedures.

---

## 1. Executive Summary

Moving files in a hybrid repository containing compiled Windows C++ binaries, an active Electron desktop application, and a TypeScript cloud platform introduces severe risks if done carelessly. 

A single misplaced file could cause:
- Immediate crash of the operational counter POS application.
- Failure of thermal receipt printers during live cinema shows.
- Breakage of Electron's native binary DLL bindings.
- Corrupted IPC communication between renderer and main processes.
- Accidental exposure of client tenant data across cinema branches.

This report categorizes all identified risks, establishes concrete mitigation strategies, and details safety protocols that must precede any file modifications.

---

## 2. Risk Classification & Impact Matrix

| Risk ID | Risk Description | Severity | Impact Area | Likelihood | Mitigation Strategy |
|---|---|---|---|---|---|
| **RSK-01** | Separating `Royal Cinema ERP.exe` from its adjacent DLLs and `resources/` folder. | **CRITICAL** | Desktop Electron Boot | High | Move the entire binary runtime bundle (`.exe`, DLLs, `locales/`, `resources/`) as a single atomic folder unit into `legacy-desktop/electron-app/`. |
| **RSK-02** | Modifying relative paths in `resources/app/index.html` to workspace iframes. | **CRITICAL** | Counter POS & Ticketing | High | Maintain exact relative directory hierarchy (`workspaces/` directly inside `resources/app/`). |
| **RSK-03** | Breaking embedded Node HTTP server port or loopback endpoints. | **HIGH** | Local API Communication | Medium | Keep `server.cjs` bound to `localhost:3000` with desktop apps using port 3000 and SaaS apps using ports 3001-3003. |
| **RSK-04** | Breaking `%APPDATA%/RoyalCinemaERP/` local database persistence. | **HIGH** | Cinema Sales Data & Users | Medium | Never modify `paths.js` resolution logic without backward-compatible path detection. |
| **RSK-05** | Split of Next.js into 3 apps causing shared session and Tailwind CSS breakage. | **HIGH** | SaaS Web Applications | Medium | Extract shared Tailwind preset and generic UI primitives into `packages/shared-ui/` before splitting app folders. |
| **RSK-06** | Hardware printer driver / ESC-POS integration failure. | **HIGH** | Ticket Printing | Medium | Keep all raw printing hooks in `city_lite_cinema_erp_multi_counter_role_login.html` completely untouched. |
| **RSK-07** | Accidental cross-tenant data leakage during cloud synchronization. | **HIGH** | Data Security & Privacy | Low | Enforce strict server-side validation using NestJS `TenantGuard` and shared `sync.contract.ts`. |
| **RSK-08** | Monorepo package dependency drift. | **MEDIUM** | Build & CI/CD Pipeline | Medium | Implement npm/pnpm workspaces with pinned versions and TypeScript project references. |

---

## 3. Deep-Dive Risk Analysis & Technical Mitigations

### 3.1 RSK-01: Electron Binary Architecture & Relative Path Fragility
- **Problem**: Electron applications compiled for Windows use relative hardcoded offsets to find their runtime components:
  - `Royal Cinema ERP.exe` expects `ffmpeg.dll`, `d3dcompiler_47.dll`, and `icudtl.dat` in the exact same directory as the executable.
  - It expects the application code to exist at `./resources/app.asar` or `./resources/app/package.json`.
- **Breaking Consequence**: If `resources/` is moved to a different relative folder depth from `Royal Cinema ERP.exe`, launching the application will display a fatal dialog: *"Unable to find Electron app"*.
- **Mitigation Protocol**:
  1. The executable, all 12 DLL/PAK/DAT binary files, `locales/`, and the `resources/` folder must move together as an atomic unit into `legacy-desktop/electron-app/`.
  2. A root launcher script or symbolic shortcut can remain in the workspace root for developer convenience, but the physical files must remain co-located.

---

### 3.2 RSK-02: Workspace Iframe Resolution Inside Desktop Shell
- **Problem**: `resources/app/index.html` mounts the operational cinema workspaces dynamically via `iframe.src`:
  ```javascript
  const WORKSPACE_MAP = {
    counter: 'workspaces/city_lite_cinema_erp_multi_counter_role_login.html',
    food: 'workspaces/city_lite_f_b_counter_pos_role_login.html',
    manager: 'workspaces/city_lite_cinema_erp_command_center_role_login.html',
    booking: 'workspaces/customer-ticket-booking.html'
  };
  ```
- **Breaking Consequence**: If `workspaces/` is moved to a shared folder or hoisted to root, all cashier workstations will display `404 Not Found` or white screens upon cashiers selecting their role.
- **Mitigation Protocol**:
  - `workspaces/` must remain permanently inside `legacy-desktop/electron-app/resources/app/workspaces/`.
  - No path modifications inside `index.html` for workspace iframe sources.

---

### 3.3 RSK-03: Port Collisions Between Desktop and SaaS Web Apps
- **Problem**:
  - Desktop embedded Node server runs on `http://localhost:3000`.
  - Next.js development server defaults to `http://localhost:3000`.
- **Breaking Consequence**: Launching Next.js while the desktop app is open will trigger `EADDRINUSE: address already in use :::3000`, causing Next.js or the desktop server to crash.
- **Mitigation Protocol**:
  - Fixed port assignment policy:
    - Desktop Embedded Server: **3000**
    - Public Marketing Website: **3001**
    - Client Subscription Portal: **3002**
    - Super Admin Console: **3003**
    - Cloud NestJS REST API: **4000**
  - Configured in `.env` and `package.json` scripts across all applications.

---

### 3.4 RSK-04: Separation of Unified Next.js into 3 Distinct Web Applications
- **Problem**: Currently, `frontend-nextjs` shares a single `layout.tsx`, `globals.css`, and `tailwind.config.ts` across marketing, portal, and admin screens.
- **Breaking Consequence**: Moving these into three separate Next.js apps (`public-website`, `client-portal`, `super-admin`) could duplicate CSS definitions or break shared navigation components.
- **Mitigation Protocol**:
  1. Create `packages/shared-ui/` to host shared React primitives (Buttons, Modal Shells, Input Fields, Badges, Brand Logos) styled with the Royal Cinema orange palette.
  2. Create a shared Tailwind preset (`packages/shared-ui/tailwind.preset.js`) defining brand color hex values (`#F97316`, `#EA580C`, `#C2410C`, `#FFF7ED`, `#24170F`).
  3. Import this preset into each of the three independent Next.js applications to ensure 100% visual consistency without duplicated CSS.

---

### 3.5 RSK-05: Database Divergence & Multi-Tenant Data Leakage
- **Problem**: Desktop writes to local `%APPDATA%/RoyalCinemaERP/*.json`, while the cloud backend writes to MongoDB Atlas.
- **Breaking Consequence**: If offline desktop sync overwrites cloud data without verifying branch lease ownership, cashier A in Branch 1 could accidentally overwrite bookings made by cashier B in Branch 2.
- **Mitigation Protocol**:
  - Enforce `sync.contract.ts` and `TenantGuard` on the cloud backend.
  - Every offline journal sync payload MUST include `organizationId`, `branchId`, `workstationId`, and `leaseToken`.
  - If a lease conflict is detected (e.g. duplicate seat reservation), the cloud backend returns HTTP 409 Conflict with the conflicting ticket details, prompting the cashier for immediate reconciliation without silent data corruption.

---

## 4. Pre-Migration Safety Protocols & Rollback Plan

Before any files are moved in Phase 5:

1. **Pre-Restructuring Snapshot / Git Branch**:
   - Create a dedicated branch: `git checkout -b archive/pre-restructuring-baseline`.
   - Commit all current working files so any accidental regression can be reverted with a single `git reset --hard` command.
2. **ASAR Archive Verification**:
   - Verify that `resources/app.asar` contains a fully working copy of the desktop application as a fallback binary.
3. **Controlled Incremental Moves**:
   - Never move all files at once.
   - **Step 1**: Relocate 17 root utility scripts to `tools/migration/`. Verify repository still runs.
   - **Step 2**: Create `legacy-desktop/electron-app/` and move the binary bundle. Run desktop test.
   - **Step 3**: Modularize `enterprise-production/` into `apps/` and `packages/`. Run Next.js and NestJS build checks.
4. **Verification Gates**:
   - After each move, execute tests to verify:
     a) `Royal Cinema ERP.exe` launches to login screen.
     b) Cashier can autofill credentials and open Box Office POS.
     c) Next.js apps build cleanly without TypeScript errors.
     d) NestJS backend compiles with 100% type safety.
