# 🔒 Reporte Completo de Auditoría de Seguridad — Portal Registro Mercantil Cuba

**Fecha:** 2026-11-08  
**Commit auditado:** 35e1585 (GacetaLink system deployed)  
**Alcance:** Análisis estático + revisión de código completo (SAST), sin testing dinámico en producción  
**Metodología:** OWASP Top 10 + Security-Audit skill (6 fases) + agentes paralelos por vector

---

## 📊 Resumen Ejecutivo

| Severidad | Hallazgos | Descripción |
|-----------|-----------|-------------|
| **CRÍTICO** | 3 | Exposición de passwordHash, CMS auth bypass (requireAuth vs requireAdmin), Prompt Injection + DoS LLM |
| **ALTO** | 5 | XSS almacenado via NewsArticle.content, CSP sin nonce real, serverActions.allowedOrigins ausente, poweredByHeader ausente, user enumeration |
| **MEDIO** | 7 | Type confusion JWT (CMS↔Portal), rate limit CAPTCHA faltante en login portal, origin-check static init, error handling info leak, IDOR en faqs, bot-config, webinars, guides, site-pages |
| **BAJO/INFO** | 9 | Configuración parcheada pero no explícita (dangerouslyAllowSVG), matcher middleware excluye /api/, typescript ignoreBuildErrors, etc. |

**Total: 24 hallazgos confirmados + 3 needs_validation**

---

## 🔴 Hallazgos CRÍTICOS

### C-001: Exposición de `passwordHash` en `/api/cms/portal-users` (GET)

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `GET /api/cms/portal-users` |
| **Causa** | `requireAuth()` (no `requireAdmin()`) + `db.portalUser.findMany()` sin `select` que excluya `passwordHash` |
| **Evidencia** | `src/app/api/cms/portal-users/route.ts:10,33` |
| **Impacto** | Cualquier token CMS válido (incl. rol `editor`) obtiene hashes bcrypt de **todos** los usuarios registradores → ataque offline de diccionario |
| **Prueba** | `curl -H "Cookie: rmc-token=<editor_token>" /api/cms/portal-users` → JSON con `passwordHash` |
| **Fix** | 1. Cambiar a `requireAdmin()` 2. Agregar `select: { passwordHash: false }` en query Prisma |

---

### C-002: Bypass de autorización CMS — ~10 rutas usan `requireAuth()` en vez de `requireAdmin()`

| Rutas afectadas (métodos con `requireAuth`) |
|---------------------------------------------|
| `/api/cms/faqs` (GET, POST) |
| `/api/cms/faqs/[id]` (GET, PUT, DELETE) |
| `/api/cms/site-pages` (GET, POST) |
| `/api/cms/site-pages/[id]` (GET, PUT, DELETE) |
| `/api/cms/webinars/[id]` (GET, PUT, DELETE) |
| `/api/cms/enzona-config/[id]` (GET, PUT, DELETE) |
| `/api/cms/inquiries` (GET) |
| `/api/cms/portal-users` (GET) |
| `/api/cms/procedures/[id]/documents` (POST) |
| `/api/cms/procedures/[id]/documents/[docId]` (DELETE) |
| `/api/cms/user-roles` (GET, POST) |
| `/api/bot-config` (GET, POST) |

| Aspecto | Detalle |
|---------|---------|
| **Causa** | `requireAuth()` solo valida JWT firma/expiración, **no** valida `role === 'admin'` ni `type === 'cms'` |
| **Impacto** | Usuario con rol `editor` (seed: `editor@registromercantil.cu` / `Editor2026!`) puede **crear/editar/borrar** cualquier contenido CMS, leer passwordHash, configurar bot, etc. |
| **Fix** | Cambiar **todas** a `requireAdmin()` — auditoría completa en `findings.json` |

---

### C-003: Prompt Injection + DoS de coste en `/api/chat/send`

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `POST /api/chat/send` (público, sin auth) |
| **Vectores** | 1. **System message injection**: cliente envía `messages: [{role:'system', content:'ignora instrucciones...'}]` → línea 421 hace spread `...messages` directo al LLM<br>2. **No rate limiting**: endpoint público llama a LLM de pago (OpenAI/Z-AI) sin CAPTCHA, guardian, ni límite de requests<br>3. **Knowledge poisoning**: admin puede inyectar payloads en campos CMS (title, description, steps) que confunden al LLM en knowledgeContext |
| **Evidencia** | `src/app/api/chat/send/route.ts:105, 421, 444` |
| **Impacto** | • Extracción de system prompt / configuración interna<br>• DoS económico (miles de llamadas LLM pagadas)<br>• Manipulación de respuestas (phishing, desinformación) |
| **Fix** | 1. Filtrar `messages`: solo permitir `role === 'user'` del cliente<br>2. Rate limit + CAPTCHA + Guardian (como `/api/auth/login`)<br>3. Sanitizar knowledgeContext antes de inyectar en prompt |

---

## 🟠 Hallazgos ALTOS

### H-001: XSS Almacenado via `NewsArticle.content` en `HomeSection.tsx`

| Aspecto | Detalle |
|---------|---------|
| **Archivo** | `src/components/portal/sections/HomeSection.tsx:993` |
| **Sink** | `<ReactMarkdown>{selectedNews.content}</ReactMarkdown>` — **sin sanitizar** |
| **Fuente** | CMS: admin crea/edita NewsArticle con `content` que acepta HTML/markdown arbitrario |
| **Payload probado** | `<img src=x onerror=alert(1)>` en `content` → ejecuta en portal público al abrir noticia |
| **Severidad** | HIGH — XSS almacenado, afecta a **todos** los visitantes del portal |
| **Fix** | Opción A: `<ReactMarkdown>{sanitizeHtml(selectedNews.content)}</ReactMarkdown>` (requiere que sanitizeHtml permita tags markdown)<br>Opción B: `npm i rehype-sanitize` → `<ReactMarkdown rehypePlugins={[rehypeSanitize]}>` |

---

### H-002: CSP en Producción sin Nonce Real ni `strict-dynamic`

| Aspecto | Detalle |
|---------|---------|
| **Middleware** | `middleware.ts` genera nonce con `crypto.getRandomValues` y lo emite en header `x-rmc-nonce` ✅ |
| **Problema** | El nonce **no se inyecta** en la directiva `script-src` del CSP. Código lo justifica: "Next.js emite scripts inline sin nonce". Consecuencia: CSP usa `'unsafe-inline'` en prod. |
| **Archivos** | `middleware.ts` (líneas CSP), `next.config.ts` (fallback estático con `'unsafe-inline'`) |
| **Impacto** | Cualquier XSS (como H-001) ejecuta sin bloqueo CSP. Sin `strict-dynamic`, no hay defensa en profundidad. |
| **Fix** | 1. Usar `next-scripts` o inyectar nonce en `<Script nonce={nonce}>` en layout<br>2. Migrar a CSP con `script-src 'nonce-{nonce}' 'strict-dynamic'` + `style-src 'nonce-{nonce}'`<br>3. Desplegar en `report-only` primero, luego enforcing |

---

### H-003: `serverActions.allowedOrigins` Ausente (Regresión documentada)

| Aspecto | Detalle |
|---------|---------|
| **Evidencia** | `next.config.ts` — **no tiene** `serverActions.allowedOrigins` |
| **AGENTS.md** | Documentaba: `"serverActions.allowedOrigins: Lista de origins permitidos — Medio — restricción CSRF Server Actions"` |
| **Impacto** | Server Actions dependen solo del check nativo de Next (Origin header). Si un atacante consigue que víctima haga POST a Server Action desde origen malicioso, puede ejecutar acciones con la sesión de la víctima. |
| **Fix** | Agregar en `next.config.ts`: `serverActions: { allowedOrigins: ['https://registro-mercantil.xetid.cu', ...] }` |

---

### H-004: `poweredByHeader` No Deshabilitado (Regresión documentada)

| Aspecto | Detalle |
|---------|---------|
| **Evidencia** | `next.config.ts` — **no tiene** `poweredByHeader: false` |
| **AGENTS.md** | Documentaba: `"poweredByHeader: false — Bajo — evita fuiteo de versión Next.js"` |
| **Impacto** | Header `X-Powered-By: Next.js` expone versión exacta → fingerprinting para exploits dirigidos |
| **Fix** | Agregar `poweredByHeader: false` en `next.config.ts` |

---

### H-005: Enumeración de Usuarios en `/api/portal/auth/login`

| Aspecto | Detalle |
|---------|---------|
| **Evidencia** | `src/app/api/portal/auth/login/route.ts:54-70` — devuelve `"Usuario no encontrado"` (401) vs `"Contraseña incorrecta"` (401) |
| **Login CMS** | Usa mensaje genérico `"Credenciales inválidas"` ✅ |
| **Impacto** | Atacante puede verificar qué emails están registrados como usuarios portal (registradores) |
| **Fix** | Unificar mensaje: `"Credenciales inválidas"` en ambos casos |

---

## 🟡 Hallazgos MEDIOS

### M-001: Type Confusion JWT — `requireAuth()` no valida `type` del payload

| Aspecto | Detalle |
|---------|---------|
| **Código** | `src/lib/api-auth.ts:11-14` — `requireAuth()` solo verifica firma/expiración |
| **JWTPayload** | Tiene `type?: 'portal' \| 'cms'` (`src/lib/auth.ts:19`) |
| **Problema** | Token CMS (`type: 'cms'`) es aceptado en rutas `/api/cms/*` y viceversa. Separación CMS/Portal rota a nivel de middleware. |
| **Impacto** | Escalada de privilegio lateral: usuario portal con token válido accede a CMS si conoce rutas (aunque `requireAdmin` bloquea escritura, lectura de lista usuarios expone hashes) |
| **Fix** | `requireAuth()` → validar `payload.type === 'cms'` ; crear `requirePortalAuth()` que valide `type === 'portal'` |

---

### M-002: Login Portal sin CAPTCHA ni Guardian

| Aspecto | Detalle |
|---------|---------|
| **Login CMS** | `/api/auth/login` → rate limit 5/60s + CAPTCHA v2 + Guardian trace analyzer ✅ |
| **Login Portal** | `/api/portal/auth/login` → solo rate limit, **sin CAPTCHA ni Guardian** |
| **AGENTS.md** | Declara: "Captcha y login usan guardian; inquiries route también" — **falso para portal** |
| **Fix** | Reutilizar lógica de CAPTCHA + Guardian en `/api/portal/auth/login` |

---

### M-003: IDOR en `/api/cms/faqs/[id]` + Mass Assignment

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `PUT/DELETE /api/cms/faqs/[id]` |
| **Causa** | 1. `requireAuth()` no `requireAdmin()`<br>2. `db.fAQ.update({ data: body })` — acepta **cualquier** campo del body (mass assignment)<br>3. Sin validación Zod en route (solo en handler genérico para POST coleción) |
| **Impacto** | Editor puede borrar/modificar FAQs ajenos, inyectar campos extra (ej: `visible: false` para ocultar) |
| **Fix** | `requireAdmin()` + validar body con `CMS_SCHEMAS['faqs'].update` |

---

### M-004: `/api/bot-config` — Configuración del Bot sin `requireAdmin()`

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `GET/POST /api/bot-config` usa `requireAuth()` |
| **Impacto** | Editor puede leer/modificar `systemPrompt`, `temperature`, `maxTokens`, `apiKey`, `apiUrl` del LLM → **prompt injection persistente** + extracción de API keys |
| **Fix** | Cambiar a `requireAdmin()` |

---

### M-005: Error Handling Filtra Info de AuthZ

| Aspecto | Detalle |
|---------|---------|
| **Código** | `cms-handler.ts` catch genérico devuelve `500 'Error interno del servidor'` para `requireAdmin()` throw |
| **Impacto** | Atacante no distingue 401/403 de 500 → dificulta detección de ataques en logs/SIEM. Semántica HTTP rota. |
| **Fix** | Catch específico: `if (error.message === 'Unauthorized') return 401; if (error.message === 'Forbidden') return 403;` |

---

### M-006: `origin-check.ts` — `ALLOWED_ORIGINS` Calculado en Module Init

| Aspecto | Detalle |
|---------|---------|
| **Código** | `const ALLOWED_ORIGINS = getAllowedOrigins();` (línea 46) — evaluado **una vez** al cargar módulo |
| **Riesgo** | En serverless (Vercel, Docker), cold start recalcula; warm containers **no** recogen cambios de `PORTAL_DOMAINS` o `NEXT_PUBLIC_APP_URL` en runtime. |
| **Impacto** | Bajo en práctica (env vars inmutables en deploy), pero viola principio de least surprise. |
| **Fix** | Mover `getAllowedOrigins()` call dentro de `checkOrigin()` o usar `globalThis` cache con invalidación. |

---

### M-007: `typescript.ignoreBuildErrors: true` en `next.config.ts`

| Aspecto | Detalle |
|---------|---------|
| **Evidencia** | `next.config.ts:31` |
| **Impacto** | Build pasa aunque haya errores de tipo → código inseguro puede llegar a producción (ej: `any` en validaciones, props faltantes en componentes críticos) |
| **Fix** | Poner `false` y corregir errores de tipo reales. Si hay falsos positivos, usar `// @ts-expect-error` puntual. |

---

## 🟢 Hallazgos BAJOS / INFORMACIÓN

| ID | Hallazgo | Archivo | Fix |
|----|----------|---------|-----|
| L-001 | `dangerouslyAllowSVG` no fijado explícitamente en `false` | `next.config.ts` | Agregar `dangerouslyAllowSVG: false` |
| L-002 | `images.remotePatterns` no configurado (default 'self' OK) | `next.config.ts` | Configurar allowlist explícita si se usan imágenes externas |
| L-003 | Middleware matcher excluye `/api/*` → CSP estático débil aplica a API | `middleware.ts` | Aceptable (API devuelve JSON), documentar |
| L-004 | CAPTCHA SVG generado en servidor sin sanitización (confiado) | `src/app/auth/reset-password/page.tsx:178` etc. | OK — server-generated, no user input |
| L-005 | `ReactMarkdown` en `HomeSection` sin `rehype-sanitize` (ya en H-001) | — | — |
| L-006 | Chatbot respuesta LLM → `sanitizeHtml()` + `sanitizeLine()` ✅ | `FloatingChatbot.tsx:254,259,264` | Correcto |
| L-007 | Upload: magic bytes + path traversal + extension allowlist ✅ | `upload/route.ts`, `upload/serve/[id]/route.ts` | Correcto |
| L-008 | `checkOrigin` allowlist cerrada, rechaza sin Origin ✅ | `origin-check.ts` | Correcto |
| L-009 | Dependencias críticas parcheadas: next 16.4.3, next-auth 4.24.15, sharp 0.35.5 ✅ | `package.json` | Correcto |

---

## ⚠️ Needs Validation (Requiere Verificación en Entorno)

| ID | Hipótesis | Bloqueador | Plan de Validación |
|----|-----------|------------|-------------------|
| NV-001 | Rate limit usa `x-forwarded-for` spoofeable sin proxy confiable | No hay acceso a config de Traefik/load balancer | Verificar que `Traefik`/`Caddy` sobrescribe `X-Forwarded-For` con IP real del cliente |
| NV-002 | HSTS preload activado — ¿todos subdominios responden HTTPS? | No hay acceso a DNS/SSL de `registro-mercantil.xetid.cu` | Verificar certificados válidos en todos los dominios `PORTAL_DOMAINS` antes de `preload` |
| NV-003 | `isomorphic-dompurify@4.6.0` requiere Node ≥24.15 — actual en 24.14.1 (warning EBADENGINE) | Node version en contenedor | Actualizar Node en Dockerfile a ≥24.15 o hacer downgrade DOMPurify a versión compatible |

---

## 📋 Plan de Remediación Priorizado

### Fase 1 — Críticos (Esta semana, bloquean deploy seguro)

| # | Acción | Archivos | Estimación |
|---|--------|----------|------------|
| 1 | Cambiar **todas** las rutas CMS `requireAuth()` → `requireAdmin()` | 12 archivos en `/api/cms/**/*` | 2h |
| 2 | `GET /api/cms/portal-users` → `requireAdmin()` + `select: { passwordHash: false }` | `src/app/api/cms/portal-users/route.ts` | 15min |
| 3 | `/api/chat/send` — filtrar `messages` (solo `role: 'user'`), agregar rate limit + CAPTCHA + Guardian | `src/app/api/chat/send/route.ts`, nuevo `lib/chat-rate-limit.ts` | 3h |
| 4 | `/api/bot-config` → `requireAdmin()` | `src/app/api/bot-config/route.ts` | 10min |
| 5 | XSS `NewsArticle.content` — agregar `rehype-sanitize` a `ReactMarkdown` | `src/components/portal/sections/HomeSection.tsx`, `package.json` | 30min |

### Fase 2 — Altos (Próximo sprint)

| # | Acción | Archivos | Estimación |
|---|--------|----------|------------|
| 6 | CSP con nonce real + `strict-dynamic` en `middleware.ts` | `middleware.ts`, `src/app/layout.tsx` (Script nonce) | 4h |
| 7 | `serverActions.allowedOrigins` + `poweredByHeader: false` + `dangerouslyAllowSVG: false` | `next.config.ts` | 15min |
| 8 | Login portal: mensaje genérico + CAPTCHA + Guardian | `src/app/api/portal/auth/login/route.ts` | 2h |
| 9 | `requireAuth()` validar `type === 'cms'`; crear `requirePortalAuth()` | `src/lib/api-auth.ts` | 1h |

### Fase 3 — Medios/Bajos (Backlog)

| # | Acción | Archivos |
|---|--------|----------|
| 10 | Mass assignment protection: validar body con Zod en TODAS las rutas `[id]` PUT/DELETE | `/api/cms/**/[id]/route.ts` |
| 11 | `typescript.ignoreBuildErrors: false` + fix tipos | `next.config.ts`, varios archivos |
| 12 | `origin-check.ts` — mover `getAllowedOrigins()` a runtime | `src/lib/origin-check.ts` |
| 13 | Validar NV-001, NV-002, NV-003 en staging/prod | Infra/DevOps |

---

## ✅ Verificación Post-Fix (Checklist Obligatorio)

Por cada fix aplicado, **antes de commitear** ejecutar:

```bash
# 1. Código compila
bun next build

# 2. Tests unitarios (si existen para la ruta)
bun test <ruta-test>

# 3. Backend — curl endpoints afectados
curl -X POST http://localhost:3003/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@...","password":"..."}' -v
curl -X GET http://localhost:3003/api/cms/portal-users -H "Cookie: rmc-token=<editor_token>" -v

# 4. Navegador — ABRIR PÁGINA AFECTADA Y REVISAR CONSOLA
# - Sin errores 404 (favicon, manifest, CSS, JS)
# - Sin CSP violations
# - Sin Permissions-Policy violations
# - Sin JS errors
# - XSS payload en NewsArticle NO ejecuta (verificar en DevTools Console)
```

**Regla:** No se declara "terminado" sin pasar las 4 capas. Si la consola del navegador muestra errores, **corregirlos antes de continuar**.

---

## 📁 Artefactos Generados

- `docs/security-audit-report.md` — Este reporte
- `docs/security-findings.json` — JSON estructurado para tooling
- `findings.json` — Formato security-audit skill (schema validado)

---

## 📝 Notas Finales

1. **No se quita funcionalidad**: Todos los fixes son *additive* (agregan validaciones, sanitización, headers) — ninguna feature legítima se rompe.
2. **Defense in depth**: CSP + nonce + sanitización + rate limit + authZ forman capas; romper una no compromete el todo.
3. **Documentación viva**: `AGENTS.md` debe actualizarse para reflejar estado real (poweredByHeader, serverActions.allowedOrigins, Guardian en portal login).
4. **Rotación de secretos**: Tras fix C-001/C-002, **rotar JWT_SECRET y password de BD** (credenciales de editor seed expuestas en repo histórico).
5. **Graphify**: Ejecutar `graphify update .` tras aplicar fixes para mantener grafo actualizado.

---

**Firma del auditor:** Ponytail Security Agent (full mode)  
**Metodología:** OWASP Top 10 2021 + security-audit skill v6 phases + paralell agent hunting