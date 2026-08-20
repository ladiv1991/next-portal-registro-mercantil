# Plan de actualización normativa del Portal

## Fuentes incorporadas

1. **Decreto-Ley No. 226/2001, Del Registro Mercantil**
   - Sujetos y actos inscribibles, publicidad, efectos, calificación, modificaciones, cancelaciones, recursos, obligaciones fiscales y facultad tarifaria del Art. 28.c.
   - Se informa que el texto está concordado con el Decreto-Ley No. 26/2020.

2. **Resolución No. 230/2002, Reglamento del Registro Mercantil**
   - Organización Central/Territorial, libros, requisitos, calificación, recursos, certificaciones, legalización, cuentas anuales y plazos de los Arts. 59, 61, 64, 75, 81, 104 y 200.

3. **Resolución No. 51/2021, Tarifas del Registro Mercantil**
   - Tabla completa de 34 conceptos tarifarios, recargo único del 30%, exenciones, aplicación por documento y relación expresa con el Decreto-Ley 226/2001.
   - Sustituye las Resoluciones 515 y 516/2020 según el documento fuente.

4. **Extracto estadístico SIEC, Granma, febrero-marzo 2026**
   - KPI de solicitudes, actos inscritos, certificaciones, ingresos, verificaciones, infracciones, bancarización, composición por sujeto y plantilla.
   - Se presenta como información estadística provincial y no como sustituto de estadísticas oficiales consolidadas.

## Implementación

- `prisma/seed.ts`: carga inicial reproducible de fichas normativas, tarifas de referencia y KPI.
- `prisma/migrations/20260820_normative_portal_update/migration.sql`: actualización transaccional e idempotente de producción; no borra datos operativos.
- `src/components/portal/sections/normatividad/LegalFramework.tsx`: muestra las fichas desde `/api/public/content`, agrupadas por tipo, con descripción, fecha y contenido desplegable.
- `src/components/portal/sections/normatividad/FeeSchedule.tsx`: muestra la tabla tarifaria de la Resolución 51/2021 y las referencias del Decreto-Ley 226/2001 y Resolución 230/2002.
- `Statistic`: incorpora los KPI provinciales con período y unidad explícitos.
- `scripts/update-minjus.sh`: crea backup, aplica las migraciones, ejecuta validaciones, construye y despliega.

## Operación

```bash
bash scripts/update-minjus.sh
```

El script debe ejecutarse en el servidor con Docker, Bun, PostgreSQL y los contenedores configurados. Antes de aplicar las migraciones crea un dump de la base de datos.

## Criterio de actualización futura

Cada nueva resolución o informe debe añadirse como una migración versionada y como registro de seed, conservando número, fecha, fuente, vigencia, relación con normas superiores y una etiqueta visible de carácter informativo cuando corresponda.
