# Royal Cinema ERP — Stage 3 Remaining Risks & Technical Debt

**Generated**: November 17, 2026  
**Scope**: Stage 3 Staging and Relocation Validation  
**Baseline Commit**: `482d358bddd2b5392fba555436b4782810d1b6b5`  

---

## 1. Identified Risks & Recommended Mitigations

### Risk 1: Dual-Installation Concurrent Execution Conflict
* **Description**: Both the original desktop application in repository root and the staged copy in `legacy-desktop/electron-app/` are fully functional and point to the same user data directory (`%APPDATA%/royal-cinema-erp-desktop/royal-erp-data/`).
* **Impact**: If both instances are launched simultaneously by a user or automated task, concurrent writes to `companies.json`, `users.json`, or `bookings.json` could lead to dirty reads or overwritten transactions.
* **Mitigation**: 
  - Strictly enforce running only one instance at a time.
  - Do not launch the staged `Royal Cinema ERP.exe` while the root background server daemon is active on Port 3000.
  - In Stage 4, upon final validation and authorization, remove the root duplicate files to eliminate ambiguity.

---

### Risk 2: Default HTTP Port 3000 Collisions
* **Description**: Both instances default to `PORT = 3000` via `env.js` and `server.cjs`.
* **Impact**: Attempting to start both servers concurrently results in `EADDRINUSE: address already in use :::3000`.
* **Mitigation**:
  - The runtime architecture dynamically checks `process.env.PORT`.
  - For parallel testing or dual-instance scenarios, set `PORT=3010` (or another free port) in the execution environment.

---

### Risk 3: Pre-Existing Missing Import in `companyService.js` (Non-Regressive Technical Debt)
* **Description**: In `resources/app/backend/services/companyService.js` (line 132), the function `checkCompanySubscription(identifier)` calls `getUsers()`, but `getUsers` was omitted from the `require('../database/db')` import at line 2.
* **Impact**: Invoking the specific subscription lookup endpoint for non-cached client usernames throws a `ReferenceError: getUsers is not defined`.
* **Current Action**: Left 100% untouched in both root and staged copies in accordance with Stage 3 safety directives ("Do not modify existing application logic or UI").
* **Recommended Next Step**: In a dedicated bugfix patch following Stage 4 completion, update line 2 of `companyService.js` to `const { getCompanies, saveCompanies, getUsers } = require('../database/db');`.

---

### Risk 4: Desktop Shortcuts & Shell Launchers Pointing to Root Executable
* **Description**: Any existing Windows desktop shortcuts, pinned taskbar icons, or startup items currently target `Royal Cinema ERP.exe` in the root download directory.
* **Impact**: If root files are moved or deleted without updating shortcuts, shortcuts will break with "Target not found".
* **Mitigation**:
  - Keep root desktop files intact throughout Stage 3.
  - In Stage 4, document all shortcut targets and provide an automated PowerShell update script to repoint shortcuts to `legacy-desktop/electron-app/Royal Cinema ERP.exe`.

---

### Risk 5: Synchronization Between `resources/app/` Source and `resources/app.asar`
* **Description**: `resources/` contains both the unbundled source directory (`app/`) and the packaged archive (`app.asar`).
* **Impact**: In production mode, Electron defaults to mounting `app.asar`. If developers make edits inside `resources/app/` without rebuilding `app.asar`, changes will not appear when launching the packaged executable.
* **Mitigation**:
  - Maintain `resources/app/` as the single authoritative source of truth during development.
  - Implement an automated `npm run package:asar` script in the build pipeline to generate `app.asar` from `resources/app/`.

---

## 2. Risk Sign-Off

All remaining risks have clear boundaries and well-defined mitigation paths. None of these risks block authorization or jeopardize data safety, provided the root application remains preserved as per Stage 3 protocols.
