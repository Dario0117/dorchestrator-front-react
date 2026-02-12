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

- `/src/components/` — Reusable components organized by domain
  - `/ui/` — Base UI components from shadcn (Button, Input, Card, etc.)
  - `/layout/` — Layout components (sidebar, header, nav)
    - `/data/` — Navigation and layout configuration data
  - `/org/` — Organization-specific components
    - `/forms/` — Form components with hooks and validation
      - `/components/` — Form-specific reusable components (AppFormField, etc.)
      - `/hooks/` — Form-specific custom hooks
      - `/validation/` — Zod validation schemas
    - `/pages/` — Page-level components
  - Root-level: command-menu, confirm-dialog, profile-dropdown, sign-out-dialog, skip-to-main, theme-switch
- `/src/routes/` — File-based routing (TanStack Router)
  - `__root.tsx` — Root layout
  - `(authenticated)/` — Protected routes with route.tsx layout
    - Routes: index, projects, drafts, queued-sessions, devices, api
  - `(unauthenticated)/` — Public routes with route.tsx layout
    - Routes: login, register, reset-password, update-password.$token
- `/src/context/` — React context providers (theme, layout, search, query)
- `/src/stores/` — Zustand stores (authentication)
- `/src/hooks/` — Custom React hooks
- `/src/services/` — API service layers with MSW handlers
- `/src/types/` — Global TypeScript types
  - `api.generated.types.ts` (auto-generated, never edit)
  - `router.types.ts`
- `/src/lib/` — Utility functions (utils, cookies, logger, test utilities)
- `/src/assets/` — Static assets

## Key Patterns

### Authentication

Zustand store (`authentication.store.ts`) + SessionCheckMiddleware in route groups. HTTP middleware in `http-service-setup.ts` handles 401 redirects. Cookie-based sessions.

### Routing

TanStack Router with file-based routing. Route groups use parentheses `(authenticated)` / `(unauthenticated)` without affecting URLs. Each group has a `route.tsx` wrapper for layout and middleware. Dynamic routes use `$param` syntax (e.g., `update-password.$token.tsx`). Router context in `/types/router.types.ts`.

### Forms

TanStack Form + Zod validation. Each form has:
- `*.form.tsx` — Presentation layer
- `use-*-form.ts` — Business logic hook
- `*-form.schema.ts` — Zod schema
- `*.types.ts` — Type definitions
- Custom form system in `app-form.ts` creates TanStack Forms with custom field components

### Context Providers

Four providers, each exporting a custom hook that throws outside the provider:
- `theme.provider.tsx` — Dark/light/system theme (localStorage)
- `layout.provider.tsx` — Sidebar state (cookie persistence)
- `search.provider.tsx` — Global search (Cmd+K) with CommandMenu
- `query.provider.tsx` — TanStack Query wrapper

### State Management

- Zustand with Immer for global state. Pattern: `[name].store.ts` + `.types.ts` + `.test.ts`
- `useState` for component-local state
- URL query parameters for filters/search (shareability over local state)
- TanStack Query for server state

### File Co-location

Related files stay together:
- Types: `[filename].types.ts`
- Tests: `[filename].test.tsx`
- Stories: `[filename].stories.tsx`
- Constants: `[filename].constants.ts` (or global `/constants` if shared across files)
