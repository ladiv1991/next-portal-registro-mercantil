# Despliegue en Pre-Producción — Portal del Registro Mercantil

> **Imagen**: `registry.dev.xetid.cu/portales-web/portal-rmc:latest`
> **Tamaño**: 660MB | **CMD**: `node server.js`
> **Puerto**: 3000
> **Estado**: ✅ Verificado (health check pasa)

---

## Requisitos previos en el servidor de pre-producción

1. **Docker** instalado y corriendo
2. **Credenciales Harbor** (usuario: `voacosta`)
3. **Puerto 3000** disponible (o cambiar en el comando)

```powershell
# Verificar Docker
docker --version
docker info --format "{{.ServerVersion}}"
```

---

## Paso 1 — Descargar la imagen desde Harbor (sin internet)

```powershell
docker pull registry.dev.xetid.cu/portales-web/portal-rmc:latest
```

> Si el servidor no tiene acceso a Harbor, exportar/importar:
> ```powershell
> # Desde equipo con acceso a Harbor
> docker save registry.dev.xetid.cu/portales-web/portal-rmc:latest -o portal-rmc-latest.tar
> # Copiar el archivo .tar al servidor pre-prod
> # Desde servidor pre-prod
> docker load -i portal-rmc-latest.tar
> ```

---

## Paso 2 — Configurar variables de entorno

Crea un archivo `.env` en el servidor con al menos:

```env
DATABASE_URL=postgresql://portal_rmc:<password>@<host-db>:5433/registro_mercantil
JWT_SECRET=<tu-secret-de-32-charactores-minimo>
```

> **Nota**: Las migraciones de base de datos YA están aplicadas en la imagen.
> Solo se necesita conexión a la DB y el JWT_SECRET.

---

## Paso 3 — Ejecutar el contenedor

```powershell
docker run -d `
  --name portal-rmc `
  --restart unless-stopped `
  -p 3000:3000 `
  -e NODE_ENV=production `
  -e PORT=3000 `
  -e DATABASE_URL="postgresql://portal_rmc:<password>@<host-db>:5433/registro_mercantil" `
  -e JWT_SECRET="<tu-secret>" `
  registry.dev.xetid.cu/portales-web/portal-rmc:latest
```

O con archivo .env:

```powershell
docker run -d `
  --name portal-rmc `
  --restart unless-stopped `
  --env-file .env `
  -p 3000:3000 `
  registry.dev.xetid.cu/portales-web/portal-rmc:latest
```

---

## Paso 4 — Verificar que arrancó

```powershell
docker logs -f portal-rmc
# Debe mostrar: "✓ Ready in ..."
```

En otra terminal, probar health check:

```powershell
curl http://localhost:3000/api/health
# Esperado: {"status":"ok"}
```

---

## Paso 5 — Verificar credenciales de prueba

```powershell
# Login CMS
$body = @{ email = "admin@registromercantil.cu"; password = "Admin2026!" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
# Respuesta esperada: { success: true, token: "..." }
```

---

## Comandos útiles

```powershell
# Ver estado
docker ps | Select-String "portal-rmc"

# Ver logs
docker logs portal-rmc

# Reiniciar
docker restart portal-rmc

# Parar
docker stop portal-rmc

# Eliminar y recrear (ej. después de actualizar imagen)
docker rm -f portal-rmc
docker pull registry.dev.xetid.cu/portales-web/portal-rmc:latest
# ... ejecutar docker run de nuevo
```

---

## Rollback a versión anterior

```powershell
# Si `latest` falla, bajar a una versión conocida
docker pull registry.dev.xetid.cu/portales-web/portal-rmc:v1.0.0
docker stop portal-rmc && docker rm portal-rmc
# Ejecutar docker run con :v1.0.0
```

---

## Solución de problemas

### Error: `Cannot find module 'next'`
La imagen es autocontenida. Si aparece este error, la imagen no se descargó completa.
```powershell
docker rmi registry.dev.xetid.cu/portales-web/portal-rmc:latest
docker pull registry.dev.xetid.cu/portales-web/portal-rmc:latest
```

### Error: `connect ECONNREFUSED` en DB
Verificar que el host de base de datos es accesible desde el contenedor.
```powershell
# Si la DB está en otro contenedor Docker, usar --network host o linking
docker run --network host ... 
# O si la DB es un servicio externo, verificar conectividad
Test-NetConnection -ComputerName <host-db> -Port 5433
```

### Error: `Invalid JWT_SECRET`
El JWT_SECRET debe tener al menos 32 caracteres. Generar uno nuevo:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Arquitectura de la imagen

```
registry.dev.xetid.cu/portales-web/portal-rmc:latest (660MB)
├── .next/server.js          ← Servidor Next.js standalone
├── .next/static/            ← Assets estáticos
├── node_modules/            ← Todas las dependencias de runtime
├── prisma/                  ← Schema + migraciones (ya aplicadas)
├── public/                  ← Archivos estáticos del portal
└── package.json             ← Metadatos (no usado en runtime)

CMD: node server.js
PORT: 3000
Healthcheck: wget -qO- http://localhost:3000/api/health
```

> **Offline-safe**: No requiere internet ni ejecuta `npm install`, `bun install`, o `prisma migrate` dentro del contenedor.
