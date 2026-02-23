import { writeFileSync } from 'node:fs';
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
const name = requireArg(args, 'name');
const domain = requireArg(args, 'domain');
const fieldsRaw = requireArg(args, 'fields');

const pascal = kebabToPascal(name);
const camel = kebabToCamel(name);

interface FieldDef {
  name: string;
  type: string;
  label: string;
}

function parseFields(raw: string): FieldDef[] {
  return raw.split(',').map((f) => {
    const [fieldName, fieldType = 'string'] = f.trim().split(':');
    const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    return { name: fieldName, type: fieldType, label };
  });
}

function zodForType(field: FieldDef) {
  switch (field.type) {
    case 'email':
      return "z.string().email('Invalid email address')";
    case 'password':
      return `z.string().min(1, '${field.label} is required')`;
    case 'number':
      return 'z.number()';
    case 'boolean':
      return 'z.boolean()';
    default:
      return `z.string().min(1, '${field.label} is required')`;
  }
}

function inputType(type: string) {
  switch (type) {
    case 'email':
      return 'email';
    case 'password':
      return 'password';
    case 'number':
      return 'number';
    default:
      return undefined;
  }
}

const fields = parseFields(fieldsRaw);

const base = resolve(root, `src/components/${domain}/forms`);
const formFile = resolve(base, `${name}.form.tsx`);
const formTypesFile = resolve(base, `${name}.form.types.ts`);
const hookFile = resolve(base, `hooks/use-${name}-form.ts`);
const hookTypesFile = resolve(base, `hooks/use-${name}-form.types.ts`);
const schemaFile = resolve(base, `validation/${name}-form.schema.ts`);

const allFiles = [formFile, formTypesFile, hookFile, hookTypesFile, schemaFile];
for (const f of allFiles) {
  failIfFileExists(f);
}
for (const f of allFiles) {
  ensureDirectoryExists(f);
}

// 1. Schema file
const schemaContent = `import { z } from 'zod/v4';

export const ${camel}FormSchema = z.object({
${fields.map((f) => `\t${f.name}: ${zodForType(f)},`).join('\n')}
});

export type ${pascal}FormData = z.infer<typeof ${camel}FormSchema>;
`;

// 2. Hook types file
const hookTypesContent = `// TODO: import the mutation type from the service file
// import type { use${pascal}MutationType } from '@services/...';

export interface Use${pascal}FormProps {
	// TODO: add mutation and success handler props
	// mutation: use${pascal}MutationType;
	// handleSuccess(data: use${pascal}MutationType['data']): void;
}
`;

// 3. Hook file
const hookContent = `import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { Use${pascal}FormProps } from '@components/${domain}/forms/hooks/use-${name}-form.types';
import { ${camel}FormSchema } from '@components/${domain}/forms/validation/${name}-form.schema';

export function use${pascal}Form(props: Use${pascal}FormProps) {
	const form = useAppForm({
		defaultValues: {
${fields.map((f) => `\t\t\t${f.name}: ${f.type === 'number' ? '0' : f.type === 'boolean' ? 'false' : "''"}`).join(',\n')},
		},
		validators: {
			onBlur: ${camel}FormSchema,
		},
		onSubmit({ value }) {
			// TODO: call mutation with value
		},
	});

	return form;
}

export type ${pascal}FormType = ReturnType<typeof use${pascal}Form>;
`;

// 4. Form types file
const formTypesContent = `// TODO: import the mutation type from the service file
// import type { use${pascal}MutationType } from '@services/...';

export interface ${pascal}FormProps {
	// TODO: add mutation and success handler props
	// mutation: use${pascal}MutationType;
	// handleSuccess(data: use${pascal}MutationType['data']): void;
}
`;

// 5. Form file
const fieldElements = fields.map((f) => {
  const typeAttr = inputType(f.type);
  const typeProp = typeAttr ? `\n\t\t\t\t\t\t\ttype="${typeAttr}"` : '';
  return `\t\t\t\t<form.AppField name="${f.name}">
\t\t\t\t\t{(field) => (
\t\t\t\t\t\t<field.AppFormField
\t\t\t\t\t\t\tlabel="${f.label}"${typeProp}
\t\t\t\t\t\t\tplaceholder="${f.label}"
\t\t\t\t\t\t\trequired
\t\t\t\t\t\t/>
\t\t\t\t\t)}
\t\t\t\t</form.AppField>`;
});

const formContent = `import { use${pascal}Form } from '@components/${domain}/forms/hooks/use-${name}-form';
import type { ${pascal}FormProps } from '@components/${domain}/forms/${name}.form.types';

export function ${pascal}Form(props: ${pascal}FormProps) {
	const form = use${pascal}Form(props);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<div className="flex flex-col gap-6">
${fieldElements.join('\n\n')}

				<div className="flex flex-col gap-3">
					<form.AppForm>
						<form.AppSubscribeSubmitButton label="Submit" />
					</form.AppForm>
				</div>
			</div>

			<form.AppForm>
				<form.AppSubscribeErrorButton />
			</form.AppForm>
		</form>
	);
}
`;

writeFileSync(schemaFile, schemaContent);
writeFileSync(hookTypesFile, hookTypesContent);
writeFileSync(hookFile, hookContent);
writeFileSync(formTypesFile, formTypesContent);
writeFileSync(formFile, formContent);

console.log(`Created: src/components/${domain}/forms/${name}.form.tsx`);
console.log(`Created: src/components/${domain}/forms/${name}.form.types.ts`);
console.log(
  `Created: src/components/${domain}/forms/hooks/use-${name}-form.ts`,
);
console.log(
  `Created: src/components/${domain}/forms/hooks/use-${name}-form.types.ts`,
);
console.log(
  `Created: src/components/${domain}/forms/validation/${name}-form.schema.ts`,
);
