#!/usr/bin/env node
/**
 * Apply CSRF Origin guard to all mutating Route Handlers in src/app/api/.
 *
 * Strategy:
 *   1. Add `import { checkOrigin } from '@/lib/origin-check';` if missing.
 *   2. Insert `if (!checkOrigin(request)) return NextResponse.json(...)` right
 *      after the opening `try {` in every POST/PUT/DELETE/PATCH handler.
 *   3. Skip handlers that already contain checkOrigin.
 *   4. Skip GET handlers (read-only, no CSRF risk).
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..', 'src', 'app', 'api');
const IMPORT_LINE = "import { checkOrigin } from '@/lib/origin-check';";
const CSRF_BLOCK =
  "    if (!checkOrigin(request)) {\n" +
  "      return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });\n" +
  "    }\n";

function findRouteFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findRouteFiles(full));
    } else if (entry.name === 'route.ts') {
      files.push(full);
    }
  }
  return files;
}

function getHandlerMethods(content) {
  const methods = [];
  const re = /export\s+async\s+function\s+(POST|PUT|DELETE|PATCH)\s*\(/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    methods.push({ method: m[1], start: m.index });
  }
  return methods;
}

function addImport(content) {
  if (content.includes(IMPORT_LINE)) return content;
  const lines = content.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImport = i;
  }
  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, IMPORT_LINE);
  } else {
    lines.unshift(IMPORT_LINE);
  }
  return lines.join('\n');
}

function addCsrfAfterTry(content) {
  const methods = getHandlerMethods(content);
  if (methods.length === 0) return content;

  // Process from end to start so offsets stay valid
  for (let i = methods.length - 1; i >= 0; i--) {
    const { start } = methods[i];
    const tryMatch = /\btry\s*\{/.exec(content.slice(start));
    if (!tryMatch) continue;

    const tryPos = start + tryMatch.index;
    const segment = content.slice(start, tryPos);
    if (segment.includes('checkOrigin')) continue;

    const bracePos = tryPos + tryMatch[0].length - 1; // position of `{`
    content = content.slice(0, bracePos + 1) + '\n' + CSRF_BLOCK + content.slice(bracePos + 1);
  }
  return content;
}

function main() {
  const files = findRouteFiles(API_DIR);
  const changed = [];
  const skipped = [];
  const errors = [];

  for (const f of files) {
    try {
      let content = fs.readFileSync(f, 'utf-8');
      const methods = getHandlerMethods(content);
      if (methods.length === 0) continue;
      if (content.includes('checkOrigin')) {
        skipped.push(f);
        continue;
      }

      const original = content;
      content = addImport(content);
      content = addCsrfAfterTry(content);

      if (content !== original) {
        fs.writeFileSync(f, content, 'utf-8');
        changed.push(f);
      }
    } catch (e) {
      errors.push(`${f}: ${e.message}`);
    }
  }

  console.log(`Changed: ${changed.length}`);
  changed.forEach(f => console.log(`  + ${f}`));
  console.log(`Skipped (already protected): ${skipped.length}`);
  skipped.forEach(f => console.log(`  - ${f}`));
  if (errors.length) {
    console.log(`Errors: ${errors.length}`);
    errors.forEach(e => console.log(`  ! ${e}`));
  }
}

main();