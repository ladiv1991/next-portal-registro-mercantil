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

### 6. Anthropic Skills (19 skills)
- **Fuente**: `anthropics/skills` (clonado manualmente a `~/.agents/skills/`)
- **Skills**: `academy-guide`, `algorithmic-art`, `brand-guidelines`, `canvas-design`, `claude-api`, `discernment-nudge`, `doc-coauthoring`, `docx`, `frontend-design`, `internal-comms`, `mcp-builder`, `pdf`, `pptx`, `skill-creator`, `slack-gif-creator`, `theme-factory`, `web-artifacts-builder`, `webapp-testing`, `xlsx`
- **Uso**: Suite oficial de Anthropic -- documentos Word/PDF/PPTX/Excel, artefactos web, testing, diseno de marca, creacion de MCP servers.

### 7. Ponytail (6 skills + plugin)
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


---

## Convenciones del proyecto

### Arquitectura
- **Framework**: Next.js 16 con App Router (`src/app/`)
- **Rutas públicas**: `src/app/portal/`
- **Rutas CMS**: `src/app/cms/` (requieren autenticación)
- **API Routes**: `src/app/api/` (auth, cms, chat, public, search, upload, stats, payment, blocks, pages, menus, bot-config)
- **Path alias**: `@/*` → `./src/*`

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

### Fetching en cliente
- Usar `fetch` con `credentials: 'include'` para cookies
- TanStack Query para caché y fetching en portal

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