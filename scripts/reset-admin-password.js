const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL must be configured before resetting the admin password.');
  }
  const email = args.email || process.env.CMS_ADMIN_EMAIL || 'admin@registromercantil.cu';
  const password = args.password || process.env.CMS_ADMIN_PASSWORD || 'Admin2026!';

  const prisma = new PrismaClient({
    datasources: {
      db: { url: DATABASE_URL },
    },
  });

  try {
    const hashed = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashed,
        active: true,
        role: 'admin',
        name: 'Administrador del Sistema',
      },
      create: {
        email,
        password: hashed,
        name: 'Administrador del Sistema',
        role: 'admin',
        active: true,
      },
    });

    console.log(`Admin password updated successfully for ${admin.email}`);
  } catch (error) {
    console.error('Failed to update admin password.');
    console.error(error.message || error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
