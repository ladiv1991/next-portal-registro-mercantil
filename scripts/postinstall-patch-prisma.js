// Postinstall patch: ensure Prisma runtime accepts `postgresql://` URLs on Windows/Turbopack.
// Without this, Turbopack rejects `postgresql://` (expects `postgres://` only).
// This patch is applied to node_modules and will be lost on reinstall — run automatically here.
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../node_modules/@prisma/client/runtime/library.js');

if (!fs.existsSync(filePath)) {
  console.log('Prisma runtime not found, skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(filePath, 'utf8');

// Check if already patched: both postgresql: and postgres: accepted
if (content.includes('o==="postgresql:"||o==="postgres:"')) {
  console.log('Prisma patch already applied.');
  process.exit(0);
}

// Apply patch: add postgresql: to the isDirectDb check
const patched = content.replace(
  'const isDirectDb=o==="postgres:";',
  'const isDirectDb=o==="postgresql:"||o==="postgres:";'
);

if (patched === content) {
  console.log('Prisma patch pattern not found — may already be fixed in this version.');
  process.exit(0);
}

fs.writeFileSync(filePath, patched);
console.log('Prisma patch applied: postgresql:// now accepted alongside postgres://');
