import { writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import {
  ensureDirectoryExists,
  failIfFileExists,
  kebabToPascal,
  kebabToUpperSnake,
  naivePlural,
  parseArgs,
  requireArg,
} from './utils';

const root = resolve(import.meta.dirname, '../..');

const args = parseArgs(process.argv.slice(2));
const servicePath = requireArg(args, 'service');
const param = requireArg(args, 'param');

const fullServicePath = resolve(root, servicePath);
const serviceDir = dirname(fullServicePath);
const serviceBase = basename(fullServicePath, '.ts');
const constantsPath = resolve(serviceDir, `${serviceBase}.constants.ts`);

failIfFileExists(constantsPath);
ensureDirectoryExists(constantsPath);

// Derive names from the service file name
// e.g. list-commands.http-service.ts -> list-commands -> ListCommands
const actionKebab = serviceBase.replace('.http-service', '');
const pascal = kebabToPascal(actionKebab);
const paramPascal = param.charAt(0).toUpperCase() + param.slice(1);
const paramUpperSnakePlural = kebabToUpperSnake(naivePlural(param));

// Build the import alias from the service path
// e.g. src/services/commands/list-commands.http-service.ts -> @services/commands/list-commands.http-service
const serviceImport = servicePath.replace(/^src\//, '@').replace(/\.ts$/, '');

const content = `import type { ${pascal}QueryParams } from '${serviceImport}';

export type ${paramPascal} = NonNullable<${pascal}QueryParams['${param}']>;

// TODO: fill in the actual values from the API
export const ${paramUpperSnakePlural} = [
	// e.g. 'value1', 'value2',
] as const satisfies readonly ${paramPascal}[];
`;

writeFileSync(constantsPath, content);

const relativePath = constantsPath.replace(`${root}/`, '');
console.log(`Created: ${relativePath}`);
