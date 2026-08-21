const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        result[key] = next;
        i += 1;
      } else {
        result[key] = true;
      }
    }
  }
  return result;
}

function upsertEnvValue(filePath, key, value) {
  let lines = [];
  let found = false;

  if (fs.existsSync(filePath)) {
    lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (line.startsWith(`${key}=`)) {
        lines[i] = `${key}=${value}`;
        found = true;
      }
    }
  }

  if (!found) {
    lines.push(`${key}=${value}`);
  }

  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const hosts = (args.domains || args.d || 'localhost,127.0.0.1').split(',').map((item) => item.trim()).filter(Boolean);
  const port = args.port || args.p || process.env.PORT || '3000';
  const host = args.host || process.env.APP_HOST || '0.0.0.0';
  const appUrl = args.publicUrl || args.url || `http://${hosts[0]}:${port}`;

  const envPath = path.resolve(process.cwd(), '.env.local');
  upsertEnvValue(envPath, 'APP_HOST', host);
  upsertEnvValue(envPath, 'APP_PORT', String(port));
  upsertEnvValue(envPath, 'ALLOWED_HOSTS', hosts.join(','));
  upsertEnvValue(envPath, 'NEXT_PUBLIC_APP_URL', appUrl);
  upsertEnvValue(envPath, 'NEXTAUTH_URL', appUrl);

  console.log('App domain configuration saved to .env.local');
  console.log(`Hosts: ${hosts.join(', ')}`);
  console.log(`Port: ${port}`);
  console.log(`Public URL: ${appUrl}`);
  console.log('Usage example:');
  console.log(`APP_HOST=${host} APP_PORT=${port} ALLOWED_HOSTS=${hosts.join(',')} next start`);
}

main();
