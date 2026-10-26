// CSRF Origin guards verification tests
const BASE = 'http://localhost:3008';

async function post(url, body, headers = {}) {
  const res = await fetch(`${BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': BASE, ...headers },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function put(url, body, headers = {}) {
  const res = await fetch(`${BASE}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Origin': BASE, ...headers },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function del(url, headers = {}) {
  const res = await fetch(`${BASE}${url}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'Origin': BASE, ...headers },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const tests = [];

async function runTest(name, fn) {
  try {
    const result = await fn();
    const pass = result.pass;
    console.log(`${pass ? '✅' : '❌'} ${name}`);
    if (!pass) console.log('   →', result.detail);
    tests.push({ name, pass, detail: result.detail });
  } catch (e) {
    console.log(`❌ ${name} (threw: ${e.message})`);
    tests.push({ name, pass: false, detail: e.message });
  }
}

async function main() {
  console.log('\n=== CSRF ORIGIN GUARDS TESTS ===\n');

  // First, get a valid auth token for CMS endpoints
  let authCookie = '';
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': BASE },
    body: JSON.stringify({ email: 'admin@registromercantil.cu', password: 'Admin2026!' }),
    credentials: 'include',
  });
  const cookieHeader = loginRes.headers.get('set-cookie');
  if (cookieHeader) {
    authCookie = cookieHeader.split(';')[0];
  }
  console.log(`Auth cookie: ${authCookie ? 'OK' : 'FAILED'}\n`);

  const authHeaders = authCookie ? { Cookie: authCookie } : {};

  // Test 1: /api/auth/login with Origin -> 200
  await runTest('POST /api/auth/login with Origin -> 200', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': BASE },
      body: JSON.stringify({ email: 'admin@registromercantil.cu', password: 'Admin2026!' }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 200 && data.success === true;
    return { pass, detail: pass ? '' : `status=${res.status}, data=${JSON.stringify(data)}` };
  });

  // Test 2: /api/auth/login without Origin -> 401 (no origin guard on login)
  await runTest('POST /api/auth/login without Origin -> 401', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // NO Origin
      body: JSON.stringify({ email: 'admin@registromercantil.cu', password: 'Admin2026!' }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 401; // auth required (no session set)
    return { pass, detail: pass ? '' : `status=${res.status}, data=${JSON.stringify(data)}` };
  });

  // Test 3: /api/auth/logout with Origin -> 200
  await runTest('POST /api/auth/logout with Origin -> 200', async () => {
    const { status, data } = await post('/api/auth/logout', {}, authHeaders);
    const pass = status === 200 && data.success === true;
    return { pass, detail: pass ? '' : `status=${status}, data=${JSON.stringify(data)}` };
  });

  // Test 4: /api/auth/logout without Origin -> 403 (origin check runs first)
  await runTest('POST /api/auth/logout without Origin -> 403', async () => {
    const res = await fetch(`${BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // NO Origin
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 403 && data.success === false && data.error === 'Origen no permitido';
    return { pass, detail: pass ? '' : `status=${res.status}, data=${JSON.stringify(data)}` };
  });

  // Test 5: /api/blocks (POST) with Origin -> requires auth (401 expected without auth)
  await runTest('POST /api/blocks with Origin -> 401 (no auth)', async () => {
    const { status, data } = await post('/api/blocks', { title: 'Test', slug: 'test', order: 1 });
    const pass = status === 401; // auth required after origin check passes
    return { pass, detail: pass ? '' : `status=${status}, data=${JSON.stringify(data)}` };
  });

  // Test 6: /api/blocks (POST) without Origin -> 403
  await runTest('POST /api/blocks without Origin -> 403', async () => {
    const res = await fetch(`${BASE}/api/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // NO Origin
      body: JSON.stringify({ title: 'Test', slug: 'test', order: 1 }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 403 && data.success === false && data.error === 'Origen no permitido';
    return { pass, detail: pass ? '' : `status=${res.status}, data=${JSON.stringify(data)}` };
  });

  // Test 7: /api/blocks/[id] (PUT) without Origin -> 403
  await runTest('PUT /api/blocks/some-id without Origin -> 403', async () => {
    const res = await fetch(`${BASE}/api/blocks/some-id`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }, // NO Origin
      body: JSON.stringify({ title: 'Updated' }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 403 && data.success === false && data.error === 'Origen no permitido';
    return { pass, detail: pass ? '' : `status=${res.status}, data=${JSON.stringify(data)}` };
  });

  // Test 8: /api/blocks/[id] (DELETE) without Origin -> 403
  await runTest('DELETE /api/blocks/some-id without Origin -> 403', async () => {
    const res = await fetch(`${BASE}/api/blocks/some-id`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }, // NO Origin
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 403 && data.success === false && data.error === 'Origen no permitido';
    return { pass, detail: pass ? '' : `status=${res.status}, data=${JSON.stringify(data)}` };
  });

  // Test 9: /api/cms/services (POST) without Origin -> 403
  await runTest('POST /api/cms/services without Origin -> 403', async () => {
    const res = await fetch(`${BASE}/api/cms/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // NO Origin
      body: JSON.stringify({ title: 'Test', description: 'desc', icon: 'Test', color: '#000', sectionId: 'test', order: 1, visible: true }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 403 && data.success === false && data.error === 'Origen no permitido';
    return { pass, detail: pass ? '' : `status=${res.status}, data=${JSON.stringify(data)}` };
  });

  // Test 10: /api/cms/services (POST) with Origin -> 401 (no auth)
  await runTest('POST /api/cms/services with Origin -> 401 (no auth)', async () => {
    const { status, data } = await post('/api/cms/services', { title: 'Test', description: 'desc', icon: 'Test', color: '#000', sectionId: 'test', order: 1, visible: true });
    const pass = status === 401; // auth required after origin check passes
    return { pass, detail: pass ? '' : `status=${status}, data=${JSON.stringify(data)}` };
  });

  // Test 11: /api/bot-config (POST) without Origin -> 403
  await runTest('POST /api/bot-config without Origin -> 403', async () => {
    const res = await fetch(`${BASE}/api/bot-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // NO Origin
      body: JSON.stringify({ some: 'config' }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 403 && data.success === false && data.error === 'Origen no permitido';
    return { pass, detail: pass ? '' : `status=${res.status}, data=${JSON.stringify(data)}` };
  });

  // Test 12: /api/bot-config (POST) with Origin -> 401 (no auth)
  await runTest('POST /api/bot-config with Origin -> 401 (no auth)', async () => {
    const { status, data } = await post('/api/bot-config', { some: 'config' });
    const pass = status === 401; // auth required after origin check passes
    return { pass, detail: pass ? '' : `status=${status}, data=${JSON.stringify(data)}` };
  });

  // Test 13: /api/upload (POST) without Origin -> 403
  await runTest('POST /api/upload without Origin -> 403', async () => {
    const res = await fetch(`${BASE}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // NO Origin
      body: JSON.stringify({}),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 403 && data.success === false && data.error === 'Origen no permitido';
    return { pass, detail: pass ? '' : `status=${res.status}, data=${JSON.stringify(data)}` };
  });

  // Test 14: /api/public/inquiries without Origin -> 403
  await runTest('POST /api/public/inquiries without Origin -> 403', async () => {
    const res = await fetch(`${BASE}/api/public/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // NO Origin
      body: JSON.stringify({ email: 'test@test.com', subject: 'Test', message: 'Hello world', captchaId: 'x', captchaAnswer: 'y' }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 403 && data.success === false && data.error === 'Origen no permitido';
    return { pass, detail: pass ? '' : `status=${res.status}, data=${JSON.stringify(data)}` };
  });

  // Test 15: /api/chat/rebuild-index without Origin -> 403
  await runTest('POST /api/chat/rebuild-index without Origin -> 403', async () => {
    const res = await fetch(`${BASE}/api/chat/rebuild-index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // NO Origin
      body: JSON.stringify({}),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 403 && data.success === false && data.error === 'Origen no permitido';
    return { pass, detail: pass ? '' : `status=${res.status}, data=${JSON.stringify(data)}` };
  });

  // Test 16: /api/portal/auth/login without Origin -> 401 (no session, auth check first)
  await runTest('POST /api/portal/auth/login without Origin -> 401', async () => {
    const res = await fetch(`${BASE}/api/portal/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // NO Origin
      body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
    });
    const data = await res.json().catch(() => ({}));
    const pass = res.status === 401; // auth required (no portal session)
    return { pass, detail: pass ? '' : `status=${res.status}, data=${JSON.stringify(data)}` };
  });

  console.log('\n=== SUMMARY ===');
  const passed = tests.filter(t => t.pass).length;
  const failed = tests.filter(t => !t.pass).length;
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}`);
  if (failed > 0) {
    console.log('\nFailures:');
    tests.filter(t => !t.pass).forEach(t => console.log(`  - ${t.name}: ${t.detail}`));
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
