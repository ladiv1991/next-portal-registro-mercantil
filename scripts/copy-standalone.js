// Copies static assets into the standalone bundle (cross-platform replacement for `cp -r`).
const fs = require('fs');

fs.cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
fs.cpSync('public', '.next/standalone/public', { recursive: true });
