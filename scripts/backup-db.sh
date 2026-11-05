#!/usr/bin/env bash
# Automated Postgres backup — runs daily via cron or as a one-shot.
# Usage:
#   bash scripts/backup-db.sh              # defaults: last 7 days retention
#   bash scripts/backup-db.sh 30           # keep last 30 days
#   bash scripts/backup-db.sh --help       # show help
#
# Integrates with docker-compose: uses the postgres container directly.
# Backup files go to ./backups/ (gitignored).

set -euo pipefail

RETENTION_DAYS="${1:-7}"
BACKUP_DIR="$(cd "$(dirname "$0")/../backups" && pwd)"
TIMESTAMP="$(date +%Y%m%dT%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/postgres-backup-${TIMESTAMP}.sql.gz"
PG_CONTAINER="registro-mercantil-postgres"

log() { echo "[$(date '+%F %T')] $*"; }

usage() {
  echo "Usage: $0 [RETENTION_DAYS]"
  echo "  Default retention: ${RETENTION_DAYS} days"
  echo ""
  echo "Examples:"
  echo "  $0            # use 7-day retention"
  echo "  $0 30         # keep 30 days of backups"
  exit 0
}

[[ "${1:-}" == "--help" ]] && usage

mkdir -p "${BACKUP_DIR}"

if ! command -v docker &>/dev/null; then
  log "ERROR: docker is not installed or not in PATH"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qw "${PG_CONTAINER}"; then
  log "ERROR: container '${PG_CONTAINER}' is not running"
  exit 1
fi

log "Starting backup to ${BACKUP_FILE} ..."
docker exec "${PG_CONTAINER}" pg_dump \
  -U portal_rmc \
  -d registro_mercantil \
  --clean \
  --if-exists \
  --create \
  --no-owner \
  --no-privileges \
  | gzip > "${BACKUP_FILE}"

BACKUP_SIZE="$(du -sh "${BACKUP_FILE}" | cut -f1)"
log "Backup created: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Rotate old backups
log "Rotating backups older than ${RETENTION_DAYS} days ..."
find "${BACKUP_DIR}" -name 'postgres-backup-*.sql.gz' -type f -mtime "+${RETENTION_DAYS}" -delete
log "Rotation complete"

log "Done."