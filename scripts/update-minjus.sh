#!/usr/bin/env bash

# Permite ejecutar también `sh scripts/update-minjus.sh` en servidores donde
# el operador no use el intérprete indicado por el shebang.
if [ -z "${BASH_VERSION:-}" ]; then
  command -v bash >/dev/null 2>&1 || {
    printf '%s\n' '[ERROR] Este script requiere Bash.' >&2
    exit 1
  }
  exec bash "$0" "$@"
fi

set -Eeuo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
APP_CONTAINER="${APP_CONTAINER:-registro-mercantil-app}"
DB_CONTAINER="${DB_CONTAINER:-registro-mercantil-postgres}"
DB_USER="${DB_USER:-portal_rmc}"
DB_NAME="${DB_NAME:-registro_mercantil}"
APP_URL="${APP_URL:-http://localhost:3003}"
MIGRATIONS=(
  "${PROJECT_ROOT}/prisma/migrations/20260820_minjus_content_update/migration.sql"
  "${PROJECT_ROOT}/prisma/migrations/20260820_normative_portal_update/migration.sql"
)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { printf '%b\n' "${GREEN}[OK]${NC} $*"; }
warn() { printf '%b\n' "${YELLOW}[WARN]${NC} $*"; }
fail() { printf '%b\n' "${RED}[ERROR]${NC} $*" >&2; exit 1; }
phase() { printf '\n%b\n' "${CYAN}== $* ==${NC}"; }

cd "$PROJECT_ROOT"

command -v docker >/dev/null || fail "Docker no está instalado."
command -v bun >/dev/null || fail "Bun no está instalado."
for migration in "${MIGRATIONS[@]}"; do
  [ -f "$migration" ] || fail "No existe la migración: $migration"
done

phase "1. Preflight"
docker inspect "$APP_CONTAINER" >/dev/null 2>&1 || fail "No existe el contenedor $APP_CONTAINER."
docker inspect "$DB_CONTAINER" >/dev/null 2>&1 || fail "No existe el contenedor $DB_CONTAINER."
docker start "$DB_CONTAINER" >/dev/null 2>&1 || true
docker exec "$DB_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null \
  || fail "PostgreSQL no responde."
log "PostgreSQL disponible"

phase "2. Backup y migración"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups/minjus}"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/registro_mercantil_$(date +%Y%m%d_%H%M%S).dump"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc > "$BACKUP_FILE"
log "Backup creado: $BACKUP_FILE"

for migration in "${MIGRATIONS[@]}"; do
  docker exec -i "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" < "$migration"
  log "Migración aplicada: $(basename "$(dirname "$migration")")"
done

phase "3. Validación del código"
bunx tsc --noEmit
log "TypeScript válido"
bun run lint
log "Lint válido"
bun run build
log "Build generado"

phase "4. Despliegue"
docker cp .next/standalone/. "$APP_CONTAINER:/app/"
docker cp public/. "$APP_CONTAINER:/app/public/"
docker restart "$APP_CONTAINER" >/dev/null

for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if curl --fail --silent --show-error "$APP_URL" >/dev/null; then
    log "Portal disponible en $APP_URL"
    break
  fi
  [ "$attempt" -eq 10 ] && fail "El portal no respondió después del reinicio."
  sleep 2
done

phase "5. Verificación de datos"
docker exec "$DB_CONTAINER" psql -X -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" -c \
  "SELECT title FROM \"Service\" WHERE title IN ('Solicitud de Primera Inscripción de un Sujeto', 'Estado de Situación');" \
  | tee /tmp/minjus-verification.txt
grep -q 'Solicitud de Primera Inscripción de un Sujeto' /tmp/minjus-verification.txt \
  || fail "No se encontró el servicio de Primera Inscripción."
docker exec "$DB_CONTAINER" psql -X -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" -c \
  "SELECT title, type, \"effectiveDate\" FROM \"Regulation\" WHERE visible = true ORDER BY \"order\";"
docker exec "$DB_CONTAINER" psql -X -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" -c \
  "SELECT label, value, suffix FROM \"Statistic\" WHERE label LIKE 'Granma:%' ORDER BY \"order\";"
log "Contenido MINJUS verificado"
log "Despliegue completado"
