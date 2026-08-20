#!/bin/bash
# backup-db.sh - Script para backup automático de la base de datos
# Uso: ./scripts/backup-db.sh

set -e  # Salir en caso de error

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

echo "📦 Creando backup de la base de datos..."
echo "📁 Archivo: $BACKUP_FILE"

# Verificar que el contenedor PostgreSQL esté ejecutándose
if ! docker ps | grep -q registro-mercantil-postgres; then
    echo "❌ Error: Contenedor PostgreSQL no está ejecutándose"
    echo "💡 Ejecuta: docker compose up -d postgres"
    exit 1
fi

# Crear backup comprimido
docker exec registro-mercantil-postgres pg_dump -U portal_rmc -d registro_mercantil | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup completado exitosamente"
    echo "📊 Tamaño: $(du -h $BACKUP_FILE | cut -f1)"
    echo "📅 Fecha: $(date)"
    
    # Mantener solo los últimos 10 backups
    echo "🧹 Limpiando backups antiguos..."
    cd $BACKUP_DIR
    ls -t backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f
    echo "✅ Backups antiguos eliminados (manteniendo últimos 10)"
    
    echo ""
    echo "💡 Para restaurar este backup:"
    echo "   bun run db:restore $BACKUP_FILE"
else
    echo "❌ Error al crear el backup"
    rm -f $BACKUP_FILE 2>/dev/null || true
    exit 1
fi