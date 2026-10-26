# Proposal: Backend Same-Origin Authorization

## Summary
Enforce Origin-header validation on every mutating Route Handler in `src/app/api/**` so the backend only accepts requests from the authorized frontend domains. This closes the CSRF vector that allows cross-origin sites to submit state-changing requests using the victim's `rmc-token` cookie.

## Motivation
- The current architecture relies on `SameSite=Lax` cookies for CSRF mitigation, but `SameSite` is a client-side defense that can be bypassed (e.g., via redirect-based attacks, certain cookie configurations, or non-browser clients).
- Route Handlers in Next.js App Router do **not** receive automatic Origin validation (unlike Server Actions, which Next.js validates internally).
- An attacker-controlled page can `fetch('/api/cms/news', { method: 'POST', credentials: 'include', body: ... })` and the backend will accept it because the cookie is sent and `requireAuth()` only checks the token, not where the request came from.
- The `checkOrigin()` helper existed in `src/lib/origin-check.ts` but was only wired into 1 of ~65 mutating handlers.

## Scope
- **In**: Rewrite `src/lib/origin-check.ts` to support multi-domain allowlist (`PORTAL_DOMAINS`), add `withCsrfGuard()` wrapper, and inject `checkOrigin(request)` into every POST/PUT/DELETE/PATCH handler in `src/app/api/**`.
- **Out**: No changes to authentication logic, no DB schema changes, no new dependencies, no middleware.ts.

## Success Criteria
1. Every mutating Route Handler in `src/app/api/**` returns 403 when the `Origin` header is not in the allowlist.
2. Requests without an `Origin` header (curl, Server Actions, internal health checks) are still accepted — they are never treated as frontend requests.
3. `requireAuth()` / `requireAdmin()` continue to work unchanged.
4. The allowlist is sourced from environment variables only (no hardcoded production domains).
5. `openspec validate` passes.