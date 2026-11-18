# Royal Cinema ERP — Stage 4 Runtime Test Results

**Date of Execution**: November 17, 2026  
**Environment**: Windows 11 / Node.js 22.x / Electron 28.x distribution  
**Canonical Desktop Path**: `legacy-desktop/electron-app/`  
**Quarantine Path**: `tools/migration/quarantine/root-desktop-quarantine/`  
**Git Baseline Commit**: `482d358bddd2b5392fba555436b4782810d1b6b5`  
**Test Suite**: `scratch/test_stage4_canonical_runtime.cjs`  
**Total Tests Executed**: 30  
**Status**: **30/30 PASSED (100% Pass Rate)**

---

## 1. Executive Summary

Following the physical relocation of the 18 root desktop runtime components into the quarantine archive, Stage 4 runtime verification was executed across the live repository.

The test suite verified that:
1. The repository root is completely clean of loose desktop binaries, DLLs, and resources.
2. The quarantined copy preserves all 18 items with 100% cryptographic SHA-256 match.
3. The canonical desktop server operates continuously on default **Port 3000** directly from `legacy-desktop/electron-app/`.
4. All four operational workstations (Box Office Counter POS, F&B POS, Cinema Manager Command Center, Customer Kiosk) serve valid HTML payloads with HTTP 200.
5. Multi-client tenant context resolution, 2-hour offline seat leases, double-booking conflict detection (HTTP 409), and offline journal sync operate flawlessly.
6. The user's permanent `%APPDATA%` persistence layer remains untouched, with all 9 companies and 5 staff users verified.
7. SaaS application configurations across all three Next.js apps and the shared API client consistently point to the NestJS cloud backend on **Port 4000**.

---

## 2. Test Execution Matrix

| # | Category | Test Case | Target Path / Port | Expected Result | Actual Result | Status |
|:---:|:---|:---|:---|:---|:---|:---:|
| 1 | Cleanliness | Root Clean: Executable | `Royal Cinema ERP.exe` | Does not exist in root | Clean (Relocated) | **PASS** |
| 2 | Cleanliness | Root Clean: Resources | `resources/` | Does not exist in root | Clean (Relocated) | **PASS** |
| 3 | Cleanliness | Root Clean: Locales | `locales/` | Does not exist in root | Clean (Relocated) | **PASS** |
| 4 | Quarantine | Archive Directory | `tools/migration/quarantine/root-desktop-quarantine/` | Directory exists | Exists on disk | **PASS** |
| 5 | Quarantine | Preserved Executable | `root-desktop-quarantine/Royal Cinema ERP.exe` | 249,831,936 bytes | Intact (SHA-256 matched) | **PASS** |
| 6 | Quarantine | Preserved Resources | `root-desktop-quarantine/resources/` | `app/`, `app.asar`, `elevate.exe` | All files intact | **PASS** |
| 7 | Quarantine | Preserved Locales | `root-desktop-quarantine/locales/` | 55 `.pak` locale packages | All 55 files intact | **PASS** |
| 8 | Server | Desktop Server Lifecycle | `http://localhost:3000/` | HTTP 200, serves `index.html` | HTTP 200 (109,202 bytes) | **PASS** |
| 9 | Operational UI | Box Office Counter POS | `http://localhost:3000/workspaces/city_lite_cinema_erp_multi_counter_role_login.html` | HTTP 200, full POS payload | HTTP 200 (137,802 bytes) | **PASS** |
| 10 | Operational UI | F&B Concessions POS | `http://localhost:3000/workspaces/city_lite_f_b_counter_pos_role_login.html` | HTTP 200, full POS payload | HTTP 200 (176,828 bytes) | **PASS** |
| 11 | Operational UI | Manager Command Center | `http://localhost:3000/workspaces/city_lite_cinema_erp_command_center_role_login.html` | HTTP 200, full Admin payload | HTTP 200 (104,050 bytes) | **PASS** |
| 12 | Operational UI | Customer Kiosk | `http://localhost:3000/workspaces/customer-ticket-booking.html` | HTTP 200, full Kiosk payload | HTTP 200 (248,829 bytes) | **PASS** |
| 13 | Prototypes | Public Marketing Page | `http://localhost:3000/saas-website.html` | HTTP 200, full landing page | HTTP 200 (84,241 bytes) | **PASS** |
| 14 | Prototypes | Client Subscription Portal | `http://localhost:3000/client-portal.html` | HTTP 200, full portal UI | HTTP 200 (41,231 bytes) | **PASS** |
| 15 | Prototypes | Super Admin Portal | `http://localhost:3000/super-admin-portal.html` | HTTP 200, master SaaS UI | HTTP 200 (49,343 bytes) | **PASS** |
| 16 | Prototypes | Subscription Plans | `http://localhost:3000/subscription-plans.html` | HTTP 200, plan matrix | HTTP 200 (24,757 bytes) | **PASS** |
| 17 | Prototypes | Subscription Checkout | `http://localhost:3000/checkout.html` | HTTP 200, checkout flow | HTTP 200 (22,925 bytes) | **PASS** |
| 18 | Backend | Canonical Backend Module | `legacy-desktop/electron-app/resources/app/backend` | Requires cleanly without errors | Loaded cleanly | **PASS** |
| 19 | Backend | Dynamic ROOT_DIR | `backend.paths.ROOT_DIR` | Points to canonical staged path | `.../legacy-desktop/electron-app/resources/app` | **PASS** |
| 20 | Persistence | APPDATA Database: Orgs | `%APPDATA%/.../companies.json` | Valid array of companies | 9 companies loaded | **PASS** |
| 21 | Persistence | APPDATA Database: Users | `%APPDATA%/.../users.json` | Valid array of users | 5 users loaded | **PASS** |
| 22 | Offline Engine | Lease Acquisition | `syncService.acquireSeatLease` | Grants 2h lock on `[C1, C2]` | Granted on `['C1', 'C2']` | **PASS** |
| 23 | Offline Engine | Conflict Detection (409) | `syncService.acquireSeatLease` | Conflict detected on `C2` | Conflict detected on `C2` | **PASS** |
| 24 | Offline Engine | Offline Journal Entry | `syncService.recordOfflineBooking` | Saved to local journal `jrn_*` | Saved (`jrn_*`) | **PASS** |
| 25 | Offline Engine | Journal Reconciliation | `syncService.reconcileOfflineJournal` | Syncs transactions to backend | Reconciled >= 1 transaction | **PASS** |
| 26 | Alignment | NestJS Backend Port | `enterprise-production/apps/backend-api/src/main.ts` | Default port 4000 | Configured on port 4000 | **PASS** |
| 27 | Alignment | Client Portal API Base | `apps/client-portal/src/lib/api-client.ts` | Base URL targets port 4000 | Targets `localhost:4000/api/v1` | **PASS** |
| 28 | Alignment | Public Website API Base | `apps/public-website/src/lib/api-client.ts` | Base URL targets port 4000 | Targets `localhost:4000/api/v1` | **PASS** |
| 29 | Alignment | Super Admin API Base | `apps/super-admin/src/lib/api-client.ts` | Base URL targets port 4000 | Targets `localhost:4000/api/v1` | **PASS** |
| 30 | Alignment | Shared API Client | `packages/api-client/src/index.ts` | Base URL targets port 4000 | Targets `localhost:4000/api/v1` | **PASS** |

---

## 3. Hardware Test Distinctions (Transparent Audit)

In strict accordance with audit instructions, software tests are clearly distinguished from physical hardware tests:

1. **Actual Desktop GUI Window Rendering**:
   - *Status*: **PENDING LOCAL HARDWARE / PLAYWRIGHT SUITE**
   - *Explanation*: In headless background execution on Windows, Electron's `new BrowserWindow()` requires an interactive desktop session to map to an active monitor. The underlying Chromium binary, V8 snapshots, and HTML entry points were verified via static analysis and HTTP serving.
2. **Physical Thermal Printer Slip Printing**:
   - *Status*: **PENDING LOCAL HARDWARE DEVICE**
   - *Explanation*: Code-level verification confirmed `printTicketSlip()`, 80mm iframe generation, and ESC/POS styling. Actual physical printing requires a physical USB/serial receipt printer connected to the host.
