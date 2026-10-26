## ADDED Requirements

### Requirement: Secretos fuera de control de versiones
The system SHALL NOT track `.env*` files in git and MUST rotate any exposed secrets before deployment.

#### Scenario: .env y .env.local dejan de estar trackeados
- **WHEN** se ejecuta `git ls-files | Select-String "\.env"`
- **THEN** devuelve vacío
- **AND** `.gitignore` contiene entradas `.env`, `.env.local`, `.env.*.local`
- **AND** JWT_SECRET y POSTGRES_PASSWORD tienen valores distintos a los presentes en HEAD~1

#### Scenario: Login CMS sigue funcionando tras rotación
- **GIVEN** nuevo JWT_SECRET en `.env.local`
- **WHEN** se hace POST a `/api/auth/login` con credenciales seed válidas
- **THEN** responde `{ success: true }` y setea cookie `rmc-token`
- **AND** GET a `/api/cms/news` con esa cookie responde 200

### Requirement: Autenticación obligatoria en rutas sensibles
The system SHALL require admin authentication for routes that manage credentials, payment configuration, or privileged user data.

#### Scenario: payment/create requiere sesión portal válida
- **WHEN** POST `/api/payment/create` SIN cookie `rmc-token`
- **THEN** responde 401
- **AND** nunca construye `paymentUrl` desde `enzonaConfig.apiUrl` sin validar esquema https:// y host allowlisted

#### Scenario: enzona-config oculta secrets a editors
- **WHEN** GET `/api/cms/enzona-config` como usuario role=`editor`
- **THEN** responde 403
- **AND** solo role=`admin` recibe payload, y ese payload excluye `consumerKey` y `consumerSecret` salvo flag explícito

#### Scenario: blocks GET filtra por visible
- **WHEN** GET `/api/blocks?pageId=X` sin auth
- **THEN** solo retorna bloques con `visible=true`
- **AND** no expone contenido de borradores

### Requirement: Validación de entrada en toda mutación
The system SHALL validate all request bodies with Zod schemas before writing to the database.

#### Scenario: Rutas CMS standalone rechazan campos desconocidos
- **WHEN** POST `/api/cms/news` con body `{ title: "X", isAdmin: true }`
- **THEN** responde 400 con error de validación Zod
- **AND** la fila creada no contiene `isAdmin` ni prototipo contaminado

#### Scenario: information-requests valida longitud
- **WHEN** POST `/api/portal/user/information-requests` con `message` de 100KB
- **THEN** responde 400 (límite superior aplicado)

### Requirement: Protección CSRF en handlers mutantes
The system SHALL verify the Origin header on all state-changing API requests against a configured allowlist.

#### Scenario: Reorder desde origen extraño es rechazado
- **WHEN** PUT `/api/blocks/reorder` con header `Origin: https://evil.example`
- **THEN** responde 403
- **AND** no modifica el orden de bloques

#### Scenario: Misma página funciona normalmente
- **WHEN** PUT `/api/blocks/reorder` con `Origin: http://localhost:3008` (dev) o dominio producción registrado
- **THEN** responde 200

### Requirement: Sanitización de salida XSS en chatbot
The system SHALL sanitize all LLM-generated HTML through DOMPurify before rendering via dangerouslySetInnerHTML.

#### Scenario: Payload img onerror neutralizado
- **WHEN** el LLM emite `<img src=x onerror=alert(1)>`
- **THEN** el DOM resultante no contiene atributo `onerror`
- **AND** la imagen se elimina o se renderiza sin handler

#### Scenario: javascript: URI bloqueada
- **WHEN** el LLM emite `[click](javascript:alert(1))`
- **THEN** el enlace se renderiza como texto plano o con href vacío
- **AND** nunca como `href="javascript:..."`

### Requirement: Almacenamiento seguro de tokens de sesión
The system SHALL store session tokens in httpOnly cookies managed by the server, not in localStorage.

#### Scenario: AuthenticationModal deja de escribir localStorage
- **WHEN** login exitoso en `/api/portal/auth/login`
- **THEN** `localStorage.getItem('portal_token')` devuelve `null`
- **AND** la cookie `rmc-portal-token` está presente con flags `HttpOnly; Secure; SameSite=Lax`

### Requirement: Rate limiting efectivo en endpoints públicos
The system SHALL apply rate limiting based on trusted proxy IP (X-Real-Ip) on public-facing endpoints.

#### Scenario: chat/send limitado
- **WHEN** 31 POST `/api/chat/send` desde misma IP en 60 segundos
- **THEN** el request 31+ devuelve 429
- **AND** usa `X-Real-Ip` fijado por Traefik/Caddy, no `X-Forwarded-For` raw

#### Scenario: Bypass por cabecera falsa no funciona
- **WHEN** POST `/api/auth/login` con `X-Forwarded-For: 1.2.3.4` rotando en cada request
- **THEN** el contador sigue acumulándose por IP TCP real
- **AND** tras 5 intentos devuelve 429

### Requirement: Errores internos no fugan al cliente
The system SHALL return generic error messages to clients and log details only server-side.

#### Scenario: error.tsx no muestra stack
- **WHEN** se fuerza un crash en un Server Component
- **THEN** el DOM del cliente no contiene `error.message`, rutas absolutas de Windows, ni cadenas de conexión DB
- **AND** solo se muestra código digest opaco tipo `DEV-XXXXXX`

### Requirement: URLs externas validadas antes de window.open
The system SHALL validate URL schemes before passing them to window.open or anchor href attributes.

#### Scenario: Slide link malicioso bloqueado
- **WHEN** CMS guarda slider con `link = "javascript:alert(1)"`
- **THEN** clic en HomeSection no ejecuta JS
- **AND** console.warn registra el rechazo

### Requirement: CSP progresivo con reporte
The system SHALL operate Content-Security-Policy in Report-Only mode before switching to enforcement.

#### Scenario: Report-only captura violaciones sin romper UI
- **WHEN** se activa header `Content-Security-Policy-Report-Only` con directiva estricta
- **THEN** la app sigue funcionando igual
- **AND** endpoint `/api/csp-report` recibe JSON con violaciones detectadas

### Requirement: Toggle de visibilidad en campos de contraseña
The system SHALL provide an eye-icon toggle on every password input so users can reveal or hide their typed value.

#### Scenario: Click en ícono alterna tipo de input
- **WHEN** el usuario hace clic en el ícono de ojo junto a un campo `type="password"`
- **THEN** el input cambia a `type="text"` mostrando el valor escrito
- **AND** un segundo clic lo devuelve a `type="password"`
- **AND** el estado del toggle no persiste entre sesiones ni se envía al servidor

#### Scenario: Accesibilidad del toggle
- **WHEN** el toggle está presente
- **THEN** tiene `aria-label="Mostrar contraseña"` / `"Ocultar contraseña"` según estado
- **AND** es alcanzable por teclado (Tab + Enter/Espacio)

### Requirement: Captcha local sin proveedor externo
The system SHALL protect public-facing forms with a locally-generated CAPTCHA using only installed libraries, without contacting any third-party service.

#### Scenario: Formulario público exige token captcha válido
- **WHEN** se envía POST a `/api/public/inquiries`, `/api/portal/auth/register` o cualquier formulario expuesto
- **THEN** el request incluye campo `captchaToken` generado por `/api/captcha/challenge`
- **AND** si falta o está vencido (>5 min), responde 400 con error "Captcha inválido o expirado"

#### Scenario: Imagen/SVG renderizado server-side sin deps externas
- **WHEN** GET `/api/captcha/challenge`
- **THEN** devuelve `{ svg: string, token: string }` con texto distorsionado generado con `sharp` (ya instalado) o SVG puro
- **AND** el token firma un HMAC del texto con secreto del servidor; nunca se almacena el texto plano en cliente

#### Scenario: Anti-replay
- **WHEN** un mismo `captchaToken` se usa dos veces
- **THEN** el segundo intento falla con 400
- **AND** el token queda marcado como consumido en memoria durante su TTL

### Requirement: Anti-bot por honeypot y timing
The system SHALL reject automated submissions via hidden honeypot fields and minimum-time-to-submit checks, complementing the CAPTCHA.

#### Scenario: Honeypot llenado rechaza silenciosamente
- **WHEN** POST contiene campo oculto `website_url` no vacío (nombre aleatorio por forma)
- **THEN** responde 200 genérico (para no revelar la regla) pero NO persiste el registro
- **AND** loggea evento `bot_blocked_honeypot` server-side

#### Scenario: Submit demasiado rápido rechazado
- **WHEN** el tiempo entre carga del formulario y envío es < 3 segundos
- **THEN** el servidor rechaza con 400 "Envío demasiado rápido"
- **AND** el timestamp firmado se genera al montar el componente

### Requirement: Sanitización defensiva contra inyección en formularios
The system SHALL strip dangerous patterns from free-text inputs before persistence, layered on top of Zod length/type validation.

#### Scenario: Payload SQL/XSS neutralizado en inquiry
- **WHEN** POST `/api/public/inquiries` con `message = "'; DROP TABLE--<script>alert(1)</script>"`
- **THEN** el mensaje almacenado no contiene `<script>` ni secuencias `--`, `/*`, `UNION SELECT`
- **AND** Prisma parametriza la escritura (nunca concatenación SQL)

#### Scenario: Headers de respuesta codifican salida
- **WHEN** el contenido de un inquiry aparece en vista admin CMS
- **THEN** se renderiza como texto plano (`{value}` en JSX), jamás con `dangerouslySetInnerHTML`

### Requirement: 2FA TOTP estándar RFC 6238 opt-in por usuario
The system SHALL offer each authenticated user the ability to enroll a Time-based One-Time Password (TOTP) authenticator compatible with Google Authenticator, Microsoft Authenticator, Authy, 1Password y similares, configured independently per account.

#### Scenario: Generación de secreto y QR de enrolamiento
- **GIVEN** usuario autenticado en `/ajustes/seguridad`
- **WHEN** pulsa "Activar 2FA"
- **THEN** el servidor genera un secreto Base32 de 160 bits vía `crypto.randomBytes(20)`
- **AND** devuelve una URI `otpauth://totp/RegistroMercantil:<email>?secret=<base32>&issuer=Registro%20Mercantil&period=30&digits=6&algorithm=SHA1`
- **AND** muestra el QR (SVG generado localmente con librería instalada) y 10 códigos de recuperación hasheados

#### Scenario: Confirmación antes de activar
- **WHEN** el usuario introduce un código de 6 dígitos generado por su app
- **THEN** el servidor verifica con ventana ±1 periodo (90s tolerancia reloj) usando HMAC-SHA1 sobre `floor(unixtime/30)`
- **AND** solo tras verificación exitosa persiste `totpSecret` cifrado (AES-256-GCM con clave derivada de JWT_SECRET) y `totpEnabled=true`

#### Scenario: Login con 2FA activo
- **WHEN** POST `/api/auth/login` con credenciales válidas y usuario con `totpEnabled=true`
- **THEN** responde `{ success: true, requiresTotp: true, totpChallengeToken: <jwt corto 2min> }` SIN emitir cookie de sesión completa
- **AND** el cliente pide el código y llama POST `/api/auth/totp/verify` con `{ challengeToken, code }`
- **AND** ese endpoint valida, marca el challengeToken como usado y emite la cookie `rmc-token` definitiva

#### Scenario: Rate limiting en verificación TOTP
- **WHEN** 5 intentos fallidos de código desde misma sesión/IP en 60s
- **THEN** bloquea 15 minutos y fuerza re-login con contraseña
- **AND** registra evento `totp_brute_force`

#### Scenario: Desactivación requiere contraseña + código vigente
- **WHEN** usuario solicita desactivar 2FA
- **THEN** debe proveer contraseña actual Y un código TOTP válido (o uno de recuperación)
- **AND** tras éxito se setea `totpEnabled=false` y se invalidan códigos de recuperación

### Requirement: Configuración SMTP administrativa con prueba de conexión
The system SHALL let administrators configure an internal SMTP mail server through the CMS and validate it with a live test send before enabling notifications.

#### Scenario: CRUD seguro de configuración SMTP
- **WHEN** admin accede a `/cms/configuracion/smtp`
- **THEN** puede establecer host, port (465/587/25), user, password (con toggle de ojo), from address, TLS mode (starttls/ssl/none)
- **AND** la contraseña se guarda cifrada AES-256-GCM en DB; las rutas GET nunca devuelven el plaintext salvo POST `/reveal` protegido por re-auth

#### Scenario: Test de conexión real
- **WHEN** el admin pulsa "Enviar email de prueba"
- **THEN** el servidor intenta conectar con nodemailer (dependency a añadir en P1) usando la config guardada
- **AND** envía un mensaje a la dirección indicada por el admin
- **AND** responde `{ success, messageId?, error? }` con timeout 10s
- **AND** si falla, NO marca `smtpVerified=true`; si pasa, sí

#### Scenario: Notificaciones condicionadas a smtpVerified
- **WHEN** el sistema quiere enviar notificación (respuesta a inquiry, cambio de trámite, etc.)
- **THEN** consulta `SmtpConfig.smtpVerified === true` antes de hacer fetch/send
- **AND** si no está verificado, enqueuea en tabla `PendingNotification` para reintento posterior

### Requirement: Robo de sesión mitigado por binding UA+IP rotativo
The system SHALL bind issued session tokens to a coarse fingerprint (user-agent hash + /24 IPv4 or /48 IPv6) and invalidate on significant drift, reducing stolen-cookie replay.

#### Scenario: Cookie robada desde otro navegador/IP es rechazada
- **WHEN** una cookie `rmc-token` válida llega con User-Agent distinto al grabado en emisión O IP en subred diferente
- **THEN** el handler `requireAuth()` devuelve 401 y limpia la cookie
- **AND** loggea `session_drift_detected`

#### Scenario: Ventana de gracia para roaming móvil
- **WHEN** el cambio es solo de IP dentro de /16 (movil que rota torre) y UA idéntico
- **THEN** acepta y actualiza silenciosamente la huella registrada
- **AND** si hay 3 drifts en 1 hora, fuerza logout completo

### Requirement: Contraste WCAG AA mediante oscurecimiento de accents (Opción A)
The system SHALL meet WCAG 2.1 AA (≥4.5:1 for body text, ≥3:1 for large/UI) by darkening accent colors in `src/lib/themes.ts` rather than swapping palettes.

#### Scenario: Accents terracota/wine/slate/mourning cumplen ratio sobre navy
- **WHEN** se calcula contraste entre `accent` y `background` de cada tema afectado
- **THEN** todos devuelven ratio ≥ 4.5:1
- **AND** los cambios son únicamente reducción de luminosidad (misma familia cromática), sin alterar estructura CSS

#### Scenario: No regresión visual perceptible
- **WHEN** se comparan capturas pre/post del portal en los 4 temas corregidos
- **THEN** la identidad visual se mantiene; solo aumenta legibilidad del texto secundario

### Requirement: Cuota de búsquedas anónimas con defensa en profundidad
The system SHALL limit anonymous denomination searches (`GET /api/search`) to a configurable number of queries per visitor using four simultaneous layers: signed cookie counter, server-side soft fingerprint, CAPTCHA step-up after quota exhaustion, and hard IP rate-limit. Authenticated users receive quotas defined by their role, configured administratively and persisted in the database.

#### Scenario: Anónimo obtiene token firmado al primer acceso
- **GIVEN** visitante sin cookie `rmc-search-quota`
- **WHEN** realiza primera búsqueda GET `/api/search?q=...`
- **THEN** el servidor emite cookie `rmc-search-quota` con payload `{ used: 1, exp: epoch+24h, jti: uuid }` firmada HMAC-SHA256(JWT_SECRET)
- **AND** la cookie es `httpOnly; secure; sameSite=lax; maxAge=86400`
- **AND** el `jti` queda registrado en memoria como token de un solo uso vinculado a esta ventana

#### Scenario: Refrescar navegador renueva token pero NO reinicia contador
- **WHEN** el usuario recarga la página o navega fuera y vuelve
- **THEN** el cliente llama GET `/api/search/quota-refresh` recibiendo NUEVO `jti` con mismo `used` acumulado
- **AND** el `jti` anterior queda invalidado (one-time-use)
- **AND** si intenta reutilizar el `jti` viejo → 403 "Token ya consumido"

#### Scenario: Cookie manipulada es rechazada fail-closed
- **WHEN** llega cookie con firma HMAC inválida O payload alterado (ej. `used: 0` forzado)
- **THEN** el servidor ignora la cookie y trata al visitante como `used = ∞` (cuota agotada)
- **AND** registra evento `quota_cookie_tampered` en SecurityLog
- **AND** fuerza paso inmediato a CAPTCHA step-up

#### Scenario: Fingerprint server-side persiste tras borrar cookies
- **GIVEN** visitante que usó sus 3 búsquedas y luego borra cookies del navegador
- **WHEN** realiza cuarta búsqueda
- **THEN** el servidor computa `fp = sha256(HMAC(JWT_SECRET, "${ip}/24|${uaFamily}|${acceptLang}"))`
- **AND** encuentra entrada previa en Map en-memoria TTL=configurable (default 24h) con `used >= 3`
- **AND** toma `max(cookieUsed, fpUsed)` como contador efectivo
- **AND** responde 429 `{ requiresCaptcha: true, captchaId }` sin ejecutar la query

#### Scenario: CAPTCHA step-up libera cuota temporalmente
- **WHEN** el visitante resuelve correctamente el captcha adjunto al request (params `captchaId` + `captchaAnswer`)
- **THEN** el servidor valida contra `verifyCaptcha()` existente
- **AND** resetea ambos contadores (cookie + fingerprint) a 0
- **AND** emite nueva cookie con `used: 1` y nuevo `jti`
- **AND** procesa la búsqueda normalmente
- **AND** registra evento `quota_captcha_passed`

#### Scenario: Rate-limit duro por IP complementa la cuota
- **WHEN** una misma IP supera `MAX_SEARCH_PER_MIN_IP` (configurable, default 10) aunque tenga cuota disponible
- **THEN** responde 429 genérico sin importar estado de cookie/fingerprint
- **AND** usa `x-real-ip` fijado por proxy con fallback socket

#### Scenario: Usuarios autenticados usan cuota por rol desde BD
- **GIVEN** PortalUser autenticado cuyo rol tiene `searchQuotaPerDay = 50` en tabla `RoleQuotaConfig`
- **WHEN** busca denominaciones
- **THEN** el sistema consulta `SearchUsageCounter(userId, date=today)` en PostgreSQL
- **AND** si `count < 50`, permite y incrementa
- **AND** si `count >= 50`, responde 429 con mensaje "Cuota diaria alcanzada. Espera al próximo día o contacta soporte."
- **AND** NO aplica captcha step-up ni fingerprint (la sesión JWT ya identifica inequívocamente)

#### Scenario: Reset periódico configurable desde administración
- **WHEN** admin cambia `resetPeriodHours` en panel `/cms/configuracion/seguridad/busqueda` de 24 a 12
- **THEN** las nuevas ventanas de cuota usan 12h rolling
- **AND** las cookies/fingerprints existentes siguen su TTL original hasta expirar (no corte brusco)
- **AND** el cambio queda auditado en SecurityLog como `quota_config_updated`

### Requirement: Panel de configuración administrativa de cuotas y paranoia
The system SHALL expose an admin-only CMS section at `/cms/configuracion/seguridad` where administrators can view, edit and persist all security-related thresholds without redeploying code. Configuration lives in table `SecurityConfig` (key-value JSON) and is loaded into memory with cache invalidation on write.

#### Scenario: CRUD seguro de parámetros de búsqueda anónima
- **WHEN** admin accede a pestaña "Búsquedas anónimas"
- **THEN** puede establecer: `anonymousMaxQueries` (int ≥1), `resetPeriodHours` (int 1–168), `requireCaptchaAfterExhaustion` (bool), `rateLimitPerMinuteIp` (int ≥1)
- **AND** cada campo valida rango con Zod antes de persistir
- **AND** botón "Guardar cambios" hace PUT `/api/cms/security-config/search` con `requireAdmin()` + Origin check
- **AND** toast confirma "Configuración de búsqueda actualizada correctamente"

#### Scenario: Configuración de cuotas por rol
- **WHEN** admin abre sub-pestaña "Cuotas por rol"
- **THEN** lista todos los roles de PortalUser (`registrador`, `abogado`, `notario`, etc.) con input numérico `searchQuotaPerDay` por fila
- **AND** valor `-1` significa ilimitado
- **AND** guarda en tabla `RoleQuotaConfig(role TEXT PK, searchQuotaPerDay INT, updatedAt TIMESTAMPTZ)` vía upsert batch
- **AND** seed inicial copia valores actuales desde `.env` o defaults documentados

#### Scenario: Invalidación de caché al guardar
- **WHEN** se persiste cualquier cambio en SecurityConfig o RoleQuotaConfig
- **THEN** el handler dispara `invalidateSecurityCache()` que limpia el Map/TTL interno usado por `/api/search`
- **AND** el siguiente request lee DB fresca
- **AND** loggea evento `security_cache_invalidated` con clave afectada

### Requirement: Módulo paranoia — bloqueo automático de IPs hostiles
The system SHALL implement an opt-in defensive module ("Paranoia Mode") that monitors request patterns across ALL public endpoints and automatically blocks suspicious IPs according to configurable rules, persisting both the blocklist and every triggered event.

#### Scenario: Bloqueo por probes de URLs inexistentes
- **GIVEN** ParanoiaMode activo con `blockAfterMissingUrls = 2` (configurable)
- **WHEN** una IP solicita 3 o más rutas que devuelven 404 en ventana de 5 minutos
- **THEN** se añade la IP a tabla `BlockedIp(ip CIDR, reason TEXT, blockedAt TIMESTAMPTZ, expiresAt TIMESTAMPTZ, hitCount INT)` con `expiresAt = fin del día UTC actual`
- **AND** los siguientes requests desde esa IP reciben 403 inmediato ANTES de cualquier handler (chequeo temprano en cada Route Handler vía helper `checkIpBlocked(req)`)
- **AND** registra evento `paranoia_ip_blocked_scan` con lista de paths intentados

#### Scenario: Bloqueo por volumen de errores 4xx/5xx
- **GIVEN** `blockAfterErrorRate = 20 errores / 60s` (configurable)
- **WHEN** una IP genera >20 respuestas 4xx o 5xx en 60 segundos (incluye 401, 403, 400, 429)
- **THEN** bloqueo temporal configurable (`blockDurationMinutes`, default 60)
- **AND** evento `paranoia_ip_blocked_errors`

#### Scenario: Protección contra desbordamiento de memoria
- **WHEN** cualquier endpoint recibe payload > `maxPayloadBytes` (configurable, default 1MB)
- **THEN** responde 413 sin parsear body completo
- **AND** si la misma IP envía 5 payloads oversize en 10 min → bloqueo paranoia
- **AND** additionally monitorea `process.memoryUsage().heapUsed`; si supera umbral configurable (default 90% de `--max-old-space-size`) durante 3 mediciones consecutivas cada 10s, degrada a modo mantenimiento: devuelve 503 en endpoints no críticos mientras GC corre, y alerta via SMTP/log

#### Scenario: Lista blanca de IPs exentas
- **WHEN** admin agrega IPs/rangos CIDR a `AllowedIp` (localhost, oficinas MINJUS, health-checkers Traefik)
- **THEN** esas IPs nunca son bloqueadas por paranoia aunque superen umbrales
- **AND** el chequeo `checkIpBlocked()` retorna pronto si la IP coincide con whitelist

#### Scenario: Desbloqueo manual y expiración automática
- **WHEN** admin revisa `/cms/configuracion/seguridad/bloqueos`
- **THEN** ve tabla paginada de BlockedIp ordenada por `blockedAt DESC` con columnas: ip, reason, hitCount, blockedAt, expiresAt, acciones [Desbloquear]
- **AND** botón "Desbloquear" elimina la fila Y loggea `paranoia_ip_unblocked` con userId admin
- **AND** cron job horario purga entradas con `expiresAt < now()`

#### Scenario: Toggle global del módulo
- **WHEN** admin establece `paranoiaEnabled = false` en SecurityConfig
- **THEN** TODAS las reglas paranoia quedan inertes inmediatamente (sin necesidad de restart)
- **AND** los bloques existentes permanecen en BD pero no se aplican
- **AND** evento `paranoia_mode_toggled`

### Requirement: Registro centralizado de eventos de seguridad (SecurityLog)
The system SHALL persist every security-relevant event to an append-only table `SecurityLog` queryable from the admin CMS, providing correlation between attacks, defenses triggered and administrative actions.

#### Scenario: Esquema mínimo del log
- **GIVEN** modelo Prisma `SecurityLog { id BIGSERIAL PK, occurredAt TIMESTAMPTZ DEFAULT now(), eventType TEXT NOT NULL, severity ENUM('info','warning','critical'), ip INET, userAgent TEXT, userId UUID NULL, entityId TEXT NULL, metadata JSONB, hashChain CHAR(64) }`
- **WHEN** ocurre cualquier evento listado en esta spec (quota_*, paranoia_*, session_drift_*, login_failed, captcha_*, config_updated, cache_invalidated, ip_blocked/unblocked, payload_oversize, heap_pressure)
- **THEN** se inserta una fila con esos campos
- **AND** `hashChain = sha256(prev.hashChain || canonicalJson(thisRow))` encadenando registros para detectar tampering offline

#### Scenario: Retención y particionado
- **WHEN** crece la tabla
- **THEN** particiona mensualmente por `occurredAt` (declarativo PostgreSQL)
- **AND** retiene 90 días online; más allá exporta a archivo CSV gzip en disco y purge (job nocturno)
- **AND** configura `retentionDays` desde admin

#### Scenario: Vista de auditoría en CMS
- **WHEN** admin navega a `/cms/logs-seguridad`
- **THEN** ve tabla filtrable por: fecha rango, eventType multiselect, severity, IP substring, userId
- **AND** paginación server-side (50 rows/página)
- **AND** botón "Exportar CSV" descarga filtro actual máx 10k filas
- **AND** NO permite editar ni borrar filas individuales (append-only); solo purge automática por antigüedad

#### Scenario: Alertas críticas en tiempo real
- **WHEN** se inserta evento con `severity = 'critical'`
- **THEN** además del INSERT dispara notificación SMTP (si SmtpConfig.verified=true) al correo del admin configurado en `SecurityConfig.alertEmail`
- **AND** throttled a máximo 1 email/cada 5 min por tipo de evento para no saturar

### Requirement: Creación de usuario portal sin carné de identidad y con validaciones estrictas
The system SHALL remove the `identityCard` field from the portal user creation flow and enforce Cuban-phone, strong-password and valid-email validation at both client and server layer. The create dialog must submit via `e.preventDefault()` to preserve the CMS authenticated session.

#### Scenario: Formulario no muestra campo carné
- **WHEN** admin abre diálogo "Crear Usuario" en CMS → portal-users
- **THEN** el formulario solo muestra: Email *, Contraseña *, Nombre, Teléfono, Rol

#### Scenario: Email inválido es rechazado
- **WHEN** body `{ email: "noemail", password: "Str0ng!Pass1!", phone: "+5351234567" }`
- **THEN** responde 400 "Email inválido"; validación cliente también muestra error antes del request

#### Scenario: Teléfono cubano requiere +53 o 8 dígitos
- **WHEN** `phone: "+15551234567"` o `"51234"`
- **THEN** responde 400 "Teléfono cubano inválido (ej: +53 5XXXXXXX)"

#### Scenario: Contraseña débil rechazada con feedback granular
- **WHEN** `{ password: "weak" }`
- **THEN** 400; Zod indica: mínimo 8 chars, al menos una mayúscula, un número, un carácter especial
- **AND** cliente muestra el error correspondiente bajo el campo

#### Scenario: Crear usuario válido persiste
- **WHEN** email válido, password fuerte, teléfono cubano válido, rol existente
- **THEN** responde 201 `{ success: true, data: {...} }`
- **AND** cookie `rmc-token` permanece intacta

#### Scenario: Botón crear no recarga ni pierde sesión
- **WHEN** error en creación (validación, error servidor, sin conexión)
- **THEN** página NO recarga; sesión CMS activa
- **AND** errores se muestran inline o como toast sin cerrar el modal
- **AND** refresco de página mantiene sesión