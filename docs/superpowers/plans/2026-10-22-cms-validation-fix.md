# CMS Validation Implementation Plan

**Goal:** Add server-side Zod validation + field-level error display to all 18 CMS modules, aligned with Prisma schema requirements and ISO 25010 quality standards.

**Architecture:** Single `cms-schemas.ts` file → consumed by `cms-handler.ts` at runtime → frontend components add field-level error state.

**Tech Stack:** Zod (already in project), React hooks, existing UI components

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/cms-schemas.ts` | **Create** | Zod schemas for all 18 CMS models |
| `src/lib/cms-handler.ts` | **Modify** | Apply schema validation before create/update |
| `src/components/cms/cms-sliders.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-services.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-statistics.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-news.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-procedures.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-regulations.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-faq.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-tutorials.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-webinars.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-contacts.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-search-names.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-site-pages.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-guides.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-bot-config.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-user-roles.tsx` | **Modify** | Field-level errors + align validation |
| `src/components/cms/cms-portal-users.tsx` | **Modify** | Email/password validation |

---

## Schemas (source of truth)

Each schema has `.create` (for POST) and `.update` (for PUT) variants.
Update schemas make everything `.optional()` except fields that must always be present.

### Model → Schema mapping

| Model | Required Fields | Key Validations |
|-------|----------------|-----------------|
| Slider | title, message | title ≤200, message ≤500, startDate ≤ endDate if both set |
| Service | title, description | title ≤200, description ≤2000, color hex regex |
| Statistic | label, value | label ≤100, value ≥0 integer |
| NewsArticle | title, summary, content | title ≤200, summary ≤500, content optional |
| Procedure | title, description | title ≤200, description ≤2000 |
| Regulation | title, description | title ≤200, type in enum, effectiveDate not in future |
| FAQ | question, answer | question ≤300, answer ≤2000 |
| VideoTutorial | title, description, videoUrl | videoUrl valid URL pattern |
| Webinar | title, description, date, time | date not in past, time format HH:MM |
| ContactChannel | type, label, value | type in enum, value validates by type (email/tel/url) |
| SearchableName | name, type, status | name ≤200, type in enum, status in enum |
| SitePage | title, slug, content | slug regex `^[a-z0-9-]+$`, slug ≤200 |
| Guide | title, description | title ≤200, steps valid JSON array |
| BotConfig | provider | provider in enum, maxTokens 256-8192, temperature 0-2 |
| UserRole | name | name ≤50, permissions array of strings |
| PortalUser | (edit only — no create from CMS) | email valid, role in enum |

---

## Execution Order

1. **Create `cms-schemas.ts`** — all schemas defined
2. **Update `cms-handler.ts`** — add `validateBody(schema, body)` helper, apply in POST/PUT
3. **Update each component** — add `errors` state, show errors inline, tighten frontend checks

## Verification
- Build passes: `npx next build`
- Tests pass: `bun test`
- Dev server runs: visit each CMS module, try submitting empty required fields, verify inline errors appear
