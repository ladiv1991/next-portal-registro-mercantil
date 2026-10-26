## ADDED Requirements

### Requirement: Same-origin enforcement on all mutating Route Handlers
The system SHALL reject any mutating HTTP request (POST/PUT/DELETE/PATCH) to `src/app/api/**` whose `Origin` header is present and not in the allowlist derived from `NEXT_PUBLIC_APP_URL`, `PORTAL_DOMAINS`, and development origins.

#### Scenario: Cross-origin POST to CMS news is rejected
- **WHEN** a request is sent from `https://evil.com` to `POST /api/cms/news` with a valid `rmc-token` cookie
- **THEN** the response is `403 Forbidden` with `{ success: false, error: 'Origen no permitido' }`
- **AND** no database write occurs

#### Scenario: Same-origin POST to CMS news is accepted
- **WHEN** a request is sent from `https://portal-registromercantil.test.xutil.cu` to `POST /api/cms/news` with a valid `rmc-token` cookie
- **THEN** the request proceeds to `requireAuth()` and the handler logic

#### Scenario: Request without Origin header is allowed (non-browser client)
- **WHEN** `curl -X POST http://localhost:3008/api/cms/news -H "Cookie: rmc-token=..."` is sent (no Origin header)
- **THEN** the request proceeds (Origin check returns true for absent Origin)
- **AND** subsequent `requireAuth()` still enforces the token

#### Scenario: Multi-domain allowlist includes all PORTAL_DOMAINS entries
- **WHEN** `PORTAL_DOMAINS=dominio1.com,dominio2.com` and `PORTAL_SCHEME=https`
- **THEN** `checkOrigin` returns true for requests from `https://dominio1.com` and `https://dominio2.com`
- **AND** returns false for `http://dominio1.com` (wrong scheme)

#### Scenario: Development origins are accepted
- **WHEN** `NODE_ENV=development`
- **THEN** requests from `http://localhost:3000`, `http://127.0.0.1:3008`, etc. are accepted
- **AND** production domains are NOT in the dev allowlist unless explicitly configured via env vars

#### Scenario: GET handlers are exempt
- **WHEN** a cross-origin `GET /api/cms/news` is sent
- **THEN** the request is NOT rejected by the Origin check (GET is read-only)

#### Scenario: withCsrfGuard wrapper enforces the same policy
- **WHEN** a new handler is created using `export const POST = withCsrfGuard(async (request) => { ... })`
- **THEN** the wrapper automatically returns 403 for non-allowlisted origins before calling the handler

#### Scenario: No hardcoded production domains
- **WHEN** the source of `src/lib/origin-check.ts` is inspected
- **THEN** there is no literal string matching a production domain (e.g., `xetid.cu`, `xutil.cu`)
- **AND** all allowlist entries come from environment variables or are dev-only (`localhost`/`127.0.0.1`)