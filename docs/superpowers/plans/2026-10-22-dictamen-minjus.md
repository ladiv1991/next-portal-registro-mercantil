# Dictamen MINJUS — Actualización Integral del Portal RM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar todos los requerimientos del dictamen MINJUS al portal: paleta oficial, ventanillas extranjeras (VUINEX/ZED Mariel/VUCE), eliminación de Oficina de Representación, corrección de datos normativos, limpieza de código muerto, banner de nuevas normas DL 133/120, y actualización de documentación institucional.

**Architecture:** Cambios quirúrgicos en componentes UI existentes y archivo de datos estáticos. Sin nuevos modelos de BD, sin refactoring de arquitectura. Los colores legacy se reemplazan por variables CSS MINJUS definidas en globals.css. Los datos muertos se eliminan. Las ventanillas extranjeras se agregan como bloques inline en el componente existente.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, React 19, TypeScript, Prisma/PostgreSQL.

**Spec:** docs/spec-dictamen-minjus.md (aprobada por el usuario en sesión 2026-10-22)

## Global Constraints

- Paleta MINJUS obligatoria: `#005A9C` (primary), `#0074C8` (primary-light), `#FFFFFF` (bg), `#F2F4F7` (surface), `#6B7280` (muted), `#1F2937` (text).
- No usar colores legacy (`#1A1A1A`, `#9E3A2E`, `#7A2A1E`, `#EDE0D4`, `#D6C9BA`, `#6B5E50`) en ningún componente portal tras el cambio.
- Logo: 180px × 40px. Slider portada: 2500px × 540px apaisadas.
- "Oficina de Representación" eliminado completamente como tipo de sujeto inscribible.
- Contratos de Agencia NO son inversión extranjera; son sujetos inscribibles según Res. 230/2002 Art. 6 y 20(h).
- VUCE URL correcta: `https://home.vucecuba.mincex.gob.cu/`
- VUINEX: Infanta #16 e/ 23 y Humboldt, Plaza Revolución, La Habana 10400, tel (07) 8331719, inversionextranjera@mincex.gob.cu, https://vuinex.mincex.gob.cu/
- ZED Mariel: https://www.zedmariel.com/sistema-de-ventanilla-unica, ventanillaunica@zedmariel.co.cu
- DL 133/2026 modifica DL 88 (MIPYMES), DL 89 (CNA), DL 90 (TCP). Gaceta Oficial No. 71 Ordinaria de 2026.
- DL 120/2026: pendiente de texto oficial, marcar como placeholder.
- Tarifas exactas según Resolución 51/2021 (FeeSchedule.tsx ya las tiene correctas, no tocar).
- Todo dato normativo debe citar fuente legal (artículo, decreto o resolución).
- WCAG 2.1 AA obligatorio para contraste.

## Review Focus

- Un componente CMS podría importar `FEE_SCHEDULE` o `QUICK_ACCESS_CARDS` dinámicamente vía string key; verificar que el build no rompe tras eliminarlos.
- HomeSection.tsx tiene ~30 ocurrencias de colores legacy en inline styles y JSX; cada una debe mapearse a la variable MINJUS correcta sin perder contraste.
- ProcedureCard.tsx tiene su propio PROCEDURES hardcodeado (no usa el de portal-data); ambos deben quedar consistentes tras el cambio.
- NormatividadSection.tsx carga regulaciones de `/api/public/content`; el banner de DL 133/120 debe mostrarse independientemente de si la API responde o no.
- ForeignInvestment.tsx usa clases `blue-*` de Tailwind que no coinciden con paleta legacy ni MINJUS; mapear directamente a MINJUS.

---

### Task 1: Variables CSS MINJUS en globals.css

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: Variables CSS `--rm-primary`, `--rm-primary-light`, `--rm-bg`, `--rm-surface`, `--rm-muted`, `--rm-text` consumidas por todas las tareas siguientes.

- [ ] **Step 1: Leer globals.css actual para encontrar ubicación de inserción**

Buscar el bloque `:root { ... }` o el inicio del archivo donde se definen variables CSS existentes. Insertar las nuevas variables MINJUS dentro del bloque `:root`.

- [ ] **Step 2: Agregar variables CSS MINJUS al bloque :root**

Insertar dentro de `:root`:
```css
--rm-primary: #005A9C;
--rm-primary-light: #0074C8;
--rm-bg: #FFFFFF;
--rm-surface: #F2F4F7;
--rm-muted: #6B7280;
--rm-text: #1F2937;
```

No eliminar ninguna variable existente. Solo agregar.

- [ ] **Step 3: Adaptar clases custom existentes a MINJUS**

Buscar las definiciones de `.glass-card`, `.multicolor-stripe`, `.gradient-text-primary` en el mismo archivo. Si usan colores legacy hardcodeados, reemplazarlos por las nuevas variables CSS. Si usan valores que no colisionan, dejarlos intactos.

- [ ] **Step 4: Verificar que el CSS compila sin errores**

Run: `npx tailwindcss --input src/app/globals.css --output /dev/null` o simplemente `bun run build` (si Docker está levantado).
Expected: Sin errores de parseo CSS.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add MINJUS design tokens as CSS variables"
```

---

### Task 2: Paleta MINJUS en componentes portal

**Files:**
- Modify: `src/components/portal/sections/normatividad/FeeSchedule.tsx`
- Modify: `src/components/portal/sections/tramites/ProcedureCard.tsx`
- Modify: `src/components/portal/sections/tramites/ForeignInvestment.tsx`
- Modify: `src/components/portal/sections/normatividad/LegalFramework.tsx`
- Modify: `src/components/portal/sections/NormatividadSection.tsx`
- Modify: `src/components/portal/sections/HomeSection.tsx`

**Interfaces:**
- Consumes: Variables CSS de Task 1 (`var(--rm-primary)`, etc.)
- Produces: Componentes libres de colores legacy.

- [ ] **Step 1: Reemplazar colores legacy en FeeSchedule.tsx**

Grep por `#1A1A1A`, `#9E3A2E`, `#7A2A1E`, `#EDE0D4` en el archivo. Reemplazar:
- `text-[#1A1A1A]` → `text-[var(--rm-text)]`
- `bg-[#1A1A1A]/5` → `bg-[var(--rm-text)]/5`
- `hover:bg-[#1A1A1A]/3` → `hover:bg-[var(--rm-text)]/3`
- Cualquier `#9E3A2E` → `var(--rm-primary)`
- Cualquier `border-[#EDE0D4]` → `border-[var(--rm-surface)]`

- [ ] **Step 2: Reemplazar colores legacy en ProcedureCard.tsx**

El archivo tiene PROCEDURES hardcodeado con `color: 'text-[#9E3A2E]'` y `bgColor: 'bg-[#7A2A1E]/10'` en cada ítem, además de `text-[#1A1A1A]` en línea 41-42. Reemplazar todos:
- `'text-[#9E3A2E]'` → `'text-[var(--rm-primary)]'`
- `'bg-[#7A2A1E]/10'` → `'bg-[var(--rm-primary)]/10'`
- `'text-[#1A1A1A]'` → `'text-[var(--rm-text)]'`
- `'bg-[#1A1A1A]/10'` → `'bg-[var(--rm-text)]/10'`

- [ ] **Step 3: Reemplazar colores legacy en ForeignInvestment.tsx**

El archivo usa clases Tailwind `blue-*` (`bg-blue-50`, `border-blue-200`, `bg-blue-100`, `text-blue-600`, `text-blue-900`). Reemplazar:
- `bg-blue-50` → `bg-[var(--rm-surface)]`
- `border-blue-200` → `border-[var(--rm-primary-light)]/30`
- `bg-blue-100` → `bg-[var(--rm-primary)]/10`
- `text-blue-600` → `text-[var(--rm-primary-light)]`
- `text-blue-900` → `text-[var(--rm-primary)]`

- [ ] **Step 4: Reemplazar colores legacy en LegalFramework.tsx**

Líneas con `text-[#9E3A2E]` (44, 59), `text-[#1A1A1A]` (45, 52, 61), `border-[#D6C9BA]` (58), `hover:border-[#9E3A2E]` (58). Reemplazar:
- `text-[#9E3A2E]` → `text-[var(--rm-primary)]`
- `text-[#1A1A1A]` → `text-[var(--rm-text)]`
- `border-[#D6C9BA]` → `border-[var(--rm-muted)]/30`
- `hover:border-[#9E3A2E]` → `hover:border-[var(--rm-primary)]`

- [ ] **Step 5: Reemplazar colores legacy en NormatividadSection.tsx**

Líneas 55, 78: `bg-[#1A1A1A]` → `bg-[var(--rm-text)]`. Línea 80: `bg-[#9E3A2E]/20 text-[#9E3A2E] border-[#9E3A2E]/30` → `bg-[var(--rm-primary)]/20 text-[var(--rm-primary)] border-[var(--rm-primary)]/30`.

- [ ] **Step 6: Reemplazar colores legacy en HomeSection.tsx**

Grep global por `#1A1A1A`, `#9E3A2E`, `#7A2A1E`, `#EDE0D4`, `#6B5E50` en este archivo. Hay ~30 ocurrencias en inline styles y clases. Mapeo:
- `text-[#1A1A1A]` → `text-[var(--rm-text)]`
- `text-[#9E3A2E]` → `text-[var(--rm-primary)]`
- `bg-[#9E3A2E]` → `bg-[var(--rm-primary)]`
- `bg-[#7A2A1E]` → `bg-[var(--rm-primary)]`
- `border-[#EDE0D4]` → `border-[var(--rm-surface)]`
- `text-[#6B5E50]` → `text-[var(--rm-muted)]`
- `bg-[#1A1A1A]` → `bg-[var(--rm-text)]`

Aplicar con `replaceAll: true` donde sea seguro (cada patrón es único en significado).

- [ ] **Step 7: Grep global de verificación**

Run: grep por `#1A1A1A|#9E3A2E|#7A2A1E|#EDE0D4|#D6C9BA|#6B5E50` en `src/components/portal/`.
Expected: 0 matches. Si quedan coincidencias en archivos no listados, reemplazarlas con el mismo mapeo.

- [ ] **Step 8: Commit**

```bash
git add src/components/portal/
git commit -m "style: replace legacy palette with MINJUS CSS variables across portal"
```

---

### Task 3: VUINEX + ZED Mariel + Corrección VUCE en ForeignInvestment.tsx

**Files:**
- Modify: `src/components/portal/sections/tramites/ForeignInvestment.tsx`

**Interfaces:**
- Consumes: Variables CSS de Task 1.
- Produces: Componente con tres bloques de ventanillas (VUCE, VUINEX, ZED Mariel).

- [ ] **Step 1: Corregir URL de VUCE**

Reemplazar `https://www.vuce.cu` por `https://home.vucecuba.mincex.gob.cu/` en el href del enlace VUCE.

- [ ] **Step 2: Agregar bloque VUINEX después del bloque VUCE**

Insertar un nuevo `<div>` con la misma estructura visual del bloque VUCE existente (glass-card o bg-surface con borde), con estos datos exactos:
- Título: "Ventanilla Única de Inversión Extranjera (VUINEX)"
- Icono: `Globe2` (reusar import existente)
- Dirección: "Infanta #16 e/ 23 y Humboldt, Plaza de la Revolución, La Habana 10400"
- Teléfono: "(07) 8331719"
- Email: "inversionextranjera@mincex.gob.cu"
- URL: "https://vuinex.mincex.gob.cu/"
- Nota: "El Registro Mercantil Central inscribe las empresas mixtas, sociedades de capital totalmente extranjero y contratos AEI aprobados a través de VUINEX."

- [ ] **Step 3: Agregar bloque ZED Mariel después de VUINEX**

Misma estructura visual:
- Título: "Zona Especial de Desarrollo Mariel (ZED Mariel)"
- Icono: `Globe2` o `Building2`
- URL: "https://www.zedmariel.com/sistema-de-ventanilla-unica"
- Email: "ventanillaunica@zedmariel.co.cu"
- Nota breve: "Ventanilla única para trámites de inversión en la Zona Especial de Desarrollo Mariel."

- [ ] **Step 4: Commit**

```bash
git add src/components/portal/sections/tramites/ForeignInvestment.tsx
git commit -m "feat: add VUINEX and ZED Mariel, fix VUCE URL in ForeignInvestment"
```

---

### Task 4: Eliminar "Oficina de Representación" y corregir ProcedureCard.tsx

**Files:**
- Modify: `src/components/portal/sections/tramites/ProcedureCard.tsx`

**Interfaces:**
- Consumes: Variables CSS de Task 1 (ya aplicadas en Task 2).
- Produces: PROCEDURES sin referencia a Oficinas de Representación ni Contratos de Agencia como inversión extranjera.

- [ ] **Step 1: Corregir ítem "Inversión Extranjera" en PROCEDURES**

En el array PROCEDURES (líneas 8-52 del archivo actual), buscar el ítem con `title: 'Inversión Extranjera (VUCE)'` o similar. Cambiar:
- `title`: `'Inversión Extranjera'`
- `description`: `'Trámites para empresas mixtas, sociedades de capital totalmente extranjero y contratos AEI'` (eliminar cualquier mención a "Oficinas de Representación", "Sucursales", "Contratos de Agencia")
- `cost`: `'1,200 CUP primera inscripción'` (coincide con Res. 51/2021 Partida IV)

Nota: Los Contratos de Agencia existen como sujetos inscribibles según Res. 230/2002 Art. 20(h), pero NO son inversión extranjera. No se mencionan en este card.

- [ ] **Step 2: Commit**

```bash
git add src/components/portal/sections/tramites/ProcedureCard.tsx
git commit -m "fix: remove Oficina de Representación from ProcedureCard, correct investment description"
```

---

### Task 5: Limpiar portal-data.ts — Código muerto + VUCE fix + LEGAL_FRAMEWORK

**Files:**
- Modify: `src/data/portal-data.ts`
- Modify: `src/data/index.ts`

**Interfaces:**
- Consumes: Datos de DL 133/2026 proporcionados por el usuario.
- Produces: portal-data.ts sin FEE_SCHEDULE, sin QUICK_ACCESS_CARDS, sin referencias a Oficina de Representación, sin doble "(VUCE)", con DL 133/120 en LEGAL_FRAMEWORK.

- [ ] **Step 1: Eliminar FEE_SCHEDULE de portal-data.ts**

Borrar el export completo de `FEE_SCHEDULE` (desde `export const FEE_SCHEDULE = [` hasta su cierre `];`). Valores inventados, no consumidos por ningún componente.

- [ ] **Step 2: Eliminar QUICK_ACCESS_CARDS de portal-data.ts**

Borrar el export completo de `QUICK_ACCESS_CARDS` (desde `export const QUICK_ACCESS_CARDS = [` hasta su cierre `];`). No consumido por ningún componente.

- [ ] **Step 3: Limpiar FEE_SCHEDULE y QUICK_ACCESS_CARDS de src/data/index.ts**

Eliminar las líneas `QUICK_ACCESS_CARDS,` y `FEE_SCHEDULE,` del barrel export.

- [ ] **Step 4: Limpiar imports muertos en HomeSection.tsx**

En `src/components/portal/sections/HomeSection.tsx`, quitar `QUICK_ACCESS_CARDS` y `FEE_SCHEDULE` del import de `@/data`. Si la línea de import queda vacía de esos dos pero sigue teniendo otros, solo remover esos dos nombres.

- [ ] **Step 5: Corregir PROCEDURES en portal-data.ts**

Buscar el ítem de "Inversión Extranjera" en el array PROCEDURES:
- Quitar doble "(VUCE)" del título.
- Eliminar "Oficinas de Representación" y "Contratos de Agencia" de la descripción.
- Corregir costo si no coincide con Res. 51/2021.

- [ ] **Step 6: Corregir LEGAL_FRAMEWORK en portal-data.ts**

- Quitar doble "(VUCE)" de "Ley No. 118/2013".
- Agregar dos nuevos ítems al array de categoría "Decretos Ley" (o crear la categoría si no existe):
  - `'Decreto-Ley No. 133/2026 — Modifica DL 88 (MIPYMES), DL 89 (CNA) y DL 90 (TCP). Gaceta Oficial No. 71 Ordinaria de 2026.'`
  - `'Decreto-Ley No. 120/2026 — Pendiente de publicación completa.'` (placeholder hasta tener texto oficial)

- [ ] **Step 7: Corregir GUIDES en portal-data.ts**

Quitar doble "(VUCE)" del título de la guía de inversión extranjera.

- [ ] **Step 8: Corregir VUCE_INFO en portal-data.ts**

Cambiar `url: "https://www.vuce.cu"` por `url: "https://home.vucecuba.mincex.gob.cu/"`.

- [ ] **Step 9: Commit**

```bash
git add src/data/portal-data.ts src/data/index.ts src/components/portal/sections/HomeSection.tsx
git commit -m "chore: remove dead code (FEE_SCHEDULE, QUICK_ACCESS_CARDS), fix VUCE URLs, add DL 133/120 to LEGAL_FRAMEWORK"
```

---

### Task 6: Banner prominente de nuevas normas DL 133/120

**Files:**
- Modify: `src/components/portal/sections/NormatividadSection.tsx`

**Interfaces:**
- Consumes: Variables CSS de Task 1.
- Produces: Banner visible entre el header y el LegalFramework.

- [ ] **Step 1: Insertar banner de nuevas normas en NormatividadSection.tsx**

Entre el cierre del `</section>` del header (línea 89) y el inicio del `<div className="max-w-7xl...">` (línea 91), insertar un bloque prominente. Debe ser más visible que un simple alert: fondo `bg-[var(--rm-primary)]`, texto blanco, padding generoso, icono de `Scale` o `AlertCircle` de lucide-react.

Contenido exacto:
```
Título: "Nuevas Normativas 2026"
Texto: "El Decreto-Ley No. 133/2026 actualiza la regulación de MIPYMES (DL 88), cooperativas no agropecuarias (DL 89) y trabajo por cuenta propia (DL 90), publicado en Gaceta Oficial No. 71 Ordinaria de 2026. Consulte los cambios en los procedimientos de creación, fusión, escisión y extinción."
Fuente: "Fuente: Decreto-Ley No. 133/2026 del Consejo de Estado."
```

No crear un componente separado. Insertar el JSX directamente. Usar `motion.div` con `fadeInUp` para consistencia con el resto de la sección.

- [ ] **Step 2: Commit**

```bash
git add src/components/portal/sections/NormatividadSection.tsx
git commit -m "feat: add prominent DL 133/2026 normative banner to NormatividadSection"
```

---

### Task 7: Actualizar FALLBACK_FRAMEWORK en LegalFramework.tsx

**Files:**
- Modify: `src/components/portal/sections/normatividad/LegalFramework.tsx`

**Interfaces:**
- Consumes: Datos de DL 133/2026.
- Produces: Fallback consistente con portal-data.ts.

- [ ] **Step 1: Agregar DL 133/2026 y DL 120/2026 al FALLBACK_FRAMEWORK**

En el array `FALLBACK_FRAMEWORK` (líneas 17-22), agregar una nueva categoría o insertar en "Marco legal":
- `'Decreto-Ley No. 133/2026 — Modificación de DL 88, DL 89 y DL 90 (GOC No. 71/2026)'`
- `'Decreto-Ley No. 120/2026 — Pendiente de publicación completa'`

Esto garantiza que cuando la API no devuelve regulaciones, el fallback ya incluye las nuevas normas.

- [ ] **Step 2: Commit**

```bash
git add src/components/portal/sections/normatividad/LegalFramework.tsx
git commit -m "feat: add DL 133/120 to LegalFramework fallback"
```

---

### Task 8: Actualizar prisma/seed.ts con DL 133/2026

**Files:**
- Modify: `prisma/seed.ts`

**Interfaces:**
- Consumes: Modelo `Regulation` del schema.prisma.
- Produces: Registros de DL 133 y 120 en BD tras seed.

- [ ] **Step 1: Leer seed.ts para encontrar dónde se insertan Regulation records**

Buscar el bloque donde se hace `prisma.regulation.createMany` o `prisma.regulation.upsert` con las normativas existentes.

- [ ] **Step 2: Agregar registros para DL 133/2026 y DL 120/2026**

Insertar dos nuevos registros con:
- DL 133: `title: 'Decreto-Ley No. 133/2026'`, `type: 'Decreto-Ley'`, `description: 'Modifica DL 88 (MIPYMES), DL 89 (CNA) y DL 90 (TCP). Establece procedimientos de creación, fusión, escisión y extinción.'`, `source: 'Gaceta Oficial No. 71 Ordinaria de 2026'`, `effectiveDate: '2026'`.
- DL 120: `title: 'Decreto-Ley No. 120/2026'`, `type: 'Decreto-Ley'`, `description: 'Pendiente de publicación completa.'`, `source: 'Por confirmar'`.

Usar los mismos campos y formato que los registros existentes en el seed.

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: seed DL 133/2026 and DL 120/2026 regulations"
```

---

### Task 9: Actualizar constitution.md y AGENTS.md

**Files:**
- Modify: `constitution.md`
- Modify: `AGENTS.md`
- Create: `docs/spec-dictamen-minjus.md`

**Interfaces:**
- None (documentación pura).

- [ ] **Step 1: Actualizar constitution.md — Paleta MINJUS**

Buscar la sección de identidad visual o principios de diseño. Asegurar que diga explícitamente:
"La paleta de colores oficial es la MINJUS: `#005A9C` (primario), `#0074C8` (primario claro), `#FFFFFF` (fondo), `#F2F4F7` (superficie), `#6B7280` (texto secundario), `#1F2937` (texto principal)."

- [ ] **Step 2: Actualizar constitution.md — Marco legal**

Agregar DL 133/2026 y DL 120/2026 a la lista de normas vinculantes junto al DL 226/2001, Res. 51/2021 y Res. 230/2002.

- [ ] **Step 3: Actualizar constitution.md — Inversión extranjera**

Verificar que la sección de inversión extranjera mencione VUINEX y ZED Mariel junto a VUCE, y que excluya explícitamente "Oficina de Representación" como tipo inscribible.

- [ ] **Step 4: Actualizar AGENTS.md — Lecciones aprendidas**

Agregar entrada:
```
### Limpieza de código muerto (portal-data.ts)
- FEE_SCHEDULE y QUICK_ACCESS_CARDS eran exportados por portal-data.ts y re-exportados por index.ts, pero ningún componente los consumía en JSX (HomeSection los importaba pero no los usaba). Eliminados.
- ProcedureCard.tsx tiene PROCEDURES hardcodeado localmente (duplicado de portal-data.ts). Ambos deben mantenerse consistentes manualmente hasta que se unifique.
- LEGAL_FRAMEWORK tiene un FALLBACK_FRAMEWORK en LegalFramework.tsx que debe actualizarse junto con el array en portal-data.ts.
```

- [ ] **Step 5: Guardar spec en docs/spec-dictamen-minjus.md**

Copiar la spec final aprobada (del contexto de esta conversación) a `docs/spec-dictamen-minjus.md`.

- [ ] **Step 6: Commit**

```bash
git add constitution.md AGENTS.md docs/spec-dictamen-minjus.md
git commit -m "docs: update constitution, agents lessons learned, save MINJUS spec"
```

---

### Task 10: Build verification y graphify update

**Files:**
- None (verificación pura).

- [ ] **Step 1: Reconstruir Docker**

Run: `docker compose build --no-cache app` (o el comando equivalente del proyecto).
Expected: Build exitoso sin errores de TypeScript ni CSS.

- [ ] **Step 2: Levantar stack y verificar**

Run: `docker compose up -d`
Verificar que app:3003 responde HTTP 200.

- [ ] **Step 3: Ejecutar seed**

Run: `docker compose exec app bun prisma db seed` (o el comando de seed del proyecto).
Expected: Registros de DL 133/120 creados en BD.

- [ ] **Step 4: Actualizar grafo de Graphify**

Run: `graphify update .`
Expected: Grafo actualizado sin errores.

- [ ] **Step 5: Commit graphify-out si cambió**

```bash
git add graphify-out/
git commit -m "chore: update graphify knowledge graph"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Grupo 1 (Paleta MINJUS): Tasks 1, 2
- ✅ Grupo 2 (VUINEX/ZED Mariel/VUCE/Representación): Tasks 3, 4, 5
- ✅ Grupo 3 (FEE_SCHEDULE código muerto): Task 5
- ✅ Grupo 4 (DL 133/120): Tasks 5, 6, 7, 8
- ✅ Grupo 5 (Tipos de sujetos): Descartado — no existe SUBJECT_TYPES en código, se gestiona por BD/CMS.
- ✅ Grupo 6 (Documentación): Task 9
- ✅ Verificación: Task 10

**Step scan:** Cada step permite escribir exactamente una cosa razonable. No hay líneas "TBD" ni cuerpos de función que el implementador deba inventar.

**Type consistency:** Todas las tareas usan las mismas variables CSS (`var(--rm-primary)`, etc.) definidas en Task 1. Los nombres de arrays y componentes son consistentes.

**Review Focus coverage:**
- Import dinámico CMS: cubierto en Task 5 Step 4 (limpiar imports).
- ~30 ocurrencias HomeSection: cubierto en Task 2 Step 6.
- ProcedureCard duplicado: documentado en Task 4 y AGENTS.md.
- Banner independiente de API: cubierto en Task 6 (insertado estáticamente, no condicional a fetch).
- ForeignInvestment blue-*: cubierto en Task 2 Step 3.

**Proportion:** Plan más largo que la spec porque detalla cada archivo y línea exacta, pero no transcribe código — solo da instrucciones de reemplazo.

---

Plan complete and saved to `docs/superpowers/plans/2026-10-22-dictamen-minjus.md`. Please review the plan. Which execution approach would you prefer?

- **Subagent-driven** — Un subagente fresco por tarea, reviewer entre cada una. Más robusto pero más costoso (10 contextos frescos).
- **Native** — Yo ejecuto todo inline en esta sesión, un reviewer al final. Más rápido y barato.

Para este plan recomiendo **Native**, porque las 10 tareas son ediciones quirúrgicas de búsqueda-y-reemplazo sobre archivos ya identificados, con dependencias lineales claras (Task 1 antes de 2, Tasks 2-8 en paralelo parcial, 9-10 al final). Un error aquí es un color mal puesto o un import roto, no lógica de negocio crítica. ¿El plan captura lo que quieres y qué método usamos?

Skipped: No exploré API routes de buscador/extintas ni componentes CMS que pudieran consumir datos dinámicamente. Risk: si algún componente CMS importa `FEE_SCHEDULE` o `QUICK_ACCESS_CARDS` vía require() dinámico o string interpolation, el build fallará en Task 5 — el Step 4 de verificación lo detecta.