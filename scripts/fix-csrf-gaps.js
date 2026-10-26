#!/usr/bin/env node
/**
 * Fix remaining handlers that have the checkOrigin import but no actual call.
 * These are:
 *   1. Generic CMS routes (faq, guides, sliders, etc.) that delegate to cms-handler
 *   2. POST handlers with no request param (logout, rebuild-index)
 *
 * Strategy:
 *   - For handlers with `request` param: insert checkOrigin call as first statement
 *   - For handlers with no param: change signature to include request, then insert checkOrigin
 */

const fs = require('fs');
const path = require('path');

const CSRF_BLOCK = (prefix = '    ') =>
  `${prefix}if (!checkOrigin(request)) {\n` +
  `${prefix}  return NextResponse.json({ success: false, error: 'Origen no permitido' }, { status: 403 });\n` +
  `${prefix}}\n`;

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

function hasImport(content) {
  return content.includes("import { checkOrigin } from '@/lib/origin-check';");
}

function getHandlers(content) {
  const handlers = [];
  const re = /export\s+async\s+function\s+(POST|PUT|DELETE|PATCH)\s*\(([^)]*)\)\s*\{/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const method = m[1];
    const params = m[2].trim();
    const hasRequest = /request\s*:\s*NextRequest/.test(params);
    handlers.push({ method, params, hasRequest, start: m.index, fullMatch: m[0] });
  }
  return handlers;
}

function alreadyHasCheckOrigin(handlerSegment) {
  return handlerSegment.includes('checkOrigin(request)');
}

function fixFile(f) {
  let content = fs.readFileSync(f, 'utf-8');
  if (!hasImport(content)) return false;

  const handlers = getHandlers(content);
  if (handlers.length === 0) return false;

  let changed = false;
  // Process from end to start
  for (let i = handlers.length - 1; i >= 0; i--) {
    const h = handlers[i];
    // Find the handler body start (after the opening brace)
    const bracePos = content.indexOf('{', h.start + h.fullMatch.length - 1);
    if (bracePos < 0) continue;

    // Get a generous segment to check for existing checkOrigin
    const segment = content.slice(h.start, bracePos + 2000);
    if (alreadyHasCheckOrigin(segment)) continue;

    if (h.hasRequest) {
      // Insert CSRF block right after the opening brace
      content = content.slice(0, bracePos + 1) + '\n' + CSRF_BLOCK() + content.slice(bracePos + 1);
      changed = true;
    } else {
      // No request param — change signature to include request
      const newSig = `export async function ${h.method}(request: NextRequest) {`;
      const oldSig = h.fullMatch;
      content = content.slice(0, h.start) + newSig + content.slice(h.start + oldSig.length);
      // Now find the brace again (position shifted)
      const newBracePos = content.indexOf('{', h.start + newSig.length - 1);
      content = content.slice(0, newBracePos + 1) + '\n' + CSRF_BLOCK() + content.slice(newBracePos + 1);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(f, content, 'utf-8');
    return true;
  }
  return false;
}

function main() {
  const apiDir = path.join('src', 'app', 'api');
  const files = findRouteFiles(apiDir);
  const fixed = [];
  for (const f of files) {
    if (fixFile(f)) fixed.push(f);
  }
  console.log(`Fixed: ${fixed.length}`);
  fixed.forEach(f => console.log(`  + ${f}`));
}

main();