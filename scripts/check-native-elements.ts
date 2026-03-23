import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'src');
const DS_ATOMS_DIR = join(SRC, 'components', 'ds', 'atoms');
const UI_DIR = join(SRC, 'components', 'ui');

const NATIVE_ELEMENT_RULES: {
  pattern: RegExp;
  element: string;
  replacement: string;
}[] = [
  {
    pattern: /<div\b/,
    element: '<div>',
    replacement: 'Stack, HStack, Center, Grid, Box, or Flex',
  },
  {
    pattern: /<span\b/,
    element: '<span>',
    replacement: 'SmallText, SecondaryText, or CodeText',
  },
  {
    pattern: /<p[\s>]/,
    element: '<p>',
    replacement: 'SecondaryParagraph, SmallParagraph, or PageDescription',
  },
  { pattern: /<h1\b/, element: '<h1>', replacement: 'PageTitle' },
  { pattern: /<h2\b/, element: '<h2>', replacement: 'SectionTitle' },
  { pattern: /<h3\b/, element: '<h3>', replacement: 'SectionTitle' },
  { pattern: /<h4\b/, element: '<h4>', replacement: 'SectionTitle' },
  { pattern: /<h5\b/, element: '<h5>', replacement: 'SectionTitle' },
  { pattern: /<h6\b/, element: '<h6>', replacement: 'SectionTitle' },
  { pattern: /<button\b/, element: '<button>', replacement: 'Button' },
  {
    pattern: /<input\b/,
    element: '<input>',
    replacement: 'Input or HiddenFileInput',
  },
  {
    pattern: /<textarea\b/,
    element: '<textarea>',
    replacement: 'Textarea atom',
  },
  { pattern: /<select\b/, element: '<select>', replacement: 'Select' },
  { pattern: /<label\b/, element: '<label>', replacement: 'Label' },
  {
    pattern: /<form[\s>]/,
    element: '<form>',
    replacement: 'Form atom or form handler',
  },
  { pattern: /<img\b/, element: '<img>', replacement: 'Image' },
  {
    pattern: /<a\b/,
    element: '<a>',
    replacement: 'DownloadLink or router Link',
  },
  {
    pattern: /<code\b/,
    element: '<code>',
    replacement: 'CodeText or InlineCode',
  },
  { pattern: /<pre\b/, element: '<pre>', replacement: 'CodeBlock atom' },
  { pattern: /<ul\b/, element: '<ul>', replacement: 'List atom' },
  { pattern: /<li\b/, element: '<li>', replacement: 'ListItem atom' },
  { pattern: /<ol\b/, element: '<ol>', replacement: 'List atom' },
  {
    pattern: /<dd\b/,
    element: '<dd>',
    replacement: 'DefinitionValue atom',
  },
  {
    pattern: /<output\b/,
    element: '<output>',
    replacement: 'Output atom',
  },
  { pattern: /<nav\b/, element: '<nav>', replacement: 'Nav atom' },
  { pattern: /<main\b/, element: '<main>', replacement: 'Main atom' },
  { pattern: /<aside\b/, element: '<aside>', replacement: 'Aside atom' },
  { pattern: /<header\b/, element: '<header>', replacement: 'Header atom' },
  { pattern: /<footer\b/, element: '<footer>', replacement: 'Footer atom' },
  { pattern: /<table\b/, element: '<table>', replacement: 'Table' },
  { pattern: /<thead\b/, element: '<thead>', replacement: 'TableHeader' },
  { pattern: /<tbody\b/, element: '<tbody>', replacement: 'TableBody' },
  { pattern: /<tr\b/, element: '<tr>', replacement: 'TableRow' },
  { pattern: /<td\b/, element: '<td>', replacement: 'TableCell' },
  { pattern: /<th\b/, element: '<th>', replacement: 'TableHead' },
  {
    pattern: /<section\b/,
    element: '<section>',
    replacement: 'PageSection',
  },
];

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

function isExcluded(filePath: string): boolean {
  if (filePath.startsWith(`${DS_ATOMS_DIR}/`)) {
    return true;
  }
  if (filePath.startsWith(`${UI_DIR}/`)) {
    return true;
  }
  if (filePath.endsWith('.test.tsx') || filePath.endsWith('.test.ts')) {
    return true;
  }
  return false;
}

const files = getFiles(SRC, ['.tsx']);
const violations: {
  file: string;
  line: number;
  element: string;
  replacement: string;
  content: string;
}[] = [];

for (const file of files) {
  if (isExcluded(file)) {
    continue;
  }

  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const relFile = relative(ROOT, file);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const rule of NATIVE_ELEMENT_RULES) {
      if (rule.pattern.test(line)) {
        violations.push({
          file: relFile,
          line: i + 1,
          element: rule.element,
          replacement: rule.replacement,
          content: line.trim(),
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.log(
    `\n❌ Native element violations: ${violations.length} usage(s) of native HTML elements found\n`,
  );
  console.log(
    '   Use design system primitives from @components/ds/atoms/ instead.\n',
  );

  for (const v of violations) {
    console.log(`  ${v.file}:${v.line} — ${v.element} → use ${v.replacement}`);
    console.log(`    ${v.content}\n`);
  }

  process.exit(1);
} else {
  console.log(
    '✅ Native element check passed — no native HTML elements outside ds/atoms/',
  );
}
