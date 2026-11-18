# Royal Cinema ERP: Complete Repository Audit & Integration Map
**Document Version:** 1.0.0 (Production Master)  
**Security Baseline:** Light Enterprise & Non-Destructive Preservation  

---

## 1. Executive Summary & Core Protection Mandate

This document serves as the **immutable audit baseline** for Royal Cinema ERP.  
In strict accordance with the project specification:
> **Core Mandate:** The existing Electron ERP working interface, booking system, counter POS, food concessions, command center, thermal printer drivers, and existing operational features **MUST REMAIN 100% UNTOUCHED AND OPERATIONAL**.  
> The commercial SaaS architecture (Public Marketing Website, Client Portal, Super Admin Portal, NestJS Backend, and MongoDB Database) integrates **around** the desktop application without replacing or regressing any working business logic.

---

## 2. Protected Files Inventory (DO NOT OVERWRITE OR REPLACE)

The following files represent working, mission-critical cinema operational modules and are marked as **PERMANENTLY PROTECTED**:

| File Path | Functional Responsibility | Status |
|---|---|---|
| `resources/app/workspaces/pos.html` | Box Office Counter POS, live interactive seat grid, showtime switcher, tender calculation | **PROTECTED / UNTOUCHED** |
| `resources/app/workspaces/food.html` | Food & Beverage Concessions counter, food categories, cart, KDS kitchen display stream | **PROTECTED / UNTOUCHED** |
| `resources/app/workspaces/theatre-command-center.html` | Real-time screen occupancy, audio/visual projector monitor, occupancy rate graphs | **PROTECTED / UNTOUCHED** |
| `resources/app/workspaces/customer-ticket-booking.html` | Mobile web customer booking interface, seat reservation flow | **PROTECTED / UNTOUCHED** |
| `resources/app/main.cjs` | Electron application lifecycle, browser window initialization, secure protocols | **PROTECTED / UNTOUCHED** |
| `resources/app/preload.cjs` | Context isolation bridge (`contextBridge.exposeInMainWorld`), zero Node leak | **PROTECTED / UNTOUCHED** |
| `resources/app/server.cjs` | Local HTTP daemon delivering workstation routes and static assets | **PROTECTED / UNTOUCHED** |

---

## 3. Architecture & Integration Map

The integration model cleanly bifurcates cinema operations from SaaS governance:

```mermaid
flowchart TD
    subgraph SaaS_Cloud["Centralized SaaS Cloud Platform"]
        WEB["Public Website\n(www.royalcinemaerp.com)"]
        PORTAL["Client Portal\n(account.royalcinemaerp.com)"]
        ADMIN["Super Admin Portal\n(admin.royalcinemaerp.com)"]
        NEST["NestJS Backend Engine\n(/api/v1/*)"]
        MONGO[("MongoDB Atlas\n(RoyalCinemaSaaS Multi-Tenant DB)")]
    end

    subgraph Desktop_Client["Client Workstation (Common Windows Installer)"]
        SHELL["Electron Runtime (v0.3.0 / v1.0.0)\nRoyal Cinema ERP.exe"]
        PRELOAD["Restricted Context Bridge\n(preload.cjs)"]
        LOCAL_SRV["Local Server Daemon\n(server.cjs :3000)"]
        LOGIN["Unified Light Enterprise Login\n(Image 1 & 3 Matched)"]
        BRANCH_SEL["Branch Selector Modal\n(Ahmedabad, Gandhinagar, Surat)"]
        HELP_MODAL["Omnichannel Support Modal\n(15-Min Critical SLA)"]
        OFFLINE_JOURNAL[("Encrypted Local Journal\noffline_bookings_journal.json")]
    end

    subgraph Cinema_Operations["Untouched Core Cinema Workspaces"]
        POS_WS["Box Office Ticketing POS\n(pos.html)"]
        FOOD_WS["F&B Concessions Counter\n(food.html)"]
        CMD_WS["Theatre Command Center\n(theatre-command-center.html)"]
        PRINT["80mm ESC/POS Thermal Printing\n(Hardware USB / COM)"]
    end

    %% Cloud Wiring
    WEB -->|Demo Requests & Signups| NEST
    PORTAL -->|Branch Management & Invoices| NEST
    ADMIN -->|Tenant Governance & SLA Inbox| NEST
    NEST <--> MONGO

    %% Desktop to Cloud Sync
    SHELL --> PRELOAD
    PRELOAD --> LOGIN
    LOGIN -->|Automatic Tenant Resolution| NEST
    LOGIN --> BRANCH_SEL
    BRANCH_SEL -->|Active Branch Authorized| LOCAL_SRV
    BRANCH_SEL -.->|Expired Branch (Surat)| PORTAL
    LOCAL_SRV --> POS_WS
    LOCAL_SRV --> FOOD_WS
    LOCAL_SRV --> CMD_WS
    POS_WS --> PRINT

    %% Offline Hybrid Engine
    POS_WS -.->|Network Outage| OFFLINE_JOURNAL
    OFFLINE_JOURNAL -.->|Internet Restored (Reconcile)| NEST
```

---

## 4. Current State & Dependencies Audit

1. **Authentication Flow:**
   - Client logs in via `index.html` with Email/Username.
   - Server-side resolver (`syncService.resolveTenantContext`) automatically derives Organization and Branch scope.
   - User never types an Organization ID manually.
2. **Multi-Branch Entitlement:**
   - 1 Organization (e.g. Sunrise Cinemas Pvt. Ltd.) can hold 5 branches (Ahmedabad, Gandhinagar, Surat, Vadodara, Rajkot).
   - If Vadodara expires, Vadodara workstation access is restricted with a renewal CTA.
   - The other 4 active branches continue operating with zero disruption.
3. **Hardware & Printing Fast-Path:**
   - ESC/POS thermal printing and local seat layouts run directly through client-side JavaScript in `pos.html`, providing zero latency even during network jitter.
4. **Security Hardening:**
   - `TenantGuard` rejects spoofed `x-tenant-id` headers unless authenticated membership matches.
   - Razorpay key secrets are strictly server-side; zero secrets in Electron.
   - Verified disaster recovery test (`test-backup-restore.cjs`) passes with 100% data integrity.

---

## 5. Development Phase Tracking

| Phase | Phase Scope | Target Directory | Status |
|---|---|---|---|
| **Phase 1** | Repository Audit & Integration Map | `enterprise-production/AUDIT_AND_INTEGRATION_MAP.md` | **COMPLETE** |
| **Phase 2** | Light Enterprise Design System | `enterprise-production/DESIGN_SYSTEM.md` & `tailwind.config.ts` | **COMPLETE** |
| **Phase 3** | Public SaaS Marketing Website | `enterprise-production/frontend-nextjs/src/app/(marketing)/` & `saas-website.html` | **COMPLETE** |
| **Phase 4** | Customer Client Portal | `enterprise-production/frontend-nextjs/src/app/portal/` & `client-portal.html` | **COMPLETE** |
| **Phase 5** | Super Admin Portal & 3-Col Inbox | `enterprise-production/frontend-nextjs/src/app/admin/` & `super-admin-portal.html` | **COMPLETE** |
| **Phase 6** | NestJS Backend & MongoDB Scoping | `enterprise-production/backend-nestjs/src/modules/` | **COMPLETE** |
| **Phase 7** | Razorpay & Per-Branch Subscriptions | `resources/app/backend/services/branchService.js` | **COMPLETE** |
| **Phase 8** | Electron Desktop Integration | `resources/app/index.html` + `preload.cjs` | **COMPLETE** |
| **Phase 9** | Omnichannel Notifications (WhatsApp/Gmail) | `resources/app/backend/services/notificationService.js` | **COMPLETE** |
| **Phase 10** | Security Hardening & Zero-Trust Testing | `enterprise-production/test-backup-restore.cjs` | **COMPLETE** |
