#!/usr/bin/env node
/**
 * clear-search-flood.js — Limpieza manual de flood de búsquedas
 *
 * Usa este script cuando necesites limpiar rate limits acumulados en desarrollo
 * o producción. Requiere autenticación de administrador.
 *
 * Uso:
 *   # Opción 1: Usar RMC_ADMIN_TOKEN (recomendado para CI/automatización)
 *   # Obtén el token desde las cookies del navegador tras loguearte como admin
 *   export RMC_ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *   node scripts/clear-search-flood.js --all
 *
 *   # Opción 2: Login automático (requiere capturar respuesta de captcha manualmente)
 *   node scripts/clear-search-flood.js --all
 *
 *   # Limpiar IP específica (desarrollo local)
 *   node scripts/clear-search-flood.js --ip ::1
 *
 *   # Ver estado actual de rate limits
 *   node scripts/clear-search-flood.js --status
 *
 *   # Listar perfiles guardian con score > 0
 *   node scripts/clear-search-flood.js --guardian
 *
 * Requiere variable de entorno:
 *   NEXT_PUBLIC_APP_URL=http://localhost:3003
 *   RMC_ADMIN_TOKEN=<jwt>           (opcional, omite login)
 */

const { execSync } = require('child_process');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ─── Helpers ───────────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\x1b[36m[${ts}]\x1b[0m ${msg}`);
}

function error(msg) {
  console.error(`\x1b[31mERROR:\x1b[0m ${msg}`);
}

function warn(msg) {
  console.warn(`\x1b[33mWARN:\x1b[0m ${msg}`);
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
}

/**
 * Leer token JWT del archivo .env.local o de la cookie del navegador (dev).
 * En dev se busca en el localStorage del navegador via Playwright/Selenium,
 * pero aquí simplificamos leyendo de variables de entorno si están definidas.
 */
function getToken() {
  // Opción 1: Variable directa
  if (process.env.RMC_ADMIN_TOKEN) {
    return process.env.RMC_ADMIN_TOKEN;
  }

  // Opción 2: leer de .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^JWT_SECRET=(.+)$/m);
    if (match) {
      warn('Se encontró JWT_SECRET en .env.local. Para autenticación, configure RMC_ADMIN_TOKEN.');
    }
  }

  return null;
}

/**
 * Autenticarse y obtener token de sesión.
 * En desarrollo: intenta con credenciales seed + captcha automático.
 */
async function authenticate() {
  const token = getToken();
  if (token) return token;

  const baseUrl = getBaseUrl();
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@registromercantil.cu';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin2026!';

  log(`Autenticando como ${email}...`);

  // Step 1: get captcha
  const captchaUrl = new URL('/api/captcha/new', baseUrl);
  const captchaLib = captchaUrl.protocol === 'https:' ? https : http;
  const captchaRes = await new Promise((resolve, reject) => {
    const req = captchaLib.request(captchaUrl, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });

  if (!captchaRes.success) {
    throw new Error(`No se pudo obtener CAPTCHA: ${JSON.stringify(captchaRes)}`);
  }

  log('✅ CAPTCHA obtenido, autenticando...');

  // Step 2: login with captcha
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email,
      password,
      captchaId: captchaRes.id,
      captchaAnswer: captchaRes.answer,
    });
    const url = new URL('/api/auth/login', baseUrl);
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': baseUrl,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const setCookie = res.headers['set-cookie']?.[0];
          if (setCookie) {
            const match = setCookie.match(/rmc-token=([^;]+)/);
            if (match) {
              log('✅ Autenticación exitosa');
              resolve(match[1]);
            } else {
              reject(new Error('No se pudo extraer el token de la cookie'));
            }
          } else {
            reject(new Error('Sin cookie de respuesta'));
          }
        } else {
          reject(new Error(`Error de autenticación: ${res.statusCode} ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Hacer una petición HTTP con autenticación.
 */
function apiRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const baseUrl = getBaseUrl();
    const url = new URL(path, baseUrl);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const postData = body ? JSON.stringify(body) : undefined;
    const req = lib.request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        'Cookie': token ? `rmc-token=${token}` : '',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// ─── Actions ───────────────────────────────────────────────────────

async function showStatus(token) {
  log('Consultando estado de rate limits...');
  const result = await apiRequest('GET', '/api/cms/admin/rate-limits/status', null, token);
  console.log(JSON.stringify(result, null, 2));
}

async function listGuardianProfiles(token) {
  log('Listando perfiles Guardian...');
  const result = await apiRequest('GET', '/api/cms/guardian', null, token);
  if (result.success && result.data) {
    const active = result.data.filter(p => p.score > 0);
    if (active.length === 0) {
      log('No hay perfiles con score > 0');
    } else {
      console.log('\nPerfiles activos:');
      active.forEach(p => {
        console.log(`  ${p.ip.padEnd(25)} score=${String(p.score).padStart(3)} tier=${p.tier.padEnd(10)} flags=[${p.flags.join(', ')}]`);
      });
    }
  }
  console.log(JSON.stringify(result, null, 2));
}

async function clearAll(token) {
  log('Limpiando TODOS los rate limits de búsqueda...');
  const result = await apiRequest('POST', '/api/cms/admin/rate-limits/reset', {}, token);
  console.log(JSON.stringify(result, null, 2));
  return result;
}

async function clearIp(ip, token) {
  log(`Limpiando rate limit para IP: ${ip}...`);
  const result = await apiRequest('POST', '/api/cms/admin/rate-limits/reset', { ip }, token);
  console.log(JSON.stringify(result, null, 2));
  return result;
}

async function resetGuardianScore(ip, token) {
  log(`Resetando score Guardian para IP: ${ip}...`);
  const result = await apiRequest('POST', '/api/cms/guardian', { action: 'reset', ip }, token);
  console.log(JSON.stringify(result, null, 2));
  return result;
}

// ─── Main ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const action = args[0];
  const param = args[1];

  if (!action || !['--all', '--ip', '--status', '--guardian', '--help'].includes(action)) {
    console.log(`
⚠️  Script de limpieza de flood de búsquedas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Uso:
  node scripts/clear-search-flood.js <acción> [parametro]

Acciones:
  --all              Limpia TODOS los rate limits de búsqueda
  --ip <ip>          Limpia rate limit de una IP específica
  --status           Muestra estado actual de rate limits
  --guardian         Lista perfiles Guardian activos
  --help             Muestra esta ayuda

Ejemplos:
  node scripts/clear-search-flood.js --all
  node scripts/clear-search-flood.js --ip "::1"
  node scripts/clear-search-flood.js --status
  node scripts/clear-search-flood.js --guardian

Variables de entorno (opcional):
  NEXT_PUBLIC_APP_URL  - URL base del portal (default: http://localhost:3003)
  RMC_ADMIN_TOKEN      - Token JWT directo (evita autenticación)
  SEED_ADMIN_EMAIL     - Email de admin seed
  SEED_ADMIN_PASSWORD  - Password de admin seed
`);
    return;
  }

  try {
    const token = await authenticate();

    switch (action) {
      case '--all':
        await clearAll(token);
        break;
      case '--ip':
        if (!param) {
          error('Debe especificar una IP: --ip <direccion>');
          process.exit(1);
        }
        await clearIp(param, token);
        break;
      case '--status':
        await showStatus(token);
        break;
      case '--guardian':
        await listGuardianProfiles(token);
        break;
      case '--help':
        // Already shown above
        break;
      default:
        error(`Acción desconocida: ${action}`);
        process.exit(1);
    }
  } catch (err) {
    error(err.message || String(err));
    process.exit(1);
  }
}

main();
