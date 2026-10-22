# Portal del Registro Mercantil de Cuba

[![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.2-2D3748)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)](https://postgresql.org/)

Portal digital oficial del Registro Mercantil de Cuba. Plataforma completa para consultas públicas, trámites digitales y gestión administrativa del registro mercantil.

## 🚀 Características Principales

### 📊 Portal Público
- **Búsqueda de Sociedades**: Consulta información pública de empresas inscritas
- **Trámites Digitales**: Inicia procesos de constitución, modificaciones y certificaciones
- **Información Regulatoria**: Acceso a normativas, procedimientos y guías
- **Estadísticas**: Datos actualizados del registro mercantil
- **Chatbot IA**: Asistencia inteligente para consultas

### 🔧 Panel de Administración (CMS)
- **Gestión de Contenido**: Sliders, servicios, noticias, procedimientos
- **Control de Usuarios**: Administración de administradores y editores
- **Configuración del Chatbot**: Personalización de respuestas IA
- **Gestión de Archivos**: Upload y organización de documentos

### 🔍 Funcionalidades Avanzadas
- **Búsqueda Inteligente**: Insensible a mayúsculas y signos de puntuación
- **API RESTful**: Endpoints completos para integración
- **Responsive Design**: Optimizado para desktop y móvil
- **Accesibilidad WCAG 2.1 AA**: Cumple estándares de accesibilidad

## 🛠️ Tecnologías

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: PostgreSQL 15 (producción), SQLite (desarrollo)
- **Autenticación**: JWT con bcrypt
- **Despliegue**: Docker, Traefik, Caddy
- **IA**: OpenAI-compatible providers (soporte para múltiples proveedores)

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/                 # 31+ endpoints API
│   │   ├── auth/           # Autenticación JWT
│   │   ├── cms/            # CRUD contenido CMS
│   │   ├── chat/           # Endpoints chatbot IA
│   │   ├── public/         # Contenido público
│   │   └── upload/         # Gestión de archivos
│   ├── layout.tsx          # Layout raíz con providers
│   └── page.tsx            # Homepage del portal
├── components/
│   ├── cms/                # 22 componentes admin
│   ├── portal/             # Secciones públicas
│   └── ui/                 # 48 componentes shadcn/ui
├── lib/                    # Utilidades compartidas
├── hooks/                  # Hooks personalizados
└── data/                   # Configuración y datos estáticos

prisma/
├── schema.prisma           # 18 modelos de datos
└── seed.ts                 # Script de inicialización

public/uploads/             # Archivos subidos por usuarios
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** 18+ o **Bun** (recomendado)
- **Docker** y **Docker Compose**
- **PostgreSQL** 15 (o usar Docker)

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd registro-mercantil-portal
```

### 2. Instalar Dependencias

```bash
# Con Bun (recomendado)
bun install

# O con npm
npm install
```

### 3. Configurar Variables de Entorno

El archivo `.env` se genera automáticamente. Variables principales:

```env
# Base de datos
DATABASE_URL=postgresql://portal_rmc:PortalRMC2026!Secure@localhost:5432/registro_mercantil

# Autenticación
JWT_SECRET=08cfae71dc1f8381130135ef05099cb84a8965f9013e4b5d1a48531d468998f0

# URL pública
NEXT_PUBLIC_APP_URL=http://registro-mercantil.xetid.cu:8081
```

### 4. Configurar Base de Datos

## 🚀 Instalación y configuración

### Requisitos

- Node.js 20+
- npm o bun
- Docker y Docker Compose
- PostgreSQL 15 (se recomienda usar el contenedor incluido en el proyecto)

### 1) Clonar y preparar el entorno

```bash
git clone <repo-url>
cd next-portal-registro-mercantil
npm install
```

Si prefieres `bun`, también funciona:

```bash
bun install
```

### 2) Variables de entorno

Crea un `.env` o `.env.local` con estas variables básicas:

```env
DATABASE_URL=postgresql://portal_rmc:PortalRMC2026!Secure@localhost:5433/registro_mercantil
JWT_SECRET=change-this-secret-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3003

# Secretos y límites de archivos
JWT_SECRET=genere-un-secreto-aleatorio-de-al-menos-32-caracteres
UPLOAD_MAX_FILE_MB=5
UPLOAD_MAX_IMAGE_MB=5
UPLOAD_MAX_DOCUMENT_MB=20
UPLOAD_MAX_VIDEO_MB=100
```

> En Docker Compose la aplicación usa `postgres:5432` dentro de la red de contenedores, mientras que desde el host se expone en `localhost:5433`.

### 3) Base de datos

El proyecto usa Prisma y ejecuta una sincronización automática con `db push` antes de arrancar la app.

#### Opción A: contenedor PostgreSQL del proyecto

```bash
docker compose up -d postgres
npm run db:migrate:all
npm run db:migrate:all:seed
```

#### Opción B: iniciar todo el stack

```bash
docker compose up -d --build
```

Esto levanta la aplicación, PostgreSQL y Traefik. La app queda en:

- Desarrollo local: http://localhost:3008
- Docker local: http://localhost:3003
- Traefik: http://localhost:8082

## ✅ Usuarios por defecto y autenticación

El proyecto tiene dos cuentas semilla por diseño:

- admin@registromercantil.cu / Admin2026!
- editor@registromercantil.cu / Editor2026!

Esto no es un error: el seed crea un usuario administrador y otro editor para el CMS. Si el sistema dice "usuario o contraseña incorrectos" pero la contraseña es correcta, normalmente se debe a una de estas causas:

1. La app está apuntando a otra base de datos o a un contenedor viejo.
2. Hay sesión/cookie vieja en el navegador.
3. El contenedor de la app se está ejecutando sin la última base de datos inicializada.

### Verificar autenticación

```bash
npm run auth:check
```

### Reforzar contraseña del admin

```bash
npm run auth:reset-admin
```

También se puede pasar un email y contraseña manuales:

```bash
node scripts/reset-admin-password.js --email admin@registromercantil.cu --password Admin2026!
```

## 🏃 Desarrollo local

```bash
npm run dev
```

El arranque incluye el prehook de Prisma y refleja los logs en `dev.log`.

### Comandos frecuentes

```bash
npm run lint
npm run build
npm run start
npm run db:generate
npm run db:push
npm run db:reset
npm run seed
npm run db:backup
npm run db:restore
```

## 🚀 Despliegue con Docker

### Construir y levantar

```bash
docker compose up -d --build
```

### Despliegue completo con dominio y migraciones

El script solicita el DNS del portal y actualiza automáticamente `.env`, `NEXT_PUBLIC_APP_URL` y la regla `Host` de Traefik. También inicia PostgreSQL, crea un backup previo, aplica Prisma, ejecuta el seed y publica la aplicación:

```bash
bash scripts/deploy.sh
```

También se puede pasar el DNS como argumento:

```bash
bash scripts/deploy.sh portal.registromercantil.cu
```

Por defecto se usa `http`. Para HTTPS:

```bash
PORTAL_SCHEME=https bash scripts/deploy.sh portal.registromercantil.cu
```

Variables opcionales:

```bash
SEED_DATABASE=false bash scripts/deploy.sh portal.registromercantil.cu
BACKUP_BEFORE_DEPLOY=false bash scripts/deploy.sh portal.registromercantil.cu
PROJECT_DIR=/opt/portal-mercantil bash scripts/deploy.sh portal.registromercantil.cu
```

El script también valida el registro Docker configurado en `DOCKER_REGISTRY`. En modo `auto` (por defecto), si el registro privado no tiene conectividad, usa automáticamente Docker Hub para `node`, `postgres` y `traefik`:

```bash
# Usar siempre Docker Hub
DOCKER_REGISTRY_MODE=public bash scripts/deploy.sh portal.registromercantil.cu

# Usar obligatoriamente el registro privado; falla si no es accesible
DOCKER_REGISTRY_MODE=private bash scripts/deploy.sh portal.registromercantil.cu
```

El error `failed to fetch oauth token` junto con `no route to host` indica que el registro privado no es alcanzable desde el servidor. No es un error de Prisma ni de la aplicación.

El DNS debe tener un registro `A` o `CNAME` apuntando al servidor donde se ejecuta Traefik. El script configura el enrutamiento, pero no puede crear el registro DNS en el proveedor externo.

### Verificar estado

```bash
docker ps
docker compose logs -f app postgres traefik
```

### Configurar dominios públicos

```bash
npm run app:configure-domains
```

Este script genera la configuración necesaria para la app según los dominios y la URL pública del entorno.

### Variables de ejemplo para producción

```env
DATABASE_URL=postgresql://portal_rmc:PortalRMC2026!Secure@postgres:5432/registro_mercantil
JWT_SECRET=mi_secreto_super_seguro
NEXT_PUBLIC_APP_URL=https://portal-registromercantil.test.xutil.cu
```

## 🧱 Migraciones y semillas

El proyecto incluye automatización para mantener la base de datos consistente:

```bash
npm run db:migrate:all
npm run db:migrate:all:seed
```

Estas órdenes ejecutan:

- `prisma db push`
- `prisma generate`
- `prisma/seed.ts` si se incluye `--seed`

También se ejecutan automáticamente antes de `dev`, `build` y `start` por los hooks de package.json.

## 💾 Backups y restauración de la base de datos

### Copia de seguridad manual

```bash
docker exec registro-mercantil-postgres pg_dump -U portal_rmc -d registro_mercantil > backups/backup_$(date +%Y%m%d_%H%M%S).sql
docker exec registro-mercantil-postgres pg_dump -U portal_rmc -d registro_mercantil | gzip > backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restauración

```bash
docker compose down app
gunzip -c backups/backup_20250101_120000.sql.gz | docker exec -i registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil
docker compose up -d app
```

### Scripts automatizados

```bash
bash scripts/backup-db.sh
bash scripts/restore-db.sh backups/backup_20250101_120000.sql.gz
```

Los scripts están diseñados para crear y restaurar copias de seguridad desde PostgreSQL con gestión de nombre y compresión.

## 📜 Logs

### Logs del proyecto

```bash
tail -f dev.log
tail -f server.log
```

### Logs de Docker

```bash
docker compose logs -f app
docker compose logs -f postgres
docker compose logs -f traefik
```

### Diagnóstico rápido de autenticación

```bash
npm run auth:check
docker compose logs -f app | grep -i "auth\|login\|jwt\|prisma"
```

## 🐛 Problemas comunes

### Error: login falla incluso con credenciales correctas

1. Borra cookies del navegador para el dominio actual.
2. Verifica que el contenedor que estás usando apunta a la misma base de datos.
3. Revisa que el usuario exista y esté activo:

```bash
npm run auth:check
```

4. Si el problema persiste, restaura la contraseña del admin:

```bash
npm run auth:reset-admin
```

### Error: el contenedor no arranca

```bash
docker compose down
docker compose up -d --build
docker compose logs -f app
```

### Error: build falla por Node o .next

```bash
rm -rf .next node_modules
npm install
npm run build
```

### Puerto ocupado

```bash
lsof -i :3008
lsof -i :3003
```

Si hace falta, libera el puerto manualmente:

```bash
fuser -k 3008/tcp
fuser -k 3003/tcp
```

## 🔒 Seguridad recomendada para producción

- Cambia `JWT_SECRET` por un valor fuerte.
- Usa HTTPS terminal y proxy inverso como Traefik/Caddy.
- No dejes credenciales de producción en repositorios públicos.
- Haz backups periódicos e incluye una comprobación de integridad de la base de datos.

## 🤖 Configuración del chatbot IA

Desde el CMS se puede configurar el proveedor compatible con OpenAI:

1. Entrar al panel del CMS.
2. Ir a Configuración del Bot.
3. Elegir proveedor `openai-compatible`.
4. Definir URL del endpoint, clave API, modelo y prompt del sistema.

Proveedores habituales:

- OpenAI: `https://api.openai.com/v1`
- Azure OpenAI: `https://<resource>.openai.azure.com/`
- Ollama: `http://localhost:11434/v1`

## 📌 Resumen de uso rápido

```bash
docker compose up -d --build
npm run auth:check
npm run db:migrate:all:seed
```

Luego, inicia sesión en el CMS con:

- Email: admin@registromercantil.cu
- Contraseña: Admin2026!

## 🧠 Grafo de Conocimiento (Graphify)

Este repositorio está indexado con [Graphify](https://docs.graphify.com), un grafo de conocimiento sobre la estructura de llamadas, dependencias y archivos del código fuente.

### Instalación

```bash
# Instalar Graphify con soporte MCP
uv tool install "graphifyy[mcp]"

# Registrar en el proyecto (genera AGENTS.md, .opencode/skills/, plugin hook)
graphify install --project --platform opencode

# Generar el grafo inicial (extracción AST pura, sin backend LLM)
$env:GRAPHIFY_BACKEND="none"; graphify .
```

### Uso

```bash
# Consultar el grafo
graphify query "¿quién llama a requireAuth?"

# Ver relaciones entre componentes
graphify path "src/lib/auth.ts" "src/app/api/cms/sliders/route.ts"

# Explicar un concepto
graphify explain "cms-handler"

# Actualizar tras modificar código
graphify update .
```

El grafo genera 1500+ nodos y 5400+ aristas organizados en ~73 comunidades. Los archivos sensibles (`.env.local`) se excluyen automáticamente.

**Regla para agentes de IA**: Antes de usar `grep` o leer archivos directamente, consultar el grafo con Graphify. Solo recurrir a búsqueda textual para lo que el grafo no modela (strings literales, comentarios, archivos no indexados).

---

## 🛠️ Herramientas de Desarrollo (MCP)

Este proyecto utiliza servidores MCP (Model Context Protocol) integrados con OpenCode para potenciar el desarrollo asistido por IA:

| Servidor | Propósito | Configuración |
|----------|-----------|---------------|
| **Graphify** | Grafo de conocimiento del código (dependencias, llamadas, impacto) | `uv tool install "graphifyy[mcp]"` + `graphify install --project` |
| **Context7** | Documentación actualizada de librerías (Next.js, Prisma, Tailwind, etc.) | Integrado vía OpenCode |
| **Engram** | Memoria persistente entre sesiones de desarrollo | Integrado vía OpenCode |
| **gh-grep** | Búsqueda de patrones de código en repositorios públicos de GitHub | Integrado vía OpenCode |

Las reglas completas para agentes están documentadas en [`AGENTS.md`](./AGENTS.md) y los principios inmutables del proyecto en [`constitution.md`](./constitution.md).

---

## 🤝 Contribución

1. Crear una rama.
2. Hacer los cambios.
3. Ejecutar validaciones relevantes (`npm run lint`, `graphify update .`).
4. Abrir un Pull Request con descripción clara.

## 📄 Licencia

Este proyecto es propiedad del Registro Mercantil de Cuba.

---

Desarrollado por el Registro Mercantil de Cuba.