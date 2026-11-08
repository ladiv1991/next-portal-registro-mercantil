// Pruebas funcionales — Portal Registro Mercantil
const BASE = 'http://localhost:3003';

async function fetchJSON(method, path, options = {}) {
  const res = await fetch(BASE + path, { method, ...options });
  let body;
  try { body = await res.json(); } catch { body = await res.text(); }
  return { status: res.status, headers: Object.fromEntries(res.headers), cookies: res.headers.get('set-cookie'), body };
}

async function getCaptcha() {
  const r = await fetchJSON('GET', '/api/captcha/new');
  const svgStr = typeof r.body?.svg === 'string' ? r.body.svg : '';
  const matches = [...svgStr.matchAll(/<text[^>]*>([^<]+)<\/text>/g)];
  const answer = matches.map(m => m[1]).join('');
  return { id: r.body.id, answer, raw: r.body, svg: svgStr };
}

console.log('=== PRUEBAS FUNCIONALES PORTAL REGISTRO MERCANTIL ===\n');
let results = [];
function ok(label, cond, detail) { const icon = cond ? '✅' : '❌'; results.push({ label, ok: cond, detail }); console.log(`${icon} ${label}${detail ? ' → ' + detail : ''}`); }

try {

  // 1. Health check
  const h = await fetchJSON('GET', '/api/health');
  ok('1. Health check GET /api/health', h.status === 200 && h.body?.status === 'ok', `status=${h.status}`);

  // 2. CAPTCHA generation
  const cap = await getCaptcha();
  ok('2. CAPTCHA generation GET /api/captcha/new', !!cap.id && cap.answer.length >= 5 && cap.raw?.length > 0,
    `id=${cap.id} len=${cap.raw?.length ?? '?'} ans="${cap.answer}" (${cap.answer.length} chars)`);

  // 3. Login exitoso
  const capLogin = await getCaptcha();
  const loginOk = await fetchJSON('POST', '/api/auth/login', {
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3003' },
    body: JSON.stringify({ email: 'admin@registromercantil.cu', password: 'Admin2026!', captchaId: capLogin.id, captchaAnswer: capLogin.answer })
  });
  const isDBError = loginOk.status === 500 && String(loginOk.body?.error).includes('Can\'t reach');
  if (isDBError) {
    ok('3. Login exitoso', false, '⚠️ DB inalcanzable (10.66.0.3:5432) — infra down');
  } else {
    ok('3. Login exitoso', loginOk.status === 200 && loginOk.body?.success === true && (loginOk.cookies || '').includes('rmc-token'),
      `status=${loginOk.status} success=${loginOk.body?.success} cookie=${!!(loginOk.cookies || '').includes('rmc-token')}`);
  }

  // 4. Login sin Origin → 403
  const capNoOrig = await getCaptcha();
  const loginNoOrig = await fetchJSON('POST', '/api/auth/login', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@registromercantil.cu', password: 'Admin2026!', captchaId: capNoOrig.id, captchaAnswer: capNoOrig.answer })
  });
  ok('4. Login sin Origin → 403', loginNoOrig.status === 403, `status=${loginNoOrig.status}`);

  // 5. Login CAPTCHA inválido → 400
  const capBad = await getCaptcha();
  const loginBad = await fetchJSON('POST', '/api/auth/login', {
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3003' },
    body: JSON.stringify({ email: 'admin@registromercantil.cu', password: 'Admin2026!', captchaId: capBad.id, captchaAnswer: 'INVALIDO' })
  });
  ok('5. Login CAPTCHA inválido → 400', loginBad.status === 400, `status=${loginBad.status}`);

  // 6. Búsqueda sin CAPTCHA → 400
  const searchNoCap = await fetchJSON('GET', '/api/search?q=teste');
  ok('6. Búsqueda sin CAPTCHA → 400', searchNoCap.status === 400, `status=${searchNoCap.status}`);

  // 7. Búsqueda con CAPTCHA válido
  const capSearch = await getCaptcha();
  const searchOk = await fetchJSON('GET', `/api/search?q=teste&captchaId=${capSearch.id}&captchaAnswer=${encodeURIComponent(capSearch.answer)}`, {
    headers: { Origin: 'http://localhost:3003' }
  });
  const searchDBErr = searchOk.status === 500 && String(searchOk.body?.error).includes('Can\'t reach');
  if (searchDBErr) {
    ok('7. Búsqueda con CAPTCHA válido', false, '⚠️ DB inalcanzable — infra down');
  } else {
    ok('7. Búsqueda con CAPTCHA válido', searchOk.status === 200 && searchOk.body?.success !== false, `status=${searchOk.status}`);
  }

  // 8. Rate limiting búsqueda — max 3/min por IP (esperar 62s para reset)
  await new Promise(r => setTimeout(r, 62000));
  const capsRL = [];
  for (let i = 0; i < 4; i++) capsRL.push(await getCaptcha());
  const rlStatuses = [];
  for (let i = 0; i < 4; i++) {
    const c = capsRL[i];
    const r = await fetchJSON('GET', `/api/search?q=rtest${i}&captchaId=${c.id}&captchaAnswer=${encodeURIComponent(c.answer)}`, {
      headers: { Origin: 'http://localhost:3003' }
    });
    rlStatuses.push(r.status);
  }
  const isRLAllowed = s => s === 200 || s === 500;
  ok('8a. Rate limit #1 (permitido)', isRLAllowed(rlStatuses[0]), `status=${rlStatuses[0]}`);
  ok('8b. Rate limit #2 (permitido)', isRLAllowed(rlStatuses[1]), `status=${rlStatuses[1]}`);
  ok('8c. Rate limit #3 (permitido)', isRLAllowed(rlStatuses[2]), `status=${rlStatuses[2]}`);
  ok('8d. Rate limit #4 → 429', rlStatuses[3] === 429, `status=${rlStatuses[3]}`);

  // 9. Inquiries público
  const capInq = await getCaptcha();
  const inq = await fetchJSON('POST', '/api/public/inquiries', {
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3003' },
    body: JSON.stringify({ nombre: 'QA Test', email: 'qa@test.com', asunto: 'Prueba funcional', mensaje: 'Mensaje de prueba automatizada con más de diez caracteres para pasar validación', captchaId: capInq.id, captchaAnswer: capInq.answer })
  });
  const inqDBErr = inq.status === 500 && String(inq.body?.error).includes('Error al procesar');
  if (inqDBErr) {
    ok('9. Inquiries público POST /api/public/inquiries', false, '⚠️ DB down — estado técnico');
  } else {
    ok('9. Inquiries público POST /api/public/inquiries', inq.status === 201 && inq.body?.success === true, `status=${inq.status}`);
  }

  // 10. Reset password
  const capReset = await getCaptcha();
  const reset = await fetchJSON('POST', '/api/auth/forgot-password', {
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3003' },
    body: JSON.stringify({ email: 'admin@registromercantil.cu', captchaId: capReset.id, captchaAnswer: capReset.answer })
  });
  const resetDBErr = reset.status === 500 && String(reset.body?.error).includes('Can\'t reach');
  if (resetDBErr) {
    ok('10. Reset password POST /api/auth/forgot-password', false, '⚠️ DB down — estado técnico');
  } else {
    ok('10. Reset password POST /api/auth/forgot-password', reset.status === 200 && reset.body?.success === true, `status=${reset.status}`);
  }

} catch (e) { console.error('FATAL:', e.message); process.exit(1); }

console.log('\n=== RESUMEN ===');
const passed = results.filter(r => r.ok).length;
const failed = results.filter(r => !r.ok).length;
results.forEach(r => console.log(`${r.ok ? '✅' : '❌'} ${r.label} ${r.detail ? '(' + r.detail + ')' : ''}`));
console.log(`\n${passed} passing, ${failed} failing, ${results.length} total`);
process.exit(failed > 0 ? 1 : 0);
