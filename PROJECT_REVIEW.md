# Room PG – Quick Health Check (22 Mar 2026)

## Current Problems (Dikkat)

### 1) Lint is currently failing (build-quality blocker)
`npm run lint` currently reports **24 issues**: **14 errors** + **10 warnings**.

Major failing patterns:
- Unused variables/imports in multiple files (e.g., `motion`, state setters, handlers).
- `Navbar` has a function-use-before-declaration pattern flagged by React hooks lint.
- `SectorModal` sets state directly inside `useEffect` and gets flagged by `react-hooks/set-state-in-effect`.
- Many `useEffect` hooks have incomplete dependency arrays (`react-hooks/exhaustive-deps`).

### 2) Project README is generic template-level
The top-level README is mostly default Vite text and does not document:
- app architecture,
- role flows (admin/user),
- API contracts,
- environment variable setup,
- deployment steps.

### 3) No visible test setup
`package.json` has no test script currently, so regression safety is weak.

## What can be added (Kya add kar sakte ho)

### A) Quality baseline (highest priority)
- Fix all ESLint errors first (unused vars, hook rules, effect dependencies).
- Add CI pipeline step for `npm run lint` + `npm run build`.
- Add pre-commit hook (`lint-staged` + `husky`) to prevent new lint regressions.

### B) Testing layer
- Add unit/component tests with **Vitest + React Testing Library**.
- Start with smoke tests for key pages:
  - Auth page render and basic form validations.
  - Property list filtering/sorting.
  - Booking create/cancel flows.

### C) Product features likely valuable for PG platform
- Better search: distance, price slabs, amenities, occupancy availability.
- Saved search alerts (email/WhatsApp).
- Booking status timeline + auto-reminders.
- Tenant verification status (KYC docs upload/check status).
- Owner analytics dashboard (views, inquiries, conversion).

### D) UX and performance
- Add skeleton loaders + empty states everywhere.
- Add pagination/infinite-scroll for large property lists.
- Add error boundaries for crash-safe UI sections.
- Optimize heavy components via memoization where needed.

### E) Security and reliability
- Token/session expiry UX improvements (auto-redirect + toast messaging).
- Centralized API error handling and retry policy.
- Input sanitization and stronger client-side validation.

## Recommended execution order
1. Lint cleanup (all errors first).
2. CI + pre-commit quality gates.
3. Test foundation (Vitest/RTL).
4. Feature additions in short sprint cycles.
