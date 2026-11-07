// scripts/test-all.mjs
import http from 'http';

const BASE_URL = 'http://localhost:3003';

async function request(path, options = {}) {
  const url = new URL(path, BASE_URL);
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body, json });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    req.end();
  });
}

function parseCaptchaAnswer(svg) {
  const matches = [...svg.matchAll(/>([A-Za-z0-9])<\/text>/g)];
  return matches.map(m => m[1]).join('');
}

async function runTests() {
  console.log('🚀 Running Functional & Security Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name, detail = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.log(`❌ [FAIL] ${name} ${detail}`);
      failed++;
    }
  }

  // 1. Health check
  const health = await request('/api/health');
  assert(health.status === 200 && health.json?.status === 'ok', '1. Health check');

  // 2. CAPTCHA generation
  const captcha = await request('/api/captcha/new');
  assert(captcha.status === 200 && captcha.json?.id && captcha.json?.svg, '2. CAPTCHA generation');

  const captchaId = captcha.json?.id;
  const captchaAnswer = captcha.json?.svg ? parseCaptchaAnswer(captcha.json.svg) : '';

  // 3. Login without Origin
  const loginNoOrigin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'admin@registromercantil.cu', password: 'Admin2026!', captchaId, captchaAnswer }
  });
  assert(loginNoOrigin.status === 403 && loginNoOrigin.json?.error === 'Origen no permitido', '3. Login CSRF block (No Origin -> 403)');

  // 4. Login with invalid CAPTCHA
  const captcha2 = await request('/api/captcha/new');
  const loginBadCaptcha = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3003' },
    body: { email: 'admin@registromercantil.cu', password: 'Admin2026!', captchaId: captcha2.json.id, captchaAnswer: 'WRONG' }
  });
  assert(loginBadCaptcha.status === 400 && loginBadCaptcha.json?.error?.includes('Verificación'), '4. Login with wrong CAPTCHA -> 400');

  // 5. Login successful
  const captcha3 = await request('/api/captcha/new');
  const answer3 = parseCaptchaAnswer(captcha3.json.svg);
  const loginOk = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3003' },
    body: { email: 'admin@registromercantil.cu', password: 'Admin2026!', captchaId: captcha3.json.id, captchaAnswer: answer3 }
  });
  assert(loginOk.status === 200 && loginOk.json?.success === true && loginOk.headers['set-cookie'], '5. Successful login with valid credentials & CAPTCHA');

  // 6. Search without CAPTCHA
  const searchNoCaptcha = await request('/api/search?q=SRL');
  assert(searchNoCaptcha.status === 400 && searchNoCaptcha.json?.error?.includes('requerida'), '6. Search without CAPTCHA -> 400');

  // 7. Search with CAPTCHA
  const captchaSearch = await request('/api/captcha/new');
  const answerSearch = parseCaptchaAnswer(captchaSearch.json.svg);
  const searchOk = await request(`/api/search?q=SRL&captchaId=${captchaSearch.json.id}&captchaAnswer=${answerSearch}`);
  assert(searchOk.status === 200 && searchOk.json?.success === true, '7. Search with valid CAPTCHA -> 200 OK');

  // 8. Search Rate limiting (3/min max)
  let rateLimited = false;
  for (let i = 0; i < 4; i++) {
    const cap = await request('/api/captcha/new');
    const ans = parseCaptchaAnswer(cap.json.svg);
    const res = await request(`/api/search?q=test${i}&captchaId=${cap.json.id}&captchaAnswer=${ans}`);
    if (res.status === 429) {
      rateLimited = true;
      break;
    }
  }
  assert(rateLimited, '8. Search rate limiting (4th search in 60s -> 429 Too Many Requests)');

  // 9. Public Content
  const publicContent = await request('/api/public/content');
  assert(publicContent.status === 200 && publicContent.json?.data?.sliders?.length > 0, '9. Public content endpoint -> 200 with data');

  // 10. Forgot password with CAPTCHA
  const capForgot = await request('/api/captcha/new');
  const ansForgot = parseCaptchaAnswer(capForgot.json.svg);
  const forgotRes = await request('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3003' },
    body: { email: 'admin@registromercantil.cu', captchaId: capForgot.json.id, captchaAnswer: ansForgot }
  });
  assert(forgotRes.status === 200 && forgotRes.json?.success === true, '10. Password reset request with CAPTCHA & MINJUS email template -> 200');

  console.log(`\n📊 SUMMARY: ${passed} Passed, ${failed} Failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
