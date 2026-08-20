#!/bin/bash
# restore-db.sh - Script para restaurar base de datos desde backup
# Uso: ./scripts/restore-db.sh <archivo_backup.sql.gz>

set -e  # Salir en caso de error

# Verificar parámetros
if [ -z "$1" ]; then
    echo "❌ Uso: $0 <archivo_backup.sql.gz>"
    echo ""
    echo "📁 Backups disponibles:"
    if [ -d "./backups" ]; then
        ls -la ./backups/backup_*.sql.gz 2>/dev/null || echo "   Ningún backup encontrado en ./backups/"
    else
        echo "   Directorio ./backups/ no existe"
    fi
    echo ""
    echo "💡 Ejemplo: $0 ./backups/backup_20241201_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Archivo no encontrado: $BACKUP_FILE"
    exit 1
fi

# Verificar que sea un archivo .gz
if [[ "$BACKUP_FILE" != *.gz ]]; then
    echo "❌ El archivo debe tener extensión .gz"
    echo "💡 Si tienes un archivo .sql sin comprimir, usa:"
    echo "   docker exec -i registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil < $BACKUP_FILE"
    exit 1
fi

echo "⚠️  ATENCIÓN: Esta acción eliminará todos los datos actuales"
echo "📁 Archivo a restaurar: $BACKUP_FILE"
echo "📊 Tamaño: $(du -h $BACKUP_FILE | cut -f1)"
echo ""

read -p "¿Está seguro de restaurar la base de datos? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operación cancelada por el usuario"
    exit 0
fi

# Verificar que el contenedor PostgreSQL esté ejecutándose
if ! docker ps | grep -q registro-mercantil-postgres; then
    echo "❌ Error: Contenedor PostgreSQL no está ejecutándose"
    echo "💡 Ejecuta: docker compose up -d postgres"
    exit 1
fi

echo ""
echo "🛑 Deteniendo servicios de la aplicación..."
docker compose down app 2>/dev/null || true

echo "🔄 Restaurando base de datos..."
echo "   Esto puede tomar varios minutos dependiendo del tamaño del backup..."

# Restaurar desde backup comprimido
if gunzip -c "$BACKUP_FILE" | docker exec -i registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil 2>/dev/null; then
    echo "✅ Restauración completada exitosamente"
    echo ""
    echo "🚀 Reiniciando servicios de la aplicación..."
    docker compose up -d app 2>/dev/null || true
    echo "✅ Proceso de restauración finalizado"
    echo ""
    echo "💡 Verifica que la aplicación funcione correctamente:"
    echo "   - URL: http://localhost:3008"
    echo "   - Panel admin: http://localhost:3008/admin"
else
    echo "❌ Error durante la restauración"
    echo ""
    echo "🔄 Intentando reiniciar servicios..."
    docker compose up -d app 2>/dev/null || true
    exit 1
fi