# Graph Report - next-portal-registro-mercantil  (2026-10-22)

## Corpus Check
- 267 files · ~222,745 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: (none) 11, .prisma 3, .woff2 2)

## Summary
- 2038 nodes · 5979 edges · 129 communities (117 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ca7edb67`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Button
- requireAuth
- dependencies
- parseModelFromPath
- src/data/portal-data.ts
- import_registros_mercantiles.py
- requireAdmin
- sidebar.tsx
- sections/index.ts
- use-toast.ts
- app/page.tsx
- Card
- next
- react
- package.json
- cms-api.ts
- Registro Mercantil de Cuba — Índice del Proyecto
- pre-color-fix/src/data/portal-data.ts
- cms-types.ts
- EXTRACTO ESTADÍSTICO DEL SISTEMA INFORMATIVO DEL REGISTRO MERCANTIL
- scripts
- portal-auth.ts
- card.tsx
- lucide-react
- compilerOptions
- components.json
- menubar.tsx
- Revisión de seguridad del portal: front-end, back-end y despliegue
- RESOLUCIÓN 51 DEL MINISTRO DE JUSTICIA
- dropdown-menu.tsx
- carousel.tsx
- handleResponse
- form.tsx
- pagination.tsx
- cmsGetAll
- cmsUpdate
- NormatividadSection.tsx
- worklog.md
- RESOLUCIÓN No. 230 DEL MINISTRO DE JUSTICIA
- check-auth.js
- drawer.tsx
- server.ts
- GuideStepsEditor.tsx
- utils.ts
- src/components/portal/sections/ConsultasSection.tsx
- chart.tsx
- context-menu.tsx
- Portal del Registro Mercantil de Cuba
- DECRETO-LEY 226/2001 "DEL REGISTRO MERCANTIL" (CONCORDADO)
- deploy.sh
- JsonFieldEditor.tsx
- lucide-react
- run-migrations.js
- 5. REGLAS GENERALES DE INSCRIPCIÓN
- documents/route.ts
- update-minjus.sh
- api-auth.ts
- AGENTS.md
- 12. ASIENTOS REGISTRALES
- 9. LIBROS DEL REGISTRO MERCANTIL
- 8.2 Estructura de tarifas tipo
- 22. DEPÓSITO DE CUENTAS ANUALES
- Servidores MCP disponibles
- Artículo VI: Despliegue y Docker
- fix-old-colors.sh
- ejecutar_migracion_v2.sh
- postcss.config.mjs
- backup-db.sh
- download-fonts.sh
- restore-db.sh
- setup.sh
- 7. DATOS ESPECÍFICOS POR TIPO DE SUJETO
- Review Focus
- 10. CALIFICACIÓN Y RECURSOS
- 8. EL REGISTRADOR MERCANTIL
- 🚀 Instalación y configuración
- Convenciones del proyecto
- Artículo IV: Estándares de API
- Artículo V: Base de Datos y Migraciones
- 4. PROCESO DE INSCRIPCIÓN
- 13. INSCRIPCIONES ESPECÍFICAS
- 15. FUSIÓN, ESCISIÓN, DISOLUCIÓN Y LIQUIDACIÓN
- 🚀 Instalación y Configuración
- 🚀 Despliegue con Docker
- popover.tsx
- Artículo II: Accesibilidad WCAG 2.1 AA
- Artículo III: Arquitectura Next.js App Router
- Artículo VII: Convenciones de Código
- 11. PUBLICIDAD E INFORMACIÓN REGISTRAL
- 14. INSCRIPCIÓN DE SOCIEDADES MERCANTILES
- 18. PERSONAS NATURALES EXTRANJERAS (Arts. 178-184)
- 20. CONTRATOS DE AGENCIA (Arts. 190-193)
- 29. REQUISITOS TÉCNICOS PARA EL PORTAL (DERIVADOS DE ESTA RESOLUCIÓN)
- 7. ORGANIZACIÓN DEL REGISTRO MERCANTIL
- 🐛 Problemas comunes
- User
- src/components/portal/sections/HomeSection.tsx
- 10. INTERACCIÓN CON TERCEROS
- 11. SANCIONES (Art. 27)
- 2. SUJETOS Y ACTOS INSCRIBIBLES (Art. 2)
- 6. INFORMACIÓN REGISTRAL Y PUBLICIDAD
- 9. IMPUESTOS ASOCIADOS (Art. 13)
- 24. CONTROL Y SUPERVISIÓN (Arts. 210-211)
- 3. SISTEMA DEL REGISTRO MERCANTIL
- 💾 Backups y restauración de la base de datos
- 🚀 Características Principales
- 📜 Logs
- 15. REQUISITOS TÉCNICOS PARA EL PORTAL DIGITAL
- 18. NOTAS ADICIONALES
- 5. CALIFICACIÓN REGISTRAL Y RECURSOS (Art. 9)
- 21. DENOMINACIONES (Arts. 194-199)
- 🧠 Grafo de Conocimiento (Graphify)
- ✅ Usuarios por defecto y autenticación
- db.ts
- navigation-menu.tsx
- toggle-group.tsx
- PremiumModal.tsx
- Plan de actualización normativa del Portal
- eslint.config.mjs
- Skills instaladas globalmente
- deploy-debian13.sh
- calendar.tsx
- resizable.tsx
- SDD Ledger — Dictamen MINJUS
- Artículo VIII: Herramientas de IA para Agentes

## God Nodes (most connected - your core abstractions)
1. `cn()` - 244 edges
2. `Card()` - 112 edges
3. `CardContent()` - 110 edges
4. `Button()` - 101 edges
5. `react` - 99 edges
6. `requireAuth()` - 97 edges
7. `lucide-react` - 89 edges
8. `next` - 88 edges
9. `CardHeader()` - 71 edges
10. `CardTitle()` - 71 edges

## Surprising Connections (you probably didn't know these)
- `Task 8: Actualizar prisma/seed.ts con DL 133/2026` --references--> `Regulation`  [INFERRED]
  docs/superpowers/plans/2026-10-22-dictamen-minjus.md → src/components/cms/cms-types.ts
- `🔐 Autenticación` --references--> `requireAuth()`  [INFERRED]
  PROJECT_INDEX.md → src/lib/api-auth.ts
- `Cambios aplicados en esta ejecución` --references--> `requireAdmin()`  [INFERRED]
  docs/security-review.md → src/lib/api-auth.ts
- `Fase 0: Contención inmediata (0-72 horas)` --references--> `requireAdmin()`  [INFERRED]
  docs/security-review.md → src/lib/api-auth.ts
- `Pruebas HTTP realizadas sobre la app activa` --references--> `requireAdmin()`  [INFERRED]
  docs/security-review.md → src/lib/api-auth.ts

## Import Cycles
- None detected.

## Communities (129 total, 12 thin omitted)

### Community 0 - "Button"
Cohesion: 0.10
Nodes (127): framer-motion, sonner, deleteBlock(), deleteMenu(), deletePage(), deleteProcedureDocument(), getPages(), BlockFormData (+119 more)

### Community 1 - "requireAuth"
Cohesion: 0.05
Nodes (53): GET(), GET(), POST(), DELETE(), PUT(), GET(), POST(), DELETE() (+45 more)

### Community 2 - "dependencies"
Cohesion: 0.03
Nodes (69): dependencies, bcryptjs, class-variance-authority, clsx, cmdk, date-fns, @dnd-kit/core, @dnd-kit/sortable (+61 more)

### Community 3 - "parseModelFromPath"
Cohesion: 0.08
Nodes (56): POST(), GET(), DELETE(), GET(), PUT(), GET(), POST(), DELETE() (+48 more)

### Community 4 - "src/data/portal-data.ts"
Cohesion: 0.09
Nodes (31): AnimatedCounter(), FloatingParticle(), HomeSection(), iconMap, NewsItem, PublicContent, SearchResult, ServiceItem (+23 more)

### Community 5 - "import_registros_mercantiles.py"
Cohesion: 0.07
Nodes (8): clean_bool_flag(), clean_date(), clean_float(), clean_int(), clean_text(), get_province_from_dpa(), main(), RegistroMercantilImporter

### Community 6 - "requireAdmin"
Cohesion: 0.06
Nodes (32): 1.1 Credenciales y secretos, 1.2 Autenticación y autorización, 1.3 Protección de datos, 1.4 Límites de subida de archivos, Artículo I: Seguridad y Datos Sensibles, zod, DELETE(), PUT() (+24 more)

### Community 7 - "sidebar.tsx"
Cohesion: 0.06
Nodes (51): cmdk, @radix-ui/react-avatar, @radix-ui/react-slot, AlertTitle(), Avatar(), AvatarFallback(), AvatarImage(), BreadcrumbEllipsis() (+43 more)

### Community 8 - "sections/index.ts"
Cohesion: 0.16
Nodes (14): Secciones del Portal, AccesoSectionProps, RefreshCw(), CONSTITUTION_STEPS, ConstitutionSteps(), ForeignInvestment(), MODIFICATION_TYPES, ModificationTypes() (+6 more)

### Community 9 - "use-toast.ts"
Cohesion: 0.09
Nodes (31): @radix-ui/react-toast, geistMono, geistSans, metadata, RootLayout(), Toast, ToastAction, ToastActionElement (+23 more)

### Community 10 - "app/page.tsx"
Cohesion: 0.06
Nodes (58): Layout (Portal Público), @radix-ui/react-dialog, @radix-ui/react-separator, @radix-ui/react-tooltip, AccesoSection, AsistenciaSection, ConsultasSection, EstadisticasSection (+50 more)

### Community 11 - "Card"
Cohesion: 0.14
Nodes (33): CHART_SOCIEDADES, SocietiesPieChart(), FEE_SCHEDULE, FeeSchedule(), CONSTITUTION_STEPS, ConstitutionSteps(), ForeignInvestment(), INVESTMENTS (+25 more)

### Community 12 - "next"
Cohesion: 0.12
Nodes (4): nextConfig, next, GET(), POST()

### Community 13 - "react"
Cohesion: 0.22
Nodes (11): react, metadata, PremiumDemoPage(), PremiumFeaturesExample(), PremiumGateButton(), PremiumGateButtonProps, PremiumGateWrapper(), PremiumGateWrapperProps (+3 more)

### Community 14 - "package.json"
Cohesion: 0.04
Nodes (38): name, prisma, seed, private, version, bun-types, date-fns, eslint (+30 more)

### Community 15 - "cms-api.ts"
Cohesion: 0.10
Nodes (33): cmsCreate(), cmsDelete(), cmsGetOne(), cmsUrl(), createBotConfig(), createContactChannel(), createFAQ(), createGuide() (+25 more)

### Community 16 - "Registro Mercantil de Cuba — Índice del Proyecto"
Cohesion: 0.06
Nodes (32): 🌐 API Routes, 🏗️ Arquitectura del Proyecto, Autenticación, Autenticación, 🔐 Autenticación, Autenticación y CMS, Base de Datos, 🎯 Características Principales (+24 more)

### Community 17 - "pre-color-fix/src/data/portal-data.ts"
Cohesion: 0.08
Nodes (24): BENEFITS, CHART_CONST_CANCEL, CHART_SECTORES, CHART_SOCIEDADES, CONSTITUTION_STEPS, fadeInUp, FAQ_DATA, FEE_SCHEDULE (+16 more)

### Community 18 - "cms-types.ts"
Cohesion: 0.16
Nodes (20): Contenido del Portal, Block, BLOCK_TYPES, BotConfig, CMSStats, ContactChannel, FAQItem, Guide (+12 more)

### Community 19 - "EXTRACTO ESTADÍSTICO DEL SISTEMA INFORMATIVO DEL REGISTRO MERCANTIL"
Cohesion: 0.06
Nodes (31): 10. INDICADORES CLAVE DE DESEMPEÑO (KPI), 11. ANÁLISIS COMPARATIVO POR TIPO DE SUJETO, 12.1 Del Resumen Ejecutivo, 12.2 De las Verificaciones, 12.3 De los Ingresos, 12. OBSERVACIONES Y COMENTARIOS, 13. DEFINICIONES DE LOS INDICADORES ESTADÍSTICOS, 1. DATOS GENERALES DEL MODELO (+23 more)

### Community 20 - "scripts"
Cohesion: 0.06
Nodes (34): devDependencies, bun-types, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, tw-animate-css, @types/bcryptjs (+26 more)

### Community 21 - "portal-auth.ts"
Cohesion: 0.18
Nodes (13): jsonwebtoken, GET(), POST(), GET(), GET(), POST(), GET(), generatePortalToken() (+5 more)

### Community 22 - "card.tsx"
Cohesion: 0.21
Nodes (9): VIDEO_TUTORIALS, VideoTutorials(), WEBINARS, WebinarsSection(), AsistenciaSection(), ContactChannelItem, FAQItem, VideoTutorialItem (+1 more)

### Community 23 - "lucide-react"
Cohesion: 0.20
Nodes (14): PortalLoginPage(), createEnzonaConfig(), getEnzonaConfig(), testEnzonaConnection(), updateEnzonaConfig(), CmsEnzonaConfig(), EnzonaConfig, AVAILABLE_PERMISSIONS (+6 more)

### Community 24 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 25 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 26 - "menubar.tsx"
Cohesion: 0.12
Nodes (13): @radix-ui/react-menubar, Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarPortal(), MenubarRadioItem() (+5 more)

### Community 27 - "Revisión de seguridad del portal: front-end, back-end y despliegue"
Cohesion: 0.06
Nodes (30): 10) Carencia de rate limiting y protección anti-bruta, 1) JWT con secreto por defecto y fallback inseguro, 2) Login del portal usa contraseña fija y no autenticación real, 3) Credenciales default exponiendo acceso administrativo, 4) Upload sin validación ni control de contenido, 5) XSS por renderizado de contenido HTML no sanitizado, 6) Falta de cabeceras de seguridad en la app, 7) Autorización débil y no consistente (+22 more)

### Community 28 - "RESOLUCIÓN 51 DEL MINISTRO DE JUSTICIA"
Cohesion: 0.07
Nodes (27): 10. RESPONSABLES DE LA APLICACIÓN, 11. NORMAS DEROGADAS, 12. DESTINATARIOS DE LA COMUNICACIÓN, 13. MAPA DE RELACIÓN CON EL DECRETO-LEY 226/2001, 14.1 Parametrización de tarifas, 14.2 Registro y constancia, 14.3 Gestión de pagos, 14. REQUISITOS TÉCNICOS PARA EL PORTAL (DERIVADOS DE ESTA RESOLUCIÓN) (+19 more)

### Community 29 - "dropdown-menu.tsx"
Cohesion: 0.12
Nodes (10): @radix-ui/react-dropdown-menu, DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut() (+2 more)

### Community 30 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 31 - "handleResponse"
Cohesion: 0.14
Nodes (14): createBlock(), createMenu(), createPage(), getBlocks(), getMe(), getMenus(), getPage(), getProcedureDocuments() (+6 more)

### Community 32 - "form.tsx"
Cohesion: 0.19
Nodes (12): @radix-ui/react-label, react-hook-form, FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext (+4 more)

### Community 33 - "pagination.tsx"
Cohesion: 0.28
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 34 - "cmsGetAll"
Cohesion: 0.13
Nodes (15): cmsGetAll(), getBotConfig(), getContactChannels(), getFAQs(), getGuides(), getNewsArticles(), getProcedures(), getRegulations() (+7 more)

### Community 35 - "cmsUpdate"
Cohesion: 0.13
Nodes (15): cmsUpdate(), updateBotConfig(), updateContactChannel(), updateFAQ(), updateGuide(), updateNewsArticle(), updateProcedure(), updateRegulation() (+7 more)

### Community 36 - "NormatividadSection.tsx"
Cohesion: 0.36
Nodes (10): @radix-ui/react-accordion, FAQ_DATA, FAQAccordion(), FALLBACK_FRAMEWORK, LegalFramework(), RegulationItem, Accordion(), AccordionContent() (+2 more)

### Community 37 - "worklog.md"
Cohesion: 0.09
Nodes (21): Task ID: 3b - glass-tramites, Task ID: 3c - Main Agent, Task ID: 3d - Main Agent, Task ID: 3e - Main Agent, Task ID: cms-components-rebuild - Main Agent, Task ID: portal-sections-rebuild - Main Agent, Task ID: seed-update - seed-writer, Work Summary (+13 more)

### Community 38 - "RESOLUCIÓN No. 230 DEL MINISTRO DE JUSTICIA"
Cohesion: 0.11
Nodes (18): 16. EMPRESAS MIXTAS (Arts. 175-176), 17. CONTRATOS DE ASOCIACIÓN ECONÓMICA INTERNACIONAL (Art. 177), 19.1 Circunstancias a inscribir (Art. 185), 19.2 Obligaciones de información (Art. 187), 19. SUCURSALES (Arts. 185-187), 1. DATOS GENERALES, 23.1 Obligatoriedad, 23.2 Procedimiento de legalización (+10 more)

### Community 39 - "check-auth.js"
Cohesion: 0.22
Nodes (9): bcryptjs, bcrypt, main(), maskDatabaseUrl(), { PrismaClient }, bcrypt, main(), parseArgs() (+1 more)

### Community 40 - "drawer.tsx"
Cohesion: 0.20
Nodes (8): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 41 - "server.ts"
Cohesion: 0.22
Nodes (8): createSystemMessage(), createUserMessage(), generateMessageId(), httpServer, io, Message, User, users

### Community 42 - "GuideStepsEditor.tsx"
Cohesion: 0.15
Nodes (19): @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, GuideStepData, GuideStepsEditor(), GuideStepsEditorProps, parseGuideSteps(), serializeGuideSteps() (+11 more)

### Community 43 - "utils.ts"
Cohesion: 0.08
Nodes (15): clsx, input-otp, @radix-ui/react-hover-card, @radix-ui/react-radio-group, @radix-ui/react-slider, tailwind-merge, FileListProps, FileUploadProps (+7 more)

### Community 44 - "src/components/portal/sections/ConsultasSection.tsx"
Cohesion: 0.13
Nodes (33): ConsultasSection(), fadeInUp, SearchResult, staggerContainer, DashboardUser, InformationRequest, PortalDashboard(), UserProcedure (+25 more)

### Community 45 - "chart.tsx"
Cohesion: 0.27
Nodes (10): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent(), getPayloadConfigFromPayload() (+2 more)

### Community 46 - "context-menu.tsx"
Cohesion: 0.12
Nodes (10): @radix-ui/react-context-menu, ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut() (+2 more)

### Community 47 - "Portal del Registro Mercantil de Cuba"
Cohesion: 0.17
Nodes (12): Comandos frecuentes, 🤖 Configuración del chatbot IA, 🤝 Contribución, 🏃 Desarrollo local, 📁 Estructura del Proyecto, 🛠️ Herramientas de Desarrollo (MCP), 📄 Licencia, 🧱 Migraciones y semillas (+4 more)

### Community 48 - "DECRETO-LEY 226/2001 "DEL REGISTRO MERCANTIL" (CONCORDADO)"
Cohesion: 0.18
Nodes (10): 12. FACULTADES DEL MINISTRO DE JUSTICIA (Art. 28), 13. DISPOSICIONES TRANSITORIAS, 14. DISPOSICIONES ESPECIALES, 16. PLAZOS CLAVE PARA EL PORTAL, 17. LEYES DEROGADAS (Disposición Final Tercera), 19. ENTRADA EN VIGOR, 1. OBJETIVO GENERAL DEL DECRETO, 3. LIBROS DEL REGISTRO MERCANTIL (Art. 3) (+2 more)

### Community 49 - "deploy.sh"
Cohesion: 0.57
Nodes (7): configure_docker_registry(), die(), read_env_value(), require_command(), deploy.sh script, upsert_env(), wait_for_postgres()

### Community 50 - "JsonFieldEditor.tsx"
Cohesion: 0.43
Nodes (7): JsonFieldEditor(), JsonFieldEditorProps, jsonToKVs(), KVPair, kvsToJson(), uid(), validateJson()

### Community 51 - "lucide-react"
Cohesion: 0.18
Nodes (13): lucide-react, recharts, CHART_CONST_CANCEL, PROVINCES_DATA, CHART_SECTORES, CHART_SOCIEDADES, ConstitutionsBarChart, EstadisticasSection() (+5 more)

### Community 52 - "run-migrations.js"
Cohesion: 0.53
Nodes (4): main(), runCommand(), seedDatabase(), { spawnSync }

### Community 53 - "5. REGLAS GENERALES DE INSCRIPCIÓN"
Cohesion: 0.20
Nodes (10): 5.1 Obligatoriedad y forma (Art. 5), 5.2 Efectos de la inscripción (Art. 6), 5.3 Calificación registral (Art. 7), 5.4 Presunción y validez de los asientos (Arts. 8-9), 5.5 Requisitos de inscripción (Arts. 10-13), 5.6 Prelación (Art. 14), 5.7 Tratamiento profesional (Art. 15), 5.8 Documentos en idioma extranjero (Art. 16) (+2 more)

### Community 54 - "documents/route.ts"
Cohesion: 0.14
Nodes (20): sharp, fs, main(), parseArgs(), path, upsertEnvValue(), createOverlaySVG(), main() (+12 more)

### Community 55 - "update-minjus.sh"
Cohesion: 0.53
Nodes (4): fail(), log(), phase(), update-minjus.sh script

### Community 56 - "api-auth.ts"
Cohesion: 0.25
Nodes (10): main(), main(), loginSchema, POST(), generateToken(), getJwtSecret(), hashPassword(), JWTPayload (+2 more)

### Community 57 - "AGENTS.md"
Cohesion: 0.20
Nodes (9): Archivos de referencia, CSP + Next.js App Router (crítico), Docker + Bun, Flujo de trabajo recomendado para agentes, Graphify local rules, Lecciones aprendidas, Normativa legal, Paleta MINJUS vs legacy (+1 more)

### Community 58 - "12. ASIENTOS REGISTRALES"
Cohesion: 0.22
Nodes (9): 12.1 Tipos de asientos (Art. 90), 12.2 Firma de los asientos (Art. 92), 12.3 Forma de los asientos (Arts. 94-95), 12.4 Asiento de presentación (Art. 96), 12.5 Identidad de personas físicas (Art. 97), 12.6 Identidad de personas jurídicas (Art. 98), 12.7 Fecha de inscripción (Art. 100), 12.8 Plazo para practicar inscripciones (Art. 104) (+1 more)

### Community 59 - "9. LIBROS DEL REGISTRO MERCANTIL"
Cohesion: 0.22
Nodes (9): 9.1 Libros obligatorios (Art. 45), 9.2 Habilitación de libros (Art. 46), 9.3 Diligencia de apertura (Art. 47), 9.4 Características físicas de los libros (Arts. 48-49), 9.5 Cierre de libros (Art. 50), 9.6 Conservación y destrucción (Arts. 51-53), 9.7 Índice de los libros (Art. 56), 9.8 Sistema de inscripción (Art. 58) (+1 more)

### Community 60 - "8.2 Estructura de tarifas tipo"
Cohesion: 0.25
Nodes (8): 8.1 Facultad de fijación (Art. 28.c), 8.2 Estructura de tarifas tipo, 8. TARIFAS Y RECARGOS, Recargos por extemporaneidad (Art. 6.1 y 27.1), Tarifas de inscripción (por tipo de sujeto), Tarifas por certificaciones y notas simples, Tarifas por modificación, Tarifas por recursos (Art. 9)

### Community 61 - "22. DEPÓSITO DE CUENTAS ANUALES"
Cohesion: 0.25
Nodes (8): 22.1 Plazo de depósito (Art. 200), 22.2 Consecuencias del incumplimiento (Art. 201), 22.3 Examen del Registrador (Art. 203), 22.4 Verificación de cuentas (Art. 204), 22.5 Requisitos para el depósito (Art. 205), 22.6 Publicidad de cuentas anuales (Art. 206), 22.7 Denegación o suspensión (Art. 207), 22. DEPÓSITO DE CUENTAS ANUALES

### Community 63 - "Servidores MCP disponibles"
Cohesion: 0.29
Nodes (7): 1. Graphify (Code Graph), 2. Context7 (Documentación de librerías), 3. Engram (Memoria persistente), 4. gh-grep (Búsqueda en GitHub), 5. OpenCode (Gestión del entorno), 6. Browser (Automatización), Servidores MCP disponibles

### Community 64 - "Artículo VI: Despliegue y Docker"
Cohesion: 0.29
Nodes (7): 6.1 Entornos, 6.2 Docker Compose, 6.3 Script de despliegue, 6.4 Proxy inverso, 6.5 Build standalone, 6.6 Verificación post-deploy, Artículo VI: Despliegue y Docker

### Community 73 - "7. DATOS ESPECÍFICOS POR TIPO DE SUJETO"
Cohesion: 0.29
Nodes (7): 7.1 Empresas Estatales (Art. 19), 7.2 Sociedades Mercantiles (Art. 20), 7.3 Empresas Mixtas (Art. 21), 7.4 Contratos de Asociación Económica Internacional (Art. 22), 7.5 Empresas de Capital Totalmente Extranjero (Art. 23), 7.6 Personas Naturales (Art. 24), 7. DATOS ESPECÍFICOS POR TIPO DE SUJETO

### Community 74 - "Review Focus"
Cohesion: 0.13
Nodes (14): Dictamen MINJUS — Actualización Integral del Portal RM Implementation Plan, Global Constraints, Review Focus, Self-Review, Task 10: Build verification y graphify update, Task 1: Variables CSS MINJUS en globals.css, Task 2: Paleta MINJUS en componentes portal, Task 3: VUINEX + ZED Mariel + Corrección VUCE en ForeignInvestment.tsx (+6 more)

### Community 75 - "10. CALIFICACIÓN Y RECURSOS"
Cohesion: 0.29
Nodes (7): 10.1 Calificación (Art. 59), 10.2 Plazo de calificación (Art. 61), 10.3 Resolución de calificación (Arts. 62-63), 10.4 Subsanación (Art. 64), 10.5 Recursos (Arts. 66-71), 10.6 Partes legitimadas para recurrir (Art. 67), 10. CALIFICACIÓN Y RECURSOS

### Community 76 - "8. EL REGISTRADOR MERCANTIL"
Cohesion: 0.29
Nodes (7): 8.1 Requisitos para ser Registrador (Art. 36), 8.2 Prohibiciones (Art. 37), 8.3 Causales de cese (Art. 39), 8.4 Funciones del Registrador (Art. 40), 8.5 Sustituto del Registrador (Art. 43), 8.6 Sustitución por más de 30 días (Art. 44), 8. EL REGISTRADOR MERCANTIL

### Community 77 - "🚀 Instalación y configuración"
Cohesion: 0.29
Nodes (7): 1) Clonar y preparar el entorno, 2) Variables de entorno, 3) Base de datos, 🚀 Instalación y configuración, Opción A: contenedor PostgreSQL del proyecto, Opción B: iniciar todo el stack, Requisitos

### Community 78 - "Convenciones del proyecto"
Cohesion: 0.29
Nodes (7): API, Arquitectura, Base de datos, Componentes, Convenciones del proyecto, Estilos, Fetching en cliente

### Community 79 - "Artículo IV: Estándares de API"
Cohesion: 0.33
Nodes (6): 4.1 Formato de respuesta, 4.2 Validación de entrada, 4.3 Métodos HTTP, 4.4 Manejo de errores, 4.5 Fetching en cliente, Artículo IV: Estándares de API

### Community 80 - "Artículo V: Base de Datos y Migraciones"
Cohesion: 0.33
Nodes (6): 5.1 ORM y esquema, 5.2 Migraciones, 5.3 Seeds, 5.4 Backups, 5.5 Modelos, Artículo V: Base de Datos y Migraciones

### Community 81 - "4. PROCESO DE INSCRIPCIÓN"
Cohesion: 0.33
Nodes (6): 4.1 Requisitos de forma (Art. 7), 4.2 Plazos (Art. 6), 4.3 Efectos de la inscripción (Art. 8), 4.4 Modificaciones (Art. 12), 4.5 Cancelación (Art. 16), 4. PROCESO DE INSCRIPCIÓN

### Community 82 - "13. INSCRIPCIONES ESPECÍFICAS"
Cohesion: 0.33
Nodes (6): 13.1 Inscripción primera (Art. 115), 13.2 Licencias, permisos y autorizaciones (Art. 116), 13.3 Comparecientes (Arts. 117-119), 13.4 Subsanación de errores y omisiones (Arts. 120-130), 13.5 Cancelación registral (Arts. 131-134), 13. INSCRIPCIONES ESPECÍFICAS

### Community 83 - "15. FUSIÓN, ESCISIÓN, DISOLUCIÓN Y LIQUIDACIÓN"
Cohesion: 0.33
Nodes (6): 15.1 Fusión (Arts. 153-159), 15.2 Escisión (Arts. 160-163), 15.3 Disolución (Arts. 164-168), 15.4 Prórroga (Arts. 166-167), 15.5 Extinción (Arts. 170-171), 15. FUSIÓN, ESCISIÓN, DISOLUCIÓN Y LIQUIDACIÓN

### Community 84 - "🚀 Instalación y Configuración"
Cohesion: 0.33
Nodes (6): 1. Clonar el Repositorio, 2. Instalar Dependencias, 3. Configurar Variables de Entorno, 4. Configurar Base de Datos, 🚀 Instalación y Configuración, Prerrequisitos

### Community 85 - "🚀 Despliegue con Docker"
Cohesion: 0.33
Nodes (6): Configurar dominios públicos, Construir y levantar, Despliegue completo con dominio y migraciones, 🚀 Despliegue con Docker, Variables de ejemplo para producción, Verificar estado

### Community 87 - "Artículo II: Accesibilidad WCAG 2.1 AA"
Cohesion: 0.40
Nodes (5): 2.1 Compromiso obligatorio, 2.2 Contraste de colores, 2.3 Navegación por teclado, 2.4 Semántica y ARIA, Artículo II: Accesibilidad WCAG 2.1 AA

### Community 88 - "Artículo III: Arquitectura Next.js App Router"
Cohesion: 0.22
Nodes (7): 3.1 Estructura obligatoria, 3.2 Server Components vs Client Components, 3.3 Path alias, 3.4 Providers, Artículo III: Arquitectura Next.js App Router, Cláusula de Enmienda, Constitución del Portal del Registro Mercantil de Cuba

### Community 89 - "Artículo VII: Convenciones de Código"
Cohesion: 0.40
Nodes (5): 7.1 Lenguaje y tipado, 7.2 Estilo, 7.3 Nomenclatura, 7.4 Commits, Artículo VII: Convenciones de Código

### Community 90 - "11. PUBLICIDAD E INFORMACIÓN REGISTRAL"
Cohesion: 0.40
Nodes (5): 11.1 Certificaciones (Arts. 74-84), 11.2 Legitimación para solicitar información (Arts. 82-83), 11.3 Exhibición de libros (Art. 85), 11.4 Boletín Oficial (Arts. 87-89), 11. PUBLICIDAD E INFORMACIÓN REGISTRAL

### Community 91 - "14. INSCRIPCIÓN DE SOCIEDADES MERCANTILES"
Cohesion: 0.40
Nodes (5): 14.1 Circunstancias a inscribir (Art. 139), 14.2 Contenido de la inscripción primera (Art. 140), 14.3 Aumento de capital (Art. 150), 14.4 Reducción de capital (Arts. 151-152), 14. INSCRIPCIÓN DE SOCIEDADES MERCANTILES

### Community 92 - "18. PERSONAS NATURALES EXTRANJERAS (Arts. 178-184)"
Cohesion: 0.40
Nodes (5): 18.1 Circunstancias a inscribir (Art. 178), 18.2 Contenido de la inscripción (Art. 179), 18.3 Forma de inscripción (Art. 180), 18.4 Personas casadas (Art. 182), 18. PERSONAS NATURALES EXTRANJERAS (Arts. 178-184)

### Community 93 - "20. CONTRATOS DE AGENCIA (Arts. 190-193)"
Cohesion: 0.40
Nodes (5): 20.1 Circunstancias a inscribir (Art. 190), 20.2 Vigencia (Art. 191), 20.3 Obligaciones de información (Art. 192), 20.4 Cancelación o suspensión (Art. 193), 20. CONTRATOS DE AGENCIA (Arts. 190-193)

### Community 94 - "29. REQUISITOS TÉCNICOS PARA EL PORTAL (DERIVADOS DE ESTA RESOLUCIÓN)"
Cohesion: 0.40
Nodes (5): 29.1 Gestión de plazos, 29.2 Módulos funcionales requeridos, 29.3 Integraciones externas requeridas, 29.4 Estructura de datos para asientos, 29. REQUISITOS TÉCNICOS PARA EL PORTAL (DERIVADOS DE ESTA RESOLUCIÓN)

### Community 95 - "7. ORGANIZACIÓN DEL REGISTRO MERCANTIL"
Cohesion: 0.40
Nodes (5): 7.1 Registro Mercantil Central (Arts. 25-27), 7.2 Registros Mercantiles Territoriales (Arts. 32-33), 7.3 Jurisdicción y competencia (Art. 31), 7.4 Auxilio de las Direcciones Provinciales de Justicia (Art. 34), 7. ORGANIZACIÓN DEL REGISTRO MERCANTIL

### Community 96 - "🐛 Problemas comunes"
Cohesion: 0.40
Nodes (5): Error: build falla por Node o .next, Error: el contenedor no arranca, Error: login falla incluso con credenciales correctas, 🐛 Problemas comunes, Puerto ocupado

### Community 97 - "User"
Cohesion: 0.40
Nodes (5): CmsDashboardProps, CmsLayoutProps, NavItem, CMSView, User

### Community 98 - "src/components/portal/sections/HomeSection.tsx"
Cohesion: 0.15
Nodes (13): embla-carousel-autoplay, AnimatedCounter(), FloatingParticle(), HomeSection(), iconMap, NewsItem, PublicContent, SearchResult (+5 more)

### Community 99 - "10. INTERACCIÓN CON TERCEROS"
Cohesion: 0.50
Nodes (4): 10.1 Notarios (Art. 10), 10.2 Organismos de la Administración Central del Estado (Disposiciones Especiales 2 y 3), 10.3 Contribuyentes (Art. 13), 10. INTERACCIÓN CON TERCEROS

### Community 100 - "11. SANCIONES (Art. 27)"
Cohesion: 0.50
Nodes (4): 11.1 Recargos, 11.2 Suspensión, 11.3 Funcionalidad en el portal, 11. SANCIONES (Art. 27)

### Community 101 - "2. SUJETOS Y ACTOS INSCRIBIBLES (Art. 2)"
Cohesion: 0.50
Nodes (4): 2.1 Sujetos obligados a inscribirse, 2.2 Depósito de informes financieros (Art. 2.2), 2.3 Facultad de verificación (Art. 2.3), 2. SUJETOS Y ACTOS INSCRIBIBLES (Art. 2)

### Community 102 - "6. INFORMACIÓN REGISTRAL Y PUBLICIDAD"
Cohesion: 0.50
Nodes (4): 6.1 Publicidad (Art. 17), 6.2 Boletín Oficial (Art. 18), 6.3 Certificación (Art. 14), 6. INFORMACIÓN REGISTRAL Y PUBLICIDAD

### Community 103 - "9. IMPUESTOS ASOCIADOS (Art. 13)"
Cohesion: 0.50
Nodes (4): 9.1 Requisitos fiscales, 9.2 Excepción (Art. 13.2), 9.3 Impuestos aplicables por tipo de acto, 9. IMPUESTOS ASOCIADOS (Art. 13)

### Community 104 - "24. CONTROL Y SUPERVISIÓN (Arts. 210-211)"
Cohesion: 0.50
Nodes (4): 24.1 Control metodológico, 24.2 Memoria estadística, 24.3 Información a otras entidades (Disposición Segunda), 24. CONTROL Y SUPERVISIÓN (Arts. 210-211)

### Community 105 - "3. SISTEMA DEL REGISTRO MERCANTIL"
Cohesion: 0.50
Nodes (4): 3.1 Integración del Sistema (Art. 1), 3.2 Objetos del Registro Mercantil (Art. 2), 3.3 Publicidad del Registro (Art. 3), 3. SISTEMA DEL REGISTRO MERCANTIL

### Community 106 - "💾 Backups y restauración de la base de datos"
Cohesion: 0.50
Nodes (4): 💾 Backups y restauración de la base de datos, Copia de seguridad manual, Restauración, Scripts automatizados

### Community 107 - "🚀 Características Principales"
Cohesion: 0.50
Nodes (4): 🚀 Características Principales, 🔍 Funcionalidades Avanzadas, 🔧 Panel de Administración (CMS), 📊 Portal Público

### Community 108 - "📜 Logs"
Cohesion: 0.50
Nodes (4): Diagnóstico rápido de autenticación, 📜 Logs, Logs de Docker, Logs del proyecto

### Community 109 - "15. REQUISITOS TÉCNICOS PARA EL PORTAL DIGITAL"
Cohesion: 0.67
Nodes (3): 15.1 Módulos funcionales, 15.2 Requisitos técnicos, 15. REQUISITOS TÉCNICOS PARA EL PORTAL DIGITAL

### Community 110 - "18. NOTAS ADICIONALES"
Cohesion: 0.67
Nodes (3): 18.1 Modificaciones al Decreto-Ley 226/2001, 18.2 Artículos derogados, 18. NOTAS ADICIONALES

### Community 111 - "5. CALIFICACIÓN REGISTRAL Y RECURSOS (Art. 9)"
Cohesion: 0.67
Nodes (3): 5.1 Procedimiento, 5.2 Recursos, 5. CALIFICACIÓN REGISTRAL Y RECURSOS (Art. 9)

### Community 112 - "21. DENOMINACIONES (Arts. 194-199)"
Cohesion: 0.67
Nodes (3): 21.1 Sección de denominaciones (Art. 194), 21.2 Reglas sobre denominaciones (Arts. 195-199), 21. DENOMINACIONES (Arts. 194-199)

### Community 113 - "🧠 Grafo de Conocimiento (Graphify)"
Cohesion: 0.67
Nodes (3): 🧠 Grafo de Conocimiento (Graphify), Instalación, Uso

### Community 114 - "✅ Usuarios por defecto y autenticación"
Cohesion: 0.67
Nodes (3): Reforzar contraseña del admin, ✅ Usuarios por defecto y autenticación, Verificar autenticación

### Community 117 - "db.ts"
Cohesion: 0.08
Nodes (13): next-auth, @prisma/client, extractKeywords(), KnowledgeItem, POST(), POST(), GET(), POST() (+5 more)

### Community 118 - "navigation-menu.tsx"
Cohesion: 0.22
Nodes (10): @radix-ui/react-navigation-menu, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger() (+2 more)

### Community 119 - "toggle-group.tsx"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 120 - "PremiumModal.tsx"
Cohesion: 0.24
Nodes (8): react-dom, getDefaultPlans(), iconMap, PremiumModalProps, getDefaultPlans(), PricingPlan, PricingPlans(), PricingPlansProps

### Community 121 - "Plan de actualización normativa del Portal"
Cohesion: 0.29
Nodes (6): Criterio de actualización futura, Fuentes incorporadas, Implementación, Operación, Plan de actualización normativa del Portal, Statistic

### Community 122 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (4): __dirname, eslintConfig, __filename, eslint-config-next

### Community 123 - "Skills instaladas globalmente"
Cohesion: 0.20
Nodes (10): 1. Taste Skill (`design-taste-frontend`), 2. UI UX Pro Max (`ui-ux-pro-max`), 3. Caveman (22 sub-skills), 4. Karpathy Guidelines (`karpathy-guidelines`), 5. Matt Pocock Skills (38+ skills), 6. Anthropic Skills (19 skills), 7. Ponytail (6 skills + plugin), 8. Superpowers (plugin) (+2 more)

### Community 124 - "deploy-debian13.sh"
Cohesion: 0.70
Nodes (4): error(), info(), deploy-debian13.sh script, warn()

### Community 125 - "calendar.tsx"
Cohesion: 0.67
Nodes (3): react-day-picker, Calendar(), CalendarDayButton()

### Community 127 - "resizable.tsx"
Cohesion: 0.40
Nodes (3): react-resizable-panels, ResizableHandle(), ResizablePanelGroup()

### Community 128 - "SDD Ledger — Dictamen MINJUS"
Cohesion: 0.40
Nodes (4): Commits, Progress, SDD Ledger — Dictamen MINJUS, Unblocked / Pending

### Community 129 - "Artículo VIII: Herramientas de IA para Agentes"
Cohesion: 0.50
Nodes (4): 8.1 Grafo de conocimiento (Graphify), 8.2 Memoria persistente (Engram), 8.3 Documentación de librerías (Context7), Artículo VIII: Herramientas de IA para Agentes

## Knowledge Gaps
- **20 isolated node(s):** `@hookform/resolvers`, `@mdxeditor/editor`, `@reactuses/core`, `@tanstack/react-query`, `@tanstack/react-table` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 910 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `requireAuth`, `parseModelFromPath`, `requireAdmin`, `use-toast.ts`, `app/page.tsx`, `src/components/portal/sections/ConsultasSection.tsx`, `package.json`, `lucide-react`, `lucide-react`, `portal-auth.ts`, `db.ts`, `documents/route.ts`, `api-auth.ts`?**
  _High betweenness centrality (0.282) - this node is a cross-community bridge._
- **What connects `@hookform/resolvers`, `@mdxeditor/editor`, `@reactuses/core` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.10279814454586264 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Button`, `src/data/portal-data.ts`, `sidebar.tsx`, `sections/index.ts`, `use-toast.ts`, `app/page.tsx`, `Card`, `package.json`, `card.tsx`, `lucide-react`, `menubar.tsx`, `dropdown-menu.tsx`, `carousel.tsx`, `form.tsx`, `pagination.tsx`, `NormatividadSection.tsx`, `drawer.tsx`, `GuideStepsEditor.tsx`, `utils.ts`, `src/components/portal/sections/ConsultasSection.tsx`, `chart.tsx`, `context-menu.tsx`, `JsonFieldEditor.tsx`, `lucide-react`, `popover.tsx`, `src/components/portal/sections/HomeSection.tsx`, `navigation-menu.tsx`, `toggle-group.tsx`, `PremiumModal.tsx`, `calendar.tsx`, `resizable.tsx`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Should `requireAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.04968354430379747 - nodes in this community are weakly interconnected._
- **Why does `requireAuth()` connect `requireAuth` to `requireAdmin`, `next`, `Convenciones del proyecto`, `Registro Mercantil de Cuba — Índice del Proyecto`, `db.ts`, `documents/route.ts`, `Revisión de seguridad del portal: front-end, back-end y despliegue`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.028985507246376812 - nodes in this community are weakly interconnected._