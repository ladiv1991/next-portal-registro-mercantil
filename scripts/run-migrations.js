const { spawnSync } = require('child_process');

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function seedDatabase() {
  const hasBun = !!process.env.BUN_INSTALL || (() => {
    try {
      const result = spawnSync('bun', ['--version'], { stdio: 'ignore', shell: false });
      return result.status === 0;
    } catch {
      return false;
    }
  })();

  console.log('=== Seeding database ===');
  if (hasBun) {
    runCommand('bun', ['run', 'prisma/seed.ts']);
    return;
  }

  runCommand(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['tsx', 'prisma/seed.ts']);
}

function main() {
  const args = process.argv.slice(2);
  const shouldSeed = args.includes('--seed');

  console.log('=== Running Prisma migrations ===');
  runCommand(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['prisma', 'db', 'push']);
  runCommand(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['prisma', 'generate']);

  if (shouldSeed) {
    seedDatabase();
  }

  console.log('Database setup completed successfully.');
}

main();
