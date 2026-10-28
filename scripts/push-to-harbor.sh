#!/usr/bin/env bash
# Push portal-rmc image to Harbor corporate registry
# Usage:
#   bash scripts/push-to-harbor.sh              # latest tag, push
#   bash scripts/push-to-harbor.sh --tag v1.0.0  # custom tag
#   bash scripts/push-to-harbor.sh --no-push     # build + tag only, no push
#   bash scripts/push-to-harbor.sh --skip-db     # skip DB migration check
set -euo pipefail

HARBOR_REGISTRY="${HARBOR_REGISTRY:-registry.dev.xetid.cu/portales-web}"
IMAGE_NAME="portal-rmc"
TAG="${TAG:-latest}"
SKIP_DB=false
NO_PUSH=false

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag)     TAG="$2"; shift 2 ;;
    --no-push) NO_PUSH=true; shift ;;
    --skip-db) SKIP_DB=true; shift ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

FULL_IMAGE="${HARBOR_REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "Registry : ${HARBOR_REGISTRY}"
echo "Image    : ${FULL_IMAGE}"
echo "Skip DB  : ${SKIP_DB}"
echo "No push  : ${NO_PUSH}"

# Check Docker daemon
if ! docker info --format "{{.ServerVersion}}" > /dev/null 2>&1; then
  echo "ERROR: Docker daemon is not running."
  echo "Start Docker Desktop from: C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"
  exit 1
fi

# Check Harbor login
if ! docker info --format "{{.Username}}" | grep -q "^voacosta$" 2>/dev/null; then
  echo "WARNING: Not logged in to ${HARBOR_REGISTRY}. Run:"
  echo "  docker login ${HARBOR_REGISTRY}"
fi

# Prisma migration check (only for dev; prod images have migrations pre-applied)
if [ "${SKIP_DB}" = false ]; then
  if command -v bun &>/dev/null; then
    echo "Checking Prisma client generation..."
    cd "$(dirname "$0")/.."
    if [ ! -d "node_modules/.prisma/client" ]; then
      echo "WARNING: node_modules/.prisma/client not found. Run 'bun install' first."
    fi
  fi
else
  echo "Skipping DB migration check (--skip-db)"
fi

# Build
echo "Building ${FULL_IMAGE}..."
docker build --network=host --file Dockerfile --tag "${FULL_IMAGE}" .

echo "Build complete: ${FULL_IMAGE}"

if [ "${NO_PUSH}" = true ]; then
  echo "Skipping push (--no-push)"
  exit 0
fi

# Push
echo "Pushing ${FULL_IMAGE}..."
docker push "${FULL_IMAGE}"
echo "Pushed: ${FULL_IMAGE}"
