# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Prerequisites

- **Bun**: Latest version (works as both runtime and package manager)

## Development Commands

### Core Development

- `bun dev` - Start development server (runs Vite and OpenAPI generation concurrently)
- `bun dev:debug` - Start development server with VSCode debugging support (disables code splitting)
- `bun build` - Build for production (runs TypeScript compilation + Vite build)
- `bun preview` - Preview production build

### Code Quality

- `bun format-and-lint:fix` - Format and lint code (auto-fix issues)
- `bun format-and-lint:check` - Check formatting and linting without fixing
- `bun check-ts` - TypeScript type checking without emitting files
- `bun open-api` - Generate OpenAPI schema for API

### Testing

- `bun run test` - Run tests with Vitest
- `bun run test -- path/to/file.test.tsx` - Run a single test file
- `bun run test:forAgents` - Run tests with sequential execution (single worker, no concurrency) to prevent resource exhaustion when running via Claude Code or other agents
- `bun run coverage` - Run tests with coverage report (outputs to `/coverage`, runs tests once without watch mode)

### Storybook

- `bun storybook` - Start Storybook development server on port 6006
- `bun build-storybook` - Build Storybook for production

## Architecture Overview

This is a React frontend template using modern tooling and patterns:

### Tech Stack

- **React 19** with TypeScript
- **TanStack Router** for file-based routing with type-safe navigation
- **TanStack Query** for server state management
- **Zustand** with Immer for client-side state management
- **Tailwind CSS v4** for styling
- **Radix UI** for accessible UI primitives
- **Vite** for build tooling
- **Vitest** for testing
- **Storybook** for component development
- **Biome** for linting and formatting

### Project Structure

- `/src/components/` - Reusable components organized by domain
  - `/ui/` - Base UI components from shadcn (Button, Input, Card, etc.)
  - `/layout/` - Layout-specific components (sidebar, header, nav)
    - `/data/` - Navigation and layout configuration data
  - `/org/` - Organization-specific components with subfolders:
    - `/forms/` - Form components with hooks and validation
      - `/components/` - Form-specific reusable components (AppFormField, etc.)
      - `/hooks/` - Form-specific custom hooks (use-login-form, etc.)
      - `/validation/` - Zod validation schemas
    - `/pages/` - Page-level components
  - Root-level components: command-menu, confirm-dialog, profile-dropdown, sign-out-dialog, skip-to-main, theme-switch
- `/src/routes/` - File-based routing with TanStack Router
  - `__root.tsx` - Root layout component
  - `(authenticated)/` - Protected routes group with route.tsx layout
    - Routes: index, projects, drafts, queued-sessions, devices, api
  - `(unauthenticated)/` - Public routes group with route.tsx layout
    - Routes: login, register, reset-password, update-password.$token
- `/src/context/` - React context providers (theme, layout, search, query)
- `/src/stores/` - Zustand stores for global state (authentication)
- `/src/hooks/` - Custom React hooks (use-dialog-state, use-mobile)
- `/src/services/` - API service layers with MSW handlers
  - Pattern: `[domain]/[action-description].http-service.ts` + `[domain]/[action-description].http-service.handlers.ts`
- `/src/types/` - Global TypeScript type definitions
  - `api.generated.types.ts` (auto-generated, do not edit)
  - `router.types.ts` (router context types)
- `/src/lib/` - Utility functions (utils, cookies, logger, version, test utilities)
- `/src/assets/` - Static assets (images, icons, etc.)

### Key Patterns

**Authentication**: Uses Zustand store (`authentication.store.ts`) with SessionCheckMiddleware component in route groups. HTTP middleware configured in `http-service-setup.ts` handles 401 redirects. Cookie-based sessions.

**Routing**: TanStack Router with file-based routing. Route groups use parentheses `(authenticated)` and `(unauthenticated)` for organization without affecting URLs. Each group has a `route.tsx` wrapper for layout and middleware. Dynamic routes use `$param` syntax (e.g., `update-password.$token.tsx`). Router context defined in `/types/router.types.ts`.

**Forms**: Sophisticated architecture using TanStack Form with Zod validation. Each form has:
  - Form component (`*.form.tsx`) - Presentation layer
  - Custom hook (`use-*-form.ts`) - Business logic
  - Validation schema (`*-form.schema.ts`) - Zod schemas
  - Type definitions (`*.types.ts`)
  - Custom form system in `app-form.ts` creates TanStack Forms with custom field components

**Context Providers**: Four providers for cross-cutting concerns:
  - `theme.provider.tsx` - Dark/light/system theme with localStorage
  - `layout.provider.tsx` - Sidebar state with cookie persistence
  - `search.provider.tsx` - Global search (Cmd+K) with CommandMenu
  - `query.provider.tsx` - TanStack Query wrapper
  - Each exports a custom hook that throws if used outside provider

**API Services**: One-request-per-file pattern:
  - Service file: `[domain]/[action-description].http-service.ts` exports a single hook, query options (if applicable), and related types
  - Handler file: `[domain]/[action-description].http-service.handlers.ts` contains a single MSW handler for that specific request
  - Type exports: Each hook exports its return type (e.g., `useLoginMutationType`)
  - Example: `users/login.http-service.ts` + `users/login.http-service.handlers.ts` for the login endpoint
  - Central setup: `http-service-setup.ts` configures openapi-fetch client with middleware
  - Handler aggregation: All individual handlers are imported and aggregated in `lib/test.utils.ts` for MSW setup

**Testing**: Vitest with React Testing Library. Test files use `.test.ts` or `.test.tsx` suffix and are co-located with source files. MSW for HTTP mocking. Testing utilities in `/lib/test-wrappers.utils.tsx` provide provider wrappers. Global setup in `testsSetup.ts`. Storybook stories use `.stories.tsx` suffix.

**Styling**: Tailwind CSS v4 with CSS variables for theming. Uses OKLCH color space for light/dark modes. Components use `class-variance-authority` for variant management and `tailwind-merge` for conditional classes via `cn()` utility.

**State Management**: Zustand with Immer middleware for immutable updates. Pattern: `[name].store.ts` + `.types.ts` + `.test.ts`. TanStack Query handles server state with React Query DevTools in development.

**File Co-location**: Related files stay together:
  - Types: `[filename].types.ts` alongside source
  - Tests: `[filename].test.tsx` alongside source
  - Stories: `[filename].stories.tsx` alongside source
  - Constants: `[filename].constants.ts` alongside source (or global `/constants` if shared)

### Alias Configuration

**IMPORTANT: Relative imports are STRICTLY FORBIDDEN. All imports must use path aliases.**

The project uses contextual path aliases for better code organization and shorter import paths:

- `@components/*` → `/src/components/*` - All UI components, layouts, forms, pages
- `@services/*` → `/src/services/*` - HTTP service layers and API handlers
- `@hooks/*` → `/src/hooks/*` - Custom React hooks
- `@lib/*` → `/src/lib/*` - Utility functions and helpers
- `@context/*` → `/src/context/*` - React context providers
- `@stores/*` → `/src/stores/*` - Zustand stores for global state
- `@types/*` → `/src/types/*` - TypeScript type definitions (use `@/types/` to avoid conflicts)
- `@routes/*` → `/src/routes/*` - Route components and configuration
- `@assets/*` → `/src/assets/*` - Static assets (images, icons, etc.)
- `@/*` → `/src/*` - Fallback for root-level files (app.tsx, main.tsx, etc.)

**Import Examples:**
```typescript
// ✅ CORRECT - Using contextual aliases
import { Button } from '@components/ui/button';
import { useLogin } from '@services/users/login.http-service';
import { useMobile } from '@hooks/use-mobile';
import { cn } from '@lib/utils';
import { ThemeProvider } from '@context/theme.provider';
import { useAuthStore } from '@stores/authentication.store';
import App from '@/app';

// ❌ WRONG - Relative imports are not allowed
import { Button } from './ui/button';
import { Button } from '../ui/button';
import { Button } from '../../components/ui/button';
```

**Biome Configuration:**
- Biome is configured to enforce alias-only imports
- Any relative import (`./` or `../`) will cause a linting error
- This ensures consistent import patterns across the codebase

### Development Notes

- Auto-generated files (never edit): `/src/routeTree.gen.ts` (TanStack Router), `/src/types/api.generated.types.ts` (OpenAPI)
- TypeScript strict mode enabled with multiple tsconfig files (app, node, base)
- Biome configured with strict rules including no `console` statements (except `console.log`)
- Vitest globals enabled (describe, test, it, expect, etc. - no imports needed)
- Coverage reports generated to `/coverage` directory with HTML and JSON output
- Testing utilities: `renderWithProviders()` and `createQueryThemeWrapper()` in `/lib/test-wrappers.utils.tsx`
- MSW handlers aggregated in `/lib/test.utils.ts` for centralized test setup

###  Development checklist

- Components follow Atomic Design principles
- TypeScript strict mode enabled
- Accessibility WCAG 2.1 AA compliant
- Responsive mobile-first approach
- Use Tailwind's responsive grid system for layout
- Don't write any custom CSS, use Tailwind's utility classes and components
- State management properly implemented: use useState for component state, Zustand only for global state that needs to be shared across components
- Performance optimized (lazy loading, code splitting)
- Cross-browser compatibility verified
- Storybook documentation for each react component, this file must be placed alongside the component file
- When finished with the code, run `bun format-and-lint:fix`, `bun check-ts` and `bun run test` to ensure all tests pass and code is formatted correctly, execute this commands until no errors or issues are found.

### Component requirements

- Only a single component per file
- Component-first thinking - reusable, composable UI pieces
- Naming convention: kebab-case.tsx (e.g., `login-form.tsx`, `command-menu.tsx`)
- Semantic HTML structure
- Proper ARIA attributes when needed
- Keyboard navigation support
- Error boundaries implemented
- Loading and error states handled
- Memoization where appropriate
- Accessible form validation
- Internationalization ready
- Optimistic updates for better UX

### Style methodologies

- Tailwind CSS v4 for utility-first development
- CSS variables for theming (defined in `src/main.css`)
- OKLCH color space for color definitions
- Mobile-first breakpoint strategy
- Fluid typography with clamp()
- Flexible grid systems
- Touch-friendly interfaces
- Viewport meta configuration
- Responsive images with srcset
- Orientation change handling
- Custom variants: `@custom-variant dark` for dark mode

### Mobile-Responsive Patterns

**Touch Target Standards (WCAG 2.5.5 AAA, Apple HIG):**
- **Minimum size:** 44px × 44px for all interactive elements
- **Buttons:** Use `h-11` (44px) for default, `h-12` (48px) for large
- **Icon buttons:** Use `size-11` (44px minimum)
- **Inputs:** Use `h-11` (44px) for proper touch targets
- **Navigation links:** Use `h-11` with padding for tap-friendly areas

**Input Font Size (iOS Auto-Zoom Prevention):**
- **Mobile:** Use `text-base` (16px) to prevent iOS Safari auto-zoom on focus
- **Desktop:** Use `md:text-sm` (14px) for optimized UX
- **Pattern:** `className="text-base md:text-sm"`

**Responsive Layout Patterns:**
```tsx
// Forms - Always single column, responsive spacing
<div className="space-y-4 md:space-y-6">
  <FormField />
</div>

// Grid Layouts - Stack on mobile, multi-column on desktop
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card />
</div>

// Flex Layouts - Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-2">
  <Button className="w-full md:w-auto" />
</div>

// Responsive Padding - Tighter on mobile, spacious on desktop
<section className="p-6 md:p-10">
  {children}
</section>
```

**Breakpoint Strategy (Tailwind v4):**
- **Mobile:** < 768px (base styles, no prefix)
- **Tablet:** `md:` (768px+)
- **Desktop:** `lg:` (1024px+)
- **Large Desktop:** `xl:` (1280px+)

**Sidebar Responsive Behavior:**
- Mobile (< 768px): Hidden by default, opens as Sheet (slide-out drawer)
- Tablet (768px-1024px): Hidden by default, opens as Sheet
- Desktop (1024px+): Visible sidebar with collapse functionality
- Pattern: `hidden md:block` on sidebar, mobile trigger uses `lg:hidden`

**3G Network Optimization:**
- **Code Splitting:** TanStack Router with `autoCodeSplitting: true` (automatic route-based splitting)
- **Loading States:** Use Skeleton components during TanStack Query `isLoading`
- **Lazy Loading:** Components load on-demand with Suspense fallbacks
- **Pattern:**
  ```tsx
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorAlert />;
  return <Content data={data} />;
  ```

**Viewport Testing Utilities:**
- Location: `src/lib/viewport-test-utils.ts`
- Functions: `setMobileViewport()`, `setTabletViewport()`, `setDesktopViewport()`
- Usage in tests:
  ```tsx
  import { setMobileViewport } from '@lib/viewport-test-utils';

  describe('Component - Mobile', () => {
    beforeEach(() => setMobileViewport());

    it('renders mobile layout', () => {
      // Test mobile-specific behavior
    });
  });
  ```

### State management approach

- Zustand for global state
- Local state for component-specific data
- Proper state normalization
- For components like filters or search, prioritize URL query parameters over local state for better UX and shareability

### Testing approach

- Unit tests for all new code
- All test files follow the naming convention of `[file_tested_name].test.ts` or `[file_tested_name].test.tsx` and must be placed alongside the file being tested
- Comprehensive test coverage (>85%) on each component but aim for 100% if possible. To get all untested files, run `bun run coverage` and when it finishes and all tests are passing, run `jq -r 'first(to_entries[] | select(any(.value.s[]; . == 0)) | .value)' coverage/coverage-final.json` to get one file that doesn't have enough coverage and add tests to them. Once that single file is done, run `bun run coverage` again and check if there are any untested files left.
- Don't write end to end tests, only unit and integration tests
- Don't use mocks, stubs, or fakes, always use the real implementation, only mock external http requests using MSW, no component or function should be mocked, only external dependencies and requests.
- Test components in isolation: each component should have its own test file. Focus on testing the component's behavior and user interactions, not implementation details. When testing composed components, verify the overall behavior rather than testing individual child components. For example, on `login.page.tsx`, there's no other logic other than the `LoginForm` component, so it's enough to test the `LoginForm` component in isolation. In this case we still need to create the test file, but add a comment saying that this component is a wrapper and the internal components are tested in isolation. Constantly check if this is still the case and if not, add more tests and remove the comment.
- Use `describe` blocks to group related tests logically
- Prefer `async/await` for handling asynchronous code
- All tests should be deterministic and stable
- Avoid testing implementation details; focus on behavior
- Regularly refactor tests to remove duplication
- Don't test existence of css classes or tailwind directives, only test the behavior of the component on user interactions
- Don't test types
- Don't test zod schemas which are typically located in `**/validation/**` folder
- Don't import things from 'vitest', they are global

### Constants approach

- All constants must be placed on `[file-name].constants.ts` files alongside the file they are used in, if they are being used in multiple files, place them in a separate `*.constants.ts` file placed on a global `constants` folder
- Avoid using magic values, create a constant for it

### Storybook approach

- Storybook is used for component documentation and development
- Storybook should never be used for writing tests, only for component documentation and interactions
- Configuration in `.storybook/` with addons: docs, a11y, themes
- All react components must have a story file except:
  - AuthenticatedLayout
  - AppSidebar
  - NavGroup
  - AppFormField
  - AppSubscribeErrorButton
  - AppSubscribeSubmitButton
  - All `*.page.tsx` files (never create stories for page components)

### Error handling strategy

- Error boundaries at strategic levels
- Graceful degradation for failures
- User-friendly error messages
- Retry mechanisms with backoff
- State recovery mechanisms
- Fallback UI components

### TypeScript approach

- Strongly-typed TypeScript with comprehensive interfaces
- Generic functions and classes with proper constraints
- Types must be placed on `[file-name].types.ts` files alongside the file they are used in, if they are being used in multiple files, place them in a separate `*.types.ts` file placed on a global `types` folder. The only exception for this rule are files that match `[name].http-service.ts` naming pattern, these files are placed on `services` folder.
- Avoid explicitly adding types if they can be inferred from upper levels in the code chain
- Use generics and utility types for maximum type safety
- Service hooks export their return types: `export type useLoginMutationType = ReturnType<typeof useLoginMutation>`
- Zod schemas infer types automatically - don't duplicate type definitions

### API approach

- **One request per file**: Each API endpoint must have its own service file and handler file following the pattern `[domain]/[action-description].http-service.ts` and `[domain]/[action-description].http-service.handlers.ts`
- **Service files**: Located in `src/services/[domain]/[action-description].http-service.ts`, contain:
  - A single hook (mutation or query) using `$api.useMutation()`, `$api.useQuery()`, or TanStack Query hooks directly
  - Query options if it's a query (e.g., `queryOptions` object)
  - All type exports related to that specific request (e.g., `useLoginMutationType`, `useLoginMutationReturnType`)
- **Handler files**: Located in `src/services/[domain]/[action-description].http-service.handlers.ts`, contain:
  - A single MSW handler for that specific endpoint
  - Handler should be exported with a descriptive name (e.g., `loginHandler`, `createOrganizationHandler`)
- **Examples**:
  - `src/services/users/login.http-service.ts` + `src/services/users/login.http-service.handlers.ts`
  - `src/services/organizations/create-organization.http-service.ts` + `src/services/organizations/create-organization.http-service.handlers.ts`
  - `src/services/devices/list-devices.http-service.ts` + `src/services/devices/list-devices.http-service.handlers.ts`
- **Handler aggregation**: All individual handlers must be imported and returned as an array in `src/lib/test.utils.ts` via the `MSWSuccessHandlers()` function
- **Testing**: Only write tests for the http service if it has custom logic outside of invalidating queries. If it only exposes the query and mutation functions, don't write tests for it - create a test file and add a comment saying that no meaningful logic is implemented in the source file, so there's no need to test it.

## STRICT RULES

Follow this conventions always, if for some reason you need to break any of them, ask first.

### ALWAYS DO

- Implement performant code
- Follow security measures following OWASP guidelines
- When finished with the code, run all quality checks to ensure all tests pass and code is formatted correctly, execute these commands until no errors or issues are found
- Follow the project's architecture and conventions, if you need to change something, ask first
- Follow SOLID principles
- Before starting any work, first execute `bun open-api` to generate the latest OpenAPI schema for API

### NEVER DO

- Install any new dependencies, respect the Tech Stack, ask first if you need to add a new library and explain why
- Try to analyze code from the installed dependencies
- Create management commands when adding new functionality, unless you are asked to do so. You can do it on intermediary steps during your development, but remove it afterwards
- Add docstring to the code (JS doc), unless you are asked to do so
- Commit anything, leave everything on the working directory
- When asked to fix or add tests, don't change the tested code, accommodate the tests to comply with the code
- Use enums, they aren't standard, prefer using an object with a string key or a constant variable to define the keys
- Mock internal modules or functions in tests (only mock external 3rd party requests)
- Use any npm command, we use bun. If you need to use `npx` use `bunx`
- Test exceptions unless they have any custom code internally, they are usually just a simple extension of the base exception so we can catch them and handle them in different ways, no need to test a simple wrapper
- Write tests while implementing a feature, write them afterwards, do it on the review step
- Add return types, they must be automatically inferred to avoid any issues on the caller's side
- Delete or update auto generated files (src/types/api.generated.types.ts, src/routes/routeTree.gen.ts)
- Re-export things from another files, refactor the code on the dependant file to use the new location of the thing you want to re-export
- When asked to fix typescript issues, don't create new types even if they were deleted from the code, it was deleted intentionally, only add new interfaces or types to existing ones unless the type is necessary for the code to work
- Run biome on unsafe mode to fix issues
- Create storybook stories for `*.page.tsx` files
- Create wrappers on tests, use the ones already exist in `test-wrappers.utils`, update them if needed
- Write tests for http services `*.http-service.ts`
- Run other command to run tests run the specified one (`bun run test`)
- Introduce new warning/errors when writing tests, fix them immediately
