## Tasks: Backend Same-Origin Authorization

## T1: Rewrite origin-check.ts
- [x] **T1.1** Add `import type { NextRequest } from 'next/server'` to `src/lib/origin-check.ts`.
- [x] **T1.2** Implement `getAllowedOrigins()` that builds a `Set<string>` from `NEXT_PUBLIC_APP_URL`, `PORTAL_DOMAINS` (split by comma, prefix with `PORTAL_SCHEME`), and dev origins (`localhost`/`127.0.0.1` ports 3000-3008) when `NODE_ENV === 'development'`.
- [x] **T1.3** Cache the result in module-level `ALLOWED_ORIGINS` constant.
- [x] **T1.4** Update `checkOrigin(request)` to accept `Request | NextRequest` and return `true` when `Origin` header is absent.
- [x] **T1.5** Add `withCsrfGuard<T>(handler)` generic wrapper that checks Origin and returns 403 JSON on failure.

## T2: Apply CSRF guard to all mutating handlers
- [x] **T2.1** Create `scripts/apply-csrf-guard.js` — Node script that walks `src/app/api/**/route.ts`.
- [x] **T2.2** Script adds `import { checkOrigin } from '@/lib/origin-check';` after the last existing import line if not present.
- [x] **T2.3** Script inserts `if (!checkOrigin(request)) { return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 }); }` immediately after `try {` in every POST/PUT/DELETE/PATCH handler.
- [x] **T2.4** Script skips handlers that already contain `checkOrigin` (idempotent).
- [x] **T2.5** Script skips GET-only files.
- [x] **T2.6** Run script: 48 files changed, 17 already protected, 0 errors.
- [x] **T2.7** Verify 0 mutating handlers remain without `checkOrigin`.

## T3: Fix generic CMS handler delegation
- [x] **T3.1** Add `import { checkOrigin } from '@/lib/origin-check';` to `src/lib/cms-handler.ts`.
- [x] **T3.2** Add Origin guard to `handleCMSPost` — first statement after `try {`.
- [x] **T3.3** Add Origin guard to `handleCMSPut` — first statement after `try {`.
- [x] **T3.4** Update `handleCMSDelete` signature to accept `(request: NextRequest, modelPath, id)` and add Origin guard.
- [x] **T3.5** Fix all 7 delegation files (`cms/*/faq/[id]/route.ts`, etc.) to pass `request` as first arg to `handleCMSDelete`.

## T4: Fix handlers without request param
- [x] **T4.1** Fix `src/app/api/portal/auth/logout/route.ts` — change `POST()` to `POST(request: NextRequest)`.
- [x] **T4.2** Fix `src/app/api/chat/rebuild-index/route.ts` — change `POST()` to `POST(request: NextRequest)`.

## T5: Constitution update
- [x] **T5.1** Add clause **1.4 Same-Origin Enforcement** to `constitution.md` Article I.
- [x] **T5.2** Document the allowlist sources, the `checkOrigin` usage pattern, and the `withCsrfGuard` wrapper.

## T6: OpenSpec artifacts
- [x] **T6.1** Create `openspec/changes/backend-origin-authorization/proposal.md`.
- [x] **T6.2** Create `openspec/changes/backend-origin-authorization/design.md`.
- [x] **T6.3** Create `openspec/changes/backend-origin-authorization/specs/backend-origin-authorization/spec.md` with 8 WHEN/THEN scenarios.
- [x] **T6.4** Create `openspec/changes/backend-origin-authorization/tasks.md`.
- [x] **T6.5** Run `openspec validate --changes backend-origin-authorization` — **passed**.

## T7: Verification
- [x] **T7.1** Code-level: every mutating handler has `checkOrigin` either inline or delegated to cms-handler.
- [x] **T7.2** Code-level: `src/lib/origin-check.ts` contains no hardcoded production domains.
- [ ] **T7.3** Runtime: curl with `Origin: https://evil.com` to any mutating endpoint returns 403 (pending — dev server unstable on Windows).
- [ ] **T7.4** Browser: cross-origin request from a non-allowlisted origin is rejected; same-origin request proceeds (pending — dev server unstable on Windows).
