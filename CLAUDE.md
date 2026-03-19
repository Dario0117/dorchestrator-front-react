@AGENTS.md
@docs/architecture.md
@docs/components-and-styling.md
@docs/testing.md
@docs/api-services.md
@docs/typescript-and-imports.md
# Development Commands

All commands are run via [mise](https://mise.jdx.dev/). Always use `mise run <task>` — never run bun/npm/npx commands directly. Never use `mise exec` just to wrap arbitrary commands — only use the mise tasks listed below. If a task doesn't exist, evaluate adding one before resorting to `mise exec`.

## Testing

- `mise run testForAgents` — Run tests (**use this**, skips dependency checks)
- `mise run coverageForAgents` — Test coverage (**use this**, skips dependency checks)
- `mise run test -- path/to/file.test.tsx` — Run a single test file

The "ForAgents" variants skip `checkTs` and `formatAndLint` since agents run these checks separately. Never use `mise run test` or `mise run coverage` without arguments.

## Running the Application

- `mise run devForAgents` — Start dev server (**use this**)

Never use `mise run dev`.

## Code Quality

- `mise run checkTs` — TypeScript type checking (no emit)
- `mise run formatAndLint` — Format + lint with Biome (applies fixes)
- `mise run deadCode` — Find unused files, exports, types, and dependencies (knip)
- `mise run build` — Production build

## Code Generation

- `mise run openApi` — Generate OpenAPI types from the backend API

Always run this before starting work to ensure types are up to date.

## Scaffolding

- `mise run scaffold:service -- --domain <domain> --action <action> --method <get|post|put|delete|patch> --path <apiPath> --operation <operationName>` — Scaffold an API service + MSW handler
- `mise run scaffold:form -- --name <form-name> --domain <domain> --fields <field1:type,field2:type,...>` — Scaffold a form (form, hook, schema, types)
- `mise run scaffold:service-constants -- --service <service-file-path> --param <paramName>` — Scaffold constants derived from a service file
- `mise run scaffold:component -- --name <name> --domain <domain> [--page]` — Scaffold a component (add `--page` for page components)
