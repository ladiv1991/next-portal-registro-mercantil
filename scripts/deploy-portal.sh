#!/bin/bash
#
# deploy-portal.sh — Despliegue del portal del Registro Mercantil
# Compatible con: Docker Compose (servidor) y modo fallback (sin Docker)
#
# Uso:
#   bash scripts/deploy-portal.sh [DOMINIO] [scheme]
#   bash scripts/deploy-portal.sh portal-registromercantil.test.xutil.cu https
#   bash scripts/deploy-portal.sh localhost http
#
# Variables de entorno:
#   PROJECT_DIR         Directorio del proyecto (default: script dir/..)
#   DATABASE_URL        Connection string PostgreSQL (hereda de .env)
#   JWT_SECRET          JWT secret (hereda de .env)
#   USE_DOCKER          true/false — fuerza modo Docker (default: auto)
#   SEED_DATABASE       Sembrar BD (default: true)
#

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${PROJECT_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"

DOMAIN="${1:-portal-registromercantil.test.xutil.cu}"
SCHEME="${2:-http}"
export PORTAL_DOMAIN="$DOMAIN"
export PORTAL_SCHEME="$SCHEME"
export NEXT_PUBLIC_APP_URL="${SCHEME}://${DOMAIN}"
export NEXTAUTH_URL="${NEXT_PUBLIC_APP_URL}"

APP_PORT=3003
PG_PORT=5433

die() { echo "❌ $*" >&2; exit 1; }
info() { echo "✅ $*"; }
warn() { echo "⚠️  $*" >&2; }

# ── Cargar .env ─────────────────────────────────────────────
[[ -f "$PROJECT_DIR/.env" ]] || die "No se encontró $PROJECT_DIR/.env"
set -a
source "$PROJECT_DIR/.env"
set +a

# ── Verificar dependencias críticas ──────────────────────────
has_command() { command -v "$1" >/dev/null 2>&1; }

if [[ "${USE_DOCKER:-auto}" == "true" ]] || { [[ "${USE_DOCKER:-auto}" == "auto" ]] && has_command docker; }; then
    MODE="docker"
    info "Modo: Docker Compose"
else
    MODE="standalone"
    info "Modo: Standalone (sin Docker)"
fi

# ── Configurar dominio en .env si no existe ─────────────────
if ! grep -q "^PORTAL_DOMAIN=" "$PROJECT_DIR/.env" 2>/dev/null; then
    echo "PORTAL_DOMAIN=$DOMAIN" >> "$PROJECT_DIR/.env"
    echo "PORTAL_SCHEME=$SCHEME" >> "$PROJECT_DIR/.env"
    echo "NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL" >> "$PROJECT_DIR/.env"
    echo "NEXTAUTH_URL=$NEXTAUTH_URL" >> "$PROJECT_DIR/.env"
    info "Dominio configurado en .env: $NEXT_PUBLIC_APP_URL"
fi

# ── DEPLOY ──────────────────────────────────────────────────
if [[ "$MODE" == "docker" ]]; then
    # ── Docker Compose ──────────────────────────────────────
    COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_DIR/docker-compose.yml}"
    [[ -f "$COMPOSE_FILE" ]] || die "No se encontró $COMPOSE_FILE"

    export APP_CONTAINER="registro-mercantil-app"
    export POSTGRES_CONTAINER="registro-mercantil-postgres"

    info "Construyendo imagen..."
    docker compose -f "$COMPOSE_FILE" build

    info "Deteniendo servicio anterior..."
    docker compose -f "$COMPOSE_FILE" down

    info "Iniciando contenedores..."
    docker compose -f "$COMPOSE_FILE" up -d

    info "Esperando saludabilidad..."
    for i in $(seq 1 60); do
        if docker exec "$APP_CONTAINER" wget -qO- "http://localhost:3000/api/health" >/dev/null 2>&1; then
            info "App saludable"
            break
        fi
        [[ $i -eq 60 ]] && die "Timeout esperando app"
        sleep 2
    done

    # Verificar endpoints
    info "Verificando endpoints..."
    for path in "/api/public/content" "/api/captcha/new" "/api/stats" "/api/search?q=test"; do
        status=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${APP_PORT}${path}" 2>/dev/null || echo "000")
        if [[ "$status" == "200" ]]; then
            info "  ${path} → ${status} ✓"
        else
            warn "  ${path} → ${status}"
        fi
    done

    # Traefik admin
    info "Traefik admin: http://localhost:8082"

else
    # ── Standalone (npm + pm2) ──────────────────────────────
    info "Instalando dependencias..."
    cd "$PROJECT_DIR"
    npm ci --ignore-scripts --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund

    info "Generando Prisma client..."
    npx prisma generate

    info "Ejecutando migraciones..."
    node scripts/run-migrations.js

    if [[ "${SEED_DATABASE:-true}" == "true" ]]; then
        info "Sembrando base de datos..."
        node prisma/seed.ts 2>/dev/null || true
        node prisma/seed-guides.ts 2>/dev/null || true
    fi

    info "Construyendo producción..."
    npx next build

    info "Iniciando servidor en puerto ${APP_PORT}..."
    export PORT="$APP_PORT"
    export NODE_ENV="production"
    node .next/standalone/server.js &
    SERVER_PID=$!
    echo "$SERVER_PID" > "$PROJECT_DIR/.next/server.pid"

    # Esperar a que el servidor responda
    info "Esperando servidor..."
    for i in $(seq 1 30); do
        if curl -s -o /dev/null "http://localhost:${APP_PORT}/api/health" 2>/dev/null; then
            info "Servidor listo en http://localhost:${APP_PORT}"
            break
        fi
        [[ $i -eq 30 ]] && warn "Timeout, verificando PID $SERVER_PID"
        sleep 1
    done

    # Verificar endpoints
    info "Verificando endpoints..."
    for path in "/api/public/content" "/api/captcha/new" "/api/stats"; do
        status=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${APP_PORT}${path}" 2>/dev/null || echo "000")
        if [[ "$status" == "200" ]]; then
            info "  ${path} → ${status} ✓"
        else
            warn "  ${path} → ${status}"
        fi
    done

    info "PID del servidor: $SERVER_PID"
    info "Para detener: kill $(cat $PROJECT_DIR/.next/server.pid) o bash scripts/deploy-portal.sh stop"
fi

# ── Resumen final ───────────────────────────────────────────
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  Despliegue completado — $MODE                        ║"
echo "║                                                        ║"
echo "║  App:       ${NEXT_PUBLIC_APP_URL}                      ║"
echo "║  Dominio:   ${DOMAIN}                                 ║"
echo "║  Scheme:    ${SCHEME}                                 ║"
echo "║  Modo:      ${MODE}                                   ║"
if [[ "$MODE" == "docker" ]]; then
    echo "║  Traefik:   http://localhost:8082                     ║"
fi
echo "╚════════════════════════════════════════════════════════╝"
echo ""
info "Logs: docker compose logs -f  (Docker) | tail -f .next/build.log (Standalone)"
info "Detener: bash scripts/deploy-portal.sh stop"
