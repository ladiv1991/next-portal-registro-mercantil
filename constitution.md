# Constitución del Portal del Registro Mercantil de Cuba

> Este documento define los principios inmutables que rigen todo desarrollo, modificación y despliegue del Portal del Registro Mercantil de Cuba. Ningún cambio de código, arquitectura o infraestructura puede violar estos principios sin una revisión explícita y documentada de esta constitución.

**Alcance**: Portal público + CMS administrativo (core del sistema).  
**Versión**: 1.1.0 — Octubre 2026

---

## Artículo I: Seguridad y Datos Sensibles

### 1.1 Credenciales y secretos
- **Ningún secreto** (`JWT_SECRET`, claves API, credenciales de base de datos, consumer keys de ENZONA) debe estar hardcodeado en el código fuente. Todo valor sensible se gestiona exclusivamente mediante variables de entorno (`.env` / `.env.local`).
- El archivo `.env.local` está excluido del control de versiones y del grafo de Graphify. Nunca se commitea.
- En producción, `JWT_SECRET` debe ser un valor criptográficamente aleatorio de al menos 32 caracteres.

### 1.2 Autenticación y autorización
- La autenticación del CMS usa JWT almacenado en cookie `rmc-token` con expiración máxima de 8 horas.
- Las contraseñas se hashean con bcrypt (coste mínimo 12).
- Toda ruta del CMS (`/api/cms/*`) debe pasar por el middleware `requireAuth()` definido en `src/lib/api-auth.ts`.
- Las rutas que modifican configuración crítica requieren `requireAdmin()`.
- Los endpoints públicos (`/api/public/*`, `/api/search`) no exponen datos sensibles ni internos.

### 1.3 Protección de datos
- No se registran (log) tokens JWT completos, contraseñas ni claves API en ningún log de servidor o cliente.
- El contenido Markdown renderizado en el portal se sanitiza para prevenir XSS.
- CSRF se mitiga mediante la configuración `SameSite=Lax` de las cookies.
- Los archivos subidos por usuarios se validan por tipo MIME y tamaño máximo antes de persistirse.

### 1.4 Límites de subida de archivos
- Se respetan los límites definidos en variables de entorno: `UPLOAD_MAX_FILE_MB`, `UPLOAD_MAX_IMAGE_MB`, `UPLOAD_MAX_DOCUMENT_MB`, `UPLOAD_MAX_VIDEO_MB`.

---

## Artículo II: Accesibilidad WCAG 2.1 AA

### 2.1 Compromiso obligatorio
- Todo componente visible en el portal público y en el CMS debe cumplir con los criterios de éxito de nivel AA de WCAG 2.1 como mínimo.
- Esto no es opcional ni aspiracional; es un requisito de aceptación para cualquier PR.

### 2.2 Contraste de colores
- La paleta oficial del proyecto es la MINJUS, diseñada para cumplir contraste AA:
  - Primario `#005A9C` → texto e iconos sobre fondos claros (ratio >4.5:1 ✅)
  - Primario claro `#0074C8` → acentos y enlaces
  - Fondo `#FFFFFF` → fondos de secciones claras
  - Superficie `#F2F4F7` → cards y áreas elevadas
  - Texto secundario `#6B7280` → descripciones y metadatos (ratio 4.68:1 ✅)
  - Texto principal `#1F2937` → títulos y texto cuerpo (ratio 13.5:1 ✅)
- Las variables CSS `--rm-primary`, `--rm-primary-light`, `--rm-bg`, `--rm-surface`, `--rm-muted`, `--rm-text` se definen en `globals.css` y son el único medio para usar estos colores en componentes.

### 2.3 Navegación por teclado
- Toda funcionalidad interactiva debe ser operable mediante teclado (Tab, Enter, Escape, flechas).
- Los componentes shadcn/ui (basados en Radix UI) ya proveen esta base; los componentes custom deben mantenerla.

### 2.4 Semántica y ARIA
- Usar elementos HTML semánticos (`<nav>`, `<main>`, `<section>`, `<article>`, `<button>` en lugar de `<div onClick>`).
- Añadir atributos ARIA cuando la semántica HTML nativa no sea suficiente para describir el propósito de un widget.

---

## Artículo III: Arquitectura Next.js App Router

### 3.1 Estructura obligatoria
- El proyecto usa **Next.js App Router** (directorio `src/app/`). No se permite el uso de Pages Router (`pages/`).
- La estructura de carpetas es ley:

```
src/
├── app/
│   ├── api/          # Endpoints REST (Server-side)
│   ├── portal/       # Rutas públicas del portal
│   ├── auth/         # Rutas de autenticación
│   ├── layout.tsx    # Layout raíz con providers
│   └── page.tsx      # Página principal (orquestador)
├── components/
│   ├── cms/          # Componentes del panel administrativo
│   ├── portal/       # Componentes del portal público
│   │   ├── layout/   # Header, Footer, Chatbot, ThemeSwitcher
│   │   └── sections/ # HomeSection, ConsultasSection, etc.
│   └── ui/           # Componentes shadcn/ui (no modificar manualmente)
├── lib/              # Utilidades compartidas (auth, db, cms-handler)
├── hooks/            # Custom React hooks
└── data/             # Configuración y datos estáticos
```

### 3.2 Server Components vs Client Components
- **Por defecto, todo componente es Server Component**. Solo se añade `'use client'` cuando el componente necesita hooks (`useState`, `useEffect`), event handlers del navegador o APIs del DOM.
- Los componentes de `src/components/ui/` (shadcn/ui) son Client Components por naturaleza; no convertirlos a Server Components.
- Las API Routes (`src/app/api/`) se ejecutan exclusivamente en el servidor.

### 3.3 Path alias
- Siempre usar el alias `@/*` (mapeado a `./src/*` en `tsconfig.json`) para imports. Nunca usar rutas relativas profundas como `../../../lib/db`.

### 3.4 Providers
- Los providers globales (tema, autenticación, toaster) se configuran en `src/app/layout.tsx`. No duplicar providers en layouts anidados salvo necesidad explícita.

---

## Artículo IV: Estándares de API

### 4.1 Formato de respuesta
Toda API Route devuelve JSON con esta estructura consistente:

```json
{
  "success": true | false,
  "data": { ... } | [ ... ] | null,
  "error": "mensaje descriptivo" | null
}
```

- Respuestas exitosas: `success: true`, `data` con el payload, `error: null`.
- Errores: `success: false`, `data: null`, `error` con mensaje claro.
- No devolver estructuras ad-hoc fuera de este formato.

### 4.2 Validación de entrada
- Usar **Zod** para validar payloads de entrada (POST/PUT) en todas las rutas que reciban datos del usuario.
- No confiar en la validación del frontend como única capa de seguridad.

### 4.3 Métodos HTTP
- `GET` → Lectura (sin efectos secundarios)
- `POST` → Creación
- `PUT` → Actualización completa
- `DELETE` → Eliminación
- Respetar la semántica REST. No usar POST para operaciones de lectura.

### 4.4 Manejo de errores
- Capturar todos los errores en API Routes con try/catch.
- Devolver códigos HTTP apropiados (400 para validación, 401 para auth, 403 para permisos, 404 para no encontrado, 500 para errores internos).
- Nunca exponer stack traces ni detalles internos de la base de datos al cliente.

### 4.5 Fetching en cliente
- Usar `fetch` con `credentials: 'include'` para enviar cookies de autenticación.
- Preferir **TanStack Query** (`@tanstack/react-query`) para fetching, caché e invalidación en el portal público.

---

## Artículo V: Base de Datos y Migraciones

### 5.1 ORM y esquema
- El ORM es **Prisma**. El esquema canónico vive en `prisma/schema.prisma`.
- La base de datos de producción es **PostgreSQL 15+**. SQLite se usa únicamente para desarrollo local.
- El cliente Prisma se instancia como singleton en `src/lib/db.ts`. No crear múltiples instancias.

### 5.2 Migraciones
- Las migraciones se ejecutan automáticamente antes de `dev`, `build` y `start` mediante el prehook `scripts/run-migrations.js`.
- Comandos oficiales:
  - `npm run db:push` → Sincronizar esquema con BD (desarrollo)
  - `npm run db:generate` → Regenerar Prisma Client después de cambios en el schema
  - `npm run db:migrate:all` → Ejecutar push + generate
  - `npm run db:migrate:all:seed` → Push + generate + seed
  - `npm run db:reset` → Reset completo + seed

### 5.3 Seeds
- Los datos iniciales se cargan desde `prisma/seed.ts` (contenido principal) y `prisma/seed-guides.ts` (guías y glosario).
- El seed crea usuarios por defecto: `admin@registromercantil.cu` / `Admin2026!` y `editor@registromercantil.cu` / `Editor2026!`. Esto es por diseño, no un bug.
- Después de un reset de BD, siempre ejecutar el seed.

### 5.4 Backups
- Antes de cualquier despliegue a producción, crear backup de la base de datos.
- Scripts disponibles: `scripts/backup-db.sh` y `scripts/restore-db.sh`.
- Los backups se almacenan en el directorio `backups/`.
- Comando manual: `docker exec registro-mercantil-postgres pg_dump -U portal_rmc -d registro_mercantil > backups/backup_$(date +%Y%m%d_%H%M%S).sql`

### 5.5 Modelos
- Al añadir un nuevo modelo: actualizar `schema.prisma` → `db:generate` → `db:push` → crear CRUD en CMS (componente + API) → añadir al sidebar → incluir en `/api/public/content` si es público.

---

## Artículo VI: Despliegue y Docker

### 6.1 Entornos
- **Desarrollo local**: `npm run dev` en puerto 3008. Logs en `dev.log`.
- **Docker local**: `docker compose up -d --build` en puerto 3003.
- **Producción**: Build standalone con Docker + Traefik o Caddy como proxy inverso.

### 6.2 Docker Compose
- El stack incluye: aplicación (app), PostgreSQL (postgres) y Traefik (traefik).
- Dentro de la red Docker, la app conecta a `postgres:5432`. Desde el host se expone en `localhost:5433`.
- Variables de entorno en producción usan `DATABASE_URL=postgresql://portal_rmc:...@postgres:5432/registro_mercantil`.

### 6.3 Script de despliegue
- El despliegue completo se realiza con `bash scripts/deploy.sh [DNS]`.
- Este script actualiza `.env`, `NEXT_PUBLIC_APP_URL`, configura la regla Host de Traefik, inicia PostgreSQL, crea backup, aplica Prisma, ejecuta seed y publica la aplicación.
- Soporta modos de registro Docker: `DOCKER_REGISTRY_MODE=auto|public|private`.
- Para HTTPS: `PORTAL_SCHEME=https bash scripts/deploy.sh <dns>`.

### 6.4 Proxy inverso
- **Traefik** es el proxy inverso por defecto en Docker.
- **Caddy** es alternativa soportada (ver `Caddyfile`).
- En producción, siempre usar HTTPS terminal detrás del proxy inverso.

### 6.5 Build standalone
- El build genera un bundle standalone: `next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/`.
- El start en producción usa: `NODE_ENV=production node .next/standalone/server.js`.

### 6.6 Verificación post-deploy
- Tras cada despliegue, verificar:
  ```bash
  docker ps
  docker compose logs -f app postgres traefik
  npm run auth:check
  ```

---

## Artículo VII: Convenciones de Código

### 7.1 Lenguaje y tipado
- Todo el código se escribe en **TypeScript**. No se permiten archivos `.js` nuevos en `src/` (excepto scripts de utilidad en `scripts/`).
- Evitar `any`. Usar tipos específicos o `unknown` con narrowing.

### 7.2 Estilo
- ESLint configurado en `eslint.config.mjs`. Ejecutar `npm run lint` antes de commitear.
- Preferir Tailwind utility classes. Las clases personalizadas se definen en `globals.css`.
- Los componentes shadcn/ui en `src/components/ui/` se gestionan vía CLI (`npx shadcn@latest add`). No editar manualmente salvo necesidad extrema.

### 7.3 Nomenclatura
- Archivos de componentes: PascalCase (`PortalHeader.tsx`, `CmsDashboard.tsx`)
- Archivos de utilidades: kebab-case (`api-auth.ts`, `cms-handler.ts`)
- Carpetas: kebab-case o lowercase (`portal/sections/`, `cms/`)
- Variables y funciones: camelCase
- Constantes globales: UPPER_SNAKE_CASE

### 7.4 Commits
- Mensajes descriptivos. Si el proyecto adopta Conventional Commits, seguirlo consistentemente.

---

## Artículo VIII: Herramientas de IA para Agentes

### 8.1 Grafo de conocimiento (Graphify)
- El repositorio está indexado por Graphify. Antes de usar `grep` o leer archivos directamente, consultar el grafo con `graphify query`, `graphify path` o `graphify explain`.
- Después de modificar código, ejecutar `graphify update .` para mantener el grafo actualizado.

### 8.2 Memoria persistente (Engram)
- Toda decisión arquitectónica, fix de bug o convención nueva se guarda proactivamente en Engram con `mem_save`.
- Al iniciar sesión, cargar contexto previo con `mem_context()`.

### 8.3 Documentación de librerías (Context7)
- Para dudas sobre frameworks o librerías, consultar Context7 antes de asumir comportamiento basado en conocimiento general.

---

## Cláusula de Enmienda

Esta constitución puede ser modificada únicamente mediante:
1. Propuesta documentada explicando el motivo del cambio.
2. Revisión y aprobación del equipo de desarrollo.
3. Actualización del número de versión en este documento.
4. Registro del cambio en `worklog.md`.

Los principios de **seguridad**, **accesibilidad** y **formato de API** son considerados fundamentales y requieren justificación extraordinaria para su modificación.

---

*Documento creado: 22 de octubre de 2026*  
*Propiedad del Registro Mercantil de Cuba*

</content>