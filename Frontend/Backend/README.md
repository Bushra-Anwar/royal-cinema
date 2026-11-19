# Royal Cinema ERP — Backend Services & API

This folder contains the complete server-side architecture, REST APIs, OAuth authentication services, and datastore management for Royal Cinema ERP.

## Structure
- `server.cjs`: Main HTTP server that powers both REST API routing and static frontend delivery.
- `.env`: Production & development environment variables.
- `backend/`:
  - `config/`: Path management, environment loader, and database configuration.
  - `database/`: JSON Atomic File Datastore, repositories, and initial seed data.
  - `routes/`: REST API endpoints for Auth, Booking, Movies, Orders, Support Tickets, etc.
  - `services/`: OAuth 2.0 (Google & Microsoft), thermal printer integration, audit logging, and auth controllers.

## Running Backend
```bash
# From workspace root
node Backend/server.cjs

# Or inside Backend folder
npm start
```

The server listens on port **3000** (or the port defined in `.env`) and automatically serves all frontend client pages from `../Frontend`.
