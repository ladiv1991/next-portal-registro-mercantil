#!/bin/bash
# Despliegue desde cero — Portal Registro Mercantil de Cuba
# Objetivo: servidor Debian 13 limpio → Docker + app corriendo
# Uso: sudo bash deploy-debian13.sh
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || error "Ejecutar como root: sudo bash $0"

DEPLOY_DIR="${DEPLOY_DIR:-/opt/registro-mercantil}"
REPO_URL="${REPO_URL:-https://github.com/voacosta/next-portal-registro-mercantil.git}"
BRANCH="${BRANCH:-main}"
PORTAL_DOMAIN="${PORTAL_DOMAIN:-$(hostname -I | awk '{print $1}')}"
PORTAL_SCHEME="${PORTAL_SCHEME:-http}"

# --- 1. Dependencias del sistema ---
info "Actualizando sistema e instalando dependencias..."
apt-get update -qq
apt-get install -y -qq curl git wget gnupg2 lsb-release ca-certificates apt-transport-https > /dev/null

# --- 2. Docker ---
if ! command -v docker &>/dev/null; then
    info "Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
    info "Docker instalado: $(docker --version)"
else
    info "Docker ya instalado: $(docker --version)"
fi

# --- 3. Docker Compose plugin ---
if ! docker compose version &>/dev/null; then
    info "Instalando Docker Compose plugin..."
    apt-get install -y -qq docker-compose-plugin > /dev/null
fi
info "Compose: $(docker compose version --short)"

# --- 4. Clonar repositorio ---
if [[ -d "$DEPLOY_DIR/.git" ]]; then
    info "Repositorio existe en $DEPLOY_DIR, actualizando..."
    cd "$DEPLOY_DIR"
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
else
    info "Clonando repositorio..."
    mkdir -p "$(dirname "$DEPLOY_DIR")"
    git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# --- 5. Archivo .env ---
ENV_FILE="$DEPLOY_DIR/.env"
if [[ ! -f "$ENV_FILE" ]]; then
    info "Generando .env con valores por defecto..."
    POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 20)
    JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 40)

    cat > "$ENV_FILE" <<EOF
# Generado automáticamente por deploy-debian13.sh
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
JWT_SECRET=${JWT_SECRET}
PORTAL_DOMAIN=${PORTAL_DOMAIN}
PORTAL_SCHEME=${PORTAL_SCHEME}
DOCKER_REGISTRY=
HTTP_PROXY=
HTTPS_PROXY=
UPLOAD_MAX_FILE_MB=5
UPLOAD_MAX_IMAGE_MB=5
UPLOAD_MAX_DOCUMENT_MB=20
UPLOAD_MAX_VIDEO_MB=100
EOF
    chmod 600 "$ENV_FILE"
    info ".env creado (chmod 600). Editar si se necesita dominio real o proxy."
else
    warn ".env ya existe, no se sobreescribe. Verificar que tenga POSTGRES_PASSWORD y JWT_SECRET."
fi

# --- 6. Build y arranque ---
info "Construyendo imágenes Docker (primer build ~3-5 min)..."
docker compose build app

info "Levantando servicios..."
docker compose up -d

# --- 7. Esperar salud ---
info "Esperando a que la app esté saludable (timeout 120s)..."
TIMEOUT=120
ELAPSED=0
until docker inspect --format='{{.State.Health.Status}}' registro-mercantil-app 2>/dev/null | grep -q "healthy"; do
    sleep 5
    ELAPSED=$((ELAPSED + 5))
    if [[ $ELAPSED -ge $TIMEOUT ]]; then
        warn "Timeout esperando healthcheck. Verificando logs..."
        docker compose logs --tail=30 app
        error "La app no pasó el healthcheck en ${TIMEOUT}s. Revisar logs arriba."
    fi
    printf "."
done
echo ""

# --- 8. Verificación final ---
APP_PORT=$(docker compose port app 3000 2>/dev/null | cut -d: -f2 || echo "3003")
HEALTH_URL="http://localhost:${APP_PORT}/api/health"

if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
    info "✅ Despliegue exitoso"
    info "   Portal:  ${PORTAL_SCHEME}://${PORTAL_DOMAIN}:${APP_PORT}"
    info "   Traefik: http://${PORTAL_DOMAIN}:8082"
    info "   Health:  $HEALTH_URL"
else
    warn "Health endpoint no responde aún. La app puede estar terminando seed/migraciones."
    warn "Verificar manualmente: curl $HEALTH_URL"
fi

info "Comandos útiles:"
info "  Logs:       cd $DEPLOY_DIR && docker compose logs -f app"
info "  Reiniciar:  cd $DEPLOY_DIR && docker compose restart app"
info "  Actualizar: cd $DEPLOY_DIR && git pull && docker compose build app && docker compose up -d"
info "  DB shell:   cd $DEPLOY_DIR && docker compose exec postgres psql -U portal_rmc -d registro_mercantil"
