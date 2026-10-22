# Calculadora de Impuestos del Registro Mercantil — Especificación Técnica

> **Versión:** 3.0 — 22 de octubre de 2026
> **Estado:** Tasas Ley 181/2026 confirmadas e implementadas
> **Fuente principal:** Ley No. 113 "Del Sistema Tributario" + Ley 181 "Del Presupuesto del Estado 2026" (Gaceta Oficial No. 99 Ordinaria, 29/12/2025) + Resolución 51/2021 (MINJUS)

---

## 1. FUNDAMENTO LEGAL

### 1.1 Tarifas Registrales — Resolución 51/2021

Base legal: **Decreto-Ley 226/2001, Art. 28.c** (faculta al Ministro de Justicia para fijar tarifas).  
Publicación: Gaceta Oficial de la República de Cuba.  
Vigente desde: 4 de febrero de 2021.  
Deroga: Resoluciones 515 y 516/2020.

**Regla general:** Las tarifas NO incluyen impuestos sobre documentos u otros gravámenes establecidos (Art. 2).

### 1.2 Impuestos Asociados — Ley No. 113 "Del Sistema Tributario"

**Fuente:** Ley No. 113 "Del Sistema Tributario" y Decreto No. 308 (Reglamento) — Gaceta Oficial No. 053 Ordinaria, 21 de noviembre de 2012. Vigencia: 1 de enero de 2013 (aplicación gradual).

| Impuesto | ID | Hecho imponible | Tipo impositivo | Base legal | Aplicación típica |
|----------|----|-----------------|-----------------|------------|-------------------|
| Impuesto sobre Utilidades (ISU) | ISU | Utilidades de personas jurídicas | Variable: 35% general, hasta 50% recursos naturales, 4% extranjeras sin establecimiento | Arts. 68-131, Ley 113 | Constitución (A), Fusión/Escisión (C), Inversión extranjera (F) |
| Impuesto sobre las Ventas (IV) | IV | Ventas de bienes al consumo | Variable: 2% mayorista, 10% minorista | Arts. 132-139, Ley 113 | Compraventa de activos para empresa |
| Impuesto Especial a Productos y Servicios (IEPS) | IEPS | Productos suntuarios, hidrocarburos, tabaco, bebidas | Variable por producto | Arts. 140-145, Ley 113 | — |
| Impuesto sobre los Servicios (IS) | IS | Servicios telefonía, transporte, gastronómicos, alojamiento | Fijo: 10% | Arts. 146-151, Ley 113 | — |
| Impuesto sobre los Ingresos Personales (IPI) | IPI | Ingresos personales trabajo por cuenta propia, salarios, dividendos | Progresivo: 15-50% (5 tramos) | Arts. 16-67, Ley 113 | Persona natural extranjera (F) |
| Impuesto sobre Documentos (ID) | ID | Certificaciones, trámites, licencias | Fijo por documento | Arts. 216-223, Ley 113; Anexo 4 | Certificaciones registrales (ver Anexo 4) |
| Impuesto por la Utilización de la Fuerza de Trabajo (IUFT) | IUFT | Remuneraciones pagadas a trabajadores | Progresivo anual: 20%→5% según antigüedad | Arts. 224-237, Ley 113 | No aplica directamente a constitución |
| Contribución a la Seguridad Social (CSS) | CSS | Salarios devengados | Variable anual (Ley Presupuesto) | Arts. 286-295, Ley 113 | No aplica directamente a constitución |

**Obligación registral:** Acreditar condición de contribuyente y liquidación de impuestos previa a la inscripción (Modificativo DL 226, requisito de presentación).

### 1.3 Recargos

- **30%** por incumplimiento de plazos (Art. 6.1 y 27.1 del DL 226/2001, Art. Quinto de Res. 51/2021)

---

## 2. ESCENARIOS COMPLETOS

### ESCENARIO A: Constitución de Sociedad Mercantil (SRL / SPC)

**Tipos de sujeto:** SRL, SPC (Sociedad Por Acciones), EPE (Empresa Estatal en Perfeccionamiento), Cooperativa no agropecuaria

| Paso | Concepto | Tarifa registral (CUP) | Base legal | ¿Impuesto? |
|------|----------|----------------------|------------|------------|
| 1 | Reserva de denominación | 600 | Res. 51/2021, Partida III, ítem 10 | No |
| 2 | Presentación + calificación (primera inscripción) | 900 | Res. 51/2021, Partida I, ítem 1 | No |
| 3 | Inscripción (primera inscripción) | 1,200 | Res. 51/2021, Partida II, ítem 4 | No |
| 4 | Legalización de libros (por cada libro) | 300 × N | Res. 51/2021, Partida III, ítem 11 | No |
| 5 | **Impuesto sobre Utilidades (ISU)** | Variable | ONAT | ✅ Sí |
| **Subtotal tarifas** | | **2,100 + 300N** CUP | | |

**Escenario A.1 — SRL sin socios extranjeros:**
- Tarifas: 2,100 + 300 × (número de libros, típico 2-3) = **2,700 – 3,000 CUP**
- ISU: Ver Ley de ISU (pendiente de tarifa ONAT)
- Total estimado: **~2,700 – 3,000 CUP** (sin impuesto)

**Escenario A.2 — SRL con inversionista extranjero (AEI):**
- Tarifas: igual que A.1
- ISU: Aplica tributación sobre utilidades de la nueva sociedad
- ISN: Aplica a persona natural extranjera (ver Escenario F)
- Obligación: Liquidación previa de impuestos ante ONAT

### ESCENARIO B: Aumento de Capital

| Paso | Concepto | Tarifa registral (CUP) | Base legal | ¿Impuesto? |
|------|----------|----------------------|------------|------------|
| 1 | Presentación + calificación (modificación) | 180 | Res. 51/2021, Partida I, ítem 2 | No |
| 2 | Inscripción (modificación — aumento capital) | 180 | Res. 51/2021, Partida II, ítem 6.5 | No |
| 3 | **Impuesto sobre Transmisiones Patrimoniales (ITP)** | Variable | ONAT | ✅ Sí (si aplica) |
| **Subtotal tarifas** | | **360 CUP** | | |

**Nota:** El ITP se aplica "si aplica" según la normativa tributaria vigente. No todas las aumentos de capital generan ITP (exenciones para aportes de socios, etc.).

### ESCENARIO C: Fusión

| Paso | Concepto | Tarifa registral (CUP) | Base legal | ¿Impuesto? |
|------|----------|----------------------|------------|------------|
| 1 | Presentación + calificación (fusión) | 600 | Res. 51/2021, Partida I, ítem 3 | No |
| 2 | Inscripción (fusión) | 1,200 | Res. 51/2021, Partida II, ítem 5 | No |
| 3 | **ITP** (sobre transmisión de activos) | Variable | ONAT | ✅ Sí |
| 4 | **ISU** (sobre utilidades de sociedades fusionadas) | Variable | ONAT | ✅ Sí |
| **Subtotal tarifas** | | **1,800 CUP** | | |

### ESCENARIO C.2: Escisión

| Paso | Concepto | Tarifa registral (CUP) | Base legal | ¿Impuesto? |
|------|----------|----------------------|------------|------------|
| 1 | Presentación + calificación (escisión) | 600 | Res. 51/2021, Partida I, ítem 3 | No |
| 2 | Inscripción (escisión) | 1,200 | Res. 51/2021, Partida II, ítem 5 | No |
| 3 | **ITP** | Variable | ONAT | ✅ Sí |
| **Subtotal tarifas** | | **1,800 CUP** | | |

### ESCENARIO D: Modificaciones Societarias (no capital)

| Tipo de modificación | Presentación | Inscripción | Total tarifas | ¿Impuesto? |
|---------------------|-------------|-------------|--------------|------------|
| Cambio de denominación | 180 | 180 | **360 CUP** | No |
| Cambio de domicilio/sede social | 180 | 180 | **360 CUP** | No |
| Cambio de otras circunstancias | 180 | 180 | **360 CUP** | No |
| Prórroga o modificación de término de vigencia | 180 | 180 | **360 CUP** | No |
| Modificación de objeto social | 180 | 180 | **360 CUP** | No |
| Actividades secundarias/eventuales/apoyo | 180 | 180 | **360 CUP** | No |
| Disolución | 180 | 180 | **360 CUP** | No |
| Liquidación y extinción | 180 | 180 | **360 CUP** | No |
| Cancelación del sujeto inscrito | — | 300 | **300 CUP** | No |
| Traspaso/cambio de subordinación | 180 | 180 | **360 CUP** | No |
| Modificación de accionistas/socios | 180 | 180 | **360 CUP** | No |
| Movimientos de directivos | 180 | 180 | **360 CUP** | No |
| Poderes y delegaciones | — | 240 | **240 CUP** | No |
| Delegaciones en otros directivos | — | 240 | **240 CUP** | No |
| Apertura/cierre de sucursales/unidades empresariales | 180 | 180 | **360 CUP** | No |
| Suspensión/reactivación de perfeccionamiento empresarial | 180 | 180 | **360 CUP** | No |
| Cualquier otro acto inscribible | 180 | 300 | **480 CUP** | No |

### ESCENARIO E: Certificaciones y Publicidad Registral

| Tipo de certificación | Tarifa (CUP) | Base legal | ¿Impuesto? |
|----------------------|-------------|------------|------------|
| Certificación literal | 900 | Res. 51/2021, Partida IV, ítem 15 | No |
| Certificación en relación | 600 | Res. 51/2021, Partida IV, ítem 16 | No |
| Certificación negativa | 600 | Res. 51/2021, Partida IV, ítem 17 | No |
| Nota simple informativa | 300 | Res. 51/2021, Partida IV, ítem 18 | No |

**Exenciones de pago (Art. Sexto, Res. 51/2021):**
- Mandamiento judicial
- Solicitud del Fiscal
- Solicitud del Ministerio de Justicia
- Solicitud de la Administración (actuando de oficio)

### ESCENARIO F: Inversión Extranjera (AEI / Empresas Mixtas)

Gestión a través de VUINEX o VUCE (no se tramita directamente en RMC).

| Paso | Concepto | Tarifa registral (CUP) | Base legal | ¿Impuesto? |
|------|----------|----------------------|------------|------------|
| 1 | Autorización previa | — | DL 226/2001, Disp. Esp. 1ra | — |
| 2 | Presentación + calificación (primera inscripción) | 900 | Res. 51/2021, Partida I, ítem 1 | No |
| 3 | Inscripción (primera inscripción) | 1,200 | Res. 51/2021, Partida II, ítem 4 | No |
| 4 | **ISU** (sobre utilidades de empresa mixta/AEI) | Variable | ONAT | ✅ Sí |
| 5 | **ISN** (persona natural extranjera) | Variable | ONAT | ✅ Sí (si aplica) |
| **Subtotal tarifas** | | **2,100 CUP** | | |

**Nota:** La autorización de inversión extranjera se gestiona ante VUINEX (para empresas mixtas y AEI) o VUCE (para sociedades de capital totalmente extranjero). El RMC solo inscribe después de la autorización.

### ESCENARIO G: Depósito de Cuentas Anuales

| Paso | Concepto | Tarifa (CUP) | Base legal | ¿Impuesto? |
|------|----------|-------------|------------|------------|
| 1 | Depósito y publicidad de balances certificados | 600 | Res. 51/2021, Partida III, ítem 8 | No |

**Plazo:** 2 meses desde aprobación de cuentas, máximo 6 meses desde cierre del ejercicio (Res. 230/2002, Art. 200).

---

## 2. MODELO DE DATOS COMPLETO — Ley 113

### 2.1 Estructura base del impuesto

```typescript
interface TaxRule {
  id: string;                    // 'ISU' | 'IV' | 'IEPS' | 'IS' | 'IPI' | 'ID' | 'IUFT' | 'CSS'
  nombre: string;
  base_legal: string;            // Ej: 'Arts. 68-131, Ley 113'
  hecho_imponible: string;
  sujetos_pasivos: string[];
  tipo_impositivo: {
    tipo: 'fijo' | 'progresivo' | 'variable' | 'fijo_por_documento';
    valor: number | TaxBracket[] | string;
    unidad: 'porcentaje' | 'CUP' | 'CUP_por_ha' | 'CUP_por_documento';
  };
  periodicidad_pago: string;
  plazo_pago: string;
  moneda_pago: 'CUP' | 'CUC' | 'ambas';
  exenciones: string[];
  anexo_referencia?: string;     // 'Anexo No. 1', 'Anexo No. 4', etc.
}

interface TaxBracket {
  desde: number | null;
  hasta: number | null;
  tasa: number;                  // porcentaje
}

interface ScenarioTax {
  impuesto: TaxRule;
  aplicable: boolean;
  estimacion: string;            // 'Ver Anexo 4' | 'Variable según actividad' | 'No aplica'
}
```

### 2.2 Catálogo de impuestos aplicables a trámites registrales

| ID | Nombre | Hecho imponible | Tipo | Tasa/valor | Periodicidad | Plazo | ¿Aplica a trámites registrales? |
|----|--------|-----------------|------|------------|--------------|-------|-------------------------------|
| **ISU** | Impuesto sobre Utilidades | Utilidades de personas jurídicas | Variable | 35% general; 50% máx. recursos naturales; 4% extranjeras sin establecimiento | Anual + pagos a cuenta trimestrales | Dentro del trimestre siguiente al cierre | ✅ AEC (constitución, fusión, AEI) |
| **IV** | Impuesto sobre las Ventas | Ventas de bienes al consumo | Variable | 2% mayorista; 10% minorista | Mensual | 20-60 días tras cierre del mes | ✅ Compraventa de activos |
| **IEPS** | Impuesto Especial a Productos y Servicios | Productos suntuarios, hidrocarburos, tabaco, bebidas | Variable | Por producto (Anexo Ley Presupuesto) | Mensual | — | ❌ No aplica directamente |
| **IS** | Impuesto sobre los Servicios | Telefonía, transporte, gastronómicos, alojamiento | Fijo | 10% | Mensual | 20 días tras cierre del mes | ❌ No aplica directamente |
| **IPI** | Impuesto sobre los Ingresos Personales | Ingresos personales (trabajo, salarios, dividendos) | Progresivo | Escala 15-50% (5 tramos) | Anual + anticipos | Antes del 30 de abril | ✅ Persona natural extranjera |
| **ID** | Impuesto sobre Documentos | Certificaciones, trámites, licencias | Fijo por documento | Ver Anexo No. 4 (+100 trámites) | Por evento | Al solicitar | ✅ Certificaciones registrales |
| **IUFT** | Impuesto por Utilización de Fuerza de Trabajo | Remuneraciones a trabajadores | Progresivo anual | 20%→15%→12%→10%→5% por año | Mensual | Primeros 10 días hábiles | ❌ No aplica a constitución |
| **CSS** | Contribución a la Seguridad Social | Salarios devengados | Variable anual | Según Ley Presupuesto | Mensual | Primeros 10 días hábiles | ❌ No aplica a constitución |

### 2.3 Escalas progresivas detalladas

#### IPI — Escala general (5 tramos)
| Tramo | Base imponible (CUP) | Tasa marginal |
|-------|---------------------|---------------|
| 1 | 0 – 10,000 | 15% |
| 2 | 10,000 – 20,000 | 20% |
| 3 | 20,000 – 30,000 | 30% |
| 4 | 30,000 – 50,000 | 40% |
| 5 | > 50,000 | 50% |

**Bonificación:** 5% por declarar y pagar antes del 28 de febrero.

**Tasas especiales:**
- No residentes permanentes: 15% sobre total ingresos sin deducción
- Contratos individuales exterior: 4% con mínimo mensual de 20 CUC
- Fuentes eventuales (venta vivienda/vehículo, premios): 4%
- Segunda venta vivienda/vehículo mismo año: 8%

#### IUFT — Escala por antigüedad de la empresa
| Período | Tasa |
|---------|------|
| Primer año | 20% |
| Segundo año | 15% |
| Tercer año | 12% |
| Cuarto año | 10% |
| Quinto año y sucesivos | 5% |

**Exención:** Personas naturales con hasta 5 trabajadores.

#### ISU — Cooperativas no agropecuarias (percápita)
| Tramo | Base imponible | Tasa |
|-------|---------------|------|
| 1 | 0 – 10,000 | 10% |
| 2 | 10,000 – 20,000 | 15% |
| 3 | 20,000 – 30,000 | 25% |
| 4 | 30,000 – 50,000 | 35% |
| 5 | > 50,000 | 45% |

### 2.4 Anexo No. 4 — Impuesto sobre Documentos (ejemplos clave)

| Documento | Cuantía (CUP) |
|-----------|---------------|
| Certificación de nacimiento (Registro Civil) | 5.00 |
| Certificación de matrimonio | 5.00 |
| Certificación de acta de ciudadanía | 10.00 |
| Solicitud de licencia de conducción (inicial) | 30.00 |
| Traspaso de propiedad de vehículo | 60.00 |
| Inscripción en Registro de Vehículos | 40.00 |
| Inscripción en Registro de Contribuyentes (ONAT) | 30.00 |
| Certificación de ONAT | 20.00 |
| Inscripción en Registro Único de Arrendamiento | 100.00 |

> **Nota:** El Anexo 4 contiene más de 100 trámites. Las tarifas del Registro Mercantil específico deben consultarse en el anexo completo.

### 2.5 Exenciones relevantes para trámites registrales

| Impuesto | Exenciones aplicables |
|----------|----------------------|
| ISU | Banco Central de Cuba; instituciones religiosas y fraternales; instituciones internacionales sin fines de lucro; intereses de préstamos exteriores de organismos del Estado |
| IPI | Remesas de ayuda familiar; retribuciones diplomáticas; viáticos y remuneraciones por viajes/misiones; jubilaciones y pensiones; donaciones al Estado; indemnizaciones de seguro |
| ID | Documentos tramitados por misiones diplomáticas/consulares; legalizaciones MINREX para internacionalistas; certificaciones para trámites de carné de identidad; documentos requeridos por tribunales/fiscales |

---

## 4. ESCENARIOS DE PRUEBA (TESTS)

### 4.1 Pruebas de Tarifas Registrales

| Caso | Trámite | Sujeto | Esperado |
|------|---------|--------|----------|
| T1 | Constitución SRL | SRL cubano | 900 + 1,200 = 2,100 CUP |
| T2 | Constitución SPC | SPC cubano | 900 + 1,200 = 2,100 CUP |
| T3 | Constitución con reserva de nombre | SRL | 600 (reserva) + 2,100 = 2,700 CUP |
| T4 | Aumento de capital | SRL | 180 + 180 = 360 CUP |
| T5 | Fusión | SRL + SRL | 600 + 1,200 = 1,800 CUP |
| T6 | Escisión | SRL | 600 + 1,200 = 1,800 CUP |
| T7 | Cambio de denominación | SRL | 180 + 180 = 360 CUP |
| T8 | Cambio de domicilio | SRL | 180 + 180 = 360 CUP |
| T9 | Poderes y delegaciones | SRL | 240 CUP |
| T10 | Cancelación de sujeto | SRL | 300 CUP |
| T11 | Certificación literal | Cualquiera | 900 CUP |
| T12 | Certificación negativa | Cualquiera | 600 CUP |
| T13 | Nota simple informativa | Cualquiera | 300 CUP |
| T14 | Depósito de balances | Cualquiera | 600 CUP |
| T15 | Constitución con recargo 30% | SRL | 2,100 × 1.30 = 2,730 CUP |
| T16 | Legalización 3 libros | SRL | 2,100 + (300 × 3) = 3,000 CUP |

### 4.2 Pruebas de Impuestos

| Caso | Trámite | Impuesto esperado | Estado |
|------|---------|------------------|--------|
| TI1 | Constitución SRL | ISU aplicable | Estimado (tarifa ONAT pendiente) |
| TI2 | Aumento de capital | ITP aplicable si corresponde | Estimado (tarifa ONAT pendiente) |
| TI3 | Fusión | ITP + ISU | Estimado |
| TI4 | Inversión extranjera AEI | ISU + posible ISN | Estimado |
| TI5 | Certificación literal | Sin impuesto | ✅ Confirmado |
| TI6 | Modificación de datos | Sin impuesto | ✅ Confirmado |

### 4.3 Pruebas de Exenciones

| Caso | Tipo | Causal | Resultado esperado |
|------|------|--------|-------------------|
| TE1 | Certificación literal | Mandamiento judicial | 0 CUP (exento) |
| TE2 | Certificación negativa | Solicitud del Fiscal | 0 CUP (exento) |
| TE3 | Nota simple | Solicitud MINJUS | 0 CUP (exento) |
| TE4 | Certificación | Solicitud Administración (oficio) | 0 CUP (exento) |

### 4.4 Pruebas de Interfaz

| Caso | Acción | Resultado esperado |
|------|--------|-------------------|
| TI21 | Seleccionar "Constitución SRL" | Mostrar desglose: 2,100 CUP + ISU (estimado) |
| TI22 | Activar "Recargo por extemporaneidad" | Mostrar +30% sobre total |
| TI23 | Seleccionar "Certificación literal" + "Mandato judicial" | Mostrar 0 CUP, nota de exención |
| TI24 | Seleccionar "Inversión extranjera" | Redirigir a info VUINEX/VUCE |
| TI25 | Seleccionar "Constitución + 3 libros" | Mostrar: tarifas + 900 CUP (3 × 300) |

---

## 5. IMPLEMENTACIÓN — Estado actual

| Componente | Estado | Detalle |
|------------|--------|---------|
| `TaxCalculator.tsx` | ✅ Implementado | 7 escenarios con íconos, desglose interactivo, recargo 30%, exenciones |
| Tasas Ley 181/2026 | ✅ Integradas | ISU 35%, IPI escala 15-50%, IUFT 5% (única 2026), CSS 14%, CESS 5%/10%, CTDL 1%, IV/IS 10%, ID Grupos I/II |
| `FeeSchedule.tsx` | ✅ Existe | Muestra tabla completa de Res. 51/2021 |
| Tests unitarios | ✅ Completos | 78 tests cubriendo tarifas registrales, tasas Ley 181, cálculos compuestos |
| Anexo No. 4 (ID) | ✅ Implementado | Grupos I (30/20 CUP) y II (750/500 CUP) mostrados en certificación |
| IUFT tasa 2026 | ✅ Actualizado | Tasa única 5% (escala progresiva Ley 113 suspendida) |

---

## 6. DOCUMENTOS NECESARIOS — Estado

| # | Documento | Estado | Nota |
|---|-----------|--------|------|
| 1 | Ley 181/2026 (Presupuesto) | ✅ Descargado | Gaceta Oficial No. 99, 29/12/2025. Tasas confirmadas. |
| 2 | DL 21/2020 (Anexo 4 modificado) | ✅ Referenciado | Grupos I/II con cuantías 30/20 y 750/500 CUP |
| 3 | Ley 113/2012 (Sistema Tributario) | ✅ Referenciado | Edición Especial No. 1, 12/01/2026 |
| 4 | Decreto 308/2012 (Reglamento) | ✅ Referenciado | Procedimiento de inscripción y liquidación |
| 5 | Anexo No. 4 completo (+100 trámites) | ⚠️ Parcial | Solo inscripción RC y certificación ONAT implementados |
| 6 | Procedimiento liquidación previa ONAT | 📋 Pendiente | Flujo de integración con ONAT no definido |

---

## 7. PLAN DE IMPLEMENTACIÓN

1. **Fase 1** (✅ completado): Componente `TaxCalculator.tsx` con 7 escenarios, íconos, desglose interactivo, recargo 30%, exenciones, info VUCE/VUINEX/ZED Mariel.
2. **Fase 2** (✅ completado): Tasas Ley 181/2026 integradas en componente — ISU 35%, IPI escala 15-50%, IUFT 5% fijo 2026, CSS 14%, CESS 5%/10%, CTDL 1%, IV/IS 10%, ID Grupos I/II.
3. **Fase 3** (✅ completado): 78 tests unitarios pasando. Spec actualizado con estructura Ley 113 + Ley 181.
4. **Fase 4** (pendiente): Anexo No. 4 completo (+100 trámites) — requiere descarga del PDF completo de la Gaceta Oficial.
5. **Fase 5** (pendiente): Flujo de liquidación previa ONAT — integración del procedimiento de certificación fiscal.
