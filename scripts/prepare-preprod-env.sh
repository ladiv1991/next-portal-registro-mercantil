#!/usr/bin/env bash
# ============================================================
# prepare-preprod-env.sh — Genera o actualiza el .env para preproducción
# ============================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

info() { echo "✅ $*"; }
ask() {
    local var="$1" question="$2" default="$3" answer
    read -r -p "$question [$default]: " answer
    printf -v "$var" '%s' "${answer:-$default}"
    export "${var?}"
}

cd "$PROJECT_DIR"

echo "============================================================"
echo "  🛠️  Generador de .env para Preproducción"
echo "============================================================"
echo ""

# Valores actuales o defaults seguros
DEFAULT_DOMAIN="portal-registromercantil.test.xutil.cu"
DEFAULT_DOMAINS="portal-registromercantil.test.xutil.cu,portal-registromercantil.egob.dev.xetid.cu"
DEFAULT_SCHEME="https"
DEFAULT_DB_PASS="PortalRMC2026!Secure"
DEFAULT_JWT="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || echo "08cfae71dc1f8381130135ef05099cb84a8965f9013e4b5d1a48531d468998f0")"

ask PREPROD_SCHEME "Esquema (http/https)" "$DEFAULT_SCHEME"
ask PREPROD_DOMAIN "Dominio principal (HOST)" "$DEFAULT_DOMAIN"
ask PREPROD_DOMAINS "Dominios permitidos (separados por coma)" "$DEFAULT_DOMAINS"
ask DB_PASSWORD "Contraseña PostgreSQL" "$DEFAULT_DB_PASS"
ask JWT_SECRET "JWT Secret (mínimo 32 chars)" "$DEFAULT_JWT"

# Escribir .env optimizado para preproducción
cat <<EOF > "$ENV_FILE"
# ============================================================
# Registro Mercantil de Cuba — Variables de Entorno (Preproducción)
# Generado automáticamente por prepare-preprod-env.sh
# ============================================================

# Base de datos — PostgreSQL (dentro de Docker usa service 'postgres:5432')
DATABASE_URL=postgresql://portal_rmc:${DB_PASSWORD}@postgres:5432/registro_mercantil
DB_PROVIDER=postgresql
POSTGRES_PASSWORD=${DB_PASSWORD}

# Autenticación — JWT
JWT_SECRET=${JWT_SECRET}

# Uploads — límites en megabytes
UPLOAD_MAX_FILE_MB=5
UPLOAD_MAX_IMAGE_MB=5
UPLOAD_MAX_DOCUMENT_MB=20
UPLOAD_MAX_VIDEO_MB=100

# Portal — dominio y esquema
PORTAL_SCHEME=${PREPROD_SCHEME}
PORTAL_DOMAIN=${PREPROD_DOMAIN}
PORTAL_DOMAINS=${PREPROD_DOMAINS}
NEXT_PUBLIC_APP_URL=${PREPROD_SCHEME}://${PREPROD_DOMAIN}
NEXTAUTH_URL=${PREPROD_SCHEME}://${PREPROD_DOMAIN}
TRAEFIK_HOST=${PREPROD_DOMAIN}

# Registro Docker privado (Harbor)
DOCKER_REGISTRY=
HARBOR_REGISTRY=registry.dev.xetid.cu/portales-web
EOF

info "Archivo .env generado correctamente en $ENV_FILE"
echo ""
echo "Variables configuradas:"
grep -vE '^#|^$' "$ENV_FILE"
echo ""
info "Listo para ejecutar el despliegue."
