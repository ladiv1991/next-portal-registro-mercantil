#!/bin/bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${PROJECT_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_DIR/docker-compose.yml}"
APP_CONTAINER="registro-mercantil-app"
POSTGRES_CONTAINER="registro-mercantil-postgres"
ENV_FILE="$PROJECT_DIR/.env"
SEED_DATABASE="${SEED_DATABASE:-true}"
BACKUP_BEFORE_DEPLOY="${BACKUP_BEFORE_DEPLOY:-true}"
DOCKER_REGISTRY_MODE="${DOCKER_REGISTRY_MODE:-auto}"

die() {
    echo "❌ $*" >&2
    exit 1
}

require_command() {
    command -v "$1" >/dev/null 2>&1 || die "No se encontró el comando requerido: $1"
}

read_env_value() {
    local key="$1"
    [[ -f "$ENV_FILE" ]] || return 0
    sed -n "s/^${key}=//p" "$ENV_FILE" | head -n 1
}

configure_docker_registry() {
    local configured_registry
    local registry_host
    local status

    case "$DOCKER_REGISTRY_MODE" in
        public)
            export DOCKER_REGISTRY=""
            echo "🐳 Registro Docker: Docker Hub público"
            ;;
        private)
            configured_registry="$(read_env_value DOCKER_REGISTRY)"
            [[ -n "$configured_registry" ]] || die "DOCKER_REGISTRY_MODE=private requiere DOCKER_REGISTRY en $ENV_FILE"
            export DOCKER_REGISTRY="$configured_registry"
            echo "🐳 Registro Docker privado: $configured_registry"
            ;;
        auto)
            configured_registry="$(read_env_value DOCKER_REGISTRY)"
            if [[ -z "$configured_registry" ]]; then
                export DOCKER_REGISTRY=""
                echo "🐳 Registro Docker: Docker Hub público"
                return
            fi

            registry_host="${configured_registry#http://}"
            registry_host="${registry_host#https://}"
            registry_host="${registry_host%%/*}"
            status="$(curl -k -sS --connect-timeout 5 --max-time 10 -o /dev/null -w '%{http_code}' "https://${registry_host}/v2/" || true)"
            if [[ "$status" != "000" ]]; then
                export DOCKER_REGISTRY="$configured_registry"
                echo "🐳 Registro Docker privado disponible ($registry_host, HTTP $status)"
            else
                export DOCKER_REGISTRY=""
                echo "⚠️  Registro privado no accesible: $registry_host"
                echo "   Se usará Docker Hub público para node, postgres y traefik."
                echo "   Para obligar el registro privado: DOCKER_REGISTRY_MODE=private bash scripts/deploy.sh"
            fi
            ;;
        *)
            die "DOCKER_REGISTRY_MODE debe ser auto, public o private"
            ;;
    esac
}

upsert_env() {
    local key="$1"
    local value="$2"
    touch "$ENV_FILE"
    if grep -q "^${key}=" "$ENV_FILE"; then
        sed -i "s#^${key}=.*#${key}=${value}#" "$ENV_FILE"
    else
        printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
    fi
}

wait_for_postgres() {
    echo "⏳ Esperando PostgreSQL..."
    for attempt in {1..30}; do
        if docker exec "$POSTGRES_CONTAINER" pg_isready -U portal_rmc -d registro_mercantil >/dev/null 2>&1; then
            echo "✅ PostgreSQL está listo"
            return
        fi
        sleep 2
    done
    docker compose -f "$COMPOSE_FILE" logs postgres --tail 40 || true
    die "PostgreSQL no estuvo disponible a tiempo"
}

echo "================================================"
echo "  🚀 Despliegue del Portal del Registro Mercantil"
echo "================================================"
echo ""

require_command docker
require_command curl
docker compose version >/dev/null 2>&1 || die "Docker Compose no está disponible"

cd "$PROJECT_DIR"
configure_docker_registry

if [[ -n "${1:-}" ]]; then
    PORTAL_DOMAIN="$1"
else
    read -r -p "🌐 DNS del portal (ej. portal.registromercantil.cu): " PORTAL_DOMAIN
fi

[[ "$PORTAL_DOMAIN" =~ ^[A-Za-z0-9.-]+$ ]] || die "El DNS contiene caracteres no válidos"
[[ "$PORTAL_DOMAIN" != .* && "$PORTAL_DOMAIN" != *..* ]] || die "El DNS no es válido: $PORTAL_DOMAIN"

PORTAL_SCHEME="${PORTAL_SCHEME:-http}"
[[ "$PORTAL_SCHEME" == "http" || "$PORTAL_SCHEME" == "https" ]] || die "PORTAL_SCHEME debe ser http o https"

echo ""
echo "Dominio configurado: ${PORTAL_SCHEME}://${PORTAL_DOMAIN}"
echo "Traefik enrutará únicamente ese Host. El registro DNS debe apuntar a la IP de este servidor."
read -r -p "¿Continuar con el despliegue? [s/N]: " confirmation
[[ "$confirmation" =~ ^[sS](i|í|Í)?$ ]] || die "Despliegue cancelado"

echo ""
echo "🔧 Guardando configuración para Compose y Next.js..."
upsert_env "PORTAL_DOMAIN" "$PORTAL_DOMAIN"
upsert_env "PORTAL_SCHEME" "$PORTAL_SCHEME"
upsert_env "NEXT_PUBLIC_APP_URL" "${PORTAL_SCHEME}://${PORTAL_DOMAIN}"
echo "✅ $ENV_FILE actualizado"

echo ""
echo "🔍 Validando configuración de Docker Compose..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" config >/dev/null

if [[ "$BACKUP_BEFORE_DEPLOY" == "true" ]] && docker ps --format '{{.Names}}' | grep -qx "$POSTGRES_CONTAINER"; then
    echo "💾 Creando backup antes de migrar..."
    bash "$PROJECT_DIR/scripts/backup-db.sh"
fi

echo "📦 Construyendo imagen de la aplicación..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build app

echo "🐘 Iniciando PostgreSQL..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres
wait_for_postgres

echo "🗃️ Ejecutando migraciones Prisma..."
if [[ "$SEED_DATABASE" == "true" ]]; then
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm app npm run db:migrate:all:seed
else
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm app npm run db:migrate:all
fi
echo "✅ Migraciones completadas"

echo "🔄 Publicando app y Traefik..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --no-build app traefik

echo "⏳ Esperando la aplicación..."
for attempt in {1..30}; do
    if curl -fsS "http://127.0.0.1:3003/api/auth/me" >/dev/null 2>&1; then
        break
    fi
    [[ "$attempt" -eq 30 ]] && die "La app no respondió. Consulte: docker compose logs app"
    sleep 2
done

echo "✅ Aplicación disponible en http://127.0.0.1:3003"
echo "✅ Dominio configurado: ${PORTAL_SCHEME}://${PORTAL_DOMAIN}"
echo ""
echo "📋 Estado final:"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
echo ""
echo "🎉 Despliegue, migraciones y configuración de dominio completados"
