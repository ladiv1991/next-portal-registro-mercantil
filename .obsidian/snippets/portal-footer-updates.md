---
topic: PortalFooter footer updates
when: 2026-11-09
decision: QR code + share API with metadata + mailto/tel links
---

## What changed in PortalFooter.tsx

**QR code** — uses dynamic `import('qrcode').then(({ toDataURL }) => ...)` inside a `useEffect` guarded by `useRef`. Generates PNG data-URL for current page URL on client mount only; shows pulse placeholder until ready. No SSR leakage.

**Share button** — refactored to gather full OpenGraph metadata (`document.title`, `<meta name="description">` / `[property="og:description"]`, `window.location.href`). Calls `navigator.share({ title, url, text: description })`; fallback copies URL to clipboard and shows Sonner toast instead of inline `copiedMsg`.

**Mailto icon** — now opens with subject: `mailto:${FOOTER_EMAIL}?subject=${encodeURIComponent('Consulta desde Portal Registro Mercantil')}`. Previously bare.

**Phone contact** — replaced the `ObfuscatedContact` wrapper with a plain `<a href="tel:+5378623456">${FOOTER_PHONE}</a>` so tap dials directly. Email keeps ObfuscatedContact (still supported).

**Section reorg** — added an "Info Legal" column that hosts the QR image + legal links, keeping the grid at 4 columns intact.

## Dependency

Added `qrcode@^1.5.4` to `package.json` / `bun.lock` via `bun add qrcode`. Only used in client component.

## Verification

- `bunx next build` passes (no new errors vs HEAD).
- `bunx eslint src/components/portal/layout/PortalFooter.tsx` clean.
- Pre-existing graphify-out and other session changes left untouched.

## Known limits

- QR renders as a PNG data-URL (not inline SVG paths); renders correctly in all modern browsers. If zero-moment network constraints apply, lazy-load already set.
- Social-media action (`Megaphone` tooltip) still no-ops (`action: () => {}`) — out of scope here.
- `z-ai-web-dev-sdk` warn in `chat/send/route.ts` is a pre-existing unrelated issue.