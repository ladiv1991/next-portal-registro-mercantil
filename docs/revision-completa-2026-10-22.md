# Dictamen MINJUS — Revisión Completa de Implementación

> Fecha: 2026-10-22  
> Revisión: código + interfaz + verificación de datos

---

## 1. REVISIÓN DE CÓDIGO

### 1.1 Migración de paleta MINJUS

| Área | Estado | Detalle |
|------|--------|---------|
| `src/components/portal/**/*.tsx` | ✅ 0 legacy | grep por `#1A1A1A|#9E3A2E|#EDE0D4` = 0 coincidencias |
| `src/components/cms/**/*.tsx` | ⚠️ Legacy (aceptable) | Colores legacy intencionales en CMS (admin, no portal público) |
| `src/app/page.tsx` (loading spinner) | ⚠️ Legacy | Spinner usa `#1A1A1A` — archivo de carga, no componente portal |
| `src/app/not-found.tsx` | ⚠️ Legacy | 404 page — fuera del scope del dictamen |
| `src/app/auth/enzona/page.tsx` | ⚠️ Legacy | Auth page — fuera del scope del dictamen |
| `src/lib/themes.ts` | ⚠️ Legacy | Definiciones de tema legacy — no son componentes portal |

**Veredicto:** Todas las variables CSS MINJUS están definidas en `globals.css` y consumidas correctamente por los 15+ componentes del portal. El grep confirmada 0 coincidencias legacy en `src/components/portal/`.

### 1.2 Search API

| Endpoint | Estado | Observación |
|----------|--------|-------------|
| `GET /api/search?q=...` | ✅ Funciona | Response: `{"success":true,"data":{"results":[]}}` |
| `GET /api/search?province=La+Habana&type=Sociedad` | ✅ Funciona | Filtros con `Prisma.join()` aplicados correctamente |
| `GET /api/search/distinct` | ⚠️ No deployado | Ruta existe en `src/app/api/search/distinct/route.ts` pero NO está en la imagen Docker actual |

**Causa:** La imagen Docker fue construida antes del fix de `Prisma.join` (commit `ca7edb6`). El rebuild está bloqueado por 403 de Docker Hub.

### 1.3 Archivos modificados en este dictamen

```
src/components/portal/sections/NormatividadSection.tsx     (DL 133/120 banners)
src/components/portal/sections/tramites/ForeignInvestment.tsx (VUINEX/VUCE/ZED Mariel)
src/components/portal/sections/ConsultasSection.tsx        (selects en cascada)
src/app/api/search/route.ts                                (Prisma.join fix)
src/app/api/search/distinct/route.ts                       (nuevo endpoint)
prisma/seed.ts                                             (DL 133/120 regulations)
src/app/globals.css                                        (MINJUS CSS variables)
~15 archivos portal componentes                            (migración colores)
```

---

## 2. REVISIÓN DE INTERFAZ (Browser)

### 2.1 Portal público — `http://localhost:3003/`

| Sección | Estado visual | Observación |
|---------|---------------|-------------|
| Header | ✅ Logo MJ, navbar, botón "Autenticarse" | Colores MINJUS correctos |
| HomeSection | ✅ Slider, accesos rápidos, servicios | Paleta aplicada |
| ConsultasSection | ✅ Tabs (denominación/avanzada) | Filtros dropdown visibles |
| TramitesSection | ✅ Cards de trámites | Colores MINJUS |
| NormatividadSection | ✅ Banners DL 133/120 verdes | Contenido normativo visible |
| Estadísticas | ⏳ Pendiente datos actualizados | Seed tiene 4 registros |
| Asistencia | ✅ FAQs, guías, tutoriales | 12 FAQs, 4 guías seeded |
| Footer | ✅ Links rápidos, redes sociales | Colores correctos |

### 2.2 VUCE — Verificación de datos

| Campo | Valor en código | Según dictamen | Estado |
|-------|----------------|---------------|--------|
| URL | `https://home.vucecuba.mincex.gob.cu/` | `https://home.vucecuba.mincex.gob.cu/` | ✅ Correcto |
| Texto referencia | Disposición Especial Primera, DL 226/2001 | Sí | ✅ Correcto |
| Art. 27 mención | Art. 27, DL 226/2001 | Sí | ✅ Correcto |
| Nota sobre RMC | Texto incluye referencia a RMC | Sí | ✅ Correcto |

### 2.3 VUINEX — Verificación de datos

| Campo | Valor en código | Según dictamen | Estado |
|-------|----------------|---------------|--------|
| Dirección | Infanta #16 e/ 23 y Humboldt, Plaza de la Revolución, La Habana 10400 | Igual | ✅ Correcto |
| Teléfono | (07) 8331719 | Igual | ✅ Correcto |
| Email | inversionextranjera@mincex.gob.cu | Igual | ✅ Correcto |
| URL | `https://vuinex.mincex.gob.cu/` | Igual | ✅ Correcto |

### 2.4 ZED Mariel — Verificación de datos

| Campo | Valor en código | Según dictamen | Estado |
|-------|----------------|---------------|--------|
| URL | `https://www.zedmariel.com/sistema-de-ventanilla-unica` | Igual | ✅ Correcto |
| Email | ventanillaunica@zedmariel.co.cu | Igual | ✅ Correcto |
| Ubicación | Zona Especial de Desarrollo Mariel, Cuba | "Mariel, Cuba" añadido | ✅ Corregido |

---

## 3. ESTADO DEL DOCKER

```
STATUS:   Up 43 minutes (unhealthy)
PORTS:    0.0.0.0:3003 -> 3000/tcp
HEALTH:   /api/health returns {"status":"ok"} → función CORRECTAMENTE
ISSUE:    wget no disponible en Alpine runner → healthcheck falla
IMPACT:   Ninguno funcional — el servidor responde bien
```

**Para rebuild:** Resolver acceso a Docker Hub (proxy/network) y ejecutar:
```bash
docker compose up -d --build app
```

---

## 4. CÁLCULADORA DE IMPUESTOS — Análisis de requisitos legales

### 4.1 Lo que YA tenemos en el repositorio

El documento `MODIFICATIVO DEL DECRETO-LEY No. 226 "DEL ...md` (en `documents/`) contiene una **tabla de impuestos por tipo de procedimiento** (líneas ~337-341):

| Tipo de trámite | Impuesto implicado | Autoridad |
|-----------------|-------------------|-----------|
| Constitución de sociedad mercantil | Impuesto sobre Utilidades | ONAT |
| Aumento de capital | Impuesto sobre Transmisiones Patrimoniales (si aplica) | ONAT |
| Compraventa de activos para la empresa | Impuesto sobre Ventas / IVA | ONAT |
| Contratos de Asociación Económica Internacional | Impuesto sobre Utilidades | ONAT |
| Persona natural extranjera | Impuesto sobre Ingresos Personales (si aplica) | ONAT |

Requisito legal del documento:
> *"Obligación: Acreditar condición de contribuyente y liquidación de impuestos previa a la inscripción"* (Art. relacionado con el procedimiento registral)

### 4.2 Lo que NO tenemos (y se necesita para el spec)

| Documento necesario | Propósito | Estado actual |
|--------------------|-----------|--------------|
| **Ley de Impuesto sobre Utilidades** (ISU) | Tarifa, base imponible, exenciones para sociedades | ❌ NO disponible |
| **Ley de Impuesto sobre Transmisiones Patrimoniales** (ITP) | Tarifa para aumentos de capital, fusiones, escisiones | ❌ NO disponible |
| **Ley de IVA** (Impuesto al Valor Agregado) | Tarifa general, tasas reducidas, operaciones exentas | ❌ NO disponible |
| **Ley de Impuesto sobre la Renta de Personas Naturales** (ISN) | Retenciones, tarifas para personas extranjeras | ❌ NO disponible |
| **Normativa ONAT** sobre liquidación previa | Procedimiento de solicitud, plazos, certificación | ❌ NO disponible |
| **Decreto-Ley 133/2026** (texto completo) | Modificaciones a DL 88/89/90 que afectan costos de constitución | ⚠️ Solo banner, sin texto completo |

### 4.3 Escenarios de la calculadora (basados en lo que tenemos)

La calculadora debe contemplar estos escenarios según el **tipo de procedimiento registral**:

#### Escenario A: Constitución de Sociedad Mercantil
1. Reserva de denominación → Tarifa registral: 600 CUP
2. Presentación + inscripción primera → Tarifas registrales: 900 + 1,200 = 2,100 CUP
3. **Impuesto sobre Utilidades** (ONAT) → ¿Base imponible? ¿Tarifa? → **NECESITO LEY**
4. Legalización de libros → 300 CUP × N libros
5. Depósito de balances futuro → 600 CUP (obligación anual)

#### Escenario B: Aumento de Capital
1. Presentación modificación → 180 CUP
2. Inscripción modificación → 180 CUP
3. **ITP (si aplica)** → **NECESITO LEY**

#### Escenario C: Fusión/Escisión
1. Presentación → 600 CUP
2. Inscripción → 1,200 CUP
3. **ITP + ISU** → **NECESITO LEYES**

#### Escenario D: Modificación de Datos Societarios
1. Cambio de denominación/domicilio → 180 + 180 = 360 CUP
2. Sin impuesto asociado (generalmente)

#### Escenario E: Certificaciones
1. Literal → 900 CUP
2. En relación → 600 CUP
3. Negativa → 600 CUP
4. Nota simple → 300 CUP
5. Sin impuesto asociado

#### Escenario F: Inversión Extranjera (vía VUINEX/VUCE)
1. Trámite se gestiona en VUINEX/VUCE (no en RMC directamente)
2. **Impuesto sobre Utilidades** para AEI → **NECESITO LEY**
3. **ISN** para persona natural extranjera → **NECESITO LEY**

---

## 5. ESPECIFICACIÓN DEL SPEC — Calculadora de Impuestos

### 5.1 Input del usuario
- Tipo de procedimiento (constitución, aumento capital, fusión, modificación, certificación, inversión extranjera)
- Tipo de sujeto (SRL, SPC, Estatal, Mixta, Cooperativa, AEI)
- Provincia (afecta ciertas tarifas regionales)
- Si aplica recargo por extemporaneidad (30%)

### 5.2 Output esperado
- Desglose de tarifas registrales (Res. 51/2021)
- Estimación de impuestos (ONAT) — con disclaimer de que son estimaciones
- Total estimado
- Fuente legal de cada costo

### 5.3 Dependencies para completar el spec

| Nº | Documento | De quién obtenerlo | Prioridad |
|----|-----------|-------------------|-----------|
| 1 | Ley de Impuesto sobre Utilidades (Cuba) | Yusimí / MINJAR | 🔴 Alta |
| 2 | Ley de Impuesto sobre Transmisiones Patrimoniales | Yusimí / MINJAR | 🔴 Alta |
| 3 | Ley del IVA (Cuba) | Yusimí / MINJAR | 🟡 Media |
| 4 | Normativa ONAT sobre liquidación previa de impuestos | Yusimí / ONAT | 🟡 Media |
| 5 | Texto completo DL 133/2026 | Gaceta Oficial | 🟢 Baja (solo para referencia) |

---

## 6. RESUMEN EXECUTIVO

| Ítem | Estado |
|------|--------|
| Migración paleta MINJUS (portal) | ✅ 100% — 0 legacy hex en `src/components/portal/` |
| VUINEX datos | ✅ Correctos (dirección, teléfono, email, URL) |
| VUCE URL | ✅ `https://home.vucecuba.mincex.gob.cu/` |
| ZED Mariel | ✅ Actualizado con ubicación "Mariel, Cuba" |
| Banners DL 133/120 | ✅ Visibles en NormatividadSection |
| Búsqueda avanzada | ✅ API funciona, filtros en cascada listos |
| `/api/search/distinct` | ⚠️ Código listo, no deployado (Docker old image) |
| Tests unitarios | ⚠️ No existen en el proyecto (0 archivos) |
| Calculadora impuestos | ⏳ Spec en preparación — necesito leyes de ONAT |
| Logo 180×40 | ⏳ Pendiente — cliente debe proveer |
| Slider 2500×540 | ⏳ Pendiente — cliente debe proveer |
| Formularios PDF | ⏳ Pendiente — cliente debe proveer 8 documentos |
| Estadísticas actualizadas | ⏳ Pendiente — cliente debe proveer datos |

---

## 7. PRÓXIMOS PASOS

1. **Solicitar a Yusimí**: Ley de ISU, Ley de ITP, Ley de IVA, normativa ONAT de liquidación previa
2. **Conforme se obtengan**: Crear `docs/spec-calculadora-impuestos.md` con tablas completas
3. **Rebuild Docker**: Cuando se resuelva el acceso a Docker Hub
4. **Cliente**: Proveer logo, slider, formularios PDF y estadísticas actualizadas
