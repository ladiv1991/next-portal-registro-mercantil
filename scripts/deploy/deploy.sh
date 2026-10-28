#!/bin/bash
# ============================================================
# Deploy Portal Registro Mercantil — Pre-Producción
# ============================================================
# USO:
#   1. Copiar este archivo + portal-rmc-latest.tar al servidor
#   2. Ejecutar: bash deploy.sh
# ============================================================

set -euo pipefail

IMAGE_NAME="registry.dev.xetid.cu/portales-web/portal-rmc:latest"
CONTAINER_NAME="portal-rmc"
ENV_FILE="$(dirname "${BASH_SOURCE[0]}")/.env"
TAR_FILE="$(dirname "${BASH_SOURCE[0]}")/portal-rmc-latest.tar"
PORT=3000

# Colores
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── 0. Verificar prerequisitos ──────────────────────────────
info "Verificando prerequisitos..."
command -v docker >/dev/null 2>&1 || error "Docker no instalado. Instálalo primero."
docker info >/dev/null 2>&1 || error "Docker daemon no corriendo."

# ── 1. Cargar imagen desde tar ──────────────────────────────
if [[ ! -f "$TAR_FILE" ]]; then
    error "No se encontró el archivo de imagen: $TAR_FILE"
fi

info "Cargando imagen desde $TAR_FILE ..."
docker load -i "$TAR_FILE"
docker image inspect "$IMAGE_NAME" >/dev/null 2>&1 || error "La imagen no se cargó correctamente."
info "Imagen cargada: $IMAGE_NAME"

# ── 2. Limpiar contenedor anterior ──────────────────────────
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    warn "Deteniendo y eliminando contenedor existente: $CONTAINER_NAME"
    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1
fi

# ── 3. Validar variables de entorno ─────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
    error "No se encontró archivo de entorno: $ENV_FILE"
fi

# Extraer valores para validación
DB_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)
JWT_SECRET=$(grep '^JWT_SECRET=' "$ENV_FILE" | cut -d= -f2-)

[[ -z "$DB_URL" ]] && error "DATABASE_URL no configurado en $ENV_FILE"
[[ -z "$JWT_SECRET" ]] && error "JWT_SECRET no configurado en $ENV_FILE"
[[ ${#JWT_SECRET} -lt 32 ]] && warn "JWT_SECRET tiene menos de 32 caracteres. Se recomienda mínimo 32."

info "Variables de entorno validadas: DATABASE_URL ✓  JWT_SECRET ✓"

# ── 4. Iniciar contenedor ───────────────────────────────────
info "Iniciando contenedor $CONTAINER_NAME ..."
docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "$PORT":3000 \
    --env-file "$ENV_FILE" \
    "$IMAGE_NAME"

# Esperar a que el servidor esté listo
MAX_WAIT=30
WAITED=0
info "Esperando a que el servidor responda (máx ${MAX_WAIT}s)..."
while [[ $WAITED -lt $MAX_WAIT ]]; do
    if docker logs "$CONTAINER_NAME" 2>&1 | grep -q "Ready in" 2>/dev/null; then
        break
    fi
    sleep 2
    WAITED=$((WAITED + 2))
done

# ── 5. Verificar health check ──────────────────────────────
info "Verificando health check..."
HEALTH=$(curl -sf http://localhost:$PORT/api/health 2>/dev/null || echo 'FAILED')
if [[ "$HEALTH" == '{"status":"ok"}' ]]; then
    info "✓ Health check PASSED"
else
    warn "Health check devolvió: $HEALTH"
    info "Revisando logs del contenedor:"
    docker logs --tail 20 "$CONTAINER_NAME"
fi

# ── 6. Resumen final ───────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  DEPLOY COMPLETADO ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "  URL:        http://localhost:${PORT}"
echo "  Health:     http://localhost:${PORT}/api/health"
echo "  Container:  $CONTAINER_NAME"
echo ""
echo "  Comandos útiles:"
echo "    docker logs -f $CONTAINER_NAME     # Ver logs"
echo "    docker stop $CONTAINER_NAME        # Detener"
echo "    docker restart $CONTAINER_NAME     # Reiniciar"
echo "    docker rm -f $CONTAINER_NAME       # Eliminar (luego borrar imagen y ejecutar deploy.sh de nuevo)"
echo ""
echo -e "${YELLOW}  ⚠️  Recordatorio: Cambiar las credenciales seed por defecto.${NC}"
echo -e "${YELLOW}     admin@registromercantil.cu / Admin2026!${NC}"
echo -e "${YELLOW}     editor@registromercantil.cu / Editor2026!${NC}"
echo ""
