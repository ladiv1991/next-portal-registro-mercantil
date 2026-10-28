# Portal del Registro Mercantil de Cuba — Project Constitution

## Core Principles

### I. Security-First (NON-NEGOTIABLE)
Every endpoint, form, and data flow MUST be secured before feature work. JWT auth via `rmc-token` cookie (httpOnly, 8h expiry) guards all CMS routes. Portal auth uses separate `PortalUser` model. Input validation with Zod is mandatory on ALL Route Handlers and Server Actions — TypeScript types are never trust boundaries. Rate limiting (5 attempts/60s per IP) on all login endpoints. CSP with nonces in production; no `unsafe-inline` for scripts except when required by Next.js App Router internals.

### II. Offline-First Deployment
The production Docker image (`registry.dev.xetid.cu/portales-web/portal-rmc`) is built as a self-contained standalone Next.js bundle. No internet access in the deployment environment. All dependencies must be resolved locally before build. Database migrations are applied on the host before image creation — the container never runs `prisma migrate` or `bun install`. Image size target: under 1GB.

### III. Spec-Driven Development
All feature work follows the SDD cycle: constitution → spec → plan → tasks → implement → converge. No code is written before a spec exists for the feature. Each spec lives in `.specify/specs/[###-feature-name]/spec.md`. Plans live in `docs/superpowers/plans/`. Tasks are generated from plans and tracked in `tasks.md`.

### IV. Minimal Viable Change
Every change must be the smallest complete unit that delivers value. No abstraction without a caller. No feature flag for unshipped functionality. No code that isn't tested. Delete before you add — if an existing file already does the job, extend it rather than creating a new one.

### V. Test-First for Critical Paths
Security-critical code (auth, rate limiting, input validation, CSP, captcha) requires tests written before implementation. Business logic in CMS handlers requires unit tests. UI components require visual regression tests where state changes are non-trivial. Target: 80%+ coverage on `src/lib/` and `src/app/api/`.

## Technology Stack Constraints

- **Framework**: Next.js 16 (App Router) — never use Pages Router for new code
- **Language**: TypeScript 5.9+, strict mode enabled
- **Styling**: Tailwind CSS 4 with MINJUS palette variables (`--rm-primary`, `--rm-text`, etc.)
- **ORM**: Prisma 6 with PostgreSQL 15
- **Validation**: Zod schemas centralized in `src/lib/cms-schemas.ts`
- **Testing**: Bun test for unit/integration; Playwright for E2E
- **Build**: Turbopack for dev, standard bundler for production
- **Deployment**: Docker (oven/bun:1.4.4-debian base), pushed to Harbor corporate registry

## Security Requirements

- No `NEXT_PUBLIC_` secrets — all secrets in `.env.local` only
- JWT_SECRET minimum 32 characters, rotated quarterly
- Database user `portal_rmc` has least-privilege roles (no superuser)
- All user-generated content sanitized with `isomorphic-dompurify` before rendering
- Image uploads: type whitelist (image/*), size limit 10MB, stored in `public/uploads/`
- CAPTCHA v2 with Guardian trace analyzer on all public-facing forms (login, inquiries, contact)
- HSTS preload ready, CSP with nonces in production

## Governance

This constitution supersedes all other development practices. Amendments require:
1. Documentation of the change in `openspec/changes/`
2. Approval from project owner
3. Migration plan if the change affects running systems
4. Update to this document with version bump

**Version**: 1.0.0 | **Ratified**: 2026-10-28 | **Last Amended**: 2026-10-28
