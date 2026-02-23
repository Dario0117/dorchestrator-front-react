import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function kebabToPascal(str: string) {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

export function kebabToCamel(str: string) {
  const pascal = kebabToPascal(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function kebabToUpperSnake(str: string) {
  return str.toUpperCase().replace(/-/g, '_');
}

export function naivePlural(str: string) {
  if (
    str.endsWith('s') ||
    str.endsWith('sh') ||
    str.endsWith('ch') ||
    str.endsWith('x') ||
    str.endsWith('z')
  ) {
    return `${str}es`;
  }
  if (str.endsWith('y') && !/[aeiou]y$/i.test(str)) {
    return `${str.slice(0, -1)}ies`;
  }
  return `${str}s`;
}

export function ensureDirectoryExists(filePath: string) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function failIfFileExists(filePath: string) {
  if (existsSync(filePath)) {
    // biome-ignore lint/suspicious/noConsole: CLI script
    console.error(`File already exists: ${filePath}`);
    process.exit(1);
  }
}

export function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = 'true';
      }
    }
  }
  return args;
}

export function requireArg(args: Record<string, string>, name: string) {
  const value = args[name];
  if (!value) {
    // biome-ignore lint/suspicious/noConsole: CLI script
    console.error(`Missing required argument: --${name}`);
    process.exit(1);
  }
  return value;
}
