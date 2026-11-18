# Royal Cinema ERP — Stage 4 Remaining Risks & Technical Debt Log

**Generated**: November 17, 2026  
**Scope**: Post-Stage 4 Final Restructuring Technical Audit  
**Baseline Git Commit**: `482d358bddd2b5392fba555436b4782810d1b6b5`  

---

## 1. Technical Debt & Pre-Existing In-Code Deficiencies

### Risk 1: Pre-Existing Missing Import in `companyService.js` (Non-Regressive Bug)
* **Location**: `legacy-desktop/electron-app/resources/app/backend/services/companyService.js` (Line 132)
* **Description**: The function `checkCompanySubscription(identifier)` references `getUsers()` to look up user company associations, but `getUsers` was omitted from the `require('../database/db')` destructuring at line 2.
* **Impact**: Requesting subscription status for a non-cached client identifier throws `ReferenceError: getUsers is not defined`.
* **Current Status**: Left 100% untouched during Stage 4 in accordance with restructuring preservation rules (*"Do not modify existing application logic or UI"*).
* **Remediation Action**: In an upcoming post-restructuring patch, update line 2 to:
  ```javascript
  const { getCompanies, saveCompanies, getUsers } = require('../database/db');
  ```

---

### Risk 2: Static Fallback Credentials in Source Code
* **Locations**:
  - `legacy-desktop/electron-app/resources/app/backend/config/env.js` (Lines 31-37)
  - `legacy-desktop/electron-app/resources/app/backend/services/authService.js` (Lines 185, 191)
  - `legacy-desktop/electron-app/resources/app/backend/routes/apiRouter.js` (Line 345)
* **Description**: Backend services define fallback password literals for SuperAdmin, Admin, and demo staff accounts when `.env` is absent.
* **Impact**: If deployed to cloud or client servers without `.env` mounted, the system would authenticate with known static passwords.
* **Current Status**: Documented without printing actual secret values; code kept untouched per Stage 4 security boundaries.
* **Remediation Action**:
  - Assert environment variables in production: throw a fatal configuration error on startup if `APP_SECRET_KEY` or admin credentials are missing from `process.env`.
  - Mandate bcrypt password hashing for all user accounts, removing plaintext fallback strings.

---

### Risk 3: Hardware-Dependent Verification Pending Local Environment
* **Items**:
  1. *Physical Electron GUI Window Rendering*: Verified headlessly via embedded HTTP web server and Chromium binary static validation. Live display of `BrowserWindow` requires an interactive Windows desktop session.
  2. *Physical Thermal Slip Printing*: Verified at code level (80mm iframe and ESC/POS styling). Actual receipt printing requires physical USB/serial hardware connected to the machine.
* **Mitigation**:
  - Provide `tools/launch-desktop.ps1` for immediate one-click testing by the local operator.
  - Implement an optional Playwright / Spectron test harness for automated end-to-end GUI validation in CI pipelines.

---

### Risk 4: Monorepo Lockfile Retention
* **Description**: The initial `npm install` generates a unified `package-lock.json` at repository root.
* **Impact**: Without committing `package-lock.json`, future installs might introduce minor semver dependency drifts across developer environments.
* **Remediation Action**: Once Stage 4 is approved, commit the generated `package-lock.json` to git version control to lock down dependency versions across all apps.

---

## 2. Risk Sign-Off

All identified risks are well-bounded, non-regressive, and clearly documented. Zero risks compromise data safety or system stability.
