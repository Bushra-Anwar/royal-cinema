# DUPLICATE FILES AND CODE OVERLAP REPORT: ROYAL CINEMA ERP

**Author:** Enterprise Architecture Team  
**Date:** November 17, 2026  
**Status:** Phase 1 Complete – Pre-Restructuring Audit  
**Scope:** Identification of duplicate components, redundant implementations, conflicting routes, and overlapping services across the repository.

---

## 1. Executive Summary of Duplication

Over multiple development iterations, new SaaS capabilities were built both as **standalone HTML/JS prototypes** inside `resources/app/` (for immediate local demonstration) and as **modular Next.js / NestJS applications** inside `enterprise-production/`.

As a result, significant functional duplication exists across:
1. **Frontend User Interfaces**: Static standalone HTML prototypes vs. Next.js 14 TypeScript pages.
2. **Backend Logic & APIs**: Embedded Node.js CommonJS microservices vs. NestJS 10 TypeScript modules.
3. **Database Schemas**: Embedded JSON flat-file storage vs. Mongoose MongoDB Atlas models.
4. **Shared Types & Contracts**: Inline JavaScript objects vs. TypeScript contracts.
5. **Root Automation Scripts**: 17 loose migration scripts in the root directory.

---

## 2. Category 1: Frontend Duplication (HTML Prototypes vs. Next.js Pages)

The table below outlines the direct functional duplicates between the standalone HTML files in `resources/app/` and the Next.js pages in `enterprise-production/frontend-nextjs/src/app/`:

| Standalone HTML Prototype (`resources/app/`) | Next.js Target Application (`enterprise-production/frontend-nextjs/src/app/`) | Overlap Details & Differences |
|---|---|---|
| `saas-website.html` (84.6 KB) | `src/app/(marketing)/` (Home, Features, Pricing, About, Solutions, Contact) | **100% Functional Overlap**. `saas-website.html` is a monolithic single-page prototype with inline CSS. The Next.js pages provide identical content with componentized React, Tailwind CSS, and SEO metadata. |
| `client-portal.html` (41.3 KB) | `src/app/portal/` (Overview, Branches, Subscriptions, Billing, Downloads, Licenses, Support) | **100% Functional Overlap**. `client-portal.html` uses vanilla DOM manipulation and mock arrays. Next.js provides authenticated route guards, dynamic API data fetching, and typed branch management. |
| `super-admin-portal.html` (49.4 KB) | `src/app/admin/` (Dashboard, Organizations, Branches, Payments, Invoices, Demos, Support, Releases, Settings) | **100% Functional Overlap**. `super-admin-portal.html` simulates cloud tenant management in HTML. Next.js implements real-time tenant stats, billing ledger views, and role-based permissions. |
| `subscription-plans.html` (24.8 KB) | `src/app/(marketing)/pricing/page.tsx` | **100% Functional Overlap**. Both display Starter (1-Screen), Twin Multiplex (2-Screen), and Multiplex Pro (4-Screen) pricing tables. |
| `checkout.html` (23.0 KB) | `src/app/(auth)/checkout/page.tsx` | **100% Functional Overlap**. Both simulate Razorpay / UPI payment confirmation and license key issuance. |
| `index.html` (Auth Card section) | `src/app/(auth)/login/page.tsx` | **Visual Overlap**. Both feature the cinema auditorium background, gold reel logo, and switcher pills. However, `index.html` also serves as the Electron desktop application shell. |

---

## 3. Category 2: Backend & Service Duplication

The desktop embedded microservice and the enterprise cloud backend implement parallel domain logic:

| Embedded Node.js Service (`resources/app/backend/services/`) | Enterprise NestJS Module (`enterprise-production/backend-nestjs/src/modules/`) | Duplication Analysis & Architectural Role |
|---|---|---|
| `authService.js` | `modules/auth/auth.service.ts` | **Parallel Logic**: `authService.js` validates local PBKDF2 hashed passwords against local JSON files for offline desktop counters. NestJS `AuthService` handles cloud JWT issuance, refresh tokens, and multi-tenant authentication. |
| `branchService.js` | `modules/branches/branches.service.ts` | **Parallel Logic**: Both handle branch creation, branch switching, and counter terminal assignment. Desktop writes to `branches.json`; NestJS writes to MongoDB `Branch` collection. |
| `companyService.js` | `modules/organizations/organizations.service.ts` | **Parallel Logic**: Desktop manages local cinema company profile and 1-click renewal. NestJS manages cloud multi-tenant organizations with billing profiles. |
| `subscriptionService.js` | `modules/subscriptions/subscriptions.service.ts` | **Parallel Logic**: Both track plan validity, expiry dates, and billing cycles. Desktop stores flat records; NestJS supports prorated plan upgrades and automated invoicing. |
| `syncService.js` | `modules/sync/sync.service.ts` | **Interoperable Overlap**: `syncService.js` (desktop) acquires local seat leases and records offline journals. NestJS `SyncService` is the cloud counterpart that reconciles these journals. They share the `sync.contract.ts` contract. |
| `supportService.js` & `supportRbacService.js` | `modules/support/support.service.ts` | **Parallel Logic**: Desktop logs support tickets to local JSON; NestJS integrates tickets with WebSocket live chat, phone callbacks, and email queues. |
| `notificationService.js` | `modules/notifications/notifications.service.ts` | **Parallel Logic**: Desktop generates in-memory UI toasts; NestJS triggers transactional emails via AWS SES and SMS/WhatsApp via Twilio/Meta Business API. |

---

## 4. Category 3: Database & Persistence Layer Duality

Two distinct database persistence paradigms exist in the repository:

1. **Desktop Embedded JSON Database (`resources/app/backend/database/db.js`)**:
   - Location: `%APPDATA%/RoyalCinemaERP/*.json`.
   - Purpose: Zero-latency, 100% offline-capable counter POS operations. Cashiers can sell tickets even when the cinema's internet connection fails.
   - Files: `companies.json`, `users.json`, `tickets.json`, `sales.json`, `branches.json`, `support_tickets.json`, `sync_journal.json`.
2. **Cloud SaaS MongoDB Schemas (`enterprise-production/backend-nestjs/src/modules/*/schemas/`)**:
   - Location: Cloud-hosted MongoDB Atlas cluster.
   - Purpose: Centralized multi-tenant data store, cross-branch reporting, payment processing, and super admin visibility.
   - Schemas: `Organization`, `Branch`, `User`, `Subscription`, `Invoice`, `License`, `SupportTicket`, `AuditLog`.

> **Architectural Resolution**: This is **intentional functional duality**, NOT redundant dead code. The desktop counter app must retain its local database engine to survive internet outages, while the cloud platform requires MongoDB for multi-tenancy.

---

## 5. Category 4: Root Directory Automation Scripts

Seventeen utility scripts currently reside in the workspace root. These were used to scaffold and patch files during earlier development phases:

1. `add_api_routes.cjs` (Scaffolding script)
2. `add_sync_routes.cjs` (Scaffolding script)
3. `append_sections_15_20.cjs` (Doc script)
4. `append_section_21.cjs` (Doc script)
5. `build_pixel_perfect_login.cjs` (UI generator)
6. `crop_bg.ps1` (PowerShell image utility)
7. `integrate_branch_support.cjs` (Scaffolding script)
8. `patch_handlers.cjs` (DOM patch script)
9. `scaffold_nestjs_modules.cjs` (NestJS generator)
10. `seed_multi_clients.cjs` (Seed script)
11. `setup_target_structure.cjs` (Scaffolding script)
12. `test_multi_client_sync.cjs` (Integration test)
13. `update_app_module.cjs` (Module patcher)
14. `update_architecture_md.cjs` (Doc generator)
15. `update_index_clean.cjs` (Cleanup script)
16. `update_index_ui.cjs` (Diagnostic script)
17. `update_super_admin.cjs` (HTML patcher)

---

## 6. Proposed Duplication Remediation Strategy

During the restructuring phase (after audit approval):

1. **Isolate Desktop Prototypes**: Retain `saas-website.html`, `client-portal.html`, and `super-admin-portal.html` inside `legacy-desktop/electron-app/resources/app/` as static offline fallbacks, but designate `enterprise-production/apps/` as the single authoritative source of truth for the SaaS web applications.
2. **Archive Root Scripts**: Relocate all 17 root `.cjs` and `.ps1` migration scripts into a dedicated `scripts/archive/` or `tools/migration/` directory to declutter the repository root.
3. **Preserve Operational Workspaces**: Keep all four operational HTML workspaces (`city_lite_cinema_erp_multi_counter_role_login.html`, etc.) strictly intact in their desktop directory.
4. **Preserve Embedded Node Microservice**: Maintain `backend/services/` for the desktop application to guarantee offline counter execution.
