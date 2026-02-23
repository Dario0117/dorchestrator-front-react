import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ensureDirectoryExists,
  failIfFileExists,
  kebabToCamel,
  kebabToPascal,
  parseArgs,
  requireArg,
} from './utils';

const root = resolve(import.meta.dirname, '../..');

const args = parseArgs(process.argv.slice(2));
const domain = requireArg(args, 'domain');
const action = requireArg(args, 'action');
const method = requireArg(args, 'method').toLowerCase();
const apiPath = requireArg(args, 'path');
const operation = requireArg(args, 'operation');

if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
  // biome-ignore lint/suspicious/noConsole: CLI script
  console.error('--method must be one of: get, post, put, delete, patch');
  process.exit(1);
}

const pascal = kebabToPascal(action);
const camel = kebabToCamel(action);
const isGet = method === 'get';
const isDelete = method === 'delete';
const hasBody = !isGet && !isDelete;

const servicePath = resolve(
  root,
  `src/services/${domain}/${action}.http-service.ts`,
);
const handlerPath = resolve(
  root,
  `src/services/${domain}/${action}.http-service.handlers.ts`,
);

failIfFileExists(servicePath);
failIfFileExists(handlerPath);
ensureDirectoryExists(servicePath);

function generateServiceFile() {
  if (isGet) {
    return `import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const use${pascal}QueryOptions = (organizationId: string) =>
	$api.queryOptions('get', '${apiPath}', {
		params: {
			path: {
				organizationId,
			},
		},
	});

export function use${pascal}SuspenseQuery(organizationId: string) {
	return useSuspenseQuery(use${pascal}QueryOptions(organizationId));
}

export type use${pascal}SuspenseQueryReturnType = ReturnType<
	typeof use${pascal}SuspenseQuery
>;
export type use${pascal}SuspenseQueryData =
	use${pascal}SuspenseQueryReturnType['data'];
`;
  }

  return `import { $api } from '@/http-service-setup';

export function use${pascal}Mutation() {
	return $api.useMutation('${method}', '${apiPath}');
}

export type use${pascal}MutationType = ReturnType<typeof use${pascal}Mutation>;
`;
}

function generateHandlerFile() {
  const pathParamsType = `type ${pascal}PathParams =\n\toperations['${operation}']['parameters']['path'];`;

  const successResponseType = `type ${pascal}SuccessResponse =\n\toperations['${operation}']['responses']['200']['content']['application/json'];`;

  const bodyType = hasBody
    ? `type ${pascal}RequestBody =\n\toperations['${operation}']['requestBody']['content']['application/json'];`
    : '';

  const typeBlock = [pathParamsType, bodyType, successResponseType]
    .filter(Boolean)
    .join('\n');

  const genericParams = hasBody
    ? `${pascal}PathParams,\n\t${pascal}RequestBody,\n\t${pascal}SuccessResponse`
    : `${pascal}PathParams,\n\tnever,\n\t${pascal}SuccessResponse`;

  const handlerBody = hasBody
    ? `\tasync ({ request }) => {
		const body = await request.json();
		// TODO: return mock response using body
		return HttpResponse.json({} as ${pascal}SuccessResponse);
	},`
    : `\t() => {
		// TODO: return mock response
		return HttpResponse.json({} as ${pascal}SuccessResponse);
	},`;

  return `import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

${typeBlock}

export const ${camel}Handler = http.${method}<
	${genericParams}
>(buildBackendUrl('${apiPath}'),
${handlerBody}
);
`;
}

function registerInTestUtils() {
  const testUtilsPath = resolve(root, 'src/lib/test.utils.ts');
  let content = readFileSync(testUtilsPath, 'utf-8');

  const importStatement = `import { ${camel}Handler } from '@services/${domain}/${action}.http-service.handlers';`;

  // Find the right position to insert the import (alphabetically by full import path)
  const importLines = content.match(/^import .+ from '@services\/.+';$/gm);
  if (importLines) {
    const importPath = `@services/${domain}/${action}.http-service.handlers`;
    let insertAfter: string | null = null;

    for (const line of importLines) {
      const match = line.match(/from '(.+)'/);
      if (match && match[1] < importPath) {
        insertAfter = line;
      }
    }

    if (insertAfter) {
      content = content.replace(
        insertAfter,
        `${insertAfter}\n${importStatement}`,
      );
    } else {
      // Insert before the first @services import
      content = content.replace(
        importLines[0],
        `${importStatement}\n${importLines[0]}`,
      );
    }
  }

  // Add handler to MSWSuccessHandlers array (before the closing bracket)
  // Detect indentation style from the file (spaces or tabs)
  const lastHandlerMatch = content.match(/([ \t]+\w+Handler),?\n([ \t]+\];)/);
  if (lastHandlerMatch) {
    const indent = lastHandlerMatch[1].match(/^([ \t]+)/)?.[1] ?? '    ';
    content = content.replace(
      lastHandlerMatch[0],
      `${lastHandlerMatch[1]},\n${indent}${camel}Handler,\n${lastHandlerMatch[2]}`,
    );
  }

  writeFileSync(testUtilsPath, content);
}

writeFileSync(servicePath, generateServiceFile());
writeFileSync(handlerPath, generateHandlerFile());
registerInTestUtils();

console.log(`Created: src/services/${domain}/${action}.http-service.ts`);
console.log(
  `Created: src/services/${domain}/${action}.http-service.handlers.ts`,
);
console.log('Updated: src/lib/test.utils.ts');
