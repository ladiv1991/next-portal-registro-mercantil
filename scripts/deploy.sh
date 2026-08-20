#!/bin/bash

set -e

CONTAINER_NAME="registro-mercantil-app"
PROJECT_DIR="/opt/portal-mercantil"

echo "================================================"
echo "  🚀 Deploy → $CONTAINER_NAME"
echo "================================================"
echo ""

# 1. Build
echo "📦 Paso 1/3 — Construyendo Next.js..."
cd "$PROJECT_DIR"
bun run build
echo "✅ Build completado"
echo ""

# 2. Copiar al contenedor
echo "📂 Paso 2/3 — Copiando archivos al contenedor..."
docker cp .next/standalone/. "$CONTAINER_NAME":/app/
docker cp public/ "$CONTAINER_NAME":/app/public/
echo "✅ Archivos copiados"
echo ""

# 3. Reiniciar contenedor
echo "🔄 Paso 3/3 — Reiniciando contenedor..."
docker restart "$CONTAINER_NAME"
echo ""

# Esperar y verificar
echo "⏳ Esperando que el contenedor se levante..."
sleep 5

if docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
    echo "✅ $CONTAINER_NAME está corriendo"
    echo ""
    docker logs "$CONTAINER_NAME" --tail 5
else
    echo "❌ $CONTAINER_NAME no arrancó. Revisa los logs:"
    docker logs "$CONTAINER_NAME" --tail 20
    exit 1
fi

echo ""
echo "================================================"
echo "  🎉 Deploy completado"
echo "================================================"
