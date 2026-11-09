const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const pages = await prisma.sitePage.findMany();
  console.log('Existing site pages:', pages.map(p => ({id: p.id, title: p.title, slug: p.slug, visible: p.visible})));
}

check().finally(() => prisma.$disconnect());