#!/usr/bin/env bash
#
# deploy-preprod.sh — Despliegue completo para preproducción
#
# Uso:
#   bash scripts/deploy-preprod.sh
#
# Pasos:
#   1. Preguntar valores del dominio y credenciales DB/Token
#   2. Generar .env con esos valores (sin sobrescribir otros si ya existe)
#   3. Verificar conectividad a la BD
#   4. Instalar dependencias + ejecutar migraciones (con --seed si se indica)
#   5. Construir imagen Docker + publicar en Harbor
#   6. Levantar stack local (app + postgres + traefik)
#   7. Verificar endpoints HTTP
#   8. Probar login CMS con las credenciales usadas
#   9. Resumir URL accesible
#
# Variables de entorno (opcionales):
#   TAG                Tag de la imagen (default: latest)
#   HARBOR_REGISTRY    Repositorio Harbor (default: registry.dev.xetid.cu/portales-web)
#   SEED_DATABASE      true/false — ejecuta seed de la base (default: false)
#   PUSH               true/false — publica en Harbor (default: true)
#   PORTAL_DOMAIN      Dominio principal (preguntado si falta)
#   PORTAL_DOMAINS     Lista de dominios permitidos (preguntado si falta)
#   PREPROD_SCHEME     http o https (default: http para pruebas locales)
#   DB_PASSWORD        Contraseña PostgreSQL (preguntada si falta)
#   JWT_SECRET         JWT secret (generado si falta)

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env"
APP_PORT=3003
COMPOSE="docker compose -f $PROJECT_DIR/docker-compose.yml --env-file $ENV_FILE"

die()  { echo "❌ $*" >&2; exit 1; }
info() { echo "✅ $*"; }
step() { echo ""; echo "▶ $*"; }

ask() {
    # ask <variable> <pregunta> <default>
    local var="$1" question="$2" default="$3" answer
    if [[ -n "${!var:-}" ]]; then return; fi
    # Non-interactive mode: exit without prompting
    if [[ -t 0 ]]; then
        read -r -p "$question [$default]: " answer
    else
        answer="$default"
    fi
    printf -v "$var" '%s' "${answer:-$default}"
    export "${var?}"
}

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

# Detectar contraseña existente del contenedor postgres (si existe) para no
# generar una nueva que sea distinta a la real.
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

# Dominios
ask PREPROD_SCHEME "Esquema (http/https)" "http"
ask PREPROD_DOMAIN "Dominio principal (HOST)" "portal-registromercantil.test.xutil.cu"
ask PREPROD_DOMAINS "Dominios permitidos (comas)" "portal-registromercantil.test.xutil.cu,portal-registromercantil.egob.dev.xetid.cu"
EXISTING_DB_DEFAULT="PortalRMC2026!Secure"
[[ -n "$EXISTING_PG_PASS" ]] && EXISTING_DB_DEFAULT="$EXISTING_PG_PASS"
ask DB_PASSWORD "Contraseña PostgreSQL (se usará en Docker y para migraciones)" "$EXISTING_DB_DEFAULT"
ask JWT_SECRET "JWT Secret (mínimo 32 chars)" "$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null)"

FULL_IMAGE="${HARBOR_REGISTRY%/}/portal-rmc:${TAG}"
echo "   Tag:       $TAG"
echo "   Harbor:    $FULL_IMAGE"
echo "   Scheme:    $PREPROD_SCHEME"
echo "   Dominio:   $PREPROD_DOMAIN"
echo "   Seed:      $SEED  ·  Push: $DO_PUSH"

# ── 2. Generar .env ─────────────────────────────────────────
step "Generando/actualizando .env"
# New values first, then preserve any original lines whose keys are NOT overridden.
# The approach: start with new values, then append only original lines whose key
# does not appear among the keys we are overriding.
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
    # Append original lines whose keys were NOT overridden.
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
# Al escribir el .env con valores de preproducción cambiamos DATABASE_URL a la
# ruta interna de Docker (postgres:5432). Para ejecutar migraciones desde el
# host necesitamos la URL local (127.0.0.1:<host-port>). La recuperamos del
# valor anterior si existe, o usamos el que ya conozco del contenedor.
LOCAL_DB_URL="$(sed -n 's/^DATABASE_URL=//p' "$ENV_FILE" 2>/dev/null | head -n1 || true)"
PG_HOST_CONTAINER="$(docker compose ps --format '{{.Name}}' | grep -i postgres | head -n1 || true)"
if [[ -n "$PG_HOST_CONTAINER" ]] && docker ps | grep -qw "$PG_HOST_CONTAINER"; then
    info "PostgreSQL local accesible en el contenedor $PG_HOST_CONTAINER"
    # Guardamos la URL de host para restaurarla después de migrar
    HOST_DB_URL="postgresql://portal_rmc:${DB_PASSWORD}@127.0.0.1:5433/registro_mercantil"
    docker exec "$PG_HOST_CONTAINER" pg_isready -U portal_rmc -d registro_mercantil >/dev/null 2>&1 \
        || die "PostgreSQL no responde. Verifica: docker compose up -d postgres"
else
    warn "No hay contenedor PostgreSQL detectado — se asumirá una DB remota o posterior"
    HOST_DB_URL="$LOCAL_DB_URL"
fi

# ── 4. Prisma (host → restaurar DB local antes de migrar) ──
step "Generando cliente Prisma y sincronizando esquema"
# Temporalmente restauramos DATABASE_URL para que prisma funcione desde el host.
if [[ -f "$ENV_FILE" ]]; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${HOST_DB_URL}|" "$ENV_FILE"
fi
export DATABASE_URL="$HOST_DB_URL"
if [[ "$SEED" == true ]]; then
    node scripts/run-migrations.js --seed || die "Migraciones o seed fallaron"
else
    node scripts/run-migrations.js || die "Migraciones fallaron"
fi
# Restauramos el .env a valores de preproducción PARA DOCKER COMPOSE (después de migrar).
# El build usa 'prebuild' que ejecuta run-migrations.js y leerá DATABASE_URL desde .env;
# por eso NO restauramos el .env antes del build — dejamos que siga apuntando al host.
export DATABASE_URL="postgresql://portal_rmc:${DB_PASSWORD}@postgres:5432/registro_mercantil"
info "Base de datos sincronizada"

# ── 5. Build standalone ─────────────────────────────────────
step "Construyendo la aplicación (Next.js standalone)"
# Mantener DATABASE_URL local durante el build para que el hook 'prebuild' funcione.
# Docker compose aplicará la URL de producción (postgres:5432) en el contenedor.
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${HOST_DB_URL}|" "$ENV_FILE"
export DATABASE_URL="$HOST_DB_URL"
bun run build || die "El build falló"
[[ -f .next/standalone/server.js ]] || die "No se generó .next/standalone/server.js"
info "Build listo"
# Restaurar DATABASE_URL a valores de preproducción para docker compose
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://portal_rmc:${DB_PASSWORD}@postgres:5432/registro_mercantil|" "$ENV_FILE"
export DATABASE_URL="postgresql://portal_rmc:${DB_PASSWORD}@postgres:5432/registro_mercantil"

# ── 6. Imagen Docker ────────────────────────────────────────
step "Construyendo imagen Docker"
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

    echo "   Verificando manifest en el registro ..."
    docker manifest inspect "$FULL_IMAGE" >/dev/null 2>&1 || die "El registro no devuelve el manifest de $FULL_IMAGE"
    info "Imagen disponible en Harbor: $FULL_IMAGE${PUSHED_DIGEST:+ (digest $PUSHED_DIGEST)}"
fi

# ── 9. Resumen final ────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🏁 Despliegue PREPRODUCCIÓN COMPLETADO"
echo "═══════════════════════════════════════════════════════"
echo "  Dominio:      $PREPROD_SCHEME://$PREPROD_DOMAIN"
echo "  App local:    http://localhost:$APP_PORT"
[[ "$DO_PUSH" == true ]] && echo "  Harbor:       $FULL_IMAGE"
echo ""
echo "  Credenciales seed (si SEED=true):"
echo "    admin@registromercantil.cu / Admin2026!"
echo "    editor@registromercantil.cu  / Editor2026!"
echo ""
echo "  En el servidor de pre-producción:"
echo "    docker login ${HARBOR_REGISTRY%%/*}"
echo "    docker pull $FULL_IMAGE"
echo "    cd /opt/portal-mercantil  # o donde esté el docker-compose.yml"
echo "    docker compose up -d app"
echo "    curl -fsS http://127.0.0.1:3003/api/health"
echo "═══════════════════════════════════════════════════════"
