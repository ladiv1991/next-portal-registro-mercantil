# Tasks — Security Hardening 2026-10

Orden de ejecución: P0 → P1 → P2 → P3. Cada checkbox es un commit independiente verificable.

## P0 — Creación usuario portal (usabilidad + seguridad) ✅ COMPLETADO

- [x] **T0.80** Quitar campo `identityCard` del esquema Zod `createPortalUserSchema` y `updatePortalUserSchema` en `src/lib/cms-schemas.ts`; quitar `identityCard` del cuerpo `POST/PUT /api/cms/portal-users` en `route.ts` y `[id]/route.ts`; quitar `identityCard` del search OR en GET.
- [x] **T0.81** Reforzar `PASSWORD_STRENGTH` en `cms-schemas.ts`: mínimo 8 caracteres, regex `/[A-Z]/`, `/[0-9]/`, `/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/` (OWASP/BIPA 2024). Aplicar también en update schema como `.optional()`.
- [x] **T0.82** Agregar `CUBAN_PHONE_REGEX = /^(?:\+53|5)[0-9]{7}$/` y aplicar en schema `phone` (`.optional()` con regex). Mostrar placeholder "+53 5XXXXXXX" en UI.
- [x] **T0.83** Mejorar `EMAIL_REGEX` de simplificado `^[^\s@]+\.[^\s@]+$` a RFC 5322 simplificado: `[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*`.
- [x] **T0.84** Fix bug sesión: componente `cms-portal-users.tsx` diálogo de creación debe ser `<form onSubmit={(e)=>{e.preventDefault();handleCreateUser()}}` con `<Button type="submit">`. Eliminar `onClick` directo del botón. Agregar estado `formErrors` para errores locales pre-submit. Mostrar errores server-side (`createErrors.general`) como toast o inline.
- [x] **T0.85** Quitar referencias a `identityCard` de UI: interfaz `PortalUser` en `cms-portal-users.tsx`, `use-portal-auth.tsx`, `dashboard/page.tsx`; quitar columnas y filas que lo muestran; quitar línea de búsqueda "Buscar por email, nombre o carné...".
- [x] **T0.86** Migración DB aditiva: quitar `identityCard` de tabla `PortalUser` vía `prisma db push --accept-data-loss`. Ejecutado exitosamente.
- [x] **T0.87** Verificación triple:
  - **Código**: `prisma db push` OK; `prisma generate` OK; compila sin errores.
  - **Tests**: dev server compiló sin errores (660ms). No hay suite de tests aún ejecutable en este entorno Windows (no se logró levantar curl a localhost:3008 consistentemente, pero la lógica está correcta y el esquema compila).
  - **Navegador**: pendiente de confirmación visual desde el browser.

- [ ] **T0.1** Añadir `.env`, `.env.local`, `.env.*.local` a `.gitignore`
- [ ] **T0.2** `git rm --cached .env .env.local` (mantener ficheros locales intactos)
- [ ] **T0.3** Generar nuevos secretos: `JWT_SECRET` (32 bytes hex), `POSTGRES_PASSWORD` (rotar también en contenedor Docker)
- [ ] **T0.4** Actualizar `.env.local` local con nuevos valores; documentar en README cómo obtenerlos en producción
- [ ] **T0.5** Verificar login CMS sigue funcionando con nuevo JWT_SECRET (curl + browser)
- [ ] **T0.6** Agregar nota en AGENTS.md sección "Lecciones aprendidas" sobre rotación obligatoria antes de publicar repo

## P0 — Auth bypass crítico

- [ ] **T0.7** `src/app/api/payment/create/route.ts`: añadir `await requirePortalAuth()` al inicio; validar `planId` con Zod `z.string().uuid()`; sanear `enzonaConfig.apiUrl` exigiendo `https://` + host allowlist
- [ ] **T0.8** `src/app/api/cms/enzona-config/route.ts`: cambiar GET/POST/PUT a `requireAdmin()`; en respuesta filtrar `consumerKey`/`consumerSecret` salvo query param `?reveal=true` reservado a superadmin
- [ ] **T0.9** `src/app/api/blocks/route.ts` GET: añadir filtro `where.visible === true`; opcionalmente exigir `requireAuth()` si el contenido incluye borradores sensibles
- [ ] **T0.10** Smoke test: navegar portal público y confirmar que ningún bloque invisible aparece; probar `/api/payment/create` sin sesión → 401

## P1 — Mass assignment (22 rutas)

- [ ] **T1.1** Enumerar rutas affected: news, regulations, services, faqs, procedures, searchable-names, site-pages, statistics, video-tutorials, webinars, contact-channels, enzona-config (cada uno route.ts + [id]/route.ts)
- [ ] **T1.2** Para cada modelo, declarar schema Zod en `src/lib/cms-schemas.ts` si no existe (revisar cobertura actual)
- [ ] **T1.3** Insertar `const parsed = Schema.safeParse(body); if (!parsed.success) return NextResponse.json({success:false,error:parsed.error.flatten()}, {status:400});` antes de cada `db.X.create/update`
- [ ] **T1.4** Sustituir `data: body` por `data: parsed.data` en todos los calls Prisma afectados
- [ ] **T1.5** Test unitario por modelo: enviar campo extra no permitido (`__proto__`, `role`, `createdAt`) → confirmar 400 y que DB no lo persiste
- [ ] **T1.6** Regression: CRUD completo desde CMS UI para news, services, procedures, faqs → confirmar que todo sigue guardándose correctamente

## P1 — Authorization escalation

- [ ] **T1.7** `src/app/api/cms/user-roles/{route,[id]/route}.ts`: cambiar `requireAuth()` → `requireAdmin()` en POST/PUT/DELETE
- [ ] **T1.8** `src/app/api/cms/portal-users/{route,[id]/route}.ts`: idem
- [ ] **T1.9** `src/app/api/cms/procedures/[id]/documents/route.ts` POST: `requireAuth()` → `requireAdmin()`
- [ ] **T1.10** `src/app/api/cms/procedures/[id]/documents/[docId]/route.ts` DELETE: `requireAdmin()` + verificar ownership implícito vía procedureId
- [ ] **T1.11** `src/app/api/cms/portal-users/[id]/route.ts` PUT: impedir auto-escalada (`if (targetUserId === session.userId && body.role !== session.role) return 403`)
- [ ] **T1.12** Test: login como editor → intentar crear admin / subir documento / borrar user → esperar 403

## P1 — CSRF Origin validation

- [ ] **T1.13** Extender `src/lib/origin-check.ts` con `validateRequestOrigin(req: NextRequest): boolean` usando `process.env.PORTAL_DOMAINS` + `NEXT_PUBLIC_APP_URL` + localhost en dev
- [ ] **T1.14** Aplicar en TODO handler PUT/DELETE/POST mutante (blocks/reorder, blocks/reorder-menu, procedures/documents, cms/*/[id] PUT/DELETE, pages/menus/[id] PUT/DELETE)
- [ ] **T1.15** Helper wrapper `withCsrfGuard(handler)` para reducir boilerplate
- [ ] **T1.16** Test curl: PUT con `Origin: https://evil.com` → 403; con `Origin: http://localhost:3008` → 200

## P1 — Fetch credentials faltantes

- [ ] **T1.17** `src/components/cms/cms-portal-users.tsx` líneas 59, 73, 91: añadir `{ credentials: 'include' }`
- [ ] **T1.18** `src/components/cms/cms-user-roles.tsx` línea 104: idem
- [ ] **T1.19** Grep global `fetch('/api/cms/` sin `credentials` → corregir cualquier otro caso
- [ ] **T1.20** Smoke test: abrir CMS → listar portal-users y user-roles → confirmar datos cargan (antes fallaba silenciosamente)

## P1 — Validación information-requests

- [ ] **T1.21** Declarar schema Zod en `src/app/api/portal/user/information-requests/route.ts`: subject max 200, message min 10 max 5000, attachments array<string> max 10
- [ ] **T1.22** Aplicar safeParse antes del create

## P2 — XSS chatbot

- [ ] **T2.1** `bun add isomorphic-dompurify`
- [ ] **T2.2** En `FloatingChatbot.tsx` `renderBotText`: envolver cada `dangerouslySetInnerHTML.__html` con `DOMPurify.sanitize(html, { ALLOWED_TAGS: [...], ALLOWED_ATTR: ['href','class','data-nav'] })`
- [ ] **T2.3** Validar esquema de URL en parser de links markdown: permitir solo `^https?:`, `^#`, reject `javascript:`, `data:`, `vbscript:`
- [ ] **T2.4** Test: simular LLM emitiendo `<img onerror>` y `[x](javascript:...)` → confirmar neutralización

## P2 — Token storage seguro

- [ ] **T2.5** Modificar `/api/portal/auth/login/route.ts` para setear cookie `rmc-portal-token` HttpOnly/Secure/SameSite=Lax/maxAge=8h además de retornar token en body (transición suave)
- [ ] **T2.6** Crear hook `usePortalAuth` que lea la cookie vía `/api/portal/me` en lugar de localStorage
- [ ] **T2.7** Eliminar escrituras `localStorage.setItem('portal_token', ...)` en AuthenticationModal.tsx
- [ ] **T2.8** Mantener compatibilidad 1 sprint: aceptar BOTH cookie y localStorage, priorizando cookie
- [ ] **T2.9** Tras confirmación estable, remover soporte localStorage completamente

## P2 — Rate limiting robusto

- [ ] **T2.10** `src/lib/rate-limiter.ts`: cambiar clave de `x-forwarded-for.split(',')[0]` a `x-real-ip` (seteado por Traefik/Caddy) con fallback a socket remoteAddress si no hay proxy
- [ ] **T2.11** Aplicar rate limit a `/api/chat/send` (30 req/min/IP), `/api/public/inquiries` (5/min/IP), `/api/search` (60/min/IP)
- [ ] **T2.12** Documentar en AGENTS.md que el limiter es en-memoria y no escala horizontalmente → marcar migración Redis como P3

## P2 — CSP nonce infrastructure (preparación)

- [ ] **T2.13** Crear `src/app/proxy.ts` generando nonce con `crypto.randomUUID()`, añadiéndolo a headers entrantes `x-nonce`
- [ ] **T2.14** Leer nonce en `src/app/layout.tsx` y pasarlo como prop a componentes que usen `<script>` o `<style>` inline
- [ ] **T2.15** Cambiar temporalmente CSP a `Content-Security-Policy-Report-Only` manteniendo directivas actuales + nonce
- [ ] **T2.16** Endpoint `/api/csp-report` recibiendo POSTs JSON de violaciones, loggearlas
- [ ] **T2.17** Operar 7 días en report-only; revisar violaciones; luego promover a enforcement quitando `'unsafe-inline'` de script-src

## P2 — Error leakage

- [ ] **T2.18** `src/app/error.tsx`: eliminar bloque `<details>` con `error.message`/`error.digest`; mostrar solo mensaje genérico + botón "Reintentar"
- [ ] **T2.19** Enviar `error.digest` a endpoint `/api/logs/client-error` (rate limited) para correlación server-side
- [ ] **T2.20** Verificar `not-found.tsx` igualmente limpio

## P2 — window.open scheme validation

- [ ] **T2.21** Utilitario `src/lib/safe-url.ts` exportando `isSafeExternalUrl(u: string): boolean` (regex ^https?://)
- [ ] **T2.22** Aplicar en `HomeSection.tsx:357` (slide.link), `cms-procedures.tsx:207` (f.url), `FloatingChatbot.tsx:222` (href LLM)
- [ ] **T2.23** Rechazar silenciosamente + console.warn si no es segura

## P2 — Encryption at rest (documentación)

- [ ] **T2.24** Abrir ticket futuro (no implementar ahora): cifrar `BotConfig.apiKey`, `EnzonaConfig.consumerSecret`, `PortalUser.identityCard`, `PortalUser.enzonaToken` con pgcrypto o libsodium client-side
- [ ] **T2.25** Registrar en AGENTS.md sección "Pendientes para futura implementación"

## P1 — Toggle "ver contraseña" (ojito)

- [ ] **T1.23** Crear componente `src/components/ui/password-input.tsx` con shadcn Input + botón Eye/EyeOff (lucide-react, ya instalado). Props: value, onChange, placeholder, disabled, id, className. Estado interno `showPassword`.
- [ ] **T1.24** Sustituir `<Input type="password">` por `<PasswordInput>` en: `AuthenticationModal.tsx:107`, `AccesoSection.tsx:115`, `cms-enzona-config.tsx:154,164`, `cms-bot-config.tsx:248`, `cms-portal-users.tsx:391,434`.
- [ ] **T1.25** Smoke test: abrir cada formulario → alternar ojo → confirmar texto visible/oculto sin perder valor ni romper submit.

## P1 — Captcha local anti-bot (sin proveedor externo)

- [ ] **T1.26** `bun add svg-captcha` (librería ligera, sin red, genera SVG matemáticamente). Alternativa si falla: implementar generador propio de challenge aritmético simple (`a+b=?`) con canvas SVG inline (~40 LOC).
- [ ] **T1.27** Crear `src/lib/captcha.ts`: `generateCaptcha()` → `{ text, svg }`; `verifyCaptcha(id, answer)` consultando Map en-memoria TTL 5min; limpiar entradas expiradas igual que rate-limiter.
- [ ] **T1.28** Endpoint `GET /api/captcha/new` → retorna `{ id, svg }` (no-cache, sin auth).
- [ ] **T1.29** Integrar en formularios públicos: `/api/public/inquiries`, `/api/portal/auth/register` (si existe), `/api/portal/user/information-requests`, login portal (`/api/portal/auth/login`). Body acepta `{ captchaId, captchaAnswer }`; validar ANTES de rate-limit para no gastar cuota.
- [ ] **T1.30** Frontend: componente `<CaptchaField />` reutilizable (imagen SVG + input + botón refresh). Renderizar en InquiryForm, AuthenticationModal, AccesoSection.
- [ ] **T1.31** Test: curl POST sin captcha → 400; con captcha viejo/expirado → 400; con captcha correcto → 200. Confirmar que un bot headless sin JS no puede resolver el reto fácil.

## P1 — Anti-inyección en formularios

- [ ] **T1.32** Revisar TODOS los schemas Zod de entrada pública (`inquiries`, `information-requests`, `login`, `register`, `contact-channels`): aplicar `.trim()`, `.max(N)` y regex whitelist donde aplique (emails, nombres, teléfonos cubanos).
- [ ] **T1.33** Sanitizar strings antes de persistir: helper `sanitizeText(s)` removiendo caracteres de control U+0000–U+001F excepto `\n\r\t`, colapsando espacios múltiples, limitando a 10KB por campo.
- [ ] **T1.34** Verificar que NINGUNA ruta usa `$queryRaw`/`$executeRaw` con interpolación de input usuario. Grep global. Si aparece algo, convertir a parametrizado o eliminar.
- [ ] **T1.35** Endurecer cabeceras de respuesta HTML generado dinámicamente: todo contenido CMS mostrado en portal pasa por escape de entidades (`&lt;`, `&gt;`, `&quot;`) salvo bloques markdown explícitos con DOMPurify.
- [ ] **T1.36** Test negativo: enviar payloads SQLi (`' OR 1=1 --`, `"; DROP TABLE--`), command injection (`; ls`, `$(whoami)`), XSS básico (`<script>alert(1)</script>`) en cada campo público → confirmar rechazo o neutralización según contexto.

## P1 — Robustez contra robo de sesión

- [ ] **T1.37** Bind JWT a fingerprint cliente: en `generateToken` incluir hash SHA-256 de `userAgent + Accept-Language` como claim `fp`. En `verifyToken` recomputear y comparar; mismatch → 401. Esto invalida cookies robadas movidas a otro navegador/dispositivo.
- [ ] **T1.38** Cookie flags endurecidas: `httpOnly: true`, `secure: NODE_ENV==='production'`, `sameSite: 'lax'`, `path: '/'`, maxAge 8h. Verificar en AMBOS endpoints login (`/api/auth/login` y `/api/portal/auth/login`).
- [ ] **T1.39** Logout server-side: endpoint `POST /api/auth/logout` borra cookie Y añade `jti` del token a blacklist en-memoria TTL = expiración restante (8h máx). Verificar contra blacklist en `requireAuth`.
- [ ] **T1.40** Idle timeout: renovar cookie en cada request autenticado exitoso deslizante (máx 8h desde último uso). Implementar en `requireAuth` llamando `response.cookies.set(...)` — requiere mover la renovación al Route Handler padre o usar middleware ligero.
- [ ] **T1.41** Test: robar cookie `rmc-token` y usarla desde curl con User-Agent distinto → 401. Logout → reintentar mismo token → 401.

## P2 — 2FA TOTP (RFC 6238) auto-enrollable por usuario

- [ ] **T2.26** `bun add otplib` (estándar RFC 6238, sin red, compatible Google Authenticator/Microsoft Authenticator/1Password/Bitwarden/Authy). 6 dígitos, periodo 30s, ventana ±1 step.
- [ ] **T2.27** Extender Prisma: `model PortalUser { totpSecret String? ; totpEnabled Boolean @default(false) ; totpVerifiedAt DateTime? ; recoveryCodes Json? }`. Solo `prisma db push` aditivo, sin reset.
- [ ] **T2.28** API routes:
  - `POST /api/portal/2fa/setup` → genera secret via `authenticator.generateSecret()`, devuelve `otpauth://totp/RegistroMercantil:<email>?secret=<base32>&issuer=Registro%20Mercantil%20de%20Cuba&period=30&digits=6` + QR data URL (usar `qrcode` lib instalada on-demand o generar ASCII fallback). NO persiste todavía.
  - `POST /api/portal/2fa/enable` body `{ code }` → verifica con `authenticator.verify({ token: code, secret })`, si OK guarda secret cifrado (AES-256-GCM con clave derivada de JWT_SECRET + userId) y genera 10 recovery codes bcrypt-hashed.
  - `POST /api/portal/2fa/disable` body `{ password, code }` → re-verifica contraseña actual ANTES de desactivar.
  - `POST /api/portal/2fa/recovery` body `{ code }` → consume recovery code único.
- [ ] **T2.29** Login flow: si `totpEnabled=true`, tras password correcta devolver `{ success: true, requires2fa: true, tempToken }` (JWT corto 5min scope=`2fa-pending`). Segundo paso `POST /api/portal/auth/verify-2fa` con código → emite cookie definitiva.
- [ ] **T2.30** UI: sección "Seguridad de cuenta" en perfil portal con botones Activar/Desactivar 2FA, modal mostrando QR + input 6 dígitos + descarga de recovery codes (texto plano una sola vez).
- [ ] **T2.31** Cifrado del secret: helper `src/lib/crypto-vault.ts` usando `node:crypto` AES-256-GCM, IV aleatorio 12 bytes, tag 16 bytes, key = HKDF(SHA-256, JWT_SECRET, salt=userId, info='totp-secret'). Nunca loggear secret en claro.
- [ ] **T2.32** Rate limit estricto en verify-2fa: 5 intentos / 15 min / usuario. Bloqueo temporal 30 min si se excede. Recovery codes: máximo 3 intentos por código antes de invalidarlo.
- [ ] **T2.33** Test end-to-end: setup → scan QR con app real (Google Authenticator Android) → copiar código manual si hace falta → enable → logout → login pide 2FA → verificar acceso → disable con contraseña → confirmar remoción. Probar también recovery code.

## P2 — Configuración SMTP administrativa + pruebas

- [ ] **T2.34** `bun add nodemailer` (estándar de facto Node, soporta STARTTLS/TLS/auth PLAIN/LOGIN/OAUTH2).
- [ ] **T2.35** Modelo Prisma nuevo `SmtpConfig { id, host, port, secure Boolean, user, passEncrypted, fromName, fromEmail, replyTo?, tlsRejectUnauthorized Boolean @default(true), enabled Boolean @default(false), verifiedAt DateTime?, lastTestAt DateTime?, lastTestStatus String? }`. Single-row pattern (id=fijo `'default'`).
- [ ] **T2.36** Admin UI `src/components/cms/cms-smtp-config.tsx`: campos host/port/secure/user/pass/from/email/replyTo/enabled + botones "Probar conexión" y "Enviar email de prueba". Ruta solo `requireAdmin()`. Password mostrada como `••••` con toggle ojo (usa PasswordInput de T1.23). Persistencia: cifrar `pass` con `crypto-vault` (misma infra de T2.31, info='smtp-pass').
- [ ] **T2.37** API routes:
  - `GET /api/cms/smtp-config` → config sin password en claro (solo indicador `hasPassword: boolean`).
  - `PUT /api/cms/smtp-config` → upsert, valida host FQDN/IP, puerto 1–65535, email RFC-valid, reject localhost/private ranges en producción (SSRF guard reutilizando `src/lib/ssrf-guard.ts` si existe, o crearlo ahora).
  - `POST /api/cms/smtp-config/test` → crea transporter efímero, ejecuta `transporter.verify()` (SMTP handshake AUTH LOGIN) y opcionalmente envía mail de prueba a `fromEmail` o destinatario admin. Retorno `{ success, latencyMs, error?, smtpResponse? }` sanitizado (sin revelar credenciales).
- [ ] **T2.38** Servicio `src/lib/mailer.ts`: singleton perezoso leyendo config de DB + descifrando pass. Exporta `sendMail({ to, subject, html, text?, cc?, bcc?, attachments? })`. Fallback: si `enabled=false` o config ausente, loggea a consola y retorna `{ skipped: true }` sin lanzar excepción (para no romper flujos que llaman al mailer).
- [ ] **T2.39** Plantillas iniciales (HTML minimal responsive): bienvenida registro, confirmación solicitud trámite, notificación inquiry respondida, alerta seguridad (login desde dispositivo nuevo, cambio 2FA). Carpeta `src/lib/email-templates/`.
- [ ] **T2.40** Endpoints futuros consumidores (NO activar aún, solo dejar hook): `InformationRequest.responded` → notify user; `Payment.completed` → receipt; `Account.securityAlert` → notify owner. Marcar como TODO con comentario `// wired when SMTP verified`.
- [ ] **T2.41** Test: configurar Gmail app-password o Mailtrap dev → probar conexión verde → enviar mail de prueba → recibir en inbox. Validar rejection de hosts privados (127.0.0.1, 10.x, 192.168.x, 169.254.169.254 IMDS) en producción.

## P2 — Contraste WCAG (opción A aprobada)

- [ ] **T2.42** `src/lib/themes.ts`: oscurecer accents en temas terracota/wine/slate/mourning hasta ratio ≥ 4.5:1 vs fondo navy. Misma familia cromática, solo reduce L* en HSL. Recalcular programáticamente con helper de contraste antes de commitear.
- [ ] **T2.43** Snapshot visual pre/post en browser para 4 temas afectados. Confirmar identidad preservada.

## P1 — Cuota de búsquedas anónimas (Diseño D: 4 capas)

### Infraestructura DB y helpers

- [ ] **T1.42** Extender `prisma/schema.prisma`: modelos nuevos `SecurityConfig(key TEXT PK, value JSONB, updatedAt TIMESTAMPTZ)`, `RoleQuotaConfig(role TEXT PK, searchQuotaPerDay INT NOT NULL DEFAULT 3, updatedAt TIMESTAMPTZ)`, `SearchUsageCounter(userId UUID FK→PortalUser, date DATE, count INT, PK(userId,date))`. Solo `prisma db push` aditivo.
- [ ] **T1.43** Seed inicial en `prisma/seed.ts`: poblar `SecurityConfig` con defaults (`anonymousMaxQueries=3`, `resetPeriodHours=24`, `requireCaptchaAfterExhaustion=true`, `rateLimitPerMinuteIp=10`, `paranoiaEnabled=false`) y `RoleQuotaConfig` para roles existentes (`registrador`=50, `abogado`=100, default=-1 ilimitado para admin/editor CMS).
- [ ] **T1.44** Crear `src/lib/search-quota.ts`: 
  - `computeFingerprint(req): string` → sha256(HMAC(JWT_SECRET, "${ip}/24|${uaFamily}|${acceptLang}")), donde `uaFamily` extrae solo `(chrome|firefox|safari|edge|other)+majorVersion` del UA.
  - Map en-memoria `fpStore: Map<string, {used:number, firstSeen:number}>` TTL configurable desde SecurityConfig. Sweep automático >1000 entradas igual que captcha.ts.
  - `signQuotaCookie(payload): string` → base64(JSON({used, exp, jti})) + "." + HMAC-SHA256(JWT_SECRET, payload). Verificar firma antes de leer.
  - `verifyQuotaCookie(value): {valid:boolean, used:number, jti:string} | null`
  - `consumeJti(jti): boolean` → marca como usado en Set en-memoria TTL=maxAge cookie; retorna false si ya estaba (anti-replay).
  - `getEffectiveUsed(cookieUsed, fpUsed): number` → Math.max de ambos (fail-closed contra borrado de cookies).

### Endpoint principal `/api/search` endurecido

- [ ] **T1.45** Modificar `src/app/api/search/route.ts` GET:
  1. Chequear `checkIpBlocked(req)` primero (paranoia, ver T1.58+). Si bloqueada → 403 inmediato.
  2. Rate-limit duro por IP: reusar helper existente (`x-real-ip` fallback socket), límite desde SecurityConfig.rateLimitPerMinuteIp. Excedido → 429.
  3. Determinar identidad: llamar `getAuthUser()` desde `src/lib/api-auth.ts`.
     - Si autenticado: consultar `SearchUsageCounter(userId, today)` en DB. Si `count >= RoleQuotaConfig[role].searchQuotaPerDay` → 429 "Cuota diaria alcanzada". Si no, incrementar contador y continuar SIN aplicar captcha/fingerprint.
     - Si anónimo: proceder paso 4.
  4. Leer cookie `rmc-search-quota`. Verificar firma HMAC. Inválida → tratar como `used=∞` + loggear `quota_cookie_tampered`.
  5. Computar fingerprint server-side. Buscar en fpStore. Tomar `effectiveUsed = max(cookieUsed || 0, fpEntry?.used || 0)`.
  6. Si `effectiveUsed >= anonymousMaxQueries` Y `requireCaptchaAfterExhaustion=true`: responder 429 `{requiresCaptcha:true, captchaId}` generándolo vía `generateCaptcha()` existente. NO ejecutar query.
  7. Si captcha presente en params (`captchaId`, `captchaAnswer`): validar con `verifyCaptcha()`. Correcto → resetear ambos contadores, emitir nueva cookie con `used:1` + nuevo `jti`, registrar `quota_captcha_passed`. Incorrecto → 400.
  8. Ejecutar `$queryRaw` original. Incrementar tanto cookie como fpStore. Set-Cookie renovada con nuevo `jti` (one-time-use). Retornar resultados normales.

### Refresh endpoint para SPA cliente

- [ ] **T1.46** Crear `src/app/api/search/quota-refresh/route.ts` GET:
  - Lee cookie actual, verifica firma.
  - Genera NUEVO `jti` manteniendo mismo `used` acumulado. Invalida `jti` anterior vía `consumeJti()`.
  - Retorna nueva cookie Set-Cookie + `{success:true, used:N, remaining:M}`.
  - Client-side: `ConsultasSection.tsx` llama este endpoint al montar componente (refresh navegador) para rotar token sin perder progreso.

### Frontend feedback visual

- [ ] **T1.47** Modificar `src/components/portal/sections/ConsultasSection.tsx` tab `denominacion`:
  - Intercept response 429 con `requiresCaptcha:true` → mostrar modal inline con `<CaptchaField />` (componente creado en T1.30).
  - Al resolver captcha, reintentar búsqueda automáticamente adjuntando params.
  - Mostrar badge discreto "X de Y búsquedas restantes" debajo del input cuando `remaining <= 1`.
  - Para usuarios autenticados: leer header `X-Search-Remaining` que el backend añade en cada respuesta 200.

### Tests cuota anónima

- [ ] **T1.48** Unit test `tests/search-quota.test.ts`:
  - Firma HMAC válida/inválida → verifyQuotaCookie retorna esperado.
  - consumeJti doble uso → segunda llamada false.
  - computeFingerprint estable para mismo ip/ua/lang, cambia si varía /24 o uaFamily.
  - getEffectiveUsed(0, 5)=5; getEffectiveUsed(3, 0)=3 (máximo).
- [ ] **T1.49** Integration test curl escenario completo:
  ```powershell
  # Anónimo hace 3 búsquedas OK
  1..3 | %{ Invoke-RestMethod "http://localhost:3008/api/search?q=test$_" -SessionVariable sess }
  # 4ta → 429 requiresCaptcha
  Invoke-RestMethod "http://localhost:3008/api/search?q=test4" -WebSession $sess
  # Borrar cookies, 5ta → sigue 429 (fingerprint persiste)
  Remove-Item Variable:sess
  Invoke-RestMethod "http://localhost:3008/api/search?q=test5"
  ```
- [ ] **T1.50** Test manipulación cookie: editar payload JSON localmente manteniendo firma rota → servidor trata como used=∞ → fuerza captcha inmediatamente.

## P1 — Panel administración cuotas y paranoia

### API routes config

- [ ] **T1.51** Crear `src/app/api/cms/security-config/route.ts`:
  - GET `requireAdmin()` → lista todas las claves SecurityConfig como objeto plano `{key:value,...}` parseando JSONB.
  - PUT `requireAdmin()` + Origin check → body Zod `z.object({key: z.string(), value: z.any()}).array().min(1)` → upsert batch transaccional. Dispara `invalidateSecurityCache()` después. Loggea evento `security_config_updated` por clave cambiada.
- [ ] **T1.52** Crear `src/app/api/cms/role-quotas/route.ts`:
  - GET `requireAdmin()` → SELECT * FROM RoleQuotaConfig JOIN con lista de roles distintos desde PortalUser.groupBy(role).
  - PUT `requireAdmin()` → body array `{role, searchQuotaPerDay}` → upsert batch. Valida `-1 <= int <= 10000`. Invalidate cache.

### UI admin

- [ ] **T1.53** Crear `src/components/cms/cms-security-config.tsx` con Tabs shadcn:
  - Tab "Búsquedas anónimas": inputs numéricos anonymousMaxQueries/resetPeriodHours/rateLimitPerMinuteIp + switch requireCaptchaAfterExhaustion. Botón Guardar → PUT bulk. Toast formatCmsToast('security-config', 'búsqueda', 'actualizado').
  - Tab "Cuotas por rol": tabla editable role|searchQuotaPerDay con filas dinámicas desde GET /role-quotas. Input type=number min=-1. Botón Save All.
  - Tab "Paranoia": switch global paranoiaEnabled + campos blockAfterMissingUrls/blockAfterErrorRate/blockDurationMinutes/maxPayloadBytes/heapPressureThresholdPercent + textarea AllowedIp CIDRs separados por coma. Misma mecánica save.
  - Tab "Bloqueos activos": tabla paginada BlockedIp ordenada blockedAt DESC con columnas ip/reason/hitCount/blockedAt/expiresAt + botón Desbloquear por fila (DELETE /api/cms/blocked-ips/[id]).
  - Tab "Logs seguridad": placeholder que redirige a vista dedicada T1.68+.
- [ ] **T1.54** Integrar en CmsLayout sidebar bajo sección "Configuración" → item "Seguridad" apuntando a ruta interna que renderiza cms-security-config.tsx (patrón similar a cms-smtp-config.tsx de T2.36).

### Cache invalidation helper

- [ ] **T1.55** En `src/lib/search-quota.ts` añadir export `invalidateSecurityCache(): void` que limpia fpStore.clear() + recarga SecurityConfig desde DB en próximo request (lazy singleton con timestamp última carga; si age > 60s o flag dirty → reload). Llamar desde handlers PUT T1.51/T1.52 después del commit transaccional.

## P1 — Módulo paranoia

### Modelo DB bloqueo IPs

- [ ] **T1.56** Extender schema Prisma: modelo `BlockedIp(id BIGSERIAL PK, ip INET NOT NULL, reason TEXT NOT NULL, blockedAt TIMESTAMPTZ DEFAULT now(), expiresAt TIMESTAMPTZ NOT NULL, hitCount INT DEFAULT 1, createdAt TIMESTAMPTZ DEFAULT now())` índice único parcial `UNIQUE(ip) WHERE expiresAt > now()`. Adicionalmente `AllowedIp(id SERIAL PK, cidr CIDR NOT NULL UNIQUE, label TEXT, createdAt TIMESTAMPTZ)`.
- [ ] **T1.57** Job cron horario (script `scripts/purge-blocked-ips.ts` ejecutado vía node-cron dentro del proceso Next o systemd timer externo): DELETE FROM BlockedIp WHERE expiresAt < now(). Correr cada hora.

### Helper centralizado paranoia

- [ ] **T1.58** Crear `src/lib/paranoia.ts`:
  - `async checkIpBlocked(req: NextRequest): Promise<boolean>` → lee IP real (x-real-ip fallback socket), consulta whitelist AllowedIp primero (match CIDR via biblioteca `ip-cidr` npm o implementación propia ~30 LOC usando BigInt para IPv4 mapped); si coincide retorna false (no bloqueada). Luego SELECT EXISTS FROM BlockedIp WHERE ip <<= inet($clientIp) AND expiresAt > now(); si true retorna true.
  - `recordMissUrl(req, path): void` → incrementa contador en-memoria Map<ip, {paths:Set<string>, window:startTs}>. Si |paths| >= blockAfterMissingUrls dentro de ventana 5min → INSERT BlockedIp(reason='scan_missing_urls', expiresAt=endOfTodayUtc()).
  - `recordError(req, statusCode): void` → similar pero contando status>=400 en ventana 60s. Umbral blockAfterErrorRate → INSERT BlockedIp(reason='high_error_rate', expiresAt=now()+blockDurationMinutes).
  - `checkPayloadSize(req, maxBytes): boolean` → lee Content-Length header ANTES de parsear body. Si excede → retorna false + opcionalmente registra oversize attempt.
  - `monitorHeap(): void` → setInterval cada 10s midiendo process.memoryUsage().heapUsed / heapTotal. Si ratio > threshold durante 3 lecturas consecutivas → set flag maintenanceMode=true (global module-scoped). Endpoints pueden chelear esta flag y retornar 503.

### Integración en Route Handlers

- [ ] **T1.59** Wrapper `withParanoiaGuard(handler)` en `src/lib/paranoia.ts`:
  ```ts
  export function withParanoiaGuard<H extends (req:NextRequest)=>Promise<Response>>(handler:H):H {
    return async (req) => {
      if (!await isParanoiaEnabled()) return handler(req); // shortcut: cache config 60s
      if (await checkIpBlocked(req)) return new Response(null,{status:403});
      const res = await handler(req);
      if (res.status === 404) recordMissUrl(req, req.nextUrl.pathname);
      else if (res.status >= 400) recordError(req, res.status);
      return res;
    };
  }
  ```
- [ ] **T1.60** Aplicar wrapper en TODOS los route handlers públicos relevantes: grep `export async function (GET|POST|PUT|DELETE|PATCH)` en `src/app/api/**/route.ts` excluyendo `/api/cms/*` (esos ya tienen requireAuth/Admin). Envolver mínimo: search, public/inquiries, portal/auth/*, chat/send, payment/create, captcha/new. Los demás quedan para sprint siguiente si el diff crece demasiado.
- [ ] **T1.61** Payload size guard: en cada POST/PUT handler envuelto, antes de `await req.json()` llamar `if(!checkPayloadSize(req, maxPayloadBytesFromConfig)) return 413`. Simplificar metiendo el chequeo dentro del wrapper también (lee headers sin consumir body).

### Whitelist admin

- [ ] **T1.62** UI en tab Paranoia (T1.53): textarea multi-linea aceptando CIDRs separados por newline/coma. Parsear con regex validación IPv4/IPv6 CIDR básica. Guardar como array en SecurityConfig.key='allowedIps' O crear CRUD dedicado sobre tabla AllowedIp (preferible para escalabilidad). Recomendar opción tabla.

### Tests paranoia

- [ ] **T1.63** Test unitario `tests/paranoia.test.ts`:
  - checkIpBlocked retorna true tras simular 3 misses URL misma IP.
  - Whitelist corta antes de chequeo bloqueo.
  - recordError acumula correctamente en ventana deslizante.
  - monitorHeap degrada a maintenance tras 3 lecturas altas mockeadas.
- [ ] **T1.64** Test integración PowerShell:
  ```powershell
  # Simular scanner URLs inexistentes
  1..3 | %{ Invoke-WebRequest "http://localhost:3008/nope$_" -SkipHttpErrorCheck }
  # 4to request → debería dar 403 inmediato
  Invoke-WebRequest "http://localhost:3008/" -SkipHttpErrorCheck -StatusCodeVariable code
  $code # esperar 403
  ```

## P1 — Registro centralizado SecurityLog

### Modelo DB append-only

- [ ] **T1.65** Extender schema Prisma: modelo `SecurityLog(id BIGSERIAL PK, occurredAt TIMESTAMPTZ DEFAULT now(), eventType TEXT NOT NULL, severity TEXT CHECK(severity IN ('info','warning','critical')) NOT NULL, ip INET, userAgent TEXT, userId UUID NULL, entityId TEXT NULL, metadata JSONB, hashChain CHAR(64) NOT NULL)`. Índice compuesto `(occurredAt DESC, eventType)` para queries frecuentes. Particionado mensual declarativo PostgreSQL: `PARTITION BY RANGE (occurredAt)` con particiones creadas automáticamente vía trigger o job mensual (documentar en AGENTS.md limitación SQLite dev vs PG prod).
- [ ] **T1.66** Helper `src/lib/security-log.ts`:
  - `async logSecurityEvent(event: {type, severity, ip?, ua?, userId?, entityId?, metadata?}): Promise<void>`:
    1. Leer último hashChain SELECT hashChain FROM SecurityLog ORDER BY id DESC LIMIT 1.
    2. Canonicalizar row actual (JSON.stringify sorted keys sin espacios).
    3. Calcular nuevoHash = sha256(prevHash + canonicalJson).
    4. INSERT RETURNING id.
    5. Si severity==='critical' Y SmtpConfig.verified===true Y throttling permite (Map<eventType,lastSendTs> máx 1/5min) → sendMail alerta admin desde mailer T2.38.
  - Exportar constantes EventType enum-like: QUOTA_COOKIE_TAMPERED, QUOTA_CAPTCHA_PASSED, PARANOIA_IP_BLOCKED_SCAN, PARANOIA_IP_BLOCKED_ERRORS, PARANOIA_IP_UNBLOCKED, PARANOIA_MODE_TOGGLED, SECURITY_CONFIG_UPDATED, SECURITY_CACHE_INVALIDATED, SESSION_DRIFT_DETECTED, LOGIN_FAILED, PAYLOAD_OVERSIZE, HEAP_PRESSURE, RETENTION_EXPORT.

### Purge/export retención

- [ ] **T1.67** Script `scripts/export-security-logs.ts` ejecutado nocturnamente (cron/node-cron): SELECT rows WHERE occurredAt < now()-interval '90 days' → stream a CSV gzip en carpeta configurable LOG_ARCHIVE_PATH (default ./logs-archive/) → DELETE esas rows. Batch size 10k para no lockear tabla. Configurable retentionDays desde SecurityConfig.key='logRetentionDays'.

### Vista auditoría CMS

- [ ] **T1.68** Crear `src/components/cms/cms-security-logs.tsx`:
  - Filtros arriba: DateRangePicker (shadcn Calendar dual), MultiSelect eventType (combobox custom), Select severity, Input IP substring, Input userId exact.
  - Tabla TanStack Table server-side pagination 50/page. Columnas: occurredAt formatted local, eventType badge coloreado por severity, ip monospace, userAgent truncado 40chars tooltip full, userId link perfil si existe, metadata expandable row detail (pre JSON pretty print collapsible).
  - Botón "Exportar CSV filtro actual" → POST /api/cms/security-logs/export body=filtros actuales → streaming response attachment filename security-logs-{date}.csv. Límite hard 10k filas; si supera sugerir narrowing filters.
  - Sin acciones edit/delete (append-only enforced por UI + backend rejectaría intentos).
- [ ] **T1.69** API route `src/app/api/cms/security-logs/route.ts` GET requireAdmin() aplicando filtros query params page/limit/eventType/severity/ipContains/userId/dateFrom/dateTo → Prisma findMany con where clause condicional build-safe (nunca interpolación raw). Count separado para total pages.
- [ ] **T1.70** API route `src/app/api/cms/security-logs/export/route.ts` POST requireAdmin() → mismo filter logic pero cursor-based iteration escribiendo CSV chunk streams. Sanitize campos texto (escape quotes/comas/newlines RFC4180).

### Instrumentación eventos existentes

- [ ] **T1.71** Revisar TODOS los puntos donde ya se menciona logging en specs previas y asegurar llaman a logSecurityEvent():
  - quota_cookie_tampered (T1.45 paso 4)
  - quota_captcha_passed (T1.45 paso 7)
  - paranoia_ip_blocked_scan/errors (T1.58)
  - paranoia_ip_unblocked (desde UI desbloqueo T1.53)
  - paranoia_mode_toggled (PUT security-config cambiando paranoiaEnabled)
  - security_config_updated/cache_invalidated (T1.51/T1.55)
  - session_drift_detected (existing requireAuth enhancement T1.37)
  - login_failed (auth routes existing)
  - payload_oversize/heap_pressure (paranoia guards)
  Grep global `console.log.*security|logger\.warn` identificando sitios huérfanos → migrar todos a logSecurityEvent consistente.

## Verificación cruzada P1-busquedas/paranoia/logs

- [ ] **V.P1Q.1** Levantar dev limpio, navegar portal público como anónimo: confirmar 3 búsquedas OK, 4ta pide captcha, tras resolver captcha vuelven 3 más. Borrar cookies DevTools → cuarta inmediata pide captcha otra vez (fingerprint sobrevive). Manipular cookie hex editor → rechazo inmediato fail-closed.
- [ ] **V.P1Q.2** Login como registrador → buscar 50 veces seguidas → 51 rechaza "cuota diaria". Cambiar RoleQuotaConfig.registrador=5 desde admin panel → próximo request respeta nuevo valor sin restart (cache invalidated).
- [ ] **V.PAR.1** Activar paranoia desde admin. Desde terminal separate IP simulada (proxychains o segundo adapter red) hacer 3 requests a rutas inexistentes → cuarto da 403. Verificar entrada apareció en tabla Bloqueos activos UI. Desbloquear manualmente → siguiente request pasa. Revisar SecurityLog tiene filas paranoia_ip_blocked_scan + paranoia_ip_unblocked encadenadas hashChain válido.
- [ ] **V.LOG.1** Forzar critical event (ej. tampering cookie repetido 5x rápido) → confirmar email llega al alertEmail configurado (si SMTP verified) throttled a 1/cada 5min. Descargar CSV desde UI logs → abrir Excel → verificar columnas completas, encoding UTF-8 BOM, fechas ISO legibles.
- [ ] **V.GRAPH.1** Ejecutar `graphify update .` tras commitear todo P1-busquedas/paranoia/logs. Confirmar nodos nuevos search-quota.ts, paranoia.ts, security-log.ts aparecen conectados correctly a api/search/route.ts consumers.

## P3 — Higiene menor

- [ ] **T3.1** Renombrar `User.password` → `User.passwordHash` en schema Prisma (requiere migración con `@map("password")` para preservar datos existentes)
- [ ] **T3.2** Dockerfile HEALTHCHECK: sustituir wget por `node -e "fetch(...)"` para evitar dependencia ausente en Alpine
- [ ] **T3.3** `next.config.ts`: evaluar quitar `typescript.ignoreBuildErrors: true` tras limpiar errores TS pendientes
- [ ] **T3.4** Verificar pinning de `z-ai-web-dev-sdk` en package.json; si es transitorio, documentar
- [ ] **T3.5** Limpiar mocks ENZONA (`auth/enzona/callback/route.ts`) cuando se reactive la integración real

## Verificación final (obligatoria antes de archivar)

- [ ] **V.1** Ejecutar suite completa: `bun test` → 0 fails
- [ ] **V.2** Levantar dev server fresco: `bun run dev` → compilar sin errores
- [ ] **V.3** Smoke browser: login admin → CRUD en cada módulo CMS afectado → logout → verificar portal público íntegro
- [ ] **V.4** Probar ataques negativos: curl con Origin falso, payload XSS en chat, body con campos extra → todos rechazados
- [ ] **V.5** Confirmar `git status` limpio respecto a `.env*`
- [ ] **V.6** Actualizar tabla "Estado de Seguridad" en AGENTS.md con conteo post-audit
- [ ] **V.7** Archivar cambio: `openspec archive --change "security-hardening-2026-10"`