# Portal del Registro Mercantil de Cuba — Instrucciones para Agentes

Este archivo contiene las reglas, herramientas y convenciones que todo agente de IA debe seguir al trabajar en este repositorio.

---

<!-- graphify-rules-start (managed by `graphify init`) -->
## Use Graphify before grep

This repository is indexed by Graphify: a code graph over its call, dependency, and test structure, exposed through a connected Graphify MCP server. Before reaching for grep or reading files, use the Graphify tools your MCP client lists (their exact names and descriptions are in the server's tool list) for what the graph knows and a text search does not:

- find where a symbol, function, or class is defined (instead of grepping for it)
- understand how something works, or where a behavior is handled
- find who calls a function, or what it calls
- see what a change affects (its blast radius) and which tests cover it
- map a file's dependencies and dependents

Fall back to grep or file reads only for what the graph does not model: literal string or comment matches, non-indexed files, or reading a file you have already located. If no Graphify tools are listed, check the MCP server connection.

### Graphify local rules

This project has a knowledge graph at `graphify-out/` with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When `graphify-out/graph.json` exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty `graphify-out/` files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed `graphify-out/graph.json` is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
- El backend semántico usa `GRAPHIFY_BACKEND=none` por defecto en este proyecto (extracción AST pura). No intentes usar backends LLM sin confirmación del usuario.
<!-- graphify-rules-end -->

---

## Servidores MCP disponibles

Este proyecto está configurado con los siguientes servidores MCP (Model Context Protocol). Úsalos según corresponda antes de recurrir a herramientas genéricas:

### 1. Graphify (Code Graph)
- **Instalación**: `uv tool install "graphifyy[mcp]"` + `graphify install --project --platform opencode`
- **Propósito**: Grafo de conocimiento del código fuente (1534+ nodos, 5443+ aristas, 73 comunidades)
- **Cuándo usar**: Antes de `grep` o lectura de archivos para preguntas sobre arquitectura, dependencias, impacto de cambios, quién llama a qué función
- **Comandos CLI**: `graphify query`, `graphify path`, `graphify explain`, `graphify update .`
- **Nota**: Los archivos `.env.local` y sensibles están excluidos del grafo automáticamente

### 2. Context7 (Documentación de librerías)
- **Propósito**: Documentación actualizada de cualquier librería, framework o SDK
- **Cuándo usar**: Preguntas sobre Next.js, React, Prisma, Tailwind, shadcn/ui, Zod, etc. Incluye sintaxis de API, configuración, migraciones entre versiones
- **Cómo**: Vía `execute` → `tools.context7["resolve-library-id"]` y `tools.context7["query-docs"]`
- **No usar para**: Refactoring, debugging de lógica de negocio, revisión de código general

### 3. Engram (Memoria persistente)
- **Propósito**: Memoria que sobrevive entre sesiones y compactaciones
- **Herramientas core**: `mem_save`, `mem_search`, `mem_context`, `mem_session_summary`, `mem_get_observation`, `mem_current_project`
- **Regla proactiva**: Llamar `mem_save` inmediatamente después de CUALQUIER decisión, fix de bug, descubrimiento o convención — no esperar a que lo pidan
- **Resolución de conflictos**: Si `mem_save` devuelve `judgment_required: true`, iterar candidatos y resolver según heurísticas (preguntar al usuario si confianza < 0.7 o relación es supersedes/conflicts_with en decisiones de arquitectura)

### 4. gh-grep (Búsqueda en GitHub)
- **Propósito**: Encontrar ejemplos de código real en más de un millón de repositorios públicos
- **Cuándo usar**: Necesitas ver cómo otros proyectos implementan un patrón específico
- **Cómo**: Vía `execute` → `tools["gh-grep"].searchGitHub`

### 5. OpenCode (Gestión del entorno)
- **Propósito**: Gestionar sesiones, worktrees, recursos MCP y configuración de OpenCode
- **Herramientas**: `list_mcp_resources`, `session_move`, `session_rename`, `worktree_create`, `worktree_list`, `worktree_remove`

### 6. Browser (Automatización)
- **Propósito**: Abrir URLs, previsualizar archivos, automatizar navegador
- **Herramientas**: `browser.preview`, `browser.tabs.open`

### 7. Chrome DevTools MCP (Browser Testing & Security Audit)
- **Propósito**: Inspección en tiempo real del DOM, console errors, network requests, y auditoría de seguridad (CSP headers, mixed content, XSS vectors). Reemplaza `browser.preview` para debugging interactivo.
- **Instalación**: `npm install -g @modelcontextprotocol/server-chrome-devtools` + agregar al `opencode.jsonc`:
  ```jsonc
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-chrome-devtools"]
    }
  }
  ```
- **Cuándo usar**: Verificación de capa 3 (browser), debugging de CSS/layout, auditoría de seguridad en producción, detección de CSP violations, console errors.
- **Herramientas**: `browser_navigate`, `browser_snapshot`, `browser_console`, `browser_network`, `browser_security_audit`, `browser_csp_audit`

### 8. Cloudflare Security Audit
- **Propósito**: Auditoría de seguridad basada en reglas de Cloudflare (WAF, headers, SSL/TLS, DNS, rate limiting). Complementa el checklist de seguridad del AGENTS.md.
- **Instalación**: `npm install -g @cloudflare/security-audit-mcp` (o usar la skill local `security-audit-skill` desde `~/.agents/skills/`)
- **Cuándo usar**: Pre-lanzamiento, tras cambiar `next.config.ts` headers, después de deploy.

---

## Skills instaladas globalmente

Todas las skills estan en `~/.agents/skills/` (disponibles para todos los proyectos OpenCode) o cargadas como plugins en `~/.config/opencode/opencode.jsonc`.

### 1. Taste Skill (`design-taste-frontend`)
- **Fuente**: `Leonxlnx/taste-skill`
- **Uso**: Art direction anti-slop para webs. Direcciones de diseno investigadas, no-slop house style, inspector de browser real, loop look-and-fix. Para landing pages, marketing sites, dashboards, cualquier UI publica.

### 2. UI UX Pro Max (`ui-ux-pro-max`)
- **Fuente**: `nextlevelbuilder/ui-ux-pro-max-skill`
- **Uso**: Inteligencia de diseno UI/UX para web, movil y desktop. 79 estilos, 192 paletas de producto, 74 pares tipograficos, 119 guias UX, 105 iconos, 17 presets GSAP, 25 tipos de graficos, 22 stacks.

### 3. Caveman (22 sub-skills)
- **Fuente**: `juliusbrussee/caveman`
- **Skills**: `caveman`, `ultracave`, `megacave`, `cavecrew`, `caveman-commit`, `caveman-compress`, `caveman-discover`, `caveman-evidence-review`, `caveman-explore`, `caveman-help`, `caveman-learn`, `caveman-manage`, `caveman-optimize`, `caveman-review`, `caveman-setup`, `caveman-stats`, `investigate-first`, `lean-build`, `migration`, `safe-refactor`, `surgical-patch`, `verify-and-stop`
- **Uso**: Voz comprimida (menos tokens, mismos hechos). `/caveman` activa modo terso. Sub-skills para commit, review, refactor seguro, migraciones, investigacion.

### 4. Karpathy Guidelines (`karpathy-guidelines`)
- **Fuente**: `swarmclawai/andrej-karpathy-skills`
- **Uso**: Reglas de comportamiento para reducir errores comunes de LLMs al codificar. Evitar sobrecomplicacion, cambios quirurgicos, surfear asunciones, criterios verificables.

### 5. Matt Pocock Skills (38+ skills)
- **Fuente**: `mattpocock/skills`
- **Skills clave**: `ask-matt`, `chief-of-staff`, `grill-me`, `grill-with-docs`, `handoff`, `implement`, `implement-spec`, `improve-codebase-architecture`, `init`, `loop-me`, `retro`, `setup-ts-deep-modules`, `teach`, `to-questionnaire`, `to-spec`, `to-tickets`, `triage`, `wait-what`, `wayfinder`, `writing-beats`, `writing-fragments`, `writing-shape`
- **Uso**: Skills de ingenieria real -- planificacion, specs, tickets, refactoring, deep modules TypeScript, handoffs entre agentes.

### 6. Anthropic Skills (19+ skills)
- **Fuente**: `anthropics/skills` (clonado a `~/.agents/vendor/cybersecurity-skills/` como vendor dir con lazy-loading)
- **Skills**: `academy-guide`, `algorithmic-art`, `brand-guidelines`, `canvas-design`, `claude-api`, `discernment-nudge`, `doc-coauthoring`, `docx`, `frontend-design`, `internal-comms`, `mcp-builder`, `pdf`, `pptx`, `skill-creator`, `slack-gif-creator`, `theme-factory`, `web-artifacts-builder`, `webapp-testing`, `xlsx`
- **Uso**: Suite oficial de Anthropic -- documentos Word/PDF/PPTX/Excel, artefactos web, testing, diseño de marca, creación de MCP servers.

### 7. Skills de Seguridad Globales (30+ skills)
- **Fuente**: Instaladas globalmente en `~/.agents/skills/` desde opencodeskills.dev y repositorios oficiales
- **Lista de skills disponibles**:
  - `security-hardening`, `insecure-defaults`, `timing-analysis`, `differential-review`, `smart-contract-security`, `pentest-methodology`, `secrets-management`, `supply-chain-security`, `api-security`, `container-security`, `oauth-oidc`, `audit-logging`, `ssrf-prevention`, `password-security`, `xss-prevention`, `prompt-injection`, `encryption`, `dast-zap`, `csrf-protection`, `sql-injection`, `two-factor-auth`, `passkeys-webauthn`, `rbac-authorization`, `cors-configuration`, `content-security-policy`, `owasp-top-10`, `threat-modeling`, `jwt-handling`
  - `cloudflare-security-audit` (skill local en `~/.agents/skills/`)
  - `nvidia-skill-spector` (skill local en `~/.agents/skills/`)
- **Uso**: Skills de seguridad para auditorías, hardening, prevención de vulnerabilidades y cumplimiento de estándares como OWASP Top 10, CSP, RBAC, etc.

### 8. Ponytail (6 skills + plugin)
- **Fuente**: Plugin `ponytail@git+https://github.com/DietrichGebert/ponytail.git` en opencode.jsonc + skills copiadas a `~/.agents/skills/`
- **Skills**: `ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review`
- **Uso**: Modo senior perezoso -- minimo codigo que resuelve el problema completo. Niveles: lite, full, ultra. Audit de repo, tracking de deuda tecnica, review de calidad.

### 8. Superpowers (plugin)
- **Fuente**: Plugin `superpowers@git+https://github.com/obra/superpowers.git` en opencode.jsonc
- **Skills**: `brainstorming`, `diagnosing-superpowers`, `dispatching-parallel-agents`, `executing-plans`, `finishing-a-development-branch`, `receiving-code-review`, `requesting-code-review`, `subagent-driven-development`, `systematic-debugging`, `test-driven-development`, `using-git-worktrees`, `using-superpowers`, `verification-before-completion`, `writing-plans`, `writing-skills`
- **Uso**: Workflows de ingenieria completos -- brainstorming antes de crear, debugging sistematico, TDD, planes de ejecucion, parallel agents, verificacion antes de completar.

### 9. Skills locales del proyecto
| Skill | Uso |
|-------|-----|
| `code-review` | Revisar diffs, commits, rangos git |
| `cross-review` | Code review con modelo especifico |
| `opencode` | Preguntas sobre OpenCode mismo |
| `plan` | Planificacion y diseno de implementacion |
| `playwright` | Automatizacion de navegador, testing visual |
| `report` | Reportar bugs de OpenCode |
| `research` | Exploracion read-only del codebase |
| `team-handoff` | Delegar tareas entre agentes |
| `graphify` | Consultas al grafo de conocimiento |
| `tdd` | Test-driven development local |
| `setup-pre-commit` | Configurar hooks Husky + lint-staged |
| `domain-modeling` | Modelo de dominio, GLOSSARY, ADRs |
| `migrate-to-shoehorn` | Migrar asserts `as` a shoehorn |
| `git-guardrails-claude-code` | Bloquear comandos git peligrosos |
| `scaffold-exercises` | Crear estructuras de ejercicios |
| `wizard` | Wizards interactivos para provisioning |
| `writing-for-agents` | Escribir docs para agentes |
| `prototype` | Prototipos desechables de diseno |
| `diagnosing-bugs` | Loop de diagnostico para bugs dificiles |
| `using-superpowers` | Regla de invocación de skills antes de cualquier acción |


---

## Convenciones del proyecto

### Arquitectura
- **Framework**: Next.js 16 con App Router (`src/app/`)
- **Rutas públicas**: `src/app/portal/`
- **Portal + CMS unificados en `src/app/page.tsx`**: El login CMS redirige automáticamente a `CmsLayout`; el portal se renderiza cuando no hay sesión activa
- **API Routes**: `src/app/api/` (auth, cms, chat, public, search, upload, stats, payment, blocks, pages, menus, bot-config)
- **Path alias**: `@/*` → `./src/*`
- **Sin middleware.ts**: La autenticación se verifica en cada ruta API con `requireAuth()` / `requireAdmin()` desde `src/lib/api-auth.ts`

### Componentes
- Usar `'use client'` solo en componentes con hooks o interactividad
- Preferir Server Components por defecto
- Componentes UI en `src/components/ui/` (shadcn/ui)
- Componentes CMS en `src/components/cms/`
- Componentes portal en `src/components/portal/` (layout/ + sections/)

### Estilos
- Tailwind CSS v4 utility-first
- Paleta MINJUS (oficial): `#005A9C`, `#0074C8`, `#FFFFFF`, `#F2F4F7`, `#6B7280`, `#1F2937`
- Paleta legacy (mate/elegante): Negro Suave `#1A1A1A`, Beige Sólido `#EDE0D4`, Terracota `#9E3A2E`
- Regla de contraste: Beige/gold NUNCA sobre fondos claros. Terracota sobre fondos claros.
- Clases custom en `globals.css`: `glass-card`, `multicolor-stripe`, `gradient-text-primary`
- Cumplimiento obligatorio WCAG 2.1 AA
- Logo del sitio: 180px × 40px | Slider portada: imágenes apaisadas 2500px × 540px

### API
- Formato de respuesta estándar: `{ success: true/false, data: ..., error: ... }`
- Autenticación JWT en cookie `rmc-token` (expira 8h)
- Middleware `requireAuth()` y `requireAdmin()` en rutas CMS
- Validación de entrada con Zod cuando aplique

### Base de datos
- ORM: Prisma con PostgreSQL (producción) / SQLite (desarrollo)
- Singleton de DB: `src/lib/db.ts`
- Migraciones automáticas antes de dev/build/start vía `scripts/run-migrations.js`
- Seed: `prisma/seed.ts` + `prisma/seed-guides.ts`
- URL de conexión: `postgresql://portal_rmc:PortalRMC2026!Secure@127.0.0.1:5433/registro_mercantil` (usar `127.0.0.1`, no `localhost`, para evitar resolución IPv6 en Windows → Prisma conecta por TCPv4 al contenedor Docker)
- JWT_SECRET: variable de entorno requerida (min 32 chars), configurada en `.env.local`

### Credenciales de prueba (seed)
| Email | Contraseña | Rol | Acceso |
|-------|-----------|-----|--------|
| `admin@registromercantil.cu` | `Admin2026!` | admin | CMS completo |
| `editor@registromercantil.cu` | `Editor2026!` | editor | CMS limitado |

- Login: POST a `/api/auth/login` con body `{email, password}` → setea cookie `rmc-token` (JWT, 8h)
- Todas las rutas CMS (`/api/cms/*`) validan la cookie con `requireAuth()` / `requireAdmin()`
- El portal público lee de `/api/public/content` (sin auth, datos en tiempo real desde DB)

### Sync CMS → Portal
- **Mecanismo**: CMS edita → Prisma escribe a PostgreSQL → Portal lee de `/api/public/content` en cada request
- **Tiempo de propagación**: Inmediato (no hay caché, cada request del portal consulta la DB directamente)
- **Flujo**: Usuario admin → login → CmsLayout → CRUD en `/api/cms/*` → cambios visibles en portal al recargar
- **Sin cache invalidation**: No se requiere ningún mecanismo de limpieza de caché

### Fetching en cliente
- Usar `fetch` con `credentials: 'include'` para cookies
- TanStack Query para caché y fetching en portal

---

## OpenSpec — Especificaciones (OBLIGATORIO)

**Regla de oro**: Cualquier cambio en una especificación ( crear, actualizar, eliminar, archivar) DEBE gestionarse con OpenSpec. No hay excepciones.

### Comandos básicos

| Comando | Cuándo usar |
|---------|-------------|
| `openspec new change "<nombre>"` | Crear un nuevo cambio de especificación (nombre en kebab-case) |
| `openspec status --change "<nombre>"` | Ver estado de los artefactos del cambio |
| `openspec instructions <artifact> --change "<nombre>" --json` | Obtener instrucciones para crear un artefacto |
| `openspec archive --change "<nombre>"` | Archivar un cambio completado y fusionarlo a las especificaciones principales |
| `openspec list --specs` | Listar todas las especificaciones existentes |
| `openspec validate --change "<nombre>"` | Validar que un cambio cumple con el schema |

### Flujo obligatorio

1. **Antes de cambiar una especificación**: `openspec new change "<kebab-case-name>"` → crear proposal → design → specs → tasks
2. **Durante el trabajo**: `openspec status` para verificar progreso
3. **Al terminar la implementación**: Ejecutar `openspec archive --change "<nombre>"` para fusionar las especificaciones
4. **Siempre**: Usar OpenSpec como se usa git para commits — cada cambio de especificación es un "commit" de especificación

### Artefactos requeridos (spec-driven schema)

- `proposal.md` — Qué y por qué
- `design.md` — Cómo (si aplica a arquitectura/patrones cross-cutting)
- `specs/<capability>/spec.md` — Requisitos con scenarios WHEN/THEN
- `tasks.md` — Lista de tareas con checkboxes `- [ ]`

### Instalación

```bash
npm install -g openspec-extensions
openspec init
```

---

## Seguridad — Next.js + Node.js + PostgreSQL (2026)

### 1. Versiones y CVEs (CRÍTICO)
- **PRIO #1 — URGENTE**: Proyecto tiene **5 Critical CVEs**. Ejecutar inmediatamente:
  ```bash
  bun upgrade next@16.4.1 next-auth@4.24.15 sharp@0.35.5
  ```
  Vulnerabilidades críticas actuales:
  - `next@16.1.3`: RCE vía SVG/AVIF en Image Optimization (CVE-2026-96889, GHSA-2xp9-vwfh-vxw4), RCE en `use cache` typed arrays (GHSA-673q-mjm6-r5xr), RCE Windows-hosted (GHSA-p293-qw3h-jr36)
  - `next-auth@4.24.13`: Homoglyph @ bypass en normalizador de email (GHSA-7rqj-j65f-68wh)
- **Next.js**: Mantener >= 16.4.1 (o 15.5.28 en línea 15.x). Revisar mensualmente el blog oficial de Next.js por releases de seguridad.
- **React/ReactDOM**: Si se actualiza Next.js, actualizar también ambas dependencias.
- **Sharp/libheif**: Actualizar a >= 0.35.5; CVE-2026-94545 permite RCE vía SVG malicioso en image optimization.
- **Comando de verificación**: `bun audit --prod` (o `pnpm audit --prod`). Revisar antes de cada deploy.
- **Rotación de secretos**: Tras cualquier RCE no parcheado en producción, rotar `JWT_SECRET`, credenciales de DB y claves de proveedores.

### 2. Autenticación y Autorización
- **No usar proxy.ts como única capa de auth**: Es solo para redirecciones optimistas. Verificar sesión en cada Route Handler y Server Action.
- **Patrón DAL (Data Access Layer)**: Módulos marcados con `import "server-only"` que ejecutan autorización antes de acceder a datos. Devolver DTOs, no filas crudas.
- **JWT**: `rmc-token` en cookie `httpOnly`, secure en producción, sameSite lax, maxAge 8h. Rotar `JWT_SECRET` periódicamente (mínimo 32 chars aleatorios).
- **Rate limiting**: Implementar en endpoints sensibles (login, búsqueda masiva) con memoria compartida para serverless.

### 3. Validación de Entrada
- **Zod en TODA la entrada**: Route Handlers, Server Actions, params, searchParams. Nunca confiar en tipos TypeScript como validación.
- **Esquemas centralizados**: `src/lib/cms-schemas.ts` → mapa `CMS_SCHEMAS` usado por `src/lib/cms-handler.ts`.
- **Sanitización XSS**: Usar `dangerouslySetInnerHTML` solo con DOMPurify (o similar) en contenido generado por usuario.
- **HTML seguro en portal**: Todo el contenido CMS se renderiza como markdown/HTML desde el editor; sanitizar antes de mostrar.

### 4. Content Security Policy (CSP)
- **Nonce dinámico**: Generar en `proxy.ts` con `crypto.randomUUID()` y pasar vía header `x-nonce`. Aplicar a `script-src` y `style-src`.
- **'unsafe-inline' solo en dev**: En producción, usar nonces o hashes SRI (experimental).
- **Modo report-only inicial**: Activar `Content-Security-Policy-Report-Only` en despliegue inicial para detectar bloqueos sin romper la app.
- **Headers adicionales** (en `next.config.ts`):
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `X-Frame-Options: DENY`

### 5. PostgreSQL
- **Prisma parametrizado**: Siempre usar consultas parametrizadas (ya lo hace Prisma por defecto). Nunca interpolación SQL directa.
- **RLS (Row-Level Security)**: Habilitar en tablas multi-tenant cuando aplique. Definir políticas por rol (`admin`, `editor`).
- **Roles separados**: Crear roles DB para lectura, escritura y admin. No usar el superusuario para la app.
- **TLS en producción**: Forzar `sslmode=require` en la string de conexión.

### 6. Image Optimizer y SSRF
- **`remotePatterns` estricto**: Solo hosts que controlamos. Evitar wildcards amplios.
- **`dangerouslyAllowLocalIP: off`** (default en Next.js 16)
- **`dangerouslyAllowSVG: off`** a menos que se tenga CSP estable y contenido sanitizado.
- **Rewrites/redirects nunca desde input del request**: Usar valores estáticos o de configuración.

### 7. Dependencias y Supply Chain
- **Lockfile**: Commit `package-lock.json` o `bun.lockb`. Instalación con `--frozen-lockfile` en CI.
- **Automatizar**: Renovate o Dependabot para PRs de parche. Auto-merge de `next`, `react`, `react-dom` cuando tests pasen.
- **Audit en CI**: `bun audit --prod` con fallback a `pnpm audit`. Fail on high/critical.
- **Monitorear**: CVEs de dependencias transitivas (libheif, satori, sharp son vectores conocidos 2025-2026).

### 8. Checklist pre-lanzamiento
1. `pnpm why next` muestra versión parcheada contra CVEs conocidos.
2. Ningún secreto tiene prefijo `NEXT_PUBLIC_`.
3. Secrets de producción en el host, no en `.env` comprometido.
4. Grep por `"use server"` y `route.ts`: cada acción/handler valida input y verifica sesión.
5. Eliminación mental de `proxy.ts` → ninguna ruta quedaría accesible sin login.
6. `trustedOrigins`, `allowedOrigins` y `redirectTo` solo permiten hosts propios.
7. `curl -I https://tu-dominio.com` muestra HSTS, nosniff, Referrer-Policy y CSP.
8. `remotePatterns` es estrecho, uploads con límites de contenido-tipo y tamaño, webhooks verifican firma.

### 9. Limitaciones conocidas del entorno actual
- **Browser automation**: La herramienta `browser.fill` requiere refs de snapshot, no selects CSS. React controlled components no responden a cambios directos de DOM; usar `browser.evaluate` con scripts que modifiquen `element.value` directamente.
- **Screenshots**: Requieren ventana del desktop visible; si falla, usar `browser.preview` en su lugar.
- **proxy.ts vs middleware.ts**: Next.js 16 renombró el archivo; verificar convención en uso antes de agregar nueva lógica.
- **Prisma `postgresql://` patch (P2 — deuda técnica)**:
  - **Problema**: Turbopack en Windows rechaza URLs `postgresql://` (expecta `postgres://`).
  - **Workaround**: Patch manual a `node_modules/@prisma/client/runtime/library.js` (reemplaza detección de protocolo en `isDirectDb`).
  - **Riesgo**: Se pierde en reinstall de dependencias (`bun install`, `npm install`).
  - **Fix permanente**: El script `scripts/postinstall-patch-prisma.js` existe pero **NO** está registrado en `package.json` (no hay hook `postinstall`), así que no se ejecuta automáticamente. Para aplicarse en cada install, agregar `"postinstall": "node scripts/postinstall-patch-prisma.js"` al bloque `scripts` de `package.json`. Alternativa: migrar DATABASE_URL a `postgres://`.
  - **Script de recuperación**: `node scripts/postinstall-patch-prisma.js` tras cada `bun install`.

---

## Estado de Seguridad — Actualizado 2026-10-27 (upgrade Next.js 16.4.3)

### Fixes aplicados en esta sesión
| Fix | Antes | Después | Impacto |
|-----|-------|---------|---------|
| `X-XSS-Protection` header | Presente (deprecated) | Eliminado | Bajo — MDN lo desaconseja, CSP lo reemplaza |
| `Strict-Transport-Security` | Ausente | `max-age=63072000; includeSubDomains; preload` | Alto — fuerza HTTPS |
| `dangerouslyAllowSVG` en images | No configurado | `false` | Alto — bloquea RCE CVE-2026-96889 vía SVG |
| `poweredByHeader` | `true` (default) | `false` | Bajo — evita fuiteo de versión Next.js |
| `serverActions.allowedOrigins` | No configurado | Lista de origins permitidos | Medio — restricción CSRF Server Actions |
| Rate limiting en login CMS | No existente | 5 intentos/60s por IP | Alto — previene brute force |
| Rate limiting en login Portal | No existente | 5 intentos/60s por IP | Alto — previene brute force |
| Upgrade `next` | 16.1.3 | **16.4.3** | Crítico — 5 CVEs RCE eliminados |
| Upgrade `next-auth` | 4.24.13 | **4.24.15** | Crítico — homoglyph bypass eliminado |
| Upgrade `sharp` | 0.34.5 | **0.35.5** | Alto — CVEs libheif/libvips eliminados |
| `isomorphic-dompurify` + sanitización chatbot | No existente | **3 sitios con DOMPurify.sanitize()** | Alto — previene XSS LLM output |
| Postinstall Prisma patch hook | No registrado | `"postinstall": "node scripts/postinstall-patch-prisma.js"` | Medio — parche survive reinstalls |

**Segundos menores seguros actualizados**: react 19.3.1, typescript 5.9.3, tailwindcss 4.3.3, zod 4.6.7, @tanstack/react-query 5.105.0, next-intl 4.14.9, react-hook-form 7.91.0, sonner 2.0.8, zustand 5.0.16, eslint 9.39.2, bun-types 1.4.4, y 10+ más. Commit `c06d0c5`.

### Pendientes para futura implementación
- **CSP con nonces**: Requiere `proxy.ts` + pasar nonce a componentes. Compatible con App Router.
- **HSTS preload**: Solo aplicar cuando el dominio tenga SSL activo y todos los subdominios respondan HTTPS.
- **Node ≥24.15**: `isomorphic-dompurify@4.6.0` exige esta versión; actualmente en 24.14.1 (warning EBADENGINE, funciona pero conviene actualizar).

### Resumen de vulnerabilidades post-audit
```
Antes: 76 vulnerabilidades (5 critical, 34 high, 32 moderate, 5 low)
Después: 21 vulnerabilidades (0 critical, 10 high, 10 moderate, 1 low)
```

Todas las restantes son de dependencias transitivas/de desarrollo (eslint, prismjs, picomatch, postcss) que no afectan la superficie de ataque en producción.

###_CAPTCHA v2 + Guardian Trace Analysis_ (2026-10-27)

| Feature | Detalle |
|---------|---------|
| **CAPTCHA alfanumérico** | 5-6 caracteres (sin 0/O/1/l/I), rotación ±20°, tamaño variable, colores HSL aleatorios |
| **Ruido SVG** | 8-14 líneas, ondas sinusoidales, 20-40 puntos, arcos punteados |
| **Anti-replay** | Single-use tokens, TTL 5 min, mapa in-memory con sweep |
| **Guardian trace analyzer** | Per-IP profiling (score 0-100), detecta: rapid_requests, captcha_farming, brute_force, anomalous_ua |
| **Tiers** | normal (<40) → warning (40-69) → throttle (70-89) → block (≥90) |
| **Local dev skip** | `::ffff:127.0.0.1`, `127.0.0.1`, `::1`, `localhost`, `unknown` → score 0 |
| **Admin endpoint** | `GET /api/cms/guardian` (requiere admin) — lista perfiles por score |
| **Integración** | Captcha y login usan guardian; inquiries route también |


---

## Flujo de trabajo recomendado para agentes

1. **Al iniciar sesión**: Llamar `mem_current_project()` y `mem_context()` para cargar contexto previo
2. **Antes de explorar código**: Usar Graphify (`graphify query`) para entender la estructura
3. **Para dudas de librerías**: Consultar Context7 antes de asumir comportamiento
4. **Después de cada decisión/fix**: Guardar en Engram con `mem_save`
5. **Después de modificar código**: Ejecutar `graphify update .` para mantener el grafo actualizado
6. **Al terminar sesión**: Llamar `mem_session_summary` con resumen del trabajo realizado

---

## Regla de verificación triple (obligatoria)

**NUNCA** declares un cambio como terminado sin verificarlo en estas tres capas, en este orden:

| Capa | Qué hacer | Cómo |
|------|-----------|------|
| **1. Código** | Validar que el código compila y no tiene errores de tipo | `curl` a la ruta afectada + revisar logs de dev server (`Get-Content $env:TEMP\rmc-dev.log \| Select-String "error|Error|Compiled"`) |
| **2. Tests unitarios** | Ejecutar tests relevantes y confirmar 0 fails | `bun test <ruta-del-test>` — 0 fails es requisito mínimo |
| **3. Navegador** | Abrir la página en el browser y verificar visualmente | `tools.browser.navigate` al URL afectado; si hay sección nueva, navegar a esa sección desde el menú |

Si alguna capa falla, el cambio NO está terminado. No se omite ninguna capa, incluso si el cambio parece trivial.

---

## Lecciones aprendidas

### CSP + Next.js App Router (crítico)
- **Problema**: Spinner infinito aunque todos los JS chunks dan HTTP 200.
- **Causa raíz**: CSP `script-src` sin `'unsafe-inline'` bloquea scripts inline de Next.js (`$RC`, `__next_f.push`) que revelan contenido SSR oculto en `<div hidden id="S:1">`.
- **Fix**: Agregar `'unsafe-inline'` a `script-src` en `next.config.ts`. También `connect-src 'self'`.
- **dynamic() imports**: Usar `ssr: true` (no `false`) en `src/app/page.tsx` para evitar BAILOUT_TO_CLIENT_SIDE_RENDERING.
- **Verificación**: curl post-fix aún puede mostrar spinner porque no ejecuta JS; confirmar siempre con browser real (screenshot + console errors).

### Docker + Bun
- Capas cacheadas: deps separados de build. Reconstrucción ~30-60s solo builder+runner.
- CMD usa `;` entre prisma db push, seed y server.js (no `&&`) para que fallo de seed no bloquee servidor.
- Stack: app:3003, postgres:5433, traefik:8082.

### Normativa legal
- Toda actualización de datos normativos/legales en el portal debe indicar la fuente (decreto o ley).
- Decreto-Ley 226 "Del Registro Mercantil" concordado (GOC-2021-690-ES4) es la norma base.
- Nuevas normas: Decreto Ley 133 y 120 del 2026 — agregar anuncio resumen explicando qué es nuevo, qué se elimina/modifica.

### Paleta MINJUS vs legacy
- La paleta legacy (negro `#1A1A1A`, terracota `#9E3A2E`, beige `#EDE0D4`) fue reemplazada por variables CSS MINJUS (`--rm-primary`, `--rm-text`, etc.) definidas en `globals.css`.
- Todos los componentes portal deben usar `var(--rm-*)` exclusivamente; ningún color hex legacy debe persistir en `src/components/portal/`.
- `FEE_SCHEDULE` y `QUICK_ACCESS_CARDS` eran código muerto exportado desde `portal-data.ts` pero nunca consumido por ningún componente JSX. Eliminados sin impacto.
- `ProcedureCard.tsx` tiene su propio array `PROCEDURES` hardcodeado (duplicado de `portal-data.ts`); ambos deben actualizarse manualmente en paralelo.
- El search API acepta ahora params `province`, `type`, `status` para filtrado avanzado desde la base de datos.

### Rotación de secretos antes de publicar repo (P0 — crítico)
- **Problema**: `.env` y `.env.local` estaban trackeados en git con `POSTGRES_PASSWORD` y `JWT_SECRET` en claro. Cualquier persona con acceso al repo (o forks/historial futuro) podría autenticarse en la DB y CMS.
- **Fix aplicado**:
  1. `.gitignore` ← añade `.env`, `.env.*`, `!.env.example*` (T0.1).
  2. `git rm --cached .env .env.local` — los ficheros se quedan en disco local pero salen del árbol git (T0.2).
  3. Generar nuevos secretos con `node -e "crypto.randomBytes(32).toString('hex')"` (T0.3).
  4. Actualizar `.env` y `.env.local` localmente con los nuevos valores (T0.4).
  5. Rotar también la contraseña en el contenedor Postgres: `docker exec <pg> psql -U portal_rmc -d postgres -c "ALTER USER portal_rmc WITH PASSWORD '<nuevo>';"` (T0.5).
  6. Verificar login CMS con el nuevo `JWT_SECRET` antes de commitear (T0.5).
- **Regla**: Antes de hacer push o de publicar el repo, SIEMPRE rotar todos los secretos que hayan estado en `.env*` trackeados. Si el repo ya fue público, asume que los secretos antiguos están comprometidos y rotalos de inmediato. No uses `git filter-branch`/`BFG` para purgar mientras el repo siga siendo privado; el coste-beneficio no justifica el riesgo de corromper el árbol.
- **Verificación**: `git ls-files | Select-String "\.env"` debe devolver vacío. `Invoke-RestMethod POST /api/auth/login` con credenciales seed debe devolver `{success:true}`.

### CMS ↔ Portal unificado
- **Sin ruta separada `/cms`**: El CMS se accede desde la misma URL raíz (`/`) tras autenticarse. `page.tsx` detecta `cmsUser` y renderiza `CmsLayout`; de lo contrario muestra el portal público.
- **Auth flow**: Login → cookie `rmc-token` → `CmsLayout` con sidebar de módulos. Logout limpia cookie y restaura portal.
- **Sync en tiempo real**: `/api/public/content` consulta PostgreSQL directamente sin caché. Cualquier cambio hecho desde el CMS es visible inmediatamente al recargar el portal.
- **PowerShell prueba**: Usar `-WebSession` para mantener la cookie entre requests; `-Headers @{Cookie=...}` falla porque PowerShell no maneja cookies de sesión correctamente.
- **TaxCalculator mueve**: Desde `NormatividadSection` a `ConsultasSection` (debajo del buscador). El import en Normatividad fue eliminado.

### Enzona desactivado visualmente
- La integración con ENZONA.net (pasarela de pago) está **desactivada visualmente** hasta nuevo aviso.
- Código Enzona intacto en `src/app/auth/enzona/`, `src/app/api/auth/enzona/callback/`, `src/components/cms/cms-enzona-config.tsx` (solo admin puede configuarlo).
- En `AuthenticationModal.tsx` el botón "Autenticarse con ENZONA" y sección están presentes pero el usuario puede ignorarlos — usar login normal con email/contraseña.
- En `PortalDashboard.tsx` las rutas de fallback aún apuntan a `/auth/enzona` si no hay sesión de portal; esto se corregirá cuando Enzona esté operativo.

### Multi-dominio para despliegue
- El sitio responde en: `registro-mercantil.xetid.cu`, `https://portal-registromercantil.test.xutil.cu/`, `https://portal-registromercantil.egob.dev.xetid.cu/`
- Configuración en: `.env.local` (`PORTAL_DOMAINS`), `docker-compose.yml` (Traefik `Host()` rule), `Caddyfile`, `scripts/deploy.sh`
- `NEXT_PUBLIC_APP_URL` apunta al dominio principal; Traefik/Caddy manejan routing multi-host
- En desarrollo local: `PORTAL_DOMAINS` comentado, la app responde a cualquier Host header

### Fix botón "Autenticarse" (Oct 2026)
- **Problema**: El botón del header abría `AuthenticationModal` (endpoint `/api/portal/auth/login` para usuarios registradores) en vez de navegar a `#acceso` (login CMS `/api/auth/login`).
- **Fix**: `PortalHeader.tsx` → `handleNavClick('autenticarse')` ahora llama `onNavigate('acceso')` en vez de `setAuthModalOpen(true)`.
- **Commit**: `8e3523c`

### CMS Form Validation (Oct 2026)
- **Estructura**: `src/lib/cms-schemas.ts` → esquemas Zod por modelo + mapa `CMS_SCHEMAS`. `src/lib/cms-handler.ts` → `validateBody()` aplica esquema antes de DB. `src/lib/cms-helpers.ts` → `formatCmsToast()` y `getCharCount()`.
- **Límites**: Títulos/nombres → 255 caracteres. Descripciones/contenido → abiertos (String/TEXT sin límite). Otros campos: 50, 100, 300, 500 según modelo.
- **RichTextEditor**: `src/components/cms/RichTextEditor.tsx` usa `@mdxeditor/editor` (ya en package.json). Toolbar: headings, lists, links, quotes, bold/italic/underline, undo/redo. Reemplaza Textarea en: servicios, noticias (contenido), trámites (descripción+requisitos), normativas (descripción+contenido), FAQs (respuestas), tutoriales (descripción), webinars (descripción), páginas (contenido), guías (descripción), bloques (contenido), guías pasos.
- **Toasts**: `formatCmsToast(model, name, action)` → `Slider 'Bienvenida' creado correctamente`. Nunca usar messages genéricos.
- **Validación server-side**: Las rutas custom (user-roles, portal-users) importan y aplican sus esquemas directamente.
- **MDXEditor plugins**: `headingsPlugin({headingLevels: [2,3,4]})`, `listsPlugin()`, `linkPlugin()`, `quotePlugin()`, `toolbarPlugin()` con `UndoRedo`, `BoldItalicUnderlineToggles`, `BlockTypeSelect`. No usar `boldItalicPlugin` (no existe en v3.39.1).
- **OpenSpec**: Instalado `openspec-extensions` globalmente. Cambio `cms-validation-improvements` en `openspec/changes/`. Comandos: `openspec new change`, `openspec status`, `openspec instructions <artifact>`, `openspec archive`.

---

## Archivos de referencia

| Archivo | Propósito |
|---------|-----------|
| `README.md` | Documentación general del proyecto |
| `constitution.md` | Principios constitucionales inmutables |
| `PROJECT_INDEX.md` | Índice detallado de arquitectura |
| `PRONT_HELP.md` | Guía completa para desarrolladores |
| `worklog.md` | Historial de tareas realizadas |
| `docs/security-review.md` | Revisión de seguridad |
| `prisma/schema.prisma` | Esquema de base de datos (20 modelos) |

</content>

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
