#!/bin/bash
# Download Geist and Geist Mono font files from Google Fonts CDN
set -e

FONTS_DIR="/var/www/html/registro-mercantil-portal/public/fonts"
mkdir -p "$FONTS_DIR"

# Geist Sans - regular (400), medium (500), semibold (600), bold (700)
for weight in 400 500 600 700; do
  echo "⬇️  Downloading Geist Sans $weight..."
  curl -sL -o "$FONTS_DIR/GeistSans-${weight}.woff2" \
    "https://fonts.gstatic.com/s/geist/v1/tRcy6M3gRQTSy6NwTU8EaJtYGe7y5B0vT8M.woff2" \
    --retry 3 --retry-delay 2
done

# Geist Mono - regular (400), medium (500), semibold (600), bold (700)
for weight in 400 500 600 700; do
  echo "⬇️  Downloading Geist Mono $weight..."
  curl -sL -o "$FONTS_DIR/GeistMono-${weight}.woff2" \
    "https://fonts.gstatic.com/s/geistmono/v1/oah0XZGz4CzDJKJg4m2kXQ0.woff2" \
    --retry 3 --retry-delay 2
done

echo "✅ Fonts downloaded to $FONTS_DIR"
ls -la "$FONTS_DIR"
