const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_EMAIL = process.env.CMS_ADMIN_EMAIL || 'admin@registromercantil.cu';
const ADMIN_PASSWORD = process.env.CMS_ADMIN_PASSWORD || 'Admin2026!';

function maskDatabaseUrl(url) {
  if (!url) return 'NOT_SET';
  return url.replace(/:(.*)@/, ':***@');
}

async function main() {
  console.log('=== Auth diagnostics ===');
  if (!DATABASE_URL) {
    console.error('DATABASE_URL must be configured before running auth diagnostics.');
    process.exitCode = 1;
    return;
  }
  console.log(`DATABASE_URL=${maskDatabaseUrl(DATABASE_URL)}`);

  const prisma = new PrismaClient({
    datasources: {
      db: { url: DATABASE_URL },
    },
  });

  try {
    await prisma.$connect();
    console.log('Prisma connected: OK');

    let userCount = 0;
    try {
      userCount = await prisma.user.count();
      console.log(`User count: ${userCount}`);
    } catch (countError) {
      console.log('User table not available yet.');
      console.log(countError.message || countError);
      process.exitCode = 1;
      return;
    }

    const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!admin) {
      console.error(`Admin email not found: ${ADMIN_EMAIL}`);
      process.exitCode = 1;
      return;
    }

    const passwordMatches = await bcrypt.compare(ADMIN_PASSWORD, admin.password);
    console.log(`Admin found: ${admin.email}`);
    console.log(`Admin active: ${admin.active}`);
    console.log(`Admin role: ${admin.role}`);
    console.log(`Password matches: ${passwordMatches ? 'YES' : 'NO'}`);

    if (!admin.active || admin.role !== 'admin' || !passwordMatches) {
      console.error('Admin validation failed.');
      process.exitCode = 1;
      return;
    }

    console.log('CMS admin authentication is ready.');
  } catch (error) {
    console.error('Auth diagnostics failed.');
    console.error(error.message || error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
