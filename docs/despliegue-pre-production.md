# Despliegue Offline — Portal del Registro Mercantil

> **Imagen**: `registry.dev.xetid.cu/portales-web/portal-rmc:latest` (660MB)
> **CMD**: `node server.js` | **Puerto**: 3000
> **Estado**: ✅ Verificado en test-local

---

## Flujo de despliegue (sin internet en el servidor)

```
┌─────────────────────┐       ┌──────────────────────┐
│  Equipo con acceso  │  tar  │  Servidor pre-prod   │
│  a Harbor (local)   │ ───►  │  (sin internet)      │
└─────────────────────┘       └──────────────────────┘
        │                              │
   docker save                   docker load
        │                              │
   portal-rmc-latest.tar    ─────►   bash deploy.sh
                                    (automático)
```

---

## PASO 1 — En el equipo con acceso a Harbor (o Docker Desktop local)

### 1.1 Verificar credenciales Harbor

```powershell
docker login registry.dev.xetid.cu
# usuario: voacosta
# password: (tu contraseña corporativa)
```

### 1.2 Verificar que la imagen existe

```powershell
docker pull registry.dev.xetid.cu/portales-web/portal-rmc:latest
docker images registry.dev.xetid.cu/portales-web/portal-rmc
```

### 1.3 Exportar la imagen a archivo tar

```powershell
cd D:\WORK\www\github\next-portal-registro-mercantil
docker save registry.dev.xetid.cu/portales-web/portal-rmc:latest -o scripts\deploy\portal-rmc-latest.tar
```

> El archivo resultante mide ~175MB (comprimido).

### 1.4 Preparar archivos para transferencia

Los siguientes archivos deben copiarse al servidor de pre-producción:

| Archivo | Tamaño | Propósito |
|---------|--------|-----------|
| `scripts/deploy/portal-rmc-latest.tar` | 175MB | Imagen Docker |
| `scripts/deploy/deploy.sh` | 6KB | Script de despliegue |
| `scripts/deploy/.env.example` | 500B | Plantilla de variables |

> **Método de transferencia**: USB, SCP, rsync, o cualquier medio disponible en tu red interna.

---

## PASO 2 — En el servidor de pre-producción (sin internet)

### 2.1 Copiar los archivos

```bash
# Ejemplo: vía SCP desde otro equipo en la red interna
scp -r deploy/ usuario@servidor-preprod:/opt/portal-rmc/
# O via USB/medio físico
```

### 2.2 Crear el archivo .env con tus credenciales reales

```bash
cd /opt/portal-rmc
cp .env.example .env
nano .env
```

Editar el archivo `.env` con valores reales:

```env
DATABASE_URL=postgresql://portal_rmc:TuPasswordDB@192.168.x.x:5433/registro_mercantil
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
NODE_ENV=production
PORT=3000
```

> **JWT_SECRET**: mínimo 32 caracteres aleatorios. Generar si es necesario:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 2.3 Verificar Docker

```bash
docker --version
docker info --format "{{.ServerVersion}}"
```

Si Docker no está instalado:
```bash
# CentOS/RHEL
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
```

### 2.4 Ejecutar el despliegue

```bash
cd /opt/portal-rmc
bash deploy.sh
```

El script hará automáticamente:
1. Cargar la imagen desde `portal-rmc-latest.tar` (660MB)
2. Validar `.env` (DATABASE_URL + JWT_SECRET presentes)
3. Eliminar contenedor anterior si existe
4. Iniciar contenedor en segundo plano
5. Esperar a que el servidor esté listo
6. Verificar health check (`/api/health`)
7. Mostrar resumen final

---

## PASO 3 — Verificación post-despliegue

### 3.1 Health check

```bash
curl http://localhost:3000/api/health
# Respuesta esperada: {"status":"ok"}
```

### 3.2 Logs

```bash
docker logs -f portal-rmc
```

### 3.3 Probar login CMS

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@registromercantil.cu","password":"Admin2026!"}'
# Respuesta: { success: true, token: "eyJ..." }
```

### 3.4 Estado del contenedor

```bash
docker ps --filter "name=portal-rmc"
docker stats portal-rmc
```

---

## COMANDOS DE GESTIÓN

```bash
# Parar el servicio
docker stop portal-rmc

# Reiniciar
docker restart portal-rmc

# Eliminar completamente
docker rm -f portal-rmc
docker rmi registry.dev.xetid.cu/portales-web/portal-rmc:latest

# Ver logs en tiempo real
docker logs -f portal-rmc

# Ver consumo de recursos
docker stats portal-rmc

# Entrar al contenedor (debug)
docker exec -it portal-rmc bash
```

---

## ROLLOVER (actualizar a nueva versión)

```bash
# Si se actualizó el archivo tar en el servidor:
cd /opt/portal-rmc
bash deploy.sh
# El script detecta el contenedor existente y lo reemplaza
```

---

## SOLUCIÓN DE PROBLEMAS

### Error: "Cannot find module 'next'"
```bash
# La imagen no cargó bien. Recargar:
docker rmi registry.dev.xetid.cu/portales-web/portal-rmc:latest
bash deploy.sh
```

### Error: "connect ECONNREFUSED" en DB
```bash
# Verificar conectividad con la base de datos
nc -zv <host-db> 5433
# Verificar que DATABASE_URL es correcto en .env
```

### Error: "JWT_SECRET is too short"
```bash
# El JWT_SECRET debe tener al menos 32 caracteres
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copiar el valor y actualizar .env
```

### El contenedor arranca pero health check falla
```bash
# Verificar logs completos
docker logs portal-rmc
# Si es problema de DB, revisar que el servicio PostgreSQL esté corriendo
docker ps --filter "status=running"
```

---

## CONTENIDO DE LA IMAGEN

```
/ (rootfs)
├── app/
│   ├── server.js            ← Entry point (Next.js standalone)
│   ├── .next/               ← Build de Next.js (standalone)
│   │   ├── static/          ← Assets JS/CSS
│   │   ├── server/          ← Server-side routes
│   │   └── package.json     ← Metadata
│   ├── node_modules/        ← Todas las dependencias runtime
│   ├── prisma/
│   │   ├── schema.prisma    ← Esquema DB
│   │   └── migrations/      ← 2 migraciones (ya aplicadas en prod)
│   ├── public/              ← Archivos estáticos
│   └── package.json
└── .env                     ← Copia del .env del host (solo lectura)
```

> **Offline-safe**: El contenedor NO ejecuta `npm install`, `bun install`, ni `prisma migrate`. Todo está pre-construido.
