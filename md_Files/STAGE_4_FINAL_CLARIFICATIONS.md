# Royal Cinema ERP — Stage 4 Final Clarification Audit Report

**Audit Date**: November 17, 2026  
**Status**: AUDIT ONLY — STAGE 4 EXECUTION NOT STARTED  
**Git Baseline Commit**: `482d358bddd2b5392fba555436b4782810d1b6b5`  
**External Backup Baseline**: `c:\Users\boxoffice2\Downloads\Royal-Cinema-ERP-Setup-0.3.0-BACKUP-SAFETY-BASELINE`  

---

## 1. Backend Port Consistency Audit

### 1.1 Empirical Codebase Audit Results
An exhaustive code search across all configuration files, manifests, environment templates, and source code was conducted to resolve the port discrepancy between Port 4000 and Port 3004.

| File Location | Configured Code / Property | Actual Target Port |
|:---|:---|:---:|
| `enterprise-production/apps/backend-api/src/main.ts` (L66) | `const port = process.env.PORT \|\| 4000;` | **4000** |
| `enterprise-production/.env.example` (L7) | `PORT=4000` | **4000** |
| `enterprise-production/docker-compose.yml` (L36, L39) | `- '4000:4000'`, `PORT: 4000` | **4000** |
| `enterprise-production/infrastructure/docker/docker-compose.yml` (L36, L39) | `- '4000:4000'`, `PORT: 4000` | **4000** |
| `enterprise-production/apps/public-website/src/lib/api-client.ts` (L3) | `API_BASE_URL = process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:4000/api/v1'` | **4000** |
| `enterprise-production/apps/client-portal/src/lib/api-client.ts` (L3) | `API_BASE_URL = process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:4000/api/v1'` | **4000** |
| `enterprise-production/apps/super-admin/src/lib/api-client.ts` (L3) | `API_BASE_URL = process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:4000/api/v1'` | **4000** |
| `enterprise-production/packages/api-client/src/index.ts` (L3) | `API_BASE_URL = process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:4000/api/v1'` | **4000** |
| `enterprise-production/README.md` (L85) | `http://localhost:4000/api/v1` | **4000** |
| `ARCHITECTURE_AUDIT.md`, `RESTRUCTURING_PLAN.md`, `STAGE_2_EXECUTION_REPORT.md` | Dedicated NestJS 10 REST & WebSocket API | **4000** |

### 1.2 Discrepancy Resolution
- **Finding**: The true, authoritative, and configured port across all NestJS source code, Docker configs, and frontend API clients is **PORT 4000**.
- **Root Cause of Mention of 3004**: In `STAGE_4_PREFLIGHT_REPORT.md` (Table 3.3), port `3004` was erroneously listed in a conceptual table following a sequential 3001, 3002, 3003 pattern.
- **Resolution**: **PORT 4000 is formally reaffirmed as the canonical port for the NestJS backend API.** No port modifications are required in source code.

### 1.3 Canonical Port Allocation Matrix

| Application | Assigned Port | Runtime Command |
|:---|:---:|:---|
| **Electron Desktop Web Server** | **3000** | `node legacy-desktop/electron-app/resources/app/server.cjs` |
| **Public Marketing Website** | **3001** | `npm run dev --workspace=royal-cinema-public-website` |
| **Client Subscription Portal** | **3002** | `npm run dev --workspace=royal-cinema-client-portal` |
| **Super Admin Portal** | **3003** | `npm run dev --workspace=royal-cinema-super-admin` |
| **Central Backend API (NestJS)** | **4000** | `npm run start:dev --workspace=royal-cinema-backend-nestjs` |

---

## 2. Electron Runtime Testing: Performed vs. Pending

To ensure complete empirical transparency, tests are strictly categorized by what was executed versus what remains pending for hardware/GUI execution:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   STAGE 3 & 4A TEST COVERAGE MATRIX                    │
├────────────────────────────────┬────────────┬──────────────────────────┤
│ Test Level                     │ Status     │ Execution Details        │
├────────────────────────────────┼────────────┼──────────────────────────┤
│ 1. Embedded HTTP Server Tests  │ PERFORMED  │ 100% Passed (Ports 3000  │
│                                │            │ and 3012, all 9 routes)  │
│ 2. Backend Integration Tests   │ PERFORMED  │ 100% Passed (Auth, leases│
│                                │            │ journals, APPDATA JSON)  │
│ 3. Executable & Linkage Tests  │ PERFORMED  │ 100% Passed (PE headers, │
│                                │ (Static)   │ SHA-256, 6 DLLs, 6 PAKs) │
│ 4. Actual Desktop GUI Display  │ PENDING    │ Requires interactive     │
│                                │ (Hardware) │ desktop session          │
│ 5. Physical Thermal Printer    │ PENDING    │ Code verified; physical  │
│                                │ (Hardware) │ ESC/POS print pending    │
└────────────────────────────────┴────────────┴──────────────────────────┘
```

### 2.1 Genuinely Performed Tests (Verified)
1. **Embedded HTTP Web Server Tests**:
   - Staged server spawned on test port 3012 and port 3000. Verified HTTP 200 responses, content-type headers, and asset delivery for all 4 operational workspaces and 5 prototypes.
2. **Backend Integration Tests**:
   - `authService.authenticateUser`: SuperAdmin, Cinema Admin, and invalid password rejection.
   - `syncService.acquireSeatLease`: Multi-workstation seat leasing, expiration management, and conflict detection (HTTP 409).
   - `syncService.recordOfflineBooking` & `reconcileOfflineJournal`: Local journal persistence and cloud synchronization.
   - `db.js`: Successfully read all 9 companies and 5 users from `%APPDATA%/royal-cinema-erp-desktop/royal-erp-data/`.
3. **Executable Integrity & Linkage Tests**:
   - Executable size verified at 249,831,936 bytes with identical SHA-256 hash.
   - Verified co-location and binary presence of all 6 runtime dynamic link libraries (`d3dcompiler_47.dll`, `dxcompiler.dll`, `electron_wer.dll`, `ffmpeg.dll`, `vk_swiftshader.dll`, `vulkan-1.dll`).
   - Verified all 6 Chromium PAK/snapshot files and 55 localization packages in `locales/`.

### 2.2 Genuinely Pending Tests (Requiring Interactive Hardware)
1. **Actual Desktop GUI Window Rendering**:
   - Running in a non-interactive automated test environment cannot render a physical Windows graphical desktop window (`BrowserWindow` in `main.cjs`).
   - *Status*: PENDING interactive launch by a developer on physical Windows desktop or automated Playwright/Spectron GUI test.
2. **Physical Thermal Printer Slip Printing**:
   - Code verification confirmed `printTicketSlip()` with 80mm iframe and print routines in Box Office POS.
   - *Status*: PENDING connection to physical USB/RS-232 thermal receipt hardware (e.g., Epson TM-T82 or TVS RP3200).

---

## 3. Exact List of All 18 Root-Level Desktop Items

The exact 18 items currently at repository root that belong exclusively to the Electron desktop runtime are:

| # | Item Name | Type | Size / Items | Role in Desktop Application |
|:---:|:---|:---:|:---|:---|
| 1 | `Royal Cinema ERP.exe` | File | 249,831,936 bytes | Main Electron Desktop Executable |
| 2 | `chrome_100_percent.pak` | File | 568,479 bytes | Chromium Standard DPI Resource Bundle |
| 3 | `chrome_200_percent.pak` | File | 927,818 bytes | Chromium High-DPI Resource Bundle |
| 4 | `d3dcompiler_47.dll` | File | 4,753,864 bytes | Microsoft Direct3D Shader Compiler |
| 5 | `dxcompiler.dll` | File | 25,779,200 bytes | DirectX Shader Compiler Runtime Library |
| 6 | `electron_wer.dll` | File | 425,472 bytes | Windows Error Reporting Handler |
| 7 | `ffmpeg.dll` | File | 3,097,600 bytes | FFmpeg Audio/Video Codec Library |
| 8 | `icudtl.dat` | File | 10,824,576 bytes | Unicode and Internationalization Data Table |
| 9 | `LICENSE.electron.txt` | File | 1,096 bytes | Electron Open-Source License Notice |
| 10 | `LICENSES.chromium.html` | File | 5,705,935 bytes | Chromium Open-Source Licensing Documentation |
| 11 | `locales` | Directory | 55 `.pak` files | Chromium Multilingual Localization Assets |
| 12 | `resources` | Directory | `app/`, `app.asar`, `elevate.exe` | Packaged Runtime Archive & Application Source |
| 13 | `resources.pak` | File | 13,371,578 bytes | Blink Core Resources and HTML Elements |
| 14 | `snapshot_blob.bin` | File | 374,320 bytes | V8 JavaScript Engine Snapshot State |
| 15 | `v8_context_snapshot.bin` | File | 753,352 bytes | V8 Pre-compiled Execution Context Snapshot |
| 16 | `vk_swiftshader.dll` | File | 5,456,384 bytes | SwiftShader Vulkan Software Rasterizer |
| 17 | `vk_swiftshader_icd.json` | File | 106 bytes | SwiftShader Vulkan Driver Configuration |
| 18 | `vulkan-1.dll` | File | 957,440 bytes | Khronos Vulkan Graphics API Runtime Library |

### Quarantine & Zero-Deletion Confirmation:
- **No Overwriting**: The staged copy in `legacy-desktop/electron-app/` will **not** be modified or overwritten.
- **Quarantine Preservation**: During Stage 4 execution, the 18 root files above will **not be deleted**. Instead, they will be moved into a dedicated quarantine directory:  
  `tools/migration/quarantine/root-desktop-quarantine/`
- **Zero Permanent Deletions**: No original files will be deleted from disk during Stage 4.

---

## 4. Security Findings & Fallback Authentication Audit

*(Confidentiality Notice: No secret or credential values are printed in this report.)*

### 4.1 Identified Credential Locations
1. **Fallback Passwords in Backend Modules**:
   - `resources/app/backend/config/env.js` (lines 31-37): Hardcoded strings used as default credentials for SuperAdmin, Admin, and `APP_SECRET_KEY` if `.env` is absent.
   - `resources/app/backend/services/authService.js` (lines 185, 191): Hardcoded strings used as fallback passwords for `ticketStaff` and `foodStaff`.
   - `resources/app/backend/routes/apiRouter.js` (line 345): Default fallback password assigned during ad-hoc user provisioning.
2. **Local Environment Files**:
   - `resources/app/.env` and `legacy-desktop/electron-app/resources/app/.env`: Files containing development secrets on local disk.

### 4.2 Credential Risk Analysis & Remediation
- **Are credentials active?**: Yes. In the local offline environment, the system permits logging in with the fallback credentials.
- **Risk Assessment**: If deployed to production without an environment file, the application would default to known static passwords, exposing tenant accounts.
- **Remediation Plan (Post-Stage 4 Patch)**:
  1. Add strict environment validation in `env.js`: Throw an error on startup if `APP_SECRET_KEY` or admin passwords are not provided via environment variables in production mode.
  2. Enforce bcrypt salt rounds on all user creation, removing static fallback passwords.
  3. Ensure all `.env` files are ignored by git rules across the entire repository tree.

---

## 5. Final Stage 4 Execution Plan & Rollback Guarantees

### 5.1 Proposed Execution Steps for Stage 4
1. **Step 1: Move Root Desktop Files to Quarantine**:
   - Move the 18 identified items from root to `tools/migration/quarantine/root-desktop-quarantine/`.
2. **Step 2: Initialize Root `package.json`**:
   - Create root `package.json` defining npm workspaces for `enterprise-production/apps/*` and `enterprise-production/packages/*` (excluding Electron desktop).
   - Add unified monorepo scripts (`npm run dev:website`, `npm run dev:portal`, `npm run dev:admin`, `npm run dev:api`, `npm run dev:desktop`).
3. **Step 3: Add Desktop Launcher Script**:
   - Create `tools/launch-desktop.ps1` to launch the canonical desktop application from `legacy-desktop/electron-app/` with one click.
4. **Step 4: Update Migration Script References**:
   - Update `tools/migration/seed_multi_clients.cjs` to target `legacy-desktop/electron-app/resources/app/backend/config/paths`.
5. **Step 5: Post-Execution Verification**:
   - Verify that the staged desktop server launches from `legacy-desktop/electron-app/`.
   - Verify that all operational workspaces respond with HTTP 200.
   - Verify zero data loss in `%APPDATA%`.

### 5.2 Rollback Guarantee
- **Git Rollback**:
  ```powershell
  git checkout 482d358bddd2b5392fba555436b4782810d1b6b5 -- .
  ```
- **Quarantine Restoration**:
  Move files back from `tools/migration/quarantine/root-desktop-quarantine/` to root.
- **External Physical Baseline**:
  `c:\Users\boxoffice2\Downloads\Royal-Cinema-ERP-Setup-0.3.0-BACKUP-SAFETY-BASELINE` (316 files, 100% verified baseline).
- **APPDATA Protection**:
  All cinema databases reside outside the repository in `%APPDATA%/royal-cinema-erp-desktop/royal-erp-data/`, completely immune to workspace movements.

---

## 6. Final Recommendation

**STAGE 4 AUDIT COMPLETE. THE REPOSITORY IS FULLY PREPARED FOR STAGE 4 EXECUTION.**

Execution will proceed only upon your separate, explicit authorization.
