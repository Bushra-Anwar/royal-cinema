# Stage 4A: Final Relocation Pre-Flight Audit Report (Audit Only)

**Audit Date**: November 17, 2026  
**Audit Scope**: Pre-Flight Relocation and Workspace Feasibility Assessment (Strictly Read-Only)  
**Target Repository**: `Royal-Cinema-ERP-Setup-0.3.0`  
**Git Baseline Commit**: `482d358bddd2b5392fba555436b4782810d1b6b5`  
**External Backup Baseline**: `c:\Users\boxoffice2\Downloads\Royal-Cinema-ERP-Setup-0.3.0-BACKUP-SAFETY-BASELINE`  
**Recommendation**: **READY FOR STAGE 4 EXECUTION (SUBJECT TO USER APPROVAL)**

---

## 1. Desktop Relocation Readiness

### 1.1 Integrity of Staged Application
The staged desktop application located at `legacy-desktop/electron-app/` was inspected:
- **Runtime Completeness**: All 109 required runtime files are present, identical, and verified against SHA-256 baseline checksums.
- **Binary Architecture**: `Royal Cinema ERP.exe` (249,831,936 bytes) sits alongside all 6 Chromium/Direct3D dynamic link libraries (`d3dcompiler_47.dll`, `dxcompiler.dll`, `electron_wer.dll`, `ffmpeg.dll`, `vk_swiftshader.dll`, `vulkan-1.dll`), all 6 V8/Chromium PAK bundles, and 55 localization packages in `locales/`.
- **Packaged & Source Hierarchy**: Both the runtime archive (`resources/app.asar`, 1.43 MB) and the unbundled developer tree (`resources/app/`) are fully populated.

### 1.2 Path Calculations & Persistence Independence
- **Dynamic `ROOT_DIR`**: In `resources/app/backend/config/env.js`, `ROOT_DIR` is dynamically computed as `path.resolve(__dirname, '..', '..')`. In the staged location, this resolves cleanly to `legacy-desktop/electron-app/resources/app` with zero hardcoded filesystem paths.
- **Permanent APPDATA Persistence**: In `resources/app/backend/config/paths.js`, `getDataDir()` resolves dynamically to `%APPDATA%/royal-cinema-erp-desktop/royal-erp-data/`. Staging the desktop application does **not** alter the persistence location, preserving all existing company accounts, staff users, tickets, and seat reservations.
- **Canonical Viability**: The staged copy was tested on Port 3000 and isolated test port 3012 across all 4 operational workspaces, 5 prototypes, authentication workflows, offline seat leasing, and conflict prevention, achieving a 100% pass rate (29/29 tests). **The staged application is fully prepared to become the canonical desktop application.**

---

## 2. Root Workspace Readiness

### 2.1 Proposed Workspace Layout
A new root `package.json` should be established to coordinate the modular SaaS architecture:

```json
{
  "name": "royal-cinema-monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "Royal Cinema ERP & SaaS Enterprise Platform",
  "workspaces": [
    "enterprise-production/apps/*",
    "enterprise-production/packages/*"
  ],
  "scripts": {
    "dev:website": "npm run dev --workspace=royal-cinema-public-website",
    "dev:portal": "npm run dev --workspace=royal-cinema-client-portal",
    "dev:admin": "npm run dev --workspace=royal-cinema-super-admin",
    "dev:api": "npm run start:dev --workspace=royal-cinema-backend-nestjs",
    "dev:desktop": "node legacy-desktop/electron-app/resources/app/server.cjs",
    "build": "npm run build --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present"
  }
}
```

### 2.2 Workspace Boundary: Electron Desktop Exclusion
- **Decision**: `legacy-desktop/electron-app` (and its `resources/app/`) **must NOT be included in npm workspaces**.
- **Technical Justification**:
  1. The Electron desktop application is built with standard Node.js built-in modules (`http`, `fs`, `path`, `url`, `crypto`) and CommonJS modules. It requires zero external npm packages.
  2. Adding `resources/app` to root npm workspaces would cause `npm install` to hoist node_modules or create symlinks inside `legacy-desktop/electron-app/`, which causes `electron-builder` and `asar` packaging failures on Windows.
  3. Keeping it standalone guarantees that desktop operations remain 100% isolated from SaaS monorepo dependency trees.

### 2.3 Dependency & Conflict Audit
- An automated comparison of all 8 `package.json` manifests across `enterprise-production/apps/` and `enterprise-production/packages/` revealed:
  - **Zero dependency version conflicts**: Next.js (`14.2.3`), React (`18.3.1`), TypeScript (`5.4.5`), Tailwind CSS (`3.4.3`), and Lucide React (`0.383.0`) are completely synchronized across all frontend apps.
  - **Zero package naming collisions**: All apps use distinct names (`royal-cinema-*`), and shared libraries use scoped names (`@royal-cinema/*`).

---

## 3. Dependency Installation and Build Strategy

### 3.1 Installation Plan
1. **Root Monorepo**: Run `npm install` from the repository root once root `package.json` is established. This will create a unified root `node_modules` and symlink `@royal-cinema/*` packages into the apps.
2. **Desktop Application**: Requires **no** `npm install`. It runs directly on native Node.js / Electron standard libraries.

### 3.2 Build Order & Pipeline
When building for production:
1. **Phase 1 (Core Types & Validation)**:
   - Build `@royal-cinema/shared-types`
   - Build `@royal-cinema/validation`
2. **Phase 2 (Client & UI Libraries)**:
   - Build `@royal-cinema/api-client`
   - Build `@royal-cinema/shared-ui`
3. **Phase 3 (Applications)**:
   - Build `royal-cinema-backend-nestjs` (`nest build`)
   - Build `royal-cinema-public-website` (`next build`)
   - Build `royal-cinema-client-portal` (`next build`)
   - Build `royal-cinema-super-admin` (`next build`)

### 3.3 Port Allocation Strategy (Zero Collision)
Every component operates on an isolated, non-overlapping port:

| Component | Default Port | Environment Variable | Role |
|:---|:---:|:---:|:---|
| **Electron Desktop Web Server** | **3000** | `PORT=3000` | Box Office POS, Kiosks, Offline Engine |
| **Public Marketing Website** | **3001** | `PORT=3001` | Public Landing, Features, Pricing |
| **Client Subscription Portal** | **3002** | `PORT=3002` | Subscribed Cinema Owner Portal |
| **Super Admin Portal** | **3003** | `PORT=3003` | SaaS Master Multi-Tenant Control |
| **Central Backend API (NestJS)** | **3004** | `PORT=3004` | SaaS Cloud API & Database Engine |

---

## 4. Security Findings & Remediation Plan

*(Note: In strict compliance with security instructions, no actual secret or credential values are printed in this report.)*

### 4.1 Identified Credential & Secret Locations
1. **Local Environment Files**:
   - `legacy-desktop/electron-app/resources/app/.env` (and root `resources/app/.env`): Contains local development credentials and application secret keys.
   - `enterprise-production/.env.example`: Safe template file.
2. **Fallback Credentials in Source Code**:
   - `resources/app/backend/services/authService.js` (lines 185, 191): Fallback default passwords for demo accounts (`ticketStaff`, `foodStaff`).
   - `resources/app/backend/config/env.js` (lines 31-37): Fallback credentials for SuperAdmin and Admin used only if `.env` is absent.
   - `resources/app/backend/routes/apiRouter.js` (line 345): Default fallback password for ad-hoc user creation.

### 4.2 Remediation Recommendations (Post-Relocation)
1. **Git Protection**: Ensure root `.gitignore` contains `**/.env`, `**/.env.*`, and `!**/.env.example` so that active environment files are never committed to remote version control.
2. **Secret Randomization**: In a post-restructuring patch, replace static fallback strings in `env.js` and `authService.js` with dynamically generated random tokens or strict environment variable assertion (`if (!process.env.APP_SECRET) throw new Error(...)`).
3. **Production Cloud Security**: For SaaS staging/production deployments, configure environment secrets via cloud secret managers (e.g., AWS Secrets Manager or HashiCorp Vault) rather than disk-based `.env` files.

---

## 5. Final Relocation Plan (Before & After Mapping)

### 5.1 Desktop Files Relocation (From Root -> `legacy-desktop/electron-app/`)

| # | Current Root Location | Destination in `legacy-desktop/electron-app/` | Status |
|:---|:---|:---|:---:|
| 1 | `Royal Cinema ERP.exe` | `legacy-desktop/electron-app/Royal Cinema ERP.exe` | Already Staged & Verified |
| 2 | `chrome_100_percent.pak` | `legacy-desktop/electron-app/chrome_100_percent.pak` | Already Staged & Verified |
| 3 | `chrome_200_percent.pak` | `legacy-desktop/electron-app/chrome_200_percent.pak` | Already Staged & Verified |
| 4 | `d3dcompiler_47.dll` | `legacy-desktop/electron-app/d3dcompiler_47.dll` | Already Staged & Verified |
| 5 | `dxcompiler.dll` | `legacy-desktop/electron-app/dxcompiler.dll` | Already Staged & Verified |
| 6 | `electron_wer.dll` | `legacy-desktop/electron-app/electron_wer.dll` | Already Staged & Verified |
| 7 | `ffmpeg.dll` | `legacy-desktop/electron-app/ffmpeg.dll` | Already Staged & Verified |
| 8 | `icudtl.dat` | `legacy-desktop/electron-app/icudtl.dat` | Already Staged & Verified |
| 9 | `LICENSE.electron.txt` | `legacy-desktop/electron-app/LICENSE.electron.txt` | Already Staged & Verified |
| 10 | `LICENSES.chromium.html` | `legacy-desktop/electron-app/LICENSES.chromium.html` | Already Staged & Verified |
| 11 | `locales/` (55 PAK files) | `legacy-desktop/electron-app/locales/` | Already Staged & Verified |
| 12 | `resources/` (`app.asar`, `elevate.exe`, `app/`) | `legacy-desktop/electron-app/resources/` | Already Staged & Verified |
| 13 | `resources.pak` | `legacy-desktop/electron-app/resources.pak` | Already Staged & Verified |
| 14 | `snapshot_blob.bin` | `legacy-desktop/electron-app/snapshot_blob.bin` | Already Staged & Verified |
| 15 | `v8_context_snapshot.bin` | `legacy-desktop/electron-app/v8_context_snapshot.bin` | Already Staged & Verified |
| 16 | `vk_swiftshader.dll` | `legacy-desktop/electron-app/vk_swiftshader.dll` | Already Staged & Verified |
| 17 | `vk_swiftshader_icd.json` | `legacy-desktop/electron-app/vk_swiftshader_icd.json` | Already Staged & Verified |
| 18 | `vulkan-1.dll` | `legacy-desktop/electron-app/vulkan-1.dll` | Already Staged & Verified |

### 5.2 Files and Folders that MUST Remain at Root
- `.git/` & `.gitignore`
- `enterprise-production/` (Complete SaaS application suite and shared packages)
- `legacy-desktop/` (Canonical home for the desktop application)
- `tools/` (Migration tools and maintenance utilities)
- `scratch/` (Inspection scripts and test runners)
- Architectural governance and audit reports (`ARCHITECTURE_AUDIT.md`, `STAGE_1_EXECUTION_REPORT.md`, `STAGE_2_EXECUTION_REPORT.md`, `STAGE_3_EXECUTION_REPORT.md`, `STAGE_3_HASH_VERIFICATION.md`, `STAGE_3_RUNTIME_TEST_RESULTS.md`, `STAGE_3_REMAINING_RISKS.md`, `STAGE_4_PREFLIGHT_REPORT.md`)

### 5.3 Path Updates in Migration Scripts
- In `tools/migration/seed_multi_clients.cjs`:
  - Update line 2: `const paths = require('./resources/app/backend/config/paths');`
  - To fallback gracefully:
    `const paths = fs.existsSync('./legacy-desktop/electron-app/resources/app') ? require('./legacy-desktop/electron-app/resources/app/backend/config/paths') : require('./resources/app/backend/config/paths');`

---

## 6. Rollback Plan

If any regression occurs during Stage 4 execution:
1. **Primary Rollback (Git)**:
   ```powershell
   git checkout 482d358bddd2b5392fba555436b4782810d1b6b5 -- .
   ```
2. **Secondary Physical Baseline Rollback**:
   Restore directly from the verified external backup at:
   `c:\Users\boxoffice2\Downloads\Royal-Cinema-ERP-Setup-0.3.0-BACKUP-SAFETY-BASELINE`
3. **Database Safety Guarantee**:
   The local persistence database resides outside the repository in `%APPDATA%/royal-cinema-erp-desktop/royal-erp-data/`. Neither Git rollback nor folder relocation touches or endangers production databases.

---

## 7. Unresolved Technical Debt & Mitigations

1. **Pre-Existing `companyService.js` Missing Import**:
   - `companyService.js:132` references `getUsers()` without importing it from `db.js`.
   - *Status*: Kept untouched per restructuring rules. Documented for post-restructuring bugfix patch.
2. **External Windows Shortcuts**:
   - Desktop shortcuts pointing to root `Royal Cinema ERP.exe` should be updated or a launcher script provided (`tools/launch-desktop.ps1`).
3. **Redundant Legacy Staging Directories**:
   - `enterprise-production/backend-nestjs/` and `enterprise-production/frontend-nextjs/` are pre-modularization remnants superseded by `enterprise-production/apps/`. These can be safely archived into `tools/migration/archive/` during Stage 4 cleanup.

---

## 8. Final Recommendation

**STATUS: READY TO PROCEED TO STAGE 4 EXECUTION.**

All technical prerequisites, dependency structures, port configurations, and safety rollbacks are fully verified. Execution will begin only upon explicit user approval.
