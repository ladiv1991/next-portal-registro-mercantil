# Portal del Registro Mercantil — Development Guidance

> **Generated**: 2026-10-28
> **Status**: Project initialized with Spec Kit SDD framework
> **Image**: `registry.dev.xetid.cu/portales-web/portal-rmc:latest` (923MB, pushed)

---

## Project Overview

Cuba's official digital portal for the Mercantile Registry. Two unified interfaces:
- **Public Portal** (`/`) — citizen-facing: search, procedures, regulations, assistance
- **CMS Admin** (auth-gated, same host) — content management for staff

### Current State
| Area | Status | Notes |
|------|--------|-------|
| Core portal pages | ✅ Complete | Home, search, procedures, regulations, statistics, assistance |
| CMS module | ✅ Complete | 22 CRUD endpoints, RichTextEditor (MDX), toast notifications |
| Authentication | ✅ Complete | JWT (CMS) + PortalUser (citizens) + ENZONA (pending) |
| CAPTCHA v2 | ✅ Complete | Alphanumeric, Guardian trace analyzer, per-IP profiling |
| Docker build | ✅ Complete | Offline-safe, single-stage, no CLI deps in container |
| Harbor push | ✅ Complete | `registry.dev.xetid.cu/portales-web/portal-rmc:latest` |
| Spec Kit SDD | 🔄 Initialized | Constitution created, templates ready |
| Test coverage | ⚠️ Partial | 98 bun tests passing; API/security tests needed |
| Production DB | ⚠️ Pending | Migrations applied locally; production DB migration TBD |

---

## How to Start New Feature Work

### Step 1: Create a Spec (SPECKIT)
```bash
# From the project root, in your AI agent chat:
/speckit-specify "Describe the feature here"
```
This creates: `.specify/specs/[###-feature-name]/spec.md`

### Step 2: Plan the Implementation
```bash
/speckit-plan
```
This creates: `.specify/specs/[###-feature-name]/plan.md`

### Step 3: Generate Tasks
```bash
/speckit-tasks
```
This creates: `.specify/specs/[###-feature-name]/tasks.md`

### Step 4: Implement
```bash
/speckit-implement
```
Follows tasks sequentially, marks [x] as complete.

### Step 5: Converge
```bash
/speckit-converge
```
Validates completion against spec, adds remaining tasks.

---

## Key Architecture Patterns

### Authentication Flow
```
User → Login Form → POST /api/auth/login → Set rmc-token cookie (JWT, 8h)
                    → Redirect to CmsLayout          (httpOnly, secure, sameSite=lax)

User → Portal Login → POST /api/portal/auth/login → Set portal session
                    → Redirect to /portal/dashboard
```

### CMS Handler Pattern
```typescript
// src/lib/cms-handler.ts
import { CMS_SCHEMAS } from '@/lib/cms-schemas';

export async function handleCmsRequest(model: string, method: string, body: unknown) {
  const schema = CMS_SCHEMAS[model];
  if (!schema) throw new ApiError(404, 'Unknown model');
  
  const validated = schema.parse(body);  // Zod validation
  // ... database operation using validated data
}
```

### Security Checklist (per endpoint)
- [ ] Input validated with Zod schema?
- [ ] Auth checked via `requireAuth()` / `requireAdmin()`?
- [ ] Rate limited if sensitive (login, password reset)?
- [ ] User-generated content sanitized with DOMPurify?
- [ ] No secrets in response?

---

## Deployment Checklist

### Before pushing to Harbor:
1. `bun test` — all tests pass
2. `bun run next build` — production build succeeds
3. `docker build --network=host -f Dockerfile -t registry.dev.xetid.cu/portales-web/portal-rmc:<tag> .`
4. `docker push registry.dev.xetid.cu/portales-web/portal-rmc:<tag>`
5. Apply DB migrations on production host: `bun run prisma migrate deploy`

### Using the push script:
```bash
bash scripts/push-to-harbor.sh --tag v1.1.0
bash scripts/push-to-harbor.sh --skip-db --tag v1.1.0  # skip migration check
bash scripts/push-to-harbor.sh --no-push               # build and tag only
```

---

## Critical File Map

| Path | Purpose |
|------|---------|
| `src/lib/api-auth.ts` | JWT verification, `requireAuth()`, `requireAdmin()` |
| `src/lib/cms-schemas.ts` | Zod schemas for all CMS models + `CMS_SCHEMAS` map |
| `src/lib/cms-handler.ts` | Centralized CRUD handler using schemas |
| `src/lib/portal-auth.ts` | Portal user auth, `hashPortalPassword()` |
| `src/lib/guardian.ts` | Guardian trace analyzer (bot detection) |
| `src/lib/captcha-v2.ts` | CAPTCHA v2 generation and verification |
| `src/lib/rate-limiter.ts` | Per-IP rate limiting |
| `prisma/schema.prisma` | 20 models, full database schema |
| `prisma/seed.ts` | Seed data (admin, editor, portal users) |
| `Dockerfile` | Single-stage offline-safe build |
| `scripts/push-to-harbor.sh` | Build + tag + push automation |
| `.specify/memory/constitution.md` | Project constitution (this file's source of truth) |

---

## Known Constraints & Debt

1. **Prisma CLI in container**: Removed from production image. Migrations must be run on host before build.
2. **Docker network**: Container-internal networking is broken on local Docker Desktop (corporate proxy). Build requires `--network=host`.
3. **Middleware renamed**: Next.js 16 uses `proxy.ts` instead of `middleware.ts` — verify convention before adding new middleware.
4. **enzona disabled**: ENZONA payment integration code exists but is visually disabled. Routes still point to `/auth/enzona`.
5. **Constitution template**: Initial constitution is a template — fill with project-specific principles using `/speckit-constitution`.

---

## Next Recommended Actions

1. **Run `/speckit-constitution`** to populate project-specific principles
2. **Add security tests** for auth endpoints (`/api/auth/login`, `/api/portal/auth/login`)
3. **Create first feature spec** for any pending requirement
4. **Verify production deployment** on the target server
