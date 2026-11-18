# UPDATED PROJECT STRUCTURE: ROYAL CINEMA ERP

**Author:** Senior Enterprise Architecture Team  
**Date:** November 17, 2026  
**Status:** Post-Stage 1 & Stage 2 Milestone  
**Scope:** Current physical state of the repository following root tools archival and SaaS modularization.

---

## 1. Workspace Directory Tree (Post-Stage 2)

```
c:\Users\boxoffice2\Downloads\Royal-Cinema-ERP-Setup-0.3.0\
│
├── [Desktop Binaries & Graphics Runtimes - UNTOUCHED]
│   ├── Royal Cinema ERP.exe          # Main Windows Executable (249MB)
│   ├── d3dcompiler_47.dll            # Direct3D HLSL Compiler
│   ├── dxcompiler.dll                # DirectX Shader Compiler
│   ├── electron_wer.dll              # Windows Error Reporting
│   ├── ffmpeg.dll                    # Audio/Video Codec
│   ├── icudtl.dat                    # Unicode Library Data
│   ├── resources.pak                 # Base Chromium Resource Bundle
│   ├── chrome_100_percent.pak        # 1x UI Assets
│   ├── chrome_200_percent.pak        # 2x UI Assets
│   ├── snapshot_blob.bin             # V8 Initial Heap Snapshot
│   ├── v8_context_snapshot.bin       # V8 Context Snapshot
│   ├── vk_swiftshader.dll            # Vulkan Software Fallback
│   ├── vk_swiftshader_icd.json       # Vulkan Driver Configuration
│   ├── vulkan-1.dll                  # Vulkan Loader
│   ├── LICENSE.electron.txt          # Electron License
│   ├── LICENSES.chromium.html        # Chromium Licenses
│   └── locales/                      # 55 Localized Language Resource Packs
│
├── resources/                        # [Desktop Application Bundle - UNTOUCHED]
│   ├── app.asar                      # Production Compiled ASAR Archive (1.43MB)
│   ├── elevate.exe                   # Windows UAC Elevation Helper
│   └── app/                          # Unpacked Desktop Source Directory
│       ├── main.cjs                  # Electron Main Process
│       ├── preload.cjs               # Secure ContextBridge IPC Bridge
│       ├── index.html                # Desktop Master Shell & Unified Login UI
│       ├── server.cjs                # Embedded Node HTTP Server (Port 3000)
│       ├── cinema-hall.jpg           # Auditorium Background Graphic Asset
│       ├── cinema-login-hero.jpg     # Secondary Graphic Asset
│       ├── package.json              # Desktop Metadata (v0.3.0)
│       ├── .env                      # Local Super Admin Credentials
│       ├── workspaces/               # 4 Mission-Critical Operational Workspaces
│       │   ├── city_lite_cinema_erp_multi_counter_role_login.html (POS)
│       │   ├── city_lite_f_b_counter_pos_role_login.html (F&B)
│       │   ├── city_lite_cinema_erp_command_center_role_login.html (Ledger)
│       │   └── customer-ticket-booking.html (Kiosk)
│       ├── backend/                  # Embedded Node Microservice & JSON DB
│       │   ├── config/ (env.js, paths.js)
│       │   ├── database/ (db.js, seed.js)
│       │   ├── routes/ (apiRouter.js)
│       │   └── services/ (auth, branch, company, sync, support, sales, etc.)
│       └── [HTML Prototypes - PRESERVED]
│           ├── saas-website.html
│           ├── client-portal.html
│           ├── super-admin-portal.html
│           ├── subscription-plans.html
│           └── checkout.html
│
├── enterprise-production/            # [Cloud SaaS Monorepo - MODULARIZED IN STAGE 2]
│   ├── apps/
│   │   ├── public-website/           # Dedicated Next.js 14 App (Port 3001)
│   │   ├── client-portal/            # Dedicated Next.js 14 App (Port 3002)
│   │   ├── super-admin/              # Dedicated Next.js 14 App (Port 3003)
│   │   └── backend-api/              # Dedicated NestJS 10 REST API (Port 4000)
│   │
│   ├── packages/
│   │   ├── shared-types/             # Universal TypeScript Types & Sync Contracts
│   │   ├── shared-ui/                # Rich Orange Design Preset & React Primitives
│   │   ├── api-client/               # Typed Axios Client with Automatic Tenant Headers
│   │   └── validation/               # DTO Validation Schemas
│   │
│   ├── infrastructure/
│   │   ├── docker/                   # docker-compose.yml
│   │   └── terraform/                # AWS Cloud Infrastructure as Code (ECS, ALB, VPC)
│   │
│   ├── ARCHITECTURE.md               # 21-Section SaaS Blueprint
│   ├── DESIGN_SYSTEM.md              # Rich Orange Brand Guidelines
│   └── README.md                     # Platform Overview
│
├── tools/                            # [Archived Automation & Utilities - STAGE 1]
│   └── migration/                    # 17 Relocated Root Scripts + Inventory README
│
├── .gitignore                        # Git Ignore Rules
├── ARCHITECTURE_AUDIT.md             # Complete System Architecture Report
├── CURRENT_PROJECT_STRUCTURE.md      # Baseline Pre-Restructuring Structure
├── DUPLICATE_FILES_REPORT.md         # Duplication & Overlap Analysis
├── DEPENDENCY_MAP.md                 # Dependencies & Cross-Layer Communications
├── RESTRUCTURING_PLAN.md             # Phased Reorganization Plan
├── RESTRUCTURING_VALIDATION.md       # Technical Validation & Feasibility Report
├── PRE_MIGRATION_SAFETY_REPORT.md    # Pre-Migration Safety & Hash Verification
├── STAGE_1_EXECUTION_REPORT.md       # Stage 1 Milestone Report
├── STAGE_2_EXECUTION_REPORT.md       # Stage 2 Milestone Report
├── UPDATED_PROJECT_STRUCTURE.md      # This Document
├── BUILD_AND_TEST_RESULTS.md         # Test Execution Log
└── REMAINING_RISKS.md                # Stage 3 Pre-Flight Risk Matrix
```

---

## 2. Key Structural Improvements Achieved

1. **Root Cleanliness**: All 17 loose scripts have been moved into `tools/migration/`. The repository root now contains only the compiled Windows binary files, the essential subdirectories (`resources/`, `enterprise-production/`, `tools/`), and documentation files.
2. **True SaaS Modularization**: `enterprise-production/` is no longer a monolithic blend of routes. It is organized into 4 distinct applications (`public-website`, `client-portal`, `super-admin`, `backend-api`) and 4 shared packages (`shared-types`, `shared-ui`, `api-client`, `validation`).
3. **Zero Impact on Desktop**: The original desktop application files in root and `resources/` remain in their exact original locations, preserving all runtime dynamic links.
