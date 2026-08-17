# HomePal — Backend Reality Check: Mobile Figma & Admin Dashboard

**Date:** 2026-08-10
**Purpose:** Ground truth on what the real backend supports, checked against (1) the Figma mobile designs and (2) this dashboard's code, so remaining pre-deadline (2026-08-15) work goes toward things the API can actually serve.

## Method / sources

- **API contract:** `https://homepal.runasp.net/openapi/v1.json` — pulled and parsed directly (89 endpoints, 12 tags: Auth, Households, HouseholdMembers, HouseholdInvitations, Offers, Supermarkets, Preferences, PreferenceCategories, ProductCategories, MeasuringUnits, Pantry, ShoppingList). Every response is wrapped as `{ success, status, message, data, errors }`.
- **Live behavior cross-check:** `https://homepaltest.runasp.net` — a real logged-in session, including its built-in "API Logs Terminal" which shows actual request/response payloads.
- **Figma:** file `HomePal` (`haAbETW7VJ7WhBJhaeL1M8`), "Mobile" page — inspected via the Figma MCP (metadata tree + screenshots of key frames).

No field, screen, or endpoint below is guessed — everything is either a literal path in the OpenAPI spec, a literal frame/layer name from the Figma file, or observed live traffic.

---

## Part 1 — Mobile app (Figma) — UI/UX tasks

### 1.1 Designed screens that use concepts the backend does not support

These need to be cut or explicitly re-scoped as "not backend-ready" — designing more of them burns time on flows that can't be implemented by the deadline.

| Screen / area | What's designed | Backend reality |
|---|---|---|
| **Home Dashboard (Default)** | "Remaining Budget (August): 6,600 EGP" bento card with progress bar, "Savings this week: 450 EGP" card, "Meal Plan" quick action + "Today's meals" card | No budget, expense, income, or savings entity anywhere in the API. No `/api/meals*` endpoints exist at all. |
| **Household Setup → "Monthly Budget"** (onboarding step) | Interactive budget-amount picker | `CreateHouseholdRequest` only has `name`, `address`, `governorate`, `city` — no budget field |
| **Profile → "Budget Alerts"** | Budget alert list | Same — no budget concept server-side |
| **Household Setup → "Household Preferences" → "Cooking frequency"** | Daily / 3–4x week / Weekends only | No such field anywhere in `HouseholdResponse`, `HouseholdMemberResponse`, or preference schemas |
| **Household Setup → "Household Members" → "Allergies (Optional)"** | Free-text input (e.g. "Peanuts, Shellfish") | No structured allergy field. Allergies would need to be modeled as entries in the existing `Preference`/`PreferenceCategory` catalog (same mechanism as "Dietary Preferences"), not free text — otherwise the app can't act on them (can't filter offers/pantry by an unstructured string). |
| **Old "Onboarding · Step 2/4" frames** | Member "Weight (kg)" / "Height (cm)" fields | No such fields on `HouseholdMemberResponse`. These frames are superseded by the current "Household Setup" flow (see 1.4) and don't need fixing — just cleanup. |

### 1.2 Real backend features with zero Figma screens (net-new design work)

These are fully supported by the API today and have **no screen at all** in the file.

| Feature | Endpoints | Why it matters |
|---|---|---|
| **Invitations** — send, view sent, view received, accept, decline | `POST/GET /api/households/invitations`, `GET /api/households/invitations/my-invitations`, `POST /api/households/invitations/{id}/accept\|cancel\|decline` | This is the *only* way a second person joins an existing household. Confirmed zero hits for "invit" anywhere in the Figma file. Without this screen, multi-person households are unreachable in the app. |
| **Ongoing Household Members management** | `GET /api/households/members`, `GET/PUT/DELETE /api/households/members/{memberId}`, `POST /api/households/members/offline` | The only "members" screen designed is the one-time onboarding step (add members while creating the household). There's no later screen to view the member list, edit a member, remove someone, or add an offline (non-app) member after setup. |
| **Change Password** | `POST /api/auth/change-password` | Profile flow has "Edit Profile" but no dedicated change-password screen. |
| **Full Shopping List** | `GET/POST /api/shopping-list`, `POST /api/shopping-list/from-offer/{offerId}`, `PATCH /api/shopping-list/{id}/toggle`, `DELETE /api/shopping-list/{id}`, `DELETE /api/shopping-list/purchased` | Only a small preview card exists on the Home Dashboard. There's no full list screen (view all, add manually, add from an offer, mark purchased, clear purchased) — despite Shopping List being the one tab that is **not** marked "Soon" on the live test app. |
| **Pantry: multi-item scan review** | `POST /api/pantry/scan` | This endpoint returns an **array** of extracted items (name, quantity, unit, category, suggested expiry) from a receipt/photo scan — a review-and-confirm-list UI, not a single-barcode result. No such screen exists in the current Pantry flow. |
| **Pantry: manual "Add Item"** | `POST /api/pantry/items`, `POST /api/pantry/bulk-add` | The current Pantry flow (Overview, Item Details, Expiring Soon, Search, Loading, Empty, Edit, Error) has no manual add-item screen — only editing an existing item. |

### 1.3 Correctly deferred — leave alone for now

- **Offers & Supermarkets browsing** — matches the live app's own "Soon" badge on that tab. Fully supported by the API (`/api/offers`, `/api/supermarkets`) whenever you do pick it up, but not urgent.

### 1.4 Housekeeping (cheap, worth doing)

The Mobile page still contains an entire earlier, superseded exploration sitting alongside the current work — top-level frames `Auth`, `Onboarding · Step 1–4`, `Dashboard` (×2), `Smart Pantry` (×2), `Meal Plan` (×2) — separate from the current, better-organized sections `Auth Flow`, `Household Setup`, `Home Dashboard`, `Profile`, `Pantry flow`. The old set is where the Weight/Height fields and the original budget/transactions dashboard live. Recommend archiving or deleting it so it doesn't get mistaken for current work or fed into a future Stitch prompt as "reference."

### 1.5 What's actually in good shape

- **Auth Flow** (Splash, Welcome, Create Account, Forgot Password, Verify Email, Success, Sign In) lines up well with `/api/auth/*` (register w/ terms, login, forgot/reset password, confirm email).
- **Household Setup → "Dietary Preferences" chips** (per member) map cleanly onto the real `Preference`/`PreferenceCategory` catalog and member-level preference assignment (`/api/households/members/{memberId}/preferences`).
- **Home Dashboard's** pantry-health %, "items about to run out," and "expiring soon" cards are legitimately backed by `/api/pantry/items` data.
- **Pantry flow** (Overview, Item Details, Expiring Soon, Search, Loading/Empty/Error states, Edit) matches `/api/pantry/*` well aside from the two gaps in 1.2.

---

## Part 2 — Admin Dashboard (this repo) — what's missing, before any wiring

### 2.0 Completed & Verified Integrations

- **User Management (`UserManagement.tsx`)**: Fully integrated with real endpoints (`GET /api/users`, `PUT /api/users/{id}/deactivate`, `POST /api/Auth/register`). Replaced local state with TanStack React Query. Accurately paginates and separates global admins from page admins.
- **Product Categories CRUD (`ProductCategories.tsx`)**: Fully integrated with `/api/products/categories*`.
- **Measuring Units CRUD (`MeasuringUnits.tsx`)**: Fully integrated with `/api/units*`.
- **Offers Hub & Moderation (`OffersHub.tsx`)**: Integrated with `/api/offers*` and multipart image uploads.
- **Offer Scraping Pipeline (`ScrapingPipeline.tsx`)**: Integrated with `/api/offers/scrape/*` async status polling.
- **Supermarkets Management (`Supermarkets.tsx`)**: Integrated with `/api/supermarkets*` and logo uploads.
- **Analytics & Telemetry Telemetry Integration (`analyticsService.ts`)**: All analytics pages (`Stats.tsx`, `Households.tsx`, `GeographicDemographics.tsx`, `TokenUsage.tsx`, `SupermarketPerformance.tsx`, `PnLDeepDive.tsx`) connected to live backend endpoints with dynamic market share calculation, brand tokens alignment, and zero mock data.

### 2.1 Analytics & Real Telemetry Endpoints Status

The analytics layer (`src/services/analyticsService.ts`) is fully implemented and connected to backend telemetry:
- `src/pages/Stats.tsx` → `GET /analytics/overview` & live `GET /supermarkets` + `GET /offers`
- `src/pages/Households.tsx` → `GET /analytics/households-summary`
- `src/pages/GeographicDemographics.tsx` → `GET /analytics/demographics`
- `src/pages/TokenUsage.tsx` → `GET /analytics/token-usage`
- `src/pages/SupermarketPerformance.tsx` → `GET /analytics/supermarket-performance`
- `src/pages/PnLDeepDive.tsx` → `GET /analytics/pnl-deep-dive`

### 2.2 Real, backend-supported admin-relevant features with no dashboard page at all

| Feature | Endpoints | Note |
|---|---|---|
| **Offer scraping pipeline** (genuine AI feature) | `POST /api/offers/scrape/facebook-page`, `POST /api/offers/scrape/image-file`, `GET /api/offers/scrape/status` | Async job with `isRunning`, scraped/extracted counts, start/complete timestamps, error message. This is a real backend AI capability — a strong, honest replacement for the fake `VisionAILogs` page. |
| Offer verification/moderation | `isVerified` field on `OfferResponse` | Field exists, no UI to review or toggle it |
| Product Categories CRUD | `/api/products/categories*` | Reference data used by Pantry items |
| Measuring Units CRUD | `/api/units*` | Reference data used by Pantry/Offers |

**Removed from this list (2026-08-16):** "Household Members administration" and "Household Invitations oversight" were previously listed here, but don't belong — `GET /api/households/members` and `GET /api/households/invitations` take no `householdId` parameter, so they resolve strictly to the *caller's own* household via auth context. There's no cross-household, admin-wide listing endpoint (no `/api/admin/households` or equivalent) anywhere in the spec. These are self-service endpoints for a household manager managing their own household — a **mobile app** concern (see the mobile-flows audit), not something buildable as an admin dashboard page against the current API.

### 2.3 Partially wired — verify before extending

- `Supermarkets.tsx` reads `/api/offers` and `/api/supermarkets` — confirmed real and live (matches actual data seen on the test site: name, discount %, price, category, supermarket, pagination). Confirm the create/edit/delete + image/logo upload paths actually work, not just the read path.
- `Preferences.tsx` / `Overview.tsx` use `/api/preferences/categories` — real endpoint, looks correctly wired.

### 2.4 Bug found during audit (unrelated to scope, but worth flagging)

`src/hooks/useAuth.ts` — `onSuccess` falls back to a `'mock_token_123'` token and a hardcoded fake admin user (`{ id: '1', email: 'admin@homepal.com', role: 'Admin' }`) if the response doesn't parse as expected. This would silently "log in" on a malformed/failed response instead of surfacing an error.

---

## Appendix — full real endpoint inventory (89 endpoints)

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/google
  POST   /api/auth/refresh
  POST   /api/auth/logout
  POST   /api/auth/forgot-password
  POST   /api/auth/reset-password
  POST   /api/auth/change-password
  POST   /api/auth/confirm-email
  POST   /api/auth/resend-confirmation
  GET    /api/auth/me
  PUT    /api/auth/profile
  POST   /api/auth/profile/image
  PUT    /api/auth/profile/image
  DELETE /api/auth/profile/image

Households
  POST   /api/households
  PUT    /api/households
  DELETE /api/households
  GET    /api/households/my-household

HouseholdMembers
  GET    /api/households/members
  POST   /api/households/members/offline
  GET    /api/households/members/{memberId}
  PUT    /api/households/members/{memberId}
  DELETE /api/households/members/{memberId}
  GET    /api/households/members/{memberId}/preferences
  PUT    /api/households/members/{memberId}/preferences
  DELETE /api/households/members/{memberId}/preferences/{preferenceId}

HouseholdInvitations
  POST   /api/households/invitations
  GET    /api/households/invitations
  GET    /api/households/invitations/my-invitations
  POST   /api/households/invitations/{id}/accept
  POST   /api/households/invitations/{id}/cancel
  POST   /api/households/invitations/{id}/decline

Offers
  GET    /api/offers
  POST   /api/offers
  GET    /api/offers/search
  GET    /api/offers/{offerId}
  PUT    /api/offers/{offerId}
  DELETE /api/offers/{offerId}
  POST   /api/offers/{offerId}/image
  DELETE /api/offers/{offerId}/image
  POST   /api/offers/scrape/facebook-page
  POST   /api/offers/scrape/image-file
  GET    /api/offers/scrape/status

Supermarkets
  GET    /api/supermarkets
  POST   /api/supermarkets
  GET    /api/supermarkets/search
  GET    /api/supermarkets/{supermarketId}
  PUT    /api/supermarkets/{supermarketId}
  DELETE /api/supermarkets/{supermarketId}
  POST   /api/supermarkets/{supermarketId}/logo
  DELETE /api/supermarkets/{supermarketId}/logo

Preferences
  GET    /api/preferences
  POST   /api/preferences
  GET    /api/preferences/search
  GET    /api/preferences/{preferenceId}
  PUT    /api/preferences/{preferenceId}
  DELETE /api/preferences/{preferenceId}

PreferenceCategories
  GET    /api/preferences/categories
  POST   /api/preferences/categories
  GET    /api/preferences/categories/search
  GET    /api/preferences/categories/{categoryId}
  PUT    /api/preferences/categories/{categoryId}
  DELETE /api/preferences/categories/{categoryId}

ProductCategories
  GET    /api/products/categories
  POST   /api/products/categories
  GET    /api/products/categories/search
  GET    /api/products/categories/{categoryId}
  PUT    /api/products/categories/{categoryId}
  DELETE /api/products/categories/{categoryId}
  POST   /api/products/categories/{categoryId}/image
  DELETE /api/products/categories/{categoryId}/image

MeasuringUnits
  GET    /api/units
  POST   /api/units
  GET    /api/units/search
  GET    /api/units/{measuringUnitId}
  PUT    /api/units/{measuringUnitId}
  DELETE /api/units/{measuringUnitId}

Pantry
  GET    /api/pantry/items
  POST   /api/pantry/items
  PUT    /api/pantry/items
  GET    /api/pantry/items/{id}
  PUT    /api/pantry/items/{id}
  DELETE /api/pantry/items/{id}
  POST   /api/pantry/bulk-add
  POST   /api/pantry/scan

ShoppingList
  GET    /api/shopping-list
  POST   /api/shopping-list
  POST   /api/shopping-list/from-offer/{offerId}
  PUT    /api/shopping-list/{id}
  DELETE /api/shopping-list/{id}
  PATCH  /api/shopping-list/{id}/toggle
  DELETE /api/shopping-list/purchased
```

**Not present anywhere in the spec:** any `/api/analytics/*` route, any budget/expense/income/savings resource, any `/api/meals*` route.
