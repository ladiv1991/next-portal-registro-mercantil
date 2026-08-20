#!/bin/bash
# ================================================================
# fix-old-colors.sh — Limpieza de clases de color obsoletas
# Registro Mercantil de Cuba
# ================================================================
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "================================================"
echo "  🎨 Limpieza de clases de color obsoletas"
echo "  Paleta antigua: navy, gold, cuban-red"
echo "  Paleta nueva:   #1A1A1A, #9E3A2E, #7A2A1E"
echo "================================================"
echo ""

# ────────────────────────────────────────────────
# PASO 0: Backup rápido
# ────────────────────────────────────────────────
BACKUP_DIR="./backups/pre-color-fix"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

echo "📦 Paso 0 — Creando backup de archivos a modificar..."
FILES_TO_BACKUP=(
  "src/components/portal/sections/HomeSection.tsx"
  "src/components/portal/sections/ConsultasSection.tsx"
  "src/components/portal/sections/normatividad/FeeSchedule.tsx"
  "src/components/portal/sections/tramites/ConstitutionSteps.tsx"
  "src/components/portal/sections/tramites/ForeignInvestment.tsx"
  "src/components/portal/sections/estadisticas/SocietiesPieChart.tsx"
  "src/data/portal-data.ts"
  "prisma/seed.ts"
)

for f in "${FILES_TO_BACKUP[@]}"; do
  if [ -f "$f" ]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$f")"
    cp "$f" "$BACKUP_DIR/$f"
    echo "   ✅ $f"
  else
    echo "   ⚠️  $f no encontrado (omitido)"
  fi
done
echo ""

# Contador de cambios
TOTAL_CHANGES=0

# ────────────────────────────────────────────────
# PASO 1: Buscar TODAS las ocurrencias (no solo las del grep de dominio)
# ────────────────────────────────────────────────
echo "🔍 Paso 1 — Detección completa de clases obsoletas..."
echo ""

OLD_CLASSES=("text-navy" "bg-navy" "text-gold" "bg-gold" "text-cuban-red" "bg-cuban-red" "text-cuban-red-light" "bg-cuban-red-light" "border-navy" "border-gold" "border-cuban-red")
OLD_HEX=("#0F1B2D" "#0F1b2d" "#C8A951" "#c8a951" "#CC2936" "#cc2936" "#1A2A42" "#1a2a42" "#D4B96A" "#d4b96a" "#A68B3C" "#a68b3c")

echo "   Clases Tailwind obsoletas:"
for cls in "${OLD_CLASSES[@]}"; do
  COUNT=$(grep -rn "$cls" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
  if [ "$COUNT" -gt 0 ]; then
    echo "     ❌ $cls → $COUNT ocurrencia(s)"
    grep -rn "$cls" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | sed 's/^/        /'
  else
    echo "     ✅ $cls → limpio"
  fi
done
echo ""

echo "   Hex values obsoletos:"
for hex in "${OLD_HEX[@]}"; do
  COUNT=$(grep -rn "$hex" src/ prisma/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
  if [ "$COUNT" -gt 0 ]; then
    echo "     ❌ $hex → $COUNT ocurrencia(s)"
    grep -rn "$hex" src/ prisma/ --include="*.tsx" --include="*.ts" 2>/dev/null | sed 's/^/        /'
  else
    echo "     ✅ $hex → limpio"
  fi
done
echo ""

# ────────────────────────────────────────────────
# PASO 2: Reemplazos en archivos específicos
# ────────────────────────────────────────────────
echo "🔧 Paso 2 — Aplicando reemplazos..."
echo ""

apply_sed() {
  local file="$1"
  local old="$2"
  local new="$3"
  local desc="$4"
  
  if [ ! -f "$file" ]; then
    echo "   ⚠️  $file no existe, saltando"
    return
  fi
  
  if grep -q "$old" "$file"; then
    COUNT_BEFORE=$(grep -c "$old" "$file")
    sed -i "s|$old|$new|g" "$file"
    echo "   ✅ $file: $desc ($COUNT_BEFORE reemplazo(s))"
    TOTAL_CHANGES=$((TOTAL_CHANGES + COUNT_BEFORE))
  fi
}

# ── 2a. HomeSection.tsx ──
FILE="src/components/portal/sections/HomeSection.tsx"
if [ -f "$FILE" ]; then
  echo "   📄 $FILE"
  apply_sed "$FILE" "color: 'bg-navy'"             "color: 'bg-[#1A1A1A]'"             "bg-navy → bg-[#1A1A1A]"
  apply_sed "$FILE" "color: 'bg-gold'"             "color: 'bg-[#9E3A2E]'"             "bg-gold → bg-[#9E3A2E]"
  apply_sed "$FILE" "color: 'bg-cuban-red'"        "color: 'bg-[#7A2A1E]'"             "bg-cuban-red → bg-[#7A2A1E]"
  # Cualquier otra ocurrencia suelta
  apply_sed "$FILE" "text-navy"                    "text-[#1A1A1A]"                    "text-navy residual"
  apply_sed "$FILE" "bg-navy"                      "bg-[#1A1A1A]"                      "bg-navy residual"
  apply_sed "$FILE" "text-gold"                    "text-[#9E3A2E]"                    "text-gold residual"
  apply_sed "$FILE" "bg-gold"                      "bg-[#9E3A2E]"                      "bg-gold residual"
  apply_sed "$FILE" "text-cuban-red"               "text-[#9E3A2E]"                    "text-cuban-red residual"
  apply_sed "$FILE" "bg-cuban-red"                 "bg-[#7A2A1E]"                      "bg-cuban-red residual"
fi

# ── 2b. ConsultasSection.tsx ──
FILE="src/components/portal/sections/ConsultasSection.tsx"
if [ -f "$FILE" ]; then
  echo "   📄 $FILE"
  apply_sed "$FILE" "data-\[state=active\]:bg-navy" "data-[state=active]:bg-[#1A1A1A]" "tab activo navy → negro suave"
  apply_sed "$FILE" "text-navy"                    "text-[#1A1A1A]"                    "text-navy en table header"
  apply_sed "$FILE" "bg-navy"                      "bg-[#1A1A1A]"                      "bg-navy residual"
  apply_sed "$FILE" "text-gold"                    "text-[#9E3A2E]"                    "text-gold residual"
  apply_sed "$FILE" "bg-gold"                      "bg-[#9E3A2E]"                      "bg-gold residual"
  apply_sed "$FILE" "text-cuban-red"               "text-[#9E3A2E]"                    "text-cuban-red residual"
  apply_sed "$FILE" "bg-cuban-red"                 "bg-[#7A2A1E]"                      "bg-cuban-red residual"
fi

# ── 2c. FeeSchedule.tsx ──
FILE="src/components/portal/sections/normatividad/FeeSchedule.tsx"
if [ -f "$FILE" ]; then
  echo "   📄 $FILE"
  apply_sed "$FILE" "text-navy"                    "text-[#1A1A1A]"                    "CardTitle text-navy"
  apply_sed "$FILE" "bg-navy"                      "bg-[#1A1A1A]"                      "bg-navy residual"
  apply_sed "$FILE" "text-gold"                    "text-[#9E3A2E]"                    "text-gold residual"
  apply_sed "$FILE" "bg-gold"                      "bg-[#9E3A2E]"                      "bg-gold residual"
fi

# ── 2d. ConstitutionSteps.tsx ──
FILE="src/components/portal/sections/tramites/ConstitutionSteps.tsx"
if [ -f "$FILE" ]; then
  echo "   📄 $FILE"
  apply_sed "$FILE" "text-navy"                    "text-[#1A1A1A]"                    "CardTitle text-navy"
  apply_sed "$FILE" "bg-navy"                      "bg-[#1A1A1A]"                      "bg-navy residual"
  apply_sed "$FILE" "text-gold"                    "text-[#9E3A2E]"                    "text-gold residual"
  apply_sed "$FILE" "bg-gold"                      "bg-[#9E3A2E]"                      "bg-gold residual"
fi

# ── 2e. ForeignInvestment.tsx ──
FILE="src/components/portal/sections/tramites/ForeignInvestment.tsx"
if [ -f "$FILE" ]; then
  echo "   📄 $FILE"
  apply_sed "$FILE" "text-navy"                    "text-[#1A1A1A]"                    "CardTitle text-navy"
  apply_sed "$FILE" "bg-navy"                      "bg-[#1A1A1A]"                      "bg-navy residual"
  apply_sed "$FILE" "text-gold"                    "text-[#9E3A2E]"                    "text-gold residual"
  apply_sed "$FILE" "bg-gold"                      "bg-[#9E3A2E]"                      "bg-gold residual"
fi

# ── 2f. SocietiesPieChart.tsx ──
FILE="src/components/portal/sections/estadisticas/SocietiesPieChart.tsx"
if [ -f "$FILE" ]; then
  echo "   📄 $FILE"
  apply_sed "$FILE" "text-navy"                    "text-[#1A1A1A]"                    "CardTitle text-navy"
  apply_sed "$FILE" "bg-navy"                      "bg-[#1A1A1A]"                      "bg-navy residual"
fi

# ── 2g. LegalFramework.tsx ──
FILE="src/components/portal/sections/normatividad/LegalFramework.tsx"
if [ -f "$FILE" ]; then
  echo "   📄 $FILE"
  apply_sed "$FILE" "text-navy"                    "text-[#1A1A1A]"                    "text-navy residual"
  apply_sed "$FILE" "bg-navy"                      "bg-[#1A1A1A]"                      "bg-navy residual"
  apply_sed "$FILE" "text-gold"                    "text-[#9E3A2E]"                    "text-gold residual"
  apply_sed "$FILE" "bg-gold"                      "bg-[#9E3A2E]"                      "bg-gold residual"
  apply_sed "$FILE" "text-cuban-red"               "text-[#9E3A2E]"                    "text-cuban-red residual"
  apply_sed "$FILE" "bg-cuban-red"                 "bg-[#7A2A1E]"                      "bg-cuban-red residual"
fi

# ── 2h. portal-data.ts (datos estáticos de fallback) ──
FILE="src/data/portal-data.ts"
if [ -f "$FILE" ]; then
  echo "   📄 $FILE"
  apply_sed "$FILE" "color: 'bg-navy'"             "color: 'bg-[#1A1A1A]'"             "bg-navy → bg-[#1A1A1A]"
  apply_sed "$FILE" "color: 'bg-gold'"             "color: 'bg-[#9E3A2E]'"             "bg-gold → bg-[#9E3A2E]"
  apply_sed "$FILE" "color: 'bg-cuban-red'"        "color: 'bg-[#7A2A1E]'"             "bg-cuban-red → bg-[#7A2A1E]"
  apply_sed "$FILE" "text-navy"                    "text-[#1A1A1A]"                    "text-navy residual"
  apply_sed "$FILE" "bg-navy"                      "bg-[#1A1A1A]"                      "bg-navy residual"
  apply_sed "$FILE" "text-gold"                    "text-[#9E3A2E]"                    "text-gold residual"
  apply_sed "$FILE" "bg-gold"                      "bg-[#9E3A2E]"                      "bg-gold residual"
  apply_sed "$FILE" "text-cuban-red"               "text-[#9E3A2E]"                    "text-cuban-red residual"
  apply_sed "$FILE" "bg-cuban-red"                 "bg-[#7A2A1E]"                      "bg-cuban-red residual"
fi

# ── 2i. prisma/seed.ts (hex values en Service.color) ──
FILE="prisma/seed.ts"
if [ -f "$FILE" ]; then
  echo "   📄 $FILE"
  apply_sed "$FILE" "'#0F1B2D'"                   "'#1A1A1A'"                        "#0F1B2D → #1A1A1A"
  apply_sed "$FILE" "'#0f1b2d'"                   "'#1A1A1A'"                        "#0f1b2d → #1A1A1A (lowercase)"
  apply_sed "$FILE" "'#CC2936'"                   "'#9E3A2E'"                        "#CC2936 → #9E3A2E"
  apply_sed "$FILE" "'#cc2936'"                   "'#9E3A2E'"                        "#cc2936 → #9E3A2E (lowercase)"
  apply_sed "$FILE" "'#C8A951'"                   "'#9E3A2E'"                        "#C8A951 → #9E3A2E (gold→terracota)"
  apply_sed "$FILE" "'#c8a951'"                   "'#9E3A2E'"                        "#c8a951 → #9E3A2E (lowercase)"
  apply_sed "$FILE" "'#1A2A42'"                   "'#2D2D2D'"                        "#1A2A42 → #2D2D2D (navy-light)"
  apply_sed "$FILE" "'#1a2a42'"                   "'#2D2D2D'"                        "#1a2a42 → #2D2D2D (lowercase)"
fi

# ── 2j. Barrida global sobre TODO src/ por si hay más ──
echo ""
echo "   🔄 Barrida global sobre src/ (archivos no listados arriba)..."

# Buscar archivos .tsx/.ts que aún tengan clases obsoletas
AFFECTED_FILES=$(grep -rl -E "text-navy|bg-navy|text-gold|bg-gold|text-cuban-red|bg-cuban-red|text-cuban-red-light|bg-cuban-red-light|border-navy|border-gold|border-cuban-red" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | sort -u || true)

if [ -n "$AFFECTED_FILES" ]; then
  for f in $AFFECTED_FILES; do
    # Solo procesar si no fue procesado arriba
    case "$f" in
      */HomeSection.tsx|*/ConsultasSection.tsx|*/FeeSchedule.tsx|*/ConstitutionSteps.tsx|*/ForeignInvestment.tsx|*/SocietiesPieChart.tsx|*/LegalFramework.tsx|*/portal-data.ts)
        # Ya procesado
        ;;
      *)
        echo "   📄 $f (archivo adicional)"
        sed -i "s/text-navy/text-[#1A1A1A]/g" "$f"
        sed -i "s/bg-navy/bg-[#1A1A1A]/g" "$f"
        sed -i "s/border-navy/border-[#1A1A1A]/g" "$f"
        sed -i "s/text-gold/text-[#9E3A2E]/g" "$f"
        sed -i "s/bg-gold/bg-[#9E3A2E]/g" "$f"
        sed -i "s/border-gold/border-[#9E3A2E]/g" "$f"
        sed -i "s/text-cuban-red/text-[#9E3A2E]/g" "$f"
        sed -i "s/bg-cuban-red/bg-[#7A2A1E]/g" "$f"
        sed -i "s/border-cuban-red/border-[#7A2A1E]/g" "$f"
        sed -i "s/text-cuban-red-light/text-[#B55A4A]/g" "$f"
        sed -i "s/bg-cuban-red-light/bg-[#B55A4A]/g" "$f"
        echo "      ✅ Reemplazado"
        TOTAL_CHANGES=$((TOTAL_CHANGES + 1))
        ;;
    esac
  done
else
  echo "   ✅ No se encontraron archivos adicionales con clases obsoletas"
fi

# ── 2k. Barrida global por hex obsoletos en src/ ──
echo ""
echo "   🔄 Barrida global por hex obsoletos en src/..."
HEX_FILES=$(grep -rl -E "#0F1B2D|#0f1b2d|#C8A951|#c8a951|#CC2936|#cc2936|#1A2A42|#1a2a42|#D4B96A|#d4b96a|#A68B3C|#a68b3c" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | sort -u || true)

if [ -n "$HEX_FILES" ]; then
  for f in $HEX_FILES; do
    echo "   📄 $f"
    sed -i "s/#0F1B2D/#1A1A1A/gI" "$f"
    sed -i "s/#C8A951/#9E3A2E/gI" "$f"
    sed -i "s/#CC2936/#9E3A2E/gI" "$f"
    sed -i "s/#1A2A42/#2D2D2D/gI" "$f"
    sed -i "s/#D4B96A/#D6C9BA/gI" "$f"
    sed -i "s/#A68B3C/#D6C9BA/gI" "$f"
    echo "      ✅ Hex reemplazados"
    TOTAL_CHANGES=$((TOTAL_CHANGES + 1))
  done
else
  echo "   ✅ No se encontraron hex obsoletos en src/"
fi

echo ""

# ────────────────────────────────────────────────
# PASO 3: Verificación post-reemplazo
# ────────────────────────────────────────────────
echo "✅ Paso 3 — Verificación post-reemplazo..."
echo ""

REMAINING=0

for cls in "${OLD_CLASSES[@]}"; do
  COUNT=$(grep -rn "$cls" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
  if [ "$COUNT" -gt 0 ]; then
    echo "   ❌ Aún quedan: $cls ($COUNT)"
    grep -rn "$cls" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | sed 's/^/        /'
    REMAINING=$((REMAINING + COUNT))
  fi
done

for hex in "${OLD_HEX[@]}"; do
  COUNT=$(grep -rn "$hex" src/ prisma/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
  if [ "$COUNT" -gt 0 ]; then
    echo "   ❌ Aún quedan: $hex ($COUNT)"
    grep -rn "$hex" src/ prisma/ --include="*.tsx" --include="*.ts" 2>/dev/null | sed 's/^/        /'
    REMAINING=$((REMAINING + COUNT))
  fi
done

if [ "$REMAINING" -eq 0 ]; then
  echo "   🎉 Todas las clases y hex obsoletos fueron eliminados de src/"
else
  echo ""
  echo "   ⚠️  Quedan $REMAINING ocurrencia(s). Revisar manualmente los archivos arriba."
fi

echo ""

# ────────────────────────────────────────────────
# PASO 4: SQL para actualizar la BD en producción
# ────────────────────────────────────────────────
echo "📝 Paso 4 — Generando SQL para actualizar datos en BD..."
echo ""

SQL_FILE="$BACKUP_DIR/update-service-colors.sql"
cat > "$SQL_FILE" << 'SQLEOF'
-- ================================================================
-- Actualizar colores obsoletos en tabla Service
-- Ejecutar EN PRODUCCIÓN después de actualizar el código
-- ================================================================

BEGIN;

-- Navy (#0F1B2D) → Negro Suave (#1A1A1A)
UPDATE "Service" SET color = '#1A1A1A' WHERE color = '#0F1B2D';
UPDATE "Service" SET color = '#1A1A1A' WHERE color = '#0f1b2d';

-- Gold (#C8A951) → Terracota (#9E3A2E)
UPDATE "Service" SET color = '#9E3A2E' WHERE color = '#C8A951';
UPDATE "Service" SET color = '#9E3A2E' WHERE color = '#c8a951';

-- Cuban Red (#CC2936) → Terracota Oscuro (#7A2A1E)
UPDATE "Service" SET color = '#7A2A1E' WHERE color = '#CC2936';
UPDATE "Service" SET color = '#7A2A1E' WHERE color = '#cc2936';

-- Navy Light (#1A2A42) → Gris Oscuro (#2D2D2D)
UPDATE "Service" SET color = '#2D2D2D' WHERE color = '#1A2A42';
UPDATE "Service" SET color = '#2D2D2D' WHERE color = '#1a2a42';

-- Verificación
SELECT id, title, color FROM "Service" ORDER BY "order";

COMMIT;
SQLEOF

echo "   ✅ SQL generado: $SQL_FILE"
echo ""

# ────────────────────────────────────────────────
# RESUMEN
# ────────────────────────────────────────────────
echo "================================================"
echo "  📊 RESUMEN"
echo "================================================"
echo "  Archivos modificados: ver detalle arriba"
echo "  Total reemplazos: ~$TOTAL_CHANGES"
echo "  Backup guardado en: $BACKUP_DIR/"
echo "  SQL para BD: $SQL_FILE"
echo ""
echo "  ⏭️  SIGUIENTES PASOS:"
echo ""
echo "  1. Revisar los cambios: git diff"
echo "  2. Ejecutar lint: bun run lint"
echo "  3. Iniciar dev server: bun run dev"
echo "  4. Verificar visualmente en:"
echo "     - Home → Servicio cards (iconos de color)"
echo "     - Consultas → Pestaña 'Por NIRE' (tab activo)"
echo "     - Consultas → Tabla de resultados (header)"
echo "     - Normatividad → Arancel (título)"
echo "     - Trámites → Constitución pasos (título)"
echo "     - Trámites → Inversión Extranjera (título)"
echo "     - Estadísticas → Gráfico de Sociedades (título)"
echo "  5. Si todo OK, ejecutar SQL en producción:"
echo "     docker exec -i registro-mercantil-postgres \\"
echo "       psql -U portal_rmc -d registro_mercantil < $SQL_FILE"
echo "  6. Re-seedar si es desarrollo:"
echo "     bun run db:reset"
echo "================================================"