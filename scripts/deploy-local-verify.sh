#!/usr/bin/env bash
#
# deploy-local-verify.sh — Despliegue local + verificación + publicación en Harbor
#
# Uso:
#   bash scripts/deploy-local-verify.sh
#
# Pasos: dependencias de entorno → Prisma → build standalone → imagen Docker →
#        contenedor local + checks HTTP → push a Harbor → verificación del manifest.
#
# Variables de entorno (opcionales, si no se preguntan por consola):
#   TAG                Tag de la imagen (default: latest)
#   HARBOR_REGISTRY    Repositorio Harbor (default: valor de .env o registry.dev.xetid.cu/portales-web)
#   SEED_DATABASE      true/false — ejecuta seed (default: false)
#   PUSH               true/false — publica en Harbor (default: pregunta)

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_PORT=3003
COMPOSE="docker compose -f $PROJECT_DIR/docker-compose.yml --env-file $PROJECT_DIR/.env"

die()  { echo "❌ $*" >&2; exit 1; }
info() { echo "✅ $*"; }
step() { echo ""; echo "▶ $*"; }

ask() {
    # ask <variable> <pregunta> <default>
    local var="$1" question="$2" default="$3" answer
    if [[ -n "${!var:-}" ]]; then return; fi
    read -r -p "$question [$default]: " answer
    printf -v "$var" '%s' "${answer:-$default}"
    export "${var?}"
}

cd "$PROJECT_DIR"

# ── 0. Preflight ────────────────────────────────────────────
step "Verificando prerequisitos"
docker info --format '{{.ServerVersion}}' >/dev/null 2>&1 || die "Docker no está corriendo"
docker compose version >/dev/null 2>&1 || die "Docker Compose no disponible"
command -v bun >/dev/null 2>&1 || die "bun no está instalado"
[[ -f .env ]] || die "Falta .env (copie .env.example y complete POSTGRES_PASSWORD y JWT_SECRET)"
info "Docker $(docker info --format '{{.ServerVersion}}') · bun $(bun --version)"

# ── 1. Entradas ─────────────────────────────────────────────
step "Configuración del despliegue"
ask TAG "Tag de la imagen" "latest"
DEFAULT_REGISTRY="$(sed -n 's/^HARBOR_REGISTRY=//p' .env | head -n1)"
ask HARBOR_REGISTRY "Repositorio Harbor" "${DEFAULT_REGISTRY:-registry.dev.xetid.cu/portales-web}"
ask SEED_DATABASE "¿Ejecutar seed de la base de datos? (s/n)" "n"
ask PUSH "¿Publicar imagen en Harbor al terminar? (s/n)" "s"

SEED=false; [[ "$SEED_DATABASE" =~ ^(s|si|sí|y|yes|true)$ ]] && SEED=true
DO_PUSH=false; [[ "$PUSH" =~ ^(s|si|sí|y|yes|true)$ ]] && DO_PUSH=true

FULL_IMAGE="${HARBOR_REGISTRY%/}/portal-rmc:${TAG}"
echo "   Tag: $TAG"
echo "   Harbor: $FULL_IMAGE"
echo "   Seed: $SEED · Push: $DO_PUSH"

# ── 2. Prisma (host, contra la BD configurada en .env) ──────
step "Generando cliente Prisma y sincronizando esquema"
if [[ "$SEED" == true ]]; then
    node scripts/run-migrations.js --seed || die "Migraciones o seed fallaron"
else
    node scripts/run-migrations.js || die "Migraciones fallaron"
fi
info "Base de datos sincronizada"

# ── 3. Build standalone ─────────────────────────────────────
step "Construyendo la aplicación (Next.js standalone)"
bun run build || die "El build falló"
[[ -f .next/standalone/server.js ]] || die "No se generó .next/standalone/server.js"
info "Build listo"

# ── 4. Imagen Docker ────────────────────────────────────────
step "Construyendo imagen Docker"
$COMPOSE build app || die "docker compose build falló"
# Compose nombra la imagen como <proyecto>-<servicio>; `config --images` lista todas y no sirve aquí.
LOCAL_IMAGE="$(basename "$PROJECT_DIR" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9_-')-app:latest"
docker image inspect "$LOCAL_IMAGE" >/dev/null 2>&1 || die "No se encontró la imagen local $LOCAL_IMAGE"
info "Imagen local: $LOCAL_IMAGE"

# ── 5. Despliegue local + verificación ─────────────────────
step "Levantando el stack local"
$COMPOSE up -d postgres traefik app || die "docker compose up falló"

echo "   Esperando /api/health ..."
for _ in $(seq 1 40); do
    if curl -fsS "http://localhost:$APP_PORT/api/health" >/dev/null 2>&1; then break; fi
    sleep 2
done

FAILED=0
check() {
    local path="$1" expect="$2" code
    code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$APP_PORT$path" || echo 000)"
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
info "Despliegue local verificado en http://localhost:$APP_PORT"

# ── 6. Publicación en Harbor ───────────────────────────────
if [[ "$DO_PUSH" != true ]]; then
    info "Push omitido"
else
    step "Publicando en Harbor"
    docker tag "$LOCAL_IMAGE" "$FULL_IMAGE"
    if ! docker push "$FULL_IMAGE" 2>&1 | tee /tmp/rmc-push.log; then
        die "Push falló. Verifique 'docker login ${HARBOR_REGISTRY%%/*}'"
    fi
    PUSHED_DIGEST="$(sed -n 's/.*digest: \(sha256:[a-f0-9]*\).*/\1/p' /tmp/rmc-push.log | tail -n1)"

    echo "   Verificando manifest en el registro ..."
    docker manifest inspect "$FULL_IMAGE" >/dev/null 2>&1 || die "El registro no devuelve el manifest de $FULL_IMAGE"
    info "Imagen disponible en Harbor: $FULL_IMAGE${PUSHED_DIGEST:+ (digest $PUSHED_DIGEST)}"
fi

# ── 7. Resumen ─────────────────────────────��────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  LOCAL OK  → http://localhost:$APP_PORT"
[[ "$DO_PUSH" == true ]] && echo "  HARBOR OK → $FULL_IMAGE"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "En el servidor de preproducción:"
echo "  docker login ${HARBOR_REGISTRY%%/*}"
echo "  docker pull $FULL_IMAGE"
echo "  docker compose up -d app"
echo "  curl -fsS http://127.0.0.1:3003/api/health"
