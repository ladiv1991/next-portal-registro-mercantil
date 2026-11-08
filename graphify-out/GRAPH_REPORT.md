# Graph Report - next-portal-registro-mercantil  (2026-11-07)

## Corpus Check
- 293 files · ~225,861 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: (none) 7, .example 2, .woff2 2)

## Summary
- 2213 nodes · 6448 edges · 123 communities (114 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 65 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bb9f1121`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- handleCMSPut
- checkOrigin
- dependencies
- cms-faq.tsx
- PremiumFeaturesExample.tsx
- cms-handler.ts
- cms-schemas.ts
- sidebar.tsx
- package.json
- CardHeader
- upload/route.ts
- Constitución del Portal del Registro Mercantil de Cuba
- next
- toggle-group.tsx
- use-toast.ts
- forgot-password/route.ts
- ConsultasSection.tsx
- FAQAccordion.tsx
- EXTRACTO ESTADÍSTICO DEL SISTEMA INFORMATIVO DEL REGISTRO MERCANTIL
- Revisión de seguridad del portal: front-end, back-end y despliegue
- utils.ts
- RESOLUCIÓN 51 DEL MINISTRO DE JUSTICIA
- scripts
- worklog.md
- popover.tsx
- portal-data.ts
- Registro Mercantil de Cuba — Índice del Proyecto
- OpenSpec — Especificaciones (OBLIGATORIO)
- react
- compilerOptions
- cms-enzona-config.tsx
- RESOLUCIÓN No. 230 DEL MINISTRO DE JUSTICIA
- components.json
- Button
- cms-api.ts
- resizable.tsx
- carousel.tsx
- app/page.tsx
- form.tsx
- PortalHeader.tsx
- reset-admin-password.js
- Skills instaladas globalmente
- Lecciones aprendidas
- GuideStepsEditor.tsx
- Portal del Registro Mercantil de Cuba
- drawer.tsx
- context-menu.tsx
- DECRETO-LEY 226/2001 "DEL REGISTRO MERCANTIL" (CONCORDADO)
- navigation-menu.tsx
- chart.tsx
- Seguridad — Next.js + Node.js + PostgreSQL (2026)
- 5. REGLAS GENERALES DE INSCRIPCIÓN
- Servidores MCP disponibles
- 12. ASIENTOS REGISTRALES
- 9. LIBROS DEL REGISTRO MERCANTIL
- HomeSection.tsx
- manifest.json
- test-all.mjs
- Estado de Seguridad — Actualizado 2026-10-27 (upgrade Next.js 16.4.3)
- AGENTS.md
- 8.2 Estructura de tarifas tipo
- 22. DEPÓSITO DE CUENTAS ANUALES
- 🔄 CI/CD — Despliegue Automático (Preproducción)
- deploy-preprod.sh
- sections/index.ts
- 7. DATOS ESPECÍFICOS POR TIPO DE SUJETO
- 10. CALIFICACIÓN Y RECURSOS
- 8. EL REGISTRADOR MERCANTIL
- check-auth.js
- cms-regulations.tsx
- 🚀 Instalación y configuración
- Convenciones del proyecto
- 4. PROCESO DE INSCRIPCIÓN
- 13. INSCRIPCIONES ESPECÍFICAS
- 15. FUSIÓN, ESCISIÓN, DISOLUCIÓN Y LIQUIDACIÓN
- 🚀 Instalación y Configuración
- 🚀 Despliegue con Docker
- run-migrations.js
- Input
- 11. PUBLICIDAD E INFORMACIÓN REGISTRAL
- 14. INSCRIPCIÓN DE SOCIEDADES MERCANTILES
- 18. PERSONAS NATURALES EXTRANJERAS (Arts. 178-184)
- 20. CONTRATOS DE AGENCIA (Arts. 190-193)
- 29. REQUISITOS TÉCNICOS PARA EL PORTAL (DERIVADOS DE ESTA RESOLUCIÓN)
- 7. ORGANIZACIÓN DEL REGISTRO MERCANTIL
- middleware.ts
- 🔐 Seguridad en Autenticación CMS
- 🐛 Problemas comunes
- portal-functional-tests.mjs
- menubar.tsx
- deploy.sh
- pagination.tsx
- cms-procedures.tsx
- chat-knowledge.ts
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
- backup-db.sh
- prepare-preprod-env.sh
- 15. REQUISITOS TÉCNICOS PARA EL PORTAL DIGITAL
- 18. NOTAS ADICIONALES
- 5. CALIFICACIÓN REGISTRAL Y RECURSOS (Art. 9)
- 21. DENOMINACIONES (Arts. 194-199)
- 🧠 Grafo de Conocimiento (Graphify)
- ✅ Usuarios por defecto y autenticación
- fix-old-colors.sh
- postcss.config.mjs
- download-fonts.sh
- push-to-harbor.sh
- captcha-v2.ts
- JsonFieldEditor.tsx
- Plan de actualización normativa del Portal
- input-otp.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 244 edges
2. `react` - 108 edges
3. `next` - 107 edges
4. `Card()` - 106 edges
5. `checkOrigin()` - 106 edges
6. `Button()` - 104 edges
7. `CardContent()` - 104 edges
8. `lucide-react` - 91 edges
9. `Input()` - 68 edges
10. `Badge()` - 67 edges

## Surprising Connections (you probably didn't know these)
- `Implementación` --references--> `Statistic`  [INFERRED]
  documents/PLAN_ACTUALIZACION_PORTAL_NORMATIVA.md → src/components/cms/cms-types.ts
- `Fix botón "Autenticarse" (Oct 2026)` --references--> `AuthenticationModal()`  [INFERRED]
  AGENTS.md → src/components/portal/auth/AuthenticationModal.tsx
- `Resultado ejecutivo actualizado` --references--> `HomeSection()`  [INFERRED]
  docs/security-review.md → src/components/portal/sections/HomeSection.tsx
- `🔐 Autenticación` --references--> `requireAuth()`  [INFERRED]
  PROJECT_INDEX.md → src/lib/api-auth.ts
- `Cambios aplicados en esta ejecución` --references--> `requireAdmin()`  [INFERRED]
  docs/security-review.md → src/lib/api-auth.ts

## Import Cycles
- None detected.

## Communities (123 total, 9 thin omitted)

### Community 0 - "handleCMSPut"
Cohesion: 0.07
Nodes (46): DELETE(), GET(), PUT(), DELETE(), GET(), PUT(), DELETE(), GET() (+38 more)

### Community 1 - "checkOrigin"
Cohesion: 0.05
Nodes (73): API, Arquitectura, Credenciales de prueba (seed), 1.2 Autenticación y autorización, 7) Autorización débil y no consistente, bcryptjs, zod, POST() (+65 more)

### Community 2 - "dependencies"
Cohesion: 0.03
Nodes (72): dependencies, bcryptjs, class-variance-authority, clsx, cmdk, date-fns, @dnd-kit/core, @dnd-kit/sortable (+64 more)

### Community 3 - "cms-faq.tsx"
Cohesion: 0.15
Nodes (15): deleteFAQ(), updateSlider(), EMPTY, FormData, TYPES, CATEGORIES, EMPTY, FormData (+7 more)

### Community 4 - "PremiumFeaturesExample.tsx"
Cohesion: 0.23
Nodes (10): metadata, PremiumDemoPage(), PremiumFeaturesExample(), PremiumGateButton(), PremiumGateButtonProps, PremiumGateWrapper(), PremiumGateWrapperProps, FeatureAccessOptions (+2 more)

### Community 5 - "cms-handler.ts"
Cohesion: 0.09
Nodes (41): GET(), POST(), GET(), POST(), GET(), POST(), GET(), POST() (+33 more)

### Community 6 - "cms-schemas.ts"
Cohesion: 0.03
Nodes (57): RFC-5322, BOT_CONFIG_SCHEMA, BOT_PROVIDERS, CMS_SCHEMAS, CONTACT_SCHEMA, CONTACT_TYPES, createBotConfigSchema, createContactSchema (+49 more)

### Community 7 - "sidebar.tsx"
Cohesion: 0.05
Nodes (55): cmdk, @radix-ui/react-dropdown-menu, @radix-ui/react-slot, AlertTitle(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList() (+47 more)

### Community 8 - "package.json"
Cohesion: 0.04
Nodes (42): name, prisma, seed, private, version, bun-types, date-fns, eslint (+34 more)

### Community 9 - "CardHeader"
Cohesion: 0.12
Nodes (28): Secciones del Portal, recharts, CHART_CONST_CANCEL, ConstitutionsBarChart(), ProvinceDistribution(), PROVINCES_DATA, CHART_SECTORES, SectorsHorizontalChart() (+20 more)

### Community 10 - "upload/route.ts"
Cohesion: 0.06
Nodes (36): __dirname, eslintConfig, __filename, eslint-config-next, sharp, fs, main(), parseArgs() (+28 more)

### Community 11 - "Constitución del Portal del Registro Mercantil de Cuba"
Cohesion: 0.04
Nodes (46): 1.1 Credenciales y secretos, 1.3 Protección de datos, 1.4 Same-Origin Enforcement (CSRF en Route Handlers), 1.5 Límites de subida de archivos, 2.1 Compromiso obligatorio, 2.2 Contraste de colores, 2.3 Navegación por teclado, 2.4 Semántica y ARIA (+38 more)

### Community 12 - "next"
Cohesion: 0.05
Nodes (31): nextConfig, jsonwebtoken, next, @prisma/client, GET(), extractKeywords(), KnowledgeItem, POST() (+23 more)

### Community 13 - "toggle-group.tsx"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 14 - "use-toast.ts"
Cohesion: 0.10
Nodes (30): @radix-ui/react-toast, geistMono, geistSans, metadata, RootLayout(), Toast, ToastAction, ToastActionElement (+22 more)

### Community 15 - "forgot-password/route.ts"
Cohesion: 0.06
Nodes (52): main(), nodemailer, POST(), schema, loginSchema, POST(), POST(), schema (+44 more)

### Community 16 - "ConsultasSection.tsx"
Cohesion: 0.11
Nodes (35): @radix-ui/react-tabs, DashboardUser, InformationRequest, PortalDashboard(), UserProcedure, ContactForm(), FormData, FormErrors (+27 more)

### Community 17 - "FAQAccordion.tsx"
Cohesion: 0.41
Nodes (9): FAQ_DATA, FAQAccordion(), FALLBACK_FRAMEWORK, LegalFramework(), RegulationItem, Accordion(), AccordionContent(), AccordionItem() (+1 more)

### Community 18 - "EXTRACTO ESTADÍSTICO DEL SISTEMA INFORMATIVO DEL REGISTRO MERCANTIL"
Cohesion: 0.06
Nodes (31): 10. INDICADORES CLAVE DE DESEMPEÑO (KPI), 11. ANÁLISIS COMPARATIVO POR TIPO DE SUJETO, 12.1 Del Resumen Ejecutivo, 12.2 De las Verificaciones, 12.3 De los Ingresos, 12. OBSERVACIONES Y COMENTARIOS, 13. DEFINICIONES DE LOS INDICADORES ESTADÍSTICOS, 1. DATOS GENERALES DEL MODELO (+23 more)

### Community 19 - "Revisión de seguridad del portal: front-end, back-end y despliegue"
Cohesion: 0.07
Nodes (29): 10) Carencia de rate limiting y protección anti-bruta, 1) JWT con secreto por defecto y fallback inseguro, 2) Login del portal usa contraseña fija y no autenticación real, 3) Credenciales default exponiendo acceso administrativo, 4) Upload sin validación ni control de contenido, 5) XSS por renderizado de contenido HTML no sanitizado, 6) Falta de cabeceras de seguridad en la app, 8) Logs de Prisma revelando estructura del sistema (+21 more)

### Community 20 - "utils.ts"
Cohesion: 0.07
Nodes (21): clsx, @radix-ui/react-avatar, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, tailwind-merge (+13 more)

### Community 21 - "RESOLUCIÓN 51 DEL MINISTRO DE JUSTICIA"
Cohesion: 0.07
Nodes (27): 10. RESPONSABLES DE LA APLICACIÓN, 11. NORMAS DEROGADAS, 12. DESTINATARIOS DE LA COMUNICACIÓN, 13. MAPA DE RELACIÓN CON EL DECRETO-LEY 226/2001, 14.1 Parametrización de tarifas, 14.2 Registro y constancia, 14.3 Gestión de pagos, 14. REQUISITOS TÉCNICOS PARA EL PORTAL (DERIVADOS DE ESTA RESOLUCIÓN) (+19 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (36): devDependencies, bun-types, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, tw-animate-css, @types/bcryptjs (+28 more)

### Community 23 - "worklog.md"
Cohesion: 0.08
Nodes (24): AnimatedCounter(), Task ID: 3b - glass-tramites, Task ID: 3c - Main Agent, Task ID: 3d - Main Agent, Task ID: 3e - Main Agent, Task ID: api-routes-rebuild - Main Agent, Task ID: cms-components-rebuild - Main Agent, Task ID: portal-sections-rebuild - Main Agent (+16 more)

### Community 25 - "portal-data.ts"
Cohesion: 0.18
Nodes (20): BENEFITS, CHART_CONST_CANCEL, CHART_SECTORES, CHART_SOCIEDADES, CONSTITUTION_STEPS, FAQ_DATA, FORMS, GACETA_ITEMS (+12 more)

### Community 26 - "Registro Mercantil de Cuba — Índice del Proyecto"
Cohesion: 0.06
Nodes (34): 🌐 API Routes, 🏗️ Arquitectura del Proyecto, Autenticación, Autenticación, 🔐 Autenticación, Autenticación y CMS, Base de Datos, 🎯 Características Principales (+26 more)

### Community 27 - "OpenSpec — Especificaciones (OBLIGATORIO)"
Cohesion: 0.40
Nodes (5): Artefactos requeridos (spec-driven schema), Comandos básicos, Flujo obligatorio, Instalación, OpenSpec — Especificaciones (OBLIGATORIO)

### Community 28 - "react"
Cohesion: 0.12
Nodes (28): react, ResetPasswordPage(), getStats(), CmsDashboard(), loadStats(), buildEmailTokens(), buildPhoneTokens(), ObfuscatedContact() (+20 more)

### Community 29 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 30 - "cms-enzona-config.tsx"
Cohesion: 0.15
Nodes (18): lucide-react, PortalLoginPage(), createEnzonaConfig(), getEnzonaConfig(), testEnzonaConnection(), updateEnzonaConfig(), CmsEnzonaConfig(), EnzonaConfig (+10 more)

### Community 31 - "RESOLUCIÓN No. 230 DEL MINISTRO DE JUSTICIA"
Cohesion: 0.11
Nodes (18): 16. EMPRESAS MIXTAS (Arts. 175-176), 17. CONTRATOS DE ASOCIACIÓN ECONÓMICA INTERNACIONAL (Art. 177), 19.1 Circunstancias a inscribir (Art. 185), 19.2 Obligaciones de información (Art. 187), 19. SUCURSALES (Arts. 185-187), 1. DATOS GENERALES, 23.1 Obligatoriedad, 23.2 Procedimiento de legalización (+10 more)

### Community 32 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 33 - "Button"
Cohesion: 0.23
Nodes (58): updateSitePage(), CmsBlocks(), CmsContacts(), CmsFAQ(), CmsGuides(), ACTIONS, CmsInquiries(), Inquiry (+50 more)

### Community 34 - "cms-api.ts"
Cohesion: 0.05
Nodes (89): Contenido del Portal, cmsCreate(), cmsDelete(), cmsGetAll(), cmsGetOne(), cmsUpdate(), cmsUrl(), createBlock() (+81 more)

### Community 35 - "resizable.tsx"
Cohesion: 0.40
Nodes (3): react-resizable-panels, ResizableHandle(), ResizablePanelGroup()

### Community 36 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 37 - "app/page.tsx"
Cohesion: 0.09
Nodes (33): isomorphic-dompurify, AccesoSection, AsistenciaSection, ConsultasSection, EstadisticasSection, FloatingChatbot, ForgotPasswordSection, Home() (+25 more)

### Community 38 - "form.tsx"
Cohesion: 0.19
Nodes (12): @radix-ui/react-label, react-hook-form, FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext (+4 more)

### Community 39 - "PortalHeader.tsx"
Cohesion: 0.12
Nodes (29): CMS (22 componentes), 📁 Componentes Principales, Layout (Portal Público), @radix-ui/react-tooltip, PortalFooter(), PortalFooterProps, ICON_MAP, NAV_ITEMS_CONFIG (+21 more)

### Community 40 - "reset-admin-password.js"
Cohesion: 0.50
Nodes (4): bcrypt, main(), parseArgs(), { PrismaClient }

### Community 41 - "Skills instaladas globalmente"
Cohesion: 0.17
Nodes (12): 10. Skills locales del proyecto, 1. Taste Skill (`design-taste-frontend`), 2. UI UX Pro Max (`ui-ux-pro-max`), 3. Caveman (22 sub-skills), 4. Karpathy Guidelines (`karpathy-guidelines`), 5. Matt Pocock Skills (38+ skills), 6. Anthropic Skills (19+ skills), 7. Skills de Seguridad Globales (30+ skills) (+4 more)

### Community 42 - "Lecciones aprendidas"
Cohesion: 0.15
Nodes (13): CMS Form Validation (Oct 2026), CMS ↔ Portal unificado, CSP + Next.js App Router (crítico), Docker + Bun, Docker Push to Harbor Corporate Registry, Enzona desactivado visualmente, Fix botón "Autenticarse" (Oct 2026), Lecciones aprendidas (+5 more)

### Community 43 - "GuideStepsEditor.tsx"
Cohesion: 0.15
Nodes (19): @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, GuideStepData, GuideStepsEditor(), GuideStepsEditorProps, parseGuideSteps(), serializeGuideSteps() (+11 more)

### Community 44 - "Portal del Registro Mercantil de Cuba"
Cohesion: 0.17
Nodes (12): Comandos frecuentes, 🤖 Configuración del chatbot IA, 🤝 Contribución, 🏃 Desarrollo local, 📁 Estructura del Proyecto, 🛠️ Herramientas de Desarrollo (MCP), 📄 Licencia, 🧱 Migraciones y semillas (+4 more)

### Community 45 - "drawer.tsx"
Cohesion: 0.20
Nodes (8): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 46 - "context-menu.tsx"
Cohesion: 0.12
Nodes (10): @radix-ui/react-context-menu, ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut() (+2 more)

### Community 47 - "DECRETO-LEY 226/2001 "DEL REGISTRO MERCANTIL" (CONCORDADO)"
Cohesion: 0.18
Nodes (10): 12. FACULTADES DEL MINISTRO DE JUSTICIA (Art. 28), 13. DISPOSICIONES TRANSITORIAS, 14. DISPOSICIONES ESPECIALES, 16. PLAZOS CLAVE PARA EL PORTAL, 17. LEYES DEROGADAS (Disposición Final Tercera), 19. ENTRADA EN VIGOR, 1. OBJETIVO GENERAL DEL DECRETO, 3. LIBROS DEL REGISTRO MERCANTIL (Art. 3) (+2 more)

### Community 48 - "navigation-menu.tsx"
Cohesion: 0.22
Nodes (10): @radix-ui/react-navigation-menu, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger() (+2 more)

### Community 49 - "chart.tsx"
Cohesion: 0.27
Nodes (10): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent(), getPayloadConfigFromPayload() (+2 more)

### Community 50 - "Seguridad — Next.js + Node.js + PostgreSQL (2026)"
Cohesion: 0.20
Nodes (10): 1. Versiones y CVEs (CRÍTICO), 2. Autenticación y Autorización, 3. Validación de Entrada, 4. Content Security Policy (CSP), 5. PostgreSQL, 6. Image Optimizer y SSRF, 7. Dependencias y Supply Chain, 8. Checklist pre-lanzamiento (+2 more)

### Community 51 - "5. REGLAS GENERALES DE INSCRIPCIÓN"
Cohesion: 0.20
Nodes (10): 5.1 Obligatoriedad y forma (Art. 5), 5.2 Efectos de la inscripción (Art. 6), 5.3 Calificación registral (Art. 7), 5.4 Presunción y validez de los asientos (Arts. 8-9), 5.5 Requisitos de inscripción (Arts. 10-13), 5.6 Prelación (Art. 14), 5.7 Tratamiento profesional (Art. 15), 5.8 Documentos en idioma extranjero (Art. 16) (+2 more)

### Community 52 - "Servidores MCP disponibles"
Cohesion: 0.22
Nodes (9): 1. Graphify (Code Graph), 2. Context7 (Documentación de librerías), 3. Engram (Memoria persistente), 4. gh-grep (Búsqueda en GitHub), 5. OpenCode (Gestión del entorno), 6. Browser (Automatización), 7. Chrome DevTools MCP (Browser Testing & Security Audit), 8. Cloudflare Security Audit (+1 more)

### Community 53 - "12. ASIENTOS REGISTRALES"
Cohesion: 0.22
Nodes (9): 12.1 Tipos de asientos (Art. 90), 12.2 Firma de los asientos (Art. 92), 12.3 Forma de los asientos (Arts. 94-95), 12.4 Asiento de presentación (Art. 96), 12.5 Identidad de personas físicas (Art. 97), 12.6 Identidad de personas jurídicas (Art. 98), 12.7 Fecha de inscripción (Art. 100), 12.8 Plazo para practicar inscripciones (Art. 104) (+1 more)

### Community 54 - "9. LIBROS DEL REGISTRO MERCANTIL"
Cohesion: 0.22
Nodes (9): 9.1 Libros obligatorios (Art. 45), 9.2 Habilitación de libros (Art. 46), 9.3 Diligencia de apertura (Art. 47), 9.4 Características físicas de los libros (Arts. 48-49), 9.5 Cierre de libros (Art. 50), 9.6 Conservación y destrucción (Arts. 51-53), 9.7 Índice de los libros (Art. 56), 9.8 Sistema de inscripción (Art. 58) (+1 more)

### Community 55 - "HomeSection.tsx"
Cohesion: 0.08
Nodes (25): embla-carousel-autoplay, react-dom, react-markdown, getDefaultPlans(), iconMap, PremiumModal(), PremiumModalProps, getDefaultPlans() (+17 more)

### Community 56 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 57 - "test-all.mjs"
Cohesion: 0.47
Nodes (3): parseCaptchaAnswer(), request(), runTests()

### Community 58 - "Estado de Seguridad — Actualizado 2026-10-27 (upgrade Next.js 16.4.3)"
Cohesion: 0.50
Nodes (4): Estado de Seguridad — Actualizado 2026-10-27 (upgrade Next.js 16.4.3), Fixes aplicados en esta sesión, Pendientes para futura implementación, Resumen de vulnerabilidades post-audit

### Community 59 - "AGENTS.md"
Cohesion: 0.25
Nodes (7): Archivos de referencia, CAPTCHA v2 + Guardian Trace Analysis (2026-10-27), Flujo de trabajo recomendado para agentes, Graphify local rules, Regla de verificación triple (obligatoria), This is NOT the Next.js you know, Use Graphify before grep

### Community 60 - "8.2 Estructura de tarifas tipo"
Cohesion: 0.25
Nodes (8): 8.1 Facultad de fijación (Art. 28.c), 8.2 Estructura de tarifas tipo, 8. TARIFAS Y RECARGOS, Recargos por extemporaneidad (Art. 6.1 y 27.1), Tarifas de inscripción (por tipo de sujeto), Tarifas por certificaciones y notas simples, Tarifas por modificación, Tarifas por recursos (Art. 9)

### Community 61 - "22. DEPÓSITO DE CUENTAS ANUALES"
Cohesion: 0.25
Nodes (8): 22.1 Plazo de depósito (Art. 200), 22.2 Consecuencias del incumplimiento (Art. 201), 22.3 Examen del Registrador (Art. 203), 22.4 Verificación de cuentas (Art. 204), 22.5 Requisitos para el depósito (Art. 205), 22.6 Publicidad de cuentas anuales (Art. 206), 22.7 Denegación o suspensión (Art. 207), 22. DEPÓSITO DE CUENTAS ANUALES

### Community 62 - "🔄 CI/CD — Despliegue Automático (Preproducción)"
Cohesion: 0.25
Nodes (8): Arquitectura del Pipeline, 🔄 CI/CD — Despliegue Automático (Preproducción), Etapas del Pipeline, Flujo de Despliegue, Infraestructura, Operaciones Remotas vía CI, Scripts Disponibles, Variables CI/CD (GitLab UI)

### Community 63 - "deploy-preprod.sh"
Cohesion: 0.43
Nodes (7): ask(), check(), DATABASE_URL, die(), info(), deploy-preprod.sh script, step()

### Community 64 - "sections/index.ts"
Cohesion: 0.22
Nodes (12): RefreshCw(), CONSTITUTION_STEPS, ConstitutionSteps(), ForeignInvestment(), MODIFICATION_TYPES, ModificationTypes(), ProcedureCard(), ProcedureCardProps (+4 more)

### Community 65 - "7. DATOS ESPECÍFICOS POR TIPO DE SUJETO"
Cohesion: 0.29
Nodes (7): 7.1 Empresas Estatales (Art. 19), 7.2 Sociedades Mercantiles (Art. 20), 7.3 Empresas Mixtas (Art. 21), 7.4 Contratos de Asociación Económica Internacional (Art. 22), 7.5 Empresas de Capital Totalmente Extranjero (Art. 23), 7.6 Personas Naturales (Art. 24), 7. DATOS ESPECÍFICOS POR TIPO DE SUJETO

### Community 66 - "10. CALIFICACIÓN Y RECURSOS"
Cohesion: 0.29
Nodes (7): 10.1 Calificación (Art. 59), 10.2 Plazo de calificación (Art. 61), 10.3 Resolución de calificación (Arts. 62-63), 10.4 Subsanación (Art. 64), 10.5 Recursos (Arts. 66-71), 10.6 Partes legitimadas para recurrir (Art. 67), 10. CALIFICACIÓN Y RECURSOS

### Community 67 - "8. EL REGISTRADOR MERCANTIL"
Cohesion: 0.29
Nodes (7): 8.1 Requisitos para ser Registrador (Art. 36), 8.2 Prohibiciones (Art. 37), 8.3 Causales de cese (Art. 39), 8.4 Funciones del Registrador (Art. 40), 8.5 Sustituto del Registrador (Art. 43), 8.6 Sustitución por más de 30 días (Art. 44), 8. EL REGISTRADOR MERCANTIL

### Community 68 - "check-auth.js"
Cohesion: 0.50
Nodes (4): bcrypt, main(), maskDatabaseUrl(), { PrismaClient }

### Community 69 - "cms-regulations.tsx"
Cohesion: 0.08
Nodes (24): framer-motion, deleteTutorial(), getNewsArticles(), CATEGORIES, EMPTY, FormData, CATEGORIES, EMPTY (+16 more)

### Community 70 - "🚀 Instalación y configuración"
Cohesion: 0.29
Nodes (7): 1) Clonar y preparar el entorno, 2) Variables de entorno, 3) Base de datos, 🚀 Instalación y configuración, Opción A: contenedor PostgreSQL del proyecto, Opción B: iniciar todo el stack, Requisitos

### Community 71 - "Convenciones del proyecto"
Cohesion: 0.33
Nodes (6): Base de datos, Componentes, Convenciones del proyecto, Estilos, Fetching en cliente, Sync CMS → Portal

### Community 72 - "4. PROCESO DE INSCRIPCIÓN"
Cohesion: 0.33
Nodes (6): 4.1 Requisitos de forma (Art. 7), 4.2 Plazos (Art. 6), 4.3 Efectos de la inscripción (Art. 8), 4.4 Modificaciones (Art. 12), 4.5 Cancelación (Art. 16), 4. PROCESO DE INSCRIPCIÓN

### Community 74 - "13. INSCRIPCIONES ESPECÍFICAS"
Cohesion: 0.33
Nodes (6): 13.1 Inscripción primera (Art. 115), 13.2 Licencias, permisos y autorizaciones (Art. 116), 13.3 Comparecientes (Arts. 117-119), 13.4 Subsanación de errores y omisiones (Arts. 120-130), 13.5 Cancelación registral (Arts. 131-134), 13. INSCRIPCIONES ESPECÍFICAS

### Community 75 - "15. FUSIÓN, ESCISIÓN, DISOLUCIÓN Y LIQUIDACIÓN"
Cohesion: 0.33
Nodes (6): 15.1 Fusión (Arts. 153-159), 15.2 Escisión (Arts. 160-163), 15.3 Disolución (Arts. 164-168), 15.4 Prórroga (Arts. 166-167), 15.5 Extinción (Arts. 170-171), 15. FUSIÓN, ESCISIÓN, DISOLUCIÓN Y LIQUIDACIÓN

### Community 76 - "🚀 Instalación y Configuración"
Cohesion: 0.33
Nodes (6): 1. Clonar el Repositorio, 2. Instalar Dependencias, 3. Configurar Variables de Entorno, 4. Configurar Base de Datos, 🚀 Instalación y Configuración, Prerrequisitos

### Community 77 - "🚀 Despliegue con Docker"
Cohesion: 0.33
Nodes (6): Configurar dominios públicos, Construir y levantar, Despliegue completo con dominio y migraciones, 🚀 Despliegue con Docker, Variables de ejemplo para producción, Verificar estado

### Community 78 - "run-migrations.js"
Cohesion: 0.53
Nodes (4): main(), runCommand(), seedDatabase(), { spawnSync }

### Community 79 - "Input"
Cohesion: 0.09
Nodes (37): sonner, SgrPage(), createBotConfig(), createWebinar(), deletePage(), getBotConfig(), testBotConnection(), updateBotConfig() (+29 more)

### Community 80 - "11. PUBLICIDAD E INFORMACIÓN REGISTRAL"
Cohesion: 0.40
Nodes (5): 11.1 Certificaciones (Arts. 74-84), 11.2 Legitimación para solicitar información (Arts. 82-83), 11.3 Exhibición de libros (Art. 85), 11.4 Boletín Oficial (Arts. 87-89), 11. PUBLICIDAD E INFORMACIÓN REGISTRAL

### Community 81 - "14. INSCRIPCIÓN DE SOCIEDADES MERCANTILES"
Cohesion: 0.40
Nodes (5): 14.1 Circunstancias a inscribir (Art. 139), 14.2 Contenido de la inscripción primera (Art. 140), 14.3 Aumento de capital (Art. 150), 14.4 Reducción de capital (Arts. 151-152), 14. INSCRIPCIÓN DE SOCIEDADES MERCANTILES

### Community 82 - "18. PERSONAS NATURALES EXTRANJERAS (Arts. 178-184)"
Cohesion: 0.40
Nodes (5): 18.1 Circunstancias a inscribir (Art. 178), 18.2 Contenido de la inscripción (Art. 179), 18.3 Forma de inscripción (Art. 180), 18.4 Personas casadas (Art. 182), 18. PERSONAS NATURALES EXTRANJERAS (Arts. 178-184)

### Community 83 - "20. CONTRATOS DE AGENCIA (Arts. 190-193)"
Cohesion: 0.40
Nodes (5): 20.1 Circunstancias a inscribir (Art. 190), 20.2 Vigencia (Art. 191), 20.3 Obligaciones de información (Art. 192), 20.4 Cancelación o suspensión (Art. 193), 20. CONTRATOS DE AGENCIA (Arts. 190-193)

### Community 84 - "29. REQUISITOS TÉCNICOS PARA EL PORTAL (DERIVADOS DE ESTA RESOLUCIÓN)"
Cohesion: 0.40
Nodes (5): 29.1 Gestión de plazos, 29.2 Módulos funcionales requeridos, 29.3 Integraciones externas requeridas, 29.4 Estructura de datos para asientos, 29. REQUISITOS TÉCNICOS PARA EL PORTAL (DERIVADOS DE ESTA RESOLUCIÓN)

### Community 85 - "7. ORGANIZACIÓN DEL REGISTRO MERCANTIL"
Cohesion: 0.40
Nodes (5): 7.1 Registro Mercantil Central (Arts. 25-27), 7.2 Registros Mercantiles Territoriales (Arts. 32-33), 7.3 Jurisdicción y competencia (Art. 31), 7.4 Auxilio de las Direcciones Provinciales de Justicia (Art. 34), 7. ORGANIZACIÓN DEL REGISTRO MERCANTIL

### Community 87 - "🔐 Seguridad en Autenticación CMS"
Cohesion: 0.40
Nodes (5): Configuración de Email (SMTP), Flujo de Login CMS, Recuperación de Contraseña, Recuperación de Contraseña, 🔐 Seguridad en Autenticación CMS

### Community 88 - "🐛 Problemas comunes"
Cohesion: 0.40
Nodes (5): Error: build falla por Node o .next, Error: el contenedor no arranca, Error: login falla incluso con credenciales correctas, 🐛 Problemas comunes, Puerto ocupado

### Community 89 - "portal-functional-tests.mjs"
Cohesion: 0.50
Nodes (3): fetchJSON(), getCaptcha(), results

### Community 90 - "menubar.tsx"
Cohesion: 0.12
Nodes (13): @radix-ui/react-menubar, Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarPortal(), MenubarRadioItem() (+5 more)

### Community 91 - "deploy.sh"
Cohesion: 0.70
Nodes (4): error(), info(), deploy.sh script, warn()

### Community 92 - "pagination.tsx"
Cohesion: 0.28
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 93 - "cms-procedures.tsx"
Cohesion: 0.29
Nodes (11): createProcedure(), deleteProcedure(), deleteProcedureDocument(), getProcedureDocuments(), getProcedures(), updateProcedure(), uploadProcedureDocument(), CmsProcedures() (+3 more)

### Community 94 - "chat-knowledge.ts"
Cohesion: 0.32
Nodes (10): POST(), GET(), buildKnowledgeIndex(), buildKnowledgeResponse(), forceRebuildIndex(), KnowledgeEntry, normalizeText(), searchKnowledge() (+2 more)

### Community 95 - "10. INTERACCIÓN CON TERCEROS"
Cohesion: 0.50
Nodes (4): 10.1 Notarios (Art. 10), 10.2 Organismos de la Administración Central del Estado (Disposiciones Especiales 2 y 3), 10.3 Contribuyentes (Art. 13), 10. INTERACCIÓN CON TERCEROS

### Community 96 - "11. SANCIONES (Art. 27)"
Cohesion: 0.50
Nodes (4): 11.1 Recargos, 11.2 Suspensión, 11.3 Funcionalidad en el portal, 11. SANCIONES (Art. 27)

### Community 97 - "2. SUJETOS Y ACTOS INSCRIBIBLES (Art. 2)"
Cohesion: 0.50
Nodes (4): 2.1 Sujetos obligados a inscribirse, 2.2 Depósito de informes financieros (Art. 2.2), 2.3 Facultad de verificación (Art. 2.3), 2. SUJETOS Y ACTOS INSCRIBIBLES (Art. 2)

### Community 98 - "6. INFORMACIÓN REGISTRAL Y PUBLICIDAD"
Cohesion: 0.50
Nodes (4): 6.1 Publicidad (Art. 17), 6.2 Boletín Oficial (Art. 18), 6.3 Certificación (Art. 14), 6. INFORMACIÓN REGISTRAL Y PUBLICIDAD

### Community 99 - "9. IMPUESTOS ASOCIADOS (Art. 13)"
Cohesion: 0.50
Nodes (4): 9.1 Requisitos fiscales, 9.2 Excepción (Art. 13.2), 9.3 Impuestos aplicables por tipo de acto, 9. IMPUESTOS ASOCIADOS (Art. 13)

### Community 100 - "24. CONTROL Y SUPERVISIÓN (Arts. 210-211)"
Cohesion: 0.50
Nodes (4): 24.1 Control metodológico, 24.2 Memoria estadística, 24.3 Información a otras entidades (Disposición Segunda), 24. CONTROL Y SUPERVISIÓN (Arts. 210-211)

### Community 101 - "3. SISTEMA DEL REGISTRO MERCANTIL"
Cohesion: 0.50
Nodes (4): 3.1 Integración del Sistema (Art. 1), 3.2 Objetos del Registro Mercantil (Art. 2), 3.3 Publicidad del Registro (Art. 3), 3. SISTEMA DEL REGISTRO MERCANTIL

### Community 103 - "💾 Backups y restauración de la base de datos"
Cohesion: 0.50
Nodes (4): 💾 Backups y restauración de la base de datos, Copia de seguridad manual, Restauración, Scripts automatizados

### Community 104 - "🚀 Características Principales"
Cohesion: 0.50
Nodes (4): 🚀 Características Principales, 🔍 Funcionalidades Avanzadas, 🔧 Panel de Administración (CMS), 📊 Portal Público

### Community 105 - "📜 Logs"
Cohesion: 0.50
Nodes (4): Diagnóstico rápido de autenticación, 📜 Logs, Logs de Docker, Logs del proyecto

### Community 106 - "backup-db.sh"
Cohesion: 0.83
Nodes (3): log(), backup-db.sh script, usage()

### Community 107 - "prepare-preprod-env.sh"
Cohesion: 0.83
Nodes (3): ask(), info(), prepare-preprod-env.sh script

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

### Community 121 - "captcha-v2.ts"
Cohesion: 0.13
Nodes (17): CaptchaEntry, generateCaptcha(), randInt(), store, svgText(), sweepCaptcha(), CaptchaEntry, CaptchaResult (+9 more)

### Community 124 - "JsonFieldEditor.tsx"
Cohesion: 0.43
Nodes (7): JsonFieldEditor(), JsonFieldEditorProps, jsonToKVs(), KVPair, kvsToJson(), uid(), validateJson()

### Community 125 - "Plan de actualización normativa del Portal"
Cohesion: 0.33
Nodes (5): Criterio de actualización futura, Fuentes incorporadas, Implementación, Operación, Plan de actualización normativa del Portal

### Community 127 - "input-otp.tsx"
Cohesion: 0.33
Nodes (4): input-otp, InputOTP(), InputOTPGroup(), InputOTPSlot()

## Knowledge Gaps
- **23 isolated node(s):** `@hookform/resolvers`, `@reactuses/core`, `@tanstack/react-query`, `@tanstack/react-table`, `@types/nodemailer` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 984 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `handleCMSPut`, `checkOrigin`, `cms-handler.ts`, `app/page.tsx`, `PortalHeader.tsx`, `package.json`, `CardHeader`, `upload/route.ts`, `use-toast.ts`, `forgot-password/route.ts`, `ConsultasSection.tsx`, `Input`, `HomeSection.tsx`, `middleware.ts`, `cms-enzona-config.tsx`, `react`, `chat-knowledge.ts`?**
  _High betweenness centrality (0.280) - this node is a cross-community bridge._
- **What connects `@hookform/resolvers`, `@reactuses/core`, `@tanstack/react-query` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `handleCMSPut` be split into smaller, more focused modules?**
  _Cohesion score 0.07175141242937853 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `cms-faq.tsx`, `PremiumFeaturesExample.tsx`, `sidebar.tsx`, `package.json`, `CardHeader`, `toggle-group.tsx`, `use-toast.ts`, `ConsultasSection.tsx`, `FAQAccordion.tsx`, `utils.ts`, `popover.tsx`, `cms-enzona-config.tsx`, `Button`, `cms-api.ts`, `resizable.tsx`, `carousel.tsx`, `app/page.tsx`, `form.tsx`, `PortalHeader.tsx`, `GuideStepsEditor.tsx`, `drawer.tsx`, `context-menu.tsx`, `navigation-menu.tsx`, `chart.tsx`, `HomeSection.tsx`, `sections/index.ts`, `cms-regulations.tsx`, `Input`, `menubar.tsx`, `pagination.tsx`, `cms-procedures.tsx`, `JsonFieldEditor.tsx`, `input-otp.tsx`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Should `checkOrigin` be split into smaller, more focused modules?**
  _Cohesion score 0.05088265835929388 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `sidebar.tsx` to `cms-faq.tsx`, `CardHeader`, `toggle-group.tsx`, `use-toast.ts`, `ConsultasSection.tsx`, `FAQAccordion.tsx`, `utils.ts`, `popover.tsx`, `react`, `cms-enzona-config.tsx`, `Button`, `resizable.tsx`, `carousel.tsx`, `form.tsx`, `PortalHeader.tsx`, `GuideStepsEditor.tsx`, `drawer.tsx`, `context-menu.tsx`, `navigation-menu.tsx`, `chart.tsx`, `HomeSection.tsx`, `sections/index.ts`, `cms-regulations.tsx`, `Input`, `menubar.tsx`, `pagination.tsx`, `JsonFieldEditor.tsx`, `input-otp.tsx`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.027777777777777776 - nodes in this community are weakly interconnected._