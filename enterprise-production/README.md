# 🎬 Royal Cinema ERP — Enterprise Production Stack

An enterprise-grade, multi-tenant cloud SaaS and multi-station Box Office & Concessions POS platform built using **NestJS**, **Next.js**, **MongoDB Atlas**, **AWS Cognito**, **Terraform**, and **Docker**.

---

## 🏗️ Architecture & Component Mapping

| Layer / Component | Technology Selected | Implementation Path |
|---|---|---|
| **Frontend Web** | Next.js 14/15 + React + TypeScript | `frontend-nextjs/` |
| **UI Styling** | Tailwind CSS (Warm Cinema Palette) | `frontend-nextjs/tailwind.config.ts` |
| **Backend REST API** | NestJS 10 + TypeScript | `backend-nestjs/` |
| **API Documentation** | REST + OpenAPI / Swagger | `backend-nestjs/src/main.ts` (`/api/docs`) |
| **Database & ODM** | MongoDB Atlas + Mongoose | `backend-nestjs/src/modules/*/schemas/` |
| **Authentication** | AWS Cognito User Pools + JWT | `backend-nestjs/src/common/guards/cognito-auth.guard.ts` |
| **Authorization** | RBAC (`SUPER_ADMIN`, `CINEMA_ADMIN`, `TICKET_STAFF`, `FOOD_STAFF`) + Multi-Tenant Isolation | `backend-nestjs/src/common/guards/roles.guard.ts` |
| **Cloud Storage** | AWS S3 (Bucket: `royal-cinema-assets`) | `terraform/main.tf` |
| **CDN** | AWS CloudFront | `terraform/main.tf` |
| **Hosting & Compute** | AWS ECS Fargate + Application Load Balancer (ALB) | `terraform/main.tf` |
| **Caching** | Redis / AWS ElastiCache | `docker-compose.yml` (`redis:7.2`) |
| **Asynchronous Jobs** | AWS SQS Queue (`royal-cinema-jobs`) | `terraform/main.tf` |
| **Notifications** | Amazon SES (Transactional Ticket Emails) | `.env.example` |
| **Infrastructure as Code** | Terraform (`>= 1.5.0`) | `terraform/` |
| **CI/CD Pipeline** | GitHub Actions + Amazon ECR + ECS Deploy | `.github/workflows/ci-cd.yml` |
| **Payment Gateway** | Razorpay (India) & Stripe (Global) | `backend-nestjs/src/modules/payments/` |

---

## 📁 Repository Directory Structure

```
enterprise-production/
├── .env.example                       # Production cloud secrets & keys template
├── docker-compose.yml                 # Local dev orchestration (MongoDB, Redis, API, Web)
├── README.md                          # Architecture & run guide
│
├── backend-nestjs/                    # NestJS 10 + TypeScript Backend Microservice
│   ├── Dockerfile                     # Multi-stage production container build
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts                    # Bootstrap with OpenAPI Swagger at /api/docs
│       ├── app.module.ts              # Root module (MongoDB connection pooling & Throttler)
│       ├── common/
│       │   ├── enums/role.enum.ts     # UserRole enum definition
│       │   ├── decorators/            # @Roles(), @CurrentUser(), @CurrentTenant()
│       │   └── guards/                # CognitoAuthGuard, RolesGuard, TenantGuard
│       └── modules/
│           ├── auth/                  # Unified Authentication & JWT signing
│           ├── tenants/               # Super Admin Multi-Cinema Onboarding & Ledger
│           ├── users/                 # RBAC Staff Users (Ticket & Food Counters)
│           ├── bookings/              # Box Office Admissions, GST & Thermal Slips
│           ├── concessions/           # Food POS, live stock deduction & 5% GST
│           └── payments/              # Razorpay order generation & webhook verification
│
├── frontend-nextjs/                   # Next.js App Router Frontend
│   ├── package.json
│   ├── tailwind.config.ts             # Tailwind CSS tokens
│   └── src/
│       ├── lib/api-client.ts          # Axios client with automated JWT bearer attachment
│       └── app/
│           ├── layout.tsx             # Root Layout
│           └── page.tsx               # Unified multi-role login with automatic routing
│
├── terraform/                         # Infrastructure as Code
│   ├── main.tf                        # AWS ECS, ALB, S3, CloudFront, Cognito, SQS
│   ├── variables.tf
│   └── outputs.tf
│
└── .github/
    └── workflows/
        └── ci-cd.yml                  # GitHub Actions pipeline -> Amazon ECR -> AWS ECS
```

---

## 🚀 Quick Start (Local Development)

### 1. Launch with Docker Compose
```bash
cd enterprise-production
docker-compose up -d
```
- **NestJS API**: `http://localhost:4000/api/v1`
- **Swagger / OpenAPI Documentation**: `http://localhost:4000/api/docs`
- **Next.js Web Application**: `http://localhost:3001`
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`

### 2. Manual Development Mode
```bash
# Backend
cd enterprise-production/backend-nestjs
npm install
npm run start:dev

# Frontend
cd ../frontend-nextjs
npm install
npm run dev
```

---

## 🔒 Security & Multi-Tenancy Architecture
1. **Multi-Tenant Isolation**: Every database query is strictly filtered by `tenantId`. A cinema client can never access another client's revenue or ticketing records.
2. **Cognito Token Verification**: JWT tokens issued by AWS Cognito are cryptographically validated on every API call.
3. **Data Encryption**: Passwords are saved with salted bcrypt hashes. Sensitive API keys are managed through AWS Secrets Manager.
