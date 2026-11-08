const http = require('http');

async function request(method, url, body = null, headers = {}) {
  const u = new URL(url);
  const opts = {
    hostname: u.hostname,
    port: u.port || 3003,
    path: u.pathname + (u.search || ''),
    method,
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3003',
      ...headers,
    },
  };
  return new Promise((resolve, reject) => {
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers }); }
        catch(e) { resolve({ status: res.statusCode, body: data, headers: res.headers }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('Testing CAPTCHA flow...');
  
  // Step 1: Get fresh captcha
  const capResp = await request('GET', 'http://localhost:3003/api/captcha/new');
  console.log('CAPTCHA response:', capResp.status, capResp.body.success);
  console.log('Captcha ID:', capResp.body.id);
  
  // The actual CAPTCHA answer is generated server-side and stored in memory map
  // We can't extract it from SVG without knowing the generation algorithm
  // For testing, let's just verify the endpoint works
  
  // Step 2: Try login without captcha (should fail validation)
  const loginResp = await request('POST', 'http://localhost:3003/api/auth/login', {
    email: 'admin@registromercantil.cu',
    password: 'Admin2026!',
    captchaId: 'test',
    captchaAnswer: 'test'
  });
  console.log('Login without valid captcha:', loginResp.status, loginResp.body.error);
  
  // Step 3: Test public endpoint
  const publicResp = await request('GET', 'http://localhost:3003/api/public/content');
  console.log('Public content:', publicResp.status, publicResp.body.success);
  
  // Step 4: Test protected endpoint without auth
  const protectedResp = await request('GET', 'http://localhost:3003/api/cms/services');
  console.log('Protected endpoint (no auth):', protectedResp.status, protectedResp.body.error);
  
  // Step 5: Test search
  const searchResp = await request('GET', 'http://localhost:3003/api/search?q=constitucion');
  console.log('Search:', searchResp.status, searchResp.body);
  
  console.log('All tests completed');
}

main().catch(console.error);
