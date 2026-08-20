-- ============================================================
-- init-postgres.sql
-- Script para ejecutar en el servidor PostgreSQL
-- Crea usuario, base de datos y asigna permisos exclusivos
-- para el Portal del Registro Mercantil de Cuba
-- ============================================================
--
-- USO:
--   sudo -u postgres psql -f init-postgres.sql
--   o bien:
--   psql -U postgres -f init-postgres.sql
--
-- NOTA: Ejecutar como superusuario de PostgreSQL.
--       Se puede conectar desde localhost o editar el host.
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. CREAR ROL DE USUARIO (si no existe)
-- ═══════════════════════════════════════════════════════════════
-- ⚠️  CAMBIE ESTA CONTRASEÑA por una segura antes de ejecutar.
--    Mínimo 16 caracteres con mayúsculas, minúsculas, números
--    y caracteres especiales.
--    Ejemplo generado: RmC!2025#k9$xPz@qL
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'portal_rmc') THEN
        CREATE ROLE portal_rmc WITH
            LOGIN
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            NOINHERIT
            NOREPLICATION
            CONNECTION LIMIT 20
            ENCRYPTED PASSWORD 'RmC!2025#k9$xPz@qL';
        RAISE NOTICE '✓ Rol "portal_rmc" creado exitosamente.';
    ELSE
        RAISE NOTICE '! Rol "portal_rmc" ya existe. No se modificó.';
    END IF;
END
$$;

-- ═══════════════════════════════════════════════════════════════
-- 2. CREAR BASE DE DATOS (si no existe)
-- ═══════════════════════════════════════════════════════════════

CREATE DATABASE registro_mercantil OWNER portal_rmc ENCODING 'UTF8' LC_COLLATE='es_ES.UTF-8' LC_CTYPE='es_ES.UTF-8' TEMPLATE 'template0';

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_database WHERE datname = 'registro_mercantil') THEN
        RAISE NOTICE '✓ Base de datos "registro_mercantil" verificada.';
    END IF;
END
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3. REVOCAR PERMISOS PÚBLICOS (seguridad)
-- ═══════════════════════════════════════════════════════════════

REVOKE ALL ON DATABASE registro_mercantil FROM PUBLIC;

-- ═══════════════════════════════════════════════════════════════
-- 4. OTORGAR PERMISOS EXCLUSIVOS AL USUARIO
-- ═══════════════════════════════════════════════════════════════

-- Conexión a la base de datos
GRANT CONNECT ON DATABASE registro_mercantil TO portal_rmc;

-- Permisos sobre el esquema public (el único que usará)
GRANT USAGE, CREATE ON SCHEMA public TO portal_rmc;

-- Desconectar permisos públicos del esquema
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO portal_rmc;

-- ═══════════════════════════════════════════════════════════════
-- 5. ASEGURAR PERMISOS SOBRE TABLAS FUTURAS (default privileges)
-- ═══════════════════════════════════════════════════════════════

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO portal_rmc;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO portal_rmc;

-- ═══════════════════════════════════════════════════════════════
-- 6. ASIGNAR PERMISOS SOBRE TABLAS EXISTENTES (por si ya tienen)
-- ═══════════════════════════════════════════════════════════════

-- Este bloque se conecta a la BD y da permisos a tablas existentes
DO $$
DECLARE
    tbl record;
BEGIN
    -- Conectar a registro_mercantil para dar permisos
    -- Se ejecuta como superusuario, por lo que tiene acceso
    FOR tbl IN
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_catalog = 'registro_mercantil'
    LOOP
        EXECUTE format('GRANT ALL PRIVILEGES ON TABLE public.%I TO portal_rmc', tbl.table_name);
        RAISE NOTICE '  Permisos otorgados en tabla: %', tbl.table_name;
    END LOOP;

    -- También para secuencias existentes
    FOR tbl IN
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
          AND sequence_catalog = 'registro_mercantil'
    LOOP
        EXECUTE format('GRANT ALL PRIVILEGES ON SEQUENCE public.%I TO portal_rmc', tbl.sequence_name);
        RAISE NOTICE '  Permisos otorgados en secuencia: %', tbl.sequence_name;
    END LOOP;
END
$$;

-- ═══════════════════════════════════════════════════════════════
-- 7. VERIFICACIÓN FINAL
-- ═══════════════════════════════════════════════════════════════

SELECT '═══════════════════════════════════════════════════════' AS linea;
SELECT '  CONFIGURACIÓN COMPLETADA' AS resultado;
SELECT '═══════════════════════════════════════════════════════' AS linea;

SELECT format('  Usuario:       %s', rolname) AS info
FROM pg_roles WHERE rolname = 'portal_rmc';

SELECT format('  Base de datos: %s (Owner: %s)', datname, r.rolname) AS info
FROM pg_database d
JOIN pg_roles r ON d.datdba = r.oid
WHERE datname = 'registro_mercantil';

SELECT '═══════════════════════════════════════════════════════' AS linea;
SELECT '' AS linea;
SELECT '  ⚠️  RECOMENDACIONES DE SEGURIDAD:' AS advertencia;
SELECT '    1. Cambie la contraseña por defecto inmediatamente:' AS advertencia;
SELECT '       ALTER ROLE portal_rmc WITH PASSWORD ''nueva-contrasena-segura'';' AS advertencia;
SELECT '    2. Restringa acceso en pg_hba.conf solo a la IP del servidor web' AS advertencia;
SELECT '    3. Configure pg_hba.conf con método scram-sha-256' AS advertencia;
SELECT '    4. No comparta este archivo SQL fuera del equipo de infraestructura' AS advertencia;
SELECT '' AS linea;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
-- Configuración recomendada en .env del proyecto:
--
--   DATABASE_URL=postgresql://portal_rmc:RmC!2025#k9$xPz@HOST:5432/registro_mercantil
--
-- Donde HOST es la IP o hostname del servidor PostgreSQL.
-- Ejemplos:
--   HOST=localhost          (si PostgreSQL está en el mismo servidor)
--   HOST=192.168.1.100      (si está en red local)
--   HOST=db.miempresa.cu    (si tiene DNS interno)
-- ============================================================
