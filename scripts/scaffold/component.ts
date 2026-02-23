import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ensureDirectoryExists,
  failIfFileExists,
  kebabToPascal,
  parseArgs,
  requireArg,
} from './utils';

const root = resolve(import.meta.dirname, '../..');

const args = parseArgs(process.argv.slice(2));
const name = requireArg(args, 'name');
const domain = requireArg(args, 'domain');
const isPage = args.page === 'true';

const pascal = kebabToPascal(name);

const subdir = isPage ? `${domain}/pages` : domain;
const fileName = isPage ? `${name}.page` : name;
const componentBase = resolve(root, `src/components/${subdir}`);

const componentPath = resolve(componentBase, `${fileName}.tsx`);
const typesPath = resolve(componentBase, `${fileName}.types.ts`);
const testPath = resolve(componentBase, `${fileName}.test.tsx`);
const storiesPath = resolve(componentBase, `${fileName}.stories.tsx`);

const filesToCreate = [componentPath, testPath];
if (!isPage) {
  filesToCreate.push(typesPath, storiesPath);
}

for (const f of filesToCreate) {
  failIfFileExists(f);
}
for (const f of filesToCreate) {
  ensureDirectoryExists(f);
}

const componentImportAlias = `@components/${subdir}/${fileName}`;

// Component file
const componentContent = isPage
  ? `export function ${pascal}Page() {
	return (
		<section className="p-6 md:p-10 space-y-6">
			<h1 className="text-3xl font-bold tracking-tight font-serif">
				${pascal}
			</h1>
		</section>
	);
}
`
  : `import type { ${pascal}Props } from '${componentImportAlias}.types';

export function ${pascal}(props: ${pascal}Props) {
	return <div>{/* TODO */}</div>;
}
`;

// Types file (non-page only)
const typesContent = `export interface ${pascal}Props {
	// TODO: define props
}
`;

// Test file
const componentName = isPage ? `${pascal}Page` : pascal;
const testContent = `import { ${componentName} } from '${componentImportAlias}';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('${componentName}', () => {
	it('should render', () => {
		renderWithProviders(<${componentName} />);
		// TODO: add assertions
	});
});
`;

// Stories file (non-page only)
const storiesContent = `import { ${pascal} } from '${componentImportAlias}';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
	title: 'Components/${pascal}',
	component: ${pascal},
	tags: ['autodocs'],
} satisfies Meta<typeof ${pascal}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		// TODO: add default args
	},
};
`;

writeFileSync(componentPath, componentContent);
writeFileSync(testPath, testContent);

if (!isPage) {
  writeFileSync(typesPath, typesContent);
  writeFileSync(storiesPath, storiesContent);
}

const rel = (p: string) => p.replace(`${root}/`, '');

console.log(`Created: ${rel(componentPath)}`);
if (!isPage) {
  console.log(`Created: ${rel(typesPath)}`);
}
console.log(`Created: ${rel(testPath)}`);
if (!isPage) {
  console.log(`Created: ${rel(storiesPath)}`);
}
