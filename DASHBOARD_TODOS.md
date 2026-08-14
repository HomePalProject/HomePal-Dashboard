# HomePal Admin Dashboard — TODOs & Status Report

> **Last Updated:** August 14, 2026  
> **Status:** Synchronized with Ground Truth Implementation (`/src`) & OpenAPI Backend (`https://homepal.runasp.net`).

---

## 🟢 1. Completed Tasks (Fully Integrated with Live Backend & Responsive UI)

- [x] **Fix Mock Token Fallback Bug in `useAuth.ts`**
  - **File:** `src/hooks/useAuth.ts`, `src/services/api.ts`
  - **Status:** ✅ **COMPLETED** (Removed fake mock user fallback; implemented real JWT authentication & 401 response interceptors).

- [x] **System User & Admin Management Page**
  - **File:** `src/pages/UserManagement.tsx`, `src/services/adminService.ts`, `src/hooks/useUserManagement.ts`
  - **Endpoints:** `GET /api/users`, `POST /api/auth/register`, `PUT /api/users/{id}/deactivate`
  - **Status:** ✅ **COMPLETED** (Paginated admin users table, live registration modal, deactivate user action).

- [x] **Product Categories Management CRUD Page**
  - **File:** `src/pages/ProductCategories.tsx`, `src/services/productCategoryService.ts`, `src/typeDefs/productCategoryTypes.ts`
  - **Endpoints:** `GET /api/products/categories`, `POST /api/products/categories`, `PUT /api/products/categories/{id}`, `DELETE /api/products/categories/{id}`
  - **Status:** ✅ **COMPLETED** (Full CRUD implementation with live backend API, zero mock data, responsive layout).

- [x] **Offers Hub & Moderation Interface**
  - **File:** `src/pages/OffersHub.tsx`, `src/services/catalogService.ts`
  - **Endpoints:** `GET /api/offers`, `POST /api/offers`, `PUT /api/offers/{id}`, `DELETE /api/offers/{id}`, `POST /api/offers/{id}/image`
  - **Status:** ✅ **COMPLETED** (Real DB offer listing, deal verification toggle, search & category filters, edit/create modals, image uploads, zero mock data).

- [x] **Offer Scraping Pipeline & Async Polling**
  - **File:** `src/pages/ScrapingPipeline.tsx`, `src/services/scraperService.ts`
  - **Endpoints:** `POST /api/offers/scrape/facebook-page`, `POST /api/offers/scrape/image-file`, `GET /api/offers/scrape/status`
  - **Status:** ✅ **COMPLETED** (Interface to launch Facebook & Flyer image scraping jobs, active status polling every 3s until completion, automatic retrieval of newly extracted offers).

- [x] **Supermarkets Management Page**
  - **File:** `src/pages/Supermarkets.tsx`, `src/services/catalogService.ts`
  - **Endpoints:** `GET /api/supermarkets`, `POST /api/supermarkets`, `PUT /api/supermarkets/{id}`, `DELETE /api/supermarkets/{id}`, `POST /api/supermarkets/{id}/logo`
  - **Status:** ✅ **COMPLETED** (Full supermarket chain CRUD, logo file uploads/deletions, live backend sync, responsive grid layout).

- [x] **Dashboard UI Responsiveness Overhaul**
  - **Files:** `src/pages/*`, `src/components/*`
  - **Status:** ✅ **COMPLETED** (Refactored layout components, navigation sidebars, table viewports, and modals with Tailwind responsive grid/flex breakpoints for mobile, tablet, and desktop compatibility).

---

## 🌟 2. Additional Accomplishments Completed (Beyond Original TODO List)

- [x] **Complete Mock Data Purge from Core Operational Pages**
  - **Details:** Purged all hardcoded mock arrays (`MOCK_CATEGORIES`, `INITIAL_MOCK_OFFERS`) from `OffersHub.tsx` and `ProductCategories.tsx` to rely strictly on live backend data.

- [x] **Background Scraping Asynchronous Polling Flow**
  - **Details:** Resolved the 0-offers issue during Facebook scraping by implementing a live status polling algorithm that queries `GET /api/offers/scrape/status` until `isRunning === false` before launching the Review Offers Modal.

- [x] **Scraped Offers Session Storage Sync**
  - **Details:** Built seamless state bridge saving freshly scraped offers in `sessionStorage` so admins can review, modify, or verify scraped products directly inside `OffersHub.tsx`.

- [x] **Image & Logo Direct Upload Services**
  - **Details:** Implemented multipart form data services for uploading supermarket logos (`/api/supermarkets/{id}/logo`) and offer deal banners (`/api/offers/{id}/image`).

---

## 🔴 3. Incomplete / Pending Tasks (Requires Backend Implementation or Future Sprint)

- [ ] **Household & Members Management Page**
  - **Endpoints Required:** `GET /api/households/members*`, `PUT /api/households/members*`, `DELETE /api/households/members*`
  - **Status:** 🔴 **NOT DONE** (Awaiting backend implementation of Household admin management endpoints).

- [ ] **Measuring Units CRUD Page**
  - **Endpoints Required:** `GET /api/units*`, `POST /api/units*`, `PUT /api/units*`, `DELETE /api/units*`
  - **Status:** 🔴 **NOT DONE** (Currently units are referenced by string ID inside products; standalone CRUD page pending backend units endpoint).

- [ ] **Analytics & Telemetry Backend Integration**
  - **Required Endpoints from Backend:**
    - `GET /api/analytics/overview` (Required for `/stats`)
    - `GET /api/analytics/demographics` (Required for `/geographic-demographics`)
    - `GET /api/analytics/households-summary` (Required for `/households`)
    - `GET /api/analytics/pnl-deep-dive` (Required for `/pnl-deep-dive`)
    - `GET /api/analytics/supermarket-performance` (Required for `/supermarket-performance`)
    - `GET /api/analytics/vision-logs` (Required for `/vision-ai-logs`)
  - **Status:** 🔴 **NOT DONE** (Pages currently render structured fallback mock constants because backend does not expose analytics endpoints).

---
