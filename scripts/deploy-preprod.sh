#!/usr/bin/env bash
# ============================================================
# deploy-preprod.sh — Despliegue completo para preproducción
# ============================================================
# Uso local (desde tu máquina):
#   bash scripts/deploy-preprod.sh
#
# Uso en el servidor pre-prod (pull + start):
#   bash scripts/deploy-preprod.sh --server
#
# Variables de entorno (todas opcionales, se preguntan si faltan):
#   TAG                Tag de la imagen (default: latest)
#   HARBOR_REGISTRY    Repositorio Harbor (default: registry.dev.xetid.cu/portales-web)
#   SEED_DATABASE      true/false — ejecuta seed de la base (default: false)
#   PUSH               true/false — publica en Harbor (default: true)
#   PREPROD_SCHEME     http o https (default: https)
#   PREPROD_DOMAIN     Dominio principal
#   PREPROD_DOMAINS    Lista de dominios permitidos (comas)
#   DB_PASSWORD        Contraseña PostgreSQL
#   JWT_SECRET         JWT secret (mínimo 32 chars)
#   PROJECT_DIR        Directorio del proyecto en el servidor (default: /opt/portal-mercantil)
# ============================================================

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

MODE="local"   # local | server
SERVER_DIR="/opt/portal-mercantil"

# ── Parsear argumentos ─────────────────────────────────────
for arg in "$@"; do
    case "$arg" in
        --server) MODE="server" ;;
        --dir=*)  SERVER_DIR="${arg#*=}" ;;
        *)        echo "Uso: $0 [--server] [--dir=/path]" >&2; exit 1 ;;
    esac
done

die()  { echo "❌ $*" >&2; exit 1; }
info() { echo "✅ $*"; }
step() { echo ""; echo "▶ $*"; }

ask() {
    local var="$1" question="$2" default="$3" answer
    if [[ -n "${!var:-}" ]]; then return; fi
    if [[ -t 0 ]]; then
        read -r -p "$question [$default]: " answer
    else
        answer="$default"
    fi
    printf -v "$var" '%s' "${answer:-$default}"
    export "${var?}"
}

# ────────────────────────────────────────────────────────────
# MODO SERVIDOR: solo pull + restart
# ────────────────────────────────────────────────────────────
if [[ "$MODE" == "server" ]]; then
    step "Modo servidor — desplegando en $SERVER_DIR"

    [[ -d "$SERVER_DIR" ]] || die "Directorio $SERVER_DIR no existe"
    cd "$SERVER_DIR"

    TAG="${TAG:-latest}"
    HARBOR_REGISTRY="${HARBOR_REGISTRY:-registry.dev.xetid.cu/portales-web}"
    FULL_IMAGE="${HARBOR_REGISTRY%/}/portal-rmc:${TAG}"

    info "Pulling $FULL_IMAGE ..."
    docker pull "$FULL_IMAGE" || die "No se pudo pull de $FULL_IMAGE"

    info "Aplicando .env (si existe)..."
    [[ -f .env ]] || die ".env no encontrado en $SERVER_DIR"

    info "Reiniciando contenedor app ..."
    docker compose up -d --no-deps app || die "Fallo docker compose up"

    echo "   Esperando /api/health ..."
    for i in $(seq 1 30); do
        if curl -fsS "http://127.0.0.1:3003/api/health" >/dev/null 2>&1; then
            break
        fi
        sleep 3
    done

    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  🏁 DESPLEGUE EN PRE-PRODUCCIÓN COMPLETADO"
    echo "═══════════════════════════════════════════════════════"
    echo "  Imagen:     $FULL_IMAGE"
    echo "  Dir:        $SERVER_DIR"
    echo "  Health:     http://127.0.0.1:3003/api/health"
    echo "  Logs:       docker compose logs -f app"
    echo "═══════════════════════════════════════════════════════"
    exit 0
fi

# ────────────────────────────────────────────────────────────
# MODO LOCAL: build + push + test
# ────────────────────────────────────────────────────────────
cd "$PROJECT_DIR"

# ── 0. Preflight ────────────────────────────────────────────
step "Verificando prerequisitos"
docker info --format '{{.ServerVersion}}' >/dev/null 2>&1 || die "Docker no está corriendo"
docker compose version >/dev/null 2>&1 || die "Docker Compose no disponible"
command -v bun >/dev/null 2>&1 || die "bun no está instalado"
command -v curl >/dev/null 2>&1 || die "curl no está instalado"
info "Docker $(docker info --format '{{.ServerVersion}}') · bun $(bun --version)"

# ── 1. Recopilar configuraciones ────────────────────────────
step "Configuración de preproducción"

EXISTING_PG_PASS="$(docker inspect registro-mercantil-postgres --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null | grep '^POSTGRES_PASSWORD=' | cut -d= -f2- || true)"

ask TAG "Tag de la imagen" "latest"
DEFAULT_REGISTRY="$(sed -n 's/^HARBOR_REGISTRY=//p' "$ENV_FILE" 2>/dev/null | head -n1 || true)"
ask HARBOR_REGISTRY "Repositorio Harbor" "${DEFAULT_REGISTRY:-registry.dev.xetid.cu/portales-web}"
ask SEED_DATABASE "¿Ejecutar seed de la base de datos? (s/n)" "n"
ask PUSH "¿Publicar imagen en Harbor al terminar? (s/n)" "s"

SEED=false
[[ "$SEED_DATABASE" =~ ^(s|si|sí|y|yes|true)$ ]] && SEED=true

DO_PUSH=false
[[ "$PUSH" =~ ^(s|si|sí|y|yes|true)$ ]] && DO_PUSH=true

ask PREPROD_SCHEME "Esquema (http/https)" "https"
ask PREPROD_DOMAIN "Dominio principal (HOST)" "portal-registromercantil.test.xutil.cu"
ask PREPROD_DOMAINS "Dominios permitidos (comas)" "portal-registromercantil.test.xutil.cu,portal-registromercantil.egob.dev.xetid.cu"
EXISTING_DB_DEFAULT="PortalRMC2026!Secure"
[[ -n "$EXISTING_PG_PASS" ]] && EXISTING_DB_DEFAULT="$EXISTING_PG_PASS"
ask DB_PASSWORD "Contraseña PostgreSQL (se usará en Docker y para migraciones)" "$EXISTING_DB_DEFAULT"
ask JWT_SECRET "JWT Secret (mínimo 32 chars)" "$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || echo "$(date +%s%N | sha256sum | head -c 32)")"

FULL_IMAGE="${HARBOR_REGISTRY%/}/portal-rmc:${TAG}"
echo "   Tag:       $TAG"
echo "   Harbor:    $FULL_IMAGE"
echo "   Scheme:    $PREPROD_SCHEME"
echo "   Dominio:   $PREPROD_DOMAIN"
echo "   Seed:      $SEED  ·  Push: $DO_PUSH"

# ── 2. Generar .env ─────────────────────────────────────────
step "Generando/actualizando .env"
declare -A OVERRIDE_KEYS
for k in DATABASE_URL DB_PROVIDER POSTGRES_PASSWORD JWT_SECRET \
         UPLOAD_MAX_FILE_MB UPLOAD_MAX_IMAGE_MB UPLOAD_MAX_DOCUMENT_MB UPLOAD_MAX_VIDEO_MB \
         PORTAL_SCHEME PORTAL_DOMAIN PORTAL_DOMAINS \
         NEXT_PUBLIC_APP_URL NEXTAUTH_URL TRAEFIK_HOST \
         DOCKER_REGISTRY HARBOR_REGISTRY; do
    OVERRIDE_KEYS[$k]=1
done

{
    echo "# ============================================================"
    echo "# Registro Mercantil de Cuba — Variables de Entorno (Preproducción)"
    echo "# Generado automáticamente por scripts/deploy-preprod.sh"
    echo "# ============================================================"
    echo ""
    echo "# Base de datos — PostgreSQL (dentro de Docker usa service 'postgres:5432')"
    echo "DATABASE_URL=postgresql://portal_rmc:${DB_PASSWORD}@postgres:5432/registro_mercantil"
    echo "DB_PROVIDER=postgresql"
    echo "POSTGRES_PASSWORD=${DB_PASSWORD}"
    echo ""
    echo "# Autenticación — JWT"
    echo "JWT_SECRET=${JWT_SECRET}"
    echo ""
    echo "# Uploads — límites en megabytes"
    echo "UPLOAD_MAX_FILE_MB=5"
    echo "UPLOAD_MAX_IMAGE_MB=5"
    echo "UPLOAD_MAX_DOCUMENT_MB=20"
    echo "UPLOAD_MAX_VIDEO_MB=100"
    echo ""
    echo "# Portal — dominio y esquema"
    echo "PORTAL_SCHEME=${PREPROD_SCHEME}"
    echo "PORTAL_DOMAIN=${PREPROD_DOMAIN}"
    echo "PORTAL_DOMAINS=${PREPROD_DOMAINS}"
    echo "NEXT_PUBLIC_APP_URL=${PREPROD_SCHEME}://${PREPROD_DOMAIN}"
    echo "NEXTAUTH_URL=${PREPROD_SCHEME}://${PREPROD_DOMAIN}"
    echo "TRAEFIK_HOST=${PREPROD_DOMAIN}"
    echo ""
    echo "# Registro Docker privado (Harbor)"
    echo "DOCKER_REGISTRY="
    echo "HARBOR_REGISTRY=${HARBOR_REGISTRY%/}"
} > "$ENV_FILE.new"

if [[ -f "$ENV_FILE" ]]; then
    while IFS= read -r line; do
        [[ -z "$line" || "$line" == \#* ]] && continue
        key="${line%%=*}"
        [[ -n "${OVERRIDE_KEYS[$key]+x}" ]] && continue
        echo "$line" >> "$ENV_FILE.new"
    done < "$ENV_FILE"
fi

mv "$ENV_FILE.new" "$ENV_FILE"
chmod 600 "$ENV_FILE"
info ".env guardado en $ENV_FILE"

# ── 3. Probar conectividad DB ──────────────────────────────
step "Verificando conectividad a PostgreSQL"
HOST_DB_URL="postgresql://portal_rmc:${DB_PASSWORD}@127.0.0.1:5433/registro_mercantil"
PG_HOST_CONTAINER="$(docker compose ps --format '{{.Name}}' | grep -i postgres | head -n1 || true)"
if [[ -n "$PG_HOST_CONTAINER" ]] && docker ps | grep -qw "$PG_HOST_CONTAINER"; then
    docker exec "$PG_HOST_CONTAINER" pg_isready -U portal_rmc -d registro_mercantil >/dev/null 2>&1 \
        || die "PostgreSQL no responde. Verifica: docker compose up -d postgres"
    info "PostgreSQL local accesible en el contenedor $PG_HOST_CONTAINER"
else
    info "Sin contenedor postgres local — se asume DB externa para migraciones"
fi

# ── 4. Prisma (host → migraciones contra DB local/externa) ──
step "Generando cliente Prisma y sincronizando esquema"
if [[ -f "$ENV_FILE" ]]; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${HOST_DB_URL}|" "$ENV_FILE"
fi
export DATABASE_URL="$HOST_DB_URL"
if [[ "$SEED" == true ]]; then
    node scripts/run-migrations.js --seed || die "Migraciones o seed fallaron"
else
    node scripts/run-migrations.js || die "Migraciones fallaron"
fi
# Mantener DATABASE_URL apuntando al host para el build (hook prebuild)
info "Base de datos sincronizada"

# ── 5. Build standalone ─────────────────────────────────────
step "Construyendo la aplicación (Next.js standalone)"
bun run build || die "El build falló"
[[ -f .next/standalone/server.js ]] || die "No se generó .next/standalone/server.js"
info "Build listo"

# Restaurar DATABASE_URL a valores de preproducción para docker compose
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://portal_rmc:${DB_PASSWORD}@postgres:5432/registro_mercantil|" "$ENV_FILE"
export DATABASE_URL="postgresql://portal_rmc:${DB_PASSWORD}@postgres:5432/registro_mercantil"

# ── 6. Imagen Docker ────────────────────────────────────────
step "Construyendo imagen Docker"
COMPOSE="docker compose -f $PROJECT_DIR/docker-compose.yml --env-file $ENV_FILE"
$COMPOSE build app || die "docker compose build falló"
LOCAL_IMAGE="$(basename "$PROJECT_DIR" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9_-')-app:latest"
docker image inspect "$LOCAL_IMAGE" >/dev/null 2>&1 || die "No se encontró la imagen local $LOCAL_IMAGE"
info "Imagen local: $LOCAL_IMAGE"

# ── 7. Despliegue local + verificación ──────────────────────
step "Levantando el stack (app + postgres + traefik)"
$COMPOSE down 2>/dev/null || true
$COMPOSE up -d postgres traefik app || die "docker compose up falló"

echo "   Esperando /api/health ..."
for _ in $(seq 1 40); do
    if curl -fsS "http://localhost:3003/api/health" >/dev/null 2>&1; then break; fi
    sleep 2
done

FAILED=0
check() {
    local path="$1" expect="$2" code
    code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3003$path" || echo 000)"
    if [[ "$code" == "$expect" ]]; then
        echo "   ✅ $path → $code"
    else
        echo "   ❌ $path → $code (esperado $expect)"
        FAILED=1
    fi
}
check "/api/health" 200
check "/api/public/content" 200
check "/api/captcha/new" 200
check "/" 200
[[ "$FAILED" == 0 ]] || { $COMPOSE logs app --tail 30; die "Verificación local falló — no se publica la imagen"; }
info "Despliegue local verificado en http://localhost:3003"

# ── 8. Publicación en Harbor ────────────────────────────────
if [[ "$DO_PUSH" != true ]]; then
    info "Push omitido"
else
    step "Publicando en Harbor"
    docker tag "$LOCAL_IMAGE" "$FULL_IMAGE"
    if ! docker push "$FULL_IMAGE" 2>&1 | tee /tmp/rmc-push.log; then
        die "Push falló. Verifique 'docker login ${HARBOR_REGISTRY%%/*}'"
    fi
    PUSHED_DIGEST="$(sed -n 's/.*digest: \(sha256:[a-f0-9]*\).*/\1/p' /tmp/rmc-push.log | tail -n1)"
    docker manifest inspect "$FULL_IMAGE" >/dev/null 2>&1 || die "El registro no devuelve el manifest de $FULL_IMAGE"
    info "Imagen disponible en Harbor: $FULL_IMAGE${PUSHED_DIGEST:+ (digest $PUSHED_DIGEST)}"
fi

# ── 9. Resumen final ────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🏁 Despliegue PREPRODUCCIÓN COMPLETADO"
echo "═══════════════════════════════════════════════════════"
echo "  Dominio:      $PREPROD_SCHEME://$PREPROD_DOMAIN"
echo "  App local:    http://localhost:3003"
[[ "$DO_PUSH" == true ]] && echo "  Harbor:       $FULL_IMAGE"
echo ""
echo "  Credenciales seed (si SEED=true):"
echo "    admin@registromercantil.cu / Admin2026!"
echo "    editor@registromercantil.cu  / Editor2026!"
echo ""
echo "  Para desplegar en el servidor pre-producción:"
echo "    1. Copiar el proyecto: git pull en $SERVER_DIR"
echo "    2. Ejecutar: bash scripts/deploy-preprod.sh --server"
echo "    3. O manualmente:"
echo "       docker login ${HARBOR_REGISTRY%%/*}"
echo "       docker pull $FULL_IMAGE"
echo "       cd $SERVER_DIR"
echo "       docker compose up -d app"
echo "       curl -fsS http://127.0.0.1:3003/api/health"
echo "═══════════════════════════════════════════════════════"
