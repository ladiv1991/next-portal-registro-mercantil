# Design: Backend Same-Origin Authorization

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser / Frontend (allowlisted origin)            │
│  fetch('/api/cms/news', { method: 'POST',           │
│    credentials: 'include', body: ... })             │
└──────────────────────┬──────────────────────────────┘
                       │ Origin: https://portal...
                       ▼
┌─────────────────────────────────────────────────────┐
│  src/lib/origin-check.ts                             │
│  ┌─────────────────────────────────────────────┐    │
│  │  ALLOWED_ORIGINS (computed once at import)   │    │
│  │  ├─ NEXT_PUBLIC_APP_URL                      │    │
│  │  ├─ PORTAL_DOMAINS → PORTAL_SCHEME://domain  │    │
│  │  └─ dev: localhost:3000-3008, 127.0.0.1      │    │
│  └─────────────────────────────────────────────┘    │
│  checkOrigin(request): boolean                      │
│  withCsrfGuard<T>(handler): T                       │
└──────────────────────┬──────────────────────────────┘
                       │ true → proceed
                       ▼
┌─────────────────────────────────────────────────────┐
│  Route Handler (POST/PUT/DELETE/PATCH)               │
│  try {                                               │
│    if (!checkOrigin(request)) return 403;            │
│    await requireAuth();                              │
│    // ... business logic                            │
│  }                                                  │
└─────────────────────────────────────────────────────┘
```

## Components

### `src/lib/origin-check.ts`
- `getAllowedOrigins()` — builds the Set from env vars. Called once at module load; result cached in `ALLOWED_ORIGINS`.
- `checkOrigin(request: Request | NextRequest): boolean` — reads `Origin` header, returns `true` if absent (non-browser client), otherwise checks membership in `ALLOWED_ORIGINS`.
- `withCsrfGuard<T>(handler)` — higher-order wrapper that runs `checkOrigin` before calling the wrapped handler. Returns 403 JSON on failure.

### `scripts/apply-csrf-guard.js`
- Node script that walks `src/app/api/**/route.ts`, adds the `checkOrigin` import if missing, and inserts the 403 guard immediately after `try {` in every POST/PUT/DELETE/PATCH handler that doesn't already have it.
- Skips GET handlers (read-only).
- Idempotent: re-running produces no changes.

### `constitution.md`
- New clause **1.4 Same-Origin Enforcement** under Article I (Security).

## Data Flow
1. `getAllowedOrigins()` runs at module import time, reading `process.env.NEXT_PUBLIC_APP_URL`, `process.env.PORTAL_DOMAINS`, `process.env.PORTAL_SCHEME`, and `process.env.NODE_ENV`.
2. On each request, `checkOrigin()` reads the `Origin` header synchronously (no async).
3. If the Origin is absent, the request is allowed (non-browser client, e.g., curl, health check, Server Action which already has its own CSRF protection).
4. If the Origin is present and not in the allowlist, return 403 immediately — before any auth check or body parsing.

## Error Handling
- Failed Origin check returns `403 Forbidden` with `{ success: false, error: 'Origen no permitido' }`.
- No logging of the offending Origin (privacy: avoid leaking internal domain structure).

## Configuration
- `.env.local`:
  - `NEXT_PUBLIC_APP_URL=https://portal-registromercantil.test.xutil.cu`
  - `PORTAL_DOMAINS=registro-mercantil.xetid.cu,portal-registromercantil.test.xutil.cu,portal-registromercantil.egob.dev.xetid.cu`
  - `PORTAL_SCHEME=https`
- Dev: `NODE_ENV=development` adds `http://localhost:3000-3008` and `http://127.0.0.1:3000-3008`.

## Backward Compatibility
- No DB changes.
- No changes to `requireAuth()` / `requireAdmin()`.
- Login flows unchanged (the Origin check runs before auth, so a cross-origin login attempt is rejected before credentials are even read).
- GET endpoints unchanged (no Origin check).