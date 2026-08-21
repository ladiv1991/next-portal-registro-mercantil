# Revisión de seguridad del portal: front-end, back-end y despliegue

## Resumen ejecutivo

Se identificaron varias vulnerabilidades de alto riesgo en la app, especialmente en la capa de autenticación, uploads y manejo de contenido dinámico. La prioridad más alta es corregir los fallbacks de secretos, desaparecer las credenciales por defecto expuestas, bloquear el acceso directo a archivos subidos y reforzar la validación de entrada y sanitización HTML en los puntos donde se renderiza contenido no confiable.

El proyecto tiene un buen núcleo funcional, pero actualmente no cumple con un nivel mínimo de seguridad de producción para una aplicación con panel CMS y autenticación con cookies. El riesgo real va desde credenciales por defecto visibles en la interfaz y código hasta autenticación portal con contraseña fija y JWT con secreto no obligatorio.

## Alcance revisado

Se revisaron estas áreas:

- Autenticación y autorización CMS/portal
- JWT, cookies y manejo de sesiones
- APIs REST del CMS y portal
- Uploads y almacenamiento de archivos públicos
- Control de encabezados HTTP y seguridad del navegador
- Configuración de Docker/Traefik
- Front-end de contenido dinámico y renderizado HTML
- Datos de configuración y credenciales expuestas en código/repo

## Hallazgos principales

| Severidad | Riesgo | Evidencia | Impacto |
|---|---|---|---|
| Crítica | JWT con secreto por defecto / no obligatorio | `src/lib/auth.ts`, `src/app/api/portal/auth/login/route.ts`, `src/app/api/portal/auth/me/route.ts` | Un atacante con el mismo secreto puede firmar tokens válidos o forjar sesiones |
| Crítica | Login del portal con contraseña fija (`temp-password`) | `src/app/api/portal/auth/login/route.ts` | Bypass directo de autenticación |
| Crítica | Credenciales por defecto visibles en repo, UI y README | `prisma/seed.ts`, `src/components/portal/sections/AccesoSection.tsx`, `README.md`, `scripts/check-auth.js` | Exposición de credenciales admin al usuario final y al repositorio |
| Crítica | Upload sin validación de tipo, tamaño ni contenido | `src/app/api/upload/route.ts`, `src/app/api/cms/procedures/[id]/documents/route.ts` | RCE / XSS / malware / abuso de almacenamiento |
| Alta | Archivos subidos servidos desde `public/uploads` | `src/app/api/upload/route.ts`, `src/app/api/cms/procedures/[id]/documents/route.ts` | Acceso directo y posible ejecución o descarga no autorizada |
| Alta | XSS vía `dangerouslySetInnerHTML` | `src/components/portal/layout/FloatingChatbot.tsx`, `src/components/ui/chart.tsx` | Ejecución de scripts en la UI si el contenido no es sanitizado |
| Alta | Ausencia de cabeceras de seguridad | `next.config.ts` | CSRF, clickjacking, MIME sniffing, contenido inseguro |
| Media | Prisma con `log: ['query']` en producción | `src/lib/db.ts` | Fuga de estructura y datos sensible en logs |
| Media | Traefik/Docker con infraestructura sensible en archivo versionado | `docker-compose.yml` | Fuga de secretos proxy y configuración operativa precisa |
| Media | Falta de rate limiting y protección anti-bruta | APIs de login | Fuerza bruta de credenciales y abuso de CMS |

## Hallazgos detallados

### 1) JWT con secreto por defecto y fallback inseguro

Archivos relevantes:

- `src/lib/auth.ts`
- `src/app/api/portal/auth/login/route.ts`
- `src/app/api/portal/auth/me/route.ts`
- `src/app/api/portal/user/procedures/route.ts`

Problema:

- `src/lib/auth.ts` define `const JWT_SECRET = process.env.JWT_SECRET || 'rmc-cuba-secret-key-2026';`
- El portal usa `process.env.JWT_SECRET || 'fallback-secret'` en varios endpoints
- Si la variable de entorno no está definida, la app sigue funcionando con un valor público y predecible

Riesgo:

- Un atacante que conozca o deduzca el valor puede firmar tokens válidos
- Puede reforzar la autenticidad de sesiones falsas y saltarse la autorización de rutas del portal

Recomendación:

- Hacer que `JWT_SECRET` sea obligatorio y falle el arranque si no existe
- Generar un valor de 32+ bytes aleatorio por ambiente
- Rotar secretos y invalidar sesiones antiguas al cambiar el secreto
- Usar una secret manager: Docker/Kubernetes secrets, GitHub Actions secrets, Vault, Azure Key Vault, etc.

### 2) Login del portal usa contraseña fija y no autenticación real

Archivo relevante:

- `src/app/api/portal/auth/login/route.ts`

Problema:

```ts
const isValidPassword = password === 'temp-password'; // TODO: Implement proper password hashing
```

Esto significa que el login del portal puede autenticarse con una contraseña constante para cualquier usuario válido, sin manejar hashes ni contraseña real. Esto es una vulnerabilidad crítica de autenticación.

Riesgo:

- Cualquier persona que conozca la contraseña constante puede autenticar como cualquier usuario del portal
- Se rompe la confianza del sistema e imposibilita auditoría real de usuarios

Recomendación:

- Reemplazar por `bcrypt.compare` o una implementación equivalente
- Guardar hashes en `portalUser.passwordHash`
- Añadir MFA para acceso sensible si se habilita acceso administrativo o de agentes externos

### 3) Credenciales default exponiendo acceso administrativo

Archivos relevantes:

- `prisma/seed.ts`
- `src/components/portal/sections/AccesoSection.tsx`
- `README.md`
- `scripts/check-auth.js`
- `scripts/reset-admin-password.js`
- `PRONT_HELP.md`
- `PROJECT_INDEX.md`

Problema:

- El seed crea admin con `admin@registromercantil.cu` y contraseña `Admin2026!`
- La UI muestra esas credenciales como “Credenciales de prueba”
- Los docs y scripts del proyecto también las documentan como valores por defecto

Riesgo:

- Si el entorno productivo usa estas credenciales, cualquiera puede identificarlas
- El ataque es más sencillo por la combinación de credenciales conocidas y un panel de admin accesible

Recomendación:

- Eliminar credenciales hardcodeadas del código y de la UI
- Forzar una contraseña aleatoria inicial generada al primer arranque
- Eliminar cualquier referencia a “demo credentials” de la app pública
- Mantener un nombre de usuario y contraseña de producción separados de los valores de seed

### 4) Upload sin validación ni control de contenido

Archivos relevantes:

- `src/app/api/upload/route.ts`
- `src/app/api/cms/procedures/[id]/documents/route.ts`

Problema:

- Los endpoints aceptan cualquier `File`
- No se valida `content-type`
- No se valida tamaño máximo
- No se valida extensión
- No se sanitiza el nombre de archivo
- No se escanea contenido para malware o PDF malicioso
- El archivo se escribe en `public/uploads/...` y se sirve como contenido web directo

Riesgo:

- XSS mediante HTML/JS servido desde el mismo dominio
- RCE si el entorno ejecuta o interpreta ciertos tipos de archivo
- Sobrecarga de disco y abuso de almacenamiento
- Ataques de lateral movement si el host usa rutas accesibles directamente

Recomendación:

- Permit only allowlist: PDF, PNG, JPG, WEBP, SVG sin scripts; si SVG se permite, sanitizarlo/cambiarlo por un servicio de archivos seguros
- Limitar tamaño por tipo
- Crear una carpeta fuera de la raíz pública para archivos no web o usar un almacenamiento externo
- Generar nombres aleatorios y mantener un mapping interno
- Rechazar `application/javascript`, `text/html`, `image/svg+xml` en uploads públicos
- Usar antivirus/clamav si el flujo lo requiere

### 5) XSS por renderizado de contenido HTML no sanitizado

Archivos relevantes:

- `src/components/portal/layout/FloatingChatbot.tsx`
- `src/components/ui/chart.tsx`

Problema:

- `dangerouslySetInnerHTML` se usa para renderizar contenido del chatbot y componentes gráficos
- Si el contenido proviene de IA, texto de usuarios o datos externos, hay riesgo de script injection

Riesgo:

- Ejecutar scripts en el navegador del usuario
- Robo de sesión o manipulaciones de UI

Recomendación:

- Sanitizar con DOMPurify / sanitize-html antes de renderizar
- Usar `dangerouslySetInnerHTML` solo con contenido estrictamente controlado y validado
- No renderizar contenido libre de actores no confiables como HTML bruto
- Aplicar CSP y limitar inline scripts

### 6) Falta de cabeceras de seguridad en la app

Archivo relevante:

- `next.config.ts`

Problema:

- No se encuentra configuración de seguridad por cabeceras HTTP
- No hay `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`

Riesgo:

- Clickjacking
- MIME confusion
- XSS más fácil de ejecutar
- Fuga de origen de referencia

Recomendación:

- Configurar cabeceras en `next.config.ts` con `async headers()`
- CSP recomendada mínima: default-src 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
- En producciones HTTPS: HSTS con `max-age=31536000; includeSubDomains`

### 7) Autorización débil y no consistente

Archivos relevantes:

- `src/lib/api-auth.ts`
- `src/app/api/blocks/route.ts`
- `src/app/api/pages/route.ts`
- `src/app/api/cms/procedures/[id]/documents/route.ts`
- `src/app/api/menus/route.ts`

Problema:

- La app usa `requireAuth` y `requireAdmin`, pero hay varias rutas y endpoints que no se revisan de forma uniforme
- El patrón básico depende del token JWT en cookie, sin control adicional para CSRF, sin revocación centralizada y sin auditoría de intentos no autorizados

Riesgo:

- Exposición de endpoints administrativos
- Ejecutar acciones CMS si el JWT es robado o replayed

Recomendación:

- Revisar cada ruta con matriz de permisos
- Definir roles: `admin`, `editor`, `viewer`, `portal-user`
- Añadir `csrf` para mutaciones por cookies en navegadores
- Añadir `last login`, `ip` y auditoría de acciones intensivas
- Usar RBAC centralizado y no lógica dispersa

### 8) Logs de Prisma revelando estructura del sistema

Archivo relevante:

- `src/lib/db.ts`

Problema:

```ts
new PrismaClient({ log: ['query'] })
```

Esto registra todas las queries en producción y puede filtrar información sensible y estructural. Además expone patrones de acceso a tablas y columnas.

Recomendación:

- Eliminar `log: ['query']` en producción
- Activar un nivel de log menor, exclusivamente en staging/debug
- Centralizar logs en un sistema de observabilidad seguro

### 9) Configuración de Docker/Traefik con secretos y red irrelevante en repositorio

Archivo relevante:

- `docker-compose.yml`

Problema:

- Hay proxies HTTP con credenciales embebidas:

```yaml
HTTP_PROXY: http://voacosta:L4d1v*ok@10.12.0.205:3128
HTTPS_PROXY: http://voacosta:L4d1v*ok@10.12.0.205:3128
```

- La configuración de `DOCKER_REGISTRY` y secretos del stack está en un archivo de configuración que se comparte y se replica
- Existen puntos de exposición del servicio de administración de Traefik en el puerto 8081/8082 sin un control de acceso más robusto

Riesgo:

- Fuga de credenciales del entorno corporativo
- Exposición de una API de administración sin autenticación dura

Recomendación:

- Mover secretos a `.env` local fuera del repo o a secret manager
- Eliminar credenciales proxy habitualmente en repo
- Restringir Traefik a la red privada y/o autenticación protegida
- Usar reverse proxy con TLS real y no `api.insecure=true` y un dashboard público

### 10) Carencia de rate limiting y protección anti-bruta

Archivos relevantes:

- `src/app/api/auth/login/route.ts`
- `src/app/api/portal/auth/login/route.ts`

Problema:

- Los endpoints de login no tienen throttling
- No hay control de intentos fallidos por IP o usuario
- El patrón es susceptible a fuerza bruta y enumeración de usuarios

Recomendación:

- Añadir rate limiting por IP y por email con Redis o middleware
- Bloquear durante 15-30 minutos después de varios fallos
- Registrar intentos fallidos con ips y user-agent
- Añadir CAPTCHA o protección por reCAPTCHA si la app pública lo necesita

## Plan de mejora y remediación priorizado

### Fase 0: Contención inmediata (0-72 horas)

1. Rotar todos los secretos de la app
   - `JWT_SECRET`
   - `CMS_ADMIN_PASSWORD`
   - `NEXTAUTH_SECRET` si se usa más adelante
   - cualquier secreto proxy o API del proyecto
2. Eliminar credenciales por defecto del código y de la UI
   - retirar `Admin2026!` y `temp-password` del código
3. Deshabilitar o bloquear acceso público a `public/uploads`
   - mover archivos a almacenamiento seguro o crear un directorio no web
4. Poner en producción `bcrypt` real en el login del portal
   - eliminar la validación fijo `password === 'temp-password'`
5. Revisión rápida de endpoints críticos
   - `POST /api/auth/login`
   - `POST /api/portal/auth/login`
   - cualquier endpoint con `requireAdmin` y upload

### Fase 1: Corregir vulnerabilidades críticas (1-2 semanas)

1. Secret management
   - crear `.env.example` limpio sin valores reales
   - usar un secret manager o variables de entorno protegidas por el entorno de despliegue
2. Autenticación y autorización
   - usar RBAC explícito y centralizado
   - activar CSRF para cookies de sesión con `SameSite=Lax` o `Strict` según el caso
   - validar sesión de forma consistente y revocar tokens
3. Upload seguro
   - permitir solo tipos específicos
   - definir límites por tipo + tamaño
   - guardar archivo fuera de `public`
   - generar nombres aleatorios y protección por MIME
4. Sanitización
   - DOMPurify para chat / contenido HTML / markdown
   - aislar cualquier HTML dinámico
5. Headers
   - CSP, HSTS, frame-ancestors, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

### Fase 2: Defensa de la capa de aplicación (2-4 semanas)

1. Rate limiting
   - por IP y por usuario en autenticación
   - Redis o middleware de tráfico
2. Auditoría y trazabilidad
   - registro de acciones CMS con usuario y timestamp
   - alerts sobre cambios sensibles de permisos y subidas
3. Seguridad de infraestructura
   - Traefik con acceso restringido
   - quitar `api.insecure=true` o protegerlo con autenticación fuerte
   - cerrar puertos innecesarios
4. Dependencias y escaneo
   - hacer `npm audit` / `npm audit fix`
   - revisar paquetes desactualizados y vulnerables
   - activar SAST / dependency scanning en CI

### Fase 3: Madurez y continuidad (mensual)

1. Penetration testing
   - login, upload, XSS, CSRF, privilege escalations, IDOR
2. Security champions
   - revisión de PR con checklist de seguridad
3. Observabilidad
   - alertas sobre intentos fallidos y comportamiento anómalo
4. Hardening de despliegue
   - TLS, WAF, reverse proxy seguro, `allowlist` de accesos

## Checklist de cumplimiento mínimo antes de producción

- [ ] JWT_SECRET obligatorio y no nulo
- [ ] No existen credenciales admin visibles en repo/UI/docs
- [ ] El login del portal usa hashes reales y elimina `temp-password`
- [ ] El upload solo acepta tipos permitidos y tamaño limitado
- [ ] Archivos no se publican directamente desde `public/uploads`
- [ ] CSP y cabeceras HTTP aplicadas
- [ ] `dangerouslySetInnerHTML` solo con contenido sanitizado
- [ ] Rate limiting en login / autenticación
- [ ] RBAC bien definido y consistente para todas las rutas CMS
- [ ] No hay secretos en docker-compose o archivos versionados
- [ ] Logs de BD y errores no revelan información sensible

## Recomendación final

## Cambios aplicados en esta ejecución

- [x] JWT CMS y portal sin secretos fallback; `JWT_SECRET` exige al menos 32 caracteres.
- [x] Tokens portal firmados y verificados centralmente; se eliminó el uso de Base64 como autenticación.
- [x] Login portal sin contraseña fija; requiere `PortalUser.passwordHash` con bcrypt.
- [x] Upload genérico y de documentos protegido con `requireAdmin`.
- [x] Límites separados por `.env`: `UPLOAD_MAX_FILE_MB`, `UPLOAD_MAX_IMAGE_MB`, `UPLOAD_MAX_DOCUMENT_MB` y `UPLOAD_MAX_VIDEO_MB`.
- [x] Validación de carpeta, MIME, extensión y nombre aleatorio para uploads.
- [x] Logs de queries Prisma reducidos en producción.
- [x] Secretos de PostgreSQL y proxy retirados de `docker-compose.yml`.
- [x] Cabeceras HTTP de protección configuradas en `next.config.ts`.

Pendientes que requieren una decisión operativa o infraestructura externa:

- [ ] Migrar los archivos existentes fuera de `public/uploads` y servirlos mediante endpoint autorizado o almacenamiento privado.
- [ ] Implementar el intercambio real del código OAuth con ENZONA; el callback de demostración no debe habilitarse en producción.
- [ ] Añadir rate limiting distribuido y pruebas automatizadas de CSRF/XSS.
- [ ] Rotar inmediatamente los secretos que hayan estado expuestos antes de esta corrección.

La prioridad absoluta es bloquear las rutas de autenticación y uploads antes de seguir con mejoras “estéticas”. Si no se corrigen los fallbacks de secretos, la contraseña fija del portal y el upload sin validación, la aplicación estará en una condición insegura para cualquier despliegue con acceso externo.

## Siguientes pasos concretos

1. Rotar secretos de sesión y admin
2. Eliminar `temp-password` y dummy login
3. Aislar o bloquear archivos subidos desde `public/uploads`
4. Implementar CSP y headers HTTP
5. Sanitizar HTML de chatbot
6. Añadir throttling y registro de actividad
7. Revisar permisos por role en cada API
8. Ejecutar escaneo de dependencias y pruebas de XSS/CSRF

## Evidencia de hallazgos

- `src/lib/auth.ts`: fallback de secreto JWT
- `src/app/api/portal/auth/login/route.ts`: contraseña fija `temp-password`
- `prisma/seed.ts`: usuario admin por defecto y contraseña conocida
- `src/components/portal/sections/AccesoSection.tsx`: exposición de credenciales de prueba
- `src/app/api/upload/route.ts`: upload de archivos sin validación
- `src/app/api/cms/procedures/[id]/documents/route.ts`: escritura directa a `public/uploads`
- `src/components/portal/layout/FloatingChatbot.tsx`: `dangerouslySetInnerHTML`
- `next.config.ts`: ausencia de cabeceras de seguridad
- `docker-compose.yml`: credenciales y configuración sensible en archivo versionado

## Recomendación de priorización

- Crítica: autenticación, JWT, secretos, upload
- Alta: XSS, headers, permisos y rate limiting
- Media: logging, hardening y observabilidad

Este plan permite reducir el riesgo de una forma ejecutable y medible, evitando una corrección superficial que deje huecos críticos en la capa de seguridad del portal.
