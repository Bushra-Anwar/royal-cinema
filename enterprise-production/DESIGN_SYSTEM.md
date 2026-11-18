# Royal Cinema ERP: Final Design System Specification
**Brand Identity:** *Rich Orange & Warm Cream (Original Signature Identity)*  
**Visual Style:** Premium Commercial Cinema SaaS • **Zero Navy Blue**  
**Core Motto:** *Cinema operations, simplified.*

---

## 1. Final Official Color Palette

The brand retains its authentic, high-energy cinema signature orange, refined into a richer, luxurious commercial presentation:

| Token Name | Hex Code | Visual Tone | Application Scope |
|---|---|---|---|
| **Rich Orange** | `#F97316` | Vibrant Energy | Primary accents, interactive states, topbar glows |
| **Deep Orange** | `#EA580C` | Grounded Authority | Primary buttons, brand logo anchor, active tabs |
| **Burnt Orange** | `#C2410C` | Deep Contrast | Button hover states, links, emphasis badges |
| **Warm Cream** | `#FFF7ED` | Elegant Canvas | Global app background, inputs backdrop, light sidebars |
| **White** | `#FFFFFF` | Crisp Cleanliness | Cards, modal panels, table surfaces |
| **Dark Brown** | `#24170F` | High-Contrast Ink | Primary typography, bold headings, iconography |

*Navy blue is strictly prohibited and eliminated across all SaaS pages and components.*

---

## 2. Login Page Architecture (Section Specification)

The login screen incorporates a responsive split-view layout optimized across mobile, tablet, laptop, and desktop:

### Left Panel (Brand & Modules):
- **Logo & Wordmark:** Glowing white rounded square with Deep Orange **`R`**, eyebrow `CLOUD SERVICES`, bold `ROYAL CINEMA ERP`.
- **Tagline:** *"Everything your cinema needs. Manage ticketing, counter sales, food orders and cinema operations from one platform."*
- **4 Core Feature Cards:**
  1. `🎟️` **Ticket Booking**
  2. `💳` **Counter POS**
  3. `🍿` **Food & Beverage**
  4. `📊` **Reports & Analytics**
- **Footer:** *"Built for modern cinema businesses • Trusted by Cinema Businesses Across India"*

### Right Panel (Unified Authentication):
- **Header:** `ROYAL CINEMA ERP` • `Book a Demo ↗`
- **Mode Switcher Tabs:**
  - `Sign In` (Active orange gradient)
  - `Client & Subscription`
- **Fields:**
  - `Email address or Username` (Warm cream backdrop `#fffaf5`, focus `#F97316`)
  - `Password` (with Show/Hide eye button)
  - Options: `[x] Remember me` & `Forgot Password?`
- **Submit Action:** `Sign In Securely →` (Gradient from `#F97316` to `#EA580C` to `#C2410C`, rich orange shadow)
- **SSO Options:** `Continue with Google` / `Continue with Microsoft`
- **Security & Support:** `🔒 Secure authentication and role-based access` • `Need Help? Contact Support`

---

## 3. Strict Non-Destructive Protection Guarantee

- **Untouched Desktop POS & ERP:** The working Electron ERP interface in `resources/app` (`pos.html`, `food.html`, `theatre-command-center.html`, `customer-ticket-booking.html`, thermal ESC/POS drivers) **remains 100% intact and untouched**.
- **SaaS Layer:** The Next.js + NestJS commercial platform interfaces cleanly bridge around the desktop app using dynamic multi-tenant context resolution.
