const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: 'postgresql://portal_rmc:GWBbKnllcpd1yiIep9zP0Fgw@127.0.0.1:5433/registro_mercantil' } } });
db.$connect()
  .then(() => db.user.findMany({ take: 2 }))
  .then(r => { console.log(JSON.stringify(r)); db.$disconnect(); })
  .catch(e => { console.error('ERR:', e.message); process.exit(1); });
