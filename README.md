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

#### Opción A: PostgreSQL con Docker (Recomendado)

```bash
# Iniciar PostgreSQL
docker compose up -d postgres

# Generar cliente Prisma
bun run db:generate

# Crear esquema
bun run db:push

# Poblar datos iniciales
bun run seed
```

#### Opción B: SQLite (Desarrollo)

```bash
# Cambiar en .env
DATABASE_URL=file:./db/custom.db

# Crear base de datos
bun run db:push
bun run seed
```

## 🏃‍♂️ Desarrollo

### Iniciar Servidor de Desarrollo

```bash
# Inicia automáticamente setup.sh
bun run dev
```

El servidor estará disponible en:
- **Local**: http://localhost:3008
- **Red**: http://10.255.255.254:3008

### Comandos de Desarrollo

```bash
# Ver logs en tiempo real
tail -f dev.log

# Ejecutar linter
bun run lint

# Resetear base de datos
bun run db:reset
```

## 🤖 Configuración del Chatbot IA

Después de remover la dependencia `z-ai-web-dev-sdk`, el chatbot ahora usa proveedores OpenAI-compatible por defecto.

### Configuración vía CMS

1. **Acceder al Panel Administrativo**:
   - URL: `/admin`
   - Credenciales por defecto: `admin@registromercantil.cu` / `Admin123!`

2. **Configurar el Proveedor IA**:
   - Ir a **CMS → Configuración del Bot**
   - Seleccionar **Proveedor**: `openai-compatible`
   - Configurar:
     - **URL de API**: `https://api.openai.com/v1` (o cualquier proveedor compatible)
     - **Clave API**: Tu API key de OpenAI
     - **Modelo**: `gpt-3.5-turbo` o `gpt-4`
     - **Prompt del Sistema**: Personalizar respuestas
     - **Temperatura**: 0.7 (creatividad)
     - **Tokens Máximos**: 2048

3. **Probar la Conexión**:
   - Usar el botón **"Probar Conexión"** en el CMS
   - Verificar que el chatbot responda correctamente

### Proveedores Compatibles

- **OpenAI**: `https://api.openai.com/v1`
- **Azure OpenAI**: `https://your-resource.openai.azure.com/`
- **Ollama**: `http://localhost:11434/v1` (para modelos locales)
- **Otros**: Cualquier API compatible con OpenAI

## 🏗️ Compilación para Producción

### 1. Construir la Aplicación

```bash
# Construye para standalone deployment
bun run build
```

### 2. Ejecutar en Producción Local

```bash
# Ejecutar servidor de producción
bun run start
```

### 3. Despliegue con Traefik

#### Configurar Infraestructura

```bash
# Iniciar PostgreSQL y Traefik
docker compose up -d

# Verificar contenedores
docker ps
```

#### Variables de Entorno para Producción

```env
# URL de producción
NEXT_PUBLIC_APP_URL=https://registro-mercantil.xetid.cu:3000

# Base de datos de producción
DATABASE_URL=postgresql://user:password@prod-host:5432/db_name
```

#### Configurar Traefik Labels

Para desplegar con Traefik, agregar labels al contenedor:

```yaml
services:
  app:
    image: registro-mercantil-app:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`registro-mercantil.xetid.cu`)"
      - "traefik.http.routers.app.entrypoints=web"
      - "traefik.http.services.app.loadbalancer.server.port=3000"
```

### 4. Despliegue con Docker

#### Dockerfile de Producción

```dockerfile
FROM node:18-alpine AS base

# Instalar dependencias solo de producción
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ./
RUN bun install --frozen-lockfile

# Construir la aplicación
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Imagen de producción
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

#### Construir y Ejecutar

```bash
# Construir imagen
docker build -t registro-mercantil-app .

# Ejecutar contenedor
docker run -p 3000:3000 registro-mercantil-app
```

## 📖 Uso de Funcionalidades

### 🔍 Búsqueda de Sociedades

1. **Desde la Homepage**: Campo de búsqueda principal
2. **Desde Consultas**: Pestañas por denominación o NIRE
3. **Búsqueda Avanzada**: Filtros por provincia, tipo de sociedad

**Características de Búsqueda**:
- ✅ Insensible a mayúsculas/minúsculas
- ✅ Ignora signos de puntuación (puntos, comas, guiones)
- ✅ Autocompletado en tiempo real
- ✅ Resultados con estado, tipo y provincia

### 📝 Trámites Digitales

1. **Constitución de Sociedades**
2. **Modificaciones Registrales**
3. **Cuentas Anuales**
4. **Certificaciones**

### 📰 Gestión de Contenido (CMS)

#### Acceder al Panel Admin

1. Ir a `/acceso`
2. Iniciar sesión con credenciales admin
3. Credenciales por defecto:
   - **Usuario**: admin@registromercantil.cu
   - **Contraseña**: PortalRMC2026!

#### Funciones del CMS

- **Sliders**: Gestionar banners de la homepage
- **Servicios**: Configurar servicios principales
- **Noticias**: Publicar anuncios y novedades
- **Procedimientos**: Documentar trámites
- **Estadísticas**: Actualizar cifras del registro
- **Chatbot**: Configurar respuestas IA

### 🤖 Chatbot IA

Configurado para responder consultas sobre:
- Información registral
- Procedimientos administrativos
- Requisitos legales
- Estado de trámites

**Configuración**:
- Modelo: OpenAI-compatible (GPT-3.5-turbo por defecto)
- Proveedor alternativo: Configurable vía CMS
- Personalización completa vía panel administrativo

## 🔧 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Servidor desarrollo (puerto 3008) |
| `bun run build` | Build producción |
| `bun run start` | Servidor producción |
| `bun run lint` | Ejecutar ESLint |
| `bun run db:generate` | Generar cliente Prisma |
| `bun run db:push` | Sincronizar esquema BD |
| `bun run db:migrate` | Ejecutar migraciones |
| `bun run db:reset` | Resetear BD y reseed |
| `bun run db:backup` | Crear backup de BD |
| `bun run db:restore` | Restaurar BD desde backup |
| `bun run seed` | Poblar datos iniciales |

## 💾 Backup y Restauración de Base de Datos

### Exportar Base de Datos (Backup)

#### Opción 1: Backup Completo con Docker

```bash
# Crear backup del contenedor PostgreSQL
docker exec registro-mercantil-postgres pg_dump -U portal_rmc -d registro_mercantil > backup_$(date +%Y%m%d_%H%M%S).sql

# O con compresión
docker exec registro-mercantil-postgres pg_dump -U portal_rmc -d registro_mercantil | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Opción 2: Backup desde Host (si PostgreSQL no está en Docker)

```bash
# Backup completo
pg_dump -h localhost -p 5432 -U portal_rmc -d registro_mercantil > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup comprimido
pg_dump -h localhost -p 5432 -U portal_rmc -d registro_mercantil | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Solo esquema (sin datos)
pg_dump -h localhost -p 5432 -U portal_rmc -d registro_mercantil --schema-only > schema_$(date +%Y%m%d_%H%M%S).sql

# Solo datos (sin esquema)
pg_dump -h localhost -p 5432 -U portal_rmc -d registro_mercantil --data-only > data_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Base de Datos (Restore)

#### Opción 1: Restaurar desde Docker

```bash
# Detener la aplicación primero
docker compose down app

# Restaurar desde backup
docker exec -i registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil < backup_20241201_120000.sql

# O desde backup comprimido
gunzip -c backup_20241201_120000.sql.gz | docker exec -i registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil

# Reiniciar la aplicación
docker compose up -d app
```

#### Opción 2: Restaurar desde Host

```bash
# Detener servicios que usen la BD
docker compose down app

# Restaurar desde backup
psql -h localhost -p 5432 -U portal_rmc -d registro_mercantil < backup_20241201_120000.sql

# O desde backup comprimido
gunzip -c backup_20241201_120000.sql.gz | psql -h localhost -p 5432 -U portal_rmc -d registro_mercantil

# Reiniciar servicios
docker compose up -d app
```

### Scripts Automatizados

Crear script `scripts/backup-db.sh`:

```bash
#!/bin/bash
# backup-db.sh - Script para backup automático de la base de datos

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

echo "📦 Creando backup: $BACKUP_FILE"

# Backup con Docker
docker exec registro-mercantil-postgres pg_dump -U portal_rmc -d registro_mercantil | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup completado: $BACKUP_FILE"
    echo "📊 Tamaño: $(du -h $BACKUP_FILE | cut -f1)"
    
    # Mantener solo los últimos 10 backups
    cd $BACKUP_DIR
    ls -t backup_*.sql.gz | tail -n +11 | xargs -r rm
    echo "🧹 Backups antiguos eliminados"
else
    echo "❌ Error al crear backup"
    exit 1
fi
```

Crear script `scripts/restore-db.sh`:

```bash
#!/bin/bash
# restore-db.sh - Script para restaurar base de datos desde backup

if [ -z "$1" ]; then
    echo "❌ Uso: $0 <archivo_backup.sql.gz>"
    echo "📁 Backups disponibles:"
    ls -la ./backups/backup_*.sql.gz 2>/dev/null || echo "   Ningún backup encontrado"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Archivo no encontrado: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  ATENCIÓN: Esta acción eliminará todos los datos actuales"
read -p "¿Está seguro de restaurar desde $BACKUP_FILE? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operación cancelada"
    exit 0
fi

echo "🛑 Deteniendo servicios..."
docker compose down app

echo "🔄 Restaurando base de datos..."
gunzip -c "$BACKUP_FILE" | docker exec -i registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil

if [ $? -eq 0 ]; then
    echo "✅ Restauración completada"
    echo "🚀 Reiniciando servicios..."
    docker compose up -d app
    echo "✅ Proceso finalizado"
else
    echo "❌ Error durante la restauración"
    exit 1
fi
```

#### Hacer ejecutables los scripts:

```bash
chmod +x scripts/backup-db.sh scripts/restore-db.sh
```

#### Agregar comandos al package.json:

```json
{
  "scripts": {
    "db:backup": "bash scripts/backup-db.sh",
    "db:restore": "bash scripts/restore-db.sh"
  }
}
```

### Recomendaciones de Backup

- **Frecuencia**: Diaria para producción, semanal para desarrollo
- **Almacenamiento**: Mantener backups en ubicación segura externa
- **Retención**: 30 días para backups diarios, 1 año para mensuales
- **Verificación**: Probar restauración periódicamente
- **Compresión**: Usar `.gz` para ahorrar espacio
- **Automatización**: Configurar cron jobs para backups automáticos

### Migraciones con Prisma

Si solo necesitas migrar datos entre entornos:

```bash
# Exportar datos como JSON
bunx prisma db pull --force

# Importar datos
bun run db:push
```

## 🌐 URLs y Puertos

### Desarrollo
- **Aplicación**: http://localhost:3008
- **Traefik Dashboard**: http://localhost:8081/dashboard
- **PostgreSQL**: localhost:5432

### Producción
- **Aplicación**: https://registro-mercantil.xetid.cu
- **Caddy Proxy**: registro-mercantil.xetid.cu:81

## 🔒 Seguridad

- **Autenticación**: JWT con expiración de 8 horas
- **Contraseñas**: bcrypt con cost factor 12
- **Validación**: Input sanitization y rate limiting
- **HTTPS**: Configurado en producción
- **CORS**: Configurado para orígenes permitidos

## 📊 Monitoreo

### Logs
```bash
# Logs de desarrollo
tail -f dev.log

# Logs de producción
tail -f server.log
```

### Base de Datos
```bash
# Conectar a PostgreSQL
docker exec -it registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil

# Ver tablas
\dt

# Ver datos de ejemplo
SELECT name, nire, status FROM "SearchableName" LIMIT 5;
```

## 🐛 Solución de Problemas

### Error: Puerto 3008 en uso
```bash
# Matar proceso
fuser -k 3008/tcp

# O encontrar PID
lsof -ti:3008 | xargs kill -9
```

### Error: Base de datos no conecta
```bash
# Verificar contenedor
docker ps | grep postgres

# Reiniciar servicios
docker compose down && docker compose up -d
```

### Error: Build falla
```bash
# Limpiar cache
rm -rf .next node_modules/.cache

# Reinstalar dependencias
bun install

# Build limpio
bun run build
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es propiedad del Registro Mercantil de Cuba.

## 📞 Soporte

Para soporte técnico:
- **Email**: soporte@registromercantil.cu
- **Panel Admin**: Sección "Centro de Asistencia"
- **Chatbot IA**: Disponible 24/7 en el portal

---

**Desarrollado por el Registro Mercantil de Cuba** 🏛️