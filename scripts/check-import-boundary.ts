/**
 * Enforces the design system import boundary:
 * Only files inside src/components/ds/ may import from @components/ui/.
 * All other files must import from @components/ds/ instead.
 *
 * Usage: bun scripts/check-import-boundary.ts
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'src');
const DS_DIR = join(SRC, 'components', 'ds');
const UI_DIR = join(SRC, 'components', 'ui');

const UI_IMPORT_PATTERN = /from\s+['"]@components\/ui\//;

function getFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];

  function walk(current: string) {
    for (const entry of readdirSync(current)) {
      const fullPath = join(current, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (
          entry === 'node_modules' ||
          entry === 'dist' ||
          entry === 'coverage'
        ) {
          continue;
        }
        walk(fullPath);
      } else if (extensions.some((ext) => entry.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

function isInsideDs(filePath: string): boolean {
  return filePath.startsWith(`${DS_DIR}/`);
}

function isInsideUi(filePath: string): boolean {
  return filePath.startsWith(`${UI_DIR}/`);
}

const files = getFiles(SRC, ['.ts', '.tsx']);
const violations: { file: string; line: number; content: string }[] = [];

for (const file of files) {
  if (isInsideDs(file) || isInsideUi(file)) {
    continue;
  }

  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (UI_IMPORT_PATTERN.test(lines[i])) {
      violations.push({
        file: relative(ROOT, file),
        line: i + 1,
        content: lines[i].trim(),
      });
    }
  }
}

if (violations.length > 0) {
  console.log(
    `\n❌ Import boundary violations: ${violations.length} file(s) import directly from @components/ui/\n`,
  );
  console.log(
    '   Only src/components/ds/ files may import from @components/ui/.',
  );
  console.log('   Import from @components/ds/ instead.\n');

  for (const v of violations) {
    console.log(`  ${v.file}:${v.line}`);
    console.log(`    ${v.content}\n`);
  }

  process.exit(1);
} else {
  console.log(
    '✅ Import boundary check passed — no direct @components/ui/ imports outside ds/',
  );
}
