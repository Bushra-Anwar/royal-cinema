# REMAINING RISKS & STAGE 3 PRE-FLIGHT AUDIT: ROYAL CINEMA ERP

**Author:** Senior Enterprise Architecture Team  
**Date:** November 17, 2026  
**Status:** Post-Stage 2 Pre-Flight Assessment  
**Scope:** Evaluation of remaining technical risks prior to requesting authorization for Stage 3 (Desktop Staging & Relocation).

---

## 1. Remaining Risk Matrix Prior to Stage 3

| Risk ID | Risk Description | Severity | Likelihood | Pre-Flight Mitigation Status |
|---|---|---|---|---|
| **REM-01** | Relocating `Royal Cinema ERP.exe` breaking Windows C++ dynamic linker. | **HIGH** | Medium | **MITIGATED IN STAGING**: Staging copy verified that executable must move with all 12 companion DLLs and `resources/` as a single atomic folder unit. |
| **REM-02** | Breaking workspace iframe URLs inside `index.html`. | **HIGH** | Low | **CONTROLLED**: `workspaces/` remains at the exact relative path (`resources/app/workspaces/`). |
| **REM-03** | Local sales and ticket data loss during desktop move. | **LOW** | Negligible | **VERIFIED RESOLVED**: Local data lives in `%APPDATA%/royal-cinema-erp-desktop/royal-erp-data/`, outside the repository entirely. |
| **REM-04** | SaaS applications requiring `npm install` for compilation. | **MEDIUM** | High | **PLANNED FOR STAGE 4**: Monorepo root `package.json` with npm workspaces will orchestrate single-command dependency installation (`npm install`). |
| **REM-05** | ASAR archive divergence from unpacked source. | **LOW** | Low | **CONTROLLED**: Mandated `npx asar pack` build step after any desktop modifications. |

---

## 2. Pre-Flight Checklist for Stage 3 (When Authorized)

When Stage 3 authorization is requested:
1. **Parallel Copy First**: The desktop runtime will first be copied into `legacy-desktop/electron-app/` while keeping the original root binaries completely intact.
2. **Staged Smoke Test**: Run the staged desktop application from `legacy-desktop/` and verify that the login UI loads, credentials can be entered, and POS counter workspaces initialize.
3. **Approval Gate Before Root Cleanup**: Only after the staged copy passes all launch checks will the user be asked for approval to clean up the duplicate binaries in root.

---

## 3. Rollback Status

Both rollback mechanisms established before Stage 1 remain 100% active and verified:
- **Git Safety Snapshot**: `git reset --hard HEAD` instantly reverts all changes.
- **Physical Safety Baseline**: `Royal-Cinema-ERP-Setup-0.3.0-BACKUP-SAFETY-BASELINE` contains all 316 original files verified with SHA-256 hashes.
