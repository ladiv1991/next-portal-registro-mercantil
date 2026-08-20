# Registro Mercantil de Cuba — Índice del Proyecto

## 📋 Descripción General

**Portal oficial del Registro Mercantil de Cuba** — Una aplicación web moderna para consultas públicas, trámites en línea, normativas, estadísticas y servicios de constitución de sociedades.

**Entorno**: Desarrollo/Producción  
**Framework**: Next.js 16.1.1 + React 19  
**Base de Datos**: PostgreSQL (producción) / SQLite (desarrollo)  
**Estilo**: WCAG 2.1 AA compliant, paleta mate/elegante

---

## 🏗️ Arquitectura del Proyecto

```
registro-mercantil-portal/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes (31 endpoints)
│   │   ├── globals.css           # Estilos globales + Tailwind
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Página principal (orquestador)
│   ├── components/
│   │   ├── cms/                  # Componentes del CMS (22 archivos)
│   │   ├── portal/               # Componentes del portal público
│   │   │   ├── layout/           # Header, Footer, ThemeSwitcher
│   │   │   └── sections/         # Secciones del portal (7 + 15 sub-componentes)
│   │   └── ui/                   # Componentes shadcn/ui
│   ├── data/
│   │   ├── index.ts              # Barrel exports
│   │   └── portal-data.ts        # Datos estáticos del portal
│   ├── hooks/
│   │   ├── use-mobile.ts         # Hook para responsive
│   │   └── use-toast.ts          # Hook para notificaciones
│   └── lib/
│       ├── api-auth.ts           # Middleware de autenticación
│       ├── auth.ts               # JWT + bcrypt utilities
│       ├── cms-handler.ts        # Handler genérico para CMS
│       ├── db.ts                 # Prisma client singleton
│       ├── themes.ts             # Configuración de temas
│       └── utils.ts              # Utilidades (cn, formateadores)
├── prisma/
│   ├── schema.prisma             # Schema de base de datos (18 modelos)
│   ├── seed.ts                   # Seed data principal
│   └── seed-guides.ts            # Seed data para guías
├── scripts/
│   └── setup.sh                  # Script de configuración automática
├── public/
│   └── uploads/                  # Archivos subidos (procedures, sliders, news, documents)
├── db/
│   └── custom.db                 # SQLite para desarrollo
├── .env                          # Variables de entorno (generado automáticamente)
├── package.json                  # Dependencias y scripts
├── next.config.ts                # Configuración de Next.js
├── tailwind.config.ts            # Configuración de Tailwind
└── tsconfig.json                 # Configuración de TypeScript
```

---

## 🛠️ Tecnologías y Frameworks

### Core
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 16.1.1 | Framework React full-stack |
| React | 19.0.0 | Biblioteca UI |
| TypeScript | 5.x | Tipado estático |
| Bun | latest | Runtime y package manager |

### Base de Datos
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Prisma | 6.0.0 | ORM tipo-safe |
| PostgreSQL | latest | Base de datos producción |
| SQLite | latest | Base de datos desarrollo |

### UI/UX
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Tailwind CSS | 4.x | Framework CSS utility-first |
| shadcn/ui | latest | Componentes UI accesibles |
| Radix UI | latest | Primitivos de UI sin estilo |
| Framer Motion | 12.23.2 | Animaciones |
| Embla Carousel | 8.6.0 | Slider/carrusel |

### Autenticación
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| NextAuth.js | 4.24.11 | Autenticación Next.js |
| jsonwebtoken | 9.0.3 | Tokens JWT |
| bcryptjs | 3.0.3 | Hash de contraseñas |

### Estado y Datos
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Zustand | 5.0.6 | Gestión de estado |
| TanStack Query | 5.82.0 | Fetching y caché |
| TanStack Table | 8.21.3 | Tablas avanzadas |
| React Hook Form | 7.60.0 | Formularios |
| Zod | 4.0.2 | Validación de esquemas |

### Otros
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Lucide React | 0.525.0 | Iconos |
| date-fns | 4.1.0 | Manipulación de fechas |
| React Markdown | 10.1.0 | Renderizado Markdown |
| Sharp | 0.34.3 | Procesamiento de imágenes |
| next-intl | 4.3.4 | Internacionalización |
| next-themes | 0.4.6 | Temas claro/oscuro |

---

## 📊 Modelos de Base de Datos (Prisma)

### Autenticación y CMS
| Modelo | Campos Principales | Descripción |
|--------|-------------------|-------------|
| `User` | id, email, password, name, role, active, auditLogs | Usuarios del CMS |
| `AuditLog` | id, userId, action, entity, entityId, details, user | Logs de auditoría |

### Contenido del Portal
| Modelo | Campos Principales | Descripción |
|--------|-------------------|-------------|
| `MenuItem` | id, label, icon, sectionId, order, visible | Menú de navegación |
| `Page` | id, title, slug, description, visible, order, blocks | Páginas estáticas |
| `Block` | id, pageId, type, title, content, order, visible | Bloques de contenido |
| `Slider` | id, title, subtitle, message, imageUrl, link, active, startDate, endDate | Slider hero |
| `Service` | id, title, description, icon, color, sectionId, order, visible | Servicios |
| `Statistic` | id, label, value, suffix, icon, order, visible | Estadísticas |
| `NewsArticle` | id, title, summary, content, category, imageUrl, published, featured | Noticias |
| `Procedure` | id, title, description, icon, time, cost, requirements, steps, documents | Trámites |
| `ProcedureDocument` | id, procedureId, name, fileName, fileSize, mimeType, url | Documentos de trámites |
| `Regulation` | id, title, type, number, description, content, fileUrl, effectiveDate | Normativas |
| `FAQ` | id, question, answer, category, order, visible | Preguntas frecuentes |
| `VideoTutorial` | id, title, description, duration, videoUrl, thumbnailUrl, views | Tutoriales en video |
| `Webinar` | id, title, description, date, time, location, status, maxAttendees | Webinars |
| `ContactChannel` | id, type, label, value, icon, order, visible | Canales de contacto |
| `SearchableName` | id, name, nire, type, province, status, visible | Nombres buscables (empresas) |
| `BotConfig` | id, provider, model, apiUrl, apiKey, systemPrompt, maxTokens, temperature | Configuración del bot IA |
| `Guide` | id, title, description, icon, steps, order, visible | Guías interactivas |
| `SitePage` | id, title, slug, content, order, visible | Páginas del sitio |

---

## 🌐 API Routes

### Autenticación
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/auth/login` | POST | Login CMS (JWT) |
| `/api/auth/logout` | POST | Logout CMS |
| `/api/auth/me` | GET | Obtener usuario actual |

### CMS CRUD
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/cms/sliders` | GET, POST | Listar/crear sliders |
| `/api/cms/sliders/[id]` | GET, PUT, DELETE | Slider por ID |
| `/api/cms/services` | GET, POST | Listar/crear servicios |
| `/api/cms/services/[id]` | GET, PUT, DELETE | Servicio por ID |
| `/api/cms/news` | GET, POST | Listar/crear noticias |
| `/api/cms/news/[id]` | GET, PUT, DELETE | Noticia por ID |
| `/api/cms/procedures` | GET, POST | Listar/crear trámites |
| `/api/cms/procedures/[id]` | GET, PUT, DELETE | Trámite por ID |
| `/api/cms/procedures/[id]/documents` | GET, POST | Listar/subir documentos |
| `/api/cms/procedures/[id]/documents/[docId]` | DELETE | Eliminar documento |
| `/api/cms/regulations` | GET, POST | Listar/crear normativas |
| `/api/cms/regulations/[id]` | GET, PUT, DELETE | Normativa por ID |
| `/api/cms/faqs` | GET, POST | Listar/crear FAQs |
| `/api/cms/faqs/[id]` | GET, PUT, DELETE | FAQ por ID |
| `/api/cms/video-tutorials` | GET, POST | Listar/crear tutoriales |
| `/api/cms/video-tutorials/[id]` | GET, PUT, DELETE | Tutorial por ID |
| `/api/cms/webinars` | GET, POST | Listar/crear webinars |
| `/api/cms/webinars/[id]` | GET, PUT, DELETE | Webinar por ID |
| `/api/cms/contact-channels` | GET, POST | Listar/crear contactos |
| `/api/cms/contact-channels/[id]` | GET, PUT, DELETE | Contacto por ID |
| `/api/cms/statistics` | GET, POST | Listar/crear estadísticas |
| `/api/cms/statistics/[id]` | GET, PUT, DELETE | Estadística por ID |
| `/api/cms/searchable-names` | GET, POST | Listar/crear nombres |
| `/api/cms/searchable-names/[id]` | GET, PUT, DELETE | Nombre por ID |
| `/api/cms/site-pages` | GET, POST | Listar/crear páginas |
| `/api/cms/site-pages/[id]` | GET, PUT, DELETE | Página por ID |
| `/api/cms/bot-config` | GET, POST | Configuración del bot |
| `/api/cms/bot-config/[id]` | GET, PUT, DELETE | Bot config por ID |
| `/api/cms/bot-config/test` | POST | Testear conexión bot |

### Contenido Público
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/public/content` | GET | Todo el contenido público |
| `/api/search` | GET | Búsqueda de empresas |
| `/api/upload` | POST | Subir archivos |
| `/api/chat/send` | POST | Enviar mensaje al chatbot |
| `/api/chat/context` | GET | Contexto para el chatbot |
| `/api/blocks` | GET, POST | Bloques de páginas |
| `/api/pages` | GET, POST | Páginas estáticas |
| `/api/menus` | GET, POST | Menús de navegación |
| `/api/stats/overview` | GET | Estadísticas resumen |

---

## 🎨 Paleta de Colores (Mate/Elegante)

| Color | Hex | Uso | WCAG |
|-------|-----|-----|------|
| Negro Suave | `#1A1A1A` | Fondos oscuros | - |
| Gris Oscuro | `#2D2D2D` | Secondary dark | - |
| Beige Sólido | `#EDE0D4` | Acentos sobre oscuro | ✅ 11.6:1 sobre #1A1A1A |
| Beige Claro | `#F5EDE4` | Fondos claros | - |
| Beige Oscuro | `#D6C9BA` | Bordes y detalles | - |
| Terracota | `#9E3A2E` | Acentos sobre claro | ✅ 4.6:1 sobre blanco |
| Terracota Claro | `#B55A4A` | Secondary accent | ⚠️ 3.5:1 (solo texto grande) |
| Terracota Oscuro | `#7A2A1E` | Texto importante | ✅ 8.5:1 sobre blanco |
| Gris Cálido | `#6B5E50` | Texto secundario | ✅ 5.5:1 sobre blanco |

---

## 📁 Componentes Principales

### Layout (Portal Público)
| Componente | Archivo | Descripción |
|------------|---------|-------------|
| `PortalHeader` | `src/components/portal/layout/PortalHeader.tsx` | Header con navegación y logo |
| `PortalFooter` | `src/components/portal/layout/PortalFooter.tsx` | Footer con enlaces y contacto |
| `FloatingChatbot` | `src/components/portal/layout/FloatingChatbot.tsx` | Bot flotante de asistencia |
| `ScrollToTop` | `src/components/portal/layout/ScrollToTop.tsx` | Botón para volver arriba |
| `ThemeSwitcher` | `src/components/portal/layout/ThemeSwitcher.tsx` | Selector de temas (7 presets) |

### Secciones del Portal
| Componente | Archivo | Descripción |
|------------|---------|-------------|
| `HomeSection` | `src/components/portal/sections/HomeSection.tsx` | Hero slider, servicios, stats, noticias |
| `ConsultasSection` | `src/components/portal/sections/ConsultasSection.tsx` | Búsqueda de empresas, Nota Simple |
| `TramitesSection` | `src/components/portal/sections/TramitesSection.tsx` | Trámites y procedimientos |
| `NormatividadSection` | `src/components/portal/sections/NormatividadSection.tsx` | Normativas y marco legal |
| `EstadisticasSection` | `src/components/portal/sections/EstadisticasSection.tsx` | Gráficos y estadísticas |
| `AsistenciaSection` | `src/components/portal/sections/AsistenciaSection.tsx` | Guías, tutoriales, contacto |
| `AccesoSection` | `src/components/portal/sections/AccesoSection.tsx` | Login CMS |

### CMS (22 componentes)
| Componente | Archivo | Descripción |
|------------|---------|-------------|
| `CmsLayout` | `src/components/cms/cms-layout.tsx` | Layout principal del CMS |
| `cms-dashboard` | `src/components/cms/cms-dashboard.tsx` | Dashboard resumen |
| `cms-sliders` | `src/components/cms/cms-sliders.tsx` | CRUD sliders |
| `cms-services` | `src/components/cms/cms-services.tsx` | CRUD servicios |
| `cms-news` | `src/components/cms/cms-news.tsx` | CRUD noticias |
| `cms-procedures` | `src/components/cms/cms-procedures.tsx` | CRUD trámites + documentos |
| `cms-regulations` | `src/components/cms/cms-regulations.tsx` | CRUD normativas |
| `cms-faq` | `src/components/cms/cms-faq.tsx` | CRUD FAQs |
| `cms-tutorials` | `src/components/cms/cms-tutorials.tsx` | CRUD tutoriales |
| `cms-webinars` | `src/components/cms/cms-webinars.tsx` | CRUD webinars |
| `cms-contacts` | `src/components/cms/cms-contacts.tsx` | CRUD contactos |
| `cms-statistics` | `src/components/cms/cms-statistics.tsx` | CRUD estadísticas |
| `cms-search-names` | `src/components/cms/cms-search-names.tsx` | CRUD nombres buscables |
| `cms-site-pages` | `src/components/cms/cms-site-pages.tsx` | CRUD páginas del sitio |
| `cms-bot-config` | `src/components/cms/cms-bot-config.tsx` | Configuración bot IA |
| `cms-menus` | `src/components/cms/cms-menus.tsx` | CRUD menús |
| `cms-pages` | `src/components/cms/cms-pages.tsx` | CRUD páginas + bloques |
| `cms-blocks` | `src/components/cms/cms-blocks.tsx` | CRUD bloques |
| `FileUpload` | `src/components/cms/FileUpload.tsx` | Componente de subida de archivos |

---

## 🚀 Scripts Disponibles

```bash
# Configuración
bun run setup              # Ejecuta setup.sh manualmente

# Desarrollo
bun run dev                # Inicia servidor de desarrollo (puerto 3000)
bun run build              # Build de producción
bun run start              # Inicia servidor de producción

# Base de datos
bun run db:push            # Sincroniza schema con la BD
bun run db:generate        # Genera Prisma Client
bun run db:migrate         # Crea migración
bun run db:reset           # Resetea BD y hace seed

# Seed
bun run seed               # Carga datos iniciales

# Linting
bun run lint               # Ejecuta ESLint
```

---

## 🔐 Autenticación

El sistema utiliza **JWT** para autenticación del CMS:

1. **Login**: POST `/api/auth/login` → devuelve JWT en cookie
2. **Logout**: POST `/api/auth/logout` → elimina cookie
3. **Verificación**: Middleware `requireAuth` en rutas CMS
4. **Token**: Expira a las 8 horas
5. **Password**: Hasheado con bcrypt (coste 12)

**Usuario por defecto (seed)**:
- Email: `admin@registromercantil.cu`
- Contraseña: `Admin2026!`

---

## 🎯 Características Principales

### Portal Público
- ✅ Slider hero con carrusel automático (Embla)
- ✅ Buscador de empresas (denominación, NIRE)
- ✅ Catálogo de trámites con documentos descargables
- ✅ Normativas por categoría
- ✅ Estadísticas con gráficos (Recharts)
- ✅ Chatbot IA (Z-AI-Web-Dev-SDK / OpenAI Compatible)
- ✅ Temas claro/oscuro + 5 presets adicionales
- ✅ Diseño WCAG 2.1 AA compliant

### CMS (Panel de Administración)
- ✅ Dashboard con resumen de contenido
- ✅ CRUD completo para 17 modelos de contenido
- ✅ Subida de archivos (PDF, imágenes)
- ✅ Editor de bloques para páginas estáticas
- ✅ Configuración de bot IA con test de conexión
- ✅ Gestión de menús de navegación
- ✅ Logs de auditoría

---

## 📝 Worklog Reciente

Ver `worklog.md` para el historial completo de tareas.

**Últimas actualizaciones**:
- Paleta de colores mate/elegante con WCAG AA
- Gradientes multicolor y animaciones sutiles
- Footer con contraste mejorado
- Theme switcher con 7 presets
- Header matte dark con efectos glassmorphism
- Estadísticas con animaciones de entrada y partículas

---

## 📞 Configuración del Bot IA

El bot soporta dos proveedores:

### Z-AI-Web-Dev-SDK (default)
```env
BOT_PROVIDER=z-ai-web-dev-sdk
BOT_API_URL=https://api.z-ai.com/v1
BOT_API_KEY=tu-api-key
BOT_MODEL=z-ai-model
```

### OpenAI Compatible
```env
BOT_PROVIDER=openai-compatible
BOT_API_URL=https://api.openai.com/v1
BOT_API_KEY=tu-api-key
BOT_MODEL=gpt-4o-mini
```

**Configuración desde CMS**: `/cms` → Bot IA → Configurar proveedor, prompt del sistema, max tokens, temperatura.

---

## 🗂️ Estructura de Archivos Subidos

```
public/uploads/
├── procedures/     # Documentos de trámites (PDF)
├── sliders/        # Imágenes del slider hero (WEBP)
├── news/           # Imágenes de noticias (JPG/PNG)
└── documents/      # Documentos generales (PDF)
```

Los archivos se guardan con timestamp: `YYYYMMDD_HHMMSS_originalname.ext`

---

## 🔧 Variables de Entorno (.env)

```env
# Base de datos — PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/registro_mercantil

# Autenticación — JWT
JWT_SECRET=secret-generado-aleatoriamente

# Next.js — URL pública
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generación automática**: `scripts/setup.sh` se ejecuta antes de `dev` y `build`.

---

## 📌 Notas Importantes

1. **Prisma Client**: Regenerar después de cambios en el schema:
   ```bash
   bun run db:generate
   ```

2. **Seed Data**: Ejecutar después de resetear la BD:
   ```bash
   bun run seed
   ```

3. **Producción**: Build standalone con Docker:
   ```bash
   bun run build
   bun run start
   ```

4. **Cache de Turbopack**: Limpiar si hay errores de compilación:
   ```bash
   rm -rf .next
   bun run dev
   ```

---

*Documento generado: 2026-04-02*  
*Última actualización del proyecto: Ver `worklog.md`*
