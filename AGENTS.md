# Dorchestrator Frontend

React 19 + TypeScript frontend with TanStack Router, TanStack Query, Zustand, and Tailwind CSS v4.

## Tooling

- **Task runner**: mise (all commands go through `mise run`)
- **Package manager**: Bun (managed by mise). Never use npm/bun directly; use `mise exec -- bunx` instead of `npx`.
- **Linter/Formatter**: Biome

## Commands

| Task | Command |
|---|---|
| Dev server | `mise run devForAgents` |
| TypeScript check | `mise run checkTs` |
| Format + lint (fix) | `mise run formatAndLint` |
| Tests | `mise run testForAgents` |
| Tests (single file) | `mise run test -- path/to/file.test.tsx` |
| Coverage | `mise run coverageForAgents` |
| Generate OpenAPI types | `mise run openApi` |
| Build | `mise run build` |
| Storybook | `mise run storybook` |
| Scaffold service | `mise run scaffold:service -- --domain <domain> --action <action> --method <get\|post\|put\|delete\|patch> --path <apiPath> --operation <operationName>` |
| Scaffold form | `mise run scaffold:form -- --name <form-name> --domain <domain> --fields <field1:type,field2:type,...>` |
| Scaffold constants | `mise run scaffold:service-constants -- --service <service-file-path> --param <paramName>` |
| Scaffold component | `mise run scaffold:component -- --name <name> --domain <domain> [--page]` |

## Workflow

1. Before starting work: run `mise run openApi` to generate latest API types
2. Implement feature/fix
3. Write tests
4. Run quality checks until clean: `mise run formatAndLint && mise run checkTs && mise run testForAgents`

## Strict Rules

### Always

- Ask before installing new dependencies
- Ask before changing project architecture or conventions

### Never

- Add JSDoc/docstrings unless asked
- Commit anything — leave on working directory
- Use TypeScript enums — use `as const` objects or constant variables
- Add explicit return types — always let TypeScript infer them
- Edit auto-generated files: `src/types/api.generated.types.ts`, `src/routeTree.gen.ts`
- Re-export from other files — update the consumer to import from the source directly
- Run biome in unsafe mode
- Create new types to fix TS issues if the type was intentionally deleted
- Mock internal modules or functions in tests — only mock external HTTP requests via MSW
- Hardcode types, unions, or values derived from the backend API — always reference `@/types/api.generated.types` (see [TypeScript & Imports](docs/typescript-and-imports.md#api-derived-types))
- Analyze code from installed dependencies
- When asked to fix or add tests, change the tested code — accommodate tests to match the code
- Define multiple React components in the same file — extract each component into its own file so it can be tested in isolation

## Detailed Conventions

See `docs/` for detailed patterns (also referenced from `.claude/rules/`):

- [Architecture & Project Structure](docs/architecture.md)
- [Components & Styling](docs/components-and-styling.md)
- [Testing](docs/testing.md)
- [API Services & MSW](docs/api-services.md)
- [TypeScript & Imports](docs/typescript-and-imports.md)
- [Storybook](docs/storybook.md)
