# Plan Maestro de Tareas - Portal Registro Mercantil

## Estado: EN PROGRESO

---

### GRUPO A: Fixes Críticos de Funcionalidad (Esta Semana)

#### A1. ObfuscatedContact - Clipboard, tel:, mailto:
- **Archivo**: `src/components/portal/layout/ObfuscatedContact.tsx`
- **Problemas**:
  - Copiar al clipboard no funciona
  - Teléfono: click → debe abrir `tel:`
  - Email: click → copiar + abrir `mailto:` con subject/body prellenados
- **Estado**: ⬜ Pendiente

#### A2. Captcha Búsqueda - Layout y UX
- **Archivo**: `src/components/portal/sections/ConsultasSection.tsx`
- **Problemas**:
  - Campo captcha al lado del input → debe ir **debajo**
  - Botón buscar se activa mientras se escribe captcha → deshabilitar hasta completar
  - Captcha no distingue mayúsculas/minúsculas → agregar complejidad
  - Desde home, búsqueda no debe ejecutar, solo navegar a consultas con query
- **Estado**: ⬜ Pendiente

#### A3. Navegación Persistente (localStorage)
- **Archivo**: `src/app/page.tsx`
- **Requisito**: Mantener sección activa + scroll position tras reload
- **Estado**: ⬜ Pendiente

#### A4. Calculadora Costos - Estado Inicial
- **Archivo**: `src/components/portal/sections/normatividad/TaxCalculator.tsx`
- **Requisito**: Inicialmente vacía, sin desglose hasta seleccionar trámite
- **Error 500** al seleccionar trámite → investigar y fix
- **Estado**: ⬜ Pendiente

#### A5. Footer - QR Code + Share + Contact Links
- **Archivo**: `src/components/portal/layout/PortalFooter.tsx`
- **Requisitos**:
  - QR code del portal (URL actual desde meta tags)
  - Share: Web Share API → clipboard fallback con SEO/OpenGraph de la página actual
  - Contacto email: link `mailto:` directo
  - Teléfonos/emails: ofuscados + opciones móviles (tel:, mailto:)
- **Estado**: ⬜ Pendiente

---

### GRUPO B: Seguridad - Hallazgos OWASP (Validar y Completar)

#### B1. Rutas CMS: requireAuth() → requireAdmin()
- **Hallazgo**: 12 archivos usan `requireAuth()` en vez de `requireAdmin()`
- **Archivos a auditar**:
  - `src/app/api/cms/*/route.ts`
  - `src/lib/cms-handler.ts` (revisar uso interno)
- **Estado**: ⬜ Pendiente

#### B2. GET /api/cms/portal-users - passwordHash
- **Hallazgo**: Exposición de passwordHash
- **Fix**: `requireAdmin()` + `select:{passwordHash:false}` (omit en Prisma)
- **Estado**: ⬜ Pendiente

#### B3. /api/chat/send - Prompt Injection + DoS + Rate Limit
- **Hallazgo**: Sin filtrado messages, sin rate limit, sin CAPTCHA/Guardian
- **Fixes**:
  - Filtrar solo `role:user` de messages
  - Rate limit IP (5 req/min)
  - Integrar CAPTCHA + Guardian
- **Estado**: ⬜ Pendiente

#### B4. /api/bot-config - requireAdmin()
- **Estado**: ⬜ Pendiente (verificar si ya está)

#### B5. HomeSection.tsx:993 - ReactMarkdown XSS
- **Hallazgo**: Sin sanitizar
- **Fix**: `rehypePlugins={[rehypeSanitize]}` + `npm i rehype-sanitize`
- **Estado**: ⬜ Pendiente

#### B6. Validaciones Pendientes
- Rate limit IP spoofing (Traefik/Caddy X-Forwarded-For)
- HSTS preload en todos PORTAL_DOMAINS
- Node ≥24.15 para isomorphic-dompurify@4.6.0
- **Estado**: ⬜ Pendiente

---

### GRUPO C: CMS - Formularios y Validación

#### C1. Crear Usuario - Dropdown Roles
- **Archivo**: `src/components/cms/cms-portal-users.tsx`
- **Problema**: No carga lista de roles desde `/api/cms/user-roles`
- **Estado**: ⬜ Pendiente

#### C2. Validación Frontend Per-Field (onBlur)
- **Requisito**: Todos los formularios CMS
- **Patrón**: Al perder foco → validar ese campo → mensaje debajo
- **Backend**: Validación Zod existente en `cms-schemas.ts` + `cms-handler.ts`
- **Archivos**: `cms-portal-users.tsx`, `cms-services.tsx`, `cms-news.tsx`, `cms-procedures.tsx`, `cms-regulations.tsx`, `cms-faqs.tsx`, `cms-guides.tsx`, `cms-webinars.tsx`, `cms-tutorials.tsx`, `cms-site-pages.tsx`, `cms-blocks.tsx`, `cms-sliders.tsx`, `cms-statistics.tsx`, `cms-user-roles.tsx`, `cms-bot-config.tsx`
- **Estado**: ⬜ Pendiente

---

### GRUPO D: Accesibilidad WCAG 2.1 AA + Theme Switching

#### D1. Contraste Global - Textos sobre Fondos Oscuros
- **Problema**: "¿Por qué elegir nuestro portal?" - texto descriptivo sin contraste
- **Otros**: `text-white/70`, `text-muted-foreground` sobre fondos claros/oscuros
- **Fix**: Ratio ≥4.5:1 - subir a `text-white/90` o colores MINJUS
- **Estado**: ⬜ Pendiente

#### D2. Theme Switcher - Verificar Contraste en Todos Temas
- **Archivo**: `src/components/portal/layout/ThemeSwitcher.tsx`, `src/lib/themes.ts`
- **Requisito**: WCAG AA en todos los 10 temas predefinidos
- **Estado**: ⬜ Pendiente

#### D3. Accesibilidad Técnica (Auditoría WCAG)
- **Pendientes del reporte previo**:
  - `aria-label` en botones solo-icono (PortalHeader.tsx, sliders, acordeones, cards clickeables)
  - `aria-label` en progress bars (charts)
  - Jerarquía headings secuencial h1→h2→h3
  - Targets táctiles ≥44px (`min-w-[44px] min-h-[44px]`)
- **Estado**: ⬜ Pendiente

#### D4. Web Speech API - Text-to-Speech
- **Requisito**: Botón "Leer página" / locutor navegador
- **Implementación**: SpeechSynthesis API client-side
- **Estado**: ⬜ Pendiente

#### D5. Acciones WCAG: Tamaño fuente, contraste daltónicos
- **Requisito**: Controles UI para aumentar fuente, modo alto contraste, daltónicos
- **Estado**: ⬜ Pendiente

---

### GRUPO E: Chatbot - Knowledge Base Refresh

#### E1. Actualización Automática Base Conocimiento
- **Estado actual**: Lee de BD en cada request (ya implementado)
- **Verificar**: `/api/chat/send` consulta BD fresca cada vez
- **Estado**: ⬜ Verificar

---

### GRUPO F: Contenido Legal (Redacción)

#### F1. Páginas Estáticas CMS-Driven
- Aviso Legal
- Política de Privacidad
- Accesibilidad
- Mapa del Sitio
- Sugerencias
- **Implementación**: Como páginas CMS (`site-pages`) o bloques estáticos
- **Estado**: ⬜ Pendiente

---

### GRUPO G: QA Testing Visual + Integraciones

#### G1. Documentar Casos de Prueba WCAG
- **Archivos**: `docs/wcag-audit-report.md`, `tests/wcag-results.json`
- **Commitear** archivos untracked
- **Estado**: ⬜ Pendiente

#### G2. Testing Visual Completo (Todas las secciones)
- Home, Consultas, Trámites, Normatividad, Estadísticas, Asistencia, Acceso
- Screenshots + Console errors + WCAG score
- **Estado**: ⬜ Pendiente

#### G3. Desacoplamiento API/UI - Issue Conocido
- Documentar en reporte
- **Estado**: ⬜ Pendiente

#### G4. Integración GitLab ↔ Readmine (Fuera de alcance inmediato)
- Montar Readmine local
- Casos de prueba sincronización
- **Estado**: ⏸️ Post-MVP

---

### GRUPO H: Features Adicionales

#### H1. Referencias Legales → Chatbot
- Click en ley/resolución → abre chatbot con búsqueda automática
- **Estado**: ⬜ Pendiente

#### H2. Canales de Contacto - Tel/Email con Obfuscation
- **Archivo**: `src/components/portal/sections/AsistenciaSection.tsx`
- **Estado**: ⬜ Pendiente

#### H3. "Notas Simple" Overlap Calculator
- **Problema**: Se sobrepone a calculadora
- **Fix**: Más margen
- **Estado**: ⬜ Pendiente

---

## Orden de Ejecución Sugerido

1. **A1, A2, A3, A4, A5** - Funcionalidad core (paralelo)
2. **B1-B6** - Seguridad (paralelo, validar fixes existentes)
3. **C1, C2** - CMS Forms
4. **D1-D5** - Accesibilidad (D1, D2 primero - base para todo)
5. **E1** - Verificar chatbot
6. **F1** - Contenido legal
6. **G1, G2, G3** - QA Documentar
7. **H1, H2, H3** - Features extra

---

## Commits por Grupo (Regla: 1 commit por grupo lógico)

```
chore(security): fix CMS routes requireAdmin + portal-users passwordHash
fix(chat): rate limit + captcha + guardian + message filtering
fix(obfuscated-contact): clipboard + tel + mailto with subject/body
fix(captcha-search): vertical layout + disable search until complete + case sensitivity
fix(nav-persist): localStorage active section + scroll position
fix(tax-calculator): empty initial state + fix 500 on select
fix(footer): QR code + share API + mailto/tel links
fix(cms-users): roles dropdown + per-field validation
fix(contrast): WCAG AA text contrast dark backgrounds + theme switcher
fix(a11y): aria-labels, heading hierarchy, touch targets
feat(tts): Web Speech API read page
docs(legal): Aviso Legal, Privacidad, Accesibilidad, Mapa, Sugerencias
docs(qa): WCAG audit results + visual testing evidence
```

---

## Notas de Riesgo

- ⚠️ **Contenedor**: Actualmente healthy pero monitorear "Cargando portal..." spinner
- ⚠️ **Node version**: 24.14.1 vs 24.15 requerido para isomorphic-dompurify@4.6.0
- ⚠️ **Build errors**: Verificar que no rompan `next build` tras cada cambio
- ⚠️ **Testing visual**: Requiere ventana desktop visible para screenshots

---

## Agentes Despachados

| Agente | Tarea | Estado |
|--------|-------|--------|
| - | - | - |