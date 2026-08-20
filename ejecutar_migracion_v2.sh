#!/bin/bash
# ============================================================================
# SCRIPT DE EJECUCIÓN: Registro Mercantil de Cuba — Migración v2
# Fecha: 2026-04-30
# ============================================================================
# INSTRUCCIONES:
#   1. Copia este script y los archivos .sql al host donde corre Docker
#   2. Ejecuta: bash ejecutar_migracion_v2.sh
# ============================================================================

set -e

# Configuración de la base de datos
DB_HOST="localhost"
DB_PORT="5433"
DB_NAME="registro_mercantil"
DB_USER="portal_rmc"
DB_PASS='Reg1str0$mc2024!'

# Construir la URL de conexión
DB_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "============================================================"
echo "  MIGRACIÓN v2 — Registro Mercantil de Cuba"
echo "============================================================"
echo ""

# ============================================================================
# PASO 0: ROLLBACK de cualquier transacción abortada
# ============================================================================
echo "[PASO 0] Haciendo ROLLBACK de transacciones abortadas..."
PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "ROLLBACK;" 2>/dev/null || echo "  (No había transacción activa — OK)"
echo "  ✓ ROLLBACK completado"
echo ""

# ============================================================================
# PASO 1: Verificar estado actual de la tabla SearchableName
# ============================================================================
echo "[PASO 1] Verificando estado actual de SearchableName..."
PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'SearchableName'
ORDER BY ordinal_position;
"
echo ""

# ============================================================================
# PASO 2: Ejecutar migración DDL (crear tablas, agregar columnas, índices)
# ============================================================================
echo "[PASO 2] Ejecutando migración DDL (migrate_searchable_names_v2.sql)..."
PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    -f migrate_searchable_names_v2.sql
echo "  ✓ Migración DDL completada"
echo ""

# ============================================================================
# PASO 3: Verificar que las tablas se crearon correctamente
# ============================================================================
echo "[PASO 3] Verificando tablas creadas..."
PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
SELECT 'Province' as tabla, count(*) as registros FROM \"Province\"
UNION ALL
SELECT 'Municipality', count(*) FROM \"Municipality\"
UNION ALL
SELECT 'SearchableName', count(*) FROM \"SearchableName\"
UNION ALL
SELECT 'Modification', count(*) FROM \"Modification\";
"
echo ""

# ============================================================================
# PASO 4: Verificar UNIQUE constraint en nire
# ============================================================================
echo "[PASO 4] Verificando UNIQUE constraint en SearchableName.nire..."
PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
SELECT indexname, indexdef FROM pg_indexes
WHERE tablename = 'SearchableName' AND indexname LIKE '%nire%';
"
echo ""

# ============================================================================
# PASO 5: Importar datos masivos
# ============================================================================
echo "[PASO 5] Importando datos masivos (import_data_registros_mercantiles.sql)..."
echo "  Este paso puede tardar varios minutos (14,366 registros + 936 modificaciones)..."
PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    -f import_data_registros_mercantiles.sql
echo "  ✓ Importación de datos completada"
echo ""

# ============================================================================
# PASO 6: Verificar resultados
# ============================================================================
echo "[PASO 6] Verificando resultados finales..."
PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
SELECT 'Provincias' as tabla, count(*) as total FROM \"Province\"
UNION ALL
SELECT 'Municipios', count(*) FROM \"Municipality\"
UNION ALL
SELECT 'Nombres Buscables', count(*) FROM \"SearchableName\"
UNION ALL
SELECT 'Modificaciones', count(*) FROM \"Modification\";
"
echo ""

PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
SELECT category, status, count(*) as total
FROM \"SearchableName\"
GROUP BY category, status
ORDER BY category, total DESC;
"
echo ""

echo "============================================================"
echo "  ✓ MIGRACIÓN COMPLETADA EXITOSAMENTE"
echo "============================================================"
echo ""
echo "PRÓXIMOS PASOS:"
echo "  1. Copia schema_updated_v2.prisma como tu schema.prisma"
echo "  2. Ejecuta: npx prisma generate"
echo "  3. Reinicia la app: docker compose restart app"
echo ""
