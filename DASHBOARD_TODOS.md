# HomePal Admin Dashboard — TODOs & Action Plan

Derived from `AUDIT.md` (Date: 2026-08-10). Ground truth tasks based on backend OpenAPI endpoints vs existing dashboard code.

---

## 1. Auth & Critical Fixes

- [x] **Fix Mock Token Fallback Bug in `useAuth.ts`**
  - **File:** `src/hooks/useAuth.ts`
  - **Issue:** `onSuccess` fell back to `'mock_token_123'` and a hardcoded fake admin user (`{ id: '1', email: 'admin@homepal.com', role: 'Admin' }`) when response parsing failed.
  - **Fix:** Removed mock token & user fallbacks, added response validation, added `/api/auth/me` user fetch, and added a 401 response interceptor in `api.ts`.

---

## 2. High Priority: UI Responsiveness & User Management

- [ ] **Make the entire Dashboard UI Responsive**
  - **Task:** The current dashboard layout is not responsive and breaks on smaller screens/tablets. Overhaul layout components (sidebar, grids, tables, and modals) using TailwindCSS responsive breakpoints to ensure mobile/tablet compatibility.
- [x] **System User & Admin Management Page**
  - **Endpoints:** 
    - `/api/users*` (GET, GET by ID, Deactivate)
    - `/api/users/admins*` (Manage admins)
  - **Task:** Implement an interface to view registered users, manage system administrators, and deactivate accounts. **(COMPLETED: Used TanStack Query, paginated list, and add/deactivate modal)**
- [ ] **Household & Members Management Page**
  - **Endpoints:** 
    - `/api/households/members*` (GET, PUT, DELETE, offline members)
    - `/api/households/invitations*` (Oversight of invitations)
  - **Task:** Interface for admins to monitor and manage household structures, offline members, and active invitations.

---

## 3. Fabricated / Unsupported Pages Cleanup

These pages currently call non-existent `/api/analytics/*` endpoints and render fake numbers. They need to be removed, refactored, or replaced with real backend capabilities. **For now, these are temporarily mocked in the UI until the backend implements the following endpoints:**

### Required Analytics Endpoints from Backend
- [ ] **`GET /api/analytics/overview`**
  - **Required for:** `src/pages/Overview.tsx`, `src/pages/Stats.tsx`
  - **Response Should Contain:** Total system users, active households, platform penetration, revenue/sales (if applicable), and recent system pulse events.
- [ ] **`GET /api/analytics/households-summary`**
  - **Required for:** `src/pages/Overview.tsx`, `src/pages/Households.tsx`
  - **Response Should Contain:** Total households, active vs inactive, average household size, and geographical distribution data.
- [ ] **`GET /api/analytics/demographics`**
  - **Required for:** `src/pages/GeographicDemographics.tsx`
  - **Response Should Contain:** Heatmap coordinates, user age distribution, and governorate-level density metrics.
- [ ] **`GET /api/analytics/pnl-deep-dive`**
  - **Required for:** `src/pages/PnLDeepDive.tsx`
  - **Response Should Contain:** System costs vs revenue (if applicable), operational expenses.
- [ ] **`GET /api/analytics/supermarket-performance`**
  - **Required for:** `src/pages/SupermarketPerformance.tsx`
  - **Response Should Contain:** Scan rates, offer redemption rates, top performing supermarkets.

- [ ] **`src/pages/VisionAILogs.tsx`** (`/api/analytics/vision-logs`) — Replace with the genuine **Offer Scraping Pipeline** page (see below).

---

## 4. New Dashboard Pages & Features (Backend-Supported)

- [ ] **Offer Scraping Pipeline Page (Replaces VisionAILogs)**
  - **Endpoints:** 
    - `POST /api/offers/scrape/facebook-page`
    - `POST /api/offers/scrape/image-file`
    - `GET /api/offers/scrape/status`
  - **Details:** Interface to trigger and monitor async scraping jobs (`isRunning`, scraped/extracted counts, start/complete timestamps, error messages).

- [ ] **Offer Verification & Moderation UI**
  - **Endpoint/Field:** `isVerified` on `OfferResponse` (`/api/offers/*`)
  - **Details:** Interface for admins to review and toggle verification status of supermarket offers.
- [ ] **Product Categories CRUD Page**
  - **Endpoints:** `/api/products/categories*` (GET, POST, PUT, DELETE, Image Upload/Delete)
  - **Details:** Manage product categories used across Pantry and Supermarket items.
- [ ] **Measuring Units CRUD Page**
  - **Endpoints:** `/api/units*` (GET, POST, PUT, DELETE)
  - **Details:** Manage system-wide measuring units (e.g., kg, liters, units).

---

## 5. Verification & Hardening of Existing Pages

- [ ] **Supermarkets & Offers (`src/pages/Supermarkets.tsx`)**
  - **Endpoints:** `/api/supermarkets*`, `/api/offers*`
  - **Task:** Verify that Create, Edit, Delete operations, as well as image/logo uploads (`/api/supermarkets/{id}/logo`, `/api/offers/{id}/image`), function properly with real backend requests.
- [ ] **Preferences Management (`src/pages/Preferences.tsx` / `Overview.tsx`)**
  - **Endpoints:** `/api/preferences/*`, `/api/preferences/categories/*`
  - **Task:** Verify full CRUD functionality for preference categories and preference items.
