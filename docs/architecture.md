# Architecture & Project Structure

## Tech Stack

- React 19 with TypeScript
- TanStack Router — file-based routing with type-safe navigation
- TanStack Query — server state management
- Zustand with Immer — client-side global state
- Tailwind CSS v4 — styling
- Radix UI — accessible UI primitives
- Vite — build tooling
- Vitest — testing
- Storybook — component development
- Biome — linting and formatting

## Project Structure

- `/src/components/` — Organized by domain (e.g., `org/`, `commands/`, `devices/`)
  - `/ui/` — shadcn-managed components only (never put custom components here)
  - `/ds/` — Design system components (see Design System below)
  - `/layout/` — Layout components (sidebar, header, nav) with `/data/` for config
  - `/{domain}/forms/` — Form components following the form pattern (see Forms below)
  - `/{domain}/pages/` — Page-level components (`*.page.tsx`)
  - Root-level shared components (dialogs, dropdowns, menus, etc.)
- `/src/routes/` — File-based routing (TanStack Router)
  - `__root.tsx` — Root layout
  - `(authenticated)/` — Protected routes, nested under `$organizationSlug` for org-scoped pages
  - `(unauthenticated)/` — Public routes (login, register, password flows)
- `/src/context/` — React context providers following `[name].provider.tsx` + `.types.ts` convention
- `/src/hooks/` — Custom React hooks
- `/src/services/` — API service layers with MSW handlers, organized by domain
- `/src/types/` — Global TypeScript types
  - `api.generated.types.ts` (auto-generated, never edit)
  - `router.types.ts`
- `/src/lib/` — Utility functions (utils, cookies, logger, test utilities)
- `/src/assets/` — Static assets

## Design System (`components/ds/`)

### Architecture: Atomic Design

The design system uses [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/) to organize components:

- **`ds/atoms/`** — Smallest, single-purpose components (SecondaryText, SmallText, CodeText, InlineCode, MetadataLabel, TableWrapper, DefinitionList, StatusDot wrappers, Button wrappers)
- **`ds/molecules/`** — Small compositions of atoms (form field groups, card compositions, labeled data pairs, stat displays)
- **`ds/organisms/`** — Larger compositions of molecules/atoms (page headers, data tables with filters, navigation bars)

### Component Placement Rules

| Directory | What goes here | Who manages it |
|-----------|---------------|----------------|
| `components/ui/` | shadcn-installed primitives | shadcn CLI — never manually add/edit |
| `components/ds/` | Design system components (our wrappers + custom primitives) | Us — atomic design structure |
| `components/layout/` | Page layout compositions (sidebar, header, nav) | Us |
| `components/{domain}/` | Domain-specific components (commands/, terminal/, org/) | Us |

### Design System Principles

1. **Black-box components.** DS components expose semantic React props, not `className`. Consumers configure behavior through props (e.g., `centered`, `truncate`, `mono`), and the component maps those to CSS internally. This lets us change the internal implementation without affecting consumers.

2. **shadcn stays untouched.** The `components/ui/` directory is managed by shadcn CLI. When shadcn components need to be constrained or extended, we create a wrapper in `ds/` that imports from `ui/` and exposes a controlled API.

3. **Import boundary.** Pages and domain components import from `@components/ds/`, never directly from `@components/ui/`. Only `ds/` files may import from `ui/`. (Enforcement via lint rule — see story 2-3.)

4. **Layout is the parent's job.** DS components handle presentation (typography, borders, colors). Spacing, positioning, and layout (margin, padding, flex alignment) are handled by the parent component or a layout primitive.

## Key Patterns

### Authentication

better-auth client (`better-auth.client.ts`) + cookie-based sessions. HTTP middleware in `http-service-setup.ts` handles 401 redirects to `/login`. Route groups enforce auth via `route.tsx` wrappers.

### Routing

TanStack Router with file-based routing. Route groups use parentheses `(authenticated)` / `(unauthenticated)` without affecting URLs. Each group has a `route.tsx` wrapper for layout and middleware. Dynamic routes use `$param` syntax (e.g., `update-password.$token.tsx`). Router context in `/types/router.types.ts`.

**Route files must stay lean.** Route files in `/src/routes/` should only contain route configuration: `createFileRoute` call, `validateSearch`, `loader`, `errorComponent` (using `RouteErrorFallback`), and a thin component that wraps a page component in `<Suspense>`. All meaningful logic — data fetching, conditional rendering, state management — must live in a dedicated page component under `/src/components/{domain}/pages/`. Route files should not contain business logic or UI beyond a Suspense fallback skeleton.

### Forms

TanStack Form + Zod validation. Each form has:
- `*.form.tsx` — Presentation layer
- `use-*-form.ts` — Business logic hook
- `*-form.schema.ts` — Zod schema
- `*.types.ts` — Type definitions
- Custom form system in `app-form.ts` creates TanStack Forms with custom field components

### Context Providers

Providers follow the `[name].provider.tsx` + `[name].provider.types.ts` convention, each exporting a custom hook that throws outside the provider. Located in `/src/context/`.

### Data Fetching & Pre-fetching

When a route loader pre-fetches data via `ensureQueryData`, the corresponding page component **must** use `useSuspenseQuery` (not `useQuery`) to read from the cache. This avoids duplicate network requests — the loader fills the cache, and `useSuspenseQuery` reads from it synchronously (or suspends if not ready). Never pair `ensureQueryData` in a loader with `useQuery` in the page component, as `useQuery` will trigger a second fetch.

### State Management

- Zustand with Immer for global state when needed. Pattern: `[name].store.ts` + `.types.ts` + `.test.ts`
- `useState` for component-local state
- URL query parameters for filters/search (shareability over local state)
- TanStack Query for server state

### File Co-location

Related files stay together:
- Types: `[filename].types.ts`
- Tests: `[filename].test.tsx`
- Stories: `[filename].stories.tsx`
- Constants: `[filename].constants.ts` (or global `/constants` if shared across files)
