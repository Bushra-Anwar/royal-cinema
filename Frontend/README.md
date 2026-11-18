# Royal Cinema ERP — Frontend Portals & Workspaces

This folder contains all user-facing client portals, dashboards, customer booking interfaces, and static assets for Royal Cinema ERP.

## Structure
- `index.html`: Unified ERP login and multi-role workstation shell (Super Admin, Manager, Counter POS, Food Staff).
- `saas-website.html`: Public marketing website and subscription showcase.
- `checkout.html`: Enterprise subscription registration and payment checkout.
- `client-portal.html`: Cinema owner client license and billing management portal.
- `super-admin-portal.html`: Global platform management console.
- `workspaces/`:
  - `customer-ticket-booking.html`: Online movie ticket booking interface.
  - `city_lite_cinema_erp_command_center_role_login.html`: Branch Manager workstation.
  - `city_lite_cinema_erp_multi_counter_role_login.html`: Box office counter POS.
  - `city_lite_f_b_counter_pos_role_login.html`: Food & Beverage concessions POS.
- Assets:
  - `royal-cinema-logo.svg`: Official Royal Gold brand emblem.
  - `favicon.svg`: Official website favicon.
  - `lucide.min.js`: High-performance icon library.
  - `robots.txt` & `sitemap.xml`: Search engine index files for https://royalcinema.in.

## Connection with Backend
All frontend pages make relative calls to the backend via `/api/*` endpoints (e.g., `/api/auth/login`, `/api/auth/oauth/config`, `/api/bookings`).
When served via `node Backend/server.cjs`, all API endpoints and frontend pages run on the same origin without CORS issues.
